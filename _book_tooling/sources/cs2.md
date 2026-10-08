## Part 3 solutions

### C3.1 Sizing for a target

I/O formula: 16 × (1 + 40 / 8) = 16 × 6 = **96 threads**. Little's law: 2,000 requests/s × 0.048 s = **96 requests in flight**, so 96 busy threads on average: the two methods agree because both describe the same request profile.

The database pool limits throughput independently: 30 connections, each held 10 ms, allow at most 30 / 0.010 = **3,000 queries per second**. At 2,000 requests per second with one query each, on average 20 of the 30 connections are busy (67% utilisation); spikes will queue for connections, and above 3,000 requests per second no number of request threads helps. Size the request pool with headroom (say 120 threads), and alert on connection-pool wait time, not only on thread usage.

```java run Checking C3.1
public class Main {
    public static void main(String[] args) {
        int cores = 16; double waitMs = 40, cpuMs = 8, rps = 2_000;
        System.out.printf("I/O formula : %.0f threads%n", cores * (1 + waitMs / cpuMs));
        System.out.printf("Little's law: %.0f in flight%n", rps * (waitMs + cpuMs) / 1000);
        System.out.printf("DB pool cap : %.0f queries/s, busy at 2,000 rps: %.0f%n",
                30 / 0.010, rps * 0.010);
    }
}
```

### C3.2 CallerRunsPolicy as back-pressure

```java run Which thread ran each task?
import java.util.*;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        ThreadPoolExecutor pool = new ThreadPoolExecutor(3, 5, 30, TimeUnit.SECONDS,
                new ArrayBlockingQueue<>(4), new ThreadPoolExecutor.CallerRunsPolicy());
        ConcurrentSkipListMap<Integer, String> ranOn = new ConcurrentSkipListMap<>();
        for (int i = 1; i <= 12; i++) {
            int id = i;
            pool.execute(() -> {
                ranOn.put(id, Thread.currentThread().getName()
                        .equals("main") ? "main" : "pool");
                try { Thread.sleep(300); } catch (InterruptedException e) { }
            });
        }
        pool.shutdown();
        pool.awaitTermination(10, TimeUnit.SECONDS);
        List<Integer> byCaller = ranOn.entrySet().stream()
                .filter(e -> e.getValue().equals("main")).map(Map.Entry::getKey).toList();
        System.out.println("first task the caller had to run: " + byCaller.get(0));
        System.out.println("tasks 1-9 all ran on pool threads: "
                + ranOn.headMap(10).values().stream().allMatch("pool"::equals));
        System.out.println("tasks run: " + ranOn.size() + ", none rejected or lost");
    }
}
```

Tasks 1–3 start the core threads, 4–7 fill the queue, 8–9 start the two extra threads, and task 10 finds 5 busy threads and a full queue, so `main` runs it itself. For those 300 ms `main` cannot submit anything; meanwhile the pool works through its backlog. Whether task 11 is accepted or also runs on `main` depends on whether `main`'s task finishes slightly before or after the pool's first tasks (on Windows, sleep granularity makes either possible; this run printed only the stable facts), but no task is ever rejected or lost. That pause is the point: the producer is slowed to the pool's pace instead of tasks being dropped or queued without limit. In a server, though, "the caller" may be a request thread, so the request that triggered the rejection gets slower; that is usually better than failing it.

### C3.3 invokeAll with a deadline

```java run Tasks still running at the deadline are cancelled
import java.util.*;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        int[] durations = {100, 200, 800, 900, 300};
        List<Callable<String>> tasks = new ArrayList<>();
        for (int i = 0; i < durations.length; i++) {
            int id = i + 1, ms = durations[i];
            tasks.add(() -> { Thread.sleep(ms); return "report " + id; });
        }
        try (ExecutorService pool = Executors.newFixedThreadPool(5)) {
            List<Future<String>> results = pool.invokeAll(tasks, 500,
                    TimeUnit.MILLISECONDS);
            for (int i = 0; i < results.size(); i++) {
                Future<String> f = results.get(i);
                System.out.printf("task %d (%d ms): %s%n", i + 1, durations[i],
                        f.isCancelled() ? "cancelled" : f.get());
            }
        }
    }
}
```

`invokeAll` returns when all tasks finish or the timeout expires, whichever comes first, and cancels (interrupts) the ones still running. Every returned future is done, so `get()` never blocks; check `isCancelled()` first, because `get()` on a cancelled future throws.

### C3.4 Best price from four suppliers

