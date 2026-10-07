# Chapter 3: Eigenvalues, SVD and PCA
%The directions a matrix does not rotate, and how they compress data

## 3.1 Eigenvalues and eigenvectors

An **eigenvector** of a square matrix **A** is a non-zero vector that **A** only stretches: **Av** = λ**v**. The stretch factor λ is the **eigenvalue**. Most vectors change direction when multiplied by **A**; eigenvectors are the special directions that do not.

**Derivation of the characteristic equation.** **Av** = λ**v** means (**A** − λ**I**)**v** = **0** with **v** ≠ **0**. A non-zero vector is sent to zero only if the matrix is singular, so det(**A** − λ**I**) = 0. For a 2 × 2 matrix [[a, b], [c, d]] this is

λ² − (a + d)λ + (ad − bc) = 0, that is, λ² − trace · λ + det = 0.

So the eigenvalues sum to the **trace** and multiply to the **determinant**; both facts hold for any n × n matrix.

```python run Eigenvalues from the characteristic equation, checked three ways
import numpy as np
A = np.array([[4.0, 1.0], [2.0, 3.0]])
tr, det = np.trace(A), np.linalg.det(A)
disc = np.sqrt(tr ** 2 - 4 * det)
by_hand = sorted([(tr - disc) / 2, (tr + disc) / 2])
vals, vecs = np.linalg.eig(A)
vals = np.real_if_close(vals)                         # drop zero imaginary parts
print('by hand:', np.round(by_hand, 6), '| numpy:', np.round(sorted(vals), 6))
print(f'sum = {vals.sum():.6f} (trace {tr}), product = {vals.prod():.6f} (det {det:.6f})')
for lam, v in zip(vals, vecs.T):
    print(f'lambda {lam:.1f}: |Av - lambda v| = {np.linalg.norm(A @ v - lam * v):.1e}')
```

## 3.2 Power iteration: why the largest eigenvalue dominates

Write any starting vector as a combination of eigenvectors: **x** = c<sub>1</sub>**v**<sub>1</sub> + c<sub>2</sub>**v**<sub>2</sub>. Then **A**<sup>k</sup>**x** = c<sub>1</sub>λ<sub>1</sub><sup>k</sup>**v**<sub>1</sub> + c<sub>2</sub>λ<sub>2</sub><sup>k</sup>**v**<sub>2</sub>. If \|λ<sub>1</sub>\| > \|λ<sub>2</sub>\|, the first term wins by a factor (λ<sub>1</sub>/λ<sub>2</sub>)<sup>k</sup>, so repeatedly multiplying and normalising converges to the top eigenvector, with error shrinking like \|λ<sub>2</sub>/λ<sub>1</sub>\|<sup>k</sup>. This is how PageRank was computed, and it explains why deep linear networks explode or vanish: repeated multiplication is dominated by the largest eigenvalue.

```python run Power iteration converges at rate |lambda2 / lambda1|
import numpy as np
A = np.array([[4.0, 1.0], [2.0, 3.0]])
true = np.array([1.0, 1.0]) / np.sqrt(2)               # eigenvector for lambda = 5
x = np.array([1.0, 0.0])
for k in range(1, 13):
    x = A @ x
    x = x / np.linalg.norm(x)
    if k % 3 == 0:
        err = np.linalg.norm(x - true)
        print(f'step {k:2d}: x = {np.round(x, 6)}, error {err:.2e}, '
              f'Rayleigh quotient {x @ A @ x:.6f}')
print('predicted error ratio per step: |2/5| =', 2 / 5)
```

Each three steps the error shrinks by about (2/5)³ = 0.064, exactly as the derivation predicts, and the Rayleigh quotient **x**<sup>T</sup>**Ax** (for a unit **x**) homes in on λ<sub>1</sub> = 5.

## 3.3 Symmetric matrices and the spectral theorem

For a **symmetric** matrix the eigenvalues are real and eigenvectors for different eigenvalues are orthogonal.

**Derivation (orthogonality).** Let **Av** = λ**v** and **Aw** = μ**w** with λ ≠ μ. Then λ(**w** · **v**) = **w**<sup>T</sup>**Av** = (**A**<sup>T</sup>**w**)<sup>T</sup>**v** = (**Aw**)<sup>T</sup>**v** = μ(**w** · **v**), using **A** = **A**<sup>T</sup>. So (λ − μ)(**w** · **v**) = 0, which forces **w** · **v** = 0.

