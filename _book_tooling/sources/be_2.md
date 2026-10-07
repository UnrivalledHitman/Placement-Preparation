# Chapter 5: Transactions
%What @Transactional really does, when it silently does nothing, propagation, isolation and optimistic locking

## 5.1 What the annotation does

`@Transactional` on a public method of a Spring bean makes the proxy (Chapter 2.5) do this around your call:

```text
proxy.placeOrder()
  begin transaction (or join the caller's, depending on propagation)
  try   { target.placeOrder(); commit }
  catch (RuntimeException | Error e) { rollback; rethrow }
  catch (checked Exception e)        { COMMIT; rethrow }      <- surprises people
```

Inside the transaction, every repository call uses the same database connection and the same persistence context. Combined with dirty checking (Chapter 4.2), that is what lets a service change several entities and have all of the changes committed, or none.

## 5.2 Rollback rules and the self-invocation trap

Two behaviours cause most "my transaction did not roll back" bugs: checked exceptions commit by default, and a call to a `@Transactional` method from inside the same class does not go through the proxy, so no transaction is started at all.

```java spring Rollback rules, rollbackFor, and self-invocation
package demo;

import jakarta.persistence.*;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@SpringBootApplication
@EnableJpaRepositories(considerNestedRepositories = true)
public class Main {
    @Entity public static class Payment {
        @Id @GeneratedValue Long id;
        long paise;
        protected Payment() {}
        Payment(long p) { paise = p; }
    }
    public interface PaymentRepo extends JpaRepository<Payment, Long> {}
    public static class GatewayDown extends Exception {}          // a checked exception

    @Service
    public static class Payments {
        private final PaymentRepo repo;
        Payments(PaymentRepo repo) { this.repo = repo; }

        @Transactional
        public void unchecked() {
            repo.save(new Payment(100));
            throw new IllegalStateException();
        }

        @Transactional
        public void checked() throws GatewayDown {
            repo.save(new Payment(200));
            throw new GatewayDown();
        }

        @Transactional(rollbackFor = GatewayDown.class)
        public void checkedWithRule() throws GatewayDown {
            repo.save(new Payment(300));
            throw new GatewayDown();
        }

        public void outer() { inner(); }                           // this.inner(): no proxy
        @Transactional
        public void inner() {
            System.out.println("  inside inner(): transaction active? "
                    + TransactionSynchronizationManager.isActualTransactionActive());
        }
    }

    public static void main(String[] args) {
        String[] noWeb = {"--spring.main.web-application-type=none"};
        try (var ctx = SpringApplication.run(Main.class, noWeb)) {
            Payments p = ctx.getBean(Payments.class);
            PaymentRepo repo = ctx.getBean(PaymentRepo.class);
            try { p.unchecked(); } catch (Exception e) {}
            System.out.println("after RuntimeException: rows = " + repo.count());
            try { p.checked(); } catch (Exception e) {}
            System.out.println("after checked exception: rows = " + repo.count());
            try { p.checkedWithRule(); } catch (Exception e) {}
            System.out.println("after checked + rollbackFor: rows = " + repo.count());
            System.out.println("calling inner() through the proxy:");
            p.inner();
            System.out.println("calling outer(), which calls this.inner():");
            p.outer();
        }
    }
}
```

The payment of 200 survives although the method threw: the checked `GatewayDown` exception led to a commit. With `rollbackFor`, the third payment was rolled back. Many teams set `rollbackFor = Exception.class` everywhere, or use only unchecked exceptions in services, to avoid the surprise.

| Situation | Transaction? | Fix |
|---|---|---|
| `@Transactional` on a `private` method | No (proxies cannot intercept it) | Make it public, on a bean called from outside |
| Called via `this.method()` from the same class | No | Move it to another bean, or call through an injected self-reference |
| Exception caught inside the method | Commits (the proxy never sees it) | Rethrow, or call `TransactionAspectSupport.currentTransactionStatus().setRollbackOnly()` |
| Checked exception thrown | Commits | `rollbackFor = Exception.class` |
| Object created with `new` | No (not a bean, no proxy) | Let Spring create it |

## 5.3 Propagation

Propagation decides what happens when a transactional method is called while a transaction is already running.

| Propagation | Behaviour | Use |
|---|---|---|
| `REQUIRED` (default) | Join the existing transaction, or start one | Almost everything |
| `REQUIRES_NEW` | Suspend the caller's transaction and run in a new, independent one | Audit logs and outbox records that must survive a rollback of the caller |
| `MANDATORY` | Must already be in a transaction, else throw | Repository-level methods that must never run alone |
| `SUPPORTS` | Join if there is one; otherwise run without | Read-only helpers |
| `NOT_SUPPORTED` | Suspend any transaction | Long non-database work (calling an external API) |
| `NESTED` | A savepoint inside the current transaction | Partial rollback (JDBC only) |

