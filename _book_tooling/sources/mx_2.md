# Chapter 5: Gradients of ML Losses and Back-propagation
%Deriving the gradients every model uses, then automating the chain rule

## 5.1 Linear regression with squared error

Model ŷ = **Xw**, loss L(**w**) = (1/n)‖**Xw** − **y**‖². From the identity in Section 4.4:

∇L = (2/n) **X**<sup>T</sup>(**Xw** − **y**).

In words: each example contributes its **error** (ŷ<sub>i</sub> − y<sub>i</sub>) times its **input** **x**<sub>i</sub>. The same "error × input" shape will appear for logistic and softmax regression, and that is no accident (Section 5.3).

## 5.2 Logistic regression: the gradient is (σ − y)x

Model p = σ(z) with z = **w**<sup>T</sup>**x**, label y ∈ {0, 1}, and the **binary cross-entropy** (negative log-likelihood, Chapter 9) for one example:

ℓ = −[y ln p + (1 − y) ln(1 − p)].

**Derivation.** By the chain rule, ∂ℓ/∂z = (∂ℓ/∂p)(∂p/∂z). First, ∂ℓ/∂p = −y/p + (1 − y)/(1 − p) = (p − y)/(p(1 − p)). Second, ∂p/∂z = p(1 − p) (Section 4.2). The p(1 − p) factors cancel:

∂ℓ/∂z = p − y, and so ∇<sub>**w**</sub>ℓ = (p − y)**x**.

The cancellation is why cross-entropy is paired with sigmoid. With squared error instead, ∂ℓ/∂z = 2(p − y)p(1 − p): when the model is confidently wrong (p ≈ 0 while y = 1) the factor p(1 − p) ≈ 0 kills the gradient, and learning stalls exactly when it is most needed.

```python run Logistic gradient (p - y)x checked, and why squared error stalls when wrong
import numpy as np
sig = lambda z: 1 / (1 + np.exp(-z))
rng = np.random.default_rng(11)
X = rng.normal(size=(50, 3)); y = (rng.random(50) < 0.5).astype(float)
w = rng.normal(size=3)
def loss(w):
    p = sig(X @ w)
    return -np.mean(y * np.log(p) + (1 - y) * np.log(1 - p))
analytic = X.T @ (sig(X @ w) - y) / len(y)
h = 1e-6
numeric = np.array([(loss(w + h * e) - loss(w - h * e)) / (2 * h) for e in np.eye(3)])
print('analytic', np.round(analytic, 6), '| numeric', np.round(numeric, 6))
print('confidently wrong example (y = 1):')
for z in (-1.0, -4.0, -8.0):
    p = sig(z)
    print(f'  z = {z:4.0f}, p = {p:.5f}: dL/dz cross-entropy {p - 1:8.5f}, '
          f'squared error {2 * (p - 1) * p * (1 - p):9.6f}')
```

## 5.3 Softmax with cross-entropy: the gradient is p − y

For K classes, logits **z**, probabilities **p** = softmax(**z**) and a one-hot label **y**, the loss is ℓ = −Σ<sub>k</sub> y<sub>k</sub> ln p<sub>k</sub> = −ln p<sub>c</sub> for the true class c.

**Derivation.** Write ℓ = −z<sub>c</sub> + ln Σ<sub>k</sub> e<sup>z<sub>k</sub></sup>. The gradient of the first term is −**y** (it only touches z<sub>c</sub>); the gradient of log-sum-exp is softmax(**z**) = **p** (Section 4.4). So

∇<sub>**z**</sub>ℓ = **p** − **y**.

Equivalently, combine the softmax Jacobian (diag(**p**) − **pp**<sup>T</sup>) with ∂ℓ/∂p<sub>k</sub> = −y<sub>k</sub>/p<sub>k</sub>; the product simplifies to the same **p** − **y**. Linear, logistic and softmax regression all have gradient "prediction minus target" with respect to the pre-activation. This is a property of **generalised linear models** with their **canonical link**, and it makes the losses convex in **w**.

