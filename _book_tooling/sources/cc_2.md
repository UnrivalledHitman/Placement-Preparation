# Chapter 5: Executors and Thread Pools
%ThreadPoolExecutor's rules, rejection and back-pressure, sizing, futures and cancellation, lost exceptions, and fork/join

## 5.1 Why pools

Creating a platform thread costs a system call, a megabyte or so of reserved stack and scheduler work. A **thread pool** keeps a set of threads alive and feeds them tasks from a queue, which also **bounds** how many tasks run at once. The `ExecutorService` interface separates *what* to run (a `Runnable` or `Callable`) from *how* it runs.

| Factory | What it really builds | Hidden risk |
|---|---|---|
| `Executors.newFixedThreadPool(n)` | n threads, **unbounded** `LinkedBlockingQueue` | Under overload the queue grows until memory runs out; latency grows without limit |
| `Executors.newCachedThreadPool()` | 0 core threads, unlimited max, `SynchronousQueue` | A burst creates thousands of threads |
| `Executors.newSingleThreadExecutor()` | 1 thread, unbounded queue | Same as fixed; useful for serialising work |
| `Executors.newScheduledThreadPool(n)` | Delayed and periodic tasks | A periodic task that throws is silently cancelled |
| `Executors.newVirtualThreadPerTaskExecutor()` | A new virtual thread per task (Chapter 8) | No limit on concurrency by itself |
| `new ThreadPoolExecutor(...)` | Exactly what you configure | Recommended for servers |

## 5.2 How ThreadPoolExecutor decides

`ThreadPoolExecutor` takes a core size, a maximum size, a keep-alive time, a work queue, a thread factory and a rejection handler. For each submitted task it applies these rules **in order**:

1. Fewer than *core* threads running: start a new thread for the task.
2. Otherwise, try to **queue** the task.
3. Queue full: start a new thread, up to *max*.
4. At *max* and queue full: **reject** the task.

The surprise is step 2 before step 3: the pool grows beyond the core size **only when the queue is full**. With an unbounded queue it never grows at all. The program submits eight tasks that all block, so every decision is visible.

```java run Watching a pool fill up: core 2, max 4, queue 2
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        CountDownLatch release = new CountDownLatch(1);
        ThreadPoolExecutor pool = new ThreadPoolExecutor(2, 4, 30, TimeUnit.SECONDS,
                new ArrayBlockingQueue<>(2), new ThreadPoolExecutor.AbortPolicy());
        for (int i = 1; i <= 8; i++) {
            try {
                pool.execute(() -> {
                    try { release.await(); } catch (InterruptedException e) { }
                });
                System.out.printf("task %d accepted: threads %d, queued %d%n", i,
                        pool.getPoolSize(),
                        pool.getQueue().size());
            } catch (RejectedExecutionException e) {
                System.out.printf("task %d REJECTED: threads %d, queued %d%n", i,
                        pool.getPoolSize(),
                        pool.getQueue().size());
            }
        }
        release.countDown();
        pool.shutdown();
        pool.awaitTermination(5, TimeUnit.SECONDS);
        System.out.println("completed tasks: " + pool.getCompletedTaskCount());
    }
}
```

Tasks 1–2 start core threads, 3–4 wait in the queue, 5–6 start extra threads up to the maximum of 4, and 7–8 are rejected. Six tasks completed.

## 5.3 Rejection and back-pressure

| Policy | On rejection | Use when |
|---|---|---|
| `AbortPolicy` (default) | Throws `RejectedExecutionException` | Caller can handle overload explicitly (return HTTP 503) |
| `CallerRunsPolicy` | The submitting thread runs the task itself | Natural **back-pressure**: a busy submitter cannot submit more |
| `DiscardPolicy` | Silently drops the task | Almost never: work vanishes without trace |
| `DiscardOldestPolicy` | Drops the oldest queued task, retries | Only for "latest value wins" work such as UI refreshes |

A bounded queue plus a deliberate rejection policy turns overload into a visible, controlled response instead of an out-of-memory error an hour later.

## 5.4 Sizing a pool

