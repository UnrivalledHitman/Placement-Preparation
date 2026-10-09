# How to use this guide
%What MLOps adds to machine learning and DevOps, what this book covers, and how its examples were run

A model in a notebook is not a product. **MLOps** is the set of practices that makes machine learning reproducible, testable, deployable, observable and safe to change: tracking experiments, versioning data and models, validating data, building pipelines, testing models, serving them, monitoring them in production, and rolling out new versions without harming users. Interviewers for ML engineer and MLOps roles ask "How do you know which data and code produced the model in production?", "What do you test in an ML pipeline?", "How would you roll back a bad model?".

This guide builds on two earlier books and does not repeat them. The **ML System Design** guide covers the design side: framing, leakage, training/serving skew, offline evaluation, A/B tests, latency budgets, drift metrics and retraining policy. The **DevOps and Cloud** guide covers CI/CD, containers, Kubernetes, canary analysis, infrastructure as code and alerting for ordinary services. This book is about the **machinery that connects them for models**.

## How the examples were run

Everything that can run on a laptop was run, with its real output shown: MLflow 3.17 tracking and model registry (with a local SQLite store), Pandera 0.34 data validation, pytest, a FastAPI service exercised with its test client, ONNX export and quantisation with onnxruntime 1.30, and LightGBM and scikit-learn models. Tools that need a cluster or a cloud account (Kubeflow, KServe, Triton, SageMaker, Vertex AI) are explained with tables, and the mechanisms behind shadow deployments, canaries, autoscaling and distributed training are reproduced in short simulations, as in the DevOps guide.

> TIP: Install MLflow (`pip install mlflow`) and run `mlflow ui` in the folder where the examples create `mlflow.db`: every run and model version in this book appears in the web interface.

## Map of the guide

| Chapter | Topic | Typical interview question |
|---|---|---|
| 1 | The ML lifecycle and reproducibility | "Can you reproduce last month's model exactly?" |
| 2 | Experiment tracking and the model registry | "How do you decide which model goes to production?" |
| 3 | Data validation and versioning | "How do you stop bad data from reaching training?" |
| 4 | Pipelines and orchestration | "What does Airflow or Kubeflow actually do for you?" |
| 5 | Testing ML systems | "What tests would you write for a model?" |
| 6 | Serving and optimising models | "How do you serve a model with 20 ms latency?" |
| 7 | Monitoring in production | "How do you know the model is still working?" |
| 8 | Safe rollouts for models | "How would you replace a model in production safely?" |
| 9 | Scaling and cost | "Is it worth moving training to spot instances?" |
| 10 | LLMOps | "How do you test a prompt change?" |
| 11 | Platforms, question bank and cheat sheet | Revision |

# Chapter 1: The ML Lifecycle and Reproducibility
%Why ML systems are harder to operate than code, maturity levels, and making a training run reproducible

## 1.1 Why ML needs its own operations

A conventional service changes only when its code changes. An ML system changes when the **code**, the **data** or the **world** changes, and it can fail silently: a broken model still returns predictions, just worse ones. Google's paper "Hidden Technical Debt in Machine Learning Systems" observed that the model code is a small box in the middle of a much larger system of data collection, feature extraction, validation, serving and monitoring.

| Artefact | Must be versioned because | Tool examples |
|---|---|---|
| Code | Training and serving logic change | Git |
| Data | The same code on different data gives a different model | DVC, lakeFS, Delta Lake time travel, dataset hashes |
| Configuration and hyperparameters | Small changes alter results | Config files in Git, logged with each run |
| Environment | Library versions change numerical results | Lockfiles, container images |
| Model | The deployable output, with its lineage | Model registry (MLflow, SageMaker, Vertex AI) |
| Metrics and evaluation reports | Evidence for promotion decisions | Experiment tracking |

## 1.2 Maturity levels

