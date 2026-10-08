# Part 5: Joins
%Combining rows from two or more tables.

## Join types

| Join | Returns | Sample result |
|---|---|---|
| `[INNER] JOIN ... ON` | Only rows that match in both tables | 5 employees (Zoya dropped) |
| `LEFT [OUTER] JOIN` | Every left row; `NULL`s where the right has no match | 6 employees, Zoya with `NULL` department |
| `RIGHT [OUTER] JOIN` | Every right row; `NULL`s where the left has no match | All 4 departments, Finance with `NULL` employee |
| `CROSS JOIN` | Every combination (Cartesian product) | 6 × 4 = 24 rows |
| Self join | A table joined to itself under two aliases | Employee with their manager |
| Full outer join | Not supported directly: `LEFT JOIN` `UNION` `RIGHT JOIN` | Everything from both sides |
| `JOIN ... USING (c)` | Shorthand when the column name is the same in both | `JOIN departments USING (dept_id)` |

```sql run
SELECT e.name, d.dept_name, d.location
FROM employees e
JOIN departments d ON e.dept_id = d.dept_id
ORDER BY e.emp_id;

SELECT e.name, d.dept_name
FROM employees e LEFT JOIN departments d ON e.dept_id = d.dept_id
ORDER BY e.emp_id;

SELECT d.dept_name                 -- departments with no employees
FROM departments d LEFT JOIN employees e ON e.dept_id = d.dept_id
WHERE e.emp_id IS NULL;
```

```sql run
SELECT d.dept_name, COUNT(e.emp_id) AS staff     -- count per department, zeros included
FROM departments d LEFT JOIN employees e ON e.dept_id = d.dept_id
GROUP BY d.dept_id, d.dept_name
ORDER BY d.dept_id;

SELECT e.name AS employee, m.name AS manager     -- self join
FROM employees e LEFT JOIN employees m ON e.manager_id = m.emp_id
ORDER BY e.emp_id;

SELECT e.name, d.dept_name                       -- full outer join
FROM employees e LEFT JOIN departments d ON e.dept_id = d.dept_id
UNION
SELECT e.name, d.dept_name
FROM employees e RIGHT JOIN departments d ON e.dept_id = d.dept_id
ORDER BY dept_name, name;

SELECT COUNT(*) AS combos FROM employees CROSS JOIN departments;
```

> TRAP: With a `LEFT JOIN`, count a column from the right table: `COUNT(e.emp_id)` gives Finance 0, but `COUNT(*)` gives 1 because the unmatched row itself is counted. Also, a condition on the right table placed in `WHERE` (instead of `ON`) removes the `NULL` rows and turns the left join back into an inner join.

# Part 6: Subqueries and set operations
%Queries inside queries, and combining result sets.

## Subqueries

| Kind | Returns | Used with |
|---|---|---|
| Scalar | One value | `=`, `>`, `<` ... or as a column: `(SELECT MAX(salary) FROM employees)` |
| Column | A list of values | `IN`, `NOT IN`, `> ANY (...)`, `> ALL (...)` |
| Table (derived table) | A temporary result set | `FROM (SELECT ...) AS t`: the alias is required |
| Correlated | Re-evaluated for each outer row | Refers to the outer query: `WHERE dept_id = e.dept_id` |
| `EXISTS` / `NOT EXISTS` | True if the subquery returns any row | Usually correlated; `SELECT 1` inside is fine |

```sql run
SELECT name, salary FROM employees                 -- above the overall average
WHERE salary > (SELECT AVG(salary) FROM employees)
ORDER BY salary DESC;

SELECT name FROM employees                         -- IN with a subquery
WHERE dept_id IN (SELECT dept_id FROM departments WHERE location = 'Bengaluru')
ORDER BY name;

SELECT e.name, e.dept_id, e.salary                 -- correlated: above their dept average
FROM employees e
WHERE e.salary > (SELECT AVG(salary) FROM employees WHERE dept_id = e.dept_id)
ORDER BY e.emp_id;

SELECT dept_name FROM departments d                -- EXISTS
WHERE EXISTS (SELECT 1 FROM employees e WHERE e.dept_id = d.dept_id AND e.salary > 60000)
ORDER BY d.dept_id;

SELECT MAX(avg_sal) AS best_dept_avg               -- derived table
FROM (SELECT AVG(salary) AS avg_sal FROM employees GROUP BY dept_id) AS t;
```

