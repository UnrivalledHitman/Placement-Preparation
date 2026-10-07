# Chapter 7: Probability
%Rules, random variables, the distributions ML uses, and how to check them by simulation

## 7.1 The rules

| Rule | Formula | Comment |
|---|---|---|
| Complement | P(not A) = 1 − P(A) | "At least one" problems |
| Addition | P(A ∪ B) = P(A) + P(B) − P(A ∩ B) | Subtract the double count |
| Conditional | P(A \| B) = P(A ∩ B)/P(B) | Restrict the world to B |
| Multiplication | P(A ∩ B) = P(A \| B) P(B) | Chain rule of probability |
| Independence | P(A ∩ B) = P(A) P(B), i.e. P(A \| B) = P(A) | Knowing B tells nothing about A |
| Total probability | P(A) = Σ<sub>i</sub> P(A \| B<sub>i</sub>) P(B<sub>i</sub>) | B<sub>i</sub> partition the space |
| Bayes | P(B \| A) = P(A \| B) P(B) / P(A) | Reverse a conditional |

The **chain rule of probability**, P(x<sub>1</sub>, …, x<sub>n</sub>) = Π<sub>t</sub> P(x<sub>t</sub> \| x<sub>1</sub>, …, x<sub>t−1</sub>), is exactly how a language model assigns probability to a sentence: one next-token probability at a time.

## 7.2 Bayes' theorem and the base-rate trap

**Derivation.** Write P(A ∩ B) both ways with the multiplication rule: P(B \| A)P(A) = P(A \| B)P(B). Divide by P(A), and expand P(A) by total probability.

**Example.** A disease affects 1% of people. A test detects it 95% of the time (sensitivity) and gives a false positive 5% of the time (specificity 95%). If you test positive, what is the chance you have the disease?

P(D \| +) = 0.95 × 0.01 / (0.95 × 0.01 + 0.05 × 0.99) = 0.0095 / 0.059 ≈ 0.161.

Only about 16%. Among 10,000 people, about 95 true positives are swamped by about 495 false positives. The same trap appears in ML as **precision under class imbalance**: a fraud model with 95% recall and a 5% false-positive rate has terrible precision if fraud is 1 in 1,000.

```python run Bayes on the medical test, by formula and by simulating a million people
import numpy as np
prior, sens, fpr = 0.01, 0.95, 0.05
post = sens * prior / (sens * prior + fpr * (1 - prior))
print(f'formula: P(disease | positive) = {post:.4f}')
rng = np.random.default_rng(18)
n = 1_000_000
sick = rng.random(n) < prior
positive = np.where(sick, rng.random(n) < sens, rng.random(n) < fpr)
print(f'simulation: {sick[positive].mean():.4f} of {positive.sum():,} positives are sick')
second = np.where(sick, rng.random(n) < sens, rng.random(n) < fpr)
both = positive & second
print(f'after two independent positive tests: {sick[both].mean():.4f} '
      f'(formula {sens**2 * prior / (sens**2 * prior + fpr**2 * (1 - prior)):.4f})')
```

The simulation agrees with the formula to within half a percentage point; the gap is sampling noise (this run happened to draw slightly more sick people than 1%). A second independent positive test raises the probability to about 78%: yesterday's posterior becomes today's prior. That is the core of Bayesian updating (Chapter 9).

## 7.3 Random variables, expectation and variance

A **random variable** assigns a number to each outcome. Its **expectation** is the probability-weighted average, E[X] = Σ x P(X = x) or ∫ x p(x) dx. Its **variance** is Var(X) = E[(X − μ)²].

**Derivation of the shortcut.** Var(X) = E[X² − 2μX + μ²] = E[X²] − 2μE[X] + μ² = E[X²] − μ².

