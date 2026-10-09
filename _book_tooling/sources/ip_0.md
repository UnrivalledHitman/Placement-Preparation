# How to use this guide
%How data science and analytics interviews are structured, what this book drills, and how its answers were checked

Data scientist and data analyst interviews follow a recognisable pattern. A typical loop has a **SQL round** (window functions, funnels, retention), a **Python/pandas round** (cleaning and reshaping data), a **probability and statistics round** (puzzles, p-values, confidence intervals, A/B tests), a **product or case round** ("daily active users dropped 10%: what happened?", "how would you measure this feature?") and, for data scientists, an **ML round** covered by the other books in this section.

This book is the interview layer on top of those books. The **MySQL** books teach SQL itself and the **Mathematics and Statistics for ML** guide teaches the theory; here the same material appears the way interviewers ask it, with the patterns that solve most questions and the traps that catch most candidates.

## How the answers were checked

- Every SQL query runs against a real SQLite database created by the first program in Chapter 1, and its result is shown. SQLite supports the window functions, CTEs and date arithmetic interviews use; differences from MySQL and PostgreSQL are noted where they matter.
- Every pandas answer is run.
- Every probability puzzle is solved on paper **and** checked by simulation: if the formula and the simulation disagree, one of them is wrong.

## Map of the guide

| Chapter | Round | What it drills |
|---|---|---|
| 1 | SQL | Top-N per group, running totals, LAG/LEAD, funnels, retention cohorts, sessions, de-duplication |
| 2 | pandas | Group, merge, reshape, dates, missing data, and the merge that silently multiplies rows |
| 3 | Probability | Fifteen classic puzzles, each solved and simulated |
| 4 | Statistics | p-values, confidence intervals, power, regression output, common misreadings |
| 5 | Metrics and product sense | Choosing metrics, metric trees, diagnosing a metric drop with data |
| 6 | Case interviews | Structured answers to open questions, estimates and take-home tasks |
| 7 | Mock rounds and checklist | Timed practice and the final week's checklist |

> TIP: In every round, **say your assumptions out loud** before solving: "I will assume one row per order, and that cancelled orders should be excluded." Interviewers grade the thinking as much as the answer.

# Chapter 1: SQL for Analytics Interviews
%The patterns behind most SQL questions, each run on a real database: ranking, running totals, LAG, funnels, cohorts, sessions and de-duplication

## 1.1 The practice database

All queries in this chapter use one small shop: users, their browsing events and their orders. The program creates it with a fixed seed.

```python run Creating the practice database
import sqlite3, numpy as np, pandas as pd
rng = np.random.default_rng(70)
n_users = 300
users = pd.DataFrame({
    'user_id': range(1, n_users + 1),
    'signup_date': (pd.Timestamp('2026-01-01') + pd.to_timedelta(rng.integers(0, 90,
            n_users), 'D')).strftime('%Y-%m-%d'),
    'country': rng.choice(['IN', 'IN', 'IN', 'US', 'UK'], n_users),
    'platform': rng.choice(['android', 'ios', 'web'], n_users, p=[0.5, 0.3, 0.2]),
})
events, orders = [], []
for u, signup in zip(users.user_id, pd.to_datetime(users.signup_date)):
    t = signup + pd.Timedelta(hours=int(rng.integers(8, 20)))
    for _ in range(rng.integers(1, 25)):
        t += pd.Timedelta(minutes=int(rng.choice([2, 5, 10, 45, 600, 3000])))
        step = rng.choice(['view', 'view', 'view', 'cart', 'purchase'], p=[0.4, 0.2, 0.15,
                0.15, 0.1])
        events.append((u, t.strftime('%Y-%m-%d %H:%M:%S'), step))
        if step == 'purchase':
            orders.append((len(orders) + 1, u, t.strftime('%Y-%m-%d'),
                    round(float(rng.gamma(2, 600)), 2),
                           rng.choice(['completed', 'completed', 'completed',
                                   'cancelled'])))
con = sqlite3.connect('shop.db')
users.to_sql('users', con, index=False, if_exists='replace')
pd.DataFrame(events, columns=['user_id', 'ts', 'event']).to_sql('events', con, index=False,
        if_exists='replace')
pd.DataFrame(orders, columns=['order_id', 'user_id', 'order_date', 'amount',
        'status']).to_sql(
    'orders', con, index=False, if_exists='replace')
for table in ['users', 'events', 'orders']:
    print(table, con.execute(f'SELECT COUNT(*) FROM {table}').fetchone()[0], 'rows')
print(pd.read_sql('SELECT * FROM orders LIMIT 3', con).to_string(index=False))
```

## 1.2 Aggregation traps: WHERE, HAVING and COUNT

