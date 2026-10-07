# Chapter 8: Case Studies II
%Rate limiter, logging framework, board games, library management, notification service and an in-memory key-value store with TTL

## 8.1 Rate limiter

### Requirements

Limit each client to N requests per time window (for example 5 requests per 10 seconds). The algorithm must be swappable, and each check should be O(1) or close to it. The System Design guide covers rate limiting across many servers; here we design the in-process component.

| Algorithm | State per client | Behaviour | Weakness |
|---|---|---|---|
| Fixed window counter | Window start + count | Reset the count at each window boundary | Allows up to **2N** requests across a boundary |
| Sliding window log | Timestamps of recent requests | Exact | Memory grows with the limit |
| Sliding window counter | Two counters (current, previous window) | Weighted estimate of the sliding count | Approximate, but cheap |
| Token bucket | Tokens + last refill time | Allows bursts up to capacity, smooth average rate | Burst size must be chosen |

### Design

`RateLimiter` is a strategy interface with `allow(clientId, nowMillis)`. Time is passed in, which makes every algorithm deterministic and testable. Each implementation keeps per-client state in a map and synchronises per call.

```java run Four rate-limiting algorithms on the same traffic
import java.util.*;

public class Main {
    interface RateLimiter { boolean allow(String client, long now); }

    static class FixedWindow implements RateLimiter {
        private final int limit; private final long window;
        private final Map<String, long[]> state = new HashMap<>();   // {windowStart, count}
        FixedWindow(int limit, long window) { this.limit = limit; this.window = window; }
        public synchronized boolean allow(String c, long now) {
            long[] s = state.computeIfAbsent(c, k -> new long[] {now - now % window, 0});
            if (now - s[0] >= window) { s[0] = now - now % window; s[1] = 0; }
            return s[1] < limit && ++s[1] > 0;
        }
    }
    static class SlidingLog implements RateLimiter {
        private final int limit; private final long window;
        private final Map<String, Deque<Long>> logs = new HashMap<>();
        SlidingLog(int limit, long window) { this.limit = limit; this.window = window; }
        public synchronized boolean allow(String c, long now) {
            Deque<Long> q = logs.computeIfAbsent(c, k -> new ArrayDeque<>());
            while (!q.isEmpty() && now - q.peekFirst() >= window) q.pollFirst();
            if (q.size() >= limit) return false;
            q.addLast(now); return true;
        }
    }
    static class SlidingCounter implements RateLimiter {
        private final int limit; private final long window;
        // {windowStart, current, previous}
        private final Map<String, long[]> state = new HashMap<>();
        SlidingCounter(int limit, long window) { this.limit = limit; this.window = window; }
        public synchronized boolean allow(String c, long now) {
            long start = now - now % window;
            long[] s = state.computeIfAbsent(c, k -> new long[] {start, 0, 0});
            if (start != s[0]) {
                    s[2] = start - s[0] == window ? s[1] : 0; s[1] = 0; s[0] = start; }
            double weight = 1.0 - (double) (now - start) / window;
            if (s[2] * weight + s[1] >= limit) return false;
            s[1]++; return true;
        }
    }
    static class TokenBucket implements RateLimiter {
        private final double capacity, refillPerMs;
        // {tokens, lastRefill}
        private final Map<String, double[]> state = new HashMap<>();
        TokenBucket(int capacity, double perSecond) {
                this.capacity = capacity; this.refillPerMs = perSecond / 1000; }
        public synchronized boolean allow(String c, long now) {
            double[] s = state.computeIfAbsent(c, k -> new double[] {capacity, now});
            s[0] = Math.min(capacity, s[0] + (now - s[1]) * refillPerMs); s[1] = now;
            if (s[0] < 1) return false;
            s[0] -= 1; return true;
        }
    }

    public static void main(String[] args) {
        long[] times = {9000, 9200, 9400, 9600, 9800, 10000, 10200, 10400, 10600, 10800,
                15000, 20500};
        Map<String, RateLimiter> limiters = new LinkedHashMap<>();
        limiters.put("fixed window", new FixedWindow(5, 10_000));
        limiters.put("sliding log", new SlidingLog(5, 10_000));
        limiters.put("sliding counter", new SlidingCounter(5, 10_000));
        // burst 5, refill 1 per 2 s
        limiters.put("token bucket", new TokenBucket(5, 0.5));
        System.out.println("limit 5 per 10 s; requests at t(ms) = "
                + Arrays.toString(times));
        for (var e : limiters.entrySet()) {
            StringBuilder sb = new StringBuilder(); int ok = 0;
            for (long t : times) { boolean a = e.getValue().allow("client-1",
                    t); sb.append(a ? 'Y' : '.'); ok += a ? 1 : 0; }
            System.out.printf("%-16s %s  allowed %d%n", e.getKey(), sb, ok);
        }
    }
}
```

