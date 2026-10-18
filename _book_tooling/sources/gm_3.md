# Chapter 5: Vector Spaces and Linear Systems
%Subspaces, independence, basis and dimension, rank and nullity, Gaussian elimination and determinants

## 5.1 Vector spaces and subspaces

A **subspace** of ℝⁿ is a non-empty set closed under addition and scalar multiplication. Every subspace contains the zero vector, so a quick test for "not a subspace" is that 0 is missing.

| Set in ℝ³ | Subspace? | Reason |
|---|---|---|
| {x : x₁ + x₂ + x₃ = 0} | Yes | A plane through the origin |
| {x : x₁ + x₂ + x₃ = 1} | No | Does not contain 0 |
| {x : x₁ x₂ = 0} | No | (1, 0, 0) + (0, 1, 0) leaves the set |
| {x : x₁ ≥ 0} | No | Not closed under multiplication by −1 |
| Span of any set of vectors | Yes | The smallest subspace containing them |
| The null space {x : Ax = 0} | Yes | Solutions of a homogeneous system |
| {x : ‖x‖ ≤ 1} | No | Not closed under scaling by 2 |

Vectors v₁, …, vₖ are **linearly independent** if c₁v₁ + … + cₖvₖ = 0 forces every cᵢ = 0. A **basis** is an independent spanning set, and every basis of a space has the same size, its **dimension**. More than n vectors in ℝⁿ are always dependent.

**Orthonormal vectors are independent.** If the vᵢ are orthonormal and Σ cᵢvᵢ = 0, taking the dot product with vⱼ gives cⱼ = 0. The reverse fails: (1, 0) and (1, 1) are independent but not orthogonal. ℝⁿ has infinitely many orthonormal bases (rotate any one of them).

### Worked example: geometry of a subspace

*S₁ = {x ∈ ℝ³ : ‖x‖² ≤ 25} and S₂ is any two-dimensional subspace of ℝ³. Find the area of S₁ ∩ S₂. (MCQ)*

A two-dimensional subspace is a plane through the origin, the centre of the ball. It cuts the ball in a disc of radius 5, so the area is 25π whatever the plane.

## 5.2 Rank, nullity and systems of equations

The **rank** of A (m × n) is the dimension of its column space, which equals the dimension of its row space and the number of pivots after elimination.

| Result | Statement |
|---|---|
| Rank–nullity | rank(A) + nullity(A) = n (number of columns) |
| Bounds | rank(A) ≤ min(m, n); rank(AB) ≤ min(rank A, rank B) |
| Gram matrix | rank(AᵀA) = rank(AAᵀ) = rank(A) |
| Outer product | uvᵀ (u, v non-zero) has rank 1 |
| Invertible n × n matrix | rank n ⟺ det ≠ 0 ⟺ only solution of Ax = 0 is 0 ⟺ 0 is not an eigenvalue |

**Solutions of Ax = b** (A is m × n, [A | b] the augmented matrix):

| Condition | Solutions |
|---|---|
| rank(A) < rank([A \| b]) | None (inconsistent) |
| rank(A) = rank([A \| b]) = n | Exactly one |
| rank(A) = rank([A \| b]) < n | Infinitely many, with n − rank free variables |

A homogeneous system Ax = 0 always has the solution x = 0, so it has either one solution or infinitely many, never none or exactly two.

### Worked example: a null space from a polynomial in A

*Every row of A ∈ ℝⁿˣⁿ sums to 1, and B = A² − 3A + 2I. How many solutions does Bx = 0 have? (MCQ)*

Rows summing to 1 means Aj = j for the all-ones vector j = (1, 1, …, 1)ᵀ. Then Bj = j − 3·j + 2·j = 0, so j is a non-zero solution and every multiple of it is too: infinitely many solutions. In general, if p(1) = 0 for the polynomial p, then p(A) is singular.

## 5.3 Gaussian elimination and LU

Elimination uses row operations (swap two rows, scale a row by a non-zero number, add a multiple of one row to another) to reach row echelon form. It costs about (2/3)n³ operations for an n × n system, then back substitution costs about n². A system that is **already upper triangular** needs only back substitution, so O(n²) work.

**LU decomposition.** Elimination without row swaps writes A = LU, with L lower triangular (ones on the diagonal, the multipliers below) and U upper triangular. Solving Ax = b then takes two triangular solves: Ly = b, then Ux = y. With row swaps, PA = LU for a permutation matrix P. A factorisation pays off when many systems share the same A.

