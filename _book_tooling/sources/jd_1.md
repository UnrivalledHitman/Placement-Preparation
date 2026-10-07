# Chapter 3: Transactions, Isolation and Locking
%Auto-commit, commit and rollback, savepoints, the four isolation levels observed, and how to avoid lost updates

## 3.1 Auto-commit and explicit transactions

A new `Connection` is in **auto-commit** mode: every statement is its own transaction, committed as soon as it finishes. For work that must succeed or fail as a whole, turn auto-commit off, run the statements, then `commit()`; on any failure, `rollback()`.

```text
con.setAutoCommit(false);
try {
    ... several statements ...
    con.commit();
} catch (SQLException | RuntimeException e) {
    con.rollback();
    throw e;
} finally {
    con.setAutoCommit(true);     // important with pooled connections (Chapter 5)
}
```

```java jdbc A transfer that must be all-or-nothing
package demo;

import java.sql.*;

public class Main {
    static final String URL = "jdbc:h2:mem:tx;MODE=MySQL;DB_CLOSE_DELAY=-1";

    static void transfer(Connection con, int from, int to, int paise, boolean failMidway)
            throws SQLException {
        String debit = "UPDATE wallet SET paise = paise - ? WHERE id = ? AND paise >= ?";
        String credit = "UPDATE wallet SET paise = paise + ? WHERE id = ?";
        con.setAutoCommit(false);
        try (PreparedStatement d = con.prepareStatement(debit);
             PreparedStatement c = con.prepareStatement(credit)) {
            d.setInt(1, paise); d.setInt(2, from); d.setInt(3, paise);
            if (d.executeUpdate() != 1) throw new SQLException("insufficient balance");
            if (failMidway) throw new IllegalStateException("crash between debit and credit");
            c.setInt(1, paise); c.setInt(2, to);
            c.executeUpdate();
            con.commit();
        } catch (SQLException | RuntimeException e) {
            con.rollback();
            System.out.println("  rolled back: " + e.getMessage());
        } finally {
            con.setAutoCommit(true);
        }
    }
    static void show(Connection con) throws SQLException {
        try (Statement st = con.createStatement();
             ResultSet rs = st.executeQuery("SELECT id, paise FROM wallet ORDER BY id")) {
            StringBuilder sb = new StringBuilder("  balances:");
            while (rs.next())
                sb.append(" ").append(rs.getInt(1)).append("=").append(rs.getInt(2));
            System.out.println(sb);
        }
    }
    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(URL, "sa", "")) {
            try (Statement st = con.createStatement()) {
                st.execute("CREATE TABLE wallet (id INT PRIMARY KEY, paise INT NOT NULL)");
                st.execute("INSERT INTO wallet VALUES (1, 10000), (2, 500)");
            }
            System.out.println("transfer 3000 from 1 to 2:");
            transfer(con, 1, 2, 3000, false); show(con);
            System.out.println("transfer 3000, crash midway:");
            transfer(con, 1, 2, 3000, true); show(con);
            System.out.println("transfer 9000 (too much):");
            transfer(con, 1, 2, 9000, false); show(con);
        }
    }
}
```

The debit of the second transfer was executed, but the rollback undid it, so no money vanished. The third transfer is refused by the `AND paise >= ?` condition: checking the balance **inside** the `UPDATE` makes the check and the change one atomic step, which a separate `SELECT` followed by an `UPDATE` would not be.

> TRAP: Calling `commit()` or `rollback()` in auto-commit mode throws an exception in most drivers. And a connection returned to a pool with auto-commit still `false` and an open transaction will surprise the next user; reset it in `finally`.

## 3.2 Savepoints

A **savepoint** marks a point inside a transaction to which you can roll back without abandoning the whole transaction: process a batch of meter files, and skip one bad file while keeping the others.

