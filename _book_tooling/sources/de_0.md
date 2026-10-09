# How to use this guide
%What data engineers build, what this book covers, and how its examples were run

Data engineering builds the systems that move, store and prepare data so that analysts, data scientists and ML models can use it: ingestion from databases and event streams, storage in lakes and warehouses, transformation pipelines, orchestration, data quality and streaming ETL. Data scientists meet it the moment their features come from a warehouse table; MLOps engineers meet it in every pipeline. Interviews ask: "Why is Parquet faster than CSV for analytics?", "Design a star schema for orders", "What is a shuffle in Spark and why is it expensive?", "How do you make a daily job safe to rerun?", "What is a watermark?".

This guide builds on earlier books: **DBMS Theory** (storage, indexing, query optimisation, distributed databases), **MySQL** (SQL), **MLOps** (pipelines, data validation, versioning), **Distributed Systems** (partitioning, replication, consensus) and **Kafka and Stream Processing** (the event log underneath streaming pipelines). It does not repeat them.

## How the examples were run

- **DuckDB 1.5** plays the warehouse: an in-process, columnar, vectorised SQL engine that reads and writes Parquet. Every SQL query in this book runs on it, limited to one thread and 1 GB of memory, and its results are shown.
- **pyarrow** writes and inspects Parquet files, so file sizes, row groups and statistics are real.
- **Spark and Airflow** need clusters and services, so their code is shown as text, and their mechanisms (partitions, shuffles, skew, broadcast joins, scheduling intervals, backfills) are reproduced in short Python simulations, as in the DevOps guide.

> TIP: Everything in Chapters 2–4 and 7 runs unchanged on a laptop with `pip install duckdb pyarrow pandas`. The same SQL runs, with small dialect changes, on BigQuery, Snowflake, Redshift and Spark SQL.

## Map of the guide

| Chapter | Topic | Typical interview question |
|---|---|---|
| 1 | The data platform | "ETL or ELT? Lake, warehouse or lakehouse?" |
| 2 | Storage formats and partitioning | "Why is Parquet faster than CSV for analytics?" |
| 3 | Modelling a warehouse | "Design a star schema; how do you track changing customer addresses?" |
| 4 | Analytical SQL engines | "Why are columnar engines fast? How do you speed up a slow query?" |
| 5 | Spark | "What is a shuffle? How do you fix a skewed join?" |
| 6 | Orchestration with Airflow | "What is the logical date? How do you backfill safely?" |
| 7 | Data quality, tests and contracts | "How do you stop bad data reaching dashboards?" |
| 8 | Streaming ETL | "Event time or processing time? What is a watermark?" |
| 9 | Case study: a meter-data platform | "Design the pipeline end to end" |
| 10 | Question bank and cheat sheet | Revision |

# Chapter 1: The Data Platform
%Operational versus analytical systems, batch and streaming, ETL and ELT, lakes, warehouses, lakehouses and the medallion layout

## 1.1 OLTP and OLAP

| | OLTP (operational) | OLAP (analytical) |
|---|---|---|
| Purpose | Run the business: place orders, update balances | Understand the business: revenue by region, churn trends |
| Queries | Many small reads and writes by key | Few large scans and aggregations over millions of rows |
| Storage layout | Row-oriented (whole record together) | Column-oriented (each column together) |
| Schema | Normalised (3NF) to avoid update anomalies | Denormalised (star schema) for simple, fast queries |
| Examples | MySQL, PostgreSQL, DynamoDB | BigQuery, Snowflake, Redshift, ClickHouse, DuckDB |

Running heavy analytical queries on the production OLTP database slows down the application. Data engineering exists largely to copy data out of operational systems into analytical ones, reliably and with history.

## 1.2 Batch and streaming

| | Batch | Streaming |
|---|---|---|
| Unit of work | A bounded chunk: yesterday's data, last hour's files | An unbounded sequence of events |
| Latency | Minutes to hours | Seconds or less |
| Tools | Spark, dbt, SQL in the warehouse, Airflow | Kafka, Flink, Spark Structured Streaming, Kafka Streams |
| Strengths | Simple, cheap, easy to rerun and backfill | Fresh data, real-time reactions |
| Typical use | Daily reports, ML training sets | Fraud signals, live dashboards, alerting |

