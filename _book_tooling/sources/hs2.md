## Part 6 solutions

### H6.1 Design a REST API

| Endpoint | Purpose | Key responses |
|---|---|---|
| `GET /v1/books?q=design&cursor=…&limit=20` | Search, cursor-paginated | 200 with `next_cursor` |
| `GET /v1/books/{isbn}` | Book details with copy availability | 200, 404 |
| `POST /v1/loans` `{member_id, isbn}` + `Idempotency-Key` | Borrow a copy | 201 with loan and due date; 409 no copy available; 422 loan limit reached |
| `POST /v1/loans/{loan_id}/return` + `Idempotency-Key` | Return a copy | 200 with any fine; 409 already returned |
| `GET /v1/members/{id}/loans?status=active` | List a member's loans | 200, 403 for another member's loans |

Borrowing and returning change state and may be retried by a flaky mobile client, so both take an idempotency key. Returning is modelled as an action on the loan (`/return`) rather than a `DELETE`, because the loan record is kept for history and fines.

### H6.2 A food-order saga

| Step | Action | Compensation |
|---|---|---|
| 1 | Create order (status PENDING) | Mark order CANCELLED |
| 2 | Restaurant accepts | Notify restaurant of cancellation |
| 3 | Authorise payment (hold, not capture) | Release the authorisation |
| 4 | Assign delivery partner | Unassign and release the partner |
| 5 | Capture payment when the food is picked up | Refund |

If restaurants often reject orders, put **restaurant acceptance before payment** (as above) and use **authorise-then-capture**, so a rejection never needs a refund: releasing an authorisation is cheaper and invisible to the customer. An orchestrator owns the state machine, every step and compensation is idempotent, and the order shows a semantic status ("waiting for restaurant") instead of pretending to be confirmed.

### H6.3 Keyset pagination

```python run Opaque cursors over (created_at, id)
import base64, json, sqlite3
db = sqlite3.connect(':memory:')
db.execute('CREATE TABLE posts (id INTEGER PRIMARY KEY, created_at INT, title TEXT)')
db.execute('CREATE INDEX idx_posts_time ON posts (created_at DESC, id DESC)')
db.executemany('INSERT INTO posts (id, created_at, title) VALUES (?, ?, ?)',
               # ties in created_at
               [(i, 1000 + i // 2, f'post {i}') for i in range(1, 31)])

def encode(row): return base64.urlsafe_b64encode(json.dumps(row).encode()).decode()
def decode(cur): return json.loads(base64.urlsafe_b64decode(cur.encode()))

def page(cursor=None, limit=7):
    if cursor:
        ts, pid = decode(cursor)
        rows = db.execute('SELECT id, created_at FROM posts WHERE (created_at, id) < (?, '
                '?) '
                          'ORDER BY created_at DESC, id DESC LIMIT ?', (ts, pid,
                                  limit)).fetchall()
    else:
        rows = db.execute('SELECT id, created_at FROM posts ORDER BY created_at DESC, id '
                'DESC LIMIT ?',
                          (limit,)).fetchall()
    return [r[0] for r in rows], (encode([rows[-1][1], rows[-1][0]]) if rows else None)

seen, cursor = [], None
p1, cursor = page(cursor); seen += p1
db.executemany('INSERT INTO posts (id, created_at, title) VALUES (?, ?, ?)',
               [(31, 2000, 'new'), (32, 2001, 'newer')])   # arrive between requests
while cursor:
    p, cursor = page(cursor)
    seen += p
    if not p: break
print('first page:', p1)
print('pages walked:', len(seen), 'ids | duplicates:', len(seen) - len(set(seen)),
      '| missing originals:', sorted(set(range(1, 31)) - set(seen)))
print('example cursor:', encode([1015, 30]))
```

The cursor encodes the last row's `(created_at, id)`; including `id` breaks ties between posts with the same timestamp. New posts appear only when the client starts again from the top, which is the expected behaviour for a feed. The composite index makes each page a single index range scan, unlike `OFFSET`, which must skip all earlier rows.

