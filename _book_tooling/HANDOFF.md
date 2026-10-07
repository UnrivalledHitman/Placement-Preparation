# Placement Prep Book Series: Handoff for the Next Session

This file gives a new Claude Code session (cloud or local) everything needed to continue the book series **in exactly the same style, with the same tooling**. Everything referenced here is in this repository: the tooling scripts and the markdown sources of the books built so far are in `_book_tooling/`.

**Suggested first message for the new session:**

> "Read `_book_tooling/HANDOFF.md` fully. Set up the tooling as described in section 6, rebuild one finished book to check the setup works, then continue with set 4 (Backend stack) following the house style and workflow. Commit and push each finished set, then stop and wait for my instructions after each set."

---

## 1. About the learner

- **Name:** Indrajeet, a student at Narula Institute of Technology, Kolkata. Git identity: Indrajeet Mondal.
- **Interests:** IoT, AI, smart energy systems. Has submitted a research paper on LLM model / reasoning-mode selection ("escalation tax"), co-authored with Suseta Datta.
- **Near-term exam:** TCS CPA (Java), 15 October 2026, camera-proctored.
- **Main goal:** placement at product-based companies (SDE, with an AI/ML portfolio), plus service-company tests (TCS NQT).
- **Languages:** Java is the interview language; Python for AI/ML.
- **Agreed study plan:** a 12-week DSA + SQL roadmap from 19 Oct 2026 to 10 Jan 2027 at 2–3 hours a day; the AI/ML track runs on weekends during it and full-time afterwards.

## 2. The repository

GitHub: `UnrivalledHitman/Placement-Preparation`, branch `main`. Everything is **numbered in the order it should be studied**: sections `01`–`07`, the folders inside each, and the files inside each folder.

```text
Placement Preparation/
├── 01_Quantitative_Aptitude/   01_Chapter_Wise (11 topics), 02_Mixed_Sets (20)
├── 02_Verbal_Ability/          01_Topic_Wise (7), 02_Mixed_Sets (6)
├── 03_Programming/             01_Java (5 PDFs), 02_MySQL (4 PDFs)
├── 04_CS_Fundamentals/         01_Operating_Systems, 02_Computer_Networks, 03_DBMS_Theory
├── 05_System_Design/           01_Low_Level_Design, 02_High_Level_Design
├── 06_AI_and_Machine_Learning/ 01_AI_ML, 02_Deep_Learning
├── 07_Business_and_Finance/    01_Parable_of_the_Pipeline, 02_Cashflow_Quadrant (book + study report each)
├── _book_tooling/              this handoff, build scripts, markdown sources (not study material)
└── README.md                   index: folder tree, one section per top-level folder, tables linking every PDF
```

Conventions to keep:

- File names: `NN_Descriptive_Name.pdf`, numbered by study order inside the folder (guide = `01_..._Complete_Guide.pdf`, practice book = `02_..._Practice_Book.pdf`).
- When adding a section, renumber later sections with `git mv` (keeps history) and update every README path.
- **README**: update the folder tree, add a table row (`| NN | [Guide title](path) | [N exercises with hints and solutions](path) |`), and a sentence explaining the order. After every change, check that every link resolves and that the number of links equals the number of PDFs. The check is a one-line shell loop over `grep -oE '\]\([^)]+\.pdf\)' README.md`.
- Commit messages: a summary line, a blank line, bullet points, then the line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Commit and push each finished set. The user has asked for a stop after each set, to give the next instruction.

> NOTE: The handoff the user received from an earlier chat listed 18 finished PDFs, including `DSA_in_Java_Complete_Guide.pdf` and `DSA_in_Java_Practice_Book.pdf`. Those two DSA books are **not in this repository**. If the user adds them, a natural place is `03_Programming/03_DSA_in_Java/` (after Java and MySQL), but ask first.

## 3. What has been done

### 3.1 Earlier sessions (before this tooling existed in the repo)

