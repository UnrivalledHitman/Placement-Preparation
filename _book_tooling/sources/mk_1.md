# Chapter 2: Loop A, Fresher Level
%Two coding problems, a bank-account design, a placement-portal design and an HR round, each with model answers and rubrics

Sit each round under its time limit before reading the model answer. Total: about 2 hours 40 minutes.

| Round | Time | Problem |
|---|---|---|
| A1 Coding | 45 min | Free meeting slots; top-k frequent words |
| A2 LLD-lite | 45 min | Bank accounts with transfers |
| A3 HLD-lite | 30 min | A college placement portal |
| A4 HR | 20 min | Fresher HR questions |

## 2.1 Round A1: coding (45 minutes, two problems)

**Problem 1 (20 minutes).** A calendar holds booked meetings as `[start, end)` intervals in minutes since midnight, in no particular order and possibly overlapping. Given the working day `[dayStart, dayEnd)` and a minimum length `d`, return the free slots of at least `d` minutes, in order.

**Problem 2 (25 minutes).** Given a list of words and `k`, return the `k` most frequent words, most frequent first; words with equal frequency are ordered alphabetically.

### What a strong candidate asks

| Problem | Clarifying questions |
|---|---|
| Free slots | Are intervals half-open? Can meetings extend outside the working day? Do touching meetings (10:00–11:00, 11:00–12:00) leave a gap? Is the input sorted? |
| Top-k words | Is `k` at most the number of distinct words? Case-sensitive? How large is the input (does O(n log n) suffice, or is O(n log k) expected)? |

### Model solution, problem 1

Sort by start time, then sweep with a **cursor** holding the end of all busy time seen so far. A booking that starts at least `d` minutes after the cursor leaves a free slot; then the cursor moves to the booking's end if that is later. Clipping each booking to the working day handles meetings that start early or run late. Time O(n log n) for the sort, space O(n).

```java run Free slots: sort, sweep with a cursor, test edge cases
import java.util.*;

public class Main {
    // booked: [start, end) minutes since midnight; returns free [start, end) slots >= minLen
    static List<int[]> freeSlots(int[][] booked, int dayStart, int dayEnd, int minLen) {
        int[][] b = booked.clone();
        Arrays.sort(b, Comparator.comparingInt(iv -> iv[0]));
        List<int[]> free = new ArrayList<>();
        int cursor = dayStart;                         // end of the busy time seen so far
        for (int[] iv : b) {
            int s = Math.max(iv[0], dayStart), e = Math.min(iv[1], dayEnd);
            if (s >= e) continue;                      // entirely outside the working day
            if (s - cursor >= minLen) free.add(new int[]{cursor, s});
            cursor = Math.max(cursor, e);
        }
        if (dayEnd - cursor >= minLen) free.add(new int[]{cursor, dayEnd});
        return free;
    }

    static String show(List<int[]> slots) {
        StringJoiner j = new StringJoiner(", ", "[", "]");
        for (int[] s : slots)
            j.add(String.format("%02d:%02d-%02d:%02d",
                                s[0] / 60, s[0] % 60, s[1] / 60, s[1] % 60));
        return j.toString();
    }

    static void check(String name, int[][] booked, int minLen, String expected) {
        String got = show(freeSlots(booked, 540, 1080, minLen));        // 09:00 to 18:00
        String verdict = got.equals(expected) ? "PASS" : "FAIL";
        System.out.printf("%-4s %-22s %s%n", verdict, name, got);
    }

    public static void main(String[] args) {
        check("example (unsorted)",
              new int[][]{{780, 840}, {600, 660}, {1020, 1080}, {630, 720}}, 30,
              "[09:00-10:00, 12:00-13:00, 14:00-17:00]");
        check("no meetings", new int[][]{}, 30, "[09:00-18:00]");
        check("fully booked", new int[][]{{500, 1100}}, 30, "[]");
        check("gap shorter than d", new int[][]{{540, 600}, {615, 1080}}, 30, "[]");
        check("gap exactly d", new int[][]{{540, 600}, {615, 1080}}, 15, "[10:00-10:15]");
        check("touching meetings", new int[][]{{540, 600}, {600, 660}}, 30, "[11:00-18:00]");
        check("nested meeting", new int[][]{{540, 720}, {600, 630}}, 30, "[12:00-18:00]");
        check("outside working day", new int[][]{{480, 570}, {1050, 1200}}, 30,
              "[09:30-17:30]");
    }
}
```

