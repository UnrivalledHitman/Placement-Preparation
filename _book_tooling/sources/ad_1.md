# Chapter 3: Explaining Models
%Impurity versus permutation importance, correlated features, partial dependence and ICE, and SHAP values that add up

## 3.1 Two questions, two kinds of explanation

| Question | Kind | Tools |
|---|---|---|
| "Which features matter to this model overall?" | Global | Permutation importance, mean absolute SHAP, partial dependence |
| "Why did the model score **this** customer 0.83?" | Local | SHAP values, ICE curves, counterfactuals ("approved if income were 10% higher") |

Every method explains **the model**, not the world. A feature can matter to the model because it is a proxy for something else, and changing it in reality may change nothing. Causal questions need the methods of Chapters 4 and 5.

## 3.2 Impurity importance is biased

Tree libraries report a built-in importance: how much each feature reduced impurity across all splits. It is computed on the **training** data, and it favours features with many possible split points, such as continuous values and IDs, even when they are pure noise. **Permutation importance** instead shuffles one feature on held-out data and measures how much the score drops; a useless feature costs nothing when shuffled.

```python run A random noise column ranks highly by impurity, not by permutation
import numpy as np, pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance
from sklearn.model_selection import train_test_split

rng = np.random.default_rng(10)
n = 4000
X = pd.DataFrame({
    'tickets': rng.poisson(2, n),                              # real signal
    'plan_basic': rng.integers(0, 2, n),                       # real signal, binary
    'tenure': rng.normal(24, 10, n),                           # real signal
    'random_noise': rng.normal(0, 1, n),                       # continuous noise
    'random_flag': rng.integers(0, 2, n),                      # binary noise
})
logit = -2 + 0.5 * X['tickets'] + 0.8 * X['plan_basic'] - 0.04 * X['tenure']
y = rng.random(n) < 1 / (1 + np.exp(-logit))
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3, random_state=0)
rf = RandomForestClassifier(300, min_samples_leaf=1, n_jobs=1, random_state=0).fit(Xtr, ytr)
perm = permutation_importance(rf, Xte, yte, scoring='roc_auc', n_repeats=10, random_state=0,
        n_jobs=1)
table = pd.DataFrame({'impurity (train)': rf.feature_importances_,
                      'permutation (test AUC drop)': perm.importances_mean},
                              index=X.columns)
print(table.sort_values('impurity (train)', ascending=False).round(3))
```

The continuous noise column ranks near the top by impurity, because deep trees use its many distinct values to split off individual training rows. Shuffling it on test data changes nothing, so its permutation importance is about zero. The binary noise flag has few split points and fools neither method, but the same bias also works the other way: the real binary feature `plan_basic` ranks near the bottom by impurity, although permutation importance shows it matters.

## 3.3 Correlated features share the credit

Permutation importance has its own trap: if two features carry the same information, shuffling one leaves the other to cover for it, so **both** look unimportant.

```python run A duplicated feature hides from permutation importance
import numpy as np, pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance
from sklearn.model_selection import train_test_split

rng = np.random.default_rng(11)
n = 4000
usage = rng.normal(0, 1, n)
X = pd.DataFrame({'usage_kwh': usage, 'other': rng.normal(0, 1, n)})
y = rng.random(n) < 1 / (1 + np.exp(-(1.5 * usage + 0.5 * X['other'])))
X2 = X.assign(usage_copy=usage + rng.normal(0, 0.05, n))      # a near-duplicate column
for name, data in [('without the copy', X), ('with a near-copy', X2)]:
    Xtr, Xte, ytr, yte = train_test_split(data, y, test_size=0.3, random_state=0)
    rf = RandomForestClassifier(200, min_samples_leaf=20, n_jobs=1, random_state=0).fit(Xtr,
            ytr)
    imp = permutation_importance(rf, Xte, yte, scoring='roc_auc', n_repeats=10,
            random_state=0,
                                 n_jobs=1).importances_mean
    print(f'{name:17}: ' + ', '.join(f'{c} {v:.3f}' for c, v in zip(data.columns, imp)))
```

Usage is clearly the strongest driver in the first model; in the second, its importance is split and diminished. Before reading importances, check correlations, and permute **groups** of correlated features together.

## 3.4 Partial dependence and ICE

A **partial dependence plot** (PDP) shows the model's average prediction as one feature is varied while the others keep their observed values. **ICE** (individual conditional expectation) curves show the same for each row separately. When the ICE curves are parallel, the PDP summarises them well; when they fan out, the feature **interacts** with others, and the average hides it.

