# Chapter 5: Logical Reasoning I
%Series, coding–decoding, blood relations and directions

## 5.1 Number and letter series

Look for the pattern in this order: differences (and differences of differences), ratios, alternating sub-series, squares and cubes (±1), primes, and letter positions (A = 1 … Z = 26).

| Series | Rule | Next |
|---|---|---|
| 3, 8, 15, 24, 35 | n² − 1 for n = 2, 3, … | 48 |
| 2, 6, 12, 20, 30 | n(n + 1) | 42 |
| 5, 11, 23, 47, 95 | ×2 + 1 | 191 |
| 1, 4, 9, 61, 52, 63 | squares with digits reversed: 16 → 61, 25 → 52, 36 → 63 | 94 (49 reversed) |
| 7, 10, 8, 11, 9, 12 | Alternating: +3, −2 | 10 |
| B, E, H, K, N | +3 letters | Q |
| AZ, BY, CX, DW | First letter +1, second −1 (pairs summing to 27) | EV |

```python run Checking the series table by applying each rule
print('n^2-1:', [n * n - 1 for n in range(2, 8)])
print('n(n+1):', [n * (n + 1) for n in range(1, 7)])
x, s = 5, []
for _ in range(6): s.append(x); x = 2 * x + 1
print('x2+1:', s)
print('reversed squares:', [int(str(n * n)[::-1]) for n in range(1, 8)])
print('+3/-2:', [7, 10, 8, 11, 9, 12, 12 - 2])
print('letters +3:', [chr(ord('B') + 3 * i) for i in range(6)])
print('pairs:', [chr(65 + i) + chr(90 - i) for i in range(5)])
```

## 5.2 Coding–decoding

| Type | Example | Method |
|---|---|---|
| Letter shift | CAT → FDW (+3) | Compare each letter's position |
| Reverse alphabet | A ↔ Z, B ↔ Y (positions sum to 27) | 27 − position |
| Position-based | Each letter shifted by its position: +1, +2, +3 … | Compute the difference per letter |
| Number coding | Word value = sum of letter positions | Add positions |
| Symbol substitution | "sky is blue" = "ta na pa" | Find common words across sentences |

**Example 5.1.** If MANGO is written as NBOHP, how is APPLE written? **Example 5.2.** If in a code each letter is replaced by its opposite letter (A ↔ Z), what is the code for SMART? **Example 5.3.** If "pit nat sok" means "good sweet fruit", "sok lin bon" means "fruit is red", and "nat ser bon" means "very good red", what is the code for "sweet"?

```python run Examples 5.1 to 5.3
shift = lambda w, k: ''.join(chr((ord(c) - 65 + k) % 26 + 65) for c in w)
print('5.1: MANGO ->', shift('MANGO', 1), '| APPLE ->', shift('APPLE', 1))
print('5.2: SMART ->', ''.join(chr(155 - ord(c)) for c in 'SMART'))   # 65 + 90 = 155
codes = {('pit', 'nat', 'sok'): ('good', 'sweet', 'fruit'),
         ('sok', 'lin', 'bon'): ('fruit', 'is', 'red'),
         ('nat', 'ser', 'bon'): ('very', 'good', 'red')}
words = {w for ws in codes.values() for w in ws}
mapping = {}
for w in sorted(words):            # a code word must appear in every sentence that has w
    sets = [set(c) for c, ws in codes.items() if w in ws]
    others = [set(c) for c, ws in codes.items() if w not in ws]
    cand = set.intersection(*sets) - set().union(*others)
    if len(cand) == 1: mapping[w] = cand.pop()
print('5.3:', mapping)
```

5.1: each letter moves one step forward: **BQQMF**. 5.2: S ↔ H, M ↔ N, A ↔ Z, R ↔ I, T ↔ G: **HNZIG**. 5.3: "good" is the code common to sentences 1 and 3 (nat), "fruit" common to 1 and 2 (sok), so "sweet" is the remaining code of sentence 1: **pit**.

## 5.3 Blood relations

Draw a family tree: generations vertically, couples with a double line, sex marked (+ male, − female). Translate each statement into a link before reasoning.

**Example 5.4.** Pointing to a man, Riya says, "He is the son of my grandfather's only son." How is the man related to Riya? **Example 5.5.** A is the brother of B. C is the father of A. D is the brother of E. E is the daughter of B. How is D related to C?

