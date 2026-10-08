# Chapter 7: Synchronisers
%CountDownLatch, CyclicBarrier, Semaphore, Phaser and Exchanger, and when to choose each

## 7.1 CountDownLatch: wait for N events

A latch starts at a count; `countDown()` decrements it and `await()` blocks until it reaches zero. It cannot be reset. Two classic uses: a **start gate** so that many threads begin at the same moment (useful in tests), and a **completion latch** so that one thread waits for N workers.

```java run A start gate and a completion latch
import java.util.*;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        int workers = 5;
        CountDownLatch startGate = new CountDownLatch(1),
                done = new CountDownLatch(workers);
        int[] results = new int[workers];
        for (int i = 0; i < workers; i++) {
            int id = i;
            new Thread(() -> {
                try {
                    startGate.await();                         // all wait here ...
                    results[id] = (id + 1) * (id + 1);         // ... then work together
                } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
                finally { done.countDown(); }   // always count down, even on failure
            }).start();
        }
        System.out.println("workers waiting at the gate, done count = " + done.getCount());
        startGate.countDown();
        boolean finished = done.await(5, TimeUnit.SECONDS);
        System.out.println("all finished: " + finished + ", results "
                + Arrays.toString(results));
    }
}
```

The `countDown()` happens-before `await()` returns, so `main` sees every worker's write to `results` without any other synchronisation. Counting down in `finally` matters: a worker that throws before counting down would leave `await()` waiting forever (here, until its timeout).

## 7.2 CyclicBarrier: meet at each step

A barrier makes a fixed group of threads wait for each other at a point, then releases them all together and **resets** for the next round. An optional barrier action runs once per round, by the last thread to arrive, before the others are released. It fits iterative simulations where each step needs the previous step's results from every thread.

```java run Three threads stepping a simulation in lock-step
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {
    public static void main(String[] args) throws Exception {
        int parties = 3, steps = 4;
        long[] partial = new long[parties];
        List<String> log = Collections.synchronizedList(new ArrayList<>());
        AtomicInteger step = new AtomicInteger();
        CyclicBarrier barrier = new CyclicBarrier(parties, () ->
                log.add("step " + step.incrementAndGet() + ": total load "
                        + Arrays.stream(partial).sum()));
        Thread[] ts = new Thread[parties];
        for (int p = 0; p < parties; p++) {
            int id = p;
            ts[p] = new Thread(() -> {
                try {
                    for (int s = 1; s <= steps; s++) {
                        partial[id] = (long) (id + 1) * s * 10;
                        // this thread's share of step s
                        barrier.await();                           // wait for the other two
                    }
                } catch (Exception e) { throw new RuntimeException(e); }
            });
            ts[p].start();
        }
        for (Thread t : ts) t.join();
        log.forEach(System.out::println);
    }
}
```

If one thread fails or times out while waiting, the barrier is **broken**: every other waiting thread gets a `BrokenBarrierException`, so a group never waits forever for a member that died.

## 7.3 Semaphore: limit concurrency

A semaphore holds permits: `acquire()` takes one (waiting if none are left) and `release()` returns one. It limits how many threads do something **at the same time**, for example calls to a fragile downstream service, independently of how many threads exist. This becomes essential with virtual threads (Chapter 8), where the number of threads is no longer a limit.

```java run At most three concurrent calls, whatever the number of tasks
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {
    static final Semaphore permits = new Semaphore(3);
    static final AtomicInteger inFlight = new AtomicInteger(), peak = new AtomicInteger();

    static void callTariffService() throws InterruptedException {
        permits.acquire();
        try {
            int now = inFlight.incrementAndGet();
            peak.accumulateAndGet(now, Math::max);
            Thread.sleep(20);                                  // the remote call
            inFlight.decrementAndGet();
        } finally {
            permits.release();
        }
    }

    public static void main(String[] args) throws Exception {
        try (ExecutorService pool = Executors.newFixedThreadPool(20)) {
            for (int i = 0; i < 100; i++)
                pool.submit(() -> { callTariffService(); return null; });
        }
        System.out.println("tasks 100, threads 20, peak concurrent calls: " + peak.get());
    }
}
```