```java spring REQUIRES_NEW keeps the audit record when the order rolls back
package demo;

import jakarta.persistence.*;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;

@SpringBootApplication
@EnableJpaRepositories(considerNestedRepositories = true)
public class Main {
    @Entity public static class Bill { @Id @GeneratedValue Long id; long paise; }
    @Entity public static class AuditLog { @Id @GeneratedValue Long id; String event; }
    public interface BillRepo extends JpaRepository<Bill, Long> {}
    public interface AuditRepo extends JpaRepository<AuditLog, Long> {}

    @Service
    public static class Audit {
        private final AuditRepo repo;
        Audit(AuditRepo repo) { this.repo = repo; }
        @Transactional(propagation = Propagation.REQUIRES_NEW)
        public void record(String event) {
            AuditLog a = new AuditLog(); a.event = event; repo.save(a);
        }
        @Transactional                                       // REQUIRED: joins the caller
        public void recordJoined(String event) {
            AuditLog a = new AuditLog(); a.event = event; repo.save(a);
        }
    }
    @Service
    public static class Billing {
        private final BillRepo bills; private final Audit audit;
        Billing(BillRepo b, Audit a) { bills = b; audit = a; }
        @Transactional
        public void generate(boolean independentAudit) {
            Bill b = new Bill(); b.paise = 175_000; bills.save(b);
            if (independentAudit) audit.record("bill attempted");
            else audit.recordJoined("bill attempted");
            throw new IllegalStateException("tariff missing");     // roll back the bill
        }
    }
    public static void main(String[] args) {
        String[] noWeb = {"--spring.main.web-application-type=none"};
        try (var ctx = SpringApplication.run(Main.class, noWeb)) {
            Billing billing = ctx.getBean(Billing.class);
            BillRepo bills = ctx.getBean(BillRepo.class);
            AuditRepo audits = ctx.getBean(AuditRepo.class);
            for (boolean independent : new boolean[]{false, true}) {
                try { billing.generate(independent); } catch (IllegalStateException e) {}
                String mode = independent ? "REQUIRES_NEW" : "REQUIRED";
                System.out.printf("%-12s bills=%d audit rows=%d%n", mode, bills.count(),
                        audits.count());
            }
        }
    }
}
```

With `REQUIRED`, the audit row is part of the failed transaction and disappears with it. With `REQUIRES_NEW`, the audit row commits in its own transaction before the outer one rolls back. The cost: a second database connection is held while the outer transaction is suspended, so under load `REQUIRES_NEW` can exhaust the connection pool.

## 5.4 Isolation and optimistic locking

`@Transactional(isolation = ...)` sets the database isolation level (READ UNCOMMITTED to SERIALIZABLE; see the DBMS Theory guide, Chapter 4, for the anomalies each level allows). Most applications keep the database default (READ COMMITTED in PostgreSQL) and protect individual rows with **locking**:

| Strategy | How in JPA | When |
|---|---|---|
| Optimistic | A `@Version` column; `UPDATE ... WHERE id = ? AND version = ?`; zero rows updated means someone else changed it | Conflicts are rare (most web apps); no locks held |
| Pessimistic | `@Lock(LockModeType.PESSIMISTIC_WRITE)` on a query: `SELECT ... FOR UPDATE` | Conflicts are frequent and retrying is expensive (seat booking, stock counters) |

```java spring A lost update prevented by @Version
package demo;

import jakarta.persistence.*;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

@SpringBootApplication
@EnableJpaRepositories(considerNestedRepositories = true)
public class Main {
    @Entity public static class Wallet {
        @Id Long id;
        long balancePaise;
        @Version long version;
    }
    public interface WalletRepo extends JpaRepository<Wallet, Long> {}

    public static void main(String[] args) {
        String[] noWeb = {"--spring.main.web-application-type=none"};
        try (var ctx = SpringApplication.run(Main.class, noWeb)) {
            WalletRepo repo = ctx.getBean(WalletRepo.class);
            Wallet w = new Wallet(); w.id = 1L; w.balancePaise = 50_000;
            repo.save(w);
            Wallet tabA = repo.findById(1L).get();       // two requests read the same row
            Wallet tabB = repo.findById(1L).get();
            System.out.println("both read version " + tabA.version + " balance "
                    + tabA.balancePaise);
            tabA.balancePaise -= 30_000;                 // pay a bill of Rs 300
            repo.save(tabA);
            System.out.println("A saved: version now " + repo.findById(1L).get().version);
            tabB.balancePaise -= 40_000;                 // B still thinks Rs 500 is there
            try {
                repo.save(tabB);
            } catch (ObjectOptimisticLockingFailureException e) {
                System.out.println("B rejected: ObjectOptimisticLockingFailureException");
            }
            System.out.println("final balance " + repo.findById(1L).get().balancePaise
                    + " (never negative)");
        }
    }
}
```

