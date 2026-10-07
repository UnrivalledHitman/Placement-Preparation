## Part 7 solutions

### L7.1 Parking lot: EV spots and a size-first allocator

```java run EV spots, charging fees and size-first allocation
import java.util.*;

public class Main {
    enum Type { BIKE, CAR, EV_CAR, TRUCK }
    enum Size { BIKE, COMPACT, EV, LARGE }   // declared in increasing size
    record Vehicle(String plate, Type type) {}
    static class Spot {
        final int floor, no; final Size size; Vehicle occupant;
        Spot(int f, int n, Size s) { floor = f; no = n; size = s; }
        boolean fits(Vehicle v) {
            return switch (v.type()) {
                case BIKE -> size != Size.EV;
                case CAR -> size == Size.COMPACT || size == Size.LARGE;
                case EV_CAR -> size == Size.EV || size == Size.COMPACT
                        || size == Size.LARGE;
                case TRUCK -> size == Size.LARGE;
            };
        }
        public String toString() { return "F" + floor + "-" + size + "-" + no; }
    }
    interface Allocator { Optional<Spot> pick(List<Spot> spots, Vehicle v); }
    static class SizeFirst implements Allocator {   // smallest fitting size, then nearest
        public Optional<Spot> pick(List<Spot> spots, Vehicle v) {
            Comparator<Spot> pref = Comparator.comparing((Spot s) -> v.type() == Type.EV_CAR
                    && s.size == Size.EV ? -1 : s.size.ordinal())
                    .thenComparingInt(s -> s.floor).thenComparingInt(s -> s.no);
            return spots.stream().filter(s -> s.occupant == null && s.fits(v)).min(pref);
        }
    }
    static int fee(Vehicle v, Spot s, int minutes, int chargedMinutes) {
        int hours = Math.max(1, (minutes + 59) / 60);
        int base = switch (v.type()) {
                case BIKE -> 20 * hours; case TRUCK -> 100 * hours; default -> 50 * hours; };
        int charging = s.size == Size.EV ? 15 * Math.max(1, (chargedMinutes + 59) / 60) : 0;
        return base + charging;
    }

    public static void main(String[] args) {
        List<Spot> spots = new ArrayList<>();
        int n = 1;
        for (Size s : List.of(Size.LARGE, Size.COMPACT, Size.EV, Size.LARGE,
                Size.BIKE)) spots.add(new Spot(0, n++, s));
        Allocator a = new SizeFirst();
        Map<String, Spot> parked = new LinkedHashMap<>();
        for (Vehicle v : List.of(new Vehicle("CAR-1", Type.CAR), new Vehicle("EV-1",
                Type.EV_CAR),
                new Vehicle("BIKE-1", Type.BIKE), new Vehicle("TRUCK-1", Type.TRUCK),
                        new Vehicle("TRUCK-2", Type.TRUCK),
                new Vehicle("CAR-2", Type.CAR))) {
            Optional<Spot> s = a.pick(spots, v);
            s.ifPresent(x -> { x.occupant = v; parked.put(v.plate(), x); });
            System.out.println(v.plate() + " -> " + s.map(Spot::toString)
                    .orElse("no suitable spot"));
        }
        System.out.println("EV-1 fee for 150 min with 90 min charging: Rs "
                + fee(new Vehicle("EV-1", Type.EV_CAR), parked.get("EV-1"), 150, 90));
    }
}
```

The car takes the compact spot and the bike the bike spot, so both large spots remain for the two trucks. With the nearest-first allocator from the guide, the first car would have taken large spot 1 and the second truck would have been refused. The EV pays 3 hours of parking (Rs 150) plus 2 hours of charging (Rs 30).

### L7.2 An LRU cache with TTL

