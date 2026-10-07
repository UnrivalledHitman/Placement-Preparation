# Chapter 4: Transactions and Schedules
%ACID, transaction states, and how to decide whether an interleaving of transactions is safe

## 4.1 ACID, and what implements each property

A **transaction** is a unit of work that the database treats as indivisible: a funds transfer, an order placement, a seat booking. It begins, performs reads and writes, and ends with **commit** (make it permanent) or **abort** (undo everything).

| Property | Guarantee | Implemented by | Chapter |
|---|---|---|---|
| Atomicity | All of the transaction's effects happen, or none do | Undo logging, rollback | 6 |
| Consistency | A transaction moves the database from one valid state to another | Constraints + correct application logic | 2–3 |
| Isolation | Concurrent transactions behave as if run one at a time (to a chosen degree) | Locking, timestamps or MVCC | 5 |
| Durability | Once committed, effects survive crashes | Write-ahead log flushed at commit, redo | 6 |

> TRAP: Consistency is the one property the DBMS cannot guarantee alone. If the application debits one account and forgets to credit the other, the database will commit that faithfully. The engine enforces declared constraints; the rest is the application's job.

## 4.2 Transaction states

```text
                 last statement           log records flushed
   +--------+    executed      +----------------+    to disk     +-----------+
-->| Active |----------------->|   Partially    |--------------->| Committed |
   +--------+                  |   committed    |                +-----------+
       |                       +----------------+
       | error, or abort            | failure while committing
       v                            v
   +--------+    rollback done   +---------+
   | Failed |------------------->| Aborted |---> restart the transaction, or kill it
   +--------+                    +---------+
```

A transaction is **partially committed** after its last operation but before its commit record is safely on disk. Only when the log is flushed does it become **committed**; a crash before that point means the transaction never happened.

## 4.3 Schedules

A **schedule** is the order in which the operations of concurrent transactions are executed. We write R<sub>1</sub>(A) for "transaction 1 reads A", W<sub>2</sub>(B) for "transaction 2 writes B", and C<sub>1</sub> / A<sub>1</sub> for commit and abort. In the programs, the same schedule is the string `R1(A) W2(B) C1`.

| Schedule type | Definition | Correct? |
|---|---|---|
| Serial | Transactions run one after another, no interleaving | Always (each transaction is correct alone) |
| Concurrent (interleaved) | Operations of different transactions mix | Only if equivalent to some serial schedule |
| Serialisable | Same effect as **some** serial schedule | Yes: this is the goal |

Why interleave at all? While one transaction waits for a disk read, another can use the CPU. Interleaving gives higher throughput and shorter waits for short transactions stuck behind long ones.

## 4.4 Conflict serialisability

Two operations **conflict** if they belong to different transactions, touch the same data item, and at least one is a write. Swapping two adjacent non-conflicting operations never changes the result. A schedule is **conflict serialisable** if such swaps can turn it into a serial schedule.

| Pair | Conflict? | Why |
|---|---|---|
| R<sub>i</sub>(X), R<sub>j</sub>(X) | No | Both read the same value either way |
| R<sub>i</sub>(X), W<sub>j</sub>(X) | Yes (read–write) | The read sees a different value if swapped |
| W<sub>i</sub>(X), R<sub>j</sub>(X) | Yes (write–read) | Same reason |
| W<sub>i</sub>(X), W<sub>j</sub>(X) | Yes (write–write) | The final value changes |
| Any two ops on different items | No | Independent |

The test is the **precedence graph**: one node per transaction, and an edge T<sub>i</sub> → T<sub>j</sub> whenever an operation of T<sub>i</sub> conflicts with a *later* operation of T<sub>j</sub>. The schedule is conflict serialisable **if and only if the graph has no cycle**; any topological order of the graph is an equivalent serial order.

The program saves a small schedule toolkit as `sched.py` (as `fd.py` did in Chapter 3) and tests four schedules.

