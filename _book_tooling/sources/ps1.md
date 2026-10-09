# Solutions
%Every program executed with a fresh store and fixed seeds

## Part 1 solutions

### P1.1 The reproducibility checklist

| Item | Where it lives |
|---|---|
| Training code at an exact commit (and the pipeline definition) | Git; commit hash logged with the run |
| Training data snapshot | Versioned storage (DVC, lakeFS, Delta time travel); content hash logged with the run |
| Feature definitions and their code version | Feature store or the same Git commit |
| Configuration and hyperparameters, including all seeds | Config file in Git; parameters logged in the tracking store |
| Environment | Lockfile and container image digest, logged with the run |
| The model artefact and its signature | Model registry version, linked to the run |
| Evaluation results, slices and the data they used | Tracking store artefacts |
| Approval record: who promoted it, when, based on what | Registry history, change ticket |
| The decision itself: input features, score, threshold, model version at prediction time | Prediction log (Chapter 7), retained per regulation |

The last row is often forgotten: to explain a past decision, you need the exact inputs the model saw then, not today's recomputed features.

### P1.2 Is +0.005 AUC real?

```python run Test AUC over ten split seeds
import warnings; warnings.filterwarnings('ignore')
import numpy as np
from lightgbm import LGBMClassifier
from sklearn.datasets import make_classification
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split

X, y = make_classification(n_samples=4000, n_features=15, n_informative=6, flip_y=0.1,
        random_state=150)
aucs = []
for seed in range(10):
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.25, random_state=seed)
    m = LGBMClassifier(n_estimators=200, learning_rate=0.05, n_jobs=1, verbose=-1,
            random_state=0)
    aucs.append(roc_auc_score(yte, m.fit(Xtr, ytr).predict_proba(Xte)[:, 1]))
aucs = np.array(aucs)
print('AUC per split:', aucs.round(4))
print(f'mean {aucs.mean():.4f}, standard deviation {aucs.std(ddof=1):.4f}, '
      f'range {aucs.max() - aucs.min():.4f}')
```

The split alone moves the AUC by more than 0.005, so one split cannot show the improvement. The right comparison is **paired**: evaluate the old and new feature sets on the same 10 (or more) splits, or with repeated cross-validation, and look at the distribution of the per-split differences. If the new feature wins on nearly every split, the gain is real even if it is smaller than the split-to-split noise.

### P1.3 Querying runs with a constraint

```python run Best accuracy under a latency budget
import os, shutil, warnings, logging
warnings.filterwarnings('ignore'); logging.getLogger('mlflow').setLevel(logging.ERROR)
import mlflow
for path in ['p13.db', 'mlruns']:
    shutil.rmtree(path,
            ignore_errors=True) if os.path.isdir(path) else (os.path.exists(path)
            and os.remove(path))
mlflow.set_tracking_uri('sqlite:///p13.db')
mlflow.set_experiment('latency-budget')
# (num_leaves, measured AUC, measured p99 latency in ms) from earlier benchmarks
results = [(7, 0.902, 1.8), (15, 0.915, 2.6), (31, 0.924, 3.9), (63, 0.929, 5.8), (127,
        0.931, 9.1),
           (255, 0.930, 15.4)]
for leaves, auc, latency in results:
    with mlflow.start_run(run_name=f'leaves{leaves}'):
        mlflow.log_param('num_leaves', leaves)
        mlflow.log_metrics({'auc': auc, 'latency_ms': latency})
best = mlflow.search_runs(experiment_names=['latency-budget'],
        filter_string='metrics.latency_ms < 5',
                          order_by=['metrics.auc DESC'], max_results=1)
print(best[['tags.mlflow.runName', 'metrics.auc',
        'metrics.latency_ms']].to_string(index=False))
```

The filter runs in the tracking store, so the same query works over thousands of runs. Logging serving-relevant metrics such as latency and model size with every run makes "best" mean "best that we can actually deploy".

### P1.4 A promotion script

