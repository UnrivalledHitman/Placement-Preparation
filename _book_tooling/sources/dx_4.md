# Chapter 8: Byzantine Faults, Leases and Split Brain
%Why one traitor needs four generals, where Byzantine tolerance is worth its cost, and keeping a single leader with leases

## 8.1 The Byzantine generals

So far nodes failed by stopping. A **Byzantine** node may do anything: send different values to different peers, lie about what it received, or collude with other faulty nodes. Lamport, Shostak and Pease (1982) proved that agreement with *f* Byzantine nodes requires **at least 3*f* + 1 nodes** (without digital signatures). With three nodes and one traitor, a loyal lieutenant receiving conflicting reports cannot tell whether the commander or the other lieutenant is lying.

The **oral messages** algorithm OM(1) tolerates one traitor among four: the commander sends its order to each lieutenant; each lieutenant relays what it received to the others; each lieutenant decides the majority of the values it holds. The program runs every placement of the traitor and every lie it could tell.

```python run OM(1): one traitor among four nodes, and among three
from collections import Counter
from itertools import product

def om1(n, traitor, lies, order='attack'):
    """Node 0 commands; 1..n-1 are lieutenants. 'lies' are the traitor's messages."""
    lie = iter(lies)
    lts = range(1, n)
    got = {l: next(lie) if traitor == 0 else order for l in lts}       # round 1
    decisions = {}
    for l in lts:
        if l == traitor:
            continue
        values = [got[l]] + [next(lie) if o == traitor else got[o]     # round 2: relays
                             for o in lts if o != l]
        value, count = Counter(values).most_common(1)[0]
        decisions[l] = value if count > len(values) // 2 else 'retreat'   # no majority
    return decisions

def check(n):
    failures = cases = 0
    for traitor in range(n):
        if traitor == 0:
            sent = n - 1                                   # one order per lieutenant
        else:
            sent = n - 2                                   # one relay to each loyal peer
        for lies in product(['attack', 'retreat'], repeat=sent):
            d = om1(n, traitor, lies)
            agree = len(set(d.values())) == 1
            valid = traitor == 0 or all(v == 'attack' for v in d.values())
            failures += not (agree and valid)
            cases += 1
    return failures, cases

for n in [4, 3]:
    f, c = check(n)
    print(f'{n} nodes, 1 traitor: loyal nodes disagreed or disobeyed a loyal commander '
          f'in {f} of {c} cases')
```

The program tries every combination of lies the traitor could tell, wherever it sits. With four nodes, loyal lieutenants always agree, and they follow the commander whenever the commander is loyal. With three, some of the traitor's choices succeed: a traitorous lieutenant that relays "retreat" leaves the loyal lieutenant with one vote each way, so it cannot obey its loyal commander. A traitor only needs one winning strategy, so three nodes are not enough. Each additional traitor needs three more nodes and another round of relaying, so message counts grow quickly (O(*n*<sup>2</sup>) per round in practical protocols such as PBFT).

| Setting | Fault model | Why |
|---|---|---|
| Data centre databases, etcd, Kafka | Crash-recovery | Nodes are run by one organisation; bugs and bit flips are handled by checksums, authentication and testing, at far lower cost |
| Blockchains (PBFT variants, Tendermint, HotStuff) | Byzantine | Participants do not trust each other |
| Aircraft and spacecraft control | Byzantine | Faulty sensors and hardware can send arbitrary values; lives depend on it |

## 8.2 Leases

Many systems need exactly one node to act as leader or lock holder, and they cannot afford a consensus round on every operation. A **lease** is a time-limited grant: the holder may act alone until the lease expires, and the grantor promises not to grant it to anyone else before then. Leases are how Raft leaders serve fast local reads, how GFS and HDFS pick a primary for each chunk, and how Chubby and etcd locks expire when their holders die.

Leases depend on **clocks running at roughly the same rate**: the holder must stop before the grantor thinks the lease has expired. With maximum drift ρ between clocks, a holder that received a lease of length *L* must stop using it after *L*(1 − ρ) minus a safety margin for the delay of the grant message itself.

```python run How long a lease holder may safely act
lease_s = 10.0
for drift_ppm, grant_delay_ms in [(200, 5), (200, 50), (10_000, 50)]:
    rho = drift_ppm / 1e6
    safe = lease_s * (1 - rho) - grant_delay_ms / 1000
    print(f'drift {drift_ppm:6} ppm, grant delay {grant_delay_ms:3} ms: '
          f'act for at most {safe:.3f} s of a {lease_s:.0f} s lease')
```

