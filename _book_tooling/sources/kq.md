# How to use this practice book
%33 exercises matching the advanced back-end guide, with hints kept separate and executed solutions

Each part matches chapters of the **Advanced Back-end Engineering** guide. Code exercises use Python with a real Redis server (start one with `docker run -p 6379:6379 redis:7` or `sudo apt install redis-server`), SQLite and the libraries named in the guide; port the ideas to Spring afterwards using the equivalence tables at the end of each chapter. Design exercises are answered in prose, the way you would answer at a whiteboard.

Solutions were executed like the guide: each program started its own Redis 7 server, and its output is shown.

| Type | What you do |
|---|---|
| Code | Write and run a program |
| Numerical | Calculate, then check |
| Concept | Explain trade-offs |
| Design | Sketch a system and justify the choices |
| Debug | Find and fix the bug |

**Marking scheme.** Mark ✓ (solved alone), ~ (with the hint) or ✗ (needed the solution). For Code, ✓ also requires: atomic operations where concurrency matters, TTLs on every cache and lock key, and idempotent handlers. Redo every ~ and ✗ a week later.

| Part | Guide chapters | Topic | Exercises |
|---|---|---|---|
| 1 | 1 | Caching | 6 |
| 2 | 2 | Rate limiting, idempotency, locks | 5 |
| 3 | 3 | Messaging | 5 |
| 4 | 4 | Background jobs | 3 |
| 5 | 5 | Real-time | 3 |
| 6 | 6–7 | Storage and API styles | 5 |
| 7 | 8 | NoSQL modelling | 4 |
| 8 | 9 | System design | 2 |

# Exercises

## Part 1: Caching

**K1.1 · Easy · Numerical · Hit ratio and latency.** A cache lookup takes 1 ms and a database query 40 ms; a miss costs the lookup plus the query. What is the average latency at a 90% hit ratio, and what hit ratio is needed for an average of 10 ms?

**K1.2 · Medium · Code · An LRU cache.** Implement an in-process LRU cache with a fixed capacity, `get`, `put` and hit/miss statistics, and test the eviction order.

**K1.3 · Medium · Code · A caching decorator.** Write `@redis_cached(ttl)` that caches a function's result in Redis under a key built from the function name and arguments, and caches "not found" (`None`) for a short time to stop cache penetration.

**K1.4 · Medium · Concept · Stale profile.** After users update their display name, the old name keeps appearing for about five minutes, but only sometimes. The service uses cache-aside with `@Cacheable` and a 5-minute TTL across four instances. List the likely causes and the fixes.

**K1.5 · Hard · Code · TTL jitter.** 10,000 keys are cached at the same moment with a 60-second TTL. Show how many expire in the same second, then add ±10% random jitter and show the spread.

**K1.6 · Medium · Code · Leaderboard.** Build a "top energy savers" leaderboard with a sorted set: increment scores, show the top 3, a user's rank, and the two users just above and below them.

## Part 2: Rate limiting, idempotency and locks

**K2.1 · Easy · Numerical · Token bucket by hand.** Capacity 10, refill 2 tokens per second, starting full. Requests arrive: 12 at t = 0, 3 at t = 1, 6 at t = 4. How many are allowed at each time? Check with code.

