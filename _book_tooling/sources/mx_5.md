# Chapter 11: Information Theory
%Entropy, cross-entropy and KL divergence: the language of classification losses and LLMs

## 11.1 Information and entropy

The **information** (surprise) of an outcome with probability p is −log p: certain events carry none, rare events carry a lot, and the surprises of independent events add because their probabilities multiply. **Entropy** is the expected surprise:

H(P) = −Σ<sub>x</sub> P(x) log P(x).

With log base 2 it is measured in **bits**: the average number of yes/no questions needed to identify the outcome with an optimal code. With natural logs (as in ML libraries) it is in **nats**. Entropy is 0 for a certain outcome and maximal, log K, for the uniform distribution over K outcomes (derived with a Lagrange multiplier in Section 6.7).

```python run Entropy in bits, and the optimal code length it promises
import numpy as np
def H(p):
    p = np.asarray(p, float); p = p[p > 0]
    return -np.sum(p * np.log2(p)) + 0.0               # + 0.0 turns -0.0 into 0.0
for name, p in [('fair coin', [0.5, 0.5]), ('biased coin 0.9', [0.9, 0.1]),
                ('certain', [1.0, 0.0]), ('fair die', [1 / 6] * 6),
                ('skewed 4 symbols', [0.5, 0.25, 0.125, 0.125])]:
    print(f'{name:17s} H = {H(p):.4f} bits')
p = np.array([0.5, 0.25, 0.125, 0.125])
lengths = np.array([1, 2, 3, 3])                      # code words 0, 10, 110, 111
print(f'prefix code 0/10/110/111: average length {p @ lengths:.4f} bits = entropy')
```

## 11.2 Cross-entropy

If the data come from P but you use a model Q, the expected surprise measured with Q is the **cross-entropy**

H(P, Q) = −Σ<sub>x</sub> P(x) log Q(x).

For a classifier, P is the one-hot true label and Q the predicted distribution, so H(P, Q) = −log Q(true class): exactly the **cross-entropy loss** of Chapter 5 and the **negative log-likelihood** of Chapter 9. Averaged over a dataset, minimising cross-entropy is maximum likelihood.

For language models, the average cross-entropy per token (in nats) is reported as **perplexity** = e<sup>H</sup>: the effective number of equally likely next tokens the model is choosing between. A perplexity of 20 means the model is as uncertain as a uniform choice among 20 tokens.

## 11.3 KL divergence

The **Kullback–Leibler divergence** is the extra surprise paid for using Q instead of P:

KL(P ‖ Q) = Σ P(x) log(P(x)/Q(x)) = H(P, Q) − H(P).

Because H(P) does not depend on the model, **minimising cross-entropy is minimising KL** from the data distribution to the model.

