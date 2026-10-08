# Chapter 2: Rate Limiting, Idempotency and Distributed Locks
%Protecting the API from floods, retries and races across many instances

## 2.1 Why limit, and where

A **rate limiter** caps how many requests a client (an API key, a user, an IP address) may make per unit of time. It protects the service from overload and abuse (scraping, brute-force logins, a buggy client in a retry loop), keeps one tenant from starving others, and enforces paid plans. It usually runs at the **API gateway** (Kong, NGINX, AWS API Gateway, Spring Cloud Gateway) or as middleware in the service, with counters in **Redis** so that every instance sees the same counts.

A rejected request gets **HTTP 429 Too Many Requests** with a `Retry-After` header, and well-behaved APIs also send `RateLimit-Limit`, `RateLimit-Remaining` and `RateLimit-Reset`.

## 2.2 The four classic algorithms

| Algorithm | Idea | Pros | Cons |
|---|---|---|---|
| Fixed window | Count per calendar window (`key:minute`); reset each window | One `INCR` + `EXPIRE`; tiny memory | **Bursts at the boundary**: up to 2× the limit across two adjacent windows |
| Sliding log | Store each request's timestamp; count those in the last N seconds | Exact | Memory per request |
| Sliding window counter | Weighted sum of the current and previous fixed windows | Smooth, cheap | Approximate |
| Token bucket | A bucket of capacity B refills at r tokens/s; each request takes one | Allows short bursts up to B, average rate r | Two numbers per key; needs atomic update |

The demonstrations below use a **simulated clock** passed in as `now`, so that the behaviour at window boundaries is exact and repeatable; the Redis operations are real.

```python run Fixed window versus sliding log at a window boundary
from backlab import redis_server
LIMIT, WINDOW = 5, 60
def fixed_window(r, client, now):
    key = f'rl:fw:{client}:{int(now // WINDOW)}'
    count = r.incr(key)
    if count == 1:
        r.expire(key, WINDOW)
    return count <= LIMIT
def sliding_log(r, client, now):
    key = f'rl:log:{client}'
    pipe = r.pipeline()
    pipe.zremrangebyscore(key, 0, now - WINDOW)        # forget requests older than the window
    pipe.zcard(key)
    _, count = pipe.execute()
    if count >= LIMIT:
        return False
    r.zadd(key, {f'{now}': now}); r.expire(key, WINDOW)
    return True
burst = [59.0, 59.2, 59.4, 59.6, 59.8, 60.0, 60.2, 60.4, 60.6, 60.8]   # 10 requests in 2 s
with redis_server() as r:
    for name, fn in [('fixed window', fixed_window), ('sliding log', sliding_log)]:
        allowed = [t for t in burst if fn(r, 'api-key-7', t)]
        print(f'{name:12s}: allowed {len(allowed)} of {len(burst)} in 2 seconds '
              f'(limit {LIMIT} per {WINDOW} s) at times {allowed}')
```

The fixed window let all ten through: five just before the minute boundary and five just after, twice the intended rate. The sliding log enforced five per any 60-second span.

## 2.3 Token bucket, atomically, with Lua

A read-modify-write in several commands (read tokens, compute, write back) is a race: two instances can read the same count and both allow. Redis runs a **Lua script** atomically, so the whole decision happens as one step.

```python run A token bucket in a Redis Lua script: bursts allowed, average rate enforced
from backlab import redis_server
TOKEN_BUCKET = """
local key = KEYS[1]
local capacity, rate, now = tonumber(ARGV[1]), tonumber(ARGV[2]), tonumber(ARGV[3])
local state = redis.call('HMGET', key, 'tokens', 'ts')
local tokens = tonumber(state[1]) or capacity
local ts = tonumber(state[2]) or now
tokens = math.min(capacity, tokens + (now - ts) * rate)       -- refill since last request
local allowed = 0
if tokens >= 1 then tokens = tokens - 1; allowed = 1 end
redis.call('HSET', key, 'tokens', tokens, 'ts', now)
redis.call('EXPIRE', key, math.ceil(capacity / rate) * 2)
return {allowed, tostring(tokens)}
"""
with redis_server() as r:
    bucket = r.register_script(TOKEN_BUCKET)
    def attempt(t):
        allowed, left = bucket(keys=['tb:user:42'], args=[5, 1, t])   # capacity 5, 1 token/s
        return allowed == 1, float(left)
    times = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 1.6, 2.6, 2.7, 10.0, 10.1]
    for t in times:
        ok, left = attempt(t)
        print(f't={t:5.1f}s {"allowed" if ok else "429    "}  tokens left {left:.1f}')
```

