# Chapter 7: Monitoring Models in Production
%What to watch at each layer, prediction logs and delayed labels, and why input drift alone misses concept drift

## 7.1 Five layers of monitoring

| Layer | Signals | Detects |
|---|---|---|
| Service | Latency percentiles, error rate, throughput, saturation (DevOps guide, Chapter 8) | Outages, overload, bad deploys |
| Data | Schema violations, null rates, feature drift (PSI), freshness | Broken pipelines, upstream changes |
| Predictions | Score distribution, share of each class, confidence | Model or feature bugs, shifts in the population |
| Model quality | AUC, precision, calibration, error, computed once labels arrive | Concept drift: the world changed |
| Business | Conversion, fraud losses, revenue per user | Whether the model still creates value |

The ML System Design guide, Chapter 7, defines drift measures and retraining policies. This chapter is about wiring them into a system and about the hardest practical problem: **labels arrive late**.

## 7.2 Prediction logs and delayed labels

Every prediction should be logged with a request ID, timestamp, model version, the features actually used, and the output. When the outcome becomes known (a customer churns or not after 30 days; a transaction is confirmed as fraud weeks later), it is joined back by request ID, and quality metrics are computed per day, per model version and per segment. Until then, only proxies are available: input drift and prediction drift.

The simulation runs a churn model for 120 days. On day 60, customer behaviour changes: the **relationship** between complaints and churn weakens (concept drift), while the input distributions stay the same. Labels arrive 30 days after each prediction.

```python run Input drift, prediction drift and delayed accuracy around a concept change
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
rng = np.random.default_rng(130)

def day_data(day, n=800):
    tickets = rng.poisson(1.5, n); tenure = rng.integers(1, 60, n)
    effect = 0.7 if day < 60 else 0.1   # complaints stop predicting churn
    logit = -1.5 + effect * tickets - 0.03 * tenure + (0.0 if day < 60
            else 0.6 * (tenure < 6))
    churn = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)
    return np.column_stack([tickets, tenure]), churn

X0, y0 = day_data(0, 5000)
model = LogisticRegression().fit(X0, y0)
ref_scores = model.predict_proba(X0)[:, 1]

def psi(ref, new, bins=10):
    edges = np.quantile(ref, np.linspace(0, 1, bins
            + 1)); edges[0], edges[-1] = -np.inf, np.inf
    r = np.clip(np.histogram(ref, edges)[0] / len(ref), 1e-6, None)
    n = np.clip(np.histogram(new, edges)[0] / len(new), 1e-6, None)
    return float(np.sum((n - r) * np.log(n / r)))

log = {}
for day in range(120):
    X, y = day_data(day)
    s = model.predict_proba(X)[:, 1]
    log[day] = dict(input_psi=psi(X0[:, 0], X[:, 0]), score_psi=psi(ref_scores, s),
            auc=roc_auc_score(y, s))
label_delay = 30
first_alert = {}
for day in range(120):
    if 'input' not in first_alert and log[day]['input_psi'] > 0.2: first_alert['input'] = day
    if 'scores' not in first_alert and log[day]['score_psi'] > 0.2:
        first_alert['scores'] = day
    seen = day - label_delay   # labels known up to this prediction day
    if seen >= 6 and 'auc' not in first_alert:
        week_auc = np.mean([log[d]['auc'] for d in range(seen - 6, seen + 1)])
        if week_auc < 0.70: first_alert['auc'] = day
for d in [30, 59, 60, 75, 90, 119]:
    print(f'day {d:3}: input PSI {log[d]["input_psi"]:.3f}  score PSI '
            f'{log[d]["score_psi"]:.3f}  '
          f'true AUC that day {log[d]["auc"]:.3f}')
print('first alert by monitor:', {k: first_alert.get(k, 'never') for k in ['input',
        'scores', 'auc']})
```

