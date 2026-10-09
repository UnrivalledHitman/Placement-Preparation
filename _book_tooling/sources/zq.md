# How to use this workbook
%20 additional timed rounds to mix into your own mock loops, with hints kept separate and executed model answers

Each exercise is one interview round or part of one, with a time limit. Combine them into your own loops: for example, two coding exercises, one LLD and one HLD exercise, and one behavioural exercise make a fresh full loop. Coding and LLD model answers were compiled and run on JDK 25 with their tests; HLD estimates were computed by programs.

| Type | What you do |
|---|---|
| Code | Solve and test within the time limit, thinking aloud |
| Design | Produce a design (LLD classes or HLD architecture) within the time limit |
| Concept | Answer as you would to an interviewer |

**Marking scheme.** Score each attempt with the matching rubric from the guide (Chapters 2–4), from 1 to 4 per dimension, and mark ✓ (average 3 or more without the hint), ~ (with the hint) or ✗. Redo every ~ and ✗ two weeks later under the same time limit.

| Part | Round type | Exercises |
|---|---|---|
| 1 | Coding | 6 |
| 2 | LLD and machine coding | 5 |
| 3 | HLD | 5 |
| 4 | Behavioural and HR | 4 |

# Exercises

## Part 1: Coding rounds

**Z1.1 · Easy · Code · Fix the brackets (15 min).** Return the minimum number of `(` or `)` insertions that make a string of brackets balanced.

**Z1.2 · Medium · Code · Meeting rooms (20 min).** Given meeting intervals `[start, end)`, return the minimum number of rooms needed so that no two overlapping meetings share a room.

**Z1.3 · Medium · Code · Spreading outage (20 min).** In a grid, `2` is a house without power, `1` a powered house and `0` empty land. Each minute, the outage spreads from every unpowered house to its four neighbouring houses. Return the minutes until every house is unpowered, or −1 if some never are.

**Z1.4 · Medium · Code · Duplicate payments (20 min).** Payments arrive as `(paymentId, minute)` in time order. Report every payment ID that appears again within `k` minutes of its previous occurrence.

**Z1.5 · Medium · Code · Search a rotated array (20 min).** A sorted array of distinct integers was rotated at an unknown point (`[4, 5, 6, 7, 0, 1, 2]`). Find the index of a target in O(log n), or −1.

**Z1.6 · Hard · Code · Minimum window (30 min).** Given strings `s` and `t`, return the shortest substring of `s` containing every character of `t` (with multiplicity), or `""`.

## Part 2: LLD and machine coding

**Z2.1 · Medium · Code · An in-memory URL shortener (45 min).** Support `shorten(url)` (generated code), `shorten(url, alias)` (custom alias, validated, unique), `resolve(code)` and expiry after a time-to-live. Make it testable without waiting.

**Z2.2 · Medium · Code · A game leaderboard (40 min).** Support `addScore(player, points)`, `top(k)` and `rank(player)`, with ties broken by name. Discuss the complexity and what changes at 10 million players.

**Z2.3 · Medium · Code · A coupon engine (45 min).** Coupons: flat ₹100 off above ₹999; 10% off capped at ₹250; buy two of an item, get the cheaper one free. Given a cart, apply the single best coupon. New coupon types must not require changing the engine.

**Z2.4 · Hard · Code · A connection pool (45 min).** Implement a fixed-size pool with `acquire(timeout)` and `release(connection)`, safe under many threads, that never hands out more connections than its size and times out when exhausted. Test it under concurrency.

**Z2.5 · Medium · Design · An issue tracker (40 min).** Design the classes for a Jira-like tracker: projects, issues with types, a workflow of statuses with allowed transitions per issue type, assignees, comments, and permissions (only assignees and project admins move issues).

## Part 3: HLD rounds

**Z3.1 · Medium · Design · An online judge (45 min).** Design a coding-contest platform like those used for online assessments: problems, code submission in several languages, sandboxed execution against hidden tests, verdicts, and a live leaderboard. A contest has 50,000 participants in a 90-minute window.

**Z3.2 · Medium · Design · Unique ID generation (30 min).** Design a service that generates 64-bit IDs that are unique across 1,000 machines, roughly time-ordered, and produced at up to 100,000 per second per machine without coordination.

**Z3.3 · Hard · Design · Hotel search and booking (45 min).** Users search hotels by city and dates, see availability and prices, and book rooms. Prevent double booking; searches outnumber bookings 1,000 to 1.

**Z3.4 · Hard · Design · File sync (45 min).** Design a Dropbox-like service: files sync across a user's devices, large files upload efficiently and resume after failures, and edits on two devices are handled.

**Z3.5 · Medium · Design · Top pages in real time (30 min).** A news site wants the 10 most-viewed articles of the last few minutes, from 200,000 views per second, with bounded memory per counting node.

## Part 4: Behavioural and HR

**Z4.1 · Easy · Concept · Your introduction (10 min).** Write and time a 75-second "tell me about yourself" for a final-year student applying for an SDE role, then check it against the rubric.

**Z4.2 · Medium · Concept · Rescue a weak answer (15 min).** Rewrite this answer to "Tell me about a challenge you faced": *"In our college project we had a lot of problems with the database. We all worked hard and stayed up late and finally fixed everything and got a good grade. It taught us teamwork."*

**Z4.3 · Medium · Concept · The awkward questions (15 min).** Answer: "What is your biggest weakness?", "Why should we hire you?", and "You have a gap year on your résumé. What happened?"

**Z4.4 · Hard · Concept · Project deep dive (20 min).** An interviewer picks your main project and asks ten follow-up questions. Prepare the questions they are likely to ask and model answers for a typical final-year project.
