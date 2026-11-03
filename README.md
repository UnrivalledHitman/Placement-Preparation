# Placement Preparation

Study material and practice sets for campus placements (TCS NQT, TCS CPA and similar aptitude + technical rounds).

Everything is numbered in the order it is meant to be completed: sections `01`–`08`, the folders inside each section, and the files inside each folder. Work through them top to bottom.

## Start here: three paths through this repository

The library has grown past 130 books, so here are the three routes it was built for. Each step names the folders to use, in order; the full listing follows further down.

### Path A · Campus placements (November 2026 to January 2027)

| Step | What | Where |
|---|---|---|
| 1 | Aptitude: chapter-wise, mixed sets, then timed mocks | `01_Quantitative_Aptitude`, `02_Verbal_Ability` |
| 2 | Core language and SQL | `03_Programming/01_Java`, `03_Programming/02_MySQL` |
| 3 | The 12-week DSA + SQL plan (1 Dec 2026 – 22 Feb 2027): one chapter block a week in Python, plus one SQL part | `03_Programming/05_DSA_in_Python`, with `03_Programming/02_MySQL` |
| 4 | CS fundamentals asked in interviews | `04_CS_Fundamentals/01_Operating_Systems`, `04_Computer_Networks`, `05_DBMS_Theory` |
| 5 | Exam-specific sets | `03_Programming/01_Java` (TCS CPA Java sets), `06_AI_and_Machine_Learning/08_TCS_CPA_AI_ML_Stream` |
| 6 | Interviews: HR, resume, then full mock loops | `08_Interview_and_HR` (01–03) |

### Path B · GATE Data Science and AI (February 2028)

| Period | What | Where |
|---|---|---|
| Dec 2026 – Feb 2027 | One hour each weekend: the warm-up book | `06_AI_and_Machine_Learning/09_GATE_Data_Science_and_AI` (07) |
| Mar – May 2027 | Mathematics: guide and practice, Easy and Medium tiers | `09_GATE_Data_Science_and_AI` (01, 02); deeper background in `06_AI_and_Machine_Learning/01_Mathematics_for_ML` |
| Jun – Sep 2027 | CS, ML and AI: guide and practice; register for GATE in September | `09_GATE_Data_Science_and_AI` (03, 04); support from `03_Programming/05_DSA_in_Python` and `04_CS_Fundamentals/05_DBMS_Theory` |
| Oct – Dec 2027 | Hard tiers, official past papers, aptitude every week | `09_GATE_Data_Science_and_AI` (02, 04, 05) |
| Jan 2028 | Three mock papers and the quick revision | `09_GATE_Data_Science_and_AI` (05, 06) |

### Path C · AI engineering, then corporate training

| Step | What | Where |
|---|---|---|
| 1 | Foundations: mathematics, ML, applied data science, deep learning | `06_AI_and_Machine_Learning` (01–04) |
| 2 | Shipping ML: system design and MLOps | `06_AI_and_Machine_Learning` (05, 06) |
| 3 | The engineering around it: data pipelines, streaming, distributed systems, back end, testing, security | `05_System_Design` (03–05), `03_Programming` (07, 09, 11) |
| 4 | Interviews for data and AI roles, then senior-level habits | `06_AI_and_Machine_Learning/07_Data_Science_Interview_Prep`, `08_Interview_and_HR` (04, 05) |
| 5 | Teaching what you know: a ready-to-run 2-day corporate workshop on RAG and agentic AI | `06_AI_and_Machine_Learning/10_Corporate_Workshop_RAG_and_Agents` |

## Folder structure

