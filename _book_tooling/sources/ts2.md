## Part 3 solutions

### T3.1 Which double?

| Case | Double | Why |
|---|---|---|
| (a) Required but irrelevant logger | Dummy (or a no-op implementation) | It is passed, never checked |
| (b) Exchange rate of 83.0 | Stub | Only a canned answer is needed |
| (c) Repository for 30 tests | Fake (in-memory) | Real behaviour, reused by every test, survives refactoring |
| (d) Exactly one SMS with the OTP | Mock (or a recording fake) | Sending the SMS **is** the behaviour under test |
| (e) Real calculator, one slow method replaced | Spy (partial mock) | Use sparingly; often a sign the slow part should be its own injected dependency |

### T3.2 Password reset

```java junit Both paths of a password reset
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

interface Users { Optional<String> emailFor(String username); }
interface Tokens { String newToken(); }
interface Mailer { void send(String to, String body); }

class PasswordReset {
    static final String REPLY = "If the account exists, an email has been sent.";
    private final Users users; private final Tokens tokens; private final Mailer mailer;
    PasswordReset(Users u, Tokens t, Mailer m) { users = u; tokens = t; mailer = m; }
    String request(String username) {
        users.emailFor(username).ifPresent(email -> mailer.send(email,
            "Reset your password: https://example.com/reset?token=" + tokens.newToken()));
        return REPLY;
    }
}

@ExtendWith(MockitoExtension.class)
class PasswordResetTest {
    @Mock Users users;
    @Mock Tokens tokens;
    @Mock Mailer mailer;
    @Captor ArgumentCaptor<String> body;
    @InjectMocks PasswordReset reset;

    @Test
    void knownUserGetsALinkWithAFreshToken() {
        when(users.emailFor("asha")).thenReturn(Optional.of("asha@example.com"));
        when(tokens.newToken()).thenReturn("t-91f2");
        assertEquals(PasswordReset.REPLY, reset.request("asha"));
        verify(mailer).send(eq("asha@example.com"), body.capture());
        assertTrue(body.getValue().endsWith("/reset?token=t-91f2"), body.getValue());
    }

    @Test
    void unknownUserGetsTheSameReplyAndNothingHappens() {
        when(users.emailFor("nobody")).thenReturn(Optional.empty());
        assertEquals(PasswordReset.REPLY, reset.request("nobody"));
        verifyNoInteractions(mailer, tokens);
    }
}
```

`@InjectMocks` builds the service from the three mocks through its constructor. The second test checks the security property explicitly: same reply, no email and not even a wasted token. A complete suite would also check timing differences are small and that tokens expire, but those belong to the token service's own tests.

### T3.3 Retries and compensation

```java junit Retries, giving up, and a refund in the right order
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GatewayTimeout extends RuntimeException { }
interface Gateway {
    String charge(String orderId, long paise);
    void refund(String paymentId);
}
interface Ledger { void record(String orderId, String paymentId); }

class Checkout {
    private final Gateway gateway; private final Ledger ledger;
    Checkout(Gateway g, Ledger l) { gateway = g; ledger = l; }
    String pay(String orderId, long paise) {
        String paymentId;
        for (int attempt = 1; ; attempt++) {
            try { paymentId = gateway.charge(orderId, paise); break; }
            catch (GatewayTimeout e) { if (attempt == 3) throw e; }
        }
        try { ledger.record(orderId, paymentId); }
        catch (RuntimeException e) { gateway.refund(paymentId); throw e; }
        return paymentId;
    }
}

@ExtendWith(MockitoExtension.class)
class CheckoutTest {
    @Mock Gateway gateway;
    @Mock Ledger ledger;
    @InjectMocks Checkout checkout;

    @Test
    void retriesTimeoutsThenSucceeds() {
        when(gateway.charge("ord-1", 44000))
            .thenThrow(new GatewayTimeout())
            .thenThrow(new GatewayTimeout())
            .thenReturn("pay-1");
        assertEquals("pay-1", checkout.pay("ord-1", 44000));
        verify(gateway, times(3)).charge("ord-1", 44000);
        verify(ledger).record("ord-1", "pay-1");
    }

    @Test
    void givesUpAfterThreeTimeouts() {
        when(gateway.charge(anyString(), anyLong())).thenThrow(new GatewayTimeout());
        assertThrows(GatewayTimeout.class, () -> checkout.pay("ord-2", 1000));
        verify(gateway, times(3)).charge("ord-2", 1000);
        verifyNoInteractions(ledger);
    }

    @Test
    void refundsWhenTheLedgerFails() {
        when(gateway.charge("ord-3", 5000)).thenReturn("pay-3");
        doThrow(new IllegalStateException("ledger down"))
            .when(ledger).record("ord-3", "pay-3");
        assertThrows(IllegalStateException.class, () -> checkout.pay("ord-3", 5000));
        InOrder order = inOrder(gateway, ledger);
        order.verify(gateway).charge("ord-3", 5000);
        order.verify(ledger).record("ord-3", "pay-3");
        order.verify(gateway).refund("pay-3");
    }
}
```

