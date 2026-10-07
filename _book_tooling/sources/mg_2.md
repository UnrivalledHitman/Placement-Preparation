# Chapter 5: Online Experiments
%Sample size, significance, the peeking trap, sanity checks and alternatives to A/B tests

## 5.1 Why offline is not enough

Offline metrics are computed on logged data, which was shaped by the old system: users only clicked on what the old ranker showed them. A new model can only be judged fairly by showing it to real users. An **A/B test** randomly assigns users to control (old) and treatment (new) and compares the business metric. Randomisation by **user** (not by request) keeps each user's experience consistent and makes observations independent.

## 5.2 How many users?

The sample size per group for a difference in proportions, with significance level α (two-sided) and power 1 − β, is approximately

```text
n per group = (z(1−α/2) + z(1−β))² × [p1(1 − p1) + p2(1 − p2)] / (p2 − p1)²
```

```python run Sample size for a click-through-rate test
from statistics import NormalDist
z = NormalDist().inv_cdf
def n_per_group(p1, lift, alpha=0.05, power=0.8):
    p2 = p1 * (1 + lift)
    num = (z(1 - alpha / 2) + z(power)) ** 2 * (p1 * (1 - p1) + p2 * (1 - p2))
    return num / (p2 - p1) ** 2

base = 0.05                                      # 5% click-through rate today
for lift in (0.10, 0.05, 0.02, 0.01):
    n = n_per_group(base, lift)
    print(f'detect a {lift:4.0%} relative lift: {n:12,.0f} users per group, '
          f'{2 * n / 200_000:6.1f} days at 200,000 users/day')
```

Halving the effect you want to detect quadruples the sample size. Small relative lifts on small base rates need millions of users, which is why companies with little traffic test bold changes, and why choosing a sensitive metric (one with low variance, close to the change) matters as much as the model.

## 5.3 Reading the result

```python run A two-proportion z-test on one experiment
import numpy as np
from statistics import NormalDist

rng = np.random.default_rng(21)
n = 160_000                                       # per group
control = rng.random(n) < 0.0500
treatment = rng.random(n) < 0.0525                # true lift 5%
p1, p2 = control.mean(), treatment.mean()
pooled = (control.sum() + treatment.sum()) / (2 * n)
se = (pooled * (1 - pooled) * 2 / n) ** 0.5
zstat = (p2 - p1) / se
p_value = 2 * (1 - NormalDist().cdf(abs(zstat)))
se_diff = (p1 * (1 - p1) / n + p2 * (1 - p2) / n) ** 0.5
lo, hi = (p2 - p1) - 1.96 * se_diff, (p2 - p1) + 1.96 * se_diff
print(f'CTR control {p1:.4%}, treatment {p2:.4%}, relative lift {(p2 / p1 - 1):+.1%}')
print(f'z = {zstat:.2f}, p = {p_value:.4f}, 95% CI of the difference '
      f'[{lo:+.4%}, {hi:+.4%}]')
```

Report the effect with its **confidence interval**, not only "significant or not": the interval tells the business the plausible range of the gain. A p-value below 0.05 means that a difference this large would be unlikely if the treatment had no effect; it does not mean a 95% chance that the treatment is better.

## 5.4 The peeking problem

Checking the p-value every day and stopping as soon as it drops below 0.05 inflates the false-positive rate far above 5%, because random fluctuations cross the line at some point if you look often enough. The simulation runs 2 000 **A/A tests** (both groups identical, so every "win" is false) for 20 days.

```python run How daily peeking inflates false positives
import numpy as np
from statistics import NormalDist

rng = np.random.default_rng(9)
sims, days, per_day, p = 2_000, 20, 5_000, 0.05
crit = NormalDist().inv_cdf(0.975)
false_fixed = false_peek = 0
for _ in range(sims):
    a = rng.binomial(per_day, p, size=days).cumsum()      # cumulative clicks, group A
    b = rng.binomial(per_day, p, size=days).cumsum()
    n = per_day * np.arange(1, days + 1)
    pooled = (a + b) / (2 * n)
    z = (b / n - a / n) / np.sqrt(pooled * (1 - pooled) * 2 / n)
    false_peek += np.any(np.abs(z) > crit)                 # stop at the first "win"
    false_fixed += abs(z[-1]) > crit                       # look once, at the end
print(f'false-positive rate, one look at day 20:   {false_fixed / sims:.1%}')
print(f'false-positive rate, daily peeking:        {false_peek / sims:.1%}')
```

