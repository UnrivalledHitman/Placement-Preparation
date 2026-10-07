# How to use this guide
%What this book adds to the existing aptitude sets, the TCS NQT format, and how to practise against the clock

This repository already has 11 chapter-wise quantitative sets (simplification to data interpretation), 20 mixed quantitative sets and 13 verbal sets. This guide covers what those sets do not: **number system, interest, mixtures, permutations and combinations, probability, clocks and calendars, and logical reasoning** (series, coding–decoding, blood relations, directions, seating arrangements, syllogisms, data sufficiency, puzzles), plus **shortcut techniques**. The companion book, **TCS NQT Timed Mock Tests**, has three timed mocks with full solutions.

Every numerical answer in both books was computed by a Python program, by brute force wherever the search space is small (counting arrangements one by one, trying every possible age, simulating a clock), so the answers do not depend on a formula having been applied correctly. You do not need Python for the exam; the programs are there so that you can trust the keys and see a second way to the answer.

## The exam

TCS changes the NQT pattern from time to time, so check the official notice on the TCS iON website before your exam. A typical **Foundation** section looks like this:

| Section | Questions | Time | Topics |
|---|---|---|---|
| Numerical ability | ~20 | ~25 min | Arithmetic, number system, P&C, probability, DI |
| Verbal ability | ~25 | ~25 min | Covered by the repository's verbal sets |
| Reasoning ability | ~20 | ~25 min | Series, coding, relations, directions, arrangements, syllogisms, puzzles |

That is about **75 seconds per question**, so speed matters as much as method. There is no negative marking in recent patterns: never leave a question blank.

## How to study this book

| Week | Chapters | Daily routine |
|---|---|---|
| 1 | 1–2: number system, interest, mixtures | Read, then solve the chapter's practice questions with a 75-second timer each |
| 2 | 3–4: P&C, probability, clocks, calendars | Same |
| 3 | 5–6: logical reasoning | Same; draw a diagram for every relation, direction and arrangement question |
| 4 | 7 and the mock tests | One mock every two days under exam conditions; review every wrong answer the next day |

> TIP: In the exam, do a first pass answering every question you can solve in under a minute, marking the rest. Then return to the marked ones. The worst use of time is fighting one hard question for five minutes while three easy ones wait.

# Chapter 1: Number System
%Divisibility, HCF and LCM, remainders, unit digits, trailing zeros and bases

## 1.1 Divisibility rules

| Divisor | Rule | Example |
|---|---|---|
| 3, 9 | Sum of digits divisible by 3 (9) | 7 452: 7+4+5+2 = 18 → divisible by 9 |
| 4 | Last two digits divisible by 4 | 3 716: 16 ✓ |
| 8 | Last three digits divisible by 8 | 21 912: 912 = 8 × 114 ✓ |
| 11 | (Sum of odd-position digits) − (sum of even-position digits) divisible by 11 | 2 728: (2+2) − (7+8) = −11 ✓ |
| 6, 12, 15… | Check co-prime factors: 6 = 2 × 3, 12 = 3 × 4, 15 = 3 × 5 | — |
| 7 | Double the last digit and subtract from the rest; repeat | 343: 34 − 6 = 28 ✓ |

**Example 1.1.** The six-digit number 5x28x4 has the digit *x* in two places. Find *x* so that the number is divisible (a) by 9; (b) by 11, if possible.

```python run Example 1.1 by trying every digit
for x in range(10):
    n = int(f'5{x}28{x}4')
    print(x, n, 'div by 9' if n % 9 == 0 else '', 'div by 11' if n % 11 == 0 else '')
```

Digit sum = 19 + 2x must be a multiple of 9, so 2x = 8 and **x = 4** (542 844). For 11: odd positions 5 + 2 + x and even positions x + 8 + 4 give 7 + x − (12 + x) = −5 for every x, so the number is **never** divisible by 11. The program confirms both: only x = 4 works for 9, and no digit works for 11.

## 1.2 HCF and LCM

For two numbers, **HCF × LCM = product of the numbers**. The HCF of fractions is HCF(numerators) / LCM(denominators); the LCM of fractions is LCM(numerators) / HCF(denominators).

