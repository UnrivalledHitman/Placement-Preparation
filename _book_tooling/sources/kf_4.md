# Chapter 9: Operating Kafka and Patterns
%Sizing partitions and storage, the metrics that matter, poison messages and retry topics, and event-driven patterns

## 9.1 How many partitions?

Partitions set the maximum parallelism of consumers and spread load across brokers, but each one costs memory, file handles, replication traffic and recovery time. A common sizing rule: partitions ≥ max(target throughput / producer throughput per partition, target throughput / consumer throughput per partition), with headroom for growth, because adding partitions later remaps keys (Chapter 2).

```python run Sizing partitions and disk for a topic
import math
target_mb_s = 120                     # peak write rate into the topic
per_partition_produce, per_partition_consume = 10, 6   # MB/s measured for one partition
growth = 2.0                          # plan for twice today's peak
partitions = math.ceil(growth * max(target_mb_s / per_partition_produce,
        target_mb_s / per_partition_consume))
print(f'partitions: {partitions} (consumer side is the limit at {per_partition_consume} '
        f'MB/s each)')
avg_mb_s, retention_days, replication = 45, 7, 3
disk_tb = avg_mb_s * 86_400 * retention_days * replication / 1e6
print(f'storage: {avg_mb_s} MB/s x {retention_days} d x RF {replication} = {disk_tb:.1f} TB')
print('  before compression savings; keep about 30% free-space headroom on top')
```

Measure per-partition throughput on your own hardware and message sizes; a few thousand partitions per broker is a practical upper range, and KRaft clusters handle far more partitions overall than the old ZooKeeper-based ones.

## 9.2 Metrics that matter

| Metric | Healthy | When it moves |
|---|---|---|
| Under-replicated partitions | 0 | A broker is down or a follower cannot keep up; durability is reduced |
| Offline partitions | 0 | No leader available: producers and consumers for those partitions are stuck |
| ISR shrink/expand rate | Near zero | Flapping followers: network, disk or GC problems |
| Consumer lag (per group and partition) | Flat | Consumers falling behind (Chapter 5) |
| Request latency (produce, fetch) p99 | Stable | Overloaded brokers, slow disks |
| Disk usage | Below ~70% | Retention or partition count needs attention |
| Active controller count | Exactly 1 | Metadata quorum problems |

## 9.3 Poison messages, retries and dead letters

A **poison message** is a record a consumer can never process (malformed, or triggering a bug). If the consumer retries forever, the whole partition stops behind it, because offsets are committed in order. The usual design sends failures aside:

```python run Retry topics and a dead-letter topic
import random
rng = random.Random(41)
records = [f'r{i}' for i in range(20)]
poison = {'r7', 'r15'}                                       # always fail
flaky = {r for r in records if rng.random() < 0.2} - poison  # fail once, then succeed
attempts, processed, dlq = {}, [], []
queues = {'main': list(records), 'retry-1m': [], 'retry-10m': []}
next_queue = {'main': 'retry-1m', 'retry-1m': 'retry-10m', 'retry-10m': 'dead-letter'}
for stage in ['main', 'retry-1m', 'retry-10m']:
    for r in queues[stage]:
        attempts[r] = attempts.get(r, 0) + 1
        ok = r not in poison and not (r in flaky and attempts[r] == 1)
        if ok:
            processed.append(r)
        elif next_queue[stage] == 'dead-letter':
            dlq.append(r)
        else:
            queues[next_queue[stage]].append(r)              # main topic keeps flowing
print(f'processed {len(processed)} of {len(records)}; transient failures recovered: '
        f'{sorted(flaky)}')
print(f'retry-1m held {len(queues["retry-1m"])}, retry-10m held '
        f'{len(queues["retry-10m"])}, '
      f'dead-letter topic: {dlq}')
```

Transient failures succeed on the first retry topic; the two poison records end in the **dead-letter topic** with their error details, for a person or a repair job to handle, while the main topic never stalled. Retry topics break per-key ordering (a retried record is processed after later records for the same key); when order matters, pause the partition and retry in place with back-off instead, or park all later records of that key too.

## 9.4 Event-driven patterns

| Pattern | Idea | Watch out for |
|---|---|---|
| Event notification | Services publish facts ("ReadingRecorded"); others react | Consumers needing more data call back the producer: hidden coupling |
| Event-carried state transfer | Events contain the data consumers need | Larger events; schema governance |
| Event sourcing | The log of events is the source of truth; state is derived | Replays, upcasting old event versions, snapshots |
| CQRS | Separate write model from read models built from events | Read models are eventually consistent |
| Outbox | Write the event in the same database transaction as the state change; CDC publishes it | Extra table and connector, but no dual-write inconsistency |
| Saga (choreography) | A business process as a chain of events with compensations | Hard to see the whole flow; add tracing (HLD guide, §8.4) |

