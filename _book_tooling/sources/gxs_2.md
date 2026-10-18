## Solutions: Set P5

| Q | Answer | Q | Answer | Q | Answer |
|---|---|---|---|---|---|
| E1 | B | M1 | 0.087 | H1 | 3 |
| E2 | 2.1 | M2 | C | H2 | A, C, D |
| E3 | B | M3 | 0.0025 | H3 | D |
| E4 | 0.14 | M4 | B, D | H4 | 6 |
| E5 | A, B | M5 | 0.14 | H5 | A, D |
| E6 | 4 | M6 | C | H6 | A, B, C |
| E7 | B | M7 | A, B, D | H7 | 2.31 |
| E8 | B | M8 | 9 | | |
| | | M9 | C | | |

**E1.** np = 3. **E2.** np(1 − p) = 2.1. **E3.** Poisson variance = λ = 4. **E4.** e^(−2) ≈ 0.135, which rounds to 0.14.

**E5.** X² = X for a 0–1 variable, so (C) is false; p(1 − p) peaks at p = 1/2. E[X] = P(X = 1) = p, not 1 − p.

**E6.** 1/p = 4. **E7.** (1 + 10)/2 = 5.5. **E8.** C(4, 2)/16 = 0.375. (B) is correct: C(4, 2)/16.

**M1.** 5(0.4)⁴(0.6) + 0.4⁵ = 0.0768 + 0.01024 = 0.08704.

**M2.** e^(−3)(1 + 3) ≈ 0.199.

**M3.** The count in 3 minutes is Poisson(6): e^(−6) ≈ 0.0025.

**M4.** Independent Poisson variables add. X − Y can be negative, so it is not Poisson. P(X + Y = 0) = e^(−3). So Var(X + Y) = 3, not 9.

**M5.** λ = np = 2: e^(−2) ≈ 0.14. (The exact binomial value is 0.98¹⁰⁰ ≈ 0.133.)

**M6.** The geometric is memoryless: P(X > 5 | X > 2) = P(X > 3) = (1/2)³ = 0.125.

**M7.** Hypergeometric: C(3, 1)C(7, 3)/C(10, 4) = 3 × 35/210 = 0.5. (D) True: C(3, 1)C(7, 3)/C(10, 4) = 105/210. (B) True: 4 × 3/10. (A) True: C(7, 4)/C(10, 4) = 35/210. (C) False: without replacement it is hypergeometric.

**M8.** For a Poisson, E[X(X − 1)] = λ² = 9.

**M9.** 1 − p = 4.2/6 = 0.7, so p = 0.3 and n = 6/0.3 = 20.

**H1.** The ratio P(k + 1)/P(k) = (10 − k)(0.35)/((k + 1)(0.65)) exceeds 1 while k < 2.85, so P rises up to k = 3 and then falls. Equivalently, the mode is ⌊(n + 1)p⌋ = ⌊3.85⌋ = 3.

**H2.** λe^(−λ) = λ²e^(−λ)/2 gives λ = 2. P(X = 3) = e^(−2) 2³/3! ≈ 0.18. (A) True: λe^(−λ) = λ²e^(−λ)/2. (D) True: e^(−2) × 8/6. (C) True: λ = 2. (B) False: Var(X) = λ = 2.

**H3.** Σₖ p²(1 − p)^(2(k − 1)) = p²/(1 − (1 − p)²) = p/(2 − p).

**H4.** The waits for each of the three heads are independent geometrics with mean 2: total 6.

**H5.** (A) is the ratio of consecutive binomial terms. (B) n − X counts failures, so it is Binomial(n, 1 − p), not Binomial(n, p). (D) Independent binomials with the same p add. (C) Var(X) = np(1 − p) ≤ n/4, with equality only at p = 1/2, so (C) is false.

**H6.** Face j appears with probability 1 − (5/6)⁶, and linearity over the six faces gives 6(1 − (5/6)⁶) ≈ 3.99. (C) True: 6(1 − (5/6)⁶). (A) True: the rolls must be a permutation of 1 to 6. (B) True: linearity over faces. (D) False: it is missed with probability (5/6)⁶ ≈ 0.33.

