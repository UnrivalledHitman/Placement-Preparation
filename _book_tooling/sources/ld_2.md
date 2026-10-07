# Chapter 5: Behavioural Patterns
%How objects share work and communicate: Strategy, Observer, Command, State, Template Method, Chain of Responsibility, Iterator, Mediator and Visitor

| Pattern | Problem | Interview cue |
|---|---|---|
| Strategy | Swap an algorithm at run time | Pricing rules, payment methods, routing, sorting |
| Observer | Notify many dependents when something changes | Notifications, event buses, stock tickers, UI updates |
| Command | Turn a request into an object | Undo/redo, job queues, macros, transaction logs |
| State | Behaviour depends on an internal state with transitions | Vending machine, order lifecycle, elevator, traffic light |
| Template Method | Fixed algorithm skeleton, variable steps | Report generation, data import pipelines, game turns |
| Chain of Responsibility | Pass a request along handlers until one deals with it | Logging levels, support escalation, middleware filters |
| Iterator | Traverse a collection without exposing its structure | Custom collections, tree traversals, pagination |
| Mediator | Centralise complex communication between objects | Chat rooms, air-traffic control, UI dialogs |
| Visitor | Add operations to a fixed class hierarchy without editing it | Compilers (AST passes), exporting shapes to formats |

## 5.1 Strategy

The fare calculation for a ride-hailing app varies by ride type and by time of day. Each rule is a strategy behind one interface, chosen at run time. Compared with a `switch`, new rules are new classes, and each can be tested alone.

```java run Fare strategies chosen at run time
import java.util.*;

public class Main {
    record Ride(double km, int minutes, boolean peakHour) {}
    interface FareStrategy { double fare(Ride r); }

    static class Economy implements FareStrategy {
        public double fare(Ride r) { return 30 + 10 * r.km() + 1 * r.minutes(); }
    }
    static class Premium implements FareStrategy {
        public double fare(Ride r) { return 60 + 18 * r.km() + 2 * r.minutes(); }
    }
    static class Surge implements FareStrategy {                   // wraps another strategy
        private final FareStrategy base; private final double multiplier;
        Surge(FareStrategy base, double multiplier) {
                this.base = base; this.multiplier = multiplier; }
        public double fare(Ride r) {
                return r.peakHour() ? base.fare(r) * multiplier : base.fare(r); }
    }

    public static void main(String[] args) {
        Ride offPeak = new Ride(8, 20, false), peak = new Ride(8, 20, true);
        Map<String, FareStrategy> menu = new LinkedHashMap<>();
        menu.put("economy", new Economy());
        menu.put("premium", new Premium());
        menu.put("economy+surge", new Surge(new Economy(), 1.5));
        for (var e : menu.entrySet())
            System.out.printf("%-14s off-peak %6.1f   peak %6.1f%n", e.getKey(),
                    e.getValue().fare(offPeak), e.getValue().fare(peak));
    }
}
```

## 5.2 Observer

Subjects keep a list of observers and notify them on change, without knowing what they do. Here a smart meter publishes readings, and independent observers raise alerts, compute bills and log data. Adding an observer never changes the meter.

```java run A smart meter with independent observers
import java.util.*;

public class Main {
    record Reading(String meterId, int hour, double kwh) {}
    interface ReadingListener { void onReading(Reading r); }

    static class SmartMeter {
        private final String id;
        private final List<ReadingListener> listeners = new ArrayList<>();
        SmartMeter(String id) { this.id = id; }
        void subscribe(ReadingListener l) { listeners.add(l); }
        void unsubscribe(ReadingListener l) { listeners.remove(l); }
        void publish(int hour, double kwh) {
            Reading r = new Reading(id, hour, kwh);
            listeners.forEach(l -> l.onReading(r));
        }
    }
    static class HighUsageAlert implements ReadingListener {
        public void onReading(Reading r) {
            if (r.kwh() > 2.0) System.out.println("   ALERT " + r.meterId() + " hour "
                    + r.hour() + ": " + r.kwh() + " kWh");
        }
    }
    static class Billing implements ReadingListener {
        double total;
        public void onReading(Reading r) { total += r.kwh() * (r.hour() >= 18
                && r.hour() < 22 ? 9 : 6); }
    }

    public static void main(String[] args) {
        SmartMeter m = new SmartMeter("MTR-42");
        Billing bill = new Billing();
        List<Reading> log = new ArrayList<>();
        m.subscribe(new HighUsageAlert());
        m.subscribe(bill);
        m.subscribe(log::add);                        // a lambda is an observer too
        double[] usage = {0.4, 0.5, 2.6, 1.1, 3.0};
        int[] hours = {9, 13, 19, 20, 21};
        for (int i = 0; i < usage.length; i++) m.publish(hours[i], usage[i]);
        System.out.printf("readings logged %d, bill Rs %.2f (peak 18-22h at Rs 9/kWh)%n",
                log.size(), bill.total);
    }
}
```

