# How to use this guide
%What backend interviews test, how the programs in this book run, and how it connects to the other books

Product companies hiring Java developers ask about **Spring Boot** in almost every backend interview: how dependency injection works, how a REST request travels through the framework, why a `@Transactional` method did not roll back, what the N+1 problem is, how JWT authentication works, and how you test all of it. Service companies ask the same questions at a lighter level ("difference between `@Component` and `@Bean`", "what does `@SpringBootApplication` do").

This guide teaches Spring Boot 3 (Java 21) by **running it**. Every program marked with an Output box is a complete Spring Boot application in one file: it starts a real application context (often a real Tomcat server on a random port and a real in-memory H2 database), exercises it with an HTTP client or a repository call, prints what happened and shuts down. The outputs were produced by running the programs, with Spring's banner and logging switched off so that only the program's own lines appear.

## How the programs are run

```text
spring/pom.xml            Spring Boot 3.3: web, data-jpa, validation, actuator, test, H2
spring-security/pom.xml   the same plus spring-boot-starter-security

javac -cp <classpath from pom> -d classes Main.java      (package demo; class demo.Main)
java  -cp <classpath>:classes -Dlogging.level.root=OFF -Dspring.main.banner-mode=off demo.Main
```

In a real project you generate the skeleton at start.spring.io, every class has its own file, and you run it with `./mvnw spring-boot:run`. The single-file form here keeps each example self-contained; the classes are `static` nested classes of `Main`, which Spring treats exactly like top-level classes.

> NOTE: Two programs in this book are shown but not run, because they need Docker (Testcontainers and the `docker compose` file in Chapter 9). They are marked "not executed here".

## How the chapters connect

| Chapter | Topic | Connects to |
|---|---|---|
| 1–2 | Spring Boot fundamentals, dependency injection, bean scopes, configuration | Dependency inversion and Factory in the Low-Level Design guide |
| 3 | REST controllers, DTOs, validation, error handling | HTTP and REST in the Computer Networks and System Design guides |
| 4–5 | JPA and Hibernate, the N+1 problem, transactions, locking | Isolation levels and locking in the DBMS Theory guide |
| 6 | Spring Security, password hashing, JWT | — |
| 7 | Testing: JUnit 5, Mockito, `@WebMvcTest`, `@DataJpaTest` | — |
| 8–9 | Actuator, metrics, logging, Docker, deployment | Observability in the System Design guide |
| 10 | Mini project: a smart-meter REST API | The smart-meter case study in the System Design guide |
| 11 | Question bank and cheat sheets | — |

## How to study this book

1. Read Chapters 1–2 carefully: everything else is built on the container and its proxies.
2. For every program, predict the output before reading it. The surprises (a transaction that does not roll back, a query count of 11 instead of 1) are exactly the interview questions.
3. Create a real project at start.spring.io alongside the book and re-type the examples into separate files.
4. Solve the **Backend Practice Book** part by part.
5. Build the Chapter 10 project yourself and put it on GitHub: it is a portfolio piece that matches your IoT and smart-energy interests.

# Chapter 1: Spring Boot Fundamentals
%What Spring and Spring Boot each add, how auto-configuration decides what to create, and how an application starts

## 1.1 Spring versus Spring Boot

**Spring Framework** is an inversion-of-control container plus libraries (web MVC, data access, transactions, security). You declare objects (**beans**) and their dependencies; the container creates them, wires them together and manages their lifecycle. **Spring Boot** sits on top and removes the setup work:

| Spring Boot feature | What it does |
|---|---|
| Starters | One dependency (`spring-boot-starter-web`) pulls a tested set of libraries: Spring MVC, Jackson, embedded Tomcat |
| Auto-configuration | Creates sensible beans based on what is on the classpath and what you have not defined yourself |
| Embedded server | The application is a plain `main` method that starts Tomcat inside the process; no WAR deployment |
| Externalised configuration | `application.properties`/`.yml`, environment variables, command-line arguments, profiles |
| Actuator | Health, metrics and info endpoints for production |

