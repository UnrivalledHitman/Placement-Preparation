## Part 3 solutions

### R3.1 Sizing and placing a cluster

Tolerating *f* = 2 failures needs 2*f* + 1 = **5 voters** (a majority of 3 must survive).

```python run Zone failures and flexible quorums
def survives_zone_loss(placement):
    n = sum(placement)
    majority = n // 2 + 1
    return all(n - zone >= majority for zone in placement)

for placement in [(2, 2, 1), (2, 2), (3, 2), (1, 1, 1)]:
    n = sum(placement)
    print(f'{n} voters as {"-".join(map(str, placement)):6}: majority {n // 2 + 1}, '
          f'survives losing any one zone: {survives_zone_loss(placement)}')
n, q2 = 6, 2
q1 = n - q2 + 1
print(f'Flexible Paxos, N={n}: replication quorum {q2} requires an election quorum of {q1}')
```

With 2–2–1 across three zones, losing any zone leaves at least 3 of 5 voters, so the cluster keeps working. With 2–2 across two zones, losing either zone leaves 2 of 4, short of the majority of 3: a two-zone deployment cannot survive a zone failure automatically, whatever the node count. Three zones (or a small tie-breaker voter in a third location) are needed. With Flexible Paxos and N = 6, a replication quorum of 2 (fast writes) forces an election quorum of 5, so electing a new leader needs almost every node.

### R3.2 What must the proposer propose?

```python run The value rule of phase 2a
acceptors = {'A1': (20, (20, 'Y')), 'A2': (20, (20, 'Y')), 'A3': (10, (10, 'X')),
             'A4': (0, None), 'A5': (0, None)}

def phase1(ballot, responders, own='Z'):
    promises = []
    for a in responders:
        promised, accepted = acceptors[a]
        if ballot > promised:
            promises.append(accepted)
    if len(promises) < 3:
        return None, 'no majority of promises'
    prior = [x for x in promises if x]
    value = max(prior)[1] if prior else own
    return value, f'promises {promises} -> must propose {value!r}'

for responders in [('A3', 'A4', 'A5'), ('A1', 'A3', 'A4')]:
    print(responders, phase1(30, responders)[1])
votes_for_y = sum(1 for _, acc in acceptors.values() if acc and acc[1] == 'Y')
print(f'Y was accepted by {votes_for_y} of 5 acceptors: chosen = {votes_for_y >= 3}')
```

From A3, A4 and A5 the highest accepted ballot is (10, X), so the proposer **must** propose X, not its own value. That is safe even though Y has more accepts: Y was accepted only by A1 and A2, two of five, so it was never chosen, and it can no longer be chosen at ballot 20 because A3, A4 and A5 have now promised ballot 30. If the proposer hears from A1, A3 and A4 instead, the highest accepted is (20, Y) and it must propose Y. Either way, whatever might have been chosen is carried forward.

### R3.3 Faster log repair

```python run One-step backtracking versus the conflict-term optimisation
leader = [1, 1, 1, 4, 4, 5, 5, 6, 6, 6]
follower0 = [1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3]

def check(log, prev):
    """Follower's reply: (ok, conflict_term, first index of that term)."""
    if prev == 0 or (len(log) >= prev and log[prev - 1] == leader[prev - 1]):
        return True, None, None
    if len(log) < prev:
        return False, None, len(log) + 1
    term = log[prev - 1]
    first = next(i + 1 for i, t in enumerate(log) if t == term)
    return False, term, first

for optimised in [False, True]:
    log, next_index, rpcs = follower0[:], len(leader) + 1, 0
    while rpcs < 50:
        rpcs += 1
        prev = next_index - 1
        ok, term, first = check(log, prev)
        if ok:
            log = log[:prev] + leader[prev:]
            break
        if not optimised:
            next_index -= 1
        elif term is not None and term in leader:
            next_index = max(i + 1 for i, t in enumerate(leader) if t == term) + 1
        else:
            next_index = first   # skip the follower's whole conflicting term
    print(f'{"conflict-term" if optimised else "one step":13}: {rpcs} AppendEntries, '
          f'repaired: {log == leader}')
```

