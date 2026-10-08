# Chapter 5: Testing Strategy and the Economics of Quality
%How much to test, what to test, and why finding bugs early is worth so much

## 5.1 Why bugs found late cost so much more

The single strongest argument for testing is economic: a defect gets **more expensive the later it is found**, because more work is built on top of it, more context is lost, and the blast radius grows. A bug caught by a unit test as you type costs seconds; the same bug in production can cost an incident, lost customers and a frantic fix.

```python run The cost of a bug grows by roughly an order of magnitude per stage
stages = [('while coding', 1), ('unit test / review', 5), ('integration/QA', 15),
          ('staging', 50), ('production', 300)]
print(f'{"found at":22} {"relative cost":>14}  {"":s}')
for stage, cost in stages:
    print(f'{stage:22} {cost:12}x  {"#" * cost if cost <= 60 else "#" * 60 + " ..."}')
found = {'while coding': 60, 'unit test / review': 25, 'integration/QA': 10,
         'staging': 4, 'production': 1}
total = sum(found[s] * c for s, c in stages)
baseline = sum(found.values()) * 300                      # if every bug reached production
print(f'\n100 bugs caught mostly early cost {total} units; '
      f'if all reached production, {baseline}')
print(f'shifting detection left is about {baseline / total:.0f}x cheaper here')
```

The exact multipliers vary by study and context, but the order-of-magnitude-per-stage shape is well established, and it is the whole case for "shift left": invest in catching defects as early as possible, because early detection is dramatically cheaper than late. This is also why fast feedback (quick tests, quick CI, quick local runs) is worth engineering effort: it moves detection earlier.

## 5.2 The testing pyramid

Not all tests are equal in cost and value. The **testing pyramid** is the standard guidance on the mix:

| Level | What it tests | Count | Speed | Fragility |
|---|---|---|---|---|
| **Unit** | One function or class in isolation | Many (the base) | Milliseconds | Low |
| **Integration** | Components together (code + real database, two services) | Fewer | Seconds | Medium |
| **End-to-end** | The whole system as a user (browser → API → DB) | Few (the tip) | Seconds to minutes | High |

Most tests should be fast, focused unit tests; fewer integration tests check that the pieces fit; a handful of end-to-end tests check the critical user journeys (sign up, place an order, pay). The **anti-patterns** are the "ice-cream cone" (mostly slow, flaky end-to-end tests, little unit coverage: slow, fragile, hard to debug) and testing everything through the UI. The guides in this series follow the pyramid: the back-end, front-end and security books run many small executed checks and a few full-flow tests.

## 5.3 What to test, and what not to

Coverage percentage is a weak target: 100% coverage of trivial getters proves little, and chasing a number produces tests that assert implementation details and break on every refactor. Test for **confidence to change**, and aim effort at **risk**:

- **Test behaviour, not implementation**: assert what the code does (given these inputs, this output or effect), not how. Such tests survive refactoring and document intent; tests coupled to internals break constantly and discourage improvement.
- **Prioritise by risk and blast radius**: payment, auth, data integrity and anything hard to reverse deserve thorough testing; a cosmetic feature needs little.
- **Cover the edges and the error paths**: empty, one, many, huge, malformed, concurrent, failure of a dependency. Most bugs live at boundaries, and most untested code is error handling.
- **Write a failing test for every bug** before fixing it (regression tests): it proves the fix and stops the bug returning.
- **Do not test the framework or the language**; test your logic.

## 5.4 Tests as design pressure and as documentation

Writing a test first (or at least early) is a design tool: if something is hard to test, it is usually badly coupled, and making it testable makes it better designed (dependencies injected, side effects isolated, pure logic separated from I/O). Tests are also the most reliable **documentation**: they cannot go out of date without failing, and a reader can see exactly how a unit is meant to be used and what it guarantees. This series' practice books use executed solutions for the same reason: a check that runs cannot lie about what the code does.

## 5.5 Beyond example-based tests

- **Property-based testing** checks that invariants hold over many generated inputs ("encoding then decoding returns the original", "the output is always sorted"), finding edge cases humans miss.
- **Contract tests** verify that a service and its consumers agree on the interface, so one team's change does not silently break another.
- **Load and chaos testing** check behaviour under stress and failure (Chapter 6), which example tests never exercise.
- **Mutation testing** checks the tests themselves, by introducing bugs and seeing whether any test fails; it reveals coverage that asserts nothing.