> TRAP: `NOT IN` with a subquery that returns a `NULL` matches **nothing**. `employees.dept_id` contains Zoya's `NULL`, so the first query is empty. Filter out `NULL`s or use `NOT EXISTS`.

```sql run
SELECT dept_name FROM departments
WHERE dept_id NOT IN (SELECT dept_id FROM employees);

SELECT dept_name FROM departments d
WHERE NOT EXISTS (SELECT 1 FROM employees e WHERE e.dept_id = d.dept_id);
```

A scalar subquery that returns more than one row fails with error 1242: *Subquery returns more than 1 row*. Use `IN`, or make it return one value with `MAX`, `LIMIT 1` or a tighter `WHERE`.

## UNION, INTERSECT and EXCEPT

| Operator | Result | Duplicates |
|---|---|---|
| `UNION` | Rows in either query | Removed |
| `UNION ALL` | Rows in either query | Kept (faster: no de-duplication step) |
| `INTERSECT` (8.0.31+) | Rows in both queries | Removed |
| `EXCEPT` (8.0.31+) | Rows in the first query but not the second | Removed |

Both queries must return the same number of columns with compatible types. Column names come from the first query, and a final `ORDER BY` sorts the combined result.

```sql run
SELECT name FROM employees WHERE dept_id = 1
UNION
SELECT name FROM employees WHERE salary > 60000 ORDER BY name;

SELECT COUNT(*) AS n FROM (
    SELECT name FROM employees WHERE dept_id = 1
    UNION ALL
    SELECT name FROM employees WHERE salary > 60000) AS t;

SELECT name FROM employees WHERE dept_id = 1
INTERSECT
SELECT name FROM employees WHERE salary > 60000 ORDER BY name;

SELECT name FROM employees WHERE salary > 60000
EXCEPT
SELECT name FROM employees WHERE dept_id = 1;
```

# Part 7: CTEs and window functions
%Named subqueries, recursion, and calculations across related rows (MySQL 8.0+).

## Common table expressions (WITH)

A CTE names a subquery so the main query reads top to bottom. Several CTEs are separated by commas, and later ones can use earlier ones.

```sql run
WITH dept_avg AS (
    SELECT dept_id, AVG(salary) AS avg_sal
    FROM employees GROUP BY dept_id
)
SELECT e.name, e.salary, ROUND(d.avg_sal) AS dept_avg
FROM employees e JOIN dept_avg d ON e.dept_id = d.dept_id
WHERE e.salary > d.avg_sal;
```

A **recursive** CTE has an anchor query and a recursive query joined by `UNION ALL`; the recursive part refers to the CTE itself and stops when it returns no new rows.

```sql run
WITH RECURSIVE n AS (
    SELECT 1 AS x
    UNION ALL
    SELECT x + 1 FROM n WHERE x < 5
)
SELECT GROUP_CONCAT(x) AS seq FROM n;

WITH RECURSIVE chain AS (                                   -- the reporting hierarchy
    SELECT emp_id, name, 1 AS depth, CAST(name AS CHAR(200)) AS path
    FROM employees WHERE manager_id IS NULL                 -- anchor: the top boss
    UNION ALL
    SELECT e.emp_id, e.name, c.depth + 1, CONCAT(c.path, ' > ', e.name)
    FROM employees e JOIN chain c ON e.manager_id = c.emp_id
)
SELECT name, depth, path FROM chain ORDER BY path;
```

> NOTE: The `CAST(... AS CHAR(200))` matters: a recursive CTE's column types are fixed by the anchor, so without it `path` would be only as wide as the longest name and longer paths would fail.

## Window functions

A window function computes a value from a set of rows related to the current row **without collapsing them** the way `GROUP BY` does. Syntax: `function() OVER (PARTITION BY ... ORDER BY ...)`.

