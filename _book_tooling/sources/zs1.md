# Solutions
%Every coding and LLD answer compiled and run with its tests; estimates computed by programs

## Part 1 solutions

### Z1.1 Fix the brackets

Scan left to right keeping the number of unmatched `(`. A `)` with none open needs an inserted `(`; whatever remains open at the end needs that many `)`. O(n) time, O(1) space.

```java run Counting insertions in one pass
public class Main {
    static int insertions(String s) {
        int open = 0, added = 0;
        for (char c : s.toCharArray()) {
            if (c == '(') open++;
            else if (open > 0) open--;
            else added++;                              // a ')' with nothing to close
        }
        return added + open;
    }

    public static void main(String[] args) {
        for (String s : new String[]{"())", "(((", "()))((", "", "()()", ")("})
            System.out.printf("%-8s -> %d%n", "\"" + s + "\"", insertions(s));
    }
}
```

`")("` needs two insertions even though the counts of `(` and `)` are equal: a count-only answer is the trap here.

### Z1.2 Meeting rooms

Sort by start time and keep a min-heap of the end times of meetings in progress. Before placing a meeting, free the room whose meeting ended earliest if it ended by now. The heap's largest size is the answer. O(n log n).

```java run Rooms via a min-heap of end times
import java.util.*;

public class Main {
    static int rooms(int[][] meetings) {
        int[][] m = meetings.clone();
        Arrays.sort(m, Comparator.comparingInt(x -> x[0]));
        PriorityQueue<Integer> ends = new PriorityQueue<>();
        int most = 0;
        for (int[] x : m) {
            if (!ends.isEmpty() && ends.peek() <= x[0]) ends.poll();   // touching is fine
            ends.add(x[1]);
            most = Math.max(most, ends.size());
        }
        return most;
    }

    public static void main(String[] args) {
        System.out.println(rooms(new int[][]{{0, 30}, {5, 10}, {15, 20}}));
        System.out.println(rooms(new int[][]{{7, 10}, {2, 4}}));
        System.out.println(rooms(new int[][]{{1, 5}, {5, 9}, {9, 12}}));
        System.out.println(rooms(new int[][]{{1, 10}, {2, 9}, {3, 8}, {4, 7}}));
        System.out.println(rooms(new int[][]{}));
    }
}
```

A sweep over sorted start and end times (+1 at each start, −1 at each end, ends before starts at equal times) gives the same answer in the same complexity and is worth mentioning as an alternative.

### Z1.3 Spreading outage

Put every unpowered house in the BFS queue at the start (multi-source BFS) and spread level by level; each level is one minute. If powered houses remain at the end, they are unreachable. O(rows × columns).

```java run Multi-source BFS, one level per minute
import java.util.*;

public class Main {
    static int minutes(int[][] grid) {
        int rows = grid.length, cols = grid[0].length, powered = 0;
        int[][] g = new int[rows][];
        Deque<int[]> q = new ArrayDeque<>();
        for (int r = 0; r < rows; r++) {
            g[r] = grid[r].clone();
            for (int c = 0; c < cols; c++) {
                if (g[r][c] == 2) q.add(new int[]{r, c});
                if (g[r][c] == 1) powered++;
            }
        }
        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        int minute = 0;
        while (!q.isEmpty() && powered > 0) {
            minute++;
            for (int n = q.size(); n > 0; n--) {
                int[] cell = q.poll();
                for (int[] d : dirs) {
                    int r = cell[0] + d[0], c = cell[1] + d[1];
                    if (r < 0 || c < 0 || r >= rows || c >= cols || g[r][c] != 1) continue;
                    g[r][c] = 2; powered--; q.add(new int[]{r, c});
                }
            }
        }
        return powered == 0 ? minute : -1;
    }

    public static void main(String[] args) {
        System.out.println(minutes(new int[][]{{2, 1, 1}, {1, 1, 0}, {0, 1, 1}}));
        System.out.println(minutes(new int[][]{{2, 1, 1}, {0, 1, 1}, {1, 0, 1}}));
        System.out.println(minutes(new int[][]{{0, 2}}));
        System.out.println(minutes(new int[][]{{2, 1, 1, 1, 2}}));
    }
}
```

The last case shows why all sources start together: two outages meet in the middle after 2 minutes, where single-source thinking would say 3.

### Z1.4 Duplicate payments

