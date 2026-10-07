# Solutions

## Part 1 solutions

### J1.1 Interfaces and implementations

`Connection`, `PreparedStatement`, `ResultSet` and `DataSource` are **interfaces**; `DriverManager` is a **class** with static methods, and `SQLException` is an exception **class**. The implementations of the interfaces come from the JDBC driver JAR (for example `org.h2.jdbc.JdbcConnection`, `com.mysql.cj.jdbc.ConnectionImpl`) or, for `DataSource`, from a pool library such as HikariCP. Your code never names those classes, which is what lets you switch databases.

### J1.2 List the tables

```java jdbc Tables and columns from DatabaseMetaData
package demo;

import java.sql.*;

public class Main {
    public static void main(String[] args) throws SQLException {
        String url = "jdbc:h2:mem:md;MODE=MySQL;DB_CLOSE_DELAY=-1";
        try (Connection con = DriverManager.getConnection(url, "sa", "");
             Statement st = con.createStatement()) {
            st.execute("CREATE TABLE meter (id INT PRIMARY KEY, serial VARCHAR(20))");
            st.execute("CREATE TABLE reading (meter_id INT, kwh DECIMAL(8,3), "
                    + "ts TIMESTAMP)");
            DatabaseMetaData md = con.getMetaData();
            try (ResultSet t = md.getTables(null, "PUBLIC", "%", new String[]{"TABLE"})) {
                while (t.next()) System.out.println("table " + t.getString("TABLE_NAME"));
            }
            try (ResultSet c = md.getColumns(null, "PUBLIC", "READING", "%")) {
                while (c.next())
                    System.out.println("  READING." + c.getString("COLUMN_NAME") + " "
                            + c.getString("TYPE_NAME"));
            }
        }
    }
}
```

Unquoted identifiers are stored in upper case by H2 (and by the SQL standard), so the metadata lookup uses `READING`. MySQL stores table names as written, and on Linux they are case-sensitive.

### J1.3 Closing in the wrong place

Closing a `Connection` closes every `Statement` created from it, and closing a `Statement` closes its `ResultSet`. The loop then calls `next()` on a closed result set and gets `SQLException` ("object is already closed"). Keep the result set's use **inside** the resources' scope:

```java jdbc Reading results before the resources close
package demo;

import java.sql.*;
import java.util.*;

public class Main {
    static final String URL = "jdbc:h2:mem:cl;MODE=MySQL;DB_CLOSE_DELAY=-1";

    static ResultSet broken() throws SQLException {
        try (Connection c = DriverManager.getConnection(URL, "sa", "")) {
            return c.createStatement().executeQuery("SELECT serial FROM meter");
        }                                                 // connection closed here
    }
    static List<String> fixed() throws SQLException {
        try (Connection c = DriverManager.getConnection(URL, "sa", "");
             Statement st = c.createStatement();
             ResultSet rs = st.executeQuery("SELECT serial FROM meter ORDER BY serial")) {
            List<String> out = new ArrayList<>();
            while (rs.next()) out.add(rs.getString(1));  // copy out before closing
            return out;
        }
    }
    public static void main(String[] args) throws SQLException {
        try (Connection c = DriverManager.getConnection(URL, "sa", "");
             Statement st = c.createStatement()) {
            st.execute("CREATE TABLE meter (serial VARCHAR(20))");
            st.execute("INSERT INTO meter VALUES ('SM-2'), ('SM-1')");
        }
        try {
            broken().next();
        } catch (SQLException e) {
            System.out.println("broken: SQLException, state " + e.getSQLState());
        }
        System.out.println("fixed:  " + fixed());
    }
}
```

The rule: a method should return **data** (a list of records), not JDBC resources.

### J1.4 Reading SQLState

| SQLState | Class | Meaning | Reaction |
|---|---|---|---|
| `23505` | 23 integrity constraint | Unique key violated | Business error: 409 Conflict, "already exists" |
| `42S02` | 42 syntax or access rule | Table not found | Bug or missing migration: fail loudly, alert |
| `08S01` | 08 connection exception | Communication link failure | Transient: retry with back-off, the pool replaces the connection |
| `40001` | 40 transaction rollback | Serialization failure or deadlock victim | Retry the whole transaction |
| `HYT00` | HY driver-specific | Timeout (lock or query) | Retry later or report "busy"; investigate long transactions |

## Part 2 solutions

### J2.1 Search without injection

