# Solutions
%Every derivation followed by an independent numerical check

## Part 1 solutions

### N1.1 Cosine similarity

‖**u**‖ = √(9 + 16) = 5, ‖**v**‖ = √(16 + 9) = 5, **u** · **v** = 12. So cos θ = 12/25 = 0.48 and θ = arccos 0.48 ≈ 61.31°. The projection of **v** onto **u** is (12/25)**u** = (1.44, 1.92, 0).

```python run Checking N1.1
import numpy as np
u, v = np.array([3.0, 4.0, 0.0]), np.array([4.0, 0.0, 3.0])
cos = u @ v / (np.linalg.norm(u) * np.linalg.norm(v))
print(f'norms {np.linalg.norm(u)}, {np.linalg.norm(v)}; dot {u @ v}; cos {cos:.4f}; '
      f'angle {np.degrees(np.arccos(cos)):.2f} degrees')
proj = (u @ v) / (u @ u) * u
print('projection', proj, '| residual . u =', (v - proj) @ u)
```

### N1.2 Inverse rules

(**AB**)(**B**<sup>−1</sup>**A**<sup>−1</sup>) = **A**(**BB**<sup>−1</sup>)**A**<sup>−1</sup> = **AA**<sup>−1</sup> = **I**, and an inverse is unique, so (**AB**)<sup>−1</sup> = **B**<sup>−1</sup>**A**<sup>−1</sup>. The order reverses, like taking off socks and shoes. For the transpose: transpose **AA**<sup>−1</sup> = **I** to get (**A**<sup>−1</sup>)<sup>T</sup>**A**<sup>T</sup> = **I**, so (**A**<sup>−1</sup>)<sup>T</sup> is the inverse of **A**<sup>T</sup>.

```python run Checking N1.2
import numpy as np
rng = np.random.default_rng(101)
A, B = rng.normal(size=(4, 4)), rng.normal(size=(4, 4))
inv = np.linalg.inv
print('(AB)^-1 = B^-1 A^-1:', np.allclose(inv(A @ B), inv(B) @ inv(A)))
print('(AB)^-1 = A^-1 B^-1 (wrong order):', np.allclose(inv(A @ B), inv(A) @ inv(B)))
print('(A^T)^-1 = (A^-1)^T:', np.allclose(inv(A.T), inv(A).T))
```

### N1.3 Powers through eigenvalues

trace = 4 and det = 3, so λ² − 4λ + 3 = 0 gives λ = 3 and λ = 1, with unit eigenvectors (1, 1)/√2 and (1, −1)/√2. Since (1, 0) = ½(1, 1) + ½(1, −1),

**A**<sup>10</sup>(1, 0) = ½·3<sup>10</sup>(1, 1) + ½·1<sup>10</sup>(1, −1) = ((59049 + 1)/2, (59049 − 1)/2) = (29525, 29524).

```python run Checking N1.3
import numpy as np
A = np.array([[2, 1], [1, 2]])
print('eigenvalues', np.linalg.eigvalsh(A))
print('A^10 (1, 0) =', np.linalg.matrix_power(A, 10) @ np.array([1, 0]))
```

### N1.4 Gram matrices

If **A**<sup>T</sup>**Av** = λ**v** with ‖**v**‖ = 1, then λ = **v**<sup>T</sup>**A**<sup>T</sup>**Av** = ‖**Av**‖² ≥ 0. For the null spaces: if **Av** = **0** then **A**<sup>T</sup>**Av** = **0**; conversely if **A**<sup>T</sup>**Av** = **0** then ‖**Av**‖² = **v**<sup>T</sup>**A**<sup>T</sup>**Av** = 0, so **Av** = **0**. Equal null spaces in ℝ<sup>n</sup> mean equal rank (rank = n − dim null space).