```java run Timeouts and failures become "no quote"
import java.util.*;
import java.util.concurrent.*;

public class Main {
    record Quote(String supplier, int price) { }

    static CompletableFuture<Quote> ask(String name, long ms, int price, boolean fails,
            Executor ex) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                Thread.sleep(ms);
            } catch (InterruptedException e) {
                throw new CompletionException(e);
            }
            if (fails) throw new IllegalStateException(name + " is down");
            return new Quote(name, price);
        }, ex);
    }

    public static void main(String[] args) {
        try (ExecutorService io = Executors.newFixedThreadPool(4)) {
            List<CompletableFuture<Quote>> quotes = List.of(
                    ask("Alpha", 120, 410, false, io), ask("Beta", 80, 395, false, io),
                    ask("Gamma", 2_000, 350, false, io), ask("Delta", 60, 330, true, io))
                .stream()
                .map(f -> f.completeOnTimeout(null, 300, TimeUnit.MILLISECONDS)
                        .exceptionally(e -> null))
                .toList();
            CompletableFuture.allOf(quotes.toArray(new CompletableFuture[0])).join();
            List<Quote> answered = quotes.stream().map(CompletableFuture::join)
                    .filter(Objects::nonNull).toList();
            System.out.println("answered in time: " + answered);
            System.out.println("best: " + answered.stream()
                    .min(Comparator.comparingInt(Quote::price)).orElseThrow());
        }
    }
}
```

Gamma had the cheapest price but answered too late, and Delta failed; both become `null` and are filtered out, so one bad supplier can neither fail nor delay the whole request. The overall latency is bounded at about 300 ms. As the guide warns, Gamma's call keeps running in the background after the timeout; a real client should also set a 300 ms timeout on the HTTP call itself.

### C3.5 Hedged requests

```java run First answer wins; the loser is interrupted
import java.util.*;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        Map<String, String> fate = new ConcurrentHashMap<>();
        CountDownLatch bothDone = new CountDownLatch(2);
        Callable<String> replica1 = replica("replica-1", 300, fate, bothDone);
        Callable<String> replica2 = replica("replica-2", 50, fate, bothDone);
        try (ExecutorService pool = Executors.newFixedThreadPool(2)) {
            String winner = pool.invokeAny(List.of(replica1, replica2));
            bothDone.await(5, TimeUnit.SECONDS);
            System.out.println("winner: " + winner);
            System.out.println("replica-1: " + fate.get("replica-1") + ", replica-2: "
                    + fate.get("replica-2"));
        }
    }

    static Callable<String> replica(String name, long ms, Map<String, String> fate,
            CountDownLatch done) {
        return () -> {
            try {
                Thread.sleep(ms);
                fate.put(name, "answered");
                return name;
            } catch (InterruptedException e) {
                fate.put(name, "interrupted (cancelled)");
                throw e;
            } finally {
                done.countDown();
            }
        };
    }
}
```

`invokeAny` returns the first successful result and cancels the rest, interrupting them. With `CompletableFuture.anyOf` the result is the same, but cancelling a `CompletableFuture` does not interrupt its task, so the loser would keep running. Production hedging usually waits briefly (for example, the 95th-percentile latency) before sending the second request, so that it doubles the load only for the slowest few percent of requests.

### C3.6 Blocking the common pool

```java run Sixty blocking calls: common pool versus a dedicated executor
import java.util.*;
import java.util.concurrent.*;

public class Main {
    static String remote() {
        try { Thread.sleep(200); } catch (InterruptedException e) { }
        return "ok";
    }

    static long runAll(Executor ex) {
        long t0 = System.nanoTime();
        List<CompletableFuture<String>> fs = new ArrayList<>();
        for (int i = 0; i < 60; i++)
            fs.add(ex == null ? CompletableFuture.supplyAsync(Main::remote)
                              : CompletableFuture.supplyAsync(Main::remote, ex));
        fs.forEach(CompletableFuture::join);
        return (System.nanoTime() - t0) / 1_000_000;
    }

    public static void main(String[] args) {
        long common = runAll(null);
        long dedicated;
        try (ExecutorService io = Executors.newFixedThreadPool(60)) {
            dedicated = runAll(io);
        }
        int p = ForkJoinPool.commonPool().getParallelism();
        System.out.println("common pool needs about ceil(60 / parallelism) rounds of 200 ms");
        System.out.println("dedicated executor at least twice as fast: "
                + (dedicated * 2 <= common));
        System.out.println("common pool parallelism is cores - 1: "
                + (p == Math.max(1, Runtime.getRuntime().availableProcessors() - 1)));
    }
}
```

