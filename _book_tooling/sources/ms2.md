## Part 5 solutions

### M5.1 Latency budget

```python run Candidates that fit in the ranking budget
budget, network, features, rerank, slack = 200, 40, 25, 10, 30
ranking_ms = budget - network - features - rerank - slack
per_candidate = 0.15
one_core = int(ranking_ms / per_candidate)
print(f'ranking budget {ranking_ms} ms -> {one_core} candidates on 1 core')
print(f'4 cores in parallel -> about {int(4 * ranking_ms / per_candidate)} candidates '
      f'(before the cost of splitting and merging)')
```

300 candidates need 45 ms on one core, comfortably inside the 95 ms left for ranking. Parallel scoring across 4 cores raises the ceiling about fourfold, minus coordination overhead and with the tail-latency caveat of Chapter 6.3. Batched inference of all candidates in one call (vectorised) is usually faster than per-candidate calls, so measure the real cost per candidate in a batch.

### M5.2 Fan-out with deadlines

```python run Partial results after a 30 ms deadline
import numpy as np
rng = np.random.default_rng(2)
requests, shards, deadline = 20_000, 50, 30.0
lat = rng.lognormal(mean=np.log(8), sigma=0.5, size=(requests, shards))
full = lat.max(axis=1)
capped = np.minimum(full, deadline)
included = (lat <= deadline).mean(axis=1)
for name, x in (('wait for all:  ', full), ('30 ms deadline:', capped)):
    print(f'{name} p50 {np.percentile(x, 50):5.1f} ms, p99 {np.percentile(x, 99):5.1f} ms')
print(f'average share of shards included {included.mean():.2%}; '
      f'requests with every shard {np.mean(included == 1):.1%}')
```

The deadline caps the tail at 30 ms while the answer still contains more than 99% of shard results on average. For ranking, losing a few candidates out of thousands rarely matters; for a payment total it would be unacceptable, so partial results are a product decision, not just a latency trick.

### M5.3 Batch or online?

```python run Nightly batch cost
users, ms_per_user = 20_000_000, 2
core_hours = users * ms_per_user / 1000 / 3600
print(f'{core_hours:.1f} core-hours per night; on 32 cores about '
      f'{core_hours / 32 * 60:.0f} minutes')
```

About 11 core-hours: a 32-core machine finishes in roughly 20 minutes, cheap enough to run nightly. Batch suits daily tips because the inputs (yesterday's consumption, tomorrow's weather forecast) change daily. Switch to online scoring when the tip must react to something that happens during the day (a usage spike right now, the user opening the app during peak tariff hours), or when most users never open the app, which makes scoring all of them wasteful.

### M5.4 Prediction caching

```python run LRU hit rate for Zipf-distributed queries
import random
from collections import OrderedDict
rng = random.Random(5)
N, requests = 1_000_000, 400_000
weights = [1 / (i + 1) ** 1.0 for i in range(N)]
trace = rng.choices(range(N), weights=weights, k=requests)

def hit_rate(capacity):
    cache, hits = OrderedDict(), 0
    for q in trace:
        if q in cache:
            hits += 1; cache.move_to_end(q)
        else:
            cache[q] = True
            if len(cache) > capacity: cache.popitem(last=False)
    return hits / requests

for c in (1_000, 5_000, 20_000, 50_000):
    print(f'cache of {c:6,} entries ({c / N:5.1%} of queries): hit rate {hit_rate(c):5.1%}')
```

With Zipf-distributed queries a cache holding well under 1% of the distinct queries already serves about half of the requests, so caching model outputs for popular inputs is one of the cheapest latency and cost wins. Two conditions: the output must be valid for long enough (set a time-to-live that matches how fast the inputs change), and personalised outputs must be keyed by user, which lowers the hit rate.

## Part 6 solutions

### M6.1 PSI by hand

