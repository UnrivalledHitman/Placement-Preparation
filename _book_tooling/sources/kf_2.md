# Chapter 5: Consumers and Consumer Groups
%Group membership, partition assignment strategies, rebalancing, offset commits and lag

## 5.1 Consumer groups

Consumers that share a `group.id` form a **consumer group** and divide the topic's partitions among themselves: each partition is read by **exactly one** member of the group at a time, so the group processes the topic in parallel while each partition's order is preserved. Different groups read the same topic independently. A group can have at most as many active members as there are partitions; extra members sit idle as hot standbys.

```text
Properties p = new Properties();
p.put("bootstrap.servers", "broker1:9092");
p.put("group.id", "billing-service");
p.put("enable.auto.commit", "false");               // commit after processing (Section 5.3)
p.put("isolation.level", "read_committed");         // skip records of aborted transactions
p.put("partition.assignment.strategy", CooperativeStickyAssignor.class.getName());
try (KafkaConsumer<String, Reading> consumer = new KafkaConsumer<>(p)) {
    consumer.subscribe(List.of("meter-readings"));
    while (running) {
        ConsumerRecords<String, Reading> records = consumer.poll(Duration.ofMillis(500));
        for (ConsumerRecord<String, Reading> r : records) process(r);
        consumer.commitSync();                       // offsets of everything returned by poll
    }
}
```

## 5.2 Assignment and rebalancing

When members join or leave (deployments, crashes, scaling), the group **rebalances**: partitions are reassigned. With the classic **eager** protocol, every member gives up all its partitions and the whole group stops until the new assignment is in place. The **cooperative sticky** assignor (and the new consumer group protocol of KIP-848, generally available in Kafka 4.0) moves only the partitions that must move, and members keep processing the rest.

```python run Partitions moved when one of four consumers leaves
def round_robin(partitions, members):
    return {p: members[i % len(members)] for i, p in enumerate(partitions)}

def sticky(old, members):
    keep = {p: m for p, m in old.items() if m in members}
    load = {m: sum(1 for v in keep.values() if v == m) for m in members}
    for p in sorted(set(old) - set(keep)):                    # orphaned partitions only
        target = min(members, key=lambda m: (load[m], m))
        keep[p] = target; load[target] += 1
    return keep

partitions = [f'readings-{i}' for i in range(12)]
members = ['c1', 'c2', 'c3', 'c4']
before = round_robin(partitions, members)
remaining = ['c1', 'c2', 'c4']                               # c3 is redeployed
eager = round_robin(partitions, remaining)                   # recompute from scratch
coop = sticky(before, remaining)
moved = lambda after: sum(before[p] != after[p] for p in partitions)
print('before:', {m: sum(1 for v in before.values() if v == m) for m in members})
print(f'eager round-robin: {moved(eager):2} of 12 partitions change owner; all 12 paused '
        f'during the rebalance')
print(f'cooperative sticky: {moved(coop):2} of 12 partitions change owner; only those pause')
print('after (sticky):', {m: sum(1 for v in coop.values() if v == m) for m in remaining})
```

Recomputing a round-robin assignment from scratch moves most partitions even though only one member left; the sticky assignment moves only the three partitions that belonged to the departed consumer. Rebalances also happen when a consumer takes longer than `max.poll.interval.ms` (default 5 minutes) between polls, because the group assumes it has died: slow processing inside the poll loop is a classic cause of endless rebalancing. **Static membership** (`group.instance.id`) lets a restarting consumer rejoin with its old partitions without triggering a rebalance, which makes rolling deployments much calmer.

## 5.3 Offsets and commit order

A consumer group stores its progress as **committed offsets** in the internal `__consumer_offsets` topic: for each partition, the offset of the next record to read. After a crash or rebalance, the new owner resumes from the committed offset. **When** you commit relative to processing decides what a crash does:

```python run Commit before versus after processing, with crashes
import random

def consume(commit_first, rng, n=10_000, batch=50, crash_p=0.02):
    committed, processed = 0, []
    while committed < n:
        records = list(range(committed, min(committed + batch, n)))
        if commit_first:
            committed = records[-1] + 1                        # commit, then process
        for r in records:
            if rng.random() < crash_p / batch:   # crash part-way through the batch
                break
            processed.append(r)
        else:
            if not commit_first:
                committed = records[-1] + 1                    # process, then commit
    return processed

rng = random.Random(21)
for commit_first, name in [(True, 'commit, then process'), (False, 'process, then commit')]:
    out = consume(commit_first, rng)
    lost = 10_000 - len(set(out)); dup = len(out) - len(set(out))
    print(f'{name:21}: records lost {lost:3}, records processed twice {dup:4}')
```

Committing first gives **at-most-once** processing: a crash after the commit skips the rest of the batch forever. Committing after processing gives **at-least-once**: a crash replays the uncommitted part of the batch, so some records are processed twice. At-least-once with idempotent processing is the usual choice; `enable.auto.commit=true` commits on a timer during `poll()` and can produce either behaviour depending on timing, which is why critical consumers commit explicitly.

## 5.4 Lag

**Consumer lag** is the difference between a partition's latest offset and the group's committed offset: how far behind the consumers are. It is the single most important consumer metric.

