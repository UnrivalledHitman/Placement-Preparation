# Solutions
%Every program executed; configuration answers given as corrected files

## Part 1 solutions

### O1.1 DORA from a month of deploys

```python run Computing the four numbers
import statistics
days, deploys, restores = 30, 45, [20, 35, 50, 90, 25, 40]
print(f'deployment frequency: {deploys / days:.1f} per day')
print(f'change failure rate : {len(restores) / deploys:.1%}')
print(f'time to restore     : mean {statistics.mean(restores):.1f} min, '
      f'median {statistics.median(restores):.1f} min')
```

The team deploys several times a day on average, its change failure rate is inside the elite 0–15% band, and its typical restore time is under an hour. One incident (90 minutes) missed the hour, which is why the mean is pulled above the median: report both, and look at the outlier's postmortem.

### O1.2 Little's law

Lead time = WIP / throughput = 30 / 6 = **5 weeks**. For 2 weeks at 6 items a week: WIP = 2 × 6 = **12 items**. Nothing about the team's speed changes; the extra 18 items simply wait in a backlog instead of being "in progress", where they collect context switches and stale branches.

### O1.3 The critical path moves

```python run Critical path before and after each speed-up
from functools import lru_cache

def analyse(steps):
    @lru_cache(maxsize=None)
    def finish(s):
        minutes, deps = steps[s]
        return minutes + max((finish(d) for d in deps), default=0)
    def path(s):
        deps = steps[s][1]
        return (path(max(deps, key=finish)) if deps else []) + [s]
    return finish('publish'), ' > '.join(path('publish'))

base = {'checkout': (1, ()), 'deps': (3, ('checkout',)), 'compile': (5, ('deps',)),
        'unit': (12, ('compile',)), 'lint': (2, ('checkout',)), 'image': (4, ('compile',)),
        'e2e': (15, ('image',)), 'scan': (6, ('image',)),
        'publish': (1, ('unit', 'e2e', 'scan', 'lint'))}
for label, change in [('original', {}), ('(a) unit twice as fast', {'unit': 6}),
                      ('(b) e2e twice as fast', {'e2e': 7.5})]:
    steps = dict(base, **{k: (v, base[k][1]) for k, v in change.items()})
    total, crit = analyse(steps)
    print(f'{label:22} {total:4} min: {crit}')
```

Speeding up unit tests saves **nothing**: they are not on the critical path. Halving the e2e tests saves 7 minutes, not 7.5, because the critical path **moves** to the unit-test chain (22 minutes). After every optimisation, recompute the critical path before choosing the next one.

### O1.4 Flaky suite

```python run Red pipelines from flakiness
import math
p, n = 0.005, 40
print(f'no retry : {1 - (1 - p) ** n:.1%} of pipelines red on correct code')
print(f'one retry: {1 - (1 - p * p) ** n:.2%}')
limit = math.floor(math.log(0.99) / math.log(1 - p * p))
print(f'flaky tests allowed before the retried pipeline is red >1% of the time: {limit}')
```

Almost one pipeline in five fails on correct code, so developers learn to press "rerun" without reading the failure. One retry hides nearly all of it; the suite could hold about 400 such tests before the retried pipeline crossed 1%. That is exactly the danger: retries let flakiness grow silently. Record every retry and treat the count as a metric.

### O1.5 Sharding

```python run Round-robin versus longest first
import heapq
tests = [14, 9, 9, 8, 7, 6, 5, 5, 4, 3, 2, 2]
runners = 4
rr = [sum(tests[i::runners]) for i in range(runners)]
heap = [(0, r, []) for r in range(runners)]
for t in sorted(tests, reverse=True):
    load, r, items = heapq.heappop(heap)
    heapq.heappush(heap, (load + t, r, items + [t]))
lpt = sorted(heap, key=lambda h: h[1])
print('round-robin loads:', rr, '-> wall time', max(rr))
print('longest first    :', [load for load, _, _ in lpt], '-> wall time',
      max(load for load, _, _ in lpt))
for load, r, items in lpt:
    print(f'  runner {r + 1}: {items}')
print('lower bound      :', max(sum(tests) / runners, max(tests)))
```

