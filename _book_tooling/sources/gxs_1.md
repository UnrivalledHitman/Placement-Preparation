## Solutions: Set P3

| Q | Answer | Q | Answer | Q | Answer |
|---|---|---|---|---|---|
| E1 | B | M1 | A, C, D | H1 | 14.7 |
| E2 | 0.49 | M2 | C | H2 | 4.47 |
| E3 | A | M3 | 0.7 | H3 | A |
| E4 | 0.375 | M4 | 2 | H4 | 1.5 |
| E5 | C, D | M5 | C | H5 | A, D |
| E6 | C | M6 | A, C | H6 | 1 |
| E7 | A | M7 | B | H7 | B, C, D |
| E8 | 0.25 | M8 | A | | |
| | | M9 | 0.25 | | |

**E1.** 0.2 + 1.0 + 0.9 = 2.1.

**E2.** E[X²] = 0.2 + 2.0 + 2.7 = 4.9, so Var(X) = 4.9 − 2.1² = 0.49.

**E3.** 3² × 4 = 36; the shift does nothing.

**E4.** ∫₀² cx² dx = 8c/3 = 1, so c = 3/8 = 0.375.

**E5.** (A) fails for discrete variables, whose CDFs jump. F tends to 0, not 1, as x → −∞.

**E6.** (1 + … + 6)/6 = 3.5. (A) not the average of 1 to 6. (C) is correct: 21/6. (B) not the average of 1 to 6. (D) the largest score, not the mean.

**E7.** Var(X) = 13 − 4 = 9, so σ = 3.

**E8.** F(x) = x², so P(X ≤ 0.5) = 0.25.

**M1.** E[X] = ∫ 2x² = 2/3 and E[X²] = ∫ 2x³ = 1/2, so Var(X) = 1/2 − 4/9 = 1/18 ≈ 0.056. (C) True: ∫ 2x² dx. (D) True: 1/2 − 4/9. (A) True: x² = 1/2. (B) False: F(1/2) = 1/4.

**M2.** x³ = 1/2 gives x = 0.5^(1/3) ≈ 0.794.

**M3.** P(X = 1) + P(X = 2) = (0.5 − 0.2) + (0.9 − 0.5) = 0.7.

**M4.** For a non-negative integer variable, E[X] = Σₖ₌₁^∞ P(X ≥ k) = (2/3)/(1 − 2/3) = 2.

**M5.** (4 + 1 + 0 + 1 + 4)/5 = 2.

**M6.** E[X] = ∫₀² 3x³/8 dx = 1.5 and E[X²] = ∫₀² 3x⁴/8 dx = 2.4, so Var(X) = 0.15. The median solves x³/8 = 1/2: x = 4^(1/3) ≈ 1.587, above the mean (the density leans right, so its mass piles up near 2 while a thin left tail pulls the mean down). So 0.25 is wrong.

**M7.** Expected winnings (20 + 25 + 30)/6 = 12.5, so the net gain is 2.5. (D) False: they are (20 + 25 + 30)/6 = ₹12.5. (B) True: 12.5 − 10. (A) False: faces 4, 5 and 6 win, so it is 1/2. (C) False: the expected gain is positive.

**M8.** E[(X − c)²] = σ² + (μ − c)², smallest at c = μ.

**M9.** Var/k² = 4/16 = 0.25.

**H1.** After i distinct faces have appeared, a new face takes on average 6/(6 − i) rolls. Total 6(1 + 1/2 + 1/3 + 1/4 + 1/5 + 1/6) = 14.7.

**H2.** P(max ≤ k) = (k/6)², so E[max] = Σₖ₌₁⁶ P(max ≥ k) = Σ (1 − ((k − 1)/6)²) = 161/36 ≈ 4.47.

**H3.** By symmetry E[X] = 0, and E[X²] = ∫₀^∞ x² e^(−x) dx = 2! = 2.

**H4.** X is mixed: a density 1/4 on [0, 2) carrying total probability 1/2, and a jump of 1/2 at x = 2. E[X] = ∫₀² x/4 dx + 2 × 1/2 = 0.5 + 1 = 1.5. A common error treats F as continuous and misses the jump.

**H5.** (A) Markov: P(X ≥ 6) ≤ 2/6. (B) Fails: X = 0 with probability 0.9 and 20 with probability 0.1. (D) E[X²] ≥ (E[X])² = 4. (C) Jensen for the concave √ gives E[√X] ≤ √E[X] = √2, so the reverse inequality fails in general (X = 0 or 4 with equal probability gives E[√X] = 1).

**H6.** Write the count as the sum of 10 indicators, each with probability 1/10. Linearity gives 1, for any number of hats.

