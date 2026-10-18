# Chapter 7: Calculus and Optimisation
%Limits, continuity and differentiability, Taylor series, series sums, maxima and minima, convexity and gradient descent

## 7.1 Limits

lim_(x→a) f(x) = L means f(x) gets arbitrarily close to L as x approaches a (from both sides). The limit exists only if the left and right limits agree.

| Technique | When | Example |
|---|---|---|
| Direct substitution | f is continuous at a | lim_(x→2) (x² + 1) = 5 |
| Factorise and cancel | 0/0 from polynomials | (x² − 9)/(x − 3) → 6 as x → 3 |
| Rationalise | Differences of square roots | √(x² + 4x) − x → 2 as x → ∞ |
| Divide by the highest power | ∞/∞ with polynomials | (3x² + 1)/(5x² − x) → 3/5 |
| L'Hôpital's rule | 0/0 or ∞/∞ with differentiable functions | (eˣ − 1 − x)/x² → 1/2 as x → 0 |
| Standard limits | Building blocks | sin x / x → 1, (1 + 1/n)ⁿ → e, (eˣ − 1)/x → 1, ln(1 + x)/x → 1 |

**Rationalising at infinity.** √(x² + ax) − x = ax / (√(x² + ax) + x) → a/2. Students often answer 0, wrongly treating √(x² + ax) as x.

**Exponential and factorial.** For any fixed a, aⁿ/n! → 0, and Σₙ aⁿ/n! = eᵃ. So, for example, Σₖ₌₀^∞ (−1)ᵏ/k! = e^(−1).

```python run Checking the limits with SymPy
import sympy as sp
x, n = sp.symbols('x n', positive=True)
print(sp.limit((x**2 - 9) / (x - 3), x, 3), sp.limit(sp.sqrt(x**2 + 4 * x) - x, x, sp.oo),
      sp.limit((3 * x**2 + 1) / (5 * x**2 - x), x, sp.oo),
      sp.limit((sp.exp(x) - 1 - x) / x**2, x, 0))
k = sp.symbols('k', integer=True, nonnegative=True)
print('sum (-1)^k / k! =', sp.summation((-1)**k / sp.factorial(k), (k, 0, sp.oo)))
```

## 7.2 Continuity and differentiability

f is **continuous** at a if lim_(x→a) f(x) = f(a). It is **differentiable** at a if f′(a) = lim_(h→0) (f(a + h) − f(a))/h exists.

| Fact | Detail |
|---|---|
| Differentiable ⇒ continuous | But not the reverse: \|x\| and ReLU(x) = max(x, 0) are continuous everywhere, not differentiable at 0 |
| Sums, products, quotients (non-zero denominator), compositions | Of differentiable functions are differentiable |
| Composition with a non-differentiable outer function | May fail: \|g(x)\| fails where g(x) = 0 crosses zero |
| √g(x) | Differentiable wherever g(x) > 0 |
| Rolle's theorem | f continuous on [a, b], differentiable inside, f(a) = f(b) ⇒ f′(c) = 0 for some c in (a, b) |
| Mean value theorem | f′(c) = (f(b) − f(a))/(b − a) for some c in (a, b) |

### Worked example: a bound that forces a constant

*f satisfies |f(x) − f(y)| ≤ (x − y)² for all real x, y. Find f(5) − f(2). (NAT)*

Divide by |x − y|: |(f(x) − f(y))/(x − y)| ≤ |x − y|, which tends to 0 as y → x. So f′(x) = 0 everywhere, f is constant, and the answer is 0.

### Worked example: which functions stay differentiable?

*f : ℝ → ℝ and g : ℝ → (1, ∞) are differentiable at c. Which are always differentiable at c? (MSQ) (a) f·g (b) f/g (c) √g (d) |f|*

(a) Products are differentiable. (b) g > 1, so the quotient is fine. (c) g > 1 > 0, and √ is differentiable on (0, ∞). (d) Fails when f(c) = 0 and f′(c) ≠ 0 (take f(x) = x − c). Answer: (a), (b), (c).

## 7.3 Taylor series

f(x) = Σₖ f⁽ᵏ⁾(a)(x − a)ᵏ / k!, so the coefficient of (x − a)ᵏ is f⁽ᵏ⁾(a)/k!. To find a high derivative at a point, read it off a known series instead of differentiating repeatedly.

| Function | Series about 0 |
|---|---|
| eˣ | 1 + x + x²/2! + x³/3! + … |
| sin x | x − x³/3! + x⁵/5! − … |
| cos x | 1 − x²/2! + x⁴/4! − … |
| sinh x = (eˣ − e^(−x))/2 | x + x³/3! + x⁵/5! + … (odd powers only) |
| cosh x = (eˣ + e^(−x))/2 | 1 + x²/2! + x⁴/4! + … (even powers only) |
| ln(1 + x) | x − x²/2 + x³/3 − …, for −1 < x ≤ 1 |
| 1/(1 − x) | 1 + x + x² + …, for \|x\| < 1 |

### Worked example: a high derivative at 0

*f(x) = (eˣ + e^(−x))/2. Find f⁽⁹⁾(0) and f⁽¹⁰⁾(0). (MCQ)*

f = cosh, whose series has only even powers with coefficients 1/k!. So f⁽⁹⁾(0) = 0 and f⁽¹⁰⁾(0) = 10! × (1/10!) = 1.

## 7.4 Series sums

