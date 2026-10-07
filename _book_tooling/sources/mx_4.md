# Chapter 9: Estimation: MLE, MAP and Bayesian Inference
%Where loss functions come from, and why the sample variance divides by n − 1

## 9.1 Estimators, bias and variance

An **estimator** θ̂ is a function of the data that guesses a parameter θ. Because the data are random, θ̂ is random, and we judge it by:

- **Bias**: E[θ̂] − θ. Unbiased means right on average.
- **Variance**: Var(θ̂). How much it changes from sample to sample.
- **Mean squared error**: MSE = E[(θ̂ − θ)²] = Bias² + Variance.

**Derivation of the decomposition.** Add and subtract E[θ̂]: θ̂ − θ = (θ̂ − E[θ̂]) + (E[θ̂] − θ). Square and take expectations; the cross term is 2(E[θ̂] − θ)·E[θ̂ − E[θ̂]] = 0, leaving Var(θ̂) + Bias². A slightly biased estimator with much lower variance can have a smaller MSE, which is the whole idea of regularisation (Chapter 12).

## 9.2 Maximum likelihood

Given independent observations x<sub>1</sub>, …, x<sub>n</sub> from p(x \| θ), the **likelihood** is L(θ) = Π p(x<sub>i</sub> \| θ). The **maximum likelihood estimate** (MLE) maximises it, in practice by maximising the **log-likelihood** ℓ(θ) = Σ ln p(x<sub>i</sub> \| θ), because sums are easier to differentiate and do not underflow.

**Training an ML model by minimising the average loss is maximum likelihood** for a specific noise model: the loss is the negative log-likelihood (NLL).

### Bernoulli: the MLE is the sample proportion

With k successes in n trials, ℓ(p) = k ln p + (n − k) ln(1 − p). Setting ℓ′(p) = k/p − (n − k)/(1 − p) = 0 gives p̂ = k/n. The NLL per example, −[y ln p + (1 − y) ln(1 − p)], is exactly the **binary cross-entropy** of Chapter 5.

### Normal: the MLE of μ is the mean, of σ² divides by n

ℓ(μ, σ²) = −(n/2) ln(2πσ²) − Σ(x<sub>i</sub> − μ)²/(2σ²).

- ∂ℓ/∂μ = Σ(x<sub>i</sub> − μ)/σ² = 0 gives μ̂ = x̄.
- ∂ℓ/∂σ² = −n/(2σ²) + Σ(x<sub>i</sub> − μ)²/(2σ⁴) = 0 gives σ̂² = (1/n)Σ(x<sub>i</sub> − x̄)².

For fixed σ, maximising over μ is minimising Σ(x<sub>i</sub> − μ)²: **squared error is the Gaussian NLL**. Similarly the Laplace distribution (density ∝ e<sup>−\|x − μ\|/b</sup>) gives absolute error, whose minimiser is the **median**.

### Poisson and exponential

For Poisson(λ), ℓ = Σ(x<sub>i</sub> ln λ − λ) + const, so λ̂ = x̄. For Exponential(λ), ℓ = n ln λ − λΣx<sub>i</sub>, so λ̂ = 1/x̄.

```python run Every closed-form MLE checked against a numerical optimiser
import numpy as np
from scipy.optimize import minimize, minimize_scalar
rng = np.random.default_rng(26)
x = rng.normal(3.0, 2.0, 500)
nll = lambda t: 0.5 * len(x) * np.log(2 * np.pi * t[1]) + np.sum((x - t[0]) ** 2) / (2 * t[1])
res = minimize(nll, x0=[0.0, 1.0], bounds=[(None, None), (1e-6, None)])
print(f'normal: numeric mu {res.x[0]:.4f}, var {res.x[1]:.4f} | closed form '
      f'{x.mean():.4f}, {np.mean((x - x.mean()) ** 2):.4f}')
c = rng.poisson(4.2, 400)
r = minimize_scalar(lambda l: -np.sum(c * np.log(l) - l), bounds=(0.01, 20), method='bounded')
print(f'Poisson: numeric {r.x:.4f} | mean {c.mean():.4f}')
e = rng.exponential(1 / 2.5, 400)
exp_nll = lambda l: -(len(e) * np.log(l) - l * e.sum())
r = minimize_scalar(exp_nll, bounds=(0.01, 20), method='bounded')
print(f'exponential: numeric {r.x:.4f} | 1/mean {1 / e.mean():.4f}')
grid = np.linspace(-2, 8, 100_001)
l1 = [np.sum(abs(x - m)) for m in grid[::100]]
best = grid[::100][np.argmin(l1)]
print(f'minimiser of absolute error: {best:.2f} | median {np.median(x):.2f}')
```

