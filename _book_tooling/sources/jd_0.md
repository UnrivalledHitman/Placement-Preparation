# How to use this guide
%Where JDBC sits between Java and the database, how the programs run, and how this book connects to the others

**JDBC** (Java Database Connectivity) is the standard API through which every Java program talks to a relational database. Spring Data, JPA and Hibernate, MyBatis and jOOQ are all layers built on top of it: when a Spring application runs a query, a JDBC `PreparedStatement` executes it in the end. Knowing JDBC well means you can debug those layers, write fast batch jobs and reports without them, and answer the interview questions that service companies ask constantly ("Statement versus PreparedStatement", "how do you prevent SQL injection", "what is connection pooling").

The Java Complete Guide covers JDBC basics in two pages (Part 8). This book goes from the first connection to transactions, isolation levels, batching, connection pools, the DAO pattern, schema migrations and Servlets, ending where the Spring Boot Backend guide begins.

## How the programs run

Every program in this book is a complete single-file Java program that was run to produce the output shown. The database is **H2**, an embedded Java database, started in memory inside the program in **MySQL compatibility mode** (`MODE=MySQL`), so the SQL is the SQL you would write for MySQL. Where MySQL behaves differently, the text says so.

```text
jdbc/pom.xml      H2 2.2 (JDBC driver + database), HikariCP 5 (connection pool),
                  embedded Tomcat 10 (Servlets, Chapter 8), slf4j-nop (silences logging)
javac -cp <classpath> -d classes Main.java          (package demo; class demo.Main)
java  -cp <classpath>:classes demo.Main
```

To run them against a real MySQL server instead, add the MySQL Connector/J dependency (`com.mysql:mysql-connector-j`) and change the URL to `jdbc:mysql://localhost:3306/meters` with a user and password.

## How the chapters connect

| Chapter | Topic | Connects to |
|---|---|---|
| 1 | Architecture: drivers, URLs, `Connection`, resources | Java guide Part 8 |
| 2 | Statements, `PreparedStatement`, SQL injection, types, NULLs, generated keys | MySQL guide (SQL itself) |
| 3 | Transactions, savepoints, isolation levels, locking | DBMS Theory guide, Chapters 4–6 |
| 4 | Batching, fetch size, counting round trips, N+1 at the JDBC level | Spring Boot guide, Chapter 4 (N+1 in JPA) |
| 5 | Connection pools: HikariCP, sizing, exhaustion and leaks | Spring Boot guide, Chapter 8 |
| 6 | The DAO pattern, row mappers, exception translation, a mini `JdbcTemplate` | LLD guide (interfaces, dependency inversion) |
| 7 | Schema migrations: a small Flyway written by hand | Spring Boot guide, Chapter 4.6 |
| 8 | Servlets: the layer under Spring MVC | Spring Boot guide, Chapter 3 |
| 9 | From JDBC to JPA; question bank and cheat sheet | — |

## How to study this book

1. Read Chapters 1–3 before the TCS CPA exam; they cover what Java exams ask about JDBC.
2. Type every program into your own project and change it: break the SQL, forget to close a connection, remove a `commit`, and watch what happens.
3. Solve the **JDBC Practice Book** alongside.
4. Then read the Spring Boot guide: you will recognise JDBC under every chapter.

# Chapter 1: JDBC Architecture
%Drivers, URLs, connections and the four objects every JDBC program uses

## 1.1 The layers

```text
your code ──> JDBC API (java.sql, javax.sql: interfaces only)
                 │
                 ▼
            JDBC driver (a JAR from the database vendor: H2, MySQL Connector/J, PostgreSQL)
                 │  network protocol (or in-process for embedded databases such as H2)
                 ▼
            database server
```

The JDBC API is almost entirely **interfaces**: `Connection`, `Statement`, `PreparedStatement`, `ResultSet`. The driver provides the classes that implement them. Your code depends only on the interfaces, so changing the database means changing the driver JAR and the URL, not the code (as long as the SQL is portable). This is dependency inversion (LLD guide, Chapter 2) applied by the Java platform itself.

| Object | Role | Created by |
|---|---|---|
| `DriverManager` / `DataSource` | Hands out connections | `DriverManager.getConnection(url, user, pw)` or a pool |
| `Connection` | One session with the database; owns transactions | The above |
| `Statement` / `PreparedStatement` / `CallableStatement` | Sends SQL | `connection.createStatement()`, `prepareStatement(sql)`, `prepareCall("{call proc(?)}")` |
| `ResultSet` | A cursor over query results | `statement.executeQuery()` |