| Function | Returns |
|---|---|
| `ROW_NUMBER()` | 1, 2, 3, ... with no ties |
| `RANK()` | Rank with gaps after ties: 1, 2, 2, 4 |
| `DENSE_RANK()` | Rank without gaps: 1, 2, 2, 3 |
| `NTILE(n)` | Bucket number 1..n (quartiles with n = 4) |
| `LAG(c, k, default)`, `LEAD(c, k, default)` | Value from k rows before / after (k defaults to 1) |
| `FIRST_VALUE(c)`, `LAST_VALUE(c)`, `NTH_VALUE(c, n)` | Value from a position in the window frame |
| `SUM`, `AVG`, `COUNT`, `MIN`, `MAX` with `OVER` | Running or per-partition aggregates |
| `PERCENT_RANK()`, `CUME_DIST()` | Relative position, 0 to 1 |
| `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` | Frame clause: e.g. a 3-row moving average |
| `WINDOW w AS (...)` ... `OVER w` | Name a window once and reuse it |

```sql run
SELECT name, dept_id, salary,
       ROW_NUMBER() OVER (ORDER BY salary DESC)                     AS rn,
       RANK()       OVER (PARTITION BY dept_id ORDER BY salary DESC) AS dept_rank,
       SUM(salary)  OVER (PARTITION BY dept_id)                     AS dept_total
FROM employees
ORDER BY rn;
```

```sql run
WITH scores (name, marks) AS (
    SELECT 'A', 90 UNION ALL SELECT 'B', 85 UNION ALL SELECT 'C', 85 UNION ALL SELECT 'D', 80
)
SELECT name, marks,
       ROW_NUMBER() OVER w AS row_num, RANK() OVER w AS rnk, DENSE_RANK() OVER w AS dense
FROM scores
WINDOW w AS (ORDER BY marks DESC);

SELECT name, hire_date, salary,
       LAG(name) OVER (ORDER BY hire_date)   AS hired_before,
       SUM(salary) OVER (ORDER BY hire_date) AS running_total
FROM employees ORDER BY hire_date;

WITH r AS (                                    -- top earner in each department
    SELECT name, dept_id, salary,
           DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS dr
    FROM employees
)
SELECT dept_id, name, salary FROM r
WHERE dr = 1 AND dept_id IS NOT NULL ORDER BY dept_id;
```

> TRAP: Window functions can't be used in `WHERE` (it runs before them); filter in an outer query or CTE, as in the last example. And `RANK` is a reserved word in MySQL 8, so `AS rank` is a syntax error: use another alias.

# Part 8: Built-in functions
%String, numeric, date/time and conversion functions.

## String functions

String positions in MySQL start at **1**, not 0.

| Function | Purpose | Example → result |
|---|---|---|
| `CONCAT(a, b, ...)` | Join strings (`NULL` if any argument is `NULL`) | `CONCAT('My', 'SQL')` → `MySQL` |
| `CONCAT_WS(sep, a, b, ...)` | Join with a separator, skipping `NULL`s | `CONCAT_WS('-', 'a', NULL, 'b')` → `a-b` |
| `LENGTH(s)`, `CHAR_LENGTH(s)` | Length in bytes / characters | `LENGTH('héllo')` → 6, `CHAR_LENGTH` → 5 |
| `UPPER(s)`, `LOWER(s)` | Change case | `UPPER('sql')` → `SQL` |
| `SUBSTRING(s, pos, len)` | Part of a string (negative pos counts from the end) | `SUBSTRING('placement', 1, 5)` → `place` |
| `LEFT(s, n)`, `RIGHT(s, n)` | First / last n characters | `RIGHT('MySQL', 3)` → `SQL` |
| `TRIM(s)`, `LTRIM`, `RTRIM` | Remove spaces | `TRIM(LEADING '0' FROM '00420')` → `420` |
| `REPLACE(s, from, to)` | Replace every occurrence | `REPLACE('a-b-c', '-', '+')` → `a+b+c` |
| `INSTR(s, sub)`, `LOCATE(sub, s, pos)` | Position of a substring, 0 if absent | `LOCATE('an', 'banana', 3)` → 4 |
| `LPAD(s, n, p)`, `RPAD(s, n, p)` | Pad to length n | `LPAD('7', 3, '0')` → `007` |
| `REVERSE(s)`, `REPEAT(s, n)` | Reverse / repeat | `REPEAT('ab', 3)` → `ababab` |
| `SUBSTRING_INDEX(s, delim, n)` | Text before the nth delimiter (after it if n < 0) | `SUBSTRING_INDEX('a.b.c', '.', -1)` → `c` |
| `FORMAT(x, d)` | Number with thousands separators | `FORMAT(1234567.891, 2)` → `1,234,567.89` |
| `STRCMP(a, b)` | -1, 0 or 1 | `STRCMP('a', 'b')` → -1 |
| `REGEXP_LIKE(s, re)`, `REGEXP_REPLACE` | Regular expressions | `REGEXP_LIKE('9876543210', '^[6-9][0-9]{9}$')` → 1 |

