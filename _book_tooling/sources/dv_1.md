# Chapter 3: Containers and Images
%Images as layers, cache-friendly Dockerfiles, multi-stage builds, tags versus digests and registries

## 3.1 Image, container, registry

A **container** is an ordinary Linux process isolated by namespaces and limited by cgroups (the Linux guide, Chapter 9, builds one by hand). An **image** is the read-only filesystem plus metadata (entrypoint, environment, exposed ports) from which containers start. A **registry** (Docker Hub, GitHub Container Registry, Amazon ECR) stores and serves images.

| Term | What it is | Analogy |
|---|---|---|
| Image | Immutable stack of filesystem layers plus config | A class |
| Container | A running (or stopped) process started from an image, with a thin writable layer | An object |
| Layer | A tarball of filesystem changes made by one build instruction | A commit |
| Tag | A movable, human-readable name: `meter-api:1.4.2`, `meter-api:latest` | A branch name |
| Digest | `sha256:...` hash of the image manifest; immutable | A commit hash |

## 3.2 Layers and the build cache

Each `RUN`, `COPY` and `ADD` instruction produces a layer. When rebuilding, Docker reuses a cached layer only if the instruction **and everything before it** are unchanged, including the contents of files copied in. The first changed instruction invalidates its own layer and **every layer after it**.

The program models a build cache keyed by the hash of the instruction, the files it copies and the previous layer, and compares two orderings of the same Dockerfile after a one-line source change.

```python run Instruction order decides what a rebuild costs
import hashlib

def build(dockerfile, files, cache):
    parent, cost, log = 'scratch', 0, []
    for instr, seconds in dockerfile:
        copied = ''
        if instr.startswith('COPY'):
            src = instr.split()[1]
            copied = ''.join(f'{n}={c}' for n, c in sorted(files.items())
                             if src == '.' or n == src)
        key = hashlib.sha256(f'{parent}|{instr}|{copied}'.encode()).hexdigest()[:12]
        if key in cache:
            log.append(f'  CACHED {instr}')
        else:
            cache.add(key); cost += seconds
            log.append(f'  RUN    {instr}  ({seconds}s)')
        parent = key
    return cost, log

files = {'pom.xml': 'deps-v1', 'src/Main.java': 'v1'}
bad = [('FROM maven:3.9-eclipse-temurin-21', 0), ('COPY . /app', 1),
       ('RUN mvn dependency:go-offline', 95), ('RUN mvn package', 40)]
good = [('FROM maven:3.9-eclipse-temurin-21', 0), ('COPY pom.xml /app', 1),
        ('RUN mvn dependency:go-offline', 95), ('COPY . /app', 1), ('RUN mvn package', 40)]

for name, df in [('copy everything first', bad), ('copy pom.xml first', good)]:
    cache = set()
    build(df, files, cache)                                  # first build fills the cache
    changed = dict(files, **{'src/Main.java': 'v2'})         # edit one source file
    cost, log = build(df, changed, cache)
    print(f'{name}: rebuild after a one-line change costs {cost}s')
    print('\n'.join(log))
```

Copying the dependency manifest first and downloading dependencies before copying the source means everyday code changes reuse the expensive dependency layer. The same pattern applies to `package.json` + `npm ci` and `requirements.txt` + `pip install`.

## 3.3 A production Dockerfile

```text
# syntax=docker/dockerfile:1
FROM maven:3.9-eclipse-temurin-21 AS build           # stage 1: full JDK and Maven
WORKDIR /app
COPY pom.xml .
RUN mvn -B dependency:go-offline                      # cached unless pom.xml changes
COPY src ./src
RUN mvn -B package -DskipTests

FROM eclipse-temurin:21-jre                           # stage 2: runtime only
RUN useradd --system --uid 10001 app
WORKDIR /app
COPY --from=build /app/target/meter-api.jar app.jar
USER 10001                                            # never run as root
EXPOSE 8080
HEALTHCHECK CMD wget -qO- http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
```

| Practice | Why |
|---|---|
| Multi-stage build | The compiler, Maven and the local repository stay in the build stage; the final image ships only the JRE and the jar |
| Small, pinned base image | Fewer packages mean fewer vulnerabilities; pinning keeps builds reproducible |
| Non-root `USER` | A container escape or app bug does not start as root |
| `.dockerignore` | Keeps `.git`, `target/` and secrets out of the build context (and out of the cache key) |
| Exec-form `ENTRYPOINT` (JSON array) | The JVM is PID 1 and receives `SIGTERM` directly for graceful shutdown |
| `-XX:MaxRAMPercentage` | Sizes the heap from the container's memory limit, not the host's |
| One process per container | Restarting, scaling and logging work per process |