```python run Promote only on a clear win
import os, shutil, warnings, logging
warnings.filterwarnings('ignore'); logging.getLogger('mlflow').setLevel(logging.ERROR)
import mlflow, mlflow.sklearn
from mlflow import MlflowClient
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split

for path in ['p14.db', 'mlruns']:
    shutil.rmtree(path,
            ignore_errors=True) if os.path.isdir(path) else (os.path.exists(path)
            and os.remove(path))
mlflow.set_tracking_uri('sqlite:///p14.db'); mlflow.set_experiment('promotion')
X, y = make_classification(n_samples=5000, n_features=12, n_informative=5, random_state=151)
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3, random_state=0)
client = MlflowClient()

def register(model):
    with mlflow.start_run() as run:
        model.fit(Xtr, ytr)
        mlflow.log_metric('test_auc', roc_auc_score(yte, model.predict_proba(Xte)[:, 1]))
        mlflow.sklearn.log_model(model, name='model', registered_model_name='churn',
                                 # our own trees
                                 skops_trusted_types=['sklearn.tree._tree.Tree'])
    return max(client.search_model_versions("name='churn'"), key=lambda v: int(v.version))

def auc_of(version):
    return client.get_run(version.run_id).data.metrics['test_auc']

def promote(new, margin=0.002):
    try:
        champ = client.get_model_version_by_alias('churn', 'champion')
    except Exception:
        champ = None
    if champ is None or auc_of(new) >= auc_of(champ) + margin:
        client.set_registered_model_alias('churn', 'champion', new.version)
        return f'v{new.version} ({auc_of(new):.4f}) promoted to champion'
    client.set_registered_model_alias('churn', 'challenger', new.version)
    return (f'v{new.version} ({auc_of(new):.4f}) kept as challenger; '
            f'champion v{champ.version} ({auc_of(champ):.4f})')

print(promote(register(LogisticRegression(max_iter=1000))))
print(promote(register(LogisticRegression(C=0.5, max_iter=1000))))
print(promote(register(RandomForestClassifier(200, n_jobs=1, random_state=0))))
```

The second logistic model is essentially the same as the first and does not clear the margin, so it becomes the challenger; the random forest wins clearly and is promoted. (Tree models need `sklearn.tree._tree.Tree` listed as trusted: skops warns that a crafted tree file could make `predict` read out-of-bounds memory, so it is trusted only for models we trained ourselves.) In production the same function runs as the final pipeline step, and also checks slice tests and approvals before moving the alias.

### P1.5 A schema with a cross-column check

```python run Order lines with a consistency check
import warnings; warnings.filterwarnings('ignore')
import pandas as pd
import pandera.pandas as pa

schema = pa.DataFrameSchema(
    {'qty': pa.Column(int, pa.Check.ge(1)),
     'unit_price': pa.Column(float, pa.Check.gt(0)),
     'amount': pa.Column(float),
     'currency': pa.Column(str, pa.Check.eq('INR'))},
    checks=pa.Check(lambda df: (df.amount - df.qty * df.unit_price).abs() <= 0.01,
                    name='amount_equals_qty_times_price'))
batch = pd.DataFrame({'qty': [2, 1, 0, 3], 'unit_price': [499.0, 1299.0, 250.0, 99.0],
                      'amount': [998.0, 1299.0, 0.0, 279.0], 'currency': ['INR', 'INR',
                              'INR', 'USD']})
try:
    schema.validate(batch, lazy=True)
except pa.errors.SchemaErrors as err:
    fc = err.failure_cases[['column', 'check', 'index', 'failure_case']]
    print(fc.astype(str).to_string(index=False))
```

The column checks find the zero quantity and the wrong currency; the DataFrame-level check finds row 3, whose amount (279) does not equal 3 × 99 = 297, a typo that every single-column check would accept. Cross-column rules encode business logic and catch the subtle errors.

### P1.6 PSI for a categorical feature

```python run Numeric PSI on categories versus a proper categorical PSI
import numpy as np, pandas as pd
rng = np.random.default_rng(152)
ref = pd.Series(rng.choice(['basic', 'plus', 'pro'], 10000, p=[0.5, 0.3, 0.2]))
new = pd.Series(rng.choice(['basic', 'plus', 'pro', 'enterprise'], 3000, p=[0.38, 0.27,
        0.15, 0.20]))

def numeric_psi(r, n, bins=10):
    edges = np.quantile(r, np.linspace(0, 1, bins + 1))
    return edges

try:
    numeric_psi(ref, new)
except TypeError as e:
    print('numeric PSI on strings fails:', type(e).__name__)
codes = {'basic': 0, 'plus': 1, 'pro': 2}   # a common "fix": encode as integers
encoded = new.map(codes)
print(f'integer-encoded: {encoded.isna().sum()} rows of the new category become NaN and '
        f'vanish')

def categorical_psi(r, n, floor=1e-4):
    cats = sorted(set(r) | set(n))
    pr = r.value_counts(normalize=True).reindex(cats, fill_value=0).clip(lower=floor)
    pn = n.value_counts(normalize=True).reindex(cats, fill_value=0).clip(lower=floor)
    contrib = (pn - pr) * np.log(pn / pr)
    return contrib.sum(), contrib.sort_values(ascending=False)

total, contrib = categorical_psi(ref, new)
print(f'categorical PSI {total:.2f}')
print(contrib.round(3).to_string())
```