| Trap | Wrong | Right |
|---|---|---|
| Filtering on an aggregate | `WHERE COUNT(*) > 3` | `HAVING COUNT(*) > 3` |
| Counting users, not rows | `COUNT(*)` on orders | `COUNT(DISTINCT user_id)` |
| Averages hiding zero-order users | `AVG(amount)` over orders | `LEFT JOIN` users to orders, `COALESCE` to 0 |
| Conditional counts | Several queries | `SUM(CASE WHEN ... THEN 1 ELSE 0 END)` in one pass |
| Integer division | `completed / total` gives 0 in some engines | `1.0 * completed / total` |

```python run Revenue, buyers and cancellation rate per country, in one pass
import sqlite3, pandas as pd
con = sqlite3.connect('shop.db')
q = lambda sql: print(pd.read_sql(sql, con).to_string(index=False))
q('''
SELECT u.country,
       COUNT(DISTINCT u.user_id)                                   AS users,
       COUNT(DISTINCT o.user_id)                                   AS buyers,
       ROUND(SUM(CASE WHEN o.status = 'completed' THEN o.amount ELSE 0 END), 0) AS revenue,
       ROUND(1.0 * SUM(o.status = 'cancelled') / COUNT(o.order_id), 3)          AS cancel_rate
FROM users u
LEFT JOIN orders o ON o.user_id = u.user_id
GROUP BY u.country
HAVING COUNT(DISTINCT u.user_id) >= 50
ORDER BY revenue DESC
''')
```

`SUM(o.status = 'cancelled')` works in SQLite and MySQL because a comparison returns 0 or 1; in PostgreSQL write `SUM(CASE WHEN ... THEN 1 ELSE 0 END)` or `COUNT(*) FILTER (WHERE ...)`. Note that `COUNT(o.order_id)` counts only matched rows, so users without orders do not dilute the cancellation rate.

## 1.3 Top-N per group with window functions

"The top 2 spenders in each country" is one of the most frequent interview questions. Rank inside each group with a window function, then filter in an outer query (a window function cannot appear in `WHERE`).

```python run Top two customers by spend in each country
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
ranked AS (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY country ORDER BY total DESC) AS rn,
              RANK()       OVER (PARTITION BY country ORDER BY total DESC) AS rnk
    FROM spend
)
SELECT country, user_id, ROUND(total, 0) AS total, rn, rnk
FROM ranked WHERE rn <= 2 ORDER BY country, rn
''')
```

| Function | Ties | Next value after a tie of two at rank 1 |
|---|---|---|
| `ROW_NUMBER()` | Arbitrary order, always unique | 2 |
| `RANK()` | Same rank | 3 (gap) |
| `DENSE_RANK()` | Same rank | 2 (no gap) |

Ask the interviewer how ties should be handled: "top 2" with `DENSE_RANK` may return more than two rows per group.

## 1.4 Running totals, moving averages and LAG

```python run Daily revenue with running total, 7-day average and day-over-day change
import sqlite3, pandas as pd
con = sqlite3.connect('shop.db')
q = lambda sql: print(pd.read_sql(sql, con).to_string(index=False))
q('''
WITH daily AS (
    SELECT order_date, SUM(amount) AS revenue
    FROM orders WHERE status = 'completed'
    GROUP BY order_date
)
SELECT order_date,
       ROUND(revenue, 0)                                                   AS revenue,
       ROUND(SUM(revenue) OVER (ORDER BY order_date), 0)                   AS running_total,
       ROUND(AVG(revenue) OVER (ORDER BY order_date
                                ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 0) AS avg_7_rows,
       ROUND(revenue - LAG(revenue) OVER (ORDER BY order_date), 0)         AS change_vs_prev
FROM daily
ORDER BY order_date
LIMIT 8
''')
```

The output already shows the problem described next: there is no row for 2 January, a day without completed orders.

> TRAP: `ROWS BETWEEN 6 PRECEDING AND CURRENT ROW` averages the last 7 **rows**, not the last 7 **days**: days without orders have no row, so the window silently stretches further back. For a true 7-day window, first join to a calendar table that has every date (with 0 revenue where nothing was sold), or use `RANGE` with dates in engines that support it.

## 1.5 Funnels

A funnel counts how many users reach each step, in order. Count **distinct users** per step, and decide whether steps must happen in sequence.

```python run A view, cart, purchase funnel by platform
import sqlite3, pandas as pd
con = sqlite3.connect('shop.db')
q = lambda sql: print(pd.read_sql(sql, con).to_string(index=False))
q('''
WITH firsts AS (
    SELECT user_id,
           MIN(CASE WHEN event = 'view'     THEN ts END) AS t_view,
           MIN(CASE WHEN event = 'cart'     THEN ts END) AS t_cart,
           MIN(CASE WHEN event = 'purchase' THEN ts END) AS t_buy
    FROM events GROUP BY user_id
)
SELECT u.platform,
       COUNT(f.t_view)                                                AS viewed,
       SUM(f.t_cart > f.t_view)                                       AS carted_after_view,
       SUM(f.t_buy > f.t_cart AND f.t_cart > f.t_view)                AS bought_after_cart,
       ROUND(1.0 * SUM(f.t_buy > f.t_cart AND f.t_cart > f.t_view)
             / COUNT(f.t_view), 3)                                   AS conversion
FROM firsts f JOIN users u ON u.user_id = f.user_id
GROUP BY u.platform ORDER BY conversion DESC
''')
```