The "nested meeting" case is the classic bug: code that sets `cursor = e` instead of `Math.max(cursor, e)` moves the cursor **back** to 10:30 and reports a false free slot from 10:30 to 12:00. Saying this aloud while testing is exactly the signal interviewers look for.

### Model solution, problem 2

Count with a hash map, then keep a **min-heap of size k** ordered so that the word to evict is at the top: lowest count first, and among equal counts the alphabetically **later** word first. Time O(n + m log k) for n words and m distinct words, space O(m). Sorting all distinct words (O(m log m)) is an acceptable first answer; the heap is the improvement to offer.

```java run Top-k frequent words with a bounded heap, cross-checked against sorting
import java.util.*;
import java.util.stream.*;

public class Main {
    static List<String> topK(String[] words, int k) {
        Map<String, Integer> count = new HashMap<>();
        for (String w : words) count.merge(w, 1, Integer::sum);
        // top of the heap = next to evict: fewest occurrences, then alphabetically last
        PriorityQueue<String> heap = new PriorityQueue<>((a, b) -> {
            int c = Integer.compare(count.get(a), count.get(b));
            return c != 0 ? c : b.compareTo(a);
        });
        for (String w : count.keySet()) {
            heap.offer(w);
            if (heap.size() > k) heap.poll();
        }
        List<String> out = new ArrayList<>();
        while (!heap.isEmpty()) out.add(heap.poll());
        Collections.reverse(out);
        return out;
    }

    static List<String> bySorting(String[] words, int k) {    // the simple reference
        Map<String, Long> c = Arrays.stream(words)
            .collect(Collectors.groupingBy(w -> w, Collectors.counting()));
        return c.keySet().stream()
            .sorted(Comparator.comparing((String w) -> -c.get(w)).thenComparing(w -> w))
            .limit(k).toList();
    }

    public static void main(String[] args) {
        String[] logs = {"meter", "bill", "meter", "pay", "bill", "meter", "alert"};
        System.out.println("example:      " + topK(logs, 2));
        String[] tied = {"b", "a", "c", "a", "b", "c"};
        System.out.println("ties:         " + topK(tied, 2));
        System.out.println("k = distinct: " + topK(logs, 4));

        Random rnd = new Random(42);
        int agree = 0;
        for (int t = 0; t < 500; t++) {
            String[] w = new String[1 + rnd.nextInt(30)];
            for (int i = 0; i < w.length; i++)
                w[i] = String.valueOf((char) ('a' + rnd.nextInt(6)));
            int k = 1 + rnd.nextInt(6);
            if (topK(w, k).equals(bySorting(w, k))) agree++;
        }
        System.out.println("random cross-check against sorting: " + agree + "/500 agree");
    }
}
```

The random cross-check is how you test a clever solution against a simple, obviously correct one. Mentioning it ("in a real codebase I'd property-test the heap version against the sort") earns credit even if there is no time to write it.

### Rubric for round A1

| Signal | Hire | No hire |
|---|---|---|
| Clarifying | Asked about unsorted, overlapping and out-of-day intervals; asked about tie order | Assumed sorted input or ignored ties |
| Approach | Sort-and-sweep stated with O(n log n); heap of size k explained | Brute force over every minute of the day without discussing cost |
| Code | Both compile; the cursor uses `max`; comparator direction explained | Off-by-one at boundaries; heap evicts the wrong word |
| Testing | Nested and touching meetings, empty input; ties | Only the given example |
| Time | Problem 1 under 20 minutes | Problem 2 not started |

## 2.2 Round A2: LLD-lite (45 minutes)

**Problem.** Design the classes for a small bank: savings accounts (minimum balance ₹1,000), current accounts (overdraft up to a limit), deposits, withdrawals, transfers between accounts and a statement per account. Transfers must be all-or-nothing and safe when many happen at once.

### Model answer: requirements and model (first 10 minutes)

