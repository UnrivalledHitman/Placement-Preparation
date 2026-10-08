# How to use this reference
%What the reference covers, how it is laid out, and the sample database every example runs on

The MySQL statements and functions you will use most, each with a table of options and a worked example showing its real output.

Each section covers one topic: what it is for, a table of its most-used forms, and an example query with its result as the `mysql` command-line client prints it (timings removed). Every example was run against a real **MySQL 8.0.46** server with default settings (strict SQL mode, `utf8mb4_0900_ai_ci`). Every example runs against the same small **company** database, set up on the next page, so you can type the queries in and compare.

| Part | Topic | Covers |
|---|---|---|
| 1 | Databases and tables | Data types, constraints, `CREATE`, `ALTER`, `DROP` |
| 2 | Changing data | `INSERT`, `UPDATE`, `DELETE`, upserts, `TRUNCATE` |
| 3 | Querying | `SELECT`, `WHERE`, `ORDER BY`, `LIMIT`, `CASE`, `NULL` handling |
| 4 | Aggregation | `COUNT`, `SUM`, `AVG`, `GROUP BY`, `HAVING`, `GROUP_CONCAT`, `ROLLUP` |
| 5 | Joins | Inner, left, right, self, cross and full outer joins |
| 6 | Subqueries and set operations | Scalar, `IN`, `EXISTS`, correlated, derived tables, `UNION` |
| 7 | CTEs and window functions | `WITH`, recursive CTEs, `ROW_NUMBER`, `RANK`, `LAG`, running totals |
| 8 | Built-in functions | String, numeric, date/time and conversion functions |
| 9 | Views and indexes | `CREATE VIEW`, index types, `EXPLAIN` |
| 10 | Stored programs | Procedures, functions, triggers, control flow |
| 11 | Transactions and users | `COMMIT`, `ROLLBACK`, savepoints, isolation, `GRANT` |
| 12 | MySQL from Java | JDBC: `Connection`, `PreparedStatement`, `ResultSet` |

Conventions: SQL keywords are written in capitals (MySQL itself is case-insensitive for keywords). `t` is a table, `c` a column, `expr` any expression. Syntax targets **MySQL 8.0**; `INTERSECT` and `EXCEPT` need 8.0.31 or later.

> TIP: Run `SELECT VERSION();` to check your server version. Most online judges and the TCS iON platform use MySQL 8.

## The sample database

Two tables: **departments** and **employees**. Note the deliberate edge cases: Neha has no email, Zoya has no department, and Finance has no employees. These are what make joins, `NULL` handling and aggregates interesting.

```sql fresh
CREATE DATABASE IF NOT EXISTS company;
USE company;

CREATE TABLE departments (
    dept_id   INT AUTO_INCREMENT PRIMARY KEY,
    dept_name VARCHAR(30) NOT NULL UNIQUE,
    location  VARCHAR(30) DEFAULT 'Remote'
);

CREATE TABLE employees (
    emp_id     INT PRIMARY KEY,
    name       VARCHAR(50) NOT NULL,
    dept_id    INT,
    salary     INT NOT NULL,
    hire_date  DATE NOT NULL,
    manager_id INT,
    email      VARCHAR(100) UNIQUE,
    CHECK (salary > 0),
    FOREIGN KEY (dept_id) REFERENCES departments (dept_id),
    FOREIGN KEY (manager_id) REFERENCES employees (emp_id)
);

INSERT INTO departments (dept_name, location) VALUES
    ('IT', 'Bengaluru'), ('HR', 'Mumbai'), ('Ops', 'Pune'), ('Finance', 'Kolkata');

INSERT INTO employees VALUES
    (101, 'Asha',  1,    85000, '2019-06-12', NULL, 'asha@tcs.com'),
    (102, 'Ravi',  2,    50000, '2021-03-01', 101,  'ravi@gmail.com'),
    (103, 'Neha',  1,    71000, '2020-11-23', 101,  NULL),
    (104, 'Arjun', 2,    62000, '2018-01-15', 101,  'arjun@tcs.com'),
    (105, 'Sam',   3,    55000, '2022-08-30', 104,  'sam@yahoo.com'),
    (106, 'Zoya',  NULL, 48000, '2023-02-10', 104,  'zoya@tcs.com');

SELECT * FROM departments;
SELECT * FROM employees;
```

> NOTE: Salary is an `INT` here to keep outputs short. For real money use `DECIMAL(10,2)`, never `FLOAT` or `DOUBLE`.

