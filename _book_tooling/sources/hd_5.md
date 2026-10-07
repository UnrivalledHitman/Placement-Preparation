# Chapter 10: Case Studies II
%Video streaming, ride hailing, typeahead, web crawler, distributed cache, payments and a smart-meter data platform

## 10.1 Video streaming (YouTube-style)

### Requirements and estimates

Upload videos; transcode them into several resolutions; stream smoothly on varying networks; 5 M uploads/day is unrealistic for a student project but useful for practice: suppose 500 000 uploads/day of 10 minutes each. At ~10 MB per minute per rendition and 5 renditions, that is about 250 TB of new data per day before replication, which is why video lives in object storage behind CDNs and why old, unpopular renditions move to colder storage.

### Design

```text
upload: client -> pre-signed URL -> object storage (raw) -> event -> transcoding queue
        workers: split into segments -> encode 240p..1080p -> thumbnails -> object storage
        metadata: title, owner, status (uploading -> processing -> ready), renditions
watch:  client -> metadata (manifest URL) -> CDN -> HLS/DASH manifest -> 2-6 s segments
```

Transcoding is embarrassingly parallel: split the video into segments and encode them on many workers (a DAG of tasks). The player uses **adaptive bitrate (ABR)** streaming: it downloads short segments and picks the rendition for the next one from measured throughput and the size of its buffer.

```python run Adaptive bitrate on a fluctuating network
import random
rng = random.Random(21)
renditions = [(240, 0.4), (360, 0.8), (480, 1.4), (720, 2.8), (1080, 5.0)]   # (p, Mbps)
segment = 4.0                                                             # seconds
bw, bandwidth = 4.0, []   # Mbps, per segment
for i in range(150):                       # correlated throughput, congestion in the middle
    target = 1.2 if 50 <= i < 80 else 4.5
    bw = max(0.3, 0.75 * bw + 0.25 * target + rng.gauss(0, 0.4))
    bandwidth.append(bw)

def play(policy):
    buffer, stalls, quality, estimate = 0.0, 0.0, [], 3.0
    for i, bw in enumerate(bandwidth):
        if policy == 'fixed 1080p':
            p, rate = renditions[-1]
        else:                                 # buffer-aware throughput rule
            safe = estimate * (0.6 if buffer < 8 else 0.9)
            p, rate = max([r for r in renditions if r[1] <= safe] or [renditions[0]])
        download = rate * segment / bw        # seconds to fetch the segment
        if i > 0 and download > buffer:   # the first segment is start-up delay, not a stall
            stalls += download - buffer; buffer = 0.0
        else:
            buffer = max(0.0, buffer - download)
        buffer = min(buffer + segment, 30)
        estimate = 0.7 * estimate + 0.3 * bw   # smoothed throughput
        quality.append(p)
    return stalls, sum(quality) / len(quality)

for policy in ['fixed 1080p', 'adaptive']:
    stall, q = play(policy)
    print(f'{policy:12} total stalling {stall:6.1f} s over {len(bandwidth) * segment:.0f} '
            f's of video, '
          f'average resolution {q:.0f}p')
```

Fixed 1080p looks best on paper but stalls for minutes, mostly during the congested period, because each 4-second segment takes far longer than 4 seconds to download. The adaptive rule drops to lower renditions while throughput is low and climbs back afterwards, so it never stalls at all, at an average of a little over 640p. Viewers forgive lower resolution far more readily than a frozen video.

## 10.2 Ride hailing (Uber-style)

### Key problems

1. Drivers send their location every few seconds: about 1 M active drivers / 4 s ≈ 250 000 location updates per second, written to an in-memory **geospatial index**, not a disk database.
2. A ride request must find nearby available drivers in milliseconds.
3. A driver must not be matched to two riders (atomic state change, as in the LLD mock problem).

### Geospatial indexing

Divide the map into cells (geohash, Google's S2 or Uber's H3 hexagons). Each driver is stored under its cell; a nearby search looks at the rider's cell and its neighbours instead of every driver.

