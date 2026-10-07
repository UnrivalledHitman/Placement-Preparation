# How to use this practice book
%35 exercises matching the System Design guide: estimation drills, component choices, mini-designs and full prompts with rubrics

Each part matches chapters of the **System Design** guide. Numerical exercises have exact answers checked by short programs. Concept and design exercises have model answers; for the full design prompts, a **rubric** lists what an interviewer expects, so you can grade yourself honestly.

| Type | What you do |
|---|---|
| Numerical | Estimate or compute; show units and assumptions |
| Concept | Choose components or explain a trade-off, with reasons |
| Code | Run or write a small simulation that checks a claim |
| Design | Produce requirements, estimates, API, data model, diagram, deep dives and trade-offs in 40–45 minutes |

**Marking scheme.** ✓ (solved alone), ~ (with the hint) or ✗ (needed the solution). For Design exercises, score each rubric line 0–2 and count anything below 70% as ~. Redo every ~ and ✗ a week later and record it in the tracker.

| Part | Guide chapters | Topic | Exercises |
|---|---|---|---|
| 1 | 1–2 | Fundamentals and estimation | 6 |
| 2 | 3–4 | Edge, storage and sharding | 6 |
| 3 | 5 | Caching | 4 |
| 4 | 6 | Asynchronous processing | 4 |
| 5 | 7 | Consistency and reliability | 5 |
| 6 | 8 | APIs and microservices | 3 |
| 7 | 9–10 | Mini-designs | 4 |
| 8 | 9–11 | Full design prompts with rubrics | 3 |

# Exercises

## Part 1: Fundamentals and estimation

**H1.1 · Easy · Numerical · Requests per second.** An app has 50 M daily active users, each performing 20 API actions a day. What are the average and peak QPS (peak = 3× average)? How many servers handling 2 000 requests/s each, at 60% utilisation at peak, are needed?

**H1.2 · Medium · Numerical · Photo storage.** Users upload 10 M photos a day, 2 MB each, plus three thumbnails of 50 KB. Estimate five years of storage with 3× replication, and again with erasure coding at 1.5× overhead.

**H1.3 · Medium · Numerical · Availability of a stack.** A request passes a load balancer (99.99%), then any one of 3 application replicas (each 99.5%), then a database that is either the primary or its standby after failover (each 99.95%). What is the end-to-end availability, and how many minutes of downtime per month does it allow?

**H1.4 · Medium · Numerical · Tail latency with fan-out.** A page calls 20 backends in parallel; each has p99 = 100 ms. What fraction of page loads wait more than 100 ms for at least one backend? What percentile must each backend meet at 100 ms so that 99% of page loads are fast?

**H1.5 · Easy · Numerical · Video bandwidth.** 1 M concurrent viewers watch at 3 Mbps. What total egress bandwidth is that, and what reaches the origin if the CDN serves 95% of bytes?

**H1.6 · Medium · Numerical · Session cache size.** 20 M active sessions of 1 KB each, with 50% overhead for keys and data-structure memory, stored with one replica per primary. Redis nodes have 25 GB usable. How many nodes?

## Part 2: Edge, storage and sharding

**H2.1 · Medium · Concept · Pick the store.** Choose a storage technology for: (a) user accounts and orders of an e-commerce site; (b) product search with typo tolerance; (c) a per-user shopping cart; (d) 15-minute readings from 10 M smart meters; (e) product images; (f) "people you may know".

**H2.2 · Medium · Concept · Choose the shard key.** An orders table must serve "a user's orders, newest first" (very frequent), "one order by id" (frequent) and "all orders yesterday" (nightly report). Compare user_id, order_id and created_at as the shard key and choose.

**H2.3 · Medium · Code · Removing a node from a ring.** With 10 nodes on a hash ring, remove one. Measure what fraction of keys move, and how many of the remaining nodes receive them, first with 1 virtual node per server, then with 200.

**H2.4 · Medium · Numerical · How many shards?** The data set is 40 TB and growing 10 TB a year; the write rate is 5 000/s. One shard handles 2 TB and 2 000 writes/s, and you want 50% headroom on both. How many shards today, and in two years?

**H2.5 · Easy · Concept · L4 or L7?** Choose a layer-4 or layer-7 load balancer for: (a) routing `/api/*` and `/static/*` to different backends; (b) a high-volume TCP game protocol; (c) canary-releasing 5% of HTTP traffic to a new version; (d) a database proxy.

**H2.6 · Medium · Concept · Cache headers for a CDN.** Give suitable `Cache-Control` behaviour for: (a) `app.3f9c2a.js`; (b) `index.html`; (c) a public product JSON API; (d) a user's order history.

## Part 3: Caching

**H3.1 · Medium · Numerical · Effective latency.** A cache hit costs 1 ms and a database read 20 ms (after the miss). What is the average read latency at a 90% hit ratio, and what hit ratio is needed for an average of 2 ms?