| Question type | Use |
|---|---|
| Largest number dividing *a*, *b*, *c* leaving the same remainder | HCF of the differences (b − a), (c − b) |
| Smallest number which, divided by *a*, *b*, *c*, leaves remainder *r* each time | LCM(a, b, c) + r |
| Bells ringing together, runners meeting at the start | LCM of the intervals |
| Largest tile size, equal groups | HCF |

**Example 1.2.** Find the greatest number that divides 1 657 and 2 037 leaving remainders 6 and 5 respectively. **Example 1.3.** Three bells ring every 12, 18 and 30 minutes. They ring together at 9:00 a.m. When do they next ring together?

```python run Examples 1.2 and 1.3
from math import gcd
print('1.2:', gcd(1657 - 6, 2037 - 5))
print('    check by brute force:',
      max(d for d in range(1, 2000) if 1657 % d == 6 and 2037 % d == 5))
lcm = 12 * 18 // gcd(12, 18)
lcm = lcm * 30 // gcd(lcm, 30)
h, m = 9 + lcm // 60, lcm % 60
print(f'1.3: every {lcm} minutes -> next at {h}:{m:02d}', '(noon)' if h == 12 else '')
```

1 651 and 2 032 must both be multiples of the answer: HCF(1 651, 2 032) = **127**. The bells meet every LCM(12, 18, 30) = 180 minutes, so next at **12:00 noon**.

## 1.3 Remainders and unit digits

| Tool | Statement | Use |
|---|---|---|
| Remainder of a product or sum | Take remainders first: (a × b) mod n = (a mod n × b mod n) mod n | Large expressions |
| Negative remainders | 47 ≡ −2 (mod 7) | Powers: 47<sup>9</sup> ≡ (−2)<sup>9</sup> = −512 ≡ ? |
| Fermat's little theorem | a<sup>p−1</sup> ≡ 1 (mod p) for prime p not dividing a | Remainders of large powers |
| Unit digit cycles | 2: 2,4,8,6; 3: 3,9,7,1; 7: 7,9,3,1; 8: 8,4,2,6 (period 4); 4, 9: period 2; 0,1,5,6: fixed | Unit digit of 7<sup>95</sup>: 95 mod 4 = 3 → 3 |
| Trailing zeros of n! | ⌊n/5⌋ + ⌊n/25⌋ + ⌊n/125⌋ + … | Count factors of 5 |

**Example 1.4.** Remainder when 47<sup>9</sup> is divided by 7. **Example 1.5.** Unit digit of 7<sup>95</sup> × 3<sup>58</sup>. **Example 1.6.** Number of trailing zeros in 250!. **Example 1.7.** Remainder of 2<sup>100</sup> divided by 101.

```python run Examples 1.4 to 1.7, checked with exact integers
from math import factorial
print('1.4:', pow(47, 9, 7))
print('1.5:', (7 ** 95 * 3 ** 58) % 10)
f = str(factorial(250))
zeros = len(f) - len(f.rstrip('0'))
print('1.6:', zeros, '(formula:', 250 // 5 + 250 // 25 + 250 // 125, ')')
print('1.7:', pow(2, 100, 101))
```

1.4: 47 ≡ 5 ≡ −2 (mod 7), so 47<sup>9</sup> ≡ (−2)<sup>9</sup> = −512; −512 = −74 × 7 + 6, remainder **6**. 1.5: 7<sup>95</sup> ends in 3 (95 mod 4 = 3) and 3<sup>58</sup> ends in 9 (58 mod 4 = 2), and 3 × 9 = 27 → **7**. 1.6: 50 + 10 + 2 = **62**. 1.7: 101 is prime, so 2<sup>100</sup> ≡ 1 (Fermat) → **1**.

## 1.4 Number bases and factors

| Fact | Example |
|---|---|
| Number of factors of p<sup>a</sup> q<sup>b</sup> r<sup>c</sup> | (a+1)(b+1)(c+1): 360 = 2<sup>3</sup> 3<sup>2</sup> 5 → 4 × 3 × 2 = 24 |
| Sum of factors | (1+p+…+p<sup>a</sup>)(1+q+…+q<sup>b</sup>)… |
| Base conversion | 101101<sub>2</sub> = 32+8+4+1 = 45; 45 in base 8 = 55<sub>8</sub> |

