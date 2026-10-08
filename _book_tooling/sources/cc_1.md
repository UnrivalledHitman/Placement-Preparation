# Chapter 3: Locks and Conditions
%Monitors and reentrancy, wait and notify, ReentrantLock and conditions, read-write and stamped locks, and deadlock

## 3.1 synchronized and monitors

Every Java object has a **monitor**. A `synchronized` method or block acquires it on entry and releases it on exit, including exit by exception. It gives both mutual exclusion and the happens-before edge from Chapter 2.

| Form | Lock used |
|---|---|
| `synchronized void m()` | `this` |
| `static synchronized void m()` | The `Class` object (`Main.class`) |
| `synchronized (obj) { ... }` | `obj`: prefer a private final lock object, so outside code cannot lock it too |

Monitors are **reentrant**: a thread that holds a lock can acquire it again, so a synchronized method can call another synchronized method on the same object without deadlocking itself.

```java run Reentrancy
public class Main {
    private int depth = 0;
    synchronized void outer() { depth++; inner(); }
    synchronized void inner() {
        depth++;
        System.out.println("inner ran, holds lock: " + Thread.holdsLock(this));
    }

    public static void main(String[] args) {
        Main m = new Main();
        m.outer();
        System.out.println("depth " + m.depth + "; lock held after return: "
                + Thread.holdsLock(m));
    }
}
```

## 3.2 wait, notify and guarded blocks

`wait()` releases the monitor and suspends the thread until another thread calls `notify()` or `notifyAll()` on the same object. Three rules make it correct:

1. Call `wait`/`notify` only while holding the object's monitor (otherwise `IllegalMonitorStateException`).
2. Always wait **in a loop** that rechecks the condition: wake-ups can be spurious, and another thread may have consumed the state before this one reacquired the lock.
3. Prefer `notifyAll()` unless all waiters wait for the same condition and any one of them can proceed.

```java run A one-slot mailbox with wait and notifyAll
import java.util.*;

public class Main {
    static class Mailbox {
        private String item;                               // guarded by this
        synchronized void put(String s) throws InterruptedException {
            while (item != null) wait();                   // loop, never if
            item = s;
            notifyAll();
        }
        synchronized String take() throws InterruptedException {
            while (item == null) wait();
            String s = item;
            item = null;
            notifyAll();
            return s;
        }
    }

    public static void main(String[] args) throws Exception {
        Mailbox box = new Mailbox();
        List<String> received = new ArrayList<>();
        Thread consumer = new Thread(() -> {
            try {
                for (int i = 0; i < 5; i++) received.add(box.take());
            } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        });
        consumer.start();
        for (String r : List.of("r1", "r2", "r3", "r4", "r5")) box.put(r);
        consumer.join();                                   // join makes 'received' visible
        System.out.println("received in order: " + received);
    }
}
```

The producer can never run ahead by more than one item, and the order is guaranteed because each `put` waits for the previous item to be taken. In real code, use a `BlockingQueue` (Chapter 4), which does all of this internally; the LLD guide, §6.4, builds a full producer–consumer system with one.

## 3.3 ReentrantLock and conditions

`java.util.concurrent.locks.ReentrantLock` does what `synchronized` does, plus:

| Feature | Use |
|---|---|
| `tryLock()` / `tryLock(timeout)` | Give up instead of waiting forever: avoids deadlock, enables back-off |
| `lockInterruptibly()` | A waiting thread can be cancelled |
| Fairness (`new ReentrantLock(true)`) | Longest-waiting thread gets the lock next; lower throughput |
| Several `Condition`s per lock | Separate wait sets: `notFull` and `notEmpty` instead of one `notifyAll` |
| Introspection | `isLocked()`, `getQueueLength()`, `isHeldByCurrentThread()` |

The price is discipline: `unlock()` must be in a `finally` block, or an exception leaves the lock held forever.

