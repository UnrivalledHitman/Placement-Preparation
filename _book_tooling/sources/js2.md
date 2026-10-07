## Part 5 solutions

### J5.1 Total connections

8 × 25 + 20 = **220** connections at peak, against a limit of 151: under load some instances cannot connect at all, and MySQL also needs spare connections for administration and replication. Size from the database: keep the total around 100–120, for example a pool of 12 per application instance (96) plus 10 for reporting, and run reporting against a read replica if it is heavy. If the application really needs more concurrency, the bottleneck is usually query time or lock waits, not the number of connections (J5.3).

### J5.2 Leak detection

```java jdbc A borrow returned in time versus a leak
package demo;

import com.zaxxer.hikari.*;
import java.sql.*;

public class Main {
    public static void main(String[] args) throws Exception {
        HikariConfig cfg = new HikariConfig();
        cfg.setJdbcUrl("jdbc:h2:mem:leak;MODE=MySQL;DB_CLOSE_DELAY=-1");
        cfg.setUsername("sa");
        cfg.setMaximumPoolSize(3);
        cfg.setLeakDetectionThreshold(2_000);          // ms; HikariCP's minimum is 2 000
        try (HikariDataSource ds = new HikariDataSource(cfg)) {
            HikariPoolMXBean pool = ds.getHikariPoolMXBean();
            try (Connection c = ds.getConnection(); Statement st = c.createStatement()) {
                st.execute("SELECT 1");
            }
            int active = pool.getActiveConnections();
            System.out.println("after a correct borrow: active " + active);
            Connection leaked = ds.getConnection();       // never closed by the "handler"
            Thread.sleep(2_100);                          // past the threshold
            System.out.println("after a leak, 2.1 s later: active "
                    + pool.getActiveConnections() + " (HikariCP has logged a leak warning "
                    + "with the borrower's stack trace)");
            leaked.close();
            System.out.println("after closing it: active " + pool.getActiveConnections());
        }
    }
}
```

With a real logging backend, HikariCP prints "Connection leak detection triggered for … on thread main, stack trace follows" with the line that borrowed the connection, which is exactly what you need to find the bug. (This program uses `slf4j-nop`, which discards log messages, so only the counts appear.) If the connection is eventually returned, Hikari logs "Previously reported leaked connection … was returned".

### J5.3 Why not 1 000 connections?

A database can only run as many queries in parallel as it has CPU cores and disk bandwidth for; with 1 000 connections, almost all of them wait, and the waiting costs memory (each MySQL connection has its own buffers), context switches and lock contention, so throughput **drops** and latency rises. Timeouts under load usually mean that connections are held too long: slow queries (missing indexes), long transactions that include remote calls or user think-time, lock waits, N+1 patterns, or leaks. Investigate the pool's active-connection and wait-time metrics, the slow-query log, and the time spent between borrowing and returning a connection; fix those, and keep the pool small.

## Part 6 solutions

### J6.1 A reading DAO