One-step backtracking tries every index from 10 down to 3. With the optimisation, the follower's reply "conflict at term 3, which starts at index 8" lets the leader skip all of term 3 at once, then all of term 2, and match at index 3 on the third call. The optimisation matters when a follower has been partitioned away with a long run of uncommitted entries from a stale leader.

### R3.4 Computing the commit index

```python run Correct versus naive commit rule
log_terms = [1, 1, 3, 3, 5]                           # indexes 1..5
current_term, leader_match = 5, 5

def commit(followers, correct=True):
    matches = sorted([leader_match] + followers, reverse=True)
    for n in range(len(log_terms), 0, -1):
        on_majority = sum(m >= n for m in matches) >= 3
        if on_majority and (not correct or log_terms[n - 1] == current_term):
            return n
    return 0

for name, f in [('(a)', [4, 4, 2, 1]), ('(b)', [5, 4, 2, 1]), ('(c)', [5, 5, 4, 4])]:
    print(f'{name} followers {f}: naive commit index {commit(f, False)}, '
          f'correct commit index {commit(f, True)}')
```

In (a) and (b), index 4 is stored on a majority, but it holds a term-3 entry and the leader is in term 5; the naive rule would commit it, and as the guide's Figure 8 replay showed, a different leader could still overwrite it. The correct rule commits nothing new until the term-5 entry at index 5 is on a majority, which happens in (c); committing index 5 then commits indexes 1–4 as well, by Log Matching. (Index 0 here means "nothing beyond what was committed before".)

### R3.5 Who can win the election?

```python run Votes under the election restriction
logs = {'S1': [1, 1, 2], 'S2': [1, 1, 2, 2], 'S3': [1, 1, 3], 'S4': [1, 1], 'S5': [1, 1, 2,
        2, 2]}

def up_to_date(cand, voter):
    c, v = logs[cand], logs[voter]
    return c[-1] > v[-1] or (c[-1] == v[-1] and len(c) >= len(v))

for cand in logs:
    voters = [v for v in logs if up_to_date(cand, v)]
    print(f'{cand} {str(logs[cand]):17} votes from {voters} -> '
          f'{"can win" if len(voters) >= 3 else "cannot win"}')
```

S3 has the highest last term (3) and can collect every vote, although its log is short; S5 and S2 can also win. S1 and S4 cannot. If S3 wins, its term-3 entry at index 3 replaces the term-2 entries that S2 and S5 hold there, which is safe only because those term-2 entries were never committed. Had any of them been committed, a majority would hold it, and S3, missing it, could not have collected a majority of votes. That is the election restriction doing its job.

### R3.6 A partitioned Raft cluster

| Side | What happens |
|---|---|
| {S1, S2} (old leader, minority) | S1 keeps believing it is leader for a while and accepts client writes, but can replicate them only to S2: 2 of 5 is not a majority, so **nothing commits** and clients time out. With leader leases or check-quorum, S1 steps down once it has not heard from a majority within an election timeout |
| {S3, S4, S5} (majority) | Their election timeouts fire; one of them wins an election in term 2 with 3 votes and commits new writes normally |
| Clients | Writes sent to S1 hang or fail; clients retry and find the new leader (through redirects or discovery) |
| When the partition heals | S1 and S2 see term 2, step down to followers, and the new leader's AppendEntries overwrite the uncommitted entries S1 had accepted. Clients whose writes timed out must retry, so writes must be idempotent |

The minority side never confirms a write that could be lost: that is consistency over availability (CP in CAP terms).

## Part 4 solutions

### R4.1 2P-set versus OR-set

