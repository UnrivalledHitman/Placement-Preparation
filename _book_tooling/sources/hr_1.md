# Chapter 4: Question Bank
%The questions asked most often, what they really test, and the core of a good answer

## 4.1 About you and your choices

| Question | Core of a good answer |
|---|---|
| Tell me about yourself | Chapter 2: present, past, future in about 90 seconds |
| What are your strengths? | Two strengths relevant to the role, each with a one-line example ("I learn tools quickly: I learned Spring Boot in three weeks for **[project]**") |
| What is your weakness? | A real but non-critical weakness, plus what you do about it ("I used to over-polish code before getting feedback; now I share early drafts") |
| Why should we hire you? | Match: what the role needs, evidence you have it, and your motivation |
| Where do you see yourself in five years? | Growth in depth (a strong engineer in **[area]**), possibly leading small projects; realistic and linked to the company |
| Why did you choose engineering / your branch? | A genuine reason and how it led to your current interests (IoT, AI, smart energy) |
| Tell me about your final-year project | Problem, your role, design choices, result, what you would improve (Chapter 5) |
| What did you learn from your research paper? | One technical lesson and one about how research is done (checking assumptions, writing clearly, collaborating) |
| Do you plan to study further (MS, MBA)? | Honest but reassuring: you want industry experience first; any future study would build on the work |

## 4.2 About the company and the role

| Question | Core of a good answer |
|---|---|
| Why this company? | Two specific reasons from your research (Chapter 7): its work in a domain you care about, its learning programmes, a product or client area |
| Why should we choose you over others? | Do not compare yourself with others; restate your fit with evidence |
| What do you know about our company? | Business segments, size, a recent development, something you genuinely find interesting |
| Are you willing to relocate? | For service companies, the expected answer is yes; if there are real constraints, state them honestly and early |
| Are you comfortable with night shifts / client time zones? | Honest; most say yes for client-facing projects; ask about rotation if relevant |
| Are you comfortable with the service agreement (bond)? | Read the offer terms beforehand; answer honestly |
| What technologies do you want to work on? | Your preferences, plus openness: "I'd like backend and ML work, and I'm comfortable learning whatever the project needs" |

## 4.3 Behavioural ("tell me about a time")

| Question | Story from your bank | Key point to land |
|---|---|---|
| A challenge you overcame | Hard bug or research setback | Your systematic approach |
| A conflict in a team | Team disagreement story | You listened, used data, kept the relationship |
| A failure | Mistake story | Ownership and what changed afterwards |
| Working under pressure | Deadline story | Prioritisation and communication |
| Leading without authority | Team project | Influence through clarity and example |
| Learning something quickly | Learning story | Method: docs, small experiments, asking for help |
| Disagreeing with a teacher or senior | Feedback story | Respectful, evidence-based, accepted the decision |
| Going beyond what was required | Research or project | Initiative with a result |

## 4.4 Situational ("what would you do if")

| Question | Core of a good answer |
|---|---|
| Your teammate is not contributing and the deadline is close | Talk privately first, understand the reason, redistribute work, escalate to the lead only if needed, protect the deadline |
| You find a bug you introduced in production | Inform the lead immediately, help fix and verify, write down what will prevent it next time |
| A client asks for something you think is wrong | Understand the need, explain risks with evidence, propose an alternative, escalate respectfully |
| You are given a technology you have never used | Plan: official docs, a small prototype, ask colleagues, timebox, report progress |
| You disagree with your manager's technical decision | Share your reasoning with data once, then commit to the decision and make it work |

## 4.5 Practical lessons

- Most questions test the same few qualities: clarity, ownership, learning, motivation.
- Map each behavioural question to a story you already prepared.
- For situational questions, show a sequence: understand, act, communicate, prevent.

# Chapter 5: Presenting Projects and Research
%Three lengths of explanation, the follow-up questions to expect, and how to talk about the escalation-tax paper

## 5.1 Three lengths

| Length | When | Content |
|---|---|---|
| 30 seconds | "Tell me about yourself", HR rounds | Problem, what you built or found, one result |
| 2 minutes | "Tell me about your project" | Problem, your role, approach, key decision, result, next step |
| 10–15 minutes | Technical and hiring-manager rounds | Architecture diagram, design choices and alternatives, failures, metrics, what you would change |

## 5.2 The research paper on model and reasoning-mode selection

