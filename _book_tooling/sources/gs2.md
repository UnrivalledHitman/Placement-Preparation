## Part 3 solutions

### G3.1 100% coverage mandate

The mandate is the wrong target. Coverage measures which lines **ran** during tests, not whether they are **meaningfully tested**: you can hit 100% with tests that assert nothing or assert trivial getters, while the real bug lived in an untested interaction or edge case. Chasing the number produces tests coupled to implementation that break on every refactor and discourage improvement, and it wastes effort on low-risk code while giving false confidence. It also will not have prevented the bug that triggered it unless that bug happened to be in an uncovered line.

Propose instead: test for **confidence to change**, aimed at **risk**. Require tests for the behaviour of anything important (payments, auth, data integrity, the thing that just broke), covering edge and error paths; write a regression test for every bug (which **would** have caught this one); measure coverage as a **signal to find untested risk**, not a target (and perhaps gate on coverage of **changed** lines, not the whole codebase). Follow the testing pyramid. The goal is fewer bugs and fearless refactoring, not a green percentage.

### G3.2 The flaky test

Retrying to green is hiding a real problem and corroding the whole suite. The real costs: (1) the flakiness may be a **genuine bug**, a race condition the test is correctly catching intermittently, which will also happen in production; retrying masks it. (2) Even if the test itself is at fault (timing, shared state, order dependence), auto-retry trains everyone to **ignore red builds**, and a suite people do not trust is worthless; eventually a real failure is retried-away or ignored. (3) It slows CI (three runs) and hides a growing pile of flakiness.

What to do: treat flakiness as a priority bug. Investigate the cause: if it is a real race, fix the code (and keep the test); if it is test-induced (a `sleep`, a shared fixture, dependence on order or wall-clock time), fix the test to be deterministic. If it cannot be fixed immediately, **quarantine it explicitly** (move it out of the gating suite, with a ticket) rather than silently retrying, so the suite stays trustworthy and the debt is visible. Never normalise retry-until-green.

### G3.3 Pick an availability target

```python run Downtime allowed by 99.99% vs a right-sized target
year_min = 365 * 24 * 60
for pct in (99.99, 99.9, 99.0):
    down = year_min * (1 - pct / 100)
    print(f'{pct:6.2f}% -> {down:7.1f} min/year '
          f'({down / 60:.1f} h)')
work_hours_year = 5 * 8 * 52 * 60                 # working hours only
print(f'\nbut staff use it only ~{work_hours_year // 60} hours/year, '
      'not 8,760; downtime outside work hours costs nothing')
print('99.9% (8.8 h/yr, mostly outside work) is plenty; 99.99% buys '
      'almost nothing here at much higher cost')
```

99.99% allows only about 53 minutes of downtime a year and is very expensive to engineer and operate (redundancy, failover, careful deploys, tight on-call). For an **internal analytics dashboard used by staff during working hours**, that is massive over-engineering: the dashboard being down at 2 a.m. or on a weekend costs nothing, and even a short outage during work hours is an inconvenience, not a revenue or safety event. A better target is around **99.9%** (or even 99.5%), set against **working hours**, with a simpler, cheaper design. The principle (Chapter 6): set the SLO from what users actually need, not from the most impressive number; every extra nine multiplies cost. Reserve the four-and-five-nines effort for the payment path and other things that genuinely hurt when down.

### G3.4 Error budget policy

- **SLI**: the fraction of successful API responses (HTTP < 500, excluding client errors) served within the latency threshold (say 300 ms), measured at the load balancer.
- **SLO**: 99.95% over a rolling 28-day window. **Error budget**: 0.05% of requests (about 1 in 2,000).
- **As the budget is consumed**: dashboards show budget remaining and burn rate. Normal consumption within budget needs no action. **Fast burn** (e.g. >10× the sustainable rate over an hour, or >2× over six hours) pages on-call: this is a live incident eating the month's budget quickly. **Slow burn** that will exhaust the budget before the window ends raises a ticket, not a page.
- **When the budget is exhausted**: a **feature freeze** on that service, risky changes stop, and the team's priority shifts to reliability work until the budget recovers. This is agreed with product in advance, which is the whole point: it makes the ship-vs-stabilise trade-off a pre-committed policy, not an argument during a crisis.
- **Alerting**: on **burn rate** and on the SLO itself, not on every error or on causes like CPU; combine a fast-burn page and a slow-burn ticket (multi-window, multi-burn-rate alerts) to catch both sudden outages and gradual degradation without noise.

