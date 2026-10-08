# Chapter 8: NoSQL Data Modelling
%Key-value, document, wide-column and graph stores, and designing from access patterns

## 8.1 The families

"NoSQL" covers several different designs, each giving up some relational features (joins, multi-row transactions, a fixed schema) in exchange for scale, flexibility or speed on particular access patterns.

| Family | Model | Examples | Strengths | Typical use |
|---|---|---|---|---|
| Key-value | Opaque value by key | Redis, DynamoDB (also document-like), Memcached | Fastest lookups, simple scaling | Sessions, caches, carts, feature flags |
| Document | JSON-like documents, queried by fields | MongoDB, Couchbase, Firestore, PostgreSQL `jsonb` | Flexible schema, nested data read in one go | Catalogues, user profiles, content |
| Wide-column | Rows grouped by **partition key**, sorted by **clustering key** | Cassandra, ScyllaDB, HBase, Bigtable | Huge write throughput, linear scaling, time series | IoT readings, event logs, messaging |
| Graph | Nodes and edges with properties | Neo4j, Amazon Neptune | Multi-hop relationship queries | Social graphs, fraud rings, recommendations |
| Search | Inverted indexes over text | Elasticsearch, OpenSearch, Solr | Full-text search, relevance, aggregations | Product search, log analytics |
| Time series | Timestamped measurements | InfluxDB, TimescaleDB, Prometheus | Compression, downsampling, time-window queries | Metrics, sensor data |

The central difference from relational design: in SQL you **normalise** first and let queries join whatever they need; in most NoSQL stores you **start from the access patterns** (the exact queries the application will run) and shape the data so that each query reads one partition or one document, usually by **denormalising** (duplicating data).

## 8.2 Documents: embed or reference

