## Part 3 solutions

### O3.1 Percentages in a rolling update

Surge = ⌈0.25 × 10⌉ = 3 and unavailable = ⌊0.25 × 10⌋ = 2, so at most **13 pods** exist and at least **8** serve. Rounding unavailability down guarantees that a small Deployment (say 3 replicas at 25%) never loses a pod during a rollout.

```python run Simulating both rollouts
def rollout(replicas, max_surge, max_unavailable, start_secs=3):
    old, ready, starting, t = replicas, 0, [], 0
    min_serving, max_pods = replicas, replicas
    while ready < replicas:
        starting = [s - 1 for s in starting]
        ready += starting.count(0)
        starting = [s for s in starting if s > 0]
        removable = old + ready - (replicas - max_unavailable)
        old -= max(0, min(old, removable))
        room = replicas + max_surge - (old + ready + len(starting))
        starting += [start_secs] * max(0, min(room, replicas - ready - len(starting)))
        min_serving = min(min_serving, old + ready)
        max_pods = max(max_pods, old + ready + len(starting))
        t += 1
    return t - 1, min_serving, max_pods

for surge, unavail in [(3, 2), (1, 0)]:
    secs, low, high = rollout(10, surge, unavail)
    print(f'maxSurge {surge}, maxUnavailable {unavail}: done after {secs} s, '
          f'serving never below {low}, at most {high} pods')
```

The percentage settings finish several times faster, at the cost of running at 80% capacity for part of the rollout. One at a time keeps full capacity but takes ten start-up cycles; with real start-up times of 30–60 seconds that is many minutes, which is why large Deployments use percentages.

### O3.2 Four HPA decisions

```python run The HPA formula on four inputs
import math

def hpa(replicas, current, target, tolerance=0.10):
    ratio = current / target
    return replicas if abs(ratio - 1) <= tolerance else math.ceil(replicas * ratio)

print('(a)', hpa(4, 90, 60))
print('(b)', hpa(6, 63, 60), '(ratio 1.05 is inside the tolerance band)')
print('(c)', hpa(10, 20, 60))
print('(d)', hpa(1, 1800, 150), '(1,800 rps / 150 rps per pod)')
```

In (c) the HPA recommends 4, but scale-down uses the **highest** recommendation over the last five minutes, so the replicas drop only once every recommendation in that window has been 4 or lower: five minutes after the load fell, not immediately. In (d) a per-pod target on an external metric reduces to total / target per pod, whatever the current replica count.

### O3.3 How long must a canary run?

```python run Sample size for a canary comparison
import math
from scipy.stats import norm
import numpy as np

z_a, z_b = norm.ppf(0.99), norm.ppf(0.80)

def n_per_group(p1, p2):
    return math.ceil((z_a + z_b) ** 2 * (p1 * (1 - p1) + p2 * (1 - p2)) / (p2 - p1) ** 2)

canary_rps = 2000 * 0.05
for p1, p2 in [(0.005, 0.0075), (0.001, 0.0015)]:
    n = n_per_group(p1, p2)
    print(f'{p1:.2%} -> {p2:.2%}: {n:,} requests per group, canary must run '
          f'{n / canary_rps / 60:.1f} min')

rng = np.random.default_rng(11)
n = n_per_group(0.005, 0.0075)
trials = 4000
base = rng.binomial(n, 0.005, trials)
canary = rng.binomial(n, 0.0075, trials)
pooled = (base + canary) / (2 * n)
z = (canary - base) / n / np.sqrt(pooled * (1 - pooled) * 2 / n)
print(f'simulated power at n = {n:,}: {(z > z_a).mean():.1%}')
```

At a 0.5% baseline the canary needs a few minutes; at 0.1% it needs over 15, five times longer for a regression of the same relative size. The simulation confirms the formula: the test catches the regression in about 80% of canaries, as designed. Two practical consequences: canaries for low-traffic services must run for a long time (or take a larger traffic share), and checking results every minute and stopping at the first significant blip inflates false alarms, so decide the duration in advance or use a sequential test designed for repeated looks.

