# How to use this guide
%What a low-level design round looks like, how it is graded, and how this book is organised

A **low-level design (LLD)** round, also called machine coding or object-oriented design, asks you to design and often code a small system in 45–90 minutes: a parking lot, an elevator controller, a rate limiter, a cache. Product companies use it to test whether you can turn vague requirements into clean, extensible classes. Service companies ask the same questions in a lighter form ("explain SOLID", "write a thread-safe singleton").

This guide teaches the building blocks (OOP, UML, SOLID, the Gang of Four patterns, concurrency) and then applies them to twelve classic case studies. **Every program is a complete, single-file Java program** that you can run with `java Main.java` (Java 21 or later), and every output shown was produced by running it.

## How an LLD interview runs

| Step | Time | What you do | What the interviewer looks for |
|---|---|---|---|
| 1. Clarify | 5 min | Ask about scope, users, scale, edge cases; write down 4–6 core requirements | You do not jump into code; you narrow an open problem |
| 2. Identify entities | 5 min | Nouns become candidate classes, verbs become methods | A sensible domain model |
| 3. Relationships | 5–10 min | Draw a class diagram: inheritance, composition, multiplicities | Correct use of has-a versus is-a |
| 4. Patterns and interfaces | 5 min | Pick patterns where change is likely (Strategy for pricing, State for lifecycles) | Design for extension, not for show |
| 5. Code | 20–40 min | Implement the core flow with clean classes and a small driver | Readable, compiling, correct code |
| 6. Extend and discuss | 5–10 min | Handle follow-ups: concurrency, new features, testing | The design absorbs change without rewrites |

## The evaluation rubric

| Dimension | Strong signal | Weak signal |
|---|---|---|
| Requirements | Lists functional requirements, states assumptions | Starts coding the first idea |
| Modelling | Small, cohesive classes with clear responsibilities | One god class with everything |
| Extensibility | New vehicle type or pricing rule = one new class | Every change edits a big `switch` |
| Correctness | Edge cases handled (lot full, invalid ticket) | Happy path only |
| Concurrency | Identifies shared state and protects it | Ignores two users booking the same seat |
| Code quality | Meaningful names, encapsulation, immutability where possible | Public fields, magic numbers |
| Communication | Explains trade-offs while working | Silent coding |

> TIP: Say your assumptions out loud and write them at the top of your code as a comment. "One entry gate, three vehicle sizes, hourly pricing" turns an open question into a problem you can finish.

## How to study this book

1. Chapters 1–2 (OOP, UML, SOLID) are the vocabulary. Read them once carefully.
2. Chapters 3–5 cover the patterns. For each, learn **the problem it solves** first, then the structure.
3. Chapter 6 adds concurrency, which turns many designs from "works" into "works under load".
4. Chapters 7–8 are the case studies. Attempt each yourself for 30–45 minutes **before** reading the solution, then compare.
5. Chapter 9 is the checklist for the day of the interview.
6. Solve the **Low-Level Design Practice Book** alongside.

> NOTE: The programs use nested `static` classes or several top-level classes in one file so that each example runs on its own. In a real project each class would live in its own file inside packages.

# Chapter 1: OOP and UML Refresher
%The four pillars as they matter in design interviews, and how to draw classes and interactions

## 1.1 The four pillars, applied

| Pillar | Idea | Design consequence |
|---|---|---|
| Encapsulation | Hide state; expose behaviour that keeps the state valid | Fields `private`; no setter that can break an invariant |
| Abstraction | Expose *what* an object does, not *how* | Code against interfaces (`PaymentMethod`), not classes (`RazorpayClient`) |
| Inheritance | A subtype is a specialised form of its supertype | Use only for true is-a relationships that keep the parent's contract |
| Polymorphism | One call, many behaviours chosen at run time | Replace `if/switch` on type with overridden methods |