Most platforms use both: a stream for freshness and a batch job that recomputes the same results from the full history for correctness (the **lambda** pattern), or a single streaming engine that can also reprocess history (**kappa**).

## 1.3 ETL and ELT

**ETL** (extract, transform, load) transforms data in a separate processing system before loading it into the warehouse. **ELT** loads raw data first and transforms it **inside** the warehouse with SQL. Cheap cloud storage and powerful warehouses made ELT the default: raw data is kept, transformations are versioned SQL (often managed with **dbt**), and any table can be rebuilt from raw data when logic changes.

## 1.4 Lake, warehouse, lakehouse

| | Data lake | Data warehouse | Lakehouse |
|---|---|---|---|
| Storage | Files (Parquet, JSON, CSV) in object storage | Managed tables in the warehouse | Open files in object storage plus a **table format** (Delta Lake, Apache Iceberg, Apache Hudi) |
| Strengths | Cheap, any data type, open | Fast SQL, transactions, governance | Lake economics with warehouse features: ACID, time travel, schema evolution |
| Weaknesses | No transactions; "data swamp" without discipline | Cost, lock-in, harder for unstructured data and ML | More components to understand |

A common layout is the **medallion** architecture:

| Layer | Contents | Rules |
|---|---|---|
| Bronze (raw) | Data exactly as received, plus load metadata | Append-only; never edited; the source of truth for rebuilds |
| Silver (clean) | Typed, de-duplicated, validated, conformed records | One row per real-world entity or event; quality checks enforced |
| Gold (serving) | Business-level tables: facts, dimensions, aggregates, features | Modelled for consumers: dashboards, ML, APIs |

## 1.5 Practical lessons

- Keep analytics off the OLTP database; copy data into column-oriented analytical systems.
- Batch for simplicity and reprocessing, streaming for freshness; many platforms need both.
- Prefer ELT: keep raw data, transform with versioned SQL, rebuild when logic changes.
- Organise data in layers (bronze, silver, gold) with clear rules for each.

# Chapter 2: Storage Formats and Partitioning
%Row versus columnar layout, Parquet's row groups and statistics, compression, partition pruning and table formats

## 2.1 Why columns win for analytics

An analytical query such as "total consumption per region last month" touches two or three columns of a table that may have fifty. In a **row** format (CSV, JSON, database pages), the engine must read every byte of every row. In a **columnar** format, it reads only the columns it needs; similar values stored together also compress far better (a `region` column with five distinct values compresses to almost nothing).

**Parquet**, the standard columnar file format, splits a file into **row groups** (for example, about a million rows each); each row group stores each column as a **column chunk**, encoded (dictionary, run-length, delta) and compressed (Snappy, Zstandard). The footer stores the schema and **statistics** (minimum, maximum, null count) for every column chunk, so engines can skip row groups that cannot match a filter.

```python run CSV versus Parquet: size, and reading only what is needed
import os
import numpy as np, pandas as pd, pyarrow as pa, pyarrow.parquet as pq

rng = np.random.default_rng(200)
n = 1_000_000
df = pd.DataFrame({
    'meter_id': rng.integers(1, 50_001, n),
    'reading_date': pd.Timestamp('2026-01-01') + pd.to_timedelta(rng.integers(0, 273, n),
            'D'),
    'region': rng.choice(['north', 'south', 'east', 'west', 'central'], n),
    'kwh': rng.gamma(2, 6, n).round(3),
    'tariff': rng.choice(['standard', 'night', 'solar'], n),
    'status': rng.choice(['ok', 'estimated', 'faulty'], n, p=[0.95, 0.04, 0.01]),
})
df.to_csv('readings.csv', index=False)
pq.write_table(pa.Table.from_pandas(df, preserve_index=False), 'readings.parquet',
               row_group_size=200_000, compression='zstd')
print(f'CSV     : {os.path.getsize("readings.csv") / 1e6:6.1f} MB')
print(f'Parquet : {os.path.getsize("readings.parquet") / 1e6:6.1f} MB (zstd)')
meta = pq.ParquetFile('readings.parquet').metadata
print(f'row groups: {meta.num_row_groups}, columns: {meta.num_columns}')
col = meta.row_group(0).column(3)
print(f'row group 0, column {col.path_in_schema}: {col.total_compressed_size / 1e3:.0f} KB '
        f'compressed, '
      f'min {col.statistics.min}, max {col.statistics.max}')
needed = sum(meta.row_group(g).column(c).total_compressed_size
             for g in range(meta.num_row_groups) for c in (2, 3))   # region and kwh chunks
print(f'bytes to read for region + kwh: CSV {os.path.getsize("readings.csv") / 1e6:.1f} MB '
        f'(every byte), '
      f'Parquet {needed / 1e6:.2f} MB')
```