Looking once gives the promised 5%; peeking daily and stopping at the first significant day gives several times that. Fixes: decide the sample size in advance and look once; or use a method designed for continuous monitoring (sequential tests, alpha spending, always-valid p-values); or a Bayesian analysis with a decision rule fixed in advance.

## 5.5 Sanity checks and pitfalls

| Pitfall | Check or fix |
|---|---|
| **Sample ratio mismatch** (planned 50/50, observed 50.8/49.2) | Chi-square test on assignment counts; a mismatch means a bug (bots filtered in one arm, redirect failures); do not trust the result |
| Novelty and learning effects | Run at least 1–2 full weeks; compare the first days with the last |
| Many metrics, many variants | Expect false positives; pre-register the primary metric; correct for multiple comparisons |
| Network effects (marketplaces, social) | Randomise by cluster or region; switchback tests in time |
| Long-term effects (churn) | Long-running holdout group that never gets new models |

## 5.6 Interleaving for ranking

For rankers, **interleaving** is far more sensitive than an A/B test: each user sees one list that mixes results from rankers A and B (team-draft interleaving), and clicks are credited to the ranker that contributed the clicked item. Every user compares both rankers, which removes between-user variance; companies report needing one to two orders of magnitude fewer users. It answers "which ranker is preferred", not "how much revenue", so it is used to screen candidates before a full A/B test.

## 5.7 Practical lessons

- Randomise by user; compute the sample size before starting; run whole weeks.
- Report the confidence interval of the effect, not only the p-value.
- Never stop at the first significant day; use a fixed horizon or a sequential method.
- Check the sample ratio first: a mismatch invalidates everything else.

# Chapter 6: Serving
%Batch versus online inference, latency budgets, the tail-latency cost of fan-out, batching and caching

## 6.1 Batch, online or both

| Mode | How | Fits | Example |
|---|---|---|---|
| Batch (offline) | Score everything on a schedule; store results in a key-value store | Inputs known in advance; freshness of hours is acceptable | Daily churn scores; "recommended for you" email |
| Online (real time) | Score on request with fresh features | Inputs only known at request time; decisions in milliseconds | Fraud at checkout; search ranking |
| Hybrid | Precompute heavy parts (embeddings, candidate lists) in batch; rank online | Large catalogues with personalisation | Feed ranking: batch candidates + online ranker |
| Streaming | Score events as they arrive | Continuous signals | Smart-meter anomaly detection |

## 6.2 Latency budgets

Work backwards from the product requirement. A feed that must render in 200 ms at p99 might allocate:

| Stage | Budget (p99) | Notes |
|---|---|---|
| Network and API gateway | 30 ms | — |
| Candidate generation (several sources in parallel) | 30 ms | Approximate nearest-neighbour search, cached lists |
| Feature fetch (online store) | 20 ms | One batched lookup, not one per candidate |
| Ranking model on 500 candidates | 50 ms | Batched inference; small model or distilled |
| Re-ranking, business rules, diversity | 10 ms | — |
| Slack | 60 ms | Retries, garbage collection, growth |

## 6.3 Fan-out multiplies tail latency

A request that waits for **all** of *k* parallel calls is as slow as the slowest one. Even if each call is slow only 1% of the time, a request touching 100 shards hits at least one slow call 63% of the time (1 − 0.99<sup>100</sup>). The simulation draws per-call latencies from a long-tailed distribution and shows the request's p50 and p99 as the fan-out grows.

```python run The slowest of k calls
import numpy as np

rng = np.random.default_rng(2)
requests = 20_000
def call_latency(shape):                            # milliseconds, long-tailed
    return rng.lognormal(mean=np.log(8), sigma=0.5, size=shape)
single = call_latency(1_000_000)
s50, s99 = np.percentile(single, 50), np.percentile(single, 99)
print(f'one call: p50 {s50:5.1f} ms, p99 {s99:5.1f} ms')
results = []
for k in (1, 10, 50, 100, 300):
    req = call_latency((requests, k)).max(axis=1)
    p50, p99 = np.percentile(req, 50), np.percentile(req, 99)
    hedged = np.minimum(call_latency((requests, k)), 20 + call_latency((requests, k)))
    print(f'fan-out {k:3d}: request p50 {p50:5.1f} ms, p99 {p99:5.1f} ms | with hedging '
          f'after 20 ms: p99 {np.percentile(hedged.max(axis=1), 99):5.1f} ms')
    results.append((k, p50, p99))
ks, p50s, p99s = zip(*results)
plt.plot(ks, p50s, marker='o', label='request p50')
plt.plot(ks, p99s, marker='o', label='request p99')
plt.axhline(np.percentile(single, 99), ls='--', color='grey', label='single-call p99')
plt.xscale('log'); plt.xlabel('fan-out (parallel calls per request)'); plt.ylabel('ms')
plt.title('Waiting for the slowest of k calls'); plt.legend()
plt.tight_layout(); plt.savefig('mlsd_fanout.png', dpi=150)
```

