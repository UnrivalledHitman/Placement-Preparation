# Chapter 7: Data Quality, Tests and Contracts
%Tests on every table, freshness and volume checks, data contracts between teams, and lineage

## 7.1 Test the data, not just the code

Pipelines can succeed and still publish wrong numbers: a duplicated load, a broken join that drops rows, an upstream column that started arriving empty. The MLOps guide, Chapter 3, validates batches with Pandera schemas inside Python steps. In warehouse pipelines, the same idea is usually expressed as **SQL tests on tables**, as popularised by dbt: each test is a query that returns the offending rows, and a test passes when it returns none.

| Test | Query idea | Catches |
|---|---|---|
| `unique` | Keys appearing more than once | Duplicate loads, fan-out joins |
| `not_null` | Rows where a required column is null | Broken extracts and joins |
| `accepted_values` | Values outside an allowed set | New or misspelt categories |
| `relationships` | Foreign keys with no matching dimension row | Orphans, late-arriving dimensions |
| Freshness | Newest timestamp older than allowed | Stalled pipelines |
| Volume | Row count far from the recent norm | Partial loads, duplicated loads |

```python run A dbt-style test suite in SQL
import duckdb
con = duckdb.connect()
con.execute("SET threads = 1")
con.execute('''CREATE TABLE dim_meter AS SELECT * FROM (VALUES
    ('MTR-1', 'north'), ('MTR-2', 'south'), ('MTR-3', 'east')) t(meter_id, region)''')
con.execute('''CREATE TABLE fact_usage AS SELECT * FROM (VALUES
    ('MTR-1', DATE '2026-03-15', 9.5, 'ok'), ('MTR-2', DATE '2026-03-15', 8.1, 'ok'),
    ('MTR-2', DATE '2026-03-15', 8.1, 'ok'),                    -- duplicated load
    ('MTR-3', DATE '2026-03-15', NULL, 'ok'),                   -- missing measure
    ('MTR-9', DATE '2026-03-15', 7.0, 'ok'),                    -- unknown meter
    ('MTR-1', DATE '2026-03-16', 9.9, 'estimatd')               -- misspelt status
    ) t(meter_id, usage_date, kwh, status)''')

tests = {
    'unique (meter_id, usage_date)': '''SELECT meter_id, usage_date FROM fact_usage
                                        GROUP BY ALL HAVING count(*) > 1''',
    'not_null kwh': 'SELECT * FROM fact_usage WHERE kwh IS NULL',
    'accepted_values status': "SELECT * FROM fact_usage WHERE status NOT IN ('ok', "
            "'estimated', 'faulty')",
    'relationships meter_id -> dim_meter': '''SELECT f.* FROM fact_usage f
                                              LEFT JOIN dim_meter d USING (meter_id)
                                              WHERE d.meter_id IS NULL''',
    'freshness (data within 2 days of 2026-03-17)': '''SELECT max(usage_date) FROM fact_usage
                                                       HAVING max(usage_date)
                                                              < DATE '2026-03-17' - 2''',
}
for name, sql in tests.items():
    failures = con.sql(sql).fetchall()
    print(f'{"PASS" if not failures else "FAIL":4}  {name:45} {len(failures)} failing '
            f'row(s)')
```

Each defect is caught by exactly the test designed for it. In dbt, these tests are declared in YAML next to each model and run after every build; a failing `error`-severity test stops downstream models from building, so bad data does not propagate to dashboards.

## 7.2 Volume and distribution anomalies

Some failures produce perfectly valid rows, just the wrong number of them. Comparing each day's row count (or total) with recent history catches partial and duplicated loads.

```python run Flagging days whose row count is far from the recent norm
import numpy as np
rng = np.random.default_rng(220)
counts = rng.normal(100_000, 1_500, 30).round()
counts[[9, 22]] = [61_000, 199_800]   # a partial load and a double load
for day in range(14, 30):
    window = counts[day - 14:day]
    med = np.median(window)
    mad = np.median(np.abs(window - med)) * 1.4826           # robust standard deviation
    z = (counts[day] - med) / mad
    if abs(z) > 5:
        print(f'day {day:2}: {counts[day]:9,.0f} rows, robust z = {z:+7.1f} -> ALERT')
print('days checked: 14-29; all other days within normal range')
```

