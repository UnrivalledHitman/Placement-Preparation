# Solutions

## Part 1 solutions

### D1.1 Kinds of data independence

(a) **Physical**: an index is a change at the internal level. (b) **Physical**: the storage device is internal. (c) **Logical**: the conceptual schema changed, and the view keeps the old external shape. (d) **Logical**: adding a column changes the conceptual schema; queries that name their columns are unaffected (a query using `SELECT *` would see the new column, which is one reason to avoid `SELECT *` in application code).

### D1.2 Counting super keys

Every superset of a candidate key is a super key, so count the union of the supersets.

```python run Brute-force super key counts
from itertools import combinations
attrs = 'ABCD'
subsets = [set(c) for k in range(1, 5) for c in combinations(attrs, k)]

for label, keys in [('A only', ['A']), ('A and B', ['A', 'B']), ('AB and CD', ['AB',
        'CD'])]:
    count = sum(any(set(k) <= s for k in keys) for s in subsets)
    print(f'{label:10} -> {count} super keys')
```

(a) Any set containing A: 2<sup>3</sup> = 8. (b) Inclusion–exclusion: 8 (containing A) + 8 (containing B) − 4 (containing both) = 12. (c) 4 + 4 − 1 = 7: supersets of AB number 2<sup>2</sup> = 4, supersets of CD also 4, and only ABCD contains both.

### D1.3 Supplier–parts queries

Relational algebra:

- (a) π<sub>sname</sub>(σ<sub>colour='red'</sub>(Part) ⋈ Catalog ⋈ Supplier)
- (b) π<sub>sid,pid</sub>(Catalog) ÷ π<sub>pid</sub>(Part)
- (c) π<sub>sid</sub>(σ<sub>colour='red' ∨ colour='green'</sub>(Part) ⋈ Catalog)
- (d) π<sub>sid</sub>(σ<sub>colour='red'</sub>(Part) ⋈ Catalog) ∩ π<sub>sid</sub>(σ<sub>colour='green'</sub>(Part) ⋈ Catalog)

```python run The four queries in SQL
import sqlite3
db = sqlite3.connect(':memory:')
db.executescript('''
CREATE TABLE Supplier (sid INT, sname TEXT);
CREATE TABLE Part (pid INT, pname TEXT, colour TEXT);
CREATE TABLE Catalog (sid INT, pid INT, cost INT);
INSERT INTO Supplier VALUES (1, 'Acme'), (2, 'Bolt'), (3, 'Crest');
INSERT INTO Part VALUES (10, 'nut', 'red'), (11, 'bolt', 'green'), (12, 'gear', 'red');
INSERT INTO Catalog VALUES (1, 10, 5), (1, 11, 7), (1, 12, 9), (2, 10, 6), (3, 11, 4);
''')
q = {
 '(a) some red part': '''
    SELECT DISTINCT s.sname FROM Supplier s
    JOIN Catalog c ON s.sid = c.sid JOIN Part p ON p.pid = c.pid
    WHERE p.colour = 'red' ''',
 '(b) every part': '''
    SELECT s.sid FROM Supplier s WHERE NOT EXISTS (
        SELECT * FROM Part p WHERE NOT EXISTS (
            SELECT * FROM Catalog c WHERE c.sid = s.sid AND c.pid = p.pid))''',
 '(c) red or green': '''
    SELECT DISTINCT c.sid FROM Catalog c JOIN Part p ON p.pid = c.pid
    WHERE p.colour IN ('red', 'green')''',
 '(d) red and green': '''
    SELECT c.sid FROM Catalog c JOIN Part p USING (pid) WHERE p.colour = 'red'
    INTERSECT
    SELECT c.sid FROM Catalog c JOIN Part p USING (pid) WHERE p.colour = 'green' ''',
}
for k, sql in q.items():
    print(f'{k:20}', sorted(r[0] for r in db.execute(sql)))
```

> TRAP: (d) cannot be written as `WHERE colour = 'red' AND colour = 'green'`: a single part row is never both colours. You need an intersection (or a self-join on two different catalogue rows).

