## Part 3 solutions

### Z3.1 An online judge

**Requirements.** Problems with statements and hidden tests; submissions in several languages; untrusted code run in a sandbox with time and memory limits; verdicts (accepted, wrong answer, time limit, runtime error, compile error) within seconds; a live leaderboard; fairness (identical limits for everyone, no access to tests or other submissions).

```python run How many judge machines does a 50,000-person contest need?
participants, minutes = 50_000, 90
subs_each = 12
avg_rate = participants * subs_each / (minutes * 60)
peak_rate = avg_rate * 4                   # the last 15 minutes are much busier
tests, cpu_s_per_test = 25, 0.4            # most tests are small; limits are per test
cpu_needed = peak_rate * tests * cpu_s_per_test
cores_per_machine, utilisation = 16, 0.6
machines = cpu_needed / (cores_per_machine * utilisation)
print(f'submissions: {avg_rate:.0f}/s on average, {peak_rate:.0f}/s at the final rush')
print(f'judging CPU at peak: {cpu_needed:,.0f} core-seconds per second')
print(f'judge machines at 16 cores, 60% busy: about {machines:.0f}')
```

```text
 Browser ──> API (auth, rate limits, problem pages from cache/CDN)
               │ store source code in object storage, row in submissions table
               ▼
          Queue (per language, priority for contests) ──> Judge workers (autoscaled)
                                                           sandbox per run: container or
                                                           gVisor/nsjail, no network, CPU and
                                                           memory limits, read-only filesystem
               verdict events ◀────────────────────────────┘
               ▼
   Submissions DB (verdicts) ──> Leaderboard (Redis sorted set: score, then penalty)
                             ──> live updates to browsers (SSE / WebSocket)
```

The estimate is the headline: hundreds of 16-core machines for 90 minutes, idle the rest of the week. Judges therefore autoscale on queue depth (or run on spot capacity), and many platforms cap submissions per participant per minute so one person cannot flood the queue.

| Decision | Reason |
|---|---|
| Queue between intake and judging | The final-minute rush is absorbed; submissions are never lost; judges scale on queue depth |
| Strong sandboxing | Submitted code is hostile by assumption: no network, no host filesystem, limited syscalls, per-run limits |
| Judges measure CPU time, not wall time, on identical machine types | Fair verdicts regardless of load |
| Tests fetched by judges from private storage, never exposed to the API | Prevents leaks of hidden tests |
| Leaderboard in a sorted set keyed by (solved, penalty) | O(log n) updates and rank queries; freeze in the last hour if the contest rules say so |
| Plagiarism checks after the contest (token similarity across submissions) | Too expensive in the hot path; results reviewed by humans |

### Z3.2 Unique ID generation

A **Snowflake-style** ID packs a timestamp, a machine number and a per-millisecond sequence into 64 bits, so machines never coordinate and IDs sort roughly by time.

```python run A Snowflake generator: capacity, uniqueness and a clock that goes backwards
EPOCH_MS = 1_767_225_600_000              # custom epoch: 2026-01-01T00:00:00Z
MACHINE_BITS, SEQ_BITS = 10, 12

class Snowflake:
    def __init__(self, machine, clock):
        self.machine, self.clock, self.last_ms, self.seq = machine, clock, -1, 0
    def next_id(self):
        now = self.clock()
        if now < self.last_ms:
            raise RuntimeError(f'clock moved back {self.last_ms - now} ms; refusing')
        if now == self.last_ms:
            self.seq = (self.seq + 1) & ((1 << SEQ_BITS) - 1)
            if self.seq == 0:                  # 4096 used this millisecond: wait for the next
                while now <= self.last_ms:
                    now = self.clock()
        else:
            self.seq = 0
        self.last_ms = now
        return (((now - EPOCH_MS) << (MACHINE_BITS + SEQ_BITS))
                | (self.machine << SEQ_BITS) | self.seq)

years = (1 << 41) / 1000 / 86_400 / 365.25
print(f'41 timestamp bits last {years:.1f} years; {1 << MACHINE_BITS} machines; '
      f'{(1 << SEQ_BITS) * 1000:,} IDs/s per machine')

t = [EPOCH_MS + 5_000]                     # a fake clock that advances 1 ms every 3,000 calls
calls = [0]
def clock():
    calls[0] += 1
    if calls[0] % 3_000 == 0:
        t[0] += 1
    return t[0]
gens = [Snowflake(m, clock) for m in range(4)]
ids = [g.next_id() for _ in range(25_000) for g in gens]
print(f'{len(ids):,} IDs from 4 machines, all unique: {len(set(ids)) == len(ids)}')
per_machine_sorted = all(
    [i for i in ids if (i >> SEQ_BITS) & 1023 == m] ==
    sorted(i for i in ids if (i >> SEQ_BITS) & 1023 == m) for m in range(4))
print('each machine\'s IDs increase:', per_machine_sorted)
t[0] -= 10
try:
    gens[0].next_id()
except RuntimeError as e:
    print('after NTP stepped the clock back:', e)
```

