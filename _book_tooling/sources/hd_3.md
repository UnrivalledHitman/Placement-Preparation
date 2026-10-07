# Chapter 7: Consistency and Reliability
%Consistency choices in practice, consensus, distributed locks, retries, circuit breakers, bulkheads and rate limiting

## 7.1 CAP and PACELC in practice

CAP and PACELC were defined in the DBMS Theory guide (Chapter 9). In a design interview, apply them **per feature**, not per system:

| Feature | Choice | Reason |
|---|---|---|
| Payment ledger, inventory decrement, seat booking | Consistency (CP) | A wrong answer costs money or double-sells |
| Like counts, view counts, follower counts | Availability + low latency (AP/EL) | Briefly wrong numbers are harmless |
| User profile edits | Read-your-writes, otherwise eventual | The editor must see the change; others can lag |
| Chat message order within a conversation | Per-conversation ordering | Users notice reordering, not global order |
| Shopping cart | Availability with merge on conflict | Never refuse "add to cart" |

> TIP: Say it explicitly: "For the booking path I will use a strongly consistent store with a conditional write; for the feed and counters I accept eventual consistency in exchange for latency and availability."

## 7.2 Consensus and leader election

Many systems need one node to be in charge (a database primary, a partition leader, a scheduler). Choosing it safely across failures and network delays needs **consensus**: Raft or Paxos, usually through ZooKeeper, etcd or Consul rather than written by hand.

Raft in brief:

1. Nodes are followers, candidates or the leader. Time is divided into numbered **terms**.
2. A follower that hears no heartbeat for a randomised timeout becomes a candidate, increments the term and asks for votes.
3. A node votes for at most one candidate per term; a candidate with a **majority** becomes leader.
4. The leader appends client commands to its log and replicates them; an entry is **committed** once a majority stores it.
5. Majorities overlap, so two leaders cannot both commit in the same term, and a minority partition cannot make progress.

The simulation shows the effect of the **randomised** election timeout: with fixed timeouts, followers become candidates at the same moment, split the vote and must retry; randomising spreads them out so one usually wins at once.

```python run Raft-style elections: fixed versus randomised timeouts
import random

def elect(nodes, randomised, rng, max_rounds=50):
    for rounds in range(1, max_rounds + 1):
        if randomised:
            timeouts = [rng.uniform(150, 300) for _ in range(nodes)]
        else:
            timeouts = [200 + rng.uniform(0, 8) for _ in range(nodes)]    # nearly identical
        first = min(timeouts)
        # nodes whose timer fires before the first vote request arrives (~5 ms) also stand
        candidates = sorted((t, i) for i, t in enumerate(timeouts) if t - first < 5)
        winner_votes = 1 + (nodes - len(candidates))      # itself + every non-candidate
        if winner_votes > nodes // 2:
            return rounds
    return None                                           # no leader elected

rng = random.Random(9)
for mode in [False, True]:
    trials = [elect(5, mode, rng) for _ in range(2000)]
    ok = [t for t in trials if t is not None]
    print(f'{"randomised" if mode else "fixed     "} timeouts: average rounds '
            f'{sum(ok) / len(ok):.2f}, '
          f'worst {max(ok)}, no leader after 50 rounds in {trials.count(None)} of 2000 '
                  f'trials')
```

## 7.3 Distributed locks and fencing tokens

A distributed lock (for example Redis `SET lock:job42 owner NX PX 30000`, or an etcd lease) lets one worker at a time do something. The trap: a lock holder can pause (garbage collection, network stall) past the lock's expiry, another worker takes the lock, and the first worker then wakes up and writes, believing it still holds the lock.

The fix is a **fencing token**: the lock service hands out a strictly increasing number with each grant, and the storage being protected rejects writes carrying a token smaller than the largest it has seen.

```python run Fencing tokens stop a paused lock holder
class LockService:
    def __init__(self): self.token, self.holder, self.expires = 0, None, 0
    def acquire(self, who, now, ttl=10):
        if self.holder is None or now >= self.expires:
            self.token += 1; self.holder, self.expires = who, now + ttl
            return self.token
        return None

class Storage:
    def __init__(self,
            fenced): self.fenced, self.max_token, self.value, self.log = fenced, 0, None, []
    def write(self, who, token, value):
        if self.fenced and token < self.max_token:
            self.log.append(f'reject {who} (token {token} < {self.max_token})'); return
        self.max_token = max(self.max_token, token); self.value = value
        self.log.append(f'accept {who} token {token}: {value}')

for fenced in [False, True]:
    locks, store = LockService(), Storage(fenced)
    t_a = locks.acquire('A', now=0)   # A gets the lock, then pauses (GC) for 15 s
    t_b = locks.acquire('B', now=12)             # A's lease expired at 10: B gets the lock
    store.write('B', t_b, 'B-data')
    store.write('A', t_a, 'A-stale-data')        # A wakes up and writes
    print(('with' if fenced else 'without') + ' fencing:', '; '.join(store.log), '| final',
            store.value)
```