```java jdbc A bound value and an allow-listed column
package demo;

import java.sql.*;
import java.util.*;

public class Main {
    static final Map<String, String> SORTABLE = Map.of("serial", "serial", "city", "city");

    static List<String> search(Connection c, String city, String sort, boolean desc)
            throws SQLException {
        String column = SORTABLE.get(sort);
        if (column == null) throw new IllegalArgumentException("cannot sort by " + sort);
        String sql = "SELECT serial FROM meter WHERE city = ? ORDER BY " + column
                + (desc ? " DESC" : " ASC");          // identifiers from the allow-list only
        try (PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, city);
            try (ResultSet rs = ps.executeQuery()) {
                List<String> out = new ArrayList<>();
                while (rs.next()) out.add(rs.getString(1));
                return out;
            }
        }
    }
    public static void main(String[] args) throws SQLException {
        String url = "jdbc:h2:mem:srch;MODE=MySQL;DB_CLOSE_DELAY=-1";
        try (Connection c = DriverManager.getConnection(url, "sa", "");
             Statement st = c.createStatement()) {
            st.execute("CREATE TABLE meter (serial VARCHAR(20), city VARCHAR(40))");
            st.execute("INSERT INTO meter VALUES ('SM-1', 'Kolkata'), ('SM-3', 'Kolkata'), "
                    + "('SM-2', 'Howrah')");
            var byDesc = search(c, "Kolkata", "serial", true);
            System.out.println("Kolkata by serial desc: " + byDesc);
            System.out.println("injection attempt:      "
                    + search(c, "Kolkata' OR '1'='1", "serial", false));
            try {
                search(c, "Kolkata", "serial; DROP TABLE meter", false);
            } catch (IllegalArgumentException e) {
                System.out.println("bad sort column:        " + e.getMessage());
            }
        }
    }
}
```

### J2.2 LIKE with user input

```java jdbc Escaping LIKE wildcards in a user prefix
package demo;

import java.sql.*;
import java.util.*;

public class Main {
    static String escapeLike(String s) {
        return s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
    static List<String> startsWith(Connection c, String prefix, boolean escape)
            throws SQLException {
        String sql = "SELECT serial FROM meter WHERE serial LIKE ? ESCAPE '\\' "
                + "ORDER BY serial";
        try (PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, (escape ? escapeLike(prefix) : prefix) + "%");
            try (ResultSet rs = ps.executeQuery()) {
                List<String> out = new ArrayList<>();
                while (rs.next()) out.add(rs.getString(1));
                return out;
            }
        }
    }
    public static void main(String[] args) throws SQLException {
        String url = "jdbc:h2:mem:like;MODE=MySQL;DB_CLOSE_DELAY=-1";
        try (Connection c = DriverManager.getConnection(url, "sa", "");
             Statement st = c.createStatement()) {
            st.execute("CREATE TABLE meter (serial VARCHAR(20))");
            st.execute("INSERT INTO meter VALUES ('SM_01'), ('SMX01'), ('SM-02'), ('AB_99')");
            System.out.println("unescaped 'SM_': " + startsWith(c, "SM_", false));
            System.out.println("escaped   'SM_': " + startsWith(c, "SM_", true));
        }
    }
}
```

`_` matches any single character in `LIKE`, so the unescaped prefix also finds `SMX01` and `SM-02`. A parameter prevents injection but not wildcard surprises: escape `%`, `_` and the escape character itself.

### J2.3 NULL in and out

```java jdbc Three ways to read a NULL double
package demo;

import java.sql.*;

public class Main {
    public static void main(String[] args) throws SQLException {
        String url = "jdbc:h2:mem:nul;MODE=MySQL;DB_CLOSE_DELAY=-1";
        try (Connection c = DriverManager.getConnection(url, "sa", "");
             Statement st = c.createStatement()) {
            st.execute("CREATE TABLE reading (serial VARCHAR(10), voltage DOUBLE)");
            String insert = "INSERT INTO reading VALUES (?, ?)";
            try (PreparedStatement ps = c.prepareStatement(insert)) {
                ps.setString(1, "SM-1");
                ps.setNull(2, Types.DOUBLE);
                ps.executeUpdate();
            }
            try (ResultSet rs = st.executeQuery("SELECT voltage FROM reading")) {
                rs.next();
                double v = rs.getDouble(1);
                System.out.println("getDouble:            " + v);
                System.out.println("getDouble + wasNull:  " + (rs.wasNull() ? "NULL" : v));
                System.out.println("getObject(Double):    " + rs.getObject(1, Double.class));
            }
        }
    }
}
```

