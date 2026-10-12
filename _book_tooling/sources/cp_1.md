# Chapter 2: SQL
%Queries, NULLs, grouping, joins, subqueries, window functions, and the theory questions on keys, normalisation and transactions

## 2.1 The sample database

Every query in this chapter runs against the same two tables. The program below creates them in SQLite and saves a small helper module (`cpa_sql.py`) so later examples can print query results as tables.

```python run The employees and departments tables (saved as cpa_sql.py)
import sqlite3

SCHEMA = '''
CREATE TABLE dept (dept_id INTEGER PRIMARY KEY, dept_name TEXT NOT NULL, city TEXT);
CREATE TABLE emp (
    emp_id INTEGER PRIMARY KEY, name TEXT NOT NULL, dept_id INTEGER REFERENCES dept(dept_id),
    salary INTEGER, manager_id INTEGER, joined TEXT);
INSERT INTO dept VALUES (10, 'Analytics', 'Pune'), (20, 'Engineering', 'Chennai'),
                        (30, 'Sales', 'Mumbai'), (40, 'Research', NULL);
INSERT INTO emp VALUES
    (1, 'Asha',  20, 120000, NULL, '2019-04-01'),
    (2, 'Ravi',  20,  90000,    1, '2021-07-15'),
    (3, 'Meera', 10,  95000,    1, '2020-01-10'),
    (4, 'Kiran', 10,  70000,    3, '2022-03-01'),
    (5, 'Arjun', 30,  60000,    1, '2023-06-20'),
    (6, 'Divya', 20,  90000,    2, '2022-11-05'),
    (7, 'Farah', NULL, 55000,   1, '2024-02-12'),
    (8, 'Gopal', 30,  NULL,     5, '2024-08-01');
'''

def db():
    con = sqlite3.connect(':memory:')
    con.executescript(SCHEMA)
    return con

def show(sql, con=None):
    con = con or db()
    cur = con.execute(sql)
    cols = [d[0] for d in cur.description]
    rows = [['NULL' if v is None else str(v) for v in r] for r in cur.fetchall()]
    width = [max(len(c), *(len(r[i]) for r in rows)) if rows else len(c) for i,
            c in enumerate(cols)]
    print(' | '.join(c.ljust(w) for c, w in zip(cols, width)))
    for r in rows:
        print(' | '.join(v.ljust(w) for v, w in zip(r, width)))
    print(f'({len(rows)} rows)')

if __name__ == '__main__':
    module = open(__file__, encoding='utf-8').read().split("if __name__ ==")[0]
    open('cpa_sql.py', 'w', encoding='utf-8').write(module)
    show('SELECT * FROM dept')
    show('SELECT * FROM emp')
```

Note the deliberate gaps: Farah has no department, Gopal has no salary, and the Research department has no employees and no city. Most tricky SQL questions are about exactly these cases.

## 2.2 SELECT, WHERE, ORDER BY and NULL

```python run Filtering, sorting and the three-valued logic of NULL
from cpa_sql import show
show("SELECT name, salary FROM emp WHERE salary > 80000 ORDER BY salary DESC, name")
show("SELECT name FROM emp WHERE salary <> 90000")               # Gopal (NULL) is missing
show("SELECT name FROM emp WHERE salary IS NULL OR dept_id IS NULL")
show("SELECT COUNT(*) AS all_rows, COUNT(salary) AS with_salary, "
     "COUNT(DISTINCT dept_id) AS depts, AVG(salary) AS avg_sal FROM emp")
show("SELECT name, COALESCE(salary, 0) AS pay FROM emp WHERE name LIKE '_a%'")
```

| Rule | Consequence |
|---|---|
| Any comparison with NULL is unknown | `salary <> 90000` does not return Gopal; use `IS NULL` / `IS NOT NULL` |
| `COUNT(*)` counts rows; `COUNT(col)` counts non-NULL values | 8 rows, 7 salaries |
| Aggregates ignore NULLs | `AVG(salary)` divides by 7, not 8 |
| `COALESCE(a, b, ...)` returns the first non-NULL | MySQL also has `IFNULL(a, b)` |
| `LIKE '_a%'` | `_` is exactly one character, `%` any run of characters |
| `NOT IN` with a NULL in the list | Returns no rows at all; prefer `NOT EXISTS` |

