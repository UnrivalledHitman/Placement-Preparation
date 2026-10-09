## Part 3 solutions

### E3.1 MAPE versus WAPE

The absolute errors are 4, 10, 10 and 0, so MAE = 24 / 4 = **6 units**. MAPE averages percentage errors: (4/2 + 10/100 + 10/100 + 0/100) / 4 = (200% + 10% + 10% + 0%) / 4 = **55%**. WAPE divides total error by total actuals: 24 / 302 = **7.9%**.

```python run Checking E3.1
import numpy as np
actual, forecast = np.array([2, 100, 100, 100]), np.array([6, 90, 110, 100])
err = np.abs(actual - forecast)
print(f'MAE {err.mean():.1f}, MAPE {np.mean(err / actual):.0%}, WAPE '
        f'{err.sum() / actual.sum():.1%}')
```

One slow day with 2 units sold dominates MAPE: the forecast was off by 4 units, a trivial miss, but 200% in relative terms. WAPE weights each day by its volume, so it reflects what the store actually experiences, and MAE gives the error in units. Show the manager WAPE (or MAE in units); MAPE misleads whenever some actuals are small.

### E3.2 Random splits flatter a forecaster

```python run Shuffled K-fold versus a time-ordered split
import warnings; warnings.filterwarnings('ignore')
import numpy as np, pandas as pd
from lightgbm import LGBMRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import KFold, TimeSeriesSplit

rng = np.random.default_rng(60)
t = np.arange(900)
y = pd.Series(100 + 0.15 * t + 10 * np.sin(2 * np.pi * t / 7) + np.cumsum(rng.normal(0, 1,
        900)))
df = pd.DataFrame({'y': y, 'lag1': y.shift(1), 'lag7': y.shift(7), 'dow': t % 7,
        't': t}).dropna()
X, target = df.drop(columns='y'), df['y']

def cv_mae(splitter):
    errs = []
    for tr, te in splitter.split(X):
        m = LGBMRegressor(n_estimators=300, learning_rate=0.05, n_jobs=1, verbose=-1,
                random_state=0)
        m.fit(X.iloc[tr], target.iloc[tr])
        errs.append(mean_absolute_error(target.iloc[te], m.predict(X.iloc[te])))
    return np.mean(errs)

print(f'shuffled 5-fold CV MAE      : {cv_mae(KFold(5, shuffle=True, random_state=0)):.2f}')
print(f'time-ordered (expanding) MAE: {cv_mae(TimeSeriesSplit(5)):.2f}')
```

With shuffled folds, every test day has training days on both sides of it; the model effectively interpolates between neighbours and even learns from the future. Time-ordered splits force genuine forecasting, and the error is several times larger, which is what production will see. The time-ordered error also includes the trap from E3.3: later folds contain values of `t` and `y` above anything in training.

### E3.3 Trees cannot extrapolate a trend

```python run Forecasting levels versus forecasting differences
import warnings; warnings.filterwarnings('ignore')
import numpy as np, pandas as pd
from lightgbm import LGBMRegressor
rng = np.random.default_rng(61)
t = np.arange(400)
y = 50 + 0.5 * t + 6 * np.sin(2 * np.pi * t / 7) + rng.normal(0, 1.5, 400)
cal = pd.DataFrame({'t': t, 'dow': t % 7})
train, test = slice(0, 340), slice(340, 400)

levels = LGBMRegressor(n_estimators=400, learning_rate=0.05, n_jobs=1, verbose=-1,
        random_state=0)
levels.fit(cal[train], y[train])
pred_levels = levels.predict(cal[test])

diff = np.diff(y, prepend=np.nan)                        # forecast the daily change instead
deltas = LGBMRegressor(n_estimators=400, learning_rate=0.05, n_jobs=1, verbose=-1,
        random_state=0)
deltas.fit(cal[1:340], diff[1:340])
pred_diff = y[339] + np.cumsum(deltas.predict(cal[test]))

for name, p in [('LightGBM on levels', pred_levels), ('LightGBM on differences',
        pred_diff)]:
    print(f'{name:24}: MAE {np.mean(np.abs(p - y[test])):5.1f}, last forecast {p[-1]:6.1f} '
          f'(actual {y[399]:.1f})')
print(f'highest value in training: {y[train].max():.1f}')
```

The levels model cannot predict anything above the largest value it saw in training, so its forecast goes flat while the series keeps rising, and its error grows every day. Modelling differences turns the trend into a constant mean change, which the trees can learn; adding the predicted changes back follows the trend. Alternatives: detrend with a linear model and boost the residuals, or use a model with a linear component.

### E3.4 Kaplan–Meier by hand

