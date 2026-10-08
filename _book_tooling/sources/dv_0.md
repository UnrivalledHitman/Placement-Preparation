# How to use this guide
%What DevOps means in practice, what this book covers, and how its examples were checked

DevOps is the set of practices that gets code from a developer's laptop into production **quickly, safely and repeatedly**: version control, continuous integration, container images, orchestration with Kubernetes, infrastructure as code, progressive delivery, monitoring and cloud fundamentals. Interviewers for SDE roles ask about it because every modern team ships this way: "how does your code reach production?", "what happens during a rolling update?", "why is my pod in CrashLoopBackOff?".

This guide builds on earlier books and does not repeat them: the **Linux** guide covers the shell, processes, namespaces and cgroups (what a container really is); the **Spring Boot** guide shows a Dockerfile and Docker Compose for one app; the **Security** guide covers secrets, TLS and supply-chain scanning; the **Senior Engineer** handbook covers SLOs, error budgets and incident culture. Here the focus is on the **pipelines and platforms** that connect them.

## How the examples were run

Docker, Kubernetes and Terraform need daemons, clusters and cloud accounts, so this book uses two kinds of examples:

- **Configuration files** (Dockerfiles, Kubernetes manifests, pipeline definitions, Terraform) are shown as text. Every YAML file in the book was also **parsed and checked** by a program, so it is at least well formed and has the fields the text claims.
- **The mechanisms behind the tools** (layer caching, the scheduler, the reconcile loop, rolling updates, autoscaling, canary analysis, `terraform plan`) are reproduced in short Python simulations that run here and print real output. If you understand the simulation, the real tool stops being magic. To replay the configuration files, install Docker Desktop and kind (Kubernetes in Docker).

## Map of the guide

| Chapter | Topic | Typical interview question |
|---|---|---|
| 1 | DevOps, flow and DORA metrics | "How would you measure whether your team ships well?" |
| 2 | Version control and continuous integration | "Your CI takes 40 minutes. How do you make it faster?" |
| 3 | Containers and images | "Why did my image rebuild every dependency after a one-line change?" |
| 4 | Kubernetes fundamentals | "What happens when you run `kubectl apply`?" |
| 5 | Scaling and release strategies | "Rolling, blue-green or canary: when would you use each?" |
| 6 | Infrastructure as code | "What does `terraform plan` actually compare?" |
| 7 | GitOps, configuration and secrets | "How do you promote a change from staging to production?" |
| 8 | Monitoring and alerting in operations | "How do you alert without paging people for noise?" |
| 9 | Cloud fundamentals | "How do you design for an availability-zone failure?" |
| 10 | Question bank and cheat sheet | Revision |

# Chapter 1: DevOps, Flow and DORA Metrics
%Why DevOps exists, what it optimises, and the four numbers that tell you whether it works

## 1.1 From hand-offs to flow

Before DevOps, development and operations were separate teams with opposite incentives: developers were rewarded for change, operations for stability. Releases were large, rare and risky, because each one batched months of changes. DevOps replaces hand-offs with shared ownership and **small, frequent, automated changes**.

| Principle (CALMS) | Meaning | In practice |
|---|---|---|
| Culture | Shared responsibility for running what you build | Developers are on call for their services |
| Automation | Machines do repeatable work | CI/CD pipelines, infrastructure as code |
| Lean | Small batches, limit work in progress | Merge daily; ship small pull requests |
| Measurement | Decide with data | DORA metrics, SLOs, dashboards |
| Sharing | Knowledge flows across teams | Postmortems, runbooks, internal platforms |

Why small batches are safer, not just faster: if one change in fifty breaks something, a release of fifty changes almost certainly contains a bug and is hard to debug, while a release of one change rarely does and is trivial to roll back.

```python run Batch size and the chance a release contains a bad change
p_bad = 0.02                                          # 2% of changes cause an incident
for batch in [1, 5, 20, 50, 100]:
    p_release_bad = 1 - (1 - p_bad) ** batch
    print(f'{batch:3} changes per release: P(contains a bad change) = {p_release_bad:5.1%}, '
          f'suspects: {batch}')
```