| Rule | Holds when |
|---|---|
| E[aX + b] = aE[X] + b | Always |
| E[X + Y] = E[X] + E[Y] | **Always**, even if dependent (linearity) |
| E[XY] = E[X] E[Y] | X, Y independent (uncorrelated is enough) |
| Var(aX + b) = a² Var(X) | Always; shifting does not change spread |
| Var(X + Y) = Var(X) + Var(Y) + 2 Cov(X, Y) | Always; the covariance term vanishes if independent |
| Cov(X, Y) = E[XY] − E[X]E[Y] | Always |
| Corr(X, Y) = Cov(X, Y)/(σ<sub>X</sub>σ<sub>Y</sub>) ∈ [−1, 1] | Always (Cauchy–Schwarz, Section 1.3) |

**Derivation of the sum rule.** Var(X + Y) = E[((X − μ<sub>X</sub>) + (Y − μ<sub>Y</sub>))²], and expanding the square gives Var(X) + Var(Y) + 2E[(X − μ<sub>X</sub>)(Y − μ<sub>Y</sub>)].

Linearity of expectation solves problems that look hard. Expected number of fixed points of a random permutation of n items: let I<sub>i</sub> = 1 if item i stays put; E[I<sub>i</sub>] = 1/n, so E[Σ I<sub>i</sub>] = n × 1/n = 1, for every n, even though the I<sub>i</sub> are dependent.

> TRAP: Zero correlation does not imply independence. If X ~ N(0, 1) and Y = X², then Cov(X, Y) = E[X³] = 0, yet Y is completely determined by X. Correlation only measures **linear** association.

```python run Expectation and variance rules, including the dependent cases
import numpy as np
rng = np.random.default_rng(19)
N = 1_000_000
X = rng.normal(2, 3, N)
Y = 0.5 * X + rng.normal(0, 1, N)                    # dependent on X
print(f'E[X+Y] {np.mean(X + Y):.3f} vs E[X]+E[Y] {X.mean() + Y.mean():.3f}')
lhs = np.var(X + Y)
rhs = np.var(X) + np.var(Y) + 2 * np.cov(X, Y, ddof=0)[0, 1]
print(f'Var(X+Y) {lhs:.3f}; Var X + Var Y {np.var(X) + np.var(Y):.3f}; '
      f'with 2 Cov {rhs:.3f}')
print(f'Var(3X + 7) {np.var(3 * X + 7):.3f} vs 9 Var(X) {9 * np.var(X):.3f}')
for n in (5, 50, 500):
    fixed = [np.sum(rng.permutation(n) == np.arange(n)) for _ in range(20_000)]
    print(f'random permutations of {n}: mean number of fixed points {np.mean(fixed):.3f}')
Z = rng.normal(size=N)
print(f'corr(Z, Z^2) = {np.corrcoef(Z, Z ** 2)[0, 1]:.4f}, yet Z^2 is a function of Z')
```

## 7.4 The distributions ML uses

| Distribution | Models | Mean | Variance | ML appearance |
|---|---|---|---|---|
| Bernoulli(p) | One yes/no trial | p | p(1 − p) | Binary labels; logistic regression output |
| Binomial(n, p) | Successes in n trials | np | np(1 − p) | Accuracy on a test set of n examples |
| Geometric(p) | Trials until first success | 1/p | (1 − p)/p² | Retries until success |
| Poisson(λ) | Counts of rare events in a fixed window | λ | λ | Requests per second, word counts |
| Categorical(**p**) | One of K classes | — | — | Softmax output, next-token sampling |
| Uniform(a, b) | Equal chance on an interval | (a + b)/2 | (b − a)²/12 | Random initialisation, random search |
| Exponential(λ) | Waiting time between Poisson events | 1/λ | 1/λ² | Time between failures; memoryless |
| Normal N(μ, σ²) | Sums of many small effects | μ | σ² | Noise model behind squared error; initialisation |
| Beta(α, β) | A probability itself | α/(α + β) | αβ/((α + β)²(α + β + 1)) | Prior for a click-through rate (Chapter 9) |

