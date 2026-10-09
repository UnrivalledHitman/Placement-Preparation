# Chapter 4: Loop C, SDE-2 Level
%Harder coding with ordered sets and BFS over routes, a concurrent message broker, a metrics platform at scale, and senior behavioural questions

| Round | Time | Problem |
|---|---|---|
| C1 Coding | 45 min | Sliding-window median; minimum buses between stops |
| C2 Concurrent LLD | 60 min | An in-memory message broker with partitions and consumer groups |
| C3 HLD | 45 min | A metrics and monitoring platform |
| C4 Behavioural | 45 min | Incidents, influence, disagreement, mentoring |

At this level interviewers expect you to drive: propose the plan, manage the time, raise trade-offs before being asked, and go deep where it matters.

## 4.1 Round C1: coding (45 minutes, two problems)

**Problem 1 (25 minutes).** Given an integer array and a window size `k`, return the median of every window of `k` consecutive elements (for even `k`, the mean of the two middle values).

**Problem 2 (20 minutes).** `routes[i]` lists the stops of bus `i`, which runs in a loop. Return the fewest buses you must board to travel from stop `source` to stop `target`, or −1 if impossible.

### Model solution, problem 1

Sorting every window costs O(n·k log k). Keep the window split into two ordered halves instead: `low` holds the smaller half (and one extra element when `k` is odd), `high` the larger half, so the median sits at their boundary. Java has no multiset, so the halves are `TreeSet`s of **indices** ordered by value and then index, which makes duplicates distinct and lets the element leaving the window be removed in O(log k). Time O(n log k), space O(k).

```java run Two ordered halves of the window, cross-checked against sorting
import java.util.*;

public class Main {
    static double[] medians(int[] a, int k) {
        Comparator<Integer> byValue = (i, j) -> a[i] != a[j] ? Integer.compare(a[i], a[j])
                                                             : Integer.compare(i, j);
        TreeSet<Integer> low = new TreeSet<>(byValue), high = new TreeSet<>(byValue);
        double[] out = new double[a.length - k + 1];
        for (int i = 0; i < a.length; i++) {
            if (i >= k && !low.remove(i - k)) high.remove(i - k);   // leaving the window
            low.add(i);
            high.add(low.pollLast());                  // largest of the low half moves up
            if (high.size() > low.size()) low.add(high.pollFirst());
            if (i >= k - 1)
                out[i - k + 1] = k % 2 == 1 ? a[low.last()]
                                            : ((double) a[low.last()] + a[high.first()]) / 2;
        }
        return out;
    }

    static double[] bySorting(int[] a, int k) {
        double[] out = new double[a.length - k + 1];
        for (int s = 0; s + k <= a.length; s++) {
            int[] w = Arrays.copyOfRange(a, s, s + k);
            Arrays.sort(w);
            out[s] = k % 2 == 1 ? w[k / 2] : ((double) w[k / 2 - 1] + w[k / 2]) / 2;
        }
        return out;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(medians(new int[]{1, 3, -1, -3, 5, 3, 6, 7}, 3)));
        System.out.println(Arrays.toString(medians(new int[]{5, 5, 5, 1, 1}, 2)));
        int big = Integer.MAX_VALUE;
        System.out.println(Arrays.toString(medians(new int[]{big, big, big}, 2)));
        Random rnd = new Random(3);
        int agree = 0;
        for (int t = 0; t < 300; t++) {
            int[] a = new int[1 + rnd.nextInt(40)];
            for (int i = 0; i < a.length; i++) a[i] = rnd.nextInt(10) - 5;   // duplicates
            int k = 1 + rnd.nextInt(a.length);
            if (Arrays.equals(medians(a, k), bySorting(a, k))) agree++;
        }
        System.out.println("random cross-check: " + agree + "/300 agree");
    }
}
```

The `Integer.MAX_VALUE` case is there on purpose: averaging two large `int`s without the `(double)` cast overflows to a negative number, a bug interviewers love to probe. The duplicates in the random test check that equal values in the window are handled, which is why the sets hold indices rather than values.

