# Chapter 3: JUnit 5 Essentials
%Test classes and lifecycle, assertions that explain failures, organising tests, extensions and ordering

## 3.1 Anatomy and lifecycle

JUnit 5 consists of the **JUnit Platform** (launches tests from IDEs, build tools and the console), **JUnit Jupiter** (the programming model used here) and **JUnit Vintage** (runs old JUnit 4 tests). A test is any method annotated `@Test` in a class; classes and methods need not be public.

| Annotation | Runs | Typical use |
|---|---|---|
| `@BeforeAll` (static) | Once before all tests in the class | Expensive shared setup (start a container) |
| `@BeforeEach` | Before every test | Fresh objects under test |
| `@AfterEach` | After every test | Clean up files, reset clocks |
| `@AfterAll` (static) | Once after all tests | Stop shared resources |
| `@TestInstance(PER_CLASS)` | One instance for all tests | Non-static `@BeforeAll`; shared state (use sparingly) |

By default JUnit creates a **new instance of the test class for every test method**, so fields cannot leak state between tests:

```java junit A fresh instance per test keeps tests independent
import org.junit.jupiter.api.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

class CartTest {
    private final List<String> cart = new ArrayList<>();       // re-created for every test
    private static int instances = 0;
    CartTest() { instances++; }

    @BeforeEach
    void addKettle() { cart.add("kettle"); }

    @Test
    void addingAnItemGivesTwo() {
        cart.add("socks");
        assertEquals(2, cart.size());
    }

    @Test
    void startsWithOnlyTheKettle() {
        // unaffected by the other test
        assertEquals(List.of("kettle"), cart);
    }

    @AfterAll
    static void oneInstancePerTest() {
        assertEquals(2, instances, "JUnit created one instance per test method");
    }
}
```

## 3.2 Assertions that explain failures

A failing test should say what went wrong without a debugger. JUnit's assertions take an optional message (as a lambda, built only on failure), and `assertAll` reports **every** failed check in a group instead of stopping at the first.

| Assertion | Use |
|---|---|
| `assertEquals(expected, actual)` | Values; add a delta for doubles |
| `assertTrue`, `assertFalse`, `assertNull`, `assertNotNull` | Conditions |
| `assertThrows(Type.class, () -> ...)` | Expected exceptions; returns the exception to inspect |
| `assertAll(...)` | Several related checks, all reported |
| `assertIterableEquals`, `assertLinesMatch` | Collections and text output |
| `assertTimeout(duration, ...)` | Performance guard (or `assertTimeoutPreemptively` to abort) |

```java junit assertAll reports every broken field at once
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

record Bill(String meterId, double kwh, double amount, String currency) { }

class BillTest {
    // amount should be 440
    Bill compute() { return new Bill("MTR-00042", 120.0, 410.0, "INR"); }

    @Test
    void stopsAtFirstFailure() {
        Bill b = compute();
        assertEquals(440.0, b.amount(), 0.001, "amount");
        assertEquals("USD", b.currency(), "currency");            // never reached
    }

    @Test
    void reportsEveryFailure() {
        Bill b = compute();
        assertAll("bill",
            () -> assertEquals("MTR-00042", b.meterId()),
            () -> assertEquals(440.0, b.amount(), 0.001, "amount"),
            () -> assertEquals("USD", b.currency(), "currency"));
    }

    @Test
    void exceptionsAreValuesToInspect() {
        var e = assertThrows(NumberFormatException.class, () -> Double.parseDouble("12,5"));
        assertTrue(e.getMessage().contains("12,5"));
    }
}
```

The first test reports only the wrong amount; `assertAll` reports both problems, each with its own message, so one test run reveals everything that is wrong. Both tests fail on purpose here: the object under test has a wrong amount and the expected currency is deliberately different.

## 3.3 Organising tests

```java junit Display names, nested contexts, tags and disabled tests
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

class Account {
    private long balance;
    Account(long opening) { balance = opening; }
    void withdraw(long amount) {
        if (amount > balance) throw new IllegalStateException("insufficient funds");
        balance -= amount;
    }
    long balance() { return balance; }
}

@DisplayName("An account")
class AccountTest {
    @Nested
    @DisplayName("with a balance of 500")
    class WithBalance {
        Account account;
        @BeforeEach void open() { account = new Account(500); }

        @Test @DisplayName("allows withdrawing less than the balance")
        void withdrawLess() { account.withdraw(200); assertEquals(300, account.balance()); }

        @Test @DisplayName("allows withdrawing exactly the balance")
        void withdrawAll() { account.withdraw(500); assertEquals(0, account.balance()); }

        @Test @DisplayName("refuses to go overdrawn")
        void overdraw() {
            assertThrows(IllegalStateException.class, () -> account.withdraw(501));
        }
    }

    @Test @Tag("slow") @DisplayName("survives a million small withdrawals")
    void manyWithdrawals() {
        Account a = new Account(1_000_000);
        for (int i = 0; i < 1_000_000; i++) a.withdraw(1);
        assertEquals(0, a.balance());
    }

    @Test @Disabled("interest is not implemented yet (TICKET-812)")
    void addsMonthlyInterest() { fail("not implemented"); }
}
```