A document groups data that is read together. Embed when the child data belongs to the parent, is bounded in size and is read with it (an order's line items, a meter's configuration); reference when it is shared, large, unbounded or updated independently (the customer who placed many orders, a meter's millions of readings).

```python run A document store on SQLite's JSON functions, with an index on a document field
import json, sqlite3
db = sqlite3.connect(':memory:')
db.execute('CREATE TABLE orders (id INTEGER PRIMARY KEY, doc TEXT NOT NULL)')
docs = [
  {'customer': {'id': 'c1', 'name': 'Priya'}, 'city': 'Kolkata', 'status': 'paid',
   'items': [{'sku': 'PLUG-1', 'qty': 2, 'price': 1499},
             {'sku': 'METER-3', 'qty': 1, 'price': 5200}]},
  {'customer': {'id': 'c2', 'name': 'Arjun'}, 'city': 'Pune', 'status': 'pending',
   'items': [{'sku': 'PLUG-1', 'qty': 1, 'price': 1499}]},
  {'customer': {'id': 'c1', 'name': 'Priya'}, 'city': 'Kolkata', 'status': 'paid',
   'items': [{'sku': 'BULB-9', 'qty': 6, 'price': 249}], 'coupon': 'DIWALI10'},
]
db.executemany('INSERT INTO orders (doc) VALUES (?)', [(json.dumps(d),) for d in docs])
print('order 1 in one read:', json.loads(db.execute('SELECT doc FROM orders WHERE id = 1')
                                         .fetchone()[0])['items'])
rows = db.execute('''
  SELECT id, json_extract(doc, '$.customer.name'),
         (SELECT SUM(json_extract(i.value, '$.qty') * json_extract(i.value, '$.price'))
            FROM json_each(doc, '$.items') i)
  FROM orders WHERE json_extract(doc, '$.status') = 'paid' ''').fetchall()
print('paid orders with totals:', rows)
with_coupon = db.execute("SELECT id FROM orders "
                         "WHERE json_extract(doc, '$.coupon') IS NOT NULL").fetchall()
print('documents may differ in shape; coupon present in:', [r[0] for r in with_coupon])
query = "SELECT id FROM orders WHERE json_extract(doc, '$.city') = 'Kolkata'"
print('plan before index:', db.execute('EXPLAIN QUERY PLAN ' + query).fetchone()[-1])
db.execute("CREATE INDEX idx_city ON orders (json_extract(doc, '$.city'))")
print('plan after index: ', db.execute('EXPLAIN QUERY PLAN ' + query).fetchone()[-1])
```

The order and its items came back in one read with no join; documents could have different fields (only one has a coupon); and an index on a field inside the document turned a full scan into an index search, just as MongoDB indexes fields. Notice the cost of embedding: the customer's name is **copied** into every order; if Priya changes her name, old orders keep the old one, which may be exactly right for an invoice (a snapshot) and wrong for a profile.

## 8.3 Key-value and single-table design (DynamoDB style)

DynamoDB stores items under a **partition key** (PK) and an optional **sort key** (SK). Queries must name the partition key, and can select a **range** of sort keys (`begins_with`, `between`). A common technique is **single-table design**: different entity types share one table, with composite keys chosen so that each access pattern is one key lookup or one range query on one partition.

| Access pattern | Key condition |
|---|---|
| Get a customer's profile | PK = `CUST#c1`, SK = `PROFILE` |
| List a customer's meters | PK = `CUST#c1`, SK begins with `METER#` |
| Readings of one meter on one day | PK = `METER#SM-42#2026-03-02`, SK between two times |
| Latest reading of a meter | Same PK, sort descending, limit 1 |

```python run Single-table design: every access pattern is one range scan on one partition
import sqlite3
db = sqlite3.connect(':memory:')
db.execute('CREATE TABLE t (pk TEXT, sk TEXT, data TEXT, PRIMARY KEY (pk, sk)) WITHOUT ROWID')
items = [('CUST#c1', 'PROFILE', 'Priya, Kolkata'),
         ('CUST#c1', 'METER#SM-42', 'installed 2025-11-02'),
         ('CUST#c1', 'METER#SM-43', 'installed 2026-01-15'),
         ('CUST#c2', 'PROFILE', 'Arjun, Pune'),
         ('CUST#c2', 'METER#SM-77', 'installed 2025-08-30')]
items += [('METER#SM-42#2026-03-02', f'T{h:02d}:{m:02d}',
           f'{0.4 + 0.01 * (h * 4 + m // 15):.2f}')
          for h in range(24) for m in (0, 15, 30, 45)]
db.executemany('INSERT INTO t VALUES (?, ?, ?)', items)
def query(pk, sk_from='', sk_to='￿', desc=False, limit=None):
    sql = 'SELECT sk, data FROM t WHERE pk = ? AND sk >= ? AND sk <= ? ORDER BY sk'
    sql += ' DESC' if desc else ''
    sql += f' LIMIT {limit}' if limit else ''
    plan = db.execute('EXPLAIN QUERY PLAN ' + sql, (pk, sk_from, sk_to)).fetchone()[-1]
    return db.execute(sql, (pk, sk_from, sk_to)).fetchall(), plan
print('profile:', query('CUST#c1', 'PROFILE', 'PROFILE')[0])
print("Priya's meters:", query('CUST#c1', 'METER#', 'METER#￿')[0])
rows, plan = query('METER#SM-42#2026-03-02', 'T18:00', 'T18:45')
print('readings 18:00-18:45:', rows)
print('latest reading:', query('METER#SM-42#2026-03-02', desc=True, limit=1)[0])
print('how the store finds them:', plan)
```

Every query used the primary key directly (`SEARCH ... USING PRIMARY KEY`): no scans and no joins, which is what lets such tables scale to billions of items with constant latency. The price is that the design is tied to these access patterns; a new question ("all meters installed in January across customers") needs a **secondary index** (in DynamoDB, a GSI with its own keys) or a pipeline into an analytics store.

Two rules from this design apply to every partitioned store:

- **Bound the partition size**: the meter's readings are split per day (`METER#SM-42#2026-03-02`), so no partition grows forever (96 readings a day at 15-minute intervals).
- **Spread the load**: a partition key with few values (`status = active`) creates **hot partitions**; choose high-cardinality keys, and add a shard suffix for very hot ones.

## 8.4 Wide-column stores and time series

Cassandra models data the same way: a table's **partition key** decides which nodes hold a row (by consistent hashing), and the **clustering columns** order rows inside the partition on disk. The meter readings table would be:

```text
CREATE TABLE readings_by_meter_day (
  meter_id text, day date, ts timestamp, kwh double,
  PRIMARY KEY ((meter_id, day), ts)          -- partition (meter, day); rows sorted by ts
) WITH CLUSTERING ORDER BY (ts DESC);        -- newest first: "latest" is the first row
```

Writes are appends to a log and an in-memory table (LSM tree), so they are very fast; there are no joins, and a query must give the full partition key. A second query pattern ("readings for all meters in a city at 18:00") gets **its own table**, written at the same time: denormalising by query is normal here.

For time series in Redis, a sorted set scored by timestamp gives range queries and trimming:

```python run Time series in a Redis sorted set: range queries, latest value, retention and downsampling
from backlab import redis_server
with redis_server() as r:
    base = 1_772_400_000                                   # a fixed starting timestamp
    for i in range(96):                                    # one day at 15-minute intervals
        r.zadd('ts:SM-42', {f'{base + 900 * i}:{0.4 + 0.01 * i:.2f}': base + 900 * i})
    window = r.zrangebyscore('ts:SM-42', base + 900 * 72, base + 900 * 75)
    print('18:00-18:45 values:', [m.split(':')[1] for m in window])
    print('latest:', r.zrange('ts:SM-42', -1, -1)[0].split(':')[1])
    removed = r.zremrangebyscore('ts:SM-42', 0, base + 900 * 47)   # keep the last 12 h
    print('retention trimmed', removed, 'points; kept', r.zcard('ts:SM-42'))
    values = [float(m.split(':')[1]) for m in r.zrange('ts:SM-42', 0, -1)]
    hourly = [round(sum(values[i:i + 4]), 2) for i in range(0, len(values), 4)]
    print('hourly kWh (downsampled):', hourly[:6], '...')
```

## 8.5 Consistency in distributed stores

Most NoSQL databases replicate each partition to N nodes (often 3) and let you choose how many replicas a write (W) and a read (R) must reach. If **R + W > N**, every read overlaps the latest write on at least one replica: **strong consistency** for that operation. With R = W = 1 you get the lowest latency and highest availability, but reads can be stale (**eventual consistency**).

```python run Which R and W settings guarantee that reads see the latest write (N = 3)?
from itertools import combinations
N = 3
for W in range(1, N + 1):
    for R in range(1, N + 1):
        always = all(set(w) & set(rd) for w in combinations(range(N), W)
                     for rd in combinations(range(N), R))
        print(f'W={W} R={R}: R+W={R + W} {">" if R + W > N else "<="} N, '
              f'every read overlaps the latest write: {always}')
```

Brute force over every choice of replicas confirms the rule: the overlap is guaranteed exactly when R + W > N. Typical settings: `QUORUM` writes and reads (2 of 3) for consistency; `ONE` for metrics where a slightly stale value is acceptable. The **CAP theorem** says that during a network partition a system must choose between consistency and availability; **PACELC** adds that even without partitions there is a latency-versus-consistency trade-off, which is the everyday choice.

## 8.6 SQL or NoSQL?

| Choose a relational database when | Choose a NoSQL store when |
|---|---|
| Data is relational and queried in many, changing ways | Access patterns are few, known and simple (by key, by key range) |
| You need multi-row transactions and constraints (money, inventory, bookings) | You need massive write throughput or data volume beyond one machine |
| Strong consistency matters | The schema varies per item, or changes very often |
| Ad-hoc reporting and joins | Latency must stay flat at any scale (key lookups) |

Most systems use both: **PostgreSQL or MySQL as the source of truth**, Redis for caching and counters, a search engine for text search, a wide-column or time-series store for high-volume readings, and object storage for files. Modern relational databases also cover many "NoSQL" needs (`jsonb` documents with indexes, partitioning, read replicas), so start relational unless a specific requirement says otherwise.

## 8.7 Practical lessons

- List the access patterns first; design keys so each pattern reads one partition or document.
- Embed what is read together and bounded; reference what is shared, large or independently updated.
- Bound partition sizes (time buckets) and avoid hot partitions (high-cardinality keys, sharding).
- Denormalise per query in wide-column stores; keep duplicates in sync from one write path or events.
- Tune consistency with R + W > N; start with a relational source of truth.

# Chapter 9: Interview Questions and a Design Checklist
%The questions senior back-end interviews ask about these topics, and how to answer them

## 9.1 Questions with the core of a good answer

| Question | Core of the answer |
|---|---|
| How does cache-aside work, and how do you invalidate? | Read through the cache, load on miss with a TTL; on write update the DB then delete the key; TTL bounds staleness; races and delayed double delete |
| What is a cache stampede and how do you prevent it? | Many concurrent misses on an expired hot key; single-flight lock with re-check, early refresh, TTL jitter, serve stale |
| LRU vs LFU? | Recency vs frequency; LFU keeps stable best-sellers; Redis approximates both |
| Why is Redis fast, and is it single-threaded? | In memory, efficient data structures, one command-execution thread (no locks; each command atomic), I/O threads for networking in newer versions |
| Design a rate limiter. | Key choice, algorithm (token bucket for burst + rate), atomic Lua in Redis, 429 + Retry-After, gateway placement, fail open or closed |
| What is idempotency? How do you make POST /payments safe to retry? | Same effect once or many times; Idempotency-Key, atomic claim, store and replay the response, body fingerprint, unique constraint |
| How do distributed locks fail? | Lease expiry during a pause, clock issues, failover; token-checked release; fencing tokens; prefer DB constraints for correctness |
| Queue vs pub/sub vs log? | One consumer per message; every subscriber; retained, replayable log with per-group offsets |
| At-least-once vs exactly-once? | Redelivery may duplicate; exactly-once processing = at-least-once + idempotent consumer or transactions |
| How do you guarantee ordering in Kafka? | Same key → same partition → ordered; one consumer per partition in a group; idempotent producer |
| What is a dead-letter queue? | Where messages go after max retries, so poison messages do not block the queue; alert and repair |
| What is the outbox pattern and why? | Event row in the same transaction as the data; relay publishes; avoids the dual-write problem |
| What is a saga? | Sequence of local transactions with compensations; choreography vs orchestration |
| How do you run a cron job once in a cluster? | Per-occurrence lock (ShedLock), clustered scheduler (Quartz), or a single CronJob |
| How do you retry failing jobs? | Exponential back-off with jitter, max attempts, DLQ, idempotent jobs |
| SSE vs WebSockets vs long polling? | One-way stream with auto-resume vs full duplex vs fallback; choose the simplest |
| How do you scale WebSockets horizontally? | Pub/sub backplane, heartbeats, connection limits, LB support for upgrades |
| How should users upload large files? | Presigned URLs straight to object storage, multipart, then async processing |
| REST vs GraphQL vs gRPC? | Public/cacheable vs client-shaped queries vs internal typed binary streaming |
| What is the N+1 problem in GraphQL (and ORMs)? | One query per child; batch with DataLoader (`@BatchMapping`, JPA fetch joins) |
| How do you prevent lost updates in a REST API? | ETag + If-Match → 412; or `@Version` optimistic locking |
| How do you model data in DynamoDB/Cassandra? | Start from access patterns; partition and sort keys; bound partitions; denormalise per query |
| When would you choose NoSQL over SQL? | Known simple access patterns at huge scale, flexible schema; otherwise relational |
| Explain R + W > N. | Read and write quorums overlap, so reads see the latest write |

## 9.2 A checklist for any back-end design

1. **Requirements and numbers**: users, requests per second (peak), data size and growth, read/write ratio, latency targets, consistency needs (HLD guide, Chapter 2).
2. **API**: resources or operations, error format, pagination, idempotency for writes, versioning, authentication.
3. **Data**: source of truth, schema, indexes, partitioning; what may be stale and for how long.
4. **Caching**: what, where, TTLs, invalidation, stampede protection.
5. **Async work**: what leaves the request path; queue or log; retries, DLQ, idempotent consumers; outbox for events.
6. **Scheduled work**: once per cluster; idempotent; observable.
7. **Real-time**: SSE or WebSockets; fan-out across instances.
8. **Files**: object storage, presigned URLs, scanning, CDN.
9. **Protection**: rate limits, timeouts on every outbound call, circuit breakers, bulkheads, back-pressure.
10. **Observability**: structured logs with correlation ids, metrics (latency percentiles, error rate, queue depth, cache hit ratio, consumer lag), traces, alerts on symptoms.
11. **Failure modes**: what happens when Redis, the broker or a dependency is down; graceful degradation.
12. **Security**: authentication, authorisation on every object, secrets management, encryption (the security guide).
