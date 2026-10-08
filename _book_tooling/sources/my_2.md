# Part 9: Views and indexes
%Saved queries, and the structures that make queries fast.

## Views

A view is a saved `SELECT` that you query like a table. It stores no data: every query on it re-runs the underlying `SELECT`.

| Statement | Purpose |
|---|---|
| `CREATE VIEW v AS SELECT ...;` | Create a view |
| `CREATE OR REPLACE VIEW v AS ...;` | Create, or redefine an existing view |
| `... WITH CHECK OPTION` | Reject inserts/updates through the view that the view's `WHERE` would hide |
| `DROP VIEW IF EXISTS v;` | Remove the view (the data in the base tables is untouched) |
| `SHOW FULL TABLES WHERE Table_type = 'VIEW';` | List views |

```sql run
CREATE VIEW dept_summary AS
SELECT d.dept_name, COUNT(e.emp_id) AS staff, COALESCE(SUM(e.salary), 0) AS payroll
FROM departments d LEFT JOIN employees e ON e.dept_id = d.dept_id
GROUP BY d.dept_id, d.dept_name;

SELECT * FROM dept_summary WHERE staff > 0 ORDER BY payroll DESC;
```

Uses: hide complex joins, give users access to some columns only, and keep report logic in one place. A view is updatable only if it maps rows one-to-one onto a single base table: no `GROUP BY`, `DISTINCT`, aggregates or `UNION`.

## Indexes

An index (a B-tree in InnoDB) lets MySQL find rows without scanning the whole table, like the index at the back of a book. It speeds up `WHERE`, `JOIN`, `ORDER BY` and `GROUP BY`, but slows down writes and uses space.

| Statement | Purpose |
|---|---|
| `CREATE INDEX idx_salary ON employees (salary);` | Ordinary index |
| `CREATE UNIQUE INDEX idx_email ON employees (email);` | Index that also enforces uniqueness |
| `CREATE INDEX idx_dept_sal ON employees (dept_id, salary);` | Composite index: column order matters |
| `CREATE INDEX idx_name ON employees (name(10));` | Prefix index on the first 10 characters |
| `CREATE FULLTEXT INDEX ft ON posts (body);` | Word search with `MATCH (body) AGAINST ('word')` |
| `SHOW INDEX FROM employees;` | List indexes |
| `DROP INDEX idx_salary ON employees;` | Remove an index |
| `EXPLAIN SELECT ...;` | Show the plan: which index is used and how many rows are read |

| EXPLAIN column | What to look for |
|---|---|
| `type` | Best to worst: `const`, `eq_ref`, `ref`, `range`, `index`, `ALL` (`ALL` = full table scan) |
| `possible_keys` / `key` | Indexes that could be used / the one actually chosen (`NULL` = none) |
| `rows` | Estimated rows MySQL will examine |
| `Extra` | `Using index` is good (answered from the index alone); `Using filesort` or `Using temporary` means extra work |

A composite index on `(dept_id, salary)` follows the **leftmost-prefix rule**: it helps `WHERE dept_id = 1` and `WHERE dept_id = 1 AND salary > 60000`, but not `WHERE salary > 60000` alone.

> TRAP: An index is usually **not** used when the column is wrapped in a function (`WHERE YEAR(hire_date) = 2021`), when `LIKE` starts with a wildcard (`LIKE '%sha'`), or when a number column is compared to text or the reverse (implicit conversion).

# Part 10: Stored procedures, functions and triggers
%Programs stored and run inside the database.

## Stored procedures

A procedure is a named block of SQL called with `CALL`. Parameters are `IN` (input, the default), `OUT` (result) or `INOUT`. In the `mysql` client, change the delimiter first so the `;` inside the body doesn't end the `CREATE` statement.

```sql run
DELIMITER //
CREATE PROCEDURE dept_stats(IN p_dept VARCHAR(30), OUT p_staff INT, OUT p_avg DECIMAL(10,2))
BEGIN
    SELECT COUNT(*), AVG(e.salary) INTO p_staff, p_avg
    FROM employees e JOIN departments d ON e.dept_id = d.dept_id
    WHERE d.dept_name = p_dept;
END //
DELIMITER ;

CALL dept_stats('IT', @staff, @avg);
SELECT @staff, @avg;
```