**K2.2 · Medium · Code · Sliding window counter.** Implement the weighted sliding window counter (current window count plus the previous window's count weighted by the overlap) in Redis, and compare it with the exact sliding log on a burst at a boundary.

**K2.3 · Medium · Concept · Idempotency key design.** For `POST /transfers` (move money between wallets) and `POST /orders/{id}/cancel`, decide: who generates the key, its scope, where it is stored, for how long, what is stored with it, and what happens on a concurrent duplicate.

**K2.4 · Hard · Code · Fencing tokens.** Simulate a lock service issuing increasing tokens and a storage service that rejects writes with a token lower than the highest it has seen. Show that a client paused past its lease cannot overwrite the newer holder's write.

**K2.5 · Medium · Debug · The limiter that never resets.** This limiter sometimes blocks a user forever: `count = r.incr(key)` then, in the next line, `if count == 1: r.expire(key, 60)`. Explain how, reproduce it, and fix it.

## Part 3: Messaging

**K3.1 · Medium · Code · Fan-out and load sharing.** One stream of reading events must be processed completely by a billing service (two instances sharing the work) and by an alerts service (one instance). Show who processed what.

**K3.2 · Medium · Code · Ordering by key.** Partition events for six meters across three partitions by hashing the meter id, consume each partition with one consumer, and show that each meter's events stay in order although partitions interleave.

**K3.3 · Medium · Concept · Designing an event.** Design the `ReadingRecorded` event: its fields, identifiers, timestamps, versioning, and how to evolve it without breaking existing consumers.

**K3.4 · Hard · Code · A saga with compensations.** Orchestrate an order: reserve stock, charge payment, book delivery. Make payment fail and show the compensations running in reverse order; then make every step succeed.

**K3.5 · Medium · Numerical · Consumer lag.** Producers write 1,200 events/s to a topic with 4 partitions; one consumer handles 250 events/s. How fast does lag grow with 2 consumers, how many consumers can usefully run, and how many partitions are needed to keep up with a 50% safety margin?

## Part 4: Background jobs

**K4.1 · Medium · Code · Priority queue.** Implement a job queue where higher-priority jobs run first and equal priorities run in FIFO order, using one Redis sorted set.

**K4.2 · Medium · Design · A resumable nightly job.** Nightly billing for 2 million meters takes 3 hours and crashed at 70% last night. Redesign it so that it can resume, can be parallelised, and never bills a meter twice.

**K4.3 · Easy · Numerical · Back-off schedule.** With base 1 s, factor 2 and a 60 s cap, list the delays for 8 retries and the total waiting time. What does "full jitter" change?

## Part 5: Real-time

**K5.1 · Medium · Code · Long polling.** Implement a long-polling endpoint that returns as soon as a new alert exists for the meter, or with 204 after a timeout; show both outcomes.

**K5.2 · Medium · Concept · SSE or WebSockets?** Choose and justify for: a live electricity price ticker; a support chat; a progress bar for a 5-minute export; a collaborative whiteboard.

**K5.3 · Medium · Code · Detecting dead connections.** Show that a WebSocket server notices when a client disappears abruptly, and explain why heartbeats are still needed in production.

## Part 6: Storage and API styles

**K6.1 · Medium · Code · Multipart upload.** Split a file into parts, "upload" them in parallel with one part failing once and being retried, reassemble, and verify the whole-file checksum.

**K6.2 · Medium · Code · Offset versus cursor pagination.** Show that offset pagination skips a row when a new row is inserted between page requests, and that keyset (cursor) pagination does not.

**K6.3 · Medium · Code · Limit GraphQL query depth.** Add a validation rule that rejects queries nested more than three levels deep, and test it on a shallow and a malicious query.

**K6.4 · Medium · Concept · Which API style?** Choose REST, GraphQL or gRPC for: a public API for partner utilities; a mobile app home screen combining six entities; calls between the billing and tariff services; streaming 50,000 readings per second from gateways.

**K6.5 · Easy · Numerical · Varint sizes.** Protocol Buffers encode integers as varints of 7 bits per byte. How many bytes do 1, 127, 128, 300, 16,384 and 1,000,000 take? Verify with the protobuf library.

## Part 7: NoSQL modelling

**K7.1 · Medium · Code · Chat messages, wide-column style.** Model messages with partition key (conversation, month) and clustering by time descending; implement "latest 5 messages" and "the next page" with a cursor.

**K7.2 · Medium · Concept · Embed or reference?** Decide for: a user's addresses; a product's reviews; an order's line items; a blog post's author; a meter's daily readings.

**K7.3 · Medium · Numerical · Partition sizing.** 1 million meters send a 60-byte reading every 15 minutes. Compare partitions per meter per day, per meter per month and per meter (forever) in rows and bytes after 5 years, against a guideline of keeping partitions under 100 MB and 100,000 rows.

**K7.4 · Medium · Code · A second access pattern.** The single-table design of the guide supports "meters of a customer". Add "meters installed in a given month, across customers" with a secondary index table kept in sync on every write.

## Part 8: System design

**K8.1 · Hard · Design · Notification service.** Design a service that sends email, SMS and push notifications for billing, outages and OTPs, using the tools of this guide. Cover priorities, retries, rate limits per provider, deduplication, user preferences and quiet hours.

**K8.2 · Hard · Design · Smart-meter ingestion.** One million meters each send a reading every 15 minutes, and 5% of readings must raise real-time alerts. Estimate the load, then design ingestion, storage, alerts, the customer dashboard and nightly billing.
