## Part 5 solutions

### N5.1 Conditional dice

Of the 36 equally likely outcomes, 11 contain at least one six (6 with a six on the first die, 6 on the second, minus the double-counted (6, 6)). Of those, the sum is 7 for (1, 6) and (6, 1). So P = 2/11 ≈ 0.1818, slightly higher than the unconditional 1/6 ≈ 0.1667: conditioning on a six rules out four of the six ways to make 7, but it rules out an even larger share (25 of 36) of all outcomes.

```python run Checking N5.1
import numpy as np
rng = np.random.default_rng(201)
d = rng.integers(1, 7, size=(2_000_000, 2))
six = (d == 6).any(1)
print(f'simulated {np.mean(d[six].sum(1) == 7):.4f}, exact 2/11 = {2 / 11:.4f}')
```

### N5.2 A one-word spam filter

P(spam \| offer) = 0.2 × 0.6 / (0.2 × 0.6 + 0.8 × 0.05) = 0.12/0.16 = 0.75. The word is 12 times more likely in spam (0.6/0.05), which turns prior odds of 1 : 4 into posterior odds of 3 : 1. **Naive Bayes** multiplies such likelihood ratios across all the words of an e-mail, assuming they are independent given the class.

```python run Checking N5.2
import numpy as np
rng = np.random.default_rng(202)
n = 2_000_000
spam = rng.random(n) < 0.2
offer = np.where(spam, rng.random(n) < 0.6, rng.random(n) < 0.05)
print(f'simulated {spam[offer].mean():.4f}, formula 0.75')
```

### N5.3 Averaging correlated models

Var((1/n)ΣX<sub>i</sub>) = (1/n²)[nσ² + n(n − 1)ρσ²] = ρσ² + (1 − ρ)σ²/n. As n → ∞ the second term vanishes but the first does not: the variance of the average **plateaus at ρσ²**. Averaging only removes the independent part of the errors. That is why bagging and random forests work hard to **decorrelate** their trees (bootstrap samples, random feature subsets at each split): lowering ρ lowers the floor.

```python run Checking N5.3
import numpy as np
rng = np.random.default_rng(203)
rho, sigma = 0.3, 1.0
for n in (1, 10, 100):
    common = rng.normal(size=(50_000, 1))                    # shared error component
    own = rng.normal(size=(50_000, n))
    X = sigma * (np.sqrt(rho) * common + np.sqrt(1 - rho) * own)
    formula = rho * sigma ** 2 + (1 - rho) * sigma ** 2 / n
    print(f'n = {n:3d}: variance of the average {X.mean(1).var():.4f}, formula {formula:.4f}')
```

### N5.4 Waiting times

(a) Geometric with p = 0.2: E = 1/p = 5 tosses.

(b) Let E be the expected number of tosses to get HH. Condition on the start: with probability ½ the first toss is T and we start over (1 + E); with probability ¼ it is HT and we start over (2 + E); with probability ¼ it is HH and we are done in 2. So E = ½(1 + E) + ¼(2 + E) + ¼ · 2, which gives E/4 = 3/2, E = 6.

```python run Checking N5.4
import numpy as np
rng = np.random.default_rng(204)
print(f'(a) mean tosses to first head: {rng.geometric(0.2, 1_000_000).mean():.4f} (exact 5)')
tosses = rng.random(3_000_000) < 0.5
counts, run, n = [], 0, 0
for t in tosses:
    n += 1
    run = run + 1 if t else 0
    if run == 2:
        counts.append(n); run, n = 0, 0
print(f'(b) mean tosses to HH over {len(counts):,} runs: {np.mean(counts):.4f} (exact 6)')
```

### N5.5 Memorylessness

For T ~ Exponential(λ), P(T > t) = e<sup>−λt</sup>. Then P(T > s + t \| T > s) = P(T > s + t)/P(T > s) = e<sup>−λ(s+t)</sup>/e<sup>−λs</sup> = e<sup>−λt</sup> = P(T > t). Having waited s tells you nothing about the remaining wait. For a uniform waiting time on [0, 10], P(T > 7 \| T > 5) = 3/5 = 0.6, but P(T > 2) = 0.8: waiting makes the end closer, so it is not memoryless.