| Element | Syntax |
|---|---|
| Local variable | `DECLARE total INT DEFAULT 0;` (at the top of `BEGIN ... END`) |
| Assign | `SET total = total + 1;` or `SELECT COUNT(*) INTO total FROM t;` |
| Session variable | `SET @x = 5;` (no declaration; lasts until you disconnect) |
| Condition | `IF c THEN ... ELSEIF c2 THEN ... ELSE ... END IF;` |
| Loops | `WHILE c DO ... END WHILE;`  `REPEAT ... UNTIL c END REPEAT;`  `lbl: LOOP ... LEAVE lbl; END LOOP;` |
| Cursor | `DECLARE cur CURSOR FOR SELECT ...;` `OPEN cur;` `FETCH cur INTO v;` `CLOSE cur;` |
| Handler | `DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;` |
| Raise an error | `SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '...';` |
| Manage | `SHOW PROCEDURE STATUS WHERE Db = 'company';`  `DROP PROCEDURE IF EXISTS p;` |

## Stored functions

A function returns one value and can be used inside any expression. With binary logging on (the MySQL 8 default) it must be declared `DETERMINISTIC`, `NO SQL` or `READS SQL DATA`.

```sql run
DELIMITER //
CREATE FUNCTION tax(p_salary INT) RETURNS DECIMAL(10,2) DETERMINISTIC
BEGIN
    RETURN CASE WHEN p_salary > 70000 THEN p_salary * 0.20
                WHEN p_salary > 50000 THEN p_salary * 0.10
                ELSE 0 END;
END //
DELIMITER ;

SELECT name, salary, tax(salary) AS tax FROM employees ORDER BY emp_id LIMIT 4;
```

|  | Procedure | Function |
|---|---|---|
| Called with | `CALL p(...)` | Inside an expression: `SELECT f(x)` |
| Returns | 0 or more values through `OUT` parameters, and result sets | Exactly one value via `RETURN` |
| Transactions | Can `COMMIT` / `ROLLBACK` | Cannot |
| Usable in `SELECT` / `WHERE` | No | Yes |

## Triggers

A trigger runs automatically `BEFORE` or `AFTER` an `INSERT`, `UPDATE` or `DELETE`, once per affected row. Inside it, `NEW.c` is the incoming value and `OLD.c` the previous one (`INSERT` has only `NEW`, `DELETE` only `OLD`).

```sql run
CREATE TABLE salary_log (
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

INSERT INTO employees VALUES (107, 'Kabir', 1, 40000, '2030-01-01', NULL, NULL);
```

Part 11 uses the audit trigger to show that trigger changes roll back together with the statement that fired them. `SHOW TRIGGERS;` lists triggers and `DROP TRIGGER name;` removes one.

> TIP: Use `BEFORE` triggers to validate or adjust `NEW` values (you can `SET NEW.c = ...`), and `AFTER` triggers to write to other tables, such as audit logs.

# Part 11: Transactions and users
%Grouping changes so they succeed or fail together, and controlling who can do what.

## Transactions

A transaction is a group of statements that is applied completely or not at all. By default MySQL is in **autocommit** mode: each statement is its own transaction.

| Statement | Purpose |
|---|---|
| `START TRANSACTION;` (or `BEGIN;`) | Start a transaction |
| `COMMIT;` | Make all changes permanent |
| `ROLLBACK;` | Undo every change since the start |
| `SAVEPOINT name;` | Mark a point inside the transaction |
| `ROLLBACK TO SAVEPOINT name;` | Undo back to the mark; the transaction stays open |
| `RELEASE SAVEPOINT name;` | Remove the mark |
| `SET autocommit = 0;` | Every statement starts a transaction until you `COMMIT` |
| `SET TRANSACTION ISOLATION LEVEL READ COMMITTED;` | Isolation for the next transaction |

```sql run+
START TRANSACTION;
UPDATE employees SET salary = salary + 5000 WHERE emp_id = 105;
SAVEPOINT after_sam;
UPDATE employees SET salary = salary + 5000 WHERE emp_id = 106;
ROLLBACK TO SAVEPOINT after_sam;                       -- undo Zoya's raise only

SELECT emp_id, salary FROM employees WHERE emp_id IN (105, 106);
SELECT emp_id, old_salary, new_salary FROM salary_log;  -- written by the trigger

ROLLBACK;                                              -- undo everything
SELECT emp_id, salary FROM employees WHERE emp_id IN (105, 106);
SELECT COUNT(*) AS log_rows FROM salary_log;
```

> TRAP: DDL statements (`CREATE`, `ALTER`, `DROP`, `TRUNCATE`) cause an **implicit commit**: running one in the middle of a transaction commits everything before it, and it can't be rolled back. Transactions only work with the InnoDB engine (the default).

