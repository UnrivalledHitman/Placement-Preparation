# Chapter 5: Spark
%Driver, executors and lazy plans, narrow and wide transformations, partitions, shuffles, skew and salting, and join strategies

## 5.1 How Spark runs a job

Apache Spark processes data too large for one machine by splitting it into **partitions** and running **tasks** on many **executors** in parallel. The **driver** turns a DataFrame program into a plan: transformations (`filter`, `select`, `join`, `groupBy`) are **lazy** and only build the plan; an **action** (`count`, `write`, `collect`) triggers execution. The Catalyst optimiser rewrites the logical plan (pushing filters down, pruning columns, choosing join strategies), and the physical plan is cut into **stages** at every **shuffle**, the point where data must be redistributed across machines by key.

```text
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.appName("daily-usage").getOrCreate()
readings = spark.read.parquet("s3://meter-lake/silver/readings/")       # lazy
meters = spark.read.parquet("s3://meter-lake/silver/meters/")           # lazy

daily = (readings
         .filter(F.col("reading_date") == "2026-03-15")                  # narrow
         .join(F.broadcast(meters), "meter_id")                # broadcast join: no shuffle
         .groupBy("region", "tariff")                          # wide: shuffle by key
         .agg(F.sum("kwh").alias("kwh"), F.countDistinct("meter_id").alias("meters")))

(daily.write.mode("overwrite").partitionBy("region")                    # action
      .parquet("s3://meter-lake/gold/daily/"))
```

| Transformation | Kind | Data movement |
|---|---|---|
| `select`, `filter`, `withColumn`, `map` | Narrow | Each output partition depends on one input partition: no shuffle |
| `groupBy().agg()`, `distinct`, `join` (non-broadcast), `repartition`, `orderBy` | Wide | Rows with the same key must meet: a **shuffle** writes data to disk and sends it over the network |

Shuffles are the main cost in most Spark jobs: they serialise, write, transfer and read data, and they create stage boundaries where every task must finish before the next stage starts.

## 5.2 Partitions and parallelism

A stage runs one task per partition. Too few partitions leave cores idle; too many add per-task scheduling overhead. The simulation runs a stage of fixed total work on 32 cores with different partition counts.

```python run Stage time against the number of partitions
import math
total_work_s, cores, overhead_s = 3200.0, 32, 0.15   # 3,200 core-seconds of real work
for partitions in [8, 32, 64, 200, 2000, 20000]:
    task = total_work_s / partitions + overhead_s
    waves = math.ceil(partitions / cores)
    stage = waves * task
    print(f'{partitions:6} partitions: {waves:4} waves of {task:7.2f} s tasks -> stage '
            f'{stage:7.1f} s')
```

With 8 partitions, 24 of the 32 cores sit idle. In this idealised model every task takes the same time, so one partition per core (32) ties for best, and 200 partitions lose a little to a partially filled last wave. Real tasks vary in size, which is why a few partitions per core usually balances better in practice: a slow task is then a smaller share of the stage. Tens of thousands of tiny tasks spend more time on overhead than on work. Spark's default of 200 shuffle partitions is a guess; **adaptive query execution** (AQE, on by default since Spark 3.2) coalesces small shuffle partitions at run time.

## 5.3 Skew and salting

When one key has far more rows than the others (a single giant customer, a `null` key, a default value), the partition holding it becomes a **straggler**: the stage waits for its single task while every other core is idle. **Salting** splits the hot key into several sub-keys by appending a random number, aggregates per sub-key, then combines the partial results in a second, much smaller aggregation.

```python run Skewed aggregation before and after salting
import numpy as np
rng = np.random.default_rng(210)
rows = np.concatenate([rng.integers(1, 2001, 4_000_000),     # ordinary meters
                       np.full(2_000_000, 0)])               # key 0: unknown meter id
partitions = 64

def task_sizes(keys):
    return np.bincount(keys % partitions, minlength=partitions)

plain = task_sizes(rows)
salt = rng.integers(0, 32, len(rows))
# only the hot key is salted
salted_keys = np.where(rows == 0, rows * 1000 + salt * 7919 + 1, rows)
salted = task_sizes(salted_keys)
for name, sizes in [('plain', plain), ('salted hot key', salted)]:
    ratio = sizes.max() / np.median(sizes)
    print(f'{name:15} largest task {sizes.max():9,} rows, median {int(np.median(sizes)):7,}')
    print(f'{"":15} stage time ~ largest / median = {ratio:5.1f}x a typical task')
```

Salting turns one 2-million-row task into many small ones, so the stage takes about as long as a typical task instead of dozens of times longer. Alternatives: filter or handle the hot key separately (often `null` keys should be dropped or treated apart), enable AQE's **skew join** handling, or pre-aggregate before joining.

