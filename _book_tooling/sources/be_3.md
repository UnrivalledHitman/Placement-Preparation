# Chapter 7: Testing
%Unit tests with Mockito, web-layer slices with MockMvc, repository slices on a real database, and what each costs

## 7.1 The test pyramid for a Spring application

| Level | Tool | Starts | Speed | Tests |
|---|---|---|---|---|
| Unit | JUnit 5 + Mockito | Nothing: `new` plus mocks | Milliseconds | Business rules in services and domain classes |
| Web slice | `@WebMvcTest` + `MockMvc` | MVC layer only: controllers, advice, JSON, validation | ~1 s | Status codes, JSON shape, validation, error mapping |
| Data slice | `@DataJpaTest` | JPA, an embedded database, repositories | ~2 s | Queries, constraints, mappings |
| Integration | `@SpringBootTest` (+ Testcontainers) | The whole application, a real database in Docker | Seconds | End-to-end flows |

Write many unit tests, a fair number of slice tests and a few integration tests. Constructor injection (Chapter 2) is what makes unit tests trivial: create the class with `new` and pass mocks.

The programs in this chapter run the tests with the **JUnit Platform Launcher** from `main` and print each test's result, which is what Maven's Surefire plugin does when you type `mvn test`.

## 7.2 Unit tests with Mockito

```java spring Unit tests: stubbing, verifying and capturing arguments
package demo;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.*;
import org.junit.jupiter.api.*;
import org.junit.platform.launcher.*;
import org.junit.platform.launcher.core.*;
import org.junit.platform.launcher.listeners.SummaryGeneratingListener;
import org.junit.platform.engine.TestExecutionResult;
import org.junit.platform.engine.discovery.DiscoverySelectors;
import org.mockito.ArgumentCaptor;

public class Main {
    // ---- production code ----
    public interface TariffRepo { Optional<Integer> paisePerUnit(String region); }
    public interface Notifier { void send(String to, String msg); }
    public record Bill(String customer, int units, long paise) {}

    public static class BillingService {
        private final TariffRepo tariffs; private final Notifier notifier;
        BillingService(TariffRepo t, Notifier n) { tariffs = t; notifier = n; }
        public Bill bill(String customer, String region, int units) {
            if (units < 0) throw new IllegalArgumentException("units must be >= 0");
            int rate = tariffs.paisePerUnit(region)
                    .orElseThrow(() -> new NoSuchElementException("no tariff for " + region));
            Bill b = new Bill(customer, units, (long) rate * units);
            if (b.paise() > 500_000)
                notifier.send(customer, "High bill: Rs " + b.paise() / 100);
            return b;
        }
    }

    // ---- tests ----
    @TestMethodOrder(MethodOrderer.DisplayName.class)
    public static class BillingServiceTest {
        TariffRepo tariffs = mock(TariffRepo.class);
        Notifier notifier = mock(Notifier.class);
        BillingService service = new BillingService(tariffs, notifier);

        @Test @DisplayName("1 computes the amount from the tariff")
        void amount() {
            when(tariffs.paisePerUnit("WB")).thenReturn(Optional.of(700));
            assertEquals(new Bill("asha", 250, 175_000), service.bill("asha", "WB", 250));
            verifyNoInteractions(notifier);
        }
        @Test @DisplayName("2 notifies on a high bill with the right message")
        void notifies() {
            when(tariffs.paisePerUnit("WB")).thenReturn(Optional.of(700));
            service.bill("ravi", "WB", 1000);
            ArgumentCaptor<String> msg = ArgumentCaptor.forClass(String.class);
            verify(notifier, times(1)).send(eq("ravi"), msg.capture());
            assertEquals("High bill: Rs 7000", msg.getValue());
        }
        @Test @DisplayName("3 rejects negative units without touching the repository")
        void negative() {
            assertThrows(IllegalArgumentException.class, () -> service.bill("x", "WB", -1));
            verifyNoInteractions(tariffs);
        }
        @Test @DisplayName("4 unknown region fails clearly")
        void unknownRegion() {
            when(tariffs.paisePerUnit(anyString())).thenReturn(Optional.empty());
            var e = assertThrows(NoSuchElementException.class,
                    () -> service.bill("x", "XX", 5));
            assertEquals("no tariff for XX", e.getMessage());
        }
    }

    public static void main(String[] args) {
        var request = LauncherDiscoveryRequestBuilder.request()
                .selectors(DiscoverySelectors.selectClass(BillingServiceTest.class)).build();
        var summary = new SummaryGeneratingListener();
        LauncherFactory.create().execute(request, summary, new TestExecutionListener() {
            public void executionFinished(TestIdentifier id, TestExecutionResult r) {
                if (id.isTest())
                    System.out.println(r.getStatus() + "  " + id.getDisplayName());
            }
        });
        System.out.println("tests run: " + summary.getSummary().getTestsStartedCount()
                + ", failed: " + summary.getSummary().getTestsFailedCount());
    }
}
```