### Model solution, problem 2

The cost is counted in **buses**, not stops, so search over buses: breadth-first search where one level is one more bus. Map each stop to the routes through it; from the current stops, board every unused route and add all its stops to the next level. Each route is expanded once, so time is O(total stops across routes).

```java run BFS where each level is one more bus
import java.util.*;

public class Main {
    static int minBuses(int[][] routes, int source, int target) {
        if (source == target) return 0;
        Map<Integer, List<Integer>> routesAt = new HashMap<>();
        for (int r = 0; r < routes.length; r++)
            for (int stop : routes[r])
                routesAt.computeIfAbsent(stop, s -> new ArrayList<>()).add(r);
        boolean[] boarded = new boolean[routes.length];
        Set<Integer> seen = new HashSet<>(List.of(source));
        Deque<Integer> frontier = new ArrayDeque<>(List.of(source));
        for (int buses = 1; !frontier.isEmpty(); buses++) {
            for (int n = frontier.size(); n > 0; n--) {
                for (int r : routesAt.getOrDefault(frontier.poll(), List.of())) {
                    if (boarded[r]) continue;
                    boarded[r] = true;
                    for (int s : routes[r]) {
                        if (s == target) return buses;
                        if (seen.add(s)) frontier.add(s);
                    }
                }
            }
        }
        return -1;
    }

    public static void main(String[] args) {
        int[][] two = {{1, 2, 7}, {3, 6, 7}};
        System.out.println("change once:     " + minBuses(two, 1, 6));
        int[][] city = {{7, 12}, {4, 5, 15}, {6}, {15, 19}, {9, 12, 13}};
        System.out.println("unreachable:     " + minBuses(city, 15, 12));
        System.out.println("already there:   " + minBuses(city, 15, 15));
        System.out.println("not on a route:  " + minBuses(city, 99, 12));
        int[][] chain = {{1, 2}, {2, 3}, {3, 4}, {4, 5}, {1, 9, 5}};
        System.out.println("shortcut exists: " + minBuses(chain, 1, 5));
    }
}
```

The "shortcut" case shows why BFS over buses is right: following stops greedily along the chain would take four buses, but bus 4 goes straight from 1 to 5.

### Rubric for round C1

| Signal | Hire (SDE-2) | No hire |
|---|---|---|
| Problem 1 | Two balanced halves, explained invariants, handled duplicates and overflow | Re-sorting each window without improving; heaps with no plan for removals |
| Problem 2 | Modelled the graph correctly (buses as levels), O(total stops) | BFS over stops counting stops, not buses |
| Drive | Managed both problems in 45 minutes, tested with chosen edge cases | Needed the interviewer to propose tests |

## 4.2 Round C2: concurrent LLD (60 minutes)

**Problem.** Design and implement an in-memory message broker. Producers publish messages with a key to a topic; a topic has several partitions; messages with the same key must be consumed in publish order. Consumer **groups** each receive every message; within a group each message goes to exactly one consumer. Consumers commit offsets after processing. Many producers and consumers run concurrently.

### Model answer: design

| Element | Design | Why |
|---|---|---|
| Topic | Fixed number of partitions, each an append-only list | Order is defined per partition; appends are cheap |
| Partitioning | `floorMod(key.hashCode(), partitions)` | Same key → same partition → per-key order |
| Group | Committed offset per partition (`AtomicLongArray`) | Groups are independent; each tracks its own progress |
| Assignment | Each partition owned by exactly one consumer of a group | No two consumers in a group process the same partition, so per-key order holds |
| Delivery | Read from offset, process, then commit | At-least-once: a crash before commit redelivers, so processing must be idempotent |
| Concurrency | Lock per partition for append/read; atomics for offsets | Producers on different partitions never contend |

The test below runs 4 producer threads publishing 20,000 messages over 200 keys, a group of 3 consumers and a group of 1, all at once, and checks that every group saw every key's messages **in order, with no gaps and no duplicates**.

