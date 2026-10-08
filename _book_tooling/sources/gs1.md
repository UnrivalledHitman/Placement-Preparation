# Solutions
%One reasonable worked answer for each; the reasoning matters more than matching it

## Part 1 solutions

### G1.1 Are you operating at the next level?

A good answer names **behaviours**, not more tasks. For the senior level, typical gaps are: *owning ambiguity* (taking a vague problem and defining what to build rather than waiting for a spec); *multiplying others* (reviews that teach, unblocking juniors, writing docs others use); and *seeing around corners* (raising the scaling or reliability risk before it bites). The concrete opportunities are the point: "the search feature is under-specified, I'll write the design doc and drive the decision"; "I'll pair with the two juniors on the tricky migration instead of doing it alone"; "I'll add the missing dashboards and SLO for our service before the next launch." If your list is just "write more code faster", you are describing mid-level excellence, not the next level.

### G1.2 The 10× coder who blocks everyone

Do not support the promotion yet, and be clear why. Seniority is measured in **impact including through others** (Chapter 1), and this person's net effect on the team is mixed at best: high personal output, but huge un-reviewable PRs, no shared understanding (a bus-factor of one), poor tests (debt and risk), and two juniors **blocked** because knowledge is hoarded. That is negative leverage; the team would arguably move faster with better-shared, better-tested work even at lower individual output.

The feedback, given privately and kindly: name the strength (genuine productivity) and the specific gaps (PR size, tests, knowledge sharing), tie them to the senior bar ("senior is measured by how much better the team is, and right now two people are stuck on you"), and give concrete asks: smaller PRs, tests, pairing to spread knowledge, reviews that teach. Frame it as the path **to** promotion, not a rejection. If they take it on and start multiplying rather than hoarding, they become genuinely senior. The anti-pattern to avoid is promoting on output alone and rewarding the hoarding.

### G1.3 Impact vs output

Engineer A closes the most tickets on the team and writes the most code. Engineer B closes fewer tickets, but: wrote the shared validation library that removed a class of bugs for everyone; mentored two juniors who are now independently productive; caught a design flaw in review that would have caused a costly migration; and set up the CI checks that stop whole categories of defects. A's impact is roughly their own output. B's impact is their own output **plus** a slice of everyone else's, plus the incidents and rewrites that never happened. Over a year, B made the team ship more and better, even though B's name is on fewer commits. Promotion rewards the second, because the company cares about team outcomes, not individual activity, and because B is already operating as a force multiplier, which is what senior means.

### G1.4 T-shaped

T-shaped means **deep** expertise in one or two areas (the vertical bar) and **broad** working competence across many (the horizontal bar). Depth lets you solve the hardest problems in your area and earns the trust that gets you the hard problems; breadth lets you design whole systems that cross boundaries, talk to any team, and choose the right tool. A **pure specialist** struggles to design across areas and becomes a narrow bottleneck; a **pure generalist** knows a little about everything but is rarely trusted with the genuinely hard problems and may lack the depth to see non-obvious failure modes. To widen your bar this quarter: pick an adjacent area your team touches (say, you are backend-deep, widen into the front end or into operations), build a small real thing in it, pair with an expert, and read the relevant guide end to end. Breadth comes from deliberate exposure, not osmosis.

### G1.5 The clever solution

Ask for the plain version, and explain the principle rather than just overruling. Something like: "This works and it's neat, but it took me ten minutes to understand, and it'll take the next person the same, every time they read it. Code is read far more than it's written, so clarity beats cleverness unless the speed actually matters here, and a quick check says this path isn't hot. Could we use the obvious version? If the performance does matter, let's measure it and leave a comment explaining the trick." The principles: optimise for the reader (Chapter 2), do not pay a permanent readability tax for an unmeasured micro-optimisation (premature optimisation), and keep the code changeable by keeping it understandable. Praise the ingenuity, redirect the application of it.

## Part 2 solutions

### G2.1 The nitpick storm

Two things went wrong. First, **style was reviewed by a human at all**: formatting and naming conventions should be enforced by automated formatters and linters in CI, so they never reach a review comment and are never a matter of one person's taste. Second, the reviewer **buried five real issues under thirty-five preferences and blocked the merge**, which exhausts and demoralises the author and trains the team to fear and avoid review. The five substantive comments are the whole value and were lost in the noise.

Changes: add an auto-formatter and linter to the pre-commit hook and CI; agree that style is never a review comment; teach reviewers to separate **blocking** issues (correctness, security, design) from **optional** suggestions and to engage with substance; and set a norm that review is for teaching and catching real problems, delivered with the "ask, explain, praise" approach (Chapter 3). The senior reviewer here needs coaching as much as the junior does.

### G2.2 Disagreeing with your senior's review

