# Hints
%Read only the hint for the exercise you are stuck on

## Part 1 hints

| Exercise | Hint |
|---|---|
| Q1.1 | Who needs the data after it is consumed? Does anyone need to re-read it? |
| Q1.2 | Count assignments per partition; the ideal is 10,000 / 30 |
| Q1.3 | A key stays put when h mod 8 equals h mod n |
| Q1.4 | Writes need min.insync.replicas members in the ISR; acknowledged data lives on all of them |
| Q1.5 | Consider durability, duplicates, ordering and silent failures separately |

## Part 2 hints

| Exercise | Hint |
|---|---|
| Q2.1 | Capacity = batch / (2 + 0.004 × batch) records per millisecond; batch = 50 × linger |
| Q2.2 | The broker keeps the last sequence written per producer and partition |
| Q2.3 | Range assigns contiguous blocks per topic, starting from the first consumer each time |
| Q2.4 | Time between polls versus `max.poll.interval.ms` (300 s) |
| Q2.5 | Net drain rate = consumption − production |

## Part 3 hints

| Exercise | Hint |
|---|---|
| Q3.1 | Insert the event ID into a unique table in the same transaction as the payment |
| Q3.2 | Transactions cover Kafka writes and offsets only |
| Q3.3 | An old reader ignores unknown fields but needs a default for every field it expects |
| Q3.4 | The tombstone itself is removed after `delete.retention.ms` |
| Q3.5 | Bytes = rate × seconds × replication / compression, then add headroom |

## Part 4 hints

| Exercise | Hint |
|---|---|
| Q4.1 | A window closes when stream time passes its end plus the grace period |
| Q4.2 | Keep orders in state for 30 minutes; match payments against it |
| Q4.3 | max(300/10, 300/6) × 1.5; partition replicas = partitions × 3 |
| Q4.4 | Retry in place with back-off and pause the partition, or park the key |
| Q4.5 | Key every topic by the entity whose order matters; use the outbox pattern |
