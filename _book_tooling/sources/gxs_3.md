## Solutions: Set P7

| Q | Answer | Q | Answer | Q | Answer |
|---|---|---|---|---|---|
| E1 | D | M1 | 0.16 | H1 | 0.80 |
| E2 | 3.92 | M2 | D | H2 | 0.15 |
| E3 | B | M3 | 1068 | H3 | D |
| E4 | 2 | M4 | A, C | H4 | A, C, D |
| E5 | A, D | M5 | B, C, D | H5 | A, C |
| E6 | B | M6 | D | H6 | 0.029 |
| E7 | A | M7 | 4 | H7 | 5 |
| E8 | 4 | M8 | A, D | | |
| | | M9 | B | | |

**E1.** 20/√100 = 2. **E2.** 1.96 × 10/5 = 3.92. **E3.** Rejecting a true null hypothesis. **E4.** (52 − 50)/(8/8) = 2.

**E5.** The variance of t(ν) is ν/(ν − 2) > 1, so (C) is false. It is symmetric about 0, not skewed.

**E6.** (3 − 1)(4 − 1) = 6. (A) the number of cells. (B) is correct: (3 − 1)(4 − 1). **E7.** Width ∝ 1/√n, so 4 times the data. **E8.** Mean 4; (4 + 0 + 4)/2 = 4.

**M1.** E[S] = 200 and SD(S) = √400 = 20. P(Z > 1) = 1 − 0.8413 ≈ 0.16.

**M2.** Mean 450 and SD √(900 × 0.25) = 15, so the interval is 450 ± 15: Φ(1) − Φ(−1).

**M3.** The worst case is p = 0.5: 1.96 √(0.25/n) ≤ 0.03 gives n ≥ (1.96/0.03)² × 0.25 = 1067.1, so n = 1068.

**M4.** 0.03 < 0.05 but > 0.01. A p-value is computed assuming H₀ is true; it is not the probability that H₀ is true.

**M5.** (103 − 100)/(8/4) = 1.5. (B) True: 3/(8/4). (D) True: n − 1. (A) False: 1.5 < 2.131. (C) True: 8/√16.

**M6.** E = 10 for every face: (4 + 1 + 4 + 1 + 16 + 16)/10 = 4.2.

**M7.** Every expected count is 50 × 50/100 = 25, and every (O − E)²/E is 25/25 = 1: total 4.

**M8.** p̂ = 0.4: 1.96 √(0.4 × 0.6/600) = 1.96 × 0.02 = 0.0392. (B) False: p̂ = 240/600 = 0.4. (A) True: √(0.24/600). (D) True: 0.4 ± 0.0392. (C) False: a higher level gives a wider interval.

**M9.** z grows from 1.96 to 2.576, so the interval widens.

**H1.** Power = P(X̄ > 0.329 | μ = 0.5) = P(Z > (0.329 − 0.5) × 5) = P(Z > −0.855) = 0.8037.

**H2.** SD(X̄) = (1/√12)/20 ≈ 0.01443, z = 0.015/0.01443 ≈ 1.039, and 1 − 0.8506 ≈ 0.15.

**H3.** With μ known, E[Xᵢ²] = σ², so (1/n) Σ Xᵢ² is unbiased. Option (C) estimates the mean too and is biased low (by a factor (n − 1)/n).

**H4.** t = (20 − 17)/(3 √(1/10 + 1/10)) = 1/√0.2 ≈ 2.24. (C) True: 3/(3√0.2). (D) True: 10 + 10 − 2. (A) True: 2.24 > 2.101. (B) False: it is 3√(1/10 + 1/10) ≈ 1.34.

**H5.** E[X̄] = θ and Var(X̄) = θ²/n; the CLT gives approximate normality. The median of an exponential is θ ln 2, so the sample median estimates θ ln 2, not θ. An exponential with mean θ has variance θ², so Var(X̄) = θ²/n, not θ/n.

**H6.** Mean 50 and SD 5. With continuity correction, P(Y ≥ 60) ≈ P(Z ≥ (59.5 − 50)/5 = 1.9) = 0.0287.

**H7.** 7 − 1 − 1 = 5: one degree of freedom is lost for the total and one for the estimated λ.

```python run Recomputing Set P7
from math import sqrt, ceil, comb
from scipy import stats

print('E2', round(1.96 * 10 / 5, 4), 'E8', sum((v - 4) ** 2 for v in (2, 4, 6)) / 2,
      'M1', round(stats.norm.sf(1), 4), 'M3', ceil((1.96 / 0.03) ** 2 * 0.25))
obs = [8, 9, 12, 11, 6, 14]
print('M5', (103 - 100) / (8 / 4), 'M6', sum((o - 10) ** 2 / 10 for o in obs),
      'M7', stats.chi2_contingency([[30, 20], [20, 30]], correction=False)[0],
      'M8', round(1.96 * sqrt(0.24 / 600), 4))
print('H1', round(stats.norm.sf((0.329 - 0.5) * 5), 4),
      'H2', round(stats.norm.sf(0.015 / ((1 / sqrt(12)) / 20)), 4),
      'H4', round(3 / (3 * sqrt(0.2)), 4))
exact = sum(comb(100, k) for k in range(60, 101)) / 2 ** 100
print('H6 approx', round(stats.norm.sf(1.9), 4), 'exact', round(exact, 4),
      '| H5 exponential median / mean', round(stats.expon.median(), 4))
```

## Solutions: Set L1

