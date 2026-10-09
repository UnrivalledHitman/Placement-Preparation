# Chapter 3: Loop B, SDE-1 at a Product Company
%Graph and binary-search coding, a transactional key-value store in machine coding, live order tracking at scale, and behavioural depth

| Round | Time | Problem |
|---|---|---|
| B1 Coding | 45 min | Smallest course order; a time-versioned key-value store |
| B2 Machine coding | 60 min | An in-memory key-value store with nested transactions |
| B3 HLD | 45 min | Live order tracking for food delivery |
| B4 Behavioural | 45 min | Conflict, deadlines, a shipped bug, learning fast |

## 3.1 Round B1: coding (45 minutes, two problems)

**Problem 1 (20 minutes).** There are `n` courses numbered `0` to `n−1` and a list of prerequisite pairs `[a, b]` meaning `b` must be taken before `a`. Return an order in which all courses can be taken; whenever several courses are available, take the **smallest-numbered** first. Return an empty list if it is impossible.

**Problem 2 (25 minutes).** Implement a store with `set(key, value, timestamp)` and `get(key, timestamp)`, where `get` returns the value set at the largest timestamp **less than or equal to** the one asked for, or `""` if none. Timestamps for each key arrive in increasing order.

### Model solution, problem 1

This is topological sorting with a twist. Kahn's algorithm repeatedly takes a course with no remaining prerequisites; using a **min-heap** instead of a queue picks the smallest available course each time. If fewer than `n` courses come out, the remaining ones form a cycle. Time O((n + e) log n), space O(n + e).

```java run Kahn's algorithm with a min-heap, including a cycle
import java.util.*;

public class Main {
    static List<Integer> order(int n, int[][] prereqs) {
        List<List<Integer>> next = new ArrayList<>();
        for (int i = 0; i < n; i++) next.add(new ArrayList<>());
        int[] indegree = new int[n];
        for (int[] p : prereqs) { next.get(p[1]).add(p[0]); indegree[p[0]]++; }
        PriorityQueue<Integer> ready = new PriorityQueue<>();
        for (int i = 0; i < n; i++) if (indegree[i] == 0) ready.add(i);
        List<Integer> out = new ArrayList<>();
        while (!ready.isEmpty()) {
            int c = ready.poll();
            out.add(c);
            for (int d : next.get(c)) if (--indegree[d] == 0) ready.add(d);
        }
        return out.size() == n ? out : List.of();
    }

    public static void main(String[] args) {
        int[][] example = {{1, 3}, {2, 3}, {0, 4}, {3, 5}};
        System.out.println("example:      " + order(6, example));
        System.out.println("no prereqs:   " + order(4, new int[][]{}));
        System.out.println("smallest:     " + order(3, new int[][]{{0, 2}}));
        System.out.println("cycle:        " + order(3, new int[][]{{0, 1}, {1, 2}, {2, 0}}));
    }
}
```

In the example, courses 4 and 5 are free at the start; 4 is taken first, which frees 0, and 0 is smaller than 5, so it comes next. In the "smallest" case course 0 needs course 2, so the order is 1, 2, 0: course 1 is free and smaller than 2, and 0 becomes available only after 2. A plain queue would also produce a valid order, but not necessarily the smallest one; explaining why the heap is needed shows understanding rather than recall.

### Model solution, problem 2

Keep, per key, a list of `(timestamp, value)` pairs, which is sorted automatically because timestamps increase. `get` is a binary search for the last timestamp ≤ the query. `set` is O(1), `get` is O(log m) for m versions of the key.

```java run Versioned key-value store: binary search for the floor timestamp
import java.util.*;

public class Main {
    static class TimeMap {
        private final Map<String, List<Long>> times = new HashMap<>();
        private final Map<String, List<String>> values = new HashMap<>();

        void set(String key, String value, long t) {
            times.computeIfAbsent(key, k -> new ArrayList<>()).add(t);
            values.computeIfAbsent(key, k -> new ArrayList<>()).add(value);
        }

        String get(String key, long t) {
            List<Long> ts = times.get(key);
            if (ts == null) return "";
            int lo = 0, hi = ts.size() - 1, best = -1;
            while (lo <= hi) {                            // last index with ts[i] <= t
                int mid = (lo + hi) >>> 1;
                if (ts.get(mid) <= t) { best = mid; lo = mid + 1; } else hi = mid - 1;
            }
            return best < 0 ? "" : values.get(key).get(best);
        }
    }

    public static void main(String[] args) {
        TimeMap m = new TimeMap();
        m.set("tariff", "standard", 10);
        m.set("tariff", "peak", 20);
        m.set("tariff", "night", 30);
        for (long t : new long[]{5, 10, 15, 20, 29, 30, 99})
            System.out.printf("get(tariff, %2d) = \"%s\"%n", t, m.get("tariff", t));
        System.out.println("missing key = \"" + m.get("rate", 50) + "\"");
    }
}
```