### Worked example: an LU factorisation

A = [[2, 1, 1], [4, 3, 3], [8, 7, 9]]. Subtract 2 × row 1 from row 2 and 4 × row 1 from row 3: rows become (0, 1, 1) and (0, 3, 5). Subtract 3 × the new row 2 from row 3: (0, 0, 2). So U = [[2, 1, 1], [0, 1, 1], [0, 0, 2]] and L = [[1, 0, 0], [2, 1, 0], [4, 3, 1]]. det A = det U = 2 × 1 × 2 = 4.

```python run LU by hand-coded elimination, checked with NumPy
import numpy as np

A = np.array([[2., 1, 1], [4, 3, 3], [8, 7, 9]])
U, L = A.copy(), np.eye(3)
for j in range(3):
    for i in range(j + 1, 3):
        L[i, j] = U[i, j] / U[j, j]
        U[i] -= L[i, j] * U[j]
print('L =\n', L, '\nU =\n', U)
print('L @ U equals A:', np.allclose(L @ U, A), '| det A =', round(np.linalg.det(A), 6))
```

## 5.4 Determinants

| Property | Statement |
|---|---|
| Product | det(AB) = det A × det B |
| Transpose | det Aᵀ = det A |
| Inverse | det A⁻¹ = 1/det A |
| Scaling | det(cA) = cⁿ det A for n × n A |
| Triangular matrix | Product of the diagonal entries |
| Row operations | Swap: sign flips; scale a row by c: det × c; add a multiple of a row: unchanged |
| Eigenvalues | det A = product of eigenvalues |
| Block triangular | det [[A, B], [0, D]] = det A × det D |

## 5.5 Traps

| Trap | Correct thinking |
|---|---|
| "Linearly independent implies orthonormal" | Only the reverse is true |
| det(A + B) = det A + det B | No such rule; only products multiply |
| det(2A) = 2 det A | det(2A) = 2ⁿ det A |
| Rank–nullity with the number of rows | It uses the number of columns |
| A homogeneous system with "no solution" | Ax = 0 always has x = 0 |
| Testing a subspace without checking 0 | A set missing the origin is never a subspace |

# Chapter 6: Eigenvalues, Special Matrices and Decompositions
%Eigenvalues and eigenvectors, symmetric matrices and quadratic forms, projection, orthogonal and idempotent matrices, SVD

## 6.1 Eigenvalues and eigenvectors

λ is an eigenvalue of A with eigenvector v ≠ 0 when Av = λv; the eigenvalues are the roots of det(A − λI) = 0.

| Fact | Statement |
|---|---|
| Trace and determinant | Σ λᵢ = trace(A), Π λᵢ = det A |
| Powers and polynomials | Aᵏ has eigenvalues λᵏ; p(A) has eigenvalues p(λ) with the same eigenvectors |
| Inverse | A⁻¹ has eigenvalues 1/λ |
| Shift | A + cI has eigenvalues λ + c |
| Triangular matrix | Eigenvalues are the diagonal entries |
| Transpose | A and Aᵀ have the same eigenvalues |
| Singular matrix | 0 is an eigenvalue |
| 2 × 2 shortcut | λ² − (trace)λ + det = 0 |
| Distinct eigenvalues | Eigenvectors are independent, so A is diagonalisable: A = PDP⁻¹ |

**Polynomial identities restrict eigenvalues.** If A³ = A, every eigenvalue satisfies λ³ = λ, so λ ∈ {−1, 0, 1}. Such an A need not be invertible (A = 0 works) or have determinant 0 (A = I works). It is always true that A and A² have the same rank. A has a full set of eigenvectors here (its minimal polynomial divides λ³ − λ, which has distinct roots), and A² has the same eigenvectors with every non-zero eigenvalue squared to 1, so the number of non-zero eigenvalues, and hence the rank, is unchanged.

### Worked example: a rotation block

*For B = [[1, 0, 0], [0, cos θ, −sin θ], [0, sin θ, cos θ]], find all θ in [−π, π] for which the sum of the eigenvalues equals 2. (MCQ)*

The trace is 1 + 2cos θ, so 1 + 2cos θ = 2 gives cos θ = 1/2, that is θ = ±π/3. (The eigenvalues are 1 and e^(±iθ); their sum is the trace, so no complex arithmetic is needed.)