### O3.4 A flag bug

```python run Python's hash() is per process; one hash for every flag correlates rollouts
import subprocess, sys, os, hashlib
code = "print(hash('user-42') % 100)"
for seed in ['1', '2', '3']:
    out = subprocess.run([sys.executable, '-c', code], capture_output=True, text=True,
                         env=dict(os.environ, PYTHONHASHSEED=seed)).stdout.strip()
    print(f'process with PYTHONHASHSEED={seed}: bucket {out}')

users = [f'user-{i}' for i in range(20000)]
naive = lambda flag, u: hash(u) % 100 < 10
a = {u for u in users if naive('new-checkout', u)}
b = {u for u in users if naive('dark-mode', u)}
print(f'naive: overlap between two 10% flags = {len(a & b) / len(a):.0%}')

def bucket(flag, u):
    return int(hashlib.sha256(f'{flag}:{u}'.encode()).hexdigest()[:8], 16) % 100
a = {u for u in users if bucket('new-checkout', u) < 10}
b = {u for u in users if bucket('dark-mode', u) < 10}
print(f'fixed: overlap = {len(a & b) / len(a):.1%}; bucket of user-42 for new-checkout '
      f'is {bucket("new-checkout", "user-42")} in every process')
```

Since Python 3.3, `hash()` of a string is salted with a random value per process (hash randomisation, against hash-flooding attacks), so each server and each restart puts a user in a different bucket: users flicker between the old and new checkout. Fixed seeds are used above only to make the output repeatable. The naive version also ignores the flag, so every 10% experiment hits the same users (100% overlap), which corrupts experiment results and concentrates risk. A stable cryptographic hash of `flag:user` fixes both.

### O3.5 Review this plan

| Plan line | What would happen | Severity |
|---|---|---|
| `aws_db_instance.meter must be replaced` | Renaming the identifier forces **destroy then create**: the production database and its data are deleted and an empty one is created; downtime plus data loss (backups may be deleted too, depending on settings) | Critical |
| `cidr_blocks -> ["0.0.0.0/0"]` | The database port opens to the entire internet | Critical |
| `aws_s3_bucket.audit_logs will be destroyed` | Audit logs deleted, possibly breaking compliance retention | High |
| Summary "2 to destroy" | Does not match "renames and tidies up" | Signal that the change was not understood |

The reviewer should block the pull request and ask for: the rename to be dropped or done without replacement (for a pure rename of the Terraform address, a `moved` block or `terraform state mv`; the cloud identifier itself should simply stay), the CIDR change to be reverted, and the bucket deletion justified separately. Guard rails to add: `deletion_protection = true` and `lifecycle { prevent_destroy = true }` on stateful resources, a policy check (OPA/Conftest, Sentinel) that fails plans opening databases to `0.0.0.0/0` or destroying protected resources, and plan output posted to every pull request.

### O3.6 Promotion with GitOps

| Piece | Design |
|---|---|
| Repositories | `meter-api` (code, Dockerfile, tests) and `platform-config` (Kustomize base plus `dev/`, `staging/`, `prod/` overlays, one directory per environment) |
| CI on merge to `main` | Test, build once, scan, sign, push `meter-api:<sha>`; then a bot commits the new tag to `dev/` (auto-merged) |
| Dev | Argo CD auto-syncs `dev/`; smoke tests run after sync |
| Staging | Promotion bot opens a PR copying the tag from `dev/` to `staging/` once dev checks pass; merging it deploys; integration and load tests run against staging |
| Production | PR copying the tag to `prod/`, requiring approval and a green staging run; Argo Rollouts performs a canary with automated analysis (Chapter 5) |
| Rollback | Revert the tag commit in `prod/` (Argo CD syncs the previous version), or abort the canary, which returns traffic to the stable version automatically |
| Secrets | Never in either repository: External Secrets Operator syncs from a secret manager; pods use workload identity for cloud APIs |
| Drift | Self-heal on; manual `kubectl` edits are reverted and alerted on |

The key property: the same image digest moves through every environment, and the history of `platform-config` is a complete, reviewable log of what ran where and who approved it.