```python run Checking N1.4
import numpy as np
rng = np.random.default_rng(102)
A = rng.normal(size=(6, 2)) @ rng.normal(size=(2, 4))      # 6 x 4, rank 2
G = A.T @ A
print('eigenvalues of A^T A:', np.round(np.linalg.eigvalsh(G), 8))
print('rank A', np.linalg.matrix_rank(A), '| rank A^T A', np.linalg.matrix_rank(G))
v = np.linalg.svd(A)[2][-1]                                  # a null vector of A
print(f'|A v| = {np.linalg.norm(A @ v):.1e}, |A^T A v| = {np.linalg.norm(G @ v):.1e}')
```

Two eigenvalues print as 0 (one as −0.0, a rounding error of order 10<sup>−15</sup> shown after rounding): exactly as the proof requires for a rank-2 matrix, none is genuinely negative.

### N1.5 PCA from scratch

Centre **X**, take the SVD **X**<sub>c</sub> = **UΣV**<sup>T</sup>; the components are the rows of **V**<sup>T</sup> and the variances are σ<sub>i</sub>²/(n − 1). Reconstructing from k components keeps **X**<sub>c</sub>**V**<sub>k</sub>**V**<sub>k</sub><sup>T</sup>; the error is the part along the dropped directions, with squared norm Σ<sub>i>k</sub>σ<sub>i</sub>² = (n − 1)Σ<sub>i>k</sub>λ<sub>i</sub>.

```python run Solution N1.5
import numpy as np
rng = np.random.default_rng(103)
n = 300
t = rng.normal(size=(n, 2)) * [3.0, 1.5]
basis = np.array([[1.0, 0.0, 0.5], [0.0, 1.0, -0.3]])        # a plane in 3-D
X = t @ basis + 0.1 * rng.normal(size=(n, 3)) + [5.0, -2.0, 1.0]
mean = X.mean(0)
Xc = X - mean
U, s, Vt = np.linalg.svd(Xc, full_matrices=False)
lam = s ** 2 / (n - 1)
print('explained variance ratio:', np.round(lam / lam.sum(), 5))
k = 2
X_rec = Xc @ Vt[:k].T @ Vt[:k] + mean
err = np.sum((X - X_rec) ** 2)
print(f'squared reconstruction error {err:.4f}; (n-1) x dropped eigenvalue '
      f'{(n - 1) * lam[2]:.4f}')
print('third component (normal to the plane):', np.round(Vt[2] * np.sign(Vt[2, 2]), 4))
normal = np.cross(*basis); normal /= np.linalg.norm(normal)
print('true normal of the plane:            ', np.round(normal * np.sign(normal[2]), 4))
```

Two components explain all but a tiny fraction of the variance, the error identity holds exactly, and the discarded third component recovers the plane's normal vector.

### N1.6 Duplicate features

With two identical columns, **X** has dependent columns, so **X**<sup>T</sup>**X** is **singular** (determinant 0, an eigenvalue 0): there are infinitely many least-squares solutions, because any amount can be moved from one copy's coefficient to the other's. Numerically, rounding makes the matrix merely nearly singular, so `inv` may return enormous, meaningless numbers (or raise an error), and the coefficients change wildly with tiny changes in the data. Fixes: **drop the duplicate** (or any exactly collinear feature); use **ridge regression**, whose **X**<sup>T</sup>**X** + λ**I** is always invertible and splits the weight evenly; or use `lstsq`/the pseudo-inverse, which returns the minimum-norm solution.

### N1.7 Trace identities

trace(**AB**) = Σ<sub>i</sub>(**AB**)<sub>ii</sub> = Σ<sub>i</sub>Σ<sub>j</sub>A<sub>ij</sub>B<sub>ji</sub> = Σ<sub>j</sub>Σ<sub>i</sub>B<sub>ji</sub>A<sub>ij</sub> = Σ<sub>j</sub>(**BA**)<sub>jj</sub> = trace(**BA**). For symmetric **A** = **QΛQ**<sup>T</sup>: trace(**A**) = trace((**QΛ**)**Q**<sup>T</sup>) = trace(**Q**<sup>T</sup>**QΛ**) = trace(**Λ**) = Σλ<sub>i</sub>. For the Frobenius norm, ‖**A**‖<sub>F</sub>² = Σ<sub>ij</sub>A<sub>ij</sub>² = trace(**A**<sup>T</sup>**A**), and **A**<sup>T</sup>**A** = **VΣ**²**V**<sup>T</sup>, whose trace is Σσ<sub>i</sub>² by the previous step.

