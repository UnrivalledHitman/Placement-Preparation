# How to use this practice book
%25 exercises matching the Java Concurrency guide, with hints kept separate and executed solutions

Each part matches chapters of the **Java Concurrency** guide. Code exercises are single-file Java programs: save them as `Main.java` and run `java Main.java` on JDK 21 or later (the solutions were run on JDK 25). As in the guide, the programs print facts that do not depend on timing, so your output should match the solutions even though the interleavings differ on every run.

| Type | What you do |
|---|---|
| Code | Write and run a program |
| Numerical | Calculate, then check |
| Concept | Explain the mechanism and the guarantees |
| Debug | Find the bug, explain the consequence, fix it |

**Marking scheme.** Mark ✓ (solved alone), ~ (with the hint) or ✗ (needed the solution). For Code, ✓ also requires that the program is **correct by design**, not just passing: name the happens-before edge or the atomic operation that makes each shared access safe. Redo every ~ and ✗ a week later.

| Part | Guide chapters | Topic | Exercises |
|---|---|---|---|
| 1 | 1–2 | Races and the memory model | 6 |
| 2 | 3–4 | Locks, atomics and collections | 7 |
| 3 | 5–6 | Executors and CompletableFuture | 7 |
| 4 | 7–9 | Synchronisers, virtual threads and patterns | 5 |

# Exercises

## Part 1: Races and the memory model

**C1.1 · Easy · Numerical · Amdahl's ceiling.** A report job is 20% serial. What speed-up do 8 cores give? What is the most any number of cores could give? How many cores are needed for a 4× speed-up?

**C1.2 · Medium · Debug · Duplicate IDs.** An ID generator is `static long next = 0; static long nextId() { return next++; }`, called by 8 threads 250,000 times each. Show that it hands out duplicate IDs, explain why, and fix it two ways.

**C1.3 · Medium · Concept · Which outcomes are possible?** `x` and `y` start at 0. Thread 1 runs `x = 1; r1 = y;` and thread 2 runs `y = 1; r2 = x;`. List the possible (r1, r2) pairs (a) with plain fields, (b) with `x` and `y` declared `volatile`. Explain the difference using the JMM.

**C1.4 · Medium · Debug · The expensive cache loaded eight times.** A service lazily loads a tariff table with `if (table == null) table = loadTable();`, where `loadTable()` takes 100 ms. Eight request threads arrive at once. Show what happens, name both bugs in the pattern, and fix it.

**C1.5 · Medium · Code · Make it immutable.** Make this class immutable and thread-safe without locks, and demonstrate that callers cannot change it: `class MeterReading { String meterId; Date takenAt; List<Integer> hourly; }` with getters and setters.

**C1.6 · Hard · Code · Stopping a worker.** A worker loops `while (running) { process(); }` with a plain `boolean running`. Explain why it may never stop, why adding `Thread.sleep(1)` in the loop seems to fix it, and write a worker that stops reliably using interruption, including when it is blocked waiting for work.

## Part 2: Locks, atomics and collections

**C2.1 · Medium · Code · A bounded buffer with conditions.** Implement a bounded buffer of capacity 4 with one `ReentrantLock` and two conditions, `notFull` and `notEmpty`. Run 3 producers putting 1,000 numbers each and 2 consumers, and verify that every number is consumed exactly once.

**C2.2 · Medium · Code · Transfers without deadlock, using tryLock.** Ten accounts start with 1,000 each. Eight threads make 20,000 random transfers between random pairs, each locking both accounts with `tryLock` and backing off on failure. Verify that the run finishes and that money is conserved.

**C2.3 · Medium · Code · Dining philosophers.** Five philosophers each need the forks on both sides to eat. Show a solution that cannot deadlock, have each philosopher eat 10,000 times, and report the meals eaten.

**C2.4 · Easy · Debug · Locking on a changing object.** What is wrong with this counter, and what happens when 8 threads call `increment()` a million times each?

```text
class Counter {
    private Integer count = 0;
    void increment() { synchronized (count) { count++; } }
}
```

