# Chapter 5: Causal Inference without Experiments
%Confounders and colliders, regression adjustment, propensity scores, difference-in-differences, regression discontinuity, instrumental variables and uplift

## 5.1 The question behind the question

"Customers who used premium support churned more" is a correlation. "Premium support makes customers churn" is a causal claim, and it is the one a business decision needs. Causal inference asks what would happen to the **same** units **with and without** a treatment. In the potential-outcomes framework, each customer has two outcomes, Y(1) if treated and Y(0) if not, and we only ever observe one of them. The **average treatment effect** (ATE) is the mean of Y(1) − Y(0).

A randomised experiment (Chapter 4) estimates it directly: randomisation makes the groups comparable in everything, observed or not. When randomising is impossible, unethical or too slow, the methods in this chapter estimate it from observational data, **each under assumptions that must be argued, not just computed**. Because our data is simulated, we know the true effect and can check every method.

## 5.2 Confounding and Simpson's paradox

A **confounder** affects both who gets the treatment and the outcome. Here, support agents offer premium support mostly to customers already at high risk of leaving, and premium support truly **reduces** churn by 5 percentage points.

```python run The treatment looks harmful overall and helpful in every group
import numpy as np, pandas as pd
rng = np.random.default_rng(20)
n = 20000
high_risk = rng.random(n) < 0.3
treated = rng.random(n) < np.where(high_risk, 0.7, 0.1)        # targeted at risky customers
p_churn = np.where(high_risk, 0.40, 0.10) - 0.05 * treated       # true effect: -5 points
df = pd.DataFrame({'high_risk': high_risk, 'treated': treated,
        'churn': rng.random(n) < p_churn})
naive = df.groupby('treated')['churn'].mean()
print(f'overall churn: treated {naive[True]:.3f}, untreated {naive[False]:.3f} '
      f'-> naive effect {naive[True] - naive[False]:+.3f}')
for risk, g in df.groupby('high_risk'):
    m = g.groupby('treated')['churn'].mean()
    print(f'high_risk={str(risk):5}: treated {m[True]:.3f}, untreated {m[False]:.3f} '
          f'-> effect {m[True] - m[False]:+.3f}')
weights = df['high_risk'].value_counts(normalize=True)
strat = sum(weights[r] * (g[g.treated].churn.mean() - g[~g.treated].churn.mean())
            for r, g in df.groupby('high_risk'))
print(f'stratified (adjusted) effect: {strat:+.3f}  (true -0.050)')
```

The naive comparison says premium support **raises** churn by about 13 points; within each risk group it lowers churn by about 5. The treated group is simply full of high-risk customers. Adjusting for the confounder, by comparing within strata and averaging, recovers the true effect.

## 5.3 What to adjust for, and what not to

Draw the causal graph (a DAG) first. Then:

| Variable type | Example | Adjust for it? |
|---|---|---|
| Confounder (causes treatment and outcome) | Risk level, before treatment | **Yes** |
| Mediator (treatment → it → outcome) | Number of support tickets resolved after premium support starts | **No**: it blocks part of the effect you want to measure |
| Collider (caused by both treatment and outcome) | "Was surveyed", when survey invitations depend on both | **No**: conditioning on it creates a fake association |
| Pure predictor of the outcome | Account age, unrelated to treatment assignment | Optional; it reduces variance (like CUPED) |

**Collider bias** surprises people most. Two traits that are completely independent in the population become correlated once you look only at a group selected on both of them.

```python run Selecting on a collider creates a correlation from nothing
import numpy as np
rng = np.random.default_rng(21)
skill, luck = rng.normal(size=100_000), rng.normal(size=100_000)    # independent
promoted = skill + luck > 1.5   # promotion depends on both
print(f'correlation in everyone    : {np.corrcoef(skill, luck)[0, 1]:+.3f}')
print(f'correlation among promoted : '
        f'{np.corrcoef(skill[promoted], luck[promoted])[0, 1]:+.3f}')
```

Among promoted employees, the lucky ones look less skilled, purely because of how the group was selected. The same mechanism produces "hospitalised patients with disease A rarely have disease B" and "restaurants with great food have worse locations".

## 5.4 Propensity scores

