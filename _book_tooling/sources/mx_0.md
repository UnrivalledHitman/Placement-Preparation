# How to use this guide
%The mathematics behind machine learning, derived step by step and checked numerically

Machine learning is applied mathematics: a model is a function, training is optimisation, uncertainty is probability, and evaluation is statistics. The AI/ML guide in this repository summarises the maths in a few pages so that you can start building quickly. This book is the full treatment: every result you will meet in ML courses, papers and interviews is **derived**, and every derivation is **checked numerically** by a short NumPy or SciPy program whose output is shown. If a formula and a computation ever disagreed, the computation would expose the mistake; that is the habit this book trains.

## How to read the derivations

Each section follows the same pattern:

1. **Idea**: what the concept means geometrically or intuitively.
2. **Derivation**: the result, step by step, with nothing skipped that you cannot fill in with school algebra.
3. **Check**: a program that computes the same quantity two independent ways (formula versus brute force, simulation, finite differences, or a library) and prints both.

Read the derivation with a pen; then predict the program's output before reading it.

## Notation

| Symbol | Meaning |
|---|---|
| *x*, *y* (italic) | Scalars |
| **x**, **w** (bold lower case) | Column vectors; **x**<sub>i</sub> is the i-th component |
| **A**, **X** (bold upper case) | Matrices; A<sub>ij</sub> is row i, column j |
| **A**<sup>T</sup>, **A**<sup>−1</sup> | Transpose, inverse |
| ‖**x**‖ | Euclidean (L2) norm |
| ∇f, **H** | Gradient (vector of partial derivatives), Hessian (matrix of second derivatives) |
| E[X], Var(X), Cov(X, Y) | Expectation, variance, covariance |
| P(A), P(A \| B) | Probability, conditional probability |
| ~ | "is distributed as": X ~ N(μ, σ²) |
| θ̂ | An estimate of a parameter θ |

## How the chapters connect

| Part | Chapters | Used in ML for |
|---|---|---|
| Linear algebra | 1–3: vectors, matrices, eigenvalues, SVD, PCA | Data as matrices, embeddings, similarity, dimensionality reduction, every neural network layer |
| Calculus | 4–6: derivatives, gradients, Jacobians, Hessians, back-propagation, optimisation | Training any model |
| Probability | 7–8: rules, random variables, distributions, limit theorems | Uncertainty, generative models, noise |
| Statistics | 9–10: estimation (MLE, MAP, Bayesian), inference (intervals, tests, bootstrap) | Loss functions, evaluation, A/B tests |
| Information theory | 11: entropy, cross-entropy, KL divergence | Classification losses, VAEs, distillation, LLM training |
| Putting it together | 12: linear regression end to end, bias–variance | Understanding every model |
| Reference | 13: formula sheet | Revision |

## How to study this book

1. Read one section a day with pen and paper; reproduce each derivation without looking.
2. Run each program and change the inputs: a different matrix, a different distribution, a smaller sample.
3. Solve the matching part of the **Mathematics for ML Practice Book**: every numerical answer there is checked by a program too.
4. Then reread the maths parts of the AI/ML guide; they will now feel like summaries.

# Chapter 1: Vectors
%Operations, norms, dot products and angles, projections, and linear independence

## 1.1 Vectors as data

A vector is an ordered list of numbers: a point in space, or an arrow from the origin. In ML, almost everything becomes a vector: a house as (area, rooms, age), a word as a 768-dimensional embedding, an image as its pixel values. Operations on vectors become operations on data.

| Operation | Definition | Geometry |
|---|---|---|
| Addition | (**x** + **y**)<sub>i</sub> = x<sub>i</sub> + y<sub>i</sub> | Place arrows head to tail |
| Scalar multiplication | (c**x**)<sub>i</sub> = c x<sub>i</sub> | Stretch (c > 1), shrink, flip (c < 0) |
| Dot product | **x** · **y** = Σ x<sub>i</sub> y<sub>i</sub> = **x**<sup>T</sup>**y** | ‖**x**‖ ‖**y**‖ cos θ |
| Linear combination | a**x** + b**y** | Any point in the plane they span |

