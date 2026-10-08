# How to use this guide
%What makes distributed systems a subject of their own, what this book covers, and how its simulations work

A distributed system is a set of computers that communicate only by sending messages over a network, and that try to behave like one system. Every large service is one: replicated databases, Kafka, Kubernetes' etcd, a shopping cart that survives a data-centre failure. Interviews for backend and infrastructure roles probe it with questions such as "How does Raft guarantee that a committed entry is never lost?", "Why can't you just use timestamps to order events?" and "What does linearizable actually mean?".

This guide is the theory underneath the **High-Level Design** guide and the distributed chapter of the **DBMS Theory** guide. Those books already cover replication strategies, quorums, sharding, CAP and PACELC, two-phase commit, sagas, Raft leader election, distributed locks with fencing tokens, retries and circuit breakers; here they are referenced, not repeated. This book goes one level deeper: **time and ordering**, **consistency models**, **broadcast and state machine replication**, **Paxos and Raft log replication**, **CRDTs**, **gossip and anti-entropy**, and **Byzantine faults**.

## How the examples were run

Every algorithm in this book is implemented as a small Python simulation, run here, with its output shown. The simulations replace the network with a message queue that can **delay, reorder, drop and duplicate** messages under a seeded random generator, and replace real clocks with simulated ones, so every run is reproducible and every failure scenario can be forced on purpose. Every loop is capped, because a buggy distributed algorithm's favourite failure is to never terminate.

> TIP: Change the seeds, the loss rates and the timings and rerun. The safety properties (two nodes never decide different values, replicas converge) must hold for **every** seed; only liveness and timing should change. That is exactly how real systems are tested, with tools like Jepsen and deterministic simulation.

## Map of the guide

| Chapter | Topic | Typical interview question |
|---|---|---|
| 1 | Why distributed systems are hard | "How do you tell a slow node from a dead one?" |
| 2 | Time, clocks and ordering | "Why are timestamps not enough to order events?" |
| 3 | Consistency models | "Linearizable versus sequential versus eventual?" |
| 4 | Broadcast and state machine replication | "How do replicas apply the same operations in the same order?" |
| 5 | Consensus: Paxos and Raft | "When is a Raft log entry committed?" |
| 6 | Conflicts and CRDTs | "Two users edit the same cart offline. Then what?" |
| 7 | Gossip, membership and anti-entropy | "How does Cassandra find out a node is down?" |
| 8 | Byzantine faults, leases and fencing | "How many nodes tolerate one traitor?" |
| 9 | Case studies | "How does Kafka (or Spanner, or DynamoDB) do this?" |
| 10 | Question bank and cheat sheet | Revision |

# Chapter 1: Why Distributed Systems Are Hard
%Partial failure, unreliable networks, system models, the two generals and failure detection

## 1.1 Partial failure

On one machine, a program either works or crashes. In a distributed system, **part** of the system can fail while the rest keeps running, and the rest often cannot tell what failed. When a request gets no reply, any of these may have happened:

| What happened | Did the operation run? |
|---|---|
| The request was lost on the way | No |
| The remote node crashed before processing it | No |
| The remote node is overloaded and will reply later | Yes, later |
| The remote node processed it and crashed before replying | Yes |
| The reply was lost on the way back | Yes |
| The network is partitioned; both sides are alive | Unknown, possibly yes |

The sender sees the same thing in every case: silence. That single fact explains most of this book: retries need idempotency (the operation might have run), failure detection needs timeouts (and timeouts guess), and agreement needs protocols that tolerate wrong guesses.

The **eight fallacies of distributed computing** (Deutsch and others, Sun Microsystems) list the assumptions that newcomers make and that break real systems: the network is reliable; latency is zero; bandwidth is infinite; the network is secure; topology does not change; there is one administrator; transport cost is zero; the network is homogeneous.

## 1.2 System models

Algorithms are proved correct under a **system model**: assumptions about timing and failures. Choosing the model is the first step of any design.

| Timing model | Assumption | Realistic? |
|---|---|---|
| Synchronous | Known upper bounds on message delay and processing time | No: networks have unbounded queues and GC pauses |
| Asynchronous | No bounds at all; no clocks | Too pessimistic: consensus becomes impossible (FLP, Chapter 5) |
| Partially synchronous | Bounds hold most of the time, but can be violated for unknown periods | Yes: the model most practical algorithms (Paxos, Raft) assume |

