## Part 5 solutions

### K5.1 Long polling

```python run A long-polling endpoint built on BLPOP
import threading, time, urllib.request
from backlab import redis_server, http_server, QuietHandler
with redis_server() as r:
    class Alerts(QuietHandler):
        def do_GET(self):
            meter = self.path.rsplit('/', 1)[1]
            item = r.blpop(f'alerts:{meter}', timeout=1)        # hold the request up to 1 s
            if item is None:
                self.send_response(204); self.end_headers(); return
            self.send_response(200); self.end_headers(); self.wfile.write(item[1].encode())
    with http_server(Alerts) as base:
        def poll(meter):
            t = time.perf_counter()
            with urllib.request.urlopen(f'{base}/alerts/{meter}') as resp:
                body = resp.read().decode()
                return resp.status, body, round(time.perf_counter() - t, 1)
        threading.Timer(0.3, lambda: r.rpush('alerts:SM-42', 'voltage below 200 V')).start()
        print('SM-42 (alert arrives after 0.3 s):', poll('SM-42'))
        print('SM-7 (no alert, times out):       ', poll('SM-7'))
```

The first request was answered as soon as the alert was pushed (about 0.3 s), the second returned 204 after the 1-second hold, and the client would immediately poll again. Each waiting client ties up a connection (and here a server thread), which is why SSE or WebSockets, or an asynchronous server, are preferred at scale.

### K5.2 SSE or WebSockets?

| Scenario | Choice | Why |
|---|---|---|
| Live electricity price ticker | **SSE** | Server → client only; automatic reconnection with `Last-Event-ID`; works through ordinary HTTP infrastructure and CDNs that support streaming |
| Support chat | **WebSockets** | Both sides send frequent messages, typing indicators, read receipts |
| Progress bar for a 5-minute export | **SSE** (or polling every few seconds) | One-way, low frequency; polling is acceptable and simplest |
| Collaborative whiteboard | **WebSockets** | High-frequency bidirectional updates with low latency; binary frames |

### K5.3 Detecting dead connections

```python run The server sees an abrupt disconnect; heartbeats catch the silent ones
import asyncio
import websockets
async def main():
    events = []
    async def handler(ws):
        events.append('client connected')
        try:
            async for _ in ws:
                pass
        except websockets.ConnectionClosed:
            pass
        events.append(f'server noticed the connection closed (code {ws.close_code})')
    async with websockets.serve(handler, '127.0.0.1', 0, ping_interval=0.2,
                                ping_timeout=0.2) as server:
        port = server.sockets[0].getsockname()[1]
        ws = await websockets.connect(f'ws://127.0.0.1:{port}')
        await asyncio.sleep(0.1)
        ws.transport.abort()                    # the client vanishes: no closing handshake
        await asyncio.sleep(0.3)
    print('\n'.join(events))
asyncio.run(main())
```

Here the operating system reported the dropped TCP connection at once, so the server noticed (close code 1006, "abnormal closure", because no closing handshake took place). On real networks a client can vanish **silently**: a phone loses signal, a NAT or load balancer drops an idle mapping, and no packet ever arrives to say so. Without heartbeats, the server keeps such half-open connections (and their memory and subscriptions) indefinitely. Sending pings every 20–30 seconds and closing connections that do not answer in time (the `ping_interval` and `ping_timeout` settings above) detects them, and also keeps intermediaries from timing out idle connections.

## Part 6 solutions

### K6.1 Multipart upload