```python run What the multi-stage build saves
build_stage = {'eclipse-temurin JDK + OS': 410, 'Maven': 10, 'local Maven repository': 180,
               'sources and target/': 25, 'meter-api.jar': 48}
runtime_stage = {'eclipse-temurin JRE + OS': 265, 'meter-api.jar': 48}
single, multi = sum(build_stage.values()), sum(runtime_stage.values())
print(f'single-stage image: {single} MB')
print(f'multi-stage image : {multi} MB  ({1 - multi / single:.0%} smaller)')
for pulls in [10, 200]:
    print(f'  {pulls:3} node pulls a day move {pulls * single / 1024:5.1f} GB vs '
          f'{pulls * multi / 1024:5.1f} GB')
```

The sizes are typical illustrative values rather than measurements; the point is that most of a naive image is build tooling the running service never touches.

> TRAP: `RUN apt-get update` and `RUN apt-get install ...` in **separate** instructions is a classic bug: the `update` layer is cached forever, so a later change to the install line installs packages from a stale index. Combine them in one `RUN` and clean up in the same instruction (`&& rm -rf /var/lib/apt/lists/*`), because a file deleted in a later layer still exists in the earlier one.

## 3.4 Tags, digests and immutability

A tag is a pointer that can be moved; a digest identifies exact bytes. `meter-api:latest` today and tomorrow may be different images, which makes rollbacks and audits unreliable. Production deployments should reference an immutable tag (the Git commit SHA) or a digest.

```python run A tag moves; a digest does not
import hashlib
registry = {}

def push(repo, tag, content):
    digest = 'sha256:' + hashlib.sha256(content.encode()).hexdigest()[:16]
    registry[f'{repo}:{tag}'] = digest
    return digest

d1 = push('meter-api', 'latest', 'jar built from commit 3f2a91c')
push('meter-api', '3f2a91c', 'jar built from commit 3f2a91c')
print('Monday   latest ->', registry['meter-api:latest'])
d2 = push('meter-api', 'latest', 'jar built from commit 8b77e04')
print('Tuesday  latest ->', registry['meter-api:latest'])
print('commit tag 3f2a91c still ->', registry['meter-api:3f2a91c'], '| same as Monday:',
        d1 == registry['meter-api:3f2a91c'])
```

## 3.5 Containers in the pipeline

| Step | Purpose |
|---|---|
| Build once | Build the image once per commit; promote **the same image** through test, staging and production |
| Tag with the commit SHA | Every running container traces back to exact source code |
| Scan | Check OS packages and libraries for known CVEs (Trivy, Grype) and fail on critical findings |
| Sign and attest | Sign images (cosign) and record a software bill of materials (see the Security guide) |
| Push to a private registry | Pull access controlled by IAM; images replicated close to the cluster |

> TIP: "Build once, deploy many" is a frequent interview point. Rebuilding for each environment means production runs bytes that were never tested. Differences between environments belong in configuration (Chapter 7), not in the image.

## 3.6 Practical lessons

- An image is a stack of layers; a change invalidates its layer and all later layers.
- Order instructions from least to most frequently changing: dependencies before source.
- Use multi-stage builds, slim pinned bases, a non-root user and exec-form entrypoints.
- Deploy by commit-SHA tag or digest, never by `latest`; build once and promote.

# Chapter 4: Kubernetes Fundamentals
%Desired state, the reconcile loop, the core objects, scheduling, probes and resource limits

## 4.1 Desired state and the control plane

Kubernetes is a system for running containers on a cluster of machines. You do not tell it *what to do*; you declare *what should exist* ("three replicas of meter-api, version 1.4.2"), and controllers work continuously to make reality match.

| Component | Where | Role |
|---|---|---|
| kube-apiserver | Control plane | The only entry point; validates objects and stores them in etcd |
| etcd | Control plane | Consistent key-value store holding all cluster state (uses Raft; see the Distributed Systems guide) |
| Scheduler | Control plane | Picks a node for each new pod |
| Controller manager | Control plane | Runs the reconcile loops: Deployment, ReplicaSet, Node, Job and more |
| kubelet | Every node | Starts the pod's containers through the container runtime and reports status |
| kube-proxy / CNI | Every node | Service routing and pod networking |

