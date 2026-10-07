# Solutions

## Part 1 solutions

**Answer key, Mock 1:** 1 b, 2 c, 3 a, 4 b, 5 c, 6 c, 7 b, 8 b, 9 c, 10 a, 11 a, 12 b, 13 b, 14 b, 15 b, 16 a, 17 a, 18 b, 19 b, 20 c.

### A1.1 Price rise and consumption

New consumption c satisfies 1.25c = 1, so c = 0.8: reduce by **20% (b)**. Shortcut: a rise of r% needs a cut of r/(100 + r) × 100% = 25/125 = 20%.

### A1.2 Mark-up and discount

1.40 × 0.85 = 1.19: profit **19% (c)**.

### A1.3 Combined ratio

A : B = 2 : 3 = 8 : 12 and B : C = 4 : 5 = 12 : 15, so A : B : C = **8 : 12 : 15 (a)**.

### A1.4 Corrected average

The total 450 was 30 too high: 420 / 10 = **42 (b)**.

### A1.5 Work with a departure

Together: 1/12 + 1/18 = 5/36 per day; 3 days do 15/36. B finishes 21/36 at 1/18 per day: 21/36 × 18 = 10.5 days. Total **13.5 days (c)**.

### A1.6 Pipes and a leak

1/20 + 1/30 − 1/15 = (3 + 2 − 4)/60 = 1/60 per minute: **60 minutes (c)**.

### A1.7 Train and platform

Speed 240/12 = 20 m/s; distance 240 + 360 = 600 m; time **30 s (b)**.

### A1.8 Speed of the stream

Downstream 12 km/h, upstream 8 km/h; stream (12 − 8)/2 = **2 km/h (b)**.

### A1.9 Compound interest

8 000 × 1.21 = 9 680; interest **Rs 1 680 (c)**.

### A1.10 Alligation

(80 − 75) : (75 − 60) = 5 : 15 = **1 : 3 (a)**.

### A1.11 Remainder of a power

7 ≡ 2 (mod 5); 2<sup>4</sup> = 16 ≡ 1, and 100 is a multiple of 4: remainder **1 (a)**.

### A1.12 LCM

12 = 2² 3, 15 = 3 · 5, 20 = 2² 5, 27 = 3³: LCM = 2² × 3³ × 5 = **540 (b)**.

### A1.13 Selecting a team

5C2 × 4C2 = 10 × 6 = **60 (b)**.

### A1.14 Two aces

4C2 / 52C2 = 6 / 1 326 = **1/221 (b)**.

### A1.15 Three coins

HHT, HTH, THH, HHH: 4 of 8 = **1/2 (b)**.

### A1.16 Ages

3s + 10 = 2(s + 10) → s = 10, father 30: sum **40 (a)**.

### A1.17 Clock angle

|270 − 82.5| = 187.5°, so the smaller angle is 360 − 187.5 = **172.5° (a)**.

### A1.18 Day of the week

Odd days: 2026 → 1, 2027 → 1, 2028 (leap) → 2, 2029 → 1: total 5. Thursday + 5 = **Tuesday (b)**.

### A1.19 Cylinder volume

22/7 × 49 × 10 = **1 540 cm³ (b)**.

### A1.20 Median

Sorted: 2, 3, 6, 7, 8, 9; median (6 + 7)/2 = **6.5 (c)**.

```python run Mock 1: every answer recomputed and compared with the key
from fractions import Fraction as F
from math import comb, gcd
from itertools import product
import datetime as dt
lcm = lambda a, b: a * b // gcd(a, b)
names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
def clock(h, m):
    a = abs(30 * h - F(11, 2) * m)
    return min(a, 360 - a)
rate = F(1, 12) + F(1, 18)
computed = {
    1: ('20%', round((1 - 1 / 1.25) * 100)), 2: ('19%', round((1.4 * 0.85 - 1) * 100)),
    3: ('8 : 12 : 15', (2 * 4, 3 * 4, 3 * 5)), 4: ('42', (450 - 30) // 10),
    5: ('13.5', float(3 + (1 - 3 * rate) / F(1, 18))),
    6: ('60', 1 / (F(1, 20) + F(1, 30) - F(1, 15))), 7: ('30', (240 + 360) / (240 / 12)),
    8: ('2', (24 / 2 - 24 / 3) / 2), 9: ('1680', round(8000 * 1.1 ** 2 - 8000)),
    10: ('1 : 3', F(80 - 75, 75 - 60)), 11: ('1', pow(7, 100, 5)),
    12: ('540', lcm(lcm(lcm(12, 15), 20), 27)), 13: ('60', comb(5, 2) * comb(4, 2)),
    14: ('1/221', F(comb(4, 2), comb(52, 2))),
    15: ('1/2', F(sum(t.count('H') >= 2 for t in product('HT', repeat=3)), 8)),
    16: ('40', next(4 * s for s in range(1, 100) if 3 * s + 10 == 2 * (s + 10))),
    17: ('172.5', clock(9, 15)), 18: ('Tuesday', names[dt.date(2030, 1, 1).weekday()]),
    19: ('1540', F(22, 7) * 49 * 10), 20: ('6.5', (6 + 7) / 2)}
for q, (key, value) in computed.items():
    print(f'A1.{q:<2d} key {key:12s} computed {value}')
```

## Part 2 solutions

