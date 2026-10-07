# Chapter 3: Features and Training/Serving Skew
%Feature groups, freshness, feature stores, and the silent bug of computing a feature differently in two places

## 3.1 Feature groups

| Group | Examples (fraud) | Freshness | Where computed |
|---|---|---|---|
| Request features | Amount, merchant category, device, time of day | Real time, in the request | Online service |
| Entity profile features | Account age, home city, average spend over 90 days | Daily batch | Batch pipeline (Spark, SQL) |
| Real-time aggregates | Transactions on this card in the last 10 minutes, distinct merchants in the last hour | Seconds | Stream processor (Flink, Kafka Streams) |
| Embeddings | Merchant embedding, user embedding | Daily or weekly | Training pipeline |
| Cross features | Amount ÷ user's average amount | At request time from the above | Online service |

## 3.2 Feature stores

A **feature store** keeps one definition of each feature and serves it in two places: an **offline store** (historical values, for building training sets) and an **online store** (latest values, low-latency key lookups for serving). Its two most important jobs are:

| Job | Problem it prevents |
|---|---|
| One feature definition used for training and serving | **Training/serving skew**: the same feature computed by two different code paths |
| Point-in-time-correct training data: for each training example, the feature value **as it was at that moment** | Leakage through features computed with data from after the event (Chapter 2.2) |

## 3.3 Training/serving skew, demonstrated

Skew is the most common reason a model that tested well underperforms after launch. Typical causes: a different default for missing values, a different unit (rupees versus paise), a different time window ("last 30 days" from midnight versus a rolling window), or a feature that is fresher in training (computed after the fact) than in serving. In the simulation, the training pipeline fills a missing 30-day spend with the training mean; the online service, written by another team, fills it with 0. Nothing crashes; only the predictions change.

```python run The same model, consistent versus skewed missing-value handling
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import roc_auc_score

rng = np.random.default_rng(3)
def data(n):
    spend = rng.lognormal(8, 0.6, n)                    # 30-day spend, Rs
    amount = spend / 30 * rng.lognormal(0, 0.8, n)      # this transaction
    ratio = amount / (spend / 30)
    y = (rng.random(n) < 1 / (1 + np.exp(-(-4 + 1.1 * np.log(ratio))))).astype(int)
    spend_seen = spend.copy()
    spend_seen[rng.random(n) < 0.25] = np.nan           # 25% of users: no history yet
    return np.column_stack([amount, spend_seen]), y

X_train, y_train = data(40_000)
fill = np.nanmean(X_train[:, 1])                        # training: impute the mean
X_t = X_train.copy(); X_t[np.isnan(X_t[:, 1]), 1] = fill
model = GradientBoostingClassifier(random_state=0).fit(X_t, y_train)

X_live, y_live = data(40_000)
consistent = X_live.copy(); consistent[np.isnan(consistent[:, 1]), 1] = fill
skewed = X_live.copy(); skewed[np.isnan(skewed[:, 1]), 1] = 0.0   # serving: impute 0
missing = np.isnan(X_live[:, 1])
for name, X in (('consistent', consistent), ('skewed', skewed)):
    p = model.predict_proba(X)[:, 1]
    print(f'{name:10s} AUC {roc_auc_score(y_live, p):.3f}  mean score {p.mean():.3f}  '
          f'mean score for users without history {p[missing].mean():.3f}')
print(f'true fraud rate {y_live.mean():.3f}')
```

With consistent handling the scores average close to the true fraud rate. With the skewed default, users without history get far higher scores, because a spend of 0 makes every transaction look enormous relative to the user's habits; the AUC also drops, and with the cost-based threshold of Chapter 1.3 a quarter of the users would be challenged far more often. **None of this raises an error.** It is found only by comparing feature distributions between training and serving (Chapter 7), or prevented by sharing one feature definition.

> TIP: In an interview, say how you prevent skew: one feature library used by both pipelines (or a feature store); log the features **as served** and train the next model on those logs ("log and train"); and monitor the distribution of every feature online against training.

## 3.4 Practical lessons

- Group features by freshness; each group has its own pipeline and failure modes.
- Training/serving skew is silent: one definition per feature, log served features, compare distributions.
- Training data must be point-in-time correct.

# Chapter 4: Offline Evaluation
%Metrics under class imbalance, calibration, choosing a threshold by cost, and metrics for ranking

## 4.1 ROC-AUC versus PR-AUC when positives are rare

ROC-AUC measures how well the model ranks a random positive above a random negative; it does not change when negatives become more numerous. Precision does: with 1 fraud in 1 000, even a small false-positive rate produces many false alarms per real fraud. The simulation keeps the model's quality fixed (the same score distributions for positives and negatives) and only changes the base rate.