| Workload | Rule of thumb | Reason |
|---|---|---|
| CPU-bound | cores (or cores + 1) | More threads only add context switches |
| Blocking I/O | cores × (1 + wait time / compute time) | Threads waiting on I/O leave cores idle |
| From a target | threads = throughput × latency (Little's law) | Each in-flight request occupies a thread for its whole latency |

```java run Pool sizes from the formulas
public class Main {
    public static void main(String[] args) {
        int cores = 8;
        System.out.println("CPU-bound                 : " + cores + " threads");
        double[][] io = {{50, 5}, {200, 10}, {20, 20}};          // wait ms, compute ms
        for (double[] w : io)
            System.out.printf("wait %3.0f ms, compute %2.0f ms : %3.0f threads%n", w[0],
                    w[1],
                    cores * (1 + w[0] / w[1]));
        double rps = 400, latencySeconds = 0.25;
        System.out.printf("Little's law: %.0f req/s x %.2f s = %.0f threads busy%n",
                rps, latencySeconds, rps * latencySeconds);
    }
}
```

The formulas give a starting point; measure under load and watch queue length and latency. Also remember what the threads call: a pool of 200 threads in front of a database connection pool of 20 just moves the queue into the connection pool.

## 5.5 Futures, cancellation and interruption

`submit` returns a `Future`: `get()` waits for the result (with an optional timeout), `cancel(true)` interrupts the running task. Interruption is **cooperative**: it sets a flag and wakes blocking calls like `sleep`, `wait` and `BlockingQueue.take` with an `InterruptedException`; code that never checks the flag and never blocks cannot be stopped.

```java run Cancelling a task interrupts it
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        try (ExecutorService pool = Executors.newFixedThreadPool(2)) {
            CountDownLatch started = new CountDownLatch(1);
            CompletableFuture<String> how = new CompletableFuture<>();
            Future<?> f = pool.submit(() -> {
                started.countDown();
                try {
                    Thread.sleep(60_000);
                    how.complete("finished normally");
                } catch (InterruptedException e) {
                    how.complete("interrupted, cleaning up");
                    Thread.currentThread().interrupt();       // keep the flag for callers
                }
            });
            started.await();
            System.out.println("cancel(true) returned " + f.cancel(true));
            System.out.println("task reported: " + how.get(5, TimeUnit.SECONDS));
            System.out.println("isCancelled " + f.isCancelled() + ", isDone " + f.isDone());
            try {
                f.get();
            } catch (CancellationException e) {
                System.out.println("get() -> CancellationException");
            }
        }   // close() = shutdown + await (Java 19+)
    }
}
```

> TRAP: Never swallow `InterruptedException` with an empty `catch`. Either propagate it or restore the flag with `Thread.currentThread().interrupt()`, so that the code above you (an executor shutting down, a cancelled request) still knows it was asked to stop.

## 5.6 Exceptions that disappear

An exception thrown by a task passed to `submit` is captured in the `Future`. If nobody calls `get()`, it is never seen: no log line, no stack trace.

```java run submit swallows exceptions; execute does not
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        ExecutorService pool = Executors.newSingleThreadExecutor(r -> {
            Thread t = new Thread(r, "worker");
            t.setUncaughtExceptionHandler((th, e) ->
                    System.out.println("uncaught in " + th.getName() + ": "
                            + e.getMessage()));
            return t;
        });
        Future<?> f = pool.submit(() -> {
                throw new IllegalStateException("from submit"); });
        Thread.sleep(200);
        System.out.println("after submit: nothing was printed by the handler");
        try {
            f.get();
        } catch (ExecutionException e) {
            System.out.println("get() reveals: " + e.getCause());
        }
        pool.execute(() -> { throw new IllegalStateException("from execute"); });
        pool.shutdown();
        pool.awaitTermination(5, TimeUnit.SECONDS);
    }
}
```

Always either call `get()` (or `join()` on a `CompletableFuture`), wrap task bodies in `try/catch` that log, or use `execute` with an uncaught-exception handler. Scheduled periodic tasks are the worst case: one exception cancels all future runs silently.

## 5.7 Fork/join and parallel streams

`ForkJoinPool` runs tasks that split themselves into subtasks (`RecursiveTask`). Each worker has its own deque; idle workers **steal** tasks from the tail of busy workers' deques, which balances uneven work automatically. Parallel streams run on the shared `ForkJoinPool.commonPool()` (cores − 1 threads plus the caller).

```java run Parallel streams: correct reductions and a broken side effect
import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        long seq = LongStream.rangeClosed(1, 50_000_000).sum();
        long par = LongStream.rangeClosed(1, 50_000_000).parallel().sum();
        System.out.println("sequential and parallel sums equal: " + (seq == par) + " ("
                + par + ")");

        List<Integer> unsafe = new ArrayList<>();
        boolean failed;
        try {
            IntStream.range(0, 1_000_000).parallel().forEach(unsafe::add);
            // shared ArrayList
            failed = unsafe.size() != 1_000_000;
        } catch (RuntimeException e) {
            failed = true;
        }
        System.out.println("side-effecting forEach into ArrayList went wrong: " + failed);
        List<Integer> safe = IntStream.range(0, 1_000_000).parallel().boxed()
                .collect(Collectors.toList());
        System.out.println("collect() instead: size " + safe.size() + ", in order: "
                + safe.equals(
                IntStream.range(0, 1_000_000).boxed().toList()));
    }
}
```

Rules for parallel streams: use them for CPU-bound work on large, easily split sources (arrays, ranges) with no shared mutable state; use `collect`/`reduce`, not side effects; and **never block** inside them, because a blocked common-pool worker starves every other parallel stream and `CompletableFuture` in the JVM.

## 5.8 Practical lessons

- Configure `ThreadPoolExecutor` explicitly: bounded queue, named threads, deliberate rejection policy.
- The pool grows past core size only when the queue is full.
- Size from the workload (cores for CPU-bound, more for I/O) and Little's law, then measure.
- Handle interruption properly, and never let task exceptions vanish inside futures.

# Chapter 6: CompletableFuture
%Composing asynchronous work: chaining, combining, fan-out and fan-in, errors, timeouts and choosing executors

## 6.1 From Future to CompletableFuture

A plain `Future` can only be waited on. `CompletableFuture<T>` (Java 8) is a future you can **compose**: attach the next step to run when the result arrives, combine several results, and recover from errors, without blocking a thread while waiting.

| Method | Like | Purpose |
|---|---|---|
| `supplyAsync(supplier, executor)` | Start | Run a computation asynchronously |
| `thenApply(f)` | `map` | Transform the result |
| `thenCompose(f)` | `flatMap` | Next step is itself asynchronous (returns a `CompletableFuture`) |
| `thenCombine(other, f)` | `zip` | Combine two independent results |
| `thenAccept` / `thenRun` | `forEach` | Consume the result / run an action |
| `allOf(...)` / `anyOf(...)` | Join | Wait for all / the first |
| `exceptionally`, `handle`, `whenComplete` | `catch` / `finally` | Recover, transform or observe failures |
| `orTimeout`, `completeOnTimeout` | Timeout | Fail or fall back after a deadline (Java 9) |
| `join()` / `get()` | Block | Wait: `join` throws unchecked `CompletionException` |

## 6.2 Calling services in parallel

A typical interview task: load a customer's profile, latest meter reading and tariff, which are independent, and combine them. Sequential calls cost the **sum** of the latencies; parallel calls cost roughly the **maximum**.

```java run Three independent calls, sequential versus parallel
import java.util.concurrent.*;

public class Main {
    static String call(String what, long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        return what;
    }

    public static void main(String[] args) {
        try (ExecutorService io = Executors.newFixedThreadPool(4)) {
            long t0 = System.nanoTime();
            String seq = call("profile", 300) + " | " + call("reading", 200) + " | "
                    + call("tariff", 250);
            long seqMs = (System.nanoTime() - t0) / 1_000_000;

            t0 = System.nanoTime();
            var profile = CompletableFuture.supplyAsync(() -> call("profile", 300), io);
            var reading = CompletableFuture.supplyAsync(() -> call("reading", 200), io);
            var tariff = CompletableFuture.supplyAsync(() -> call("tariff", 250), io);
            String par = profile.thenCombine(reading, (p, r) -> p + " | " + r)
                                .thenCombine(tariff, (pr, t) -> pr + " | " + t)
                                .join();
            long parMs = (System.nanoTime() - t0) / 1_000_000;

            System.out.println("same result: " + seq.equals(par) + " -> " + par);
            System.out.println("sequential took at least 750 ms: " + (seqMs >= 750));
            System.out.println("parallel took under 600 ms     : " + (parMs < 600));
        }
    }
}
```

## 6.3 thenApply versus thenCompose, and fan-out

`thenApply` with a function that returns a `CompletableFuture` produces a nested `CompletableFuture<CompletableFuture<T>>`; `thenCompose` flattens it, exactly like `map` versus `flatMap`. For a variable number of calls, start them all, then wait with `allOf` and collect the results **in the original order**:

```java run Fan-out and fan-in over a list of meters
import java.util.*;
import java.util.concurrent.*;

public class Main {
    static CompletableFuture<Integer> fetchReading(String meter, Executor ex) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                Thread.sleep(50 + Math.abs(meter.hashCode() % 100));
            } catch (InterruptedException e) { }
            return meter.length() * 100 + meter.charAt(meter.length() - 1);
        }, ex);
    }

    static CompletableFuture<String> lookupMeter(String customer, Executor ex) {
        return CompletableFuture.supplyAsync(() -> "MTR-" + customer.toUpperCase(), ex);
    }

    public static void main(String[] args) {
        try (ExecutorService io = Executors.newFixedThreadPool(8)) {
            CompletableFuture<CompletableFuture<Integer>> nested =
                    lookupMeter("asha", io).thenApply(m -> fetchReading(m, io));
            CompletableFuture<Integer> flat =
                    lookupMeter("asha", io).thenCompose(m -> fetchReading(m, io));
            System.out.println("thenApply gives a nested future; thenCompose: "
                    + flat.join());
            System.out.println("nested needs two joins: " + nested.join().join());

            List<String> meters = List.of("MTR-1", "MTR-22", "MTR-333", "MTR-4444");
            List<CompletableFuture<Integer>> futures = meters.stream()
                    .map(m -> fetchReading(m, io)).toList();
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
            List<Integer> readings = futures.stream().map(CompletableFuture::join).toList();
            System.out.println("readings in request order: " + readings);
        }
    }
}
```

The calls finish in an order that depends on their latencies, but collecting from the list of futures (not from callbacks as they complete) returns results in request order.

## 6.4 Errors and timeouts

An exception in any stage completes the future **exceptionally**, and every dependent stage is skipped until a recovery method handles it. `join()` then throws a `CompletionException` wrapping the cause.

```java run Recovering from failures and slow calls
import java.util.concurrent.*;

public class Main {
    static int tariff(String plan) {
        if (plan.equals("legacy")) throw new IllegalArgumentException("unknown plan "
                + plan);
        return 7;
    }

    public static void main(String[] args) {
        var failing = CompletableFuture.supplyAsync(() -> tariff("legacy"))
                .thenApply(r -> r * 100);                              // skipped
        try { failing.join(); }
        catch (CompletionException e) {
            System.out.println("join threw CompletionException, cause: " + e.getCause());
        }

        int recovered = CompletableFuture.supplyAsync(() -> tariff("legacy"))
                .exceptionally(e -> 5)                                 // default tariff
                .join();
        System.out.println("exceptionally -> " + recovered);

        String handled = CompletableFuture.supplyAsync(() -> tariff("standard"))
                .handle((r, e) -> e == null ? "rate " + r : "fallback")
                .join();
        System.out.println("handle -> " + handled);

        var slow = CompletableFuture.supplyAsync(() -> {
            try { Thread.sleep(2_000); } catch (InterruptedException e) { }
            return "live price";
        });
        System.out.println("completeOnTimeout -> " + slow.completeOnTimeout("cached price",
                100, TimeUnit.MILLISECONDS).join());
        var slow2 = new CompletableFuture<String>().orTimeout(100, TimeUnit.MILLISECONDS);
        try { slow2.join(); }
        catch (CompletionException e) {
            System.out.println("orTimeout -> " + e.getCause().getClass().getSimpleName());
        }
    }
}
```

> TRAP: `completeOnTimeout` and `orTimeout` complete the **future**, but they do not stop the underlying work: the slow task keeps running (and holding its thread) until it finishes. `cancel(true)` on a `CompletableFuture` does not interrupt it either. Real timeouts must also be set on the HTTP client or JDBC call itself.

## 6.5 Which thread runs each stage?

| Method form | Runs on |
|---|---|
| `thenApply(f)` | The thread that completes the previous stage, or **the caller** if it is already complete |
| `thenApplyAsync(f)` | `ForkJoinPool.commonPool()` |
| `thenApplyAsync(f, executor)` | The given executor |
| `supplyAsync(s)` without executor | The common pool: **never** use it for blocking I/O |

```java run Thread names reveal where stages run
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) {
        AtomicInteger n = new AtomicInteger();
        try (ExecutorService io = Executors.newFixedThreadPool(2, r -> new Thread(r, "io-"
                + n.incrementAndGet()))) {
            String done = CompletableFuture.completedFuture(1)
                    .thenApply(x -> Thread.currentThread().getName()).join();
            System.out.println("thenApply on a completed future ran on: " + done);
            String async = CompletableFuture.completedFuture(1)
                    .thenApplyAsync(x -> Thread.currentThread().getName(), io).join();
            System.out.println("thenApplyAsync(f, io) ran on          : "
                    + async.replaceAll("\\d", "N"));
            String common = CompletableFuture.supplyAsync(() -> Thread.currentThread()
                    .getName()).join();
            System.out.println("supplyAsync without executor ran on   : "
                    + common.replaceAll("\\d+", "N"));
        }
    }
}
```

The non-async forms can therefore run on surprising threads, including an HTTP client's I/O thread or the caller. Give every asynchronous pipeline that blocks its own bounded executor, and name its threads so thread dumps are readable.

## 6.6 Practical lessons

- `thenApply` maps, `thenCompose` flat-maps, `thenCombine` zips, `allOf` joins many.
- Start independent calls first, then combine: latency becomes the maximum, not the sum.
- Handle errors with `exceptionally`/`handle`; timeouts complete the future but do not stop the work.
- Pass an explicit executor for anything that blocks; never block the common pool.