No Spring context is started at all: these tests run in milliseconds. `verifyNoInteractions(tariffs)` in test 3 checks a behaviour, not just a result: invalid input is rejected before any database work.

> TIP: Test behaviour through the public method, and mock only what crosses a boundary (database, network, clock, message broker). Mocking value objects or the class under test itself is a sign that the design needs work.

## 7.3 Web slice: `@WebMvcTest` and MockMvc

`@WebMvcTest(MeterController.class)` starts only the MVC infrastructure and that controller; the service it depends on is replaced with a Mockito mock through `@MockBean`. `MockMvc` sends requests through the real `DispatcherServlet` without opening a port, so JSON conversion, validation and `@RestControllerAdvice` are all exercised.

```java spring Controller tests with MockMvc
package demo;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.Optional;
import org.junit.jupiter.api.*;
import org.junit.platform.engine.TestExecutionResult;
import org.junit.platform.engine.discovery.DiscoverySelectors;
import org.junit.platform.launcher.*;
import org.junit.platform.launcher.core.*;
import org.junit.platform.launcher.listeners.SummaryGeneratingListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.*;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.*;

@SpringBootApplication
public class Main {
    public record MeterView(long id, String serial) {}
    public record NewMeter(@NotBlank @Pattern(regexp = "SM-\\d{3}") String serial) {}
    public interface MeterService {
        Optional<MeterView> find(long id);
        MeterView create(String serial);
    }

    @RestController @RequestMapping("/meters")
    public static class MeterController {
        private final MeterService service;
        MeterController(MeterService service) { this.service = service; }
        @GetMapping("/{id}") ResponseEntity<MeterView> get(@PathVariable long id) {
            return ResponseEntity.of(service.find(id));
        }
        @PostMapping @ResponseStatus(HttpStatus.CREATED)
        MeterView create(@Valid @RequestBody NewMeter in) {
            return service.create(in.serial());
        }
    }

    @WebMvcTest(MeterController.class)
    @TestMethodOrder(MethodOrderer.DisplayName.class)
    public static class MeterControllerTest {
        @Autowired MockMvc mvc;
        @MockBean MeterService service;

        @Test @DisplayName("1 GET existing meter returns 200 and JSON")
        void found() throws Exception {
            when(service.find(7)).thenReturn(Optional.of(new MeterView(7, "SM-007")));
            mvc.perform(get("/meters/7")).andExpect(status().isOk())
                    .andExpect(jsonPath("$.serial").value("SM-007"));
        }
        @Test @DisplayName("2 GET missing meter returns 404")
        void missing() throws Exception {
            when(service.find(9)).thenReturn(Optional.empty());
            mvc.perform(get("/meters/9")).andExpect(status().isNotFound());
        }
        @Test @DisplayName("3 POST valid meter returns 201")
        void create() throws Exception {
            when(service.create("SM-123")).thenReturn(new MeterView(1, "SM-123"));
            mvc.perform(post("/meters").contentType(MediaType.APPLICATION_JSON)
                            .content("{\"serial\":\"SM-123\"}"))
                    .andExpect(status().isCreated()).andExpect(jsonPath("$.id").value(1));
        }
        @Test @DisplayName("4 POST invalid serial returns 400 and never calls the service")
        void invalid() throws Exception {
            mvc.perform(post("/meters").contentType(MediaType.APPLICATION_JSON)
                    .content("{\"serial\":\"meter-1\"}")).andExpect(status().isBadRequest());
            verifyNoInteractions(service);
        }
    }

    public static void main(String[] args) {
        System.setProperty("spring.autoconfigure.exclude",
                "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration");
        var request = LauncherDiscoveryRequestBuilder.request()
                .selectors(DiscoverySelectors.selectClass(MeterControllerTest.class)).build();
        var summary = new SummaryGeneratingListener();
        LauncherFactory.create().execute(request, summary, new TestExecutionListener() {
            public void executionFinished(TestIdentifier id, TestExecutionResult r) {
                if (id.isTest())
                    System.out.println(r.getStatus() + "  " + id.getDisplayName());
            }
        });
        System.out.println("tests run: " + summary.getSummary().getTestsStartedCount()
                + ", failed: " + summary.getSummary().getTestsFailedCount());
    }
}
```

