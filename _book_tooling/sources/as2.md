## Part 3 solutions

**Answer key, Mock 3:** 1 b, 2 c, 3 b, 4 b, 5 c, 6 a, 7 a, 8 b, 9 c, 10 b, 11 c, 12 a, 13 b, 14 a, 15 b, 16 c, 17 a, 18 b, 19 b, 20 c.

### A3.1 Successive discounts

0.8 × 0.9 = 0.72: a single discount of **28% (b)**. Shortcut: a + b − ab/100 = 30 − 2 = 28.

### A3.2 Partnership

5 000 × 12 : 6 000 × 8 = 60 000 : 48 000 = 5 : 4; A gets 5/9 × 4 950 = **Rs 2 750 (c)**.

### A3.3 Average speed

2 × 60 × 40 / (60 + 40) = **48 km/h (b)**, not the arithmetic mean 50, because more time is spent at the lower speed.

### A3.4 Men and days

6 × 12 = 72 man-days; 72 / 9 = **8 days (b)**.

### A3.5 Rate of interest

Interest 360 = 1 200 × r × 3 / 100 → r = **10% (c)**.

### A3.6 Arrangements

With D fixed first, the other four letters can be arranged in 4! = **24 (a)** ways.

### A3.7 Divisible by 3 or 5

16 multiples of 3, 10 of 5, 3 of 15: 16 + 10 − 3 = 23, so **23/50 (a)**.

### A3.8 Remainder

17 ≡ 1 (mod 16), so 17<sup>23</sup> ≡ 1: **1 (b)**.

### A3.9 Trailing zeros

25 + 5 + 1 = **31 (c)**.

### A3.10 HCF

84 = 2² · 3 · 7, 126 = 2 · 3² · 7, 210 = 2 · 3 · 5 · 7: HCF = 2 · 3 · 7 = **42 (b)**.

### A3.11 Fibonacci-like series

5 + 8 = **13 (c)**.

### A3.12 Reverse coding

PLANET read backwards is TENALP; GALAXY backwards is **YXALAG (a)**.

### A3.13 Relation

Y is X's mother and Z's sister; Z is W's father. So X's mother is W's aunt, and X is W's **cousin (b)**.

### A3.14 Final position

South 5, left (east) 3, left (north) 9: he ends 4 km north and 3 km east of his house, √(16 + 9) = **5 km (a)**.

### A3.15 Syllogism

Some tools are costly, so some costly things are tools (II follows). The costly tools may not be pens (I does not follow): **only II (b)**.

### A3.16 Data sufficiency

I alone and II alone each leave infinitely many possibilities; together R = S + 4 and R + S = 30 give R = 17: **both together (c)**.

### A3.17 Mislabelled boxes

Draw one fruit from the box labelled "mixed". Its label is wrong, so it contains only one kind; the fruit tells you which (say apples). The box labelled "oranges" cannot hold oranges (wrong label) or apples (taken), so it is the mixed box, and the last box holds oranges. **One fruit (a)**.

### A3.18 Hands together

At 3:00 the minute hand is 90° behind; at 5.5° per minute it catches up after 90 / 5.5 = 16 4/11 minutes: **16 4/11 minutes past 3 (b)**.

### A3.19 Same date next year

From 15 August 2026 to 15 August 2027 there are 365 days (the next 29 February is in 2028), one odd day: **Sunday (b)**.

### A3.20 Odd one out

2, 3, 5 and 11 are prime; **9 (c)** is not.

```python run Mock 3: every answer recomputed and compared with the key
from fractions import Fraction as F
from math import gcd, factorial
from itertools import permutations
import datetime as dt
names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
z = str(factorial(125))
computed = {
    1: ('28%', round((1 - 0.8 * 0.9) * 100)),
    2: ('2750', 4950 * F(5000 * 12, 5000 * 12 + 6000 * 8)),
    3: ('48', F(2 * 60 * 40, 60 + 40)), 4: ('8', 6 * 12 / 9),
    5: ('10%', next(r for r in range(1, 50) if 1200 * r * 3 == 360 * 100)),
    6: ('24', sum(1 for p in set(permutations('DELHI')) if p[0] == 'D')),
    7: ('23/50', F(sum(1 for n in range(1, 51) if n % 3 == 0 or n % 5 == 0), 50)),
    8: ('1', pow(17, 23, 16)), 9: ('31', len(z) - len(z.rstrip('0'))),
    10: ('42', gcd(gcd(84, 126), 210)), 11: ('13', 5 + 8), 12: ('YXALAG', 'GALAXY'[::-1]),
    14: ('5', ((9 - 5) ** 2 + 3 ** 2) ** 0.5),
    16: ('17', [r for r in range(0, 31) for s in range(0, 31) if r == s + 4 and r + s == 30]),
    18: ('16 4/11', F(90) / F(11, 2)),
    19: ('Sunday', f'2026-08-15 is {names[dt.date(2026, 8, 15).weekday()]}, '
                   f'2027-08-15 is {names[dt.date(2027, 8, 15).weekday()]}'),
    20: ('9', [n for n in (2, 3, 5, 9, 11) if any(n % d == 0 for d in range(2, n))])}
for q, (key, value) in computed.items():
    print(f'A3.{q:<2d} key {key:8s} computed {value}')
# A3.17: try every consistent assignment of contents and every first draw
labels = ['apples', 'oranges', 'mixed']
worlds = [p for p in permutations(labels) if all(p[i] != labels[i] for i in range(3))]
print('A3.17 assignments with every label wrong:', worlds)
print('      drawing from the "mixed" box identifies the world:',
      len({w[2] for w in worlds}) == len(worlds))
```

The last check lists the two possible worlds (every label wrong) and confirms that the content of the box labelled "mixed" differs between them, so one fruit from that box tells you which world you are in.
