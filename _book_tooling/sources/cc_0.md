# How to use this guide
%What this book covers, how its concurrent programs were made to print reliable output, and the map of chapters

Concurrency questions separate candidates quickly: "Why is `count++` not thread-safe?", "What does `volatile` guarantee?", "How would you size a thread pool?", "What changed with virtual threads?". This guide answers them from the ground up in Java 21–25: threads and the problems they create, the **Java Memory Model**, locks and their alternatives, atomics and concurrent collections, executors, `CompletableFuture`, synchronisers, and virtual threads.

It builds on two earlier books: the **Java** guide introduces threads and `synchronized`, and the **Low-Level Design** guide (Chapter 6) applies thread safety to class design: check-then-act, lock ordering, producer–consumer and read-write locks. Those topics are only summarised here; the focus is on **why** the mechanisms work and how to choose between them.

## How the examples were run

Every Java program in this book was run with `java Main.java` on JDK 25, and its output is shown. Concurrent programs are nondeterministic: thread interleavings and timings differ from run to run. To keep printed output reliable, the programs:

- print **facts that do not depend on timing** (final counts, which thread won a race when the outcome is forced by a latch, whether a deadlock was detected);
- report timing as a comparison ("finished in under a second: true") rather than as milliseconds;
- print results in a fixed order after joining threads, never from inside threads that race each other.

Where a program shows a race, the race is made overwhelmingly likely (millions of increments on several cores) and the program prints whether updates were lost, not how many.

> TIP: Rerun the programs several times. The facts printed stay the same; the internal interleavings do not. That difference is the whole subject of this book.

## Map of the guide

| Chapter | Topic | Typical interview question |
|---|---|---|
| 1 | Threads and the three problems | "Why does `count++` lose updates?" |
| 2 | The Java Memory Model | "What does `volatile` guarantee, and what not?" |
| 3 | Locks and conditions | "`synchronized` versus `ReentrantLock`?" |
| 4 | Atomics and concurrent collections | "How does `ConcurrentHashMap` stay fast?" |
| 5 | Executors and thread pools | "How many threads should a pool have?" |
| 6 | `CompletableFuture` | "Call three services in parallel and combine the results" |
| 7 | Synchronisers | "Latch, barrier or semaphore?" |
| 8 | Virtual threads and structured concurrency | "When do virtual threads help, and when not?" |
| 9 | Patterns, pitfalls and testing | "How do you find a deadlock in production?" |
| 10 | Question bank and cheat sheet | Revision |

# Chapter 1: Threads and the Three Problems
%Processes and threads, a thread's life cycle, and the atomicity, visibility and ordering problems behind every concurrency bug

## 1.1 Why concurrency

