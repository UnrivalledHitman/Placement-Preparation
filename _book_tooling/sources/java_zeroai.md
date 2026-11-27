# Chapter 1: Struggle-First Zero-AI Protocol & TCS NQT Survival
%Building real Java SDE-1 fluency for proctored OAs and blank-IDE backend interviews

Proctored TCS NQT (Digital/Prime) coding rounds and 8–15 LPA Java Backend SDE-1 technical loops share one brutal constraint: **zero AI autocomplete, zero Stack Overflow copy-paste, and strict timers**. Relying on AI completions during practice creates blank-IDE freeze when a compiler error or unexpected test case hits during an interview.

## 1.1 The Struggle-First Blank-IDE Protocol

Apply this discipline to every Java DSA drill, project feature, and Friday Proof Gate:

| Stage | Window | Allowed | Forbidden |
|---|---|---|---|
| 1. Decompose | 5–10 min | Paper diagram, method signatures, edge-case list | AI chat, Copilot, Tabnine, Cursor Tab |
| 2. Cold Code | 30–45 min | Plain IDE/editor, `javac`, Maven/Gradle, Javadoc | Copying full classes or SQL queries |
| 3. Targeted Check | 10 min | Single Repo PDF chapter or official Spring/Java docs | Watching long video tutorials linearly |
| 4. Verify & Log | 10 min | JUnit 5 tests, `EXPLAIN`, one-line error note | Moving on with untested code |

> TRAP: Reading a Spring Boot or DSA solution and thinking "that makes sense" builds zero recall under interview pressure. If you could not compile and test it from a blank file, flag it `~ Redo` and re-solve it cold 7 days later.

## 1.2 TCS NQT Stdin/Stdout Coding Survival Checklist

TCS NQT Digital/Prime coding questions run in strict stdin/stdout judges where I/O quirks and integer overflow fail otherwise-correct algorithms.

### Fast I/O: `BufferedReader` vs `Scanner` Traps

1. **The `Scanner.nextInt()` + `nextLine()` trap:** `nextInt()` leaves the trailing `\n` in the input buffer, so the very next `nextLine()` returns an empty string `""`. Either call `Integer.parseInt(sc.nextLine().trim())` or use `BufferedReader` + `StringTokenizer`.
2. **TLE on `10^5` lines:** `Scanner` uses heavy regex parsing and `System.out.println` flushes on every line. Use `BufferedReader` + `StringBuilder` for every array/graph input over `10^4` elements.

```java Zero-trap TCS NQT fast stdin/stdout template (Main.java)
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null || line.trim().isEmpty()) return;
        int n = Integer.parseInt(line.trim());

        long[] a = new long[n];
        int idx = 0;
        while (idx < n && (line = br.readLine()) != null) {
            StringTokenizer st = new StringTokenizer(line);
            while (st.hasMoreTokens() && idx < n) {
                a[idx++] = Long.parseLong(st.nextToken());
            }
        }
        StringBuilder sb = new StringBuilder();
        long sum = 0L;
        for (long x : a) sum += x;
        sb.append(sum).append('\n');
        System.out.print(sb);
    }
}
```

### Overflow, Precision & Edge-Case Checklist

- **`long` overflow:** Whenever `n <= 10^5` and `a[i] <= 10^9`, sums reach `10^14` and products reach `10^18` — exceeding `Integer.MAX_VALUE` (`2.14e9`). Always cast `(long) x * y` **before** multiplication.
- **Negative modulo in Java:** `-7 % 5 == -2` in Java (unlike Python). Normalize with `((x % MOD) + MOD) % MOD`.
- **String equality:** Never compare `String` or boxed `Integer` (`> 127`) with `==`; always use `.equals(...)`.
- **Mandatory edge cases before submit:** `n = 0` or `n = 1`, all identical values, all negatives, `Integer.MAX_VALUE`, sorted vs reverse-sorted, trailing whitespace in stdin.

# Chapter 2: Mini-Project 0 & Flagship Project 1 Specifications
%From raw JDBC transactions (Wks 11–12) to a production Spring Boot 3 API (Wks 15–18)

## 2.1 Mini-Project 0: Pure Java + JDBC Expense/Library Ledger (Weeks 11–12)

Before touching a single Spring annotation, build a clean multi-layered Java application with **zero frameworks** so you understand exactly what Spring Boot automates (connection pooling, transaction boundaries, dependency injection, and exception translation).

