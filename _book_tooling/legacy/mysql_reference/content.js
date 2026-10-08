// Content for the MySQL reference. Block types:
// part, h2, h3, p, table, sql, java, out, trap, tip, note, pre
const N = null;

const EMP_COLS = ['emp_id', 'name', 'dept_id', 'salary', 'hire_date', 'manager_id', 'email'];
const EMP_ROWS = [
  [101, 'Asha', 1, 85000, '2019-06-12', N, 'asha@tcs.com'],
  [102, 'Ravi', 2, 50000, '2021-03-01', 101, 'ravi@gmail.com'],
  [103, 'Neha', 1, 71000, '2020-11-23', 101, N],
  [104, 'Arjun', 2, 62000, '2018-01-15', 101, 'arjun@tcs.com'],
  [105, 'Sam', 3, 55000, '2022-08-30', 104, 'sam@yahoo.com'],
  [106, 'Zoya', N, 48000, '2023-02-10', 104, 'zoya@tcs.com'],
];

module.exports = [
  // ---------------------------------------------------------------- intro
  ['intro', 'How to use this reference'],
  ['p', 'The MySQL statements and functions you will use most, each with a table of options and a worked example showing its real output.'],
  ['p', 'Each section covers one topic: what it is for, a table of its most-used forms, and an example query with the result exactly as the `mysql` command-line client prints it (timings removed). Every example runs against the same small **company** database, set up on the next page, so you can type the queries in and compare.'],
  ['table', ['Part', 'Topic', 'Covers'], [
    ['1', 'Databases and tables', 'Data types, constraints, `CREATE`, `ALTER`, `DROP`'],
    ['2', 'Changing data', '`INSERT`, `UPDATE`, `DELETE`, upserts, `TRUNCATE`'],
    ['3', 'Querying', '`SELECT`, `WHERE`, `ORDER BY`, `LIMIT`, `CASE`, `NULL` handling'],
    ['4', 'Aggregation', '`COUNT`, `SUM`, `AVG`, `GROUP BY`, `HAVING`, `GROUP_CONCAT`, `ROLLUP`'],
    ['5', 'Joins', 'Inner, left, right, self, cross and full outer joins'],
    ['6', 'Subqueries and set operations', 'Scalar, `IN`, `EXISTS`, correlated, derived tables, `UNION`'],
    ['7', 'CTEs and window functions', '`WITH`, recursive CTEs, `ROW_NUMBER`, `RANK`, `LAG`, running totals'],
    ['8', 'Built-in functions', 'String, numeric, date/time and conversion functions'],
    ['9', 'Views and indexes', '`CREATE VIEW`, index types, `EXPLAIN`'],
    ['10', 'Stored programs', 'Procedures, functions, triggers, control flow'],
    ['11', 'Transactions and users', '`COMMIT`, `ROLLBACK`, savepoints, isolation, `GRANT`'],
    ['12', 'MySQL from Java', 'JDBC: `Connection`, `PreparedStatement`, `ResultSet`'],
  ], [8, 30, 62]],
  ['p', 'Conventions: SQL keywords are written in capitals (MySQL itself is case-insensitive for keywords). `t` is a table, `c` a column, `expr` any expression. Syntax targets **MySQL 8.0**; `INTERSECT` and `EXCEPT` need 8.0.31 or later.'],
  ['tip', 'Run `SELECT VERSION();` to check your server version. Most online judges and the TCS iON platform use MySQL 8.'],

  ['h2', 'The sample database'],
  ['p', 'Two tables: **departments** and **employees**. Note the deliberate edge cases: Neha has no email, Zoya has no department, and Finance has no employees. These are what make joins, `NULL` handling and aggregates interesting.'],
  ['sql', `CREATE DATABASE IF NOT EXISTS company;
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
SELECT * FROM employees;`],
  ['out', [
    { cols: ['dept_id', 'dept_name', 'location'], rows: [[1, 'IT', 'Bengaluru'], [2, 'HR', 'Mumbai'], [3, 'Ops', 'Pune'], [4, 'Finance', 'Kolkata']] },
    { cols: EMP_COLS, rows: EMP_ROWS },
  ]],
  ['note', 'Salary is an `INT` here to keep outputs short. For real money use `DECIMAL(10,2)`, never `FLOAT` or `DOUBLE`.'],

  // ---------------------------------------------------------------- part 1
  ['part', 'Part 1: Databases and tables', 'Defining structure: data types, constraints, and the DDL statements that create and change tables.'],
  ['h2', 'Data types'],
  ['table', ['Type', 'Stores', 'Notes'], [
    ['`TINYINT`, `SMALLINT`, `INT`, `BIGINT`', 'Whole numbers (1, 2, 4, 8 bytes)', '`INT` range is about ±2.1 billion; add `UNSIGNED` for 0 and up'],
    ['`DECIMAL(p, s)`', 'Exact decimals: p digits, s after the point', '`DECIMAL(10,2)` holds up to 99999999.99; use it for money'],
    ['`FLOAT`, `DOUBLE`', 'Approximate decimals', 'Fast but inexact: `0.1 + 0.2` is not exactly `0.3`'],
    ['`CHAR(n)`', 'Fixed-length text, padded', 'Good for codes of a known length: country, PIN'],
    ['`VARCHAR(n)`', 'Variable-length text up to n characters', 'The default choice for strings'],
    ['`TEXT`, `MEDIUMTEXT`', 'Long text (64 KB, 16 MB)', 'No literal `DEFAULT` allowed; index only a prefix'],
    ['`DATE`', '`\'YYYY-MM-DD\'`', '`\'2026-10-15\'`'],
    ['`TIME`', '`\'HH:MM:SS\'`', 'Also durations, up to 838 hours'],
    ['`DATETIME`', '`\'YYYY-MM-DD HH:MM:SS\'`', 'Stored as written; no time-zone conversion'],
    ['`TIMESTAMP`', 'Date and time, stored as UTC', 'Converted to the session time zone; range 1970 to 2038'],
    ['`YEAR`', 'A year', '`2026`'],
    ['`BOOLEAN` / `BOOL`', 'Alias for `TINYINT(1)`', '`TRUE` is 1, `FALSE` is 0'],
    ['`ENUM(\'a\', \'b\')`', 'One value from a fixed list', '`ENUM(\'M\', \'F\', \'O\')`'],
    ['`JSON`', 'A validated JSON document', 'Read with `->>`: `doc->>\'$.city\'`'],
  ], [30, 34, 36]],

  ['h2', 'Constraints'],
  ['p', 'Constraints are rules the database enforces on every insert and update.'],
  ['table', ['Constraint', 'Meaning', 'Example'], [
    ['`PRIMARY KEY`', 'Unique and not null; one per table; identifies a row', '`emp_id INT PRIMARY KEY`'],
    ['`AUTO_INCREMENT`', 'Next number generated automatically', '`id INT AUTO_INCREMENT PRIMARY KEY`'],
    ['`NOT NULL`', 'A value is required', '`name VARCHAR(50) NOT NULL`'],
    ['`UNIQUE`', 'No duplicates (multiple `NULL`s are allowed)', '`email VARCHAR(100) UNIQUE`'],
    ['`DEFAULT v`', 'Value used when none is given', '`location VARCHAR(30) DEFAULT \'Remote\'`'],
    ['`CHECK (cond)`', 'Row must satisfy the condition (enforced since 8.0.16)', '`CHECK (salary > 0)`'],
    ['`FOREIGN KEY ... REFERENCES`', 'Value must exist in the parent table', '`FOREIGN KEY (dept_id) REFERENCES departments (dept_id)`'],
    ['`ON DELETE CASCADE` / `SET NULL`', 'What happens to children when the parent row is deleted', '`... REFERENCES departments (dept_id) ON DELETE SET NULL`'],
    ['Composite key', 'Key made of several columns', '`PRIMARY KEY (student_id, course_id)`'],
  ], [27, 37, 36]],
  ['p', 'Each insert below breaks one rule of the sample schema:'],
  ['sql', `INSERT INTO employees VALUES (107, 'Kabir', 9, 40000, '2024-01-01', NULL, NULL);  -- no dept 9
INSERT INTO employees VALUES (107, 'Kabir', 1, 40000, '2024-01-01', NULL, 'asha@tcs.com');
INSERT INTO employees VALUES (107, 'Kabir', 1, -5, '2024-01-01', NULL, NULL);
INSERT INTO employees (emp_id, salary, hire_date) VALUES (107, 40000, '2024-01-01');
DELETE FROM departments WHERE dept_id = 1;                 -- IT still has employees`],
  ['out', [
    "ERROR 1452 (23000): Cannot add or update a child row: a foreign key constraint fails (`company`.`employees`, CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`dept_id`))",
    "ERROR 1062 (23000): Duplicate entry 'asha@tcs.com' for key 'employees.email'",
    "ERROR 3819 (HY000): Check constraint 'employees_chk_1' is violated.",
    "ERROR 1364 (HY000): Field 'name' doesn't have a default value",
    "ERROR 1451 (23000): Cannot delete or update a parent row: a foreign key constraint fails (`company`.`employees`, CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`dept_id`))",
  ]],

  ['h2', 'CREATE, ALTER and DROP'],
  ['table', ['Statement', 'Purpose'], [
    ['`CREATE DATABASE IF NOT EXISTS db;` / `USE db;`', 'Create / switch database'],
    ['`SHOW DATABASES;` / `SHOW TABLES;`', 'List databases / tables'],
    ['`DESCRIBE t;` (or `DESC t;`)', 'Columns, types, keys and defaults'],
    ['`SHOW CREATE TABLE t;`', 'The full `CREATE` statement, including constraint names'],
    ['`CREATE TABLE t2 LIKE t;`', 'Empty copy of the structure (indexes included, foreign keys not)'],
    ['`CREATE TABLE t2 AS SELECT ...;`', 'New table filled from a query (no keys copied)'],
    ['`ALTER TABLE t ADD COLUMN c type [FIRST | AFTER x];`', 'Add a column'],
    ['`ALTER TABLE t MODIFY COLUMN c newtype;`', 'Change type or constraints, same name'],
    ['`ALTER TABLE t CHANGE old new type;`', 'Rename and retype in one go'],
    ['`ALTER TABLE t RENAME COLUMN a TO b;`', 'Rename only'],
    ['`ALTER TABLE t ALTER COLUMN c SET DEFAULT v;`', 'Change just the default'],
    ['`ALTER TABLE t DROP COLUMN c;`', 'Remove a column'],
    ['`ALTER TABLE t ADD CONSTRAINT name UNIQUE (c);`', 'Add a constraint later'],
    ['`ALTER TABLE t DROP FOREIGN KEY name;`', 'Remove a foreign key (by its name)'],
    ['`RENAME TABLE a TO b;`', 'Rename a table'],
    ['`DROP TABLE IF EXISTS t;`', 'Delete the table and its data'],
    ['`TRUNCATE TABLE t;`', 'Delete all rows fast; resets `AUTO_INCREMENT`'],
  ], [55, 45]],
  ['sql', `DESCRIBE employees;

ALTER TABLE employees ADD COLUMN phone VARCHAR(15) AFTER email;
ALTER TABLE employees ALTER COLUMN phone SET DEFAULT 'n/a';
SHOW COLUMNS FROM employees LIKE 'phone';

ALTER TABLE employees RENAME COLUMN phone TO mobile;
ALTER TABLE employees DROP COLUMN mobile;
SHOW COLUMNS FROM employees LIKE 'mobile';`],
  ['out', [
    { cols: ['Field', 'Type', 'Null', 'Key', 'Default', 'Extra'], rows: [
      ['emp_id', 'int', 'NO', 'PRI', N, ''],
      ['name', 'varchar(50)', 'NO', '', N, ''],
      ['dept_id', 'int', 'YES', 'MUL', N, ''],
      ['salary', 'int', 'NO', '', N, ''],
      ['hire_date', 'date', 'NO', '', N, ''],
      ['manager_id', 'int', 'YES', 'MUL', N, ''],
      ['email', 'varchar(100)', 'YES', 'UNI', N, ''],
    ] },
    { cols: ['Field', 'Type', 'Null', 'Key', 'Default', 'Extra'], rows: [['phone', 'varchar(15)', 'YES', '', 'n/a', '']] },
    'Empty set',
  ]],
  ['p', 'Key column: `PRI` primary key, `UNI` unique, `MUL` a non-unique index (MySQL indexes every foreign key automatically).'],
  ['trap', '`MODIFY` restates the whole column definition. `ALTER TABLE t MODIFY c VARCHAR(80);` silently drops a `NOT NULL` or `DEFAULT` that was on `c` unless you repeat it.'],

  // ---------------------------------------------------------------- part 2
  ['part', 'Part 2: Changing data', 'INSERT, UPDATE and DELETE (the DML statements), plus upserts.'],
  ['h2', 'INSERT, UPDATE and DELETE'],
  ['table', ['Statement', 'Purpose'], [
    ['`INSERT INTO t (c1, c2) VALUES (v1, v2);`', 'Insert one row; unlisted columns get their default'],
    ['`INSERT INTO t VALUES (...), (...), (...);`', 'Several rows at once (values for every column, in order)'],
    ['`INSERT INTO t (cols) SELECT ...;`', 'Insert the result of a query'],
    ['`INSERT IGNORE INTO t ...;`', 'Skip rows that would violate a unique key, with a warning'],
    ['`INSERT ... AS new ON DUPLICATE KEY UPDATE c = new.c;`', 'Upsert: update the existing row when the key already exists'],
    ['`REPLACE INTO t ...;`', 'Delete the conflicting row, then insert (a new row, not an update)'],
    ['`UPDATE t SET c1 = v1, c2 = v2 WHERE cond;`', 'Change matching rows'],
    ['`DELETE FROM t WHERE cond;`', 'Remove matching rows'],
    ['`SELECT LAST_INSERT_ID();`', 'The `AUTO_INCREMENT` value generated by your last insert'],
    ['`SELECT ROW_COUNT();`', 'Rows changed by the previous statement'],
  ], [55, 45]],
  ['p', 'These examples use a separate **products** table so the sample data stays unchanged:'],
  ['sql', `CREATE TABLE products (
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
ON DUPLICATE KEY UPDATE stock = stock + new.stock;            -- Pen exists: add stock

DELETE FROM products WHERE stock = 0;
SELECT * FROM products;`],
  ['out', [
    'Query OK, 3 rows affected\nRecords: 3  Duplicates: 0  Warnings: 0',
    'Query OK, 1 row affected',
    { cols: ['LAST_INSERT_ID()'], rows: [[4]] },
    'Query OK, 3 rows affected\nRows matched: 3  Changed: 3  Warnings: 0',
    'Query OK, 2 rows affected',
    'Query OK, 1 row affected',
    { cols: ['id', 'name', 'price', 'stock'], rows: [[1, 'Pen', '11.00', 150], [2, 'Notebook', '50.05', 40], [3, 'Bag', '799.00', 5]] },
  ]],
  ['p', 'An upsert that updates an existing row reports **2 rows affected** (1 means a new row was inserted, 0 means nothing changed). Pen kept its old price because only `stock` was listed after `UPDATE`.'],
  ['trap', 'An `UPDATE` or `DELETE` without `WHERE` changes **every row**. Write the `WHERE` first, or test it as a `SELECT` before running the change. MySQL Workbench\'s safe-update mode blocks such statements with error 1175.'],

  ['h2', 'DELETE vs TRUNCATE vs DROP'],
  ['table', ['', '`DELETE FROM t`', '`TRUNCATE TABLE t`', '`DROP TABLE t`'], [
    ['Removes', 'Chosen rows (or all)', 'All rows', 'Rows and the table itself'],
    ['`WHERE` allowed', 'Yes', 'No', 'No'],
    ['Can be rolled back', 'Yes, inside a transaction', 'No (implicit commit)', 'No (implicit commit)'],
    ['Fires `DELETE` triggers', 'Yes', 'No', 'No'],
    ['`AUTO_INCREMENT`', 'Keeps counting', 'Reset to 1', 'Gone'],
    ['Speed on big tables', 'Slow (row by row)', 'Fast', 'Fast'],
    ['Category', 'DML', 'DDL', 'DDL'],
  ], [22, 26, 26, 26]],

  // ---------------------------------------------------------------- part 3
  ['part', 'Part 3: Querying', 'SELECT: filtering, sorting, limiting, and handling NULL.'],
  ['h2', 'SELECT and WHERE'],
  ['table', ['Clause', 'Purpose', 'Example'], [
    ['`SELECT c1, c2` / `SELECT *`', 'Columns or expressions to return', '`SELECT name, salary * 12`'],
    ['`AS alias`', 'Rename a column or table', '`salary * 12 AS annual`'],
    ['`FROM t`', 'Source table(s)', '`FROM employees e`'],
    ['`WHERE cond`', 'Keep rows where cond is true', '`WHERE dept_id = 1`'],
    ['`ORDER BY c [ASC | DESC]`', 'Sort (several columns allowed)', '`ORDER BY dept_id, salary DESC`'],
    ['`LIMIT n` / `LIMIT n OFFSET m`', 'First n rows / skip m rows first', '`LIMIT 10 OFFSET 20` (page 3)'],
    ['`DISTINCT`', 'Remove duplicate result rows', '`SELECT DISTINCT dept_id`'],
  ], [32, 34, 34]],
  ['table', ['Operator', 'Meaning', 'Example'], [
    ['`=`, `<>` (or `!=`), `<`, `>`, `<=`, `>=`', 'Comparison', '`salary >= 60000`'],
    ['`BETWEEN a AND b`', 'Inclusive range', '`salary BETWEEN 50000 AND 72000`'],
    ['`IN (list)` / `NOT IN`', 'Matches any value in the list', '`dept_id IN (1, 3)`'],
    ['`LIKE` with `%` and `_`', '`%` any characters, `_` exactly one', '`name LIKE \'A%\'`, `name LIKE \'_a%\'`'],
    ['`IS NULL` / `IS NOT NULL`', 'Test for missing values', '`email IS NULL`'],
    ['`AND`, `OR`, `NOT`', 'Combine conditions (`AND` binds tighter than `OR`)', '`(a OR b) AND c`'],
    ['`REGEXP`', 'Regular-expression match', '`email REGEXP \'@(tcs|gmail)\\\\.com$\'`'],
    ['`<=>`', 'Null-safe equality: `NULL <=> NULL` is 1', '`manager_id <=> NULL`'],
  ], [32, 36, 32]],
  ['sql', `SELECT name, salary, salary * 12 AS annual
FROM employees
WHERE salary BETWEEN 50000 AND 72000
ORDER BY salary DESC;

SELECT name, email FROM employees WHERE email LIKE '%@tcs.com';
SELECT name FROM employees WHERE dept_id IN (1, 3) ORDER BY name;
SELECT name FROM employees WHERE email IS NULL;`],
  ['out', [
    { cols: ['name', 'salary', 'annual'], rows: [['Neha', 71000, 852000], ['Arjun', 62000, 744000], ['Sam', 55000, 660000], ['Ravi', 50000, 600000]] },
    { cols: ['name', 'email'], rows: [['Asha', 'asha@tcs.com'], ['Arjun', 'arjun@tcs.com'], ['Zoya', 'zoya@tcs.com']] },
    { cols: ['name'], rows: [['Asha'], ['Neha'], ['Sam']] },
    { cols: ['name'], rows: [['Neha']] },
  ]],
  ['trap', '`AND` is evaluated before `OR`. Without brackets the first query below means *IT, or (HR and over 80000)*.'],
  ['sql', `SELECT name FROM employees WHERE dept_id = 1 OR dept_id = 2 AND salary > 80000;
SELECT name FROM employees WHERE (dept_id = 1 OR dept_id = 2) AND salary > 80000;`],
  ['out', [
    { cols: ['name'], rows: [['Asha'], ['Neha']] },
    { cols: ['name'], rows: [['Asha']] },
  ]],

  ['h2', 'ORDER BY, LIMIT and DISTINCT'],
  ['sql', `SELECT DISTINCT dept_id FROM employees ORDER BY dept_id;      -- NULL sorts first

SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 3;  -- top 3 earners

SELECT DISTINCT salary FROM employees                            -- 2nd highest salary
ORDER BY salary DESC LIMIT 1 OFFSET 1;`],
  ['out', [
    { cols: ['dept_id'], rows: [[N], [1], [2], [3]] },
    { cols: ['name', 'salary'], rows: [['Asha', 85000], ['Neha', 71000], ['Arjun', 62000]] },
    { cols: ['salary'], rows: [[71000]] },
  ]],
  ['p', '`LIMIT 1 OFFSET 1` can also be written `LIMIT 1, 1`: in that short form the **first** number is the offset. `DISTINCT` makes the "Nth highest" query correct when salaries repeat; Part 7 shows the `DENSE_RANK` version.'],
  ['tip', 'Without `ORDER BY`, MySQL returns rows in no guaranteed order. Always sort when the order matters, including before `LIMIT`.'],

  ['h2', 'CASE and NULL handling'],
  ['p', '`NULL` means *unknown*. Any comparison or arithmetic with `NULL` gives `NULL`, which `WHERE` treats as false.'],
  ['table', ['Expression', 'Returns', 'Example → result'], [
    ['`CASE WHEN c1 THEN r1 WHEN c2 THEN r2 ELSE r END`', 'First matching branch (`NULL` if none and no `ELSE`)', 'see the example'],
    ['`CASE x WHEN v1 THEN r1 ... END`', 'Simple form: compares x to each value', '`CASE dept_id WHEN 1 THEN \'IT\' END`'],
    ['`IF(cond, a, b)`', 'a if cond is true, else b', '`IF(5 > 3, \'yes\', \'no\')` → `yes`'],
    ['`IFNULL(x, d)`', 'x, or d when x is `NULL`', '`IFNULL(NULL, 0)` → `0`'],
    ['`COALESCE(a, b, c, ...)`', 'First non-`NULL` argument (standard SQL)', '`COALESCE(NULL, NULL, \'x\')` → `x`'],
    ['`NULLIF(a, b)`', '`NULL` if a = b, else a (avoids divide by zero)', '`total / NULLIF(cnt, 0)`'],
    ['`ISNULL(x)`', '1 if x is `NULL`', '`ISNULL(email)`'],
  ], [36, 34, 30]],
  ['sql', `SELECT name, salary,
       CASE WHEN salary >= 70000 THEN 'High'
            WHEN salary >= 55000 THEN 'Mid'
            ELSE 'Low' END        AS band,
       IFNULL(email, 'not given') AS email
FROM employees ORDER BY emp_id;

SELECT NULL = NULL AS eq, NULL <=> NULL AS null_safe, NULL + 5 AS plus,
       COALESCE(NULL, NULL, 'x') AS coal, NULLIF(10, 10) AS nif,
       IF(5 > 3, 'yes', 'no') AS if_res, IFNULL(NULL, 0) AS ifn;`],
  ['out', [
    { cols: ['name', 'salary', 'band', 'email'], rows: [
      ['Asha', 85000, 'High', 'asha@tcs.com'], ['Ravi', 50000, 'Low', 'ravi@gmail.com'], ['Neha', 71000, 'High', 'not given'],
      ['Arjun', 62000, 'Mid', 'arjun@tcs.com'], ['Sam', 55000, 'Mid', 'sam@yahoo.com'], ['Zoya', 48000, 'Low', 'zoya@tcs.com']] },
    { cols: ['eq', 'null_safe', 'plus', 'coal', 'nif', 'if_res', 'ifn'], rows: [[N, 1, N, 'x', N, 'yes', 0]] },
  ]],
  ['trap', 'Never write `WHERE email = NULL`: it matches nothing, because `NULL = NULL` is `NULL`, not true. Use `IS NULL`.'],

  // ---------------------------------------------------------------- part 4
  ['part', 'Part 4: Aggregation', 'Summarising many rows into one, overall or per group.'],
  ['h2', 'Aggregate functions'],
  ['table', ['Function', 'Returns', 'NULL handling'], [
    ['`COUNT(*)`', 'Number of rows', 'Counts every row'],
    ['`COUNT(c)`', 'Number of non-null values in c', 'Skips `NULL`'],
    ['`COUNT(DISTINCT c)`', 'Number of different non-null values', 'Skips `NULL`'],
    ['`SUM(c)`, `AVG(c)`', 'Total / mean (`AVG` of integers gives 4 decimals)', 'Skip `NULL`; `NULL` if no rows'],
    ['`MIN(c)`, `MAX(c)`', 'Smallest / largest (works on numbers, text and dates)', 'Skip `NULL`'],
    ['`GROUP_CONCAT(c ORDER BY x SEPARATOR \', \')`', 'Values joined into one string', 'Skips `NULL`; 1024-character limit by default'],
    ['`STDDEV(c)`, `VARIANCE(c)`', 'Spread of the values', 'Skip `NULL`'],
  ], [40, 35, 25]],
  ['sql', `SELECT COUNT(*) AS total, COUNT(email) AS with_email, COUNT(DISTINCT dept_id) AS depts,
       SUM(salary) AS payroll, AVG(salary) AS avg_sal,
       MIN(hire_date) AS first_hire, MAX(salary) AS top_sal
FROM employees;`],
  ['out', [{ cols: ['total', 'with_email', 'depts', 'payroll', 'avg_sal', 'first_hire', 'top_sal'], rows: [[6, 5, 3, 371000, '61833.3333', '2018-01-15', 85000]] }]],

  ['h2', 'GROUP BY and HAVING'],
  ['p', '`GROUP BY` makes one output row per distinct value; aggregates are then calculated per group. `WHERE` filters rows **before** grouping, `HAVING` filters groups **after**.'],
  ['sql', `SELECT dept_id, COUNT(*) AS staff, SUM(salary) AS total, AVG(salary) AS avg_sal
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
GROUP BY dept_id WITH ROLLUP;      -- adds a grand-total row`],
  ['out', [
    { cols: ['dept_id', 'staff', 'total', 'avg_sal'], rows: [[N, 1, 48000, '48000.0000'], [1, 2, 156000, '78000.0000'], [2, 2, 112000, '56000.0000'], [3, 1, 55000, '55000.0000']] },
    { cols: ['dept_id', 'staff', 'avg_sal'], rows: [[1, 2, '78000.0000'], [2, 2, '56000.0000']] },
    { cols: ['dept_id', 'team'], rows: [[1, 'Asha, Neha'], [2, 'Arjun, Ravi'], [3, 'Sam']] },
    { cols: ['dept_id', 'total'], rows: [[1, 156000], [2, 112000], [3, 55000], [N, 323000]] },
  ]],
  ['p', 'Rows with a `NULL` key form their own group (Zoya, first result). In the `ROLLUP` result the `NULL` marks the total row; use `GROUPING(dept_id)` to tell it apart from a real `NULL`.'],
  ['trap', 'Aggregates are not allowed in `WHERE`: `WHERE AVG(salary) > 55000` fails with error 1111. And every selected column must be grouped or aggregated: `SELECT dept_id, name ... GROUP BY dept_id` fails with error 1055 under the default `ONLY_FULL_GROUP_BY` mode.'],

  // ---------------------------------------------------------------- part 5
  ['part', 'Part 5: Joins', 'Combining rows from two or more tables.'],
  ['h2', 'Join types'],
  ['table', ['Join', 'Returns', 'Sample result'], [
    ['`[INNER] JOIN ... ON`', 'Only rows that match in both tables', '5 employees (Zoya dropped)'],
    ['`LEFT [OUTER] JOIN`', 'Every left row; `NULL`s where the right has no match', '6 employees, Zoya with `NULL` department'],
    ['`RIGHT [OUTER] JOIN`', 'Every right row; `NULL`s where the left has no match', 'All 4 departments, Finance with `NULL` employee'],
    ['`CROSS JOIN`', 'Every combination (Cartesian product)', '6 × 4 = 24 rows'],
    ['Self join', 'A table joined to itself under two aliases', 'Employee with their manager'],
    ['Full outer join', 'Not supported directly: `LEFT JOIN` `UNION` `RIGHT JOIN`', 'Everything from both sides'],
    ['`JOIN ... USING (c)`', 'Shorthand when the column name is the same in both', '`JOIN departments USING (dept_id)`'],
  ], [26, 44, 30]],
  ['sql', `SELECT e.name, d.dept_name, d.location
FROM employees e
JOIN departments d ON e.dept_id = d.dept_id
ORDER BY e.emp_id;

SELECT e.name, d.dept_name
FROM employees e LEFT JOIN departments d ON e.dept_id = d.dept_id
ORDER BY e.emp_id;

SELECT d.dept_name                 -- departments with no employees
FROM departments d LEFT JOIN employees e ON e.dept_id = d.dept_id
WHERE e.emp_id IS NULL;`],
  ['out', [
    { cols: ['name', 'dept_name', 'location'], rows: [['Asha', 'IT', 'Bengaluru'], ['Ravi', 'HR', 'Mumbai'], ['Neha', 'IT', 'Bengaluru'], ['Arjun', 'HR', 'Mumbai'], ['Sam', 'Ops', 'Pune']] },
    { cols: ['name', 'dept_name'], rows: [['Asha', 'IT'], ['Ravi', 'HR'], ['Neha', 'IT'], ['Arjun', 'HR'], ['Sam', 'Ops'], ['Zoya', N]] },
    { cols: ['dept_name'], rows: [['Finance']] },
  ]],
  ['sql', `SELECT d.dept_name, COUNT(e.emp_id) AS staff     -- count per department, zeros included
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

SELECT COUNT(*) AS combos FROM employees CROSS JOIN departments;`],
  ['out', [
    { cols: ['dept_name', 'staff'], rows: [['IT', 2], ['HR', 2], ['Ops', 1], ['Finance', 0]] },
    { cols: ['employee', 'manager'], rows: [['Asha', N], ['Ravi', 'Asha'], ['Neha', 'Asha'], ['Arjun', 'Asha'], ['Sam', 'Arjun'], ['Zoya', 'Arjun']] },
    { cols: ['name', 'dept_name'], rows: [['Zoya', N], [N, 'Finance'], ['Arjun', 'HR'], ['Ravi', 'HR'], ['Asha', 'IT'], ['Neha', 'IT'], ['Sam', 'Ops']] },
    { cols: ['combos'], rows: [[24]] },
  ]],
  ['trap', 'With a `LEFT JOIN`, count a column from the right table: `COUNT(e.emp_id)` gives Finance 0, but `COUNT(*)` gives 1 because the unmatched row itself is counted. Also, a condition on the right table placed in `WHERE` (instead of `ON`) removes the `NULL` rows and turns the left join back into an inner join.'],

  // ---------------------------------------------------------------- part 6
  ['part', 'Part 6: Subqueries and set operations', 'Queries inside queries, and combining result sets.'],
  ['h2', 'Subqueries'],
  ['table', ['Kind', 'Returns', 'Used with'], [
    ['Scalar', 'One value', '`=`, `>`, `<` ... or as a column: `(SELECT MAX(salary) FROM employees)`'],
    ['Column', 'A list of values', '`IN`, `NOT IN`, `> ANY (...)`, `> ALL (...)`'],
    ['Table (derived table)', 'A temporary result set', '`FROM (SELECT ...) AS t`: the alias is required'],
    ['Correlated', 'Re-evaluated for each outer row', 'Refers to the outer query: `WHERE dept_id = e.dept_id`'],
    ['`EXISTS` / `NOT EXISTS`', 'True if the subquery returns any row', 'Usually correlated; `SELECT 1` inside is fine'],
  ], [24, 26, 50]],
  ['sql', `SELECT name, salary FROM employees                 -- above the overall average
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
FROM (SELECT AVG(salary) AS avg_sal FROM employees GROUP BY dept_id) AS t;`],
  ['out', [
    { cols: ['name', 'salary'], rows: [['Asha', 85000], ['Neha', 71000], ['Arjun', 62000]] },
    { cols: ['name'], rows: [['Asha'], ['Neha']] },
    { cols: ['name', 'dept_id', 'salary'], rows: [['Asha', 1, 85000], ['Arjun', 2, 62000]] },
    { cols: ['dept_name'], rows: [['IT'], ['HR']] },
    { cols: ['best_dept_avg'], rows: [['78000.0000']] },
  ]],
  ['trap', '`NOT IN` with a subquery that returns a `NULL` matches **nothing**. `employees.dept_id` contains Zoya\'s `NULL`, so the first query is empty. Filter out `NULL`s or use `NOT EXISTS`.'],
  ['sql', `SELECT dept_name FROM departments
WHERE dept_id NOT IN (SELECT dept_id FROM employees);

SELECT dept_name FROM departments d
WHERE NOT EXISTS (SELECT 1 FROM employees e WHERE e.dept_id = d.dept_id);`],
  ['out', ['Empty set', { cols: ['dept_name'], rows: [['Finance']] }]],
  ['p', 'A scalar subquery that returns more than one row fails with error 1242: *Subquery returns more than 1 row*. Use `IN`, or make it return one value with `MAX`, `LIMIT 1` or a tighter `WHERE`.'],

  ['h2', 'UNION, INTERSECT and EXCEPT'],
  ['table', ['Operator', 'Result', 'Duplicates'], [
    ['`UNION`', 'Rows in either query', 'Removed'],
    ['`UNION ALL`', 'Rows in either query', 'Kept (faster: no de-duplication step)'],
    ['`INTERSECT` (8.0.31+)', 'Rows in both queries', 'Removed'],
    ['`EXCEPT` (8.0.31+)', 'Rows in the first query but not the second', 'Removed'],
  ], [30, 40, 30]],
  ['p', 'Both queries must return the same number of columns with compatible types. Column names come from the first query, and a final `ORDER BY` sorts the combined result.'],
  ['sql', `SELECT name FROM employees WHERE dept_id = 1
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
SELECT name FROM employees WHERE dept_id = 1;`],
  ['out', [
    { cols: ['name'], rows: [['Arjun'], ['Asha'], ['Neha']] },
    { cols: ['n'], rows: [[5]] },
    { cols: ['name'], rows: [['Asha'], ['Neha']] },
    { cols: ['name'], rows: [['Arjun']] },
  ]],

  // ---------------------------------------------------------------- part 7
  ['part', 'Part 7: CTEs and window functions', 'Named subqueries, recursion, and calculations across related rows (MySQL 8.0+).'],
  ['h2', 'Common table expressions (WITH)'],
  ['p', 'A CTE names a subquery so the main query reads top to bottom. Several CTEs are separated by commas, and later ones can use earlier ones.'],
  ['sql', `WITH dept_avg AS (
    SELECT dept_id, AVG(salary) AS avg_sal
    FROM employees GROUP BY dept_id
)
SELECT e.name, e.salary, ROUND(d.avg_sal) AS dept_avg
FROM employees e JOIN dept_avg d ON e.dept_id = d.dept_id
WHERE e.salary > d.avg_sal;`],
  ['out', [{ cols: ['name', 'salary', 'dept_avg'], rows: [['Asha', 85000, 78000], ['Arjun', 62000, 56000]] }]],
  ['p', 'A **recursive** CTE has an anchor query and a recursive query joined by `UNION ALL`; the recursive part refers to the CTE itself and stops when it returns no new rows.'],
  ['sql', `WITH RECURSIVE n AS (
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
SELECT name, depth, path FROM chain ORDER BY path;`],
  ['out', [
    { cols: ['seq'], rows: [['1,2,3,4,5']] },
    { cols: ['name', 'depth', 'path'], rows: [
      ['Asha', 1, 'Asha'], ['Arjun', 2, 'Asha > Arjun'], ['Sam', 3, 'Asha > Arjun > Sam'],
      ['Zoya', 3, 'Asha > Arjun > Zoya'], ['Neha', 2, 'Asha > Neha'], ['Ravi', 2, 'Asha > Ravi']] },
  ]],
  ['note', 'The `CAST(... AS CHAR(200))` matters: a recursive CTE\'s column types are fixed by the anchor, so without it `path` would be only as wide as the longest name and longer paths would fail.'],

  ['h2', 'Window functions'],
  ['p', 'A window function computes a value from a set of rows related to the current row **without collapsing them** the way `GROUP BY` does. Syntax: `function() OVER (PARTITION BY ... ORDER BY ...)`.'],
  ['table', ['Function', 'Returns'], [
    ['`ROW_NUMBER()`', '1, 2, 3, ... with no ties'],
    ['`RANK()`', 'Rank with gaps after ties: 1, 2, 2, 4'],
    ['`DENSE_RANK()`', 'Rank without gaps: 1, 2, 2, 3'],
    ['`NTILE(n)`', 'Bucket number 1..n (quartiles with n = 4)'],
    ['`LAG(c, k, default)`, `LEAD(c, k, default)`', 'Value from k rows before / after (k defaults to 1)'],
    ['`FIRST_VALUE(c)`, `LAST_VALUE(c)`, `NTH_VALUE(c, n)`', 'Value from a position in the window frame'],
    ['`SUM`, `AVG`, `COUNT`, `MIN`, `MAX` with `OVER`', 'Running or per-partition aggregates'],
    ['`PERCENT_RANK()`, `CUME_DIST()`', 'Relative position, 0 to 1'],
    ['`ROWS BETWEEN 2 PRECEDING AND CURRENT ROW`', 'Frame clause: e.g. a 3-row moving average'],
    ['`WINDOW w AS (...)` ... `OVER w`', 'Name a window once and reuse it'],
  ], [50, 50]],
  ['sql', `SELECT name, dept_id, salary,
       ROW_NUMBER() OVER (ORDER BY salary DESC)                     AS rn,
       RANK()       OVER (PARTITION BY dept_id ORDER BY salary DESC) AS dept_rank,
       SUM(salary)  OVER (PARTITION BY dept_id)                     AS dept_total
FROM employees
ORDER BY rn;`],
  ['out', [{ cols: ['name', 'dept_id', 'salary', 'rn', 'dept_rank', 'dept_total'], rows: [
    ['Asha', 1, 85000, 1, 1, 156000], ['Neha', 1, 71000, 2, 2, 156000], ['Arjun', 2, 62000, 3, 1, 112000],
    ['Sam', 3, 55000, 4, 1, 55000], ['Ravi', 2, 50000, 5, 2, 112000], ['Zoya', N, 48000, 6, 1, 48000]] }]],
  ['sql', `WITH scores (name, marks) AS (
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
WHERE dr = 1 AND dept_id IS NOT NULL ORDER BY dept_id;`],
  ['out', [
    { cols: ['name', 'marks', 'row_num', 'rnk', 'dense'], rows: [['A', 90, 1, 1, 1], ['B', 85, 2, 2, 2], ['C', 85, 3, 2, 2], ['D', 80, 4, 4, 3]] },
    { cols: ['name', 'hire_date', 'salary', 'hired_before', 'running_total'], rows: [
      ['Arjun', '2018-01-15', 62000, N, 62000], ['Asha', '2019-06-12', 85000, 'Arjun', 147000], ['Neha', '2020-11-23', 71000, 'Asha', 218000],
      ['Ravi', '2021-03-01', 50000, 'Neha', 268000], ['Sam', '2022-08-30', 55000, 'Ravi', 323000], ['Zoya', '2023-02-10', 48000, 'Sam', 371000]] },
    { cols: ['dept_id', 'name', 'salary'], rows: [[1, 'Asha', 85000], [2, 'Arjun', 62000], [3, 'Sam', 55000]] },
  ]],
  ['trap', 'Window functions can\'t be used in `WHERE` (it runs before them); filter in an outer query or CTE, as in the last example. And `RANK` is a reserved word in MySQL 8, so `AS rank` is a syntax error: use another alias.'],

  // ---------------------------------------------------------------- part 8
  ['part', 'Part 8: Built-in functions', 'String, numeric, date/time and conversion functions.'],
  ['h2', 'String functions'],
  ['p', 'String positions in MySQL start at **1**, not 0.'],
  ['table', ['Function', 'Purpose', 'Example → result'], [
    ['`CONCAT(a, b, ...)`', 'Join strings (`NULL` if any argument is `NULL`)', '`CONCAT(\'My\', \'SQL\')` → `MySQL`'],
    ['`CONCAT_WS(sep, a, b, ...)`', 'Join with a separator, skipping `NULL`s', '`CONCAT_WS(\'-\', \'a\', NULL, \'b\')` → `a-b`'],
    ['`LENGTH(s)`, `CHAR_LENGTH(s)`', 'Length in bytes / characters', '`LENGTH(\'héllo\')` → 6, `CHAR_LENGTH` → 5'],
    ['`UPPER(s)`, `LOWER(s)`', 'Change case', '`UPPER(\'sql\')` → `SQL`'],
    ['`SUBSTRING(s, pos, len)`', 'Part of a string (negative pos counts from the end)', '`SUBSTRING(\'placement\', 1, 5)` → `place`'],
    ['`LEFT(s, n)`, `RIGHT(s, n)`', 'First / last n characters', '`RIGHT(\'MySQL\', 3)` → `SQL`'],
    ['`TRIM(s)`, `LTRIM`, `RTRIM`', 'Remove spaces', '`TRIM(LEADING \'0\' FROM \'00420\')` → `420`'],
    ['`REPLACE(s, from, to)`', 'Replace every occurrence', '`REPLACE(\'a-b-c\', \'-\', \'+\')` → `a+b+c`'],
    ['`INSTR(s, sub)`, `LOCATE(sub, s, pos)`', 'Position of a substring, 0 if absent', '`LOCATE(\'an\', \'banana\', 3)` → 4'],
    ['`LPAD(s, n, p)`, `RPAD(s, n, p)`', 'Pad to length n', '`LPAD(\'7\', 3, \'0\')` → `007`'],
    ['`REVERSE(s)`, `REPEAT(s, n)`', 'Reverse / repeat', '`REPEAT(\'ab\', 3)` → `ababab`'],
    ['`SUBSTRING_INDEX(s, delim, n)`', 'Text before the nth delimiter (after it if n < 0)', '`SUBSTRING_INDEX(\'a.b.c\', \'.\', -1)` → `c`'],
    ['`FORMAT(x, d)`', 'Number with thousands separators', '`FORMAT(1234567.891, 2)` → `1,234,567.89`'],
    ['`STRCMP(a, b)`', '-1, 0 or 1', '`STRCMP(\'a\', \'b\')` → -1'],
    ['`REGEXP_LIKE(s, re)`, `REGEXP_REPLACE`', 'Regular expressions', '`REGEXP_LIKE(\'9876543210\', \'^[6-9][0-9]{9}$\')` → 1'],
  ], [32, 33, 35]],
  ['sql', `SELECT name,
       CONCAT(UPPER(LEFT(name, 3)), emp_id) AS code,
       CHAR_LENGTH(name)                    AS len,
       SUBSTRING_INDEX(email, '@', -1)      AS domain,
       LPAD(salary, 7, '0')                 AS padded
FROM employees WHERE emp_id <= 103;`],
  ['out', [{ cols: ['name', 'code', 'len', 'domain', 'padded'], rows: [['Asha', 'ASH101', 4, 'tcs.com', '0085000'], ['Ravi', 'RAV102', 4, 'gmail.com', '0050000'], ['Neha', 'NEH103', 4, N, '0071000']], left: [4] }]],
  ['p', 'Neha\'s domain is `NULL` because her email is `NULL`: string functions pass `NULL` through.'],
  ['tip', 'Comparisons are case-insensitive with the default collation (`utf8mb4_0900_ai_ci`): `\'abc\' = \'ABC\'` is 1. Use `BINARY` or a `_bin` / `_cs` collation for case-sensitive matching.'],

  ['h2', 'Numeric functions'],
  ['table', ['Function', 'Purpose', 'Example → result'], [
    ['`ROUND(x)`, `ROUND(x, d)`', 'Round half away from zero (exact numbers)', '`ROUND(2.5)` → 3, `ROUND(-2.5)` → -3'],
    ['`ROUND(x, -d)`', 'Round to tens, hundreds, ...', '`ROUND(123.456, -1)` → 120'],
    ['`TRUNCATE(x, d)`', 'Cut off decimals without rounding', '`TRUNCATE(123.456, 1)` → 123.4'],
    ['`CEIL(x)`, `FLOOR(x)`', 'Round up / down to an integer', '`CEIL(4.1)` → 5, `FLOOR(-4.1)` → -5'],
    ['`ABS(x)`, `SIGN(x)`', 'Absolute value / -1, 0, 1', '`ABS(-7)` → 7'],
    ['`MOD(a, b)`, `a % b`', 'Remainder (takes the sign of a)', '`MOD(-7, 3)` → -1'],
    ['`a / b`, `a DIV b`', 'Decimal division / integer division', '`10 / 4` → 2.5000, `10 DIV 4` → 2'],
    ['`POW(x, y)`, `SQRT(x)`', 'Power / square root', '`POW(2, 10)` → 1024'],
    ['`GREATEST(...)`, `LEAST(...)`', 'Largest / smallest argument (not a column aggregate)', '`GREATEST(3, 9, 5)` → 9'],
    ['`RAND()`', 'Random number in [0, 1)', '`FLOOR(1 + RAND() * 6)`: a die roll'],
    ['`PI()`, `LOG(x)`, `LOG10(x)`, `EXP(x)`', 'Maths constants and logarithms', '`LOG10(1000)` → 3'],
  ], [30, 36, 34]],
  ['sql', `SELECT name, salary, ROUND(salary / 12, 2) AS monthly
FROM employees WHERE emp_id <= 103;

SELECT ROUND(2.5) AS r1, ROUND(-2.5) AS r2, ROUND(123.456, 2) AS r3,
       TRUNCATE(123.456, 1) AS t, 10 / 4 AS d, 10 DIV 4 AS i, MOD(-7, 3) AS m, 10 / 0 AS z;`],
  ['out', [
    { cols: ['name', 'salary', 'monthly'], rows: [['Asha', 85000, '7083.33'], ['Ravi', 50000, '4166.67'], ['Neha', 71000, '5916.67']] },
    { cols: ['r1', 'r2', 'r3', 't', 'd', 'i', 'm', 'z'], rows: [[3, -3, '123.46', '123.4', '2.5000', 2, -1, N]], footer: '1 row in set, 1 warning' },
  ]],
  ['trap', 'Division by zero returns `NULL` with a warning, not an error, in a `SELECT`. And `ROUND` on `FLOAT`/`DOUBLE` values uses round-half-to-even on most systems (`ROUND(2.5E0)` → 2), unlike `DECIMAL` values.'],

  ['h2', 'Date and time functions'],
  ['p', 'The examples use the fixed date `\'2026-10-15\'` (a Thursday) so the results don\'t change; in real queries use `CURDATE()` or `NOW()`.'],
  ['table', ['Function', 'Purpose', 'Example → result'], [
    ['`NOW()`, `CURDATE()`, `CURTIME()`', 'Current date-time / date / time', '`CURDATE()` → today, e.g. 2026-10-15'],
    ['`DATE(dt)`, `TIME(dt)`', 'Date or time part of a datetime', '`DATE(\'2026-10-15 09:30:00\')` → 2026-10-15'],
    ['`YEAR(d)`, `MONTH(d)`, `DAY(d)`', 'Parts as numbers', '`MONTH(\'2026-10-15\')` → 10'],
    ['`DAYNAME(d)`, `MONTHNAME(d)`', 'Names', '`DAYNAME(\'2026-10-15\')` → Thursday'],
    ['`DAYOFWEEK(d)`, `WEEKDAY(d)`', 'Sunday = 1 ... / Monday = 0 ...', '`DAYOFWEEK(\'2026-10-15\')` → 5'],
    ['`DATE_ADD(d, INTERVAL n unit)`, `DATE_SUB`', 'Add / subtract (DAY, WEEK, MONTH, YEAR, HOUR ...)', '`DATE_ADD(\'2026-10-15\', INTERVAL 10 DAY)` → 2026-10-25'],
    ['`d + INTERVAL n unit`', 'Same as `DATE_ADD`; month-ends are clamped', '`\'2026-01-31\' + INTERVAL 1 MONTH` → 2026-02-28'],
    ['`DATEDIFF(a, b)`', 'Days from b to a', '`DATEDIFF(\'2026-10-15\', \'2026-10-03\')` → 12'],
    ['`TIMESTAMPDIFF(unit, a, b)`', 'Whole units from a to b (age in years)', '`TIMESTAMPDIFF(YEAR, \'2004-05-20\', \'2026-10-15\')` → 22'],
    ['`LAST_DAY(d)`', 'Last day of that month', '`LAST_DAY(\'2026-02-10\')` → 2026-02-28'],
    ['`DATE_FORMAT(d, fmt)`', 'Date to formatted text', '`DATE_FORMAT(\'2026-10-15\', \'%d %b %Y\')` → 15 Oct 2026'],
    ['`STR_TO_DATE(s, fmt)`', 'Text to date', '`STR_TO_DATE(\'15/10/2026\', \'%d/%m/%Y\')` → 2026-10-15'],
    ['`EXTRACT(unit FROM d)`', 'Standard-SQL way to get a part', '`EXTRACT(QUARTER FROM \'2026-10-15\')` → 4'],
  ], [34, 30, 36]],
  ['table', ['Format', 'Meaning', 'Example', 'Format', 'Meaning', 'Example'], [
    ['`%Y` / `%y`', 'Year, 4 / 2 digits', '2026 / 26', '`%H` / `%h`', 'Hour 00-23 / 01-12', '09 / 09'],
    ['`%m` / `%c`', 'Month 01-12 / 1-12', '10 / 10', '`%i`', 'Minutes', '30'],
    ['`%M` / `%b`', 'Month name / short', 'October / Oct', '`%s`', 'Seconds', '00'],
    ['`%d` / `%e`', 'Day 01-31 / 1-31', '15 / 15', '`%p`', 'AM or PM', 'AM'],
    ['`%W` / `%a`', 'Weekday / short', 'Thursday / Thu', '`%T`', 'Time, 24-hour', '09:30:00'],
  ], [12, 20, 18, 12, 20, 18]],
  ['sql', `SELECT name, hire_date,
       DATE_FORMAT(hire_date, '%d %b %Y')            AS joined,
       DAYNAME(hire_date)                           AS day,
       TIMESTAMPDIFF(YEAR, hire_date, '2026-10-15') AS years
FROM employees ORDER BY hire_date;

SELECT DATE_ADD('2026-10-15', INTERVAL 10 DAY) AS plus10,
       '2026-01-31' + INTERVAL 1 MONTH          AS feb,
       DATEDIFF('2026-10-15', '2026-10-03')     AS days,
       DATE_FORMAT('2026-10-15 09:30:00', '%d %b %Y, %h:%i %p') AS formatted;`],
  ['out', [
    { cols: ['name', 'hire_date', 'joined', 'day', 'years'], rows: [
      ['Arjun', '2018-01-15', '15 Jan 2018', 'Monday', 8], ['Asha', '2019-06-12', '12 Jun 2019', 'Wednesday', 7],
      ['Neha', '2020-11-23', '23 Nov 2020', 'Monday', 5], ['Ravi', '2021-03-01', '01 Mar 2021', 'Monday', 5],
      ['Sam', '2022-08-30', '30 Aug 2022', 'Tuesday', 4], ['Zoya', '2023-02-10', '10 Feb 2023', 'Friday', 3]] },
    { cols: ['plus10', 'feb', 'days', 'formatted'], rows: [['2026-10-25', '2026-02-28', 12, '15 Oct 2026, 09:30 AM']] },
  ]],
  ['tip', 'To filter a date range, compare the column directly: `WHERE hire_date >= \'2021-01-01\' AND hire_date < \'2022-01-01\'`. Wrapping the column, as in `WHERE YEAR(hire_date) = 2021`, gives the same rows but stops MySQL from using an index on `hire_date`.'],

  ['h2', 'Conversion functions'],
  ['table', ['Expression', 'Result', 'Notes'], [
    ['`CAST(x AS SIGNED)` / `UNSIGNED`', 'Integer', '`CAST(\'42abc\' AS SIGNED)` → 42 with a warning; `CAST(3.7 AS SIGNED)` → 4 (rounds)'],
    ['`CAST(x AS DECIMAL(10,2))`', 'Exact decimal', '`CAST(\'19.999\' AS DECIMAL(10,2))` → 20.00'],
    ['`CAST(x AS CHAR)`', 'String', '`CAST(85000 AS CHAR)` → \'85000\''],
    ['`CAST(s AS DATE)` / `DATETIME`', 'Date', 'Text must be in `YYYY-MM-DD` form, otherwise use `STR_TO_DATE`'],
    ['`CONVERT(x, type)`', 'Same as `CAST`', '`CONVERT(\'7\', UNSIGNED)` → 7'],
    ['Implicit conversion', 'MySQL converts text to numbers in arithmetic', '`\'5\' + 3` → 8; `\'abc\' = 0` → 1 (!)'],
  ], [30, 22, 48]],

  // ---------------------------------------------------------------- part 9
  ['part', 'Part 9: Views and indexes', 'Saved queries, and the structures that make queries fast.'],
  ['h2', 'Views'],
  ['p', 'A view is a saved `SELECT` that you query like a table. It stores no data: every query on it re-runs the underlying `SELECT`.'],
  ['table', ['Statement', 'Purpose'], [
    ['`CREATE VIEW v AS SELECT ...;`', 'Create a view'],
    ['`CREATE OR REPLACE VIEW v AS ...;`', 'Create, or redefine an existing view'],
    ['`... WITH CHECK OPTION`', 'Reject inserts/updates through the view that the view\'s `WHERE` would hide'],
    ['`DROP VIEW IF EXISTS v;`', 'Remove the view (the data in the base tables is untouched)'],
    ['`SHOW FULL TABLES WHERE Table_type = \'VIEW\';`', 'List views'],
  ], [50, 50]],
  ['sql', `CREATE VIEW dept_summary AS
SELECT d.dept_name, COUNT(e.emp_id) AS staff, COALESCE(SUM(e.salary), 0) AS payroll
FROM departments d LEFT JOIN employees e ON e.dept_id = d.dept_id
GROUP BY d.dept_id, d.dept_name;

SELECT * FROM dept_summary WHERE staff > 0 ORDER BY payroll DESC;`],
  ['out', [{ cols: ['dept_name', 'staff', 'payroll'], rows: [['IT', 2, 156000], ['HR', 2, 112000], ['Ops', 1, 55000]] }]],
  ['p', 'Uses: hide complex joins, give users access to some columns only, and keep report logic in one place. A view is updatable only if it maps rows one-to-one onto a single base table: no `GROUP BY`, `DISTINCT`, aggregates or `UNION`.'],

  ['h2', 'Indexes'],
  ['p', 'An index (a B-tree in InnoDB) lets MySQL find rows without scanning the whole table, like the index at the back of a book. It speeds up `WHERE`, `JOIN`, `ORDER BY` and `GROUP BY`, but slows down writes and uses space.'],
  ['table', ['Statement', 'Purpose'], [
    ['`CREATE INDEX idx_salary ON employees (salary);`', 'Ordinary index'],
    ['`CREATE UNIQUE INDEX idx_email ON employees (email);`', 'Index that also enforces uniqueness'],
    ['`CREATE INDEX idx_dept_sal ON employees (dept_id, salary);`', 'Composite index: column order matters'],
    ['`CREATE INDEX idx_name ON employees (name(10));`', 'Prefix index on the first 10 characters'],
    ['`CREATE FULLTEXT INDEX ft ON posts (body);`', 'Word search with `MATCH (body) AGAINST (\'word\')`'],
    ['`SHOW INDEX FROM employees;`', 'List indexes'],
    ['`DROP INDEX idx_salary ON employees;`', 'Remove an index'],
    ['`EXPLAIN SELECT ...;`', 'Show the plan: which index is used and how many rows are read'],
  ], [58, 42]],
  ['table', ['EXPLAIN column', 'What to look for'], [
    ['`type`', 'Best to worst: `const`, `eq_ref`, `ref`, `range`, `index`, `ALL` (`ALL` = full table scan)'],
    ['`possible_keys` / `key`', 'Indexes that could be used / the one actually chosen (`NULL` = none)'],
    ['`rows`', 'Estimated rows MySQL will examine'],
    ['`Extra`', '`Using index` is good (answered from the index alone); `Using filesort` or `Using temporary` means extra work'],
  ], [25, 75]],
  ['p', 'A composite index on `(dept_id, salary)` follows the **leftmost-prefix rule**: it helps `WHERE dept_id = 1` and `WHERE dept_id = 1 AND salary > 60000`, but not `WHERE salary > 60000` alone.'],
  ['trap', 'An index is usually **not** used when the column is wrapped in a function (`WHERE YEAR(hire_date) = 2021`), when `LIKE` starts with a wildcard (`LIKE \'%sha\'`), or when a number column is compared to text or the reverse (implicit conversion).'],

  // ---------------------------------------------------------------- part 10
  ['part', 'Part 10: Stored procedures, functions and triggers', 'Programs stored and run inside the database.'],
  ['h2', 'Stored procedures'],
  ['p', 'A procedure is a named block of SQL called with `CALL`. Parameters are `IN` (input, the default), `OUT` (result) or `INOUT`. In the `mysql` client, change the delimiter first so the `;` inside the body doesn\'t end the `CREATE` statement.'],
  ['sql', `DELIMITER //
CREATE PROCEDURE dept_stats(IN p_dept VARCHAR(30), OUT p_staff INT, OUT p_avg DECIMAL(10,2))
BEGIN
    SELECT COUNT(*), AVG(e.salary) INTO p_staff, p_avg
    FROM employees e JOIN departments d ON e.dept_id = d.dept_id
    WHERE d.dept_name = p_dept;
END //
DELIMITER ;

CALL dept_stats('IT', @staff, @avg);
SELECT @staff, @avg;`],
  ['out', [{ cols: ['@staff', '@avg'], rows: [[2, '78000.00']] }]],
  ['table', ['Element', 'Syntax'], [
    ['Local variable', '`DECLARE total INT DEFAULT 0;` (at the top of `BEGIN ... END`)'],
    ['Assign', '`SET total = total + 1;` or `SELECT COUNT(*) INTO total FROM t;`'],
    ['Session variable', '`SET @x = 5;` (no declaration; lasts until you disconnect)'],
    ['Condition', '`IF c THEN ... ELSEIF c2 THEN ... ELSE ... END IF;`'],
    ['Loops', '`WHILE c DO ... END WHILE;`  `REPEAT ... UNTIL c END REPEAT;`  `lbl: LOOP ... LEAVE lbl; END LOOP;`'],
    ['Cursor', '`DECLARE cur CURSOR FOR SELECT ...;` `OPEN cur;` `FETCH cur INTO v;` `CLOSE cur;`'],
    ['Handler', '`DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;`'],
    ['Raise an error', '`SIGNAL SQLSTATE \'45000\' SET MESSAGE_TEXT = \'...\';`'],
    ['Manage', '`SHOW PROCEDURE STATUS WHERE Db = \'company\';`  `DROP PROCEDURE IF EXISTS p;`'],
  ], [22, 78]],

  ['h2', 'Stored functions'],
  ['p', 'A function returns one value and can be used inside any expression. With binary logging on (the MySQL 8 default) it must be declared `DETERMINISTIC`, `NO SQL` or `READS SQL DATA`.'],
  ['sql', `DELIMITER //
CREATE FUNCTION tax(p_salary INT) RETURNS DECIMAL(10,2) DETERMINISTIC
BEGIN
    RETURN CASE WHEN p_salary > 70000 THEN p_salary * 0.20
                WHEN p_salary > 50000 THEN p_salary * 0.10
                ELSE 0 END;
END //
DELIMITER ;

SELECT name, salary, tax(salary) AS tax FROM employees ORDER BY emp_id LIMIT 4;`],
  ['out', [{ cols: ['name', 'salary', 'tax'], rows: [['Asha', 85000, '17000.00'], ['Ravi', 50000, '0.00'], ['Neha', 71000, '14200.00'], ['Arjun', 62000, '6200.00']] }]],
  ['table', ['', 'Procedure', 'Function'], [
    ['Called with', '`CALL p(...)`', 'Inside an expression: `SELECT f(x)`'],
    ['Returns', '0 or more values through `OUT` parameters, and result sets', 'Exactly one value via `RETURN`'],
    ['Transactions', 'Can `COMMIT` / `ROLLBACK`', 'Cannot'],
    ['Usable in `SELECT` / `WHERE`', 'No', 'Yes'],
  ], [26, 37, 37]],

  ['h2', 'Triggers'],
  ['p', 'A trigger runs automatically `BEFORE` or `AFTER` an `INSERT`, `UPDATE` or `DELETE`, once per affected row. Inside it, `NEW.c` is the incoming value and `OLD.c` the previous one (`INSERT` has only `NEW`, `DELETE` only `OLD`).'],
  ['sql', `CREATE TABLE salary_log (
    emp_id INT, old_salary INT, new_salary INT,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

DELIMITER //
CREATE TRIGGER trg_salary_audit AFTER UPDATE ON employees
FOR EACH ROW
BEGIN
    IF NEW.salary <> OLD.salary THEN
        INSERT INTO salary_log (emp_id, old_salary, new_salary)
        VALUES (OLD.emp_id, OLD.salary, NEW.salary);
    END IF;
END //

CREATE TRIGGER trg_check_hire BEFORE INSERT ON employees
FOR EACH ROW
BEGIN
    IF NEW.hire_date > CURDATE() THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'hire_date cannot be in the future';
    END IF;
END //
DELIMITER ;

INSERT INTO employees VALUES (107, 'Kabir', 1, 40000, '2030-01-01', NULL, NULL);`],
  ['out', ['ERROR 1644 (45000): hire_date cannot be in the future']],
  ['p', 'Part 11 uses the audit trigger to show that trigger changes roll back together with the statement that fired them. `SHOW TRIGGERS;` lists triggers and `DROP TRIGGER name;` removes one.'],
  ['tip', 'Use `BEFORE` triggers to validate or adjust `NEW` values (you can `SET NEW.c = ...`), and `AFTER` triggers to write to other tables, such as audit logs.'],

  // ---------------------------------------------------------------- part 11
  ['part', 'Part 11: Transactions and users', 'Grouping changes so they succeed or fail together, and controlling who can do what.'],
  ['h2', 'Transactions'],
  ['p', 'A transaction is a group of statements that is applied completely or not at all. By default MySQL is in **autocommit** mode: each statement is its own transaction.'],
  ['table', ['Statement', 'Purpose'], [
    ['`START TRANSACTION;` (or `BEGIN;`)', 'Start a transaction'],
    ['`COMMIT;`', 'Make all changes permanent'],
    ['`ROLLBACK;`', 'Undo every change since the start'],
    ['`SAVEPOINT name;`', 'Mark a point inside the transaction'],
    ['`ROLLBACK TO SAVEPOINT name;`', 'Undo back to the mark; the transaction stays open'],
    ['`RELEASE SAVEPOINT name;`', 'Remove the mark'],
    ['`SET autocommit = 0;`', 'Every statement starts a transaction until you `COMMIT`'],
    ['`SET TRANSACTION ISOLATION LEVEL READ COMMITTED;`', 'Isolation for the next transaction'],
  ], [50, 50]],
  ['sql', `START TRANSACTION;
UPDATE employees SET salary = salary + 5000 WHERE emp_id = 105;
SAVEPOINT after_sam;
UPDATE employees SET salary = salary + 5000 WHERE emp_id = 106;
ROLLBACK TO SAVEPOINT after_sam;                       -- undo Zoya's raise only

SELECT emp_id, salary FROM employees WHERE emp_id IN (105, 106);
SELECT emp_id, old_salary, new_salary FROM salary_log;  -- written by the trigger

ROLLBACK;                                              -- undo everything
SELECT emp_id, salary FROM employees WHERE emp_id IN (105, 106);
SELECT COUNT(*) AS log_rows FROM salary_log;`],
  ['out', [
    { cols: ['emp_id', 'salary'], rows: [[105, 60000], [106, 48000]] },
    { cols: ['emp_id', 'old_salary', 'new_salary'], rows: [[105, 55000, 60000]] },
    { cols: ['emp_id', 'salary'], rows: [[105, 55000], [106, 48000]] },
    { cols: ['log_rows'], rows: [[0]] },
  ]],
  ['trap', 'DDL statements (`CREATE`, `ALTER`, `DROP`, `TRUNCATE`) cause an **implicit commit**: running one in the middle of a transaction commits everything before it, and it can\'t be rolled back. Transactions only work with the InnoDB engine (the default).'],
  ['table', ['ACID property', 'Meaning'], [
    ['**A**tomicity', 'All statements succeed, or none take effect'],
    ['**C**onsistency', 'Constraints hold before and after every transaction'],
    ['**I**solation', 'Concurrent transactions don\'t see each other\'s unfinished work (to a chosen degree)'],
    ['**D**urability', 'Once committed, changes survive a crash'],
  ], [25, 75]],
  ['table', ['Isolation level', 'Dirty read', 'Non-repeatable read', 'Phantom read'], [
    ['`READ UNCOMMITTED`', 'Possible', 'Possible', 'Possible'],
    ['`READ COMMITTED`', 'No', 'Possible', 'Possible'],
    ['`REPEATABLE READ` (InnoDB default)', 'No', 'No', 'Mostly prevented by InnoDB'],
    ['`SERIALIZABLE`', 'No', 'No', 'No'],
  ], [34, 20, 23, 23]],

  ['h2', 'Users and privileges'],
  ['table', ['Statement', 'Purpose'], [
    ['`CREATE USER \'report\'@\'localhost\' IDENTIFIED BY \'change_me\';`', 'Create a user (user@host)'],
    ['`GRANT SELECT ON company.* TO \'report\'@\'localhost\';`', 'Read-only access to one database'],
    ['`GRANT SELECT, INSERT, UPDATE ON company.employees TO ...;`', 'Specific rights on one table'],
    ['`GRANT ALL PRIVILEGES ON company.* TO ...;`', 'Full control of one database'],
    ['`SHOW GRANTS FOR \'report\'@\'localhost\';`', 'List a user\'s privileges'],
    ['`REVOKE INSERT ON company.employees FROM ...;`', 'Take a privilege away'],
    ['`ALTER USER ... IDENTIFIED BY \'new\';` / `DROP USER ...;`', 'Change password / remove user'],
  ], [62, 38]],
  ['p', '`GRANT` and `REVOKE` make up **DCL** (Data Control Language); `COMMIT`, `ROLLBACK` and `SAVEPOINT` make up **TCL**. Appendix A lists all five SQL categories.'],

  // ---------------------------------------------------------------- part 12
  ['part', 'Part 12: MySQL from Java (JDBC)', 'Running queries from a Java program.'],
  ['h2', 'JDBC essentials'],
  ['p', 'Add MySQL Connector/J to the project (Maven `com.mysql:mysql-connector-j`). The URL format is `jdbc:mysql://host:port/database`.'],
  ['table', ['Method', 'Purpose'], [
    ['`DriverManager.getConnection(url, user, password)`', 'Open a `Connection`'],
    ['`conn.prepareStatement(sql)`', 'Pre-compiled SQL with `?` placeholders'],
    ['`ps.setInt(i, v)`, `setString`, `setDate`, `setNull`', 'Fill placeholder i (numbered from **1**)'],
    ['`ps.executeQuery()`', 'Run a `SELECT`; returns a `ResultSet`'],
    ['`ps.executeUpdate()`', 'Run `INSERT` / `UPDATE` / `DELETE`; returns rows affected'],
    ['`rs.next()`', 'Move to the next row; false when there are no more'],
    ['`rs.getString("col")`, `getInt`, `getDate`, ...', 'Read a column by name or by 1-based position'],
    ['`conn.setAutoCommit(false)`, `commit()`, `rollback()`', 'Transactions'],
    ['`ps.addBatch()`, `ps.executeBatch()`', 'Send many inserts in one round trip'],
    ['`prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)`', 'Then `ps.getGeneratedKeys()` for `AUTO_INCREMENT` ids'],
  ], [52, 48]],
  ['java', `import java.sql.*;

public class Main {
    public static void main(String[] args) throws SQLException {
        String url = "jdbc:mysql://localhost:3306/company";
        String sql = "SELECT name, salary FROM employees WHERE dept_id = ? ORDER BY salary DESC";
        try (Connection conn = DriverManager.getConnection(url, "root", System.getenv("DB_PASSWORD"));
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, 1);                              // first ? = dept 1 (IT)
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next())
                    System.out.println(rs.getString("name") + " earns " + rs.getInt("salary"));
            }
            conn.setAutoCommit(false);                    // start a transaction
            try (PreparedStatement up = conn.prepareStatement(
                    "UPDATE employees SET salary = salary + ? WHERE emp_id = ?")) {
                up.setInt(1, 1000);
                up.setInt(2, 105);
                System.out.println("rows updated: " + up.executeUpdate());
                conn.rollback();                          // undo (commit() would keep it)
            }
        }
    }
}`],
  ['out', ['Asha earns 85000\nNeha earns 71000\nrows updated: 1']],
  ['trap', 'Never build SQL by joining strings with user input: `"... WHERE name = \'" + input + "\'"` allows **SQL injection** (input like `x\' OR \'1\'=\'1` returns every row). `PreparedStatement` placeholders send values separately from the SQL, so they are always treated as data.'],

  // ---------------------------------------------------------------- appendix A
  ['part', 'Appendix A: Execution order and quick comparisons', 'The order MySQL evaluates a query in, and the comparisons interviewers ask about most.'],
  ['h2', 'Logical order of a SELECT'],
  ['p', 'You write `SELECT` first, but it is evaluated almost last:'],
  ['table', ['Step', 'Clause', 'Consequence'], [
    ['1', '`FROM` and `JOIN`', 'Tables are combined first'],
    ['2', '`WHERE`', 'Can\'t see `SELECT` aliases, aggregates or window functions'],
    ['3', '`GROUP BY`', 'Rows collapse into groups'],
    ['4', '`HAVING`', 'Filters groups; can use aggregates (and, in MySQL, aliases)'],
    ['5', '`SELECT` (window functions run here)', 'Expressions and aliases are computed'],
    ['6', '`DISTINCT`', 'Duplicates removed'],
    ['7', '`ORDER BY`', 'Can use aliases'],
    ['8', '`LIMIT` / `OFFSET`', 'Applied last'],
  ], [8, 37, 55]],
  ['h2', 'SQL command categories'],
  ['table', ['Category', 'Full name', 'Statements'], [
    ['DDL', 'Data Definition Language', '`CREATE`, `ALTER`, `DROP`, `TRUNCATE`, `RENAME`'],
    ['DML', 'Data Manipulation Language', '`INSERT`, `UPDATE`, `DELETE` (and `MERGE`-like upserts)'],
    ['DQL', 'Data Query Language', '`SELECT`'],
    ['DCL', 'Data Control Language', '`GRANT`, `REVOKE`'],
    ['TCL', 'Transaction Control Language', '`START TRANSACTION`, `COMMIT`, `ROLLBACK`, `SAVEPOINT`'],
  ], [14, 32, 54]],
  ['h2', 'Common comparisons'],
  ['table', ['Compare', 'Difference'], [
    ['`WHERE` vs `HAVING`', '`WHERE` filters rows before grouping and can\'t use aggregates; `HAVING` filters groups after'],
    ['`UNION` vs `UNION ALL`', '`UNION` removes duplicates (slower); `UNION ALL` keeps them'],
    ['`CHAR` vs `VARCHAR`', '`CHAR(n)` is fixed length and padded; `VARCHAR(n)` uses only the length needed'],
    ['`PRIMARY KEY` vs `UNIQUE`', 'Primary key: one per table, no `NULL`s. Unique: many per table, `NULL`s allowed'],
    ['`COUNT(*)` vs `COUNT(c)`', 'All rows vs rows where c is not `NULL`'],
    ['`RANK` vs `DENSE_RANK` vs `ROW_NUMBER`', 'Ties: 1, 2, 2, 4 vs 1, 2, 2, 3 vs 1, 2, 3, 4'],
    ['`IN` vs `EXISTS`', 'Similar results; `EXISTS` stops at the first match and is safe with `NULL`s (unlike `NOT IN`)'],
    ['`INNER` vs `LEFT JOIN`', 'Matches only vs every left row, padded with `NULL`s'],
    ['View vs table', 'A view stores a query, not data; it always shows current table contents'],
    ['Procedure vs function', 'Procedure: `CALL`, `OUT` parameters, transactions. Function: one return value, used in expressions'],
    ['`DATETIME` vs `TIMESTAMP`', '`TIMESTAMP` is stored in UTC and converted to the session time zone; range ends in 2038'],
    ['Primary key vs foreign key', 'Primary key identifies a row in its own table; foreign key points to a primary key in another table'],
  ], [30, 70]],

  // ---------------------------------------------------------------- appendix B
  ['part', 'Appendix B: Common error codes', 'What the error means and the usual fix.'],
  ['h2', 'Error reference'],
  ['table', ['Code', 'Message (shortened)', 'Usual cause and fix'], [
    ['1064', 'You have an error in your SQL syntax', 'Typo, missing comma or quote, or a reserved word used as a name (wrap it in backticks)'],
    ['1054', 'Unknown column \'x\' in ...', 'Misspelt column, or an alias used in `WHERE`'],
    ['1146', 'Table \'db.t\' doesn\'t exist', 'Wrong name or database: check `USE db;`'],
    ['1062', 'Duplicate entry \'v\' for key ...', 'Value already exists in a `PRIMARY KEY` / `UNIQUE` column'],
    ['1048', 'Column \'c\' cannot be null', 'Explicit `NULL` into a `NOT NULL` column'],
    ['1364', 'Field \'c\' doesn\'t have a default value', '`NOT NULL` column without a default left out of the `INSERT`'],
    ['1136', 'Column count doesn\'t match value count', '`INSERT ... VALUES` without a column list needs a value for every column'],
    ['1406', 'Data too long for column \'c\'', 'Text longer than `VARCHAR(n)`: widen the column'],
    ['1452', 'Cannot add or update a child row: a foreign key constraint fails', 'Referenced parent row doesn\'t exist: insert the parent first'],
    ['1451', 'Cannot delete or update a parent row', 'Children still reference it: delete them first or use `ON DELETE CASCADE`'],
    ['3819', 'Check constraint \'...\' is violated', 'Value breaks a `CHECK` rule'],
    ['1242', 'Subquery returns more than 1 row', 'Use `IN` instead of `=`, or make the subquery return one value'],
    ['1055', 'Expression ... is not in GROUP BY clause', 'Add the column to `GROUP BY` or wrap it in an aggregate'],
    ['1111', 'Invalid use of group function', 'Aggregate in `WHERE`: move the condition to `HAVING`'],
    ['1175', 'You are using safe update mode ...', '`UPDATE`/`DELETE` without a key in `WHERE` (Workbench safe mode)'],
    ['1644', '(your message)', 'Raised by `SIGNAL SQLSTATE \'45000\'` in a trigger or procedure'],
    ['1213', 'Deadlock found when trying to get lock', 'Two transactions waiting on each other: retry the transaction'],
    ['1045', 'Access denied for user ...', 'Wrong password, or the user@host combination doesn\'t exist'],
  ], [9, 41, 50]],
  ['note', 'Reserved words that often catch people out as column names or aliases: `rank`, `order`, `group`, `key`, `desc`, `range`, `rows`, `window`. Rename them, or quote them in backticks.'],
];
