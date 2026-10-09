# Chapter 3: Replication and Durability
%Leaders and followers, the in-sync replica set, the high watermark, acks and min.insync.replicas, and when acknowledged data can be lost

## 3.1 Leaders, followers and the ISR

Each partition has a **replication factor** (typically 3): one **leader** replica that handles all reads and writes, and **followers** that fetch from it. Followers that have caught up within `replica.lag.time.max.ms` (default 30 seconds) form the **in-sync replica set** (ISR). The **high watermark** is the highest offset replicated to every member of the ISR; consumers can read only up to it. The Distributed Systems guide, §9.2, introduces these terms; this chapter measures what each setting actually protects against.

| Producer `acks` | The leader acknowledges a write when | Risk |
|---|---|---|
| `0` | Never waits (fire and forget) | Lost on any failure, even a network blip |
| `1` | The leader has written it | Lost if the leader dies before any follower copies it |
| `all` (`-1`) | Every replica **currently in the ISR** has it | Lost only if the ISR had shrunk to the leader alone, or an out-of-sync replica becomes leader |

`min.insync.replicas` closes the gap left by `acks=all`: if the ISR is smaller than this number, the leader **refuses** `acks=all` writes (`NotEnoughReplicas`), trading availability for durability.

## 3.2 When is acknowledged data lost?

The program replays two situations on a 3-replica partition whose leader then fails **permanently** (its disk is gone), under each configuration:

- **Followers in sync but slightly behind:** replication is asynchronous, so even in-sync followers trail the leader by the last few records.
- **Followers out of the ISR:** both followers stalled (a network partition, a long GC pause) after record 60, and dropped out of the ISR.

It counts records the producer was told were written but that the new leader does not have.

```python run Lost acknowledgements after a permanent leader failure
def outcome(acks, min_isr, unclean, followers_at, followers_in_isr, written=100):
    isr_followers = 2 if followers_in_isr else 0
    if acks == '1':
        acked = written                                    # leader alone acknowledges
    elif isr_followers + 1 < min_isr:
        acked = followers_at   # writes refused once the ISR shrank
    elif isr_followers == 0:
        acked = written   # acks=all with an ISR of one: leader alone
    else:
        acked = followers_at   # waits until ISR followers have the record
    candidates = followers_at if followers_in_isr else (followers_at if unclean else None)
    if candidates is None:
        stranded = max(0, acked - followers_at)            # acked records no follower has
        return f'offline; {stranded} acked only on the dead leader'
    lost = max(0, acked - candidates)
    refused = written - acked if acks == 'all' and isr_followers + 1 < min_isr else 0
    note = f' ({refused} writes refused)' if refused else ''
    return f'{lost:3} acked lost{note}'

scenarios = [('in sync, 2 records behind', 98, True), ('out of the ISR since record 60', 60,
        False)]
configs = [('1', 1, False), ('all', 1, False), ('all', 2, False), ('all', 1, True), ('all',
        2, True)]
for name, at, in_isr in scenarios:
    print(name + ':')
    for acks, min_isr, unclean in configs:
        label = f'acks={acks}, min.insync={min_isr}, unclean={str(unclean).lower()}'
        print(f'  {label:38} -> {outcome(acks, min_isr, unclean, at, in_isr)}')
```

With `acks=1`, the leader acknowledges records its followers have not fetched, so even a healthy cluster loses the last few on a crash. `acks=all` waits for the in-sync followers, which protects the first scenario completely. In the second, the ISR has shrunk to the leader alone, so `acks=all` with `min.insync.replicas=1` acknowledges writes that exist on a single disk. With clean elections the partition goes **offline** rather than losing data immediately, but if that disk is truly gone, the data is gone; and with unclean election allowed, a stale follower becomes leader and 40 acknowledged records silently disappear. `min.insync.replicas=2` prevents both outcomes by refusing writes while only one copy would exist: the producer sees errors (unavailability) instead of a false promise of durability. That is the trade-off in one line: **durability or availability, when replicas fall behind**.

| Goal | Settings |
|---|---|
| No acknowledged data loss with one broker failure | Replication factor 3, `acks=all`, `min.insync.replicas=2`, `unclean.leader.election.enable=false` |
| Highest throughput, loss acceptable (metrics, logs) | `acks=1` (or 0), replication factor 2 or 3 |
| Survive a whole rack or zone | Rack-aware replica placement (`broker.rack`) so replicas live in different zones |

## 3.3 Leader election and placement

The **controller** (the active node of the KRaft quorum) detects broker failures, chooses new leaders from the ISR, and publishes the new metadata; clients refresh their metadata and reconnect to the new leaders, usually within seconds. **Preferred leader election** moves leadership back to each partition's first replica after a failure, so load spreads evenly again. **Rack awareness** spreads replicas across racks or availability zones, and consumers can read from a follower in their own zone (`client.rack`) to save cross-zone traffic.

## 3.4 Practical lessons

- `acks=all` waits for the current ISR, which can shrink to just the leader.
- Pair `acks=all` with `min.insync.replicas=2` and replication factor 3 to survive a broker loss without losing acknowledged data.
- Unclean leader election trades durability for availability; keep it off for important data.
- Spread replicas across zones; let consumers fetch from the closest replica.

# Chapter 4: Producers
%The record accumulator, batching and compression, retries and reordering, idempotent producers and recommended settings

## 4.1 How a producer sends

