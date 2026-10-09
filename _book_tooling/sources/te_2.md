# Chapter 5: Test Doubles and Mockito
%Dummies, stubs, fakes, spies and mocks; Mockito's stubbing, verification and captors; strict stubs; and when mocking hurts

## 5.1 Kinds of test double

A **test double** stands in for a real dependency so a unit can be tested fast and in isolation (Gerard Meszaros's terms):

| Double | What it does | Example |
|---|---|---|
| Dummy | Passed but never used | A `null`-safe placeholder logger |
| Stub | Returns canned answers | A tariff repository that always returns `standard` |
| Fake | A working, simplified implementation | An in-memory repository backed by a `HashMap` |
| Spy | Records how it was called, possibly wrapping a real object | A notifier that remembers messages sent |
| Mock | Pre-programmed with expectations, verified afterwards | "`charge` must be called once with ₹440" |

The examples in this chapter test one service with four dependencies:

```text
class BillingService {
    BillingService(TariffRepository tariffs, PaymentGateway gateway,
                   Notifier notifier, Clock clock) { ... }
    Receipt bill(String meterId, double kwh) {
        // look up the tariff, compute the amount, charge the customer,
        // notify them, and stamp the receipt with the current time
    }
}
```

## 5.2 Mockito in practice

```java junit Stubbing, verification and an argument captor
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.time.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

interface TariffRepository { double ratePerKwh(String meterId); }
interface PaymentGateway { String charge(String meterId, double amount); }
interface Notifier { void send(String meterId, String message); }
record Receipt(String meterId, double amount, String paymentId, Instant issuedAt) { }

class BillingService {
    private final TariffRepository tariffs; private final PaymentGateway gateway;
    private final Notifier notifier; private final Clock clock;
    BillingService(TariffRepository t, PaymentGateway g, Notifier n, Clock c) {
        tariffs = t; gateway = g; notifier = n; clock = c;
    }
    Receipt bill(String meterId, double kwh) {
        if (kwh < 0) throw new IllegalArgumentException("negative usage");
        double amount = Math.round(kwh * tariffs.ratePerKwh(meterId) * 100) / 100.0;
        String paymentId = gateway.charge(meterId, amount);
        notifier.send(meterId, String.format("Charged Rs %.2f (payment %s)", amount,
                paymentId));
        return new Receipt(meterId, amount, paymentId, clock.instant());
    }
}

@ExtendWith(MockitoExtension.class)
class BillingServiceTest {
    @Mock TariffRepository tariffs;
    @Mock PaymentGateway gateway;
    @Mock Notifier notifier;
    @Captor ArgumentCaptor<String> message;
    final Clock clock = Clock.fixed(Instant.parse("2026-10-01T06:00:00Z"), ZoneOffset.UTC);
    BillingService service;

    @BeforeEach
    void wire() { service = new BillingService(tariffs, gateway, notifier, clock); }

    @Test
    void chargesTheComputedAmountAndNotifies() {
        when(tariffs.ratePerKwh("MTR-7")).thenReturn(7.0);              // stub
        when(gateway.charge("MTR-7", 840.0)).thenReturn("pay-123");
        Receipt r = service.bill("MTR-7", 120);
        assertEquals(new Receipt("MTR-7", 840.0, "pay-123", clock.instant()), r);
        // mock: verify the interaction
        verify(gateway).charge("MTR-7", 840.0);
        verify(notifier).send(eq("MTR-7"), message.capture());
        assertEquals("Charged Rs 840.00 (payment pay-123)", message.getValue());
    }

    @Test
    void doesNotNotifyWhenPaymentFails() {
        when(tariffs.ratePerKwh(anyString())).thenReturn(7.0);
        when(gateway.charge(anyString(), anyDouble()))
                .thenThrow(new IllegalStateException("card declined"));
        assertThrows(IllegalStateException.class, () -> service.bill("MTR-7", 10));
        verifyNoInteractions(notifier);
    }

    @Test
    void rejectsNegativeUsageBeforeTouchingAnything() {
        assertThrows(IllegalArgumentException.class, () -> service.bill("MTR-7", -1));
        verifyNoInteractions(tariffs, gateway, notifier);
    }
}
```

| Mockito feature | Use |
|---|---|
| `when(mock.call(args)).thenReturn(x)` / `thenThrow(e)` | Stub a return value or failure |
| Argument matchers (`any()`, `anyString()`, `eq(x)`, `argThat(...)`) | Match flexibly; if one argument uses a matcher, all must |
| `verify(mock).call(args)`, `times(n)`, `never()` | Check an interaction happened (or not) |
| `ArgumentCaptor` | Capture what was passed, then assert on it |
| `verifyNoInteractions`, `verifyNoMoreInteractions` | Prove nothing (else) happened |
| `inOrder(a, b).verify(...)` | Check call order when order matters |
| `spy(realObject)` | Real behaviour with selected methods stubbed |
| `@Mock`, `@InjectMocks`, `MockitoExtension` | Annotation-based setup |

The fixed `Clock` makes the receipt's timestamp deterministic, which is why the whole receipt can be compared with one `assertEquals`.

## 5.3 Strict stubs catch dead setup

With `MockitoExtension`, Mockito uses **strict stubs**: a stubbing that the test never uses makes the test fail with `UnnecessaryStubbingException`. That catches copy-pasted setup and tests whose stubs no longer match the code (for example after an argument changed), which otherwise pass for the wrong reason.

```java junit An unused stub fails the test
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

interface Rates { double rate(String meterId); double nightRate(String meterId); }

class Pricer {
    private final Rates rates;
    Pricer(Rates rates) { this.rates = rates; }
    double price(String meterId, double kwh) { return kwh * rates.rate(meterId); }
}

@ExtendWith(MockitoExtension.class)
class PricerTest {
    @Mock Rates rates;

    @Test
    void pricesWithTheStandardRate() {
        when(rates.rate("MTR-1")).thenReturn(7.0);
        // copied from another test, never used
        when(rates.nightRate("MTR-1")).thenReturn(4.5);
        assertEquals(70.0, new Pricer(rates).price("MTR-1", 10), 0.001);
    }
}
```

The assertion passes, yet the test fails: the night-rate stub is dead code, and leaving it would mislead the next reader into thinking night rates matter here. Delete it (or use `lenient()` for the rare stub that is legitimately optional).

## 5.4 When mocking hurts

Mocks verify **interactions**. Overused, they pin a test to the current implementation, so harmless refactoring breaks tests while real bugs slip through.

```java junit An over-specified mock test breaks on a harmless refactoring
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

interface ReadingStore {
    Optional<Double> latest(String meterId);
    List<Double> lastN(String meterId, int n);
}

// refactored: one bulk call instead of two
class UsageReport {
    private final ReadingStore store;
    UsageReport(ReadingStore store) { this.store = store; }
    String summary(String meterId) {
        List<Double> last = store.lastN(meterId, 3);
        double latest = last.get(last.size() - 1);
        return String.format("latest %.1f, average %.1f", latest,
                             last.stream().mapToDouble(Double::doubleValue).average()
                                     .orElse(0));
    }
}

// a fake: real behaviour, in memory
class InMemoryStore implements ReadingStore {
    private final Map<String, List<Double>> data = new HashMap<>();
    void add(String meter, double kwh) {
        data.computeIfAbsent(meter, k -> new ArrayList<>()).add(kwh);
    }
    public Optional<Double> latest(String m) {
        List<Double> l = data.getOrDefault(m, List.of());
        return l.isEmpty() ? Optional.empty() : Optional.of(l.get(l.size() - 1));
    }
    public List<Double> lastN(String m, int n) {
        List<Double> l = data.getOrDefault(m, List.of());
        return l.subList(Math.max(0, l.size() - n), l.size());
    }
}

@ExtendWith(MockitoExtension.class)
class UsageReportTest {
    @Mock ReadingStore store;

    @Test
    void mockTestWrittenForTheOldImplementation() {        // expected latest() then lastN()
        when(store.latest("MTR-1")).thenReturn(Optional.of(12.0));
        when(store.lastN("MTR-1", 3)).thenReturn(List.of(9.0, 9.0, 12.0));
        assertEquals("latest 12.0, average 10.0", new UsageReport(store).summary("MTR-1"));
        verify(store).latest("MTR-1");                       // pins the old call sequence
    }

    @Test
    void fakeBasedTestChecksBehaviourOnly() {
        InMemoryStore fake = new InMemoryStore();
        for (double kwh : new double[]{5, 9, 9, 12}) fake.add("MTR-1", kwh);
        assertEquals("latest 12.0, average 10.0", new UsageReport(fake).summary("MTR-1"));
    }
}
```

The report's output is unchanged by the refactoring, but the mock-based test fails: its `verify` demands a call to `latest()` that no longer happens (and if that line were removed, strict stubs would then flag its unused `latest()` stub). The fake-based test checks only behaviour and keeps passing.

| Guideline | Why |
|---|---|
| Mock at architectural boundaries (payment gateway, message bus, external APIs) | These are the interactions that **are** the behaviour |
| Prefer fakes or real objects for simple collaborators and repositories | Tests survive refactoring |
| Verify outcomes (return values, state) before interactions | Interaction checks couple tests to implementation |
| Do not mock types you do not own (library classes, `List`, `HttpClient`) | Wrap them in your own interface and mock or fake that |
| Do not mock value objects | Construct real ones |
| One or two `verify` calls per test, on meaningful interactions | More usually means the test is describing the code, not the behaviour |

## 5.5 Practical lessons

- Pick the simplest double that works: stub for answers, fake for behaviour, mock for important interactions.
- Use `MockitoExtension` for strict stubs; unused stubs are bugs in the test.
- Inject a fixed `Clock` (and other sources of variation) so results are deterministic.
- Mock boundaries, not everything; over-specified interaction tests break on harmless refactoring.