The program below shows all four. `Account` protects its invariant (the balance never goes negative) by offering `withdraw` instead of `setBalance`. `Shape` is an abstraction, and the loop calls `area()` without knowing the concrete type. The last part shows the classic inheritance mistake, `java.util.Stack extends Vector`, by building a `BadStack` that inherits methods it should not expose, and a `GoodStack` that uses composition.

```java run The four pillars in one program
import java.util.*;

public class Main {
    static class Account {                      // encapsulation: invariant balance >= 0
        private final String id;
        private long balance;
        Account(String id, long opening) { this.id = id; this.balance = opening; }
        void deposit(long amt) {
            if (amt <= 0) throw new IllegalArgumentException("amount must be positive");
            balance += amt;
        }
        boolean withdraw(long amt) {
            if (amt <= 0 || amt > balance) return false;
            balance -= amt;
            return true;
        }
        long balance() { return balance; }
    }

    interface Shape { double area(); String name(); }          // abstraction
    record Circle(double r) implements Shape {
        public double area() { return Math.PI * r * r; }
        public String name() { return "circle"; }
    }
    record Rect(double w, double h) implements Shape {
        public double area() { return w * h; }
        public String name() { return "rectangle"; }
    }

    static class BadStack<T> extends ArrayList<T> {            // inheritance misuse
        void push(T x) { add(x); }
        T pop() { return remove(size() - 1); }
    }
    static class GoodStack<T> {                                 // composition
        private final ArrayList<T> items = new ArrayList<>();
        void push(T x) { items.add(x); }
        T pop() { return items.remove(items.size() - 1); }
        int size() { return items.size(); }
    }

    public static void main(String[] args) {
        Account a = new Account("A1", 500);
        System.out.println("withdraw 800 allowed? " + a.withdraw(800) + ", balance "
                + a.balance());
        System.out.println("withdraw 300 allowed? " + a.withdraw(300) + ", balance "
                + a.balance());

        List<Shape> shapes = List.of(new Circle(1), new Rect(2, 3));
        for (Shape s : shapes)                                  // polymorphism
            System.out.printf("%-9s area %.2f%n", s.name(), s.area());

        BadStack<String> bad = new BadStack<>();
        bad.push("a"); bad.push("b"); bad.push("c");
        bad.add(0, "intruder");                                 // breaks stack discipline
        System.out.println("BadStack lets callers insert at the bottom: " + bad);
        GoodStack<String> good = new GoodStack<>();
        good.push("a"); good.push("b");
        System.out.println("GoodStack exposes only push/pop, size " + good.size()
                + ", pop -> " + good.pop());
    }
}
```

`BadStack` inherits more than 40 public methods from `ArrayList`, including `add(0, x)`, so any caller can violate last-in-first-out. Inheritance couples you to the parent's entire interface; composition exposes only what you choose.

### Overloading versus overriding

| | Overloading | Overriding |
|---|---|---|
| Where | Same class (or subclass) | Subclass redefines a parent method |
| Signature | Different parameter lists | Same signature (covariant return allowed) |
| Chosen | At compile time, from the **static** types of the arguments | At run time, from the **dynamic** type of the object |
| Purpose | Convenience (`print(int)`, `print(String)`) | Polymorphic behaviour |

```java run Static versus dynamic dispatch
public class Main {
    static class Animal { String sound() { return "..."; } }
    static class Dog extends Animal { @Override String sound() { return "woof"; } }

    static String describe(Animal a) { return "an animal that says " + a.sound(); }
    static String describe(Dog d) { return "a dog that says " + d.sound(); }

    public static void main(String[] args) {
        Animal pet = new Dog();                     // static type Animal, dynamic type Dog
        System.out.println(describe(pet));          // overload picked at compile time
        System.out.println(describe(new Dog()));
    }
}
```

The overload `describe(Animal)` is chosen because `pet` is declared as `Animal`, but inside it `a.sound()` still dispatches to `Dog`. This exact combination is a favourite trick question.

## 1.2 Class diagrams