| Series | Sum |
|---|---|
| Geometric Σₖ₌₀^∞ rᵏ, \|r\| < 1 | 1/(1 − r) |
| Σₖ₌₁^∞ k rᵏ | r/(1 − r)² |
| Double geometric Σᵢ₌₀^∞ Σⱼ₌₀^∞ aⁱ bʲ | 1/((1 − a)(1 − b)) |
| Σₖ₌₁ⁿ k, Σ k², Σ k³ | n(n + 1)/2, n(n + 1)(2n + 1)/6, (n(n + 1)/2)² |

### Worked example: a double series

*Find Σᵢ₌₀^∞ Σⱼ₌₁^∞ 3^(−i) 4^(−j). (NAT)*

The sum factorises: (Σᵢ (1/3)ⁱ)(Σⱼ₌₁ (1/4)ʲ) = (3/2)(1/3) = 1/2. Watch the starting index: the j-sum starts at 1, so it is (1/4)/(1 − 1/4) = 1/3.

## 7.5 Maxima and minima

For f on a closed interval [a, b], the global maximum and minimum occur at a **critical point** (f′(x) = 0 or f′ undefined) or at an **endpoint**. Evaluate f at all of them and compare.

**Second-derivative test.** At a critical point c: f″(c) > 0 gives a local minimum, f″(c) < 0 a local maximum, and f″(c) = 0 is inconclusive (x³ at 0 is neither; x⁴ at 0 is a minimum).

### Worked example: a cubic on an interval

*f(x) = x³ − 6x² + 9x + 1 on [0, 5]. Find the global maximum and minimum and where f′ is smallest. (MSQ-style)*

f′(x) = 3x² − 12x + 9 = 3(x − 1)(x − 3), so the critical points are 1 and 3. Values: f(0) = 1, f(1) = 5, f(3) = 1, f(5) = 21. The global maximum is 21 at the endpoint x = 5, not at the local maximum x = 1. The minimum value 1 is attained at both x = 0 and x = 3. f′ is a parabola minimised at x = 2 (where f″(x) = 6x − 12 = 0), the inflection point.

```python run The cubic: critical points, endpoint values and the inflection point
import sympy as sp
x = sp.symbols('x')
f = x**3 - 6 * x**2 + 9 * x + 1
crit = sp.solve(sp.diff(f, x), x)
print('critical points', crit, '| values', {c: f.subs(x, c) for c in [0, *crit, 5]})
print('f\'\' = 0 at', sp.solve(sp.diff(f, x, 2), x))
print('Taylor check: 10th derivative of cosh at 0 =', sp.diff(sp.cosh(x), x, 10).subs(x, 0),
      '| 9th =', sp.diff(sp.cosh(x), x, 9).subs(x, 0))
i, j = sp.symbols('i j', integer=True)
print('double series =', sp.summation(sp.Rational(1, 3)**i, (i, 0, sp.oo))
      * sp.summation(sp.Rational(1, 4)**j, (j, 1, sp.oo)))
```

## 7.6 Convexity

f is **convex** if its graph lies below every chord; for a twice-differentiable f, this means f″(x) ≥ 0 everywhere, and f″ > 0 makes it **strictly convex**.

| Statement for strictly convex f (f″ > 0 everywhere) | True? |
|---|---|
| Any local minimum is a global minimum | Yes |
| It has at most one minimum point | Yes |
| It always has a minimum | **No**: eˣ is strictly convex with no minimum |
| f′ has at most one zero | Yes: f′ is strictly increasing |

Convexity matters in machine learning because gradient descent on a convex loss cannot get stuck in a bad local minimum. Least squares, ridge regression and logistic regression all have convex losses; neural networks do not.

## 7.7 Optimisation and gradient descent in one variable

To minimise f, **gradient descent** repeats x ← x − η f′(x) with learning rate η. For f(x) = (a/2)x², the update is x ← (1 − ηa)x: it converges if 0 < η < 2/a and diverges if η > 2/a.

### Worked example: one gradient step

*The loss is L(w) = (w − 3)², and gradient descent with η = 0.1 starts at w = 10. Find w after one step and after two steps. (NAT)*

L′(w) = 2(w − 3). Step 1: w = 10 − 0.1 × 14 = 8.6. Step 2: w = 8.6 − 0.1 × 11.2 = 7.48. Each step multiplies the distance to the minimum by 1 − 0.2 = 0.8: 7, 5.6, 4.48.

```python run Gradient descent: convergence and divergence
def descend(eta, w=10.0, steps=6):
    path = [w]
    for _ in range(steps):
        w -= eta * 2 * (w - 3)
        path.append(round(w, 4))
    return path

for eta in (0.1, 0.5, 0.9, 1.1):
    print(f'eta = {eta}:', descend(eta))
```

With η = 0.5 the first step lands exactly on the minimum. With 0.9 the iterates overshoot back and forth but still converge, and with 1.1 (above 2/a = 1) they diverge.

## 7.8 Traps

| Trap | Correct thinking |
|---|---|
| √(x² + ax) − x → 0 at infinity | Rationalise: the limit is a/2 |
| Ignoring endpoints on a closed interval | The global extreme is often at an endpoint |
| f″(c) = 0 means an inflection point | It is inconclusive; check the sign change of f″ |
| Strictly convex functions always have a minimum | eˣ has none |
| Continuous means differentiable | \|x\| and ReLU are counterexamples at 0 |
| Wrong starting index in a series | Write out the first term before using a formula |