```java run Recency eviction plus per-entry expiry
import java.util.*;

public class Main {
    static class TtlLru<K, V> {
        private record Entry<V>(V value, long expiresAt) {}
        private final int capacity;
        // access order
        private final LinkedHashMap<K, Entry<V>> map = new LinkedHashMap<>(16, 0.75f, true);
        TtlLru(int capacity) { this.capacity = capacity; }
        V get(K k, long now) {
            Entry<V> e = map.get(k);   // also marks k as most recently used
            if (e == null) return null;
            if (e.expiresAt() <= now) { map.remove(k); return null; }
            return e.value();
        }
        String put(K k, V v, long ttl, long now) {
            map.put(k, new Entry<>(v, now + ttl));
            if (map.size() <= capacity) return "";
            // drop expired entries first
            map.values().removeIf(e -> e.expiresAt() <= now);
            if (map.size() <= capacity) return " (made room by dropping expired entries)";
            K eldest = map.keySet().iterator().next();
            map.remove(eldest);
            return " (evicted LRU " + eldest + ")";
        }
        Set<K> keys() { return map.keySet(); }
    }

    public static void main(String[] args) {
        TtlLru<String, String> c = new TtlLru<>(3);
        System.out.println("put a" + c.put("a", "1", 1000, 0));
        System.out.println("put b" + c.put("b", "2", 100, 0));
        System.out.println("put c" + c.put("c", "3", 1000, 0));
        System.out.println("get a at 50 -> " + c.get("a", 50));
        System.out.println("put d at 60" + c.put("d", "4", 1000, 60));
        System.out.println("get b at 200 -> " + c.get("b", 200) + " (expired)");
        System.out.println("put e at 300" + c.put("e", "5", 1000, 300) + ", keys "
                + c.keys());
        System.out.println("put f at 400" + c.put("f", "6", 1000, 400) + ", keys "
                + c.keys());
    }
}
```

At t = 60 the cache is full and nothing has expired, so `b`, the least recently used key (`a` was read at t = 50), is evicted; its pending expiry no longer matters. Later inserts evict by recency again. Dropping expired entries before evicting a live one is a cheap improvement that protects useful data.

### L7.3 Seat categories and coupons

```java run Category prices with coupon strategies
import java.util.*;

public class Main {
    enum Category {
        RECLINER(450), GOLD(300), SILVER(200);
        final int price; Category(int p) { price = p; }
    }
    interface Coupon { int discount(int amount); String code(); }
    record Flat(String code, int off, int minAmount) implements Coupon {
        public int discount(int amt) { return amt >= minAmount ? Math.min(off, amt) : 0; }
    }
    record PercentCapped(String code, int pct, int cap) implements Coupon {
        public int discount(int amt) { return Math.min(cap, amt * pct / 100); }
    }
    static String price(Map<String, Category> seats, Optional<Coupon> coupon) {
        int gross = seats.values().stream().mapToInt(c -> c.price).sum();
        int off = coupon.map(c -> c.discount(gross)).orElse(0);
        int fee = 30 * seats.size();   // convenience fee per ticket
        return seats.keySet() + " gross " + gross + " - " + coupon.map(Coupon::code)
                .orElse("no coupon")
                + " " + off + " + fee " + fee + " = Rs " + (gross - off + fee);
    }

    public static void main(String[] args) {
        Map<String, Category> b1 = new LinkedHashMap<>(Map.of("R1", Category.RECLINER));
        b1.put("R2", Category.RECLINER);
        Map<String, Category> b2 = new LinkedHashMap<>();
        b2.put("G5", Category.GOLD); b2.put("G6", Category.GOLD); b2.put("S1",
                Category.SILVER);
        System.out.println(price(b1, Optional.of(new PercentCapped("FEST20", 20, 150))));
        System.out.println(price(b2, Optional.of(new Flat("FLAT100", 100, 500))));
        System.out.println(price(b2, Optional.empty()));
    }
}
```

The percentage coupon is capped at Rs 150, although 20% of Rs 900 would be Rs 180. Coupons apply to the ticket price, not to fees, which is a business rule worth stating explicitly in an interview.

### L7.4 Splitwise groups

