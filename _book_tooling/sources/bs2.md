## Part 5 solutions

### B5.1 401 or 403?

| Case | Status | Reason |
|---|---|---|
| (a) No header | 401 | Not authenticated |
| (b) Expired JWT | 401 | Credentials invalid now; the client should refresh and retry |
| (c) USER on an ADMIN endpoint | 403 | Authenticated, not allowed |
| (d) Wrong signing key | 401 | The token proves nothing; treat as unauthenticated |
| (e) ADMIN token, ownership rule fails | 403 | Authenticated, not allowed by the method rule (some APIs answer 404 to hide that the resource exists) |
| (f) Wrong password at login | 401 | Authentication failed; use the same message for "no such user" and "wrong password" |

### B5.2 Ownership with @PreAuthorize

```java spring-security Owner, other user, admin and anonymous
package demo;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Base64;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.context.WebServerApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.bind.annotation.*;

@SpringBootApplication(excludeName =
        "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration")
@EnableMethodSecurity
public class Main {
    @Bean InMemoryUserDetailsManager users() {
        var enc = PasswordEncoderFactories.createDelegatingPasswordEncoder();
        return new InMemoryUserDetailsManager(
                User.withUsername("asha").password(enc.encode("pw-a")).roles("USER").build(),
                User.withUsername("ravi").password(enc.encode("pw-r")).roles("USER").build(),
                User.withUsername("admin").password(enc.encode("pw-x")).roles("ADMIN")
                        .build());
    }
    @Bean SecurityFilterChain chain(HttpSecurity http) throws Exception {
        return http.authorizeHttpRequests(a -> a.anyRequest().authenticated())
                .httpBasic(Customizer.withDefaults()).csrf(c -> c.disable()).build();
    }
    @RestController
    public static class Usage {
        @GetMapping("/consumers/{name}/usage")
        @PreAuthorize("#name == authentication.name or hasRole('ADMIN')")
        String usage(@PathVariable String name) { return name + " used 26.5 kWh"; }
    }

    public static void main(String[] args) throws Exception {
        var ctx = SpringApplication.run(Main.class, "--server.port=0");
        int port = ((WebServerApplicationContext) ctx).getWebServer().getPort();
        HttpClient http = HttpClient.newHttpClient();
        String[][] who = {{"asha", "pw-a"}, {"ravi", "pw-r"}, {"admin", "pw-x"},
                          {null, null}};
        for (String[] w : who) {
            var b = HttpRequest.newBuilder(
                    URI.create("http://localhost:" + port + "/consumers/asha/usage"));
            if (w[0] != null) b.header("Authorization", "Basic " + Base64.getEncoder()
                    .encodeToString((w[0] + ":" + w[1]).getBytes()));
            var r = http.send(b.build(), HttpResponse.BodyHandlers.ofString());
            String body = r.statusCode() == 200 ? " " + r.body() : "";
            System.out.printf("%-9s reads asha's usage -> %d%s%n",
                    w[0] == null ? "anonymous" : w[0], r.statusCode(), body);
        }
        ctx.close();
    }
}
```

