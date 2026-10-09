# Solutions
%Every query run on the practice database and every answer executed

## Part 1 solutions

### I1.1 Users who never ordered

```python run Anti-join with LEFT JOIN ... IS NULL
import sqlite3, pandas as pd
con = sqlite3.connect('shop.db')
q = lambda sql: print(pd.read_sql(sql, con).to_string(index=False))
q('''
SELECT u.country,
       SUM(o.order_id IS NULL)                        AS never_ordered,
       COUNT(*)                                       AS users,
       ROUND(1.0 * SUM(o.order_id IS NULL) / COUNT(*), 3) AS share
FROM users u
LEFT JOIN (SELECT DISTINCT user_id, 1 AS order_id FROM orders) o ON o.user_id = u.user_id
GROUP BY u.country ORDER BY share DESC
''')
```

Joining to the **distinct** buyers (not to every order) keeps exactly one row per user, so `COUNT(*)` counts users. `WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.user_id)` is an equally good answer. Avoid `NOT IN (SELECT user_id ...)`: if the subquery ever returns a NULL, `NOT IN` returns no rows at all.

### I1.2 Month-over-month growth

```python run Revenue per country per month with LAG
import sqlite3, pandas as pd
con = sqlite3.connect('shop.db')
q = lambda sql: print(pd.read_sql(sql, con).to_string(index=False))
q('''
WITH monthly AS (
    SELECT u.country, strftime('%Y-%m', o.order_date) AS month, SUM(o.amount) AS revenue
    FROM orders o JOIN users u ON u.user_id = o.user_id
    WHERE o.status = 'completed'
    GROUP BY u.country, month
)
SELECT country, month, ROUND(revenue, 0) AS revenue,
       ROUND(100.0 * (revenue - LAG(revenue) OVER w) / LAG(revenue) OVER w, 1) AS mom_pct
FROM monthly
WINDOW w AS (PARTITION BY country ORDER BY month)
ORDER BY country, month
''')
```

April looks like a collapse in every country, but the data ends in early April: a partial last period is the most common cause of a scary dashboard, so always check that the final period is complete before reporting growth. The first month of each country has no previous month, so its growth is NULL (shown as NaN). The named `WINDOW` clause avoids repeating the window definition; MySQL 8 and PostgreSQL support it too. A month with no revenue would be missing entirely, making `LAG` compare with two months earlier: in production, join to a calendar of months first.

### I1.3 How concentrated is revenue?

```python run NTILE(10) to find each country's top decile of buyers
import sqlite3, pandas as pd
con = sqlite3.connect('shop.db')
q = lambda sql: print(pd.read_sql(sql, con).to_string(index=False))
q('''
WITH spend AS (
    SELECT u.country, o.user_id, SUM(o.amount) AS total
    FROM orders o JOIN users u ON u.user_id = o.user_id
    WHERE o.status = 'completed'
    GROUP BY u.country, o.user_id
),
deciles AS (
    SELECT *, NTILE(10) OVER (PARTITION BY country ORDER BY total DESC) AS decile FROM spend
)
SELECT country, COUNT(*) AS buyers,
       ROUND(SUM(CASE WHEN decile = 1 THEN total END) / SUM(total), 3) AS top10pct_share
FROM deciles GROUP BY country ORDER BY top10pct_share DESC
''')
```

`NTILE(10)` splits each country's buyers into ten groups as equal as possible; with buyer counts that are not multiples of 10, the first groups get one extra member, so "top 10%" is approximate for small groups. Say so in an interview.

### I1.4 A true 7-day moving average

```python run Calendar table with a recursive CTE
import sqlite3, pandas as pd
con = sqlite3.connect('shop.db')
q = lambda sql: print(pd.read_sql(sql, con).to_string(index=False))
q('''
WITH RECURSIVE calendar(day) AS (
    SELECT '2026-01-01'
    UNION ALL
    SELECT date(day, '+1 day') FROM calendar WHERE day < '2026-01-31'
),
daily AS (
    SELECT order_date AS day, SUM(amount) AS revenue
    FROM orders WHERE status = 'completed' GROUP BY order_date
),
filled AS (
    SELECT c.day, COALESCE(d.revenue, 0) AS revenue
    FROM calendar c LEFT JOIN daily d ON d.day = c.day
)
SELECT day, ROUND(revenue, 0) AS revenue,
       ROUND(AVG(revenue) OVER (ORDER BY day
                                ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 0) AS ma7
FROM filled WHERE day <= '2026-01-10'
''')
```

