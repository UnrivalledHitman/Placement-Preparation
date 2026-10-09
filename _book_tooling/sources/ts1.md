# Solutions
%Every test compiled and run with JUnit 5 and Mockito; deliberately failing tests are the answers that found bugs

## Part 1 solutions

### T1.1 Spot the FIRST violations

| Case | Violates | Fix |
|---|---|---|
| (a) Real exchange-rate API | Fast, Repeatable (rates change, the network fails) | Stub the rate service behind your own interface; test the real API once in an integration test |
| (b) `testB` needs `testA` | Independent | Each test creates its own user (or a builder or fixture does) |
| (c) Prints the invoice | Self-validating | Assert on the invoice's fields |
| (d) `new Random()` ages | Repeatable | Fixed values, or a seeded `Random` whose seed is printed on failure |
| (e) Sleeps two seconds | Fast, and still Repeatable only by luck | Await the job's completion with a timeout (Awaitility), or run it synchronously in the unit test |

### T1.2 Ticket prices at the boundaries

| Class | Boundaries |
|---|---|
| Invalid low (< 0) | −1 |
| Free (0–4) | 0, 4 |
| Child (5–17) | 5, 17 |
| Adult (18–59) | 18, 59 |
| Senior (60–120) | 60, 120 |
| Invalid high (> 120) | 121 |

```java junit Boundary tests against an off-by-one fare rule
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.*;
import static org.junit.jupiter.api.Assertions.*;

class Tickets {
    static int price(int age) {
        if (age < 0 || age > 120) throw new IllegalArgumentException("invalid age " + age);
        if (age <= 4) return 0;
        if (age <= 17) return 100;
        if (age <= 60) return 200;                  // BUG: 60 is a senior
        return 120;
    }
}

class TicketsTest {
    @ParameterizedTest(name = "age {0} -> Rs {1}")
    @CsvSource({"0, 0", "4, 0", "5, 100", "17, 100",
                "18, 200", "59, 200", "60, 120", "120, 120"})
    void prices(int age, int expected) {
        assertEquals(expected, Tickets.price(age));
    }

    @ParameterizedTest(name = "age {0} is invalid")
    @ValueSource(ints = {-1, 121})
    void rejectsInvalidAges(int age) {
        assertThrows(IllegalArgumentException.class, () -> Tickets.price(age));
    }
}
```

Only the boundary at exactly 60 catches the bug; a "typical senior" value such as 70 would pass. Changing `age <= 60` to `age <= 59` makes all ten tests pass.

### T1.3 A decision table as tests

```java junit One row per rule, plus the income boundaries
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import static org.junit.jupiter.api.Assertions.*;

class LoanCheck {
    enum Outcome { APPROVE, REFER, REJECT }
    static Outcome decide(int age, int income, boolean priorDefault) {
        if (age < 18 || priorDefault) return Outcome.REJECT;
        if (income >= 25_000) return Outcome.APPROVE;
        if (income >= 15_000) return Outcome.REFER;
        return Outcome.REJECT;
    }
}

class LoanCheckTest {
    @ParameterizedTest(name = "{0}: age {1}, income {2}, default {3} -> {4}")
    @CsvSource({
        "R1, 30, 40000, false, APPROVE",
        "R2, 30, 20000, false, REFER",
        "R3, 30, 10000, false, REJECT",
        "R4, 30, 40000, true, REJECT",
        "R5, 17, 40000, false, REJECT",
        "edge, 18, 25000, false, APPROVE",
        "edge, 30, 24999, false, REFER",
        "edge, 30, 15000, false, REFER",
        "edge, 30, 14999, false, REJECT"})
    void decides(String rule, int age, int income, boolean priorDefault,
                 LoanCheck.Outcome want) {
        assertEquals(want, LoanCheck.decide(age, income, priorDefault));
    }
}
```

The rule names in the display make a failure point straight back to the table. The ₹15,000 row records a decision (refer) that had to be agreed with the product owner: writing the table is what exposed the question.

### T1.4 Every transition of a workflow

