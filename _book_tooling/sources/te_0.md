# How to use this guide
%What this book covers, how its tests were run, and how testing questions appear in interviews

Testing is where many engineers are weakest and where interviewers quietly separate candidates: "How would you test this function?", "What is the difference between a mock and a stub?", "Why are your tests flaky?", "Is 90% coverage good?". This guide covers testing for Java developers in depth: deciding what to test, designing test cases systematically, **JUnit 5**, parameterised tests, test doubles and **Mockito**, integration tests with real dependencies and **Testcontainers**, contract tests, flaky tests, coverage, **mutation testing** and test-driven development.

It builds on earlier books: the **Java** guide (the language), the **Spring Boot** guide (which shows Spring's test slices and a first Testcontainers test), the **DevOps** guide (tests in CI pipelines and flaky-test statistics) and the **Low-Level Design** guide (designing classes that are easy to test). Those parts are referenced, not repeated.

## How the tests were run

Every test in this book was compiled and executed: JUnit 5.14 (Jupiter, run with the JUnit Platform console launcher) and Mockito 5.24 on JDK 25. The output under each test class is the launcher's real test tree: ✔ for a passing test, ✘ for a failing one with its failure message, then the totals. Some examples **fail on purpose**, because a test that catches a bug is the point of the example. Testcontainers needs Docker, which is not available here, so its tests are shown as code with an explanation of exactly what they do.

> TIP: Run the tests yourself with Maven or Gradle (`junit-jupiter` and `mockito-core` dependencies) or, without a build tool, with the JUnit console launcher jar: `java -jar junit-platform-console-standalone.jar execute --class-path classes --scan-class-path`.

## Map of the guide

| Chapter | Topic | Typical interview question |
|---|---|---|
| 1 | Why and what to test | "What makes a good unit test?" |
| 2 | Designing test cases | "How would you test this function?" |
| 3 | JUnit 5 essentials | "What is the difference between `@BeforeEach` and `@BeforeAll`?" |
| 4 | Parameterised and property-style tests | "How do you test many inputs without copy-paste?" |
| 5 | Test doubles and Mockito | "Mock or stub? When is mocking harmful?" |
| 6 | Integration tests and Testcontainers | "How do you test code that talks to a database?" |
| 7 | Contract and end-to-end tests | "How do you test microservices without deploying them all?" |
| 8 | Flaky tests, time and concurrency | "Why does this test fail one run in fifty?" |
| 9 | Coverage, mutation testing and TDD | "Is high coverage enough?" |
| 10 | Question bank and cheat sheet | Revision |

# Chapter 1: Why and What to Test
%What tests are for, the test pyramid, properties of good tests, and designing code that is easy to test

## 1.1 What tests buy

Tests are not mainly for finding bugs today. They are for **changing code safely tomorrow**: a good suite lets a team refactor, upgrade libraries and add features with confidence, and it documents behaviour in executable form. Bugs found by tests cost minutes; the same bugs found in production cost incidents, data repairs and customer trust.

| Level | Tests | Speed | What it catches | How many |
|---|---|---|---|---|
| Unit | One class or function, dependencies replaced | Milliseconds | Logic errors, edge cases | Many (hundreds to thousands) |
| Integration | Real collaborators: database, queue, HTTP client against a stub server | Seconds | Wiring, SQL, serialisation, configuration | Some |
| Contract | The agreement between a consumer and a provider service | Seconds | Breaking API changes between teams | One per interaction |
| End-to-end | The deployed system through its UI or public API | Minutes | Whole-flow failures | Few, for critical journeys |

This is the **test pyramid**: many fast, focused tests at the bottom, few slow, broad ones at the top. An inverted pyramid (mostly end-to-end tests) is slow, flaky and hard to diagnose. Some teams prefer a "trophy" shape with more integration tests, because modern tools (Testcontainers) make them fast and they catch more realistic bugs; the principle is the same: most confidence per second of test time.

## 1.2 Properties of good tests

| Property (FIRST) | Meaning | Violation |
|---|---|---|
| Fast | Run in milliseconds, so they run constantly | Sleeping, real network calls in unit tests |
| Independent | No test depends on another's side effects or order | Shared mutable static state; a test that only passes after another |
| Repeatable | Same result on every machine and run | Wall-clock time, random data without a seed, external services |
| Self-validating | Pass or fail automatically | Printing values for a human to read |
| Timely | Written with the code (or before it) | "We'll add tests later" |

And beyond FIRST: a good test checks **one behaviour**, has a name that says what it expects (`rejectsNegativeAmounts`), follows **arrange–act–assert**, and fails with a message that explains the problem. It tests **behaviour through the public interface**, not implementation details, so refactoring does not break it.

## 1.3 Designing for testability

Code is hard to test when it creates its own dependencies, reads the clock or environment directly, or mixes logic with I/O. The fixes are design fixes:

| Problem | Testable alternative |
|---|---|
| `new PaymentGateway()` inside the class | Inject the dependency through the constructor (dependency inversion; LLD guide, Chapter 3) |
| `LocalDate.now()` scattered through logic | Inject a `java.time.Clock` |
| `Math.random()` | Inject a `Random` (or a seed) |
| Business rules inside controllers or SQL | Pure functions and domain classes that can be called directly |
| Static singletons holding state | Instances passed in; state reset per test |

## 1.4 Practical lessons

- Tests exist to make change safe; they are executable documentation.
- Keep a pyramid: many fast unit tests, some integration tests, few end-to-end tests.
- Good tests are fast, independent, repeatable, self-validating and test behaviour, not implementation.
- Testability is a design property: inject dependencies, time and randomness.

# Chapter 2: Designing Test Cases
%Equivalence partitioning, boundary values, decision tables and state transitions, applied with JUnit

## 2.1 Equivalence partitioning and boundaries

Testing every input is impossible, so inputs are divided into **equivalence classes**, groups the code should treat the same way, and one representative of each class is tested. Bugs, however, cluster at the **boundaries** between classes, where `<` and `<=` differ. Boundary value analysis tests each side of every boundary.

The example is a checkout rule: orders of ₹1,000 or more ship free (otherwise ₹40), orders of ₹5,000 or more get 5% off, negative amounts are invalid.

| Class | Representative | Boundaries to test |
|---|---|---|
| Invalid: amount < 0 | −10 | −1 (and 0 on the valid side) |
| Small: 0 ≤ amount < 1,000 | 500 | 0, 999 |
| Free delivery: 1,000 ≤ amount < 5,000 | 3,000 | 1,000, 4,999 |
| Discount: amount ≥ 5,000 | 8,000 | 5,000 |

The first version has a classic bug: it uses `>` where the rule says "or more".

```java junit Representatives pass; boundaries catch the bug
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import static org.junit.jupiter.api.Assertions.*;

class Checkout {
    static double total(double amount) {
        if (amount < 0) throw new IllegalArgumentException("amount must not be negative");
        double delivery = amount > 1000 ? 0 : 40;            // BUG: should be >= 1000
        double discount = amount > 5000 ? amount * 0.05 : 0; // BUG: should be >= 5000
        return amount - discount + delivery;
    }
}

class CheckoutTest {
    @ParameterizedTest(name = "representative {0} -> {1}")
    @CsvSource({"500, 540", "3000, 3000", "8000, 7600"})
    void oneValuePerClass(double amount, double expected) {
        assertEquals(expected, Checkout.total(amount), 0.001);
    }

    @ParameterizedTest(name = "boundary {0} -> {1}")
    @CsvSource({"0, 40", "999, 1039", "1000, 1000", "4999, 4999", "5000, 4750"})
    void boundaries(double amount, double expected) {
        assertEquals(expected, Checkout.total(amount), 0.001);
    }

    @Test
    void rejectsNegativeAmounts() {
        assertThrows(IllegalArgumentException.class, () -> Checkout.total(-1));
    }
}
```

All three representatives pass, so a suite built only from "typical" values would ship this bug. The boundary tests at exactly ₹1,000 and ₹5,000 fail and say precisely what is wrong. With the operators corrected, the same tests pass:

```java junit The corrected rule passes every class and boundary
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import static org.junit.jupiter.api.Assertions.*;

class Checkout {
    static double total(double amount) {
        if (amount < 0) throw new IllegalArgumentException("amount must not be negative");
        double delivery = amount >= 1000 ? 0 : 40;
        double discount = amount >= 5000 ? amount * 0.05 : 0;
        return amount - discount + delivery;
    }
}

class CheckoutTest {
    @ParameterizedTest(name = "{0} -> {1}")
    @CsvSource({"0, 40", "500, 540", "999, 1039", "1000, 1000", "3000, 3000",
                "4999, 4999", "5000, 4750", "8000, 7600"})
    void totals(double amount, double expected) {
        assertEquals(expected, Checkout.total(amount), 0.001);
    }

    @Test
    void rejectsNegativeAmounts() {
        assertThrows(IllegalArgumentException.class, () -> Checkout.total(-1));
    }
}
```

## 2.2 Decision tables

When behaviour depends on **combinations** of conditions, list them in a decision table so no combination is forgotten. A loan pre-check: approve if the applicant is an adult **and** income is at least ₹25,000 **and** there is no default on record; refer to a human if everything is fine except income between ₹15,000 and ₹25,000; otherwise reject.

| Rule | Adult | Income ≥ 25k | 15k ≤ income < 25k | Prior default | Outcome |
|---|---|---|---|---|---|
| R1 | Yes | Yes | – | No | Approve |
| R2 | Yes | No | Yes | No | Refer |
| R3 | Yes | No | No | No | Reject |
| R4 | Yes | any | any | Yes | Reject |
| R5 | No | any | any | any | Reject |

Each rule becomes at least one test case; the table also reveals ambiguities to settle with the product owner before coding (what about exactly ₹15,000?).

## 2.3 State transitions

Objects with a lifecycle (orders, payments, accounts) are tested by their **state machine**: every valid transition, and the invalid ones that must be refused.

```java junit Valid and invalid transitions of an order
import org.junit.jupiter.api.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

class Order {
    enum State { CREATED, PAID, SHIPPED, DELIVERED, CANCELLED }
    private static final Map<State, Set<State>> NEXT = Map.of(
        State.CREATED, EnumSet.of(State.PAID, State.CANCELLED),
        State.PAID, EnumSet.of(State.SHIPPED, State.CANCELLED),
        State.SHIPPED, EnumSet.of(State.DELIVERED),
        State.DELIVERED, EnumSet.noneOf(State.class),
        State.CANCELLED, EnumSet.noneOf(State.class));
    private State state = State.CREATED;
    State state() { return state; }
    void moveTo(State target) {
        if (!NEXT.get(state).contains(target))
            throw new IllegalStateException(state + " -> " + target + " not allowed");
        state = target;
    }
}

class OrderTest {
    @Test
    void happyPathReachesDelivered() {
        Order o = new Order();
        o.moveTo(Order.State.PAID);
        o.moveTo(Order.State.SHIPPED);
        o.moveTo(Order.State.DELIVERED);
        assertEquals(Order.State.DELIVERED, o.state());
    }

    @Test
    void cannotCancelAfterShipping() {
        Order o = new Order();
        o.moveTo(Order.State.PAID);
        o.moveTo(Order.State.SHIPPED);
        var e = assertThrows(IllegalStateException.class,
                () -> o.moveTo(Order.State.CANCELLED));
        assertEquals("SHIPPED -> CANCELLED not allowed", e.getMessage());
    }

    @Test
    void cannotShipUnpaidOrder() {
        assertThrows(IllegalStateException.class,
                () -> new Order().moveTo(Order.State.SHIPPED));
    }
}
```

## 2.4 Other techniques

| Technique | Use when |
|---|---|
| Pairwise (all-pairs) testing | Many parameters with several values each: test every **pair** of values instead of every combination (bugs usually involve one or two factors) |
| Error guessing | Null, empty, very long, Unicode, duplicate, concurrent, time-zone and leap-year inputs |
| Property-based testing | State properties that hold for all inputs and check them against generated data (Chapter 4) |
| Risk-based prioritisation | Test hardest where failure is most expensive: money, security, data loss |

## 2.5 Practical lessons

- Partition inputs into equivalence classes; test one representative per class.
- Always test both sides of every boundary; that is where off-by-one bugs hide.
- Use decision tables for combinations and state machines for lifecycles, including invalid transitions.
- Spend test effort where failures cost the most.