**Logical order of execution:** FROM (and JOINs) → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT. This explains why a column alias defined in SELECT cannot be used in WHERE (it does not exist yet) but can be used in ORDER BY.

## 2.3 GROUP BY and HAVING

```python run Aggregating per group, filtering groups with HAVING
from cpa_sql import show
show("SELECT dept_id, COUNT(*) AS n, SUM(salary) AS total, MAX(salary) AS top "
     "FROM emp GROUP BY dept_id ORDER BY dept_id")
show("SELECT dept_id, AVG(salary) AS avg_sal FROM emp WHERE salary IS NOT NULL "
     "GROUP BY dept_id HAVING COUNT(*) >= 2 ORDER BY avg_sal DESC")
```

WHERE filters **rows before** grouping; HAVING filters **groups after** aggregation. Rows with a NULL `dept_id` form their own group. Every non-aggregated column in SELECT must appear in GROUP BY (MySQL with `ONLY_FULL_GROUP_BY`, the default since 5.7, enforces this; SQLite does not).

## 2.4 Joins

```python run INNER, LEFT, RIGHT-style, CROSS and self joins: count the rows
from cpa_sql import show
show("SELECT e.name, d.dept_name FROM emp e JOIN dept d ON e.dept_id = d.dept_id ORDER BY "
        "e.emp_id")
show("SELECT e.name, d.dept_name FROM emp e LEFT JOIN dept d ON e.dept_id = d.dept_id "
     "WHERE d.dept_id IS NULL")   # employees without a dept
show("SELECT d.dept_name, COUNT(e.emp_id) AS staff FROM dept d LEFT JOIN emp e "
     "ON e.dept_id = d.dept_id GROUP BY d.dept_name ORDER BY staff DESC, d.dept_name")
show("SELECT COUNT(*) AS cross_rows FROM emp CROSS JOIN dept")
show("SELECT e.name AS employee, m.name AS manager FROM emp e LEFT JOIN emp m "
     "ON e.manager_id = m.emp_id ORDER BY e.emp_id")
```

| Join | Returns |
|---|---|
| `INNER JOIN` | Only matching pairs (Farah, with no department, and Research, with no staff, disappear) |
| `LEFT JOIN` | Every row of the left table; NULLs where no match. `WHERE right.key IS NULL` finds the unmatched ("anti-join") |
| `RIGHT JOIN` | Every row of the right table (same as swapping tables in a LEFT JOIN) |
| `FULL OUTER JOIN` | Every row of both; MySQL has none: emulate with `LEFT JOIN ... UNION ... RIGHT JOIN` |
| `CROSS JOIN` | Every combination: 8 × 4 = 32 rows |
| Self join | A table joined with itself, for hierarchies such as employee and manager |

> TRAP: `COUNT(*)` after a LEFT JOIN counts the unmatched row too (Research would show 1). Count a column from the right table, `COUNT(e.emp_id)`, to get 0 for empty departments.

## 2.5 Subqueries

```python run Scalar, IN, correlated and EXISTS subqueries; the second-highest salary
from cpa_sql import show
show("SELECT name, salary FROM emp WHERE salary > (SELECT AVG(salary) FROM emp)")
show("SELECT name FROM emp WHERE dept_id IN (SELECT dept_id FROM dept WHERE city = "
        "'Chennai')")
show("SELECT e.name, e.salary, e.dept_id FROM emp e WHERE e.salary > "
     "(SELECT AVG(x.salary) FROM emp x WHERE x.dept_id = e.dept_id)")      # correlated
show("SELECT dept_name FROM dept d WHERE NOT EXISTS "
     "(SELECT 1 FROM emp e WHERE e.dept_id = d.dept_id)")
show("SELECT MAX(salary) AS second_highest FROM emp WHERE salary < (SELECT MAX(salary) "
        "FROM emp)")
show("SELECT DISTINCT salary FROM emp WHERE salary IS NOT NULL ORDER BY salary DESC LIMIT "
        "1 OFFSET 2")
```

A **correlated** subquery refers to the outer row (`e.dept_id`) and is evaluated per row: "employees earning above their own department's average". The **n-th highest salary** is a favourite: `LIMIT 1 OFFSET n-1` over DISTINCT salaries (the third highest here is 90,000, despite two people earning it), or a window function.

