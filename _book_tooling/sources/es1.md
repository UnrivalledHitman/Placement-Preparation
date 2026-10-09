# Solutions
%Every analysis executed on generated data with fixed seeds

## Part 1 solutions

### E1.1 Smoothed target encoding

Encoding = (positives + k × prior) / (count + k):

- small city: (2 + 20 × 0.2) / (3 + 20) = 6 / 23 = **0.261** (raw rate 0.667);
- large city: (150 + 4) / (300 + 20) = 154 / 320 = **0.481** (raw rate 0.500).

Smoothing acts like adding k = 20 imaginary customers at the overall rate. For a city with 3 real customers, the imaginary ones dominate and the encoding stays near 20%: two churners out of three is weak evidence. For a city with 300 customers, the real data dominates. This is a Bayesian posterior mean with a Beta prior, and it is what stops rare categories from being encoded with extreme, noisy values.

```python run Checking E1.1
prior, k = 0.2, 20
for name, pos, n in [('small city', 2, 3), ('large city', 150, 300)]:
    print(f'{name}: raw {pos / n:.3f} -> smoothed {(pos + k * prior) / (n + k):.3f}')
```

### E1.2 The model that predicts noise

```python run Feature selection outside versus inside cross-validation
import numpy as np
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.pipeline import make_pipeline

rng = np.random.default_rng(50)
X, y = rng.normal(size=(200, 2000)), rng.integers(0, 2, 200)      # pure noise
cv = StratifiedKFold(5, shuffle=True, random_state=0)
X_sel = SelectKBest(f_classif, k=20).fit_transform(X, y)          # LEAK: uses every label
leaky = cross_val_score(LogisticRegression(max_iter=1000), X_sel, y, cv=cv,
        scoring='roc_auc')
honest = cross_val_score(make_pipeline(SelectKBest(f_classif, k=20),
        LogisticRegression(max_iter=1000)),
                         X, y, cv=cv, scoring='roc_auc')
print(f'selection on all rows, then CV : AUC {leaky.mean():.3f}')
print(f'selection inside each CV fold  : AUC {honest.mean():.3f}  (truth: 0.5, labels are '
        f'random)')
```

With 2,000 random features and only 200 rows, some features correlate with the labels by chance. Selecting them using **all** labels, including those of the future validation folds, bakes the validation answers into the features, and cross-validation reports an impressive AUC on pure noise. Inside a pipeline, selection is refitted on each training fold only, and the AUC falls to chance, which is the truth. Any data-dependent step (selection, scaling, imputation, encoding, resampling) belongs inside the pipeline.

### E1.3 Boosting for classification from scratch

```python run Gradient boosting with log loss
import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeRegressor

X, y = make_classification(n_samples=4000, n_features=10, n_informative=5, flip_y=0.05,
        random_state=51)
Xtr, Xva, ytr, yva = train_test_split(X, y, test_size=0.3, random_state=0)
sigmoid = lambda z: 1 / (1 + np.exp(-z))
logloss = lambda yy, p: -np.mean(yy * np.log(p) + (1 - yy) * np.log(1 - p))

base = np.log(ytr.mean() / (1 - ytr.mean()))
f_tr, f_va = np.full(len(ytr), base), np.full(len(yva), base)
for m in range(1, 101):
    residual = ytr - sigmoid(f_tr)                     # negative gradient of log loss
    tree = DecisionTreeRegressor(max_depth=2, random_state=0).fit(Xtr, residual)
    f_tr += 0.1 * tree.predict(Xtr)
    f_va += 0.1 * tree.predict(Xva)
    if m in (1, 10, 30, 100):
        print(f'round {m:3}: train log loss {logloss(ytr, sigmoid(f_tr)):.4f}, '
              f'validation {logloss(yva, sigmoid(f_va)):.4f}')
print(f'starting log loss (base rate only): '
        f'{logloss(yva, np.full(len(yva), ytr.mean())):.4f}')
```