## 1.2 Norms

A norm measures length. The three you will meet constantly:

| Norm | Formula | Unit ball in 2-D | Used for |
|---|---|---|---|
| L1 | ‖**x**‖<sub>1</sub> = Σ \|x<sub>i</sub>\| | Diamond | Lasso regularisation (encourages zeros), Manhattan distance |
| L2 | ‖**x**‖<sub>2</sub> = √(Σ x<sub>i</sub>²) | Circle | Euclidean distance, ridge regularisation, weight decay |
| L∞ | ‖**x**‖<sub>∞</sub> = max \|x<sub>i</sub>\| | Square | Worst-case bounds, adversarial perturbations |

Every norm satisfies three properties: ‖**x**‖ ≥ 0 with equality only for **x** = **0**; ‖c**x**‖ = \|c\| ‖**x**‖; and the **triangle inequality** ‖**x** + **y**‖ ≤ ‖**x**‖ + ‖**y**‖.

```python run Norms by definition and by NumPy, and the triangle inequality
import numpy as np
x = np.array([3.0, -4.0, 12.0])
by_hand = {'L1': sum(abs(v) for v in x), 'L2': sum(v * v for v in x) ** 0.5,
           'Linf': max(abs(v) for v in x)}
by_numpy = {'L1': np.linalg.norm(x, 1), 'L2': np.linalg.norm(x),
            'Linf': np.linalg.norm(x, np.inf)}
for k in by_hand:
    print(f'{k:4s} by hand {by_hand[k]:6.2f}   numpy {by_numpy[k]:6.2f}')
rng = np.random.default_rng(0)
ok = all(np.linalg.norm(a + b) <= np.linalg.norm(a) + np.linalg.norm(b) + 1e-12
         for a, b in (rng.normal(size=(2, 5)) for _ in range(10_000)))
print('triangle inequality held for 10,000 random pairs:', ok)
```

## 1.3 The dot product and angles

**Derivation of ‖x‖ ‖y‖ cos θ.** Apply the law of cosines to the triangle with sides **x**, **y** and **x** − **y**: ‖**x** − **y**‖² = ‖**x**‖² + ‖**y**‖² − 2‖**x**‖‖**y**‖ cos θ. Expanding the left side with the dot product, ‖**x** − **y**‖² = (**x** − **y**)·(**x** − **y**) = ‖**x**‖² − 2 **x**·**y** + ‖**y**‖². Comparing the two expressions gives **x**·**y** = ‖**x**‖ ‖**y**‖ cos θ.

Consequences:

| Fact | Meaning |
|---|---|
| **x**·**y** = 0 | Orthogonal (perpendicular): θ = 90° |
| cos θ = **x**·**y** / (‖**x**‖‖**y**‖) | **Cosine similarity**, used to compare embeddings regardless of their length |
| \|**x**·**y**\| ≤ ‖**x**‖‖**y**‖ | **Cauchy–Schwarz** inequality (because \|cos θ\| ≤ 1) |

```python run Cosine similarity and Cauchy-Schwarz, checked
import numpy as np
a = np.array([1.0, 2.0, 2.0])
b = np.array([2.0, 0.0, 1.0])
cos = a @ b / (np.linalg.norm(a) * np.linalg.norm(b))
print(f'a.b = {a @ b}, |a| = {np.linalg.norm(a)}, |b| = {np.linalg.norm(b):.4f}')
print(f'cos(theta) = {cos:.4f}, theta = {np.degrees(np.arccos(cos)):.2f} degrees')
c = np.array([2.0, -1.0, 0.0])
print('a.c =', a @ c, '-> orthogonal')
lhs = np.linalg.norm(a - b) ** 2
rhs = a @ a + b @ b - 2 * np.linalg.norm(a) * np.linalg.norm(b) * cos
print(f'law of cosines: |a-b|^2 = {lhs:.6f}, formula = {rhs:.6f}')
rng = np.random.default_rng(1)
pairs = rng.normal(size=(10_000, 2, 8))
ratio = max(abs(p[0] @ p[1]) / (np.linalg.norm(p[0]) * np.linalg.norm(p[1])) for p in pairs)
print(f'largest |x.y| / (|x||y|) over 10,000 random pairs: {ratio:.4f} (never above 1)')
```

