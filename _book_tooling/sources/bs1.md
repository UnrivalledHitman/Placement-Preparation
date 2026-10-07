# Solutions

## Part 1 solutions

### B1.1 Pick the annotation

| Case | Answer | Why |
|---|---|---|
| (a) `Clock` as a bean | `@Bean Clock clock()` in a `@Configuration` class | You cannot annotate a JDK class; a factory method creates it |
| (b) Business rules | `@Service` | A component; the name documents its role |
| (c) Data access | `@Repository` | Adds translation of persistence exceptions to `DataAccessException` (Spring Data repositories get it automatically) |
| (d) Default of two gateways | `@Primary` on one of them (or `@Qualifier` at the injection point) | Resolves the ambiguity |
| (e) Only when a property is set | `@ConditionalOnProperty(name = "app.sms.enabled", havingValue = "true")` | Conditional registration |
| (f) After start-up | A `CommandLineRunner`/`ApplicationRunner` bean, or `@EventListener(ApplicationReadyEvent.class)` | Runs once the whole context is ready (`@PostConstruct` runs too early, before other beans are ready) |

### B1.2 Which value wins?

```java spring Property precedence
package demo;

import java.util.Map;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(excludeName =
        "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration")
public class Main {
    static String port(String... args) {
        SpringApplication app = new SpringApplication(Main.class);
        app.setDefaultProperties(Map.of("server.port", "8080"));     // lowest priority
        app.setWebApplicationType(org.springframework.boot.WebApplicationType.NONE);
        try (var ctx = app.run(args)) {
            return ctx.getEnvironment().getProperty("server.port");
        }
    }
    public static void main(String[] args) {
        System.setProperty("server.port", "9090");
        String arg = "--server.port=7070";
        System.out.println("default + system property + argument -> " + port(arg));
        System.out.println("default + system property            -> " + port());
        System.clearProperty("server.port");
        System.out.println("default only                         -> " + port());
    }
}
```

Command-line arguments beat Java system properties, which beat environment variables, configuration files and defaults. This is why the same jar can be pointed at any environment from the outside.

### B1.3 Bind a tariff from configuration

```java spring A validated list of slabs from properties
package demo;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.*;
import org.springframework.validation.annotation.Validated;

@SpringBootApplication(excludeName =
        "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration")
@EnableConfigurationProperties(Main.Tariff.class)
public class Main {
    public record Slab(@Positive long upto, @PositiveOrZero long paise) {}
    @Validated @ConfigurationProperties("tariff")
    public record Tariff(@NotEmpty List<@Valid Slab> slabs) {
        long bill(long units) {
            long left = units, total = 0;
            for (Slab s : slabs) {
                long take = Math.min(left, s.upto());
                total += take * s.paise();
                left -= take;
            }
            return total;
        }
    }
    static void start(String... props) {
        String[] args = new String[props.length + 1];
        args[0] = "--spring.main.web-application-type=none";
        System.arraycopy(props, 0, args, 1, props.length);
        try (var ctx = SpringApplication.run(Main.class, args)) {
            Tariff t = ctx.getBean(Tariff.class);
            long rupees = t.bill(250) / 100;
            System.out.println(t.slabs().size() + " slabs, 250 units = Rs " + rupees);
        } catch (Exception e) {
            Throwable root = e;
            while (root.getCause() != null) root = root.getCause();
            System.out.println("refused to start: " + root.getClass().getSimpleName());
        }
    }
    public static void main(String[] args) {
        start("--tariff.slabs[0].upto=100", "--tariff.slabs[0].paise=500",
              "--tariff.slabs[1].upto=200", "--tariff.slabs[1].paise=700",
              "--tariff.slabs[2].upto=1000000", "--tariff.slabs[2].paise=900");
        start("--tariff.slabs[0].upto=100", "--tariff.slabs[0].paise=-5");
        start();
    }
}
```

Without `@Valid` inside `List<@Valid Slab>`, the element constraints are not checked: only the list itself is validated, and a negative price would be accepted. Rs 1 550 for 250 units matches the guide's slab check.

### B1.4 A circular dependency

