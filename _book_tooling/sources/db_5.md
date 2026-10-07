# Chapter 8: Query Processing and Optimisation
%How a query becomes a plan: selection and join algorithms, their I/O costs, and how the optimiser chooses

## 8.1 From SQL to a plan

1. **Parse and check**: build a syntax tree; resolve table and column names using the catalog.
2. **Translate**: turn the tree into a relational-algebra expression (a logical plan).
3. **Optimise**: rewrite the expression with equivalence rules (Chapter 2) and choose a physical algorithm for each operator, using cost estimates.
4. **Execute**: run the physical plan. Operators either **pipeline** tuples to their parent one at a time (no temporary storage) or **materialise** intermediate results to disk.

Cost is measured mainly in **page transfers** (and disk seeks). We use these symbols:

| Symbol | Meaning |
|---|---|
| n<sub>r</sub> | Number of tuples in relation r |
| b<sub>r</sub> | Number of pages (blocks) of r |
| V(A, r) | Number of distinct values of attribute A in r |
| M | Buffer pages available to the operator |
| h | Height of a B+ tree index |

## 8.2 Selection

| Algorithm | Applies when | Cost (page reads) |
|---|---|---|
| Linear scan | Always | b<sub>r</sub> (b<sub>r</sub>/2 on average for equality on a key) |
| Binary search | File sorted on the attribute | ⌈log<sub>2</sub> b<sub>r</sub>⌉ + pages with matches |
| Clustered (primary) B+ tree, equality on key | Index on the sort attribute | h + 1 |
| Clustered B+ tree, range or non-key | Same | h + pages holding the matches |
| Secondary B+ tree | Any indexed attribute | h + **one page read per matching record** (they are scattered) |

The last line is why an index is not always faster. If a query matches many rows, a secondary index fetches them with random page reads, and a sequential full scan becomes cheaper. The calculator finds the crossover.

```python run When does a secondary index stop paying off?
b_r, n_r, h = 10_000, 1_000_000, 3          # 100 tuples per page

def scan_cost():
    return b_r

def secondary_index_cost(matches):
    return h + matches                       # one random page per matching tuple

def clustered_index_cost(matches):
    return h + -(-matches // (n_r // b_r))   # matches are packed in consecutive pages

print(f'{"selectivity":>11} {"matches":>9} {"full scan":>10} {"secondary":>10} '
        f'{"clustered":>10}')
for sel in [0.0001, 0.001, 0.005, 0.01, 0.05, 0.2]:
    m = int(n_r * sel)
    print(f'{sel:>11.2%} {m:>9,} {scan_cost():>10,} {secondary_index_cost(m):>10,} '
          f'{clustered_index_cost(m):>10,}')
cross = next(m for m in range(1, n_r) if secondary_index_cost(m) > scan_cost())
print(f'secondary index loses beyond {cross:,} matching rows ({cross / n_r:.2%} of the '
        f'table)')
```

With 100 tuples per page, the secondary index beats the scan only while the query returns less than about 1% of the rows. Random reads also cost more than sequential ones on real disks, which pushes the crossover even lower. That is why optimisers estimate **selectivity** before choosing an index.

## 8.3 External sorting

Sorting is needed for `ORDER BY`, `DISTINCT`, `GROUP BY`, sort-merge join and building indexes. When the data is larger than memory, the **external merge sort** runs in passes:

1. **Run creation**: read M pages at a time, sort them in memory, write a sorted run: ⌈b<sub>r</sub>/M⌉ runs.
2. **Merge passes**: merge M − 1 runs at a time (one output buffer), until one run remains.

Number of passes = 1 + ⌈log<sub>M−1</sub>(⌈b<sub>r</sub>/M⌉)⌉. Each pass reads and writes every page, so the cost is **2·b<sub>r</sub> per pass** (minus the final write if the result is pipelined).