The first five requests drain the burst capacity; the sixth and seventh are refused; afterwards requests succeed at the refill rate of one per second; after a long pause the bucket is full again (but never above its capacity of 5).

```python run The rate limiter as HTTP middleware returning 429 with Retry-After
import json, urllib.request, urllib.error
from backlab import redis_server, http_server, QuietHandler
with redis_server() as r:
    class Api(QuietHandler):
        def do_GET(self):
            key = self.headers.get('X-Api-Key', 'anonymous')
            count = r.incr(f'rl:{key}')                       # fixed window per server minute
            if count == 1:
                r.expire(f'rl:{key}', 60)
            remaining = max(0, 3 - count)
            if count > 3:
                self.send_response(429)
                self.send_header('Retry-After', str(r.ttl(f'rl:{key}')))
            else:
                self.send_response(200)
            self.send_header('RateLimit-Limit', '3')
            self.send_header('RateLimit-Remaining', str(remaining))
            self.end_headers()
            self.wfile.write(json.dumps({'meters': 42}).encode() if count <= 3 else b'')
    with http_server(Api) as base:
        for i in range(5):
            req = urllib.request.Request(base + '/meters', headers={'X-Api-Key': 'demo'})
            try:
                with urllib.request.urlopen(req) as resp:
                    print(i + 1, resp.status, 'remaining',
                          resp.headers['RateLimit-Remaining'])
            except urllib.error.HTTPError as e:
                wait = int(e.headers['Retry-After'])
                print(i + 1, e.code, 'retry after <= 60 s:', 0 < wait <= 60)
```

> TIP: Choose the **key** carefully. Per IP is easy but punishes everyone behind one office NAT and is evaded by botnets; per API key or user is fairer; login endpoints need **per account and per IP** limits to stop credential stuffing. Decide whether to **fail open** (allow traffic if Redis is down: availability) or **fail closed** (refuse: protection); most APIs fail open for reads and closed for logins.

## 2.4 Idempotency

An operation is **idempotent** if doing it twice has the same effect as doing it once. `GET`, `PUT` (set to a value) and `DELETE` are idempotent by definition; `POST` is not: "create a payment of ₹500" twice charges twice.

Retries are unavoidable: the client times out but the server actually processed the request; a mobile app resends after losing signal; a load balancer retries on another instance; a message is redelivered (Chapter 3). The standard fix for `POST` is an **idempotency key**: the client generates a unique key (a UUID) per logical operation and sends it in a header (`Idempotency-Key`, as Stripe does). The server:

1. Atomically **claims** the key (`SET idem:<key> "in-progress" NX EX 86400`).
2. If the claim succeeds, processes the request, then stores the response under the key.
3. If the key already exists with a stored response, returns **the same response** without reprocessing.
4. If it exists but is still in progress, returns **409 Conflict** (or waits).
5. Stores a hash of the request body, and rejects a reuse of the key with a **different** body (422).