```python run sched.py: precedence graphs and serial orders
import re, sys, shutil
from itertools import permutations

OP = re.compile(r'([RWCA])(\d+)(?:\((\w+)\))?')


def parse(s):
    return [(k, int(t), x) for k, t, x in OP.findall(s)]


def txns(ops):
    return sorted({t for _, t, _ in ops})


def precedence(ops):
    edges = set()
    for i, (k1, t1, x1) in enumerate(ops):
        for k2, t2, x2 in ops[i + 1:]:
            if x1 and x1 == x2 and t1 != t2 and 'W' in (k1, k2):
                edges.add((t1, t2))
    return edges


def serial_orders(ops):
    edges = precedence(ops)
    return [p for p in permutations(txns(ops))
            if all(p.index(a) < p.index(b) for a, b in edges)]


def conflict_serialisable(ops):
    return bool(serial_orders(ops))


if __name__ == '__main__':
    shutil.copy(sys.argv[0], 'sched.py')
    examples = {
        'lost update': 'R1(A) R2(A) W1(A) W2(A)',
        'interleaved transfer': 'R1(A) W1(A) R2(A) W2(A) R1(B) W1(B) R2(B) W2(B)',
        'three transactions': 'R2(A) R1(B) W2(A) R3(A) W1(B) W3(A) R2(B) W2(B)',
        'reads only': 'R1(A) R2(A) R3(A) R1(B)',
    }
    for name, s in examples.items():
        ops = parse(s)
        edges = sorted(precedence(ops))
        orders = serial_orders(ops)
        print(f'{name:22} edges {edges}')
        print(f'{"":22} serialisable: {bool(orders)}, serial orders: {orders}')
```

The lost-update schedule has both T<sub>1</sub> → T<sub>2</sub> (R<sub>1</sub>(A) before W<sub>2</sub>(A)) and T<sub>2</sub> → T<sub>1</sub> (R<sub>2</sub>(A) before W<sub>1</sub>(A)), a cycle, so no serial order exists. In the three-transaction schedule, T<sub>1</sub> must precede T<sub>2</sub> (W<sub>1</sub>(B) before R<sub>2</sub>(B)) and T<sub>2</sub> must precede T<sub>3</sub>, so T<sub>1</sub>, T<sub>2</sub>, T<sub>3</sub> is the only equivalent serial schedule. A schedule of reads only has no edges at all, so every order works.

## 4.5 View serialisability

**View equivalence** is a weaker requirement. Schedules S and S′ are view equivalent if:

1. Each transaction reads the **initial** value of an item in S exactly when it does in S′.
2. Each read **reads from** the same writer in both.
3. The **final write** of each item is by the same transaction in both.

A schedule is **view serialisable** if it is view equivalent to some serial schedule. Every conflict-serialisable schedule is view serialisable. The extra schedules that are view serialisable but not conflict serialisable always contain **blind writes**: writes of an item the transaction never read. Testing view serialisability is NP-complete, so real systems never use it; it matters for exams.

```python run View serialisability by brute force
from sched import parse, txns, conflict_serialisable
from itertools import permutations


def view(ops):
    last, reads, seen = {}, set(), {}
    for kind, t, x in ops:
        if kind == 'R':
            n = seen[(t, x)] = seen.get((t, x), 0) + 1
            reads.add((t, x, n, last.get(x)))          # who it read from (None = initial)
        elif kind == 'W':
            last[x] = t
    return reads, last                                  # reads-from set, final writers


def view_serialisable(ops):
    target = view(ops)
    for order in permutations(txns(ops)):
        serial = [op for t in order for op in ops if op[1] == t]
        if view(serial) == target:
            return order
    return None


for s in ['R1(A) W2(A) W1(A) W3(A)', 'R1(A) R2(A) W1(A) W2(A)', 'R1(A) W1(A) R2(A) W2(A)']:
    ops = parse(s)
    print(f'{s:26} conflict-ser {str(conflict_serialisable(ops)):5} '
          f'view-ser {view_serialisable(ops)}')
```

The first schedule is the textbook case. Its precedence graph has the cycle T<sub>1</sub> → T<sub>2</sub> → T<sub>1</sub>, but T<sub>3</sub>'s blind write overwrites A at the end, so the writes of T<sub>1</sub> and T<sub>2</sub> never matter: it is view equivalent to T<sub>1</sub>, T<sub>2</sub>, T<sub>3</sub>.

> TIP: Quick exam shortcut: if a schedule is not conflict serialisable and has **no blind writes**, it is not view serialisable either.

## 4.6 Recoverable, cascadeless and strict schedules

