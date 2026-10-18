# Chapter 12: Relational Model, Algebra, Calculus and SQL
%ER models, keys and integrity constraints, relational algebra, tuple relational calculus and SQL query semantics

## 12.1 ER model to relations

| ER construct | Relations produced |
|---|---|
| Strong entity E(key, attributes) | One relation with the same key |
| Multi-valued attribute of E | A separate relation (E's key, value), keyed on both |
| Composite attribute | Flattened into its components |
| Weak entity | A relation keyed on the owner's key plus the partial key |
| 1 : N relationship | The "one" side's key added as a foreign key on the "many" side |
| 1 : 1 relationship | A foreign key on either side (prefer the side with total participation) |
| M : N relationship | A separate relation keyed on both entity keys (plus relationship attributes) |

### Worked example: counting relations

*Entities E1(A, B, C) and E2(P, Q, R) have keys A and P; Q is multi-valued. An M : N relationship links E1 and E2, with total participation on both sides. What is the minimum number of 3NF relations? (NAT)*

E1 needs one relation and E2 one (without Q), Q needs its own relation (P, Q), and the M : N relationship needs one (A, P). Total participation does not remove the relationship table for M : N. Answer: 4.

## 12.2 Keys and integrity constraints

| Term | Meaning |
|---|---|
| Superkey | A set of attributes that determines all attributes (no two tuples agree on it) |
| Candidate key | A minimal superkey |
| Primary key | The chosen candidate key; no NULLs allowed |
| Foreign key | Attributes whose values must appear in the referenced relation's key (or be NULL) |
| Entity integrity | Primary key attributes cannot be NULL |
| Referential integrity | Every non-NULL foreign key value matches some referenced key |

**Which operations can violate a foreign key** from S (referencing) to R (referenced)? Inserting into S (a value missing from R) and deleting from R or updating R's key (orphaning rows of S), unless cascading actions are declared. Deleting from S or inserting into R never violates it.

## 12.3 Relational algebra

| Operator | Symbol | Result |
|---|---|---|
| Selection | σ_condition(R) | The tuples satisfying the condition |
| Projection | π_attributes(R) | Those columns, **duplicates removed** |
| Union, difference, intersection | R ∪ S, R − S, R ∩ S | Need union-compatible schemas |
| Cartesian product | R × S | Every pair of tuples: \|R\| × \|S\| rows |
| Natural join | R ⋈ S | Pairs that agree on all common attributes, common columns kept once |
| Theta join | R ⋈_θ S | σ_θ(R × S) |
| Division | R ÷ S | Values x such that (x, y) ∈ R for **every** y in S |
| Rename | ρ | Renames a relation or attributes |

Division answers "for all" questions: "customers who have loans at every branch" is π_{cust,branch}(Borrow ⋈ Loan) ÷ π_branch(Loan).

**Joins with no common attributes** become Cartesian products. A natural join over a NULL value never matches: NULL equals nothing, not even another NULL.

```python run Relational algebra on small relations, including division
def project(R, cols):
    return {tuple(t[c] for c in cols) for t in R}

def natural_join(R, S):
    common = set(R[0]) & set(S[0]) if R and S else set()
    out = []
    for r in R:
        for s in S:
            if all(r[c] == s[c] and r[c] is not None for c in common):
                out.append({**r, **s})
    return out

Loan = [dict(loan=l, branch=b, amount=a) for l, b, a in
        [('L1', 'North', 900), ('L2', 'South', 500), ('L3', 'North', 400), ('L4', 'East',
                250)]]
Borrower = [dict(cust=c, loan=l) for c, l in
            [('Asha', 'L1'), ('Ravi', 'L1'), ('Ravi', 'L2'), ('Ravi', 'L4'), ('Mina', 'L3'),
                    ('Mina', 'L2')]]

pairs = project(natural_join(Loan, Borrower), ['cust', 'branch'])
branches = project(Loan, ['branch'])
custs = {c for c, _ in pairs}
division = {c for c in custs if all((c, b) in pairs for (b,) in branches)}
print('customer-branch pairs:', sorted(pairs))
print('borrowers at every branch:', division)
print('borrowers at every branch where they borrow > 300:',
      {c for c in custs if all((c, b) in pairs for b in {l['branch'] for l in Loan
              if l['amount'] > 300})})
```

Ravi borrows at North, South and East, so he alone divides by all three branches. Restricting the divisor to branches with a loan above 300 (North and South) admits Mina too.

## 12.4 Tuple relational calculus

TRC describes the result instead of the procedure: {t | P(t)} is the set of tuples t that make P true. Quantifiers range over relations: ∃s ∈ S (…) and ∀s ∈ S (…).

| English | TRC |
|---|---|
| Loans over 400 | {t \| t ∈ Loan ∧ t[amount] > 400} |
| Customers with some loan at North | {t \| ∃b ∈ Borrower ∃l ∈ Loan (t[cust] = b[cust] ∧ b[loan] = l[loan] ∧ l[branch] = 'North')} |
| Customers with loans at every branch | {t \| ∀l ∈ Loan ∃b ∈ Borrower ∃m ∈ Loan (b[cust] = t[cust] ∧ b[loan] = m[loan] ∧ m[branch] = l[branch])} |

A **safe** expression returns a finite result determined by the database; {t | ¬(t ∈ R)} is unsafe.

## 12.5 SQL semantics

| Feature | Rule |
|---|---|
| Logical order | FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY |
| Duplicates | SQL keeps duplicates unless you write DISTINCT (unlike algebraic projection) |
| NULL in comparisons | Gives UNKNOWN; WHERE keeps only TRUE rows |
| COUNT(*) versus COUNT(col) | COUNT(*) counts rows; COUNT(col) skips NULLs |
| Aggregates on an empty set | COUNT gives 0; SUM, MAX, AVG give NULL |
| `x > ALL (subquery)` | True if x exceeds every value (true on an empty subquery) |
| `x > ANY (subquery)` | True if x exceeds at least one value |
| Correlated subquery | Re-evaluated for each outer row |
| `NOT IN` with a NULL in the list | Never true |

```python run SQL output counts on SQLite
import sqlite3
con = sqlite3.connect(':memory:')
con.executescript('''
CREATE TABLE loan(loan TEXT PRIMARY KEY, branch TEXT, amount INT);
INSERT INTO loan VALUES ('L1','North',900),('L2','South',500),('L3','North',400),
                        ('L4','East',250),('L5','South',700),('L6','East',650);
CREATE TABLE acct(acc TEXT, bal INT);
INSERT INTO acct VALUES ('A1',5000),('A2',5000),('A3',8000),('A4',12000),('A5',20000);
CREATE TABLE emp(id INT PRIMARY KEY, team INT NOT NULL);
INSERT INTO emp VALUES (1,8),(2,8),(3,8),(4,7),(5,7),(6,9);
''')
q = lambda sql: con.execute(sql).fetchall()
print('Loans above the largest South loan:',
      q("SELECT loan FROM loan WHERE amount > (SELECT MAX(amount) FROM loan WHERE "
              "branch='South')"))
print('Loans above every East loan (> ALL, written as > MAX):',
      q("SELECT loan FROM loan WHERE amount > (SELECT MAX(amount) FROM loan WHERE "
              "branch='East')"))
print('Accounts with at least as many richer as poorer accounts:',
      q('''SELECT acc FROM acct a WHERE (SELECT COUNT(*) FROM acct b WHERE a.bal < b.bal)
           >= (SELECT COUNT(*) FROM acct c WHERE a.bal > c.bal)'''))
print('Team sizes per employee:',
      q('''SELECT e.id, t.size
           FROM emp e JOIN (SELECT team, COUNT(*) AS size FROM emp GROUP BY team) t
           ON e.team = t.team ORDER BY e.id'''))
```

SQLite does not support `> ALL`, so the second query uses the standard rewrite: for a non-empty subquery without NULLs, `x > ALL (S)` means `x > MAX(S)`, and `x > ANY (S)` means `x > MIN(S)`. The loans above every East loan (250 and 650) are L1 and L5. In the third query, A1 and A2 (balance 5000) have 3 richer and 0 poorer accounts, and A3 has 2 richer and 2 poorer, so three rows qualify.

## 12.6 Traps

| Trap | Correct thinking |
|---|---|
| Projection keeps duplicates | Relational algebra removes them; SQL keeps them unless DISTINCT |
| Natural join with no common attribute is empty | It is a Cartesian product |
| NULL = NULL is true | It is UNKNOWN; use IS NULL |
| Deleting from the referencing table can violate a foreign key | Only inserts into it, or deletes and key updates in the referenced table |
| Total participation removes the M : N table | An M : N relationship always needs its own relation |
| COUNT(col) counts NULLs | It skips them; COUNT(*) does not |

# Chapter 13: Normalisation, File Organisation and Indexing
%Functional dependencies and closures, candidate keys, normal forms, decompositions, and B+ tree index arithmetic

## 13.1 Functional dependencies and closures

X → Y means any two tuples that agree on X agree on Y. **Armstrong's axioms** (reflexivity, augmentation, transitivity) derive all implied dependencies; union and decomposition follow from them.

The **closure** X⁺ is the set of attributes determined by X. Compute it by starting with X and repeatedly adding the right side of any dependency whose left side is already inside. X is a superkey exactly when X⁺ is every attribute.

**Finding candidate keys.** Attributes that never appear on a right side must be in every key. Start from them, take the closure, and add attributes one at a time until the closure covers everything; then check minimality.

### Worked example: candidate keys

*R(A, B, C, D, E) with A → BC, CD → E, E → A. Find all candidate keys. (MCQ)*

D appears on no right side, so every key contains D. D⁺ = {D}. Try AD: A gives BC, CD gives E, so AD⁺ is everything; AD is a key. ED: E gives A, then AD as before, so ED is a key. CD: CD gives E, E gives A, A gives B; also a key. BD⁺ = {B, D}, not a key. The candidate keys are AD, ED and CD.

```python run Closures and every candidate key by brute force
from itertools import combinations

def closure(X, fds):
    X = set(X)
    changed = True
    while changed:
        changed = False
        for lhs, rhs in fds:
            if set(lhs) <= X and not set(rhs) <= X:
                X |= set(rhs); changed = True
    return X

def candidate_keys(attrs, fds):
    keys = []
    for r in range(1, len(attrs) + 1):
        for combo in combinations(attrs, r):
            if closure(combo, fds) == set(attrs) and not any(set(k) <= set(combo)
                    for k in keys):
                keys.append(combo)
    return [''.join(k) for k in keys]

print(candidate_keys('ABCDE', [('A', 'BC'), ('CD', 'E'), ('E', 'A')]))
print(candidate_keys('ABCDEFG', [('A', 'BCEF'), ('E', 'DG'), ('BC', 'A')]))
```

## 13.2 Normal forms

| Normal form | Condition | Removes |
|---|---|---|
| 1NF | Atomic attribute values | Repeating groups |
| 2NF | 1NF, and no non-prime attribute depends on part of a candidate key | Partial dependencies |
| 3NF | For every non-trivial X → A: X is a superkey **or** A is prime (part of some candidate key) | Transitive dependencies |
| BCNF | For every non-trivial X → A: X is a superkey | All anomalies from FDs |

Every BCNF relation is in 3NF, every 3NF relation in 2NF. A relation with only two attributes is always in BCNF.

In the second example above, the keys are A and BC. E → DG violates BCNF, because E is not a superkey; it also violates 3NF, because D and G are not prime.

## 13.3 Decomposition

| Property | Test |
|---|---|
| Lossless join (binary split R1, R2) | (R1 ∩ R2) → R1 or (R1 ∩ R2) → R2 holds |
| Dependency preserving | Every original FD can be checked inside one of the pieces (the union of the projected FDs implies the original set) |
| 3NF synthesis | Always lossless and dependency preserving |
| BCNF decomposition | Always lossless, but not always dependency preserving |

If a decomposition does not preserve dependencies, enforcing an FD that spans two relations needs a **join** on every update, which is the cost GATE asks about.

## 13.4 File organisation and indexing

| Organisation | Search | Insert | Notes |
|---|---|---|---|
| Heap (unordered) file | Linear scan | O(1), at the end | Good for bulk loading |
| Sorted file | Binary search on blocks | Expensive | Good for range queries |
| Hash file | O(1) expected for equality | O(1) expected | No range queries |
| B+ tree index | O(log_f n) | O(log_f n) | Balanced; all data pointers at the leaves; leaves linked for range scans |

**Primary** (clustering) index: on the ordering key of a sorted file, often **sparse** (one entry per block). **Secondary** index: on a non-ordering attribute, always **dense** (one entry per record).

**B+ tree order arithmetic.** A non-leaf node with p pointers holds p − 1 keys, so p × (pointer size) + (p − 1) × (key size) ≤ block size. A leaf holds k keys with k record pointers plus one pointer to the next leaf.

### Worked example: B+ tree fan-out

*Block size 2048 bytes, key 8 bytes, tree pointer 8 bytes, record pointer 10 bytes. Find the maximum number of pointers in a non-leaf node, and keys in a leaf. (NAT)*

Non-leaf: 8p + 8(p − 1) ≤ 2048 gives 16p ≤ 2056, so p = 128. Leaf: 8k + 10k + 8 ≤ 2048 gives 18k ≤ 2040, so k = 113.

```python run B+ tree fan-out and height
import math

def nonleaf_pointers(block, key, ptr):
    return (block + key) // (ptr + key)

def leaf_keys(block, key, recptr, nextptr):
    return (block - nextptr) // (key + recptr)

p = nonleaf_pointers(2048, 8, 8)
k = leaf_keys(2048, 8, 10, 8)
print('non-leaf pointers', p, '| leaf keys', k)
records = 10_000_000
leaves = math.ceil(records / k)
height = 1 + math.ceil(math.log(leaves, p))
print(f'{records:,} records: {leaves:,} leaves, levels including the leaf level: {height}')
```

## 13.5 Traps

| Trap | Correct thinking |
|---|---|
| 3NF requires the left side to be a superkey | Or the right side must be prime |
| Every lossless decomposition preserves dependencies | Independent properties; BCNF may lose dependencies |
| A secondary index can be sparse | It must be dense |
| B+ tree non-leaf nodes have as many keys as pointers | p pointers, p − 1 keys |
| Missing a candidate key | Check every combination containing the always-required attributes |