```python run Checking N1.7
import numpy as np
rng = np.random.default_rng(104)
A, B = rng.normal(size=(3, 5)), rng.normal(size=(5, 3))
print(f'trace(AB) {np.trace(A @ B):.6f}, trace(BA) {np.trace(B @ A):.6f}')
S = rng.normal(size=(4, 4)); S = S + S.T
print(f'trace(S) {np.trace(S):.6f}, sum of eigenvalues {np.linalg.eigvalsh(S).sum():.6f}')
M = rng.normal(size=(4, 6))
print(f'|M|_F^2 {np.sum(M ** 2):.6f}, trace(M^T M) {np.trace(M.T @ M):.6f}, '
      f'sum sigma^2 {np.sum(np.linalg.svd(M, compute_uv=False) ** 2):.6f}')
```

## Part 2 solutions

### N2.1 The tanh derivative

With tanh = (e<sup>x</sup> − e<sup>−x</sup>)/(e<sup>x</sup> + e<sup>−x</sup>), the quotient rule gives [(e<sup>x</sup> + e<sup>−x</sup>)² − (e<sup>x</sup> − e<sup>−x</sup>)²]/(e<sup>x</sup> + e<sup>−x</sup>)² = 1 − tanh². For the identity: 2σ(2x) − 1 = 2/(1 + e<sup>−2x</sup>) − 1 = (1 − e<sup>−2x</sup>)/(1 + e<sup>−2x</sup>); multiply top and bottom by e<sup>x</sup> to get tanh x. So tanh is a rescaled sigmoid, centred on zero, with maximum slope 1 instead of 1/4.

```python run Checking N2.1
import numpy as np
x = np.linspace(-4, 4, 81); h = 1e-6
num = (np.tanh(x + h) - np.tanh(x - h)) / (2 * h)
sig = lambda z: 1 / (1 + np.exp(-z))
print(f'max |numeric - (1 - tanh^2)| = {np.max(abs(num - (1 - np.tanh(x) ** 2))):.1e}')
gap = np.max(abs(np.tanh(x) - (2 * sig(2 * x) - 1)))
print(f'max |tanh(x) - (2 sigma(2x) - 1)| = {gap:.1e}')
```

### N2.2 Logistic loss with ±1 labels

Let t = y**w**<sup>T</sup>**x**. Then dℓ/dt = −e<sup>−t</sup>/(1 + e<sup>−t</sup>) = −σ(−t), and dt/d**w** = y**x**, so ∇ℓ = −yσ(−y**w**<sup>T</sup>**x**)**x**. Recode: for y = +1 (label 1), the gradient is −σ(−z)**x** = −(1 − p)**x** = (p − 1)**x**; for y = −1 (label 0), it is σ(z)**x** = (p − 0)**x**. Both match (p − y<sub>01</sub>)**x**.

```python run Checking N2.2
import numpy as np
sig = lambda z: 1 / (1 + np.exp(-z))
rng = np.random.default_rng(105)
w, x = rng.normal(size=4), rng.normal(size=4)
for y in (+1, -1):
    loss = lambda w: np.log1p(np.exp(-y * w @ x))
    g = -y * sig(-y * w @ x) * x
    h = 1e-6
    num = np.array([(loss(w + h * e) - loss(w - h * e)) / (2 * h) for e in np.eye(4)])
    y01 = (y + 1) // 2
    print(f'y = {y:+d}: |analytic - numeric| {np.max(abs(g - num)):.1e}; '
          f'matches (p - y01) x: {np.allclose(g, (sig(w @ x) - y01) * x)}')
```

### N2.3 Ridge gradient