# Part 1: Databases and tables
%Defining structure: data types, constraints, and the DDL statements that create and change tables.

## Data types

| Type | Stores | Notes |
|---|---|---|
| `TINYINT`, `SMALLINT`, `INT`, `BIGINT` | Whole numbers (1, 2, 4, 8 bytes) | `INT` range is about ±2.1 billion; add `UNSIGNED` for 0 and up |
| `DECIMAL(p, s)` | Exact decimals: p digits, s after the point | `DECIMAL(10,2)` holds up to 99999999.99; use it for money |
| `FLOAT`, `DOUBLE` | Approximate decimals | Fast but inexact: `0.1 + 0.2` is not exactly `0.3` |
| `CHAR(n)` | Fixed-length text, padded | Good for codes of a known length: country, PIN |
| `VARCHAR(n)` | Variable-length text up to n characters | The default choice for strings |
| `TEXT`, `MEDIUMTEXT` | Long text (64 KB, 16 MB) | No literal `DEFAULT` allowed; index only a prefix |
| `DATE` | `'YYYY-MM-DD'` | `'2026-10-15'` |
| `TIME` | `'HH:MM:SS'` | Also durations, up to 838 hours |
| `DATETIME` | `'YYYY-MM-DD HH:MM:SS'` | Stored as written; no time-zone conversion |
| `TIMESTAMP` | Date and time, stored as UTC | Converted to the session time zone; range 1970 to 2038 |
| `YEAR` | A year | `2026` |
| `BOOLEAN` / `BOOL` | Alias for `TINYINT(1)` | `TRUE` is 1, `FALSE` is 0 |
| `ENUM('a', 'b')` | One value from a fixed list | `ENUM('M', 'F', 'O')` |
| `JSON` | A validated JSON document | Read with `->>`: `doc->>'$.city'` |

## Constraints

Constraints are rules the database enforces on every insert and update.

| Constraint | Meaning | Example |
|---|---|---|
| `PRIMARY KEY` | Unique and not null; one per table; identifies a row | `emp_id INT PRIMARY KEY` |
| `AUTO_INCREMENT` | Next number generated automatically | `id INT AUTO_INCREMENT PRIMARY KEY` |
| `NOT NULL` | A value is required | `name VARCHAR(50) NOT NULL` |
| `UNIQUE` | No duplicates (multiple `NULL`s are allowed) | `email VARCHAR(100) UNIQUE` |
| `DEFAULT v` | Value used when none is given | `location VARCHAR(30) DEFAULT 'Remote'` |
| `CHECK (cond)` | Row must satisfy the condition (enforced since 8.0.16) | `CHECK (salary > 0)` |
| `FOREIGN KEY ... REFERENCES` | Value must exist in the parent table | `FOREIGN KEY (dept_id) REFERENCES departments (dept_id)` |
| `ON DELETE CASCADE` / `SET NULL` | What happens to children when the parent row is deleted | `... REFERENCES departments (dept_id) ON DELETE SET NULL` |
| Composite key | Key made of several columns | `PRIMARY KEY (student_id, course_id)` |

Each insert below breaks one rule of the sample schema:

```sql run
INSERT INTO employees VALUES (107, 'Kabir', 9, 40000, '2024-01-01', NULL, NULL);  -- no dept 9
INSERT INTO employees VALUES (107, 'Kabir', 1, 40000, '2024-01-01', NULL, 'asha@tcs.com');
INSERT INTO employees VALUES (107, 'Kabir', 1, -5, '2024-01-01', NULL, NULL);
INSERT INTO employees (emp_id, salary, hire_date) VALUES (107, 40000, '2024-01-01');
DELETE FROM departments WHERE dept_id = 1;                 -- IT still has employees
```

## CREATE, ALTER and DROP

