# Solutions

## Part 1 solutions

### H1.1 Requests per second

```python run QPS and servers
import math
per_day = 50e6 * 20
avg = per_day / 86_400
peak = 3 * avg
servers = math.ceil(peak / (2_000 * 0.6))
print(f'average {avg:,.0f} QPS, peak {peak:,.0f} QPS -> {servers} servers at 60% peak '
        f'utilisation')
```

A billion actions a day is about 11 600 requests/s on average (quick check: 10<sup>9</sup> / 10<sup>5</sup> = 10 000). Add at least one or two servers beyond the computed count so that a server failure at peak does not push the rest past their limit.

### H1.2 Photo storage

```python run Five years of photos
per_photo = 2e6 + 3 * 50e3                       # bytes
per_day = 10e6 * per_photo
raw = per_day * 365 * 5
for label, factor in [('3x replication', 3), ('erasure coding 1.5x', 1.5)]:
    print(f'{label:20}: {raw * factor / 1e15:6.1f} PB   (raw {raw / 1e15:.1f} PB, '
            f'{per_day / 1e12:.1f} TB/day)')
```

Erasure coding (for example 6 data + 3 parity fragments) halves the overhead of triple replication with similar durability, which is why object stores use it for cold data. At this scale photos also move to cheaper storage classes as they age.

### H1.3 Availability of a stack

```python run Series and parallel availability
lb = 0.9999
app = 1 - (1 - 0.995) ** 3                       # any 1 of 3 replicas
db = 1 - (1 - 0.9995) ** 2                       # primary or standby
total = lb * app * db
print(f'app tier {app:.7%}, db tier {db:.7%}, end to end {total:.5%}')
print(f'allowed downtime: {(1 - total) * 30 * 24 * 60:.1f} minutes per month')
```

The redundant tiers become almost perfect, so the single load balancer dominates: end-to-end availability is essentially its 99.99%. The next improvement is a redundant load balancer pair. (This model assumes failures are independent and failover is instant; in reality correlated failures and failover time lower the figure.)

### H1.4 Tail latency with fan-out

```python run Fan-out and the required backend percentile
p_slow_page = 1 - 0.99 ** 20
needed = 0.99 ** (1 / 20)
print(f'pages waiting > 100 ms: {p_slow_page:.1%}')
print(f'each backend must be under 100 ms at p{needed * 100:.2f}')
```

Even with every backend meeting its p99, almost one page load in five is slow. To make 99% of page loads fast, each backend must meet 100 ms at about p99.95. That is the quantitative case for hedged requests (send a duplicate after a delay), timeouts with fallbacks, and reducing fan-out.

### H1.5 Video bandwidth

1 M × 3 Mbps = **3 Tbps** of egress. With 95% served by the CDN, the origin sends **150 Gbps**, still large, which is why popular video is pre-pushed to edge caches and origins are themselves tiered (regional mid-tier caches in front of the storage).

### H1.6 Session cache size

```python run Redis nodes for sessions
import math
data_gb = 20e6 * 1e3 * 1.5 / 1e9
primaries = math.ceil(data_gb / 25)
print(f'data {data_gb:.0f} GB -> {primaries} primaries + {primaries} replicas = '
        f'{2 * primaries} nodes')
print(f'with nodes at most 70% full: {math.ceil(data_gb / (25 * 0.7))} primaries')
```

30 GB of session data needs 2 primaries, plus a replica each: 4 nodes. Keeping nodes under about 70% full (room for growth, fragmentation and replication buffers) still gives 2 primaries here; with a third, the cluster can absorb a year of growth.

## Part 2 solutions

### H2.1 Pick the store

(a) **Relational database**: transactions across orders, payments and inventory. (b) **Search engine** (Elasticsearch/OpenSearch) fed from the primary store. (c) **Key-value store** (Redis or DynamoDB) keyed by user, with expiry for abandoned carts. (d) **Time-series or wide-column store** partitioned by meter and time. (e) **Object storage** behind a CDN, metadata in SQL. (f) **Graph database**, or precomputed recommendations from a batch job over the social graph.

