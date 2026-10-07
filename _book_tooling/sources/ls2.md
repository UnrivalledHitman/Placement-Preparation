## Part 5 solutions

### L5.1 Shipping cost strategies

```java run Strategies chosen by a selector
import java.util.*;

public class Main {
    record Order(String id, double weightKg, int value, boolean express) {}
    interface ShippingStrategy { int cost(Order o); String name(); }
    static class Standard implements ShippingStrategy {
        public int cost(Order o) { return (int) Math.round(40 + 10 * o.weightKg()); }
        public String name() { return "standard"; }
    }
    static class Express implements ShippingStrategy {
        public int cost(Order o) { return (int) Math.round(100 + 20 * o.weightKg()); }
        public String name() { return "express"; }
    }
    static class FreeStandard implements ShippingStrategy {
        public int cost(Order o) { return 0; }
        public String name() { return "free standard"; }
    }
    static ShippingStrategy select(Order o) {
        if (o.express()) return new Express();
        return o.value() > 999 ? new FreeStandard() : new Standard();
    }

    public static void main(String[] args) {
        for (Order o : List.of(new Order("A", 2.5, 650, false), new Order("B", 2.5, 1499,
                false),
                new Order("C", 2.5, 1499, true))) {
            ShippingStrategy s = select(o);
            System.out.println(o.id() + ": " + s.name() + " Rs " + s.cost(o));
        }
    }
}
```

The selection rule lives in one place, separate from the cost formulas. Order C is worth more than Rs 999 but asked for express, so express wins: the rule order inside `select` is a business decision worth confirming with the interviewer.

### L5.2 Price alerts with unsubscribe

```java run One-shot alerts that remove themselves
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.function.DoubleConsumer;

public class Main {
    static class StockTicker {
        // safe removal
        private final List<DoubleConsumer> listeners = new CopyOnWriteArrayList<>();
        void subscribe(DoubleConsumer l) { listeners.add(l); }
        void unsubscribe(DoubleConsumer l) { listeners.remove(l); }
        int count() { return listeners.size(); }
        void publish(double price) { for (DoubleConsumer l : listeners) l.accept(price); }
    }
    static class CrossAlert implements DoubleConsumer {
        private final String user; private final double level; private final boolean above;
        private final StockTicker ticker;
        CrossAlert(StockTicker t, String user, double level, boolean above) {
            ticker = t; this.user = user; this.level = level; this.above = above;
        }
        public void accept(double p) {
            if (above ? p >= level : p <= level) {
                System.out.println("   alert " + user + ": price " + p
                        + (above ? " >= " : " <= ") + level);
                ticker.unsubscribe(this);                         // one-shot
            }
        }
    }

    public static void main(String[] args) {
        StockTicker t = new StockTicker();
        t.subscribe(new CrossAlert(t, "asha", 2500, true));
        t.subscribe(new CrossAlert(t, "ravi", 2400, false));
        t.subscribe(new CrossAlert(t, "neha", 2550, true));
        for (double p : new double[] {2450, 2510, 2560, 2390, 2600}) {
            System.out.println("price " + p + " (" + t.count() + " alerts active)");
            t.publish(p);
        }
    }
}
```

