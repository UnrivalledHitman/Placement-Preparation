# Chapter 5: Consensus: Paxos and Raft
%The consensus problem, FLP, quorum intersection, single-decree Paxos tested on thousands of schedules, and Raft's log replication and commit rule

## 5.1 The problem and the impossibility result

In **consensus**, each node proposes a value and all correct nodes must decide one. A correct algorithm guarantees:

| Property | Meaning | Kind |
|---|---|---|
| Agreement | No two nodes decide different values | Safety |
| Validity | The decided value was proposed by some node | Safety |
| Integrity | A node decides at most once | Safety |
| Termination | Every correct node eventually decides | Liveness |

The **FLP result** (Fischer, Lynch and Paterson, 1985) proves that in a fully asynchronous system, no deterministic algorithm can guarantee all four if even one node may crash: there is always an execution in which the algorithm stays undecided forever, because a slow node is indistinguishable from a crashed one. Practical algorithms escape by weakening the model, not the safety: **Paxos and Raft never violate safety under any timing**, and they terminate once the network behaves for long enough (partial synchrony), helped by randomised timeouts.

## 5.2 Quorums must intersect

Consensus algorithms make decisions with **quorums**: any decision needs agreement from a quorum, and any two quorums share at least one node, which carries knowledge of earlier decisions forward. Majorities of *N* nodes always intersect. **Flexible Paxos** (Howard and others, 2016) showed that only the quorums of different phases must intersect: a leader-election quorum *Q*<sub>1</sub> and a replication quorum *Q*<sub>2</sub> with *Q*<sub>1</sub> + *Q*<sub>2</sub> > *N*.

```python run Which quorum sizes always intersect?
from itertools import combinations

def always_intersect(n, q1, q2):
    nodes = range(n)
    return all(set(a) & set(b) for a in combinations(nodes, q1) for b in combinations(nodes,
            q2))

n = 5
for q1, q2 in [(3, 3), (4, 2), (5, 1), (2, 3), (3, 2)]:
    print(f'N={n}, election quorum {q1}, replication quorum {q2}: q1+q2={q1 + q2:2} -> '
          f'{"always intersect" if always_intersect(n, q1, q2) else "can be DISJOINT"}')
for n in [3, 5, 7]:
    print(f'N={n}: majority {n // 2 + 1}, tolerates {(n - 1) // 2} failed node(s)')
```

A 5-node cluster with replication quorum 2 commits writes faster (only 2 acknowledgements) but needs 4 votes to elect a leader. Clusters use odd sizes because a 4-node cluster tolerates no more failures than a 3-node one (both tolerate one).

## 5.3 Single-decree Paxos

Paxos (Lamport, 1998) decides one value with **proposers** and **acceptors** in two phases. Every proposal has a unique, increasing **ballot number**.

| Phase | Proposer | Acceptor |
|---|---|---|
| 1a Prepare | Send `prepare(b)` to all acceptors | |
| 1b Promise | | If `b` > every ballot promised so far, promise never to accept a lower ballot and reply with the highest-ballot value it has **already accepted**, if any |
| 2a Accept | With promises from a majority: propose the value of the highest-ballot accepted value among the replies, or **its own value only if none was reported** | |
| 2b Accepted | | If `b` ≥ its promise, accept (b, v) |

A value is **chosen** once a majority has accepted it in the same ballot. The rule in 2a is the heart of the algorithm: once a value might have been chosen, any later proposer is guaranteed to discover it (quorums intersect) and to propose it again, so a different value can never be chosen.

The simulation runs two competing proposers against five acceptors on a hostile network: messages are delivered in random order and 20% are dropped, and proposers time out and retry with higher ballots. A proposer that completes tells the other one (over the same lossy network), which then stops. It runs 2,000 different schedules, once with correct Paxos and once with a "simplified" proposer that skips the 2a rule and always proposes its own value.