| Level (after Google's MLOps guidance) | What happens | Typical symptoms |
|---|---|---|
| 0: Manual | Data scientists train in notebooks and hand a model file to engineers | Nobody can reproduce the production model; retraining takes weeks |
| 1: Automated training pipeline | A pipeline retrains on new data (continuous training); models are registered with metrics | Pipeline code itself is deployed by hand |
| 2: CI/CD for pipelines | Pipeline code is tested and deployed automatically; models are promoted by automated checks and safe rollouts | Requires investment in tests, monitoring and platform |

Most teams do not need level 2 on day one. The first steps with the biggest payoff are: track every experiment, version data, put training in a script that runs end to end, and monitor the deployed model.

## 1.3 Reproducing a training run

A run is reproducible when the same inputs give the same model. Four sources of difference must be pinned: **randomness** (seeds for splits, initialisation and sampling), **data** (the exact snapshot), **code and configuration**, and the **environment** (library versions and, for GPUs, non-deterministic kernels). A practical habit is to compute a **fingerprint** of everything that defines a run and store it with the model.

```python run A run fingerprint from data, configuration and environment
import hashlib, json, platform
import numpy as np, pandas as pd, sklearn, lightgbm
from lightgbm import LGBMClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

rng = np.random.default_rng(100)
df = pd.DataFrame({'kwh': rng.gamma(2, 150, 3000), 'tickets': rng.poisson(1.5, 3000),
                   'tenure': rng.integers(1, 60, 3000)})
df['churn'] = (rng.random(3000) < 1 / (1 + np.exp(-(-2
        + 0.4 * df.tickets - 0.03 * df.tenure)))).astype(int)

def fingerprint(data, config):
    data_hash = hashlib.sha256(pd.util.hash_pandas_object(data,
            index=True).values.tobytes()).hexdigest()
    env = {'python': platform.python_version(), 'numpy': np.__version__,
           'sklearn': sklearn.__version__, 'lightgbm': lightgbm.__version__}
    blob = json.dumps({'data': data_hash, 'config': config, 'env': env}, sort_keys=True)
    return hashlib.sha256(blob.encode()).hexdigest()[:12], data_hash[:12]

def train(data, config):
    Xtr, Xte, ytr, yte = train_test_split(data.drop(columns='churn'), data.churn,
            test_size=0.3,
                                          random_state=config['split_seed'])
    m = LGBMClassifier(n_estimators=config['trees'], learning_rate=0.05, subsample=0.8,
            subsample_freq=1,
                       random_state=config['model_seed'], n_jobs=1, verbose=-1).fit(Xtr,
                               ytr)
    return round(roc_auc_score(yte, m.predict_proba(Xte)[:, 1]), 4)

config = {'split_seed': 0, 'model_seed': 0, 'trees': 200}
for label, cfg, data in [('baseline', config, df), ('same inputs again', config, df),
                         ('different split seed', {**config, 'split_seed': 1}, df),
                         ('one row changed', config,
                                 df.assign(kwh=df.kwh.where(df.index != 7, 0.0)))]:
    fp, dh = fingerprint(data, cfg)
    print(f'{label:21} fingerprint {fp}  data {dh}  test AUC {train(data, cfg)}')
```

(The AUC is low because the simulated churn signal is weak; only the differences between lines matter here.) Identical inputs give an identical fingerprint and an identical result. A different split seed changes the test AUC by a visible amount, which is a reminder that a single train/test split carries noise: report results over several seeds or with cross-validation before claiming an improvement of that size. A single changed row changes the data hash, so a model can always be traced to the exact data it saw.

## 1.4 Practical lessons

- ML systems change with code, data and the world; version all of them, plus the environment.
- Start with tracking, data versioning, a scripted pipeline and monitoring; automate further as needed.
- Pin seeds, data snapshots, configuration and library versions; store a fingerprint with each model.
- Differences between seeds are noise: compare models over several splits.

# Chapter 2: Experiment Tracking and the Model Registry
%Logging runs with MLflow, comparing them, registering models, promoting with aliases and loading by alias

## 2.1 What to track

Every training run should record its **parameters** (hyperparameters, data version, code commit), **metrics** (validation and test scores, training time), **artefacts** (the model file, plots, evaluation reports, the environment) and **tags** (owner, purpose). Without this, "which settings produced our best model?" becomes archaeology.

MLflow organises runs into **experiments**; each run stores parameters, metrics and artefacts in a tracking store (a local folder, a database, or a server shared by the team).

```python run Tracking a small hyperparameter search with MLflow
import os, shutil, warnings, logging
warnings.filterwarnings('ignore'); logging.getLogger('mlflow').setLevel(logging.ERROR)
import numpy as np, mlflow
from lightgbm import LGBMClassifier
from sklearn.datasets import make_classification
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split

for path in ['mlflow.db', 'mlruns']:                       # start from an empty store
    shutil.rmtree(path,
            ignore_errors=True) if os.path.isdir(path) else (os.path.exists(path)
            and os.remove(path))
mlflow.set_tracking_uri('sqlite:///mlflow.db')
mlflow.set_experiment('churn-model')

X, y = make_classification(n_samples=6000, n_features=15, n_informative=6, flip_y=0.05,
        random_state=101)
Xtr, Xva, ytr, yva = train_test_split(X, y, test_size=0.3, random_state=0)
for leaves in [7, 31]:
    for lr in [0.03, 0.1]:
        with mlflow.start_run(run_name=f'leaves{leaves}-lr{lr}'):
            mlflow.log_params({'num_leaves': leaves, 'learning_rate': lr,
                    'data_version': 'v2026-10-01'})
            m = LGBMClassifier(num_leaves=leaves, learning_rate=lr, n_estimators=300,
                    n_jobs=1,
                               verbose=-1, random_state=0).fit(Xtr, ytr)
            mlflow.log_metric('val_auc', roc_auc_score(yva, m.predict_proba(Xva)[:, 1]))
            mlflow.set_tag('owner', 'meter-analytics')

runs = mlflow.search_runs(experiment_names=['churn-model'],
        order_by=['metrics.val_auc DESC'])
print(runs[['tags.mlflow.runName', 'params.num_leaves', 'params.learning_rate',
        'metrics.val_auc']]
      .round(4).to_string(index=False))
```

The search API turns the tracking store into a queryable table: the best run, every run on a given data version, or every run by a team member. Note that four runs compared on one validation split are an informal search; with many runs, the best validation score is optimistically biased, so confirm the winner on a held-out test set.

## 2.2 The model registry

The registry stores **versions** of a named model, each linked to the run (and therefore the parameters, data version and code) that produced it. Instead of copying files, deployments refer to a model by name and an **alias** such as `champion` or `challenger`. Promoting a new version is a change of alias, and rolling back is pointing the alias at the previous version.

```python run Registering versions, promoting with an alias and rolling back
import os, shutil, warnings, logging
warnings.filterwarnings('ignore'); logging.getLogger('mlflow').setLevel(logging.ERROR)
import numpy as np, mlflow, mlflow.sklearn
from mlflow import MlflowClient
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from lightgbm import LGBMClassifier
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split

for path in ['registry.db', 'mlruns']:
    shutil.rmtree(path,
            ignore_errors=True) if os.path.isdir(path) else (os.path.exists(path)
            and os.remove(path))
mlflow.set_tracking_uri('sqlite:///registry.db')
mlflow.set_experiment('churn-registry')
X, y = make_classification(n_samples=6000, n_features=15, n_informative=6, flip_y=0.05,
        random_state=101)
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3, random_state=0)
TRUSTED = ['collections.OrderedDict', 'lightgbm.basic.Booster',
        'lightgbm.sklearn.LGBMClassifier']

for model in [LogisticRegression(max_iter=1000), LGBMClassifier(n_jobs=1, verbose=-1,
        random_state=0)]:
    with mlflow.start_run():
        model.fit(Xtr, ytr)
        mlflow.log_metric('test_auc', roc_auc_score(yte, model.predict_proba(Xte)[:, 1]))
        mlflow.set_tag('model_class', type(model).__name__)
        mlflow.sklearn.log_model(model, name='model', registered_model_name='churn',
                                 skops_trusted_types=TRUSTED)

client = MlflowClient()
versions = sorted(client.search_model_versions("name='churn'"),
        key=lambda v: int(v.version))
for v in versions:
    auc = client.get_run(v.run_id).data.metrics['test_auc']
    kind = client.get_run(v.run_id).data.tags['model_class']
    print(f'version {v.version}: {kind:18} test AUC {auc:.4f}')

client.set_registered_model_alias('churn', 'champion', '1')
client.set_registered_model_alias('churn', 'champion', '2')   # promote the better model
champion = mlflow.pyfunc.load_model('models:/churn@champion')
print('champion is version', client.get_model_version_by_alias('churn', 'champion').version,
      '| first predictions:', champion.predict(Xte[:5]).tolist())
client.set_registered_model_alias('churn', 'champion', '1')   # rollback = move the alias
print('after rollback, champion is version', client.get_model_version_by_alias('churn',
        'champion').version)
```

MLflow 3 saves scikit-learn models with **skops**, a format that refuses to load classes it does not know, because classic pickle files can execute arbitrary code when loaded; the LightGBM classes must therefore be listed as trusted explicitly. Treat model files like code: load only those from your own registry. The serving code loads `models:/churn@champion` and never changes; promotion and rollback are registry operations that take seconds and leave an audit trail. In production, promotion should be gated by checks (the new version beats the champion on a fixed test set, passes the tests of Chapter 5, and survives a shadow or canary phase as in Chapter 8).

| Registry practice | Why |
|---|---|
| Every version links to its run, data version and code commit | Lineage: answer "what produced this model?" in one click |
| Aliases (`champion`, `challenger`) instead of copying files | Instant promotion and rollback; serving code stays unchanged |
| Promotion requires automated checks and a recorded approval | Prevents accidental deployment of an untested model |
| Model signature (input and output schema) stored with the model | Serving rejects requests with the wrong shape |
| Keep old versions | Rollback and audits need them |
| Load only trusted model files | Pickle-based formats can run arbitrary code when loaded |

## 2.3 Practical lessons

- Log parameters, metrics, artefacts, data version and code commit for every run.
- Query runs instead of remembering them; confirm the best validation run on held-out data.
- Register models with lineage; deploy by alias; promote and roll back by moving the alias.
- Gate promotion on automated checks, not on a person copying a file.
