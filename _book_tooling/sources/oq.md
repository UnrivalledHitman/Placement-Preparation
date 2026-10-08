# How to use this practice book
%25 exercises matching the DevOps and Cloud guide, with hints kept separate and executed solutions

Each part matches chapters of the **DevOps and Cloud** guide. Code exercises use Python with PyYAML and SciPy, like the guide's simulations; configuration exercises (Dockerfiles, manifests, Terraform plans) are answered with the corrected file and an explanation. If you have Docker Desktop and kind installed, replay every corrected file for real.

Solutions were executed like the guide, and their output is shown.

| Type | What you do |
|---|---|
| Code | Write and run a program |
| Numerical | Calculate, then check |
| Concept | Explain the mechanism and the trade-offs |
| Design | Sketch a pipeline, platform or process and justify it |
| Debug | Find and fix what is wrong |

**Marking scheme.** Mark ✓ (solved alone), ~ (with the hint) or ✗ (needed the solution). For Debug and Design, ✓ also requires naming the **consequence** of each problem (what breaks, for whom), not only the fix. Redo every ~ and ✗ a week later.

| Part | Guide chapters | Topic | Exercises |
|---|---|---|---|
| 1 | 1–2 | Flow, DORA and CI | 6 |
| 2 | 3–4 | Containers and Kubernetes | 7 |
| 3 | 5–7 | Releases, infrastructure as code, GitOps | 6 |
| 4 | 8–9 | Alerting, incidents and cloud | 6 |

# Exercises

## Part 1: Flow, DORA and CI

**O1.1 · Easy · Numerical · DORA from a month of deploys.** In 30 days a team deployed 45 times. Six deploys caused incidents, restored after 20, 35, 50, 90, 25 and 40 minutes. Compute deployment frequency, change failure rate, and mean and median time to restore. Which of the elite ranges from the guide does the team meet?

**O1.2 · Easy · Numerical · Little's law.** A team has 30 items in progress and finishes 6 a week. What is the average lead time? How many items may be in progress for a two-week lead time at the same throughput?

**O1.3 · Medium · Code · The critical path moves.** A pipeline has these steps (minutes, dependencies): checkout 1; deps 3 (checkout); compile 5 (deps); unit 12 (compile); lint 2 (checkout); image 4 (compile); e2e 15 (image); scan 6 (image); publish 1 (unit, e2e, scan, lint). Compute the total time with unlimited parallelism and the critical path. Then compute the new total if (a) unit tests are made twice as fast, (b) e2e tests are made twice as fast.

**O1.4 · Medium · Numerical · Flaky suite.** A suite of 2,000 tests contains 40 flaky tests, each failing independently in 0.5% of runs. What fraction of pipelines go red on correct code? With one automatic retry of failed tests? How many flaky tests could the suite contain before even the retried pipeline is red in more than 1% of runs?

**O1.5 · Medium · Code · Sharding.** Twelve test files take 14, 9, 9, 8, 7, 6, 5, 5, 4, 3, 2 and 2 minutes. Split them across 4 runners (a) round-robin in this order, (b) longest first onto the least-loaded runner. Compare both wall times with the best possible.

**O1.6 · Medium · Concept · Choosing a branching model.** Team A builds a SaaS web app deployed many times a day. Team B ships a mobile app through app-store reviews every two weeks and must hotfix the live version. Recommend a branching strategy for each and explain how feature flags fit in.

## Part 2: Containers and Kubernetes

**O2.1 · Medium · Debug · A slow, unsafe Dockerfile.** Find every problem in this Dockerfile, say what each one causes, and write a corrected version.

```text
FROM node:latest
COPY . /app
WORKDIR /app
RUN apt-get update
RUN apt-get install -y imagemagick
RUN npm install
RUN npm run build
ENV API_KEY=sk_live_51Hc...
EXPOSE 3000
CMD npm start
```

**O2.2 · Medium · Numerical · What rebuilds?** A Dockerfile has the steps `FROM node:20-slim`, `RUN apt-get ... imagemagick` (60 s), `COPY package.json package-lock.json ./` (1 s), `RUN npm ci` (90 s), `COPY . .` (2 s), `RUN npm run build` (45 s). How long does a rebuild take after (a) editing `src/app.ts`, (b) adding a dependency, (c) changing the base image to `node:22-slim`, (d) editing `README.md` with and without a `.dockerignore` entry for it?

**O2.3 · Easy · Numerical · How many pods fit?** Nodes have 3,920 millicores and 15 GiB allocatable. DaemonSets request 200m and 400 MiB per node. The service's pods request 500m CPU and 1 GiB memory. How many pods fit per node, which resource limits it, and how many nodes do 40 replicas need? Repeat with a CPU request of 250m.

**O2.4 · Medium · Numerical · The JVM that keeps getting OOM-killed.** A Java container has a 768 MiB memory limit and `-XX:MaxRAMPercentage=75`. Native memory tracking shows metaspace 110 MiB, code cache 48 MiB, thread stacks 150 MiB, direct buffers 32 MiB and GC plus other overhead 40 MiB. Explain the exit code 137 under load and choose a safe `MaxRAMPercentage`.