## 5.4 Join strategies

| Strategy | How | When |
|---|---|---|
| Broadcast hash join | Send the small table to every executor; join locally with no shuffle of the big table | One side fits in memory (default threshold 10 MB; often raised to hundreds of MB) |
| Sort-merge join | Shuffle both sides by the join key, sort, merge | Both sides large; the default for big-to-big joins |
| Shuffle hash join | Shuffle both sides, build a hash table per partition | Medium-sized build side |

```python run Network bytes moved by a shuffle join versus a broadcast join
fact_gb, dim_mb, executors = 500.0, 80.0, 100
shuffle_gb = fact_gb + dim_mb / 1000   # both sides redistributed by key
broadcast_gb = dim_mb / 1000 * executors   # the small table copied to every executor
print(f'sort-merge join moves about {shuffle_gb:7.1f} GB across the network')
print(f'broadcast join moves about  {broadcast_gb:7.1f} GB (the dimension, {executors} '
        f'times)')
for dim_gb in [0.08, 2, 20]:
    print(f'  dimension of {dim_gb:5.2f} GB: broadcast moves {dim_gb * executors:7.1f} GB '
          f'-> {"broadcast" if dim_gb * executors < fact_gb else "shuffle"} is cheaper')
```

Broadcasting is cheap only while the small side stays small: at 20 GB, copying it to 100 executors moves more data than shuffling the fact table, and it may not fit in memory at all.

## 5.5 Common performance fixes

| Symptom | Likely cause | Fix |
|---|---|---|
| One task runs for an hour, the rest finish in seconds | Skewed key | Salting, AQE skew join, handle hot or null keys separately |
| Thousands of tiny output files | Too many partitions at write time | `coalesce` before writing, or AQE; compact tables regularly |
| Executors run out of memory | Huge partitions, `collect()` to the driver, wide rows | More partitions, avoid collecting, select fewer columns |
| Slow Python UDFs | Row-by-row Python serialisation | Built-in functions, or vectorised pandas UDFs (Arrow) |
| The same DataFrame recomputed in several actions | Lineage replayed each time | `cache()` or `persist()` it, then unpersist |
| Full scans on partitioned data | Filter not on the partition column, or wrapped in a function | Filter directly on the partition column |

## 5.6 Practical lessons

- Transformations are lazy; stages are cut at shuffles; a stage runs one task per partition.
- Size partitions to a few per core; let AQE coalesce small shuffle partitions.
- Detect skew from task-time distributions; salt hot keys or handle them separately.
- Broadcast small tables; prefer built-in functions over Python UDFs; avoid tiny files.

# Chapter 6: Orchestration with Airflow
%DAGs and operators, data intervals and the logical date, catch-up and backfills, idempotent tasks and retries

## 6.1 DAGs, tasks and operators

**Apache Airflow** schedules **DAGs** (directed acyclic graphs) of **tasks**. Each task is an instance of an **operator** (run Python, run SQL, start a Spark job, call an API) or a **sensor** (wait for a file, a partition or another DAG). The scheduler decides which task instances are ready; executors run them on workers. The MLOps guide, Chapter 4, explains pipelines and caching in general; this chapter is about Airflow's scheduling model, which confuses almost everyone at first.

```text
from datetime import datetime, timedelta
from airflow import DAG
from airflow.providers.common.sql.operators.sql import SQLExecuteQueryOperator
from airflow.sensors.external_task import ExternalTaskSensor

with DAG(
    dag_id="daily_usage",
    schedule="@daily",
    start_date=datetime(2026, 3, 1),
    catchup=True,
    default_args={"retries": 2, "retry_delay": timedelta(minutes=10)},
) as dag:
    wait = ExternalTaskSensor(task_id="wait_for_ingest", external_dag_id="ingest_readings")
    build = SQLExecuteQueryOperator(
        task_id="build_daily_usage",
        sql="""DELETE FROM gold.daily_usage WHERE usage_date = '{{ ds }}';
               INSERT INTO gold.daily_usage
               SELECT meter_id, '{{ ds }}', sum(kwh) FROM silver.readings
               WHERE reading_ts >= '{{ data_interval_start }}'
                 AND reading_ts < '{{ data_interval_end }}'
               GROUP BY meter_id""")
    wait >> build
```

## 6.2 Data intervals and the logical date

A scheduled run **processes a data interval** and starts **after that interval ends**. The run for 15 March (its **logical date**, `{{ ds }}` in templates) covers 15 March 00:00 to 16 March 00:00, so it starts shortly after midnight on 16 March. With `catchup=True`, a DAG whose start date lies in the past creates a run for every missed interval.