```python run Parallel part uploads with a retry, reassembly and checksum verification
import hashlib, os, random
from concurrent.futures import ThreadPoolExecutor
random.seed(11)
data = os.urandom(5_300_000)                              # a 5.3 MB file
PART = 1_000_000
parts = [data[i:i + PART] for i in range(0, len(data), PART)]
store, attempts = {}, {}
def upload_part(n, chunk):
    attempts[n] = attempts.get(n, 0) + 1
    if n == 3 and attempts[n] == 1:
        raise ConnectionError(f'part {n}: connection reset')
    store[n] = chunk
    return n, hashlib.md5(chunk).hexdigest()              # S3 returns an ETag per part
def with_retry(n, chunk, tries=3):
    for _ in range(tries):
        try:
            return upload_part(n, chunk)
        except ConnectionError as e:
            print('retrying after:', e)
    raise RuntimeError(f'part {n} failed')
with ThreadPoolExecutor(max_workers=4) as pool:
    etags = sorted(pool.map(lambda p: with_retry(*p), enumerate(parts, start=1)))
assembled = b''.join(store[n] for n, _ in etags)          # "complete multipart upload"
print(f'{len(parts)} parts, attempts per part: {dict(sorted(attempts.items()))}')
print('assembled size matches:', len(assembled) == len(data))
same = hashlib.sha256(assembled).digest() == hashlib.sha256(data).digest()
print('SHA-256 matches:', same)
```

Only the failed part was sent again, not the whole file. In S3 the client starts an upload (getting an upload id), uploads parts (in parallel, in any order, each retryable and each presignable), then sends "complete" with the list of part numbers and ETags; abandoned uploads should be cleaned up by a lifecycle rule.

### K6.2 Offset versus cursor pagination

```python run A new row between page requests: offset skips, cursor does not
import sqlite3
db = sqlite3.connect(':memory:')
db.execute('CREATE TABLE alert (id INTEGER PRIMARY KEY, text TEXT)')
db.executemany('INSERT INTO alert (text) VALUES (?)', [(f'alert {i}',) for i in range(1, 9)])
ids = lambda sql, *a: [row[0] for row in db.execute(sql, a)]
page1_offset = ids('SELECT id FROM alert ORDER BY id DESC LIMIT 3 OFFSET 0')
page1_cursor = page1_offset[:]
db.execute("INSERT INTO alert (text) VALUES ('new alert')")    # arrives between the requests
page2_offset = ids('SELECT id FROM alert ORDER BY id DESC LIMIT 3 OFFSET 3')
page2_cursor = ids('SELECT id FROM alert WHERE id < ? ORDER BY id DESC LIMIT 3',
                   page1_cursor[-1])
print('offset: page 1', page1_offset, '-> page 2', page2_offset, '(6 shown again)')
print('cursor: page 1', page1_cursor, '-> page 2', page2_cursor)
plan = db.execute('EXPLAIN QUERY PLAN '
                  'SELECT id FROM alert WHERE id < 5 ORDER BY id DESC LIMIT 3')
print('cursor query plan:', plan.fetchone()[-1])
```

With newest-first offsets, an insertion shifts every row down, so page 2 repeated alert 6 (with deletions it would skip one instead). The cursor version asks for "older than the last id I saw", which is stable under inserts and uses the index to seek directly to the position: offset 100,000 would read and discard 100,000 rows; the cursor reads only the page. Encode the cursor opaquely (base64 of the last sort values) so clients cannot depend on its format.

### K6.3 Limit GraphQL query depth

```python run A depth-limit validation rule
from graphql import (parse, validate, build_schema, ValidationRule, GraphQLError,
                     FieldNode, OperationDefinitionNode)
schema = build_schema('''
  type Query { user(id: ID!): User }
  type User { name: String, friends: [User], meters: [Meter] }
  type Meter { id: ID, owner: User }
''')
def depth_limit(max_depth):
    class DepthLimit(ValidationRule):
        def enter_operation_definition(self, node: OperationDefinitionNode, *_):
            def depth(selection_set, level):
                worst = level
                for sel in selection_set.selections if selection_set else []:
                    if isinstance(sel, FieldNode) and sel.selection_set:
                        worst = max(worst, depth(sel.selection_set, level + 1))
                return worst
            d = depth(node.selection_set, 0)
            if d > max_depth:
                msg = f'query depth {d} exceeds the limit {max_depth}'
                self.report_error(GraphQLError(msg))
    return DepthLimit
ok = '{ user(id: "1") { name meters { id } } }'
evil = ('{ user(id: "1") { friends { friends { friends { friends '
        '{ meters { owner { name } } } } } } } }')
for name, q in [('normal query', ok), ('malicious query', evil)]:
    errors = validate(schema, parse(q), [depth_limit(3)])
    print(f'{name}: {"accepted" if not errors else errors[0].message}')
```

