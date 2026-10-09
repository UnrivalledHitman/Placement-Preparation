## Part 3 solutions

### Q3.1 Idempotent writes to a database

```python run Plain inserts versus a processed-event check, under replays
import random, sqlite3

def run(dedupe, rng, n=3000, batch=25, crash_p=0.04):
    db = sqlite3.connect(':memory:')
    db.execute('CREATE TABLE payments (event_id TEXT, amount REAL)')
    db.execute('CREATE TABLE processed (event_id TEXT PRIMARY KEY)')
    committed = 0
    while committed < n:
        records = range(committed, min(committed + batch, n))
        crashed = False
        for r in records:
            with db:   # one database transaction per event
                if dedupe:
                    if db.execute('SELECT 1 FROM processed WHERE event_id = ?',
                            (f'e{r}',)).fetchone():
                        continue                               # replayed event: skip
                    db.execute('INSERT INTO processed VALUES (?)', (f'e{r}',))
                db.execute('INSERT INTO payments VALUES (?, ?)', (f'e{r}', 100.0))
            if rng.random() < crash_p / batch:
                crashed = True
                break   # crash before the offset commit
        if not crashed:
            committed = records[-1] + 1   # offsets committed after the batch
    total = db.execute('SELECT count(*), count(DISTINCT event_id) FROM payments').fetchone()
    return total[0] - total[1]

rng = random.Random(51)
for dedupe in [False, True]:
    print(f'processed-event check {"on " if dedupe else "off"}: duplicate payments '
            f'{run(dedupe, rng)}')
```

Every crash replays the uncommitted part of the batch. Without the check, each replayed event inserts another payment; with it, the event ID and the payment are written in the **same** database transaction, so a replayed event finds its ID and is skipped. (A unique constraint on `payments.event_id` with `INSERT ... ON CONFLICT DO NOTHING` achieves the same in one statement.)

### Q3.2 Exactly-once emails?

Yes, a customer can receive two emails. `exactly_once_v2` makes the application's **Kafka** outputs and offsets commit atomically, but an email is a side effect outside Kafka: if the task sends the email and then crashes before its transaction commits, the transaction aborts, the input is reprocessed, and the email is sent again. No messaging system can make an external call exactly-once by itself.

Design: produce an `EmailRequested` event (with the order ID) **inside** the transaction, and let a separate email service consume `read_committed` events and send each email with the order ID as an **idempotency key**: either the email provider deduplicates on it, or the service records sent IDs in its own database in the same transaction as marking the email sent. Remaining duplicates then require a crash between the provider accepting the email and the service recording it, which providers with idempotency keys also absorb.

### Q3.3 A forward-compatibility checker

```python run Old readers reading data written with the new schema
def forward_compatible(old, new):
    """Can a reader using `old` read data written with `new`?"""
    problems = []
    for name, spec in old.items():
        if name not in new and 'default' not in spec:
            problems.append(f'old reader needs "{name}", new data lacks it, no default')
        elif name in new and new[name]['type'] != spec['type']:
            problems.append(f'"{name}" retyped {spec["type"]} -> {new[name]["type"]}')
    return problems or ['compatible']

v1 = {'meter_id': {'type': 'string'}, 'kwh': {'type': 'double'}, 'ts': {'type': 'long'}}
candidates = {
    'add optional "tariff" with default': {**v1, 'tariff': {'type': 'string',
            'default': 'standard'}},
    'add required "region"': {**v1, 'region': {'type': 'string'}},
    'change kwh to string': {**v1, 'kwh': {'type': 'string'}},
    'remove "ts"': {k: v for k, v in v1.items() if k != 'ts'},
}
for name, schema in candidates.items():
    print(f'{name:36} -> {"; ".join(forward_compatible(v1, schema))}')
```

Forward compatibility flips the guide's result for two of the changes. Adding any field, even a required one, is forward compatible: old readers simply ignore it. Removing `ts` is **not**: an old reader still expects it, and the old schema gives no default. So the safe rule is to remove only fields that have defaults, and to add new fields with defaults so that both directions hold (full compatibility).