`doThrow(...).when(mock).method()` is the form for `void` methods. Here the interactions **are** the behaviour (money moves), so verifying them is right. The tests also expose a design question worth raising in an interview: a timeout does not mean the charge failed, so blind retries can charge twice. The gateway call needs an **idempotency key** (the order ID), and a test should check it is passed on every attempt.

### T3.4 Two broken stubs

```java junit Matcher misuse, an argument mismatch, and the fix
// file: Quote.java
interface Prices { double price(String sku, String region); }

class Quote {
    private final Prices prices;
    Quote(Prices prices) { this.prices = prices; }
    double total(String sku, int qty, String region) {
        String r = region.substring(0, 1).toUpperCase() + region.substring(1);   // "North"
        return qty * prices.price(sku, r);
    }
}

// file: QuoteTest.java
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuoteTest {
    @Mock Prices prices;

    @Test
    void mixesAMatcherWithAPlainValue() {
        when(prices.price(anyString(), "north")).thenReturn(10.0);
        assertEquals(30.0, new Quote(prices).total("A1", 3, "north"));
    }

    @Test
    void stubsArgumentsTheCodeNeverUses() {
        when(prices.price("A1", "north")).thenReturn(10.0);
        assertEquals(30.0, new Quote(prices).total("A1", 3, "north"));
    }

    @Test
    void fixed() {
        when(prices.price(eq("A1"), eq("North"))).thenReturn(10.0);
        assertEquals(30.0, new Quote(prices).total("A1", 3, "north"));
    }
}
```

The first test breaks Mockito's rule that if one argument uses a matcher, all must (`eq("north")`, not `"north"`); Mockito detects it when the stub is created. In the second, the code capitalises the region, so the stub never matches. Without strict stubs the mock would quietly return `0.0` and the assertion would fail with a confusing "expected 30.0 but was 0.0"; with `MockitoExtension`, Mockito reports a `PotentialStubbingProblem` naming both the stubbed and the actual arguments.

The example is split into two source files on purpose, as in a real project. When first run with the code and test in **one** file, the second test failed only with "expected: <30.0> but was: <0.0>": Mockito skips the mismatch check when the stubbed call and the real call come from the same source file, because it assumes both are test code. The fix stubs what the code really passes (and `eq` is optional when no other matcher is used).

### T3.5 A fake instead of mocks