```python run Examples 5.4 and 5.5 with a tiny family model
# 5.5: build the family and walk the links
father = {'A': 'C', 'B': 'C', 'E': 'B', 'D': 'B'}        # child -> parent
sex = {'A': 'M', 'C': 'M', 'D': 'M', 'E': 'F'}
def grandparent(x): return father.get(father.get(x))
print('5.5: grandparent of D is', grandparent('D'), '-> D is', 'grandson' if sex['D'] == 'M'
      else 'granddaughter', 'of C')
```

5.4: Riya's grandfather's **only son** is Riya's father, so the man is her father's son: Riya's **brother** (if Riya is female, she cannot be the son herself). 5.5: A and B are C's children; E and D are B's children; D is male: D is C's **grandson**. Note that B's sex is never stated; it does not matter for the answer.

## 5.4 Directions

Put the start at the origin with north up. A right turn while facing north means facing east. The shortest distance back is √(x² + y²).

**Example 5.6.** Arun walks 10 m north, turns right and walks 6 m, turns right and walks 18 m, then turns left and walks 9 m. How far is he from the start and in which direction?

```python run Example 5.6 as coordinates
import math
x = y = 0
heading = 0                                    # 0 = north, 1 = east, 2 = south, 3 = west
dx, dy = [0, 1, 0, -1], [1, 0, -1, 0]
for turn, dist in ((None, 10), ('R', 6), ('R', 18), ('L', 9)):
    if turn == 'R': heading = (heading + 1) % 4
    if turn == 'L': heading = (heading - 1) % 4
    x += dx[heading] * dist; y += dy[heading] * dist
print(f'position ({x}, {y}); distance {math.hypot(x, y):.0f} m; '
      f'{"south" if y < 0 else "north"}-{"east" if x > 0 else "west"}')
```

North 10, east 6, south 18, east 9: he ends 15 m east and 8 m south of the start, √(225 + 64) = **17 m to the south-east**.

## 5.5 Practice questions

| # | Question | Answer |
|---|---|---|
| 1 | 4, 6, 12, 14, 28, 30, ? | 60 |
| 2 | 1, 2, 6, 24, 120, ? | 720 |
| 3 | C, F, J, O, ? | U |
| 4 | If ROSE = 6821, CHAIR = 73456, PREACH = 961473, the code for SEARCH | 214673 |
| 5 | If each letter of a word is replaced by the letter two places back (C → A), code for DELHI | BCJFG |
| 6 | A woman says of a boy, "His mother is the only daughter of my mother." Relation of the woman to the boy | Mother |
| 7 | 5 km west, right 3 km, right 9 km: distance from the start | 5 km |
| 8 | Facing south, turn 135° clockwise, then 270° anticlockwise: final direction | North-east |

```python run Checking the answer key of Section 5.5
import math
s = [4]
for i in range(6): s.append(s[-1] + 2 if i % 2 == 0 else s[-1] * 2)
fact = [math.factorial(n) for n in range(1, 7)]
letters = [chr(ord('C') + k) for k in (0, 3, 7, 12, 18)]
code = dict(zip('ROSE', '6821')) | dict(zip('CHAIR', '73456')) | dict(zip('PREACH', '961473'))
consistent = all(code[c] == d for w, n in (('ROSE', '6821'), ('CHAIR', '73456'),
                                           ('PREACH', '961473')) for c, d in zip(w, n))
back2 = ''.join(chr((ord(c) - 65 - 2) % 26 + 65) for c in 'DELHI')
x, y = -5, 3; x += 9                                     # west 5, north 3, east 9
dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
final = (dirs.index('S') + 135 // 45 - 270 // 45) % 8
print([s[-1], fact[-1], letters[-1], ''.join(code[c] for c in 'SEARCH'), consistent, back2,
       math.hypot(x, y), dirs[final]])
```

Question 6: the only daughter of the woman's mother is the woman herself, so she is the boy's **mother**.

# Chapter 6: Logical Reasoning II
%Seating arrangements, syllogisms, data sufficiency and puzzles

## 6.1 Seating arrangements

Fix one definite position first (an end, a named seat, or one person on a circle), place the people with the most constraints next, and keep track of alternatives in separate diagrams. In the exam you solve by hand; here a program checks that the clues give exactly one arrangement.