```text
Properties p = new Properties();
p.put("bootstrap.servers", "broker1:9092,broker2:9092");
p.put("key.serializer", StringSerializer.class.getName());
p.put("value.serializer", KafkaAvroSerializer.class.getName());
p.put("acks", "all");                         // default since Kafka 3.0
p.put("enable.idempotence", "true");          // default since Kafka 3.0
p.put("linger.ms", "10");                     // wait up to 10 ms to fill batches
p.put("batch.size", String.valueOf(64 * 1024));
p.put("compression.type", "zstd");
try (KafkaProducer<String, Reading> producer = new KafkaProducer<>(p)) {
    producer.send(new ProducerRecord<>("meter-readings", reading.meterId(), reading),
        (meta, err) -> { if (err != null) log.error("send failed", err); });
}
```

`send()` is asynchronous: the record is serialised, assigned a partition, and appended to a per-partition **batch** in the record accumulator. A background sender thread ships batches when they are full (`batch.size`) or when `linger.ms` has passed, one request per broker carrying batches for many partitions.

## 4.2 Batching trades latency for throughput

```python run Throughput and latency as linger.ms grows
per_request_ms, per_record_us = 2.0, 4.0   # fixed request cost, per-record cost
arrival_per_ms = 50   # 50,000 records/s offered to one partition
for linger in [0, 1, 5, 10, 50]:
    batch = max(1, arrival_per_ms * linger)
    send_ms = per_request_ms + batch * per_record_us / 1000
    capacity = batch / send_ms * 1000   # records/s one connection can push
    avg_latency = linger / 2 + send_ms
    print(f'linger.ms={linger:3}: batch ~{batch:5} records, capacity {capacity:9,.0f} '
            f'rec/s, '
          f'added latency ~{avg_latency:5.1f} ms')
```

With `linger.ms=0`, every record pays the fixed request cost, and one connection cannot keep up with 50,000 records a second. Waiting a few milliseconds fills batches, multiplies capacity, and makes compression far more effective (whole batches are compressed together). Beyond the point where capacity exceeds demand, more lingering only adds latency.

## 4.3 Retries, reordering and idempotence

Producers retry failed sends automatically. Two classic problems follow:

- **Duplicates**: the broker wrote the batch but the acknowledgement was lost; the retry writes it again.
- **Reordering**: with several requests in flight (`max.in.flight.requests.per.connection`, default 5), batch 1 fails, batch 2 succeeds, and batch 1's retry lands after batch 2.

The **idempotent producer** fixes both. The broker assigns each producer an ID, and the producer numbers every batch per partition with a **sequence number**. The broker accepts only the next expected sequence: a duplicate (already-seen sequence) is acknowledged without being written again, and an out-of-order batch is rejected and retried in order.

```python run Retries without and with an idempotent producer
import random

def run(idempotent, rng, batches=2000, in_flight=5):
    log, next_seq, pending = [], 0, list(range(batches))
    while pending:
        window, pending = pending[:in_flight], pending[in_flight:]
        retry = []
        for b in window:
            outcome = rng.random()
            written = outcome > 0.02   # 2%: request lost before the broker
            ack_lost = written and outcome < 0.04   # 2%: written, acknowledgement lost
            if written:
                if not idempotent:
                    log.append(b)
                elif b == next_seq:
                    log.append(b); next_seq += 1
                elif b < next_seq:
                    pass   # duplicate sequence: acked, not written
                else:
                    retry.append(b); continue   # gap: broker rejects out-of-order batch
            if not written or ack_lost:
                retry.append(b)
        pending = sorted(set(retry)) + pending
    dupes = len(log) - len(set(log))
    out_of_order = sum(1 for a, b in zip(log, log[1:]) if b < a)
    return len(log), dupes, out_of_order

rng = random.Random(11)
for idem in [False, True]:
    written, dupes, disorder = run(idem, rng)
    print(f'idempotence {str(idem).lower():5}: {written} written for 2000 sent, '
          f'duplicates {dupes}, inversions {disorder}')
```

Without idempotence, lost acknowledgements produce duplicates, and retries of failed batches land after later batches. With it, every batch is written exactly once and in order, while still allowing five requests in flight for throughput. Idempotence is on by default since Kafka 3.0, but it covers only retries **within one producer session** and one partition; exactly-once across a whole read-process-write pipeline needs transactions (Chapter 6).

## 4.4 Producer settings that matter

| Setting | Recommended | Why |
|---|---|---|
| `acks` | `all` | Durability with `min.insync.replicas=2` (Chapter 3) |
| `enable.idempotence` | `true` | No duplicates or reordering from retries |
| `linger.ms` / `batch.size` | 5–20 ms / 64–256 KB | Throughput and compression for a small latency cost |
| `compression.type` | `zstd` or `lz4` | Smaller network and disk use; batches compress well |
| `delivery.timeout.ms` | Above the longest expected broker outage (default 2 minutes) | How long `send` keeps retrying before reporting failure |
| Callback or `get()` on the future | Always handle errors | Fire-and-forget code silently loses data when sends finally fail |

## 4.5 Practical lessons

- `send()` batches per partition; `linger.ms` and `batch.size` trade latency for throughput.
- Retries cause duplicates and reordering unless the producer is idempotent.
- Idempotence uses producer IDs and per-partition sequence numbers; keep it on.
- Always handle send failures; set timeouts longer than realistic outages.