A missing voltage reported as 0.0 V would look like a dead line; in a monitoring system that is a false alarm or, worse, a hidden fault.

### J2.4 IN list with parameters

```java jdbc A placeholder per element
package demo;

import java.sql.*;
import java.util.*;

public class Main {
    static List<String> find(Connection c, List<String> serials) throws SQLException {
        if (serials.isEmpty()) return List.of();             // "IN ()" is invalid SQL
        String marks = String.join(", ", Collections.nCopies(serials.size(), "?"));
        String sql = "SELECT serial, city FROM meter WHERE serial IN (" + marks
                + ") ORDER BY serial";
        try (PreparedStatement ps = c.prepareStatement(sql)) {
            for (int i = 0; i < serials.size(); i++) ps.setString(i + 1, serials.get(i));
            try (ResultSet rs = ps.executeQuery()) {
                List<String> out = new ArrayList<>();
                while (rs.next()) out.add(rs.getString(1) + "@" + rs.getString(2));
                return out;
            }
        }
    }
    public static void main(String[] args) throws SQLException {
        String url = "jdbc:h2:mem:in;MODE=MySQL;DB_CLOSE_DELAY=-1";
        try (Connection c = DriverManager.getConnection(url, "sa", "");
             Statement st = c.createStatement()) {
            st.execute("CREATE TABLE meter (serial VARCHAR(20), city VARCHAR(40))");
            st.execute("INSERT INTO meter VALUES ('SM-1', 'Kolkata'), ('SM-2', 'Howrah'), "
                    + "('SM-3', 'Asansol')");
            System.out.println(find(c, List.of("SM-3", "SM-1", "SM-9")));
            System.out.println(find(c, List.of()));
        }
    }
}
```

Only `?` marks are generated; the values are still bound. Very long lists (thousands) should be chunked, or loaded into a temporary table and joined.

### J2.5 Money and time

```java jdbc BigDecimal and Instant round trip
package demo;

import java.math.BigDecimal;
import java.sql.*;
import java.time.*;

public class Main {
    public static void main(String[] args) throws SQLException {
        String url = "jdbc:h2:mem:money;MODE=MySQL;DB_CLOSE_DELAY=-1";
        try (Connection c = DriverManager.getConnection(url, "sa", "");
             Statement st = c.createStatement()) {
            st.execute("CREATE TABLE bill (id INT, amount DECIMAL(12,2), "
                    + "issued TIMESTAMP WITH TIME ZONE)");
            BigDecimal amount = new BigDecimal("1234.50");
            Instant issued = Instant.parse("2026-10-01T04:30:00Z");
            String insert = "INSERT INTO bill VALUES (1, ?, ?)";
            try (PreparedStatement ps = c.prepareStatement(insert)) {
                ps.setBigDecimal(1, amount);
                ps.setObject(2, issued.atOffset(ZoneOffset.UTC));
                ps.executeUpdate();
            }
            try (ResultSet rs = st.executeQuery("SELECT amount, issued FROM bill")) {
                rs.next();
                BigDecimal a = rs.getBigDecimal(1);
                Instant i = rs.getObject(2, OffsetDateTime.class).toInstant();
                System.out.println("amount " + a + " (scale " + a.scale() + "), equal? "
                        + (a.compareTo(amount) == 0));
                var ist = i.atZone(ZoneId.of("Asia/Kolkata")).toLocalDateTime();
                System.out.println("issued " + i + ", equal? " + i.equals(issued)
                        + ", in IST " + ist);
            }
        }
    }
}
```

`DECIMAL(12,2)` keeps the trailing zero (scale 2), and a `double` would not represent 1234.50 exactly in general. Storing instants with an offset (or always in UTC) avoids the classic bug where the server's time zone silently shifts timestamps; MySQL's `TIMESTAMP` converts to and from the session time zone, `DATETIME` does not.

## Part 3 solutions

### J3.1 Auto-commit traps

(a) Most drivers throw `SQLException` ("cannot rollback when auto-commit is enabled"); nothing is rolled back because each statement already committed. (b) The first update is committed permanently; the exception does not undo it, which is exactly why multi-statement work needs a transaction. (c) The next borrower inherits an open transaction: its work may be committed together with the stale changes, or the stale changes may be lost when it rolls back. HikariCP rolls back uncommitted work and resets auto-commit when a connection is returned, but relying on that hides bugs.

### J3.2 Order with items atomically

