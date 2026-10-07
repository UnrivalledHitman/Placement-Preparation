# Solutions

## Part 1 solutions

### L1.1 Name the relationship

(a) **Composition**: rooms do not exist without their house. (b) **Aggregation**: players exist before and after a team. (c) **Dependency**: the gateway is only a parameter. (d) **Association** (many-to-many); if enrolment has its own data, such as a grade, it becomes a class of its own (`Enrolment`). (e) **Realisation**: `ArrayList implements List`. (f) **Generalisation**: `SavingsAccount extends Account`.

### L1.2 Predict the output

```java run Fields and static methods are not polymorphic
public class Main {
    static class Parent {
        String name = "parent";
        static String id() { return "P"; }
        String who() { return "Parent"; }
    }
    static class Child extends Parent {
        String name = "child";                       // hides the field
        static String id() { return "C"; }           // hides the static method
        @Override String who() { return "Child"; }   // overrides the instance method
    }
    public static void main(String[] args) {
        Parent p = new Child();
        System.out.println(p.name + " " + p.id() + " " + p.who());
    }
}
```

Only instance methods are dispatched dynamically. Fields and static methods are resolved from the **declared** type (`Parent`), so the output mixes `parent`, `P` and `Child`. Calling a static method through an instance compiles but is misleading; write `Parent.id()`.

### L1.3 Plug the encapsulation leaks

```java run Two attacks on a leaky class, and the fix
import java.util.*;

public class Main {
    static class LeakySensorLog {
        public List<Double> readings;                    // leak 1: public mutable field
        LeakySensorLog(List<Double> r) { readings = r; }  // leak 2: keeps the caller's list
    }
    static final class SensorLog {
        private final List<Double> readings;
        SensorLog(List<Double> r) {
            for (double x : r) if (x < -50
                    || x > 150) throw new IllegalArgumentException("bad reading " + x);
            readings = List.copyOf(r);                   // defensive, unmodifiable copy
        }
        List<Double> readings() { return readings; }     // safe: already unmodifiable
        double average() { return readings.stream().mapToDouble(Double::doubleValue)
                .average().orElse(0); }
    }

    public static void main(String[] args) {
        List<Double> input = new ArrayList<>(List.of(21.5, 22.0, 22.5));
        LeakySensorLog leaky = new LeakySensorLog(input);
        leaky.readings.add(999.0);                       // attack 1
        input.set(0, -273.0);   // attack 2, through the caller's list
        System.out.println("leaky log now holds " + leaky.readings);

        List<Double> input2 = new ArrayList<>(List.of(21.5, 22.0, 22.5));
        SensorLog safe = new SensorLog(input2);
        input2.set(0, -273.0);
        try {
            safe.readings().add(999.0);
        } catch (UnsupportedOperationException e) {
            System.out.println("safe log rejects add through the getter");
        }
        System.out.println("safe log still holds " + safe.readings() + ", average "
                + safe.average());
    }
}
```