```python run Idempotent payment creation: retries, concurrent duplicates and key misuse
import hashlib, json, threading, time, urllib.request, urllib.error, uuid
from backlab import redis_server, http_server, QuietHandler
CHARGES = []                                         # stands in for the payments table
with redis_server() as r:
    class Payments(QuietHandler):
        def do_POST(self):
            body = self.rfile.read(int(self.headers['Content-Length']))
            key = self.headers['Idempotency-Key']
            fingerprint = hashlib.sha256(body).hexdigest()
            marker = json.dumps({'state': 'processing', 'fp': fingerprint})
            claimed = r.set(f'idem:{key}', marker, nx=True, ex=86400)
            if not claimed:
                saved = json.loads(r.get(f'idem:{key}'))
                if saved['fp'] != fingerprint:
                    return self.reply(422, {'error': 'key reused with a different request'})
                if saved['state'] == 'processing':
                    return self.reply(409, {'error': 'request with this key in progress'})
                return self.reply(saved['status'], saved['body'], replayed=True)
            time.sleep(0.2)                          # call the payment provider, write the DB
            CHARGES.append(json.loads(body))
            result = {'payment_id': f'pay_{len(CHARGES)}', 'status': 'captured'}
            r.set(f'idem:{key}', json.dumps({'state': 'done', 'fp': fingerprint,
                                              'status': 201, 'body': result}), ex=86400)
            self.reply(201, result)
        def reply(self, status, obj, replayed=False):
            self.send_response(status)
            if replayed:
                self.send_header('Idempotent-Replayed', 'true')
            self.end_headers(); self.wfile.write(json.dumps(obj).encode())
    with http_server(Payments) as base:
        def post(key, amount):
            data = json.dumps({'amount': amount}).encode()
            req = urllib.request.Request(base + '/payments', method='POST', data=data,
                                         headers={'Idempotency-Key': key})
            try:
                with urllib.request.urlopen(req) as resp:
                    replayed = resp.headers.get('Idempotent-Replayed')
                    return resp.status, replayed, resp.read().decode()
            except urllib.error.HTTPError as e:
                return e.code, None, e.read().decode()
        k1 = str(uuid.uuid4())
        print('first attempt:     ', post(k1, 500))
        print('client retry:      ', post(k1, 500))
        k2 = str(uuid.uuid4()); results = []
        worker = lambda: results.append(post(k2, 750))
        ts = [threading.Thread(target=worker) for _ in range(2)]
        for t in ts: t.start()
        for t in ts: t.join()
        print('two concurrent:    ', sorted(x[0] for x in results))
        print('same key, new body:', post(k1, 900)[0])
print('charges actually made:', [c['amount'] for c in CHARGES])
```

Five requests, two charges: the retry got the stored response (marked as replayed), the concurrent duplicate got 409 while the first was still in progress, and reusing a key for a different amount was rejected. The atomic `SET NX` is what makes the concurrent case safe; a "check then insert" in two steps would let both through.

> NOTE: The same idea appears in the database: a `UNIQUE` constraint on `(merchant_id, idempotency_key)` in the payments table is the final safety net, so that even a bug in the cache layer cannot create two rows. Message consumers use the same trick (Section 3.5).

## 2.5 Distributed locks, and why they are subtle

When several instances must not do something at the same time (run tonight's billing job, rebuild a cache entry, process one account's ledger), they need a lock that all of them can see. With Redis: `SET lock:billing <unique-token> NX PX 30000` acquires (only if absent, with an expiry so a crashed holder cannot block forever), and release deletes the key **only if it still holds your token** (a Lua script compares and deletes atomically), so you never delete a lock someone else acquired after yours expired.

```python run Acquire, expire, and safe release with a token check
import time, uuid
from backlab import redis_server
RELEASE = """
if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) end
return 0
"""
with redis_server() as r:
    release = r.register_script(RELEASE)
    a, b = str(uuid.uuid4()), str(uuid.uuid4())
    print('A acquires:', bool(r.set('lock:billing', a, nx=True, px=300)))
    print('B acquires while A holds it:', bool(r.set('lock:billing', b, nx=True, px=300)))
    time.sleep(0.4)                                   # A is paused longer than the lease
    got_b = r.set('lock:billing', b, nx=True, px=300)
    print('B acquires after the lease expired:', bool(got_b))
    print('A wakes up and releases; keys deleted:', release(['lock:billing'], [a]),
          '(token mismatch)')
    print('lock still held by B:', r.get('lock:billing') == b)
```

The remaining danger is in the last scenario: A was paused (a long garbage-collection pause, a slow disk) **past its lease**, B acquired the lock, and A, unaware, may still **act** as if it held the lock. No lock service can prevent that by itself. The fix is a **fencing token**: the lock service hands out an increasing number with each acquisition, and the protected resource (the database, the storage) rejects writes carrying a token older than one it has already seen. For correctness-critical mutual exclusion, prefer a database row lock (`SELECT ... FOR UPDATE`), a unique constraint, or a consensus system (ZooKeeper, etcd) with fencing; use Redis locks for **efficiency** (avoiding duplicate work), where an occasional overlap is harmless.

## 2.6 Spring equivalents and practical lessons

| Concept | Spring / Java |
|---|---|
| Gateway rate limiting | Spring Cloud Gateway `RequestRateLimiter` (Redis token bucket) |
| In-service limiting | Bucket4j (with a Redis or JCache backend), Resilience4j `RateLimiter` |
| Idempotency | A `HandlerInterceptor` or filter reading `Idempotency-Key`; a unique constraint |
| Locks | ShedLock (for `@Scheduled` jobs), Redisson `RLock`, database row locks |

