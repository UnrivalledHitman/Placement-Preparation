## Solutions: Set L4

| Q | Answer | Q | Answer | Q | Answer |
|---|---|---|---|---|---|
| E1 | B | M1 | 2 | H1 | 2 |
| E2 | 4 | M2 | A | H2 | A, B, D |
| E3 | D | M3 | A, B, D | H3 | C |
| E4 | 1.4 | M4 | C, D | H4 | 8 |
| E5 | A, B | M5 | 3.16 | H5 | A, B, C |
| E6 | C | M6 | A | H6 | 1.966 |
| E7 | D | M7 | −24 | H7 | C |
| E8 | 2 | M8 | 0.2 | | |
| | | M9 | B | | |

**E1.** L holds the multipliers below a unit diagonal. **E2.** Singular values are |3| and |−4|: 4. **E3.** The number of non-zero singular values. **E4.** Σxy/Σx² = 7/5 = 1.4.

**E5.** For a symmetric matrix with a negative eigenvalue, U ≠ V in any SVD, so (C) is false. U and V are orthogonal, not diagonal; Σ is the diagonal factor.

**E6.** The largest singular value: 5. (A) the sum of the entries. (C) is correct: the largest singular value. (D) the Frobenius norm. **E7.** The normal equations. **E8.** The multiplier is 3, so U₂₂ = 5 − 3 × 1 = 2.

**M1.** AᵀA = [[2, 2], [2, 2]] has eigenvalues 4 and 0, so σ₁ = 2.

**M2.** Subtract 3 × row 1 from row 2: U = [[1, 2], [0, −2]].

**M3.** x̄ = 2.5, ȳ = 4, Sₓᵧ = 7 and Sₓₓ = 5, so b = 1.4 (and a = 0.5). (B) True: Sₓᵧ/Sₓₓ = 7/5. (D) True: 4 − 1.4 × 2.5. (A) True: true of every least-squares line with an intercept. (C) False: they sum to 0; 0.2 is the sum of their squares.

**M4.** Full column rank makes AᵀA invertible and the least-squares solution unique. With 4 equations and 3 unknowns, not every b is in the column space. A 4 × 3 matrix has only 3 singular values, and rank 3 makes all of them non-zero.

**M5.** Keep σ₁ = 5. The Frobenius error is √(3² + 1²) = √10 ≈ 3.16 (the spectral-norm error is 3).

**M6.** QᵀQ = I, so every eigenvalue of QᵀQ is 1.

**M7.** det L = 1 and det U = 2 × (−3) × 4 = −24.

**M8.** Fitted values 1.9, 3.3, 4.7 and 6.1; residuals 0.1, −0.3, 0.3, −0.1; sum of squares 0.2.

**M9.** LU costs O(n³) once, and each pair of triangular solves costs O(n²).

**H1.** AᵀA = [[5, 3], [3, 5]] has eigenvalues 8 and 2, so the singular values are 2√2 and √2, ratio 2.

**H2.** A rank-one matrix uvᵀ has one non-zero singular value, ‖u‖‖v‖ = 3 × 5 = 15. (B) True: an outer product of non-zero vectors. (D) True: ‖u‖‖v‖ = 3 × 5. (A) True: u has 3 entries, v has 2. (C) False: they are 225 and 0.

**H3.** For a symmetric matrix the singular values are the absolute eigenvalues: 5, 3, 0.

**H4.** 2³ = 8.

**H5.** AᵀA = I, so the normal equations give x̂ = Aᵀb and the projection AAᵀb. AAᵀ is m × m with rank n < m, so it is not I.

**H6.** w = (6 + 15 + 36)/(4 + 9 + 16) = 57/29 ≈ 1.966.

**H7.** (9 + 4)/14 ≈ 0.93. (C) True: 13/14. (D) False: it explains 9/14. (A) False: the total variance is the trace, 14. (B) False: it explains 1/14.