```sql run
SELECT name,
       CONCAT(UPPER(LEFT(name, 3)), emp_id) AS code,
       CHAR_LENGTH(name)                    AS len,
       SUBSTRING_INDEX(email, '@', -1)      AS domain,
       LPAD(salary, 7, '0')                 AS padded
FROM employees WHERE emp_id <= 103;
```

Neha's domain is `NULL` because her email is `NULL`: string functions pass `NULL` through.

> TIP: Comparisons are case-insensitive with the default collation (`utf8mb4_0900_ai_ci`): `'abc' = 'ABC'` is 1. Use `BINARY` or a `_bin` / `_cs` collation for case-sensitive matching.

## Numeric functions

| Function | Purpose | Example → result |
|---|---|---|
| `ROUND(x)`, `ROUND(x, d)` | Round half away from zero (exact numbers) | `ROUND(2.5)` → 3, `ROUND(-2.5)` → -3 |
| `ROUND(x, -d)` | Round to tens, hundreds, ... | `ROUND(123.456, -1)` → 120 |
| `TRUNCATE(x, d)` | Cut off decimals without rounding | `TRUNCATE(123.456, 1)` → 123.4 |
| `CEIL(x)`, `FLOOR(x)` | Round up / down to an integer | `CEIL(4.1)` → 5, `FLOOR(-4.1)` → -5 |
| `ABS(x)`, `SIGN(x)` | Absolute value / -1, 0, 1 | `ABS(-7)` → 7 |
| `MOD(a, b)`, `a % b` | Remainder (takes the sign of a) | `MOD(-7, 3)` → -1 |
| `a / b`, `a DIV b` | Decimal division / integer division | `10 / 4` → 2.5000, `10 DIV 4` → 2 |
| `POW(x, y)`, `SQRT(x)` | Power / square root | `POW(2, 10)` → 1024 |
| `GREATEST(...)`, `LEAST(...)` | Largest / smallest argument (not a column aggregate) | `GREATEST(3, 9, 5)` → 9 |
| `RAND()` | Random number in [0, 1) | `FLOOR(1 + RAND() * 6)`: a die roll |
| `PI()`, `LOG(x)`, `LOG10(x)`, `EXP(x)` | Maths constants and logarithms | `LOG10(1000)` → 3 |

```sql run
SELECT name, salary, ROUND(salary / 12, 2) AS monthly
FROM employees WHERE emp_id <= 103;

SELECT ROUND(2.5) AS r1, ROUND(-2.5) AS r2, ROUND(123.456, 2) AS r3,
       TRUNCATE(123.456, 1) AS t, 10 / 4 AS d, 10 DIV 4 AS i, MOD(-7, 3) AS m, 10 / 0 AS z;
```

> TRAP: Division by zero returns `NULL` with a warning, not an error, in a `SELECT`. And `ROUND` on `FLOAT`/`DOUBLE` values uses round-half-to-even on most systems (`ROUND(2.5E0)` → 2), unlike `DECIMAL` values.

## Date and time functions

The examples use the fixed date `'2026-10-15'` (a Thursday) so the results don't change; in real queries use `CURDATE()` or `NOW()`.