## 9.3 Why the sample variance divides by n − 1

The MLE σ̂² = (1/n)Σ(x<sub>i</sub> − x̄)² is **biased low**.

**Derivation.** Write Σ(x<sub>i</sub> − x̄)² = Σ(x<sub>i</sub> − μ)² − n(x̄ − μ)² (expand (x<sub>i</sub> − μ) − (x̄ − μ) and use Σ(x<sub>i</sub> − μ) = n(x̄ − μ)). Taking expectations: E = nσ² − n·(σ²/n) = (n − 1)σ². So E[σ̂²<sub>MLE</sub>] = ((n − 1)/n)σ², and dividing by **n − 1** instead gives the unbiased **sample variance** s². Intuitively, x̄ is fitted to the data, so deviations from x̄ are smaller than deviations from the true μ; one "degree of freedom" is used up estimating the mean.

```python run The 1/n estimator is biased by (n-1)/n; 1/(n-1) is unbiased; MSE tells another story
import numpy as np
rng = np.random.default_rng(27)
sigma2 = 4.0
for n in (2, 5, 30):
    X = rng.normal(0, 2, size=(400_000, n))
    v_mle = X.var(axis=1, ddof=0)
    v_unb = X.var(axis=1, ddof=1)
    print(f'n = {n:2d}: mean of 1/n estimator {v_mle.mean():.4f} '
          f'(theory {(n - 1) / n * sigma2:.4f}), of 1/(n-1) {v_unb.mean():.4f}; '
          f'MSE {np.mean((v_mle - sigma2) ** 2):.3f} vs {np.mean((v_unb - sigma2) ** 2):.3f}')
```

The unbiased estimator is right on average, yet the biased 1/n estimator has the **lower** mean squared error at every n: a small bias bought a larger cut in variance, exactly the trade-off of Section 9.1.

> NOTE: `np.var` uses ddof=0 (the MLE) by default, while `pandas.Series.var`, `np.cov` and `statistics.variance` use ddof=1. Know which one your library uses.

## 9.4 Properties of the MLE, and the Fisher information

For large n the MLE is consistent (converges to θ) and approximately normal with variance 1/(n I(θ)), where the **Fisher information** I(θ) = E[(∂ ln p/∂θ)²] = −E[∂² ln p/∂θ²] measures how sharply the likelihood peaks. No unbiased estimator can do better (the **Cramér–Rao bound**).

**Derivation for the Bernoulli.** ln p = x ln p + (1 − x) ln(1 − p). The second derivative is −x/p² − (1 − x)/(1 − p)², whose expectation is −1/p − 1/(1 − p) = −1/(p(1 − p)). So I(p) = 1/(p(1 − p)), and the MLE's variance is p(1 − p)/n, matching the standard error of Chapter 8.

```python run The MLE's spread matches 1/(n I(theta)) for Bernoulli and exponential data
import numpy as np
rng = np.random.default_rng(28)
p, n = 0.3, 200
phat = rng.binomial(n, p, 100_000) / n
crb = np.sqrt(p * (1 - p) / n)
print(f'Bernoulli: sd of p-hat {phat.std():.5f}, Cramer-Rao sqrt(p(1-p)/n) {crb:.5f}')
lam = 2.0                                             # I(lambda) = 1 / lambda^2
lhat = 1 / rng.exponential(1 / lam, size=(100_000, n)).mean(1)
print(f'exponential: sd of lambda-hat {lhat.std():.5f}, '
      f'sqrt(lambda^2 / n) {lam / np.sqrt(n):.5f}')
```

## 9.5 MAP estimation: priors become regularisers