### H2.2 Choose the shard key

| Shard key | "My orders, newest first" | "Order by id" | "Yesterday's orders" | Verdict |
|---|---|---|---|---|
| user_id | One shard (best) | Needs the user: embed the shard (or user id) in the order id | Scatter–gather, acceptable at night | **Choose this** |
| order_id (hash) | Scatter–gather on every request | One shard | Scatter–gather | Bad for the hottest query |
| created_at (range) | Scatter–gather | Needs the date | One shard, but all **writes** hit the newest shard | Hot spot |

Shard by **user_id**, and encode the shard (or user id) into the order id so lookups by order id go straight to the right shard. Run the nightly report on a replica or from an analytics copy (CDC into a warehouse).

### H2.3 Removing a node from a ring

```python run Who absorbs the removed node's keys?
import hashlib, bisect
from collections import Counter

def h(s): return int(hashlib.md5(s.encode()).hexdigest()[:12], 16)
keys = [f'k{i}' for i in range(50_000)]

def assign(nodes, v):
    ring = sorted((h(f'{n}#{i}'), n) for n in nodes for i in range(v))
    pts = [p for p, _ in ring]
    return {k: ring[bisect.bisect(pts, h(k)) % len(ring)][1] for k in keys}

nodes = [f'n{i}' for i in range(10)]
for v in [1, 200]:
    before, after = assign(nodes, v), assign(nodes[:-1], v)
    moved = [k for k in keys if before[k] != after[k]]
    receivers = Counter(after[k] for k in moved)
    print(f'{v:3} vnodes: {len(moved) / len(keys):5.1%} of keys moved, all from the '
            f'removed node: '
          f'{all(before[k] == "n9" for k in moved)}, received by {len(receivers)} nodes')
```

Only the removed node's keys move in both cases (about 1/10 of keys, or whatever share the node owned). The difference is where they go: with one point per server, all of them land on the next node clockwise, which may double its load; with 200 virtual nodes, they spread across all nine survivors.

### H2.4 How many shards?

```python run Shards from storage and write rate
import math
def shards(tb, writes, tb_per_shard=2, writes_per_shard=2_000, headroom=0.5):
    by_storage = math.ceil(tb / (tb_per_shard * headroom))
    by_writes = math.ceil(writes / (writes_per_shard * headroom))
    return by_storage, by_writes, max(by_storage, by_writes)

for year, tb in [(0, 40), (2, 60)]:
    s, w, n = shards(tb, 5_000)
    print(f'year {year}: {tb} TB -> storage needs {s}, writes need {w} -> {n} shards')
```

The design is **storage-bound**: 40 shards today and 60 in two years, while the write rate alone would need only 5. That suggests moving old data to a cheaper tier (archive orders older than two years) before adding shards, and creating many logical partitions up front so that growth only moves partitions.

### H2.5 L4 or L7?

(a) **L7**: routing by path. (b) **L4**: a custom TCP protocol; L4 adds the least latency. (c) **L7**: weighted routing of HTTP requests (or by header/cookie). (d) **L4** in front of the database, or a database-aware proxy (ProxySQL, PgBouncer) when you need connection pooling or read/write splitting.

### H2.6 Cache headers for a CDN

(a) `Cache-Control: public, max-age=31536000, immutable`: the content hash in the filename changes with every build. (b) `no-cache` (revalidate every time) or a short `max-age`, because it points to the current asset versions. (c) `public, max-age=60, stale-while-revalidate=300`: briefly cached, refreshed in the background. (d) `private, no-store`: personal data must never be cached by shared caches.

## Part 3 solutions

### H3.1 Effective latency

```python run Average latency versus hit ratio
hit, db = 1.0, 20.0
avg = lambda h: h * hit + (1 - h) * (hit + db)      # a miss pays the cache check and the DB
print(f'90% hits: {avg(0.90):.1f} ms average')
needed = 1 - (2.0 - hit) / db
print(f'hit ratio for a 2 ms average: {needed:.0%} (check: {avg(needed):.2f} ms)')
```