The only change from regression is the gradient: for log loss on the log-odds scale it is y − p, so trees are still fitted to "residuals", but the residuals live on the probability scale while the model adds up log-odds. (Production libraries also use the second derivative, p(1 − p), to set each leaf's value with a Newton step, which converges in fewer rounds.)

### E1.4 Where overfitting starts

```python run Training and validation loss over 2,000 rounds
import warnings; warnings.filterwarnings('ignore')
import numpy as np
from lightgbm import LGBMClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

X, y = make_classification(n_samples=5000, n_features=20, n_informative=6, flip_y=0.15,
        random_state=52)
Xtr, Xva, ytr, yva = train_test_split(X, y, test_size=0.3, random_state=0)
m = LGBMClassifier(n_estimators=2000, learning_rate=0.1, n_jobs=1, verbose=-1,
        random_state=0)
m.fit(Xtr, ytr, eval_set=[(Xtr, ytr), (Xva, yva)], eval_names=['train', 'valid'],
      eval_metric='binary_logloss')
tr = np.array(m.evals_result_['train']['binary_logloss'])
va = np.array(m.evals_result_['valid']['binary_logloss'])
best = int(np.argmin(va)) + 1
for r in [10, best, 500, 2000]:
    print(f'round {r:4}: train {tr[r - 1]:.4f}  validation {va[r - 1]:.4f}' + ('  <- best'
            if r == best else ''))
```

Training loss keeps falling towards zero for all 2,000 rounds: the trees memorise the 15% flipped labels. Validation loss reaches its minimum early and then rises steadily, so by round 2,000 the model is much worse than at its best, although its training score looks perfect. This is why the number of trees is chosen by early stopping on validation data.

### E1.5 Grouped permutation importance

```python run Permuting correlated columns alone and together
import numpy as np, pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split

rng = np.random.default_rng(53)
n = 5000
usage = rng.normal(size=n)
X = pd.DataFrame({'monthly_kwh': usage + rng.normal(0, 0.1, n),
                  'quarterly_kwh': usage + rng.normal(0, 0.1, n), 'tickets': rng.poisson(2,
                          n)})
y = rng.random(n) < 1 / (1 + np.exp(-(1.5 * usage + 0.3 * X['tickets'] - 0.6)))
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3, random_state=0)
rf = RandomForestClassifier(200, min_samples_leaf=20, n_jobs=1, random_state=0).fit(Xtr,
        ytr)
base = roc_auc_score(yte, rf.predict_proba(Xte)[:, 1])

def drop(cols, repeats=10):
    out = []
    for r in range(repeats):
        Xp = Xte.copy()
        perm = np.random.default_rng(r).permutation(len(Xp))
        Xp[cols] = Xte[cols].to_numpy()[perm]   # same shuffle for every column in the group
        out.append(base - roc_auc_score(yte, rf.predict_proba(Xp)[:, 1]))
    return np.mean(out)

for cols in [['monthly_kwh'], ['quarterly_kwh'], ['monthly_kwh', 'quarterly_kwh'],
        ['tickets']]:
    print(f'{" + ".join(cols):29} AUC drop {drop(cols):.3f}')
```

Each usage column alone looks modest, because the forest uses the other as a substitute. Shuffled together (with the same row permutation, so their relationship to each other is kept but their link to the target is broken), usage is clearly the dominant driver. Report importance per **concept**, not per column.

### E1.6 Explaining a rejection

Produce the explanation as follows: compute SHAP values for the applicant on the log-odds scale, against a stated reference population (for example, approved applicants); rank the features by their contribution **towards rejection**; translate the top three to five into plain reasons with the applicant's value ("existing debt of ₹4.2 lakh, high relative to income"). Check that the reasons are actionable and stable: small changes to irrelevant inputs should not reshuffle them.

Say clearly what they are: the reasons **this model** gave this score, not a statement that changing a value would guarantee approval. Correlated features can share or swap credit; a protected attribute may act through proxies (such as a pin code), which an explanation can reveal but not fix. Where regulation requires adverse-action reasons, use features the applicant can understand, and keep a monotonicity constraint (for example, more income never increases risk) so the explanations make sense. For "what would change the outcome?", a **counterfactual** explanation (the smallest feasible change that flips the decision) answers the applicant's real question better than contributions do.

## Part 2 solutions

### E2.1 Is this split broken?

```python run Chi-squared test for the split
from scipy.stats import chisquare
stat, p = chisquare([10_400, 10_000])
print(f'chi2 = {stat:.2f}, p = {p:.4f}, SRM at p < 0.001: {p < 0.001}')
```

χ² = 2 × 200<sup>2</sup> / 10,200 = 7.84, p ≈ 0.005. That does not cross the strict p < 0.001 threshold used for automatic SRM alerts, but a 1-in-200 imbalance is suspicious enough to investigate before trusting the result, especially if it persists over days. Typical causes: the treatment page loads more slowly so fewer control-to-treatment redirects complete (or vice versa); bot filtering that behaves differently in one arm; users who clear cookies being re-randomised; a bug that assigns some users to treatment before eligibility checks.

### E2.2 How much does CUPED save?

Required sample size is proportional to variance, so CUPED with ρ = 0.6 multiplies it by 1 − 0.36 = **0.64**: 36% fewer users for the same power.

```python run One experiment with and without CUPED
import numpy as np
rng = np.random.default_rng(54)
n, rho = 5000, 0.6
pre = rng.normal(100, 20, 2 * n)
post = 100 + rho * (pre - 100) + rng.normal(0, 20 * np.sqrt(1 - rho ** 2), 2 * n)
treat = np.arange(2 * n) < n
post = post + 1.0 * treat                                 # true lift 1.0
theta = np.cov(pre, post)[0, 1] / pre.var(ddof=1)
adj = post - theta * (pre - pre.mean())
for name, m in [('raw', post), ('CUPED', adj)]:
    lift = m[treat].mean() - m[~treat].mean()
    se = np.sqrt(m[treat].var(ddof=1) / n + m[~treat].var(ddof=1) / n)
    print(f'{name:5}: lift {lift:.2f} +/- {1.96 * se:.2f} (variance {m.var():.0f})')
print(f'theta {theta:.2f}; variance ratio {adj.var() / post.var():.2f} (theory '
        f'{1 - rho ** 2:.2f})')
```

The adjusted lift has a visibly tighter interval, and the variance ratio is close to the theoretical 0.64.

### E2.3 Benjamini–Hochberg by hand

| Rank i | p-value | BH threshold 0.05 × i / 8 | Below? |
|---|---|---|---|
| 1 | 0.001 | 0.00625 | Yes |
| 2 | 0.008 | 0.0125 | Yes |
| 3 | 0.012 | 0.01875 | Yes |
| 4 | 0.041 | 0.025 | No |
| 5 | 0.049 | 0.03125 | No |
| 6–8 | 0.20, 0.47, 0.81 | | No |

Uncorrected: 5 significant (all below 0.05). Bonferroni (0.05 / 8 = 0.00625): only the first. Benjamini–Hochberg: the largest rank whose p-value is under its threshold is 3, so the first **three** are significant.

```python run Checking with statsmodels
from statsmodels.stats.multitest import multipletests
p = [0.001, 0.008, 0.012, 0.041, 0.049, 0.20, 0.47, 0.81]
for method in ['bonferroni', 'fdr_bh']:
    reject = multipletests(p, alpha=0.05, method=method)[0]
    print(f'{method:10}: significant {[x for x, r in zip(p, reject) if r]}')
```

### E2.4 A placebo test for difference-in-differences

```python run Diverging pre-trends bias DiD; checking the pre-period
import numpy as np, pandas as pd
import statsmodels.formula.api as smf
rng = np.random.default_rng(55)
rows = []
for city, slope in [('treated', 1.0), ('control', 0.4)]:   # treated already grew faster
    for week in range(24):
        effect = 5.0 if (city == 'treated' and week >= 12) else 0.0
        for store in range(8):
            rows.append(dict(treated=int(city == 'treated'), week=week,
                    post=int(week >= 12),
                             sales=100 + slope * week + effect + rng.normal(0, 3)))
df = pd.DataFrame(rows)
did = smf.ols('sales ~ treated * post', data=df).fit().params['treated:post']
print(f'DiD estimate: {did:+.1f} (true campaign effect +5.0)')
pre = df[df.week < 12].assign(fake_post=lambda d: (d.week >= 6).astype(int))
placebo = smf.ols('sales ~ treated * fake_post', data=pre).fit()
print(f'placebo "effect" at week 6, before any campaign: '
        f'{placebo.params["treated:fake_post"]:+.1f} '
      f'(p = {placebo.pvalues["treated:fake_post"]:.1e})')
slope = smf.ols('sales ~ treated * week', data=df[df.week < 12]).fit()
print(f'pre-period slope difference: {slope.params["treated:week"]:+.2f} per week '
      f'(p = {slope.pvalues["treated:week"]:.1e})')
trend = smf.ols('sales ~ treated * post + treated:week + week', data=df).fit()
print(f'DiD allowing a group-specific linear trend: {trend.params["treated:post"]:+.1f}')
```

Because the treated city was already growing 0.6 a week faster, ordinary DiD credits the campaign with the extra growth and reports more than twice the true effect. The simple placebo test, which pretends the campaign started halfway through the pre-period, finds a positive "effect" where none can exist, but with this seed it is not significant (p ≈ 0.1): comparing two 6-week averages is a weak test, and an unlucky draw hid part of the divergence. A placebo that passes is not proof of parallel trends. The stronger check regresses pre-period sales on week separately by group, using every week: it flags the divergence as significant (p ≈ 0.02), although this noisy pre-period puts the slope gap at 0.33 a week rather than the true 0.6. Always plot the pre-period too. Allowing each group its own linear trend brings the estimate much closer to the true +5, but that rescue assumes the divergence is linear; synthetic control or a better-matched comparison group is usually the safer fix.

### E2.5 Poor overlap in IPW

```python run Extreme propensities make IPW unstable; trimming tames it
import numpy as np
from sklearn.linear_model import LogisticRegression
rng = np.random.default_rng(56)
n = 20000
x = rng.normal(size=n)
e_true = 1 / (1 + np.exp(-4 * x))                       # near 0 or 1 for large |x|
t = (rng.random(n) < e_true).astype(int)
y = 2.0 * t + 3.0 * x + rng.normal(size=n)              # true effect 2.0
e = LogisticRegression().fit(x.reshape(-1, 1), t).predict_proba(x.reshape(-1, 1))[:, 1]

def ipw(mask):
    tt, yy, ee = t[mask], y[mask], e[mask]
    w = np.where(tt == 1, 1 / ee, 1 / (1 - ee))
    treated_mean = np.sum(tt * yy / ee) / np.sum(tt / ee)
    control_mean = np.sum((1 - tt) * yy / (1 - ee)) / np.sum((1 - tt) / (1 - ee))
    est = treated_mean - control_mean
    return est, w.max(), mask.mean()

for name, mask in [('all units', np.ones(n, bool)), ('trimmed to [0.05, 0.95]',
        (e > 0.05) & (e < 0.95))]:
    est, wmax, kept = ipw(mask)
    print(f'{name:24}: estimate {est:.2f}, largest weight {wmax:,.0f}, units kept '
            f'{kept:.0%}')
naive = y[t == 1].mean() - y[t == 0].mean()
print(f'naive difference: {naive:.2f} | true effect 2.00')
```

With propensities near 0 and 1, a handful of units get enormous weights, and the estimate depends on them. Trimming to the region of overlap discards the units that have no comparable counterpart and stabilises the weights, at the price of answering a narrower question: the effect for units that could plausibly have received either treatment. (The stabilised, self-normalised form used above already helps; plain IPW is even more fragile.)

### E2.6 Choose the method

| Scenario | Method | Assumption to defend |
|---|---|---|
| (a) New onboarding flow | A/B test, randomised per new user | Correct randomisation; enough users; no interference |
| (b) Loyalty programme above ₹50,000 | Regression discontinuity at the threshold | Customers cannot precisely manipulate spend to qualify; check for bunching just above |
| (c) Price increase in one state from a known date | Difference-in-differences against similar states (or synthetic control) | Parallel pre-trends; no other change at the same time |
| (d) Budgeting feature with a random reminder email | Instrumental variables, with the email as the instrument | The email affects outcomes only through feature use; it moves usage enough (first-stage F > 10) |
