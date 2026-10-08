# Solutions
%Every simulation and checker executed; safety properties checked for every seed

## Part 1 solutions

### R1.1 Retries and duplicates

Each attempt has three outcomes: the request is lost (probability 0.02: not executed, no reply), the request arrives but the reply is lost (0.98 × 0.02 = 0.0196: **executed**, no reply), or the reply arrives (0.98 × 0.98 = 0.9604). The client stops at the first reply or after three attempts.

```python run Enumerating every outcome of up to three attempts
p = 0.02
outcomes = {'lost request': p, 'lost reply': (1 - p) * p, 'reply': (1 - p) ** 2}

def runs(attempts_left, prob=1.0, executions=0):
    """Yield (probability, executions, got_reply) for every way the retries can go."""
    for outcome, q in outcomes.items():
        execs = executions + (outcome != 'lost request')
        if outcome == 'reply':
            yield prob * q, execs, True                  # client stops
        elif attempts_left == 1:
            yield prob * q, execs, False                 # gave up
        else:
            yield from runs(attempts_left - 1, prob * q, execs)

all_runs = list(runs(3))
no_reply = sum(pr for pr, _, ok in all_runs if not ok)
dup = sum(pr for pr, ex, _ in all_runs if ex >= 2)
print(f'probabilities sum to {sum(pr for pr, _, _ in all_runs):.6f}')
print(f'never gets a reply      : {no_reply:.2e}')
print(f'executed more than once : {dup:.4f}  (about 1 request in {1 / dup:.0f})')
```

