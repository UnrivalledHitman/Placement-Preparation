## Part 5 solutions

### G5.1 Explaining to a VP

Translate the internal work into the VP's language: outcomes, not mechanisms. Lead with the bottom line and the business impact:

> "Our dashboard is getting slow as we grow, and slow pages lose users; two weeks of work (caching and a read replica) will cut load times from ~3 seconds to under half a second and let us handle 5× the traffic without buying bigger servers, which also saves cost. Without it, we'll hit a wall in a couple of months and it'll be a fire drill. I'd like to fit it in this sprint."

Note what it does: it leads with the point and the ask (BLUF), frames the work as a **business outcome** (user retention, scale, cost, avoiding a crisis) rather than as "caching and a read replica", quantifies it, and names the cost of **not** doing it. The VP does not need to understand replicas; they need to understand that this protects growth and prevents a predictable emergency. Never argue infrastructure work on its technical merits to a non-technical audience; argue it on the outcome they care about.

### G5.2 Your writing

The exercise is personal, but the model answer shows the transformation. A typical "before" opening builds up: "Over the last few weeks we've been looking at the performance of the reporting service. We profiled several endpoints and found a number of issues across the query layer and the serialisation code. After discussion we think there are a few options..." A busy reader is three sentences in with no point yet. The **BLUF** rewrite: "**Recommendation: add a 5-minute cache to the reports API; it cuts p95 from 4 s to 300 ms for one day's work. Details below.**" The conclusion and the ask are in the first line; the profiling, options and trade-offs follow for those who want them. Apply the test: can a reader get the key message and the decision needed in ten seconds? If they have to read to the end to find out what you want, rewrite the opening.

### G5.3 Influencing without authority

You have no mandate, so you lead with influence (Chapter 10): shared goal, evidence, and making adoption easy, winning one team at a time.

1. **Start from the shared pain**: inconsistent error formats make every client handle five different shapes, cause bugs, and slow debugging across teams. Everyone already wants this fixed; you are offering the path.
2. **Do the work to make it easy**: write a short proposal (an RFC) with the proposed format (ideally a standard like RFC 9457 Problem Details), and, crucially, build a **small shared library or middleware** that produces it, so adopting is a one-line change, not a rewrite. Lowering the cost of adoption is most of the battle.
3. **Win one team first**: get the most receptive team (or your own) to adopt it and demonstrate the benefit, creating a reference and momentum rather than arguing in the abstract.
4. **Bring data and allies**: show the reduced client code, the caught bugs; get a respected senior or two to back the RFC; address objections by steelmanning them.
5. **Let it spread**: with a good standard, an easy library, a working example and some advocates, other teams adopt because it is obviously better and cheap, not because they were ordered to.

The anti-patterns: mandating it (you cannot, and resentment follows), or writing a beautiful spec nobody adopts because it is work. Make the right thing the easy thing.

### G5.4 The struggling junior

Quietly fixing their bugs is a mistake on two counts. First, you are **robbing their growth**: they learn nothing from a bug you fix for them, so the dependency continues and they stay junior. Second, you are making yourself a **bottleneck** and masking a problem (their struggle) that their manager and the team should know about. The short-term time saving creates a long-term cost.

What to do instead (Chapter 10): shift from fixing to **teaching how to think**. When they bring a bug, sit with them and walk through how **you** would diagnose it, asking guiding questions ("what does the error say? what did you expect? how could we check which half is wrong?") so they learn the method, not just the answer. Give them slightly-stretching work with support, and let them struggle productively (stepping in before real harm, not before the learning). If the deadline is at genuine risk, be transparent with your lead about the capacity and the ramp, rather than silently carrying them. The goal is to make yourself **unnecessary** for that class of problem, which is the opposite of what quietly fixing their bugs achieves.

### G5.5 The hidden mistake

This is a symptom of **low psychological safety** (Chapter 10): a teammate hid their likely role in an incident because they feared blame, which means the team's environment punishes (or is perceived to punish) mistakes. That is dangerous: when people hide problems, incidents get worse, root causes go unaddressed, and the organisation cannot learn or improve. The individual is not the problem; the **environment** is.

What to do: first, reassure this person privately and genuinely, that owning it is valued, not punished, and encourage them to add what they know to the postmortem, framed as learning. Then work on the **system**: make sure the postmortem process is visibly blameless (focus on why the system allowed it, never on who); as a senior person, **model** it by openly owning your own mistakes and gaps, so others see it is safe; and watch how leadership reacts to errors, because one public blaming undoes months of safety. The fix is not to get this one person to confess; it is to build an environment where the next person does not hesitate, because surfacing problems early is exactly what you want.

