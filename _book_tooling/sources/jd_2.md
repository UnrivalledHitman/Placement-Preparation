# Chapter 5: Connection Pools
%Why opening connections per request fails, HikariCP, pool exhaustion and leaks demonstrated, and sizing

## 5.1 Why pool

Opening a database connection is expensive: a TCP handshake, often TLS, authentication, and session set-up on the server, typically several milliseconds and sometimes much more. A web application that opened a connection per request would spend more time connecting than querying, and a traffic spike would open thousands of connections and overwhelm the database. A **connection pool** opens a fixed set of connections once and lends them out: `getConnection()` borrows one, and `close()` on a pooled connection **returns it to the pool** instead of closing it.

| `DriverManager` | `DataSource` (pooled) |
|---|---|
| A new physical connection every call | A borrowed connection, reused |
| Configuration in the code (URL, password) | Configured once, injected (Spring Boot creates a HikariCP `DataSource` from `spring.datasource.*`) |
| Fine for scripts and tests | Required for servers |

## 5.2 HikariCP: borrowing, exhaustion and leaks

The program creates a pool of **two** connections with a short `connectionTimeout`, then shows what happens when a third caller arrives while both are in use, and what a forgotten `close()` does.

```java jdbc A pool of two: borrowing, timing out, and a leak
package demo;

import com.zaxxer.hikari.*;
import java.sql.*;

public class Main {
    public static void main(String[] args) throws Exception {
        HikariConfig cfg = new HikariConfig();
        cfg.setJdbcUrl("jdbc:h2:mem:pool;MODE=MySQL;DB_CLOSE_DELAY=-1");
        cfg.setUsername("sa");
        cfg.setMaximumPoolSize(2);
        cfg.setMinimumIdle(2);
        cfg.setConnectionTimeout(250);                  // ms to wait for a free connection
        cfg.setPoolName("meters");
        try (HikariDataSource ds = new HikariDataSource(cfg)) {
            HikariPoolMXBean pool = ds.getHikariPoolMXBean();
            try (Connection a = ds.getConnection(); Connection b = ds.getConnection()) {
                System.out.println("two borrowed: active " + pool.getActiveConnections()
                        + ", idle " + pool.getIdleConnections());
                try (Connection c = ds.getConnection()) {
                    System.out.println("third borrowed?!");
                } catch (SQLException e) {
                    System.out.println("third caller: " + e.getClass().getSimpleName()
                            + " after waiting 250 ms");
                }
            }
            System.out.println("after close(): active " + pool.getActiveConnections()
                    + ", idle " + pool.getIdleConnections() + " (returned, not closed)");

            for (int request = 1; request <= 3; request++) {   // a leaky request handler
                try {
                    Connection con = ds.getConnection();       // never closed
                    con.createStatement().executeQuery("SELECT 1");
                    System.out.println("request " + request + " served");
                } catch (SQLException e) {
                    System.out.println("request " + request
                            + " failed: pool exhausted by leaks");
                }
            }
        }
    }
}
```

After the first two requests, both connections are leaked: borrowed and never returned. Every later request waits for the timeout and fails, although the database itself is idle. In production this shows up as "the service hangs under load", with the pool's active count stuck at the maximum. HikariCP's `leakDetectionThreshold` (for example 2 000 ms) logs a stack trace of the code that borrowed a connection and did not return it in time; it is worth enabling in staging.

## 5.3 Sizing and settings

| Setting | Meaning | Guidance |
|---|---|---|
| `maximumPoolSize` | Upper limit of connections | Small: a common starting point is (CPU cores of the **database** × 2) + disks; 10–20 serves thousands of requests per second for short queries. More connections than the database can run in parallel only adds contention |
| `minimumIdle` | Connections kept open when idle | HikariCP recommends equal to the maximum (a fixed-size pool) |
| `connectionTimeout` | Wait for a free connection | 1–5 s in web apps; fail fast rather than queue forever |
| `maxLifetime` | Retire connections after this time | Shorter than the database's or firewall's idle cut-off (MySQL `wait_timeout`) |
| `leakDetectionThreshold` | Log connections held too long | Staging and debugging |

> TIP: Total connections = instances × pool size. Ten application instances with a pool of 50 each open 500 connections; MySQL's default `max_connections` is 151. Size pools from the database's side.

## 5.4 Practical lessons

- Servers use a pooled `DataSource`; `close()` returns the connection to the pool.
- A leaked connection is a slow-motion outage; always use try-with-resources, enable leak detection in staging.
- Keep pools small and fixed; multiply by the number of instances when checking the database limit.

# Chapter 6: The DAO Pattern and a Mini JdbcTemplate
%Separating SQL from business logic, row mappers, exception translation, and what Spring's JdbcTemplate does for you

## 6.1 The DAO pattern

A **Data Access Object** hides SQL behind an interface: the service layer calls `meterDao.findBySerial("SM-001")` and does not know whether the data comes from MySQL, an in-memory map in a test, or a remote service. It is the repository pattern of Spring Data, written by hand.

