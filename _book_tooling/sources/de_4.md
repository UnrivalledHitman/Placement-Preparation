# Chapter 9: Case Study: a Meter-Data Platform
%Bronze, silver and gold layers built end to end, an incremental daily run, tests, and a safe rerun

## 9.1 The requirements

A utility collects readings from 50,000 smart meters every 15 minutes, sent through a gateway as JSON. Analysts need daily consumption per meter and per region by 07:00 each morning; the billing team needs corrected totals; data scientists need clean history for forecasting. Readings arrive late, duplicated (gateways retry) and occasionally malformed.

| Layer | Table | Rule |
|---|---|---|
| Bronze | `bronze_readings` | Raw payloads exactly as received, with load time and source file; append-only |
| Silver | `silver_readings` | Typed, validated, de-duplicated on (meter, timestamp); rejected rows kept in a quarantine table |
| Gold | `gold_daily_usage`, `gold_region_daily` | Daily facts per meter and per region, rebuilt per day partition |

## 9.2 One day through the pipeline

```python run Bronze to silver to gold with DuckDB, with tests and a rerun
import json, duckdb, numpy as np
rng = np.random.default_rng(230)
con = duckdb.connect()
con.execute("SET threads = 1; SET memory_limit = '1GB'")
con.execute('CREATE TABLE bronze_readings (payload VARCHAR, loaded_at TIMESTAMP, '
        'source_file VARCHAR)')
con.execute('''CREATE TABLE silver_readings (meter_id VARCHAR, reading_ts TIMESTAMP,
               kwh DOUBLE,
               PRIMARY KEY (meter_id, reading_ts))''')
con.execute('CREATE TABLE quarantine (payload VARCHAR, reason VARCHAR)')
con.execute('CREATE TABLE gold_daily_usage (usage_date DATE, meter_id VARCHAR, kwh DOUBLE, '
        'readings INTEGER)')
con.execute("CREATE TABLE dim_meter AS SELECT 'MTR-' || lpad(CAST(i AS VARCHAR), 4, '0') "
        "AS meter_id, "
            "['north','south','east','west'][1 + i % 4] AS region FROM range(1, 201) t(i)")

def gateway_payloads(day):
    rows = []
    for m in range(1, 201):
        for q in range(96):   # one reading every 15 minutes
            ts = f'{day} {q // 4:02d}:{q % 4 * 15:02d}:00'
            rows.append(json.dumps({'meter': f'MTR-{m:04d}', 'ts': ts,
                    'kwh': round(float(rng.gamma(2, 0.06)), 4)}))
    dupes = [rows[i] for i in rng.choice(len(rows), 300, replace=False)]   # gateway retries
    bad = ['{"meter": "MTR-0007", "ts": "not-a-time", "kwh": 0.1}',
            '{"meter": "MTR-0008", "kwh": -3}']
    return rows + dupes + bad

def load_bronze(day):
    con.executemany('INSERT INTO bronze_readings VALUES (?, now(), ?)',
                    [(p, f'gw-{day}.jsonl') for p in gateway_payloads(day)])

def build_silver(day):
    con.execute(f'''CREATE OR REPLACE TEMP TABLE parsed AS
        SELECT payload, json_extract_string(payload, '$.meter') AS meter_id,
               TRY_CAST(json_extract_string(payload, '$.ts') AS TIMESTAMP) AS reading_ts,
               TRY_CAST(json_extract_string(payload, '$.kwh') AS DOUBLE) AS kwh
        FROM bronze_readings WHERE source_file = 'gw-{day}.jsonl' ''')
    con.execute('''INSERT INTO quarantine SELECT payload,
        CASE WHEN reading_ts IS NULL THEN 'bad or missing timestamp' ELSE 'negative kwh' END
        FROM parsed WHERE reading_ts IS NULL OR kwh < 0''')
    con.execute('''INSERT OR REPLACE INTO silver_readings
        SELECT DISTINCT meter_id, reading_ts, kwh FROM parsed
        WHERE reading_ts IS NOT NULL AND kwh >= 0''')

def build_gold(day):   # idempotent: rebuild this day only
    con.execute('BEGIN')
    con.execute(f"DELETE FROM gold_daily_usage WHERE usage_date = DATE '{day}'")
    con.execute(f'''INSERT INTO gold_daily_usage
        SELECT CAST(reading_ts AS DATE), meter_id, round(sum(kwh), 4), count(*)
        FROM silver_readings
        WHERE CAST(reading_ts AS DATE) = DATE '{day}' GROUP BY ALL''')
    con.execute('COMMIT')

def tests(day):
    checks = {
        'gold: one row per meter per day': f'''SELECT meter_id FROM gold_daily_usage
            WHERE usage_date = DATE '{day}' GROUP BY meter_id HAVING count(*) > 1''',
        'gold: 96 readings per meter': f'''SELECT * FROM gold_daily_usage
            WHERE usage_date = DATE '{day}' AND readings <> 96''',
        'gold: every meter known': f'''SELECT g.meter_id FROM gold_daily_usage g
            LEFT JOIN dim_meter d USING (meter_id) WHERE d.meter_id IS NULL''',
    }
    return {name: len(con.sql(sql).fetchall()) for name, sql in checks.items()}

day = '2026-03-15'
load_bronze(day); build_silver(day); build_gold(day)
print('bronze rows    :', con.sql('SELECT count(*) FROM bronze_readings').fetchone()[0])
print('silver rows    :', con.sql('SELECT count(*) FROM silver_readings').fetchone()[0],
        '(duplicates collapsed)')
print('quarantined    :',
        con.sql('SELECT reason, count(*) FROM quarantine GROUP BY ALL ORDER BY 1').fetchall())
for name, failures in tests(day).items():
    print(f'test {name:34}: {failures} failures')
total_before = con.sql('SELECT round(sum(kwh), 3) FROM gold_daily_usage').fetchone()[0]
build_silver(day); build_gold(day)                             # an accidental rerun
total_after = con.sql('SELECT round(sum(kwh), 3) FROM gold_daily_usage').fetchone()[0]
print(f'gold total kWh before rerun {total_before}, after rerun {total_after} (idempotent: '
        f'{total_before == total_after})')
print(con.sql('''SELECT d.region, round(sum(g.kwh), 1) AS kwh, count(*) AS meters
                 FROM gold_daily_usage g JOIN dim_meter d USING (meter_id)
                 GROUP BY ALL ORDER BY d.region''').fetchdf().to_string(index=False))
```