`@Nested` classes group tests that share a situation ("given a balance of 500") and read like a specification; display names replace method names in reports. Tags let builds include or exclude groups (`--include-tag fast`, or Maven Surefire `groups`); disabled tests appear in reports with their reason, which is better than commenting them out and forgetting them.

## 3.4 Extensions and built-in helpers

JUnit 5 is extended through `@ExtendWith`: `MockitoExtension` (Chapter 5), `SpringExtension` (used by `@SpringBootTest`), `TestcontainersExtension` (Chapter 6). Built-in helpers include `@TempDir` for temporary files and `@Timeout`:

```java junit A temporary directory that JUnit creates and deletes
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.io.TempDir;
import java.nio.file.*;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class ReportWriterTest {
    static void writeReport(Path dir, List<String> lines) throws Exception {
        Files.write(dir.resolve("report.csv"), lines);
    }

    @Test
    @Timeout(2)
    void writesTheReportFile(@TempDir Path dir) throws Exception {
        writeReport(dir, List.of("meter,kwh", "MTR-1,12.5"));
        Path file = dir.resolve("report.csv");
        assertTrue(Files.exists(file));
        assertLinesMatch(List.of("meter,kwh", "MTR-\\d+,[\\d.]+"), Files.readAllLines(file));
    }
}
```

`assertLinesMatch` accepts regular expressions per line, which suits generated output with variable values. The directory is created fresh for the test and deleted afterwards, so tests never collide on file names or leave litter.

## 3.5 Test order

JUnit runs test methods in an order that is **deterministic but deliberately not obvious** (not the order in the source file, as the outputs above show). That is intentional: tests must not depend on each other. `@TestMethodOrder(OrderAnnotation.class)` exists for rare cases such as a stepwise integration scenario, but a suite whose tests only pass in one order hides shared-state bugs.

## 3.6 Practical lessons

- One test-class instance per test method: fields are fresh for every test.
- Use assertion messages and `assertAll` so failures explain themselves.
- Organise with display names, `@Nested` contexts and tags; disable with a reason, never by commenting out.
- Use extensions and helpers (`@TempDir`, `@Timeout`); never rely on test order.

# Chapter 4: Parameterised and Property-Style Tests
%Data-driven tests with value, CSV and method sources, dynamic tests, and testing properties over many generated inputs

## 4.1 Parameterised tests

A parameterised test runs the same test logic over many inputs, each reported separately. It replaces copy-pasted tests and makes adding a case a one-line change.

| Source | Supplies | Example |
|---|---|---|
| `@ValueSource` | Single literal values | `@ValueSource(strings = {"MTR-00001", "MTR-99999"})` |
| `@NullAndEmptySource` | `null` and empty | Combine with `@ValueSource` for blank inputs |
| `@CsvSource` / `@CsvFileSource` | Rows of several values | Input and expected output |
| `@EnumSource` | Enum constants | Every tariff type |
| `@MethodSource` | Any `Stream<Arguments>` from a factory method | Complex objects, generated cases |

```java junit Validating meter IDs with several sources
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.*;
import java.util.stream.Stream;
import static org.junit.jupiter.api.Assertions.*;

class MeterIds {
    static boolean isValid(String id) {
        return id != null && id.matches("MTR-\\d{5}");
    }
}

class MeterIdsTest {
    @ParameterizedTest(name = "valid: {0}")
    @ValueSource(strings = {"MTR-00001", "MTR-99999", "MTR-12345"})
    void acceptsWellFormedIds(String id) { assertTrue(MeterIds.isValid(id)); }

    @ParameterizedTest(name = "invalid: \"{0}\"")
    @NullAndEmptySource
    @ValueSource(strings = {" ", "MTR-1234", "MTR-123456", "mtr-00001", "MTR-0000A",
            "XYZ-00001"})
    void rejectsMalformedIds(String id) { assertFalse(MeterIds.isValid(id)); }

    static Stream<Arguments> padded() {
        return Stream.of(Arguments.of(1, "MTR-00001"), Arguments.of(42, "MTR-00042"),
                         Arguments.of(99999, "MTR-99999"));
    }

    @ParameterizedTest(name = "number {0} formats as {1}")
    @MethodSource("padded")
    void formatsNumbers(int n, String expected) {
        assertEquals(expected, String.format("MTR-%05d", n));
        assertTrue(MeterIds.isValid(expected));
    }
}
```