```python run Paxos under 2,000 random schedules, correct and broken
import random

def simulate(seed, broken=False, n_acc=5, p_drop=0.2, max_steps=600):
    rng = random.Random(seed)
    promised, accepted = [0] * n_acc, [None] * n_acc          # accepted: (ballot, value)
    own_value = {1: 'X', 2: 'Y'}
    rounds = {1: 0, 2: 0}
    st = {p: {} for p in own_value}
    net, votes, chosen = [], {}, set()

    def start(p):
        rounds[p] += 1
        st[p] = dict(ballot=rounds[p] * 10 + p, phase='prepare', promises={}, acks=set(),
                wait=0)
        net.extend(('prepare', p, a, st[p]['ballot']) for a in range(n_acc))

    for p in own_value:
        start(p)
    for _ in range(max_steps):
        for p in own_value:
            st[p]['wait'] += 1
            if st[p]['phase'] != 'done' and st[p]['wait'] > 40:
                start(p)   # timeout: retry, higher ballot
        if not net:
            continue
        msg = net.pop(rng.randrange(len(net)))                 # random delivery order
        if rng.random() < p_drop:
            continue                                           # message lost
        kind = msg[0]
        if kind == 'prepare':
            _, p, a, b = msg
            if b > promised[a]:
                promised[a] = b
                net.append(('promise', a, p, b, accepted[a]))
        elif kind == 'promise':
            _, a, p, b, acc = msg
            s = st[p]
            if s['ballot'] == b and s['phase'] == 'prepare':
                s['promises'][a] = acc
                if len(s['promises']) > n_acc // 2:
                    prior = [x for x in s['promises'].values() if x]
                    value = own_value[p] if broken or not prior else max(prior)[1]
                    s.update(phase='accept', wait=0)
                    net.extend(('accept', p, a2, b, value) for a2 in range(n_acc))
        elif kind == 'accept':
            _, p, a, b, v = msg
            if b >= promised[a]:
                promised[a], accepted[a] = b, (b, v)
                net.append(('accepted', a, p, b))
                voters = votes.setdefault((b, v), set())
                voters.add(a)
                if len(voters) > n_acc // 2:
                    chosen.add(v)
        elif kind == 'accepted':
            _, a, p, b = msg
            s = st[p]
            if s['ballot'] == b and s['phase'] == 'accept':
                s['acks'].add(a)
                if len(s['acks']) > n_acc // 2:
                    s['phase'] = 'done'
                    net.append(('decided', 3 - p))             # tell the other proposer
        elif kind == 'decided':
            st[msg[1]]['phase'] = 'done'   # it learns and stops retrying
    return chosen

for broken in [False, True]:
    results = [simulate(seed, broken) for seed in range(2000)]
    unsafe = sum(len(c) > 1 for c in results)
    decided = sum(len(c) >= 1 for c in results)
    name = 'broken (ignores accepted values)' if broken else 'correct Paxos'
    print(f'{name:33}: two values chosen in {unsafe:4} runs, decided in {decided}/2000')
```

Correct Paxos never chooses two values, whatever the schedule. The broken variant looks reasonable and works in two schedules out of three, which is exactly why it is dangerous: in the other third (653 of 2,000), the second proposer retries with a higher ballot before it hears the outcome, ignores the value a majority has already accepted, and gets its own value accepted too, so two different values are chosen. Tests on a friendly network would rarely find this; randomised schedule exploration (and model checking with TLA+) finds it at once.

Every run here also decided eventually, but that is a property of these timeouts, not a guarantee: two proposers can keep pre-empting each other with ever-higher ballots (the **dueling proposers** livelock that FLP says cannot be ruled out). Real systems make it rare by electing a single distinguished proposer, the leader, with randomised retry delays.

## 5.4 Multi-Paxos and Raft

Deciding one value per round trip pair is slow. **Multi-Paxos** elects a stable leader that runs phase 1 once for all future log slots and then needs only phase 2 (one round trip) per entry. **Raft** (Ongaro and Ousterhout, 2014) is equivalent in power but was designed to be understandable; etcd, Consul, CockroachDB, TiKV and Kafka's KRaft use it. The HLD guide, §7.2, simulates Raft leader election; here we follow the log.

| Raft concept | Meaning |
|---|---|
| Term | A logical epoch with at most one leader; terms act like ballot numbers |
| Log entry | (index, term, command) |
| AppendEntries | Leader → follower: new entries plus (prevLogIndex, prevLogTerm) of the entry before them |
| Consistency check | Follower rejects unless its log has an entry at prevLogIndex with prevLogTerm |
| Log Matching property | If two logs have an entry with the same index and term, the logs are identical up to that index |
| Election restriction | A node votes only for a candidate whose log is at least as up to date (higher last term, or same last term and at least as long) |
| Commit rule | The leader marks index N committed when a majority store it **and** entry N is from the leader's current term |

### Repairing follower logs

After a crash, followers may be missing entries or hold extra entries from old terms that were never committed. The leader repairs them with the consistency check alone: on rejection it decrements that follower's `nextIndex` and retries, until the logs match; then the follower deletes everything after the match and appends the leader's entries.

