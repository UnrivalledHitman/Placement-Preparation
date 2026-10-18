# Answers
%The key for every session, with a one-line reason, and a program that checks the numerical answers

| Session | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 | Q8 |
|---|---|---|---|---|---|---|---|---|
| 1 | 12 | A | 30 | B | C | B | 35 | D |
| 2 | 120 | D | 28 | B | A | C | 12 | A |
| 3 | B | 0.7 | 0.31 | D | C | D | 20 | A |
| 4 | 0.4 | B | 0.0045 | C | D | B | 400 | A |
| 5 | 0.4 | 0.75 | C | D | B | A | 10 | D |
| 6 | B | 0.488 | A | 0.25 | C | D | 605 | A |
| 7 | 3.5 | B | 11 | C | A | B | 6 | C |
| 8 | 0.61 | D | 5 | A | A | D | 300 | B |
| 9 | 0.375 | A | 4.2 | C | D | A | 440 | C |
| 10 | 0.14 | D | 4 | A | B | C | 10 | D |
| 11 | 0.3 | A | 1.5 | B | A | B | 28 | D |
| 12 | 120 | 0.08 | B | 3 | D | C | 300 | B |

## Reasons

**Session 1.** 3 × 4 = 12. 26³ = 17,576. 5!/(2! 2!) = 30. 8 × 7/2 = 28. Abundant means plentiful. "Good at" a subject. 20 + 15 = 35. The squares of 1, 2, 3, 4, then 5² = 25.

**Session 2.** 6 × 5 × 4 = 120. 4 × C(5, 2) = 40. C(8, 2) = 28. (6 − 1)! = 120. Opaque lets no light through. "Each" takes a singular verb: has. 60/5 = 12. A is the brother of C's mother: C's uncle.

**Session 3.** 1 − 0.3. 0.5 + 0.3 − 0.1 = 0.7. (13 + 4 − 1)/52 = 16/52 ≈ 0.31. HT and TH: 2/4. A carrot is a vegetable. "For" with a length of time. 72 × 5/18 = 20. Each letter moves three places: J → M.

**Session 4.** 0.2/0.5 = 0.4. The second die must show 4: 1/6. (4/52)(3/51) = 1/221 ≈ 0.0045. The cases BB, BG, GB are equally likely: 1/3. Paintings are kept in a gallery. "News" is singular. 2000 × 2/10 = 400. North → east → south, then left to east.

**Session 5.** 0.5 × 0.6 + 0.5 × 0.2 = 0.4. 0.3/0.4 = 0.75. 0.0099/(0.0099 + 0.0495) ≈ 0.17. P(A | B) = P(B | A)P(A)/P(B). "I before e except after c": receive. Q sets the scene, P reacts, R closes. Interest 600 = 2000 × r × 3, so r = 10%. 12 is the only even (and non-prime) number.

**Session 6.** 0.4 × 0.5 = 0.2. 1 − 0.8³ = 0.488. Knowing one occurred means the other did not, so they are dependent. HHH or TTT: 2/8. "Neither" takes a singular verb. Diligent means hard-working. 500 × 1.1² = 605. Each letter moves one place forward: F → G, O → P, L → M, D → E, E → F, R → S.

**Session 7.** 21/6 = 3.5. 0 + 0.3 + 0.4 = 0.7. 2 × 4 + 3 = 11. The density must integrate to 1: 5c = 1. Contract is the opposite of expand. "Look forward to" takes the -ing form. 1/(1/10 + 1/15) = 6. The hands point in opposite directions.

**Session 8.** E[X²] = 0.3 + 0.8 = 1.1, so Var = 1.1 − 0.49 = 0.61. 3² × 2 = 18. Mean 5, squared deviations 9, 1, 1, 9, total 20, divided by 4. Identical values have no spread. "A piece of cake" means very easy. "Despite" takes a noun or -ing form. 250 × 1.2 = 300. Ravi's grandfather's only son is Ravi's father, and his daughter is Ravi's sister.

