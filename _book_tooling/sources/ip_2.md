# Chapter 4: Statistics Questions
%What p-values and confidence intervals really mean, the central limit theorem, choosing tests, power, regression output and classic misreadings

## 4.1 p-values

A p-value is the probability, **assuming the null hypothesis is true**, of seeing data at least as extreme as what was observed. It is not the probability that the null hypothesis is true, and it says nothing about the size of an effect.

| Statement | Correct? |
|---|---|
| "p = 0.03 means a 3% chance the null hypothesis is true" | No: that needs a prior (Bayes) |
| "p = 0.03 means a 97% chance the effect is real" | No |
| "If there were no effect, data this extreme would occur 3% of the time" | Yes |
| "p = 0.20 proves there is no effect" | No: absence of evidence; the test may lack power |
| "A smaller p-value means a bigger effect" | No: huge samples give tiny p-values for trivial effects |

Under the null hypothesis, p-values are **uniformly distributed**: exactly 5% fall below 0.05, which is what "a 5% false-positive rate" means.

```python run p-values under the null and under a real effect
import numpy as np
from scipy.stats import ttest_ind
rng = np.random.default_rng(80)
def pvals(effect, n=100, trials=5000):
    return np.array([ttest_ind(rng.normal(effect, 1, n), rng.normal(0, 1, n)).pvalue
            for _ in range(trials)])
null, real = pvals(0.0), pvals(0.3)
bins = [0, 0.01, 0.05, 0.25, 0.5, 1.0]
print('p-value bins         :', bins)
print('no effect (share)    :', np.round(np.histogram(null, bins)[0] / len(null), 3))
print('effect 0.3 SD (share):', np.round(np.histogram(real, bins)[0] / len(real), 3))
print(f'false-positive rate {np.mean(null < 0.05):.3f}; power at effect 0.3 SD '
        f'{np.mean(real < 0.05):.3f}')
```

## 4.2 Confidence intervals

A 95% confidence interval is produced by a **procedure** that captures the true value in 95% of repeated samples. Any single computed interval either contains the truth or does not; the 95% describes the method, not one interval.

```python run How often do 95% intervals contain the true mean?
import numpy as np
from scipy.stats import t
rng = np.random.default_rng(81)
true_mean, n, trials = 50.0, 25, 10_000
data = rng.exponential(true_mean, (trials, n))                 # skewed data
m, s = data.mean(axis=1), data.std(axis=1, ddof=1)
half = t.ppf(0.975, n - 1) * s / np.sqrt(n)
cover = np.mean((m - half <= true_mean) & (true_mean <= m + half))
print(f't-intervals with n={n} from skewed data cover the true mean {cover:.1%} of the time')
data = rng.exponential(true_mean, (trials, 400))
m, s = data.mean(axis=1), data.std(axis=1, ddof=1)
half = t.ppf(0.975, 399) * s / np.sqrt(400)
print(f'with n=400: {np.mean((m - half <= true_mean) & (true_mean <= m + half)):.1%}')
```

With small samples from skewed data, the nominal 95% interval covers less often than promised; with larger samples the central limit theorem makes it accurate. That is the practical content of "the t-test assumes normality": it matters for small, skewed samples.

## 4.3 The central limit theorem

The mean of n independent draws from almost any distribution with finite variance is approximately normal for large n, with standard error σ/√n. How large n must be depends on the skew of the data: revenue per user, with many zeros and a few big spenders, needs far larger samples than heights do.

```python run Skewness of sample means shrinks roughly like 1/sqrt(n)
import numpy as np
from scipy.stats import skew
rng = np.random.default_rng(82)
# 90% spend nothing
revenue = lambda size: np.where(rng.random(size) < 0.9, 0.0, rng.lognormal(6, 1.2, size))
print(f'skewness of revenue per user: {skew(revenue(1_000_000)):.1f}')
for n in [10, 100, 1000, 10000]:
    means = revenue((2000, n)).mean(axis=1)
    print(f'n = {n:5}: skewness of the sample mean {skew(means):5.2f}')
```

## 4.4 Choosing a test