| Semaphore detail | Note |
|---|---|
| `tryAcquire(timeout)` | Fail fast when the downstream is saturated (return 503 instead of queueing) |
| Fairness flag | `new Semaphore(n, true)` gives permits in arrival order |
| Not owned | Any thread may release, so a bug can release more permits than were acquired; always pair `acquire` with `release` in `finally` |
| Binary semaphore | `new Semaphore(1)` acts as a non-reentrant lock that another thread can release |

## 7.4 Phaser and Exchanger

A `Phaser` is a reusable barrier whose set of parties can change: threads `register()` and `arriveAndDeregister()` while it runs, which suits divide-and-conquer work where tasks spawn more tasks. An `Exchanger` lets exactly two threads swap objects at a meeting point, for example a filler and an emptier swapping buffers.

| Need | Choose |
|---|---|
| One thread waits for N events, once | `CountDownLatch` |
| N threads wait for each other, repeatedly | `CyclicBarrier` |
| As above, with parties joining and leaving | `Phaser` |
| Limit how many do something at once | `Semaphore` |
| Two threads swap data | `Exchanger` |
| Wait for N results (values, not just events) | `CompletableFuture.allOf` or `invokeAll` |
| Hand items from producers to consumers | `BlockingQueue` |

## 7.5 Practical lessons

- Latch: one-shot "wait until N things happened"; count down in `finally`.
- Barrier: repeated rendezvous of a fixed group; a failure breaks it for everyone.
- Semaphore: cap concurrency against a resource, independent of thread count.
- Pick the synchroniser by what you are waiting for: events, each other, permits or results.

# Chapter 8: Virtual Threads and Structured Concurrency
%Cheap blocking threads from Java 21, when they help and when not, pinning, scoped values and structured task scopes

## 8.1 Platform threads versus virtual threads

A **platform thread** is a thin wrapper around an operating-system thread: about a megabyte of reserved stack, a kernel scheduling entity, and a context switch through the kernel. Servers that use one thread per request therefore top out at a few thousand concurrent requests, which pushed the industry to asynchronous, callback-style code.

A **virtual thread** (Java 21, JEP 444) is a thread implemented by the JVM. Its stack lives on the heap and grows as needed; it runs by being **mounted** on a small pool of carrier platform threads (a `ForkJoinPool` with one carrier per core). When a virtual thread blocks on I/O, a lock, `sleep` or a `BlockingQueue`, the JVM **unmounts** it and the carrier runs another virtual thread. Blocking becomes cheap, so plain synchronous code scales like asynchronous code.

```java run Ten thousand sleeping tasks
import java.time.*;
import java.util.concurrent.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) throws Exception {
        int tasks = 10_000;
        Instant start = Instant.now();
        try (ExecutorService ex = Executors.newVirtualThreadPerTaskExecutor()) {
            IntStream.range(0, tasks).forEach(i -> ex.submit(() -> {
                Thread.sleep(Duration.ofSeconds(1));   // a blocking "remote call"
                return i;
            }));
        }                                                          // waits for all tasks
        Duration took = Duration.between(start, Instant.now());
        System.out.println(tasks + " tasks each blocking 1 s finished in under 3 s: "
                + (took.toMillis() < 3000));
        System.out.printf("a pool of 200 platform threads would need at least %d s%n",
                tasks / 200);
        Thread vt = Thread.ofVirtual().name("vt-demo").unstarted(() -> { });
        System.out.println("isVirtual: " + vt.isVirtual() + ", daemon: " + vt.isDaemon());
    }
}
```

| | Platform thread | Virtual thread |
|---|---|---|
| Created by | `new Thread`, thread pools | `Thread.ofVirtual()`, `Executors.newVirtualThreadPerTaskExecutor()` |
| Cost | ~1 MB stack reserved, kernel thread | A few hundred bytes to a few KB on the heap |
| Practical count | Thousands | Millions |
| Blocking | Holds the OS thread | Unmounts; carrier is reused |
| Best for | CPU-bound work, long-running background loops | Many concurrent tasks that mostly wait (I/O) |
| Pooling | Yes | **Never**: create one per task |