![The request median quickly exceeds the single-call p99 as fan-out grows](figs/mlsd_fanout.png)

At a fan-out of 100, the **median** request is already slower than the single call's 99th percentile. Two standard mitigations: **hedged requests** (if a call has not answered after its typical latency, send a duplicate to another replica and take the first answer), which cuts the tail as the last column shows, at the cost of a few per cent extra load; and **partial results** (answer with the shards that responded within the deadline), which ranking systems can usually afford.

## 6.4 Batching and hardware

Model inference has a fixed cost per call (scheduling, kernel launches, network) plus a cost per item. Batching amortises the fixed cost, raising throughput, but each item waits for its batch, adding latency.

```python run Throughput and latency against batch size
fixed_ms, per_item_ms = 4.0, 0.05            # one GPU call: 4 ms overhead + 0.05 ms per item
arrival_per_s = 10_000                       # items arriving per second
print(' batch  call ms  items/s capacity  wait to fill ms  latency ms')
for b in (1, 8, 32, 128, 512):
    call = fixed_ms + per_item_ms * b
    capacity = b / call * 1000
    fill_wait = b / arrival_per_s * 1000 / 2              # average wait to fill a batch
    ok = 'ok' if capacity >= arrival_per_s else 'overloaded'
    latency = fill_wait + call
    print(f'{b:6d} {call:8.2f} {capacity:17,.0f} {fill_wait:16.2f} {latency:11.2f}  {ok}')
```

With a batch of 1, one accelerator handles only about 250 items per second, and the 10 000 arriving per second overwhelm it. A batch of 128 handles the load with a latency of about 17 ms; a batch of 512 adds throughput the service does not need and more than triples the latency, mostly time spent waiting for the batch to fill. The per-item cost also sets a ceiling: at 0.05 ms per item no batch size can exceed 20 000 items per second on one device, so beyond that you add replicas. Serving systems (Triton, TorchServe, vLLM) do this **dynamic batching** automatically, with a maximum wait time.

| Lever | Effect |
|---|---|
| Smaller model (distillation, pruning) | Lower latency and cost; small accuracy loss |
| Quantisation (FP16, INT8, 4-bit for LLMs) | 2–4× less memory and faster inference |
| Caching predictions | Popular queries, stable inputs (embeddings of items) |
| Two-stage models | Cheap model filters, expensive model ranks a few hundred (Chapter 8) |
| Fallbacks | If the model times out, serve a cached or rule-based answer; never fail the page |

## 6.5 Practical lessons

- Choose batch, online or hybrid from the freshness each input needs.
- Write a latency budget per stage with p99 numbers, and leave slack.
- Fan-out turns rare slow calls into common slow requests; hedge, use deadlines, return partial results.
- Batch inference for throughput; cap the batching wait for latency.

# Chapter 7: Monitoring and Retraining
%Data drift, concept drift, feedback loops and when to retrain

## 7.1 What can go wrong after launch

| Problem | Example | Detected by |
|---|---|---|
| Data pipeline bug | A feature becomes all zeros after a schema change | Feature null rates and distributions |
| Training/serving skew | Chapter 3.3 | Served versus training distributions |
| **Data drift** (input distribution changes) | New user segment after a marketing campaign | PSI, KS test on features and scores |
| **Concept drift** (relationship changes) | Fraudsters change tactics; the same features now mean something else | Label-based metrics once labels arrive; proxy metrics before |
| Feedback loops | The recommender only learns from what it showed | Exploration traffic; monitoring catalogue coverage |

## 7.2 Measuring data drift

The **Population Stability Index** compares the distribution of a feature (or of the model score) in production with a reference, over bins defined on the reference:

```text
PSI = Σ over bins (actual% − expected%) × ln(actual% / expected%)
rule of thumb:  < 0.1 stable,  0.1–0.25 moderate shift,  > 0.25 large shift: investigate
```

The **Kolmogorov–Smirnov** statistic is the largest vertical gap between the two cumulative distributions; with large samples, even tiny shifts become "significant", so judge the size of the statistic rather than its p-value.