### G5.6 Conflict on the merits

As tech lead, break the deadlock by moving it off personalities and onto the shared goal and evidence. Steps: get both in a room (or a doc) and **restate the shared goal** they are both serving ("we both want reliable processing that scales; we're debating how"). Make each **steelman the other's option** to show the disagreement is about trade-offs, not competence, and to defuse the personal edge. Then pin the decision to **criteria and data**: what are the actual requirements (latency, throughput, failure behaviour, complexity, operability)? If it is unclear, a quick **prototype or benchmark** of the contested path often settles it faster than more arguing. Where it is a genuine judgement call with no clear winner (often it is a **two-way door**, reversible later), **make the call** as tech lead, explain the reasoning, and ask both to **disagree and commit**; dragging it out costs more than either option's downside. Afterwards, if it was getting personal, a quiet word with each about keeping debate on the merits. The job is to reach a good-enough decision and unblock the team, not to find the theoretically perfect answer or to let two strong engineers burn the project down over it.

### G5.7 Late news

Communicate **now**, as soon as you are confident of the new estimate, to your **manager and the project's stakeholders** (whoever is depending on the original date). Early bad news is a manageable planning problem; late bad news is a crisis and a breach of trust. The message is honest, specific and solution-oriented: what you now expect (nine weeks, not six), **why** (the specific thing that turned out harder or was missed), what you have considered to mitigate (cut scope? add help? phase the delivery?), and what you need (a decision on scope vs date). Do not hide it hoping to catch up; "we might be a bit late" whispered now beats "we missed the deadline" announced on the day. Surfacing risks early, with options, is a core senior behaviour (Chapter 10); it lets others replan while there is still time, and it builds the trust that makes people believe your estimates in future. The failure mode is optimism that delays the news until no one can react.

## Part 6 solutions

### G6.1 Your T

Personal, but a strong answer is specific. **Depth** is where you solve the hardest problems others bring to you: name it concretely ("backend data systems: I'm the person who debugs the gnarly database and concurrency issues"), not vaguely ("backend"). **Breadth** is what you can competently design across and discuss with other teams: list the areas where you are functional but not expert (front end, infra, ML, security). The valuable self-assessment is the two gaps: the depth most valuable to your team (maybe it is not your current depth, maybe the team needs someone deep in reliability and you could become that) and the breadth gap most limiting you (if you cannot reason about the front end at all, you cannot design full features). A senior engineer grows the T **deliberately** toward what their team and the business need, not just toward what is fun.

### G6.2 The promotion gap

Two cycles operating at senior level without promotion means a gap somewhere: in the evidence, in its visibility, in the company's process, or in your self-assessment. Act on it rather than waiting. Have a **direct conversation with your manager**: "I believe I'm operating at senior level. What specifically is the gap between where I am and promotion, and what concrete evidence does the committee want to see?" Get **specific, written criteria**, not vague encouragement. Then **gather evidence** against those criteria (the ambiguous projects you owned, the people you grew, the incidents you prevented, with outcomes), and make your impact **visible** (shared docs, credit, keeping a record). Find **sponsors**, senior people who will advocate for you in the committee. Be patient through a cycle or two, since promotions run on evidence and timing you cannot force. But set yourself a **horizon**: if you are consistently operating above your level, have closed the stated gaps, and still see no path after a reasonable time (say a year of genuine effort and clear criteria), that is real information that the environment may not reward you, and considering a move, internally or externally, is rational. Do not confuse patience with passivity.

### G6.3 A STAR story bank

The behavioural themes a senior interview probes, each with a one-line STAR skeleton (fill with your real stories):

| Theme | S / T / A / R (one line) |
|---|---|
| **Leadership** | A stalled cross-team project → I was asked to lead it → aligned the teams on a plan, drove execution → shipped in X, now serving Y. |
| **Conflict** | Two engineers deadlocked on an approach → I had to unblock it → reframed to the shared goal, ran a quick benchmark, decided → shipped, both bought in. |
| **Failure** | My deploy caused an outage → I had to fix and learn → mitigated fast, ran a blameless postmortem, added a guardrail → no recurrence, and I learned X. |
| **Mentoring** | A junior was stuck and dependent → grow them to independence → taught the diagnosis method, gave stretch work → they now lead their own features. |
| **Hard decision** | Build vs buy under a deadline → choose and justify → weighed trade-offs, chose the simpler path, wrote an ADR → shipped on time, held up well. |
| **Influence without authority** | Inconsistent practice across teams → standardise it with no mandate → wrote an RFC, built an easy library, won one team first → adopted widely. |