```java run tryLock gives up when the lock is busy
import java.util.concurrent.*;
import java.util.concurrent.locks.*;

public class Main {
    public static void main(String[] args) throws Exception {
        ReentrantLock lock = new ReentrantLock();
        CountDownLatch held = new CountDownLatch(1), release = new CountDownLatch(1);
        Thread holder = new Thread(() -> {
            lock.lock();
            try { held.countDown(); release.await(); }
            catch (InterruptedException e) { }
            finally { lock.unlock(); }
        });
        holder.start();
        held.await();
        System.out.println("lock held by other thread: " + lock.isLocked());
        boolean got = lock.tryLock(100, TimeUnit.MILLISECONDS);
        System.out.println("tryLock(100 ms) succeeded: " + got);
        release.countDown();
        holder.join();
        got = lock.tryLock();
        System.out.println("after release, tryLock succeeded: " + got);
        if (got) lock.unlock();
    }
}
```

> TIP: Interview answer for "`synchronized` or `ReentrantLock`?": `synchronized` by default (simpler, cannot forget to unlock, well optimised); `ReentrantLock` when you need timeouts, interruptible waiting, fairness or several conditions.

## 3.4 Read-write and stamped locks

A `ReentrantReadWriteLock` lets many readers in at once but a writer only alone. It pays off when reads are frequent, long and rarely interleaved with writes. A `StampedLock` (Java 8) adds **optimistic reads**: read without locking, then check a stamp to see whether a write happened meanwhile, and retry under a real read lock only if it did.

```java run An optimistic read detects an intervening write
import java.util.concurrent.locks.StampedLock;

public class Main {
    static double x = 1, y = 1;
    static final StampedLock sl = new StampedLock();

    static double distance() {
        long stamp = sl.tryOptimisticRead();
        double cx = x, cy = y;
        if (!sl.validate(stamp)) {                         // a write happened: fall back
            stamp = sl.readLock();
            try { cx = x; cy = y; } finally { sl.unlockRead(stamp); }
        }
        return Math.sqrt(cx * cx + cy * cy);
    }

    public static void main(String[] args) throws Exception {
        long stamp = sl.tryOptimisticRead();
        System.out.println("no writer yet, stamp valid: " + sl.validate(stamp));
        Thread writer = new Thread(() -> {
            long w = sl.writeLock();
            try { x = 3; y = 4; } finally { sl.unlockWrite(w); }
        });
        writer.start(); writer.join();
        System.out.println("after a write, same stamp valid: " + sl.validate(stamp));
        System.out.println("distance read correctly: " + distance());
    }
}
```

`StampedLock` is not reentrant and has no conditions; use it for small, hot, read-mostly data such as coordinates or counters. The LLD guide, §6.5, compares read-write locks with copy-on-write for configuration data.

## 3.5 Deadlock

A deadlock needs all four **Coffman conditions**: mutual exclusion, hold and wait, no pre-emption, and a circular wait. Break any one and deadlock is impossible. The program forces the classic case, two transfers locking two accounts in opposite orders, and then asks the JVM to find it, exactly as `jstack` does in production.

```java run Forcing a deadlock and detecting it
import java.lang.management.*;
import java.util.*;
import java.util.concurrent.*;

public class Main {
    static class Account { final String id; Account(String id) { this.id = id; } }

    static void transfer(Account from, Account to, CyclicBarrier bothHoldFirst) {
        synchronized (from) {
            try { bothHoldFirst.await(); } catch (Exception e) { return; }
            synchronized (to) { System.out.println("never printed"); }
        }
    }

    public static void main(String[] args) throws Exception {
        Account a = new Account("A"), b = new Account("B");
        CyclicBarrier barrier = new CyclicBarrier(2);
        Thread t1 = new Thread(() -> transfer(a, b, barrier), "transfer A->B");
        Thread t2 = new Thread(() -> transfer(b, a, barrier), "transfer B->A");
        t1.setDaemon(true); t2.setDaemon(true);            // let the JVM exit afterwards
        t1.start(); t2.start();
        ThreadMXBean mx = ManagementFactory.getThreadMXBean();
        long[] ids = null;
        for (int i = 0; i < 100 && ids == null; i++) {
            Thread.sleep(20);
            ids = mx.findDeadlockedThreads();
        }
        List<String> lines = new ArrayList<>();
        for (ThreadInfo info : mx.getThreadInfo(ids))
            lines.add(info.getThreadName() + " is " + info.getThreadState()
                    + ", waiting for a lock held by "
                      + info.getLockOwnerName());
        Collections.sort(lines);
        System.out.println("deadlocked threads: " + ids.length);
        lines.forEach(System.out::println);
    }
}
```

