# Chapter 1: Counting and Probability
%Permutations, combinations, stars and bars, the axioms, conditional probability, independence and Bayes' theorem

Probability is the largest section of the paper, and most of its questions start with counting. Learn the four counting tools well and the probability follows.

## 1.1 Counting tools

| Situation | Count | Example |
|---|---|---|
| Ordered selections of r from n distinct items (no repetition) | P(n, r) = n! / (n − r)! | Gold, silver, bronze among 10 runners: 720 |
| Unordered selections of r from n | C(n, r) = n! / (r! (n − r)!) | Committees of 3 from 10: 120 |
| Ordered selections with repetition allowed | nʳ | 4-digit PINs: 10⁴ |
| Arrangements of n items with repeats n₁, n₂, … | n! / (n₁! n₂! …) | Arrangements of MISSISSIPPI: 34,650 |
| Non-negative integer solutions of x₁ + … + xₖ = n | C(n + k − 1, k − 1) (stars and bars) | x₁ + x₂ + x₃ + x₄ = 20: C(23, 3) = 1,771 |
| Positive integer solutions of x₁ + … + xₖ = n | C(n − 1, k − 1) | Same equation, each xᵢ ≥ 1: C(19, 3) = 969 |
| Subsets of an n-element set | 2ⁿ (including the empty set) | 10 items: 1,024 |
| Circular arrangements of n distinct items | (n − 1)! | 6 people at a round table: 120 |

**Stars and bars.** Write n stars in a row and place k − 1 bars among them; the stars before the first bar are x₁, and so on. Any arrangement of n stars and k − 1 bars is one solution, so there are C(n + k − 1, k − 1) solutions. For positive solutions, give each variable 1 first and distribute the remaining n − k freely.

**Inclusion–exclusion.** For two sets, |A ∪ B| = |A| + |B| − |A ∩ B|. For three sets, |A ∪ B ∪ C| = |A| + |B| + |C| − |A ∩ B| − |A ∩ C| − |B ∩ C| + |A ∩ B ∩ C|: add the singles, subtract the pairs, add the triple.

**Complements.** "At least one" is usually 1 − P(none). Throwing 100 dice, P(at least one 1) = 1 − (5/6)¹⁰⁰.

```python run Checking the counting table, and stars and bars by enumeration
from math import comb, perm, factorial
from itertools import product

print('P(10,3) =', perm(10, 3), ' C(10,3) =', comb(10, 3), ' 10^4 =', 10**4)
print('MISSISSIPPI:', factorial(11) // (factorial(4) * factorial(4) * factorial(2)))
print('x1+..+x4 = 20, non-negative:', comb(23, 3), ' positive:', comb(19, 3))
brute = sum(1 for x in product(range(21), repeat=3) if sum(x) <= 20)   # x4 = 20 - rest
print('enumerated non-negative solutions:', brute)
print('round table of 6:', factorial(5))
```

### Worked example: involutions

*How many bijections f on {1, 2, 3, 4, 5} satisfy f(f(x)) = x for every x? (NAT)*

Such a function is made of fixed points and swapped pairs. Count by the number of pairs: none (the identity, 1 way), one pair (C(5, 2) = 10 ways), two pairs (choose the fixed point in 5 ways, then pair the other four in 3 ways: 15). Total 26.

### Worked example: a random subset with an even product

*A non-empty subset S of {1, 2, …, 100} is chosen uniformly at random. What is the probability that the product of its elements is even? (MCQ)*

The product is odd exactly when every element is odd. There are 50 odd numbers, so 2⁵⁰ − 1 non-empty all-odd subsets out of 2¹⁰⁰ − 1 non-empty subsets. The answer is

P(even) = 1 − (2⁵⁰ − 1)/(2¹⁰⁰ − 1) = (2¹⁰⁰ − 2⁵⁰)/(2¹⁰⁰ − 1) = 2⁵⁰(2⁵⁰ − 1)/(2¹⁰⁰ − 1).

The trap is forgetting that the empty set is excluded from both counts.

