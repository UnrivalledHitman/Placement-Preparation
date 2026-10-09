## Part 3 solutions

### P3.1 A safer batch endpoint

```python run Batch size limit and a model-version header
import warnings; warnings.filterwarnings('ignore')
import numpy as np
from fastapi import FastAPI, Response
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field
from sklearn.linear_model import LogisticRegression

rng = np.random.default_rng(160)
X = rng.normal(size=(2000, 3)); y = (X[:, 0] + rng.normal(size=2000) > 0).astype(int)
MODEL, VERSION = LogisticRegression().fit(X, y), 'churn:12'

class Row(BaseModel):
    features: list[float] = Field(min_length=3, max_length=3)

class Batch(BaseModel):
    rows: list[Row] = Field(min_length=1, max_length=100)

app = FastAPI()

@app.post('/predict_batch')
def predict_batch(batch: Batch, response: Response):
    response.headers['X-Model-Version'] = VERSION
    probs = MODEL.predict_proba([r.features for r in batch.rows])[:, 1]
    return {'probabilities': [round(float(p), 3) for p in probs]}

client = TestClient(app)
ok = client.post('/predict_batch', json={'rows': [{'features': [0.5, 0.1, -1.0]},
        {'features': [-1, 0, 0]}]})
print(ok.status_code, ok.headers['x-model-version'], ok.json())
too_big = client.post('/predict_batch', json={'rows': [{'features': [0, 0, 0]}] * 101})
print(too_big.status_code, too_big.json()['detail'][0]['type'])
wrong_shape = client.post('/predict_batch', json={'rows': [{'features': [1, 2]}]})
print(wrong_shape.status_code, wrong_shape.json()['detail'][0]['type'])
```

Limits on batch size protect the service from a single request consuming all its memory and time (a cheap denial of service); per-row shape validation stops malformed inputs reaching the model. Returning the version in a header lets clients and logs record which model produced each answer without changing the response body.

### P3.2 Exporting a whole pipeline to ONNX

```python run Pipeline export and parity
import warnings; warnings.filterwarnings('ignore')
import numpy as np, onnxruntime as ort
from skl2onnx import to_onnx
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(161)
X = np.column_stack([rng.poisson(1.5, 3000), rng.integers(1, 60, 3000), rng.gamma(2, 150,
        3000)]).astype(np.float32)
y = (rng.random(3000) < 1 / (1 + np.exp(-(-1.5 + 0.6 * X[:, 0] - 0.04 * X[:,
        1])))).astype(int)
pipe = make_pipeline(StandardScaler(), LogisticRegression()).fit(X, y)
onx = to_onnx(pipe, X[:1], options={id(pipe.steps[-1][1]): {'zipmap': False}})
sess = ort.InferenceSession(onx.SerializeToString(), providers=['CPUExecutionProvider'])
p_onnx = sess.run(['probabilities'], {sess.get_inputs()[0].name: X})[0][:, 1]
p_sk = pipe.predict_proba(X)[:, 1]
print(f'operators in the graph: {[n.op_type for n in onx.graph.node]}')
print(f'max probability difference: {np.abs(p_onnx - p_sk).max():.2e}')
```

The exported graph contains the scaling step (as a `Scaler` operator) followed by the linear classifier, so the serving side cannot forget or re-implement the preprocessing: the train/serve skew bug from the guide's Chapter 5 becomes impossible by construction. Exporting only the classifier would require every client to reproduce the scaler's means and standard deviations exactly.

### P3.3 Fan-out and the latency budget

P(slowest of n calls exceeds 20 ms) = 1 − 0.99<sup>n</sup>: **2.97%** with three services and **9.56%** with ten. The request's p99 is therefore not the services' p99: with ten parallel dependencies, almost one request in ten sees at least one slow call. Remedies: fewer dependencies in the critical path, caching features, timeouts with fallbacks (default feature values), and hedged requests for the slowest calls. The ML System Design guide, §6.3, simulates the same effect.