```python run Five-bin PSI
import math
e = [0.2] * 5
a = [0.10, 0.15, 0.20, 0.25, 0.30]
terms = [(ai - ei) * math.log(ai / ei) for ai, ei in zip(a, e)]
print('terms', [round(t, 4) for t in terms])
psi = sum(terms)
print(f'PSI {psi:.4f} ->', 'large' if psi > 0.25 else 'moderate' if psi > 0.1 else 'stable')
```

Every term is non-negative (the sign of `a − e` matches the sign of `ln(a / e)`), so shifts in different bins add up rather than cancel. The result is a moderate shift: worth investigating, not yet alarming on its own.

### M6.2 Which monitor fires?

| Incident | First monitor | Why |
|---|---|---|
| (a) Rupees to paise | Feature drift (and data-quality range checks) | The amount distribution jumps 100× overnight |
| (b) New fraud tactic with normal-looking inputs | Outcome metric (fraud rate of approvals, review hit rate) | Inputs barely move: concept drift (guide Chapter 7.3) |
| (c) Festival sale | Feature and score drift; business metrics also move | Expected shift; compare with last year's festival before retraining on it |
| (d) Feature store stops updating an aggregate | Data quality: freshness and staleness checks | The values may look plausible, just old |
| (e) Competitor launch, churn | Business metric | The model may be fine; the market changed |

### M6.3 Retraining cadence

```python run Average AUC over a year for three retraining intervals
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score

rng = np.random.default_rng(19)
weeks, per_week = 60, 4_000
def week_data(w):
    X = rng.normal(size=(per_week, 3))
    angle = w * 0.06                                     # the important direction rotates
    logit = -1 + 2.0 * (np.cos(angle) * X[:, 0] + np.sin(angle) * X[:, 1]) + 0.5 * X[:, 2]
    return X, (rng.random(per_week) < 1 / (1 + np.exp(-logit))).astype(int)
data = [week_data(w) for w in range(weeks)]
def train(last_week):
    Xs = np.vstack([data[w][0] for w in range(last_week - 7, last_week + 1)])
    ys = np.concatenate([data[w][1] for w in range(last_week - 7, last_week + 1)])
    return LogisticRegression().fit(Xs, ys)
for every in (1, 4, 12):
    aucs, model, trained_at = [], None, None
    for w in range(8, weeks - 1):
        if model is None or w - trained_at >= every:
            model, trained_at = train(w), w
        X, y = data[w + 1]                               # serve the following week
        aucs.append(roc_auc_score(y, model.predict_proba(X)[:, 1]))
    print(f'retrain every {every:2d} weeks: mean AUC {np.mean(aucs):.3f}, '
          f'worst week {np.min(aucs):.3f}, trainings {len(range(8, weeks - 1, every))}')
```

Frequent retraining keeps the AUC higher and, more importantly, raises the worst week, at the cost of more training runs. The right cadence is where the accuracy gained is worth the compute and the risk of each release; with a gate and automated checks (guide Chapter 7.4), weekly retraining is routine in fraud and ads.

## Part 7 solutions

Each design is graded with a 10-item rubric. A good answer does not need every item, but it covers the framework from clarification to monitoring and makes decisions with numbers.

### M7.1 Smart-meter anomaly detection

**Framing.** Rank meters by anomaly risk for a limited number of field inspections per day; few labels (past inspections) and many unlabelled readings. Start unsupervised, collect labels through inspections, move to supervised ranking.

| Component | Design |
|---|---|
| Data | 2 M meters × 96 readings/day ≈ 190 M readings/day (≈ 2 200/s); weather, tariff, holidays, meter metadata, inspection outcomes |
| Baselines | Rules: zero consumption while the account is active, reverse flow without solar, sudden permanent drop |
| Unsupervised model | Per-meter forecast of expected consumption (seasonal profile + weather), anomaly score = standardised residual over days; peer comparison against similar households on the same feeder |
| Supervised later | Gradient-boosted trees on residual features, ranked by P(confirmed issue) × recoverable revenue |
| Evaluation | Precision of inspections (hit rate), revenue recovered per inspection; time-based backtests on past inspections |
| Serving | Daily batch scoring; streaming rules for urgent events (tamper alarms, reverse flow) |
| Feedback loop | Inspections only happen where the model points: reserve 5–10% random inspections to estimate the miss rate and get unbiased labels |
| Monitoring | Data completeness per feeder (communication failures look like anomalies), score drift, hit rate by region |

