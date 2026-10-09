# How to use this practice book
%20 exercises matching the Software Testing guide, with hints kept separate and executed solutions

Each part matches chapters of the **Software Testing** guide. Code exercises ask you to write JUnit 5 tests (and sometimes the code under test) for a small, realistic class; every solution was compiled and run on the JUnit console launcher, and its real test tree is shown under it. Some solutions **fail on purpose**: when a test finds a bug, the failing test is the answer.

| Type | What you do |
|---|---|
| Code | Write the tests and run them |
| Numerical | Calculate, then check |
| Concept | Explain the idea and the trade-off |
| Debug | Find what is wrong with a test or with testability, and fix it |
| Design | Plan a test strategy |

**Marking scheme.** Mark ✓ (solved alone), ~ (with the hint) or ✗ (needed the solution). For Code exercises, ✓ also requires that your tests would **fail** if the code had the bug in question: run them against a deliberately broken version if you are unsure. Redo every ~ and ✗ a week later.

| Part | Guide chapters | Topic | Exercises |
|---|---|---|---|
| 1 | 1–2 | Good tests and test design | 5 |
| 2 | 3–4 | JUnit 5 and parameterised tests | 5 |
| 3 | 5 | Test doubles and Mockito | 5 |
| 4 | 6–9 | Integration, flakiness and test quality | 5 |

# Exercises

## Part 1: Good tests and test design

**T1.1 · Easy · Concept · Spot the FIRST violations.** Name the property violated and the fix for each test: (a) it calls the real currency-exchange API; (b) `testB` passes only if `testA` has already created a user; (c) it prints a computed invoice for a developer to inspect; (d) it builds customers with `new Random()` ages; (e) it sleeps two seconds to let an asynchronous job finish.

**T1.2 · Medium · Code · Ticket prices at the boundaries.** Ticket prices: ages 0–4 free, 5–17 ₹100, 18–59 ₹200, 60 and over ₹120; ages below 0 or above 120 are invalid. Write equivalence-class and boundary tests, and run them against an implementation that uses `age <= 60` for the full fare.

**T1.3 · Medium · Code · A decision table as tests.** Turn the guide's loan pre-check decision table (approve, refer or reject from age, income and prior default) into one parameterised test with a row per rule, plus rows for the income boundaries at ₹15,000 and ₹25,000.

**T1.4 · Medium · Code · Every transition of a workflow.** A document moves DRAFT → IN_REVIEW (submit), IN_REVIEW → PUBLISHED (approve) or back to DRAFT (reject), and PUBLISHED → ARCHIVED (archive). Every other state–event pair must be refused. Generate a test for **all 16** pairs and run it against an implementation that wrongly lets drafts be archived.

**T1.5 · Medium · Debug · Make it testable.** This service cannot be unit-tested. Explain why, refactor it, and write tests for the seventh and eighth day after the due date.

```text
class LateFeeService {
    void chargeLateFees(List<Invoice> invoices) {
        LocalDate today = LocalDate.now();
        SmtpMailer mailer = new SmtpMailer("smtp.example.com");
        for (Invoice i : invoices)
            if (today.isAfter(i.due().plusDays(7))) {
                i.addFee(50);
                mailer.send(i.email(), "A late fee of Rs 50 was added");
            }
    }
}
```

## Part 2: JUnit 5 and parameterised tests

**T2.1 · Easy · Concept · Lifecycle order.** A test class has a static `@BeforeAll`, a constructor, `@BeforeEach`, `@AfterEach` and two tests. Write down the exact order of calls, then check it with a test. What changes with `@TestInstance(Lifecycle.PER_CLASS)`?

**T2.2 · Medium · Code · Testing a money parser.** `Money.parse` turns `"Rs 1,234.50"` into 123,450 paise. Write tests for valid inputs with `assertAll`, and for invalid ones with `assertThrows` that also check the message. Use error guessing to find at least one input it wrongly accepts.

**T2.3 · Easy · Code · Leap years.** Test a leap-year function with `@CsvSource` rows for each rule (divisible by 4, by 100, by 400), and add an oracle test comparing it with `java.time.Year.isLeap` for every year from 1 to 3000 that reports all mismatches at once.

**T2.4 · Medium · Code · A property test for deduplication.** A `dedupe` method should remove repeated values and keep the first occurrence of each, in order. State three properties, check them over generated lists with a seeded generator, shrink failures, and run against an implementation built on `HashSet`.

**T2.5 · Medium · Debug · Tests that pass alone.** `firstInvoiceIsInv1` passes when run on its own but fails in the full suite. Reproduce the failure deterministically, explain it, and fix the design.

```text
class IdGenerator {
    private static int next = 1;
    static String nextId() { return "INV-" + next++; }
}
```

## Part 3: Test doubles and Mockito

**T3.1 · Easy · Concept · Which double?** Choose a dummy, stub, fake, spy or mock, and say why: (a) a logger the constructor requires but the test does not care about; (b) an exchange-rate service that must return 83.0; (c) a user repository used by 30 tests of a registration service; (d) checking that exactly one SMS with the one-time password is sent; (e) a real price calculator where one slow method must be replaced.

**T3.2 · Medium · Code · Password reset.** `PasswordReset.request(username)` emails a reset link with a fresh token if the user exists, and returns the same message either way (so attackers cannot discover which usernames exist). Test both paths with Mockito, capturing the email body.

**T3.3 · Medium · Code · Retries and compensation.** A checkout charges a payment gateway, retrying up to three times on `GatewayTimeout`, then records the payment in a ledger; if recording fails, it refunds the charge. Test the retries, the give-up case and the refund, including call order.

**T3.4 · Medium · Debug · Two broken stubs.** Explain why each test fails and fix it: one stubs `prices.price(anyString(), "north")`; the other stubs `price("A1", "north")` while the code calls `price("A1", "North")`.

**T3.5 · Medium · Code · A fake instead of mocks.** Test a registration service that normalises emails and rejects duplicates, using an in-memory fake repository instead of Mockito. Why is this better here?

## Part 4: Integration, flakiness and test quality

**T4.1 · Medium · Code · An HTTP client against a stub server.** A rate client must honour `429 Too Many Requests` with a `Retry-After` header and report malformed JSON clearly. Test it against a JDK `HttpServer` on a random port, without real sleeping.

**T4.2 · Medium · Code · A greeting that fails after lunch.** A greeter returns "Good morning", "Good afternoon" or "Good evening" from `LocalTime.now()`, and its test fails every afternoon and on the UTC build server. Fix the design and test the boundaries at 12:00 and 17:00 in Indian time.

**T4.3 · Medium · Code · Find the surviving mutants.** For a shipping-fee rule (₹50 up to 1 kg, ₹20 per extra started kg, doubled for express), apply five mutants to a given three-test suite, report the survivors, and add tests to kill them. Which survivor can never be killed?

**T4.4 · Easy · Numerical · How flaky is the build?** A suite has 400 tests, each failing spuriously one run in 1,000. What share of builds go red for no reason? What if each failure is retried once? Why is the retry still a bad long-term fix?

**T4.5 · Hard · Design · A test strategy for a payment service.** A payment microservice has a REST API, a MySQL database, a Kafka topic for payment events and a third-party card gateway. Design its test strategy: what is tested at each level, with which tools, how it runs in CI and how flaky tests are handled.
