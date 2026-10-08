# Chapter 7: Performance, Scale and Cost Awareness
%Measuring before optimising, knowing the latency numbers, and treating cost as a design input

## 7.1 Measure, never guess

The first rule of performance is that **intuition about performance is usually wrong**, so measure before you optimise. Profile to find where the time or memory actually goes; optimise the real bottleneck, not the one you imagine. Most programs spend most of their time in a small fraction of the code, so effort spent anywhere else is wasted. Optimising without measuring adds complexity (which costs changeability forever) for a benefit that is often zero or negative.

```python run Amdahl's law: optimising a part that is not the bottleneck barely helps
def speedup(fraction_optimised, factor):
    # fraction of total time spent in the part, sped up by `factor`
    return 1 / ((1 - fraction_optimised) + fraction_optimised / factor)
print('make a part 10x faster:')
for frac in (0.1, 0.5, 0.9, 0.99):
    print(f'  it was {frac:4.0%} of total time -> overall speedup {speedup(frac, 10):.2f}x')
print('make the 90% part faster by different factors:')
for factor in (2, 10, 100, 1e9):
    print(f'  {factor:>10.0f}x on that part -> overall {speedup(0.9, factor):.2f}x '
          f'(ceiling is {1 / (1 - 0.9):.0f}x)')
```

Two lessons from Amdahl's law. Making a part that is 10% of runtime ten times faster yields only a 1.1× overall speedup; making the part that is 90% of runtime faster is where the wins are. And there is a **ceiling**: even an infinitely fast optimisation of the 90% part caps the whole program at 10× faster, because the other 10% remains. Find the dominant cost first, and know when further optimisation cannot help.

## 7.2 Know the latency numbers

Good performance intuition rests on knowing the **orders of magnitude** of common operations. The exact figures move with hardware, but the ratios are stable and are what let a senior engineer estimate a design's performance on a whiteboard.

```python run Latency numbers every engineer should know (approximate orders of magnitude)
import math
ns = [
    ('L1 cache reference', 1), ('branch mispredict', 3), ('L2 cache reference', 4),
    ('mutex lock/unlock', 17), ('main memory reference', 100),
    ('compress 1 KB (Snappy)', 2_000), ('read 1 MB from memory', 3_000),
    ('SSD random read', 16_000), ('read 1 MB from SSD', 49_000),
    ('round trip within a datacenter', 500_000), ('read 1 MB from disk (HDD)', 825_000),
    ('disk seek (HDD)', 2_000_000), ('round trip India<->Europe (network)', 150_000_000),
]
print(f'{"operation":38} {"time":>14}   relative to L1')
for name, t in ns:
    human = (f'{t} ns' if t < 1000 else f'{t / 1000:.0f} us' if t < 1e6
             else f'{t / 1e6:.0f} ms')
    print(f'{name:38} {human:>14}   {t:>13,}x')
dc, cross = 500_000, 150_000_000
print(f'\na cross-continent round trip is ~{cross // dc:,}x a datacenter round trip')
print('lesson: a chatty API making many sequential remote calls is doomed; batch, '
      'parallelise, cache, or move the computation to the data')
```

What this teaches: memory is roughly a thousand times faster than a network round trip within a datacentre, which is itself hundreds of times faster than a cross-continent trip. A design that makes many **sequential** remote calls will be slow no matter how fast each service is; the fix is to **batch**, **parallelise** independent calls (the front-end guide's `Promise.all`, the back-end guide's pipelines), **cache**, or **move the computation to where the data lives**. Reducing the number of round trips almost always beats micro-optimising the code between them.

## 7.3 Tail latency is what users feel

Averages lie. If the average response is 50 ms but the 99th percentile is 2 seconds, one request in a hundred is painfully slow, and a page that makes a hundred backend calls will **almost always** hit at least one slow one. At scale, the tail (p99, p99.9) is the common experience, not a rare edge. Measure and set objectives on percentiles; attack tail latency with timeouts, hedged requests, and by removing the causes of the long tail (garbage-collection pauses, cold caches, lock contention, a slow dependency).

```python run Why the tail dominates when a request fans out
import random
random.seed(0)
# one backend call: 50 ms typical, but 1% of the time 2000 ms (a slow tail)
def one_call():
    return 2000 if random.random() < 0.01 else random.gauss(50, 10)
for fanout in (1, 10, 100):
    slow = 0
    for _ in range(5000):
        page = max(one_call() for _ in range(fanout))     # page waits for the slowest call
        slow += page > 500
    pct = slow / 5000
    print(f'page makes {fanout:3d} backend call(s): {pct:5.1%} of pages exceed 500 ms')
```