> TRAP: Observers must be removed when no longer needed, or the subject keeps them alive (the "lapsed listener" memory leak). In multithreaded code, notify on a copy of the listener list (`CopyOnWriteArrayList`), so that a listener unsubscribing during notification does not cause `ConcurrentModificationException`.

## 5.3 Command

A command object captures an action and everything needed to perform and undo it. Store executed commands on an undo stack, undone ones on a redo stack, and undo/redo becomes a few lines.

```java run Undo and redo in a text editor
import java.util.*;

public class Main {
    static class Document {
        final StringBuilder text = new StringBuilder();
        public String toString() { return "\"" + text + "\""; }
    }
    interface Command { void execute(); void undo(); }
    static class Insert implements Command {
        private final Document doc; private final int pos; private final String s;
        Insert(Document doc, int pos, String s) {
                this.doc = doc; this.pos = pos; this.s = s; }
        public void execute() { doc.text.insert(pos, s); }
        public void undo() { doc.text.delete(pos, pos + s.length()); }
    }
    static class Delete implements Command {
        private final Document doc; private final int pos, len; private String removed;
        Delete(Document doc, int pos, int len) {
                this.doc = doc; this.pos = pos; this.len = len; }
        public void execute() { removed = doc.text.substring(pos, pos
                + len); doc.text.delete(pos, pos + len); }
        public void undo() { doc.text.insert(pos, removed); }
    }
    static class Editor {
        private final Deque<Command> undo = new ArrayDeque<>(), redo = new ArrayDeque<>();
        void run(Command c) { c.execute(); undo.push(c); redo.clear(); }
        void undo() { if (!undo.isEmpty()) { Command c = undo.pop(); c.undo(); redo.push(c);
                } }
        void redo() { if (!redo.isEmpty()) {
                Command c = redo.pop(); c.execute(); undo.push(c); } }
    }

    public static void main(String[] args) {
        Document d = new Document(); Editor e = new Editor();
        e.run(new Insert(d, 0, "Hello")); e.run(new Insert(d, 5, " World")); e.run(
                new Delete(d, 0, 6));
        System.out.println("after edits : " + d);
        e.undo(); System.out.println("undo        : " + d);
        e.undo(); System.out.println("undo        : " + d);
        e.redo(); System.out.println("redo        : " + d);
        e.run(new Insert(d, 11, "!"));
        e.redo(); System.out.println("new edit clears redo, redo has no effect: " + d);
    }
}
```

## 5.4 State

When an object's behaviour depends on its state and the transitions are well defined, give each state its own class. The context delegates to the current state, and each state decides the next one. This replaces nested `if (status == ...)` checks scattered across methods.