```java jdbc Order and items: all or nothing
package demo;

import java.sql.*;

public class Main {
    static int count(Connection c, String table) throws SQLException {
        try (Statement st = c.createStatement();
             ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM " + table)) {
            rs.next();
            return rs.getInt(1);
        }
    }
    public static void main(String[] args) throws SQLException {
        String url = "jdbc:h2:mem:ord;MODE=MySQL;DB_CLOSE_DELAY=-1";
        try (Connection c = DriverManager.getConnection(url, "sa", "")) {
            try (Statement st = c.createStatement()) {
                st.execute("CREATE TABLE orders (id INT PRIMARY KEY, customer VARCHAR(20))");
                st.execute("CREATE TABLE item (order_id INT, sku VARCHAR(10), "
                        + "qty INT CHECK (qty > 0))");
            }
            int[] qtys = {2, 1, 0};                             // the third item is invalid
            c.setAutoCommit(false);
            try (PreparedStatement o = c.prepareStatement(
                         "INSERT INTO orders VALUES (1, 'asha')");
                 PreparedStatement i = c.prepareStatement(
                         "INSERT INTO item VALUES (1, ?, ?)")) {
                o.executeUpdate();
                for (int k = 0; k < qtys.length; k++) {
                    i.setString(1, "SKU-" + k); i.setInt(2, qtys[k]);
                    i.executeUpdate();
                }
                c.commit();
            } catch (SQLException e) {
                c.rollback();
                System.out.println("rolled back: SQLState " + e.getSQLState());
            } finally { c.setAutoCommit(true); }
            System.out.println("orders " + count(c, "orders") + ", items "
                    + count(c, "item"));
        }
    }
}
```

### J3.3 Savepoint per row

```java jdbc Keep the valid rows of an import
package demo;

import java.sql.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws SQLException {
        String url = "jdbc:h2:mem:imp;MODE=MySQL;DB_CLOSE_DELAY=-1";
        try (Connection c = DriverManager.getConnection(url, "sa", "")) {
            try (Statement st = c.createStatement()) {
                st.execute("CREATE TABLE meter (serial VARCHAR(20) UNIQUE, "
                        + "city VARCHAR(40))");
                st.execute("INSERT INTO meter VALUES ('SM-1', 'Kolkata')");
            }
            String[][] rows = {{"SM-2", "Howrah"}, {"SM-1", "Asansol"},
                               {"SM-3", "Siliguri"}, {"SM-3", "Durgapur"},
                               {"SM-4", "Haldia"}};
            List<String> skipped = new ArrayList<>();
            c.setAutoCommit(false);
            String insert = "INSERT INTO meter VALUES (?, ?)";
            try (PreparedStatement ps = c.prepareStatement(insert)) {
                for (String[] r : rows) {
                    Savepoint sp = c.setSavepoint();
                    try {
                        ps.setString(1, r[0]); ps.setString(2, r[1]);
                        ps.executeUpdate();
                    } catch (SQLException e) {
                        c.rollback(sp);
                        skipped.add(r[0] + "/" + r[1]);
                    }
                }
            }
            c.commit();
            c.setAutoCommit(true);
            try (Statement st = c.createStatement();
                 ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM meter")) {
                rs.next();
                System.out.println("rows now " + rs.getInt(1) + ", skipped " + skipped);
            }
        }
    }
}
```

Two rows clash with the unique serial (one with an existing row, one with a row earlier in the same import); the other three join the table, which ends with four rows.

### J3.4 Phantom or not

```java jdbc A range count across a concurrent insert
package demo;

import java.sql.*;

public class Main {
    static final String URL = "jdbc:h2:mem:ph;MODE=MySQL;DB_CLOSE_DELAY=-1";

    static int count(Connection c) throws SQLException {
        try (Statement st = c.createStatement();
             ResultSet rs = st.executeQuery(
                     "SELECT COUNT(*) FROM reading WHERE serial = 'SM-1'")) {
            rs.next();
            return rs.getInt(1);
        }
    }
    public static void main(String[] args) throws SQLException {
        try (Connection s = DriverManager.getConnection(URL, "sa", "");
             Statement st = s.createStatement()) {
            st.execute("CREATE TABLE reading (serial VARCHAR(10), kwh INT)");
            st.execute("INSERT INTO reading VALUES ('SM-1', 1), ('SM-1', 2)");
        }
        int[] levels = {Connection.TRANSACTION_READ_COMMITTED,
                        Connection.TRANSACTION_REPEATABLE_READ};
        String[] names = {"READ_COMMITTED", "REPEATABLE_READ"};
        for (int i = 0; i < 2; i++) {
            try (Connection r = DriverManager.getConnection(URL, "sa", "");
                 Connection w = DriverManager.getConnection(URL, "sa", "")) {
                r.setTransactionIsolation(levels[i]);
                r.setAutoCommit(false);
                int first = count(r);
                try (Statement st = w.createStatement()) {      // auto-commit insert
                    st.execute("INSERT INTO reading VALUES ('SM-1', 9)");
                }
                int second = count(r);
                r.commit();
                System.out.printf("%-16s first count %d, second count %d%n", names[i], first,
                        second);
            }
        }
    }
}
```