**Maximum a posteriori** (MAP) estimation maximises the posterior p(θ \| data) ∝ p(data \| θ) p(θ), that is, minimises

−ln p(data \| θ) − ln p(θ) = NLL + penalty.

- A Gaussian prior **w** ~ N(**0**, τ²**I**) gives −ln p(**w**) = ‖**w**‖²/(2τ²) + const: **L2 regularisation (ridge, weight decay)** with strength λ ∝ 1/τ².
- A Laplace prior gives ‖**w**‖<sub>1</sub>: **L1 regularisation (lasso)**, which drives some weights exactly to zero.

So regularisation is a statement of prior belief that weights are small, and its strength should shrink relative to the data term as n grows.

### Laplace smoothing is MAP with a Beta prior

For a Bernoulli parameter with prior Beta(α, β), density ∝ p<sup>α−1</sup>(1 − p)<sup>β−1</sup>, the log-posterior is (k + α − 1) ln p + (n − k + β − 1) ln(1 − p). Maximising as in Section 9.2 gives

p̂<sub>MAP</sub> = (k + α − 1)/(n + α + β − 2).

With α = β = 2 this is (k + 1)/(n + 2): **add-one (Laplace) smoothing**, the fix in Naive Bayes for words never seen in training, which would otherwise give probability 0 and wipe out the whole product.

## 9.6 Full Bayesian inference: the Beta–Binomial model

Instead of one best value, keep the whole posterior. With a Beta(α, β) prior and k successes in n trials, the posterior is ∝ p<sup>k+α−1</sup>(1 − p)<sup>n−k+β−1</sup>, which is again a Beta: **Beta(α + k, β + n − k)**. A prior whose posterior stays in the same family is **conjugate**. The posterior mean is (α + k)/(α + β + n): a weighted average of the prior mean and the data proportion, with the data's weight growing as n grows.

This is the mathematics of Bayesian A/B testing and of Thompson sampling for bandits: sample a rate from each arm's Beta posterior and play the arm whose sample is largest.

```python run Conjugate update checked against a brute-force grid posterior, and Thompson sampling
import numpy as np
from scipy import stats
a, b = 2.0, 2.0
k, n = 7, 20
grid = np.linspace(0.0005, 0.9995, 1000)
unnorm = stats.binom.pmf(k, n, grid) * stats.beta.pdf(grid, a, b)
post_grid = unnorm / unnorm.sum()
post_mean_grid = np.sum(grid * post_grid)
print(f'posterior mean: grid {post_mean_grid:.4f}, '
      f'conjugate Beta({a + k:.0f}, {b + n - k:.0f}) {(a + k) / (a + b + n):.4f}')
print(f'MAP: grid {grid[np.argmax(post_grid)]:.4f}, formula (k+a-1)/(n+a+b-2) '
      f'{(k + a - 1) / (n + a + b - 2):.4f}; MLE k/n {k / n:.4f}')
rng = np.random.default_rng(29)
true = np.array([0.04, 0.05, 0.06])                    # click rates of three variants
wins, losses = np.ones(3), np.ones(3)
for t in range(20_000):
    arm = np.argmax(rng.beta(wins, losses))
    click = rng.random() < true[arm]
    wins[arm] += click; losses[arm] += 1 - click
pulls = wins + losses - 2
print('Thompson sampling, share of visitors per variant:', np.round(pulls / pulls.sum(), 3))
```

The grid posterior matches the conjugate formula, and the MAP sits between the prior mean 0.5 and the MLE 0.35. Thompson sampling sent most of the traffic to the best variant (6% click rate) while still exploring the others, without any fixed test length.

## 9.7 Practical lessons

- MSE = bias² + variance; a little bias can buy a big drop in variance.
- Minimising a loss = maximum likelihood: squared error ⇔ Gaussian, absolute error ⇔ Laplace, cross-entropy ⇔ Bernoulli/categorical.
- The MLE of a variance divides by n and is biased; s² divides by n − 1.
- MAP = NLL + penalty: L2 ⇔ Gaussian prior, L1 ⇔ Laplace prior, add-one smoothing ⇔ Beta(2, 2) prior.
- Beta prior + binomial data → Beta posterior, the engine of Bayesian A/B testing and Thompson sampling.

