# Chapter 3: Code Review and Raising the Team's Quality
%Reviews that catch what matters, teach, and lift the whole team

## 3.1 What review is for

Code review has four jobs, in rough order of value: **catch defects** before users do, **share knowledge** (no code known to only one person), **keep the codebase coherent** (consistent patterns, so it stays changeable), and **teach** (the main way standards spread). A senior engineer treats review as one of the highest-leverage things they do: a good review improves one change and makes the author better at every future change.

## 3.2 What to look for, in priority order

Review from the most important concern down, and do not let style nits crowd out substance:

1. **Correctness**: does it do what it should, including edge cases, error paths, concurrency, and the empty/huge/malformed inputs the author may not have considered?
2. **Security**: input validation, authorisation on every object, no injection, no secrets, no sensitive data in logs (the security guide's checklist).
3. **Design fit**: does it belong here? Is it coupled to the right things? Will it be easy to change? Is it the simplest approach, or is there accidental complexity?
4. **Tests**: do they exist, do they test behaviour rather than implementation, would they catch a regression, do they cover the risky paths?
5. **Readability and maintainability**: names, structure, will the next person understand it?
6. **Operability**: logging, metrics, failure behaviour, roll-back.
7. **Style**: formatting and conventions, which should be **automated** (linters, formatters) so humans never argue about them.

## 3.3 How to review well

- **Understand the intent first**: read the description and the ticket before the diff; review against the goal, not against how you would have written it.
- **Separate "must fix" from "consider"**: label blocking issues clearly and mark preferences as optional, so the author knows what actually gates the merge. (The repository's own review conventions in this series distinguish blocking findings from optional nits for exactly this reason.)
- **Ask, do not command**: "What happens if this list is empty?" teaches and invites discussion better than "This will throw." It also leaves room for you to be wrong about the context.
- **Explain the why**: a review comment that gives the reason (a link, a principle, a past incident) teaches; a bare instruction does not.
- **Praise good things**: reviews that are only criticism demoralise; noting a neat solution or a good test reinforces it and keeps review a positive ritual.
- **Be timely**: a review sitting for two days blocks a person and invites them to pile more on top. Reviewing promptly is a team-speed issue, not just a courtesy.
- **Pull the big ones to a call**: a 2,000-line change or a deep design disagreement is faster and kinder to discuss live than across twenty comment threads. And push back on huge PRs: small, focused changes are reviewed better and merged faster.

> TRAP: Two failure modes. The **rubber stamp** ("LGTM" without reading) defeats the purpose and lets defects through. The **nitpick storm** (dozens of trivial style comments, no engagement with the design) exhausts the author, delays the merge, and trains people to fear review. A good reviewer engages with what matters and automates or lets go of what does not.

## 3.4 Receiving review well

Seniority shows in how you take review as much as how you give it. Separate your ego from your code: feedback is about the change, not about you. Assume good intent, ask for clarification rather than getting defensive, and when you disagree, explain your reasoning and be genuinely open to being wrong, then disagree-and-commit once a decision is made. Thank reviewers for catches. Modelling this makes it safe for the whole team to give and receive honest feedback, which is where quality comes from.

## 3.5 Raising quality beyond the single review

Reviewing one change at a time is linear; a senior engineer looks for the **systemic** improvement that prevents a whole class of problems:

- **Automate the mechanical**: formatters, linters, type checks, security and dependency scanners in CI (the security and front-end guides) so that reviews are about substance, not whitespace.
- **Guardrails over vigilance**: if the same mistake recurs, add a lint rule, a test, a template, or an API that makes the mistake hard to make. A guardrail protects everyone forever; catching it in review protects one change.
- **Templates and checklists**: PR templates, design-doc templates, an incident-review template, a "definition of done". They encode the team's hard-won lessons so nobody has to remember them.
- **Shared standards, written down**: a short, living style and architecture guide settles recurring debates once.
- **Pairing and mobbing** on hard or risky work: higher quality in real time, and knowledge shared as it is created.

The test of a senior engineer's impact on quality is not how many bugs they personally caught in review, but whether the team produces **fewer bugs over time** because of the systems they put in place.

## 3.6 Practical lessons

- Review for correctness and security first, style last; automate style entirely.
- Understand intent, separate blocking from optional, ask rather than command, explain the why, praise good work, be prompt.
- Take review without ego; model disagree-and-commit.
- Prefer systemic fixes (guardrails, templates, automation) over catching the same issue repeatedly by hand.

# Chapter 4: Designing Systems and Making Decisions
%Turning vague problems into clear plans, and choosing well under uncertainty

## 4.1 Start with the problem, not the solution

The most common and expensive engineering mistake is building the wrong thing well. Before any design, a senior engineer makes sure they understand the **problem**: who has it, how painful it is, what success looks like, and what the real constraints are. Often the stated requirement is a proposed solution in disguise ("we need a cache") hiding the actual need ("the dashboard is too slow"), which may have a simpler or different answer. Ask "what are we actually trying to achieve, and for whom?" until the problem is clear, and be willing to challenge the premise: the best engineering is sometimes talking the team out of building something.

## 4.2 Requirements, scale and constraints first

Good design follows from clear requirements, exactly as the system-design guides teach: functional requirements (what it must do), non-functional requirements (how well: latency, availability, consistency, security, cost), and the **numbers** (users, requests per second at peak, data size and growth, read/write ratio). A design that ignores the numbers is guessing; the same problem has completely different solutions at 100 and 100 million users.

## 4.3 There are no right answers, only trade-offs

Senior design is the art of **trade-offs**. Almost every decision trades one good thing for another: consistency versus availability (CAP), latency versus throughput, simplicity versus flexibility, build versus buy, speed-to-ship versus long-term maintainability, cost versus performance. The mark of seniority is not knowing "the right architecture" but being able to **name the trade-offs, weigh them against this situation's priorities, and explain the choice**. "It depends" is the correct answer, as long as it is followed by "on these factors, and here is how they point for us".

> TIP: In a system-design interview and in real design reviews, always state your assumptions and the trade-offs explicitly: "I'm assuming read-heavy traffic and that a few seconds of staleness is acceptable, so I'd add a cache and accept eventual consistency; if we needed strong consistency I'd do X instead, at higher latency." That reasoning, not the diagram, is what demonstrates seniority.

## 4.4 Reversible and irreversible decisions

Not all decisions deserve the same care. Jeff Bezos's distinction is useful: **one-way doors** (hard or impossible to reverse) warrant deep analysis and broad input; **two-way doors** (easily reversed) should be decided quickly and adjusted if wrong. Treating a two-way door like a one-way door (endless debate over a choice you can change next week) wastes time; treating a one-way door like a two-way door (rushing a public API, a data model, a cloud provider, a security design) creates expensive regret. A senior engineer sorts decisions by reversibility and spends analysis where reversal is costly.

```python run The cost of a decision is its reversal cost times the chance it is wrong
decisions = [
    # name,                       reverse_cost(person-weeks), P(wrong), door
    ('Name of an internal method',       0.05, 0.3, 'two-way'),
    ('Which chart library',              1.0,  0.3, 'two-way'),
    ('REST vs GraphQL for public API',   30.0, 0.25, 'one-way'),
    ('Primary datastore choice',         60.0, 0.2,  'one-way'),
    ('Data model for billing records',   40.0, 0.25, 'one-way'),
]
print(f'{"decision":34} {"door":8} {"expected regret":>16}  invest in analysis?')
for name, reverse_cost, p_wrong, door in sorted(decisions, key=lambda d: -d[1] * d[2]):
    regret = reverse_cost * p_wrong                 # expected cost if we have to undo it
    invest = 'YES, analyse' if regret > 2 else 'decide fast, adjust'
    print(f'{name:34} {door:8} {regret:13.1f} wk  {invest}')
```

The expected regret (reversal cost times the probability of being wrong) sorts decisions far better than how interesting they are to argue about. Spend the team's analysis on the top of this list and move fast on the bottom; a surprising amount of design-review time is spent on cheap, reversible decisions while the expensive ones get rushed.

## 4.5 Simplicity, and designing for the scale you have

- **Prefer boring, proven technology** for anything critical; novelty is a cost and a risk. Spend your limited "innovation budget" on the few things that are genuinely your competitive advantage, and use well-understood tools for the rest.
- **Design for the next order of magnitude, not the final one**: build so that today's load is handled cleanly and 10× is reachable without a rewrite, but do not build for a billion users you do not have. Over-engineering for imagined scale is as costly as ignoring real scale.
- **Make the design evolvable**: clear boundaries and interfaces so pieces can be replaced; you will learn things in production that no design foresaw.
- **Minimise moving parts**: every service, queue, cache and datastore is something to operate, secure and debug. Add them when the problem demands it (the back-end guide's chapters are each "when you need this"), not because they are fashionable.

## 4.6 Write the decision down: ADRs

Decisions that are expensive to reverse, or that future engineers will question ("why on earth is it done this way?"), should be recorded in a short **Architecture Decision Record**: the context, the options considered, the decision, and the consequences. ADRs cost minutes and save hours of re-litigation and archaeology; they also force the clarity that writing demands (Chapter 9). The act of writing often exposes a flaw in the reasoning before any code is committed.

## 4.7 Practical lessons

- Understand and sometimes challenge the problem before designing; the stated requirement may hide the real need.
- Pin down requirements, scale numbers and constraints; the same problem has different answers at different scales.
- Seniority is naming and weighing trade-offs, not knowing one right architecture; state assumptions explicitly.
- Sort decisions by reversibility and expected regret; analyse one-way doors, decide two-way doors fast.
- Prefer boring technology and the minimum moving parts; design for the next 10×, keep it evolvable, and write down the big decisions.