```java junit A registration service tested with an in-memory repository
import org.junit.jupiter.api.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

record User(String email, String name) { }
interface UserRepo { Optional<User> byEmail(String email); void save(User u); }

class InMemoryUserRepo implements UserRepo {
    private final Map<String, User> byEmail = new HashMap<>();
    public Optional<User> byEmail(String email) {
        return Optional.ofNullable(byEmail.get(email));
    }
    public void save(User u) { byEmail.put(u.email(), u); }
}

class Registration {
    private final UserRepo repo;
    Registration(UserRepo repo) { this.repo = repo; }
    User register(String email, String name) {
        String normalised = email.trim().toLowerCase(Locale.ROOT);
        if (repo.byEmail(normalised).isPresent())
            throw new IllegalStateException("email already registered");
        User u = new User(normalised, name);
        repo.save(u);
        return u;
    }
}

class RegistrationTest {
    final InMemoryUserRepo repo = new InMemoryUserRepo();
    final Registration registration = new Registration(repo);

    @Test
    void savesANormalisedUser() {
        registration.register("  Asha@Example.COM ", "Asha");
        assertEquals(Optional.of(new User("asha@example.com", "Asha")),
                     repo.byEmail("asha@example.com"));
    }

    @Test
    void rejectsADuplicateWhateverItsCase() {
        registration.register("asha@example.com", "Asha");
        var e = assertThrows(IllegalStateException.class,
                () -> registration.register(" ASHA@example.com", "Someone else"));
        assertEquals("email already registered", e.getMessage());
    }
}
```

With mocks, each test would stub `byEmail` and verify `save` with exact arguments, restating the implementation. With the fake, tests describe outcomes ("the user can be found", "a duplicate is rejected"), and they keep passing if the service changes how it uses the repository, for example to a single `saveIfAbsent` call. The fake needs its own small test (or a shared contract test also run against the real repository) to stay honest. `Locale.ROOT` avoids the classic Turkish-locale bug where `"I".toLowerCase()` is not `"i"`.

## Part 4 solutions

### T4.1 An HTTP client against a stub server

```java junit Retry-After honoured without sleeping; malformed JSON reported
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.*;
import java.net.*;
import java.net.http.*;
import java.util.*;
import java.util.function.LongConsumer;
import java.util.regex.*;
import static org.junit.jupiter.api.Assertions.*;

class RateClient {
    private static final Pattern RATE = Pattern.compile("\"rate\"\\s*:\\s*([0-9.]+)");
    private final HttpClient http = HttpClient.newHttpClient();
    private final URI base; private final LongConsumer sleepSeconds;
    RateClient(URI base, LongConsumer sleepSeconds) {
        this.base = base; this.sleepSeconds = sleepSeconds;
    }

    double rate(String meter) throws Exception {
        for (int attempt = 1; ; attempt++) {
            HttpRequest req = HttpRequest.newBuilder(base.resolve("/rates/" + meter)).build();
            HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
            if (res.statusCode() == 429 && attempt < 3) {
                String wait = res.headers().firstValue("Retry-After").orElse("1");
                sleepSeconds.accept(Long.parseLong(wait));
                continue;
            }
            if (res.statusCode() != 200)
                throw new IllegalStateException("status " + res.statusCode());
            Matcher m = RATE.matcher(res.body());
            if (!m.find()) throw new IllegalStateException("bad response: " + res.body());
            return Double.parseDouble(m.group(1));
        }
    }
}

class RateClientIT {
    HttpServer server;
    final List<Long> slept = new ArrayList<>();
    int busyCalls = 0;

    @BeforeEach
    void start() throws Exception {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/rates/", ex -> {
            String meter = ex.getRequestURI().getPath().substring("/rates/".length());
            int status = 200; String body = "{\"rate\": 7.25}";
            if (meter.equals("BUSY") && busyCalls++ == 0) {
                status = 429; body = ""; ex.getResponseHeaders().add("Retry-After", "2");
            } else if (meter.equals("BROKEN")) {
                body = "<html>maintenance</html>";
            }
            byte[] bytes = body.getBytes();
            ex.sendResponseHeaders(status, bytes.length == 0 ? -1 : bytes.length);
            if (bytes.length > 0) ex.getResponseBody().write(bytes);
            ex.close();
        });
        server.start();
    }

    @AfterEach void stop() { server.stop(0); }

    RateClient client() {
        URI base = URI.create("http://127.0.0.1:" + server.getAddress().getPort());
        return new RateClient(base, slept::add);
    }

    @Test
    void returnsTheRate() throws Exception {
        assertEquals(7.25, client().rate("MTR-7"), 1e-9);
        assertEquals(List.of(), slept);
    }

    @Test
    void waitsAsToldBy429ThenRetries() throws Exception {
        assertEquals(7.25, client().rate("BUSY"), 1e-9);
        assertEquals(List.of(2L), slept);
    }

    @Test
    void reportsMalformedResponses() {
        var e = assertThrows(IllegalStateException.class, () -> client().rate("BROKEN"));
        assertEquals("bad response: <html>maintenance</html>", e.getMessage());
    }
}
```