```
Placement Preparation/
├── 01_Quantitative_Aptitude/
│   ├── 01_Chapter_Wise/          11 topics, basics first
│   ├── 02_Mixed_Sets/            20 mixed practice sets
│   └── 03_Reasoning_Advanced_Quant_and_Mocks/   guide → 3 timed NQT mocks
├── 02_Verbal_Ability/
│   ├── 01_Topic_Wise/            7 topics, words → sentences → passages
│   └── 02_Mixed_Sets/            6 mixed practice sets
├── 03_Programming/
│   ├── 01_Java/                  Guide → reference → practice → exam sets → revision
│   ├── 02_MySQL/                 Guide → reference → practice → revision
│   ├── 03_JDBC_and_Persistence/  Guide → practice book (JDBC, transactions, pools, Servlets)
│   ├── 04_DSA_in_Java/           Guide → practice book → revision (12-week DSA plan)
│   ├── 05_DSA_in_Python/         Guide → practice book → revision (same patterns in Python)
│   ├── 06_Java_Concurrency/      Guide → practice book (every program run on JDK 25)
│   ├── 07_Security_Engineering/  Guide → practice book (attacks run on toys)
│   ├── 08_Backend_Spring_Boot/   Guide → practice book (runnable Spring Boot 3 apps)
│   ├── 09_Software_Testing/      Guide → practice book (every test run on JUnit 5)
│   ├── 10_Frontend_Design_and_Development/  Guide → practice book (pages rendered in Chromium)
│   └── 11_Advanced_Backend_Engineering/     Guide → practice book (run against real Redis)
├── 04_CS_Fundamentals/
│   ├── 01_Operating_Systems/     Guide → practice book
│   ├── 02_Linux/                 Guide → practice book (every command executed)
│   ├── 03_Git_Internals_and_Workflows/  Guide → practice book (every git command executed)
│   ├── 04_Computer_Networks/     Guide → practice book
│   ├── 05_DBMS_Theory/           Guide → practice book
│   ├── 06_DevOps_and_Cloud/      Guide → practice book (pipelines, Kubernetes, Terraform simulated)
│   └── 07_Compilers_and_Theory_of_Computation/  Guide → practice book (automata to a working compiler)
├── 05_System_Design/
│   ├── 01_Low_Level_Design/      Guide → practice book (Java)
│   ├── 02_High_Level_Design/     Guide → practice book (Python simulations)
│   ├── 03_Distributed_Systems/   Guide → practice book (consensus, clocks, CRDTs simulated)
│   ├── 04_Kafka_and_Stream_Processing/  Guide → practice book (Kafka's own partitioner, simulated)
│   └── 05_Data_Engineering/      Guide → practice book (SQL run on DuckDB)
├── 06_AI_and_Machine_Learning/
│   ├── 01_Mathematics_for_ML/    Guide → practice book (every derivation checked numerically)
│   ├── 02_AI_ML/                 Python guide → practice book
│   ├── 03_Applied_Data_Science/  Guide → practice book (boosting, experiments, causal inference)
│   ├── 04_Deep_Learning/         PyTorch guide → practice book
│   ├── 05_ML_System_Design/      Guide → practice book (simulations + design prompts)
│   ├── 06_MLOps/                 Guide → practice book (MLflow, tests, serving, rollouts)
│   ├── 07_Data_Science_Interview_Prep/  Guide → practice book (SQL, pandas, stats, product sense)
│   ├── 08_TCS_CPA_AI_ML_Stream/  Guide → practice sets with 2 mock papers → quick revision → supplement
│   ├── 09_GATE_Data_Science_and_AI/  2 guides → 2 practice books → aptitude and 3 mocks → revision → weekend warm-up
│   └── 10_Corporate_Workshop_RAG_and_Agents/  Trainer guide for a 2-day corporate workshop
├── 07_Business_and_Finance/
│   ├── 01_Parable_of_the_Pipeline/  Book → study report
│   └── 02_Cashflow_Quadrant/        Book → study report
└── 08_Interview_and_HR/
    ├── Interview, HR and resume guide
    ├── Mock Interview Loops: guide → workbook (full DSA, LLD, HLD and behavioural loops)
    └── Senior Engineer Handbook: guide → workbook (growing into senior and staff)
```

---

## 01 · Quantitative Aptitude

### Step 1: Chapter-wise

Arithmetic basics first; Data Interpretation last because it combines percentages, ratios and averages.

| # | Topic |
|---|-------|
| 01 | [Simplification](01_Quantitative_Aptitude/01_Chapter_Wise/01_Simplification.pdf) |
| 02 | [Percentage](01_Quantitative_Aptitude/01_Chapter_Wise/02_Percentage.pdf) |
| 03 | [Ratio and Proportion](01_Quantitative_Aptitude/01_Chapter_Wise/03_Ratio_and_Proportion.pdf) |
| 04 | [Average](01_Quantitative_Aptitude/01_Chapter_Wise/04_Average.pdf) |
| 05 | [Profit and Loss](01_Quantitative_Aptitude/01_Chapter_Wise/05_Profit_and_Loss.pdf) |
| 06 | [Time and Work](01_Quantitative_Aptitude/01_Chapter_Wise/06_Time_and_Work.pdf) |
| 07 | [Distance, Speed and Time](01_Quantitative_Aptitude/01_Chapter_Wise/07_Distance_Speed_and_Time.pdf) |
| 08 | [Boats and Streams](01_Quantitative_Aptitude/01_Chapter_Wise/08_Boats_and_Streams.pdf) |
| 09 | [Elementary Statistics](01_Quantitative_Aptitude/01_Chapter_Wise/09_Elementary_Statistics.pdf) |
| 10 | [Mensuration and Geometry](01_Quantitative_Aptitude/01_Chapter_Wise/10_Mensuration_and_Geometry.pdf) |
| 11 | [Data Interpretation](01_Quantitative_Aptitude/01_Chapter_Wise/11_Data_Interpretation.pdf) |

### Step 2: Mixed sets

Take these after finishing all chapters.

