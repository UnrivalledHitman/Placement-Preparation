# Chapter 9: Distributed Databases and NoSQL
%Replication, quorums, partitioning, CAP and PACELC, two-phase commit, consistency models and the NoSQL families

## 9.1 Why distribute data

| Goal | Technique | Cost |
|---|---|---|
| Survive machine failures (availability) | Replication: copies on several nodes | Keeping copies consistent |
| Serve more reads | Read replicas | Replication lag: stale reads |
| Store more data / handle more writes than one machine can | Partitioning (sharding) | Cross-partition queries and transactions |
| Lower latency for users far away | Geo-replication | Conflicts between regions |

Everything in this chapter is a trade-off between **consistency**, **availability**, **latency** and **complexity**. The System Design guide applies these ideas to full designs; here we study the mechanisms.

## 9.2 Replication

| Strategy | How writes flow | Strength | Weakness | Examples |
|---|---|---|---|---|
| Single leader (primary–replica) | All writes go to the leader, which streams its log to followers | Simple; no write conflicts | Leader is a bottleneck and a single point of failure until failover | MySQL, PostgreSQL replication, MongoDB replica sets |
| Multi-leader | Several nodes accept writes and replicate to each other | Writes in every region; tolerates network partitions | **Write conflicts** must be resolved | Multi-region MySQL setups, CouchDB, collaborative editors |
| Leaderless | Client writes to and reads from several replicas directly (quorums) | No failover needed; high availability | Weaker consistency; read repair and anti-entropy needed | Dynamo, Cassandra, Riak |

**Synchronous** replication waits for followers before confirming a write (no data loss on leader failure, but slower and blocked if a follower is down). **Asynchronous** replication confirms immediately (fast, but recent writes are lost if the leader dies, and followers lag).

### Replication lag in action

With asynchronous replication, a user who updates their profile and immediately reloads the page from a follower may not see their own change. The simulation below sends writes to a leader and reads to a follower that applies changes after a random delay.

```python run Asynchronous replication: stale reads and read-your-writes
import random
rng = random.Random(42)

def simulate(read_from_leader_after_write=False, trials=10_000):
    stale = 0
    for _ in range(trials):
        lag_ms = rng.expovariate(1 / 40)          # follower lag, mean 40 ms
        read_delay_ms = rng.uniform(0, 100)       # user reloads within 100 ms
        if read_from_leader_after_write:
            continue                              # always sees its own write
        if read_delay_ms < lag_ms:
            stale += 1
    return stale / trials

print(f'reads served by a follower      : {simulate():.1%} see the old value')
print(f'own reads from the leader       : {simulate(True):.1%} see the old value')
print('other users reading the follower still see stale data until it catches up')
```

Common fixes for replication-lag anomalies:

| Guarantee | Problem it solves | Technique |
|---|---|---|
| Read-your-writes | User does not see their own update | Read own data from the leader, or wait until the follower has the user's last write position |
| Monotonic reads | User sees data go "back in time" on refresh | Pin each user to one replica |
| Consistent prefix | Reader sees an answer before its question | Write causally related data to the same partition |

### Write conflicts in multi-leader systems

When two leaders accept conflicting writes, the system must **converge** to one value:

- **Last write wins (LWW)**: keep the write with the larger timestamp. Simple, but silently discards data, and clock skew decides which write is "last".
- **Version vectors**: detect concurrent writes and keep both as siblings for the application to merge.
- **CRDTs** (conflict-free replicated data types): data structures whose merge is commutative, associative and idempotent, so replicas converge automatically. Example: a grow-only counter that keeps one count per replica and sums them.

```python run Last-write-wins loses data; a CRDT counter does not
# two regions each record likes while disconnected, then sync
lww = {'mumbai': (10.0, 5 + 3), 'frankfurt': (10.2, 5 + 4)}       # (timestamp, value)
winner = max(lww.values())
print('LWW counter after sync     :', winner[1], '(true total 5 + 3 + 4 = 12)')

class GCounter:                     # grow-only counter CRDT
    def __init__(self): self.counts = {}
    def inc(self, replica, n=1): self.counts[replica] = self.counts.get(replica, 0) + n
    def merge(self, other):
        for r, c in other.counts.items():
            self.counts[r] = max(self.counts.get(r, 0), c)
    def value(self): return sum(self.counts.values())

base = GCounter(); base.inc('mumbai', 5)
a, b = GCounter(), GCounter()
a.merge(base); b.merge(base)
a.inc('mumbai', 3); b.inc('frankfurt', 4)
a.merge(b); b.merge(a); a.merge(b)         # merging again changes nothing (idempotent)
print('G-counter after sync       :', a.value(), b.value())
```

