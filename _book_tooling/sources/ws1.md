# Solutions
%Every query and simulation executed with DuckDB, pyarrow and pandas

## Part 1 solutions

### W1.1 ETL or ELT?

| Case | Choice | Why |
|---|---|---|
| (a) 2 TB/day clickstream into BigQuery | ELT | Load raw events cheaply, transform with SQL in the warehouse; raw data stays available to rebuild sessions or fix logic later |
| (b) Card data to an external vendor | ETL (transform before loading) | Sensitive fields must be tokenised or removed **before** the data leaves your control; the vendor must never receive raw card numbers |
| (c) Logic changing every sprint | ELT | Versioned SQL models over raw data can be changed and rebuilt; ETL would require re-extracting from sources each time |

### W1.2 Sorting helps statistics skip blocks

```python run Row groups that must be read for kwh > 40
import numpy as np, pandas as pd, pyarrow as pa, pyarrow.parquet as pq
rng = np.random.default_rng(240)
df = pd.DataFrame({'meter_id': rng.integers(1, 50_001, 1_000_000), 'kwh': rng.gamma(2, 6,
        1_000_000)})
pq.write_table(pa.Table.from_pandas(df, preserve_index=False), 'unsorted.parquet',
        row_group_size=50_000)
pq.write_table(pa.Table.from_pandas(df.sort_values('kwh'), preserve_index=False),
        'sorted.parquet',
               row_group_size=50_000)
for name in ['unsorted', 'sorted']:
    meta = pq.ParquetFile(f'{name}.parquet').metadata
    kwh_col = [meta.schema.column(i).name for i in range(meta.num_columns)].index('kwh')
    must_read = sum(meta.row_group(g).column(kwh_col).statistics.max > 40
            for g in range(meta.num_row_groups))
    print(f'{name:8}: {must_read} of {meta.num_row_groups} row groups may contain kwh > 40')
print(f'rows that actually match: {(df.kwh > 40).sum():,}')
```

In the unsorted file, every row group contains some large values, so the statistics cannot rule any out and the engine reads everything. Sorted by `kwh`, only the last row group's range reaches above 40, so the other nineteen are skipped from the footer alone. Engines achieve the same effect with clustering (BigQuery), sort keys (Redshift), Z-ordering (Delta) or sort orders (Iceberg), usually on the columns most often filtered after the partition column.

### W1.3 The small-files problem

```python run One file versus 500 files with the same rows
import os, shutil, duckdb
shutil.rmtree('many_files', ignore_errors=True); os.makedirs('many_files')
con = duckdb.connect()
con.execute("SET threads = 1; SET memory_limit = '1GB'")
con.execute("COPY (SELECT * FROM 'unsorted.parquet') TO 'one_file.parquet' (FORMAT parquet)")
for i in range(500):
    con.execute(f"COPY (SELECT * FROM 'unsorted.parquet' LIMIT 2000 OFFSET {i * 2000}) "
                f"TO 'many_files/part-{i:03d}.parquet' (FORMAT parquet)")
one = os.path.getsize('one_file.parquet')
many = sum(os.path.getsize(os.path.join('many_files', f)) for f in os.listdir('many_files'))
print(f'one file : {one / 1e6:6.2f} MB')
print(f'500 files: {many / 1e6:6.2f} MB total, {many / 500 / 1e3:.0f} KB each')
for label, path in [('one file', 'one_file.parquet'), ('500 files',
        'many_files/*.parquet')]:
    rows = con.sql(f"SELECT count(*) FROM '{path}'").fetchone()[0]
    files = con.sql(f"SELECT count(DISTINCT filename) FROM read_parquet('{path}', filename "
            f"= true)").fetchone()[0]
    print(f'{label:9}: {rows:,} rows read from {files} file(s)')
```

The rows are identical. The extra space is modest here (about 2%: each file repeats its schema, footer and per-column metadata, and small row groups compress slightly worse); the real cost is that every query must list, open and read the footer of all 500 files before scanning anything. On object storage each open is a network request with tens of milliseconds of latency, and query planners slow down with millions of files. Streaming writers and over-partitioned tables create this problem; regular **compaction** fixes it.

### W1.4 Choosing a partition granularity