**Likely follow-ups.** *Timestamps may arrive out of order:* use a `TreeMap<Long, String>` per key and `floorEntry(t)`, O(log m) for both operations. *Memory grows forever:* keep only versions newer than a retention window, or compact old versions periodically.

### Rubric for round B1

| Signal | Hire | No hire |
|---|---|---|
| Problem 1 | Recognised topological sort, explained the heap for the smallest order, detected cycles by count | DFS without cycle detection; ignored "smallest first" |
| Problem 2 | Binary search on the per-key list, with correct floor logic; out-of-order follow-up answered with a sorted map | Linear scan of all versions; off-by-one at exact timestamps |
| Testing | Exact timestamp, before the first version, missing key, cycle | Only the happy path |

## 3.2 Round B2: machine coding (60 minutes)

**Problem.** Build an in-memory key-value store that processes commands: `SET k v`, `GET k`, `DELETE k`, `COUNT v` (how many keys currently have value `v`), and transactions with `BEGIN`, `ROLLBACK` (undo the innermost open transaction) and `COMMIT` (make all open transactions permanent). Transactions can be nested. Every operation except `ROLLBACK` should be O(1); `ROLLBACK` may cost time proportional to the changes it undoes. The code must run and handle bad input.

### Model answer: the design

| Concern | Choice | Why |
|---|---|---|
| Data | `HashMap<String, String> data` | O(1) reads and writes |
| `COUNT` in O(1) | `HashMap<String, Integer> counts` updated on every change | Counting by scanning would be O(n) |
| Transactions | A stack of **undo logs**: for each open transaction, the value each key had **before** that transaction first touched it (or "absent") | Rollback restores only touched keys; commit just drops the logs |
| Single write path | Every change goes through one `put(key, valueOrNull)` method that records undo and maintains counts | No way to forget the counts or the log |
| Commands | A small parser mapping each line to an operation, with error messages for bad input | Machine-coding rounds reward runnable, robust code |

```java run A transactional key-value store with an undo-log stack
import java.util.*;

public class Main {
    static class Store {
        private final Map<String, String> data = new HashMap<>();
        private final Map<String, Integer> counts = new HashMap<>();
        private final Deque<Map<String, Optional<String>>> undo = new ArrayDeque<>();

        private void put(String key, String value) {        // value == null means delete
            if (!undo.isEmpty())
                undo.peek().putIfAbsent(key, Optional.ofNullable(data.get(key)));
            String old = value == null ? data.remove(key) : data.put(key, value);
            if (old != null) counts.merge(old, -1, Integer::sum);
            if (value != null) counts.merge(value, 1, Integer::sum);
        }

        String execute(String line) {
            String[] p = line.trim().split("\\s+");
            switch (p[0].toUpperCase()) {
                case "SET":    if (p.length != 3) break; put(p[1], p[2]); return null;
                case "GET":    if (p.length != 2) break;
                               return data.getOrDefault(p[1], "NULL");
                case "DELETE": if (p.length != 2) break; put(p[1], null); return null;
                case "COUNT":  if (p.length != 2) break;
                               return String.valueOf(counts.getOrDefault(p[1], 0));
                case "BEGIN":  undo.push(new HashMap<>()); return null;
                case "ROLLBACK":
                    if (undo.isEmpty()) return "NO TRANSACTION";
                    Map<String, Optional<String>> log = undo.pop();
                    Deque<Map<String, Optional<String>>> saved = new ArrayDeque<>(undo);
                    undo.clear();                         // restoring must not log again
                    log.forEach((k, v) -> put(k, v.orElse(null)));
                    undo.addAll(saved);
                    return null;
                case "COMMIT":
                    if (undo.isEmpty()) return "NO TRANSACTION";
                    undo.clear(); return null;
                default: return "UNKNOWN COMMAND " + p[0];
            }
            return "BAD ARGUMENTS: " + line.trim();
        }
    }

    public static void main(String[] args) {
        Store s = new Store();
        String script = """
            SET a 10
            SET b 10
            COUNT 10
            BEGIN
            SET a 20
            BEGIN
            DELETE b
            COUNT 10
            ROLLBACK
            GET b
            GET a
            ROLLBACK
            GET a
            COUNT 10
            BEGIN
            SET c 5
            COMMIT
            ROLLBACK
            GET c
            SET x
            FLY away
            """;
        for (String line : script.strip().split("\n")) {
            String out = s.execute(line);
            System.out.printf("%-10s %s%n", line.trim(), out == null ? "" : "-> " + out);
        }
    }
}
```