Each level of `friends` multiplies the work (friends of friends of friends...), so a few dozen bytes of query can demand millions of objects. Depth limits are the simplest guard; production servers add **cost analysis** (weights per field and list sizes), timeouts, pagination caps and persisted (allow-listed) queries for first-party apps.

### K6.4 Which API style?

| Scenario | Choice | Reason |
|---|---|---|
| Public API for partner utilities | **REST** with OpenAPI | Universally understood, cacheable, easy to secure and rate-limit per resource, stable versioning |
| Mobile home screen combining six entities | **GraphQL** (or a REST backend-for-frontend) | One round trip, exactly the fields the screen needs, schema-typed client code |
| Billing ↔ tariff service calls | **gRPC** | Internal, typed contract, low latency, deadlines propagated |
| 50,000 readings/s from gateways | **gRPC client streaming** (or MQTT into Kafka) | Long-lived streams, compact binary encoding, back-pressure; MQTT is the IoT standard for constrained devices |

### K6.5 Varint sizes

A varint stores 7 bits per byte (the eighth bit says "more bytes follow"). Bytes = ⌈bits / 7⌉: 1 → 1 byte; 127 (7 bits) → 1; 128 (8 bits) → 2; 300 (9 bits) → 2; 16,384 = 2<sup>14</sup> (15 bits) → 3; 1,000,000 (20 bits) → 3. In a message, each field adds a tag byte.

```python run Checking varint sizes with the protobuf library
from google.protobuf import wrappers_pb2
def varint_len(n):
    return max(1, (n.bit_length() + 6) // 7)
for n in (1, 127, 128, 300, 16_384, 1_000_000):
    msg = wrappers_pb2.UInt64Value(value=n).SerializeToString()
    print(f'{n:>9,}: varint {varint_len(n)} byte(s), message with tag {len(msg)} bytes, '
          f'hex {msg.hex()}')
```

The encoded message for 300 is `08 ac 02`: the tag `08` (field 1, varint type), then `ac 02`, which decodes as 0x2c + (0x02 << 7) = 44 + 256 = 300. Small numbers being small on the wire is part of why protobuf payloads beat JSON.

## Part 7 solutions

### K7.1 Chat messages, wide-column style

```python run Messages partitioned by (conversation, month), newest first, with a cursor
import sqlite3
db = sqlite3.connect(':memory:')
db.execute('''CREATE TABLE messages (
                conv TEXT, month TEXT, ts INTEGER, sender TEXT, body TEXT,
                PRIMARY KEY (conv, month, ts DESC)) WITHOUT ROWID''')
rows = [('c-42', '2026-03', 1000 + 10 * i, 'Priya' if i % 2 else 'Arjun', f'message {i}')
        for i in range(1, 13)]
db.executemany('INSERT INTO messages VALUES (?, ?, ?, ?, ?)', rows)
def page(conv, month, before=None, n=5):
    sql = 'SELECT ts, body FROM messages WHERE conv = ? AND month = ?'
    args = [conv, month]
    if before is not None:
        sql += ' AND ts < ?'; args.append(before)
    return db.execute(sql + ' ORDER BY ts DESC LIMIT ?', (*args, n)).fetchall()
p1 = page('c-42', '2026-03')
print('latest 5:', [b for _, b in p1])
p2 = page('c-42', '2026-03', before=p1[-1][0])
print('next page:', [b for _, b in p2])
plan = db.execute('EXPLAIN QUERY PLAN SELECT ts FROM messages WHERE conv = ? AND month = ? '
                  'ORDER BY ts DESC LIMIT 5', ('c-42', '2026-03')).fetchone()[-1]
print('plan:', plan)
```