| Failure model | A faulty node may | Tolerated by |
|---|---|---|
| Crash-stop | Stop and never return | Most textbook algorithms |
| Crash-recovery | Stop, then restart with its durable state (memory lost) | Raft, Paxos with stable storage |
| Omission | Drop some messages it should send or receive | Retries, acknowledgements |
| Byzantine | Do anything: lie, send conflicting messages, collude | BFT protocols with 3f + 1 nodes (Chapter 8) |

## 1.3 The two generals problem

Two generals on opposite hills must attack at the same time to win. Their only communication is messengers who cross a valley where they may be captured. General A sends "attack at dawn". Even if it arrives, A does not know that it arrived, so B must send an acknowledgement; then B does not know whether the acknowledgement arrived, and so on. **No finite number of messages over an unreliable channel lets both sides be certain they agree.** The last messenger is always unacknowledged.

The simulation shows what each protocol length buys: more rounds make disagreement rarer but never impossible.

```python run Two generals: the last message is always uncertain
import random

def run(k, p_loss, rng):
    """Messages alternate A->B, B->A, A->B ... (k in total); the chain stops at the
    first lost message. Each general attacks only if it received every message
    addressed to it (A gets the even-numbered ones, B the odd-numbered ones)."""
    delivered = 0
    while delivered < k and rng.random() >= p_loss:
        delivered += 1
    a_needs = k if k % 2 == 0 else k - 1
    b_needs = k if k % 2 == 1 else k - 1
    return delivered >= a_needs, delivered >= b_needs

def disagreement(k, p_loss=0.1, trials=100_000, seed=1):
    rng = random.Random(seed)
    return sum(a != b for a, b in (run(k, p_loss, rng) for _ in range(trials))) / trials

for k in [1, 2, 4, 8, 16]:
    exact = (1 - 0.1) ** (k - 1) * 0.1                 # exactly the last message lost
    print(f'{k:2} messages: generals disagree in {disagreement(k):6.2%} of runs '
          f'(exact {exact:6.2%})')
```

Disagreement shrinks but stays positive. The generals disagree exactly when every message but the last arrives, which has probability (1 − p)<sup>k−1</sup> × p: in every protocol, the outcome hinges on whether the **last** message arrived, and its sender cannot know. Real systems therefore do not try to *agree with certainty over a lossy link*; they make the operation safe to repeat (idempotency keys, Chapter 1 of the Advanced Backend guide) and let the uncertain side retry until it hears back.

## 1.4 Failure detection with timeouts

Since silence is ambiguous, a node is declared dead when it has been silent for longer than a timeout. The timeout is a trade-off: short timeouts detect failures quickly but declare slow nodes dead (false positives, which cause needless failovers and sometimes split brain); long timeouts wait a long time before reacting to a real crash.

The **phi accrual failure detector** (used by Cassandra and Akka) replaces the yes/no timeout with a suspicion level: it learns the distribution of heartbeat intervals and outputs φ = −log<sub>10</sub>(probability that a heartbeat this late would still arrive). φ = 1 means a 10% chance the node is fine, φ = 3 a 0.1% chance. The program compares a fixed timeout with phi accrual on a network whose latency changes partway through.

```python run Fixed timeout versus phi accrual on a network that gets slower
import math, random, statistics
rng = random.Random(3)

intervals = []                                         # heartbeat inter-arrival times (ms)
for i in range(400):
    base = 100 if i < 200 else 160   # network gets slower at heartbeat 200
    intervals.append(max(10, rng.gauss(base, 15)))

def phi(elapsed, history):
    mu, sigma = statistics.mean(history), max(statistics.stdev(history), 1.0)
    p_later = 0.5 * math.erfc((elapsed - mu) / (sigma * math.sqrt(2)))
    return -math.log10(max(p_later, 1e-300))

window, fixed_timeout, phi_threshold = 50, 150, 8
fixed_false, phi_false = 0, 0
for i in range(window, len(intervals)):
    gap = intervals[i]                                  # the node is alive: every gap ends
    fixed_false += gap > fixed_timeout
    phi_false += phi(gap, intervals[i - window:i]) > phi_threshold
print(f'live node, {len(intervals) - window} heartbeats after warm-up:')
print(f'  fixed {fixed_timeout} ms timeout falsely suspected it {fixed_false} times')
print(f'  phi accrual (threshold {phi_threshold}) falsely suspected it {phi_false} times')

history = intervals[-window:]
for silence in [200, 250, 300, 400]:
    print(f'after {silence} ms of silence: phi = {phi(silence, history):6.1f}')
```