∇L = 2**X**<sup>T</sup>(**Xw** − **y**) + 2λ**w** = 2[(**X**<sup>T</sup>**X** + λ**I**)**w** − **X**<sup>T</sup>**y**]. Setting it to zero: **ŵ** = (**X**<sup>T</sup>**X** + λ**I**)<sup>−1</sup>**X**<sup>T</sup>**y**. For λ > 0 the matrix is positive definite (its eigenvalues are those of **X**<sup>T</sup>**X** plus λ), so the solution is unique.

```python run Checking N2.3
import numpy as np
rng = np.random.default_rng(106)
X, y, lam = rng.normal(size=(30, 4)), rng.normal(size=30), 2.5
w = np.linalg.solve(X.T @ X + lam * np.eye(4), X.T @ y)
L = lambda w: np.sum((X @ w - y) ** 2) + lam * w @ w
grad = 2 * X.T @ (X @ w - y) + 2 * lam * w
h = 1e-6
num = np.array([(L(w + h * e) - L(w - h * e)) / (2 * h) for e in np.eye(4)])
print(f'|analytic gradient at w-hat| {np.linalg.norm(grad):.1e}; '
      f'numeric {np.linalg.norm(num):.1e}')
worse = all(L(w + 0.01 * rng.normal(size=4)) > L(w) for _ in range(100))
print('100 random nearby points are all worse:', worse)
```

### N2.4 Classify the critical points

∇f = (3x² − 3y, 3y² − 3x) = **0** gives y = x² and x = y², so x = x⁴: x = 0 or x = 1. Critical points: (0, 0) and (1, 1). The Hessian is [[6x, −3], [−3, 6y]].

- At (0, 0): [[0, −3], [−3, 0]], eigenvalues ±3, a **saddle**.
- At (1, 1): [[6, −3], [−3, 6]], eigenvalues 3 and 9, a **local minimum** with f(1, 1) = 1 − 3 + 1 = −1.

It is not a global minimum: f → −∞ as x → −∞ along y = 0.

```python run Checking N2.4
import numpy as np
from scipy.optimize import minimize
f = lambda p: p[0] ** 3 - 3 * p[0] * p[1] + p[1] ** 3
H = lambda p: np.array([[6 * p[0], -3], [-3, 6 * p[1]]])
for p in ([0.0, 0.0], [1.0, 1.0]):
    print(p, 'Hessian eigenvalues', np.linalg.eigvalsh(H(p)), f'f = {f(p)}')
r = minimize(f, x0=[0.8, 1.3])
print('local search from (0.8, 1.3) ends at', np.round(r.x, 5), f'f = {r.fun:.5f}')
print('f(-10, 0) =', f([-10.0, 0.0]))
```

### N2.5 Catch the bug

```python run Solution N2.5
import numpy as np
def check_grad(f, grad, x, h=1e-6):
    num = np.zeros_like(x)
    for i in range(x.size):
        e = np.zeros_like(x); e.flat[i] = h
        num.flat[i] = (f(x + e) - f(x - e)) / (2 * h)
    g = grad(x)
    return np.linalg.norm(num - g) / max(np.linalg.norm(num + g), 1e-12)
def softmax(z):
    e = np.exp(z - z.max()); return e / e.sum()
rng = np.random.default_rng(107)
z, c = rng.normal(size=6), 2
y = np.eye(6)[c]
loss = lambda z: -np.log(softmax(z)[c])
for name, grad in (('correct p - y', lambda z: softmax(z) - y),
                   ('buggy p', lambda z: softmax(z))):
    rel = check_grad(loss, grad, z)
    verdict = 'PASS' if rel < 1e-6 else 'FAIL'
    print(f'{name:14s} relative error {rel:.1e} -> {verdict}')
```

The correct gradient agrees to about ten digits; the buggy one fails by many orders of magnitude, so a threshold such as 10<sup>−6</sup> separates them without ambiguity.

### N2.6 A layer's Jacobian