## 5.6 Flaky tests are worse than no tests

A test that sometimes fails for no real reason is corrosive: people stop trusting the suite, start ignoring red builds, and eventually miss a real failure hiding among the noise. A senior engineer treats flakiness as a priority bug: find the cause (timing, shared state, order dependence, real race conditions the test is exposing) and fix it, or quarantine the test loudly, never silently retry until green. A suite everyone trusts is worth far more than a larger suite nobody believes.

## 5.7 Practical lessons

- Bugs get roughly 10× more expensive per stage; invest in catching them early with fast feedback.
- Follow the pyramid: many fast unit tests, fewer integration tests, a few end-to-end journeys; avoid the ice-cream cone.
- Test behaviour not implementation; aim effort at risk and edges; add a regression test for every bug.
- Hard-to-test code is badly designed; tests are design pressure and living documentation.
- Treat flaky tests as urgent; a trusted small suite beats a distrusted large one.

# Chapter 6: Reliability and Operations
%SLOs, error budgets, observability, on-call and learning from incidents

## 6.1 You run what you build

In modern teams the people who write a service also operate it ("you build it, you run it"). Reliability is therefore an engineering responsibility, designed in, not a separate ops team's problem bolted on. A senior engineer owns the question "will this keep working, and how will we know, and what happens when it doesn't?" from the first design.

## 6.2 Availability: what the nines really mean

Availability is usually quoted in "nines". The headline number hides how little downtime each nine allows, and how availability **compounds** when a request depends on several services in series.

```python run What each nine allows, and why dependencies compound
year_minutes = 365 * 24 * 60
for nines in (2, 3, 4, 5):
    avail = 1 - 10 ** (-nines)
    down = year_minutes * (1 - avail)
    unit = f'{down / (24 * 60):.1f} days' if down > 2880 else (
           f'{down / 60:.1f} hours' if down > 120 else f'{down:.0f} minutes')
    print(f'{nines} nines ({avail * 100:.3f}%): {unit} of downtime per year')
print()
for n_deps in (1, 5, 10, 30):                      # services called in series for one request
    combined = 0.999 ** n_deps                     # each is individually three nines
    print(f'a request touching {n_deps:2d} services at 99.9% each: '
          f'{combined * 100:.3f}% end-to-end, '
          f'{year_minutes * (1 - combined) / 60:.0f} h/yr down')
```