## 2.6 Window functions

```python run ROW_NUMBER, RANK, DENSE_RANK, running totals and LAG
from cpa_sql import show
show("""SELECT name, dept_id, salary,
       ROW_NUMBER() OVER (ORDER BY salary DESC) AS rn,
       RANK()       OVER (ORDER BY salary DESC) AS rnk,
       DENSE_RANK() OVER (ORDER BY salary DESC) AS drnk
FROM emp WHERE salary IS NOT NULL""")
show("""SELECT name, dept_id, salary,
       RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rank_in_dept,
       SUM(salary) OVER (PARTITION BY dept_id) AS dept_total
FROM emp WHERE dept_id IS NOT NULL AND salary IS NOT NULL ORDER BY dept_id, rank_in_dept""")
show("""SELECT name, joined, salary,
       SUM(salary) OVER (ORDER BY joined) AS running_total,
       LAG(salary) OVER (ORDER BY joined) AS prev_salary
FROM emp WHERE salary IS NOT NULL ORDER BY joined""")
```

| Function | Ties (two salaries of 90,000) |
|---|---|
| `ROW_NUMBER()` | 3, 4: unique numbers, arbitrary order within ties |
| `RANK()` | 3, 3, then 5: gaps after ties |
| `DENSE_RANK()` | 3, 3, then 4: no gaps |

Unlike GROUP BY, window functions keep every row and add a computed column. `PARTITION BY` restarts the calculation per group; `ORDER BY` inside `OVER` defines running order. "Top earner per department" is `RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) = 1` in an outer query. (MySQL supports window functions from version 8.)

## 2.7 Modifying data and set operations

```python run UPDATE, DELETE and UNION versus UNION ALL
from cpa_sql import db, show
con = db()
con.execute("UPDATE emp SET salary = salary * 110 / 100 WHERE dept_id = 10")   # +10%
con.execute("DELETE FROM emp WHERE salary IS NULL")
show("SELECT name, salary FROM emp WHERE dept_id = 10 OR name = 'Gopal'", con)
show("SELECT city FROM dept WHERE city IS NOT NULL UNION SELECT 'Pune'", con)
show("SELECT city FROM dept WHERE city IS NOT NULL UNION ALL SELECT 'Pune'", con)
```

`UNION` removes duplicates (and therefore sorts or hashes); `UNION ALL` keeps them and is faster. Both need the same number of columns with compatible types. `INTERSECT` and `EXCEPT` (MySQL 8.0.31+) give common rows and differences.

## 2.8 Theory questions

| Topic | What to know |
|---|---|
| Command families | DDL: CREATE, ALTER, DROP, TRUNCATE; DML: INSERT, UPDATE, DELETE (and SELECT, sometimes called DQL); DCL: GRANT, REVOKE; TCL: COMMIT, ROLLBACK, SAVEPOINT |
| DELETE vs TRUNCATE vs DROP | DELETE removes chosen rows, can be rolled back, fires triggers; TRUNCATE removes all rows fast, resets auto-increment, is DDL (implicit commit in MySQL); DROP removes the table itself |
| Keys | Primary key: unique and not null, one per table; candidate keys: all minimal unique column sets; foreign key: references another table's key; unique key allows NULLs; composite key: several columns; surrogate key: artificial ID |
| Constraints | NOT NULL, UNIQUE, PRIMARY KEY, FOREIGN KEY, CHECK, DEFAULT |
| Normalisation | 1NF: atomic values, no repeating groups; 2NF: 1NF and no partial dependency on part of a composite key; 3NF: 2NF and no transitive dependency (non-key → non-key); BCNF: every determinant is a candidate key |
| Denormalisation | Deliberately adding redundancy for read speed (reporting, analytics) |
| Index | Speeds up lookups and sorting (B-tree), slows writes, uses storage; useful on columns in WHERE, JOIN and ORDER BY with high selectivity |
| View | A stored query, behaves like a table; materialised views store results |
| ACID | Atomicity (all or nothing), Consistency (constraints hold), Isolation (concurrent transactions do not interfere), Durability (committed data survives crashes) |
| Isolation anomalies | Dirty read, non-repeatable read, phantom read; levels READ UNCOMMITTED → READ COMMITTED → REPEATABLE READ (MySQL default) → SERIALIZABLE |
| CHAR vs VARCHAR | Fixed length padded versus variable length |
| Stored procedure vs function | Procedure: called with CALL, may return several result sets; function: returns one value, usable in SELECT |