### G3.5 The 3 a.m. page

First ten minutes, in order:

1. **Acknowledge** the page and confirm the symptom is real (check the dashboard: error rate, which endpoints, how many users). Confirm scope: all requests or some, one region or all.
2. **Look at what changed.** A deploy two hours ago is the prime suspect; most incidents follow a change. Check the deploy and recent config changes.
3. **Mitigate, do not diagnose.** If the deploy is the likely cause, **roll it back** (or disable the feature flag) immediately. The first job is to **stop the bleeding** and get users working again; understanding *why* can wait until they are safe. A fast rollback is why that path is worth building.
4. **Confirm recovery** after the rollback: is the error rate dropping? If yes, users are safe; now investigate at leisure.
5. If rollback does not fix it (so the deploy was not the cause), widen the search: a dependency down, a database issue, a traffic spike; check its health, consider failover or scaling, and pull in help; declare an incident with a commander if it is serious, and keep stakeholders informed.

Finding the root cause is **not** first because every minute of 500s is users failing to check out; mitigation restores service in minutes, while root-causing a subtle bug can take hours. Diagnose after, in the blameless postmortem.

### G3.6 The blameless postmortem

Redirect from "who" to "why the system allowed it." The engineer following a normal process deleted a column that was still in use and caused an outage; the useful questions are systemic: Why did nothing warn that the column was still referenced? Why was the migration not run expand/contract (deprecate, stop using, then drop)? Why did it reach production without a check? Why was there no fast rollback? Each "why" points to a **guardrail** that would prevent the whole class of incident: a migration linter or schema-diff check in CI that flags drops of referenced columns; a required expand/contract pattern for destructive changes; a staging rehearsal; a faster rollback path; monitoring that catches it in seconds.

To the VP: acknowledge the impact and that it must not recur, then make the case that **blame drives mistakes underground** (people hide problems, incidents get worse, learning stops), whereas fixing the **system** prevents not just this mistake but everyone's version of it. A stricter human approval process is weak (approvers miss things too, it slows everyone, and it still relies on vigilance); automated guardrails are strong (they protect everyone forever and need no memory). Frame it as "a good engineer hit a gap in our safety net; let's fix the net." That is both kinder and far more effective, and it keeps the team willing to report problems, which is what actually makes systems reliable.

## Part 4 solutions

### G4.1 Where to optimise

```python run Amdahl's law applied to the three parts
def overall(fraction, factor):
    return 1 / ((1 - fraction) + fraction / factor)
parts = {'database query (60%)': 0.60, 'serialisation (30%)': 0.30,
         'business logic (10%)': 0.10}
for name, frac in parts.items():
    print(f'5x on {name:24}: overall {overall(frac, 5):.2f}x  '
          f'(ceiling if instant: {1 / (1 - frac):.2f}x)')
```

Optimise the **database query**: it is 60% of the time, so 5× on it gives the largest overall speedup (about 1.9×), and even making it instant has the highest ceiling (2.5×). The same 5× effort on the 10% business logic yields a negligible 1.05× overall, and even making it instant caps at 1.11×. Amdahl's law: attack the dominant cost, and know that the fraction you do **not** speed up sets a hard ceiling on the whole program. Always measure to find the real 60% before optimising; here it is given.

### G4.2 The chatty page

This is the **N+1 problem across the network** (the back-end and GraphQL sections): the page fetches a list, then makes one remote call per item, 60 sequential round trips of 60 ms ≈ 3.6 s, dominated entirely by the number of round trips, not by any slow code. Fixes, in order of preference:

1. **Batch**: fetch all 60 users in **one** call (`GET /users?ids=...` or a DataLoader that coalesces the per-item requests). One round trip instead of 60; ~60 ms instead of 3.6 s. This is the best fix: it removes the round trips.
2. **Parallelise**: if batching is impossible, fire the 60 calls concurrently (`Promise.all`) so the total is the slowest one (~60 ms) plus overhead, not the sum. Better, but still 60 calls hammering the user service.
3. **Cache**: if the same users are fetched repeatedly, cache them (per request, or in Redis) so most calls never leave the process. Helps on repeat, not the first load.

Batching wins because the root cause is the number of round trips, and batching eliminates them; parallelising only overlaps them; caching only avoids repeats. The deeper lesson: a design that makes many sequential remote calls is doomed regardless of per-call speed (the latency-numbers chapter).

### G4.3 The surprise cloud bill

Investigate systematically; a 40% jump with flat traffic means waste, not growth. Steps: break the bill down **by service and by resource tag** (compute, storage, egress, database, per team/feature) to find which line item grew; compare against the previous month. Usual suspects: **egress** (a new feature serving large assets without a CDN, or cross-region/cross-AZ traffic, or a misconfigured client re-downloading); **orphaned resources** (a load test or a deleted service that left VMs, disks, snapshots or IPs running); a **runaway or stuck job** (a retry loop, an infinite backfill, a cron that overlaps itself); **logging/metrics volume** (a debug log left on at scale, exploding ingestion costs); **storage growth** (unrotated logs, un-lifecycled backups, data never deleted); a **new feature** quietly 10× more expensive than expected. Set up cost alerts and per-team tagging so the next jump is caught in days, and treat a cost regression like a latency regression: investigate, do not just pay it.

### G4.4 "We don't have time to fix tech debt"

Make the invisible cost visible and tie repayment to delivery. The argument: velocity has **halved**, which means the debt is already costing the team more than refactoring would; "no time to fix it" is spending that time anyway, as drag, with nothing to show. Quantify it: "every change to this module now takes ~3× as long and carries real risk of breaking things; over the next quarter that tangle will cost us more person-weeks than fixing it would." Model the compounding (Chapter 8): ignoring it ships less over any horizon beyond a few weeks, because the drag keeps growing.

Then propose something **concrete and low-risk**, not a scary rewrite: identify the worst, hottest part of the module (the code you change most and fear most) and refactor **just that**, ideally bundled with the next feature that touches it ("to add X cleanly, we first carve out this piece"), behind tests added first so the refactor is safe. Allocate a steady fraction of capacity (say 20%) to paydown going forward so it does not recur. This reframes refactoring from an optional "cleanup" competing with features into the thing that **makes future features possible**, which is a far easier case and the truth.

### G4.5 Migrate a live database

Use **expand/contract with dual-write**, so every step is backward-compatible and reversible, with no downtime:

1. **Expand**: add the new column (new PK type) alongside the old, nullable; deploy. No behaviour change; reversible by dropping it.
2. **Dual-write**: change the application to write **both** columns on every insert/update, keeping them consistent going forward; deploy. Reads still use the old column.
3. **Backfill**: in batches (to avoid locking and load), populate the new column for all historical rows; monitor progress and database health; throttle. Idempotent and resumable.
4. **Verify**: run checks that the two columns agree for all rows (counts, sampled comparisons, a consistency query); do not proceed until they match. This is the gate.
5. **Switch reads**: change the application (behind a feature flag, ramped gradually) to read from the new column; watch metrics and error rates; the flag makes rollback instant if anything is wrong.
6. **Stop writing the old**: once reads are fully on the new column and stable for a while, stop writing the old column.
7. **Contract**: after a safe soak period (and a backup), **drop** the old column. This is the only irreversible step, done last, long after everything depends only on the new one.

Each step is independently deployable, verifiable in production, and reversible (until the final drop); a problem at any point is caught by monitoring and undone by a flag or a revert, never discovered at a big cut-over. This is how large tables are migrated under live traffic.