**Session 9.** C(4, 2)/16 = 0.375. np = 6. np(1 − p) = 4.2. 0.9⁵ ≈ 0.59. Opposites: light and dark. "Has approved" is the only correct form. 1000 × 1.2² − 1000 = 440. 9 + 4 + 1 = 14.

**Session 10.** e^(−2) ≈ 0.135, which rounds to 0.14. A Poisson's variance equals its mean. 1/p = 4. (1/2)³ = 0.125. Lucid means clear. "Hardly … when". 54 km/h = 15 m/s; 150/15 = 10. 100 = 14 weeks + 2 days: Wednesday + 2 = Friday.

**Session 11.** 3/10. The normal is symmetric about 0. (65 − 50)/10 = 1.5. 95% lies within about 2 standard deviations. Eminent means distinguished. A real future condition takes "will". 5 × 20 − 4 × 18 = 28. The cheap blue things may or may not include pens.

**Session 12.** C(10, 3) = 120. (4, 6), (5, 5), (6, 4): 3/36 ≈ 0.08. np = 4. 6²/12 = 3. "One of my friends" is singular: is. Modern is the opposite of ancient. 90/0.3 = 300. The gaps grow by one: 1, 2, 3, 4, then 5, so 12 + 5 = 17.

```python run Checking every numerical answer
from math import comb, factorial as f, exp
from fractions import Fraction as F
from itertools import product

dice = list(product(range(1, 7), repeat=2))
print('S1:', 3 * 4, 26 ** 3, f(5) // (f(2) * f(2)), comb(8, 2), 0.25 * 80 + 0.1 * 150)
print('S2:', 6 * 5 * 4, 4 * comb(5, 2), comb(8, 2), f(5), sum([4, 8, 12, 16, 20]) / 5)
print('S3:', round(0.5 + 0.3 - 0.1, 4), round(16 / 52, 4), F(2, 4), 72 * 5 / 18)
print('S4:', 0.2 / 0.5, F(sum(1 for a, b in dice if a == 3 and a + b == 7), 6),
        round(4 / 52 * 3 / 51, 5),
      F(1, 3), 2000 * 2 // 10)
pr = 0.5 * 0.6 + 0.5 * 0.2
print('S5:', round(pr, 4), round(0.3 / pr, 4), round(0.0099 / (0.0099 + 0.99 * 0.05), 4),
        600 / (2000 * 3) * 100)
print('S6:', 0.4 * 0.5, round(1 - 0.8 ** 3, 4), F(2, 8), round(500 * 1.1 ** 2, 2),
      ''.join(chr(ord(c) + 1) for c in 'FOLDER'))
xs, ps = [0, 1, 2], [0.5, 0.3, 0.2]
m = sum(x * p for x, p in zip(xs, ps)); m2 = sum(x * x * p for x, p in zip(xs, ps))
print('S7:', 21 / 6, round(m, 4), 2 * 4 + 3, 1 / 5, round(1 / (1 / 10 + 1 / 15), 6))
print('S8:', round(m2 - m * m, 4), 9 * 2, sum((x - 5) ** 2 for x in (2, 4, 6, 8)) / 4,
        250 * 1.2)
print('S9:', comb(4, 2) / 16, 20 * 0.3, round(20 * 0.3 * 0.7, 4), round(0.9 ** 5, 4),
        round(1000 * 1.2 ** 2 - 1000, 2),
      sum((4 - k) ** 2 for k in range(1, 4)))
print('S10:', round(exp(-2), 4), 4, 1 / 0.25, 0.5 ** 3, 150 / (54 * 5 / 18),
      ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'][100 % 7])
print('S11:', 3 / 10, (65 - 50) / 10, 5 * 20 - 4 * 18)
print('S12:', comb(10, 3), round(sum(1 for a, b in dice if a + b == 10) / 36, 4), 10 * 0.4,
        6 ** 2 / 12, round(90 / 0.3, 6))
```