```python run Partitions and file sizes for three layouts
daily_gb, meters = 240, 50_000
layouts = {
    'by day': (365, daily_gb / 1),
    'by hour': (365 * 24, daily_gb / 24),
    'by (day, meter_id)': (365 * meters, daily_gb / meters),
}
for name, (partitions, gb_per_partition) in layouts.items():
    files_per_partition = max(1, round(gb_per_partition / 1.0))   # aim for about 1 GB files
    file_mb = gb_per_partition / files_per_partition * 1000
    print(f'{name:19}: {partitions:>12,} partitions/year, '
            f'{partitions * files_per_partition:>12,} files/year, '
          f'~{file_mb:,.0f} MB per file')
```

By day and by hour both allow healthy 1 GB files (hourly gives finer pruning for hour-level queries at the cost of more partitions to track). Partitioning by meter creates 18 million partitions a year of under 5 MB each: a small-files disaster. Filter by meter through clustering or sorting within daily partitions instead.

### W1.5 Why a table format?

| Problem with plain Parquet | Consequence | Table format fix |
|---|---|---|
| Two jobs write the same table at once | Interleaved files; readers see a mix of old and new data; overwrites can delete the other job's files | Optimistic concurrency: each commit is an atomic snapshot; conflicting commits retry |
| A job fails halfway | Half-written files are visible to readers | Files become visible only when the commit succeeds |
| GDPR delete of one customer | Every file containing them must be rewritten by hand, with downtime or risk | `DELETE`/`MERGE` rewrites affected files (or writes delete files) in one transaction |
| "What did the table look like yesterday?" | Impossible once files are replaced | Time travel to earlier snapshots (expire them on a schedule, since a GDPR delete must eventually remove old data too) |
| Adding a column | Old files lack it; readers may fail | Schema evolution recorded in metadata |

## Part 2 solutions

### W2.1 A star schema for food delivery

| Fact table | Grain | Measures | Dimensions |
|---|---|---|---|
| `fact_order` | One row per order | Item total, delivery fee, discount, tip, tax, order total | Customer, restaurant, date, time of day, delivery zone, promotion, payment method |
| `fact_order_line` | One row per item in an order | Quantity, unit price, line total | Order (degenerate key), menu item, restaurant, date |
| `fact_delivery` (accumulating snapshot) | One row per delivery, updated as milestones occur | Minutes to accept, prepare, pick up, deliver | Driver, restaurant, zone, date; milestone timestamps |

Dimensions needing **SCD Type 2**: restaurant (cuisine, commission rate, zone; reports by commission tier must use the rate valid at order time), customer segment or membership tier, menu item price category, driver vehicle type. Type 1 is enough for corrections such as a misspelt restaurant name. Keep `fact_order` and `fact_order_line` separate: mixing order-level fees with line-level items would double-count the fees.

### W2.2 An SCD Type 2 load that is safe to rerun

```python run Change detection on several attributes, run twice
import duckdb
con = duckdb.connect()
con.execute('''CREATE TABLE dim_customer AS SELECT * FROM (VALUES
    (1, 'C-1', 'standard', 'north', DATE '2025-01-01', DATE '9999-12-31', true),
    (2, 'C-2', 'standard', 'south', DATE '2025-01-01', DATE '9999-12-31', true),
    (3, 'C-3', 'solar',    'east',  DATE '2025-01-01', DATE '9999-12-31', true))
    t(customer_key, customer_id, plan, region, valid_from, valid_to, is_current)''')
con.execute('''CREATE TABLE snapshot AS SELECT * FROM (VALUES
    ('C-1', 'standard', 'north'),          -- unchanged
    ('C-2', 'standard', 'west'),           -- moved region
    ('C-3', 'night', 'east'),              -- changed plan
    ('C-4', 'standard', 'north'))          -- new customer
    t(customer_id, plan, region)''')

def load(as_of):
    changed = f'''SELECT s.* FROM snapshot s LEFT JOIN dim_customer d
                  ON d.customer_id = s.customer_id AND d.is_current
                  WHERE d.customer_id IS NULL OR d.plan IS DISTINCT FROM s.plan
                     OR d.region IS DISTINCT FROM s.region'''
    con.execute(f'CREATE OR REPLACE TEMP TABLE changes AS {changed}')
    con.execute(f'''UPDATE dim_customer SET valid_to = DATE '{as_of}' - 1, is_current = false
                    WHERE is_current AND customer_id IN (SELECT customer_id FROM changes)''')
    con.execute(f'''INSERT INTO dim_customer
                    SELECT (SELECT max(customer_key) FROM dim_customer)
                               + row_number() OVER (ORDER BY customer_id),
                           customer_id, plan, region, DATE '{as_of}', DATE '9999-12-31', true
                    FROM changes''')
    return con.execute('SELECT count(*) FROM changes').fetchone()[0]

print('first run, changes applied :', load('2026-03-01'))
print('second run, changes applied:', load('2026-03-01'))
dim = con.sql('''SELECT customer_key, customer_id, plan, region, valid_from, valid_to,
                        is_current
                 FROM dim_customer ORDER BY customer_id, valid_from''').fetchdf()
print(dim.to_string(index=False))
```