Each alert fires once (Asha's at 2 510, Neha's at 2 560, Ravi's at 2 390) and removes itself in the middle of `publish`, so the active count drops to zero. With an `ArrayList`, removing during the `for` loop would throw `ConcurrentModificationException`; `CopyOnWriteArrayList` iterates over a snapshot, so removal is safe.

### L5.3 Macro commands with undo

```java run A composite command with reverse undo
import java.util.*;

public class Main {
    static class Light {
        final String name; boolean on; int brightness = 100;
        Light(String n) { name = n; }
        public String toString() { return name + (on ? " on@" + brightness : " off"); }
    }
    interface Command { void execute(); void undo(); }
    record LightOn(Light l) implements Command {
        public void execute() { l.on = true; }
        public void undo() { l.on = false; }
    }
    record LightOff(Light l) implements Command {
        public void execute() { l.on = false; }
        public void undo() { l.on = true; }
    }
    static class SetBrightness implements Command {
        private final Light l; private final int level; private int previous;
        SetBrightness(Light l, int level) { this.l = l; this.level = level; }
        public void execute() { previous = l.brightness; l.brightness = level; }
        public void undo() { l.brightness = previous; }
    }
    record Macro(List<Command> steps) implements Command {
        public void execute() { steps.forEach(Command::execute); }
        public void undo() { for (int i = steps.size() - 1; i >= 0; i--) steps.get(i)
                .undo(); }
    }

    public static void main(String[] args) {
        Light hall = new Light("hall"), tv = new Light("tv-backlight");
        hall.on = true; tv.on = true;
        System.out.println("before : " + hall + ", " + tv);
        Command movie = new Macro(List.of(new SetBrightness(hall, 20), new LightOff(tv)));
        movie.execute();
        System.out.println("movie  : " + hall + ", " + tv);
        movie.undo();
        System.out.println("undo   : " + hall + ", " + tv);
    }
}
```

A macro is itself a `Command` (Composite applied to Command), so it can be stored on the same undo stack as single commands. `SetBrightness` remembers the previous level at execution time, which is what makes its undo correct.

### L5.4 A traffic light with a pedestrian button

```java run State classes with timed transitions
public class Main {
    interface State { String name(); int duration(); State next(); }
    record Green() implements State {
        public String name() { return "GREEN"; } public int duration() { return 30;
                } public State next() { return new Yellow(); }
    }
    record Yellow() implements State {
        public String name() { return "YELLOW"; } public int duration() { return 5;
                } public State next() { return new Red(); }
    }
    record Red() implements State {
        public String name() { return "RED"; } public int duration() { return 20;
                } public State next() { return new Green(); }
    }

    static class TrafficLight {
        private State state = new Green(); private int remaining = state.duration();
        void pressButton(int t) {
            if (state instanceof Green && remaining > 5) {
                System.out.println("t=" + t + " button: green cut from " + remaining
                        + " s to 5 s");
                remaining = 5;
            } else {
                System.out.println("t=" + t + " button: no change (" + state.name() + ")");
            }
        }
        void tick(int seconds, int t) {
            remaining -= seconds;
            if (remaining <= 0) {
                state = state.next(); remaining = state.duration();
                System.out.println("t=" + t + " -> " + state.name() + " for " + remaining
                        + " s");
            }
        }
    }

    public static void main(String[] args) {
        TrafficLight light = new TrafficLight();
        for (int t = 5; t <= 70; t += 5) {
            if (t == 10) light.pressButton(t);
            light.tick(5, t);
        }
    }
}
```

The press happens at t = 10 with 25 s of green left and cuts it to 5 s; the tick at t = 10 uses up those 5 s, so yellow starts at t = 10, red at t = 15 and green again at t = 35. Without the button, yellow would have come at t = 30 and the next green at t = 55. The button rule is a guard inside the state machine, not a special case scattered through the code; a second press during red would be ignored.

### L5.5 Expense approval chain

```java run Approval limits as a chain
import java.util.*;

public class Main {
    static abstract class Approver {
        private Approver next; private final String role; private final long limit;
        Approver(String role, long limit) { this.role = role; this.limit = limit; }
        Approver then(Approver n) { next = n; return n; }
        String approve(long amount) {
            if (amount <= limit) return "approved by " + role;
            return next == null ? "rejected: above every limit" : next.approve(amount);
        }
    }
    static class Lead extends Approver { Lead() { super("team lead", 10_000); } }
    static class Mgr extends Approver { Mgr() { super("manager", 100_000); } }
    static class Director extends Approver { Director() { super("director", 1_000_000); } }

    public static void main(String[] args) {
        Approver chain = new Lead();
        chain.then(new Mgr()).then(new Director());
        for (long amt : new long[] {4_500, 10_000, 72_000, 450_000, 2_500_000})
            System.out.printf("Rs %,10d -> %s%n", amt, chain.approve(amt));
    }
}
```

### L5.6 Template method exporters

```java run One skeleton, two formats
import java.util.*;

public class Main {
    static abstract class Exporter {
        // fixed skeleton
        final String export(List<String> cols, List<List<Object>> rows) {
            StringBuilder sb = new StringBuilder(header(cols));
            for (List<Object> r : rows) sb.append('\n').append(row(r));
            String f = footer(rows.size());
            return f.isEmpty() ? sb.toString() : sb.append('\n').append(f).toString();
        }
        protected abstract String header(List<String> cols);
        protected abstract String row(List<Object> r);
        protected String footer(int n) { return ""; }   // optional hook
    }
    static class CsvExporter extends Exporter {
        protected String header(List<String> c) { return String.join(",", c); }
        protected String row(List<Object> r) { return String.join(",", r.stream()
                .map(String::valueOf).toList()); }
    }
    static class MarkdownExporter extends Exporter {
        protected String header(List<String> c) {
            return "| " + String.join(" | ", c) + " |\n|" + "---|".repeat(c.size());
        }
        protected String row(List<Object> r) {
            return "| " + String.join(" | ", r.stream().map(String::valueOf).toList())
                    + " |";
        }
        protected String footer(int n) { return "_" + n + " rows_"; }
    }

    public static void main(String[] args) {
        List<String> cols = List.of("meter", "kwh");
        List<List<Object>> rows = List.of(List.of("M-1", 12.5), List.of("M-2", 8.0),
                List.of("M-3", 15.25));
        System.out.println(new CsvExporter().export(cols, rows));
        System.out.println(new MarkdownExporter().export(cols, rows));
    }
}
```

`footer` is a **hook**: a step with a default (empty) implementation that subclasses may override. CSV does not need a footer; Markdown adds a row count.

## Part 6 solutions

### L6.1 Three thread-safe counters

```java run synchronized, AtomicLong and LongAdder give exact totals
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {
    interface Counter { void inc(); long get(); }
    static class SyncCounter implements Counter {
        private long n; public synchronized void inc() { n++;
                } public synchronized long get() { return n; }
    }
    static class AtomicCounter implements Counter {
        private final AtomicLong n = new AtomicLong(); public void inc() {
                n.incrementAndGet(); } public long get() { return n.get(); }
    }
    static class AdderCounter implements Counter {
        private final LongAdder n = new LongAdder(); public void inc() { n.increment();
                } public long get() { return n.sum(); }
    }

    static long run(Counter c) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(8);
        for (int t = 0; t < 8; t++) pool.submit(() -> {
                for (int i = 0; i < 125_000; i++) c.inc(); });
        pool.shutdown();
        pool.awaitTermination(1, TimeUnit.MINUTES);
        return c.get();
    }

    public static void main(String[] args) throws Exception {
        for (Counter c : new Counter[] {new SyncCounter(), new AtomicCounter(),
                new AdderCounter()})
            System.out.println(c.getClass().getSimpleName() + ": " + run(c));
    }
}
```

All three are exact. They differ in cost under contention: `synchronized` makes threads queue for one lock, `AtomicLong` retries a compare-and-swap on one memory location, and `LongAdder` spreads increments over several cells and adds them up only in `sum()`, which makes it the fastest for write-heavy counters (metrics, view counts) and slightly more expensive to read.

### L6.2 Your own blocking queue

```java run A bounded buffer with wait and notifyAll
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {
    static class BoundedQueue<T> {
        private final Deque<T> items = new ArrayDeque<>(); private final int capacity;
        BoundedQueue(int capacity) { this.capacity = capacity; }
        synchronized void put(T x) throws InterruptedException {
            while (items.size() == capacity) wait();          // always wait in a loop
            items.addLast(x);
            notifyAll();
        }
        synchronized T take() throws InterruptedException {
            while (items.isEmpty()) wait();
            T x = items.removeFirst();
            notifyAll();
            return x;
        }
    }

    public static void main(String[] args) throws Exception {
        BoundedQueue<Integer> q = new BoundedQueue<>(5);
        int producers = 3, perProducer = 10_000, consumers = 3;
        ExecutorService pool = Executors.newFixedThreadPool(producers + consumers);
        Set<Integer> seen = ConcurrentHashMap.newKeySet();
        AtomicInteger duplicates = new AtomicInteger();
        for (int p = 0; p < producers; p++) {
            final int base = p * perProducer;
            pool.submit(() -> { for (int i = 0; i < perProducer; i++) q.put(base
                    + i); return null; });
        }
        List<Future<?>> cs = new ArrayList<>();
        for (int c = 0; c < consumers; c++)
            cs.add(pool.submit(() -> {
                while (true) {
                    int x = q.take();
                    if (x < 0) return null;                          // poison pill
                    if (!seen.add(x)) duplicates.incrementAndGet();
                }
            }));
        while (seen.size() < producers * perProducer) Thread.sleep(5);
        for (int c = 0; c < consumers; c++) q.put(-1);
        for (Future<?> f : cs) f.get();
        pool.shutdown();
        System.out.println("items consumed: " + seen.size() + " of "
                + producers * perProducer
                + ", duplicates: " + duplicates.get());
    }
}
```

Two rules make this correct. `wait()` is always called in a `while` loop, because a thread can wake up spuriously or find the condition already changed by another thread. And `notifyAll()` is used instead of `notify()`: with producers and consumers waiting on the same monitor, `notify()` could wake a thread of the wrong kind and leave the right one asleep forever.

### L6.3 Username registration race

```java run Exactly one winner per name
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {
    static class Registry {
        private final ConcurrentHashMap<String, String> users = new ConcurrentHashMap<>();
        boolean register(String name, String owner) { return users.putIfAbsent(name,
                owner) == null; }
        int size() { return users.size(); }
    }

    public static void main(String[] args) throws Exception {
        Registry reg = new Registry();
        AtomicInteger ok = new AtomicInteger(), taken = new AtomicInteger();
        ExecutorService pool = Executors.newFixedThreadPool(16);
        List<Callable<Void>> jobs = new ArrayList<>();
        for (int i = 0; i < 1000; i++) {
            final int id = i;
            jobs.add(() -> {
                if (reg.register("name" + (id % 10), "client"
                        + id)) ok.incrementAndGet(); else taken.incrementAndGet();
                return null;
            });
        }
        pool.invokeAll(jobs);
        pool.shutdown();
        System.out.println("succeeded: " + ok.get() + ", told 'taken': " + taken.get()
                + ", names stored: " + reg.size());
    }
}
```

`putIfAbsent` makes "check and insert" one atomic step. In a real service, the same guarantee comes from a `UNIQUE` constraint on the username column: the database rejects the second insert even if two application servers race.

### L6.4 Deadlock-free dining philosophers

```java run Ordered fork acquisition
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.concurrent.locks.*;

public class Main {
    public static void main(String[] args) throws Exception {
        int n = 5, meals = 1000;
        ReentrantLock[] forks = new ReentrantLock[n];
        for (int i = 0; i < n; i++) forks[i] = new ReentrantLock();
        AtomicInteger[] eaten = new AtomicInteger[n];
        ExecutorService pool = Executors.newFixedThreadPool(n);
        for (int p = 0; p < n; p++) {
            final int id = p;
            eaten[p] = new AtomicInteger();
            int left = p, right = (p + 1) % n;
            ReentrantLock first = forks[Math.min(left, right)],
                    second = forks[Math.max(left, right)];
            pool.submit(() -> {
                for (int m = 0; m < meals; m++) {
                    first.lock();   // lower-numbered fork first
                    try {
                        second.lock();
                        try { eaten[id].incrementAndGet(); } finally { second.unlock(); }
                    } finally { first.unlock(); }
                }
            });
        }
        pool.shutdown();
        boolean done = pool.awaitTermination(30, TimeUnit.SECONDS);
        int total = 0;
        for (AtomicInteger e : eaten) total += e.get();
        System.out.println("all finished: " + done + ", meals eaten: " + total
                + " (expected " + n * meals + ")");
    }
}
```

If every philosopher picks up the left fork first, all five can hold one fork and wait forever for the other: a cycle. Numbering the forks and always taking the lower number first breaks the cycle (philosopher 4 takes fork 0 before fork 4), which is the same global lock ordering used for bank transfers in the guide.

### L6.5 Make Money immutable

Rules for an immutable class: make the class `final` (or use a record); make every field `private final`; set them only in the constructor, validating there; return new objects from "modifying" methods; never expose mutable internals (copy them in and out).

```java run An immutable value object
public class Main {
    record Money(long paise, String currency) {
        Money {
            if (paise < 0) throw new IllegalArgumentException("negative amount");
            if (!currency.matches("[A-Z]{3}"))
                throw new IllegalArgumentException("bad currency " + currency);
        }
        static Money rupees(double r) { return new Money(Math.round(r * 100), "INR"); }
        Money plus(Money o) {
            if (!currency.equals(o.currency))
                throw new IllegalArgumentException("currency mismatch");
            return new Money(paise + o.paise, currency);
        }
        Money times(int n) { return new Money(paise * n, currency); }
        @Override public String toString() { return String.format("%s %.2f", currency,
                paise / 100.0); }
    }

    public static void main(String[] args) {
        Money price = Money.rupees(199.99);
        Money total = price.times(3).plus(Money.rupees(40));
        System.out.println("price " + price + ", total " + total + ", price unchanged: "
                + price);
        System.out.println("equal by value: " + Money.rupees(10).equals(new Money(1000,
                "INR")));
        try { price.plus(new Money(500, "USD")); }
        catch (IllegalArgumentException e) { System.out.println("rejected: "
                + e.getMessage()); }
    }
}
```

Immutable objects are automatically thread-safe and can be shared, cached and used as map keys without defensive copies. Storing money as integer paise avoids floating-point rounding errors.