```python run Recomputing Set L4
import numpy as np
sv = lambda M: np.round(np.linalg.svd(np.array(M, float), compute_uv=False), 4)

print('E2', sv(np.diag([3, -4])), 'E4', 7 / 5, 'E6', sv(np.diag([2, 5, 1]))[0], 'M1',
        sv([[1, 1], [1, 1]]))
x = np.array([1., 2, 3, 4]); y = np.array([2., 3, 5, 6])
b, a = np.polyfit(x, y, 1)
print('M3 b =', round(b, 4), 'a =', round(a, 4), 'M8', round(((a + b * x - y) ** 2).sum(),
        4))
s = np.array([5., 3, 1])
print('M5', round(np.sqrt((s[1:] ** 2).sum()), 4), 'H1', sv([[2, 2], [-1, 1]]),
      'H2', sv(np.outer([1, 2, 2], [3, 4]))[0], 'H3', sv(np.diag([3, -5, 0])))
xs = np.array([2., 3, 4]); ys = np.array([3., 5, 9])
print('H6', round(xs @ ys / (xs @ xs), 4), 'H7', round(13 / 14, 4))
Q, _ = np.linalg.qr(np.random.default_rng(0).normal(size=(5, 2)))
print('H5 QtQ = I', np.allclose(Q.T @ Q, np.eye(2)), '| QQt = I', np.allclose(Q @ Q.T,
        np.eye(5)))
```

## Solutions: Set C1

| Q | Answer | Q | Answer | Q | Answer |
|---|---|---|---|---|---|
| E1 | A | M1 | 3 | H1 | 3 |
| E2 | 4 | M2 | D | H2 | 0.135 |
| E3 | C | M3 | B, C, D | H3 | B |
| E4 | 1.5 | M4 | A, B | H4 | A, B, D |
| E5 | A, C | M5 | 2 | H5 | B, C |
| E6 | 0.167 | M6 | D | H6 | 1 |
| E7 | C | M7 | D | H7 | 2.67 |
| E8 | C | M8 | 1.5 | | |
| | | M9 | C | | |

**E1.** sin(3x)/x = 3 × sin(3x)/(3x) → 3. **E2.** Factor: x + 2 → 4. **E3.** |x| has a corner at 0. **E4.** 1/(1 − 1/3) = 1.5.

**E5.** |x| and max(x, 0) have corners at 0. **E6.** 1/3! ≈ 0.167. **E7.** Divide by x²: 2. **E8.** f′(x) = 3x² − 2, so f′(2) = 10. (C) is correct: 3(4) − 2. (A) forgets the −2.

**M1.** 6x/(√(x² + 6x) + x) → 6/2 = 3.

**M2.** 1 − cos x ≈ x²/2.

**M3.** sin x = Σ (−1)ᵏ x^(2k+1)/(2k + 1)!. The x¹⁵ term has k = 7, so f⁽¹⁵⁾(0) = (−1)⁷ = −1. (B) True: the x¹⁵ coefficient is (−1)⁷/15!. (D) True: even derivatives of sin vanish at 0. (C) True: derivatives cycle with period 4. (A) False: that is the series coefficient, not the derivative.

**M4.** Compositions with smooth outer functions (exp and 1/(1 + t²)) stay differentiable. |f| fails where f(c) = 0 and f′(c) ≠ 0. √f is not even defined near c when f(c) < 0, and fails at points where f(c) = 0.

**M5.** Σ k xᵏ = x/(1 − x)² at x = 1/2: (1/2)/(1/4) = 2.

**M6.** (f(h) − f(0))/h = h sin(1/h) → 0, so f′(0) = 0. But f′(x) = 2x sin(1/x) − cos(1/x) for x ≠ 0 has no limit at 0, so f′ is not continuous there.

**M7.** e² ≈ 7.39. (D) True. (A) False: it is ((1 + 1/n)ⁿ)² → e². (B) False: it tends to 1/e. (C) False: it tends to 1, since n × (1/n²) → 0.

**M8.** (Σᵢ₌₁ 2^(−i))(Σⱼ₌₀ 3^(−j)) = 1 × 1.5 = 1.5.

**M9.** ln(1 + x) = x − x²/2 + …, so the limit is −1/2.

**H1.** |f(x) − f(y)|/|x − y| ≤ |x − y|^0.5 → 0, so f′ ≡ 0 and f is constant: f(7) = 3.

**H2.** The partial sums converge to e^(−2) ≈ 0.135.

