# How to use this guide
%The parts of a production back end beyond controllers and a database, each one run for real

The Spring Boot guide in this series builds a complete REST API: controllers, services, JPA, validation, security, tests. Real products need more pieces around that core, and senior back-end interviews probe them: **caching**, **rate limiting**, **idempotency**, **message queues and events**, **background and scheduled jobs**, **real-time updates**, **file storage**, **API styles beyond REST**, and **NoSQL data modelling**. This guide covers each one: what it is, why you need it, how it works inside, where it sits in an architecture, the traps, and the interview questions.

## How the examples were run

Every block with a run label was executed for this book, in Python 3.13, against **real** infrastructure started fresh for each example:

| Topic | What actually ran |
|---|---|
| Caching, rate limiting, locks, queues, pub/sub, scheduled jobs | A private **Redis 7** server (started per example on a free port, with no persistence) and the `redis` client library |
| HTTP APIs, idempotency, presigned URLs, SSE | Python's `http.server` on a local port, called over real TCP |
| WebSockets | The `websockets` library, server and clients in one program |
| GraphQL | `graphql-core` (the reference implementation's Python port) |
| gRPC | `grpcio`, with code generated from a `.proto` file by `grpc_tools.protoc` |
| Document storage, outbox | SQLite (with its JSON functions) |

Python keeps each example short; every concept maps directly onto Java and Spring, and each chapter ends with a table of the Spring equivalents (Spring Data Redis, `@Cacheable`, Spring Kafka, `@Scheduled`, Spring WebSocket, Spring for GraphQL, grpc-java).

> NOTE: Timings are measured on one machine and rounded; what matters is the ratio between approaches, not the absolute numbers.

## Where each piece sits

```text
             browser / mobile app
                     |
                 CDN (static files, cached GETs)
                     |
             API gateway / load balancer  -- rate limiting, auth, TLS
                     |
       +-------------+--------------+
       |                            |
  API service (Spring Boot)    WebSocket / SSE service  -- real-time pushes
       |      |      |                 |
       |   Redis  ---+-----------------+   cache, rate-limit counters, locks, pub/sub
       |      |
  PostgreSQL/MySQL      message broker (Kafka / RabbitMQ / SQS / Redis Streams)
  (source of truth)            |
       |                 worker services  -- emails, invoices, ML scoring, thumbnails
  object storage (S3)  <--------+          -- scheduled jobs (billing at midnight)
  (files, images; clients upload directly with presigned URLs)
```

| Problem | Tool | Chapter |
|---|---|---|
| The same expensive read is done thousands of times | Cache (Redis, CDN, in-process) | 1 |
| One client floods the API | Rate limiter | 2 |
| A retried payment is charged twice | Idempotency keys | 2 |
| Two instances must not run the same job at once | Distributed lock / leader election | 2, 4 |
| A slow task (email, PDF, ML inference) blocks the request | Queue + background worker | 3, 4 |
| Several services must react to one event | Pub/sub, event log (Kafka) | 3 |
| Work must happen at 02:00 every night | Scheduler (cron, Quartz, delayed queue) | 4 |
| The browser must see new readings instantly | SSE or WebSockets | 5 |
| Users upload large files | Object storage + presigned URLs | 6 |
| Clients need flexible queries or fast internal calls | GraphQL, gRPC | 7 |
| Huge scale, flexible schema, simple access patterns | NoSQL (key-value, document, wide-column) | 8 |

## Map of the guide

| Chapter | Topic |
|---|---|
| 1 | Caching with Redis: patterns, invalidation, eviction, stampedes |
| 2 | Rate limiting, idempotency and distributed locks |
| 3 | Messaging and event-driven architecture |
| 4 | Background jobs and scheduling |
| 5 | Real-time: polling, SSE, WebSockets |
| 6 | Files and object storage |
| 7 | API styles: REST in depth, GraphQL, gRPC |
| 8 | NoSQL data modelling |
| 9 | Interview questions and a design checklist |

# Chapter 1: Caching
%Making reads fast and cheap, and keeping the cache honest

## 1.1 Why cache, and where

A cache stores the result of expensive work (a database query, an API call, a rendered page) in faster storage so that the next request can reuse it. It cuts **latency** (memory is roughly 1,000 times faster than a disk-based query plus network), **load** on the database, and **cost**. The price is **staleness**: the cached copy can differ from the source of truth.

| Layer | Example | Typical lifetime |
|---|---|---|
| Browser | `Cache-Control: max-age=60`, ETags | Seconds to a year (hashed static files) |
| CDN | Cached product pages, images | Minutes to days |
| Reverse proxy | Nginx/Varnish micro-cache | Seconds |
| Application, in-process | Caffeine/Guava map inside each JVM | Seconds to minutes; per instance |
| Distributed cache | **Redis**, Memcached, shared by all instances | Seconds to hours |
| Database | Buffer pool, query cache | Managed by the database |

**Redis** is an in-memory data-structure server: strings, hashes, lists, sets, sorted sets, streams, with per-key expiry (TTL), atomic operations, and single-digit-millisecond (often sub-millisecond) latency. It is the default choice for a shared cache, and also for counters, rate limits, locks, sessions, leaderboards and lightweight queues.

## 1.2 Redis data structures in one program

```python run The Redis types you will use, on a real server
from backlab import redis_server
with redis_server() as r:
    r.set('meter:SM-42:last', '3.52', ex=60)                        # string with a 60 s TTL
    ttl = r.ttl('meter:SM-42:last')
    print('string:', r.get('meter:SM-42:last'), '| ttl <= 60:', 0 < ttl <= 60)
    r.hset('meter:SM-42', mapping={'city': 'Kolkata', 'tariff': 'T2', 'kwh_today': 12})
    r.hincrbyfloat('meter:SM-42', 'kwh_today', 0.5)         # atomic update of one field
    print('hash:', r.hgetall('meter:SM-42'))
    print('counter:', [r.incr('api:calls') for _ in range(3)])      # atomic increments
    r.rpush('alerts', 'low-voltage', 'tamper', 'offline')
    print('list:', r.lrange('alerts', 0, -1), '| pop left:', r.lpop('alerts'))
    r.sadd('online', 'SM-1', 'SM-2', 'SM-3'); r.sadd('faulty', 'SM-2', 'SM-9')
    print('set intersection (online and faulty):', r.sinter('online', 'faulty'))
    r.zadd('usage:today', {'SM-1': 12.5, 'SM-2': 30.1, 'SM-3': 7.8, 'SM-4': 22.0})
    print('sorted set, top 2 consumers:', r.zrevrange('usage:today', 0, 1, withscores=True))
    pipe = r.pipeline()                                             # one round trip
    for i in range(1000):
        pipe.set(f'k{i}', i)
    pipe.execute()
    print('k* keys after a 1000-command pipeline:', len(r.keys('k*')))
```

Two properties matter for everything that follows. First, Redis executes commands **one at a time** (a single-threaded command loop), so each command (`INCR`, `HINCRBYFLOAT`, `SET ... NX`) is **atomic**: no two clients can interleave inside it. Second, every call is a network round trip, so batching with **pipelines** (or a server-side **Lua script**) matters for throughput.

## 1.3 Cache-aside: the default pattern

In **cache-aside** (lazy loading), the application owns the logic:

1. Read: look in the cache; on a **hit** return it; on a **miss** load from the database, store it in the cache with a TTL, and return it.
2. Write: update the database, then **delete** the cache entry (the next read reloads it).

```python run Cache-aside in front of a slow "database", with hit ratio and latency
import time, random
from backlab import redis_server
random.seed(1)
DB_CALLS = 0
def db_get_meter(meter_id):                   # stands in for a 30 ms SQL query
    global DB_CALLS; DB_CALLS += 1
    time.sleep(0.03)
    return f'{{"id": "{meter_id}", "city": "Kolkata", "tariff": "T2"}}'
def get_meter(r, meter_id):
    key = f'meter:{meter_id}'
    cached = r.get(key)
    if cached is not None:
        return cached, 'hit'
    value = db_get_meter(meter_id)
    r.set(key, value, ex=300)                 # TTL: an upper bound on staleness
    return value, 'miss'
with redis_server() as r:
    # skewed traffic: a few meters are requested far more often than the rest
    ids = [f'SM-{int(random.paretovariate(1.2)) % 50}' for _ in range(400)]
    t0 = time.perf_counter(); hits = 0
    for m in ids:
        hits += get_meter(r, m)[1] == 'hit'
    cached_time = time.perf_counter() - t0
print(f'{len(ids)} requests, {len(set(ids))} distinct meters, '
      f'hit ratio {hits / len(ids):.0%}')
print(f'database calls: {DB_CALLS} instead of {len(ids)}')
print(f'time with cache {cached_time:.2f} s; without, about {len(ids) * 0.03:.1f} s')
```

Real traffic is skewed (a few meters, products or users are requested far more than others), which is why a cache holding a small fraction of the data can serve most requests. The hit ratio is **the** metric of a cache; monitor it.

> TIP: Cache **after** you have measured that a read is slow or frequent, and pick the TTL from how stale the data may be: "tariffs change at most daily, and a 5-minute delay is acceptable" means `ex=300`.

## 1.4 Invalidation: the hard part

"There are only two hard things in computer science: cache invalidation and naming things." When the data changes, the cache must not keep serving the old value for long.

| Strategy | How | Risk |
|---|---|---|
| TTL only | Entries expire | Stale for up to the TTL |
| Delete on write (cache-aside) | Update DB, then `DEL key` | A race can re-insert an old value (below); a failed delete leaves stale data until TTL |
| Write-through | Write to cache and DB together | Every write pays both; caches data that may never be read |
| Write-behind (write-back) | Write to cache, flush to DB later | Fast writes; **data loss** if the cache dies before flushing |
| Event-driven | Consume change events (outbox, CDC with Debezium) and delete or update keys | More moving parts; near-real-time |

Why delete rather than update the cache on writes? Two concurrent writers can update the database in one order and the cache in the other, leaving the cache permanently wrong. Deleting avoids that, but one race remains: a reader misses, reads the **old** value from the database, then a writer updates the database and deletes the key, and only then does the slow reader write its old value into the cache.

```python run The stale-set race in cache-aside, reproduced with controlled timing
import threading, time
from backlab import redis_server
db = {'tariff:T2': '7.50'}
with redis_server() as r:
    def slow_reader():
        if r.get('tariff:T2') is None:            # miss
            value = db['tariff:T2']               # reads the OLD value ...
            time.sleep(0.2)                       # ... is delayed (GC pause, slow network)
            r.set('tariff:T2', value)             # ... and caches it after the writer
    def writer():
        time.sleep(0.05)
        db['tariff:T2'] = '8.10'                  # update the source of truth
        r.delete('tariff:T2')                     # invalidate
    a, b = threading.Thread(target=slow_reader), threading.Thread(target=writer)
    a.start(); b.start(); a.join(); b.join()
    print('database:', db['tariff:T2'], '| cache:', r.get('tariff:T2'),
          '<- stale, and with no TTL it stays stale')
    r.set('tariff:T2', '7.50', ex=2)              # mitigation 1: always set a TTL
    print('with a TTL, the stale value disappears within', r.ttl('tariff:T2'), 's')
```

Mitigations: always set a TTL, so any inconsistency heals; **delayed double delete** (delete again a few hundred milliseconds after the write); versioned values (store a version number and refuse to overwrite a newer one, using a Lua script); or update the cache from a change stream in commit order.

## 1.5 Eviction: when memory is full

A cache has a memory budget. When it is full, Redis applies its `maxmemory-policy`: `allkeys-lru` (evict the least recently used keys, the usual cache setting), `allkeys-lfu` (least frequently used), `volatile-*` (only keys with a TTL), or `noeviction` (refuse writes: right for a queue or primary store, wrong for a cache).

```python run Redis evicting under a 2 MB limit: LRU versus LFU
from backlab import redis_server
def fill(policy):
    with redis_server('--maxmemory', '2mb', '--maxmemory-policy', policy) as r:
        payload = 'x' * 1000
        for i in range(20):
            r.set(f'hot:{i}', payload)
        for i in range(5000):
            r.set(f'cold:{i}', payload)
            if i % 100 == 0:
                for j in range(20):
                    r.get(f'hot:{j}')             # the hot keys are read again and again
        hot = sum(r.exists(f'hot:{i}') for i in range(20))
        print(f'{policy:12s} evicted {r.info("stats")["evicted_keys"]}, '
              f'hot keys surviving {hot}/20, keys now {r.dbsize()}')
fill('allkeys-lru')
fill('allkeys-lfu')
with redis_server('--maxmemory', '2mb', '--maxmemory-policy', 'noeviction') as r:
    try:
        for i in range(5000):
            r.set(f'k:{i}', 'x' * 1000)
    except Exception as e:
        print(f'noeviction refused write number {i}: {str(e).split(".")[0]}')
```

This result surprised me when the book was built, and it is worth understanding. Redis's LRU is **approximate**: it samples a few keys and evicts the one idle longest, and it measures idle time with a clock of **one-second** resolution. The whole loop finished in well under a second, so every key looked equally idle and LRU evicted almost at random, hot keys included. **LFU** keeps a small access counter per key, so the twenty keys read fifty times each survived. In production, where keys are minutes or hours old, LRU behaves as expected; LFU is the better choice when popularity matters more than recency (a catalogue with stable best-sellers).

## 1.6 Stampedes, penetration and hot keys

**Cache stampede** (thundering herd): a popular key expires, and hundreds of concurrent requests all miss and all hit the database at once. Fixes: let **one** request rebuild while others wait or serve the stale value (a short lock with `SET key NX PX`); refresh popular keys **before** they expire; add random **jitter** to TTLs so many keys do not expire together.

```python run A stampede of 50 concurrent misses, with and without a rebuild lock
import threading, time
from backlab import redis_server
def run(r, use_lock, double_check=False):
    r.flushall()
    calls = {'db': 0}
    lock = threading.Lock()
    start = threading.Barrier(50)
    def db_query():
        with lock: calls['db'] += 1
        time.sleep(0.1)                                     # an expensive 100 ms query
        return 'forecast-for-tomorrow'
    def handler():
        start.wait()                                        # 50 requests arrive together
        while True:
            v = r.get('forecast')
            if v is not None:
                return v
            if not use_lock:
                v = db_query(); r.set('forecast', v, ex=60); return v
            if r.set('forecast:lock', '1', nx=True, px=5000):   # only one rebuilder wins
                try:
                    if double_check and (v := r.get('forecast')) is not None:
                        return v               # rebuilt between our GET and SET NX
                    v = db_query(); r.set('forecast', v, ex=60); return v
                finally:
                    r.delete('forecast:lock')
            time.sleep(0.01)                                # others wait briefly and re-check
    ts = [threading.Thread(target=handler) for _ in range(50)]
    for t in ts: t.start()
    for t in ts: t.join()
    return calls['db']
with redis_server() as r:
    print('database queries without a lock:', run(r, False))
    print('database queries with a rebuild lock:', run(r, True))
    print('with the lock and a re-check after locking:', run(r, True, double_check=True))
```

In the run shown, the lock alone already brought the 50 queries down to one, but it has a timing window: a waiter can read the empty cache, then the first rebuilder finishes and releases the lock, and the waiter acquires the now-free lock and rebuilds a second time. An earlier run of this same program, while the book was being written, printed 2 for the lock-only case for exactly that reason. **Re-checking the cache after acquiring the lock** (double-checked locking) closes the window. In production, also give the lock an expiry (here 5 s) so a crashed rebuilder cannot block everyone forever.

**Cache penetration**: requests for keys that do not exist anywhere (a bug, or an attacker probing random ids) always miss and always reach the database. Cache the "not found" result briefly (a **negative cache**), or keep a Bloom filter of valid ids.

**Hot keys**: one key receiving a huge share of traffic (a celebrity's profile, a flash-sale product) overloads the single Redis node that owns it. Replicate it under several key names (`product:42#1` … `#8`) and pick one at random, or cache it in-process too (a two-level cache).

## 1.7 What to cache, and what not to

| Good candidates | Poor candidates |
|---|---|
| Read-heavy, rarely changing data: tariffs, product catalogue, configuration | Data that must be exactly current: account balances, stock at checkout |
| Expensive aggregates: dashboards, forecasts, leaderboards | Data read once (each user's one-off report) |
| Sessions and tokens (with TTL) | Large blobs (use object storage + CDN) |
| Rendered fragments, API responses for anonymous users | Anything you cannot invalidate correctly |

Never cache **per-user** data under a shared key (a classic data-leak bug: user A sees user B's dashboard), and never cache responses to authenticated requests at a CDN unless the key includes the user.

## 1.8 Spring equivalents and practical lessons

| Concept | Spring |
|---|---|
| Redis client | Spring Data Redis (`RedisTemplate`, Lettuce) |
| Cache-aside with annotations | `@EnableCaching`, `@Cacheable("meters")`, `@CacheEvict`, `@CachePut`; `RedisCacheManager` with per-cache TTLs |
| In-process cache | Caffeine with `CaffeineCacheManager` |
| Stampede protection | `@Cacheable(sync = true)` (per instance); a Redis lock for all instances |

- Cache-aside: read through the cache, write to the database, then delete the key; always set a TTL.
- Measure the hit ratio; choose the TTL from the staleness the business accepts.
- Use `allkeys-lru` for caches, `noeviction` for queues or primary data.
- Protect against stampedes (lock or early refresh, TTL jitter), penetration (negative caching) and hot keys.
- Use pipelines and atomic commands; never cache per-user data under shared keys.
