# Chapter 7: GitOps, Configuration and Secrets
%Promoting changes through environments, keeping config out of images, and handling secrets safely

## 7.1 Push-based CD and GitOps

| Model | How a change reaches the cluster | Strengths | Weaknesses |
|---|---|---|---|
| Push (pipeline deploys) | CI job runs `kubectl apply` or `helm upgrade` with cluster credentials | Simple, one pipeline | CI holds powerful credentials; manual cluster edits go unnoticed |
| GitOps (pull) | An agent in the cluster (Argo CD, Flux) watches a Git repository and reconciles the cluster to it | Git is the audit log; drift is reverted; rollback = `git revert`; no cluster credentials in CI | Two repositories (app and config) and an extra tool to run |

GitOps applies the reconcile loop of Chapter 4 one level up: the desired state is a commit in Git, and the agent continuously makes the cluster match it. A typical flow:

1. A developer merges to the application repository; CI builds and pushes `meter-api:8b77e04`.
2. CI (or a bot) opens a pull request in the **config repository** changing the image tag for staging.
3. Argo CD syncs staging. Automated tests run against it.
4. Promotion to production is another pull request changing the production tag, reviewed and merged.

```python run A GitOps agent reverting a manual hotfix
git_desired = {'meter-api': {'image': 'meter-api:8b77e04', 'replicas': 3}}
cluster = {'meter-api': {'image': 'meter-api:8b77e04', 'replicas': 3}}

def sync():
    changes = []
    for app, want in git_desired.items():
        for key, value in want.items():
            if cluster[app][key] != value:
                changes.append(f'{app}.{key}: {cluster[app][key]} -> {value}')
                cluster[app][key] = value
    return changes or ['in sync']

print('09:00 sync:', sync())
cluster['meter-api']['replicas'] = 6                         # someone runs kubectl scale
print('09:05 sync:', sync())
git_desired['meter-api']['replicas'] = 6   # the change made properly, via a PR
print('09:20 sync:', sync(), '| cluster replicas now', cluster['meter-api']['replicas'])
```

> TIP: With self-healing GitOps, emergency changes made with `kubectl` are undone within minutes. That is the point (the cluster always matches what was reviewed), but it surprises people during incidents. Teams either pause sync for the application during an incident or make the fix through a fast-tracked pull request.

## 7.2 Configuration per environment

The twelve-factor rule: **store configuration in the environment**, not in the image. The same image runs in every environment with different configuration.

| Mechanism | Use |
|---|---|
| Environment variables | Simple settings: `SPRING_PROFILES_ACTIVE=prod`, feature toggles |
| ConfigMap mounted as a file | Larger configuration files; can be updated without rebuilding |
| Helm values files | One chart with `values-staging.yaml` and `values-prod.yaml` |
| Kustomize overlays | A base manifest plus small per-environment patches |

The program shows the Kustomize idea: a base plus an overlay that changes only what differs, merged key by key.

```python run Base plus overlay, the Kustomize way
import yaml, json

def merge(base, patch):
    out = dict(base)
    for k, v in patch.items():
        out[k] = merge(base[k], v) if isinstance(v, dict) and isinstance(base.get(k),
                dict) else v
    return out

base = yaml.safe_load('''
replicas: 2
image: ghcr.io/acme/meter-api:8b77e04
env: {LOG_LEVEL: info, DB_POOL_SIZE: "10"}
resources: {requests: {cpu: 250m, memory: 512Mi}}
''')
overlays = {
    'staging': yaml.safe_load('env: {LOG_LEVEL: debug}'),
    'production': yaml.safe_load('''
replicas: 6
env: {DB_POOL_SIZE: "30"}
resources: {requests: {cpu: "1", memory: 1Gi}}
'''),
}
for name, patch in overlays.items():
    m = merge(base, patch)
    print(f"{name}: replicas {m['replicas']}, image tag {m['image'].split(':')[1]}")
    print(f"  env {json.dumps(m['env'])}")
    print(f"  requests {json.dumps(m['resources']['requests'])}")
```

Only the differences live in the overlays, so a reviewer sees immediately that production differs in replicas, pool size and resources, and that the image is identical everywhere.

## 7.3 Secrets

| Approach | How | Watch out for |
|---|---|---|
| Kubernetes Secret | Base64-encoded object mounted as a file or variable | Base64 is **encoding, not encryption**; enable encryption at rest in etcd and restrict RBAC |
| External secret manager | Vault, AWS Secrets Manager, GCP Secret Manager; synced by External Secrets Operator or a CSI driver | The best default: central rotation and audit |
| Sealed / encrypted secrets in Git | Sealed Secrets or SOPS encrypt with a key only the cluster (or KMS) holds | Rotation still needs a process |
| Workload identity | Pods get short-lived cloud credentials from their service account (IRSA, Workload Identity) | Removes static cloud keys entirely |