```java run Partitions, consumer groups and offsets under concurrent producers and consumers
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {
    record Message(String key, long seq) { }

    static class Topic {
        final List<List<Message>> partitions = new ArrayList<>();
        Topic(int n) { for (int i = 0; i < n; i++) partitions.add(new ArrayList<>()); }
        int partitionFor(String key) {
            return Math.floorMod(key.hashCode(), partitions.size());
        }

        void publish(Message m) {
            List<Message> log = partitions.get(partitionFor(m.key()));
            synchronized (log) { log.add(m); }
        }

        List<Message> read(int p, long from, int max) {
            List<Message> log = partitions.get(p);
            synchronized (log) {
                int end = (int) Math.min(log.size(), from + max);
                if (from >= end) return List.of();
                return new ArrayList<>(log.subList((int) from, end));
            }
        }
    }

    static class Group {
        final AtomicLongArray offsets;                 // committed offset per partition
        final Map<String, Long> lastSeq = new ConcurrentHashMap<>();
        final AtomicInteger violations = new AtomicInteger();
        final LongAdder processed = new LongAdder();
        Group(int partitions) { offsets = new AtomicLongArray(partitions); }

        void process(Message m) {          // per key, seq must go 0, 1, 2, ...
            Long prev = lastSeq.put(m.key(), m.seq());
            if (m.seq() != (prev == null ? 0 : prev + 1)) violations.incrementAndGet();
            processed.increment();
        }
    }

    static Thread consumer(Topic t, Group g, List<Integer> owned, AtomicBoolean producing) {
        return new Thread(() -> {
            while (true) {
                boolean finished = !producing.get();   // read before polling: none missed
                boolean idle = true;
                for (int p : owned) {
                    List<Message> batch = t.read(p, g.offsets.get(p), 100);
                    for (Message m : batch) g.process(m);
                    if (batch.isEmpty()) continue;
                    g.offsets.addAndGet(p, batch.size());   // commit after processing
                    idle = false;
                }
                if (idle && finished) return;
                if (idle) Thread.yield();
            }
        });
    }

    static List<Thread> join(Topic t, Group g, int members, AtomicBoolean producing) {
        List<Thread> threads = new ArrayList<>();
        for (int c = 0; c < members; c++) {
            List<Integer> owned = new ArrayList<>();
            for (int p = c; p < t.partitions.size(); p += members)   // round-robin
                owned.add(p);
            threads.add(consumer(t, g, owned, producing));
        }
        return threads;
    }

    public static void main(String[] args) throws Exception {
        Topic topic = new Topic(6);
        AtomicBoolean producing = new AtomicBoolean(true);
        Group billing = new Group(6), analytics = new Group(6);
        List<Thread> consumers = new ArrayList<>(join(topic, billing, 3, producing));
        consumers.addAll(join(topic, analytics, 1, producing));
        consumers.forEach(Thread::start);

        List<Thread> producers = new ArrayList<>();
        for (int p = 0; p < 4; p++) {
            int id = p;
            producers.add(new Thread(() -> {           // each producer owns 50 keys
                for (int i = 0; i < 5_000; i++)
                    topic.publish(new Message("meter-" + (id * 50 + i % 50), i / 50));
            }));
        }
        producers.forEach(Thread::start);
        for (Thread t : producers) t.join();
        producing.set(false);
        for (Thread t : consumers) t.join(60_000);

        System.out.println("published: " + 4 * 5_000);
        for (var e : List.of(Map.entry("billing (3 consumers)", billing),
                             Map.entry("analytics (1 consumer)", analytics))) {
            Group g = e.getValue();
            System.out.printf("%-23s processed %d, keys %d, order violations %d%n",
                              e.getKey(), g.processed.sum(), g.lastSeq.size(),
                              g.violations.get());
        }
    }
}
```

Both groups processed all 20,000 messages for all 200 keys with no order violations, even though producers and consumers ran concurrently and the billing group split the partitions across three threads.