```java spring A constructor cycle, and the fix by extraction
package demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@SpringBootApplication(excludeName =
        "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration")
public class Main {
    // ---- the cycle ----
    @Service @Profile("cycle")
    public static class BillingService {
        final NotificationService n;
        BillingService(NotificationService n) { this.n = n; }
        long amountDue(String c) { return 175_000; }
    }
    @Service @Profile("cycle")
    public static class NotificationService {
        final BillingService b;
        NotificationService(BillingService b) { this.b = b; }
    }
    // ---- the fix: both depend on a third bean; no cycle ----
    @Service @Profile("!cycle")
    public static class AmountLookup { long amountDue(String c) { return 175_000; } }
    @Service @Profile("!cycle")
    public static class Notifier {
        private final AmountLookup amounts;
        Notifier(AmountLookup a) { amounts = a; }
        String reminder(String c) { return c + ", you owe Rs " + amounts.amountDue(c) / 100; }
    }
    @Service @Profile("!cycle")
    public static class Billing {
        private final AmountLookup amounts; private final Notifier notifier;
        Billing(AmountLookup a, Notifier n) { amounts = a; notifier = n; }
        String run(String c) { return notifier.reminder(c); }
    }

    public static void main(String[] args) {
        String noWeb = "--spring.main.web-application-type=none";
        String cycle = "--spring.profiles.active=cycle";
        try (var ctx = SpringApplication.run(Main.class, noWeb, cycle)) {
            System.out.println("started?!");
        } catch (Exception e) {
            Throwable root = e;
            while (root.getCause() != null) root = root.getCause();
            System.out.println("cycle: " + root.getClass().getSimpleName());
        }
        try (var ctx = SpringApplication.run(Main.class, noWeb)) {
            System.out.println("fixed: " + ctx.getBean(Billing.class).run("Asha"));
        }
    }
}
```

With constructor injection a cycle cannot be built at all: to create `BillingService` Spring needs a finished `NotificationService`, which needs a finished `BillingService`. Spring Boot reports the cycle at start-up, which is a feature: field injection or `@Lazy` would hide a design problem. The fix extracts what both sides needed (the amount lookup) into its own bean, so the dependency graph becomes a tree.

### B1.5 Who destroys a prototype?

```java spring @PreDestroy runs for singletons only
package demo;

import jakarta.annotation.PreDestroy;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@SpringBootApplication(excludeName =
        "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration")
public class Main {
    @Component
    public static class Pool {
        @PreDestroy void close() { System.out.println("Pool closed"); }
    }

    @Component @Scope("prototype")
    public static class Export {
        @PreDestroy void close() { System.out.println("Export file closed"); }
    }
    public static void main(String[] args) {
        String[] noWeb = {"--spring.main.web-application-type=none"};
        var ctx = SpringApplication.run(Main.class, noWeb);
        ctx.getBean(Export.class);
        ctx.getBean(Export.class);
        System.out.println("closing the context");
        ctx.close();
        System.out.println("done");
    }
}
```

Only the singleton's callback runs. Spring creates and configures a prototype, hands it to the caller and keeps no reference to it, so it cannot destroy it. A prototype that holds a resource (file, connection) must be closed by the code that requested it, typically with `try`-with-resources by implementing `AutoCloseable`.

## Part 2 solutions

### B2.1 Choose the status code

| Case | Status |
|---|---|
| (a) Created | 201 Created (with `Location`) |
| (b) Deleted | 204 No Content |
| (c) Missing | 404 Not Found |
| (d) Invalid body | 400 Bad Request (some APIs use 422 Unprocessable Content for semantic errors) |
| (e) Duplicate serial | 409 Conflict |
| (f) Valid token, not allowed | 403 Forbidden |
| (g) No token | 401 Unauthorized |
| (h) Database down | 503 Service Unavailable (500 if it is an unexpected failure) |
| (i) Too many requests | 429 Too Many Requests, with `Retry-After` |

### B2.2 A PATCH endpoint

```java spring PATCH with an allow-list of fields
package demo;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.context.WebServerApplicationContext;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@SpringBootApplication(excludeName =
        "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration")
public class Main {
    public record Meter(long id, String serial, String location, String consumer) {}

    @RestController
    public static class MeterApi {
        private static final Set<String> PATCHABLE = Set.of("location", "consumer");
        private final Map<Long, Meter> store = new ConcurrentHashMap<>(
                Map.of(1L, new Meter(1, "SM-001", "Howrah", "Asha")));

        @PatchMapping("/meters/{id}")
        ResponseEntity<?> patch(@PathVariable long id,
                                @RequestBody Map<String, Object> body) {
            Meter m = store.get(id);
            if (m == null) return ResponseEntity.notFound().build();
            Set<String> unknown = new TreeSet<>(body.keySet());
            unknown.removeAll(PATCHABLE);
            if (!unknown.isEmpty()) return problem("Fields cannot be changed: " + unknown);
            for (var e : body.entrySet())
                if (!(e.getValue() instanceof String s) || s.isBlank())
                    return problem(e.getKey() + " must be a non-blank string");
            Meter updated = new Meter(m.id(), m.serial(),
                    (String) body.getOrDefault("location", m.location()),
                    (String) body.getOrDefault("consumer", m.consumer()));
            store.put(id, updated);
            return ResponseEntity.ok(updated);
        }
        static ResponseEntity<ProblemDetail> problem(String detail) {
            return ResponseEntity.badRequest()
                    .body(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, detail));
        }
    }

    public static void main(String[] args) throws Exception {
        var ctx = SpringApplication.run(Main.class, "--server.port=0");
        int port = ((WebServerApplicationContext) ctx).getWebServer().getPort();
        HttpClient http = HttpClient.newHttpClient();
        String[][] calls = {
            {"1", "{\"location\":\"Kolkata\"}"}, {"1", "{\"serial\":\"SM-999\"}"},
            {"1", "{\"consumer\":\"  \"}"}, {"7", "{\"location\":\"Kolkata\"}"}};
        for (String[] c : calls) {
            URI uri = URI.create("http://localhost:" + port + "/meters/" + c[0]);
            var req = HttpRequest.newBuilder(uri)
                    .header("Content-Type", "application/json")
                    .method("PATCH", HttpRequest.BodyPublishers.ofString(c[1])).build();
            var r = http.send(req, HttpResponse.BodyHandlers.ofString());
            String body = r.body().replaceAll(",\"instance\":\"[^\"]*\"", "")
                    .replace("\"type\":\"about:blank\",", "");
            System.out.println("PATCH /meters/" + c[0] + " " + c[1] + " -> " + r.statusCode()
                    + " " + body);
        }
        ctx.close();
    }
}
```