[01](01_Quantitative_Aptitude/02_Mixed_Sets/01_Mixed_Set.pdf) ·
[02](01_Quantitative_Aptitude/02_Mixed_Sets/02_Mixed_Set.pdf) ·
[03](01_Quantitative_Aptitude/02_Mixed_Sets/03_Mixed_Set.pdf) ·
[04](01_Quantitative_Aptitude/02_Mixed_Sets/04_Mixed_Set.pdf) ·
[05](01_Quantitative_Aptitude/02_Mixed_Sets/05_Mixed_Set.pdf) ·
[06](01_Quantitative_Aptitude/02_Mixed_Sets/06_Mixed_Set.pdf) ·
[07](01_Quantitative_Aptitude/02_Mixed_Sets/07_Mixed_Set.pdf) ·
[08](01_Quantitative_Aptitude/02_Mixed_Sets/08_Mixed_Set.pdf) ·
[09](01_Quantitative_Aptitude/02_Mixed_Sets/09_Mixed_Set.pdf) ·
[10](01_Quantitative_Aptitude/02_Mixed_Sets/10_Mixed_Set.pdf) ·
[11](01_Quantitative_Aptitude/02_Mixed_Sets/11_Mixed_Set.pdf) ·
[12](01_Quantitative_Aptitude/02_Mixed_Sets/12_Mixed_Set.pdf) ·
[13](01_Quantitative_Aptitude/02_Mixed_Sets/13_Mixed_Set.pdf) ·
[14](01_Quantitative_Aptitude/02_Mixed_Sets/14_Mixed_Set.pdf) ·
[15](01_Quantitative_Aptitude/02_Mixed_Sets/15_Mixed_Set.pdf) ·
[16](01_Quantitative_Aptitude/02_Mixed_Sets/16_Mixed_Set.pdf) ·
[17](01_Quantitative_Aptitude/02_Mixed_Sets/17_Mixed_Set.pdf) ·
[18](01_Quantitative_Aptitude/02_Mixed_Sets/18_Mixed_Set.pdf) ·
[19](01_Quantitative_Aptitude/02_Mixed_Sets/19_Mixed_Set.pdf) ·
[20](01_Quantitative_Aptitude/02_Mixed_Sets/20_Mixed_Set.pdf)

### Step 3: Reasoning, advanced quant and timed mocks

The topics the sets above do not cover (number system, interest, mixtures, P&C, probability, clocks, calendars and logical reasoning), then three 25-minute mocks in the TCS NQT style. Every answer is checked by a Python brute force.

| # | Book | Contents |
|---|------|----------|
| 01 | [Reasoning and Advanced Quant for TCS NQT](01_Quantitative_Aptitude/03_Reasoning_Advanced_Quant_and_Mocks/01_Reasoning_and_Advanced_Quant_Guide.pdf) | 7 chapters with worked examples and practice questions |
| 02 | [TCS NQT Timed Mock Tests](01_Quantitative_Aptitude/03_Reasoning_Advanced_Quant_and_Mocks/02_TCS_NQT_Timed_Mock_Tests.pdf) | 3 mocks × 20 questions, keys, hints, solutions |

---

## 02 · Verbal Ability

### Step 1: Topic-wise

From word level (vocabulary, idioms) through grammar and sentences to full passages.

| # | Topic |
|---|-------|
| 01 | [Words Completion](02_Verbal_Ability/01_Topic_Wise/01_Words_Completion.pdf) |
| 02 | [Idioms and Phrases](02_Verbal_Ability/01_Topic_Wise/02_Idioms_and_Phrases.pdf) |
| 03 | [Error Detection](02_Verbal_Ability/01_Topic_Wise/03_Error_Detection.pdf) |
| 04 | [Sentence Completion](02_Verbal_Ability/01_Topic_Wise/04_Sentence_Completion.pdf) |
| 05 | [Sentence Building](02_Verbal_Ability/01_Topic_Wise/05_Sentence_Building.pdf) |
| 06 | [Para Jumbles](02_Verbal_Ability/01_Topic_Wise/06_Para_Jumbles.pdf) |
| 07 | [Reading Comprehension](02_Verbal_Ability/01_Topic_Wise/07_Reading_Comprehension.pdf) |

### Step 2: Mixed sets

[01](02_Verbal_Ability/02_Mixed_Sets/01_Mixed_Set.pdf) ·
[02](02_Verbal_Ability/02_Mixed_Sets/02_Mixed_Set.pdf) ·
[03](02_Verbal_Ability/02_Mixed_Sets/03_Mixed_Set.pdf) ·
[04](02_Verbal_Ability/02_Mixed_Sets/04_Mixed_Set.pdf) ·
[05](02_Verbal_Ability/02_Mixed_Sets/05_Mixed_Set.pdf) ·
[06](02_Verbal_Ability/02_Mixed_Sets/06_Mixed_Set.pdf)

---

## 03 · Programming

Java first: the JDBC part of the MySQL material uses it. In each language, learn from the guide, keep the reference open while practising, and finish with the quick revision just before the exam.

| # | 01 · Java | 02 · MySQL |
|---|-----------|------------|
| 01 | [Complete Guide](03_Programming/01_Java/01_Java_Complete_Guide.pdf) | [Complete Guide](03_Programming/02_MySQL/01_MySQL_Complete_Guide.pdf) |
| 02 | [Classes & Methods Reference](03_Programming/01_Java/02_Java_Classes_and_Methods_Reference.pdf) | [Commands & Functions Reference](03_Programming/02_MySQL/02_MySQL_Commands_and_Functions_Reference.pdf) |
| 03 | [Practice Questions – Chapterwise](03_Programming/01_Java/03_Java_Practice_Questions_Chapterwise.pdf) | [Practice Questions – Chapterwise](03_Programming/02_MySQL/03_MySQL_Practice_Questions_Chapterwise.pdf) |
| 04 | [TCS CPA Practice Sets](03_Programming/01_Java/04_Java_TCS_CPA_Practice_Sets.pdf) | [Quick Revision](03_Programming/02_MySQL/04_MySQL_Quick_Revision.pdf) |
| 05 | [Quick Revision (TCS CPA)](03_Programming/01_Java/05_Java_Quick_Revision_TCS_CPA.pdf) | — |