**C2.5 · Hard · Code · A lock-free stack.** Implement a Treiber stack (`push` and `pop` with `AtomicReference` and CAS). Have 4 threads push 100,000 distinct numbers each while 4 threads pop, and verify that nothing is lost or duplicated.

**C2.6 · Medium · Code · Concurrent word counts.** Count words across 8 threads in a generated text of 2 million words using `ConcurrentHashMap<String, LongAdder>`, and compare with a sequential count.

**C2.7 · Medium · Concept · Choose the structure.** Pick a class for each and justify: (a) a request counter updated by every request and read by a metrics scraper every 15 s; (b) a list of event listeners registered at start-up and notified on every event; (c) a cache of tariff objects by tariff code, loaded on first use; (d) jobs handed from 4 HTTP threads to 2 workers, with back-pressure; (e) a unique sequence number per invoice.

## Part 3: Executors and CompletableFuture

**C3.1 · Easy · Numerical · Sizing for a target.** Each request spends 40 ms waiting on the database and 8 ms on the CPU, on a 16-core machine. Size the request pool with the I/O formula and with Little's law for 2,000 requests per second. What else limits throughput if the database connection pool has 30 connections and each query holds one for 10 ms?

**C3.2 · Medium · Code · CallerRunsPolicy as back-pressure.** Build a pool with core 3, max 5, queue 4 and `CallerRunsPolicy`. Submit 12 tasks that each take 300 ms and record which thread ran each one. Which tasks did the caller run, and why is that useful?

**C3.3 · Medium · Code · invokeAll with a deadline.** Five report tasks take 100, 200, 800, 900 and 300 ms. Run them with `invokeAll(tasks, 500, MILLISECONDS)` and report which completed and which were cancelled.

**C3.4 · Medium · Code · Best price from four suppliers.** Query four supplier services in parallel (latencies 120, 80, 2,000 and 60 ms; the last one throws an exception). Give each 300 ms, ignore failures and slow suppliers, and return the best price among those that answered.

**C3.5 · Medium · Code · Hedged requests.** Send the same read to two replicas (latencies 300 ms and 50 ms) and use whichever answers first. Show which replica won and that the loser was told to stop.

**C3.6 · Hard · Debug · Blocking the common pool.** Sixty `supplyAsync` calls each block for 200 ms on a remote call, without an executor argument. Show the effect compared with a dedicated executor, explain it, and explain what else in the JVM suffers.

**C3.7 · Medium · Concept · The report that stopped.** A `ScheduledExecutorService` runs `scheduleAtFixedRate(this::exportReadings, 0, 5, MINUTES)`. After three days the exports stop, with nothing in the logs. Explain and fix.

## Part 4: Synchronisers, virtual threads and patterns

**C4.1 · Medium · Code · A polite crawler.** Fetch 48 pages (each fetch blocks 50 ms) using one virtual thread per page, but never more than 4 fetches at once. Verify the peak concurrency and estimate the total time.

**C4.2 · Medium · Code · A concurrency test harness.** Write a harness that starts N threads at exactly the same moment with a latch, repeats the experiment many times and checks an invariant. Use it to show that a check-then-act `withdraw` lets an account go negative, and that a synchronised version never does.

**C4.3 · Medium · Numerical · Virtual threads and their limits.** A service holds 5,000 concurrent requests, each waiting 200 ms on an HTTP call and then running one 10 ms database query. Estimate stack memory with platform threads (1 MiB each) versus virtual threads (about 2 KiB each), the request throughput if nothing else limits it, and the throughput limit imposed by a 50-connection database pool.

**C4.4 · Medium · Debug · Read the thread dump.** A service stops responding. A thread dump shows all 16 threads of `report-pool` as `WAITING (parking)` in `FutureTask.get`, called from `ReportService.buildSection`, which runs inside `ReportService.buildReport`, also on `report-pool`. The pool's queue holds 40 tasks. Diagnose and fix.

**C4.5 · Hard · Code · Batching ingestion with graceful shutdown.** Meter readings arrive from 4 producer threads (5,000 each) into a bounded queue. One writer thread stores them in batches of up to 100, flushing a partial batch after 50 ms of quiet. On shutdown, every reading accepted must be written. Implement it and verify the counts.
