# Chapter 3: Probability Distributions
%Bernoulli, binomial, Poisson, geometric, uniform, exponential, normal, t and chi-square, and how they connect

## 3.1 The distributions in the syllabus

| Distribution | PMF or PDF | Mean | Variance | Typical use |
|---|---|---|---|---|
| Discrete uniform on {1, …, n} | 1/n | (n + 1)/2 | (n² − 1)/12 | A fair die |
| Bernoulli(p) | P(1) = p, P(0) = 1 − p | p | p(1 − p) | One trial |
| Binomial(n, p) | C(n, k) pᵏ (1 − p)ⁿ⁻ᵏ | np | np(1 − p) | Successes in n independent trials |
| Geometric(p), trials until the first success | (1 − p)ᵏ⁻¹ p, k = 1, 2, … | 1/p | (1 − p)/p² | Waiting for a success |
| Poisson(λ) | e^(−λ) λᵏ / k! | λ | λ | Counts of rare events in a fixed interval |
| Continuous uniform(a, b) | 1/(b − a) on [a, b] | (a + b)/2 | (b − a)²/12 | Equally likely values |
| Exponential(λ) | λ e^(−λx), x ≥ 0 | 1/λ | 1/λ² | Waiting times |
| Normal(μ, σ²) | (1/(σ√(2π))) e^(−(x − μ)²/(2σ²)) | μ | σ² | Sums and measurements |
| Chi-square(k) | Sum of k squared standard normals | k | 2k | Variances, goodness of fit |
| Student's t(ν) | Z / √(V/ν), Z normal, V ~ χ²(ν), independent | 0 (ν > 1) | ν/(ν − 2) (ν > 2) | Means with unknown σ |

The syllabus lists Poisson under continuous distributions, but it is a discrete distribution: its values are 0, 1, 2, ….

**Useful sums.** Σₖ₌₀^∞ xᵏ = 1/(1 − x) and Σₖ₌₁^∞ k xᵏ⁻¹ = 1/(1 − x)² for |x| < 1. These give the geometric mean 1/p directly.

## 3.2 Binomial and Poisson

The binomial counts successes in n independent trials with the same p. **Sampling with replacement** gives a binomial; sampling without replacement gives a hypergeometric, which has the same mean np but a smaller variance.

When n is large and p small with np = λ moderate, Binomial(n, p) ≈ Poisson(λ). Poisson counts add: if X ~ Poisson(λ₁) and Y ~ Poisson(λ₂) are independent, X + Y ~ Poisson(λ₁ + λ₂).

### Worked example: expected count with replacement

*A bag holds 4 red and 6 blue balls. Fifty balls are drawn one at a time with replacement. Find the expected number of red balls and its variance. (NAT)*

Each draw is red with probability 0.4, so the count is Binomial(50, 0.4): mean 20 and variance 50 × 0.4 × 0.6 = 12.

### Worked example: row and column sums of a random 0–1 matrix

*Each entry of a 4 × 4 matrix is independently 0 or 1 with probability 1/2. Find the probability that row 1 and column 1 both sum to 2. (NAT, three decimal places)*

The entry a₁₁ is shared. If a₁₁ = 1, the other three entries of the row need exactly one 1 (3 ways out of 8) and so do the other three of the column. If a₁₁ = 0, each needs exactly two 1s (3 ways each). So P = (1/2)(3/8)² + (1/2)(3/8)² = (3/8)² = 9/64 ≈ 0.141.

```python run Binomial example and the shared-entry matrix question by enumeration
from fractions import Fraction as F
from itertools import product

n, p = 50, F(2, 5)
print('mean', n * p, ' variance', n * p * (1 - p))

good = 0
for row_rest, col_rest, a11 in product(product((0, 1), repeat=3), product((0, 1), repeat=3),
                                       (0, 1)):
    if a11 + sum(row_rest) == 2 and a11 + sum(col_rest) == 2:
        good += 1
print('P(row 1 and column 1 sum to 2) =', F(good, 2 ** 7), '=', round(good / 2 ** 7, 4))
```

Only the 7 entries in row 1 and column 1 matter; the other 9 entries of the matrix are free and cancel out.

## 3.3 Exponential and its memorylessness

For X ~ Exponential(λ), P(X > x) = e^(−λx). The defining property is **memorylessness**:

P(X > s + t | X > s) = P(X > t).

A component that has survived 5 years is as good as new, which is why the exponential models failures that are not caused by wear.

**Floor of an exponential is geometric.** If Y = ⌊X⌋, then P(Y = k) = P(k ≤ X < k + 1) = e^(−λk)(1 − e^(−λ)) for k = 0, 1, 2, …, a geometric distribution (counting failures before the first success) with success probability q = 1 − e^(−λ).

### Worked example: a rate from a tail probability

*X is exponential and P(X > 3) = 0.2. Find P(X > 9 | X > 6). (NAT, two decimal places)*

By memorylessness, P(X > 9 | X > 6) = P(X > 3) = 0.2. No need to find λ.

### Worked example: the floor of an exponential

*X is exponential with mean 1/ln 4. For Y = ⌊X⌋, P(Y = k) = q(1 − q)ᵏ. Find q. (MCQ)*

λ = ln 4, so e^(−λ) = 1/4 and P(Y = k) = (1/4)ᵏ × (3/4). Comparing with q(1 − q)ᵏ gives q = 3/4.

## 3.4 The normal family

If X ~ N(μ, σ²), then Z = (X − μ)/σ ~ N(0, 1), and aX + b ~ N(aμ + b, a²σ²). Independent normals add: X + Y ~ N(μ₁ + μ₂, σ₁² + σ₂²).

| Interval | Probability |
|---|---|
| μ ± σ | 0.6827 |
| μ ± 2σ | 0.9545 |
| μ ± 3σ | 0.9973 |
| μ ± 1.645σ | 0.90 |
| μ ± 1.96σ | 0.95 |
| μ ± 2.576σ | 0.99 |

Φ(−z) = 1 − Φ(z), and the PDF φ(z) peaks at φ(0) = 1/√(2π) ≈ 0.399.

**Moments of Z.** E[Z] = 0, E[Z²] = 1, E[Z³] = 0, E[Z⁴] = 3. So Var(Z²) = E[Z⁴] − (E[Z²])² = 2, which is also the variance of a χ²(1) variable.

### Worked example: identifying a and b

*X = aZ + b with Z standard normal. E[X] = 3, Var(X) = 9 and Cov(X, Z) = −3. Find a and b. (MCQ)*

E[X] = b = 3. Cov(X, Z) = a Var(Z) = a = −3, and Var(X) = a² = 9 agrees. So a = −3, b = 3. The variance alone cannot fix the sign of a; the covariance does.

### Worked example: comparing N(0, 1) with t(1)

The t density has heavier tails and a lower peak than the standard normal. The t(1) distribution (the Cauchy distribution) has density 1/(π(1 + x²)), so at 0 it is 1/π ≈ 0.318, below the normal's 0.399. Both CDFs equal 0.5 at 0 by symmetry. For a large x, the t CDF is smaller than the normal CDF, because more of its mass lies in the far right tail.

```python run Normal facts, Var(Z^2), and normal versus t(1)
import math, random

Phi = lambda z: 0.5 * (1 + math.erf(z / math.sqrt(2)))
for k in (1, 2, 3, 1.645, 1.96, 2.576):
    print(f'P(|Z| < {k}) = {2 * Phi(k) - 1:.4f}')
random.seed(3)
z2 = [random.gauss(0, 1) ** 2 for _ in range(400_000)]
m = sum(z2) / len(z2)
print(f'Var(Z^2) simulated {sum((v - m) ** 2 for v in z2) / len(z2):.3f} (exact 2)')
print(f'pdf at 0: normal {1 / math.sqrt(2 * math.pi):.4f}, t(1) {1 / math.pi:.4f}')
t1_cdf = lambda x: 0.5 + math.atan(x) / math.pi
print(f'CDF at 2: normal {Phi(2):.4f}, t(1) {t1_cdf(2):.4f}')
```

## 3.5 Chi-square and t

| Fact | Consequence |
|---|---|
| Z₁² + … + Zₖ² ~ χ²(k) for independent standard normals | Sum of squares of k independent N(0, 1) variables |
| χ²(2) is Exponential with mean 2 | Z₁² + Z₂² has mean 2 and is memoryless |
| Σ (Zᵢ − Z̄)² ~ χ²(n − 1) | One degree of freedom is spent estimating the mean |
| n Z̄² ~ χ²(1) | √n Z̄ is standard normal |
| (n − 1)s²/σ² ~ χ²(n − 1) for normal samples | The basis of variance tests |
| (X̄ − μ)/(s/√n) ~ t(n − 1) | The basis of the t-test |
| t(ν) → N(0, 1) as ν → ∞ | Use z for large samples |

