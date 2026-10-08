# Chapter 6: Conflicts and CRDTs
%Why replicas conflict, the merge laws that make convergence automatic, counters, registers and sets that never lose updates

## 6.1 Where conflicts come from

Any system that accepts writes at more than one replica without coordinating (multi-leader replication across regions, leaderless Dynamo-style stores, offline-first mobile apps, collaborative editors) will receive **concurrent** writes to the same data. Something must decide the result.

| Strategy | How | Loses data? | Used by |
|---|---|---|---|
| Last-write-wins (LWW) | Keep the write with the highest timestamp | Yes, silently (Chapter 2) | Cassandra, many caches |
| Siblings + application merge | Keep all concurrent versions (vector clocks detect them); the application merges on read | No, but every reader must merge | Riak, original Dynamo |
| CRDTs | Data types whose merge is mathematically guaranteed to converge | No (within the type's semantics) | Riak data types, Redis Enterprise active-active, Automerge, Yjs |
| Operational transformation | Transform concurrent edits against each other through a server | No | Google Docs |
| Avoid conflicts | Route all writes for a key to one home replica | No | Most multi-region SQL setups |

## 6.2 The merge laws

A **state-based CRDT** (convergent replicated data type) gives each replica a full state and a `merge` function. If merge is

- **commutative**: merge(a, b) = merge(b, a),
- **associative**: merge(merge(a, b), c) = merge(a, merge(b, c)), and
- **idempotent**: merge(a, a) = a,

then replicas that exchange states in **any order, any number of times, with duplicates**, converge to the same state once they have seen the same updates. Mathematically, the states form a join-semilattice and merge is the least upper bound. This is why CRDTs tolerate exactly the network the previous chapters fought against.

The DBMS guide, §9.2, builds a grow-only counter (G-counter). A **PN-counter** supports decrements by pairing two G-counters, one for increments and one for decrements.

```python run A PN-counter, and the merge laws checked on random states
import random

class PNCounter:
    def __init__(self, node, p=None, n=None):
        self.node, self.p, self.n = node, dict(p or {}), dict(n or {})
    def inc(self, k=1): self.p[self.node] = self.p.get(self.node, 0) + k
    def dec(self, k=1): self.n[self.node] = self.n.get(self.node, 0) + k
    def value(self): return sum(self.p.values()) - sum(self.n.values())
    def merge(self, other):
        keys = lambda a, b: set(a) | set(b)
        return PNCounter(self.node, {k: max(self.p.get(k, 0), other.p.get(k, 0))
                for k in keys(self.p, other.p)},
                         {k: max(self.n.get(k, 0), other.n.get(k, 0)) for k in keys(self.n,
                                 other.n)})
    def state(self): return (tuple(sorted(self.p.items())), tuple(sorted(self.n.items())))

rng = random.Random(6)
def random_counter():
    c = PNCounter('x')
    for node in 'ABC':
        c.p[node], c.n[node] = rng.randint(0, 9), rng.randint(0, 9)
    return c
laws = {'commutative': 0, 'associative': 0, 'idempotent': 0}
for _ in range(1000):
    a, b, c = random_counter(), random_counter(), random_counter()
    laws['commutative'] += a.merge(b).state() == b.merge(a).state()
    laws['associative'] += a.merge(b).merge(c).state() == a.merge(b.merge(c)).state()
    laws['idempotent'] += a.merge(a).state() == a.state()
print('laws holding in 1000 random trials:', ', '.join(f'{k} {v}' for k, v in laws.items()))

# three replicas count stock movements concurrently, then gossip in a random order
reps = {n: PNCounter(n) for n in 'ABC'}
reps['A'].inc(10); reps['B'].dec(3); reps['C'].inc(5); reps['A'].dec(2); reps['C'].dec(1)
exchanges = 0
while len({r.state() for r in reps.values()}) > 1 and exchanges < 100:
    x, y = rng.sample('ABC', 2)
    reps[y] = reps[y].merge(reps[x])                  # one-way gossip, random pairs
    exchanges += 1
print(f'converged after {exchanges} random one-way exchanges:',
      {n: r.value() for n, r in reps.items()}, '(10 - 3 + 5 - 2 - 1 = 9)')
```

## 6.3 Registers and sets

| CRDT | State | Merge | Semantics |
|---|---|---|---|
| G-counter | Map node → count | Element-wise max | Increment only |
| PN-counter | Two G-counters | Merge each | Increment and decrement |
| LWW-register | (timestamp, value) | Keep the higher timestamp (ties by node ID) | Last writer wins; concurrent writes lost by design |
| MV-register | Set of (version vector, value) | Keep values not dominated by another | Keeps all concurrent values (siblings) |
| G-set | Set | Union | Add only |
| 2P-set | Added set + removed set (tombstones) | Union both | Remove wins; an element cannot be re-added |
| OR-set (observed-remove) | Each add has a unique tag; remove deletes the tags it has **observed** | Union of adds, union of removed tags | Add wins over a concurrent remove; re-adding works |

The OR-set solves the famous shopping-cart anomaly from the Dynamo paper, where a deleted item reappeared after a merge. The program compares a naive union-merged set with an OR-set when one replica removes an item while another concurrently adds a second unit of it.

```python run Naive set union versus an observed-remove set
import itertools
tag_counter = itertools.count(1)

class ORSet:
    def __init__(self):
        self.adds, self.removed = set(), set()          # adds: (element, tag)
    def add(self, e):
        self.adds.add((e, next(tag_counter)))
    def remove(self, e):                                 # remove only the tags seen here
        self.removed |= {(x, t) for x, t in self.adds if x == e}
    def merge(self, other):
        m = ORSet()
        m.adds, m.removed = self.adds | other.adds, self.removed | other.removed
        return m
    def value(self):
        return sorted({x for x, t in self.adds - self.removed})

# naive: a set merged by union
phone, laptop = {'kettle', 'socks'}, {'kettle', 'socks'}
phone.discard('socks')                                   # remove on the phone
merged = phone | laptop
print('naive union merge          :', sorted(merged), '<- removed socks came back')

# OR-set: same starting cart, replicated to both devices
base = ORSet(); base.add('kettle'); base.add('socks')
phone2, laptop2 = base.merge(ORSet()), base.merge(ORSet())
phone2.remove('socks')                                   # remove on the phone ...
print('OR-set, remove only        :', phone2.merge(laptop2).value())
laptop2.add('socks')   # ... while the laptop adds socks again
print('OR-set, concurrent re-add  :', phone2.merge(laptop2).value(),
        '<- add wins, by design')
print('merge is commutative       :',
        phone2.merge(laptop2).value() == laptop2.merge(phone2).value())
```

The naive union cannot tell "never had socks" from "removed socks", so the remove is undone by the merge. The OR-set removes exactly the instances the phone had seen; the laptop's new add has a fresh tag that the phone never observed, so it survives. Whether add or remove should win is a product decision; the point is that the outcome is defined and identical on every replica.

## 6.4 Costs and collaborative editing

| Issue | Detail |
|---|---|
| Metadata growth | Tags and tombstones accumulate; removing them safely needs to know every replica has seen the removal (causal stability), which requires coordination |
| State size on the wire | Shipping whole states is expensive; **delta-state CRDTs** send only recent changes, still mergeable with the same laws |
| Not every invariant fits | "Balance never below zero" or "username unique" need coordination; CRDTs cannot enforce invariants that depend on the global state |
| Text editing | Sequence CRDTs (RGA, Logoot, YATA in Yjs, Automerge) give each character a unique, ordered identifier so concurrent inserts interleave deterministically |

## 6.5 Practical lessons

- Concurrent writes at several replicas are inevitable in multi-leader, leaderless and offline systems.
- Merges that are commutative, associative and idempotent converge under any delivery order.
- Use PN-counters for counts, OR-sets for collections with removal, MV-registers to keep siblings.
- CRDTs cannot enforce global invariants (uniqueness, non-negative balances); those still need consensus.

# Chapter 7: Gossip, Membership and Anti-Entropy
%Epidemic dissemination, the SWIM membership protocol, and finding differences between replicas with Merkle trees

## 7.1 Gossip spreads information in logarithmic rounds

In a **gossip** (epidemic) protocol, every node periodically picks a few random peers and exchanges what it knows. There is no coordinator and no single point of failure; information reaches everyone in O(log N) rounds with high probability, and the protocol tolerates message loss and node failures naturally. Cassandra, Consul (Serf), Redis Cluster and Amazon's S3 use gossip for membership, failure information and metadata.

```python run Rounds for a rumour to reach every node
import math, random

def spread(n, fanout, p_loss=0.0, seed=2, max_rounds=200):
    rng = random.Random(seed)
    informed, rounds, messages = {0}, 0, 0
    while len(informed) < n and rounds < max_rounds:
        rounds += 1
        new = set()
        for node in informed:
            for peer in rng.sample(range(n), fanout):
                messages += 1
                if rng.random() >= p_loss:
                    new.add(peer)
        informed |= new
    return rounds, messages

for n in [100, 1_000, 10_000]:
    row = []
    for fanout in [1, 2, 3]:
        r, m = spread(n, fanout)
        row.append(f'fanout {fanout}: {r:2} rounds')
    print(f'N={n:6} (log2 N = {math.log2(n):4.1f}): ' + ', '.join(row))
r, m = spread(1_000, 2, p_loss=0.3)
print(f'N=  1000, fanout 2, 30% message loss: {r} rounds, {m:,} messages')
```

Rounds grow with log N: a hundred times more nodes roughly doubles the rounds (7 → 13 with fanout 2), and 30% message loss adds only two rounds at N = 1,000. The price is redundancy: late in the spread, most messages go to nodes that already know. Gossip is therefore ideal for small, important facts (membership, schema versions, failure suspicions), not bulk data.

## 7.2 SWIM: membership and failure detection

Heartbeating every node to every other node costs O(N²) messages. **SWIM** (Das, Gupta and Motivala, 2002), used by Consul, Serf and HashiCorp's memberlist, scales by having each node probe one random member per period:

1. Node A sends `ping` to a random member B.
2. If no `ack` arrives in time, A asks *k* other members to `ping-req` B on its behalf (indirect probes, which route around a lossy link between A and B).
3. If nobody gets an ack, B is marked **suspect** (not dead), and the suspicion is gossiped; B can refute it by gossiping an alive message with a higher incarnation number.
4. Only after a suspicion timeout is B declared dead.

```python run How indirect probes cut false suspicions on a lossy network
import random

def false_suspicion_rate(p_loss, k, trials=200_000, seed=5):
    rng = random.Random(seed)
    lost = lambda: rng.random() < p_loss
    false = 0
    for _ in range(trials):                             # B is alive in every trial
        if not (lost() or lost()):                       # direct ping and ack
            continue
        ok = False
        for _ in range(k):   # A->helper, helper->B, B->helper, helper->A
            if not (lost() or lost() or lost() or lost()):
                ok = True
                break
        false += not ok
    return false / trials

for p in [0.01, 0.05, 0.10]:
    rates = ', '.join(f'k={k}: {false_suspicion_rate(p, k):.4%}' for k in [0, 1, 3])
    print(f'loss {p:4.0%}, false suspicion per probe: {rates}')
```

With 5% packet loss, a direct ping alone wrongly suspects a live node in nearly 10% of probes; three indirect probes cut that by roughly two orders of magnitude, and the suspicion stage with refutation absorbs most of the rest. Probe load per node stays constant as the cluster grows, and detection time is independent of N.

## 7.3 Anti-entropy with Merkle trees

Replicas drift apart: hinted handoffs expire, read repair touches only keys that are read, nodes come back after long outages. **Anti-entropy** compares whole replicas in the background. Comparing every key would move the whole data set across the network; a **Merkle tree** (hash tree) compares hashes instead: each leaf hashes a range of keys, each parent hashes its children, and two replicas compare roots first, descending only into subtrees whose hashes differ. Cassandra (`nodetool repair`), DynamoDB, Riak and Git use the same idea.

```python run Finding 3 differing keys among 65,536 by comparing hashes
import hashlib, random

def h(*parts):
    return hashlib.sha256('|'.join(parts).encode()).hexdigest()[:16]

def build(data, leaves=1024):
    buckets = [[] for _ in range(leaves)]
    for k in sorted(data):
        buckets[k % leaves].append(f'{k}={data[k]}')
    level = [h(*b) for b in buckets]
    tree = [level]
    while len(level) > 1:
        level = [h(level[i], level[i + 1]) for i in range(0, len(level), 2)]
        tree.append(level)
    return tree[::-1]                                  # tree[0] is the root level

def diff(t1, t2):
    compared, frontier = 0, [0]
    for depth in range(len(t1)):
        nxt = []
        for i in frontier:
            compared += 1
            if t1[depth][i] != t2[depth][i]:
                nxt += [2 * i, 2 * i + 1] if depth + 1 < len(t1) else [i]
        frontier = nxt
    return frontier, compared

rng = random.Random(9)
a = {k: rng.randrange(10**6) for k in range(65_536)}
b = dict(a)
for k in rng.sample(range(65_536), 3):
    b[k] += 1                                          # replica b missed three updates
leaves, compared = diff(build(a), build(b))
keys_to_check = sum(1 for k in a if k % 1024 in leaves)
print(f'hashes compared: {compared} (instead of 65,536 key comparisons)')
print(f'differing leaf ranges: {sorted(leaves)}, keys in them to exchange: {keys_to_check}')
print('the differing keys are inside those ranges:',
      all(k % 1024 in leaves for k in a if a[k] != b[k]))
```

Three differences among 65,536 keys are found by comparing a few dozen hashes, and only the 192 keys in the three affected leaf ranges need to be exchanged. The cost of the scheme is keeping the trees up to date as data changes, which is why systems rebuild them during scheduled repairs.

## 7.4 The repair toolbox

| Mechanism | When it runs | Repairs |
|---|---|---|
| Read repair | On a read that sees stale replicas | Only keys that are read |
| Hinted handoff | A replica is down during a write; another node stores a hint and replays it later | Writes during short outages |
| Anti-entropy (Merkle trees) | Background or scheduled | Everything, eventually |
| Gossip of membership | Continuously | Who is in the cluster and who is suspected |

See the DBMS guide, §9.3, for quorum reads and writes, and the HLD guide for consistent hashing, which decides which replicas own each key.

## 7.5 Practical lessons

- Gossip reaches N nodes in O(log N) rounds and tolerates loss; use it for small, important facts.
- SWIM keeps probe load constant per node; indirect probes and suspicion cut false positives.
- Merkle trees find differences between replicas by comparing hashes, not data.
- Combine read repair, hinted handoff and anti-entropy; each covers the others' gaps.