Round-robin puts the 14-, 7- and 4-minute files on the same runner. Longest first comes within half a minute of the lower bound of 18.5 minutes, and since every file takes a whole number of minutes, 19 is the best any split can achieve. Real CI tools (for example, CircleCI's timing-based splitting and Knapsack) do exactly this with recorded durations.

### O1.6 Choosing a branching model

**Team A (SaaS):** trunk-based development. Branches live hours, not days; every merge to `main` runs the full pipeline and deploys (continuous deployment or one-click delivery). Incomplete features merge behind feature flags that are off in production, so integration happens daily while release happens when the product team flips the flag. Hotfixes are ordinary small commits on `main`, deployed in minutes.

**Team B (mobile):** the store review and the fact that old app versions stay installed for months mean they need **release branches**: cut `release/4.12` from `main` every two weeks, stabilise it, ship it, and keep it for hotfixes; fixes are made on `main` first and cherry-picked to the release branch. Development itself can still be trunk-based on `main` (a lightweight variant of Git flow, without a separate `develop` branch). Feature flags matter even more here, because they are **remotely controllable**: a broken feature can be switched off for users without waiting for an app-store review.

## Part 2 solutions

### O2.1 A slow, unsafe Dockerfile

| Line | Problem | Consequence |
|---|---|---|
| `FROM node:latest` | Unpinned, full-size base | Builds change silently when `latest` moves; ~1 GB image with compilers and many CVEs |
| `COPY . /app` first | Source copied before dependencies are installed | Every code change reinstalls all npm packages; `.git` and local secrets enter the build context |
| `RUN apt-get update` alone | Cached separately from the install | Later installs use a stale package index; packages can fail to download or be outdated |
| No cleanup of apt lists | Index files stay in a layer | Larger image |
| `npm install` | Ignores the lockfile's exact versions | Unreproducible builds; use `npm ci` |
| `ENV API_KEY=...` | Secret baked into image metadata | Anyone who can pull the image (or read `docker history`) has the live key; it must be rotated now |
| Runs as root | No `USER` | A compromise of the app is root inside the container |
| `CMD npm start` (shell form) | `sh` is PID 1, `npm` in between | `SIGTERM` does not reach Node: no graceful shutdown, killed after the grace period |
| Build tools in the final image | Single stage | Larger attack surface and slower pulls |

```text
# syntax=docker/dockerfile:1
FROM node:20.17-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:20.17-slim
RUN apt-get update && apt-get install -y --no-install-recommends imagemagick \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]          # API_KEY comes from a secret at runtime
```

A small linter catches most of these mechanically; real projects run `hadolint` in CI for the same purpose.

```python run A tiny Dockerfile linter on both versions
import re

def lint(dockerfile):
    lines = [l.split('#')[0].strip() for l in dockerfile.strip().splitlines()]
    lines = [l for l in lines if l]
    issues = []
    for i, l in enumerate(lines):
        if re.match(r'FROM \S+(:latest)?( AS \w+)?$', l) and ':' not in l.split()[1] \
                or l.split()[0] == 'FROM' and l.split()[1].endswith(':latest'):
            issues.append(f'unpinned base image: {l}')
        if l == 'RUN apt-get update':
            issues.append('apt-get update in its own layer')
        if re.match(r'ENV \w*(KEY|SECRET|PASSWORD|TOKEN)\w*=', l):
            issues.append(f'secret in ENV: {l.split("=")[0]}')
        if re.match(r'(CMD|ENTRYPOINT) [^\[]', l):
            issues.append(f'shell-form {l.split()[0]} (signals not forwarded)')
        if re.match(r'RUN npm install\b', l):
            issues.append('npm install instead of npm ci')
    copy_all = next((i for i, l in enumerate(lines) if l.startswith('COPY . ')), None)
    install = next((i for i, l in enumerate(lines) if re.match(r'RUN npm (ci|install)', l)),
            None)
    if copy_all is not None and install is not None and copy_all < install:
        issues.append('source copied before dependencies are installed')
    if not any(l.startswith('USER ') for l in lines):
        issues.append('no USER: runs as root')
    return issues or ['no issues found']

bad = '''FROM node:latest
COPY . /app
WORKDIR /app
RUN apt-get update
RUN apt-get install -y imagemagick
RUN npm install
RUN npm run build
ENV API_KEY=sk_live_51Hc
EXPOSE 3000
CMD npm start'''
good = '''FROM node:20.17-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev
FROM node:20.17-slim
RUN apt-get update && apt-get install -y --no-install-recommends imagemagick
WORKDIR /app
COPY --from=build /app/dist ./dist
USER node
CMD ["node", "dist/server.js"]'''
for name, df in [('original', bad), ('fixed', good)]:
    print(f'{name}:'); print('\n'.join('  - ' + i for i in lint(df)))
```

### O2.2 What rebuilds?

```python run Replaying the build cache for each change
import hashlib

def build(steps, files, cache, ignore=()):
    parent, cost, rerun = 'scratch', 0, []
    for instr, secs, inputs in steps:
        seen = {n: c for n, c in files.items() if n not in ignore}
        data = ''.join(f'{n}={c}' for n, c in sorted(seen.items())
                       if inputs == 'ALL' or n in inputs)
        key = hashlib.sha256(f'{parent}|{instr}|{data}'.encode()).hexdigest()
        if key not in cache:
            cache.add(key); cost += secs; rerun.append(instr.split()[0] + ' '
                    + instr.split()[1])
        parent = key
    return cost, rerun

def steps(base='node:20-slim'):
    return [(f'FROM {base}', 0, ()), ('RUN apt-get-imagemagick', 60, ()),
            ('COPY package*.json', 1, ('package.json', 'package-lock.json')),
            ('RUN npm-ci', 90, ()), ('COPY .', 2, 'ALL'), ('RUN npm-run-build', 45, ())]

files = {'package.json': 'v1', 'package-lock.json': 'v1', 'src/app.ts': 'v1',
        'README.md': 'v1'}
cases = [('(a) edit src/app.ts', {'src/app.ts': 'v2'}, 'node:20-slim', ()),
         ('(b) add a dependency', {'package.json': 'v2', 'package-lock.json': 'v2'},
          'node:20-slim', ()),
         ('(c) new base image', {}, 'node:22-slim', ()),
         ('(d) edit README.md', {'README.md': 'v2'}, 'node:20-slim', ()),
         ('(d) ... with .dockerignore', {'README.md': 'v2'}, 'node:20-slim',
                 ('README.md',))]
for label, change, base, ignore in cases:
    cache = set()
    build(steps(), files, cache, ignore)
    cost, rerun = build(steps(base), dict(files, **change), cache, ignore)
    first = f'{len(rerun)} steps from {rerun[0]}' if rerun else 'nothing'
    print(f'{label:28} {cost:4} s  reruns {first}')
```

A dependency change costs 138 seconds because it invalidates `npm ci` and everything after; a new base image rebuilds every step. The README case shows why `.dockerignore` matters for speed as well as safety: without it, any file in the context changes the `COPY . .` key.

### O2.3 How many pods fit?

```python run Bin-packing pods by requests
import math
alloc_cpu, alloc_mem = 3920, 15 * 1024
ds_cpu, ds_mem = 200, 400
for cpu_req, mem_req in [(500, 1024), (250, 1024)]:
    by_cpu = (alloc_cpu - ds_cpu) // cpu_req
    by_mem = (alloc_mem - ds_mem) // mem_req
    fit = min(by_cpu, by_mem)
    limit = 'CPU' if by_cpu < by_mem else 'memory' if by_mem < by_cpu else 'both'
    print(f'request {cpu_req}m/{mem_req}Mi: {by_cpu} by CPU, {by_mem} by memory -> '
          f'{fit} per node ({limit})')
    print(f'  40 replicas need {math.ceil(40 / fit)} nodes')
```

With 500m requests, CPU is the bottleneck and half of each node's memory is stranded. Halving the CPU request (if measurements show the pods really use less) balances both resources and halves the node count. Right-sizing requests from observed usage is the single biggest Kubernetes cost lever.

### O2.4 The JVM that keeps getting OOM-killed

```python run Adding up a JVM's memory
limit = 768
native = {'metaspace': 110, 'code cache': 48, 'thread stacks': 150, 'direct buffers': 32,
          'GC and other': 40}
heap = limit * 0.75
total = heap + sum(native.values())
print(f'max heap at 75%: {heap:.0f} MiB + native {sum(native.values())} MiB = {total:.0f} '
        f'MiB '
      f'vs limit {limit} MiB')
room = limit - sum(native.values())
print(f'heap that fits: {room} MiB = {room / limit:.1%} of the limit')
for pct in [50, 45]:
    print(f'MaxRAMPercentage={pct}: heap {limit * pct / 100:.0f} MiB, '
          f'headroom {room - limit * pct / 100:.0f} MiB')
```

The heap may grow to 576 MiB, but the process also needs about 380 MiB outside the heap. Under load the heap fills, the total crosses 768 MiB, and the kernel's OOM killer sends SIGKILL: exit code 137 (128 + 9), with **no** Java `OutOfMemoryError` in the logs, which is what confuses people. 50% leaves only 4 MiB of headroom; choose **45%** (42 MiB of slack), or raise the limit to 1 GiB and keep 60%. Thread stacks are the most variable item: fewer platform threads (or virtual threads) shrink them.

### O2.5 CrashLoopBackOff on a healthy app

```python run Which starts survive which probes
starts = [38, 41, 44, 47, 52, 58, 63, 71, 79, 85]
kill_at = 30 + (3 - 1) * 10
print(f'liveness kills at {kill_at} s: killed starts {[s for s in starts if s > kill_at]}')
period, threshold = 5, 24
budget = period * threshold
print(f'startup probe {period} s x {threshold} = {budget} s: '
      f'killed starts {[s for s in starts if s > budget]}, margin over the slowest '
      f'{budget / max(starts) - 1:.0%}')
```

With the original liveness settings the third failed probe comes at 50 seconds, so six of the ten observed starts are killed. Each restart draws another start time, so the pod usually fails again and Kubernetes backs off for longer each time: CrashLoopBackOff on code that works.

```text
startupProbe:
  httpGet: {path: /actuator/health/liveness, port: 8080}
  periodSeconds: 5
  failureThreshold: 24          # up to 120 s to start, about 40% over the slowest observed
livenessProbe:                  # only begins after the startup probe has succeeded
  httpGet: {path: /actuator/health/liveness, port: 8080}
  periodSeconds: 10
  failureThreshold: 3
readinessProbe:
  httpGet: {path: /actuator/health/readiness, port: 8080}
  periodSeconds: 5
```

Liveness no longer needs an initial delay, so a deadlock in a running pod is still detected within 30 seconds. Meanwhile readiness is failing, so the starting pod receives no traffic; it is added to the Service endpoints only when ready.

### O2.6 Lint the manifests

```python run Cross-checking a multi-document manifest
import yaml
MANIFEST = '''
apiVersion: apps/v1
kind: Deployment
metadata: {name: meter-api}
spec:
  selector: {matchLabels: {app: meter-api}}
  template:
    metadata: {labels: {app: meter-api, tier: backend}}
    spec:
      containers:
        - {name: api, image: meter-api:3f2a91c, ports: [{name: http, containerPort: 8080}]}
---
apiVersion: apps/v1
kind: Deployment
metadata: {name: meter-worker}
spec:
  selector: {matchLabels: {app: meter-worker}}
  template:
    metadata: {labels: {app: meter-wrker}}
    spec:
      containers: [{name: worker, image: meter-worker:3f2a91c}]
---
apiVersion: v1
kind: Service
metadata: {name: meter-api}
spec:
  selector: {app: meter-api, tier: back-end}
  ports: [{port: 80, targetPort: http}]
---
apiVersion: v1
kind: Service
metadata: {name: meter-admin}
spec:
  selector: {app: meter-api}
  ports: [{port: 80, targetPort: web}]
'''

def matches(selector, labels):
    return all(labels.get(k) == v for k, v in selector.items())

docs = [d for d in yaml.safe_load_all(MANIFEST) if d]
deps = [d for d in docs if d['kind'] == 'Deployment']
problems = []
for d in deps:
    tpl = d['spec']['template']['metadata']['labels']
    if not matches(d['spec']['selector']['matchLabels'], tpl):
        problems.append(f"Deployment/{d['metadata']['name']}: selector does not match "
                f"template")
for s in [d for d in docs if d['kind'] == 'Service']:
    sel = s['spec']['selector']
    targets = [d for d in deps if matches(sel, d['spec']['template']['metadata']['labels'])]
    if not targets:
        problems.append(f"Service/{s['metadata']['name']}: selector {sel} matches no pods")
        continue
    names = {p.get('name') for d in targets
            for c in d['spec']['template']['spec']['containers']
             for p in c.get('ports', [])}
    for p in s['spec']['ports']:
        if isinstance(p['targetPort'], str) and p['targetPort'] not in names:
            problems.append(f"Service/{s['metadata']['name']}: no container port named "
                            f"'{p['targetPort']}'")
print('\n'.join(problems) or 'no problems')
```

The API server rejects only the first bug: since `apps/v1`, a Deployment whose selector does not match its template fails validation. The other two are accepted silently and fail at runtime with zero endpoints or refused connections. Running a check like this (or `kubeconform` plus a policy tool such as Conftest or Kyverno) in CI catches them before they reach a cluster.

### O2.7 Which component failed?

| Symptom | Responsible component | First command |
|---|---|---|
| (a) `Pending` | Scheduler: no node satisfies requests, taints, affinity, or a volume cannot bind; the cluster autoscaler may be unable to add nodes | `kubectl describe pod` and read Events (`0/6 nodes are available: 6 Insufficient cpu`) |
| (b) `ImagePullBackOff` | kubelet and the container runtime pulling from the registry: wrong name or tag, private registry without `imagePullSecrets`, rate limit | `kubectl describe pod` (exact pull error) |
| (c) Ready pods, Service times out | Service routing: selector or port mismatch (no endpoints), kube-proxy/CNI, or a NetworkPolicy blocking the caller | `kubectl get endpoints meter-api`, then check `targetPort` and NetworkPolicies |
| (d) No new ReplicaSet | Deployment controller in kube-controller-manager: rollout paused, or the edit did not change the pod template (e.g. only labels on the Deployment) | `kubectl rollout status deploy/meter-api`, `kubectl describe deploy` |
| (e) `Forbidden` | API server authorisation (RBAC) | `kubectl auth can-i <verb> <resource> -n <namespace>` |
