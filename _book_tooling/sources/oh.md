# Hints
%Read only the hint for the exercise you are stuck on

## Part 1 hints

| Exercise | Hint |
|---|---|
| O1.1 | Frequency = deploys / days; failure rate = failures / deploys; the median of six values is the mean of the middle two |
| O1.2 | Lead time = WIP / throughput |
| O1.3 | finish(step) = duration + max(finish of dependencies); recompute after each change and see which chain is now longest |
| O1.4 | P(red) = 1 − (1 − p)<sup>n</sup>; with one retry a test fails only if both runs fail, p<sup>2</sup> |
| O1.5 | The best possible wall time is at least max(total / runners, longest test) |
| O1.6 | Who controls when users get the new version? Can you deploy twice a day? |

## Part 2 hints

| Exercise | Hint |
|---|---|
| O2.1 | Go line by line: cache order, separate `update`, tag `latest`, root user, secret in a layer, shell-form `CMD` |
| O2.2 | The first instruction whose inputs change, and everything after it, reruns |
| O2.3 | Fit = min(⌊free CPU / CPU request⌋, ⌊free memory / memory request⌋) |
| O2.4 | The heap is only part of a JVM's memory; the limit covers all of it |
| O2.5 | Liveness kills at initialDelay + (threshold − 1) × period |
| O2.6 | A selector matches when every key-value pair in it appears in the labels |
| O2.7 | Scheduler, kubelet and registry, Service and endpoints, controller manager, API server and RBAC |

## Part 3 hints

| Exercise | Hint |
|---|---|
| O3.1 | Surge = ⌈25% × 10⌉, unavailable = ⌊25% × 10⌋ |
| O3.2 | ceil(replicas × current / target), unless within 10% of the target |
| O3.3 | n = (z<sub>α</sub> + z<sub>β</sub>)<sup>2</sup> × (p<sub>1</sub>(1 − p<sub>1</sub>) + p<sub>2</sub>(1 − p<sub>2</sub>)) / (p<sub>2</sub> − p<sub>1</sub>)<sup>2</sup> |
| O3.4 | Python randomises `hash()` of strings per process unless `PYTHONHASHSEED` is fixed |
| O3.5 | Look for "must be replaced", destroys and anything opened to `0.0.0.0/0` |
| O3.6 | Separate the application repository from a configuration repository; promotion is a commit |

## Part 4 hints

| Exercise | Hint |
|---|---|
| O4.1 | Burn rate = error rate / (1 − SLO); budget lasts 30 days / burn rate |
| O4.2 | A pair fires when both of its windows exceed its threshold |
| O4.3 | A /n has 2<sup>32 − n</sup> addresses; AWS reserves 5 per subnet |
| O4.4 | Evaluate explicit denies first, then look for an allow whose conditions all hold |
| O4.5 | Every tier must exist in every zone, with enough spare capacity in the survivors |
| O4.6 | Mitigate first: what changed most recently? |