Hence every symmetric matrix factorises as **A** = **QΛQ**<sup>T</sup>, with **Q** orthogonal (columns are the eigenvectors) and **Λ** diagonal. Read right to left: rotate into the eigenvector basis, scale each axis, rotate back. Covariance matrices and Hessians are symmetric, which is why this theorem underlies PCA and second-order optimisation.

```python run Spectral decomposition of a random symmetric matrix
import numpy as np
rng = np.random.default_rng(4)
B = rng.normal(size=(5, 5))
S = (B + B.T) / 2                                     # symmetric
lam, Q = np.linalg.eigh(S)
print('eigenvalues:', np.round(lam, 4))
print('Q^T Q = I:', np.allclose(Q.T @ Q, np.eye(5)))
print('Q diag(lam) Q^T reconstructs S:', np.allclose(Q @ np.diag(lam) @ Q.T, S))
imag = np.max(abs(np.linalg.eigvals(S).imag))
print(f'largest imaginary part from the general eig routine: {imag:.1e}')
```

## 3.4 Positive definite matrices

A symmetric **A** is **positive definite** if **x**<sup>T</sup>**Ax** > 0 for every **x** ≠ **0**, and **positive semi-definite** if ≥ 0.

**Derivation (equivalence with eigenvalues).** Write **x** = **Qy**. Then **x**<sup>T</sup>**Ax** = **y**<sup>T</sup>**Λy** = Σ λ<sub>i</sub>y<sub>i</sub>², which is positive for all **y** ≠ **0** exactly when every λ<sub>i</sub> > 0.

**Every covariance matrix is positive semi-definite.** For any vector **a**, **a**<sup>T</sup>**Σa** = Var(**a**<sup>T</sup>**X**) ≥ 0, because a variance cannot be negative. Likewise **X**<sup>T</sup>**X** is always PSD: **a**<sup>T</sup>**X**<sup>T</sup>**Xa** = ‖**Xa**‖² ≥ 0. At a minimum of a smooth function the Hessian is PSD; a positive definite Hessian guarantees a strict local minimum (Chapter 4).

```python run Covariance and Gram matrices are positive semi-definite
import numpy as np
rng = np.random.default_rng(5)
X = rng.normal(size=(200, 4)) @ rng.normal(size=(4, 4))
C = np.cov(X, rowvar=False)
print('eigenvalues of the covariance:', np.round(np.linalg.eigvalsh(C), 4))
a = rng.normal(size=(10_000, 4))
quad = np.einsum('ij,jk,ik->i', a, C, a)              # a^T C a for 10,000 random a
print(f'smallest a^T C a over 10,000 random a: {quad.min():.4f}')
print('a^T C a equals the variance of X @ a:',
      np.isclose(a[0] @ C @ a[0], np.var(X @ a[0], ddof=1)))
Xr = X[:, :2] @ np.array([[1.0, 2.0, 3.0, 4.0], [0.0, 1.0, 0.0, 1.0]])  # rank 2
print('rank-2 data, eigenvalues of X^T X:', np.round(np.linalg.eigvalsh(Xr.T @ Xr), 6))
```

The rank-2 data gives two eigenvalues that are zero up to rounding: semi-definite, not definite. A zero eigenvalue means a direction with no variance, which is exactly the collinearity that makes **X**<sup>T</sup>**X** non-invertible in regression.

## 3.5 The singular value decomposition

Every m × n matrix, square or not, factorises as **A** = **UΣV**<sup>T</sup>, with **U** (m × m) and **V** (n × n) orthogonal and **Σ** diagonal with non-negative **singular values** σ<sub>1</sub> ≥ σ<sub>2</sub> ≥ … ≥ 0. Geometrically: rotate (**V**<sup>T</sup>), stretch along the axes (**Σ**), rotate again (**U**).

**Derivation of the link to eigenvalues.** **A**<sup>T</sup>**A** = **VΣ**<sup>T</sup>**U**<sup>T</sup>**UΣV**<sup>T</sup> = **V**(**Σ**<sup>T</sup>**Σ**)**V**<sup>T</sup>. That is a spectral decomposition, so the columns of **V** are eigenvectors of **A**<sup>T</sup>**A** and σ<sub>i</sub>² are its eigenvalues. Similarly **U** holds the eigenvectors of **AA**<sup>T</sup>. The rank is the number of non-zero singular values, ‖**A**‖<sub>2</sub> = σ<sub>1</sub>, and the condition number is σ<sub>1</sub>/σ<sub>n</sub>.