```python run Checking chi-square facts by simulation
import random
random.seed(11)
n, trials = 5, 100_000
s1 = s2 = s3 = 0.0
for _ in range(trials):
    z = [random.gauss(0, 1) for _ in range(n)]
    zbar = sum(z) / n
    s1 += sum(v * v for v in z)
    s2 += sum((v - zbar) ** 2 for v in z)
    s3 += n * zbar ** 2
print(f'mean of sum Z^2 {s1 / trials:.3f} (chi2({n}) mean {n})')
print(f'mean of sum (Z - Zbar)^2 {s2 / trials:.3f} (chi2({n - 1}) mean {n - 1})')
print(f'mean of n Zbar^2 {s3 / trials:.3f} (chi2(1) mean 1)')
```

## 3.6 Traps

| Trap | Correct thinking |
|---|---|
| Using the PDF value as a probability | For continuous variables, P(X = x) = 0; probabilities are areas |
| Exponential parameter confusion | Check whether the question gives the rate λ or the mean 1/λ |
| Var(aX + b) for normals | a²σ²; the shift b does not change the spread |
| Treating Poisson as continuous because the syllabus lists it there | It is discrete |
| Geometric mean 1/p versus (1 − p)/p | 1/p counts trials including the success; (1 − p)/p counts failures before it |
| Adding standard deviations of independent variables | Add variances, then take the square root |

# Chapter 4: Sampling, Estimation and Tests
%The central limit theorem, confidence intervals, z-tests, t-tests and chi-square tests

## 4.1 Sampling distributions and the CLT

For an independent sample X₁, …, Xₙ with mean μ and variance σ², the sample mean X̄ has E[X̄] = μ and Var(X̄) = σ²/n. The **central limit theorem** says that for large n,

(X̄ − μ)/(σ/√n) ≈ N(0, 1), or equivalently S = ΣXᵢ ≈ N(nμ, nσ²),

whatever the distribution of the Xᵢ (as long as σ² is finite).

### Worked example: CLT for a sum of Bernoulli variables

*Y is the sum of 400 independent Bernoulli(0.2) variables. Using the CLT, P(72 ≤ Y ≤ 88) is approximately (MCQ) (a) Φ(1) − Φ(−1) (b) Φ(2) − Φ(−2) (c) Φ(0.5) − Φ(−0.5) (d) Φ(88) − Φ(72)*

E[Y] = 80 and Var(Y) = 400 × 0.2 × 0.8 = 64, so σ = 8. The interval is 80 ± 8, which standardises to [−1, 1]. Answer (a), about 0.68.

```python run The CLT approximation against the exact binomial
from math import comb, erf, sqrt

n, p = 400, 0.2
exact = sum(comb(n, k) * p**k * (1 - p)**(n - k) for k in range(72, 89))
Phi = lambda z: 0.5 * (1 + erf(z / sqrt(2)))
print(f'exact {exact:.4f}  CLT {Phi(1) - Phi(-1):.4f}  '
      f'with continuity correction {Phi(8.5 / 8) - Phi(-8.5 / 8):.4f}')
```

The plain CLT answer is a little low here because the binomial is discrete. Widening the interval by half a unit at each end (the continuity correction) brings it closer. GATE options usually follow the plain standardisation, as in the example.

## 4.2 Point estimates and confidence intervals

An estimator θ̂ is **unbiased** if E[θ̂] = θ. X̄ is unbiased for μ, and s² (dividing by n − 1) is unbiased for σ². The **standard error** of X̄ is σ/√n.

| Situation | 100(1 − α)% confidence interval for μ |
|---|---|
| σ known (or n large) | x̄ ± z_(α/2) σ/√n |
| σ unknown, normal population | x̄ ± t_(α/2, n−1) s/√n |
| Proportion, n large | p̂ ± z_(α/2) √(p̂(1 − p̂)/n) |

A 95% interval means the procedure captures μ in 95% of repeated samples. It does not mean a particular computed interval contains μ with probability 0.95; μ is fixed.