Since JDBC 4.0 (Java 6), drivers register themselves automatically through the service-loader mechanism, so `Class.forName("com.mysql.cj.jdbc.Driver")` is no longer needed. Old tutorials still show it; it does no harm.

## 1.2 URLs

| Database | URL |
|---|---|
| MySQL | `jdbc:mysql://host:3306/dbname?serverTimezone=UTC` |
| PostgreSQL | `jdbc:postgresql://host:5432/dbname` |
| Oracle | `jdbc:oracle:thin:@host:1521/service` |
| H2 in memory | `jdbc:h2:mem:name;DB_CLOSE_DELAY=-1` (kept until the JVM exits) |
| H2 file | `jdbc:h2:./data/meters` |

## 1.3 The first program

The program opens a connection, creates a table, inserts rows, runs a query and reads the results. Every JDBC resource (`Connection`, `Statement`, `ResultSet`) holds something in the driver or the server (a socket, a cursor, memory), so each one is opened in a **try-with-resources** block, which closes it even when an exception is thrown.

```java jdbc Connect, create, insert, query
package demo;

import java.sql.*;

public class Main {
    static final String URL = "jdbc:h2:mem:meters;MODE=MySQL;DB_CLOSE_DELAY=-1";

    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(URL, "sa", "")) {
            DatabaseMetaData md = con.getMetaData();
            System.out.println("database: " + md.getDatabaseProductName() + " "
                    + md.getDatabaseProductVersion().split(" ")[0]);
            System.out.println("driver:   " + md.getDriverName() + " " + md.getDriverVersion()
                    .split(" ")[0] + ", JDBC " + md.getJDBCMajorVersion() + "."
                    + md.getJDBCMinorVersion());
            try (Statement st = con.createStatement()) {
                st.executeUpdate("CREATE TABLE meter (id INT PRIMARY KEY, serial VARCHAR(20) "
                        + "NOT NULL UNIQUE, city VARCHAR(40))");
                int rows = st.executeUpdate("INSERT INTO meter VALUES "
                        + "(1, 'SM-001', 'Kolkata'), (2, 'SM-002', 'Howrah'), "
                        + "(3, 'SM-003', 'Kolkata')");
                System.out.println("inserted " + rows + " rows");
                String q = "SELECT id, serial, city FROM meter WHERE city = 'Kolkata' "
                        + "ORDER BY id";
                try (ResultSet rs = st.executeQuery(q)) {
                    while (rs.next())             // the cursor starts BEFORE the first row
                        System.out.println("  " + rs.getInt("id") + " "
                                + rs.getString("serial") + " " + rs.getString("city"));
                }
            }
        }
    }
}
```

| Method | Use | Returns |
|---|---|---|
| `executeQuery(sql)` | `SELECT` | `ResultSet` |
| `executeUpdate(sql)` | `INSERT`, `UPDATE`, `DELETE`, DDL | Number of affected rows (0 for DDL) |
| `execute(sql)` | Anything, when you do not know the type | `true` if the first result is a `ResultSet` |

> TRAP: A new `ResultSet` is positioned **before** the first row. Reading a column before calling `next()` throws `SQLException`. And `next()` returns `false` at the end, so `while (rs.next())` is the standard loop; for "at most one row", use `if (rs.next())`.

## 1.4 Closing resources, and what happens if you do not

```java jdbc Try-with-resources closes in reverse order, even on errors
package demo;

import java.sql.*;

public class Main {
    static final String URL = "jdbc:h2:mem:t;MODE=MySQL;DB_CLOSE_DELAY=-1";

    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(URL, "sa", "");
             Statement st = con.createStatement()) {
            st.executeQuery("SELECT * FROM table_that_does_not_exist");
        } catch (SQLException e) {
            System.out.println("query failed: SQLState " + e.getSQLState() + ", error code "
                    + e.getErrorCode());
        }
        try (Connection con = DriverManager.getConnection(URL, "sa", "")) {
            Connection leaked = DriverManager.getConnection(URL, "sa", "");   // never closed
            System.out.println("leaked connection still open? " + !leaked.isClosed());
        }
    }
}
```

The connection in the first block was closed automatically after the failed query, before the `catch` block ran. The second block leaks a connection: it stays open until the JVM exits. In a server that runs for weeks, leaked connections pile up until the database refuses new ones (Chapter 5 shows this with a pool).

| `SQLException` field | Meaning | Example |
|---|---|---|
| `getMessage()` | Driver's description | "Table ... not found" |
| `getSQLState()` | Standard 5-character code; first 2 characters are the class | `42` = syntax or access rule, `23` = integrity constraint, `08` = connection, `40` = transaction rollback |
| `getErrorCode()` | Vendor-specific number | MySQL 1062 = duplicate key |
| `getNextException()` | Chained errors (batches) | — |