Without the `@Version` field, B's save would silently overwrite A's: the balance would become 10 000 paise and A's payment would be lost (a **lost update**). With it, B's `UPDATE` matches zero rows and Spring throws; the caller reloads and retries, or reports a conflict (HTTP 409).

## 5.5 Practical lessons

- Put `@Transactional` on public service methods called from other beans; never rely on it for internal calls.
- Unchecked exceptions roll back, checked ones commit, unless you say `rollbackFor`.
- `REQUIRES_NEW` for records that must survive a rollback, at the cost of an extra connection.
- Use `@Version` on any entity that two users can edit; map the conflict to HTTP 409.
- Keep transactions short: no HTTP calls or file uploads inside them.

# Chapter 6: Spring Security and JWT
%The filter chain, password hashing, stateless authentication with signed tokens, 401 versus 403, and method security

## 6.1 Authentication and authorisation

**Authentication** answers "who are you?" (credentials, a token). **Authorisation** answers "are you allowed to do this?" (roles, permissions). In Spring Security both happen in a chain of servlet filters that runs **before** the `DispatcherServlet`:

```text
request -> ... -> [our JwtFilter: read "Authorization: Bearer <token>", verify, set the user]
              -> AuthorizationFilter: does the rule for this URL accept this user?
              -> ExceptionTranslationFilter: not authenticated -> 401, authenticated but
                 not allowed -> 403
              -> DispatcherServlet -> controller (and @PreAuthorize checks on methods)
```

| Status | Meaning | Example |
|---|---|---|
| 401 Unauthorized | Not authenticated: no credentials, or invalid/expired ones | Missing or tampered token |
| 403 Forbidden | Authenticated, but not allowed | A USER calling an ADMIN endpoint |

## 6.2 Storing passwords

