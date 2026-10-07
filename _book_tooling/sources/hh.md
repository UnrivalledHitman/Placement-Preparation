# Hints
%Read only the hint for the exercise you are stuck on

## Part 1 hints

| Exercise | Hint |
|---|---|
| H1.1 | Divide daily actions by about 10<sup>5</sup>; servers = peak / (capacity × utilisation) |
| H1.2 | Per photo: original plus three thumbnails; then × days × years × overhead |
| H1.3 | Parallel tiers: 1 − (1 − a)<sup>n</sup>; then multiply the tiers in series |
| H1.4 | P(all 20 fast) = 0.99<sup>20</sup>; invert it for the required per-backend percentile |
| H1.5 | Multiply, then take 5% for the origin |
| H1.6 | Data × overhead, then primaries from usable memory, then add replicas |

## Part 2 hints

| Exercise | Hint |
|---|---|
| H2.1 | Match each feature to its access pattern: transactions, text search, key lookup, time series, blobs, relationships |
| H2.2 | Which query is the hottest? Which key creates a write hot spot? |
| H2.3 | Count moved keys, then count distinct nodes that received them |
| H2.4 | Compute shards from storage and from writes separately; take the larger |
| H2.5 | Does the balancer need to understand HTTP? |
| H2.6 | Hashed filenames can be cached forever; HTML and personal data cannot |

## Part 3 hints

| Exercise | Hint |
|---|---|
| H3.1 | A miss pays the cache check and the database read |
| H3.2 | Count expiries per second for each scheme |
| H3.3 | Read-heavy, write-heavy and lossy, write-once, read-after-write |
| H3.4 | Invalidate from the source of truth outwards, with events, and bound each layer with a TTL |

## Part 4 hints

| Exercise | Hint |
|---|---|
| H4.1 | One consumer per partition at most; order is per partition |
| H4.2 | What does a lost message cost, and what does a duplicate cost? |
| H4.3 | Insert the message id and apply the effect in one transaction |
| H4.4 | Net growth rate during the burst, net drain rate after it |

## Part 5 hints

| Exercise | Hint |
|---|---|
| H5.1 | Money and order state need strong consistency; displays and counters do not |
| H5.2 | Attempts multiply across layers |
| H5.3 | Consecutive failures open it; after the cool-down exactly one trial call decides |
| H5.4 | A lease with expiry decides who runs; a fencing token protects the writes |
| H5.5 | Tolerating f failures needs W ≤ N − f and R ≤ N − f |

## Part 6 hints

| Exercise | Hint |
|---|---|
| H6.1 | Resources, methods, status codes; which calls change state and can be retried? |
| H6.2 | Put the step most likely to fail first; authorise before capturing |
| H6.3 | Compare (created_at, id) as a pair, using a matching composite index |

## Part 7 hints

| Exercise | Hint |
|---|---|
| H7.1 | Sorted sets answer both top-k and rank in O(log n) |
| H7.2 | Claim due jobs atomically with a lease; workers must be idempotent |
| H7.3 | Keyed stream state per sensor; group silent sensors by plant |
| H7.4 | Admission control first, then atomic seat holds with expiry |

## Part 8 hints

| Exercise | Hint |
|---|---|
| H8.1 | Media path, feed fan-out and hot counters are the three deep dives |
| H8.2 | One owner per document, plus OT or CRDTs |
| H8.3 | Treat chargers like chat clients (stateful connections), bookings like seats, and meter data like smart meters |