```python run External merge sort: passes and I/O
import math

def sort_cost(b, m):
    runs = math.ceil(b / m)
    merges = math.ceil(math.log(runs, m - 1)) if runs > 1 else 0
    return runs, 1 + merges, 2 * b * (1 + merges)

for b, m in [(1_000, 11), (1_000_000, 101), (1_000_000, 1001), (10 ** 8, 1001)]:
    runs, passes, io = sort_cost(b, m)
    print(f'{b:>11,} pages, M = {m:>5}: {runs:>9,} initial runs, {passes} passes, '
            f'{io:>13,} I/Os')
```

Even 100 million pages (about 400 GB with 4 KB pages) sort in three passes with 1 000 buffer pages. That is why external sorting is considered "linear" in practice.

## 8.4 Join algorithms

For r ⋈ s with r as the **outer** relation:

| Algorithm | Cost in page transfers | Needs | Best when |
|---|---|---|---|
| Tuple nested loop | b<sub>r</sub> + n<sub>r</sub> · b<sub>s</sub> | Nothing | Never, except tiny tables |
| Block nested loop | b<sub>r</sub> + ⌈b<sub>r</sub>/(M − 2)⌉ · b<sub>s</sub> | M buffer pages | Small outer that fits in memory: then b<sub>r</sub> + b<sub>s</sub> |
| Index nested loop | b<sub>r</sub> + n<sub>r</sub> · c, where c = index lookup cost | Index on s's join attribute | Few outer tuples, selective join |
| Sort-merge | sort(r) + sort(s) + b<sub>r</sub> + b<sub>s</sub> | Equi-join | Inputs already sorted, or output must be sorted |
| Hash join (Grace) | 3(b<sub>r</sub> + b<sub>s</sub>) | Equi-join, M > √b<sub>s</sub> (build side s) | Large unsorted inputs: the usual winner |

The classic textbook numbers: `student` has n = 5 000 tuples in 100 pages; `takes` has n = 10 000 tuples in 400 pages.

```python run Join cost calculator (textbook numbers)
import math
student = dict(n=5_000, b=100)
takes = dict(n=10_000, b=400)

def costs(r, s, m, index_cost=4):
    sort = lambda b: 2 * b * (1 + math.ceil(math.log(math.ceil(b / m), m - 1))) \
        if b > m else 2 * b
    c = {
        'tuple nested loop': r['b'] + r['n'] * s['b'],
        'block nested loop': r['b'] + math.ceil(r['b'] / (m - 2)) * s['b'],
        'index nested loop': r['b'] + r['n'] * index_cost,
        'sort-merge join': sort(r['b']) + sort(s['b']) + r['b'] + s['b'],
    }
    if m * m > min(r['b'], s['b']):          # Grace hash join needs M > sqrt(build side)
        c['hash join'] = 3 * (r['b'] + s['b'])
    return c

for m in (3, 12, 102):
    print(f'M = {m} buffer pages')
    for (rn, r, sn, s) in [('student', student, 'takes', takes), ('takes', takes, 'student',
            student)]:
        c = costs(r, s, m)
        best = min(c, key=c.get)
        print(f'   outer {rn:7}: ' + ', '.join(f'{k.split()[0]} {v:,}' for k,
                v in c.items())
              + f'  -> best: {best}')
```

The output repeats the standard results: tuple nested loop with `student` outer costs 2 000 100 page transfers, with `takes` outer 1 000 400. Block nested loop with only 3 buffer pages is 40 100 (`student` outer). With so little memory, hash join is not even possible (it needs M > √100 = 10 pages to partition the build side), so sort-merge wins. With 12 pages hashing becomes possible and wins at 1 500. With 102 pages the whole of `student` fits in memory, so block nested loop drops to 100 + 400 = 500, cheaper even than hashing. The general rule: **put the smaller relation on the outside** of a nested loop, and **build the hash table on the smaller relation** in a hash join.

### The algorithms themselves

The next program implements three join algorithms on generated data and checks that they produce exactly the same result, counting the tuple comparisons each one makes.

