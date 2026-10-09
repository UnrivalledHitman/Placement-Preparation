# Chapter 6: Integration Tests and Testcontainers
%Testing real wiring: HTTP clients against stub servers, databases with Testcontainers, and keeping integration tests fast

## 6.1 What integration tests are for

Unit tests with doubles prove the logic; they cannot prove that the SQL is valid for the real database, that JSON serialises the way the other service expects, that timeouts are configured, or that the connection pool works. **Integration tests** exercise the code against real (or realistic) collaborators.

| Collaborator | Options, from fastest to most realistic |
|---|---|
| Database | In-memory fake → embedded database (H2) → **the real engine in a container** (Testcontainers) |
| HTTP service | Mockito mock of the client → **stub HTTP server** (WireMock, `HttpServer`) → the real service in a test environment |
| Message broker | In-memory fake → embedded broker → real Kafka/RabbitMQ in a container |

> TRAP: H2 in "MySQL mode" is not MySQL. Functions, collations, locking, JSON support and error behaviour differ, so tests can pass on H2 and the same SQL fail in production. Test persistence code against the engine you run in production; Testcontainers makes that cheap.

## 6.2 An HTTP client against a real local server

The JDK includes a small HTTP server, which is enough to test an HTTP client for real: status handling, JSON parsing, headers, retries and timeouts all go through actual sockets.

```java junit A tariff client tested against a stub HTTP server
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.*;
import java.net.*;
import java.net.http.*;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicInteger;
import static org.junit.jupiter.api.Assertions.*;

class TariffClient {
    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(1)).build();
    private final URI base;
    TariffClient(URI base) { this.base = base; }
    double rate(String meterId) throws Exception {
        for (int attempt = 1; ; attempt++) {
            HttpRequest req = HttpRequest.newBuilder(base.resolve("/tariffs/" + meterId))
                    .timeout(Duration.ofMillis(500))
                    .header("Accept", "application/json").build();
            HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
            if (res.statusCode() == 200) {
                // {"meterId":"MTR-7","rate":7.25}
                String body = res.body();
                return Double.parseDouble(body.replaceAll(".*\"rate\":([0-9.]+).*", "$1"));
            }
            if (res.statusCode() == 404)
                throw new IllegalArgumentException("unknown meter " + meterId);
            if (attempt == 3) throw new IllegalStateException("tariff service failed: "
                    + res.statusCode());
        }
    }
}

class TariffClientIT {
    static HttpServer server;
    static final AtomicInteger calls = new AtomicInteger();

    @BeforeAll
    static void start() throws Exception {
        // any free port
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/tariffs/", ex -> {
            String meter = ex.getRequestURI().getPath().substring("/tariffs/".length());
            int n = calls.incrementAndGet();
            int status; String body = "";
            if (meter.equals("MTR-7")) {
                status = 200; body = "{\"meterId\":\"MTR-7\",\"rate\":7.25}";
            } else if (meter.equals("FLAKY") && n % 2 == 1) {
                status = 503;
            } else if (meter.equals("FLAKY")) {
                status = 200; body = "{\"meterId\":\"FLAKY\",\"rate\":4.5}";
            } else if (meter.equals("DOWN")) {
                status = 500;
            } else {
                status = 404;
            }
            byte[] bytes = body.getBytes();
            ex.sendResponseHeaders(status, bytes.length == 0 ? -1 : bytes.length);
            if (bytes.length > 0) ex.getResponseBody().write(bytes);
            ex.close();
        });
        server.start();
    }

    @AfterAll static void stop() { server.stop(0); }

    TariffClient client() {
        return new TariffClient(URI.create("http://127.0.0.1:"
                + server.getAddress().getPort()));
    }

    @Test void parsesTheRate() throws Exception {
        assertEquals(7.25, client().rate("MTR-7"), 1e-9);
    }
    @Test void retriesATransientFailure() throws Exception {
        assertEquals(4.5, client().rate("FLAKY"), 1e-9);
    }
    @Test void reportsUnknownMeters() {
        var e = assertThrows(IllegalArgumentException.class, () -> client().rate("MTR-404"));
        assertEquals("unknown meter MTR-404", e.getMessage());
    }
    @Test void givesUpAfterThreeServerErrors() {
        var e = assertThrows(IllegalStateException.class, () -> client().rate("DOWN"));
        assertEquals("tariff service failed: 500", e.getMessage());
    }
}
```