With every date present, 7 rows really are 7 days, and 2 January appears with revenue 0, lowering the moving average as it should. (The first six days average fewer than 7 days; say whether to show them or leave them blank.)

### I1.5 Median days to first purchase

```python run A median with window functions
import sqlite3, pandas as pd
con = sqlite3.connect('shop.db')
q = lambda sql: print(pd.read_sql(sql, con).to_string(index=False))
q('''
WITH firsts AS (
    SELECT u.user_id, u.platform,
           julianday(MIN(o.order_date)) - julianday(u.signup_date) AS days
    FROM users u JOIN orders o ON o.user_id = u.user_id
    GROUP BY u.user_id, u.platform
),
ranked AS (
    SELECT platform, days,
           ROW_NUMBER() OVER (PARTITION BY platform ORDER BY days) AS rn,
           COUNT(*)     OVER (PARTITION BY platform)               AS n
    FROM firsts
)
SELECT platform, MAX(n) AS buyers, AVG(days) AS median_days
FROM ranked
WHERE rn IN ((n + 1) / 2, (n + 2) / 2)
GROUP BY platform ORDER BY median_days
''')
```

For an odd count both expressions point to the middle row; for an even count they point to the two middle rows, which are averaged (integer division does the work). PostgreSQL has `PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY days)`; MySQL needs the same trick as here.

### I1.6 Always spending more

```python run Strictly increasing order amounts
import sqlite3, pandas as pd
con = sqlite3.connect('shop.db')
q = lambda sql: print(pd.read_sql(sql, con).to_string(index=False))
q('''
WITH seq AS (
    SELECT user_id, order_id, amount,
           LAG(amount) OVER (PARTITION BY user_id ORDER BY order_date, order_id) AS prev
    FROM orders
)
SELECT user_id, COUNT(*) AS orders, GROUP_CONCAT(ROUND(amount, 0), ' < ') AS amounts
FROM seq
GROUP BY user_id
HAVING COUNT(*) >= 3 AND SUM(prev IS NOT NULL AND amount <= prev) = 0
ORDER BY orders DESC, user_id
''')
```

`SUM(amount <= prev) = 0` means no order failed to beat its predecessor. Ordering by `order_date, order_id` breaks ties between orders placed on the same day deterministically. `GROUP_CONCAT` (MySQL) is `STRING_AGG` in PostgreSQL; the concatenation order is not guaranteed without an `ORDER BY` inside the aggregate, so treat that column as illustration.

### I1.7 The inflated average order value

```python run Fan-out from joining a second one-to-many table
import sqlite3, pandas as pd
con = sqlite3.connect('shop.db')
q = lambda sql: print(pd.read_sql(sql, con).to_string(index=False))
print('wrong (joined to events):')
q('''
SELECT u.platform, ROUND(AVG(o.amount), 0) AS aov, ROUND(SUM(o.amount), 0) AS revenue
FROM users u JOIN orders o ON o.user_id = u.user_id JOIN events e ON e.user_id = u.user_id
WHERE o.status = 'completed' GROUP BY u.platform
''')
print('right:')
q('''
SELECT u.platform, ROUND(AVG(o.amount), 0) AS aov, ROUND(SUM(o.amount), 0) AS revenue
FROM users u JOIN orders o ON o.user_id = u.user_id
WHERE o.status = 'completed' GROUP BY u.platform
''')
```

Each order row is repeated once per event of the same user, so revenue is multiplied many times over, and the average is distorted too: heavy browsers' orders are counted more often. Never join two independent one-to-many tables at the same level; aggregate each to the user level in its own CTE, then join the results.

## Part 2 solutions

### I2.1 Shares by segment

```python run crosstab with normalisation
import sqlite3, pandas as pd
users = pd.read_sql('SELECT * FROM users', sqlite3.connect('shop.db'))
share = pd.crosstab(users.country, users.platform, normalize='index').round(3)
print(share)
print('highest iOS share:', share['ios'].idxmax(), f'({share["ios"].max():.1%})')
```