```java jdbc Rolling back to a savepoint
package demo;

import java.sql.*;

public class Main {
    static final String URL = "jdbc:h2:mem:sp;MODE=MySQL;DB_CLOSE_DELAY=-1";

    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(URL, "sa", "")) {
            try (Statement st = con.createStatement()) {
                st.execute("CREATE TABLE reading (serial VARCHAR(10), "
                        + "kwh INT CHECK (kwh >= 0))");
            }
            con.setAutoCommit(false);
            String[][] files = {{"SM-1", "5"}, {"SM-2", "-4"}, {"SM-3", "7"}};
            String insert = "INSERT INTO reading VALUES (?, ?)";
            try (PreparedStatement ps = con.prepareStatement(insert)) {
                for (String[] f : files) {
                    Savepoint sp = con.setSavepoint();
                    try {
                        ps.setString(1, f[0]); ps.setInt(2, Integer.parseInt(f[1]));
                        ps.executeUpdate();
                        con.releaseSavepoint(sp);
                    } catch (SQLException e) {
                        con.rollback(sp);                    // undo only this file
                        System.out.println("skipped " + f[0] + ": SQLState "
                                + e.getSQLState());
                    }
                }
            }
            con.commit();
            try (Statement st = con.createStatement();
                 ResultSet rs = st.executeQuery(
                         "SELECT serial FROM reading ORDER BY serial")) {
                StringBuilder sb = new StringBuilder("committed:");
                while (rs.next()) sb.append(' ').append(rs.getString(1));
                System.out.println(sb);
            }
        }
    }
}
```

SQLState class `23` is "integrity constraint violation": the `CHECK (kwh >= 0)` constraint rejected the negative reading, the savepoint removed only that row, and the other two were committed together.

## 3.3 Isolation levels, observed

The isolation level decides what one transaction can see of another's work (DBMS Theory guide, Chapter 4, explains the theory). The program opens two connections to the same database: a **writer** that debits Rs 30 from a wallet, and a **reader** that reads the balance three times in one transaction: before the write, after the uncommitted write, and after the writer commits.

```java jdbc What a reader sees at each isolation level
package demo;

import java.sql.*;

public class Main {
    static final String URL = "jdbc:h2:mem:iso;MODE=MySQL;DB_CLOSE_DELAY=-1";

    static int read(Connection c) throws SQLException {
        try (Statement st = c.createStatement();
             ResultSet rs = st.executeQuery("SELECT paise FROM wallet WHERE id = 1")) {
            rs.next();
            return rs.getInt(1);
        }
    }
    static void update(Connection c, String sql) throws SQLException {
        try (Statement st = c.createStatement()) { st.executeUpdate(sql); }
    }
    public static void main(String[] args) throws SQLException {
        try (Connection setup = DriverManager.getConnection(URL, "sa", "")) {
            update(setup, "CREATE TABLE wallet (id INT PRIMARY KEY, paise INT)");
            update(setup, "INSERT INTO wallet VALUES (1, 10000)");
        }
        String[] names = {"READ_UNCOMMITTED", "READ_COMMITTED", "REPEATABLE_READ",
                          "SERIALIZABLE"};
        int[] levels = {Connection.TRANSACTION_READ_UNCOMMITTED,
                        Connection.TRANSACTION_READ_COMMITTED,
                        Connection.TRANSACTION_REPEATABLE_READ,
                        Connection.TRANSACTION_SERIALIZABLE};
        System.out.println("level              before  writer-uncommitted  writer-committed");
        for (int i = 0; i < levels.length; i++) {
            try (Connection reader = DriverManager.getConnection(URL, "sa", "");
                 Connection writer = DriverManager.getConnection(URL, "sa", "")) {
                reader.setTransactionIsolation(levels[i]);
                reader.setAutoCommit(false);
                writer.setAutoCommit(false);
                int before = read(reader);
                update(writer, "UPDATE wallet SET paise = paise - 3000 WHERE id = 1");
                int duringWrite = read(reader);
                writer.commit();
                int afterCommit = read(reader);
                reader.commit();
                System.out.printf("%-18s %6d  %18d  %16d%n", names[i], before, duringWrite,
                        afterCommit);
                update(writer, "UPDATE wallet SET paise = 10000 WHERE id = 1");
                writer.commit();
            }
        }
    }
}
```

| Level | Dirty read (sees uncommitted data) | Non-repeatable read (value changes within one transaction) | Phantoms (new rows appear in a repeated range query) |
|---|---|---|---|
| READ UNCOMMITTED | Possible: **seen above** (7 000 before the commit) | Possible | Possible |
| READ COMMITTED | No | Possible: **seen above** (10 000, then 7 000) | Possible |
| REPEATABLE READ | No | No: the reader keeps its snapshot | Possible in the SQL standard; MySQL InnoDB and H2 prevent most |
| SERIALIZABLE | No | No | No |