| Rubric item | ✓ |
|---|---|
| 1. Decision framed as ranking under inspection capacity | |
| 2. Rules baseline | |
| 3. Unsupervised approach because labels are scarce | |
| 4. Expected-consumption model with weather and seasonality | |
| 5. Peer comparison on the same feeder | |
| 6. Labels from inspections; plan to go supervised | |
| 7. Metric: inspection hit rate and recovered revenue | |
| 8. Batch versus streaming split | |
| 9. Random inspections against feedback bias | |
| 10. Monitoring of data gaps versus real anomalies | |

### M7.2 Job recommendations

| Component | Design |
|---|---|
| Objective | Seekers get relevant jobs and responses; recruiters get qualified applicants. Optimise for P(apply) × P(recruiter positive response), not applications alone |
| Retrieval | Two-tower model on profile (skills, experience, location, salary) and job text embeddings; filters for location and eligibility; ~1 000 candidates |
| Ranking | Multi-task model: P(click), P(apply), P(shortlist); features: skill overlap, seniority match, distance, salary fit, job freshness, applicant count so far |
| Marketplace balance | Penalise jobs that already have many applicants (diminishing returns), boost fresh jobs, cap per-employer exposure |
| Cold start | New seekers: onboarding skills, résumé parsing; new jobs: text embeddings and an exploration slot |
| Metrics | Business: hires or interviews; proxies: applies with positive recruiter response; guardrails: applications per job concentration, seeker complaints |
| Fairness | Monitor exposure and response rates across groups; avoid proxies for protected attributes |
| Serving | Precomputed candidate sets refreshed hourly; online ranking at < 150 ms |
| Experiments | User-level A/B for seekers, but recruiter-side interference (competition for slots) suggests cluster randomisation by job market |

| Rubric item | ✓ |
|---|---|
| 1. Two-sided objective (seeker and recruiter) | |
| 2. Retrieve-then-rank with numbers | |
| 3. Recruiter response used as a label | |
| 4. Congestion control for popular jobs | |
| 5. Freshness and job expiry handled | |
| 6. Cold start for both sides | |
| 7. Fairness and exposure monitoring | |
| 8. Offline metrics tied to online outcomes | |
| 9. Interference considered in experiments | |
| 10. Latency budget and precomputation | |

### M7.3 Spam and abuse detection for a messaging app

| Component | Design |
|---|---|
| Levels | **Account** level (registration patterns, sending velocity, contact graph, reports) catches most spam without reading content; **message** level for what remains |
| Privacy | If messages are end-to-end encrypted, use metadata and on-device classifiers; user reports carry the content the user chooses to share |
| Features | Velocity (messages per minute to new contacts), fan-out to non-contacts, account age, device and IP reputation, graph features (many recipients who do not know each other), URL reputation |
| Models | Real-time rules for bursts; gradient-boosted trees for account risk; text classifier where content is available; graph-based clustering for coordinated campaigns |
| Actions | Graduated: rate-limit, warning, CAPTCHA, temporary suspension, ban; human review for appeals |
| Labels | User reports (noisy), confirmed bans, honeypot accounts; adversarial: spammers probe thresholds |
| Metrics | Spam messages received per 1 000 users (prevalence), false-positive suspensions (appeal success rate), time to detection |
| Serving | Streaming features (Flink) with sub-second decisions on sending velocity; batch graph analysis daily |
| Monitoring | Campaign detection dashboards, appeal rates by country and language (bias), drift as spammers adapt |

