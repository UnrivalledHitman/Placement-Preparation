# How to use this practice book
%31 exercises matching the Spring Boot Backend guide, with hints kept separate and executed solutions

Each part matches chapters of the **Spring Boot Backend** guide. Work in a real project generated at start.spring.io (Java 21, Spring Boot 3, with Web, Data JPA, Validation, H2, Actuator and, for Part 5, Security). Write the code, run it, and check the behaviour yourself before reading the solution. Every Code solution is a complete single-file Spring Boot program (or plain Java where Spring adds nothing) whose output is shown; the programs run exactly as described in the guide's "How to use this guide" section.

| Type | What you do |
|---|---|
| Concept | Explain, classify or predict, in words |
| Numerical | Estimate or compute a number, then check it |
| Code | Build and run a working program |
| Design | Choose endpoints, entities or an architecture, and justify the choices |

**Marking scheme.** Mark each attempt ✓ (solved alone), ~ (solved with the hint) or ✗ (needed the solution). For Code exercises, also check: does it return the right status codes, does it handle the edge case the exercise mentions, and could you explain every annotation you used? Redo every ~ and ✗ a week later and record it in the tracker.

| Part | Guide chapters | Topic | Exercises |
|---|---|---|---|
| 1 | 1–2 | Spring core: configuration, beans, scopes, lifecycle | 5 |
| 2 | 3 | REST APIs | 5 |
| 3 | 4 | JPA and Hibernate | 5 |
| 4 | 5 | Transactions | 4 |
| 5 | 6 | Security | 4 |
| 6 | 7–9 | Testing and operations | 4 |
| 7 | 10 | Extending the smart-meter project | 4 |

# Exercises

## Part 1: Spring core

**B1.1 · Easy · Concept · Pick the annotation.** Which annotation or mechanism fits each case? (a) Register a `java.time.Clock` (a JDK class) as a bean; (b) mark a class holding business rules; (c) mark a data-access class so that SQL exceptions are translated; (d) choose one of two `PaymentGateway` beans by default; (e) create a bean only when `app.sms.enabled=true`; (f) run code once after the whole context has started.

**B1.2 · Easy · Concept · Which value wins?** `server.port` is set to 8080 in the defaults, 9090 as a Java system property, and 7070 as a command-line argument. Which port does the application use, and which would it use without the argument? Write a program that confirms the order.

**B1.3 · Medium · Code · Bind a tariff from configuration.** Bind a list of tariff slabs from properties (`tariff.slabs[0].upto=100`, `tariff.slabs[0].paise=500`, …) into a validated `@ConfigurationProperties` record, and use it to compute the bill for 250 units. An empty list or a negative price must stop the application from starting.

**B1.4 · Medium · Code · A circular dependency.** `BillingService` needs `NotificationService` to send bills, and `NotificationService` needs `BillingService` to look up the amount due. Show what happens at start-up with constructor injection, then remove the cycle without field injection or `@Lazy`.

**B1.5 · Medium · Concept · Who destroys a prototype?** A prototype bean and a singleton bean both have `@PreDestroy` methods. Predict which callbacks run when the context closes, then verify, and explain the consequence for prototypes that hold resources.

## Part 2: REST APIs

**B2.1 · Easy · Concept · Choose the status code.** Give the HTTP status for: (a) a meter was created; (b) a meter was deleted; (c) `GET /meters/42` for a missing meter; (d) a body with `kwh = -3`; (e) registering a serial that already exists; (f) a valid token but not allowed; (g) no token; (h) the database is down; (i) a client sends too many requests per minute.

**B2.2 · Medium · Code · A PATCH endpoint.** Add `PATCH /meters/{id}` that changes only the fields present in the body (`location`, `consumer`), rejects an unknown field with 400, a blank value with 400, and a missing meter with 404.

**B2.3 · Medium · Code · Paginated, sorted readings.** Expose `GET /meters/{serial}/readings?page=0&size=3&sort=ts,desc` backed by Spring Data's `Pageable`, and return a page DTO with the items, page number, total elements and total pages. Do not return Spring's `Page` object directly.

**B2.4 · Medium · Code · Idempotency keys.** Implement `POST /payments` with an `Idempotency-Key` header: the first request charges and returns 201; a retry with the same key and body returns the same response without charging again; the same key with a different body returns 422; no key returns 400.

**B2.5 · Medium · Design · Endpoints for EV charging.** Design the REST resources for an EV-charging app: stations with connectors, live availability, reservations (create, cancel, expire), charging sessions (start, stop, energy delivered) and invoices. Give methods, paths, status codes and one idempotency decision.

## Part 3: JPA and Hibernate

**B3.1 · Medium · Code · N+1 on the many side.** List 12 readings with the serial of their meter (`@ManyToOne(fetch = LAZY)`, 4 meters). Count the SQL statements, then fix it so that one statement is used.

**B3.2 · Medium · Code · A projection report.** Return the top 3 meters by total consumption as `record TopMeter(String serial, double kwh)` with one JPQL query, without loading any entity.

**B3.3 · Medium · Code · Batch fetching.** With 12 meters of 2 readings each, show the statement count of iterating `findAll()` and their readings with and without `hibernate.default_batch_fetch_size=5`, and explain the number you get.