```python run SVD versus the eigen-decomposition of A^T A
import numpy as np
rng = np.random.default_rng(6)
A = rng.normal(size=(6, 3))
U, s, Vt = np.linalg.svd(A, full_matrices=False)
print('singular values:', np.round(s, 6))
root_eig = np.sqrt(np.linalg.eigvalsh(A.T @ A))[::-1]
print('sqrt of eigenvalues of A^T A:', np.round(root_eig, 6))
print('U S V^T reconstructs A:', np.allclose(U @ np.diag(s) @ Vt, A))
print(f'2-norm {np.linalg.norm(A, 2):.6f} = sigma1; cond {np.linalg.cond(A):.6f} = '
      f'{s[0] / s[-1]:.6f}')
```

## 3.6 Low-rank approximation (Eckart–Young)

Keeping only the k largest singular values gives **A**<sub>k</sub> = Σ<sub>i≤k</sub> σ<sub>i</sub>**u**<sub>i</sub>**v**<sub>i</sub><sup>T</sup>. The **Eckart–Young theorem** says no rank-k matrix is closer to **A**: the error in the Frobenius norm is √(σ<sub>k+1</sub>² + … + σ<sub>r</sub>²) and in the 2-norm it is σ<sub>k+1</sub>. This is the mathematics of image compression, latent semantic analysis, recommender-system matrix factorisation and LoRA fine-tuning (which assumes weight updates are low rank).

```python run Truncated SVD error matches the theorem and beats random rank-k matrices
import numpy as np
rng = np.random.default_rng(7)
A = rng.normal(size=(40, 6)) @ rng.normal(size=(6, 30)) + 0.1 * rng.normal(size=(40, 30))
U, s, Vt = np.linalg.svd(A, full_matrices=False)
for k in (1, 3, 6, 10):
    Ak = U[:, :k] @ np.diag(s[:k]) @ Vt[:k]
    err = np.linalg.norm(A - Ak)
    theory = np.sqrt(np.sum(s[k:] ** 2))
    print(f'k = {k:2d}: Frobenius error {err:8.4f}, theorem {theory:8.4f}')
best = np.linalg.norm(A - U[:, :3] @ np.diag(s[:3]) @ Vt[:3])
trials = []
for _ in range(2000):                                 # random rank-3 competitors
    P = rng.normal(size=(40, 3))
    coef = np.linalg.lstsq(P, A, rcond=None)[0]       # best fit within span(P)
    trials.append(np.linalg.norm(A - P @ coef))
print(f'best of 2,000 random rank-3 fits: {min(trials):.4f} (SVD: {best:.4f})')
```

The data were built as rank 6 plus small noise, and the error collapses at k = 6: the singular values reveal the true dimension. No random rank-3 competitor, even with optimally fitted coefficients, beats the truncated SVD.

## 3.7 Principal component analysis

PCA finds the direction **w** (unit length) along which centred data **X** (n × d) varies most.

**Derivation.** The projections are **Xw**, with variance (1/(n − 1))‖**Xw**‖² = **w**<sup>T</sup>**Cw**, where **C** = **X**<sup>T</sup>**X**/(n − 1) is the covariance matrix. Maximise **w**<sup>T</sup>**Cw** subject to **w**<sup>T</sup>**w** = 1 with a Lagrange multiplier (Chapter 6): L = **w**<sup>T</sup>**Cw** − λ(**w**<sup>T</sup>**w** − 1). Setting ∇L = 2**Cw** − 2λ**w** = **0** gives **Cw** = λ**w**: the optimum is an eigenvector. Its variance is **w**<sup>T</sup>**Cw** = λ, so pick the eigenvector with the **largest** eigenvalue. The second component maximises variance orthogonal to the first, giving the second eigenvector, and so on.

Because **C** = **V**(**Σ**²/(n − 1))**V**<sup>T</sup> from the SVD of **X**, the principal directions are the right singular vectors and the variances are σ<sub>i</sub>²/(n − 1). Libraries compute PCA with the SVD, which is more accurate than forming **C**.