### D1.4 At least two courses

Rename Enrolled twice and join on the student, keeping pairs with different courses:

π<sub>E1.roll</sub>(σ<sub>E1.roll = E2.roll ∧ E1.cid ≠ E2.cid</sub>(ρ<sub>E1</sub>(Enrolled) × ρ<sub>E2</sub>(Enrolled)))

```python run Self-join versus GROUP BY
import sqlite3
db = sqlite3.connect(':memory:')
db.execute('CREATE TABLE Enrolled (roll INT, cid TEXT)')
db.executemany('INSERT INTO Enrolled VALUES (?, ?)',
               [(1, 'C1'), (1, 'C2'), (1, 'C3'), (2, 'C1'), (3, 'C1'), (3, 'C2'), (4,
                       'C3')])
algebra = '''SELECT DISTINCT e1.roll FROM Enrolled e1, Enrolled e2
             WHERE e1.roll = e2.roll AND e1.cid <> e2.cid'''
grouped = 'SELECT roll FROM Enrolled GROUP BY roll HAVING COUNT(DISTINCT cid) >= 2'
print('self-join :', sorted(r[0] for r in db.execute(algebra)))
print('group by  :', sorted(r[0] for r in db.execute(grouped)))
```

For "at least k" without aggregation you need k copies of the relation and all pairwise inequalities, which is why aggregation was added to SQL.

### D1.5 Hospital ER to tables

- `patient(pid PK, name, ward_id FK NOT NULL)`: the 1:N admission becomes a foreign key on the N side, `NOT NULL` because every patient is in exactly one ward.
- `doctor(did PK, name)`, `ward(ward_id PK, name)`.
- `treats(did FK, pid FK, tdate, PK(did, pid, tdate))`: M:N with an attribute; including the date lets the same doctor treat the same patient on different days.
- `patient_allergy(pid FK, allergy, PK(pid, allergy))`: the multivalued attribute.
- `bed(ward_id FK ON DELETE CASCADE, bed_no, PK(ward_id, bed_no))`: a weak entity.

```python run Testing the hospital schema
import sqlite3
db = sqlite3.connect(':memory:')
db.execute('PRAGMA foreign_keys = ON')
db.executescript('''
CREATE TABLE ward (ward_id INT PRIMARY KEY, name TEXT);
CREATE TABLE patient (pid INT PRIMARY KEY, name TEXT,
                      ward_id INT NOT NULL REFERENCES ward(ward_id));
CREATE TABLE doctor (did INT PRIMARY KEY, name TEXT);
CREATE TABLE treats (did INT REFERENCES doctor(did), pid INT REFERENCES patient(pid),
                     tdate TEXT, PRIMARY KEY (did, pid, tdate));
CREATE TABLE patient_allergy (pid INT REFERENCES patient(pid), allergy TEXT,
                              PRIMARY KEY (pid, allergy));
CREATE TABLE bed (ward_id INT REFERENCES ward(ward_id) ON DELETE CASCADE, bed_no INT,
                  PRIMARY KEY (ward_id, bed_no));
INSERT INTO ward VALUES (1, 'General'), (2, 'ICU');
INSERT INTO patient VALUES (100, 'Asha', 1);
INSERT INTO doctor VALUES (7, 'Dr Sen');
INSERT INTO treats VALUES (7, 100, '2026-10-01'), (7, 100, '2026-10-05');
INSERT INTO bed VALUES (2, 1), (2, 2);
''')
for label, sql in [('patient with no ward',
        "INSERT INTO patient VALUES (101, 'Ravi', NULL)"),
                   ('same treatment twice',
                           "INSERT INTO treats VALUES (7, 100, '2026-10-01')"),
                   ('bed number reused in another ward', 'INSERT INTO bed VALUES (1, 1)')]:
    try:
        db.execute(sql); print('ACCEPTED:', label)
    except sqlite3.IntegrityError as e:
        print('REJECTED:', label, '-', e)
db.execute('DELETE FROM ward WHERE ward_id = 2')
print('beds left after deleting the ICU:',
        db.execute('SELECT COUNT(*) FROM bed').fetchone()[0])
```