With many confounders, stratifying on all of them is impossible. The **propensity score** e(x) = P(treated | x) summarises them in one number: units with the same propensity are comparable, as if randomised, **provided every confounder is measured** (no unmeasured confounding) and every unit had some chance of either treatment (overlap). Two common estimators:

- **Inverse propensity weighting (IPW):** weight treated units by 1/e(x) and untreated units by 1/(1 − e(x)), which re-creates a population in which treatment is independent of x.
- **Matching:** pair each treated unit with the untreated unit of the closest propensity and compare outcomes.

```python run Naive, regression, IPW and matching estimates of a known effect
import numpy as np, pandas as pd
import statsmodels.formula.api as smf
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import NearestNeighbors

rng = np.random.default_rng(22)
n = 20000
df = pd.DataFrame({'tenure': rng.normal(24, 10, n), 'tickets': rng.poisson(2, n),
                   'spend': rng.gamma(2, 50, n)})
z = -1 + 0.4 * df['tickets'] - 0.03 * df['tenure'] + 0.004 * df['spend']
df['treated'] = (rng.random(n) < 1 / (1 + np.exp(-z))).astype(int)
base = 0.25 + 0.04 * df['tickets'] - 0.004 * df['tenure'] + 0.0005 * df['spend']
df['churn'] = (rng.random(n) < np.clip(base - 0.05 * df['treated'], 0, 1)).astype(int)
X = df[['tenure', 'tickets', 'spend']]

naive = df.loc[df.treated == 1, 'churn'].mean() - df.loc[df.treated == 0, 'churn'].mean()
ols = smf.ols('churn ~ treated + tenure + tickets + spend', data=df).fit()
e = LogisticRegression(max_iter=1000).fit(X, df['treated']).predict_proba(X)[:, 1]
t, y = df['treated'].to_numpy(), df['churn'].to_numpy()
ipw = np.mean(t * y / e) - np.mean((1 - t) * y / (1 - e))
nn = NearestNeighbors(n_neighbors=1).fit(e[t == 0].reshape(-1, 1))
_, idx = nn.kneighbors(e[t == 1].reshape(-1, 1))
att = np.mean(y[t == 1] - y[t == 0][idx[:, 0]])
print(f'naive difference         : {naive:+.3f}')
print(f'regression adjustment    : {ols.params["treated"]:+.3f} '
      f'(95% CI {ols.conf_int().loc["treated", 0]:+.3f} to '
              f'{ols.conf_int().loc["treated", 1]:+.3f})')
print(f'inverse propensity weight: {ipw:+.3f}')
print(f'propensity matching (ATT): {att:+.3f}')
print(f'true effect              : -0.050 | propensity range {e.min():.2f} to {e.max():.2f}')
```

The naive difference shows no effect at all (+0.002): the harm of targeting risky customers exactly cancels the benefit. All three adjusted estimates land near the true −5 points, and the regression's confidence interval contains it. The last line checks overlap: propensities near 0 or 1 would make IPW weights explode and matching impossible. **Doubly robust** estimators (for example augmented IPW) combine an outcome model with propensity weights and stay consistent if either one is right.

> TRAP: None of these methods can fix an **unmeasured** confounder. If agents also chose customers based on the tone of their complaints, which is not in the data, every estimate above is biased. Argue why the measured variables are enough, and test sensitivity.

## 5.5 Difference-in-differences

When a change is rolled out to one group (a city, a store, a product line) at a known time, compare **how much the treated group changed** with **how much a comparable untreated group changed** over the same period. The untreated group's change estimates what would have happened anyway (seasonality, market trends). The key assumption is **parallel trends**: without the treatment, both groups would have moved in parallel.

```python run New pricing in one city: before/after versus difference-in-differences
import numpy as np, pandas as pd
import statsmodels.formula.api as smf
rng = np.random.default_rng(23)
rows = []
for city, level in [('Pune', 100), ('Nagpur', 80)]:
    for week in range(20):
        trend = 1.5 * week + 8 * np.sin(week / 3)                  # shared seasonality
        post = week >= 10
        effect = 12 if (city == 'Pune' and post) else 0   # pricing raises sales by 12
        for store in range(10):
            rows.append(dict(city=city, week=week, post=int(post),
                    treated=int(city == 'Pune'),
                             sales=level + trend + effect + rng.normal(0, 5)))
df = pd.DataFrame(rows)
pune = df[df.city == 'Pune'].groupby('post')['sales'].mean()
print(f'before/after in Pune only : {pune[1] - pune[0]:+.1f}  (mixes the effect with the '
        f'trend)')
m = df.groupby(['treated', 'post'])['sales'].mean()
did = (m[1, 1] - m[1, 0]) - (m[0, 1] - m[0, 0])
print(f'difference-in-differences : {did:+.1f}  (true +12.0)')
fit = smf.ols('sales ~ treated * post', data=df).fit(cov_type='cluster',
        cov_kwds={'groups': df['week']})
lo, hi = fit.conf_int().loc['treated:post']
print(f'regression form           : {fit.params["treated:post"]:+.1f} (95% CI {lo:+.1f} to '
        f'{hi:+.1f})')
```