**Answer key, Mock 2:** 1 b, 2 c, 3 a, 4 d, 5 a, 6 c, 7 a, 8 c, 9 b, 10 a, 11 a, 12 a, 13 c, 14 d, 15 b, 16 c, 17 b, 18 a, 19 c, 20 b.

### A2.1 Number series

n² + 1 for n = 1 to 5; next 6² + 1 = **37 (b)**.

### A2.2 Doubling series

Each term is twice the previous plus 1: **127 (c)** (that is 2<sup>n</sup> − 1).

### A2.3 Letter series

Positions 26, 24, 21, 17, 12 decrease by 2, 3, 4, 5; next −6 gives 6 = **F (a)**.

### A2.4 Odd one out

121, 144, 169, 196 are 11² to 14²; **210 (d)** is not a square.

### A2.5 Letter coding

Each letter moves one place forward: CHAIR → **DIBJS (a)**.

### A2.6 Number coding

4 + 15 + 7 = **26 (c)**.

### A2.7 Family tree

C is A's mother (A is B's sister, C is B's mother), and D is C's father, so A is D's daughter's daughter: **granddaughter (a)**. E, D's mother, is a distractor: A is E's great-granddaughter, which is option (c) and the answer to a different question.

### A2.8 Photograph

The only daughter of the man's father is the man's sister, who is the girl's mother: he is her **maternal uncle (c)**.

### A2.9 Distance

√(6² + 8²) = **10 km (b)**.

### A2.10 Turns

East → left → north → left → west → right → **north (a)**.

### A2.11 Syllogism I

Every rose is a flower and no flower is a tree, so no rose is a tree: I follows, II contradicts it: **only I (a)**.

### A2.12 Syllogism II

The cats that are dogs are pets, so some cats are pets; "all pets are cats" does not follow: **only I (a)**.

### A2.13 Circular seating

Facing the centre, the person to your right is the next seat **anticlockwise** (seen from above). Going anticlockwise from P: Q is next (P's right). R is not next to P, so R is in the third or fourth seat. S must be immediately to T's left, i.e. the seat just before T in the anticlockwise order. With R third, S and T fill seats four and five as S, T; with R fourth, neither order works. The only seating is P, Q, R, S, T anticlockwise, so the person to P's immediate left (the seat before P) is **T (c)**. The search below confirms there is exactly one candidate.

### A2.14 Data sufficiency

I: if x² is even then x is even. II: if x + 3 is odd then x is even. **Either alone (d)**.

### A2.15 Rank

40 − 12 + 1 = **29 (b)**.

### A2.16 Ordering

D > A > B > C > E: **E (c)** is the youngest.

### A2.17 Analogy

3³ = 27, so 5³ = **125 (b)**.

### A2.18 Mirror image

11:60 − 3:40 = **8:20 (a)**.

### A2.19 Number pattern

The triple 3 5 7 occurs at positions 2–4, 6–8 and 13–15: **3 (c)**.

### A2.20 Painted cube

4 small cubes per edge; each of the 12 edges has 4 − 2 = 2 cubes with exactly two painted faces: **24 (b)**.

```python run Mock 2: every answer recomputed and compared with the key
from itertools import permutations
seq = [5, 3, 5, 7, 2, 3, 5, 7, 5, 3, 5, 1, 3, 5, 7]
left_of_p = set()
for order in permutations('QRST'):                 # seats anticlockwise from P (seen above)
    ring = ['P'] + list(order)
    pos = {c: i for i, c in enumerate(ring)}
    right = lambda x: ring[(pos[x] + 1) % 5]       # facing the centre: right = anticlockwise
    left = lambda x: ring[(pos[x] - 1) % 5]
    if right('P') != 'Q': continue
    if 'R' in (right('P'), left('P')): continue
    if left('T') != 'S': continue
    left_of_p.add(left('P'))
n = 4
computed = {
    1: ('37', 6 ** 2 + 1), 2: ('127', 2 * 63 + 1), 3: ('F', chr(64 + 12 - 6)),
    4: ('210', [x for x in (121, 144, 169, 196, 210) if int(x ** 0.5) ** 2 != x]),
    5: ('DIBJS', ''.join(chr(ord(c) + 1) for c in 'CHAIR')),
    6: ('26', sum(ord(c) - 64 for c in 'DOG')),
    7: ('granddaughter', 'C is A\'s mother and D is C\'s father -> granddaughter'),
    8: ('maternal uncle', 'mother of the girl = sister of the man'),
    9: ('10', (6 ** 2 + 8 ** 2) ** 0.5),
    10: ('North', ['N', 'E', 'S', 'W'][(1 - 1 - 1 + 1) % 4]),
    13: ('T', left_of_p), 15: ('29', 40 - 12 + 1), 17: ('125', 5 ** 3),
    18: ('8:20', f'{(11 * 60 + 60 - (3 * 60 + 40)) // 60}:{(60 - 40) % 60:02d}'),
    19: ('3', sum(seq[i - 1:i + 2] == [3, 5, 7] for i in range(1, len(seq) - 1))),
    20: ('24', 12 * (n - 2))}
for q, (key, value) in computed.items():
    print(f'A2.{q:<2d} key {key:15s} computed {value}')
```

Questions 11, 12, 14 and 16 are checked by the reasoning in their solutions (the syllogism checker of the guide's Chapter 6 confirms 11 and 12).