The common pool has cores − 1 threads (15 on a 16-core machine) and does not add threads when tasks block in `sleep` or socket reads, so sixty 200 ms calls run in waves: about four waves (800 ms) instead of one (200 ms). Worse, the pool is shared by the whole JVM: every parallel stream and every `CompletableFuture` stage without an executor now waits behind these blocked calls, so an unrelated part of the application slows down. Fix: pass a dedicated, bounded executor (or a virtual-thread executor) to every async call that blocks.

### C3.7 The report that stopped

`scheduleAtFixedRate` suppresses all future runs of a task once one run throws an exception; the exception is stored in the returned `ScheduledFuture`, which nobody calls `get()` on, so nothing is logged. Three days in, one export hit an exception (a database timeout, a bad row), and the schedule silently ended.

Fix: catch everything inside the task, log it with context, and count it in a metric; alert if the last successful export is older than, say, 15 minutes.

```text
scheduler.scheduleAtFixedRate(() -> {
    try {
        exportReadings();
        lastSuccess.set(Instant.now());          // exposed as a gauge for alerting
    } catch (Throwable t) {                      // also catches Errors (OutOfMemoryError)
        log.error("export failed; will retry next run", t);
        failures.increment();
    }
}, 0, 5, TimeUnit.MINUTES);
```

Also note the difference between fixed **rate** (start every 5 minutes; a slow run makes the next start late, never concurrent) and fixed **delay** (5 minutes between the end of one run and the start of the next).

## Part 4 solutions

### C4.1 A polite crawler

```java run Virtual threads limited by a semaphore
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {
    public static void main(String[] args) throws Exception {
        Semaphore polite = new Semaphore(4);
        AtomicInteger inFlight = new AtomicInteger(), peak = new AtomicInteger(),
                fetched = new AtomicInteger();
        long t0 = System.nanoTime();
        try (ExecutorService ex = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int page = 1; page <= 48; page++) {
                ex.submit(() -> {
                    polite.acquire();
                    try {
                        peak.accumulateAndGet(inFlight.incrementAndGet(), Math::max);
                        Thread.sleep(50);                  // the HTTP fetch
                        fetched.incrementAndGet();
                        inFlight.decrementAndGet();
                    } finally { polite.release(); }
                    return null;
                });
            }
        }
        long ms = (System.nanoTime() - t0) / 1_000_000;
        System.out.println("pages fetched " + fetched.get()
                + ", peak concurrent fetches <= 4: " + (peak.get() <= 4));
        System.out.println("took at least 12 x 50 ms: " + (ms >= 600) + ", under 1.5 s: "
                + (ms < 1_500));
    }
}
```

48 virtual threads start immediately, but only 4 hold permits at a time, so the crawl takes ⌈48 / 4⌉ = 12 rounds of 50 ms, at least 600 ms. Threads waiting in `acquire()` are virtual, so they cost almost nothing. This is the virtual-thread pattern in one program: one thread per task for simple blocking code, and an explicit limit on the shared resource.

### C4.2 A concurrency test harness

```java run Racing threads at a start gate, many times
import java.util.concurrent.*;
import java.util.function.*;

public class Main {
    interface Account { void withdraw(int amount); int balance(); }

    static class Racy implements Account {
        private int balance = 100;
        public void withdraw(int amount) {
            // check ... then act
            if (balance >= amount) { Thread.yield(); balance -= amount; }
        }
        public int balance() { return balance; }
    }

    static class Safe implements Account {
        private int balance = 100;
        public synchronized void withdraw(int amount) {
            if (balance >= amount) balance -= amount;
        }
        public synchronized int balance() { return balance; }
    }

    static int violations(Supplier<Account> make, int threads,
            int rounds) throws Exception {
        int bad = 0;
        try (ExecutorService pool = Executors.newFixedThreadPool(threads)) {
            for (int r = 0; r < rounds; r++) {
                Account acc = make.get();
                CountDownLatch gate = new CountDownLatch(1),
                        done = new CountDownLatch(threads);
                for (int t = 0; t < threads; t++)
                    pool.submit(() -> {
                        try {
                            gate.await();
                            acc.withdraw(100);
                        } catch (InterruptedException e) {
                        } finally {
                            done.countDown();
                        }
                    });
                gate.countDown();                          // release all threads at once
                done.await();
                // done happens-before reading balance
                if (acc.balance() < 0) bad++;
            }
        }
        return bad;
    }

    public static void main(String[] args) throws Exception {
        System.out.println("racy account went negative in some rounds: "
                + (violations(Racy::new, 2, 2_000) > 0));
        System.out.println("synchronized account negative rounds    : "
                + violations(Safe::new, 2, 2_000));
    }
}
```

