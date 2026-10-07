# Chapter 3: REST APIs with Spring MVC
%The life of a request, controllers and DTOs, validation, status codes and one consistent error format

## 3.1 The life of a request

```text
HTTP request
  -> Tomcat thread from the pool (200 threads by default)
  -> Filter chain (logging, CORS, Spring Security in Chapter 6)
  -> DispatcherServlet
       -> HandlerMapping: which @RequestMapping method matches the path and HTTP method?
       -> HandlerAdapter: bind path variables, query parameters, JSON body (Jackson)
       -> @Valid: run Bean Validation on the bound object
       -> your controller method -> service -> repository
       -> return value -> HttpMessageConverter (Jackson) -> JSON
       -> exception? -> @ExceptionHandler / @RestControllerAdvice
  -> HTTP response
```

One request is handled by one thread from start to finish (in the classic servlet stack). That is why singleton beans must not keep per-request state in fields (Chapter 2), and why a slow database call blocks a thread.

## 3.2 Controllers, DTOs and status codes

A controller should be thin: translate HTTP into a method call and back. Use **DTOs** (records) for request and response bodies instead of exposing entities: the API stays stable when the database model changes, you cannot leak fields like password hashes by accident, and clients cannot set fields they should not (such as `id` or `createdAt`).

| Operation | Method and path | Success status | Body |
|---|---|---|---|
| List | `GET /meters?page=0&size=20` | 200 OK | Page of items |
| Read one | `GET /meters/{id}` | 200 OK, or 404 Not Found | Item |
| Create | `POST /meters` | **201 Created** with a `Location` header | Created item |
| Replace | `PUT /meters/{id}` | 200 OK (or 204 No Content) | Item |
| Partial update | `PATCH /meters/{id}` | 200 OK | Item |
| Delete | `DELETE /meters/{id}` | **204 No Content** | None |
| Invalid input | — | 400 Bad Request | Error details |
| Duplicate / conflicting state | — | 409 Conflict | Error details |

The examples in this chapter start the application on a random free port (`server.port=0`) and call it with Java's `HttpClient`, printing the status code and body of every response.

```java spring A CRUD controller with DTOs and correct status codes
package demo;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.context.WebServerApplicationContext;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@SpringBootApplication(excludeName =
        "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration")
public class Main {
    public record CreateMeter(String serial, String location) {}
    public record MeterView(long id, String serial, String location) {}

    @RestController
    @RequestMapping("/meters")
    public static class MeterController {
        private final Map<Long, MeterView> store = new ConcurrentHashMap<>();
        private final AtomicLong ids = new AtomicLong();

        @PostMapping
        ResponseEntity<MeterView> create(@RequestBody CreateMeter req) {
            MeterView m = new MeterView(ids.incrementAndGet(), req.serial(), req.location());
            store.put(m.id(), m);
            return ResponseEntity.created(URI.create("/meters/" + m.id())).body(m);
        }
        @GetMapping("/{id}")
        ResponseEntity<MeterView> one(@PathVariable long id) {
            MeterView m = store.get(id);
            return m == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(m);
        }
        @GetMapping
        List<MeterView> list(@RequestParam(defaultValue = "") String location) {
            return store.values().stream()
                    .filter(m -> location.isEmpty() || m.location().equals(location))
                    .sorted(Comparator.comparingLong(MeterView::id)).toList();
        }
        @DeleteMapping("/{id}")
        @ResponseStatus(HttpStatus.NO_CONTENT)
        void delete(@PathVariable long id) { store.remove(id); }
    }

    static HttpClient http = HttpClient.newHttpClient();
    static String base;
    static void call(String method, String path, String json) throws Exception {
        var b = HttpRequest.newBuilder(URI.create(base + path))
                .header("Content-Type", "application/json");
        b.method(method, json == null ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(json));
        HttpResponse<String> r = http.send(b.build(), HttpResponse.BodyHandlers.ofString());
        String loc = r.headers().firstValue("Location").map(l -> " Location=" + l).orElse("");
        System.out.printf("%-6s %-23s -> %d%s %s%n", method, path, r.statusCode(), loc,
                r.body());
    }
    public static void main(String[] args) throws Exception {
        var ctx = SpringApplication.run(Main.class, "--server.port=0");
        int port = ((WebServerApplicationContext) ctx).getWebServer().getPort();
        base = "http://localhost:" + port;
        call("POST", "/meters", "{\"serial\":\"SM-1\",\"location\":\"Kolkata\"}");
        call("POST", "/meters", "{\"serial\":\"SM-2\",\"location\":\"Howrah\"}");
        call("GET", "/meters/1", null);
        call("GET", "/meters?location=Howrah", null);
        call("DELETE", "/meters/1", null);
        call("GET", "/meters/1", null);
        ctx.close();
    }
}
```

