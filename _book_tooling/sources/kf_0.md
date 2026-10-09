# How to use this guide
%Why Kafka sits at the centre of so many systems, what this book covers, and how its simulations work

Apache Kafka is a distributed, replicated **log**: producers append events, and any number of consumers read them, each at its own pace, as often as they like. It connects microservices, feeds data platforms, powers stream processing and replaces many traditional message queues. Interviews probe it in depth: "How does Kafka guarantee ordering?", "What happens when a consumer joins a group?", "How do you get exactly-once processing?", "What is the high watermark?", "How many partitions should a topic have?".

This guide builds on the **Distributed Systems** guide (replication, consensus, the ISR and high watermark in brief), the **Advanced Back-end** guide (message queues, retries, dead letters, the outbox pattern) and the **Data Engineering** guide (streaming ETL, watermarks, CDC). Here Kafka itself is taken apart.

## How the examples were run

There is no Kafka cluster in this environment, so every mechanism is reproduced in a short Python simulation that runs here and prints real output: the partitioned log, Kafka's actual **murmur2** key-partitioning function, replication with followers falling out of the in-sync set, producer batching and idempotence, consumer groups and rebalancing, offset commits, transactions, log compaction and stream-table joins. Configuration names (`acks`, `enable.idempotence`, `isolation.level` and so on) are the real ones, and Java client code is shown as text.

> TIP: To try the real thing, run a single-node Kafka in KRaft mode with Docker (`apache/kafka` image) and use the `kafka-topics`, `kafka-console-producer` and `kafka-console-consumer` scripts. Every behaviour simulated here can be observed on it.

## Map of the guide

| Chapter | Topic | Typical interview question |
|---|---|---|
| 1 | The log | "Kafka or a traditional queue such as RabbitMQ?" |
| 2 | Topics, partitions and keys | "How does Kafka guarantee ordering?" |
| 3 | Replication and durability | "Can Kafka lose an acknowledged message?" |
| 4 | Producers | "How do you make producers fast and safe?" |
| 5 | Consumers and consumer groups | "What happens during a rebalance?" |
| 6 | Delivery semantics and transactions | "How do you get exactly-once processing?" |
| 7 | Schemas, retention and compaction | "How do you evolve an event schema safely?" |
| 8 | Stream processing | "KStream versus KTable?" |
| 9 | Operating Kafka and patterns | "How many partitions? How do you handle poison messages?" |
| 10 | Question bank and cheat sheet | Revision |

# Chapter 1: The Log
%Queues versus logs, retention and replay, brokers, segments and offsets, and why the log changes system design

## 1.1 Queue versus log

A traditional **message queue** delivers each message to one consumer and deletes it once acknowledged. A **log** keeps messages in order for a retention period; consumers track their own position (the **offset**) and can re-read at will.

| | Message queue (RabbitMQ, SQS) | Log (Kafka, Pulsar, Kinesis) |
|---|---|---|
| After consumption | Message removed | Message kept until retention expires |
| Multiple consumers | Compete for messages (or need a copy per queue) | Each consumer group reads the whole stream independently |
| Replay | Not possible once acknowledged | Rewind the offset and re-read |
| Ordering | Per queue, weakened by redelivery and competing consumers | Strict within a partition |
| Per-message routing, priorities, delays | Rich | Minimal |
| Throughput | High | Very high: sequential disk writes, batching, zero-copy reads |

The log's replayability is what makes it a backbone: a new service can read history to build its own view, a bug fix can reprocess last week's events, and the same stream feeds operational services, the data lake and stream processors.

## 1.2 A log in a few lines

```python run Append, read by offset, and independent consumers
class Log:
    def __init__(self):
        self.records = []
    def append(self, key, value):
        self.records.append((key, value))
        return len(self.records) - 1                         # the new record's offset
    def read(self, offset, max_records=10):
        return list(enumerate(self.records))[offset:offset + max_records]

log = Log()
for i, reading in enumerate([4.2, 3.9, 5.1, 6.0, 2.2]):
    log.append(f'MTR-{i % 2}', reading)
positions = {'billing': 0, 'analytics': 0}
for name, batch in [('billing', 3), ('analytics', 5), ('billing', 3)]:
    got = log.read(positions[name], batch)
    positions[name] += len(got)
    print(f'{name:9} read offsets {[o for o, _ in got]}, now at offset {positions[name]}')
positions['analytics'] = 0                                    # replay from the beginning
print('analytics rewinds and re-reads:', [o for o, _ in log.read(positions['analytics'],
        5)])
```

Consumers do not remove anything; each simply remembers how far it has read. Billing and analytics progress independently, and analytics can replay history without affecting anyone else.

## 1.3 Brokers, segments and retention

| Concept | Meaning |
|---|---|
| Broker | A Kafka server storing partitions and serving clients |
| Topic | A named stream of records, split into partitions |
| Partition | An ordered, append-only log, stored on one leader broker and replicated to followers |
| Offset | A record's position in its partition; strictly increasing |
| Segment | A partition is stored as segment files (for example 1 GB each); old segments are deleted or compacted as a whole |
| Retention | Time-based (`retention.ms`, default 7 days) or size-based (`retention.bytes`), or compaction (Chapter 7) |
| Controller (KRaft) | A Raft quorum of controller nodes holds cluster metadata (topics, partitions, leaders); ZooKeeper is no longer used since Kafka 4.0 |

Kafka is fast for structural reasons: appends are sequential disk writes, the operating system's page cache serves recent reads, records are batched and compressed end to end, and brokers send file data to the network without copying it through user space (zero-copy).

## 1.4 Practical lessons