**Example 1.8.** How many factors does 360 have, and how many of them are even?

```python run Example 1.8 by listing the factors
fs = [d for d in range(1, 361) if 360 % d == 0]
print(len(fs), 'factors;', sum(d % 2 == 0 for d in fs), 'even;', 'sum =', sum(fs))
print('101101 in base 2 =', int('101101', 2), '; 45 in base 8 =', oct(45)[2:])
```

360 = 2<sup>3</sup> × 3<sup>2</sup> × 5 has 4 × 3 × 2 = **24** factors. Even factors contain at least one 2: 3 × 3 × 2 = **18**.

## 1.5 Practice questions

| # | Question | Answer |
|---|---|---|
| 1 | Smallest number that leaves remainder 3 when divided by 4, 6, 9 and 15 | 183 |
| 2 | Remainder when 3<sup>45</sup> is divided by 8 | 3 |
| 3 | Unit digit of 2<sup>51</sup> + 3<sup>51</sup> | 5 |
| 4 | Trailing zeros in 1000! | 249 |
| 5 | HCF of two numbers is 12 and LCM is 360; one number is 72. The other? | 60 |
| 6 | Number of factors of 1 800 | 36 |
| 7 | Largest 4-digit number divisible by 12, 15 and 18 | 9 900 |
| 8 | Remainder when 2<sup>256</sup> is divided by 17 | 1 |

```python run Checking the answer key of Section 1.5
from math import gcd, factorial
lcm = lambda a, b: a * b // gcd(a, b)
z = str(factorial(1000))
answers = [
    min(n for n in range(4, 10_000) if all(n % d == 3 for d in (4, 6, 9, 15))),
    pow(3, 45, 8),
    (2 ** 51 + 3 ** 51) % 10,
    len(z) - len(z.rstrip('0')),
    12 * 360 // 72,
    sum(1800 % d == 0 for d in range(1, 1801)),
    max(n for n in range(1000, 10000) if n % lcm(lcm(12, 15), 18) == 0),
    pow(2, 256, 17)]
print(answers)
```

## 1.6 Practical lessons

- Divisibility: sum of digits for 3 and 9, last digits for 2<sup>k</sup>, alternating sums for 11.
- "Same remainder" → HCF of differences; "remainder r from each" → LCM + r.
- Large powers: negative remainders, Fermat, unit-digit cycles of 4.
- Trailing zeros count fives.

# Chapter 2: Interest, Mixtures and Alligation
%Simple and compound interest, the alligation cross, and replacement problems

## 2.1 Simple and compound interest

| Formula | Meaning |
|---|---|
| SI = P × R × T / 100 | Simple interest; amount A = P + SI |
| A = P(1 + R/100)<sup>T</sup> | Compound interest, compounded yearly |
| Half-yearly | Rate R/2, periods 2T; quarterly: R/4 and 4T |
| CI − SI for 2 years | P(R/100)<sup>2</sup> |
| CI − SI for 3 years | P(R/100)<sup>2</sup>(3 + R/100) |
| Money doubles in *n* years at CI | It becomes 4 times in 2n, 8 times in 3n years |

**Example 2.1.** The difference between CI and SI on a sum for 2 years at 8% p.a. is Rs 64. Find the sum. **Example 2.2.** Rs 10 000 at 10% p.a. compounded half-yearly for 1.5 years: the amount? **Example 2.3.** A sum becomes Rs 6 690 in 3 years and Rs 10 035 in 6 years at compound interest. Find the sum.

```python run Examples 2.1 to 2.3
P = 64 / 0.08 ** 2
print(f'2.1: sum = {P:.0f}; check CI - SI = {P * 1.08 ** 2 - P - P * 0.08 * 2:.2f}')
print(f'2.2: amount = {10_000 * 1.05 ** 3:.2f}')
ratio = 10035 / 6690                         # growth over 3 years
print(f'2.3: 3-year factor {ratio}, sum = {6690 / ratio:.0f}')
```

2.1: 64 = P × 0.08<sup>2</sup> → P = **Rs 10 000**. 2.2: 5% per half-year for 3 half-years: 10 000 × 1.05<sup>3</sup> = **Rs 11 576.25**. 2.3: the same 3-year factor takes 6 690 to 10 035, a factor of 1.5, so the sum was 6 690 / 1.5 = **Rs 4 460**.