| Time | At risk | Churned | Factor | S(t) |
|---|---|---|---|---|
| 2 | 8 | 1 | 7/8 | 0.875 |
| 3 (censored) | | | | 0.875 |
| 4 | 6 | 2 | 4/6 | 0.583 |
| 6 (censored) | | | | 0.583 |
| 7 | 3 | 1 | 2/3 | 0.389 |
| 9 (censored) | | | | 0.389 |
| 10 | 1 | 1 | 0 | 0 |

The censored customers at 3, 6 and 9 count as at risk up to their time and then drop out of the risk set without counting as churns. The median lifetime is the first time S falls to 0.5 or below: **7 months**.

```python run Checking with statsmodels
import numpy as np
from statsmodels.duration.survfunc import SurvfuncRight
time = np.array([2, 3, 4, 4, 6, 7, 9, 10])
event = np.array([1, 0, 1, 1, 0, 1, 0, 1])
sf = SurvfuncRight(time, event)
print('times    :', sf.surv_times)
print('survival :', sf.surv_prob.round(3))
print('median   :', sf.quantile(0.5))
```

Note how few customers remain at risk towards the end: the final drop to zero rests on a single customer, so the tail of the curve is very uncertain.

### E3.5 What is an annual contract worth?

```python run Lifetime values from Weibull survival curves
import numpy as np
shape, margin, d = 1.2, 400, 0.01
months = np.arange(1, 61)
clv = {}
for plan, median in [('monthly', 10), ('annual', 30)]:
    scale = median / np.log(2) ** (1 / shape)            # Weibull scale from the median
    surv = np.exp(-(months / scale) ** shape)
    clv[plan] = np.sum(margin * surv / (1 + d) ** months)
    print(f'{plan:7}: S(12) {surv[11]:.2f}, S(36) {surv[35]:.2f}, 5-year CLV Rs '
            f'{clv[plan]:,.0f}')
print(f'maximum worth paying to switch one customer: Rs '
        f'{clv["annual"] - clv["monthly"]:,.0f}')
```

The difference in lifetime value is the **upper bound** on what a switch is worth, if the contract itself causes the longer lifetime. Part of the gap is probably selection: loyal customers choose annual plans. The causal value of moving a given monthly customer is smaller and should be measured with an experiment (offer the incentive to a random half of eligible customers), before paying anything close to the bound.

### E3.6 Framing churn

| | Classification (churn within 30 days) | Survival (time to churn) |
|---|---|---|
| Question answered | Who is likely to leave soon? | When are they likely to leave, and how does risk evolve? |
| Uses censored customers | Only if the 30-day window is fully observed | Yes, naturally |
| Output | A probability for one horizon | A full survival curve; any horizon; lifetime value |
| Good for | A weekly retention campaign with one decision point | Lifetime value, contract design, comparing cohorts, risk over tenure |

Common mistakes with the classification framing: labelling customers whose 30-day window is not yet over as "did not churn" (censoring ignored, so churn is underestimated); computing features after the prediction date (leakage); training on one fixed date only, so the model learns that date's seasonality; and predicting customers who would leave anyway regardless of any action, when the business needs to know who can be **saved** (uplift, Chapter 5 of the guide).

## Part 4 solutions

### E4.1 Item-item CF by hand

Item counts: A 3 (U1, U2, U5), B 4 (U1, U2, U3, U5), C 3 (U2, U3, U4), D 1, E 1. Co-occurrences with A: B 3 (U1, U2, U5), C 1 (U2), E 1 (U5), D 0. Cosine similarity: sim(A, B) = 3 / √(3 × 4) = 0.866; sim(A, C) = 1 / √(3 × 3) = 0.333; sim(A, E) = 1 / √(3 × 1) = 0.577; sim(A, D) = 0. Recommend **B**.

```python run Checking E4.1
import numpy as np
items = list('ABCDE')
baskets = [{'A', 'B'}, {'A', 'B', 'C'}, {'B', 'C'}, {'C', 'D'}, {'A', 'B', 'E'}]
X = np.array([[i in b for i in items] for b in baskets], float)
co = X.T @ X
sim = co / np.sqrt(np.outer(np.diag(co), np.diag(co)))
for j, item in enumerate(items):
    if item != 'A':
        print(f'sim(A, {item}) = {sim[0, j]:.3f}')
```

E is more similar to A than C is, although only one user bought E: cosine similarity rewards rare items that co-occur once. Real systems damp this with minimum support counts or shrinkage (dividing by count + a constant).

### E4.2 Trading recall for coverage