```python run Which runs exist, and when they start
from datetime import datetime, timedelta

def scheduled_runs(start, now, every=timedelta(days=1), catchup=True):
    runs, begin = [], start
    while begin + every <= now:                              # an interval must be complete
        runs.append((begin, begin + every))
        begin += every
    return runs if catchup else runs[-1:]

now = datetime(2026, 3, 5, 9, 30)
for catchup in [True, False]:
    runs = scheduled_runs(datetime(2026, 3, 1), now, catchup=catchup)
    print(f'catchup={catchup}: {len(runs)} run(s)')
    for start, end in runs:
        print(f'  logical date {start:%Y-%m-%d}: data {start:%m-%d %H:%M} to '
                f'{end:%m-%d %H:%M}, '
              f'eligible from {end:%m-%d %H:%M}')
```

On 5 March at 09:30 there is no run for 5 March yet: its data interval is not over. This model is why templates such as `{{ data_interval_start }}` exist: the task should select data by the interval it is responsible for, never by "now", so that a run executed late (or rerun months later in a backfill) processes exactly the same data.

## 6.3 Idempotent tasks

Tasks are retried after failures and rerun in backfills, so running a task twice for the same interval must give the same result as running it once. The classic bug is **appending** results: every rerun adds another copy.

```python run Append versus overwrite-partition on rerun
import duckdb
con = duckdb.connect()
con.execute('CREATE TABLE readings AS SELECT * FROM (VALUES (1, DATE \'2026-03-15\', '
        '10.0), (2, DATE \'2026-03-15\', 7.5), (1, DATE \'2026-03-16\', 9.0)) t(meter_id, '
                'd, kwh)')
con.execute('CREATE TABLE daily_append (d DATE, kwh DOUBLE); CREATE TABLE daily_overwrite '
        '(d DATE, kwh DOUBLE)')

def run_append(ds):
    con.execute(f"INSERT INTO daily_append SELECT d, sum(kwh) FROM readings WHERE d = DATE "
            f"'{ds}' GROUP BY d")

def run_overwrite(ds):
    con.execute('BEGIN')
    con.execute(f"DELETE FROM daily_overwrite WHERE d = DATE '{ds}'")
    con.execute(f"INSERT INTO daily_overwrite SELECT d, sum(kwh) FROM readings WHERE d = "
            f"DATE '{ds}' GROUP BY d")
    con.execute('COMMIT')

for attempt in range(3):                                     # original run plus two retries
    run_append('2026-03-15'); run_overwrite('2026-03-15')
for table in ['daily_append', 'daily_overwrite']:
    rows, total = con.sql(f'SELECT count(*), sum(kwh) FROM {table}').fetchone()
    print(f'{table:16} after 3 runs: {rows} row(s) for 2026-03-15, total kWh {total}')
```

The overwrite version deletes and rewrites exactly its own partition inside one transaction, so retries, reruns and backfills are safe. Other idempotent patterns are `MERGE` on a natural key, and writing to a new location then atomically swapping it in.

## 6.4 Operating Airflow well

| Practice | Why |
|---|---|
| Tasks select data by `data_interval_start`/`end`, never by the current time | Reruns and backfills process the same data |
| Every task idempotent (overwrite its partition, or MERGE) | Retries are safe |
| Keep heavy work out of the scheduler: tasks call Spark, SQL engines or containers | Airflow is an orchestrator, not a processing engine |
| Sensors in reschedule mode, or deferrable operators | Waiting tasks do not occupy worker slots |
| `max_active_runs` and pools | Backfills do not overwhelm the warehouse |
| SLAs or freshness alerts on outputs | Late data is noticed before users notice it |
| Dynamic task mapping for per-region or per-file work | One task definition expands at run time |
| Small XComs only (IDs, paths) | XCom lives in the metadata database |

| Alternative | Distinguishing idea |
|---|---|
| Dagster | Software-defined **assets**: the DAG is derived from which tables depend on which, with freshness tracking |
| Prefect | Python-native flows, dynamic by default, simple local development |
| dbt (with any scheduler) | SQL transformations as models with dependencies, tests and documentation; the "T" in ELT |
| Cloud schedulers (Cloud Composer, MWAA) | Managed Airflow |

## 6.5 Practical lessons

- A run processes a data interval and starts after it ends; the logical date names the interval.
- Select data by the interval, never by "now"; make every task idempotent.
- Use catch-up and backfills deliberately, with concurrency limits.
- Airflow orchestrates; heavy computation belongs in Spark, SQL engines or containers.