| Fix | Breaks condition | How |
|---|---|---|
| Global lock order | Circular wait | Always lock the account with the smaller ID first (LLD guide, §6.3) |
| `tryLock` with timeout and back-off | Hold and wait | Release everything and retry after a random delay if the second lock is busy |
| One coarse lock | Hold and wait | Simple, but serialises all transfers |
| Lock-free design | Mutual exclusion | Single-writer threads, actors, atomic updates |

```java run Lock ordering removes the deadlock
import java.util.concurrent.*;

public class Main {
    static class Account {
        final int id; long balance;
        Account(int id, long balance) { this.id = id; this.balance = balance; }
    }

    static void transfer(Account from, Account to, long amount) {
        Account first = from.id < to.id ? from : to, second = first == from ? to : from;
        synchronized (first) {
            synchronized (second) { from.balance -= amount; to.balance += amount; }
        }
    }

    public static void main(String[] args) throws Exception {
        Account a = new Account(1, 1_000_000), b = new Account(2, 1_000_000);
        ExecutorService pool = Executors.newFixedThreadPool(8);
        for (int i = 0; i < 100_000; i++) {
            boolean ab = i % 2 == 0;
            pool.submit(() -> transfer(ab ? a : b, ab ? b : a, 7));
        }
        pool.shutdown();
        System.out.println("finished without deadlock: " + pool.awaitTermination(30,
                TimeUnit.SECONDS));
        System.out.println("balances " + a.balance + " + " + b.balance + " = " + (a.balance
                + b.balance));
    }
}
```

## 3.6 Livelock, starvation and fairness

| Problem | What happens | Typical fix |
|---|---|---|
| Deadlock | Threads wait for each other forever; CPU idle | Lock ordering, timeouts |
| Livelock | Threads keep reacting to each other and retrying; CPU busy, no progress | **Random** back-off before retrying |
| Starvation | A thread never gets the lock or CPU because others always win | Fair locks, bounded queues, avoiding long lock hold times |
| Priority inversion | A low-priority thread holds a lock a high-priority thread needs | Short critical sections; priority inheritance in real-time systems |

## 3.7 Practical lessons

- `synchronized` gives mutual exclusion plus visibility; it is reentrant and released on exceptions.
- Always `wait()` in a loop; prefer `BlockingQueue` and `Condition` over raw wait/notify.
- `ReentrantLock` for timeouts, interruptibility, fairness or several conditions; unlock in `finally`.
- Prevent deadlock by a global lock order or `tryLock`; find it with `jstack` or `ThreadMXBean`.

# Chapter 4: Atomics and Concurrent Collections
%Compare-and-set, LongAdder, the ABA problem, ConcurrentHashMap, copy-on-write lists and blocking queues

## 4.1 Compare-and-set

Atomic classes (`AtomicInteger`, `AtomicLong`, `AtomicReference` and others) are built on the CPU's **compare-and-set** (CAS) instruction: "set the value to *new* only if it is still *expected*; tell me whether it worked". A failed CAS means another thread changed the value first, and the caller simply retries with the fresh value. No thread ever blocks, so there is no deadlock, and a thread that is descheduled cannot hold others up.

```java run A lock-free running maximum with a CAS loop
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {
    static final AtomicLong max = new AtomicLong(Long.MIN_VALUE);

    static void offer(long v) {
        long cur;
        do {
            cur = max.get();
            if (v <= cur) return;                         // nothing to do
        } while (!max.compareAndSet(cur, v));             // lost a race: reread and retry
    }

    public static void main(String[] args) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(8);
        for (int t = 0; t < 8; t++) {
            int seed = t;
            pool.submit(() -> {
                var rnd = new java.util.SplittableRandom(seed);
                for (int i = 0; i < 1_000_000; i++) offer(rnd.nextLong(1_000_000_000L));
            });
        }
        pool.shutdown(); pool.awaitTermination(30, TimeUnit.SECONDS);
        long expected = 0;
        for (int t = 0; t < 8; t++) {
            var rnd = new java.util.SplittableRandom(t);
            for (int i = 0; i < 1_000_000; i++)
                expected = Math.max(expected, rnd.nextLong(1_000_000_000L));
        }
        System.out.println("concurrent max = " + max.get() + ", sequential max = "
                + expected);
        System.out.println("same: " + (max.get() == expected));
        max.accumulateAndGet(5, Math::max);               // the built-in way to do the same
    }
}
```