### I2.2 The price at order time

```python run merge_asof attaches the latest earlier price
import pandas as pd
prices = pd.DataFrame({'effective': pd.to_datetime(['2026-01-01', '2026-02-10',
        '2026-03-05']),
                       'unit_price': [499, 549, 529]})
orders = pd.DataFrame({'order_id': [1, 2, 3, 4, 5],
                       'placed': pd.to_datetime(['2026-01-15', '2026-02-09', '2026-02-10',
                                                 '2026-03-01', '2026-03-20']),
                       'qty': [2, 1, 3, 1, 2]}).sort_values('placed')
priced = pd.merge_asof(orders, prices.sort_values('effective'), left_on='placed',
                       right_on='effective', direction='backward')
priced['revenue'] = priced.qty * priced.unit_price
print(priced[['order_id', 'placed', 'unit_price', 'qty', 'revenue']].to_string(index=False))
print('total revenue:', priced.revenue.sum())
```

Order 3, placed on the day the new price took effect, gets the new price: `merge_asof` matches the last key **less than or equal** to the order time (use `allow_exact_matches=False` if the change applies only from the next day).

### I2.3 Rolling 7-day active users

```python run Distinct users active in each trailing 7-day window
import sqlite3, pandas as pd
ev = pd.read_sql('SELECT user_id, ts FROM events', sqlite3.connect('shop.db'),
        parse_dates=['ts'])
ev['day'] = ev.ts.dt.normalize()
active = pd.crosstab(ev.day, ev.user_id).clip(upper=1)            # day x user, 1 if active
days = pd.date_range(active.index.min(), active.index.max(), freq='D')
active = active.reindex(days, fill_value=0)
wau = active.rolling(7, min_periods=1).max().sum(axis=1).astype(int)
dau = active.sum(axis=1)
print(pd.DataFrame({'dau': dau, 'rolling_7d_users': wau}).loc['2026-02-01':'2026-02-07'])
```

Summing daily active users over 7 days would count a user once per active day; taking each user's maximum over the window counts them once. For millions of users this dense matrix is too big; use sorted events with interval logic, or approximate distinct counts (HyperLogLog) as data warehouses do.

### I2.4 The update that did nothing

```python run Chained assignment under copy-on-write
import warnings
import pandas as pd
df = pd.DataFrame({'status': ['completed', 'cancelled', 'completed'], 'amount': [100.0,
        80.0, 50.0]})
with warnings.catch_warnings(record=True) as caught:
    warnings.simplefilter('always')
    df[df.status == 'cancelled']['amount'] = 0              # chained assignment
print('after chained assignment:', df.amount.tolist(),
      '| warning raised:', any('chained' in str(w.message).lower() for w in caught))
df.loc[df.status == 'cancelled', 'amount'] = 0              # one indexing step
print('after .loc assignment     :', df.amount.tolist())
```

`df[mask]` creates a new object, and the assignment modifies that temporary, not `df`. In pandas 3, copy-on-write makes this rule absolute: chained assignment **never** updates the original. Use a single `.loc[row_selector, column]` assignment.

### I2.5 A cohort retention matrix

```python run Weekly retention matrix in pandas
import sqlite3, pandas as pd
con = sqlite3.connect('shop.db')
users = pd.read_sql('SELECT user_id, signup_date FROM users', con,
        parse_dates=['signup_date'])
ev = pd.read_sql('SELECT user_id, ts FROM events', con, parse_dates=['ts']).merge(users,
        on='user_id')
ev['week'] = (ev.ts.dt.normalize() - ev.signup_date).dt.days // 7
ev['cohort'] = ev.signup_date.dt.to_period('M').astype(str)
counts = ev[ev.week.between(0, 3)].groupby(['cohort',
        'week']).user_id.nunique().unstack(fill_value=0)
print((counts.div(counts[0], axis=0)).round(2))
```

Dividing every column by week 0 turns counts into retention shares. There is no week-3 column because no user in this synthetic shop was active that late (`unstack` only creates columns that occur). Monthly cohorts with weekly offsets match the SQL version in the guide (§1.6), which is a useful cross-check: the same numbers from two independent implementations.