Let **a** = **Wx**, so ∂**a**/∂**x** = **W**. The element-wise σ has a diagonal Jacobian diag(σ′(**a**)) with σ′ = σ(1 − σ). By the chain rule, ∂**h**/∂**x** = diag(σ′(**a**))**W**, that is, row i of **W** scaled by σ′(a<sub>i</sub>). For the weights, h<sub>i</sub> depends on W<sub>ij</sub> only through a<sub>i</sub> = Σ<sub>j</sub>W<sub>ij</sub>x<sub>j</sub>, so ∂h<sub>i</sub>/∂W<sub>ij</sub> = σ′(a<sub>i</sub>)x<sub>j</sub>.

```python run Checking N2.6
import numpy as np
sig = lambda z: 1 / (1 + np.exp(-z))
rng = np.random.default_rng(108)
W, x = rng.normal(size=(3, 4)), rng.normal(size=4)
a = W @ x
J = np.diag(sig(a) * (1 - sig(a))) @ W
h = 1e-6
num = np.stack([(sig(W @ (x + h * e)) - sig(W @ (x - h * e))) / (2 * h)
                for e in np.eye(4)], 1)
print(f'dh/dx: max error {np.max(abs(J - num)):.1e}')
i, j = 1, 2
E = np.zeros_like(W); E[i, j] = h
num_w = (sig((W + E) @ x)[i] - sig((W - E) @ x)[i]) / (2 * h)
print(f'dh_1/dW_12: analytic {sig(a[i]) * (1 - sig(a[i])) * x[j]:.8f}, numeric {num_w:.8f}')
```

## Part 3 solutions

### N3.1 Bias gradients sum

Z<sub>nk</sub> = Σ<sub>j</sub>X<sub>nj</sub>W<sub>jk</sub> + b<sub>k</sub>. The bias b<sub>k</sub> appears in every row n of column k with coefficient 1, so ∂L/∂b<sub>k</sub> = Σ<sub>n</sub>∂L/∂Z<sub>nk</sub>: the column sums of ∂L/∂**Z**. W<sub>jk</sub> appears in Z<sub>nk</sub> with coefficient X<sub>nj</sub>, so ∂L/∂W<sub>jk</sub> = Σ<sub>n</sub>X<sub>nj</sub>∂L/∂Z<sub>nk</sub> = (**X**<sup>T</sup>∂L/∂**Z**)<sub>jk</sub>.

```python run Checking N3.1
import numpy as np
rng = np.random.default_rng(109)
X, W = rng.normal(size=(5, 3)), rng.normal(size=(3, 2))
b, T = rng.normal(size=2), rng.normal(size=(5, 2))
L = lambda W, b: np.sum((X @ W + b - T) ** 2)
dZ = 2 * (X @ W + b - T)
h = 1e-6
nb = np.array([(L(W, b + h * e) - L(W, b - h * e)) / (2 * h) for e in np.eye(2)])
print('bias: sum of dZ rows', np.round(dZ.sum(0), 6), '| numeric', np.round(nb, 6))
E = np.zeros_like(W); E[2, 1] = h
num_w = (L(W + E, b) - L(W - E, b)) / (2 * h)
print(f'W[2,1]: (X^T dZ) {(X.T @ dZ)[2, 1]:.6f} | numeric {num_w:.6f}')
```

### N3.2 Sigmoid with squared error

Squared error: ∂/∂z (σ − 1)² = 2(σ − 1)σ(1 − σ). Cross-entropy: σ − 1. Their ratio is 2σ(1 − σ), which is 0.5 at z = 0 and about 2e<sup>z</sup> for very negative z.

```python run Solution N3.2
import numpy as np
sig = lambda z: 1 / (1 + np.exp(-z))
for z in (0.0, -3.0, -6.0):
    p = sig(z)
    se, ce = 2 * (p - 1) * p * (1 - p), p - 1
    print(f'z = {z:4.0f}: p = {p:.5f}, squared error {se:9.6f}, cross-entropy {ce:9.6f}, '
          f'ratio {ce / se:7.1f}')
```

At z = −6, where the model is confidently wrong, the squared-error gradient is about 200 times smaller than the cross-entropy gradient: learning nearly stops exactly when the error is largest.

### N3.3 Back-propagation for regression