The real danger is not drift but **pauses**: a garbage-collection pause, a VM migration or a swapped-out process can stop the holder for longer than the lease while its own code believes no time has passed. When it resumes, it acts on a lease that has already been given to someone else. Checking the clock just before acting does not help, because the pause can happen between the check and the action. The robust fix is a **fencing token**: every lease grant comes with a number that increases with each grant, and the protected resource rejects requests carrying a token lower than the highest it has seen. The HLD guide, §7.3, simulates exactly this.

## 8.3 Split brain

**Split brain** is two nodes both believing they are the leader, each accepting writes, so the data diverges. It is caused by failover based on a timeout alone: the old leader was slow or partitioned, not dead.

| Defence | How it prevents split brain |
|---|---|
| Majority quorum for leadership | Only the side of a partition with a majority can elect a leader; the minority side cannot make progress (Raft, ZooKeeper) |
| Terms / epochs | Every message carries the leader's term; nodes reject messages from older terms, so a deposed leader's writes fail |
| Fencing tokens | Storage rejects writes from older lease holders |
| STONITH ("shoot the other node in the head") | Power off or isolate the old leader before promoting a new one |
| Leader steps down | A leader that cannot reach a majority within its lease stops serving |

Two-node clusters cannot have a majority after a partition, which is why they need a third tie-breaker (a witness node, a quorum disk or a cloud lock service).

## 8.4 Practical lessons

- Byzantine agreement needs 3f + 1 nodes; data centres use crash fault tolerance plus checksums instead.
- Leases avoid consensus on every operation but assume bounded clock drift and short pauses.
- Pauses defeat leases; fencing tokens make stale holders harmless.
- Prevent split brain with majorities, terms, fencing and an odd number of voters.

# Chapter 9: Case Studies
%How etcd, Kafka, Cassandra, Spanner and others combine the ideas of this book

## 9.1 Coordination services: etcd and ZooKeeper

| Aspect | etcd | ZooKeeper |
|---|---|---|
| Consensus | Raft | ZAB (a Paxos-like atomic broadcast) |
| Data model | Flat key-value with revisions; MVCC history | Hierarchical znodes |
| Writes | Linearizable, through the leader | Linearizable, through the leader |
| Reads | Linearizable by default (read index); serializable option reads local state | Sequentially consistent from any server; `sync` before a read for the latest |
| Ephemeral state | Leases attached to keys | Ephemeral znodes tied to sessions |
| Notifications | Watches on keys and prefixes | One-shot watches |
| Used for | Kubernetes state, service discovery, locks | Kafka (before KRaft), HBase, Hadoop |

Both keep data small (megabytes to a few gigabytes) and cluster sizes at 3 or 5: they are for coordination, not bulk storage.

## 9.2 Kafka's replicated log

Each Kafka partition is a replicated log with a leader and followers. The **in-sync replica set** (ISR) contains the followers that are caught up within a configured lag. The **high watermark** is the highest offset that every member of the ISR has; consumers can read only up to it, because only those messages are guaranteed to survive a leader failover to an in-sync replica.

```python run High watermark, acks and unclean leader election
leader_log = list(range(1, 11))                         # offsets 1..10 on the leader
followers = {'broker-2': 10, 'broker-3': 7}             # log end offsets
max_lag = 2
isr = ['broker-1'] + [b for b, leo in followers.items() if 10 - leo <= max_lag]
hw = min([10] + [followers[b] for b in isr if b != 'broker-1'])
print('ISR:', isr, '| high watermark:', hw, '| consumers can read offsets 1 ..', hw)

print('leader broker-1 dies:')
print('  clean election from the ISR: broker-2 leads, log ends at', followers['broker-2'])
lost = list(range(followers['broker-3'] + 1, 11))
print('  unclean election of broker-3: log ends at', followers['broker-3'], '- offsets',
        lost,
      'lost' + (' (were readable)' if max(lost) <= hw else ''))

for acks, min_isr in [('1', 1), ('all', 1), ('all', 2)]:
    if acks == '1':
        note = 'only the leader has it; lost if the leader dies first'
    elif min_isr == 1:
        note = 'the whole ISR has it, but the ISR may be just the leader'
    else:
        note = 'at least 2 replicas have it before the producer gets success'
    print(f'acks={acks:3} min.insync.replicas={min_isr}: {note}')
```