The month in the partition key bounds the partition's size; "load older messages" continues into the previous month's partition when the current one is exhausted. The cursor is the last timestamp seen (in practice a time-based UUID, to avoid ties).

### K7.2 Embed or reference?

| Relationship | Decision | Why |
|---|---|---|
| A user's addresses | **Embed** | Few, owned by the user, read with the profile |
| A product's reviews | **Reference** (separate collection, maybe embed the top 3 and a count) | Unbounded, paginated, written by other users |
| An order's line items | **Embed** | Bounded, owned, read and written with the order, and a snapshot of prices at purchase time |
| A blog post's author | **Reference**, with the name and avatar **denormalised** into the post for display | The author is shared by many posts and changes independently |
| A meter's daily readings | **Reference** (separate time-bucketed partitions) | Grows forever; queried by time range, not with the meter's profile |

### K7.3 Partition sizing

```python run Rows and bytes per partition after five years
meters, per_day, size, days = 1_000_000, 96, 60, 365 * 5
for name, days_per_partition in [('per meter per day', 1), ('per meter per month', 30.4),
                                 ('per meter forever', days)]:
    rows = per_day * days_per_partition
    print(f'{name:20s}: {rows:>9,.0f} rows, {rows * size / 1e6:8.2f} MB per partition, '
          f'{meters * days / days_per_partition:>14,.0f} partitions')
print(f'total data: {meters * per_day * days * size / 1e12:.1f} TB before replication')
```

Per day gives tiny partitions (96 rows) but a query for a month must read 30 of them; per month (about 2,900 rows, 175 KB) suits monthly bills and charts well within the guideline; "forever" reaches 175,000 rows, beyond the row guideline and still growing, which makes repairs and compaction slow and creates uneven nodes. Per month is the balanced choice for this access pattern. Note the total: about 10.5 TB of raw readings, replicated three times, which is why old data is downsampled or moved to cheaper storage.

### K7.4 A second access pattern

```python run A secondary index table kept in sync in the same transaction
import sqlite3
db = sqlite3.connect(':memory:')
db.execute('CREATE TABLE t (pk TEXT, sk TEXT, data TEXT, PRIMARY KEY (pk, sk)) WITHOUT ROWID')
def add_meter(customer, meter, installed):
    with db:                                                  # both items or neither
        db.execute('INSERT INTO t VALUES (?, ?, ?)',
                   (f'CUST#{customer}', f'METER#{meter}', installed))
        db.execute('INSERT INTO t VALUES (?, ?, ?)',
                   (f'INSTALLED#{installed[:7]}', f'{installed}#METER#{meter}', customer))
for c, m, d in [('c1', 'SM-42', '2025-11-02'), ('c1', 'SM-43', '2026-01-15'),
                ('c2', 'SM-77', '2026-01-03'), ('c3', 'SM-91', '2026-01-28')]:
    add_meter(c, m, d)
jan = db.execute("SELECT sk, data FROM t WHERE pk = 'INSTALLED#2026-01' "
                 "ORDER BY sk").fetchall()
print('installed in January 2026:', [(sk.split('#')[-1], cust) for sk, cust in jan])
print("c1's meters:", db.execute("SELECT sk FROM t WHERE pk = 'CUST#c1'").fetchall())
```

The second item is an inverted copy keyed by the new access pattern, written atomically with the first (DynamoDB offers `TransactWriteItems`, or a GSI maintains such a copy automatically and asynchronously). Every new access pattern costs extra writes and storage: that is the trade made for constant-time reads.

## Part 8 solutions

### K8.1 Notification service