| Concern | Answer |
|---|---|
| Machine numbers | Assigned at start-up from a coordination service (ZooKeeper, etcd) or the deployment's stable index; never two live generators with one number |
| Clock moving backwards | Refuse (as above) or wait until the clock catches up; run NTP in slewing mode so it rarely steps |
| More than 4,096 per millisecond | The generator waits for the next millisecond; that is 4 million IDs per second per machine |
| Alternatives | UUIDv4 (128 bits, random, poor index locality); UUIDv7 (time-ordered, 128 bits); database sequences (coordination per ID, or ranges handed out in blocks) |

### Z3.3 Hotel search and booking

**Model the inventory per night.** A booking for three nights needs a room of the type on each of the three nights. Store `inventory(hotel_id, room_type, night, total, booked)` in the relational source of truth.

| Path | Design |
|---|---|
| Search (1,000× more frequent) | A search index (Elasticsearch/OpenSearch) of hotels with location, amenities and prices, plus a cached availability summary per hotel and night updated from booking events; results may be seconds stale |
| Hotel page | Read availability for the chosen dates from a cache or replica, with a "rooms left" indicator |
| Booking | In one transaction: `UPDATE inventory SET booked = booked + 1 WHERE hotel_id = ? AND room_type = ? AND night >= ? AND night < ? AND booked < total`, then check that the number of updated rows equals the number of nights, else roll back ("sold out") |
| Payment | Hold the rooms (a reservation with a 10-minute expiry) before taking payment; confirm on payment success, release on failure or timeout |
| Idempotency | The client sends an idempotency key, so a retried "book" request cannot create two bookings |

The conditional update makes double booking impossible without locking whole hotels: the database checks `booked < total` atomically per row. Search can be stale because the booking path re-checks against the source of truth; the user sees "sold out" at worst, never an overbooked room. Overbooking on purpose (as airlines do) would be a business rule raising `total` above physical rooms, not an accident.

### Z3.4 File sync

**Core idea: split files into chunks identified by their hash.** The client uploads only chunks the server does not already have, so an edit re-uploads only the chunks it touched, uploads resume chunk by chunk, and identical chunks across users are stored once. Fixed-size chunks have a weakness, shown below: inserting one byte near the start shifts every boundary. **Content-defined chunking** places boundaries where a rolling hash of the content matches a pattern, so boundaries move with the content.

```python run Fixed-size versus content-defined chunks after two kinds of edit
import hashlib, random

rnd = random.Random(11)
data = bytes(rnd.getrandbits(8) for _ in range(256 * 1024))
GEAR = [rnd.getrandbits(32) for _ in range(256)]

def fixed_chunks(b, size=8192):
    return [b[i:i + size] for i in range(0, len(b), size)]

def cdc_chunks(b, mask=0xFFF8_0000, min_size=2048, max_size=32768):   # ~8 KB average
    chunks, start, h = [], 0, 0
    for i, byte in enumerate(b):
        h = ((h << 1) + GEAR[byte]) & 0xFFFF_FFFF                       # gear rolling hash
        size = i - start + 1
        if (size >= min_size and h & mask == 0) or size >= max_size:
            chunks.append(b[start:i + 1]); start, h = i + 1, 0
    if start < len(b):
        chunks.append(b[start:])
    return chunks

def new_chunks(old, new, chunker):
    have = {hashlib.sha256(c).digest() for c in chunker(old)}
    fresh = [c for c in chunker(new) if hashlib.sha256(c).digest() not in have]
    return len(fresh), sum(map(len, fresh)), len(chunker(new))

edits = {
    'overwrite 10 bytes mid-file': data[:131_072] + b'X' * 10 + data[131_082:],
    'insert 1 byte near the start': data[:100] + b'!' + data[100:],
}
for name, new in edits.items():
    for label, chunker in [('fixed 8 KB', fixed_chunks), ('content-defined', cdc_chunks)]:
        n, size, total = new_chunks(data, new, chunker)
        print(f'{name:<29} {label:<16} upload {n:>2} of {total} chunks '
              f'({size / 1024:.0f} KB)')
```

