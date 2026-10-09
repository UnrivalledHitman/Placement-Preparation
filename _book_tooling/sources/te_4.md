# Chapter 9: Coverage, Mutation Testing and TDD
%What coverage measures and misses, mutation testing as a test of the tests, test-driven development, and testing legacy code

## 9.1 Coverage measures execution, not checking

**Code coverage** (JaCoCo for Java) reports which lines and branches the tests **executed**. It is good at finding untested code: 0% on a payment module is an emergency. It is bad at proving tests are good, because executing a line is not the same as checking its result. A test that calls everything and asserts nothing has full coverage.

**Mutation testing** (PIT for Java) answers the better question, "would the tests notice a bug?". It makes many small changes to the code (**mutants**: `>=` becomes `>`, `+` becomes `-`, a return value is replaced, a call is removed) and runs the tests against each one. A mutant that makes some test fail is **killed**; one that all tests survive reveals behaviour no test checks. The **mutation score** is the share killed.

The program below does mutation testing by hand on a discount rule, with two test suites that both execute every line.

```java run Two suites with full line coverage and very different mutation scores
import java.util.*;
import java.util.function.*;

public class Main {
    interface Discount { double apply(double amount, boolean member); }

    static final boolean[] hit = new boolean[4];      // line coverage of the original
    static final Discount ORIGINAL = (amount, member) -> {
        hit[0] = true;
        double rate = 0;
        if (amount >= 1000) { hit[1] = true; rate = 0.05; }
        if (member) { hit[2] = true; rate += 0.02; }
        hit[3] = true;
        return Math.round(amount * (1 - rate) * 100) / 100.0;
    };

    static double round(double amount, double rate) {
        return Math.round(amount * (1 - rate) * 100) / 100.0;
    }

    // one small change each
    static final Map<String, Discount> MUTANTS = new LinkedHashMap<>();
    static {
        MUTANTS.put(">= 1000 becomes > 1000",
                    (a, m) -> round(a, (a > 1000 ? 0.05 : 0) + (m ? 0.02 : 0)));
        MUTANTS.put("0.05 becomes 0.5",
                    (a, m) -> round(a, (a >= 1000 ? 0.5 : 0) + (m ? 0.02 : 0)));
        MUTANTS.put("+= becomes =",
                    (a, m) -> round(a, m ? 0.02 : (a >= 1000 ? 0.05 : 0)));
        MUTANTS.put("member check negated",
                    (a, m) -> round(a, (a >= 1000 ? 0.05 : 0) + (!m ? 0.02 : 0)));
        MUTANTS.put("rounding removed",
                    (a, m) -> a * (1 - ((a >= 1000 ? 0.05 : 0) + (m ? 0.02 : 0))));
    }

    // weak suite: runs every line, checks almost nothing
    static boolean weak(Discount d) {
        double r1 = d.apply(2000, true);
        double r2 = d.apply(100, false);
        return r1 > 0 && r2 > 0;
    }

    // strong suite: exact values, both sides of the boundary, both membership states
    static boolean strong(Discount d) {
        return d.apply(999.99, false) == 999.99 && d.apply(1000, false) == 950.0
            && d.apply(100, true) == 98.0 && d.apply(2000, true) == 1860.0
            && d.apply(333.33, true) == 326.66;
    }

    public static void main(String[] args) {
        weak(ORIGINAL);
        int covered = 0; for (boolean h : hit) if (h) covered++;
        System.out.printf("weak suite line coverage: %d of %d lines (%.0f%%)%n",
                          covered, hit.length, 100.0 * covered / hit.length);
        boolean bothPass = weak(ORIGINAL) && strong(ORIGINAL);
        System.out.println("both suites pass on the original: " + bothPass);
        for (var suite : List.<Map.Entry<String, Predicate<Discount>>>of(
                Map.entry("weak", Main::weak), Map.entry("strong", Main::strong))) {
            int killed = 0;
            List<String> survivors = new ArrayList<>();
            for (var m : MUTANTS.entrySet()) {
                boolean passed = suite.getValue().test(m.getValue());
                if (passed) survivors.add(m.getKey()); else killed++;
            }
            System.out.printf("%s suite: mutation score %d/%d%n",
                              suite.getKey(), killed, MUTANTS.size());
            for (String s : survivors) System.out.println("  survived: " + s);
        }
    }
}
```