## 9.3 Quorums in leaderless replication

With N replicas, a write is acknowledged by W of them and a read queries R of them, returning the value with the newest version. If **R + W > N**, every read set overlaps every write set in at least one replica, so a read sees the latest acknowledged write (assuming no concurrent writes and correct versioning).

| Setting (N = 3) | Behaviour |
|---|---|
| W = 3, R = 1 | Fast reads; writes fail if any replica is down |
| W = 1, R = 3 | Fast writes; reads fail if any replica is down |
| W = 2, R = 2 | Balanced; tolerates one failed replica for both |
| W = 1, R = 1 | Fastest and most available, but reads may be stale (R + W ≤ N) |

The simulation writes a new version to W random replicas (the others still hold the old version), then reads from R random replicas.

```python run Quorum overlap: probability of reading the latest write
import random
from itertools import product
rng = random.Random(0)

def p_fresh(n, w, r, trials=20_000):
    fresh = 0
    for _ in range(trials):
        written = set(rng.sample(range(n), w))
        read = set(rng.sample(range(n), r))
        fresh += bool(written & read)
    return fresh / trials

print(f'{"N":>2} {"W":>2} {"R":>2} {"R+W>N":>6} {"fresh reads":>12}')
for n, w, r in [(3, 1, 1), (3, 1, 2), (3, 2, 2), (3, 3, 1), (5, 2, 2), (5, 3, 3), (5, 1,
        5)]:
    print(f'{n:>2} {w:>2} {r:>2} {str(r + w > n):>6} {p_fresh(n, w, r):>12.1%}')
```

Whenever R + W > N the result is 100%; below that, stale reads appear, and they become common when R = W = 1. Dynamo-style systems also use **sloppy quorums** and **hinted handoff** (accept writes on substitute nodes during failures), plus **read repair** and **anti-entropy** with Merkle trees to bring replicas back in sync.

> TRAP: R + W > N does not give full linearisability. Concurrent writes, sloppy quorums and clock-based conflict resolution can still produce anomalies. Cassandra's `QUORUM` reads and writes are strong in the common case, not in every case.

## 9.4 Partitioning (sharding)

| Scheme | How keys map to partitions | Strength | Weakness |
|---|---|---|---|
| Range | Key ranges per partition (A–F, G–M, …) | Efficient range scans | **Hot spots**: e.g. all of today's timestamps go to one partition |
| Hash (mod N) | partition = hash(key) mod N | Even spread | Range scans hit every partition; changing N moves almost every key |
| Consistent hashing | Keys and nodes on a hash ring; a key goes to the next node clockwise (with virtual nodes) | Adding a node moves only ~1/N of keys | More complex; needs virtual nodes for balance |
| Directory / lookup service | A table maps keys or key ranges to partitions | Fully flexible | The directory must itself be fast and highly available |

Consistent hashing was introduced briefly in the Computer Networks practice book and is studied in depth (hot keys, rebalancing) in the System Design guide. The program below shows the core reason it exists.

```python run Keys moved when a fifth node joins
import hashlib, bisect

def h(s):
    return int(hashlib.md5(s.encode()).hexdigest(), 16)

keys = [f'user:{i}' for i in range(20_000)]

def mod_assign(n):
    return {k: h(k) % n for k in keys}

def ring_assign(nodes, vnodes=100):
    ring = sorted((h(f'{node}#{v}'), node) for node in nodes for v in range(vnodes))
    points = [p for p, _ in ring]
    return {k: ring[bisect.bisect(points, h(k)) % len(ring)][1] for k in keys}

before, after = mod_assign(4), mod_assign(5)
moved = sum(before[k] != after[k] for k in keys) / len(keys)
print(f'hash mod N, 4 -> 5 nodes     : {moved:.1%} of keys move')
before = ring_assign(['n1', 'n2', 'n3', 'n4'])
after = ring_assign(['n1', 'n2', 'n3', 'n4', 'n5'])
moved = sum(before[k] != after[k] for k in keys) / len(keys)
print(f'consistent hashing, 4 -> 5   : {moved:.1%} of keys move (ideal 1/5 = 20%)')
load = {n: list(after.values()).count(n) / len(keys) for n in sorted(set(after.values()))}
print('load per node after joining  :', {n: f'{v:.1%}' for n, v in load.items()})
```