| ACID property | Meaning |
|---|---|
| **A**tomicity | All statements succeed, or none take effect |
| **C**onsistency | Constraints hold before and after every transaction |
| **I**solation | Concurrent transactions don't see each other's unfinished work (to a chosen degree) |
| **D**urability | Once committed, changes survive a crash |

| Isolation level | Dirty read | Non-repeatable read | Phantom read |
|---|---|---|---|
| `READ UNCOMMITTED` | Possible | Possible | Possible |
| `READ COMMITTED` | No | Possible | Possible |
| `REPEATABLE READ` (InnoDB default) | No | No | Mostly prevented by InnoDB |
| `SERIALIZABLE` | No | No | No |

## Users and privileges

| Statement | Purpose |
|---|---|
| `CREATE USER 'report'@'localhost' IDENTIFIED BY 'change_me';` | Create a user (user@host) |
| `GRANT SELECT ON company.* TO 'report'@'localhost';` | Read-only access to one database |
| `GRANT SELECT, INSERT, UPDATE ON company.employees TO ...;` | Specific rights on one table |
| `GRANT ALL PRIVILEGES ON company.* TO ...;` | Full control of one database |
| `SHOW GRANTS FOR 'report'@'localhost';` | List a user's privileges |
| `REVOKE INSERT ON company.employees FROM ...;` | Take a privilege away |
| `ALTER USER ... IDENTIFIED BY 'new';` / `DROP USER ...;` | Change password / remove user |

`GRANT` and `REVOKE` make up **DCL** (Data Control Language); `COMMIT`, `ROLLBACK` and `SAVEPOINT` make up **TCL**. Appendix A lists all five SQL categories.

# Part 12: MySQL from Java (JDBC)
%Running queries from a Java program.

## JDBC essentials

Add MySQL Connector/J to the project (Maven `com.mysql:mysql-connector-j`). The URL format is `jdbc:mysql://host:port/database`.

| Method | Purpose |
|---|---|
| `DriverManager.getConnection(url, user, password)` | Open a `Connection` |
| `conn.prepareStatement(sql)` | Pre-compiled SQL with `?` placeholders |
| `ps.setInt(i, v)`, `setString`, `setDate`, `setNull` | Fill placeholder i (numbered from **1**) |
| `ps.executeQuery()` | Run a `SELECT`; returns a `ResultSet` |
| `ps.executeUpdate()` | Run `INSERT` / `UPDATE` / `DELETE`; returns rows affected |
| `rs.next()` | Move to the next row; false when there are no more |
| `rs.getString("col")`, `getInt`, `getDate`, ... | Read a column by name or by 1-based position |
| `conn.setAutoCommit(false)`, `commit()`, `rollback()` | Transactions |
| `ps.addBatch()`, `ps.executeBatch()` | Send many inserts in one round trip |
| `prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)` | Then `ps.getGeneratedKeys()` for `AUTO_INCREMENT` ids |

> NOTE: This program needs the MySQL Connector/J driver on the classpath, so it is shown here without being executed. Its two queries are the same as in the SQL examples above, which were run against MySQL.

```java
import java.sql.*;

public class Main {
    public static void main(String[] args) throws SQLException {
        String url = "jdbc:mysql://localhost:3306/company";
        String sql = "SELECT name, salary FROM employees WHERE dept_id = ? "
                + "ORDER BY salary DESC";
        String password = System.getenv("DB_PASSWORD");     // never hard-code passwords
        try (Connection conn = DriverManager.getConnection(url, "root", password);
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, 1);                              // first ? = dept 1 (IT)
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next())
                    System.out.println(rs.getString("name") + " earns "
                            + rs.getInt("salary"));
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
}
```

> TRAP: Never build SQL by joining strings with user input: `"... WHERE name = '" + input + "'"` allows **SQL injection** (input like `x' OR '1'='1` returns every row). `PreparedStatement` placeholders send values separately from the SQL, so they are always treated as data.

# Appendix A: Execution order and quick comparisons
%The order MySQL evaluates a query in, and the comparisons interviewers ask about most.

## Logical order of a SELECT

You write `SELECT` first, but it is evaluated almost last:

| Step | Clause | Consequence |
|---|---|---|
| 1 | `FROM` and `JOIN` | Tables are combined first |
| 2 | `WHERE` | Can't see `SELECT` aliases, aggregates or window functions |
| 3 | `GROUP BY` | Rows collapse into groups |
| 4 | `HAVING` | Filters groups; can use aggregates (and, in MySQL, aliases) |
| 5 | `SELECT` (window functions run here) | Expressions and aliases are computed |
| 6 | `DISTINCT` | Duplicates removed |
| 7 | `ORDER BY` | Can use aliases |
| 8 | `LIMIT` / `OFFSET` | Applied last |