## Part 7 solutions

### H7.1 A real-time leaderboard

- **Store**: Redis sorted sets: `ZINCRBY board score player`, `ZREVRANGE board 0 99` for the top 100, `ZREVRANK` + `ZREVRANGE rank-5 rank+5` for "around me". All are O(log n).
- **Scale**: 10 M members in one sorted set is about 1 GB, which fits one Redis primary with replicas for reads. Write rate decides sharding: if updates exceed one node, shard by player into N sorted sets, compute the global top 100 by merging each shard's top 100, and compute global rank by summing `ZCOUNT` of higher scores across shards.
- **Durability**: scores are also written to a database (or Kafka) as the source of truth; Redis can be rebuilt.
- **Time windows**: daily or weekly boards are separate keys with expiry.
- **Ties**: encode score and time into the sort key (higher score first, then earlier achievement).

### H7.2 A distributed job scheduler

```text
API -> jobs table (id, next_run_at, cron, payload, status, attempts), indexed on next_run_at
scheduler nodes: every second, claim due jobs:
   UPDATE jobs SET status='CLAIMED', owner=?, lease_until=now()+60s
   WHERE status = 'READY' AND next_run_at <= now() ORDER BY next_run_at LIMIT 500
 -> push to a work queue (Kafka/SQS) -> workers execute (idempotently) -> report result
 -> success: compute next_run_at from cron, status READY; failure: back-off retry, DLQ after N
reaper: jobs whose lease expired while CLAIMED go back to READY
```

Key points: claiming with a conditional update (or `SELECT ... FOR UPDATE SKIP LOCKED`) makes every job claimed by exactly one scheduler; leases handle crashed nodes; partition the jobs table by `next_run_at` buckets or by hash for scale; workers must be idempotent because a job can run twice when a lease expires during a slow run.

### H7.3 Sensor telemetry alerting

200 000 readings/s (2 M every 10 s).

```text
sensors -> MQTT brokers -> Kafka (key = sensor_id) -> stream processor (state per sensor)
   state: last 3 readings, threshold (from a config topic), alert status
   rule: 3 consecutive > threshold -> raise alert once (state machine OK -> ALERTING -> OK)
   group by plant: > 30% of a plant's sensors silent together -> one "plant offline" alert,
                   suppress per-sensor "no data" alerts for that plant
-> alerts topic -> notification service (dedup, escalation, on-call routing)
```

The 30-second budget is met by keyed streaming state (no database round trips per reading). Hysteresis (raise after 3 readings over the threshold, clear after 3 under) prevents flapping, and grouping turns thousands of symptoms into one actionable alert.

### H7.4 Flash-sale ticketing

- **Admission control**: a virtual **waiting room** (queue token issued at the edge), letting users into the purchase flow at a rate the backend can sustain. This keeps the site up and is fair (first come, first served by queue position).
- **Inventory**: seats held with an atomic conditional update (or Redis `DECR` on an available counter for general admission, a per-seat `SET NX EX` for assigned seats), with a short hold (5 minutes) during payment.
- **No oversell**: the final booking is a database transaction that checks the hold is still valid; the counter in Redis is a fast pre-filter, not the source of truth.
- **Static content and seat maps** from the CDN; bots limited with per-account limits, CAPTCHAs and device checks.
- **Release**: expired holds return seats to the pool; a reconciliation job compares Redis counters with the database.

## Part 8 solutions

### H8.1 Design Instagram

