# Chapter 5: Debriefs, Failure Patterns and an Improvement Plan
%Turning each mock into a specific plan: the debrief template, the mistakes that sink most candidates, and tracking progress

## 5.1 The debrief template

Fill this in within an hour of every mock, while you still remember what you said.

| Field | Example entry |
|---|---|
| Round and problem | B1 coding: smallest course order |
| Time used per phase | Clarify 2 min, approach 9 min, code 14 min, test 0 min (ran out) |
| Rubric scores (1–4) | Understanding 3, approach 3, coding 3, testing 1, complexity 2, communication 2 |
| What went well | Recognised topological sort quickly |
| What went wrong | Silent for 4 minutes while thinking about the heap; never tested the cycle case |
| Root cause | Planned the code in my head instead of aloud; no time box for the approach phase |
| One change for next time | Say each idea aloud as it comes; start coding by minute 12 even if the solution is not optimal |
| Material to revise | DSA guide, graphs chapter: Kahn versus DFS |

The most important line is the **one change**: a single behaviour to practise in the next mock. Lists of ten resolutions do not change anything.

## 5.2 Failure patterns and their fixes

| Round | Pattern | Fix |
|---|---|---|
| Coding | Coding before understanding; solving a different problem | Restate the problem and work one example by hand before any code |
| Coding | Long silences | Narrate options, even rejected ones; ask "does this direction make sense?" |
| Coding | No testing, or only the given example | Reserve the last 8 minutes; test empty, single, duplicate, extreme and the case that breaks the naive approach |
| Coding | Correct idea, messy code | Name helpers first, write top-down; practise the 20 most common patterns until the code is automatic |
| LLD | Drawing classes before requirements | Spend the first 5–10 minutes on use cases and scope |
| LLD | A god class, or patterns for their own sake | One responsibility per class; name a pattern only when it solves a stated problem |
| LLD | Ignoring concurrency when the problem implies it (bookings, inventory, money) | Ask "can two users do this at once?" for every write |
| HLD | No numbers | Always estimate load and storage, then say what the numbers imply |
| HLD | Buzzword architecture (microservices, Kafka, sharding) without need | Start simple, scale only where the estimates demand |
| HLD | Breadth with no depth | After the overview, offer to go deep on the riskiest component |
| Behavioural | "We" everywhere, no result | Rewrite stories with "I" for your actions and a number in the result |
| Behavioural | Stories that collapse under follow-up questions | Rehearse each story with three "why?" and "what exactly?" questions |
| Any | Running out of time | Practise with a visible timer and phase checkpoints (Chapter 1) |

## 5.3 Tracking progress across mocks

Scores from single mocks are noisy; trends over several are informative. Keep a table of rubric averages per round type and look at both the **level** and the **direction**.

```python run Which area to practise next, from six weeks of mock scores
scores = {                                   # average rubric score (1-4) in each weekly mock
    'coding':      [2.2, 2.5, 2.8, 2.9, 3.1, 3.2],
    'LLD':         [2.0, 2.1, 2.1, 2.3, 2.2, 2.4],
    'HLD':         [1.8, 2.0, 2.4, 2.6, 2.9, 3.0],
    'behavioural': [2.6, 2.6, 2.7, 2.7, 2.8, 2.8],
}

def slope(ys):                               # least-squares trend per week
    n = len(ys); xs = range(n)
    mx, my = sum(xs) / n, sum(ys) / n
    return sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / sum((x - mx) ** 2 for x in xs)

target = 3.0
print(f'{"area":<12} {"last 3 avg":>10} {"trend/wk":>9}  weeks to {target} at this pace')
for area, ys in scores.items():
    recent, trend = sum(ys[-3:]) / 3, slope(ys)
    gap = target - recent
    eta = 'reached' if gap <= 0 else ('never' if trend <= 0 else f'{gap / trend:.0f}')
    print(f'{area:<12} {recent:>10.2f} {trend:>+9.2f}  {eta}')
weakest = min(scores, key=lambda a: sum(scores[a][-3:]))
print('focus next week:', weakest)
```