| Requirement | Concrete Implementation Standard |
|---|---|
| Persistence | MySQL 8 + HikariCP `DataSource` + `PreparedStatement` only (zero string concatenation SQL) |
| Architecture | Constructor-injected `Repository (DAO) -> Service -> CLI/Runner` interfaces |
| Transactions | Manual `conn.setAutoCommit(false)`, atomic balance/inventory transfer, explicit `rollback()` on exception |
| Concurrency | Thread-safe worker test proving concurrent transfers do not corrupt balances |
| Verification | JUnit 5 tests demonstrating SQLi payload safely treated as literal string + rollback on failure |

```java Manual JDBC atomic transfer proving what @Transactional hides
public void transfer(long fromId, long toId, long amountPaise) throws SQLException {
    try (Connection conn = dataSource.getConnection()) {
        conn.setAutoCommit(false);
        try {
            String debit = "UPDATE accounts SET balance_paise = balance_paise - ? "
                         + "WHERE id = ? AND balance_paise >= ?";
            try (PreparedStatement ps = conn.prepareStatement(debit)) {
                ps.setLong(1, amountPaise);
                ps.setLong(2, fromId);
                ps.setLong(3, amountPaise);
                if (ps.executeUpdate() != 1) {
                    throw new IllegalStateException("Insufficient balance");
                }
            }
            String credit = "UPDATE accounts SET balance_paise = balance_paise + ? "
                          + "WHERE id = ?";
            try (PreparedStatement ps = conn.prepareStatement(credit)) {
                ps.setLong(1, amountPaise);
                ps.setLong(2, toId);
                ps.executeUpdate();
            }
            conn.commit();
        } catch (Exception ex) {
            conn.rollback();
            throw ex;
        }
    }
}
```

## 2.2 Flagship Project 1: Spring Boot 3 Production REST API (Weeks 15–18)

Build either a **Smart-Meter Telemetry & Billing API** or an **Order & Inventory Management API** across four full weeks (~58h). Do not skip migrations, security, or integration tests.

### Non-Negotiable Production Checklist

1. **Schema & Flyway Migrations:** PostgreSQL 16 + Flyway (`V1__init.sql`, `V2__indexes_and_checks.sql`) with `spring.jpa.hibernate.ddl-auto=validate` (never `update` in production). All money in integer paise (`BIGINT`).
2. **Spring Security + Stateless JWT + RBAC:** BCrypt/Argon2id password hashing, `OncePerRequestFilter` validating signed JWTs, strict ownership checks (`userId` from `SecurityContext`, never `RequestBody`), and role-gated `/api/admin/**` routes.
3. **JPA/Hibernate Performance & `@Transactional` Discipline:**
   - Detect and eliminate N+1 queries using `JOIN FETCH` / `@EntityGraph` (verified via SQL query count test).
   - Understand Spring AOP proxy traps: self-invocation (`this.internalTx()`) bypasses `@Transactional`; checked exceptions do not roll back unless `rollbackFor = Exception.class`.
   - Use DTO records (`record OrderResponse(...)`) — never return raw `@Entity` graphs from controllers.
4. **Validation & Global Error Handling:** Jakarta Bean Validation (`@Valid`, `@NotBlank`, `@Positive`) + `@RestControllerAdvice` returning RFC-7807 `ProblemDetail` JSON.
5. **Testing Pyramid:** Unit tests (JUnit 5 + Mockito) + `@WebMvcTest` slice tests + **Testcontainers (`PostgreSQLContainer`)** end-to-end integration tests verifying migrations, JWT auth, 403 RBAC, and transactional rollback.
6. **Delivery:** Multi-stage Docker + `docker-compose.yml`, OpenAPI/Swagger UI (`/swagger-ui.html`), and green GitHub Actions CI (`mvn test`).

# Chapter 3: Flagship Project 2 — Redis, Locking & Idempotency
%Shipping a high-integrity Booking or Wallet API (Weeks 19–21)

Flagship Project 2 proves you can handle real concurrency, abuse protection, and network retries without over-engineering into Kubernetes or Kafka.

## 3.1 Core Architectural Pillars