```python run The average effect hides an interaction
import numpy as np, pandas as pd
from lightgbm import LGBMRegressor
from sklearn.inspection import partial_dependence

rng = np.random.default_rng(12)
n = 5000
X = pd.DataFrame({'temperature': rng.uniform(-5, 35, n), 'has_ac': rng.integers(0, 2, n)})
# households with air conditioning use more power on hot days; others do not
y = 10 + 0.02 * (X['temperature'] - 15) ** 2 + X['has_ac'] * np.maximum(0,
        X['temperature'] - 22) * 1.5
y = y + rng.normal(0, 1, n)
model = LGBMRegressor(n_estimators=300, learning_rate=0.05, n_jobs=1, verbose=-1,
                      random_state=0).fit(X, y)
grid = np.array([0, 10, 20, 25, 30, 35])
pd_res = partial_dependence(model, X, ['temperature'], custom_values={'temperature': grid},
                            kind='both')
avg, ice = pd_res['average'][0], pd_res['individual'][0]
ac = X['has_ac'].to_numpy() == 1
print('temperature      :', grid)
print('PDP (average)    :', avg.round(1))
print('ICE mean, AC     :', ice[ac].mean(axis=0).round(1))
print('ICE mean, no AC  :', ice[~ac].mean(axis=0).round(1))
```

The PDP suggests one average curve. The ICE curves split into two groups: homes without air conditioning follow the gentle U-shape of the base load (heating when cold, about 18 at 35 °C), while homes with it climb to about 37, twice as high. A pricing or grid-planning decision based on the average would be wrong for both groups.

## 3.5 SHAP values

**SHAP** (SHapley Additive exPlanations) assigns each feature a contribution to one prediction, based on Shapley values from cooperative game theory: a feature's contribution is its average marginal effect over all orders in which features could be added. Its key property is **additivity**: the base value (the average model output) plus the contributions of all features equals the model's output for that row exactly. For tree models, TreeSHAP computes exact values quickly.

```python run SHAP contributions add up to the prediction
import warnings; warnings.filterwarnings('ignore')
import numpy as np, pandas as pd, shap
from lightgbm import LGBMClassifier

rng = np.random.default_rng(13)
n = 4000
X = pd.DataFrame({'tickets': rng.poisson(2, n), 'tenure': rng.normal(24, 10, n),
                  'plan_basic': rng.integers(0, 2, n), 'noise': rng.normal(0, 1, n)})
logit = -2 + 0.5 * X['tickets'] + 0.8 * X['plan_basic'] - 0.04 * X['tenure']
y = rng.random(n) < 1 / (1 + np.exp(-logit))
model = LGBMClassifier(n_estimators=200, learning_rate=0.05, n_jobs=1, verbose=-1,
                       random_state=0).fit(X, y)
explainer = shap.TreeExplainer(model)
sv = explainer.shap_values(X)                                  # log-odds contributions
raw = model.predict(X, raw_score=True)
print('additivity holds for every row:',
      np.allclose(explainer.expected_value + sv.sum(axis=1), raw, atol=1e-6))
print('mean |SHAP| :', ', '.join(f'{c} {v:.3f}' for c, v in
                               sorted(zip(X.columns, np.abs(sv).mean(axis=0)),
                                       key=lambda t: -t[1])))
i = int(np.argmax(raw))
print('riskiest customer:', X.iloc[i].round(1).to_dict())
print(f'  base value {explainer.expected_value:+.2f}')
for c, v in zip(X.columns, sv[i]):
    print(f'  {c:10} {v:+.2f}')
print(f'  = log-odds {raw[i]:+.2f} -> probability {1 / (1 + np.exp(-raw[i])):.2f}')
```

The global ranking recovers the true drivers (tickets, plan, tenure) with the noise feature last, but not at zero: the model gives pure noise an average contribution of 0.31 log-odds, because 200 trees learned patterns in it that do not exist. SHAP faithfully reports what the model does, including its overfitting; compare it with permutation importance on test data, and regularise (more `min_child_samples`, fewer trees). The local explanation says exactly how much each feature pushed this customer's log-odds up or down, which is what a support agent or a regulator asks for.

| Pitfall | Why |
|---|---|
| Reading SHAP as causal | It explains the model's use of a feature, not what happens if the feature is changed |
| Correlated features | Credit can be split arbitrarily between them, as with permutation importance |
| Output scale | For classifiers, contributions are usually in log-odds, not probability |
| Background data | Interventional SHAP depends on the reference data chosen; state it |

## 3.6 Practical lessons

- Do not trust impurity importance; use permutation importance on held-out data.
- Correlated features share or hide credit; permute them as a group.
- Look at ICE curves, not just the PDP: fanning curves mean interactions.
- SHAP values add up exactly to each prediction; they explain the model, not causality.

