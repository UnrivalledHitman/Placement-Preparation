# Chapter 3: Permutations, Combinations and Probability
%Counting with and without order, the standard restrictions, and probability by counting

## 3.1 The counting rules

| Situation | Count |
|---|---|
| Arrange *n* distinct objects | n! |
| Arrange *r* of *n* (order matters) | nPr = n! / (n − r)! |
| Choose *r* of *n* (order does not matter) | nCr = n! / (r! (n − r)!) |
| Arrange *n* objects with repeats p, q, … of identical kinds | n! / (p! q! …) |
| Circular arrangements of *n* distinct objects | (n − 1)!; if clockwise = anticlockwise (necklace), (n − 1)!/2 |
| Objects that must be **together** | Glue them into one block: (n − k + 1)! × k! |
| Objects that must **not** be together | Total − together, or gap method: arrange the others, choose gaps |
| Distribute *n* identical items to *r* people (any number each) | (n + r − 1)C(r − 1) |
| At least one | Total − none |

**Example 3.1.** How many arrangements of the letters of BANANA are there? How many with the two N's not together? **Example 3.2.** In how many ways can 5 boys and 3 girls sit in a row so that no two girls sit together? **Example 3.3.** A committee of 5 is chosen from 6 men and 4 women with at least 2 women. How many ways?

```python run Examples 3.1 to 3.3 by enumeration
from itertools import permutations, combinations
banana = set(permutations('BANANA'))
print('3.1:', len(banana), 'arrangements;',
      sum('NN' not in ''.join(p) for p in banana), 'with the N\'s apart')
people = ['B1', 'B2', 'B3', 'B4', 'B5', 'G1', 'G2', 'G3']
ok = sum(all(not (a[0] == 'G' and b[0] == 'G') for a, b in zip(p, p[1:]))
         for p in permutations(people))
print('3.2:', ok)
group = [('M', i) for i in range(6)] + [('W', i) for i in range(4)]
print('3.3:', sum(sum(g == 'W' for g, _ in c) >= 2 for c in combinations(group, 5)))
```

3.1: 6!/(3! 2!) = 60. N's together: treat NN as one letter, 5!/3! = 20; apart: 60 − 20 = **40**. 3.2: arrange the boys (5! = 120), then choose 3 of the 6 gaps for the girls in order (6P3 = 120): **14 400**. 3.3: (2 women) 4C2 × 6C3 + (3 women) 4C3 × 6C2 + (4 women) 4C4 × 6C1 = 120 + 60 + 6 = **186**.

## 3.2 Probability

For equally likely outcomes, P(event) = favourable / total. Useful rules: P(not A) = 1 − P(A); for independent events, P(A and B) = P(A) P(B); P(A or B) = P(A) + P(B) − P(A and B); conditional probability P(A | B) = P(A and B) / P(B).

**Example 3.4.** Two dice are thrown. Probability that the sum is 8? Probability that the sum is 8 given that at least one die shows 3? **Example 3.5.** A bag has 5 red and 4 blue balls. Three are drawn at random. Probability that exactly two are red? **Example 3.6.** Probability that in a group of 23 people at least two share a birthday (365 equally likely days).

```python run Examples 3.4 to 3.6
from fractions import Fraction as F
from itertools import product, combinations
dice = list(product(range(1, 7), repeat=2))
s8 = [d for d in dice if sum(d) == 8]
has3 = [d for d in dice if 3 in d]
print('3.4:', F(len(s8), 36), '| given a 3:', F(sum(sum(d) == 8 for d in has3), len(has3)))
balls = ['R'] * 5 + ['B'] * 4
draws = list(combinations(range(9), 3))
print('3.5:', F(sum([balls[i] for i in d].count('R') == 2 for d in draws), len(draws)))
p_distinct = 1.0
for i in range(23):
    p_distinct *= (365 - i) / 365
print(f'3.6: {1 - p_distinct:.4f}')
```

3.4: (2,6), (3,5), (4,4), (5,3), (6,2) → **5/36**. Given at least one 3 (11 outcomes), only (3,5) and (5,3) sum to 8 → **2/11**. 3.5: 5C2 × 4C1 / 9C3 = 40/84 = **10/21**. 3.6: about **0.507**, more than half, the famous birthday paradox.