Serialisability assumes every transaction commits. Aborts add a second question: can we undo a transaction safely?

| Class | Rule | Problem it prevents |
|---|---|---|
| Recoverable | If T<sub>j</sub> reads a value written by T<sub>i</sub>, then T<sub>i</sub> commits before T<sub>j</sub> commits | A committed transaction that read data from one that later aborts (cannot be undone) |
| Cascadeless (avoids cascading aborts) | Transactions read only **committed** values | One abort forcing many others to abort |
| Strict | No transaction reads **or overwrites** an item written by an uncommitted transaction | Undo by restoring before-images becomes simple and correct |

Strict ⊂ cascadeless ⊂ recoverable. Strict two-phase locking (Chapter 5) produces strict schedules, which is why nearly every real system uses it.

```python run Classifying schedules by recoverability
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
                if uncommitted:
                    cascadeless = False
                if t in commit_at and commit_at.get(w, 10 ** 9) > commit_at[t]:
                    recoverable = False
            if uncommitted:
                strict = False
        if kind == 'W':
            last_writer[x] = t
    if not recoverable:
        return 'not recoverable'
    if not cascadeless:
        return 'recoverable only'
    return 'strict' if strict else 'cascadeless, not strict'


for s in ['R1(A) W1(A) R2(A) W2(A) C2 C1',
          'R1(A) W1(A) R2(A) C1 W2(A) C2',
          'R1(A) W1(A) W2(A) C1 C2',
          'R1(A) W1(A) C1 R2(A) W2(A) C2']:
    print(f'{s:32} -> {classify(s)}')
```

In the first schedule T<sub>2</sub> reads A from T<sub>1</sub> and commits first. If T<sub>1</sub> then aborts, T<sub>2</sub> has committed a value that never existed: unrecoverable. The third schedule has no dirty reads, but T<sub>2</sub> overwrites A while T<sub>1</sub> is uncommitted; if T<sub>1</sub> aborts, restoring its before-image would wipe out T<sub>2</sub>'s write, so it is not strict.

## 4.7 Practical lessons

- Conflicts need different transactions, the same item, and at least one write.
- Conflict serialisable ⇔ acyclic precedence graph; serial orders are its topological orders.
- View serialisable but not conflict serialisable ⇒ blind writes present.
- Recoverable: commit order follows reads-from. Cascadeless: read only committed data. Strict: also do not overwrite uncommitted data.

# Chapter 5: Concurrency Control
%Anomalies, locking, deadlocks, timestamps, MVCC and the isolation levels real databases offer

## 5.1 The anomalies

Each isolation level is defined by which of these it allows:

| Anomaly | What happens | Example |
|---|---|---|
| Dirty read | T<sub>2</sub> reads a value that T<sub>1</sub> wrote but has not committed; T<sub>1</sub> then aborts | Reading a balance from a transfer that is rolled back |
| Lost update | Two transactions read, modify and write the same item; one write is overwritten | Two clerks updating one balance (Chapter 1) |
| Non-repeatable read | T<sub>1</sub> reads a row twice and gets different values because T<sub>2</sub> committed in between | A report sees a price change mid-run |
| Phantom | T<sub>1</sub> runs the same `WHERE` query twice and gets a different **set** of rows because T<sub>2</sub> inserted or deleted | Count of seats changes between check and booking |
| Write skew | Two transactions read overlapping data, write **different** rows, and together break an invariant | Two doctors both go off call, leaving none |

SQLite can show the first three for real. It normally prevents dirty reads, but in shared-cache mode `PRAGMA read_uncommitted = 1` allows them, which makes a good demonstration. In WAL mode a reader inside a transaction works on a **snapshot**, while a reader in autocommit mode sees each newly committed version.