```python run Weekly PSI and KS for a drifting feature
import numpy as np

rng = np.random.default_rng(12)
ref = rng.lognormal(7.0, 0.5, 50_000)           # transaction amounts at training time
edges = np.quantile(ref, np.linspace(0, 1, 11))
edges[0], edges[-1] = -np.inf, np.inf

def psi(ref, cur):
    e = np.histogram(ref, edges)[0] / len(ref)
    a = np.histogram(cur, edges)[0] / len(cur)
    a = np.clip(a, 1e-6, None)
    return float(np.sum((a - e) * np.log(a / e)))
def ks(ref, cur):
    grid = np.sort(np.concatenate([ref, cur]))
    return float(np.max(np.abs(np.searchsorted(np.sort(ref), grid, 'right') / len(ref)
                               - np.searchsorted(np.sort(cur), grid, 'right') / len(cur))))

weeks, psis = range(13), []
for w in weeks:
    shift = 0.0 if w < 6 else 0.04 * (w - 5)              # inflation-like drift from week 6
    cur = rng.lognormal(7.0 + shift, 0.5 + 0.01 * max(0, w - 5), 20_000)
    psis.append(psi(ref, cur))
    flag = 'large' if psis[-1] > 0.25 else 'moderate' if psis[-1] > 0.1 else ''
    print(f'week {w:2d}: PSI {psis[-1]:.3f}  KS {ks(ref, cur):.3f}  {flag}')
plt.plot(list(weeks), psis, marker='o')
plt.axhline(0.1, ls='--', color='orange', label='0.1 moderate')
plt.axhline(0.25, ls='--', color='red', label='0.25 large')
plt.xlabel('week after launch'); plt.ylabel('PSI'); plt.title('Feature drift: amount')
plt.legend(); plt.tight_layout(); plt.savefig('mlsd_psi.png', dpi=150)
```

![PSI stays near zero until the shift starts, then crosses the alert thresholds](figs/mlsd_psi.png)

## 7.3 Concept drift hides from input monitoring

If fraudsters change tactics while customers keep behaving as before, the inputs do not move at all. PSI stays flat; only the outcome changes. The simulation keeps the feature distributions fixed and reverses part of the relationship between one feature and fraud.

```python run Inputs unchanged, accuracy falling
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score

rng = np.random.default_rng(13)
def week(n, flip):
    X = rng.normal(size=(n, 3))
    w1 = 1.2 * (1 - 2 * flip)                       # the effect of feature 1 reverses
    logit = -2.5 + 1.0 * X[:, 0] + w1 * X[:, 1]
    return X, (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)
X0, y0 = week(30_000, 0.0)
model = LogisticRegression().fit(X0, y0)
for wk, flip in enumerate((0.0, 0.0, 0.2, 0.4, 0.6, 0.8)):
    X, y = week(30_000, flip)
    shift = np.abs(X.mean(axis=0) - X0.mean(axis=0)).max()
    p = model.predict_proba(X)[:, 1]
    print(f'week {wk}: max feature-mean shift {shift:.3f}  score mean {p.mean():.3f}  '
          f'fraud rate {y.mean():.3f}  AUC {roc_auc_score(y, p):.3f}')
```

The feature means do not move, and the mean score barely moves, while the AUC falls week after week. Input monitoring cannot see concept drift; you need **outcome monitoring**: the label-based metric as soon as labels arrive, plus fast proxies (chargeback reports, manual-review hit rate, customer complaints) in the meantime.

## 7.4 When to retrain

| Strategy | When it fits | Risk |
|---|---|---|
| Scheduled (daily, weekly) | Steady drift, cheap training | Retrains when not needed; still too slow for sudden shifts |
| Triggered by drift or metric drop | Expensive training, irregular change | Needs reliable monitors and thresholds |
| Continuous / online learning | Fast-changing domains (ads, news) | Harder to validate; feedback loops |
| Always with a gate | Every strategy | The new model must beat the current one on a recent time-based holdout before rollout (shadow or canary first) |

> TRAP: Automatic retraining without an evaluation gate can **lock in a bug**: a broken feature pipeline produces bad data, the model retrains on it, and the bad model ships with a green dashboard. Every retrain should pass the same offline checks as a hand-built model, then a shadow or canary phase.

## 7.5 Practical lessons

- Monitor four layers: data quality, feature and score distributions, model metrics when labels arrive, business metrics.
- PSI and KS catch input drift; only outcome metrics catch concept drift.
- Retrain on a schedule or a trigger, but always behind an evaluation gate and a canary.