> TRAP: Never compute softmax then log separately: e<sup>1000</sup> overflows. Use the **log-sum-exp trick**: subtract max(**z**) first (it cancels in the ratio), or call a fused `cross_entropy(logits, labels)` function.

```python run Softmax cross-entropy gradient p - y, and the overflow trap
import numpy as np
def log_softmax(z):
    m = z.max()
    return z - m - np.log(np.sum(np.exp(z - m)))
z = np.array([2.0, -1.0, 0.5, 3.0]); c = 1
y = np.eye(4)[c]
p = np.exp(log_softmax(z))
loss = lambda z: -log_softmax(z)[c]
h = 1e-6
num = np.array([(loss(z + h * e) - loss(z - h * e)) / (2 * h) for e in np.eye(4)])
print('p - y   ', np.round(p - y, 6))
print('numeric ', np.round(num, 6))
J = np.diag(p) - np.outer(p, p)
print('via the Jacobian, J^T (-y / p):', np.round(J.T @ (-y / p), 6))
big = np.array([1000.0, 999.0, 990.0])
with np.errstate(over='ignore', invalid='ignore'):
    naive = np.exp(big) / np.exp(big).sum()
print('naive softmax of [1000, 999, 990]:', naive)
print('stable softmax:', np.round(np.exp(log_softmax(big)), 6))
```

## 5.4 Back-propagation: the chain rule, organised

A neural network is a composition of simple functions. Back-propagation computes the gradient of the loss with respect to **every** parameter in one backward pass whose cost is a small constant times the cost of the forward pass. It is the chain rule applied from the output backwards, reusing each intermediate gradient.

**A two-layer network.** For one input **x** (column vector):

| Forward | Backward (δ means ∂L/∂(that quantity)) |
|---|---|
| **a** = **W**<sub>1</sub>**x** + **b**<sub>1</sub> | δ**z** = **p** − **y** (Section 5.3) |
| **h** = ReLU(**a**) | ∂L/∂**W**<sub>2</sub> = δ**z** **h**<sup>T</sup>, ∂L/∂**b**<sub>2</sub> = δ**z** |
| **z** = **W**<sub>2</sub>**h** + **b**<sub>2</sub> | δ**h** = **W**<sub>2</sub><sup>T</sup> δ**z** |
| **p** = softmax(**z**), L = −ln p<sub>c</sub> | δ**a** = δ**h** ⊙ 1[**a** > 0] |
| | ∂L/∂**W**<sub>1</sub> = δ**a** **x**<sup>T</sup>, ∂L/∂**b**<sub>1</sub> = δ**a** |

**Derivation of the two key steps.**

- For **z** = **Wh** + **b**, z<sub>i</sub> = Σ<sub>j</sub>W<sub>ij</sub>h<sub>j</sub>, so ∂L/∂W<sub>ij</sub> = (∂L/∂z<sub>i</sub>) h<sub>j</sub>: an outer product δ**z** **h**<sup>T</sup>. And ∂L/∂h<sub>j</sub> = Σ<sub>i</sub>(∂L/∂z<sub>i</sub>)W<sub>ij</sub>, which is (**W**<sup>T</sup>δ**z**)<sub>j</sub>: gradients flow backwards through the **transpose**.
- An element-wise activation has a diagonal Jacobian, so the chain rule becomes an element-wise product with its derivative.

For a mini-batch stored as rows of **X**, the outer products become matrix products (**H**<sup>T</sup>δ**Z**), and the bias gradient sums δ over the batch.