> NOTE: The store in this example is an in-memory map so that the chapter can focus on HTTP. Chapter 4 replaces it with JPA and a real database.

## 3.3 Validation

Bean Validation annotations on the request DTO, plus `@Valid` on the parameter, make Spring reject bad input with **400 Bad Request** before your code runs. Validate at the edge; the rest of the code can then trust its inputs.

| Annotation | Checks |
|---|---|
| `@NotNull`, `@NotBlank`, `@NotEmpty` | Present; present and not only whitespace; non-empty collection/string |
| `@Size(min, max)` | Length of a string or collection |
| `@Min`, `@Max`, `@Positive`, `@PositiveOrZero` | Numeric ranges |
| `@Pattern(regexp)` | Format, such as a meter serial `SM-\d{3,}` |
| `@Email`, `@Past`, `@Future` | Common formats and dates |
| `@Valid` on a field | Validate a nested object too |

## 3.4 One error format for the whole API

Without a handler, every failure returns a different shape. A `@RestControllerAdvice` maps exceptions to responses in one place. Spring 6 supports **RFC 9457 Problem Details** (`application/problem+json`) through the `ProblemDetail` class: `type`, `title`, `status`, `detail`, plus any extra properties such as the list of invalid fields.

```java spring Validation errors and domain exceptions as problem details
package demo;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.context.WebServerApplicationContext;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@SpringBootApplication(excludeName =
        "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration")
public class Main {
    public record ReadingIn(@NotBlank @Pattern(regexp = "SM-\\d{3,}") String serial,
                            @NotNull @PositiveOrZero Double kwh) {}

    public static class MeterNotFound extends RuntimeException {
        MeterNotFound(String serial) { super("No meter with serial " + serial); }
    }

    @RestController
    public static class ReadingController {
        private final Set<String> known = Set.of("SM-001", "SM-002");
        @PostMapping("/readings")
        @ResponseStatus(HttpStatus.CREATED)
        ReadingIn add(@Valid @RequestBody ReadingIn in) {     // a record: stable JSON order
            if (!known.contains(in.serial())) throw new MeterNotFound(in.serial());
            return in;
        }
    }

    @RestControllerAdvice
    public static class ApiErrors {
        @ExceptionHandler(MethodArgumentNotValidException.class)
        ProblemDetail invalid(MethodArgumentNotValidException e) {
            ProblemDetail p = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
            p.setTitle("Invalid request");
            Map<String, String> fields = new TreeMap<>();
            e.getBindingResult().getFieldErrors()
                    .forEach(f -> fields.put(f.getField(), f.getDefaultMessage()));
            p.setProperty("fields", fields);
            return p;
        }
        @ExceptionHandler(HttpMessageNotReadableException.class)
        ProblemDetail unreadable(HttpMessageNotReadableException e) {
            ProblemDetail p = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST,
                    "Body is not valid JSON for this endpoint");
            p.setTitle("Malformed request");
            return p;
        }
        @ExceptionHandler(MeterNotFound.class)
        ProblemDetail notFound(MeterNotFound e) {
            ProblemDetail p = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND,
                    e.getMessage());
            p.setTitle("Meter not found");
            return p;
        }
    }

    public static void main(String[] args) throws Exception {
        var ctx = SpringApplication.run(Main.class, "--server.port=0");
        int port = ((WebServerApplicationContext) ctx).getWebServer().getPort();
        HttpClient http = HttpClient.newHttpClient();
        String[] bodies = {
            "{\"serial\":\"SM-001\",\"kwh\":3.5}",
            "{\"serial\":\"meter1\",\"kwh\":-2}",
            "{\"serial\":\"SM-999\",\"kwh\":1.0}",
            "{\"serial\":\"SM-001\",\"kwh\":\"lots\"}" };
        for (String body : bodies) {
            URI uri = URI.create("http://localhost:" + port + "/readings");
            var req = HttpRequest.newBuilder(uri)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body)).build();
            var r = http.send(req, HttpResponse.BodyHandlers.ofString());
            String json = r.body().replace(",\"instance\":\"/readings\"", "");
            System.out.println(r.statusCode() + " " + json);
        }
        ctx.close();
    }
}
```

The last request is not a validation failure but a **deserialisation** failure: Jackson cannot turn `"lots"` into a `Double`, so Spring raises `HttpMessageNotReadableException` before validation even runs. The first version of this program had no handler for it, and the client received Spring Boot's default error body instead, a completely different shape:

```text
400 {"timestamp":"2026-10-07T21:09:12.038+00:00","status":400,"error":"Bad Request",
     "path":"/readings"}
```

Adding the `unreadable` handler gives every 400 the same problem-detail format. (Spring Boot can also produce problem details for all of its built-in exceptions with `spring.mvc.problemdetails.enabled=true`.)

> TRAP: Never return exception messages or stack traces from unexpected exceptions to clients: they leak internals. Add a catch-all `@ExceptionHandler(Exception.class)` that logs the error with a correlation id and returns a generic 500 problem detail.

## 3.5 Pagination, filtering and API design

| Concern | Recommendation |
|---|---|
| Large lists | Always paginate: `?page=0&size=20&sort=createdAt,desc` (Spring Data `Pageable`), or cursor pagination for feeds (System Design guide) |
| Filtering | Query parameters: `GET /readings?meter=SM-001&from=2026-10-01` |
| Versioning | In the path (`/api/v1/...`) or a header; never break existing clients |
| Idempotency | `PUT` and `DELETE` are idempotent by definition; make `POST` safe to retry with an `Idempotency-Key` header or a natural unique key (Chapter 10) |
| Naming | Plural nouns for collections (`/meters`), no verbs in paths (`/meters/1/readings`, not `/getReadings`) |
| Dates and money | ISO-8601 timestamps in UTC (`2026-10-07T10:15:00Z`); money as integer minor units or decimal strings, never binary floating point |

## 3.6 Practical lessons

- Controllers translate HTTP; services hold business logic; repositories talk to the database.
- Request and response bodies are DTO records, never entities.
- Return the right status: 201 with `Location` for creation, 204 for deletion, 404, 409, 400 with field details.
- Centralise errors in `@RestControllerAdvice` with `ProblemDetail`; never leak stack traces.

# Chapter 4: Data Access with JPA and Hibernate
%Entities and relationships, Spring Data repositories, lazy loading, and the N+1 problem measured

## 4.1 The layers

| Layer | What it is | You write |
|---|---|---|
| JDBC | The raw Java database API: connections, statements, result sets | SQL strings and row mapping (rarely, or via `JdbcTemplate`) |
| JPA | A specification for object–relational mapping (annotations, `EntityManager`, JPQL) | Entity classes |
| Hibernate | The JPA implementation Spring Boot uses | Nothing directly; tuning properties |
| Spring Data JPA | Repositories generated from interfaces | `interface MeterRepo extends JpaRepository<Meter, Long>` |

An **entity** is a class mapped to a table. Hibernate tracks every entity loaded in the current **persistence context** (one per transaction): changes to a managed entity are written back automatically at commit (**dirty checking**), without calling `save`.

## 4.2 Repositories and derived queries

Spring Data generates the implementation of a repository interface at start-up. Method names are parsed into queries (`findBySerial`, `countByLocation`, `findTop3ByOrderByKwhDesc`); for anything more complex, write JPQL with `@Query`.

```java spring Entities, derived queries, JPQL and dirty checking
package demo;

import jakarta.persistence.*;
import java.util.*;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@SpringBootApplication
@EnableJpaRepositories(considerNestedRepositories = true)
public class Main {
    @Entity @Table(name = "meter")
    public static class Meter {
        @Id @GeneratedValue(strategy = GenerationType.IDENTITY) Long id;
        @Column(nullable = false, unique = true) String serial;
        String location;
        int tariffPaise;
        protected Meter() {}                         // JPA needs a no-argument constructor
        Meter(String serial, String location, int tariff) {
            this.serial = serial; this.location = location; this.tariffPaise = tariff;
        }
        public String toString() { return serial + "@" + location + "(" + tariffPaise + ")"; }
    }

    public interface MeterRepo extends JpaRepository<Meter, Long> {
        Optional<Meter> findBySerial(String serial);
        List<Meter> findByLocationOrderBySerialAsc(String location);
        long countByLocation(String location);
        @Query("select m.location, count(m) from Main$Meter m group by m.location "
                + "order by m.location")
        List<Object[]> countPerLocation();
    }

    @Service
    public static class TariffService {
        private final MeterRepo repo;
        TariffService(MeterRepo repo) { this.repo = repo; }
        @Transactional
        public void raise(String location, int newTariff) {
            for (Meter m : repo.findByLocationOrderBySerialAsc(location))
                m.tariffPaise = newTariff;                     // no save(): dirty checking
        }
    }

    public static void main(String[] args) {
        String[] noWeb = {"--spring.main.web-application-type=none"};
        try (var ctx = SpringApplication.run(Main.class, noWeb)) {
            MeterRepo repo = ctx.getBean(MeterRepo.class);
            repo.saveAll(List.of(new Meter("SM-003", "Howrah", 700),
                    new Meter("SM-001", "Kolkata", 700), new Meter("SM-002", "Kolkata", 700),
                    new Meter("SM-004", "Salt Lake", 650)));
            Meter two = repo.findBySerial("SM-002").get();
            System.out.println("findBySerial(SM-002) -> " + two);
            var kolkata = repo.findByLocationOrderBySerialAsc("Kolkata");
            System.out.println("in Kolkata -> " + kolkata);
            System.out.println("countByLocation(Kolkata) -> "
                    + repo.countByLocation("Kolkata"));
            for (Object[] row : repo.countPerLocation())
                System.out.println("  " + row[0] + ": " + row[1]);
            Page<Meter> page = repo.findAll(PageRequest.of(1, 3, Sort.by("serial")));
            System.out.println("page 1 of size 3 -> " + page.getContent() + ", total "
                    + page.getTotalElements() + " in " + page.getTotalPages() + " pages");
            ctx.getBean(TariffService.class).raise("Kolkata", 750);
            kolkata = repo.findByLocationOrderBySerialAsc("Kolkata");
            System.out.println("after raise -> " + kolkata);
        }
    }
}
```