The expression refers to the method parameter `#name`, which works because the code is compiled with `-parameters` (Spring Boot's Maven setup does this by default). With HTTP Basic configured, Spring Security sends a proper 401 challenge to anonymous callers, so no custom entry point is needed here, unlike the stateless JWT chain in the guide.

### B5.3 Login throttling

```java spring Three failures lock the account for 15 minutes
package demo;

import java.time.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.stereotype.Service;

@SpringBootApplication(excludeName =
        "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration")
public class Main {
    static class TestClock extends Clock {
        Instant now = Instant.parse("2026-10-07T10:00:00Z");
        public Instant instant() { return now; }
        public ZoneId getZone() { return ZoneOffset.UTC; }
        public Clock withZone(ZoneId z) { return this; }
    }
    record Attempts(int failures, Instant lockedUntil) {}

    @Service
    public static class LoginService {
        private final Map<String, String> passwords = Map.of("asha", "secret");
        private final Map<String, Attempts> attempts = new ConcurrentHashMap<>();
        final TestClock clock = new TestClock();             // injected as a bean in practice

        public int login(String user, String password) {      // returns an HTTP status
            Instant now = clock.instant();
            Attempts a = attempts.getOrDefault(user, new Attempts(0, Instant.MIN));
            if (now.isBefore(a.lockedUntil())) return 429;    // check the lock first
            if (password.equals(passwords.get(user))) { attempts.remove(user); return 200; }
            int f = a.failures() + 1;
            attempts.put(user, f >= 3 ? new Attempts(0, now.plus(Duration.ofMinutes(15)))
                                      : new Attempts(f, Instant.MIN));
            return 401;
        }
    }
    public static void main(String[] args) {
        String[] noWeb = {"--spring.main.web-application-type=none"};
        try (var ctx = SpringApplication.run(Main.class, noWeb)) {
            LoginService s = ctx.getBean(LoginService.class);
            String[] tries = {"x", "y", "z", "secret"};
            StringBuilder sb = new StringBuilder();
            for (String p : tries) sb.append(s.login("asha", p)).append(' ');
            System.out.println("3 wrong, then right: " + sb.toString().trim());
            s.clock.now = s.clock.now.plus(Duration.ofMinutes(14));
            System.out.println("after 14 min, right password: " + s.login("asha", "secret"));
            s.clock.now = s.clock.now.plus(Duration.ofMinutes(2));
            System.out.println("after 16 min, right password: " + s.login("asha", "secret"));
            System.out.println("then wrong once: " + s.login("asha", "x")
                    + ", then right: " + s.login("asha", "secret") + " (counter was reset)");
        }
    }
}
```

The lock is checked **before** the password, so a correct password during the lock still gets 429: otherwise an attacker could keep guessing and learn when a guess was right. In production the counters live in Redis or the database (shared by all instances), and a second limit per IP address stops one attacker from locking out many accounts.

### B5.4 JWT design questions

| Question | Answer |
|---|---|
| (a) Where in a browser? | Access token in memory (a JavaScript variable); refresh token in an `HttpOnly`, `Secure`, `SameSite` cookie. `localStorage` is readable by any injected script (XSS) |
| (b) Logout with stateless JWTs | Short access-token lifetime (5–15 min) + revoke the refresh token on the server; for immediate revocation, a deny-list of token ids (`jti`) checked until their expiry |
| (c) HS256 or RS256 for ten services | RS256 (or ES256): the auth service signs with a private key, services verify with the public key (published as JWKS). With HS256 every verifier holds the secret and could forge tokens |
| (d) Payload | Subject, roles or scopes, issuer, audience, expiry, token id. Never passwords, personal data you would not show the user, or secrets: the payload is only Base64-encoded |
| (e) Short access + refresh | A stolen access token is useful for minutes only; the refresh token is used rarely, can be rotated on every use and revoked, so theft is detectable |

## Part 6 solutions

### B6.1 Parameterised tests for the tariff

```java spring Boundary values with @ParameterizedTest
package demo;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.platform.engine.TestExecutionResult;
import org.junit.platform.engine.discovery.DiscoverySelectors;
import org.junit.platform.launcher.*;
import org.junit.platform.launcher.core.*;
import org.junit.platform.launcher.listeners.SummaryGeneratingListener;

public class Main {
    static long billPaise(double units) {              // from the guide, Chapter 10
        long u = Math.round(units);
        long[][] slabs = {{100, 500}, {200, 700}, {Long.MAX_VALUE, 900}};
        long left = u, paise = 0;
        for (long[] s : slabs) {
            long take = Math.min(left, s[0]);
            paise += take * s[1];
            left -= take;
        }
        return paise;
    }

    public static class TariffTest {
        @ParameterizedTest(name = "{0} units -> {1} paise")
        @CsvSource({"0, 0", "1, 500", "100, 50000", "101, 50700", "300, 190000",
                    "301, 190900", "1000, 820000"})
        void slabs(double units, long expected) { assertEquals(expected, billPaise(units)); }

        @Test @DisplayName("fractional units round half-up")
        void rounding() {
            assertEquals(billPaise(100), billPaise(99.5));
            assertEquals(billPaise(99), billPaise(99.49));
        }
    }

    public static void main(String[] args) {
        var request = LauncherDiscoveryRequestBuilder.request()
                .selectors(DiscoverySelectors.selectClass(TariffTest.class)).build();
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

The cases sit on both sides of every slab boundary (100/101, 300/301), which is where off-by-one errors live. Expected values come from the definition, not from running the code: 301 units = 100 × 500 + 200 × 700 + 1 × 900 = 190 900 paise.

### B6.2 Assert the error contract

```java spring The problem-detail contract under test
package demo;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
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
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@SpringBootApplication
public class Main {
    public record NewMeter(@NotBlank @Pattern(regexp = "SM-\\d{3}") String serial,
                           @NotBlank String consumer) {}
    public interface Meters { Optional<String> consumerOf(String serial); }
    static class NotFound extends RuntimeException { NotFound(String m) { super(m); } }

    @RestController
    public static class Api {
        private final Meters meters;
        Api(Meters m) { meters = m; }
        @PostMapping("/meters") @ResponseStatus(HttpStatus.CREATED)
        NewMeter create(@Valid @RequestBody NewMeter in) { return in; }
        @GetMapping("/meters/{serial}") String get(@PathVariable String serial) {
            return meters.consumerOf(serial)
                    .orElseThrow(() -> new NotFound("No meter " + serial));
        }
    }
    @RestControllerAdvice
    public static class Errors {
        @ExceptionHandler(MethodArgumentNotValidException.class)
        ProblemDetail invalid(MethodArgumentNotValidException e) {
            ProblemDetail p = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
            Map<String, String> f = new TreeMap<>();
            e.getBindingResult().getFieldErrors()
                    .forEach(x -> f.put(x.getField(), x.getDefaultMessage()));
            p.setProperty("fields", f);
            return p;
        }
        @ExceptionHandler(NotFound.class) ProblemDetail nf(NotFound e) {
            return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @WebMvcTest(Api.class)
    @TestMethodOrder(MethodOrderer.DisplayName.class)
    public static class ErrorContractTest {
        @Autowired MockMvc mvc;
        @MockBean Meters meters;

        @Test @DisplayName("1 invalid body: 400 problem+json naming both fields")
        void invalid() throws Exception {
            mvc.perform(post("/meters").contentType(MediaType.APPLICATION_JSON)
                            .content("{\"serial\":\"X\",\"consumer\":\"\"}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                    .andExpect(jsonPath("$.status").value(400))
                    .andExpect(jsonPath("$.fields.serial").exists())
                    .andExpect(jsonPath("$.fields.consumer").value("must not be blank"));
        }
        @Test @DisplayName("2 missing meter: 404 with a detail message")
        void missing() throws Exception {
            when(meters.consumerOf("SM-404")).thenReturn(Optional.empty());
            mvc.perform(get("/meters/SM-404"))
                    .andExpect(status().isNotFound())
                    .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                    .andExpect(jsonPath("$.detail").value("No meter SM-404"));
        }
    }

    public static void main(String[] args) {
        System.setProperty("spring.autoconfigure.exclude",
                "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration");
        var request = LauncherDiscoveryRequestBuilder.request()
                .selectors(DiscoverySelectors.selectClass(ErrorContractTest.class)).build();
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

These tests pin down the **error contract** that clients depend on: the media type, the status and the field names. A refactoring that accidentally changes the error format now breaks a test instead of a mobile app.

### B6.3 Measure latency with a Timer

```java spring A Micrometer Timer with fixed durations
package demo;

import io.micrometer.core.instrument.Timer;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

public class Main {
    public static void main(String[] args) {
        SimpleMeterRegistry registry = new SimpleMeterRegistry();
        Timer t = Timer.builder("ingest.latency").tag("endpoint", "readings")
                .register(registry);
        long[] ms = {20, 22, 19, 25, 21, 23, 20, 24, 22, 900};     // one slow request
        for (long m : ms) t.record(Duration.ofMillis(m));
        System.out.printf("count %d, total %.0f ms, mean %.1f ms, max %.0f ms%n", t.count(),
                t.totalTime(TimeUnit.MILLISECONDS), t.mean(TimeUnit.MILLISECONDS),
                t.max(TimeUnit.MILLISECONDS));
        long[] sorted = ms.clone();
        java.util.Arrays.sort(sorted);
        System.out.println("median " + sorted[sorted.length / 2] + " ms, p90 (9th of 10) "
                + sorted[8] + " ms");
    }
}
```

The mean of 109.6 ms describes no real request: nine took about 20 ms and one took 900 ms. Alert on percentiles (p95, p99) and the maximum instead; Micrometer computes them with `.publishPercentiles(0.95, 0.99)` or, better, publishes histogram buckets so that Prometheus can aggregate percentiles across instances.

### B6.4 Liveness or readiness?

| Check | Probe | Reason |
|---|---|---|
| (a) JVM answers HTTP | Liveness | If it cannot, a restart helps |
| (b) Pool gets a connection | Readiness | Stop sending traffic while the database is unreachable; restarting would not help |
| (c) Cache warm-up finished | Readiness (start-up) | Do not serve until warm |
| (d) Payment API slow | Neither | Handle with timeouts and a circuit breaker; failing probes would take healthy instances out |
| (e) All request threads deadlocked | Liveness | Only a restart recovers; make sure the liveness endpoint runs on a thread that is not deadlocked too |
| (f) Log disk 99 % full | Neither (alert) | An operator must act; restarting does not free the disk |

## Part 7 solutions

### B7.1 Concurrent duplicate uploads

```java spring Retry the batch once when the unique constraint fires
package demo;

import jakarta.persistence.*;
import java.util.*;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

@SpringBootApplication
@EnableJpaRepositories(considerNestedRepositories = true)
public class Main {
    @Entity @Table(uniqueConstraints = @UniqueConstraint(columnNames = {"meter", "ts"}))
    public static class Reading {
        @Id @GeneratedValue Long id; String meter; long ts; double kwh;
        protected Reading() {}
        Reading(String m, long t, double k) { meter = m; ts = t; kwh = k; }
    }
    public interface ReadingRepo extends JpaRepository<Reading, Long> {
        @Query("select r.ts from Main$Reading r where r.meter = :m and r.ts in :ts")
        List<Long> existing(String m, Collection<Long> ts);
    }
    public record Result(int accepted, int duplicates, int attempts) {}

    @Service
    public static class Ingest {
        private final ReadingRepo repo;
        private final TransactionTemplate tx, txNew;
        Runnable raceOnce;                                      // test hook
        Ingest(ReadingRepo r, PlatformTransactionManager tm) {
            repo = r; tx = new TransactionTemplate(tm); txNew = new TransactionTemplate(tm);
            txNew.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        }
        public Result ingest(String meter, Map<Long, Double> batch) {
            for (int attempt = 1; ; attempt++) {
                try {
                    int a = attempt;
                    return tx.execute(s -> {
                        Set<Long> seen = new HashSet<>(repo.existing(meter, batch.keySet()));
                        if (raceOnce != null) {          // the other request commits now
                            Runnable r = raceOnce; raceOnce = null;
                            txNew.executeWithoutResult(s2 -> r.run());
                        }
                        int acc = 0, dup = 0;
                        for (var e : new TreeMap<>(batch).entrySet()) {
                            if (!seen.add(e.getKey())) { dup++; continue; }
                            repo.save(new Reading(meter, e.getKey(), e.getValue()));
                            acc++;
                        }
                        repo.flush();                          // surface the violation here
                        return new Result(acc, dup, a);
                    });
                } catch (DataIntegrityViolationException e) {
                    if (attempt == 2) throw e;           // the retry sees the other rows
                }
            }
        }
    }
    public static void main(String[] args) {
        String[] noWeb = {"--spring.main.web-application-type=none"};
        try (var ctx = SpringApplication.run(Main.class, noWeb)) {
            Ingest ingest = ctx.getBean(Ingest.class);
            ReadingRepo repo = ctx.getBean(ReadingRepo.class);
            Map<Long, Double> batch = Map.of(900L, 1.0, 1800L, 1.5, 2700L, 0.5, 3600L, 2.0);
            ingest.raceOnce = () -> {                    // a parallel retry stores 2 rows
                repo.save(new Reading("SM-001", 900, 1.0));
                repo.save(new Reading("SM-001", 1800, 1.5));
            };
            System.out.println("racing upload: " + ingest.ingest("SM-001", batch));
            System.out.println("rows stored: " + repo.count());
            System.out.println("plain retry:   " + ingest.ingest("SM-001", batch));
        }
    }
}
```

The first attempt checked for existing rows before the racer committed, then tried to insert all four and hit the unique constraint: the transaction rolled back completely. The second attempt reads the two rows the racer stored and inserts only the other two. Total rows: 4, every reading exactly once, and the reported counts add up. The unique constraint is the real guarantee; the pre-check only makes the common case cheap.

### B7.2 Bill in Indian time

```java run Month boundaries in UTC versus IST
import java.time.*;
import java.util.*;

public class Main {
    record Reading(Instant ts, double kwh) {}
    public static void main(String[] args) {
        ZoneId ist = ZoneId.of("Asia/Kolkata");
        List<Reading> rs = List.of(
                new Reading(Instant.parse("2026-09-30T17:00:00Z"), 1.0),  // 22:30 IST Sep 30
                new Reading(Instant.parse("2026-09-30T20:00:00Z"), 2.0),  // 01:30 IST Oct 1
                new Reading(Instant.parse("2026-10-15T08:00:00Z"), 3.0),
                new Reading(Instant.parse("2026-10-31T19:00:00Z"), 4.0)); // 00:30 IST Nov 1
        Map<YearMonth, Double> utc = new TreeMap<>(), local = new TreeMap<>();
        for (Reading r : rs) {
            utc.merge(YearMonth.from(r.ts().atZone(ZoneOffset.UTC)), r.kwh(), Double::sum);
            local.merge(YearMonth.from(r.ts().atZone(ist)), r.kwh(), Double::sum);
        }
        System.out.println("by UTC month: " + utc);
        System.out.println("by IST month: " + local);
        Instant r2 = rs.get(1).ts();
        System.out.println(r2 + " is " + r2.atZone(ist).toLocalDateTime() + " in India");
    }
}
```

Two of the four readings change month: anything between 18:30 and 24:00 UTC on the last day of a month is already the next month in India. Store instants in UTC, and convert to the consumer's zone only when deciding which day or month a reading belongs to. In the guide's design, compute the `reading_day` column with the consumer's zone at ingestion.

### B7.3 Silent-meter alert

```java spring Meters with no reading in the last 6 hours
package demo;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Service;

@SpringBootApplication
@EnableJpaRepositories(considerNestedRepositories = true)
public class Main {
    @Entity public static class Meter {
        @Id @GeneratedValue Long id; String serial;
        protected Meter() {}
        Meter(String s) { serial = s; }
    }
    @Entity public static class Reading {
        @Id @GeneratedValue Long id;
        @ManyToOne(fetch = FetchType.LAZY) Meter meter;
        Instant ts;
        protected Reading() {}
        Reading(Meter m, Instant t) { meter = m; ts = t; }
    }
    public interface MeterRepo extends JpaRepository<Meter, Long> {
        @Query("select m.serial from Main$Meter m where not exists "
                + "(select r from Main$Reading r where r.meter = m and r.ts > :cutoff) "
                + "order by m.serial")
        List<String> silentSince(Instant cutoff);
    }
    public interface ReadingRepo extends JpaRepository<Reading, Long> {}

    @Service
    public static class SilentMeterJob {
        private final MeterRepo meters; private final Clock clock;
        SilentMeterJob(MeterRepo m) {
            meters = m;
            clock = Clock.fixed(Instant.parse("2026-10-07T12:00:00Z"), ZoneOffset.UTC);
        }
        // @Scheduled(fixedRate = 15, timeUnit = TimeUnit.MINUTES) with @EnableScheduling
        public List<String> run() {
            return meters.silentSince(clock.instant().minus(Duration.ofHours(6)));
        }
    }
    public static void main(String[] args) {
        String[] noWeb = {"--spring.main.web-application-type=none"};
        try (var ctx = SpringApplication.run(Main.class, noWeb)) {
            MeterRepo meters = ctx.getBean(MeterRepo.class);
            ReadingRepo readings = ctx.getBean(ReadingRepo.class);
            Meter a = meters.save(new Meter("SM-001")), b = meters.save(new Meter("SM-002"));
            meters.save(new Meter("SM-003"));                         // never reported
            readings.save(new Reading(a, Instant.parse("2026-10-07T11:45:00Z")));
            readings.save(new Reading(b, Instant.parse("2026-10-07T04:30:00Z")));
            System.out.println("silent for 6 h: " + ctx.getBean(SilentMeterJob.class).run());
        }
    }
}
```

`NOT EXISTS` finds both cases at once: SM-002, whose last reading is 7.5 hours old, and SM-003, which has never reported. A `max(ts) < cutoff` query with `GROUP BY` would miss SM-003, because a meter with no readings forms no group. With many meters, an index on `(meter_id, ts)` makes each existence check one index probe.

### B7.4 Scale the ingestion

```java run The back-of-envelope numbers
public class Main {
    public static void main(String[] args) {
        long meters = 1_000_000, perHour = 4;
        long readingsPerDay = meters * perHour * 24;
        double readingsPerSec = readingsPerDay / 86_400.0;
        double requestsPerSec = meters / 3600.0;              // one batch per meter per hour
        double bytesPerDay = readingsPerDay * 40 * 3.0;       // data + 2x indexes
        System.out.printf("readings/day %,d -> %.0f readings/s average%n",
                readingsPerDay, readingsPerSec);
        System.out.printf("requests/s %.0f average (batches of %d readings)%n",
                requestsPerSec, perHour);
        System.out.printf("storage %.1f GB/day, %.2f TB/year%n", bytesPerDay / 1e9,
                bytesPerDay * 365 / 1e12);
    }
}
```

| Part of the design | What changes first |
|---|---|
| Request handling | ~280 requests/s on average is easy for a few instances, but meters synchronise (all upload at :00), so peaks can be 10–50×: add jitter on the device side, and accept uploads into a queue (Kafka) instead of writing synchronously |
| Database writes | ~1 100 rows/s average with peaks of tens of thousands: batch inserts (`SEQUENCE` ids, JDBC batching), or a time-series database (TimescaleDB, ClickHouse) |
| Storage | ~11.5 GB/day, ~4 TB/year: partition by month, compress or downsample old partitions (15-minute data → hourly after a year), archive to object storage |
| Aggregates | Querying raw rows for monthly bills becomes slow: maintain a `daily_usage` table, recomputed for days that receive late data |
| Idempotency check | The per-batch existence query stays cheap only with the `(meter, ts)` index; at this scale the unique constraint plus "insert, ignore conflicts" (`ON CONFLICT DO NOTHING`) replaces the pre-check |