**Model answer outline.** Requirements: upload photos with captions, follow, home feed, likes and comments, profile pages; 500 M DAU; feed p99 under 300 ms; media durable. Estimates: suppose 100 M uploads/day × 2 MB ≈ 200 TB/day of media → object storage + CDN; feed reads ~10× writes. API: pre-signed upload, `POST /posts`, `GET /feed?cursor`, `POST /posts/{id}/likes`. Data: users and follows (sharded SQL or a graph store), posts metadata (sharded by user_id), likes and comments (wide-column, partition by post_id), counters in Redis with periodic persistence. Feed: hybrid fan-out (push to followers' Redis feed lists, pull for celebrities), ranking service on top. Media: upload to object storage, async resize pipeline, CDN delivery. Deep dives: celebrity fan-out, hot posts' like counters (sharded counters), feed cache for active users only, notification fan-out through queues.

| Rubric line | 2 points if you… |
|---|---|
| Requirements | Listed core features and numeric non-functional targets; scoped out stories/reels |
| Estimates | Derived media storage/bandwidth and feed QPS, and used them to choose CDN + object storage |
| Media path | Pre-signed uploads, async processing, CDN serving |
| Data model | Sharding keys chosen per access pattern (user_id for posts, post_id for likes) |
| Feed | Push/pull/hybrid with the celebrity problem addressed |
| Hot spots | Like counters and viral posts handled (caching, sharded counters) |
| Failure and consistency | Eventual consistency for counts and feed; durability for media; retries and queues |
| Trade-offs | Explained at least three trade-offs explicitly |

### H8.2 Design collaborative document editing

**Model answer outline.** Clients connect by websocket to a collaboration service; each document is owned by one server process at a time (route by document id), which orders operations. Concurrency control uses **operational transformation** (server orders and transforms concurrent operations, as Google Docs does) or **CRDTs** (operations commute, so replicas converge without a central order, which helps offline editing). Every operation is appended to a per-document operation log (durable, the source of truth); periodic snapshots make loading fast; version history is snapshots plus logs. Presence and cursors are ephemeral messages (not persisted). Offline edits are queued on the client and merged on reconnect (natural with CRDTs). Permissions are checked when joining a session. Large documents are loaded in chunks.

| Rubric line | 2 points if you… |
|---|---|
| Real-time transport | Chose websockets and routed all editors of a document to one owner (or a CRDT relay) |
| Conflict resolution | Explained OT or CRDTs and why naive last-write-wins fails |
| Durability | Operation log + snapshots; recovery after a server crash |
| Offline support | Described merging queued edits |
| Presence | Kept cursors ephemeral and separate from document data |
| Scale | Sharded documents across collaboration servers; handled a hot document with many viewers |
| History | Versioning from snapshots and logs |
| Trade-offs | OT (central server, simpler data) versus CRDT (offline-friendly, more metadata) |

### H8.3 Design an EV charging network backend

**Model answer outline.** Stations speak **OCPP** (the Open Charge Point Protocol) over websockets to a **charge-point gateway** tier (stateful connections, like chat gateways). Status changes (available, charging, faulted) and meter values (kWh every 30–60 s) go to Kafka keyed by charger id. A **station-state service** keeps live availability in Redis (geo-indexed for "chargers near me"); a **booking service** reserves time slots with conditional writes (no double booking, like seat holds); a **session service** runs the start/stop state machine, sending remote commands to chargers and handling lost connections (a session that started offline is reconciled when the charger reconnects). **Billing** computes energy × tariff (time-of-use pricing) from meter values with idempotent upserts, settling payments through a PSP with idempotency keys. A **load-management** service watches site and grid limits and, during peaks or demand-response events from the utility, sends lower charging profiles (current limits) to chargers through OCPP smart-charging messages, prioritising by reservation or tariff. Telemetry lands in a time-series store for operators' live dashboards and forecasting.

| Rubric line | 2 points if you… |
|---|---|
| Device connectivity | Stateful gateway tier for long-lived charger connections; offline chargers and reconnects handled |
| Availability search | Geo-indexed live status; eventual consistency acceptable with confirmation at start |
| Reservations | Atomic slot booking with expiry; no-shows released |
| Sessions | Clear state machine; remote start/stop idempotent; reconciliation of offline sessions |
| Billing | Metering from device data, time-of-use tariffs, idempotent payments, disputes and reconciliation |
| Grid integration | Load management and demand response with per-site limits and prioritisation |
| Data platform | Time-series storage, operator dashboards, forecasting |
| Trade-offs | Strong consistency for bookings and billing, eventual for status and dashboards |