**O2.5 · Medium · Debug · CrashLoopBackOff on a healthy app.** An app's observed start-up times are 38, 41, 44, 47, 52, 58, 63, 71, 79 and 85 seconds. Its liveness probe has `initialDelaySeconds: 30`, `periodSeconds: 10`, `failureThreshold: 3`. Which starts are killed? Design a startup probe with `periodSeconds: 5` that allows every observed start with a safety margin, and say what readiness does meanwhile.

**O2.6 · Medium · Code · Lint the manifests.** Write a program that parses a multi-document YAML file and reports: Deployment selectors that do not match their pod template, Services whose selector matches no Deployment's pods, and Service `targetPort` names that no container port defines. Run it on a file with one of each bug.

**O2.7 · Medium · Concept · Which component failed?** For each symptom name the component responsible and the first command you would run: (a) pod `Pending` for ten minutes; (b) `ImagePullBackOff`; (c) pods `Running` and ready, but `curl http://meter-api` times out from another pod; (d) a Deployment was edited but no new ReplicaSet appeared; (e) `kubectl` returns `Forbidden`.

## Part 3: Releases, infrastructure as code, GitOps

**O3.1 · Medium · Code · Percentages in a rolling update.** A Deployment has 10 replicas with `maxSurge: 25%` and `maxUnavailable: 25%`. Kubernetes rounds surge up and unavailability down. How many pods can exist at most, how few can serve at least, and how long does the rollout take if a new pod takes 3 seconds to become ready? Compare with `maxSurge: 1, maxUnavailable: 0`.

**O3.2 · Easy · Numerical · Four HPA decisions.** Target CPU is 60% with 10% tolerance. What does the HPA recommend for (a) 4 replicas at 90%, (b) 6 replicas at 63%, (c) 10 replicas at 20%, (d) a requests-per-second metric of 1,800 rps total with a target of 150 rps per pod? In (c), when does the scale-down actually happen?

**O3.3 · Hard · Code · How long must a canary run?** The baseline error rate is 0.5%. You want to detect a rise to 0.75% with a one-sided test at α = 0.01 and 80% power. How many requests does each group need? With 2,000 rps total and a 5% canary, how long must the canary run? Repeat for a baseline of 0.1% rising to 0.15%, and check one case by simulation.

**O3.4 · Medium · Code · A flag bug.** A developer implements percentage rollouts with `hash(user_id) % 100 < percent` in Python. Show two problems: the result differs between processes, and every flag rolls out to the same users. Then fix both.

**O3.5 · Medium · Debug · Review this plan.** A pull request that "renames the database and tidies up" shows this plan. What would happen if it were applied, and what should the reviewer ask for?

```text
  # aws_db_instance.meter must be replaced
-/+ resource "aws_db_instance" "meter" {
      ~ identifier = "meter-prod" -> "meter-production"   # forces replacement
    }
  # aws_security_group_rule.db_ingress will be updated in-place
  ~ resource "aws_security_group_rule" "db_ingress" {
      ~ cidr_blocks = ["10.20.0.0/16"] -> ["0.0.0.0/0"]
    }
  # aws_s3_bucket.audit_logs will be destroyed
  - resource "aws_s3_bucket" "audit_logs" { ... }
Plan: 1 to add, 1 to change, 2 to destroy.
```

**O3.6 · Medium · Design · Promotion with GitOps.** Design how a change to the meter API moves from merge to production across dev, staging and production with Argo CD: repositories, what CI does, how each environment is promoted, how a rollback works, and where secrets come from.

## Part 4: Alerting, incidents and cloud

**O4.1 · Easy · Numerical · Burn-rate arithmetic.** The SLO is 99.9% over 30 days. (a) At a 0.5% error rate, what is the burn rate and when is the budget gone? (b) What fraction of the monthly budget does one hour at burn rate 14.4 use? (c) An incident burns at rate 20: how long until a 60-minute average crosses 14.4? (d) And a total outage?

**O4.2 · Medium · Code · The slow burn.** Implement an alert evaluator with two pairs of windows: fast (60 min and 5 min, threshold 14.4) and slow (360 min and 30 min, threshold 6). Run it on a day where the error rate is 0.05%, except for an 8-hour period at 0.7%. Which pair fires, and when?

**O4.3 · Easy · Numerical · CIDR questions.** (a) How many /24 subnets fit in a /16? (b) How many addresses are usable in a /27 on AWS? (c) Do 10.0.1.0/24 and 10.0.0.0/23 overlap? (d) What is the smallest subnet for 500 pod IPs on AWS? Check every answer with `ipaddress`.

**O4.4 · Medium · Code · IAM with conditions.** Extend the guide's policy evaluator with conditions: reads of `meter-reports/*` are allowed only from inside `10.20.0.0/16`, and every S3 action is denied when the request is not over TLS. Evaluate four requests that exercise each rule.

**O4.5 · Medium · Design · Surviving a zone failure.** The meter API runs as 3 replicas in one zone with a single-zone MySQL instance. Redesign it to survive the loss of any one availability zone with no manual action: compute, database, load balancing, capacity, and what the user sees during the failure.

**O4.6 · Hard · Design · An incident, minute by minute.** At 14:02 a deploy of meter-api finishes. At 14:09 the burn-rate alert pages. Error rate is 8% on `POST /readings`; the database looks healthy; the previous deploy was two days ago. Describe what you do in the first 15 minutes, who does what, and outline the postmortem.
