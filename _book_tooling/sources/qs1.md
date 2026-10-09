# Solutions
%Every simulation executed; partition assignments use Kafka's own murmur2 function

## Part 1 solutions

### Q1.1 Queue or log?

| Case | Choice | Why |
|---|---|---|
| (a) Image resizing, one worker per image | Queue (or Kafka with a consumer group) | Pure work distribution; nobody needs the job after it is done; per-message acknowledgement and retries are convenient |
| (b) Order events for billing, analytics, fraud | Kafka topic | Three independent consumer groups read the same stream at their own pace |
| (c) Tasks scheduled for a future time | Queue with delayed delivery, or a scheduler | Kafka has no per-message delay; implementing it needs extra topics or a scheduler service |
| (d) A new service must replay from the start | Kafka (long retention or compaction) | Logs keep history; queues delete acknowledged messages |

### Q1.2 How even is murmur2?

```python run 10,000 keys over 30 partitions
from collections import Counter
from kafka_partitioner import partition_for
counts = Counter(partition_for(f'MTR-{i:05d}', 30) for i in range(10_000))
loads = [counts[p] for p in range(30)]
ideal = 10_000 / 30
print(f'ideal {ideal:.0f} per partition; busiest {max(loads)} '
        f'({max(loads) / ideal - 1:+.1%}), '
      f'quietest {min(loads)} ({min(loads) / ideal - 1:+.1%})')
```

The extremes are about 15% above and below the ideal, which is exactly the scatter random assignment produces: each partition's count has a standard deviation of about √333 ≈ 18 keys (5%), and the busiest and quietest of 30 partitions sit around 2.5 standard deviations out. murmur2 behaves like a good random hash; with more keys per partition the relative scatter shrinks. Uneven **load** almost always comes from uneven traffic per key (a few very busy keys), not from the hash.

### Q1.3 Growing a topic

```python run Keys that move from 8 partitions
from kafka_partitioner import partition_for
keys = [f'MTR-{i:05d}' for i in range(20_000)]
for new in [12, 16]:
    moved = sum(partition_for(k, 8) != partition_for(k, new) for k in keys)
    print(f'8 -> {new}: {moved / len(keys):.1%} of keys move')
```

When the count doubles, a key's new partition is either its old one or old + 8, depending on one more bit of the hash, so half of the keys stay. Going from 8 to 12 makes the two moduli disagree for most hash values, so about two thirds of keys move. Either way, every moved key may have records in two partitions around the change, so ordering per key is broken unless producers pause and consumers drain first.

### Q1.4 Durability budgets

| Question | RF 3, min.insync 2 | RF 3, min.insync 3 |
|---|---|---|
| Broker failures while still accepting `acks=all` writes | 1 (two replicas remain in the ISR) | 0 (any failure stops writes) |
| Failures without losing an acknowledged record | 1 guaranteed: every acknowledged record is on at least 2 replicas, so any single failure leaves a copy; a second failure can lose records if the surviving replica was the one that lacked them | 2: every acknowledged record is on all 3 replicas |
| Cost | Standard choice | Stronger durability for no failure tolerance on writes: usually a poor trade |

The common production setting, RF 3 with `min.insync.replicas=2`, tolerates one broker down for maintenance or failure with full write availability and no acknowledged data loss.

### Q1.5 A risky producer configuration

| Setting | Problem | Fix |
|---|---|---|
| `acks=1` | Acknowledged payments are lost if the leader dies before followers copy them | `acks=all` with topic `min.insync.replicas=2` |
| `retries=10` without idempotence | A lost acknowledgement causes a duplicate payment event | `enable.idempotence=true` |
| `max.in.flight=5` without idempotence | A failed batch retried after a later batch reorders events for the same payment | Idempotence keeps order with up to 5 in flight |
| `send()` without a callback or `get()` | When retries are exhausted, the failure is invisible: events silently vanish | Handle the callback: log, alert, and fail the request or store it for re-sending |
| (missing) `delivery.timeout.ms` thought | Default 2 minutes may be shorter than a broker failover in a bad case | Set it to cover realistic outages |

Corrected: `acks=all`, `enable.idempotence=true` (default since 3.0), default `retries` and `max.in.flight.requests.per.connection=5`, `delivery.timeout.ms=300000`, a callback that surfaces failures, and on the topic `replication.factor=3`, `min.insync.replicas=2`, `unclean.leader.election.enable=false`. Better still, publish payment events through the **outbox pattern**, so the event and the database change can never disagree.