The first run closes the old versions of C-2 and C-3, adds their new versions, and inserts C-4; C-1 is untouched. The second run finds no differences, so it changes nothing: the load is idempotent because it compares attributes with the **current** version instead of blindly inserting the snapshot. `IS DISTINCT FROM` treats nulls correctly (`NULL <> 'x'` is unknown, not true).

### W2.3 Revenue doubled after a join

```python run A non-unique dimension inflates a join
import duckdb
con = duckdb.connect()
con.execute("CREATE TABLE orders AS SELECT * FROM (VALUES (1, 'C-1', 500.0), (2, 'C-2', "
        "300.0), (3, 'C-1', 200.0)) t(order_id, customer_id, amount)")
con.execute("CREATE TABLE customers AS SELECT * FROM (VALUES ('C-1', 'north'), ('C-1', "
        "'north'), ('C-2', 'south')) t(customer_id, region)")
print('true revenue          :', con.sql('SELECT sum(amount) FROM orders').fetchone()[0])
print('revenue after the join:',
        con.sql('''SELECT sum(o.amount) FROM orders o
                   JOIN customers c USING (customer_id)''').fetchone()[0])
dupes = con.sql('SELECT customer_id, count(*) FROM customers GROUP BY ALL HAVING count(*) '
        '> 1').fetchall()
print('uniqueness test on customers.customer_id:', 'FAIL' if dupes else 'PASS', dupes)
fixed = con.sql('''SELECT sum(o.amount) FROM orders o
                   JOIN (SELECT DISTINCT customer_id, region FROM customers) c
                   USING (customer_id)''').fetchone()[0]
print('revenue with a de-duplicated dimension:', fixed)
```

Every order of C-1 matched two customer rows, so its revenue was counted twice. The real fix belongs upstream (the load that created the duplicate), but the **test** is what stops it reaching a dashboard: a uniqueness test on every dimension key, and a reconciliation test that the fact total before and after joins is equal.

### W2.4 Latest record per key with QUALIFY

```python run QUALIFY keeps one row per order
import duckdb
con = duckdb.connect()
con.execute('''CREATE TABLE status_history AS SELECT * FROM (VALUES
    (1, 'placed', TIMESTAMP '2026-03-15 09:00'),
    (1, 'delivered', TIMESTAMP '2026-03-15 09:40'),
    (2, 'placed', TIMESTAMP '2026-03-15 10:00'),
    (2, 'cancelled', TIMESTAMP '2026-03-15 10:05'),
    (3, 'placed', TIMESTAMP '2026-03-15 11:00'),
    (3, 'cancelled', TIMESTAMP '2026-03-15 11:02'),
    (3, 'placed', TIMESTAMP '2026-03-15 11:10')) t(order_id, status, updated_at)''')
latest = '''SELECT order_id, status, updated_at FROM status_history
            QUALIFY row_number() OVER (PARTITION BY order_id ORDER BY updated_at DESC) = 1'''
print(con.sql(latest + ' ORDER BY order_id').fetchdf().to_string(index=False))
print('orders whose latest status is cancelled:',
      con.sql(f"SELECT count(*) FROM ({latest}) WHERE status = 'cancelled'").fetchone()[0])
```

Order 3 was cancelled and then re-placed, so its latest status is `placed`; counting "any cancelled row" would wrongly include it. `QUALIFY` (DuckDB, Snowflake, BigQuery) filters on a window function directly; in MySQL or PostgreSQL the same query needs a subquery or CTE.

### W2.5 Pricing three queries

(a) 12 TB × ₹530 = **₹6,360**. (b) 4 of 120 columns: 12 × 4/120 = 0.4 TB → **₹212**. (c) The same columns for 7 of 730 daily partitions: 0.4 × 7/730 ≈ 0.0038 TB → about **₹2**. Column pruning saved 97%, and partition pruning a further 99%. (Real columns differ in size, so the column share is approximate; the warehouse's dry-run estimate gives the exact figure before running.)