| Pillar | What You Build | Production Failure Prevented |
|---|---|---|
| Redis Cache-Aside | Cache hot reads with TTL + jitter; explicit eviction on write | DB read overload & cache stampede |
| Redis Rate Limiter | Atomic Lua token-bucket / sliding-window filter returning `429` + `Retry-After` | Brute-force & noisy-neighbor outages |
| Row-Level Locking | Atomic `UPDATE ... WHERE stock >= ?` or `SELECT ... FOR UPDATE` in sorted ID order | Double-booking, negative wallets & AB/BA deadlocks |
| Idempotency Keys | Unique `idempotency_keys(key_hash, user_id)` storing serialized response inside the same DB transaction | Duplicate charges when clients or payment webhooks retry |
| Async Jobs | `@Async` / transactional outbox worker with bounded retry for receipts/emails | Slow HTTP latency & lost notifications |

```java Conditional atomic booking/debit query in Spring Data JPA
@Modifying
@Query("UPDATE Wallet w SET w.balancePaise = w.balancePaise - :amt "
     + "WHERE w.id = :id AND w.balancePaise >= :amt")
int debitIfSufficient(@Param("id") Long id, @Param("amt") long amountPaise);
```

## 3.2 Multi-Stage Slim Java Dockerfile & GitHub Actions CI

Package the fat Spring Boot JAR using a multi-stage build (`maven:3.9-eclipse-temurin-21` -> `eclipse-temurin:21-jre-alpine`), run as a non-root `app` user, expose `/actuator/health`, and run `mvn -B verify` (including Testcontainers) in GitHub Actions on every push.

# Chapter 4: 3 Cold 60-Minute Java LLD Machine-Coding Rubrics
%Depth over speed-running: code each design from a blank IDE in 60 minutes (Weeks 22–24)

In SDE-1 machine-coding rounds, interviewers grade **clean interfaces, SOLID separation, concurrency safety, and runnable demo tests** — never 41 half-read UML sketches.

## 4.1 LLD 1: Multi-Floor Parking Lot (60-Minute Rubric)

- **Core Entities:** `Vehicle` (`MOTORCYCLE`, `COMPACT`, `LARGE`), `ParkingSpot`, `ParkingFloor`, `Ticket`, `ParkingLot`.
- **Required Patterns:** `SpotAllocationStrategy` (Nearest-First) and `PricingStrategy` (Hourly + Flat cap) injected via constructor.
- **Concurrency Invariant:** Thread-safe `parkVehicle` / `unparkVehicle` using per-floor `ReentrantLock` or atomic spot claim so two entry gates never assign the same spot.
- **Pass Criteria:** Compiles cleanly, handles full-lot exception, proves thread-safety with `ExecutorService` 10-thread test, and computes exact fee.

## 4.2 LLD 2: Thread-Safe Token-Bucket Rate Limiter (60-Minute Rubric)

- **Core Interface:** `interface RateLimiter { boolean allowRequest(String clientId); }`
- **Token-Bucket Implementation:** Store `ConcurrentHashMap<String, Bucket>`; refill tokens lazily using `System.nanoTime()` (monotonic clock, immune to wall-clock NTP jumps!), cap at `capacity`, and synchronize per-client `Bucket` (not global lock!).
- **Extensibility:** Add a second strategy (`SlidingWindowLogRateLimiter`) implementing `RateLimiter` without changing callers.
- **Pass Criteria:** Clean burst handling, accurate refill over injected `Clock`/`LongSupplier` (making unit tests instant and deterministic — zero `Thread.sleep` flakiness!).

## 4.3 LLD 3: Splitwise Expense Sharing Engine (60-Minute Rubric)

- **Core Entities:** `User`, `Group`, `Expense`, `Split` (`EQUAL`, `EXACT`, `PERCENT`) — all amounts in integer `long` paise (exact penny-remainder distribution on uneven equal splits!).
- **Validation:** `EXACT` splits must sum to total paise; `PERCENT` basis points must sum to `10000`.
- **Simplification Engine:** Net balances per user, then greedily settle max-creditor against max-debtor using two `PriorityQueue`s to minimize transaction count.
- **Pass Criteria:** Zero floating-point drift, clean `SplitValidator` strategy, and JUnit test proving net balance conservation (`sum == 0`) before and after simplification.

# Chapter 5: 12 Weekly Phase-2 Friday Zero-AI Proof Gates (J1.1–J6.2)
%Attempt one gate every Friday across Weeks 13–24 in a blank IDE with AI turned off

Mark `✓` when all tests pass without AI assistance, `~` if you needed a hint, and `✗` if you checked a solution (schedule a 7-day blank-IDE redo).