Binding a PATCH body to a `Map` keeps "absent" and "null" apart, which a DTO with nullable fields cannot do. The allow-list rejects attempts to change `serial` or `id` (mass assignment). For larger APIs, the standard formats are JSON Merge Patch (RFC 7396) and JSON Patch (RFC 6902).

### B2.3 Paginated, sorted readings

```java spring Pageable in, a page DTO out
package demo;

import jakarta.persistence.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.context.WebServerApplicationContext;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.web.bind.annotation.*;

@SpringBootApplication
@EnableJpaRepositories(considerNestedRepositories = true)
public class Main {
    @Entity public static class Reading {
        @Id @GeneratedValue Long id;
        String serial; long ts; double kwh;
        protected Reading() {}
        Reading(String s, long t, double k) { serial = s; ts = t; kwh = k; }
    }
    public interface ReadingRepo extends JpaRepository<Reading, Long> {
        Page<Reading> findBySerial(String serial, Pageable pageable);
    }
    public record ReadingView(long ts, double kwh) {}
    public record PageView<T>(List<T> items, int page, int size, long totalItems,
                              int totalPages) {}

    @RestController
    public static class Api {
        private final ReadingRepo repo;
        Api(ReadingRepo repo) { this.repo = repo; }
        @GetMapping("/meters/{serial}/readings")
        PageView<ReadingView> list(@PathVariable String serial, Pageable pageable) {
            Page<Reading> p = repo.findBySerial(serial, pageable);
            return new PageView<>(p.map(r -> new ReadingView(r.ts, r.kwh)).getContent(),
                    p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages());
        }
    }

    public static void main(String[] args) throws Exception {
        var ctx = SpringApplication.run(Main.class, "--server.port=0");
        ReadingRepo repo = ctx.getBean(ReadingRepo.class);
        for (int i = 1; i <= 7; i++) repo.save(new Reading("SM-001", i * 900L, i * 0.5));
        repo.save(new Reading("SM-002", 900, 9.9));
        int port = ((WebServerApplicationContext) ctx).getWebServer().getPort();
        HttpClient http = HttpClient.newHttpClient();
        for (String q : List.of("page=0&size=3&sort=ts,desc", "page=2&size=3&sort=ts,desc")) {
            URI uri = URI.create("http://localhost:" + port + "/meters/SM-001/readings?" + q);
            var r = http.send(HttpRequest.newBuilder(uri).build(),
                    HttpResponse.BodyHandlers.ofString());
            System.out.println(q + " -> " + r.body());
        }
        ctx.close();
    }
}
```

Spring binds `page`, `size` and `sort` into the `Pageable` parameter. Returning a small record instead of `Page` keeps the JSON contract under your control (Spring Data 3.3 itself warns that serialising `PageImpl` directly is not a stable format). The last page holds the single remaining reading.

### B2.4 Idempotency keys