```java run An order lifecycle with the State pattern
public class Main {
    interface OrderState {
        default OrderState pay(Order o) { return reject(o, "pay"); }
        default OrderState ship(Order o) { return reject(o, "ship"); }
        default OrderState deliver(Order o) { return reject(o, "deliver"); }
        default OrderState cancel(Order o) { return reject(o, "cancel"); }
        String name();
        private OrderState reject(Order o, String action) {
            o.log("cannot " + action + " when " + name());
            return this;
        }
    }
    static class Created implements OrderState {
        public OrderState pay(Order o) { o.log("paid"); return new Paid(); }
        public OrderState cancel(Order o) {
                o.log("cancelled, nothing to refund"); return new Cancelled(); }
        public String name() { return "CREATED"; }
    }
    static class Paid implements OrderState {
        public OrderState ship(Order o) { o.log("shipped"); return new Shipped(); }
        public OrderState cancel(Order o) {
                o.log("cancelled, refund issued"); return new Cancelled(); }
        public String name() { return "PAID"; }
    }
    static class Shipped implements OrderState {
        public OrderState deliver(Order o) { o.log("delivered"); return new Delivered(); }
        public String name() { return "SHIPPED"; }
    }
    static class Delivered implements OrderState { public String name() {
            return "DELIVERED"; } }
    static class Cancelled implements OrderState { public String name() {
            return "CANCELLED"; } }

    static class Order {
        private OrderState state = new Created();
        void log(String msg) { System.out.println("   " + msg); }
        void pay() { state = state.pay(this); }
        void ship() { state = state.ship(this); }
        void deliver() { state = state.deliver(this); }
        void cancel() { state = state.cancel(this); }
        String state() { return state.name(); }
    }

    public static void main(String[] args) {
        Order a = new Order();
        a.ship(); a.pay(); a.ship(); a.cancel(); a.deliver();
        System.out.println("order A ends in " + a.state());
        Order b = new Order();
        b.pay(); b.cancel(); b.pay();
        System.out.println("order B ends in " + b.state());
    }
}
```

Illegal transitions (shipping before payment, cancelling after shipping) are handled once, in the default methods, and each state lists only what it allows. The vending machine and elevator case studies in Chapter 7 use the same structure.

## 5.5 Template Method

A base class fixes the steps of an algorithm and lets subclasses fill in some of them. The importer below always reads, validates, transforms and saves in that order; CSV and JSON importers differ only in how they parse.

```java run An import pipeline with a fixed skeleton
import java.util.*;

public class Main {
    static abstract class Importer {
        final String run(String raw) {                                  // template method
            List<Map<String, String>> rows = parse(raw);
            rows.removeIf(r -> !valid(r));
            rows.forEach(this::normalise);
            return save(rows);
        }
        protected abstract List<Map<String, String>> parse(String raw);   // varying step
        protected boolean valid(Map<String, String> r) { return !r.getOrDefault("email", "")
                .isBlank(); }
        protected void normalise(Map<String, String> r) { r.computeIfPresent("email", (k,
                v) -> v.toLowerCase()); }
        private String save(List<Map<String, String>> rows) { return "saved " + rows.size()
                + " rows " + rows; }
    }
    static class CsvImporter extends Importer {
        protected List<Map<String, String>> parse(String raw) {
            List<Map<String, String>> out = new ArrayList<>();
            for (String line : raw.split("\n")) {
                String[] p = line.split(",", -1);
                Map<String, String> row = new LinkedHashMap<>();
                row.put("name", p[0]); row.put("email", p[1]);
                out.add(row);
            }
            return out;
        }
    }
    static class KeyValueImporter extends Importer {          // name=..;email=.. per line
        protected List<Map<String, String>> parse(String raw) {
            List<Map<String, String>> out = new ArrayList<>();
            for (String line : raw.split("\n")) {
                Map<String, String> m = new LinkedHashMap<>();
                for (String kv : line.split(";")) { String[] p = kv.split("="); m.put(p[0],
                        p.length > 1 ? p[1] : ""); }
                out.add(m);
            }
            return out;
        }
    }

    public static void main(String[] args) {
        System.out.println(new CsvImporter()
                .run("Asha,ASHA@NIT.AC.IN\nRavi,\nNeha,Neha@Mail.com"));
        System.out.println(new KeyValueImporter()
                .run("name=Sam;email=SAM@X.IN\nname=Zoya;email="));
    }
}
```

The `final` on `run` stops subclasses from reordering the steps. Template Method uses inheritance; Strategy achieves similar flexibility with composition, which is usually preferred when steps vary independently.

## 5.6 Chain of Responsibility

Handlers are linked in a chain; each either handles a request or passes it on. Adding, removing or reordering handlers needs no change in the others. Middleware in web frameworks (servlet filters, Express middleware) works this way.