## Part 1: Security & Spring Boot Foundations (Weeks 13–16)

**J1.1 · Medium · Code · BCrypt/Argon2 Password Service & Tamper-Proof JWT Utility.** From a blank Maven project, write a password hasher + HS256 JWT issuer/verifier (rejecting expired, tampered, and `alg: none` tokens) with 8 passing JUnit 5 tests.

**J1.2 · Medium · Debug · OWASP IDOR, SQLi & CORS Hardening Audit.** Given a vulnerable JDBC/Servlet endpoint accepting `?userId=` and string-concatenated SQL, rewrite it with `PreparedStatement`, session-derived identity, strict CORS allowlist, and exploit regression tests.

**J2.1 · Medium · Build · Spring Boot REST CRUD, Bean Validation & ProblemDetail.** Build a vertical slice (`Controller -> Service -> Repository`) with Java `record` DTOs, Jakarta `@Valid` constraints, and `@RestControllerAdvice` returning RFC-7807 `ProblemDetail` + `@WebMvcTest` suite.

**J2.2 · Hard · Debug · JPA N+1 Detection & `@Transactional` Rollback Proof.** Reproduce an N+1 query and a `@Transactional` self-invocation bug in an integration test, fix the N+1 with `JOIN FETCH` / `@EntityGraph`, and assert exact query count and DB rollback.

## Part 2: Flagship Projects 1 & 2 Production Gates (Weeks 17–21)

**J3.1 · Hard · Build · Spring Security JWT Filter + Role-Gated Admin Endpoints.** Implement `OncePerRequestFilter`, stateless `SecurityFilterChain`, `/auth/login`, `/api/me`, and `@PreAuthorize("hasRole('ADMIN')")` with MockMvc tests proving `401`, `403`, and `200`.

**J3.2 · Hard · Test · Flyway Migrations + Testcontainers Postgres Integration Gate.** Wire `V1__init.sql` + `ddl-auto=validate` and a `PostgreSQLContainer` `@SpringBootTest` verifying end-to-end register -> login -> create order -> DB persistence in CI.

**J4.1 · Medium · Build · Redis Cache-Aside with Explicit Write Invalidation.** Add Spring Data Redis caching with TTL + jitter on product/account reads, prove cache hit vs DB miss, and assert immediate eviction after `PUT`/`DELETE`.

**J4.2 · Hard · Build · Atomic Redis Lua Rate Limiter (`429` + `Retry-After`).** Implement a Redis-backed token-bucket HTTP filter returning `429 Too Many Requests` + `Retry-After` once quota is exceeded, verified against a Testcontainers Redis container.

**J5.1 · Hard · Build · Concurrent Row-Locking & Idempotency-Key Payment Gate.** Build a `/v1/transfers` endpoint enforcing `Idempotency-Key` uniqueness + atomic `WHERE balance_paise >= :amt`; fire 10 parallel threads and assert zero overdraft and exact single execution on key replay.

## Part 3: Cold 60-Min Java LLD & Final Interview Gates (Weeks 22–24)

**J5.2 · Hard · Design · Cold 60-Min LLD Gate 1: Thread-Safe Parking Lot.** From a blank IDE in 60 minutes (AI off), implement multi-floor Parking Lot with pluggable allocation/pricing strategies and a multi-threaded `ExecutorService` test.

**J6.1 · Hard · Design · Cold 60-Min LLD Gate 2: Deterministic Token-Bucket Rate Limiter.** From a blank IDE in 60 minutes (AI off), build per-client Token-Bucket + Sliding-Window strategies with injected monotonic clock and deterministic burst/refill JUnit tests.

**J6.2 · Hard · Design · Cold 60-Min LLD Gate 3: Integer-Paise Splitwise + Whiteboard Defense.** Implement Splitwise (`EQUAL`/`EXACT`/`PERCENT` + greedy debt simplification) in 60 minutes, then deliver a 20-minute zero-note whiteboard defense of Flagship Projects 1 & 2.

## Hints (Read Only After 30 Minutes of Unassisted Effort)