> NOTE: Spring Boot 3.4 deprecates `@MockBean` in favour of `@MockitoBean` (from Spring Framework 6.2). The idea is identical: a mock registered as a bean in the test's application context.

## 7.4 Data slice: `@DataJpaTest`

`@DataJpaTest` starts JPA with an embedded database and runs **each test in a transaction that is rolled back at the end**, so tests do not see each other's data. Use it to test custom queries and constraints, which mocks cannot test.

```java spring Repository tests: queries, constraints and automatic rollback
package demo;

import static org.junit.jupiter.api.Assertions.*;

import jakarta.persistence.*;
import java.util.*;
import org.junit.jupiter.api.*;
import org.junit.platform.engine.TestExecutionResult;
import org.junit.platform.engine.discovery.DiscoverySelectors;
import org.junit.platform.launcher.*;
import org.junit.platform.launcher.core.*;
import org.junit.platform.launcher.listeners.SummaryGeneratingListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(considerNestedRepositories = true)
public class Main {
    @Entity @Table(uniqueConstraints = @UniqueConstraint(columnNames = {"meter", "ts"}))
    public static class Reading {
        @Id @GeneratedValue Long id;
        String meter; long ts; double kwh;
        protected Reading() {}
        Reading(String m, long t, double k) { meter = m; ts = t; kwh = k; }
    }
    public interface ReadingRepo extends JpaRepository<Reading, Long> {
        List<Reading> findByMeterAndTsBetweenOrderByTs(String meter, long from, long to);
    }

    @DataJpaTest(showSql = false)                      // the default true echoes every SQL
    @TestMethodOrder(MethodOrderer.DisplayName.class)
    public static class ReadingRepoTest {
        @Autowired ReadingRepo repo;

        @Test @DisplayName("1 range query returns only that meter, in order")
        void range() {
            repo.saveAll(List.of(new Reading("SM-1", 300, 3), new Reading("SM-1", 100, 1),
                    new Reading("SM-2", 200, 9), new Reading("SM-1", 900, 4)));
            var r = repo.findByMeterAndTsBetweenOrderByTs("SM-1", 0, 500);
            assertEquals(List.of(100L, 300L), r.stream().map(x -> x.ts).toList());
        }
        @Test @DisplayName("2 duplicate (meter, ts) violates the unique constraint")
        void duplicate() {
            repo.saveAndFlush(new Reading("SM-1", 100, 1));
            assertThrows(DataIntegrityViolationException.class,
                    () -> repo.saveAndFlush(new Reading("SM-1", 100, 2)));
        }
        @Test @DisplayName("3 each test starts empty: the others were rolled back")
        void isolated() { assertEquals(0, repo.count()); }
    }

    public static void main(String[] args) {
        var request = LauncherDiscoveryRequestBuilder.request()
                .selectors(DiscoverySelectors.selectClass(ReadingRepoTest.class)).build();
        var summary = new SummaryGeneratingListener();
        LauncherFactory.create().execute(request, summary, new TestExecutionListener() {
            public void executionFinished(TestIdentifier id, TestExecutionResult r) {
                if (id.isTest())
                    System.out.println(r.getStatus() + "  " + id.getDisplayName());
            }
        });
        System.out.println("tests run: " + summary.getSummary().getTestsStartedCount()
                + ", failed: " + summary.getSummary().getTestsFailedCount());
    }
}
```