A typical project generated at start.spring.io:

```text
smart-meter/
├── pom.xml                         parent spring-boot-starter-parent, starters, plugins
├── src/main/java/com/example/meter/
│   ├── MeterApplication.java       @SpringBootApplication + main
│   ├── api/                        controllers, DTOs, exception handler
│   ├── domain/                     entities and business logic
│   ├── repo/                       Spring Data repositories
│   └── service/                    transactional services
├── src/main/resources/
│   ├── application.yml             configuration
│   └── db/migration/               Flyway SQL scripts (optional)
└── src/test/java/...               unit and slice tests
```

## 1.2 What `@SpringBootApplication` does

`@SpringBootApplication` is three annotations in one:

| Annotation | Effect |
|---|---|
| `@SpringBootConfiguration` | This class is a configuration class (it may declare `@Bean` methods) |
| `@EnableAutoConfiguration` | Load the auto-configuration classes listed by every starter on the classpath |
| `@ComponentScan` | Find `@Component`, `@Service`, `@Repository`, `@Controller` classes in **this package and its sub-packages** |

> TRAP: Component scanning starts at the package of the main class. A controller in `com.example.api` is **not** found if the main class is in `com.example.meter`. Put the main class in the root package of your code.

The program below starts an application without a web server and inspects the context: how many beans exist, which of them came from your code, and what auto-configuration created for you.

```java spring What is inside an application context
package demo;

import java.util.*;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.stereotype.Service;

@SpringBootApplication
public class Main {
    @Service
    public static class GreetingService {
        String greet(String name) { return "Hello, " + name; }
    }

    public static void main(String[] args) {
        String noDatabase = "org.springframework.boot.autoconfigure.jdbc."
                + "DataSourceAutoConfiguration";             // no database in this example
        ConfigurableApplicationContext ctx = SpringApplication.run(Main.class,
                "--spring.main.web-application-type=none",
                "--spring.autoconfigure.exclude=" + noDatabase);
        String[] names = ctx.getBeanDefinitionNames();
        List<String> mine = new ArrayList<>();
        for (String n : names)
            if (ctx.getType(n) != null && ctx.getType(n).getName().startsWith("demo."))
                mine.add(n);
        Collections.sort(mine);
        System.out.println("beans defined by our code: " + mine);
        System.out.println("total beans > 50? " + (names.length > 50));
        System.out.println("Jackson ObjectMapper auto-configured? "
                + ctx.containsBean("jacksonObjectMapper"));
        System.out.println(ctx.getBean(GreetingService.class).greet("Indrajeet"));
        ctx.close();
    }
}
```

Two of our beans exist: the application class itself (it is a configuration class, bean name `main`) and the service. A top-level class gets its simple name with a lower-case first letter (`greetingService`); a nested class like this one is named `main.GreetingService`. Everything else (well over 50 beans here, around 250 in a web application) comes from auto-configuration. The exact total depends on the Spring Boot version, so interview answers should describe the mechanism, not a number.

## 1.3 How auto-configuration decides

Every auto-configuration class is guarded by **conditions**. The most important ones:

| Condition | Meaning | Example |
|---|---|---|
| `@ConditionalOnClass` | A class is on the classpath | Configure Tomcat only if Tomcat is present |
| `@ConditionalOnMissingBean` | You have not defined such a bean | Create a default `ObjectMapper` only if you did not |
| `@ConditionalOnProperty` | A property has a value | Enable a feature with `app.cache.enabled=true` |
| `@ConditionalOnWebApplication` | The app is a web app | MVC configuration |

`@ConditionalOnMissingBean` is why Spring Boot "backs off": define your own bean and the default disappears. The program defines a feature switch with `@ConditionalOnProperty` and a default bean that yields to a user-defined one.