```python run Real anomalies with two SQLite connections
import sqlite3, os, tempfile

# 1. Dirty read (shared cache + read_uncommitted)
uri = 'file:demo?mode=memory&cache=shared'
t1 = sqlite3.connect(uri, uri=True, isolation_level=None)
t2 = sqlite3.connect(uri, uri=True, isolation_level=None)
t1.execute('CREATE TABLE acct (id INT PRIMARY KEY, bal INT)')
t1.execute('INSERT INTO acct VALUES (1, 100)')
t2.execute('PRAGMA read_uncommitted = 1')
t1.execute('BEGIN'); t1.execute('UPDATE acct SET bal = 999 WHERE id = 1')
print('dirty read        : T2 sees', t2.execute('SELECT bal FROM acct').fetchone()[0])
t1.execute('ROLLBACK')
print('                    after T1 rolls back, the real value is',
      t2.execute('SELECT bal FROM acct').fetchone()[0])

# 2. Lost update: application-level read-modify-write
path = os.path.join(tempfile.mkdtemp(), 'bank.db')
a = sqlite3.connect(path, isolation_level=None, timeout=0.2)
b = sqlite3.connect(path, isolation_level=None, timeout=0.2)
a.execute('PRAGMA journal_mode = WAL')
a.execute('CREATE TABLE acct (id INT PRIMARY KEY, bal INT)')
a.execute('INSERT INTO acct VALUES (1, 100)')
va = a.execute('SELECT bal FROM acct').fetchone()[0]       # both read 100
vb = b.execute('SELECT bal FROM acct').fetchone()[0]
a.execute('UPDATE acct SET bal = ?', (va + 50,))
b.execute('UPDATE acct SET bal = ?', (vb - 30,))
print('lost update       : balance', a.execute('SELECT bal FROM acct').fetchone()[0],
      '(expected 120)')

# 3. Non-repeatable read in autocommit, repeatable inside a transaction (snapshot)
a.execute('UPDATE acct SET bal = 100')
r1 = b.execute('SELECT bal FROM acct').fetchone()[0]
a.execute('UPDATE acct SET bal = 200')
r2 = b.execute('SELECT bal FROM acct').fetchone()[0]
print('autocommit reads  :', r1, r2, '(non-repeatable)')
b.execute('BEGIN')
r1 = b.execute('SELECT bal FROM acct').fetchone()[0]
a.execute('UPDATE acct SET bal = 300')
r2 = b.execute('SELECT bal FROM acct').fetchone()[0]
b.execute('COMMIT')
print('inside BEGIN      :', r1, r2, '(snapshot: repeatable)')

# 4. The fix for lost updates: take the write lock before reading
a.execute('BEGIN IMMEDIATE')
try:
    b.execute('BEGIN IMMEDIATE')
except sqlite3.OperationalError as e:
    print('second writer     :', e, '-> must wait and re-read')
a.execute('UPDATE acct SET bal = bal + 50'); a.execute('COMMIT')
print('final balance     :', b.execute('SELECT bal FROM acct').fetchone()[0])
```

> NOTE: SQLite allows only one writer at a time for the whole database, which makes it simple but limits write concurrency. Server databases lock individual rows. The protocols below are what they use.

## 5.2 Lock-based protocols

A transaction must hold a lock before accessing an item:

| Requested \ Held | None | Shared (S) | Exclusive (X) |
|---|---|---|---|
| Shared (S), for reading | Grant | Grant | Wait |
| Exclusive (X), for writing | Grant | Wait | Wait |

Locking alone does not guarantee serialisability: releasing a lock too early lets another transaction slip in between. **Two-phase locking (2PL)** fixes this:

| Protocol | Rule | Guarantees | Problem |
|---|---|---|---|
| Basic 2PL | A growing phase (acquire only), then a shrinking phase (release only). The **lock point** is the moment the last lock is acquired | Conflict serialisability; serial order = order of lock points | Cascading aborts; deadlocks |
| Strict 2PL | Basic 2PL + hold all **X** locks until commit/abort | Strict schedules (no cascading aborts) | Deadlocks |
| Rigorous 2PL | Hold **all** locks until commit/abort | Strict; serial order = commit order | Deadlocks; lower concurrency |
| Conservative (static) 2PL | Acquire every lock before starting | No deadlocks | Must know the read/write sets in advance |

### A strict 2PL simulator with deadlock detection

The simulator below runs transactions under strict 2PL. Each step lets the named transaction attempt its next operation. A blocked transaction records whom it waits for in the **wait-for graph**. A cycle in that graph is a deadlock, broken by aborting the youngest transaction in the cycle (the largest id), which releases its locks.