### Q3.4 A consumer that missed a delete

```python run Tombstones expire before a slow consumer sees them
log = [(0, 'MTR-1', 'standard'), (1, 'MTR-2', 'night'), (2, 'MTR-2', None), (3, 'MTR-3',
        'solar')]

def compacted(records, tombstones_expired):
    latest = {}
    for o, k, v in records:
        latest[k] = (o, k, v)
    return [r for r in sorted(latest.values()) if not (tombstones_expired and r[2] is None)]

online = {}
for _, k, v in log:                                       # read everything as it arrived
    online.pop(k, None) if v is None else online.__setitem__(k, v)
slow = {'MTR-1': 'standard', 'MTR-2': 'night'}   # state before going offline (offset 2)
for o, k, v in compacted(log, tombstones_expired=True):
    if o >= 2:   # resumes from its committed offset
        slow.pop(k, None) if v is None else slow.__setitem__(k, v)
print('online consumer :', online)
print('slow consumer   :', slow)
print('  MTR-2 was deleted upstream but survives in the slow consumer')
```

While the slow consumer was away, compaction removed MTR-2's older value and, after `delete.retention.ms`, the tombstone too. The consumer resumes at offset 2, finds no record for MTR-2 at all, and keeps the stale value forever. Fixes: set `delete.retention.ms` longer than any consumer can be offline (default 24 hours), alert on lag approaching it, and when a consumer has been away too long, rebuild its state from the beginning of the topic instead of resuming.

### Q3.5 Retention sizing

20 MB/s × 259,200 s (3 days) = 5.18 TB of raw data; compressed 4:1, about 1.3 TB; × 3 replicas = **3.9 TB**; with 30% headroom, about **5 TB** across the cluster. Compression is applied by the producer and stored as is, so it reduces broker disk directly.

## Part 4 solutions

### Q4.1 Tumbling windows with grace

```python run One-minute windows per meter with a 20-second grace period
import random
from collections import Counter
rng = random.Random(52)
events = []
for i in range(1200):
    t = rng.uniform(0, 300)
    delay = rng.expovariate(1 / 3) + (rng.uniform(30, 90) if rng.random() < 0.04 else 0)
    # (arrival, event time, meter)
    events.append((t + delay, t, f'MTR-{rng.randrange(3)}'))
events.sort()
truth = Counter((m, int(t // 60)) for _, t, m in events)
counts, closed, dropped, stream_time = Counter(), set(), 0, 0.0
grace = 20
for arrival, t, m in events:
    stream_time = max(stream_time, t)                           # highest event time seen
    w = int(t // 60)
    if (w + 1) * 60 + grace <= stream_time:   # window end + grace already passed
        dropped += 1
        continue
    counts[(m, w)] += 1
errors = sum(abs(counts[k] - truth[k]) for k in truth)
print(f'windows: {len(truth)}, late records dropped: {dropped} of {len(events)}')
print(f'total count error across all windows: {errors} (equals the dropped records)')
print('MTR-0 counts per minute:', [counts[("MTR-0", w)] for w in range(5)],
      'true:', [truth[("MTR-0", w)] for w in range(5)])
```

Records that arrive within 20 seconds of their window's end are still counted; only those arriving later are dropped: 24 records (2%), about half of the 4% that were deliberately delayed by 30–90 seconds (a delayed record that happened early in its window can still make the grace period). Every count error comes from them. Kafka Streams expresses this as `TimeWindows.ofSizeAndGrace(Duration.ofMinutes(1), Duration.ofSeconds(20))`; the window result can be emitted early and updated (the default) or emitted once when the window closes (`suppress`).

### Q4.2 A stream-stream join

