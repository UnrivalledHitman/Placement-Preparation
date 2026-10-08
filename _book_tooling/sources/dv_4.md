# Chapter 10: Question Bank and Cheat Sheet
%Interview questions with the core of a good answer, and one-page reminders

## 10.1 Foundations and CI

| Question | Core of a good answer |
|---|---|
| What is DevOps? | Shared ownership of building and running software, with automation and measurement, aimed at small, frequent, safe changes (CALMS) |
| Continuous delivery versus continuous deployment? | Delivery: every passing change is releasable, deploy is a button. Deployment: every passing change goes to production automatically |
| How do you measure delivery performance? | The four DORA metrics: deployment frequency, lead time for changes, change failure rate, time to restore |
| Why are small releases safer? | Fewer changes per release means a lower chance of including a bad one and far fewer suspects when one fails; rollback is trivial |
| Trunk-based development versus Git flow? | Trunk: short branches, merge daily, flags hide unfinished work, enables CD. Git flow: long-lived branches for scheduled, versioned releases; slower integration |
| CI takes 40 minutes. What do you do? | Find the critical path of the pipeline graph; parallelise independent jobs; cache dependencies and layers; shard tests by duration; move slow end-to-end tests to a later stage |
| How do you deal with flaky tests? | Measure them, retry once but record it, quarantine repeat offenders, fix or delete on a deadline; investigate races behind them |
| What is Little's law and why does it matter to teams? | Lead time = work in progress / throughput; limiting WIP shortens lead time without adding capacity |

## 10.2 Containers and Kubernetes

| Question | Core of a good answer |
|---|---|
| Container versus virtual machine? | A container is an isolated process sharing the host kernel (namespaces + cgroups); a VM runs its own kernel on a hypervisor. Containers start faster and are lighter; VMs isolate more strongly |
| Why did a one-line change rebuild all dependencies? | A layer and every later layer are invalidated when an instruction or its copied files change; copy the dependency manifest and install dependencies before copying source |
| Why multi-stage builds? | Build tools stay in the build stage; the runtime image is smaller, faster to pull and has fewer vulnerabilities |
| Tag versus digest? | A tag is a movable name; a digest is the immutable hash of the manifest. Deploy by commit-SHA tag or digest, never `latest` |
| What happens on `kubectl apply`? | API server validates and stores in etcd; Deployment controller creates a ReplicaSet; ReplicaSet creates pods; scheduler binds them to nodes; kubelets start containers; readiness adds them to Service endpoints |
| Deployment versus StatefulSet? | Deployment: interchangeable pods. StatefulSet: stable identities, ordered start-up and a persistent volume per pod (databases, Kafka) |
| How does a Service find its pods? | By label selector; endpoints are the ready pods whose labels match. A selector typo gives zero endpoints and no error |
| Requests versus limits? | Requests reserve capacity and drive scheduling; limits cap usage. Over the CPU limit throttles; over the memory limit is OOM-killed |
| Readiness versus liveness? | Readiness controls traffic and never restarts; liveness restarts a stuck process. Never check dependencies in liveness |
| Pod is in CrashLoopBackOff. Steps? | `kubectl describe pod` for events and exit code, `kubectl logs --previous`; check start-up time against probes, config and secrets, OOM (137) |
| Pod stuck in Pending? | No node satisfies its requests, taints, node selector or affinity, or a volume cannot bind. Read the Events; the cluster autoscaler may add a node |

## 10.3 Releases, IaC and operations