## 1.4 Projections

The **projection** of **y** onto the direction of **x** is the point on the line through **x** closest to **y**.

**Derivation.** Points on the line are c**x**. Minimise f(c) = ‖**y** − c**x**‖² = **y**·**y** − 2c **x**·**y** + c² **x**·**x**. Setting the derivative to zero, −2 **x**·**y** + 2c **x**·**x** = 0, so c = (**x**·**y**) / (**x**·**x**) and

```text
proj_x(y) = ( (x·y) / (x·x) ) x        and the residual  r = y − proj_x(y)  satisfies  r·x = 0
```

The residual is orthogonal to **x**: the error left over is perpendicular to what we projected onto. This single idea is the geometry of **least squares** (Chapter 12): the fitted values are the projection of **y** onto the space spanned by the feature columns.

```python run Projection: formula, orthogonal residual, and brute-force minimum
import numpy as np
x = np.array([2.0, 1.0, -1.0])
y = np.array([3.0, 4.0, 1.0])
c = (x @ y) / (x @ x)
p = c * x
r = y - p
print(f'c = {c:.4f}, projection = {np.round(p, 4)}, residual . x = {r @ x:.2e}')
cs = np.linspace(-5, 5, 200_001)
dist = np.sum((y[None, :] - cs[:, None] * x[None, :]) ** 2, axis=1)
print(f'grid search over c: best c = {cs[np.argmin(dist)]:.4f} (formula {c:.4f})')
```

## 1.5 Linear independence, span and basis

Vectors **v**<sub>1</sub>, …, **v**<sub>k</sub> are **linearly independent** if no one of them is a combination of the others; equivalently, a<sub>1</sub>**v**<sub>1</sub> + … + a<sub>k</sub>**v**<sub>k</sub> = **0** only when all a<sub>i</sub> = 0. Their **span** is the set of all their combinations. A **basis** of a space is an independent set that spans it; every basis of ℝ<sup>n</sup> has exactly *n* vectors, and the number is the **dimension**.

In data terms: if one feature is a combination of others (price in rupees and price in paise, or total = a + b), the feature columns are dependent; the model cannot tell their effects apart, and linear regression has no unique solution (Chapter 2.4).

```python run Detecting dependence with the rank
import numpy as np
v1, v2 = np.array([1.0, 2.0, 0.0]), np.array([0.0, 1.0, 1.0])
v3 = 2 * v1 - 3 * v2                                   # dependent on purpose
v4 = np.array([1.0, 0.0, 0.0])
for name, vs in (('v1, v2, v3', [v1, v2, v3]), ('v1, v2, v4', [v1, v2, v4])):
    M = np.column_stack(vs)
    print(f'{name}: rank {np.linalg.matrix_rank(M)} of {M.shape[1]}, '
          f'determinant {np.linalg.det(M):+.4f}')
coef = np.linalg.lstsq(np.column_stack([v1, v2]), v3, rcond=None)[0]
print('v3 expressed in v1, v2:', np.round(coef, 6))
```

## 1.6 Practical lessons

- L2 measures distance, L1 encourages sparsity, cosine similarity compares directions.
- The dot product is length × length × cos θ; zero means orthogonal.
- Projection gives the closest point on a line, and the residual is orthogonal to it: this is least squares in one dimension.
- Dependent features make a model's coefficients non-unique; the rank reveals it.

# Chapter 2: Matrices and Linear Systems
%Four ways to read a matrix product, inverses and determinants, rank, solving Ax = b, and conditioning

## 2.1 What a matrix does

An m × n matrix **A** maps a vector **x** in ℝ<sup>n</sup> to **Ax** in ℝ<sup>m</sup>. Every linear function between vector spaces is a matrix, and every neural network layer is a matrix followed by a non-linearity. The product **Ax** can be read two ways, and both are essential:

| View | Formula | Interpretation |
|---|---|---|
| Rows | (**Ax**)<sub>i</sub> = (row i of **A**) · **x** | Each output is a dot product: a similarity score (a linear layer computes one score per output unit) |
| Columns | **Ax** = x<sub>1</sub>(column 1) + … + x<sub>n</sub>(column n) | The output is a combination of the columns: the reachable outputs are the **column space** |

For a product **AB**, entry (i, j) is row i of **A** dotted with column j of **B**. Matrix multiplication is associative ((**AB**)**C** = **A**(**BC**)) and distributive, but **not commutative**: **AB** ≠ **BA** in general. Also (**AB**)<sup>T</sup> = **B**<sup>T</sup>**A**<sup>T</sup>.

```python run Rows view, columns view, non-commutativity and the transpose rule
import numpy as np
A = np.array([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]])
x = np.array([10.0, -1.0])
rows = np.array([A[i] @ x for i in range(3)])
cols = x[0] * A[:, 0] + x[1] * A[:, 1]
print('rows view', rows, '| columns view', cols, '| A @ x', A @ x)
B = np.array([[0.0, 1.0], [1.0, 0.0]])
C = np.array([[1.0, 1.0], [0.0, 2.0]])
print('BC == CB?', np.allclose(B @ C, C @ B))
print('(AB)^T == B^T A^T?', np.allclose((A @ B).T, B.T @ A.T))
print('cost of (A B) C vs A (B C) for 1000x10, 10x1000, 1000x10 (multiplications):',
      1000 * 10 * 1000 + 1000 * 1000 * 10, 'vs', 10 * 1000 * 10 + 1000 * 10 * 10)
```

The last line is why the order of evaluation matters in practice: both orders give the same matrix, but one needs 20 million multiplications and the other 200 thousand. Back-propagation exploits exactly this (Chapter 5).

## 2.2 Identity, inverse and determinant

| Concept | Definition | Notes |
|---|---|---|
| Identity **I** | 1 on the diagonal, 0 elsewhere | **IA** = **AI** = **A** |
| Inverse **A**<sup>−1</sup> | **AA**<sup>−1</sup> = **A**<sup>−1</sup>**A** = **I** | Exists only for square matrices with full rank; (**AB**)<sup>−1</sup> = **B**<sup>−1</sup>**A**<sup>−1</sup> |
| Determinant det(**A**) | The factor by which **A** scales areas (2-D) or volumes | det = 0 ⇔ not invertible ⇔ columns dependent; det(**AB**) = det(**A**) det(**B**) |
| 2 × 2 formulas | det [[a, b], [c, d]] = ad − bc; inverse = (1/det) [[d, −b], [−c, a]] | — |

```python run The determinant as area scaling, and the 2x2 inverse formula
import numpy as np
A = np.array([[2.0, 1.0], [1.0, 3.0]])
a, b, c, d = A.ravel()
det = a * d - b * c
inv = np.array([[d, -b], [-c, a]]) / det
print(f'det by formula {det}, numpy {np.linalg.det(A):.6f}')
print('inverse by formula matches numpy:', np.allclose(inv, np.linalg.inv(A)),
      '| A @ inv = I:', np.allclose(A @ inv, np.eye(2)))
rng = np.random.default_rng(2)
pts = rng.uniform(0, 1, size=(400_000, 2))            # the unit square, area 1
img = pts @ A.T                                       # its image under A
box = rng.uniform(img.min(0), img.max(0), size=(400_000, 2))
back = box @ np.linalg.inv(A).T
frac = np.mean(np.all((back >= 0) & (back <= 1), axis=1))
area = frac * np.prod(img.max(0) - img.min(0))
print(f'Monte Carlo area of the transformed unit square: {area:.3f} (det = {det})')
```

The unit square, mapped by **A**, becomes a parallelogram of area \|det **A**\| = 5, which the Monte Carlo estimate confirms. A determinant of 0 would flatten the square onto a line: information is lost, and the map cannot be inverted.

## 2.3 Rank and the four subspaces

The **rank** of **A** is the number of independent columns, which always equals the number of independent rows. For an m × n matrix of rank r:

| Subspace | Dimension | Meaning for **Ax** = **b** |
|---|---|---|
| Column space | r | The **b** that can be reached |
| Null space | n − r | The **x** with **Ax** = **0**: directions the map destroys; if non-trivial, solutions are not unique |
| Row space | r | — |
| Left null space | m − r | — |

The **rank–nullity theorem** says rank + dimension of null space = n.

## 2.4 Solving Ax = b

**Gaussian elimination** turns **A** into an upper-triangular matrix with row operations, then back-substitutes. It costs about (2/3)n³ operations. In code, never compute **A**<sup>−1</sup> to solve a system: `np.linalg.solve` (LU factorisation) is faster and more accurate.

```python run Gaussian elimination by hand versus numpy.linalg.solve
import numpy as np
def gauss(A, b):
    A, b = A.astype(float).copy(), b.astype(float).copy()
    n = len(b)
    for k in range(n):
        p = k + np.argmax(abs(A[k:, k]))                  # partial pivoting
        A[[k, p]], b[[k, p]] = A[[p, k]], b[[p, k]]
        for i in range(k + 1, n):
            f = A[i, k] / A[k, k]
            A[i, k:] -= f * A[k, k:]
            b[i] -= f * b[k]
    x = np.zeros(n)
    for i in range(n - 1, -1, -1):                        # back substitution
        x[i] = (b[i] - A[i, i + 1:] @ x[i + 1:]) / A[i, i]
    return x
A = np.array([[2, 1, -1], [-3, -1, 2], [-2, 1, 2]])
b = np.array([8, -11, -3])
print('by hand:', gauss(A, b), '| numpy:', np.linalg.solve(A, b))
rng = np.random.default_rng(3)
M = rng.normal(size=(50, 50)); v = rng.normal(size=50)
diff = np.max(abs(gauss(M, v) - np.linalg.solve(M, v)))
print(f'random 50x50 system, max difference: {diff:.1e}')
```

## 2.5 Conditioning: when small errors become large

The **condition number** κ(**A**) = ‖**A**‖ ‖**A**<sup>−1</sup>‖ (the ratio of the largest to the smallest singular value, Chapter 3) bounds how much a relative error in **b** can be amplified in **x**. With κ = 10<sup>10</sup>, you lose about 10 of the 16 significant digits of double precision. In ML, nearly collinear features (two almost identical sensors) make κ huge and the regression coefficients wildly unstable; ridge regularisation (Chapter 12) is the cure.

```python run Nearly dependent columns amplify a tiny change in b
import numpy as np
for eps in (1e-1, 1e-4, 1e-8):
    A = np.array([[1.0, 1.0], [1.0, 1.0 + eps]])       # columns almost equal
    b = np.array([2.0, 2.0 + eps])
    x = np.linalg.solve(A, b)
    x2 = np.linalg.solve(A, b + np.array([0.0, 1e-6])) # perturb b by one millionth
    print(f'eps {eps:.0e}: cond {np.linalg.cond(A):9.2e}  x = {np.round(x, 4)}  '
          f'after tiny change x = {np.round(x2, 4)}')
```

## 2.6 Special matrices

| Matrix | Property | Where in ML |
|---|---|---|
| Symmetric (**A** = **A**<sup>T</sup>) | Real eigenvalues, orthogonal eigenvectors | Covariance matrices, Hessians, kernels |
| Orthogonal (**Q**<sup>T</sup>**Q** = **I**) | Preserves lengths and angles; **Q**<sup>−1</sup> = **Q**<sup>T</sup> | Rotations, PCA bases, orthogonal initialisation |
| Diagonal | Scales each coordinate | Feature scaling, eigenvalue matrices |
| Positive definite (**x**<sup>T</sup>**Ax** > 0 for **x** ≠ **0**) | All eigenvalues positive | Covariance of non-degenerate data, Hessians at a minimum |

## 2.7 Practical lessons

- Read **Ax** by rows (scores) and by columns (combinations); multiplication order changes cost, not result.
- The determinant is volume scaling; zero means information is lost.
- Solve systems with `solve`, not `inv`.
- Large condition numbers mean unstable answers; regularise or remove collinear features.