```python run Nested loop, sort-merge and hash join on real data
import random
rng = random.Random(1)
dept = [(d, f'dept{d}') for d in range(200)]
emp = [(e, rng.randrange(200), rng.randrange(30_000, 90_000)) for e in range(4_000)]

def nested_loop(r, s):
    out, cmp = [], 0
    for e in r:
        for d in s:
            cmp += 1
            if e[1] == d[0]:
                out.append((e[0], d[1]))
    return out, cmp

def sort_merge(r, s):
    r, s = sorted(r, key=lambda t: t[1]), sorted(s, key=lambda t: t[0])
    out, cmp, i, j = [], 0, 0, 0
    while i < len(r) and j < len(s):
        cmp += 1
        if r[i][1] < s[j][0]:
            i += 1
        elif r[i][1] > s[j][0]:
            j += 1
        else:
            k = j                        # emit every s tuple with this key
            while k < len(s) and s[k][0] == r[i][1]:
                out.append((r[i][0], s[k][1])); k += 1
            i += 1
    return out, cmp

def hash_join(r, s):
    table = {}
    for d in s:                          # build on the smaller input
        table.setdefault(d[0], []).append(d)
    out, cmp = [], 0
    for e in r:                          # probe with the larger input
        for d in table.get(e[1], []):
            cmp += 1
            out.append((e[0], d[1]))
    return out, cmp

results = {f.__name__: f(emp, dept) for f in (nested_loop, sort_merge, hash_join)}
reference = sorted(results['nested_loop'][0])
for name, (rows, cmp) in results.items():
    print(f'{name:12} rows {len(rows):5}  comparisons {cmp:>9,}  same result: '
            f'{sorted(rows) == reference}')
```

## 8.5 Cost-based optimisation

### Estimating result sizes

The optimiser keeps statistics in the catalog (n<sub>r</sub>, b<sub>r</sub>, V(A, r), histograms) and estimates intermediate sizes under simple assumptions (uniform values, independent attributes):

| Expression | Estimated tuples |
|---|---|
| σ<sub>A=v</sub>(r) | n<sub>r</sub> / V(A, r) |
| σ<sub>A≤v</sub>(r) | n<sub>r</sub> · (v − min(A)) / (max(A) − min(A)) |
| σ<sub>p∧q</sub>(r) | n<sub>r</sub> · sel(p) · sel(q) (independence) |
| r ⋈ s on a key of s (FK join) | n<sub>r</sub> |
| r ⋈ s on A, in general | n<sub>r</sub> · n<sub>s</sub> / max(V(A, r), V(A, s)) |

When the independence assumption is wrong (for example `city = 'Kolkata' AND state = 'West Bengal'`, which are strongly correlated), estimates can be off by orders of magnitude, and the optimiser picks a bad plan. Multi-column statistics exist for exactly this reason.

### Choosing a join order

The number of possible join orders explodes. For n relations there are (2(n − 1))! / (n − 1)! ordered join trees, so trying them all is impossible beyond a handful. The System R optimiser uses **dynamic programming**: find the best plan for every subset of relations, building larger subsets from smaller ones, usually only considering **left-deep** trees (the right input of each join is a base table, which suits pipelining and index nested-loop joins).

```python run How fast the search space grows
import math
print(f'{"n":>3} {"all join trees":>22} {"left-deep orders (n!)":>22} '
        f'{"DP subsets (2^n)":>18}')
for n in [2, 3, 4, 5, 6, 8, 10, 12]:
    trees = math.factorial(2 * (n - 1)) // math.factorial(n - 1)
    print(f'{n:>3} {trees:>22,} {math.factorial(n):>22,} {2 ** n:>18,}')
```

Ten relations already have over 17 billion join trees; dynamic programming over subsets needs to examine only 1 024 subsets (each with a modest amount of work). PostgreSQL switches from exhaustive DP to a genetic search (GEQO) above 12 relations for the same reason.

### Heuristic rules every optimiser applies

1. Push selections as far down the tree as possible (filter early).
2. Push projections down (narrow tuples early).
3. Apply the most selective selections and joins first.
4. Avoid Cartesian products: join only relations connected by a predicate.
5. Replace σ over × with a join.

