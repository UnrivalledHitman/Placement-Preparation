# Chapter 7: Case Studies I
%Parking lot, LRU and LFU caches, elevator system, movie ticket booking, Splitwise and vending machine

Each case study follows the interview flow: **requirements → classes → patterns → code → extensions**. Try each one yourself for 30–45 minutes before reading the code. The programs use a simulated clock (a plain number of minutes or milliseconds passed in by the caller), which keeps the output deterministic and is good design anyway: code that reads the system clock directly is hard to test.

## 7.1 Parking lot

### Requirements

1. Several floors, each with numbered spots of three sizes: bike, compact and large.
2. Vehicles: bike, car, truck. A bike fits any spot, a car fits compact or large, a truck only large.
3. On entry, assign the **nearest** suitable free spot (lowest floor, then lowest number) and issue a ticket.
4. On exit, compute the fee (first hour flat, then hourly, rates per vehicle type) and free the spot.
5. Reject entry when no suitable spot is free. The lot must be safe with several entry and exit gates.

### Classes and patterns

```text
ParkingLot 1 <>---- * Floor 1 <>---- * Spot(size, number, occupant?)
    | uses                                   ^ fits(vehicle)
    +--> SpotAllocator  (Strategy: NearestFirst)       Vehicle (plate, type)
    +--> PricingStrategy (Strategy: HourlyPricing)     Ticket (id, vehicle, spot, entry)
```

Strategy for allocation and pricing (both are likely to change), records for immutable values, and `synchronized` entry and exit methods because gates run concurrently.