```java spring Conditions: a property switch and a bean that backs off
package demo;

import org.springframework.beans.factory.NoUniqueBeanDefinitionException;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.condition.*;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.*;

@SpringBootApplication(excludeName =
        "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration")
public class Main {
    public interface Notifier { String send(String msg); }

    @Configuration
    public static class DefaultsConfig {
        @Bean @ConditionalOnMissingBean
        Notifier defaultNotifier() { return m -> "LOG: " + m; }

        @Bean @ConditionalOnProperty(name = "app.audit.enabled", havingValue = "true")
        String auditMarker() { return "audit on"; }
    }

    @Configuration @Profile("sms")
    public static class SmsConfig {
        @Bean Notifier smsNotifier() { return m -> "SMS: " + m; }
    }

    static void run(String... args) {
        String[] all = new String[args.length + 1];
        all[0] = "--spring.main.web-application-type=none";
        System.arraycopy(args, 0, all, 1, args.length);
        try (ConfigurableApplicationContext ctx = SpringApplication.run(Main.class, all)) {
            String sent;
            try {
                sent = ctx.getBean(Notifier.class).send("meter offline");
            } catch (NoUniqueBeanDefinitionException e) {
                sent = "FAILS, 2 beans: " + String.join(", ",
                        ctx.getBeanNamesForType(Notifier.class));
            }
            System.out.printf("%-28s -> %s | audit? %b%n", String.join(" ", args),
                    sent, ctx.containsBean("auditMarker"));
        }
    }
    public static void main(String[] args) {
        run();
        run("--app.audit.enabled=true");
        run("--spring.profiles.active=sms");
    }
}
```

The property switch works as expected. The third run is the surprise: with the `sms` profile active there are **two** `Notifier` beans, and `getBean` fails with `NoUniqueBeanDefinitionException`. `@ConditionalOnMissingBean` did not back off, because conditions are evaluated in the order bean definitions are registered, and `DefaultsConfig` was processed **before** `SmsConfig` contributed its bean. At that moment no `Notifier` existed yet, so the default was created.

This is why the Spring Boot documentation says `@ConditionalOnMissingBean` is only reliable in **auto-configuration** classes: Spring Boot deliberately processes them after all user configuration, which is what makes "define your own bean and the default backs off" work for the beans Spring Boot creates. In your own configuration, express the choice directly: `@Profile("!sms")` on the default, or `@Primary` on the preferred bean.

> TIP: To see which auto-configurations matched and why, start the application with `--debug`: Spring Boot prints a **conditions evaluation report**. It is the fastest way to answer "why did Spring create (or not create) this bean?".

## 1.4 Configuration and profiles

Spring Boot reads configuration from many sources, and a higher source overrides a lower one. The most useful order to remember (highest first):

| Priority | Source | Example |
|---|---|---|
| 1 | Command-line arguments | `--server.port=9090` |
| 2 | Java system properties | `-Dserver.port=9090` |
| 3 | Environment variables (relaxed binding) | `SERVER_PORT=9090` |
| 4 | Profile-specific file | `application-prod.yml` when `prod` is active |
| 5 | `application.yml` / `application.properties` | `server.port: 8080` |
| 6 | Defaults in code | `@Value("${app.x:5}")` default 5 |

Type-safe configuration uses a record annotated with `@ConfigurationProperties`, with validation so that a misconfigured application fails at start-up instead of at the first request.

```java spring Type-safe configuration with validation
package demo;

import jakarta.validation.constraints.*;
import java.time.Duration;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.*;
import org.springframework.validation.annotation.Validated;

@SpringBootApplication(excludeName =
        "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration")
@EnableConfigurationProperties(Main.IngestProps.class)
public class Main {
    @Validated
    @ConfigurationProperties(prefix = "ingest")
    public record IngestProps(@Min(1) @Max(10_000) int batchSize,
                              @NotNull Duration flushEvery,
                              @NotBlank String topic) {}

    static void start(String... args) {
        String[] all = new String[args.length + 1];
        all[0] = "--spring.main.web-application-type=none";
        System.arraycopy(args, 0, all, 1, args.length);
        try (var ctx = SpringApplication.run(Main.class, all)) {
            System.out.println("started with " + ctx.getBean(IngestProps.class));
        } catch (Exception e) {
            Throwable root = e;
            while (root.getCause() != null) root = root.getCause();
            System.out.println("refused to start: " + root.getClass().getSimpleName());
        }
    }
    public static void main(String[] args) {
        start("--ingest.batch-size=500", "--ingest.flush-every=5s",
              "--ingest.topic=readings");
        start("--ingest.batch-size=0", "--ingest.flush-every=5s", "--ingest.topic=readings");
    }
}
```