## 2.2 Alligation

When two ingredients at values *c* (cheaper) and *d* (dearer) are mixed to get mean value *m*, the quantities are in the ratio

```text
   cheaper c          dearer d
            \        /
              mean m
            /        \
     (d − m)          (m − c)        quantity of cheaper : dearer = (d − m) : (m − c)
```

**Example 2.4.** In what ratio must rice at Rs 42/kg be mixed with rice at Rs 54/kg to get a mixture worth Rs 46/kg? **Example 2.5.** A 40-litre mixture contains milk and water in the ratio 3 : 1. How much water must be added to make the ratio 2 : 1?

```python run Examples 2.4 and 2.5, checked by search
from fractions import Fraction as F
c, d, m = 42, 54, 46
r = F(d - m, m - c)
print(f'2.4: cheaper : dearer = {r.numerator} : {r.denominator}')
for a in range(1, 10):                         # brute force: a kg cheap + b kg dear
    for b in range(1, 10):
        if (c * a + d * b) == m * (a + b):
            print('    smallest whole ratio found by search:', a, ':', b); break
    else: continue
    break
milk, water = 30, 10
add = next(x for x in range(0, 100) if F(milk, water + x) == F(2, 1))
print('2.5: add', add, 'litres of water')
```

2.4: (54 − 46) : (46 − 42) = 8 : 4 = **2 : 1**. 2.5: the milk stays at 30 litres; for 2 : 1 the water must be 15 litres, so add **5 litres**.

## 2.3 Replacement

If a vessel holds *V* litres of pure liquid and *x* litres are removed and replaced with water *n* times, the pure liquid left is V(1 − x/V)<sup>n</sup>.

**Example 2.6.** A container has 80 litres of milk. 8 litres are removed and replaced with water; this is done three times. How much milk remains?

```python run Example 2.6 by simulating each step
milk, water = 80.0, 0.0
for step in range(3):
    total = milk + water
    milk -= 8 * milk / total; water -= 8 * water / total
    water += 8
    print(f'after step {step + 1}: milk {milk:.3f} L, water {water:.3f} L')
print('formula:', 80 * (1 - 8 / 80) ** 3)
```

80 × 0.9<sup>3</sup> = **58.32 litres** of milk.

## 2.4 Practice questions

| # | Question | Answer |
|---|---|---|
| 1 | SI on Rs 8 000 at 6% p.a. for 2 years 6 months | Rs 1 200 |
| 2 | CI on Rs 5 000 at 10% p.a. for 2 years | Rs 1 050 |
| 3 | At what rate of SI does a sum double in 8 years? | 12.5% |
| 4 | CI − SI on Rs 12 000 for 3 years at 5% | Rs 91.50 |
| 5 | Ratio to mix tea at Rs 120/kg and Rs 180/kg to get Rs 140/kg | 2 : 1 |
| 6 | 60 L of 20% acid solution: litres of pure acid to add to make it 40% | 20 L |
| 7 | A sum at CI doubles in 5 years; in how many years does it become 8 times? | 15 |
| 8 | 100 L of wine, 10 L replaced by water twice: wine left | 81 L |

```python run Checking the answer key of Section 2.4
from fractions import Fraction as F
answers = [
    8000 * 6 * 2.5 / 100,
    5000 * 1.1 ** 2 - 5000,
    next(r / 10 for r in range(1, 1000) if abs(r / 10 * 8 - 100) < 1e-9),
    12000 * 1.05 ** 3 - 12000 - 12000 * 0.05 * 3,
    F(180 - 140, 140 - 120),
    next(x for x in range(0, 100) if F(12 + x, 60 + x) == F(2, 5)),
    next(t for t in range(1, 100) if 2 ** (t / 5) == 8),
    100 * 0.9 ** 2]
print([round(a, 2) if isinstance(a, float) else a for a in answers])
```

## 2.5 Practical lessons

- CI − SI over two years is P(R/100)<sup>2</sup>; growth factors over equal periods multiply.
- Alligation: differences cross over; check with a weighted average.
- Replacement: multiply by (1 − x/V) each time.