### 03 · JDBC and Java persistence

The bridge between the Java and MySQL books: connections, PreparedStatement and SQL injection, transactions and isolation levels (observed on a real database), batching, connection pools, the DAO pattern, migrations and Servlets. Read Chapters 1–3 before the TCS CPA exam.

| # | Guide | Practice book |
|---|-------|---------------|
| 01 | [JDBC and Java Persistence in Depth](03_Programming/03_JDBC_and_Persistence/01_JDBC_and_Persistence_Complete_Guide.pdf) (14 runnable programs) | [28 exercises with hints and solutions](03_Programming/03_JDBC_and_Persistence/02_JDBC_and_Persistence_Practice_Book.pdf) |

### 04 · DSA in Java

Start after the Java guide: every program is in Java. The guide's chapters map onto the 12-week DSA roadmap (week 1 = Chapters 1–2, …, week 12 = Chapter 12); solve the matching part of the practice book after each chapter.

| # | Book | Contents |
|---|------|----------|
| 01 | [DSA in Java: Patterns for Coding Interviews](03_Programming/04_DSA_in_Java/01_DSA_in_Java_Complete_Guide.pdf) | 12 chapters, 60 runnable programs |
| 02 | [Practice Book](03_Programming/04_DSA_in_Java/02_DSA_in_Java_Practice_Book.pdf) | 49 exercises with hints and solutions |
| 03 | [Quick Revision](03_Programming/04_DSA_in_Java/03_DSA_in_Java_Quick_Revision.pdf) | Templates, collections, traps and checklists in 14 pages; read before every coding round |

### 05 · DSA in Python

The same patterns as the Java DSA book, written in Python, for coding rounds that allow Python (including the TCS CPA AI and ML stream). Practise in one language: if you choose Python, use this set instead of the Java one, not as well as it. It adds what is specific to Python: the standard-library toolkit (`deque`, `heapq`, `bisect`, `Counter`, `lru_cache`), its traps (shared rows, floor division, mutable defaults, recursion depth) and its speed limit of about 10⁷ simple operations per second. Every program was run, and most practice solutions are checked against a brute-force version on hundreds of random inputs.

| # | Book | Contents |
|---|------|----------|
| 01 | [DSA in Python: Patterns for Coding Interviews](03_Programming/05_DSA_in_Python/01_DSA_in_Python_Complete_Guide.pdf) | 12 chapters, 53 runnable programs |
| 02 | [Practice Book](03_Programming/05_DSA_in_Python/02_DSA_in_Python_Practice_Book.pdf) | 36 exercises with hints and tested solutions |
| 03 | [Quick Revision](03_Programming/05_DSA_in_Python/03_DSA_in_Python_Quick_Revision.pdf) | Templates, toolkit, traps and checklists in 13 pages |

### 06 · Java concurrency

After the DSA book and before the back-end books, which all run concurrent servers. Threads and the three concurrency problems (atomicity, visibility, ordering), the Java Memory Model and happens-before, locks and deadlock, atomics and concurrent collections, thread pools, `CompletableFuture`, synchronisers, and virtual threads with scoped values. Every program was run on JDK 25 and prints only facts that hold on every run.

| # | Guide | Practice book |
|---|-------|---------------|
| 01 | [Java Concurrency: Threads to Virtual Threads](03_Programming/06_Java_Concurrency/01_Java_Concurrency_Complete_Guide.pdf) (35 runnable programs) | [25 exercises with hints and executed solutions](03_Programming/06_Java_Concurrency/02_Java_Concurrency_Practice_Book.pdf) |

### 07 · Security engineering

Security fundamentals come before any framework, so this sits before the Spring Boot guide: Spring Security, JWT filters and HTTPS settings there are then applications of ideas you already know. Each chapter ends with the Spring equivalents to look out for later. Cryptography used correctly (hashes, HMAC, AES-GCM, signatures), passwords and authentication (Argon2id, JWT, TOTP, OAuth/PKCE), TLS and mutual TLS, encryption at rest, key management and secrets, payment security (PCI scope, webhooks, idempotency), the OWASP Top 10 attacked and fixed, and data privacy and audit. Every control was run with real cryptographic libraries and OpenSSL, and every attack is demonstrated on a deliberately weak toy with its fix beside it.

| # | Guide | Practice book |
|---|-------|---------------|
| 01 | [Security Engineering for Developers: Crypto to OWASP](03_Programming/07_Security_Engineering/01_Security_Engineering_Complete_Guide.pdf) (33 runnable programs) | [34 exercises with hints and executed solutions, including two secure designs](03_Programming/07_Security_Engineering/02_Security_Engineering_Practice_Book.pdf) |

### 08 · Backend with Spring Boot

After Java, MySQL (the JPA chapters build on SQL) and Security Engineering (Chapter 6 applies its password, session and JWT fundamentals with Spring Security). Every program is a real Spring Boot 3 application that was run to produce its output; Chapter 10 is a complete smart-meter REST API worth rebuilding as a GitHub project.