UML class diagrams are the lingua franca of LLD interviews. A box has three compartments: name, attributes, operations. Visibility is `+` public, `-` private, `#` protected, `~` package.

```text
+----------------------------+          +-----------------------+
|        ParkingLot          |          |    <<interface>>      |
+----------------------------+          |    PricingStrategy    |
| - floors: List<Floor>      |          +-----------------------+
| - pricing: PricingStrategy |--------->| + fee(ticket): Money  |
+----------------------------+          +-----------^-----------+
| + park(v: Vehicle): Ticket |                      :  (realisation, dashed)
| + exit(t: Ticket): Money   |          +-----------+-----------+
+-------------+--------------+          |   HourlyPricing       |
              <>  1..*  (composition)   +-----------------------+
+-------------v--------------+
|          Floor             |
+----------------------------+
```

| Relationship | Meaning | UML | Java | Lifetime |
|---|---|---|---|---|
| Dependency | Uses temporarily (parameter, local) | Dashed arrow | Method parameter | None |
| Association | Knows about, long-term | Solid line | Field reference | Independent |
| Aggregation | Has-a, parts can exist alone | Hollow diamond | Field holding objects created elsewhere | Parts outlive the whole |
| Composition | Owns, parts die with the whole | Filled diamond | Field holding objects it creates | Parts share the whole's lifetime |
| Generalisation | Is-a (inheritance) | Hollow triangle, solid line | `extends` | — |
| Realisation | Implements an interface | Hollow triangle, dashed line | `implements` | — |

Multiplicities go on the ends of a line: `1`, `0..1`, `*` (many), `1..*` (at least one).

> TRAP: Aggregation versus composition is about **lifetime**, not about importance. A `Team` aggregates `Player`s (players exist before and after the team); a `House` is composed of `Room`s (destroy the house, the rooms go too).

## 1.3 Sequence diagrams

A sequence diagram shows how objects collaborate over time for one use case. Lifelines run downwards; arrows are calls, dashed arrows are returns.

```text
 Customer        Checkout          Inventory         Payment
    |  placeOrder()  |                  |                |
    |--------------->|  reserve(items)  |                |
    |                |----------------->|                |
    |                |<- - - - ok - - - |                |
    |                |  charge(amount)                   |
    |                |---------------------------------->|
    |                |<- - - - - - - paymentId - - - - - |
    |                |  commit(items)   |                |
    |                |----------------->|                |
    |<- - orderId - -|                  |                |
```

In an interview, draw one sequence diagram for the main flow (for example "park a car") and talk through failure paths ("payment declined: release the reservation").

## 1.4 Practical lessons

- Fields private, behaviour public; never expose a setter that can break an invariant.
- Prefer interfaces for anything likely to change (payment, pricing, notification channel).
- Inherit only for true is-a relationships that honour the parent's contract; otherwise compose.
- Overloads are chosen at compile time, overrides at run time.
- Know the six UML relationships, and the lifetime test for aggregation versus composition.

# Chapter 2: SOLID and Design Principles
%Five principles, each shown with a violation and a refactor, plus the rules of thumb interviewers expect

SOLID is five principles for classes that are easy to change. Interviewers rarely ask you to recite them; they watch whether your design follows them, and they ask "what would you change to add X?". Each section below shows a violation and a refactor in one runnable program.

| Principle | One-line rule | Smell that signals a violation |
|---|---|---|
| **S**ingle responsibility | A class should have one reason to change | Class name contains "And", or has methods for unrelated concerns |
| **O**pen/closed | Open for extension, closed for modification | Adding a feature means editing a `switch` in existing code |
| **L**iskov substitution | Subtypes must be usable wherever the parent is expected | Subclass throws `UnsupportedOperationException` or weakens guarantees |
| **I**nterface segregation | Clients should not depend on methods they do not use | Empty or throwing implementations of interface methods |
| **D**ependency inversion | Depend on abstractions, not concretions | `new ConcreteService()` inside business logic; hard to test |

