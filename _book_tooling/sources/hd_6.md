# Chapter 11: Question Bank and Cheat Sheet
%Trade-off questions with the core of a good answer, and the numbers to memorise

## 11.1 Fundamentals and estimation

| Question | Core of a good answer |
|---|---|
| How do you start a design interview? | Clarify functional and non-functional requirements, state assumptions, estimate scale, then API, data model, diagram, deep dives |
| Vertical or horizontal scaling? | Vertical first for simplicity (especially databases); horizontal for stateless tiers and when one machine is not enough; horizontal needs statelessness and partitioning |
| What makes a service stateless, and why does it matter? | No per-user state in server memory between requests; any instance can serve any request, so instances scale and fail freely |
| How many requests per second is 100 M per day? | About 1 200 average (10<sup>8</sup> / 10<sup>5</sup>), 2 500–4 000 at peak |
| What availability does a chain of three 99.9% services give? | About 99.7%: series dependencies multiply |
| Why p99 rather than average latency? | Averages hide the tail; with fan-out, most user requests hit some slow backend call |

## 11.2 Storage and caching

| Question | Core of a good answer |
|---|---|
| SQL or NoSQL for X? | Decide from access patterns and consistency: SQL for transactions and flexible queries; key-value or wide-column for huge, simple, partitioned access; say what you lose |
| How do you choose a shard key? | High cardinality, matches the main query, avoids monotonic hot spots; accept cross-shard costs for secondary queries |
| What is consistent hashing for? | Adding or removing a node moves only ~1/N of keys; virtual nodes even out the load |
| How do you handle a hot key? | Cache (plus local near-cache), salt/split the key, replicate it, coalesce requests |
| Cache-aside: update or delete on write? | Delete (then TTL as a safety net); updating races between writers |
| What is a cache stampede and how do you prevent it? | Many misses for an expired hot key hit the DB at once; request coalescing, early probabilistic refresh, stale-while-revalidate, TTL jitter |
| Where do images and videos go? | Object storage, uploaded with pre-signed URLs, served through a CDN; metadata in a database |

## 11.3 Asynchrony, consistency and reliability

| Question | Core of a good answer |
|---|---|
| Queue or log (RabbitMQ or Kafka)? | Queue for distributing tasks to workers; log when several consumers need the same events, ordering per key, or replay |
| How do you get exactly-once processing? | At-least-once delivery plus idempotent consumers (dedup keys, conditional writes); or transactions within one system |
| How do you update a DB and publish an event reliably? | Transactional outbox or change data capture; never dual-write |
| What happens when a consumer is slower than the producer? | Backlog grows; bound the queue, apply back-pressure or shed load, scale consumers, move poison messages to a DLQ |
| How do you design retries? | Only for idempotent operations; exponential back-off with jitter and a wide first window; cap attempts; retry budget |
| What is a circuit breaker? | Stops calling a failing dependency for a cool-down, fails fast with a fallback, probes before closing again |
| Why are distributed locks dangerous? | A paused holder can outlive its lease; protect the resource with fencing tokens or conditional writes |
| When would you choose strong consistency? | Money, inventory, bookings, uniqueness constraints; eventual consistency for counters, feeds, analytics |

## 11.4 Services and APIs

| Question | Core of a good answer |
|---|---|
| Monolith or microservices? | Start with a modular monolith; split along business capabilities when teams, scaling or technology demand it |
| REST, gRPC or GraphQL? | REST for public APIs, gRPC for internal low-latency typed calls, GraphQL for front-ends aggregating many services |
| How do you paginate a feed? | Cursor (keyset) pagination: stable under inserts, efficient with an index |
| How do you handle a transaction across services? | Saga with compensating actions (orchestrated or choreographed), idempotent steps, semantic locks |
| What do you monitor? | RED metrics per service, USE metrics per resource, structured logs with request ids, distributed traces; alert on SLO burn rate |

## 11.5 Case-study one-liners

| System | The decision that matters most |
|---|---|
| URL shortener | ID generation (counter ranges + base62) and a read cache; 301 versus 302 |
| Pastebin | Separate metadata (DB) from content (object storage + CDN) |
| Rate limiter | Atomic counters in Redis (Lua), fail-open versus fail-closed |
| Notification system | Priority queues, preferences and dedup, provider failover |
| Chat | Stateful websocket gateways, per-conversation sequence numbers, sync on reconnect |
| News feed | Hybrid fan-out: push for normal accounts, pull for celebrities |
| Video streaming | Parallel transcoding into segments, ABR, CDN-heavy delivery |
| Ride hailing | In-memory geospatial index, atomic driver assignment |
| Typeahead | Trie with precomputed top-k, built offline, served from memory |
| Web crawler | Polite per-host frontier, Bloom filter for seen URLs |
| Distributed cache | Hash slots or consistent hashing, replicas, callers that tolerate misses |
| Payment system | Idempotency end to end, double-entry ledger, reconciliation |
| Smart-meter platform | Idempotent upserts on (meter, timestamp), event-time aggregation, time-series storage |

## 11.6 Numbers to memorise

| Quantity | Value |
|---|---|
| Seconds in a day | 86 400 ≈ 10<sup>5</sup> |
| 1 M requests/day | ≈ 12/s |
| Memory reference / SSD random read / datacentre round trip / cross-continent round trip | 100 ns / 20–100 µs / 0.5 ms / 100–250 ms |
| 99.9% / 99.99% availability | 8.8 hours / 53 minutes of downtime per year |
| Redis node | ~100 000+ ops/s |
| SQL primary (simple writes) | ~1 000–10 000 writes/s |
| Kafka partition | ~10 MB/s or more per partition (order of magnitude) |
| Websocket connections per server | ~10 000–100 000 (memory bound) |
| Base62, 7 characters | 3.5 × 10<sup>12</sup> codes |
| Bloom filter, 1% false positives | ~9.6 bits per item, 7 hash functions |
| Consistent hashing, adding 1 node to N | ≈ 1/(N + 1) of keys move |
| Quorum overlap | R + W > N |

## 11.7 A one-page checklist

1. Requirements: functional (3–5), non-functional as numbers, what is out of scope.
2. Estimates: QPS (avg, peak), storage over years, bandwidth, cache size; one decision from each.
3. API: the main endpoints, idempotency keys where needed.
4. Data model: entities, keys, database choice and the reason, shard key.
5. Diagram: client → edge (DNS, CDN) → LB → gateway → services → caches, databases, queues.
6. Walk through one write and one read.
7. Deep dives: the two or three hardest parts (hot keys, ordering, consistency, fan-out).
8. Failure: what happens when each component dies; redundancy, retries, circuit breakers, back-pressure.
9. Observability and operations: metrics, alerts, deployments, data migrations.
10. Trade-offs and next steps at 10× scale.
