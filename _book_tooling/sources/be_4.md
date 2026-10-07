# Chapter 10: Project: a Smart-Meter REST API
%Everything together: entities, idempotent batch ingestion, late data, daily aggregates, billing and errors

## 10.1 Requirements

This is the backend of the smart-meter platform from the System Design guide (Chapter 10), reduced to one service you can build in a weekend and show on GitHub.

| # | Requirement | Design decision |
|---|---|---|
| 1 | Register meters (`POST /meters`) with a unique serial | Unique constraint on `serial`; 409 Conflict on a duplicate |
| 2 | Meters upload **batches** of readings (`POST /meters/{serial}/readings`) | One request, many readings; one transaction |
| 3 | Uploads are **retried** after network failures, so the same reading can arrive twice | Natural key `(meter, timestamp)` with a unique constraint; duplicates are counted and skipped, not errors: ingestion is **idempotent** |
| 4 | Readings can arrive **late** (a meter offline for a day uploads yesterday's data) | Aggregates are computed at query time from stored readings, so late data is included automatically |
| 5 | Daily consumption (`GET /meters/{serial}/daily?from=&to=`) | DTO projection with `GROUP BY day` in the database; no entities loaded |
| 6 | Monthly bill with a slab tariff | Pure domain function, unit-testable; money in paise |
| 7 | Invalid data is rejected with field-level errors; readings from the future are rejected | Bean Validation plus a check against an injected `Clock` |

```text
POST /meters                         {"serial":"SM-001","consumer":"Asha"}      -> 201
POST /meters/SM-001/readings         [{"ts":"2026-10-01T00:00:00Z","kwh":1.2}, ...]
                                     -> 200 {"accepted":4,"duplicates":0}
GET  /meters/SM-001/daily?from=2026-10-01&to=2026-10-03
                                     -> [{"day":"2026-10-01","kwh":..,"readings":..}, ...]
GET  /meters/SM-001/bill?month=2026-10 -> {"units":..,"paise":..}
```

## 10.2 The complete service

The program is the whole service in one file: entities, repositories, a service with the business rules, a controller, error handling, and a scripted client that plays a realistic day, including a retried upload and a late batch.

```java spring The smart-meter API end to end
package demo;

import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.*;
import java.util.*;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.context.WebServerApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.bind.annotation.*;

@SpringBootApplication
@EnableJpaRepositories(considerNestedRepositories = true)
public class Main {
    // ---------- domain ----------
    @Entity @Table(name = "meter")
    public static class Meter {
        @Id @GeneratedValue Long id;
        @Column(unique = true, nullable = false) String serial;
        String consumer;
        protected Meter() {}
        Meter(String s, String c) { serial = s; consumer = c; }
    }
    @Entity @Table(name = "reading",
            uniqueConstraints = @UniqueConstraint(columnNames = {"meter_id", "ts"}),
            indexes = @Index(columnList = "meter_id, reading_day"))
    public static class Reading {
        @Id @GeneratedValue Long id;
        @ManyToOne(fetch = FetchType.LAZY, optional = false) Meter meter;
        Instant ts;
        @Column(name = "reading_day")                     // DAY is a reserved word in SQL
        LocalDate day;                                    // derived once, at ingestion
        double kwh;
        protected Reading() {}
        Reading(Meter m, Instant ts, double kwh) {
            this.meter = m; this.ts = ts; this.kwh = kwh;
            this.day = LocalDate.ofInstant(ts, ZoneOffset.UTC);
        }
    }
    public record DailyUsage(LocalDate day, double kwh, long readings) {}

    public interface MeterRepo extends JpaRepository<Meter, Long> {
        Optional<Meter> findBySerial(String serial);
    }
    public interface ReadingRepo extends JpaRepository<Reading, Long> {
        @Query("select r.ts from Main$Reading r where r.meter = :m and r.ts in :ts")
        List<Instant> existing(Meter m, Collection<Instant> ts);
        @Query("select new demo.Main$DailyUsage(r.day, sum(r.kwh), count(r)) "
                + "from Main$Reading r where r.meter = :m and r.day between :from and :to "
                + "group by r.day order by r.day")
        List<DailyUsage> daily(Meter m, LocalDate from, LocalDate to);
    }

    /** Slab tariff: first 100 units at Rs 5, next 200 at Rs 7, the rest at Rs 9 (paise). */
    static long billPaise(double units) {
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

    // ---------- API types and errors ----------
    public record NewMeter(@NotBlank @Pattern(regexp = "SM-\\d{3}") String serial,
                           @NotBlank String consumer) {}
    public record ReadingIn(@NotNull Instant ts, @NotNull @PositiveOrZero Double kwh) {}
    public record IngestResult(int accepted, int duplicates) {}
    public record BillView(String month, long units, long paise) {}
    static class NotFound extends RuntimeException { NotFound(String m) { super(m); } }
    static class Conflict extends RuntimeException { Conflict(String m) { super(m); } }
    static class BadInput extends RuntimeException { BadInput(String m) { super(m); } }

    // ---------- service ----------
    @Service
    public static class MeterService {
        private final MeterRepo meters;
        private final ReadingRepo readings;
        private final Clock clock;
        MeterService(MeterRepo m, ReadingRepo r, Clock c) {
            meters = m; readings = r; clock = c;
        }

        @Transactional
        public Meter register(NewMeter in) {
            if (meters.findBySerial(in.serial()).isPresent())
                throw new Conflict("Meter " + in.serial() + " already exists");
            return meters.save(new Meter(in.serial(), in.consumer()));
        }
        Meter meter(String serial) {
            return meters.findBySerial(serial)
                    .orElseThrow(() -> new NotFound("No meter " + serial));
        }
        @Transactional
        public IngestResult ingest(String serial, List<ReadingIn> batch) {
            Meter m = meter(serial);
            Instant now = clock.instant();
            for (ReadingIn r : batch)
                if (r.ts().isAfter(now))
                    throw new BadInput("Reading from the future: " + r.ts());
            Set<Instant> seen = new HashSet<>(readings.existing(m,
                    batch.stream().map(ReadingIn::ts).toList()));
            int accepted = 0, dup = 0;
            for (ReadingIn r : batch) {
                if (!seen.add(r.ts())) { dup++; continue; }   // stored, or repeated in batch
                readings.save(new Reading(m, r.ts(), r.kwh()));
                accepted++;
            }
            return new IngestResult(accepted, dup);
        }
        @Transactional(readOnly = true)
        public List<DailyUsage> daily(String serial, LocalDate from, LocalDate to) {
            return readings.daily(meter(serial), from, to);
        }
        @Transactional(readOnly = true)
        public BillView bill(String serial, YearMonth month) {
            double units = daily(serial, month.atDay(1), month.atEndOfMonth()).stream()
                    .mapToDouble(DailyUsage::kwh).sum();
            return new BillView(month.toString(), Math.round(units), billPaise(units));
        }
    }

    // ---------- web ----------
    @RestController @RequestMapping("/meters")
    public static class MeterController {
        private final MeterService service;
        MeterController(MeterService s) { service = s; }
        @PostMapping @ResponseStatus(HttpStatus.CREATED)
        Map<String, Object> create(@Valid @RequestBody NewMeter in) {
            Meter m = service.register(in);
            return new TreeMap<>(Map.of("serial", m.serial, "consumer", m.consumer));
        }
        @PostMapping("/{serial}/readings")
        IngestResult ingest(@PathVariable String serial,
                            @RequestBody List<@Valid ReadingIn> batch) {
            return service.ingest(serial, batch);
        }
        @GetMapping("/{serial}/daily")
        List<DailyUsage> daily(@PathVariable String serial, @RequestParam LocalDate from,
                               @RequestParam LocalDate to) {
            return service.daily(serial, from, to);
        }
        @GetMapping("/{serial}/bill")
        BillView bill(@PathVariable String serial, @RequestParam YearMonth month) {
            return service.bill(serial, month);
        }
    }
    @RestControllerAdvice
    public static class Errors {
        @ExceptionHandler(NotFound.class) ProblemDetail nf(NotFound e) {
            return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());
        }
        @ExceptionHandler(Conflict.class) ProblemDetail cf(Conflict e) {
            return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, e.getMessage());
        }
        @ExceptionHandler(BadInput.class) ProblemDetail bad(BadInput e) {
            return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, e.getMessage());
        }
        @ExceptionHandler(MethodArgumentNotValidException.class)
        ProblemDetail invalid(MethodArgumentNotValidException e) {
            ProblemDetail p = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
            Map<String, String> f = new TreeMap<>();
            e.getBindingResult().getFieldErrors()
                    .forEach(x -> f.put(x.getField(), x.getDefaultMessage()));
            p.setProperty("fields", f);
            return p;
        }
        @ExceptionHandler(HandlerMethodValidationException.class)   // @Valid list elements
        ProblemDetail invalidElement(HandlerMethodValidationException e) {
            ProblemDetail p = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST,
                    "Invalid reading in batch");
            p.setProperty("errors", e.getAllValidationResults().stream()
                    .flatMap(r -> r.getResolvableErrors().stream())
                    .map(x -> x.getDefaultMessage()).sorted().toList());
            return p;
        }
    }
    @Bean Clock clock() {                                 // "now" is fixed for the demo
        return Clock.fixed(Instant.parse("2026-10-03T12:00:00Z"), ZoneOffset.UTC);
    }

    // ---------- a scripted client ----------
    static HttpClient http = HttpClient.newHttpClient();
    static String base;
    static void call(String label, String method, String path, String json) throws Exception {
        var b = HttpRequest.newBuilder(URI.create(base + path)).header("Content-Type",
                "application/json");
        b.method(method, json == null ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(json));
        var r = http.send(b.build(), HttpResponse.BodyHandlers.ofString());
        String body = r.body().replace("\"type\":\"about:blank\",", "")
                .replaceAll(",\"instance\":\"[^\"]*\"", "");
        System.out.println(label + " -> " + r.statusCode() + " " + body);
    }
    static String readings(String day, double... kwhPerSixHours) {
        StringJoiner j = new StringJoiner(",", "[", "]");
        for (int i = 0; i < kwhPerSixHours.length; i++)
            j.add(String.format("{\"ts\":\"%sT%02d:00:00Z\",\"kwh\":%s}", day, i * 6,
                    kwhPerSixHours[i]));
        return j.toString();
    }
    public static void main(String[] args) throws Exception {
        var ctx = SpringApplication.run(Main.class, "--server.port=0");
        int port = ((WebServerApplicationContext) ctx).getWebServer().getPort();
        base = "http://localhost:" + port;
        String asha = "{\"serial\":\"SM-001\",\"consumer\":\"Asha\"}";
        call("register SM-001     ", "POST", "/meters", asha);
        call("register again      ", "POST", "/meters", asha);
        String invalid = "{\"serial\":\"X1\",\"consumer\":\"\"}";
        call("register bad serial ", "POST", "/meters", invalid);
        String oct1 = readings("2026-10-01", 1.5, 2.5, 4.0, 3.0);
        call("upload Oct 1        ", "POST", "/meters/SM-001/readings", oct1);
        call("retry same upload   ", "POST", "/meters/SM-001/readings", oct1);
        call("upload Oct 3        ", "POST", "/meters/SM-001/readings",
                readings("2026-10-03", 2.0, 3.5));
        call("late batch for Oct 2", "POST", "/meters/SM-001/readings",
                readings("2026-10-02", 1.0, 2.0, 5.0, 2.0));
        call("from the future     ", "POST", "/meters/SM-001/readings",
                readings("2026-10-04", 1.0));
        call("negative kWh        ", "POST", "/meters/SM-001/readings",
                "[{\"ts\":\"2026-10-02T23:00:00Z\",\"kwh\":-1}]");
        call("unknown meter       ", "POST", "/meters/SM-404/readings", oct1);
        call("daily Oct 1-3       ", "GET",
                "/meters/SM-001/daily?from=2026-10-01&to=2026-10-03", null);
        call("bill October        ", "GET", "/meters/SM-001/bill?month=2026-10", null);
        System.out.println("slab check: 250 units -> Rs " + billPaise(250) / 100
                + ", 400 units -> Rs " + billPaise(400) / 100);
        ctx.close();
    }
}
```

Read the run as a story. The duplicate registration is a 409 and the invalid one a 400 with both fields named. The retried upload of 1 October stores nothing new: four duplicates, so the meter can safely retry after any timeout. The late batch for 2 October arrives after 3 October's data and still appears in the daily report in date order, because aggregation happens at query time. A reading stamped in the future (according to the injected clock) is rejected, and so is negative consumption. The daily totals add up to 11 + 10 + 5.5 = 26.5 kWh, which rounds to 27 units, all inside the first slab at Rs 5: Rs 135. The last line checks the slabs directly: 250 units cost 100 × 5 + 150 × 7 = Rs 1 550, and 400 units cost 500 + 1 400 + 100 × 9 = Rs 2 800.

> TRAP: The first run of this program answered **500** to every upload. Hibernate's generated `CREATE TABLE reading (day date, ...)` had failed, because `DAY` is a reserved word in H2 (and in standard SQL), but `ddl-auto` only **logs a warning** when DDL fails and the application starts anyway. The `@Column(name = "reading_day")` mapping fixes it. Two lessons: avoid reserved words (`day`, `user`, `order`, `value`) as column names, and let Flyway own the schema in real projects, because a failing migration stops the start-up instead of a half-created schema serving errors.

> NOTE: The negative reading is rejected by `@Valid` on the **elements** of the `List` parameter. Since Spring Framework 6.1, controllers apply method validation to such container elements and raise `HandlerMethodValidationException` (not `MethodArgumentNotValidException`), so it needs its own handler to keep the problem-detail format.

## 10.3 What makes this design production-shaped

| Concern | How the code handles it | Next step in production |
|---|---|---|
| Idempotent ingestion | Existing timestamps looked up in one query per batch; unique constraint as the final guard | Under concurrent retries, catch `DataIntegrityViolationException` and treat it as a duplicate |
| Late and out-of-order data | Stored by event time (`ts`), aggregated at query time | Pre-aggregate closed days into a `daily_usage` table, recomputed when late data arrives |
| Query cost | `GROUP BY day` in the database with an index on `(meter_id, day)`; DTO projection | Partition the readings table by month (System Design guide) |
| Time | Injected `Clock`; all timestamps in UTC; `day` derived in UTC | Billing day in the consumer's time zone (IST) |
| Money | Integer paise; tariff as data | Tariff table with validity dates; versioned bills |
| Errors | Problem details for 400, 404, 409 | Catch-all 500 handler with correlation id (Chapter 8) |

> TIP: In an interview, presenting this project, lead with the decisions in this table rather than the annotations: "ingestion is idempotent on (meter, timestamp) because devices retry" is the sentence that shows engineering judgement.

## 10.4 Practical lessons

- Find the natural key of incoming data and make writes idempotent on it.
- Store events by event time; aggregate at query time or recompute when late data arrives.
- Push aggregation into the database with projections; never load thousands of entities to sum a column.
- Inject the clock, keep money in integers, and test the edge cases the API will really see: retries, late data, bad devices.

# Chapter 11: Question Bank and Cheat Sheets
%The questions asked most often in Java backend interviews, with the core of a good answer

## 11.1 Spring core

| Question | Core of a good answer |
|---|---|
| What is dependency injection, and why use it? | The container supplies dependencies instead of classes creating them; loose coupling, easy testing with mocks, one place to choose implementations |
| `@Component` versus `@Bean`? | `@Component` marks your class for scanning; `@Bean` is a factory method in a `@Configuration` class, for third-party classes or when creation needs logic |
| `@Component`, `@Service`, `@Repository`, `@Controller`? | All are components; `@Repository` adds translation of persistence exceptions to `DataAccessException`; `@Controller` is picked up by MVC; `@Service` is documentation |
| What does `@SpringBootApplication` do? | `@Configuration` + `@EnableAutoConfiguration` + `@ComponentScan` from the class's package |
| How does auto-configuration work? | Conditional configuration classes listed by starters; `@ConditionalOnClass`, `@ConditionalOnMissingBean` etc.; your beans make defaults back off; `--debug` shows the report |
| Bean scopes? Is a singleton thread-safe? | singleton, prototype, request, session; a singleton is shared by all threads, so it is thread-safe only if stateless |
| Constructor versus field injection? | Constructor: explicit, immutable (`final`), testable without Spring, fails fast; field injection hides dependencies |
| How do you choose between two beans of one type? | `@Primary`, `@Qualifier`, or inject `List`/`Map` of all |
| How does `@Transactional` work? | A proxy begins/commits/rolls back around the call; only public methods called through the proxy |
| Circular dependency? | A → B → A with constructor injection fails at start-up (Spring Boot 2.6+ forbids cycles by default); redesign, or extract the shared part |

## 11.2 Web and REST

| Question | Core of a good answer |
|---|---|
| `@Controller` versus `@RestController`? | `@RestController` = `@Controller` + `@ResponseBody`: return values are written as JSON instead of resolved as view names |
| `@PathVariable` versus `@RequestParam`? | Path identifies the resource (`/meters/7`); query parameters filter, sort and paginate |
| PUT versus PATCH versus POST? | PUT replaces (idempotent), PATCH partially updates, POST creates or performs an action (not idempotent) |
| How do you handle errors globally? | `@RestControllerAdvice` with `@ExceptionHandler` methods returning `ProblemDetail` |
| How does validation work? | Bean Validation annotations on DTOs, `@Valid` on the parameter, `MethodArgumentNotValidException` → 400 |
| Why DTOs instead of entities? | Stable API, no accidental data exposure or mass assignment, no lazy-loading during serialisation |
| How does a request flow through Spring MVC? | Filters → `DispatcherServlet` → handler mapping → argument binding and validation → controller → message converter → response |

## 11.3 Data and transactions

| Question | Core of a good answer |
|---|---|
| What is the N+1 problem? | One query for parents plus one per parent for a lazy association; fix with fetch join, entity graph, batch size or a projection |
| Lazy versus eager loading? | Lazy loads on first access (needs an open persistence context); eager always loads; default `@ManyToOne` is eager, make it lazy |
| `LazyInitializationException`? | Accessing a lazy association after the transaction closed; load it inside the service, return DTOs; disable open-in-view |
| `save` versus dirty checking? | Managed entities are flushed automatically at commit; `save` is needed for new entities (and merges detached ones) |
| Why didn't my transaction roll back? | Checked exception, self-invocation, private method, exception swallowed, or not a Spring bean |
| `REQUIRED` versus `REQUIRES_NEW`? | Join versus suspend-and-start-new; the latter commits independently and uses another connection |
| Optimistic versus pessimistic locking? | `@Version` check at update (no locks, retry on conflict) versus `SELECT ... FOR UPDATE` (blocks others) |
| `JpaRepository` versus `CrudRepository`? | `JpaRepository` adds paging, sorting, batch and flush operations on top of CRUD |
| How do you manage schema changes? | Flyway or Liquibase migrations, `ddl-auto=validate` |

## 11.4 Security, testing and operations

| Question | Core of a good answer |
|---|---|
| Authentication versus authorisation? 401 versus 403? | Who you are versus what you may do; 401 not authenticated, 403 authenticated but forbidden |
| How does JWT authentication work in Spring? | A filter reads the bearer token, verifies signature and expiry, puts an `Authentication` in the `SecurityContext`; stateless session policy |
| Where do you store passwords? | Hashed with BCrypt/Argon2 (salted, slow); never reversible encryption |
| Why disable CSRF for a token API? | CSRF exploits credentials the browser sends automatically (cookies); bearer tokens are added by code, so the attack does not apply |
| `@WebMvcTest` versus `@SpringBootTest`? | Web slice with mocked services versus the whole application; slices are faster and more focused |
| `@Mock` versus `@MockBean`? | Plain Mockito mock versus a mock registered in the Spring test context |
| What does Actuator give you? | Health (with liveness/readiness), metrics (Micrometer), info, and other operational endpoints |
| How do you make a Spring Boot service production-ready? | Health checks, metrics, structured logs with correlation ids, graceful shutdown, timeouts, sized pools, externalised configuration and secrets |

## 11.5 Annotation cheat sheet

| Annotation | Where | Purpose |
|---|---|---|
| `@SpringBootApplication` | Main class | Configuration + auto-configuration + component scan |
| `@Component`, `@Service`, `@Repository` | Class | Register as a bean |
| `@Configuration`, `@Bean` | Class, method | Define beans in code |
| `@Primary`, `@Qualifier` | Bean, injection point | Disambiguate |
| `@Value`, `@ConfigurationProperties` | Field/record | Bind configuration |
| `@Profile`, `@Conditional...` | Bean/config | Create only in some environments or situations |
| `@RestController`, `@RequestMapping`, `@GetMapping`... | Class, method | HTTP endpoints |
| `@PathVariable`, `@RequestParam`, `@RequestBody`, `@Valid` | Parameter | Bind and validate input |
| `@RestControllerAdvice`, `@ExceptionHandler` | Class, method | Global error handling |
| `@Entity`, `@Id`, `@GeneratedValue`, `@Column`, `@Version` | Class, field | JPA mapping |
| `@OneToMany`, `@ManyToOne`, `@JoinColumn` | Field | Relationships |
| `@Query`, `@EntityGraph` | Repository method | Custom queries, fetch plans |
| `@Transactional` | Public service method | Transaction boundary |
| `@EnableMethodSecurity`, `@PreAuthorize` | Config, method | Method-level authorisation |
| `@Cacheable`, `@Async`, `@Scheduled` | Method | Caching, asynchronous and scheduled execution (all proxy-based) |
| `@WebMvcTest`, `@DataJpaTest`, `@SpringBootTest`, `@MockBean` | Test class, field | Test slices and mocks |

## 11.6 Practical lessons

- Most Spring questions reduce to four mechanisms: the container, auto-configuration, proxies, and the persistence context. Explain those well and the rest follows.
- Prepare one project story (Chapter 10) with concrete decisions and numbers.
- When you do not know an annotation, explain what problem it must solve and how you would find out; that is a good answer too.