The fixed timeout, tuned for the old 100 ms network, keeps accusing a healthy node after the network slows down. Phi accrual adapts within one window of heartbeats, while still reaching a very high suspicion within a few hundred milliseconds of real silence. Neither can be perfect: in a partially synchronous system, **a perfect failure detector does not exist**.

## 1.5 Practical lessons

- Partial failure is the defining problem: silence does not say what happened.
- Design for an explicit system model; real systems are partially synchronous with crash-recovery faults.
- Agreement over a lossy channel can never be certain: make operations idempotent and retry.
- Failure detection is a guess; adaptive detectors (phi accrual) guess better than fixed timeouts.

# Chapter 2: Time, Clocks and Ordering
%Physical clocks and skew, Lamport clocks, vector clocks, hybrid logical clocks and TrueTime

## 2.1 Physical clocks lie

Each machine's quartz clock drifts (typically 10–200 parts per million, so up to 17 seconds a day at the worst end), and NTP corrects it against time servers, but only to within milliseconds on a good network and much worse under load. Clocks can also **jump**: NTP steps a clock that is far off, leap seconds are inserted, and virtual machines pause. Two consequences:

| Use | Clock to use | Why |
|---|---|---|
| Measuring a duration (timeouts, latency) | Monotonic clock (`System.nanoTime`, `time.monotonic`) | Never jumps backwards |
| Ordering events across machines | Not wall-clock time | Skew between machines exceeds the gap between events |

The danger of ordering by wall clocks shows up in **last-write-wins** (LWW) conflict resolution, used by Cassandra and many caches: the write with the highest timestamp survives.

```python run Last-write-wins with a skewed clock silently drops a newer write
events = []                               # (true time ms, node, clock offset ms, value)
offsets = {'node-A': 0, 'node-B': -40}    # B's clock runs 40 ms behind
writes = [(1000, 'node-A', 'price=100'), (1025, 'node-B', 'price=120')]   # B writes LATER
store = None
for true_t, node, value in writes:
    stamp = true_t + offsets[node]
    print(f'true time {true_t} ms: {node} writes {value} with timestamp {stamp}')
    if store is None or stamp > store[0]:
        store = (stamp, value)
print('LWW keeps:', store[1], '(the write that really happened last was price=120)')
```

A 40 ms skew, well within normal NTP error, makes the later write lose, and nothing reports an error. Ordering needs something better than wall clocks.

## 2.2 Happens-before and Lamport clocks

Lamport (1978) defined the **happens-before** relation for distributed systems: event *a* → *b* if *a* comes before *b* on the same node, or *a* is the sending of a message and *b* its receipt, or by transitivity. If neither *a* → *b* nor *b* → *a*, the events are **concurrent**: no information could have flowed between them.

A **Lamport clock** is a counter per node: increment before each event, attach it to every message, and on receipt set counter = max(own, received) + 1. It guarantees that if *a* → *b* then L(*a*) < L(*b*). Breaking ties by node ID gives a **total order** consistent with causality.

```python run Lamport clocks on three nodes
class Node:
    def __init__(self, name):
        self.name, self.clock, self.log = name, 0, []
    def local(self, what):
        self.clock += 1
        self.log.append((self.clock, self.name, what))
    def send(self, what):
        self.local('send ' + what)
        return (self.clock, what)
    def receive(self, msg):
        stamp, what = msg
        self.clock = max(self.clock, stamp)
        self.local('recv ' + what)

a, b, c = Node('A'), Node('B'), Node('C')
a.local('x=1')
m1 = a.send('m1')
c.local('y=7')
b.receive(m1)
m2 = b.send('m2')
c.local('z=2')
c.receive(m2)
events = sorted(a.log + b.log + c.log)              # total order: (clock, node name)
for clock, node, what in events:
    print(f'L={clock}  {node}: {what}')
```

C's `y=7` and `z=2` have Lamport times 1 and 2, smaller than many of A's and B's events, yet they are concurrent with them. That is the limitation: **L(a) < L(b) does not imply a → b**. Lamport clocks cannot detect concurrency.

## 2.3 Vector clocks

