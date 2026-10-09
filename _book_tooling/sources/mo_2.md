# Chapter 5: Testing ML Systems
%Tests for data, features, training code and models: invariance, directional expectations, slices, quality gates and train/serve consistency

## 5.1 What to test

Ordinary unit tests check that code does what it says. ML systems need more, because a model can be "correct code" and still be wrong. A useful checklist (after Google's "ML Test Score" paper):

| Layer | Test | Example |
|---|---|---|
| Data | Schema and ranges (Chapter 3); no leakage between splits | No customer appears in both train and test; test dates after train dates |
| Features | Unit tests of feature code; train/serve consistency | The serving feature function returns exactly what the training pipeline computed |
| Training | Determinism; loss decreases; can overfit a tiny batch | Same seed gives the same model; training on 50 rows reaches near-zero loss |
| Model behaviour | **Invariance**: irrelevant changes do not change predictions | Changing the meter ID or the customer's name leaves the score unchanged |
| | **Directional expectations**: known effects point the right way | More complaints never lower churn risk, all else equal |
| | **Minimum functionality on slices** | AUC at least 0.7 for every region, not just on average |
| Quality gate | Beats a baseline and the current champion | Candidate AUC ≥ champion AUC − tolerance; better than a simple rule |
| Infrastructure | The model loads, serves within the latency budget, handles bad input | Request with a missing field returns an error, not a crash |

## 5.2 A test suite run with pytest

The program writes a small model and a test file, then runs pytest on it. One test is deliberately aimed at a classic bug: a serving function that forgets the scaling step used in training.

```python run Model tests, including one that catches a train/serve skew bug
import os, re, subprocess, sys, textwrap
os.makedirs('mltests', exist_ok=True)
open('mltests/churn_model.py', 'w').write(textwrap.dedent('''
    import numpy as np, pandas as pd
    from sklearn.linear_model import LogisticRegression
    from sklearn.pipeline import make_pipeline
    from sklearn.preprocessing import StandardScaler

    FEATURES = ['tickets', 'tenure', 'kwh']

    def make_data(n=4000, seed=0):
        rng = np.random.default_rng(seed)
        df = pd.DataFrame({'customer_id': np.arange(n),
                           'region': rng.choice(['north', 'south'], n),
                           'tickets': rng.poisson(1.5, n), 'tenure': rng.integers(1, 60, n),
                           'kwh': rng.gamma(2, 150, n)})
        logit = -1.5 + 0.6 * df.tickets - 0.04 * df.tenure
        df['churn'] = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)
        return df

    def train(df, seed=0):
        model = make_pipeline(StandardScaler(), LogisticRegression(random_state=seed))
        return model.fit(df[FEATURES], df.churn)

    def serve_features_buggy(model, df):
        """A hand-written serving path that skips the scaler (a real-world classic)."""
        clf = model.named_steps['logisticregression']
        return clf.predict_proba(df[FEATURES].to_numpy())[:, 1]
'''))
open('mltests/test_churn_model.py', 'w').write(textwrap.dedent('''
    import numpy as np, pytest
    from sklearn.metrics import roc_auc_score
    from churn_model import make_data, train, serve_features_buggy, FEATURES

    @pytest.fixture(scope='module')
    def setup():
        df = make_data()
        train_df, test_df = df.iloc[:3000], df.iloc[3000:]
        return train(train_df), train_df, test_df

    def test_no_customer_in_both_splits(setup):
        _, tr, te = setup
        assert set(tr.customer_id).isdisjoint(te.customer_id)

    def test_deterministic_training(setup):
        model, tr, te = setup
        again = train(tr)
        first, second = model.predict_proba(te[FEATURES]), again.predict_proba(te[FEATURES])
        assert np.allclose(first, second)

    def test_beats_baseline(setup):
        model, _, te = setup
        assert roc_auc_score(te.churn, model.predict_proba(te[FEATURES])[:, 1]) > 0.70

    def test_invariance_to_customer_id(setup):
        model, _, te = setup
        changed = te.assign(customer_id=te.customer_id + 10_000)
        before = model.predict_proba(te[FEATURES])
        after = model.predict_proba(changed[FEATURES])
        assert np.array_equal(before, after)

    def test_more_tickets_never_lowers_risk(setup):
        model, _, te = setup
        more = te.assign(tickets=te.tickets + 2)
        base = model.predict_proba(te[FEATURES])[:, 1]
        assert (model.predict_proba(more[FEATURES])[:, 1] >= base).all()

    @pytest.mark.parametrize('region', ['north', 'south'])
    def test_minimum_quality_per_region(setup, region):
        model, _, te = setup
        part = te[te.region == region]
        assert roc_auc_score(part.churn, model.predict_proba(part[FEATURES])[:, 1]) > 0.65

    def test_serving_matches_training(setup):
        model, _, te = setup
        expected = model.predict_proba(te[FEATURES])[:, 1]
        assert np.allclose(serve_features_buggy(model, te), expected, atol=1e-6)
'''))
result = subprocess.run([sys.executable, '-m', 'pytest', '-q', '-p', 'no:cacheprovider',
        '--tb=no',
                         '-rf', 'test_churn_model.py'], cwd='mltests', capture_output=True,
                                 text=True)
for line in result.stdout.splitlines():
    if line.strip():
        print(re.sub(r' in [\d.]+s', '', line))           # timings differ between runs
```

Seven of the eight tests pass, and the train/serve consistency test fails, catching the hand-written serving path that skips the scaler. That bug produces plausible-looking probabilities and no error, so without this test it would reach production. The fix is structural: serve the **same pipeline object** that was trained (or the same feature code, as a feature store does), never a re-implementation.

## 5.3 Where the tests run

| Stage | Tests | Blocks |
|---|---|---|
| Pull request (CI) | Unit tests of feature and training code on tiny fixtures; schema tests; lint | Merging |
| Pipeline run | Data validation; training sanity (loss decreases); evaluation, slices and quality gate | Registering the candidate |
| Pre-deployment | Behavioural tests (invariance, directional), latency and load tests, train/serve consistency | Promotion to champion |
| Production | Monitoring and alerts (Chapter 7), shadow and canary comparisons (Chapter 8) | Full rollout; triggers rollback |

## 5.4 Practical lessons

- Test data, features, training and model behaviour, not just code.
- Behavioural tests (invariance, direction, slices) encode domain knowledge the metric does not.
- Gate every candidate on a baseline, the champion, and per-slice minimums.
- Serve the exact trained pipeline; test train/serve consistency explicitly.

# Chapter 6: Serving and Optimising Models
%Batch, online and streaming inference, a validated FastAPI service, ONNX export, quantisation and latency

## 6.1 Choosing how to serve

| Mode | How | Good for | Watch out for |
|---|---|---|---|
| Batch | Score everything on a schedule; write results to a table | Daily churn scores, recommendations precomputed overnight | Stale predictions; wasted work for inactive users |
| Online (request/response) | A service scores each request in real time | Fraud checks at payment, search ranking | Latency budgets, availability, scaling |
| Streaming | Score events from a stream (Kafka) as they arrive | Anomaly detection on meter readings | Exactly-once semantics, state management |
| Edge / on-device | Model runs in the app or device | Offline use, privacy, very low latency | Model size, updates, hardware variety |

The ML System Design guide, Chapter 6, covers latency budgets, tail latency from fan-out and GPU batching; this chapter builds the service itself.

## 6.2 A validated prediction service

A good prediction API validates input against a schema, loads the model once at start-up (not per request), returns the model version with every prediction (so logs can be traced to a model), and exposes a health endpoint for the load balancer and Kubernetes probes.

```python run A FastAPI model service exercised with its test client
import warnings; warnings.filterwarnings('ignore')
import numpy as np
from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(120)
X = np.column_stack([rng.poisson(1.5, 3000), rng.integers(1, 60, 3000), rng.gamma(2, 150,
        3000)])
y = (rng.random(3000) < 1 / (1 + np.exp(-(-1.5 + 0.6 * X[:, 0] - 0.04 * X[:,
        1])))).astype(int)
# loaded once at start-up
MODEL = make_pipeline(StandardScaler(), LogisticRegression()).fit(X, y)
MODEL_VERSION = 'churn:7'

class Customer(BaseModel):
    tickets: int = Field(ge=0, le=100)
    tenure_months: int = Field(ge=0, le=600)
    monthly_kwh: float = Field(ge=0, le=10_000)

class Prediction(BaseModel):
    churn_probability: float
    model_version: str

app = FastAPI(title='churn-scorer')

@app.get('/health')
def health():
    return {'status': 'ok', 'model_version': MODEL_VERSION}

@app.post('/predict', response_model=Prediction)
def predict(c: Customer):
    p = MODEL.predict_proba([[c.tickets, c.tenure_months, c.monthly_kwh]])[0, 1]
    return Prediction(churn_probability=round(float(p), 4), model_version=MODEL_VERSION)

@app.post('/predict_batch', response_model=list[Prediction])
def predict_batch(customers: list[Customer]):
    rows = [[c.tickets, c.tenure_months, c.monthly_kwh] for c in customers]
    return [Prediction(churn_probability=round(float(p), 4), model_version=MODEL_VERSION)
            for p in MODEL.predict_proba(rows)[:, 1]]

client = TestClient(app)
print('GET /health  ->', client.get('/health').json())
r = client.post('/predict', json={'tickets': 4, 'tenure_months': 3, 'monthly_kwh': 310.5})
print('POST /predict ->', r.status_code, r.json())
bad = client.post('/predict', json={'tickets': -2, 'tenure_months': 3})
errors = [(e['loc'][-1], e['type']) for e in bad.json()['detail']]
print('invalid input ->', bad.status_code, errors)
batch = client.post('/predict_batch', json=[{'tickets': t, 'tenure_months': 24,
        'monthly_kwh': 300}
                                            for t in [0, 2, 6]])
print('batch        ->', [p['churn_probability'] for p in batch.json()])
```

Invalid input is rejected with HTTP 422 and a list of exactly which fields failed, before it reaches the model; the batch endpoint scores many rows in one vectorised call, which is far cheaper per prediction. In production the service runs under an ASGI server (uvicorn) in a container (the DevOps guide, Chapter 3) and loads the model from the registry by alias (`models:/churn@champion`, Chapter 2) at start-up.

## 6.3 ONNX: one portable, fast model format

**ONNX** (Open Neural Network Exchange) is a standard format for models. Exporting a scikit-learn, PyTorch or TensorFlow model to ONNX and running it with **onnxruntime** removes the training framework from the serving image, often speeds up inference, and lets the same model run on servers, browsers and phones. **Quantisation** stores weights as 8-bit integers instead of 32-bit floats, shrinking the model about four times and speeding up inference, usually with a negligible loss of accuracy; it must be checked, not assumed.

```python run Exporting to ONNX, quantising, and checking parity
import warnings, logging, os, time
warnings.filterwarnings('ignore'); logging.disable(logging.WARNING)
import numpy as np, onnxruntime as ort
from onnxruntime.quantization import quantize_dynamic, QuantType
from skl2onnx import to_onnx
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier

X, y = make_classification(n_samples=6000, n_features=20, n_informative=10,
        random_state=121)
X = X.astype(np.float32)
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3, random_state=0)
mlp = MLPClassifier((128, 64), max_iter=300, random_state=0).fit(Xtr, ytr)
onx = to_onnx(mlp, Xtr[:1], options={id(mlp): {'zipmap': False}})
open('mlp.onnx', 'wb').write(onx.SerializeToString())
quantize_dynamic('mlp.onnx', 'mlp_int8.onnx', weight_type=QuantType.QInt8)

opts = ort.SessionOptions(); opts.intra_op_num_threads = 1
sessions = {name: ort.InferenceSession(f, opts, providers=['CPUExecutionProvider'])
            for name, f in [('float32', 'mlp.onnx'), ('int8', 'mlp_int8.onnx')]}
p_sk = mlp.predict_proba(Xte)[:, 1]
for name, s in sessions.items():
    p = s.run(['probabilities'], {s.get_inputs()[0].name: Xte})[0][:, 1]
    size = os.path.getsize('mlp.onnx' if name == 'float32' else 'mlp_int8.onnx') / 1024
    print(f'ONNX {name}: {size:.1f} KB, max |p - sklearn p| {np.abs(p - p_sk).max():.4f}')
    print(f'  same class as sklearn {np.mean((p > 0.5) == (p_sk > 0.5)):.2%}, '
          f'accuracy {np.mean((p > 0.5) == yte):.4f}')
print(f'sklearn      : accuracy {np.mean((p_sk > 0.5) == yte):.4f}')

def per_call(fn, n=2000):
    t0 = time.perf_counter()
    for i in range(n):
        fn(Xte[i % len(Xte)][None, :])
    return (time.perf_counter() - t0) / n
s32 = sessions['float32']
t_sk = per_call(lambda row: mlp.predict_proba(row))
t_onnx = per_call(lambda row: s32.run(['probabilities'], {s32.get_inputs()[0].name: row}))
print(f'single-row latency: onnxruntime faster than scikit-learn: {t_onnx < t_sk}')
```

The float32 ONNX model reproduces scikit-learn's probabilities to rounding error. The int8 model is about a third of the size, with probabilities that move slightly and a handful of class flips; whether that is acceptable is decided by the same evaluation and slice tests as any new model version. For single-row requests, onnxruntime avoids most of scikit-learn's per-call Python overhead, which matters for online serving.

## 6.4 Making inference cheaper and faster

| Technique | Effect | Cost |
|---|---|---|
| Batching (server-side micro-batches) | Much higher throughput on GPUs and vectorised CPUs | Adds a few milliseconds of waiting |
| Caching predictions | Repeated inputs answered instantly | Staleness; memory |
| Precomputing (batch scoring) | No model in the request path | Freshness |
| Smaller models: distillation, pruning (Deep Learning guide, Chapter 13) | Lower latency and cost | Training effort; possible accuracy loss |
| Quantisation (int8, int4 for LLMs) | 2–4× smaller, faster | Accuracy must be re-checked |
| Compilers and runtimes (onnxruntime, TensorRT, OpenVINO) | Fused operations, hardware-specific kernels | Export compatibility |
| Right hardware | GPUs for large neural networks; CPUs often cheaper for trees and small models | Cost per prediction must be measured |

## 6.5 Practical lessons

- Prefer batch scoring when freshness allows; serve online only when the decision needs it.
- Validate inputs with a schema, load the model once, return the model version, expose health.
- Export to ONNX for portable, framework-free, fast serving; check parity after every export.
- Quantise and compress only with the same evaluation gates as any new model.