Points that impress in this round: the single `put` method keeps data, counts and undo logs consistent; recording only the **first** old value per key per transaction makes rollback correct even when a key changes several times; and the restore loop temporarily detaches the stack so that undoing does not create new undo entries. Nested rollback works because each transaction's log holds the values from just before it began.

> TIP: Before writing code, write the command script with expected outputs. It is your test, it shows the interviewer you think about behaviour first, and it catches misunderstandings (does `COMMIT` close all transactions or one?) while they are cheap.

### Rubric for round B2

| Signal | Hire | No hire |
|---|---|---|
| Design | Undo logs per transaction, counts map, one write path | Copying the whole map at each `BEGIN` without discussing cost |
| Correctness | Nested rollback, delete inside a transaction, `COUNT` after rollback | Rollback restores wrong values after repeated sets |
| Robustness | Errors for unknown commands, missing arguments, rollback without a transaction | Crashes on bad input |
| Code quality | Small methods, clear names, runs first time or after small fixes | One long method, does not run by the end |
| Complexity | O(1) per operation, rollback O(changes) | Not discussed |

## 3.3 Round B3: HLD (45 minutes)

**Problem.** Design live order tracking for a food-delivery app: customers watch their delivery partner move on a map with an ETA, restaurants and support see order status, and the dispatch system finds nearby partners for new orders. Scale: 2 million orders a day; up to 200,000 active partners at peak, each sending a location every 4 seconds.

### Model answer

**Requirements.** Functional: partners stream locations; customers see their partner's location and ETA within a few seconds; order status changes (placed, accepted, picked up, delivered) are visible to all parties; dispatch queries partners near a restaurant. Non-functional: freshness of a few seconds; tracking may lose an occasional point but order state must never be lost; mobile networks drop connections constantly.

```python run Load and storage estimates for live tracking
partners, interval_s = 200_000, 4
loc_writes = partners / interval_s
print(f'location updates at peak: {loc_writes:,.0f}/s')

orders_per_day = 2_000_000
peak_factor = 3                             # dinner peak versus the daily average
avg_minutes_in_transit = 30
concurrent = orders_per_day / 86_400 * peak_factor * avg_minutes_in_transit * 60
print(f'orders being tracked at once at peak: about {concurrent:,.0f}')
print(f'pushes to customers (one per partner update): about {concurrent / interval_s:,.0f}/s')

bytes_per_point = 40                        # partner id, lat, lon, time, speed, compressed
hours_active = 14
history_gb = partners * 0.5 * (3600 / interval_s) * hours_active * bytes_per_point / 1e9
print(f'location history per day (half the peak fleet on average): about {history_gb:.0f} GB')
```

The interesting numbers are **50,000 writes per second** of small, short-lived data and **about 31,000 pushes per second** to customers over unreliable connections. Location points are disposable (only the latest matters for display), order state is precious: they get different storage.

```text
 Partner app ──> Location gateway ──> Kafka "partner-locations" (key = partner id)
                                               │
          ┌────────────────────────────────────┼─────────────────────────┐
          ▼                                    ▼                         ▼
 Latest-location service              Tracking fan-out             History sink
 Redis HASH partner -> lat,lon,ts     (order for this partner,     (object storage,
 Redis GEO per city (dispatch)         push to the customer)        analytics, ETA)
          │                                    │
          ▼                                    ▼
 Dispatch service (GEOSEARCH)         WebSocket/SSE edge servers ──> customer apps

 Order service (MySQL, state machine, outbox) ──> Kafka "order-events"
                                              ──> tracking, notifications, support
```