**H7.** E[X | X ≥ 1] = E[X]/P(X ≥ 1) (the event X = 0 adds nothing to E[X]) = 2/(1 − e^(−2)) ≈ 2.31.

```python run Recomputing Set P5
from math import comb, exp, factorial
from fractions import Fraction as F
from itertools import product

binom = lambda n, p, k: comb(n, k) * p**k * (1 - p)**(n - k)
print('E4', round(exp(-2), 4), 'E8', binom(4, 0.5, 2), 'M1', round(binom(5, .4, 4)
        + binom(5, .4, 5), 5))
print('M2', round(4 * exp(-3), 4), 'M3', round(exp(-6), 5), 'M5 Poisson', round(exp(-2), 4),
      'exact', round(0.98 ** 100, 4))
print('M7', F(comb(3, 1) * comb(7, 3), comb(10, 4)),
      'M8', sum(k * (k - 1) * exp(-3) * 3**k / factorial(k) for k in range(60)))
pm = [binom(10, 0.35, k) for k in range(11)]
print('H1 mode', pm.index(max(pm)), 'H2', round(exp(-2) * 8 / 6, 4))
p = 0.3
print('H3 at p = 0.3:', round(sum(p * p * (1 - p) ** (2 * k) for k in range(500)), 6),
      'formula', round(p / (2 - p), 6))
import random
random.seed(2)
def tosses():
    heads = n = 0
    while heads < 3:
        n += 1; heads += random.random() < 0.5
    return n
print('H4 simulated', round(sum(tosses() for _ in range(100_000)) / 100_000, 3))
rolls = list(product(range(6), repeat=6))
print('H6 exact', round(sum(len(set(r)) for r in rolls) / len(rolls), 4),
      'formula', round(6 * (1 - (5 / 6) ** 6), 4))
print('H7', round(sum(k * exp(-2) * 2**k / factorial(k) for k in range(1,
        60)) / (1 - exp(-2)), 4))
```

## Solutions: Set P6

| Q | Answer | Q | Answer | Q | Answer |
|---|---|---|---|---|---|
| E1 | D | M1 | 0.82 | H1 | 0.8 |
| E2 | 0.37 | M2 | A | H2 | 0.80 |
| E3 | D | M3 | 0.09 | H3 | C |
| E4 | 1.5 | M4 | A, B | H4 | 176 |
| E5 | A, C | M5 | 0.079 | H5 | C, D |
| E6 | A | M6 | D | H6 | A, B, D |
| E7 | A | M7 | A, C, D | H7 | B |
| E8 | 6 | M8 | 3 | | |
| | | M9 | D | | |

**E1.** Mean (2 + 8)/2 = 5, variance 6²/12 = 3.

**E2.** P(X > 4) = e^(−4/4) = e^(−1) ≈ 0.37.

**E3.** Symmetry: 0.5. **E4.** (13 − 10)/2 = 1.5 (the standard deviation is 2).

**E5.** The median of an exponential is ln 2/λ ≈ 0.693/λ, below the mean 1/λ. It lives on [0, ∞), so it never takes negative values.

**E6.** 4/10 = 0.4. (A) is correct: 4/10. **E7.** Standardising gives N(0, 1). **E8.** The mean of χ²(k) is k.

**M1.** z-values −1 and 2: Φ(2) − Φ(−1) = 0.9772 − 0.1587 = 0.8185, so 0.82.

**M2.** e^(−2λ) = 1/4 gives λ = ln 2, so E[X] = 1/ln 2 ≈ 1.44.

**M3.** Memorylessness: P(X > 10) = P(X > 5)² = 0.09.

**M4.** The t distribution is symmetric with heavier tails and a lower peak than the normal, so (C) is false and (A) true. Var(T) = ν/(ν − 2) = 3. So Var(T) is 3, not 1.

**M5.** X + Y ~ N(0, 2): P(X + Y > 2) = 1 − Φ(2/√2) = 1 − 0.9214 = 0.0786, so 0.079.

**M6.** P(Y > y) = P(X < e^(−y)) = e^(−y): exponential with mean 1. (This is how computers generate exponential random numbers.)