```python run Strict 2PL with a wait-for graph
def run(txns, order):
    pc = {t: 0 for t in txns}
    locks = {}                       # item -> (mode, holders)
    waits, finished, log = {}, [], []

    def release(t):
        for x in list(locks):
            mode, holders = locks[x]
            holders.discard(t)
            if not holders:
                del locks[x]

    def cycle_from(t):
        path, node = [t], t
        while node in waits and waits[node]:
            node = min(waits[node])
            if node in path:
                return path[path.index(node):]
            path.append(node)
        return None

    def attempt(t):
        kind, x = txns[t][pc[t]]
        mode, holders = locks.get(x, ('S', set()))
        others = holders - {t}
        ok = not others if kind in 'WU' else (mode == 'S' or not others)
        if not ok:
            waits[t] = others
            log.append(f'T{t} {kind}({x}) waits for {sorted("T%d" % o for o in others)}')
            cyc = cycle_from(t)
            if cyc:
                victim = max(cyc)
                log.append(f'   DEADLOCK {" -> ".join("T%d" % c for c in cyc)}: abort '
                        f'T{victim}')
                release(victim); finished.append(f'T{victim} aborted')
                for w in waits.values(): w.discard(victim)
                waits.pop(victim, None); pc[victim] = len(txns[victim])
            return
        waits.pop(t, None)
        new_mode = 'X' if kind in 'WU' or mode == 'X' else 'S'
        locks[x] = (new_mode, holders | {t})
        log.append(f'T{t} {kind}({x})  lock {new_mode}({x})')
        pc[t] += 1
        if pc[t] == len(txns[t]):
            release(t); finished.append(f'T{t} committed')
            log.append(f'T{t} commits, releases all locks')
            for w in waits.values(): w.discard(t)

    steps = list(order)
    while steps:
        t = steps.pop(0)
        if pc[t] < len(txns[t]):
            attempt(t)
        if not steps:
            steps = [u for u in txns if pc[u] < len(txns[u])]
    print('\n'.join(log)); print('result:', ', '.join(finished)); print()

parse = lambda s: [(o[0], o[2]) for o in s.split()]
print('--- read, then write the same items: both upgrade S to X ---')
run({1: parse('R(A) W(A) R(B) W(B)'), 2: parse('R(A) W(A) R(B) W(B)')}, [1, 2, 1, 2, 1, 2])
print('--- U = read for update (takes X at once, like SELECT ... FOR UPDATE) ---')
run({1: parse('U(A) W(A) U(B) W(B)'), 2: parse('U(A) W(A) U(B) W(B)')}, [1, 2, 1, 2, 1, 2])
print('--- opposite order: classic deadlock ---')
run({1: parse('W(A) W(B)'), 2: parse('W(B) W(A)')}, [1, 2, 1, 2])
```

The first run is a surprise worth remembering: the two transfers touch A and B in the **same** order and still deadlock. Both read A under a shared lock, then both try to **upgrade** to exclusive, and each waits for the other to drop its shared lock. This *lock-upgrade deadlock* is why databases offer `SELECT ... FOR UPDATE` (and update locks): reading with an exclusive lock from the start makes T<sub>2</sub> wait at its very first step, giving the serial order T<sub>1</sub>, T<sub>2</sub> in the second run. In the third run each transaction holds one lock and wants the other's, so the wait-for graph has a cycle and T<sub>2</sub> (the younger) is aborted.

> TIP: The standard application-level cure for deadlocks is to **acquire locks in a fixed global order** (for example, always lock the account with the smaller id first). The LLD and Java guides use the same trick with Java locks.

### Deadlock prevention with timestamps

Instead of detecting cycles, a system can prevent them by giving each transaction a timestamp at start (smaller = older) and deciding what happens when T<sub>i</sub> requests a lock held by T<sub>j</sub>:

```python run Wait-die versus wound-wait
def wait_die(req, holder):         # non-pre-emptive
    return f'T{req} waits' if req < holder else f'T{req} dies (restarts, same timestamp)'

def wound_wait(req, holder):       # pre-emptive
    return f'T{req} wounds T{holder} (T{holder} aborts)' if req < holder else f'T{req} waits'

print(f'{"request":44}{"wait-die":38}{"wound-wait"}')
for req, holder in [(5, 10), (10, 5)]:
    who = 'older asks younger' if req < holder else 'younger asks older'
    print(f'T{req} wants lock of T{holder} ({who})'.ljust(44)
          + wait_die(req, holder).ljust(38) + wound_wait(req, holder))
```

