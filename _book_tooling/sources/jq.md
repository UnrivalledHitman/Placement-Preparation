# How to use this practice book
%28 exercises matching the JDBC guide, with hints kept separate and executed Java solutions

Each part matches chapters of the **JDBC and Java Persistence** guide. Write every Code exercise as a real program (H2 in memory with `MODE=MySQL`, or a local MySQL), run it, and break it on purpose before reading the solution. Solutions are complete programs whose output is shown.

| Type | What you do |
|---|---|
| Concept | Explain or predict, in words |
| Code | Write and run a working program |
| Debug | Find and fix the bug in described code |

**Marking scheme.** Mark ✓ (solved alone), ~ (with the hint) or ✗ (needed the solution). For Code exercises also check: are all resources closed, are all values bound as parameters, is every multi-statement change in a transaction? Redo every ~ and ✗ a week later.

| Part | Guide chapters | Topic | Exercises |
|---|---|---|---|
| 1 | 1 | Architecture and resources | 4 |
| 2 | 2 | Statements, injection, types | 5 |
| 3 | 3 | Transactions and isolation | 5 |
| 4 | 4 | Batching and round trips | 4 |
| 5 | 5 | Connection pools | 3 |
| 6 | 6–7 | DAO, migrations | 4 |
| 7 | 8–9 | Servlets and interview questions | 3 |

# Exercises

## Part 1: Architecture and resources

**J1.1 · Easy · Concept · Interfaces and implementations.** Which of `Connection`, `DriverManager`, `PreparedStatement`, `ResultSet`, `SQLException`, `DataSource` are interfaces, and which classes? Who provides the classes that implement the interfaces?

**J1.2 · Easy · Code · List the tables.** Using only `DatabaseMetaData`, print the names of all tables a program created in the `PUBLIC` schema, and the columns (name and type) of one of them.

**J1.3 · Medium · Debug · Closing in the wrong place.** A method opens a connection, creates a statement, executes a query, closes the connection, and only then loops over the `ResultSet`. What happens, and why? Write the corrected method with try-with-resources.

**J1.4 · Easy · Concept · Reading SQLState.** Classify these SQLStates by class and say how an application should react: `23505`, `42S02`, `08S01`, `40001`, `HYT00`.

## Part 2: Statements, injection, types

**J2.1 · Medium · Code · Search without injection.** Implement `searchMeters(city, sortColumn, descending)` where the city is a user-supplied value and the sort column is chosen by the user from `serial` or `city`. Show that the input `Kolkata' OR '1'='1` returns nothing and an invalid sort column is rejected.

**J2.2 · Medium · Code · LIKE with user input.** Find meters whose serial **starts with** a user prefix that may contain `%` or `_`. Show that the prefix `SM_` matches only serials beginning with the four literal characters `SM_`.

**J2.3 · Easy · Code · NULL in and out.** Insert a reading with an unknown voltage (`NULL`), then read it three ways: `getDouble`, `getDouble` + `wasNull`, and `getObject(..., Double.class)`.

**J2.4 · Medium · Code · IN list with parameters.** Given a Java `List<String>` of serials of any length, build a `PreparedStatement` with the right number of placeholders and fetch those meters.

**J2.5 · Medium · Code · Money and time.** Store a bill with `BigDecimal` amount `1234.50` and an `Instant` issue time; read them back and show that the amount keeps its scale and the instant is unchanged.

## Part 3: Transactions and isolation

**J3.1 · Easy · Concept · Auto-commit traps.** What happens in each case? (a) `rollback()` while auto-commit is on; (b) two `executeUpdate` calls with auto-commit on and an exception between them; (c) a pooled connection returned with auto-commit `false` and uncommitted changes.

**J3.2 · Medium · Code · Order with items atomically.** Insert an order row and three item rows in one transaction; make the third item violate a `CHECK (qty > 0)` constraint and show that no order and no items remain.

**J3.3 · Medium · Code · Savepoint per row.** Import five meter rows where two violate a `UNIQUE` constraint; keep the valid three using savepoints, and report which rows were skipped.

**J3.4 · Medium · Code · Phantom or not.** At READ COMMITTED and at REPEATABLE READ, count readings for a meter twice in one transaction while another connection inserts and commits a new reading in between. Report both counts at each level.

**J3.5 · Hard · Code · Stock without overselling.** Two buyers try to buy the last 3 units of a product (each wants 2). Implement the purchase with one conditional `UPDATE` so that exactly one succeeds, and show the final stock.

## Part 4: Batching and round trips

**J4.1 · Medium · Code · Batch with a bad row.** Batch-insert 10 rows where row 7 violates a primary key. Catch `BatchUpdateException`, print the update counts the driver returns, and decide what was committed when auto-commit is off and you roll back.

**J4.2 · Medium · Code · Count before you optimise.** Write a counting proxy (as in the guide) and use it to show how many statements a loop that updates the tariff of 50 meters one by one executes, versus one `UPDATE ... WHERE city = ?`.

**J4.3 · Medium · Code · Keyset pagination.** Page through 23 readings 5 at a time using `WHERE id > ? ORDER BY id LIMIT 5`, printing the first and last id of each page.

**J4.4 · Easy · Concept · MySQL batching flag.** What does `rewriteBatchedStatements=true` change in MySQL Connector/J, and why can it make batches an order of magnitude faster?

## Part 5: Connection pools

**J5.1 · Easy · Numerical · Total connections.** 8 application instances each run HikariCP with `maximumPoolSize = 25`, plus a reporting service with a pool of 20. MySQL's `max_connections` is 151. Is this safe? Propose pool sizes.

**J5.2 · Medium · Code · Leak detection.** Configure HikariCP with `leakDetectionThreshold`, borrow a connection, hold it past the threshold, and show (through the pool's active count and a returned-in-time comparison) the difference between a leak and a correct borrow.

**J5.3 · Medium · Concept · Why not 1 000 connections?** A team raises `maximumPoolSize` from 20 to 1 000 to fix timeouts under load. Explain why this usually makes things worse and what to investigate instead.

## Part 6: DAO and migrations

**J6.1 · Medium · Code · A reading DAO.** Write `ReadingDao` with `add(serial, ts, kwh)`, `dailyTotals(serial, from, to)` returning a list of records, and an in-memory implementation for tests; run the same checks against both.

**J6.2 · Medium · Code · Transactions across DAO calls.** Two DAO calls (debit and credit) must share one transaction. Show why a helper that borrows a connection per call cannot do it, then pass the connection explicitly (or bind it to the thread) to make it work.

**J6.3 · Medium · Code · Checksums for migrations.** Extend the guide's migration runner to store a checksum of each script and refuse to start if an applied script was edited.

**J6.4 · Easy · Concept · Zero-downtime rename.** Write the release-by-release steps to rename `meter.city` to `meter.district` while old and new versions of the application run side by side.

## Part 7: Servlets and interview questions

**J7.1 · Medium · Debug · A shared field in a servlet.** A servlet stores the current request's user id in an instance field and uses it later in `doGet`. Explain the bug under concurrent requests and fix it.

**J7.2 · Medium · Code · A filter that times requests.** Write a servlet filter that measures each request and adds `X-Elapsed-Ms`; print only whether the header is present and numeric (timing values vary).

**J7.3 · Easy · Concept · Rapid-fire questions.** Answer in one or two lines each: (a) types of JDBC drivers; (b) `execute` versus `executeQuery`; (c) what `Class.forName` did and whether it is still needed; (d) `DataSource` versus `DriverManager`; (e) how JPA uses JDBC.
