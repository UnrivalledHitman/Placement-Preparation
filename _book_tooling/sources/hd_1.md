# Chapter 3: Building Blocks at the Edge
%DNS, CDNs, load balancers, reverse proxies and API gateways: how a request reaches your service

## 3.1 The path of a request

```text
 user --DNS--> CDN edge --(miss)--> load balancer --> gateway --> services --> caches, DBs
  |            static files,        health checks,    auth, rate limits,
  |            images, video,       TLS termination   routing, request
  |            cached responses                       shaping
  +-- browser cache
```

Each hop exists to remove work from the hops behind it: browser and CDN caches avoid the trip entirely; load balancers spread what remains; the gateway rejects bad traffic before it reaches business logic.

## 3.2 DNS

DNS maps names to IP addresses through a hierarchy (root → TLD → authoritative servers), with caching at every level controlled by each record's **TTL**. In system design it is also a **traffic-steering** tool:

| Technique | How | Use |
|---|---|---|
| Round-robin DNS | Several A records for one name | Crude load spreading; clients cache, so failover is slow |
| GeoDNS / latency-based routing | Answer depends on the resolver's location | Send users to the nearest region |
| Weighted records | Return endpoints in proportion to weights | Gradual migrations, canary regions |
| Health-checked failover | Stop returning an unhealthy endpoint | Region-level disaster recovery |

> TRAP: DNS changes are not instant. Resolvers and clients cache answers until the TTL expires, and some ignore low TTLs. Fail over between regions with DNS, but fail over between servers inside a region with a load balancer.

## 3.3 CDNs

A content delivery network caches content at hundreds of edge locations close to users. It cuts latency (the edge is a few milliseconds away, the origin may be 200 ms), absorbs traffic spikes and DDoS attacks, and reduces origin bandwidth costs.

| Content | Cacheable at the edge? | How |
|---|---|---|
| Static assets (JS, CSS, fonts) | Yes, for a long time | Versioned filenames (`app.3f9c.js`) plus long `Cache-Control` max-age |
| Images, video segments | Yes | Object storage as origin; signed URLs for private content |
| Public API responses (product page) | Briefly | Short TTL, `stale-while-revalidate` |
| Personalised responses | Usually not | Cache the shared parts; personalise at the edge or in the client |

Popularity on the internet follows a **Zipf-like** distribution: a small set of objects gets most requests. The simulation below shows how much of the traffic a CDN absorbs depending on how many objects each edge can keep.

```python run CDN offload under Zipf popularity
import random
from collections import OrderedDict
rng = random.Random(3)
N, requests = 100_000, 300_000
weights = [1 / (i + 1) ** 0.9 for i in range(N)]               # Zipf, s = 0.9
trace = rng.choices(range(N), weights=weights, k=requests)

def lru_hit_ratio(capacity):
    cache, hits = OrderedDict(), 0
    for obj in trace:
        if obj in cache:
            hits += 1; cache.move_to_end(obj)
        else:
            cache[obj] = True
            if len(cache) > capacity:
                cache.popitem(last=False)
    return hits / requests

sizes = [100, 1_000, 5_000, 10_000, 30_000]
ratios = [lru_hit_ratio(c) for c in sizes]
for c, r in zip(sizes, ratios):
    print(f'edge cache holds {c:6,} objects ({c / N:5.1%} of catalogue): hit ratio '
            f'{r:5.1%}, '
          f'origin sees {1 - r:5.1%} of requests')
plt.plot([c / N * 100 for c in sizes], [r * 100 for r in ratios], marker='o')
plt.xscale('log')
plt.xlabel('cache size (% of catalogue, log scale)')
plt.ylabel('hit ratio (%)')
plt.title('Edge hit ratio under Zipf popularity')
plt.tight_layout()
plt.savefig('hld_cdn.png', dpi=150)
```

![Hit ratio grows quickly with the first few per cent of the catalogue](figs/hld_cdn.png)

Caching 1% of the catalogue serves about a third of all requests and 10% serves about 60%, while each further tenfold increase in cache size buys less. Real traffic for hot content is often even more skewed than this (a Zipf exponent above 1), which pushes edge hit ratios higher still. The same curve explains why application caches (Chapter 5) work so well for read-heavy systems.

## 3.4 Load balancers