The bronze table keeps everything, including 300 retried duplicates and two malformed payloads. Silver parses with `TRY_CAST` (malformed values become `NULL` instead of failing the job), routes bad records to quarantine with a reason, and collapses duplicates through the primary key. Gold is rebuilt per day inside a transaction, so the accidental rerun changes nothing; the tests confirm the grain and completeness of the day's data before anyone queries it. (The rerun also re-quarantines the two bad payloads; a production pipeline would key quarantine rows by source file and line to keep that idempotent too.)

## 9.3 From the toy to production

| Concern | Production choice |
|---|---|
| Ingestion | Gateways publish to Kafka; a connector writes bronze files to object storage every few minutes |
| Storage | Iceberg or Delta tables on object storage, partitioned by reading date |
| Silver and gold builds | Spark or warehouse SQL (dbt models), one partition per run |
| Orchestration | Airflow DAG per day: sensor on bronze completeness, silver, tests, gold, tests, publish |
| Late readings | Silver upserts accept late data; gold rebuilds the last 3 days every run (a rolling correction window) |
| Real-time view | A streaming job computes provisional 15-minute regional totals from Kafka; the daily batch is the corrected truth |
| Quality | dbt tests, volume anomaly checks, quarantine rate alerting, data contract with the gateway team |
| Cost | Compact small files daily; cluster gold by meter; pre-aggregate region tables for dashboards |

## 9.4 Practical lessons

- Keep raw data immutable in bronze; parse defensively and quarantine bad records with reasons.
- De-duplicate on natural keys in silver; rebuild gold per partition inside a transaction.
- Test grain, completeness and references before publishing; make every step safe to rerun.
- Handle late data with a rolling correction window; combine streaming freshness with batch truth.

# Chapter 10: Question Bank and Cheat Sheet
%Interview questions with the core of a good answer, and one-page reminders

## 10.1 Platform, storage and modelling

