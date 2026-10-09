# How to use this guide
%Three complete interview loops to sit under real time limits, with model answers and the rubrics interviewers use

Reading about interviews is not the same as passing them. Candidates who know the material still fail because they run out of time, code silently, skip requirements in design rounds, or tell vague stories in behavioural rounds. This guide turns the rest of the repository into **practice under interview conditions**: three complete loops, each with a coding round, a low-level design (LLD) round, a high-level design (HLD) round and a behavioural round, at three levels of difficulty.

| Loop | Level | Typical companies | Rounds |
|---|---|---|---|
| A (Chapter 2) | Fresher, service and product companies | Mass recruiters' digital or specialist roles, start-ups, product companies' new-graduate hiring | 2 coding problems, LLD-lite, HLD-lite, HR |
| B (Chapter 3) | SDE-1 at a product company | Product companies and well-funded start-ups | 2 coding problems, machine coding, HLD, behavioural |
| C (Chapter 4) | SDE-2 or strong SDE-1 | Product companies hiring experienced engineers or exceptional graduates | 2 harder coding problems, concurrent LLD, HLD with scale, senior behavioural |

Every coding solution and every LLD design in this book was **compiled and run** on JDK 25 with its tests, and its real output is shown. Every estimate in the HLD rounds was computed by a program rather than by hand. Behavioural answers are models to adapt, not scripts to memorise.

## How to sit a loop

1. **Do not read the round first.** Open only the problem statement, start a timer for the stated time, and work on paper or in a plain editor (no autocomplete, no internet), speaking aloud as if an interviewer were listening. Recording yourself on your phone is the closest substitute for a real interviewer.
2. **Stop when the timer stops**, even mid-sentence. Interviews do.
3. Compare with the model answer, then **score yourself with the round's rubric**. Be strict: score what you said and wrote, not what you meant.
4. Fill in the debrief template in Chapter 5 and plan the next week's practice from it.

> TIP: Do a whole loop in one sitting at least once, with only 10-minute breaks: stamina is part of the test.

## Where the underlying material lives

| Round | Prepare with |
|---|---|
| Coding | DSA in Java guide and practice book; Java guide; OS, Networks and DBMS guides for the fundamentals questions asked inside rounds |
| LLD and machine coding | Low-Level Design guide; Java Concurrency guide for thread-safe designs |
| HLD | System Design (HLD) guide; Distributed Systems; Kafka and Stream Processing |
| Behavioural and HR | Interview, HR and Resume guide; Senior Engineer Handbook for experienced roles |

# Chapter 1: How Loops Are Run and Scored
%What each round looks for, how 45 minutes are spent, how interviewers turn notes into a decision, and how to think aloud

## 1.1 The shape of a loop

A **loop** is the set of interviews whose combined feedback decides an offer. Formats vary, but most technical hiring follows this outline:

| Stage | Format | What it filters for |
|---|---|---|
| Online assessment | 2–4 problems in 60–120 minutes, auto-judged; sometimes MCQs on CS fundamentals | Can you produce correct code alone under time pressure? |
| Coding rounds (1–2) | 45–60 minutes with an engineer, 1–2 problems | Problem solving, communication, code quality, testing |
| LLD or machine coding | 45–90 minutes; design classes, sometimes write runnable code | Modelling, object-oriented design, extensibility, clean code |
| HLD | 45–60 minutes at a whiteboard | Requirements, estimates, architecture, trade-offs |
| Behavioural or hiring manager | 30–60 minutes | Ownership, collaboration, learning, motivation |
| HR | 15–30 minutes | Fit, expectations, logistics |

Freshers usually get lighter design rounds ("design the classes for a library", "how would you build a placement portal"); experienced candidates get deeper ones. Service companies' specialist tracks often combine coding, a project discussion and CS fundamentals in one technical interview.

## 1.2 How a coding round is scored

Interviewers write notes during the round and then rate each dimension. A typical rubric:

