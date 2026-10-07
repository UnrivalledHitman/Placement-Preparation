# Chapter 8: Servlets: the Layer Under Spring MVC
%The servlet lifecycle, filters, thread-per-request, and a JSON endpoint backed by a connection pool

## 8.1 What a servlet is

A **servlet** is a Java class that a servlet container (Tomcat, Jetty, Undertow) calls to handle HTTP requests. The container owns the sockets and threads; for each request it picks a thread from its pool, builds `HttpServletRequest` and `HttpServletResponse` objects, runs the **filters** configured for the URL, and calls the servlet's `service` method, which dispatches to `doGet`, `doPost` and so on.

| Lifecycle step | Called | Typical work |
|---|---|---|
| `init()` | Once, when the servlet is created (at start-up or first request) | Look up the `DataSource`, read configuration |
| `service()` → `doGet()` / `doPost()` | For every request, **concurrently on many threads** | Handle the request |
| `destroy()` | Once, when the application stops | Release resources |

Because one servlet instance serves all requests at the same time, instance fields are shared between threads: store only thread-safe, shared things there (a `DataSource`), never per-request data. Spring's `DispatcherServlet` is itself one servlet; every `@RestController` method runs inside its `service()` call (Spring Boot guide, Chapter 3.1).

## 8.2 A JSON endpoint with a filter, on embedded Tomcat

The program starts Tomcat inside the JVM on a free port, registers a filter that times each request and adds a response header, and a servlet that reads meters from H2 through a HikariCP pool. A client then calls it.

```java jdbc A servlet and a filter on embedded Tomcat, reading through a pool
package demo;

import com.zaxxer.hikari.*;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.sql.*;
import org.apache.catalina.Context;
import org.apache.catalina.startup.Tomcat;
import org.apache.tomcat.util.descriptor.web.*;

public class Main {
    public static class MeterServlet extends HttpServlet {
        private transient HikariDataSource ds;               // shared by all request threads
        @Override public void init() {
            HikariConfig cfg = new HikariConfig();
            cfg.setJdbcUrl("jdbc:h2:mem:web;MODE=MySQL;DB_CLOSE_DELAY=-1");
            cfg.setUsername("sa");
            cfg.setMaximumPoolSize(4);
            ds = new HikariDataSource(cfg);
            try (Connection c = ds.getConnection(); Statement st = c.createStatement()) {
                st.execute("CREATE TABLE meter (serial VARCHAR(20) PRIMARY KEY, "
                        + "city VARCHAR(40))");
                st.execute("INSERT INTO meter VALUES ('SM-001', 'Kolkata'), "
                        + "('SM-002', 'Howrah')");
            } catch (SQLException e) { throw new IllegalStateException(e); }
            System.out.println("init(): pool and schema ready");
        }
        @Override protected void doGet(HttpServletRequest req, HttpServletResponse resp)
                throws IOException {
            String serial = req.getPathInfo() == null ? null : req.getPathInfo().substring(1);
            resp.setContentType("application/json");
            try (Connection c = ds.getConnection();
                 PreparedStatement ps = c.prepareStatement(
                         "SELECT serial, city FROM meter WHERE serial = ?")) {
                ps.setString(1, serial);
                try (ResultSet rs = ps.executeQuery()) {
                    if (!rs.next()) {
                        resp.setStatus(404);
                        resp.getWriter().write("{\"error\":\"no meter " + serial + "\"}");
                        return;
                    }
                    resp.getWriter().write("{\"serial\":\"" + rs.getString(1)
                            + "\",\"city\":\"" + rs.getString(2) + "\"}");
                }
            } catch (SQLException e) {
                resp.setStatus(500);
                resp.getWriter().write("{\"error\":\"database error\"}");
            }
        }
        @Override public void destroy() {
            ds.close();
            System.out.println("destroy(): pool closed");
        }
    }

    public static class ApiFilter implements Filter {
        @Override public void doFilter(ServletRequest req, ServletResponse resp,
                FilterChain chain) throws IOException, ServletException {
            ((HttpServletResponse) resp).setHeader("X-Api-Version", "1");
            chain.doFilter(req, resp);                       // continue to the servlet
        }
    }

    public static void main(String[] args) throws Exception {
        Tomcat tomcat = new Tomcat();
        tomcat.setBaseDir(Files.createTempDirectory("tomcat").toString());
        tomcat.setPort(0);                                   // any free port
        Context ctx = tomcat.addContext("", null);
        Tomcat.addServlet(ctx, "meters", new MeterServlet()).setLoadOnStartup(1);
        ctx.addServletMappingDecoded("/meters/*", "meters");
        FilterDef fd = new FilterDef();
        fd.setFilterName("api"); fd.setFilter(new ApiFilter());
        ctx.addFilterDef(fd);
        FilterMap fm = new FilterMap();
        fm.setFilterName("api"); fm.addURLPattern("/*");
        ctx.addFilterMap(fm);
        tomcat.getConnector();
        tomcat.start();
        int port = tomcat.getConnector().getLocalPort();
        HttpClient http = HttpClient.newHttpClient();
        for (String path : new String[]{"/meters/SM-001", "/meters/SM-404"}) {
            URI uri = URI.create("http://localhost:" + port + path);
            var r = http.send(HttpRequest.newBuilder(uri).build(),
                    HttpResponse.BodyHandlers.ofString());
            String header = r.headers().firstValue("X-Api-Version")
                    .map(v -> "[X-Api-Version " + v + "] ").orElse("");
            System.out.println("GET " + path + " -> " + r.statusCode() + " " + header
                    + r.body());
        }
        tomcat.stop();
        tomcat.destroy();
    }
}
```

