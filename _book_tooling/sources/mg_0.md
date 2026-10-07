# How to use this guide
%What an ML system design round asks, how it is graded, and how this book builds on the AI/ML and System Design books

An **ML system design** interview gives you an open product problem ("design the feed ranking for a short-video app", "detect fraudulent transactions", "build a support chatbot over our documents") and 45–60 minutes. The interviewer is not testing whether you can derive back-propagation; that was the AI/ML and Deep Learning guides. They are testing whether you can turn a business goal into a **measurable ML problem**, choose data, features and a model of the right complexity, evaluate it honestly offline and online, serve it within a latency budget, and keep it working after launch.

Every number in this book comes from a Python simulation that was run to produce it (NumPy, scikit-learn and Matplotlib), with fixed random seeds so that it reproduces exactly. The simulations are small on purpose: they isolate one effect, such as leakage, skew, a peeking A/B test or drift, so that you can see it happen and explain it in an interview.

## The interview framework

| Step | Time | What you produce | Signals the interviewer wants |
|---|---|---|---|
| 1. Clarify and frame | 5–8 min | Business goal, users, scale, constraints; **the ML task** (classification, ranking, regression, generation) | You ask about the objective before the model |
| 2. Metrics | 5 min | One business metric, offline ML metrics, guardrail metrics | Metrics that match the decision the model drives |
| 3. Data and labels | 5–8 min | Sources, label definition, how labels arrive (delay, bias), splits | Awareness of leakage and label noise |
| 4. Features | 5 min | Feature groups, freshness, online/offline consistency | Training/serving skew prevention |
| 5. Model | 5–8 min | A baseline, then a justified model; multi-stage if needed | Simplest model that meets the need |
| 6. Serving | 5 min | Online or batch, latency budget, caching, fallbacks | Numbers: QPS, p99, cost |
| 7. Evaluation and launch | 5 min | Offline evaluation, A/B test design, rollout | Statistical sense |
| 8. Monitoring and iteration | 3–5 min | Drift, feedback loops, retraining triggers | The model is a living system |

## How the chapters connect

| Chapter | Topic | Builds on |
|---|---|---|
| 1 | Framing: from business goal to ML task and metric | — |
| 2 | Data, labels, splits and leakage | AI/ML guide (train/test splits, cross-validation) |
| 3 | Features, feature stores, training/serving skew | — |
| 4 | Offline evaluation: thresholds, imbalance, calibration, ranking metrics | AI/ML guide (precision, recall, ROC) |
| 5 | Online experiments: A/B tests, sample size, peeking, interleaving | — |
| 6 | Serving: batch versus online, latency budgets, caching, cost | System Design guide (caching, fan-out, tail latency) |
| 7 | Monitoring: data drift, concept drift, retraining | — |
| 8–9 | Case studies: recommendations, fraud, search, ETA, RAG chatbot, LLM-agent platform | Deep Learning guide (embeddings, transformers) |
| 10 | Interview checklist and question bank | — |

## How to study this book

1. Read Chapters 1–7 in order: they are the vocabulary of every case study.
2. Run the simulations and change one parameter at a time (class balance, sample size, drift strength) until you can predict the effect.
3. For each case study in Chapters 8–9, set a 45-minute timer, write your own design using the framework table above, then compare.
4. Solve the **ML System Design Practice Book** alongside.

> TIP: In the interview, write the framework steps as headings on the whiteboard at the start and fill them in. It keeps you on time and shows the interviewer that you know what a complete answer contains.

# Chapter 1: Framing the Problem
%From a business goal to an ML task, a label and a metric, and when not to use ML at all

## 1.1 From goal to task

The most common failure in ML system design interviews is to start with a model. Start with the **decision** the system will make, because the decision determines the task, the label and the metric.

| Product goal | Decision the model drives | ML task | Label |
|---|---|---|---|
| Increase watch time on a video feed | Which 20 videos to show, in what order | Ranking (learning to rank, or pointwise prediction of watch probability × expected watch time) | Watched more than 50% / watch seconds |
| Reduce card fraud losses | Approve, challenge (OTP) or decline a transaction | Binary classification with a cost-based threshold | Chargeback within 90 days |
| Faster customer support | Answer a question from documentation | Retrieval + generation (RAG) | Resolved without a human, user rating |
| Accurate delivery ETA | The time shown to the customer | Regression (often quantile regression) | Actual delivery time |
| Fewer failed smart-meter readings | Which meters to send technicians to | Classification or anomaly detection, ranked by risk | Failure confirmed within 30 days |

## 1.2 Three levels of metrics

| Level | Example (fraud) | Measured | Used for |
|---|---|---|---|
| Business metric | Fraud losses + cost of blocked good customers, per month | In production, slowly | The real goal; A/B test success criterion |
| Online proxy metric | Fraud rate of approved transactions, challenge rate | In an A/B test, days | Launch decisions |
| Offline ML metric | Precision at the operating recall, PR-AUC | On a held-out set, minutes | Model development |
| Guardrails | Checkout latency, complaint rate, approval rate by region | Always | Must not get worse |