With the unclean election, offsets 8–10 had been below the high watermark, so consumers may already have processed messages that the new leader's log no longer contains. That is why `unclean.leader.election.enable` is `false` by default: the partition stays unavailable until an in-sync replica returns, choosing consistency over availability.

| Kafka feature | Distributed systems idea |
|---|---|
| Partition leader per partition, controller elected by KRaft (Raft) | Consensus for metadata, leader-based replication for data |
| `acks=all` + `min.insync.replicas=2` + `unclean.leader.election.enable=false` | Durability through quorum-like acknowledgement; consistency over availability |
| Idempotent producer (producer ID + sequence numbers) | Deduplicating retries (the two generals' answer: make retries safe) |
| Transactions and exactly-once processing | Atomic commit of output messages and consumer offsets |
| Ordering only within a partition | Total order is expensive; Kafka provides it per partition, not globally |

## 9.3 Dynamo-style stores: Cassandra and DynamoDB

| Technique | Chapter |
|---|---|
| Consistent hashing with virtual nodes to place data | HLD guide |
| Tunable quorums (R + W > N for overlapping reads and writes) | DBMS guide, §9.3 |
| Sloppy quorums and hinted handoff during failures | Chapter 7 |
| Read repair and Merkle-tree anti-entropy | Chapter 7 |
| Gossip membership and phi accrual failure detection | Chapters 1 and 7 |
| Last-write-wins by timestamp (Cassandra); conditional writes and transactions (DynamoDB) | Chapters 2 and 6 |
| Lightweight transactions (Cassandra) for compare-and-set | Paxos per partition key, Chapter 5 |

## 9.4 Globally consistent databases: Spanner and CockroachDB

| Aspect | Spanner | CockroachDB |
|---|---|---|
| Replication | Paxos group per data split | Raft group per range |
| Transactions | Two-phase commit across Paxos groups (the coordinator is itself replicated, so it cannot block forever) | Parallel commits over Raft ranges |
| Clock | TrueTime with commit wait | Hybrid logical clocks plus a maximum clock offset; uncertain reads restart |
| Isolation | External consistency (strict serializability) | Serializable |

Both show the same pattern as the rest of this book: consensus where agreement is required (each replica group), clocks and versioning to order transactions cheaply, and careful bounds on uncertainty.

## 9.5 Practical lessons

- Coordination services (etcd, ZooKeeper) are small, linearizable consensus systems; keep bulk data elsewhere.
- Kafka's durability comes from the ISR, the high watermark and refusing unclean elections.
- Dynamo-style stores combine consistent hashing, quorums, gossip and anti-entropy, and accept LWW's trade-offs.
- Spanner and CockroachDB layer transactions over consensus groups, ordered by carefully bounded clocks.

# Chapter 10: Question Bank and Cheat Sheet
%Interview questions with the core of a good answer, and one-page reminders

## 10.1 Foundations, time and consistency

| Question | Core of a good answer |
|---|---|
| What makes distributed systems hard? | Partial failure and unbounded delays: silence cannot distinguish a lost message, a slow node and a crash |
| Synchronous, asynchronous, partially synchronous? | Known delay bounds; no bounds; bounds that hold eventually. Practical algorithms assume partial synchrony |
| Explain the two generals problem | Agreement over a lossy channel cannot be certain with finitely many messages; the last message is always unacknowledged. Make operations idempotent and retry |
| How do you detect failures? | Heartbeats and timeouts, which are guesses; adaptive detectors (phi accrual), indirect probes (SWIM), suspicion before declaring death |
| Why not order events by timestamps? | Clock skew and jumps make later events look earlier; LWW then silently drops writes |
| Lamport versus vector clocks? | Lamport: a → b implies L(a) < L(b), a causal total order, no concurrency detection. Vector: a → b iff V(a) < V(b), detects concurrency, costs O(N) |
| How does Spanner get external consistency? | TrueTime intervals and commit wait: wait until the commit timestamp has certainly passed everywhere |
| What is linearizability? | Each operation takes effect atomically at a point between its call and return; once a value is seen, no later read returns an older one |
| Linearizable versus serializable? | Linearizable: recency for single objects. Serializable: transactions equivalent to some serial order (not necessarily real time). Both together: strict serializability |
| Do quorums give linearizability? | Not by themselves: concurrent reads can see new then old values; synchronous read repair or consensus is needed |
| Name the session guarantees | Read-your-writes, monotonic reads, monotonic writes, writes-follow-reads |

## 10.2 Broadcast, consensus and replication

| Question | Core of a good answer |
|---|---|
| What is state machine replication? | Deterministic replicas applying the same operations in the same order stay identical |
| Why is total order broadcast equivalent to consensus? | Decide the first delivered proposal; conversely, run consensus per log slot |
| What does FLP say? | No deterministic algorithm guarantees consensus in an asynchronous system with one crash; practical systems keep safety always and get liveness under partial synchrony |
| Why must quorums intersect? | The intersection carries knowledge of earlier decisions to later ones; majorities do, Flexible Paxos needs Q1 + Q2 > N |
| Explain Paxos in two phases | Prepare/promise with a ballot (learn any accepted value), then accept; a proposer must re-propose the highest-ballot accepted value it learned |
| How does Raft replicate a log? | AppendEntries with prevLogIndex/prevLogTerm consistency check; followers truncate conflicts; leader backs off nextIndex until logs match |
| When is a Raft entry committed? | When stored on a majority and an entry of the leader's current term is committed; new leaders append a no-op |
| Why does Raft restrict votes? | A candidate must be at least as up to date as the voter, so every elected leader holds all committed entries |
| How do you read safely from a Raft cluster? | Read index (confirm leadership, wait until applied) or leases with bounded clock drift; never plain local reads on a possibly deposed leader |
| Why odd cluster sizes? | 2f + 1 nodes tolerate f failures; an even size adds cost without tolerating more |

## 10.3 Conflicts, gossip and faults

| Question | Core of a good answer |
|---|---|
| What is a CRDT? | A data type whose merge is commutative, associative and idempotent, so replicas converge regardless of order or duplicates |
| Give CRDT examples | G-counter, PN-counter, LWW-register, MV-register, G-set, 2P-set, OR-set, sequence CRDTs for text |
| Why did Dynamo's cart resurrect items? | Merging by set union cannot distinguish removed from never-added; OR-sets track observed adds |
| What can CRDTs not do? | Enforce global invariants (uniqueness, non-negative balance); those need coordination |
| How fast does gossip spread? | O(log N) rounds with high probability; tolerant of loss; redundant messages |
| How does SWIM work? | Probe one random member per period, indirect probes via k others, suspicion with refutation, gossip membership changes |
| What is a Merkle tree used for? | Comparing replicas by hashes, descending only into differing subtrees; exchange only the differing ranges |
| How many nodes tolerate f Byzantine faults? | 3f + 1 (without signatures); crash faults need only 2f + 1 |
| What is a lease and its weakness? | Time-bounded exclusive right; assumes bounded drift and pauses; fix stale holders with fencing tokens |
| How do you prevent split brain? | Majority quorums, terms/epochs, fencing tokens, STONITH, leaders stepping down without a majority |
| What is Kafka's high watermark? | The offset all in-sync replicas have; consumers read up to it; unclean election can lose messages beyond the new leader's log |

## 10.4 Cheat sheet

| Topic | Remember |
|---|---|
| Failure | Silence is ambiguous; idempotency plus retries; no perfect failure detector |
| Models | Partial synchrony; crash-recovery; Byzantine needs 3f + 1 |
| Clocks | Monotonic for durations; Lamport = causal order; vector = concurrency; HLC; TrueTime commit wait |
| Consistency | Linearizable > sequential > causal > eventual; session guarantees for user-facing anomalies |
| Broadcast | Reliable, FIFO, causal (vector clocks), total order (= consensus) |
| FLP | Safety always; liveness under partial synchrony; randomised timeouts and stable leaders |
| Quorums | Majorities intersect; Flexible Paxos Q1 + Q2 > N; 2f + 1 nodes for f crashes |
| Paxos | Prepare/promise, accept/accepted; adopt the highest accepted value |
| Raft | Terms; AppendEntries consistency check; vote restriction; commit via current-term entry; no-op on election |
| CRDTs | Commutative, associative, idempotent merge; PN-counter, OR-set; no global invariants |
| Gossip and repair | O(log N) spread; SWIM; read repair, hinted handoff, Merkle anti-entropy |
| Leadership | Leases plus fencing tokens; majorities and terms against split brain |
| Systems | etcd/ZooKeeper coordinate; Kafka ISR and high watermark; Dynamo-style quorums and gossip; Spanner TrueTime |