The class is named `...IT`, the Maven Failsafe convention for integration tests, so build tools can run them in a separate phase from unit tests. Binding to port 0 lets the operating system pick a free port, so tests never collide with each other or with other software. **WireMock** offers the same idea with request matching, recorded responses and fault injection (delays, dropped connections), and is the usual choice in Spring projects.

## 6.3 Databases with Testcontainers

**Testcontainers** starts real dependencies (MySQL, PostgreSQL, Kafka, Redis, LocalStack for AWS) in throwaway Docker containers from test code, waits until they are ready, and gives the test their connection details. It needs Docker, so the example is shown as code:

```text
@Testcontainers
@SpringBootTest
class MeterRepositoryIT {
    @Container
    @ServiceConnection             // Spring Boot 3.1+: wires the datasource
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.4"); // as in prod

    @Autowired MeterRepository repository;

    @Test
    void findsMetersByRegionInTheRealDatabase() {
        repository.save(new Meter("MTR-1", "north"));
        repository.save(new Meter("MTR-2", "south"));
        assertThat(repository.findByRegion("north")).extracting(Meter::id)
                .containsExactly("MTR-1");
    }
}
```

What happens: the extension pulls `mysql:8.4` (once, then cached), starts a container on a random port, waits for MySQL to accept connections, and Spring connects to it; Flyway or Liquibase migrations run against it, so the schema is the production schema. After the test class, the container is removed.

| Practice | Why |
|---|---|
| Pin the same database version as production | Behaviour differs between versions |
| One container per test run (static field, or a shared base class / singleton pattern) | Container start-up takes seconds; per-test containers make suites slow |
| Isolate tests with transactions rolled back, or truncate tables between tests | Shared container, independent tests |
| Run migrations in the test | Tests the real schema, catches broken migrations |
| Tag integration tests and run them in a separate CI stage | Fast feedback from unit tests first |

## 6.4 Other dependencies

The same approach covers every external system a service talks to: run the real thing in a container when it matters, and a stub when only the protocol matters.

| Dependency | Integration-test approach | What it catches |
|---|---|---|
| Kafka | `KafkaContainer` (Testcontainers); consume with a test consumer and await the record | Serialisation, topic names, keys and partitioning, consumer configuration |
| Redis | `GenericContainer("redis:7")` | Expiry, data-structure commands, serialisation |
| AWS (S3, SQS, DynamoDB) | LocalStack container | Bucket and queue wiring, permissions in code, payload formats |
| Third-party HTTP APIs | WireMock or a local stub server | Error handling, retries, timeouts, unexpected payloads |
| Email and SMS | Fake SMTP server container (for example Mailpit), or a recording fake behind your own interface | Template rendering, recipients |
| Time and scheduling | Injected `Clock` and a manual trigger instead of waiting for a scheduler | Off-by-one dates, time zones |

> TIP: Keep integration tests focused on the integration itself. Business rules belong in unit tests; the integration test proves only that the query, the message or the HTTP call works against the real system.

## 6.5 Practical lessons

- Integration tests prove wiring: SQL, serialisation, HTTP, configuration.
- Test against the production engine (Testcontainers), not an imitation such as H2.
- Use stub servers on random ports for HTTP dependencies, including failure cases.
- Share containers across a test run and isolate tests by data, not by restarting infrastructure.

# Chapter 7: Contract and End-to-End Tests
%Consumer-driven contracts between services, provider verification, and keeping end-to-end tests few and valuable

## 7.1 The microservice testing problem

With dozens of services, testing every change against every other service deployed together is slow and flaky. **Contract testing** splits the problem: each consumer records what it needs from a provider (the **contract**), and the provider verifies in its own build that it still satisfies every consumer's contract. Neither side needs the other deployed.

```java junit A consumer contract verified against two provider versions
import org.junit.jupiter.api.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

class Contract {
    // What the billing consumer needs from GET /meters/{id}: field names and types only
    static final Map<String, Class<?>> REQUIRED = new LinkedHashMap<>();   // fixed order
    static {
        REQUIRED.put("meterId", String.class);
        REQUIRED.put("region", String.class);
        REQUIRED.put("kwhToday", Double.class);
    }

    static List<String> violations(Map<String, Object> response) {
        List<String> problems = new ArrayList<>();
        REQUIRED.forEach((field, type) -> {
            if (!response.containsKey(field)) problems.add("missing " + field);
            else if (!type.isInstance(response.get(field)))
                problems.add(field + " is " + response.get(field).getClass().getSimpleName()
                             + ", expected " + type.getSimpleName());
        });
        return problems;
    }
}

class ProviderContractTest {
    Map<String, Object> v1() {
        return Map.of("meterId", "MTR-7", "region", "north", "kwhToday", 12.5);
    }
    // provider "tidies" its API: renames and retypes fields
    Map<String, Object> v2() {
        return Map.of("meterId", "MTR-7", "zone", "north", "kwhToday", "12.5", "status",
                "ok");
    }

    static void satisfies(Map<String, Object> response) {
        List<String> v = Contract.violations(response);
        if (!v.isEmpty()) fail(String.join("; ", v));
    }

    @Test void currentProvider() { satisfies(v1()); }
    @Test void proposedProvider() { satisfies(v2()); }
}
```