To answer a question about two columns, a CSV reader must parse the whole 40 MB file; Parquet reads only the two column chunks per row group: 2.9 MB, about 7% of the CSV and under half of the Parquet file itself. That byte count, not a stopwatch, is the reason columnar formats win: less I/O and less decoding.

## 2.2 Partitioning and pruning

Large tables are split into directories by a column that queries usually filter on, most often the date: `readings/reading_month=2026-03/part-0.parquet`. This **Hive-style partitioning** lets engines skip whole directories (partition pruning) without opening a single file. Row-group statistics then skip blocks inside the remaining files.

```python run Writing a partitioned dataset and querying it with DuckDB
import os, shutil, duckdb
shutil.rmtree('readings_by_month', ignore_errors=True)
con = duckdb.connect()
con.execute("SET threads = 1; SET memory_limit = '1GB'")
con.execute('''
    COPY (SELECT *, strftime(reading_date, '%Y-%m') AS reading_month FROM 'readings.parquet')
    TO 'readings_by_month' (FORMAT parquet, PARTITION_BY (reading_month))
''')
months = sorted(os.listdir('readings_by_month'))
print(f'{len(months)} partition directories: {months[0]} ... {months[-1]}')
q = '''SELECT region, round(sum(kwh), 1) AS kwh
       FROM read_parquet('readings_by_month/*/*.parquet', hive_partitioning = true)
       WHERE reading_month = '2026-03' GROUP BY region ORDER BY kwh DESC'''
print(con.sql(q).fetchdf().to_string(index=False))
plan = con.sql('EXPLAIN ' + q).fetchall()[0][1]
for line in plan.splitlines():                          # the scan operator's own report
    if 'Scanning Files' in line or "reading_month =" in line:
        print('plan:', line.strip(' │'))
```

The query plan shows the pruning directly: the filter on `reading_month` became a **file filter**, and only 1 of the 9 partition directories was scanned.

| Partitioning rule | Why |
|---|---|
| Partition by the column most queries filter on (usually a date) | Pruning skips most of the data |
| Keep partitions large (hundreds of MB to a few GB) | Millions of tiny files make planning and listing slow (the "small files problem") |
| Avoid high-cardinality partition keys (user ID) | One directory per user means millions of tiny files |
| Use clustering or sorting within partitions for secondary filters | Row-group statistics then skip blocks for those columns too |

## 2.3 Table formats

Plain Parquet files have no transactions: two jobs writing at once can corrupt a table, and a failed job leaves half-written files. **Table formats** add a metadata layer over the files:

| Feature | How | Benefit |
|---|---|---|
| ACID transactions | A transaction log or snapshot metadata lists exactly which files make up each table version; commits are atomic | Readers never see half-written data; concurrent writers do not corrupt the table |
| Time travel | Older snapshots remain readable | Reproduce last week's training set; undo a bad load |
| Schema evolution | Add, rename or widen columns in metadata | No rewrite of old files |
| Hidden partitioning (Iceberg) | Partition transforms (day of a timestamp) recorded in metadata | Queries filter on the timestamp; the engine prunes automatically |
| Upserts and deletes (MERGE) | Rewrite or mark affected files | CDC loads and GDPR deletions |

## 2.4 Practical lessons

- Store analytical data in columnar formats (Parquet); read only the columns you need.
- Partition by the main filter column, keep files large, and sort within partitions.
- Row-group statistics let engines skip blocks that cannot match a filter.
- Use a table format (Delta, Iceberg, Hudi) for transactions, time travel and schema evolution.
