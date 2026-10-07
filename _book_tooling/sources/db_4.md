# Chapter 7: Storage and Indexing
%Pages and files, the buffer pool, B+ trees, hash indexes, and which index to use when

## 7.1 Pages, records and files

Disks and SSDs transfer data in blocks, so a DBMS stores everything in fixed-size **pages** (4 KB in SQLite by default, 16 KB in InnoDB, 8 KB in PostgreSQL). One page I/O is the unit of cost in every numerical in this chapter and the next.

| Storage | Typical access time | Relative to RAM |
|---|---|---|
| CPU cache | ~1 ns | — |
| RAM | ~100 ns | 1× |
| NVMe SSD random read | ~20–100 µs | ~500× |
| Hard disk random read | ~5–10 ms | ~100 000× |
| Hard disk sequential | ~100–200 MB/s | Sequential beats random by ~100× on HDDs |

Inside a page, variable-length records are usually stored with a **slotted page** layout: a header with a slot array of (offset, length) pairs growing from the front, and records growing from the back. A record id (RID) is (page number, slot number), and records can move within the page without changing their RID.

```text
+--------+--------+--------+--------------- free ---------------+-------+-------+-------+
| header | slot 0 | slot 1 | slot 2 ->                 <- rec 2 | rec 1 | rec 0 |
+--------+--------+--------+-------------------------------------+-------+-------+-------+
```

### File organisations

With B = number of data pages, the classic costs (in page I/Os) are:

| Organisation | Full scan | Equality search | Range search | Insert | Delete |
|---|---|---|---|---|---|
| Heap (unordered) | B | B/2 on average (key), B (non-key) | B | 2 (read last page, write) | Search + 1 |
| Sorted file | B | log<sub>2</sub> B | log<sub>2</sub> B + matching pages | Search + B (shift half the file, read and write) | Search + B |
| Hashed file | ~1.25 B (pages kept 80% full) | ~1 | 1.25 B (hashing destroys order) | 2 | 2 |
| Heap + B+ tree index | B | h + 1 | h + matching | h + 2 | h + 2 |

The lesson: no file organisation is best for everything, which is why tables are heaps or clustered B+ trees, with **extra indexes** for the other access paths.

## 7.2 The buffer pool and page replacement

The buffer manager keeps recently used pages in a pool of memory **frames**. A request for a page that is already in the pool is a **hit**; otherwise it is a **miss**, and if the pool is full a victim frame must be evicted (and written back if dirty). Pages being used are **pinned** and cannot be evicted.

| Policy | Evicts | Cost | Weakness |
|---|---|---|---|
| LRU | Least recently used page | List update on every access | **Sequential flooding**: a repeated scan just larger than the pool gets 0% hits |
| Clock (second chance) | Sweeps frames; clears a reference bit, evicts the first with bit 0 | Very cheap | Approximates LRU, same flooding problem |
| MRU | Most recently used page | Cheap | Bad for normal workloads, ideal for repeated sequential scans |
| LRU-K / 2Q / ARC | Uses the last K accesses or several lists | More bookkeeping | Resists scans; used by real systems |

InnoDB uses a **midpoint-insertion LRU**: new pages enter the middle of the list and only move to the young end if accessed again, so one big scan cannot flush the hot pages.