The provider's proposed version adds a field (harmless) but renames `region` and turns `kwhToday` into a string; its own build fails before deployment, naming exactly which consumer expectation broke. Tools such as **Pact** (consumer-driven contracts with a broker that stores and versions contracts) and **Spring Cloud Contract** automate generating contracts from consumer tests and verifying them in provider builds; schema registries play the same role for event streams (Kafka guide, Chapter 7).

## 7.2 End-to-end tests

End-to-end (E2E) tests drive the whole deployed system through its UI or public API: browser tests with Playwright or Selenium, API journeys with REST clients. They catch what nothing else can (configuration, routing, cross-service flows) but are slow, expensive and the main source of flakiness.

| Guideline | Why |
|---|---|
| Keep them few: the critical user journeys (sign up, pay, see a bill) | Each one is slow and fragile |
| Make them independent: each creates its own test data | Shared data couples tests and causes flakiness |
| Wait for conditions, never for fixed times | Fixed sleeps are slow when generous and flaky when not (Chapter 8) |
| Run against production-like environments, and some as **synthetic monitoring** in production | Finds environment-specific failures |
| When an E2E test finds a bug, add a lower-level test that would have caught it | Pushes coverage down the pyramid |

## 7.3 Practical lessons

- Contract tests let each service verify compatibility in its own build.
- Consumers specify only what they use; providers may add, but not break.
- Keep end-to-end tests to a handful of critical journeys, independent and condition-based.
- Back every E2E-found bug with a faster test lower in the pyramid.

# Chapter 8: Flaky Tests, Time and Concurrency
%Why tests fail intermittently, controlling time and randomness, waiting for conditions, and forcing race conditions to appear

## 8.1 Causes of flakiness

A **flaky** test passes and fails on the same code. Flakiness destroys trust in the suite: developers rerun until green and start ignoring real failures (the DevOps guide, §2.5, quantifies how quickly a few flaky tests break most pipelines).

| Cause | Example | Fix |
|---|---|---|
| Time | `LocalDate.now()` at midnight; time zones; daylight saving | Inject a fixed `Clock` |
| Randomness | Unseeded random test data | Seed and log the seed |
| Fixed sleeps | `Thread.sleep(500)` then assert | Wait for a condition with a timeout |
| Order dependence | Test B relies on data left by test A | Each test sets up its own state |
| Shared resources | Fixed ports, shared files, shared database rows | Random ports, `@TempDir`, isolated data |
| Concurrency | Races in the code under test or in the test | Deterministic interleavings, proper synchronisation |
| External services | A real third-party sandbox that is sometimes down | Stub servers and contract tests |
| Collection order | Asserting on the order of a `HashSet` or `Map.of` | Compare sets, or sort first |

## 8.2 Controlling time

```java junit A due-date rule tested on any day, including leap years
import org.junit.jupiter.api.*;
import java.time.*;
import static org.junit.jupiter.api.Assertions.*;

class Invoice {
    private final Clock clock;
    Invoice(Clock clock) { this.clock = clock; }
    LocalDate dueDate() {
        return LocalDate.now(clock).plusMonths(1).withDayOfMonth(1).plusDays(14);
    }
    boolean overdue(LocalDate due) { return LocalDate.now(clock).isAfter(due); }
}

class InvoiceTest {
    static Clock on(String date) {
        return Clock.fixed(LocalDate.parse(date).atStartOfDay(ZoneOffset.UTC).toInstant(),
                ZoneOffset.UTC);
    }

    @Test void dueOnThe15thOfNextMonth() {
        assertEquals(LocalDate.parse("2026-11-15"), new Invoice(on("2026-10-31")).dueDate());
    }
    @Test void worksAcrossTheYearEnd() {
        assertEquals(LocalDate.parse("2027-01-15"), new Invoice(on("2026-12-20")).dueDate());
    }
    @Test void worksInALeapYearFebruary() {
        assertEquals(LocalDate.parse("2028-03-15"), new Invoice(on("2028-02-29")).dueDate());
    }
    @Test void notOverdueOnTheDueDate() {
        assertFalse(new Invoice(on("2026-11-15")).overdue(LocalDate.parse("2026-11-15")));
    }
    @Test void overdueTheDayAfter() {
        assertTrue(new Invoice(on("2026-11-16")).overdue(LocalDate.parse("2026-11-15")));
    }
}
```