```python run Involutions, and the subset formula checked on a small set
from itertools import permutations, combinations
from fractions import Fraction

inv = [p for p in permutations(range(5)) if all(p[p[i]] == i for i in range(5))]
print('involutions on 5 elements:', len(inv))

n = 10                                        # {1..10}: 5 odd numbers
subsets = [c for r in range(1, n + 1) for c in combinations(range(1, n + 1), r)]
even = sum(1 for c in subsets if any(x % 2 == 0 for x in c))
odd = n // 2
print('brute force:', Fraction(even, len(subsets)),
      ' formula:', Fraction(2**odd * (2**odd - 1), 2**n - 1))
```

## 1.2 The axioms and their consequences

A probability P on a sample space Ω satisfies P(A) ≥ 0, P(Ω) = 1, and P(A ∪ B) = P(A) + P(B) for disjoint A and B. Everything else follows:

| Result | Formula |
|---|---|
| Complement | P(Aᶜ) = 1 − P(A) |
| Union | P(A ∪ B) = P(A) + P(B) − P(A ∩ B) |
| Monotonicity | A ⊆ B ⇒ P(A) ≤ P(B) |
| Bounds | max(0, P(A) + P(B) − 1) ≤ P(A ∩ B) ≤ min(P(A), P(B)) |
| Equally likely outcomes | P(A) = \|A\| / \|Ω\| |

**Mutually exclusive** means A ∩ B = ∅, so P(A ∩ B) = 0. **Independent** means P(A ∩ B) = P(A) P(B). These are different ideas: two events with positive probability that are mutually exclusive are never independent, because knowing one occurred tells you the other did not.

## 1.3 Conditional probability and independence

P(A | B) = P(A ∩ B) / P(B) for P(B) > 0. Rearranged, this is the **multiplication rule** P(A ∩ B) = P(B) P(A | B), which extends to chains:

P(A ∩ B ∩ C) = P(A) P(B | A) P(C | A ∩ B).

Events A₁, …, Aₙ are **mutually independent** when every sub-collection multiplies, not just every pair. Pairwise independence is weaker: toss two fair coins and let A = first is heads, B = second is heads, C = both show the same face. Each pair is independent, but P(A ∩ B ∩ C) = 1/4 ≠ 1/8.

**Total probability.** If B₁, …, Bₙ partition Ω, then P(A) = Σ P(A | Bᵢ) P(Bᵢ).

**Bayes' theorem.** P(Bᵢ | A) = P(A | Bᵢ) P(Bᵢ) / Σⱼ P(A | Bⱼ) P(Bⱼ).

### Worked example: a diagnostic test

*A disease affects 20% of a population. A test is positive for 90% of people with the disease and for 5% of people without it. Given a positive test, what is the probability the person has the disease? (NAT, two decimal places)*

P(+) = 0.9 × 0.2 + 0.05 × 0.8 = 0.18 + 0.04 = 0.22, so P(D | +) = 0.18 / 0.22 ≈ 0.82. Even a good test leaves an 18% chance of a false alarm, because healthy people outnumber sick ones four to one.

### Worked example: boxes of balls

*Box 1 has 3 black and 1 white ball, Box 2 has 1 black and 3 white, Box 3 has 2 black and 2 white. A box is chosen with probabilities 1/2, 1/4 and 1/4, and a ball is drawn. Given that it is white, what is the probability it came from Box 2? (NAT, two decimal places)*

P(W) = (1/2)(1/4) + (1/4)(3/4) + (1/4)(1/2) = 2/16 + 3/16 + 2/16 = 7/16. Then P(Box 2 | W) = (3/16) / (7/16) = 3/7 ≈ 0.43.