Forward: **A** = **XW**<sub>1</sub> + **b**<sub>1</sub>, **H** = tanh(**A**), **ŷ** = **HW**<sub>2</sub> + b<sub>2</sub>, L = mean((ŷ − y)²). Backward: δ**ŷ** = 2(ŷ − y)/B; ∂L/∂**W**<sub>2</sub> = **H**<sup>T</sup>δ**ŷ**, ∂L/∂b<sub>2</sub> = Σδ**ŷ**; δ**H** = δ**ŷ** **W**<sub>2</sub><sup>T</sup>; δ**A** = δ**H** ⊙ (1 − **H**²); ∂L/∂**W**<sub>1</sub> = **X**<sup>T</sup>δ**A**, ∂L/∂**b**<sub>1</sub> = Σ<sub>rows</sub>δ**A**.

```python run Solution N3.3
import numpy as np
rng = np.random.default_rng(110)
B = 16
X, y = rng.normal(size=(B, 3)), rng.normal(size=(B, 1))
P = {'W1': rng.normal(size=(3, 8)) * 0.5, 'b1': np.zeros(8) + 0.1,
     'W2': rng.normal(size=(8, 1)) * 0.5, 'b2': np.zeros(1)}
def loss(P):
    H = np.tanh(X @ P['W1'] + P['b1'])
    return np.mean((H @ P['W2'] + P['b2'] - y) ** 2)
H = np.tanh(X @ P['W1'] + P['b1'])
dy = 2 * (H @ P['W2'] + P['b2'] - y) / B
dA = (dy @ P['W2'].T) * (1 - H ** 2)
G = {'W2': H.T @ dy, 'b2': dy.sum(0), 'W1': X.T @ dA, 'b1': dA.sum(0)}
h = 1e-6
for k in P:
    num = np.zeros_like(P[k])
    for idx in np.ndindex(P[k].shape):
        old = P[k][idx]
        P[k][idx] = old + h; lp = loss(P)
        P[k][idx] = old - h; lm = loss(P)
        P[k][idx] = old
        num[idx] = (lp - lm) / (2 * h)
    rel = np.linalg.norm(num - G[k]) / np.linalg.norm(num + G[k])
    print(f'{k}: relative error {rel:.1e}')
```

### N3.4 Weight decay

The gradient step on L + λ‖**w**‖² is **w** − η(∇L + 2λ**w**) = (1 − 2ηλ)**w** − η∇L(**w**). That is: shrink the weights by the factor (1 − 2ηλ), then take the ordinary step (with the gradient evaluated at the old **w**). Hence the name **weight decay**. For plain SGD the two are identical; for Adam they are not, because Adam rescales the penalty's gradient too, which is why AdamW applies the decay separately.

```python run Checking N3.4
import numpy as np
rng = np.random.default_rng(111)
X, y, w = rng.normal(size=(20, 3)), rng.normal(size=20), rng.normal(size=3)
eta, lam = 0.05, 0.3
gL = 2 * X.T @ (X @ w - y) / 20
step_penalty = w - eta * (gL + 2 * lam * w)
step_decay = (1 - 2 * eta * lam) * w - eta * gL
print('penalised step:', np.round(step_penalty, 6))
print('decay then step:', np.round(step_decay, 6))
```

### N3.5 Initialisation variances

Xavier: 2/(512 + 256) = 2/768 ≈ 0.002604, standard deviation ≈ 0.0510. He: 2/512 = 0.003906, standard deviation 0.0625.

```python run Solution N3.5
import numpy as np
print(f'Xavier var {2 / 768:.6f}, sd {np.sqrt(2 / 768):.4f}; He var {2 / 512:.6f}, '
      f'sd {np.sqrt(2 / 512):.4f}')
rng = np.random.default_rng(112)
h = rng.normal(size=(2000, 512))
for layer in range(1, 21):
    h = np.maximum(h @ (rng.normal(size=(512, 512)) * np.sqrt(2 / 512)), 0)
    if layer in (1, 5, 10, 20):
        print(f'after layer {layer:2d}: mean square activation {np.mean(h ** 2):.3f}')
```