```text
service  ──uses──>  MeterDao (interface)
                        ▲
            ┌───────────┴────────────┐
       JdbcMeterDao              InMemoryMeterDao (tests)
            │
       JdbcHelper (connection handling, parameters, mapping, exception translation)
```

Writing raw JDBC in every DAO method repeats the same boilerplate: borrow a connection, prepare, set parameters, execute, loop over results, close everything, translate exceptions. A small helper removes it. Spring's `JdbcTemplate` is a production-grade version of exactly this helper.

```java jdbc A DAO built on a mini JdbcTemplate
package demo;

import com.zaxxer.hikari.*;
import java.sql.*;
import java.util.*;
import javax.sql.DataSource;

public class Main {
    // ---- exception translation: callers should not deal with SQLException ----
    static class DataAccessException extends RuntimeException {
        DataAccessException(String m, Throwable c) { super(m, c); }
    }
    static class DuplicateKeyException extends DataAccessException {
        DuplicateKeyException(String m, Throwable c) { super(m, c); }
    }

    @FunctionalInterface interface RowMapper<T> { T map(ResultSet rs) throws SQLException; }

    // ---- the mini JdbcTemplate ----
    static class JdbcHelper {
        private final DataSource ds;
        JdbcHelper(DataSource ds) { this.ds = ds; }
        <T> List<T> query(String sql, RowMapper<T> mapper, Object... params) {
            try (Connection c = ds.getConnection();
                 PreparedStatement ps = c.prepareStatement(sql)) {
                bind(ps, params);
                try (ResultSet rs = ps.executeQuery()) {
                    List<T> out = new ArrayList<>();
                    while (rs.next()) out.add(mapper.map(rs));
                    return out;
                }
            } catch (SQLException e) { throw translate(sql, e); }
        }
        int update(String sql, Object... params) {
            try (Connection c = ds.getConnection();
                 PreparedStatement ps = c.prepareStatement(sql)) {
                bind(ps, params);
                return ps.executeUpdate();
            } catch (SQLException e) { throw translate(sql, e); }
        }
        private static void bind(PreparedStatement ps, Object[] params) throws SQLException {
            for (int i = 0; i < params.length; i++) ps.setObject(i + 1, params[i]);
        }
        private static DataAccessException translate(String sql, SQLException e) {
            if (e.getSQLState() != null && e.getSQLState().startsWith("23"))   // integrity
                return new DuplicateKeyException("constraint violated: " + sql, e);
            return new DataAccessException("SQL failed: " + sql, e);
        }
    }

    // ---- domain and DAO ----
    record Meter(long id, String serial, String city) {}
    interface MeterDao {
        void insert(Meter m);
        Optional<Meter> findBySerial(String serial);
        List<Meter> findByCity(String city);
    }
    static class JdbcMeterDao implements MeterDao {
        private static final RowMapper<Meter> MAPPER = rs -> new Meter(rs.getLong("id"),
                rs.getString("serial"), rs.getString("city"));
        private final JdbcHelper jdbc;
        JdbcMeterDao(JdbcHelper jdbc) { this.jdbc = jdbc; }
        public void insert(Meter m) {
            jdbc.update("INSERT INTO meter (id, serial, city) VALUES (?, ?, ?)", m.id(),
                    m.serial(), m.city());
        }
        public Optional<Meter> findBySerial(String serial) {
            return jdbc.query("SELECT * FROM meter WHERE serial = ?", MAPPER, serial).stream()
                    .findFirst();
        }
        public List<Meter> findByCity(String city) {
            return jdbc.query("SELECT * FROM meter WHERE city = ? ORDER BY serial", MAPPER,
                    city);
        }
    }

    public static void main(String[] args) {
        HikariConfig cfg = new HikariConfig();
        cfg.setJdbcUrl("jdbc:h2:mem:dao;MODE=MySQL;DB_CLOSE_DELAY=-1");
        cfg.setUsername("sa");
        try (HikariDataSource ds = new HikariDataSource(cfg)) {
            JdbcHelper jdbc = new JdbcHelper(ds);
            jdbc.update("CREATE TABLE meter (id BIGINT PRIMARY KEY, "
                    + "serial VARCHAR(20) UNIQUE, city VARCHAR(40))");
            MeterDao dao = new JdbcMeterDao(jdbc);
            dao.insert(new Meter(1, "SM-001", "Kolkata"));
            dao.insert(new Meter(2, "SM-002", "Howrah"));
            dao.insert(new Meter(3, "SM-003", "Kolkata"));
            System.out.println("findBySerial(SM-002) = " + dao.findBySerial("SM-002"));
            System.out.println("findBySerial(SM-404) = " + dao.findBySerial("SM-404"));
            System.out.println("findByCity(Kolkata)  = " + dao.findByCity("Kolkata"));
            try {
                dao.insert(new Meter(4, "SM-001", "Asansol"));      // duplicate serial
            } catch (DuplicateKeyException e) {
                String state = ((SQLException) e.getCause()).getSQLState();
                System.out.println("duplicate serial -> " + e.getClass().getSimpleName()
                        + " (cause SQLState " + state + ")");
            }
        }
    }
}
```