- A log keeps events for a retention period; consumers track offsets and can replay.
- Queues suit per-message work distribution; logs suit event streams with many independent readers.
- Topics are split into partitions, stored as segments, and expired by time, size or compaction.
- Kafka's speed comes from sequential I/O, batching, compression, the page cache and zero-copy.

# Chapter 2: Topics, Partitions and Keys
%How keys map to partitions, ordering guarantees, choosing keys, hot partitions, and what adding partitions breaks

## 2.1 Keys decide partitions, partitions decide order

A topic's partitions are the unit of parallelism and of ordering: **records with the same key go to the same partition**, and Kafka guarantees order **only within a partition**. The default partitioner hashes the key bytes with **murmur2** and takes the result modulo the number of partitions. The program implements Kafka's exact function (checked against the test vectors in Kafka's own `UtilsTest`), so its assignments match a real Java producer.

```python run Kafka's murmur2 partitioner
def murmur2(data: bytes) -> int:
    """Port of org.apache.kafka.common.utils.Utils.murmur2 (32-bit, seed 0x9747b28c)."""
    length, seed, m, r = len(data), 0x9747B28C, 0x5BD1E995, 24
    h = (seed ^ length) & 0xFFFFFFFF
    for i in range(0, length - length % 4, 4):
        k = int.from_bytes(data[i:i + 4], 'little')
        k = (k * m) & 0xFFFFFFFF
        k ^= k >> r
        k = (k * m) & 0xFFFFFFFF
        h = (h * m) & 0xFFFFFFFF
        h ^= k
    tail = length % 4
    if tail:
        base = length - tail
        if tail == 3:
            h ^= data[base + 2] << 16
        if tail >= 2:
            h ^= data[base + 1] << 8
        h ^= data[base]
        h = (h * m) & 0xFFFFFFFF
    h ^= h >> 13
    h = (h * m) & 0xFFFFFFFF
    h ^= h >> 15
    return h

def partition_for(key: str, partitions: int) -> int:
    return (murmur2(key.encode()) & 0x7FFFFFFF) % partitions   # Utils.toPositive(...) % n

for key in ['MTR-00001', 'MTR-00002', 'MTR-00003', 'MTR-00001']:
    print(f'{key} -> partition {partition_for(key, 6)} of 6')
open('kafka_partitioner.py', 'w').write(
    "".join(line + "\n" for line in __import__('inspect').getsource(murmur2).splitlines())
            + "\n" +
    "".join(line + "\n"
            for line in __import__('inspect').getsource(partition_for).splitlines()))
```

The same key always lands on the same partition, so all readings from one meter stay in order. (The program also saves the function to a module so later examples can import it.) Records without a key are spread across partitions; since Kafka 2.4 the **sticky** partitioner fills a batch for one partition before moving on, which improves batching compared with strict round-robin.

## 2.2 Choosing a key

| Goal | Key | Effect |
|---|---|---|
| Order per entity | Entity ID (meter, account, order) | All events of one entity in order; parallelism across entities |
| Global order | None possible beyond one partition | One partition caps throughput at one consumer's speed |
| Co-partitioning for joins | The same key and partition count on both topics | Stream processors can join locally |
| Spread load evenly | High-cardinality key with no dominant values | Balanced partitions |

> TRAP: A key with a few dominant values (a country code, a "default" customer, `null` mapped to a constant) creates **hot partitions**: one partition receives most of the traffic, and the consumer assigned to it falls behind while the others idle.

```python run A skewed key creates a hot partition
import random
from collections import Counter
from kafka_partitioner import partition_for
rng = random.Random(3)
events = ['IN' if rng.random() < 0.7 else rng.choice(['US', 'UK', 'DE', 'FR', 'JP', 'BR'])
        for _ in range(100_000)]
by_country = Counter(partition_for(k, 12) for k in events)
by_meter = Counter(partition_for(f'MTR-{rng.randrange(50_000):05d}', 12)
        for _ in range(100_000))
for name, c in [('keyed by country', by_country), ('keyed by meter id', by_meter)]:
    loads = [c.get(p, 0) for p in range(12)]
    print(f'{name:18} busiest partition {max(loads) / sum(loads):5.1%} of traffic, '
          f'idle partitions {sum(1 for x in loads if x == 0)}')
```

With seven distinct country keys, at most seven of twelve partitions could ever receive data; here two keys even hash to the same partitions as others, so only five are used, and one carries 70% of all events. A high-cardinality key spreads traffic almost perfectly. If one entity is genuinely enormous, split its key (`customer-42#3`) and accept ordering per sub-key, or process it separately.

## 2.3 Adding partitions moves keys

Partition counts can be increased but not decreased, and increasing them changes `hash % n` for most keys. New records for an existing key may go to a different partition than its older records, so a consumer can see that key's events out of order across the change, and any state kept per partition is now split.

```python run Share of keys that move when a topic grows
from kafka_partitioner import partition_for
keys = [f'MTR-{i:05d}' for i in range(20_000)]
for old, new in [(6, 7), (6, 12), (12, 24)]:
    moved = sum(partition_for(k, old) != partition_for(k, new) for k in keys)
    print(f'{old:2} -> {new:2} partitions: {moved / len(keys):5.1%} of keys change '
            f'partition')
```

Even doubling the count moves half of the keys. Plan partition counts ahead for the throughput you expect in a year or two (Chapter 9), or create a new topic and migrate deliberately.

## 2.4 Practical lessons

- Same key, same partition; order is guaranteed only within a partition.
- Key by the entity whose events must stay ordered; avoid low-cardinality or skewed keys.
- Partitions are the unit of parallelism: a group cannot have more active consumers than partitions.
- Adding partitions remaps most keys; size topics ahead of growth.