```java spring Replaying the stored response for a repeated key
package demo;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.context.WebServerApplicationContext;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@SpringBootApplication(excludeName =
        "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration")
public class Main {
    record Stored(String requestBody, int status, String responseBody) {}

    @RestController
    public static class Payments {
        final AtomicInteger charges = new AtomicInteger();
        private final Map<String, Stored> byKey = new ConcurrentHashMap<>();

        @PostMapping("/payments")
        ResponseEntity<String> pay(@RequestHeader(value = "Idempotency-Key", required = false)
                                   String key, @RequestBody String body) {
            if (key == null)
                return ResponseEntity.badRequest().body("Idempotency-Key required");
            Stored s = byKey.computeIfAbsent(key, k -> {        // atomic per key
                int id = charges.incrementAndGet();         // the real charge happens once
                return new Stored(body, 201, "{\"payment\":" + id + ",\"status\":\"PAID\"}");
            });
            if (!s.requestBody().equals(body))
                return ResponseEntity.unprocessableEntity()
                        .body("key reused with another body");
            return ResponseEntity.status(s.status()).body(s.responseBody());
        }
    }

    public static void main(String[] args) throws Exception {
        var ctx = SpringApplication.run(Main.class, "--server.port=0");
        int port = ((WebServerApplicationContext) ctx).getWebServer().getPort();
        HttpClient http = HttpClient.newHttpClient();
        String[][] calls = {{"k-1", "{\"paise\":50000}"}, {"k-1", "{\"paise\":50000}"},
                {"k-1", "{\"paise\":99999}"}, {null, "{\"paise\":50000}"},
                {"k-2", "{\"paise\":50000}"}};
        for (String[] c : calls) {
            URI uri = URI.create("http://localhost:" + port + "/payments");
            var b = HttpRequest.newBuilder(uri)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(c[1]));
            if (c[0] != null) b.header("Idempotency-Key", c[0]);
            var r = http.send(b.build(), HttpResponse.BodyHandlers.ofString());
            System.out.printf("key=%-4s %-16s -> %d %s%n", c[0], c[1], r.statusCode(),
                    r.body());
        }
        System.out.println("charges made: " + ctx.getBean(Payments.class).charges.get());
        ctx.close();
    }
}
```

Five requests, two charges: the retry of `k-1` replays the stored 201 response. `computeIfAbsent` on a `ConcurrentHashMap` makes "check and charge" atomic for one key, so even two simultaneous retries charge once. In production the store is a database table (or Redis) with a unique key and an expiry, and the stored request is a hash of the body rather than the body itself.

### B2.5 Endpoints for EV charging

| Purpose | Method and path | Success | Notes |
|---|---|---|---|
| List stations near a point | `GET /stations?lat=..&lng=..&radiusKm=5` | 200 | Paginated |
| Station details with connectors | `GET /stations/{id}` | 200 | Connectors embedded |
| Live availability | `GET /stations/{id}/availability` | 200 | Short cache (`Cache-Control: max-age=10`) |
| Reserve a connector | `POST /reservations` `{connectorId, from, minutes}` | 201 | 409 if the slot is taken; **`Idempotency-Key` required** so a retried tap does not reserve twice |
| Cancel a reservation | `DELETE /reservations/{id}` | 204 | 404 if unknown, 409 if already started |
| Reservation expiry | — | — | Server-side job; `GET /reservations/{id}` shows `EXPIRED` |
| Start charging | `POST /sessions` `{reservationId or connectorId}` | 201 | 409 if connector busy |
| Stop charging | `PATCH /sessions/{id}` `{"status":"STOPPED"}` (or `POST /sessions/{id}/stop`) | 200 | Idempotent: stopping a stopped session returns the same final state |
| Energy so far | `GET /sessions/{id}` | 200 | kWh, cost so far |
| Invoices | `GET /invoices?from=..&to=..`, `GET /invoices/{id}` | 200 | Amounts in paise |

## Part 3 solutions

### B3.1 N+1 on the many side

```java spring Twelve readings, four meters: 5 statements, then 1
package demo;

import jakarta.persistence.*;
import java.util.*;
import org.hibernate.SessionFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@SpringBootApplication
@EnableJpaRepositories(considerNestedRepositories = true)
public class Main {
    @Entity public static class Meter {
        @Id @GeneratedValue Long id; String serial;
        protected Meter() {}
        Meter(String s) { serial = s; }
        public String getSerial() { return serial; }   // call through a method, see below
    }
    @Entity public static class Reading {
        @Id @GeneratedValue Long id;
        @ManyToOne(fetch = FetchType.LAZY) Meter meter;
        double kwh;
        protected Reading() {}
        Reading(Meter m, double k) { meter = m; kwh = k; }
    }
    public interface MeterRepo extends JpaRepository<Meter, Long> {}
    public interface ReadingRepo extends JpaRepository<Reading, Long> {
        @Query("select r from Main$Reading r join fetch r.meter order by r.id")
        List<Reading> findAllWithMeter();
    }
    @Service
    public static class Listing {
        private final ReadingRepo repo;
        Listing(ReadingRepo repo) { this.repo = repo; }
        @Transactional(readOnly = true)
        public Set<String> serials(boolean fetch) {
            List<Reading> rs = fetch ? repo.findAllWithMeter() : repo.findAll();
            Set<String> out = new TreeSet<>();
            for (Reading r : rs) out.add(r.meter.getSerial());  // initialises the lazy proxy
            return out;
        }
    }
    public static void main(String[] args) {
        try (var ctx = SpringApplication.run(Main.class,
                "--spring.main.web-application-type=none",
                "--spring.jpa.properties.hibernate.generate_statistics=true")) {
            MeterRepo meters = ctx.getBean(MeterRepo.class);
            ReadingRepo readings = ctx.getBean(ReadingRepo.class);
            for (int m = 1; m <= 4; m++) {
                Meter meter = meters.save(new Meter("SM-00" + m));
                for (int i = 0; i < 3; i++) readings.save(new Reading(meter, m + i));
            }
            var stats = ctx.getBean(EntityManagerFactory.class).unwrap(SessionFactory.class)
                    .getStatistics();
            for (boolean fetch : new boolean[]{false, true}) {
                stats.clear();
                Set<String> s = ctx.getBean(Listing.class).serials(fetch);
                System.out.println((fetch ? "join fetch" : "findAll   ") + " -> " + s
                        + ", statements " + stats.getPrepareStatementCount());
            }
        }
    }
}
```