```python run Eigenvalue facts checked numerically
import numpy as np

th = np.pi / 3
B = np.array([[1, 0, 0], [0, np.cos(th), -np.sin(th)], [0, np.sin(th), np.cos(th)]])
ev = np.linalg.eigvals(B)
print('eigenvalues', np.round(ev, 4), ' sum', round(ev.sum().real, 6))
A = np.array([[0., 1], [1, 0]])          # A^3 = A
print('A^3 == A:', np.allclose(A @ A @ A, A), ' eigenvalues', np.linalg.eigvals(A),
      ' rank A', np.linalg.matrix_rank(A), ' rank A^2', np.linalg.matrix_rank(A @ A))
```

## 6.2 Symmetric matrices and quadratic forms

A real symmetric matrix (A = Aᵀ) has real eigenvalues and orthonormal eigenvectors: A = QΛQᵀ with Q orthogonal (the **spectral theorem**).

A **quadratic form** is q(x) = xᵀAx with A symmetric. Classify it by the eigenvalues of A:

| Eigenvalues of A | Form |
|---|---|
| All > 0 | Positive definite: q(x) > 0 for x ≠ 0 |
| All ≥ 0 | Positive semidefinite |
| Mixed signs | Indefinite |
| All < 0 | Negative definite |

**Rayleigh quotient.** For unit vectors x, the maximum of xᵀAx is the largest eigenvalue and the minimum is the smallest. This is exactly why PCA's first direction is the top eigenvector of the covariance matrix: it maximises the variance uᵀΣu over unit vectors u.

**Gram matrices are positive semidefinite.** For any vectors x₁, …, xₙ, the matrix G with Gᵢⱼ = xᵢᵀxⱼ equals XᵀX, and zᵀGz = ‖Xz‖² ≥ 0. If the vectors are independent, Xz ≠ 0 for z ≠ 0, so G is positive definite and invertible.

## 6.3 Special matrices

| Matrix | Definition | Key properties |
|---|---|---|
| Orthogonal Q | QᵀQ = I | Preserves lengths ‖Qx‖ = ‖x‖; det = ±1; eigenvalues have \|λ\| = 1 (real ones are ±1) |
| Idempotent P | P² = P | Eigenvalues 0 or 1; rank = trace |
| Orthogonal projection P | P² = P and P = Pᵀ | Projects onto its column space; I − P projects onto the orthogonal complement |
| Projection onto the columns of A | P = A(AᵀA)⁻¹Aᵀ | Gives the least-squares fit |
| Projection onto a unit vector u | P = uuᵀ | Rank 1, eigenvalues 1, 0, …, 0 |
| Sum of outer products of orthonormal u₁, …, uₖ | P = Σ uᵢuᵢᵀ | Orthogonal projection of rank k; singular values equal eigenvalues (0 or 1) |
| Centring matrix | C = I − (1/n)jjᵀ, with j the all-ones vector | Symmetric idempotent of rank n − 1; Cx subtracts the mean from each entry |
| Rank-one update | A = I + c uuᵀ with ‖u‖ = 1 | Eigenvalues 1 + c (along u) and 1 (n − 1 times) |

A matrix that preserves every length must be orthogonal, so it has full rank. But its eigenvalues need not be ±1: a rotation by 90° has eigenvalues ±i.

### Worked example: the centring matrix

*For C = I − (1/n)jjᵀ, which are correct? (MSQ) (a) Cᵀ = C (b) C² = C (c) rank(C) = n (d) C is a projection matrix. Also find max xᵀCx over unit vectors x. (NAT)*

C is symmetric and C² = I − (2/n)jjᵀ + (1/n²)j(jᵀj)jᵀ = I − (1/n)jjᵀ = C, so it is an orthogonal projection: (a), (b), (d). Its eigenvalue on j is 0, so its rank is n − 1, not n. The largest eigenvalue is 1, so the maximum of the quadratic form is 1.

### Worked example: I + uuᵀ

*u ∈ ℝⁿ with uᵀu = 1, and A = Iₙ + 3uuᵀ. Find det A and the eigenvalues of A⁻¹. (NAT)*

Au = u + 3u = 4u, and Av = v for every v orthogonal to u. So the eigenvalues are 4 and 1 (n − 1 times), det A = 4, and A⁻¹ has eigenvalues 1/4 and 1, all positive. A is invertible with full rank.