> TRAP: Writing to the database and then publishing to Kafka in application code (a **dual write**) loses events or publishes phantom ones whenever one of the two fails. Use the outbox pattern or CDC.

## 9.5 Practical lessons

- Size partitions from measured per-partition throughput with growth headroom; size disks from rate × retention × replication.
- Alert on under-replicated and offline partitions, consumer lag and request latency.
- Route failures to retry and dead-letter topics so one poison message cannot stall a partition.
- Avoid dual writes; use the outbox pattern or CDC; choose event patterns deliberately.

# Chapter 10: Question Bank and Cheat Sheet
%Interview questions with the core of a good answer, and one-page reminders

## 10.1 Fundamentals

| Question | Core of a good answer |
|---|---|
| Kafka versus a traditional queue? | A retained, replayable log read by many independent consumer groups versus messages deleted on acknowledgement with competing consumers |
| How does Kafka guarantee ordering? | Only within a partition; records with the same key go to the same partition |
| How are keys mapped to partitions? | murmur2 hash of the key bytes, positive, modulo the partition count; no key: sticky batching across partitions |
| What happens when you add partitions? | Most keys move to a different partition; order per key breaks across the change; plan counts ahead |
| Why is Kafka fast? | Sequential appends, page cache, batching and compression, zero-copy transfer, partition parallelism |
| What is an offset? | A record's position in a partition; consumers commit the next offset to read |
| What does KRaft replace? | ZooKeeper; a Raft quorum of controllers stores cluster metadata (Kafka 4.0 is KRaft only) |

## 10.2 Durability and delivery

| Question | Core of a good answer |
|---|---|
| What is the ISR? | Replicas caught up within `replica.lag.time.max.ms`; `acks=all` waits for all of them |
| What is the high watermark? | Highest offset replicated to all ISR members; consumers read up to it |
| Can Kafka lose acknowledged data? | Yes with `acks=1`, or with `acks=all` when the ISR shrank to the leader and it then fails or an unclean election happens; prevent with RF 3, `acks=all`, `min.insync.replicas=2`, unclean election off |
| What does the idempotent producer do? | Producer ID plus per-partition sequence numbers; broker drops duplicates and rejects out-of-order batches |
| How do consumer groups work? | Each partition to one member; rebalances on membership changes; cooperative sticky moves only what must move |
| At-least-once versus at-most-once? | Commit after versus before processing |
| How do you get exactly-once? | Transactions: outputs and offsets committed atomically, `read_committed` consumers; idempotent consumers for external side effects |
| What is a zombie and how is it fenced? | A stalled instance that wakes up; `transactional.id` epochs make brokers reject its writes |

## 10.3 Data and processing

| Question | Core of a good answer |
|---|---|
| Why a schema registry? | Versioned schemas and enforced compatibility so producers cannot break consumers |
| Backward versus forward compatibility? | New readers read old data (add optional fields, upgrade consumers first) versus old readers read new data (upgrade producers first) |
| What is log compaction? | Keep at least the latest value per key; tombstones delete keys; offsets unchanged |
| KStream versus KTable? | Every record an event versus latest value per key |
| What is co-partitioning? | Same key and partition count on joined topics so joins are local |
| How is stream-processing state made fault tolerant? | Local stores backed by changelog topics (Kafka Streams) or checkpoints (Flink) |
| How do you handle poison messages? | Retry topics with back-off, then a dead-letter topic; mind per-key ordering |
| How many partitions? | Throughput ÷ per-partition throughput on the slower side, with growth headroom |

## 10.4 Cheat sheet

| Topic | Remember |
|---|---|
| Log | Retained, replayable; consumers track offsets; groups independent |
| Partitions | Unit of order and parallelism; murmur2(key) % n; adding partitions remaps keys |
| Replication | Leader + followers; ISR; high watermark; RF 3, `acks=all`, `min.insync=2`, no unclean election |
| Producer | Batching (`linger.ms`, `batch.size`), compression, idempotence on, handle send errors |
| Consumer | Groups, cooperative sticky, static membership, commit after processing, watch lag |
| Exactly-once | Idempotent producer + transactions + `read_committed`; idempotent external effects |
| Schemas | Registry; backward/forward/full; add optional fields with defaults |
| Retention | Time, size, compaction; tombstones; tiered storage |
| Streams | KStream/KTable; co-partition; state stores + changelogs; repartition topics |
| Operations | Under-replicated, offline, lag, latency; retry and dead-letter topics; outbox over dual writes |