Injecting the sleep as a `LongConsumer` (production passes one that calls `Thread.sleep`) lets the test check the **requested** wait of 2 seconds in microseconds of real time. The same trick applies to every time-based behaviour: back-off, timeouts, scheduling.

### T4.2 A greeting that fails after lunch

```java junit Fixed instants and an explicit zone
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import java.time.*;
import static org.junit.jupiter.api.Assertions.*;

class Greeter {
    private final Clock clock; private final ZoneId zone;
    Greeter(Clock clock, ZoneId zone) { this.clock = clock; this.zone = zone; }
    String greet() {
        int hour = LocalTime.now(clock.withZone(zone)).getHour();
        return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    }
}

class GreeterTest {
    static final ZoneId INDIA = ZoneId.of("Asia/Kolkata");

    @ParameterizedTest(name = "{0} -> {1}")
    @CsvSource({"2026-10-09T06:29:59Z, Good morning",      // 11:59:59 in India
                "2026-10-09T06:30:00Z, Good afternoon",    // 12:00 in India
                "2026-10-09T11:29:59Z, Good afternoon",    // 16:59:59
                "2026-10-09T11:30:00Z, Good evening"})     // 17:00
    void greetsByIndianTime(Instant at, String expected) {
        assertEquals(expected, new Greeter(Clock.fixed(at, ZoneOffset.UTC), INDIA).greet());
    }
}
```

The original had two hidden inputs, the current time and the machine's time zone, so its result depended on when and where the test ran. Injecting a `Clock` and the user's `ZoneId` makes both explicit; the instants are given in UTC to show that a UTC build server now gets the same answer as a laptop in India.

### T4.3 Find the surviving mutants

```java run Mutants of a shipping-fee rule against two suites
import java.util.*;
import java.util.function.*;

public class Main {
    interface Fee { int of(double kg, boolean express); }

    static int base(double kg) { return kg <= 1 ? 50 : 50 + 20 * (int) Math.ceil(kg - 1); }
    static final Fee ORIGINAL = (kg, ex) -> ex ? base(kg) * 2 : base(kg);

    static final Map<String, Fee> MUTANTS = new LinkedHashMap<>();
    static {
        MUTANTS.put("<= 1 becomes < 1", (kg, ex) -> {
            int f = kg < 1 ? 50 : 50 + 20 * (int) Math.ceil(kg - 1);
            return ex ? f * 2 : f;
        });
        MUTANTS.put("ceil becomes floor", (kg, ex) -> {
            int f = kg <= 1 ? 50 : 50 + 20 * (int) Math.floor(kg - 1);
            return ex ? f * 2 : f;
        });
        MUTANTS.put("20 becomes 10", (kg, ex) -> {
            int f = kg <= 1 ? 50 : 50 + 10 * (int) Math.ceil(kg - 1);
            return ex ? f * 2 : f;
        });
        MUTANTS.put("* 2 becomes + 50", (kg, ex) -> ex ? base(kg) + 50 : base(kg));
        MUTANTS.put("express negated", (kg, ex) -> !ex ? base(kg) * 2 : base(kg));
    }

    static boolean suiteA(Fee f) {                       // the given suite
        return f.of(1, false) == 50 && f.of(3, false) == 90 && f.of(1, true) == 100;
    }

    static boolean suiteB(Fee f) {           // adds a fractional and a heavy express parcel
        return suiteA(f) && f.of(2.5, false) == 90 && f.of(3, true) == 180;
    }

    public static void main(String[] args) {
        boolean bothPass = suiteA(ORIGINAL) && suiteB(ORIGINAL);
        System.out.println("both suites pass on the original: " + bothPass);
        for (var suite : List.<Map.Entry<String, Predicate<Fee>>>of(
                Map.entry("A", Main::suiteA), Map.entry("B", Main::suiteB))) {
            List<String> survivors = new ArrayList<>();
            for (var m : MUTANTS.entrySet())
                if (suite.getValue().test(m.getValue())) survivors.add(m.getKey());
            System.out.printf("suite %s kills %d/%d; survivors: %s%n", suite.getKey(),
                              MUTANTS.size() - survivors.size(), MUTANTS.size(), survivors);
        }
    }
}
```

