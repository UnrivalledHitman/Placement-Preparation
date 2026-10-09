## Part 3 solutions

### I3.1 Any server down

P(at least one fails) = 1 − 0.98<sup>3</sup> = 1 − 0.941 = **5.9%**. P(all three fail) = 0.02<sup>3</sup> = **0.0008%** (8 in a million), **if** failures are independent. In practice they rarely are: shared power, network, deploys and bugs make simultaneous failures far more likely, which is why redundancy across zones and staggered deploys matter.

```python run Checking I3.1
import numpy as np
rng = np.random.default_rng(90)
fails = rng.random((2_000_000, 3)) < 0.02
print(f'at least one: {fails.any(axis=1).mean():.4f} (exact {1 - 0.98 ** 3:.4f}); '
      f'all three: {fails.all(axis=1).mean():.6f} (exact {0.02 ** 3:.6f})')
```

### I3.2 Distinct birthdays

By linearity of expectation, sum over the 365 days the probability that at least one person has that birthday: 365 × (1 − (364/365)<sup>30</sup>) = **28.8**. So among 30 people, on average about 1.2 birthdays are "lost" to sharing.

```python run Checking I3.2
import numpy as np
rng = np.random.default_rng(91)
sims = [len(np.unique(rng.integers(0, 365, 30))) for _ in range(100_000)]
print(f'simulated {np.mean(sims):.2f}, exact {365 * (1 - (364 / 365) ** 30):.2f}')
```

### I3.3 The spam filter

P(free) = 0.6 × 0.3 + 0.05 × 0.7 = 0.18 + 0.035 = 0.215. P(spam | free) = 0.18 / 0.215 = **83.7%**. One word moves the probability from 30% to 84%; a naive Bayes filter multiplies such likelihood ratios across many words (assuming independence, which is wrong but works well enough in practice).

### I3.4 Sample size for a conversion test

n = (1.96 + 0.84)<sup>2</sup> × (0.10 × 0.90 + 0.11 × 0.89) / 0.01<sup>2</sup> = 7.85 × 0.1879 / 0.0001 ≈ **14,750 per group**.

```python run Checking I3.4 by formula and simulation
import numpy as np
from scipy.stats import norm
from statsmodels.stats.proportion import proportions_ztest
p1, p2 = 0.10, 0.11
n = int(np.ceil((norm.ppf(0.975) + norm.ppf(0.8)) ** 2 * (p1 * (1 - p1)
        + p2 * (1 - p2)) / (p2 - p1) ** 2))
rng = np.random.default_rng(92)
hits = 0
for _ in range(2000):
    a, b = rng.binomial(n, p2), rng.binomial(n, p1)
    hits += proportions_ztest([a, b], [n, n])[1] < 0.05
print(f'n per group {n:,}; simulated power {hits / 2000:.1%}')
```

Detecting a 1-point lift on a 10% base rate needs about 30,000 users in total. Halving the detectable effect quadruples the sample, which is why small improvements need large products or longer tests.

### I3.5 Elasticity from a log regression

```python run Recovering a price elasticity
import numpy as np, statsmodels.api as sm
rng = np.random.default_rng(93)
price = rng.uniform(80, 160, 500)
qty = np.exp(9 - 1.8 * np.log(price) + rng.normal(0, 0.15, 500))
fit = sm.OLS(np.log(qty), sm.add_constant(np.log(price))).fit()
e = fit.params[1]
print(f'estimated elasticity {e:.2f} (95% CI {fit.conf_int()[1][0]:.2f} to '
        f'{fit.conf_int()[1][1]:.2f})')
print(f'+5% price -> quantity {1.05 ** e - 1:+.1%}, revenue {1.05 ** (1 + e) - 1:+.1%}')
```

In a log–log model the coefficient is the elasticity: a 1% price rise changes quantity by about −1.8%. Because demand is **elastic** (|e| > 1), raising the price lowers revenue (about −4% for +5% with the estimate; −3.8% at the true elasticity of −1.8). In real data, price is rarely set at random: prices rise when demand is high, which biases the naive regression towards zero or even positive values; use price experiments or an instrument (Applied Data Science guide, Chapter 5).

### I3.6 Who wins the coin game?

Let P be the probability that the first player wins. They win immediately with probability ½; with probability ¼ both miss and the game restarts in the same position: P = ½ + ¼P, so **P = 2/3**. Going first is worth a lot.

```python run Checking I3.6
import numpy as np
rng = np.random.default_rng(94)
first_flip_heads = rng.geometric(0.5, 500_000)              # flip number of the first head
print(f'first player wins {np.mean(first_flip_heads % 2 == 1):.3f} (exact 0.667)')
```

### I3.7 An interval for a conversion rate