What `kubectl apply -f deployment.yaml` does:

1. `kubectl` sends the object to the API server, which authenticates, authorises, validates and stores it in etcd.
2. The Deployment controller sees a Deployment without a matching ReplicaSet and creates one.
3. The ReplicaSet controller sees 0 of 3 pods and creates 3 pod objects (with no node assigned).
4. The scheduler assigns each pending pod to a node.
5. Each node's kubelet sees pods assigned to it, pulls the image and starts the containers.
6. Readiness probes pass; the pods' IPs are added to the Service's endpoints and start receiving traffic.

Every step is a controller watching the API server and reacting. No component calls another directly.

## 4.2 The reconcile loop

A controller repeatedly compares **desired** with **observed** state and acts on the difference. It is level-triggered: it looks at the current state rather than reacting to individual events, so a missed event or a crash of the controller itself does no harm.

```python run A ReplicaSet controller surviving crashes and a scale change
import random
rng = random.Random(7)
desired, pods, next_id = 3, [], 0

def reconcile():
    global next_id
    diff = desired - len(pods)
    if diff > 0:
        for _ in range(diff):
            next_id += 1; pods.append(f'pod-{next_id}')
        return f'created {diff}'
    if diff < 0:
        removed = [pods.pop() for _ in range(-diff)]
        return f'deleted {", ".join(removed)}'
    return 'in sync'

for tick in range(1, 9):
    if tick == 3:
        pods.remove(rng.choice(pods)); event = 'a node died, one pod lost'
    elif tick == 5:
        desired = 5; event = 'user scaled to 5'
    elif tick == 7:
        desired = 2; event = 'user scaled to 2'
    else:
        event = ''
    observed = len(pods)
    action = reconcile()
    print(f'tick {tick}: desired {desired}, observed {observed} -> {action:<26} {event}')
```

The same pattern runs everything in Kubernetes, and operators (custom controllers for databases, certificates and so on) extend it to new resource types.

## 4.3 The core objects

| Object | Purpose |
|---|---|
| Pod | Smallest deployable unit: one or more containers sharing a network namespace and volumes; disposable |
| ReplicaSet | Keeps N identical pods running |
| Deployment | Manages ReplicaSets to give rolling updates and rollbacks for stateless apps |
| StatefulSet | Pods with stable names (`db-0`, `db-1`) and their own persistent volumes; ordered start-up |
| DaemonSet | One pod per node (log shippers, monitoring agents) |
| Job / CronJob | Run to completion, once or on a schedule |
| Service | Stable virtual IP and DNS name in front of a changing set of pods selected by labels |
| Ingress / Gateway | HTTP routing from outside the cluster to Services by host and path |
| ConfigMap / Secret | Configuration and credentials injected as environment variables or files |
| PersistentVolumeClaim | A request for storage, bound to a PersistentVolume |
| Namespace | A scope for names, quotas and access control |

A Deployment and a Service for the meter API, in the form you would `kubectl apply`. The program below holds the manifest as text, parses it and checks the links between the objects that most often break in practice: the Deployment's selector must match its pod template's labels, and the Service's selector must match the pods.