| Dimension | Strong signal | Weak signal |
|---|---|---|
| Understanding | Restates the problem, asks about input size, duplicates, empty input, output format | Starts coding immediately; solves a different problem |
| Approach | States a brute force with its complexity, then improves it with a reason | Jumps to a half-remembered trick; cannot explain why it works |
| Coding | Clean, compiling code with meaningful names, written steadily while talking | Long silences; code that would not compile; copy-pasted branches |
| Testing | Walks through an example, then edge cases, finds and fixes own bugs | Declares "done" without testing; the interviewer finds the bugs |
| Complexity | States time and space correctly, including hidden costs (sorting, string building) | Wrong or missing analysis |
| Communication | Thinks aloud, takes hints well, explains trade-offs | Silent, defensive, or ignores hints |

Each dimension gets a score such as 1–4, and the round gets an overall recommendation: **strong hire, hire, lean no hire, no hire**. Solving the problem is necessary but not sufficient: an optimal solution reached in silence with no testing is often a lean no hire, while a clear, well-tested solution that needed one hint is usually a hire.

## 1.3 Spending 45 minutes

```text
 0– 5  Clarify: restate, ask about constraints and edge cases, agree on an example
 5–12  Approach: brute force + complexity; better idea + complexity; get a nod before coding
12–32  Code: top-down, helper functions named first, talk while writing
32–40  Test: run the example by hand, then empty / single / duplicate / extreme cases
40–45  Complexity, possible improvements, your questions
```

For two problems in 45 minutes, halve every slot and keep the first problem under 20 minutes. If you are stuck for more than three minutes, say what you have tried and what you are considering; interviewers give hints to candidates who make their thinking visible.

## 1.4 How design rounds are scored

| Dimension | LLD strong signal | HLD strong signal |
|---|---|---|
| Requirements | Lists use cases, actors and what is out of scope before drawing anything | Functional and non-functional requirements, explicit scale numbers |
| Core model | Small cohesive classes, clear responsibilities, relationships justified | Clear components and data flow; an API and a data model |
| Design quality | SOLID applied where it helps, patterns named only when they fit | Estimates drive choices (storage, sharding, caching) |
| Depth | Concurrency, extensibility (new vehicle type, new payment method) | Bottlenecks, failure handling, consistency choices |
| Trade-offs | States what the design makes hard and why that is acceptable | Compares options and picks one with reasons |
| Communication | Drives the discussion, checks in, adapts to new requirements | Same, and manages time across breadth and depth |

## 1.5 How behavioural rounds are scored

Interviewers listen for **specific evidence of competencies**: ownership, dealing with ambiguity, collaboration and conflict, learning from failure, raising quality, and (for experienced roles) influence. Each answer is judged on:

| Strong | Weak |
|---|---|
| One concrete situation, told with STAR (situation, task, action, result) | Generalities ("I always communicate well") |
| "I" for your actions, "we" only for the team's | "We did..." throughout, so your role is invisible |
| Numbers and outcomes (time saved, bugs prevented, users affected) | No result, or a result nobody could check |
| Honest reflection: what you would do differently | Blaming others; a "failure" that is really a boast |

## 1.6 Thinking aloud

Silence is the most common reason good candidates get poor feedback: the interviewer cannot score what they cannot hear. Useful phrases:

| Moment | Say |
|---|---|
| Starting | "Let me make sure I understand: given ..., return .... Can the input be empty? How large can n be?" |
| Brute force | "The straightforward way is ..., which is O(n²). With n up to 10⁵ that is too slow, so I need something near O(n log n)." |
| Choosing | "A hash map gives O(1) lookups, so I can do this in one pass." |
| Stuck | "I'm considering sorting first, but that loses the original order, which we need. Let me think about a heap instead." |
| Coding | "I'll write the main loop first and fill in this helper afterwards." |
| Testing | "Let me trace the example... and now an empty array, where the loop never runs, so we return 0, which is correct." |

## 1.7 Practical lessons

- A loop is several independent judgements; one weak round can be outweighed, a pattern of weak communication cannot.
- In coding rounds, clarifying, testing and complexity matter as much as the final code.
- In design rounds, requirements and trade-offs separate strong from average candidates.
- In behavioural rounds, one specific story with "I" and a result beats any general claim.
- Think aloud throughout; interviewers can only score what they hear.