```java run A request-validation chain
import java.util.*;

public class Main {
    record Request(String user, String token, int bodyBytes, String ip) {}
    static abstract class Handler {
        private Handler next;
        Handler then(Handler n) { this.next = n; return n; }
        String handle(Request r) {
            String problem = check(r);
            if (problem != null) return "rejected by " + getClass().getSimpleName() + ": "
                    + problem;
            return next == null ? "accepted" : next.handle(r);
        }
        protected abstract String check(Request r);
    }
    static class IpBlocklist extends Handler {
        protected String check(Request r) { return r.ip()
                .startsWith("10.66.") ? "blocked IP" : null; }
    }
    static class Auth extends Handler {
        protected String check(Request r) {
                return "valid".equals(r.token()) ? null : "bad token"; }
    }
    static class SizeLimit extends Handler {
        protected String check(Request r) {
                return r.bodyBytes() > 1_000_000 ? "body too large" : null; }
    }
    static class RateLimit extends Handler {
        private final Map<String, Integer> counts = new HashMap<>();
        protected String check(Request r) { return counts.merge(r.user(), 1,
                Integer::sum) > 2 ? "too many requests" : null; }
    }

    public static void main(String[] args) {
        Handler chain = new IpBlocklist();
        chain.then(new Auth()).then(new SizeLimit()).then(new RateLimit());
        List<Request> reqs = List.of(new Request("asha", "valid", 500, "49.1.1.1"),
                new Request("ravi", "expired", 500, "49.1.1.2"), new Request("neha",
                        "valid", 5_000_000, "49.1.1.3"),
                new Request("sam", "valid", 10, "10.66.0.9"), new Request("asha", "valid",
                        10, "49.1.1.1"),
                new Request("asha", "valid", 10, "49.1.1.1"));
        for (Request r : reqs) System.out.printf("%-5s -> %s%n", r.user(), chain.handle(r));
    }
}
```

Order matters: the cheap IP check runs first, and the rate limiter runs last so that rejected requests do not consume a user's quota.

## 5.7 Iterator

An iterator walks a collection without exposing its structure. Implementing `Iterable` lets your own collection work with the enhanced `for` loop. Below, a binary search tree yields its keys in sorted order using an explicit stack, so iteration is lazy and uses O(height) memory.

```java run An in-order iterator over a binary search tree
import java.util.*;

public class Main {
    static class BST implements Iterable<Integer> {
        private static class Node { int key; Node left, right; Node(int k) { key = k; } }
        private Node root;
        void add(int k) { root = add(root, k); }
        private Node add(Node n, int k) {
            if (n == null) return new Node(k);
            if (k < n.key) n.left = add(n.left,
                    k); else if (k > n.key) n.right = add(n.right, k);
            return n;
        }
        public Iterator<Integer> iterator() {
            return new Iterator<>() {
                private final Deque<Node> stack = new ArrayDeque<>();
                { pushLeft(root); }
                private void pushLeft(Node n) {
                        for (; n != null; n = n.left) stack.push(n); }
                public boolean hasNext() { return !stack.isEmpty(); }
                public Integer next() {
                    if (stack.isEmpty()) throw new NoSuchElementException();
                    Node n = stack.pop();
                    pushLeft(n.right);
                    return n.key;
                }
            };
        }
    }

    public static void main(String[] args) {
        BST t = new BST();
        for (int k : new int[] {50, 30, 70, 20, 40, 60, 80, 35}) t.add(k);
        StringBuilder sb = new StringBuilder();
        for (int k : t) sb.append(k).append(' ');   // enhanced for uses iterator()
        System.out.println("in order: " + sb.toString().trim());
        Iterator<Integer> it = t.iterator();
        System.out.println("first three lazily: " + it.next() + ", " + it.next() + ", "
                + it.next());
    }
}
```

## 5.8 Mediator

Without a mediator, N objects that talk to each other need up to N(N − 1)/2 connections. A mediator centralises the communication: each participant knows only the mediator. Chat rooms, air-traffic control and complex UI forms are standard examples.