# Chapter 4: A/B Testing Beyond the Basics
%Sample-ratio checks, CUPED variance reduction, ratio metrics and the delta method, many metrics, and when users affect each other

## 4.1 What is already covered

The ML System Design guide, Chapter 5, explains why offline metrics are not enough, how to compute the sample size for a test, how to read a result with a confidence interval, why **peeking** at results inflates false positives, and the checklist of sanity checks. This chapter adds the techniques that experimentation teams at large companies use daily.

## 4.2 Check the sample ratio first

If an experiment is meant to split users 50/50 and the observed split is 50,810 against 49,190, something is broken: a bug in assignment, a redirect that loses users in one arm, bots filtered differently. A **sample ratio mismatch** (SRM) invalidates every metric, because the two groups are no longer comparable. A chi-squared test detects it.

```python run Testing for a sample ratio mismatch
from scipy.stats import chisquare
for treatment, control in [(50_120, 49_880), (50_810, 49_190)]:
    total = treatment + control
    stat, p = chisquare([treatment, control], [total / 2, total / 2])
    verdict = 'SRM: stop and debug' if p < 0.001 else 'consistent with 50/50'
    print(f'{treatment:,} vs {control:,}: chi2 = {stat:6.2f}, p = {p:.2e} -> {verdict}')
```

A 1.6% imbalance looks harmless but is far beyond chance at this size. Teams use a strict threshold such as p < 0.001 because the check runs on every experiment.

## 4.3 CUPED: fewer users for the same power

Much of the variance in a metric such as revenue per user comes from users being different, not from the treatment. **CUPED** (Controlled-experiment Using Pre-Experiment Data, introduced by Microsoft) removes the part predictable from each user's behaviour **before** the experiment:

Y<sub>adj</sub> = Y − θ (X − mean(X)), with θ = cov(X, Y) / var(X)

where X is the same metric in the pre-period. Because X was measured before assignment, it is independent of the treatment, so the adjustment does not bias the effect estimate; it only shrinks the variance, by a factor of 1 − ρ<sup>2</sup>, where ρ is the correlation between X and Y.

```python run Power with and without CUPED over 1,000 simulated experiments
import numpy as np
from scipy.stats import ttest_ind
rng = np.random.default_rng(14)

def experiment(n=2000, lift=0.6, rho=0.7):
    pre = rng.gamma(2.0, 5.0, 2 * n)                          # revenue before the test
    noise = rng.normal(0, 1, 2 * n) * pre.std() * np.sqrt(1 - rho ** 2) / rho
    post = pre + noise                                         # correlated with pre-period
    treat = np.arange(2 * n) < n
    post = post + lift * treat
    theta = np.cov(pre, post)[0, 1] / pre.var(ddof=1)
    adj = post - theta * (pre - pre.mean())
    p_raw = ttest_ind(post[treat], post[~treat]).pvalue
    p_cuped = ttest_ind(adj[treat], adj[~treat]).pvalue
    return p_raw, p_cuped, post.var(), adj.var(), adj[treat].mean() - adj[~treat].mean()

res = np.array([experiment() for _ in range(1000)])
print(f'variance kept by CUPED: {np.mean(res[:, 3] / res[:, 2]):.2f} (theory 1 - rho^2 = '
        f'{1 - 0.7 ** 2:.2f})')
print(f'power without CUPED: {np.mean(res[:, 0] < 0.05):.0%}, with CUPED: '
        f'{np.mean(res[:, 1] < 0.05):.0%}')
print(f'average estimated lift with CUPED: {res[:, 4].mean():.3f} (true 0.6, unbiased)')
```

With a pre-period correlation of 0.7, CUPED keeps about half the variance, which is like doubling the number of users. Power rises substantially at no cost, and the estimated effect stays unbiased.

## 4.4 Ratio metrics and the delta method

Many metrics are ratios: click-through rate = clicks / impressions, revenue per session. When users are randomised but the metric is computed over impressions, the impressions are **not independent**: one user contributes many, and users differ. Treating each impression as an independent trial makes the standard error far too small and produces false positives. The **delta method** gives the correct variance of a ratio of per-user sums; bootstrapping over users is a slower check.

