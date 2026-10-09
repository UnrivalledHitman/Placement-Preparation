## Part 3 solutions

### W3.1 How many shuffle partitions?

600 GB / 200 MB = **3,000 partitions**. With 400 cores, 3,000 / 400 = 7.5, so **8 waves**, the last one half full. Rounding the partition count to a multiple of the cores (3,200 partitions of about 190 MB) fills every wave. With adaptive query execution, setting a generous initial number and letting AQE coalesce small partitions achieves the same thing automatically (`spark.sql.adaptive.advisoryPartitionSizeInBytes` sets the target size).

### W3.2 Salting a skewed join

```python run Partition sizes of a skewed join before and after salting
import numpy as np
rng = np.random.default_rng(241)
n_orders, merchants, salts, partitions = 3_000_000, 5000, 20, 200
hot = 42
merchant = np.where(rng.random(n_orders) < 0.30, hot, rng.integers(1, merchants + 1,
        n_orders))

def partition_rows(fact_keys, dim_keys):
    rows = np.bincount(fact_keys % partitions, minlength=partitions)
    rows += np.bincount(dim_keys % partitions, minlength=partitions)   # dimension side too
    return rows

dim = np.arange(1, merchants + 1)
before = partition_rows(merchant, dim)
salt = rng.integers(0, salts, n_orders)
fact_salted = np.where(merchant == hot, merchant * 1000 + salt * 37, merchant)
# hot row x20
dim_salted = np.concatenate([dim[dim != hot], hot * 1000 + np.arange(salts) * 37])
after = partition_rows(fact_salted, dim_salted)
for name, rows in [('before salting', before), ('after salting', after)]:
    print(f'{name:15} largest partition {rows.max():9,} rows, median '
            f'{int(np.median(rows)):7,} '
          f'-> {rows.max() / np.median(rows):5.1f}x')
print(f'dimension rows: {len(dim):,} before, {len(dim_salted):,} after (hot merchant '
        f'replicated {salts}x)')
```

The hot merchant's 900,000 orders land in one partition before salting, so one task does almost ninety times the work of a typical task. After salting, its orders spread over 20 sub-keys of about 45,000 rows each, each matched by a copy of the single dimension row: the largest partition falls to about five times the median. More salts (say 100) would bring it close to the median, at the cost of more dimension copies. The cost is a slightly larger dimension; salting more sub-keys than needed only adds copies. (If the dimension is small, a broadcast join avoids the shuffle and the skew entirely.)

### W3.3 Hourly and weekly schedules

```python run Runs for an hourly and a weekly DAG
from datetime import datetime, timedelta

def runs(start, now, every):
    out, begin = [], start
    while begin + every <= now:
        out.append((begin, begin + every)); begin += every
    return out

now = datetime(2026, 3, 9, 3, 30)
for name, start, every in [('hourly', datetime(2026, 3, 1), timedelta(hours=1)),
                           ('weekly (Mondays)', datetime(2026, 3, 2), timedelta(weeks=1))]:
    r = runs(start, now, every)
    s, e = r[-1]
    print(f'{name}: {len(r)} runs')
    print(f'  latest logical date {s:%Y-%m-%d %H:%M}')
    print(f'  data interval {s:%m-%d %H:%M} to {e:%m-%d %H:%M}')
```

The hourly DAG has 8 days × 24 runs plus the three complete hours of 9 March (195); the 03:00–04:00 interval is not over yet. The weekly DAG has exactly one run, for the week starting Monday 2 March, which became eligible at midnight on 9 March. Note that in Airflow the logical date of that run is 2 March, though it ran on 9 March: dashboards labelled "week of 9 March" for it would be off by one interval. (Real deployments must also choose a time zone: `start_date` should be timezone-aware, or daily intervals shift with daylight-saving changes.)

### W3.4 The backfill that loaded yesterday seven times

```python run Selecting by the current date versus by the data interval
import duckdb
from datetime import date, timedelta
con = duckdb.connect()
con.execute("CREATE TABLE readings AS SELECT DATE '2026-03-01' + CAST(i % 10 AS INTEGER) "
        "AS d, 1.0 AS kwh FROM range(1000) t(i)")
con.execute('CREATE TABLE wrong (logical_date DATE, d DATE, kwh DOUBLE); CREATE TABLE '
        'right_ (logical_date DATE, d DATE, kwh DOUBLE)')
today = date(2026, 3, 10)                                    # the day the backfill runs
for k in range(7, 0, -1):
    logical = today - timedelta(days=k)
    con.execute(f"INSERT INTO wrong SELECT DATE '{logical}', d, sum(kwh) FROM readings "
                f"WHERE d = DATE '{today}' - 1 GROUP BY d")   # CURRENT_DATE - 1
    con.execute(f"DELETE FROM right_ WHERE logical_date = DATE '{logical}'")
    con.execute(f"INSERT INTO right_ SELECT DATE '{logical}', d, sum(kwh) FROM readings "
                # data interval
                f"WHERE d >= DATE '{logical}' AND d < DATE '{logical}' + 1 GROUP BY d")
print('using CURRENT_DATE - 1 :',
        con.sql('SELECT DISTINCT d FROM wrong ORDER BY d').fetchall(),
      f"loaded {con.sql('SELECT count(*) FROM wrong').fetchone()[0]} times")
loaded = [str(r[0]) for r in con.sql('SELECT d FROM right_ ORDER BY d').fetchall()]
print('using the data interval:', loaded[0], 'to', loaded[-1])
print(f'  {len(loaded)} distinct days loaded')
```

