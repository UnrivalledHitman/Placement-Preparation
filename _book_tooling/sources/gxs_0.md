# Answers and worked solutions
%Every set's answer key, a short solution for each question, and a program that recomputes the answers

For NAT questions the key gives the exact value and the rounded answer. An MSQ answer lists every correct option; anything else scores zero.

## Solutions: Set P1

| Q | Answer | Q | Answer | Q | Answer |
|---|---|---|---|---|---|
| E1 | B | M1 | 165 | H1 | 7350 |
| E2 | 70 | M2 | A, C, D | H2 | A, C, D |
| E3 | D | M3 | C | H3 | A |
| E4 | 15120 | M4 | 266 | H4 | 42 |
| E5 | C | M5 | B | H5 | C, D |
| E6 | D | M6 | B, D | H6 | 946 |
| E7 | B, D | M7 | C, D | H7 | 1098240 |
| E8 | 47 | M8 | 76 | | |
| | | M9 | A | | |

**E1.** 6 letters with A three times and N twice: 6!/(3! 2!) = 60.

**E2.** C(5, 2) × C(7, 1) = 10 × 7 = 70.

**E3.** Stars and bars: C(10 + 2, 2) = 66.

**E4.** Ordered choices without repetition: P(9, 5) = 9 × 8 × 7 × 6 × 5 = 15,120.

**E5.** a is in; each of the other 5 elements is in or out: 2⁵ = 32.

**E6.** Fix one person to remove rotations: (7 − 1)! = 720. (A) 7! counts rotations as different. (D) is correct: (7 − 1)!. (C) divides by 2 as if reflections were the same. (B) 5!.

**E7.** C(10, 7) = C(10, 3) by symmetry; C(9, 2) + C(9, 3) = C(10, 3) by Pascal's rule; (10 × 9 × 8)/2! = 360 divides by the wrong factorial. P(10, 3) = 720 counts ordered selections.

**E8.** Inclusion–exclusion: ⌊100/3⌋ + ⌊100/5⌋ − ⌊100/15⌋ = 33 + 20 − 6 = 47.

**M1.** Positive solutions: C(12 − 1, 4 − 1) = C(11, 3) = 165.

**M2.** Put y₁ = x₁ − 2 and y₂ = x₂ − 3: y₁ + y₂ + x₃ = 10 in non-negative integers, C(12, 2) = 66. (A) True: the bounds are removed by the shift. (C) True: stars and bars on the shifted equation. (B) False: that ignores the lower bounds. (D) True: non-negative solutions of a sum of 15 in 3 parts.

**M3.** Positive solutions of b₁ + b₂ + b₃ = 8: C(7, 2) = 21.

**M4.** Divisible by 2, 3 or 5: (500 + 333 + 200) − (166 + 100 + 66) + 33 = 734. So 1000 − 734 = 266.

**M5.** All strings minus strings with no a: 5⁴ − 4⁴ = 625 − 256 = 369.

**M6.** All committees minus all-male ones: C(10, 4) − C(6, 4) = 210 − 15 = 195. (C) False: C(10, 4) − C(6, 4) = 210 − 15 = 195. (B) True: C(6, 4). (D) True: C(4, 2) × C(6, 2) = 6 × 15. (A) False: there is only C(4, 4) = 1.

**M7.** Inclusion–exclusion gives D₄ = 24 − 24 + 12 − 4 + 1 = 9, which is also statement (D), and D₅ = 44. The true recurrence is Dₙ = (n − 1)(Dₙ₋₁ + Dₙ₋₂); (B) would give D₅ = 5 × 9 = 45. So D₅ = 45 is false: inclusion–exclusion gives 120 − 120 + 60 − 20 + 5 − 1 = 44.

**M8.** Involutions: 0 pairs (1) + 1 pair (C(6, 2) = 15) + 2 pairs (C(6, 2)C(4, 2)/2! = 45) + 3 pairs (15) = 76.

**M9.** Place the six 0s; they create 7 gaps, and the four 1s go in distinct gaps: C(7, 4) = 35.

**H1.** Arrange the 7 non-S letters (M, I × 4, P × 2): 7!/(4! 2!) = 105. They create 8 gaps; choose 4 for the S's: C(8, 4) = 70. Total 105 × 70 = 7350.