In both schemes only the **younger** transaction is ever aborted, and it restarts with its **original** timestamp, so it eventually becomes the oldest and cannot starve. Wait-die lets old transactions wait for young ones; wound-wait never makes the old wait.

### Multiple-granularity locking

Locking whole tables is cheap but blocks everyone; locking rows is concurrent but needs many locks. **Intention locks** let a system lock at several levels (database, table, page, row) at once. Before locking a row in X mode, a transaction places IX on the table, announcing "somewhere below, I hold X".

| Held \ Requested | IS | IX | S | SIX | X |
|---|---|---|---|---|---|
| IS | ✓ | ✓ | ✓ | ✓ | ✗ |
| IX | ✓ | ✓ | ✗ | ✗ | ✗ |
| S | ✓ | ✗ | ✓ | ✗ | ✗ |
| SIX | ✓ | ✗ | ✗ | ✗ | ✗ |
| X | ✗ | ✗ | ✗ | ✗ | ✗ |

SIX (shared + intention exclusive) suits "read the whole table, update a few rows". InnoDB uses IS/IX table locks in exactly this way.

## 5.3 Timestamp-ordering protocol

Timestamp ordering (TO) uses no locks. Each transaction T gets a timestamp TS(T) at start, and the schedule must be equivalent to the serial order of timestamps. Each item X remembers R-TS(X) (largest timestamp that read it) and W-TS(X) (largest that wrote it).

| Operation by T | Condition | Action |
|---|---|---|
| Read X | TS(T) < W-TS(X) | Abort T: a younger transaction already overwrote the value T should have seen |
| Read X | otherwise | Read; R-TS(X) = max(R-TS(X), TS(T)) |
| Write X | TS(T) < R-TS(X) | Abort T: a younger transaction already read the old value |
| Write X | TS(T) < W-TS(X) | Basic TO: abort T. **Thomas write rule**: skip the write (it is obsolete) |
| Write X | otherwise | Write; W-TS(X) = TS(T) |

```python run Basic timestamp ordering and the Thomas write rule
def to(schedule, thomas=False):
    rts, wts, aborted, log = {}, {}, set(), []
    for op in schedule.split():
        kind, t, x = op[0], int(op[1]), op[3]
        if t in aborted:
            continue
        if kind == 'R':
            if t < wts.get(x, 0):
                aborted.add(t); log.append(f'{op}: abort (W-TS={wts[x]})')
            else:
                rts[x] = max(rts.get(x, 0), t); log.append(f'{op}: ok')
        else:
            if t < rts.get(x, 0):
                aborted.add(t); log.append(f'{op}: abort (R-TS={rts[x]})')
            elif t < wts.get(x, 0):
                if thomas:
                    log.append(f'{op}: ignored (obsolete, W-TS={wts[x]})')
                else:
                    aborted.add(t); log.append(f'{op}: abort (W-TS={wts[x]})')
            else:
                wts[x] = t; log.append(f'{op}: ok')
    return log

s = 'R1(A) W2(A) W1(A) R3(A)'
print('basic TO :', '; '.join(to(s)))
print('Thomas   :', '; '.join(to(s, thomas=True)))
print('read-late:', '; '.join(to('R2(A) W1(A)')))
```

Under the Thomas write rule, T<sub>1</sub>'s write of A is simply dropped: in the timestamp order T<sub>1</sub> then T<sub>2</sub>, T<sub>2</sub>'s write would overwrite it anyway and nobody read it in between. This allows some **view-serialisable** schedules that are not conflict serialisable. TO is deadlock-free (nobody waits) but may abort transactions repeatedly, and basic TO is not recoverable without extra rules.

## 5.4 MVCC and snapshot isolation

**Multiversion concurrency control** keeps several committed versions of each item, stamped with the commit time. A transaction reads from a **snapshot**: the versions committed before it started. Readers never block writers and writers never block readers, which is why PostgreSQL, Oracle, InnoDB, SQL Server (snapshot mode) and SQLite's WAL mode all use it.

Under **snapshot isolation** (SI), writes are buffered and checked at commit with **first-committer-wins**: if another transaction committed a newer version of an item you also wrote, you abort. That stops lost updates. It does **not** stop **write skew**, because the two transactions write different items.