**H7.** If the break point is U, the longer piece is max(U, 1 − U), which is uniform on [1/2, 1]. Its mean is 3/4. (B) True: max(U, 1 − U) is uniform there. (D) True: the midpoint of [1/2, 1]. (C) True: 1 − 3/4. (A) False: E[(1 − S)/S] diverges, because S can be arbitrarily close to 0.

```python run Recomputing Set P3
from fractions import Fraction as F
import sympy as sp

xs, ps = [1, 2, 3], [F(2, 10), F(5, 10), F(3, 10)]
m = sum(x * p for x, p in zip(xs, ps)); m2 = sum(x * x * p for x, p in zip(xs, ps))
print('E1', m, 'E2', m2 - m * m)
x = sp.symbols('x', positive=True)
c = sp.solve(sp.integrate(sp.Symbol('c') * x**2, (x, 0, 2)) - 1, sp.Symbol('c'))[0]
print('E4', c, '| M1', sp.integrate(2 * x**3, (x, 0, 1)) - sp.integrate(2 * x**2, (x, 0,
        1))**2,
      '| M2', round(0.5 ** (1 / 3), 4))
print('M4', sum(F(2, 3) ** k for k in range(1, 200)) .limit_denominator(1000),
      'M5', F(sum(v * v for v in (-2, -1, 0, 1, 2)), 5))
f = 3 * x**2 / 8
mean = sp.integrate(x * f, (x, 0, 2)); var = sp.integrate(x**2 * f, (x, 0, 2)) - mean**2
print('M6 mean', mean, 'var', var, 'median', round(4 ** (1 / 3), 4))
print('M7', F(20 + 25 + 30, 6) - 10, 'H1', round(6 * sum(F(1, k) for k in range(1, 7)), 4))
print('H2', F(sum(max(a, b) for a in range(1, 7) for b in range(1, 7)), 36),
      round(161 / 36, 4))
print('H3', sp.integrate(x**2 * sp.exp(-x), (x, 0, sp.oo)),
      'H4', sp.integrate(x / 4, (x, 0, 2)) + 2 * sp.Rational(1, 2))
from itertools import permutations
perms = list(permutations(range(6)))
print('H6 (6 hats, exact)', F(sum(sum(p[i] == i for i in range(6)) for p in perms),
        len(perms)),
      '| H7', sp.integrate(sp.Max(x, 1 - x), (x, 0, 1)))
```

The H6 check uses 6 hats to keep the enumeration small; the indicator argument gives 1 for any number of hats.

## Solutions: Set P4

| Q | Answer | Q | Answer | Q | Answer |
|---|---|---|---|---|---|
| E1 | D | M1 | 0.05 | H1 | A, B, D |
| E2 | 19 | M2 | B | H2 | 0.33 |
| E3 | A | M3 | 0.25 | H3 | C |
| E4 | 4 | M4 | A, B, C | H4 | 2 |
| E5 | A, B | M5 | B, D | H5 | A, C |
| E6 | 5.5 | M6 | A, D | H6 | 0.28 |
| E7 | B | M7 | A | H7 | −0.0069 |
| E8 | A | M8 | 8 | | |
| | | M9 | −1 | | |

**E1.** ρ = 3/(2 × 3) = 0.5.

**E2.** 4 + 9 + 2 × 3 = 19.

**E3.** 4 × 2 + 3 = 11; variances add even for a difference.

**E4.** Mean 40/8 = 5; squared deviations 9, 1, 1, 1, 0, 0, 4, 16 sum to 32; 32/8 = 4.

**E5.** (C) is false: zero covariance does not imply independence (see M5). Correlation can be negative, so [0, 1] is wrong; it lies in [−1, 1].

**E6.** Sorted: 1, 3, 4, 7, 8, 9; the median is (4 + 7)/2 = 5.5.

**E7.** The tower rule.

**E8.** 2 × 3 × 1.5 = 9. (C) ignores the scale factors. (B) uses only one factor. (A) is correct: 2 × 3 × 1.5. (D) adds the constants.

**M1.** E[X] = 0.5, E[Y] = 0.7 and E[XY] = P(1, 1) = 0.4. Cov = 0.4 − 0.35 = 0.05.

**M2.** 0.4/(0.1 + 0.4) = 0.8.

**M3.** E[Y | X] = X/2, so E[Y] = E[X]/2 = 0.25.

**M4.** Var(Y | X) = X²/12 and E[Y | X] = X/2. Var(Y) = E[X²]/12 + Var(X)/4 = 1/36 + 1/48 = 7/144 ≈ 0.049. (A) True: the midpoint of (0, X). (C) True: E[X]/2. (B) True: E[X²]/12 + Var(X)/4 = 1/36 + 1/48. (D) False: that misses E[Var(Y | X)] = 1/36.