```java run A chat room as a mediator
import java.util.*;

public class Main {
    static class ChatRoom {
        private final Map<String, User> users = new LinkedHashMap<>();
        private final Set<String> muted = new HashSet<>();
        void join(User u) { users.put(u.name, u); broadcast("system", u.name + " joined"); }
        void mute(String name) { muted.add(name); }
        void broadcast(String from, String msg) {
            if (muted.contains(from)) { users.get(from).receive("system",
                    "you are muted"); return; }
            users.values().stream().filter(u -> !u.name.equals(from))
                    .forEach(u -> u.receive(from, msg));
        }
        void direct(String from, String to, String msg) {
            User u = users.get(to);
            if (u == null) users.get(from).receive("system", to + " is not here");
            else u.receive(from + " (private)", msg);
        }
    }
    static class User {
        final String name; private final ChatRoom room;
        final List<String> inbox = new ArrayList<>();
        User(String name, ChatRoom room) { this.name = name; this.room = room; }
        void say(String msg) { room.broadcast(name, msg); }
        void tell(String to, String msg) { room.direct(name, to, msg); }
        void receive(String from, String msg) { inbox.add(from + ": " + msg); }
    }

    public static void main(String[] args) {
        ChatRoom room = new ChatRoom();
        User asha = new User("asha", room), ravi = new User("ravi", room),
                neha = new User("neha", room);
        room.join(asha); room.join(ravi); room.join(neha);
        asha.say("standup in 5 min"); ravi.tell("neha", "can you review my PR?");
        room.mute("ravi"); ravi.say("spam spam"); neha.tell("zoya", "hi");
        for (User u : List.of(asha, ravi, neha)) System.out.println(u.name + " inbox "
                + u.inbox);
    }
}
```

## 5.9 Visitor (briefly)

Visitor adds new operations to a stable class hierarchy without editing the classes: each class has `accept(visitor)`, and each visitor has one method per class (double dispatch). In modern Java, **sealed interfaces with pattern-matching `switch`** give the same benefit with less code, and the compiler checks that every case is handled.

```java run Visitor versus a sealed hierarchy with switch
import java.util.*;

public class Main {
    sealed interface Shape permits Circle, Square {}
    record Circle(double r) implements Shape {}
    record Square(double side) implements Shape {}

    // classic visitor
    interface ShapeVisitor<R> { R circle(Circle c); R square(Square s); }
    static <R> R accept(Shape s, ShapeVisitor<R> v) {
        return s instanceof Circle c ? v.circle(c) : v.square((Square) s);
    }
    static class AreaVisitor implements ShapeVisitor<Double> {
        public Double circle(Circle c) { return Math.PI * c.r() * c.r(); }
        public Double square(Square s) { return s.side() * s.side(); }
    }

    static String toSvg(Shape s) {   // modern alternative
        return switch (s) {
            case Circle c -> "<circle r='" + c.r() + "'/>";
            case Square q -> "<rect width='" + q.side() + "' height='" + q.side() + "'/>";
        };
    }

    public static void main(String[] args) {
        List<Shape> shapes = List.of(new Circle(1), new Square(2));
        for (Shape s : shapes)
            System.out.printf("%-30s area %.2f  svg %s%n", s, accept(s, new AreaVisitor()),
                    toSvg(s));
    }
}
```

## 5.10 Practical lessons

- Strategy for interchangeable algorithms; State when the object's state decides behaviour and transitions.
- Observer decouples producers from consumers; remember unsubscription and thread safety.
- Command makes actions storable: undo/redo, queues, audit logs.
- Template Method fixes the skeleton through inheritance; prefer Strategy when steps vary independently.
- Chain of Responsibility for pipelines of checks; order the handlers deliberately.
- Visitor is rarely needed in modern Java: sealed types plus `switch` cover most cases.

# Chapter 6: Concurrency in Design
%Designing classes that stay correct when many threads use them

Many LLD follow-ups are concurrency questions in disguise: "what if two users book the same seat?", "what if two threads withdraw at once?". This chapter assumes the basics from the Java guide (threads, `synchronized`, `volatile`, executors) and the OS guide's synchronisation chapter, and focuses on *design*.

> NOTE: Concurrency demos print only stable facts (totals, counts, true/false checks), because the interleaving of threads varies between runs.

## 6.1 Three ways to be thread-safe

| Strategy | Idea | Example |
|---|---|---|
| Immutability | Objects that never change can be shared freely | `record Money(long paise, String currency)`, `String`, `List.of(...)` |
| Confinement | Data is only ever touched by one thread | Local variables, `ThreadLocal`, actor-style single-writer queues |
| Synchronisation | Shared mutable state guarded by locks or atomics | `synchronized`, `ReentrantLock`, `AtomicLong`, `ConcurrentHashMap` |

Prefer them in that order: immutable objects need no reasoning at all; synchronised ones need the most.

## 6.2 Check-then-act and compound actions

The most common bug is a **check-then-act** sequence on shared state: "if the seat is free, book it". Two threads can both see the seat as free. Every check-then-act or read-modify-write on shared state must be made atomic.