**Derivation of the Bernoulli and Binomial moments.** For X ~ Bernoulli(p), E[X] = 1·p + 0·(1 − p) = p and E[X²] = p, so Var = p − p² = p(1 − p). A Binomial is a sum of n independent Bernoullis, so by linearity its mean is np and, by independence, its variance is np(1 − p).

**Derivation of the Uniform(0, 1) variance.** E[X²] = ∫<sub>0</sub><sup>1</sup> x² dx = 1/3, so Var = 1/3 − 1/4 = 1/12.

**Derivation of the Geometric mean.** E[N] = Σ<sub>k≥1</sub> k(1 − p)<sup>k−1</sup>p. Using Σ k r<sup>k−1</sup> = 1/(1 − r)² with r = 1 − p gives p/p² = 1/p.

**Poisson as a limit of the Binomial.** With n large and p = λ/n small, C(n, k)p<sup>k</sup>(1 − p)<sup>n−k</sup> → e<sup>−λ</sup>λ<sup>k</sup>/k!. This is why rare events in many opportunities are Poisson.

```python run Every mean and variance in the table, checked by simulation
import numpy as np
rng = np.random.default_rng(20)
N = 2_000_000
p, n, lam, a, b, mu, sd, al, be = 0.3, 20, 4.0, 2.0, 5.0, 1.0, 2.0, 2.0, 5.0
rows = [
    ('Bernoulli(0.3)', rng.random(N) < p,          p, p * (1 - p)),
    ('Binomial(20, 0.3)', rng.binomial(n, p, N),   n * p, n * p * (1 - p)),
    ('Geometric(0.3)', rng.geometric(p, N),        1 / p, (1 - p) / p ** 2),
    ('Poisson(4)', rng.poisson(lam, N),            lam, lam),
    ('Uniform(2, 5)', rng.uniform(a, b, N),        (a + b) / 2, (b - a) ** 2 / 12),
    ('Exponential(4)', rng.exponential(1 / lam, N), 1 / lam, 1 / lam ** 2),
    ('Normal(1, 4)', rng.normal(mu, sd, N),        mu, sd ** 2),
    ('Beta(2, 5)', rng.beta(al, be, N),            al / (al + be),
     al * be / ((al + be) ** 2 * (al + be + 1))),
]
heads = ('mean sim', 'formula', 'var sim', 'formula')
print(f'{"distribution":18s}' + ''.join(f'{h:>10s}' for h in heads))
for name, x, m, v in rows:
    x = x.astype(float)
    print(f'{name:18s}{x.mean():10.4f}{m:10.4f}{x.var():10.4f}{v:10.4f}')
```

```python run Poisson as the limit of Binomial(n, 4/n)
import numpy as np
from scipy import stats
k = np.arange(0, 12)
pois = stats.poisson.pmf(k, 4)
for n in (10, 100, 10_000):
    diff = np.max(abs(stats.binom.pmf(k, n, 4 / n) - pois))
    print(f'n = {n:>6,}: largest pmf difference from Poisson(4) = {diff:.2e}')
```

## 7.5 The normal distribution

The density is p(x) = (1/(σ√(2π))) exp(−(x − μ)²/(2σ²)). Facts worth memorising:

- About 68%, 95% and 99.7% of the mass lies within 1, 2 and 3 standard deviations (the 95% point is 1.96σ exactly).
- Linear combinations of independent normals are normal: aX + bY ~ N(aμ<sub>X</sub> + bμ<sub>Y</sub>, a²σ<sub>X</sub>² + b²σ<sub>Y</sub>²).
- **Standardising**: Z = (X − μ)/σ ~ N(0, 1).
- **Why squared error is a Gaussian assumption.** If y = f(**x**) + ε with ε ~ N(0, σ²), then −ln p(y \| **x**) = (y − f(**x**))²/(2σ²) + constant. Maximising the likelihood is minimising squared error (Chapter 9).

