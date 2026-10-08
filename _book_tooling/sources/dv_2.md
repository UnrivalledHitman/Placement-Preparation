# Chapter 5: Scaling and Release Strategies
%Autoscaling, rolling updates, blue-green, canaries with statistics, and feature flags

## 5.1 Three kinds of autoscaling

| Autoscaler | Scales | Signal |
|---|---|---|
| Horizontal Pod Autoscaler (HPA) | Number of pod replicas | CPU, memory or custom metrics (requests per second, queue depth) |
| Vertical Pod Autoscaler (VPA) | Requests and limits of each pod | Observed usage history |
| Cluster autoscaler / Karpenter | Number of nodes | Pods pending because no node fits; underused nodes |

The HPA formula is simple: **desired = ceil(current replicas × current metric / target metric)**, with a tolerance band (default 10%) to avoid reacting to noise, and a scale-down **stabilisation window** (default five minutes) that uses the highest recommendation in the window, so a brief dip does not remove pods that are needed again a minute later.

```python run An HPA following a traffic spike
import math
target_cpu, per_pod_capacity = 0.60, 100                  # 60% CPU; 100 rps saturates a pod
# rps per minute
traffic = [120, 130, 150, 400, 650, 700, 690, 300, 120, 110, 110, 120, 115, 110]
replicas, history = 2, []
for minute, rps in enumerate(traffic):
    # average utilisation, capped at 100%
    cpu = min(rps / (replicas * per_pod_capacity), 1.0)
    ratio = cpu / target_cpu
    raw = replicas if abs(ratio - 1) <= 0.10 else math.ceil(replicas * ratio)
    history.append(raw)
    window = history[-5:]                                # scale-down stabilisation window
    new = raw if raw >= replicas else min(replicas, max(window))
    print(f'min {minute:2}: {rps:3} rps, {replicas} pods at {cpu:4.0%} CPU -> recommend '
            f'{raw}, '
          f'set {new}')
    replicas = new
```

Two behaviours are visible. Scaling up lags: at minute 3 the utilisation is capped at 100%, so the HPA cannot see how far over capacity the service is and needs three steps (3 → 5 → 9 → 12 pods) to catch up. Scaling down waits for the window: replicas stay at 12 until minute 11, five minutes after the spike, even though two or three pods would do.

> TIP: Because CPU saturates at 100%, it underestimates real overload. For request-serving services, scaling on requests per second (or queue length for workers) reacts in one step, and keeping a minimum replica count above 1 gives headroom while new pods start.

## 5.2 Rolling updates

A Deployment replaces pods gradually. Two settings control the pace: `maxSurge` (how many extra pods may exist above the desired count) and `maxUnavailable` (how many may be missing). Pods of the new version only count as available once their readiness probe passes.

```python run A rolling update of 4 replicas, two settings
def rollout(replicas, max_surge, max_unavailable, start_secs=3):
    old, new_ready, starting, t, log = replicas, 0, [], 0, []
    while new_ready < replicas:
        starting = [s - 1 for s in starting]
        new_ready += sum(1 for s in starting if s == 0)
        starting = [s for s in starting if s > 0]
        removable = old + new_ready - (replicas - max_unavailable)    # keep availability
        old -= max(0, min(old, removable))
        room = replicas + max_surge - (old + new_ready + len(starting))
        starting += [start_secs] * max(0, min(room, replicas - new_ready - len(starting)))
        log.append(f't={t:2}s old {old} new-ready {new_ready} starting {len(starting)} '
                   f'| serving {old + new_ready}')
        t += 1
    return log

for surge, unavail in [(1, 0), (2, 1)]:
    print(f'maxSurge {surge}, maxUnavailable {unavail}:')
    print('\n'.join('  ' + line for line in rollout(4, surge, unavail)))
```

With `maxSurge: 1, maxUnavailable: 0`, capacity never drops below four serving pods, at the price of a slower rollout. Allowing a surge of 2 and one unavailable pod finishes sooner but briefly serves with three. During a rolling update **both versions serve traffic at the same time**, so the new version must be compatible with the old one: database schema changes and API changes must be backward compatible (expand first, contract later; see the Advanced Backend guide on migrations).