Every backfill run computes "yesterday" from the wall clock, so all seven runs load 9 March, and the seven days that needed loading are never touched. The fix is to select by the run's data interval (`{{ data_interval_start }}` and `{{ data_interval_end }}`) and to overwrite the run's own partition, so any run, at any time, processes exactly its interval.

### W3.5 Dependencies between teams

| Approach | How | Trade-off |
|---|---|---|
| Matching schedules ("ingestion at 01:00, analytics at 03:00") | Hope the first finishes in time | Breaks silently on slow days; the most common anti-pattern |
| Sensors (`ExternalTaskSensor`) | Analytics waits for the ingestion DAG's task for the same logical date | Explicit; needs aligned schedules and logical dates; waiting sensors should use reschedule or deferrable mode |
| Data-aware scheduling (Airflow datasets/assets, Dagster assets) | Ingestion declares it updates `silver.readings`; analytics is triggered when that dataset is updated; ML is triggered by `gold.daily_usage` | Dependencies follow the data, not the clock; easy to add new consumers; requires producers to declare outputs |

Recommended: data-aware triggers between teams, with freshness checks on the datasets themselves (so a consumer can see that the data it depends on is late), and SLAs owned by each producing team. Within one team's DAG, ordinary task dependencies remain the simplest choice.

## Part 4 solutions

### W4.1 A freshness and volume monitor

```python run Missing days, stale loads and weekday-aware volume checks
import numpy as np, pandas as pd
rng = np.random.default_rng(242)
days = pd.date_range('2026-02-01', '2026-03-14', freq='D')
weekday_factor = np.where(days.dayofweek >= 5, 0.7, 1.0)
loads = pd.DataFrame({'day': days, 'rows': (100_000 * weekday_factor * rng.normal(1, 0.02,
        len(days))).round(),
                      'loaded_at': days
                              + pd.Timedelta(hours=26) - pd.to_timedelta(rng.integers(0, 3,
                              len(days)), 'h')})
loads = loads[loads.day != '2026-03-05']                     # a missing day
loads.loc[loads.day == '2026-03-11', 'rows'] = 51_000          # a partial load
check_time = pd.Timestamp('2026-03-15 07:00')

missing = sorted(set(pd.date_range(days.min(), days.max())) - set(loads.day))
print('missing days:', [d.strftime('%Y-%m-%d') for d in missing])
latest = loads.loaded_at.max()
print(f'latest load {latest:%m-%d %H:%M}, age at check '
        f'{(check_time - latest).total_seconds() / 3600:.0f} h, '
      f'stale: {(check_time - latest) > pd.Timedelta(hours=26)}')
series = loads.set_index('day').rows
for day in series.index[series.index >= '2026-03-01']:
    same_weekday = [series.get(day - pd.Timedelta(weeks=k)) for k in range(1, 5)]
    base = np.nanmedian([v for v in same_weekday if v is not None])
    if abs(series[day] / base - 1) > 0.2:
        print(f'{day:%Y-%m-%d} ({day:%a}): {series[day]:,.0f} rows vs typical {base:,.0f} '
                f'-> ALERT')
```

Comparing each day with the same weekday removes the weekend dip that would otherwise trigger an alert every Saturday. The missing day and the partial load are both caught, and the freshness check confirms the latest load is recent.

### W4.2 Session windows

```python run Sessions with a 30-minute inactivity gap
import numpy as np, pandas as pd
rng = np.random.default_rng(243)
rows = []
for user in ['u1', 'u2', 'u3']:
    t = pd.Timestamp('2026-03-15 08:00')
    for _ in range(rng.integers(20, 40)):
        t += pd.Timedelta(minutes=float(rng.choice([1, 2, 3, 5, 45, 120], p=[0.3, 0.25, 0.2,
                0.15, 0.06, 0.04])))
        rows.append((user, t))
# arrival order shuffled
clicks = pd.DataFrame(rows, columns=['user', 'ts']).sample(frac=1, random_state=0)
clicks = clicks.sort_values(['user', 'ts'])
gap = clicks.groupby('user').ts.diff() > pd.Timedelta(minutes=30)
clicks['session'] = gap.groupby(clicks.user).cumsum()
sessions = clicks.groupby(['user', 'session']).ts.agg(['min', 'max', 'count'])
sessions['minutes'] = (sessions['max'] - sessions['min']).dt.total_seconds() / 60
print(sessions.groupby('user').agg(sessions=('count', 'size'), clicks=('count', 'sum'),
                                   longest_min=('minutes', 'max')).round(1))
```