## Part 4 solutions

### O4.1 Burn-rate arithmetic

```python run Budget arithmetic for a 99.9% SLO
slo, days = 0.999, 30
budget = 1 - slo
burn = 0.005 / budget
print(f'(a) burn rate {burn:.0f}: budget gone after {days / burn:.0f} days')
print(f'(b) one hour at 14.4 uses {14.4 / (days * 24):.0%} of the monthly budget')
print(f'(c) at burn 20 the 60-min average crosses 14.4 after {60 * 14.4 / 20:.1f} min')
print(f'(d) at burn {1 / budget:.0f} (total outage) after '
        f'{60 * 14.4 / (1 / budget) * 60:.0f} s')
```

(c) assumes the window was nearly error-free before the incident; it matches the guide's simulation, where an incident at burn 20 was detected after 43 minutes. A total outage has a burn rate of 1/0.001 = 1,000 and trips the alert within a minute.

### O4.2 The slow burn

```python run Two window pairs on a slow burn
minutes = 24 * 60
rate = [0.0005] * minutes
for m in range(360, 360 + 480):
    rate[m] = 0.007                                   # 8 hours at burn rate 7
prefix = [0.0]
for r in rate:
    prefix.append(prefix[-1] + r)

def burn(m, window):
    lo = max(0, m - window + 1)
    return (prefix[m + 1] - prefix[lo]) / (m + 1 - lo) / 0.001

pairs = {'fast (60m & 5m > 14.4)': (60, 5, 14.4), 'slow (360m & 30m > 6)': (360, 30, 6)}
for name, (long_w, short_w, thr) in pairs.items():
    firing = [m for m in range(minutes) if burn(m, long_w) > thr and burn(m, short_w) > thr]
    if firing:
        print(f'{name}: fires at minute {firing[0]} ({firing[0] - 360} min into the burn), '
              f'clears at {firing[-1] + 1}')
    else:
        print(f'{name}: never fires')
print(f'budget used by the burn: {7 * 8 / (30 * 24):.1%} of the month')
```

The fast pair never fires: a burn rate of 7 is below its 14.4 threshold however long it lasts. Only the slow pair catches it, and only after about five hours, because the 6-hour average must climb above 6. By then most of the 7.8% of the monthly budget is spent. That is acceptable: such slow burns are not emergencies, and many teams route the slow pair to a ticket rather than a page. Without it, however, a slow burn like this would go entirely unnoticed until the error budget report at the end of the month.

### O4.3 CIDR questions

```python run Checking with ipaddress
import ipaddress as ip
net16 = ip.ip_network('10.0.0.0/16')
print('(a) /24s in a /16:', len(list(net16.subnets(new_prefix=24))))
print('(b) usable in a /27 on AWS:', ip.ip_network('10.0.0.0/27').num_addresses - 5)
print('(c) overlap:', ip.ip_network('10.0.1.0/24').overlaps(ip.ip_network('10.0.0.0/23')))
prefix = next(p for p in range(32, 0, -1) if 2 ** (32 - p) - 5 >= 500)
print(f'(d) smallest subnet for 500 IPs: /{prefix} ({2 ** (32 - prefix) - 5} usable)')
```

(c) overlaps because 10.0.0.0/23 covers 10.0.0.0–10.0.1.255. For (d), a /24 has only 251 usable addresses on AWS, so a /23 is needed. With VPC-native pod networking (the AWS VPC CNI), every pod consumes a VPC address, which is why EKS clusters exhaust subnets far sooner than VM fleets.

### O4.4 IAM with conditions

