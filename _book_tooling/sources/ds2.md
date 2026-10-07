## Part 5 solutions

### D5.1 Recover from a log

```python run Undo/redo with a checkpoint
LOG = [('start', 'T1'), ('update', 'T1', 'A', 100, 150), ('start', 'T2'),
       ('update', 'T2', 'B', 200, 250), ('commit', 'T1'), ('checkpoint', ['T2']),
       ('start', 'T3'), ('update', 'T3', 'C', 300, 350), ('update', 'T2', 'D', 400, 450),
       ('commit', 'T3')]
db = {'A': 150, 'B': 250, 'C': 300, 'D': 450}       # one possible disk state at the crash

cp = max(i for i, r in enumerate(LOG) if r[0] == 'checkpoint')
relevant = set(LOG[cp][1]) | {r[1] for r in LOG[cp:] if r[0] == 'start'}
committed = {r[1] for r in LOG if r[0] == 'commit'}
redo, undo = sorted(relevant & committed), sorted(relevant - committed)
for _, t, x, old, new in [r for r in LOG[cp:] if r[0] == 'update' and r[1] in redo]:
    db[x] = new
for _, t, x, old, new in reversed([r for r in LOG if r[0] == 'update' and r[1] in undo]):
    db[x] = old
print('ignored (committed before checkpoint):', sorted(committed - relevant))
print('redo:', redo, '| undo:', undo)
print('final:', db)
```

T1 committed before the checkpoint, so its update of A is already on disk and needs nothing. T3 started after the checkpoint and committed: **redo** C = 350. T2 was active at the checkpoint and never committed: **undo** both of its updates, including B = 250 from **before** the checkpoint (undo must scan back past the checkpoint to the start of every loser). Final: A = 150, B = 200, C = 350, D = 400.

> TRAP: The checkpoint limits **redo**, not **undo**. A transaction in the checkpoint's active list may have updates from before the checkpoint, and they must still be undone.

### D5.2 Buffer policies

| | Force | No-force |
|---|---|---|
| No-steal | Neither: uncommitted data never reaches disk, committed data is always there | Redo only: committed data may be missing from disk |
| Steal | Undo only: uncommitted data may be on disk | Undo and redo |

No-steal needs enough memory to hold every page a running transaction has dirtied, which fails for large transactions. Force makes every commit wait for random writes of all its data pages. Steal + no-force lets the buffer manager evict freely and makes commit cost one sequential log flush, so it is the fastest at run time and is what real systems use, at the price of a recovery algorithm that does both undo and redo.

### D5.3 ARIES analysis pass

```python run Rebuilding TT and DPT
tt, dpt = {'T1': 40}, {'P1': 20, 'P2': 40}            # from the checkpoint at LSN 50
records = [(60, 'T2', 'update', 'P3'), (70, 'T1', 'commit', None), (80, 'T1', 'end', None),
           (90, 'T2', 'update', 'P1'), (100, 'T3', 'update', 'P4')]
committed = set()
for lsn, t, kind, page in records:
    if kind == 'end':
        tt.pop(t); continue
    tt[t] = lsn
    if kind == 'commit':
        committed.add(t)
    if kind == 'update':
        dpt.setdefault(page, lsn)
print('TT     :', tt)
print('DPT    :', dpt)
print('losers :', sorted(t for t in tt if t not in committed))
print('redo from LSN', min(dpt.values()))
```

T1 committed and wrote its end record, so it leaves the TT. T2 and T3 have no commit: they are the losers. P1 was already in the DPT with recLSN 20, so LSN 90 does not change its recLSN. Redo starts at the smallest recLSN, **20**, which is **before** the checkpoint: a fuzzy checkpoint does not flush pages, so older changes may still be missing from disk.

### D5.4 Why these rules?

(a) If a transaction changed A from 1 to 2 and then to 3, undoing forwards restores 1 and then 2, ending at the wrong value; backwards restores 2 and then 1. (b) The page would hold an uncommitted change with no undo information on disk: if the transaction then aborts or the system crashes, the change can never be removed. (c) The user is told "committed", but after a crash there is no record to redo the change from: durability is broken.

## Part 6 solutions

### D6.1 B+ tree order

Internal: 6p + 10(p − 1) ≤ 512 ⇒ 16p ≤ 522 ⇒ **p = 32**. Leaf: 18n + 6 ≤ 512 ⇒ 18n ≤ 506 ⇒ **n = 28**.