```java jdbc One contract, a JDBC implementation and an in-memory one
package demo;

import java.sql.*;
import java.time.*;
import java.util.*;

public class Main {
    record Daily(LocalDate day, double kwh) {}
    interface ReadingDao {
        void add(String serial, LocalDateTime ts, double kwh);
        List<Daily> dailyTotals(String serial, LocalDate from, LocalDate to);
    }
    static class JdbcReadingDao implements ReadingDao {
        private final Connection c;
        JdbcReadingDao(Connection c) { this.c = c; }
        public void add(String serial, LocalDateTime ts, double kwh) {
            String sql = "INSERT INTO reading VALUES (?, ?, ?)";
            try (PreparedStatement ps = c.prepareStatement(sql)) {
                ps.setString(1, serial); ps.setObject(2, ts); ps.setDouble(3, kwh);
                ps.executeUpdate();
            } catch (SQLException e) { throw new IllegalStateException(e); }
        }
        public List<Daily> dailyTotals(String serial, LocalDate from, LocalDate to) {
            String sql = "SELECT CAST(ts AS DATE) d, SUM(kwh) FROM reading WHERE serial = ? "
                    + "AND ts >= ? AND ts < ? GROUP BY CAST(ts AS DATE) ORDER BY d";
            try (PreparedStatement ps = c.prepareStatement(sql)) {
                ps.setString(1, serial);
                ps.setObject(2, from.atStartOfDay());
                ps.setObject(3, to.plusDays(1).atStartOfDay());
                try (ResultSet rs = ps.executeQuery()) {
                    List<Daily> out = new ArrayList<>();
                    while (rs.next())
                        out.add(new Daily(rs.getObject(1, LocalDate.class), rs.getDouble(2)));
                    return out;
                }
            } catch (SQLException e) { throw new IllegalStateException(e); }
        }
    }
    static class InMemoryReadingDao implements ReadingDao {
        private final List<Object[]> rows = new ArrayList<>();
        public void add(String s, LocalDateTime ts, double kwh) {
            rows.add(new Object[]{s, ts, kwh});
        }
        public List<Daily> dailyTotals(String serial, LocalDate from, LocalDate to) {
            TreeMap<LocalDate, Double> m = new TreeMap<>();
            for (Object[] r : rows) {
                LocalDate d = ((LocalDateTime) r[1]).toLocalDate();
                if (r[0].equals(serial) && !d.isBefore(from) && !d.isAfter(to))
                    m.merge(d, (Double) r[2], Double::sum);
            }
            return m.entrySet().stream().map(e -> new Daily(e.getKey(), e.getValue()))
                    .toList();
        }
    }
    static List<Daily> check(ReadingDao dao) {
        LocalDateTime t = LocalDateTime.of(2026, 10, 1, 0, 0);
        dao.add("SM-1", t.plusHours(6), 1.5);
        dao.add("SM-1", t.plusHours(18), 2.0);
        dao.add("SM-1", t.plusDays(1).plusHours(1), 4.0);
        dao.add("SM-2", t.plusHours(6), 9.0);                     // another meter
        dao.add("SM-1", t.plusDays(3), 7.0);                      // outside the range
        return dao.dailyTotals("SM-1", LocalDate.of(2026, 10, 1), LocalDate.of(2026, 10, 2));
    }
    public static void main(String[] args) throws SQLException {
        String url = "jdbc:h2:mem:rd;MODE=MySQL;DB_CLOSE_DELAY=-1";
        try (Connection c = DriverManager.getConnection(url, "sa", "");
             Statement st = c.createStatement()) {
            st.execute("CREATE TABLE reading (serial VARCHAR(10), ts TIMESTAMP, kwh DOUBLE)");
            List<Daily> jdbc = check(new JdbcReadingDao(c));
            List<Daily> mem = check(new InMemoryReadingDao());
            System.out.println("JDBC:      " + jdbc);
            System.out.println("in memory: " + mem);
            System.out.println("same? " + jdbc.equals(mem));
        }
    }
}
```

The same `check` runs against both implementations, which is the point of the DAO interface: services are tested quickly with the in-memory version, and the JDBC version is tested once against the real SQL. The range uses `ts >= from AND ts < to + 1 day`, which includes the whole last day and lets the database use an index on `ts` (wrapping the column in a function in the `WHERE` clause would not).

### J6.2 Transactions across DAO calls

```java jdbc A transaction must use one connection
package demo;

import java.sql.*;

public class Main {
    static final String URL = "jdbc:h2:mem:share;MODE=MySQL;DB_CLOSE_DELAY=-1";

    // a DAO method that receives the caller's connection
    static void adjust(Connection c, int id, int delta) throws SQLException {
        try (PreparedStatement ps = c.prepareStatement(
                "UPDATE wallet SET paise = paise + ? WHERE id = ?")) {
            ps.setInt(1, delta); ps.setInt(2, id);
            if (ps.executeUpdate() != 1) throw new SQLException("no wallet " + id);
        }
    }
    // the flawed version: each call borrows its own connection (auto-commit)
    static void adjustOwnConnection(int id, int delta) throws SQLException {
        try (Connection c = DriverManager.getConnection(URL, "sa", "")) {
            adjust(c, id, delta);
        }
    }
    static String balances() throws SQLException {
        try (Connection c = DriverManager.getConnection(URL, "sa", "");
             Statement st = c.createStatement();
             ResultSet rs = st.executeQuery("SELECT id, paise FROM wallet ORDER BY id")) {
            StringBuilder sb = new StringBuilder();
            while (rs.next())
                sb.append(rs.getInt(1)).append('=').append(rs.getInt(2)).append(' ');
            return sb.toString().trim();
        }
    }
    public static void main(String[] args) throws SQLException {
        try (Connection c = DriverManager.getConnection(URL, "sa", "");
             Statement st = c.createStatement()) {
            st.execute("CREATE TABLE wallet (id INT PRIMARY KEY, paise INT)");
            st.execute("INSERT INTO wallet VALUES (1, 10000), (2, 0)");
        }
        try {                                   // credit goes to a wallet that is missing
            adjustOwnConnection(1, -3000);
            adjustOwnConnection(3, 3000);
        } catch (SQLException e) {
            System.out.println("per-call connections: " + e.getMessage());
        }
        System.out.println("  balances " + balances() + "  (3000 vanished)");

        try (Connection c = DriverManager.getConnection(URL, "sa", "")) {
            c.createStatement().executeUpdate("UPDATE wallet SET paise = 10000 WHERE id = 1");
            c.setAutoCommit(false);
            try {
                adjust(c, 1, -3000);
                adjust(c, 3, 3000);
                c.commit();
            } catch (SQLException e) {
                c.rollback();
                System.out.println("shared connection:    " + e.getMessage()
                        + " -> rolled back");
            }
        }
        System.out.println("  balances " + balances());
    }
}
```