## 2.1 Single responsibility

`Invoice` below calculates totals, formats a printout and "saves" to a database. Those are three reasons to change: tax rules, report layout and storage technology. The refactor gives each concern its own class.

```java run SRP: one class per reason to change
import java.util.*;

public class Main {
    record Item(String name, int qty, double price) {}

    static class GodInvoice {                     // violation: three responsibilities
        final List<Item> items = new ArrayList<>();
        double total() { return items.stream().mapToDouble(i -> i.qty() * i.price())
                .sum() * 1.18; }
        String print() { return "INVOICE total=" + String.format("%.2f", total()); }
        String saveToDb() { return "INSERT INTO invoice VALUES (" + total() + ")"; }
    }

    static class Invoice {                        // only data + domain calculation
        final List<Item> items;
        Invoice(List<Item> items) { this.items = List.copyOf(items); }
        double subtotal() { return items.stream().mapToDouble(i -> i.qty() * i.price())
                .sum(); }
    }
    static class TaxCalculator {                  // changes when tax rules change
        private final double rate;
        TaxCalculator(double rate) { this.rate = rate; }
        double total(Invoice inv) { return inv.subtotal() * (1 + rate); }
    }
    static class InvoicePrinter {                 // changes when the layout changes
        String print(Invoice inv, double total) {
            StringBuilder sb = new StringBuilder();
            for (Item i : inv.items) sb.append(String.format("%-8s x%d%n", i.name(),
                    i.qty()));
            return sb.append(String.format("TOTAL %.2f", total)).toString();
        }
    }
    interface InvoiceRepository { void save(Invoice inv); }       // changes with storage
    static class InMemoryRepo implements InvoiceRepository {
        final List<Invoice> saved = new ArrayList<>();
        public void save(Invoice inv) { saved.add(inv); }
    }

    public static void main(String[] args) {
        List<Item> items = List.of(new Item("pen", 3, 10), new Item("book", 1, 250));
        GodInvoice g = new GodInvoice(); g.items.addAll(items);
        System.out.println("god class : " + g.print());

        Invoice inv = new Invoice(items);
        double total = new TaxCalculator(0.18).total(inv);
        System.out.println(new InvoicePrinter().print(inv, total));
        InMemoryRepo repo = new InMemoryRepo(); repo.save(inv);
        System.out.println("saved invoices: " + repo.saved.size());
    }
}
```

Changing GST from 18% to 12% now touches only `TaxCalculator`, and a unit test can check the tax without a printer or a database.

## 2.2 Open/closed

The violation computes discounts with a `switch` on customer type: every new type edits the method, risking the existing cases. The refactor makes each discount a strategy, so a new rule is a new class.

```java run OCP: extend with new classes, do not edit old ones
import java.util.*;

public class Main {
    static double discountSwitch(String type, double amount) {     // violation
        switch (type) {
            case "REGULAR": return 0;
            case "PREMIUM": return amount * 0.10;
            case "EMPLOYEE": return amount * 0.30;
            default: throw new IllegalArgumentException(type);
        }
    }

    interface DiscountRule { double discount(double amount); }
    static class NoDiscount implements DiscountRule { public double discount(double a) {
            return 0; } }
    static class Percent implements DiscountRule {
        private final double pct;
        Percent(double pct) { this.pct = pct; }
        public double discount(double a) { return a * pct; }
    }
    static class FestiveFlat implements DiscountRule {   // added later: no edits elsewhere
        public double discount(double a) { return a >= 1000 ? 150 : 0; }
    }

    public static void main(String[] args) {
        System.out.println("switch, PREMIUM on 2000: " + discountSwitch("PREMIUM", 2000));
        Map<String, DiscountRule> rules = new LinkedHashMap<>();
        rules.put("REGULAR", new NoDiscount());
        rules.put("PREMIUM", new Percent(0.10));
        rules.put("EMPLOYEE", new Percent(0.30));
        rules.put("FESTIVE", new FestiveFlat());
        for (var e : rules.entrySet())
            System.out.printf("%-8s on 2000 -> discount %.1f%n", e.getKey(), e.getValue()
                    .discount(2000));
    }
}
```

