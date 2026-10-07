# Chapter 6: Recovery
%Logs, write-ahead logging, undo and redo, checkpoints, ARIES and shadow paging

## 6.1 What can fail

| Failure | Example | What is lost | Recovered by |
|---|---|---|---|
| Transaction failure | Constraint violation, deadlock victim, explicit `ROLLBACK` | That transaction's work | Undo using the log |
| System crash | Power cut, OS panic, DBMS bug | Main memory: the buffer pool and in-memory log tail | Undo + redo from the log on disk at restart |
| Media failure | Disk dies | Data files | Restore the last backup, then redo from the archived log |

Recovery relies on **stable storage**: storage that survives any failure, approximated by writing the log to several disks (RAID, replicas). Main memory is volatile; disks are non-volatile but can fail.

## 6.2 Buffer policies decide what recovery must do

Data pages are modified in the buffer pool and written to disk later. Two policy choices determine whether recovery needs undo, redo or both:

| | **Force** (flush every page a transaction changed at commit) | **No-force** (pages may still be only in memory after commit) |
|---|---|---|
| **No-steal** (uncommitted changes never reach disk) | No undo, no redo (but slow and needs huge buffers) | Redo only |
| **Steal** (uncommitted changes may be written to disk to free a frame) | Undo only | **Undo and redo**: what every real system does |

Steal + no-force is fastest at run time (the buffer manager evicts freely and commits need only a sequential log write), so the log must support both undo and redo.

## 6.3 The log and the write-ahead rule

The log is an append-only sequence of records on stable storage:

| Record | Meaning |
|---|---|
| ⟨T start⟩ | T began |
| ⟨T, X, old, new⟩ | T changed X from old (**undo** information) to new (**redo** information) |
| ⟨T commit⟩ | T committed |
| ⟨T abort⟩ | T rolled back |
| ⟨checkpoint L⟩ | Checkpoint taken while the transactions in list L were active |

**Write-ahead logging (WAL)** has two rules:

1. Before a modified data page is written to disk, every log record describing changes to that page must already be on stable storage. (Otherwise an uncommitted change could reach disk with no undo information.)
2. A transaction commits only when all its log records, including ⟨T commit⟩, are on stable storage. (Otherwise a committed change could be lost with no redo information.)

> TIP: Interview phrasing: "The log is written sequentially, so flushing it at commit is cheap; data pages are written lazily in the background. WAL is what makes that safe."

## 6.4 Undo/redo recovery with a checkpoint

At restart, with immediate update (steal, no-force):

1. **Redo** every logged update of committed transactions, in log order (forward).
2. **Undo** every logged update of transactions with no commit or abort record, in reverse order (backward).

Without checkpoints, recovery would scan the whole log. A **checkpoint** flushes all dirty pages and the log, then writes ⟨checkpoint L⟩. Transactions that committed before the checkpoint need nothing: their changes are already on disk. Only transactions in L, or started after the checkpoint, need redo or undo.

The program below makes the correctness argument concrete. It replays a log, but before the crash it flushes a **random** subset of pages to disk, as a steal/no-force buffer manager might, while obeying WAL. It then recovers from three different crash states. The recovered database is the same every time, and equals the state produced by the committed transactions only.