With the clock injected, the test can be "run" on 31 October, at the year end and on 29 February of a leap year, today and every day, with the same result.

## 8.3 Waiting for conditions instead of sleeping

Asynchronous code (a message consumer, a scheduled job) completes "eventually". A fixed sleep is either too short (flaky) or too long (slow). Poll the condition with a timeout instead; **Awaitility** packages this (`await().atMost(5, SECONDS).until(...)`), and the idea fits in a few lines:

```java junit Polling for a condition versus a fixed sleep
import org.junit.jupiter.api.*;
import java.time.Duration;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.BooleanSupplier;
import static org.junit.jupiter.api.Assertions.*;

class AsyncTest {
    static void awaitUntil(BooleanSupplier condition, Duration timeout)
            throws InterruptedException {
        long deadline = System.nanoTime() + timeout.toNanos();
        while (!condition.getAsBoolean()) {
            if (System.nanoTime() > deadline) fail("condition not met within " + timeout);
            Thread.sleep(10);
        }
    }

    @Test
    void consumerEventuallyMarksTheReadingProcessed() throws Exception {
        AtomicBoolean processed = new AtomicBoolean(false);
        ExecutorService consumer = Executors.newSingleThreadExecutor();
        // takes a variable amount of time
        consumer.submit(() -> {
            try {
                Thread.sleep(ThreadLocalRandom.current().nextInt(50, 300));
            } catch (InterruptedException e) { }
            processed.set(true);
        });
        // returns as soon as it is true
        awaitUntil(processed::get, Duration.ofSeconds(5));
        assertTrue(processed.get());
        consumer.shutdown();
    }
}
```

The test finishes as soon as the work is done (usually well under a second) and only fails if the condition is still false after five seconds, which signals a real problem rather than an unlucky schedule.

## 8.4 Forcing a race to appear

A race condition may show up once in a thousand runs, which makes it both flaky and hard to fix. A test can **force** the bad interleaving with latches, turning an intermittent failure into a deterministic one (the Java Concurrency guide covers the underlying problems).

```java junit A latch forces both threads past the check before either acts
import org.junit.jupiter.api.*;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;

class SeatMap {
    private boolean booked = false;
    private final CountDownLatch bothChecked;
    SeatMap(CountDownLatch bothChecked) { this.bothChecked = bothChecked; }
    boolean bookRacy() throws InterruptedException {
        if (!booked) {                                          // check
            // test hook: wait for the other thread
            bothChecked.countDown(); bothChecked.await(1, TimeUnit.SECONDS);
            booked = true;                                      // act
            return true;
        }
        return false;
    }
    synchronized boolean bookSafe() {
        if (booked) return false;
        booked = true;
        return true;
    }
}

class SeatMapTest {
    int successfulBookings(boolean safe) throws Exception {
        CountDownLatch bothChecked = new CountDownLatch(2);
        SeatMap seats = new SeatMap(bothChecked);
        Callable<Boolean> attempt = () -> safe ? seats.bookSafe() : seats.bookRacy();
        try (ExecutorService pool = Executors.newFixedThreadPool(2)) {
            Future<Boolean> a = pool.submit(attempt), b = pool.submit(attempt);
            return (a.get() ? 1 : 0) + (b.get() ? 1 : 0);
        }
    }

    @Test void racyBookingSellsTheSeatOnce() throws Exception {
        assertEquals(1, successfulBookings(false));
    }
    @Test void synchronizedBookingSellsTheSeatOnce() throws Exception {
        assertEquals(1, successfulBookings(true));
    }
}
```

The latch makes both threads pass the "seat is free" check before either books it, so the racy version double-books **every** time instead of once in a thousand runs; the synchronised version books once. In production code the hook would be replaced by a test seam (an injectable "after check" callback) or by a stress test plus tools such as jcstress; the principle is to make the dangerous interleaving happen on purpose.

## 8.5 Practical lessons

- Track flaky tests and fix their cause; retries hide real bugs.
- Inject clocks and seeds; never depend on the real date, time zone or collection order.
- Poll for conditions with timeouts instead of sleeping.
- Force race conditions deterministically with latches or test seams.