| Question | Core of a good answer |
|---|---|
| OLTP versus OLAP? | Many small keyed reads and writes on row storage versus large scans and aggregations on columnar storage; normalised versus dimensional schemas |
| ETL versus ELT? | Transform before loading versus load raw then transform in the warehouse; ELT keeps raw data and makes rebuilds easy |
| Lake, warehouse, lakehouse? | Cheap open files; managed fast SQL; open files plus a table format for ACID, time travel and schema evolution |
| Why is Parquet fast for analytics? | Columnar: read only needed columns; encoded and compressed per column; row-group statistics allow skipping |
| How do you partition a table? | By the main filter column (usually date); large files; avoid high-cardinality keys; cluster or sort within partitions |
| What do Delta and Iceberg add to Parquet? | Transaction log or snapshots: atomic commits, concurrent writers, time travel, schema evolution, MERGE |
| Star versus snowflake schema? | Denormalised dimensions around a fact (fewer joins, simpler) versus normalised dimensions (less duplication) |
| What is the grain? | Exactly what one fact row represents; declared first; one fact table per grain |
| SCD Type 1 versus Type 2? | Overwrite (history lost) versus new row with validity dates and current flag; join facts as of their date |
| Semi-additive measures? | Balances and inventories: sum across entities but not across time; use period-end or averages |

## 10.2 Processing and orchestration

| Question | Core of a good answer |
|---|---|
| Narrow versus wide transformations? | Each output partition from one input partition versus requiring a shuffle by key |
| What is a shuffle and why is it expensive? | Redistributing data by key across executors: serialisation, disk and network; creates stage boundaries |
| How do you fix data skew? | Detect from task times; salt hot keys and aggregate in two steps; handle nulls separately; AQE skew joins |
| Broadcast or sort-merge join? | Broadcast when one side fits in memory (no shuffle of the big side); sort-merge for big-to-big |
| How many partitions? | A few per core; large enough to avoid overhead; AQE coalesces shuffle partitions |
| Why are Python UDFs slow? | Row-by-row serialisation between JVM and Python; use built-ins or vectorised pandas UDFs |
| What is Airflow's logical date? | The start of the data interval a run processes; the run starts after the interval ends |
| How do you make a task idempotent? | Overwrite its own partition in a transaction, or MERGE on a key; select data by interval, never by now |
| How do you backfill safely? | Same code, interval-based selection, idempotent writes, concurrency limits, validate outputs |
| Airflow versus dbt? | Orchestrator of arbitrary tasks versus SQL transformation framework with dependencies and tests; often used together |

## 10.3 Quality and streaming

| Question | Core of a good answer |
|---|---|
| How do you test data? | Unique, not null, accepted values, relationships, freshness, volume and distribution checks on every important table |
| What is a data contract? | Producer-owned agreement on schema, semantics, quality, freshness and change rules, enforced in the producer's CI |
| Event time versus processing time? | When it happened versus when it was seen; aggregate by event time for correct results |
| What is a watermark? | The engine's estimate that older events will not arrive; closes windows; trades completeness for latency |
| How do you handle late data? | Allowed lateness, side outputs, rolling batch corrections; never silently drop without counting |
| How do you get exactly-once results? | At-least-once delivery plus idempotent upserts by event ID or transactional sinks committing output with offsets |
| What is CDC? | Streaming inserts, updates and deletes from a database, ideally log-based (Debezium); apply with MERGE |
| Lambda versus kappa architecture? | Separate batch and streaming paths versus one streaming engine that also reprocesses history |

## 10.4 Cheat sheet

| Topic | Remember |
|---|---|
| Layers | Bronze raw and immutable; silver clean and de-duplicated; gold modelled for consumers |
| Storage | Parquet, columnar, row groups with min/max; partition by date; avoid small files |
| Table formats | Delta, Iceberg, Hudi: ACID, time travel, schema evolution, MERGE |
| Modelling | Grain first; facts and dimensions; date dimension; SCD2 with as-of joins; additivity |
| Engines | Columnar, vectorised, pruning, MPP; read plans; pre-aggregate; approximate with care |
| Spark | Lazy plans; stages at shuffles; partitions per core; salt skew; broadcast small tables |
| Airflow | Data intervals; logical date; catch-up; idempotent partition writes; sensors deferrable |
| Quality | dbt-style tests; robust volume baselines; contracts; lineage |
| Streaming | Event time; windows; watermarks trade completeness for latency; idempotent sinks; CDC |