| # | Guide | Practice book |
|---|-------|---------------|
| 01 | [Spring Boot Backend: From Beans to Production](03_Programming/08_Backend_Spring_Boot/01_Backend_Spring_Boot_Complete_Guide.pdf) (21 runnable apps) | [31 exercises with hints and solutions](03_Programming/08_Backend_Spring_Boot/02_Backend_Spring_Boot_Practice_Book.pdf) |

### 09 · Software testing

After the Spring Boot guide, whose test slices it builds on. Deciding what to test, systematic test design (equivalence classes, boundaries, decision tables, state machines), JUnit 5 in depth, parameterised and property-based tests, test doubles and Mockito (and when mocking hurts), integration tests with stub servers and Testcontainers, contract tests, flaky tests caused by time and concurrency, coverage versus mutation testing, and TDD. Every test was compiled and run on the JUnit 5 console launcher with Mockito; some fail on purpose, because catching the bug is the point.

| # | Guide | Practice book |
|---|-------|---------------|
| 01 | [Software Testing: JUnit 5 to Testcontainers](03_Programming/09_Software_Testing/01_Software_Testing_Complete_Guide.pdf) (19 runnable examples) | [20 exercises with hints and executed solutions](03_Programming/09_Software_Testing/02_Software_Testing_Practice_Book.pdf) |

### 10 · Front-end design and development

What runs in the user's browser: how pages render, HTML, CSS layout, UI design principles (hierarchy, spacing, contrast, states), JavaScript and the event loop, the DOM, TypeScript, React, accessibility, Core Web Vitals and front-end security. Every HTML, CSS and React example was rendered in headless Chromium (with screenshots), every script run in Node.js, and every TypeScript example checked by the compiler. Pairs with the Spring Boot back end: together they make a full-stack project.

| # | Guide | Practice book |
|---|-------|---------------|
| 01 | [Front-end Design and Development: From Pixels to React](03_Programming/10_Frontend_Design_and_Development/01_Frontend_Design_and_Development_Complete_Guide.pdf) (48 runnable examples) | [36 machine-coding and concept exercises with executed solutions](03_Programming/10_Frontend_Design_and_Development/02_Frontend_Design_and_Development_Practice_Book.pdf) |

### 11 · Advanced back-end engineering

After the Spring Boot guide: the pieces around the core API that production systems and senior interviews need. Caching (patterns, invalidation, eviction, stampedes), rate limiting, idempotency keys and distributed locks, message queues and event logs (consumer groups, retries, dead letters, outbox, sagas), background and scheduled jobs, SSE and WebSockets, object storage with presigned URLs, REST in depth, GraphQL and gRPC, and NoSQL data modelling. Every example ran against a real Redis 7 server, real HTTP and WebSocket servers, graphql-core and a generated gRPC service; each chapter maps the ideas onto Spring.

| # | Guide | Practice book |
|---|-------|---------------|
| 01 | [Advanced Back-end Engineering: Caches, Queues and Real-time](03_Programming/11_Advanced_Backend_Engineering/01_Advanced_Backend_Engineering_Complete_Guide.pdf) (29 runnable programs) | [33 exercises with hints and executed solutions, including two system designs](03_Programming/11_Advanced_Backend_Engineering/02_Advanced_Backend_Engineering_Practice_Book.pdf) |

---

## 04 · CS Fundamentals

The core subjects of technical interviews. Operating Systems first: its concurrency chapters use Java, and networking builds on processes and sockets. Linux comes straight after it: the same ideas (processes, files, permissions, signals) at the command line of the servers you will deploy to. Git Internals and Workflows follows naturally at that command line: how Git stores objects, what merge, rebase and reset really do, how to recover anything, and the branching and review workflows teams use, with every command run in a real repository. DBMS Theory goes beneath the MySQL books (normal forms, transactions, indexing, distributed data). DevOps and Cloud comes last: how code is built, shipped and run (CI pipelines, container images, Kubernetes, release strategies, infrastructure as code, alerting, cloud networking), with every mechanism simulated and every configuration file checked. Compilers and Theory of Computation is optional for most roles but asked by some companies and in GATE-style written tests: automata, regular expressions and their limits, grammars and parsing, Turing machines, decidability and P versus NP, then a working compiler for a small language from lexer to optimised bytecode. Read each guide, then solve its practice book.