## 3.3 Practice questions

| # | Question | Answer |
|---|---|---|
| 1 | Words (arrangements) from the letters of LEADER | 360 |
| 2 | 7 people around a round table | 720 |
| 3 | 4-digit numbers with distinct digits using 0–9 | 4 536 |
| 4 | Ways to choose 3 from 8 if two particular people must not both be chosen | 50 |
| 5 | Ways to give 10 identical chocolates to 3 children, each getting at least 1 | 36 |
| 6 | Probability of at least one head in 4 tosses of a fair coin | 15/16 |
| 7 | Probability a card from a 52-card deck is a king or a heart | 4/13 |
| 8 | Probability that a random 3-digit number is divisible by 7 | 32/225 |

```python run Checking the answer key of Section 3.3
from fractions import Fraction as F
from itertools import permutations, combinations, product
answers = [
    len(set(permutations('LEADER'))),
    sum(1 for p in permutations(range(7)) if p[0] == 0),       # fix one person
    sum(1 for p in permutations(range(10), 4) if p[0] != 0),
    sum(1 for c in combinations(range(8), 3) if not {0, 1} <= set(c)),
    sum(1 for a, b, c in product(range(1, 11), repeat=3) if a + b + c == 10),
    F(sum(1 for t in product('HT', repeat=4) if 'H' in t), 16),
    F(sum(1 for r, s in product(range(13), range(4)) if r == 12 or s == 0), 52),
    F(sum(1 for n in range(100, 1000) if n % 7 == 0), 900)]
print(answers)
```

## 3.4 Practical lessons

- Order matters → permutations; not → combinations. "At least" → complement.
- Together → glue into a block; apart → gap method or total minus together.
- Probability by counting: be explicit about the sample space, especially for conditional questions.

# Chapter 4: Clocks and Calendars
%Angles between hands, coincidences, odd days and the day of the week for any date

## 4.1 Clocks

The minute hand moves 6° per minute, the hour hand 0.5° per minute, so the minute hand gains **5.5° per minute**. At h hours m minutes the angle between the hands is |30h − 5.5m| (take 360° minus it if it exceeds 180°). The hands coincide every 720/11 = 65 5/11 minutes, so **11 times in 12 hours** and 22 times a day; they are at right angles 44 times a day.

**Example 4.1.** Angle between the hands at 3:40. **Example 4.2.** At what time between 4 and 5 o'clock do the hands coincide? **Example 4.3.** How many times in a day are the hands at right angles?

```python run Examples 4.1 to 4.3 by simulating the clock
from fractions import Fraction as F
def angle(h, m):
    a = abs(30 * h - F(11, 2) * m)
    return min(a, 360 - a)
print('4.1:', angle(3, 40), 'degrees')
m = F(240, 11)                                   # solve 30*4 = 5.5 m
print(f'4.2: {int(m)} {m - int(m)} minutes past 4; angle then {angle(4, m)}')
count, step = 0, F(1, 22)                        # check every 1/22 minute over 24 hours
t = F(0)
while t < 24 * 60:
    h, mm = int(t // 60) % 12, t % 60
    if angle(h, mm) == 90: count += 1
    t += step
print('4.3:', count, 'times in 24 hours')
```

4.1: |30 × 3 − 5.5 × 40| = |90 − 220| = **130°**. 4.2: the minute hand must gain 120°: 120 / 5.5 = **21 9/11 minutes past 4**. 4.3: **44**: twice an hour would give 48, but between 2 and 4 and between 8 and 10 (twice a day each) the two right angles are shared at 3 and 9 o'clock.

## 4.2 Calendars

An **odd day** is a remainder day after full weeks. A normal year has 365 = 52 × 7 + 1 → 1 odd day; a leap year 2 odd days. 100 years have 5 odd days, 200 years 3, 300 years 1, 400 years 0. A year is a leap year if divisible by 4, except century years, which must be divisible by 400 (2000 yes, 1900 no).