```python run Checking N5.5
import numpy as np
rng = np.random.default_rng(205)
e = rng.exponential(1 / 0.3, 2_000_000)
u = rng.uniform(0, 10, 2_000_000)
for name, T in (('exponential', e), ('uniform', u)):
    cond = np.mean(T[T > 5] > 7)
    print(f'{name:11s}: P(T > 7 | T > 5) = {cond:.4f}, P(T > 2) = {np.mean(T > 2):.4f}')
```

### N5.6 Test-set precision

SE = √(0.85 × 0.15/1000) = √0.0001275 ≈ 0.0113, so the 95% interval is 0.85 ± 1.96 × 0.0113 = 0.85 ± 0.022, about [0.828, 0.872]. For SE = 0.005: n = 0.1275/0.005² = 5,100 examples. Two models scoring 85.0% and 86.0% on the same 1,000 examples are therefore not clearly different (a paired test on the examples they disagree on is the right comparison: McNemar).

```python run Checking N5.6
import numpy as np
rng = np.random.default_rng(206)
se = np.sqrt(0.85 * 0.15 / 1000)
print(f'SE {se:.4f}; 95% interval [{0.85 - 1.96 * se:.3f}, {0.85 + 1.96 * se:.3f}]')
print(f'n for SE 0.005: {0.85 * 0.15 / 0.005 ** 2:.0f}')
print(f'simulated SE with n = 5,100: {np.std(rng.binomial(5100, 0.85, 100_000) / 5100):.4f}')
```

### N5.7 Variance of a sum

Var(X<sub>1</sub> + X<sub>2</sub>) = 4 + 1 + 2(−1.5) = 2; Var(X<sub>1</sub> − X<sub>2</sub>) = 4 + 1 − 2(−1.5) = 8; Corr = −1.5/(2 × 1) = −0.75. Negative correlation makes the sum less variable than either part's variances added, which is the principle behind hedging and behind combining models whose errors cancel.

```python run Checking N5.7
import numpy as np
rng = np.random.default_rng(207)
S = np.array([[4.0, -1.5], [-1.5, 1.0]])
X = rng.normal(size=(2_000_000, 2)) @ np.linalg.cholesky(S).T
print(f'Var(X1 + X2) {np.var(X.sum(1)):.4f} (2); '
      f'Var(X1 - X2) {np.var(X[:, 0] - X[:, 1]):.4f} (8); '
      f'corr {np.corrcoef(X.T)[0, 1]:.4f} (-0.75)')
```

## Part 6 solutions

### N6.1 Geometric MLE

ℓ(p) = Σ[ln p + (x<sub>i</sub> − 1) ln(1 − p)] = n ln p + (Σx<sub>i</sub> − n) ln(1 − p). Setting ℓ′(p) = n/p − (Σx<sub>i</sub> − n)/(1 − p) = 0 gives n(1 − p) = p(Σx<sub>i</sub> − n), so p̂ = n/Σx<sub>i</sub> = 1/x̄: if a success takes 4 trials on average, the estimated success rate is 1/4.

```python run Checking N6.1
import numpy as np
from scipy.optimize import minimize_scalar
rng = np.random.default_rng(208)
x = rng.geometric(0.35, 300)
nll = lambda p: -(len(x) * np.log(p) + (x.sum() - len(x)) * np.log(1 - p))
r = minimize_scalar(nll, bounds=(1e-4, 1 - 1e-4), method='bounded')
print(f'numeric MLE {r.x:.5f}, 1/mean {1 / x.mean():.5f}')
```

### N6.2 The uniform MLE is biased

