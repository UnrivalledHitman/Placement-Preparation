# Chapter 3: Consistency Models
%Linearizability, sequential and causal consistency, session guarantees and eventual consistency, with a linearizability checker

## 3.1 What a consistency model is

A consistency model is a **contract** between a replicated store and its clients: which values a read may return, given the writes that happened. Stronger models are easier to program against and cost more latency and availability.

| Model | Promise | Cost |
|---|---|---|
| Linearizable (strong, atomic) | Every operation appears to take effect instantaneously at some point between its call and its return; reads see the latest completed write | Coordination on every operation; unavailable to the minority side of a partition (CAP) |
| Sequential | All clients see operations in one total order that respects each client's own order, but not necessarily real time | Still needs agreement on the order |
| Causal | Operations related by happens-before are seen in that order by everyone; concurrent ones may be seen in different orders | Available under partitions; needs causal metadata |
| Session guarantees | Read-your-writes, monotonic reads, monotonic writes, writes-follow-reads, per client session | Cheap: sticky sessions or version tokens |
| Eventual | If writes stop, replicas eventually converge | Cheapest; reads can be arbitrarily stale and go backwards |

Note the two different meanings of "consistency": the C in **ACID** is about invariants within one database (constraints hold), while the C in **CAP** is linearizability across replicas.

## 3.2 Linearizability, precisely

A history is linearizable if you can place each operation at a single point inside its time interval (from call to return) such that the resulting sequence is valid for a single register. Overlapping operations may be ordered either way; non-overlapping ones must keep their real-time order.

The checker below tries every ordering that respects real time, which is exponential but fine for small histories; production checkers such as Knossos and Porcupine use clever pruning to check the histories Jepsen records.

```python run A brute-force linearizability checker for a register
from itertools import permutations

def linearizable(history, initial=0):
    """history: list of (client, op, value, start, end); op is 'w' or 'r'."""
    n = len(history)
    for order in permutations(range(n)):
        pos = {op: i for i, op in enumerate(order)}
        # real-time order: if a ended before b started, a must come first
        if any(history[a][4] < history[b][3] and pos[a] > pos[b]
               for a in range(n) for b in range(n)):
            continue
        value, ok = initial, True
        for i in order:
            _, op, v, _, _ = history[i]
            if op == 'w':
                value = v
            elif v != value:
                ok = False
                break
        if ok:
            return True, [f'{history[i][0]}:{history[i][1]}({history[i][2]})'
                    for i in order]
    return False, None

histories = {
    'read overlaps the write, sees new value': [
        ('A', 'w', 1, 0, 10), ('B', 'r', 1, 5, 15)],
    'read overlaps the write, sees old value': [
        ('A', 'w', 1, 0, 10), ('B', 'r', 0, 5, 15)],
    'stale read after the write completed': [
        ('A', 'w', 1, 0, 10), ('B', 'r', 0, 12, 20)],
    'new value seen, then old value (read goes back)': [
        ('A', 'w', 1, 0, 30), ('B', 'r', 1, 5, 10), ('C', 'r', 0, 15, 20)],
}
for name, h in histories.items():
    ok, order = linearizable(h)
    print(f'{name:48} -> '
            f'{"linearizable: " + " < ".join(order) if ok else "NOT linearizable"}')
```

The last history is the subtle one: the write is still in progress, B has already seen the new value, and C, starting **after** B finished, sees the old one. Each read on its own would be allowed, but once any client has seen the new value, no later read may return the old one. A leaderless store reading from different replicas produces exactly this anomaly, even with quorums, unless it does read repair synchronously before returning (see the DBMS guide, §9.3).

## 3.3 Where linearizability is needed

| Need | Why linearizability |
|---|---|
| Leader election and locks | Everyone must agree who holds the lock right now |
| Uniqueness constraints (usernames, seat booking) | Two concurrent claims must not both succeed |
| Cross-channel timing | A user uploads a photo, a message tells a resizer to fetch it: the resizer must see the upload |
| Account balances checked before spending | The check must see the latest balance |