```python run A new leader repairs three divergent followers
leader = [1, 1, 1, 4, 4, 5, 5, 6, 6, 6]        # terms of entries 1..10; leader is in term 8
followers = {
    'missing one entry': [1, 1, 1, 4, 4, 5, 5, 6, 6],
    'far behind': [1, 1, 1, 4],
    'extra entries from old leaders': [1, 1, 1, 2, 2, 2, 3, 3, 3, 3, 3],
}

def append_entries(log, prev_index, prev_term, entries):
    if prev_index > 0 and (len(log) < prev_index or log[prev_index - 1] != prev_term):
        return False, log                                   # consistency check fails
    return True, log[:prev_index] + entries                  # drop conflicts, append

for name, log in followers.items():
    next_index, rpcs = len(leader) + 1, 0
    while rpcs < 50:
        rpcs += 1
        prev = next_index - 1
        ok, new_log = append_entries(log, prev, leader[prev - 1] if prev else 0,
                leader[prev:])
        if ok:
            log = new_log
            break
        next_index -= 1
    print(f'{name:31}: matched after {rpcs:2} AppendEntries, log now equals leader: '
            f'{log == leader}')
```

The follower with extra entries from terms 2 and 3 has them deleted: they were never committed, so the leader's log wins. Real implementations speed up the backtracking by having the follower return the conflicting term and its first index, skipping a whole term per round trip.

### Why the commit rule mentions the current term

The subtle part of Raft is that a leader may **not** decide an entry from an earlier term is committed just because a majority now stores it. The program replays the scenario from Figure 8 of the Raft paper on five servers.

```python run The Figure 8 scenario: counting replicas is not enough
def up_to_date(candidate, voter):
    """Raft election restriction: candidate's log at least as up to date as voter's."""
    c_last, v_last = (candidate[-1] if candidate else 0), (voter[-1] if voter else 0)
    return c_last > v_last or (c_last == v_last and len(candidate) >= len(voter))

def votes_for(candidate, logs, down=()):
    return [s for s, log in logs.items() if s not in down and up_to_date(logs[candidate],
            log)]

# entry terms per server, index 1 onwards
# S1 led term 2, reached S2
logs = {'S1': [1, 2], 'S2': [1, 2], 'S3': [1], 'S4': [1], 'S5': [1]}
logs['S5'] = [1, 3]   # S1 crashes; S5 elected in term 3, writes index 2 locally
logs['S3'] = [1, 2]   # S5 crashes; S1 elected in term 4, copies index 2 to S3
holders = [s for s, log in logs.items() if len(log) >= 2 and log[1] == 2]
print('term-2 entry at index 2 is now on', holders, '- a majority of 5')
v = votes_for('S5', logs, down={'S1'})
print('if S1 crashes now, S5 can collect votes from', v, '->', 'ELECTED' if len(v) >= 3
        else 'not elected')
print('  ...and S5 would overwrite index 2 with its term-3 entry: the "committed" entry is '
        'lost')

for s in ['S1', 'S2', 'S3']:
    logs[s] = [1, 2, 4]   # correct rule: S1 first replicates an entry of term 4
v = votes_for('S5', logs, down={'S1'})
print('after a term-4 entry reaches a majority, S5 gets votes from', v, '->',
      'ELECTED' if len(v) >= 3 else 'cannot be elected')
```

Until an entry from the leader's own term is on a majority, an old-term entry on a majority can still be overwritten by a candidate whose last entry has a higher term. Once a current-term entry is on a majority, the election restriction guarantees that every future leader has it, and with it, by Log Matching, every earlier entry. That is why a new Raft leader immediately appends a no-op entry in its term: it commits everything before it.

## 5.5 Running consensus in production

| Concern | Technique |
|---|---|
| Reads | Reading from the leader is not enough (it may have been deposed). Use a **read index** (confirm leadership with a heartbeat round, then serve once applied) or **leader leases** (safe only with bounded clock drift) |
| Membership changes | Change one server at a time, or joint consensus (old and new majorities both required during the transition); never switch configurations atomically |
| Log growth | Snapshots of the state machine; followers far behind receive a snapshot instead of entries |
| Throughput | Batch many client commands per entry, pipeline AppendEntries, write to disk in parallel with sending |
| Cluster size | 3 or 5 voters; add non-voting learners for read scaling and catch-up |
| Disk durability | An acknowledged entry must be fsynced; skipping fsync voids the guarantees after a power loss |

## 5.6 Practical lessons

- Consensus: agreement, validity, integrity always; termination only under partial synchrony (FLP).
- Quorums must intersect; majorities do, and Flexible Paxos needs only Q1 + Q2 > N.
- Paxos is safe because a proposer must re-propose any value that might already be chosen.
- Raft commits an entry only when a current-term entry at or after it is on a majority; new leaders append a no-op.