```python run A two-layer network: back-propagation versus a numerical gradient check
import numpy as np
rng = np.random.default_rng(12)
n, d, hdim, K = 8, 4, 5, 3
X = rng.normal(size=(n, d)); labels = rng.integers(0, K, n); Y = np.eye(K)[labels]
P = {'W1': rng.normal(size=(d, hdim)) * 0.5, 'b1': rng.normal(size=hdim) * 0.1,
     'W2': rng.normal(size=(hdim, K)) * 0.5, 'b2': rng.normal(size=K) * 0.1}
def forward(P):
    A = X @ P['W1'] + P['b1']; H = np.maximum(A, 0)
    Z = H @ P['W2'] + P['b2']
    Z = Z - Z.max(1, keepdims=True)
    Pr = np.exp(Z) / np.exp(Z).sum(1, keepdims=True)
    return A, H, Pr, -np.mean(np.log(Pr[np.arange(n), labels]))
A, H, Pr, L = forward(P)
dZ = (Pr - Y) / n                                     # mean over the batch
grads = {'W2': H.T @ dZ, 'b2': dZ.sum(0)}
dA = (dZ @ P['W2'].T) * (A > 0)
grads.update({'W1': X.T @ dA, 'b1': dA.sum(0)})
h = 1e-6
for name in P:
    num = np.zeros_like(P[name])
    for idx in np.ndindex(P[name].shape):
        old = P[name][idx]
        P[name][idx] = old + h; Lp = forward(P)[3]
        P[name][idx] = old - h; Lm = forward(P)[3]
        P[name][idx] = old
        num[idx] = (Lp - Lm) / (2 * h)
    rel = np.linalg.norm(num - grads[name]) / np.linalg.norm(num + grads[name])
    print(f'{name}: relative error {rel:.1e}')
print(f'loss {L:.4f}; number of gradient entries checked: {sum(p.size for p in P.values())}')
```

> TIP: The standard gradient-check criterion is the **relative error** ‖g<sub>num</sub> − g<sub>bp</sub>‖ / ‖g<sub>num</sub> + g<sub>bp</sub>‖: below 10<sup>−7</sup> is excellent, around 10<sup>−4</sup> means look for a bug, and above 10<sup>−2</sup> is almost certainly wrong. Check in double precision with a few examples; ReLU kinks can cause a rare false alarm.

## 5.5 Vanishing and exploding gradients

Back-propagating through L layers multiplies L Jacobians. If each has typical gain g, the gradient scales roughly like g<sup>L</sup>: for g = 0.25 (sigmoid at best) and L = 20 that is 10<sup>−12</sup>. The cures are all ways of keeping the gain near 1:

- **Initialisation**: Xavier/Glorot uses Var(w) = 1/n<sub>in</sub> (or 2/(n<sub>in</sub> + n<sub>out</sub>)) for tanh; He uses Var(w) = 2/n<sub>in</sub> for ReLU. **Derivation (He):** with z = Σ<sub>j</sub>w<sub>j</sub>h<sub>j</sub> over n<sub>in</sub> independent terms, Var(z) = n<sub>in</sub> Var(w) E[h²]. ReLU zeroes half of a symmetric input, so E[h²] = Var(z<sub>prev</sub>)/2. Keeping Var(z) constant requires n<sub>in</sub> Var(w)/2 = 1, so Var(w) = 2/n<sub>in</sub>.
- **ReLU** (gain 1 where active), **residual connections** (the Jacobian of **x** + f(**x**) is **I** + **J**<sub>f</sub>, which cannot vanish), **normalisation layers** and **gradient clipping**.

```python run Activation scale through 30 ReLU layers under three initialisations
import numpy as np
rng = np.random.default_rng(13)
n = 256
x0 = rng.normal(size=(1000, n))
inits = [('half the He variance', 1 / n), ('He, Var = 2/n', 2 / n),
         ('double the He variance', 4 / n)]
for name, var in inits:
    std = np.sqrt(var)
    h = x0
    for layer in range(30):
        h = np.maximum(h @ (rng.normal(size=(n, n)) * std), 0)
    print(f'{name:23s} mean square after 30 layers: {np.mean(h ** 2):.3e}')
```

Halving or doubling the weight variance changes the signal by a factor of 2 per layer, so 30 layers give 2<sup>±30</sup> ≈ 10<sup>±9</sup>, while He initialisation keeps it of order 1. A network with that many layers simply cannot be trained from the wrong scale.

## 5.6 Practical lessons

- With the matching loss, the gradient at the pre-activation is always prediction minus target: (ŷ − y), (p − y), (**p** − **y**).
- Back-propagation: gradient wrt weights = δ × input<sup>T</sup>; gradient wrt inputs = **W**<sup>T</sup> δ; through an activation, multiply element-wise by its derivative.
- Compute softmax and cross-entropy in log space.
- Gradient-check every hand-written backward pass with central differences and relative error.