**M7.** The minimum of independent exponentials is exponential with the sum of the rates, 1/2 + 1/3 = 5/6, so its mean is 6/5 = 1.2. (C) True: rates add: 1/2 + 1/3. (D) True: 6/5. (A) True: (1/2)/(5/6). (B) False: E[max] = 2 + 3 − 1.2 = 3.8.

**M8.** E[Z⁴] = 3.

**M9.** Z₁² + Z₂² ~ χ²(2), the exponential with mean 2: P(> 2) = e^(−1) ≈ 0.368.

**H1.** e^(−λ) = 1/5, so P(Y = k) = P(k ≤ X < k + 1) = (1/5)ᵏ(4/5). So q = 0.8.

**H2.** E[|Z|] = 2∫₀^∞ z φ(z) dz = √(2/π) ≈ 0.798, so 0.80.

**H3.** P(X² ≤ 0.25) = P(−0.5 ≤ X ≤ 0.5) = 0.5.

**H4.** E[Y²] = 4 + 9 = 13. E[Y⁴] = 16E[Z⁴] + 6 × 4 × 9 × E[Z²] + 81 = 48 + 216 + 81 = 345 (the odd moments vanish). Var(Y²) = 345 − 169 = 176.

**H5.** For normal samples (n − 1)s²/σ² ~ χ²(n − 1), and X̄ and s² are independent. X̄ ~ N(μ, σ²/n), not N(μ, σ²). With s in place of σ the standardised mean follows t(n − 1), not N(0, 1).

**H6.** For the maximum M, P(M ≤ t) = t³, so E[M] = ∫₀¹ (1 − t³) dt = 3/4. (D) True: all three must be ≤ t. (B) True: ∫ (1 − t³) dt. (A) True: by symmetry, 1 − 3/4. (C) False: Var(M) = 3/5 − 9/16 = 3/80.

**H7.** Memorylessness: E[X | X > 2] = 2 + E[X] = 3. (B) True: memorylessness: 2 + 1. (D) False: X − 2 given X > 2 is again exponential with mean 1, so the variance is 1. (C) False: by memorylessness it is P(X > 1) = e^(−1). (A) False: it is (1 − 3e^(−2))/(1 − e^(−2)) ≈ 0.69, below 1.

```python run Recomputing Set P6
from math import exp, log, sqrt, pi, erf
import sympy as sp
import random

Phi = lambda z: 0.5 * (1 + erf(z / sqrt(2)))
print('E2', round(exp(-1), 4), 'E5 median vs mean (rate 1):', round(log(2), 4), 1,
      'M1', round(Phi(2) - Phi(-1), 4))
print('M2', round(1 / log(2), 4), 'M3', round(0.3 ** 2, 4), 'M5',
        round(1 - Phi(2 / sqrt(2)), 4))
from scipy import stats
print('M4 pdf at 0: t(3)', round(stats.t.pdf(0, 3), 4), 'normal', round(stats.norm.pdf(0),
        4),
      '| P(|T|>2)', round(2 * stats.t.sf(2, 3), 4), 'P(|Z|>2)', round(2 * stats.norm.sf(2),
              4),
      '| Var(T)', stats.t.var(3))
random.seed(4)
ys = [-log(1 - random.random()) for _ in range(200_000)]
print('M6 mean of -ln X', round(sum(ys) / len(ys), 3), '| M7', round(1 / (1 / 2 + 1 / 3),
        4),
      '| M9', round(stats.chi2.sf(2, 2), 4))
z = sp.symbols('z', real=True)
phi = sp.exp(-z**2 / 2) / sp.sqrt(2 * sp.pi)
E = lambda g: sp.integrate(g * phi, (z, -sp.oo, sp.oo))
print('M8', E(z**4), 'H2', sp.simplify(E(sp.Abs(z))), round(sqrt(2 / pi), 4),
      'H4', sp.expand(E((2 * z + 3)**4) - E((2 * z + 3)**2)**2))
print('H1 q =', round(1 - exp(-log(5)), 4), 'H6', sp.integrate(1 - z**3, (z, 0, 1)),
      'H7', round(sum(ys_i for ys_i in ys if ys_i > 2) / sum(1 for v in ys if v > 2), 2))
```