Load-balancing algorithms (round robin, least connections, consistent hashing) and the L4/L7 distinction were covered in the Computer Networks guide, Chapter 8. At the system level, remember:

| Concern | Design choice |
|---|---|
| Health | Active health checks remove failed instances; passive checks eject instances returning errors |
| Layer | L4 (TCP) is fast and protocol-agnostic; L7 (HTTP) can route by path or header, terminate TLS, retry |
| Sessions | Prefer stateless servers; sticky sessions break even load and complicate failover |
| The balancer itself | Run it as a redundant pair or use a managed, multi-zone service; it must not be a single point of failure |
| Slow servers | Least-outstanding-requests and latency-aware algorithms beat round robin when servers differ |

One idea worth knowing in depth is the **power of two choices**: pick two servers at random and send the request to the less loaded one. It needs only local information, yet it removes most of the imbalance of pure random assignment.

```python run Random versus power-of-two-choices balancing
import random
rng = random.Random(7)

def simulate(policy, servers=100, requests=100_000):
    load = [0] * servers
    for _ in range(requests):
        if policy == 'random':
            s = rng.randrange(servers)
        else:
            a, b = rng.randrange(servers), rng.randrange(servers)
            s = a if load[a] <= load[b] else b
        load[s] += 1
    return max(load), sum(load) / servers

for policy in ['random', 'two choices']:
    worst, avg = simulate(policy)
    print(f'{policy:12} busiest server {worst} requests vs average {avg:.0f} '
          f'({worst / avg - 1:+.0%} over)')
```

## 3.5 Reverse proxies and API gateways

A **reverse proxy** (Nginx, Envoy, HAProxy) sits in front of servers: TLS termination, compression, caching, request buffering and routing. An **API gateway** is a reverse proxy specialised for APIs, and the natural home for cross-cutting concerns:

| Concern | Why at the gateway |
|---|---|
| Authentication (JWT/OAuth validation) | Services receive an already-verified identity |
| Rate limiting and quotas | Reject abuse before it costs anything downstream |
| Routing and versioning | `/v1/orders` → orders service; canary 5% to v2 |
| Request/response transformation | Aggregate several backend calls for a mobile client (backend-for-frontend) |
| Observability | One place to log, trace and measure every request |

> TIP: Keep business logic **out** of the gateway. When the gateway starts knowing what an order is, it becomes a monolith in disguise and a deployment bottleneck.

## 3.6 Practical lessons

- DNS steers traffic between regions but changes slowly; load balancers handle failover inside a region.
- Put everything cacheable behind a CDN; version static assets so they can be cached forever.
- Popularity is skewed: small caches absorb most traffic.
- Load balancers must themselves be redundant; prefer stateless servers to sticky sessions.
- Gateways handle cross-cutting concerns, not business rules.

# Chapter 4: Data Storage at Scale
%Choosing databases, replicating them, sharding them, and keeping the data model fit for the access patterns

## 4.1 SQL or NoSQL?

Choose by **access pattern and consistency need**, not by fashion. A good default for a new product is a relational database, adding specialised stores when a specific access pattern demands one.

| Need | Good fit | Why |
|---|---|---|
| Transactions across entities, complex queries, joins | Relational (PostgreSQL, MySQL) | ACID, mature tooling, flexible queries |
| Simple key lookups at huge scale, predictable latency | Key-value (DynamoDB, Redis) | Partitioned by key, O(1) access |
| Flexible, nested documents read as a whole | Document (MongoDB) | One read per aggregate, schema evolves easily |
| Very high write throughput, time-ordered data | Wide-column (Cassandra, ScyllaDB, Bigtable) | LSM-tree storage, partition + clustering keys |
| Relationship traversals | Graph (Neo4j) | Multi-hop queries without join explosions |
| Full-text search, relevance | Search engine (Elasticsearch, OpenSearch) | Inverted indexes |
| Metrics and sensor data | Time-series (TimescaleDB, InfluxDB) | Compression, downsampling, time-window queries |
| Large binary files | Object storage (S3, GCS) | Cheap, durable, effectively unlimited; serve through a CDN |

Real systems are **polyglot**: user accounts and payments in SQL, sessions in Redis, product search in Elasticsearch, images in object storage, events in Kafka.

## 4.2 Replication in practice

