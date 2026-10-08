# Solutions
%Every program executed on JDK 25; outputs are facts that hold on every run

## Part 1 solutions

### C1.1 Amdahl's ceiling

Speed-up on 8 cores = 1 / (0.2 + 0.8 / 8) = 1 / 0.3 = **3.33×**. With unlimited cores the parallel part vanishes and the limit is 1 / 0.2 = **5×**. For 4×: 0.2 + 0.8 / n = 0.25 gives 0.8 / n = 0.05, so **n = 16 cores**, twice the hardware for a 20% gain over 8 cores. Reducing the serial part is worth far more than adding cores.

```java run Checking C1.1
public class Main {
    static double speedup(double s, int n) { return 1 / (s + (1 - s) / n); }
    public static void main(String[] args) {
        for (int n : new int[]{8, 16, 1_000_000})
            System.out.printf("%,9d cores: %.2fx%n", n, speedup(0.2, n));
    }
}
```

### C1.2 Duplicate IDs

```java run Racy and fixed ID generators
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {
    static long next = 0;
    static long racyId() { return next++; }

    static final AtomicLong atomic = new AtomicLong();
    static long atomicId() { return atomic.getAndIncrement(); }

    static long locked = 0;
    static synchronized long lockedId() { return locked++; }

    static int duplicates(java.util.function.LongSupplier gen) throws Exception {
        Set<Long> seen = ConcurrentHashMap.newKeySet();
        LongAdder dups = new LongAdder();
        try (ExecutorService pool = Executors.newFixedThreadPool(8)) {
            for (int t = 0; t < 8; t++)
                pool.submit(() -> {
                        for (int i = 0; i < 250_000; i++)
                            if (!seen.add(gen.getAsLong())) dups.increment();
                    });
        }
        return dups.intValue();
    }

    public static void main(String[] args) throws Exception {
        System.out.println("racy next++ produced duplicates: "
                + (duplicates(Main::racyId) > 0));
        System.out.println("AtomicLong duplicates          : "
                + duplicates(Main::atomicId));
        System.out.println("synchronized duplicates        : "
                + duplicates(Main::lockedId));
    }
}
```

`next++` reads `next`, adds one and writes it back; two threads that read the same value return the same ID. Both fixes make the read-modify-write a single atomic step: `AtomicLong.getAndIncrement()` with a CAS (preferred: no blocking), or a `synchronized` method. In a distributed system the same bug appears one level up, and the answer becomes a database sequence or a Snowflake-style generator (see the Distributed Systems guide).

### C1.3 Which outcomes are possible?

| Outcome (r1, r2) | Plain fields | Volatile fields |
|---|---|---|
| (0, 1) | Possible: thread 1 runs completely first | Possible |
| (1, 0) | Possible: thread 2 runs completely first | Possible |
| (1, 1) | Possible: both writes happen, then both reads | Possible |
| (0, 0) | **Possible**: each thread's read may be performed before its own write becomes visible (store buffers, compiler reordering) | **Impossible** |

With plain fields the program has data races, and the JMM allows each thread's write and read of *different* variables to be reordered. With `volatile`, there are no data races, and the JMM guarantees that a data-race-free program behaves **sequentially consistently**: all volatile accesses appear in one total order consistent with each thread's program order. Whichever write comes first in that order is before the other thread's read, so at least one read sees 1. (On x86, the JVM implements this by putting a full fence after each volatile write.)

### C1.4 The expensive cache loaded eight times