Spring Boot 3.2+ switches its request handling to virtual threads with `spring.threads.virtual.enabled=true`.

## 8.2 When virtual threads do not help

| Situation | Why | Do instead |
|---|---|---|
| CPU-bound work | Only as many virtual threads run as there are carriers (cores) | A platform pool sized to cores, or parallel streams |
| A bottleneck downstream | A million virtual threads can open a million database requests; the connection pool (or the database) becomes the queue | Limit with a `Semaphore` or the connection pool size, and use timeouts |
| Heavy `ThreadLocal` caches | Each of a million threads gets its own copy | Scoped values, or shared thread-safe caches |
| Pinning | A virtual thread that cannot unmount blocks its carrier | See §8.3 |

> TRAP: Do not pool virtual threads, and do not use a fixed thread pool to "limit" them: limiting the number of threads was always an indirect way to limit concurrency against a resource. With virtual threads, limit the resource directly (semaphore, connection pool, rate limiter).

## 8.3 Pinning

A virtual thread is **pinned** when it cannot unmount while blocked, so it blocks its carrier thread. In Java 21–23 the main cause was blocking inside a `synchronized` block or method, so libraries replaced `synchronized` with `ReentrantLock` on hot I/O paths. **Java 24 (JEP 491) removed that limitation**: virtual threads now unmount while blocked in `synchronized` and `Object.wait()`. Pinning remains for blocking inside native code or foreign functions, which is rare in application code. JDK Flight Recorder reports pinning as `jdk.VirtualThreadPinned` events.

## 8.4 Scoped values

`ThreadLocal` passes context (request ID, user, transaction) implicitly down a call chain, but it is mutable, lives as long as the thread unless removed (a leak on pooled threads), and is copied into child threads expensively. **Scoped values** (final in Java 25, JEP 506) bind a value for the **duration of a call**: immutable, automatically gone when the call returns, and cheap to share with child tasks.

```java run Binding a request ID for the duration of a call
public class Main {
    static final ScopedValue<String> REQUEST_ID = ScopedValue.newInstance();

    static void repository() {
        System.out.println("repository sees request " + REQUEST_ID.get());
    }

    static void service() {
        System.out.println("service sees request " + REQUEST_ID.get());
        ScopedValue.where(REQUEST_ID, REQUEST_ID.get() + "/retry-1").run(Main::repository);
        // rebinding
        repository();
    }

    public static void main(String[] args) {
        ScopedValue.where(REQUEST_ID, "req-42").run(Main::service);
        System.out.println("outside the call, bound: " + REQUEST_ID.isBound());
    }
}
```

The rebinding is visible only inside the nested call; once it returns, the outer binding is back. There is no `set()` and no `remove()` to forget.

## 8.5 Structured concurrency

Unstructured `ExecutorService` code lets subtasks outlive the method that started them: if one call fails, the others keep running and their errors are lost. **Structured concurrency** treats a group of subtasks as one unit with a lexical scope: the scope cannot be left until all subtasks are done, a failure cancels the siblings, and thread dumps show the parent–child relationship. In Java 25 `StructuredTaskScope` is still a **preview** API (JEP 505; run with `--enable-preview`), so its shape may change:

```text
Response handle(String customer) throws InterruptedException {
    try (var scope = StructuredTaskScope.open()) {              // default: all must succeed
        Subtask<Profile> profile = scope.fork(() -> profiles.find(customer));
        Subtask<Reading> reading = scope.fork(() -> meters.latest(customer));
        scope.join();               // waits for both; a failure cancels the other and throws
        return new Response(profile.get(), reading.get());
    }                               // no subtask can outlive this block
}
```

Combined with virtual threads, each request handler can fan out with plain blocking calls, and failure handling is as simple as for sequential code. Until the API is final, `CompletableFuture` (Chapter 6) is the production choice for fan-out.

## 8.6 Practical lessons

- Virtual threads make blocking cheap: one virtual thread per task, never pooled.
- They help I/O-bound concurrency, not CPU-bound work; limit downstream resources explicitly.
- Since Java 24, `synchronized` no longer pins; pinning now comes mainly from native code.
- Use scoped values for request context; watch structured concurrency as it moves out of preview.