**Follow-ups to expect.** *A consumer crashes:* its partitions must be reassigned (a **rebalance**); the new owner resumes from the committed offset, so messages processed but not committed are delivered again: hence idempotent processing (Kafka guide, Chapter 5). *More consumers than partitions:* the extra consumers sit idle; partitions are the unit of parallelism. *Memory grows forever:* retention by time or size, deleting old segments once every group has committed past them (or regardless, as Kafka does). *Back-pressure:* bounded batches per poll, and producers slowed when a partition exceeds a size limit.

### Rubric for round C2

| Signal | Hire (SDE-2) | No hire |
|---|---|---|
| Model | Partitions, groups and offsets explained before code; ordering argued from partition ownership | A single shared queue; no per-key ordering story |
| Concurrency | Per-partition locks, atomic offsets, correct termination; named the race between "done" and "last poll" | `synchronized` on everything, or unsynchronised lists |
| Semantics | At-least-once explained with idempotent consumers; rebalancing discussed | Claims exactly-once without mechanism |
| Testing | A concurrent test that checks order, gaps and duplicates | Single-threaded demo only |

## 4.3 Round C3: HLD (45 minutes)

**Problem.** Design a metrics and monitoring platform (like Prometheus, Datadog or CloudWatch) for 50,000 hosts, each exposing about 500 time series sampled every 10 seconds. Users query dashboards over hours to months and define alerts.

### Model answer

**Requirements.** Ingest all samples with less than a minute of delay; dashboards over the last hour load in about a second; alerts evaluate every 30–60 seconds; keep raw data for 15 days and lower resolution for 13 months; the monitoring system must be **more available than the systems it watches**.

```python run Ingest rate, storage by tier, and what one bad label does
hosts, series_per_host, interval = 50_000, 500, 10
series = hosts * series_per_host
rate = series / interval
print(f'active series: {series / 1e6:.0f} M; samples per second: {rate / 1e6:.1f} M')

# delta-of-delta timestamps and XOR'd floats (Gorilla, Facebook 2015)
bytes_per_sample = 1.37
raw_day_gb = rate * 86_400 * bytes_per_sample / 1e9
print(f'raw, compressed: {raw_day_gb:.0f} GB/day -> 15 days = {raw_day_gb * 15 / 1e3:.1f} TB')

agg_bytes = 5 * 2            # min, max, sum, count, last; about 2 bytes each compressed
for name, step_s, days in [('5-minute rollups', 300, 90), ('1-hour rollups', 3600, 395)]:
    gb_day = series * (86_400 / step_s) * agg_bytes / 1e9
    print(f'{name}: {gb_day:.0f} GB/day -> {days} days = {gb_day * days / 1e3:.1f} TB')

users = 1_000_000
print(f'a user_id label on a metric with 20 series per host: '
      f'{20 * users / 1e6:.0f} M series per host')
```

**Architecture.**

```text
 Agents on hosts (scrape local exporters, batch, compress)
        │ push over HTTPS (or servers pull from agents)
        ▼
 Ingestion gateways (auth, validation, cardinality limits per tenant)
        │
        ▼
 Kafka (partitioned by series ID hash)  ──> buffer during storage outages
        │
        ▼
 Time-series storage nodes, sharded by series ID, replicated ×3
   in-memory head block (last 2 h) ──> compressed immutable blocks on disk
   ──> object storage for old blocks; compactor builds 5-min and 1-h rollups
        │
        ▼
 Query layer (fans out by shard, merges, picks resolution by time range, caches results)
        │                                  │
   Dashboards                     Alert evaluator (rules every 30–60 s)
                                    ──> alert manager (dedupe, group, route, silence)
                                    ──> pager / chat / email
```