The tariff change was saved although `raise` never called `save`: the meters were managed entities inside the transaction, and Hibernate flushed the changes at commit. That convenience is also a risk: modifying a managed entity "just for display" inside a transaction writes to the database.

> NOTE: The JPQL entity name is `Main$Meter` only because the entity is a nested class in these single-file programs. In a normal project it is the simple class name: `select m from Meter m`.

## 4.3 Relationships and fetching

| Annotation | Example | Default fetch |
|---|---|---|
| `@ManyToOne` | Many readings belong to one meter | **EAGER** (change it to LAZY) |
| `@OneToMany(mappedBy = ...)` | One meter has many readings | LAZY |
| `@OneToOne` | Meter and its installation record | EAGER |
| `@ManyToMany` | Meters and tariff plans | LAZY |

In a bidirectional relationship, the `@ManyToOne` side owns the foreign key; the `@OneToMany(mappedBy = "meter")` side is only a view of it. **Lazy** associations are loaded the first time they are accessed, with an extra query, and only while the persistence context is open. Accessing them after the transaction has ended throws `LazyInitializationException`.

## 4.4 The N+1 problem, measured

Loading *N* parent rows and then touching a lazy collection on each one runs **1 query for the parents plus N queries for the children**. With 1 000 meters that is 1 001 round trips for what should be one or two queries. The program counts the JDBC statements Hibernate prepares (using Hibernate's statistics) for three ways of loading 10 meters with their readings.

```java spring Counting queries: N+1, fetch join and entity graph
package demo;

import jakarta.persistence.*;
import java.util.*;
import org.hibernate.SessionFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@SpringBootApplication
@EnableJpaRepositories(considerNestedRepositories = true)
public class Main {
    @Entity public static class Meter {
        @Id @GeneratedValue Long id;
        String serial;
        @OneToMany(mappedBy = "meter", cascade = CascadeType.ALL)
        List<Reading> readings = new ArrayList<>();
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
    public interface MeterRepo extends JpaRepository<Meter, Long> {
        @Query("select distinct m from Main$Meter m join fetch m.readings")
        List<Meter> findAllWithReadings();
        @EntityGraph(attributePaths = "readings")
        @Query("select m from Main$Meter m")
        List<Meter> findAllGraph();
    }

    @Service
    public static class Report {
        private final MeterRepo repo;
        Report(MeterRepo repo) { this.repo = repo; }
        @Transactional(readOnly = true)
        public double total(String strategy) {
            List<Meter> meters = switch (strategy) {
                case "findAll" -> repo.findAll();
                case "join fetch" -> repo.findAllWithReadings();
                default -> repo.findAllGraph();
            };
            double sum = 0;
            for (Meter m : meters) for (Reading r : m.readings) sum += r.kwh;
            return sum;
        }
    }

    public static void main(String[] args) {
        try (var ctx = SpringApplication.run(Main.class,
                "--spring.main.web-application-type=none",
                "--spring.jpa.properties.hibernate.generate_statistics=true")) {
            MeterRepo repo = ctx.getBean(MeterRepo.class);
            for (int i = 1; i <= 10; i++) {
                Meter m = new Meter("SM-" + i);
                for (int d = 0; d < 3; d++) m.readings.add(new Reading(m, i + d));
                repo.save(m);
            }
            var stats = ctx.getBean(jakarta.persistence.EntityManagerFactory.class)
                    .unwrap(SessionFactory.class).getStatistics();
            for (String s : List.of("findAll", "join fetch", "entity graph")) {
                stats.clear();
                double total = ctx.getBean(Report.class).total(s);
                System.out.printf("%-13s total kWh %.0f, SQL statements %d%n", s, total,
                        stats.getPrepareStatementCount());
            }
        }
    }
}
```

`findAll` then iterating the lazy collections issues 1 + 10 = 11 statements; the fetch join and the entity graph load everything in **one** statement. All three give the same total, which is why N+1 goes unnoticed in development with ten rows and becomes an outage in production with a hundred thousand.

| Fix | How | Caveat |
|---|---|---|
| Fetch join | `select m from Meter m join fetch m.readings` | Cannot paginate a collection fetch in SQL (Hibernate paginates in memory and warns) |
| `@EntityGraph` | `attributePaths = "readings"` on a repository method | Same SQL as a fetch join; declarative |
| Batch fetching | `hibernate.default_batch_fetch_size=50` | Turns N queries into ⌈N/50⌉ `IN (...)` queries; works with pagination |
| DTO projection | `select new ...View(m.serial, sum(r.kwh)) ... group by` | Best for read-only reports: no entities at all |

> TIP: Make N+1 visible during development: enable SQL logging (`spring.jpa.show-sql=true`) or Hibernate statistics, and write a test that asserts the statement count of an important query, as above.

## 4.5 LazyInitializationException

```java spring Lazy loading outside a transaction
package demo;

import jakarta.persistence.*;
import java.util.*;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(considerNestedRepositories = true)
public class Main {
    @Entity public static class Meter {
        @Id @GeneratedValue Long id;
        String serial;
        @OneToMany(mappedBy = "meter", cascade = CascadeType.ALL)
        List<Reading> readings = new ArrayList<>();
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
    public interface MeterRepo extends JpaRepository<Meter, Long> {
        @EntityGraph(attributePaths = "readings")
        Optional<Meter> findWithReadingsBySerial(String serial);
    }
    public static void main(String[] args) {
        String[] noWeb = {"--spring.main.web-application-type=none"};
        try (var ctx = SpringApplication.run(Main.class, noWeb)) {
            MeterRepo repo = ctx.getBean(MeterRepo.class);
            Meter m = new Meter("SM-1");
            m.readings.add(new Reading(m, 2.5));
            repo.save(m);
            Meter loaded = repo.findById(m.id).get();          // transaction ends on return
            try {
                System.out.println("readings: " + loaded.readings.size());
            } catch (org.hibernate.LazyInitializationException e) {
                System.out.println("LazyInitializationException: no session to load them");
            }
            Meter withGraph = repo.findWithReadingsBySerial("SM-1").get();
            System.out.println("with an entity graph: " + withGraph.readings.size()
                    + " reading");
        }
    }
}
```

The repository call opens and closes its own transaction, so the entity it returns is **detached**: its lazy collection cannot be loaded any more. The fixes are to load what you need inside a `@Transactional` service method (by a fetch join, an entity graph, or a DTO projection) and return DTOs to the controller.

> TRAP: Spring Boot enables **open session in view** by default (`spring.jpa.open-in-view=true`) and logs a warning about it. It keeps the persistence context open until the HTTP response is written, which hides `LazyInitializationException` but runs lazy queries during JSON serialisation, outside any transaction, often as N+1. Disable it (`false`, as the programs in this book do) and fetch deliberately.

## 4.6 Schema management

`spring.jpa.hibernate.ddl-auto=create-drop` (the default for embedded databases like H2) generates tables from entities: fine for demos and tests, dangerous in production. Production schemas are managed with a migration tool, **Flyway** or **Liquibase**: numbered SQL scripts (`V1__create_meter.sql`, `V2__add_tariff.sql`) applied once each, in order, and recorded in a history table. Set `ddl-auto=validate` so that Hibernate only checks that entities match the schema.

## 4.7 Practical lessons

- Repositories for simple access, derived queries for simple filters, `@Query` for the rest, DTO projections for reports.
- Make `@ManyToOne` lazy; load what a use case needs with a fetch join or entity graph.
- Count queries. N+1 is invisible until the data grows.
- Managed entities are saved automatically at commit; detached entities cannot lazy-load.
- Turn off open session in view; manage production schemas with Flyway or Liquibase.