| Situation | Test |
|---|---|
| Compare two means, large samples | Two-sample z or t test (Welch's t if variances differ: the safe default) |
| Compare two proportions | Two-proportion z-test or chi-squared test |
| Same users measured twice | Paired t-test |
| Small, skewed or ordinal data | Mann–Whitney U (compares distributions/ranks, not means) or a bootstrap |
| More than two groups | ANOVA (means) or chi-squared (proportions), then corrected pairwise tests |
| Medians, percentiles, ratios | Bootstrap confidence interval |
| Association between two categorical variables | Chi-squared test of independence |

```python run A bootstrap interval for a median, where no simple formula exists
import numpy as np
rng = np.random.default_rng(83)
basket = rng.lognormal(6.5, 0.8, 800)                          # order values, skewed
boot = np.array([np.median(rng.choice(basket, len(basket))) for _ in range(5000)])
lo, hi = np.percentile(boot, [2.5, 97.5])
print(f'median basket {np.median(basket):.0f}, 95% bootstrap CI {lo:.0f} to {hi:.0f}')
print(f'mean basket {basket.mean():.0f} (pulled up by large orders)')
```

## 4.5 Power and the winner's curse

**Power** is the probability that a test detects an effect that truly exists. Underpowered studies are not just likely to miss effects: when they do find one, they **exaggerate** it, because only the estimates that happened to come out large crossed the significance line. This is the winner's curse (a type M, magnitude, error).

```python run Significant results from small studies overstate the effect
import numpy as np
from scipy.stats import ttest_ind
rng = np.random.default_rng(84)
true_effect = 0.2
for n in [30, 200, 1000]:
    est, sig = [], []
    for _ in range(4000):
        a, b = rng.normal(true_effect, 1, n), rng.normal(0, 1, n)
        est.append(a.mean() - b.mean()); sig.append(ttest_ind(a, b).pvalue < 0.05)
    est, sig = np.array(est), np.array(sig)
    print(f'n = {n:4} per group: power {sig.mean():5.1%}, '
          f'average significant estimate {est[sig].mean():.2f} (true {true_effect})')
```

With 30 users per group, only a small share of studies reach significance, and those report an effect about three times the truth. With adequate power, significant estimates are close to the true value. The ML System Design guide, §5.2, shows how to compute the sample size before a test.

## 4.6 Reading regression output

```python run Coefficients, uncertainty and multicollinearity
import numpy as np, pandas as pd
import statsmodels.formula.api as smf
from statsmodels.stats.outliers_influence import variance_inflation_factor
rng = np.random.default_rng(85)
n = 400
ad_spend = rng.normal(50, 10, n)
search_ads = 0.9 * ad_spend + rng.normal(0, 3, n)              # nearly the same information
price = rng.normal(100, 5, n)
sales = 200 + 2.0 * ad_spend + 1.0 * search_ads - 1.5 * price + rng.normal(0, 20, n)
df = pd.DataFrame({'sales': sales, 'ad_spend': ad_spend, 'search_ads': search_ads,
        'price': price})
for formula in ['sales ~ ad_spend + price', 'sales ~ ad_spend + search_ads + price']:
    fit = smf.ols(formula, df).fit()
    print(f'{formula}  (R2 {fit.rsquared:.3f})')
    for k, v in fit.params.items():
        if k != 'Intercept':
            print(f'    {k:10} {v:+.2f} (SE {fit.bse[k]:.2f})')
X = df[['ad_spend', 'search_ads', 'price']].assign(const=1.0)
print('VIF:', {c: round(float(variance_inflation_factor(X.values, i)), 1) for i,
        c in enumerate(X.columns[:-1])})
```

| Output | Meaning | Common misreading |
|---|---|---|
| Coefficient | Expected change in y per unit change in x, **holding the other variables fixed** | "Raising x by 1 causes y to rise by the coefficient" (only under causal assumptions) |
| Standard error, p-value | Uncertainty of the coefficient | A non-significant coefficient is not proof of zero effect |
| R² | Share of variance explained in this sample | High R² does not mean the model is causal or will predict well out of sample |
| VIF above about 5–10 | The variable is largely predictable from the others (multicollinearity) | Individual coefficients become unstable, with large standard errors, even though predictions are fine |

Leaving out `search_ads` makes `ad_spend` absorb its effect (its coefficient rises from about 2 to 2.6): **omitted variable bias**. Including both, their standard errors balloon because the two move together, and the VIFs flag it.

## 4.7 Regression to the mean

Select the worst performers on a noisy measurement, and they improve next time **with no intervention at all**, because part of their poor score was bad luck. Any "we helped the worst stores and they improved" claim needs a control group.

```python run The worst 10% improve without any treatment
import numpy as np
rng = np.random.default_rng(86)
skill = rng.normal(0, 1, 10_000)
month1 = skill + rng.normal(0, 1, 10_000)
month2 = skill + rng.normal(0, 1, 10_000)                     # no intervention
worst = month1 < np.quantile(month1, 0.1)
print(f'worst 10%: month 1 average {month1[worst].mean():.2f}, month 2 average '
        f'{month2[worst].mean():.2f}')
print(f'best 10% : month 1 average {month1[month1 > np.quantile(month1, 0.9)].mean():.2f}, '
      f'month 2 average {month2[month1 > np.quantile(month1, 0.9)].mean():.2f}')
```

## 4.8 Practical lessons

- A p-value is P(data this extreme given no effect), not P(no effect); confidence describes the procedure.
- Skewed metrics need larger samples or bootstrap intervals; Welch's t is the safe default.
- Underpowered significant results exaggerate effects; plan the sample size.
- Regression coefficients are conditional and not causal by default; watch omitted variables, multicollinearity and regression to the mean.

# Chapter 5: Metrics and Product Sense
%Good metrics, metric trees and decompositions, diagnosing a metric drop with data, and mix shifts that fool dashboards

## 5.1 What makes a good metric

| Property | Question | Bad example |
|---|---|---|
| Aligned | Does it move when users get real value? | Page views for a search product (better search means fewer pages) |
| Sensitive | Does it move enough to detect changes in an experiment? | Annual retention for a two-week test |
| Attributable | Can you tell which change moved it? | Company revenue for a button colour test |
| Hard to game | Can a team improve it without helping users? | Notifications sent; time spent via autoplay |
| Understandable | Can everyone explain it in a sentence? | A weighted index of nine sub-scores |

A useful hierarchy:

| Level | Role | Example (food delivery) |
|---|---|---|
| North-star metric | The long-term value the product creates | Weekly orders delivered on time |
| Input (driver) metrics | Levers teams can move | Restaurant selection, delivery time, app conversion |
| Guardrail metrics | Must not get worse | Cancellation rate, support contacts, delivery partner earnings, latency |
| Diagnostic metrics | Explain movements | Funnel steps, segment breakdowns |

## 5.2 Metric trees and decomposing a change

Revenue = active users × conversion rate × orders per buyer × average order value. When revenue changes, multiply the factors' ratios: the logarithm turns the product into a sum, so each factor's share of the change can be stated exactly.

```python run Which factor explains the revenue change?
import numpy as np
last = dict(users=120_000, conversion=0.050, orders_per_buyer=1.30, aov=640.0)
this = dict(users=126_000, conversion=0.046, orders_per_buyer=1.32, aov=655.0)
rev = lambda m: m['users'] * m['conversion'] * m['orders_per_buyer'] * m['aov']
total = np.log(rev(this) / rev(last))
print(f'revenue {rev(last):,.0f} -> {rev(this):,.0f} ({rev(this) / rev(last) - 1:+.1%})')
for k in last:
    print(f'{k:17} {this[k] / last[k] - 1:+6.1%}  contribution '
            f'{100 * np.log(this[k] / last[k]):+5.1f} log-%')
print(f'{"total":17} {"":6}  contribution {100 * total:+5.1f} log-% (the parts add up '
        f'exactly)')
```

Log changes add up where percentage changes do not, so each factor's contribution can be read directly. Revenue looks flat, but the tree shows a real problem hidden by growth elsewhere: conversion fell 8%, offset by more users and larger orders. That conversion drop is where the investigation should start.

## 5.3 Diagnosing a metric drop

"Daily active users dropped 10% yesterday. What happened?" is the most common product-sense question. A structured answer:

1. **Is it real?** Check the data pipeline: late or missing logging, a tracking change, a broken dashboard, bot filtering.
2. **Is it expected?** Seasonality (day of week, holidays), a comparison with the same day last week or year, a marketing campaign ending.
3. **Where is it?** Segment by platform, app version, country, acquisition channel, new versus returning users. A drop concentrated in one segment points to a cause.
4. **Which step?** Walk the funnel (app open, login, search, purchase) to find where users fall out.
5. **What changed?** Releases, experiments, outages, competitor launches, external events.
6. **Size and next step.** Quantify the impact and propose the fix or the analysis that confirms the cause.

```python run Finding the segment behind a DAU drop
import numpy as np, pandas as pd
rng = np.random.default_rng(87)
rows = []
for day in pd.date_range('2026-09-01', '2026-09-28'):
    for platform, base in [('android', 52_000), ('ios', 30_000), ('web', 18_000)]:
        for version in (['5.1', '5.2'] if platform == 'android' else ['n/a']):
            share = 1.0 if platform != 'android' else (0.5 if version == '5.1' else 0.5)
            dau = base * share * (0.92 if day.dayofweek >= 5 else 1.0) * rng.normal(1, 0.01)
            bad_release = platform == 'android' and version == '5.2'
            if bad_release and day >= pd.Timestamp('2026-09-27'):
                dau *= 0.62                                     # login bug in release 5.2
            rows.append(dict(day=day, platform=platform, version=version, dau=dau))
df = pd.DataFrame(rows)
total = df.groupby('day').dau.sum()
today, last_week = pd.Timestamp('2026-09-28'), pd.Timestamp('2026-09-21')
print(f'DAU {total[today]:,.0f} vs {total[last_week]:,.0f} a week earlier '
        f'({total[today] / total[last_week] - 1:+.1%})')
seg = df[df.day.isin([today, last_week])].pivot_table(index=['platform', 'version'],
        columns='day', values='dau')
seg.columns = ['last_week', 'today']
seg['change'] = seg.today - seg.last_week
seg['share_of_drop'] = seg.change / seg.change.sum()
print(seg.round(2).sort_values('change').to_string())
```

Comparing with the same weekday a week earlier removes the weekly pattern; the segment table then shows almost the whole drop sitting in Android version 5.2, released the previous day. The next steps are checking that release's crash and login error rates, and rolling it back or pausing the rollout.

## 5.4 Mix shift: every segment improves, the total falls

A dashboard metric can move only because the **mix** of users changed. If a campaign brings many new visitors who convert less, overall conversion falls even when conversion rises in every segment: Simpson's paradox again.

```python run Conversion up in every segment, down overall
import pandas as pd
data = pd.DataFrame({
    'segment': ['returning', 'new', 'returning', 'new'],
    'week': ['before', 'before', 'after', 'after'],
    'visitors': [80_000, 20_000, 82_000, 68_000],   # a campaign brought new visitors
    'orders': [6_400, 400, 6_724, 1_496],
})
data['conversion'] = data.orders / data.visitors
print(data.pivot(index='segment', columns='week', values='conversion').round(4)[['before',
        'after']])
overall = data.groupby('week')[['orders', 'visitors']].sum()
print((overall.orders / overall.visitors).round(4)[['before', 'after']].to_dict())
```

Always break a ratio metric down by its main segments before concluding that a product got worse. Report both the overall figure and the within-segment figures, and say which one answers the business question.

## 5.5 Practical lessons

- Good metrics are aligned, sensitive, attributable and hard to game; pair a north star with guardrails.
- Decompose metric changes with a metric tree; logarithms split a product exactly.
- Diagnose drops in order: data, seasonality, segments, funnel, changes, impact.
- Check for mix shifts before blaming the product for a ratio's change.