```java run Balances and settlements per group
import java.util.*;

public class Main {
    static class Group {
        final String name; final Map<String, Long> net = new TreeMap<>();
        Group(String name) { this.name = name; }
        void expense(String payer, long paise, List<String> among) {
            net.merge(payer, paise, Long::sum);
            long each = paise / among.size(), rem = paise % among.size();
            for (int i = 0; i < among.size(); i++) net.merge(among.get(i), -(each
                    + (i < rem ? 1 : 0)), Long::sum);
        }
        List<String> settle() {
            List<String> out = new ArrayList<>();
            Map<String, Long> m = new TreeMap<>(net);
            while (true) {
                String cr = null, dr = null;
                for (var e : m.entrySet()) {
                    if (cr == null || e.getValue() > m.get(cr)) cr = e.getKey();
                    if (dr == null || e.getValue() < m.get(dr)) dr = e.getKey();
                }
                long amt = Math.min(m.get(cr), -m.get(dr));
                if (amt <= 0) return out;
                out.add(dr + " pays " + cr + " Rs " + amt / 100);
                m.merge(cr, -amt, Long::sum); m.merge(dr, amt, Long::sum);
            }
        }
    }

    public static void main(String[] args) {
        Group flat = new Group("flatmates"), trip = new Group("goa-trip");
        // rent share Rs 3000
        flat.expense("asha", 300_000, List.of("asha", "ravi", "neha"));
        flat.expense("ravi", 90_000, List.of("asha", "ravi", "neha"));   // groceries
        trip.expense("neha", 1_200_000, List.of("neha", "sam"));                 // hotel
        trip.expense("sam", 400_000, List.of("neha", "sam"));                    // cabs
        for (Group g : List.of(flat, trip)) System.out.println(g.name + ": " + g.settle());
        Map<String, Long> overall = new TreeMap<>();
        for (Group g : List.of(flat, trip)) g.net.forEach((u, v) -> overall.merge(u, v,
                Long::sum));
        System.out.println("neha overall (paise): " + overall.get("neha"));
    }
}
```

Neha belongs to both groups: she owes money in the flat group and is owed money on the trip. Per-group settlement keeps each group's accounts separate, which is what users expect, while an overall view can still net them out.

### L7.5 Plan-based rate limits

```java run Token buckets parameterised by plan
import java.util.*;

public class Main {
    record Plan(String name, int burst, double tokensPerSecond) {}
    static class PlanLimiter {
        private final Map<String, Plan> plans = new HashMap<>();
        // {tokens, lastRefillMs}
        private final Map<String, double[]> buckets = new HashMap<>();
        synchronized void setPlan(String client, Plan p) {
            plans.put(client, p);
            buckets.computeIfPresent(client, (k, b) -> new double[] {Math.min(b[0],
                    p.burst()), b[1]});
        }
        synchronized boolean allow(String client, long now) {
            Plan p = plans.get(client);
            double[] b = buckets.computeIfAbsent(client, k -> new double[] {p.burst(),
                    now});
            b[0] = Math.min(p.burst(), b[0] + (now - b[1]) / 1000.0 * p.tokensPerSecond());
            b[1] = now;
            if (b[0] < 1) return false;
            b[0] -= 1; return true;
        }
    }

    public static void main(String[] args) {
        Plan free = new Plan("free", 5, 0.5), pro = new Plan("pro", 20, 2);
        PlanLimiter lim = new PlanLimiter();
        lim.setPlan("acme", free);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 10; i++) sb.append(lim.allow("acme", i * 100L) ? 'Y' : '.');
        System.out.println("free, 10 requests in 1 s : " + sb);
        lim.setPlan("acme", pro);   // upgrade at run time
        sb.setLength(0);
        for (int i = 0; i < 10; i++) sb.append(lim.allow("acme", 3000
                + i * 100L) ? 'Y' : '.');
        System.out.println("pro, after 2 s, 10 in 1 s: " + sb);
    }
}
```

After the upgrade the bucket keeps its current tokens but refills at the faster pro rate and may grow to the larger burst. Keeping the plan separate from the bucket state is what makes a live upgrade a one-line change.

### L7.6 Vending machine change-making