## 8.6 Reading query plans

`EXPLAIN QUERY PLAN` in SQLite (and `EXPLAIN` in MySQL, `EXPLAIN ANALYZE` in PostgreSQL) shows the optimiser's choice. The program builds a table with 20 000 rows and shows how plans change with indexes, covering indexes, and predicates that prevent index use.

```python run Watching SQLite's optimiser decide
import sqlite3, random
rng = random.Random(3)
db = sqlite3.connect(':memory:')
db.executescript('''
CREATE TABLE dept (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE emp (id INTEGER PRIMARY KEY, name TEXT, dept_id INT, salary INT, city TEXT);
''')
db.executemany('INSERT INTO dept VALUES (?, ?)', [(i, f'd{i}') for i in range(50)])
db.executemany('INSERT INTO emp VALUES (?, ?, ?, ?, ?)',
               [(i, f'e{i}', rng.randrange(50), rng.randrange(30_000, 90_000),
                 rng.choice(['Kolkata', 'Pune', 'Delhi'])) for i in range(20_000)])

def plan(q):
    return ' | '.join(r[3] for r in db.execute('EXPLAIN QUERY PLAN ' + q))

queries = {
    'equality, no index': 'SELECT * FROM emp WHERE salary = 50000',
    'join, no index': 'SELECT e.name FROM emp e JOIN dept d ON e.dept_id = d.id WHERE '
            'd.name = \'d7\'',
}
for k, q in queries.items():
    print(f'{k:28} {plan(q)}')
db.execute('CREATE INDEX idx_salary ON emp(salary)')
db.execute('CREATE INDEX idx_dept_salary ON emp(dept_id, salary)')
db.execute('ANALYZE')
more = {
    'equality, with index': 'SELECT * FROM emp WHERE salary = 50000',
    'covering index': 'SELECT dept_id, salary FROM emp WHERE dept_id = 7',
    'leftmost prefix missing': 'SELECT name FROM emp WHERE city = \'Pune\' AND salary > '
            '89000',
    'function on column': 'SELECT name FROM emp WHERE salary + 0 = 50000',
    'join, with index': 'SELECT e.name FROM emp e JOIN dept d ON e.dept_id = d.id WHERE '
            'd.name = \'d7\'',
    'ORDER BY uses index order': 'SELECT salary FROM emp ORDER BY salary LIMIT 5',
}
for k, q in more.items():
    print(f'{k:28} {plan(q)}')
```

Each line is worth reading slowly:

- Without an index the equality filter is a full `SCAN`; with one it is a `SEARCH ... USING INDEX`.
- `USING COVERING INDEX` means the answer came from the index alone; the table was never touched.
- No index starts with `city`, and the `(dept_id, salary)` index is unusable because `dept_id` is not constrained (the leftmost-prefix rule). The optimiser falls back to `idx_salary` for the selective range `salary > 89000` and checks `city` on each row it fetches.
- `salary + 0 = 50000` defeats the index: the optimiser cannot search an index on `salary` for an expression. The same happens with `WHERE YEAR(hire_date) = 2024` in MySQL. Rewrite such conditions as ranges on the bare column.
- For the join, the optimiser scans the small `dept` table and searches `emp` through the `(dept_id, salary)` index for each matching department: an index nested-loop join, exactly the cheapest strategy for a selective outer.
- Reading the index in order lets `ORDER BY ... LIMIT 5` stop after five entries without sorting.

## 8.7 Practical lessons

- Know the cost formulas for selection and the five join algorithms; put the smaller relation outside a nested loop and use it as the hash-join build side.
- A secondary index helps only for selective predicates (roughly under 1–5% of rows).
- External sort takes 2·b·passes I/Os; with realistic memory it is 2 or 3 passes.
- Cost-based optimisation needs good statistics: run `ANALYZE` (`ANALYZE TABLE` in MySQL) after large data changes.
- Read `EXPLAIN` output: scan versus search, covering index, temporary sort, join order.