The likelihood is θ<sup>−n</sup> when every x<sub>i</sub> ≤ θ and 0 otherwise. It decreases in θ, so it is maximised at the smallest allowed value, θ̂ = max x<sub>i</sub>. P(max ≤ t) = (t/θ)<sup>n</sup>, so its density is nt<sup>n−1</sup>/θ<sup>n</sup> and E[max] = ∫<sub>0</sub><sup>θ</sup> t · nt<sup>n−1</sup>/θ<sup>n</sup> dt = nθ/(n + 1). The maximum always underestimates (the true end point is never observed). The unbiased version is ((n + 1)/n) max x<sub>i</sub>. With θ = 10 and n = 5: E[max] = 50/6 ≈ 8.333.

```python run Checking N6.2
import numpy as np
rng = np.random.default_rng(209)
M = rng.uniform(0, 10, size=(500_000, 5)).max(1)
print(f'mean of max {M.mean():.4f} (theory {5 * 10 / 6:.4f}); '
      f'mean of 6/5 max {(6 / 5 * M).mean():.4f} (target 10)')
```

### N6.3 MAP for a Gaussian mean

Minimise Σ(x<sub>i</sub> − μ)²/(2σ²) + μ²/(2τ²). The derivative −Σ(x<sub>i</sub> − μ)/σ² + μ/τ² = 0 gives μ̂ = Σx<sub>i</sub>/(n + σ²/τ²) = x̄ · n/(n + σ²/τ²). The factor n/(n + σ²/τ²) < 1 shrinks the mean towards the prior mean 0; the shrinkage fades as n grows or as the prior widens (τ → ∞ recovers the MLE). This is ridge regression with a single coefficient.

```python run Checking N6.3
import numpy as np
from scipy.optimize import minimize_scalar
rng = np.random.default_rng(210)
sigma, tau = 2.0, 0.5
x = rng.normal(1.5, sigma, 8)
obj = lambda m: np.sum((x - m) ** 2) / (2 * sigma ** 2) + m ** 2 / (2 * tau ** 2)
r = minimize_scalar(obj)
formula = x.sum() / (len(x) + sigma ** 2 / tau ** 2)
print(f'sample mean {x.mean():.4f}; MAP numeric {r.x:.4f}, formula {formula:.4f}')
```

### N6.4 Beta posterior

Prior Beta(1, 1) with 3 successes and 7 failures gives posterior **Beta(4, 8)**. Mean 4/12 ≈ 0.333; mode (4 − 1)/(4 + 8 − 2) = 0.3 (which equals the MLE 3/10, because a uniform prior adds nothing to the mode). P(rate > 0.5) is the upper tail of the Beta(4, 8) distribution.

```python run Solution N6.4
from scipy import stats
post = stats.beta(4, 8)
mode = (4 - 1) / (4 + 8 - 2)
print(f'mean {post.mean():.4f}, mode {mode:.4f}, P(rate > 0.5) {post.sf(0.5):.4f}')
print(f'95% credible interval [{post.ppf(0.025):.3f}, {post.ppf(0.975):.3f}]')
```

With only 10 views, the 95% credible interval is very wide: the data are consistent with anything from a poor to a good button.

### N6.5 Shrinkage beats unbiasedness

E[cx̄] = cμ and Var(cx̄) = c²σ²/n, so MSE(c) = (c − 1)²μ² + c²σ²/n. Setting the derivative 2(c − 1)μ² + 2cσ²/n to zero gives c* = μ²/(μ² + σ²/n). With μ = 1, σ = 3, n = 10: σ²/n = 0.9, c* = 1/1.9 ≈ 0.526, MSE(x̄) = 0.9 and MSE(c*x̄) = μ²(σ²/n)/(μ² + σ²/n) = 0.9/1.9 ≈ 0.474.

```python run Solution N6.5
import numpy as np
rng = np.random.default_rng(211)
mu, sigma, n = 1.0, 3.0, 10
xbar = rng.normal(mu, sigma, size=(1_000_000, n)).mean(1)
c = mu ** 2 / (mu ** 2 + sigma ** 2 / n)
print(f'c* = {c:.4f}')
print(f'MSE of x-bar {np.mean((xbar - mu) ** 2):.4f} (theory 0.9000); '
      f'MSE of c* x-bar {np.mean((c * xbar - mu) ** 2):.4f} (theory {0.9 / 1.9:.4f})')
```

