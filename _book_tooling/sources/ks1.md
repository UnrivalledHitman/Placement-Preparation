# Solutions
%Every program executed against a real Redis server or SQLite

## Part 1 solutions

### K1.1 Hit ratio and latency

Average = h × 1 + (1 − h) × 41 = 41 − 40h ms. At h = 0.9: 41 − 36 = **5 ms**. For 10 ms: 41 − 40h = 10, so h = 31/40 = **77.5%**. Note how steep the curve is near 100%: going from 90% to 99% hits cuts the average from 5.0 to 1.4 ms, because the misses dominate.

```python run Checking K1.1 by simulation
import random
random.seed(7)
def avg_latency(h, n=200_000):
    return sum(1 if random.random() < h else 41 for _ in range(n)) / n
for h in (0.775, 0.9, 0.99):
    print(f'hit ratio {h:.1%}: simulated {avg_latency(h):.2f} ms, '
          f'formula {41 - 40 * h:.2f} ms')
```

### K1.2 An LRU cache

```python run An LRU cache with statistics
from collections import OrderedDict
class LRUCache:
    def __init__(self, capacity):
        self.capacity, self.data = capacity, OrderedDict()
        self.hits = self.misses = 0
    def get(self, key):
        if key not in self.data:
            self.misses += 1
            return None
        self.data.move_to_end(key)                 # most recently used goes to the end
        self.hits += 1
        return self.data[key]
    def put(self, key, value):
        if key in self.data:
            self.data.move_to_end(key)
        self.data[key] = value
        if len(self.data) > self.capacity:
            evicted, _ = self.data.popitem(last=False)   # least recently used is at the front
            print(f'  evicted {evicted}')
c = LRUCache(3)
for k in ['A', 'B', 'C']:
    c.put(k, k.lower())
c.get('A')                                         # A becomes most recent
c.put('D', 'd')                                    # evicts B, the least recent
c.get('B'); c.get('C'); c.put('E', 'e')            # evicts A
print('keys, oldest first:', list(c.data), '| hits', c.hits, 'misses', c.misses)
```

Both operations are O(1): `OrderedDict` is a hash map plus a doubly linked list, which is exactly the classic interview implementation (a `HashMap` of nodes plus a linked list in Java, or `LinkedHashMap` with `accessOrder = true` and `removeEldestEntry`).

### K1.3 A caching decorator

```python run A Redis caching decorator with negative caching
import functools, json
from backlab import redis_server
MISSING = '__none__'
def redis_cached(r, ttl, negative_ttl=30):
    def wrap(fn):
        @functools.wraps(fn)
        def inner(*args):
            key = f'cache:{fn.__name__}:' + json.dumps(args)
            hit = r.get(key)
            if hit is not None:
                return None if hit == MISSING else json.loads(hit)
            value = fn(*args)
            if value is None:
                r.set(key, MISSING, ex=negative_ttl)    # stop repeat misses hitting the DB
            else:
                r.set(key, json.dumps(value), ex=ttl)
            return value
        return inner
    return wrap
calls = []
with redis_server() as r:
    @redis_cached(r, ttl=300)
    def find_meter(meter_id):
        calls.append(meter_id)
        return {'id': meter_id, 'city': 'Pune'} if meter_id.startswith('SM-') else None
    for m in ['SM-1', 'SM-1', 'bogus', 'bogus', 'bogus', 'SM-2']:
        find_meter(m)
    print('database calls:', calls)
    print('negative entry TTL <= 30:', 0 < r.ttl('cache:find_meter:["bogus"]') <= 30)
```

Six calls, three database queries: the repeated lookups of the valid id **and** of the invalid id were served from Redis. The negative TTL is short so that a meter created a moment later appears quickly.

### K1.4 Stale profile

Likely causes:

1. **Two cache layers**: `@Cacheable` backed by an in-process Caffeine cache on each of the four instances. The instance that handled the update evicted its own copy; the other three keep serving the old name until their TTL expires ("only sometimes" = depends which instance the load balancer picks).
2. **Update order**: the code evicts the cache **before** the database transaction commits (for example `@CacheEvict` on a method that runs inside a longer transaction); a concurrent read reloads the old row and caches it again.
3. The read-reload race of guide Section 1.4 (a slow reader writes an old value after the eviction).
4. Reads served by a lagging **read replica** right after the write, which then get cached.
5. A CDN or browser caching the profile response.