**B3.4 · Easy · Concept · Mapping vocabulary.** Explain: (a) the default fetch type of each relationship annotation; (b) the owning side of a bidirectional `@OneToMany`/`@ManyToOne`; (c) `cascade = ALL` versus `orphanRemoval = true`; (d) why entities need a no-argument constructor; (e) `GenerationType.IDENTITY` versus `SEQUENCE` for batch inserts.

**B3.5 · Hard · Code · Bulk update and a stale context.** Raise the tariff of all 50 meters in a location: first by loading and modifying entities, then with one `@Modifying` JPQL `update`. Count the statements of each, and show the stale-data trap of the bulk update and how `clearAutomatically` fixes it.

## Part 4: Transactions

**B4.1 · Easy · Concept · Will it roll back?** For each, say whether the database change is rolled back: (a) `@Transactional` public method throws `IllegalStateException`; (b) it throws `IOException`; (c) it catches the exception and logs it; (d) `@Transactional` on a private method called from a public one in the same class, which throws a runtime exception; (e) the method is public and transactional but called via `this` from a non-transactional method; (f) `@Transactional(rollbackFor = Exception.class)` throwing `IOException`.

**B4.2 · Medium · Code · Fix self-invocation properly.** A `ReportService.generateAll()` loops over meters and calls its own `@Transactional(propagation = REQUIRES_NEW) generateOne(meter)` so that one failure does not undo the others. It does not work. Show the bug (all reports roll back together) and fix it.

**B4.3 · Medium · Code · An atomic transfer.** Transfer prepaid credit between two consumers' wallets: debit one, credit the other. If the credit fails (the receiving wallet is blocked), the debit must be undone. Show both a successful and a failed transfer with the balances.

**B4.4 · Hard · Code · Retry on optimistic-lock conflicts.** Two top-ups to the same wallet race; the loser gets an optimistic-locking failure. Write a service that retries the whole transaction (up to 3 attempts), simulate the conflict deterministically, and show that both top-ups are applied exactly once.

## Part 5: Security

**B5.1 · Easy · Concept · 401 or 403?** (a) No `Authorization` header; (b) an expired JWT; (c) a valid token for a USER calling an ADMIN endpoint; (d) a token signed with the wrong key; (e) a valid ADMIN token but the endpoint's `@PreAuthorize` requires ownership of the resource; (f) wrong password at `/auth/login`.

**B5.2 · Medium · Code · Ownership with @PreAuthorize.** Users may read only their own meter's usage (`GET /consumers/{name}/usage`); admins may read anyone's. Use HTTP Basic with in-memory users and `@PreAuthorize`, and show the status codes for the owner, another user, the admin and an anonymous caller.

**B5.3 · Medium · Code · Login throttling.** Lock an account for 15 minutes after 3 consecutive failed logins (answer 429 while locked), reset the counter on success, and test it deterministically with an injected clock.

**B5.4 · Medium · Concept · JWT design questions.** Answer: (a) Where should a browser app keep tokens? (b) How do you log a user out with stateless JWTs? (c) HS256 or RS256 when ten services verify tokens issued by one auth service? (d) What belongs in the payload, and what never? (e) Why short access tokens plus refresh tokens?

## Part 6: Testing and operations

**B6.1 · Medium · Code · Parameterised tests for the tariff.** Test the slab bill function of the guide's Chapter 10 with a JUnit 5 `@ParameterizedTest` covering 0, 1, 100, 101, 300, 301 and 1000 units, and a test that rounding of fractional units is half-up.

**B6.2 · Medium · Code · Assert the error contract.** Write `@WebMvcTest` tests asserting that invalid input returns 400 with `application/problem+json` and a `fields` map naming each invalid field, and that a missing meter returns 404 with a `detail` message.

**B6.3 · Medium · Code · Measure latency with a Timer.** Record ingestion latencies with a Micrometer `Timer` and print the count, total, mean and maximum. Use fixed durations so that the output is deterministic, and explain why a mean is not enough for alerting.

**B6.4 · Easy · Concept · Liveness or readiness?** Classify each check, or reject it: (a) the JVM can answer HTTP; (b) the database connection pool can get a connection; (c) the cache warm-up after start-up has finished; (d) a downstream payment API is slow; (e) a deadlock has frozen all request threads; (f) disk is 99 % full on the log volume.

## Part 7: Extending the smart-meter project

**B7.1 · Hard · Code · Concurrent duplicate uploads.** Two retries of the same batch arrive at the same moment, so both pass the "already stored?" check and one insert violates the unique constraint. Make ingestion survive the race (accepted + duplicates still correct), and simulate the race deterministically.

**B7.2 · Medium · Code · Bill in Indian time.** Billing months are defined in IST (UTC+05:30), but readings are stored in UTC. Show a reading that falls in different months in UTC and IST, and compute the correct IST monthly totals.

**B7.3 · Medium · Code · Silent-meter alert.** Find meters that have sent no reading for more than 6 hours (or never), with one JPQL query and an injected clock, as the body of a `@Scheduled` job.

**B7.4 · Hard · Numerical · Scale the ingestion.** One million meters each send a reading every 15 minutes, as a batch once an hour. Estimate readings per second, requests per second, raw storage per day and per year (about 40 bytes per reading plus 2× for indexes), and say which parts of the Chapter 10 design change first.