```python run Normal versus Wilson intervals
from statsmodels.stats.proportion import proportion_confint
for k, n in [(45, 500), (2, 40)]:
    lo_n, hi_n = proportion_confint(k, n, method='normal')
    lo_w, hi_w = proportion_confint(k, n, method='wilson')
    print(f'{k}/{n} = {k / n:.3f}: normal [{lo_n:.3f}, {hi_n:.3f}]  Wilson [{lo_w:.3f}, '
            f'{hi_w:.3f}]')
```

For 45 of 500 the two intervals are close. For small counts or rates near 0 or 1, the normal interval is too narrow, symmetric when it should not be, and would go below zero (statsmodels clips it at 0 above); Wilson stays inside [0, 1] and has better coverage. Use Wilson (or an exact interval) by default for proportions.

## Part 4 solutions

### I4.1 Metrics for shared rides

| Type | Metric | Why |
|---|---|---|
| Primary | Completed rides per active rider per week (all ride types) | Shared rides should grow total riding, not just move riders between products |
| Supporting | Share of rides that are shared; match rate (share of shared requests actually paired); average detour minutes; price per km for riders | Is the product working as designed? |
| Supporting (supply) | Driver earnings per hour; utilisation (share of time with a passenger) | Drivers must not lose out, or supply shrinks |
| Guardrails | Cancellation rate, rider ratings, safety incidents, ETA for all products, revenue per ride | Detours and pairing can hurt experience and margin |
| Watch | Cannibalisation: riders downgrading from standard rides | Total revenue can fall even if shared rides boom |

Marketplace effects mean a per-rider A/B test can mislead (treated riders share drivers with control riders); use city-level or switchback experiments (Applied Data Science guide, §4.6).

### I4.2 Conversion dropped 7%

```python run Within-source conversion versus traffic mix
import pandas as pd
d = pd.DataFrame({
    'source': ['search', 'email', 'social'] * 2,
    'week': ['last'] * 3 + ['this'] * 3,
    'visitors': [50_000, 20_000, 30_000, 50_500, 20_200, 45_000],
    'orders': [2_250, 600, 350, 2_290, 612, 540],
})
d['conversion'] = d.orders / d.visitors
print(d.pivot(index='source', columns='week', values='conversion').round(4))
tot = d.groupby('week')[['orders', 'visitors']].sum()
print('overall:', (tot.orders / tot.visitors).round(4).to_dict())
mix = d.pivot(index='source', columns='week', values='visitors')
print('traffic share by source:')
print((mix / mix.sum()).round(3))
```

Conversion rose slightly in every source; overall conversion fell because social traffic, which converts at about 1.2%, grew by half and now makes up a larger share of visitors. The product did not get worse. The right follow-up is whether the extra social traffic is valuable at all (cost per order of that campaign), and reporting conversion per source alongside the overall number.

### I4.3 Smartphones sold in India

| Angle | Chain | Estimate |
|---|---|---|
| Demand | 1.4 billion people × about 55% own a smartphone ≈ 770 million users; replaced every 3 years on average → about 260 million a year, minus a share of second-hand and shared devices (say 40%) | ≈ 150 million |
| Supply | 5 major brands each shipping 20–30 million a year, plus smaller brands about 30 million | ≈ 130–180 million |

Both angles land around **140–160 million a year**, which is the right order of magnitude (public shipment figures for India have been in that range). State each assumption, show the two angles agree, and give a range rather than a single number.

### I4.4 Launch the dark mode?

Session length is not the goal of dark mode: it is a comfort feature, and longer sessions could even mean slower task completion. Purchases, the outcome that matters, did not change. The uninstall guardrail moved the wrong way; p = 0.12 is not proof of harm, but guardrails are usually tested with low power, so "not significant" is weak reassurance.

A good answer: launch dark mode as an **option** (users choose it, so the default experience is unchanged), monitor uninstalls and accessibility feedback with a holdout, and investigate whether the uninstall rise comes from a specific device or OS version (a rendering bug, for instance). If dark mode were proposed as the **default**, require evidence that uninstalls do not rise, with a test powered for that guardrail.

### I4.5 Critique a take-home summary

| Problem | Why |
|---|---|
| Correlation presented as causation | Customers who install a loyalty app are already more engaged; they would spend more anyway (selection bias) |
| "40% more" is the wrong estimate of the effect | The causal effect could be much smaller, or zero |
| "Push all customers" extrapolates | Even if the app helps engaged users, pushing reluctant ones may not help, and may annoy them |
| 92% accuracy is meaningless without the base rate | If 90% of customers do not use the app, predicting "no" for everyone scores 90% |
| No uncertainty | No intervals, no sample sizes, no time frame |

Rewritten conclusion: "App users spend 40% more than non-users, but they differ in many ways, so this does not show that the app causes higher spending. To measure the effect, randomly offer an installation incentive to half of a group of non-users and compare spending over three months (an encouragement design). Our app-usage model achieves 0.81 AUC (against 0.5 for chance); accuracy is not informative because 90% of customers are non-users."