Interviewers outside research will judge whether **you** understand the work, not the paper's novelty. Prepare three versions in your own words. The skeleton below uses only what the profile states; fill in your method and results.

| Version | Skeleton |
|---|---|
| 30 seconds | "Large language models differ a lot in cost and quality, and many can also switch to a slower reasoning mode. We studied how to choose the right option per request. A cheap-first strategy pays an **escalation tax** when it fails and escalates. We **[method in one phrase]** and found **[main finding in one phrase]**." |
| 2 minutes | Add: the setting (which models or modes, which tasks), how you measured cost, quality and latency, your own contribution, and one practical recommendation |
| Deep dive | Your experimental design, baselines, metrics, threats to validity, what surprised you, what you would do next |

The ML System Design guide (Chapter 9.2) has a simulation of cascades and the escalation tax that you can use to explain the idea on a whiteboard: always-small, always-large, cascades at different thresholds, and an oracle router as the upper bound.

**Follow-up questions to prepare:**

| Question | Prepare |
|---|---|
| How did you measure quality? | Datasets, metrics, how you avoided bias in judging answers |
| Why does the escalation tax matter in practice? | Cost and latency budgets of real products; when cascades lose to calling the large model directly |
| What would you do differently? | One honest limitation and how you would address it |
| How would you deploy this in a product? | Router as a service, logging, monitoring, A/B test of routing policies |
| What was your contribution versus your co-author's? | Clear and generous: your part, their part, how you worked together |

## 5.3 Projects worth building from this repository

If you need more portfolio projects, the books in this repository contain complete starting points. Build them yourself (do not copy), put them on GitHub with a clear README, and measure something.

| Project | Source | What to show |
|---|---|---|
| Smart-meter REST API (Spring Boot) | Backend guide, Chapter 10 | Idempotent ingestion, late data, daily aggregates, tests, Docker |
| LLM router with cost and quality dashboard | ML System Design guide, Chapter 9.2 | Real models or simulations, escalation tax measured, threshold chosen by data |
| Demand-forecasting notebook with quantile forecasts | ML System Design practice book, M7.4 | Backtests, pinball loss, plots |
| LRU/LFU cache and rate limiter library | Low-Level Design guide | Clean design, concurrency tests |

## 5.4 Practical lessons

- Prepare every project and the paper at 30 seconds, 2 minutes and 15 minutes.
- Explain your own contribution precisely and credit collaborators.
- Bring numbers: latency, accuracy, cost, users, time saved.

# Chapter 6: The Resume
%One page, impact bullets, and the details that pass both software filters and human readers

## 6.1 Structure for a fresher

| Section | Content | Tips |
|---|---|---|
| Header | Name, phone, email, LinkedIn, GitHub, city | No photo, date of birth or full address needed for most companies |
| Education | B.Tech **[branch]**, Narula Institute of Technology, Kolkata, **[years]**, CGPA **[x.xx]**; Class 12 and 10 with percentages if asked by the company | Most recent first |
| Skills | Languages (Java, Python, SQL), frameworks (Spring Boot, PyTorch, scikit-learn), tools (Git, Docker, Linux), concepts (DSA, DBMS, OS, networks) | Only what you can be tested on |
| Projects | 2–3 projects, each 2–3 bullets with technology and result | Link to GitHub |
| Research / publications | The paper with co-author, venue **[venue or "under review"]**, year, link | State the status accurately |
| Experience | Internships, freelance or open-source work | If none, projects carry this section |
| Achievements | Hackathons, competitive programming ratings, certifications that required effort | Numbers: rank, rating, participants |

## 6.2 Impact bullets

Formula: **action verb + what you built or did + how (technology) + measurable result**.

| Weak | Strong (fill in real numbers) |
|---|---|
| Worked on a smart-meter project | Built a Spring Boot REST API for smart-meter readings with idempotent batch ingestion and daily aggregates; **[N]** tests, Dockerised, **[result]** |
| Did research on LLMs | Co-authored a paper on selecting LLMs and reasoning modes per request; quantified the "escalation tax" of cheap-first cascades on **[tasks]**, **[finding]** |
| Made a machine-learning model | Trained a gradient-boosted classifier for **[task]**, improving PR-AUC from **[x]** to **[y]** with time-based validation |
| Good at teamwork | (Remove: show teamwork through project bullets instead) |

## 6.3 Passing applicant tracking systems