```java run Check-then-act on a lazy field
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Supplier;

public class Main {
    static final AtomicInteger loads = new AtomicInteger();
    static Map<String, Integer> loadTable() {
        loads.incrementAndGet();
        try { Thread.sleep(100); } catch (InterruptedException e) { }
        return Map.of("standard", 7, "night", 4);
    }

    static Map<String, Integer> racyTable;                       // plain field
    static Map<String, Integer> racy() {
        if (racyTable == null) racyTable = loadTable();          // check-then-act
        return racyTable;
    }

    static class Holder { static final Map<String, Integer> TABLE = loadTable(); }
    static Map<String, Integer> safe() { return Holder.TABLE; }

    static void race(Supplier<Map<String, Integer>> get) throws Exception {
        loads.set(0);
        CountDownLatch gate = new CountDownLatch(1);
        try (ExecutorService pool = Executors.newFixedThreadPool(8)) {
            for (int i = 0; i < 8; i++)
                pool.submit(() -> { gate.await(); return get.get(); });
            gate.countDown();
        }
        System.out.println("loaded exactly once: " + (loads.get() == 1));
    }

    public static void main(String[] args) throws Exception {
        System.out.print("racy lazy field -> "); race(Main::racy);
        System.out.print("holder idiom    -> "); race(Main::safe);
    }
}
```

Threads that arrive while the first load is still running all see `null`, so the 100 ms load runs several times (typically once per thread) (and on a cold start, against a database that is already busy). The two bugs: **atomicity** (check-then-act, so the load runs repeatedly) and **visibility** (the plain field publishes the map without a happens-before edge, so in principle another thread could see a reference to a map whose contents are not yet visible). Fixes: the holder idiom for a single value, a `volatile` field with double-checked locking, or, for a cache of many keys, `ConcurrentHashMap.computeIfAbsent`, which runs the loader at most once per key.

### C1.5 Make it immutable

```java run An immutable MeterReading as a record with defensive copies
import java.time.Instant;
import java.util.*;

public class Main {
    record MeterReading(String meterId, Instant takenAt, List<Integer> hourly) {
        MeterReading {
            Objects.requireNonNull(meterId);
            Objects.requireNonNull(takenAt);   // Instant is immutable, unlike Date
            hourly = List.copyOf(hourly);   // copy in: unmodifiable, null-free
        }
    }

    public static void main(String[] args) {
        List<Integer> source = new ArrayList<>(List.of(3, 4, 5));
        MeterReading r = new MeterReading("MTR-7", Instant.parse("2026-10-01T06:00:00Z"),
                source);
        source.add(99);                                   // caller changes its own list
        System.out.println("after caller's change: " + r.hourly());
        try {
            r.hourly().add(1);
        } catch (UnsupportedOperationException e) {
            System.out.println("hourly() cannot be modified: UnsupportedOperationException");
        }
        System.out.println(r);
    }
}
```

The changes: every field `final` (a record does this), no setters, `Date` (mutable) replaced by `Instant` (immutable), and the list copied on the way in with `List.copyOf`, which also makes the getter safe to return directly because the copy is unmodifiable. If `Date` had to stay, the constructor and getter would both need `new Date(d.getTime())` copies. Final fields give the JMM's initialisation-safety guarantee, so instances can be shared freely between threads.

### C1.6 Stopping a worker

With a plain `boolean`, nothing creates a happens-before edge between the writer of `running = false` and the loop's reads, so the JIT may legally read the field once and compile the loop as `while (true)`. Adding `Thread.sleep(1)` happens to stop the hoisting (the JIT cannot prove the field unchanged across the call) and the loop then usually exits, but the JMM does not promise this; the code is still broken, just less visibly. Fixes: declare the flag `volatile`, use `AtomicBoolean`, or better, use **interruption**, which also wakes a worker blocked in `take()` or `sleep()`; a flag cannot do that.

```java run A worker that stops reliably, even while blocked
import java.util.*;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        BlockingQueue<String> jobs = new LinkedBlockingQueue<>();
        List<String> done = Collections.synchronizedList(new ArrayList<>());
        CompletableFuture<String> exitReason = new CompletableFuture<>();
        Thread worker = new Thread(() -> {
            try {
                while (!Thread.currentThread().isInterrupted()) {
                    String job = jobs.take();
                    // take() blocks when idle, and an interrupt wakes it
                    done.add(job);
                }
                exitReason.complete("saw the interrupt flag");
            } catch (InterruptedException e) {
                exitReason.complete("interrupted while waiting in take()");
            }
        }, "worker");
        worker.start();
        for (String j : List.of("bill-1", "bill-2", "bill-3")) jobs.put(j);
        while (!jobs.isEmpty()) Thread.onSpinWait();      // let it drain, then go idle
        while (worker.getState() != Thread.State.WAITING) Thread.onSpinWait();
        worker.interrupt();
        worker.join(5_000);
        System.out.println("processed " + done + "; worker alive: " + worker.isAlive());
        System.out.println("exit: " + exitReason.get());
    }
}
```