| Exercise | Targeted Hint |
|---|---|
| J1.1 | Pin `HS256` explicitly in your JWT parser and enforce a minimum 256-bit secret key length at startup. |
| J1.2 | Derive the acting user ID strictly from the verified token/session principal; never trust a path or query parameter for ownership. |
| J2.1 | Return `ProblemDetail.forStatusAndDetail(...)` from `@ExceptionHandler(MethodArgumentNotValidException.class)` and populate field errors as properties. |
| J2.2 | Move the `@Transactional` method into a separate Spring bean so calls pass through the AOP proxy, and assert SQL count using a datasource proxy or Hibernate `Statistics`. |
| J3.1 | Disable session state with `SessionCreationPolicy.STATELESS`, register your JWT filter before `UsernamePasswordAuthenticationFilter`, and catch invalid JWTs cleanly as `401`. |
| J3.2 | Annotate the test container with `@ServiceConnection` (Spring Boot 3.1+) so datasource URL/credentials wire automatically with zero manual `@DynamicPropertySource` boilerplate. |
| J4.1 | Always evict the cache key **after** the DB commit succeeds (or inside `@TransactionalEventListener(phase = AFTER_COMMIT)`) so failed transactions do not leave stale cache state. |
| J4.2 | Execute check-and-decrement inside a single Redis Lua script so two concurrent requests cannot both read `tokens == 1` and bypass the limit. |
| J5.1 | Use a unique index on `(user_id, idempotency_key)` and catch `DataIntegrityViolationException` to return the stored response on concurrent retries. |
| J5.2 | Keep `ParkingFloor` responsible for its own `ReentrantLock` and avoid holding two floor locks simultaneously. |
| J6.1 | Inject `LongSupplier nanoClock` (`System::nanoTime` in prod, `AtomicLong` in tests) so burst and refill assertions run in `< 10 ms`. |
| J6.2 | Distribute uneven `EQUAL` split remainders (`amount % n`) by giving `+1` paisa to the first `r` participants so total paise always equals the exact bill. |

## Verification Rubrics & Solution Checkpoints

### J1.1 Password & JWT Utility Checkpoint
Confirm BCrypt/Argon2 hashes use unique salts, expired tokens throw `ExpiredJwtException`, and modified payload/signature bytes fail verification.

### J1.2 OWASP IDOR & SQLi Checkpoint
Confirm `' OR '1'='1` returns zero unauthorized rows, User A requesting User B's resource returns `403`, and unknown origins receive no `Access-Control-Allow-Origin` header.

### J2.1 Spring REST & Validation Checkpoint
Confirm invalid payloads return `400` with `ProblemDetail` field messages and controllers accept/return immutable Java `record` DTOs only.

### J2.2 JPA N+1 & `@Transactional` Checkpoint
Confirm query count drops from `1 + N` to `1` after `JOIN FETCH`, and an injected runtime exception rolls back all DB writes in the transaction.

### J3.1 Spring Security JWT Filter Checkpoint
Confirm missing/bad token -> `401`, customer hitting `/api/admin/**` -> `403`, admin hitting `/api/admin/**` -> `200`, and zero HTTP sessions created.

### J3.2 Flyway + Testcontainers Checkpoint
Confirm `mvn test` boots a real Postgres container, applies Flyway migrations cleanly, and passes full register -> auth -> order flow.

### J4.1 Redis Cache-Aside Checkpoint
Confirm repeated GETs serve from Redis (0 DB hits) and a PUT/DELETE invalidates the key so the next GET returns fresh DB state.

### J4.2 Redis Lua Rate Limiter Checkpoint
Confirm requests `1..K` return `200`, request `K+1` returns `429` with numeric `Retry-After`, and quota resets cleanly after the window elapses.

### J5.1 Locking & Idempotency Checkpoint
Confirm 10 concurrent debits against balance `300` (each `100`) succeed exactly 3 times (`balance == 0`), and replaying an `Idempotency-Key` returns the cached result with zero double debit.

### J5.2 Cold Parking Lot LLD Checkpoint
Confirm 10 concurrent threads parking 10 vehicles into 10 spots yield 10 unique spot assignments and the 11th throws `LotFullException`.

### J6.1 Cold Rate Limiter LLD Checkpoint
Confirm deterministic clock-injected tests verify burst capacity, partial token refill, cap enforcement, and per-client isolation with zero `Thread.sleep`.

### J6.2 Cold Splitwise LLD & Defense Checkpoint
Confirm paise conservation holds on `1000 / 3` split (`334 + 333 + 333`), greedy simplification reduces transaction count, and you defended both Flagship Projects cold under 20 minutes.

## Progress Tracker

<<TRACKER>>