The property `flush-every=5s` was converted to a `Duration` of 5 seconds (`PT5S`), and `batch-size` was bound to `batchSize` by **relaxed binding**. The second start fails because `batchSize` is 0, which violates `@Min(1)`: the application never starts serving with an invalid configuration.

## 1.5 The start-up sequence

```text
SpringApplication.run(Main.class, args)
 1. create the Environment: read properties, profiles, environment variables, arguments
 2. create the ApplicationContext (servlet web, reactive web, or none)
 3. register bean definitions: component scan + @Bean methods + auto-configuration
 4. BeanFactoryPostProcessors run (e.g. resolve ${...} placeholders)
 5. instantiate singletons: constructor -> dependency injection -> @PostConstruct
    -> BeanPostProcessors (this is where proxies for @Transactional, @Async are made)
 6. start the embedded web server (Tomcat) on server.port
 7. run CommandLineRunner / ApplicationRunner beans
 8. publish ApplicationReadyEvent
```

> TIP: "What happens when a Spring Boot application starts?" is a very common opening question. Walk through these eight steps in about a minute, and mention that proxies are created in step 5: that fact explains several traps in Chapters 2 and 5.

## 1.6 Practical lessons

- Spring is the container; Spring Boot adds starters, auto-configuration, an embedded server and externalised configuration.
- Auto-configuration is a set of conditional `@Configuration` classes; your own bean makes the default back off.
- Keep the main class in the root package so that component scanning finds everything.
- Use `@ConfigurationProperties` records with validation instead of scattered `@Value` fields.

# Chapter 2: Dependency Injection and Beans
%Constructor injection, choosing between several implementations, scopes, lifecycle, and the proxy behind the annotations

## 2.1 Inversion of control and dependency injection

Without a container, a class creates its own dependencies (`new SmtpMailer()`), which ties it to one implementation and makes it hard to test. With **dependency injection**, the class declares what it needs, usually as constructor parameters of interface types, and the container supplies them. This is the dependency inversion principle from the Low-Level Design guide, applied by a framework.

| Injection style | Example | Verdict |
|---|---|---|
| Constructor | `OrderService(PaymentGateway g)` | **Preferred**: dependencies are explicit, fields can be `final`, easy to test with `new` |
| Setter | `@Autowired void setGateway(...)` | For optional dependencies only |
| Field | `@Autowired private PaymentGateway g;` | Avoid: hidden dependencies, no `final`, needs reflection in tests |

Since Spring 4.3, a class with a **single constructor** does not need `@Autowired` at all.

## 2.2 Several implementations of one interface

When two beans implement the same interface, injecting the interface is ambiguous. Spring resolves it in this order: a bean marked `@Primary`; a `@Qualifier` naming the bean; a parameter name matching a bean name. You can also inject **all** implementations as a `List` or a `Map<String, T>` keyed by bean name, which is how the Strategy pattern is usually wired in Spring.