```python run The manifests, parsed and cross-checked
import yaml
MANIFEST = """
apiVersion: apps/v1
kind: Deployment
metadata: {name: meter-api, labels: {app: meter-api}}
spec:
  replicas: 3
  selector: {matchLabels: {app: meter-api}}
  strategy: {type: RollingUpdate, rollingUpdate: {maxSurge: 1, maxUnavailable: 0}}
  template:
    metadata: {labels: {app: meter-api}}
    spec:
      containers:
        - name: api
          image: ghcr.io/acme/meter-api:3f2a91c
          ports: [{containerPort: 8080}]
          resources:
            requests: {cpu: 250m, memory: 512Mi}
            limits: {memory: 768Mi}
          readinessProbe:
            httpGet: {path: /actuator/health/readiness, port: 8080}
            periodSeconds: 5
          livenessProbe:
            httpGet: {path: /actuator/health/liveness, port: 8080}
            initialDelaySeconds: 30
            periodSeconds: 10
            failureThreshold: 3
---
apiVersion: v1
kind: Service
metadata: {name: meter-api}
spec:
  selector: {app: meter-api}
  ports: [{port: 80, targetPort: 8080}]
"""
docs = list(yaml.safe_load_all(MANIFEST))
dep = next(d for d in docs if d['kind'] == 'Deployment')
svc = next(d for d in docs if d['kind'] == 'Service')
tpl_labels = dep['spec']['template']['metadata']['labels']
sel = dep['spec']['selector']['matchLabels']
c = dep['spec']['template']['spec']['containers'][0]

def matches(selector, labels):
    return all(labels.get(k) == v for k, v in selector.items())

print('objects:', [f"{d['kind']}/{d['metadata']['name']}" for d in docs])
print('deployment selector matches template :', matches(sel, tpl_labels))
print('service selector matches pods        :', matches(svc['spec']['selector'],
        tpl_labels))
print('service targetPort == containerPort  :',
      svc['spec']['ports'][0]['targetPort'] == c['ports'][0]['containerPort'])
print('image pinned to a commit, not latest :', not c['image'].endswith(':latest'))
print('requests:', c['resources']['requests'], '| limits:', c['resources']['limits'])
```

> TRAP: Labels are the glue of Kubernetes. A typo in a Service selector produces no error at all: the Service simply has zero endpoints and every request fails. `kubectl get endpoints meter-api` is the first thing to check when a Service "does not work".

## 4.4 Scheduling: filter, then score

For each pending pod the scheduler first **filters** out nodes that cannot run it (not enough unrequested CPU or memory, a taint the pod does not tolerate, a node selector that does not match), then **scores** the remaining nodes and picks the best. Scheduling uses **requests**, not actual usage: a node is full when the sum of requests reaches its allocatable capacity, however idle it really is.

```python run A simplified scheduler
nodes = {   # name: allocatable cpu (millicores), memory (MiB), labels, taints
    'node-a': dict(cpu=4000, mem=8192, labels={'zone': 'a'}, taints=set()),
    'node-b': dict(cpu=4000, mem=8192, labels={'zone': 'b'}, taints=set()),
    'node-gpu': dict(cpu=8000, mem=32768, labels={'zone': 'a', 'gpu': 'true'},
            taints={'gpu'}),
}
used = {n: dict(cpu=0, mem=0) for n in nodes}

def schedule(pod):
    feasible = []
    for n, spec in nodes.items():
        cpu_left = spec['cpu'] - used[n]['cpu']
        mem_left = spec['mem'] - used[n]['mem']
        if pod['cpu'] > cpu_left or pod['mem'] > mem_left:
            continue                                          # filter: resources
        if spec['taints'] - pod.get('tolerates', set()):
            continue                                          # filter: taints
        if any(spec['labels'].get(k) != v for k, v in pod.get('selector', {}).items()):
            continue                                          # filter: node selector
        free = 1 - (used[n]['cpu'] + pod['cpu']) / spec['cpu']
        feasible.append((round(free, 3), n))                  # score: least allocated
    if not feasible:
        return 'Pending (no node fits)'
    _, best = max(feasible)
    used[best]['cpu'] += pod['cpu']; used[best]['mem'] += pod['mem']
    return best

pods = [('api-1', dict(cpu=1000, mem=1024)), ('api-2', dict(cpu=1000, mem=1024)),
        ('api-3', dict(cpu=1000, mem=1024)), ('batch', dict(cpu=2500, mem=4096)),
        ('train', dict(cpu=6000, mem=16384, tolerates={'gpu'}, selector={'gpu': 'true'})),
        ('api-4', dict(cpu=2500, mem=1024))]
for name, pod in pods:
    print(f'{name:6} -> {schedule(pod)}')
print({n: f"{u['cpu']}m/{nodes[n]['cpu']}m" for n, u in used.items()})
```

`api-4` stays Pending although the cluster has plenty of free CPU in total: no **single** node that it is allowed on has 2500 millicores of unrequested capacity (node-a has 500 left, node-b 2000), and the GPU node is tainted against ordinary pods. This is fragmentation, and it is why the cluster autoscaler adds nodes when pods are pending.

## 4.5 Requests, limits and quality of service

| Setting | Effect |
|---|---|
| CPU request | Guaranteed share; used for scheduling |
| CPU limit | Hard cap; the container is **throttled** (slowed), never killed, when it hits it |
| Memory request | Used for scheduling and eviction ranking |
| Memory limit | Hard cap; exceeding it gets the container **OOM-killed** (exit code 137) |