**Secondary indexes** on partitioned data come in two forms: **local** (each partition indexes its own rows, so a query by the secondary key must ask every partition: scatter–gather) and **global** (the index itself is partitioned by the indexed value, so reads hit one index partition, but each write may update index partitions on other nodes, usually asynchronously).

## 9.5 CAP and PACELC

The **CAP theorem** (Brewer, proved by Gilbert and Lynch) says that when a **network partition** occurs, a distributed system must choose between:

- **Consistency** (linearisability): every read sees the latest write, as if there were one copy.
- **Availability**: every request to a non-failed node gets a (non-error) response.

Partitions are not optional in real networks, so the real choice is C or A **during a partition**. **PACELC** completes the picture: if there is a **P**artition, choose **A** or **C**; **E**lse (normal operation), choose **L**atency or **C**onsistency.

| System (typical configuration) | During a partition | Normally | PACELC |
|---|---|---|---|
| Relational DB with synchronous replication | Refuses writes on the minority side (C) | Waits for replicas (C) | PC/EC |
| MongoDB (majority writes and reads) | Minority side cannot elect a primary (C) | Prefers consistency | PC/EC |
| Cassandra, DynamoDB (default settings) | Keeps accepting reads and writes (A) | Low latency, tunable consistency | PA/EL |
| Zookeeper, etcd (consensus) | Minority side unavailable (C) | Consistent reads via the leader | PC/EC |
| DNS, CDN caches | Serve possibly stale data (A) | Fast cached answers | PA/EL |

> TIP: In interviews, avoid saying "MongoDB is CP" as a fixed fact. Say "with majority write and read concern it behaves as CP; with weaker settings it trades consistency for latency". Most systems are tunable.

## 9.6 Distributed transactions: two-phase commit

When a transaction updates data on several nodes, all must commit or all must abort. **Two-phase commit (2PC)** uses a coordinator:

1. **Prepare (voting) phase**: the coordinator sends PREPARE. Each participant writes its changes and a *prepared* record to its log, then votes YES, or votes NO and aborts.
2. **Commit phase**: if all voted YES, the coordinator logs COMMIT and sends COMMIT; otherwise it logs ABORT and sends ABORT. Participants obey and acknowledge.

Once a participant votes YES it has given up the right to abort on its own: it must wait for the coordinator's decision. If the coordinator crashes at that moment, prepared participants are **blocked** (in doubt), holding locks, until it recovers. That blocking is 2PC's famous weakness.

```python run Two-phase commit with failures
def two_pc(votes, coordinator_crashes_after_prepare=False):
    log = ['coordinator: PREPARE -> ' + ', '.join(votes)]
    prepared = [p for p, v in votes.items() if v == 'yes']
    for p, v in votes.items():
        log.append(f'  {p}: votes {v.upper()}' + (' (logs PREPARED, holds locks)'
                if v == 'yes' else
                                                 ' (aborts locally)'))
    if coordinator_crashes_after_prepare:
        log.append('coordinator: CRASH before deciding')
        log += [f'  {p}: in doubt, BLOCKED until the coordinator recovers'
                for p in prepared]
        return log
    decision = 'COMMIT' if all(v == 'yes' for v in votes.values()) else 'ABORT'
    log.append(f'coordinator: logs {decision}, sends {decision}')
    log += [f'  {p}: {decision.lower()}s and releases locks' for p in prepared]
    return log

for title, kwargs in [('all vote yes', dict(votes={'bank_A': 'yes', 'bank_B': 'yes'})),
                      ('one votes no', dict(votes={'bank_A': 'yes', 'bank_B': 'no'})),
                      ('coordinator crash', dict(votes={'bank_A': 'yes', 'bank_B': 'yes'},
                                                 coordinator_crashes_after_prepare=True))]:
    print(f'--- {title} ---'); print('\n'.join(two_pc(**kwargs)))
```