The before/after comparison attributes the general upward trend to the price change and overstates the effect by half. Difference-in-differences subtracts the trend measured in the comparison city; its estimate of 13.7 is off by noise, and its confidence interval (11.6 to 15.8) contains the true 12. Always plot the pre-treatment weeks for both groups: if their trends already diverged before the change, the parallel-trends assumption fails and the estimate is biased. **Synthetic control** builds a weighted combination of many untreated units that matches the treated unit's pre-period, when no single comparison group is convincing.

## 5.6 Regression discontinuity

When treatment is assigned by a threshold on a score (customers spending at least ₹10,000 get Gold status; students above a mark get a scholarship), units just above and just below the threshold are nearly identical, so the **jump** in the outcome at the threshold estimates the effect for units near it.

```python run The jump at the Gold-status threshold
import numpy as np, pandas as pd
import statsmodels.formula.api as smf
rng = np.random.default_rng(24)
spend = rng.uniform(5000, 15000, 8000)
gold = spend >= 10000
# true jump 0.06
retention = 0.4 + 0.00002 * spend + 0.06 * gold + rng.normal(0, 0.08, 8000)
df = pd.DataFrame({'run': (spend - 10000) / 1000, 'gold': gold.astype(int), 'y': retention})
naive = df[df.gold == 1].y.mean() - df[df.gold == 0].y.mean()
print(f'naive Gold vs others          : {naive:+.3f}  (includes the effect of spending '
        f'more)')
for bw in [1.0, 2.5, 5.0]:
    local = df[df.run.abs() <= bw]
    fit = smf.ols('y ~ gold + run + gold:run', data=local).fit()
    print(f'local linear, bandwidth ±{bw * 1000:5.0f}: jump {fit.params["gold"]:+.3f} '
          f'(SE {fit.bse["gold"]:.3f}, n={len(local)})')
print('true jump: +0.060')
```

A narrow bandwidth uses only the most comparable customers but has more noise; a wide one is more precise but leans on the linear model being right far from the threshold. Check that units cannot manipulate their score to cross the threshold (a pile-up just above it is a warning sign).

## 5.7 Instrumental variables

When an **unmeasured** confounder exists, an **instrument** can still identify the effect: a variable that changes the treatment, affects the outcome **only through** the treatment, and is unrelated to the confounder. Randomised **encouragements** are the classic instrument: a random half of users receive an email inviting them to try a feature; the email shifts usage but cannot plausibly change retention by itself.

```python run Two-stage least squares with a randomised encouragement
import numpy as np
import statsmodels.api as sm
rng = np.random.default_rng(25)
n = 20000
motivation = rng.normal(size=n)                                 # unobserved confounder
email = rng.integers(0, 2, n)                                   # randomised instrument
usage = (0.3 * email + 0.8 * motivation + rng.normal(size=n) > 0.5).astype(float)
retention = 2.0 * usage + 1.5 * motivation + rng.normal(size=n)  # true effect of usage: 2.0

naive = sm.OLS(retention, sm.add_constant(usage)).fit().params[1]
stage1 = sm.OLS(usage, sm.add_constant(email)).fit()
usage_hat = stage1.fittedvalues
fit2 = sm.OLS(retention, sm.add_constant(usage_hat)).fit()
stage2 = fit2.params[1]
resid = retention - fit2.params[0] - stage2 * usage           # residuals with ACTUAL usage
se_iv = np.sqrt(resid.var() / (n * usage_hat.var()))
print(f'naive regression of retention on usage : {naive:.2f}  (biased by motivation)')
print(f'first stage: email raises usage by     : {stage1.params[1]:.3f} (F = '
        f'{stage1.fvalue:.0f})')
print(f'two-stage least squares estimate       : {stage2:.2f} (SE {se_iv:.2f}; true 2.00)')
```