## 1.5 Practical lessons

- Code against the `java.sql` interfaces; the driver JAR and URL choose the database.
- Every `Connection`, `Statement` and `ResultSet` goes in try-with-resources.
- `executeQuery` for SELECT, `executeUpdate` for changes; a `ResultSet` starts before the first row.
- Use SQLState classes, not message text, to decide how to handle an error.

# Chapter 2: Statements, Parameters and SQL Injection
%Why PreparedStatement is the default, how injection works, and the details of types, NULLs and generated keys

## 2.1 SQL injection, demonstrated

Building SQL by concatenating user input lets the input change the **structure** of the query. The classic login bypass:

```java jdbc A login check that injection bypasses, and the PreparedStatement fix
package demo;

import java.sql.*;

public class Main {
    static final String URL = "jdbc:h2:mem:inj;MODE=MySQL;DB_CLOSE_DELAY=-1";

    static boolean unsafeLogin(Connection con, String user, String pw) throws SQLException {
        String sql = "SELECT COUNT(*) FROM app_user WHERE name = '" + user
                + "' AND password = '" + pw + "'";
        System.out.println("    SQL sent: " + sql);
        try (Statement st = con.createStatement(); ResultSet rs = st.executeQuery(sql)) {
            rs.next();
            return rs.getInt(1) > 0;
        }
    }
    static boolean safeLogin(Connection con, String user, String pw) throws SQLException {
        String sql = "SELECT COUNT(*) FROM app_user WHERE name = ? AND password = ?";
        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, user);                       // values travel separately from SQL
            ps.setString(2, pw);
            try (ResultSet rs = ps.executeQuery()) { rs.next(); return rs.getInt(1) > 0; }
        }
    }
    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(URL, "sa", "");
             Statement st = con.createStatement()) {
            st.execute("CREATE TABLE app_user (name VARCHAR(20), password VARCHAR(60))");
            st.execute("INSERT INTO app_user VALUES ('asha', 'secret')");
            String attack = "' OR '1'='1";
            boolean a = unsafeLogin(con, "asha", "secret");
            System.out.println("unsafe, correct password:  " + a);
            boolean b = unsafeLogin(con, "asha", attack);
            System.out.println("unsafe, injected password: " + b);
            boolean c = safeLogin(con, "asha", "secret");
            System.out.println("safe,   correct password:  " + c);
            boolean d = safeLogin(con, "asha", attack);
            System.out.println("safe,   injected password: " + d);
        }
    }
}
```

The injected text closes the string literal and adds `OR '1'='1'`, which is always true, so the unsafe check logs the attacker in without the password. With `PreparedStatement`, the SQL is sent with `?` placeholders and the values separately; the database never parses the values as SQL, so the same text is just an unusual password that does not match.

> NOTE: Storing plain-text passwords, as this demonstration does, is itself a serious flaw. Real systems store a slow salted hash (BCrypt, Argon2; Spring Boot guide, Chapter 6) and compare hashes in application code.

## 2.2 Statement versus PreparedStatement versus CallableStatement

| | `Statement` | `PreparedStatement` | `CallableStatement` |
|---|---|---|---|
| SQL | Fixed text, compiled each time | Precompiled with `?` placeholders | Calls a stored procedure: `{call name(?, ?)}` |
| Injection-safe | No (if concatenating input) | **Yes** | Yes |
| Performance for repeated SQL | Parsed every time | Parsed once per statement (and cached by many drivers and servers) | Same as prepared |
| Types | Everything as text | Typed setters (`setInt`, `setObject`) | Typed, plus `registerOutParameter` for OUT parameters |
| Use for | DDL, fixed admin SQL | **Every query with values** | Stored procedures |

> TRAP: Placeholders work only for **values**, not for table names, column names or `ORDER BY` directions. `ORDER BY ?` sorts by a constant. If a column name comes from user input, choose it from an allow-list in code (`Set.of("serial", "city")`), never concatenate the raw input.

## 2.3 Types, NULLs, dates and generated keys

| Java | SQL type | Setter / getter |
|---|---|---|
| `int`, `long` | `INT`, `BIGINT` | `setInt` / `getInt`, `setLong` / `getLong` |
| `BigDecimal` | `DECIMAL(p, s)` | `setBigDecimal` (money: never `double`) |
| `String` | `VARCHAR`, `TEXT` | `setString` / `getString` |
| `boolean` | `BOOLEAN` (MySQL: `TINYINT(1)`) | `setBoolean` / `getBoolean` |
| `LocalDate`, `LocalDateTime`, `Instant`/`OffsetDateTime` | `DATE`, `TIMESTAMP`, `TIMESTAMP WITH TIME ZONE` | `setObject(i, value)` / `getObject(i, LocalDate.class)` (JDBC 4.2) |
| `null` | any | `setNull(i, Types.INTEGER)` or `setObject(i, null)` |