Two lessons. First, "three nines" sounds impressive but allows almost nine hours of downtime a year, while five nines allows only about five minutes, which is extraordinarily hard and expensive to reach; pick the target the business actually needs, not the most nines. Second, availability **compounds down the dependency chain**: a request that touches thirty services each at 99.9% is only about 97% available end to end. This is why reducing dependencies, adding redundancy, and designing to **degrade gracefully** (serve a cached or partial result when a dependency is down, the back-end guide's patterns) matter more than chasing nines on any single service.

## 6.3 SLIs, SLOs and error budgets

Reliability is made concrete by three ideas from Google's SRE practice:

- **SLI** (Service Level Indicator): a measured quantity, e.g. the fraction of requests served successfully in under 200 ms.
- **SLO** (Service Level Objective): the target for an SLI, e.g. 99.9% of requests succeed in under 200 ms over 28 days. Set it from what users need, not at 100% (which is impossible and ruinously expensive).
- **Error budget**: 100% minus the SLO. At 99.9%, you may "spend" 0.1% of requests failing. This turns reliability into a **budget to manage**, not a binary.

The error budget resolves the eternal tension between shipping features and keeping things stable: while there is budget left, ship; when the budget is exhausted, stop feature work and fix reliability. It makes the trade-off explicit, data-driven and shared with the business, instead of an argument between developers and operations.

```python run An error budget over a month, and the burn rate that should alarm you
requests_per_day = 5_000_000
slo = 0.999
budget_per_day = requests_per_day * (1 - slo)              # allowed failures/day
print(f'daily error budget at {slo:.1%}: {budget_per_day:,.0f} failed requests')
days = [('Mon', 1200), ('Tue', 3000), ('Wed', 4500), ('Thu', 42000), ('Fri', 1500)]
spent, monthly_budget = 0, budget_per_day * 28
for day, failures in days:
    spent += failures
    burn = failures / budget_per_day                       # multiples of the daily budget
    flag = '  <-- ALERT: burning fast' if burn > 5 else ''
    print(f'{day}: {failures:>6,} failures, burn rate {burn:4.1f}x daily budget{flag}')
print(f'spent {spent:,} of ~{monthly_budget:,.0f} monthly budget '
      f'({spent / monthly_budget:.0%}) in 5 days')
```

Alerting on **burn rate** (how fast the budget is being consumed) rather than on every error catches real problems without paging someone for each blip: a fast burn (Thursday) means a genuine incident; slow, steady consumption within budget is fine and needs no one woken.

## 6.4 Observability: logs, metrics, traces

You cannot operate what you cannot see. The three pillars, each answering a different question:

- **Metrics**: aggregated numbers over time (request rate, error rate, latency percentiles, queue depth, CPU). Cheap to store, good for dashboards and alerts, answer "**is** something wrong and how bad?". Watch **percentiles** (p95, p99), not averages: an average hides the slow tail that real users feel.
- **Logs**: discrete events with context. Good for "**what** happened for this request?". Structure them (JSON fields), include a **correlation/trace id** so one request can be followed across services, and keep secrets and personal data out (the security guide).
- **Traces**: the path of one request across all services with timing at each hop. Answer "**where** is the time going / where did it fail?" in a distributed system.

The goal of **observability** is to be able to answer questions you did not know to ask in advance, especially about novel failures. Alert on **symptoms users feel** (error rate, latency, the SLO burning) rather than on causes (CPU is high), because users do not care about CPU and you cannot predict every cause; then use metrics, traces and logs to find the cause once alerted.

## 6.5 On-call and incident response

- **Humane on-call**: sustainable rotations, alerts that are actionable (every page should require human action; delete or tune the rest, because alert fatigue gets real incidents missed), and runbooks so the person paged can act without deep context.
- **During an incident**: the first priority is to **stop the bleeding** (mitigate: roll back, fail over, disable the feature, scale up), not to find the root cause; understanding can come after users are safe. Have a clear **incident commander** for anything serious, communicate status to stakeholders, and keep a timeline.
- **Roll back first**: if a recent deploy likely caused it, revert before debugging; a fast, safe rollback path is one of the highest-value things to build.

## 6.6 Blameless postmortems

After any significant incident, write a **blameless postmortem**: what happened, the timeline, the impact, the **root cause** (ask "why" until you reach a systemic cause, not "human error"), and concrete **action items** to prevent recurrence. Blameless means focusing on the systems and conditions that let the mistake happen, not on punishing the person; people make mistakes, and a good system limits the damage. Blame drives problems underground and prevents learning; blamelessness is what lets an organisation actually get more reliable over time. The real failure is not the incident but failing to learn from it.

## 6.7 Designing for failure

Everything fails eventually: machines, networks, dependencies, whole regions. Senior design assumes failure and contains it: **timeouts** on every outbound call (a call with no timeout can hang forever and exhaust your threads), **retries with back-off and jitter** for transient errors (only for idempotent operations, the back-end guide), **circuit breakers** to stop hammering a failing dependency, **bulkheads** to isolate failures so one slow dependency does not sink everything, **graceful degradation** to a reduced service, redundancy and health checks, and **tested backups** (a backup never restored is not a backup). **Chaos engineering** (deliberately injecting failures, as Netflix's Chaos Monkey does) verifies that these actually work before reality tests them.

## 6.8 Practical lessons

- You run what you build; design reliability in from the start.
- Know what nines cost and that availability compounds down dependency chains; degrade gracefully and reduce dependencies.
- Set SLOs from user needs; manage an error budget to balance shipping and stability; alert on burn rate.
- Observe with metrics (percentiles), structured correlated logs and traces; alert on user-visible symptoms.
- Mitigate before diagnosing; roll back fast; run humane, actionable on-call; write blameless postmortems with real action items.
- Assume failure: timeouts, back-off, circuit breakers, bulkheads, graceful degradation, tested backups, chaos testing.