# Chapter 6: Optimisation
%Convexity, gradient descent and its step size, momentum, Adam, Newton and constraints

## 6.1 Convexity

A function is **convex** if the chord between any two points lies on or above the graph: f(t**a** + (1 − t)**b**) ≤ t f(**a**) + (1 − t) f(**b**) for t ∈ [0, 1]. Equivalent tests for smooth functions: f lies above every tangent plane, or the Hessian is PSD everywhere. **Every local minimum of a convex function is a global minimum**, so gradient descent cannot get stuck.

| Convex | Not convex |
|---|---|
| Squared error and logistic loss in **w** for linear models | Any neural network loss in its weights |
| Norms ‖**w**‖, ‖**w**‖² (so L1 and L2 penalties) | sin x, x³, products of parameters (matrix factorisation) |
| Log-sum-exp, max of convex functions, sums of convex functions | Losses with symmetries (permuting hidden units gives equal minima) |

**Derivation (logistic loss is convex).** The Hessian of the mean logistic loss is (1/n) Σ p<sub>i</sub>(1 − p<sub>i</sub>) **x**<sub>i</sub>**x**<sub>i</sub><sup>T</sup>. Each term is a non-negative weight times an outer product **xx**<sup>T</sup>, which is PSD, and a sum of PSD matrices is PSD.

```python run Testing convexity: Hessian eigenvalues and random chord checks
import numpy as np
sig = lambda z: 1 / (1 + np.exp(-z))
rng = np.random.default_rng(14)
X = rng.normal(size=(100, 3)); y = (rng.random(100) < 0.5).astype(float)
def logistic(w):
    p = sig(X @ w)
    return -np.mean(y * np.log(p) + (1 - y) * np.log(1 - p))
def hess(w):
    p = sig(X @ w)
    return (X.T * (p * (1 - p))) @ X / len(y)
mins = [np.linalg.eigvalsh(hess(rng.normal(size=3) * 3)).min() for _ in range(1000)]
print(f'logistic loss: smallest Hessian eigenvalue over 1,000 points: {min(mins):.4f}')
def chord_violations(f, dim, trials=20_000):
    bad = 0
    for _ in range(trials):
        a, b, t = rng.normal(size=dim) * 3, rng.normal(size=dim) * 3, rng.random()
        bad += f(t * a + (1 - t) * b) > t * f(a) + (1 - t) * f(b) + 1e-12
    return bad
print('chord violations, logistic loss:', chord_violations(logistic, 3))
net = lambda w: np.mean((np.tanh(X[:, :1] * w[0]) * w[1] - y) ** 2)  # tiny network
print('chord violations, one-hidden-unit network:', chord_violations(net, 2))
```

## 6.2 Gradient descent and the step-size limit

Gradient descent updates **w** ← **w** − η∇L(**w**). To see what η must be, take the quadratic L(**w**) = ½**w**<sup>T</sup>**Aw** with **A** symmetric positive definite (every smooth loss looks like this near a minimum, with **A** = the Hessian).

**Derivation.** ∇L = **Aw**, so **w**<sub>t+1</sub> = (**I** − η**A**)**w**<sub>t</sub>. In the eigenvector basis of **A**, each coordinate evolves independently: c<sub>t+1</sub> = (1 − ηλ<sub>i</sub>)c<sub>t</sub>. It shrinks only if \|1 − ηλ<sub>i</sub>\| < 1, that is 0 < η < 2/λ<sub>i</sub>. All coordinates must shrink, so

**η < 2/λ<sub>max</sub>.**

The slowest coordinate shrinks by \|1 − ηλ<sub>min</sub>\| per step. With the best choice η = 2/(λ<sub>max</sub> + λ<sub>min</sub>), the rate is (κ − 1)/(κ + 1) where κ = λ<sub>max</sub>/λ<sub>min</sub> is the condition number. Ill-conditioned problems (long, narrow valleys) converge slowly, which is why feature standardisation helps so much.