The catch: c* depends on the unknown μ. In practice the shrinkage amount is estimated from the data (the **James–Stein** estimator does this for three or more means and provably beats the sample means) or chosen by cross-validation, exactly as λ is for ridge.

### N6.6 Laplace smoothing

Naive Bayes scores a document by P(class) Π<sub>w</sub> P(w \| class). If a word never appeared in the training documents of a class, its MLE P(w \| class) = 0/n = 0, and the **whole product becomes 0**, whatever the other words say; one rare word can veto the correct class. Add-one smoothing estimates (count + 1)/(n + V) for a vocabulary of V words. In MAP terms (guide Section 9.5) this comes from a symmetric Dirichlet prior with parameter 2 (the multi-category version of Beta(2, 2)): before seeing data we believe every word has some small chance in every class. With many observations the prior's influence disappears; with few it prevents overconfident zeros.

## Part 7 solutions

### N7.1 A t interval

SE = s/√n = 8/4 = 2 ms. With 15 degrees of freedom, t<sub>0.975</sub> ≈ 2.131, so the interval is 52 ± 4.26, about **[47.74, 56.26] ms**. The z multiplier 1.96 would give a narrower [48.08, 55.92], which undercovers for n = 16.

```python run Checking N7.1
from scipy import stats
t = stats.t.ppf(0.975, 15)
print(f't = {t:.4f}; interval [{52 - t * 2:.2f}, {52 + t * 2:.2f}]')
```

### N7.2 An A/B test

p̂<sub>1</sub> = 0.05, p̂<sub>2</sub> = 0.0625, pooled p̂ = 450/8000 = 0.05625. SE<sub>pooled</sub> = √(0.05625 × 0.94375 × (2/4000)) ≈ 0.00515, so z = 0.0125/0.00515 ≈ 2.43 and the two-sided p ≈ 0.015. For the interval use the unpooled SE √(0.05 × 0.95/4000 + 0.0625 × 0.9375/4000).

```python run Checking N7.2
import numpy as np
from scipy import stats
p1, p2, n = 200 / 4000, 250 / 4000, 4000
pool = 450 / 8000
z = (p2 - p1) / np.sqrt(pool * (1 - pool) * 2 / n)
se = np.sqrt(p1 * (1 - p1) / n + p2 * (1 - p2) / n)
print(f'z = {z:.3f}, two-sided p = {2 * stats.norm.sf(z):.4f}')
print(f'lift {p2 - p1:.4f}, 95% CI [{p2 - p1 - 1.96 * se:.4f}, {p2 - p1 + 1.96 * se:.4f}]; '
      f'relative lift {(p2 - p1) / p1:.0%}')
```

### N7.3 Sample size

n ≈ (1.96 + 0.8416)² × (0.05 × 0.95 + 0.06 × 0.94)/0.01² = 7.849 × 0.1039/0.0001 ≈ 8,155 visitors per arm. Detecting a one-point lift on a 5% base takes a lot of traffic.

```python run Checking N7.3
import numpy as np
from scipy import stats
za, zb = stats.norm.ppf(0.975), stats.norm.ppf(0.8)
p1, p2 = 0.05, 0.06
n = int(np.ceil((za + zb) ** 2 * (p1 * (1 - p1) + p2 * (1 - p2)) / (p2 - p1) ** 2))
rng = np.random.default_rng(212)
c1, c2 = rng.binomial(n, p1, 50_000), rng.binomial(n, p2, 50_000)
pool = (c1 + c2) / (2 * n)
z = (c2 - c1) / n / np.sqrt(pool * (1 - pool) * 2 / n)
print(f'n per arm {n:,}; simulated power {np.mean(abs(z) > za):.3f}')
```

### N7.4 The peeking problem