| Goal | Example | What limits it |
|---|---|---|
| Use more cores (parallelism) | Split an image filter across 8 cores | Serial parts of the work (Amdahl's law) |
| Overlap waiting (concurrency) | Serve 1,000 clients that mostly wait on the network | Memory per thread; context switches |
| Keep a program responsive | UI thread stays free while a download runs | Correct hand-off of results |

A **process** has its own address space; **threads** inside it share the heap and have their own stacks and program counters. Sharing the heap makes communication cheap and makes every bug in this book possible.

**Amdahl's law** bounds the speed-up from parallelism: if a fraction *s* of the work is serial, *n* cores give at most 1 / (s + (1 − s) / n).

```java run Amdahl's law
public class Main {
    public static void main(String[] args) {
        double[] serial = {0.0, 0.05, 0.10, 0.25};
        int[] cores = {2, 4, 8, 16, 64};
        System.out.print("serial  ");
        for (int n : cores) System.out.printf("%9s", n + " cores");
        System.out.println();
        for (double s : serial) {
            System.out.printf("%5.0f%%  ", s * 100);
            for (int n : cores) System.out.printf("%8.1fx", 1 / (s + (1 - s) / n));
            System.out.println();
        }
    }
}
```

With only 10% serial work, 64 cores give less than an 8.8× speed-up. Locks are serial sections, so a lock held for a large share of each request caps throughput in exactly this way.

## 1.2 Creating threads and their life cycle

```java run Thread states, observed at fixed points
import java.util.concurrent.CountDownLatch;

public class Main {
    public static void main(String[] args) throws Exception {
        Object lock = new Object();
        CountDownLatch started = new CountDownLatch(1);
        Thread t = new Thread(() -> {
            started.countDown();
            synchronized (lock) {
                try { lock.wait(); } catch (InterruptedException e) { }
            }
        }, "worker");
        System.out.println("after new      : " + t.getState());
        t.start();
        started.await();
        while (t.getState() != Thread.State.WAITING) Thread.onSpinWait();
        System.out.println("inside wait()  : " + t.getState());
        synchronized (lock) {
            lock.notify();
            while (t.getState() != Thread.State.BLOCKED)
                Thread.onSpinWait();  // wakes, needs lock
            System.out.println("notified, lock held by main: " + t.getState());
        }
        t.join();
        System.out.println("after join     : " + t.getState());
    }
}
```

| State | Meaning |
|---|---|
| `NEW` | Created, `start()` not yet called |
| `RUNNABLE` | Running or ready to run (the JVM does not distinguish) |
| `BLOCKED` | Waiting to enter a `synchronized` block held by another thread |
| `WAITING` / `TIMED_WAITING` | In `wait()`, `join()`, `LockSupport.park()` or `sleep()` |
| `TERMINATED` | `run()` has returned or thrown |

Note the third line: a notified thread must **reacquire the monitor** before it returns from `wait()`, so it is `BLOCKED` until `main` leaves its `synchronized` block.

| Way to run code concurrently | Use it for |
|---|---|
| `new Thread(runnable).start()` | Learning and very special cases only |
| `ExecutorService` (Chapter 5) | Almost all application code: pooled, bounded, managed |
| `CompletableFuture` (Chapter 6) | Composing asynchronous steps |
| `Thread.ofVirtual()` / virtual-thread executor (Chapter 8) | Many blocking tasks, one per request |

> TRAP: Calling `run()` instead of `start()` runs the code on the **current** thread. It compiles, works in simple tests and has no concurrency at all.

## 1.3 Problem 1: atomicity

`count++` looks like one operation but is three: read `count`, add one, write it back. Two threads can both read 41 and both write 42, losing one increment.

```java run Lost updates from count++
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    static int plain = 0;
    static int locked = 0;
    static final AtomicInteger atomic = new AtomicInteger();

    public static void main(String[] args) throws Exception {
        int threads = 4, perThread = 2_000_000;
        Thread[] ts = new Thread[threads];
        for (int i = 0; i < threads; i++) {
            ts[i] = new Thread(() -> {
                for (int j = 0; j < perThread; j++) {
                    plain++;
                    synchronized (Main.class) { locked++; }
                    atomic.incrementAndGet();
                }
            });
            ts[i].start();
        }
        for (Thread t : ts) t.join();
        int expected = threads * perThread;
        System.out.println("expected            : " + expected);
        System.out.println("plain int lost some : " + (plain < expected));
        System.out.println("synchronized        : " + locked);
        System.out.println("AtomicInteger       : " + atomic.get());
    }
}
```

The plain counter loses updates (how many changes on every run, so the program prints only whether it did). The `synchronized` and atomic versions are exact on every run.

The same flaw appears in **check-then-act** code: `if (!map.containsKey(k)) map.put(k, v)` or lazy initialisation. Another thread can act between the check and the act. The LLD guide, §6.2, shows how compound actions on shared objects go wrong.

## 1.4 Problem 2: visibility

Each core has caches and the JIT compiler keeps values in registers, so a write by one thread is **not guaranteed ever to become visible** to another unless the two synchronise. The classic symptom is a loop that never sees its stop flag:

```text
static boolean running = true;           // not volatile
// thread A:  while (running) { work++; }   // JIT may hoist the read: while (true)
// thread B:  running = false;               // A may never stop
```

Whether the loop actually hangs depends on the JIT and hardware, which is what makes visibility bugs so hard to reproduce. The fix is a **happens-before** relationship (Chapter 2): mark the flag `volatile`, use an `AtomicBoolean`, or read and write it under the same lock.

## 1.5 Problem 3: ordering

Compilers and CPUs reorder independent memory operations for speed. In a single thread you never notice, because reordering preserves single-threaded meaning. Another thread can observe the reordering:

```text
// shared: int x = 0, y = 0;  int r1, r2;
// thread 1: x = 1; r1 = y;
// thread 2: y = 1; r2 = x;
// Without synchronisation, r1 == 0 && r2 == 0 is a legal outcome:
// each thread's store may sit in a store buffer while its load runs first.
```

Intuition says at least one of the stores must happen first, so at least one of `r1`, `r2` must be 1. On real x86 and ARM hardware, both 0 is observed regularly. The OpenJDK **jcstress** tool runs such tests millions of times and reports every outcome; the "both 0" case appears on ordinary laptops.

| Problem | Bug looks like | Fixed by |
|---|---|---|
| Atomicity | Lost updates, duplicate IDs, double booking | Locks, atomics, confinement |
| Visibility | Thread never sees a flag or sees stale data | `volatile`, locks, atomics, safe publication |
| Ordering | Half-constructed objects, impossible-looking states | Happens-before via `volatile`, locks, `final` fields |

## 1.6 Practical lessons

- Threads share the heap: any shared mutable state needs a deliberate strategy.
- Amdahl's law: serial sections (including lock hold time) cap the speed-up.
- Every concurrency bug is a failure of atomicity, visibility or ordering.
- Use executors, not raw threads, in application code; never call `run()` by mistake.

# Chapter 2: The Java Memory Model
%Happens-before, volatile, final fields, safe publication and why double-checked locking needs volatile

## 2.1 Happens-before

The Java Memory Model (JMM, JSR-133, Java 5) does not describe caches or CPUs. It defines when a write is **guaranteed** to be visible to a read: when the write **happens-before** the read. If two accesses to the same variable, at least one a write, are not ordered by happens-before, the program has a **data race**, and the read may see the old value, the new value or (for `long`/`double` without `volatile`) even half of each.

| Rule | Happens-before edge |
|---|---|
| Program order | Each action in a thread happens-before every later action **in that thread** |
| Monitor lock | Unlocking a monitor happens-before every later lock of **the same** monitor |
| Volatile | A write to a volatile field happens-before every later read of **that** field |
| Thread start | `t.start()` happens-before every action in `t` |
| Thread join | Every action in `t` happens-before another thread returns from `t.join()` |
| Interruption | `t.interrupt()` happens-before `t` detects the interrupt |
| Transitivity | If A hb B and B hb C, then A hb C |
| `java.util.concurrent` | E.g. putting into a `BlockingQueue` or `ConcurrentHashMap` happens-before taking or reading it; `countDown()` happens-before `await()` returns; tasks submitted to an executor see everything before `submit` |

Transitivity is what makes the rules useful: everything a thread did **before** releasing a lock (or writing a volatile, or calling `countDown`) is visible to a thread **after** it acquires the same lock (or reads that volatile, or returns from `await`).

```java run Plain fields published through one volatile write
public class Main {
    static int a, b;                      // plain fields
    static volatile boolean ready;        // the publication flag

    public static void main(String[] args) throws Exception {
        int trials = 20_000, bad = 0;
        for (int i = 0; i < trials; i++) {
            a = 0; b = 0; ready = false;
            Thread writer = new Thread(() -> { a = 1; b = 2; ready = true; });
            int[] seen = new int[2];
            Thread reader = new Thread(() -> {
                while (!ready) Thread.onSpinWait();
                seen[0] = a; seen[1] = b;
            });
            reader.start(); writer.start();
            writer.join(); reader.join();
            if (seen[0] != 1 || seen[1] != 2) bad++;
        }
        System.out.println("trials: " + trials
                + ", reader saw ready=true but stale a or b: " + bad);
    }
}
```

The output is guaranteed: the writes to `a` and `b` come before the volatile write in program order, the volatile write happens-before the read that sees `true`, and that read comes before the reads of `a` and `b`. Remove `volatile` and the program is racy. It might still print 0 on a given machine, but nothing guarantees it, and the loop may even never terminate.

## 2.2 What volatile does and does not do

| `volatile` guarantees | `volatile` does **not** guarantee |
|---|---|
| Every read sees the latest write (visibility) | Atomicity of compound actions: `v++` on a volatile still loses updates |
| Writes before a volatile write are visible after a read of it (ordering) | Mutual exclusion |
| Reads and writes of `long` and `double` are atomic | Visibility of the **contents** of an object whose reference is volatile, if they change after publication |

```java run volatile does not make ++ atomic
public class Main {
    static volatile int counter = 0;

    public static void main(String[] args) throws Exception {
        int threads = 4, each = 2_000_000;
        Thread[] ts = new Thread[threads];
        for (int i = 0; i < threads; i++) {
            ts[i] = new Thread(() -> { for (int j = 0; j < each; j++) counter++; });
            ts[i].start();
        }
        for (Thread t : ts) t.join();
        System.out.println("volatile counter lost updates: " + (counter < threads * each));
    }
}
```

Use `volatile` for a single variable written by one thread and read by others: stop flags, published configuration snapshots, the state of a lazily initialised field. For read-modify-write, use atomics or locks.

## 2.3 Safe publication and final fields

**Publishing** an object means making a reference to it available to other threads. If the reference is published through a data race, another thread can see the reference **before** it sees the constructor's writes to the object's fields, and observe a half-built object.

Safe ways to publish:

- initialise it in a `static` initialiser (class initialisation is synchronised by the JVM);
- store the reference in a `volatile` field or an `AtomicReference`;
- store it in a field guarded by a lock;
- put it into a concurrent collection or a `BlockingQueue`;
- make the object **immutable with `final` fields**.

The JMM gives `final` fields a special guarantee: if the constructor does not leak `this`, any thread that sees a reference to the object sees the final fields as the constructor set them, even when the reference itself was published racily. This is why immutable classes (all fields `final`, no setters, defensive copies of mutable inputs) are thread-safe without any locking. `String`, `Integer`, `LocalDate` and records with immutable components all work this way.

> TRAP: Starting a thread or registering a listener **inside a constructor** leaks `this` before construction finishes, voiding the final-field guarantee. Create the object first, then start or register it from a factory method.

## 2.4 Double-checked locking

Lazy initialisation without locking on every call is a classic interview question, because the obvious version is broken:

```java run Double-checked locking done right, and the simpler alternative
import java.util.concurrent.*;

public class Main {
    static class Config {
        final String url;
        Config() { url = "jdbc:mysql://db/meter"; }
    }

    static class Lazy {
        private static volatile Config instance;          // volatile is essential
        static Config get() {
            Config c = instance;
            // one volatile read on the fast path
            if (c == null) {
                synchronized (Lazy.class) {
                    c = instance;
                    if (c == null) instance = c = new Config();
                }
            }
            return c;
        }
    }

    static class Holder {   // initialisation-on-demand holder
        private static class H { static final Config INSTANCE = new Config(); }
        static Config get() { return H.INSTANCE; }
    }

    public static void main(String[] args) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(8);
        var seen = ConcurrentHashMap.<Config>newKeySet();
        var seenHolder = ConcurrentHashMap.<Config>newKeySet();
        for (int i = 0; i < 10_000; i++) {
            pool.submit(() -> { seen.add(Lazy.get()); seenHolder.add(Holder.get()); });
        }
        pool.shutdown();
        pool.awaitTermination(10, TimeUnit.SECONDS);
        System.out.println("distinct instances (DCL)    : " + seen.size());
        System.out.println("distinct instances (holder) : " + seenHolder.size());
        System.out.println("url seen: " + Lazy.get().url);
    }
}
```

Without `volatile`, the write of `instance` can become visible before the writes inside the `Config` constructor, so a thread skipping the lock (because `instance != null`) can see an object whose fields are not yet set. With `volatile` (Java 5 and later), the construction happens-before any read that sees the reference.

The **holder idiom** is simpler and just as lazy: the JVM initialises the nested class `H` on its first use, and class initialisation is thread-safe. For a singleton, an `enum` with one constant is simplest of all.

## 2.5 Practical lessons

- Visibility is guaranteed only along happens-before edges: locks, volatiles, start/join, and `java.util.concurrent` hand-offs.
- `volatile` gives visibility and ordering for one variable, never atomicity of `++`.
- Publish objects safely; prefer immutable objects with `final` fields, which need no locks.
- Lazy singletons: holder idiom or `enum`; double-checked locking only with `volatile`.
