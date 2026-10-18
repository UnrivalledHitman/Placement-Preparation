## Solutions: Set L2

| Q | Answer | Q | Answer | Q | Answer |
|---|---|---|---|---|---|
| E1 | B | M1 | 2 | H1 | 120 |
| E2 | B | M2 | C | H2 | 162 |
| E3 | D | M3 | B | H3 | A |
| E4 | −8 | M4 | A, B | H4 | A, B, C |
| E5 | B, D | M5 | 59049 | H5 | C, D |
| E6 | 5 | M6 | A | H6 | 0.83 |
| E7 | C | M7 | 2 | H7 | 2 |
| E8 | −3 | M8 | A, C, D | | |
| | | M9 | B | | |

**E1.** A diagonal matrix's eigenvalues are its diagonal entries. **E2.** 1 + 2 + 3 = 6. (B) is correct: the sum of the eigenvalues. **E3.** 3² = 9. **E4.** 2 × (−1) × 4 = −8.

**E5.** Symmetric matrices have real eigenvalues, and a triangular matrix's eigenvalues are its (real) diagonal entries. A rotation is orthogonal with complex eigenvalues, and [[0, 1], [−1, 0]] is a 2 × 2 counterexample.

**E6.** λ² − 7λ + 10 = 0 gives 5 and 2. **E7.** 1/4. **E8.** The determinant: 1 − 4 = −3.

**M1.** The eigenvalues are 0 or 1, and rank 2 means two of them are 1. trace = 2.

**M2.** λ² + 1 = 0 gives ±i: a rotation by 90° has no real eigenvector.

**M3.** The eigenvalues of A² + I are 2, 5 and 10: det = 100. (B) True: (1 + 1)(4 + 1)(9 + 1). (A) False: trace(A²) = 1 + 4 + 9 = 14. (C) False: 0 is not an eigenvalue, so A is invertible. (D) False: 4 is not an eigenvalue.

**M4.** All eigenvalues ≥ 0, one of them 0: positive semidefinite, rank 2, singular, trace 0 + 2 + 5 = 7. So the trace is 7, not 10.

**M5.** Av = 3v, so A¹⁰v = 3¹⁰v = (59049, 59049).

**M6.** Each eigenvalue is −1, 0 or 1, so their product, det A, is one of these. A = 0, A = I and diag(1, −1, 0) rule out (B), (C) and (D).

**M7.** J = jjᵀ has eigenvalues 4 (on j) and 0 (three times): 2 distinct values.

**M8.** λ₁² + λ₂² = (λ₁ + λ₂)² − 2λ₁λ₂ = 25 − 12 = 13. (D) True: λ² − 5λ + 6 = 0. (A) True: 4 + 9. (C) True: 6². (B) False: it is 1/2 + 1/3 = 5/6.

**M9.** Similar matrices share the characteristic polynomial; their eigenvectors are related by P.

**H1.** The trace is 1 + 2cos θ = 0, so cos θ = −1/2 and θ = 120°.

**H2.** Au = 2u and Av = 3v for v ⊥ u: det = 2 × 3⁴ = 162.

**H3.** Every eigenvalue of a nilpotent matrix is 0, so the trace (their sum) is 0. [[0, 1], [0, 0]] is non-zero, singular and not diagonalisable.

**H4.** adj(A) = det(A) A⁻¹, with eigenvalues 6/1, 6/2 and 6/3: trace 6 + 3 + 2 = 11. (B) True: 1 × 2 × 3. (A) True: adj(A) = det(A) A⁻¹. (C) True: 6 + 3 + 2. (D) False: det(adj(A)) = (det A)² = 36.

**H5.** (C) AB and BA have the same characteristic polynomial. (B) and (A) fail in general. (D) Eigenvectors of distinct eigenvalues are independent.

**H6.** π₁(0.9) + π₂(0.5) = π₁ gives 0.1π₁ = 0.5π₂, so π = (5/6, 1/6) and π₁ ≈ 0.83.