**H2.** Inclusion–exclusion over the empty targets: 3⁵ − 3 × 2⁵ + 3 × 1⁵ = 243 − 96 + 3 = 150. (C) True: 3⁵. (A) True: inclusion–exclusion: 243 − 96 + 3. (B) False: no function from 5 elements into 3 is one-to-one. (D) True: 243 − 150.

**H3.** Without the cap, 66 solutions. Those with x₁ ≥ 6: set x₁′ = x₁ − 6, sum 4, C(6, 2) = 15; the same for x₂ and x₃. Two variables cannot both be ≥ 6 (that needs 12 > 10). So 66 − 45 = 21.

**H4.** These paths are counted by the Catalan number C₅ = C(10, 5)/6 = 252/6 = 42.

**H5.** (C) 6!/(2!³ 3!) = 15. (A) C(6, 3)/2 = 10, not 20. (D) Labelling the pairs multiplies (C) by 3! = 90. (B) C(6, 2) = 15, not 30 (the groups differ in size, so there is no division, and no doubling either).

**H6.** With x₁ = 2k, the other three sum to 20 − 2k: C(22 − 2k, 2) solutions. Summing for k = 0 to 10: 231 + 190 + 153 + 120 + 91 + 66 + 45 + 28 + 15 + 6 + 1 = 946.

**H7.** Choose the pair's rank (13) and two suits (C(4, 2) = 6), then three other ranks (C(12, 3) = 220) and a suit for each (4³ = 64): 13 × 6 × 220 × 64 = 1,098,240.

```python run Recomputing Set P1
from math import comb, perm, factorial as f
from itertools import product, permutations, combinations

def count(cond, n, k):                     # non-negative solutions of x1..xk = n
    return sum(1 for x in product(range(n + 1), repeat=k - 1) if sum(x) <= n
               and cond(x + (n - sum(x),)))

print('E1', f(6) // (f(3) * f(2)), 'E2', comb(5, 2) * 7, 'E3', count(lambda x: True, 10, 3),
      'E4', perm(9, 5), 'E5', 2 ** 5, 'E6', f(6))
print('E7', comb(10, 7), comb(9, 2) + comb(9, 3), 10 * 9 * 8 // 6, perm(10, 3),
        '| C(10,3) =',
      comb(10, 3))
print('E8', sum(1 for i in range(1, 101) if i % 3 == 0 or i % 5 == 0))
print('M1', count(lambda x: min(x) >= 1, 12, 4), 'M2', count(lambda x: x[0] >= 2
        and x[1] >= 3, 15, 3),
      'M3', count(lambda x: min(x) >= 1, 8, 3),
      'M4', sum(1 for i in range(1, 1001) if i % 2 and i % 3 and i % 5))
print('M5', sum(1 for s in product('abcde', repeat=4) if 'a' in s),
      # people 6-9 are women
      'M6', sum(1 for c in combinations(range(10), 4) if max(c) >= 6))
der = lambda n: sum(1 for p in permutations(range(n)) if all(p[i] != i for i in range(n)))
print('M7 D4 =', der(4), 'D5 =', der(5),
      'M8', sum(1 for p in permutations(range(6)) if all(p[p[i]] == i for i in range(6))),
      'M9', sum(1 for s in product('01', repeat=10) if s.count('1') == 4
              and '11' not in ''.join(s)))
from sympy.utilities.iterables import multiset_permutations
h1 = sum(1 for w in multiset_permutations('MISSISSIPPI') if 'SS' not in ''.join(w))
print('H1', h1, 'H2', sum(1 for g in product(range(3), repeat=5) if len(set(g)) == 3),
      'H3', count(lambda x: max(x) <= 5, 10, 3))
paths = 0
for steps in combinations(range(10), 5):          # positions of the right moves
    x = y = 0; ok = True
    for i in range(10):
        if i in steps: x += 1
        else: y += 1
        ok &= y <= x
    paths += ok
print('H4', paths)
def groupings(sizes):                     # unordered groups, as a set of frozensets
    people = range(6); seen = set()
    for p in permutations(people):
        out, i = [], 0
        for s in sizes:
            out.append(frozenset(p[i:i + s])); i += s
        seen.add(frozenset(out))
    return len(seen)
print('H5 pairs', groupings([2, 2, 2]), 'triples', groupings([3, 3]), 'labelled pairs',
      f(6) // 8, 'two+four', groupings([2, 4]))
print('H6', count(lambda x: x[0] % 2 == 0, 20, 4), 'H7', 13 * 6 * comb(12, 3) * 4 ** 3)
```