- Rate limit at the gateway with shared counters; send 429 with `Retry-After`; pick keys that match the threat.
- Fixed windows burst at boundaries; token buckets give a burst size and an average rate; make the check atomic (Lua).
- Every non-idempotent write that can be retried needs an idempotency key: claim atomically, store and replay the response, reject key reuse with a different body.
- Redis locks need an expiry and a token-checked release, and still cannot stop a paused holder: use fencing tokens or database constraints when correctness depends on it.

# Chapter 3: Messaging and Event-Driven Architecture
%Queues, pub/sub and logs; delivery guarantees, retries, dead letters and the outbox pattern

## 3.1 Why put a message broker in the middle

Synchronous calls couple services in time: if the email service is slow, the sign-up request is slow; if it is down, sign-up fails. A **message broker** decouples them: the producer writes a message and returns; consumers process it when they can.

| Benefit | Example |
|---|---|
| Faster responses | Accept the meter reading, return 202, compute the bill asynchronously |
| Load levelling | 10,000 readings arrive at midnight; workers drain the queue at their own pace |
| Resilience | The invoice service is down for 5 minutes; messages wait and are processed later |
| Fan-out | One `ReadingRecorded` event feeds billing, alerts, analytics and the ML feature store |
| Scaling | Add consumers to process more in parallel |

The costs: **eventual consistency** (the bill appears a few seconds later), more infrastructure, harder debugging (follow a correlation id across services), and the need to handle duplicates and ordering.

## 3.2 Three shapes: queue, pub/sub and log

| Shape | Semantics | Examples |
|---|---|---|
| **Work queue** | Each message is processed by **one** of the competing consumers, then removed | RabbitMQ queues, Amazon SQS, Celery |
| **Pub/sub** | Each message goes to **every** current subscriber; offline subscribers miss it | Redis Pub/Sub, RabbitMQ fanout exchanges, SNS |
| **Log (stream)** | Messages are appended to a durable, ordered log and **retained**; each consumer group tracks its own position (offset) and can replay | **Apache Kafka**, Redis Streams, Amazon Kinesis, Pulsar |

Kafka splits a topic into **partitions**; messages with the same key (a meter id) go to the same partition and stay **in order** there; within a consumer group, each partition is read by exactly one consumer, so the partition count caps the parallelism. Redis Streams provide the same consumer-group model on one node, which makes them ideal for demonstrating the mechanics.

## 3.3 Consumer groups, acknowledgements and redelivery

A consumer reads a message, processes it, and then **acknowledges** it. Until acknowledged, the broker remembers it as **pending** for that consumer. If the consumer crashes, another consumer can **claim** the pending messages after a timeout and process them. This is **at-least-once** delivery: nothing is lost, but a message can be processed twice (the first consumer may have finished its work and crashed just before acknowledging).

```python run Redis Streams: two consumers, a crash, and redelivery of the unacknowledged message
import time
from backlab import redis_server
with redis_server() as r:
    for i in range(1, 7):
        r.xadd('readings', {'meter': f'SM-{i}', 'kwh': str(i * 1.5)})
    r.xgroup_create('readings', 'billing', id='0')
    def read(consumer, n, group='billing'):
        resp = r.xreadgroup(group, consumer, {'readings': '>'}, count=n)
        return [(mid, f['meter']) for mid, f in resp[0][1]] if resp else []
    a = read('worker-a', 3)
    b = read('worker-b', 3)
    print('worker-a got', [m for _, m in a]); print('worker-b got', [m for _, m in b])
    for mid, _ in a:
        r.xack('readings', 'billing', mid)                   # a finished all three
    r.xack('readings', 'billing', b[0][0]); r.xack('readings', 'billing', b[1][0])
    print('worker-b crashes before acknowledging', b[2][1])
    pending = r.xpending('readings', 'billing')
    print('pending after the crash:', pending['pending'], 'message(s), owned by',
          [c['name'] for c in pending['consumers']])
    time.sleep(0.25)
    _, claimed, _ = r.xautoclaim('readings', 'billing', 'worker-a',
                                 min_idle_time=200, start_id='0')
    print('worker-a reclaims messages idle > 200 ms:', [f['meter'] for _, f in claimed])
    for mid, _ in claimed:
        r.xack('readings', 'billing', mid)
    print('pending now:', r.xpending('readings', 'billing')['pending'])
    r.xgroup_create('readings', 'analytics', id='0')     # a second, independent group
    replay = read('etl-1', 100, group='analytics')
    print('a new group "analytics" replays the whole log:', len(replay), 'messages')
```