**H7.** A − 2I = [[0, 1, 0], [0, 0, 0], [0, 0, 0]] has rank 1, so the eigenspace has dimension 3 − 1 = 2 (while the algebraic multiplicity is 3).

```python run Recomputing Set L2
import numpy as np

ev = lambda M: np.round(np.sort_complex(np.linalg.eigvals(np.array(M, float))), 4)
print('E6', ev([[4, 1], [2, 3]]), 'E8', round(np.linalg.det([[1, 2], [2, 1]]), 4),
      'M2', ev([[0, 1], [-1, 0]]))
A = np.diag([1., 2, 3])
print('M3', round(np.linalg.det(A @ A + np.eye(3)), 4),
      'M5', np.linalg.matrix_power(np.array([[2, 1], [1, 2]]), 10) @ [1, 1],
      'M7', sorted({float(v) + 0.0 for v in np.round(np.linalg.eigvalsh(np.ones((4, 4))),
              6)}))
rng = np.random.default_rng(3)
u = rng.normal(size=5); u /= np.linalg.norm(u)
print('H1 trace at 120 deg', round(1 + 2 * np.cos(np.radians(120)), 6),
      'H2', round(np.linalg.det(3 * np.eye(5) - np.outer(u, u)), 4))
M = rng.normal(size=(3, 3)); M = M @ np.diag([1., 2, 3]) @ np.linalg.inv(M)
adj = np.linalg.det(M) * np.linalg.inv(M)
print('H4', round(np.trace(adj), 4))
P = np.array([[0.9, 0.1], [0.5, 0.5]])
w, V = np.linalg.eig(P.T)
pi = np.real(V[:, np.argmin(abs(w - 1))]); pi /= pi.sum()
print('H6', np.round(pi, 4),
      'H7', 3 - np.linalg.matrix_rank(np.array([[2, 1, 0], [0, 2, 0], [0, 0,
              2]]) - 2 * np.eye(3)))
X, Y = rng.normal(size=(4, 4)), rng.normal(size=(4, 4))
print('H5 eig(XY) == eig(YX):', np.allclose(np.sort_complex(np.linalg.eigvals(X @ Y)),
                                            np.sort_complex(np.linalg.eigvals(Y @ X))))
```

## Solutions: Set L3

| Q | Answer | Q | Answer | Q | Answer |
|---|---|---|---|---|---|
| E1 | B | M1 | 3.5 | H1 | 82.5 |
| E2 | 1 | M2 | C | H2 | −1 |
| E3 | D | M3 | 2 | H3 | A |
| E4 | C | M4 | B, D | H4 | 4 |
| E5 | B, D | M5 | B, C, D | H5 | A, B |
| E6 | 5 | M6 | C | H6 | A, C, D |
| E7 | B | M7 | A, B, D | H7 | 4 |
| E8 | 5 | M8 | −1 | | |
| | | M9 | D | | |

**E1.** QᵀQ = I gives (det Q)² = 1. **E2.** trace(uuᵀ) = uᵀu = 1. **E3.** λ² = λ. **E4.** 2 + 1 + 1 + 3 = 7. (C) is correct: 2 + 1 + 1 + 3.

**E5.** A projection onto a proper subspace has eigenvalue 0, so it is not invertible. P² = P, which equals I only when P = I.

**E6.** Orthogonal matrices preserve length: 5. **E7.** One positive and one negative eigenvalue: indefinite. **E8.** n − 1 = 5.

**M1.** proj = (b·a/a·a)a = (7/2)(1, 1), so the first component is 3.5.

**M2.** det = 0 and trace = 5, so the eigenvalues are 5 and 0.

**M3.** P is an orthogonal projection onto a 2-dimensional space: trace = rank = 2.

**M4.** P is the orthogonal projection onto the span of the xᵢ: idempotent of rank 4, with four zero eigenvalues, so det P = 0. I − P is also a projection. The rank is 4, not 8.

**M5.** The largest eigenvalue of A: 3 + 1 = 4 (eigenvalues 4 and 2). (C) True: the largest eigenvalue. (D) True: the smallest eigenvalue. (B) True: the eigenvector for 4. (A) False: both eigenvalues are positive.