```java run Refusing sales it cannot make change for
import java.util.*;

public class Main {
    static class CoinBox {
        private final TreeMap<Integer,
                Integer> coins = new TreeMap<>(Comparator.reverseOrder());
        void add(int coin, int count) { coins.merge(coin, count, Integer::sum); }
        Optional<Map<Integer, Integer>> change(int amount) {   // greedy, without committing
            Map<Integer, Integer> plan = new LinkedHashMap<>();
            for (var e : coins.entrySet()) {
                int use = Math.min(e.getValue(), amount / e.getKey());
                if (use > 0) { plan.put(e.getKey(), use); amount -= use * e.getKey(); }
            }
            return amount == 0 ? Optional.of(plan) : Optional.empty();
        }
        void remove(Map<Integer, Integer> plan) { plan.forEach((c, n) -> coins.merge(c, -n,
                Integer::sum)); }
        public String toString() { return coins.toString(); }
    }
    static String buy(CoinBox box, int price, List<Integer> paid) {
        int total = paid.stream().mapToInt(Integer::intValue).sum();
        if (total < price) return "not enough money, refund " + paid;
        paid.forEach(c -> box.add(c, 1));   // inserted coins can be used as change
        Optional<Map<Integer, Integer>> plan = box.change(total - price);
        if (plan.isEmpty()) {
            paid.forEach(c -> box.add(c, -1));
            return "cannot make change of " + (total - price) + ", sale refused, refund "
                    + paid;
        }
        box.remove(plan.get());
        return "sold, change " + plan.get();
    }

    public static void main(String[] args) {
        CoinBox box = new CoinBox();
        box.add(5, 1); box.add(2, 1);
        System.out.println(buy(box, 15, List.of(20)) + " | box " + box);
        System.out.println(buy(box, 15, List.of(20)) + " | box " + box);
        System.out.println(buy(box, 18, List.of(10, 10)) + " | box " + box);
        System.out.println(buy(box, 12, List.of(10, 5)) + " | box " + box);
    }
}
```

The change plan is computed **before** committing anything, and the inserted coins are added to the box first because they may be needed as change. Greedy change-making is optimal for these Indian denominations; for arbitrary denominations (say 1, 3, 4) it can fail when a solution exists, and dynamic programming is needed.

## Part 8 solutions

### L8.1 Meeting room booking

Requirements recap: rooms with capacity; book an interval; reject overlaps per room; find any free room for a group size; cancel. Key design choice: per room, keep bookings in a `TreeMap<start, Booking>`. A new interval [s, e) conflicts only with the booking that starts just before s (if it ends after s) or the one that starts in [s, e): two O(log n) lookups.

```java run Rooms with O(log n) conflict checks
import java.util.*;

public class Main {
    record Booking(int id, String room, String user, int start, int end) {}
    static class Room {
        final String name; final int capacity;
        final TreeMap<Integer, Booking> byStart = new TreeMap<>();
        Room(String name, int capacity) { this.name = name; this.capacity = capacity; }
        boolean free(int s, int e) {
            Map.Entry<Integer, Booking> before = byStart.floorEntry(s);
            if (before != null && before.getValue().end() > s) return false;
            Map.Entry<Integer, Booking> after = byStart.ceilingEntry(s);
            return after == null || after.getKey() >= e;
        }
    }
    static class Scheduler {
        private final Map<String, Room> rooms = new LinkedHashMap<>();
        private final Map<Integer, Booking> bookings = new HashMap<>();
        private int nextId = 1;
        void addRoom(String n, int cap) { rooms.put(n, new Room(n, cap)); }
        synchronized Optional<Booking> book(String room, String user, int s, int e) {
            if (s >= e) throw new IllegalArgumentException("empty interval");
            Room r = rooms.get(room);
            if (!r.free(s, e)) return Optional.empty();
            Booking b = new Booking(nextId++, room, user, s, e);
            r.byStart.put(s, b); bookings.put(b.id(), b);
            return Optional.of(b);
        }
        synchronized Optional<Booking> bookAny(String user, int people, int s, int e) {
            return rooms.values().stream().filter(r -> r.capacity >= people && r.free(s, e))
                    // smallest room that fits
                    .min(Comparator.comparingInt(r -> r.capacity))
                    .flatMap(r -> book(r.name, user, s, e));
        }
        synchronized boolean cancel(int id) {
            Booking b = bookings.remove(id);
            return b != null && rooms.get(b.room()).byStart.remove(b.start()) != null;
        }
    }

    public static void main(String[] args) {
        Scheduler s = new Scheduler();
        s.addRoom("Ganga", 4); s.addRoom("Yamuna", 8); s.addRoom("Board", 20);
        System.out.println(s.book("Ganga", "asha", 900, 1000));
        System.out.println(s.book("Ganga", "ravi", 930, 1030) + "  <- overlaps");
        System.out.println(s.book("Ganga", "ravi", 1000, 1030) + "  <- touching is fine");
        System.out.println(s.bookAny("neha", 6, 900, 1000));
        System.out.println(s.bookAny("sam", 6, 930, 1000));
        System.out.println("cancel 1: " + s.cancel(1) + ", then " + s.book("Ganga", "zoya",
                915, 945));
    }
}
```