## Part 2 solutions

### C2.1 A bounded buffer with conditions

```java run ReentrantLock with notFull and notEmpty
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.locks.*;

public class Main {
    static class Buffer {
        private final int[] items = new int[4];
        private int head, tail, count;
        private final ReentrantLock lock = new ReentrantLock();
        private final Condition notFull = lock.newCondition(),
                notEmpty = lock.newCondition();

        void put(int x) throws InterruptedException {
            lock.lock();
            try {
                while (count == items.length) notFull.await();
                items[tail] = x; tail = (tail + 1) % items.length; count++;
                notEmpty.signal();                       // wake one consumer
            } finally { lock.unlock(); }
        }
        int take() throws InterruptedException {
            lock.lock();
            try {
                while (count == 0) notEmpty.await();
                int x = items[head]; head = (head + 1) % items.length; count--;
                notFull.signal();                        // wake one producer
                return x;
            } finally { lock.unlock(); }
        }
    }

    public static void main(String[] args) throws Exception {
        Buffer buf = new Buffer();
        int producers = 3, each = 1_000, total = producers * each;
        Set<Integer> consumed = ConcurrentHashMap.newKeySet();
        ConcurrentLinkedQueue<Integer> duplicates = new ConcurrentLinkedQueue<>();
        try (ExecutorService pool = Executors.newFixedThreadPool(5)) {
            for (int p = 0; p < producers; p++) {
                int base = p * each;
                pool.submit(() -> { for (int i = 0; i < each; i++) buf.put(base
                        + i); return null; });
            }
            for (int c = 0; c < 2; c++)
                pool.submit(() -> {
                    for (int i = 0; i < total / 2; i++) {
                        int x = buf.take();
                        if (!consumed.add(x)) duplicates.add(x);
                    }
                    return null;
                });
        }
        System.out.println("consumed " + consumed.size() + " distinct of " + total
                + ", duplicates " + duplicates.size());
    }
}
```

Two conditions mean a `put` wakes only consumers and a `take` wakes only producers, so `signal()` (one thread) is enough and safe. With a single wait set and `notify()`, a producer could wake another producer while consumers sleep, and the system could stall; that is why the monitor version needs `notifyAll()`.

### C2.2 Transfers without deadlock, using tryLock

```java run tryLock with random back-off
import java.util.concurrent.*;
import java.util.concurrent.locks.ReentrantLock;

public class Main {
    static class Account {
        final ReentrantLock lock = new ReentrantLock();
        long balance = 1_000;
    }

    static void transfer(Account from, Account to,
            long amount) throws InterruptedException {
        while (true) {
            if (from.lock.tryLock()) {
                try {
                    if (to.lock.tryLock()) {
                        try {
                            if (from.balance >= amount) {
                                from.balance -= amount;
                                to.balance += amount;
                            }
                            return;
                        } finally { to.lock.unlock(); }
                    }
                } finally { from.lock.unlock(); }
            }
            // random back-off
            Thread.sleep(0, ThreadLocalRandom.current().nextInt(1_000));
        }
    }

    public static void main(String[] args) throws Exception {
        Account[] acc = new Account[10];
        for (int i = 0; i < acc.length; i++) acc[i] = new Account();
        ExecutorService pool = Executors.newFixedThreadPool(8);
        for (int t = 0; t < 8; t++)
            pool.submit(() -> {
                var rnd = ThreadLocalRandom.current();
                for (int i = 0; i < 2_500; i++) {
                    int a = rnd.nextInt(10), b = rnd.nextInt(9);
                    if (b >= a) b++;                              // a different account
                    transfer(acc[a], acc[b], rnd.nextInt(1, 200));
                }
                return null;
            });
        pool.shutdown();
        System.out.println("finished: " + pool.awaitTermination(60, TimeUnit.SECONDS));
        long total = 0;
        for (Account a : acc) total += a.balance;
        System.out.println("total money " + total + " (started with 10,000)");
    }
}
```

