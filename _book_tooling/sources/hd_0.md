# How to use this guide
%What a system design round looks like, the framework to follow, and how this book builds it up

A **high-level design (HLD)** round asks you to design a large system in about 45 minutes: a URL shortener, a chat app, a news feed, a ride-hailing backend. There is no single right answer. The interviewer is grading how you **reason**: whether you clarify requirements, estimate scale, choose components for stated reasons, and talk honestly about trade-offs and failure.

This guide gives you the building blocks (Chapters 1–8) and then applies them to thirteen case studies (Chapters 9–10). Wherever a claim can be checked with numbers, a short **Python simulation** checks it: cache hit ratios, consistent-hashing balance, retry storms, replication lag, quorum overlap, feed fan-out costs. Every output shown was produced by running the code.

> NOTE: Several topics were introduced in earlier books and are only referenced here: load-balancing algorithms and TLS (Computer Networks guide, Chapter 8), replication, quorums, CAP and 2PC (DBMS Theory guide, Chapter 9), and object-level design (Low-Level Design guide). This book builds on them at the level of whole systems.

## The interview framework

| Step | Time | What you produce | Typical questions to ask or answer |
|---|---|---|---|
| 1. Requirements | 5 min | 3–5 functional requirements; non-functional requirements (scale, latency, availability, consistency) | "Read-heavy or write-heavy?", "Is eventual consistency acceptable?" |
| 2. Estimates | 5 min | QPS (average and peak), storage, bandwidth, cache size | Back-of-envelope numbers that drive the design (Chapter 2) |
| 3. API | 3–5 min | The main endpoints with parameters and responses | `POST /urls {long_url} → {short_code}` |
| 4. Data model | 5 min | Entities, keys, the database choice and why | SQL or NoSQL? What is the partition key? |
| 5. High-level design | 10 min | A diagram: clients, load balancer, services, caches, databases, queues | Walk one read and one write through it |
| 6. Deep dives | 10–15 min | Two or three hard parts in detail | Hot keys, consistency, fan-out, failure handling |
| 7. Bottlenecks and trade-offs | 5 min | What breaks first at 10× scale, and what you would change | Single points of failure, monitoring, cost |

## What interviewers grade

| Signal | Strong | Weak |
|---|---|---|
| Problem scoping | Narrows the problem with explicit requirements | Designs everything at once |
| Quantitative reasoning | Estimates drive decisions ("2 TB a year fits on one node; no sharding yet") | Numbers that are never used |
| Component choice | Names a component and the reason ("Kafka for replayable fan-out") | Buzzwords without reasons |
| Trade-offs | States what each choice costs | Presents every choice as free |
| Depth | Can go deep on two areas when asked | Stays at box-drawing level |
| Failure thinking | Asks what happens when a node, region or dependency fails | Assumes everything works |
| Communication | Drives the discussion, checks in with the interviewer | Monologue or silence |

> TIP: Write the non-functional requirements as numbers early ("100 M daily users, p99 read latency under 200 ms, 99.95% availability"). Every later decision can then point back to one of them.

## How to study this book

1. Chapters 1–2: learn the numbers (latencies, availability, estimation) until you can produce them quickly.
2. Chapters 3–8: one building block at a time. For each, know **when** to use it and **what it costs**.
3. Chapters 9–10: attempt each case study on paper for 40 minutes first, then compare.
4. Chapter 11: the question bank and the numbers to memorise.
5. Solve the **System Design Practice Book** alongside.

# Chapter 1: Fundamentals
%Latency, availability, scalability and the vocabulary of reliability

## 1.1 Latency numbers every engineer should know

These approximate figures (originally popularised by Jeff Dean, updated for modern hardware) explain most design decisions: why caches exist, why we batch, why cross-region calls are avoided in the request path.