The fix combines a `private final` field, a defensive copy in the constructor (so later changes to the caller's list do not leak in), and an unmodifiable view on the way out. Validation in the constructor means an invalid `SensorLog` can never exist.

### L1.4 An online quiz

```text
Quiz 1 <>---- 1..* Question 1 <>---- 2..5 Option(text, correct)
  ^ 1                 ^ 1
  |                   |
  * Attempt --------- * Answer(question, chosen option)   [Attempt <>-- Answer: composition]
    | *
    1 User
```

Quiz–Question and Question–Option are **compositions** (options make no sense without their question). Attempt–Answer is a composition too. User–Attempt and Attempt–Quiz are associations: deleting an attempt does not delete the user or the quiz.

```java run The quiz core with scoring
import java.util.*;

public class Main {
    record Option(String text, boolean correct) {}
    record Question(String text, List<Option> options) {
        Question {
            if (options.size() < 2
                    || options.size() > 5) throw new IllegalArgumentException("2-5 options");
            if (options.stream().filter(Option::correct).count() != 1)
                throw new IllegalArgumentException("exactly one correct option");
            options = List.copyOf(options);
        }
    }
    record Quiz(String title, List<Question> questions) {}
    record User(String name) {}

    static class Attempt {
        private final User user; private final Quiz quiz;
        private final Map<Question, Option> answers = new LinkedHashMap<>();
        Attempt(User u, Quiz q) { user = u; quiz = q; }
        void answer(int qIndex, int optionIndex) {
            Question q = quiz.questions().get(qIndex);
            answers.put(q, q.options().get(optionIndex));
        }
        int score() { return (int) answers.values().stream().filter(Option::correct)
                .count(); }
        String summary() { return user.name() + " scored " + score() + "/"
                + quiz.questions().size(); }
    }

    public static void main(String[] args) {
        Quiz q = new Quiz("Java basics", List.of(
                new Question("Size of int?", List.of(new Option("16 bits", false),
                        new Option("32 bits", true))),
                new Question("Immutable class?", List.of(new Option("String", true),
                        new Option("StringBuilder", false),
                        new Option("ArrayList", false)))));
        Attempt a = new Attempt(new User("asha"), q);
        a.answer(0, 1); a.answer(1, 1);
        System.out.println(a.summary());
        try {
            new Question("Bad", List.of(new Option("a", true), new Option("b", true)));
        } catch (IllegalArgumentException e) {
            System.out.println("rejected question: " + e.getMessage());
        }
    }
}
```

## Part 2 solutions

### L2.1 Which principle is broken?

(a) **SRP**: formatting, transport and auditing are separate reasons to change. (b) **OCP**: new regions should be new classes. (c) **LSP**: an `Ostrich` cannot stand in for a `Bird` that flies; split `Bird` from a `Flyer` capability. (d) **ISP**: split `Printer`, `Scanner` and `Fax` interfaces. (e) **DIP**: depend on an `OrderRepository` interface and inject it.

### L2.2 Open the report generator

```java run Formats as strategies in a registry
import java.util.*;

public class Main {
    record Row(String name, int score) {}
    interface ReportFormat { String render(List<Row> rows); }

    static class Csv implements ReportFormat {
        public String render(List<Row> rows) {
            StringBuilder sb = new StringBuilder("name,score");
            rows.forEach(r -> sb.append("\n").append(r.name()).append(",")
                    .append(r.score()));
            return sb.toString();
        }
    }
    static class Markdown implements ReportFormat {
        public String render(List<Row> rows) {
            StringBuilder sb = new StringBuilder("| name | score |\n|---|---|");
            rows.forEach(r -> sb.append("\n| ").append(r.name()).append(" | ")
                    .append(r.score()).append(" |"));
            return sb.toString();
        }
    }
    static class Json implements ReportFormat {   // added later, nothing else edited
        public String render(List<Row> rows) {
            StringJoiner j = new StringJoiner(",", "[", "]");
            rows.forEach(r -> j.add("{\"name\":\"" + r.name() + "\",\"score\":" + r.score()
                    + "}"));
            return j.toString();
        }
    }
    static class ReportGenerator {
        private final Map<String, ReportFormat> formats = new HashMap<>();
        ReportGenerator register(String name, ReportFormat f) { formats.put(name,
                f); return this; }
        String generate(List<Row> rows, String format) {
            ReportFormat f = formats.get(format);
            if (f == null) throw new IllegalArgumentException("unsupported format "
                    + format);
            return f.render(rows);
        }
    }

    public static void main(String[] args) {
        List<Row> rows = List.of(new Row("asha", 91), new Row("ravi", 78));
        ReportGenerator g = new ReportGenerator().register("CSV", new Csv())
                .register("MARKDOWN", new Markdown())
                .register("JSON", new Json());
        for (String f : List.of("CSV", "MARKDOWN", "JSON")) System.out.println(f + ":\n"
                + g.generate(rows, f));
    }
}
```

### L2.3 Fix a Liskov violation

```java run Capabilities as separate interfaces
public class Main {
    interface Readable { String read(); }
    interface Writable extends Readable { void write(String s); }

    static class EditableDoc implements Writable {
        private final StringBuilder text = new StringBuilder();
        public String read() { return text.toString(); }
        public void write(String s) { text.append(s); }
    }
    record ArchivedDoc(String text) implements Readable {
        public String read() { return text; }
    }

    // needs writing
    static void appendFooter(Writable d) { d.write("\n-- generated by DocBot"); }
    // any document
    static int wordCount(Readable d) { return d.read().split("\\s+").length; }

    public static void main(String[] args) {
        EditableDoc draft = new EditableDoc();
        draft.write("Quarterly energy report");
        appendFooter(draft);
        ArchivedDoc archived = new ArchivedDoc("Signed contract text");
        // appendFooter(archived);   // does not compile: ArchivedDoc is not Writable
        System.out.println(draft.read().replace("\n", " / ") + " | words: "
                + wordCount(draft));
        System.out.println("archived words: " + wordCount(archived));
    }
}
```

The broken design promised "every document is writable" and then broke the promise at run time. With separate capabilities, a read-only document simply does not offer `write`, and the commented-out call is a **compile-time** error.

### L2.4 Inject the dependency and test it

```java run A fake provider makes the service testable
import java.util.*;

public class Main {
    interface WeatherProvider { double temperature(String city); }
    interface AlertSink { void alert(String msg); }

    static class WeatherAlertService {
        private final WeatherProvider weather;
        private final AlertSink sink;
        private final double threshold;
        WeatherAlertService(WeatherProvider w, AlertSink s, double threshold) {
            weather = w; sink = s; this.threshold = threshold;
        }
        boolean check(String city) {
            double t = weather.temperature(city);
            if (t > threshold) { sink.alert("heatwave in " + city + ": " + t
                    + " C"); return true; }
            return false;
        }
    }

    public static void main(String[] args) {
        Map<String, Double> fakeTemps = new HashMap<>(Map.of("Kolkata", 41.0, "Shillong",
                39.0));
        List<String> sent = new ArrayList<>();
        WeatherAlertService svc = new WeatherAlertService(fakeTemps::get, sent::add, 40.0);
        boolean t1 = svc.check("Kolkata"), t2 = svc.check("Shillong");
        System.out.println("41 C fires alert : " + (t1 ? "PASS" : "FAIL"));
        System.out.println("39 C stays quiet : " + (!t2 ? "PASS" : "FAIL"));
        System.out.println("alerts recorded  : " + sent);
    }
}
```

Both dependencies are interfaces with a single method, so a lambda or method reference is a complete fake. In production, an `HttpWeatherProvider` and an `SmsAlertSink` are injected instead; the service code does not change.

### L2.5 Obey the Law of Demeter

`Checkout` reaches through `Order` and `Customer` into the `Wallet`, so it depends on four classes and on how a customer stores money. Any change to the wallet ripples into checkout. Tell, don't ask: let each object do its own part.

```java run Pushing behaviour to the objects that own the data
public class Main {
    static class Wallet {
        private long balance;
        Wallet(long b) { balance = b; }
        boolean tryDeduct(long amt) {
                if (amt > balance) return false; balance -= amt; return true; }
        long balance() { return balance; }
    }
    static class Customer {
        private final Wallet wallet;
        Customer(Wallet w) { wallet = w; }
        // customer decides how it pays
        boolean pay(long amt) { return wallet.tryDeduct(amt); }
    }
    record Order(Customer customer, long total) {
        boolean settle() { return customer.pay(total); }
    }
    static class Checkout {
        // one dot
        String pay(Order o) { return o.settle() ? "paid" : "insufficient funds"; }
    }

    public static void main(String[] args) {
        Wallet w = new Wallet(1000);
        Customer c = new Customer(w);
        Checkout checkout = new Checkout();
        System.out.println(checkout.pay(new Order(c, 600)) + ", " + checkout.pay(
                new Order(c, 600))
                + ", balance left " + w.balance());
    }
}
```

The check and the deduction now happen together inside `Wallet.tryDeduct`, which also removes a check-then-act race if the wallet is later made thread-safe.

### L2.6 Break up a god class

```java run Registration split into focused collaborators
import java.util.*;

public class Main {
    record User(String email, String passwordHash) {}
    interface UserRepository {
        void save(User u);
        boolean exists(String email);
        List<User> all();
    }
    interface PasswordHasher { String hash(String raw); }
    interface Mailer { void send(String to, String body); }

    static class InMemoryUsers implements UserRepository {
        private final Map<String, User> users = new LinkedHashMap<>();
        public void save(User u) { users.put(u.email(), u); }
        public boolean exists(String e) { return users.containsKey(e); }
        public List<User> all() { return List.copyOf(users.values()); }
    }
    static class ToyHasher implements PasswordHasher {   // stand-in for bcrypt/argon2
        public String hash(String raw) { return "h" + Integer.toHexString(("salt" + raw)
                .hashCode()); }
    }
    static class EmailValidator {
        boolean valid(String e) { return e.matches("[\\w.+-]+@[\\w-]+\\.[\\w.]+"); }
    }
    static class RegistrationService {
        private final UserRepository repo; private final PasswordHasher hasher;
        private final EmailValidator validator; private final Mailer mailer;
        RegistrationService(UserRepository r, PasswordHasher h, EmailValidator v,
                Mailer m) {
            repo = r; hasher = h; validator = v; mailer = m;
        }
        String register(String email, String password) {
            if (!validator.valid(email)) return "invalid email: " + email;
            if (repo.exists(email)) return "already registered: " + email;
            repo.save(new User(email, hasher.hash(password)));
            mailer.send(email, "Welcome!");
            return "registered " + email;
        }
    }
    static class CsvExporter {
        String export(List<User> users) {
            StringBuilder sb = new StringBuilder("email");
            users.forEach(u -> sb.append("\n").append(u.email()));
            return sb.toString();
        }
    }

    public static void main(String[] args) {
        UserRepository repo = new InMemoryUsers();
        List<String> outbox = new ArrayList<>();
        RegistrationService reg = new RegistrationService(repo, new ToyHasher(),
                new EmailValidator(),
                (to, body) -> outbox.add(to));
        for (String[] u : new String[][] {{"asha@nit.ac.in", "pw1"}, {"bad-email", "x"},
                {"asha@nit.ac.in", "pw2"},
                {"ravi@mail.com", "pw3"}})
            System.out.println(reg.register(u[0], u[1]));
        System.out.println("welcome mails: " + outbox);
        System.out.println(new CsvExporter().export(repo.all()));
        System.out.println("passwords stored hashed: " + repo.all().stream()
                .noneMatch(u -> u.passwordHash().startsWith("pw")));
    }
}
```

## Part 3 solutions

### L3.1 A thread-safe ID generator

```java run Holder singleton with an atomic counter
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {
    static final class IdGenerator {
        private final AtomicLong next = new AtomicLong(1);
        private IdGenerator() {}
        private static class Holder { static final IdGenerator INSTANCE = new IdGenerator(); }
        static IdGenerator get() { return Holder.INSTANCE; }
        long nextId() { return next.getAndIncrement(); }
    }

    public static void main(String[] args) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(8);
        List<Future<long[]>> parts = new ArrayList<>();
        Set<IdGenerator> instances = ConcurrentHashMap.newKeySet();
        for (int t = 0; t < 8; t++)
            parts.add(pool.submit(() -> {
                long[] ids = new long[12_500];
                for (int i = 0; i < ids.length; i++) {
                        IdGenerator g = IdGenerator.get();
                        instances.add(g);
                        ids[i] = g.nextId();
                        }
                return ids;
            }));
        Set<Long> all = new HashSet<>();
        for (Future<long[]> f : parts) for (long id : f.get()) all.add(id);
        pool.shutdown();
        System.out.println("ids issued: 100000, unique: " + all.size()
                + ", generator instances: " + instances.size());
        System.out.println("range: " + Collections.min(all) + " .. "
                + Collections.max(all));
    }
}
```

The holder idiom gives lazy, lock-free creation; `AtomicLong.getAndIncrement` makes each id unique without a lock. A `synchronized nextId()` on a `long` field would also be correct, just slower under contention.

### L3.2 A validating builder

```java run An immutable pizza
import java.util.*;

public class Main {
    enum Size { S, M, L }
    static final class Pizza {
        private final Size size;
        private final String crust;
        private final List<String> toppings;
        private Pizza(Builder b) {
                size = b.size; crust = b.crust; toppings = List.copyOf(b.toppings); }
        public String toString() { return size + " " + crust + " crust " + toppings; }
        static Builder builder() { return new Builder(); }
        static final class Builder {
            private Size size;
            private String crust = "thin";
            private final List<String> toppings = new ArrayList<>();
            Builder size(Size s) { size = s; return this; }
            Builder crust(String c) { crust = c; return this; }
            Builder topping(String t) { toppings.add(t); return this; }
            Pizza build() {
                if (size == null) throw new IllegalStateException("size is required");
                if (toppings.size() > 5)
                    throw new IllegalStateException("at most 5 toppings");
                if (new HashSet<>(toppings).size() != toppings.size())
                    throw new IllegalStateException("duplicate topping");
                return new Pizza(this);
            }
        }
    }

    public static void main(String[] args) {
        System.out.println(Pizza.builder().size(Size.M).topping("paneer").topping("onion")
                .build());
        System.out.println(Pizza.builder().size(Size.L).crust("cheese burst").build());
        List<Runnable> bad = List.of(
                () -> Pizza.builder().topping("corn").build(),
                () -> Pizza.builder().size(Size.S).topping("a").topping("b").topping("c")
                        .topping("d").topping("e").topping("f").build(),
                () -> Pizza.builder().size(Size.S).topping("olive").topping("olive")
                        .build());
        for (Runnable r : bad) {
            try {
                r.run();
            } catch (IllegalStateException e) {
                System.out.println("rejected: " + e.getMessage());
            }
        }
    }
}
```

### L3.3 A shape factory from text

```java run Parsing shapes through a registry
import java.util.*;
import java.util.function.Function;

public class Main {
    interface Shape { double area(); }
    record Circle(double r) implements Shape { public double area() {
            return Math.PI * r * r; } }
    record Rect(double w, double h) implements Shape { public double area() { return w * h;
            } }
    record Square(double s) implements Shape { public double area() { return s * s; } }

    static class ShapeFactory {
        private record Maker(int args, Function<double[], Shape> make) {}
        private final Map<String, Maker> makers = new HashMap<>();
        ShapeFactory register(String name, int args, Function<double[], Shape> make) {
            makers.put(name, new Maker(args, make)); return this;
        }
        Shape parse(String line) {
            String[] p = line.trim().split("\\s+");
            Maker m = makers.get(p[0].toLowerCase());
            if (m == null) throw new IllegalArgumentException("unknown shape '" + p[0]
                    + "'");
            if (p.length - 1 != m.args()) throw new IllegalArgumentException(p[0]
                    + " needs " + m.args() + " number(s)");
            double[] a = new double[m.args()];
            for (int i = 0; i < a.length; i++) a[i] = Double.parseDouble(p[i + 1]);
            return m.make().apply(a);
        }
    }

    public static void main(String[] args) {
        ShapeFactory f = new ShapeFactory().register("circle", 1, a -> new Circle(a[0]))
                .register("rect", 2, a -> new Rect(a[0], a[1])).register("square", 1,
                        a -> new Square(a[0]));
        for (String line : List.of("circle 2", "rect 3 4", "square 5", "hexagon 2",
                "rect 3")) {
            try {
                Shape s = f.parse(line);
                System.out.printf("%-10s -> %s area %.2f%n", line, s, s.area());
            } catch (IllegalArgumentException e) {
                System.out.printf("%-10s -> error: %s%n", line, e.getMessage());
            }
        }
    }
}
```

### L3.4 Singleton versus injection

`Database.getInstance()` is a hidden dependency: a test of `OrderService` cannot replace it, so every test touches the real database (slow, shared state, order-dependent failures). Keep "one instance" as a decision made at **wiring** time, not inside the classes.

```java run One instance chosen by the wiring, fakes in tests
import java.util.*;

public class Main {
    interface Database { void save(String table,
            String row); List<String> rows(String table); }
    static class InMemoryDatabase implements Database {
        private final Map<String, List<String>> tables = new HashMap<>();
        public void save(String t, String r) { tables.computeIfAbsent(t,
                k -> new ArrayList<>()).add(r); }
        public List<String> rows(String t) { return tables.getOrDefault(t, List.of()); }
    }
    static class OrderService {
        private final Database db;
        OrderService(Database db) { this.db = db; }
        void place(String order) { db.save("orders", order); }
    }
    static class AppWiring {   // composition root: creates one of each
        // in production: a pooled real database
        final Database db = new InMemoryDatabase();
        final OrderService orders = new OrderService(db);
    }

    public static void main(String[] args) {
        Database testDb = new InMemoryDatabase();   // a test gets its own isolated database
        new OrderService(testDb).place("order-1");
        System.out.println("test sees " + testDb.rows("orders"));
        AppWiring app = new AppWiring();
        app.orders.place("order-42");
        System.out.println("app has one shared db: " + (app.db == app.db) + ", rows "
                + app.db.rows("orders"));
    }
}
```

### L3.5 A prototype registry

```java run Templates copied deeply on request
import java.util.*;

public class Main {
    static final class Document {
        String title; final List<StringBuilder> sections;
        Document(String title, List<StringBuilder> sections) {
                this.title = title; this.sections = sections; }
        Document deepCopy() {
            List<StringBuilder> copy = new ArrayList<>();
            for (StringBuilder s : sections) copy.add(new StringBuilder(s));
            return new Document(title, copy);
        }
        public String toString() { return title + " " + sections; }
    }
    static class TemplateRegistry {
        private final Map<String, Document> templates = new HashMap<>();
        void add(String name, Document d) { templates.put(name, d); }
        Document create(String name) {
            Document t = templates.get(name);
            if (t == null) throw new IllegalArgumentException("no template " + name);
            return t.deepCopy();
        }
        Document peek(String name) { return templates.get(name); }
    }

    public static void main(String[] args) {
        TemplateRegistry reg = new TemplateRegistry();
        reg.add("offer", new Document("Offer letter", new ArrayList<>(List.of(
                new StringBuilder("Dear {name},"), new StringBuilder("CTC: {ctc}")))));
        Document d = reg.create("offer");
        d.title = "Offer letter - Asha";
        d.sections.get(0).replace(5, 11, "Asha");
        d.sections.get(1).append(" (12 LPA)");
        System.out.println("created : " + d);
        System.out.println("template: " + reg.peek("offer"));
    }
}
```

The sections are `StringBuilder`s, which are mutable, so a shallow copy would share them and the template would change too. The deep copy creates a new builder per section.

## Part 4 solutions

### L4.1 Adapt a legacy gateway

```java run An adapter over an XML gateway
import java.util.regex.*;

public class Main {
    record Receipt(boolean ok, String id, String error) {}
    interface PaymentProcessor { Receipt pay(long paise, String currency); }

    static class XmlGateway {                                       // legacy, cannot change
        String process(String xml) {
            if (xml.contains("amount='0'")) return "<fail reason='zero amount'/>";
            return "<ok id='TX" + (xml.length() % 97) + "'/>";
        }
    }
    static class XmlGatewayAdapter implements PaymentProcessor {
        private static final Pattern OK = Pattern.compile("<ok id='([^']+)'/>"),
                FAIL = Pattern.compile("<fail reason='([^']+)'/>");
        private final XmlGateway gateway;
        XmlGatewayAdapter(XmlGateway g) { gateway = g; }
        public Receipt pay(long paise, String currency) {
            String reply = gateway.process("<pay amount='" + paise + "' currency='"
                    + currency + "'/>");
            Matcher m = OK.matcher(reply);
            if (m.matches()) return new Receipt(true, m.group(1), null);
            m = FAIL.matcher(reply);
            if (m.matches()) return new Receipt(false, null, m.group(1));
            throw new IllegalStateException("unexpected gateway reply: " + reply);
        }
    }

    public static void main(String[] args) {
        PaymentProcessor p = new XmlGatewayAdapter(new XmlGateway());
        System.out.println(p.pay(49_900, "INR"));
        System.out.println(p.pay(0, "INR"));
    }
}
```

The adapter also translates **errors**: callers get a `Receipt`, never raw XML, and an unexpected reply becomes an exception instead of a silent success.

### L4.2 Decorated coffee

```java run Stacking add-on decorators
public class Main {
    interface Drink { String desc(); int price(); }
    record Base(String desc, int price) implements Drink {}
    static abstract class AddOn implements Drink {
        protected final Drink inner;
        AddOn(Drink inner) { this.inner = inner; }
    }
    static class ExtraShot extends AddOn {
        ExtraShot(Drink d) { super(d); }
        public String desc() { return inner.desc() + " + extra shot"; }
        public int price() { return inner.price() + 40; }
    }
    static class OatMilk extends AddOn {
        OatMilk(Drink d) { super(d); }
        public String desc() { return inner.desc() + " + oat milk"; }
        public int price() { return inner.price() + 30; }
    }
    static class Caramel extends AddOn {
        Caramel(Drink d) { super(d); }
        public String desc() { return inner.desc() + " + caramel"; }
        public int price() { return inner.price() + 25; }
    }

    public static void main(String[] args) {
        Drink espresso = new Base("espresso", 120), latte = new Base("latte", 150);
        Drink[] orders = {espresso, new OatMilk(new Caramel(latte)), new ExtraShot(
                new ExtraShot(new OatMilk(espresso)))};
        for (Drink d : orders) System.out.printf("%-45s Rs %d%n", d.desc(), d.price());
    }
}
```

### L4.3 A quota proxy

```java run Per-user quota and cache in one proxy
import java.util.*;

public class Main {
    interface SearchService { List<String> search(String user, String q); }
    static class Backend implements SearchService {
        int calls = 0;
        public List<String> search(String user, String q) { calls++; return List.of(q
                + "-result-1", q + "-result-2"); }
    }
    static class QuotaCachingProxy implements SearchService {
        private final SearchService real; private final int quota;
        private final Map<String, Integer> used = new HashMap<>();
        private final Map<String, List<String>> cache = new HashMap<>();
        QuotaCachingProxy(SearchService real, int quota) {
                this.real = real; this.quota = quota; }
        public List<String> search(String user, String q) {
            String key = user + "|" + q;
            if (cache.containsKey(key)) return cache.get(key);   // cached: no quota used
            if (used.getOrDefault(user, 0) >= quota) throw new IllegalStateException(user
                    + " exceeded quota");
            used.merge(user, 1, Integer::sum);
            List<String> r = real.search(user, q);
            cache.put(key, r);
            return r;
        }
    }

    public static void main(String[] args) {
        Backend backend = new Backend();
        SearchService s = new QuotaCachingProxy(backend, 3);
        String[] queries = {"java", "sql", "java", "redis", "java", "kafka"};
        for (String q : queries) {
            try { s.search("asha", q); System.out.println("asha: " + q + " ok"); }
            catch (IllegalStateException e) { System.out.println("asha: " + q + " -> "
                    + e.getMessage()); }
        }
        System.out.println("backend calls: " + backend.calls);
    }
}
```

### L4.4 An org chart composite

```java run Salary and headcount over a tree
import java.util.*;

public class Main {
    interface Staff {
        String name();
        long cost();
        int headcount();
        void print(String indent);
    }
    record Engineer(String name, long salary) implements Staff {
        public long cost() { return salary; }
        public int headcount() { return 1; }
        public void print(String in) { System.out.println(in + name + " (" + salary
                + ")"); }
    }
    static class Manager implements Staff {
        private final String name;
        private final long salary;
        private final List<Staff> reports = new ArrayList<>();
        Manager(String name, long salary, Staff... r) {
                this.name = name; this.salary = salary; reports.addAll(List.of(r)); }
        public String name() { return name; }
        public long cost() { return salary + reports.stream().mapToLong(Staff::cost)
                .sum(); }
        public int headcount() { return 1 + reports.stream().mapToInt(Staff::headcount)
                .sum(); }
        public void print(String in) {
            System.out.println(in + name + " (" + salary + ") team cost " + cost()
                    + ", headcount " + headcount());
            reports.forEach(r -> r.print(in + "    "));
        }
    }

    public static void main(String[] args) {
        Manager cto = new Manager("CTO Meera", 400,
                new Manager("EM Arjun", 250, new Engineer("Asha", 150), new Engineer("Ravi",
                        140)),
                new Manager("EM Zoya", 240, new Engineer("Neha", 160),
                        new Manager("Lead Sam", 190, new Engineer("Dev", 120))));
        cto.print("");
    }
}
```

### L4.5 Which structural pattern?

(a) **Decorator** (adds behaviour around the same interface). (b) **Proxy** (virtual proxy: lazy loading). (c) **Adapter**. (d) **Facade**. (e) **Bridge** (shapes and renderers are two independent dimensions).