**H3.** f(x) = x² for x ≥ 0 and −x² for x < 0, so f′(x) = 2|x|, which exists everywhere but has a corner at 0.

**H4.** √x ≈ 2 + (x − 4)/(2 × 2), so √4.1 ≈ 2.025 (true value 2.02485). (B) True: 2 + 0.1/4. (D) True: √x is concave, so its tangent lies above it. (A) True: f′(4) = 1/(2√4). (C) False: the true value is 2.02485.

**H5.** The harmonic series diverges. Σ 1/n² converges, the alternating harmonic series converges, and n!/2ⁿ grows without bound, so its series diverges.

**H6.** xˣ = e^(x ln x), and x ln x → 0, so the limit is 1.

**H7.** With t = 2x = 1: 1 + 1 + 1/2 + 1/6 ≈ 2.67 (e ≈ 2.718).

```python run Recomputing Set C1
import sympy as sp
x, k, n = sp.symbols('x k n', positive=True)
print('E1', sp.limit(sp.sin(3 * x) / x, x, 0), 'E6', round(1 / 6, 4),
      'M1', sp.limit(sp.sqrt(x**2 + 6 * x) - x, x, sp.oo), 'M2',
              sp.limit((1 - sp.cos(x)) / x**2, x, 0))
print('M3', sp.diff(sp.sin(x), x, 15).subs(x, 0), 'M5', sp.summation(k / 2**k, (k, 1,
        sp.oo)),
      'M7', round(float(sp.limit((1 + 2 / n)**n, n, sp.oo)), 4),
      'M9', sp.limit((sp.log(1 + x) - x) / x**2, x, 0))
h = sp.symbols('h', real=True)
print('M6 difference quotient limit', sp.limit(h * sp.sin(1 / h), h, 0),
      '| H2', round(sum((-2.0) ** j / sp.factorial(j) for j in range(40)), 5),
      '| H4', 2 + 0.1 / 4, 'true', round(4.1 ** 0.5, 5))
print('H6', sp.limit(x**x, x, 0, '+'), 'H7', round(sum(1 / sp.factorial(j)
        for j in range(4)).evalf(), 4))
```

## Solutions: Set C2

| Q | Answer | Q | Answer | Q | Answer |
|---|---|---|---|---|---|
| E1 | B | M1 | A, C, D | H1 | 1.66 |
| E2 | 3 | M2 | B | H2 | 7.67 |
| E3 | A | M3 | 100 | H3 | B |
| E4 | 25 | M4 | C, D | H4 | 1.4167 |
| E5 | A, D | M5 | 3.75 | H5 | B, D |
| E6 | 4 | M6 | A | H6 | A, C, D |
| E7 | A | M7 | −0.37 | H7 | 11 |
| E8 | A | M8 | A, B, D | | |
| | | M9 | C | | |

**E1.** (x − 2)² + 3: minimum 3. **E2.** f′ = −2x + 6 = 0. **E3.** f″ < 0 means concave down: a local maximum. **E4.** At x = 5: 25.

**E5.** sin x is concave on (0, π). −|x| is concave, not convex. **E6.** 1 − 4/x² = 0 at x = 2, f(2) = 4 (or AM–GM). **E7.** Step against the gradient. **E8.** 3x² − 3 = 0 at x = ±1. (A) is correct: x = ±1.

**M1.** Critical points ±1 give f(−1) = 2 and f(1) = −2; the endpoints give f(−2) = −2 and f(3) = 18. (C) True: the endpoint value. (D) True: f′ changes from + to −. (A) True: f(−2) = f(1) = −2. (B) False: it is at the endpoint 3.

**M2.** The second-derivative test is inconclusive, but x⁴ ≥ 0 = f(0).

**M3.** A square of side 10: area 100.

**M4.** f′ is strictly increasing, so it has at most one zero, and that zero is the global minimum. eˣ shows that a minimum need not exist. f has at most one critical point, but eˣ has none, so "exactly one" fails.

**M5.** f′(w) = 2(w − 5). w₁ = 0 + 0.25 × 10 = 2.5 and w₂ = 2.5 + 0.25 × 5 = 3.75.