A transaction belongs to one connection. When each DAO call borrows its own connection, each call commits on its own and a failure halfway leaves the data inconsistent. The fix is to give both calls the same connection: pass it explicitly (as here), or keep it in a `ThreadLocal` for the duration of the unit of work, which is what Spring's `DataSourceTransactionManager` does behind `@Transactional`.

### J6.3 Checksums for migrations

```java jdbc Refusing to start after an applied script was edited
package demo;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.sql.*;
import java.util.*;

public class Main {
    static final String URL = "jdbc:h2:mem:chk;MODE=MySQL;DB_CLOSE_DELAY=-1";

    static String sha(String s) throws Exception {
        byte[] d = MessageDigest.getInstance("SHA-256")
                .digest(s.getBytes(StandardCharsets.UTF_8));
        return String.format("%064x", new BigInteger(1, d)).substring(0, 12);
    }
    static void migrate(Connection c, SortedMap<Integer, String> scripts) throws Exception {
        try (Statement st = c.createStatement()) {
            st.execute("CREATE TABLE IF NOT EXISTS schema_history (version INT PRIMARY KEY, "
                    + "checksum VARCHAR(64))");
        }
        Map<Integer, String> applied = new HashMap<>();
        try (Statement st = c.createStatement();
             ResultSet rs = st.executeQuery("SELECT version, checksum FROM schema_history")) {
            while (rs.next()) applied.put(rs.getInt(1), rs.getString(2));
        }
        for (var e : scripts.entrySet()) {
            String sum = sha(e.getValue());
            if (applied.containsKey(e.getKey())) {
                if (!applied.get(e.getKey()).equals(sum))
                    throw new IllegalStateException("V" + e.getKey() + " was modified after "
                            + "it was applied (" + applied.get(e.getKey()) + " != " + sum
                            + ")");
                continue;
            }
            try (Statement st = c.createStatement();
                 PreparedStatement rec = c.prepareStatement(
                         "INSERT INTO schema_history VALUES (?, ?)")) {
                st.execute(e.getValue());
                rec.setInt(1, e.getKey()); rec.setString(2, sum);
                rec.executeUpdate();
                System.out.println("  applied V" + e.getKey() + " checksum " + sum);
            }
        }
    }
    public static void main(String[] args) throws Exception {
        SortedMap<Integer, String> v = new TreeMap<>();
        v.put(1, "CREATE TABLE meter (id INT PRIMARY KEY)");
        v.put(2, "ALTER TABLE meter ADD COLUMN city VARCHAR(40)");
        try (Connection c = DriverManager.getConnection(URL, "sa", "")) {
            System.out.println("first start:"); migrate(c, v);
            v.put(2, "ALTER TABLE meter ADD COLUMN city VARCHAR(80)");   // someone edits V2
            System.out.println("start with an edited V2:");
            try { migrate(c, v); } catch (IllegalStateException e) {
                System.out.println("  refused: " + e.getMessage());
            }
        }
    }
}
```

Without the checksum, the edited V2 would silently never run on databases that already applied the old V2, while new databases would get the new version: environments would drift apart. The fix for a wrong applied migration is always a **new** migration (V3).

### J6.4 Zero-downtime rename

| Release | Schema | Application |
|---|---|---|
| 1 (expand) | Add nullable `district` | Writes both `city` and `district`, reads `city` |
| 2 (migrate) | Backfill `district = city` where null, in batches | Same |
| 3 | — | Reads `district`, still writes both |
| 4 | — | Writes only `district` |
| 5 (contract) | Drop `city` (after a safety period) | — |