Discuss as extensions: recurring meetings (expand into instances, or store a rule), notifications (observer), and persistence (an index on `(room_id, start_time)` plus a database exclusion constraint, which PostgreSQL supports directly for ranges).

### L8.2 Cab booking (Uber-lite)

Classes: `Rider`, `Driver` (location, available), `Ride` (with a `RideStatus` enum enforcing legal transitions), `MatchingStrategy` (nearest available driver), `FareStrategy` (base + per km, surge). `RideService` coordinates. Matching must be atomic: two simultaneous requests must not grab the same driver.

```java run Matching, ride states and fares
import java.util.*;

public class Main {
    record Point(int x, int y) { double dist(Point o) { return Math.hypot(x - o.x, y - o.y);
            } }
    enum RideStatus {
        REQUESTED, ACCEPTED, STARTED, COMPLETED, CANCELLED;
        boolean canMoveTo(RideStatus n) {
            return switch (this) {
                case REQUESTED -> n == ACCEPTED || n == CANCELLED;
                case ACCEPTED -> n == STARTED || n == CANCELLED;
                case STARTED -> n == COMPLETED;
                default -> false;
            };
        }
    }
    static class Driver {
        final String name; Point at; boolean available = true;
        Driver(String n, Point p) { name = n; at = p; }
    }
    static class Ride {
        final int id; final String rider; final Point from,
                to; Driver driver; RideStatus status = RideStatus.REQUESTED;
        Ride(int id, String rider, Point f, Point t) {
                this.id = id; this.rider = rider; from = f; to = t; }
        void move(RideStatus n) {
            if (!status.canMoveTo(n)) throw new IllegalStateException("ride " + id + ": "
                    + status + " -> " + n);
            status = n;
        }
    }
    interface FareStrategy { double fare(double km); }
    static class RideService {
        private final List<Driver> drivers;
        private final FareStrategy fares;
        private int nextId = 1;
        RideService(List<Driver> d, FareStrategy f) { drivers = d; fares = f; }
        synchronized Optional<Ride> request(String rider, Point from, Point to) {
            Optional<Driver> d = drivers.stream().filter(x -> x.available)
                    .min(Comparator.comparingDouble((Driver x) -> x.at.dist(from))
                            .thenComparing(x -> x.name));
            if (d.isEmpty()) return Optional.empty();
            Ride r = new Ride(nextId++, rider, from, to);
            r.driver = d.get(); r.driver.available = false; r.move(RideStatus.ACCEPTED);
            return Optional.of(r);
        }
        synchronized String complete(Ride r) {
            r.move(RideStatus.COMPLETED);
            r.driver.at = r.to; r.driver.available = true;
            return String.format("ride %d done by %s, fare Rs %.0f", r.id, r.driver.name,
                    fares.fare(r.from.dist(r.to)));
        }
    }

    public static void main(String[] args) {
        List<Driver> ds = List.of(new Driver("D1", new Point(0, 0)), new Driver("D2",
                new Point(5, 5)));
        RideService svc = new RideService(ds, km -> (50 + 12 * km) * 1.2);   // 1.2x surge
        Ride r1 = svc.request("asha", new Point(4, 4), new Point(10, 12)).orElseThrow();
        Ride r2 = svc.request("ravi", new Point(1, 1), new Point(1, 5)).orElseThrow();
        System.out.println("asha gets " + r1.driver.name + ", ravi gets " + r2.driver.name);
        System.out.println("third request: " + svc.request("neha", new Point(0, 0),
                new Point(3, 4)).map(r -> "matched").orElse("no drivers available"));
        r1.move(RideStatus.STARTED);
        System.out.println(svc.complete(r1));
        try {
            r2.move(RideStatus.COMPLETED);
        } catch (IllegalStateException e) {
            System.out.println("rejected: " + e.getMessage());
        }
        System.out.println("neha retries: " + svc.request("neha", new Point(0, 0),
                new Point(3, 4)).map(r -> "matched " + r.driver.name).orElse("none"));
    }
}
```