| Function | Purpose | Example → result |
|---|---|---|
| `NOW()`, `CURDATE()`, `CURTIME()` | Current date-time / date / time | `CURDATE()` → today, e.g. 2026-10-15 |
| `DATE(dt)`, `TIME(dt)` | Date or time part of a datetime | `DATE('2026-10-15 09:30:00')` → 2026-10-15 |
| `YEAR(d)`, `MONTH(d)`, `DAY(d)` | Parts as numbers | `MONTH('2026-10-15')` → 10 |
| `DAYNAME(d)`, `MONTHNAME(d)` | Names | `DAYNAME('2026-10-15')` → Thursday |
| `DAYOFWEEK(d)`, `WEEKDAY(d)` | Sunday = 1 ... / Monday = 0 ... | `DAYOFWEEK('2026-10-15')` → 5 |
| `DATE_ADD(d, INTERVAL n unit)`, `DATE_SUB` | Add / subtract (DAY, WEEK, MONTH, YEAR, HOUR ...) | `DATE_ADD('2026-10-15', INTERVAL 10 DAY)` → 2026-10-25 |
| `d + INTERVAL n unit` | Same as `DATE_ADD`; month-ends are clamped | `'2026-01-31' + INTERVAL 1 MONTH` → 2026-02-28 |
| `DATEDIFF(a, b)` | Days from b to a | `DATEDIFF('2026-10-15', '2026-10-03')` → 12 |
| `TIMESTAMPDIFF(unit, a, b)` | Whole units from a to b (age in years) | `TIMESTAMPDIFF(YEAR, '2004-05-20', '2026-10-15')` → 22 |
| `LAST_DAY(d)` | Last day of that month | `LAST_DAY('2026-02-10')` → 2026-02-28 |
| `DATE_FORMAT(d, fmt)` | Date to formatted text | `DATE_FORMAT('2026-10-15', '%d %b %Y')` → 15 Oct 2026 |
| `STR_TO_DATE(s, fmt)` | Text to date | `STR_TO_DATE('15/10/2026', '%d/%m/%Y')` → 2026-10-15 |
| `EXTRACT(unit FROM d)` | Standard-SQL way to get a part | `EXTRACT(QUARTER FROM '2026-10-15')` → 4 |

| Format | Meaning | Example | Format | Meaning | Example |
|---|---|---|---|---|---|
| `%Y` / `%y` | Year, 4 / 2 digits | 2026 / 26 | `%H` / `%h` | Hour 00-23 / 01-12 | 09 / 09 |
| `%m` / `%c` | Month 01-12 / 1-12 | 10 / 10 | `%i` | Minutes | 30 |
| `%M` / `%b` | Month name / short | October / Oct | `%s` | Seconds | 00 |
| `%d` / `%e` | Day 01-31 / 1-31 | 15 / 15 | `%p` | AM or PM | AM |
| `%W` / `%a` | Weekday / short | Thursday / Thu | `%T` | Time, 24-hour | 09:30:00 |

```sql run
SELECT name, hire_date,
       DATE_FORMAT(hire_date, '%d %b %Y')            AS joined,
       DAYNAME(hire_date)                           AS day,
       TIMESTAMPDIFF(YEAR, hire_date, '2026-10-15') AS years
FROM employees ORDER BY hire_date;

SELECT DATE_ADD('2026-10-15', INTERVAL 10 DAY) AS plus10,
       '2026-01-31' + INTERVAL 1 MONTH          AS feb,
       DATEDIFF('2026-10-15', '2026-10-03')     AS days,
       DATE_FORMAT('2026-10-15 09:30:00', '%d %b %Y, %h:%i %p') AS formatted;
```

> TIP: To filter a date range, compare the column directly: `WHERE hire_date >= '2021-01-01' AND hire_date < '2022-01-01'`. Wrapping the column, as in `WHERE YEAR(hire_date) = 2021`, gives the same rows but stops MySQL from using an index on `hire_date`.

## Conversion functions

| Expression | Result | Notes |
|---|---|---|
| `CAST(x AS SIGNED)` / `UNSIGNED` | Integer | `CAST('42abc' AS SIGNED)` → 42 with a warning; `CAST(3.7 AS SIGNED)` → 4 (rounds) |
| `CAST(x AS DECIMAL(10,2))` | Exact decimal | `CAST('19.999' AS DECIMAL(10,2))` → 20.00 |
| `CAST(x AS CHAR)` | String | `CAST(85000 AS CHAR)` → '85000' |
| `CAST(s AS DATE)` / `DATETIME` | Date | Text must be in `YYYY-MM-DD` form, otherwise use `STR_TO_DATE` |
| `CONVERT(x, type)` | Same as `CAST` | `CONVERT('7', UNSIGNED)` → 7 |
| Implicit conversion | MySQL converts text to numbers in arithmetic | `'5' + 3` → 8; `'abc' = 0` → 1 (!) |