```python run Orders joined to payments within 30 minutes
import random
rng = random.Random(53)
orders = [(f'O{i}', rng.uniform(0, 600)) for i in range(40)]           # (order id, minute)
payments = []
for oid, t in orders:
    r = rng.random()
    if r < 0.75:
        payments.append((oid, t + rng.uniform(0, 25)))                 # paid in time
    elif r < 0.85:
        payments.append((oid, t + rng.uniform(35, 90)))                # paid too late
payments.append(('O999', 100.0))   # payment for an unknown order
window = 30
order_time = dict(orders)
matched = {p for p, tp in payments if p in order_time and 0 <= tp - order_time[p] <= window}
late = {p for p, tp in payments if p in order_time and tp - order_time[p] > window}
orphans = [p for p, _ in payments if p not in order_time]
print(f'orders {len(orders)}: matched within {window} min {len(matched)}, '
      f'paid too late {len(late)}, unpaid {len(orders) - len(matched) - len(late)}')
print(f'payments with no matching order: {orphans}')
```

A stream-stream join must keep both sides in state for the window (and the grace period), so state grows with traffic × window length. Unmatched orders after the window are often the most useful output: an "order not paid within 30 minutes" event can trigger a reminder or release reserved stock (a left join with a window). Late payments and orphan payments go to a reconciliation process rather than being silently dropped.

### Q4.3 Partitions for a busy topic

Partitions = max(300 / 10, 300 / 6) × 1.5 = 50 × 1.5 = **75** (consumption is the limit). With replication factor 3 there are 225 partition replicas; at 150 per broker that is 2 brokers' worth, but replication factor 3 needs at least 3 brokers in different racks or zones, so **3 brokers** minimum, and 4 to keep full replication while one is down for maintenance.

### Q4.4 Retries for payment events

Retry topics cannot be used blindly, because a retried `payment-42: CAPTURED` would be processed after a later `payment-42: REFUNDED`. Options that keep per-payment order:

| Approach | How | Trade-off |
|---|---|---|
| Retry in place with back-off | Keep retrying the failing record; `pause()` the partition while waiting, keep polling to stay in the group | Blocks every payment on that partition during a bank outage |
| Park the key | Move the failing record **and every later record with the same key** to a parking topic (track parked keys in a store); process other keys normally | Order preserved per payment; more complex; parked keys need replay in order |
| Circuit breaker | When the bank API is down for everyone, pause consumption entirely and alert; resume when healthy | Simple for systemic outages; no point retrying record by record |
| Dead letter after N attempts | Poison (non-transient) failures go to a DLQ with the parked key, plus an alert | Requires a manual or automated repair path |

A good design combines them: a circuit breaker for systemic outages, key parking for record-specific transient errors, and a DLQ for permanent ones, all with idempotent calls to the bank (an idempotency key per payment event).

### Q4.5 An event-driven order platform

| Topic | Key | Partitions | Notes |
|---|---|---|---|
| `orders` | order ID | 48 | Published by the order service through an outbox; schema-registered |
| `payments` | order ID | 48 | Co-partitioned with `orders` for joins |
| `inventory-reservations` | SKU | 96 | Per-SKU ordering avoids double-reserving stock |
| `shipments` | order ID | 24 | |
| `notifications` | customer ID | 24 | Consumed by the email/SMS service with idempotency keys |
| `order-state` (compacted) | order ID | 48 | Latest state per order, built by a stream processor; read by APIs and analytics |

Guarantees: RF 3, `acks=all`, `min.insync.replicas=2`, idempotent producers; services write state and events together through the **outbox pattern**; stream processors use `exactly_once_v2`; external effects (charging cards, sending emails) use idempotency keys.

**Payment service crashes mid-transaction.** It had consumed `OrderPlaced`, called the payment provider with the order ID as idempotency key, and was writing `PaymentCaptured` through its outbox. If it crashed before committing the database transaction, neither the payment record nor the outbox row exists; on restart it re-consumes `OrderPlaced` (offset not committed), calls the provider again, and the provider returns the **original** result for the same idempotency key, so the card is charged once. If it crashed after committing, the outbox row is published by the CDC connector; the replayed `OrderPlaced` finds the payment already recorded and does nothing. Downstream, inventory and shipping react to `PaymentCaptured`; if payment fails, a `PaymentFailed` event triggers compensations (release stock, cancel order): a choreographed saga.