Fixes: use only a shared Redis cache for mutable data, or broadcast invalidations to all instances (Redis Pub/Sub, or a short in-process TTL); evict **after commit** (`@TransactionalEventListener(phase = AFTER_COMMIT)`); delete-after-write with a delayed second delete; read-your-writes (route the user's reads to the primary shortly after a write); `Cache-Control: private, no-cache` for profile endpoints; keep a TTL as the safety net.

### K1.5 TTL jitter

```python run Expiry spread with and without jitter
import random
from collections import Counter
random.seed(3)
created = 1000.0
plain = Counter(int(created + 60) for _ in range(10_000))
jittered = Counter(int(created + 60 * random.uniform(0.9, 1.1)) for _ in range(10_000))
print('without jitter: busiest second has', max(plain.values()), 'expiries, spread over',
      len(plain), 'second(s)')
print('with ±10% jitter: busiest second has', max(jittered.values()), 'expiries, spread over',
      len(jittered), 'seconds')
```

All 10,000 keys expiring in the same second means 10,000 simultaneous misses (a stampede across many keys at once). Jitter spreads them over 12 seconds and cuts the peak by about a factor of ten. In Redis, apply it as `ex=int(ttl * random.uniform(0.9, 1.1))`.

### K1.6 Leaderboard

```python run A sorted-set leaderboard with rank and neighbours
from backlab import redis_server
with redis_server() as r:
    savings = {'Priya': 41, 'Arjun': 35, 'Meera': 52, 'Kabir': 18, 'Zara': 35, 'Dev': 27}
    r.zadd('savers', savings)
    r.zincrby('savers', 10, 'Kabir')                     # Kabir saves 10 more kWh
    print('top 3:', r.zrevrange('savers', 0, 2, withscores=True))
    rank = r.zrevrank('savers', 'Dev')
    print('Dev is number', rank + 1, 'of', r.zcard('savers'))
    around = r.zrevrange('savers', max(rank - 2, 0), rank + 2, withscores=True)
    print('around Dev:', around)
```

Ties (Arjun and Zara at 35) are ordered by member name in reverse (`ZREVRANGE` reverses the lexicographic tie-break too); if ties must favour whoever reached the score first, encode a time component in the score. Each operation is O(log n), so this scales to millions of users.

## Part 2 solutions

### K2.1 Token bucket by hand

At t = 0 the bucket holds 10: of 12 requests, **10 allowed**, 2 refused, 0 tokens left. At t = 1, 2 tokens have refilled: of 3 requests, **2 allowed**, 1 refused. At t = 4, 3 seconds × 2 = 6 tokens: all **6 allowed**. Total 18 of 21.

```python run Checking K2.1
def bucket(capacity, rate, batches):
    tokens, last = capacity, 0.0
    for t, n in batches:
        tokens = min(capacity, tokens + (t - last) * rate); last = t
        allowed = min(n, int(tokens)); tokens -= allowed
        print(f't={t}: {n} requests, {allowed} allowed, {n - allowed} refused, '
              f'{tokens:.0f} tokens left')
bucket(10, 2, [(0, 12), (1, 3), (4, 6)])
```

### K2.2 Sliding window counter

```python run The weighted sliding window counter versus the exact sliding log
from backlab import redis_server
LIMIT, W = 5, 60
def counter_allow(r, client, now):
    cur, prev = int(now // W), int(now // W) - 1
    elapsed = (now % W) / W
    c = int(r.get(f'sw:{client}:{cur}') or 0)
    p = int(r.get(f'sw:{client}:{prev}') or 0)
    if c + p * (1 - elapsed) >= LIMIT:                # estimated count in the last W seconds
        return False
    r.incr(f'sw:{client}:{cur}'); r.expire(f'sw:{client}:{cur}', 2 * W)
    return True
def log_allow(log, now):
    while log and log[0] <= now - W:
        log.pop(0)
    if len(log) >= LIMIT:
        return False
    log.append(now); return True
times = [50, 52, 54, 56, 58, 61, 63, 75, 95, 105, 112, 125]
with redis_server() as r:
    log = []
    for t in times:
        print(f't={t:3d}: counter {"allow" if counter_allow(r, "k", t) else "deny "}  '
              f'log {"allow" if log_allow(log, t) else "deny"}')
```

The two agree on the first burst, then diverge sharply: the counter allowed 11 of the 12 requests, the exact log only 7. All five early requests fell at the **end** of the first window (t = 50–58), but the counter assumes the previous window's requests were spread **evenly**, so as soon as the new window starts it discounts them (at t = 61 the estimate is 5 × 59/60 ≈ 4.92, just under the limit). Bursty traffic aligned with window edges is the worst case for this approximation; with smooth traffic from many clients the error is small (Cloudflare measured it to be rare on real traffic), and it costs only two integers per client instead of a timestamp per request. Choose the exact log (or a token bucket) when the limit protects something expensive.

### K2.3 Idempotency key design

| | `POST /transfers` | `POST /orders/{id}/cancel` |
|---|---|---|
| Who generates the key | The client, once per user intent (when the "Send" screen opens), reused on every retry | Not needed: cancel is naturally idempotent if implemented as "set status to CANCELLED if it is not already"; a second call returns the same result |
| Scope | Per user or per API client: `idem:{user_id}:{key}` (so keys from different users cannot collide or be probed) | — |
| Store | Redis for the fast path **and** a `UNIQUE (user_id, idempotency_key)` column in the transfers table as the ground truth | The order row itself (state machine) |
| Lifetime | At least the client's retry window: 24 hours is common | — |
| Stored with it | Request fingerprint (hash of the body), state (processing/done), status code and response body | — |
| Concurrent duplicate | 409 while the first is processing (or wait and then replay) | The second sees the order already cancelled and returns 200 with the same body (or 409 if the business wants to report "already cancelled") |
| Key reused with a different body | 422 | — |

Make the transfer itself a single database transaction (debit, credit, insert transfer row with the key) so that a crash leaves either everything or nothing; then the stored key and the money movement can never disagree.

### K2.4 Fencing tokens

```python run A storage service that rejects stale fencing tokens
import itertools
class LockService:
    def __init__(self):
        self.counter = itertools.count(1); self.holder = None
    def acquire(self, client):
        self.holder = client
        return next(self.counter)                    # monotonically increasing token
class Storage:
    def __init__(self):
        self.max_seen, self.value = 0, None
    def write(self, client, token, value):
        if token < self.max_seen:
            return f'{client}: REJECTED (token {token} < {self.max_seen})'
        self.max_seen, self.value = token, value
        return f'{client}: wrote {value!r} with token {token}'
locks, store = LockService(), Storage()
t1 = locks.acquire('client-1')
print('client-1 got token', t1, 'and then pauses (GC) past its lease...')
t2 = locks.acquire('client-2')                       # lease expired, client-2 now holds it
print('client-2 got token', t2)
print(store.write('client-2', t2, 'tariff=T3'))
print(store.write('client-1', t1, 'tariff=T1'))      # client-1 wakes, thinks it holds it
print('final value:', store.value)
```

The paused client's write is rejected **by the resource**, which is the only place that can enforce it. Databases provide the same check with a version column (`UPDATE ... WHERE version = :expected`).

### K2.5 The limiter that never resets

If the process crashes (or the connection drops, or a deploy kills it) after `INCR` created the key with count 1 but before `EXPIRE` ran, the key has **no TTL**. It then counts forever: once it reaches the limit, that user is blocked permanently.

```python run Reproducing the immortal counter, and two fixes
from backlab import redis_server
with redis_server() as r:
    def buggy(key, crash=False):
        count = r.incr(key)
        if crash:
            raise ConnectionError('process killed between INCR and EXPIRE')
        if count == 1:
            r.expire(key, 60)
        return count
    try:
        buggy('rl:u1', crash=True)
    except ConnectionError as e:
        print('crash:', e)
    for _ in range(5):
        buggy('rl:u1')
    print('count', r.get('rl:u1'), '| TTL', r.ttl('rl:u1'), '(-1 = never expires)')
    LUA = """local c = redis.call('INCR', KEYS[1])
             if c == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
             return c"""
    atomic = r.register_script(LUA)
    atomic(keys=['rl:u2'], args=[60])
    print('fix 1, Lua script: TTL', r.ttl('rl:u2'))
    pipe = r.pipeline(transaction=True)              # MULTI/EXEC: both or neither
    pipe.incr('rl:u3'); pipe.expire('rl:u3', 60, nx=True)
    print('fix 2, transaction with EXPIRE NX:', pipe.execute(), '| TTL', r.ttl('rl:u3'))
```

Both fixes make the increment and the expiry one atomic unit. `EXPIRE ... NX` (Redis 7) sets the TTL only if none exists, so the window keeps its original end. A monitoring check for rate-limit keys with TTL −1 would have caught the bug in production.

## Part 3 solutions

### K3.1 Fan-out and load sharing

```python run Two consumer groups on one stream; one group shares work between two instances
from backlab import redis_server
with redis_server() as r:
    for i in range(1, 7):
        r.xadd('readings', {'meter': f'SM-{i}'})
    for g in ('billing', 'alerts'):
        r.xgroup_create('readings', g, id='0')
    def take(group, consumer, n):
        resp = r.xreadgroup(group, consumer, {'readings': '>'}, count=n)
        got = [(mid, f['meter']) for mid, f in resp[0][1]] if resp else []
        for mid, _ in got:
            r.xack('readings', group, mid)
        return [m for _, m in got]
    print('billing-1:', take('billing', 'billing-1', 3))
    print('billing-2:', take('billing', 'billing-2', 3))
    print('alerts-1: ', take('alerts', 'alerts-1', 10))
```

Within the billing group, the six events were split between the two instances; the alerts group, reading the same stream independently, received all six. This is the Kafka model as well: one topic, a consumer group per service, partitions shared within a group.

### K3.2 Ordering by key

```python run Hash partitioning keeps each meter's events in order
import zlib
from collections import defaultdict
events = [(f'SM-{m}', seq) for seq in range(1, 4) for m in range(1, 7)]    # interleaved input
partitions = defaultdict(list)
for meter, seq in events:
    p = zlib.crc32(meter.encode()) % 3                  # same key -> same partition
    partitions[p].append((meter, seq))
for p in sorted(partitions):
    print(f'partition {p}:', ' '.join(f'{m}#{s}' for m, s in partitions[p]))
for meter in sorted({m for m, _ in events}):
    seqs = [s for p in partitions.values() for m, s in p if m == meter]
    assert seqs == sorted(seqs), meter
print('every meter saw its events in order: True')
```

Each partition is consumed by one consumer, in order, so all events of `SM-3` are processed sequentially, while the three partitions proceed in parallel. Choosing a key with too few values (a city) would put most traffic in one partition; adding partitions later changes `hash % n` and breaks per-key ordering during the change, so size partitions generously up front.

### K3.3 Designing an event

```text
{
  "event_id": "0b6f6c0e-3c2b-4c1e-9b0e-5d6a1c7f2e11",   // unique: consumers deduplicate on it
  "event_type": "ReadingRecorded",
  "schema_version": 2,
  "occurred_at": "2026-03-02T18:15:00Z",               // when it happened (meter time, UTC)
  "recorded_at": "2026-03-02T18:15:04Z",               // when the system accepted it
  "producer": "ingestion-service",
  "correlation_id": "req-7f3a...",                     // trace across services
  "subject": { "meter_id": "SM-42", "customer_id": "c1" },   // the partition key is meter_id
  "data": { "kwh": 0.42, "interval_minutes": 15, "quality": "estimated" }
}
```

Design rules: name events in the **past tense** (facts, not commands); include ids, both timestamps, and enough data that common consumers do not need to call back (**event-carried state transfer**), but not entire aggregates. Evolve **additively**: add optional fields with defaults; never rename, remove or change the meaning or unit of a field (that needs a new event type or a new major version published in parallel until consumers migrate). Consumers must ignore unknown fields. Register schemas (Avro, Protobuf or JSON Schema in a schema registry) and check compatibility in CI.

### K3.4 A saga with compensations

```python run An orchestrated saga: compensations run in reverse on failure
def run_saga(order, fail_at=None):
    log, compensations = [], []
    steps = [
        ('reserve stock', lambda: log.append('stock reserved'),
                          lambda: log.append('stock released')),
        ('charge payment', lambda: log.append('payment captured'),
                           lambda: log.append('payment refunded')),
        ('book delivery', lambda: log.append('delivery booked'),
                          lambda: log.append('delivery cancelled')),
    ]
    for name, action, compensate in steps:
        try:
            if name == fail_at:
                raise RuntimeError(f'{name} failed')
            action()
            compensations.append(compensate)
        except RuntimeError as e:
            log.append(f'ERROR: {e}')
            while compensations:
                compensations.pop()()                    # undo completed steps, newest first
            return 'cancelled', log
    return 'completed', log
for fail in ('charge payment', 'book delivery', None):
    status, log = run_saga('order-1', fail)
    print(f'fail at {fail!s:15} -> {status}: ' + '; '.join(log))
```

Compensations are business actions (refund, release), not database rollbacks: other systems may already have seen the intermediate state (the stock was reserved for a moment). Each step and compensation must be idempotent, because the orchestrator retries them after crashes; workflow engines such as Temporal persist the saga's progress for exactly that reason.

### K3.5 Consumer lag

```python run Lag growth, useful consumers and partitions needed
import math
produce, per_consumer, partitions = 1200, 250, 4
for consumers in (2, 4, 6):
    active = min(consumers, partitions)              # extra consumers sit idle
    rate = active * per_consumer
    growth = max(0, produce - rate)
    print(f'{consumers} consumers ({active} busy): consume {rate}/s, '
          f'lag grows {growth}/s = {growth * 3600:,} per hour')
need = math.ceil(produce * 1.5 / per_consumer)
print(f'with a 50% margin: {produce * 1.5:.0f}/s needs {need} consumers, '
      f'so at least {need} partitions')
```

With 4 partitions, at most 4 consumers in the group can work, giving 1,000/s against 1,200/s: the lag grows by 200 events a second (720,000 per hour) however many consumers are added. The fix is more partitions (8 or more) and consumers to match, or faster consumers (batching database writes is usually the biggest win). Monitor lag and alert on its growth, not just its size.

## Part 4 solutions

### K4.1 Priority queue

```python run Priority ordering with FIFO among equals, in one sorted set
from backlab import redis_server
with redis_server() as r:
    def enqueue(job, priority):
        seq = r.incr('jobs:seq')
        r.zadd('jobs', {job: -priority * 10**12 + seq})   # higher priority = lower score
    for job, prio in [('report-1', 1), ('otp-1', 9), ('email-1', 5), ('otp-2', 9),
                      ('report-2', 1), ('email-2', 5)]:
        enqueue(job, prio)
    order = []
    while (item := r.zpopmin('jobs')):
        order.append(item[0][0])
    print('processing order:', order)
```

`ZPOPMIN` takes the lowest score atomically, so several workers can share the queue without taking the same job (use `BZPOPMIN` to block while it is empty). Beware **starvation**: if high-priority jobs never stop, low ones never run; age old jobs (raise their priority over time) or reserve some workers per priority.

### K4.2 A resumable nightly job

1. **Chunk the work**: split 2 million meters into chunks (by id range, 10,000 each = 200 chunks) and enqueue one job per chunk, instead of one 3-hour loop.
2. **Track progress durably**: a `billing_run_chunk (run_id, chunk_no, status, attempts, finished_at)` table. Workers claim a chunk (`UPDATE ... SET status='running' WHERE status='pending' ...` with `SKIP LOCKED`), process it, mark it done. A crash affects one chunk; restarting the run only processes chunks not marked done.
3. **Idempotent billing**: a unique constraint on `bill (meter_id, billing_period)`; insert with `ON CONFLICT DO NOTHING` (or `INSERT IGNORE`), so a re-run chunk cannot bill twice. Payments or emails triggered by bills go through the outbox with the bill id as the idempotency key.
4. **Parallelise**: run 10–20 workers; the run finishes in a fraction of the time and the database load is controlled by the worker count.
5. **Observe**: progress = done chunks / total; alert if the run is not complete by 06:00; dead-letter chunks that fail repeatedly (bad data for one meter) instead of blocking the rest.
6. **Snapshot inputs**: bill from readings up to a fixed cut-off time recorded on the run, so re-runs produce the same numbers.

### K4.3 Back-off schedule

Delays min(60, 1 × 2<sup>n</sup>) for n = 0…7: 1, 2, 4, 8, 16, 32, 60, 60 seconds, total **183 s**. With **full jitter** each delay is a random value between 0 and that cap, so the expected total halves (about 91.5 s) and, more importantly, thousands of clients that failed at the same moment do not retry in synchronised waves.

```python run Checking K4.3, with the effect of full jitter on synchronised clients
import random
from collections import Counter
random.seed(5)
delays = [min(60, 2 ** n) for n in range(8)]
print('delays:', delays, '| total:', sum(delays), 's')
totals = [sum(random.uniform(0, d) for d in delays) for _ in range(10_000)]
print(f'full jitter, mean total over 10,000 runs: {sum(totals) / len(totals):.1f} s')
third = Counter(int(random.uniform(0, 4)) for _ in range(1000))     # the 3rd retry (cap 4 s)
print('1,000 clients, 3rd retry without jitter: all 1,000 at exactly 4 s')
print('with full jitter, clients retrying in each second:', dict(sorted(third.items())))
```
