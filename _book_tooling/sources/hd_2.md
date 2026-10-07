# Chapter 5: Caching
%Where to cache, how to keep caches correct, and how to stop caches from taking the database down with them

## 5.1 Where caches live

| Layer | Example | Typical hit latency |
|---|---|---|
| Client | Browser cache, mobile app storage | 0 (no request at all) |
| Edge | CDN | ~5–20 ms |
| Service, in-process | A local LRU map, Caffeine (Java) | Nanoseconds; but per instance and not shared |
| Service, distributed | Redis, Memcached | ~0.2–1 ms |
| Database | Buffer pool, query cache | Avoids disk, but the request still reaches the DB |

## 5.2 Caching patterns

| Pattern | Read path | Write path | Good for | Risk |
|---|---|---|---|---|
| Cache-aside (lazy loading) | App checks cache; on miss reads DB and fills cache | App writes DB, then **deletes** the cache key | The default for most read-heavy systems | Stale data if invalidation is missed; first read after a change is slow |
| Read-through | Cache library loads from DB on miss | — | Simpler app code | Same as cache-aside |
| Write-through | — | Write goes to cache and DB synchronously | Data that is read right after writing | Slower writes; caches data nobody reads |
| Write-back (write-behind) | — | Write to cache; flush to DB later in batches | Very high write rates (counters, analytics) | Data loss if the cache dies before flushing |
| Write-around | — | Write only to DB; cache filled on read | Data rarely read soon after writing (logs) | Misses right after writes |

### Why "delete" and not "update" the cache

With cache-aside, two concurrent requests can interleave so that the cache ends up holding stale data. The script below replays three interleavings step by step.

```python run Cache-aside race conditions, replayed deterministically
def run(title, steps):
    db, cache, local = {'price': 100}, {}, {}
    for actor, action in steps:
        if action == 'read_cache':
            local[actor] = cache.get('price')
        elif action == 'read_db':
            local[actor] = db['price']
        elif action == 'fill_cache':
            cache['price'] = local[actor]
        elif action.startswith('write_db'):
            db['price'] = int(action.split('=')[1])
        elif action.startswith('set_cache'):
            cache['price'] = int(action.split('=')[1])
        elif action == 'delete_cache':
            cache.pop('price', None)
    stale = cache.get('price') not in (None, db['price'])
    print(f'{title:44} db={db["price"]} cache={cache.get("price")} -> '
            f'{"STALE" if stale else "ok"}')

# Writers that UPDATE the cache can race each other
run('two writers, update cache (A then B in DB)',
    [('A', 'write_db=110'), ('B', 'write_db=120'), ('B', 'set_cache=120'), ('A',
            'set_cache=110')])
# Deleting fixes that race...
run('two writers, delete cache',
    [('A', 'write_db=110'), ('B', 'write_db=120'), ('B', 'delete_cache'), ('A',
            'delete_cache')])
# ...but a slow reader can still put an old value back
run('reader misses, writer deletes, reader fills',
    [('R', 'read_cache'), ('R', 'read_db'), ('W', 'write_db=130'), ('W', 'delete_cache'),
     ('R', 'fill_cache')])
```