```java junit Sixteen generated transition tests
import org.junit.jupiter.api.*;
import java.util.*;
import java.util.stream.*;
import static org.junit.jupiter.api.Assertions.*;

class Doc {
    enum State { DRAFT, IN_REVIEW, PUBLISHED, ARCHIVED }
    enum Event { SUBMIT, APPROVE, REJECT, ARCHIVE }
    static State next(State s, Event e) {
        switch (s) {
            case DRAFT:
                if (e == Event.SUBMIT) return State.IN_REVIEW;
                if (e == Event.ARCHIVE) return State.ARCHIVED;      // BUG: not from DRAFT
                break;
            case IN_REVIEW:
                if (e == Event.APPROVE) return State.PUBLISHED;
                if (e == Event.REJECT) return State.DRAFT;
                break;
            case PUBLISHED:
                if (e == Event.ARCHIVE) return State.ARCHIVED;
                break;
            default:
                break;
        }
        throw new IllegalStateException(s + " cannot " + e);
    }
}

class DocTest {
    // the specification, written independently of the implementation
    static final Map<String, Doc.State> ALLOWED = Map.of(
        "DRAFT SUBMIT", Doc.State.IN_REVIEW,
        "IN_REVIEW APPROVE", Doc.State.PUBLISHED,
        "IN_REVIEW REJECT", Doc.State.DRAFT,
        "PUBLISHED ARCHIVE", Doc.State.ARCHIVED);

    @TestFactory
    Stream<DynamicTest> everyStateAndEvent() {
        return Arrays.stream(Doc.State.values())
            .flatMap(s -> Arrays.stream(Doc.Event.values()).map(e -> {
                Doc.State want = ALLOWED.get(s + " " + e);
                String name = s + " + " + e + " -> " + (want == null ? "refused" : want);
                return DynamicTest.dynamicTest(name, () -> {
                    if (want != null) assertEquals(want, Doc.next(s, e));
                    else try {
                        fail("should be refused, but moved to " + Doc.next(s, e));
                    } catch (IllegalStateException refused) { }
                });
            }));
    }
}
```

The refused case uses `fail` inside a `try` rather than `assertThrows` only so that the failure message names the wrong target state. Testing only the four valid transitions would pass. Generating every pair from an independent table catches the extra transition, and the same factory stays complete when a state or event is added.

### T1.5 Make it testable

The method creates its own clock (`LocalDate.now()`) and its own mailer, so a test can neither choose "today" nor stop real emails being sent. Inject both: a `Clock`, and a `Mailer` interface that production implements with SMTP and tests implement with a recording fake.

```java junit Injected clock and a recording mailer
import org.junit.jupiter.api.*;
import java.time.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

interface Mailer { void send(String to, String body); }

class Invoice {
    final String email; final LocalDate due; int fees;
    Invoice(String email, LocalDate due) { this.email = email; this.due = due; }
}

class LateFeeService {
    private final Clock clock; private final Mailer mailer;
    LateFeeService(Clock clock, Mailer mailer) { this.clock = clock; this.mailer = mailer; }
    void chargeLateFees(List<Invoice> invoices) {
        LocalDate today = LocalDate.now(clock);
        for (Invoice i : invoices)
            if (today.isAfter(i.due.plusDays(7))) {
                i.fees += 50;
                mailer.send(i.email, "A late fee of Rs 50 was added");
            }
    }
}

class LateFeeServiceTest {
    final List<String> sent = new ArrayList<>();
    final Mailer recording = (to, body) -> sent.add(to);

    LateFeeService on(String date) {
        Instant at = LocalDate.parse(date).atStartOfDay(ZoneOffset.UTC).toInstant();
        return new LateFeeService(Clock.fixed(at, ZoneOffset.UTC), recording);
    }

    @Test
    void noFeeOnTheSeventhDayAfterDue() {
        Invoice inv = new Invoice("a@example.com", LocalDate.parse("2026-10-01"));
        on("2026-10-08").chargeLateFees(List.of(inv));
        assertEquals(0, inv.fees);
        assertEquals(List.of(), sent);
    }

    @Test
    void feeAndOneEmailOnTheEighthDay() {
        Invoice inv = new Invoice("a@example.com", LocalDate.parse("2026-10-01"));
        on("2026-10-09").chargeLateFees(List.of(inv));
        assertEquals(50, inv.fees);
        assertEquals(List.of("a@example.com"), sent);
    }
}
```

A second smell remains: running the job twice on the same day charges twice. A test that calls `chargeLateFees` twice and expects a single fee would expose it; the fix is to record which invoices were already charged.

## Part 2 solutions

### T2.1 Lifecycle order

For each test JUnit creates a **new instance**, so the order is: `beforeAll` once, then for every test `constructor`, `beforeEach`, the test, `afterEach`. The third test checks the log at the moment it runs:

```java junit The lifecycle recorded and asserted
import org.junit.jupiter.api.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class LifecycleTest {
    static final List<String> log = new ArrayList<>();

    LifecycleTest() { log.add("constructor"); }
    @BeforeAll static void beforeAll() { log.add("beforeAll"); }
    @BeforeEach void beforeEach() { log.add("beforeEach"); }
    @AfterEach void afterEach() { log.add("afterEach"); }

    @Test @Order(1) void first() { log.add("first"); }
    @Test @Order(2) void second() { log.add("second"); }

    @Test @Order(3)
    void logSoFar() {
        assertEquals(List.of("beforeAll",
                             "constructor", "beforeEach", "first", "afterEach",
                             "constructor", "beforeEach", "second", "afterEach",
                             "constructor", "beforeEach"), log);
    }
}
```

With `@TestInstance(Lifecycle.PER_CLASS)` the constructor runs **once**, fields are shared between tests (so state can leak), and `@BeforeAll` and `@AfterAll` may be instance methods. It is useful for expensive setup in Kotlin or for `@MethodSource` methods that need instance state, but per-method is the safe default.

### T2.2 Testing a money parser

```java junit Valid amounts, rejected amounts, and one the parser should reject
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

record Money(long paise) {
    static Money parse(String s) {
        if (s == null || !s.startsWith("Rs "))
            throw new IllegalArgumentException("must start with 'Rs '");
        String num = s.substring(3).replace(",", "");
        if (!num.matches("\\d+(\\.\\d{1,2})?"))
            throw new IllegalArgumentException("bad amount: " + s.substring(3));
        String[] parts = num.split("\\.");
        long paise = parts.length == 1 ? 0 : Long.parseLong((parts[1] + "0").substring(0, 2));
        return new Money(Long.parseLong(parts[0]) * 100 + paise);
    }
}

class MoneyTest {
    static String messageFor(String input) {
        var e = assertThrows(IllegalArgumentException.class, () -> Money.parse(input));
        return e.getMessage();
    }

    @Test
    void parsesValidAmounts() {
        assertAll(
            () -> assertEquals(123450, Money.parse("Rs 1,234.50").paise()),
            () -> assertEquals(700, Money.parse("Rs 7").paise()),
            () -> assertEquals(50, Money.parse("Rs 0.5").paise()),
            () -> assertEquals(1_000_000_00, Money.parse("Rs 10,00,000").paise()));
    }

    @Test
    void rejectsInvalidAmountsWithAClearMessage() {
        assertAll(
            () -> assertEquals("must start with 'Rs '", messageFor("1,234")),
            () -> assertEquals("bad amount: 12.345", messageFor("Rs 12.345")),
            () -> assertEquals("bad amount: -5", messageFor("Rs -5")),
            () -> assertThrows(IllegalArgumentException.class, () -> Money.parse(null)));
    }

    @Test
    void rejectsMisplacedCommas() {
        try {
            fail("accepted as " + Money.parse("Rs 1,2,3").paise() + " paise");
        } catch (IllegalArgumentException rejected) { }
    }
}
```

Error guessing paid off: the parser removes every comma before validating, so `"Rs 1,2,3"` is silently read as ₹123, which could turn a typo into a wrong payment. The fix is to validate comma positions (Indian grouping: `\d{1,2}(,\d{2})*,\d{3}` or plain digits) before removing them. Note the Indian grouping `"Rs 10,00,000"` in the valid cases: a correct fix must keep accepting it.

### T2.3 Leap years

```java junit Rule rows plus an oracle over 3,000 years
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.function.Executable;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import java.time.Year;
import java.util.stream.*;
import static org.junit.jupiter.api.Assertions.*;

class Calendar2 {
    static boolean isLeap(int y) { return y % 4 == 0 && (y % 100 != 0 || y % 400 == 0); }
}

class LeapYearTest {
    @ParameterizedTest(name = "{0}: leap = {1} ({2})")
    @CsvSource({"2024, true, divisible by 4", "2023, false, not divisible by 4",
                "1900, false, century", "2100, false, century",
                "2000, true, divisible by 400", "2400, true, divisible by 400"})
    void rules(int year, boolean leap, String reason) {
        assertEquals(leap, Calendar2.isLeap(year));
    }

    @Test
    void agreesWithJavaTimeForEveryYear() {
        Stream<Executable> checks = IntStream.rangeClosed(1, 3000).mapToObj(y ->
            () -> assertEquals(Year.isLeap(y), Calendar2.isLeap(y), "year " + y));
        assertAll(checks);
    }
}
```