```python run Base64 is not protection
import base64
encoded = 'c3VwZXItc2VjcmV0LWRiLXBhc3N3b3Jk'       # as it appears in a Secret manifest
print('decoded by anyone who can read the manifest:', base64.b64decode(encoded).decode())
```

> TRAP: A secret committed to Git is compromised forever, even if the next commit deletes it: it remains in the history, in every clone and in any fork. Rotate it immediately, then clean the history. Scan commits with a secret scanner (gitleaks, GitHub push protection) in CI and in a pre-commit hook. The Security guide covers secret management in depth.

## 7.4 Practical lessons

- GitOps: Git holds the desired state, an in-cluster agent reconciles, and promotion is a pull request.
- Build one image; vary configuration per environment with overlays or values files.
- Kubernetes Secrets are only base64-encoded: use a secret manager, encryption at rest and tight RBAC.
- Prefer short-lived workload identity to long-lived keys; scan every commit for secrets.

# Chapter 8: Monitoring and Alerting in Operations
%Golden signals, burn-rate alerts that page for real problems, on-call, runbooks and postmortems

## 8.1 What to monitor

| Framework | Signals | Best for |
|---|---|---|
| Four golden signals (Google SRE) | Latency, traffic, errors, saturation | Any user-facing service |
| RED | Rate, errors, duration | Request-driven microservices |
| USE | Utilisation, saturation, errors | Resources: CPU, disks, queues, connection pools |

The Senior Engineer handbook explains SLIs, SLOs and error budgets; the Advanced Backend guide covers metrics, logs and traces in the application. This chapter is about turning them into **alerts that people can trust**.

## 8.2 Alert on symptoms, using burn rate

A good alert fires when users are being hurt, and only then. Alerting on causes ("CPU above 80%") pages people for things that harm no one, and misses failures with no matching cause alert. Alerting on the **error budget burn rate** fixes both. With a 99.9% SLO, the error budget is 0.1% of requests; a burn rate of 1 uses exactly the whole budget over the 30-day window, and a burn rate of 14.4 uses 2% of the monthly budget in one hour.

The standard pattern is a **multi-window** alert: page only if the burn rate is high over both a long window (proof it is significant) and a short window (proof it is still happening).

```python run Three alert rules on the same incident timeline
slo_budget = 0.001                                        # 99.9% availability target
minutes = 360
error_rate = [0.0005] * minutes                           # normal: half the budget rate
for m in range(60, 66):
    error_rate[m] = 0.02                                  # a 6-minute blip
for m in range(150, 230):
    error_rate[m] = 0.02                                  # a real 80-minute incident

def burn(m, window):
    lo = max(0, m - window + 1)
    return sum(error_rate[lo:m + 1]) / (m + 1 - lo) / slo_budget

rules = {
    'rate > 1% now': lambda m: error_rate[m] > 0.01,
    'burn > 14.4 (5m)': lambda m: burn(m, 5) > 14.4,
    'burn > 14.4 (60m and 5m)': lambda m: burn(m, 60) > 14.4 and burn(m, 5) > 14.4,
}
for name, rule in rules.items():
    firing = [m for m in range(minutes) if rule(m)]
    pages, prev = [], -2
    for m in firing:
        if m != prev + 1:
            pages.append(m)
        prev = m
    blip = any(60 <= m < 70 for m in pages)
    first_real = next((m for m in pages if m >= 150), None)
    resolved = max(firing) + 1 if firing else None
    print(f'{name:24}: pages {len(pages)}, blip paged {str(blip):5}, '
          f'incident seen at min {first_real}, clears at {resolved}')
```

The naive threshold and the short-window rule both page for the six-minute blip, which is over before anyone can act. The multi-window rule ignores the blip and still catches the real incident, and it clears one minute after recovery because the short window must also stay high.

Its price is visible too: the incident started at minute 150 but was detected only at minute 192. The incident burned budget at 20 times the sustainable rate, only just above the 14.4 threshold, so the 60-minute average needed about 43 bad minutes to cross it. A total outage (burn rate 1000) would cross it within a minute. Real setups therefore combine a fast pair (1 hour and 5 minutes at 14.4) with a slow pair (6 hours and 30 minutes at 6) to catch slower burns.

> TIP: Every page should be **urgent, actionable and user-visible**. Everything else goes to a ticket or a dashboard. A team paged ten times a night for non-issues will eventually sleep through the real one.

## 8.3 On-call, runbooks and incidents