```python run Bayes examples, and pairwise but not mutual independence
from fractions import Fraction as F
from itertools import product

p_pos = F(9, 10) * F(2, 10) + F(5, 100) * F(8, 10)
print('P(D | +) =', F(9, 10) * F(2, 10) / p_pos, '=', round(float(F(18, 22)), 4))

prior = [F(1, 2), F(1, 4), F(1, 4)]
white = [F(1, 4), F(3, 4), F(1, 2)]
pw = sum(p * w for p, w in zip(prior, white))
print('P(W) =', pw, ' P(Box 2 | W) =', prior[1] * white[1] / pw)

omega = list(product('HT', repeat=2))
A = {w for w in omega if w[0] == 'H'}
B = {w for w in omega if w[1] == 'H'}
C = {w for w in omega if w[0] == w[1]}
P = lambda e: F(len(e), 4)
print('pairs independent:', P(A & B) == P(A) * P(B), P(A & C) == P(A) * P(C),
      P(B & C) == P(B) * P(C), '| triple:', P(A & B & C), 'vs', P(A) * P(B) * P(C))
```

## 1.4 Classic models

| Model | Answer |
|---|---|
| Birthday problem: n people, 365 days | P(all different) = (365 × 364 × … × (365 − n + 1)) / 365ⁿ; below 1/2 from n = 23 |
| Derangements (nobody gets their own hat) | Dₙ = n! Σₖ (−1)ᵏ / k!; Dₙ / n! → 1/e ≈ 0.368 |
| Drawing without replacement | Hypergeometric: C(K, k) C(N − K, n − k) / C(N, n) |
| First success on trial k | (1 − p)ᵏ⁻¹ p (geometric) |
| Gambler's ruin with a fair coin, start at i, stop at 0 or N | P(reach N) = i / N |

```python run Birthday threshold and derangements
from math import factorial, prod, e

def p_distinct(n):
    return prod((365 - i) / 365 for i in range(n))

print('n = 22:', round(1 - p_distinct(22), 4), ' n = 23:', round(1 - p_distinct(23), 4))
for n in (4, 5, 10):
    d = round(factorial(n) / e)
    print(f'D_{n} = {d}, ratio {d / factorial(n):.4f}')
```

## 1.5 Traps

| Trap | Correct thinking |
|---|---|
| Treating "mutually exclusive" as "independent" | Disjoint events with positive probability are dependent |
| Counting ordered outcomes in the numerator but unordered in the denominator | Use the same model (ordered or unordered) for both |
| Forgetting the empty set in subset questions | Read whether the subset must be non-empty |
| Confusing P(A \| B) with P(B \| A) | Write Bayes' theorem out; the base rate matters |
| Stars and bars with lower bounds | Subtract the lower bounds first, then count non-negative solutions |
| Assuming pairwise independence gives mutual independence | Check the triple intersection too |

# Chapter 2: Random Variables
%PMFs, PDFs and CDFs, expectation and variance, covariance and correlation, conditional expectation and descriptive statistics

## 2.1 Distribution functions

A random variable X maps outcomes to numbers. Its **cumulative distribution function** F(x) = P(X ≤ x) exists for every random variable and has four properties: it is non-decreasing, right-continuous, tends to 0 as x → −∞ and to 1 as x → +∞.

| Discrete X | Continuous X |
|---|---|
| PMF p(x) = P(X = x), Σ p(x) = 1 | PDF f(x) ≥ 0, ∫ f(x) dx = 1, and P(X = x) = 0 |
| F jumps by p(x) at each value; flat in between | F is continuous; f(x) = F′(x) where it exists |
| P(a < X ≤ b) = F(b) − F(a) | P(a ≤ X ≤ b) = ∫ₐᵇ f(x) dx = F(b) − F(a) |

The CDF of a discrete variable is a step function: it has jump discontinuities and is right-continuous, not left-continuous. A CDF can be zero (for small x), so it is not always positive.

The **median** m satisfies F(m) = 1/2 for a continuous variable. The **p-th quantile** solves F(x) = p.

### Worked example: a median from a CDF

*X is uniform on [t, 6], so F(x) = (x − t)/(6 − t) for t ≤ x ≤ 6. If the median is 4, find t. (MCQ)*