Going from 90% to 95% hits cuts the average by a third. Near the top, every extra point of hit ratio matters a lot, because the miss path dominates the average.

### H3.2 TTL jitter

```python run Expiry bursts with and without jitter
import random
from collections import Counter
rng = random.Random(1)
plain = Counter(300 for _ in range(10_000))
jittered = Counter(int(300 * rng.uniform(0.9, 1.1)) for _ in range(10_000))
print(f'no jitter : peak {max(plain.values()):,} expiries in one second')
print(f'±10% jitter: peak {max(jittered.values()):,} expiries in one second, spread over '
      f'{len(jittered)} seconds')
```

All 10 000 keys expire in the same second without jitter, which turns into 10 000 simultaneous database reads; ±10% spreads them over a minute, cutting the peak by about fifty times.

### H3.3 Choose the caching pattern

(a) **Cache-aside** with delete-on-write and a TTL. (b) **Write-back**: increment in Redis and flush aggregated counts to the database periodically (a few lost increments after a crash are acceptable). (c) **Write-around**: write straight to the database (or log store); do not pollute the cache. (d) **Write-through** (or cache-aside plus read-your-writes routing), so the user sees the saved value immediately.

### H3.4 Invalidation across layers

1. Update the database (the source of truth) and publish a `price.changed` event through the outbox (guide, Chapter 6).
2. Delete the Redis key on that event.
3. Each app server subscribes to the event (pub/sub) and evicts its in-process entry; in-process entries also get a short TTL (for example 30 s) in case an event is missed.
4. Purge the CDN object through the CDN's purge API (or rely on its 60 s TTL for public pages).

Remaining staleness: at most a second or two for the event-driven layers in normal operation, bounded by the in-process TTL if an event is lost, and up to 60 s at the CDN without a purge. If a stale price is unacceptable at checkout, the **checkout service reads the price from the database** (or a strongly consistent store) and treats the cached price as display-only.

## Part 4 solutions

### H4.1 Kafka partitions

50 000 / 2 000 = 25 consumers are needed, and a consumer group can use at most one consumer per partition, so at least 25 partitions. Choose more for headroom and growth (for example **48 or 64**): adding partitions later changes which partition a key maps to, which breaks per-key ordering during the change. The partition key is **user_id**, so each user's messages stay in order on one partition.

### H4.2 Delivery guarantees

(a) **At most once** is acceptable (losing a few clicks does not matter), though at least once is cheap too. (b) **Effectively once**: at-least-once delivery plus an idempotency key. (c) **At least once** with deduplication on a message id; a rare duplicate email is better than a missing one. (d) **At least once**: indexing the same document twice is naturally idempotent (an upsert by document id).

### H4.3 An idempotent consumer

```python run A unique constraint makes processing exactly-once
import random, sqlite3
rng = random.Random(3)
payments = [(f'pay-{i}', rng.randint(100, 5_000)) for i in range(1_000)]
stream = payments + rng.sample(payments, 150)                  # 15% duplicates
rng.shuffle(stream)

db = sqlite3.connect(':memory:')
db.execute('CREATE TABLE processed (msg_id TEXT PRIMARY KEY, amount INT)')
db.execute('CREATE TABLE balance (total INT)'); db.execute('INSERT INTO balance VALUES (0)')
skipped = 0
for msg_id, amount in stream:
    try:
        with db:   # dedup row and effect commit together
            db.execute('INSERT INTO processed VALUES (?, ?)', (msg_id, amount))
            db.execute('UPDATE balance SET total = total + ?', (amount,))
    except sqlite3.IntegrityError:
        skipped += 1
total = db.execute('SELECT total FROM balance').fetchone()[0]
print(f'messages {len(stream)}, applied {len(stream) - skipped}, skipped duplicates '
        f'{skipped}')
print(f'balance {total} == sum of distinct payments {sum(a for _, a in payments)}: '
      f'{total == sum(a for _, a in payments)}')
```