> TRAP: The first version of this solution read `r.meter.serial` (the field) and crashed with a `NullPointerException`. `r.meter` is a Hibernate **lazy proxy**: a subclass instance whose own fields are empty; only a method call triggers loading and is forwarded to the real entity. Inside entity classes, field access is fine; from outside, go through methods. (The guide's Chapter 2 showed the same trap with Spring's proxies.)

The N+1 here is 1 + **4**, not 1 + 12: the persistence context loads each distinct meter once and reuses it for the other readings of that meter. With many readings per meter that makes the many side less dramatic than the one-to-many case of the guide, but with thousands of distinct meters it is the same problem.

### B3.2 A projection report

```java spring Top 3 meters by consumption in one query
package demo;

import jakarta.persistence.*;
import java.util.*;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

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
        double kwh;
        protected Reading() {}
        Reading(Meter m, double k) { meter = m; kwh = k; }
    }
    public record TopMeter(String serial, double kwh) {}
    public interface MeterRepo extends JpaRepository<Meter, Long> {}
    public interface ReadingRepo extends JpaRepository<Reading, Long> {
        @Query("select new demo.Main$TopMeter(r.meter.serial, sum(r.kwh)) "
                + "from Main$Reading r group by r.meter.serial "
                + "order by sum(r.kwh) desc, r.meter.serial")
        List<TopMeter> top(Pageable limit);
    }
    public static void main(String[] args) {
        String[] noWeb = {"--spring.main.web-application-type=none"};
        try (var ctx = SpringApplication.run(Main.class, noWeb)) {
            MeterRepo meters = ctx.getBean(MeterRepo.class);
            ReadingRepo readings = ctx.getBean(ReadingRepo.class);
            double[][] usage = {{1, 2}, {5, 5, 1}, {4}, {3, 3}, {9, 0.5}};
            for (int i = 0; i < usage.length; i++) {
                Meter m = meters.save(new Meter("SM-00" + (i + 1)));
                for (double k : usage[i]) readings.save(new Reading(m, k));
            }
            readings.top(PageRequest.of(0, 3)).forEach(t ->
                    System.out.printf("%s %.1f kWh%n", t.serial(), t.kwh()));
        }
    }
}
```

The constructor expression produces records directly from the aggregated rows; no `Reading` or `Meter` entity is loaded, and the database does the summing. Ties are broken by serial so that the order is stable.

### B3.3 Batch fetching

```java spring 1 + 12 statements, or 1 + 3 with a batch size of 5
package demo;

import jakarta.persistence.*;
import java.util.*;
import org.hibernate.SessionFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@SpringBootApplication
@EnableJpaRepositories(considerNestedRepositories = true)
public class Main {
    @Entity public static class Meter {
        @Id @GeneratedValue Long id;
        @OneToMany(mappedBy = "meter", cascade = CascadeType.ALL)
        List<Reading> readings = new ArrayList<>();
    }
    @Entity public static class Reading {
        @Id @GeneratedValue Long id;
        @ManyToOne(fetch = FetchType.LAZY) Meter meter;
        double kwh;
    }
    public interface MeterRepo extends JpaRepository<Meter, Long> {}
    @Service
    public static class Totals {
        private final MeterRepo repo;
        Totals(MeterRepo r) { repo = r; }
        @Transactional(readOnly = true)
        public double total() {
            double t = 0;
            for (Meter m : repo.findAll()) for (Reading r : m.readings) t += r.kwh;
            return t;
        }
    }
    static void run(String batch) {
        try (var ctx = SpringApplication.run(Main.class,
                "--spring.main.web-application-type=none",
                "--spring.jpa.properties.hibernate.generate_statistics=true",
                "--spring.jpa.properties.hibernate.default_batch_fetch_size=" + batch)) {
            MeterRepo repo = ctx.getBean(MeterRepo.class);
            for (int i = 0; i < 12; i++) {
                Meter m = new Meter();
                for (int k = 1; k <= 2; k++) {
                    Reading r = new Reading(); r.meter = m; r.kwh = k; m.readings.add(r);
                }
                repo.save(m);
            }
            var stats = ctx.getBean(EntityManagerFactory.class).unwrap(SessionFactory.class)
                    .getStatistics();
            stats.clear();
            double t = ctx.getBean(Totals.class).total();
            System.out.println("batch size " + batch + ": total " + t + ", statements "
                    + stats.getPrepareStatementCount());
        }
    }
    public static void main(String[] args) { run("1"); run("5"); }
}
```