| In scope | Out of scope (say so) |
|---|---|
| Open accounts, deposit, withdraw, transfer, statement | Interest calculation schedules, loans, authentication, persistence |
| Rules per account type | Currency conversion |
| Concurrent transfers | Distributed transactions across banks |

```text
          Bank ── holds ──> Account (abstract)  id, balance, statement, lock
                              lowestAllowedBalance()  ← each type defines its rule
                              deposit(), withdraw()
                    ┌─────────────┴──────────────┐
            SavingsAccount                CurrentAccount
            lowest = Rs 1,000             lowest = −overdraft limit
```

Design choices worth saying aloud:

| Choice | Reason |
|---|---|
| Money as `long` paise, never `double` | No rounding errors |
| One rule method `lowestAllowedBalance()` overridden per type | Open–closed: a new account type adds a class, `withdraw` does not change |
| Transfer = withdraw, then deposit, under both accounts' locks | All-or-nothing: if the withdrawal is refused, nothing has changed |
| Locks taken in a **fixed order** (by account ID) | Two opposite transfers cannot deadlock |

### Model code

```java run Account rules, an atomic transfer, and opposite transfers that cannot deadlock
import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

public class Main {
    static String rs(long paise) { return String.format("Rs %,.2f", paise / 100.0); }

    static class InsufficientFunds extends RuntimeException {
        InsufficientFunds(String msg) { super(msg); }
    }

    static abstract class Account {
        final String id;
        final ReentrantLock lock = new ReentrantLock();
        final List<String> statement = new ArrayList<>();
        private long balance;

        Account(String id, long opening) { this.id = id; this.balance = opening; }
        abstract long lowestAllowedBalance();

        long balance() { lock.lock(); try { return balance; } finally { lock.unlock(); } }

        void deposit(long amount, String note) {
            if (amount <= 0) throw new IllegalArgumentException("amount must be positive");
            lock.lock();
            try { balance += amount; statement.add("+" + rs(amount) + " " + note); }
            finally { lock.unlock(); }
        }

        void withdraw(long amount, String note) {
            if (amount <= 0) throw new IllegalArgumentException("amount must be positive");
            lock.lock();
            try {
                if (balance - amount < lowestAllowedBalance())
                    throw new InsufficientFunds(id + ": balance may not fall below "
                                                + rs(lowestAllowedBalance()));
                balance -= amount;
                statement.add("-" + rs(amount) + " " + note);
            } finally { lock.unlock(); }
        }
    }

    static class SavingsAccount extends Account {
        SavingsAccount(String id, long opening) { super(id, opening); }
        long lowestAllowedBalance() { return 100_000; }               // Rs 1,000
    }

    static class CurrentAccount extends Account {
        private final long overdraft;
        CurrentAccount(String id, long opening, long overdraft) {
            super(id, opening); this.overdraft = overdraft;
        }
        long lowestAllowedBalance() { return -overdraft; }
    }

    static class Bank {
        private final Map<String, Account> accounts = new HashMap<>();
        Account open(Account a) { accounts.put(a.id, a); return a; }

        void transfer(String fromId, String toId, long amount) {
            Account from = accounts.get(fromId), to = accounts.get(toId);
            Account first = fromId.compareTo(toId) < 0 ? from : to;       // fixed lock order
            Account second = first == from ? to : from;
            first.lock.lock();
            try {
                second.lock.lock();
                try {
                    from.withdraw(amount, "to " + toId);   // throws before anything changes
                    to.deposit(amount, "from " + fromId);
                } finally { second.lock.unlock(); }
            } finally { first.lock.unlock(); }
        }
    }

    public static void main(String[] args) throws Exception {
        Bank bank = new Bank();
        Account s1 = bank.open(new SavingsAccount("S1", 500_000));
        Account c1 = bank.open(new CurrentAccount("C1", 0, 200_000));

        try { s1.withdraw(450_000, "cash"); }
        catch (InsufficientFunds e) { System.out.println("refused: " + e.getMessage()); }
        c1.withdraw(150_000, "supplier");
        System.out.println("C1 after overdraft use: " + rs(c1.balance()));

        try { bank.transfer("S1", "C1", 450_000); }
        catch (InsufficientFunds e) {
            System.out.println("transfer refused: " + e.getMessage());
        }
        System.out.println("unchanged after refusal: S1 " + rs(s1.balance())
                           + ", C1 " + rs(c1.balance()));
        bank.transfer("S1", "C1", 300_000);
        System.out.println("S1 statement: " + s1.statement);

        // two threads move Rs 1 in opposite directions 20,000 times each
        Account a = bank.open(new CurrentAccount("A", 10_000_000, 0));
        Account b = bank.open(new CurrentAccount("B", 10_000_000, 0));
        Thread t1 = new Thread(() -> {
            for (int i = 0; i < 20_000; i++) bank.transfer("A", "B", 100);
        });
        Thread t2 = new Thread(() -> {
            for (int i = 0; i < 20_000; i++) bank.transfer("B", "A", 100);
        });
        t1.start(); t2.start();
        t1.join(30_000); t2.join(30_000);
        boolean finished = !t1.isAlive() && !t2.isAlive();
        System.out.println("both threads finished (no deadlock): " + finished);
        System.out.println("money conserved: " + (a.balance() + b.balance() == 20_000_000));
    }
}
```