| # | Guide | Practice book |
|---|-------|---------------|
| 01 | [Operating Systems: Concepts, Numericals and Concurrency](04_CS_Fundamentals/01_Operating_Systems/01_Operating_Systems_Complete_Guide.pdf) | [52 exercises with hints and solutions](04_CS_Fundamentals/01_Operating_Systems/02_Operating_Systems_Practice_Book.pdf) |
| 02 | [Linux for Software Engineers: Shell to Kernel, Every Command Run](04_CS_Fundamentals/02_Linux/01_Linux_for_Software_Engineers_Complete_Guide.pdf) | [36 exercises with hints and executed solutions](04_CS_Fundamentals/02_Linux/02_Linux_for_Software_Engineers_Practice_Book.pdf) |
| 03 | [Git Internals and Team Workflows](04_CS_Fundamentals/03_Git_Internals_and_Workflows/01_Git_Internals_and_Workflows_Complete_Guide.pdf) (30 runnable examples) | [20 scenario exercises with hints and executed solutions](04_CS_Fundamentals/03_Git_Internals_and_Workflows/02_Git_Internals_and_Workflows_Practice_Book.pdf) |
| 04 | [Computer Networks: Protocols, Numericals and Real Packets](04_CS_Fundamentals/04_Computer_Networks/01_Computer_Networks_Complete_Guide.pdf) | [44 exercises with hints and solutions](04_CS_Fundamentals/04_Computer_Networks/02_Computer_Networks_Practice_Book.pdf) |
| 05 | [DBMS Theory: From Normal Forms to Distributed Data](04_CS_Fundamentals/05_DBMS_Theory/01_DBMS_Theory_Complete_Guide.pdf) | [52 exercises with hints and solutions](04_CS_Fundamentals/05_DBMS_Theory/02_DBMS_Theory_Practice_Book.pdf) |
| 06 | [DevOps and Cloud: From Commit to Production](04_CS_Fundamentals/06_DevOps_and_Cloud/01_DevOps_and_Cloud_Complete_Guide.pdf) (33 runnable programs) | [25 exercises with hints and executed solutions](04_CS_Fundamentals/06_DevOps_and_Cloud/02_DevOps_and_Cloud_Practice_Book.pdf) |
| 07 | [Compilers and Theory of Computation](04_CS_Fundamentals/07_Compilers_and_Theory_of_Computation/01_Compilers_and_Theory_of_Computation_Complete_Guide.pdf) (20 runnable programs, including a working compiler) | [20 exercises with hints and executed solutions](04_CS_Fundamentals/07_Compilers_and_Theory_of_Computation/02_Compilers_and_Theory_of_Computation_Practice_Book.pdf) |

---

## 05 · System Design

Design rounds come after the core subjects: they use Java (Programming) and build on databases and networks (CS Fundamentals). Start with low-level design (object-oriented design and machine coding in Java), then high-level system design (architecture of large distributed systems), then distributed systems theory (failure models, clocks, consistency models, Paxos and Raft, CRDTs, gossip), which explains why the high-level designs work. Kafka and stream processing then goes deep on the event log that most modern designs are built around, and data engineering closes the section with the pipelines, lakes and warehouses that turn those events into analytics.