Quantile bins make no sense for strings, and integer encoding silently drops the unseen category (it becomes NaN and disappears from the histogram), hiding exactly the change that matters. Comparing category shares directly, with a small floor for categories absent from one side, gives a large PSI dominated by `enterprise`. Report a new category as its own alert, not only through PSI: it usually means an upstream change the model has never seen.

## Part 2 solutions

### P2.1 Code changes must invalidate the cache

```python run A cache key that includes the step's code, and a gap it leaves
import hashlib, pickle

cache, ran = {}, []
def cached(fn):
    def wrapper(*args):
        key = (fn.__name__, fn.__code__.co_code, fn.__code__.co_consts, pickle.dumps(args))
        digest = hashlib.sha256(repr(key).encode()).hexdigest()
        if digest not in cache:
            ran.append(fn.__name__); cache[digest] = fn(*args)
        return cache[digest]
    return wrapper

@cached
def train(f):
    return sum(f) / len(f)

SOURCE = 'def features(x):\n    return [v * {k} for v in x]\n'
def load_features(k):   # "editing the file" = new source text
    ns = {}; exec(SOURCE.format(k=k), ns); return cached(ns['features'])

def closure_features(scale):
    @cached
    def features(x):
        return [v * scale for v in x]   # scale is a closure variable, not code
    return features

data = (1.0, 2.0, 3.0)
for label, features, expected in [('first run (x * 2)', load_features(2), 4.0),
                                  ('same code', load_features(2), 4.0),
                                  ('edited literal (x * 3)', load_features(3), 6.0),
                                  ('closure version, scale 2', closure_features(2), 4.0),
                                  ('closure scale changed to 3', closure_features(3), 6.0)]:
    ran.clear()
    result = train(features(data))
    print(f'{label:27} result {result:.2f} (correct {expected:.2f}), steps run: '
            f'{ran or "none"}')
```

Editing the literal in the feature step changes its compiled constants, so its cache entry no longer matches; its output changes, so training reruns too and the result is correct. The last line shows the failure the exercise warns about, produced by a key that looks thorough: the closure variable `scale` is not part of the function's code or constants, so changing it leaves the key unchanged, and the pipeline silently returns the **old** features (4.00 instead of 6.00). A stale result that looks fresh is one of the nastiest pipeline bugs. Real tools avoid it by hashing every input explicitly (parameters are passed as arguments, never captured), and by hashing the source files or the container image.

### P2.2 An Airflow DAG

| Task | Depends on | Notes |
|---|---|---|
| `wait_for_events` (sensor) | | Waits for the day's partition to land; times out after 6 hours and alerts |
| `validate_data` | `wait_for_events` | Pandera/Great Expectations checks; failure stops the DAG and pages the data owner |
| `build_features` | `validate_data` | Writes features for the partition date (idempotent: overwrites that date only) |
| `score_customers` | `build_features` | Loads `models:/churn@champion`; writes scores with model version for the date |
| `publish_scores` | `score_customers` | Swaps the serving table atomically; downstream tools never see partial data |
| `monitor_scores` | `score_customers` | Score distribution and PSI versus last week; alert on breach |
| Weekly `retrain` DAG | Latest validated features and labels | Train → evaluate → slice tests → register; promotion by gate (Chapter 2) |

Schedule the daily DAG after the expected data arrival with an SLA (for example, scores by 08:00). Use `retries=2` with a delay for transient failures. Late data: the sensor waits; if the SLA is missed, the previous day's scores stay in place (stale but safe) and an alert goes out. Because every task writes only its own date partition, reruns and backfills are safe.

### P2.3 Directional tests and monotone constraints

```python run Unconstrained versus monotone LightGBM
import warnings; warnings.filterwarnings('ignore')
import numpy as np
from lightgbm import LGBMClassifier
rng = np.random.default_rng(153)
n = 6000
X = np.column_stack([rng.poisson(1.5, n), rng.integers(1, 60, n), rng.gamma(2, 150, n)])
y = (rng.random(n) < 1 / (1 + np.exp(-(-1.8 + 0.4 * X[:, 0] - 0.03 * X[:, 1])))).astype(int)

def more_tickets_never_lowers_risk(model, Xtest):
    base = model.predict_proba(Xtest)[:, 1]
    more = Xtest.copy(); more[:, 0] += 1
    violations = np.mean(model.predict_proba(more)[:, 1] < base - 1e-9)
    return violations == 0, violations

Xtest = X[:1000]
for name, kwargs in [('unconstrained', {}), ('monotone in tickets',
        {'monotone_constraints': [1, 0, 0]})]:
    m = LGBMClassifier(n_estimators=300, num_leaves=31, n_jobs=1, verbose=-1,
            random_state=0, **kwargs)
    m.fit(X, y)
    passed, share = more_tickets_never_lowers_risk(m, Xtest)
    print(f'{name:20} directional test passed: {passed} (rows violating: {share:.1%})')
```