Java guide, Java exam revision, Java practice book, Java classes-and-methods reference, TCS CPA Java practice sets, MySQL guide, MySQL exam revision, MySQL practice book, AI/ML guide and practice book, Deep Learning guide and practice book, Operating Systems guide and practice book, Computer Networks guide and practice book (all in the repo), plus the DSA pair (not in the repo). Their markdown sources are **not** available; only the PDFs.

The **MySQL Commands and Functions reference** (`03_Programming/02_MySQL/02_...Reference.pdf`) was built differently, with an HTML → Edge print pipeline, and its outputs were computed by hand because no MySQL server was available. It is the one book whose outputs were not executed.

### 3.2 This session: three sets built with this tooling (sources in `_book_tooling/sources/`)

| Set | Files | Pages | Exercises | Prefix | Theme | Repo folder | Commit |
|---|---|---|---|---|---|---|---|
| DBMS Theory | `db_0.md`…`db_6.md` (guide); `dq, dh, ds1, ds2, dt` (practice) | 78 + 34 | 52 | D | `db` | `04_CS_Fundamentals/03_DBMS_Theory` | f540af3 |
| Low-Level Design (Java) | `ld_0`…`ld_4`; `lq, lh, ls1, ls2, ls3, lt` | 74 + 46 | 41 | L | `lld` | `05_System_Design/01_Low_Level_Design` | e55c42e |
| System Design (HLD) | `hd_0`…`hd_6`; `hq, hh, hs1, hs2, ht` | 57 + 22 | 35 | H | `hld` | `05_System_Design/02_High_Level_Design` | bf00d05 |

Highlights worth knowing (they are referenced across books, so do not contradict them):

- **DBMS:** relational-algebra engine; toolkit `fd.py` (closure, keys, minimal cover, normal forms, chase, preservation, BCNF/3NF) saved into `figs/` by the first block of Chapter 3; `sched.py` (precedence graphs) in Chapter 4; real anomalies on SQLite (dirty read in shared-cache mode, snapshot reads in WAL mode); strict 2PL simulator showing the **lock-upgrade deadlock**; timestamp ordering + Thomas rule; snapshot-isolation simulator showing write skew; undo/redo recovery from random crash states; ARIES simulation; buffer replacement chart; `bplus.py` B+ tree with leaf/internal splits; extendible hashing; join cost calculator (hash join only when M > √b); SQLite `EXPLAIN QUERY PLAN` including a **skip-scan** surprise; quorums, consistent hashing, CRDT counter, 2PC with coordinator crash.
- **LLD:** all programs are single-file Java (`java Main.java`), Java 21+; SOLID violation/refactor pairs; all GoF patterns; concurrency (putIfAbsent, lock ordering, producer–consumer, read-write lock); twelve case studies (parking lot, LRU/LFU, elevator, seat holds, Splitwise, vending machine, rate limiters, logger, games, library, notification service, TTL store).
- **HLD:** `estimate.py` (QPS, storage, bandwidth, cache) saved into `figs/` by Chapter 2; Zipf CDN offload chart, power of two choices, virtual nodes chart, hot-key salting, fixed-partition rebalancing, cache-aside races, stampede (plain/coalesced/XFetch), delivery semantics under crashes, outbox on SQLite, back-pressure chart, Raft election timeouts, fencing tokens, retry jitter (**honest result: full jitter does not lower the first spike**), circuit breaker, cursor pagination, saga; 13 case studies including a **smart-meter platform** (late data, dedup by `(meter, timestamp)`, downsampling) and, in the practice book, an EV charging backend.

## 4. What remains (user chose "everything"; do them in this order unless told otherwise)

The user said: **finish one set, commit, push, then wait for instructions.**

### 4.1 Set 4: Backend stack (guide + practice book)

Suggested placement: `03_Programming/03_Backend_Spring_Boot/` (after Java and MySQL, before CS fundamentals). Suggested theme key `be` (already defined, `#3f6212`), exercise prefix **B**.