The dedup record and the business effect are written in **one transaction**, so a crash can never leave one without the other.

### H4.4 Backlog and drain time

During the burst the backlog grows at 1 500 − 1 000 = 500 messages/s for 600 s: a peak of **300 000** messages. Afterwards it shrinks at 1 000 − 500 = 500/s, so it takes **600 s (10 minutes)** to drain. At the peak a new message waits 300 000 / 1 000 = 300 s, so either autoscale consumers on lag or tell producers to slow down.

## Part 5 solutions

### H5.1 Consistency per feature

| Feature | Choice | Reason |
|---|---|---|
| Restaurant menus | Eventual (cached) | Changes are rare; a minute of staleness is fine, validate price at checkout |
| Order placement and payment | Strong | Money and one order per checkout (idempotency keys) |
| Partner's live location | Eventual, latest-wins | Updates every few seconds supersede each other |
| Ratings and reviews | Eventual | Averages recomputed asynchronously |
| "Accepting orders" switch | Strong at order time | Avoid accepting orders for a closed restaurant; the order service checks the authoritative flag |

### H5.2 Retry amplification

```python run Worst-case calls through retrying layers
layers, attempts = 3, 3
print('every layer retries :', attempts ** layers, 'calls at the bottom for one request')
print('only the top retries:', attempts, 'calls')
```

Retries multiply across layers: 3 × 3 × 3 = **27** calls, exactly when the bottom service is already struggling. Retry at **one** layer (usually the outermost or the one closest to the failing dependency), make inner layers fail fast, and use a retry budget.

### H5.3 Trace a circuit breaker

```python run Breaker trace for F F S F F F F S S S F
outcomes = 'F F S F F F F S S S F'.split()
state, fails, opened_at = 'CLOSED', 0, None
for t, o in enumerate(outcomes):
    if state == 'OPEN' and t - opened_at >= 5:
        state = 'HALF_OPEN'
    if state == 'OPEN':
        print(f't={t:2} OPEN      -> fast fail (dependency would have said {o})')
        continue
    if o == 'S':
        state, fails = 'CLOSED', 0
        print(f't={t:2} call -> success, CLOSED')
    else:
        fails += 1
        if state == 'HALF_OPEN' or fails >= 3:
            state, opened_at = 'OPEN', t
        print(f't={t:2} call -> failure ({fails} in a row), {state}')
```

The success at t = 2 resets the count. Three consecutive failures (t = 3, 4, 5) open the breaker; calls at t = 6–9 fail fast; at t = 10 the breaker goes half-open and its single trial call fails, so it opens again. The successes at t = 7–9 were never attempted: a breaker trades some availability for protecting the dependency, which is why cool-down periods are kept short.

### H5.4 One cron job, many servers

Each server tries to acquire a **lease** on `billing-2026-10-07` from etcd/ZooKeeper (or a database row updated with a conditional write) with an expiry longer than a heartbeat interval. The holder renews the lease while it runs; if it dies, the lease expires and another server takes over. Each grant carries a **fencing token** (monotonically increasing). The billing writes include the token, and the billing table (or a `job_runs` table) rejects writes with a token lower than the highest seen, so a paused old holder cannot write after a new one has started. Make the job itself idempotent too (bill per customer per period with a unique constraint), so a rerun after a crash cannot double-bill.

### H5.5 Quorums for two workloads

To tolerate 2 failures, W ≤ 3 and R ≤ 3 (5 − 2 = 3 replicas remain). Overlap needs R + W > 5, so the only pair is **(W, R) = (3, 3)**: it serves both workloads. A read-heavy workload would like R = 1 or 2, but then W ≥ 4 or 5, which cannot tolerate 2 failed replicas for writes. The fix is a larger N: with N = 7, tolerating 2 failures allows (W, R) = (5, 3), (4, 4) or (3, 5); a read-heavy workload picks R = 3, W = 5.