```python run LRU, Clock and MRU on three access patterns
from collections import OrderedDict
import random


def lru(trace, frames):
    pool, hits = OrderedDict(), 0
    for p in trace:
        if p in pool:
            hits += 1; pool.move_to_end(p)
        else:
            if len(pool) == frames:
                pool.popitem(last=False)
            pool[p] = True
    return hits / len(trace)


def mru(trace, frames):
    pool, hits, last = [], 0, None
    for p in trace:
        if p in pool:
            hits += 1
        else:
            if len(pool) == frames:
                pool.remove(last)
            pool.append(p)
        last = p
    return hits / len(trace)


def clock(trace, frames):
    slots, ref, hand, hits = [None] * frames, [0] * frames, 0, 0
    where = {}
    for p in trace:
        if p in where:
            hits += 1; ref[where[p]] = 1; continue
        while ref[hand]:
            ref[hand] = 0; hand = (hand + 1) % frames
        if slots[hand] is not None:
            del where[slots[hand]]
        slots[hand], ref[hand], where[p] = p, 1, hand
        hand = (hand + 1) % frames
    return hits / len(trace)


rng = random.Random(7)
patterns = {
    'hot set (80% of hits on 10 pages)': [rng.randrange(10) if rng.random() < 0.8
                                          else rng.randrange(10, 1000)
                                                  for _ in range(20000)],
    'repeated scan of 11 pages': list(range(11)) * 1000,
    'uniform random over 100 pages': [rng.randrange(100) for _ in range(20000)],
}
print(f'{"pattern (10 frames)":36}{"LRU":>8}{"Clock":>8}{"MRU":>8}')
for name, trace in patterns.items():
    print(f'{name:36}' + ''.join(f'{f(trace, 10):8.1%}' for f in (lru, clock, mru)))

sizes = list(range(2, 41, 2))
trace = patterns['hot set (80% of hits on 10 pages)']
plt.plot(sizes, [lru(trace, s) for s in sizes], marker='o', ms=3, label='LRU')
plt.plot(sizes, [clock(trace, s) for s in sizes], marker='s', ms=3, label='Clock')
plt.plot(sizes, [mru(trace, s) for s in sizes], marker='^', ms=3, label='MRU')
plt.xlabel('buffer pool size (frames)'); plt.ylabel('hit ratio'); plt.legend()
plt.title('Hot-set workload'); plt.tight_layout(); plt.savefig('db_buffer.png', dpi=150)
```

![Hit ratio against pool size for the hot-set workload](figs/db_buffer.png)

The repeated scan of 11 pages through 10 frames is the textbook flooding case: LRU always evicts exactly the page that is needed next, so it never hits, while MRU hits about 90% of the time because it keeps most of the scanned pages resident. On the hot-set workload, LRU and Clock climb quickly once the pool can hold the 10 hot pages; MRU does badly because it evicts exactly what was just used. Clock tracks LRU closely at a fraction of the cost, which is why it is the common choice.

## 7.3 Index concepts

| Term | Meaning |
|---|---|
| Search key | Attribute(s) the index is built on (not necessarily a key) |
| Dense index | One index entry per search-key value (or per record) |
| Sparse index | One entry per data **page**; works only if the file is sorted on the search key |
| Primary / clustering index | Index on the attribute the file is physically sorted by; at most one per table |
| Secondary (non-clustering) index | Index on another attribute; must be dense |
| Multilevel index | An index on the index, until the top level fits in one page: this is what a B+ tree is |

## 7.4 B+ trees

A B+ tree of **order p** (maximum p children per internal node) is a balanced search tree designed for disks:

- All data entries (keys with record pointers, or the records themselves) are in the **leaves**; internal nodes hold only separator keys.
- Every node except the root is at least half full: ⌈p/2⌉ children for internal nodes.
- All leaves are at the **same depth** and are linked left to right, so range scans read leaf after leaf.
- Height grows only when the root splits, which keeps the tree balanced automatically.

Because one node is one page and p is in the hundreds, a tree of height 3 or 4 indexes billions of records. That is the answer to "why not a binary search tree on disk?": a balanced BST over a million keys has height ~20, which means ~20 random page reads per lookup instead of 3 or 4.

### Implementation

The implementation below supports search, range scan and insertion with node splits. Leaves split by copying the middle key **up** (it stays in the right leaf); internal nodes split by pushing the middle key up (it moves). That difference is a classic exam detail.