```python run Re-adding and concurrent add/remove
import itertools
tags = itertools.count(1)

class TwoPSet:
    def __init__(self): self.added, self.removed = set(), set()
    def add(self, e): self.added.add(e)
    def remove(self, e):
        if e in self.added: self.removed.add(e)
    def merge(self, o):
        m = TwoPSet()
        m.added, m.removed = self.added | o.added, self.removed | o.removed
        return m
    def value(self): return sorted(self.added - self.removed)

class ORSet:
    def __init__(self): self.adds, self.removed = set(), set()
    def add(self, e): self.adds.add((e, next(tags)))
    def remove(self, e): self.removed |= {(x, t) for x, t in self.adds if x == e}
    def merge(self, o):
        m = ORSet()
        m.adds, m.removed = self.adds | o.adds, self.removed | o.removed
        return m
    def value(self): return sorted({x for x, t in self.adds - self.removed})

for cls in [TwoPSet, ORSet]:
    s = cls(); s.add('milk'); s.remove('milk'); s.add('milk')
    print(f'{cls.__name__:7} add, remove, add again -> {s.value()}')
    base = cls(); base.add('milk')
    r1, r2 = base.merge(cls()), base.merge(cls())
    r1.remove('milk')                                 # replica 1 removes ...
    r2.add('milk')                                    # ... replica 2 adds concurrently
    print(f'{cls.__name__:7} concurrent remove and add -> {r1.merge(r2).value()}')
```

The 2P-set's tombstone is permanent: once removed, milk can never come back, and a concurrent add loses (remove wins). The OR-set removes only the add tags it observed, so a re-add or a concurrent add with a fresh tag survives (add wins).

### R4.2 Siblings with an MV-register

```python run A multi-value register with version vectors
def dominates(a, b):
    keys = set(a) | set(b)
    return all(a.get(k, 0) >= b.get(k, 0) for k in keys) and a != b

class MVRegister:
    def __init__(self, replica):
        self.replica, self.values = replica, []        # list of (vector, value)
    def read(self):
        return [v for _, v in self.values], self.context()
    def context(self):
        ctx = {}
        for vec, _ in self.values:
            for k, c in vec.items():
                ctx[k] = max(ctx.get(k, 0), c)
        return ctx
    def write(self, value, ctx):
        vec = dict(ctx); vec[self.replica] = vec.get(self.replica, 0) + 1
        self.values = [(vec, value)]
        return vec
    def merge(self, other):
        allv = self.values + other.values
        keep = [(v, x) for v, x in allv if not any(dominates(w, v) for w, _ in allv)]
        self.values = list({tuple(sorted(v.items())): (v, x) for v, x in keep}.values())

x, y = MVRegister('X'), MVRegister('Y')
x.write('cart: kettle', {}); y.merge(x)                      # both replicas start in sync
_, ctx = x.read()
x.write('cart: kettle, socks', ctx)                          # client 1 via X
y.write('cart: kettle, mug', ctx)                            # client 2 via Y, concurrently
x.merge(y); y.merge(x)
print('after sync, siblings:', sorted(x.read()[0]))
values, ctx = x.read()
x.write('cart: kettle, mug, socks', ctx)                     # client 3 merges and writes
y.merge(x)
print('after the merged write: X', x.read()[0], '| Y', y.read()[0])
```

The two concurrent writes have incomparable vectors ({X: 2} and {X: 1, Y: 1}), so both survive as siblings. The third client read both, so its write's vector ({X: 3, Y: 1}) dominates both, and every replica that merges it discards them. This is what Riak and the original Dynamo did, with the application doing the merge.

### R4.3 Gossip at scale

```python run Push gossip to 5,000 nodes with fanout 3
import math, random
rng = random.Random(14)
n, fanout = 5_000, 3
print(f'estimate: about log4({n}) = {math.log(n, 4):.1f} rounds plus a few for stragglers')
informed, rounds, messages = {0}, 0, 0
while len(informed) < n and rounds < 100:
    rounds += 1
    new = set()
    for node in informed:
        new.update(rng.sample(range(n), fanout))
        messages += fanout
    informed |= new
    if rounds <= 6 or len(informed) == n:
        print(f'round {rounds:2}: {len(informed):5} informed')
print(f'all informed after {rounds} rounds; {messages:,} messages, {messages / n:.1f} per '
        f'node')
```

The early rounds roughly quadruple the informed set (each informed node informs up to three more), matching the estimate, but reaching the last 2,379 nodes takes four more rounds (6 to 10), because random targets increasingly hit nodes that already know. On average each node sends about 11 messages in total. Real systems combine push with **pull** in the late phase (uninformed nodes ask), which finishes the tail much faster.

### R4.4 SWIM by formula