Input drift never fires: the customers look exactly the same. The score distribution does not move either, because the model sees the same inputs. The model's real quality collapses on day 60, but the delayed-label monitor can only confirm it about 30 days later, once a week of labelled outcomes from after the change has arrived. Monitoring inputs and predictions is necessary but not sufficient; the defences against concept drift are shorter label delays (early proxy labels such as "no login for 14 days"), business metrics that react faster, and regular retraining.

## 7.3 Designing monitors that people trust

| Practice | Why |
|---|---|
| Alert on a few symptoms (quality drop, business KPI, error rate); dashboard the rest | Feature-drift alerts on hundreds of columns produce noise that teams learn to ignore |
| Compare like with like (same weekday, same segment mix) | Seasonality and traffic mix trigger false drift alarms |
| Monitor per segment and per model version | Averages hide a failing region or a bad rollout |
| Track label delay and label coverage | A quality metric on 5% of labels may be biased |
| Link each alert to a runbook: retrain, roll back, or investigate data | Monitoring without an action plan only produces stress |

## 7.4 Practical lessons

- Monitor service, data, predictions, model quality and business outcomes.
- Log every prediction with model version and features; join labels when they arrive.
- Input and prediction drift cannot see concept drift; shorten label delay and watch business metrics.
- Alert on few, actionable symptoms, segmented by model version and population.

# Chapter 8: Safe Rollouts for Models
%Offline evaluation, shadow mode, canaries with automatic rollback, champion and challenger, and fast rollback

## 8.1 The ladder of confidence

A new model version climbs a ladder; each rung catches problems the previous one cannot.

| Rung | What it proves | What it cannot prove |
|---|---|---|
| Offline evaluation and tests (Chapter 5) | Better on historical data; behaves sensibly | Behaviour on live traffic, latency, integration |
| Shadow mode | Runs on real traffic, without affecting users; compares outputs and latency with the champion | Effect on user behaviour |
| Canary | Serves a small share of users; guardrails (errors, latency, business) watched | Small effects (too little traffic for significance) |
| A/B test | Causal effect on the business metric | Long-term effects (use a holdout) |
| Full rollout with monitoring | Works at full scale | Nothing new; keep monitoring |

## 8.2 Shadow mode

In shadow mode, the serving layer sends each request to the champion (whose answer is returned) and asynchronously to the challenger (whose answer is only logged). Comparing the two on identical traffic finds bugs that offline tests miss: a feature missing in production, a different encoding, a latency problem.

```python run A shadow comparison finds a segment where the challenger misbehaves
import numpy as np, pandas as pd
rng = np.random.default_rng(131)
n = 20000
traffic = pd.DataFrame({'platform': rng.choice(['android', 'ios', 'web'], n, p=[0.5, 0.3,
        0.2]),
                        'risk': rng.beta(2, 8, n)})
champion = np.clip(traffic.risk + rng.normal(0, 0.03, n), 0, 1)
challenger = np.clip(traffic.risk + rng.normal(0, 0.025, n), 0, 1)
web = traffic.platform.eq('web').to_numpy()
challenger[web] = 0.02   # web requests lack a feature in production: near-constant output
lat_champ = rng.gamma(4, 3, n); lat_chall = rng.gamma(4, 3.6, n)
traffic['agree'] = (champion > 0.3) == (challenger > 0.3)
traffic['abs_diff'] = np.abs(champion - challenger)
print(f'overall decision agreement {traffic.agree.mean():.1%}, mean |score diff| '
        f'{traffic.abs_diff.mean():.3f}')
print(traffic.groupby('platform')[['agree', 'abs_diff']].mean().round(3))
print(f'p99 latency: champion {np.percentile(lat_champ, 99):.0f} ms, challenger '
        f'{np.percentile(lat_chall, 99):.0f} ms')
print(f'challenger score std on web: {challenger[web].std():.3f} (champion '
        f'{champion[web].std():.3f})')
```

Overall agreement looks high, because web is only a fifth of traffic and most customers are low risk anyway. The per-platform breakdown exposes the problem: on web, the challenger's scores barely vary, which is the signature of a missing or constant feature. Shadow mode also shows the challenger is slower at the tail, which may break the latency budget. Neither problem harmed a single user.