Defaults differ by database: **MySQL InnoDB uses REPEATABLE READ**, PostgreSQL, Oracle, SQL Server and H2 use READ COMMITTED. Changing the database can therefore change what your code sees, without any code change.

## 3.4 Lost updates and how to prevent them

Two requests read the same balance, compute a new value in Java and write it back. The second write overwrites the first. Isolation levels alone do not prevent this at READ COMMITTED; three fixes do.

```java jdbc A lost update, then three ways to prevent it
package demo;

import java.sql.*;

public class Main {
    static final String URL = "jdbc:h2:mem:lu;MODE=MySQL;DB_CLOSE_DELAY=-1;LOCK_TIMEOUT=300";

    static int read(Connection c, String sql) throws SQLException {
        try (Statement st = c.createStatement(); ResultSet rs = st.executeQuery(sql)) {
            rs.next();
            return rs.getInt(1);
        }
    }
    static int exec(Connection c, String sql) throws SQLException {
        try (Statement st = c.createStatement()) { return st.executeUpdate(sql); }
    }
    static void reset(Connection c) throws SQLException {
        exec(c, "UPDATE wallet SET paise = 10000, version = 0 WHERE id = 1");
    }
    public static void main(String[] args) throws SQLException {
        String bal = "SELECT paise FROM wallet WHERE id = 1";
        try (Connection a = DriverManager.getConnection(URL, "sa", "");
             Connection b = DriverManager.getConnection(URL, "sa", "")) {
            exec(a, "CREATE TABLE wallet (id INT PRIMARY KEY, paise INT, version INT)");
            exec(a, "INSERT INTO wallet VALUES (1, 10000, 0)");
            a.setAutoCommit(false); b.setAutoCommit(false);

            int va = read(a, bal), vb = read(b, bal);            // both read 10000
            exec(a, "UPDATE wallet SET paise = " + (va - 3000) + " WHERE id = 1"); a.commit();
            exec(b, "UPDATE wallet SET paise = " + (vb - 4000) + " WHERE id = 1"); b.commit();
            System.out.println("read-modify-write:     final " + read(a, bal)
                    + " (expected 3000)"); a.commit();

            reset(a); a.commit();
            exec(a, "UPDATE wallet SET paise = paise - 3000 WHERE id = 1"); a.commit();
            exec(b, "UPDATE wallet SET paise = paise - 4000 WHERE id = 1"); b.commit();
            System.out.println("1. atomic UPDATE:      final " + read(a, bal)); a.commit();

            reset(a); a.commit();
            int v = read(a, "SELECT version FROM wallet WHERE id = 1");
            int w = read(b, "SELECT version FROM wallet WHERE id = 1");
            int ra = exec(a, "UPDATE wallet SET paise = paise - 3000, version = version + 1 "
                    + "WHERE id = 1 AND version = " + v); a.commit();
            int rb = exec(b, "UPDATE wallet SET paise = paise - 4000, version = version + 1 "
                    + "WHERE id = 1 AND version = " + w); b.commit();
            System.out.println("2. optimistic version: A updated " + ra + " row, B updated "
                    + rb + " rows -> B must re-read and retry");

            reset(a); a.commit();
            read(a, bal + " FOR UPDATE");                          // A locks the row
            try {
                read(b, bal + " FOR UPDATE");
            } catch (SQLException e) {
                System.out.println("3. SELECT FOR UPDATE:  B waited, then timed out "
                        + "(SQLState " + e.getSQLState() + ") while A held the lock");
                b.rollback();
            }
            a.commit();
        }
    }
}
```