```python run Grid-cell nearby search versus scanning every driver
import math, random, time
rng = random.Random(4)
CELL = 0.01                                            # degrees, roughly 1 km
drivers = {i: (22.5 + rng.random() * 0.4, 88.2 + rng.random() * 0.4)
        for i in range(200_000)}
grid = {}
for d, (lat, lon) in drivers.items():
    grid.setdefault((int(lat / CELL), int(lon / CELL)), []).append(d)

def dist_km(a, b):
    return math.hypot((a[0] - b[0]) * 111,
            (a[1] - b[1]) * 111 * math.cos(math.radians(a[0])))

def nearest_scan(p, k=5):
    return sorted(drivers, key=lambda d: dist_km(p, drivers[d]))[:k]

def nearest_grid(p, k=5, rings=1):
    cx, cy = int(p[0] / CELL), int(p[1] / CELL)
    while True:
        cand = [d for dx in range(-rings, rings + 1) for dy in range(-rings, rings + 1)
                for d in grid.get((cx + dx, cy + dy), [])]
        if len(cand) >= k:
            return sorted(cand, key=lambda d: dist_km(p, drivers[d]))[:k], len(cand)
        rings += 1

rider = (22.5726, 88.3639)                             # Kolkata
t0 = time.perf_counter(); a = nearest_scan(rider); t1 = time.perf_counter()
b, examined = nearest_grid(rider); t2 = time.perf_counter()
print(f'scan all 200,000 drivers : {(t1 - t0) * 1000:7.1f} ms')
print(f'grid cells (3x3 around)  : {(t2 - t1) * 1000:7.1f} ms, examined {examined} drivers')
print('same 5 nearest drivers:', a == b, '| nearest is', round(dist_km(rider,
        drivers[b[0]]), 2), 'km away')
```

The grid search examines only the drivers in nine cells (about 1 100 of 200 000), so it is dozens of times faster and still returns exactly the same five drivers. (The timings vary from machine to machine; the ratio is what matters.) In production the index lives in memory (Redis GEO, or a custom in-memory service sharded by region), and the location stream is also written to Kafka for trip history and analytics.

Other deep dives: **ETA** from road-graph routing plus ML corrections; **surge pricing** per cell from demand/supply ratios; **trip state machine** with idempotent transitions; **payments** after the trip (Section 10.6).

## 10.3 Typeahead (search autocomplete)

Requirements: return the top 5–10 completions for a prefix within ~50 ms while the user types; suggestions ranked by popularity; updated daily (or near real time for trends).

Design: build a **trie** offline from search logs, storing at each node the **top-k completions** for that prefix (precomputed), so a lookup is O(length of prefix). Serve it from memory, sharded by prefix range, with browser- and CDN-level caching of popular prefixes and a debounce on the client (send a request only after a short typing pause).

```python run A trie with precomputed top-k per prefix
import heapq
from collections import Counter

queries = Counter({'system design': 900, 'system design interview': 850, 'sql joins': 700,
                   'sql window functions': 400, 'spring boot': 650, 'spring boot jpa': 300,
                   'smart meter': 120, 'smart grid': 200, 'sorting algorithms': 500,
                           'sql': 950})

class Node:
    __slots__ = ('kids', 'top')
    def __init__(self): self.kids, self.top = {}, []

root = Node()
for q, freq in queries.items():
    node = root
    for ch in q:
        node = node.kids.setdefault(ch, Node())
        node.top.append((freq, q))

def finalise(node, k=3):                    # keep only the top-k at every node
    node.top = heapq.nlargest(k, node.top)
    for child in node.kids.values():
        finalise(child, k)
finalise(root)

def suggest(prefix):
    node = root
    for ch in prefix:
        node = node.kids.get(ch)
        if node is None:
            return []
    return [q for _, q in node.top]

for p in ['s', 'sq', 'sp', 'sma', 'sys', 'x']:
    print(f'{p!r:6} -> {suggest(p)}')
```