## 5.3 Choosing a release strategy

| Strategy | How | Rollback | Cost | Risk exposure |
|---|---|---|---|---|
| Recreate | Stop all old pods, start new ones | Redeploy old | None | Downtime; everyone gets the new version at once |
| Rolling | Replace pods a few at a time | Roll back (another rolling update) | Small surge capacity | Mixed versions during rollout |
| Blue-green | Run full new environment beside the old; switch the router | Instant: switch back | Double capacity during the switch | Everyone switches at once |
| Canary | Send a small percentage of traffic to the new version, compare metrics, increase | Instant: route 0% to canary | Small | Only the canary share sees a bad version |
| Shadow (dark launch) | Copy real traffic to the new version, discard its responses | Nothing to roll back | Double load on the shadow | None for users; side effects must be suppressed |

## 5.4 Canary analysis is a statistics problem

A canary that receives 5% of traffic for ten minutes sees few requests, so a difference in error rate may be noise. Automated canary tools (Argo Rollouts, Flagger, Kayenta) compare canary and baseline with statistical tests rather than eyeballing. A two-proportion z-test asks: if both versions had the same true error rate, how likely is a difference this large?

```python run Is the canary worse, or just unlucky?
import math
from scipy.stats import norm

def compare(base_req, base_err, can_req, can_err):
    p1, p2 = base_err / base_req, can_err / can_req
    pooled = (base_err + can_err) / (base_req + can_req)
    se = math.sqrt(pooled * (1 - pooled) * (1 / base_req + 1 / can_req))
    z = (p2 - p1) / se
    p_value = 1 - norm.cdf(z)                       # one-sided: is the canary worse?
    verdict = 'ROLL BACK' if p_value < 0.01 else 'continue'
    return f'baseline {p1:.2%}, canary {p2:.2%}, z = {z:5.2f}, p = {p_value:.4f} -> {verdict}'

print('10 minutes at 5%:', compare(57000, 114, 3000, 9))
print('60 minutes at 5%:', compare(342000, 684, 18000, 54))
print('10 minutes at 5%:', compare(57000, 114, 3000, 15))
```

The first two lines have the **same** error rates (0.2% versus 0.3%), but ten minutes of canary traffic cannot distinguish them from noise, while an hour can. The third canary is clearly worse even after ten minutes. A canary must run long enough, at enough traffic, to detect the regressions you care about; for rare errors that can mean hours.

## 5.5 Feature flags

Feature flags separate **deploy** (code reaches production) from **release** (users see the feature). Unfinished work merges to trunk behind a flag that is off; the flag is then turned on for employees, then 1%, 10% and 100% of users, and turned off instantly if something breaks, with no deploy.

Percentage rollouts must be **sticky**: the same user must get the same answer on every request and every server. Hashing the user ID together with the flag name gives a stable bucket from 0 to 99 without storing anything.

```python run Sticky percentage rollout by hashing
import hashlib

def bucket(flag, user_id):
    h = hashlib.sha256(f'{flag}:{user_id}'.encode()).hexdigest()
    return int(h[:8], 16) % 100

def enabled(flag, user_id, percent):
    return bucket(flag, user_id) < percent

users = [f'user-{i}' for i in range(100000)]
for pct in [1, 10, 50]:
    on = sum(enabled('new-checkout', u, pct) for u in users)
    print(f'rollout {pct:2}%: {on / len(users):6.2%} of users see the new checkout')
early = {u for u in users if enabled('new-checkout', u, 10)}
later = {u for u in users if enabled('new-checkout', u, 50)}
print('everyone in the 10% group is still in at 50%:', early <= later)
other = {u for u in users if enabled('dark-mode', u, 10)}
print(f'overlap with an unrelated 10% flag: {len(early & other) / len(early):.1%}')
```

The overlap with an unrelated flag is 9.9%, what independent choices predict (10%). Including the flag name in the hash is what makes them independent: without it, the same 10% of users would be the guinea pigs for every experiment.