Follow-ups to raise: a spatial index (geohash or quadtree) instead of scanning all drivers; driver acceptance with timeouts (the ride goes back to `REQUESTED`); matching across servers using an atomic database update on the driver's status. The System Design guide's ride-hailing case study takes this further.

### L8.3 Warehouse inventory reservations

Design: `Inventory` holds, per product, `onHand` and `reserved`; available = onHand − reserved. `reserve(order, items)` is all-or-nothing and creates a `Reservation` with an expiry; `commit` turns reserved stock into shipped stock; `release` (cancel or timeout) gives it back. Listeners (observer) receive low-stock events. One lock guards the whole check-and-reserve step, so concurrent orders cannot oversell.

```java run All-or-nothing reservations under concurrency
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.BiConsumer;

public class Main {
    record Reservation(String order, Map<String, Integer> items, long expiresAt) {}
    static class Inventory {
        private final Map<String, Integer> onHand = new HashMap<>(),
                reserved = new HashMap<>();
        private final Map<String, Reservation> active = new HashMap<>();
        private final List<BiConsumer<String, Integer>> lowStock = new ArrayList<>();
        private final int threshold;
        Inventory(int threshold) { this.threshold = threshold; }
        void stock(String sku, int n) { onHand.merge(sku, n, Integer::sum); }
        void onLowStock(BiConsumer<String, Integer> l) { lowStock.add(l); }
        private int available(String sku) { return onHand.getOrDefault(sku,
                0) - reserved.getOrDefault(sku, 0); }
        synchronized boolean reserve(String order, Map<String, Integer> items, long now,
                long ttl) {
            for (var e : items.entrySet())
                if (available(e.getKey()) < e.getValue()) return false;
            items.forEach((sku, n) -> reserved.merge(sku, n, Integer::sum));
            active.put(order, new Reservation(order, items, now + ttl));
            return true;
        }
        synchronized boolean commit(String order, long now) {
            Reservation r = active.remove(order);
            if (r == null || r.expiresAt() <= now) {
                    if (r != null) release(r); return false; }
            r.items().forEach((sku, n) -> {
                reserved.merge(sku, -n, Integer::sum); onHand.merge(sku, -n, Integer::sum);
                if (onHand.get(sku) < threshold) lowStock.forEach(l -> l.accept(sku,
                        onHand.get(sku)));
            });
            return true;
        }
        private void release(Reservation r) { r.items().forEach((sku,
                n) -> reserved.merge(sku, -n, Integer::sum)); }
        synchronized int expire(long now) {
            List<Reservation> old = active.values().stream()
                    .filter(r -> r.expiresAt() <= now).toList();
            old.forEach(r -> { active.remove(r.order()); release(r); });
            return old.size();
        }
        synchronized String status(String sku) { return sku + " onHand " + onHand.get(sku)
                + ", reserved " + reserved.get(sku); }
    }

    public static void main(String[] args) throws Exception {
        Inventory inv = new Inventory(10);
        inv.stock("phone", 100); inv.stock("case", 100);
        List<String> alerts = Collections.synchronizedList(new ArrayList<>());
        inv.onLowStock((sku, left) -> alerts.add(sku + " low: " + left));
        ExecutorService pool = Executors.newFixedThreadPool(8);
        AtomicInteger ok = new AtomicInteger();
        List<Callable<Void>> jobs = new ArrayList<>();
        for (int i = 0; i < 300; i++) {
            final String order = "O" + i;
            jobs.add(() -> { if (inv.reserve(order, Map.of("phone", 1, "case", 1), 0,
                    1000)) ok.incrementAndGet(); return null; });
        }
        pool.invokeAll(jobs); pool.shutdown();
        System.out.println("300 concurrent orders, reservations granted: " + ok.get());
        System.out.println(inv.status("phone"));
        int committed = 0;
        for (int i = 0; i < 300 && committed < 95; i++) if (inv.commit("O" + i,
                500)) committed++;
        System.out.println("committed " + committed + "; " + inv.status("phone"));
        System.out.println("expired at t=1000: " + inv.expire(1000) + "; "
                + inv.status("phone"));
        System.out.println("low-stock alerts: " + alerts.size() + " for "
                + new TreeSet<>(alerts.stream().map(a -> a.split(" ")[0]).toList()));
    }
}
```