> NOTE: Martin Kleppmann's critique of Redlock makes exactly this point: a lock built on timeouts cannot be safe on its own; correctness needs the protected resource to check fencing tokens (or a conditional write such as a version check).

## 7.4 Retries, back-off and jitter

Retrying a failed call is essential for transient failures, and dangerous during overload: if every client retries immediately, a struggling service receives several times its normal load exactly when it can least afford it (a **retry storm**). Best practice:

- Retry only **idempotent** operations (or ones made idempotent with keys, Chapter 6).
- Use **exponential back-off** (100 ms, 200 ms, 400 ms …) with a cap and a maximum number of attempts.
- Add **jitter** (random spread), or clients that failed together retry together.
- Use a **retry budget**: retries limited to, say, 10% of normal traffic.

```python run Retry storms: no back-off, exponential, exponential with full jitter
import random
from collections import Counter

def load_profile(strategy, clients=1000, seed=3):
    rng = random.Random(seed)
    hits = Counter()
    for c in range(clients):
        t = 0.0                                   # all clients fail together at t = 0
        for attempt in range(6):
            if attempt > 0:
                hits[int(t * 10)] += 1            # retries only, bucket per 100 ms
            if strategy == 'immediate':
                delay = 0.05
            elif strategy == 'exponential':
                delay = 0.1 * 2 ** attempt
            elif strategy == 'full jitter':       # random in [0, cap]
                delay = rng.uniform(0, 0.1 * 2 ** attempt)
            else:                                 # equal jitter: half fixed, half random
                d = 0.1 * 2 ** attempt
                delay = d / 2 + rng.uniform(0, d / 2)
            t += delay
    return hits

for s in ['immediate', 'exponential', 'full jitter', 'equal jitter']:
    h = load_profile(s)
    print(f'{s:12} peak retries in one 100 ms slot: {max(h.values()):5}, '
          f'slots used over the retry period: {len(h):3}')
xs = range(0, 70)
for s in ['exponential', 'full jitter', 'equal jitter']:
    h = load_profile(s)
    plt.plot([x / 10 for x in xs], [h.get(x, 0) for x in xs], label=s)
plt.xlabel('seconds after the failure'); plt.ylabel('requests per 100 ms'); plt.legend()
plt.title('1000 clients retrying after a shared failure')
plt.tight_layout()
plt.savefig('hld_jitter.png', dpi=150)
```

![Jitter spreads retries out instead of synchronised spikes](figs/hld_jitter.png)

The results are worth reading carefully. Plain exponential back-off spaces the retries out, but all 1 000 clients still retry in the same instant each time, so every wave is a wall of 1 000 requests. Full jitter spreads the waves over about 29 slots instead of 5, but its busiest slot is actually *higher*: the first retry is drawn from 0–100 ms, so most first retries land together right after the failure, joined by early second retries. Equal jitter keeps half of each delay fixed, guaranteeing a minimum wait; it spreads the later waves over 28 slots, but its first wave still fits inside one 100 ms slot, so its peak equals plain back-off's. The practical lesson: jitter flattens the later waves, but the **first** retry needs a wide enough random window (hundreds of milliseconds to seconds for a shared outage), and a retry budget should cap the total. Assuming that any randomisation removes the spike is wrong.

## 7.5 Circuit breakers and bulkheads

A **circuit breaker** wraps calls to a dependency. When failures exceed a threshold it **opens** and fails fast for a cool-down period (returning a fallback) instead of piling up slow calls; then it lets a few trial calls through (**half-open**) and closes again if they succeed.