Each group gets every message once (work is shared **within** a group), and a new group can read the full retained log from the beginning: that is what lets you add a new consumer service months later and backfill it.

## 3.4 Delivery guarantees

| Guarantee | Meaning | How |
|---|---|---|
| At-most-once | Never duplicated, may be lost | Acknowledge before processing; fire-and-forget |
| At-least-once | Never lost, may be duplicated | Acknowledge after processing; redeliver unacknowledged |
| Exactly-once (effectively) | Each message's **effect** happens once | At-least-once delivery **plus idempotent processing** (dedupe by message id or business key), or transactional processing inside one system (Kafka transactions) |

"Exactly-once delivery" across a network is impossible in general; what systems achieve is exactly-once **processing**. Design every consumer to be idempotent.

## 3.5 Idempotent consumers, retries and dead-letter queues

```python run A consumer that deduplicates, retries with a limit, and dead-letters poison messages
from backlab import redis_server
with redis_server() as r:
    r.xgroup_create('payments', 'ledger', id='0', mkstream=True)
    events = [('evt-1', '500'), ('evt-2', '250'), ('evt-1', '500'),      # evt-1 duplicated
              ('evt-3', 'abc'), ('evt-4', '100')]                         # evt-3 is malformed
    for eid, amount in events:
        r.xadd('payments', {'event_id': eid, 'amount': amount})
    balance = 0
    MAX_ATTEMPTS = 3
    def handle(fields):
        global balance
        if not r.set(f'processed:{fields["event_id"]}', 1, nx=True, ex=7 * 86400):
            return 'duplicate, skipped'                     # already applied: idempotent
        try:
            balance += int(fields['amount'])
            return 'applied'
        except ValueError:
            r.delete(f'processed:{fields["event_id"]}')     # not applied: allow a retry
            raise
    for round_no in range(MAX_ATTEMPTS + 1):
        resp = r.xreadgroup('ledger', 'c1', {'payments': '0' if round_no else '>'}, count=10)
        batch = resp[0][1] if resp else []
        if not batch:
            break
        for mid, fields in batch:
            attempts = r.hincrby('attempts', mid, 1)
            try:
                outcome = handle(fields)
                r.xack('payments', 'ledger', mid)
            except ValueError:
                if attempts >= MAX_ATTEMPTS:
                    r.xadd('payments:dlq', {**fields, 'error': 'invalid amount'})
                    r.xack('payments', 'ledger', mid)
                    outcome = f'failed {attempts} times -> dead-letter queue'
                else:
                    outcome = f'failed (attempt {attempts}), will retry'
            eid, amount = fields['event_id'], fields['amount']
            print(f'round {round_no}: {eid} amount={amount}: {outcome}')
    print('balance:', balance, '| dead letters:', r.xlen('payments:dlq'),
          '| pending:', r.xpending('payments', 'ledger')['pending'])
```

The duplicate `evt-1` was recognised and skipped, so the balance is 850, not 1,350. The malformed event was retried a limited number of times and then moved to a **dead-letter queue** for a human or a repair job, instead of blocking the stream forever (a "poison message"). In real systems, retries also wait with exponential back-off.

## 3.6 Ordering

Ordering is guaranteed only within one partition (Kafka) or one queue with one consumer. With several consumers, message 2 can finish before message 1. Options: partition by the entity key so that all events of one meter or account are handled in order by one consumer; include a **version or sequence number** in each event and ignore older versions; or design operations that commute (adding readings in any order gives the same total).

## 3.7 The dual-write problem and the outbox pattern

A service that writes to its database **and** publishes an event has a problem: the two cannot be committed atomically. If it commits the database and then crashes before publishing, the event is lost (billing never hears of the reading); if it publishes first and the database transaction fails, consumers act on something that never happened.

The **transactional outbox**: write the event into an `outbox` table **in the same database transaction** as the business change. A separate **relay** (a poller, or change-data capture such as Debezium reading the database log) publishes outbox rows to the broker and marks them sent. Delivery is at-least-once, so consumers deduplicate by event id.