```python run Same model quality, falling base rate
import numpy as np
from sklearn.metrics import roc_auc_score, average_precision_score

rng = np.random.default_rng(1)
n = 400_000
for rate in (0.2, 0.05, 0.01, 0.001):
    y = (rng.random(n) < rate).astype(int)
    score = rng.normal(loc=1.6 * y, scale=1.0)          # same separation for every rate
    roc, pr = roc_auc_score(y, score), average_precision_score(y, score)
    t = np.quantile(score[y == 1], 0.2)                 # threshold catching 80% of positives
    flagged = score >= t
    precision = y[flagged].mean()
    print(f'positives {rate:6.1%}: ROC-AUC {roc:.3f}  PR-AUC {pr:.3f}  '
          f'precision at 80% recall {precision:6.1%}  false alarms per hit '
          f'{(1 - precision) / precision:6.1f}')
```

ROC-AUC stays the same in every row, so it would tell you the model is equally good for a 20% problem and a 0.1% problem. The PR-AUC and the precision at 80% recall show what operations will experience: at a 0.1% base rate the same model raises hundreds of false alarms per fraud caught. For rare-event problems, report PR-AUC and precision at the operating recall, and the number of alerts per day a team must review.

## 4.2 Calibration

A model is **calibrated** if, among cases scored 0.2, about 20% are positive. Ranking metrics (AUC) ignore calibration, but any decision that uses the probability itself (cost thresholds, expected revenue = P(click) × bid, combining models) needs it. Boosted trees, class weights and downsampling all distort probabilities. **Isotonic regression** or **Platt scaling**, fitted on a held-out calibration set, map scores back to probabilities.

```python run Class weights distort probabilities; isotonic regression fixes them
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.isotonic import IsotonicRegression
from sklearn.metrics import brier_score_loss, roc_auc_score

rng = np.random.default_rng(4)
def data(n):
    X = rng.normal(size=(n, 4))
    logit = -3.2 + 1.3 * X[:, 0] + 0.8 * X[:, 1] - 0.6 * X[:, 2]
    return X, (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)
X_tr, y_tr = data(30_000); X_cal, y_cal = data(15_000); X_te, y_te = data(30_000)
model = LogisticRegression(class_weight='balanced', max_iter=1000).fit(X_tr, y_tr)
raw = model.predict_proba(X_te)[:, 1]
iso = IsotonicRegression(out_of_bounds='clip').fit(model.predict_proba(X_cal)[:, 1], y_cal)
fixed = iso.predict(raw)
print(f'positive rate {y_te.mean():.3f} | mean prediction raw {raw.mean():.3f}, '
      f'calibrated {fixed.mean():.3f}')
auc_raw, auc_cal = roc_auc_score(y_te, raw), roc_auc_score(y_te, fixed)
brier_raw, brier_cal = brier_score_loss(y_te, raw), brier_score_loss(y_te, fixed)
print(f'AUC raw {auc_raw:.3f}, calibrated {auc_cal:.3f} | '
      f'Brier raw {brier_raw:.4f}, calibrated {brier_cal:.4f}')
bins = np.linspace(0, 1, 11)
print('bin        n   predicted(raw)  predicted(cal)  observed')
for lo, hi in zip(bins[:-1], bins[1:]):
    m = (raw >= lo) & (raw < hi)
    if m.sum() >= 200:
        print(f'{lo:.1f}-{hi:.1f} {m.sum():6d}      {raw[m].mean():.3f}           '
              f'{fixed[m].mean():.3f}       {y_te[m].mean():.3f}')
plt.plot([0, 1], [0, 1], '--', color='grey', label='perfect')
for name, p in (('class-weighted', raw), ('after isotonic', fixed)):
    q = np.quantile(p, np.linspace(0, 1, 11))
    idx = np.clip(np.searchsorted(q, p, side='right') - 1, 0, 9)
    xs = [p[idx == k].mean() for k in range(10)]
    ys = [y_te[idx == k].mean() for k in range(10)]
    plt.plot(xs, ys, marker='o', label=name)
plt.xlabel('mean predicted probability'); plt.ylabel('observed positive rate')
plt.title('Reliability diagram (deciles of predictions)'); plt.legend()
plt.tight_layout(); plt.savefig('mlsd_calibration.png', dpi=150)
```

![Class weighting pushes predictions far above the observed rates; isotonic regression brings them back to the diagonal](figs/mlsd_calibration.png)