| Servlet concept | Spring MVC equivalent |
|---|---|
| `HttpServlet.doGet` with manual path parsing | `@GetMapping("/meters/{serial}")` with `@PathVariable` |
| Writing JSON strings by hand | Jackson converts return values (`MeterView` records) |
| `Filter` | `OncePerRequestFilter`, Spring Security's filter chain (Spring Boot guide, Chapter 6) |
| `init()` creating the pool | Spring Boot auto-configures a HikariCP `DataSource` bean |
| Returning 404/500 by hand | `@RestControllerAdvice` with `ProblemDetail` |

> TRAP: The hand-written JSON above breaks if a city name contains a quote character, and it is an injection risk in HTML pages. Always build JSON with a library (Jackson, Gson) and escape output in HTML templates; Spring does both for you.

## 8.3 Practical lessons

- A servlet container runs one servlet instance on many threads: shared fields must be thread-safe.
- Filters wrap every request: authentication, logging, headers, CORS.
- Spring MVC is one servlet (`DispatcherServlet`) plus conventions; knowing servlets explains Spring's behaviour.

# Chapter 9: From JDBC to JPA, and the Question Bank
%When to use each layer, the cheat sheet, and the questions asked in Java and backend interviews

## 9.1 Choosing the layer

| Layer | Strengths | Weaknesses | Use for |
|---|---|---|---|
| Plain JDBC | Full control, no magic, fastest for bulk work | Boilerplate, manual mapping, easy to leak | Batch jobs, migrations, tools, performance-critical paths |
| `JdbcTemplate` (Spring) | JDBC without boilerplate; exception translation; joins Spring transactions | Still hand-written SQL and mapping | Reports, complex SQL, CQRS read side |
| JPA / Hibernate (Spring Data) | Objects and relationships, dirty checking, repositories, less code | N+1 and lazy-loading traps, hidden SQL, harder bulk operations | CRUD-heavy domain logic |
| jOOQ, MyBatis | Type-safe or mapped SQL | Another tool to learn | SQL-centric teams |

Most real applications mix them: JPA for the domain, `JdbcTemplate` or plain JDBC for reports and bulk imports, all sharing one `DataSource` and one transaction manager.