**Explained variance ratio** of component i = λ<sub>i</sub> / Σλ<sub>j</sub>. The total Σλ<sub>j</sub> = trace(**C**), the sum of the feature variances, so PCA redistributes variance rather than creating it.

```python run PCA three ways: eigenvectors, SVD and brute-force search
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
rng = np.random.default_rng(8)
n = 500
X = rng.multivariate_normal([0, 0], [[3.0, 1.8], [1.8, 1.5]], size=n)
Xc = X - X.mean(0)
C = Xc.T @ Xc / (n - 1)
lam, W = np.linalg.eigh(C)
w_eig = W[:, -1]
_, s, Vt = np.linalg.svd(Xc, full_matrices=False)
angles = np.linspace(0, np.pi, 18_001)
dirs = np.stack([np.cos(angles), np.sin(angles)], axis=1)
var = np.var(Xc @ dirs.T, axis=0, ddof=1)
w_brute = dirs[np.argmax(var)]
print('top eigenvector:', np.round(w_eig * np.sign(w_eig[0]), 4))
print('top right singular vector:', np.round(Vt[0] * np.sign(Vt[0, 0]), 4))
print('brute-force best direction:', np.round(w_brute * np.sign(w_brute[0]), 4))
print(f'variance along it {var.max():.4f}, largest eigenvalue {lam[-1]:.4f}, '
      f'sigma1^2/(n-1) {s[0] ** 2 / (n - 1):.4f}')
print('explained variance ratio:', np.round(lam[::-1] / lam.sum(), 4),
      f'| total {lam.sum():.4f} = trace {np.trace(C):.4f}')
fig, ax = plt.subplots(figsize=(5, 4))
ax.scatter(Xc[:, 0], Xc[:, 1], s=6, alpha=0.4)
for l, w in zip(lam, W.T):
    ax.annotate('', xy=2 * np.sqrt(l) * w, xytext=(0, 0),
                arrowprops=dict(arrowstyle='->', lw=2, color='crimson'))
ax.set_aspect('equal'); ax.set_title('Principal components (arrows: 2 standard deviations)')
plt.tight_layout(); plt.savefig('mx_pca.png', dpi=130)
```

![The principal components of correlated 2-D data](figs/mx_pca.png)

Three independent methods agree on the direction, and the variance along it equals the largest eigenvalue, as the derivation promised.

> TRAP: Always **centre** the data before PCA, and **standardise** features measured in different units. Otherwise the first component simply points at the feature with the largest numbers (salary in rupees beats age in years) or at the mean.

## 3.8 Practical lessons

- Eigenvalues: sum = trace, product = determinant. Repeated multiplication is dominated by the largest one.
- Symmetric matrices have real eigenvalues and orthogonal eigenvectors: **A** = **QΛQ**<sup>T</sup>.
- PSD ⇔ all eigenvalues ≥ 0; covariance and Gram matrices are always PSD.
- SVD works for every matrix; σ<sub>i</sub>² are the eigenvalues of **A**<sup>T</sup>**A**; truncated SVD is the best low-rank approximation.
- PCA = eigenvectors of the covariance = right singular vectors of the centred data.

# Chapter 4: Calculus for Machine Learning
%Derivatives, gradients, Jacobians and Hessians, and how to check them

## 4.1 The derivative and the finite-difference check

The derivative f′(x) = lim<sub>h→0</sub> (f(x + h) − f(x))/h is the slope of the best linear approximation: f(x + h) ≈ f(x) + f′(x)h. Every gradient you derive in ML should be checked against a **finite difference**. The **central difference** (f(x + h) − f(x − h))/(2h) is far more accurate than the forward one.

**Derivation of the error orders.** Taylor's theorem gives f(x ± h) = f(x) ± hf′ + (h²/2)f″ ± (h³/6)f‴ + …. The forward difference therefore equals f′ + (h/2)f″ + …: error of order h. Subtracting the two expansions cancels the even terms: (f(x + h) − f(x − h))/(2h) = f′ + (h²/6)f‴ + …: error of order h². Below some h, rounding error (about 10<sup>−16</sup>/h) takes over, so h cannot be made arbitrarily small.