| Rubric item | ✓ |
|---|---|
| 1. Account-level versus message-level detection | |
| 2. Privacy constraints and on-device options | |
| 3. Velocity and graph features | |
| 4. Adversarial adaptation acknowledged | |
| 5. Graduated actions, not only bans | |
| 6. Appeals and human review | |
| 7. Prevalence metric, not just classifier accuracy | |
| 8. Streaming for bursts, batch for graphs | |
| 9. Label noise from user reports | |
| 10. Fairness across languages and regions | |

### M7.4 Household demand forecasting

| Component | Design |
|---|---|
| Output | Next-day hourly load for 10 000 feeders (240 000 numbers a day), as **quantiles** (P10, P50, P90), because purchase decisions depend on risk |
| Inputs | Historical load, weather forecast (temperature, humidity, cloud cover for solar), calendar (weekday, holidays, festivals), special events, outages |
| Models | Baselines: same hour last week, seasonal naive. Global gradient-boosted model across feeders with feeder embeddings or identifiers; quantile loss. Optionally a neural sequence model if it beats the boosted model in backtests |
| Hierarchy | Feeder forecasts should add up to substation and grid totals: reconcile (for example by forecasting totals separately and adjusting) |
| Evaluation | Rolling-origin backtests over at least a year; MAPE or WAPE for P50, pinball loss and coverage for quantiles; cost of purchasing errors |
| Weather uncertainty | Train with forecast weather, not actual weather (otherwise the model is too confident: leakage of future information) |
| Serving | Daily batch after the weather forecast arrives; intraday updates as actual load comes in |
| Monitoring | Error by feeder and by day type; drift from new solar installations or EV chargers; data gaps from failed meters |

| Rubric item | ✓ |
|---|---|
| 1. Quantile forecasts tied to purchase decisions | |
| 2. Naive seasonal baseline | |
| 3. Global model across feeders | |
| 4. Weather forecast used in training, not actuals | |
| 5. Holidays and festivals | |
| 6. Hierarchical consistency | |
| 7. Rolling-origin backtests | |
| 8. Metrics for both point and quantile forecasts | |
| 9. Rooftop solar and EV growth as structural drift | |
| 10. Missing-data handling | |

### M7.5 An evaluation platform for an LLM coding assistant

| Layer | Design |
|---|---|
| Offline golden sets | Curated tasks from real usage (with consent), each with **executable checks**: unit tests that the generated code must pass, compile and lint checks; categories by language and task type |
| Automatic judges | Tests pass rate is the primary metric where possible; an LLM judge for style and explanation quality, calibrated against human ratings on a sample |
| Human evaluation | Side-by-side comparisons by engineers on a stratified sample before each major change |
| Regression testing | Every change (model, prompt, retrieval index, tool) runs the full suite in CI; block releases on regressions per category, not just on the average |
| Online metrics | Suggestion acceptance rate, retention of accepted code after an hour (not deleted), edits after acceptance, latency, cost per active user |
| Experiments | A/B tests by user with guardrails on latency and error reports; interleaving for ranking suggestions |
| Safety | Secret and licence scanning of outputs; prompt-injection tests from repository content; telemetry privacy |
| Routing | Measure accuracy, cost and latency per route; account for the escalation tax when cascading small and large models (guide Chapter 9.2) |
| Observability | Trace every request with prompt version, model, retrieved context, tokens and latency |

| Rubric item | ✓ |
|---|---|
| 1. Executable checks as ground truth | |
| 2. Golden sets from real usage, by category | |
| 3. Calibrated LLM judge | |
| 4. Human side-by-side evaluation | |
| 5. CI regression gates per category | |
| 6. Online acceptance and retention metrics | |
| 7. Latency and cost tracked with quality | |
| 8. Safety scanning (secrets, licences, injection) | |
| 9. Routing with escalation tax measured | |
| 10. Versioned prompts and full tracing | |