**Derivation: KL ≥ 0 (Gibbs' inequality).** ln t ≤ t − 1 for all t > 0. So −KL(P ‖ Q) = Σ P ln(Q/P) ≤ Σ P (Q/P − 1) = ΣQ − ΣP = 1 − 1 = 0, with equality only if Q = P everywhere.

**KL is not symmetric.** KL(P ‖ Q) heavily penalises Q ≈ 0 where P > 0, so minimising it makes Q **cover** all of P's modes ("mean-seeking"; used in maximum likelihood). KL(Q ‖ P) penalises Q > 0 where P ≈ 0, so minimising it makes Q pick **one** mode ("mode-seeking"; used in variational inference).

**Closed form for Gaussians.** For P = N(μ<sub>1</sub>, σ<sub>1</sub>²) and Q = N(μ<sub>2</sub>, σ<sub>2</sub>²):

KL(P ‖ Q) = ln(σ<sub>2</sub>/σ<sub>1</sub>) + (σ<sub>1</sub>² + (μ<sub>1</sub> − μ<sub>2</sub>)²)/(2σ<sub>2</sub>²) − 1/2.

**Derivation.** KL = E<sub>P</sub>[ln p − ln q]. The log densities are −ln σ − (x − μ)²/(2σ²) + const. Under P, E[(x − μ<sub>1</sub>)²] = σ<sub>1</sub>² and E[(x − μ<sub>2</sub>)²] = σ<sub>1</sub>² + (μ<sub>1</sub> − μ<sub>2</sub>)². Substituting gives the formula. With Q = N(0, 1) it becomes ½(σ² + μ² − 1) − ln σ, the **VAE regularisation term**.

```python run Cross-entropy = entropy + KL, KL >= 0 and asymmetric, Gaussian KL closed form
import numpy as np
rng = np.random.default_rng(35)
def H(p): return -np.sum(p * np.log(p))
def CE(p, q): return -np.sum(p * np.log(q))
def KL(p, q): return np.sum(p * np.log(p / q))
P = np.array([0.6, 0.3, 0.1]); Q = np.array([0.2, 0.5, 0.3])
print(f'H(P) {H(P):.4f}, H(P,Q) {CE(P, Q):.4f}, KL(P||Q) {KL(P, Q):.4f}, '
      f'H + KL {H(P) + KL(P, Q):.4f}')
print(f'KL(P||Q) {KL(P, Q):.4f} vs KL(Q||P) {KL(Q, P):.4f}: not symmetric')
kls = [KL(rng.dirichlet(np.ones(5)), rng.dirichlet(np.ones(5))) for _ in range(100_000)]
print(f'smallest KL over 100,000 random pairs: {min(kls):.2e}')
m1, s1, m2, s2 = 1.0, 0.5, -0.5, 2.0
closed = np.log(s2 / s1) + (s1 ** 2 + (m1 - m2) ** 2) / (2 * s2 ** 2) - 0.5
x = rng.normal(m1, s1, 2_000_000)
logp = -np.log(s1) - (x - m1) ** 2 / (2 * s1 ** 2)
logq = -np.log(s2) - (x - m2) ** 2 / (2 * s2 ** 2)
print(f'Gaussian KL: closed form {closed:.4f}, Monte Carlo {np.mean(logp - logq):.4f}')
```

```python run Mode-covering versus mode-seeking: fitting one Gaussian to two bumps
import numpy as np
from scipy import stats
from scipy.optimize import minimize
xs = np.linspace(-8, 8, 4001); dx = xs[1] - xs[0]
p = 0.5 * stats.norm.pdf(xs, -3, 0.7) + 0.5 * stats.norm.pdf(xs, 3, 0.7)
def kl(a, b):
    a, b = a + 1e-300, b + 1e-300
    return np.sum(a * np.log(a / b)) * dx
def fit(direction, start):
    def obj(t):
        q = stats.norm.pdf(xs, t[0], np.exp(t[1]))
        return kl(p, q) if direction == 'forward' else kl(q, p)
    r = minimize(obj, start, method='Nelder-Mead')
    return r.x[0], np.exp(r.x[1])
mu, sd = fit('forward', [0.5, 0.0])
print(f'minimise KL(P||Q): mu {np.round(mu, 3) + 0.0:.3f}, sd {sd:.3f}  (covers both bumps)')
mu, sd = fit('reverse', [1.0, 0.0])
print(f'minimise KL(Q||P): mu {mu:.3f}, sd {sd:.3f}  (locks onto one bump)')
```

The forward fit puts its mean between the bumps with a large spread (it must give probability to both), placing most of its mass where P has almost none; the reverse fit sits on one bump with that bump's width.

## 11.4 Mutual information

**Mutual information** measures how much knowing Y reduces uncertainty about X:

I(X; Y) = H(X) − H(X \| Y) = KL(P(X, Y) ‖ P(X)P(Y)).

It is zero exactly when X and Y are independent (the joint equals the product), and unlike correlation it detects non-linear dependence. Decision trees choose splits by **information gain**, which is the mutual information between the split and the label.

```python run Information gain of a split, and mutual information detecting a non-linear link
import numpy as np
def H(counts):
    p = np.asarray(counts, float) / np.sum(counts); p = p[p > 0]
    return -np.sum(p * np.log2(p))
parent = [9, 5]                                       # 9 yes, 5 no
left, right = [6, 1], [3, 4]                          # a candidate split
gain = H(parent) - (7 / 14) * H(left) - (7 / 14) * H(right)
print(f'H(parent) {H(parent):.4f}; information gain of the split {gain:.4f} bits')
rng = np.random.default_rng(36)
x = rng.uniform(-1, 1, 200_000)
y = x ** 2 + 0.05 * rng.normal(size=x.size)
def mi(a, b, bins=30):
    joint, _, _ = np.histogram2d(a, b, bins=bins)
    pxy = joint / joint.sum(); px = pxy.sum(1, keepdims=True); py = pxy.sum(0, keepdims=True)
    nz = pxy > 0
    return np.sum(pxy[nz] * np.log2(pxy[nz] / (px @ py)[nz]))
print(f'y = x^2 + noise: correlation {np.corrcoef(x, y)[0, 1]:.3f}, '
      f'mutual information {mi(x, y):.3f} bits')
print(f'independent pair: mutual information {mi(x, rng.uniform(-1, 1, x.size)):.3f} bits')
```

The quadratic relationship has essentially zero correlation but more than two bits of mutual information. The independent pair shows a small positive value only because a 30 × 30 histogram estimate is slightly biased upwards.

## 11.5 Practical lessons

- Entropy = expected surprise; maximal for uniform distributions.
- Cross-entropy loss = NLL = H(P) + KL(P ‖ model); perplexity = e<sup>cross-entropy</sup>.
- KL ≥ 0, zero only at equality, and asymmetric: forward covers modes, reverse seeks one mode.
- Gaussian KL to N(0, 1) = ½(σ² + μ² − 1) − ln σ: the VAE penalty.
- Mutual information detects any dependence; information gain drives decision trees.

# Chapter 12: Linear Regression from First Principles
%Everything in the book applied to one model: algebra, geometry, calculus, probability and statistics

## 12.1 The normal equations

Model **y** ≈ **Xw** with **X** of size n × d (a column of ones for the intercept). Minimise ‖**Xw** − **y**‖². From Section 4.4 the gradient is 2**X**<sup>T</sup>(**Xw** − **y**); setting it to zero gives the **normal equations**

**X**<sup>T</sup>**Xw** = **X**<sup>T</sup>**y**, so **ŵ** = (**X**<sup>T</sup>**X**)<sup>−1</sup>**X**<sup>T</sup>**y** when **X** has full column rank.

The Hessian 2**X**<sup>T</sup>**X** is PSD (Section 3.4), so the loss is convex and this is the global minimum. In practice, solve with QR or `lstsq` rather than forming the inverse, because κ(**X**<sup>T</sup>**X**) = κ(**X**)².

## 12.2 The geometric view: projection

The fitted values **ŷ** = **Xŵ** lie in the column space of **X**. The normal equations say **X**<sup>T</sup>(**y** − **ŷ**) = **0**: the **residual is orthogonal to every column**. So **ŷ** is the orthogonal projection of **y** onto the column space (Section 1.4 in many dimensions), with **hat matrix** **P** = **X**(**X**<sup>T</sup>**X**)<sup>−1</sup>**X**<sup>T</sup>. Projecting twice changes nothing (**P**² = **P**), and trace(**P**) = d, the number of parameters.

Two consequences: with an intercept, the residuals sum to zero (orthogonal to the column of ones), and **Pythagoras** gives ‖**y** − ȳ‖² = ‖**ŷ** − ȳ‖² + ‖**y** − **ŷ**‖², that is, total sum of squares = explained + residual. Hence

**R²** = 1 − SS<sub>res</sub>/SS<sub>tot</sub> = the fraction of variance explained.

```python run Normal equations, lstsq, gradient descent and the projection facts agree
import numpy as np
rng = np.random.default_rng(37)
n = 200
X = np.c_[np.ones(n), rng.normal(size=(n, 2))]
w_true = np.array([1.0, 2.0, -3.0])
y = X @ w_true + rng.normal(0, 1.5, n)
w_ne = np.linalg.solve(X.T @ X, X.T @ y)
w_ls = np.linalg.lstsq(X, y, rcond=None)[0]
w = np.zeros(3)
for _ in range(5000):
    w -= 0.1 * 2 * X.T @ (X @ w - y) / n
print('normal equations', np.round(w_ne, 4), '| lstsq', np.round(w_ls, 4))
print('gradient descent', np.round(w, 4))
yhat = X @ w_ne; r = y - yhat
print('X^T residual:', np.round(X.T @ r, 10) + 0.0, '| residual sum:', f'{r.sum():.1e}')
P = X @ np.linalg.solve(X.T @ X, X.T)
print(f'P^2 = P: {np.allclose(P @ P, P)}, trace(P) = {np.trace(P):.4f}')
sst, ssr, sse = np.sum((y - y.mean()) ** 2), np.sum((yhat - y.mean()) ** 2), np.sum(r ** 2)
print(f'SST {sst:.2f} = SSR {ssr:.2f} + SSE {sse:.2f} -> {ssr + sse:.2f}')
print(f'R^2 = {1 - sse / sst:.4f}')
```

## 12.3 The statistical view

Assume y = **x**<sup>T</sup>**w** + ε with independent ε ~ N(0, σ²). Then:

- Least squares is the **MLE** (Section 9.2).
- **ŵ** is **unbiased**: ŵ = (**X**<sup>T</sup>**X**)<sup>−1</sup>**X**<sup>T</sup>(**Xw** + **ε**) = **w** + (**X**<sup>T</sup>**X**)<sup>−1</sup>**X**<sup>T</sup>**ε**, whose expectation is **w**.
- Its covariance is σ²(**X**<sup>T</sup>**X**)<sup>−1</sup>, by the **AΣA**<sup>T</sup> rule (Section 7.6) with **A** = (**X**<sup>T</sup>**X**)<sup>−1</sup>**X**<sup>T</sup> and **Σ** = σ²**I**.
- σ² is estimated without bias by SSE/(n − d): d degrees of freedom are used by the fit, as with n − 1 in Section 9.3.

Standard errors are the square roots of the diagonal of σ̂²(**X**<sup>T</sup>**X**)<sup>−1</sup>, and t = ŵ<sub>j</sub>/SE<sub>j</sub> tests whether a coefficient is zero. Collinear features make **X**<sup>T</sup>**X** nearly singular, so the variances blow up (Section 2.5).

```python run Simulating the sampling distribution of w-hat to check sigma^2 (X^T X)^-1
import numpy as np
rng = np.random.default_rng(38)
n, sigma = 50, 2.0
X = np.c_[np.ones(n), rng.normal(size=(n, 2))]
w_true = np.array([1.0, 2.0, -3.0])
est, s2 = [], []
for _ in range(20_000):
    y = X @ w_true + rng.normal(0, sigma, n)
    w = np.linalg.lstsq(X, y, rcond=None)[0]
    est.append(w); s2.append(np.sum((y - X @ w) ** 2) / (n - 3))
est = np.array(est)
print('mean of w-hat:', np.round(est.mean(0), 4), '(true', w_true, ')')
print('simulated SDs:', np.round(est.std(0), 4))
print('formula SDs:  ', np.round(np.sqrt(np.diag(sigma ** 2 * np.linalg.inv(X.T @ X))), 4))
print(f'mean of SSE/(n-d): {np.mean(s2):.4f} (sigma^2 = {sigma ** 2})')
```

## 12.4 Ridge regression

Add an L2 penalty: minimise ‖**Xw** − **y**‖² + λ‖**w**‖². The gradient 2**X**<sup>T</sup>(**Xw** − **y**) + 2λ**w** = **0** gives

**ŵ**<sub>ridge</sub> = (**X**<sup>T</sup>**X** + λ**I**)<sup>−1</sup>**X**<sup>T</sup>**y**.

Adding λ to every eigenvalue makes the matrix invertible and well conditioned even with collinear features. In the SVD basis each component of the least-squares solution is multiplied by σ<sub>i</sub>²/(σ<sub>i</sub>² + λ): directions with small singular values (the unstable ones) are shrunk most. From Section 9.5, ridge is MAP with a Gaussian prior. (In practice the intercept is usually not penalised; the demo below has no intercept.)

```python run Ridge rescues nearly collinear features
import numpy as np
rng = np.random.default_rng(39)
n = 100
x1 = rng.normal(size=n)
x2 = x1 + 0.01 * rng.normal(size=n)                   # almost a copy of x1
X = np.c_[x1, x2]
w_true = np.array([1.0, 1.0])
print(f'condition number of X^T X: {np.linalg.cond(X.T @ X):.2e}')
for lam in (0.0, 0.1, 1.0):
    ws = []
    for _ in range(2000):
        y = X @ w_true + rng.normal(0, 0.5, n)
        ws.append(np.linalg.solve(X.T @ X + lam * np.eye(2), X.T @ y))
    ws = np.array(ws)
    print(f'lambda {lam:3.1f}: mean w {np.round(ws.mean(0), 3)}, '
          f'sd of w {np.round(ws.std(0), 3)}, sd of w1 + w2 {np.std(ws.sum(1)):.3f}')
```

Without regularisation the individual weights swing wildly (only their sum is well determined); a small λ makes them stable at the cost of a slight bias.

## 12.5 The bias–variance decomposition

For a prediction f̂(x) trained on a random dataset, and y = f(x) + ε with noise variance σ², the expected squared error at x is

E[(y − f̂(x))²] = (f(x) − E[f̂(x)])² + Var(f̂(x)) + σ² = **Bias² + Variance + Noise**.

**Derivation.** Write y − f̂ = (y − f) + (f − E f̂) + (E f̂ − f̂). The new noise ε = y − f is independent of the training data and has mean zero, and E f̂ − f̂ has mean zero, so all cross terms vanish in expectation; the three squares remain. Simple models have high bias; flexible models have high variance; the noise term is the floor no model can beat.

```python run Bias and variance of polynomial fits of increasing degree, measured by simulation
import numpy as np
rng = np.random.default_rng(40)
f = lambda x: np.sin(2 * np.pi * x)
sigma, n = 0.3, 40
x_test = np.linspace(0.05, 0.95, 50)
print('degree   bias^2   variance   noise   sum      measured test MSE')
for deg in (1, 3, 9):
    preds = []
    for _ in range(3000):
        x = rng.uniform(0, 1, n); y = f(x) + rng.normal(0, sigma, n)
        preds.append(np.polyval(np.polyfit(x, y, deg), x_test))
    preds = np.array(preds)
    bias2 = np.mean((preds.mean(0) - f(x_test)) ** 2)
    var = np.mean(preds.var(0))
    y_new = f(x_test) + rng.normal(0, sigma, preds.shape)
    mse = np.mean((y_new - preds) ** 2)
    total = bias2 + var + sigma ** 2
    print(f'{deg:4d}   {bias2:8.4f} {var:9.4f} {sigma ** 2:7.4f}  {total:7.4f}   {mse:7.4f}')
```

The straight line has large bias; degree 9 has almost no bias but a large variance (its curve swings with each training sample); degree 3 balances the two and has the lowest error. In every row bias² + variance + noise matches the directly measured test error, confirming the decomposition.

## 12.6 Practical lessons

- **ŵ** solves **X**<sup>T</sup>**Xw** = **X**<sup>T</sup>**y**; fitted values are the projection of **y** onto the column space; R² follows from Pythagoras.
- Under Gaussian noise OLS is the MLE, unbiased, with covariance σ²(**X**<sup>T</sup>**X**)<sup>−1</sup>.
- Ridge adds λ**I**, stabilises collinear problems and equals a Gaussian prior.
- Test error = bias² + variance + noise; choose model complexity (or λ) by validation.

# Chapter 13: Formula Sheet
%One page per part, for the night before the interview

## Linear algebra

| Result | Formula |
|---|---|
| Cosine similarity | cos θ = **x** · **y** / (‖**x**‖ ‖**y**‖) |
| Projection of **y** on **x** | ((**x** · **y**)/(**x** · **x**)) **x** |
| Transpose of a product | (**AB**)<sup>T</sup> = **B**<sup>T</sup>**A**<sup>T</sup> |
| 2 × 2 inverse | (1/(ad − bc)) [[d, −b], [−c, a]] |
| Eigenvalues | Σλ = trace, Πλ = det; symmetric ⇒ **A** = **QΛQ**<sup>T</sup> |
| SVD | **A** = **UΣV**<sup>T</sup>; σ<sub>i</sub>² = eigenvalues of **A**<sup>T</sup>**A**; κ = σ<sub>max</sub>/σ<sub>min</sub> |
| PCA | Eigenvectors of the covariance; explained variance λ<sub>i</sub>/Σλ |
| Best rank-k approximation | Truncated SVD; Frobenius error √(Σ<sub>i>k</sub>σ<sub>i</sub>²) |

## Calculus and optimisation

| Result | Formula |
|---|---|
| Central difference | (f(x + h) − f(x − h))/(2h), error O(h²) |
| Sigmoid derivative | σ(1 − σ), at most 1/4 |
| Quadratic form | ∇(**x**<sup>T</sup>**Ax**) = (**A** + **A**<sup>T</sup>)**x** |
| Least squares | ∇‖**Ax** − **b**‖² = 2**A**<sup>T</sup>(**Ax** − **b**) |
| Softmax Jacobian | diag(**p**) − **pp**<sup>T</sup> |
| Cross-entropy gradient | ∂L/∂**z** = **p** − **y** |
| Back-propagation | ∂L/∂**W** = δ · input<sup>T</sup>; δ<sub>input</sub> = **W**<sup>T</sup>δ ⊙ f′ |
| He initialisation | Var(w) = 2/n<sub>in</sub> |
| Gradient descent stability | η < 2/λ<sub>max</sub>; rate (κ − 1)/(κ + 1) |
| Adam | m̂ = m/(1 − β<sub>1</sub><sup>t</sup>), ŝ = s/(1 − β<sub>2</sub><sup>t</sup>), step η m̂/(√ŝ + ε) |
| Newton | **w** ← **w** − **H**<sup>−1</sup>∇f |
| Lagrange | ∇f = λ∇g; KKT: λ ≥ 0, λg = 0 |

## Probability

| Result | Formula |
|---|---|
| Bayes | P(B \| A) = P(A \| B)P(B)/P(A) |
| Variance | Var(X) = E[X²] − (E[X])²; Var(aX + b) = a²Var(X) |
| Sum | Var(X + Y) = Var X + Var Y + 2 Cov(X, Y) |
| Bernoulli, Binomial | p, p(1 − p); np, np(1 − p) |
| Poisson, Geometric | λ, λ; 1/p, (1 − p)/p² |
| Uniform(a, b), Exponential(λ) | (a + b)/2, (b − a)²/12; 1/λ, 1/λ² |
| Linear map of a Gaussian | **AX** + **b** ~ N(**Aμ** + **b**, **AΣA**<sup>T</sup>) |
| Standard error | σ/√n; accuracy SE √(p(1 − p)/n) |

## Statistics

| Result | Formula |
|---|---|
| Bias–variance of an estimator | MSE = Bias² + Var |
| MLEs | Bernoulli k/n; normal x̄ and (1/n)Σ(x − x̄)²; Poisson x̄; exponential 1/x̄ |
| Unbiased variance | s² = (1/(n − 1))Σ(x − x̄)² |
| Fisher information (Bernoulli) | 1/(p(1 − p)) |
| MAP with Beta(α, β) prior | (k + α − 1)/(n + α + β − 2); α = β = 2 gives add-one smoothing |
| Beta–Binomial posterior | Beta(α + k, β + n − k) |
| Confidence interval | x̄ ± t<sub>0.975, n−1</sub> s/√n |
| Two-proportion z | (p̂<sub>1</sub> − p̂<sub>2</sub>)/√(p̂(1 − p̂)(1/n<sub>1</sub> + 1/n<sub>2</sub>)) |
| Sample size per group | n ≈ 2(z<sub>1−α/2</sub> + z<sub>1−β</sub>)²σ²/δ² ≈ 15.7σ²/δ² for 5%/80% |
| Multiple testing | Bonferroni α/m; BH: largest k with p<sub>(k)</sub> ≤ kα/m |

## Information theory and regression

| Result | Formula |
|---|---|
| Entropy | H(P) = −ΣP log P; maximum log K |
| Cross-entropy | H(P, Q) = H(P) + KL(P ‖ Q); perplexity e<sup>H</sup> |
| Gaussian KL to N(0, 1) | ½(σ² + μ² − 1) − ln σ |
| OLS | **ŵ** = (**X**<sup>T</sup>**X**)<sup>−1</sup>**X**<sup>T</sup>**y**; Cov(**ŵ**) = σ²(**X**<sup>T</sup>**X**)<sup>−1</sup> |
| Ridge | (**X**<sup>T</sup>**X** + λ**I**)<sup>−1</sup>**X**<sup>T</sup>**y** |
| R² | 1 − SS<sub>res</sub>/SS<sub>tot</sub> |
| Test error | Bias² + Variance + Noise |

> TIP: Before an interview, take five rows at random from these tables and derive each one on paper in under two minutes. If you can derive it, you can explain it, and interviewers care far more about the explanation than the formula.