**Example 6.1.** Six friends A, B, C, D, E, F sit in a row facing north. C sits third from the left end. A sits second to the right of C. D sits immediately to the left of B. E is not an immediate neighbour of C. F is not at an end. Who sits at the two ends?

```python run Example 6.1 by trying all 720 arrangements
from itertools import permutations
sols = []
for p in permutations('ABCDEF'):
    pos = {c: i for i, c in enumerate(p)}
    if pos['C'] != 2: continue                      # third from the left
    if pos['A'] != pos['C'] + 2: continue           # second to the right of C
    if pos['B'] - pos['D'] != 1: continue           # D immediately left of B
    if abs(pos['E'] - pos['C']) == 1: continue      # E not next to C
    if pos['F'] in (0, 5): continue                 # F not at an end
    sols.append(''.join(p))
print('arrangements (left to right):', sols)
```

Seats are numbered 1–6 from the left. C takes seat 3 and A seat 5, leaving seats 1, 2, 4 and 6. D and B need two adjacent free seats with D on the left: only seats 1–2. E and F share seats 4 and 6; E cannot be in seat 4 (next to C), so E is in seat 6 and F in seat 4, which also satisfies "F not at an end". The row is D B C F A E: **D and E** sit at the ends, and the search confirms this is the only arrangement.

> NOTE: The first draft of this example said "B is an immediate neighbour of both D and E", and the search found **no** arrangement at all: with C and A fixed in seats 3 and 5, no three consecutive seats are free. Exam questions occasionally contain such errors too; if the clues contradict each other, re-read each clue literally before guessing.

## 6.2 Syllogisms

Draw the **minimum** Venn diagram consistent with the statements and test whether the conclusion holds in **every** possible diagram. "All A are B", "No A are B", "Some A are B", "Some A are not B" are the four statement forms. A program can check this exhaustively: for three sets there are 8 regions; each may be empty or not, so there are 256 possible worlds.

**Example 6.2.** Statements: All pens are books. Some books are pencils. Conclusions: I. Some pens are pencils. II. Some pencils are books. **Example 6.3.** Statements: No cat is a dog. All dogs are animals. Conclusions: I. Some animals are not cats. II. No animal is a cat.

```python run Checking syllogisms in all 256 worlds
from itertools import product
def regions(world, inside):                 # world: 8 flags for regions (a, b, c membership)
    return [r for r, on in zip(product((0, 1), repeat=3), world) if on and inside(r)]
def all_(w, X, Y): return not regions(w, lambda r: r[X] and not r[Y])
def no(w, X, Y): return not regions(w, lambda r: r[X] and r[Y])
def some(w, X, Y): return bool(regions(w, lambda r: r[X] and r[Y]))
def some_not(w, X, Y): return bool(regions(w, lambda r: r[X] and not r[Y]))
def follows(premises, conclusion):
    worlds = [w for w in product((0, 1), repeat=8) if all(p(w) for p in premises)]
    return all(conclusion(w) for w in worlds)
PEN, BOOK, PENCIL = 0, 1, 2
prem = [lambda w: all_(w, PEN, BOOK), lambda w: some(w, BOOK, PENCIL)]
print('6.2 I :', follows(prem, lambda w: some(w, PEN, PENCIL)))
print('6.2 II:', follows(prem, lambda w: some(w, PENCIL, BOOK)))
CAT, DOG, ANIMAL = 0, 1, 2
prem = [lambda w: no(w, CAT, DOG), lambda w: all_(w, DOG, ANIMAL),
        lambda w: bool(regions(w, lambda r: r[DOG]))]     # dogs exist
print('6.3 I :', follows(prem, lambda w: some_not(w, ANIMAL, CAT)))
print('6.3 II:', follows(prem, lambda w: no(w, ANIMAL, CAT)))
```

6.2: only **II** follows ("some books are pencils" converts to "some pencils are books"); pens may or may not overlap pencils. 6.3: **I** follows (the dogs are animals that are not cats), **II** does not (some animals might be cats). The program needs the extra premise that dogs exist, which exam questions assume implicitly; without it, "some animals are not cats" would not be guaranteed.

## 6.3 Data sufficiency

Each question has two statements. Answer: (a) statement I alone is sufficient; (b) II alone; (c) both together, neither alone; (d) either alone; (e) not even both. Never solve fully; decide whether a **unique** answer exists.