| Statement | Purpose |
|---|---|
| `CREATE DATABASE IF NOT EXISTS db;` / `USE db;` | Create / switch database |
| `SHOW DATABASES;` / `SHOW TABLES;` | List databases / tables |
| `DESCRIBE t;` (or `DESC t;`) | Columns, types, keys and defaults |
| `SHOW CREATE TABLE t;` | The full `CREATE` statement, including constraint names |
| `CREATE TABLE t2 LIKE t;` | Empty copy of the structure (indexes included, foreign keys not) |
| `CREATE TABLE t2 AS SELECT ...;` | New table filled from a query (no keys copied) |
| `ALTER TABLE t ADD COLUMN c type [FIRST \| AFTER x];` | Add a column |
| `ALTER TABLE t MODIFY COLUMN c newtype;` | Change type or constraints, same name |
| `ALTER TABLE t CHANGE old new type;` | Rename and retype in one go |
| `ALTER TABLE t RENAME COLUMN a TO b;` | Rename only |
| `ALTER TABLE t ALTER COLUMN c SET DEFAULT v;` | Change just the default |
| `ALTER TABLE t DROP COLUMN c;` | Remove a column |
| `ALTER TABLE t ADD CONSTRAINT name UNIQUE (c);` | Add a constraint later |
| `ALTER TABLE t DROP FOREIGN KEY name;` | Remove a foreign key (by its name) |
| `RENAME TABLE a TO b;` | Rename a table |
| `DROP TABLE IF EXISTS t;` | Delete the table and its data |
| `TRUNCATE TABLE t;` | Delete all rows fast; resets `AUTO_INCREMENT` |

```sql run
DESCRIBE employees;

ALTER TABLE employees ADD COLUMN phone VARCHAR(15) AFTER email;
ALTER TABLE employees ALTER COLUMN phone SET DEFAULT 'n/a';
SHOW COLUMNS FROM employees LIKE 'phone';

ALTER TABLE employees RENAME COLUMN phone TO mobile;
ALTER TABLE employees DROP COLUMN mobile;
SHOW COLUMNS FROM employees LIKE 'mobile';
```

Key column: `PRI` primary key, `UNI` unique, `MUL` a non-unique index (MySQL indexes every foreign key automatically).

> TRAP: `MODIFY` restates the whole column definition. `ALTER TABLE t MODIFY c VARCHAR(80);` silently drops a `NOT NULL` or `DEFAULT` that was on `c` unless you repeat it.

# Part 2: Changing data
%INSERT, UPDATE and DELETE (the DML statements), plus upserts.

## INSERT, UPDATE and DELETE

| Statement | Purpose |
|---|---|
| `INSERT INTO t (c1, c2) VALUES (v1, v2);` | Insert one row; unlisted columns get their default |
| `INSERT INTO t VALUES (...), (...), (...);` | Several rows at once (values for every column, in order) |
| `INSERT INTO t (cols) SELECT ...;` | Insert the result of a query |
| `INSERT IGNORE INTO t ...;` | Skip rows that would violate a unique key, with a warning |
| `INSERT ... AS new ON DUPLICATE KEY UPDATE c = new.c;` | Upsert: update the existing row when the key already exists |
| `REPLACE INTO t ...;` | Delete the conflicting row, then insert (a new row, not an update) |
| `UPDATE t SET c1 = v1, c2 = v2 WHERE cond;` | Change matching rows |
| `DELETE FROM t WHERE cond;` | Remove matching rows |
| `SELECT LAST_INSERT_ID();` | The `AUTO_INCREMENT` value generated by your last insert |
| `SELECT ROW_COUNT();` | Rows changed by the previous statement |

These examples use a separate **products** table so the sample data stays unchanged:

```sql run
CREATE TABLE products (
    id    INT AUTO_INCREMENT PRIMARY KEY,
    name  VARCHAR(30) UNIQUE,
    price DECIMAL(8,2),
    stock INT DEFAULT 0
);

INSERT INTO products (name, price, stock)
VALUES ('Pen', 10.00, 100), ('Notebook', 45.50, 40), ('Bag', 799.00, 5);
INSERT INTO products (name, price) VALUES ('Ruler', 15.00);     -- stock gets DEFAULT 0
SELECT LAST_INSERT_ID();

UPDATE products SET price = price * 1.10 WHERE price < 50;    -- 10% rise on cheap items

INSERT INTO products (name, price, stock) VALUES ('Pen', 12.00, 50) AS new
ON DUPLICATE KEY UPDATE stock = products.stock + new.stock;   -- Pen exists: add stock

DELETE FROM products WHERE stock = 0;
SELECT * FROM products;
```

An upsert that updates an existing row reports **2 rows affected** (1 means a new row was inserted, 0 means nothing changed). Pen kept its old price because only `stock` was listed after `UPDATE`.

> TRAP: With a row alias (`AS new`), qualify the table's own column: `stock = products.stock + new.stock`. Writing `stock = stock + new.stock` fails with `ERROR 1052 (23000): Column 'stock' in field list is ambiguous`, because `stock` could mean either the table's column or the alias's. (The older form `stock = stock + VALUES(stock)` still works but is deprecated since MySQL 8.0.20.)