The mechanics (single-leader, multi-leader, leaderless; synchronous versus asynchronous; quorums) are covered in the DBMS Theory guide, Chapter 9. The system-level patterns:

| Pattern | Use |
|---|---|
| Read replicas | Scale read-heavy workloads; route analytics and reporting away from the primary |
| Synchronous standby in another zone | Fail over without losing committed writes |
| Cross-region asynchronous replica | Disaster recovery and local reads in another region |
| Read-your-writes routing | After a user writes, send that user's reads to the primary for a few seconds |

## 4.3 Sharding

When one primary cannot hold the data or absorb the writes, split the data into **shards** (partitions) by a **shard key**.

| Strategy | How | Strength | Weakness |
|---|---|---|---|
| Hash of key | shard = hash(key) mod N, or a hash ring | Even spread | Range queries hit every shard; resharding moves data |
| Range | Contiguous key ranges per shard | Range scans, ordered data | Hot spots on the newest range (timestamps, auto-increment ids) |
| Directory | A lookup table maps key → shard | Full control, easy moves | The directory must be fast and highly available |
| Geographic | Shard by region or country | Data locality, residency laws | Uneven sizes; cross-region users |

Choosing the shard key is the most important decision:

1. **High cardinality**, so data spreads evenly.
2. **Matches the main query**, so most requests touch one shard (user_id for a user's timeline; conversation_id for chat messages).
3. **Avoids monotonically increasing values** as the leading part of a range key, or all new writes hit the last shard.

Cross-shard queries and transactions are the price: global secondary indexes, scatter–gather queries, or sagas (Chapter 8).

## 4.4 Consistent hashing in depth

The Computer Networks practice book and the DBMS Theory guide showed why consistent hashing moves only about 1/N of the keys when a node joins. Two practical questions remain: **how many virtual nodes** each server needs for an even spread, and what to do about **hot keys**.

```python run Load balance on a hash ring versus virtual nodes per server
import hashlib, bisect, statistics

def h(s):
    return int(hashlib.md5(s.encode()).hexdigest()[:12], 16)

keys = [f'user:{i}' for i in range(60_000)]
servers = [f'node{i}' for i in range(10)]

def spread(vnodes):
    ring = sorted((h(f'{s}#{v}'), s) for s in servers for v in range(vnodes))
    points = [p for p, _ in ring]
    load = {s: 0 for s in servers}
    for k in keys:
        load[ring[bisect.bisect(points, h(k)) % len(ring)][1]] += 1
    loads = list(load.values())
    mean = statistics.mean(loads)
    return max(loads) / mean, statistics.pstdev(loads) / mean

xs, ys = [], []
for v in [1, 10, 50, 100, 200, 500]:
    peak, cv = spread(v)
    xs.append(v); ys.append(peak)
    print(f'{v:4} virtual nodes per server: busiest server {peak:.2f}x the mean, spread '
            f'(CV) {cv:.1%}')
plt.plot(xs, ys, marker='o'); plt.xscale('log'); plt.axhline(1, color='grey', lw=0.8)
plt.xlabel('virtual nodes per server (log scale)'); plt.ylabel('busiest / mean load')
plt.title('Virtual nodes even out a hash ring')
plt.tight_layout()
plt.savefig('hld_vnodes.png', dpi=150)
```

![More virtual nodes bring the busiest server close to the mean](figs/hld_vnodes.png)

With one point per server, some servers own large arcs of the ring and others tiny ones. A hundred or more virtual nodes per server brings the busiest server to within about 15% of the average, against more than three times the average with a single point per server. Virtual nodes also make it easy to give a bigger server more weight (more points) and to spread a failed server's load over all survivors instead of one neighbour.

### Hot keys

Even a perfect hash cannot split traffic for a **single** key: a celebrity's profile, a flash-sale product, a viral post. Common fixes:

| Fix | How | Cost |
|---|---|---|
| Cache in front | Hot reads served from an in-memory cache (and a local in-process cache) | Staleness |
| Key salting / splitting | Store the key as k#0…k#9 on different shards; write to one, read all (or aggregate) | Reads fan out; counters need summing |
| Read replicas for that shard | More copies of the hot partition | Replication lag |
| Request coalescing | Many concurrent identical reads trigger one backend read (Chapter 5) | Small added latency |

```python run Salting a hot counter key
import hashlib, random
rng = random.Random(5)
shards = 8
def shard_of(key):
    return int(hashlib.sha1(key.encode()).hexdigest(), 16) % shards

writes = 80_000
load_plain = [0] * shards
load_salted = [0] * shards
for i in range(writes):
    key = 'likes:post:viral'
    if rng.random() < 0.9:                       # 90% of writes go to one viral post
        load_plain[shard_of(key)] += 1
        load_salted[shard_of(f'{key}#{rng.randrange(16)}')] += 1
    else:
        other = f'likes:post:{rng.randrange(10_000)}'
        load_plain[shard_of(other)] += 1
        load_salted[shard_of(other)] += 1
print('writes per shard, plain key :', load_plain)
print('writes per shard, 16 salts  :', load_salted)
print(f'busiest shard share: plain {max(load_plain) / writes:.0%}, salted '
        f'{max(load_salted) / writes:.0%}')
```

The busiest shard's share drops from 91% to 29%. It is not 1/8 because 16 random salts do not land evenly on 8 shards; placing the salted keys deliberately on distinct shards, or using more salts, spreads them further. The read side pays: the like count is now the sum of 16 sub-counters. That is acceptable for counters, which are usually cached and allowed to be slightly stale anyway.

### Rebalancing with fixed partitions

Systems such as Kafka, Elasticsearch, Couchbase and Riak avoid rehashing keys at all: create many more **partitions** than nodes up front (for example 256), hash keys to partitions once, and move whole partitions between nodes when the cluster changes.

```python run Moving partitions instead of keys
import math

def assign(partitions, nodes):
    """Round-robin initial assignment."""
    return {p: p % nodes for p in range(partitions)}

def rebalance(assignment, new_nodes):
    """Move the minimum number of partitions so every node has an equal share."""
    target = math.ceil(len(assignment) / new_nodes)
    count = {n: 0 for n in range(new_nodes)}
    for n in assignment.values():
        count[n] += 1
    moved, result = 0, dict(assignment)
    for p, n in sorted(assignment.items()):
        if count[n] > target:
            dest = min(count, key=count.get)
            if count[dest] < target:
                result[p] = dest; count[n] -= 1; count[dest] += 1; moved += 1
    return result, moved, count

a = assign(256, 4)
b, moved, count = rebalance(a, 5)
print(f'256 partitions, 4 -> 5 nodes: moved {moved} partitions ({moved / 256:.0%}), '
      f'per-node counts {sorted(count.values())}')
```

Only about a fifth of the partitions move, the data each node holds stays roughly equal, and the key-to-partition mapping never changes, so clients need only an updated partition map.

## 4.5 Shaping data for the queries

| Technique | Idea | Trade-off |
|---|---|---|
| Indexes | Secondary indexes for the filters you run (DBMS guide, Chapter 7) | Slower writes, more storage |
| Denormalisation | Store data where it is read (author name inside each post) | Updates must touch every copy |
| Precomputation / materialised views | Compute expensive results ahead of time (follower counts, leaderboards) | Staleness; more writes |
| CQRS | Separate write model (normalised) from read models (denormalised, per screen) | Two models to keep in sync, usually through events |
| Event sourcing | Store the sequence of events; derive state from them | Powerful audit and replay; more complex queries |
| Hot/cold tiering | Recent data on fast storage, old data on cheap storage | Slower access to old data |

## 4.6 Blob storage

Large files (images, videos, backups, ML models) do not belong in a database. Store them in **object storage** (S3, Google Cloud Storage, Azure Blob) and keep only metadata (owner, size, content type, object key) in the database. Clients upload directly with **pre-signed URLs**, so the bytes never pass through your application servers, and downloads go through the CDN.

```text
client --(1) request upload URL--> API --(2) pre-signed PUT URL--> client
client --(3) PUT bytes directly------------------------------------> object storage
client --(4) "upload done", object key--> API --> metadata row in database
viewers <------------------------- CDN <------------------------- object storage
```

## 4.7 Practical lessons

- Default to SQL; add specialised stores for specific access patterns.
- Shard only when one node cannot cope; choose a shard key that spreads load and matches the main query.
- Use many virtual nodes on a hash ring, or many fixed partitions, so rebalancing is cheap and even.
- Hot keys need their own treatment: caching, salting or replication.
- Denormalise and precompute for reads; store blobs in object storage behind a CDN.
