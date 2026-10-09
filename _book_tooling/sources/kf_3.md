# Chapter 7: Schemas, Retention and Compaction
%Schema registries and compatibility modes, time and size retention, and log compaction with tombstones

## 7.1 Why events need schemas

A topic is a contract between teams that may never talk to each other: the producer team changes a field, and a consumer three teams away breaks at 2 a.m. A **schema registry** (Confluent Schema Registry, Apicurio, AWS Glue) stores versioned schemas (Avro, Protobuf or JSON Schema) for each topic; producers register the schema they write with, records carry a small schema ID, and the registry **rejects** schema changes that break the configured compatibility rule.

| Compatibility mode | New schema must be readable by | Allowed changes | Upgrade order |
|---|---|---|---|
| Backward (default) | New consumers reading old data | Delete fields; add optional fields with defaults | Consumers first |
| Forward | Old consumers reading new data | Add fields; delete optional fields with defaults | Producers first |
| Full | Both | Add or delete only optional fields with defaults | Either |
| None | Nobody checks | Anything | Coordinated big bang (avoid) |

```python run A miniature compatibility checker
def backward_compatible(old, new):
    """Can a reader using `new` read data written with `old`?"""
    problems = []
    for name, spec in new.items():
        if name not in old and 'default' not in spec:
            problems.append(f'required "{name}" has no default')
        elif name in old and old[name]['type'] != spec['type']:
            problems.append(f'"{name}" retyped {old[name]["type"]} -> {spec["type"]}')
    return problems or ['compatible']

v1 = {'meter_id': {'type': 'string'}, 'kwh': {'type': 'double'}, 'ts': {'type': 'long'}}
candidates = {
    'v2: add optional "tariff" with default': {**v1, 'tariff': {'type': 'string',
            'default': 'standard'}},
    'v2: add required "region"': {**v1, 'region': {'type': 'string'}},
    'v2: change kwh to string': {**v1, 'kwh': {'type': 'string'}},
    'v2: remove "ts"': {k: v for k, v in v1.items() if k != 'ts'},
}
for name, schema in candidates.items():
    print(f'{name:40} -> {"; ".join(backward_compatible(v1, schema))}')
```

Adding an optional field with a default and removing a field are both backward compatible (a new reader fills the default, or ignores the extra field in old data); adding a required field or changing a type is rejected before any producer can deploy it. Real registries implement the full Avro or Protobuf resolution rules, including type promotions such as int to long.

## 7.2 Retention

| Setting | Meaning | Typical use |
|---|---|---|
| `retention.ms` (default 7 days) | Delete segments older than this | Event streams consumers read within days |
| `retention.bytes` (per partition) | Delete oldest segments beyond this size | Protect disks from runaway producers |
| `cleanup.policy=compact` | Keep at least the latest record per key | Changelogs, current state, configuration |
| `compact,delete` | Compact, and also delete by age | Recent state without unbounded history |
| Tiered storage (KIP-405) | Old segments move to object storage | Long retention without large broker disks |

Retention works on whole segments: a segment is deleted only when its newest record is older than the retention period, so data can survive somewhat longer than configured.

## 7.3 Log compaction

A **compacted** topic keeps, for every key, at least the most recent value, and eventually discards older values for the same key. It turns a stream of updates into a durable table that any new consumer can rebuild by reading from the beginning. A record with a key and a **null** value is a **tombstone**: it deletes the key, and is itself removed after `delete.retention.ms`.

```python run Compacting a changelog of tariff assignments
log = [  # (offset, key, value)
    (0, 'MTR-1', 'standard'), (1, 'MTR-2', 'night'), (2, 'MTR-1', 'solar'),
    (3, 'MTR-3', 'standard'), (4, 'MTR-2', None),       # tombstone: MTR-2 removed
    (5, 'MTR-1', 'night'), (6, 'MTR-4', 'solar'),
]

def compact(records, keep_tombstones=True):
    latest = {}
    for offset, key, value in records:
        latest[key] = (offset, key, value)
    kept = sorted(latest.values())
    return [r for r in kept if keep_tombstones or r[2] is not None]

after = compact(log)
print('before compaction:', len(log), 'records')
print('after compaction:')
for o, k, v in after:
    print(f'  offset {o}: {k} = {v}')
print('after tombstones expire:', [k for _, k, v in compact(log, keep_tombstones=False)])
state = {k: v for _, k, v in compact(log, keep_tombstones=False)}
print('a new consumer rebuilds the table:', state)
```

Offsets never change: compaction removes superseded records but the survivors keep their original offsets, so the log just has gaps. Order per key is preserved. Compaction runs in the background on closed segments, so the active segment may still hold several values per key; consumers must always handle repeated keys. Kafka itself uses compacted topics for `__consumer_offsets`, and Kafka Streams uses them as **changelogs** that back state stores.

## 7.4 Practical lessons

- Register schemas and enforce compatibility; add fields with defaults, never retype them.
- Upgrade consumers first for backward compatibility, producers first for forward.
- Retention deletes whole segments by age or size; tiered storage extends it cheaply.
- Compacted topics keep the latest value per key; tombstones delete keys; offsets never change.