Everything else (feeds, likes, view counts, product catalogues) usually works with weaker models, which is why large systems mix them: a linearizable core (etcd, a SQL primary, Spanner) for coordination and money, eventually consistent replicas and caches for the rest.

## 3.4 Session guarantees

Most user-visible anomalies come from a single user's requests hitting different replicas. Session guarantees fix exactly those, cheaply.

```python run A replica that lags, and read-your-writes with a version token
replicas = {'primary': {'v': 0, 'profile': 'old bio'}, 'replica': {'v': 0,
        'profile': 'old bio'}}

def write(value):
    p = replicas['primary']
    p['v'] += 1; p['profile'] = value
    return p['v']                                   # version token returned to the client

def replicate():
    replicas['replica'].update(replicas['primary'])

def read(min_version=0, prefer='replica'):
    r = replicas[prefer]
    if r['v'] < min_version:                         # replica too stale for this session
        r = replicas['primary']
    return r['profile']

token = write('new bio')
print('naive read from the replica      :', read())
print('read with the session token      :', read(min_version=token))
replicate()
print('after replication, replica serves:', read(min_version=token))
```

| Guarantee | Anomaly it prevents | Typical implementation |
|---|---|---|
| Read-your-writes | Your own update seems to vanish after a refresh | Read from the leader for a while after writing, or pass a version token |
| Monotonic reads | A comment appears, then disappears on the next refresh | Pin a user to one replica, or require version ≥ last seen |
| Monotonic writes | Your second write is applied before your first | Route a session's writes through one leader |
| Writes-follow-reads | A reply is visible before the message it replies to | Attach the version you read to the write |

## 3.5 Practical lessons

- Linearizability: one copy, operations atomic within their call–return interval, never going back in time.
- Use it where uniqueness, locks or money need it; use weaker models elsewhere.
- Quorums alone do not give linearizability; reads can still go backwards.
- Session guarantees fix most user-visible anomalies with version tokens or sticky routing.

# Chapter 4: Broadcast and State Machine Replication
%Reliable, FIFO, causal and total order broadcast, why total order equals consensus, and chain replication

## 4.1 State machine replication

If every replica starts in the same state and applies the **same deterministic operations in the same order**, every replica ends in the same state. This is **state machine replication** (SMR), the foundation of replicated databases, etcd, ZooKeeper and Kafka's replicated log. The whole difficulty is getting every replica to agree on the order: that requires **total order broadcast**, which in turn is equivalent to consensus (Chapter 5).

Weaker broadcast orders are cheaper and enough for some applications:

| Broadcast | Guarantee | Enough for |
|---|---|---|
| Best-effort | If the sender does not crash, every correct node delivers the message | Nothing that needs reliability |
| Reliable | If any correct node delivers it, all correct nodes do (even if the sender crashes mid-send) | Membership notices |
| FIFO | Reliable, and messages from the same sender are delivered in send order | Per-user event streams |
| Causal | Reliable, and if send(m1) → send(m2), every node delivers m1 before m2 | Chat and comments (replies after the messages they answer), collaborative apps |
| Total order (atomic) | Reliable, and all nodes deliver all messages in the same order | Replicated state machines, databases, locks |

## 4.2 Causal broadcast with vector clocks

A node delivers a message only when it has delivered everything the message causally depends on. With vector clocks, a message from sender *s* with vector *V* is deliverable at a node with delivered-vector *D* when *V*[*s*] = *D*[*s*] + 1 (it is the next message from *s*) and *V*[*k*] ≤ *D*[*k*] for every other *k* (everything *s* had seen, this node has seen too). Otherwise it waits in a buffer.