Test 3 passes even though it runs after tests that inserted rows: each test's transaction was rolled back. Notice `saveAndFlush` in test 2: with plain `save`, the insert would wait in the persistence context until commit, which never happens in a rolled-back test, and the constraint violation would never be seen.

## 7.5 Integration tests with Testcontainers

H2 is convenient but it is not PostgreSQL: SQL dialect, locking and constraint behaviour differ. For integration tests, **Testcontainers** starts the real database in Docker for the duration of the test run. This program is not executed here because the build machine has no Docker.

```java
// Not executed here: requires Docker.
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class MeterApiIT {
    @Container
    @ServiceConnection                       // Spring Boot 3.1+: wires the datasource URL
    static PostgreSQLContainer<?> db = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired TestRestTemplate rest;

    @Test
    void createsAndReadsMeter() {
        var created = rest.postForEntity("/meters", Map.of("serial", "SM-001"), Map.class);
        assertEquals(HttpStatus.CREATED, created.getStatusCode());
        var read = rest.getForEntity(created.getHeaders().getLocation(), Map.class);
        assertEquals("SM-001", read.getBody().get("serial"));
    }
}
```

## 7.6 Practical lessons

- Unit-test services with `new` and Mockito; they should be the bulk of your tests.
- `@WebMvcTest` for HTTP behaviour (status codes, JSON, validation); `@DataJpaTest` for queries and constraints.
- `@DataJpaTest` rolls back each test; use `saveAndFlush` to trigger database constraints inside it.
- Run important integration tests against the real database engine with Testcontainers.

# Chapter 8: Observability and Production Readiness
%Health checks, metrics, correlation ids in logs, and the settings that matter when the service runs for real

## 8.1 Actuator

Spring Boot Actuator adds operational endpoints under `/actuator`. Only `health` is exposed over HTTP by default; expose others deliberately (`management.endpoints.web.exposure.include=health,info,metrics,prometheus`) and protect them.

| Endpoint | Shows | Used by |
|---|---|---|
| `/actuator/health` | UP/DOWN, aggregated from health indicators (database, disk, custom) | Load balancers, Kubernetes probes |
| `/actuator/health/liveness`, `/readiness` | Separate probes: "restart me" versus "do not send traffic yet" | Kubernetes |
| `/actuator/metrics` | Micrometer metrics: JVM, HTTP requests, connection pool, custom | Dashboards, alerts |
| `/actuator/prometheus` | The same metrics in Prometheus format (needs `micrometer-registry-prometheus`) | Prometheus scraping |
| `/actuator/info` | Build version, git commit | Deployments |

The program adds a custom health indicator (is meter data arriving?), a custom counter, and a filter that tags every request with a **correlation id** returned in a response header and placed in the logging context (MDC), so that every log line of one request can be found together.