```python run Order calculations
block, key, ptr, rec_ptr = 512, 10, 6, 8
p = (block + key) // (key + ptr)
n = (block - ptr) // (key + rec_ptr)
print('p =', p, '| check:', p * ptr + (p - 1) * key, '<= 512 <', (p + 1) * ptr + p * key)
print('n =', n, '| check:', n * (key + rec_ptr) + ptr, '<= 512 <', (n + 1) * (key + rec_ptr)
        + ptr)
```

### D6.2 Capacity bounds

```python run Maximum and minimum records for height 3
import math
p, n, h = 32, 28, 3
max_records = p ** (h - 1) * n
min_records = 2 * math.ceil(p / 2) ** (h - 2) * math.ceil(n / 2)
print('maximum:', max_records, '| minimum:', min_records)
```

Maximum: a full root with 32 children, each internal node with 32 children, each leaf with 28 entries: 32 × 32 × 28 = **28 672**. Minimum: the root needs only 2 children, other internal nodes at least ⌈32/2⌉ = 16, leaves at least ⌈28/2⌉ = 14 entries: 2 × 16 × 14 = **448**.

### D6.3 Build a tree

```python run Inserting twelve keys with bplus.py
from bplus import BPlusTree
t = BPlusTree(order=4)
for k in [1, 4, 7, 10, 17, 21, 31, 25, 19, 20, 28, 42]:
    t.insert(k)
print('height', t.height())
print(t.show())
```

Check your drawing against the output, level by level. Every leaf holds at most three keys, every separator in a parent equals the smallest key of the subtree to its right, and all leaves are at the same depth.

### D6.4 Extendible hashing

```python run Extendible hashing, capacity 2
class Extendible:
    def __init__(self, cap):
        self.cap, self.gd = cap, 1
        self.dir = [{'ld': 1, 'keys': []}, {'ld': 1, 'keys': []}]
    def idx(self, k):
        return k & ((1 << self.gd) - 1)
    def insert(self, k):
        b = self.dir[self.idx(k)]
        if len(b['keys']) < self.cap:
            b['keys'].append(k); return
        if b['ld'] == self.gd:
            self.dir += self.dir; self.gd += 1
        b['ld'] += 1
        new, bit = {'ld': b['ld'], 'keys': []}, 1 << (b['ld'] - 1)
        for i, ptr in enumerate(self.dir):
            if ptr is b and i & bit:
                self.dir[i] = new
        old, b['keys'] = b['keys'], []
        for x in old:
            self.dir[self.idx(x)]['keys'].append(x)
        self.insert(k)

h = Extendible(2)
for k in [16, 4, 6, 22, 24, 10, 31, 7]:
    h.insert(k)
groups = {}
for i, b in enumerate(h.dir):
    groups.setdefault(id(b), (b, []))[1].append(f'{i:0{h.gd}b}')
print('global depth', h.gd)
for b, ix in groups.values():
    print(f'   entries {",".join(ix):24} local depth {b["ld"]}: {sorted(b["keys"])}')
```

16, 4 and 24 all end in 000 in binary, so a bucket of capacity 2 can only separate them by looking at more bits; that is what drives the global depth up. Keys that agree on their last *local depth* bits share a bucket.

### D6.5 File organisation costs

(a) Heap: on average half the file, **5 000** page reads (10 000 if the key might be absent). (b) Sorted, binary search: ⌈log<sub>2</sub> 10 000⌉ = **14**. (c) B+ tree: 3 index pages plus 1 data page = **4** (and in practice the top two index levels are cached, so about 2).

### D6.6 Buffer replacement