Keep the last minute each payment ID was seen. A repeat within `k` minutes is flagged; either way the stored minute is updated. O(n) time; to bound memory, entries older than `k` minutes can be evicted with a queue, since the input is in time order.

```java run Repeats within k minutes, with a time-ordered eviction queue
import java.util.*;

public class Main {
    record Payment(String id, int minute) { }

    static List<String> duplicates(List<Payment> stream, int k) {
        Map<String, Integer> last = new HashMap<>();
        Deque<Payment> window = new ArrayDeque<>();
        List<String> flagged = new ArrayList<>();
        for (Payment p : stream) {
            while (!window.isEmpty() && window.peek().minute() < p.minute() - k) {
                Payment old = window.poll();           // too old to matter any more
                if (last.get(old.id()) == old.minute()) last.remove(old.id());
            }
            Integer prev = last.put(p.id(), p.minute());
            if (prev != null) flagged.add(p.id() + "@" + p.minute());
            window.add(p);
        }
        return flagged;
    }

    public static void main(String[] args) {
        List<Payment> s = List.of(new Payment("P1", 0), new Payment("P2", 1),
                                  new Payment("P1", 4), new Payment("P3", 5),
                                  new Payment("P2", 9), new Payment("P1", 10));
        System.out.println("k = 5: " + duplicates(s, 5));
        System.out.println("k = 8: " + duplicates(s, 8));
    }
}
```

With `k = 5`, P1 at minute 4 repeats minute 0 and P1 at minute 10 repeats minute 4 (6 minutes later, so not flagged), while P2's repeat is 8 minutes later. With `k = 8`, P2 at minute 9 and P1 at minute 10 are flagged too.

### Z1.5 Search a rotated array

At each step one half around `mid` is sorted. If the target lies within the sorted half's range, search there; otherwise search the other half. O(log n).

```java run Binary search that first finds the sorted half
public class Main {
    static int search(int[] a, int target) {
        int lo = 0, hi = a.length - 1;
        while (lo <= hi) {
            int mid = (lo + hi) >>> 1;
            if (a[mid] == target) return mid;
            if (a[lo] <= a[mid]) {                     // left half is sorted
                if (a[lo] <= target && target < a[mid]) hi = mid - 1; else lo = mid + 1;
            } else {                                   // right half is sorted
                if (a[mid] < target && target <= a[hi]) lo = mid + 1; else hi = mid - 1;
            }
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] a = {4, 5, 6, 7, 0, 1, 2};
        for (int t : new int[]{0, 4, 7, 2, 3})
            System.out.printf("search(%d) = %d%n", t, search(a, t));
        System.out.println("not rotated: " + search(new int[]{1, 3, 5}, 5));
        System.out.println("one element: " + search(new int[]{1}, 0));
    }
}
```

The `<=` in `a[lo] <= a[mid]` matters when `lo == mid` (two elements left); with `<` the search goes the wrong way for inputs like `[3, 1]`.

### Z1.6 Minimum window

Count what `t` needs, and slide a window over `s`: extend the right edge, and whenever the window contains everything (`missing == 0`), shrink from the left while it stays valid, recording the shortest. Each index enters and leaves once: O(|s| + |t|).

```java run Sliding window with a count of missing characters
public class Main {
    static String minWindow(String s, String t) {
        int[] need = new int[128];
        for (char c : t.toCharArray()) need[c]++;
        int missing = t.length(), bestStart = 0, bestLen = Integer.MAX_VALUE;
        for (int left = 0, right = 0; right < s.length(); right++) {
            if (need[s.charAt(right)]-- > 0) missing--;
            while (missing == 0) {
                if (right - left + 1 < bestLen) {
                    bestLen = right - left + 1;
                    bestStart = left;
                }
                if (++need[s.charAt(left++)] > 0) missing++;   // dropping a needed character
            }
        }
        if (bestLen == Integer.MAX_VALUE) return "";
        return s.substring(bestStart, bestStart + bestLen);
    }

    public static void main(String[] args) {
        System.out.println("\"" + minWindow("ADOBECODEBANC", "ABC") + "\"");
        System.out.println("\"" + minWindow("aa", "aa") + "\"");
        System.out.println("\"" + minWindow("a", "aa") + "\"");
        System.out.println("\"" + minWindow("cabwefgewcwaefgcf", "cae") + "\"");
    }
}
```