The table shows a typical picture: coding and HLD improved quickly with practice, behavioural is steady but flat, and LLD is the lowest and, at its current pace, about 10 weeks from the target, so it gets the next week's focus (two machine-coding mocks, Low-Level Design guide Chapters 7 and 8). Using the last three mocks rather than all six stops a bad first week from hiding recent progress.

## 5.4 A four-week plan before interviews

| Week | Coding | Design | Behavioural | Full loops |
|---|---|---|---|---|
| 1 | 2 problems a day from the DSA practice book, timed | One LLD case study from the LLD guide, then one from its practice book | Write five STAR stories | Loop A |
| 2 | Continue; one timed pair of problems every other day | Two HLD case studies with estimates | Rehearse stories aloud with follow-ups | Loop B |
| 3 | Focus on the weakest patterns from debriefs | Machine coding: one 60-minute build | Mock with a friend asking follow-ups | Loop C |
| 4 | Light practice, revise notes | Revise case-study one-liners (HLD guide, Chapter 11) | Final polish | Repeat the loop you scored lowest on, with a different problem from the workbook |

## 5.5 Practical lessons

- Debrief every mock within an hour; choose one behaviour to change next time.
- Most failures are process failures: silence, no testing, no requirements, no numbers.
- Track rubric scores over time and practise the area furthest from the target at its current pace.
- Full loops in one sitting train stamina and time management, not just knowledge.

# Chapter 6: The Final Checklist
%The week before, the day before, during each round and after the interview

## 6.1 The week before

| Item | Done when |
|---|---|
| Résumé | Every line is something you can talk about for five minutes; numbers checked |
| Projects | One-minute and five-minute versions of each project; know your design decisions and what you would change |
| Stories | Five STAR stories covering conflict, failure, ownership, learning and initiative |
| Company | Products, recent news, engineering blog posts, the role's tech stack |
| Coding | Patterns revised from the DSA guide's cheat sheet; 2–3 timed problems a day, no more |
| Design | Estimation numbers memorised (HLD guide, Chapter 11); LLD case-study quick reference read |
| Fundamentals | OS, networks, DBMS question banks skimmed for the role's likely topics |
| Logistics | Interview links tested, IDE or online editor practised, ID and documents ready |

## 6.2 The day before and the day itself

- Stop learning new topics; review your own notes and debriefs.
- Sleep. Tired candidates make careless mistakes that preparation cannot fix.
- For online interviews: quiet room, charged laptop, wired or reliable internet, a backup phone hotspot, water, paper and pen.
- Join five minutes early. Have your résumé and the job description open.

## 6.3 During each round

| Round | Remember |
|---|---|
| Coding | Clarify, example by hand, brute force with complexity, improve, code aloud, test edge cases, state complexity |
| LLD | Requirements and scope, core entities, responsibilities, relationships, then code; concurrency and extension |
| HLD | Requirements, estimates, API, data model, architecture, deep dive on the riskiest part, trade-offs |
| Behavioural | STAR, "I", numbers, reflection; pause to choose the best story rather than the first |
| HR | Honest, positive, specific to this company; know your constraints (location, dates, notice period) |
| Every round | Ask one thoughtful question at the end; thank the interviewer |

## 6.4 After the interview

- Write a debrief the same day, even if it went well: the questions asked are valuable for the next interview.
- A short thank-you note to the recruiter is fine; do not chase interviewers.
- If rejected, ask the recruiter for feedback (some will share it) and add the gaps to your plan.
- If several offers arrive, compare learning, team, role and total compensation, not just the base salary (Interview, HR and Resume guide, Chapter 7).

## 6.5 Practical lessons

- Preparation in the last week is revision and rest, not new topics.
- Each round has a checklist; run it automatically so your attention goes to the problem.
- Every interview, passed or failed, produces material for the next one if you debrief it.