```java run Atomic compound actions with ConcurrentHashMap
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {
    public static void main(String[] args) throws Exception {
        ConcurrentHashMap<String, String> seats = new ConcurrentHashMap<>();
        ConcurrentHashMap<String, LongAdder> views = new ConcurrentHashMap<>();
        AtomicInteger booked = new AtomicInteger();
        ExecutorService pool = Executors.newFixedThreadPool(8);
        List<Future<?>> fs = new ArrayList<>();
        for (int user = 0; user < 1000; user++) {
            final String u = "user" + user;
            fs.add(pool.submit(() -> {
                String seat = "A" + (u.hashCode() & 7);   // 8 seats, 1000 users
                views.computeIfAbsent(seat, k -> new LongAdder()).increment();
                // atomic check-then-act
                if (seats.putIfAbsent(seat, u) == null) booked.incrementAndGet();
            }));
        }
        for (Future<?> f : fs) f.get();
        pool.shutdown();
        long totalViews = views.values().stream().mapToLong(LongAdder::sum).sum();
        System.out.println("seats booked: " + booked.get() + " (seats exist: "
                + seats.size() + ")");
        System.out.println("total views counted: " + totalViews);
    }
}
```

`putIfAbsent` performs "check that the seat is free, then book it" as one atomic step, so exactly one user wins each seat no matter how the threads interleave. `computeIfAbsent`, `merge` and `compute` are the other atomic compound operations every interview candidate should know.

> TRAP: `if (!map.containsKey(k)) map.put(k, v);` is **not** atomic even on a `ConcurrentHashMap`: each call is thread-safe, but another thread can act between them. Use `putIfAbsent`.

## 6.3 Avoiding deadlock: lock ordering

Transferring money between two accounts needs both locks. If one thread locks A then B while another locks B then A, they can deadlock. The fix is to always acquire locks in a **global order** (here, by account id).

```java run Transfers with ordered locks
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.locks.*;

public class Main {
    static class Account {
        final int id; long balance; final ReentrantLock lock = new ReentrantLock();
        Account(int id, long balance) { this.id = id; this.balance = balance; }
    }
    static boolean transfer(Account from, Account to, long amount) {
        Account first = from.id < to.id ? from : to;   // global order: smaller id first
        Account second = first == from ? to : from;
        first.lock.lock();
        try {
            second.lock.lock();
            try {
                if (from.balance < amount) return false;
                from.balance -= amount; to.balance += amount;
                return true;
            } finally { second.lock.unlock(); }
        } finally { first.lock.unlock(); }
    }

    public static void main(String[] args) throws Exception {
        List<Account> accounts = new ArrayList<>();
        for (int i = 0; i < 5; i++) accounts.add(new Account(i, 10_000));
        ExecutorService pool = Executors.newFixedThreadPool(8);
        Random seed = new Random(7);
        List<Callable<Boolean>> jobs = new ArrayList<>();
        for (int i = 0; i < 20_000; i++) {
            Account a = accounts.get(seed.nextInt(5)), b = accounts.get(seed.nextInt(5));
            long amt = 1 + seed.nextInt(500);
            if (a != b) jobs.add(() -> transfer(a, b, amt));
        }
        List<Future<Boolean>> results = pool.invokeAll(jobs);
        pool.shutdown();
        boolean finished = pool.awaitTermination(30, TimeUnit.SECONDS);
        long total = accounts.stream().mapToLong(x -> x.balance).sum();
        System.out.println("all transfers finished (no deadlock): " + finished);
        System.out.println("money conserved: total = " + total + " (started with 50000)");
        System.out.println("every balance non-negative: " + accounts.stream()
                .allMatch(x -> x.balance >= 0));
    }
}
```

Other deadlock-avoidance designs: `tryLock` with a timeout (back off and retry), a single coarse lock (simple but less concurrent), or avoiding shared locks altogether by sending transfers to one owner thread per account.

## 6.4 Producer–consumer with a blocking queue

A bounded `BlockingQueue` decouples producers from consumers and applies **back-pressure**: when the queue is full, producers block instead of exhausting memory. A "poison pill" message tells consumers to stop.