```python run The outbox pattern with SQLite and a Redis stream as the broker
import json, sqlite3, uuid
from backlab import redis_server
db = sqlite3.connect(':memory:')
db.executescript('''
  CREATE TABLE reading (id INTEGER PRIMARY KEY, meter TEXT, kwh REAL);
  CREATE TABLE outbox (id TEXT PRIMARY KEY, topic TEXT, payload TEXT, sent INTEGER DEFAULT 0);
''')
def record_reading(meter, kwh, fail_after_insert=False):
    with db:                                              # one transaction for both writes
        cur = db.execute('INSERT INTO reading (meter, kwh) VALUES (?, ?)', (meter, kwh))
        db.execute('INSERT INTO outbox (id, topic, payload) VALUES (?, ?, ?)',
                   (str(uuid.uuid4()), 'readings',
                    json.dumps({'reading_id': cur.lastrowid, 'meter': meter, 'kwh': kwh})))
        if fail_after_insert:
            raise RuntimeError('crash before commit')
def relay(r):
    rows = db.execute('SELECT id, topic, payload FROM outbox '
                      'WHERE sent = 0 ORDER BY rowid').fetchall()
    for oid, topic, payload in rows:
        r.xadd(topic, {'event_id': oid, **json.loads(payload)})
        db.execute('UPDATE outbox SET sent = 1 WHERE id = ?', (oid,)); db.commit()
    return len(rows)
with redis_server() as r:
    record_reading('SM-1', 3.2)
    try:
        record_reading('SM-2', 9.9, fail_after_insert=True)
    except RuntimeError as e:
        print('transaction rolled back:', e)
    record_reading('SM-3', 1.1)
    print('readings in DB:', [m for (m,) in db.execute('SELECT meter FROM reading')])
    print('relay published:', relay(r), '| published again on the next run:', relay(r))
    print('events in the stream:', [f['meter'] for _, f in r.xrange('readings')])
```

The failed transaction rolled back the reading **and** its event together; the two committed readings produced exactly two events, and a second relay run had nothing left to send. If the relay crashed between `XADD` and the `UPDATE`, the event would be sent again on restart: at-least-once, which the idempotent consumer of Section 3.5 absorbs.

## 3.8 Sagas: transactions across services

A business process spanning services (place order → reserve stock → charge payment → schedule delivery) cannot use one database transaction. A **saga** is a sequence of local transactions, each publishing an event that triggers the next, with a **compensating action** for each step (release stock, refund payment) run in reverse if a later step fails. **Choreography** lets services react to each other's events (simple, but the flow is implicit); **orchestration** has a coordinator that tells each service what to do next (explicit, easier to monitor; tools: Temporal, Camunda, AWS Step Functions).

## 3.9 Choosing a broker

| Broker | Model | Strengths | Choose when |
|---|---|---|---|
| **Kafka** | Partitioned, replicated log with retention | Very high throughput, replay, ordering per key, stream processing (Kafka Streams, Flink) | Event streaming, analytics pipelines, event sourcing, many consumers of the same events |
| **RabbitMQ** | Queues with flexible routing (exchanges) | Per-message acknowledgements, priorities, delays, simple work queues | Task distribution, RPC-style workflows, complex routing |
| **Amazon SQS / SNS**, Google Pub/Sub | Managed queue / topic | No servers to run, scales automatically | Cloud-native systems; SQS FIFO for ordered, deduplicated queues |
| **Redis Streams** / Pub/Sub | Log with consumer groups (Streams); fire-and-forget fan-out (Pub/Sub) | Already in your stack; low latency | Moderate volumes; real-time notifications (Pub/Sub loses messages when no one listens) |

## 3.10 Spring equivalents and practical lessons

| Concept | Spring |
|---|---|
| Kafka producer/consumer | Spring for Apache Kafka: `KafkaTemplate`, `@KafkaListener`, `DefaultErrorHandler` with back-off and `DeadLetterPublishingRecoverer` |
| RabbitMQ | Spring AMQP: `RabbitTemplate`, `@RabbitListener`, dead-letter exchanges |
| Outbox | A JPA `OutboxEvent` entity saved in the same `@Transactional` method, plus Debezium or a scheduled relay |
| Events inside one service | `ApplicationEventPublisher`, `@TransactionalEventListener(phase = AFTER_COMMIT)` |

- Use a broker to decouple, absorb spikes and fan out; accept eventual consistency.
- Queue = one consumer per message; pub/sub = all subscribers; log = retained, replayable, per-group offsets.
- At-least-once delivery + idempotent consumers = effectively exactly-once.
- Limit retries, back off, dead-letter poison messages; monitor queue depth and consumer lag.
- Never dual-write: use the transactional outbox. Coordinate multi-service flows with sagas and compensations.