| Question | Core of a good answer |
|---|---|
| Rolling, blue-green or canary? | Rolling: default, cheap, mixed versions during rollout. Blue-green: instant switch and rollback, double capacity. Canary: limits exposure and compares metrics; needs traffic splitting and analysis |
| What do maxSurge and maxUnavailable do? | How many pods above and below the desired count are allowed during a rolling update; 1/0 keeps full capacity, larger values roll faster |
| How do you know a canary is healthy? | Compare canary with baseline on SLIs using a statistical test with enough traffic and time; automate rollback on regression |
| How does the HPA decide? | desired = ceil(current × metric / target), with a tolerance band and a scale-down stabilisation window; CPU saturates, so request-based metrics react better |
| Feature flags: benefits and costs? | Decouple deploy from release, enable gradual rollout and instant kill switches; cost is code paths to test and flags to remove |
| How does `terraform plan` work? | Refreshes real resources, compares them with state and configuration, and lists create, update, replace and destroy actions; replacement of stateful resources means data loss |
| What is drift and how do you handle it? | Real infrastructure differs from code, usually from console edits; detect with scheduled plans; revert by applying or adopt by changing code |
| Why lock Terraform state? | Concurrent applies would corrupt state or apply conflicting changes; use a remote backend with locking |
| What is GitOps? | Git holds the desired state of the cluster; an in-cluster agent pulls and reconciles; promotion and rollback are commits |
| How do you store secrets? | A secret manager with rotation and audit, synced into the cluster; encryption at rest; workload identity instead of static keys; never in Git or images |
| How do you alert well? | Page on user-visible symptoms using SLO burn rate over a long and a short window; every page actionable with a runbook |
| First thing to do in an incident? | Mitigate: roll back, disable the flag, shift traffic. Diagnose root cause afterwards; write a blameless postmortem |

## 10.4 Cloud

| Question | Core of a good answer |
|---|---|
| Region versus availability zone? | A region is a geographic area; zones are independent data centres within it. Spread across zones for hardware failures, across regions for disasters |
| Public versus private subnet? | Public subnets route to an internet gateway; private ones only out through NAT. Put databases and services in private subnets behind a load balancer |
| How many addresses in a /20? | 2<sup>32−20</sup> = 4096, minus the provider's reserved addresses (5 on AWS) |
| Security group versus network ACL? | Security group: stateful, attached to interfaces, allow rules only. NACL: stateless, per subnet, allow and deny |
| How is an IAM request evaluated? | Default deny; an explicit deny always wins; otherwise allowed only if some policy allows the action on the resource under its conditions |
| Serverless: when and when not? | Good for spiky, event-driven, low-ops workloads; watch cold starts, execution limits and cost at sustained high load |
| Shared responsibility model? | Provider secures the infrastructure; you secure your data, identities, configuration and the software you run |
| How do you cut a cloud bill? | Right-size from usage data, autoscale, commitments for steady load, spot for interruptible work, storage lifecycle rules, watch data transfer and NAT costs |

## 10.5 Cheat sheet

| Area | Remember |
|---|---|
| DORA | Frequency, lead time, change failure rate, time to restore; speed and stability go together |
| Pipeline speed | Critical path, parallel jobs, caches keyed by lockfiles, LPT test sharding |
| Dockerfile order | Base → system packages → dependency manifest → install → source → build; one `RUN` for update + install |
| Image hygiene | Multi-stage, slim pinned base, non-root user, exec-form entrypoint, `.dockerignore`, scan and sign |
| Kubernetes loop | Desired state in etcd; controllers reconcile; scheduler filters then scores on requests |
| Debug commands | `kubectl get pods`, `describe`, `logs --previous`, `get endpoints`, `get events --sort-by=.lastTimestamp`, `rollout undo` |
| Exit codes | 137 = SIGKILL (often OOM), 143 = SIGTERM, 1 = application error |
| QoS | Guaranteed (requests = limits for all), Burstable, BestEffort (none); evicted last to first |
| HPA | ceil(replicas × current / target); 10% tolerance; 5-minute scale-down window |
| Releases | Rolling (maxSurge/maxUnavailable), blue-green, canary + statistics, shadow; schemas expand then contract |
| Terraform | init → plan → apply; `+ ~ - -/+`; remote locked state; `prevent_destroy` on data |
| Secrets | Not in Git, images or plain Secrets; secret manager + workload identity; rotate on leak |
| Alerts | Multi-window burn rate (1 h & 5 min at 14.4, 6 h & 30 min at 6); runbook per alert |
| Cloud | Multi-AZ by default, private subnets, least-privilege IAM, non-overlapping CIDRs |