Using first-occurrence timestamps enforces the order view → cart → purchase. Timestamps stored as ISO strings (`YYYY-MM-DD HH:MM:SS`) compare correctly as text, which is why the comparisons work in SQLite.

## 1.6 Retention cohorts

Retention asks: of the users who signed up in a period (a **cohort**), what share were active again k periods later? Compute each user's cohort and each activity's offset from signup, then count distinct users per (cohort, offset).

```python run Weekly retention by signup month
import sqlite3, pandas as pd
con = sqlite3.connect('shop.db')
q = lambda sql: print(pd.read_sql(sql, con).to_string(index=False))
q('''
WITH activity AS (
    SELECT DISTINCT e.user_id, strftime('%Y-%m', u.signup_date) AS cohort,
           CAST((julianday(date(e.ts)) - julianday(u.signup_date)) / 7 AS INTEGER) AS week
    FROM events e JOIN users u ON u.user_id = e.user_id
),
sizes AS (SELECT cohort, COUNT(DISTINCT user_id) AS n
          FROM activity WHERE week = 0 GROUP BY cohort)
SELECT a.cohort, s.n AS cohort_size,
       ROUND(1.0 * COUNT(DISTINCT CASE WHEN week = 1 THEN a.user_id END) / s.n, 2) AS week1,
       ROUND(1.0 * COUNT(DISTINCT CASE WHEN week = 2 THEN a.user_id END) / s.n, 2) AS week2,
       ROUND(1.0 * COUNT(DISTINCT CASE WHEN week = 4 THEN a.user_id END) / s.n, 2) AS week4
FROM activity a JOIN sizes s ON s.cohort = a.cohort
GROUP BY a.cohort ORDER BY a.cohort
''')
```

Retention falls to zero by week 4 because this small synthetic shop's users are only active in their first couple of weeks; real products show a long, flattening tail. State the definitions: "active" (any event? a purchase?), the period (day, week, month), and whether retention is **classic** (active in exactly week k) or **rolling** (active in week k or later). Different definitions give very different numbers.

## 1.7 Sessions: gaps and islands

A **session** is a run of events with no gap longer than, say, 30 minutes. Mark the first event of each session with `LAG`, then number sessions with a running sum of those markers. The same "gaps and islands" trick finds **consecutive days** and **streaks**.

```python run Sessionising events with a 30-minute gap
import sqlite3, pandas as pd
con = sqlite3.connect('shop.db')
q = lambda sql: print(pd.read_sql(sql, con).to_string(index=False))
q('''
WITH gaps AS (
    SELECT user_id, ts,
           (julianday(ts) - julianday(LAG(ts) OVER (PARTITION BY user_id ORDER BY ts)))
               * 1440 AS gap_min
    FROM events
),
marked AS (
    SELECT *, CASE WHEN gap_min IS NULL OR gap_min > 30 THEN 1 ELSE 0 END AS new_session
    FROM gaps
),
numbered AS (
    SELECT *, SUM(new_session) OVER (PARTITION BY user_id ORDER BY ts) AS session_id
    FROM marked
),
sessions AS (
    SELECT user_id, session_id, COUNT(*) AS events,
           ROUND((julianday(MAX(ts)) - julianday(MIN(ts))) * 1440, 0) AS minutes
    FROM numbered GROUP BY user_id, session_id
)
SELECT COUNT(*) AS sessions, ROUND(AVG(events), 2) AS avg_events,
       ROUND(AVG(minutes), 1) AS avg_minutes, MAX(events) AS longest_session_events
FROM sessions
''')
```

## 1.8 De-duplication and the latest record

Tables often hold several versions of a row (status changes, repeated loads). "Latest status per order" or "remove duplicates, keeping the newest" is again a window function:

```python run Keeping the latest row per key
import sqlite3, pandas as pd
con = sqlite3.connect(':memory:')
pd.DataFrame({'order_id': [1, 1, 1, 2, 2, 3],
              'status': ['placed', 'shipped', 'delivered', 'placed', 'cancelled', 'placed'],
              'updated_at': ['09:00', '12:00', '18:00', '10:00', '10:30',
                      '11:00']}).to_sql('history', con, index=False)
print(pd.read_sql('''
SELECT order_id, status, updated_at FROM (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY updated_at DESC) AS rn
    FROM history
) WHERE rn = 1 ORDER BY order_id
''', con).to_string(index=False))
```

## 1.9 Practical lessons

- Say your assumptions (grain of the table, exclusions, tie handling) before writing SQL.
- Filter aggregates with `HAVING`; count distinct users; keep zero-activity users with `LEFT JOIN`.
- Window functions solve top-N per group, running totals, LAG/LEAD, de-duplication and sessions.
- Define funnels, retention and sessions precisely; small definition changes change the numbers.