```python run FIFO, LRU and Clock with 3 frames
from collections import OrderedDict, deque
ref = [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]

def fifo(frames):
    pool, q, hits = set(), deque(), 0
    for p in ref:
        if p in pool:
            hits += 1; continue
        if len(pool) == frames:
            pool.discard(q.popleft())
        pool.add(p); q.append(p)
    return hits

def lru(frames):
    pool, hits = OrderedDict(), 0
    for p in ref:
        if p in pool:
            hits += 1; pool.move_to_end(p); continue
        if len(pool) == frames:
            pool.popitem(last=False)
        pool[p] = 1
    return hits

def clock(frames):
    slots, bits, hand, hits = [None] * frames, [0] * frames, 0, 0
    for p in ref:
        if p in slots:
            hits += 1; bits[slots.index(p)] = 1; continue
        while bits[hand]:
            bits[hand] = 0; hand = (hand + 1) % frames
        slots[hand], bits[hand] = p, 1
        hand = (hand + 1) % frames
    return hits

for name, f in [('FIFO', fifo), ('LRU', lru), ('Clock', clock)]:
    print(f'{name:5} hits {f(3)}  misses {len(ref) - f(3)}')
print('FIFO with 4 frames: hits', fifo(4), '(Belady: more frames, fewer hits)')
```

This is the reference string from Belady's anomaly. With 3 frames FIFO happens to beat LRU here, and with 4 frames FIFO gets **fewer** hits than with 3. LRU never suffers from Belady's anomaly (it is a *stack algorithm*), which is one reason it is the usual baseline.

### D6.7 Pick the index

(a) A unique **B+ tree** (or hash) index on email: one equality lookup among millions. (b) A **clustered** B+ tree on created_at (or an index whose order matches the scan): rows come back in date order from consecutive pages. (c) **Bitmap** indexes on status and region, combined with a bitwise AND: low-cardinality columns in read-only analytics. (d) A **covering** composite index on (city, name): the query never touches the table.

## Part 7 solutions

### D7.1 Join costs

```python run Cost calculator for D7.1
import math
r, s, M = dict(n=10_000, b=1_000), dict(n=5_000, b=500), 52
tnl = lambda o, i: o['b'] + o['n'] * i['b']
bnl = lambda o, i: o['b'] + math.ceil(o['b'] / (M - 2)) * i['b']
print('tuple NL, r outer:', f'{tnl(r, s):,}', '| s outer:', f'{tnl(s, r):,}')
print('block NL, r outer:', f'{bnl(r, s):,}', '| s outer:', f'{bnl(s, r):,}')
print('hash join        :', f'{3 * (r["b"] + s["b"]):,}',
      f'(needs M > sqrt(500) = {math.sqrt(500):.1f}: {M > math.sqrt(500)})')
```

Block nested loop with s outer: 500 + ⌈500/50⌉ × 1 000 = 10 500. The hash join, at 3 × 1 500 = **4 500**, wins: M = 52 is comfortably larger than √500 ≈ 22, so the build side can be partitioned in one pass.

### D7.2 External sort

```python run Sort passes
import math
for m in (5, 101):
    runs = math.ceil(10_000 / m)
    passes = 1 + math.ceil(math.log(runs, m - 1))
    print(f'M = {m:3}: {runs:5} runs, {passes} passes, {2 * 10_000 * passes:,} I/Os')
```

With M = 5, run creation makes 2 000 runs, and each merge pass combines only 4 of them: ⌈log<sub>4</sub> 2 000⌉ = 6 merge passes, 7 in total. With M = 101, there are 100 runs, merged in a single 100-way pass: 2 passes, 40 000 I/Os. Memory matters enormously for sorting.

### D7.3 Size estimates

(a) 10 000 / 50 = **200**. (b) 10 000 × (45 000 − 30 000) / (90 000 − 30 000) = **2 500**. (c) Assuming independence: 10 000 × (1/50) × (1/4) = **50**. (d) dept_id is a key of dept and a foreign key in emp, so every emp tuple joins exactly one dept tuple: **10 000** (the general formula gives 10 000 × 50 / max(50, 50) = 10 000 too).

### D7.4 Rewrite the tree

```text
Naive                                   Optimised
π e.name                                π e.name
  σ e.dept_id=d.id ∧ d.city='Pune'        ⋈ e.dept_id = d.id
    ∧ e.salary>80000                       /                 \
      ×                              π e.name,e.dept_id    π d.id
     / \                               σ e.salary>80000      σ d.city='Pune'
  emp   dept                             emp                   dept
```

Three rules were applied: the conjunction was split (cascade of σ), each single-table condition was pushed down to its table, the remaining join condition turned σ over × into a join, and projections were pushed down so that only `name`, `dept_id` and `id` flow upwards.

### D7.5 Predict the plan

