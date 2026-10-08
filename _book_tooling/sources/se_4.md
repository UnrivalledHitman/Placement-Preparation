# Chapter 9: Writing and Communication
%Design docs, RFCs, and the written word as an engineer's highest-leverage tool

## 9.1 Writing is thinking, and it scales

As scope grows, the written word becomes an engineer's most powerful tool. Code affects one system; a clear design doc aligns a team; a good RFC shapes an organisation. Writing has leverage that talking lacks: it is **asynchronous** (people read it in their own time, across time zones), it **persists** (the decision and its reasons are there next year), it **scales** (a thousand people can read what you wrote once), and it **forces clarity** (you cannot write a muddled explanation of a clear idea; the act of writing exposes the gaps in your thinking before they become gaps in the system). Many senior engineers find that writing the design doc is where the design actually gets figured out.

Engineers often undervalue this because they were hired to code. But the higher you go, the more your impact flows through documents, proposals and messages. A brilliant idea that cannot be communicated has no impact; a clearly written good idea spreads on its own.

## 9.2 Write for the reader

The core skill is **empathy for the reader**: what do they already know, what do they need, what question are they trying to answer, how much time do they have? From that:

- **Lead with the point** (BLUF: bottom line up front). Busy readers, especially senior ones, want the conclusion and the ask first, then the supporting detail. Do not build up to the recommendation at the end of ten pages; state it, then justify it.
- **Know your audience and purpose.** A design doc for peers, a proposal for a VP, and an incident update for support each need different depth, framing and vocabulary. Translate: engineers hear "eventual consistency"; an executive hears "the dashboard may lag reality by a few seconds, which is fine for this use".
- **Structure it.** Headings, short paragraphs, lists and a summary let readers navigate and skim. A wall of text is rarely read.
- **Be concise.** Cut every word that does not earn its place. Shorter is more likely to be read and understood. (Edit ruthlessly; the first draft is always too long.)
- **Prefer concrete over abstract.** An example, a number, a diagram beats a paragraph of abstraction. "It's slow" is weak; "the p99 is 2.3 s, users abandon at 1 s" is a case.

## 9.3 The design document

For any non-trivial piece of work, writing a design doc before building is one of the highest-return habits in engineering. It gets feedback when change is cheap (before code), creates alignment (everyone agrees on what and why), and leaves a durable record. A common structure:

| Section | Answers |
|---|---|
| **Context / problem** | What problem, for whom, why now? What happens if we do nothing? |
| **Goals / non-goals** | What this will and explicitly will **not** address (scoping out is as important as scoping in) |
| **Requirements & constraints** | Functional and non-functional; the scale numbers; deadlines; dependencies |
| **Proposed design** | The approach, with a diagram; how it works; the key decisions |
| **Alternatives considered** | Other options and **why they were rejected** (this is what reviewers scrutinise, and it shows you did the thinking) |
| **Trade-offs & risks** | What this costs, what could go wrong, how it is mitigated |
| **Rollout, testing, operability** | How it ships safely, how it is tested, how it is monitored and rolled back |
| **Open questions** | What is still undecided, where input is wanted |

The **alternatives** and **trade-offs** sections are where seniority shows: anyone can describe one design; a senior engineer shows the options they weighed and why this one, honestly including its downsides. Share the draft early and invite dissent; a design doc is a conversation, not a decree.

## 9.4 Disagreeing and persuading in writing

Senior engineers influence decisions they do not control, which means persuading, often in writing and often across disagreement. Effective technical persuasion:

- **Lead with the shared goal**, then show how your proposal serves it better. People resist being told they are wrong; they accept a better path to what they already want.
- **Argue with evidence**, not authority or volume: data, a prototype, a cost, a reference to a past incident. "I think" is weak; "here's the benchmark" is strong.
- **Steelman the other side**: show you understand the strongest version of the opposing view before arguing against it. It builds trust and often reveals you were partly wrong.
- **Separate the decision from the ego**, yours and theirs. Make it about the best outcome, not about who was right.
- **Disagree and commit**: argue hard for your view, but once a decision is made (even against you), support it fully. Re-litigating settled decisions corrodes teams; the exception is new information, which is a reason to reopen, stated as such.

## 9.5 Communication as a force multiplier

Beyond documents, senior engineers raise the whole team's effectiveness through everyday communication: clear PR descriptions and commit messages (the next reader's context), good questions in meetings that surface hidden assumptions, status updates that let others plan, and knowledge shared freely (talks, docs, pairing) so expertise is not a bottleneck. The best senior engineers are **teachers**: they make everyone around them more capable, which is the multiplier of Chapter 1 in action. Hoarding knowledge makes you briefly indispensable and permanently a bottleneck; sharing it makes the team strong and frees you for bigger things.

## 9.6 Practical lessons