Sessions are defined by event time per user, so the shuffled arrival order does not matter once events are sorted. In a streaming engine, a session window stays open until the watermark passes its last event plus the gap; sessions can also **merge** when a late event fills a gap between two of them, which is why session windows are the most expensive window type to maintain.

### W4.3 De-duplication with bounded state

```python run Unbounded versus watermark-bounded de-duplication state
import numpy as np
rng = np.random.default_rng(244)
n = 50_000
event_time = np.sort(rng.uniform(0, 3600, n))
ids = np.arange(n)
dup_idx = rng.choice(n, 2000, replace=False)
stream = list(zip(event_time, ids)) + [(event_time[i] + rng.uniform(0, 120), ids[i])
        for i in dup_idx]
stream.sort()   # arrival roughly in event-time order

def dedup(bounded, horizon=120.0):
    seen, removed, peak, max_t = {}, 0, 0, 0.0
    for t, eid in stream:
        max_t = max(max_t, t)
        if bounded:
            watermark = max_t - horizon
            for old in [k for k, v in seen.items()
                    if v < watermark] if len(seen) > 5000 else []:
                del seen[old]
        if eid in seen:
            removed += 1
        else:
            seen[eid] = t
        peak = max(peak, len(seen))
    return removed, peak

for bounded in [False, True]:
    removed, peak = dedup(bounded)
    print(f'{"watermark-bounded" if bounded else "unbounded":17}: duplicates removed '
            f'{removed:5}, peak state {peak:6,} ids')
```

Both remove every duplicate, because no duplicate arrives more than 2 minutes after its original. The unbounded set grows with every event forever (here 50,000 entries after one hour; in production, millions per hour until memory runs out). Pruning IDs older than the watermark keeps the state proportional to the duplicate horizon. The pruning here runs only when the set exceeds a threshold, to keep the toy simple; real engines expire state with timers.

### W4.4 CDC from MySQL to the lakehouse

| Stage | Design |
|---|---|
| Capture | Debezium MySQL connector reads the binlog (row format, GTIDs on) and emits one change event per row change: before, after, operation, source position |
| Transport | Kafka topic `mysql.shop.orders`, keyed by primary key so all changes to one order stay in order within a partition; schema registry for the event schema |
| Apply | A streaming job (Flink, Spark Structured Streaming, or a Kafka Connect sink) MERGEs micro-batches into an Iceberg/Delta `orders` table every 1–2 minutes |
| Ordering | Within a key, apply events in binlog order; across a micro-batch, keep only the latest change per key (by binlog position) before merging |
| Deletes | Debezium emits delete events (and tombstones); MERGE deletes the row (or sets a soft-delete flag if history is needed) |
| Schema changes | Additive columns flow through the schema registry and table-format schema evolution; breaking changes need a coordinated version |
| Initial load | Debezium's snapshot mode reads the existing table, then switches to the binlog without gaps |
| Monitoring | Lag from binlog position to table commit, row-count reconciliation against MySQL daily, dead-letter topic for bad events |

### W4.5 A data platform for ride-hailing

| Area | Design |
|---|---|
| Sources | Trip service (OLTP), payments, driver app location pings (high volume), rider app events, pricing service, support tickets |
| Streaming path | Kafka; Flink jobs for real-time supply-demand per zone (surge pricing inputs), ETA features, fraud signals, live operations dashboards |
| Batch path | CDC from OLTP databases and raw event landing to bronze; Spark/dbt builds silver and gold daily and hourly |
| Storage | Iceberg tables on object storage (bronze, silver, gold), partitioned by date, clustered by city |
| Key gold tables | `fact_trip` (one row per trip: fare, distance, duration, wait time), `fact_payment`, `fact_driver_hour` (supply snapshot), dimensions for rider, driver (SCD2: vehicle, tier), city, zone, date |
| Quality | Contracts with service teams on event schemas; dbt tests; reconciliation of trips to payments; freshness SLAs per table |
| Consumers | Analysts (warehouse SQL, dashboards), data scientists (feature store fed from gold and streaming), finance (reconciled payments), ML pricing and ETA models (online features) |
| Governance | PII (phone numbers, exact locations) tokenised or coarsened in silver; access by role; deletion requests via table-format deletes |