```java run Parking lot
import java.util.*;

public class Main {
    enum VehicleType { BIKE, CAR, TRUCK }
    enum SpotSize { BIKE, COMPACT, LARGE }
    record Vehicle(String plate, VehicleType type) {}
    record Ticket(int id, Vehicle vehicle, Spot spot, int entryMin) {}

    static class Spot {
        final int floor, number; final SpotSize size; Vehicle occupant;
        Spot(int floor, int number, SpotSize size) {
                this.floor = floor; this.number = number; this.size = size; }
        boolean fits(Vehicle v) {
            return switch (v.type()) {
                case BIKE -> true;
                case CAR -> size != SpotSize.BIKE;
                case TRUCK -> size == SpotSize.LARGE;
            };
        }
        public String toString() { return "F" + floor + "-" + size + "-" + number; }
    }

    interface SpotAllocator { Optional<Spot> pick(List<Spot> spots, Vehicle v); }
    static class NearestFirst implements SpotAllocator {
        public Optional<Spot> pick(List<Spot> spots, Vehicle v) {
            return spots.stream().filter(s -> s.occupant == null && s.fits(v))
                    .min(Comparator.comparingInt((Spot s) -> s.floor)
                            .thenComparingInt(s -> s.number));
        }
    }
    interface PricingStrategy { int fee(Ticket t, int exitMin); }
    static class HourlyPricing implements PricingStrategy {
        // {first hour, each extra hour}
        private final Map<VehicleType, int[]> rates = Map.of(
                VehicleType.BIKE, new int[] {20, 10}, VehicleType.CAR, new int[] {50, 30},
                VehicleType.TRUCK, new int[] {100, 60});
        public int fee(Ticket t, int exitMin) {
            // round up, minimum 1
            int hours = Math.max(1, (exitMin - t.entryMin() + 59) / 60);
            int[] r = rates.get(t.vehicle().type());
            return r[0] + (hours - 1) * r[1];
        }
    }

    static class ParkingLot {
        private final List<Spot> spots = new ArrayList<>();
        private final Map<Integer, Ticket> active = new HashMap<>();
        private final SpotAllocator allocator; private final PricingStrategy pricing;
        private int nextTicket = 1;
        ParkingLot(SpotAllocator a, PricingStrategy p) { allocator = a; pricing = p; }
        void addFloor(int floor, int bikes, int compact, int large) {
            int n = 1;
            for (int i = 0; i < bikes; i++) spots.add(new Spot(floor, n++, SpotSize.BIKE));
            for (int i = 0; i < compact; i++) spots.add(new Spot(floor, n++,
                    SpotSize.COMPACT));
            for (int i = 0; i < large; i++) spots.add(new Spot(floor, n++, SpotSize.LARGE));
        }
        synchronized Optional<Ticket> enter(Vehicle v, int nowMin) {
            Optional<Spot> spot = allocator.pick(spots, v);
            if (spot.isEmpty()) return Optional.empty();
            spot.get().occupant = v;
            Ticket t = new Ticket(nextTicket++, v, spot.get(), nowMin);
            active.put(t.id(), t);
            return Optional.of(t);
        }
        synchronized int exit(int ticketId, int nowMin) {
            Ticket t = active.remove(ticketId);
            if (t == null) throw new IllegalArgumentException("unknown or used ticket "
                    + ticketId);
            t.spot().occupant = null;
            return pricing.fee(t, nowMin);
        }
        synchronized long free(SpotSize size) {
            return spots.stream().filter(s -> s.size == size && s.occupant == null).count();
        }
    }

    public static void main(String[] args) {
        ParkingLot lot = new ParkingLot(new NearestFirst(), new HourlyPricing());
        lot.addFloor(0, 1, 2, 1);
        lot.addFloor(1, 1, 1, 1);
        List<Vehicle> arrivals = List.of(new Vehicle("WB01-CAR1", VehicleType.CAR),
                new Vehicle("WB02-TRK1", VehicleType.TRUCK),
                new Vehicle("WB03-CAR2", VehicleType.CAR), new Vehicle("WB04-CAR3",
                        VehicleType.CAR),
                new Vehicle("WB05-TRK2", VehicleType.TRUCK), new Vehicle("WB06-TRK3",
                        VehicleType.TRUCK));
        Map<String, Ticket> tickets = new LinkedHashMap<>();
        for (Vehicle v : arrivals) {
            Optional<Ticket> t = lot.enter(v, 0);
            System.out.println(v.plate() + " -> " + t.map(x -> "ticket " + x.id() + " spot "
                    + x.spot()).orElse("LOT FULL for " + v.type()));
            t.ifPresent(x -> tickets.put(v.plate(), x));
        }
        System.out.println("free compact spots: " + lot.free(SpotSize.COMPACT)
                + ", free large: " + lot.free(SpotSize.LARGE));
        System.out.println("WB01-CAR1 leaves after 50 min, pays Rs "
                + lot.exit(tickets.get("WB01-CAR1").id(), 50));
        System.out.println("WB02-TRK1 leaves after 185 min, pays Rs "
                + lot.exit(tickets.get("WB02-TRK1").id(), 185));
        System.out.println("WB06-TRK3 retries -> " + lot.enter(arrivals.get(5), 190)
                .map(x -> "spot " + x.spot()).orElse("full"));
        try {
            lot.exit(tickets.get("WB01-CAR1").id(), 200);
        } catch (IllegalArgumentException e) {
            System.out.println("error: " + e.getMessage());
        }
    }
}
```

The first two cars fill floor 0's compact spots and the first truck takes its large spot, so the third car goes to floor 1. The second truck takes the last large spot, and the third truck is turned away even though a bike spot is free. Notice the hidden weakness of `NearestFirst`: if a car arrived when only large spots were left, it would take one, and a later truck would be refused. A size-first allocator that keeps large spots for trucks avoids that. Raising this trade-off is exactly what interviewers want, and it is a one-class change because allocation is a strategy.

| Extension | Change |
|---|---|
| EV charging spots | New `SpotSize.EV` (or a `features` set on spots) and a pricing rule for charging time |
| Keep large spots for trucks | A `SizeFirstAllocator` strategy that tries the smallest fitting size first |
| Multiple entry gates | Already safe (`synchronized`); for higher throughput, lock per floor or keep per-size free lists in concurrent queues |
| Display boards | Observer: floors publish free-count changes to boards |
| Payments | `PaymentMethod` interface (cash, UPI, card); exit completes only after payment succeeds |