# Chapter 10: Statistical Inference
%Confidence intervals, hypothesis tests, p-values, power, the bootstrap and multiple testing

## 10.1 Confidence intervals

A 95% **confidence interval** is a procedure that, over repeated samples, captures the true parameter 95% of the time. For a mean with known σ, the CLT gives x̄ ± 1.96 σ/√n. With σ estimated by s and small n, use the **t distribution** with n − 1 degrees of freedom: x̄ ± t<sub>0.975, n−1</sub> s/√n. The t multiplier is larger (2.26 for n = 10) to pay for the uncertainty in s.

> TRAP: "There is a 95% probability that μ lies in this particular interval" is the wrong reading. μ is fixed; the interval is random. The 95% describes the long-run hit rate of the method. (A Bayesian **credible interval** does carry the probability statement, given the prior.)

```python run Coverage of the z interval and the t interval at small n
import numpy as np
from scipy import stats
rng = np.random.default_rng(30)
mu, sigma, reps = 5.0, 2.0, 100_000
for n in (5, 10, 50):
    X = rng.normal(mu, sigma, size=(reps, n))
    m, s = X.mean(1), X.std(1, ddof=1)
    z_cover = np.mean(abs(m - mu) <= 1.96 * s / np.sqrt(n))
    t = stats.t.ppf(0.975, n - 1)
    t_cover = np.mean(abs(m - mu) <= t * s / np.sqrt(n))
    print(f'n = {n:2d}: z-interval with s covers {z_cover:.4f}; t-interval '
          f'(multiplier {t:.3f}) covers {t_cover:.4f}')
```

Plugging s into the z formula undercovers badly at n = 5 (about 88% instead of 95%); the t interval is exact for normal data at every n.

## 10.2 Hypothesis tests and p-values

A test sets a **null hypothesis** H<sub>0</sub> (no effect) and asks how surprising the data would be if H<sub>0</sub> were true. The **p-value** is the probability, under H<sub>0</sub>, of a test statistic at least as extreme as the one observed. Reject H<sub>0</sub> if p < α (commonly 0.05).

| Error | Meaning | Controlled by |
|---|---|---|
| Type I (false positive) | Reject a true H<sub>0</sub> | α: P(Type I) = α by construction |
| Type II (false negative) | Keep a false H<sub>0</sub> | **Power** = 1 − P(Type II), raised by larger n or larger effect |

**Derivation: under H<sub>0</sub> the p-value is uniform on [0, 1].** If the statistic T has continuous CDF F under H<sub>0</sub> and p = 1 − F(T), then P(p ≤ u) = P(F(T) ≥ 1 − u) = u, because F(T) is uniform (the probability integral transform). So with α = 0.05, exactly 5% of true nulls are rejected, and a p-value says nothing about the size or importance of an effect.

```python run Under H0 p-values are uniform; under an effect they pile up near 0
import numpy as np
from scipy import stats
rng = np.random.default_rng(31)
def pvals(effect, n=30, reps=20_000):
    a = rng.normal(0, 1, size=(reps, n)); b = rng.normal(effect, 1, size=(reps, n))
    return stats.ttest_ind(a, b, axis=1).pvalue
p0 = pvals(0.0)
print('no effect: share of p-values in each fifth of [0,1]:',
      np.round(np.histogram(p0, bins=5, range=(0, 1))[0] / len(p0), 3))
print(f'no effect: P(p < 0.05) = {np.mean(p0 < 0.05):.4f}')
for d in (0.3, 0.5, 0.8):
    power = np.mean(pvals(d) < 0.05)
    print(f'effect {d} sd, n = 30 per group: power P(p < 0.05) = {power:.3f}')
```

## 10.3 The common tests

| Test | Question | Statistic |
|---|---|---|
| One-sample z / t | Is the mean equal to μ<sub>0</sub>? | (x̄ − μ<sub>0</sub>)/(s/√n) |
| Two-sample t (Welch) | Do two groups have the same mean? | (x̄<sub>1</sub> − x̄<sub>2</sub>)/√(s<sub>1</sub>²/n<sub>1</sub> + s<sub>2</sub>²/n<sub>2</sub>) |
| Paired t | Did the same units change? | One-sample t on the differences |
| Two-proportion z | Do two conversion rates differ? | (p̂<sub>1</sub> − p̂<sub>2</sub>)/√(p̂(1 − p̂)(1/n<sub>1</sub> + 1/n<sub>2</sub>)), p̂ pooled |
| Chi-square | Are two categorical variables independent? | Σ(O − E)²/E, E = row total × column total / grand total |
| McNemar | Do two classifiers err differently on the same test set? | (b − c)²/(b + c) on the disagreements |