```python run Naive versus delta-method standard error for click-through rate
import numpy as np
rng = np.random.default_rng(15)
users = 5000
impressions = rng.geometric(0.08, users)                       # heavy users see many more
user_ctr = rng.beta(2, 30, users)                              # users differ in taste
clicks = rng.binomial(impressions, user_ctr)
ctr = clicks.sum() / impressions.sum()

naive_se = np.sqrt(ctr * (1 - ctr) / impressions.sum())        # impressions treated as iid
mx, my = impressions.mean(), clicks.mean()
vx, vy, cxy = impressions.var(ddof=1), clicks.var(ddof=1), np.cov(impressions, clicks)[0, 1]
delta_var = (vy / mx ** 2 - 2 * my * cxy / mx ** 3 + my ** 2 * vx / mx ** 4) / users
boot = []
for _ in range(1000):
    idx = rng.integers(0, users, users)
    boot.append(clicks[idx].sum() / impressions[idx].sum())
print(f'CTR {ctr:.4f} from {impressions.sum():,} impressions by {users:,} users')
print(f'naive SE (iid impressions): {naive_se:.5f}')
print(f'delta-method SE          : {np.sqrt(delta_var):.5f}')
print(f'bootstrap over users SE  : {np.std(boot):.5f}')
from scipy.stats import norm
ratio = np.sqrt(delta_var) / naive_se
print(f'a nominal 5% test using the naive SE has a real false-positive rate of '
      f'{2 * (1 - norm.cdf(1.96 / ratio)):.0%}')
```

The naive standard error is about a quarter too small. That sounds minor, but it nearly triples the false-positive rate of a test meant to run at 5%. The bootstrap over users agrees with the delta method. Always compute the variance at the level of the **randomisation unit**.

## 4.5 Many metrics, many chances to be fooled

An experiment dashboard typically shows 20 or more metrics. If none of them truly changed, each still has a 5% chance of looking significant, so the chance that **at least one** does is 1 − 0.95<sup>20</sup> ≈ 64% (60% for the 18 null metrics simulated below). Corrections control this: **Bonferroni** (test each metric at α / m) controls the chance of any false positive but is conservative; **Benjamini–Hochberg** controls the **false discovery rate** (the expected share of false positives among the metrics flagged) and keeps more power.

```python run Twenty metrics: two real effects among eighteen nulls
import numpy as np
from scipy.stats import norm
rng = np.random.default_rng(16)
trials, m = 2000, 20
counts = {'uncorrected': [0, 0], 'Bonferroni': [0, 0], 'Benjamini-Hochberg': [0, 0]}
for _ in range(trials):
    z = rng.normal(0, 1, m)
    z[:2] += 3.0                                               # metrics 0 and 1 truly moved
    p = 2 * (1 - norm.cdf(np.abs(z)))
    order = np.argsort(p)
    below = p[order] <= 0.05 * np.arange(1, m + 1) / m
    k = np.max(np.nonzero(below)[0]) + 1 if below.any() else 0
    flagged = {'uncorrected': p < 0.05, 'Bonferroni': p < 0.05 / m,
               'Benjamini-Hochberg': np.isin(np.arange(m), order[:k])}
    for name, f in flagged.items():
        counts[name][0] += f[2:].any()                         # any false positive
        counts[name][1] += f[:2].sum()                         # true effects found
for name, (fp, tp) in counts.items():
    print(f'{name:19}: P(any false positive) {fp / trials:5.1%}, '
          f'true effects found {tp / (2 * trials):5.1%}')
```

Declare a single **primary metric** (the decision metric) and a few **guardrail metrics** (things that must not get worse, such as latency or unsubscribe rate) before the test starts; treat everything else as exploratory and correct for multiple comparisons.

## 4.6 When the assumptions break

| Problem | Example | Remedy |
|---|---|---|
| Interference between units (network effects) | Ride-hailing: treated riders take drivers from control riders; social features spread across friends | Randomise clusters (cities, friend groups) or use **switchback** designs that alternate the treatment over time in a whole market |
| Novelty and learning effects | Users click a new design out of curiosity; the lift fades over weeks | Run longer; plot the effect by days since first exposure; use holdout groups |
| Heterogeneous effects | Positive for new users, negative for power users | Pre-registered segment analysis; uplift models (Chapter 5) |
| Long-term effects | More notifications raise short-term clicks and long-term uninstalls | Long-running holdouts; surrogate metrics validated against long-term outcomes |
| Practical versus statistical significance | +0.05% revenue, p = 0.01 on 50 million users | Decide on a minimum effect worth shipping before the test, and read the confidence interval |

## 4.7 Practical lessons

- Check the sample ratio before reading any metric.
- Use CUPED with a pre-period covariate: it cuts variance by 1 − ρ² at no cost.
- Compute the variance at the randomisation unit; use the delta method for ratio metrics.
- Pre-register one primary metric and guardrails; correct for multiple comparisons; watch for interference and novelty.