With batching, Hibernate loads the readings of up to 5 meters per query with `WHERE meter_id IN (?, ?, ?, ?, ?)`: 1 query for the meters plus ⌈12 / 5⌉ = 3 batch queries. Unlike a fetch join, this works with pagination of the parents, which is why many teams set a global batch size of 25–100.

### B3.4 Mapping vocabulary

| Item | Answer |
|---|---|
| (a) Default fetch | `@ManyToOne`, `@OneToOne`: EAGER. `@OneToMany`, `@ManyToMany`: LAZY. Recommendation: make everything LAZY and fetch per use case |
| (b) Owning side | The side with the foreign key, the `@ManyToOne`. `@OneToMany(mappedBy = "meter")` is the inverse side: changing only the collection does not change the database |
| (c) `cascade = ALL` vs `orphanRemoval` | Cascade propagates operations (persist, remove, merge) from parent to children; orphan removal deletes a child that is removed **from the collection** |
| (d) No-argument constructor | JPA creates entities by reflection before filling fields; it may be `protected` |
| (e) IDENTITY vs SEQUENCE | IDENTITY gets the id only after each `INSERT`, which prevents JDBC batch inserts; SEQUENCE (with `allocationSize` 50) hands out ids in blocks and allows batching |

### B3.5 Bulk update and a stale context

```java spring Fifty updates or one, and clearAutomatically
package demo;

import jakarta.persistence.*;
import java.util.*;
import org.hibernate.SessionFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@SpringBootApplication
@EnableJpaRepositories(considerNestedRepositories = true)
public class Main {
    @Entity public static class Meter {
        @Id @GeneratedValue Long id; String location; int tariff;
    }
    public interface MeterRepo extends JpaRepository<Meter, Long> {
        List<Meter> findByLocation(String l);
        @Modifying @Query("update Main$Meter m set m.tariff = :t where m.location = :l")
        int bulkStale(String l, int t);
        @Modifying(clearAutomatically = true)
        @Query("update Main$Meter m set m.tariff = :t where m.location = :l")
        int bulkFresh(String l, int t);
    }
    @Service
    public static class Tariffs {
        private final MeterRepo repo;
        Tariffs(MeterRepo r) { repo = r; }
        @Transactional public void oneByOne(int t) {
            repo.findByLocation("Howrah").forEach(m -> m.tariff = t);
        }
        @Transactional public String bulk(int t, boolean clear) {
            Meter first = repo.findByLocation("Howrah").get(0);    // now managed, tariff old
            int n = clear ? repo.bulkFresh("Howrah", t) : repo.bulkStale("Howrah", t);
            int seen = repo.findById(first.id).get().tariff;    // context, or database?
            return n + " rows updated, then reading meter 1 gives tariff " + seen;
        }
    }
    public static void main(String[] args) {
        try (var ctx = SpringApplication.run(Main.class,
                "--spring.main.web-application-type=none",
                "--spring.jpa.properties.hibernate.generate_statistics=true")) {
            MeterRepo repo = ctx.getBean(MeterRepo.class);
            for (int i = 0; i < 50; i++) {
                Meter m = new Meter(); m.location = "Howrah"; m.tariff = 700; repo.save(m);
            }
            var stats = ctx.getBean(EntityManagerFactory.class).unwrap(SessionFactory.class)
                    .getStatistics();
            Tariffs t = ctx.getBean(Tariffs.class);
            stats.clear(); t.oneByOne(750);
            System.out.println("entity by entity: statements "
                    + stats.getPrepareStatementCount());
            stats.clear(); String r = t.bulk(800, false);
            System.out.println("bulk update:      statements "
                    + stats.getPrepareStatementCount());
            System.out.println("  without clear: " + r);
            System.out.println("  with clear:    " + t.bulk(850, true));
        }
    }
}
```