A single call is slow 1% of the time, but a page that fans out to 100 calls and waits for all of them is slow on the majority of loads, because it only takes one of the hundred to land in the tail. This is why large services obsess over the 99th and 99.9th percentiles, not the average.

## 7.4 Scaling: up, out, and the real limits

- **Vertical scaling** (a bigger machine) is simple and often the right first answer; it has a ceiling and a single point of failure.
- **Horizontal scaling** (more machines) is near-unlimited but requires statelessness, load balancing, and handling distributed-systems problems (consistency, partitioning, coordination).
- The usual path to scale, in order: **do less work** (caching, better algorithms, fewer round trips) → **vertical** → **horizontal** → **specialised stores** (the back-end guide's NoSQL, search, time-series). Caching and algorithmic improvement are frequently cheaper and faster than adding machines.
- **State is what makes scaling hard.** Push state to specialised, scalable stores and keep the application tier stateless, so you can add and remove instances freely.
- Beware that scaling one component moves the bottleneck elsewhere (more app servers hammer the one database harder); design the whole path.

## 7.5 Cost is a design constraint

At scale, infrastructure cost is a first-class engineering concern, and an inefficient design is not just slow but **expensive**, sometimes ruinously. A senior engineer develops a rough sense of what things cost (compute per hour, storage per GB-month, network **egress**, managed-service pricing) and weighs it in design, because the cheapest request is often the one you never make (caching, batching, right-sizing).

```python run A back-of-the-envelope monthly cloud bill, and where the money goes
# rough public-cloud unit prices (USD); your real numbers will differ
C = {'vm_hour': 0.10, 'gb_month_ssd': 0.10, 'gb_egress': 0.09, 'million_requests': 0.20,
     'gb_month_backup': 0.023}
usage = {
    'app servers (10 VMs, always on)': 10 * 24 * 30 * C['vm_hour'],
    'database (2 large VMs)':           2 * 24 * 30 * C['vm_hour'] * 4,
    'storage (5 TB SSD)':               5000 * C['gb_month_ssd'],
    'backups (20 TB)':                  20000 * C['gb_month_backup'],
    'egress (8 TB to users)':           8000 * C['gb_egress'],
    'API requests (2 billion)':         2000 * C['million_requests'],
}
total = sum(usage.values())
for name, cost in sorted(usage.items(), key=lambda x: -x[1]):
    share = cost / total
    print(f'{name:36} ${cost:8,.0f}/mo  {share:5.1%}  {"#" * round(share * 40)}')
print(f'{"TOTAL":36} ${total:8,.0f}/mo')
print('biggest lever here: cut egress with a CDN and compression; then right-size the DB')
```

The exercise shows where the money actually is (often egress and over-provisioned databases, not the obvious compute), and that the biggest savings come from a few large line items, not from micro-optimising everything. Tag resources by team and feature, watch the bill as a metric, and treat a sudden cost jump like a latency regression: investigate it.

## 7.6 Practical lessons

- Measure and profile before optimising; Amdahl's law means only the dominant cost is worth attacking, and it caps the gain.
- Know the latency orders of magnitude; reduce round trips by batching, parallelising, caching and moving computation to the data.
- Optimise and set objectives on tail percentiles (p99), which dominate at scale, especially under fan-out.
- Scale by doing less work first, then up, then out; keep the app tier stateless; the bottleneck just moves.
- Treat cost as a design input; know rough unit prices; the biggest savings are in a few large line items (often egress and databases).

# Chapter 8: Technical Debt and Evolving Systems
%Managing debt deliberately, and changing large systems without breaking them

## 8.1 What technical debt really is

**Technical debt** is the gap between how the code is and how it should be for the work you now need to do: shortcuts, outdated designs, missing tests, code that no longer matches the problem. Like financial debt, it is not inherently bad: taking it on **deliberately** to ship sooner can be the right call (a prototype, a deadline, a market window), as long as you know you are borrowing and intend to repay. The danger is **unintentional** or **unacknowledged** debt that accrues "interest" as **drag**: every change gets slower, riskier and more frustrating, until the team spends most of its time fighting the code rather than adding value.

The useful distinction is **deliberate vs inadvertent** and **prudent vs reckless**. "We'll ship the simple version now and refactor when we validate the feature" is prudent-deliberate. "What's layering? just make it work" is reckless-inadvertent. A senior engineer borrows consciously, writes down the debt (a ticket, a `TODO` with a reason and a link), and schedules repayment.

## 8.2 Managing debt as a portfolio

- **Make it visible**: a debt backlog, or labels on tickets, so the cost is known and can be prioritised, not just felt as vague slowness.
- **Pay it down continuously**: the "boy-scout rule" (leave each file a little better than you found it) and a steady fraction of capacity (a common figure is ~20%) for maintenance keep debt from compounding, far more cheaply than occasional big "rewrite everything" projects.
- **Prioritise by interest, not by ugliness**: fix the debt in code you change often and that slows you down most; ugly code that never changes and works fine is low priority. Debt in a hot path costs every day; debt in a stable corner costs nothing.
- **Tie repayment to feature work**: "to add this feature cleanly, we first need to refactor this module" is an easier sell and a natural moment than a standalone "cleanup" project.

```python run Why steady small repayment beats letting debt compound
def simulate(repay_fraction, interest=0.03, weeks=52, new_debt=1.2, capacity=10.0):
    debt, delivered = 8.0, 0.0
    for _ in range(weeks):
        drag = min(0.75, debt * 0.012)                # debt slows delivery
        usable = capacity * (1 - drag)                # capacity lost to fighting the code
        repay = usable * repay_fraction
        delivered += usable - repay                   # the rest ships features
        debt = max(0.0, debt * (1 + interest) + new_debt - repay)
    return round(debt, 1), round(delivered, 1)
print(f'{"strategy":28} {"debt after 1yr":>14} {"features shipped":>17}')
for label, repay in [('ignore debt (0%)', 0.0), ('steady paydown (15%)', 0.15),
                     ('heavy paydown (30%)', 0.30)]:
    debt, shipped = simulate(repay)
    print(f'{label:28} {debt:14} {shipped:17}')
```

Ignoring debt ships a little more in the first few weeks but ends the year buried in debt and slowed to a crawl, having shipped the **least**; a steady modest paydown keeps debt low and, because it avoids the compounding drag, ships the **most** over the year; even heavy paydown, which spends more capacity on repayment, still beats ignoring it. The intuition that "we don't have time to pay down debt" is usually backwards over any horizon longer than a few weeks.

## 8.3 Changing large systems safely

Senior engineers routinely change systems too big to rewrite and too important to break. The techniques are about **incremental, reversible** change:

- **Strangler fig**: build the new alongside the old and migrate piece by piece, routing a growing share of traffic to the new path, until the old can be removed. Far safer than a big-bang rewrite, which is one of the most reliable ways to fail (you reproduce years of accumulated edge cases while shipping nothing).
- **Feature flags**: deploy code dark, turn it on gradually (a few percent of users, then more), and turn it off instantly if it misbehaves. Decouples deploy from release and makes rollback a config change.
- **Expand/contract (parallel change)** for schema and API changes: add the new form, make both work, migrate readers and writers, then remove the old form. Each step is backward-compatible, so nothing breaks and any step can be rolled back.
- **Backfill and dual-write** for data migrations: write to both old and new stores, backfill history, verify they agree, then switch reads over, then stop writing the old.
- **Shadow / dark launching**: send real traffic to the new path without using its results, to test it under real load before trusting it.

The common thread is that every step is small, reversible, and verifiable in production, so a mistake is caught early and undone cheaply, never discovered at a big cut-over.

## 8.4 The rewrite trap

The urge to throw it all away and rewrite from scratch is strong and usually wrong. A big-bang rewrite throws away all the embedded knowledge of edge cases and bug fixes, takes far longer than estimated, ships no value until it is done (if it ever is), and often arrives to find the requirements have moved. Prefer **incremental replacement** (strangler fig) that delivers value throughout and can be stopped or redirected at any point. Rewrite from scratch only when the old system genuinely cannot evolve to meet the need, and even then, replace it piece by piece.

## 8.5 Practical lessons

- Technical debt is the gap slowing your current work; borrowing deliberately is fine, unacknowledged debt compounds into drag.
- Make debt visible, pay it down steadily (boy-scout rule, a fixed capacity share), and prioritise by interest, not ugliness.
- Steady small repayment ships more over time than ignoring debt; "no time to fix it" is usually false.
- Change big systems incrementally and reversibly: strangler fig, feature flags, expand/contract, dual-write, shadow launches.
- Avoid big-bang rewrites; replace piece by piece so value flows throughout and mistakes are cheap to undo.
