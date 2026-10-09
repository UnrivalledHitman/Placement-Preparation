# Chapter 3: Modelling a Warehouse
%Facts and dimensions, declaring the grain, star schemas, slowly changing dimensions and point-in-time joins

## 3.1 Dimensional modelling

Operational schemas are normalised to make writes safe. Analytical schemas are organised around **business processes** for easy, fast reading (Kimball's dimensional modelling):

| Concept | Meaning | Example (energy utility) |
|---|---|---|
| Fact table | One row per event or measurement at a declared **grain**, with numeric measures and foreign keys | `fact_daily_usage`: one row per meter per day, with `kwh` and `cost` |
| Dimension table | Descriptive context used to filter and group | `dim_customer`, `dim_meter`, `dim_date`, `dim_tariff` |
| Grain | Exactly what one fact row represents; declared **first** | "One row per meter per calendar day" |
| Star schema | Fact table in the middle, denormalised dimensions around it | Simple joins, fast aggregations |
| Snowflake schema | Dimensions normalised into sub-dimensions | Less duplication, more joins |

> TRAP: Mixing grains in one fact table (some rows daily, some monthly) makes every sum wrong. Declare the grain, and build a separate fact table for each grain.

## 3.2 A star schema in DuckDB

```python run Building a small star schema and querying it
import duckdb, numpy as np, pandas as pd
con = duckdb.connect('warehouse.duckdb')
con.execute("SET threads = 1; SET memory_limit = '1GB'")
rng = np.random.default_rng(201)
con.execute('DROP TABLE IF EXISTS fact_daily_usage; DROP TABLE IF EXISTS dim_meter; DROP '
        'TABLE IF EXISTS dim_date')
meters = pd.DataFrame({'meter_key': range(1, 501), 'meter_id': [f'MTR-{i:05d}'
        for i in range(1, 501)],
                       'region': rng.choice(['north', 'south', 'east', 'west'], 500),
                       'meter_type': rng.choice(['smart', 'legacy'], 500, p=[0.7, 0.3])})
con.execute('CREATE TABLE dim_meter AS SELECT * FROM meters')
con.execute('''CREATE TABLE dim_date AS
    SELECT CAST(strftime(d, '%Y%m%d') AS INTEGER) AS date_key, d AS full_date,
           dayname(d) AS day_name, month(d) AS month, (dayofweek(d) IN (0, 6)) AS is_weekend
    FROM range(DATE '2026-01-01', DATE '2026-04-01', INTERVAL 1 DAY) t(d)''')
con.execute('SELECT setseed(0.42)')                        # reproducible random()
con.execute('''CREATE TABLE fact_daily_usage AS
    SELECT m.meter_key, d.date_key,
           round(8 + 4 * random() + CASE WHEN d.is_weekend THEN 3 ELSE 0 END, 2) AS kwh
    FROM dim_meter m CROSS JOIN dim_date d''')
for t in ['dim_meter', 'dim_date', 'fact_daily_usage']:
    print(t, con.execute(f'SELECT count(*) FROM {t}').fetchone()[0], 'rows')
print(con.sql('''
    SELECT m.region, d.is_weekend, round(avg(f.kwh), 2) AS avg_kwh, count(*) AS meter_days
    FROM fact_daily_usage f
    JOIN dim_meter m USING (meter_key)
    JOIN dim_date d USING (date_key)
    WHERE m.meter_type = 'smart' AND d.month = 2
    GROUP BY ALL ORDER BY m.region, d.is_weekend''').fetchdf().head(4).to_string(index=False))
```

The fact table holds only keys and measures; every question ("weekend usage of smart meters in February by region") is a join to dimensions plus a filter and a group by. A **date dimension** looks redundant but pays for itself: weekends, holidays, fiscal periods and billing cycles become columns instead of repeated date logic in every query.

## 3.3 Slowly changing dimensions

Customers move, change tariffs and switch plans. How the dimension records such changes decides whether historical reports stay correct:

| Type | How | History | Example use |
|---|---|---|---|
| Type 0 | Never change | Original value only | Date of birth |
| Type 1 | Overwrite | Lost; history reports show today's value | Correcting a typo |
| Type 2 | Add a new row with validity dates and a current flag | Full | Tariff, region, segment: anything reports group by |
| Type 3 | Add a "previous value" column | One step | Rarely used |

With Type 2, each version of a customer gets its own surrogate key and validity interval, and facts join to **the version valid at the time of the fact** (a point-in-time join).

```python run Applying an SCD Type 2 change and joining facts as of their date
import duckdb
con = duckdb.connect()
con.execute("SET threads = 1")
con.execute('''CREATE TABLE dim_customer (customer_key INTEGER, customer_id VARCHAR,
               plan VARCHAR,
               valid_from DATE, valid_to DATE, is_current BOOLEAN)''')
con.execute('''INSERT INTO dim_customer VALUES
    (1, 'C-17', 'standard', DATE '2025-01-01', DATE '9999-12-31', true),
    (2, 'C-42', 'standard', DATE '2025-01-01', DATE '9999-12-31', true)''')
con.execute("CREATE TABLE changes AS SELECT 'C-17' AS customer_id, 'solar' AS plan, DATE "
        "'2026-02-15' AS changed_on")

# step 1: close the current version of every changed customer
con.execute('''UPDATE dim_customer SET valid_to = c.changed_on - 1, is_current = false
               FROM changes c
               WHERE dim_customer.customer_id = c.customer_id AND dim_customer.is_current
                 AND dim_customer.plan <> c.plan''')
# step 2: insert the new version with a new surrogate key
con.execute('''INSERT INTO dim_customer
               SELECT (SELECT max(customer_key) FROM dim_customer) + row_number() OVER (),
                      c.customer_id, c.plan, c.changed_on, DATE '9999-12-31', true
               FROM changes c''')
dim = con.sql('SELECT * FROM dim_customer ORDER BY customer_id, valid_from').fetchdf()
print(dim.to_string(index=False))

con.execute('''CREATE TABLE bills AS SELECT * FROM (VALUES
    ('C-17', DATE '2026-01-31', 1420.0), ('C-17', DATE '2026-02-28', 1180.0),
    ('C-17', DATE '2026-03-31', 960.0), ('C-42', DATE '2026-03-31', 1500.0))
    t(customer_id, bill_date, amount)''')
print(con.sql('''
    SELECT d.plan, count(*) AS bills, sum(b.amount) AS revenue
    FROM bills b JOIN dim_customer d
      ON b.customer_id = d.customer_id AND b.bill_date BETWEEN d.valid_from AND d.valid_to
    GROUP BY d.plan ORDER BY d.plan''').fetchdf().to_string(index=False))
```

C-17's January bill stays attributed to the standard plan, while the February and March bills belong to the solar plan, because each bill joins to the customer version valid on its date. With Type 1, all three would have moved to "solar", and last quarter's revenue by plan would silently change every time a customer switched.

## 3.4 Additive, semi-additive and non-additive measures

| Measure type | Example | Can be summed across |
|---|---|---|
| Additive | kWh consumed, revenue | Every dimension, including time |
| Semi-additive | Account balance, inventory level, number of active meters | Some dimensions, **not time** (use the last value or the average per period) |
| Non-additive | Ratios, percentages, averages | Nothing: recompute from additive parts (sum of numerator / sum of denominator) |

```python run Summing a balance over days gives nonsense
import duckdb
con = duckdb.connect()
print(con.sql('''
    WITH balances(account, day, balance) AS (VALUES
        ('A', DATE '2026-03-01', 500), ('A', DATE '2026-03-02', 520),
        ('A', DATE '2026-03-03', 480), ('B', DATE '2026-03-01', 1000),
        ('B', DATE '2026-03-02', 1000), ('B', DATE '2026-03-03', 1100))
    SELECT sum(balance) AS wrong_sum_over_days,
           sum(balance) FILTER (WHERE day = DATE '2026-03-03') AS closing_balance,
           round(sum(balance) / count(DISTINCT day), 1) AS average_daily_total
    FROM balances''').fetchdf().to_string(index=False))
```

## 3.5 Practical lessons

- Declare the grain first; one fact table per grain; facts hold keys and measures.
- Use a date dimension; keep dimensions denormalised for simple star joins.
- Track attributes that reports group by with SCD Type 2 and join facts as of their date.
- Know whether a measure is additive, semi-additive or non-additive before aggregating it.

# Chapter 4: Analytical SQL Engines
%Why columnar engines are fast, reading query plans, pre-aggregation, approximate functions and paying for bytes scanned

## 4.1 Where the speed comes from

| Technique | What it does |
|---|---|
| Columnar storage | Reads only referenced columns; compresses well |
| Vectorised execution | Processes batches of thousands of values per operation, using CPU caches and SIMD instructions, instead of one row at a time |
| Pruning | Skips partitions and row groups using metadata and min/max statistics (Chapter 2) |
| Late materialisation | Filters on a few columns first, then fetches other columns only for surviving rows |
| Massively parallel processing (MPP) | Splits a scan across many cores or machines and combines partial aggregates |
| Separation of storage and compute | Cloud warehouses scale compute independently of the data in object storage |

## 4.2 Reading a plan

```python run The plan of a star join with a filter
import duckdb
con = duckdb.connect('warehouse.duckdb', read_only=True)
con.execute('SET threads = 1')
plan = con.sql('''EXPLAIN SELECT m.region, sum(f.kwh)
                  FROM fact_daily_usage f JOIN dim_meter m USING (meter_key)
                  WHERE m.meter_type = 'smart'
                  GROUP BY m.region''').fetchall()[0][1]
import re
operators = re.findall(r'(HASH_GROUP_BY|HASH_JOIN|SEQ_SCAN|PROJECTION|FILTER)', plan)
print('operators, top to bottom:')
print('  ' + ', '.join(operators))
print('filter applied while scanning dim_meter:', "meter_type='smart'" in plan.replace(' ',
        ''))
```

The engine scans the small dimension with the filter pushed into the scan, builds a hash table from it, then streams the large fact table through a **hash join** and aggregates. Reading a plan answers the usual questions: is the filter pushed down, which side builds the hash table (it should be the smaller one), and is anything scanned that need not be.

## 4.3 Making queries cheaper

```python run Exact versus approximate distinct counts
import time, duckdb
con = duckdb.connect()
con.execute("SET threads = 1; SET memory_limit = '1GB'")
exact = con.sql("SELECT count(DISTINCT meter_id) FROM 'readings.parquet'").fetchone()[0]
approx = con.sql("SELECT approx_count_distinct(meter_id) FROM 'readings.parquet'")
approx = approx.fetchone()[0]
print(f'exact distinct meters {exact:,}; HyperLogLog estimate {approx:,} '
        f'({approx / exact - 1:+.2%})')
con.execute('''CREATE TABLE monthly_region AS
    SELECT strftime(reading_date, '%Y-%m') AS month, region,
           sum(kwh) AS kwh, count(*) AS readings
    FROM 'readings.parquet' GROUP BY ALL''')
rows = con.execute('SELECT count(*) FROM monthly_region').fetchone()[0]
print(f'pre-aggregated table: {rows} rows instead of 1,000,000; dashboards query this '
        f'instead')
```

An honest surprise: DuckDB's estimate is about 10% low. HyperLogLog's error shrinks with the number of registers in the sketch, and DuckDB uses a small, fast sketch; warehouses offer more precise variants (HLL++ with a configurable precision). Always measure the error on your own data before putting approximate counts on a dashboard, and never use them where exact numbers matter (billing).

| Technique | Use when | Trade-off |
|---|---|---|
| Pre-aggregated tables, materialised views | Dashboards repeat the same group-bys | Must be refreshed; storage |
| Partitioning and clustering | Queries filter on a few columns | Choice must match query patterns |
| Approximate functions (HyperLogLog, quantile sketches) | Distinct counts and percentiles over huge data | Bounded error that depends on the sketch size (about 10% here) |
| Selecting only needed columns | Always | None; `SELECT *` is the most common waste |
| Denormalising hot joins | A join repeated by every query | Update cost and duplication |

## 4.4 Paying for bytes

Cloud warehouses charge for compute time (Snowflake, Redshift) or for **bytes scanned** (BigQuery on-demand). With byte pricing, query design is cost design.

```python run What a query costs when billed by bytes scanned
price_per_tb = 6.25 * 85                                    # illustrative, in rupees
table_tb, columns = 4.0, 50
scenarios = {
    'SELECT * over the whole table': table_tb,
    'three columns, whole table': table_tb * 3 / columns,
    'three columns, one day of a 365-day partitioned table': table_tb * 3 / columns / 365,
}
for name, tb in scenarios.items():
    print(f'{name:55} {tb * 1000:8.1f} GB scanned, Rs {tb * price_per_tb:9,.2f}')
```

Selecting fewer columns and filtering on the partition column cut the cost by more than four orders of magnitude here. Most warehouse budgets are blown by a few dashboards running `SELECT *` on unpartitioned tables every few minutes.

## 4.5 Practical lessons

- Columnar storage, vectorised execution, pruning and parallelism make analytical engines fast.
- Read plans: filters pushed into scans, small side building the hash table, nothing extra scanned.
- Pre-aggregate repeated queries; use approximate functions where small errors are acceptable.
- With byte-based pricing, column selection and partition filters are cost controls.