| Approach | Idea | Trade-off |
|---|---|---|
| 2PC | Coordinator collects votes, then decides | Blocking if the coordinator fails after PREPARE |
| 3PC | Adds a pre-commit phase so participants can decide among themselves | Non-blocking only with bounded network delays; rarely used |
| Consensus-backed commit (Paxos/Raft commit, Spanner) | Replicate the coordinator's decision with consensus | No single point of blocking; higher latency |
| Sagas | Sequence of local transactions with compensating actions | No global isolation; used in microservices (System Design guide) |

## 9.7 Consistency models

From strongest to weakest:

| Model | Guarantee | Example |
|---|---|---|
| Linearisable (strong) | Operations appear to happen instantly, in real-time order, on one copy | etcd, Spanner, single-leader reads from the leader |
| Sequential | All nodes see operations in the same order (not necessarily real-time) | — |
| Causal | Causally related operations are seen in order by everyone; concurrent ones in any order | A reply is never seen before its question |
| Read-your-writes / monotonic reads | Session guarantees for one client | Profile edits visible to their author |
| Eventual | If writes stop, all replicas eventually converge | DNS, Cassandra with ONE |

**ACID versus BASE**: NoSQL systems were described as **B**asically **A**vailable, **S**oft state, **E**ventually consistent, in contrast to ACID. Modern systems blur the line: MongoDB, DynamoDB and Cassandra offer transactions or tunable consistency, and NewSQL systems (Spanner, CockroachDB, TiDB) provide ACID transactions at scale.

## 9.8 NoSQL families

| Family | Data model | Strengths | Weaknesses | Pick it for | Examples |
|---|---|---|---|---|---|
| Key-value | Key → opaque value | Very fast, trivially partitioned | Lookups by key only | Caches, sessions, rate-limit counters, shopping carts | Redis, DynamoDB, Memcached |
| Document | Key → JSON-like document with nesting | Flexible schema; one read fetches a whole aggregate | Joins and cross-document transactions are harder | Catalogues, user profiles, content management | MongoDB, Couchbase, Firestore |
| Wide-column | Partition key → rows of columns, sorted by clustering key | Massive write throughput; time-ordered data | Queries must follow the designed partition/clustering keys | Time series, IoT sensor data, messaging, event logs | Cassandra, HBase, Bigtable, ScyllaDB |
| Graph | Nodes and edges with properties | Multi-hop traversals (friends of friends) | Large aggregations; partitioning is hard | Social networks, recommendations, fraud rings | Neo4j, Amazon Neptune |
| Time-series | Timestamped measurements | Compression, downsampling, time-window queries | General queries | Monitoring, smart meters | InfluxDB, TimescaleDB, Prometheus |
| Search | Inverted index over documents | Full-text search, relevance ranking, facets | Not a primary store | Product search, log search | Elasticsearch, OpenSearch |

> TIP: For your smart-energy interests: smart-meter readings (a reading per meter every 15 minutes) are a classic wide-column or time-series workload. Partition by meter id, cluster by timestamp, and keep billing data (strongly consistent, relational) in a SQL database. The System Design guide builds this platform end to end.

## 9.9 Practical lessons

- Replication: single leader (simple), multi-leader (conflicts), leaderless (quorums). Know sync versus async.
- R + W > N makes read and write sets overlap; it is the core of tunable consistency.
- Hash partitioning spreads load but `mod N` reshuffles almost everything when N changes; consistent hashing moves about 1/N.
- CAP is about the choice during a partition; PACELC adds the latency/consistency choice in normal operation.
- 2PC is atomic but blocking; sagas trade isolation for availability.
- Choose a NoSQL family by access pattern, not by fashion: write down the queries first.

# Chapter 10: Interview Question Bank and Formula Sheet
%Quick answers for the night before, and every formula in one place

## 10.1 Fundamentals and the relational model