```python run A circuit breaker protecting callers from a failing dependency
class CircuitBreaker:
    def __init__(self, threshold=5, cooldown=10):
        self.state, self.failures, self.opened_at = 'CLOSED', 0, None
        self.threshold, self.cooldown = threshold, cooldown
    def call(self, now, dependency_ok):
        if self.state == 'OPEN':
            if now - self.opened_at < self.cooldown:
                return 'fast-fail (fallback)'
            self.state = 'HALF_OPEN'
        if dependency_ok:
            self.state, self.failures = 'CLOSED', 0
            return 'ok'
        self.failures += 1
        if self.state == 'HALF_OPEN' or self.failures >= self.threshold:
            self.state, self.opened_at = 'OPEN', now
        return 'error (slow timeout)'

cb = CircuitBreaker()
outcome = {}
for t in range(40):
    healthy = not (5 <= t < 25)                       # dependency down from t = 5 to 25
    r = cb.call(t, healthy)
    outcome[r] = outcome.get(r, 0) + 1
    if t in (4, 5, 9, 10, 19, 20, 21, 30):
        print(f't={t:2} dependency {"up  " if healthy else "DOWN"} -> {r:22} state '
                f'{cb.state}')
print('totals:', outcome)
```

During the 20-second outage, callers waited for a slow timeout only on the first few calls and on a few trial calls; everything else failed fast with a fallback, keeping threads free for healthy work. When the dependency recovered, a trial call succeeded and traffic resumed.

A **bulkhead** isolates resources so one failing dependency cannot exhaust them all: a separate thread pool or connection pool per dependency (payments get 20 threads, recommendations 10), so a hanging recommendation service cannot block checkout.

## 7.6 Rate limiting as a service

Rate-limiting algorithms were implemented and compared in the LLD guide (Chapter 8). Across many servers, the counters move to a shared store:

| Approach | How | Trade-off |
|---|---|---|
| Central counter in Redis | `INCR` + `EXPIRE` per window, or a Lua script implementing a token bucket atomically | Exact; one network round trip per request |
| Local limits per instance | Each of N servers allows limit/N | No network call; inaccurate when load is uneven across servers |
| Hybrid | Local token buckets refilled from a central budget periodically | Fast and close to exact |

Where to enforce: at the API gateway for per-user and per-IP limits; inside services for protecting specific expensive operations; at the database with connection pool limits as the last line.

## 7.7 Practical lessons

- Choose consistency per feature and say why.
- Use an existing consensus system (etcd, ZooKeeper) for leader election and configuration, not a home-made protocol.
- Distributed locks need fencing tokens or conditional writes to be safe.
- Retries need exponential back-off, jitter, a cap and a budget, and only for idempotent operations.
- Circuit breakers fail fast; bulkheads contain failures; both keep one bad dependency from taking everything down.

# Chapter 8: Microservices and APIs
%Service boundaries, communication styles, API design, distributed transactions and observability

## 8.1 Monolith or microservices?

| | Modular monolith | Microservices |
|---|---|---|
| Deployment | One unit | Independent per service |
| Team scaling | Fine up to a few teams | Each team owns and deploys its services |
| Scaling | Scale everything together | Scale hot services independently |
| Data | One database, joins and transactions are easy | Database per service; cross-service queries and transactions are hard |
| Operations | Simple | Service discovery, tracing, versioning, network failures |
| When | Early products, small teams (the usual right answer at first) | Large organisations, clear domain boundaries, different scaling needs |

> TIP: A good interview answer: "Start with a modular monolith with clean module boundaries; extract services where there is a real reason: independent scaling, a separate team, or a different technology need."

Draw service boundaries around **business capabilities** (orders, payments, catalogue, notifications), each owning its data. Services that must change together, or that need each other's data on every request, probably belong together.

## 8.2 Service discovery and communication

| Concern | Options |
|---|---|
| Discovery | Client-side (service registry such as Consul or Eureka; client picks an instance) or server-side (load balancer / Kubernetes Service DNS) |
| Synchronous calls | REST over HTTP/JSON, gRPC over HTTP/2 with Protocol Buffers |
| Asynchronous calls | Events through Kafka or RabbitMQ (Chapter 6) |
| Cross-cutting networking | Service mesh (Istio, Linkerd): mTLS, retries, timeouts, traffic splitting in sidecar proxies |

| | REST | gRPC | GraphQL |
|---|---|---|---|
| Format | JSON over HTTP | Binary Protobuf over HTTP/2 | JSON; client specifies the fields |
| Strengths | Simple, cacheable, universal | Fast, typed contracts, streaming | Clients fetch exactly what a screen needs in one round trip |
| Weaknesses | Over- or under-fetching; loose contracts | Not browser-native; harder to debug | Caching and rate limiting are harder; expensive queries |
| Typical use | Public APIs | Internal service-to-service calls | Mobile and web front-ends over many back-end services |