Both suites execute every line of the rule, so a coverage report rates them equally. The weak suite kills none of the five mutants: it would let every one of these bugs ship. The strong suite, with exact expected values on both sides of the boundary and for both membership states, kills them all. PIT automates exactly this over a whole code base, and its surviving mutants are a precise to-do list of missing assertions.

| Metric | Answers | Limitation |
|---|---|---|
| Line coverage | Which lines ran? | Says nothing about assertions |
| Branch coverage | Did each `if` go both ways? | Still says nothing about assertions |
| Mutation score | Would the tests catch small bugs? | Slower to compute; some mutants are equivalent (behave the same) and can never be killed |

> TIP: Use coverage as a floor to find untested code, not as a target. A team rewarded for 90% coverage will write tests that execute code without checking it. Mutation testing on critical modules is a far better quality signal.

## 9.2 Test-driven development

**TDD** writes the test before the code, in a short loop:

1. **Red**: write a small failing test for the next bit of behaviour.
2. **Green**: write the simplest code that makes it pass.
3. **Refactor**: clean up code and tests while everything stays green.

| Benefit | Why |
|---|---|
| Testable design by construction | Code written to satisfy a test has injectable dependencies and clear inputs and outputs |
| Precise requirements | Each test is a concrete example of required behaviour |
| High mutation score | Every line exists because a test demanded it |
| Fast feedback and safe refactoring | The suite grows with the code |

TDD is a technique, not a religion: it shines for logic with clear rules (pricing, parsing, state machines) and is less natural for exploratory UI or spike code. Interviewers mostly want to know that you can design tests first and that you understand why it improves design.

## 9.3 Test smells and legacy code

| Smell | Problem | Fix |
|---|---|---|
| Assertion-free tests | Coverage without checking | Assert on outcomes; mutation testing finds them |
| Giant tests checking many behaviours | Failures do not say what broke | One behaviour per test |
| Logic in tests (loops, conditionals) | Tests need their own tests | Parameterised tests, plain data |
| Mystery guest (hidden fixture files, shared data) | Unreadable, coupled tests | Build data in the test, or with named builders |
| Excessive mocking | Tests coupled to implementation (Chapter 5) | Fakes, real collaborators, outcome assertions |
| Sleeping | Slow and flaky (Chapter 8) | Await conditions |
| Testing private methods via reflection | Brittle | Test through the public interface; extract a class if needed |

For **legacy code without tests**, change carefully in this order: write **characterisation tests** that record what the code does today (even if it looks wrong), find or create **seams** (an interface, a constructor parameter, an overridable method) where dependencies can be replaced, then refactor under the protection of those tests and only then change behaviour (Michael Feathers, *Working Effectively with Legacy Code*).

## 9.4 Tests in continuous integration