A **vector clock** keeps one counter per node. Each node increments its own entry on every event; messages carry the whole vector; on receipt, take the element-wise maximum, then increment your own entry. Then *a* → *b* exactly when V(*a*) ≤ V(*b*) element-wise and V(*a*) ≠ V(*b*); if neither is ≤ the other, the events are concurrent.

```python run Vector clocks detect concurrency
def compare(v, w):
    le = all(v[k] <= w[k] for k in v)
    ge = all(v[k] >= w[k] for k in v)
    if le and ge: return 'equal'
    if le: return 'happened before'
    if ge: return 'happened after'
    return 'concurrent'

nodes = ['A', 'B', 'C']
vc = {n: {m: 0 for m in nodes} for n in nodes}
stamps = {}

def event(n, label):
    vc[n][n] += 1
    stamps[label] = dict(vc[n])

def send(n, label):
    event(n, label)
    return dict(vc[n])

def receive(n, msg, label):
    for k in nodes:
        vc[n][k] = max(vc[n][k], msg[k])
    event(n, label)

event('A', 'a1'); m = send('A', 'a2-send')
event('C', 'c1')
receive('B', m, 'b1-recv'); m2 = send('B', 'b2-send')
receive('C', m2, 'c2-recv')
for label, v in stamps.items():
    print(f'{label:8} {[v[n] for n in nodes]}')
for x, y in [('a1', 'c2-recv'), ('a2-send', 'b1-recv'), ('c1', 'a2-send'), ('c1',
        'b2-send')]:
    print(f'{x} vs {y}: {compare(stamps[x], stamps[y])}')
```

Dynamo-style stores (Riak, the original Amazon Dynamo) attach vector clocks (or their per-replica variant, **version vectors**) to values: when two versions are concurrent, the store keeps both as **siblings** and lets the application merge them (Chapter 6), instead of silently dropping one as LWW does. The cost is one counter per node (or per client), which is why systems prune old entries.

## 2.4 Hybrid logical clocks and TrueTime

| Clock | Idea | Gives | Used by |
|---|---|---|---|
| Lamport | Counter, max on receive | Total order consistent with causality | Many protocols internally |
| Vector | Counter per node | Exact causality and concurrency detection | Riak, version vectors in Dynamo-style stores |
| Hybrid logical clock (HLC) | Physical time plus a logical counter for ties and skew | Causality with timestamps close to wall time; fits in 64 bits | CockroachDB, YugabyteDB, MongoDB |
| TrueTime (Spanner) | GPS and atomic clocks; the API returns an interval [earliest, latest] with bounded uncertainty | External consistency (linearizable transactions) using **commit wait** | Google Spanner |

Spanner's trick: a transaction picks commit timestamp *t* = TT.now().latest, then **waits** until TT.now().earliest > *t* before making the commit visible. After the wait, every clock in the system has passed *t*, so any transaction that starts later gets a larger timestamp. The cost is waiting out the uncertainty, about 7 ms on Google's hardware.

```python run Commit wait: waiting out clock uncertainty
import random
rng = random.Random(8)
epsilon = 7.0                                          # ms of clock uncertainty
true_now, commits = 0.0, []
for txn in range(5):
    true_now += rng.uniform(1, 4)
    observed = true_now + rng.uniform(-epsilon, epsilon)       # a local clock reading
    earliest, latest = observed - epsilon, observed + epsilon  # TrueTime interval
    commit_ts = latest
    wait = 0.0
    while observed + wait - epsilon <= commit_ts:              # until earliest > commit_ts
        wait += 0.5
    true_now += wait
    commits.append((txn, commit_ts, true_now))
    print(f'txn {txn}: commit timestamp {commit_ts:6.1f}, waited {wait:4.1f} ms, '
          f'visible at true time {true_now:6.1f}')
ordered = all(commits[i][1] < commits[i + 1][1] for i in range(len(commits) - 1))
print('commit timestamps increase in real-time order:', ordered)
```

Each commit waits about twice the uncertainty, and as a result the timestamps respect real time: a transaction that becomes visible before another starts always has the smaller timestamp. With better clocks (smaller ε), the wait shrinks; that is why Google invested in atomic clocks.

## 2.5 Practical lessons

- Use monotonic clocks for durations; never order cross-machine events by wall-clock time.
- Lamport clocks give a causal total order but cannot detect concurrency.
- Vector clocks detect concurrency exactly; stores use them to keep conflicting versions.
- HLCs approximate wall time with causal guarantees; TrueTime buys linearizability by waiting out uncertainty.
