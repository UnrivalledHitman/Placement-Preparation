# How to use this practice book
%20 exercises matching the Data Engineering guide, with hints kept separate and executed solutions

Each part matches chapters of the **Data Engineering** guide. Code exercises use Python with DuckDB, pyarrow and pandas (`pip install duckdb pyarrow pandas`); Spark and Airflow exercises use the same small simulations as the guide, because they need clusters to run for real. Design exercises are answered as in a data engineering interview: state the grain, the layers, the failure modes and how you would test the result.

| Type | What you do |
|---|---|
| Code | Write and run SQL or Python |
| Numerical | Calculate, then check |
| Concept | Explain the trade-off |
| Debug | Find the defect, show it, fix it |
| Design | Plan tables or pipelines end to end |

**Marking scheme.** Mark ✓ (solved alone), ~ (with the hint) or ✗ (needed the solution). For Code and Debug, ✓ also requires that your solution is **idempotent**: running it twice gives the same result. Redo every ~ and ✗ a week later.

| Part | Guide chapters | Topic | Exercises |
|---|---|---|---|
| 1 | 1–2 | Platform and storage | 5 |
| 2 | 3–4 | Modelling and SQL | 5 |
| 3 | 5–6 | Spark and orchestration | 5 |
| 4 | 7–8 | Quality and streaming | 5 |

# Exercises

## Part 1: Platform and storage

**W1.1 · Easy · Concept · ETL or ELT?** Choose ETL or ELT, and say why, for: (a) loading 2 TB a day of clickstream into BigQuery for analysts; (b) sending card data to an analytics vendor that must never see full card numbers; (c) a team that changes its business logic every sprint.

**W1.2 · Medium · Code · Sorting helps statistics skip blocks.** Write the same million readings to Parquet twice, unsorted and sorted by `kwh`, with row groups of 50,000 rows. For the filter `kwh > 40`, count how many row groups each file must read according to their min/max statistics.

**W1.3 · Medium · Code · The small-files problem.** Write the same data as one Parquet file and as 500 small files. Compare total bytes on disk and the number of files a query must open, and explain why thousands of tiny files hurt even when the data is the same.

**W1.4 · Medium · Numerical · Choosing a partition granularity.** A table receives 240 GB of compressed Parquet per day. Engines work best with files of 128 MB to 1 GB. Compare partitioning by day, by hour and by (day, meter_id) with 50,000 meters, in partitions per year and average file size.

**W1.5 · Medium · Concept · Why a table format?** A team writes plain Parquet to S3 from two jobs and must also delete a customer's records on request (GDPR). What can go wrong, and how do Iceberg or Delta fix it?

## Part 2: Modelling and SQL

**W2.1 · Medium · Design · A star schema for food delivery.** Design the star schema for orders on a food-delivery platform: declare the grain, the fact tables, their measures, and the dimensions. Which attributes need SCD Type 2?

**W2.2 · Medium · Code · An SCD Type 2 load that is safe to rerun.** Implement a Type 2 load in DuckDB that compares several attributes (`plan`, `region`), creates new versions only for real changes, and does nothing when run a second time with the same input.

**W2.3 · Medium · Debug · Revenue doubled after a join.** A revenue report joins orders to a "customer" table that accidentally holds two rows for some customers. Show the inflated total, write a test that would have caught it, and fix the query.

**W2.4 · Medium · Code · Latest record per key with QUALIFY.** A status-history table has many rows per order. Return the latest status per order with `QUALIFY`, and count orders whose latest status is `cancelled`.

**W2.5 · Easy · Numerical · Pricing three queries.** At ₹530 per TB scanned, price: (a) `SELECT *` on a 12 TB table; (b) four columns of 120 in the same table; (c) the same four columns for one week of a table partitioned by day holding two years.

## Part 3: Spark and orchestration

**W3.1 · Easy · Numerical · How many shuffle partitions?** A stage shuffles 600 GB. You want shuffle partitions of about 200 MB, and the cluster has 400 cores. How many partitions do you configure, and how many waves of tasks does that make?

**W3.2 · Medium · Code · Salting a skewed join.** Orders join a dimension on `merchant_id`, and one merchant accounts for 30% of orders. Simulate the partition sizes of the join before and after salting the hot key into 20 sub-keys (with the dimension row replicated 20 times).

**W3.3 · Medium · Code · Hourly and weekly schedules.** An hourly DAG starts at 2026-03-01 00:00 with catch-up; a weekly DAG (Mondays) starts 2026-03-02. It is now 2026-03-09 03:30. List how many runs each has, and the data interval of the latest run of each.

**W3.4 · Medium · Debug · The backfill that loaded yesterday seven times.** A task's SQL selects `WHERE reading_date = CURRENT_DATE - 1`. The team backfills the previous seven days. Show what happens and fix it.

**W3.5 · Medium · Design · Dependencies between teams.** The analytics team's daily DAG must start only after the ingestion team's DAG has finished loading the day's data, and the ML team's feature DAG depends on analytics. Design the dependencies, and compare sensors with data-aware (dataset/asset) scheduling.

## Part 4: Quality and streaming

**W4.1 · Medium · Code · A freshness and volume monitor.** Write a monitor over a table of daily loads that flags missing days, loads older than 26 hours at check time, and days whose row count deviates strongly from the same weekday over the previous four weeks.

**W4.2 · Medium · Code · Session windows.** From click events per user (event time), build session windows with a 30-minute inactivity gap and report sessions per user and the longest session.

**W4.3 · Medium · Code · De-duplication with bounded state.** De-duplicate a stream of event IDs (duplicates arrive within 2 minutes of the original) with an unbounded set and with a set pruned by a watermark. Compare the duplicates removed and the peak state size.

**W4.4 · Medium · Design · CDC from MySQL to the lakehouse.** Design a pipeline that keeps a lakehouse copy of a MySQL `orders` table current within 5 minutes: capture, transport, apply, deletes, schema changes and ordering.

**W4.5 · Hard · Design · A data platform for ride-hailing.** Design the data platform for a ride-hailing company: sources, batch and streaming paths, storage layers, the key gold tables, quality controls and who consumes what.