The oracle test is the one place where a loop in a test is justified: it compares against a trusted implementation, and `assertAll` would list every disagreeing year rather than stopping at the first. Keep the readable rule rows too; they document *why*.

### T2.4 A property test for deduplication

Properties of a correct `dedupe(xs)`: (1) the result has no duplicates; (2) it contains exactly the values of `xs`; (3) values appear in the order of their **first** occurrence in `xs`.

```java junit Properties over 300 seeded random lists, with shrinking
import org.junit.jupiter.api.*;
import java.util.*;
import java.util.function.*;
import static org.junit.jupiter.api.Assertions.*;

class Dedupe {
    static List<Integer> hashSet(List<Integer> xs) {
        return new ArrayList<>(new HashSet<>(xs));
    }
    static List<Integer> linked(List<Integer> xs) {
        return new ArrayList<>(new LinkedHashSet<>(xs));
    }
}

class DedupeTest {
    static String violation(List<Integer> xs, List<Integer> out) {
        if (new HashSet<>(out).size() != out.size()) return "duplicates remain";
        if (!new HashSet<>(out).equals(new HashSet<>(xs))) return "values lost or added";
        for (int i = 1; i < out.size(); i++)
            if (xs.indexOf(out.get(i - 1)) > xs.indexOf(out.get(i)))
                return "first-occurrence order broken";
        return null;
    }

    static void check(Function<List<Integer>, List<Integer>> dedupe) {
        Random rnd = new Random(7);
        for (int n = 0; n < 300; n++) {
            List<Integer> xs = new ArrayList<>();
            for (int k = rnd.nextInt(9); k > 0; k--) xs.add(rnd.nextInt(10));
            if (violation(xs, dedupe.apply(xs)) == null) continue;
            boolean smaller = true;           // shrink: drop elements while it still fails
            while (smaller) {
                smaller = false;
                for (int i = 0; i < xs.size(); i++) {
                    List<Integer> ys = new ArrayList<>(xs);
                    ys.remove(i);
                    if (violation(ys, dedupe.apply(ys)) != null) {
                        xs = ys; smaller = true; break;
                    }
                }
            }
            fail(violation(xs, dedupe.apply(xs)) + " for " + xs + " -> " + dedupe.apply(xs));
        }
    }

    @Test void hashSetDedupe() { check(Dedupe::hashSet); }
    @Test void linkedHashSetDedupe() { check(Dedupe::linked); }
}
```

The `HashSet` version passes the first two properties and fails the third; shrinking reduces the random failing list to a two-element counterexample that a reader understands at a glance. It is also an honest trap: for small `Integer` values a `HashSet` happens to iterate in numeric order, so tests that use already-sorted input would never see the bug. `LinkedHashSet` keeps insertion order and passes.

### T2.5 Tests that pass alone

```java junit Shared static state, then an injected generator
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

class IdGenerator {                                  // the original: global state
    private static int next = 1;
    static String nextId() { return "INV-" + next++; }
}

@TestMethodOrder(MethodOrderer.MethodName.class)     // force the order that fails
class StaticIdsTest {
    @Test void a_createsTwoInvoices() { IdGenerator.nextId(); IdGenerator.nextId(); }
    @Test void b_firstInvoiceIsInv1() { assertEquals("INV-1", IdGenerator.nextId()); }
}

class InvoiceIds {                                   // the fix: an injected instance
    private int next = 1;
    String nextId() { return "INV-" + next++; }
}

@TestMethodOrder(MethodOrderer.MethodName.class)
class InjectedIdsTest {
    InvoiceIds ids;
    @BeforeEach void fresh() { ids = new InvoiceIds(); }
    @Test void a_createsTwoInvoices() { ids.nextId(); ids.nextId(); }
    @Test void b_firstInvoiceIsInv1() { assertEquals("INV-1", ids.nextId()); }
}
```

The static counter outlives each test, so `b_firstInvoiceIsInv1` sees whatever earlier tests consumed. JUnit's default method order is deterministic but deliberately not obvious, so such failures appear when a test is added or renamed; forcing an order with `@TestMethodOrder` reproduces it reliably, and running with `MethodOrderer.Random` in CI exposes hidden order dependence early. The real fix is design: the generator becomes an object (in production, typically a database sequence) that each test creates fresh.