```python run Latency numbers on a human scale
latencies_ns = [
    ('L1 cache reference', 1),
    ('Branch mispredict', 3),
    ('L2 cache reference', 4),
    ('Mutex lock/unlock', 17),
    ('Main memory reference', 100),
    ('Compress 1 KB with a fast codec', 2_000),
    ('Read 1 MB sequentially from memory', 3_000),
    ('Round trip within a datacentre', 500_000),
    ('Read 4 KB randomly from an NVMe SSD', 20_000),
    ('Read 1 MB sequentially from an SSD', 50_000),
    ('Redis GET over the local network', 200_000),
    ('Disk (HDD) seek', 5_000_000),
    ('Read 1 MB sequentially from an HDD', 1_000_000),
    ('Round trip Mumbai -> Singapore', 60_000_000),
    ('Round trip Mumbai -> California', 230_000_000),
]
def human(ns):
    for unit, size in [('s', 1e9), ('ms', 1e6), ('us', 1e3)]:
        if ns >= size:
            return f'{ns / size:.1f} {unit}'
    return f'{ns} ns'
print(f'{"operation":38}{"latency":>10}   {"if 1 ns were 1 second":>22}')
for name, ns in sorted(latencies_ns, key=lambda x: x[1]):
    secs = ns
    scale = (f'{secs / 86400:.1f} days' if secs >= 86400 else f'{secs / 3600:.1f} hours'
             if secs >= 3600 else f'{secs / 60:.1f} minutes' if secs >= 60
                     else f'{secs} second' + ('s' if secs != 1 else ''))
    print(f'{name:38}{human(ns):>10}   {scale:>22}')
```

If one nanosecond were one second, reading main memory takes under two minutes, an SSD random read about five and a half hours, and a round trip to California more than seven years. Three practical rules follow:

1. **Memory is ~100× faster than SSD, which is far faster than the network across regions.** Cache hot data in memory.
2. **Sequential beats random.** Logs, LSM trees and Kafka are built around sequential writes.
3. **Every cross-region round trip costs ~100+ ms.** Keep synchronous cross-region calls out of the user's request path.

## 1.2 Availability and the nines

Availability = uptime / total time. Each extra "nine" cuts the allowed downtime by 10×.

```python run Downtime budget per nine, and composite availability
for a in [0.99, 0.999, 0.9995, 0.9999, 0.99999]:
    down_year_min = (1 - a) * 365 * 24 * 60
    down_month_min = (1 - a) * 30 * 24 * 60
    print(f'{a:.3%} available: {down_year_min:8.1f} min/year ({down_year_min / 60:6.2f} '
            f'h), '
          f'{down_month_min:6.1f} min/month')

def series(*parts):          # every component must be up
    p = 1.0
    for x in parts: p *= x
    return p

def parallel(a, n):          # any one of n replicas is enough
    return 1 - (1 - a) ** n

print()
print(f'LB 99.99% -> app 99.9% -> DB 99.9% in series : {series(0.9999, 0.999, 0.999):.4%}')
print(f'two app replicas (each 99.9%) in parallel     : {parallel(0.999, 2):.6%}')
chain = series(0.9999, parallel(0.999, 2), parallel(0.999, 2))
print(f'LB -> 2 apps -> primary+standby DB            : {chain:.4%}')
```

Two lessons. Components **in series** multiply, so a request that depends on many services is less available than any one of them. Components **in parallel** (redundancy) multiply the *unavailabilities*, which is why every tier gets at least two replicas.

## 1.3 SLI, SLO and SLA

| Term | What it is | Example |
|---|---|---|
| SLI (indicator) | A measured quantity | Fraction of requests answered successfully in under 300 ms |
| SLO (objective) | The internal target for an SLI | 99.9% of requests under 300 ms over 30 days |
| SLA (agreement) | A contract with consequences, usually looser than the SLO | 99.5% monthly availability or the customer gets a credit |
| Error budget | 1 − SLO: how much failure is allowed | 0.1% of requests may fail or be slow; spend it on releases and experiments |

Measure latency with **percentiles**, never averages. A p99 of 800 ms means 1 in 100 requests is slower than 800 ms; for a page that makes 50 backend calls, most page loads hit at least one of those slow calls.