```python run The 68-95-99.7 rule and the sum of independent normals
import numpy as np
from scipy import stats
for k in (1, 1.96, 2, 3):
    print(f'P(|Z| < {k}) = {stats.norm.cdf(k) - stats.norm.cdf(-k):.4f}')
rng = np.random.default_rng(21)
X = rng.normal(1, 2, 1_000_000); Y = rng.normal(-3, 1, 1_000_000)
S = 2 * X - Y
print(f'2X - Y: mean {S.mean():.3f} (formula 5), var {S.var():.3f} (formula 4*4 + 1 = 17)')
ks = stats.kstest(S[:5000], stats.norm(5, np.sqrt(17)).cdf)
print(f'KS test against N(5, 17) on 5,000 draws: p-value {ks.pvalue:.3f}')
```

## 7.6 The multivariate normal and covariance

A random vector **X** ~ N(**μ**, **Σ**) has density proportional to exp(−½(**x** − **μ**)<sup>T</sup>**Σ**<sup>−1</sup>(**x** − **μ**)). Contours are ellipses whose axes are the eigenvectors of **Σ** with half-lengths proportional to √λ<sub>i</sub> (Chapter 3). Two key facts:

- **Linear maps**: if **X** ~ N(**μ**, **Σ**), then **AX** + **b** ~ N(**Aμ** + **b**, **AΣA**<sup>T</sup>). Derivation of the covariance: Cov(**AX**) = E[**A**(**X** − **μ**)(**X** − **μ**)<sup>T</sup>**A**<sup>T</sup>] = **AΣA**<sup>T</sup>.
- **Sampling**: if **Σ** = **LL**<sup>T</sup> (Cholesky) and **Z** ~ N(**0**, **I**), then **μ** + **LZ** ~ N(**μ**, **Σ**), because Cov(**LZ**) = **LIL**<sup>T</sup> = **Σ**. This is the **reparameterisation trick** used by variational autoencoders: the randomness is moved into **Z**, so gradients can flow through **μ** and **L**.
- For a multivariate normal, **uncorrelated does imply independent**, unlike in general.

```python run Sampling a multivariate normal with Cholesky, and the AΣA^T rule
import numpy as np
rng = np.random.default_rng(22)
mu = np.array([1.0, -2.0, 0.5])
Sigma = np.array([[4.0, 1.2, -0.8], [1.2, 2.0, 0.3], [-0.8, 0.3, 1.0]])
L = np.linalg.cholesky(Sigma)
X = mu + rng.normal(size=(1_000_000, 3)) @ L.T
print('sample mean:', np.round(X.mean(0), 3))
print('max |sample cov - Sigma|:', f'{np.max(abs(np.cov(X, rowvar=False) - Sigma)):.4f}')
A = np.array([[1.0, -1.0, 0.0], [0.5, 0.5, 2.0]])
Y = X @ A.T
print('cov of AX by sample:\n', np.round(np.cov(Y, rowvar=False), 3))
print('A Sigma A^T:\n', np.round(A @ Sigma @ A.T, 3))
```

## 7.7 Practical lessons

- Use Bayes whenever a conditional must be reversed; never ignore the base rate.
- Linearity of expectation needs no independence; the variance of a sum does, through the covariance term.
- Zero correlation is not independence (except for jointly normal variables).
- Squared error ⇔ Gaussian noise; cross-entropy ⇔ Bernoulli or categorical labels.
- Sample N(**μ**, **Σ**) as **μ** + **LZ** with Cholesky **L**: the reparameterisation trick.

# Chapter 8: Limit Theorems and the Standard Error
%Why averages work, why they are normal, and how precise they are

## 8.1 The law of large numbers

If X<sub>1</sub>, …, X<sub>n</sub> are independent with mean μ and variance σ², the sample mean X̄ = (1/n)ΣX<sub>i</sub> converges to μ.

**Derivation (via Chebyshev).** E[X̄] = μ by linearity. By independence, Var(X̄) = (1/n²)Σ Var(X<sub>i</sub>) = σ²/n. **Chebyshev's inequality**, P(\|Y − E[Y]\| ≥ ε) ≤ Var(Y)/ε², then gives P(\|X̄ − μ\| ≥ ε) ≤ σ²/(nε²) → 0.