A live node is falsely suspected only if the direct probe fails **and** all *k* indirect probes fail. The direct probe needs two messages (ping, ack), so it fails with 1 − (1 − *p*)<sup>2</sup>; an indirect probe needs four (A→helper, helper→B, B→helper, helper→A), so it fails with 1 − (1 − *p*)<sup>4</sup>:

P(false suspicion) = [1 − (1 − *p*)<sup>2</sup>] × [1 − (1 − *p*)<sup>4</sup>]<sup>*k*</sup>

```python run Formula against the guide's simulated values
guide = {(0.05, 0): 0.097530, (0.05, 1): 0.018020, (0.05, 3): 0.000660,
         (0.10, 0): 0.190375, (0.10, 1): 0.065670, (0.10, 3): 0.007825}
for (p, k), simulated in guide.items():
    exact = (1 - (1 - p) ** 2) * (1 - (1 - p) ** 4) ** k
    print(f'p={p:.2f} k={k}: formula {exact:.4%}, simulated {simulated:.4%}')
```

The formula matches the 200,000-trial simulation to within sampling error. It also shows why indirect probes are so effective: each one multiplies the false-suspicion rate by roughly 4*p*, so three of them at 5% loss divide it by about 150.

### R4.5 How Merkle comparison scales

```python run Hashes compared as the number of differences grows
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
    return tree[::-1]

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

rng = random.Random(3)
a = {k: rng.randrange(10**6) for k in range(65_536)}
ta = build(a)
for changed in [1, 10, 100, 1000]:
    b = dict(a)
    for k in rng.sample(range(65_536), changed):
        b[k] += 1
    leaves, compared = diff(ta, build(b))
    print(f'{changed:5} differing keys: {compared:5} hashes compared, {len(leaves):4} of '
            f'1024 '
          f'ranges ({len(leaves) * 64:,} keys) to exchange')
```

One difference costs one root-to-leaf path (about 2 hashes per level over 11 levels) and 64 keys of transfer. The cost grows roughly linearly with the number of differences until differences hit most ranges: with 1,000 differing keys, 648 of the 1,024 ranges differ, the tree compares about 1,900 hashes, and 63% of the data set must be exchanged anyway. Merkle trees pay off when replicas are mostly in sync, which is the normal case for anti-entropy; after a long outage, a full transfer (or a snapshot) is simpler.

### R4.6 Fault-tolerance budgets

```python run Nodes and messages for crash and Byzantine tolerance
for f in [1, 2, 3]:
    crash, byz = 2 * f + 1, 3 * f + 1
    print(f'f={f}: crash faults need {crash} nodes ({crash * (crash - 1)} msgs '
            f'all-to-all), '
          f'Byzantine need {byz} ({byz * (byz - 1)} msgs)')
```

Byzantine tolerance costs f extra nodes and, because of all-to-all relaying, roughly twice the messages per round at f = 3. With signatures (as in PBFT's authenticated variant and modern BFT protocols such as HotStuff) message complexity can be reduced, but the 3f + 1 node bound remains for asynchronous BFT consensus.

### R4.7 Likes and usernames, worldwide

| Aspect | (a) Like counter | (b) Username registry |
|---|---|---|
| Consistency needed | Eventual; a count that is a few seconds stale is fine | Linearizable: two users must never get the same name |
| Mechanism | PN-counter CRDT per post (or per-region counters summed on read); each region accepts likes locally and replicates asynchronously | One consensus group (Raft/Paxos) spanning the three regions (e.g. Spanner, CockroachDB, or etcd for small scale), or a single home region per name prefix |
| Write latency | Local (milliseconds) | Cross-region quorum round trip (tens to hundreds of ms); acceptable for a rare sign-up action |
| During a partition | Every region keeps accepting likes; counts differ briefly and converge after healing, with no lost likes | The majority side can register names; a region cut off from the majority must refuse or queue sign-ups ("try again shortly"), never decide alone |
| Unlike / double-like | Store per-user like state as an OR-set or a keyed record so a user cannot be counted twice | Reserve with a short lease, confirm on completion, release on abandonment |

The pattern is the guide's core lesson: use coordination only where an invariant requires a single decision (uniqueness), and let everything that can merge, merge.