Class weighting left the ranking almost untouched (AUC barely moves) but inflated every probability: the average prediction is nearly four times the true rate, and the reliability table shows that cases predicted around 0.55 are positive only about 11% of the time. Isotonic regression restores the averages and lowers the Brier score (mean squared error of the probabilities). Calibrate on data the model was not trained on, and recalibrate after every retraining.

## 4.3 Choosing the threshold

With calibrated probabilities, the cost-optimal rule of Chapter 1.3 applies directly. When the costs are not known exactly, sweep the threshold and show the trade-off to the business: alerts per day, fraud caught, money saved. The program computes the expected monthly cost of each threshold for a stream of 1 million transactions per month.

```python run Expected monthly cost against the threshold
import numpy as np
rng = np.random.default_rng(8)
n = 1_000_000
y = (rng.random(n) < 0.004).astype(int)                          # 0.4% fraud
amount = rng.lognormal(7.5, 1.0, n)                              # Rs, median ~1 800
score = 1 / (1 + np.exp(-rng.normal(loc=-4 + 3.2 * y, scale=1.1)))
c_block = 300
best = None
print(' threshold  blocked   fraud caught  good blocked   cost (Rs lakh)')
for t in (0.01, 0.02, 0.05, 0.1, 0.2, 0.3, 0.5):
    blocked = score >= t
    missed = ((~blocked) & (y == 1))
    cost = amount[missed].sum() + c_block * (blocked & (y == 0)).sum()
    caught = (blocked & (y == 1)).sum() / y.sum()
    print(f'   {t:5.2f}   {blocked.sum():7,}      {caught:6.1%}     '
          f'{(blocked & (y == 0)).sum():7,}       {cost / 1e5:8.1f}')
    best = min(best or (cost, t), (cost, t))
print(f'lowest cost at threshold {best[1]}')
```

The cheapest threshold catches only part of the fraud: below it, the cost of blocking good customers grows faster than the fraud saved, and above it, missed fraud dominates. Presenting this table, rather than a single "F1 score", is what lets a business choose.

## 4.4 Ranking metrics

Recommendation and search systems return ordered lists, so they are evaluated with ranking metrics computed per query and averaged.

| Metric | Definition | Use when |
|---|---|---|
| Precision@k | Fraction of the top *k* that are relevant | Users see only *k* items |
| Recall@k | Fraction of all relevant items found in the top *k* | Candidate generation (Chapter 8): did we retrieve them at all? |
| MRR | Mean of 1 / rank of the **first** relevant item | One right answer (search for a known item, Q&A) |
| NDCG@k | Gain of relevant items discounted by log<sub>2</sub>(rank + 1), divided by the best possible | Graded relevance (great, good, irrelevant), position matters |
| MAP | Mean of precision at each relevant item's rank | Several relevant items, binary relevance |

```python run Ranking metrics for two orderings of the same results
import math

def dcg(rels, k):
    return sum((2 ** r - 1) / math.log2(i + 2) for i, r in enumerate(rels[:k]))
def ndcg(rels, k):
    ideal = dcg(sorted(rels, reverse=True), k)
    return dcg(rels, k) / ideal if ideal else 0.0
def mrr(rels):
    return next((1 / (i + 1) for i, r in enumerate(rels) if r > 0), 0.0)
def precision_at(rels, k):
    return sum(r > 0 for r in rels[:k]) / k

# graded relevance of the results each ranker returned, top first (3 great ... 0 useless)
rankers = {'ranker A': [0, 3, 0, 2, 1, 0, 0, 0, 1, 0],
           'ranker B': [2, 0, 3, 0, 0, 1, 1, 0, 0, 0]}
total_relevant = 5
for name, rels in rankers.items():
    rec5 = sum(r > 0 for r in rels[:5]) / total_relevant
    print(f'{name}: P@5 {precision_at(rels, 5):.2f}  R@5 {rec5:.2f}  MRR {mrr(rels):.2f}  '
          f'NDCG@5 {ndcg(rels, 5):.3f}  NDCG@10 {ndcg(rels, 10):.3f}')
```

The rankers win on different metrics. Ranker A finds more relevant results in its top five (better P@5 and R@5). Ranker B puts a relevant result first (MRR 1.0) and, because NDCG rewards graded relevance near the top, also wins on NDCG, even though A ranks the single best result higher. Choose the metric that matches the user experience (a search box rewards the first good result; a feed rewards the whole page), and report more than one.

## 4.5 Practical lessons

- For rare positives, ROC-AUC hides what matters; use PR-AUC, precision at the operating recall and alerts per day.
- Calibrate before using probabilities in decisions; check with a reliability table and the Brier score.
- Pick thresholds with a cost table the business can read.
- Ranking: recall@k for retrieval, NDCG or MRR for the final order.