The **NULL trap**: `getInt` returns 0 for a SQL NULL, so a missing reading and a real zero look the same. Call `wasNull()` immediately after the getter, or read with `getObject(i, Integer.class)`, which returns `null`.

```java jdbc NULLs, java.time values and generated keys
package demo;

import java.math.BigDecimal;
import java.sql.*;
import java.time.*;

public class Main {
    static final String URL = "jdbc:h2:mem:types;MODE=MySQL;DB_CLOSE_DELAY=-1";

    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(URL, "sa", "")) {
            try (Statement st = con.createStatement()) {
                st.execute("CREATE TABLE reading (id BIGINT AUTO_INCREMENT PRIMARY KEY, "
                        + "serial VARCHAR(20), read_on DATE, taken_at TIMESTAMP, "
                        + "kwh DECIMAL(10,3), faults INT)");
            }
            String sql = "INSERT INTO reading (serial, read_on, taken_at, kwh, faults) "
                    + "VALUES (?, ?, ?, ?, ?)";
            try (PreparedStatement ps = con.prepareStatement(sql,
                    Statement.RETURN_GENERATED_KEYS)) {
                Object[][] rows = {
                    {"SM-001", LocalDate.of(2026, 10, 1), LocalDateTime.of(2026, 10, 1, 6, 0),
                     new BigDecimal("1.250"), 0},
                    {"SM-002", LocalDate.of(2026, 10, 1),
                     LocalDateTime.of(2026, 10, 1, 6, 15), new BigDecimal("0.875"),
                     null}};                                       // faults unknown
                for (Object[] r : rows) {
                    for (int i = 0; i < r.length; i++) ps.setObject(i + 1, r[i]);
                    ps.executeUpdate();
                    try (ResultSet keys = ps.getGeneratedKeys()) {
                        keys.next();
                        System.out.println("inserted id " + keys.getLong(1));
                    }
                }
            }
            try (Statement st = con.createStatement();
                 ResultSet rs = st.executeQuery("SELECT * FROM reading ORDER BY id")) {
                while (rs.next()) {
                    int faults = rs.getInt("faults");
                    boolean missing = rs.wasNull();               // must follow the getter
                    LocalDateTime at = rs.getObject("taken_at", LocalDateTime.class);
                    System.out.printf("%s on %s at %s kWh %s faults getInt=%d wasNull=%b "
                            + "getObject=%s%n", rs.getString("serial"),
                            rs.getObject("read_on", LocalDate.class), at.toLocalTime(),
                            rs.getBigDecimal("kwh"), faults, missing,
                            rs.getObject("faults", Integer.class));
                }
            }
        }
    }
}
```

For SM-002, `getInt` returns 0 although the value is unknown; only `wasNull()` or `getObject(..., Integer.class)` tells the truth. The generated keys come back without a second query, which matters with auto-increment ids (do not run `SELECT MAX(id)`: under concurrent inserts it returns someone else's row).

## 2.4 Reading results efficiently

| Topic | Rule |
|---|---|
| Column access | By label (`rs.getString("serial")`) for readability; by index is slightly faster and needed for unnamed expressions (`COUNT(*)`) unless you alias them |
| Only what you need | `SELECT id, serial` instead of `SELECT *`: less data, stable code when columns are added |
| Fetch size | `setFetchSize(n)` asks the driver to stream rows in chunks; MySQL Connector/J loads the **whole** result into memory by default, so huge exports need streaming (`setFetchSize(Integer.MIN_VALUE)` on MySQL, or `useCursorFetch=true`) |
| Scrollable and updatable result sets | `createStatement(TYPE_SCROLL_INSENSITIVE, CONCUR_UPDATABLE)` allows moving backwards and updating rows through the cursor; rarely used in modern code |
| Limits | Paginate in SQL (`LIMIT ? OFFSET ?`, or keyset pagination `WHERE id > ? ORDER BY id LIMIT ?`), not in Java |

## 2.5 Practical lessons

- Use `PreparedStatement` for every statement with values; never concatenate input into SQL.
- Placeholders cannot carry identifiers: use an allow-list for dynamic column names.
- `getInt` turns NULL into 0; check `wasNull()` or use `getObject` with a wrapper class.
- Use `java.time` with `setObject`/`getObject`, `BigDecimal` for money, and `RETURN_GENERATED_KEYS` for new ids.
