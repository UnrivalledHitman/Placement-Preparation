# How to use this workbook
%36 scenario, design and reflection exercises matching the senior handbook, with worked answers

The senior handbook is about judgement, and judgement is built by **wrestling with situations**, not by reading. Each exercise below is a scenario, a design prompt, a reflection or a calculation of the kind a senior engineer meets. Think your answer through (ideally write it) before reading the worked answer; the answer is one reasonable take, not the only one, and the reasoning matters more than agreeing with it.

| Type | What you do |
|---|---|
| Scenario | Decide what you would do and why |
| Design | Sketch an approach or a document |
| Concept | Explain a principle and its trade-offs |
| Reflection | Examine your own habits and growth |
| Numerical | Work out the numbers behind a judgement |

**Marking scheme.** There are no graded answers here. Mark ✓ if your reasoning covered the key points, ~ if you missed some, ✗ if the worked answer changed your mind. Revisit the ✗ and ~ ones after you have faced a similar situation at work; the lessons land differently once lived.

| Part | Guide chapters | Topic | Exercises |
|---|---|---|---|
| 1 | 1–2 | Seniority and technical excellence | 5 |
| 2 | 3–4 | Review and design decisions | 6 |
| 3 | 5–6 | Testing and reliability | 6 |
| 4 | 7–8 | Performance, cost and tech debt | 5 |
| 5 | 9–10 | Communication and people | 7 |
| 6 | 11 | Career and interviews | 7 |

# Exercises

## Part 1: Seniority and technical excellence

**G1.1 · Medium · Reflection · Are you operating at the next level?** For the level above yours, list three things someone at that level does that you do not yet do consistently. For each, name a concrete opportunity in the next month to start.

**G1.2 · Medium · Scenario · The 10× coder who blocks everyone.** A teammate ships more code than anyone, but their PRs are huge, under-tested, and only they understand the result; two juniors are stuck waiting on reviews and answers only this person can give. They are up for promotion to senior. Do you support it? What feedback do you give?

**G1.3 · Medium · Concept · Impact vs output.** A manager says "promotions here are about impact, not lines of code." Explain the difference with a concrete example of two engineers, one high-output and one high-impact, and why the second may deserve the promotion.

**G1.4 · Easy · Concept · T-shaped.** What does "T-shaped" mean, why do pure specialists and pure generalists both struggle at senior level, and how would you deliberately widen your own horizontal bar this quarter?

**G1.5 · Medium · Scenario · The clever solution.** In review you find a dense, clever one-liner that works and is slightly faster than the obvious version, but took you ten minutes to understand. The author is proud of it. What do you say, and what principle are you applying?

## Part 2: Review and design decisions

**G2.1 · Medium · Scenario · The nitpick storm.** A senior reviewer leaves 40 comments on a junior's PR, 35 about formatting and naming preferences, 5 about real issues, and blocks the merge. The junior is demoralised. What went wrong, and how should code review in this team change?

**G2.2 · Medium · Scenario · Disagreeing with your senior's review.** A principal engineer asks you to change your approach in review; you think your version is better and have a benchmark showing it. How do you handle the disagreement, and what do you do if they still insist?

**G2.3 · Hard · Design · Write a design-doc outline.** Your team must add real-time notifications (email, SMS, push) to the product. Sketch the design-doc sections you would write and one sentence of content for each, paying special attention to goals/non-goals, alternatives and trade-offs.

**G2.4 · Medium · Scenario · Build vs buy.** The team needs full-text search. One engineer wants to build it on the existing SQL database; another wants to run Elasticsearch; a third wants a managed search service. How do you run this decision, and what factors decide it?

**G2.5 · Medium · Concept · Reversible vs irreversible.** Classify these as one-way or two-way doors and say how much analysis each deserves: the name of a new internal service; the public URL structure of your API; the choice of cloud provider; the colour of a button; the database that stores payments; which test framework to use.

**G2.6 · Medium · Scenario · Challenge the requirement.** A product manager asks for a configurable rules engine so non-engineers can define discount rules, estimated at two months. On investigation, there are currently four discount types and they change roughly twice a year. What do you do?

## Part 3: Testing and reliability

**G3.1 · Medium · Scenario · 100% coverage mandate.** Leadership mandates 100% test coverage after a bad bug. The team starts writing trivial tests to hit the number, and velocity drops. What is wrong with the mandate, and what would you propose instead?

**G3.2 · Medium · Scenario · The flaky test.** A test in CI fails about 1 in 10 runs; the team has added "retry up to 3 times" to make the build green. What is the real cost of this, and what should be done?

**G3.3 · Medium · Numerical · Pick an availability target.** A internal analytics dashboard, used by staff during working hours, is proposed to target 99.99% availability. Estimate the allowed downtime, argue whether that target is appropriate, and suggest a better one with reasoning.