## 7.2 LRU and LFU caches

### Requirements

`get(key)` and `put(key, value)` in **O(1)**; when full, evict the **least recently used** entry (LRU) or the **least frequently used** one, breaking ties by recency (LFU).

### Design

- **LRU**: a `HashMap` from key to node, plus a doubly linked list ordered by recency. A hit moves the node to the front; eviction removes the tail.
- **LFU**: key → (value, frequency), frequency → `LinkedHashSet` of keys (insertion order gives recency within a frequency), and a `minFreq` counter, so eviction is O(1).

```java run LRU and LFU caches in O(1)
import java.util.*;

public class Main {
    static class LRUCache<K, V> {
        private class Node { K key; V val; Node prev, next; Node(K k, V v) {
                key = k; val = v; } }
        private final int capacity;
        private final Map<K, Node> map = new HashMap<>();
        // sentinels
        private final Node head = new Node(null, null), tail = new Node(null, null);
        LRUCache(int capacity) {
                this.capacity = capacity; head.next = tail; tail.prev = head; }
        private void unlink(Node n) { n.prev.next = n.next; n.next.prev = n.prev; }
        private void addFront(Node n) {
                n.next = head.next; n.prev = head; head.next.prev = n; head.next = n; }
        V get(K key) {
            Node n = map.get(key);
            if (n == null) return null;
            unlink(n); addFront(n);
            return n.val;
        }
        K put(K key, V val) {   // returns the evicted key, if any
            Node n = map.get(key);
            if (n != null) { n.val = val; unlink(n); addFront(n); return null; }
            K evicted = null;
            if (map.size() == capacity) {
                Node lru = tail.prev;
                unlink(lru); map.remove(lru.key); evicted = lru.key;
            }
            n = new Node(key, val); addFront(n); map.put(key, n);
            return evicted;
        }
        List<K> order() {
            List<K> l = new ArrayList<>();
            for (Node n = head.next; n != tail; n = n.next) l.add(n.key);
            return l;
        }
    }

    static class LFUCache<K, V> {
        private final int capacity; private int minFreq = 0;
        private final Map<K, V> vals = new HashMap<>();
        private final Map<K, Integer> freq = new HashMap<>();
        private final Map<Integer, LinkedHashSet<K>> buckets = new HashMap<>();
        LFUCache(int capacity) { this.capacity = capacity; }
        private void touch(K key) {
            int f = freq.get(key);
            buckets.get(f).remove(key);
            if (f == minFreq && buckets.get(f).isEmpty()) minFreq++;
            freq.put(key, f + 1);
            buckets.computeIfAbsent(f + 1, x -> new LinkedHashSet<>()).add(key);
        }
        V get(K key) {
                if (!vals.containsKey(key)) return null; touch(key); return vals.get(key); }
        K put(K key, V val) {
            if (vals.containsKey(key)) { vals.put(key, val); touch(key); return null; }
            K evicted = null;
            if (vals.size() == capacity) {
                // least frequent, oldest
                evicted = buckets.get(minFreq).iterator().next();
                buckets.get(minFreq)
                        .remove(evicted); vals.remove(evicted); freq.remove(evicted);
            }
            vals.put(key, val); freq.put(key, 1); minFreq = 1;
            buckets.computeIfAbsent(1, x -> new LinkedHashSet<>()).add(key);
            return evicted;
        }
    }

    public static void main(String[] args) {
        LRUCache<String, Integer> lru = new LRUCache<>(3);
        LFUCache<String, Integer> lfu = new LFUCache<>(3);
        String[] ops = {"put a", "get a", "get a", "put b", "put c", "get b", "get c",
                "put d", "get a"};
        int v = 0;
        for (String op : ops) {
            String[] p = op.split(" ");
            String r1, r2;
            if (p[0].equals("put")) {
                Object e1 = lru.put(p[1], ++v), e2 = lfu.put(p[1], v);
                r1 = e1 == null ? "-" : "evict " + e1; r2 = e2 == null ? "-" : "evict "
                        + e2;
            } else {
                r1 = lru.get(p[1]) == null ? "miss" : "hit";
                r2 = lfu.get(p[1]) == null ? "miss" : "hit";
            }
            System.out.printf("%-6s LRU %-8s LFU %-8s LRU order %s%n", op, r1, r2,
                    lru.order());
        }
    }
}
```