| Question | Core of a good answer |
|---|---|
| Why use a DBMS instead of files? | Shared data: redundancy control, integrity constraints, atomicity across crashes, concurrent access without lost updates, security, declarative queries |
| What is data independence? Which kind is harder? | Changing one schema level without affecting the level above. Physical (storage changes) is easy; logical (conceptual changes hidden from views) is harder |
| Super key, candidate key, primary key? | Super key: unique set. Candidate: minimal super key. Primary: the chosen candidate key, no NULLs |
| Can an instance prove that a set is a key? | No: an instance can only refute a key. Keys are schema constraints |
| Difference between relational algebra and SQL? | Algebra: procedural, set semantics. SQL: declarative, bag semantics, plus aggregation and ordering |
| How do you express "for all" in SQL? | Division in algebra; double `NOT EXISTS` (or `GROUP BY ... HAVING COUNT = total`) in SQL |
| How do you map an M:N relationship? | A separate table with both foreign keys (together the primary key) and the relationship's attributes |

## 10.2 Normalisation

| Question | Core of a good answer |
|---|---|
| Define 2NF, 3NF, BCNF in one line each | 2NF: no non-prime attribute depends on part of a key. 3NF: every FD X → A has X a superkey or A prime. BCNF: every FD has X a superkey |
| How do you find candidate keys quickly? | Attributes never on a right side are in every key; grow that core and test closures |
| Is every relation with two attributes in BCNF? | Yes |
| BCNF versus 3NF trade-off? | BCNF removes all FD redundancy but may lose dependency preservation; 3NF synthesis is always lossless and preserving |
| When is a binary decomposition lossless? | When R1 ∩ R2 determines R1 or R2 |
| What is a minimal cover? | Equivalent FD set with single-attribute right sides, no extraneous left attributes, no redundant FDs |
| What problem does 4NF solve? | Redundancy from independent multivalued facts (MVDs), e.g. a course's teachers and books |
| Why denormalise? | To speed up reads (fewer joins) at the cost of extra work and risk on writes |

## 10.3 Transactions and concurrency