## 9.2 Cheat sheet

| Task | Code |
|---|---|
| Connect (script) | `DriverManager.getConnection(url, user, pw)` |
| Connect (server) | Pooled `DataSource` (HikariCP) |
| Query with parameters | `prepareStatement("... WHERE x = ?")`, `setString(1, x)`, `executeQuery()` |
| Insert and get the id | `prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)`, `getGeneratedKeys()` |
| NULL-safe read | `getObject("col", Integer.class)` or `getInt` + `wasNull()` |
| Dates | `setObject(i, LocalDate)`, `getObject(i, LocalDate.class)` |
| Transaction | `setAutoCommit(false)` … `commit()` / `rollback()`, reset in `finally` |
| Partial rollback | `Savepoint sp = setSavepoint(); rollback(sp)` |
| Isolation | `setTransactionIsolation(Connection.TRANSACTION_READ_COMMITTED)` |
| Batch | `addBatch()` in a loop, `executeBatch()` every 1 000 |
| Stored procedure | `prepareCall("{call proc(?, ?)}")`, `registerOutParameter` |
| Metadata | `getMetaData()` on `Connection` (database) or `ResultSet` (columns) |

## 9.3 Question bank

| Question | Core of a good answer |
|---|---|
| What are the steps to connect to a database in JDBC? | Driver on the classpath (auto-registered since JDBC 4), get a `Connection` (DriverManager or DataSource), create a statement, execute, process the `ResultSet`, close everything (try-with-resources) |
| Statement versus PreparedStatement? | PreparedStatement: precompiled, parameters bound separately (no SQL injection), typed setters, faster for repeated execution |
| How does SQL injection work and how do you prevent it? | Input concatenated into SQL changes the query's structure; prevent with parameters, allow-lists for identifiers, least-privilege database users |
| `execute`, `executeQuery`, `executeUpdate`? | Any statement (returns whether a result set came first) / SELECT returning `ResultSet` / DML and DDL returning a row count |
| What is a `ResultSet` and how do you iterate it? | A cursor positioned before the first row; `while (rs.next())` |
| How do you manage transactions in JDBC? | Auto-commit off, commit or rollback, savepoints, reset auto-commit |
| What are isolation levels? | READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ, SERIALIZABLE; which anomalies each prevents; MySQL default REPEATABLE READ |
| What is connection pooling and why is it needed? | Reusing open connections; avoids connection cost and protects the database; `close()` returns to the pool; HikariCP |
| What happens if you do not close connections? | Leaks: pool exhaustion, timeouts, eventually database connection limits |
| What is batch processing? | Grouping statements to cut round trips: `addBatch`/`executeBatch`; auto-commit off |
| How do you call a stored procedure? | `CallableStatement` with `{call name(?, ?)}`, IN parameters via setters, OUT via `registerOutParameter` |
| What is `DataSource` versus `DriverManager`? | `DataSource` is an interface for obtaining connections, configured once and usually pooled; `DriverManager` creates new physical connections |
| Types of JDBC drivers? | Type 1 (JDBC-ODBC bridge, removed), Type 2 (native API), Type 3 (network protocol via middleware), Type 4 (pure Java, talks the database's protocol directly; what everyone uses today) |
| `RowSet`? | A `ResultSet` that is also a JavaBean; `CachedRowSet` works disconnected; rarely used now |
| How does JPA relate to JDBC? | JPA providers (Hibernate) generate SQL and execute it through JDBC; a JPA transaction is a JDBC transaction on one pooled connection |
| What is the DAO pattern? | An interface hiding persistence; implementations for JDBC, JPA or tests; services stay independent of storage |

## 9.4 Practical lessons

- JDBC is the foundation of every Java data-access tool; debug them by thinking in connections, statements and transactions.
- Choose the layer by the job: JPA for domain CRUD, JDBC or `JdbcTemplate` for bulk and reporting.
- Practise the question bank aloud; JDBC questions are a staple of Java interviews.