`tryLock` breaks the hold-and-wait condition: a thread that cannot get the second lock releases the first. The **random** back-off matters; with a fixed delay, two threads can keep colliding in lock-step forever (livelock). Lock ordering (the guide, §3.5) is simpler when all locks are known up front; `tryLock` also works when they are not, and allows a timeout.

### C2.3 Dining philosophers

```java run Resource ordering: lower-numbered fork first
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.locks.ReentrantLock;

public class Main {
    public static void main(String[] args) throws Exception {
        int n = 5, meals = 10_000;
        ReentrantLock[] forks = new ReentrantLock[n];
        for (int i = 0; i < n; i++) forks[i] = new ReentrantLock();
        int[] eaten = new int[n];
        Thread[] ts = new Thread[n];
        for (int p = 0; p < n; p++) {
            int id = p, left = p, right = (p + 1) % n;
            int first = Math.min(left, right), second = Math.max(left, right);
            ts[p] = new Thread(() -> {
                for (int m = 0; m < meals; m++) {
                    forks[first].lock();
                    try {
                        forks[second].lock();
                        try { eaten[id]++; } finally { forks[second].unlock(); }
                    } finally { forks[first].unlock(); }
                }
            });
            ts[p].start();
        }
        for (Thread t : ts) t.join(30_000);
        System.out.println("meals per philosopher: " + Arrays.toString(eaten));
    }
}
```

If every philosopher takes the left fork first, all five can hold one fork and wait for the next: a circular wait. Ordering the forks breaks the cycle: philosopher 4 needs forks 4 and 0 and takes 0 first, so they compete with philosopher 0 for fork 0 instead of closing the circle. Other valid answers: a waiter (a `Semaphore(4)` so at most four try to eat at once), or `tryLock` with back-off.

### C2.4 Locking on a changing object

`count++` on an `Integer` unboxes, adds and **boxes a new object**, then assigns it to `count`. Threads therefore synchronise on whichever `Integer` object they read at the time, which changes with every increment: different threads hold locks on different objects, and there is no mutual exclusion. Worse, small `Integer` values come from a shared cache, so unrelated code locking on `Integer.valueOf(5)` would contend with this one.

```java run Synchronising on a field that is reassigned
import java.util.concurrent.*;

public class Main {
    static class Counter {
        private Integer count = 0;
        void increment() { synchronized (count) { count++; } }
    }
    static class Fixed {
        private final Object lock = new Object();
        private int count = 0;
        void increment() { synchronized (lock) { count++; } }
    }

    public static void main(String[] args) throws Exception {
        Counter c = new Counter(); Fixed f = new Fixed();
        try (ExecutorService pool = Executors.newFixedThreadPool(8)) {
            for (int t = 0; t < 8; t++)
                pool.submit(() -> { for (int i = 0; i < 1_000_000; i++) {
                        c.increment(); f.increment(); } });
        }
        System.out.println("lock on the Integer lost updates: " + (c.count < 8_000_000));
        System.out.println("private final lock object      : " + f.count);
    }
}
```

Rule: lock on a `private final` field that never changes, never on a boxed value, a `String` literal or any object outside code can reach.

### C2.5 A lock-free stack