**Width.** The interval narrows in proportion to 1/√n: halving the width needs four times the data.

### Worked example: a z interval and the sample size

*n = 64 measurements have mean 50, and σ = 8 is known. Give the 95% interval. How large must n be for a half-width of 1? (NAT)*

Half-width = 1.96 × 8/8 = 1.96, so the interval is [48.04, 51.96]. For half-width 1: 1.96 × 8/√n ≤ 1 gives √n ≥ 15.68, so n ≥ 245.9, that is n = 246.

## 4.3 Hypothesis tests

A test compares a **null hypothesis** H₀ with an alternative H₁, using a statistic whose distribution under H₀ is known.

| Term | Meaning |
|---|---|
| Type I error (α) | Rejecting a true H₀; α is the significance level |
| Type II error (β) | Failing to reject a false H₀ |
| Power | 1 − β: the probability of rejecting a false H₀ |
| p-value | The probability, under H₀, of a statistic at least as extreme as the one observed; reject if p < α |
| Two-sided test at α = 0.05 | Reject if \|z\| > 1.96 |
| One-sided test at α = 0.05 | Reject if z > 1.645 (or z < −1.645) |

| Test | Statistic | Distribution under H₀ |
|---|---|---|
| z-test for a mean, σ known | z = (x̄ − μ₀)/(σ/√n) | N(0, 1) |
| One-sample t-test | t = (x̄ − μ₀)/(s/√n) | t(n − 1) |
| Paired t-test | t-test on the differences | t(n − 1) |
| Two-sample t-test (equal variances) | t = (x̄₁ − x̄₂)/(sₚ √(1/n₁ + 1/n₂)) | t(n₁ + n₂ − 2) |
| Chi-square goodness of fit, k categories | Σ (O − E)²/E | χ²(k − 1 − number of estimated parameters) |
| Chi-square independence, r × c table | Σ (O − E)²/E with E = row total × column total / grand total | χ²((r − 1)(c − 1)) |

### Worked example: a one-sample t-test

*A machine should fill 500 ml. Nine bottles give x̄ = 497 and s = 4.5. Test H₀: μ = 500 against μ ≠ 500 at 5% (t₀.₀₂₅,₈ = 2.306). (NAT: the t statistic)*

t = (497 − 500)/(4.5/3) = −2.0. Since |t| = 2.0 < 2.306, do not reject H₀ at the 5% level.

### Worked example: chi-square goodness of fit

*A die is rolled 120 times, giving counts 25, 17, 15, 23, 24, 16 for faces 1 to 6. Compute the chi-square statistic for fairness and its degrees of freedom. (NAT)*

E = 20 for every face. Σ (O − E)²/E = (25 + 9 + 25 + 9 + 16 + 16)/20 = 100/20 = 5.0, with 6 − 1 = 5 degrees of freedom. The 5% critical value of χ²(5) is 11.07, so fairness is not rejected.

```python run The interval, the t-test and the chi-square test
from math import sqrt, ceil
from scipy import stats

print('half-width', 1.96 * 8 / sqrt(64), ' n needed', ceil((1.96 * 8) ** 2))
t = (497 - 500) / (4.5 / sqrt(9))
print(f't = {t:.2f}  critical {stats.t.ppf(0.975, 8):.3f}  '
      f'p-value {2 * stats.t.cdf(t, 8):.3f}')
obs = [25, 17, 15, 23, 24, 16]
chi2 = sum((o - 20) ** 2 / 20 for o in obs)
print(f'chi2 = {chi2}  critical {stats.chi2.ppf(0.95, 5):.2f}  '
      f'p-value {stats.chi2.sf(chi2, 5):.3f}')
```

## 4.4 Traps

| Trap | Correct thinking |
|---|---|
| Standard error σ instead of σ/√n | The mean of n values varies less than one value |
| Using z with a small sample and unknown σ | Use t with n − 1 degrees of freedom |
| Degrees of freedom of a goodness-of-fit test | k − 1, minus one more for each parameter estimated from the data |
| "Accept H₀" | Say "do not reject"; a test can only find evidence against H₀ |
| Interpreting a confidence interval as a probability for μ | The randomness is in the interval, not in μ |
| Rounding n down in sample-size questions | Always round up |