Exactly 100 of the 300 concurrent orders get a reservation: the stock never goes negative because the availability check and the reservation happen inside one lock. The 5 uncommitted reservations expire and return their stock. In a distributed version the same rule is a conditional update: `UPDATE stock SET reserved = reserved + ? WHERE sku = ? AND on_hand - reserved >= ?`.

### L8.4 An in-memory file system

A Composite: `Dir` and `File` share a `Node` interface, directories keep children in a `TreeMap` (sorted names for `ls` for free), and path resolution walks from the root.

```java run mkdir, ls, addContent, readContent and sizes
import java.util.*;

public class Main {
    interface Node { String name(); long size(); }
    static class File implements Node {
        final String name; final StringBuilder content = new StringBuilder();
        File(String n) { name = n; }
        public String name() { return name; }
        public long size() { return content.length(); }
    }
    static class Dir implements Node {
        final String name; final TreeMap<String, Node> children = new TreeMap<>();
        Dir(String n) { name = n; }
        public String name() { return name; }
        public long size() { return children.values().stream().mapToLong(Node::size)
                .sum(); }
    }
    static class FileSystem {
        private final Dir root = new Dir("");
        private List<String> parts(String path) {
            return Arrays.stream(path.split("/")).filter(p -> !p.isEmpty()).toList();
        }
        private Dir walk(List<String> parts, boolean create) {
            Dir d = root;
            for (String p : parts) {
                Node n = d.children.get(p);
                if (n == null) {
                    if (!create) throw new IllegalArgumentException("no such directory: "
                            + p);
                    n = new Dir(p); d.children.put(p, n);
                }
                if (!(n instanceof Dir next)) throw new IllegalArgumentException(p
                        + " is a file");
                d = next;
            }
            return d;
        }
        void mkdir(String path) { walk(parts(path), true); }
        void addContent(String path, String text) {
            List<String> ps = parts(path);
            Dir d = walk(ps.subList(0, ps.size() - 1), true);
            Node n = d.children.computeIfAbsent(ps.get(ps.size() - 1), File::new);
            if (!(n instanceof File f)) throw new IllegalArgumentException(path
                    + " is a directory");
            f.content.append(text);
        }
        String readContent(String path) {
            List<String> ps = parts(path);
            Node n = walk(ps.subList(0, ps.size() - 1), false)
                    .children.get(ps.get(ps.size() - 1));
            if (!(n instanceof File f)) throw new IllegalArgumentException("not a file: "
                    + path);
            return f.content.toString();
        }
        List<String> ls(String path) {
            List<String> ps = parts(path);
            if (ps.isEmpty()) return new ArrayList<>(root.children.keySet());
            Node n = walk(ps.subList(0, ps.size() - 1), false)
                    .children.get(ps.get(ps.size() - 1));
            if (n instanceof File f) return List.of(f.name);
            if (n instanceof Dir d) return new ArrayList<>(d.children.keySet());
            throw new IllegalArgumentException("no such path: " + path);
        }
        long du(String path) { return walk(parts(path), false).size(); }
    }

    public static void main(String[] args) {
        FileSystem fs = new FileSystem();
        fs.mkdir("/a/b/c");
        fs.addContent("/a/b/c/notes.txt", "hello");
        fs.addContent("/a/b/c/notes.txt", " world");
        fs.addContent("/a/readme.md", "# project");
        fs.mkdir("/a/assets");
        System.out.println("ls /       -> " + fs.ls("/"));
        System.out.println("ls /a      -> " + fs.ls("/a"));
        System.out.println("ls file    -> " + fs.ls("/a/b/c/notes.txt"));
        System.out.println("read       -> " + fs.readContent("/a/b/c/notes.txt"));
        System.out.println("du /a      -> " + fs.du("/a") + " bytes");
        try {
            fs.mkdir("/a/readme.md/x");
        } catch (IllegalArgumentException e) {
            System.out.println("error      -> " + e.getMessage());
        }
    }
}
```

Extensions: `rm` with recursive delete, `mv` (re-parenting a node), permissions on each node, and caching directory sizes (invalidate up the path on each write) when `du` is called often.