```python run Why averages hide tail latency
import random
rng = random.Random(1)
samples = [rng.lognormvariate(3.6, 0.5) for _ in range(100_000)]      # ms
samples += [rng.uniform(800, 1500) for _ in range(1_000)]             # 1% stragglers
samples.sort()
pct = lambda p: samples[int(p / 100 * (len(samples) - 1))]
print(f'mean {sum(samples) / len(samples):.0f} ms | p50 {pct(50):.0f} | p90 {pct(90):.0f} '
        f'| '
      f'p99 {pct(99):.0f} | p99.9 {pct(99.9):.0f} ms')
for calls in (1, 10, 50, 100):
    print(f'page with {calls:3} parallel backend calls: P(at least one >= p99) = '
            f'{1 - 0.99 ** calls:.0%}')
```

## 1.4 Scalability

| | Vertical scaling (scale up) | Horizontal scaling (scale out) |
|---|---|---|
| How | A bigger machine: more CPU, RAM, faster disks | More machines behind a load balancer |
| Pros | Simple; no distributed-systems problems | Near-unlimited growth; redundancy for free |
| Cons | Hard ceiling; expensive at the top; single point of failure | Needs stateless services, partitioned data, distributed coordination |
| Use for | Databases early on; anything stateful that is hard to split | Stateless application servers, caches, partitioned stores |

The key enabler of horizontal scaling is a **stateless** service tier: no user session or data stored in the server's memory between requests. Session data goes to a shared store (Redis) or into a signed token (JWT), so any server can handle any request and servers can be added, removed or restarted freely.

**Amdahl's law** limits speed-up from parallelism: if a fraction s of the work is serial, n machines give at most 1 / (s + (1 − s)/n). With 5% serial work, even infinite machines give at most 20×. Shared bottlenecks (one database, one lock, one coordinator) play the role of the serial part.

```python run Amdahl's law: the serial fraction caps scaling
for s in [0.01, 0.05, 0.2]:
    row = ', '.join(f'n={n}: {1 / (s + (1 - s) / n):5.1f}x' for n in [2, 8, 32, 128, 1024])
    print(f'serial {s:4.0%} -> {row}   (limit {1 / s:.0f}x)')
```

## 1.5 Practical lessons

- Know the latency ladder: memory ≪ SSD ≪ datacentre round trip ≪ cross-region round trip.
- Translate nines into downtime; remember that series dependencies multiply availability down and redundancy multiplies unavailability down.
- Specify latency targets as percentiles (p99), and remember that tail latency compounds with fan-out.
- Make services stateless so they scale horizontally; push state into purpose-built stores.

# Chapter 2: Back-of-the-Envelope Estimation
%Turning user numbers into QPS, storage, bandwidth and cache size, quickly and reusably

## 2.1 Useful constants

| Quantity | Value | Memory aid |
|---|---|---|
| Seconds per day | 86 400 | ≈ 10<sup>5</sup> (round up for safety) |
| Seconds per month | ≈ 2.6 M | 2.5 × 10<sup>6</sup> |
| 1 million requests/day | ≈ 12 requests/s | divide by 10<sup>5</sup> |
| Peak factor | 2–10× average | use 2–3× for global apps, more for spiky ones |
| Characters | 1 byte (ASCII), 1–4 bytes (UTF-8) | |
| Typical row (user, order) | 0.5–2 KB with indexes | |
| Photo (compressed) | 200 KB – 2 MB | |
| 1 minute of 720p video | ≈ 10 MB | 1.5 Mbps × 60 s ≈ 11 MB |
| One server | ≈ 1 000–10 000 simple requests/s | depends heavily on work per request |
| One Redis node | ≈ 100 000+ ops/s | |
| One SQL primary | ≈ 1 000–10 000 writes/s | with SSDs and simple rows |

## 2.2 A reusable estimator

The function below turns a handful of assumptions into the numbers an interviewer expects, and prints its working. Each case study in this book uses it.