(4 − t)/(6 − t) = 1/2 gives 8 − 2t = 6 − t, so t = 2. (A uniform's median is the midpoint of its interval: (t + 6)/2 = 4.)

### Worked example: P(X² ≤ 1) from a CDF

*F(x) = (x + 2)²/16 for −2 ≤ x ≤ 2, 0 below and 1 above. Find P(X² ≤ 1). (MCQ)*

P(−1 ≤ X ≤ 1) = F(1) − F(−1) = 9/16 − 1/16 = 0.5. (X is continuous, so the endpoints carry no probability.)

## 2.2 Expectation and variance

E[X] = Σ x p(x) or ∫ x f(x) dx, and E[g(X)] = Σ g(x) p(x) or ∫ g(x) f(x) dx: you never need the distribution of g(X) itself.

| Property | Formula |
|---|---|
| Linearity (always, even for dependent variables) | E[aX + bY + c] = a E[X] + b E[Y] + c |
| Variance | Var(X) = E[(X − μ)²] = E[X²] − (E[X])² |
| Scaling | Var(aX + b) = a² Var(X) |
| Sum | Var(X + Y) = Var(X) + Var(Y) + 2 Cov(X, Y) |
| Independent X, Y | E[XY] = E[X] E[Y]; Var(X + Y) = Var(X) + Var(Y) |
| Product of independent variables | Var(XY) = E[X²] E[Y²] − (E[X] E[Y])² |
| Non-negative X | E[X] = ∫₀^∞ P(X > x) dx; for integers, E[X] = Σₖ≥₁ P(X ≥ k) |

### Worked example: the sample proportion

*Xᵢ are independent Bernoulli(p) coin tosses and p̂ = (1/n) Σ Xᵢ. Which are correct? (MSQ) (a) E[p̂] = p (b) E[p̂] = p/n (c) Var(p̂) decreases as n grows (d) Var(p̂) does not depend on n*

E[p̂] = (1/n)(np) = p, and Var(p̂) = (1/n²)(n p(1 − p)) = p(1 − p)/n, which falls as n grows. Correct: (a) and (c).

## 2.3 Covariance and correlation

Cov(X, Y) = E[(X − μₓ)(Y − μᵧ)] = E[XY] − E[X] E[Y], and ρ = Cov(X, Y) / (σₓ σᵧ), which lies in [−1, 1].

| Fact | Detail |
|---|---|
| Bilinearity | Cov(aX + b, cY + d) = ac Cov(X, Y) |
| Self-covariance | Cov(X, X) = Var(X) |
| Independence ⇒ zero covariance | But not the reverse: X uniform on [−1, 1] and Y = X² have Cov = E[X³] = 0, yet Y is a function of X |
| \|ρ\| = 1 | Exactly when Y = aX + b with a ≠ 0 |
| Correlation is unit-free | ρ(aX + b, cY + d) = sign(ac) ρ(X, Y) |

### Worked example: covariance when Y depends on X

*X is uniform on (−1, 1), and given X = x, Y is uniform on (3x − 0.2, 3x + 0.2). Find Cov(X, Y). (NAT)*

E[Y | X] = 3X, so E[XY] = E[X · E[Y | X]] = 3E[X²] = 3 × (1/3) = 1, and E[X] = 0. So Cov(X, Y) = 1. The width of the conditional interval does not matter: it changes Var(Y), not the covariance.

## 2.4 Conditional expectation and variance

E[X | Y] is a random variable: a function of Y. Its two key laws are:

- **Tower rule (law of total expectation):** E[E[X | Y]] = E[X].
- **Law of total variance:** Var(X) = E[Var(X | Y)] + Var(E[X | Y]).

The tower rule is the fastest route to many answers. In the example above, E[XY] = E[X E[Y | X]] needed no integral over Y at all.

### Worked example: a random number of terms

*N is the number of customers in an hour, with E[N] = 10 and Var(N) = 4. Each spends an independent amount with mean 50 and variance 100, independent of N. Find the mean and variance of total spending S. (NAT)*

E[S | N] = 50N and Var(S | N) = 100N. So E[S] = 50 × 10 = 500, and Var(S) = E[100N] + Var(50N) = 1000 + 2500 × 4 = 11,000.

```python run Checking the Chapter 2 examples by exact arithmetic and simulation
import random
from fractions import Fraction as F

F_cdf = lambda x: (x + 2) ** 2 / 16
print('median t: solve (4 - t) / (6 - t) = 1/2 ->', 2, ' check:', (4 - 2) / (6 - 2))
print('P(X^2 <= 1) =', F_cdf(1) - F_cdf(-1))

random.seed(1)
xs = [random.uniform(-1, 1) for _ in range(200_000)]
ys = [random.uniform(3 * x - 0.2, 3 * x + 0.2) for x in xs]
mx, my = sum(xs) / len(xs), sum(ys) / len(ys)
cov = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / len(xs)
print(f'Cov(X, Y): simulated {cov:.4f}, exact 1')

totals = []
for _ in range(100_000):
    n = random.choice([8, 12])                   # mean 10, variance 4
    totals.append(sum(random.gauss(50, 10) for _ in range(n)))
m = sum(totals) / len(totals)
v = sum((t - m) ** 2 for t in totals) / len(totals)
print(f'random sum: mean {m:.1f} (exact 500), variance {v:.0f} (exact 11000)')
```

The simulated values agree with the exact answers to within sampling error. The second check uses N equal to 8 or 12 with equal probability, one distribution with mean 10 and variance 4; the formula holds for any such N.

## 2.5 Descriptive statistics

For data x₁, …, xₙ with mean x̄:

| Measure | Definition | Note |
|---|---|---|
| Mean | x̄ = (1/n) Σ xᵢ | Pulled by outliers |
| Median | Middle value of the sorted data (average of the two middle values if n is even) | Robust to outliers |
| Mode | Most frequent value | May not be unique |
| Population variance | (1/n) Σ (xᵢ − x̄)² | Divides by n |
| Sample variance | s² = (1/(n − 1)) Σ (xᵢ − x̄)² | Unbiased estimator of σ² |
| Pairwise identity | Σᵢ Σⱼ (xᵢ − xⱼ)² = 2n Σᵢ (xᵢ − x̄)² | Turns pairwise differences into a variance |

For a symmetric distribution, mean = median. For right skew (a long right tail), usually mean > median > mode.

### Worked example: the pairwise identity

*For 50 numbers, (1/500) Σᵢ Σⱼ (xᵢ − xⱼ)² = 49. Find the sample variance (1/49) Σ (xᵢ − x̄)². (NAT)*

Σᵢ Σⱼ (xᵢ − xⱼ)² = 500 × 49, and it also equals 2n Σ (xᵢ − x̄)² = 100 Σ (xᵢ − x̄)². So Σ (xᵢ − x̄)² = 245, and dividing by 49 gives 5.

```python run The pairwise identity on random data
import random
random.seed(7)
x = [random.gauss(0, 3) for _ in range(100)]
m = sum(x) / len(x)
lhs = sum((a - b) ** 2 for a in x for b in x)
rhs = 2 * len(x) * sum((a - m) ** 2 for a in x)
print(f'double sum {lhs:.6f}  2n * sum of squares {rhs:.6f}')
```

## 2.6 Traps

| Trap | Correct thinking |
|---|---|
| Var(X − Y) = Var(X) − Var(Y) | Variances add: Var(X − Y) = Var(X) + Var(Y) − 2Cov(X, Y) |
| Var(2X) = 2 Var(X) | Var(2X) = 4 Var(X) |
| E[1/X] = 1/E[X], E[X²] = (E[X])² | Only linear functions pass through expectation |
| Zero covariance means independence | Only for jointly normal variables |
| Treating E[X \| Y] as a number | It is a function of Y; take E of it to get E[X] |
| Using n − 1 when the question says "population variance" | Read which variance is asked |
| CDF of a discrete variable is left-continuous | It is right-continuous, with jumps |