```python run Undo/redo recovery from three different crash states
import random

LOG = [
    ('start', 'T0'), ('update', 'T0', 'A', 1000, 950), ('update', 'T0', 'B', 2000, 2050),
    ('commit', 'T0'),
    ('start', 'T1'),
    ('checkpoint', ['T1']),
    ('update', 'T1', 'C', 700, 600),
    ('start', 'T2'), ('update', 'T2', 'A', 950, 900),
    ('commit', 'T1'),
    ('update', 'T2', 'D', 500, 450),
]                                                     # crash here: T2 never committed
INITIAL = {'A': 1000, 'B': 2000, 'C': 700, 'D': 500}


def crash_state(seed):
    """Disk at the crash: pages flushed at the checkpoint, plus a random subset after."""
    rng = random.Random(seed)
    disk, memory = dict(INITIAL), dict(INITIAL)
    for rec in LOG:
        if rec[0] == 'update':
            memory[rec[2]] = rec[4]
            if rng.random() < 0.5:
                disk[rec[2]] = memory[rec[2]]         # steal: may flush before commit
        if rec[0] == 'checkpoint':
            disk = dict(memory)                       # checkpoint flushes all dirty pages
    return disk


def recover(disk):
    db = dict(disk)
    cp = max(i for i, r in enumerate(LOG) if r[0] == 'checkpoint')
    relevant = set(LOG[cp][1]) | {r[1] for r in LOG[cp:] if r[0] == 'start'}
    committed = {r[1] for r in LOG if r[0] == 'commit'}
    redo = [r for r in LOG[cp:] if r[0] == 'update' and r[1] in committed & relevant]
    undo = [r for r in LOG if r[0] == 'update' and r[1] in relevant - committed]
    for _, t, x, old, new in redo:                    # forward
        db[x] = new
    for _, t, x, old, new in reversed(undo):          # backward
        db[x] = old
    return db, sorted(committed & relevant), sorted(relevant - committed)


for seed in (1, 2, 3):
    disk = crash_state(seed)
    db, redo_list, undo_list = recover(disk)
    print(f'crash state {seed}: disk {disk}')
    print(f'   redo {redo_list} undo {undo_list} -> recovered {db}')
```