At READ COMMITTED the second count includes the row committed in between: a **phantom** (2, then 3). At REPEATABLE READ the reader keeps the snapshot taken at its first read, so both counts agree (3 and 3; the table already held three rows because the first run's insert had committed). The SQL standard allows phantoms at REPEATABLE READ; snapshot-based engines such as H2 and MySQL InnoDB (for plain `SELECT`) do not show them, while `SELECT ... FOR UPDATE` in InnoDB reads the latest data and uses gap locks instead.

### J3.5 Stock without overselling

```java jdbc A conditional UPDATE decides who gets the stock
package demo;

import java.sql.*;

public class Main {
    static final String URL = "jdbc:h2:mem:stock;MODE=MySQL;DB_CLOSE_DELAY=-1";

    static boolean buy(Connection c, String buyer, int qty) throws SQLException {
        String sql = "UPDATE product SET stock = stock - ? WHERE id = 1 AND stock >= ?";
        try (PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, qty); ps.setInt(2, qty);
            boolean ok = ps.executeUpdate() == 1;
            System.out.println(buyer + " wants " + qty + ": " + (ok ? "bought" : "sold out"));
            return ok;
        }
    }
    public static void main(String[] args) throws SQLException {
        try (Connection a = DriverManager.getConnection(URL, "sa", "");
             Connection b = DriverManager.getConnection(URL, "sa", "");
             Statement st = a.createStatement()) {
            st.execute("CREATE TABLE product (id INT PRIMARY KEY, stock INT)");
            st.execute("INSERT INTO product VALUES (1, 3)");
            buy(a, "buyer A", 2);
            buy(b, "buyer B", 2);
            try (ResultSet rs = st.executeQuery("SELECT stock FROM product")) {
                rs.next();
                System.out.println("final stock " + rs.getInt(1));
            }
        }
    }
}
```

The check (`stock >= ?`) and the change happen in one statement, which the database executes atomically with a row lock, so even truly simultaneous buyers cannot both succeed. A "read the stock, then update" version has the lost-update race of the guide's Chapter 3.4.

## Part 4 solutions

### J4.1 Batch with a bad row

```java jdbc BatchUpdateException and update counts
package demo;

import java.sql.*;
import java.util.Arrays;

public class Main {
    public static void main(String[] args) throws SQLException {
        String url = "jdbc:h2:mem:bb;MODE=MySQL;DB_CLOSE_DELAY=-1";
        try (Connection c = DriverManager.getConnection(url, "sa", "")) {
            try (Statement st = c.createStatement()) {
                st.execute("CREATE TABLE meter (id INT PRIMARY KEY)");
                st.execute("INSERT INTO meter VALUES (7)");          // row 7 already exists
            }
            c.setAutoCommit(false);
            try (PreparedStatement ps = c.prepareStatement("INSERT INTO meter VALUES (?)")) {
                for (int id = 1; id <= 10; id++) { ps.setInt(1, id); ps.addBatch(); }
                ps.executeBatch();
                c.commit();
            } catch (BatchUpdateException e) {
                System.out.println("update counts " + Arrays.toString(e.getUpdateCounts())
                        + " (" + Statement.EXECUTE_FAILED + " = EXECUTE_FAILED)");
                c.rollback();
            }
            c.setAutoCommit(true);
            try (Statement st = c.createStatement();
                 ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM meter")) {
                rs.next();
                System.out.println("rows after rollback " + rs.getInt(1));
            }
        }
    }
}
```

H2 executed every statement in the batch and marked only the duplicate (id 7) with `EXECUTE_FAILED` (−3). Drivers differ here: some stop at the first failure and return a shorter array, so code must handle both. Because auto-commit was off, the rollback removed the nine successful inserts too, leaving only the original row. To keep the good rows instead, commit after the batch while skipping failures (reading the counts), or use savepoints per chunk.

### J4.2 Count before you optimise

```java jdbc Fifty single updates versus one set-based update
package demo;

import java.lang.reflect.*;
import java.sql.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    static final AtomicInteger EXEC = new AtomicInteger();

    @SuppressWarnings("unchecked")
    static <T> T counting(T t, Class<T> type) {
        return (T) Proxy.newProxyInstance(type.getClassLoader(), new Class<?>[]{type},
                (p, m, a) -> {
                    if (m.getName().startsWith("execute")) EXEC.incrementAndGet();
                    Object r = m.invoke(t, a);
                    return m.getName().equals("prepareStatement")
                            ? counting((PreparedStatement) r, PreparedStatement.class) : r;
                });
    }
    public static void main(String[] args) throws Exception {
        String url = "jdbc:h2:mem:cnt;MODE=MySQL;DB_CLOSE_DELAY=-1";
        try (Connection raw = DriverManager.getConnection(url, "sa", "");
             Statement st = raw.createStatement()) {
            st.execute("CREATE TABLE meter (id INT, city VARCHAR(20), tariff INT)");
            for (int i = 1; i <= 60; i++)
                st.execute("INSERT INTO meter VALUES (" + i + ", '"
                        + (i <= 50 ? "Howrah" : "Kolkata") + "', 700)");
            Connection c = counting(raw, Connection.class);
            EXEC.set(0);
            try (PreparedStatement sel = c.prepareStatement(
                         "SELECT id FROM meter WHERE city = ?");
                 PreparedStatement upd = c.prepareStatement(
                         "UPDATE meter SET tariff = ? WHERE id = ?")) {
                sel.setString(1, "Howrah");
                try (ResultSet rs = sel.executeQuery()) {
                    while (rs.next()) {
                        upd.setInt(1, 750); upd.setInt(2, rs.getInt(1));
                        upd.executeUpdate();
                    }
                }
            }
            System.out.println("row by row: " + EXEC.get() + " statements");
            EXEC.set(0);
            int n;
            try (PreparedStatement ps = c.prepareStatement(
                    "UPDATE meter SET tariff = ? WHERE city = ?")) {
                ps.setInt(1, 800); ps.setString(2, "Howrah");
                n = ps.executeUpdate();
            }
            System.out.println("set-based:  " + EXEC.get() + " statement, " + n
                    + " rows updated");
        }
    }
}
```

### J4.3 Keyset pagination

```java jdbc Pages of five by the last seen id
package demo;

import java.sql.*;

public class Main {
    public static void main(String[] args) throws SQLException {
        String url = "jdbc:h2:mem:ks;MODE=MySQL;DB_CLOSE_DELAY=-1";
        try (Connection c = DriverManager.getConnection(url, "sa", "");
             Statement st = c.createStatement()) {
            st.execute("CREATE TABLE reading (id INT PRIMARY KEY, kwh INT)");
            for (int i = 1; i <= 23; i++)
                st.execute("INSERT INTO reading VALUES (" + i * 3 + ", " + i + ")");
            String sql = "SELECT id FROM reading WHERE id > ? ORDER BY id LIMIT 5";
            int last = 0, page = 0;
            try (PreparedStatement ps = c.prepareStatement(sql)) {
                while (true) {
                    ps.setInt(1, last);
                    int first = -1, n = 0;
                    try (ResultSet rs = ps.executeQuery()) {
                        while (rs.next()) {
                            if (n++ == 0) first = rs.getInt(1);
                            last = rs.getInt(1);
                        }
                    }
                    if (n == 0) break;
                    System.out.println("page " + (++page) + ": ids " + first + ".." + last
                            + " (" + n + " rows)");
                }
            }
        }
    }
}
```

The ids are 3, 6, …, 69 (not consecutive), which is normal after deletes; keyset pagination does not care. Each page query uses the primary-key index to start right after the last id, so page 1 000 costs the same as page 1, unlike `OFFSET 5000`, which reads and discards 5 000 rows.

### J4.4 MySQL batching flag

By default MySQL Connector/J sends each statement of a batch as a separate execution, so a batch saves little apart from some client overhead. With `rewriteBatchedStatements=true`, the driver rewrites a batch of `INSERT ... VALUES (?, ?)` into a few multi-row statements `INSERT ... VALUES (...), (...), (...)` (up to the server's `max_allowed_packet`), and sends batched updates and deletes as multi-statement packets. The number of round trips drops from N to a handful, and the server parses far fewer statements, which is why bulk loads often become ten times faster or more.