```python run Forward versus central differences, and where rounding error wins
import numpy as np
f, df = np.sin, np.cos
x = 1.0
print('     h      forward error   central error')
for h in (1e-1, 1e-2, 1e-3, 1e-5, 1e-8, 1e-11):
    fwd = (f(x + h) - f(x)) / h
    cen = (f(x + h) - f(x - h)) / (2 * h)
    print(f'{h:8.0e}  {abs(fwd - df(x)):14.3e}  {abs(cen - df(x)):14.3e}')
```

From h = 0.1 to 0.01 the forward error falls tenfold (order h) and the central error a hundredfold (order h²). At h = 10<sup>−11</sup> both are worse than at 10<sup>−5</sup>: rounding error has taken over. A step around 10<sup>−5</sup> to 10<sup>−6</sup> with central differences is the standard gradient-check setting.

## 4.2 Rules you will use constantly

| Rule | Formula | ML use |
|---|---|---|
| Chain rule | (f(g(x)))′ = f′(g(x)) g′(x) | Back-propagation is the chain rule applied systematically |
| Product rule | (fg)′ = f′g + fg′ | Gating (LSTM, GLU) |
| Exponential, log | (e<sup>x</sup>)′ = e<sup>x</sup>; (ln x)′ = 1/x | Softmax, log-likelihoods |
| Sigmoid | σ(x) = 1/(1 + e<sup>−x</sup>), σ′ = σ(1 − σ) | Logistic regression, gates |
| tanh | tanh′ = 1 − tanh² | RNNs |
| ReLU | max(0, x)′ = 1 if x > 0 else 0 | Most deep networks |
| Softplus | ln(1 + e<sup>x</sup>)′ = σ(x) | Smooth ReLU; appears in the logistic loss |

**Derivation of σ′ = σ(1 − σ).** σ = (1 + e<sup>−x</sup>)<sup>−1</sup>, so σ′ = e<sup>−x</sup>(1 + e<sup>−x</sup>)<sup>−2</sup> = [1/(1 + e<sup>−x</sup>)] · [e<sup>−x</sup>/(1 + e<sup>−x</sup>)] = σ(1 − σ), because e<sup>−x</sup>/(1 + e<sup>−x</sup>) = 1 − σ. Its maximum is 1/4 at x = 0, which is one reason deep sigmoid networks suffer vanishing gradients: each layer multiplies the gradient by at most 0.25.

```python run Checking the activation derivatives by central differences
import numpy as np
sig = lambda x: 1 / (1 + np.exp(-x))
cases = {
    'sigmoid':  (sig, lambda x: sig(x) * (1 - sig(x))),
    'tanh':     (np.tanh, lambda x: 1 - np.tanh(x) ** 2),
    'softplus': (lambda x: np.log1p(np.exp(x)), sig),
    'x ln x':   (lambda x: x * np.log(x), lambda x: np.log(x) + 1),
}
x = np.linspace(0.1, 3, 30)
h = 1e-6
for name, (f, df) in cases.items():
    num = (f(x + h) - f(x - h)) / (2 * h)
    print(f'{name:9s} max |analytic - numeric| = {np.max(abs(num - df(x))):.1e}')
xs = np.linspace(-10, 10, 200_001)
print(f'max of sigmoid derivative: {np.max(sig(xs) * (1 - sig(xs))):.6f}')
```

## 4.3 Partial derivatives and the gradient

For f(**x**) with **x** ∈ ℝ<sup>n</sup>, the **gradient** ∇f is the vector of partial derivatives ∂f/∂x<sub>i</sub>. The first-order approximation is f(**x** + **h**) ≈ f(**x**) + ∇f · **h**.

**Derivation: the gradient is the direction of steepest ascent.** The rate of change in a unit direction **u** (the **directional derivative**) is D<sub>**u**</sub>f = ∇f · **u** = ‖∇f‖ cos θ. This is largest when θ = 0, that is, **u** points along ∇f, and the maximum rate is ‖∇f‖. Moving along −∇f decreases f fastest, which is why gradient descent works. Directions with θ = 90° (perpendicular to the gradient) leave f unchanged to first order: the gradient is perpendicular to contour lines.