The mean square stays of order 1 through 20 layers, as the derivation in Section 5.5 of the guide predicts. It drifts slowly because each finite-width layer adds a little random variation to the scale.

## Part 4 solutions

### N4.1 Step-size limits

λ<sub>max</sub> = 4, λ<sub>min</sub> = 1. Stable if η < 2/4 = 0.5. Optimal η = 2/(4 + 1) = 0.4, where both coordinates shrink by \|1 − 0.4·4\| = \|1 − 0.4·1\| = 0.6 = (κ − 1)/(κ + 1) with κ = 4.

```python run Checking N4.1
import numpy as np
lams = np.array([4.0, 1.0])
for eta in (0.3, 0.4, 0.49, 0.51):
    w = np.array([1.0, 1.0]); norms = []
    for _ in range(30):
        w = w - eta * lams * w; norms.append(np.linalg.norm(w))
    ratio = norms[-1] / norms[-2]
    print(f'eta {eta}: |w| after 30 steps {norms[-1]:.3e}, last ratio {ratio:.4f}')
```

At η = 0.4 the per-step ratio is exactly 0.6; at 0.3 the slow coordinate shrinks only by 0.7; at 0.49 the fast coordinate oscillates with factor 0.96; at 0.51 it grows by 1.04 per step and diverges.

### N4.2 Newton on a quadratic

∇f(**w**) = **Aw** − **b** and **H** = **A**. The Newton step from any **w**<sub>0</sub> gives **w**<sub>1</sub> = **w**<sub>0</sub> − **A**<sup>−1</sup>(**Aw**<sub>0</sub> − **b**) = **A**<sup>−1</sup>**b**, which is where the gradient vanishes, the unique minimum since **A** is positive definite. Newton's method is exact here because its quadratic model is the function itself.

```python run Checking N4.2
import numpy as np
rng = np.random.default_rng(113)
M = rng.normal(size=(5, 5)); A = M @ M.T + 0.1 * np.eye(5); b = rng.normal(size=5)
for _ in range(3):
    w0 = rng.normal(size=5) * 10
    w1 = w0 - np.linalg.solve(A, A @ w0 - b)
    print(f'start norm {np.linalg.norm(w0):6.2f} -> gradient after one step '
          f'{np.linalg.norm(A @ w1 - b):.1e}')
print(f'condition number of A: {np.linalg.cond(A):.0f} (irrelevant to Newton)')
```

### N4.3 A non-convex loss

f(1, 1) = f(−1, −1) = 0, but at the midpoint f(0, 0) = 1 > 0, so the chord lies below the graph: not convex. The Hessian is [[2w<sub>2</sub>², 4w<sub>1</sub>w<sub>2</sub> − 2], [4w<sub>1</sub>w<sub>2</sub> − 2, 2w<sub>1</sub>²]], which at the origin is [[0, −2], [−2, 0]] with eigenvalues ±2: the origin is a saddle. The minima form a whole curve w<sub>1</sub>w<sub>2</sub> = 1. Factorisation models (a rating ≈ user factor × item factor) and deep networks (products of weight matrices) share this structure: rescaling one factor up and another down leaves the output unchanged, creating symmetric, connected families of minima and saddles between them.

```python run Checking N4.3
import numpy as np
f = lambda w: (w[0] * w[1] - 1) ** 2
a, b = np.array([1.0, 1.0]), np.array([-1.0, -1.0])
print(f'f(a) = {f(a)}, f(b) = {f(b)}, f(midpoint) = {f((a + b) / 2)}')
H0 = np.array([[0.0, -2.0], [-2.0, 0.0]])
print('Hessian eigenvalues at the origin:', np.linalg.eigvalsh(H0))
print('f on the curve w1 w2 = 1:', [float(f(np.array([t, 1 / t]))) for t in (0.5, 2.0, -3.0)])
```

### N4.4 Rosenbrock