Storing the top-k at every node costs memory (k entries × number of nodes) but makes each keystroke a single walk down the trie. Rebuilding offline from logs keeps the serving path read-only and simple.

## 10.4 Web crawler

Requirements: crawl 1 billion pages a month politely (no hammering any one site), avoid re-crawling duplicates, prioritise important pages, and store pages for indexing.

```text
seed URLs -> URL frontier (priority queues; per-host queues for politeness)
          -> fetchers (DNS cache, robots.txt cache, rate limit per host)
          -> content store (object storage) -> parser -> link extractor
          -> "seen URL?" (Bloom filter + exact store) -> back into the frontier
          -> "seen content?" (hash / SimHash for near-duplicates)
```

Estimate: 1 B pages/month ≈ 400 pages/s; at 100 KB each, 40 MB/s of downloads and 100 TB a month. The "seen URL" check runs for every extracted link (billions of checks), so it uses a **Bloom filter**: a compact bit array that answers "definitely not seen" or "probably seen", with no false negatives and a tunable false-positive rate.

```python run A Bloom filter for seen URLs
import hashlib, math

class Bloom:
    def __init__(self, n, fp_rate):
        self.m = math.ceil(-n * math.log(fp_rate) / math.log(2) ** 2)    # bits
        self.k = max(1, round(self.m / n * math.log(2)))                  # hash functions
        self.bits = bytearray(self.m // 8 + 1)
    def _positions(self, item):
        d = hashlib.sha256(item.encode()).digest()
        h1, h2 = int.from_bytes(d[:8], 'big'), int.from_bytes(d[8:16], 'big')
        return [(h1 + i * h2) % self.m for i in range(self.k)]          # double hashing
    def add(self, item):
        for p in self._positions(item): self.bits[p // 8] |= 1 << (p % 8)
    def __contains__(self, item):
        return all(self.bits[p // 8] >> (p % 8) & 1 for p in self._positions(item))

n = 200_000
bf = Bloom(n, 0.01)
for i in range(n):
    bf.add(f'https://site{i % 5000}.in/page/{i}')
false_pos = sum(f'https://other.in/new/{i}' in bf for i in range(100_000))
print(f'{n:,} URLs in {bf.m / 8 / 1024:.0f} KB with {bf.k} hash functions '
      f'(a set of strings would need tens of MB)')
print(f'false positive rate on 100,000 unseen URLs: {false_pos / 100_000:.2%} (target 1%)')
print('every inserted URL found (no false negatives):',
      all(f'https://site{i % 5000}.in/page/{i}' in bf for i in range(0, n, 997)))
```

**Politeness**: the frontier keeps one queue per host and a "next allowed fetch time" per host, so a crawler never sends more than, say, one request per second to a site, while thousands of hosts are crawled in parallel. Respect `robots.txt` and crawl-delay. **Traps** (infinite calendars, session ids in URLs) are handled with URL normalisation, depth limits and per-host page caps.

## 10.5 Distributed cache (Redis/Memcached cluster)

Requirements: store hundreds of GB of key-value data in memory across nodes; sub-millisecond reads; survive node failures; scale out without a full reshuffle.

| Concern | Design |
|---|---|
| Partitioning | Consistent hashing with virtual nodes (Chapter 4), or fixed hash slots (Redis Cluster uses 16 384 slots mapped to nodes) |
| Replication | Each partition has a primary and one or two replicas; asynchronous replication; automatic failover by a cluster quorum (Redis Sentinel/Cluster) |
| Client routing | Smart clients cache the slot map and talk to the right node directly; a `MOVED` reply refreshes the map |
| Eviction | Per-node LRU/LFU with a memory limit; TTLs with jitter |
| Hot keys | Local in-process near-cache, key replication or salting (Chapter 4) |
| Consistency | A cache is allowed to lose data: after failover, some recent writes may be missing, so the source of truth stays in the database |

The key sentence for the interview: "A cache is not a database: design every caller to survive a cache miss, a stale value and a cache node restart."

## 10.6 Payment system