Identifying your **weakest** theme is the real value of the exercise: prepare that one hardest, with a genuine story and an honest lesson. Vague or hypothetical answers signal shallow experience; specific stories with a measurable result and a reflection signal seniority.

### G6.4 The system-design round

Before drawing a single box, do these four things, because they are what the interview is actually assessing:

1. **Clarify requirements.** Functional (shorten a URL, redirect, custom aliases, analytics?) and non-functional (how reliable, how fast must redirects be?). Pin down scope; "design a URL shortener" is deliberately vague to see if you narrow it.
2. **Estimate scale.** Reads vs writes (hugely read-heavy: many redirects per shorten), requests per second at peak, how many URLs over years, storage. The numbers drive the design; a shortener at a thousand URLs and at a trillion are different systems.
3. **Name the core API and data.** `POST /shorten` → short code; `GET /{code}` → redirect. The key generation (counter + base62, or hash) and the mapping store (a key-value lookup, read-optimised, cached) are the heart; identify them.
4. **State your assumptions explicitly** and check them with the interviewer ("I'll assume read-heavy, redirects must be <50 ms, eventual consistency is fine for analytics"). This makes your reasoning visible and invites correction.

These matter more than the diagram because the interview assesses **how you think**, not whether you can draw a standard architecture: clarifying the problem, estimating scale, and reasoning about trade-offs are the senior signals. Candidates who leap to boxes without requirements or numbers are the ones who fail. Then design, discuss the trade-offs (how to generate keys without collisions, how to scale reads with caching and replicas, how to handle the hot keys), and go deep where asked.

### G6.5 Learning durably

Personal, but the framework is the answer. Sort your recent learning into **durable** (fundamentals and transferable skills: how databases/networks/distributed systems work, design, debugging, writing, how to learn a new thing fast, the maths behind ML) and **perishable** (this year's specific framework, library version, or tool). Both matter, you must be effective with current tools, but the balance should favour durable investment, because the specific React/Spring/Kubernetes version will be replaced several times over a career while the fundamentals compound and transfer. If your two years were almost all chasing specific tools, rebalance toward fundamentals (read the classic texts, understand the layer beneath the framework you use, practise design and writing). The engineer who deeply understands systems picks up any new framework in weeks; the one who only knows frameworks is stranded each time the industry moves. Depth in fundamentals is the most durable career investment.

### G6.6 Saying no

Protecting your focus is a senior skill, and it does not require being unhelpful. Techniques: **say no with the trade-off made visible**, not a flat refusal, "I can't jump on this today without dropping the migration that's due Friday; which should take priority?", which puts the choice where it belongs. **Redirect** rather than absorb: point them to the docs, the right person, or a time-boxed answer ("here's the 5-minute version; if it needs more, let's schedule it"). **Teach instead of do** (G5.4): a quick lesson in how to debug it saves you the next five interruptions too. **Batch and protect**: hold office hours or a focus block so you are reliably available at known times and reliably heads-down otherwise, instead of being interrupted all day. And remember that **yes to everything is excellence at nothing**; a senior engineer who never protects focus becomes a scattered bottleneck. The goal is to stay genuinely helpful (which builds the trust seniority runs on) while guarding the deep-work time that your highest-leverage work needs, declining gracefully and with a reason, never curtly.

### G6.7 Burnout check

Personal, but a good answer names **signs** and a **system**, not just "work less." Signs to watch in yourself: persistent exhaustion that rest does not fix, cynicism or dread about work you used to enjoy, declining quality and slower thinking (a key one, tired judgement is worse judgement), irritability, neglecting health and relationships, working long hours but achieving less. The crucial point (Chapter 11): rely on **systems, not willpower**, because willpower fails under pressure. Examples of a system: a hard boundary on hours or a shutdown ritual; delegating and teaching so you are not the single point of failure; automating the toil that eats your time; saying no with reasons (G6.6) so your load is sustainable; taking real breaks and real holidays (fully disconnected). A career is a marathon; the calm, reliable engineer who sustains good judgement over years outperforms the one who burns bright and flames out, and protecting your own sustainability is not weakness but the condition for long-term impact.