```python run Causal delivery holds back a reply that arrives before its question
nodes = ['A', 'B', 'C']

class Node:
    def __init__(self, name):
        self.name, self.delivered = name, {n: 0 for n in nodes}
        self.buffer, self.log = [], []
    def broadcast(self, text):
        v = dict(self.delivered); v[self.name] += 1
        self.delivered[self.name] += 1
        self.log.append(text)
        return (self.name, v, text)
    def receive(self, msg):
        self.buffer.append(msg)
        progress = True
        while progress:
            progress = False
            for m in list(self.buffer):
                s, v, text = m
                if v[s] == self.delivered[s] + 1 and all(v[k] <= self.delivered[k]
                        for k in nodes if k != s):
                    self.buffer.remove(m); self.delivered[s] += 1
                    self.log.append(text); progress = True
            # loop ends when no buffered message is deliverable

a, b, c = Node('A'), Node('B'), Node('C')
question = a.broadcast('A: is the meter service down?')
b.receive(question)
reply = b.broadcast('B: yes, failing over now')
c.receive(reply)                       # the network delivers the reply to C first ...
print('C after receiving only the reply :', c.log, '| buffered:', len(c.buffer))
c.receive(question)                    # ... and the question later
print('C after the question arrives:')
for line in c.log:
    print('   ', line)
```

## 4.3 Total order broadcast is consensus

With total order broadcast you can solve consensus: every node broadcasts its proposal, and every node decides the **first** proposal delivered, which is the same at every node because the order is the same. Conversely, with consensus you can build total order broadcast: run one consensus instance per log slot to decide which message goes in slot 1, slot 2 and so on. That is exactly what Multi-Paxos and Raft do. So the two problems are equivalent, and both are impossible to solve deterministically in a fully asynchronous system with even one crash (FLP, Chapter 5).

A simple **single-leader** (sequencer) total order is easy while the leader is alive: everyone sends messages to the leader, which stamps them with consecutive sequence numbers. The hard part is replacing the leader after it fails without two leaders stamping conflicting sequence numbers, and that is consensus again.

```python run A sequencer gives total order; replicas apply the same log
import random
rng = random.Random(4)
ops = [('A', 'deposit', 50), ('B', 'withdraw', 30), ('C', 'deposit', 20), ('A', 'withdraw',
        120)]

def apply(state, op):
    _, kind, amount = op
    if kind == 'deposit':
        return state + amount
    return state - amount if state >= amount else state          # reject overdraft

log = [(seq, op) for seq, op in enumerate(ops, start=1)]          # stamped by the leader
for replica in ['r1', 'r2', 'r3']:
    arrivals = log[:]
    rng.shuffle(arrivals)                                          # network reorders
    state, applied = 100, []
    for seq, op in sorted(arrivals):                               # apply in sequence order
        state = apply(state, op); applied.append(seq)
    print(f'{replica}: received in order {[s for s, _ in arrivals]}, applied {applied}, '
            f'balance {state}')

state_a = state_b = 100
for op in ops: state_a = apply(state_a, op)
for op in reversed(ops): state_b = apply(state_b, op)
print('applying the same operations in a different order gives', state_a, 'vs', state_b)
```

The last line is why order matters at all: with an overdraft rule, operations do not commute. In log order the balance ends at 20; in reverse order the withdrawal of 120 comes first and is rejected, and the replica ends at 140. Replicas applying the same operations in different orders would diverge silently.

## 4.4 Chain replication

Chain replication (used in Microsoft's Azure Storage design ideas, CRAQ, and HDFS's write pipeline) arranges replicas in a line: writes enter at the **head**, pass down the chain, and are acknowledged by the **tail**; reads go to the tail. Because the tail holds only writes that every replica has applied, reads are linearizable without any extra coordination.

| Property | Chain replication | Primary–backup with quorum acks |
|---|---|---|
| Write latency | Sum of hops along the chain | One round trip to a majority |
| Read load | All on the tail (CRAQ lets any node serve clean reads) | Leader, or followers with leases |
| Tolerates | n − 1 failures, with an external configuration service to repair the chain | Minority failures without an external service |
| Reconfiguration | Needs a separate consensus service (e.g. ZooKeeper) to manage the chain | Built into Raft/Paxos |

## 4.5 Practical lessons

- Replicated state machines need deterministic operations applied in the same order everywhere.
- Causal broadcast is achievable with vector clocks and stays available under partitions.
- Total order broadcast and consensus are equivalent: a replicated log is a sequence of consensus decisions.
- A leader makes ordering easy until it fails; safe leader replacement is the real problem.