## 2.9 Practical lessons

- Predict NULL behaviour first: comparisons are unknown, aggregates skip NULLs, `COUNT(*)` counts rows.
- WHERE filters rows, HAVING filters groups; logical order explains alias rules.
- Know the row counts of every join type on tables with unmatched rows.
- Window functions keep rows; RANK leaves gaps, DENSE_RANK does not.

# Chapter 3: AI Basics
%What AI, machine learning, deep learning and generative AI are, kinds of learning, intelligent agents, search, the ML workflow and responsible AI

## 3.1 The vocabulary

| Term | Meaning |
|---|---|
| **Artificial intelligence** | Systems performing tasks that normally need human intelligence: perception, reasoning, language, decision making |
| **Machine learning** | A subset of AI where systems learn patterns from data instead of following hand-written rules |
| **Deep learning** | ML with multi-layer neural networks that learn features automatically from raw data (images, text, audio) |
| **Generative AI** | Models that create new content (text, images, code, audio) learned from data, such as large language models and diffusion models |
| Narrow (weak) AI | Excels at one task (spam filtering, chess); all AI deployed today |
| General (strong) AI | Human-level ability across tasks; not yet achieved |
| Turing test | A machine passes if a human judge cannot reliably tell its conversation from a human's |
| Data science | Extracting insight from data using statistics, ML, visualisation and domain knowledge |

AI ⊃ ML ⊃ deep learning, and generative AI is mostly built on deep learning. Traditional programming takes **rules + data → answers**; machine learning takes **data + answers → rules** (a model).

## 3.2 Kinds of learning

| Kind | Data | Goal | Examples |
|---|---|---|---|
| Supervised | Inputs **with labels** | Predict the label for new inputs | Spam detection (classification), house prices (regression) |
| Unsupervised | Inputs **without labels** | Find structure | Customer segments (clustering), anomaly detection, dimensionality reduction |
| Semi-supervised | Few labels, many unlabelled examples | Use both | Labelling a few medical images, propagating to the rest |
| Self-supervised | Labels created from the data itself | Learn representations | Predicting the next word (how LLMs are pre-trained), masked words |
| Reinforcement | An agent acting in an environment, receiving **rewards** | Learn a policy that maximises total reward | Game playing, robotics, recommendation tuning, RLHF for chatbots |

**Reinforcement learning terms:** agent, environment, state, action, reward, policy (state → action), value (expected future reward), episode, and the **exploration–exploitation** trade-off (try new actions versus use the best known one; ε-greedy picks a random action with probability ε).

## 3.3 Intelligent agents

An **agent** perceives its environment through sensors and acts through actuators. Agent types, from simplest:

| Agent | Decides by | Example |
|---|---|---|
| Simple reflex | Current percept and condition–action rules | Thermostat |
| Model-based reflex | An internal model of the world plus rules | Robot vacuum remembering cleaned areas |
| Goal-based | Searching for actions that reach a goal | Route planner |
| Utility-based | Maximising a utility (how good an outcome is) | Ride pricing balancing time and cost |
| Learning | Improving its behaviour from experience | Recommendation system |

Environments are described as fully or partially observable, deterministic or stochastic, static or dynamic, discrete or continuous, and single- or multi-agent (the PEAS framework: Performance measure, Environment, Actuators, Sensors).

## 3.4 Search

Classical AI solves problems by searching a state space.