| Q | Answer | Q | Answer | Q | Answer |
|---|---|---|---|---|---|
| E1 | D | M1 | 4 | H1 | 6 |
| E2 | 30 | M2 | B | H2 | A, C, D |
| E3 | C | M3 | B, C, D | H3 | B |
| E4 | 3 | M4 | B, C | H4 | 6 |
| E5 | A, B | M5 | 55 | H5 | C, D |
| E6 | C | M6 | B | H6 | 6 |
| E7 | A | M7 | 1.5 | H7 | 5 |
| E8 | 4 | M8 | B | | |
| | | M9 | D | | |

**E1.** The second row is twice the first: rank 1.

**E2.** Triangular: 2 × 3 × 5 = 30.

**E3.** Only the plane through the origin is closed under addition and scaling.

**E4.** Rank–nullity with 6 columns: 6 − 3 = 3.

**E5.** A singular matrix has a non-trivial null space and rank below 3, and its column space is not all of ℝ³, so some b have no solution. So rank(A) = 3 is impossible.

**E6.** 2³ × 5 = 40. (A) that is 2 det A. (C) is correct: 2³ × 5.

**E7.** The dimension of ℝ⁴ is 4.

**E8.** One independent linear constraint: 5 − 1 = 4.

**M1.** det = 1(k − 6) − 2(2 − 6) + 3(2 − k) = 8 − 2k, which is zero at k = 4.

**M2.** The coefficient determinant is k − 1, so the solution is unique exactly when k ≠ 1 (for any b).

**M3.** Row 3 − row 2 = row 2 − row 1, so the rows are dependent; the first two are independent. Rank 2. (D) True: row 3 − row 2 = row 2 − row 1. (C) True: rank below 3. (B) True: rank–nullity: 3 − 2. (A) False: column 2 − column 1 = (1, 1, 1)ᵀ, so x = (−1, 1, 0) works.

**M4.** Four vectors in ℝ³ are always dependent. The first three have determinant 2 ≠ 0, so they are independent and span ℝ³. (1, 2, 1) = (1, 1, 0) + (0, 1, 1), so (A) is false. Since the first three span ℝ³, the four vectors do not lie in a plane.

**M5.** 10 + 45 = 55.

**M6.** Rows summing to 0 means Aj = 0 for the all-ones vector j, so A is singular. The trace and symmetry are unconstrained.

**M7.** det(A⁻¹) det(Bᵀ) = 6/4 = 1.5.

**M8.** Rank 1 (the second row is twice the first), so the nullity is 3 − 1 = 2. (A) False: row 2 = 2 × row 1, so the rank is 1. (B) True: 3 − 1. (C) False: 1 + 4 + 1 = 6 ≠ 0; (2, −1, 0) is in it. (D) False: 1 + 2 − 1 = 2 ≠ 0.

**M9.** BA is 5 × 5 with rank at most 3, so it is singular. AB is 3 × 3 and may or may not be invertible.

**H1.** Aj = 2j, so A³j = 8j and Bj = (8 − 2)j = 6j.

**H2.** The matrix is I + J, where J is the all-ones matrix, whose eigenvalues are 4, 0, 0, 0. So the eigenvalues are 5, 1, 1, 1 and the determinant is 5. (C) True: the product of the eigenvalues. (A) True: M = I + J. (D) True: all eigenvalues are positive. (B) False: the eigenvalues of M⁻¹ are 1/5, 1, 1, 1, so the trace is 3.2.

**H3.** rank(AᵀA) = rank(A) = 3.

**H4.** Count the 16 matrices with ad − bc ≠ 0: ad = 1 and bc = 0 (3 ways), or ad = 0 and bc = 1 (3 ways). Total 6.

**H5.** rank ≤ m < n, so the null space is non-trivial and the n columns are dependent. Solvability for every b needs rank m, which can fail (for example, A = 0). rank(A) ≤ m always, but rank(A) = m can fail (A = 0).

**H6.** A symmetric 3 × 3 matrix is fixed by its diagonal (3 entries) and the entries above it (3): dimension 6.

**H7.** H is a plane at distance 2 from the centre, not a subspace. It cuts the ball in a disc of radius √(9 − 4) = √5, area 5π.

```python run Recomputing Set L1
import numpy as np, sympy as sp
from itertools import product

print('E1', np.linalg.matrix_rank([[1, 2], [2, 4]]),
      'E2', round(np.linalg.det([[2, 1, 0], [0, 3, 4], [0, 0, 5]])),
      'M3', np.linalg.matrix_rank(np.arange(1, 10).reshape(3, 3)))
k = sp.symbols('k')
print('M1', sp.solve(sp.Matrix([[1, 2, 3], [2, k, 6], [1, 1, 1]]).det(), k),
      'M2 det =', sp.factor(sp.Matrix([[1, 1, 1], [1, 2, 3], [1, 1, k]]).det()))
V = np.array([[1, 1, 0], [0, 1, 1], [1, 0, 1], [1, 2, 1]])
print('M4 rank of all four', np.linalg.matrix_rank(V),
      'det of first three', round(np.linalg.det(V[:3])),
      '| M8', 3 - np.linalg.matrix_rank([[1, 2, -1], [2, 4, -2]]))
rng = np.random.default_rng(1)
A, B = rng.normal(size=(3, 5)), rng.normal(size=(5, 3))
print('M9 rank AB', np.linalg.matrix_rank(A @ B), 'rank BA', np.linalg.matrix_rank(B @ A))
M = rng.normal(size=(6, 3)) @ rng.normal(size=(3, 4))          # a 6 x 4 matrix of rank 3
print('H2', round(np.linalg.det(np.ones((4, 4)) + np.eye(4))),
      'H3 rank M', np.linalg.matrix_rank(M), 'rank MtM', np.linalg.matrix_rank(M.T @ M))
print('H4', sum(1 for a, b, c, d in product((0, 1), repeat=4) if a * d - b * c != 0),
      'H7 radius^2', 9 - 2 ** 2)
```