| Question | Core of a good answer |
|---|---|
| Explain ACID and what implements each | Atomicity: undo log. Consistency: constraints + app logic. Isolation: locking/MVCC. Durability: WAL flushed at commit |
| What makes two operations conflict? | Different transactions, same item, at least one write |
| How do you test conflict serialisability? | Build the precedence graph; serialisable iff acyclic; topological order = equivalent serial order |
| View serialisable but not conflict serialisable? | Possible only with blind writes |
| Recoverable vs cascadeless vs strict? | Commit after those you read from; read only committed data; also never overwrite uncommitted data |
| What is 2PL and what does strict 2PL add? | Growing then shrinking phase gives conflict serialisability; holding X locks to commit gives strict schedules |
| How are deadlocks handled? | Detection with a wait-for graph and victim abort; or prevention with wait-die / wound-wait; or global lock ordering |
| Why can two transactions deadlock even when locking items in the same order? | Lock upgrades: both hold S and wait to upgrade to X; fix with update/exclusive locks at read time (`SELECT ... FOR UPDATE`) |
| What is MVCC and why is it popular? | Multiple versions; readers read a snapshot, so readers and writers do not block each other |
| What anomaly does snapshot isolation allow? | Write skew: two transactions read overlapping data and write different rows, breaking an invariant |
| Default isolation in MySQL vs PostgreSQL? | InnoDB: repeatable read (snapshot + next-key locks). PostgreSQL: read committed |
| What is the Thomas write rule? | In timestamp ordering, an obsolete write (older than the item's W-TS) is ignored instead of aborting |

## 10.4 Recovery, storage and indexing

| Question | Core of a good answer |
|---|---|
| What is write-ahead logging? | Log records reach stable storage before the data pages they describe, and before commit is acknowledged |
| Why steal + no-force? | Best run-time performance; requires undo (steal) and redo (no-force) |
| What do ARIES's three passes do? | Analysis rebuilds TT/DPT and finds losers; redo repeats history (skipping by pageLSN); undo rolls back losers writing CLRs |
| What is a checkpoint for? | Bounding the log that recovery must scan |
| Why B+ trees and not BSTs or hash tables? | High fan-out means height 3–4 for billions of rows (few page reads); leaves are linked for range scans; hash indexes cannot do ranges |
| B-tree vs B+ tree? | B+ keeps data only in linked leaves: higher fan-out, efficient range scans, predictable lookups |
| Clustered vs non-clustered index? | Clustered: rows stored in index order (one per table). Non-clustered: separate structure pointing to rows |
| What is a covering index? | An index containing all columns a query needs, so the table is never read |
| Why might the optimiser ignore an index? | Low selectivity, function on the column, leading wildcard, type conversion, stale statistics, leftmost prefix not used |
| What is sequential flooding? | A repeated scan larger than the buffer pool makes LRU miss every time |

## 10.5 Query processing and distributed data

| Question | Core of a good answer |
|---|---|
| When is a hash join better than a nested-loop join? | Large unsorted inputs with an equality condition; build on the smaller input |
| When is a nested-loop join fine? | Small outer relation, or an index on the inner join column (index nested loop) |
| How does the optimiser estimate selectivity? | Statistics: 1/V(A, r) for equality, ranges from min/max or histograms, independence for AND |
| Explain CAP with an example | During a partition, a bank ledger refuses writes on the minority side (C); a shopping cart keeps accepting items and merges later (A) |
| What is PACELC? | Partition: availability or consistency; Else: latency or consistency |
| What does R + W > N give you? | Every read quorum overlaps every write quorum, so reads see the latest acknowledged write |
| Why is 2PC called blocking? | Prepared participants cannot decide alone if the coordinator fails |
| Range vs hash partitioning? | Range: efficient scans, hot spots. Hash: even load, no range scans |
| When would you choose Cassandra over MySQL? | Huge write volume, known query patterns, multi-region availability, eventual/tunable consistency is acceptable (e.g. sensor data, activity feeds) |

## 10.6 Formula sheet

| Quantity | Formula |
|---|---|
| FD X → Y implied by F | Y ⊆ X<sup>+</sup> |
| Binary lossless decomposition | R1 ∩ R2 → R1 or R1 ∩ R2 → R2 |
| Number of super keys of R(n attributes) with a single candidate key of k attributes | 2<sup>n−k</sup> |
| B+ tree internal order | p = ⌊(B + K) / (K + P)⌋ |
| B+ tree leaf capacity | n = ⌊(B − P) / (K + P<sub>r</sub>)⌋ |
| Maximum records, height h | p<sup>h−1</sup> · n |
| Minimum children (non-root internal) | ⌈p/2⌉ |
| External sort passes | 1 + ⌈log<sub>M−1</sub>⌈b/M⌉⌉; cost 2b per pass |
| Tuple nested loop join | b<sub>r</sub> + n<sub>r</sub>·b<sub>s</sub> |
| Block nested loop join | b<sub>r</sub> + ⌈b<sub>r</sub>/(M−2)⌉·b<sub>s</sub> |
| Index nested loop join | b<sub>r</sub> + n<sub>r</sub>·c |
| Sort-merge join | sort(r) + sort(s) + b<sub>r</sub> + b<sub>s</sub> |
| Hash join (Grace) | 3(b<sub>r</sub> + b<sub>s</sub>), needs M > √b<sub>build</sub> |
| Equality selection size | n<sub>r</sub> / V(A, r) |
| Join size on A | n<sub>r</sub>·n<sub>s</sub> / max(V(A, r), V(A, s)) |
| Quorum overlap | R + W > N |
| Keys moved adding 1 node to N (consistent hashing) | ≈ 1/(N + 1) |

## 10.7 Cheat sheets

### Normal forms at a glance

| Form | Rule of thumb | Typical violation |
|---|---|---|
| 1NF | One value per cell | `phones = '981..., 982...'` |
| 2NF | Whole key needed | (roll, course) → name, where roll → name |
| 3NF | Nothing but the key (or prime) | roll → dept → dept_head |
| BCNF | Every determinant is a key | (student, course) → instructor with instructor → course |
| 4NF | No independent multivalued facts | course ↠ teacher, course ↠ book |
| 5NF | No cyclic join dependency | Supplier–part–project rule |

### Isolation level versus anomaly

| | Dirty read | Lost update | Non-repeatable | Phantom | Write skew |
|---|---|---|---|---|---|
| Read uncommitted | ✗ | ✗ | ✗ | ✗ | ✗ |
| Read committed | ✓ | ✗ | ✗ | ✗ | ✗ |
| Repeatable read | ✓ | Engine-dependent | ✓ | ✗ (ANSI) | ✗ |
| Snapshot isolation | ✓ | ✓ | ✓ | ✓ | ✗ |
| Serializable | ✓ | ✓ | ✓ | ✓ | ✓ |

✓ = prevented, ✗ = possible.
