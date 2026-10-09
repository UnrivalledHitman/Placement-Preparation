# Chapter 3: Data Validation and Versioning
%Schemas that reject bad data before training or serving, distribution checks, and content-addressed data versions

## 3.1 Bad data is the most common ML failure

Models fail quietly when their inputs change: an upstream team renames a column, a unit changes from kWh to Wh, a new category appears, a join starts producing nulls, a sensor reports −1 for "unknown". Such data still trains and serves without errors and produces worse predictions. **Data validation** checks every batch against expectations before it reaches training or the model.

| Check | Example | Catches |
|---|---|---|
| Schema | Column present, type float | Renamed or dropped columns, type changes |
| Range and domain | 0 ≤ kwh ≤ 5,000; plan in {basic, plus, pro} | Unit changes, sentinel values, new categories |
| Completeness | Null share of `tenure` below 1% | Broken joins and pipelines |
| Uniqueness and keys | One row per (meter_id, date) | Duplicated loads |
| Distribution | Mean within 3 standard errors of last month; PSI below 0.2 | Silent shifts (the ML System Design guide, §7.2, defines PSI and KS) |
| Freshness | Latest timestamp within 2 hours | Stalled pipelines |

## 3.2 Schemas with Pandera

Pandera expresses these expectations as code, versioned with the pipeline, and reports **every** failure at once with `lazy=True`.

```python run Validating a batch of meter readings
import warnings; warnings.filterwarnings('ignore')
import numpy as np, pandas as pd
import pandera.pandas as pa

schema = pa.DataFrameSchema({
    'meter_id': pa.Column(str, pa.Check.str_matches(r'^MTR-\d{5}$')),
    'date': pa.Column('datetime64[ns]'),
    'kwh': pa.Column(float, [pa.Check.ge(0), pa.Check.le(5000)], nullable=False),
    'plan': pa.Column(str, pa.Check.isin(['basic', 'plus', 'pro'])),
    'tenure_months': pa.Column(float, pa.Check.ge(0), nullable=True),
}, unique=['meter_id', 'date'], strict=True)

rng = np.random.default_rng(110)
good = pd.DataFrame({'meter_id': [f'MTR-{i:05d}' for i in range(5)],
                     'date': pd.to_datetime(['2026-10-01'] * 5),
                     'kwh': rng.gamma(2, 150, 5).round(1), 'plan': ['basic', 'plus', 'pro',
                             'basic', 'plus'],
                     'tenure_months': [3.0, 14.0, None, 40.0, 7.0]})
schema.validate(good, lazy=True)
print('good batch: valid')

bad = good.copy()
bad.loc[1, 'kwh'] = -1.0                                     # sentinel for "unknown"
bad.loc[2, 'plan'] = 'enterprise'                            # new category upstream
bad.loc[4, 'meter_id'] = 'MTR-00003'                         # duplicate key
bad['region'] = 'west'                                       # unexpected column
try:
    schema.validate(bad, lazy=True)
except pa.errors.SchemaErrors as err:
    fc = err.failure_cases[['column', 'check', 'failure_case']]
    print(f'bad batch: {len(fc)} failures')
    print(fc.astype(str).to_string(index=False))
```

The duplicate key is reported once per offending cell (both rows, both key columns), so seven failure rows describe four problems. `strict=True` rejects unexpected columns, which catches upstream schema changes early. Run the same schema at **both** ends: before training (so a model never learns from bad data) and in the serving path (so requests that violate the training-time schema are rejected or flagged rather than scored).

## 3.3 Distribution checks between batches

Schemas catch impossible values; distribution checks catch **plausible-looking** shifts. A simple, robust approach compares each new batch with a reference window, feature by feature.

```python run A unit change that passes the schema but not the distribution check
import numpy as np, pandas as pd
from scipy.stats import ks_2samp
rng = np.random.default_rng(111)
reference = pd.DataFrame({'kwh': rng.gamma(2, 150, 5000), 'tenure': rng.integers(1, 60,
        5000)})
batches = {
    'normal day': pd.DataFrame({'kwh': rng.gamma(2, 150, 2000), 'tenure': rng.integers(1,
            60, 2000)}),
    'kWh logged as Wh / 1000 bug': pd.DataFrame({'kwh': rng.gamma(2, 150, 2000) * 0.5,
                                                 'tenure': rng.integers(1, 60, 2000)}),
}

def psi(ref, new, bins=10):
    edges = np.quantile(ref, np.linspace(0, 1, bins
            + 1)); edges[0], edges[-1] = -np.inf, np.inf
    r = np.histogram(ref, edges)[0] / len(ref); n = np.histogram(new, edges)[0] / len(new)
    r, n = np.clip(r, 1e-6, None), np.clip(n, 1e-6, None)
    return float(np.sum((n - r) * np.log(n / r)))

for name, batch in batches.items():
    for col in reference:
        stat, p = ks_2samp(reference[col], batch[col])
        flag = 'ALERT' if psi(reference[col], batch[col]) > 0.2 else 'ok'
        print(f'{name:28} {col:6} PSI {psi(reference[col], batch[col]):.3f}  KS {stat:.3f} '
                f' -> {flag}')
```