| Design choice | Reason |
|---|---|
| `Optional<Meter>` for single lookups | "Not found" is a normal result, not an exception |
| Unchecked `DataAccessException` hierarchy | Service code catches what it can handle (`DuplicateKeyException` → HTTP 409) and lets the rest propagate; Spring uses the same idea |
| Row mapper as a lambda | One place maps columns to the record |
| The helper borrows and returns a connection per call | Simple and leak-free; for transactions spanning several calls, the helper must use the **same** connection, which Spring solves by binding the transaction's connection to the current thread |

## 6.2 Testing DAOs

Test DAOs against a real database engine, not mocks: the SQL itself is what can be wrong. H2 in MySQL mode is fast for unit tests, but differs in details (functions, locking), so run the important tests against MySQL in Docker as well (Testcontainers; Spring Boot guide, Chapter 7.5).

## 6.3 Practical lessons

- Put SQL behind DAO interfaces; services depend on the interface.
- A small helper (or Spring's `JdbcTemplate`) removes JDBC boilerplate and leaks.
- Translate `SQLException` into meaningful unchecked exceptions using SQLState.

# Chapter 7: Schema Migrations by Hand
%How Flyway and Liquibase work, by building a minimal versioned migration runner

## 7.1 The idea

The database schema must evolve with the code: a new column in release 12, an index in release 13. A **migration tool** keeps numbered scripts (`V1__create_meter.sql`, `V2__add_city.sql`), records in a table which ones have run, and runs the missing ones in order at start-up, each in a transaction. Every environment (laptop, test, production) then reaches the same schema by the same steps.

```java jdbc A minimal Flyway: versioned, recorded, idempotent
package demo;

import java.sql.*;
import java.util.*;

public class Main {
    static final String URL = "jdbc:h2:mem:mig;MODE=MySQL;DB_CLOSE_DELAY=-1";
    static final SortedMap<Integer, String> MIGRATIONS = new TreeMap<>(Map.of(
            1, "CREATE TABLE meter (id INT PRIMARY KEY, serial VARCHAR(20) NOT NULL)",
            2, "ALTER TABLE meter ADD COLUMN city VARCHAR(40)",
            3, "CREATE INDEX idx_meter_city ON meter (city)"));

    static void migrate(Connection con, int upTo) throws SQLException {
        try (Statement st = con.createStatement()) {
            st.execute("CREATE TABLE IF NOT EXISTS schema_history (version INT PRIMARY KEY, "
                    + "script VARCHAR(200))");
        }
        Set<Integer> done = new TreeSet<>();
        try (Statement st = con.createStatement();
             ResultSet rs = st.executeQuery("SELECT version FROM schema_history")) {
            while (rs.next()) done.add(rs.getInt(1));
        }
        for (var m : MIGRATIONS.headMap(upTo + 1).entrySet()) {
            if (done.contains(m.getKey())) continue;
            con.setAutoCommit(false);
            try (Statement st = con.createStatement();
                 PreparedStatement rec = con.prepareStatement(
                         "INSERT INTO schema_history VALUES (?, ?)")) {
                st.execute(m.getValue());
                rec.setInt(1, m.getKey()); rec.setString(2, m.getValue());
                rec.executeUpdate();
                con.commit();
                System.out.println("  applied V" + m.getKey());
            } catch (SQLException e) {
                con.rollback();
                throw e;
            } finally { con.setAutoCommit(true); }
        }
    }
    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(URL, "sa", "")) {
            System.out.println("release 1 starts:"); migrate(con, 1);
            System.out.println("release 3 starts:"); migrate(con, 3);
            System.out.println("release 3 restarts:"); migrate(con, 3);
            try (Statement st = con.createStatement();
                 ResultSet rs = st.executeQuery(
                         "SELECT version FROM schema_history ORDER BY 1")) {
                StringBuilder sb = new StringBuilder("history:");
                while (rs.next()) sb.append(" V").append(rs.getInt(1));
                System.out.println(sb);
            }
        }
    }
}
```

The restart applies nothing: each migration runs exactly once per database. Real tools add what this sketch lacks: a checksum per script (an edited, already-applied script is an error), a lock so that two instances starting together do not both migrate, and baseline and repair commands.

> TRAP: In MySQL, DDL statements (`CREATE`, `ALTER`) cause an **implicit commit**, so a migration with several DDL statements cannot be rolled back halfway. Keep one DDL change per migration on MySQL; PostgreSQL supports transactional DDL.

## 7.2 Zero-downtime changes

| Change | Safe sequence across releases |
|---|---|
| Add a column | Add it nullable (or with a default) → deploy code that writes it → backfill → add `NOT NULL` |
| Rename a column | Add the new column → write both → backfill → read the new one → stop writing the old → drop it |
| Add an index on a big table | Online index creation (`ALGORITHM=INPLACE` in MySQL, `CREATE INDEX CONCURRENTLY` in PostgreSQL) |
| Drop a column | Stop reading it in one release, drop it in a later one |

## 7.3 Practical lessons

- Schema changes are code: versioned scripts, applied once, in order, recorded in a history table.
- Never edit an applied migration; add a new one.
- Plan multi-release sequences for changes that old and new code must survive together.