```python run The gradient beats every other direction, and is perpendicular to contours
import numpy as np
f = lambda p: p[0] ** 2 + 3 * p[0] * p[1] + 2 * p[1] ** 2
grad = lambda p: np.array([2 * p[0] + 3 * p[1], 3 * p[0] + 4 * p[1]])
p = np.array([1.0, -0.5])
g = grad(p)
h = 1e-6
num = np.array([(f(p + h * e) - f(p - h * e)) / (2 * h) for e in np.eye(2)])
print('analytic gradient', g, '| numeric', np.round(num, 6))
angles = np.linspace(0, 2 * np.pi, 3600, endpoint=False)
U = np.stack([np.cos(angles), np.sin(angles)], axis=1)
rates = np.array([(f(p + h * u) - f(p - h * u)) / (2 * h) for u in U])
best = U[np.argmax(rates)]
unit_g = g / np.linalg.norm(g)
print('steepest direction found:', np.round(best, 3), '| g/|g|:', np.round(unit_g, 3))
print(f'max rate {rates.max():.4f} = |g| {np.linalg.norm(g):.4f}')
perp = np.array([-g[1], g[0]]) / np.linalg.norm(g)
rate = (f(p + h * perp) - f(p - h * perp)) / (2 * h)
print(f'rate along the perpendicular direction: {rate:.1e}')
```

## 4.4 Matrix calculus identities

These identities (with **A** constant, **x** the variable) let you differentiate most ML losses without expanding sums. Each follows by writing the expression in index form and differentiating one component.

| Function f(**x**) | Gradient ∇f |
|---|---|
| **a**<sup>T</sup>**x** | **a** |
| **x**<sup>T</sup>**x** = ‖**x**‖² | 2**x** |
| **x**<sup>T</sup>**Ax** | (**A** + **A**<sup>T</sup>)**x**, which is 2**Ax** if **A** is symmetric |
| ‖**Ax** − **b**‖² | 2**A**<sup>T</sup>(**Ax** − **b**) |
| ‖**x**‖ | **x**/‖**x**‖ (for **x** ≠ **0**) |
| log Σ<sub>i</sub> e<sup>x<sub>i</sub></sup> (log-sum-exp) | softmax(**x**) |

**Derivation of the quadratic form.** **x**<sup>T</sup>**Ax** = Σ<sub>i</sub>Σ<sub>j</sub> x<sub>i</sub>A<sub>ij</sub>x<sub>j</sub>. Differentiating with respect to x<sub>k</sub> picks up the terms with i = k (giving Σ<sub>j</sub>A<sub>kj</sub>x<sub>j</sub> = (**Ax**)<sub>k</sub>) and those with j = k (giving Σ<sub>i</sub>x<sub>i</sub>A<sub>ik</sub> = (**A**<sup>T</sup>**x**)<sub>k</sub>). Together: (**A** + **A**<sup>T</sup>)**x**.

**Derivation of the least-squares gradient.** ‖**Ax** − **b**‖² = **x**<sup>T</sup>**A**<sup>T</sup>**Ax** − 2**b**<sup>T</sup>**Ax** + **b**<sup>T</sup>**b**. Apply the first and third rows: 2**A**<sup>T</sup>**Ax** − 2**A**<sup>T</sup>**b** = 2**A**<sup>T</sup>(**Ax** − **b**). Setting it to zero gives the normal equations of Chapter 12.

**Derivation of the log-sum-exp gradient.** ∂/∂x<sub>k</sub> log Σe<sup>x<sub>i</sub></sup> = e<sup>x<sub>k</sub></sup>/Σe<sup>x<sub>i</sub></sup> = softmax(**x**)<sub>k</sub>.

```python run Every identity in the table, checked by a generic gradient checker
import numpy as np
def num_grad(f, x, h=1e-6):
    g = np.zeros_like(x)
    for i in range(len(x)):
        e = np.zeros_like(x); e[i] = h
        g[i] = (f(x + e) - f(x - e)) / (2 * h)
    return g
rng = np.random.default_rng(9)
n = 5
A = rng.normal(size=(n, n))
a, b, x = rng.normal(size=(3, n))
softmax = lambda z: np.exp(z - z.max()) / np.exp(z - z.max()).sum()
checks = [
    ('a^T x',        lambda x: a @ x,                        a),
    ('x^T x',        lambda x: x @ x,                        2 * x),
    ('x^T A x',      lambda x: x @ A @ x,                    (A + A.T) @ x),
    ('|Ax - b|^2',   lambda x: np.sum((A @ x - b) ** 2),     2 * A.T @ (A @ x - b)),
    ('|x|',          lambda x: np.linalg.norm(x),            x / np.linalg.norm(x)),
    ('logsumexp',    lambda x: np.log(np.sum(np.exp(x))),    softmax(x)),
]
for name, f, g in checks:
    print(f'{name:12s} max error {np.max(abs(num_grad(f, x) - g)):.1e}')
```