> TRAP: Every flag is a branch in the code that must be tested in both states and removed after full rollout. Old flags become dead code with surprising interactions. Give each flag an owner and an expiry date.

## 5.6 Practical lessons

- HPA: desired = ceil(replicas × metric / target), with a tolerance band and a scale-down window.
- Rolling updates run two versions at once: keep APIs and schemas backward compatible.
- Use canaries for risky changes and judge them statistically, with enough traffic and time.
- Feature flags separate deploy from release; hash flag + user for sticky rollouts.

# Chapter 6: Infrastructure as Code
%Declaring infrastructure, plan and apply, state, drift, dependency order and safe changes

## 6.1 Why infrastructure as code

Infrastructure created by clicking in a console cannot be reviewed, reproduced or rolled back, and nobody remembers why a setting exists. **Infrastructure as code (IaC)** describes networks, clusters, databases and permissions in versioned files that go through pull requests and pipelines like application code.

| Tool | Style | Notes |
|---|---|---|
| Terraform / OpenTofu | Declarative (HCL), any cloud via providers | Keeps a state file; `plan` then `apply` |
| AWS CloudFormation, Azure Bicep | Declarative, one cloud | State managed by the cloud service |
| Pulumi, AWS CDK | General-purpose languages producing a declarative plan | Loops and types from a real language |
| Ansible, Chef, Puppet | Configuration management of machines | Ansible is push-based and agentless |

A small Terraform configuration:

```text
resource "aws_vpc" "main" {
  cidr_block = "10.20.0.0/16"
}

resource "aws_subnet" "app_a" {
  vpc_id            = aws_vpc.main.id          # reference = dependency
  cidr_block        = "10.20.1.0/24"
  availability_zone = "ap-south-1a"
}

resource "aws_db_instance" "meter" {
  engine            = "mysql"
  instance_class    = "db.t4g.medium"
  allocated_storage = 50
  db_subnet_group_name = aws_db_subnet_group.meter.name
  deletion_protection  = true
}
```

## 6.2 Plan: desired, state and reality

Terraform compares three things: the **configuration** (what you want), the **state file** (what Terraform believes it created, with real IDs) and the **real infrastructure** (refreshed from the cloud API). `terraform plan` shows the difference as create (`+`), update in place (`~`), destroy (`-`) and replace (`-/+`) actions. Some attributes can be changed in place; others (a database's engine, a subnet's CIDR) force the resource to be destroyed and recreated.

```python run A miniature terraform plan
FORCES_REPLACEMENT = {'engine', 'cidr_block', 'availability_zone'}

def plan(config, state):
    actions = []
    for name, want in config.items():
        have = state.get(name)
        if have is None:
            actions.append(f'+ create  {name}')
            continue
        changed = {k for k in want if want[k] != have.get(k)}
        if not changed:
            continue
        if changed & FORCES_REPLACEMENT:
            actions.append(f'-/+ replace {name} (forced by '
                    f'{", ".join(sorted(changed & FORCES_REPLACEMENT))})')
        else:
            detail = ', '.join(f'{k}: {have.get(k)} -> {want[k]}' for k in sorted(changed))
            actions.append(f'~ update  {name} ({detail})')
    actions += [f'- destroy {name}' for name in state if name not in config]
    return actions or ['No changes. Infrastructure matches the configuration.']

state = {
    'aws_vpc.main': {'cidr_block': '10.20.0.0/16'},
    'aws_subnet.app_a': {'cidr_block': '10.20.1.0/24', 'availability_zone': 'ap-south-1a'},
    'aws_db_instance.meter': {'engine': 'mysql', 'instance_class': 'db.t4g.medium',
                              'allocated_storage': 50},
    'aws_instance.old_bastion': {'instance_type': 't3.micro'},
}
config = {
    'aws_vpc.main': {'cidr_block': '10.20.0.0/16'},
    'aws_subnet.app_a': {'cidr_block': '10.20.1.0/24', 'availability_zone': 'ap-south-1a'},
    'aws_subnet.app_b': {'cidr_block': '10.20.2.0/24', 'availability_zone': 'ap-south-1b'},
    'aws_db_instance.meter': {'engine': 'postgres', 'instance_class': 'db.t4g.large',
                              'allocated_storage': 100},
}
print('\n'.join(plan(config, state)))
print('--- after apply, plan again:')
print('\n'.join(plan(config, {k: dict(v) for k, v in config.items()})))
```