| Practice | What good looks like |
|---|---|
| On-call rotation | Primary and secondary, handover notes, compensated, sustainable (a few pages a week at most) |
| Runbook | Linked from the alert: what it means, how to check impact, safe first actions (roll back, scale, fail over), who to escalate to |
| Incident roles | Incident commander coordinates; separate people fix, communicate and take notes |
| First action | **Mitigate before you diagnose**: roll back the latest deploy, turn off the flag, shift traffic; find the root cause after users are safe |
| Postmortem | Blameless, written within days: timeline, impact, contributing factors, action items with owners and dates |

```python run Where incident time goes
phases = {'detect (alert fires)': 6, 'acknowledge': 4, 'diagnose': 35,
        'mitigate (roll back)': 5}
total = sum(phases.values())
for name, mins in phases.items():
    print(f'{name:22} {mins:3} min  {"#" * mins}')
print(f'time to restore: {total} min; rolling back first would have saved up to '
      f'{phases["diagnose"]} min')
```

## 8.4 Practical lessons

- Monitor golden signals for services and USE for resources.
- Page on SLO burn rate across a long and a short window, not on raw thresholds or causes.
- Every alert links a runbook; mitigate first (roll back), diagnose afterwards.
- Run blameless postmortems with tracked action items.

# Chapter 9: Cloud Fundamentals
%Regions and zones, networking and CIDR, identity and access, storage, compute choices and cost

## 9.1 Regions, zones and availability

A **region** is a geographic area (Mumbai, Frankfurt); an **availability zone (AZ)** is one or more data centres in that region with independent power, cooling and networking, connected to the other zones by low-latency links. Zones fail independently, so spreading replicas across zones turns a data-centre failure into a capacity dip instead of an outage.

```python run Availability of one zone versus several
az = 0.999                                                 # one zone up 99.9% of the time
for zones, need in [(1, 1), (2, 1), (3, 1), (3, 2)]:
    from math import comb
    p = sum(comb(zones, k) * az ** k * (1 - az) ** (zones - k) for k in range(need, zones
            + 1))
    downtime = (1 - p) * 365 * 24 * 60
    print(f'{zones} zones, need {need} up: availability {p:.7f}  '
          f'(about {downtime:8.3f} min down a year)')
```

The model assumes independent failures, which is optimistic: regional control-plane failures, bad deploys and configuration mistakes hit all zones at once. In practice, multi-AZ handles hardware and facility failures; multi-region and careful rollout practice handle the rest.

## 9.2 Networking: VPCs and CIDR

A **virtual private cloud (VPC)** is your private network in a region, defined by a CIDR block such as `10.20.0.0/16`. It is divided into **subnets**, each in one zone. Public subnets route to an internet gateway; private subnets reach the internet only outbound, through a NAT gateway. Databases and application servers belong in private subnets, behind a load balancer in the public ones.

```python run Planning subnets with the ipaddress module
import ipaddress
vpc = ipaddress.ip_network('10.20.0.0/16')
print(f'VPC {vpc}: {vpc.num_addresses} addresses')
subnets = list(vpc.subnets(new_prefix=20))
plan = {'public-a': subnets[0], 'public-b': subnets[1], 'public-c': subnets[2],
        'private-a': subnets[4], 'private-b': subnets[5], 'private-c': subnets[6]}
for name, net in plan.items():
    usable = net.num_addresses - 5   # AWS reserves 5 addresses per subnet
    print(f'{name:10} {str(net):15} usable {usable}')
print('10.20.70.9 is in', next(n for n, net in plan.items()
                               if ipaddress.ip_address('10.20.70.9') in net))
peer = ipaddress.ip_network('10.20.128.0/17')
print('can peer with 10.20.128.0/17?', not vpc.overlaps(peer),
        '(overlapping ranges cannot route)')
```

Leaving gaps (`subnets[3]` unused) allows a fourth zone later. Choosing non-overlapping VPC ranges across the whole company from day one matters: overlapping networks cannot be peered or connected by VPN without painful renumbering.

| Building block | Purpose |
|---|---|
| Security group | Stateful firewall on an instance or pod network interface ("allow 3306 from the app security group") |
| Network ACL | Stateless subnet-level allow/deny rules |
| Load balancer (L4/L7) | Distributes traffic across zones; TLS termination; health checks |
| NAT gateway | Outbound internet for private subnets (and a notable cost line) |
| Private endpoints | Reach cloud services (S3, the registry) without the public internet |

## 9.3 Identity and access management

Every cloud call is authorised by IAM: a **principal** (user, role, service account) is allowed or denied **actions** on **resources**, under optional **conditions**. Explicit deny wins over any allow; anything not allowed is denied.