```python run The 2 / lambda_max limit, exactly as derived
import numpy as np
A = np.diag([10.0, 1.0])                              # lambda_max 10, lambda_min 1
for eta in (0.05, 0.15, 2 / 11, 0.199, 0.201):
    w = np.array([1.0, 1.0])
    for _ in range(100):
        w = w - eta * A @ w
    print(f'eta {eta:.4f}: |w| after 100 steps = {np.linalg.norm(w):.3e}')
kappa = 10
print(f'optimal rate (kappa-1)/(kappa+1) = {(kappa - 1) / (kappa + 1):.4f}, '
      f'predicted |w_100| ~ {((kappa - 1) / (kappa + 1)) ** 100 * np.sqrt(2):.3e}')
```

Just below 2/10 = 0.2 the iteration still converges (slowly, with oscillation in the steep direction); just above, it grows without bound. The predicted error for the optimal η = 2/11 matches the run.

## 6.3 Momentum

**Heavy-ball momentum** keeps a running velocity: **v** ← β**v** + ∇L(**w**), **w** ← **w** − η**v**. In a narrow valley the gradient components across the valley alternate in sign and cancel in **v**, while the components along the valley add up. For quadratics the theory says the best tuned momentum improves the rate from (κ − 1)/(κ + 1) to (√κ − 1)/(√κ + 1), with η = 4/(√λ<sub>max</sub> + √λ<sub>min</sub>)² and β = ((√κ − 1)/(√κ + 1))²: for κ = 100 the error then shrinks by about 0.82 per step instead of about 0.98.

```python run Gradient descent versus tuned momentum on a condition-100 quadratic
import numpy as np
lams = np.array([100.0, 1.0]); kappa = 100
f = lambda w: 0.5 * np.sum(lams * w ** 2)
def run(eta, beta, steps=200):
    w, v = np.array([1.0, 1.0]), np.zeros(2)
    for _ in range(steps):
        v = beta * v + lams * w
        w = w - eta * v
    return f(w)
eta_gd = 2 / (lams.max() + lams.min())
eta_m = 4 / (np.sqrt(lams.max()) + np.sqrt(lams.min())) ** 2
beta = ((np.sqrt(kappa) - 1) / (np.sqrt(kappa) + 1)) ** 2
print(f'gradient descent, eta {eta_gd:.4f}: loss after 200 steps {run(eta_gd, 0):.3e}')
print(f'momentum, eta {eta_m:.4f}, beta {beta:.4f}: '
      f'loss after 200 steps {run(eta_m, beta):.3e}')
```

## 6.4 Adaptive methods: AdaGrad, RMSProp and Adam

Instead of one global η, adaptive methods scale each coordinate by an estimate of its gradient magnitude. **Adam** keeps exponential averages of the gradient (**m**) and of its square (**s**):

**m** ← β<sub>1</sub>**m** + (1 − β<sub>1</sub>)**g**, **s** ← β<sub>2</sub>**s** + (1 − β<sub>2</sub>)**g**², **w** ← **w** − η m̂ / (√ŝ + ε),

with **bias correction** m̂ = **m**/(1 − β<sub>1</sub><sup>t</sup>) and ŝ = **s**/(1 − β<sub>2</sub><sup>t</sup>). Defaults: β<sub>1</sub> = 0.9, β<sub>2</sub> = 0.999, ε = 10<sup>−8</sup>.

**Derivation of the bias correction.** Starting from **m**<sub>0</sub> = **0**, unrolling gives **m**<sub>t</sub> = (1 − β)Σ<sub>k=1..t</sub> β<sup>t−k</sup>**g**<sub>k</sub>. If the gradients have a constant mean **μ**, then E[**m**<sub>t</sub>] = (1 − β)(1 + β + … + β<sup>t−1</sup>)**μ** = (1 − β<sup>t</sup>)**μ**, a geometric series. Dividing by 1 − β<sup>t</sup> removes the bias towards zero, which matters most in the first steps.

Because each step is roughly η times m̂/√ŝ, a ratio of order 1, the step size in each coordinate is about η regardless of the gradient's scale. This makes Adam robust on badly scaled problems.