```java spring Health, a custom metric and a correlation id
package demo;

import io.micrometer.core.instrument.*;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.concurrent.atomic.AtomicLong;
import org.slf4j.MDC;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.actuate.health.*;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.context.WebServerApplicationContext;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.filter.OncePerRequestFilter;

@SpringBootApplication(excludeName =
        "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration")
public class Main {
    static final AtomicLong SECONDS_SINCE_LAST_READING = new AtomicLong(30);

    @Component("ingest")
    public static class IngestHealth implements HealthIndicator {
        public Health health() {
            long lag = SECONDS_SINCE_LAST_READING.get();
            return (lag <= 300 ? Health.up() : Health.down())
                    .withDetail("secondsSinceLastReading", lag).build();
        }
    }

    @Component
    public static class CorrelationFilter extends OncePerRequestFilter {
        private final AtomicLong next = new AtomicLong(1000);    // a UUID in production
        @Override protected void doFilterInternal(HttpServletRequest req,
                HttpServletResponse res, FilterChain chain)
                throws ServletException, IOException {
            String id = req.getHeader("X-Correlation-Id");
            if (id == null) id = "req-" + next.incrementAndGet();
            MDC.put("cid", id);                          // %X{cid} in the log pattern
            res.setHeader("X-Correlation-Id", id);
            try { chain.doFilter(req, res); } finally { MDC.remove("cid"); }
        }
    }

    @RestController
    public static class ReadingApi {
        private final Counter accepted;
        ReadingApi(MeterRegistry registry) {
            accepted = Counter.builder("readings.accepted").tag("source", "http")
                    .description("Meter readings accepted").register(registry);
        }
        @PostMapping("/readings") String add() { accepted.increment(); return "ok"; }
    }

    static HttpClient http = HttpClient.newHttpClient();
    static String base;
    static HttpResponse<String> call(String method, String path, String cid)
            throws Exception {
        var b = HttpRequest.newBuilder(URI.create(base + path))
                .method(method, HttpRequest.BodyPublishers.noBody());
        if (cid != null) b.header("X-Correlation-Id", cid);
        return http.send(b.build(), HttpResponse.BodyHandlers.ofString());
    }
    public static void main(String[] args) throws Exception {
        var ctx = SpringApplication.run(Main.class, "--server.port=0",
                "--management.endpoints.web.exposure.include=health,metrics",
                "--management.endpoint.health.show-details=always",
                "--management.health.diskspace.enabled=false");
        int port = ((WebServerApplicationContext) ctx).getWebServer().getPort();
        base = "http://localhost:" + port;
        System.out.println("health: " + call("GET", "/actuator/health", null).body());
        SECONDS_SINCE_LAST_READING.set(900);                     // data stopped arriving
        var down = call("GET", "/actuator/health", null);
        System.out.println("health: " + down.statusCode() + " " + down.body());
        for (int i = 0; i < 3; i++) call("POST", "/readings", null);
        String m = call("GET", "/actuator/metrics/readings.accepted", null).body();
        String measurements = m.replaceAll(".*\"measurements\":(\\[[^]]*]).*", "$1");
        System.out.println("metric: " + measurements);
        var generated = call("POST", "/readings", null).headers();
        var propagated = call("POST", "/readings", "gw-42").headers();
        String header = "X-Correlation-Id";
        System.out.println("generated id: " + generated.firstValue(header).get());
        System.out.println("propagated id: " + propagated.firstValue(header).get());
        ctx.close();
    }
}
```

When the custom indicator reports DOWN, the whole health endpoint answers **503 Service Unavailable**, so a load balancer stops sending traffic to this instance. The counter shows the three accepted readings. A correlation id sent by the caller (an API gateway, say) is kept; otherwise one is generated, and either way it is returned to the client for support tickets.

> TRAP: Health checks used for **liveness** must not depend on external systems. If the database is down and liveness fails, Kubernetes restarts every instance, which does not fix the database and adds a restart storm. Put dependencies in readiness, not liveness.

## 8.2 Logging

| Practice | Why |
|---|---|
| SLF4J API (`LoggerFactory.getLogger`), Logback by default | One API, swappable backend |
| Parameterised messages: `log.info("meter {} offline", id)` | No string building when the level is disabled |
| Structured JSON logs in production (`logging.structured.format.console=ecs` in Boot 3.4) | Searchable fields in ELK/Loki |
| Correlation id in MDC | Follow one request across log lines and services |
| Levels: ERROR (needs action), WARN (unexpected, handled), INFO (business events), DEBUG (diagnostics) | Alerts on ERROR stay meaningful |
| Never log passwords, tokens, full card numbers or personal data | Security and privacy law |