```python run Popularity-penalised re-ranking
import numpy as np
rng = np.random.default_rng(62)
users, items, k = 600, 400, 5
U, V = rng.normal(size=(users, k)), rng.normal(size=(items, k))
pop = rng.zipf(1.6, items).clip(1, 200).astype(float)
score = U @ V.T + 0.8 * np.log(pop)[None, :]
train, test = np.zeros((users, items), bool), []
for u in range(users):
    p = np.exp(score[u] - score[u].max()); p /= p.sum()
    chosen = rng.choice(items, rng.integers(15, 40), replace=False, p=p)
    train[u, chosen[:-5]] = True
    test.append(set(chosen[-5:]))
X = train.astype(float)
counts = X.sum(axis=0) + 1
norms = np.sqrt(counts)
sim = (X.T @ X) / norms[:, None] / norms[None, :]
np.fill_diagonal(sim, 0)
raw = X @ sim
for alpha in [0, 0.25, 0.5, 1.0]:
    s = np.where(train, -np.inf, raw / counts ** alpha)
    top = np.argsort(-s, axis=1)[:, :10]
    recall = np.mean([len(set(top[u]) & test[u]) / 5 for u in range(users)])
    print(f'alpha {alpha:4}: recall@10 {recall:.3f}, coverage '
            f'{len(np.unique(top)) / items:.0%}')
```

A mild penalty (α = 0.25) is a free win here: recall even rises slightly (0.311 against 0.305), because cosine scores over-reward popular items, while coverage doubles from 32% to 63%. At α = 0.5 recall collapses, and at α = 1 the penalty is so strong that everyone gets the same handful of rarely bought items, so even coverage falls back to 35%. The useful range is narrow, which is why the penalty is tuned rather than guessed. Choose α with an online test that measures both engagement and long-term outcomes (diverse recommendations can improve retention even when short-term clicks dip slightly).

### E4.3 Cold start

| Stage | Approach |
|---|---|
| Day 1 | Global and regional popularity (charts from comparable countries, adjusted with local editorial or label input); content-based similarity using audio features, genre, language and artist metadata; an onboarding step where users pick a few artists or genres |
| Week 1 | Session-based recommendations (what users play next within a session); collaborative filtering seeded with data from similar markets; bandits that explore new local songs and quickly learn which ones catch on |
| After three months | Full collaborative filtering and matrix factorisation on local listening; hybrid models that keep content features for new releases (item cold start never ends); per-user models for active listeners |

Throughout, log what was shown (exposures), not just what was played, so the system can learn from items users skipped and correct for its own recommendations shaping the data.

### E4.4 Should we roll out the new pricing?

The result is promising (the interval for revenue excludes zero), but a pricing decision needs more than one number:

| Question | Why it matters |
|---|---|
| Is +3.1% above the minimum effect worth the risk, and does the lower bound (+0.4%) still justify it? | Statistical significance is not business significance |
| What happened to retention and refunds over a longer horizon? | Higher prices often raise short-term revenue and lose customers later; two weeks cannot show churn |
| Did conversion fall for new customers specifically? | A −1.2% non-significant drop could hide a large drop in a key segment (acquisition) |
| Novelty or timing effects? | Was the test period typical (no festival, no competitor sale)? |
| Guardrails | Support tickets, complaints, payment failures, cancellations |
| Fairness and regulation | Are some groups paying more in ways that create legal or reputational risk? |

A reasonable recommendation: roll out to a larger share while keeping a **long-running holdout** (for example 5% of users stay on old prices for three months) to measure retention and lifetime value, with pre-agreed stop conditions on churn and complaints.

### E4.5 A churn-reduction programme

| Step | Design |
|---|---|
| Data | Point-in-time features (usage trends, tickets, billing, tenure, plan), churn events with censoring, past offers and responses |
| Risk model | Survival or 30-day churn model, validated by time-based backtests; calibrated probabilities |
| Whom to treat | Not simply the highest risk: an **uplift** model trained on a randomised pilot (offer to a random half of at-risk customers) finds who changes behaviour because of the offer; exclude "sure things" and "lost causes" |
| Offer economics | Treat when uplift × lifetime value saved > offer cost; vary offer size in the pilot to learn the response curve |
| Proof | A permanent randomised holdout among eligible customers; primary metric: 90-day retention; guardrail: margin per customer |
| Keep it working | Monitor drift in features and uplift; retrain quarterly; rerun the pilot design periodically because customers learn to expect discounts (a feedback loop) |

### E4.6 A messy result

The primary metric is flat with a confidence interval spanning zero, so the experiment did not show that the new checkout increases orders. The guardrail failed: a 120 ms slower page load is a real cost (and could itself be suppressing orders). The mobile result is one of 12 segment comparisons: with that many looks, at least one p < 0.05 is likely by chance (about 46% if none of the segments truly differ), so it is a hypothesis, not a finding.

Recommendation: do not ship as is. Fix the performance regression first; if there is a plausible reason the design helps mobile users specifically, run a **new, pre-registered** experiment on mobile with orders per user as the primary metric and page load as a guardrail.