## Solutions: Set P2

| Q | Answer | Q | Answer | Q | Answer |
|---|---|---|---|---|---|
| E1 | C | M1 | B, C, D | H1 | 0.48 |
| E2 | 0.14 | M2 | D | H2 | 0.62 |
| E3 | C | M3 | 0.62 | H3 | D |
| E4 | D | M4 | A, B, C | H4 | A, B, C |
| E5 | B, D | M5 | 0.57 | H5 | B, C |
| E6 | 0.33 | M6 | A | H6 | 0.36 |
| E7 | A | M7 | 0.064 | H7 | 0.43 |
| E8 | 0.4 | M8 | C, D | | |
| | | M9 | D | | |

**E1.** 0.5 + 0.4 − 0.5 × 0.4 = 0.7.

**E2.** (2, 6), (3, 5), (4, 4), (5, 3), (6, 2): 5/36 ≈ 0.14.

**E3.** Mutually exclusive events cannot occur together: 0.

**E4.** P(A ∩ B) = P(A) P(B | A) = 0.3. (A) that is P(A) − P(B | A). (D) is correct: P(A) P(B | A). (C) that is P(B | A). (B) probabilities cannot exceed 1.

**E5.** (C) is backwards: P(A ∪ B) ≤ P(A) + P(B). P(A ∩ B) ≥ P(A) is also backwards, because A ∩ B is a subset of A. The other two follow from the axioms.

**E6.** 4 kings among 12 face cards: 1/3 ≈ 0.33.

**E7.** 1 − (1/2)³ = 7/8.

**E8.** P(A ∩ B) = 0.4 + 0.5 − 0.7 = 0.2, so P(A | B) = 0.2/0.5 = 0.4.

**M1.** P(D) = 0.005 + 0.006 + 0.006 = 0.017, and P(M3 | D) = 0.006/0.017 ≈ 0.35. M3 makes the least but contributes as much to defects as M2. (D) True: 0.005 + 0.006 + 0.006. (B) True: 0.006/0.017. (A) False: M1 gives 0.005/0.017 ≈ 0.29, less than 0.35. (C) True: both joint probabilities are 0.006.

**M2.** (1/3)(3/4) + (2/3)(1/4) = 3/12 + 2/12 = 5/12.

**M3.** 1 − (12 × 11 × 10 × 9 × 8)/12⁵ = 1 − 95040/248832 ≈ 0.62.

**M4.** P(A) = 1/2, P(B) = P(C) = 1/6. P(A ∩ B) = 3/36, P(A ∩ C) = 3/36 and P(B ∩ C) = 1/36 all factorise. But P(A ∩ B ∩ C) = P((6, 1)) = 1/36 ≠ 1/72, so the three are not mutually independent.

**M5.** P(both red) = (5/8)(4/7) = 5/14, and P(second red) = 5/8 by symmetry. So 5/14 ÷ 5/8 = 4/7 ≈ 0.57.

**M6.** Switching wins whenever the first pick was wrong, which has probability 2/3.

**M7.** All of the first three tosses are tails: 0.4³ = 0.064.

**M8.** P(free) = 0.4 × 0.6 + 0.6 × 0.05 = 0.27, so P(spam | free) = 0.24/0.27 ≈ 0.89. (A) False: it is 0.4 × 0.6 + 0.6 × 0.05 = 0.27.24 + 0.03. (D) True: 0.24/0.27. (B) False: it is 0.16/0.73 ≈ 0.22. (C) True: from 0.40 to 0.89.

**M9.** P(A ∩ B) = P(A) + P(B) − P(A ∪ B) ≥ 0.5 + 0.6 − 1 = 0.1.

**H1.** P(++ | D) = 0.95² = 0.9025 and P(++ | healthy) = 0.1² = 0.01. P(D | ++) = 0.01 × 0.9025/(0.01 × 0.9025 + 0.99 × 0.01) = 0.009025/0.018925 ≈ 0.48. Even two positives leave the odds near even, because the disease is rare.

**H2.** Onto assignments over all assignments: 150/243 ≈ 0.62 (using P1.H2).

