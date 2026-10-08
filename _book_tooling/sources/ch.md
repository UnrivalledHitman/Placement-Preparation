# Hints
%Read only the hint for the exercise you are stuck on

## Part 1 hints

| Exercise | Hint |
|---|---|
| C1.1 | Speed-up = 1 / (s + (1 − s) / n); the limit as n grows is 1 / s |
| C1.2 | `next++` is read, add, write; `AtomicLong.getAndIncrement` or `synchronized` |
| C1.3 | A program whose shared variables are all volatile has no data races, so it is sequentially consistent |
| C1.4 | Two problems: atomicity (check-then-act) and publication (visibility of the loaded table) |
| C1.5 | `final` fields, defensive copies in and out, `List.copyOf`, no setters; consider a record |
| C1.6 | The JIT may hoist the read of a non-volatile field out of the loop; `interrupt()` also wakes blocking calls |

## Part 2 hints

| Exercise | Hint |
|---|---|
| C2.1 | `while (count == items.length) notFull.await();` and signal the other condition after each change |
| C2.2 | If the second `tryLock` fails, release the first and sleep a random short time before retrying |
| C2.3 | Number the forks and always pick up the lower-numbered one first |
| C2.4 | `count++` on an `Integer` creates (or fetches) a different object |
| C2.5 | `push`: read head, link new node to it, CAS head. `pop`: read head, CAS head to head.next |
| C2.6 | `map.computeIfAbsent(w, k -> new LongAdder()).increment()` |
| C2.7 | Read/write ratio, need for exact reads, need for blocking |

## Part 3 hints

| Exercise | Hint |
|---|---|
| C3.1 | cores × (1 + W / C); throughput × latency; connections / time each is held |
| C3.2 | Tasks 1–3 start core threads, 4–7 queue, 8–9 extra threads; the 10th finds everything full |
| C3.3 | `invokeAll` with a timeout cancels tasks that have not completed when it expires |
| C3.4 | `completeOnTimeout(null, ...)` and `exceptionally(e -> null)`, then filter out nulls |
| C3.5 | `CompletableFuture.anyOf`; cancel the other future's work through a flag or interrupt |
| C3.6 | The common pool has (cores − 1) threads and does not grow for blocking `sleep` or I/O |
| C3.7 | What happens to a periodic task when one run throws? |

## Part 4 hints

| Exercise | Hint |
|---|---|
| C4.1 | `Executors.newVirtualThreadPerTaskExecutor()` plus a `Semaphore(4)`; time ≈ ⌈48 / 4⌉ × 50 ms |
| C4.2 | A `CountDownLatch(1)` start gate and a `CountDownLatch(n)` done latch per round |
| C4.3 | Little's law: concurrency / latency; the database allows connections / hold time queries per second |
| C4.4 | Tasks that wait for other tasks in the same bounded pool |
| C4.5 | `queue.poll(50, MILLISECONDS)` returns `null` after 50 ms of quiet; a poison pill marks the end |