```python run bplus.py: a B+ tree with splits and range scans
import sys, shutil, bisect


class Node:
    def __init__(self, leaf):
        self.leaf, self.keys, self.kids, self.next = leaf, [], [], None


class BPlusTree:
    def __init__(self, order):
        self.order = order                     # max children; max keys = order - 1
        self.root = Node(leaf=True)

    def _find_leaf(self, key, path=None):
        node = self.root
        while not node.leaf:
            if path is not None:
                path.append(node)
            node = node.kids[bisect.bisect_right(node.keys, key)]
        return node

    def search(self, key):
        leaf = self._find_leaf(key)
        i = bisect.bisect_left(leaf.keys, key)
        return leaf.kids[i] if i < len(leaf.keys) and leaf.keys[i] == key else None

    def range(self, lo, hi):
        leaf, out = self._find_leaf(lo), []
        while leaf:
            for k, v in zip(leaf.keys, leaf.kids):
                if k > hi:
                    return out
                if k >= lo:
                    out.append(k)
            leaf = leaf.next
        return out

    def insert(self, key, value=None):
        path = []
        leaf = self._find_leaf(key, path)
        i = bisect.bisect_left(leaf.keys, key)
        leaf.keys.insert(i, key); leaf.kids.insert(i, value)
        if len(leaf.keys) < self.order:
            return
        right = Node(leaf=True)                 # leaf split: copy the middle key up
        mid = len(leaf.keys) // 2
        right.keys, right.kids = leaf.keys[mid:], leaf.kids[mid:]
        leaf.keys, leaf.kids = leaf.keys[:mid], leaf.kids[:mid]
        right.next, leaf.next = leaf.next, right
        self._insert_up(path, leaf, right.keys[0], right)

    def _insert_up(self, path, left, key, right):
        if not path:
            root = Node(leaf=False)
            root.keys, root.kids = [key], [left, right]
            self.root = root
            return
        parent = path.pop()
        i = parent.kids.index(left)
        parent.keys.insert(i, key); parent.kids.insert(i + 1, right)
        if len(parent.kids) <= self.order:
            return
        mid = len(parent.keys) // 2             # internal split: push the middle key up
        up = parent.keys[mid]
        sib = Node(leaf=False)
        sib.keys, sib.kids = parent.keys[mid + 1:], parent.kids[mid + 1:]
        parent.keys, parent.kids = parent.keys[:mid], parent.kids[:mid + 1]
        self._insert_up(path, parent, up, sib)

    def height(self):
        h, node = 1, self.root
        while not node.leaf:
            node, h = node.kids[0], h + 1
        return h

    def show(self):
        level, out = [self.root], []
        while level:
            out.append(' '.join('[' + ' '.join(map(str, n.keys)) + ']' for n in level))
            level = [] if level[0].leaf else [k for n in level for k in n.kids]
        return ' / '.join(out)


if __name__ == '__main__':
    shutil.copy(sys.argv[0], 'bplus.py')
    t = BPlusTree(order=4)                      # at most 3 keys per node
    for k in [10, 20, 5, 6, 12, 30, 7, 17, 25, 40, 50, 60]:
        t.insert(k, f'rec{k}')
        print(f'insert {k:2} (h={t.height()}): {t.show()}')
    print('search 12 ->', t.search(12), '| search 13 ->', t.search(13))
    print('range 6..25 ->', t.range(6, 25))
```

Each line shows the levels from the root down, separated by `/`. Trace the first split: inserting 6 makes the leaf [5 6 10 20] overflow (four keys, maximum three). It splits into [5 6] and [10 20], and 10 is **copied** into a new root, so 10 appears both in the root and in a leaf. Inserting 30 splits [10 12 20 30] into [10 12] and [20 30] and copies 20 up: now keys below 10 go to the first leaf, 10–19 to the second, and 20 or more to the third. The last insert, 60, splits a leaf and gives the root a fifth child, so the root itself splits: its middle key 30 is **moved** (not copied) into a new root, and the height grows to 3.

### Order and capacity numericals

Most exam numericals ask for the order of a node that fits in one block, then the height or the number of records a tree of a given height holds.

- Internal node of order p: p pointers and p − 1 keys fit in a block: p·P + (p − 1)·K ≤ B, so **p = ⌊(B + K) / (K + P)⌋**.
- Leaf node: n (key, record pointer) pairs plus one next-leaf pointer: n·(K + P<sub>r</sub>) + P ≤ B, so **n = ⌊(B − P) / (K + P<sub>r</sub>)⌋**.
- A tree of height h (h − 1 internal levels above the leaves) holds at most p<sup>h−1</sup> · n records, and at least 2·⌈p/2⌉<sup>h−2</sup> · ⌈n/2⌉ when nodes are minimally full.