> NOTE: OCP does not forbid ever editing code. It says the *likely* changes (new customer types, new vehicle types) should be additions. Spend extension points where change is expected, not everywhere.

## 2.3 Liskov substitution

The textbook violation: a `Square` that extends `Rectangle`. Mathematically a square is a rectangle, but a mutable `Square` cannot keep the rectangle's contract "setting the width does not change the height". Code written for rectangles breaks when handed a square.

```java run LSP: a subtype that breaks its parent's contract
public class Main {
    static class Rectangle {
        protected int w, h;
        void setWidth(int w) { this.w = w; }
        void setHeight(int h) { this.h = h; }
        int area() { return w * h; }
    }
    static class Square extends Rectangle {                // violation
        @Override void setWidth(int s) { w = s; h = s; }
        @Override void setHeight(int s) { w = s; h = s; }
    }

    static String resizeTo4x5(Rectangle r) {               // written for Rectangle
        r.setWidth(4); r.setHeight(5);
        return r.getClass().getSimpleName() + " area " + r.area()
                + (r.area() == 20 ? " (as expected)" : " (expected 20: contract broken)");
    }

    sealed interface Shape permits Rect, Sq {}             // refactor: no false is-a
    record Rect(int w, int h) implements Shape {}
    record Sq(int side) implements Shape {}
    static int area(Shape s) {
        return switch (s) {
            case Rect r -> r.w() * r.h();
            case Sq q -> q.side() * q.side();
        };
    }

    public static void main(String[] args) {
        System.out.println(resizeTo4x5(new Rectangle()));
        System.out.println(resizeTo4x5(new Square()));
        System.out.println("immutable shapes: " + area(new Rect(4, 5)) + ", " + area(
                new Sq(4)));
    }
}
```

The refactor removes the false is-a relationship and makes shapes immutable records. Other LSP violations seen in interviews: a `ReadOnlyList` that throws on `add`, a `Penguin extends Bird` whose `fly()` throws, a subclass that demands a stronger precondition (rejecting inputs the parent accepted) or provides a weaker postcondition.

## 2.4 Interface segregation

A fat `Worker` interface with `work()` and `eat()` forces `Robot` to implement `eat()` with an exception. Splitting the interface lets each class implement only what it supports.

```java run ISP: small, role-based interfaces
import java.util.*;

public class Main {
    interface FatWorker { String work(); String eat(); }          // violation
    static class FatRobot implements FatWorker {
        public String work() { return "robot welds"; }
        public String eat() {
                throw new UnsupportedOperationException("robots do not eat"); }
    }

    interface Workable { String work(); }
    interface Feedable { String eat(); }
    static class Human implements Workable, Feedable {
        public String work() { return "human codes"; }
        public String eat() { return "human has lunch"; }
    }
    static class Robot implements Workable { public String work() { return "robot welds";
            } }

    public static void main(String[] args) {
        try {
            new FatRobot().eat();
        } catch (UnsupportedOperationException e) {
            System.out.println("fat interface: " + e.getMessage());
        }
        List<Workable> shift = List.of(new Human(), new Robot());
        shift.forEach(w -> System.out.println(w.work()));
        List<Feedable> canteen = List.of(new Human());
        canteen.forEach(f -> System.out.println(f.eat()));
    }
}
```

## 2.5 Dependency inversion

High-level policy (`OrderService`) should not depend on low-level details (`SmtpEmailSender`). Both should depend on an abstraction (`Notifier`) that the high-level module owns. The concrete class is passed in (**dependency injection**), which also makes testing trivial: inject a fake.