**H3.** For a fair game, P(reach N from i) = i/N = 3/10.

**H4.** P(R₁ R₂) = (1/2)(2/3) = 1/3 and P(R₂) = 1/2 (by symmetry of the colours). So P(R₁ | R₂) = (1/3)/(1/2) = 2/3 ≈ 0.67. (A) True: by the symmetry of the colours. (C) True: (1/2)(2/3). (B) True: (1/3)/(1/2). (D) False: P(both red) = 1/3 ≠ 1/4.

**H5.** (C) P(Aᶜ ∩ Bᶜ) = 1 − P(A) − P(B) + P(A)P(B) = (1 − P(A))(1 − P(B)). (D) Exclusive events with positive probability are dependent. (B) Both equal the statement P(A ∩ B) = P(A)P(B). (A) Independence would need P(A) = P(A)P(B), so P(B) = 1, which is excluded.

**H6.** 11 outcomes have a 3. Their sums are 4, 5, 6, 7, 8, 9 (first die 3) and 4, 5, 7, 8, 9 (second die 3, excluding (3, 3)). The primes are 5, 7, 5 and 7: 4/11 ≈ 0.36.

**H7.** If a white ball moves (probability 3/5), B has 3 white out of 6; if a black one moves (2/5), 2 white out of 6. P = (3/5)(3/6) + (2/5)(2/6) = 13/30 ≈ 0.43.

```python run Recomputing Set P2
from fractions import Fraction as F
from itertools import product

dice = list(product(range(1, 7), repeat=2))
P = lambda ev: F(sum(1 for w in dice if ev(w)), 36)
print('E2', P(lambda w: sum(w) == 8), round(float(P(lambda w: sum(w) == 8)), 4),
      'E6', round(4 / 12, 4), 'E7', 1 - F(1, 8), 'E8', (F(4, 10) + F(5, 10) - F(7,
              10)) / F(5, 10))
pd = F(5, 1000) + F(6, 1000) + F(6, 1000)
print('M1', round(float(F(6, 1000) / pd), 4), 'M2', F(1, 3) * F(3, 4) + F(2, 3) * F(1, 4),
      'M3', round(1 - 12 * 11 * 10 * 9 * 8 / 12 ** 5, 4))
A = lambda w: w[0] % 2 == 0; B = lambda w: sum(w) == 7; C = lambda w: w[1] == 1
print('M4', P(lambda w: A(w) and B(w)) == P(A) * P(B), P(lambda w: A(w)
        and C(w)) == P(A) * P(C),
      P(lambda w: B(w) and C(w)) == P(B) * P(C),
      P(lambda w: A(w) and B(w) and C(w)), P(A) * P(B) * P(C))
balls = 'RRRRRBBB'
pairs = [(i, j) for i in range(8) for j in range(8) if i != j]
rr = sum(1 for i, j in pairs if balls[i] == balls[j] == 'R')
r2 = sum(1 for i, j in pairs if balls[j] == 'R')
print('M5', F(rr, r2), round(rr / r2, 4), 'M7', round(0.4 ** 3, 4),
      'M8', round(0.24 / 0.27, 4), 'M9', round(0.5 + 0.6 - 1, 4))
wins = 0
for prize, pick in product(range(3), repeat=2):
    wins += prize != pick   # switching wins exactly when the pick was wrong
print('M6 switching wins', F(wins, 9))
num = F(1, 100) * F(95, 100) ** 2
print('H1', round(float(num / (num + F(99, 100) * F(1, 10) ** 2)), 4),
      'H2', round(float(F(sum(1 for g in product(range(3), repeat=5) if len(set(g)) == 3),
              243)), 4))
import random
random.seed(5)
def ruin(i=3, n=10):
    while 0 < i < n:
        i += random.choice((-1, 1))
    return i == n
print('H3 simulated', sum(ruin() for _ in range(40_000)) / 40_000, 'exact 0.3')
print('H4', F(1, 3) / F(1, 2), round(2 / 3, 4))
with3 = [w for w in dice if 3 in w]
primes = {2, 3, 5, 7, 11}
print('H6', F(sum(1 for w in with3 if sum(w) in primes), len(with3)), round(4 / 11, 4),
      'H7', F(3, 5) * F(3, 6) + F(2, 5) * F(2, 6), round(13 / 30, 4))
```