```python run A B+ tree capacity calculator
import math


def bplus_numbers(block, key, ptr, rec_ptr, records, fill=1.0):
    p = (block + key) // (key + ptr)              # internal order
    n = (block - ptr) // (key + rec_ptr)          # data entries per leaf
    pe, ne = max(2, int(p * fill)), max(1, int(n * fill))
    leaves = math.ceil(records / ne)
    levels, nodes = 1, leaves
    while nodes > 1:
        nodes = math.ceil(nodes / pe); levels += 1
    return p, n, leaves, levels


cases = [
    ('4 KB pages, 8-byte keys and pointers', 4096, 8, 8, 8, 10 ** 9, 1.0),
    ('same, nodes 69% full (typical)', 4096, 8, 8, 8, 10 ** 9, 0.69),
    ('1 KB block, 9-byte key, 6-byte ptr, 7-byte rec ptr', 1024, 9, 6, 7, 10 ** 6, 1.0),
]
for label, b, k, ptr, rp, recs, fill in cases:
    p, n, leaves, h = bplus_numbers(b, k, ptr, rp, recs, fill)
    print(f'{label}:\n   order p = {p}, entries per leaf n = {n}, '
          f'{recs:,} records -> {leaves:,} leaves, height {h}')

p, n = 256, 255
for h in (2, 3, 4):
    print(f'height {h}: up to {p ** (h - 1) * n:,} records with p = {p}, n = {n}')
```

A billion records need a height of 4 with full nodes and 5 at the typical 69% occupancy. The top two or three levels are only a few thousand pages, small enough to stay in the buffer pool, so a lookup costs about two page reads in practice. For the third case: 6p + 9(p − 1) ≤ 1024 gives 15p ≤ 1033, so p = 68; a leaf holds ⌊(1024 − 6)/16⌋ = 63 entries.

| | B-tree | B+ tree |
|---|---|---|
| Where data pointers live | Every node | Leaves only |
| Internal node fan-out | Lower (also stores record pointers) | Higher, so the tree is shorter |
| Range scan | In-order traversal across levels | Follow the leaf chain |
| Point lookup | Can end early at an internal node | Always reaches a leaf (predictable cost) |
| Used by | Some file systems, older systems | Nearly every relational index (InnoDB, PostgreSQL, SQLite) |

> TRAP: Deleting from a B+ tree can **underflow** a node (fewer than half full). It is fixed by borrowing from a sibling (redistribution) or merging with it, which may propagate up. Many real systems skip merging and let pages stay sparse, rebuilding indexes occasionally instead.

## 7.5 Hash indexes

A hash index maps h(key) to a bucket. Equality search costs about one I/O, but there is no order, so ranges and `ORDER BY` cannot use it.

| Scheme | Growth | Notes |
|---|---|---|
| Static hashing | Fixed number of buckets + overflow chains | Chains grow long as data grows; rehashing everything is expensive |
| Extendible hashing | Directory of 2<sup>d</sup> pointers (d = global depth); split one bucket at a time, double the directory only when a bucket's local depth equals d | At most 2 I/Os per lookup (directory + bucket); directory may double |
| Linear hashing | Buckets split in a fixed round-robin order, triggered by load factor | No directory; overflow pages are temporary |

```python run Extendible hashing: bucket splits and directory doubling
class Extendible:
    def __init__(self, capacity):
        self.cap, self.gd = capacity, 1
        b0, b1 = {'ld': 1, 'keys': []}, {'ld': 1, 'keys': []}
        self.dir = [b0, b1]

    def _idx(self, key):
        return key & ((1 << self.gd) - 1)   # last gd bits of the hash (hash = key here)

    def insert(self, key):
        b = self.dir[self._idx(key)]
        if len(b['keys']) < self.cap:
            b['keys'].append(key); return
        if b['ld'] == self.gd:   # no spare pointer: double the directory
            self.dir += self.dir
            self.gd += 1
        b['ld'] += 1
        new = {'ld': b['ld'], 'keys': []}
        bit = 1 << (b['ld'] - 1)
        for i, ptr in enumerate(self.dir):
            if ptr is b and i & bit:
                self.dir[i] = new
        old_keys, b['keys'] = b['keys'], []
        for k in old_keys:
            self.dir[self._idx(k)]['keys'].append(k)
        self.insert(key)                             # retry (may split again)

    def show(self, note):
        groups = {}   # bucket -> directory entries pointing to it
        for i, b in enumerate(self.dir):
            groups.setdefault(id(b), (b, []))[1].append(f'{i:0{self.gd}b}')
        parts = [f'{",".join(ix)}:{sorted(b["keys"])}' for b, ix in groups.values()]
        print(f'{note} gd={self.gd} ' + '  '.join(parts))


h = Extendible(capacity=2)
for k in [4, 8, 1, 12, 5, 7, 16]:
    h.insert(k)
    h.show(f'insert {k:2} ({k:05b})')
```