```java run DIP: depend on an abstraction, inject the detail
import java.util.*;

public class Main {
    static class SmtpEmailSender { String send(String to, String msg) { return "SMTP to "
            + to; } }
    static class TightOrderService {   // violation: news its dependency
        private final SmtpEmailSender email = new SmtpEmailSender();
        String place(String user) { return email.send(user, "order placed"); }
    }

    interface Notifier { String notify(String user, String msg); }
    static class EmailNotifier implements Notifier {
        public String notify(String u, String m) { return "email to " + u + ": " + m; }
    }
    static class SmsNotifier implements Notifier {
        public String notify(String u, String m) { return "sms to " + u + ": " + m; }
    }
    static class FakeNotifier implements Notifier {          // for tests
        final List<String> sent = new ArrayList<>();
        public String notify(String u, String m) { sent.add(u); return "recorded"; }
    }
    static class OrderService {
        private final Notifier notifier;
        // constructor injection
        OrderService(Notifier notifier) { this.notifier = notifier; }
        String place(String user) { return notifier.notify(user, "order placed"); }
    }

    public static void main(String[] args) {
        System.out.println(new TightOrderService().place("asha"));
        System.out.println(new OrderService(new EmailNotifier()).place("asha"));
        System.out.println(new OrderService(new SmsNotifier()).place("ravi"));
        FakeNotifier fake = new FakeNotifier();
        new OrderService(fake).place("neha");
        System.out.println("test double recorded: " + fake.sent);
    }
}
```

Spring's whole programming model (the Backend guide) is built on this principle: classes declare the interfaces they need, and the container injects implementations.

## 2.6 More principles interviewers mention

| Principle | Meaning | Example |
|---|---|---|
| DRY (don't repeat yourself) | Every piece of knowledge has one authoritative place | One `TaxCalculator`, not tax code copied into three services |
| KISS (keep it simple) | Prefer the simplest design that meets the requirements | A `Map` instead of a custom tree when no ordering is needed |
| YAGNI (you aren't gonna need it) | Do not build for imagined future requirements | No plugin system for a feature with one implementation |
| Law of Demeter | Talk only to your immediate collaborators: "one dot" | `order.shippingCity()` instead of `order.getCustomer().getAddress().getCity()` |
| Composition over inheritance | Reuse behaviour by containing objects, not by extending classes | `GoodStack` in Chapter 1; strategies in Chapter 5 |
| Tell, don't ask | Ask an object to do the work, rather than pulling its data out and deciding for it | `account.withdraw(x)` instead of `if (account.getBalance() >= x) account.setBalance(...)` |
| High cohesion, low coupling | Each class does one focused job and knows little about others | Small classes behind interfaces |

```java run Law of Demeter and tell-don't-ask
public class Main {
    record Address(String city) {}
    record Customer(String name, Address address) {}
    static class Order {
        private final Customer customer;
        Order(Customer c) { this.customer = c; }
        Customer getCustomer() { return customer; }                 // exposes the chain
        String shippingCity() { return customer.address().city(); } // Demeter-friendly
        boolean shipsTo(String city) { return shippingCity().equalsIgnoreCase(city); }
    }

    public static void main(String[] args) {
        Order o = new Order(new Customer("Asha", new Address("Kolkata")));
        String asked = o.getCustomer().address().city();   // caller knows 3 classes
        System.out.println("train wreck : " + asked);
        System.out.println("one dot     : " + o.shippingCity());
        System.out.println("tell        : ships to Kolkata? " + o.shipsTo("kolkata"));
    }
}
```

## 2.7 Practical lessons

- Use SOLID as questions: "How many reasons does this class have to change? What do I edit to add a new type?"
- Most OCP and SRP fixes are the same move: extract an interface, give each variant its own class.
- If a subclass needs to throw `UnsupportedOperationException`, the hierarchy (LSP) or the interface (ISP) is wrong.
- Inject dependencies through constructors; it makes classes testable and swaps trivial.
- Apply principles where change is likely; over-engineering (YAGNI) also loses points.