The median and the median absolute deviation are used instead of the mean and standard deviation so that an anomaly inside the 14-day window does not distort the baseline. (Day 9's partial load falls before the checked range, but it would have been flagged the same way.) Seasonal data needs a seasonal baseline, such as the same weekday over recent weeks.

## 7.3 Data contracts

A **data contract** is an agreement between the team producing data (often an application team emitting events or owning a database) and the teams consuming it: the schema, the meaning of each field, quality guarantees, freshness, and how changes are announced. Contracts move quality to the source: breaking changes are caught in the producer's CI, not discovered in a broken dashboard a week later.

| Contract element | Example |
|---|---|
| Schema | `meter_id: string, required`; `kwh: decimal(10,3) ≥ 0`; `reading_ts: timestamp UTC` |
| Semantics | "`kwh` is consumption since the previous reading, not a cumulative register value" |
| Quality | Duplicates below 0.01%; nulls in `kwh` below 0.1% |
| Freshness | 99% of readings available within 15 minutes |
| Evolution rules | Additive changes allowed; removing or retyping a field needs a new version and a deprecation period |
| Ownership | Producing team, on-call channel, escalation |

Schema registries (for Kafka topics; see the Kafka and Stream Processing guide) enforce the schema part automatically by rejecting incompatible changes.

## 7.4 Lineage

**Lineage** records which tables and columns each dataset was derived from. It answers "which dashboards break if this column changes?" and "where did this wrong number come from?". Tools build it by parsing SQL and pipeline definitions (dbt docs, OpenLineage with Marquez, DataHub, warehouse-native lineage). Combined with tests, lineage turns a data incident into a bounded search instead of a guessing game.

## 7.5 Practical lessons

- Test every important table: unique keys, not null, accepted values, relationships, freshness.
- Watch volumes and distributions with robust, seasonal baselines.
- Agree data contracts with producers; catch breaking changes in their CI.
- Keep lineage so you know what a change or an incident affects.

# Chapter 8: Streaming ETL
%Event time and processing time, windows, watermarks and late data, de-duplication, exactly-once sinks and change data capture

## 8.1 Event time versus processing time

Every event has an **event time** (when it happened, set by the device) and a **processing time** (when the pipeline sees it). Mobile devices go offline, networks delay, and partitions of a stream are consumed at different speeds, so events arrive **out of order**. Results grouped by processing time change with load and outages; results grouped by event time describe what actually happened.

| Window type | Shape | Example |
|---|---|---|
| Tumbling | Fixed, non-overlapping | Readings per meter per 15 minutes |
| Sliding (hopping) | Fixed length, overlapping (window of 10 minutes every minute) | Moving average of demand |
| Session | Activity separated by gaps of inactivity | User sessions in an app |

## 8.2 Watermarks and late data

A streaming engine cannot wait forever for late events, but it must not close a window too early either. A **watermark** is the engine's estimate that no more events older than time *W* will arrive; it usually trails the maximum event time seen by a configured delay. When the watermark passes a window's end, the window's result is emitted (and its state can be freed). Events that arrive after that are **late**: they are dropped, sent to a side output, or used to update the result if the engine allows a further **allowed lateness**.

```python run Windows by processing time and by event time with two watermarks
import numpy as np
from collections import Counter
rng = np.random.default_rng(221)
n = 3000
event_t = np.sort(rng.uniform(0, 600, n))                    # 10 minutes of events
delay = rng.exponential(4, n)                                 # most arrive within seconds
very_late = rng.random(n) < 0.03
delay[very_late] += rng.uniform(60, 180, very_late.sum())     # a few arrive minutes late
arrival = event_t + delay
order = np.argsort(arrival)
truth = Counter((event_t // 60).astype(int))
by_processing = Counter((arrival // 60).astype(int))

def event_time_windows(watermark_delay):
    emitted, open_w, closed, emit_lag = Counter(), Counter(), set(), []
    dropped, max_seen = 0, -1.0
    for i in order:                                           # events in arrival order
        w = int(event_t[i] // 60)
        max_seen = max(max_seen, event_t[i])
        if w in closed:
            dropped += 1
            continue
        open_w[w] += 1
        for win in list(open_w):
            # watermark passed the window end
            if (win + 1) * 60 <= max_seen - watermark_delay:
                emitted[win] = open_w.pop(win); closed.add(win)
                # result delay after the window end
                emit_lag.append(arrival[i] - (win + 1) * 60)
    emitted.update(open_w)   # end of stream flushes the rest
    return emitted, dropped, np.mean(emit_lag)

results = {wd: event_time_windows(wd) for wd in (30, 200)}
print('minute  truth  processing  event+wm30s  event+wm200s')
for m in range(10):
    print(f'{m:6}  {truth[m]:5}  {by_processing[m]:10}  {results[30][0][m]:11}  '
            f'{results[200][0][m]:12}')
err = lambda c: sum(abs(c[m] - truth[m]) for m in range(10))
print(f'total absolute error: processing {err(by_processing)}, wm30s '
        f'{err(results[30][0])}, '
      f'wm200s {err(results[200][0])}')
for wd, (_, dropped, lag) in results.items():
    print(f'watermark {wd:3} s: {dropped} late events dropped, results emitted {lag:5.1f} '
            f's after window end')
```

Processing-time windows mis-assign events that arrive in a later minute than they happened, so counts are wrong in both directions. Event-time windows with a 30-second watermark never put an event in the wrong minute, but they drop the 3% of events that arrive minutes late, so every window undercounts slightly, and the total error ends up similar. A 200-second watermark waits long enough for even the very late events and reproduces the true counts, at the price of emitting each result minutes after its window ends. That is the core trade-off of streaming, between completeness and latency. Production pipelines often combine a short watermark for fast, provisional results with allowed lateness or a later batch correction for the final numbers.

## 8.3 De-duplication and exactly-once results

Producers retry, so streams contain duplicates (the Kafka and Stream Processing guide covers delivery semantics in depth). End-to-end exactly-once **results** come from combining an at-least-once stream with **idempotent** or **transactional** sinks:

| Technique | How |
|---|---|
| Idempotent upserts | Write each event keyed by its event ID (`MERGE`/upsert); a duplicate overwrites itself |
| De-duplication state | Keep seen event IDs for a bounded time (the watermark bounds how long) |
| Transactional writes | Commit output and consumer offsets atomically (Kafka transactions, Flink two-phase commit sinks) |
| Deterministic windows | Re-processing the same events produces the same window results |

```python run Duplicates double-count; an upsert by event id does not
import duckdb, numpy as np
rng = np.random.default_rng(222)
events = [(f'e{i}', 'MTR-1', round(float(rng.gamma(2, 0.5)), 3)) for i in range(1000)]
# producer retries
retried = events + [events[i] for i in rng.choice(1000, 40, replace=False)]
con = duckdb.connect()
con.execute('CREATE TABLE append_sink (event_id VARCHAR, meter_id VARCHAR, kwh DOUBLE)')
con.execute('CREATE TABLE upsert_sink (event_id VARCHAR PRIMARY KEY, meter_id VARCHAR, kwh '
        'DOUBLE)')
con.executemany('INSERT INTO append_sink VALUES (?, ?, ?)', retried)
con.executemany('INSERT OR REPLACE INTO upsert_sink VALUES (?, ?, ?)', retried)
true_total = round(sum(e[2] for e in events), 3)
for t in ['append_sink', 'upsert_sink']:
    rows, total = con.sql(f'SELECT count(*), round(sum(kwh), 3) FROM {t}').fetchone()
    print(f'{t:12} rows {rows:5}, total kWh {total:8} (true {true_total})')
```

## 8.4 Change data capture

**Change data capture** (CDC) streams every insert, update and delete from an operational database into the platform, so analytical copies stay current without heavy nightly extracts.

| Approach | How | Trade-off |
|---|---|---|
| Query-based | Poll `WHERE updated_at > last_seen` | Simple; misses deletes and intermediate updates; loads the source |
| Log-based (Debezium) | Read the database's replication log (MySQL binlog, PostgreSQL WAL) and publish change events to Kafka | Captures every change including deletes, low overhead; more infrastructure |
| Outbox pattern | The application writes events to an outbox table in the same transaction as its data; CDC publishes the outbox | Domain events that are consistent with the database (Advanced Back-end guide) |

Downstream, change events are applied to the lakehouse with `MERGE` (upsert and delete by primary key), ideally to a table format that supports row-level changes (Chapter 2).

## 8.5 Practical lessons

- Group by event time; processing-time results change with load and outages.
- Watermarks trade completeness for latency; route late events instead of silently losing them.
- Get exactly-once results from at-least-once streams plus idempotent or transactional sinks.
- Use log-based CDC (or the outbox pattern) to keep analytical copies of operational data current.