Requirements: accept payments for orders through external payment service providers (PSPs); never charge twice; never lose a charge; reconcile with the PSP and bank settlement files; full audit trail.

```text
checkout -> payment service (idempotency key = order id)
              -> payment record: CREATED -> AUTHORISED -> CAPTURED / FAILED (state machine)
              -> PSP (card network) via adapter, with timeouts and retries using the same key
              -> ledger: double-entry rows (immutable)        -> outbox -> events (order paid)
nightly:    reconciliation compares ledger, PSP reports and bank settlement; flags mismatches
```

### Deep dives

- **Idempotency** end to end: the client retries with the same key; the payment service stores the key with the result; the PSP call also carries an idempotency key, so a timeout followed by a retry cannot charge twice.
- **Unknown outcomes**: a PSP timeout does not mean failure. Mark the payment `PENDING`, then query the PSP or wait for its webhook before retrying or refunding.
- **Double-entry ledger**: every movement is two entries (a debit and a credit) that sum to zero, written in one transaction and never updated or deleted. Balances are derived by summing entries, and the invariant "all entries sum to zero" catches bugs.

```python run A double-entry ledger with idempotent payments
import sqlite3
db = sqlite3.connect(':memory:')
db.executescript('''
CREATE TABLE payments (idem_key TEXT PRIMARY KEY, order_id TEXT, amount INT, status TEXT);
CREATE TABLE ledger (id INTEGER PRIMARY KEY, txn TEXT, account TEXT, amount INT);
''')

def pay(idem_key, order_id, amount, psp_ok=True):
    row = db.execute('SELECT status FROM payments WHERE idem_key = ?',
            (idem_key,)).fetchone()
    if row:
        return f'{order_id}: duplicate request, returning stored result {row[0]}'
    with db:
        if not psp_ok:
            db.execute('INSERT INTO payments VALUES (?, ?, ?, ?)', (idem_key, order_id,
                    amount, 'FAILED'))
            return f'{order_id}: FAILED'
        db.execute('INSERT INTO payments VALUES (?, ?, ?, ?)', (idem_key, order_id, amount,
                'CAPTURED'))
        db.executemany('INSERT INTO ledger (txn, account, amount) VALUES (?, ?, ?)',
                       [(idem_key, 'customer_card', -amount), (idem_key, 'merchant_payable',
                               amount)])
    return f'{order_id}: CAPTURED {amount}'

print(pay('k1', 'order-1', 49900))
print(pay('k1', 'order-1', 49900))                       # client retry after a timeout
print(pay('k2', 'order-2', 15000, psp_ok=False))
print(pay('k3', 'order-3', 120000))
total = db.execute('SELECT SUM(amount) FROM ledger').fetchone()[0]
balances = db.execute('SELECT account, SUM(amount) FROM ledger GROUP BY account ORDER BY '
        'account').fetchall()
print('ledger entries:', db.execute('SELECT COUNT(*) FROM ledger').fetchone()[0],
      '| sum of all entries (must be 0):', total)
print('balances:', balances)
```

## 10.7 Smart-meter data platform (IoT)

This case study connects system design with smart energy systems. A utility has **10 million smart meters**, each reporting energy (kWh), voltage and current every **15 minutes**, plus alarms (power cut, tampering) in real time. The platform must bill customers accurately, show near-real-time usage in an app, detect outages and anomalies, and keep raw data for years for regulators and forecasting.

### Requirements

- Functional: ingest readings and alarms; daily and monthly aggregates per meter for billing; app shows today's usage within minutes; outage detection per feeder or area within a minute; forecasting and analytics on history.
- Non-functional: no reading may be lost (billing); devices are unreliable and send late, duplicate or out-of-order data; bursts when a whole area reconnects after an outage.

### Estimates