The unconstrained model fits noise in places where data is sparse, so for about a quarter of these customers one more complaint lowers the predicted risk, which no business owner would accept and which a regulator may question. A monotone constraint builds the domain knowledge into the model, and the directional test then becomes a regression guard for future versions.

### P2.4 A slice test that matters

```python run Overall AUC hides a failing segment
import warnings; warnings.filterwarnings('ignore')
import numpy as np, pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
rng = np.random.default_rng(154)
n = 10000
df = pd.DataFrame({'tenure': rng.integers(1, 60, n), 'tickets': rng.poisson(1.5, n),
                   'onboarding_done': rng.integers(0, 2, n)})
new = df.tenure <= 3                                              # about 5% of customers
logit = np.where(new, -0.5 - 2.0 * df.onboarding_done, -1.5
        + 0.6 * df.tickets - 0.03 * df.tenure)
df['churn'] = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)
X = df[['tenure', 'tickets', 'onboarding_done']]
model = LogisticRegression(max_iter=1000).fit(X[:7000], df.churn[:7000])
test = df.iloc[7000:].assign(score=model.predict_proba(X.iloc[7000:])[:, 1])

def slice_auc(frame):
    return roc_auc_score(frame.churn, frame.score)

print(f'overall AUC {slice_auc(test):.3f}')
for name, part in [('new customers (tenure <= 3)', test[test.tenure <= 3]), ('established',
        test[test.tenure > 3])]:
    auc = slice_auc(part)
    print(f'{name:28} n={len(part):5}  AUC {auc:.3f}  slice test (>= 0.70): '
            f'{"PASS" if auc >= 0.70 else "FAIL"}')
```

New customers churn for a different reason (incomplete onboarding), which a single linear model fitted mostly on established customers cannot capture, and their slice is small enough that the overall AUC barely notices. The slice test makes the failure visible before release; fixes include segment-specific features or models, or interaction terms.

### P2.5 A feature from the future

```python run A leaked feature and a point-in-time test
import warnings; warnings.filterwarnings('ignore')
import numpy as np, pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
rng = np.random.default_rng(155)
n = 8000
df = pd.DataFrame({'tickets': rng.poisson(1.5, n), 'tenure': rng.integers(1, 60, n)})
df['churn'] = (rng.random(n) < 1 / (1 + np.exp(-(-1.5
        + 0.5 * df.tickets - 0.03 * df.tenure)))).astype(int)
df['prediction_date'] = pd.Timestamp('2026-06-01')
df['table_built'] = pd.Timestamp('2026-07-15')   # features computed later
# churned customers stop logging in after the prediction date: the feature "knows" the label
df['days_since_last_login'] = np.where(df.churn == 1, rng.integers(20, 45, n),
        rng.integers(0, 10, n))
df['days_since_last_login_asof'] = rng.integers(0, 15, n)   # correct point-in-time value

def auc(cols):
    m = LogisticRegression(max_iter=1000).fit(df[cols][:6000], df.churn[:6000])
    return roc_auc_score(df.churn[6000:], m.predict_proba(df[cols][6000:])[:, 1])

print(f'with the leaked feature     : AUC '
        f'{auc(["tickets", "tenure", "days_since_last_login"]):.3f}')
print(f'with the point-in-time value: AUC '
        f'{auc(["tickets", "tenure", "days_since_last_login_asof"]):.3f}')

def test_features_not_after_prediction(frame, feature_time_col='table_built'):
    late = (frame[feature_time_col] > frame['prediction_date']).mean()
    return late == 0, late
ok, late = test_features_not_after_prediction(df)
print(f'point-in-time test passed: {ok} (rows with features computed after prediction '
        f'time: {late:.0%})')
```

The leaked feature produces a perfect AUC that collapses in production, where the "future" is not available. Two defences: a point-in-time test that every feature row was computed (or is valid) as of the prediction timestamp, and a sanity check that flags any single feature with implausibly high predictive power. Feature stores enforce the first automatically with point-in-time joins.

### P2.6 Where does each test run?

| Test | Stage | Why there |
|---|---|---|
| (a) Unit test of a feature function | CI on every pull request | Fast, code-only, no data needed |
| (b) Schema validation of the day's data | Training (and scoring) pipeline | Depends on each new batch |
| (c) AUC above the champion's | Pipeline evaluation step, as the promotion gate | Needs the trained candidate and the evaluation set |
| (d) p99 latency at 500 rps | Pre-deployment load test (staging) | Needs the packaged service on realistic hardware |
| (e) Prediction distribution shift | Production monitoring | Only live traffic shows it |
| (f) Invariance to customer ID | Pipeline (behavioural tests on the candidate), also in CI on a small fixture model | Property of the trained model |