```java spring Primary, qualifier, and injecting every strategy
package demo;

import java.util.*;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.*;

@SpringBootApplication(excludeName =
        "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration")
public class Main {
    public interface Tariff { long priceInPaise(int units); }

    @Component("flat") @Primary
    public static class FlatTariff implements Tariff {
        public long priceInPaise(int units) { return units * 700L; }
    }
    @Component("slab")
    public static class SlabTariff implements Tariff {           // first 100 units cheaper
        public long priceInPaise(int units) {
            return Math.min(units, 100) * 500L + Math.max(0, units - 100) * 800L;
        }
    }
    @Component("timeOfDay")
    public static class TodTariff implements Tariff {
        public long priceInPaise(int units) { return units * 650L; }
    }

    @Service
    public static class Billing {
        final Tariff defaultTariff, slab;
        final Map<String, Tariff> all;
        Billing(Tariff defaultTariff, @Qualifier("slab") Tariff slab,
                Map<String, Tariff> all) {
            this.defaultTariff = defaultTariff;
            this.slab = slab;
            this.all = new TreeMap<>(all);              // sorted by bean name for printing
        }
    }

    public static void main(String[] args) {
        String[] noWeb = {"--spring.main.web-application-type=none"};
        try (var ctx = SpringApplication.run(Main.class, noWeb)) {
            Billing b = ctx.getBean(Billing.class);
            int units = 250;
            System.out.println("@Primary default -> "
                    + b.defaultTariff.getClass().getSimpleName());
            System.out.println("@Qualifier(slab) -> " + b.slab.getClass().getSimpleName());
            b.all.forEach((name, t) -> System.out.printf("  %-9s %d units = Rs %.2f%n",
                    name, units, t.priceInPaise(units) / 100.0));
        }
    }
}
```

Adding a new tariff is one new `@Component`: the `Map` picks it up automatically, so no existing class changes (open/closed principle). Money is kept in paise as a `long`, never as a `double`.

## 2.3 Bean scopes

| Scope | One instance per | Typical use |
|---|---|---|
| `singleton` (default) | Application context | Stateless services, repositories, controllers |
| `prototype` | Every injection or `getBean` call | Stateful helpers, builders |
| `request` | HTTP request | Request-specific data (web apps) |
| `session` | HTTP session | Per-user data (web apps) |

Singletons are shared by all threads serving requests, so they must be **stateless** or thread-safe. The classic scope trap: injecting a prototype bean into a singleton gives the singleton **one** prototype instance forever, because injection happens once. To get a fresh instance each time, inject an `ObjectProvider<T>` and call `getObject()`.

```java spring Scopes and the prototype-in-singleton trap
package demo;

import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.*;

@SpringBootApplication(excludeName =
        "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration")
public class Main {
    static final AtomicInteger CREATED = new AtomicInteger();

    @Component @Scope("prototype")
    public static class ReportBuilder {
        final int id = CREATED.incrementAndGet();
        final StringBuilder lines = new StringBuilder();
    }

    @Service
    public static class ReportService {
        private final ReportBuilder injectedOnce;
        private final ObjectProvider<ReportBuilder> fresh;
        ReportService(ReportBuilder b, ObjectProvider<ReportBuilder> p) {
            injectedOnce = b; fresh = p;
        }
        String wrong(String line) {
            injectedOnce.lines.append(line).append(';');
            return "builder #" + injectedOnce.id + " holds " + injectedOnce.lines;
        }
        String right(String line) {
            ReportBuilder b = fresh.getObject();
            b.lines.append(line).append(';');
            return "builder #" + b.id + " holds " + b.lines;
        }
    }

    public static void main(String[] args) {
        String[] noWeb = {"--spring.main.web-application-type=none"};
        try (var ctx = SpringApplication.run(Main.class, noWeb)) {
            ReportService s = ctx.getBean(ReportService.class);
            ReportService again = ctx.getBean(ReportService.class);
            System.out.println("same service bean? " + (s == again));
            System.out.println("wrong: " + s.wrong("meter A"));
            System.out.println("wrong: " + s.wrong("meter B"));
            System.out.println("right: " + s.right("meter A"));
            System.out.println("right: " + s.right("meter B"));
        }
    }
}
```