| Decision | Reason |
|---|---|
| Kafka keyed by partner ID | Absorbs 50k/s bursts; per-partner order preserved; several consumers (latest location, fan-out, history) read independently |
| Redis for latest location and a GEO index per city | Fast overwrite of tiny records; `GEOSEARCH` for nearby partners; losing a few seconds of points is acceptable |
| Order state in MySQL with an outbox | State changes are transactions and must not be lost; events published reliably |
| WebSocket or SSE connections on stateless edge servers, with a connection registry (order → edge server) | Push instead of about 31k polls/s; any edge server can hold any connection |
| ETA from a model using road distance, live speed and historical data, recomputed on each update or every 30 s | Straight-line distance misleads on real roads |

**Deep dives an interviewer may pick.** *A partner's phone goes offline:* the latest-location record carries a timestamp; the customer view shows "last updated 2 min ago" instead of a frozen dot, and support is alerted if a picked-up order goes silent for long. *A city's traffic doubles:* partition Kafka and the edge tier by city; Redis GEO keys are per city, so cities scale independently. *Customer reconnects:* the client fetches current state by REST (`GET /orders/{id}/tracking`), then resubscribes; pushes are just an optimisation over that source of truth.

### Rubric for round B3

| Signal | Hire | No hire |
|---|---|---|
| Estimates | Computed 50k writes/s and tens of thousands of pushes/s, used them | No numbers, or numbers not used |
| Data separation | Ephemeral locations versus durable order state, different stores | Every location update written to the orders database |
| Real-time delivery | Push with reconnect strategy and a REST fallback | Customers polling every second without discussing load |
| Failure handling | Offline partners, reconnects, partitioning by city | Assumes perfect networks |

## 3.4 Round B4: behavioural (45 minutes)

SDE-1 behavioural rounds probe four or five stories in depth, with follow-ups such as "what exactly did you say?" and "what would you do differently?". Prepare one story per row and check it survives three follow-ups.

| Question | Competency | Follow-ups to expect |
|---|---|---|
| Tell me about a disagreement with a teammate | Collaboration, conflict | What was their argument? How did it end? Would you handle it the same way? |
| A time you had to deliver under a tight deadline | Prioritisation, ownership | What did you cut, and who agreed? What was the cost later? |
| A bug you shipped to users | Ownership, quality | How was it found? What did you change so it cannot recur? |
| Learning a new technology quickly | Learning ability | How did you know you understood it? What did you get wrong at first? |
| Going beyond your assigned work | Initiative | Why was it not someone else's job? What was the effect? |

**A model conflict answer.** *Situation:* during an internship, a teammate and I disagreed about whether our new reporting service should call the billing database directly or go through the billing team's API, which was slower to integrate with. *Task:* I owned the reporting service and needed a decision within the sprint. *Action:* instead of arguing preferences, I wrote down both options with their risks: direct access was faster to build but would break whenever billing changed its schema, as had happened twice that quarter. I asked the billing team how stable their API was and how soon they could add the two fields we needed. They could do it in four days. I shared the comparison with my teammate and our lead and proposed using the API with a temporary read of one table, behind an interface, until the fields arrived. *Result:* we shipped on time, removed the temporary read the next sprint, and when billing renamed columns a month later our service was unaffected. My teammate and I later used the same written comparison format for other decisions. The answer shows data over opinion, respect for the other view, a decision, and a verified result.

### Rubric for round B4

| Signal | Hire | No hire |
|---|---|---|
| Specificity | Real situations with names of systems, numbers and dates | Hypothetical answers ("I would...") |
| Ownership | Clear personal actions and accountability for mistakes | Blames teammates, managers or tools |
| Depth | Survives follow-ups with consistent details | Story falls apart under questioning |
| Reflection | Concrete lessons, applied later | No learning, or generic lessons |

## 3.5 Practical lessons

- Graph problems hide behind course and dependency stories; know Kahn's algorithm and when a heap changes the answer.
- Binary search on per-key version lists solves a family of "value at time t" problems.
- In machine coding, write the test script first, route all changes through one method, and handle bad input.
- In HLD, separate disposable high-volume data from durable state, and push instead of poll when numbers demand it.
- Behavioural stories must survive three follow-up questions; rehearse them aloud.