**Example 6.4.** What is the value of the two-digit number *n*? I. The sum of its digits is 9. II. The number is divisible by 15.

```python run Example 6.4 by listing the candidates
n_all = range(10, 100)
I = [n for n in n_all if sum(map(int, str(n))) == 9]
II = [n for n in n_all if n % 15 == 0]
print('I alone:', I)
print('II alone:', II)
print('both:', sorted(set(I) & set(II)))
```

Neither statement alone gives a unique number, and the trap is to stop at 45 when combining them: **90** also has digit sum 9 and is divisible by 15. Even together the statements leave two values, so the answer is **(e)**. Always list every candidate, including the largest ones.

## 6.4 Puzzles

**Example 6.5.** Four people P, Q, R, S have different professions (doctor, engineer, lawyer, teacher) and live on floors 1 to 4 (one each). The doctor lives directly above the engineer. Q lives on floor 2 and is not the engineer. The lawyer lives on floor 4. R lives on floor 1. S is not the teacher. Who is the doctor?

```python run Example 6.5 by trying every assignment
from itertools import permutations
jobs = ['doctor', 'engineer', 'lawyer', 'teacher']
sols = []
for floors in permutations((1, 2, 3, 4)):
    fl = dict(zip('PQRS', floors))
    for js in permutations(jobs):
        job = dict(zip('PQRS', js))
        who = {j: p for p, j in job.items()}
        if fl[who['doctor']] != fl[who['engineer']] + 1: continue
        if fl['Q'] != 2 or job['Q'] == 'engineer': continue
        if fl[who['lawyer']] != 4 or fl['R'] != 1 or job['S'] == 'teacher': continue
        sols.append((fl, job))
for fl, job in sols:
    print({p: (fl[p], job[p]) for p in sorted(fl, key=fl.get)})
```

Floors: R on 1, Q on 2, the lawyer on 4. The doctor is directly above the engineer, so engineer–doctor occupy floors 1–2 or 2–3; Q (floor 2) is not the engineer, so Q is the doctor with the engineer on 1 (R), or Q is the engineer... which is excluded. So R is the engineer and **Q is the doctor**; S, not the teacher, is the lawyer on floor 4, and P is the teacher on floor 3. The search finds this single solution.

# Chapter 7: Shortcuts and Exam Strategy
%Speed techniques for arithmetic, approximations, and how to spend 25 minutes

## 7.1 Calculation shortcuts

| Technique | Example |
|---|---|
| Square of a number ending in 5 | 75² = (7 × 8) and 25 → 5 625 |
| Multiply by 11 | 72 × 11: 7, 7+2, 2 → 792 |
| Numbers near 100 | 97 × 96: (97 − 4) and 3 × 4 → 9 312 |
| Percentage swap | 18% of 50 = 50% of 18 = 9 |
| Successive percentages | +a% then +b%: a + b + ab/100 (e.g. +20% then −10% → +8%) |
| Fractions as percentages | 1/8 = 12.5%, 1/6 = 16.67%, 1/7 ≈ 14.29%, 1/9 ≈ 11.11%, 1/11 ≈ 9.09% |
| Approximation | 4 987 × 0.198 ≈ 5 000 × 0.2 = 1 000 (actual 987.4): eliminate options |
| Options as checks | Plug the options into the question, starting with the middle value |

```python run Checking the shortcut examples
print(75 ** 2, 72 * 11, 97 * 96, 0.18 * 50, round((1.2 * 0.9 - 1) * 100, 2),
      round(4987 * 0.198, 1))
```

## 7.2 Exam strategy

| Phase | Time (of 25 min) | Action |
|---|---|---|
| First pass | 15 min | Answer everything you can in under a minute; mark the rest |
| Second pass | 8 min | Marked questions, easiest first |
| Final | 2 min | Guess the remaining ones (no negative marking in recent patterns) |

> TIP: For long arrangement and puzzle sets, first decide whether the set gives you 4–5 questions (worth investing in) or one (move on). For DI, compute only what the question needs, and use approximations where the options are far apart.

## 7.3 Practical lessons

- Series: differences, ratios, alternation, squares and cubes, letter positions.
- Relations, directions, arrangements: always draw; fix the most constrained element first.
- Syllogisms: a conclusion must hold in **every** valid diagram.
- Data sufficiency: decide uniqueness, do not solve.
- In the exam: two passes, no blanks.
