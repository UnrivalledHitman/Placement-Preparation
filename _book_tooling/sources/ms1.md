# Solutions

## Part 1 solutions

### M1.1 Name the task

| Goal | Decision | Task | Label |
|---|---|---|---|
| (a) Five jobs for a seeker | Which jobs, in which order | Ranking (two-stage retrieval + ranking) | Applied, or better: shortlisted by the recruiter |
| (b) Society's kWh tomorrow | How much power to buy | Regression / time-series forecasting (quantiles for safety margin) | Metered kWh next day |
| (c) Meters likely to fail | Which meters a technician visits | Classification ranked by risk, with a capacity limit | Failure confirmed within 30 days |
| (d) Auto-reply to "where is my order?" | Reply automatically or route to an agent | Intent classification + retrieval of order status (template or LLM) | Intent labels; resolved without escalation |
| (e) Which discount to offer | One of 3 actions per customer | Uplift modelling / contextual bandit (the effect of each action, not just purchase probability) | Purchase under the offered discount, from randomised offers |

Case (e) is a trap: predicting "will buy" rewards giving discounts to people who would buy anyway. The quantity that matters is the **uplift**, the difference the discount makes, which needs randomised data to learn.

### M1.2 Metrics at three levels

| Level | Metric | How it can be gamed alone |
|---|---|---|
| Business | Successful hires per month (or interviews scheduled) attributable to recommendations | Slow to measure; needs attribution |
| Online proxy | Applications per seeker per week | Recommend easy, low-quality jobs that attract many applications |
| Online proxy | Recruiter response rate to applications | Recommend only jobs where the seeker is overqualified |
| Offline | Recall@100 of later applications; NDCG@10 of applications weighted by recruiter response | Overfits to historical behaviour and popular jobs |
| Guardrail | Applications per job (concentration: no job flooded with thousands) | — |
| Guardrail | Share of recommendations to new or small employers; seeker complaints and "not relevant" clicks | — |

Pairing a seeker-side metric with a recruiter-side metric is the key idea for two-sided marketplaces: each one alone can be optimised at the other side's expense.

### M1.3 Thresholds from costs

```python run Visit thresholds for two visit costs
failure_cost = 6_000
for visit in (800, 1_500):
    t = visit / failure_cost
    print(f'visit cost Rs {visit:5,}: visit if P(failure) > {t:.3f}')
```