```python run estimate.py: QPS, storage, bandwidth and cache
import sys, shutil

def fmt_bytes(b):
    for unit in ['B', 'KB', 'MB', 'GB', 'TB', 'PB']:
        if b < 1000:
            return f'{b:.1f} {unit}'
        b /= 1000
    return f'{b:.1f} EB'

def estimate(name, dau, writes_per_user, reads_per_write, object_bytes, years=5,
             peak=3, replicas=3, cache_fraction=0.2):
    writes_day = dau * writes_per_user
    reads_day = writes_day * reads_per_write
    w_qps, r_qps = writes_day / 86_400, reads_day / 86_400
    storage = writes_day * 365 * years * object_bytes * replicas
    out = {
        'write QPS (avg / peak)': f'{w_qps:,.0f} / {w_qps * peak:,.0f}',
        'read QPS (avg / peak)': f'{r_qps:,.0f} / {r_qps * peak:,.0f}',
        'new data per day': fmt_bytes(writes_day * object_bytes),
        f'storage, {years} years x{replicas} replicas': fmt_bytes(storage),
        'read bandwidth (avg)': fmt_bytes(r_qps * object_bytes) + '/s',
        f'cache for {cache_fraction:.0%} of a day\'s reads':
            fmt_bytes(reads_day * cache_fraction * object_bytes),
    }
    print(f'--- {name} ---')
    for k, v in out.items():
        print(f'  {k:34} {v}')
    return out

if __name__ == '__main__':
    shutil.copy(sys.argv[0], 'estimate.py')
    estimate('URL shortener', dau=100e6, writes_per_user=0.1, reads_per_write=100,
            object_bytes=500)
    estimate('Photo sharing', dau=50e6, writes_per_user=0.2, reads_per_write=50,
            object_bytes=500e3)
    estimate('Chat messages', dau=200e6, writes_per_user=40, reads_per_write=1.5,
            object_bytes=200)
```

How to use the output in an interview:

- **URL shortener**: about 116 writes/s and 11 600 reads/s on average. The write rate is tiny for any database; the read rate calls for a cache. Five years of data with 3 replicas is a few tens of terabytes: a sharded key-value store or a few large SQL shards.
- **Photo sharing**: storage reaches petabytes and read bandwidth gigabytes per second. Photos go to object storage behind a **CDN**; only metadata goes in a database.
- **Chat**: about 90 000 messages per second on average and nearly 280 000 at peak, each small. Choose a write-optimised, partitioned store (wide-column) and keep connections in a separate gateway tier.

> TRAP: Do not spend ten minutes on arithmetic. Round aggressively (86 400 ≈ 10<sup>5</sup>), say the assumption out loud, and use the result to make a decision. An estimate that changes no decision is wasted time.

## 2.3 How many servers?

```python run Servers needed for a target load
import math

def servers(peak_qps, qps_per_server, headroom=0.6, redundancy=2):
    n = math.ceil(peak_qps / (qps_per_server * headroom))
    return max(n, redundancy)

for name, peak, per in [('URL redirects (cached, cheap)', 35_000, 5_000),
                        ('Feed generation (heavy)', 20_000, 300),
                        ('Chat gateway (websockets, by connections)', 2_000_000, 50_000)]:
    print(f'{name:44} peak {peak:>9,} -> {servers(peak, per):4} servers')
```

`headroom = 0.6` means each server runs at most 60% busy at peak, leaving room for spikes and for one server failing. For connection-oriented services (chat, notifications), size by **concurrent connections** rather than requests per second.

## 2.4 Practical lessons

- Memorise: 1 day ≈ 10<sup>5</sup> s; 1 M/day ≈ 12/s; peak ≈ 2–3× average.
- Estimate reads and writes separately; the read/write ratio decides cache and replica strategy.
- Storage = items/day × size × days × replicas; bandwidth = QPS × size.
- Size servers with headroom, and for long-lived connections size by connections.
- Always finish an estimate with the decision it supports.