Loading and modifying costs one `SELECT` plus 50 `UPDATE`s (51 statements). The bulk version needs two: the `SELECT` that loads the meters for this demonstration and one `UPDATE` for all 50 rows (the following `findById` is answered from the persistence context without any query, which is exactly the problem). The bulk update goes straight to the database: meter 1 was already in the persistence context with tariff 750, so `findById` returns the stale managed object and reports 750, although the database holds 800. `clearAutomatically = true` empties the context after the update, so the next read goes to the database and sees 850.

## Part 4 solutions

### B4.1 Will it roll back?

| Case | Rolled back? | Reason |
|---|---|---|
| (a) Runtime exception | Yes | Default rule |
| (b) `IOException` (checked) | **No**, commits | Checked exceptions do not trigger rollback by default |
| (c) Caught and logged | **No** | The proxy never sees an exception |
| (d) `@Transactional` private method | **No transaction at all** | Proxies cannot intercept private methods; unless the caller is itself transactional, each repository call commits on its own |
| (e) Called via `this` | **No transaction at all** | Self-invocation bypasses the proxy |
| (f) `rollbackFor = Exception.class` with `IOException` | Yes | The rule includes checked exceptions |

### B4.2 Fix self-invocation properly

```java spring REQUIRES_NEW ignored by self-invocation, and the fix
package demo;

import jakarta.persistence.*;
import java.util.List;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;

@SpringBootApplication
@EnableJpaRepositories(considerNestedRepositories = true)
public class Main {
    @Entity public static class Report { @Id @GeneratedValue Long id; String meter; }
    public interface ReportRepo extends JpaRepository<Report, Long> {}

    @Service
    public static class OneReport {                           // the fix: a separate bean
        private final ReportRepo repo;
        OneReport(ReportRepo r) { repo = r; }
        @Transactional(propagation = Propagation.REQUIRES_NEW)
        public void generate(String meter) {
            Report r = new Report(); r.meter = meter; repo.save(r);
            if (meter.equals("SM-3"))
                throw new IllegalStateException("bad data for " + meter);
        }
    }
    @Service
    public static class Reports {
        private final ReportRepo repo; private final OneReport one;
        Reports(ReportRepo r, OneReport o) { repo = r; one = o; }

        @Transactional public void buggyAll(List<String> meters) {
            for (String m : meters) {
                try { generateOne(m); } catch (IllegalStateException e) { /* skip */ }
            }
        }
        @Transactional(propagation = Propagation.REQUIRES_NEW)    // ignored: called via this
        public void generateOne(String meter) {
            Report r = new Report(); r.meter = meter; repo.save(r);
            if (meter.equals("SM-3"))
                throw new IllegalStateException("bad data for " + meter);
        }
        @Transactional public void fixedAll(List<String> meters) {
            for (String m : meters) {
                try { one.generate(m); } catch (IllegalStateException e) { /* skip */ }
            }
        }
    }
    public static void main(String[] args) {
        String[] noWeb = {"--spring.main.web-application-type=none"};
        try (var ctx = SpringApplication.run(Main.class, noWeb)) {
            Reports reports = ctx.getBean(Reports.class);
            ReportRepo repo = ctx.getBean(ReportRepo.class);
            List<String> meters = List.of("SM-1", "SM-2", "SM-3", "SM-4");
            try { reports.buggyAll(meters); } catch (Exception e) {
                System.out.println("buggy: " + e.getClass().getSimpleName());
            }
            System.out.println("buggy: reports stored = " + repo.count());
            repo.deleteAll();
            reports.fixedAll(meters);
            System.out.println("fixed: reports stored = " + repo.count()
                    + " (SM-3 rolled back alone)");
        }
    }
}
```

In the buggy version, `generateOne` runs inside the outer transaction. When SM-3 throws, the exception passes through no proxy and the catch swallows it, so the outer transaction commits all four rows, **including the bad SM-3 report**: the opposite of the intended behaviour. (If the exception had passed through a transactional proxy of the same transaction, it would instead have been marked rollback-only and every report would be lost with an `UnexpectedRollbackException`.) Moving `generate` into its own bean makes `REQUIRES_NEW` effective: SM-3 rolls back alone and the other three are kept.

### B4.3 An atomic transfer