| Fix | How | When |
|---|---|---|
| Atomic update | `SET paise = paise - ?` (the database computes from the current committed value) | Counters, balances, stock: the best choice when the new value is a simple function of the old |
| Optimistic locking | A `version` column; `UPDATE ... WHERE id = ? AND version = ?`; 0 rows updated means a conflict: re-read and retry | Edits of whole records in web apps (JPA's `@Version` does exactly this) |
| Pessimistic locking | `SELECT ... FOR UPDATE` locks the row until commit; others wait | Frequent conflicts; multi-step logic that must see a stable value |

> NOTE: The pessimistic example uses a 300 ms lock timeout so that the demonstration ends quickly. In production, B would normally wait until A commits and then proceed; the timeout protects against waiting forever. Lock rows in a consistent order (for example by id) to avoid deadlocks.

## 3.5 Practical lessons

- Turn off auto-commit for multi-statement units of work; commit at the end, roll back on any failure, reset auto-commit in `finally`.
- Put conditions inside the `UPDATE` (`AND paise >= ?`) to make check-and-change atomic.
- Know your database's default isolation level: MySQL is REPEATABLE READ, most others READ COMMITTED.
- Prevent lost updates with atomic updates, version columns, or `SELECT ... FOR UPDATE`.

# Chapter 4: Batching, Round Trips and Fetching
%Counting what goes over the wire, batch inserts, N+1 at the JDBC level, and streaming large results

## 4.1 Round trips dominate

Over a network, each statement execution costs a **round trip**: typically 0.2–1 ms inside a data centre, far more than the database needs to insert one row. Inserting 10 000 rows one statement at a time spends most of its time waiting for the network. To make the effect measurable without timing (which varies between machines), the program wraps the connection in a **counting proxy**: a `java.lang.reflect.Proxy` that counts every call that sends something to the database. (Test libraries such as datasource-proxy do the same thing for real projects.)

```java jdbc Counting round trips: one by one versus batched
package demo;

import java.lang.reflect.*;
import java.sql.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    static final AtomicInteger TRIPS = new AtomicInteger();

    @SuppressWarnings("unchecked")
    static <T> T counting(T target, Class<T> type) {       // wrap and count executions
        return (T) Proxy.newProxyInstance(type.getClassLoader(), new Class<?>[]{type},
                (proxy, m, args) -> {
                    String n = m.getName();
                    if (n.startsWith("execute")) TRIPS.incrementAndGet();
                    Object result = m.invoke(target, args);
                    if (n.equals("prepareStatement"))
                        return counting((PreparedStatement) result, PreparedStatement.class);
                    return result;
                });
    }
    public static void main(String[] args) throws Exception {
        String url = "jdbc:h2:mem:batch;MODE=MySQL;DB_CLOSE_DELAY=-1";
        try (Connection raw = DriverManager.getConnection(url, "sa", "")) {
            Connection con = counting(raw, Connection.class);
            try (Statement st = raw.createStatement()) {
                st.execute("CREATE TABLE reading (meter INT, slot INT, kwh DOUBLE)");
            }
            con.setAutoCommit(false);
            int n = 10_000;
            String sql = "INSERT INTO reading VALUES (?, ?, ?)";

            TRIPS.set(0);
            try (PreparedStatement ps = con.prepareStatement(sql)) {
                for (int i = 0; i < n; i++) {
                    ps.setInt(1, i % 100); ps.setInt(2, i / 100); ps.setDouble(3, 0.25);
                    ps.executeUpdate();
                }
            }
            System.out.printf("one by one:      %,6d rows, %,6d executions%n", n,
                    TRIPS.get());

            TRIPS.set(0);
            try (PreparedStatement ps = con.prepareStatement(sql)) {
                for (int i = 0; i < n; i++) {
                    ps.setInt(1, i % 100); ps.setInt(2, i / 100); ps.setDouble(3, 0.25);
                    ps.addBatch();
                    if ((i + 1) % 1000 == 0) ps.executeBatch();       // send every 1 000 rows
                }
            }
            System.out.printf("batched (1 000): %,6d rows, %,6d executions%n", n,
                    TRIPS.get());
            con.commit();

            try (Statement st = raw.createStatement();
                 ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM reading")) {
                rs.next();
                System.out.println("rows in the table: " + rs.getInt(1));
            }
        }
    }
}
```

The batched version sends the same 10 000 rows in 10 executions. On a real network that is the difference between seconds and milliseconds. Three details matter:

| Detail | Why |
|---|---|
| Batch size of 500–5 000 | Very large batches use a lot of memory on both sides; very small ones lose the benefit |
| Auto-commit off, commit after the batches | With auto-commit on, each batch (or each row, depending on the driver) is its own transaction |
| MySQL: `rewriteBatchedStatements=true` in the URL | Without it, Connector/J sends a batch as separate statements; with it, it rewrites the batch into multi-row `INSERT ... VALUES (...), (...)`, often 10× faster |

`executeBatch()` returns an `int[]` with one update count per statement; a failure throws `BatchUpdateException`, whose `getUpdateCounts()` shows which statements succeeded before the failure.

## 4.2 N+1 queries at the JDBC level

The N+1 problem of the Spring Boot guide (Chapter 4.4) is not specific to JPA. Any code that runs a query inside a loop over the results of another query has it. The fix is a join, or one `IN (...)` query for all the parents.

```java jdbc Meters with their latest reading: N+1 queries versus one join
package demo;

import java.lang.reflect.*;
import java.sql.*;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    static final AtomicInteger QUERIES = new AtomicInteger();

    @SuppressWarnings("unchecked")
    static <T> T counting(T target, Class<T> type) {
        return (T) Proxy.newProxyInstance(type.getClassLoader(), new Class<?>[]{type},
                (proxy, m, args) -> {
                    if (m.getName().startsWith("execute")) QUERIES.incrementAndGet();
                    Object r = m.invoke(target, args);
                    return m.getName().equals("prepareStatement")
                            ? counting((PreparedStatement) r, PreparedStatement.class) : r;
                });
    }
    public static void main(String[] args) throws Exception {
        String url = "jdbc:h2:mem:np1;MODE=MySQL;DB_CLOSE_DELAY=-1";
        try (Connection raw = DriverManager.getConnection(url, "sa", "");
             Statement st = raw.createStatement()) {
            st.execute("CREATE TABLE meter (id INT PRIMARY KEY, serial VARCHAR(10))");
            st.execute("CREATE TABLE reading (meter_id INT, slot INT, kwh DOUBLE)");
            for (int m = 1; m <= 20; m++) {
                st.execute("INSERT INTO meter VALUES (" + m + ", 'SM-" + m + "')");
                for (int s = 1; s <= 3; s++)
                    st.execute("INSERT INTO reading VALUES (" + m + ", " + s + ", "
                            + (m + s) + ")");
            }
            Connection con = counting(raw, Connection.class);

            QUERIES.set(0);
            Map<String, Double> latest = new TreeMap<>();
            String latestSql = "SELECT kwh FROM reading WHERE meter_id = ? "
                    + "ORDER BY slot DESC LIMIT 1";
            try (PreparedStatement meters = con.prepareStatement(
                         "SELECT id, serial FROM meter");
                 PreparedStatement one = con.prepareStatement(latestSql);
                 ResultSet rs = meters.executeQuery()) {
                while (rs.next()) {
                    one.setInt(1, rs.getInt(1));
                    try (ResultSet r = one.executeQuery()) {
                        if (r.next()) latest.put(rs.getString(2), r.getDouble(1));
                    }
                }
            }
            System.out.println("loop:  " + latest.size() + " meters, " + QUERIES.get()
                    + " queries");

            QUERIES.set(0);
            Map<String, Double> joined = new TreeMap<>();
            String sql = "SELECT m.serial, r.kwh FROM meter m "
                    + "JOIN reading r ON r.meter_id = m.id WHERE r.slot = "
                    + "(SELECT MAX(slot) FROM reading x WHERE x.meter_id = m.id)";
            try (PreparedStatement ps = con.prepareStatement(sql);
                 ResultSet rs = ps.executeQuery()) {
                while (rs.next()) joined.put(rs.getString(1), rs.getDouble(2));
            }
            System.out.println("join:  " + joined.size() + " meters, " + QUERIES.get()
                    + " query, same results? " + joined.equals(latest));
        }
    }
}
```

## 4.3 Fetching large results

| Problem | Fix |
|---|---|
| Exporting millions of rows loads them all into memory (MySQL default) | Stream: `setFetchSize(Integer.MIN_VALUE)` with a forward-only, read-only statement (MySQL), or `useCursorFetch=true&defaultFetchSize=1000`; PostgreSQL streams with a fetch size **inside** a transaction |
| `OFFSET` pagination gets slower with every page | Keyset pagination: `WHERE id > :lastId ORDER BY id LIMIT 1000` uses the index and costs the same for every page |
| Many small queries for lookups | Load the lookup table once into a `Map`, or use `IN (?, ?, ...)` with a bounded list |

## 4.4 Practical lessons

- Count statements, not milliseconds, when comparing data-access strategies; round trips dominate.
- Batch inserts and updates (500–5 000 per batch), with auto-commit off; on MySQL add `rewriteBatchedStatements=true`.
- A query inside a loop over query results is N+1; replace it with a join or an `IN` list.
- Stream huge results and use keyset pagination.