The offline metric is only useful if improving it improves the business metric. Check this correlation over past launches; when it breaks, fix the offline metric.

## 1.3 Turning costs into a decision rule

When errors have different costs, the best threshold is not 0.5. If a model outputs a calibrated probability *p* that a transaction is fraud, declining costs the merchant margin and goodwill of a good customer with probability 1 − *p*, and approving costs the fraud amount with probability *p*. Decline when the expected cost of approving exceeds the expected cost of declining:

```text
decline if   p × cost_of_missed_fraud  >  (1 − p) × cost_of_blocking_a_good_customer
         ⇔   p  >  c_block / (c_block + c_fraud)
```

```python run The cost-optimal threshold for three fraud amounts
c_block = 300        # Rs: margin, support call and churn risk of blocking a good customer
for amount in (500, 5_000, 50_000):
    c_fraud = amount          # a missed fraud costs the transaction amount
    t = c_block / (c_block + c_fraud)
    print(f'transaction Rs {amount:>6,}: decline if P(fraud) > {t:.3f}')
```

The threshold depends on the amount: for a Rs 50 000 transaction, even a 0.6% fraud probability justifies a challenge, while a Rs 500 purchase should pass unless the model is quite sure. One model with an amount-dependent threshold beats a single global cut-off; this works only if the probabilities are **calibrated** (Chapter 4).

## 1.4 When not to use ML

| Situation | Better choice |
|---|---|
| A clear rule covers most cases ("block cards reported stolen") | A rule; let ML handle the grey zone |
| No labels and no way to get them | Heuristics, then collect labels |
| The cost of an error is catastrophic and must be explainable | Rules, or a simple interpretable model with human review |
| Tiny data, stable problem | A lookup table or a linear model |
| The requirement is "always correct" | ML is probabilistic; design for errors or do not use it |

> TIP: Always propose a **non-ML baseline** first ("most popular items", "rule: amount > X and new device"). It sets the bar the model must beat, ships in a week, and gives you data and labels for the model.

## 1.5 Practical lessons

- Start from the decision; derive the task, the label and the metric from it.
- Keep three levels of metrics: business, online proxy, offline; plus guardrails.
- Asymmetric costs become a threshold: `t = c_FP / (c_FP + c_FN)` for calibrated probabilities.
- Always state a non-ML baseline.

# Chapter 2: Data, Labels and Leakage
%Where labels come from, how to split time-dependent data, and how leakage produces models that look perfect and fail

## 2.1 Labels

| Label source | Example | Problem to mention |
|---|---|---|
| Explicit human labels | Annotators mark spam | Cost; disagreement between annotators; guidelines drift |
| Implicit feedback | Clicks, watch time, purchases | **Position bias** (top items get clicked because they are on top); exposure bias (unseen items have no labels) |
| Delayed outcomes | Chargebacks (up to 90 days), loan defaults (months) | Recent data has incomplete labels; train on matured windows only |
| Weak labels | Rules, heuristics, LLM-generated labels | Systematic noise; validate on a small gold set |

## 2.2 Leakage

**Leakage** is information in the training features that would not be available at prediction time. It makes offline metrics look excellent and production performance poor. Two common forms:

| Form | Example |
|---|---|
| Target leakage | A feature computed **after** the outcome: "number of support calls in the 7 days after the transaction" to predict fraud |
| Temporal leakage | Random train/test split of time-ordered data: the model is tested on days that lie between its training days, so it learns the future |

The simulation builds a fraud-like dataset where the label depends weakly on genuine features, then adds a feature that leaks the label (it is computed from information that only exists after the fraud is reported). The leaky model looks far better offline. Production performance is measured on data where the leaky feature has no information, because at prediction time the event has not happened yet.

```python run A leaky feature: excellent offline, useless in production
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score

rng = np.random.default_rng(7)
def make(n, leak_available):
    X = rng.normal(size=(n, 5))
    logit = -3.0 + 0.9 * X[:, 0] - 0.7 * X[:, 1] + 0.4 * X[:, 2]
    y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)
    # "disputes filed in the following week": known only after the fraud surfaces
    leak = y * rng.poisson(2.0, n) + rng.poisson(0.1, n) if leak_available \
        else rng.poisson(0.1, n)
    return np.column_stack([X, leak]), y

X_train, y_train = make(20_000, leak_available=True)
X_test, y_test = make(20_000, leak_available=True)        # offline test: same leak
X_prod, y_prod = make(20_000, leak_available=False)       # production: leak is absent
print(f'fraud rate {y_train.mean():.1%}')
for name, cols in (('honest model (5 features)', slice(0, 5)),
                   ('leaky model (+ disputes)', slice(0, 6))):
    m = LogisticRegression(max_iter=1000).fit(X_train[:, cols], y_train)
    off = roc_auc_score(y_test, m.predict_proba(X_test[:, cols])[:, 1])
    prod = roc_auc_score(y_prod, m.predict_proba(X_prod[:, cols])[:, 1])
    print(f'{name:27s} offline AUC {off:.3f}   production AUC {prod:.3f}')
```