The `need` array goes negative for surplus characters, which is what lets one counter (`missing`) track validity. The `"aa"` / `"a"` cases test multiplicity, the most common mistake.

## Part 2 solutions

### Z2.1 An in-memory URL shortener

```java run Generated codes, validated aliases and expiry with an injected clock
import java.time.*;
import java.util.*;

public class Main {
    static class Shortener {
        private static final String ALPHABET =
            "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        record Entry(String url, Instant expires) { }
        private final Map<String, Entry> codes = new HashMap<>();
        private final Clock clock;
        private final Duration ttl;
        private long counter = 100_000;                // start where codes have 3+ characters

        Shortener(Clock clock, Duration ttl) { this.clock = clock; this.ttl = ttl; }

        static String base62(long n) {
            StringBuilder sb = new StringBuilder();
            do { sb.append(ALPHABET.charAt((int) (n % 62))); n /= 62; } while (n > 0);
            return sb.reverse().toString();
        }

        String shorten(String url) {
            String code;
            do { code = base62(counter++); } while (codes.containsKey(code));   // skip taken
            return store(code, url);
        }

        String shorten(String url, String alias) {
            if (!alias.matches("[A-Za-z0-9-]{4,30}"))
                throw new IllegalArgumentException("alias: 4-30 letters, digits or '-'");
            Entry existing = codes.get(alias);
            if (existing != null && existing.expires().isAfter(clock.instant()))
                throw new IllegalStateException("alias taken: " + alias);
            return store(alias, url);
        }

        private String store(String code, String url) {
            if (!url.startsWith("https://") && !url.startsWith("http://"))
                throw new IllegalArgumentException("not an http(s) URL");
            codes.put(code, new Entry(url, clock.instant().plus(ttl)));
            return code;
        }

        Optional<String> resolve(String code) {
            Entry e = codes.get(code);
            if (e == null || !e.expires().isAfter(clock.instant())) return Optional.empty();
            return Optional.of(e.url());
        }
    }

    static class MutableClock extends Clock {
        Instant now = Instant.parse("2026-10-09T10:00:00Z");
        public Instant instant() { return now; }
        public ZoneId getZone() { return ZoneOffset.UTC; }
        public Clock withZone(ZoneId z) { return this; }
    }

    public static void main(String[] args) {
        MutableClock clock = new MutableClock();
        Shortener s = new Shortener(clock, Duration.ofDays(30));
        String a = s.shorten("https://example.com/placements/2026");
        String b = s.shorten("https://example.com/results");
        System.out.println("generated: " + a + ", " + b);
        String alias = s.shorten("https://example.com/drive", "tcs-drive");
        System.out.println("alias:     " + alias);
        try { s.shorten("https://example.com/other", "tcs-drive"); }
        catch (IllegalStateException e) { System.out.println("refused: " + e.getMessage()); }
        try { s.shorten("https://example.com", "a b"); }
        catch (IllegalArgumentException e) {
            System.out.println("refused: " + e.getMessage());
        }
        System.out.println("resolve:   " + s.resolve(a).orElse("(none)"));
        clock.now = clock.now.plus(Duration.ofDays(31));
        System.out.println("after 31 days: " + s.resolve(a).orElse("(expired)"));
        System.out.println("alias reusable after expiry: "
                           + s.shorten("https://example.com/new", "tcs-drive"));
    }
}
```

Points to make: sequential codes are guessable (use a random or encrypted counter if links must not be enumerable); the `do ... while` skips codes already taken as custom aliases; the clock is injected so expiry is tested by moving time, not by waiting. At scale this class becomes the HLD guide's URL shortener (Chapter 9.1).

### Z2.2 A game leaderboard