Suite A misses two real gaps: no fractional weight (so `ceil` versus `floor` is never distinguished) and no express parcel above 1 kg (where doubling ₹50 and adding ₹50 coincide). Suite B adds one test for each and kills them. The last survivor, `<= 1` becoming `< 1`, is an **equivalent mutant**: at exactly 1 kg both branches give ₹50 (`ceil(0) = 0`), so no test can ever distinguish them. PIT reports such mutants as survivors too; recognising them is part of reading a mutation report.

### T4.4 How flaky is the build?

```python run Chance of a spuriously red build
n, p = 400, 0.001
red = 1 - (1 - p) ** n
print(f'no retries: {red:.1%} of builds fail for no reason')
retried = 1 - (1 - p * p) ** n
print(f'one retry:  {retried:.3%} of builds fail for no reason')
```

A one-in-a-thousand flake rate per test makes a third of all builds red, so developers learn to ignore red builds, which is the real damage. One retry makes spurious failures rare, which is why CI systems offer it, but it also hides tests that fail because of a **real** race condition in the product, and it keeps the flaky tests slow. Use retries only as a stop-gap, record every retried pass as a flake, and fix or quarantine the worst offenders (DevOps guide).

### T4.5 A test strategy for a payment service

| Level | What is tested | Tools | Example failure caught |
|---|---|---|---|
| Unit | Fee and currency calculations, state machine of a payment, validation, retry and idempotency logic | JUnit 5, parameterised tests, property tests, Mockito at the gateway boundary, fixed `Clock` | Off-by-one in a refund window; double capture allowed |
| Repository integration | SQL, migrations, unique constraints, locking | Testcontainers MySQL (same version as production), Flyway | Migration fails on real MySQL; missing unique index on idempotency key |
| Messaging integration | Event serialisation, keys, outbox publishing | Testcontainers Kafka, schema-registry compatibility checks | Event published with the wrong key, breaking per-payment order |
| Gateway client | Timeouts, retries, error mapping, idempotency keys | WireMock with fault injection | Timeout treated as failure, causing a second charge |
| API slice | Request validation, error responses, security | Spring `@WebMvcTest`, MockMvc | Missing authorisation check on refunds |
| Contract | API used by checkout and events consumed by ledger and notifications | Pact or Spring Cloud Contract, verified in the provider's build | A renamed field breaks the ledger service |
| End-to-end | One or two journeys: pay, refund | Staging environment with the gateway's sandbox | Configuration or networking errors between services |

**CI.** Unit and slice tests on every push (minutes), then integration and contract tests in a parallel stage, then end-to-end tests after deployment to staging. Mutation testing runs nightly on the money-handling packages, and coverage of new code is tracked rather than a global target.

**Flaky tests.** Every retried pass is recorded; a flaky test gets an owner, is quarantined from the blocking stage if it fails more than a set rate, and must be fixed within a sprint. Typical root causes in this service (time, async event consumption, shared database rows) have standard fixes: injected clocks, awaiting conditions, per-test data.