| QoS class | Rule | Evicted |
|---|---|---|
| Guaranteed | Every container has requests = limits for CPU and memory | Last |
| Burstable | At least one request or limit set, not Guaranteed | In between |
| BestEffort | No requests or limits at all | First |

```python run Classifying pods by quality of service
def qos(containers):
    if all(c.get('req') and c.get('lim') and c['req'] == c['lim'] and
           set(c['req']) == {'cpu', 'mem'} for c in containers):
        return 'Guaranteed'
    if any(c.get('req') or c.get('lim') for c in containers):
        return 'Burstable'
    return 'BestEffort'

pods = {
    'payments': [dict(req={'cpu': 500, 'mem': 512}, lim={'cpu': 500, 'mem': 512})],
    'meter-api': [dict(req={'cpu': 250, 'mem': 512}, lim={'mem': 768})],
    'debug-shell': [dict()],
    'api+sidecar': [dict(req={'cpu': 500, 'mem': 512}, lim={'cpu': 500, 'mem': 512}),
            dict()],
}
for name, cs in pods.items():
    print(f'{name:12} -> {qos(cs)}')
```

The last pod shows a common surprise: a single sidecar without resources demotes the whole pod from Guaranteed to Burstable.

> TIP: A widely used rule for latency-sensitive services: set memory request = memory limit (memory cannot be reclaimed without killing), set a CPU request, and leave the CPU limit unset or generous, because CPU throttling causes latency spikes even when the node has idle cores.

## 4.6 Probes and pod failures

| Probe | Question it answers | On failure |
|---|---|---|
| Startup | "Has the app finished starting?" | Liveness and readiness are held off until it passes |
| Readiness | "Should this pod receive traffic now?" | Removed from Service endpoints; **not** restarted |
| Liveness | "Is the process stuck beyond recovery?" | Container is restarted |

```python run A liveness probe that restarts a slow-starting app forever
def run(start_seconds, initial_delay, period, threshold, horizon=300):
    t, restarts, timeline = 0, 0, []
    while t < horizon and restarts < 6:
        up_at = t + start_seconds
        failures, probe = 0, t + initial_delay
        while True:
            if probe >= up_at:
                timeline.append(f'started at {t}s, healthy at {up_at}s')
                return restarts, timeline
            failures += 1
            if failures == threshold:
                restarts += 1; t = probe + 1
                timeline.append(f'killed at {probe}s')
                break
            probe += period
    return restarts, timeline + ['... CrashLoopBackOff']

for delay in [10, 60]:
    restarts, tl = run(start_seconds=45, initial_delay=delay, period=10, threshold=3)
    print(f'initialDelay {delay}s: {restarts} restarts | ' + '; '.join(tl[:4]))
```

The app needs 45 seconds to start, but the probe gives it only 10 + 2 × 10 = 30 seconds before the third failure kills it, so every restart is killed again: the pod enters `CrashLoopBackOff` although nothing is wrong with the code. A startup probe (or a longer initial delay) fixes it.

| Status | Usual cause | First command |
|---|---|---|
| `Pending` | No node fits the requests, or an unbound volume claim | `kubectl describe pod` (Events) |
| `ImagePullBackOff` | Wrong image name or tag, or no pull credentials | `kubectl describe pod` |
| `CrashLoopBackOff` | Process exits at start-up, or liveness kills it | `kubectl logs --previous` |
| `OOMKilled` (exit 137) | Memory limit exceeded | Raise the limit or fix the leak; check JVM heap sizing |
| Running but no traffic | Readiness failing or Service selector mismatch | `kubectl get endpoints` |

> TRAP: Never let a liveness probe check a dependency such as the database. If the database is slow, every pod fails liveness at once, Kubernetes restarts the whole fleet, and a partial outage becomes a total one. Dependencies belong in readiness (or nowhere); liveness asks only "is this process alive?".

## 4.7 Practical lessons

- Kubernetes is declarative: controllers reconcile desired with observed state, continuously.
- Labels and selectors connect Deployments, pods and Services; mismatches fail silently.
- Scheduling uses requests; memory over the limit kills, CPU over the limit throttles.
- Use readiness for traffic, liveness only for deadlocks, and startup probes for slow starters.