```java run A Treiber stack under concurrent push and pop
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {
    static class Stack<T> {
        private record Node<T>(T value, Node<T> next) { }
        private final AtomicReference<Node<T>> head = new AtomicReference<>();

        void push(T v) {
            Node<T> h;
            do { h = head.get(); } while (!head.compareAndSet(h, new Node<>(v, h)));
        }
        T pop() {                                         // null when empty
            Node<T> h;
            do {
                h = head.get();
                if (h == null) return null;
            } while (!head.compareAndSet(h, h.next()));
            return h.value();
        }
    }

    public static void main(String[] args) throws Exception {
        Stack<Integer> stack = new Stack<>();
        int pushers = 4, each = 100_000, total = pushers * each;
        Set<Integer> popped = ConcurrentHashMap.newKeySet();
        AtomicInteger poppedCount = new AtomicInteger();
        try (ExecutorService pool = Executors.newFixedThreadPool(8)) {
            for (int p = 0; p < pushers; p++) {
                int base = p * each;
                pool.submit(() -> { for (int i = 0; i < each; i++) stack.push(base + i); });
            }
            for (int c = 0; c < 4; c++)
                pool.submit(() -> {
                    while (poppedCount.get() < total) {
                        Integer v = stack.pop();
                        if (v != null) { popped.add(v); poppedCount.incrementAndGet(); }
                    }
                });
        }
        System.out.println("popped " + poppedCount.get() + " values, distinct "
                + popped.size()
                + ", stack empty: " + (stack.pop() == null));
    }
}
```

Every push and pop is a single CAS on `head`; a thread that loses the race rereads and retries. Popped count equal to distinct count shows nothing was popped twice, and both equal to 400,000 shows nothing was lost. ABA is not a danger here because each push allocates a new node and the garbage collector never reuses a node that some thread still references; in C or C++ with manual memory reuse, this same code would need tagged pointers or hazard pointers.

### C2.6 Concurrent word counts

```java run ConcurrentHashMap of LongAdder versus a sequential count
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.LongAdder;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) throws Exception {
        String[] vocab = {"meter", "reading", "tariff", "bill", "peak", "night", "solar",
                "grid"};
        SplittableRandom rnd = new SplittableRandom(42);
        String[] words = new String[2_000_000];
        for (int i = 0; i < words.length; i++)
            words[i] = vocab[Math.min(rnd.nextInt(8), rnd.nextInt(8))];

        Map<String, Long> sequential = new TreeMap<>();
        for (String w : words) sequential.merge(w, 1L, Long::sum);

        ConcurrentHashMap<String, LongAdder> counts = new ConcurrentHashMap<>();
        int chunk = words.length / 8;
        try (ExecutorService pool = Executors.newFixedThreadPool(8)) {
            for (int t = 0; t < 8; t++) {
                int from = t * chunk, to = from + chunk;
                pool.submit(() -> {
                    for (int i = from; i < to; i++)
                        counts.computeIfAbsent(words[i], k -> new LongAdder()).increment();
                });
            }
        }
        Map<String, Long> concurrent = new TreeMap<>();
        counts.forEach((k, v) -> concurrent.put(k, v.sum()));
        System.out.println("matches sequential count: " + concurrent.equals(sequential));
        String top = concurrent.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(3).map(e -> e.getKey() + "=" + e.getValue())
                        .collect(Collectors.joining(", "));
        System.out.println("top 3: " + top);
    }
}
```

`computeIfAbsent` creates each adder exactly once; after that, increments touch only the adder, never the map's bin lock, so eight threads hammering eight keys scale well.

### C2.7 Choose the structure

| Need | Choice | Why |
|---|---|---|
| (a) Request counter, written constantly, read every 15 s | `LongAdder` | Striped cells avoid CAS contention; an exact instantaneous value is not needed |
| (b) Listeners registered at start-up, notified per event | `CopyOnWriteArrayList` | Lock-free iteration over a snapshot; rare writes can afford a copy |
| (c) Tariff cache loaded on first use | `ConcurrentHashMap.computeIfAbsent` (or Caffeine for eviction) | Loads each key at most once, concurrent reads without locks |
| (d) Jobs from 4 HTTP threads to 2 workers with back-pressure | Bounded `ArrayBlockingQueue` with `offer(timeout)` | Producers wait or fail fast when workers fall behind; memory bounded |
| (e) Unique invoice sequence number | `AtomicLong.incrementAndGet()` in one process; a database sequence across processes | Exact, gap-free within a process; the database is the single source of truth across instances |