| Lag pattern | Meaning | Action |
|---|---|---|
| Flat near zero | Keeping up | None |
| Growing steadily | Consumers slower than producers | Scale out (up to the partition count), speed up processing, batch writes |
| Growing on one partition only | Hot partition or a stuck consumer | Check key skew (Chapter 2) or that consumer's logs |
| Saw-tooth with rebalances | Repeated rebalancing | Check `max.poll.interval.ms`, slow processing, static membership |

## 5.5 Practical lessons

- A partition belongs to one consumer per group; groups read independently; members beyond the partition count idle.
- Prefer cooperative sticky assignment and static membership to minimise rebalance disruption.
- Commit after processing for at-least-once; make processing idempotent; avoid auto-commit for critical work.
- Monitor lag per partition; keep work per poll well within `max.poll.interval.ms`.

# Chapter 6: Delivery Semantics and Transactions
%At-most-once, at-least-once and exactly-once, transactional read-process-write, fencing zombies, and idempotent side effects

## 6.1 Three guarantees

| Guarantee | Meaning | How |
|---|---|---|
| At most once | Each record has an effect zero or one times | Commit before processing; `acks=0` |
| At least once | One or more times | Commit after processing; producer retries |
| Exactly once (effectively once) | The **effect** happens once, even if delivery is retried | Idempotent producer plus transactions (inside Kafka), or idempotent consumers (outside Kafka) |

Exactly-once never means a message is delivered once over the network; it means duplicates are prevented from having a visible effect.

## 6.2 Transactions for read-process-write

A stream processor reads from an input topic, transforms records and writes to an output topic. If it crashes after writing outputs but before committing its input offsets, the replay writes the outputs again. **Kafka transactions** make the outputs **and** the consumer offsets commit atomically:

```text
producer.initTransactions();                   // registers transactional.id, fences zombies
while (running) {
    ConsumerRecords<String, Reading> in = consumer.poll(Duration.ofMillis(200));
    producer.beginTransaction();
    for (ConsumerRecord<String, Reading> r : in)
        producer.send(new ProducerRecord<>("daily-usage", r.key(), aggregate(r)));
    producer.sendOffsetsToTransaction(nextOffsets(in), consumer.groupMetadata());
    producer.commitTransaction();              // outputs and offsets: all or nothing
}
```

Downstream consumers set `isolation.level=read_committed` and never see records from aborted transactions.

```python run Crashes in a read-process-write loop, without and with transactions
import random

def pipeline(transactional, rng, n=5000, batch=20, crash_p=0.03):
    committed_in, output, visible = 0, [], []
    while committed_in < n:
        records = list(range(committed_in, min(committed_in + batch, n)))
        pending = []
        crashed = False
        for r in records:
            pending.append(r * 10)   # the transformed output record
            if not transactional:
                output.append(r * 10)                          # written immediately
            if rng.random() < crash_p / batch:
                crashed = True
                break
        if crashed:
            continue   # restart from committed offsets
        if transactional:
            visible.extend(pending)   # commit outputs + offsets atomically
        committed_in = records[-1] + 1                         # offsets committed
    out = visible if transactional else output
    return len(out) - len(set(out)), len(set(out))

rng = random.Random(31)
for tx in [False, True]:
    dup, distinct = pipeline(tx, rng)
    print(f'transactions={str(tx).lower():5}: distinct outputs {distinct}, duplicate '
            f'outputs {dup}')
```

Without transactions, every crash between writing outputs and committing offsets produces duplicate output records. With them, an interrupted transaction is aborted, its outputs stay invisible to `read_committed` consumers, and the restarted batch commits exactly once. Kafka Streams enables all of this with one setting (`processing.guarantee=exactly_once_v2`).

## 6.3 Zombie fencing

A processor that pauses for a long time (a GC pause, a network partition) may be declared dead and replaced, then wake up and keep writing: a **zombie**. Each `transactional.id` carries an **epoch** that increases whenever a new instance calls `initTransactions()`; the brokers reject writes from the older epoch, so the zombie's transaction fails instead of producing duplicates. This is the same idea as fencing tokens for distributed locks (HLD guide, §7.3).

## 6.4 Side effects outside Kafka

Transactions cover Kafka-to-Kafka pipelines. When processing calls a database, an email service or a payment API, exactly-once needs **idempotent consumers**:

| Technique | How |
|---|---|
| Upsert by business key | Write `ON CONFLICT (event_id) DO UPDATE` or MERGE: a replay overwrites itself |
| Processed-events table | Record each event ID in the same database transaction as the effect; skip IDs already present |
| Store offsets with the data | Commit the consumer offset in the same database transaction as the results; on start, seek to the stored offset |
| Idempotency keys for external APIs | Pass the event ID as the idempotency key (payments, emails) so the provider deduplicates |
| Outbox pattern (producing side) | Write the event to an outbox table in the same transaction as the state change; a CDC connector publishes it (Advanced Back-end guide) |

## 6.5 Practical lessons

- Exactly-once means duplicate deliveries have no duplicate effect.
- Use transactions with `sendOffsetsToTransaction` and `read_committed` for Kafka-to-Kafka processing.
- `transactional.id` epochs fence zombie instances.
- Outside Kafka, make consumers idempotent: upserts, processed-event tables, offsets stored with results.