The "wrong" builder accumulates the data of both reports (and, in a web application, of every user's request). The "right" calls get a new builder each time: numbers 2 and 3, because number 1 was created for the constructor.

## 2.4 Lifecycle callbacks

A singleton is created, its dependencies are injected, then `@PostConstruct` runs (open connections, warm caches, validate state); at shutdown `@PreDestroy` runs. `CommandLineRunner` beans run after the whole context is ready, which is the place for start-up tasks that need other beans.

```java spring Lifecycle order
package demo;

import jakarta.annotation.*;
import org.springframework.boot.*;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

@SpringBootApplication(excludeName =
        "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration")
public class Main {
    @Component
    public static class MeterCache {
        MeterCache() { System.out.println("1. constructor"); }
        @PostConstruct void warm() { System.out.println("2. @PostConstruct: load meters"); }
        @PreDestroy void flush() { System.out.println("5. @PreDestroy: flush to disk"); }
    }
    @Bean CommandLineRunner runner(MeterCache cache) {
        return args -> System.out.println("3. CommandLineRunner: context is ready");
    }
    public static void main(String[] args) {
        String[] noWeb = {"--spring.main.web-application-type=none"};
        var ctx = SpringApplication.run(Main.class, noWeb);
        System.out.println("4. main: closing the context");
        ctx.close();
    }
}
```

## 2.5 Proxies: how annotations get their behaviour

`@Transactional`, `@Async`, `@Cacheable` and method security do not change your class. At start-up a `BeanPostProcessor` wraps the bean in a **proxy** (a generated subclass, using CGLIB) whose methods run extra code around the call to your object. Other beans receive the proxy, not the original object.

```text
caller ──> [ proxy: start transaction ] ──> your MeterService.save() ──> [ proxy: commit ]
                      ^
          this.save() inside MeterService itself skips the proxy entirely
```

Two consequences matter in interviews:

| Fact | Consequence |
|---|---|
| A call from one method to another **in the same object** (`this.x()`) does not pass through the proxy | `@Transactional`, `@Cacheable` on the inner method are silently ignored (Chapter 5 shows it) |
| CGLIB proxies subclass your class | `final` classes or methods, and `private` methods, cannot be advised |

```java spring A caching proxy and the self-invocation trap
package demo;

import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.*;
import org.springframework.stereotype.Service;

@SpringBootApplication(excludeName =
        "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration")
@EnableCaching
public class Main {
    @Service
    public static class TariffService {
        private final AtomicInteger dbCalls = new AtomicInteger();
        public int dbCalls() { return dbCalls.get(); }      // read state through a method
        @Cacheable("tariff")
        public long ratePerUnit(String region) { dbCalls.incrementAndGet(); return 700; }
        public long bill(String region, int units) {
            return ratePerUnit(region) * units;               // really this.ratePerUnit(...)
        }
    }
    public static void main(String[] args) {
        String[] noWeb = {"--spring.main.web-application-type=none"};
        try (var ctx = SpringApplication.run(Main.class, noWeb)) {
            TariffService s = ctx.getBean(TariffService.class);
            System.out.println("bean class is a proxy? "
                    + s.getClass().getName().contains("$$SpringCGLIB$$"));
            for (int i = 0; i < 3; i++) s.ratePerUnit("WB");
            System.out.println("3 external calls -> database calls: " + s.dbCalls());
            for (int i = 0; i < 3; i++) s.bill("WB", 100);
            System.out.println("3 bills (internal calls) -> database calls: "
                    + s.dbCalls());
        }
    }
}
```

> TRAP: The counter is read through the method `dbCalls()`, not the field. The first version of this program read `s.dbCalls` directly and crashed with a `NullPointerException`: `s` is the proxy, a separate object whose own copy of the field was never initialised, because Spring creates proxies without running your constructor. Method calls are forwarded to the real object; field access is not. Never read or write fields of an injected bean from outside.

The three external calls hit the database once and the cache twice. The three `bill` calls each call `ratePerUnit` through `this`, bypass the proxy, and hit the database every time: the cache annotation is simply not consulted. The fixes are to move the cached method into another bean (cleanest), or to inject the bean into itself (`@Lazy` self-reference) and call through that.

## 2.6 Practical lessons

- Use constructor injection with `final` fields; one constructor needs no `@Autowired`.
- Several implementations: `@Primary` for the default, `@Qualifier` for a specific one, `Map<String, T>` for strategies.
- Singletons are shared across threads: keep them stateless. Use `ObjectProvider` to get fresh prototypes.
- Annotation behaviour lives in proxies; internal `this.` calls bypass them.