Halved consumption values are all valid kWh numbers, so the schema accepts them; the population stability index (PSI) flags the shift at once. With large batches, KS p-values are almost always tiny, so alert on effect sizes (PSI, the KS statistic itself) rather than on p-values.

## 3.4 Versioning data

Code is versioned by Git commits; data needs the same, but data files are too large for Git. Tools such as **DVC**, **lakeFS** and table formats with time travel (**Delta Lake**, **Apache Iceberg**) apply one idea: identify each data version by a **content hash**, store the bytes once in object storage, and record only the small hash in Git next to the code. Checking out a commit then restores exactly the data that commit trained on.

```python run Content-addressed data versions in a few lines
import hashlib, json, os, shutil
import numpy as np, pandas as pd
store = 'data_store'
shutil.rmtree(store, ignore_errors=True); os.makedirs(store)

def commit(df, message, log):
    raw = df.to_csv(index=False).encode()
    digest = hashlib.sha256(raw).hexdigest()[:12]
    path = os.path.join(store, digest)
    if not os.path.exists(path):                       # identical data is stored only once
        open(path, 'wb').write(raw)
    log.append({'version': digest, 'message': message, 'rows': len(df)})
    return digest

rng = np.random.default_rng(112)
df = pd.DataFrame({'meter_id': range(1000), 'kwh': rng.gamma(2, 150, 1000).round(2)})
log = []
v1 = commit(df, 'initial September snapshot', log)
v2 = commit(df, 're-export, no changes', log)
v3 = commit(pd.concat([df, df.tail(5).assign(meter_id=range(1000, 1005))]), 'add 5 meters',
        log)
print(json.dumps(log, indent=1))
print('files stored:', len(os.listdir(store)), '| v1 == v2:', v1 == v2)
restored = pd.read_csv(os.path.join(store, v1))
print('restored v1 identical to original:', restored.equals(df))
```

Re-exporting unchanged data produces the same hash, so nothing new is stored and the pipeline can skip retraining. Recording the data hash in each MLflow run (Chapter 2) completes the lineage: model version → run → code commit **and** data version.

## 3.5 Practical lessons

- Validate every batch: schema, ranges, categories, nulls, keys, freshness, distributions.
- Use the same schema before training and in serving; fail loudly, not silently.
- Alert on distribution effect sizes (PSI, KS statistic), not on p-values from huge samples.
- Version data by content hash and link it to every model run.

# Chapter 4: Pipelines and Orchestration
%Training as a graph of cached steps, what orchestrators add, and continuous training

## 4.1 From notebook to pipeline

A notebook mixes exploration with production logic and depends on the order in which cells were run. A **pipeline** splits the work into steps with explicit inputs and outputs: ingest → validate → build features → train → evaluate → register. Each step is a function (or a container) that can be tested, retried and cached on its own.

The key optimisation is **caching by content**: if a step's code and inputs have not changed, reuse its previous output. The program implements a miniature version of what Kubeflow Pipelines, ZenML, Metaflow, DVC pipelines and Make all do.

```python run A pipeline that reruns only the steps whose inputs changed
import hashlib, json, pickle, os, shutil
import numpy as np, pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score

CACHE = 'pipeline_cache'
shutil.rmtree(CACHE, ignore_errors=True); os.makedirs(CACHE)
ran = []

def step(fn):
    def wrapper(*inputs, **params):
        key_src = fn.__name__ + fn.__code__.co_code.hex() + json.dumps(params,
                sort_keys=True)
        key_src += ''.join(hashlib.sha256(pickle.dumps(i)).hexdigest() for i in inputs)
        key = hashlib.sha256(key_src.encode()).hexdigest()[:12]
        path = os.path.join(CACHE, f'{fn.__name__}-{key}.pkl')
        if os.path.exists(path):
            return pickle.load(open(path, 'rb'))
        ran.append(fn.__name__)
        out = fn(*inputs, **params)
        pickle.dump(out, open(path, 'wb'))
        return out
    return wrapper

@step
def ingest(month):
    rng = np.random.default_rng(int(month.replace('-', '')))
    df = pd.DataFrame({'kwh': rng.gamma(2, 150, 2000), 'tickets': rng.poisson(1.5, 2000)})
    df['churn'] = (rng.random(2000) < 1 / (1 + np.exp(-(-2
            + 0.5 * df.tickets)))).astype(int)
    return df

@step
def validate(df):
    assert df.kwh.ge(0).all() and df.churn.isin([0, 1]).all()
    return df

@step
def features(df, window=3):
    return df.assign(high_tickets=(df.tickets >= window).astype(int))

@step
def train(df, C=1.0):
    X = df[['kwh', 'tickets', 'high_tickets']]
    m = LogisticRegression(C=C, max_iter=1000).fit(X[:1500], df.churn[:1500])
    return m, roc_auc_score(df.churn[1500:], m.predict_proba(X[1500:])[:, 1])

def pipeline(month, window=3, C=1.0):
    ran.clear()
    model, auc = train(features(validate(ingest(month=month)), window=window), C=C)
    return f'steps run: {ran or "none (all cached)"}  AUC {auc:.3f}'

print('first run          :', pipeline('2026-09'))
print('same inputs        :', pipeline('2026-09'))
print('new hyperparameter :', pipeline('2026-09', C=0.1))
print('new feature window :', pipeline('2026-09', window=2))
print('new month of data  :', pipeline('2026-10'))
```