The leaky model's offline AUC is the best number anyone on the team has seen, and in production it is **worse** than the honest model, because it learned to rely on a feature that is always near zero at prediction time. The defence is a question asked of every feature: "**at the moment of prediction, would I know this value?**"

## 2.3 Splitting time-dependent data

A random split puts future rows in the training set. For any problem where the world changes over time (fraud patterns, prices, user tastes), split by time: train on the past, validate on the period that follows, exactly as the model will be used. The simulation creates a year of data in which the effect of one feature reverses slowly (from negative to positive), and compares three estimates of how a model will do in month 13 with the truth.

```python run Random split, time split and the truth under drift
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import roc_auc_score

rng = np.random.default_rng(11)
days = np.repeat(np.arange(395), 60)              # 13 months, 60 events per day
X = rng.normal(size=(len(days), 4))
w = days / 365
logit = -1 + 1.2 * X[:, 0] + 2.0 * (2 * w - 1) * X[:, 1] + 0.5 * X[:, 2] * X[:, 3]
y = (rng.random(len(days)) < 1 / (1 + np.exp(-logit))).astype(int)
year, month13 = np.where(days < 365)[0], np.where(days >= 365)[0]

def auc(train, test):
    m = GradientBoostingClassifier(random_state=0).fit(X[train], y[train])
    return roc_auc_score(y[test], m.predict_proba(X[test])[:, 1])

perm = rng.permutation(year)
cut = int(0.8 * len(perm))
print('model trained on the whole year')
print(f'  random-split estimate            {auc(perm[:cut], perm[cut:]):.3f}')
print(f'  time-split estimate (last 30 d)  '
      f'{auc(year[days[year] < 335], year[days[year] >= 335]):.3f}')
print(f'  true AUC in month 13             {auc(year, month13):.3f}')
recent = year[days[year] >= 275]                  # only the last 90 days
print('model trained on the last 90 days')
print(f'  time-split estimate (last 30 d)  '
      f'{auc(recent[days[recent] < 335], recent[days[recent] >= 335]):.3f}')
print(f'  true AUC in month 13             {auc(recent, month13):.3f}')
```

Three lessons come out of one table. First, the random split is **optimistic**: its test rows are surrounded in time by training rows, so it says the year-long model will reach about 0.74 when it really reaches about 0.71. Second, the time split is not perfect (here it is pessimistic, because it trains on a month less and tests on the most drifted days), but it points in the right direction and, unlike the random split, it would have warned you that the model decays. Third, and most useful, when the world drifts, **old data hurts**: the model trained on only the last 90 days reaches about 0.89 in month 13, and the time split estimates that well. Choosing the training window is a design decision; evaluate several windows with time-based validation.

## 2.4 Imbalanced data

Fraud, failures and conversions are rare. Three tools, in order of preference:

| Tool | What it does | Caution |
|---|---|---|
| Choose the right metric | PR-AUC, precision at a fixed recall, cost (Chapter 4) | Accuracy is meaningless: 99.5% by predicting "no fraud" |
| Class weights | Errors on the rare class cost more in the loss | Shifts probabilities; recalibrate |
| Downsampling the majority class | Faster training; same positives | Probabilities must be corrected: multiply the odds by the sampling rate |
| Oversampling / SMOTE | Duplicates or synthesises positives | Easy to leak (synthesise before splitting); rarely beats weighting for tree models |

If you train on data where negatives were kept with probability *r*, the model's odds are inflated by 1/*r*. Correct them before using the probabilities for decisions:

```python run Correcting probabilities after negative downsampling
import numpy as np
from sklearn.linear_model import LogisticRegression

rng = np.random.default_rng(5)
n = 200_000
X = rng.normal(size=(n, 3))
logit = -5 + 1.0 * X[:, 0] + 0.8 * X[:, 1]
y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)
r = 0.05                                                   # keep 5% of negatives
keep = (y == 1) | (rng.random(n) < r)
m = LogisticRegression(max_iter=1000).fit(X[keep], y[keep])
p_raw = m.predict_proba(X)[:, 1]
odds = p_raw / (1 - p_raw) * r                              # undo the inflation
p_fixed = odds / (1 + odds)
print(f'true positive rate in data        {y.mean():.4f}')
print(f'mean predicted, uncorrected        {p_raw.mean():.4f}')
print(f'mean predicted, corrected          {p_fixed.mean():.4f}')
print(f'rows used for training            {keep.sum():,} of {n:,}')
```

Training used a small fraction of the rows, which is the point of downsampling, but the uncorrected model predicts a fraud probability many times too high on average. After the odds correction the average prediction matches the true rate again, so cost-based thresholds (Chapter 1.3) work.

## 2.5 Practical lessons

- Define the label precisely, including when it becomes known; train only on matured labels.
- For every feature ask: would I know this value at prediction time?
- Split by time whenever the world changes; random splits overestimate.
- With rare positives, pick the metric first; correct probabilities after downsampling.