# Chapter 8: Stream Processing
%Stateless and stateful operations, KStream and KTable, joins, state stores and changelogs, repartitioning, and Flink

## 8.1 What a stream processor adds

A plain consumer reads records and does something with each. A **stream processor** (Kafka Streams, Apache Flink, Spark Structured Streaming) adds what real applications need: aggregations and windows over time, joins between streams and tables, fault-tolerant **state**, event-time handling with watermarks (the Data Engineering guide, Chapter 8), and exactly-once processing.

| Operation | Kind | Example |
|---|---|---|
| `filter`, `map`, `flatMap` | Stateless | Drop faulty readings; convert Wh to kWh |
| `groupByKey().count()`, `aggregate`, `reduce` | Stateful | Running consumption per meter |
| Windowed aggregation | Stateful | kWh per meter per 15 minutes |
| Stream-table join | Stateful (table side) | Enrich each reading with the meter's current tariff |
| Stream-stream join | Stateful, windowed | Match a payment to its order within 30 minutes |

## 8.2 KStream and KTable

Kafka Streams models two views of a topic. A **KStream** is the sequence of events: every record is a new fact ("meter 7 used 0.4 kWh"). A **KTable** is the latest value per key, built by applying each record as an update ("meter 7's tariff is now `night`"): the stream-table duality. A compacted topic is the natural storage for a table.

```text
StreamsBuilder b = new StreamsBuilder();
KStream<String, Reading> readings = b.stream("meter-readings");
KTable<String, String> tariffs = b.table("meter-tariffs");                 // compacted topic

readings
    .filter((meter, r) -> r.kwh() >= 0)
    .join(tariffs, (r, tariff) -> new Priced(r, rate(tariff)))            // stream-table join
    .groupByKey()
    .windowedBy(TimeWindows.ofSizeWithNoGrace(Duration.ofMinutes(15)))
    .aggregate(Usage::new, (meter, p, u) -> u.add(p), Materialized.as("usage-15m"))
    .toStream()
    .to("usage-15m");
```

```python run A stream-table join: each reading priced with the tariff valid when it arrives
events = [  # topic, key, value, in arrival order
    ('tariffs', 'MTR-1', 'standard'), ('tariffs', 'MTR-2', 'night'),
    ('readings', 'MTR-1', 0.50), ('readings', 'MTR-2', 0.30),
    ('tariffs', 'MTR-1', 'solar'),                       # MTR-1 switches tariff
    ('readings', 'MTR-1', 0.40), ('readings', 'MTR-3', 0.20),
]
rates = {'standard': 7.0, 'night': 4.5, 'solar': 3.0}
table, totals = {}, {}
for topic, key, value in events:
    if topic == 'tariffs':
        table[key] = value                              # KTable: latest value per key
        continue
    tariff = table.get(key)
    if tariff is None:
        print(f'reading {key} {value} kWh: no tariff yet -> dropped by an inner join')
        continue
    cost = round(value * rates[tariff], 2)
    totals[key] = round(totals.get(key, 0) + cost, 2)    # stateful aggregation per key
    print(f'reading {key} {value} kWh at {tariff:8} -> Rs {cost}')
print('running cost per meter:', totals)
```

Each reading joins with the table's value **at the moment the reading is processed**, so MTR-1's second reading is priced at the new solar rate while the first kept the standard rate. A reading whose key has no table entry yet is dropped by an inner join (a left join would keep it with a null tariff). Joins are local, which requires **co-partitioning**: both topics must have the same number of partitions and the same key, so that a meter's readings and its tariff land on the same task.

## 8.3 State stores, changelogs and repartitioning

Stateful operations keep their state in local **state stores** (RocksDB by default) on each instance. Every change is also written to a compacted **changelog topic** in Kafka, so when an instance fails, another rebuilds the store by replaying the changelog (standby replicas keep a warm copy to make this fast). When an operation needs a different key than the input (grouping readings by region instead of meter), Kafka Streams writes the records to an internal **repartition topic** keyed by the new key: a shuffle, with the same cost as in Spark.

| Concern | Kafka Streams | Apache Flink |
|---|---|---|
| Deployment | A Java library inside your application; scale by running more instances | A separate cluster (job manager and task managers) |
| State | Local RocksDB stores backed by Kafka changelog topics | Local state with periodic distributed snapshots (checkpoints) to object storage |
| Exactly-once | Kafka transactions (`exactly_once_v2`) | Checkpoints plus transactional or idempotent sinks |
| Sources and sinks | Kafka in and out | Kafka, files, databases, many connectors |
| Event time | Windows with grace periods | Full watermark model, rich window types, CEP |
| Best for | Kafka-centric microservices | Large, complex pipelines across many systems |

## 8.4 Practical lessons

- KStream is events, KTable is latest value per key; compacted topics store tables.
- Stream-table joins use the table's current value at processing time; co-partition the inputs.
- State lives in local stores backed by changelog topics; regrouping causes repartition topics.
- Kafka Streams is a library for Kafka-to-Kafka services; Flink is a cluster engine for broader pipelines.