## Part 2 solutions

### Q2.1 How long to linger?

Capacity in records per millisecond is b / (2 + 0.004 b) for a batch of b records. For 100 records per millisecond: b ≥ 200 + 0.4 b, so b ≥ 334 records. At 50 records arriving per millisecond, filling 334 records takes about **6.7 ms** of lingering.

```python run Checking Q2.1
for linger in [5, 6, 6.7, 7, 10]:
    b = 50 * linger
    capacity = b / (2 + 0.004 * b) * 1000
    print(f'linger.ms={linger:4}: batch {b:5.0f}, capacity {capacity:9,.0f} rec/s')
```

In practice `linger.ms` is an integer, so 7 ms; batches also fill early under load because `batch.size` triggers sending as soon as a batch is full, so lingering costs little at high traffic.

### Q2.2 A broker's sequence check

```python run Sequence numbers arriving at the broker
arrivals = [0, 1, 1, 3, 2, 3, 4]
last_written = -1
for seq in arrivals:
    if seq == last_written + 1:
        last_written = seq
        print(f'seq {seq}: written')
    elif seq <= last_written:
        print(f'seq {seq}: duplicate, acknowledged without writing')
    else:
        print(f'seq {seq}: out of order (expected {last_written + 1}), rejected; producer '
                f'will retry')
```

The second copy of batch 1 is a retry whose acknowledgement had been lost: acknowledged again, not written again. Batch 3 arrives before batch 2 (they were in flight together and batch 2 was retried), so it is rejected until batch 2 is written; its retry then succeeds. The log ends up with 0, 1, 2, 3, 4, each exactly once and in order. (Real brokers remember the last five batches per producer to answer duplicates precisely.)

### Q2.3 Range versus round-robin assignment

```python run Assignments for 3 consumers, 2 topics of 5 partitions
consumers = ['c1', 'c2', 'c3']
topics = {'orders': 5, 'payments': 5}

def range_assign():
    out = {c: [] for c in consumers}
    for t, n in topics.items():
        per, extra = divmod(n, len(consumers))
        start = 0
        for i, c in enumerate(consumers):
            count = per + (1 if i < extra else 0)
            out[c] += [f'{t}-{p}' for p in range(start, start + count)]
            start += count
    return out

def round_robin():
    out = {c: [] for c in consumers}
    all_parts = [f'{t}-{p}' for t, n in topics.items() for p in range(n)]
    for i, tp in enumerate(all_parts):
        out[consumers[i % len(consumers)]].append(tp)
    return out

for name, fn in [('range', range_assign), ('round-robin', round_robin)]:
    a = fn()
    print(f'{name:11}: ' + ', '.join(f'{c} {len(v)}' for c, v in a.items()))
    print(f'{"":13}c1 gets {a["c1"]}')
```

Range assignment splits each topic separately, always giving the remainder partitions to the first consumers, so with several topics c1 and c2 accumulate the extras and c3 gets half as much work. Round-robin over all partitions balances 4/3/3. (Range has one advantage: partition *k* of every topic goes to the same consumer, which helps when topics are joined by key.)

### Q2.4 The group that never stops rebalancing

Each poll returns up to 500 records (`max.poll.records` default), taking about 500 seconds to process, longer than `max.poll.interval.ms` (300 seconds). The group coordinator decides the consumer has died and rebalances; the records it was processing are given to another consumer and processed again (duplicates), and the cycle repeats.

| Fix | How |
|---|---|
| Fewer records per poll | `max.poll.records=100` keeps each loop near 100 seconds |
| Allow more time | Raise `max.poll.interval.ms`, accepting slower failure detection |
| Do the slow work elsewhere | Hand records to a worker pool and keep polling (pause partitions when the pool is full); commit offsets only for completed records |
| Make calls cheaper | Batch or parallelise the API calls; use async I/O |
| Make processing idempotent | Duplicates after any rebalance become harmless |

### Q2.5 Catching up

Net drain = 2,000 − 1,500 = 500 records per second, so 3.6 million records take 7,200 seconds = **2 hours**. To catch up in 30 minutes, the net drain must be 3.6 M / 1,800 s = 2,000 records per second, so consumption must reach 3,500 per second: **2 extra consumers** (rounding 1.5 up). That works only if the topic has enough partitions (each consumer needs at least one with backlog) and the downstream system can absorb the extra load; consumers beyond the partition count sit idle.
