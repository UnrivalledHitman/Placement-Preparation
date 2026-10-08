# Chapter 9: Patterns, Pitfalls and Testing
%Strategies for shared state, the bugs that reach production, diagnosing them with thread dumps, and testing concurrent code

## 9.1 Four strategies for shared state

| Strategy | Idea | Example |
|---|---|---|
| Do not share | Confine state to one thread | Local variables, one request per thread, a single-writer thread |
| Do not mutate | Share only immutable objects | Records, `List.copyOf`, configuration snapshots swapped through a `volatile` or `AtomicReference` |
| Synchronise | Guard every access with the same lock | `synchronized`, `ReentrantLock` |
| Delegate | Let a thread-safe class own the state | `ConcurrentHashMap`, `AtomicLong`, `BlockingQueue` |

The first two need no locks at all and are the easiest to get right. The **single-writer principle** combines them: one thread owns a piece of mutable state, and other threads send it messages through a queue (the actor model, the LMAX Disruptor, Redis's main loop).

```java run A single-writer account: no locks on the balance
import java.util.*;
import java.util.concurrent.*;

public class Main {
    sealed interface Command permits Deposit, Withdraw, Stop { }
    record Deposit(long amount) implements Command { }
    record Withdraw(long amount, CompletableFuture<Boolean> ok) implements Command { }
    record Stop(CompletableFuture<Long> finalBalance) implements Command { }

    public static void main(String[] args) throws Exception {
        BlockingQueue<Command> inbox = new LinkedBlockingQueue<>();
        Thread owner = new Thread(() -> {
            long balance = 0;   // touched by this thread only
            try {
                while (true) {
                    switch (inbox.take()) {
                        case Deposit d -> balance += d.amount();
                        case Withdraw w -> {
                            boolean ok = balance >= w.amount();
                            if (ok) balance -= w.amount();
                            w.ok().complete(ok);
                        }
                        case Stop s -> { s.finalBalance().complete(balance); return; }
                    }
                }
            } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        });
        owner.start();
        try (ExecutorService clients = Executors.newFixedThreadPool(8)) {
            for (int i = 0; i < 10_000; i++) clients.submit(() -> inbox.add(
                    new Deposit(10)));
        }
        List<CompletableFuture<Boolean>> results = new ArrayList<>();
        try (ExecutorService clients = Executors.newFixedThreadPool(8)) {
            for (int i = 0; i < 1_200; i++) {
                var ok = new CompletableFuture<Boolean>();
                results.add(ok);
                clients.submit(() -> inbox.add(new Withdraw(100, ok)));
            }
        }
        var fin = new CompletableFuture<Long>();
        inbox.add(new Stop(fin));
        long approved = results.stream().filter(CompletableFuture::join).count();
        System.out.println("deposits 10,000 x 10, withdrawals approved " + approved
                + " of 1,200 x 100");
        System.out.println("final balance " + fin.join()
                + ", never negative by construction");
    }
}
```

Every deposit is queued before any withdrawal (the first `try` block waits for its executor), and the owner processes the queue in FIFO order, so the balance reaches 100,000 and exactly 1,000 of the 1,200 withdrawals of 100 can succeed, whatever order they arrive in.

## 9.2 Bugs that reach production

| Bug | Why it fails | Fix |
|---|---|---|
| Shared `HashMap` written by several threads | Lost entries, corrupted buckets | `ConcurrentHashMap` |
| Shared `SimpleDateFormat` | It keeps parse state in fields | `DateTimeFormatter` (immutable) |
| Mutable fields in a Spring singleton bean | One instance serves all requests concurrently | Keep beans stateless; state in locals or a store |
| Synchronising on a `String` literal or boxed `Integer` | Interned/cached objects are shared across unrelated code | A private `final Object lock = new Object()` |
| Calling unknown code while holding a lock | Callbacks may block or take other locks: deadlock | Copy what you need, release, then call |
| Task waits for another task in the same bounded pool | All threads wait; queued tasks never run (**thread-starvation deadlock**) | Separate pools, or compose with `CompletableFuture` |
| Unbounded queue in front of a pool | Overload shows up as memory exhaustion and huge latency | Bounded queue + rejection policy |
| `parallelStream` doing I/O | Blocks the shared common pool | Dedicated executor |

```java run The shared SimpleDateFormat bug
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) throws Exception {
        SimpleDateFormat shared = new SimpleDateFormat("yyyy-MM-dd");
        DateTimeFormatter immutable = DateTimeFormatter.ISO_LOCAL_DATE;
        AtomicInteger sdfErrors = new AtomicInteger(), dtfErrors = new AtomicInteger();
        try (ExecutorService pool = Executors.newFixedThreadPool(8)) {
            for (int i = 0; i < 20_000; i++) {
                String text = String.format("2026-%02d-%02d", 1 + i % 12, 1 + i % 28);
                pool.submit(() -> {
                    try {
                        String back = new SimpleDateFormat("yyyy-MM-dd")
                                .format(shared.parse(text));
                        if (!back.equals(text)) sdfErrors.incrementAndGet();
                    } catch (Exception e) { sdfErrors.incrementAndGet(); }
                    if (!LocalDate.parse(text, immutable).format(immutable).equals(text))
                        dtfErrors.incrementAndGet();
                });
            }
        }
        System.out.println("shared SimpleDateFormat gave wrong dates or exceptions: "
                + (sdfErrors.get() > 0));
        System.out.println("DateTimeFormatter errors: " + dtfErrors.get());
    }
}
```

```java run Thread-starvation deadlock in a bounded pool
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(1);
        Future<String> outer = pool.submit(() -> {
            Future<String> inner = pool.submit(() -> "inner result");   // queued behind us
            try {
                return inner.get(1, TimeUnit.SECONDS);                  // waits for itself
            } catch (TimeoutException e) {
                return "outer gave up: inner never ran (the only thread was waiting for it)";
            }
        });
        System.out.println(outer.get());
        pool.shutdownNow();
    }
}
```

With one thread the deadlock is immediate; with N threads it happens as soon as N outer tasks are waiting at once, which is exactly what high load produces. Without the timeout, the service simply stops responding.

## 9.3 Diagnosing in production

| Tool | Shows | Typical use |
|---|---|---|
| `jstack <pid>` or `jcmd <pid> Thread.print` | Every thread's state and stack; deadlocks found automatically | "The service hangs" |
| `jcmd <pid> Thread.dump_to_file -format=json` | Thread dump including virtual threads | Services using virtual threads |
| JDK Flight Recorder (`jcmd <pid> JFR.start`) | Lock contention (`jdk.JavaMonitorEnter`), thread parking, pinning, CPU per thread | "Throughput is low, CPU is idle" |
| `ThreadMXBean` | Deadlock detection and per-thread CPU from inside the app | Health checks and alerts |
| Pool metrics (Micrometer `executor.*`) | Active threads, queue size, rejected and completed tasks | Dashboards and alerting |

Take **three thread dumps a few seconds apart**: threads stuck in the same frame in all three are the problem; threads that move are just busy.

## 9.4 Testing concurrent code

| Technique | What it finds |
|---|---|
| Deterministic tests with latches and barriers | Specific interleavings you can name: "both threads have read, now both write" |
| Stress tests: many threads, many iterations, check invariants (sums, uniqueness) | Races that show up only under load |
| Running tests repeatedly and on machines with many cores | Rare interleavings |
| `jcstress` (OpenJDK) | Memory-model behaviour: reorderings, visibility, which outcomes are possible |
| Static analysis (SpotBugs, Error Prone `@GuardedBy`) | Inconsistent locking, fields read without the lock |
| Thread sanitiser-style tools and fuzzers (e.g. Fray, Lincheck for JVM) | Linearizability violations under systematic interleavings |

A passing concurrency test proves little: the bug may need an interleaving that the test never produced. That is why designs that are **safe by construction** (immutability, confinement, single writer, proven library classes) beat clever locking that must be tested into correctness.

## 9.5 Practical lessons

- Prefer confinement and immutability; delegate the rest to `java.util.concurrent`.
- Know the classic production bugs: shared `HashMap` and `SimpleDateFormat`, stateful singletons, pool self-deadlock.
- Diagnose hangs with several thread dumps; diagnose slowness with JFR and pool metrics.
- Test with latches for known interleavings and stress for unknown ones; trust designs, not luck.

# Chapter 10: Question Bank and Cheat Sheet
%Interview questions with the core of a good answer, and one-page reminders

## 10.1 Fundamentals and the memory model

| Question | Core of a good answer |
|---|---|
| Process versus thread? | A process has its own address space; threads in a process share the heap and have their own stacks and program counters |
| Why is `count++` not thread-safe? | It is read-modify-write; two threads can read the same value and both write the same result, losing an update |
| What are the three concurrency problems? | Atomicity (interleaved compound actions), visibility (writes not seen), ordering (reordering observed by another thread) |
| What is happens-before? | The JMM's guarantee that one action's effects are visible to another: program order, unlock/lock, volatile write/read, start, join, and transitivity |
| What does `volatile` guarantee? | Visibility and ordering for that variable and the writes before it; atomic `long`/`double`; **not** atomic `++` and not mutual exclusion |
| Why does double-checked locking need `volatile`? | Without it the reference can be seen before the constructor's writes; `volatile` makes construction happen-before the read |
| How do `final` fields help? | Properly constructed objects' final fields are visible to all threads without synchronisation: immutable objects are thread-safe |
| `start()` versus `run()`? | `start()` creates a new thread that calls `run()`; calling `run()` directly runs on the current thread |
| What is a data race versus a race condition? | Data race: unsynchronised conflicting accesses (a JMM term). Race condition: correctness depends on timing; can exist even without data races (check-then-act on a synchronised map) |

## 10.2 Locks, atomics and collections

| Question | Core of a good answer |
|---|---|
| `synchronized` versus `ReentrantLock`? | Both reentrant with the same memory semantics; `ReentrantLock` adds tryLock, timeouts, interruptible waits, fairness and multiple conditions, but must be unlocked in `finally` |
| Why call `wait()` in a loop? | Spurious wake-ups, and the condition may have changed before the thread reacquired the lock |
| What causes deadlock and how do you prevent it? | Mutual exclusion, hold and wait, no pre-emption, circular wait; prevent with a global lock order or tryLock with back-off |
| How do you find a deadlock? | Thread dump (`jstack`, `jcmd Thread.print`) reports it; `ThreadMXBean.findDeadlockedThreads()` programmatically |
| How does CAS work and what is ABA? | Atomic compare-and-set; retry on failure. ABA: value changes and returns, CAS cannot tell; use a stamp/version |
| `AtomicLong` versus `LongAdder`? | AtomicLong: one variable, exact reads, CAS. LongAdder: striped cells, much faster under contention, sum computed on read |
| How is `ConcurrentHashMap` thread-safe and fast? | Lock-free reads; CAS or per-bin locks for writes; atomic methods `compute`, `merge`, `putIfAbsent`; no null keys or values; weakly consistent iterators |
| `Collections.synchronizedMap` versus `ConcurrentHashMap`? | The former locks the whole map for every call and needs external locking for iteration and compound actions; CHM scales and offers atomic compound methods |
| When to use `CopyOnWriteArrayList`? | Many reads and iterations, rare writes (listeners); every write copies the array |
| Which `BlockingQueue` for a producer–consumer? | Usually a bounded `ArrayBlockingQueue` for back-pressure; `SynchronousQueue` for direct hand-off |

## 10.3 Executors, futures and virtual threads

| Question | Core of a good answer |
|---|---|
| Explain ThreadPoolExecutor's parameters | Core, max, keep-alive, queue, factory, rejection handler; core threads first, then queue, then extra threads up to max, then reject |
| Why avoid `Executors.newFixedThreadPool` in servers? | Its queue is unbounded: overload becomes memory exhaustion and unbounded latency |
| How do you size a thread pool? | CPU-bound ≈ cores; I/O-bound ≈ cores × (1 + wait/compute); or throughput × latency; then measure |
| `submit` versus `execute`? | `submit` returns a Future and captures exceptions (lost unless `get` is called); `execute` lets them reach the uncaught-exception handler |
| How do you stop a running task? | `Future.cancel(true)` or `shutdownNow()` interrupt it; the task must check interruption or block interruptibly |
| `thenApply` versus `thenCompose`? | map versus flatMap: `thenCompose` for a next step that returns a `CompletableFuture` |
| Run three calls in parallel and combine | `supplyAsync` each with an I/O executor, then `thenCombine` or `allOf` + `join`; handle errors and timeouts |
| What do `orTimeout`/`completeOnTimeout` not do? | They do not cancel the underlying work; set timeouts on the actual I/O |
| What are virtual threads? | JVM-scheduled threads mounted on carrier threads; blocking unmounts them, so millions of blocking tasks are cheap |
| When do virtual threads not help? | CPU-bound work; downstream limits (pools, databases); heavy ThreadLocal use; pinning in native code |
| What is pinning and is it still a problem? | A virtual thread blocking its carrier; `synchronized` pinning was removed in Java 24, native-frame pinning remains |
| Latch, barrier or semaphore? | Latch: wait for N events once. Barrier: threads wait for each other, repeatedly. Semaphore: limit concurrent access |

## 10.4 Cheat sheet

| Topic | Remember |
|---|---|
| Three problems | Atomicity, visibility, ordering |
| Happens-before | Program order, unlock→lock, volatile write→read, start, join, `j.u.c` hand-offs, transitivity |
| volatile | Visibility + ordering; not atomic `++` |
| Safe publication | Static init, volatile/atomic reference, lock, concurrent collection, final fields |
| Singleton | Enum or holder idiom; DCL only with volatile |
| Locks | `synchronized` by default; `ReentrantLock` for tryLock/timeout/fairness/conditions; unlock in `finally` |
| Deadlock | Coffman's four conditions; lock ordering; tryLock with back-off; `jstack` |
| Atomics | CAS retry loops; `LongAdder` for hot counters; stamps against ABA |
| CHM | `merge`, `compute`, `putIfAbsent`; never get-then-put; no nulls |
| Pools | Bounded queue, named threads, explicit rejection; grows past core only when queue full |
| Sizing | CPU: cores. I/O: cores × (1 + W/C). Little: throughput × latency |
| Futures | `get`/`join` to see exceptions; restore interrupt flag |
| CompletableFuture | apply = map, compose = flatMap, combine = zip, allOf = join; pass executors |
| Virtual threads | One per task, never pooled; limit resources with semaphores; Java 24 fixed `synchronized` pinning |
| Context | Scoped values (Java 25) over ThreadLocal for request context |
| Testing | Latches for chosen interleavings, stress for invariants, jcstress for the JMM |