```python run Solution N4.4
import numpy as np
f = lambda p: (1 - p[0]) ** 2 + 100 * (p[1] - p[0] ** 2) ** 2
def grad(p):
    return np.array([-2 * (1 - p[0]) - 400 * p[0] * (p[1] - p[0] ** 2),
                     200 * (p[1] - p[0] ** 2)])
start, steps = np.array([-1.5, 2.0]), 5000
def gd(eta=1e-3):
    p = start.copy()
    for _ in range(steps):
        p = p - eta * grad(p)
    return p
def momentum(eta=2e-4, beta=0.9):
    p, v = start.copy(), np.zeros(2)
    for _ in range(steps):
        v = beta * v + grad(p); p = p - eta * v
    return p
def adam(eta=0.02, b1=0.9, b2=0.999, eps=1e-8):
    p, m, s = start.copy(), np.zeros(2), np.zeros(2)
    for t in range(1, steps + 1):
        g = grad(p)
        m = b1 * m + (1 - b1) * g; s = b2 * s + (1 - b2) * g ** 2
        p = p - eta * (m / (1 - b1 ** t)) / (np.sqrt(s / (1 - b2 ** t)) + eps)
    return p
for name, opt in (('gradient descent', gd), ('momentum', momentum), ('Adam', adam)):
    p = opt()
    print(f'{name:17s} ends at {np.round(p, 4)}, distance to (1, 1) '
          f'{np.linalg.norm(p - 1):.2e}, f = {f(p):.2e}')
H = np.array([[1200 - 400 + 2, -400], [-400, 200]])           # Hessian at (1, 1)
print(f'condition number of the Hessian at the minimum: {np.linalg.cond(H):.0f}')
```

Near the minimum the Hessian has a condition number of about 2,500: a long, curved, narrow valley. Gradient descent must use a step small enough for the steep direction and so crawls along the valley floor. Momentum accumulates speed along the floor, and Adam rescales each coordinate. The exact rankings depend on the step sizes chosen; the lesson is that ill-conditioning, not the number of dimensions, is what makes plain gradient descent slow.

### N4.5 Constrained maximum

L = **w**<sup>T</sup>**Cw** − λ(**w**<sup>T</sup>**w** − 1); ∇L = 2**Cw** − 2λ**w** = **0** gives **Cw** = λ**w**, so **w** must be a unit eigenvector, and the objective equals **w**<sup>T</sup>**Cw** = λ. The eigenvalues of **C** are 3 (eigenvector (1, 1)/√2) and 1 (eigenvector (1, −1)/√2), so the maximum is 3 at **w** = ±(1, 1)/√2 and the minimum is 1. If **C** is a covariance matrix, this is the first principal component and the variance along it.

```python run Checking N4.5
import numpy as np
C = np.array([[2.0, 1.0], [1.0, 2.0]])
theta = np.linspace(0, 2 * np.pi, 360_000, endpoint=False)
W = np.stack([np.cos(theta), np.sin(theta)], 1)
vals = np.einsum('ij,jk,ik->i', W, C, W)
print(f'max {vals.max():.6f} at {np.round(W[np.argmax(vals)], 4)}; min {vals.min():.6f}')
```

### N4.6 Adam's start-up bias

With m<sub>0</sub> = 0 and g = 1, m<sub>t</sub> = 0.9m<sub>t−1</sub> + 0.1, so m<sub>t</sub> = 1 − 0.9<sup>t</sup>: 0.1, 0.19, 0.271 and 1 − 0.9<sup>10</sup> ≈ 0.6513. Dividing by 1 − 0.9<sup>t</sup> gives exactly 1 every time. Without correction the first steps would be ten times too small (and for the second moment with β<sub>2</sub> = 0.999 the bias is far worse: 1 − 0.999 = 0.001 at t = 1).

```python run Checking N4.6
beta, m = 0.9, 0.0
for t in range(1, 11):
    m = beta * m + (1 - beta) * 1.0
    if t in (1, 2, 3, 10):
        print(f't = {t:2d}: raw m = {m:.4f}, corrected = {m / (1 - beta ** t):.4f}')
```