## 1.2 Flow: Little's law and work in progress

Little's law links three quantities of any stable queue: **lead time = work in progress / throughput**. A team that finishes 10 items a week with 40 items in progress has an average lead time of 4 weeks. Starting more work does not finish anything sooner; it only lengthens the queue. Limiting work in progress is the cheapest way to cut lead time.

```python run Little's law on a simulated team
import random
rng = random.Random(5)

def simulate(wip_limit, weeks=200):
    in_progress, finished, waiting = [], [], []
    for week in range(weeks):
        for _ in range(12):                                  # 12 new requests a week
            waiting.append(week)
        while waiting and len(in_progress) < wip_limit:
            waiting.pop(0)
            in_progress.append(week)                         # record the start week
        done_this_week = min(len(in_progress), 10)           # capacity: 10 items a week
        for _ in range(done_this_week):
            start = in_progress.pop(0)
            finished.append(week - start + 1)
    recent = finished[-500:]
    return sum(recent) / len(recent), len(in_progress)

for limit in [10, 20, 40, 80]:
    lead, wip = simulate(limit)
    print(f'WIP limit {limit:3}: average lead time from start {lead:5.1f} weeks, '
          f'items in progress at the end {wip}')
```

Lead time here is measured from the moment work *starts*, which is what a WIP limit controls. Capacity is 10 items a week either way, so the output is Little's law exactly: 10, 20, 40 and 80 items in progress give lead times of 1, 2, 4 and 8 weeks. With more items in progress, each one simply waits longer for its turn. (The overall backlog still grows, because 12 requests arrive for every 10 completed: no process change fixes demand above capacity.)

## 1.3 The DORA metrics

Research by the DevOps Research and Assessment (DORA) group found four metrics that separate high-performing teams, and showed that speed and stability go **together** rather than trading off:

| Metric | Definition | Elite performers (approximate) |
|---|---|---|
| Deployment frequency | How often you deploy to production | On demand, several times a day |
| Lead time for changes | Commit to running in production | Less than a day |
| Change failure rate | Share of deployments causing a failure needing remediation | 0–15% |
| Time to restore service | How long to recover from a failure | Less than an hour |

The program computes all four from a deployment log, which is exactly how internal dashboards do it.

```python run DORA metrics from a deployment log
from datetime import datetime, timedelta
import statistics

deploys = [   # (commit time, deploy time, caused failure?, restored at)
    ('2026-09-01 09:10', '2026-09-01 11:40', False, None),
    ('2026-09-01 14:00', '2026-09-01 16:05', True, '2026-09-01 16:50'),
    ('2026-09-02 10:30', '2026-09-02 12:00', False, None),
    ('2026-09-03 09:00', '2026-09-03 17:30', False, None),
    ('2026-09-03 15:20', '2026-09-04 10:00', False, None),
    ('2026-09-04 11:00', '2026-09-04 12:10', True, '2026-09-04 14:40'),
    ('2026-09-07 09:45', '2026-09-07 10:30', False, None),
    ('2026-09-08 13:00', '2026-09-08 15:00', False, None),
]
t = lambda s: datetime.strptime(s, '%Y-%m-%d %H:%M')
days = (t(deploys[-1][1]) - t(deploys[0][1])).days + 1
lead = [(t(d) - t(c)).total_seconds() / 3600 for c, d, _, _ in deploys]
failures = [(t(d), t(r)) for _, d, bad, r in deploys if bad]
restore = [(r - d).total_seconds() / 60 for d, r in failures]
print(f'deployment frequency : {len(deploys) / days:.1f} per day over {days} days')
print(f'lead time for changes: median {statistics.median(lead):.1f} h, worst '
        f'{max(lead):.1f} h')
print(f'change failure rate  : {len(failures) / len(deploys):.0%}')
print(f'time to restore      : median {statistics.median(restore):.0f} min')
```