## 8.3 Canary with automatic rollback

A canary routes a growing share of real traffic to the new model in stages and checks guardrails at each stage, rolling back automatically if any is breached. The DevOps guide, §5.4, shows how to compare error rates statistically; here the rollout controller itself is simulated.

```python run A staged model rollout that rolls itself back
import numpy as np
rng = np.random.default_rng(132)
stages = [0.01, 0.05, 0.25, 0.50, 1.00]
guardrails = {'error_rate': 0.005, 'p99_ms': 120, 'approval_rate_drop': 0.03}

def observe(share, bad_model):
    requests = int(200_000 * share)
    errors = rng.binomial(requests, 0.009 if bad_model else 0.002)
    return {'error_rate': errors / requests,
            'p99_ms': rng.normal(95 if not bad_model else 105, 4),
            'approval_rate_drop': rng.normal(0.045 if bad_model else 0.0, 0.004)}

def rollout(bad_model):
    for share in stages:
        m = observe(share, bad_model)
        breached = [k for k, limit in guardrails.items() if m[k] > limit]
        status = 'ROLLBACK (' + ', '.join(breached) + ')' if breached else 'ok'
        print(f'  {share:5.0%}: errors {m["error_rate"]:.4f}, p99 {m["p99_ms"]:.0f} ms, '
              f'approval drop {m["approval_rate_drop"]:+.3f}')
        print(f'         -> {status}')
        if breached:
            return f'rolled back at {share:.0%}; champion alias restored'
    return 'promoted to 100%'

for name, bad in [('good challenger', False), ('bad challenger', True)]:
    print(name + ':')
    print('  result:', rollout(bad))
```

Rollback must be fast and boring: the champion stays deployed and warm during the canary, so rolling back is a routing change plus moving the registry alias (Chapter 2), with no rebuild. Business guardrails (here the loan approval rate) matter as much as technical ones: a model can be fast and error-free and still make worse decisions.

## 8.4 Champion and challenger over time

| Pattern | How | Use |
|---|---|---|
| Champion / challenger | A small permanent share of traffic goes to the challenger; it replaces the champion when it wins | Continuous improvement in credit, fraud and pricing |
| Interleaving | Mix results of two rankers in one list; see which items users pick (ML System Design, §5.6) | Fast comparison of rankers with little traffic |
| Long-term holdout | A small group stays on the old model (or no model) for months | Measures long-term and cumulative effects |
| Multi-armed bandits | Shift traffic towards the better model as evidence accumulates | When regret during the test matters more than a clean estimate |

## 8.5 Practical lessons

- Climb the ladder: offline tests, shadow, canary, A/B test, monitored rollout.
- Shadow mode compares on identical traffic; break comparisons down by segment.
- Canary in stages with technical and business guardrails and automatic rollback.
- Keep the champion warm and roll back by moving the registry alias.

# Chapter 9: Scaling and Cost
%Sizing model servers, the limits of distributed training, and spot instances with checkpointing

## 9.1 Sizing an online model service

Little's law (the DevOps and Concurrency guides) sizes the fleet: concurrent requests = throughput × latency. Each replica handles a fixed number of concurrent requests, so replicas = peak concurrency / per-replica capacity, plus headroom for failures and spikes.

```python run Replicas and cost per million predictions for three serving options
import math
peak_rps, headroom = 1200, 1.5
# latency per request (s), concurrent requests per replica, cost per replica-hour (Rs)
options = {
    'CPU, sklearn model': (0.025, 4, 9),
    'CPU, ONNX int8': (0.008, 4, 9),
    'GPU, batched neural net': (0.040, 64, 110),
}
for name, (latency, per_replica, hourly) in options.items():
    concurrency = peak_rps * latency
    replicas = math.ceil(concurrency * headroom / per_replica)
    per_million = replicas * hourly / (peak_rps * 3600) * 1e6
    print(f'{name:24} concurrency {concurrency:4.1f} -> {replicas:2} replicas')
    daily = replicas * hourly * 24
    print(f'{"":24} Rs {daily:,.0f}/day, Rs {per_million:.1f} per million at peak')
```