| # | Guide | Practice book |
|---|-------|---------------|
| 01 | [Low-Level Design in Java: Patterns to Case Studies](05_System_Design/01_Low_Level_Design/01_Low_Level_Design_Complete_Guide.pdf) | [41 exercises with hints and solutions](05_System_Design/01_Low_Level_Design/02_Low_Level_Design_Practice_Book.pdf) |
| 02 | [System Design: From Estimates to Case Studies](05_System_Design/02_High_Level_Design/01_System_Design_Complete_Guide.pdf) | [35 exercises with hints, solutions and rubrics](05_System_Design/02_High_Level_Design/02_System_Design_Practice_Book.pdf) |
| 03 | [Distributed Systems: Time, Consensus and Replication](05_System_Design/03_Distributed_Systems/01_Distributed_Systems_Complete_Guide.pdf) (22 simulations) | [25 exercises with hints and executed solutions](05_System_Design/03_Distributed_Systems/02_Distributed_Systems_Practice_Book.pdf) |
| 04 | [Kafka and Stream Processing in Depth](05_System_Design/04_Kafka_and_Stream_Processing/01_Kafka_and_Stream_Processing_Complete_Guide.pdf) (15 simulations; partitioning uses Kafka's own murmur2) | [20 exercises with hints and executed solutions](05_System_Design/04_Kafka_and_Stream_Processing/02_Kafka_and_Stream_Processing_Practice_Book.pdf) |
| 05 | [Data Engineering: Lakes, Warehouses, Pipelines](05_System_Design/05_Data_Engineering/01_Data_Engineering_Complete_Guide.pdf) (18 runnable examples, SQL on DuckDB) | [20 exercises with hints and executed solutions](05_System_Design/05_Data_Engineering/02_Data_Engineering_Practice_Book.pdf) |

---

## 06 · AI and Machine Learning

Start with the mathematics: linear algebra, calculus, probability and statistics, each result derived and checked by a NumPy program. Then the AI/ML guide, followed by Applied Data Science: the tabular, experimental and causal techniques most industry data science runs on. The Deep Learning guide goes deeper into neural networks; ML System Design applies everything to whole products (and builds on the System Design section); MLOps covers running models in production (and builds on the DevOps guide). Data Science Interview Prep comes last: SQL, pandas, probability, statistics and product-sense rounds in interview format, for data scientist and data analyst roles. Read each guide, then solve its practice book.

| # | Guide | Practice book |
|---|-------|---------------|
| 01 | [Mathematics and Statistics for ML: Derived and Checked](06_AI_and_Machine_Learning/01_Mathematics_for_ML/01_Mathematics_and_Statistics_for_ML_Complete_Guide.pdf) (NumPy, SciPy) | [49 exercises with hints and solutions, every answer checked by code](06_AI_and_Machine_Learning/01_Mathematics_for_ML/02_Mathematics_and_Statistics_for_ML_Practice_Book.pdf) |
| 02 | [AI/ML: From Maths to Agents](06_AI_and_Machine_Learning/02_AI_ML/01_AI_ML_Complete_Guide.pdf) (Python) | [73 exercises with hints and solutions](06_AI_and_Machine_Learning/02_AI_ML/02_AI_ML_Practice_Book.pdf) |
| 03 | [Applied Data Science: Tabular ML to Causality](06_AI_and_Machine_Learning/03_Applied_Data_Science/01_Applied_Data_Science_Complete_Guide.pdf) (33 runnable analyses) | [24 exercises with hints and executed solutions](06_AI_and_Machine_Learning/03_Applied_Data_Science/02_Applied_Data_Science_Practice_Book.pdf) |
| 04 | [Deep Learning: From Autograd to Research Frontiers](06_AI_and_Machine_Learning/04_Deep_Learning/01_Deep_Learning_Complete_Guide.pdf) (PyTorch) | [73 exercises with hints and solutions](06_AI_and_Machine_Learning/04_Deep_Learning/02_Deep_Learning_Practice_Book.pdf) |
| 05 | [ML System Design: From Metrics to Monitoring](06_AI_and_Machine_Learning/05_ML_System_Design/01_ML_System_Design_Complete_Guide.pdf) (Python simulations) | [29 exercises with hints and solutions, 5 full design prompts](06_AI_and_Machine_Learning/05_ML_System_Design/02_ML_System_Design_Practice_Book.pdf) |
| 06 | [MLOps: From Notebook to Production](06_AI_and_Machine_Learning/06_MLOps/01_MLOps_Complete_Guide.pdf) (19 runnable programs: MLflow, Pandera, pytest, FastAPI, ONNX) | [24 exercises with hints and executed solutions](06_AI_and_Machine_Learning/06_MLOps/02_MLOps_Practice_Book.pdf) |
| 07 | [Data Science Interviews: SQL to Product Sense](06_AI_and_Machine_Learning/07_Data_Science_Interview_Prep/01_Data_Science_Interview_Prep_Complete_Guide.pdf) (31 runnable queries and checks) | [24 interview-format exercises with executed solutions](06_AI_and_Machine_Learning/07_Data_Science_Interview_Prep/02_Data_Science_Interview_Prep_Practice_Book.pdf) |

### 08 · TCS CPA, AI and ML stream (exam on 24 October 2026)

Exam-focused preparation for the TCS CPA AI & ML stream paper: one Python OOP and collections coding question (35 marks), a 40-question technical quiz covering SQL, AI basics, EDA and visualisation, supervised, unsupervised and advanced ML, GenAI and LLMs, and agentic AI and RAG (40 marks, 2 theory and 3 scenario or code questions per topic), and 25 business-skills questions (25 marks). Every code example, coding solution and code-based MCQ answer was executed. Start with the 12-day plan in the guide; sit the two mock papers on 20 and 22 October; read the quick revision on the last day.

| # | Book | Contents |
|---|------|----------|
| 01 | [TCS CPA AI & ML Stream: Complete Guide](06_AI_and_Machine_Learning/08_TCS_CPA_AI_ML_Stream/01_TCS_CPA_AI_ML_Complete_Guide.pdf) | 11 chapters mapped to the paper, 12-day plan, 40 traps |
| 02 | [Practice Sets](06_AI_and_Machine_Learning/08_TCS_CPA_AI_ML_Stream/02_TCS_CPA_AI_ML_Practice_Sets.pdf) | 8 coding problems, 105 topic MCQs, 2 full 66-question mock papers with keys |
| 03 | [Quick Revision](06_AI_and_Machine_Learning/08_TCS_CPA_AI_ML_Stream/03_TCS_CPA_AI_ML_Quick_Revision.pdf) | Every pattern, formula and framework in 9 pages |
| 04 | [Supplement](06_AI_and_Machine_Learning/08_TCS_CPA_AI_ML_Stream/04_TCS_CPA_AI_ML_Supplement.pdf) | SQL functions, statistics, NLP, expert systems, GMM, time series, Keras, PyTorch, Hugging Face, LangChain, FAISS, Chroma; 120 more quiz questions |

### 09 · GATE Data Science and AI (target: GATE 2028, February 2028)

A complete course for the GATE DA paper, calibrated on the official 2025 and 2026 papers: their topic weightage, question types (MCQ, MSQ, NAT) and difficulty. Every question is original, written to match the published papers without copying them, and every answer was computed by a program printed with its solution. Practice sets are tiered Easy, Medium and Hard; MSQs have one, two or three correct options, and MCQ answers are balanced across A to D. Register in September 2027; the guide opens with a study plan up to the exam.

| # | Book | Contents |
|---|------|----------|
| 01 | [Guide, Vol. 1: Mathematics](06_AI_and_Machine_Learning/09_GATE_Data_Science_and_AI/01_GATE_DA_Guide_Vol1_Mathematics.pdf) | 2025–26 weightage and plan; probability and statistics, linear algebra, calculus and optimisation |
| 02 | [Practice, Vol. 1: Mathematics](06_AI_and_Machine_Learning/09_GATE_Data_Science_and_AI/02_GATE_DA_Practice_Vol1_Mathematics.pdf) | 13 sets, 312 questions (Easy, Medium, Hard), worked solutions |
| 03 | [Guide, Vol. 2: CS, ML and AI](06_AI_and_Machine_Learning/09_GATE_Data_Science_and_AI/03_GATE_DA_Guide_Vol2_CS_ML_AI.pdf) | Python, data structures, algorithms, databases, warehousing, machine learning, AI; every example run |
| 04 | [Practice, Vol. 2: CS, ML and AI](06_AI_and_Machine_Learning/09_GATE_Data_Science_and_AI/04_GATE_DA_Practice_Vol2_CS_ML_AI.pdf) | 15 sets, 360 questions; code and SQL questions run as printed |
| 05 | [Aptitude and Mock Papers](06_AI_and_Machine_Learning/09_GATE_Data_Science_and_AI/05_GATE_DA_Aptitude_and_Mock_Papers.pdf) | 40 General Aptitude questions; three full 65-question, 100-mark mock papers with keys and a score sheet |
| 06 | [Quick Revision](06_AI_and_Machine_Learning/09_GATE_Data_Science_and_AI/06_GATE_DA_Quick_Revision.pdf) | Every formula, rule, count and trap in 12 pages |
| 07 | [Weekend Warm-up](06_AI_and_Machine_Learning/09_GATE_Data_Science_and_AI/07_GATE_DA_Weekend_Warm-up.pdf) | 12 one-hour Saturday sessions, 7 Nov 2026 – 23 Jan 2027: probability basics and aptitude, 96 questions |

### 10 · Corporate workshop: building reliable RAG and agentic AI systems

A ready-to-deliver, two-day workshop for engineering teams, written as a trainer's guide: timings, what to say, six hands-on labs that run offline on a laptop (embeddings, FAISS and BM25 retrieval, recall@k, grounded answers with citations, a tested agent loop, prompt-injection attack and defence, evaluation in CI), a quiz, a capstone rubric, and notes on discovery, tailoring and pricing. Every lab was run and its output is printed with it.

| # | Book | Contents |
|---|------|----------|
| 01 | [RAG and Agentic AI Workshop: Trainer Guide](06_AI_and_Machine_Learning/10_Corporate_Workshop_RAG_and_Agents/01_RAG_and_Agentic_AI_Workshop_Trainer_Guide.pdf) | 6 modules, 6 labs, capstone, assessments, delivery and pricing notes |

---

## 07 · Business and Finance

The short *Parable of the Pipeline* introduces residual income; *Cashflow Quadrant* develops it further. Read each book, then its study report.

| # | Book | Study report |
|---|------|--------------|
| 01 | [The Parable of the Pipeline – Burke Hedges](07_Business_and_Finance/01_Parable_of_the_Pipeline/01_Parable_of_the_Pipeline_Book_Burke_Hedges.pdf) | [Lesson-by-lesson report](07_Business_and_Finance/01_Parable_of_the_Pipeline/02_Parable_of_the_Pipeline_Study_Report.pdf) |
| 02 | [Cashflow Quadrant – Robert Kiyosaki](07_Business_and_Finance/02_Cashflow_Quadrant/01_Cashflow_Quadrant_Book_Robert_Kiyosaki.pdf) | [Chapter-by-chapter report](07_Business_and_Finance/02_Cashflow_Quadrant/02_Cashflow_Quadrant_Study_Report.pdf) |

---

## 08 · Interview and HR

Last, but start it early: write your introduction, STAR stories and resume once, then refine them after every interview. The guide uses your real profile and leaves clearly marked placeholders for details only you can fill in.

| # | Guide | Contents |
|---|-------|----------|
| 01 | [Interview, HR and Resume Guide](08_Interview_and_HR/01_Interview_HR_and_Resume_Guide.pdf) | Rounds, "tell me about yourself", STAR story bank, question bank, presenting projects and research, resume, offers, checklists |

Then practise under real conditions with **Mock Interview Loops**: three complete loops (fresher, SDE-1 and SDE-2), each with a timed coding round, an LLD or machine-coding round, an HLD round and a behavioural round, plus the rubrics interviewers score them with, a debrief template and a final checklist. Every coding and design solution was compiled and run with its tests, and every estimate computed. The workbook adds 20 more timed rounds to build your own loops. Sit them after the Programming, CS Fundamentals and System Design sections.

| # | Guide | Workbook |
|---|-------|----------|
| 02 | [Mock Interview Loops: DSA, LLD, HLD and HR](08_Interview_and_HR/02_Mock_Interview_Loops_Complete_Guide.pdf) (3 loops, 13 runnable programs) | [20 timed rounds with executed model answers](08_Interview_and_HR/03_Mock_Interview_Loops_Workbook.pdf) |

Then, for the years after you are hired, **The Senior Engineer Handbook**: what it takes to grow from a strong coder into a senior and staff engineer. Scope and impact, technical excellence, code review, system design and decisions, testing, reliability (SLOs, error budgets, incidents), performance and cost, technical debt, writing and communication, mentoring and leading without authority, and getting promoted. The judgement calls are backed by numbers computed and shown (how availability compounds, the cost of a late bug, Amdahl's law, error budgets, tech-debt drag).

| # | Guide | Workbook |
|---|-------|----------|
| 04 | [The Senior Engineer Handbook: Scope, Impact and Leverage](08_Interview_and_HR/04_Senior_Engineer_Handbook_Complete_Guide.pdf) (11 chapters) | [36 scenario, design and reflection exercises with worked answers](08_Interview_and_HR/05_Senior_Engineer_Handbook_Workbook.pdf) |