> TRAP: Metrics become targets and then stop measuring anything (Goodhart's law). Splitting one deploy into five trivial ones raises deployment frequency without improving anything. Use DORA metrics to find bottlenecks, not to rank people.

## 1.4 Practical lessons

- DevOps is shared ownership plus automation, aimed at small, frequent, safe changes.
- Small batches reduce both the chance and the cost of a bad release.
- Lead time = WIP / throughput: limit work in progress before adding process.
- Measure delivery with the four DORA metrics; speed and stability improve together.

# Chapter 2: Version Control and Continuous Integration
%Branching strategies, pipelines as graphs, caching, test sharding and flaky tests

## 2.1 Branching strategies

| Strategy | How | Strength | Weakness |
|---|---|---|---|
| Trunk-based development | Everyone merges small changes into `main` at least daily; unfinished work hidden behind feature flags | Fast integration, few merge conflicts, enables continuous delivery | Needs good tests and feature flags |
| GitHub flow | Short-lived feature branches, pull request, merge to `main`, deploy | Simple, review built in | Branches that live too long drift |
| Git flow | `develop`, `release/*`, `hotfix/*` and feature branches | Fits scheduled releases and versioned products | Heavy; long-lived branches; slow integration |

The cost of a long-lived branch grows with its age, because the rest of the team keeps changing the code underneath it. The simulation estimates how often a branch collides with other people's changes as it ages.

```python run Merge-conflict risk grows with branch age
import random
rng = random.Random(1)
files, team, changes_per_dev_day = 400, 8, 3

def conflict_probability(days, my_files=6, trials=3000):
    hits = 0
    for _ in range(trials):
        mine = set(rng.sample(range(files), my_files))
        others = {rng.randrange(files) for _ in range(team * changes_per_dev_day * days)}
        hits += bool(mine & others)
    return hits / trials

for d in [1, 2, 5, 10, 20]:
    print(f'branch open {d:2} days: P(someone touched one of my files) = '
            f'{conflict_probability(d):5.1%}')
```

Even a one-day branch has about a one-in-three chance of overlapping with a teammate's change; by two weeks it is near certain. Integrating daily keeps every overlap small and fresh in everyone's mind.

## 2.2 Continuous integration and delivery

| Practice | Definition |
|---|---|
| Continuous integration (CI) | Every change is merged to the main line often and verified by an automated build and tests |
| Continuous delivery | Every change that passes the pipeline is releasable; deploying is a button press |
| Continuous deployment | Every change that passes the pipeline is deployed to production automatically |

A typical pipeline definition (GitHub Actions) for a Java service:

```text
# .github/workflows/ci.yml
name: ci
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: {distribution: temurin, java-version: '21', cache: maven}
      - run: mvn -B verify                      # compile, unit and integration tests
      - run: docker build -t ghcr.io/acme/meter-api:${{ github.sha }} .
      - run: docker push ghcr.io/acme/meter-api:${{ github.sha }}
        if: github.ref == 'refs/heads/main'
```

```python run The pipeline file is valid YAML with the expected structure
import yaml
ci = yaml.safe_load('''
name: ci
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: {distribution: temurin, java-version: '21', cache: maven}
      - run: mvn -B verify
      - run: docker build -t ghcr.io/acme/meter-api:${{ github.sha }} .
      - run: docker push ghcr.io/acme/meter-api:${{ github.sha }}
        if: github.ref == 'refs/heads/main'
''')
steps = ci['jobs']['build']['steps']
print('triggers:', ci[True])                 # YAML 1.1 reads the key `on` as boolean True!
print('steps:', len(steps), '| actions used:', [s['uses'] for s in steps if 'uses' in s])
print('push only on main:', steps[-1]['if'])
```

> TRAP: The output shows a real YAML pitfall: PyYAML (YAML 1.1) parses the bare key `on` as the boolean `True`, not the string `"on"`. GitHub's own parser handles it, but other tools reading the same file may not. The same rule turns `yes`, `no` and `off` into booleans, so quote such values (`'on'`, `country: 'NO'`).

## 2.3 A pipeline is a graph

Pipeline steps have dependencies: unit tests need a compiled build; the image needs passing tests; integration tests need the image. Steps without a dependency between them can run in parallel, so the shortest possible pipeline time is the **critical path**, the longest chain of dependent steps, not the sum of all steps.

```python run Critical path of a CI pipeline
from functools import lru_cache
steps = {   # name: (minutes, depends on)
    'checkout': (1, []),
    'compile': (4, ['checkout']),
    'lint': (2, ['checkout']),
    'unit-tests': (9, ['compile']),
    'security-scan': (6, ['compile']),
    'build-image': (3, ['unit-tests']),
    'integration-tests': (12, ['build-image']),
    'push-image': (1, ['integration-tests', 'security-scan', 'lint']),
}

@lru_cache(maxsize=None)
def finish(step):
    minutes, deps = steps[step]
    return minutes + max((finish(d) for d in deps), default=0)

def path(step):
    _, deps = steps[step]
    return (path(max(deps, key=finish)) if deps else []) + [step]

total_serial = sum(m for m, _ in steps.values())
print(f'run every step one after another: {total_serial} min')
print(f'run independent steps in parallel: {finish("push-image")} min')
print('critical path:', ' > '.join(path('push-image')))
```

Speeding up `lint` or the security scan would not change the total at all; only steps on the critical path matter. That is the first thing to compute when someone says "CI is too slow".

## 2.4 Making CI fast: caching and sharding

**Caching** reuses work between runs: the dependency cache (Maven, npm, pip) keyed by the lockfile hash, the Docker layer cache (Chapter 3), and compiled outputs for unchanged modules.

**Test sharding** splits a slow test suite across machines. Splitting by count is a poor heuristic, because test durations differ; assign the longest tests first to the currently least-loaded machine (the LPT rule) using durations recorded in earlier runs.

```python run Sharding 120 tests across 6 runners
import random, heapq
rng = random.Random(3)
durations = [rng.lognormvariate(2.5, 0.9) for _ in range(120)]     # seconds, skewed

def by_count(tests, shards):
    loads = [0.0] * shards
    for i, d in enumerate(tests):
        loads[i % shards] += d
    return loads

def lpt(tests, shards):
    heap = [(0.0, s) for s in range(shards)]
    for d in sorted(tests, reverse=True):
        load, s = heapq.heappop(heap)
        heapq.heappush(heap, (load + d, s))
    return [load for load, _ in heap]

print(f'one runner          : {sum(durations) / 60:5.1f} min')
for name, f in [('split by count', by_count), ('longest first (LPT)', lpt)]:
    loads = f(durations, 6)
    print(f'{name:20}: wall time {max(loads) / 60:5.1f} min (ideal '
            f'{sum(loads) / 6 / 60:4.1f})')
```

## 2.5 Flaky tests

A flaky test passes and fails on the same code. Each one may fail rarely, but a large suite has many, and the probability that **some** test fails grows quickly. Teams then rerun pipelines until they pass, which trains everyone to ignore red builds.

```python run How flaky tests break pipelines, and what retries hide
for flaky, p in [(5, 0.01), (20, 0.01), (50, 0.01), (50, 0.02)]:
    fail = 1 - (1 - p) ** flaky
    fail_retry = 1 - (1 - p ** 2) ** flaky                 # each test retried once
    print(f'{flaky:3} flaky tests failing {p:.0%} of runs: pipeline red {fail:5.1%}, '
          f'with one automatic retry {fail_retry:6.2%}')
```

Automatic retries make the pipeline green again, but they hide real intermittent bugs (race conditions often look exactly like flakiness). Good practice: retry once, **record** every retry, quarantine tests that flake repeatedly, and fix or delete them on a deadline.

## 2.6 Practical lessons

- Prefer trunk-based development with short-lived branches; integrate at least daily.
- A pipeline is a dependency graph: optimise the critical path, parallelise the rest.
- Cache dependencies and layers; shard tests by recorded duration, longest first.
- Track flaky tests explicitly; retries are a bandage, not a cure.