Faster inference (Chapter 6) directly reduces replicas. GPUs pay off when the model is large enough and requests can be batched; for small tabular models, CPU serving is usually much cheaper per prediction. These prices are illustrative; measure your own latency and capacity under load before deciding.

## 9.2 Distributed training does not scale perfectly

**Data parallelism** gives each of N GPUs a slice of every batch; after each step, the gradients are averaged across GPUs (all-reduce). Computation shrinks as 1/N, but communication does not: ring all-reduce sends about 2(N − 1)/N times the model size per GPU per step, so with slow interconnects and large models, adding GPUs stops helping. **Model and pipeline parallelism** (and FSDP/ZeRO, which shard optimiser state) handle models too big for one GPU, at further communication cost.

```python run Speed-up of data-parallel training with communication overhead
compute_s = 2.0                                   # one step on one GPU
model_gb = 2.0                                    # gradients exchanged per step
for name, gbps in [('fast interconnect (NVLink-class, 200 GB/s)', 200),
        ('ordinary network (10 GB/s)', 10)]:
    print(name)
    for n in [1, 2, 4, 8, 16, 32]:
        comm = 0 if n == 1 else 2 * (n - 1) / n * model_gb / gbps
        step = compute_s / n + comm
        print(f'  {n:2} GPUs: step {step:5.3f} s, speed-up {compute_s / step:5.1f}x, '
              f'efficiency {compute_s / step / n:4.0%}')
```

On a fast interconnect, 32 GPUs give a large speed-up; on an ordinary network, communication dominates beyond a handful of GPUs, and extra GPUs mostly wait. Real systems overlap communication with computation, compress gradients and use larger batches to shift this balance, but the shape of the curve remains.

## 9.3 Spot instances and checkpointing

Spot (pre-emptible) instances cost far less than on-demand ones but can be reclaimed at short notice. Training survives interruptions by **checkpointing** regularly and resuming from the last checkpoint; the cost is the work lost since that checkpoint plus restart time.

```python run Expected cost of a 40-hour training job on spot versus on-demand
import numpy as np
rng = np.random.default_rng(133)
job_hours, on_demand, spot = 40, 300, 90          # Rs per GPU-hour
interrupt_rate = 1 / 6   # one interruption every 6 hours on average
restart_hours = 0.25

def simulate(checkpoint_every, trials=3000):
    hours = []
    for _ in range(trials):
        done, elapsed = 0.0, 0.0
        while done < job_hours and elapsed < 1000:
            run = rng.exponential(1 / interrupt_rate)
            remaining = job_hours - done
            if run >= remaining:
                elapsed += remaining; done = job_hours
            else:
                elapsed += run + restart_hours
                # work since last checkpoint lost
                done += np.floor(run / checkpoint_every) * checkpoint_every
        hours.append(elapsed)
    return np.mean(hours)

print(f'on-demand: {job_hours} h, Rs {job_hours * on_demand:,}')
for ckpt in [8.0, 2.0, 0.5]:
    h = simulate(ckpt)
    print(f'spot, checkpoint every {ckpt:3} h: {h:6.1f} h wall time, Rs {h * spot:7,.0f}')
```

Without frequent checkpoints, each interruption wastes hours of work: with 8-hour checkpoints the job takes more than twice as long as on-demand (still cheaper, but often too slow); with checkpoints every 30 minutes, spot capacity finishes in little more than the on-demand time at a fraction of the cost. Checkpoints must include the optimiser state, the learning-rate schedule position and the data-loader position, or resumed training is not equivalent.

## 9.4 Practical lessons

- Size serving with Little's law plus headroom; faster inference means fewer replicas.
- Choose CPU or GPU by measured cost per prediction, not by default.
- Data parallelism is limited by communication; mind the interconnect.
- Spot instances with frequent, complete checkpoints cut training cost sharply.