Overwriting bytes changes one chunk with either method. Inserting a single byte near the start makes every fixed-size chunk new (the whole 256 KB is uploaded again), while content-defined chunking re-uploads only the two chunks around the edit, because later boundaries are found again at the same content. Real systems use the same idea with larger chunks (around 4 MB for Dropbox-style sync).

```text
 Client (watcher, local chunk index) ──> Metadata service (files, versions, chunk lists per
        │                                  version, devices; relational DB sharded by user)
        └── upload missing chunks ──> Block storage (object store, key = chunk hash)
 Other devices ◀── notification service (long poll / WebSocket: "folder changed, v42")
                   then fetch the new chunk list and download missing chunks
```

| Concern | Design |
|---|---|
| Large files and flaky networks | Chunks upload independently and in parallel; a failed upload resumes with the missing chunks |
| Edits on two devices | Each commit names the version it was based on; if the server's version moved on, the second commit becomes a **conflicted copy** ("report (Asha's laptop).docx") rather than silently losing work |
| Deduplication and privacy | Dedup per user or per organisation; cross-user dedup can leak whether a file exists elsewhere |
| Bandwidth | Compression per chunk; LAN sync between a user's devices |

### Z3.5 Top pages in real time

Exact counts per article in memory are fine for thousands of articles, but the problem asks for bounded memory as the key space grows (URLs with parameters, many sites). A **count-min sketch** keeps `depth` rows of `width` counters; each view increments one counter per row (chosen by a different hash), and the estimate is the minimum across rows. It never underestimates, and overestimates by at most a small fraction of the total views with high probability. A small heap of current candidates gives the top 10.

```python run Count-min sketch with a heap versus exact counting
import heapq, random, zlib

rnd = random.Random(5)
articles = [f'article-{i}' for i in range(50_000)]
weights = [1 / (i + 1) ** 1.1 for i in range(len(articles))]           # popularity is skewed
views = rnd.choices(articles, weights, k=300_000)

width, depth = 4_096, 4
salts = [rnd.getrandbits(32) for _ in range(depth)]
table = [[0] * width for _ in range(depth)]
def cell(r, key):                                                    # a stable hash per row
    return zlib.crc32(f'{salts[r]}:{key}'.encode()) % width
def add(key):
    for r in range(depth):
        table[r][cell(r, key)] += 1
def estimate(key):
    return min(table[r][cell(r, key)] for r in range(depth))

exact, candidates = {}, {}
for v in views:
    add(v)
    exact[v] = exact.get(v, 0) + 1
    candidates[v] = estimate(v)
    if len(candidates) > 200:                                           # keep a bounded set
        for k, _ in heapq.nsmallest(50, candidates.items(), key=lambda kv: kv[1]):
            del candidates[k]

top_sketch = [k for k, _ in heapq.nlargest(10, candidates.items(), key=lambda kv: kv[1])]
top_exact = [k for k, _ in heapq.nlargest(10, exact.items(), key=lambda kv: kv[1])]
print('top 10 articles found:', len(set(top_sketch) & set(top_exact)), 'of 10;',
      'same order:', top_sketch == top_exact)
worst = max(estimate(k) - exact[k] for k in top_exact)
print(f'largest overestimate in the top 10: {worst} views '
      f'(#1 has {exact[top_exact[0]]:,})')
print(f'memory: {width * depth:,} counters for {len(exact):,} distinct articles seen')
```

The sketch found the same top 10, in the same order, with 16,384 counters for about 27,000 distinct articles; its worst overestimate among them was 11 views against counts in the thousands. Memory stays fixed however many articles appear, which exact counting cannot promise.

**Architecture.** View events go to Kafka partitioned by article; each counting node keeps a sketch and a candidate heap per 1-minute window and emits its top 50 every few seconds; an aggregator merges the windows of the last 5 minutes (sketches add element-wise) and publishes the top 10 to a cache read by the site. Sliding windows are built from 1-minute buckets, dropping the oldest each minute.

## Part 4 solutions

### Z4.1 Your introduction

A model for a final-year student (about 75 seconds aloud):