**M6.** ‖Ax‖ = ‖x‖ for all x gives xᵀ(AᵀA − I)x = 0 for all x, and since AᵀA − I is symmetric, AᵀA = I.

**M7.** Block triangular: 3 × (−2) = −6. (D) True: block triangular. (B) True: det M ≠ 0. (A) True: the eigenvalues of M are those of A and D. (C) False: determinants of the blocks multiply.

**M8.** The matrix [[1, 2], [2, 1]] has eigenvalues 3 and −1; the minimum over unit vectors is −1.

**M9.** zᵀGz = ‖Xz‖² > 0 for z ≠ 0 when the columns are independent.

**H1.** xᵀCx = Σ (xᵢ − x̄)² = Σ (i − 5.5)² = 82.5.

**H2.** Hu = −u and Hv = v for v ⊥ u: det = −1. (H is the Householder reflection.)

**H3.** The matrix [[2, 1, 1], [1, 2, 1], [1, 1, 2]] = I + J has eigenvalues 4, 1, 1, all positive.

**H4.** Expanding along the first row: 2(4) − 1(2) + 1(−2) = 4.

**H5.** An idempotent satisfies λ² = λ, its minimal polynomial divides λ² − λ, so it is diagonalisable with eigenvalues 0 and 1, and rank = trace. (I − P)² = I − 2P + P = I − P. P = [[1, 1], [0, 0]] is idempotent but not symmetric, so not an orthogonal projection. I − P is idempotent, but it is zero only when P = I.

**H6.** This is the least-squares line y = a + bx through (0, 1), (1, 2), (2, 4): b = 1.5 and a = 7/3 − 1.5 = 5/6. The fitted value at x = 2 is 5/6 + 3 ≈ 3.83. (C) True: A(AᵀA)⁻¹Aᵀb. (A) True: the normal equations. (D) True: the same computation. (B) False: b is not in the column space.

**H7.** Eigenvalues 2, 2, 1, 1, 1: det = 4.

```python run Recomputing Set L3
import numpy as np
rng = np.random.default_rng(8)

a, b = np.array([1., 1]), np.array([3., 4])
print('M1', (a @ b) / (a @ a) * a, 'M2', np.round(np.linalg.eigvalsh([[4, 2], [2, 1]]), 4))
A = rng.normal(size=(5, 2)); P = A @ np.linalg.inv(A.T @ A) @ A.T
Q, _ = np.linalg.qr(rng.normal(size=(8, 4))); P4 = Q @ Q.T
print('M3', round(np.trace(P), 6), 'M4 rank', np.linalg.matrix_rank(P4), 'det',
        round(np.linalg.det(P4), 6),
      'M5', np.linalg.eigvalsh([[3, 1], [1, 3]]).max(), 'M8', np.linalg.eigvalsh([[1, 2],
              [2, 1]]).min())
n = 10; C = np.eye(n) - np.ones((n, n)) / n; x = np.arange(1., 11)
u = rng.normal(size=4); u /= np.linalg.norm(u)
print('H1', round(x @ C @ x, 4), 'H2', round(np.linalg.det(np.eye(4) - 2 * np.outer(u, u)),
        6),
      'H3', np.round(np.linalg.eigvalsh(np.ones((3, 3)) + np.eye(3)), 4),
      'H4', round(np.linalg.det([[2, 1, 1], [1, 2, 0], [1, 0, 2]]), 6))
Pn = np.array([[1., 1], [0, 0]])
print('H5 idempotent', np.allclose(Pn @ Pn, Pn), 'symmetric', np.allclose(Pn, Pn.T), 'rank',
        np.linalg.matrix_rank(Pn),
      'trace', np.trace(Pn))
A = np.array([[1., 0], [1, 1], [1, 2]]); bb = np.array([1., 2, 4])
proj = A @ np.linalg.solve(A.T @ A, A.T @ bb)
U, _ = np.linalg.qr(rng.normal(size=(5, 2)))
print('H6', np.round(proj, 4), 'H7', round(np.linalg.det(np.eye(5) + U @ U.T), 6))
```