| Do | Avoid |
|---|---|
| A single-column layout with standard headings | Tables, text boxes, icons and two-column templates that break parsing |
| Keywords from the job description, where they are true | Keyword stuffing or skills you cannot discuss |
| PDF with selectable text, named `Firstname_Lastname_Resume.pdf` | Scanned images, Word files with tracked changes |
| One page | Two pages as a fresher |

## 6.4 Practical lessons

- One page, reverse chronological, every line defensible in an interview.
- Bullets show impact with numbers; adjectives without evidence are noise.
- Tailor the skills and project order to each role.

# Chapter 7: Company Research, Questions and Offers
%Preparing company-specific answers, asking good questions, and understanding an offer

## 7.1 Researching a company in 30 minutes

| Look at | For |
|---|---|
| Careers page and the specific job description | Required skills; words to reflect in your answers |
| Annual report or investor page (listed companies) | Business segments, revenue mix, strategy, large clients or industries |
| Engineering blog and recent news | Technologies and products you can mention |
| Glassdoor, AmbitionBox, seniors from your college | Interview format, roles, training programme, locations |

Write three lines per company: what it does, why you want it, and one recent development. These answer "why us?" and "what do you know about us?" convincingly.

## 7.2 Questions to ask the interviewer

| Good questions | Avoid as first questions |
|---|---|
| What does the first six months look like for a new engineer in this team? | How many leaves do I get? |
| What technologies and practices does the team use (testing, code review, deployment)? | Can I switch projects immediately? |
| How is performance measured for freshers? | Questions answered on the careers page |
| What do you enjoy most about working here? | — |

## 7.3 Offers for freshers

| Item | What to check |
|---|---|
| CTC versus in-hand | CTC includes employer PF, gratuity, variable pay, sometimes joining bonus; ask for the monthly in-hand estimate |
| Variable and joining bonus | Conditions and clawback if you leave early |
| Service agreement (bond) | Duration and amount; read it before accepting |
| Location and role | Whether location is fixed or assigned after training |
| Training | Duration, location, whether performance in training affects confirmation |
| Joining date | Whether it can change; keep written communication |

Fresher salaries at large service companies are usually fixed by band, so negotiation is rare; product companies and startups may have more room. If you negotiate, do it once, politely, with a reason (a competing offer or specific market data), after receiving the written offer.

## 7.4 Practical lessons

- Three lines of research per company make "why us?" easy.
- Ask about the work, the team and growth.
- Read the whole offer: in-hand pay, bonuses, bond, location, training.

# Chapter 8: Checklists
%The day before, the day of an online proctored interview, and afterwards

## 8.1 The day before

| Item | ✓ |
|---|---|
| Resume printed or open; every line rehearsed | |
| "Tell me about yourself" practised out loud, 60–90 seconds | |
| Six STAR stories reviewed | |
| Company notes: what it does, why you want it, one recent development | |
| Two or three questions for the interviewer | |
| Project and paper explanations at 30 seconds and 2 minutes | |
| Documents ready: ID, mark sheets, offer or call letter as required | |

## 8.2 Online and camera-proctored rounds (TCS iON and similar)

| Item | ✓ |
|---|---|
| System check done the day before with the official link; browser and plugins updated | |
| Stable internet with a backup (mobile hotspot) | |
| Quiet, well-lit room; plain background; nobody entering | |
| Camera at eye level, face fully visible; no second screen, phone away unless allowed | |
| Government ID at hand for verification | |
| Logged in 15–30 minutes early | |
| Know the rules: switching tabs or looking away repeatedly can be flagged | |

## 8.3 During the interview

| Do | Avoid |
|---|---|
| Listen fully; ask for a moment to think if needed | Answering a different question than the one asked |
| Answer in structure: point, example, result | Monologues longer than two minutes without a check-in |
| Say "I don't know, but here is how I would find out" when true | Bluffing |
| Smile, sit upright, look at the camera when speaking online | Reading from notes on screen |

## 8.4 Afterwards

| Item | ✓ |
|---|---|
| Write down every question asked and how you answered | |
| Note what to improve; update your story bank | |
| Thank-you note to the recruiter if appropriate (product companies) | |
| Track status and deadlines in one place | |

## 8.5 Practical lessons

- Prepare once, deeply: profile, stories, projects, company notes.
- For online rounds, the technical setup is part of the interview.
- After every interview, improve one answer.