```java run Producers and consumers with back-pressure
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {
    record Job(int id, int cost) {}
    static final Job POISON = new Job(-1, 0);

    public static void main(String[] args) throws Exception {
        BlockingQueue<Job> queue = new ArrayBlockingQueue<>(10);       // bounded
        AtomicLong processedCost = new AtomicLong();
        AtomicInteger processed = new AtomicInteger();
        int producers = 3, consumers = 2, perProducer = 1000;
        ExecutorService pool = Executors.newFixedThreadPool(producers + consumers);
        for (int p = 0; p < producers; p++) {
            final int base = p * perProducer;
            pool.submit(() -> {
                for (int i = 0; i < perProducer; i++) queue.put(new Job(base + i, (base
                        + i) % 7));
                return null;
            });
        }
        List<Future<?>> cons = new ArrayList<>();
        for (int c = 0; c < consumers; c++)
            cons.add(pool.submit(() -> {
                while (true) {
                    Job j = queue.take();
                    if (j == POISON) return null;
                    processedCost.addAndGet(j.cost());
                    processed.incrementAndGet();
                }
            }));
        while (processed.get() < producers * perProducer) Thread.sleep(5);
        for (int c = 0; c < consumers; c++) queue.put(POISON);
        for (Future<?> f : cons) f.get();
        pool.shutdown();
        long expected = 0;
        for (int i = 0; i < producers * perProducer; i++) expected += i % 7;
        System.out.println("jobs processed: " + processed.get() + ", cost sum "
                + processedCost.get()
                + " (expected " + expected + ")");
    }
}
```

## 6.5 Read-mostly data: read-write locks and copy-on-write

When reads vastly outnumber writes, a `ReentrantReadWriteLock` lets many readers proceed in parallel while writers get exclusive access. For small read-mostly collections (listener lists, configuration), `CopyOnWriteArrayList` copies the array on every write, so reads need no locking at all.

```java run A read-mostly price table with a read-write lock
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.locks.*;

public class Main {
    static class PriceTable {
        private final Map<String, Integer> prices = new HashMap<>();
        private final ReadWriteLock rw = new ReentrantReadWriteLock();
        Integer get(String sku) {
            rw.readLock().lock();
            try { return prices.get(sku); } finally { rw.readLock().unlock(); }
        }
        void put(String sku, int p) {
            rw.writeLock().lock();
            try { prices.put(sku, p); } finally { rw.writeLock().unlock(); }
        }
    }

    public static void main(String[] args) throws Exception {
        PriceTable t = new PriceTable();
        for (int i = 0; i < 100; i++) t.put("sku" + i, 100 + i);
        ExecutorService pool = Executors.newFixedThreadPool(8);
        List<Future<Integer>> reads = new ArrayList<>();
        for (int r = 0; r < 10_000; r++) {
            final int k = r % 100;
            reads.add(pool.submit(() -> t.get("sku" + k)));
            // rare write, same value
            if (r % 1000 == 0) pool.submit(() -> t.put("sku" + k, 100 + k));
        }
        boolean allValid = true;
        for (Future<Integer> f : reads) { Integer v = f.get(); allValid &= v != null
                && v >= 100 && v < 200; }
        pool.shutdown();
        System.out.println("10000 concurrent reads, all saw a valid price: " + allValid);
    }
}
```

## 6.6 Design checklist for shared state

| Question | Good answer |
|---|---|
| What state is shared between threads? | List it explicitly; minimise it |
| Can it be immutable? | Records and unmodifiable collections where possible |
| Which invariants span several fields? | Guard them with one lock (or one atomic reference to an immutable snapshot) |
| Are there check-then-act sequences? | Make them atomic (`putIfAbsent`, `compute`, a lock, or a database constraint) |
| Do operations take several locks? | Fix a global lock order, or use `tryLock` with timeout |
| What happens under contention? | Prefer `ConcurrentHashMap`, `LongAdder`, queues over one big lock |
| Is the system distributed? | Local locks are not enough: use database transactions, optimistic versioning, or a distributed lock with expiry |

## 6.7 Practical lessons

- Immutability first, confinement second, locks last.
- Treat every check-then-act on shared data as a bug until it is made atomic.
- Acquire multiple locks in a global order.
- Bounded queues give back-pressure; poison pills give clean shutdown.
- In a booking system spanning several servers, the "lock" is usually the database: a unique constraint or a conditional `UPDATE ... WHERE status = 'free'`.