At every step, the version currently running and the previous version both work against the schema, so a rolling deployment or a rollback never breaks.

## Part 7 solutions

### J7.1 A shared field in a servlet

One servlet instance handles all requests on many threads. If request A stores its user id in an instance field and request B overwrites it before A reads it back, A acts with B's identity: data from one user shown to another, or an action performed in the wrong account. It may pass every test and fail only under load. Fix: keep per-request data in local variables or request attributes.

```java
public class ProfileServlet extends HttpServlet {
    // private String currentUser;                       // BUG: shared by all threads
    @Override protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        String currentUser = req.getRemoteUser();         // local: one per request
        req.setAttribute("user", currentUser);            // or a request attribute
        resp.getWriter().write("profile of " + currentUser);
    }
}
```

### J7.2 A filter that times requests

```java jdbc A timing filter on embedded Tomcat
package demo;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import org.apache.catalina.Context;
import org.apache.catalina.startup.Tomcat;
import org.apache.tomcat.util.descriptor.web.*;

public class Main {
    public static class TimingFilter implements Filter {
        @Override public void doFilter(ServletRequest req, ServletResponse resp,
                FilterChain chain) throws IOException, ServletException {
            long start = System.nanoTime();
            HttpServletResponse r = (HttpServletResponse) resp;
            r.setHeader("X-Elapsed-Ms", "pending");
            chain.doFilter(req, new HttpServletResponseWrapper(r) {   // set before the body
                @Override public java.io.PrintWriter getWriter() throws IOException {
                    r.setHeader("X-Elapsed-Ms", String.valueOf((System.nanoTime() - start)
                            / 1_000_000));
                    return super.getWriter();
                }
            });
        }
    }
    public static class Hello extends HttpServlet {
        @Override protected void doGet(HttpServletRequest q, HttpServletResponse s)
                throws IOException { s.getWriter().write("ok"); }
    }
    public static void main(String[] args) throws Exception {
        Tomcat t = new Tomcat();
        t.setBaseDir(Files.createTempDirectory("tc").toString());
        t.setPort(0);
        Context ctx = t.addContext("", null);
        Tomcat.addServlet(ctx, "hello", new Hello());
        ctx.addServletMappingDecoded("/hello", "hello");
        FilterDef fd = new FilterDef();
        fd.setFilterName("timing");
        fd.setFilter(new TimingFilter());
        ctx.addFilterDef(fd);
        FilterMap fm = new FilterMap(); fm.setFilterName("timing"); fm.addURLPattern("/*");
        ctx.addFilterMap(fm);
        t.getConnector();
        t.start();
        int port = t.getConnector().getLocalPort();
        URI uri = URI.create("http://localhost:" + port + "/hello");
        var r = HttpClient.newHttpClient().send(HttpRequest.newBuilder(uri).build(),
                HttpResponse.BodyHandlers.ofString());
        String h = r.headers().firstValue("X-Elapsed-Ms").orElse("missing");
        System.out.println("status " + r.statusCode() + ", body " + r.body()
                + ", X-Elapsed-Ms present and numeric? " + h.matches("\\d+"));
        t.stop(); t.destroy();
    }
}
```

A header must be set **before** the response body is committed (sent). Setting it after `chain.doFilter` returns is too late if the servlet already wrote and flushed the body, which is why the filter wraps the response and sets the header at the moment the servlet first asks for the writer. Only the presence of the header is printed, because the elapsed time varies between runs.

### J7.3 Rapid-fire questions

| Question | Answer |
|---|---|
| (a) Driver types | Type 1 JDBC-ODBC bridge (removed in Java 8), Type 2 native API, Type 3 network middleware, Type 4 pure Java speaking the database protocol (MySQL Connector/J, PostgreSQL, H2) |
| (b) `execute` vs `executeQuery` | `execute` runs any statement and returns whether a result set came first; `executeQuery` is for SELECT and returns the `ResultSet` |
| (c) `Class.forName` | Loaded the driver class so that its static block registered it with `DriverManager`; unnecessary since JDBC 4 (service loader) |
| (d) `DataSource` vs `DriverManager` | `DataSource` is configured once, injectable and usually pooled; `DriverManager` opens a new physical connection each time |
| (e) JPA and JDBC | Hibernate generates SQL and runs it with JDBC `PreparedStatement`s on a pooled connection; a JPA transaction is a JDBC transaction on that connection |