## 4.5 The Jacobian

For a vector-valued function **f**: ℝ<sup>n</sup> → ℝ<sup>m</sup>, the **Jacobian** **J** is the m × n matrix with J<sub>ij</sub> = ∂f<sub>i</sub>/∂x<sub>j</sub>. It is the best linear approximation: **f**(**x** + **h**) ≈ **f**(**x**) + **Jh**. The **multivariable chain rule** is a matrix product: if **z** = **f**(**g**(**x**)), then **J**<sub>**z**,**x**</sub> = **J**<sub>**f**</sub> **J**<sub>**g**</sub>.

**Derivation of the softmax Jacobian.** With p<sub>i</sub> = e<sup>z<sub>i</sub></sup>/S and S = Σe<sup>z<sub>k</sub></sup>: for i = j, the quotient rule gives ∂p<sub>i</sub>/∂z<sub>i</sub> = (e<sup>z<sub>i</sub></sup>S − e<sup>z<sub>i</sub></sup>e<sup>z<sub>i</sub></sup>)/S² = p<sub>i</sub>(1 − p<sub>i</sub>); for i ≠ j, ∂p<sub>i</sub>/∂z<sub>j</sub> = −e<sup>z<sub>i</sub></sup>e<sup>z<sub>j</sub></sup>/S² = −p<sub>i</sub>p<sub>j</sub>. In matrix form, **J** = diag(**p**) − **pp**<sup>T</sup>. Each row sums to zero because the probabilities always sum to 1, so no change in **z** can change their total.

```python run Softmax Jacobian and the chain rule as a matrix product
import numpy as np
def softmax(z):
    e = np.exp(z - z.max())
    return e / e.sum()
def num_jac(f, x, h=1e-6):
    return np.stack([(f(x + h * e) - f(x - h * e)) / (2 * h) for e in np.eye(len(x))], axis=1)
z = np.array([1.0, 2.0, 0.5, -1.0])
p = softmax(z)
J = np.diag(p) - np.outer(p, p)
print('max |analytic - numeric|:', f'{np.max(abs(J - num_jac(softmax, z))):.1e}')
print('row sums:', np.round(J.sum(1), 12))
W = np.array([[1.0, -1.0, 0.5, 2.0], [0.3, 0.2, -0.7, 1.0], [2.0, 0.0, 1.0, -1.0]])
g = lambda x: np.tanh(W @ x)                           # R^4 -> R^3
f = lambda y: np.array([y.sum(), (y ** 2).sum()])      # R^3 -> R^2
x = np.array([0.1, -0.2, 0.3, 0.05])
Jg = np.diag(1 - np.tanh(W @ x) ** 2) @ W
Jf = np.stack([np.ones(3), 2 * g(x)])
print('chain rule Jf @ Jg vs numeric Jacobian of f(g(x)):',
      f'{np.max(abs(Jf @ Jg - num_jac(lambda x: f(g(x)), x))):.1e}')
```

## 4.6 The Hessian and second-order Taylor expansion

The **Hessian** **H** of f: ℝ<sup>n</sup> → ℝ is the matrix of second derivatives, H<sub>ij</sub> = ∂²f/∂x<sub>i</sub>∂x<sub>j</sub>. For smooth f it is symmetric. The second-order Taylor expansion is

f(**x** + **h**) ≈ f(**x**) + ∇f · **h** + ½ **h**<sup>T</sup>**Hh**.

At a critical point (∇f = **0**), the quadratic term decides: **H** positive definite → local minimum; negative definite → local maximum; eigenvalues of both signs → **saddle point**. In high-dimensional neural network losses, most critical points are saddles, not bad local minima, because having every one of millions of eigenvalues positive is unlikely.

For f(**x**) = ½**x**<sup>T</sup>**Ax** − **b**<sup>T</sup>**x** with symmetric **A**, the Hessian is exactly **A**, and the expansion is exact.