Inserting 12 (binary …100) overflows the bucket holding 4 and 8, whose local depth equals the global depth, so the directory doubles to 4 entries and the bucket splits by the second-last bit. Every key here ends in 00, though, so all three still land in one bucket and it must split again, doubling the directory to 8 entries. Each group lists the directory entries that point to one bucket. A bucket whose local depth is smaller than the global depth is shared: with global depth 3, the bucket for keys ending in 1 (local depth 1) is reached from four entries.

## 7.6 Choosing and combining indexes

| Index type | Best for | Watch out for |
|---|---|---|
| Clustered B+ tree (InnoDB primary key, SQL Server clustered index) | Range scans on the key, ordered output; rows stored in key order | Only one per table; random primary keys (UUIDs) cause page splits |
| Secondary B+ tree | Selective equality and range predicates | Each match may cost a random I/O to fetch the row; for low selectivity a full scan wins |
| **Covering** index | Query answered from the index alone (all needed columns are in it) | Wider index, slower writes |
| Composite index (a, b, c) | Predicates on a; a and b; a, b and c (**leftmost prefix**) | Does not help a query on b alone |
| Hash index | Equality lookups (MEMORY tables, in-memory DBs, hash joins) | No ranges or ordering |
| Bitmap index | Low-cardinality columns in read-mostly analytics (gender, status, region) | Terrible for frequent updates |

**Bitmap indexes** store one bit vector per distinct value. Multi-condition queries become fast bitwise operations, and the bitmaps compress well.

```python run A bitmap index with bitwise AND and OR
rows = [('Asha', 'F', 'CSE', 'Kolkata'), ('Ravi', 'M', 'ECE', 'Pune'),
        ('Neha', 'F', 'CSE', 'Pune'), ('Sam', 'M', 'CSE', 'Kolkata'),
        ('Zoya', 'F', 'IT', 'Kolkata'), ('Arjun', 'M', 'CSE', 'Pune')]


def bitmaps(col):
    maps = {}
    for i, r in enumerate(rows):
        maps[r[col]] = maps.get(r[col], 0) | (1 << i)
    return maps

gender, dept, city = bitmaps(1), bitmaps(2), bitmaps(3)
for name, m in [('gender', gender), ('dept', dept), ('city', city)]:
    print(f'{name:6}', {v: format(b, f'0{len(rows)}b')[::-1] for v, b in m.items()})

q = gender['F'] & dept['CSE'] & city['Kolkata']              # F AND CSE AND Kolkata
print('F & CSE & Kolkata ->', [rows[i][0] for i in range(len(rows)) if q >> i & 1])
q = dept['IT'] | city['Pune']
print('IT | Pune         ->', [rows[i][0] for i in range(len(rows)) if q >> i & 1])
print('count of CSE      ->', bin(dept['CSE']).count('1'))
```

## 7.7 Practical lessons

- Cost is measured in page I/Os; random I/O is far more expensive than sequential.
- LRU fails on repeated scans larger than the pool (sequential flooding); real systems use scan-resistant variants.
- B+ trees: all data in linked leaves, nodes at least half full, height 3–4 for billions of rows. Know the order and capacity formulas.
- Leaf split copies the middle key up; internal split moves it up.
- Hash indexes: equality only. Extendible hashing doubles a directory; linear hashing splits buckets in order.
- Clustered index = row order; covering index = no table access; composite index = leftmost prefix rule.