A visit is paid whether or not the meter would have failed, so it is worth it when the expected saving exceeds its cost: `p × 6 000 > visit cost`. (This differs from Chapter 1.3's formula because there the cost of a wrong block was paid only when the customer was good; here the visit cost is paid always.) In remote villages the threshold rises to 0.25, so only higher-risk meters get visits there. If technician capacity is fixed, rank by expected saving `p × 6 000 − visit cost` instead and fill the schedule from the top.

### M1.4 ML or not?

| Case | Choice | Reason |
|---|---|---|
| (a) Sanctions | Rules | Legal requirement, exact lists, must be explainable and complete |
| (b) Delivery time | ML | Many interacting factors that change; errors are tolerable and measurable |
| (c) Meter tampering | ML (with rules for known signatures) | Patterns are subtle and evolve; labels from inspections |
| (d) Bill from units and tariff | Plain code | Deterministic; any error is a bug |
| (e) Ticket urgency | ML (start with keyword rules) | Text classification; humans can correct the ranking |

## Part 2 solutions

### M2.1 Find the leaks

| Feature | Leaks? | Why |
|---|---|---|
| (a) Income at application | No | Known when deciding |
| (b) Collection calls | **Yes** | Calls happen after missed payments, i.e. after the outcome starts |
| (c) Credit score at application | No | Snapshot taken at decision time (but not "current credit score", which reflects the default) |
| (d) "Account closed" flag from today's database | **Yes** | Current state, not the state at application; defaulted accounts are closed |
| (e) Previous loans | No, if counted as of the application date | Leaks if counted including loans taken later |
| (f) Interest rate set by an underwriter who saw the risk score | **Indirect leak** / feedback | It encodes the old model's or the underwriter's judgement; the new model learns to imitate it, and it is not available before the decision the model supports |

### M2.2 Leakage through preprocessing

```python run Selecting features before cross-validation on pure noise
import numpy as np
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline

rng = np.random.default_rng(3)
X = rng.normal(size=(200, 2_000))                   # 2 000 features of pure noise
y = rng.integers(0, 2, 200)                         # labels unrelated to X
X_sel = SelectKBest(f_classif, k=20).fit_transform(X, y)    # WRONG: uses all labels
wrong = cross_val_score(LogisticRegression(max_iter=1000), X_sel, y, cv=5).mean()
pipe = make_pipeline(SelectKBest(f_classif, k=20), LogisticRegression(max_iter=1000))
right = cross_val_score(pipe, X, y, cv=5).mean()    # selection refitted inside each fold
print(f'selection outside CV: accuracy {wrong:.2f}')
print(f'selection inside CV:  accuracy {right:.2f}  (truth: 0.50, the labels are random)')
```

With 2 000 noise features, some correlate with the labels by chance; choosing them using all labels and then cross-validating reports a skill that does not exist. Inside a pipeline, each fold selects features from its own training part, and the estimate falls back to chance. The same rule applies to scaling, imputation, target encoding and oversampling: **fit every preprocessing step inside the training fold**.

### M2.3 Delayed labels

Train only on transactions older than the label maturity window (for example 90 days, or the window in which 95% of chargebacks have arrived). Evaluate the newest model on the most recent **matured** period, and track fast but partial signals (chargebacks reported so far, manual-review outcomes) for the latest weeks. If you include last week's transactions with "no chargeback yet" as negatives, many of them are frauds whose labels have not arrived: the model learns that recent-looking fraud patterns are legitimate, exactly when fraudsters change tactics. If you must use recent data, weight it by the probability that its label is final, or use survival-style models of label delay.

### M2.4 Downsampling correction

```python run Correcting a score of 0.30 after keeping 2% of negatives
import numpy as np
r, p = 0.02, 0.30
odds = p / (1 - p) * r
print(f'corrected probability {odds / (1 + odds):.4f}')

rng = np.random.default_rng(0)                       # check by simulation
n = 2_000_000
true_p = 0.0085
y = rng.random(n) < true_p                            # all cases with the same true risk
kept = y | (rng.random(n) < r)
print(f'share of positives in the downsampled data {y[kept].mean():.3f} '
      f'(what a model trained on it would output)')
```

A model trained on the downsampled data would score these cases about 0.30, while their real fraud probability is under 1%. Using 0.30 in a cost rule would block far too many customers.

## Part 3 solutions

### M3.1 Skew hunt

| Difference | Check |
|---|---|
| Window boundary: calendar days to midnight (batch) versus rolling 168 hours (online) | Compare the served value with a recomputation from raw events for a sample of requests |
| Time zone: UTC days in batch, IST in the service | Same; plus unit tests at midnight boundaries |
| Currency unit: rupees versus paise | Distribution of served values against training values (a 100× shift is obvious) |
| Refunds and reversals: subtracted in batch, ignored online | Recompute from the ledger for sampled users |
| Late events: batch includes events that arrived late, online does not yet | Freshness metrics; compare values computed at serve time with values recomputed a day later |
| Missing history: mean-imputed in training, zero online (guide Chapter 3.3) | Null-rate and default-value rate per feature, training versus serving |

The general fix is "log and train": log the feature values the service actually used, and build the next training set from those logs.

### M3.2 Precision at the operating point

```python run Filling a review capacity of 200 accounts a day
import numpy as np
rng = np.random.default_rng(14)
n, rate, capacity = 100_000, 0.002, 200
y = rng.random(n) < rate
score = rng.normal(loc=np.where(y, 2.6, 0.0), scale=1.0)
threshold = np.sort(score)[-capacity]
flag = score >= threshold
tp = (flag & y).sum()
print(f'frauds today {y.sum()}, flagged {flag.sum()}, threshold {threshold:.2f}')
print(f'precision {tp / flag.sum():.1%}, recall {tp / y.sum():.1%}, '
      f'frauds escaping review {y.sum() - tp}')
```

When review capacity is the constraint, the threshold is set by the capacity, not by a metric. Report precision (how much of the team's time finds fraud) and the frauds that escape; the business then decides whether more reviewers are worth it. A better model shows up as more frauds caught at the same 200 reviews.

### M3.3 Calibration check

```python run A random forest before and after isotonic calibration
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.isotonic import IsotonicRegression
from sklearn.metrics import brier_score_loss

rng = np.random.default_rng(6)
def data(n):
    X = rng.normal(size=(n, 6))
    logit = -3 + 1.5 * X[:, 0] - X[:, 1] + 0.7 * X[:, 2] * X[:, 3]
    return X, (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)
Xtr, ytr = data(20_000); Xcal, ycal = data(10_000); Xte, yte = data(20_000)
rf = RandomForestClassifier(n_estimators=200, min_samples_leaf=5, random_state=0,
                            n_jobs=1).fit(Xtr, ytr)
raw = rf.predict_proba(Xte)[:, 1]
iso = IsotonicRegression(out_of_bounds='clip').fit(rf.predict_proba(Xcal)[:, 1], ycal)
cal = iso.predict(raw)
b_raw, b_cal = brier_score_loss(yte, raw), brier_score_loss(yte, cal)
print(f'Brier raw {b_raw:.4f}  calibrated {b_cal:.4f}')
print('bin       n   raw mean  calibrated  observed')
for lo in np.arange(0, 1, 0.1):
    m = (raw >= lo) & (raw < lo + 0.1)
    if m.sum() >= 100:
        print(f'{lo:.1f}-{lo + 0.1:.1f} {m.sum():6d}    {raw[m].mean():.3f}     '
              f'{cal[m].mean():.3f}     {yte[m].mean():.3f}')
```

The honest result: this forest was **already well calibrated**. The raw and observed columns agree within a few points in every well-populated bin, and isotonic calibration leaves the Brier score unchanged (in the sparse top bins, with a hundred or so cases each, it even moves some values slightly away from the observed rate, because it was fitted on limited data). Forests with leaves of several samples and many trees often produce reasonable probabilities; forests grown to pure leaves, boosted trees with many rounds, class weights and downsampling usually do not. The lesson is the procedure, not the fix: **measure** calibration with a reliability table and the Brier score on held-out data, and calibrate only when it helps on a separate split.

### M3.4 Ranking metrics by hand

```python run P@3, recall@6, MRR and NDCG@6
import math
rels = [2, 0, 3, 0, 1, 0]
all_relevant = [3, 2, 2, 1]                      # includes the grade-2 document not returned
p3 = sum(r > 0 for r in rels[:3]) / 3
recall6 = sum(r > 0 for r in rels) / len(all_relevant)
mrr = next(1 / (i + 1) for i, r in enumerate(rels) if r > 0)
dcg = sum((2 ** r - 1) / math.log2(i + 2) for i, r in enumerate(rels))
ideal = sorted(all_relevant + [0, 0], reverse=True)[:6]
idcg = sum((2 ** r - 1) / math.log2(i + 2) for i, r in enumerate(ideal))
print(f'P@3 {p3:.3f}  recall@6 {recall6:.2f}  MRR {mrr:.2f}')
print(f'DCG {dcg:.3f}  ideal DCG {idcg:.3f}  NDCG@6 {dcg / idcg:.3f}')
```

By hand: DCG = 3/1 + 0 + 7/2 + 0 + 1/log<sub>2</sub>6 ≈ 3 + 3.5 + 0.387 = 6.887. The ideal list [3, 2, 2, 1, 0, 0] gives 7 + 3/1.585 + 3/2 + 1/2.322 ≈ 10.823, so NDCG ≈ 0.636. The missing relevant document lowers recall and the ideal-DCG comparison, which is why NDCG should be computed against all known relevant documents, not just the returned ones.

### M3.5 Offline up, online flat

| Cause | Check |
|---|---|
| Offline metric not aligned with purchases (it rewards clicks on cheap items) | Correlation of offline metric changes with past A/B results; offline metric weighted by purchase value |
| Logged-data bias: the test set only contains items the old ranker showed | Evaluate on randomised-exposure traffic, or with off-policy estimators |
| Training/serving skew in the new ranker's features | Compare served feature distributions with training; replay logged requests through both paths |
| Leakage inflated the offline gain | Time-based holdout; feature audit |
| The test is underpowered for a realistic effect | Compute the minimum detectable effect from the sample size; run longer or use interleaving |
| Most users never scroll past the top 3, where both rankers agree | Measure the share of sessions whose top results differ; segment the analysis |
| Latency increased and cancelled the gain | Compare page latency between arms; guardrail metrics |

## Part 4 solutions

### M4.1 Sample size

```python run Users and days for two detectable lifts
from statistics import NormalDist
z = NormalDist().inv_cdf
def n_per_group(p1, lift, alpha=0.05, power=0.8):
    p2 = p1 * (1 + lift)
    variance = p1 * (1 - p1) + p2 * (1 - p2)
    return (z(1 - alpha / 2) + z(power)) ** 2 * variance / (p2 - p1) ** 2
for lift in (0.05, 0.10):
    n = n_per_group(0.02, lift)
    print(f'{lift:4.0%} lift: {n:9,.0f} users per group, {2 * n / 50_000:5.1f} days')
```

Accepting a 10% minimum detectable effect cuts the duration by about a factor of four. Round the duration up to whole weeks so that weekday and weekend behaviour are both included.

### M4.2 Sample ratio mismatch

```python run Is 101 200 against 98 800 plausible under 50/50?
from statistics import NormalDist
a, b = 101_200, 98_800
n = a + b
chi2 = (a - n / 2) ** 2 / (n / 2) + (b - n / 2) ** 2 / (n / 2)
z = (a - n / 2) / (n * 0.25) ** 0.5
p = 2 * (1 - NormalDist().cdf(abs(z)))
print(f'chi-square {chi2:.1f} (1 degree of freedom), z {z:.2f}, p-value {p:.2e}')
```

A 50.6/49.4 split looks harmless, but with 200 000 users it is about 5 standard deviations from 50/50: practically impossible by chance. Do not analyse the metrics until the cause is found. Typical bugs: the treatment page crashes or redirects slowly for some browsers, so those users never log an exposure; bot filtering applied differently in the two arms; assignment based on a hash that is not uniform for some user-id formats; a caching layer serving control to treatment users.

### M4.3 Peeking with a correction

```python run Daily looks with a stricter boundary
import numpy as np
from statistics import NormalDist

rng = np.random.default_rng(9)
sims, days, per_day, p = 2_000, 20, 5_000, 0.05
for name, crit in (('|z| > 1.96 every day', NormalDist().inv_cdf(0.975)),
                   ('|z| > 2.80 every day', 2.80)):
    rng = np.random.default_rng(9)
    false = 0
    for _ in range(sims):
        a = rng.binomial(per_day, p, size=days).cumsum()
        b = rng.binomial(per_day, p, size=days).cumsum()
        n = per_day * np.arange(1, days + 1)
        pooled = (a + b) / (2 * n)
        z = (b / n - a / n) / np.sqrt(pooled * (1 - pooled) * 2 / n)
        false += np.any(np.abs(z) > crit)
    print(f'{name}: false-positive rate {false / sims:.1%}')
```

A stricter boundary at every look keeps the overall false-positive rate near the intended level while still allowing an early stop for a large effect. Proper group-sequential designs (Pocock, O'Brien–Fleming) compute the boundary exactly for the planned number of looks; O'Brien–Fleming boundaries are very strict early and close to 1.96 at the end, which preserves most of the power of a fixed-horizon test.

### M4.4 Experiment design for a marketplace

When buyers compete for the same limited supply, treatment users who get better recommendations take supply that control users would have bought. Treatment looks better partly by **taking** from control, an effect that disappears when everyone gets the new ranker (**interference**, a violation of the assumption that one user's treatment does not affect another's outcome). Designs that avoid it: randomise by **market cluster** (region or feeder) so that competing buyers share an arm; **switchback** experiments that alternate the whole market between rankers over time slots; or a **two-sided** randomisation with supply split between arms. Each costs statistical power, because there are fewer independent units.