Bed number 1 in ward 1 is accepted because the bed's key is (ward, number), not the number alone: that is exactly what a partial key of a weak entity means.

### D1.6 Minimum number of tables

**5 tables**: E1; E2 (carrying E1's key as a foreign key, because the 1:N relationship folds into the N side); E3; one table for the M:N relationship between E2 and E3; and one for E3's multivalued attribute.

> TRAP: Only 1:1 and 1:N relationships can be folded into an entity table. An M:N relationship and a multivalued attribute always need their own tables, so the minimum here is 5, not 4.

## Part 2 solutions

All solutions in this part use `fd.py` from Chapter 3 of the guide.

### D2.1 Attribute closure

```python run Closures with a trace
from fd import *
F = parse('AB->C, BC->AD, D->E, CF->B')
for x in ['AB', 'CF']:
    print(f'{x}+ :')
    print(f'   = {fmt(closure(x, F, trace=True))}')
```

(AB)<sup>+</sup> = ABCDE, missing F, so AB is **not** a key (nothing determines F, so every key must contain F). (CF)<sup>+</sup> = ABCDEF, so CF is a superkey; neither C<sup>+</sup> = C nor F<sup>+</sup> = F is, so CF is a candidate key.

### D2.2 All candidate keys

```python run Keys of R(ABCDEF)
from fd import *
F = parse('AB->C, C->D, D->B, E->F')
keys = candidate_keys('ABCDEF', F)
print('keys :', [fmt(k) for k in keys])
print('prime:', fmt(set().union(*keys)))
```

A and E never appear on a right side, so both are in every key, but AE<sup>+</sup> = AEF. Adding any of B, C or D completes it: B gives C (AB → C), then D; C gives D, then B; D gives B, then C. So the keys are **ABE, ACE, ADE**, and the only non-prime attribute is F. Since E → F is a partial dependency (E is part of every key), R is only in 1NF.

### D2.3 Keys and normal form

```python run Keys and the highest normal form
from fd import *
F = parse('A->B, BC->E, ED->A')
print([fmt(k) for k in candidate_keys('ABCDE', F)], normal_form('ABCDE', F))
```

C and D appear only on the left, so they are in every key. CD<sup>+</sup> = CD, so add one more: ACD<sup>+</sup> = ABCDE (A → B, then BC → E), BCD<sup>+</sup> = ABCDE (BC → E, then ED → A), CDE<sup>+</sup> = ABCDE (ED → A, then A → B). Every attribute is prime, so R is in **3NF**. It is **not** BCNF: in A → B, A is not a superkey.

### D2.4 Implied dependencies

```python run Testing implication with closures
from fd import *
F = parse('A->C, C->D, BD->E')
for x, y in [('A', 'D'), ('AB', 'E'), ('B', 'E'), ('AD', 'C')]:
    print(f'{x}->{y}: {set(y) <= closure(x, F)}   ({x}+ = {fmt(closure(x, F))})')
```

(a) Yes, by transitivity. (b) Yes: AB<sup>+</sup> contains D (through A → C → D), and then BD → E fires. (c) No: B<sup>+</sup> = B. (d) Yes: A alone gives C, so AD → C by augmentation.

### D2.5 A minimal cover

```python run Minimal cover step by step
from fd import *
F = parse('A->B, AB->C, D->AC, D->E')
print('split right sides  :', show(singleton_rhs(F)))
print('minimal cover      :', show(minimal_cover(F)))
```

Splitting gives A → B, AB → C, D → A, D → C, D → E. In AB → C, B is extraneous because A<sup>+</sup> already contains B, so it becomes A → C. Then D → C is redundant: D → A and A → C imply it. Result: **A → B, A → C, D → A, D → E**.

### D2.6 Equivalent sets

```python run Equivalence check
from fd import *
F = parse('A->C, AC->D, E->AD, E->H')
G = parse('A->CD, E->AH')
covers = lambda f, g: all(r <= closure(l, f) for l, r in g)
print('F covers G:', covers(F, G), '| G covers F:', covers(G, F))
```

Each FD of G follows from F (A<sup>+</sup> under F contains C and D; E<sup>+</sup> contains A and H) and vice versa, so they are **equivalent**.

### D2.7 Highest normal form, five times

```python run Five relations
from fd import *
for rel, text in [('ABCD', 'A->B, B->C'), ('ABCD', 'AB->C, C->D'), ('ABCD', 'AB->CD, C->A'),
                  ('ABCDE', 'AB->CDE, D->A'), ('ABC', 'A->B, B->A, A->C')]:
    F = parse(text)
    print(f'R({rel}) {text:16} keys {[fmt(k) for k in candidate_keys(rel, F)]}, '
          f'{normal_form(rel, F)}')
```

- (a) Key AD. A → B is a partial dependency (A is part of the key): **1NF**.
- (b) Key AB. No partial dependency, but C → D is transitive (C is not a superkey, D not prime): **2NF**.
- (c) Keys AB and BC. C → A: C is not a superkey, but A is prime: **3NF**, not BCNF.
- (d) Keys AB and BD. D → A: A is prime: **3NF**.
- (e) Keys A and B, and every determinant is a key: **BCNF**.

### D2.8 BCNF decomposition

```python run BCNF decomposition and its checks
from fd import *
F = parse('AB->C, C->D, D->E')
parts = bcnf_decompose('ABCDE', F)
names = sorted(fmt(p) for p in parts)
print('parts                 :', names)
print('each part in          :', [normal_form(p, project(p, F)) for p in names])
print('lossless              :', lossless('ABCDE', names, F))
print('lost dependencies     :', show(preserves(names, F)) or 'none')
```

The key is AB. C → D violates BCNF: C<sup>+</sup> = CDE, so split into CDE and ABC. In CDE, D → E still violates BCNF (D is not a key of CDE), so split into DE and CD. Final: **ABC, CD, DE**. Each split was on a determinant's closure, so it is lossless, and here every FD lies inside one part (AB → C in ABC, C → D in CD, D → E in DE), so it is also dependency preserving.

### D2.9 3NF synthesis

```python run Synthesis on two relations
from fd import *
for rel, text in [('ABCDEF', 'A->BC, C->DE, E->F'), ('ABCDE', 'A->B, C->D')]:
    F = parse(text)
    print(f'R({rel}) keys {[fmt(k) for k in candidate_keys(rel, F)]} '
          f'-> 3NF schemas {sorted(fmt(p) for p in synthesis_3nf(rel, F))}')
```

(a) The minimal cover is A → B, A → C, C → D, C → E, E → F; grouping by left side gives ABC, CDE, EF. ABC contains the key A, so nothing is added. (b) The cover gives AB and CD, but neither contains the key ACE (E appears in no FD, so it must be in every key). Without a key schema the decomposition would be **lossy**: there would be no table linking A, C and E. So ACE is added.

### D2.10 Lossless or lossy?

```python run Chase tests
from fd import *
print('(a)', lossless('ABCDE', ['ABC', 'CDE'], parse('A->B, C->D')))
print('(b)', lossless('ABCDE', ['ABC', 'CDE'], parse('A->B, C->DE')))
print('(c)', lossless('ABCD', ['AB', 'BC', 'CD'], parse('A->B, B->C, C->D')))
```

(a) **Lossy**: the common attribute C determines only D, not all of CDE (and not ABC). (b) **Lossless**: now C → DE, so C is a key of CDE. (c) **Lossless**: join AB and BC first (B → C makes B a key of BC), then join with CD (C → D).

### D2.11 The cyclic preservation trap

```python run Is D->A preserved?
from fd import *
F = parse('A->B, B->C, C->D, D->A')
print('lost:', show(preserves(['AB', 'BC', 'CD'], F)) or 'none')
for lhs, part in [('D', 'CD'), ('C', 'BC'), ('B', 'AB')]:
    print(f'   in {part}: {lhs}+ restricted = {fmt(closure(lhs, F) & set(part))}')
```

**Yes, it is preserved.** Inside CD, the projected FDs include D → C (because D<sup>+</sup> = ABCD); inside BC, C → B; inside AB, B → A. Chaining D → C → B → A derives D → A without any table containing both. This is why dependency preservation must be tested with the closure algorithm and not by looking for an FD inside one table.

### D2.12 An MVD in disguise

(a) emp →→ skill and emp →→ project (they come as a pair). (b) The only key is (emp, skill, project), so there are no non-trivial FDs and the relation is in **BCNF**, but emp →→ skill is a non-trivial MVD whose left side is not a superkey, so it is **not in 4NF**. (c) Decompose into (emp, skill) and (emp, project).

```python run Rows before and after the 4NF split
skills, projects = ['java', 'sql', 'ml'], ['p1', 'p2', 'p3', 'p4']
combined = {('asha', s, p) for s in skills for p in projects}
es = {(e, s) for e, s, p in combined}
ep = {(e, p) for e, s, p in combined}
rejoined = {(e, s, p) for e, s in es for e2, p in ep if e == e2}
print(f'before: {len(combined)} rows | after: {len(es)} + {len(ep)} = {len(es) + len(ep)} '
        f'rows')
print('lossless:', rejoined == combined)
```

Adding one new skill costs 4 rows before (one per project) and 1 row after.

### D2.13 A real 2NF violation

Partial dependencies: product_id → product_name, unit_price (part of the key) and order_id → order_date, customer_id (the other part). Only qty depends on the whole key. 3NF decomposition: `product(product_id, product_name, unit_price)`, `orders(order_id, order_date, customer_id)`, `order_line(order_id, product_id, qty)`.

Anomalies in the original: **update** (changing a product's name must touch every order line), **insertion** (a new product cannot be stored until someone orders it), **deletion** (deleting the last order line of a product loses its price).

> NOTE: Real systems often store `unit_price` **in** order_line on purpose: the price at the time of the order is a different fact from the current list price. That is not a normalisation violation, because it no longer depends on product_id alone.

## Part 3 solutions

These solutions use `sched.py` from Chapter 4 of the guide.

### D3.1 Spot the conflicts

```python run Listing conflicting pairs
from sched import parse
ops = parse('R1(A) R2(B) W2(A) R1(B) W1(B)')
names = {'RW': 'read-write', 'WR': 'write-read', 'WW': 'write-write'}
for i, (k1, t1, x1) in enumerate(ops):
    for k2, t2, x2 in ops[i + 1:]:
        if x1 == x2 and t1 != t2 and 'W' in (k1, k2):
            print(f'{k1}{t1}({x1}) before {k2}{t2}({x2}): {names[k1 + k2]}')
```

Two conflicts: R1(A)–W2(A) gives T1 → T2, but R2(B)–W1(B) gives T2 → T1. The precedence graph has a cycle, so S is not conflict serialisable. R1(B) and R2(B) do not conflict (both reads).

### D3.2 Conflict serialisable?

```python run Precedence graphs for four schedules
from sched import parse, precedence, serial_orders
for label, s in [('a', 'R1(X) R2(Y) W1(X) R3(X) W2(Y) W3(X)'), ('b',
        'R1(A) R2(B) W2(A) W1(B)'),
                 ('c', 'R2(X) W3(X) R1(X) W1(X) W2(Y) R3(Y)'), ('d',
                         'R1(A) W2(A) R3(A) W1(B) R2(B) W3(B)')]:
    ops = parse(s)
    print(f'({label}) edges {sorted(precedence(ops))} -> serial orders {serial_orders(ops)}')
```

(a) Only T1 → T3 (T2 touches Y alone, which no one else writes before it), so any order with T1 before T3: **T1 T2 T3, T1 T3 T2, T2 T1 T3**. (b) Cycle T1 ⇄ T2: **not** serialisable. (c) Edges T2 → T3, T2 → T1, T3 → T1: **T2 T3 T1** only. (d) Edges T1 → T2, T1 → T3, T2 → T3: **T1 T2 T3** only.

### D3.3 View serialisability

```python run Conflict versus view serialisability
from sched import parse, txns, conflict_serialisable, precedence
from itertools import permutations

def view(ops):
    last, reads, seen = {}, set(), {}
    for kind, t, x in ops:
        if kind == 'R':
            n = seen[(t, x)] = seen.get((t, x), 0) + 1
            reads.add((t, x, n, last.get(x)))
        elif kind == 'W':
            last[x] = t
    return reads, last

ops = parse('R1(A) W2(A) R3(A) W1(A) W3(A)')
print('edges:', sorted(precedence(ops)), '| conflict serialisable:',
        conflict_serialisable(ops))
target = view(ops)
print('view-equivalent serial orders:',
      [p for p in permutations(txns(ops))
       if view([o for t in p for o in ops if o[1] == t]) == target])
```

**Not conflict serialisable**: R1(A) before W2(A) gives T1 → T2, and W2(A) before W1(A) gives T2 → T1 (T1 and T3 also form a cycle). **View serialisable, equivalent to T1, T2, T3**. Check the three conditions against that serial order: T1 reads the initial value of A in both; T3 reads A from T2 in both (in the original, R3(A) comes right after W2(A)); and T3 makes the final write in both. T1's write W1(A) is overwritten by W3(A) before anyone reads it, so its position does not matter. As the guide predicts, the schedule contains a blind write: T2 writes A without ever reading it.

### D3.4 Counting schedules

```python run Brute-force over all interleavings
from itertools import combinations
from sched import conflict_serialisable
t1 = [('R', 1, 'A'), ('W', 1, 'A'), ('R', 1, 'B')]
t2 = [('R', 2, 'A'), ('W', 2, 'A')]
total = serialisable = 0
for pos in combinations(range(5), 3):                # positions taken by T1's operations
    it1, it2 = iter(t1), iter(t2)
    sched = [next(it1) if i in pos else next(it2) for i in range(5)]
    total += 1
    serialisable += conflict_serialisable(sched)
print('interleavings:', total, '| conflict serialisable:', serialisable)
```

(a) Choosing which 3 of the 5 positions belong to T1 gives C(5, 3) = 5!/(3!·2!) = **10**. (b) **4**. To avoid a cycle on A, T2's two operations must come either both before R1(A), or both after W1(A). The first case is just the serial order T2, T1 (1 schedule). In the second, after R1(A) W1(A) the remaining operations R1(B), R2(A), W2(A) can be arranged in 3 ways that keep R2(A) before W2(A). Total 1 + 3 = 4, matching the brute force.

### D3.5 Recoverability

```python run Classifying four schedules
from sched import parse

def classify(s):
    ops = parse(s)
    commit_at = {t: i for i, (k, t, _) in enumerate(ops) if k == 'C'}
    end_at = {t: i for i, (k, t, _) in enumerate(ops) if k in 'CA'}
    recoverable = cascadeless = strict = True
    last_writer = {}
    for i, (kind, t, x) in enumerate(ops):
        if kind not in 'RW':
            continue
        w = last_writer.get(x)
        if w is not None and w != t:
            uncommitted = end_at.get(w, 10 ** 9) > i
            if kind == 'R':
                cascadeless &= not uncommitted
                if t in commit_at and commit_at.get(w, 10 ** 9) > commit_at[t]:
                    recoverable = False
            strict &= not uncommitted
        if kind == 'W':
            last_writer[x] = t
    if not recoverable:
        return 'not recoverable'
    if not cascadeless:
        return 'recoverable only'
    return 'strict' if strict else 'cascadeless, not strict'

for label, s in [('a', 'W1(A) R2(A) C1 C2'), ('b', 'W1(A) R2(A) C2 C1'),
                 ('c', 'W1(A) W2(A) C2 C1'), ('d', 'R1(A) W2(A) C2 R1(A) C1')]:
    print(f'({label}) {s:24} -> {classify(s)}')
```

(a) T2 reads uncommitted data but commits after T1: recoverable only. (b) T2 commits before the T1 it read from: not recoverable. (c) No dirty read, but W2(A) overwrites uncommitted data: cascadeless, not strict. (d) T1's second read sees T2's **committed** write, and nothing touches uncommitted data: strict (it does have a non-repeatable read, which is an isolation issue, not a recoverability one).

### D3.6 Which ACID property?

(a) **Durability**. (b) **Atomicity**: half a transaction survived. (c) **Isolation**: a dirty or partial view of another transaction. (d) **Consistency**: the database accepted a state that breaks a business rule; the fix is a `CHECK (quantity > 0)` constraint.

### D3.7 Topological orders

```python run Counting topological orders
from itertools import permutations
edges = [(1, 2), (1, 3), (2, 4), (3, 4)]
ok = [p for p in permutations([1, 2, 3, 4]) if all(p.index(a) < p.index(b) for a,
        b in edges)]
print(len(ok), 'serial orders:', ok)
edges.append((4, 1))
ok = [p for p in permutations([1, 2, 3, 4]) if all(p.index(a) < p.index(b) for a,
        b in edges)]
print('with 4 -> 1:', len(ok), 'serial orders')
```

T1 must come first and T4 last; T2 and T3 can be in either order: **2** serial schedules. Adding T4 → T1 creates the cycle T1 → T2 → T4 → T1, so there are **none**: the schedule is no longer conflict serialisable.

## Part 4 solutions

### D4.1 Is it two-phase?

**No.** T1 releases A (`unlock(A)`) and then acquires a new lock (`lock-S(C)`): a lock request after a release breaks the two-phase rule. Its growing phase should end at the lock point, the last lock acquisition, which here comes after an unlock. It is also not strict 2PL, because the X lock on B must be held until commit and T1 releases it before the end. To make it 2PL, move `lock-S(C)` before `unlock(A)`; to make it strict, also hold B until commit.

### D4.2 Simulate the deadlock

```python run Strict 2PL trace for opposite-order access
txns = {1: [('W', 'A'), ('R', 'B')], 2: [('W', 'B'), ('R', 'A')]}
locks, pc, waits = {}, {1: 0, 2: 0}, {}
for t in [1, 2, 1, 2]:
    kind, x = txns[t][pc[t]]
    holder = locks.get(x)
    if holder in (None, t):
        locks[x] = t; pc[t] += 1
        print(f'T{t} {kind}({x}): granted {"X" if kind == "W" else "S"} lock on {x}')
    else:
        waits[t] = holder
        print(f'T{t} {kind}({x}): waits for T{holder} (holds X on {x})')
print('wait-for graph:', ' , '.join(f'T{a} -> T{b}' for a, b in waits.items()))
if all(waits.get(waits[t]) == t for t in waits):
    victim = max(waits)
    print(f'cycle found: abort the youngest, T{victim}; T{min(waits)} then gets its lock')
```

Each transaction holds an X lock the other needs (T1 holds A and wants B; T2 holds B and wants A), so the wait-for graph is the cycle T1 → T2 → T1. Aborting T2 releases B; T1 finishes; T2 restarts later.

### D4.3 Wait-die and wound-wait decisions

```python run Decisions for three requests
ts = {'T1': 5, 'T2': 10, 'T3': 15}
for req, hold in [('T1', 'T2'), ('T3', 'T2'), ('T2', 'T1')]:
    older = ts[req] < ts[hold]
    wd = f'{req} waits' if older else f'{req} dies'
    ww = f'{req} wounds {hold} ({hold} aborts)' if older else f'{req} waits'
    print(f'{req} asks {hold}: wait-die -> {wd:10} | wound-wait -> {ww}')
```

(a) T1 is older: wait-die makes it wait; wound-wait aborts T2. (b) T3 is younger: wait-die kills T3; wound-wait makes T3 wait. (c) T2 is younger than T1: dies under wait-die, waits under wound-wait. In every case only the younger transaction can be aborted.

### D4.4 Timestamp ordering trace

```python run Basic TO and the Thomas write rule
def to(schedule, thomas=False):
    rts, wts, aborted, log = {}, {}, set(), []
    for op in schedule.split():
        kind, t, x = op[0], int(op[1]), op[3]
        if t in aborted:
            log.append(f'{op}: skipped'); continue
        if kind == 'R':
            if t < wts.get(x, 0):
                aborted.add(t); log.append(f'{op}: ABORT T{t}')
            else:
                rts[x] = max(rts.get(x, 0), t); log.append(f'{op}: ok')
        elif t < rts.get(x, 0):
            aborted.add(t); log.append(f'{op}: ABORT T{t}')
        elif t < wts.get(x, 0):
            if thomas:
                log.append(f'{op}: ignored')
            else:
                aborted.add(t); log.append(f'{op}: ABORT T{t}')
        else:
            wts[x] = t; log.append(f'{op}: ok')
    return log

s = 'R2(A) R1(A) W1(A) W2(A) R3(A) W3(A)'
print('basic :', ' | '.join(to(s)))
print('Thomas:', ' | '.join(to(s, thomas=True)))
```

W1(A) arrives after R2(A) has set R-TS(A) = 2. T1 (timestamp 1) would overwrite a value that a younger transaction already read, so T1 aborts under **both** rules. The Thomas rule only rescues writes that are obsolete with respect to W-TS, not ones that conflict with a later read.

### D4.5 Write skew and its fix

```python run Snapshot isolation: double booking and the fix
class SIDB:
    def __init__(self, data):
        self.versions = {k: [(0, v)] for k, v in data.items()}
        self.clock = 0
    def begin(self):
        return {'start': self.clock, 'writes': {}}
    def read(self, tx, key):
        if key in tx['writes']:
            return tx['writes'][key]
        return [v for ts, v in self.versions.get(key, [(0, None)]) if ts <= tx['start']][-1]
    def write(self, tx, key, value):
        tx['writes'][key] = value
    def commit(self, tx, name):
        for key in tx['writes']:
            if key in self.versions and self.versions[key][-1][0] > tx['start']:
                return f'{name} aborts'
        self.clock += 1
        for key, v in tx['writes'].items():
            self.versions.setdefault(key, []).append((self.clock, v))
        return f'{name} commits'

def book(db, fix):
    ta, tb = db.begin(), db.begin()
    for tx, team in [(ta, 'team_a'), (tb, 'team_b')]:
        if db.read(tx, 'bookings_10:00') in (None, []):
            db.write(tx, f'booking_10:00_{team}', team)       # insert own row
            if fix:
                db.write(tx, 'slot_10:00', team)              # also update a shared row
    result = [db.commit(ta, 'A'), db.commit(tb, 'B')]
    snap = db.begin()
    teams = [k for k in db.versions if k.startswith('booking_10:00_')]
    return result, teams

print('plain SI      :', book(SIDB({'slot_10:00': None}), fix=False))
print('with slot row :', book(SIDB({'slot_10:00': None}), fix=True))
```

Without the fix, each transaction inserts a **different** row, so first-committer-wins sees no overlap and both bookings commit: a double booking. Making both transactions write the shared `slot_10:00` row *materialises the conflict*; the second committer now aborts. In SQL the same fix is a unique constraint on (room, slot), which is usually the simplest answer of all, or `SELECT ... FOR UPDATE` on the slot row.

### D4.6 Minimum isolation level

(a) **Read committed** (prevents dirty reads). (b) **Repeatable read**. (c) **Serializable** in ANSI terms (phantoms); InnoDB's repeatable read with next-key locks also prevents them for locking reads. (d) **Serializable**: snapshot isolation is not enough for write skew.

### D4.7 Intention locks

(a) IS on the database and the table, S on the row. (b) IX on the database and the table, X on the row. (c) SIX on the table (S for the whole-table read plus IX for the updates), IX on the database, then X on each updated row. Can (b) run while another transaction holds S on the table? **No**: IX (needed on the table by (b)) is incompatible with S. That is exactly the point of intention locks: the table-level S holder is guaranteed that nobody is changing rows underneath it.