**Derivation of the Welch statistic.** The difference of two independent means has variance σ<sub>1</sub>²/n<sub>1</sub> + σ<sub>2</sub>²/n<sub>2</sub> (Section 7.3, variances add). Divide the observed difference by its estimated standard error.

```python run An A/B test by hand and by library, and a chi-square test of independence
import numpy as np
from scipy import stats
n1, c1, n2, c2 = 10_000, 520, 10_000, 590              # visitors and conversions
p1, p2 = c1 / n1, c2 / n2
pool = (c1 + c2) / (n1 + n2)
z = (p2 - p1) / np.sqrt(pool * (1 - pool) * (1 / n1 + 1 / n2))
p_two = 2 * stats.norm.sf(abs(z))
print(f'rates {p1:.3f} vs {p2:.3f}; z = {z:.3f}; two-sided p = {p_two:.4f}')
table = np.array([[c1, n1 - c1], [c2, n2 - c2]])
chi2, p, dof, expected = stats.chi2_contingency(table, correction=False)
print(f'chi-square {chi2:.3f} (= z^2 {z ** 2:.3f}), p = {p:.4f}')
E = table.sum(1, keepdims=True) * table.sum(0) / table.sum()
print(f'chi-square by hand: {np.sum((table - E) ** 2 / E):.3f}')
se = np.sqrt(p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2)
print(f'95% CI for the lift: [{p2 - p1 - 1.96 * se:.4f}, {p2 - p1 + 1.96 * se:.4f}]')
```

A lift from 5.2% to 5.9% on 10,000 visitors per arm is significant at the 5% level (p ≈ 0.03), but the confidence interval for the lift runs from under 0.1 to 1.3 percentage points: real, yet very imprecisely measured.

For a 2 × 2 table, the chi-square statistic is exactly the square of the two-proportion z statistic, so the two tests always agree.

## 10.4 Power and sample size

To detect a difference δ between two means with significance α and power 1 − β, each group needs approximately

n ≈ 2(z<sub>1−α/2</sub> + z<sub>1−β</sub>)² σ²/δ².

**Derivation.** Under the alternative, the difference of means is centred on δ with SE σ√(2/n). We need the rejection threshold z<sub>1−α/2</sub>·SE to sit z<sub>1−β</sub> standard errors below δ: δ = (z<sub>1−α/2</sub> + z<sub>1−β</sub>)σ√(2/n). Solve for n. With α = 0.05 and 80% power, (1.96 + 0.84)² ≈ 7.85, so n ≈ 15.7σ²/δ². Halving the detectable effect quadruples the sample size.

```python run Sample-size formula versus simulated power
import numpy as np
from scipy import stats
za, zb = stats.norm.ppf(0.975), stats.norm.ppf(0.8)
rng = np.random.default_rng(32)
for delta in (0.5, 0.25):
    n = int(np.ceil(2 * (za + zb) ** 2 / delta ** 2))
    a = rng.normal(0, 1, size=(4000, n)); b = rng.normal(delta, 1, size=(4000, n))
    power = np.mean(stats.ttest_ind(a, b, axis=1).pvalue < 0.05)
    print(f'effect {delta} sd: n = {n} per group, simulated power {power:.3f}')
```

## 10.5 The bootstrap

When no formula for a standard error exists (the median, a ratio, AUC, an F1 score), **resample the data with replacement** many times, recompute the statistic each time, and use the spread of those values. The percentile interval takes the 2.5% and 97.5% quantiles. It works because the empirical distribution approximates the true one, so resampling from it imitates drawing new datasets.