| Month odd days (normal year) | Jan 3, Feb 0, Mar 3, Apr 2, May 3, Jun 2, Jul 3, Aug 3, Sep 2, Oct 3, Nov 2, Dec 3 |
|---|---|

**Example 4.4.** What day of the week was 15 August 1947? **Example 4.5.** If 1 January 2026 is a Thursday, what day is 1 January 2027? **Example 4.6.** Which is the next year after 2026 with exactly the same calendar?

```python run Examples 4.4 to 4.6 with the date library as the referee
import datetime as dt
names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
print('4.4:', names[dt.date(1947, 8, 15).weekday()])
d26, d27 = dt.date(2026, 1, 1).weekday(), dt.date(2027, 1, 1).weekday()
print('4.5:', names[d26], '->', names[d27])
def same(y1, y2):
    leap = lambda y: y % 4 == 0 and (y % 100 != 0 or y % 400 == 0)
    return leap(y1) == leap(y2) and dt.date(y1, 1, 1).weekday() == dt.date(y2, 1, 1).weekday()
print('4.6:', next(y for y in range(2027, 2100) if same(2026, y)))
# odd-day method for 4.4: 1600 years (0) + 300 years (1) + 46 years + days of 1947 to 15 Aug
leaps = sum(1 for y in range(1901, 1947) if y % 4 == 0)
odd = (0 + 1 + (46 + leaps) + (31 + 28 + 31 + 30 + 31 + 30 + 31 + 15)) % 7
sunday_first = ['Sunday'] + names[:6]                # 0 odd days = Sunday
print('    odd-day method gives', odd, 'odd days ->', sunday_first[odd])
```

4.4: up to 1900: 1 odd day (1 600 years: 0; 300 years: 1). 1901–1946: 46 years with 11 leap years → 46 + 11 = 57 → 1 odd day. 1947 to 15 August: 227 days → 3 odd days. Total 1 + 1 + 3 = 5 → **Friday** (0 = Sunday, 1 = Monday, …, 5 = Friday). 4.5: 2026 is not a leap year, so one odd day: **Friday**. 4.6: **2037**: calendars repeat when the accumulated odd days reach a multiple of 7 with the same leap-year status.

## 4.3 Practice questions

| # | Question | Answer |
|---|---|---|
| 1 | Angle between the hands at 7:20 | 100° |
| 2 | Minutes past 2 when the hands first form 90° | 5 5/11 |
| 3 | How many times do the hands coincide between 12 noon and 12 midnight (both excluded)? | 10 |
| 4 | A clock gains 5 minutes every hour. Set right at 8 a.m.; true time when it shows 8 p.m. the same day | 7:04 8/13 p.m. |
| 5 | Day of the week on 26 January 1950 | Thursday |
| 6 | Number of odd days in 2024 | 2 |
| 7 | If today is Tuesday, the day after 61 days | Sunday |
| 8 | How many Sundays at most can a 31-day month have? | 5 |

```python run Checking the answer key of Section 4.3
from fractions import Fraction as F
import datetime as dt
def angle(h, m):
    a = abs(30 * h - F(11, 2) * m)
    return min(a, 360 - a)
coincide = sum(1 for k in range(1, 12) if 0 < F(720, 11) * k < 720)       # after 12:00
true_minutes = 12 * 60 * F(60, 65)               # 65 shown minutes per 60 true minutes
names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
h, mins = 8 + int(true_minutes // 60) - 12, true_minutes % 60
answers = [angle(7, 20), F(60, 11), coincide,
           f'{h}:{int(mins):02d} and {mins - int(mins)} p.m.',
           names[dt.date(1950, 1, 26).weekday()],
           366 % 7,
           names[(1 + 61) % 7],
           max(sum(dt.date(2026, mth, d).weekday() == 6 for d in range(1, 32))
               for mth in (1, 3, 5, 7, 8, 10, 12))]
print(answers)
```

## 4.4 Practical lessons

- Hands: 5.5° per minute relative speed; angle |30h − 5.5m|; coincidences every 65 5/11 minutes.
- Calendars: count odd days; check leap years carefully for century years.
- When a question can be checked by counting forwards, do it: it is often faster than a formula.