Never store passwords, or fast hashes of them (MD5, SHA-256). Use a deliberately slow, salted algorithm: **BCrypt** (Spring's default), scrypt or Argon2. A random salt per password means two users with the same password get different hashes, and the cost factor makes brute force expensive.

## 6.3 JSON Web Tokens

A **JWT** is three Base64URL parts separated by dots: a header (`{"alg":"HS256"}`), a payload of **claims** (`sub` = user, `roles`, `exp` = expiry time), and a signature computed over the first two parts with a server secret (HMAC-SHA256) or a private key (RS256). The server can verify a token without any database lookup, which is why JWTs suit stateless services, but the payload is only **encoded, not encrypted**: anyone can read it, so never put secrets in it.

| Property | Session cookie | JWT |
|---|---|---|
| Server state | Session store (memory, Redis) | None: the token carries the claims |
| Revocation | Delete the session | Hard: wait for expiry, or keep a deny-list |
| Scaling across servers | Shared session store needed | Any server with the key can verify |
| Typical lifetime | Hours | Short access token (5–15 min) plus a refresh token |

The program builds and verifies HS256 tokens with `javax.crypto.Mac` (a production system uses a library such as `jjwt` or Spring's `oauth2-resource-server`, but the mechanism is identical), protects endpoints with a filter chain, and uses an injected `Clock` so that expiry can be tested deterministically.

```java spring-security Login, JWT filter, 401 versus 403, and an expired token
package demo;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.*;
import java.util.*;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.context.WebServerApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.filter.OncePerRequestFilter;

@SpringBootApplication(excludeName =
        "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration")
@org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
public class Main {
    static final MutableClock CLOCK = new MutableClock();

    @Component
    public static class Jwt {
        private final byte[] key = "demo-secret-key-at-least-32-bytes!!".getBytes();
        private final Base64.Encoder enc = Base64.getUrlEncoder().withoutPadding();
        String issue(String user, String role) {
            String header = enc.encodeToString(
                    "{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes());
            long exp = CLOCK.instant().getEpochSecond() + 900;          // 15 minutes
            String body = enc.encodeToString(("{\"sub\":\"" + user + "\",\"role\":\"" + role
                    + "\",\"exp\":" + exp + "}").getBytes(StandardCharsets.UTF_8));
            return header + "." + body + "." + sign(header + "." + body);
        }
        Optional<String[]> verify(String token) {                      // {user, role}
            String[] p = token.split("\\.");
            if (p.length != 3) return Optional.empty();
            byte[] expected = sign(p[0] + "." + p[1]).getBytes();
            if (!MessageDigest.isEqual(expected, p[2].getBytes())) return Optional.empty();
            String json = new String(Base64.getUrlDecoder().decode(p[1]),
                    StandardCharsets.UTF_8);
            long exp = Long.parseLong(json.replaceAll(".*\"exp\":(\\d+).*", "$1"));
            if (CLOCK.instant().getEpochSecond() >= exp) return Optional.empty();
            return Optional.of(new String[]{json.replaceAll(".*\"sub\":\"([^\"]+)\".*", "$1"),
                    json.replaceAll(".*\"role\":\"([^\"]+)\".*", "$1")});
        }
        private String sign(String data) {
            try {
                Mac mac = Mac.getInstance("HmacSHA256");
                mac.init(new SecretKeySpec(key, "HmacSHA256"));
                return enc.encodeToString(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
            } catch (Exception e) { throw new IllegalStateException(e); }
        }
    }

    @Component
    public static class JwtFilter extends OncePerRequestFilter {
        private final Jwt jwt;
        JwtFilter(Jwt jwt) { this.jwt = jwt; }
        @Override protected void doFilterInternal(HttpServletRequest req,
                HttpServletResponse res, FilterChain chain)
                throws ServletException, IOException {
            String h = req.getHeader("Authorization");
            if (h != null && h.startsWith("Bearer ")) {
                jwt.verify(h.substring(7)).ifPresent(c -> SecurityContextHolder.getContext()
                        .setAuthentication(new UsernamePasswordAuthenticationToken(c[0], null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + c[1])))));
            }
            chain.doFilter(req, res);
        }
    }

    @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean SecurityFilterChain api(HttpSecurity http, JwtFilter jwtFilter) throws Exception {
        return http.csrf(c -> c.disable())                             // no cookies: no CSRF
                .sessionManagement(s ->
                        s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(a -> a
                        .requestMatchers("/auth/login", "/error").permitAll()
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated())
                .exceptionHandling(e -> e.authenticationEntryPoint(
                        new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @RestController
    public static class Api {
        private final Jwt jwt; private final Map<String, String[]> users = new HashMap<>();
        private final PasswordEncoder encoder;
        Api(Jwt jwt, PasswordEncoder encoder) {
            this.jwt = jwt; this.encoder = encoder;
            users.put("asha", new String[]{encoder.encode("asha-pass"), "USER"});
            users.put("admin", new String[]{encoder.encode("admin-pass"), "ADMIN"});
        }
        public record Login(String user, String password) {}
        @PostMapping("/auth/login")
        String login(@RequestBody Login in, HttpServletResponse res) {
            String[] u = users.get(in.user());
            if (u == null || !encoder.matches(in.password(), u[0])) {
                res.setStatus(401); return "bad credentials";
            }
            return jwt.issue(in.user(), u[1]);
        }
        @GetMapping("/meters/mine") String mine(java.security.Principal p) {
            return "meters of " + p.getName();
        }
        @GetMapping("/admin/tariffs") String tariffs() { return "tariff table"; }
    }

    static HttpClient http = HttpClient.newHttpClient();
    static String base;
    static String send(String method, String path, String token, String body)
            throws Exception {
        var b = HttpRequest.newBuilder(URI.create(base + path))
                .header("Content-Type", "application/json");
        if (token != null) b.header("Authorization", "Bearer " + token);
        b.method(method, body == null ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(body));
        HttpResponse<String> r = http.send(b.build(), HttpResponse.BodyHandlers.ofString());
        boolean defaultError = r.body().startsWith("{\"timestamp\"");  // Boot's error body
        return r.statusCode() + (r.body().isEmpty() || defaultError ? "" : " " + r.body());
    }
    static void show(String label, String path, String token) throws Exception {
        System.out.printf("%-27s -> %s%n", label, send("GET", path, token, null));
    }
    static String login(String user, String password) throws Exception {
        String json = "{\"user\":\"" + user + "\",\"password\":\"" + password + "\"}";
        return send("POST", "/auth/login", null, json);
    }
    public static void main(String[] args) throws Exception {
        var ctx = SpringApplication.run(Main.class, "--server.port=0");
        int port = ((WebServerApplicationContext) ctx).getWebServer().getPort();
        base = "http://localhost:" + port;
        System.out.printf("%-27s -> %s%n", "login, wrong password", login("asha", "x"));
        String token = login("asha", "asha-pass").substring(4);           // drop "200 "
        System.out.println("token has 3 parts? " + (token.split("\\.").length == 3));
        show("GET /meters/mine, no token", "/meters/mine", null);
        show("GET /meters/mine, token", "/meters/mine", token);
        show("GET /admin/tariffs as USER", "/admin/tariffs", token);
        String[] parts = token.split("\\.");
        Base64.Encoder b64 = Base64.getUrlEncoder().withoutPadding();
        String claims = new String(Base64.getUrlDecoder().decode(parts[1]));
        String forged = parts[0] + "." + b64.encodeToString(
                claims.replace("USER", "ADMIN").getBytes()) + "." + parts[2];
        show("forged role ADMIN", "/admin/tariffs", forged);
        CLOCK.advance(Duration.ofMinutes(16));
        show("16 minutes later", "/meters/mine", token);
        String admin = login("admin", "admin-pass").substring(4);
        show("GET /admin/tariffs as ADMIN", "/admin/tariffs", admin);
        PasswordEncoder enc = ctx.getBean(PasswordEncoder.class);
        String h1 = enc.encode("same"), h2 = enc.encode("same");
        System.out.println("BCrypt: two hashes of one password equal? " + h1.equals(h2)
                + ", both match? " + (enc.matches("same", h1) && enc.matches("same", h2))
                + ", prefix " + h1.substring(0, 7));
        ctx.close();
    }

    static class MutableClock extends Clock {
        private Instant now = Instant.parse("2026-10-07T10:00:00Z");
        void advance(Duration d) { now = now.plus(d); }
        public Instant instant() { return now; }
        public ZoneId getZone() { return ZoneOffset.UTC; }
        public Clock withZone(ZoneId z) { return this; }
    }
}
```

Walk through the output. Without a token the request is **401**; with a valid USER token the protected endpoint answers; the same token on an ADMIN endpoint is **403** (authenticated, not allowed). Changing the role inside the payload invalidates the signature, so the forged token is treated as no token at all: 401. After 16 minutes the 15-minute token has expired: 401 again. BCrypt produces a different hash for the same password each time (random salt), yet both verify; `$2a$10$` records the algorithm version and the cost factor (2<sup>10</sup> rounds).

> TRAP: Without the `authenticationEntryPoint` line, Spring Security 6 answers **403** to a request with no credentials in this configuration, because no login mechanism (form or basic) is registered to send a 401 challenge. Clients then cannot tell "log in first" from "not allowed". Set the entry point explicitly in stateless APIs.

> TRAP: The first run of this program returned **401** for the USER calling the admin endpoint, not 403. Spring forwarded the 403 to Spring Boot's `/error` page; that **error dispatch** passes through the security filter chain again, but a `OncePerRequestFilter` skips error dispatches, so the JWT was not read, `/error` looked anonymous, and the anonymous request was refused with 401. Adding `"/error"` to the `permitAll()` matchers (as above) fixes it. Every Spring Boot 3 API with a custom token filter needs this line.

> NOTE: The signature comparison uses `MessageDigest.isEqual`, which takes the same time whether the first or the last byte differs. A plain `equals` returns early on the first mismatch, and the timing difference can leak the signature byte by byte.

## 6.4 Method security and other protections

`@EnableMethodSecurity` enables `@PreAuthorize` on service methods, for rules that URLs cannot express: `@PreAuthorize("hasRole('ADMIN') or #meter.owner == authentication.name")`. Keep URL rules for coarse access and method rules for ownership checks.

| Threat | Protection |
|---|---|
| CSRF | Needed when the browser sends credentials automatically (cookies); disable only for pure token APIs |
| CORS | Configure allowed origins explicitly (`http.cors(...)`); never `*` with credentials |
| Brute-force login | Rate-limit `/auth/login` per user and per IP; lock out after repeated failures |
| Token theft | HTTPS only; short access-token lifetime; refresh tokens stored in HttpOnly cookies and rotated |
| Secrets in code | Load the signing key from the environment or a secrets manager, never from the repository |
| SQL injection | Parameterised queries (JPA does this; never concatenate strings into JPQL/SQL) |

## 6.5 Practical lessons

- Authentication first, then authorisation; 401 means "who are you?", 403 means "you may not".
- Hash passwords with BCrypt or Argon2; never encrypt or fast-hash them.
- A JWT is signed, not encrypted. Verify the signature and the expiry on every request, compare signatures in constant time, and keep access tokens short-lived.
- Stateless APIs: disable sessions and CSRF, set a 401 entry point, add the JWT filter before the username/password filter.
