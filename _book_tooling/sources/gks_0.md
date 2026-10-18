# Answers and worked solutions
%General Aptitude solutions, then each mock paper's key, solutions and checking program

## Solutions: Set G1

| Q | Answer | Q | Answer | Q | Answer |
|---|---|---|---|---|---|
| E1 | C | M1 | C | H1 | A |
| E2 | B | M2 | C | H2 | D |
| E3 | B | M3 | A | H3 | A, B |
| E4 | C | M4 | B | | |
| E5 | C | M5 | A, B, C | | |

**E1.** A thermometer measures temperature; an odometer measures distance travelled.

**E2.** Candid means frank and open.

**E3.** With "neither … nor", the verb agrees with the nearer subject, the plural "employees": were.

**E4.** Frugal means sparing with money; its opposite is extravagant.

**E5.** "Since" marks a starting point in time; "for" would need a duration ("for five years").

**M1.** "The number of" takes a singular verb (has); "a number of" means "several" and takes a plural verb (have).

**M2.** Q sets the scene, R introduces the problem, P gives the consequence ("therefore"), S closes.

**M3.** Every success had the feature (necessary), but some with it failed (not sufficient).

**M4.** Brisk, rapid and swift mean fast; sluggish means slow.

**M5.** "Affect" is usually the verb and "effect" the noun; "effected" means "brought about", which does not fit (D).

**H1.** The passage describes recovering most of both benefits with two shared days.

**H2.** An author writes a manuscript; a composer writes a score.

**H3.** The correct spellings are "occurrence" and "definitely".

## Solutions: Set G2

| Q | Answer | Q | Answer | Q | Answer |
|---|---|---|---|---|---|
| E1 | C | M1 | D | H1 | 14.29 |
| E2 | 10 | M2 | 0.17 | H2 | B |
| E3 | B | M3 | B | H3 | A |
| E4 | D | M4 | 2100 | | |
| E5 | 1200 | M5 | A | | |
| | | M6 | D | | |

**E1.** 1.2 × 0.8 = 0.96: a 4% fall. **E2.** 1 + 3 + … + 19 = 100, average 10. **E3.** 1200 × 5/8 = 750. **E4.** 150/2.5 = 60. **E5.** 5000 × 0.08 × 3 = 1200.

**M1.** 1/12 + 1/18 = 5/36 per day, so 36/5 = 7.2 days.

**M2.** Sums 10, 11, 12 occur in 3 + 2 + 1 = 6 of 36 outcomes: 1/6 ≈ 0.17.

**M3.** The terms are n(n + 1): 1×2, 2×3, …, so the next is 6 × 7 = 42.

**M4.** 10,000 × 1.1² = 12,100, so the interest is 2100.

**M5.** (210 − 120)/120 = 75%.

**M6.** The 6 litres of acid must be 20% of the total: 30 litres, so add 10 litres of water.

**H1.** Relative speed 126 km/h = 35 m/s; the distance is 500 m: 500/35 ≈ 14.29 s.

**H2.** The sum of distances from x to 2 and to −3 is at least the distance between them, 5, reached for any x in [−3, 2].

**H3.** Multiples of 7 from 105 to 994: 994/7 − 105/7 + 1 = 142 − 15 + 1 = 128.

## Solutions: Set G3

| Q | Answer | Q | Answer | Q | Answer |
|---|---|---|---|---|---|
| E1 | C | M1 | D | H1 | B |
| E2 | A | M2 | A | H2 | 66 |
| E3 | C | M3 | 30 | H3 | C |
| E4 | A | M4 | D | | |
| E5 | B | M5 | A, D | | |

**E1.** The flowers that fade quickly may or may not include roses, so nothing definite follows.

**E2.** Each letter moves one place forward: D → E, O → P, G → H.

**E3.** √(3² + 4²) = 5. **E4.** A is the daughter of C, who is D's daughter: A is D's granddaughter. **E5.** 365 days = 52 weeks + 1 day.

**M1.** S is in seat 3 and R, left of S at an end, in seat 1. T is next to S, so in seat 2 or 4. P and Q need two adjacent free seats, which exist only if T takes seat 2: P in 4, Q in 5. So Q is at the right end.

**M2.** Edge cubes that are not corners: 12 edges × 1 = 12.

**M3.** 16 + 9 + 4 + 1 = 30.

**M4.** Hour hand 90° + 40 × 0.5° = 110°; minute hand 240°: 130°.

**M5.** The managers who are engineers are graduates, so some managers are graduates and some graduates are managers; nothing says all graduates are engineers.

**H1.** The remaining pair, yellow and black, must be opposite.

**H2.** C(12, 2) = 66.

**H3.** A mirror reverses the clock: the actual time is 11:60 − 4:20 = 7:40.

```python run Checking the General Aptitude answers
from itertools import product, permutations
from math import comb
from fractions import Fraction

print('G2: E1', round(1.2 * 0.8 - 1, 4), '| E2', sum(range(1, 20, 2)) / 10, '| E3',
        1200 * 5 // 8,
      '| M1', round(1 / (1 / 12 + 1 / 18), 4), '| M2', Fraction(sum(1 for a,
              b in product(range(1, 7), repeat=2) if a + b >= 10), 36))
print('    M4', round(10000 * 1.1 ** 2 - 10000, 2), '| M6', 6 / 0.2 - 20, '| H1',
        round(500 / (126 * 1000 / 3600), 4),
      '| H2', min(abs(x / 10 - 2) + abs(x / 10 + 3) for x in range(-100, 100)),
      '| H3', sum(1 for n in range(100, 1000) if n % 7 == 0))
seats = [p for p in permutations('PQRST') if p[2] == 'S' and p.index('R') in (0, 4)
        and p.index('R') < 2
         and p.index('Q') == p.index('P') + 1 and abs(p.index('T') - 2) == 1]
print('G3: M1', seats, '| M2', sum(1 for x, y, z in product(range(3), repeat=3) if [x, y,
        z].count(1) == 1),
      '| M3', sum((5 - k) ** 2 for k in range(1, 5)), '| M4', abs(30 * 3 - 5.5 * 40),
              '| H2', comb(12, 2))
```

The M2 check counts small cubes with exactly one coordinate in the middle layer, which are exactly the cubes on an edge but not at a corner.