```python run Checking predictions with EXPLAIN QUERY PLAN
import sqlite3
db = sqlite3.connect(':memory:')
db.execute('CREATE TABLE t (id INTEGER PRIMARY KEY, a INT, b INT, c INT)')
db.executemany('INSERT INTO t (a, b, c) VALUES (?, ?, ?)',
               [(i % 1000, i % 100, i % 37) for i in range(20_000)])
db.execute('CREATE INDEX ia ON t(a)')
db.execute('CREATE INDEX ibc ON t(b, c)')
db.execute('ANALYZE')
for label, q in [('(a)', 'SELECT * FROM t WHERE a = 5'), ('(b)',
        'SELECT * FROM t WHERE c = 5'),
                 ('(c)', 'SELECT c FROM t WHERE b = 3'), ('(d)',
                         'SELECT * FROM t WHERE a + 1 = 6')]:
    plan = ' | '.join(r[3] for r in db.execute('EXPLAIN QUERY PLAN ' + q))
    print(label, q.ljust(36), '->', plan)
```

(a) Index search on `ia`, as expected. (b) The surprise. The usual prediction is a full scan, because `c` is the second column of `(b, c)` and the leftmost-prefix rule forbids a normal index search. But after `ANALYZE`, SQLite knows that `b` has only 100 distinct values, so it uses a **skip-scan**: for each distinct `b` it searches the index for `c = 5`, shown as `ANY(b) AND c=?`. With few distinct leading values, 100 small index probes beat reading 20 000 rows. MySQL 8 has the same optimisation ("skip scan range access"); with a high-cardinality leading column, both fall back to a scan. (c) A covering index search on `(b, c)`. (d) The expression `a + 1` prevents the index on `a`: full scan.

> TIP: The leftmost-prefix rule is still the right default answer in interviews, but mention skip-scan as the exception: it shows you know the optimiser works from statistics, not fixed rules.

## Part 8 solutions

### D8.1 Quorum choices

```python run Quorum pairs for N = 5
N = 5
pairs = [(w, r) for w in range(1, N + 1) for r in range(1, N + 1) if w + r > N]
minimal = [(w, r) for w, r in pairs if w + r == N + 1]
print('minimal pairs (W + R = 6):', minimal)
best = max(minimal, key=lambda p: min(N - p[0], N - p[1]))
print('most tolerant for both:', best, '-> survives', min(N - best[0], N - best[1]),
        'failures')
```

Any pair with W + R ≥ 6 overlaps; the minimal ones are (1, 5), (2, 4), (3, 3), (4, 2), (5, 1). Writes need W live replicas and reads need R, so a pair tolerates 5 − W failed replicas for writes and 5 − R for reads. **(3, 3)** tolerates 2 failures for both, which is why majority quorums are the common default.

### D8.2 CAP choices

(a) **Consistency**: showing a wrong balance or allowing a double spend is worse than refusing a request. (b) **Availability**: accept additions on both sides and merge carts later (Amazon's original Dynamo use case). (c) **Consistency** for the final seat assignment, so the same seat is never sold twice; browsing can stay available with possibly stale seat maps. (d) **Availability**: a like count that is briefly off by a few is harmless. (e) **Consistency**: two leaders would be catastrophic; this is why Zookeeper and etcd refuse to operate on the minority side of a partition.

### D8.3 Rebalancing cost

```python run 10 -> 11 nodes
import hashlib, bisect
h = lambda s: int(hashlib.md5(s.encode()).hexdigest(), 16)
keys = [f'k{i}' for i in range(20_000)]

def ring(n, v=200):
    pts = sorted((h(f'node{i}#{j}'), i) for i in range(n) for j in range(v))
    hs = [p for p, _ in pts]
    return {k: pts[bisect.bisect(hs, h(k)) % len(pts)][1] for k in keys}

mod_moved = sum(h(k) % 10 != h(k) % 11 for k in keys) / len(keys)
a, b = ring(10), ring(11)
ring_moved = sum(a[k] != b[k] for k in keys) / len(keys)
print(f'hash mod N : {mod_moved:.1%} of keys move')
print(f'ring       : {ring_moved:.1%} of keys move (ideal 1/11 = {1 / 11:.1%})')
```

With `mod N`, a key keeps its node only if h mod 10 = h mod 11, which happens for roughly 1 key in 11, so about 91% move. Consistent hashing moves only the keys that the new node takes over, close to the ideal 1/11 ≈ 9.1%.