```python run Centring matrix, rank-one update and an outer-product projection
import numpy as np
rng = np.random.default_rng(0)

n = 5
C = np.eye(n) - np.ones((n, n)) / n
print('C symmetric', np.allclose(C, C.T), '| idempotent', np.allclose(C @ C, C),
      '| rank', np.linalg.matrix_rank(C),
      '| max eigenvalue', round(max(np.linalg.eigvalsh(C)), 6))

u = rng.normal(size=n); u /= np.linalg.norm(u)
A = np.eye(n) + 3 * np.outer(u, u)
print('det', round(np.linalg.det(A), 6), '| eigenvalues', np.round(np.linalg.eigvalsh(A), 6))

Q, _ = np.linalg.qr(rng.normal(size=(8, 3)))     # 3 orthonormal vectors in R^8
P = Q @ Q.T
print('P^2 = P', np.allclose(P @ P, P), '| singular values',
      np.round(np.linalg.svd(P, compute_uv=False), 6))
```

## 6.4 Partitioned matrices

Block matrices multiply like ordinary matrices when the blocks conform. Two results recur:

- **Block triangular:** det [[A, B], [0, D]] = det A × det D, and its eigenvalues are those of A together with those of D.
- **Schur complement:** for M = [[A, B], [C, D]] with A invertible, det M = det A × det(D − CA⁻¹B).

## 6.5 Projections and least squares

When Ax = b has no solution, the **least-squares** solution minimises ‖Ax − b‖² and satisfies the **normal equations** AᵀAx = Aᵀb. The fitted vector Ax̂ = Pb is the projection of b onto the column space of A.

For a line through the origin, y = wx, the normal equation gives w = Σ xᵢyᵢ / Σ xᵢ².

### Worked example: a slope through the origin

*Fit y = wx to the points (1, 2), (2, 3), (3, 7) by least squares. (NAT, three decimal places)*

Σ xy = 2 + 6 + 21 = 29 and Σ x² = 1 + 4 + 9 = 14, so w = 29/14 ≈ 2.071.

## 6.6 Singular value decomposition

Every real m × n matrix factors as A = UΣVᵀ, with U (m × m) and V (n × n) orthogonal and Σ diagonal with non-negative **singular values** σ₁ ≥ σ₂ ≥ … ≥ 0.

| Fact | Statement |
|---|---|
| Relation to eigenvalues | σᵢ² are the eigenvalues of AᵀA (and of AAᵀ) |
| Rank | The number of non-zero singular values |
| Symmetric positive semidefinite A | Singular values equal eigenvalues |
| Symmetric A in general | Singular values are the absolute values of the eigenvalues |
| Best rank-k approximation (Eckart–Young) | Keep the k largest singular values; the error in spectral norm is σₖ₊₁ |
| Norms | ‖A‖₂ = σ₁; the Frobenius norm is √(Σ σᵢ²) |

### Worked example: SVD of a small matrix

A = [[3, 0], [4, 5]]. AᵀA = [[25, 20], [20, 25]], whose eigenvalues are 45 and 5. So the singular values are √45 ≈ 6.708 and √5 ≈ 2.236. Check: σ₁σ₂ = √225 = 15 = |det A|.

```python run Least squares and SVD checks
import numpy as np

x = np.array([1., 2, 3]); y = np.array([2., 3, 7])
print('w =', round((x @ y) / (x @ x), 4),
      ' lstsq:', np.linalg.lstsq(x[:, None], y, rcond=None)[0])
A = np.array([[3., 0], [4, 5]])
s = np.linalg.svd(A, compute_uv=False)
print('singular values', np.round(s, 4), ' product', round(s.prod(), 6),
      ' sqrt eig(AtA)', np.round(np.sqrt(np.linalg.eigvalsh(A.T @ A))[::-1], 4))
```

## 6.7 Traps

| Trap | Correct thinking |
|---|---|
| Eigenvalues of A + B are sums of eigenvalues | Only if A and B share eigenvectors |
| Every matrix is diagonalisable | [[0, 1], [0, 0]] is not; distinct eigenvalues or symmetry guarantee it |
| A³ = A implies A invertible, or det A = 0 | Both can fail; only rank(A) = rank(A²) always holds |
| Singular values can be negative | They are always ≥ 0 |
| Projection matrices must be symmetric | Idempotent alone is an oblique projection; orthogonal projections are also symmetric |
| Length-preserving matrices have real eigenvalues | A rotation has complex eigenvalues of modulus 1 |