The start gate lines the threads up so they hit the critical section together, which makes the rare interleaving common; repeating the round thousands of times does the rest. The invariant ("balance never negative") is checked after `done.await()`, whose happens-before edge makes the threads' writes visible. The harness can show the presence of a race; zero violations for the synchronised version is evidence, not proof, which is why the fix should also be correct by reasoning.

### C4.3 Virtual threads and their limits

```java run Memory and throughput estimates
public class Main {
    public static void main(String[] args) {
        int concurrent = 5_000;
        System.out.printf("platform thread stacks: %.1f GiB reserved%n",
                concurrent * 1.0 / 1024);
        System.out.printf("virtual thread stacks : %.1f MiB%n", concurrent * 2.0 / 1024);
        double latency = 0.200 + 0.010;
        System.out.printf("throughput by Little's law: %.0f requests/s%n",
                concurrent / latency);
        System.out.printf("database pool limit       : %.0f queries/s%n", 50 / 0.010);
    }
}
```

Platform threads reserve almost 5 GiB of stack address space for 5,000 requests (not all of it committed, but enough to need large machines and tuning); virtual threads need about 10 MiB. If nothing else limited it, 5,000 concurrent requests at 210 ms each would allow about 23,800 requests per second. But the database pool allows only 5,000 queries per second, so it becomes the bottleneck: beyond that, virtual threads simply queue for connections and latency climbs. Virtual threads remove the **thread** limit, not the **resource** limits; size the connection pool, add a semaphore or rate limiter in front of the database, and set acquisition timeouts so requests fail fast instead of piling up.

### C4.4 Read the thread dump

This is a **thread-starvation deadlock**. `buildReport` runs on `report-pool` and submits its sections to the **same** pool, then waits for them with `get()`. Under load, all 16 threads are running `buildReport` tasks, all waiting for section tasks that sit in the queue (40 tasks) with no free thread to run them. Nothing can make progress, so every request times out, although CPU is idle and no lock is involved: `jstack` reports no deadlock, because the threads are parked on futures, not monitors.

| Fix | How |
|---|---|
| Separate pools | Run sections on a different executor from the reports that wait for them |
| Do not block | Compose sections with `CompletableFuture.allOf(...).thenApply(...)`, so a report task returns instead of waiting |
| Use fork/join correctly | `RecursiveTask` with `fork()`/`join()` lets a waiting worker run other tasks |
| Virtual threads | One virtual thread per section; waiting is cheap and no fixed pool can be exhausted |

The general rule: a task must never wait for another task in the same bounded pool.

### C4.5 Batching ingestion with graceful shutdown

```java run Bounded queue, batching writer, poison pill
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {
    record Reading(int meter, int seq) { }
    static final Reading POISON = new Reading(-1, -1);

    public static void main(String[] args) throws Exception {
        BlockingQueue<Reading> queue = new ArrayBlockingQueue<>(1_000);
        List<Integer> batchSizes = Collections.synchronizedList(new ArrayList<>());
        Set<Reading> stored = ConcurrentHashMap.newKeySet();

        Thread writer = new Thread(() -> {
            List<Reading> batch = new ArrayList<>(100);
            try {
                while (true) {
                    Reading r = queue.poll(50, TimeUnit.MILLISECONDS);
                    if (r == POISON) break;
                    if (r != null) batch.add(r);
                    if (batch.size() == 100 || (r == null && !batch.isEmpty())) {
                        stored.addAll(batch);
                        batchSizes.add(batch.size());
                        batch.clear();
                        // "INSERT ..."
                    }
                }
                if (!batch.isEmpty()) {
                        stored.addAll(batch); batchSizes.add(batch.size()); }
            } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        }, "writer");
        writer.start();

        try (ExecutorService producers = Executors.newFixedThreadPool(4)) {
            for (int m = 0; m < 4; m++) {
                int meter = m;
                producers.submit(() -> { for (int s = 0; s < 5_000; s++) queue.put(
                        new Reading(meter, s)); return null; });
            }
        }                                                  // all producers finished
        queue.put(POISON);                                 // after every real reading
        writer.join();

        System.out.println("readings stored " + stored.size() + " of 20000");
        System.out.println("every batch between 1 and 100: "
                + batchSizes.stream().allMatch(b -> b >= 1 && b <= 100));
        System.out.println("batches written: at least " + (20_000 / 100) + ": "
                + (batchSizes.size() >= 200));
    }
}
```

The bounded queue gives back-pressure: if the writer (the database) falls behind, `put` blocks the producers instead of growing memory. Batches flush on size (100) or after 50 ms of quiet. Shutdown is ordered: producers finish, the poison pill is queued **behind** every real reading, and the writer flushes its partial batch before exiting, so nothing accepted is lost. In Spring, run these steps from `SmartLifecycle.stop()`.