`accumulateAndGet` and `updateAndGet` package the same loop; their functions must be side-effect free, because they may run several times.

## 4.2 Contention: AtomicLong versus LongAdder

Under heavy contention, many threads CAS the same memory word and most attempts fail and retry, while the cache line bounces between cores. `LongAdder` spreads the count over several cells (one per contending thread, roughly) and adds them up only when `sum()` is called.

```java run Both are exact; they differ in contention behaviour
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {
    public static void main(String[] args) throws Exception {
        AtomicLong atomic = new AtomicLong();
        LongAdder adder = new LongAdder();
        ExecutorService pool = Executors.newFixedThreadPool(8);
        for (int t = 0; t < 8; t++)
            pool.submit(() -> { for (int i = 0; i < 1_000_000; i++) {
                    atomic.incrementAndGet(); adder.increment(); } });
        pool.shutdown(); pool.awaitTermination(30, TimeUnit.SECONDS);
        System.out.println("AtomicLong " + atomic.get() + ", LongAdder " + adder.sum());
    }
}
```

| Use | Choose |
|---|---|
| Counter read often or needing `compareAndSet` (sequence numbers, IDs) | `AtomicLong` |
| Counter updated by many threads, read rarely (metrics, request counts) | `LongAdder` (often several times faster under contention) |
| Frequency map | `ConcurrentHashMap<K, LongAdder>` with `computeIfAbsent(k, x -> new LongAdder()).increment()` |

## 4.3 The ABA problem

CAS checks that a value **equals** what it was, not that it was **unchanged**. If a value goes from A to B and back to A, a thread that read A earlier succeeds with its CAS, although the world changed underneath it. With references this can corrupt lock-free structures (a popped node is reused and pushed back). The fix is to compare a **version stamp** together with the value.

```java run A stamp catches A -> B -> A
import java.util.concurrent.atomic.*;

public class Main {
    public static void main(String[] args) {
        AtomicReference<String> plain = new AtomicReference<>("A");
        AtomicStampedReference<String> stamped = new AtomicStampedReference<>("A", 0);

        String seenPlain = plain.get();                    // thread 1 reads A ...
        int[] holder = new int[1];
        String seenStamped = stamped.get(holder);
        int seenStamp = holder[0];

        plain.set("B"); plain.set("A");   // ... thread 2 changes A -> B -> A
        stamped.set("B", 1); stamped.set("A", 2);

        System.out.println("plain CAS succeeds (ABA unnoticed): "
                + plain.compareAndSet(seenPlain, "C"));
        System.out.println("stamped CAS succeeds              : "
                + stamped.compareAndSet(seenStamped, "C", seenStamp, seenStamp + 1));
        System.out.println("current stamp " + stamped.getStamp() + " vs seen " + seenStamp);
    }
}
```

In Java, garbage collection prevents the most dangerous form of ABA (memory reused while still referenced), so it matters mostly for values and pooled objects. Databases solve the same problem with a version column and optimistic locking.

## 4.4 ConcurrentHashMap