```java run Score map plus an ordered set of (score, name)
import java.util.*;

public class Main {
    static class Leaderboard {
        record Row(String player, long score) { }
        private static final Comparator<Row> ORDER =
            Comparator.comparingLong(Row::score).reversed().thenComparing(Row::player);
        private final Map<String, Long> scores = new HashMap<>();
        private final TreeSet<Row> ranking = new TreeSet<>(ORDER);

        void addScore(String player, long points) {
            Long old = scores.get(player);
            if (old != null) ranking.remove(new Row(player, old));
            long now = (old == null ? 0 : old) + points;
            scores.put(player, now);
            ranking.add(new Row(player, now));
        }

        List<String> top(int k) {
            return ranking.stream().limit(k).map(r -> r.player() + " " + r.score()).toList();
        }

        int rank(String player) {                      // 1-based; O(n) with a TreeSet
            return ranking.headSet(new Row(player, scores.get(player))).size() + 1;
        }
    }

    public static void main(String[] args) {
        Leaderboard lb = new Leaderboard();
        lb.addScore("asha", 50); lb.addScore("ravi", 70); lb.addScore("meera", 70);
        lb.addScore("asha", 30); lb.addScore("zoya", 10);
        System.out.println("top 3: " + lb.top(3));
        for (String p : List.of("asha", "meera", "ravi", "zoya"))
            System.out.println(p + " rank " + lb.rank(p));
    }
}
```

`addScore` and `top(k)` are O(log n) and O(k). `rank` is O(n) here because `TreeSet.headSet().size()` walks the elements; at 10 million players use an order-statistic structure (a Fenwick tree over score buckets, or a skip list with span counts as in Redis sorted sets, whose `ZREVRANK` is O(log n)). That trade-off is the discussion interviewers want.

### Z2.3 A coupon engine

```java run Coupons as strategies; the engine picks the best
import java.util.*;

public class Main {
    record Item(String sku, long pricePaise, int qty) { }
    record Cart(List<Item> items) {
        long total() { return items.stream().mapToLong(i -> i.pricePaise() * i.qty()).sum(); }
    }

    interface Coupon {
        String name();
        long discount(Cart cart);                      // paise; 0 if it does not apply
    }

    record FlatOff(long off, long minTotal) implements Coupon {
        public String name() { return "FLAT" + off / 100; }
        public long discount(Cart c) { return c.total() > minTotal ? off : 0; }
    }

    record PercentOff(int percent, long cap) implements Coupon {
        public String name() { return percent + "%OFF"; }
        public long discount(Cart c) { return Math.min(c.total() * percent / 100, cap); }
    }

    record BuyTwoGetCheaperFree(String sku) implements Coupon {
        public String name() { return "B2G1-" + sku; }
        public long discount(Cart c) {                 // every second unit is free
            return c.items().stream().filter(i -> i.sku().equals(sku))
                    .mapToLong(i -> (i.qty() / 2) * i.pricePaise()).sum();
        }
    }

    static Optional<Map.Entry<String, Long>> best(Cart cart, List<Coupon> coupons) {
        return coupons.stream()
            .map(c -> Map.entry(c.name(), Math.min(c.discount(cart), cart.total())))
            .filter(e -> e.getValue() > 0)
            .max(Map.Entry.<String, Long>comparingByValue()
                     .thenComparing(Map.Entry.comparingByKey(Comparator.reverseOrder())));
    }

    public static void main(String[] args) {
        List<Coupon> coupons = List.of(new FlatOff(10_000, 99_900),
                                       new PercentOff(10, 25_000),
                                       new BuyTwoGetCheaperFree("TSHIRT"));
        Cart small = new Cart(List.of(new Item("MUG", 45_000, 1)));
        Cart mid = new Cart(List.of(new Item("SHOES", 120_000, 1)));
        Cart big = new Cart(List.of(new Item("LAPTOP", 5_000_000, 1)));
        Cart shirts = new Cart(List.of(new Item("TSHIRT", 79_900, 2),
                                       new Item("CAP", 30_000, 1)));
        for (var e : List.of(Map.entry("Rs 450 mug", small), Map.entry("Rs 1,200 shoes", mid),
                             Map.entry("Rs 50,000 laptop", big),
                             Map.entry("2 shirts + cap", shirts))) {
            String verdict = best(e.getValue(), coupons)
                .map(b -> b.getKey() + " saves Rs " + b.getValue() / 100).orElse("none");
            System.out.printf("%-17s best: %s%n", e.getKey(), verdict);
        }
    }
}
```

The output also tells the business something: the flat ₹100 coupon wins only for carts between ₹999.01 and ₹999.99, because from ₹1,000 upwards 10% is worth at least as much. Each coupon type is a class implementing one interface (strategy pattern), so a new type never touches `best`. Deliberate decisions to state: discounts never exceed the cart total; ties pick a deterministic winner; the B2G1 rule assumes one SKU so "the cheaper one" is the same price (with mixed SKUs, sort the eligible units by price and make every second-cheapest unit free). Stacking rules (which coupons combine) would be a policy object passed to the engine.