## 8.3 API design essentials

| Practice | Example |
|---|---|
| Resource-oriented URLs, standard methods | `GET /orders/42`, `POST /orders`, `PATCH /orders/42` |
| Correct status codes | `201 Created`, `400` invalid input, `404`, `409` conflict, `429` rate limited, `503` |
| Pagination with cursors | `GET /feed?cursor=eyJpZCI6...&limit=20` (stable under inserts, unlike offsets) |
| Idempotency keys for unsafe operations | `POST /payments` with `Idempotency-Key` header |
| Versioning | `/v2/...` or a header; never break existing clients silently |
| Timeouts on every call | Each hop's timeout shorter than its caller's |

```python run Offset versus cursor pagination when new items arrive
items = list(range(100, 0, -1))                       # newest first: ids 100..1

def page_offset(data, page, size=5):
    return data[page * size:(page + 1) * size]

def page_cursor(data, after_id, size=5):
    start = 0 if after_id is None else next(i for i, x in enumerate(data) if x < after_id)
    return data[start:start + size]

p1 = page_offset(items, 0); c1 = page_cursor(items, None)
items = [102, 101] + items                            # two new posts arrive before page 2
p2 = page_offset(items, 1); c2 = page_cursor(items, c1[-1])
print('offset pages:', p1, p2, '-> duplicates', sorted(set(p1) & set(p2)))
print('cursor pages:', c1, c2, '-> duplicates', sorted(set(c1) & set(c2)))
```

## 8.4 Distributed transactions: sagas

With a database per service, one business operation (book a trip: flight, hotel, payment) spans several databases. Two-phase commit (DBMS guide) blocks and couples services, so microservices use **sagas**: a sequence of local transactions, each publishing an event that triggers the next, with a **compensating** transaction to undo each completed step if a later one fails.

| Style | How | Trade-off |
|---|---|---|
| Choreography | Each service reacts to events and emits its own | Loose coupling; the overall flow is hard to see |
| Orchestration | A saga orchestrator tells each service what to do next | Clear flow and error handling in one place; the orchestrator is a new component |

```python run An orchestrated saga with compensations
def run_saga(steps, fail_at=None):
    done, log = [], []
    for name, action, compensate in steps:
        if name == fail_at:
            log.append(f'{name}: FAILED')
            for prev_name, _, prev_comp in reversed(done):
                log.append(f'  compensate {prev_name}: {prev_comp}')
            return 'ROLLED BACK', log
        log.append(f'{name}: {action}')
        done.append((name, action, compensate))
    return 'COMPLETED', log

trip = [('flight', 'seat 14C held', 'release seat 14C'),
        ('hotel', 'room 305 reserved', 'cancel room 305'),
        ('payment', 'Rs 18,500 charged', 'refund Rs 18,500'),
        ('confirm', 'itinerary emailed', 'send cancellation email')]
for fail in [None, 'payment']:
    status, log = run_saga(trip, fail)
    print(f'--- saga with failure at {fail}: {status}')
    print('\n'.join(log))
```

Sagas give up isolation: between steps, other transactions can see a hotel room reserved for a trip that will be compensated. Designs handle this with semantic locks (a "pending" status), by ordering steps so that the step most likely to fail runs first, and by making every step and compensation idempotent.

## 8.5 Observability

| Pillar | Answers | Tools |
|---|---|---|
| Metrics | Is something wrong? (rates, errors, latency percentiles, saturation) | Prometheus, Grafana; RED (rate, errors, duration) for services, USE (utilisation, saturation, errors) for resources |
| Logs | What happened in this request? | Structured JSON logs with a request id; ELK/Loki |
| Traces | Where did the time go across services? | OpenTelemetry, Jaeger, Zipkin: one trace id propagated through every hop |

Alert on symptoms users feel (error rate, p99 latency against the SLO, burn rate of the error budget), not on every CPU spike.

## 8.6 Practical lessons

- Start modular; split services along business capabilities when there is a reason.
- REST for public APIs, gRPC internally, GraphQL for flexible front-ends; events for decoupled workflows.
- Cursor pagination, idempotency keys, explicit versions and timeouts are API table stakes.
- Sagas replace distributed transactions; every step needs a compensation and idempotency.
- Instrument with metrics, structured logs and distributed traces from day one.
