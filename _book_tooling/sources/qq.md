# How to use this practice book
%20 exercises matching the Kafka and Stream Processing guide, with hints kept separate and executed solutions

Each part matches chapters of the **Kafka and Stream Processing** guide. Code exercises are short Python simulations in the guide's style; several import the guide's murmur2 partitioner (`kafka_partitioner.py`, saved by the first partitioning example of Chapter 2), so run that example first. Design exercises are answered as in an interview: topics, keys, partition counts, guarantees, and what happens on failure.

| Type | What you do |
|---|---|
| Code | Write and run a simulation |
| Numerical | Calculate, then check |
| Concept | Explain the mechanism and the trade-off |
| Debug | Find the defect, show its consequence, fix it |
| Design | Plan topics and processing end to end |

**Marking scheme.** Mark ✓ (solved alone), ~ (with the hint) or ✗ (needed the solution). For Design and Debug, ✓ also requires stating the **failure case**: what happens when a broker, producer or consumer dies at the worst moment. Redo every ~ and ✗ a week later.

| Part | Guide chapters | Topic | Exercises |
|---|---|---|---|
| 1 | 1–3 | The log, partitions and replication | 5 |
| 2 | 4–5 | Producers and consumers | 5 |
| 3 | 6–7 | Delivery guarantees, schemas and compaction | 5 |
| 4 | 8–9 | Stream processing and operations | 5 |

# Exercises

## Part 1: The log, partitions and replication

**Q1.1 · Easy · Concept · Queue or log?** Choose a traditional queue or a Kafka topic, and say why, for: (a) resizing uploaded images, one worker per image; (b) order events consumed by billing, analytics and a fraud model; (c) tasks that must run at a scheduled time in the future; (d) a stream that a new service must be able to replay from the start.

**Q1.2 · Medium · Code · How even is murmur2?** Using Kafka's partitioner, assign 10,000 meter IDs to 30 partitions. Report the busiest and quietest partitions, and compare with the ideal.

**Q1.3 · Medium · Numerical · Growing a topic.** What share of keys move when a topic grows from 8 to 12 partitions, and from 8 to 16? Explain why doubling moves fewer keys than the 50% increase.

**Q1.4 · Medium · Concept · Durability budgets.** A topic has replication factor 3, `acks=all`, `min.insync.replicas=2` and unclean election disabled. How many broker failures can it survive while still accepting writes? While keeping every acknowledged record? What changes with `min.insync.replicas=3`?

**Q1.5 · Medium · Debug · A risky producer configuration.** A payment service uses `acks=1`, `retries=10`, `max.in.flight.requests.per.connection=5`, `enable.idempotence=false` and calls `send()` without a callback. List every problem and give a corrected configuration.

## Part 2: Producers and consumers

**Q2.1 · Medium · Numerical · How long to linger?** With the guide's model (2 ms fixed cost per request, 4 µs per record, 50 records arriving per millisecond), what is the smallest `linger.ms` that lets one connection carry 100,000 records per second?

**Q2.2 · Medium · Code · A broker's sequence check.** Simulate a broker receiving batches from an idempotent producer with sequence numbers 0, 1, 1, 3, 2, 3, 4 (a retry, a gap and a late retry). Show which batches it writes, which it acknowledges as duplicates and which it rejects.

**Q2.3 · Medium · Code · Range versus round-robin assignment.** A group of 3 consumers subscribes to two topics with 5 partitions each. Compute the assignments with the range and round-robin strategies, and explain the imbalance.

**Q2.4 · Medium · Debug · The group that never stops rebalancing.** A consumer polls up to 500 records and calls a slow API taking about 1 second per record. Logs show endless rebalances and duplicate processing. Explain and fix.

**Q2.5 · Easy · Numerical · Catching up.** A group has a lag of 3.6 million records. It consumes 2,000 records per second while producers add 1,500 per second. How long until it catches up? How many extra consumers (each adding 1,000 records per second) would cut that to 30 minutes, and what limits that?

## Part 3: Delivery guarantees, schemas and compaction

**Q3.1 · Medium · Code · Idempotent writes to a database.** An at-least-once consumer inserts payments into a database, and crashes cause replays. Simulate it with plain inserts and with a processed-event-ID check in the same transaction, and count duplicate payments.

**Q3.2 · Medium · Concept · Exactly-once emails?** A Kafka Streams application uses `exactly_once_v2` and also sends a confirmation email for each order. Can a customer receive two emails? Explain and design a fix.

**Q3.3 · Medium · Code · A forward-compatibility checker.** Write a checker for **forward** compatibility (old readers must read data written with the new schema) and test it on the guide's four candidate schema changes.

**Q3.4 · Medium · Code · A consumer that missed a delete.** On a compacted topic, a consumer is offline for longer than `delete.retention.ms`. Simulate what its local table looks like after it catches up, compared with a consumer that was online, and explain how to avoid the problem.

**Q3.5 · Easy · Numerical · Retention sizing.** A topic averages 20 MB/s, keeps 3 days, has replication factor 3, and compresses 4:1. How much disk does it need across the cluster, with 30% headroom?

## Part 4: Stream processing and operations

**Q4.1 · Medium · Code · Tumbling windows with grace.** Count readings per meter per 1-minute event-time window from an out-of-order stream, with a grace period of 20 seconds after each window ends. Report the counts and how many late records were dropped.

**Q4.2 · Medium · Code · A stream-stream join.** Join order events to payment events with the same order ID when the payment arrives within 30 minutes of the order. Report matched orders, unpaid orders and payments without a matching order in the window.

**Q4.3 · Easy · Numerical · Partitions for a busy topic.** A topic must take 300 MB/s at peak. One partition handles 10 MB/s of produce and 6 MB/s of consumption. With 50% growth headroom, how many partitions? How many brokers if each comfortably leads 150 partitions of this topic, with replication factor 3?

**Q4.4 · Medium · Design · Retries for payment events.** Payment status events for each payment must be processed in order, and a downstream bank API sometimes fails for minutes. Design the error handling, given that retry topics break per-key order.

**Q4.5 · Hard · Design · An event-driven order platform.** Design the Kafka topics, keys, partition counts, guarantees and consumers for an e-commerce order platform (orders, payments, inventory, shipping, notifications, analytics), and walk through what happens when the payment service crashes mid-transaction.