| Decision | Reason |
|---|---|
| Compression designed for time series (delta-of-delta, XOR floats) | About 1.4 bytes per sample instead of 16; it is what makes raw storage affordable |
| Shard by series ID, keep each series' recent data in memory | Writes are spread evenly; recent queries (most of them) hit memory |
| Rollups for older data, and queries pick resolution from the range | A 13-month graph reads hourly points, not 3 million raw samples per series |
| Cardinality limits at ingestion | One label with unbounded values (user ID, request ID) multiplies series and can take the whole system down |
| Kafka between ingestion and storage | Storage maintenance or failures do not lose data; replay rebuilds a shard |
| Alerting isolated from dashboards, with its own capacity | Heavy ad-hoc queries must not delay alerts; meta-monitoring watches the monitor ("dead man's switch" alert) |

The estimates hold a surprise: the 5-minute tier is a quarter of the raw size per day (twelve times fewer points, but five aggregates each), so keeping it for 90 days costs more in total (6.5 TB) than 15 days of raw data (4.4 TB). The hourly tier is what makes 13 months cheap; if storage is tight, shorten the 5-minute retention first.

### Rubric for round C3

| Signal | Hire (SDE-2) | No hire |
|---|---|---|
| Estimates | Millions of samples/s, storage by tier, used to justify compression and rollups | No numbers |
| Data model | Series identified by name + labels; cardinality risk raised unprompted | Stores samples in a relational table without discussing volume |
| Architecture | Buffering, sharding, rollups, query fan-out, isolated alerting | One database behind an API |
| Operations | Monitoring the monitor, multi-tenant limits, retention | Not considered |

## 4.4 Round C4: senior behavioural (45 minutes)

| Question | Competency | What a senior answer includes |
|---|---|---|
| Tell me about a production incident you handled | Ownership under pressure | Mitigation first, clear communication, root cause, the systemic fix and how you verified it |
| A time you influenced a decision without authority | Influence | Data, prototypes or written proposals; listening to objections; the outcome and relationships afterwards |
| Disagreeing with your manager | Judgement, candour | Raising concerns with evidence, then committing (or escalating for a good reason) |
| Helping someone else grow | Multiplying the team | Specific person, what you did over time, how their work changed |
| A technical decision you would make differently now | Reflection | The context at the time, what you learned, how you decide differently today |

**A model incident answer.** *Situation:* at 18:40 on a weekday, payment confirmations in our app started failing for about 30% of users; checkout success fell from 97% to 68%. *Task:* I was on call for the payments service. *Action:* I first checked what had changed and saw a deploy 20 minutes earlier, so I rolled it back within 6 minutes, which restored success to 96%,, posting updates every 15 minutes. The remaining 1% gap came from requests that had timed out during the incident; I worked with support to identify 412 orders charged but not confirmed and ran a reconciliation job to confirm them. The root cause was a connection-pool setting that halved the pool under a new configuration key nobody had noticed was renamed. *Result:* no customer was charged without an order. In the blameless review I proposed two changes: configuration validation at start-up that fails on unknown keys, and a canary stage that compares checkout success against the stable version. Both shipped within two weeks, and the canary later stopped a different bad release automatically. The answer shows calm prioritisation (mitigate, then fix), numbers, care for customers, and systemic prevention, which is what senior interviewers listen for.

### Rubric for round C4

| Signal | Hire (SDE-2) | No hire |
|---|---|---|
| Scope | Stories with impact beyond own tasks (team, system, customers) | Only individual coding tasks |
| Judgement | Explains trade-offs and why the chosen path was right then | Decisions without reasons |
| People | Credits others precisely, describes how they helped others | Hero stories, or blame |
| Prevention | Systemic fixes with evidence they worked | "We were more careful afterwards" |

## 4.5 Practical lessons

- Ordered sets of indices give a multiset in Java; watch integer overflow when averaging.
- When cost is counted in something other than nodes (buses, not stops), make that the BFS level.
- For concurrent designs, argue ordering from ownership (one consumer per partition), make termination explicit, and test order under real concurrency.
- In large-scale HLD, let the estimates change the design (compression, rollups, cardinality limits).
- Senior behavioural answers show scope, judgement, care for others and prevention, with evidence.