| Practice | Why |
|---|---|
| Run unit tests on every push, before anything slower | Feedback in minutes keeps developers fixing failures immediately |
| Separate stages for integration, contract and end-to-end tests | A slow stage never delays the fast signal |
| Run tests in parallel (JUnit's parallel execution, Maven Surefire forks, Gradle `maxParallelForks`) | Only possible when tests are independent |
| Publish reports and keep test history | Shows slow and flaky tests over time |
| Quarantine flaky tests with an owner and a deadline, never just retry them | Retries hide real race conditions |
| Fail the build on coverage drops for new code, and run mutation testing on critical modules | Stops quality eroding without chasing a global number |

## 9.5 Practical lessons

- Coverage shows what ran, not what was checked; use it to find untested code.
- Mutation testing measures whether tests would catch bugs; surviving mutants are missing assertions.
- TDD's red–green–refactor loop produces testable designs and precise tests.
- Recognise test smells; protect legacy code with characterisation tests before changing it.

# Chapter 10: Question Bank and Cheat Sheet
%Interview questions with the core of a good answer, and one-page reminders

## 10.1 Principles and design

| Question | Core of a good answer |
|---|---|
| Why write tests? | Safe change, documentation, faster feedback than production incidents |
| What is the test pyramid? | Many fast unit tests, fewer integration and contract tests, a few end-to-end tests |
| What makes a good unit test? | FIRST: fast, independent, repeatable, self-validating, timely; one behaviour; behaviour not implementation; clear name and failure message |
| How would you test this function? | Equivalence classes, boundaries on both sides, invalid inputs, decision tables for combinations, state transitions; then error guessing |
| What is boundary value analysis? | Test values at and just beyond each boundary; off-by-one bugs live there |
| How do you make code testable? | Inject dependencies, clocks and randomness; separate logic from I/O; avoid static state |
| What is property-based testing? | Check invariants over generated inputs; shrink failures to minimal counterexamples |

## 10.2 JUnit and Mockito

| Question | Core of a good answer |
|---|---|
| `@BeforeEach` versus `@BeforeAll`? | Before every test (fresh state) versus once per class, static by default (expensive shared setup) |
| Why does JUnit create a new instance per test? | Isolation: fields cannot leak state between tests |
| How do you test exceptions? | `assertThrows` returns the exception for further assertions |
| Why use `assertAll`? | Reports every failed check in a group, not just the first |
| Parameterised versus dynamic tests? | Fixed sources declared on the method versus tests generated at run time by a factory |
| Mock versus stub versus fake versus spy? | Verified interactions versus canned answers versus working simplified implementation versus recording wrapper |
| What are strict stubs? | Mockito fails tests with unused stubbings (`UnnecessaryStubbingException`) |
| When is mocking harmful? | Mocking everything couples tests to implementation; mock boundaries, fake simple collaborators, assert outcomes |
| Should you mock types you do not own? | No; wrap them in your own interface |
| How do you capture arguments? | `ArgumentCaptor`, then assert on `getValue()` |

## 10.3 Integration, flakiness and quality

| Question | Core of a good answer |
|---|---|
| How do you test database code? | Against the production engine in a container (Testcontainers), with real migrations; isolate tests by data |
| Why not H2 for MySQL code? | Different SQL dialect, functions, locking and errors; tests pass on H2 and fail in production |
| How do you test an HTTP client? | Stub server (WireMock or a local server on a random port) covering success, errors, timeouts and retries |
| What is contract testing? | Consumers record what they need; providers verify those contracts in their own builds (Pact, Spring Cloud Contract) |
| How many end-to-end tests? | A handful for critical journeys; push the rest down the pyramid |
| Why are tests flaky? | Time, randomness, sleeps, order dependence, shared resources, concurrency, external services, collection order |
| How do you test asynchronous code? | Await conditions with timeouts (Awaitility), never fixed sleeps |
| How do you test a race condition? | Force the interleaving with latches or seams; stress tests and jcstress for memory-model issues |
| Is high coverage enough? | No: coverage measures execution; mutation testing measures whether tests detect bugs |
| What is TDD? | Red, green, refactor; drives testable design |
| How do you add tests to legacy code? | Characterisation tests, seams, then refactor, then change behaviour |

## 10.4 Cheat sheet

| Topic | Remember |
|---|---|
| Pyramid | Unit (many) → integration/contract (some) → end-to-end (few) |
| Good tests | FIRST; one behaviour; arrange–act–assert; behaviour over implementation |
| Test design | Equivalence classes, boundaries, decision tables, state transitions, pairwise |
| JUnit 5 | `@Test`, lifecycle annotations, new instance per test, `assertAll`, `assertThrows`, `@Nested`, `@Tag`, `@TempDir` |
| Parameterised | `@ValueSource`, `@CsvSource`, `@MethodSource`, `@NullAndEmptySource`; `@TestFactory` |
| Doubles | Dummy, stub, fake, spy, mock; mock boundaries; fakes for repositories |
| Mockito | `when/thenReturn`, `verify`, captors, matchers, strict stubs, `MockitoExtension` |
| Integration | Testcontainers with the production engine; stub HTTP servers on random ports |
| Contracts | Consumer-driven contracts verified in provider builds |
| Flakiness | Fixed clocks, seeds, awaiting conditions, isolated data, forced interleavings |
| Quality | Coverage as a floor; mutation score as the real signal; TDD for design |