Changing a training hyperparameter reruns only training; changing a feature parameter reruns features and training; new data reruns everything downstream of ingestion. (The AUC does not move with C or the window here: with 1,500 rows, regularisation strength barely matters, and a threshold feature on tickets adds nothing a model already using tickets lacks. The point is which steps run.) Real orchestrators add what this toy lacks: running steps on different machines, retries with back-off, scheduling, parallel branches, and a record of every run's inputs and outputs (lineage).

## 4.2 What orchestrators provide

| Tool | Model | Typical use |
|---|---|---|
| Apache Airflow | DAGs of tasks in Python, scheduled; huge operator ecosystem | Data engineering and scheduled retraining |
| Kubeflow Pipelines | Each step a container on Kubernetes; artefact tracking | ML pipelines on Kubernetes |
| Prefect, Dagster | Python-native flows; Dagster is asset-centric (tracks data assets and their freshness) | Data and ML pipelines with strong local development |
| ZenML, Metaflow | ML-focused pipelines with pluggable stacks (orchestrator, artefact store, tracker) | Moving the same pipeline from laptop to cloud |
| Managed: SageMaker Pipelines, Vertex AI Pipelines, Azure ML | Hosted pipelines integrated with the cloud's registry and serving | Teams standardised on one cloud |

| Concern | Practice |
|---|---|
| Idempotency | Running a step twice with the same inputs gives the same output and no duplicate side effects |
| Backfills | Re-run the pipeline for past dates with the code of that time, or the current code, deliberately |
| Failure handling | Retries for transient errors; alerts and no partial publication for real failures |
| Point-in-time correctness | Features for a training date use only data available then (ML System Design, Chapter 3) |
| Promotion | The pipeline registers a candidate; promotion to champion happens only after checks (Chapters 5 and 8) |

## 4.3 Continuous training

**Continuous training** retrains automatically when triggered: on a schedule (weekly), on enough new labelled data, or when monitoring detects drift (Chapter 7). The danger is automatically deploying a worse model, so a retrained candidate must pass the same gates as a hand-trained one.

```python run A retraining trigger with a promotion gate
import numpy as np
rng = np.random.default_rng(113)
champion_auc = 0.812
history = []
for week in range(1, 9):
    drift_psi = 0.05 + 0.04 * week + rng.normal(0, 0.02)       # inputs slowly shift
    triggered = drift_psi > 0.2 or week % 4 == 0   # drift or the monthly schedule
    if not triggered:
        history.append(f'week {week}: PSI {drift_psi:.2f}, no retraining'); continue
    candidate_auc = champion_auc + rng.normal(0.004, 0.01)
    passes = candidate_auc >= champion_auc - 0.002 and candidate_auc > 0.75
    if passes:
        champion_auc = candidate_auc
    history.append(f'week {week}: PSI {drift_psi:.2f}, retrained, candidate AUC '
            f'{candidate_auc:.3f} -> '
                   f'{"PROMOTED" if passes else "rejected, champion kept"}')
print('\n'.join(history))
```

The gate compares the candidate with the current champion on a fixed, recent evaluation set and allows a small tolerance (a fresh model on new data may score marginally lower on old data yet serve today's traffic better). A rejected candidate is itself a signal worth investigating: data quality problems, label delays, or a genuinely harder problem.

## 4.4 Practical lessons

- Split training into steps with explicit inputs and outputs; cache by code, parameters and input hashes.
- Use an orchestrator for scheduling, retries, distributed execution and lineage.
- Make steps idempotent and point-in-time correct; backfill deliberately.
- Retrain on schedule, data volume or drift, but promote only through automated gates.