```java spring Debit and credit in one transaction
package demo;

import jakarta.persistence.*;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@SpringBootApplication
@EnableJpaRepositories(considerNestedRepositories = true)
public class Main {
    @Entity public static class Wallet {
        @Id String owner; long paise; boolean blocked;
        protected Wallet() {}
        Wallet(String o, long p, boolean b) { owner = o; paise = p; blocked = b; }
    }
    public interface WalletRepo extends JpaRepository<Wallet, String> {}

    @Service
    public static class Transfers {
        private final WalletRepo repo;
        Transfers(WalletRepo r) { repo = r; }
        @Transactional
        public void transfer(String from, String to, long paise) {
            Wallet a = repo.findById(from).orElseThrow(), b = repo.findById(to).orElseThrow();
            if (a.paise < paise) throw new IllegalStateException("insufficient credit");
            a.paise -= paise;                                   // debit happens first
            if (b.blocked) throw new IllegalStateException(to + " is blocked");
            b.paise += paise;
        }
    }
    static void show(WalletRepo repo) {
        StringBuilder sb = new StringBuilder();
        for (Wallet w : repo.findAll(org.springframework.data.domain.Sort.by("owner")))
            sb.append(w.owner).append('=').append(w.paise).append(' ');
        System.out.println("  balances " + sb.toString().trim());
    }
    public static void main(String[] args) {
        String[] noWeb = {"--spring.main.web-application-type=none"};
        try (var ctx = SpringApplication.run(Main.class, noWeb)) {
            WalletRepo repo = ctx.getBean(WalletRepo.class);
            repo.save(new Wallet("asha", 10_000, false));
            repo.save(new Wallet("ravi", 2_000, false));
            repo.save(new Wallet("meera", 0, true));
            Transfers t = ctx.getBean(Transfers.class);
            t.transfer("asha", "ravi", 3_000);
            System.out.println("asha -> ravi 3000: ok"); show(repo);
            try { t.transfer("asha", "meera", 3_000); } catch (IllegalStateException e) {
                System.out.println("asha -> meera 3000: " + e.getMessage());
            }
            show(repo);
        }
    }
}
```

The debit of the failed transfer was already applied to the managed `Wallet` object, but the runtime exception rolled the transaction back, so it was never written: Asha still has 7 000 paise. Money never disappears and never doubles. Under concurrent transfers, add `@Version` to `Wallet` (or lock both rows in a fixed order to avoid deadlocks, see the LLD guide's lock-ordering section).

### B4.4 Retry on optimistic-lock conflicts

```java spring Each attempt a fresh transaction, outside the retry loop
package demo;

import jakarta.persistence.*;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

@SpringBootApplication
@EnableJpaRepositories(considerNestedRepositories = true)
public class Main {
    @Entity public static class Wallet { @Id Long id; long paise; @Version long version; }
    public interface WalletRepo extends JpaRepository<Wallet, Long> {}

    @Service
    public static class TopUps {
        private final WalletRepo repo;
        private final TransactionTemplate tx, txNew;
        Runnable interferenceOnce = null;                     // test hook: simulate a racer
        TopUps(WalletRepo r, PlatformTransactionManager tm) {
            repo = r; tx = new TransactionTemplate(tm);
            txNew = new TransactionTemplate(tm);
            txNew.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        }
        public void topUp(long id, long paise) {
            for (int attempt = 1; ; attempt++) {
                try {
                    tx.executeWithoutResult(s -> {
                        Wallet w = repo.findById(id).orElseThrow();
                        if (interferenceOnce != null) {          // someone else commits now
                            Runnable r = interferenceOnce; interferenceOnce = null;
                            txNew.executeWithoutResult(s2 -> r.run());
                        }
                        w.paise += paise;
                    });
                    System.out.println("  top-up " + paise + " ok, attempt " + attempt);
                    return;
                } catch (ObjectOptimisticLockingFailureException e) {
                    System.out.println("  top-up " + paise + " conflict, attempt " + attempt);
                    if (attempt == 3) throw e;
                }
            }
        }
    }
    public static void main(String[] args) {
        String[] noWeb = {"--spring.main.web-application-type=none"};
        try (var ctx = SpringApplication.run(Main.class, noWeb)) {
            WalletRepo repo = ctx.getBean(WalletRepo.class);
            Wallet w = new Wallet(); w.id = 1L; w.paise = 10_000; repo.save(w);
            TopUps t = ctx.getBean(TopUps.class);
            t.interferenceOnce = () -> {                         // the "other request"
                Wallet other = repo.findById(1L).orElseThrow();
                other.paise += 500;
                System.out.println("  racer added 500 and committed");
            };
            t.topUp(1L, 2_000);
            Wallet end = repo.findById(1L).get();
            System.out.println("final balance " + end.paise + " (10000 + 500 + 2000), "
                    + "version " + end.version);
        }
    }
}
```

The first attempt read version 0, the racer committed version 1, and the first attempt's `UPDATE ... WHERE version = 0` matched nothing. The second attempt reads the new balance and commits. Two rules make the retry correct: the loop is **outside** the transaction (a retry inside a failed transaction cannot succeed), and each attempt **re-reads** the row instead of reusing old values.