The two policies agree until `put d`. Key `a` was used three times but not since the start, while `b` and `c` were used twice each, more recently. LRU evicts `a`, the least *recently* used key; LFU keeps `a`, the most *frequently* used, and evicts `b`, the older of the two keys used twice. The final `get a` shows the consequence: a miss for LRU, a hit for LFU. LRU suits workloads where recent items are likely to be reused (sessions, feeds); LFU suits stable popularity (a product catalogue's best sellers).

> TIP: In Java, `new LinkedHashMap<>(16, 0.75f, true)` with `removeEldestEntry` overridden gives an LRU cache in five lines. Mention it, but expect the interviewer to ask for the hand-built version above.

## 7.3 Elevator system

### Requirements

1. A building with N floors and M elevators.
2. Hall calls (floor + direction) are assigned to an elevator by a dispatcher; car calls (destination buttons) go to that elevator.
3. Each elevator serves stops in its current direction before reversing (the SCAN or "elevator" algorithm).
4. The dispatching policy must be replaceable.

### Design

`Elevator` holds its floor, direction and a sorted set of pending stops; `Dispatcher` is a strategy that scores elevators for a hall call (an idle elevator scores by distance, a moving one gets a bonus if the call is on its way). A `Building` advances the simulation one tick at a time.

```java run An elevator system with SCAN and a pluggable dispatcher
import java.util.*;

public class Main {
    enum Dir { UP, DOWN, IDLE }

    static class Elevator {
        final int id; int floor = 0; Dir dir = Dir.IDLE;
        final TreeSet<Integer> stops = new TreeSet<>();
        Elevator(int id) { this.id = id; }
        void addStop(int f) { if (f != floor) stops.add(f); }
        String step() {   // one tick: move one floor or stop
            if (stops.isEmpty()) { dir = Dir.IDLE; return null; }
            if (dir == Dir.IDLE) dir = stops.first() > floor ? Dir.UP : Dir.DOWN;
            // nothing above: reverse
            if (dir == Dir.UP && stops.ceiling(floor) == null) dir = Dir.DOWN;
            if (dir == Dir.DOWN && stops.floor(floor) == null) dir = Dir.UP;
            floor += dir == Dir.UP ? 1 : -1;
            if (stops.remove(floor)) {
                if (stops.isEmpty()) dir = Dir.IDLE;
                return "E" + id + " opens at " + floor;
            }
            return null;
        }
    }

    interface Dispatcher { Elevator choose(List<Elevator> cars, int floor, Dir callDir); }
    static class NearestSuitable implements Dispatcher {
        public Elevator choose(List<Elevator> cars, int floor, Dir callDir) {
            return cars.stream().min(Comparator.comparingInt((Elevator e) -> cost(e, floor,
                    callDir))
                    .thenComparingInt(e -> e.id)).orElseThrow();
        }
        private int cost(Elevator e, int floor, Dir d) {
            int dist = Math.abs(e.floor - floor);
            if (e.dir == Dir.IDLE) return dist;
            boolean onTheWay = e.dir == d
                    && (d == Dir.UP ? e.floor <= floor : e.floor >= floor);
            return onTheWay ? dist : dist + 20;   // penalty: must finish its sweep first
        }
    }

    static class Building {
        final List<Elevator> cars = new ArrayList<>(); final Dispatcher dispatcher;
        Building(int n, Dispatcher d) { for (int i = 1; i <= n; i++) cars.add(
                new Elevator(i)); dispatcher = d; }
        void hallCall(int t, int floor, Dir d) {
            Elevator e = dispatcher.choose(cars, floor, d);
            e.addStop(floor);
            System.out.printf("t=%2d hall call floor %d %s -> E%d (at %d, %s)%n", t, floor,
                    d, e.id, e.floor, e.dir);
        }
        void carCall(int t, int elevator, int floor) {
            cars.get(elevator - 1).addStop(floor);
            System.out.printf("t=%2d inside E%d: button %d%n", t, elevator, floor);
        }
        void tick(int t) {
            for (Elevator e : cars) {
                    String ev = e.step(); if (ev != null) System.out.printf("t=%2d %s%n", t,
                    ev); }
        }
    }

    public static void main(String[] args) {
        Building b = new Building(2, new NearestSuitable());
        Map<Integer, Runnable> script = new HashMap<>();
        script.put(0, () -> b.hallCall(0, 5, Dir.DOWN));
        script.put(1, () -> b.hallCall(1, 2, Dir.UP));
        script.put(3, () -> b.carCall(3, 2, 8));
        script.put(5, () -> b.carCall(5, 1, 0));
        script.put(6, () -> b.hallCall(6, 6, Dir.UP));
        for (int t = 0; t <= 16; t++) {
            Runnable r = script.get(t);
            if (r != null) r.run();
            b.tick(t);
        }
        for (Elevator e : b.cars) System.out.println("E" + e.id + " ends at floor "
                + e.floor + ", " + e.dir);
    }
}
```

Follow the log. The first hall call goes to E1 (both cars idle at floor 0, tie broken by id). The second, at floor 2 going up, **also** goes to E1: E1 is moving up from floor 1, so floor 2 is on its way at distance 1, cheaper than idle E2 at distance 2. E1 stops at 2 and carries on to 5. At t = 6 the call at floor 6 going up goes to E2, which is already travelling up towards floor 8. One simplification is visible: E1 opens at floor 5 on its way **up** although that caller wants to go down. A refinement stores the direction of each hall call and serves it only on the matching sweep.

| Extension | Change |
|---|---|
| Better dispatching (minimise wait time, energy saving at night) | New `Dispatcher` strategies, chosen by time of day |
| Capacity and weight limits | Elevator rejects new hall calls when full; dispatcher skips it |
| Emergency mode / maintenance | State pattern on the elevator: `Normal`, `Maintenance`, `FireMode` |
| Real-time control | Elevators as threads with a command queue each; the dispatcher only posts requests |

## 7.4 Movie ticket booking (BookMyShow)

### Requirements

1. Cities have theatres, theatres have screens, screens host shows of movies.
2. A user selects seats for a show. The seats are **held** for a few minutes while the user pays.
3. Two users must never get the same seat. A hold is all-or-nothing: either every requested seat is held, or none.
4. Holds expire; payment confirms a hold into a booking; expired or cancelled holds release seats.

### Design

The heart of the problem is seat locking. Each `Show` keeps a map of seat → status (`FREE`, `HELD by holdId until t`, `BOOKED`). `hold()` is `synchronized` on the show, checks every requested seat (treating expired holds as free), and only then marks them all. Different shows lock independently, so contention is per show, not global.

```java run Seat holds with expiry and all-or-nothing booking
import java.util.*;

public class Main {
    record Hold(String id, String user, Set<String> seats, int expiresAt) {}

    static class Show {
        final String name;
        private final Map<String, String> booked = new HashMap<>();     // seat -> user
        private final Map<String, Hold> heldBy = new HashMap<>();       // seat -> hold
        private final Set<String> allSeats = new TreeSet<>();
        private int holdCounter = 0;
        Show(String name, int rows, int cols) {
            this.name = name;
            for (char r = 'A'; r < 'A'
                    + rows; r++) for (int c = 1; c <= cols; c++) allSeats.add("" + r + c);
        }
        private boolean free(String seat, int now) {
            Hold h = heldBy.get(seat);
            return !booked.containsKey(seat) && (h == null || h.expiresAt() <= now);
        }
        synchronized Optional<Hold> hold(String user, Set<String> seats, int now, int ttl) {
            for (String s : seats)
                // all or nothing
                if (!allSeats.contains(s) || !free(s, now)) return Optional.empty();
            Hold h = new Hold(name + "-H" + (++holdCounter), user, Set.copyOf(seats), now
                    + ttl);
            seats.forEach(s -> heldBy.put(s, h));
            return Optional.of(h);
        }
        synchronized boolean confirm(Hold h, int now) {
            if (h.expiresAt() <= now) return false;   // too late: hold lapsed
            for (String s : h.seats()) if (heldBy.get(s) != h) return false;
            for (String s : h.seats()) { heldBy.remove(s); booked.put(s, h.user()); }
            return true;
        }
        synchronized long freeCount(int now) { return allSeats.stream().filter(s -> free(s,
                now)).count(); }
    }

    public static void main(String[] args) {
        Show show = new Show("Pathaan 21:00", 2, 5);                     // 10 seats
        int ttl = 5;                                                      // minutes
        Optional<Hold> asha = show.hold("asha", Set.of("A3", "A4"), 0, ttl);
        Optional<Hold> ravi = show.hold("ravi", Set.of("A4", "A5"), 1, ttl);
        System.out.println("t=0 asha holds A3,A4: " + asha.isPresent());
        System.out.println("t=1 ravi wants A4,A5: " + ravi.isPresent()
                + " (A4 is held, so A5 is not taken either)");
        System.out.println("t=2 free seats: " + show.freeCount(2));
        System.out.println("t=4 asha pays: confirmed " + show.confirm(asha.get(), 4));
        Optional<Hold> neha = show.hold("neha", Set.of("B1", "B2"), 6, ttl);
        System.out.println("t=6 neha holds B1,B2: " + neha.isPresent() + " but never pays");
        Optional<Hold> sam = show.hold("sam", Set.of("B2"), 10, ttl);
        System.out.println("t=10 sam wants B2: " + sam.isPresent()
                + " (neha's hold lasts until t="
                + neha.get().expiresAt() + ")");
        Optional<Hold> sam2 = show.hold("sam", Set.of("B2"), 11, ttl);
        System.out.println("t=11 sam retries B2: " + sam2.isPresent());
        System.out.println("t=12 neha pays late: confirmed " + show.confirm(neha.get(),
                12));
        System.out.println("t=12 free seats: " + show.freeCount(12));
    }
}
```

Expiry is **lazy**: nobody runs a timer; an expired hold simply counts as free the next time someone looks. Neha's late payment is refused because her hold had lapsed and B2 now belongs to Sam's hold (in a real system her payment would be refunded automatically).

> NOTE: Across several application servers, `synchronized` is not enough. The production version stores seat status in the database and holds seats with a conditional update, for example `UPDATE show_seat SET status = 'HELD', hold_id = ?, expires_at = ? WHERE show_id = ? AND seat IN (...) AND (status = 'FREE' OR expires_at < now())`, then checks that the number of updated rows equals the number of seats requested, inside one transaction. Redis with a key per seat and an expiry (`SET seat:show:A4 hold123 NX EX 300`) is the other common answer.

## 7.5 Splitwise (expense sharing)

### Requirements

1. Users add expenses paid by one person and split among several, **equally**, by **exact** amounts, or by **percentages**.
2. Show each user's net balance.
3. **Simplify debts**: settle everything with as few payments as possible.

### Design

`SplitStrategy` (Strategy) turns an expense into per-person shares and validates it (exact amounts must sum to the total, percentages to 100). Balances are a map of net amounts in paise (integers avoid rounding errors). Simplification repeatedly matches the largest creditor with the largest debtor, a greedy algorithm that settles n people with at most n − 1 payments.

```java run Splitting expenses and simplifying debts
import java.util.*;

public class Main {
    interface SplitStrategy { Map<String, Long> shares(long total, List<String> users,
            List<Double> params); }
    static class Equal implements SplitStrategy {
        public Map<String, Long> shares(long total, List<String> users, List<Double> p) {
            Map<String, Long> m = new LinkedHashMap<>();
            long each = total / users.size(), rem = total % users.size();
            // spread paise
            for (int i = 0; i < users.size(); i++) m.put(users.get(i), each
                    + (i < rem ? 1 : 0));
            return m;
        }
    }
    static class Exact implements SplitStrategy {
        public Map<String, Long> shares(long total, List<String> users, List<Double> p) {
            if (p.stream().mapToLong(d -> Math.round(d * 100)).sum() != total)
                throw new IllegalArgumentException("exact amounts must add up to the total");
            Map<String, Long> m = new LinkedHashMap<>();
            for (int i = 0; i < users.size(); i++) m.put(users.get(i),
                    Math.round(p.get(i) * 100));
            return m;
        }
    }
    static class Percent implements SplitStrategy {
        public Map<String, Long> shares(long total, List<String> users, List<Double> p) {
            if (Math.abs(p.stream().mapToDouble(Double::doubleValue).sum() - 100) > 1e-9)
                throw new IllegalArgumentException("percentages must add up to 100");
            Map<String, Long> m = new LinkedHashMap<>(); long given = 0;
            for (int i = 0; i < users.size(); i++) {
                long s = i == users.size() - 1 ? total - given
                        : Math.round(total * p.get(i) / 100);
                m.put(users.get(i), s); given += s;
            }
            return m;
        }
    }

    static class Ledger {
        final Map<String, Long> net = new TreeMap<>();   // + is owed money, - owes
        void add(String payer, double amount, SplitStrategy how, List<String> users,
                List<Double> params) {
            long total = Math.round(amount * 100);
            Map<String, Long> shares = how.shares(total, users, params);
            net.merge(payer, total, Long::sum);
            shares.forEach((u, s) -> net.merge(u, -s, Long::sum));
        }
        List<String> simplify() {
            PriorityQueue<long[]> cred = new PriorityQueue<>((a, b) -> Long.compare(b[0],
                    a[0]));
            PriorityQueue<long[]> debt = new PriorityQueue<>((a, b) -> Long.compare(b[0],
                    a[0]));
            List<String> names = new ArrayList<>(net.keySet());
            for (int i = 0; i < names.size(); i++) {
                long v = net.get(names.get(i));
                if (v > 0) cred.add(new long[] {v, i}); else if (v < 0) debt.add(
                        new long[] {-v, i});
            }
            List<String> out = new ArrayList<>();
            while (!cred.isEmpty()) {
                long[] c = cred.poll(), d = debt.poll();
                long pay = Math.min(c[0], d[0]);
                out.add(String.format("%s pays %s Rs %.2f", names.get((int) d[1]),
                        names.get((int) c[1]), pay / 100.0));
                if (c[0] > pay) cred.add(new long[] {c[0] - pay, c[1]});
                if (d[0] > pay) debt.add(new long[] {d[0] - pay, d[1]});
            }
            return out;
        }
    }

    public static void main(String[] args) {
        Ledger l = new Ledger();
        List<String> all = List.of("asha", "neha", "ravi", "sam");
        l.add("asha", 1200, new Equal(), all, null);   // dinner
        l.add("ravi", 900, new Exact(), List.of("ravi", "sam", "neha"), List.of(300.0,
                450.0, 150.0));
        l.add("neha", 1000, new Percent(), all, List.of(10.0, 40.0, 25.0, 25.0));   // cab
        l.net.forEach((u, v) -> System.out.printf("%-5s net %8.2f%n", u, v / 100.0));
        System.out.println("net sum (must be 0): " + l.net.values().stream()
                .mapToLong(Long::longValue).sum());
        l.simplify().forEach(s -> System.out.println("  " + s));
        try {
            l.add("sam", 100, new Percent(), List.of("sam", "asha"), List.of(60.0, 30.0));
        } catch (IllegalArgumentException e) {
            System.out.println("rejected: " + e.getMessage());
        }
    }
}
```

Three expenses among four people could need up to six pairwise payments; the greedy simplification settles everything in at most three. Finding the true minimum number of payments is NP-hard in general (it involves finding zero-sum subgroups), so production systems use this greedy heuristic.

## 7.6 Vending machine

### Requirements

Select a product, insert coins, receive the product and change. Reject selections of sold-out products, refund on cancel, and never accept coins for an item it cannot deliver.

### Design

A textbook State pattern: `Idle`, `Selected` (waiting for money) and `SoldOut`. Each state class handles `select`, `insert` and `cancel`, and returns the next state. The machine (context) owns the inventory and the money.

```java run A vending machine with the State pattern
import java.util.*;

public class Main {
    interface State {
        State select(Machine m, String code);
        State insert(Machine m, int coin);
        State cancel(Machine m);
        String name();
    }
    static class Idle implements State {
        public State select(Machine m, String code) {
            if (!m.prices.containsKey(code)) { m.say("no such product "
                    + code); return this; }
            if (m.stock.get(code) == 0) { m.say(code + " is sold out"); return this; }
            m.chosen = code; m.say("selected " + code + ", insert Rs "
                    + m.prices.get(code));
            return new Selected();
        }
        public State insert(Machine m, int coin) {
                m.say("select a product first, returning Rs " + coin); return this; }
        public State cancel(Machine m) { m.say("nothing to cancel"); return this; }
        public String name() { return "IDLE"; }
    }
    static class Selected implements State {
        public State select(Machine m, String code) { m.say("already selected "
                + m.chosen); return this; }
        public State insert(Machine m, int coin) {
            if (!Set.of(1, 2, 5, 10, 20).contains(coin)) { m.say("rejected coin "
                    + coin); return this; }
            m.paid += coin;
            int price = m.prices.get(m.chosen);
            if (m.paid < price) { m.say("paid " + m.paid + "/" + price); return this; }
            m.stock.merge(m.chosen, -1, Integer::sum);
            m.say("dispensed " + m.chosen + (m.paid > price ? ", change Rs "
                    + (m.paid - price) : ""));
            m.paid = 0; m.chosen = null;
            return m.stock.values().stream()
                    .allMatch(s -> s == 0) ? new SoldOut() : new Idle();
        }
        public State cancel(Machine m) { m.say("cancelled, refund Rs "
                + m.paid); m.paid = 0; m.chosen = null; return new Idle(); }
        public String name() { return "SELECTED"; }
    }
    static class SoldOut implements State {
        public State select(Machine m, String c) { m.say("machine empty"); return this; }
        public State insert(Machine m, int coin) { m.say("machine empty, returning Rs "
                + coin); return this; }
        public State cancel(Machine m) { return this; }
        public String name() { return "SOLD_OUT"; }
    }

    static class Machine {
        final Map<String, Integer> prices = new LinkedHashMap<>(),
                stock = new LinkedHashMap<>();
        String chosen; int paid; State state = new Idle();
        void say(String s) { System.out.println("   [" + state.name() + "] " + s); }
        void select(String c) { state = state.select(this, c); }
        void insert(int coin) { state = state.insert(this, coin); }
        void cancel() { state = state.cancel(this); }
    }

    public static void main(String[] args) {
        Machine m = new Machine();
        m.prices.put("A1", 25); m.stock.put("A1", 1);
        m.prices.put("B2", 15); m.stock.put("B2", 1);
        m.insert(10); m.select("A1"); m.insert(10); m.insert(3); m.insert(20);
        m.select("A1"); m.select("B2"); m.insert(10); m.cancel();
        m.select("B2"); m.insert(20);
        m.select("B2");
        System.out.println("final state: " + m.state.name());
    }
}
```

| Extension | Change |
|---|---|
| Change-making with limited coins | A `CoinInventory` that computes change greedily and refuses sales it cannot make change for |
| Card or UPI payment | `PaymentMethod` strategy; `Selected` waits for a payment-success event |
| Maintenance mode | A new `Maintenance` state reachable only with an admin key |
| Telemetry | Observer: publish sales and stock levels to a server |