```python run Solution N7.4
import numpy as np
from scipy import stats
rng = np.random.default_rng(213)
reps, step, max_n, p = 4000, 100, 5000, 0.05
looks = np.arange(step, max_n + 1, step)
a = rng.random((reps, max_n)) < p                          # both arms identical: A/A test
b = rng.random((reps, max_n)) < p
ca, cb = a.cumsum(1)[:, looks - 1], b.cumsum(1)[:, looks - 1]
pool = (ca + cb) / (2 * looks)
with np.errstate(divide='ignore', invalid='ignore'):
    z = (cb - ca) / looks / np.sqrt(pool * (1 - pool) * 2 / looks)
pv = 2 * stats.norm.sf(abs(np.nan_to_num(z)))
print(f'one test at the end: false-positive rate {np.mean(pv[:, -1] < 0.05):.3f}')
print(f'stop at the first of {len(looks)} looks with p < 0.05: '
      f'false-positive rate {np.mean((pv < 0.05).any(1)):.3f}')
```

Checking once at the planned sample size gives the promised 5%; stopping at the first significant look out of 50 multiplies the false-positive rate several times over. Fixes: decide n in advance and look once; or use a **sequential** design (alpha spending such as O'Brien–Fleming, or always-valid p-values) that is built for repeated looks.

### N7.5 Paired versus unpaired

```python run Solution N7.5
import numpy as np
from scipy import stats
rng = np.random.default_rng(214)
difficulty = rng.normal(1.0, 0.5, 40)                     # shared by both models
loss_a = difficulty + rng.normal(0, 0.05, 40)
loss_b = difficulty - 0.05 + rng.normal(0, 0.05, 40)
print(f'mean difference {np.mean(loss_a - loss_b):.4f}')
welch = stats.ttest_ind(loss_a, loss_b, equal_var=False)
print(f'unpaired Welch t-test p = {welch.pvalue:.4f}')
print(f'paired t-test p = {stats.ttest_rel(loss_a, loss_b).pvalue:.2e}')
```

The unpaired test compares two clouds whose spread (0.5) dwarfs the 0.05 difference, so it sees nothing. The paired test looks at the per-example differences, in which the shared difficulty cancels, leaving a consistent 0.05 against small noise. Whenever two models are evaluated on the **same** examples (or the same folds), use a paired comparison.

### N7.6 Reading a p-value

What is wrong:

- A p-value is P(data at least this extreme \| H<sub>0</sub>), not P(H<sub>0</sub> \| data). "97% chance the model is better" reverses the conditional (the base-rate trap of guide Section 7.2): it needs a prior.
- It says nothing about **how much** better; a tiny, useless improvement can have p = 0.03 with enough data.
- p = 0.03 is not evidence that the result will replicate with 97% probability; with modest power, replications often fail.
- If many variants or metrics were tested, 0.03 may simply be the lucky one (multiple testing).

Correct: "If the new model were really no better, a difference at least this large would occur in about 3% of experiments like this one; together with the effect size and its confidence interval, this is moderate evidence of an improvement."

## Part 8 solutions

### N8.1 Entropy, cross-entropy, KL

H(P) = 0.5 × 1 + 0.25 × 2 + 0.25 × 2 = 1.5 bits. H(P, Q) = −Σ P log<sub>2</sub>(1/3) = log<sub>2</sub> 3 ≈ 1.585 bits. KL(P ‖ Q) = 1.585 − 1.5 ≈ 0.085 bits: the cost of using a code designed for the uniform distribution on data that are not uniform.

```python run Checking N8.1
import numpy as np
P, Q = np.array([0.5, 0.25, 0.25]), np.full(3, 1 / 3)
H = -np.sum(P * np.log2(P)); CE = -np.sum(P * np.log2(Q)); KL = np.sum(P * np.log2(P / Q))
print(f'H {H:.4f}, cross-entropy {CE:.4f}, KL {KL:.4f}, H + KL {H + KL:.4f}')
```

### N8.2 Perplexity

Average cross-entropy = −(1/6)Σ ln p<sub>i</sub> = (0.693 + 1.386 + 2.303 + 0.916 + 2.996 + 1.204)/6 ≈ 1.583 nats; perplexity = e<sup>1.583</sup> ≈ 4.87. Equivalently, perplexity is 1 over the **geometric mean** of the probabilities. One bad prediction (0.05) costs as much as several good ones, because the log punishes small probabilities heavily.

```python run Checking N8.2
import numpy as np
p = np.array([0.5, 0.25, 0.1, 0.4, 0.05, 0.3])
ce = -np.mean(np.log(p))
print(f'cross-entropy {ce:.4f} nats, perplexity {np.exp(ce):.4f}, '
      f'1 / geometric mean {1 / np.prod(p) ** (1 / len(p)):.4f}')
```

### N8.3 Binary cross-entropy is minimised at the truth

The expected loss is g(q) = −p ln q − (1 − p) ln(1 − q). Then g′(q) = −p/q + (1 − p)/(1 − q) = 0 gives p(1 − q) = q(1 − p), so q = p; g″(q) = p/q² + (1 − p)/(1 − q)² > 0 confirms a minimum. And g(q) − g(p) = p ln(p/q) + (1 − p) ln((1 − p)/(1 − q)) = KL(Ber(p) ‖ Ber(q)) ≥ 0. So a model trained with cross-entropy is pushed towards **calibrated** probabilities: cross-entropy is a **proper scoring rule**.

```python run Checking N8.3
import numpy as np
p = 0.3
q = np.linspace(0.001, 0.999, 99_901)
g = -p * np.log(q) - (1 - p) * np.log(1 - q)
kl = p * np.log(p / q) + (1 - p) * np.log((1 - p) / (1 - q))
gp = -p * np.log(p) - (1 - p) * np.log(1 - p)
gap = np.max(abs(g - gp - kl))
print(f'minimiser {q[np.argmin(g)]:.4f}; max |g(q) - g(p) - KL| = {gap:.1e}')
```

### N8.4 Simple regression

The normal equations for y ≈ a + bx are Σ(y<sub>i</sub> − a − bx<sub>i</sub>) = 0 and Σx<sub>i</sub>(y<sub>i</sub> − a − bx<sub>i</sub>) = 0. The first gives a = ȳ − bx̄ (the line passes through the means). Substituting into the second and centring: Σ(x<sub>i</sub> − x̄)(y<sub>i</sub> − ȳ) = bΣ(x<sub>i</sub> − x̄)², so b = Cov(x, y)/Var(x) = r s<sub>y</sub>/s<sub>x</sub>. The fitted values ŷ − ȳ = b(x − x̄) have SS<sub>reg</sub> = b²Σ(x − x̄)² = r² SS<sub>tot</sub>, so R² = r².

```python run Checking N8.4
import numpy as np
rng = np.random.default_rng(215)
x = rng.normal(5, 2, 200); y = 3 - 0.8 * x + rng.normal(0, 1.5, 200)
b = np.cov(x, y)[0, 1] / np.var(x, ddof=1); a = y.mean() - b * x.mean()
b_ls, a_ls = np.polyfit(x, y, 1)
yhat = a + b * x
r2 = 1 - np.sum((y - yhat) ** 2) / np.sum((y - y.mean()) ** 2)
print(f'formula a {a:.4f}, b {b:.4f} | polyfit a {a_ls:.4f}, b {b_ls:.4f}')
print(f'R^2 {r2:.4f}, r^2 {np.corrcoef(x, y)[0, 1] ** 2:.4f}')
```

### N8.5 Ridge through the SVD

With **X** = **UΣV**<sup>T</sup> (thin SVD, full column rank): **X**<sup>T</sup>**X** + λ**I** = **V**(**Σ**² + λ**I**)**V**<sup>T</sup> and **X**<sup>T</sup>**y** = **VΣU**<sup>T</sup>**y**. So **ŵ** = **V**(**Σ**² + λ**I**)<sup>−1</sup>**ΣU**<sup>T</sup>**y** = **V** diag(σ<sub>i</sub>/(σ<sub>i</sub>² + λ)) **U**<sup>T</sup>**y**. Compared with least squares (factor 1/σ<sub>i</sub>), each direction is multiplied by σ<sub>i</sub>²/(σ<sub>i</sub>² + λ): small-σ directions are shrunk most. It also gives every λ almost for free after one SVD, which makes cross-validation cheap.

```python run Solution N8.5
import numpy as np
rng = np.random.default_rng(216)
n, deg = 30, 12
x = np.sort(rng.uniform(-1, 1, n)); y = np.sin(3 * x) + rng.normal(0, 0.2, n)
X = np.vander(x, deg + 1, increasing=True)
lam = 0.1
w_closed = np.linalg.solve(X.T @ X + lam * np.eye(deg + 1), X.T @ y)
U, s, Vt = np.linalg.svd(X, full_matrices=False)
w_svd = Vt.T @ (s / (s ** 2 + lam) * (U.T @ y))
print('closed form equals SVD form:', np.allclose(w_closed, w_svd))
folds = np.arange(n) % 5
rng.shuffle(folds)
xt = np.linspace(-1, 1, 400); Xt = np.vander(xt, deg + 1, increasing=True)
print('lambda     CV error   true error')
for lam in (1e-8, 1e-4, 1e-2, 1e-1, 1.0, 10.0):
    errs = []
    for k in range(5):
        tr, va = folds != k, folds == k
        A = X[tr]
        w = np.linalg.solve(A.T @ A + lam * np.eye(deg + 1), A.T @ y[tr])
        errs.append(np.mean((X[va] @ w - y[va]) ** 2))
    w_all = np.linalg.solve(X.T @ X + lam * np.eye(deg + 1), X.T @ y)
    true = np.mean((Xt @ w_all - np.sin(3 * xt)) ** 2) + 0.2 ** 2
    print(f'{lam:8.0e}  {np.mean(errs):9.4f}  {true:9.4f}')
```

Cross-validation error and the true error (which we can compute only because we know the generating function) agree on the shape: tiny λ overfits the degree-12 polynomial, very large λ underfits, and the best values lie in between. They do not pick exactly the same λ (with 30 points, cross-validation is itself noisy), but the true error at the λ that cross-validation picks is close to the best in the table.

### N8.6 R² never falls

Least squares minimises SS<sub>res</sub> over all coefficient vectors. With an extra feature, the old solution is still available (set the new coefficient to 0), so the new minimum can only be equal or lower, and R² = 1 − SS<sub>res</sub>/SS<sub>tot</sub> can only rise. **Adjusted R²** = 1 − (1 − R²)(n − 1)/(n − d − 1) charges for each parameter, and a held-out set measures what matters: error on new data.

```python run Solution N8.6
import numpy as np
rng = np.random.default_rng(217)
n = 60
x = rng.normal(size=(n, 2)); y = x @ np.array([1.0, -1.0]) + rng.normal(0, 1, n)
xt = rng.normal(size=(1000, 2)); yt = xt @ np.array([1.0, -1.0]) + rng.normal(0, 1, 1000)
def fit(X, y, Xt, yt):
    A = np.c_[np.ones(len(X)), X]; At = np.c_[np.ones(len(Xt)), Xt]
    w = np.linalg.lstsq(A, y, rcond=None)[0]
    r2 = 1 - np.sum((y - A @ w) ** 2) / np.sum((y - y.mean()) ** 2)
    d = X.shape[1]
    adj = 1 - (1 - r2) * (n - 1) / (n - d - 1)
    test = np.mean((yt - At @ w) ** 2)
    return r2, adj, test
noise, noise_t = rng.normal(size=(n, 20)), rng.normal(size=(1000, 20))
for extra in (0, 5, 10, 20):                               # nested: first k noise columns
    r2, adj, test = fit(np.c_[x, noise[:, :extra]], y, np.c_[xt, noise_t[:, :extra]], yt)
    print(f'{extra:2d} noise features: R^2 {r2:.3f}, adjusted {adj:.3f}, test MSE {test:.3f}')
```

Training R² climbs with every useless feature, while adjusted R² does not reward them and the test error gets worse: the extra features fit noise.