```python run Bootstrap standard error versus the known formula, and a bootstrap CI for a median
import numpy as np
rng = np.random.default_rng(33)
x = rng.exponential(2.0, 400)
boots = np.array([rng.choice(x, len(x)).mean() for _ in range(10_000)])
print(f'SE of the mean: bootstrap {boots.std():.4f}, formula s/sqrt(n) '
      f'{x.std(ddof=1) / np.sqrt(len(x)):.4f}')
meds = np.array([np.median(rng.choice(x, len(x))) for _ in range(10_000)])
lo, hi = np.quantile(meds, [0.025, 0.975])
print(f'median {np.median(x):.3f}, 95% bootstrap CI [{lo:.3f}, {hi:.3f}] '
      f'(true median 2 ln 2 = {2 * np.log(2):.3f})')
cover = 0
for _ in range(300):                                  # does the method cover 95% of the time?
    y = rng.exponential(2.0, 400)
    m = [np.median(rng.choice(y, 400)) for _ in range(1000)]
    a, b = np.quantile(m, [0.025, 0.975])
    cover += a <= 2 * np.log(2) <= b
print(f'coverage of the bootstrap median interval over 300 datasets: {cover / 300:.3f}')
```

The bootstrap reproduces the textbook standard error of the mean exactly, and its interval for the median (for which no simple formula exists) covers the true value in about 95% of datasets.

## 10.6 Multiple testing

Run 20 independent tests of true nulls at α = 0.05 and the chance of at least one false positive is 1 − 0.95<sup>20</sup> ≈ 64%. Testing many metrics, segments or hyperparameters and reporting the significant one is **p-hacking**.

- **Bonferroni**: test each at α/m. Controls the chance of any false positive (the family-wise error rate); conservative.
- **Benjamini–Hochberg**: sort the p-values, find the largest k with p<sub>(k)</sub> ≤ (k/m)α, reject the k smallest. Controls the **false discovery rate** (the expected share of rejections that are false); far more powerful when many effects are real.

```python run Family-wise error with and without correction, and BH versus Bonferroni
import numpy as np
from scipy import stats
rng = np.random.default_rng(34)
m, reps = 20, 20_000
p = rng.random((reps, m))                             # 20 true nulls: uniform p-values
print(f'P(at least one p < 0.05 of 20): {np.mean((p < 0.05).any(1)):.3f} '
      f'(formula {1 - 0.95 ** 20:.3f})')
print(f'with Bonferroni (p < 0.05/20): {np.mean((p < 0.05 / m).any(1)):.3f}')
def bh(pv, alpha=0.05):
    order = np.argsort(pv); m = len(pv)
    ok = np.nonzero(pv[order] <= alpha * np.arange(1, m + 1) / m)[0]
    rej = np.zeros(m, bool)
    if len(ok):
        rej[order[:ok[-1] + 1]] = True
    return rej
truth = np.r_[np.ones(20, bool), np.zeros(80, bool)]   # 20 real effects among 100 tests
found = {'Bonferroni': [], 'BH': []}
false_share = {'Bonferroni': [], 'BH': []}
for _ in range(2000):
    z = rng.normal(np.where(truth, 3.0, 0.0), 1)
    pv = 2 * stats.norm.sf(abs(z))
    for name, rej in (('Bonferroni', pv < 0.05 / 100), ('BH', bh(pv))):
        found[name].append((rej & truth).sum() / truth.sum())
        false_share[name].append((rej & ~truth).sum() / max(rej.sum(), 1))
for name in found:
    print(f'{name:10s}: finds {np.mean(found[name]):.3f} of real effects; '
          f'false discovery rate {np.mean(false_share[name]):.3f}')
```

Both corrections keep false discoveries low, but Benjamini–Hochberg finds nearly twice as many of the real effects, at a false discovery rate still below its 5% target.

## 10.7 Practical lessons

- A 95% CI is a method with 95% long-run coverage; use t multipliers when σ is estimated from small samples.
- Under H<sub>0</sub>, p-values are uniform; a small p-value is not a large effect.
- For an A/B test: two-proportion z (equivalently chi-square), report the lift with a confidence interval, and fix n in advance using the power formula.
- No formula? Bootstrap it.
- Many tests: Bonferroni controls any false positive; Benjamini–Hochberg controls the false discovery rate with much more power.