> TRAP: An `UPDATE` or `DELETE` without `WHERE` changes **every row**. Write the `WHERE` first, or test it as a `SELECT` before running the change. MySQL Workbench's safe-update mode blocks such statements with error 1175.

## DELETE vs TRUNCATE vs DROP

|  | DELETE FROM t | TRUNCATE TABLE t | DROP TABLE t |
|---|---|---|---|
| Removes | Chosen rows (or all) | All rows | Rows and the table itself |
| `WHERE` allowed | Yes | No | No |
| Can be rolled back | Yes, inside a transaction | No (implicit commit) | No (implicit commit) |
| Fires `DELETE` triggers | Yes | No | No |
| `AUTO_INCREMENT` | Keeps counting | Reset to 1 | Gone |
| Speed on big tables | Slow (row by row) | Fast | Fast |
| Category | DML | DDL | DDL |

# Part 3: Querying
%SELECT: filtering, sorting, limiting, and handling NULL.

## SELECT and WHERE

| Clause | Purpose | Example |
|---|---|---|
| `SELECT c1, c2` / `SELECT *` | Columns or expressions to return | `SELECT name, salary * 12` |
| `AS alias` | Rename a column or table | `salary * 12 AS annual` |
| `FROM t` | Source table(s) | `FROM employees e` |
| `WHERE cond` | Keep rows where cond is true | `WHERE dept_id = 1` |
| `ORDER BY c [ASC \| DESC]` | Sort (several columns allowed) | `ORDER BY dept_id, salary DESC` |
| `LIMIT n` / `LIMIT n OFFSET m` | First n rows / skip m rows first | `LIMIT 10 OFFSET 20` (page 3) |
| `DISTINCT` | Remove duplicate result rows | `SELECT DISTINCT dept_id` |

| Operator | Meaning | Example |
|---|---|---|
| `=`, `<>` (or `!=`), `<`, `>`, `<=`, `>=` | Comparison | `salary >= 60000` |
| `BETWEEN a AND b` | Inclusive range | `salary BETWEEN 50000 AND 72000` |
| `IN (list)` / `NOT IN` | Matches any value in the list | `dept_id IN (1, 3)` |
| `LIKE` with `%` and `_` | `%` any characters, `_` exactly one | `name LIKE 'A%'`, `name LIKE '_a%'` |
| `IS NULL` / `IS NOT NULL` | Test for missing values | `email IS NULL` |
| `AND`, `OR`, `NOT` | Combine conditions (`AND` binds tighter than `OR`) | `(a OR b) AND c` |
| `REGEXP` | Regular-expression match | `email REGEXP '@(tcs\|gmail)\\.com$'` |
| `<=>` | Null-safe equality: `NULL <=> NULL` is 1 | `manager_id <=> NULL` |

```sql run
SELECT name, salary, salary * 12 AS annual
FROM employees
WHERE salary BETWEEN 50000 AND 72000
ORDER BY salary DESC;

SELECT name, email FROM employees WHERE email LIKE '%@tcs.com';
SELECT name FROM employees WHERE dept_id IN (1, 3) ORDER BY name;
SELECT name FROM employees WHERE email IS NULL;
```

> TRAP: `AND` is evaluated before `OR`. Without brackets the first query below means *IT, or (HR and over 80000)*.

```sql run
SELECT name FROM employees WHERE dept_id = 1 OR dept_id = 2 AND salary > 80000;
SELECT name FROM employees WHERE (dept_id = 1 OR dept_id = 2) AND salary > 80000;
```

## ORDER BY, LIMIT and DISTINCT

```sql run
SELECT DISTINCT dept_id FROM employees ORDER BY dept_id;      -- NULL sorts first

SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 3;  -- top 3 earners

SELECT DISTINCT salary FROM employees                            -- 2nd highest salary
ORDER BY salary DESC LIMIT 1 OFFSET 1;
```

`LIMIT 1 OFFSET 1` can also be written `LIMIT 1, 1`: in that short form the **first** number is the offset. `DISTINCT` makes the "Nth highest" query correct when salaries repeat; Part 7 shows the `DENSE_RANK` version.

> TIP: Without `ORDER BY`, MySQL returns rows in no guaranteed order. Always sort when the order matters, including before `LIMIT`.

## CASE and NULL handling

`NULL` means *unknown*. Any comparison or arithmetic with `NULL` gives `NULL`, which `WHERE` treats as false.