> "I'm a final-year computer science student at XYZ Institute, and I enjoy building back-end systems that handle real data. In my internship at a small energy start-up I built a REST service in Spring Boot that ingests readings from 3,000 smart meters; I cut its p95 latency from 800 to 120 milliseconds by adding batching and an index, and it's still in production. In my final-year project I'm building an anomaly detector for those readings in Python, which taught me to test with messy real data. I practise problem solving regularly, around 400 problems so far, and I've written a few technical posts on what I learned. I'm applying for this SDE role because your team builds the payment infrastructure that millions of people use daily, and reliability at that scale is exactly what I want to get better at."

| Check | The model does it |
|---|---|
| Under 90 seconds | Yes |
| Present → past → future | Who I am, two concrete things I did, why this role |
| Numbers | 3,000 meters, 800 → 120 ms, 400 problems |
| Tailored | Last sentence names the team's domain |
| Hooks for follow-ups | Latency work and the anomaly project invite questions you can answer well |

### Z4.2 Rescue a weak answer

The original has no specific problem, no personal action, a vague result and a generic lesson. Rewritten with STAR:

> *Situation:* in our final-year project, a timetable app for 4,000 students, the database queries for a student's weekly timetable took 6 seconds in testing with real data. *Task:* I owned the back end, and the demo to the department was in 10 days. *Action:* I profiled the slow endpoint and found an N+1 pattern: one query per class slot, about 40 per request. I rewrote it as one join, added a composite index on (student, week), and wrote a load test that ran 200 requests in parallel so we would notice regressions. I also showed my teammates how to read query plans, so the two other endpoints were fixed the same way. *Result:* the timetable loaded in 90 milliseconds, the demo went smoothly, and the department adopted the app for the next semester. *Lesson:* I now test with production-sized data early, and I check the query count of every new endpoint.

| Weak | Strong |
|---|---|
| "A lot of problems with the database" | A 6-second query caused by N+1 |
| "We all worked hard" | I profiled, rewrote, indexed, load-tested, taught |
| "Got a good grade" | 6 s → 90 ms; app adopted |
| "Taught us teamwork" | Specific habits that changed |

### Z4.3 The awkward questions

| Question | Model answer | Why it works |
|---|---|---|
| Biggest weakness | "I used to take on too much myself instead of asking for help early. In my internship I lost two days on a deployment issue that a teammate solved in twenty minutes. Since then I time-box being stuck to an hour before asking, and I write down what I tried so the question is quick to answer." | A real weakness relevant to work, with evidence and a concrete change |
| Why should we hire you? | "Three reasons: I've built and run a back-end service in production, so I understand reliability beyond coursework; I'm strong in the fundamentals you test, data structures, databases and systems; and I learn fast, as the switch from Python to Spring Boot in my internship showed. I'd bring that to your payments team from the first month." | Specific, evidenced, tied to the role; not arrogant |
| A gap year | "I took a year to prepare for a competitive exam. It didn't work out, but I came out of it with much stronger mathematics and a habit of disciplined study, and I used the last three months to build the projects on my résumé. I'm certain software engineering is what I want to do." | Honest, brief, no apology spiral, ends looking forward |

### Z4.4 Project deep dive

Interviewers pick a project and dig until they find the edge of your understanding. For a typical final-year project (a smart-meter analytics app with a Spring Boot API, MySQL and a React dashboard), prepare answers to:

| Likely question | What a strong answer covers |
|---|---|
| Draw the architecture | Components, data flow, where data is stored, how the front end talks to the API |
| Why Spring Boot / MySQL / React? | Real reasons (team knowledge, relational data with joins, ecosystem), plus what you would consider instead |
| What was the hardest bug? | A specific bug, how you found it (logs, debugger, reproduction), the fix, the test you added |
| How is it tested? | Unit tests for logic, integration tests against a real database, what is not tested and why |
| How would it handle 100× the users? | Bottlenecks first (database, synchronous calls), then caching, read replicas, queues; estimates if possible |
| How is it secured? | Password hashing, authentication tokens, authorisation checks on every endpoint, input validation |
| What happens if the database goes down? | Current behaviour honestly, then what you would add (retries, health checks, a replica) |
| What did you personally build? | Your exact components; credit teammates for theirs |
| What would you do differently? | One or two real design changes with reasons |
| What did you learn? | Concrete technical and teamwork lessons, not "teamwork is important" |

Practise by having a friend ask "why?" after each answer until you reach something you do not know; then either learn it or be ready to say "I haven't explored that yet; my guess would be ...", which interviewers respect far more than bluffing.