**G3.4 · Hard · Design · Error budget policy.** Design an error-budget policy for a payments API at 99.95% monthly: what the SLI is, what happens as the budget is consumed, what happens when it is exhausted, and how you would alert.

**G3.5 · Medium · Scenario · The 3 a.m. page.** You are paged: the checkout service is returning 500s; it was deployed two hours ago. Walk through your first ten minutes. What do you do first, and why is finding the root cause not the first step?

**G3.6 · Medium · Scenario · The blameless postmortem.** An engineer ran a migration that deleted a column still in use, causing a two-hour outage. In the postmortem, a VP wants to know "who approved this" and suggests a stricter approval process. How do you steer this to be blameless and actually prevent recurrence?

## Part 4: Performance, cost and tech debt

**G4.1 · Medium · Numerical · Where to optimise.** A request spends 60% of its time in a database query, 30% in a serialisation step and 10% in business logic. You can make any one of them 5× faster with equal effort. Which do you pick, what overall speedup results, and what is the ceiling even if that part became instant?

**G4.2 · Medium · Scenario · The chatty page.** A product page takes 4 seconds to load; tracing shows it makes 60 sequential calls to a user service, one per item, each about 60 ms. What is happening and what are three ways to fix it, in order of preference?

**G4.3 · Medium · Scenario · The surprise cloud bill.** The monthly cloud bill jumped 40% with no traffic increase. How do you investigate, and what are the usual suspects?

**G4.4 · Medium · Scenario · "We don't have time to fix tech debt."** Your team's velocity has halved over a year; every change touches a tangled module everyone fears. The manager says there is no time for refactoring with deadlines looming. How do you make the case, and what do you propose concretely?

**G4.5 · Hard · Design · Migrate a live database.** You must change the primary key type of a 500-million-row table that a live service reads and writes constantly, with no downtime. Outline the steps using expand/contract and dual-write, and how each step is verified and reversible.

## Part 5: Communication and people

**G5.1 · Medium · Scenario · Explaining to a VP.** You need a VP to approve two weeks of work to add caching and a read replica, which they see as "not features." Write the two or three sentences you would lead with.

**G5.2 · Medium · Reflection · Your writing.** Take a recent technical message or doc you wrote. Did it lead with the point? Could a busy reader get the key message in ten seconds? Rewrite its opening to be BLUF.

**G5.3 · Medium · Scenario · Influencing without authority.** You believe the team should adopt a shared API-error format across five services, but you lead none of them and have no mandate. How do you make it happen?

**G5.4 · Medium · Scenario · The struggling junior.** A junior on your team keeps asking you to fix their bugs, and you have been quietly doing it to save time. The deadline is near. Why is this a problem, and what should you do differently?

**G5.5 · Medium · Scenario · The hidden mistake.** A teammate mentions privately that they think they introduced the bug behind last week's incident but did not say so in the postmortem, fearing blame. What does this tell you about the team, and what do you do?

**G5.6 · Medium · Scenario · Conflict on the merits.** Two strong engineers on your project are in a stalemate over sync vs async processing, and it is turning personal and blocking progress. As tech lead, how do you break the deadlock?

**G5.7 · Medium · Scenario · Late news.** Three weeks into a six-week project you realise it will take nine weeks, not six. When and how do you communicate this, and to whom?

## Part 6: Career and interviews

**G6.1 · Medium · Reflection · Your T.** Draw your own T: what are you deep in, and how broad is your bar? Name the one area of depth most valuable to your team, and the one breadth gap most limiting you.

**G6.2 · Medium · Scenario · The promotion gap.** You believe you are operating at senior level but have not been promoted after two cycles. What conversations do you have, what evidence do you gather, and how long do you give it before considering a move?

**G6.3 · Hard · Design · A STAR story bank.** List the behavioural themes a senior interview tests, and for each, outline one real story from your experience in STAR form (one line per letter). Identify which theme you are weakest on.

**G6.4 · Medium · Scenario · The system-design round.** In a senior system-design interview you are asked to "design a URL shortener." What are the first four things you do, before drawing any boxes, and why do they matter more than the drawing?

**G6.5 · Medium · Reflection · Learning durably.** List the technologies you have spent the most time learning in the past two years. Which of that learning is durable (fundamentals, transferable) and which is perishable (this year's tool)? What would you rebalance?

**G6.6 · Medium · Scenario · Saying no.** You are a trusted senior engineer, and five people this week have asked for "just a quick hand" with their problems, eating all your focus time. How do you say no without damaging relationships or becoming a bottleneck-by-refusal?

**G6.7 · Medium · Reflection · Burnout check.** Honestly assess: are you working sustainably? List the signs of burnout you would watch for in yourself, and one system (not willpower) you could put in place to work hard without flaming out.