Content (from the original plan): Spring Boot project structure and auto-configuration; dependency injection and bean scopes (connect to DIP in the LLD book); REST controllers, DTOs, validation, error handling (`@ControllerAdvice`); JPA/Hibernate: entities, relationships, lazy loading, **the N+1 problem** and fetch joins, transactions (`@Transactional` propagation, isolation, the self-invocation proxy trap); Spring Security with JWT; testing: JUnit 5, Mockito, `@WebMvcTest`, `@DataJpaTest`, Testcontainers; configuration and profiles; observability (Actuator, metrics, logging); Docker and docker-compose; a full mini-project: a **smart-meter REST API** (meters, readings, daily aggregates, idempotent ingestion).

**Execution constraint:** Spring cannot run in this environment unless Maven/Gradle can download dependencies. First check whether Maven Central is reachable (`mvn -v`, or try a tiny build). If it is, run real Spring examples. If not, mark Spring code blocks as display-only (```` ```java ```` without `run`), with the line "Not executed here: requires Spring Boot dependencies", and make every underlying idea runnable in **plain Java**: a REST server with `com.sun.net.httpserver.HttpServer`, JSON by hand or with records, JDBC on SQLite only if a driver is available (otherwise in-memory repositories), an N+1 demonstration with a query counter, transaction rollback, JWT signing with `javax.crypto.Mac` (HMAC-SHA256), and tests written as plain assertions in `main`.

### 4.2 Set 5: ML System Design (guide + case-study book)

Suggested placement: `06_AI_and_Machine_Learning/03_ML_System_Design/`, theme `mlsd` (`#86198f`), prefix **M**. Python simulations (numpy, matplotlib available; scikit-learn only if installable).

Content: problem framing (business metric → ML metric → offline/online evaluation); data pipelines, labelling, leakage; features and feature stores; **training/serving skew**; online versus batch inference, latency budgets, model serving and caching; evaluation, calibration, A/B tests and interleaving (with a significance and sample-size calculator); monitoring, data and concept drift (simulate PSI/KS drift detection); retraining triggers; cost. Cases: recommendations (candidate generation + ranking), fraud detection (class imbalance, precision/recall trade-off, cost-based thresholds), search ranking, ETA prediction, RAG chatbot (retrieval evaluation, chunking, caching), LLM-agent platform (tools, guardrails, evaluation, cost and latency routing; the learner's "escalation tax" paper fits here). Reference, do not repeat, the AI/ML and Deep Learning books and the System Design book.

### 4.3 Set 6: Aptitude and reasoning for TCS NQT (practice book with timed sets)

Suggested placement: decide with the user; options are a new `01_Quantitative_Aptitude/03_TCS_NQT_Timed_Mocks/`, or renaming `02_Verbal_Ability` to a broader "Aptitude and Reasoning" section. Theme `apt` (`#b91c1c`), prefix **A**.

The repo already has 11 chapter-wise quant sets, 20 mixed quant sets and 13 verbal sets (earlier PDFs), so this book should **add what is missing**: **logical reasoning** (series, coding–decoding, blood relations, directions, seating arrangement, syllogisms, data sufficiency, puzzles), **advanced quant** not yet covered (permutations and combinations, probability, number systems, HCF/LCM, mixtures and alligation, simple/compound interest), **shortcut techniques**, and **full timed mock tests** in the NQT pattern with answer keys. Every numerical answer must be computed and checked by Python (brute force where possible), with clear working.

### 4.4 Set 7: Behavioural, HR and resume (short guide)

Placement: a final section, for example `08_Interview_and_HR/` (renumber nothing; it goes last). Theme `hr` (`#334155`). Mostly text: common HR questions with frameworks (STAR), "tell me about yourself" built from the learner's profile, projects and research write-ups (the escalation-tax paper, IoT/energy projects), resume structure (one page, impact bullets with numbers), company research, salary and offer questions, a final checklist. No code blocks are needed, but the house style still applies.

## 5. House style (apply to every book)

### Writing

- **British spelling** (optimise, behaviour, organise). Clear, direct prose, short paragraphs, no filler.
- Guides start with `# How to use this guide` (with a `%` subtitle line), then `# Chapter N: Title` + `%Subtitle`, concepts, runnable demonstrations, and a closing "Practical lessons" list.
- **Every program is actually run and its real output shown. Never invent outputs.** If an output contradicts the text, **fix the text, never the number**. Keep honest negative or surprising results and explain them (examples from this session: the lock-upgrade deadlock, the skip-scan, the full-jitter peak).
- **Deterministic output only**: seeded randomness (`random.Random(seed)`), simulated clocks passed in as parameters, concurrency demos printing only stable facts (totals, counts, true/false). In Java, **never print the iteration order of `Map.of`/`Set.of`** (the JVM randomises it per run); use `LinkedHashMap`/`TreeMap`.
- Code lines **≤ 94 characters** (the PDF code width). Diagram lines in ```` ```text ```` blocks too.
- Callouts: `> TIP:`, `> TRAP:` (renders as "Exam trap"), `> NOTE:`.
- Question banks as two-column tables `| Question | Core of a good answer |`; formula sheets as tables.
- Avoid repeating content from earlier books; reference them ("see the DBMS Theory guide, Chapter 9").
- **Cover limits**: title ≤ ~48 characters (two lines), subtitle ≤ ~170 characters (two lines), or the text overflows the coloured band.

### Markdown dialect understood by `engine.py`

````text
# Chapter title            new section, coloured heading, new page, level-0 TOC entry
%Subtitle                  italic line directly under a # heading
## Section                 level-1 TOC entry;  ### Subsection (not in TOC)
**bold**, *italic*, `code`, <sub>x</sub>, <sup>x</sup>, tables (| a | b |), - bullets, 1. numbered
> TIP: / > TRAP: / > NOTE: / > EXAM:         coloured callout boxes
```python run Optional title  executed; output appended as an "Output" box (cached by syntax tree)
```java run Optional title    executed with `java Main.java` (class Main; output cached by source hash)
```python / ```java / ```sql / ```text      displayed only
![Caption](figs/name.png)     image; programs save charts with plt.savefig('name.png', dpi=150)
---page                       forced page break
````

Python blocks run with the working directory `figs/` and `PYTHONPATH=figs`, so a block can save a helper module (`shutil.copy(sys.argv[0], 'fd.py')` inside `if __name__ == '__main__':`) and later blocks can `from fd import *`. A prelude imports matplotlib as `plt` with the Agg backend.

### Practice-book structure

1. `# How to use this practice book` (with `%` subtitle): a types table (Numerical / Concept / Code / Design), the marking scheme (✓ / ~ / ✗, redo a week later) and a parts table with exercise counts.
2. `# Exercises` → `## Part N: Title` → each exercise as one paragraph: `**X3.2 · Medium · Numerical · Title.** Problem…` (letter prefix per book; level Easy/Medium/Hard; type one word).
3. `# Hints` (with `%` subtitle) → one table per part: `| Exercise | Hint |`.
4. `# Solutions` → `## Part N solutions` → `### X3.2 Title`, then code, output and a short explanation with traps and alternatives.
5. `# Progress tracker` with a `%` subtitle and a line containing only `<<TRACKER>>`; `build.py` generates the table from the exercise headings (titles may end in `?`).

## 6. Tooling and workflow

### Files in `_book_tooling/`

| File | Purpose |
|---|---|
| `engine.py` | Markdown → PDF (ReportLab). Fonts: DejaVu, taken from matplotlib's bundled fonts (works on Windows and Linux). Themes for every book, including the remaining `be`, `mlsd`, `apt`, `hr` |
| `build.py` | One `DOCS` entry per book (file, title, subtitle, theme, kicker, source files, cover rows); expands runnable blocks, builds the tracker, writes `out/<file>.pdf`. Sources are read from `sources/` (or the tooling folder itself) |
| `pyrun.py` / `javarun.py` | Run Python / Java blocks; outputs are cached in `pycache/` and `jcache/` |
| `outputs.py` | `python outputs.py sources/x.md [filter]` runs one file's blocks and prints each output, for checking prose against results |
| `check.py` | Long lines (> 94), runnable-block counts, and for practice books, exercises versus solutions versus hints coverage |
| `ast_reflow.py` (+ `pyreflow.py`, `pystr.py`) | Reflow long Python lines and verify that every block's syntax tree is unchanged |
| `javasplit.py`, `reflow.py` | Split packed Java statements and one-line blocks, then reflow long Java lines. Java has no syntax-tree check: **rerun and diff outputs** afterwards |
| `sheet.py` | Contact sheet of all pages (uses Edge on Windows). On Linux, use `pdftoppm -r 40 -png out/x.pdf tmp/p` and view a few pages |
| `sources/` | Markdown of the three books built this session: templates for structure and style |

### Setup (Linux cloud or Windows)

```bash
cd _book_tooling
python3 -m venv .venv && . .venv/bin/activate       # Windows: .venv\Scripts\python.exe
pip install reportlab numpy matplotlib
java -version                                        # Java 21 or later for java run blocks
python build.py dbms_guide                           # sanity check: rebuilds a finished book (~1.5 min)
```

`out/`, `tmp/`, `figs/`, `pycache/`, `jcache/` and `.venv/` are gitignored. A guide that saves a helper module into `figs/` (`fd.py`, `sched.py`, `bplus.py`, `estimate.py`) must be built **before** its practice book, which imports it. If `pdftotext`/`pdftoppm` (poppler) are missing on Linux, install `poppler-utils` for inspecting PDFs.

### Workflow per book (this is what produced the three sets)

1. Write the chapters as `sources/xx_0.md`, `xx_1.md`, … in the house style (about 2 chapters per file).
2. `python outputs.py sources/xx_0.md`: run the blocks and read **every** output against the prose; fix the prose (or a buggy program), never the numbers.
3. `python ast_reflow.py sources/xx_*.md` (Python) or `python javasplit.py …` then `python reflow.py …` (Java); fix leftovers by hand; `python check.py sources/xx_*.md` must report 0 long lines (for diagrams, use `PYTHONIOENCODING=utf-8`).
4. Add a `DOCS` entry in `build.py`, then run `python build.py key`.
5. Inspect: contact sheet of all pages, plus 2–3 pages at readable resolution (cover, a code-heavy page, a chart page).
6. Practice book: `check.py` must show equal counts of exercises, solutions and hints, and the build must print `exercises in tracker: N` equal to the exercise count.
7. Copy the PDFs into the repo folder with the numbering convention, update the README, verify links, commit and push.

### Lessons learned (avoid repeating these bugs)

- **Infinite loops in simulations** (a Raft election where every node votes for itself) hang the build: always cap loops (`max_rounds`) and run long builds with a timeout.
- `pystr.py` can split inside triple-quoted strings: if `ast_reflow.py` reports an AST mismatch, fix that block by hand.
- Some shells collapse `\\` in heredocs: write fix-up scripts to a file instead of piping them through a heredoc.
- Java `Map.of` iteration order changes between runs, so outputs that print it are not reproducible.
- Simulations must model reality enough to teach the right lesson (independent per-segment bandwidth made adaptive bitrate look useless; correlated bandwidth fixed it). Sanity-check that numbers are plausible, not just that the code runs.
- Hash join needs M > √(build side): calculators must enforce algorithm preconditions.
- Practice-book tracker regex: titles ending in `?` are fine (the regex allows an optional final period).

## 7. Current state at handoff

- Repository: clean, last commit `bf00d05` (System Design set) plus the commit adding this `_book_tooling/` folder.
- README: 71 links, 71 PDFs, all valid.
- Next action: **set 4, Backend stack**, after checking whether Maven Central is reachable (section 4.1). Stop after each set for the user's instructions.