```python run Checking P3.3
import numpy as np
rng = np.random.default_rng(162)
for n in [3, 10]:
    slow = (rng.random((500_000, n)) < 0.01).any(axis=1).mean()
    print(f'{n:2} services: {slow:.2%} of requests wait > 20 ms (exact {1 - 0.99 ** n:.2%})')
```

### P3.4 How long until we know?

```python run Label-arrival quantiles and coverage over time
import numpy as np
mean_delay = 9.0
for q in [0.5, 0.8, 0.95]:
    print(f'{q:.0%} of labels known after {-mean_delay * np.log(1 - q):5.1f} days')
for d in [7, 14, 30]:
    print(f'coverage after {d:2} days: {1 - np.exp(-d / mean_delay):.0%}')
```

Half the labels for a prediction day are known within a week, but 95% take almost four weeks. A quality monitor computed early sees only the fastest labels, which are often **not** representative (customers who churn quickly differ from those who churn late), so early quality estimates are biased as well as noisy. Report label coverage alongside every quality number, compare like with like (each day's metric at the same label age), and use early proxy outcomes for faster, approximate alerts.

### P3.5 Automated shadow checks

```python run Flagging suspicious segments in shadow traffic
import numpy as np, pandas as pd
rng = np.random.default_rng(163)
n = 15000
df = pd.DataFrame({'segment': rng.choice(['android', 'ios', 'web', 'partner-api'], n,
        p=[0.45, 0.3, 0.2, 0.05]),
                   'risk': rng.beta(2, 8, n)})
df['champion'] = np.clip(df.risk + rng.normal(0, 0.03, n), 0, 1)
df['challenger'] = np.clip(df.risk + rng.normal(0, 0.03, n), 0, 1)
api = df.segment == 'partner-api'
# unit bug for one integration
df.loc[api, 'challenger'] = np.clip(df.loc[api, 'risk'] * 0.3, 0, 1)

def shadow_report(frame, threshold=0.3, min_agree=0.90, min_spread_ratio=0.5):
    rows = []
    for seg, g in frame.groupby('segment'):
        agree = ((g.champion > threshold) == (g.challenger > threshold)).mean()
        spread = g.challenger.std() / g.champion.std()
        flags = [f for f, bad in [('agreement', agree < min_agree), ('spread',
                spread < min_spread_ratio)] if bad]
        rows.append({'segment': seg, 'n': len(g), 'agreement': round(agree, 3),
                     'spread_ratio': round(spread, 2), 'flags': ', '.join(flags) or '-'})
    return pd.DataFrame(rows).set_index('segment')

print(shadow_report(df))
```

The partner integration (5% of traffic) sends values in different units, so the challenger's scores there are compressed: both its agreement with the champion and its score spread fall below the thresholds. Run this report automatically during every shadow phase and block promotion while any segment is flagged.

### P3.6 Rolling out a new fraud model

| Phase | Plan | Exit criterion |
|---|---|---|
| Offline | Backtest on recent months with the label delay respected; slice tests by merchant type, country, card type; cost-weighted metric (fraud losses + cost of false declines) | Beats the champion on cost; no slice worse than tolerance |
| Shadow (2 weeks) | Score all live transactions; log decisions; compare agreement and latency per segment | p99 latency within budget; no flagged segments; expected fraud catch and decline rate in range |
| Canary | 1% → 5% → 25% → 50% of transactions, a few days each, by card ID (stable assignment) | Guardrails hold at each stage |
| Guardrails | Decline rate (customer friction), manual-review queue size, chargeback rate as labels arrive, latency, error rate | Automatic rollback on breach |
| Rollback | Champion stays warm; routing switch plus registry alias | Seconds, no deploy |
| Long-term | 5% holdout on the old model for 3 months; compare chargebacks and losses once labels mature | Confirms the business effect |

Fraud has two traps worth naming in an interview: labels (chargebacks) arrive weeks later, so canary decisions rely on proxies such as decline rate and review outcomes; and fraudsters adapt to the model, so performance should be expected to decay and retraining planned from the start.

## Part 4 solutions

### P4.1 How many replicas?

Concurrency = 800 × 0.05 = 40 requests in flight; with 50% headroom, 60; at 8 per replica, ⌈60 / 8⌉ = **8 replicas**. Check that losing one replica (or a zone's share) still leaves enough capacity, and that the autoscaler's minimum is at least this number at peak hours.

### P4.2 When does adding GPUs stop paying?

Communication per step = 2(N − 1)/N × 1 GB / 5 GB/s = 0.4(N − 1)/N seconds; computation = 1/N seconds. Efficiency = (1/N) / (1/N + 0.4(N − 1)/N) = 1 / (1 + 0.4(N − 1)). It falls below 50% when 0.4(N − 1) > 1, that is **N ≥ 4** (efficiency 45%).

```python run Checking P4.2
for n in range(1, 9):
    eff = 1 / (1 + 0.4 * (n - 1))
    step = 1 / n + 0.4 * (n - 1) / n
    print(f'{n} GPUs: step {step:.3f} s, speed-up {1 / step:.2f}x, efficiency {eff:.0%}')
```

On this slow network, eight GPUs give a speed-up of barely 2.1×. Faster interconnects, gradient compression, overlapping communication with computation, or larger per-GPU batches change the picture.

### P4.3 The best checkpoint interval

Young's approximation gives τ ≈ √(2 × 0.05 h × 6 h) = √0.6 ≈ **0.77 hours** (about 46 minutes): checkpoint more often and the checkpoint overhead dominates; less often and interruptions waste more work.

```python run Simulated wall time for several checkpoint intervals
import numpy as np
rng = np.random.default_rng(164)
job, mtbf, ckpt_cost, restart = 40.0, 6.0, 0.05, 0.25

def wall_time(interval, trials=3000):
    total = 0.0
    for _ in range(trials):
        done, t = 0.0, 0.0
        while done < job and t < 1000:
            run = rng.exponential(mtbf)
            segment = interval + ckpt_cost   # work plus the checkpoint itself
            full = int(run // segment)
            remaining_segments = int(np.ceil((job - done) / interval))
            if full >= remaining_segments:
                t += remaining_segments * segment; done = job
            else:
                t += run + restart; done += full * interval
        total += t
    return total / trials

print(f"Young's interval: {np.sqrt(2 * ckpt_cost * mtbf):.2f} h")
for interval in [0.1, 0.25, 0.5, 0.77, 1.5, 3.0]:
    print(f'checkpoint every {interval:4} h: expected wall time {wall_time(interval):5.1f} '
            f'h')
```

The simulated optimum sits close to Young's estimate, and the curve is flat near it: anything between roughly half and double the optimal interval costs little extra. Very frequent checkpoints waste time writing; rare ones waste time redoing work.

### P4.4 Testing groundedness

```python run A citation and grounding check for RAG answers
import re
DOCS = {'BILL-0925': 'September bill: amount Rs 1,840.50, due 15 October 2026.',
        'TARIFF-STD': 'Standard plan: Rs 7.00 per kWh; fixed charge Rs 60 per month.'}
CASES = [{'q': 'How much is my September bill?', 'retrieved': ['BILL-0925'],
        'number': '1,840.50'},
         {'q': 'What is the standard tariff?', 'retrieved': ['TARIFF-STD'],
                 'number': '7.00'},
         {'q': 'What is the fixed charge?', 'retrieved': ['TARIFF-STD'], 'number': '60'}]

def stand_in(version, case):
    """Deterministic stand-in for an LLM; v1 sometimes cites nothing or invents a source."""
    if version == 'v2':
        return {'September': 'Your September bill is Rs 1,840.50 [doc:BILL-0925].',
                'tariff': 'The standard tariff is Rs 7.00 per kWh [doc:TARIFF-STD].',
                'fixed': 'The fixed charge is Rs 60 per month [doc:TARIFF-STD].'}[next(k
                        for k in
                ['September', 'tariff', 'fixed'] if k in case['q'])]
    return {'September': 'Your September bill is Rs 1,840.50.',
            'tariff': 'The standard tariff is Rs 7.00 per kWh [doc:TARIFF-STD].',
            'fixed': 'The fixed charge is Rs 75 per month [doc:TARIFF-2024].'}[next(k
                    for k in
            ['September', 'tariff', 'fixed'] if k in case['q'])]

def grounded(case, answer):
    cited = re.findall(r'\[doc:([A-Z0-9-]+)\]', answer)
    if not cited:
        return False, 'no citation'
    if any(c not in case['retrieved'] for c in cited):
        return False, 'cites a document that was not retrieved'
    if case['number'] not in answer or case['number'] not in ' '.join(DOCS[c]
            for c in cited):
        return False, 'number not supported by the cited document'
    return True, 'ok'

for version in ['v1', 'v2']:
    results = [grounded(c, stand_in(version, c)) for c in CASES]
    print(f'{version}: {sum(ok for ok, _ in results)}/{len(CASES)} grounded | ' +
          '; '.join(reason for _, reason in results))
```

Groundedness checks catch the two most damaging RAG failures: answers with no source (unverifiable) and answers citing sources that were never retrieved or that do not contain the claimed fact (hallucinated support). As in the guide, the stand-in function replaces the LLM only to make the example deterministic; the harness is what carries over to a real system.

### P4.5 Routing to a smaller model

All-large: cost **₹1.00** per request, accuracy **99%**. Routing: cost = 0.7 × 0.10 + 0.3 × 1.00 = **₹0.37** (63% cheaper); accuracy = 0.7 × 0.97 + 0.3 × 0.99 = **97.6%** (1.4 points lower). Whether that trade is acceptable depends on what an error costs: for FAQ answers probably yes, for billing disputes perhaps not. Two practical caveats: real routers misclassify some hard requests as easy (where the small model is right only 70% of the time), so measure the router's errors; and routing decisions should be evaluated on the same golden set as the models themselves.

```python run Checking P4.5, including an imperfect router
for router_miss in [0.0, 0.1]:   # share of hard requests wrongly sent to the small model
    cost = 0.7 * 0.10 + 0.3 * (router_miss * 0.10 + (1 - router_miss) * 1.00)
    acc = 0.7 * 0.97 + 0.3 * (router_miss * 0.70 + (1 - router_miss) * 0.99)
    print(f'router misses {router_miss:.0%} of hard requests: cost Rs {cost:.3f}, accuracy '
            f'{acc:.2%}')
```

### P4.6 An MLOps stack for a five-person team

| Need | Choice | Why |
|---|---|---|
| Tracking and registry | Managed MLflow (or the cloud's registry) | Standard, cheap, no server to run |
| Pipelines | The cloud's managed scheduler or a small managed Airflow; plain Python steps with cached outputs in object storage | Three models do not justify operating Kubeflow |
| Data validation | Pandera checks inside the pipeline steps | Code-level, versioned with the pipeline |
| Data versioning | Partitioned, immutable snapshots in object storage (or Delta/Iceberg tables) with the path logged per run | Lineage without new infrastructure |
| Batch serving | Pipeline step writing scores to the warehouse | Simplest, most robust |
| Online serving | FastAPI in a container on the cloud's managed container service, loading `@champion` | No Kubernetes to operate |
| Monitoring | Prediction logs to the warehouse; scheduled drift and quality queries; alerts through existing tools | Uses what the company already runs |
| Not yet | Feature store, Kubeflow, custom serving platform, real-time training | Each needs a platform team; revisit when model count or latency requirements grow |

The guiding principle: buy or reuse the undifferentiated parts, keep everything reproducible and observable, and add platform components only when a concrete pain (many models sharing features, strict latency, many teams) justifies operating them.