| Expression | Returns | Example → result |
|---|---|---|
| `CASE WHEN c1 THEN r1 WHEN c2 THEN r2 ELSE r END` | First matching branch (`NULL` if none and no `ELSE`) | see the example |
| `CASE x WHEN v1 THEN r1 ... END` | Simple form: compares x to each value | `CASE dept_id WHEN 1 THEN 'IT' END` |
| `IF(cond, a, b)` | a if cond is true, else b | `IF(5 > 3, 'yes', 'no')` → `yes` |
| `IFNULL(x, d)` | x, or d when x is `NULL` | `IFNULL(NULL, 0)` → `0` |
| `COALESCE(a, b, c, ...)` | First non-`NULL` argument (standard SQL) | `COALESCE(NULL, NULL, 'x')` → `x` |
| `NULLIF(a, b)` | `NULL` if a = b, else a (avoids divide by zero) | `total / NULLIF(cnt, 0)` |
| `ISNULL(x)` | 1 if x is `NULL` | `ISNULL(email)` |

```sql run
SELECT name, salary,
       CASE WHEN salary >= 70000 THEN 'High'
            WHEN salary >= 55000 THEN 'Mid'
            ELSE 'Low' END        AS band,
       IFNULL(email, 'not given') AS email
FROM employees ORDER BY emp_id;

SELECT NULL = NULL AS eq, NULL <=> NULL AS null_safe, NULL + 5 AS plus,
       COALESCE(NULL, NULL, 'x') AS coal, NULLIF(10, 10) AS nif,
       IF(5 > 3, 'yes', 'no') AS if_res, IFNULL(NULL, 0) AS ifn;
```

> TRAP: Never write `WHERE email = NULL`: it matches nothing, because `NULL = NULL` is `NULL`, not true. Use `IS NULL`.

# Part 4: Aggregation
%Summarising many rows into one, overall or per group.

## Aggregate functions

| Function | Returns | NULL handling |
|---|---|---|
| `COUNT(*)` | Number of rows | Counts every row |
| `COUNT(c)` | Number of non-null values in c | Skips `NULL` |
| `COUNT(DISTINCT c)` | Number of different non-null values | Skips `NULL` |
| `SUM(c)`, `AVG(c)` | Total / mean (`AVG` of integers gives 4 decimals) | Skip `NULL`; `NULL` if no rows |
| `MIN(c)`, `MAX(c)` | Smallest / largest (works on numbers, text and dates) | Skip `NULL` |
| `GROUP_CONCAT(c ORDER BY x SEPARATOR ', ')` | Values joined into one string | Skips `NULL`; 1024-character limit by default |
| `STDDEV(c)`, `VARIANCE(c)` | Spread of the values | Skip `NULL` |

```sql run
SELECT COUNT(*) AS total, COUNT(email) AS with_email, COUNT(DISTINCT dept_id) AS depts,
       SUM(salary) AS payroll, AVG(salary) AS avg_sal,
       MIN(hire_date) AS first_hire, MAX(salary) AS top_sal
FROM employees;
```

## GROUP BY and HAVING

`GROUP BY` makes one output row per distinct value; aggregates are then calculated per group. `WHERE` filters rows **before** grouping, `HAVING` filters groups **after**.

```sql run
SELECT dept_id, COUNT(*) AS staff, SUM(salary) AS total, AVG(salary) AS avg_sal
FROM employees
GROUP BY dept_id
ORDER BY dept_id;

SELECT dept_id, COUNT(*) AS staff, AVG(salary) AS avg_sal
FROM employees
WHERE dept_id IS NOT NULL          -- row filter, before grouping
GROUP BY dept_id
HAVING avg_sal > 55000             -- group filter, after grouping
ORDER BY dept_id;

SELECT dept_id, GROUP_CONCAT(name ORDER BY name SEPARATOR ', ') AS team
FROM employees WHERE dept_id IS NOT NULL GROUP BY dept_id ORDER BY dept_id;

SELECT dept_id, SUM(salary) AS total
FROM employees WHERE dept_id IS NOT NULL
GROUP BY dept_id WITH ROLLUP;      -- adds a grand-total row
```

Rows with a `NULL` key form their own group (Zoya, first result). In the `ROLLUP` result the `NULL` marks the total row; use `GROUPING(dept_id)` to tell it apart from a real `NULL`.

> TRAP: Aggregates are not allowed in `WHERE`: `WHERE AVG(salary) > 55000` fails with error 1111. And every selected column must be grouped or aggregated: `SELECT dept_id, name ... GROUP BY dept_id` fails with error 1055 under the default `ONLY_FULL_GROUP_BY` mode.