## 8.3 Settings that matter in production

| Setting | Recommended | Reason |
|---|---|---|
| `server.shutdown=graceful` | On | Finish in-flight requests before stopping |
| `spring.jpa.open-in-view` | `false` | Chapter 4.5 |
| `spring.jpa.hibernate.ddl-auto` | `validate` | Flyway/Liquibase own the schema |
| `spring.datasource.hikari.maximum-pool-size` | Sized to the database, not to the thread count (often 10–20) | More connections than the database can serve make everything slower |
| `server.tomcat.threads.max` | Default 200; or virtual threads (`spring.threads.virtual.enabled=true`, Java 21) | Blocking I/O without exhausting platform threads |
| Timeouts on every outgoing HTTP call | Connect 1–2 s, read a few seconds | A slow dependency must not hold all threads (System Design guide, reliability chapter) |

## 8.4 Practical lessons

- Expose health and metrics deliberately; add indicators for the things that make your service useless when they fail.
- Count business events with Micrometer, not only technical ones.
- Put a correlation id in the MDC and in a response header for every request.
- Graceful shutdown, no open session in view, sized connection pools, timeouts everywhere.

# Chapter 9: Packaging and Deployment
%From a fat jar to a container image, local environments with Docker Compose, configuration per environment, and CI

## 9.1 The executable jar

`mvn package` with the Spring Boot Maven plugin produces a **fat jar**: your classes plus every dependency, runnable with `java -jar target/meter-1.0.jar`. Configuration comes from outside the jar (environment variables, arguments, mounted files), so the same artefact runs in every environment: the twelve-factor principle "build once, configure per environment".

## 9.2 A container image

A multi-stage Dockerfile builds the jar in a JDK image and runs it in a smaller JRE image, as a non-root user. Spring Boot can also build an image without a Dockerfile (`mvn spring-boot:build-image`, using Cloud Native Buildpacks).

```text
# Dockerfile (not executed here: requires Docker)
FROM eclipse-temurin:21-jdk AS build
WORKDIR /src
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN ./mvnw -q dependency:go-offline           # cached layer: dependencies change rarely
COPY src src
RUN ./mvnw -q package -DskipTests

FROM eclipse-temurin:21-jre
RUN useradd --system app
USER app
WORKDIR /app
COPY --from=build /src/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
```

| Line | Reason |
|---|---|
| Two stages | The JDK and Maven are not shipped in the final image: smaller and safer |
| Copy `pom.xml` before `src` | Dependency download is cached until the POM changes |
| Non-root user | A compromised process cannot modify the image |
| `MaxRAMPercentage=75` | The JVM sizes its heap from the container's memory limit |

## 9.3 Local environment with Docker Compose

```text
# compose.yaml (not executed here)
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: meters
      POSTGRES_USER: meter
      POSTGRES_PASSWORD: change-me
    ports: ["5432:5432"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U meter -d meters"]
      interval: 5s
  api:
    build: .
    depends_on:
      db: { condition: service_healthy }
    environment:
      SPRING_PROFILES_ACTIVE: prod
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/meters
      SPRING_DATASOURCE_USERNAME: meter
      SPRING_DATASOURCE_PASSWORD: change-me
      JWT_SECRET: ${JWT_SECRET}
    ports: ["8080:8080"]
```

Environment variables like `SPRING_DATASOURCE_URL` override `spring.datasource.url` by relaxed binding (Chapter 1.4). Spring Boot 3.1+ can also start `compose.yaml` services automatically during development with the `spring-boot-docker-compose` dependency.

## 9.4 Continuous integration

```text
# .github/workflows/ci.yml (sketch)
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: 21, cache: maven }
      - run: ./mvnw -B verify          # compile, unit + slice tests, Testcontainers ITs
```

## 9.5 Practical lessons

- One artefact for every environment; configuration from the environment, secrets from a secret store.
- Multi-stage image, non-root user, dependency layer cached, heap sized from the container limit.
- Compose for local dependencies; CI runs `mvn verify` on every push.