**M5.** Cov(X, X²) = E[X³] = 0, and E[X²] = 1/3. Y is a function of X, so they are dependent, and the relation is not linear, so ρ = 0, not 1.

**M6.** Var(S) = E[N] Var(order) + Var(N) (E[order])² = 5 × 4 + 2 × 9 = 38. (D) True: E[N] × 3. (A) True: 5 × 4 + 2 × 3². (B) False: it would be 5 × 4 = 20. (C) False: the mean order value must be squared.

**M7.** Mean 3 × 20 − 5 = 55, standard deviation 3 × 4 = 12.

**M8.** (10 × 5 + 15 × 10)/25 = 8.

**M9.** A linear relation with a negative slope: ρ = −1.

**H1.** P(max ≤ t) = t², so E[max] = ∫₀¹ (1 − t²) dt = 2/3. (B) True: ∫ (1 − t²) dt. (D) True: ∫ (1 − t)² dt. (A) True: max + min = X + Y. (C) False: min ≤ max always, so they are dependent.

**H2.** E[|X − Y|] = ∫₀¹ ∫₀¹ |x − y| dx dy = 1/3.

**H3.** E[X²] = 2 and E[Y²] = 7. Var(XY) = 2 × 7 − (1 × 2)² = 10.

**H4.** Σᵢ Σⱼ (xᵢ − xⱼ)² = 2n Σ (xᵢ − x̄)², so Σ (xᵢ − x̄)² = 1600/40 = 40 and the variance is 40/20 = 2.

**H5.** (D) Var(X + Y) = σₓ² + σᵧ² + 2Cov(X, Y), which exceeds σₓ² + σᵧ² whenever the covariance is positive; |Cov(X, Y)| ≤ σₓσᵧ is the Cauchy–Schwarz inequality. (A) Follows from the law of total variance. (B) E[X | Y] is a function of Y.

**H6.** Cov(X, Y) = Var(X) = 1/12 and Var(Y) = 1/12 + 1 = 13/12. ρ = (1/12)/√((1/12)(13/12)) = 1/√13 ≈ 0.28.

**H7.** E[X] = ∫∫ x(x + y) = 1/3 + 1/4 = 7/12, the same for Y, and E[XY] = ∫∫ xy(x + y) = 1/6 + 1/6 = 1/3. Cov = 1/3 − 49/144 = −1/144 ≈ −0.0069.

```python run Recomputing Set P4
from fractions import Fraction as F
import sympy as sp

print('E1', F(3, 6), 'E2', 4 + 9 + 6, 'E3', 4 * 2 + 3)
d = [2, 4, 4, 4, 5, 5, 7, 9]
m = F(sum(d), len(d))
print('E4', sum((v - m) ** 2 for v in d) / len(d), 'E6', sorted([3, 8, 1, 9, 4, 7]), 'E8',
        2 * 3 * 1.5)
J = {(0, 0): F(2, 10), (0, 1): F(3, 10), (1, 0): F(1, 10), (1, 1): F(4, 10)}
ex = sum(x * p for (x, y), p in J.items()); ey = sum(y * p for (x, y), p in J.items())
exy = sum(x * y * p for (x, y), p in J.items())
print('M1', exy - ex * ey, 'M2', J[1, 1] / (J[1, 0] + J[1, 1]))
x, y = sp.symbols('x y', positive=True)
EY = sp.integrate(sp.integrate(y / x, (y, 0, x)), (x, 0, 1))
EY2 = sp.integrate(sp.integrate(y**2 / x, (y, 0, x)), (x, 0, 1))
print('M3', EY, 'M4', EY2 - EY**2, '=', round(float(EY2 - EY**2), 4))
print('M5 Cov', sp.integrate(x**3 / 2, (x, -1, 1)), 'E[Y]', sp.integrate(x**2 / 2, (x, -1,
        1)))
print('M6', 5 * 4 + 2 * 9, 'M8', F(10 * 5 + 15 * 10, 25))
print('H1', sp.integrate(sp.integrate(sp.Max(x, y), (x, 0, 1)), (y, 0, 1)),
      'H2', sp.integrate(sp.integrate(sp.Abs(x - y), (x, 0, 1)), (y, 0, 1)))
print('H3', 2 * 7 - (1 * 2) ** 2, 'H4', F(1600, 40) / 20, 'H6', round(1 / 13 ** 0.5, 4))
f = x + y
E = lambda g: sp.integrate(sp.integrate(g * f, (x, 0, 1)), (y, 0, 1))
cov = E(x * y) - E(x) * E(y)
print('H7', cov, round(float(cov), 5))
```