First, make sure you understand their reasoning; ask why they prefer their approach, because they may know a constraint you do not. Then present your case with the **evidence**, not with seniority or stubbornness: "I ran a benchmark, here are the numbers; my version is X% faster and about as readable, here's the diff." Steelman their view ("I can see yours is more consistent with the existing pattern"). If the benchmark and reasoning persuade them, good. If they still insist, judge the stakes: if it is a **two-way door** (easily changed later), **disagree and commit**: adopt their approach, move on, and do not re-litigate; being right about a reversible detail is not worth the relationship or the delay. If it is a **one-way door** with real consequences (a public API, a data model) and you have genuine evidence they are wrong, escalate the **decision** (not the person) to a wider design review or a neutral senior, framed as "we have two viable options, here are the trade-offs, let's get more input", not as a complaint. Most disagreements are two-way doors and end in disagree-and-commit.

### G2.3 Write a design-doc outline

| Section | One-line content |
|---|---|
| Context / problem | Users miss time-sensitive events (bill due, outage, OTP); we have no way to reach them proactively across channels. |
| Goals | Reliable email, SMS and push notifications; per-user preferences and quiet hours; priority tiers (OTP > alerts > marketing). |
| Non-goals | In-app inbox UI; marketing-campaign management; two-way messaging — these are out of scope for v1. |
| Requirements & constraints | ~X notifications/day, bursts at billing time; OTP latency < 10 s; providers have rate limits; must not double-send. |
| Proposed design | API → router (loads prefs, renders templates) → per-priority queues → per-channel workers with provider rate limiters, retries and dead-letter; webhooks for delivery receipts. |
| Alternatives considered | Build on the existing job table (rejected: no fan-out or priority); a third-party notification SaaS (rejected for cost/lock-in at our volume, reconsider later); synchronous sending (rejected: couples request latency to providers). |
| Trade-offs & risks | Eventual delivery (acceptable except OTP, which gets the top queue); provider outage handled by fallback provider; added operational surface (queues, workers). |
| Rollout, testing, operability | Behind a flag, start with email, add channels; load test at billing-peak volume; metrics on queue depth, send rate, failure per provider, OTP p95; dead-letter alerting. |
| Open questions | Build vs buy threshold as volume grows? Which SMS provider for India? |

The sections that carry the seniority are **non-goals** (disciplined scoping), **alternatives** (showing the thinking), and **trade-offs/rollout** (showing you will ship it safely and operate it).

### G2.4 Build vs buy

Run it as a trade-off decision driven by the requirements and reversibility, not by preference. Gather the facts first: what are the search requirements (fuzzy matching, relevance ranking, facets, languages, scale now and in two years)? For a few thousand rows with simple needs, the SQL database's full-text features may be entirely sufficient and add **zero** operational surface, which is the cheapest answer and should be the default until it is outgrown. For serious search (large corpus, relevance, aggregations), a dedicated engine is warranted, and then the sub-decision is **self-hosted Elasticsearch vs a managed service**: weigh the team's operational capacity (running Elasticsearch well is a real job), cost at your scale, data-residency and lock-in. Because search can be swapped later behind an interface, this is closer to a two-way door than it looks, so avoid over-analysing: start with the simplest thing that meets the real requirements, put it behind an abstraction, and upgrade when you measurably outgrow it. The failure mode is adopting a heavy system for requirements a `LIKE` query would serve, or hand-building search when a managed service is cheaper all-in.

### G2.5 Reversible vs irreversible

| Decision | Door | Analysis |
|---|---|---|
| Name of a new internal service | Two-way (renameable, though mildly annoying) | Decide in minutes |
| Public URL structure of the API | **One-way** (clients depend on it; breaking it is a migration) | Analyse; get it right |
| Cloud provider | **One-way** (migration is huge) | Deep analysis, broad input |
| Colour of a button | Two-way (trivial) | Decide instantly, A/B test |
| Database that stores payments | **One-way** (data migration, correctness-critical) | Deep analysis |
| Test framework | Two-way-ish (migratable with effort) | Light analysis, pick a sensible default |

The rule (Chapter 4): spend analysis in proportion to the **reversal cost times the chance of being wrong**. The public API and the payments datastore deserve real design effort; the button and the service name deserve a quick decision and a move on.

### G2.6 Challenge the requirement

Push back on the premise before building. The stated requirement (a configurable rules engine) is a **proposed solution**; the real need is "let discounts change without a two-month project each time." But the facts, four discount types changing about twice a year, do not justify a general rules engine, which is a classic over-engineering trap: two months now, plus a complex, bug-prone system to maintain forever, for a flexibility that is barely used (YAGNI, "you aren't gonna need it"). The senior move is to take this data back to the PM: "We have four discount types changing twice a year. A full rules engine is two months and ongoing complexity. For that rate of change, I'd suggest we model the four types in config/data and add a new type with a small code change, perhaps a day each, which we can do same-week when needed. If discount changes become frequent and non-engineers genuinely need to self-serve, we revisit the engine then, with real usage data." This delivers the actual value (fast discount changes) far cheaper, and keeps the option open. Challenging requirements with data is a core senior behaviour; the best engineering is often talking the team out of building something.