**H3.2 · Medium · Code · TTL jitter.** 10 000 keys are written at t = 0 with a 300 s TTL. Simulate the peak number of expiries in any one second without jitter and with ±10% jitter.

**H3.3 · Medium · Concept · Choose the caching pattern.** Pick a pattern for: (a) product pages read far more often than they change; (b) a view counter incremented thousands of times a second; (c) an audit log written once and rarely read; (d) user settings read right after being saved.

**H3.4 · Hard · Concept · Invalidation across layers.** A product price is cached in a CDN (60 s TTL), in Redis and in an in-process cache on each of 50 app servers. When the price changes, how do you make all layers consistent quickly, and what staleness remains?

## Part 4: Asynchronous processing

**H4.1 · Medium · Numerical · Kafka partitions.** A topic receives 50 000 messages/s; one consumer instance processes 2 000/s. Messages for the same user must stay in order. How many partitions do you create, and what is the partition key?

**H4.2 · Medium · Concept · Delivery guarantees.** Choose at-most-once, at-least-once or effectively-once for: (a) clickstream for dashboards; (b) charging a customer; (c) sending a password-reset email; (d) updating a search index.

**H4.3 · Medium · Code · An idempotent consumer.** A stream delivers 1 000 payment messages with 15% duplicates in random order. Implement a consumer that uses a database unique constraint to apply each payment exactly once, and verify the total.

**H4.4 · Medium · Numerical · Backlog and drain time.** Messages arrive at 1 500/s for 10 minutes, then at 500/s; consumers process 1 000/s. What is the peak backlog, and how long after the burst ends does it take to drain?

## Part 5: Consistency and reliability

**H5.1 · Medium · Concept · Consistency per feature.** For a food-delivery app, choose strong or eventual consistency for: restaurant menus, order placement and payment, the delivery partner's live location, ratings and reviews, and the restaurant's "accepting orders" switch.

**H5.2 · Medium · Numerical · Retry amplification.** A request passes through three layers; each layer tries up to 3 times (1 attempt + 2 retries). How many calls can reach the bottom service for one user request in the worst case? What changes if only the top layer retries?

**H5.3 · Medium · Code · Trace a circuit breaker.** A breaker opens after 3 consecutive failures, stays open for 5 s, then allows one trial call. Calls arrive once per second with outcomes F F S F F F F S S S F (S success, F failure) from t = 0. Trace the state and what each caller sees.

**H5.4 · Medium · Concept · One cron job, many servers.** A nightly billing job must run exactly once although the service runs on 6 servers. Design this with a lease, and explain how fencing tokens protect the billing table.

**H5.5 · Medium · Numerical · Quorums for two workloads.** With N = 5 and a requirement to tolerate 2 failed replicas for both reads and writes, which (W, R) pairs are possible? Which would you pick for a write-heavy workload, and why is a read-heavy workload harder here?

## Part 6: APIs and microservices

**H6.1 · Easy · Concept · Design a REST API.** Design endpoints for a library service: search books, get a book, borrow a copy, return it, list a member's loans. Give methods, paths, key status codes and where idempotency keys are needed.

**H6.2 · Medium · Concept · A food-order saga.** Order placement spans: create order, charge payment, restaurant accepts, assign delivery partner. Design the saga with compensations, and say which step should come first if restaurants often reject orders.

**H6.3 · Medium · Code · Keyset pagination.** Implement cursor pagination over `posts(created_at, id)` in SQLite: the cursor is an opaque base64 string of the last `(created_at, id)`. Show that inserting new posts between page requests causes neither duplicates nor gaps.

## Part 7: Mini-designs

**H7.1 · Hard · Design · A real-time leaderboard.** 10 M players; scores change constantly; show the global top 100 and "my rank and the 5 players around me" within 100 ms.

**H7.2 · Hard · Design · A distributed job scheduler.** Users schedule millions of jobs (one-off and cron); each must run once, near its scheduled time, with retries, even if scheduler nodes fail.

**H7.3 · Hard · Design · Sensor telemetry alerting.** 2 M industrial temperature sensors report every 10 s. An alert must fire within 30 s when a sensor exceeds its threshold for 3 consecutive readings, without alert storms when a whole plant goes offline.

**H7.4 · Hard · Design · Flash-sale ticketing.** 10 000 concert seats go on sale at 10:00; 1 M users arrive in the first minute. Prevent overselling, keep the site up, and be fair.

## Part 8: Full design prompts with rubrics

**H8.1 · Hard · Design · Design Instagram.** Photo upload and viewing, follow, home feed, likes and comments, for 500 M daily users.

**H8.2 · Hard · Design · Design collaborative document editing.** Many users edit the same document at once (Google Docs-style), with live cursors, offline edits and version history.

**H8.3 · Hard · Design · Design an EV charging network backend.** Thousands of charging stations report status; drivers find available chargers, reserve a slot, start and stop sessions from an app, and pay per kWh; operators see live load and do demand response at grid peaks.