### Z2.4 A connection pool

```java run A blocking-queue pool, tested with 10 threads and a timeout
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {
    static class Connection {
        final int id;
        Connection(int id) { this.id = id; }
    }

    static class Pool {
        private final BlockingQueue<Connection> idle;
        private final Set<Connection> lent = ConcurrentHashMap.newKeySet();

        Pool(int size) {
            idle = new ArrayBlockingQueue<>(size);
            for (int i = 0; i < size; i++) idle.add(new Connection(i));
        }

        Optional<Connection> acquire(long timeoutMs) throws InterruptedException {
            Connection c = idle.poll(timeoutMs, TimeUnit.MILLISECONDS);
            if (c != null) lent.add(c);
            return Optional.ofNullable(c);
        }

        void release(Connection c) {
            if (!lent.remove(c)) throw new IllegalStateException("not lent by this pool");
            idle.add(c);
        }
    }

    public static void main(String[] args) throws Exception {
        Pool pool = new Pool(3);
        AtomicInteger inUse = new AtomicInteger(), maxInUse = new AtomicInteger();
        AtomicInteger served = new AtomicInteger();
        ExecutorService workers = Executors.newFixedThreadPool(10);
        for (int t = 0; t < 10; t++) {
            workers.submit(() -> {
                for (int i = 0; i < 200; i++) {
                    Connection c = pool.acquire(10_000).orElseThrow();
                    maxInUse.accumulateAndGet(inUse.incrementAndGet(), Math::max);
                    inUse.decrementAndGet();
                    served.incrementAndGet();
                    pool.release(c);
                }
                return null;
            });
        }
        workers.shutdown();
        boolean done = workers.awaitTermination(60, TimeUnit.SECONDS);
        System.out.println("all work finished: " + done);
        System.out.println("requests served: " + served.get());
        System.out.println("never more than 3 lent at once: " + (maxInUse.get() <= 3));

        List<Connection> held = new ArrayList<>();
        for (int i = 0; i < 3; i++) held.add(pool.acquire(100).orElseThrow());
        System.out.println("fourth acquire times out: " + pool.acquire(50).isEmpty());
        try { pool.release(new Connection(99)); }
        catch (IllegalStateException e) {
            System.out.println("foreign release refused: " + e.getMessage());
        }
    }
}
```

`ArrayBlockingQueue.poll(timeout)` provides the waiting, fairness of wake-up and the timeout; the `lent` set catches double or foreign releases. Production pools (HikariCP) add validation of connections before lending, maximum lifetime, leak detection and metrics (JDBC guide, Chapter 4).

### Z2.5 An issue tracker

| Class | Responsibility |
|---|---|
| `Project` | Key, name, admins, members, issue types it uses |
| `IssueType` | Name (bug, story, task) and the `Workflow` it follows |
| `Workflow` | Statuses and allowed transitions as **data**: `Map<Status, Set<Status>>` |
| `Issue` | Key (`PAY-142`), type, title, description, status, assignee, reporter, comments, history |
| `Comment`, `HistoryEntry` | Author, time, text or change (field, old value, new value) |
| `PermissionPolicy` | `canTransition(user, issue)`: assignee or project admin; `canComment`: any member |
| `IssueService` | Use cases: create, assign, transition (checks policy and workflow, records history, publishes an event), comment |

```text
 Project 1 ── * Issue * ── 1 IssueType 1 ── 1 Workflow
                 │ 1                           (Map<Status, Set<Status>>)
                 ├── * Comment
                 └── * HistoryEntry
 IssueService ──uses──> PermissionPolicy, Workflow, EventPublisher (notifications)
```

Strong answers point out that workflows are **configuration, not code**: a bug may go `OPEN → IN_PROGRESS → IN_REVIEW → DONE` with `REOPENED`, while a task skips review, and project admins can change workflows without a deploy. `transition()` is a single method that validates permission, then the workflow, then records history and emits an event, so every change is audited. Concurrency: two users moving the same issue at once are handled with optimistic locking (a version number on `Issue`). Likely extension questions: custom fields (a `Map<FieldId, Value>` with field definitions per project), and search (a separate index updated from events).