**M6.** w ← (1 − 4η)w converges when |1 − 4η| < 1, that is 0 < η < 0.5.

**M7.** f′ = ln x + 1 = 0 at x = 1/e, where f = −1/e ≈ −0.37.

**M8.** f′ = 6(x − 1)(x − 2). The values are f(0) = 0, f(1) = 5, f(2) = 4 and f(3) = 9, so the maximum is 9 at the endpoint. (D) True: f′ = 6(x − 1)(x − 2). (B) True: the endpoint value. (A) True: f(0) = 0 < f(2) = 4. (C) False: x = 2 is a local minimum.

**M9.** e^(−x²) ≤ 1 = f(0), with equality only at 0.

**H1.** Minimise d² = x² + (x² − 3)². The derivative 2x + 4x(x² − 3) = 0 gives x = 0 (d² = 9) or x² = 2.5 (d² = 2.5 + 0.25 = 2.75). So d = √2.75 ≈ 1.66.

**H2.** f′ = (x − 1)(x − 3). Values: f(−1) ≈ −4.33, f(1) ≈ 2.33, f(3) = 1, f(5) ≈ 7.67. The maximum is at the endpoint 5.

**H3.** A sum of convex functions is convex. Each of the others can fail. With f(x) = x and g(x) = −x (linear, so convex), fg = −x² is concave. With f(x) = 1 and g(x) = x², f − g = 1 − x² is concave. With f(x) = −x and g(x) = x², f ∘ g = −x² is concave. (f ∘ g is convex when f is convex and non-decreasing.)

**H4.** xₙ₊₁ = xₙ − (xₙ² − 2)/(2xₙ): x₁ = 1.5, x₂ = 1.5 − 0.25/3 ≈ 1.4167.

**H5.** f′ = 4x²(x − 3): critical points 0 and 3. f′ ≤ 0 on both sides of 0, so x = 0 is not an extremum. f(3) = −27 is the global minimum. f″ = 12x(x − 2) < 0 on (0, 2), so f is not convex.

**H6.** V = x(12 − 2x)², V′ = (12 − 2x)(12 − 6x) = 0 at x = 2 (x = 6 gives zero volume). V(2) = 2 × 64 = 128. (A) True: base (12 − 2x)², height x. (C) True: V′ = (12 − 2x)(12 − 6x). (D) True: 2 × 8². (B) False: V(6) = 0, a minimum.

**H7.** w ← (1 − 1.8)w = −0.8w, so |wₖ| = 10 × 0.8ᵏ < 1 needs k > ln 10/ln 1.25 ≈ 10.3: k = 11.

```python run Recomputing Set C2
import sympy as sp
x = sp.symbols('x', real=True)

def extremes(f, a, b):
    pts = [a, b] + [c for c in sp.solve(sp.diff(f, x), x) if c.is_real and a <= c <= b]
    vals = {p: f.subs(x, p) for p in pts}
    return min(vals.values()), max(vals.values())

print('M1', extremes(x**3 - 3 * x, -2, 3), 'M8', extremes(2 * x**3 - 9 * x**2 + 12 * x, 0,
        3),
      'H2', [round(float(v), 4) for v in extremes(x**3 / 3 - 2 * x**2 + 3 * x + 1, -1, 5)])
print('M7', round(float((x * sp.log(x)).subs(x, sp.exp(-1))), 4),
      'H1', round(float(sp.sqrt(sp.Rational(11, 4))), 4),
      'H6', extremes(x * (12 - 2 * x)**2, 0, 6)[1])
w = 0.0
for _ in range(2):
    w -= 0.25 * 2 * (w - 5)
xn = 1.0
for _ in range(2):
    xn -= (xn**2 - 2) / (2 * xn)
w2, steps = 10.0, 0
while abs(w2) >= 1:
    w2 -= 0.9 * 2 * w2; steps += 1
print('M5', w, 'H4', round(xn, 5), 'H7', steps)
f = x**4 - 4 * x**3
print('H5 critical', sp.solve(sp.diff(f, x), x), 'f(3) =', f.subs(x, 3),
      'f\'\' at 1 =', sp.diff(f, x, 2).subs(x, 1))
```