```python run A snapshot-isolation simulator: lost update blocked, write skew allowed
class SIDB:
    def __init__(self, data):
        self.versions = {k: [(0, v)] for k, v in data.items()}
        self.clock = 0

    def begin(self):
        return {'start': self.clock, 'writes': {}}

    def read(self, tx, key):
        if key in tx['writes']:
            return tx['writes'][key]
        return [v for ts, v in self.versions[key] if ts <= tx['start']][-1]

    def write(self, tx, key, value):
        tx['writes'][key] = value

    def commit(self, tx, name):
        for key in tx['writes']:
            if self.versions[key][-1][0] > tx['start']:
                return f'{name} ABORTS (first committer wins on {key})'
        self.clock += 1
        for key, v in tx['writes'].items():
            self.versions[key].append((self.clock, v))
        return f'{name} commits'

db = SIDB({'balance': 100})
t1, t2 = db.begin(), db.begin()
db.write(t1, 'balance', db.read(t1, 'balance') + 50)
db.write(t2, 'balance', db.read(t2, 'balance') - 30)
print('lost update test :', db.commit(t1, 'T1'), '|', db.commit(t2, 'T2'),
      '| balance', db.read(db.begin(), 'balance'))

db = SIDB({'alice_on_call': True, 'bob_on_call': True})       # rule: at least one on call
ta, tb = db.begin(), db.begin()
for tx, me in [(ta, 'alice_on_call'), (tb, 'bob_on_call')]:
    on_call = db.read(tx, 'alice_on_call') + db.read(tx, 'bob_on_call')
    if on_call >= 2:                                             # "someone else is on call"
        db.write(tx, me, False)
print('write skew test  :', db.commit(ta, 'Alice'), '|', db.commit(tb, 'Bob'))
snap = db.begin()
print('doctors on call now:', db.read(snap, 'alice_on_call') + db.read(snap, 'bob_on_call'))
```

Both doctors saw two people on call in their snapshots, each wrote only their own row, so first-committer-wins found no conflict. The fixes:

- **Serializable snapshot isolation (SSI)**, used by PostgreSQL's `SERIALIZABLE` level, tracks read–write dependencies and aborts one transaction of a dangerous cycle.
- **Materialise the conflict**: make both transactions write a common row (for example, an `on_call_count` row), so first-committer-wins catches it.
- **Lock what you read**: `SELECT ... FOR UPDATE` on the rows that the check depends on.

## 5.5 Isolation levels

| Level | Dirty read | Non-repeatable read | Phantom | Lost update | Write skew | Typical implementation |
|---|---|---|---|---|---|---|
| Read uncommitted | Possible | Possible | Possible | Possible | Possible | No read locks |
| Read committed | No | Possible | Possible | Possible | Possible | Short read locks, or a fresh snapshot per statement |
| Repeatable read | No | No | Possible (ANSI) | Engine-dependent | Possible | Long read locks, or one snapshot per transaction |
| Snapshot isolation | No | No | No | No | **Possible** | MVCC + first-committer-wins |
| Serializable | No | No | No | No | No | Strict 2PL with predicate/next-key locks, or SSI |

Defaults differ: **PostgreSQL and Oracle** default to read committed; **MySQL InnoDB** defaults to repeatable read, implemented with snapshots for plain reads and next-key locks for locking reads, which prevents most phantoms. The MySQL guide demonstrates these levels on a real server.

> TRAP: "Repeatable read" means different things in different engines. In PostgreSQL it is actually snapshot isolation; in InnoDB it is snapshots plus gap locks for `FOR UPDATE`/`UPDATE`. Always say which engine you mean.

## 5.6 Practical lessons

- Know the five anomalies with one example each, and the table of which level allows which.
- 2PL gives conflict serialisability; strict 2PL adds no cascading aborts; deadlocks are handled by wait-for graph detection or by timestamps (wait-die, wound-wait).
- Timestamp ordering never waits but may abort; the Thomas write rule drops obsolete writes.
- MVCC lets readers and writers proceed without blocking each other; snapshot isolation still allows write skew.
- In application code, prevent lost updates with atomic updates (`SET x = x + 1`), `SELECT ... FOR UPDATE`, or optimistic version columns (`UPDATE ... WHERE version = ?`).