`ConcurrentHashMap` (CHM) allows fully concurrent reads and highly concurrent writes: since Java 8 it locks only the single bin being updated (CAS for an empty bin, `synchronized` on the bin's first node otherwise), and readers never lock. Its methods are atomic one at a time, but **sequences of calls are not**.

```java run get-then-put loses updates; merge does not
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        ConcurrentHashMap<String, Integer> racy = new ConcurrentHashMap<>(),
                atomic = new ConcurrentHashMap<>();
        String[] words = {"meter", "reading", "tariff"};
        ExecutorService pool = Executors.newFixedThreadPool(8);
        for (int t = 0; t < 8; t++)
            pool.submit(() -> {
                for (int i = 0; i < 300_000; i++) {
                    String w = words[i % 3];
                    Integer old = racy.get(w);                     // check ...
                    racy.put(w, old == null ? 1 : old + 1);   // ... then act: not atomic
                    atomic.merge(w, 1, Integer::sum);              // one atomic step
                }
            });
        pool.shutdown(); pool.awaitTermination(60, TimeUnit.SECONDS);
        int expected = 8 * 300_000 / 3;
        System.out.println("expected per word: " + expected);
        System.out.println("get-then-put lost updates: " + racy.values().stream()
                .anyMatch(v -> v < expected));
        System.out.println("merge: " + new java.util.TreeMap<>(atomic));
    }
}
```

| Need | Atomic CHM method |
|---|---|
| Insert if absent | `putIfAbsent(k, v)`, `computeIfAbsent(k, f)` (f runs at most once per absent key) |
| Increment or combine | `merge(k, 1, Integer::sum)`, `compute(k, (key, old) -> ...)` |
| Conditional replace | `replace(k, expected, new)` (CAS on a map entry) |
| Remove if unchanged | `remove(k, expected)` |
| Bulk work | `forEach`, `reduce`, `search` with a parallelism threshold |

> TRAP: Functions passed to `compute`, `computeIfAbsent` and `merge` run while the bin is locked. Keep them short, never block or call remote services inside them, and never modify the same map from inside them.

Other differences from `HashMap`: `null` keys and values are rejected (a `null` from `get` would be ambiguous between "absent" and "mapped to null" under concurrency), and iterators are **weakly consistent**: they never throw `ConcurrentModificationException` and may or may not reflect updates made during iteration.

```java run Fail-fast versus weakly consistent iteration
import java.util.*;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> hash = new HashMap<>(Map.of("a", 1, "b", 2));
        Map<String, Integer> chm = new ConcurrentHashMap<>(Map.of("a", 1, "b", 2));
        for (Map<String, Integer> m : List.of(hash, chm)) {
            try {
                for (String k : m.keySet()) m.put(k + k, 0);      // modify while iterating
                System.out.println(m.getClass().getSimpleName()
                        + ": no exception, size now " + m.size());
            } catch (ConcurrentModificationException e) {
                System.out.println(m.getClass().getSimpleName()
                        + ": ConcurrentModificationException");
            }
        }
        try { chm.put("x", null); }
        catch (NullPointerException e) {
            System.out.println("ConcurrentHashMap rejects null values");
        }
    }
}
```

The final size of the CHM may vary with JDK version and hashing, because the iterator might or might not see the keys being added. That is what "weakly consistent" means; code must not depend on it.

## 4.5 Copy-on-write and blocking queues

`CopyOnWriteArrayList` copies the whole array on every write; iterators work on the snapshot that existed when they started. It suits lists that are read constantly and changed rarely: listeners, routing tables, feature-flag rules.

```java run Iterators see a snapshot
import java.util.concurrent.CopyOnWriteArrayList;

public class Main {
    public static void main(String[] args) {
        var listeners = new CopyOnWriteArrayList<String>(new String[]{"audit", "metrics"});
        for (String l : listeners) {
            listeners.add("late-" + l);
            // no exception, and this loop does not see the new element
            System.out.println("notifying " + l);
        }
        System.out.println("list after the loop: " + listeners);
    }
}
```

| Queue | Bound | Notes |
|---|---|---|
| `ArrayBlockingQueue` | Fixed capacity | One lock; predictable memory; the usual choice for back-pressure |
| `LinkedBlockingQueue` | Optional (default `Integer.MAX_VALUE`) | Separate put and take locks; unbounded by default, so it can hide overload until memory runs out |
| `SynchronousQueue` | Zero | Direct hand-off: `put` waits for a `take` |
| `PriorityBlockingQueue` | Unbounded | Ordered by priority |
| `DelayQueue` | Unbounded | Elements become available after their delay (schedulers, retries) |
| `LinkedTransferQueue` | Unbounded | `transfer` waits until a consumer receives the element |
| `ConcurrentLinkedQueue` | Unbounded | Non-blocking (CAS); `poll` returns `null` when empty |

| Method | Full or empty queue |
|---|---|
| `add` / `remove` | Throws an exception |
| `offer` / `poll` | Returns `false` / `null` immediately |
| `offer(e, timeout)` / `poll(timeout)` | Waits up to the timeout |
| `put` / `take` | Waits indefinitely |

## 4.6 Practical lessons

- CAS loops never block; their update functions must be side-effect free because they may retry.
- `LongAdder` for hot counters read rarely; `AtomicLong` when you need the exact value or CAS.
- ABA: CAS compares values, not history; add a stamp or version when it matters.
- Use CHM's atomic methods (`merge`, `compute`, `putIfAbsent`), never get-then-put; prefer bounded blocking queues.