- Writing is leverage: asynchronous, persistent, scalable, and it forces the clarity that exposes flawed thinking.
- Write for the reader: lead with the point, match audience and purpose, structure it, be concise and concrete.
- Write a design doc before non-trivial work; the alternatives and trade-offs sections are where seniority shows.
- Persuade with shared goals, evidence and steelmanning; separate ego from decision; disagree and commit.
- Share knowledge generously; teaching multiplies the team and is the clearest senior behaviour.

# Chapter 10: Working Through People
%Mentoring, collaboration, and leading projects without being a manager

## 10.1 Technical leadership without authority

A senior engineer is a leader whether or not anyone reports to them. This **leadership without authority** means getting people aligned and moving by influence, trust and credibility rather than by command. You cannot order peers; you earn their followership by being reliably right, by helping them succeed, by communicating clearly, and by putting the team's outcome above your own credit. The currency is trust, and it is earned slowly through consistent competence and generosity, and lost quickly through broken commitments or making others look bad.

The engineer/manager split: managers own people, priorities and process; senior and staff engineers own the **technical** direction, the hard problems, and raising the bar. The best outcomes come from the two working as partners, each covering what the other cannot. A senior engineer makes their manager's job easier by owning the technical risk and surfacing issues early, and expects support on priorities and obstacles in return.

## 10.2 Mentoring and growing others

Growing other engineers is one of the highest-leverage things a senior person does: a junior you help become great will, over a career, produce vastly more than you could alone, and the multiplier compounds as they in turn grow others.

- **Teach how to think, not just the answer.** Handing someone the fix solves today's problem; showing them how you diagnosed it grows them. When asked a question, sometimes ask a guiding question back. The aim is to make yourself **unnecessary** for that class of problem.
- **Give work that stretches** just beyond current ability, with enough support to succeed. Too easy bores; too hard breaks confidence. Growth lives at the edge.
- **Let them struggle productively**, and fail safely. Jumping in too early robs the learning; rescuing before real harm protects it. Calibrate by the cost of the failure.
- **Give feedback that is specific, kind and actionable**, soon after the event, on behaviour not character. Praise in public, correct in private. And ask for feedback on yourself; it models that feedback is a gift, not a threat.
- **Sponsor, not just mentor**: advocate for people when they are not in the room, put their name forward for opportunities, give them credit. Advice helps; opportunity and visibility change careers.

## 10.3 Psychological safety and how teams actually perform

Google's research on what makes teams effective found the top factor was not talent or experience but **psychological safety**: whether people feel safe to take risks, admit mistakes, ask "dumb" questions and disagree without fear of humiliation. On a safe team, problems surface early (someone says "I think I broke prod" immediately, not after hours of hiding it), people ask before guessing, and bad ideas get challenged. Senior engineers create this by example: admit your own mistakes and knowledge gaps openly ("I don't know, let's find out"; "I got this wrong"), respond to questions and errors with curiosity rather than judgement, never punish the messenger, and make it clear that the enemy is the problem, not any person. A senior engineer who belittles questions or blames people single-handedly destroys the team's safety and, with it, its performance.

## 10.4 Collaboration and conflict

- **Assume good intent.** Almost everyone is trying to do good work with the information they have. Interpreting a terse comment or a different approach as hostility poisons collaboration; assume competence and good faith, and ask before concluding.
- **Make conflict about ideas, not people.** Technical disagreement is healthy and produces better decisions; personal conflict is corrosive. Keep debates on the merits, and when they get heated, slow down, restate the other view fairly, and refocus on the shared goal.
- **Build relationships before you need them.** Trust and goodwill across teams, built in calm times, are what let you get help and resolve conflict under pressure. The engineer who only ever appears to ask for favours gets fewer.
- **Give credit generously and take blame readily.** "The team shipped it" and "that was my miss" both build the trust that makes you someone people want to work with, and cost you nothing real.

## 10.5 Leading a project

Senior engineers are often the **technical lead** of a project: responsible for it succeeding technically, without being everyone's manager. The job:

- **Break the work down** into pieces that can be parallelised, with clear interfaces so people can work independently (Chapter 4's design, applied to the work itself).
- **Sequence by risk and dependency**: do the scary, uncertain, blocking things first, so surprises surface while there is time to react, not the week before launch. De-risk early.
- **Keep everyone aligned**: a shared understanding of the goal, the plan and the current state; surface blockers fast; adjust as you learn.
- **Communicate status honestly**, especially bad news early. "We're going to be two weeks late" said now is a manageable problem; said the day before the deadline, it is a crisis and a trust failure.
- **Do the glue work**: the unglamorous integration, the flaky-test fix, the doc nobody wants to write, the follow-ups. Picking up the dropped pieces so the project succeeds is a core senior behaviour, and it is noticed.

## 10.6 Practical lessons

- Lead by influence and trust, not authority; earn followership by being reliably right and helping others succeed.
- Mentor by teaching how to think, stretching people safely, giving specific kind feedback, and sponsoring them.
- Create psychological safety by owning your mistakes and gaps; it is the top driver of team performance.
- Assume good intent, keep conflict on ideas, build relationships early, give credit and take blame.
- Lead projects by decomposing, de-risking early, aligning, communicating bad news early, and doing the glue work.

# Chapter 11: Career Growth and Senior Interviews
%Growing deliberately, getting promoted, and interviewing for senior roles

## 11.1 Grow on purpose

Careers do not advance by doing your assigned work well and waiting. They advance by deliberately building skills, taking on larger scope, and making your impact visible. Own your growth: do not wait to be told what to learn or to be handed a bigger role.

- **Seek scope, not just tasks.** Volunteer for the ambiguous, important, slightly-too-hard problem; that is where growth and visibility live. Operating above your level is how you get promoted to it.
- **Build the T** (Chapter 2): go deep somewhere valuable, keep widening your breadth. Follow curiosity, but bias toward what your team and the business need.
- **Learn continuously but durably.** Invest most in **fundamentals and transferable skills** (how systems work, design, communication, how to learn) that outlast any framework, and enough in current tools to be effective. The specific hot technology changes; the ability to pick it up quickly does not.
- **Learn from production and incidents**, from reading great code and designs, from people better than you, and from writing and teaching (which forces understanding). Reflection turns experience into skill; ten years of not reflecting is one year repeated ten times.

## 11.2 Getting promoted

Promotion to senior and beyond usually recognises that you are **already operating at the next level**, so the path is to do the next level's work now and make it visible.

- **Operate at the level before you have the title.** Take the scope, own the outcomes, show the behaviours. The title follows evidence.
- **Make impact visible**, honestly. Quiet excellent work can go unseen; keep a record of what you did and its outcomes (the numbers, the incident prevented, the people grown), share progress, and give credit in a way that also shows your part. This is not self-promotion for its own sake; it is making sure good work is known so it can be rewarded and built on.
- **Understand your company's ladder.** Read the levelling guide; know what senior means **here** and what evidence the promotion process wants; talk to your manager about the gap and get specific agreement on what would close it.
- **Find sponsors**, senior people who will advocate for you in rooms you are not in. Do good work *and* make sure the right people know its value.
- **Be patient but not passive.** Promotions run on cycles and need accumulated evidence; you cannot force one overnight. But if you are consistently operating above your level with no path forward, that is information about whether to stay.

## 11.3 Interviewing for senior roles

Senior interviews test more than coding. Expect, and prepare for, several dimensions:

- **Coding**, still: data structures and algorithms, clean working code, clear thinking out loud. Seniority does not excuse you from fundamentals, but the bar is also on communication and judgement, not just the optimal solution. (The DSA guide in this series.)
- **System design**: the big one for senior roles. They want to see you clarify requirements, estimate scale, propose an architecture, and above all **discuss trade-offs** and justify decisions. There is no single right answer; they are assessing how you think. (The system-design and back-end guides.) Drive the conversation, state assumptions, and go deep where asked.
- **Behavioural / leadership**: structured stories (the STAR format: Situation, Task, Action, Result) about leading a project, handling conflict, a failure and what you learned, mentoring, a hard technical decision, influencing without authority. Prepare a bank of real stories mapped to these themes in advance; vague answers signal shallow experience. (The interview and HR guide.)
- **Deep-dive on your experience**: expect to go deep on something you built, the decisions, the trade-offs, what you would do differently. Know your own work cold, including its weaknesses, and be honest about them; owning a mistake and its lesson lands better than a flawless story.

Across all of them, senior interviews reward **communication, structured thinking, honest trade-off reasoning and ownership** as much as raw technical answers. Show how you think, not just what you know.

## 11.4 Sustaining a career

- **Protect against burnout.** A career is a marathon; sustained overwork degrades judgement and health and is not heroism. Work hard in focused bursts, rest genuinely, and build systems (automation, delegation, saying no) rather than relying on heroics. The engineer who is calm and reliable over years beats the one who burns bright and flames out.
- **Say no, with reasons.** As you become more capable you are asked to do more; protecting focus for what matters most, and declining the rest gracefully with the trade-off made explicit, is a senior skill. Yes to everything means excellence at nothing.
- **Keep perspective.** Technology is a means; the point is building things that help people and working with people you respect. The specifics will change many times over a career; the fundamentals, the relationships and the reputation for good judgement and integrity are what endure.

## 11.5 Practical lessons

- Grow on purpose: seek scope, build the T, invest most in durable fundamentals and transferable skills, and reflect to turn experience into skill.
- Get promoted by operating at the next level first, making impact visible and understood, knowing the ladder, and finding sponsors.
- Senior interviews test coding, system design (trade-offs above all), leadership stories (prepare a STAR bank) and deep dives on your work.
- Across interviews, communication, structured thinking, honest trade-offs and ownership matter as much as technical answers.
- Sustain the career: guard against burnout, say no with reasons, and keep perspective; judgement, relationships and integrity endure.