```python run Smart-meter platform estimates
from estimate import fmt_bytes
meters, interval_min, bytes_per_reading = 10_000_000, 15, 120   # id, ts, kWh, V, I, flags
per_day = meters * (24 * 60 // interval_min)
avg_rate = per_day / 86_400
storage_year = per_day * 365 * bytes_per_reading
print(f'readings per day   : {per_day:,}')
print(f'average ingest     : {avg_rate:,.0f} readings/s')
print(f'burst (all meters reconnect within 60 s after an outage): {meters / 60:,.0f} '
        f'readings/s')
print(f'raw storage / year : {fmt_bytes(storage_year)} (before compression and replication)')
print(f'with ~10x columnar compression and 3 replicas: {fmt_bytes(storage_year / 10 * 3)} '
        f'per year')
```

About 11 000 readings per second on average is modest; the design is driven by **bursts** (a whole city reconnecting), **exactly-once billing** and **years of time-series history**.

### Design

```text
meters --MQTT/DLMS--> regional head-ends / MQTT brokers --> Kafka (partition key = meter_id)
   Kafka --> stream processor (Flink / Kafka Streams)
               - dedup on (meter_id, timestamp), validation, late-data handling
               - outage detection (many meters on one feeder go silent together)
               - live aggregates -> Redis (app: "today's usage")
   Kafka --> time-series DB (TimescaleDB / Cassandra): raw 15-min readings,
               partitioned by meter_id + month, downsampled hourly and daily
   Kafka --> object storage (Parquet data lake) --> forecasting, ML
   billing service <-- daily and monthly aggregates (SQL, strongly consistent, audited)
```

### Deep dives

- **Idempotent ingestion**: the natural key `(meter_id, reading_timestamp)` makes duplicates harmless (upsert), so devices and gateways can retry freely.
- **Late and out-of-order data**: meters buffer readings while offline and send them later. Aggregations use **event time** with watermarks, and billing aggregates are recomputed when late data arrives (before the bill is finalised).
- **Outage detection**: a stream job tracks the last-seen time per meter and groups by feeder; if a large fraction of a feeder's meters miss their window together, raise a feeder-level outage, not ten thousand individual alarms.
- **Downsampling and retention**: keep 15-minute data for, say, 3 years, hourly for 10, daily forever; time-series databases do this with continuous aggregates and retention policies.

```python run Late data, duplicates and downsampling for one meter
import random
rng = random.Random(6)
# 96 readings
true = {t: round(0.2 + 0.3 * rng.random(), 3) for t in range(0, 24 * 60, 15)}
arrivals = list(true.items())
arrivals += rng.sample(arrivals, 10)                         # duplicates from retries
rng.shuffle(arrivals)                                        # out-of-order delivery
late = arrivals[-15:]   # these arrive after the first run
store = {}
for t, kwh in arrivals[:-15]:
    store[(42, t)] = kwh   # upsert on (meter_id, timestamp)
first = sum(store.values())
for t, kwh in late:
    store[(42, t)] = kwh
hourly = {}
for (_, t), kwh in store.items():
    hourly[t // 60] = hourly.get(t // 60, 0) + kwh
print(f'messages received {len(arrivals)}, distinct readings stored {len(store)} (expected '
        f'96)')
print(f'daily total before late data {first:.3f} kWh, after {sum(store.values()):.3f} kWh, '
      f'truth {sum(true.values()):.3f} kWh')
print(f'hourly downsample: {len(hourly)} points; peak hour '
        f'{max(hourly, key=hourly.get)}:00 '
      f'({max(hourly.values()):.3f} kWh)')
```

Duplicates disappear because storage is keyed by `(meter, timestamp)`; the daily total is wrong until the late readings arrive, which is why billing waits for a cut-off (or recomputes) instead of trusting the first aggregate.

| Trade-off | Choice for this platform |
|---|---|
| Consistency | Eventual for dashboards; strongly consistent, audited aggregates for billing |
| Storage engine | Write-optimised time-series / wide-column store for readings; SQL for customers, tariffs and bills |
| Processing | Streaming for alarms and live usage; batch (daily) for billing and forecasting |
| Edge versus cloud | Gateways buffer and compress data, filter noise, and survive network outages |