Motivated users both use the feature more and stay longer, so the naive estimate credits usage with the effect of motivation. The instrument uses only the part of usage that the random email caused. The estimate is noisy: its standard error is several times the regression's, because only the small, email-driven part of usage is used. The truth lies about one standard error away. The first-stage F statistic checks that the instrument is strong; weak instruments (F below about 10) give unstable, biased estimates. The standard error must be computed from residuals using **actual** usage, as above; the second-stage regression's own standard errors are wrong (libraries such as `linearmodels` handle this).

## 5.8 Uplift modelling: whom to treat

The ATE answers "does the treatment work on average?". Targeting needs the **conditional** effect: for whom does it work? An **uplift model** predicts each customer's individual effect. The simplest is the **T-learner**: train one outcome model on treated customers and one on untreated customers (from a randomised test), and score each customer by the difference.

```python run T-learner uplift: targeting the customers a discount actually changes
import numpy as np
from lightgbm import LGBMClassifier
rng = np.random.default_rng(26)
n = 40000
X = np.column_stack([rng.normal(size=n), rng.normal(size=n), rng.integers(0, 2, n)])
treat = rng.integers(0, 2, n)                                   # randomised discount
# some respond, some annoyed
true_uplift = 0.10 * (X[:, 0] > 0.5) * (X[:, 2] == 1) - 0.03 * (X[:, 1] > 1)
p = 0.15 + 0.05 * X[:, 1].clip(-2, 2) + treat * true_uplift
y = (rng.random(n) < p.clip(0, 1)).astype(int)
tr = np.arange(n) < n // 2   # train on half, evaluate on half
models = {}
for arm in [0, 1]:
    idx = tr & (treat == arm)
    models[arm] = LGBMClassifier(n_estimators=200, learning_rate=0.05,
            min_child_samples=100,
                                 n_jobs=1, verbose=-1, random_state=0).fit(X[idx], y[idx])
te = ~tr
score = models[1].predict_proba(X[te])[:, 1] - models[0].predict_proba(X[te])[:, 1]
order = np.argsort(-score)
yt, tt = y[te][order], treat[te][order]
def effect(sel):
    return yt[sel][tt[sel] == 1].mean() - yt[sel][tt[sel] == 0].mean()
k = len(order) // 5
print(f'average effect over everyone      : {effect(slice(None)):+.3f}')
print(f'effect in the top 20% by uplift   : {effect(slice(0, k)):+.3f}')
print(f'effect in the bottom 20% by uplift: {effect(slice(-k, None)):+.3f}')
print(f'true mean uplift in the top 20%   : {true_uplift[te][order][:k].mean():+.3f}')
```

The discount barely helps on average, a large positive effect hides in one segment, and a group is slightly put off by it. Sending it only to the top-scored fifth gives more total benefit than sending it to everyone (0.041 × 20% ≈ 0.008 extra conversions per customer, against 0.007), at a fifth of the cost. Uplift must be evaluated on randomised data, as here, because only the difference between arms inside a segment shows the causal effect.

## 5.9 Choosing a method

| Situation | Method | Key assumption |
|---|---|---|
| You can randomise | A/B test | Correct randomisation, no interference |
| Rich data on why units were treated | Regression adjustment, propensity scores, doubly robust | No unmeasured confounders; overlap |
| Change at a known time for some groups | Difference-in-differences, synthetic control | Parallel trends |
| Treatment assigned by a score threshold | Regression discontinuity | No manipulation; continuity at the threshold |
| Unmeasured confounding, but a valid instrument | Instrumental variables (2SLS) | Relevance, exclusion, independence of the instrument |
| Deciding whom to treat | Uplift models on randomised data | Randomised training data |

## 5.10 Practical lessons

- Draw the causal graph; adjust for confounders, never for mediators or colliders.
- Propensity methods work only if every confounder is measured; check overlap.
- Difference-in-differences needs parallel pre-trends; regression discontinuity needs an unmanipulated threshold.
- Instruments handle unmeasured confounding if they are strong and truly excluded; uplift models decide whom to treat.