The plan is the review artefact: a `-/+ replace` on a database means **data loss** unless it is a deliberate migration. That is why `deletion_protection`, `prevent_destroy` lifecycle rules and a human review of the plan output exist. The second plan shows **idempotency**: applying the same configuration again changes nothing.

> TRAP: Changing `engine` above turns an innocent-looking edit into "destroy the production database and create an empty one". Always read the plan, look for replacements and destroys, and require the plan output (not just the code diff) in the pull request.

## 6.3 Dependency order

References between resources (`vpc_id = aws_vpc.main.id`) form a graph. Terraform creates resources in topological order, in parallel where possible, and destroys them in reverse order.

```python run Create and destroy order from references
from graphlib import TopologicalSorter
deps = {   # resource: resources it references
    'aws_vpc.main': set(),
    'aws_subnet.app_a': {'aws_vpc.main'},
    'aws_subnet.app_b': {'aws_vpc.main'},
    'aws_security_group.db': {'aws_vpc.main'},
    'aws_db_subnet_group.meter': {'aws_subnet.app_a', 'aws_subnet.app_b'},
    'aws_db_instance.meter': {'aws_db_subnet_group.meter', 'aws_security_group.db'},
    'aws_eks_cluster.main': {'aws_subnet.app_a', 'aws_subnet.app_b'},
}
ts = TopologicalSorter(deps); ts.prepare(); wave = 1; order = []
while ts.is_active():
    ready = sorted(ts.get_ready())
    print(f'create wave {wave}: {", ".join(ready)}')
    order += ready; ts.done(*ready); wave += 1
print('destroy order starts with:', ', '.join(reversed(order[-2:])))
```

## 6.4 State and drift

The state file maps configuration names to real IDs. Rules for it in a team:

| Rule | Why |
|---|---|
| Store it remotely (S3 bucket, Terraform Cloud), versioned and encrypted | Laptops get lost; everyone must see the same state |
| Lock it during `plan`/`apply` (DynamoDB lock, built-in locking) | Two concurrent applies corrupt state or fight each other |
| Never commit it to Git | It contains secrets such as generated passwords |
| Split it by environment and component | Smaller blast radius and faster plans |

**Drift** is a difference between real infrastructure and the configuration, usually caused by someone changing things in the console. A scheduled `terraform plan` in CI detects drift; the fix is to apply the code (reverting the manual change) or to update the code to adopt it.

```python run Detecting drift with a refresh
config = {'aws_security_group.db': {'ingress_port': 3306, 'ingress_cidr': '10.20.0.0/16'}}
state = {'aws_security_group.db': {'ingress_port': 3306, 'ingress_cidr': '10.20.0.0/16'}}
# console edit
real = {'aws_security_group.db': {'ingress_port': 3306, 'ingress_cidr': '0.0.0.0/0'}}

for name, want in config.items():
    for key, value in want.items():
        if real[name][key] != state[name][key]:
            print(f'drift in {name}.{key}: state says {state[name][key]}, cloud has '
                    f'{real[name][key]}')
        if real[name][key] != value:
            print(f'plan: ~ update {name} ({key}: {real[name][key]} -> {value})')
```

Here someone opened the database to the whole internet "for a quick test". The scheduled plan finds it, and applying the code closes it again.

## 6.5 Practical lessons

- Infrastructure lives in reviewed, versioned code; nobody clicks in production.
- `plan` compares configuration with refreshed state; read it for replacements and destroys.
- References define a dependency graph: create in topological order, destroy in reverse.
- Keep state remote, locked and encrypted; detect drift with scheduled plans.