```python run Adam bias correction, and robustness to badly scaled coordinates
import numpy as np
rng = np.random.default_rng(15)
beta = 0.9
m = 0.0
for t in range(1, 6):
    g = 2.0 + rng.normal() * 0.01                     # gradients with mean 2
    m = beta * m + (1 - beta) * g
    print(f't = {t}: raw m = {m:.4f}, bias-corrected m = {m / (1 - beta ** t):.4f}')
scales = np.array([1000.0, 1.0, 0.001])               # three very different curvatures
f = lambda w: 0.5 * np.sum(scales * (w - 1) ** 2)
def adam(steps=3000, eta=0.01, b1=0.9, b2=0.999, eps=1e-8):
    w, m, s = np.zeros(3), np.zeros(3), np.zeros(3)
    for t in range(1, steps + 1):
        g = scales * (w - 1)
        m = b1 * m + (1 - b1) * g; s = b2 * s + (1 - b2) * g ** 2
        w = w - eta * (m / (1 - b1 ** t)) / (np.sqrt(s / (1 - b2 ** t)) + eps)
    return w
def gd(steps=3000):
    w = np.zeros(3)
    for _ in range(steps):
        w = w - (1.9 / scales.max()) * scales * (w - 1)  # largest stable step
    return w
print('target w = [1, 1, 1]')
print('gradient descent after 3,000 steps:', np.round(gd(), 4))
print('Adam after 3,000 steps:            ', np.round(adam(), 4))
```

Gradient descent must use a step small enough for the steepest coordinate (curvature 1000), so the flattest coordinate (curvature 0.001) barely moves. Adam takes steps of about η in every coordinate and reaches the target in all three.

> NOTE: Adam is not always better. On many vision tasks well-tuned SGD with momentum generalises slightly better, and **AdamW** (weight decay applied directly to the weights, not through the gradient) is the standard choice for transformers.

## 6.5 Newton's method

Minimise the second-order Taylor model f(**w** + **h**) ≈ f + **g**<sup>T</sup>**h** + ½**h**<sup>T</sup>**Hh**. Setting its gradient **g** + **Hh** to zero gives the **Newton step** **h** = −**H**<sup>−1</sup>**g**. On a quadratic it lands on the minimum in **one** step regardless of conditioning; near a minimum of a smooth function it converges **quadratically** (the number of correct digits roughly doubles each step). The cost is forming and solving with the d × d Hessian, O(d³) per step, which is impossible for millions of parameters. Quasi-Newton methods (L-BFGS) approximate **H**<sup>−1</sup> from recent gradients; logistic regression solvers commonly use Newton's method (as IRLS) or L-BFGS.

```python run Newton's method on logistic regression: digits double each step
import numpy as np
sig = lambda z: 1 / (1 + np.exp(-z))
rng = np.random.default_rng(16)
X = np.c_[np.ones(400), rng.normal(size=(400, 2))]
y = (rng.random(400) < sig(X @ np.array([-0.5, 1.5, -2.0]))).astype(float)
def grad_hess(w):
    p = sig(X @ w)
    return X.T @ (p - y) / len(y), (X.T * (p * (1 - p))) @ X / len(y)
w = np.zeros(3)
for it in range(1, 8):
    g, H = grad_hess(w)
    w = w - np.linalg.solve(H, g)
    print(f'Newton step {it}: |gradient| = {np.linalg.norm(grad_hess(w)[0]):.2e}')
print('estimate:', np.round(w, 4), '(true [-0.5, 1.5, -2.0])')
w_gd = np.zeros(3)
for it in range(1, 2001):
    w_gd -= 1.0 * grad_hess(w_gd)[0]
    if it in (10, 100, 2000):
        gnorm = np.linalg.norm(grad_hess(w_gd)[0])
        print(f'gradient descent, {it:5,} steps: |gradient| = {gnorm:.2e}')
```

From step 3 the gradient norm goes 10<sup>−3</sup>, 10<sup>−5</sup>, 10<sup>−9</sup>, 10<sup>−17</sup>: the exponent doubles, which is quadratic convergence, and six steps reach machine precision. Gradient descent needs about 100 steps for 10<sup>−4</sup> and far more for full precision. The estimate differs from the true weights only because 400 samples carry sampling error (Chapter 9); both methods find the same maximum-likelihood estimate.