```python run Breadth-first search finds the fewest steps; A* uses a heuristic to explore less
from collections import deque
import heapq

grid = ['S...................',
        '....................',
        '.........#..........',
        '.........#..........',
        '.........#..........',
        '.........#..........',
        '.........#..........',
        '...................G']
R, C = len(grid), len(grid[0])
find = lambda ch: next((r, c) for r in range(R) for c in range(C) if grid[r][c] == ch)
start, goal = find('S'), find('G')

def neighbours(p):
    r, c = p
    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nr, nc = r + dr, c + dc
        if 0 <= nr < R and 0 <= nc < C and grid[nr][nc] != '#':
            yield nr, nc

def bfs():
    dist, q, expanded = {start: 0}, deque([start]), 0
    while q:
        p = q.popleft(); expanded += 1
        if p == goal:
            return dist[p], expanded
        for n in neighbours(p):
            if n not in dist:
                dist[n] = dist[p] + 1; q.append(n)

def astar():
    h = lambda p: abs(p[0] - goal[0]) + abs(p[1] - goal[1])        # Manhattan distance
    g, heap, expanded, done = {start: 0}, [(h(start), 0, start)], 0, set()
    while heap:
        _, _, p = heapq.heappop(heap)
        if p in done:
            continue
        done.add(p); expanded += 1
        if p == goal:
            return g[p], expanded
        for n in neighbours(p):
            if g[p] + 1 < g.get(n, 10**9):
                g[n] = g[p] + 1
                heapq.heappush(heap, (g[n] + h(n), -g[n], n))   # ties: prefer deeper

print('BFS:  path length %d, cells expanded %d' % bfs())
print('A*:   path length %d, cells expanded %d' % astar())
```

Both find a shortest path, but BFS expands almost every cell of the grid, spreading in all directions, while A* expands little more than the path itself because f = g + h steers it towards the goal. (Breaking ties in favour of the node with the larger g matters on open grids, where many cells share the same f.)

| Algorithm | Strategy | Optimal? |
|---|---|---|
| Breadth-first | Explore level by level (queue) | Yes, for equal step costs |
| Depth-first | Go deep first (stack); little memory | No |
| Uniform cost (Dijkstra) | Expand the cheapest path so far | Yes, for non-negative costs |
| Greedy best-first | Expand the node that **looks** closest (h only) | No |
| A* | Expand by f = g + h (cost so far + estimate to goal) | Yes, if h is **admissible** (never overestimates) |
| Minimax with alpha–beta pruning | Two-player games: maximise your worst case; prune branches that cannot matter | Same answer as minimax, faster |

## 3.5 The machine learning workflow

1. **Define the problem**: the decision, the target variable, the success metric.
2. **Collect and understand data**: sources, quality, EDA (Chapter 4).
3. **Prepare data**: clean missing values and outliers, encode categories, scale, split into train, validation and test sets.
4. **Engineer features**: transform raw data into informative inputs.
5. **Train models** and tune hyperparameters with validation data or cross-validation.
6. **Evaluate** on the untouched test set with the agreed metric.
7. **Deploy** behind an application or API, then **monitor** for data drift and performance decay, and retrain.

| Concept | Meaning |
|---|---|
| Feature / label | Input variable / the value to predict |
| Training, validation, test sets | Fit the model / choose hyperparameters / final unbiased estimate (typical split 70/15/15 or 80/20 with cross-validation) |
| Parameters vs hyperparameters | Learned from data (weights) versus set before training (tree depth, learning rate, k in k-NN) |
| Overfitting | Memorises training noise: high training accuracy, poor test accuracy (high variance) |
| Underfitting | Too simple to capture the pattern: poor on both (high bias) |
| Generalisation | Performance on unseen data, the real goal |
| Data leakage | Information from the test set or the future leaks into training, inflating scores |

## 3.6 Responsible AI

| Principle | Concern and practice |
|---|---|
| Fairness | Models can learn historical bias (hiring, lending); audit outcomes across groups, rebalance data, remove proxies for protected attributes |
| Transparency and explainability | Users and regulators need reasons; interpretable models, SHAP and LIME explanations, model cards |
| Privacy | Personal data minimised, consented, anonymised or protected (India's DPDP Act 2023, GDPR) |
| Accountability | A human owner for each model's decisions, with review and appeal |
| Safety and robustness | Test against adversarial inputs and distribution shift; human oversight for high-stakes decisions |

## 3.7 Practical lessons

- AI ⊃ ML ⊃ deep learning; generative AI creates content and is built on deep learning.
- Match the scenario to the learning type: labels → supervised; no labels → unsupervised; rewards → reinforcement.
- A* with an admissible heuristic is optimal and explores less than BFS.
- Overfitting = good on training data, poor on new data; leakage makes results look better than they are.