```python run Evaluating an IAM-style policy
from fnmatch import fnmatch
policy = [
    {'effect': 'Allow', 'action': 's3:GetObject',
            'resource': 'arn:aws:s3:::meter-reports/*'},
    {'effect': 'Allow', 'action': 's3:PutObject',
            'resource': 'arn:aws:s3:::meter-reports/*'},
    {'effect': 'Deny', 'action': 's3:*',
            'resource': 'arn:aws:s3:::meter-reports/finance/*'},
]

def authorise(action, resource):
    matching = [s for s in policy if fnmatch(action, s['action']) and fnmatch(resource,
            s['resource'])]
    if any(s['effect'] == 'Deny' for s in matching):
        return 'DENY (explicit)'
    return 'ALLOW' if matching else 'DENY (implicit)'

for action, res in [('s3:GetObject', 'arn:aws:s3:::meter-reports/2026/09.csv'),
                    ('s3:GetObject', 'arn:aws:s3:::meter-reports/finance/q3.csv'),
                    ('s3:DeleteObject', 'arn:aws:s3:::meter-reports/2026/09.csv'),
                    ('s3:GetObject', 'arn:aws:s3:::payroll/2026.csv')]:
    print(f'{action:16} {res.split(":::")[1]:32} -> {authorise(action, res)}')
```

Principles: least privilege, roles with short-lived credentials instead of long-lived access keys, separate accounts or projects per environment, and multi-factor authentication for humans.

## 9.4 Compute, storage and the shared responsibility model

| Compute option | You manage | Good for |
|---|---|---|
| Virtual machines (EC2, Compute Engine) | OS, runtime, scaling | Full control, legacy software |
| Managed Kubernetes (EKS, GKE, AKS) | Workloads and nodes (control plane is managed) | Many services, platform teams |
| Serverless containers (Cloud Run, Fargate) | Container image only | Stateless HTTP services with variable load |
| Functions (Lambda, Cloud Functions) | Code only | Event handlers, glue, spiky low-volume work |

| Storage | Model | Typical use |
|---|---|---|
| Block (EBS, Persistent Disk) | A disk attached to one machine in one zone | Databases, file systems |
| File (EFS, Filestore) | Shared network file system | Shared content across machines |
| Object (S3, GCS) | Key → object over HTTP, effectively unlimited, very durable | Backups, logs, media, data lakes |

In the **shared responsibility model**, the provider secures the cloud itself (hardware, facilities, the hypervisor, managed control planes) and you secure what you put in it (data, IAM, network rules, patching what you run). The more managed the service, the more the provider covers.

Serverless functions trade control for zero idle cost, with one notable catch: a **cold start** when no warm instance is available.

```python run Cold starts at different traffic levels
import random
rng = random.Random(4)

def cold_start_share(requests_per_hour, idle_timeout_s=600, hours=24):
    t, warm_until, cold, n = 0.0, -1.0, 0, 0
    while t < hours * 3600:
        t += rng.expovariate(requests_per_hour / 3600)
        n += 1
        if t > warm_until:
            cold += 1
        warm_until = t + idle_timeout_s
    return cold / n

for rph in [2, 6, 30, 300]:
    print(f'{rph:4} requests/hour: {cold_start_share(rph):6.1%} of requests hit a cold '
            f'start')
```

The model has one instance kept warm for 10 minutes after each request. A low-traffic endpoint suffers cold starts on most requests, while a busy one almost never does; for latency-critical, low-traffic paths, provisioned concurrency or a small always-on container is the fix.

## 9.5 Cost

```python run What a small production setup costs per month
hourly = {'3 x app VMs (4 vCPU, 16 GB)': 3 * 0.19, 'managed MySQL, multi-AZ': 0.68,
          'load balancer': 0.025, 'NAT gateway (x3, one per zone)': 3 * 0.056}
monthly = {k: v * 730 for k, v in hourly.items()}
monthly['NAT data processing (2 TB)'] = 2048 * 0.056
monthly['S3 storage (500 GB)'] = 500 * 0.023
for k, v in monthly.items():
    print(f'{k:32} ${v:8.2f}')
print(f'{"total":32} ${sum(monthly.values()):8.2f}')
print('one-year commitment at 35% off the VMs saves '
      f'${monthly["3 x app VMs (4 vCPU, 16 GB)"] * 0.35 * 12:,.0f} a year')
```

Prices are illustrative list prices of the kind published for a large region; real prices vary by provider, region and date. The pattern is the useful part: networking (NAT gateways and their data processing) is often a surprisingly large line, and commitments (reserved instances, savings plans) or spot instances cut compute costs for steady and interruptible workloads respectively.

## 9.6 Practical lessons

- Spread replicas across availability zones; use multiple regions for disasters and bad rollouts.
- Plan non-overlapping CIDR ranges early; keep data and services in private subnets.
- IAM: least privilege, roles over keys, explicit deny wins.
- Pick the most managed compute that fits; know the cold-start and cost trade-offs.