If the lock order were "from, then to", the two threads would sooner or later each hold one lock and wait forever for the other. Ordering by ID is the standard fix (Java Concurrency guide, Chapter 3); a single bank-wide lock also works but serialises every transfer.

> TIP: Interviewers often add a requirement halfway: "now add a fixed-deposit account that cannot be withdrawn before maturity". With the rule in one overridable method, the answer is a new subclass, which is the extensibility they are testing.

### Rubric for round A2

| Signal | Hire | No hire |
|---|---|---|
| Requirements | Listed account rules and what is out of scope | Started coding classes immediately |
| Model | Abstract account with a per-type rule; bank coordinates transfers | One class with `if (type == SAVINGS)` everywhere |
| Correctness | Integer money; refusal leaves both balances unchanged | `double` money; deposit before checking the withdrawal |
| Concurrency | Explained deadlock and lock ordering (or a single lock, with its cost) | Did not consider concurrent transfers |
| Extension | Fixed deposit added as a subclass | Required editing `withdraw` |

## 2.3 Round A3: HLD-lite (30 minutes)

**Problem.** Design a placement portal for a university group: 50,000 students across colleges, about 300 companies per season. Companies post drives with eligibility rules; students upload résumés and apply before deadlines; results are published; students are notified.

### Model answer

**Requirements (5 minutes).** Functional: student profiles and résumés, drives with eligibility (branch, CGPA, backlogs), applications with deadlines, shortlists and results, notifications, admin exports. Non-functional: correct eligibility and deadlines (fairness matters more than speed), availability during peak moments, résumés private to the student, placement cell and the company concerned.

**Estimates (5 minutes).**

```python run Back-of-the-envelope numbers for the placement portal
students = 50_000
drives = 300
applicants_per_drive = 2_000
# results announced: 80% of students check within 10 minutes, 6 requests per visit
peak_share, peak_minutes, requests_per_visit = 0.8, 10, 6

peak_rps = students * peak_share * requests_per_visit / (peak_minutes * 60)
print(f'peak load when results are announced: about {peak_rps:.0f} requests/s')
apps = drives * applicants_per_drive
print(f'applications per season: {apps:,} rows, '
      f'about {apps * 300 / 1e6:.0f} MB at 300 bytes each')
resume_gb = students * 2 * 400e3 / 1e9                 # two versions of 400 KB each
print(f'résumé storage: about {resume_gb:.0f} GB')
emails = 20_000
print(f'drive announcement to {emails:,} eligible students within 15 minutes: '
      f'{emails / (15 * 60):.0f} emails/s')
```

The numbers say this is a **small system** with spiky reads: one relational database easily holds the data; the design effort goes into correctness and the peaks, not sharding.

**Architecture (12 minutes).**

```text
 Students / companies / placement cell
          │ HTTPS
   Load balancer ──> stateless app servers (REST API, 2+ instances)
                         │            │              │
                    MySQL primary   Redis cache   Object storage (résumés)
                    (+ replica)     (drive lists,  presigned upload/download URLs
                                     results)
                         │
                    Queue ──> notification workers ──> email / SMS / push providers
```