## 6.6 Stochastic gradient descent

With n examples, the full gradient (1/n)Σ∇ℓ<sub>i</sub> costs n evaluations. A mini-batch of size B gives an **unbiased** estimate (its expectation is the full gradient) whose variance falls like 1/B. SGD trades exactness for many more updates per second, and the noise helps escape saddle points. Because the noise does not vanish at the optimum, SGD with a constant η hovers around the minimum in a region whose size is proportional to η; **learning-rate decay** shrinks that region.

```python run Mini-batch gradients are unbiased with variance falling as 1/B
import numpy as np
rng = np.random.default_rng(17)
n = 10_000
X = rng.normal(size=(n, 2)); y = X @ np.array([2.0, -1.0]) + rng.normal(size=n)
w = np.zeros(2)
full = 2 * X.T @ (X @ w - y) / n
for B in (10, 100, 1000):
    est = []
    for _ in range(3000):
        idx = rng.integers(0, n, B)
        est.append(2 * X[idx].T @ (X[idx] @ w - y[idx]) / B)
    est = np.array(est)
    print(f'B = {B:4d}: mean {np.round(est.mean(0), 3)} (full {np.round(full, 3)}), '
          f'variance of component 1 {est[:, 0].var():.4f}')
```

## 6.7 Constrained optimisation: Lagrange multipliers

To optimise f(**x**) subject to g(**x**) = 0: at the optimum, moving along the constraint surface cannot change f to first order, so ∇f is perpendicular to the surface, as is ∇g. Hence ∇f = λ∇g for some scalar λ (the **Lagrange multiplier**). Equivalently, find stationary points of L(**x**, λ) = f(**x**) − λg(**x**).

**Example (maximum entropy).** Maximise H(**p**) = −Σp<sub>i</sub> ln p<sub>i</sub> subject to Σp<sub>i</sub> = 1. Then ∂L/∂p<sub>i</sub> = −ln p<sub>i</sub> − 1 − λ = 0, so every p<sub>i</sub> = e<sup>−1−λ</sup> is the same constant: the **uniform distribution** has maximum entropy, ln K for K outcomes.

**Inequality constraints** (g(**x**) ≤ 0) use the **KKT conditions**: the same stationarity, plus λ ≥ 0 and **complementary slackness** λg(**x**) = 0 (a constraint either binds or has a zero multiplier). Support vector machines are derived exactly this way; the support vectors are the points with non-zero multipliers.

```python run Lagrange: maximise xy on x + 2y = 10, and maximum entropy over 4 outcomes
import numpy as np
from scipy.optimize import minimize
# grad(xy) = (y, x) = lambda (1, 2)  =>  y = lambda, x = 2 lambda;  2 lambda + 2 lambda = 10
lam = 2.5
print(f'by hand: x = {2 * lam}, y = {lam}, xy = {2 * lam * lam}')
xs = np.linspace(0, 10, 100_001)
vals = xs * (10 - xs) / 2
print(f'brute force on the line: x = {xs[np.argmax(vals)]:.4f}, xy = {vals.max():.4f}')
negH = lambda p: np.sum(p * np.log(p))
res = minimize(negH, x0=np.array([0.7, 0.1, 0.1, 0.1]), bounds=[(1e-9, 1)] * 4,
               constraints={'type': 'eq', 'fun': lambda p: p.sum() - 1})
print('max-entropy distribution:', np.round(res.x, 4),
      f'entropy {-res.fun:.4f}, ln 4 = {np.log(4):.4f}')
```

## 6.8 Practical lessons

- Convex problems: any local minimum is global. Linear and logistic regression are convex; neural networks are not.
- Gradient descent needs η < 2/λ<sub>max</sub>; its speed depends on the condition number, so standardise features.
- Momentum damps oscillation across valleys; Adam rescales per coordinate and corrects its start-up bias.
- Newton converges in very few steps but costs O(d³) per step; SGD is noisy but cheap and unbiased.
- Constraints: ∇f = λ∇g; KKT adds λ ≥ 0 and complementary slackness.