The traffic is a burst of ten requests straddling the boundary at t = 10 000 ms. The **fixed window** allows five just before the boundary and five more just after, ten requests in two seconds, twice the intended limit. The **sliding log** is exact: it allows only five, and admits more only once the early ones are 10 seconds old. The **sliding counter** approximates the log with just two numbers per client, and the approximation shows: it admits one extra request during the burst (it assumes the previous window's requests were spread evenly, when they were all at its end). The **token bucket** allows the initial burst of five and then refills at one token every two seconds, so it admits the later requests at 15 000 and 20 500 ms.

| Extension | Change |
|---|---|
| Different limits per plan (free, pro) | Look up the limit per client; strategies take a `Rule` object |
| Many servers | Keep counters in Redis (`INCR` + `EXPIRE`, or a Lua script for the token bucket) |
| Memory for inactive clients | Evict idle client state (an LRU map, or expiry as in Section 8.6) |
| Return headers | Report remaining quota and reset time (`X-RateLimit-Remaining`, `Retry-After`) |

## 8.2 Logging framework

### Requirements

Log messages with levels (DEBUG, INFO, WARN, ERROR). A logger has a minimum level; messages go to several destinations (console, file, alerting), each with its own minimum level and format. Destinations and formats must be pluggable.

### Design

A **Chain of Responsibility** of appenders (each decides whether to handle a message and always passes it on), a **Strategy** for formatting, and one logger per name created through a small factory registry (as in `LoggerFactory.getLogger(...)` in SLF4J).

```java run A small logging framework
import java.util.*;

public class Main {
    enum Level { DEBUG, INFO, WARN, ERROR }
    record LogEvent(long time, Level level, String logger, String message) {}

    interface Formatter { String format(LogEvent e); }
    static class PlainFormatter implements Formatter {
        public String format(LogEvent e) { return String.format("%05d %-5s [%s] %s",
                e.time(), e.level(), e.logger(), e.message()); }
    }
    static class JsonFormatter implements Formatter {
        public String format(LogEvent e) {
            return String.format(
                    "{\"t\":%d,\"level\":\"%s\",\"logger\":\"%s\",\"msg\":\"%s\"}",
                    e.time(), e.level(), e.logger(), e.message());
        }
    }

    static abstract class Appender {                       // chain of responsibility
        private final Level min; protected final Formatter fmt; private Appender next;
        Appender(Level min, Formatter fmt) { this.min = min; this.fmt = fmt; }
        Appender then(Appender n) { next = n; return n; }
        void handle(LogEvent e) {
            if (e.level().compareTo(min) >= 0) write(e);
            if (next != null) next.handle(e);
        }
        protected abstract void write(LogEvent e);
    }
    static class ConsoleAppender extends Appender {
        ConsoleAppender(Level min, Formatter f) { super(min, f); }
        protected void write(LogEvent e) { System.out.println("console | "
                + fmt.format(e)); }
    }
    static class MemoryFileAppender extends Appender {
        final List<String> lines = new ArrayList<>();
        MemoryFileAppender(Level min, Formatter f) { super(min, f); }
        protected void write(LogEvent e) { lines.add(fmt.format(e)); }
    }
    static class AlertAppender extends Appender {
        int pages = 0;
        AlertAppender() { super(Level.ERROR, new PlainFormatter()); }
        protected void write(LogEvent e) {
                pages++; System.out.println("ALERT   | paging on-call: " + e.message()); }
    }

    static class Logger {
        private final String name; private final Level min; private final Appender chain;
        private long clock = 0;
        Logger(String name, Level min, Appender chain) {
                this.name = name; this.min = min; this.chain = chain; }
        void log(Level l, String msg) {
                clock += 10; if (l.compareTo(min) >= 0) chain.handle(new LogEvent(clock, l,
                name, msg)); }
        void debug(String m) { log(Level.DEBUG, m); } void info(String m) { log(Level.INFO,
                m); }
        void warn(String m) { log(Level.WARN, m); } void error(String m) { log(Level.ERROR,
                m); }
    }
    static class LoggerFactory {
        private static final Map<String, Logger> loggers = new HashMap<>();
        static Logger get(String name, Level min, Appender chain) {
            return loggers.computeIfAbsent(name, n -> new Logger(n, min, chain));
        }
    }

    public static void main(String[] args) {
        ConsoleAppender console = new ConsoleAppender(Level.INFO, new PlainFormatter());
        MemoryFileAppender file = new MemoryFileAppender(Level.DEBUG, new JsonFormatter());
        AlertAppender alert = new AlertAppender();
        console.then(file).then(alert);
        Logger log = LoggerFactory.get("payment", Level.DEBUG, console);
        log.debug("charging card ending 4242");
        log.info("payment authorised");
        log.warn("gateway latency 1800 ms");
        log.error("settlement batch failed");
        System.out.println("same logger instance? " + (log == LoggerFactory.get("payment",
                Level.INFO, console)));
        System.out.println("file has " + file.lines.size() + " lines; first: "
                + file.lines.get(0));
        System.out.println("alerts sent: " + alert.pages);
    }
}
```

| Extension | Change |
|---|---|
| Asynchronous logging | Appenders put events on a bounded queue drained by a background thread (producer–consumer, Chapter 6) |
| Log rotation | The file appender switches files by size or date (a strategy) |
| Configuration file | Build loggers and chains from a config at start-up (a builder) |
| Structured context (request id) | A `ThreadLocal` map (MDC) added to every event |

## 8.3 Board games: snake and ladder, tic-tac-toe

### Snake and ladder

Requirements: a 100-square board with snakes and ladders, several players taking turns, a die, and an exact roll needed to land on 100. The die is an interface, so tests (and this book) can use a fixed sequence of rolls.

```java run Snake and ladder with an injectable die
import java.util.*;

public class Main {
    interface Dice { int roll(); }
    static class FixedDice implements Dice {
        private final int[] seq; private int i = 0;
        FixedDice(int... seq) { this.seq = seq; }
        public int roll() { return seq[i++ % seq.length]; }
    }
    static class RandomDice implements Dice {
        private final Random r; RandomDice(long seed) { r = new Random(seed); }
        public int roll() { return 1 + r.nextInt(6); }
    }

    static class Game {
        private final Map<Integer, Integer> jumps = new HashMap<>();   // snakes and ladders
        private final Deque<String> turns = new ArrayDeque<>();
        private final Map<String, Integer> pos = new LinkedHashMap<>();
        private final Dice dice; private final int size;
        Game(int size, Dice dice, List<String> players) {
            this.size = size; this.dice = dice;
            for (String p : players) { turns.add(p); pos.put(p, 0); }
        }
        void snake(int head, int tail) { jumps.put(head, tail); }
        void ladder(int foot, int top) { jumps.put(foot, top); }
        String play(int maxTurns, boolean verbose) {
            for (int t = 1; t <= maxTurns; t++) {
                String p = turns.poll();
                int roll = dice.roll(), from = pos.get(p), to = from + roll;
                String note = "";
                if (to > size) { to = from; note = " (needs exact roll)"; }
                else if (jumps.containsKey(to)) {
                    int dest = jumps.get(to);
                    note = dest > to ? " ladder to " + dest : " snake to " + dest;
                    to = dest;
                }
                pos.put(p, to);
                if (verbose) System.out.printf("  %-5s rolls %d: %3d -> %3d%s%n", p, roll,
                        from, to, note);
                if (to == size) return p + " wins on turn " + t;
                turns.add(p);
            }
            return "no winner after " + maxTurns + " turns, positions " + pos;
        }
    }

    public static void main(String[] args) {
        Game g = new Game(30, new FixedDice(3, 5, 5, 6, 2, 4), List.of("asha", "ravi"));
        g.ladder(3, 22); g.ladder(11, 26); g.snake(27, 1); g.snake(21, 9);
        System.out.println(g.play(20, true));
        Game big = new Game(100, new RandomDice(42), List.of("p1", "p2", "p3"));
        int[][] board = {{4, 14}, {9, 31}, {20, 38}, {28, 84}, {40, 59}, {51, 67}, {63, 81},
                {71, 91}};
        for (int[] l : board) big.ladder(l[0], l[1]);
        int[][] snakes = {{17, 7}, {54, 34}, {62, 19}, {64, 60}, {87, 24}, {93, 73}, {95,
                75}, {99, 78}};
        for (int[] s : snakes) big.snake(s[0], s[1]);
        System.out.println("100-square game (seed 42): " + big.play(1000, false));
    }
}
```

### Tic-tac-toe with O(1) win detection

Checking every row, column and diagonal after each move costs O(n). Keeping a counter per row, column and diagonal (+1 for X, −1 for O) detects a win in O(1): a player wins when any counter reaches ±n.

```java run N x N tic-tac-toe with O(1) win checks
public class Main {
    static class TicTacToe {
        private final int n; private final int[] rows, cols; private int diag, anti, moves;
        private final char[][] board;
        TicTacToe(int n) {
                this.n = n; rows = new int[n]; cols = new int[n]; board = new char[n][n]; }
        String move(char player, int r, int c) {
            if (board[r][c] != 0) return "cell taken";
            board[r][c] = player; moves++;
            int d = player == 'X' ? 1 : -1;
            rows[r] += d; cols[c] += d;
            if (r == c) diag += d;
            if (r + c == n - 1) anti += d;
            if (Math.abs(rows[r]) == n || Math.abs(cols[c]) == n || Math.abs(diag) == n
                    || Math.abs(anti) == n)
                return player + " wins";
            return moves == n * n ? "draw" : "ok";
        }
    }

    public static void main(String[] args) {
        TicTacToe g = new TicTacToe(3);
        int[][] script = {{0, 0}, {1, 1}, {0, 1}, {0, 2}, {2, 0}, {1, 0}, {2, 2}, {2, 1},
                {1, 2}};
        char p = 'X';
        for (int[] m : script) {
            String r = g.move(p, m[0], m[1]);
            System.out.println(p + " at (" + m[0] + "," + m[1] + "): " + r);
            if (!r.equals("ok")) break;
            p = p == 'X' ? 'O' : 'X';
        }
        TicTacToe g2 = new TicTacToe(3);
        int[][] win = {{0, 0}, {0, 1}, {1, 1}, {0, 2}, {2, 2}};
        String r = "";
        for (int i = 0; i < win.length; i++) r = g2.move(i % 2 == 0 ? 'X' : 'O', win[i][0],
                win[i][1]);
        System.out.println("second game, X takes the diagonal: " + r);
    }
}
```

## 8.4 Library management

### Requirements

1. A catalogue of titles, each with several physical copies.
2. Members borrow copies (at most 3 at a time) for 14 days, and pay a fine of Rs 5 per late day on return.
3. If every copy of a title is out, a member can reserve it; when a copy is returned it is held for the first person in the queue, who is notified.

### Design

`Book` (title, ISBN) versus `BookCopy` (barcode, status) separates the catalogue from physical items. `Library` enforces the rules. Reservations use a FIFO queue per title and an observer-style notification callback. Days are passed in as integers.

```java run Borrowing, fines and reservation queues
import java.util.*;
import java.util.function.Consumer;

public class Main {
    record Book(String isbn, String title) {}
    static class Copy {
        final String barcode; final Book book; String borrower; int due; String heldFor;
        Copy(String barcode, Book book) { this.barcode = barcode; this.book = book; }
    }

    static class Library {
        static final int MAX_LOANS = 3, LOAN_DAYS = 14, FINE_PER_DAY = 5;
        // isbn -> copies
        private final Map<String, List<Copy>> copies = new LinkedHashMap<>();
        private final Map<String, Deque<String>> reservations = new HashMap<>();
        private final Map<String, Integer> loans = new HashMap<>();
        private final Consumer<String> notifier;
        Library(Consumer<String> notifier) { this.notifier = notifier; }
        void addCopy(Book b, String barcode) { copies.computeIfAbsent(b.isbn(),
                k -> new ArrayList<>()).add(new Copy(barcode, b)); }

        String borrow(String member, String isbn, int today) {
            if (loans.getOrDefault(member, 0) >= MAX_LOANS) return member
                    + ": loan limit reached";
            for (Copy c : copies.get(isbn)) {
                boolean available = c.borrower == null && (c.heldFor == null
                        || c.heldFor.equals(member));
                if (available) {
                    c.borrower = member; c.due = today + LOAN_DAYS; c.heldFor = null;
                    loans.merge(member, 1, Integer::sum);
                    return member + " borrowed " + c.barcode + ", due day " + c.due;
                }
            }
            Deque<String> q = reservations.computeIfAbsent(isbn, k -> new ArrayDeque<>());
            if (!q.contains(member)) q.add(member);
            return member + ": all copies out, reserved (position " + q.size() + ")";
        }

        String giveBack(String barcode, int today) {
            for (List<Copy> list : copies.values())
                for (Copy c : list)
                    if (c.barcode.equals(barcode) && c.borrower != null) {
                        String who = c.borrower;
                        int fine = Math.max(0, today - c.due) * FINE_PER_DAY;
                        c.borrower = null; loans.merge(who, -1, Integer::sum);
                        Deque<String> q = reservations.getOrDefault(c.book.isbn(),
                                new ArrayDeque<>());
                        if (!q.isEmpty()) {
                            c.heldFor = q.poll();
                            notifier.accept(c.heldFor + ": '" + c.book.title()
                                    + "' is ready for pickup");
                        }
                        return who + " returned " + barcode + (fine > 0 ? ", fine Rs "
                                + fine : ", on time");
                    }
            return "unknown or not borrowed: " + barcode;
        }
    }

    public static void main(String[] args) {
        List<String> notifications = new ArrayList<>();
        Library lib = new Library(notifications::add);
        Book ddia = new Book("978-1449373320", "Designing Data-Intensive Applications");
        Book clean = new Book("978-0132350884", "Clean Code");
        lib.addCopy(ddia, "D-1"); lib.addCopy(ddia, "D-2"); lib.addCopy(clean, "C-1");
        System.out.println(lib.borrow("asha", ddia.isbn(), 1));
        System.out.println(lib.borrow("ravi", ddia.isbn(), 2));
        System.out.println(lib.borrow("neha", ddia.isbn(), 3));
        System.out.println(lib.borrow("sam", ddia.isbn(), 4));
        System.out.println(lib.giveBack("D-1", 20));
        System.out.println(lib.borrow("sam", ddia.isbn(), 21));   // copy is held for neha
        System.out.println(lib.borrow("neha", ddia.isbn(), 21));
        System.out.println(lib.giveBack("D-2", 10));
        notifications.forEach(n -> System.out.println("notify -> " + n));
    }
}
```

## 8.5 Notification service

### Requirements

1. Services publish events ("order shipped", "payment failed") to topics.
2. Users subscribe to topics and choose channels per topic (email, SMS, push).
3. If a channel fails, retry, then fall back to the next channel in the user's preference list.
4. Messages are built from templates.

### Design

Observer between topics and subscribers, Strategy for channels (each implements `send`), and a small retry-with-fallback loop. A fake channel that fails a fixed number of times makes failure handling testable.

```java run Topics, channel preferences, retries and fallback
import java.util.*;

public class Main {
    interface Channel { String name(); boolean send(String to, String text); }
    static class FlakyChannel implements Channel {   // fails the first N sends
        private final String name; private int failuresLeft;
        FlakyChannel(String name, int failures) {
                this.name = name; this.failuresLeft = failures; }
        public String name() { return name; }
        public boolean send(String to, String text) { return failuresLeft-- <= 0; }
    }
    record Subscription(String user, List<String> channels) {}

    static class NotificationService {
        private final Map<String, Channel> channels = new HashMap<>();
        private final Map<String, List<Subscription>> topics = new HashMap<>();
        private final Map<String, String> templates = new HashMap<>();
        private final List<String> audit = new ArrayList<>();
        void register(Channel c) { channels.put(c.name(), c); }
        void template(String topic, String t) { templates.put(topic, t); }
        void subscribe(String topic, String user, String... prefs) {
            topics.computeIfAbsent(topic, k -> new ArrayList<>()).add(new Subscription(user,
                    List.of(prefs)));
        }
        void publish(String topic, Map<String, String> data) {
            for (Subscription s : topics.getOrDefault(topic, List.of())) {
                String text = templates.get(topic);
                for (var e : data.entrySet()) text = text.replace("{" + e.getKey() + "}",
                        e.getValue());
                text = text.replace("{user}", s.user());
                deliver(s, text);
            }
        }
        private void deliver(Subscription s, String text) {
            for (String chName : s.channels()) {
                Channel ch = channels.get(chName);
                for (int attempt = 1; attempt <= 2; attempt++) {
                    if (ch.send(s.user(), text)) {
                        audit.add(s.user() + " <- " + chName + " (attempt " + attempt
                                + "): " + text);
                        return;
                    }
                }
                audit.add(s.user() + " x  " + chName + " failed twice, falling back");
            }
            audit.add(s.user() + " x  all channels failed, queued for later");
        }
    }

    public static void main(String[] args) {
        NotificationService svc = new NotificationService();
        svc.register(new FlakyChannel("push", 0));
        svc.register(new FlakyChannel("sms", 1));           // fails once, then works
        svc.register(new FlakyChannel("email", 5));         // down
        svc.template("order.shipped", "Hi {user}, order {id} has shipped via {carrier}.");
        svc.subscribe("order.shipped", "asha", "push", "email");
        svc.subscribe("order.shipped", "ravi", "email", "sms");
        svc.subscribe("order.shipped", "neha", "email");
        svc.publish("order.shipped", Map.of("id", "OD-1042", "carrier", "BlueDart"));
        svc.audit.forEach(System.out::println);
    }
}
```

| Extension | Change |
|---|---|
| Quiet hours and frequency caps | A filter (chain of responsibility) before delivery |
| Scale | Publish to a message queue; channel workers consume and send (System Design guide, Chapter 6) |
| Idempotency | A message id so retries never deliver twice |
| User preferences UI | Store subscriptions in a database; cache them per user |

## 8.6 In-memory key-value store with TTL

### Requirements

`put(key, value, ttl)`, `get(key)`, `delete(key)`; expired keys must never be returned; memory used by expired keys must be reclaimed even if nobody reads them.

### Design

Redis uses two complementary techniques, and so does this design:

- **Lazy expiry**: `get` checks the expiry time and deletes an expired key on the spot.
- **Active expiry**: a min-heap ordered by expiry time lets a periodic `cleanup(now)` remove expired keys cheaply, earliest first. Heap entries carry a version number, so an entry that was overwritten or deleted is skipped instead of removing the new value.

```java run A key-value store with lazy and active expiry
import java.util.*;

public class Main {
    static class TtlStore<K, V> {
        private record Entry<V>(V value, long expiresAt, long version) {}
        private record Expiry<K>(K key, long at, long version) {}
        private final Map<K, Entry<V>> map = new HashMap<>();
        private final PriorityQueue<Expiry<K>> heap =
                new PriorityQueue<>(Comparator.comparingLong(Expiry::at));
        private long versions = 0;

        synchronized void put(K key, V value, long ttl, long now) {
            long v = ++versions, at = ttl > 0 ? now + ttl : Long.MAX_VALUE;
            map.put(key, new Entry<>(value, at, v));
            if (ttl > 0) heap.add(new Expiry<>(key, at, v));
        }
        synchronized V get(K key, long now) {
            Entry<V> e = map.get(key);
            if (e == null) return null;
            if (e.expiresAt() <= now) { map.remove(key); return null; }   // lazy expiry
            return e.value();
        }
        synchronized boolean delete(K key) { return map.remove(key) != null; }
        synchronized int cleanup(long now) {   // active expiry
            int removed = 0;
            while (!heap.isEmpty() && heap.peek().at() <= now) {
                Expiry<K> x = heap.poll();
                Entry<V> e = map.get(x.key());
                if (e != null && e.version() == x.version()) {
                        map.remove(x.key()); removed++; }
            }
            return removed;
        }
        synchronized int size() { return map.size(); }
    }

    public static void main(String[] args) {
        TtlStore<String, String> s = new TtlStore<>();
        s.put("session:asha", "token-1", 1000, 0);
        s.put("session:ravi", "token-2", 3000, 0);
        s.put("config:theme", "dark", 0, 0);                      // no expiry
        s.put("otp:neha", "481516", 500, 0);
        System.out.println("t=400  otp:neha     -> " + s.get("otp:neha", 400));
        System.out.println("t=600  otp:neha     -> " + s.get("otp:neha", 600)
                + " (lazy expiry)");
        s.put("session:asha", "token-1b", 5000, 900);   // refreshed before expiring
        System.out.println("t=1500 cleanup removed " + s.cleanup(1500) + ", size "
                + s.size()
                + " (the stale heap entry for asha was skipped)");
        System.out.println("t=1500 session:asha -> " + s.get("session:asha", 1500));
        System.out.println("t=3500 cleanup removed " + s.cleanup(3500) + ", size "
                + s.size());
        System.out.println("t=9000 config:theme -> " + s.get("config:theme", 9000));
        System.out.println("t=9000 session:asha -> " + s.get("session:asha", 9000));
    }
}
```

The version check is the subtle part: Asha's session was refreshed at t = 900, so the heap still contains her old expiry at t = 1000. Without versions, the cleanup at t = 1500 would delete her fresh session.

| Extension | Change |
|---|---|
| Memory limit | Combine with the LRU cache of Section 7.2: evict least recently used keys when full |
| Persistence | Append every write to a log; replay at start-up (as Redis AOF does) |
| Concurrency at scale | Shard the map by key hash, one lock per shard (as `ConcurrentHashMap` does) |
| Replication and partitioning | The System Design guide's distributed cache case study |

# Chapter 9: Interview Checklist
%What to do in the room, the follow-ups to expect, and a pattern cheat sheet

## 9.1 The first five minutes

- Repeat the problem in your own words and list 4–6 functional requirements. Ask about scale, concurrency and what is out of scope.
- State assumptions explicitly and write them down.
- Name the core entities (nouns) and the main use cases (verbs) before writing any class.

## 9.2 While designing and coding

| Do | Avoid |
|---|---|
| Start with interfaces for things likely to change | A single class that does everything |
| Keep fields private; use records for value objects | Public mutable fields, setters for everything |
| Use enums for fixed sets (vehicle types, states) | Strings and magic numbers |
| Pass time and randomness in (clock, dice) | Calling `System.currentTimeMillis()` deep inside logic |
| Write a small `main` that exercises the happy path and one failure | Untestable code you cannot demonstrate |
| Explain each pattern by the problem it solves | Naming patterns for decoration |
| Handle invalid input and boundary cases (full, empty, duplicate) | Happy path only |

## 9.3 Common follow-up questions

| Follow-up | Strong answer pattern |
|---|---|
| "How would you add a new type?" | Show that it is one new class registered in a factory or map (OCP) |
| "Two users do X at the same time?" | Identify the shared state; atomic operation, lock per entity, or database constraint/conditional update |
| "How do you test this?" | Inject dependencies (clock, repository, notifier); unit-test strategies separately; one end-to-end test of the main flow |
| "What if it must run on several servers?" | Move state to a database or Redis; replace local locks with transactions, conditional updates or distributed locks with expiry |
| "How would you persist this?" | A repository interface with an in-memory version for tests and a database version for production |
| "What would you do with more time?" | Name concrete next steps: validation, metrics, configuration, error handling, concurrency tests |

## 9.4 Pattern cheat sheet

| If the problem says... | Reach for |
|---|---|
| "different ways to compute/pay/route" | Strategy |
| "notify when something changes" | Observer |
| "undo", "queue requests", "replay" | Command |
| "behaves differently in each status" | State |
| "only one instance" | Singleton (or one instance managed by DI) |
| "many optional parameters" | Builder |
| "create one of several types" | Factory |
| "families of objects that must match" | Abstract Factory |
| "incompatible interface", "legacy API" | Adapter |
| "add features in layers" | Decorator |
| "lazy load", "cache", "access control" | Proxy |
| "simplify a complex subsystem" | Facade |
| "tree of parts and wholes" | Composite |
| "pipeline of checks or handlers" | Chain of Responsibility |
| "two dimensions that vary independently" | Bridge |
| "millions of similar objects" | Flyweight |

## 9.5 Case-study quick reference

| Problem | Key entities | Patterns | Tricky part |
|---|---|---|---|
| Parking lot | Lot, Floor, Spot, Vehicle, Ticket | Strategy (allocation, pricing) | Spot allocation trade-offs; concurrent gates |
| LRU / LFU cache | Map + doubly linked list / frequency buckets | — | O(1) for every operation |
| Elevator | Elevator, Dispatcher, Request | Strategy, State | Dispatch cost function; SCAN order |
| Movie booking | Show, Seat, Hold, Booking | — | All-or-nothing seat holds with expiry |
| Splitwise | User, Expense, Split, Ledger | Strategy (split types) | Debt simplification; integer money |
| Vending machine | Machine, Product, Coin | State | Every action in every state |
| Rate limiter | Limiter per client | Strategy | Window boundary bursts; distributed counters |
| Logger | Logger, Appender, Formatter | Chain of Responsibility, Strategy, Factory | Level filtering at two places |
| Snake and ladder / tic-tac-toe | Board, Player, Dice | Strategy (dice) | Determinism; O(1) win check |
| Library | Book, Copy, Member, Reservation | Observer | Copies versus titles; holds for reservers |
| Notification service | Topic, Subscription, Channel | Observer, Strategy | Retries and fallback; idempotency |
| KV store with TTL | Map + expiry heap | — | Lazy plus active expiry; stale heap entries |