| Decision | Reason |
|---|---|
| MySQL with `UNIQUE(student_id, drive_id)` on applications | Duplicate applications are impossible even if a student double-clicks |
| Eligibility and deadline checked **on the server** in the same transaction as the insert | The client clock and UI cannot be trusted; fairness is a requirement |
| Résumés in object storage via short-lived presigned URLs | Keeps large files out of the database and app servers; access stays controlled |
| Results page cached (and served from a CDN or cache with a short TTL) | The 400-requests-per-second spike becomes cache hits |
| Notifications through a queue with retries | A slow email provider never blocks applying; bursts are smoothed |
| Audit log of shortlists and results | Disputes about who was shortlisted can be answered |

**Deep dive (8 minutes)**, likely questions: *What if 20,000 students apply in the last minute?* About 333 inserts per second, trivial for MySQL with the unique index; the deadline check uses the server's clock. *How do companies see only their applicants?* Authorisation on every query (`WHERE drive.company_id = :me`), not just hidden links (Security Engineering guide, Chapter 7). *How do you export shortlists?* Asynchronous job writing a CSV to object storage, link emailed.

### Rubric for round A3

| Signal | Hire | No hire |
|---|---|---|
| Requirements | Named fairness (deadlines, eligibility) and privacy of résumés | Only listed pages of the website |
| Estimates | Peak load computed; concluded a single database suffices | Jumped to sharding and microservices for 50,000 users |
| Design | Unique constraint, server-side checks, object storage, queue for notifications | Résumés as database blobs; deadlines enforced in JavaScript |
| Trade-offs | Simple architecture justified by the numbers | Complexity without reasons |

## 2.4 Round A4: HR (20 minutes)

| Question | What the interviewer checks | Core of a strong answer |
|---|---|---|
| Tell me about yourself | Communication, relevance | 60–90 seconds: degree and strengths, one project with a result, why this role (Interview, HR and Resume guide, Chapter 2) |
| Why this company? | Genuine interest, research | Two specific reasons tied to the company's products or practices, and what you would contribute |
| Describe a project you are proud of | Ownership, depth | Your part, one hard problem and how you solved it, a measurable result, what you learned |
| Tell me about a time you failed | Self-awareness, learning | A real failure, your share of it, what you changed afterwards (with evidence) |
| Are you comfortable relocating or working shifts? | Logistics | Honest answer; if constrained, say so and why |
| Where do you see yourself in five years? | Ambition, stability | Growing depth in an area that the company works in, taking on more responsibility; no "your job" or "my own start-up next year" |
| Do you have questions for us? | Interest | Ask about the team's work, how new engineers are onboarded, what success looks like in the first six months |

**A model "failure" answer, in STAR form.** *Situation:* in my final-year project, our smart-meter dashboard crashed during the mid-term demo. *Task:* I owned the data pipeline feeding it. *Action:* I found that I had tested only with a small sample; the real data had missing readings that my code divided by. I added validation for missing values, wrote tests with real exported data, and set up a nightly check that ran the pipeline on the full data set. *Result:* the final demo ran on a year of data without issues, and the habit of testing with production-like data has stayed with me. It works because the failure is real, the candidate's own, and the change is concrete.

### Rubric for round A4

| Signal | Hire | No hire |
|---|---|---|
| Introduction | Under 90 seconds, structured, relevant | Recites the résumé line by line |
| Stories | Specific situations with "I" and results | General claims, "we" throughout |
| Motivation | Specific to the company | Could be said to any company |
| Honesty | Admits weaknesses with what is being done about them | Fake weaknesses ("I work too hard") |

## 2.5 Practical lessons

- Coding: clarify edge cases, state the brute force, test the cases that break naive code (nested intervals, ties).
- LLD: requirements and scope first; one overridable rule per type; integer money; lock ordering for transfers.
- HLD: let the estimates size the design; correctness (deadlines, duplicates) and peaks matter more than scale here.
- HR: structured, specific, honest; prepare the introduction and three stories in advance.