```python run Policy evaluation with conditions
from fnmatch import fnmatch
import ipaddress

policy = [
    {'effect': 'Allow', 'action': 's3:GetObject', 'resource': 'meter-reports/*',
     'condition': {'source_ip_in': '10.20.0.0/16'}},
    {'effect': 'Deny', 'action': 's3:*', 'resource': '*',
     'condition': {'secure_transport': False}},
]

def holds(cond, req):
    for key, value in cond.items():
        if key == 'source_ip_in' and ipaddress.ip_address(req['ip']) not in \
                ipaddress.ip_network(value):
            return False
        if key == 'secure_transport' and req['tls'] != value:
            return False
    return True

def authorise(req):
    applicable = [s for s in policy if fnmatch(req['action'], s['action'])
                  and fnmatch(req['resource'], s['resource']) and holds(s.get('condition',
                          {}), req)]
    if any(s['effect'] == 'Deny' for s in applicable):
        return 'DENY (explicit)'
    return 'ALLOW' if applicable else 'DENY (implicit)'

requests = [
    dict(action='s3:GetObject', resource='meter-reports/09.csv', ip='10.20.4.7', tls=True),
    dict(action='s3:GetObject', resource='meter-reports/09.csv', ip='203.0.113.9',
            tls=True),
    dict(action='s3:GetObject', resource='meter-reports/09.csv', ip='10.20.4.7', tls=False),
    dict(action='s3:PutObject', resource='meter-reports/09.csv', ip='10.20.4.7', tls=True),
]
for r in requests:
    print(f"{r['action']:13} from {r['ip']:12} tls={str(r['tls']):5} -> {authorise(r)}")
```

The third request comes from the right network but over plain HTTP, and the explicit deny wins over the allow. The fourth is denied implicitly: nothing allows `PutObject`. Conditions keep policies short while tying access to context (network, TLS, MFA, tags, time).

### O4.5 Surviving a zone failure

| Tier | Single-zone today | Zone-redundant design |
|---|---|---|
| Load balancer | One zone | Cloud load balancer with subnets in three zones; health checks remove dead targets |
| Compute | 3 replicas in one zone | 6 replicas spread with `topologySpreadConstraints` (`maxSkew: 1` over `topology.kubernetes.io/zone`), nodes in three zones, a PodDisruptionBudget |
| Capacity | No spare | Size so that two zones can carry peak: each zone needs 50% of peak, so provision 150% in total (or keep 100% and rely on autoscaling, accepting minutes of degradation) |
| Database | Single instance | Multi-AZ MySQL: synchronous standby in another zone, automatic failover (typically one to two minutes); read replicas in the third zone |
| State elsewhere | Local disks | Object storage (regional by default) for files; caches in every zone or accepted as cold after failover |

During a zone loss users see: requests in flight to the dead zone fail (retries with backoff at the client or mesh mask most), roughly one to two minutes of failed writes during database failover, and normal service afterwards. Test it: cordon and drain one zone's nodes in staging, and fail over the database during a game day.

### O4.6 An incident, minute by minute

| Time | Action | Who |
|---|---|---|
| 14:09 | Acknowledge the page; open an incident channel; declare an incident commander | On-call engineer (becomes IC until relieved) |
| 14:10 | Check the dashboard: 8% errors only on `POST /readings`, started right after 14:02 | IC |
| 14:11 | **Mitigate: roll back** meter-api to the previous version (`kubectl rollout undo`, or revert the GitOps commit); the deploy is the most likely cause and rollback is cheap and safe | Second engineer (operations) |
| 14:12 | Post a status update: impact, mitigation in progress, next update in 15 minutes | Communications lead or IC |
| 14:15 | Confirm recovery on error rate and burn rate; keep watching for ten minutes | IC |
| 14:16–14:24 | Preserve evidence: logs and traces of failing requests, the diff between versions, the deploy record; freeze further deploys | Engineers |
| 14:24 | Resolve or downgrade the incident; schedule the postmortem | IC |

Do not start by debugging the code. "Database looks healthy" plus "deploy seven minutes earlier" points at the change; rolling back first restores users in minutes, and the bad version can be studied safely afterwards.

**Postmortem outline (blameless):** summary and impact (duration, requests failed, users and SLO budget affected); timeline from deploy to resolution; root cause and contributing factors (why tests and the canary did not catch it: was there a canary at all?); what went well (alert in seven minutes, fast rollback); action items with owners and dates (add a test for the failing case, enable canary analysis on `POST /readings` error rate, alert on the error rate per endpoint).