The last case is rarer (the reader must be slower than a whole write), and it is why every cached value should also have a **TTL**: a bounded staleness window even when invalidation loses a race. Systems that need more (Facebook's memcache paper) use leases: a reader that missed gets a token, and a fill is rejected if the key was deleted after the token was issued.

## 5.3 Eviction, expiry and sizing

Eviction policies (LRU, LFU, Clock, scan-resistant variants) were simulated in the DBMS guide (Chapter 7) and the LLD guide (Chapter 7). At system level:

- Give every key a **TTL**, and add random **jitter** (for example ±10%) so that keys written together do not expire together.
- Size the cache from the working set, not the total data: under skewed popularity a cache of a few per cent of the data can serve most reads (Chapter 3).
- Watch the **hit ratio**, **eviction rate** and **memory fragmentation**; a falling hit ratio is often the first sign of a traffic change.

## 5.4 Thundering herds and cache stampedes

When a hot key expires, every request that misses at that moment goes to the database at once: a **cache stampede**. With 1 000 requests per second on one key and a 50 ms database read, about 50 requests miss in parallel before the first one refills the cache. Two standard fixes:

- **Request coalescing (single flight)**: the first request that misses takes a short lock and reloads; the others wait for its result (or serve the stale value).
- **Probabilistic early refresh** (XFetch): each request, shortly before expiry, refreshes early with a probability that grows as expiry approaches, so one request usually refreshes before the key expires at all.

```python run Database hits during a stampede: plain, coalesced, early refresh
import math, random

def simulate(strategy, seconds=60, qps=1000, ttl=10.0, db_time=0.05, beta=1.0, seed=1):
    rng = random.Random(seed)
    expires, refreshing_until, db_hits, value_age = 0.0, -1.0, 0, 0.0
    t, dt = 0.0, 1 / qps
    while t < seconds:
        if strategy == 'early' and t < expires:
            # XFetch: refresh early with probability rising towards expiry
            early = t - db_time * beta * math.log(rng.random()) >= expires
            if early and t >= refreshing_until:
                db_hits += 1; refreshing_until = t + db_time; expires = t + db_time + ttl
        elif t >= expires:
            if strategy == 'plain':
                db_hits += 1                                   # every miss goes to the DB
                if t >= refreshing_until:
                    refreshing_until = t + db_time
                if t + dt >= refreshing_until:
                    expires = refreshing_until + ttl
            else:   # coalesced (or early fallback)
                if t >= refreshing_until:
                    db_hits += 1
                    refreshing_until = t + db_time
                    expires = t + db_time + ttl
        t += dt
    return db_hits

for s in ['plain', 'coalesced', 'early']:
    print(f'{s:10} database reads in 60 s at 1000 QPS (TTL 10 s): {simulate(s)}')
```

Without protection, every expiry turns into a burst of about 50 database reads (six expiries in a minute here). Coalescing reduces each burst to one read. Early refresh also needs about one read per expiry, and in addition users never see the miss latency, because the value is refreshed while it is still valid.

> TIP: For data that is expensive to compute and safe to serve slightly stale, keep serving the old value while one background task refreshes it ("stale-while-revalidate"). It removes both the stampede and the latency spike.

## 5.5 Redis as a toolbox

Redis is more than a key-value cache; its data structures solve common design problems directly.

| Structure | Commands | Design use |
|---|---|---|
| String | `GET`, `SET key val EX 60 NX`, `INCR` | Cache entries, distributed locks (`NX` + expiry), counters, rate limits |
| Hash | `HSET`, `HGETALL` | Object fields (user profile) without serialising the whole object |
| List | `LPUSH`, `BRPOP` | Simple queues, recent-activity lists |
| Set | `SADD`, `SISMEMBER`, `SINTER` | Unique visitors, tags, mutual friends |
| Sorted set | `ZADD`, `ZINCRBY`, `ZREVRANGE` | Leaderboards, rate-limit sliding windows, priority queues, timelines |
| HyperLogLog | `PFADD`, `PFCOUNT` | Approximate unique counts with about 12 KB per counter |
| Stream | `XADD`, `XREADGROUP` | Lightweight log with consumer groups |
| Geo | `GEOADD`, `GEOSEARCH` | Nearby drivers or stores |

The program below implements a leaderboard the way a Redis sorted set would serve it, and shows why the structure fits: updates and top-k queries both stay logarithmic.

```python run A leaderboard with sorted-set semantics
import bisect, random

class SortedSet:                         # ZADD / ZINCRBY / ZREVRANGE / ZREVRANK semantics
    def __init__(self):
        self.score, self.order = {}, []   # order holds (score, member) ascending
    def zincrby(self, member, delta):
        old = self.score.get(member)
        if old is not None:
            self.order.pop(bisect.bisect_left(self.order, (old, member)))
        new = (old or 0) + delta
        self.score[member] = new
        bisect.insort(self.order, (new, member))
        return new
    def zrevrange(self, k):
        return [(m, s) for s, m in reversed(self.order[-k:])]
    def zrevrank(self, member):
        return len(self.order) - 1 - bisect.bisect_left(self.order, (self.score[member],
                member))

rng = random.Random(11)
board = SortedSet()
players = [f'player{i}' for i in range(1000)]
for _ in range(20_000):
    board.zincrby(rng.choice(players), rng.randint(1, 50))
print('top 5:', board.zrevrange(5))
print('rank of player7 (0 = first):', board.zrevrank('player7'), 'score',
        board.score['player7'])
```

## 5.6 Practical lessons

- Cache-aside with delete-on-write plus a TTL is the safe default.
- Add jitter to TTLs; protect hot keys with request coalescing or early refresh.
- Write-back is fast but can lose data; use it only for data you can afford to lose or rebuild.
- Know Redis structures: sorted sets for leaderboards and windows, `SET NX EX` for locks, HyperLogLog for unique counts.

# Chapter 6: Asynchronous Processing
%Queues, publish–subscribe and logs; delivery guarantees, idempotency, the outbox pattern and back-pressure

## 6.1 Why go asynchronous

Doing everything inside the user's request makes the request as slow and as fragile as its slowest dependency. Moving work to the background through a message broker gives:

| Benefit | Example |
|---|---|
| Lower latency | Respond "order placed" now; send email, update search index and analytics later |
| Load levelling | A queue absorbs a burst; workers drain it at their own pace |
| Decoupling | The order service does not need to know who consumes "order placed" |
| Resilience | If the email service is down, messages wait instead of failing orders |

## 6.2 Queues, pub/sub and logs

| Model | Delivery | After consumption | Examples | Use |
|---|---|---|---|---|
| Work queue | Each message to **one** of the consumers | Deleted | RabbitMQ queues, SQS | Distributing tasks to workers |
| Publish–subscribe | Each message to **every** subscriber | Deleted per subscriber | SNS, RabbitMQ fanout, Redis pub/sub | Notifying several services of an event |
| Log (streaming) | Consumers read at their own **offset**; each consumer group gets every message once | Retained for days; can be replayed | Kafka, Pulsar, Kinesis, Redis Streams | Event-driven architectures, analytics pipelines, change data capture |

In Kafka, a topic is split into **partitions**. Order is guaranteed only within a partition, so messages that must stay in order (all events of one order, one user, one meter) share a partition key. Within a consumer group, each partition is read by exactly one consumer, so the number of partitions caps the group's parallelism.

## 6.3 Delivery semantics

| Guarantee | How it happens | Consequence |
|---|---|---|
| At most once | Acknowledge (commit offset) **before** processing | A crash during processing loses the message |
| At least once | Acknowledge **after** processing | A crash after processing but before the ack causes redelivery: duplicates |
| Exactly once (effectively) | At least once + **idempotent** processing (or transactional processing within one system) | Each message's effect is applied once |

The simulation processes 10 000 payment messages with a consumer that crashes at random moments, under each acknowledgement strategy.

```python run Crashes under at-most-once, at-least-once and idempotent consumers
import random

def consume(strategy, messages=10_000, crash_rate=0.02, seed=4):
    rng = random.Random(seed)
    applied, seen_ids, i, effects = 0, set(), 0, 0
    while i < messages:
        msg_id = i
        if strategy == 'at-most-once':
            i += 1                                     # ack first
            if rng.random() < crash_rate:
                continue                               # crashed before processing: lost
            effects += 1
        else:
            crash_after_process = rng.random() < crash_rate
            if strategy == 'idempotent' and msg_id in seen_ids:
                pass                                   # duplicate detected, skip effect
            else:
                effects += 1
                seen_ids.add(msg_id)
            if crash_after_process:
                continue   # no ack: the same message comes again
            i += 1                                     # ack after processing
    return effects

for s in ['at-most-once', 'at-least-once', 'idempotent']:
    e = consume(s)
    print(f'{s:14} effects applied: {e:6} for 10000 messages ({e - 10_000:+d})')
```

At-most-once silently loses about 2% of payments; at-least-once charges about 2% twice; only at-least-once delivery combined with an idempotent consumer applies each payment exactly once.

## 6.4 Idempotency

An operation is **idempotent** if applying it twice has the same effect as applying it once. Ways to get there:

| Technique | Example |
|---|---|
| Naturally idempotent operations | `SET status = 'shipped'` instead of `INCREMENT count` |
| Idempotency key stored with the result | Client sends `Idempotency-Key: 7c1f…`; the server stores the key with the response in the same transaction and returns the stored response on retries (Stripe's API does this) |
| Deduplication table | Consumer records processed message ids; a unique constraint rejects repeats |
| Conditional writes / versions | `UPDATE ... WHERE version = 7` applies at most once |

## 6.5 The outbox pattern

A service often must **both** update its database **and** publish an event ("order created"). Doing the two separately is a dual-write bug: a crash between them leaves the database and the event stream disagreeing. The **transactional outbox** writes the event into an `outbox` table in the **same database transaction** as the business change; a relay process then publishes outbox rows and marks them sent (at least once, so consumers stay idempotent).

```python run A transactional outbox with SQLite
import sqlite3
db = sqlite3.connect(':memory:')
db.executescript('''
CREATE TABLE orders (id INTEGER PRIMARY KEY, item TEXT, qty INT);
CREATE TABLE outbox (id INTEGER PRIMARY KEY, topic TEXT, payload TEXT, sent INT DEFAULT 0);
''')

def place_order(item, qty, fail_after_insert=False):
    try:
        with db:                                           # one transaction
            cur = db.execute('INSERT INTO orders (item, qty) VALUES (?, ?)', (item, qty))
            if fail_after_insert:
                raise RuntimeError('crash between the two writes')
            db.execute('INSERT INTO outbox (topic, payload) VALUES (?, ?)',
                       ('order.created', f'{{"order": {cur.lastrowid}, "item": "{item}"}}'))
        return 'ok'
    except RuntimeError as e:
        return f'rolled back ({e})'

published = []
def relay():                                               # runs in the background
    rows = db.execute('SELECT id, topic, payload FROM outbox '
                      'WHERE sent = 0 ORDER BY id').fetchall()
    for rid, topic, payload in rows:
        published.append((topic, payload))                 # publish to Kafka/RabbitMQ here
        db.execute('UPDATE outbox SET sent = 1 WHERE id = ?', (rid,)); db.commit()

print('order 1:', place_order('meter-kit', 2))
print('order 2:', place_order('sensor', 5, fail_after_insert=True))
print('order 3:', place_order('gateway', 1))
relay()
print('orders in DB  :', db.execute('SELECT id, item FROM orders').fetchall())
print('events sent   :', published)
```

The failed order left neither an order row nor an event: the database and the event stream can never disagree. Change data capture (Debezium reading the database's write-ahead log) is the other common way to publish reliably.

## 6.6 Back-pressure and dead-letter queues

If producers are faster than consumers for long enough, an unbounded queue grows until memory or disk runs out, and every message waits longer and longer. **Back-pressure** pushes the problem back to the producer: block it, slow it down, or reject work (load shedding).

```python run Unbounded versus bounded queues under overload
import random
rng = random.Random(2)
seconds, produce_rate, consume_rate = 120, 1200, 1000           # 20% overload for 60 s
def run(capacity):
    q, dropped, history = 0, 0, []
    for t in range(seconds):
        rate = produce_rate if 30 <= t < 90 else 800             # burst from t = 30 to 90
        arrivals = rng.randint(int(rate * 0.9), int(rate * 1.1))
        accepted = arrivals if capacity is None else min(arrivals, capacity - q)
        dropped += arrivals - accepted
        q = max(0, q + accepted - consume_rate)
        history.append(q)
    return history, dropped

unbounded, d0 = run(None)
bounded, d1 = run(5_000)
print(f'unbounded: peak backlog {max(unbounded):,} messages '
      f'(~{max(unbounded) / consume_rate:.0f} s of waiting), dropped {d0}')
print(f'bounded  : peak backlog {max(bounded):,} messages, rejected {d1:,} '
      f'(producers told to retry later)')
plt.plot(unbounded, label='unbounded queue'); plt.plot(bounded,
        label='bounded queue (5 000)')
plt.axvspan(30, 90, color='orange', alpha=0.1, label='overload')
plt.xlabel('time (s)'); plt.ylabel('messages waiting'); plt.legend(); plt.tight_layout()
plt.savefig('hld_backpressure.png', dpi=150)
```

![A bounded queue caps waiting time by rejecting work during overload](figs/hld_backpressure.png)

The unbounded queue never loses a message, but at its peak a new message waits many seconds, which may be useless for interactive work; it also needs time after the burst to drain. The bounded queue caps the wait and makes overload visible to producers, who can retry with back-off or degrade gracefully.

A **dead-letter queue (DLQ)** receives messages that fail repeatedly (malformed data, a bug for one customer). After N attempts, move the message aside instead of retrying forever and blocking the partition behind it ("poison message"). Alert on DLQ growth, fix the cause, and replay.

## 6.7 Practical lessons

- Use queues to cut user-facing latency and absorb bursts; use logs (Kafka) when several consumers need the same events or replay matters.
- Order is per partition: choose the partition key that must stay ordered.
- At-least-once delivery plus idempotent consumers is the practical exactly-once.
- Never dual-write to a database and a broker; use the outbox pattern or change data capture.
- Bound your queues, apply back-pressure, and move poison messages to a DLQ.