## SQL command categories

| Category | Full name | Statements |
|---|---|---|
| DDL | Data Definition Language | `CREATE`, `ALTER`, `DROP`, `TRUNCATE`, `RENAME` |
| DML | Data Manipulation Language | `INSERT`, `UPDATE`, `DELETE` (and `MERGE`-like upserts) |
| DQL | Data Query Language | `SELECT` |
| DCL | Data Control Language | `GRANT`, `REVOKE` |
| TCL | Transaction Control Language | `START TRANSACTION`, `COMMIT`, `ROLLBACK`, `SAVEPOINT` |

## Common comparisons

| Compare | Difference |
|---|---|
| `WHERE` vs `HAVING` | `WHERE` filters rows before grouping and can't use aggregates; `HAVING` filters groups after |
| `UNION` vs `UNION ALL` | `UNION` removes duplicates (slower); `UNION ALL` keeps them |
| `CHAR` vs `VARCHAR` | `CHAR(n)` is fixed length and padded; `VARCHAR(n)` uses only the length needed |
| `PRIMARY KEY` vs `UNIQUE` | Primary key: one per table, no `NULL`s. Unique: many per table, `NULL`s allowed |
| `COUNT(*)` vs `COUNT(c)` | All rows vs rows where c is not `NULL` |
| `RANK` vs `DENSE_RANK` vs `ROW_NUMBER` | Ties: 1, 2, 2, 4 vs 1, 2, 2, 3 vs 1, 2, 3, 4 |
| `IN` vs `EXISTS` | Similar results; `EXISTS` stops at the first match and is safe with `NULL`s (unlike `NOT IN`) |
| `INNER` vs `LEFT JOIN` | Matches only vs every left row, padded with `NULL`s |
| View vs table | A view stores a query, not data; it always shows current table contents |
| Procedure vs function | Procedure: `CALL`, `OUT` parameters, transactions. Function: one return value, used in expressions |
| `DATETIME` vs `TIMESTAMP` | `TIMESTAMP` is stored in UTC and converted to the session time zone; range ends in 2038 |
| Primary key vs foreign key | Primary key identifies a row in its own table; foreign key points to a primary key in another table |

# Appendix B: Common error codes
%What the error means and the usual fix.

## Error reference

| Code | Message (shortened) | Usual cause and fix |
|---|---|---|
| 1064 | You have an error in your SQL syntax | Typo, missing comma or quote, or a reserved word used as a name (wrap it in backticks) |
| 1054 | Unknown column 'x' in ... | Misspelt column, or an alias used in `WHERE` |
| 1146 | Table 'db.t' doesn't exist | Wrong name or database: check `USE db;` |
| 1062 | Duplicate entry 'v' for key ... | Value already exists in a `PRIMARY KEY` / `UNIQUE` column |
| 1048 | Column 'c' cannot be null | Explicit `NULL` into a `NOT NULL` column |
| 1364 | Field 'c' doesn't have a default value | `NOT NULL` column without a default left out of the `INSERT` |
| 1136 | Column count doesn't match value count | `INSERT ... VALUES` without a column list needs a value for every column |
| 1406 | Data too long for column 'c' | Text longer than `VARCHAR(n)`: widen the column |
| 1452 | Cannot add or update a child row: a foreign key constraint fails | Referenced parent row doesn't exist: insert the parent first |
| 1451 | Cannot delete or update a parent row | Children still reference it: delete them first or use `ON DELETE CASCADE` |
| 3819 | Check constraint '...' is violated | Value breaks a `CHECK` rule |
| 1242 | Subquery returns more than 1 row | Use `IN` instead of `=`, or make the subquery return one value |
| 1055 | Expression ... is not in GROUP BY clause | Add the column to `GROUP BY` or wrap it in an aggregate |
| 1111 | Invalid use of group function | Aggregate in `WHERE`: move the condition to `HAVING` |
| 1175 | You are using safe update mode ... | `UPDATE`/`DELETE` without a key in `WHERE` (Workbench safe mode) |
| 1644 | (your message) | Raised by `SIGNAL SQLSTATE '45000'` in a trigger or procedure |
| 1213 | Deadlock found when trying to get lock | Two transactions waiting on each other: retry the transaction |
| 1045 | Access denied for user ... | Wrong password, or the user@host combination doesn't exist |

> NOTE: Reserved words that often catch people out as column names or aliases: `rank`, `order`, `group`, `key`, `desc`, `range`, `rows`, `window`. Rename them, or quote them in backticks.