The client almost always gets an answer (it fails about 6 times in 100,000), but about 2% of requests that reach the server run **twice or more**, because a lost reply looks exactly like a lost request. For a payment, that is one double charge in every 50. Retries are only safe with idempotency: the server must recognise the second attempt (Chapter 1 of the guide, and the Advanced Backend guide's idempotency keys).

### R1.2 Lamport timestamps

```python run Lamport clocks, and a check for concurrency with vector clocks
nodes = ['P1', 'P2', 'P3']
L = {n: 0 for n in nodes}
V = {n: {m: 0 for m in nodes} for n in nodes}
stamp, vec, msgs = {}, {}, {}

def event(n, name, send=None, recv=None):
    if recv:
        L[n] = max(L[n], msgs[recv][0])
        for k in nodes:
            V[n][k] = max(V[n][k], msgs[recv][1][k])
    L[n] += 1; V[n][n] += 1
    stamp[name], vec[name] = L[n], dict(V[n])
    if send:
        msgs[send] = (L[n], dict(V[n]))

event('P1', 'a'); event('P1', 'send m1', send='m1'); event('P1', 'b')
event('P2', 'c'); event('P2', 'recv m1', recv='m1'); event('P2', 'send m2',
        send='m2'); event('P2', 'd')
event('P3', 'e'); event('P3', 'f'); event('P3', 'recv m2', recv='m2'); event('P3', 'g')
print('  '.join(f'{k}={v}' for k, v in stamp.items()))

def before(x, y):
    return all(vec[x][k] <= vec[y][k] for k in nodes) and vec[x] != vec[y]
pairs = [(x, y) for x in stamp for y in stamp
         if stamp[x] < stamp[y] and not before(x, y) and not before(y, x)]
print('L(x) < L(y) but concurrent, e.g.:', pairs[:4])
```

For example, L(e) = 1 < L(b) = 3, yet nothing connects them: e happens on P3 before P3 hears from anyone, and b happens on P1 after its only message went to P2. Lamport order is consistent with causality but invents an order between concurrent events.

### R1.3 Which cart versions survive?

```python run Dominance between version vectors
versions = {'v1': [2, 0, 0], 'v2': [2, 1, 0], 'v3': [2, 0, 1], 'v4': [1, 0, 0]}
dominates = lambda a, b: all(x >= y for x, y in zip(a, b)) and a != b
obsolete = {n for n, v in versions.items() if any(dominates(w, v)
        for w in versions.values())}
siblings = sorted(set(versions) - obsolete)
print('obsolete:', sorted(obsolete), '| siblings:', siblings)
merged = [max(col) for col in zip(*(versions[s] for s in siblings))]
merged[0] += 1   # the merged write goes through replica X
print('merged cart written through X gets', merged)
```

v4 and v1 are ancestors of later versions and can be discarded. v2 (updated through Y) and v3 (through Z) are concurrent: each saw v1 but not the other, so both must be kept and shown to the client, which merges the carts (for example, the union of items, or a CRDT as in Chapter 6). The merged write's vector [3, 1, 1] dominates both siblings, so every replica will discard them once it sees it.

### R1.4 How often does LWW drop a later write?

The error difference D = e<sub>B</sub> − e<sub>A</sub> is triangular on [−50, 50] ms. B's write (30 ms later in real time) gets the lower timestamp when D < −30, with probability (50 − 30)<sup>2</sup> / (2 × 50<sup>2</sup>) = 400 / 5,000 = **8%**. For writes 10 ms apart: 40<sup>2</sup> / 5,000 = **32%**.

```python run Checking by simulation
import random
rng = random.Random(12)
for gap in [30, 10]:
    trials = 400_000
    lost = sum(gap + rng.uniform(-25, 25) - rng.uniform(-25, 25) < 0 for _ in range(trials))
    exact = max(0, 50 - gap) ** 2 / (2 * 50 ** 2)
    print(f'writes {gap} ms apart: later write lost in {lost / trials:6.2%} (formula '
            f'{exact:.2%})')
```

Ordinary NTP accuracy is enough to lose a large share of near-simultaneous updates, silently. Use LWW only where losing concurrent writes is acceptable, or attach version vectors.

### R1.5 Tuning phi accrual

```python run Phi for normally distributed heartbeats
import math

def phi(t, mu=1000, sigma=100):
    p_later = 0.5 * math.erfc((t - mu) / (sigma * math.sqrt(2)))
    return -math.log10(p_later)

for t in [1200, 1500, 2000]:
    print(f'{t} ms of silence: phi = {phi(t):5.2f}')
threshold = -math.log10(1 / 86_400)                  # one false alarm per 86,400 heartbeats
t = 1000
while phi(t) < threshold and t < 10_000:
    t += 1
print(f'threshold for one false suspicion a day: phi > {threshold:.2f}, '
      f'fires {t} ms after the last heartbeat')
```

A heartbeat is due every second, so a day has about 86,400 chances for a false alarm; a threshold of φ ≈ 4.94 makes each one a 1-in-86,400 event. It fires about 1.42 s after the last heartbeat of a crashed node, roughly 0.42 s after the next heartbeat was due. A busier network (larger σ) automatically pushes that time out; that adaptivity is the point of phi accrual.

### R1.6 The payment that timed out

Possible states at the bank: the request never arrived; it arrived and is still queued; it was rejected; it was executed and the reply was lost; it is half-done inside the bank's own systems. The caller cannot distinguish them.

- **Retry blindly** risks paying twice.
- **Report failure** risks telling the customer the payment failed when the money has moved; they pay again by another route.

A safe protocol:

| Step | Action |
|---|---|
| 1 | Before calling, write the payment to the database as `PENDING` with a unique **idempotency key** (the outbox pattern guarantees the record and the intent to call are saved together) |
| 2 | Call the bank with the key; on timeout, keep the status `PENDING` (unknown, not failed) |
| 3 | Retry with the **same** key, with back-off; the bank returns the original result instead of executing again |
| 4 | Tell the customer "processing" while pending, never "failed" |
| 5 | Without idempotency support: query the bank's transaction status by your reference before any retry, and run a **reconciliation** job against the bank's statement to settle every `PENDING` payment |

## Part 2 solutions

### R2.1 Is it linearizable?

```python run Checking the four histories
from itertools import permutations

def linearizable(history, initial=0):
    n = len(history)
    for order in permutations(range(n)):
        pos = {op: i for i, op in enumerate(order)}
        if any(history[a][4] < history[b][3] and pos[a] > pos[b] for a in range(n)
                for b in range(n)):
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
            return ' < '.join(f'{history[i][0]}:{history[i][1]}{history[i][2]}'
                    for i in order)
    return None

cases = {
    '(a)': [('A', 'w', 1, 0, 10), ('B', 'r', 1, 2, 4), ('C', 'r', 0, 6, 8)],
    '(b)': [('A', 'w', 1, 0, 10), ('B', 'r', 0, 2, 4), ('C', 'r', 1, 6, 8)],
    '(c)': [('A', 'w', 1, 0, 4), ('B', 'w', 2, 2, 8), ('C', 'r', 1, 9, 12)],
    '(d)': [('A', 'w', 1, 0, 4), ('B', 'w', 2, 6, 8), ('C', 'r', 1, 9, 12)],
}
for name, h in cases.items():
    order = linearizable(h)
    print(f'{name} ' + (f'linearizable: {order}' if order else 'NOT linearizable'))
```

(a) fails because C's read starts after B has already seen 1, so it must not return 0. (b) is fine: the write takes effect between the two reads. (c) is fine because the writes overlap, so B's write may take effect first and A's second. (d) fails: B's write finished before C started and after A's write, so C must read 2.

### R2.2 Name the broken guarantee

| Anomaly | Weakest guarantee that prevents it |
|---|---|
| (a) Own new picture not visible after refresh | Read-your-writes |
| (b) Comment appears, then disappears | Monotonic reads |
| (c) Reply visible before the question | Causal consistency (writes-follow-reads) |
| (d) Two users register the same username | Linearizability (a single agreed decision, e.g. consensus or a unique constraint on one primary) |
| (e) One user's two edits applied in the wrong order | Monotonic writes |

Only (d) needs coordination across all users; (a), (b) and (e) are per-session and (c) needs causal metadata, all of which stay available during partitions.

### R2.3 Causal delivery order

```python run Delivering at node D
nodes = ['A', 'B', 'C', 'D']
msgs = {'m1': ('A', {'A': 1, 'B': 0, 'C': 0, 'D': 0}),
        'm2': ('B', {'A': 1, 'B': 1, 'C': 0, 'D': 0}),      # B had delivered m1
        'm3': ('C', {'A': 0, 'B': 0, 'C': 1, 'D': 0})}
delivered, buffer, log = {n: 0 for n in nodes}, [], []
for arriving in ['m2', 'm3', 'm1']:
    buffer.append(arriving)
    progress = True
    while progress:
        progress = False
        for m in list(buffer):
            s, v = msgs[m]
            if v[s] == delivered[s] + 1 and all(v[k] <= delivered[k] for k in nodes
                    if k != s):
                buffer.remove(m); delivered[s] += 1; log.append(m); progress = True
    print(f'after {arriving} arrives: delivered {log}, waiting {buffer}')
```

m2 waits because it depends on m1, which D has not seen; m3 is concurrent with both and is delivered immediately; when m1 arrives, it is delivered and releases m2.

### R2.4 Quorum arithmetic

```python run Overlap and availability for N = 5
from math import comb
n, up = 5, 0.99
print('overlapping (W, R):', [(w, r) for w in range(1, 6) for r in range(1, 6) if w + r > n
        and w + r == n + 1])
for w in [3, 5]:
    p = sum(comb(n, k) * up ** k * (1 - up) ** (n - k) for k in range(w, n + 1))
    print(f'W={w}: tolerates {n - w} down; write possible {p:.6%} of the time')
```

(a) Any W + R > 5; the minimal pairs are listed. (b) W = 3 and R = 3 each tolerate 2 failed replicas. (c) A majority write is possible 99.999% of the time; W = 5 only 95.1%, because any single failure blocks it. That is the cost of "write all, read one".

### R2.5 When does order matter?

```python run Commutative versus non-commutative operations
import random
rng = random.Random(21)
counter_ops = [3, 5, 2, 7, 1]
account_ops = [('deposit', 50), ('withdraw', 80), ('deposit', 40), ('withdraw', 60),
        ('deposit', 10)]

def apply_account(ops, balance=30):
    for kind, amount in ops:
        if kind == 'deposit':
            balance += amount
        elif balance >= amount:
            balance -= amount                        # otherwise rejected
    return balance

counters, accounts = [], []
for _ in range(3):
    c, a = counter_ops[:], account_ops[:]
    rng.shuffle(c); rng.shuffle(a)
    counters.append(sum(c)); accounts.append(apply_account(a))
print('counter replicas :', counters)
print('account replicas :', accounts)
```

Increments **commute**, so any delivery order gives the same total: a counter can be replicated with reliable broadcast only (or as a CRDT). The overdraft check makes account operations order-dependent, so replicas diverge unless they all apply the same order, which needs total order broadcast, that is, consensus.

### R2.6 Where is linearizability needed?

| Feature | Linearizable? | Why |
|---|---|---|
| (a) Scheduler leader election | Yes | Two leaders would run jobs twice |
| (b) Social feed | No | A slightly stale or reordered feed harms nobody; causal order for replies is enough |
| (c) Seat booking | Yes | Two buyers must not both get the seat |
| (d) View counter | No | A CRDT counter converges; approximate counts are fine |
| (e) Coupon redeemed check | Yes | A stale "not redeemed" lets it be used twice |
| (f) Product catalogue | No | Eventual consistency with cache invalidation; prices at checkout are re-read from the primary |