```python run Taylor error orders and classifying critical points by Hessian eigenvalues
import numpy as np
f = lambda p: np.exp(p[0]) * np.sin(p[1]) + p[0] ** 2 * p[1]
def grad(p):
    return np.array([np.exp(p[0]) * np.sin(p[1]) + 2 * p[0] * p[1],
                     np.exp(p[0]) * np.cos(p[1]) + p[0] ** 2])
def hess(p):
    s, c = np.exp(p[0]) * np.sin(p[1]), np.exp(p[0]) * np.cos(p[1])
    return np.array([[s + 2 * p[1], c + 2 * p[0]], [c + 2 * p[0], -s]])
p, d = np.array([0.3, 0.7]), np.array([1.0, -2.0]) / np.sqrt(5)
print('   t      1st-order error   2nd-order error')
for t in (1e-1, 1e-2, 1e-3):
    h = t * d
    e1 = abs(f(p + h) - (f(p) + grad(p) @ h))
    e2 = abs(f(p + h) - (f(p) + grad(p) @ h + 0.5 * h @ hess(p) @ h))
    print(f'{t:6.0e}  {e1:16.3e}  {e2:16.3e}')
for name, H in [('x^2 + y^2', [[2, 0], [0, 2]]), ('x^2 - y^2', [[2, 0], [0, -2]]),
                ('-x^2 - 3y^2', [[-2, 0], [0, -6]])]:
    ev = np.linalg.eigvalsh(np.array(H, float))
    kind = 'minimum' if ev.min() > 0 else 'maximum' if ev.max() < 0 else 'saddle'
    print(f'{name:12s} Hessian eigenvalues {ev} -> {kind}')
```

Shrinking the step tenfold cuts the first-order error a hundredfold (order t²) and the second-order error a thousandfold (order t³), as the Taylor expansion predicts.

## 4.7 Integrals you need

Integration appears in ML mainly as **expectation** (E[g(X)] = ∫ g(x) p(x) dx) and **normalisation** (a density must integrate to 1). Two results matter most:

- The **Gaussian integral** ∫ e<sup>−x²/2</sup> dx = √(2π) over the whole line, which is why the normal density carries the factor 1/(σ√(2π)).
- **Monte Carlo integration**: E[g(X)] ≈ (1/N) Σ g(x<sub>i</sub>) for samples x<sub>i</sub> ~ p. Its error shrinks like 1/√N regardless of dimension (Chapter 8), which is why ML estimates expectations by sampling (mini-batches, dropout, diffusion models) rather than by grids.

```python run The Gaussian integral numerically, and Monte Carlo expectation error
import numpy as np
from scipy import integrate
val, _ = integrate.quad(lambda x: np.exp(-x ** 2 / 2), -np.inf, np.inf)
print(f'integral of exp(-x^2/2) = {val:.10f}, sqrt(2 pi) = {np.sqrt(2 * np.pi):.10f}')
rng = np.random.default_rng(10)
exact = 1 + 1                                        # E[X^2 + 1] for X ~ N(0, 1)
for N in (100, 10_000, 1_000_000):
    est = [np.mean(rng.normal(size=N) ** 2 + 1) for _ in range(200)]
    print(f'N = {N:>9,}: typical error {np.std(est):.5f} (sqrt(2/N) = {np.sqrt(2 / N):.5f})')
```

Each hundredfold increase in N cuts the error tenfold. Var(X² + 1) = Var(X²) = 2 for a standard normal, so the standard error is √(2/N), which the simulation reproduces.

## 4.8 Practical lessons

- Always check a hand-derived gradient with central differences, h ≈ 10<sup>−5</sup>; relative error below 10<sup>−6</sup> means correct.
- The gradient is the direction of steepest ascent and is perpendicular to contours.
- Learn the identities: ∇(**x**<sup>T</sup>**Ax**) = (**A** + **A**<sup>T</sup>)**x**, ∇‖**Ax** − **b**‖² = 2**A**<sup>T</sup>(**Ax** − **b**), ∇ log-sum-exp = softmax.
- Softmax Jacobian = diag(**p**) − **pp**<sup>T</sup>; σ′ = σ(1 − σ) ≤ 1/4.
- Hessian eigenvalues classify critical points; Monte Carlo error falls like 1/√N.