This is why training on more data works, why Monte Carlo estimates converge, and why validation accuracy on a large set is trustworthy.

## 8.2 The standard error: σ/√n

The spread of the sample mean is the **standard error** SE = σ/√n. It is the single most useful formula in experimental work:

- To halve the uncertainty you need **four times** as much data.
- A model's accuracy measured on n test examples has SE = √(p(1 − p)/n). With p ≈ 0.9 and n = 1,000, SE ≈ 0.0095, so a 0.5-point difference between two models on that test set is well within noise.

```python run Standard error of a mean, and of a test-set accuracy
import numpy as np
rng = np.random.default_rng(23)
sigma = 3.0
for n in (25, 100, 400, 1600):
    means = rng.normal(10, sigma, size=(20_000, n)).mean(1)
    se = sigma / np.sqrt(n)
    print(f'n = {n:5d}: spread of sample means {means.std():.4f}, sigma/sqrt(n) {se:.4f}')
p, n = 0.9, 1000
acc = rng.binomial(n, p, 50_000) / n
print(f'accuracy on 1,000 examples (true 0.9): SE {acc.std():.4f}, formula '
      f'{np.sqrt(p * (1 - p) / n):.4f}; 95% of runs in [{np.quantile(acc, 0.025):.3f}, '
      f'{np.quantile(acc, 0.975):.3f}]')
```

## 8.3 The central limit theorem

Whatever the distribution of X<sub>i</sub> (as long as the variance is finite), the standardised mean (X̄ − μ)/(σ/√n) approaches N(0, 1) as n grows. Sums of many small independent effects look normal, which is why the normal distribution is everywhere and why confidence intervals of the form estimate ± 1.96 SE work (Chapter 10).

The approach can be slow for skewed distributions. The standard measure is **skewness**; for the mean of n samples it shrinks like 1/√n.

```python run CLT: means of a very skewed distribution become normal
import numpy as np
from scipy import stats
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
rng = np.random.default_rng(24)
fig, axes = plt.subplots(1, 4, figsize=(11, 2.6))
for ax, n in zip(axes, (1, 5, 30, 200)):
    means = rng.exponential(1.0, size=(50_000, n)).mean(1)   # mean 1, sd 1, skewness 2
    z = (means - 1) / (1 / np.sqrt(n))
    inside = np.mean(abs(z) < 1.96)
    print(f'n = {n:3d}: skewness {stats.skew(means):.3f} (theory {2 / np.sqrt(n):.3f}), '
          f'P(|z| < 1.96) = {inside:.4f}')
    ax.hist(z, bins=80, density=True, alpha=0.6)
    xs = np.linspace(-4, 4, 200)
    ax.plot(xs, stats.norm.pdf(xs), 'r'); ax.set_xlim(-4, 4); ax.set_title(f'n = {n}')
plt.tight_layout(); plt.savefig('mx_clt.png', dpi=130)
```

![Standardised means of exponential samples approach the normal curve](figs/mx_clt.png)

> TRAP: The CLT needs a finite variance. For heavy-tailed data (the Cauchy distribution, some latency or income data) the sample mean never settles down; report medians and quantiles instead.

```python run When the CLT fails: the Cauchy sample mean never settles
import numpy as np
rng = np.random.default_rng(25)
for n in (100, 10_000, 1_000_000):
    m = [np.mean(rng.standard_cauchy(n)) for _ in range(5)]
    med = [np.median(rng.standard_cauchy(n)) for _ in range(5)]
    print(f'n = {n:>9,}: five sample means {np.round(m, 2)}; five medians {np.round(med, 3)}')
```

## 8.4 Practical lessons

- Var(X̄) = σ²/n, so SE = σ/√n: four times the data halves the error.
- Accuracy on n test examples has SE √(p(1 − p)/n); compare models with that in mind.
- The CLT makes averages approximately normal; skewed data need larger n, and infinite-variance data never get there.