**Requirements.** Channels: email, SMS, push. Types: OTPs (urgent, seconds), outage alerts (urgent, possibly to millions at once), billing (can wait minutes). Must respect user preferences, quiet hours (except OTPs and safety alerts), and provider rate limits; never send duplicates; keep an audit trail.

**Design.**

1. **API**: `POST /notifications` with `{user_id, type, template, data, idempotency_key}`; returns 202. Stores a `notification` row (status `queued`) with a unique key (deduplication across retries of the caller).
2. **Routing**: a router service loads preferences and quiet hours (cached in Redis), renders templates, chooses channels, and enqueues one **delivery** message per channel into **priority queues**: `otp` (highest), `alerts`, `billing`. Quiet-hour deliveries go into a delayed queue (sorted set by due time).
3. **Workers per channel**: consume the queues (OTP workers reserved so that a mass outage alert cannot starve OTPs); each provider has a **token-bucket limiter** in Redis matching its contract; on 429/5xx, retry with exponential back-off and jitter, switch to a fallback provider after N failures (circuit breaker); dead-letter after the final attempt.
4. **Idempotency**: each delivery has an id used as the provider's idempotency key where supported, and a Redis `SET NX` before sending, so redelivered messages are not sent twice.
5. **Fan-out for outages**: the alert is one event; a fan-out job pages through affected users (by feeder or area) and enqueues deliveries in batches, rate-limited so that providers and the database are not flooded.
6. **Status and webhooks**: providers call back delivery receipts; update the delivery status; expose status to callers; metrics on queue depth, send rate, failure rate per provider, OTP latency (alert if the 95th percentile exceeds 10 s).
7. **Storage**: notifications and deliveries in PostgreSQL (partitioned by month); templates versioned; personal data minimised and retention-limited.

### K8.2 Smart-meter ingestion

**Estimates.** 1,000,000 meters / 900 s ≈ **1,111 readings/s** on average, but meters report on the quarter hour, so plan for bursts of 10–20 times that (or ask meters to add random jitter). At about 200 bytes per message on the wire: ~0.2 MB/s average. Storage at 60 bytes per stored reading: 96 million rows/day, ~5.8 GB/day, ~2.1 TB/year before replication. Alerts: 5% ≈ 55/s.

**Design.**

1. **Ingestion**: meters (or head-end gateways) send over MQTT or HTTPS to stateless ingestion services behind a load balancer; authenticate each device (mutual TLS or per-device keys); validate and enrich; produce to **Kafka** topic `readings`, keyed by `meter_id` (ordering per meter), with 24–48 partitions to absorb bursts and allow scaling; acknowledge the device only after Kafka acknowledges (acks=all).
2. **Storage consumer**: batches writes into a time-series or wide-column store (Cassandra/ScyllaDB partitioned by meter and month, or TimescaleDB hypertables), idempotent on `(meter_id, ts)`; downsamples to hourly and daily aggregates; raw data older than 13 months moves to object storage (Parquet) for analytics.
3. **Real-time alerts**: a stream processor (Kafka Streams or Flink) evaluates rules (voltage out of range, tamper flags, zero consumption for 24 h) with per-meter state; emits `AlertRaised` events to the notification service (K8.1) and to a WebSocket/SSE fan-out for the operations dashboard, via a Redis Pub/Sub backplane.
4. **Customer dashboard**: reads aggregates (hourly/daily) from the query store, cached in Redis per meter and day with short TTLs; "today so far" from a Redis sorted set updated by the consumer.
5. **Nightly billing**: a scheduled, chunked, resumable job (K4.2) reading daily aggregates up to a cut-off, idempotent per `(meter, period)`, publishing bills through an outbox.
6. **Reliability**: replication factor 3 everywhere; consumer lag alerts; dead-letter topic for malformed readings with a replay tool; back-pressure (ingestion returns 503 with `Retry-After` and devices buffer locally) rather than dropping data.
7. **Security**: device identity and certificate rotation, encryption in transit and at rest, per-tenant access control on dashboards (covered in the security guide).