The three crash states differ (A might hold T<sub>2</sub>'s uncommitted 900 or the committed 950; D might hold 450 or 500), yet recovery always gives A = 950, B = 2050, C = 600, D = 500. T<sub>0</sub> committed before the checkpoint, so it is neither redone nor undone; T<sub>1</sub> is redone; T<sub>2</sub> is undone.

> TRAP: Undo must run **backwards**. If a transaction updated A twice (100 → 200 → 300), undoing forwards would end with A = 200; backwards restores the original 100.

## 6.5 ARIES

ARIES (Algorithms for Recovery and Isolation Exploiting Semantics, IBM 1992) is the recovery algorithm behind DB2, SQL Server and, in spirit, InnoDB. Its key ideas:

| Idea | Purpose |
|---|---|
| **LSN** (log sequence number) on every log record | Unique, increasing position in the log |
| **pageLSN** stored in every data page | LSN of the latest change applied to that page: redo is skipped if pageLSN ≥ record LSN, so redo is **idempotent** |
| **prevLSN** in each record | Links a transaction's records backwards for fast undo |
| **Transaction table (TT)** | Active transactions and their last LSN |
| **Dirty page table (DPT)** | Pages changed in memory but not yet on disk, with **recLSN** (first LSN that dirtied them) |
| **Fuzzy checkpoints** | Write TT and DPT to the log without stopping the system or flushing pages |
| **CLRs** (compensation log records) | Logged when undoing, so a crash during recovery never undoes the same change twice |
| **Repeating history** | Redo *everything* (even losers' changes), then undo losers, which works with fine-grained locking |

Recovery has three passes:

1. **Analysis**: start at the last checkpoint, rebuild TT and DPT, and find the losers (transactions without a commit/end record) and the redo start point (smallest recLSN in the DPT).
2. **Redo**: scan forward from that point and reapply each update or CLR, unless the page is not in the DPT, or its recLSN is larger, or its pageLSN already includes it.
3. **Undo**: undo the losers' updates in decreasing LSN order, writing a CLR for each, until every loser is rolled back.

```python run A simplified ARIES restart
LOG = {
    10: dict(t='T1', kind='update', page='P1', before='a0', after='a1', prev=None),
    20: dict(t='T2', kind='update', page='P2', before='b0', after='b1', prev=None),
    30: dict(kind='checkpoint', tt={'T1': 10, 'T2': 20}, dpt={'P1': 10, 'P2': 20}),
    40: dict(t='T1', kind='update', page='P3', before='c0', after='c1', prev=10),
    50: dict(t='T2', kind='commit', prev=20),
    60: dict(t='T2', kind='end', prev=50),
    70: dict(t='T3', kind='update', page='P1', before='a1', after='a2', prev=None),
    80: dict(t='T1', kind='update', page='P2', before='b1', after='b2', prev=40),
}                                         # crash after LSN 80
disk = {'P1': ('a1', 10), 'P2': ('b0', 0), 'P3': ('c1', 40)}       # value, pageLSN

# 1. Analysis
cp = max(l for l, r in LOG.items() if r['kind'] == 'checkpoint')
tt, dpt = dict(LOG[cp]['tt']), dict(LOG[cp]['dpt'])
for lsn in sorted(l for l in LOG if l > cp):
    r = LOG[lsn]
    if r['kind'] == 'end':
        tt.pop(r['t'], None); continue
    tt[r['t']] = lsn
    if r['kind'] == 'update':
        dpt.setdefault(r['page'], lsn)
committed = {r['t'] for r in LOG.values() if r['kind'] == 'commit'}
losers = {t: last for t, last in tt.items() if t not in committed}
start = min(dpt.values())
print('analysis : TT', tt, '| DPT', dpt, '| losers', sorted(losers), '| redo from', start)

# 2. Redo (repeat history)
for lsn in sorted(l for l in LOG if l >= start):
    r = LOG[lsn]
    if r['kind'] != 'update':
        continue
    page = r['page']; value, page_lsn = disk[page]
    if page not in dpt or dpt[page] > lsn or page_lsn >= lsn:
        print(f'redo  {lsn}: skip {page} (pageLSN {page_lsn})')
    else:
        disk[page] = (r['after'], lsn)
        print(f'redo  {lsn}: {page} := {r["after"]}')

# 3. Undo losers, newest change first, writing CLRs
next_lsn = max(LOG) + 10
to_undo = dict(losers)
while to_undo:
    t, lsn = max(to_undo.items(), key=lambda kv: kv[1])
    r = LOG[lsn]
    if r['kind'] == 'update':
        disk[r['page']] = (r['before'], next_lsn)
        LOG[next_lsn] = dict(t=t, kind='CLR', page=r['page'], undo_next=r['prev'])
        print(f'undo  {lsn}: {r["page"]} := {r["before"]}  (CLR {next_lsn}, undoNext '
                f'{r["prev"]})')
        next_lsn += 10
    if r['prev'] is None:
        del to_undo[t]; print(f'      {t} fully rolled back: write END')
    else:
        to_undo[t] = r['prev']
print('final pages:', {p: v for p, (v, _) in disk.items()})
```

Follow the redo pass. LSN 10 is skipped because P1's pageLSN (10) shows it already reached disk; LSN 20 is redone because P2 was never flushed. Redo reapplies even LSNs 70 and 80, which belong to losers: ARIES repeats history exactly, then undoes. The undo pass rolls back LSN 80, 70, 40 and 10 in that order. The final state keeps only T<sub>2</sub>'s committed change (P2 = b1).

> NOTE: If the system crashed again during the undo pass, the next restart would find the CLRs. A CLR is redone but never undone, and its undoNext pointer tells recovery where to continue, so no change is ever undone twice.

## 6.6 Shadow paging

Shadow paging avoids a log altogether. The database is accessed through a **page table**. A transaction copies each page before changing it (copy-on-write) and builds a new page table pointing to the copies. Commit is a single atomic write that swaps the root pointer from the old (shadow) page table to the new one. A crash before the swap leaves the old table intact: nothing to undo or redo.

| | Log-based (WAL) | Shadow paging |
|---|---|---|
| Commit cost | Flush sequential log records | Flush every changed page + page table, then swap the root |
| Recovery | Undo/redo passes | Instant: the old root is still valid |
| Data locality | Pages stay in place | Pages move around: fragmentation |
| Concurrency | Fine-grained, many writers | Hard with concurrent writers |
| Used by | Nearly all relational DBMSs | LMDB, CouchDB-style append-only trees, file systems such as ZFS/Btrfs (copy-on-write) |

## 6.7 Practical lessons

- Steal + no-force needs both undo (steal) and redo (no-force); that is the normal case.
- WAL: log before data page; log (including commit record) before reporting commit.
- Recovery: redo committed transactions forwards, undo uncommitted backwards; a checkpoint limits how far back to look.
- ARIES: analysis, redo (repeat history, skip using pageLSN), undo with CLRs.
- Commit latency is dominated by the log flush. Group commit (flush many transactions' commit records together) is how databases reach thousands of commits per second.