## 4.2 Dynamic tests

`@TestFactory` methods return tests created at run time, for example one test per row of a data file or per example in a specification. Unlike parameterised tests, the number and names of tests can depend on anything computed when the suite runs.

```java junit One dynamic test per tariff example
import org.junit.jupiter.api.*;
import java.util.*;
import java.util.stream.Stream;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.DynamicTest.dynamicTest;

class TariffTest {
    static double cost(String tariff, double kwh) {
        return switch (tariff) {
            case "standard" -> kwh * 7.0;
            case "night" -> kwh * 4.5;
            // first 50 kWh covered by panels
            case "solar" -> Math.max(0, kwh - 50) * 7.0;
            default -> throw new IllegalArgumentException(tariff);
        };
    }

    @TestFactory
    Stream<DynamicTest> examplesFromTheTariffSpec() {
        var examples = new LinkedHashMap<String, double[]>();
        examples.put("standard, 100 kWh", new double[]{100, 700});
        examples.put("night, 100 kWh", new double[]{100, 450});
        examples.put("solar, 30 kWh", new double[]{30, 0});
        examples.put("solar, 80 kWh", new double[]{80, 210});
        return examples.entrySet().stream().map(e -> dynamicTest(e.getKey(), () -> {
            String tariff = e.getKey().split(",")[0];
            assertEquals(e.getValue()[1], cost(tariff, e.getValue()[0]), 0.001);
        }));
    }
}
```

## 4.3 Property-style tests

Example-based tests check chosen inputs. **Property-based tests** state something that must hold for **all** inputs and check it against hundreds of generated ones; when a case fails, the tool **shrinks** it to the smallest failing input. Libraries such as **jqwik** do this for JUnit 5; the idea fits in a plain test with a seeded random generator, as below.

A bill-splitting function divides a total (in paise) among *n* people. The property: the parts must add up to the total, and no two parts may differ by more than one paisa.

```java junit A property test finds and shrinks a rounding bug
import org.junit.jupiter.api.*;
import java.util.*;
import java.util.function.BiFunction;
import static org.junit.jupiter.api.Assertions.*;

class Split {
    // integer division loses paise
    static long[] naive(long totalPaise, int people) {
        long[] parts = new long[people];
        Arrays.fill(parts, totalPaise / people);
        return parts;
    }
    static long[] fair(long totalPaise, int people) {              // spread the remainder
        long[] parts = new long[people];
        for (int i = 0; i < people; i++) parts[i] = totalPaise / people
                + (i < totalPaise % people ? 1 : 0);
        return parts;
    }
}

class SplitPropertyTest {
    static String check(BiFunction<Long, Integer, long[]> split) {
        Random rnd = new Random(42);
        for (int trial = 0; trial < 1000; trial++) {
            long total = rnd.nextInt(1_000_000);
            int people = 1 + rnd.nextInt(12);
            if (!holds(split.apply(total, people), total)) {
                // shrink: smallest failing total
                for (long t = 1; t <= total; t++)
                    if (!holds(split.apply(t, people), t)) { total = t; break; }
                // then the fewest people
                for (int p = 2; p <= people; p++)
                    if (!holds(split.apply(total, p), total)) { people = p; break; }
                return "shrunk to total=" + total + " paise, people=" + people;
            }
        }
        return null;
    }
    static boolean holds(long[] parts, long total) {
        long sum = Arrays.stream(parts).sum();
        long spread = Arrays.stream(parts).max().getAsLong()
                    - Arrays.stream(parts).min().getAsLong();
        return sum == total && spread <= 1;
    }

    @Test void naiveSplit() { assertNull(check(Split::naive)); }
    @Test void fairSplit() { assertNull(check(Split::fair)); }
}
```

The naive version passes any hand-picked example that divides evenly, which is exactly the kind of example people pick. The property test finds a failure among random inputs and shrinks it to a tiny counterexample that makes the bug obvious. Good properties to look for: round trips (`decode(encode(x)) == x`), invariants (totals preserved, balances never negative), comparison with a simple reference implementation, and idempotence (applying twice equals applying once).

## 4.4 Practical lessons

- Use parameterised tests for many inputs with the same logic; name each case.
- Use `@MethodSource` for complex arguments and `@TestFactory` for tests computed at run time.
- Property tests check invariants over generated inputs and shrink failures to minimal cases.
- Seed random generators so failures are reproducible.
