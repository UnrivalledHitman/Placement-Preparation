(function () {
  "use strict";
  window.TrackerShared.registerTracker({
    id: "java",
    storageKey: "placement_java_roadmap_tracker_v1",
    taskIdPrefix: "j",
    startDateUtc: [2026,11,1],
    resourcePrefix: "../",
    backupFilePrefix: "java_backend_tracker_backup",
    hub: {
      "href": "java_dsa_sql_backend_tracker.html",
      "badge": "Java Backend",
      "headerPill": "Java Backend Track",
      "slot": 2,
      "title": "Java DSA, SQL/JDBC & Backend System Design",
      "timeline": "1 Dec 2026 – 17 May 2027 • 6 Months / 24 Weeks",
      "scope": "DSA in Java (S1.1–S10.5), MySQL 1–16 + JDBC, Concurrency, Security, Spring Boot 3, JUnit 5, Adv Backend, LLD/HLD, DBMS, Dist. Sys, Kafka & Mock Loops."
    },
    header: {
      "pageTitle": "Java DSA, SQL/JDBC & Backend System Design Tracker (24 Weeks)",
      "title": "Java SDE, SQL/JDBC & System Design Tracker",
      "subtitle": "Phase 1 (Weeks 1–12: Java DSA + MySQL/JDBC + Core CS + Spring Boot + LLD) • Phase 2 (Weeks 13–24: DBMS Internals + Kafka + Adv Backend + HLD/Dist Sys + Mock Loops)",
      "timelineBadge": "1 Dec 2026 – 17 May 2027 (24 Weeks / 168 Days)"
    },
    tracks: [
      {
        "key": "dsa",
        "slot": 1,
        "label": "Java DSA",
        "headerBadge": "Java DSA",
        "kpiTitle": "Java DSA",
        "kpiSub": "Ch.1–12 + S1.1–S10.5 + Mocks",
        "skillGroupTitle": "Java DSA Skills (7)",
        "svgLabel": "Java DSA (7 Skills)",
        "libraryHeading": "Java Core, Java DSA & Mock Loops"
      },
      {
        "key": "sql",
        "slot": 2,
        "label": "SQL & Data",
        "headerBadge": "SQL, JDBC & Data",
        "kpiTitle": "SQL, JDBC & Data",
        "kpiSub": "MySQL 1–16 + JDBC + DBMS + Kafka",
        "skillGroupTitle": "SQL, JDBC, DBMS Internals & Kafka Skills (6)",
        "svgLabel": "SQL, JDBC & Kafka (6 Skills)",
        "libraryHeading": "MySQL, JDBC, DBMS Theory & Kafka"
      },
      {
        "key": "backend",
        "slot": 3,
        "label": "Backend & Sys Design",
        "headerBadge": "Java Backend & Sys Design",
        "kpiTitle": "Backend & Sys Design",
        "kpiSub": "Spring + Conc + Security + LLD/HLD",
        "skillGroupTitle": "Java Backend, CS & System Design Skills (8)",
        "svgLabel": "Backend & Sys Design (8 Skills)",
        "libraryHeading": "CS Fundamentals, Concurrency, Security, Spring, LLD, HLD & Senior"
      }
    ],
    phases: [
      {
        "id": 1,
        "minWeek": 1,
        "maxWeek": 12,
        "chipColor": "var(--primary)",
        "dailyLabel": "Phase 1: Core Java DSA + SQL/JDBC + Spring + LLD",
        "heading": "Phase 1: Core 12-Week Java DSA + MySQL/JDBC + Core CS + Spring + LLD (Weeks 1–12)",
        "subtitle": "1 Dec 2026 – 22 Feb 2027 • S1.1–S10.5, MySQL 1–16 + JDBC, OS/Linux/Git/CN, Concurrency, Security, Spring Boot (Proj 1) & Java LLD (Proj 2)"
      },
      {
        "id": 2,
        "minWeek": 13,
        "maxWeek": 24,
        "chipColor": "var(--chart-3)",
        "dailyLabel": "Phase 2: DBMS Internals + Kafka + Adv Backend + HLD/Dist",
        "heading": "Phase 2: DBMS Internals, Kafka, Adv Backend & System Design Peak (Weeks 13–24)",
        "subtitle": "23 Feb – 17 May 2027 • Java Maint + Loops B/C, DBMS Theory, Kafka Streams, Adv Backend (Proj 3), HLD, Distributed Systems & Senior/HR"
      }
    ],
    ui: {
      "searchPlaceholder": "Search S1.3, S8.4, Spring, Kafka, Raft, Smart-Meter...",
      "monthlyTabLabel": "Monthly Targets & Projects (6m)",
      "monthlyTargetsHeading": "Monthly Mastery Targets & Projects",
      "skillsKpiSub": "21 Java/Backend competencies",
      "skillsMatrixTitle": "Skill-Wise Acquisition Matrix (21 Java Backend Skills)",
      "skillsChartAriaLabel": "Java SDE Competency Summary",
      "skillsChartCombinedLabel": "Combined Java Roadmap (21)",
      "noteLabel": "Error / Architecture Note:",
      "notePlaceholder": "Log Java overflow/bug, SQL EXPLAIN finding or design trade-off for Day {dayNum}...",
      "notesPanelTitle": "Error & Architecture Log Notes",
      "notesPanelDesc": "Your daily bug diagnostics & architecture notes aggregate here.",
      "notesEmptyText": "No notes logged yet. Record any Java bug or design note on any Day card.",
      "redoDesc": "Flagged ~ Redo tasks appear here with their 7-day target re-solve date.",
      "redoEmptyText": "Redo queue empty. Flag tricky problems with ~ Redo to revisit in 7 days.",
      "libraryTitle": "Java SDE & System Design Library",
      "exportTitle": "Export Java SDE Progress JSON",
      "exportDesc": "Copy or download your Java Backend & System Design progress snapshot.",
      "importTitle": "Import Java SDE Progress JSON",
      "resetToast": "Java tracker progress reset cleanly.",
      "weekChipMinWidth": "76px"
    },
    resources: {
      "java_guide": {
        "title": "Java: The Complete Guide",
        "path": "03_Programming/01_Java/01_Java_Complete_Guide.pdf",
        "track": "dsa"
      },
      "java_ref": {
        "title": "Java Classes & Methods Reference",
        "path": "03_Programming/01_Java/02_Java_Classes_and_Methods_Reference.pdf",
        "track": "dsa"
      },
      "java_prac": {
        "title": "Java Practice Questions (Chapterwise)",
        "path": "03_Programming/01_Java/03_Java_Practice_Questions_Chapterwise.pdf",
        "track": "dsa"
      },
      "java_cpa": {
        "title": "Java TCS CPA Practice Sets",
        "path": "03_Programming/01_Java/04_Java_TCS_CPA_Practice_Sets.pdf",
        "track": "dsa"
      },
      "java_rev": {
        "title": "Java Quick Revision (TCS CPA)",
        "path": "03_Programming/01_Java/05_Java_Quick_Revision_TCS_CPA.pdf",
        "track": "dsa"
      },
      "jdsa_guide": {
        "title": "DSA in Java: Complete Guide (12 Ch.)",
        "path": "03_Programming/04_DSA_in_Java/01_DSA_in_Java_Complete_Guide.pdf",
        "track": "dsa"
      },
      "jdsa_prac": {
        "title": "DSA in Java: Practice Book (49 Ex.)",
        "path": "03_Programming/04_DSA_in_Java/02_DSA_in_Java_Practice_Book.pdf",
        "track": "dsa"
      },
      "jdsa_rev": {
        "title": "DSA in Java: Quick Revision (14p)",
        "path": "03_Programming/04_DSA_in_Java/03_DSA_in_Java_Quick_Revision.pdf",
        "track": "dsa"
      },
      "sql_guide": {
        "title": "MySQL: Complete Guide (Parts 1–16)",
        "path": "03_Programming/02_MySQL/01_MySQL_Complete_Guide.pdf",
        "track": "sql"
      },
      "sql_ref": {
        "title": "MySQL Commands & Functions Reference",
        "path": "03_Programming/02_MySQL/02_MySQL_Commands_and_Functions_Reference.pdf",
        "track": "sql"
      },
      "sql_prac": {
        "title": "MySQL Practice Questions (Chapterwise)",
        "path": "03_Programming/02_MySQL/03_MySQL_Practice_Questions_Chapterwise.pdf",
        "track": "sql"
      },
      "sql_rev": {
        "title": "MySQL Quick Revision",
        "path": "03_Programming/02_MySQL/04_MySQL_Quick_Revision.pdf",
        "track": "sql"
      },
      "jdbc_guide": {
        "title": "JDBC & Java Persistence Guide (14 Prog.)",
        "path": "03_Programming/03_JDBC_and_Persistence/01_JDBC_and_Persistence_Complete_Guide.pdf",
        "track": "sql"
      },
      "jdbc_prac": {
        "title": "JDBC & Persistence Practice Book (28 Ex.)",
        "path": "03_Programming/03_JDBC_and_Persistence/02_JDBC_and_Persistence_Practice_Book.pdf",
        "track": "sql"
      },
      "dbms_guide": {
        "title": "DBMS Theory: Normal Forms to Dist. Data",
        "path": "04_CS_Fundamentals/05_DBMS_Theory/01_DBMS_Theory_Complete_Guide.pdf",
        "track": "sql"
      },
      "dbms_prac": {
        "title": "DBMS Theory: Practice Book (52 Ex.)",
        "path": "04_CS_Fundamentals/05_DBMS_Theory/02_DBMS_Theory_Practice_Book.pdf",
        "track": "sql"
      },
      "kafka_guide": {
        "title": "Kafka & Stream Processing Guide",
        "path": "05_System_Design/04_Kafka_and_Stream_Processing/01_Kafka_and_Stream_Processing_Complete_Guide.pdf",
        "track": "sql"
      },
      "kafka_prac": {
        "title": "Kafka & Streams Practice Book (20 Ex.)",
        "path": "05_System_Design/04_Kafka_and_Stream_Processing/02_Kafka_and_Stream_Processing_Practice_Book.pdf",
        "track": "sql"
      },
      "os_guide": {
        "title": "Operating Systems: Complete Guide",
        "path": "04_CS_Fundamentals/01_Operating_Systems/01_Operating_Systems_Complete_Guide.pdf",
        "track": "backend"
      },
      "os_prac": {
        "title": "Operating Systems: Practice Book (52 Ex.)",
        "path": "04_CS_Fundamentals/01_Operating_Systems/02_Operating_Systems_Practice_Book.pdf",
        "track": "backend"
      },
      "linux_guide": {
        "title": "Linux for Software Engineers Guide",
        "path": "04_CS_Fundamentals/02_Linux/01_Linux_for_Software_Engineers_Complete_Guide.pdf",
        "track": "backend"
      },
      "linux_prac": {
        "title": "Linux: Practice Book (36 Ex.)",
        "path": "04_CS_Fundamentals/02_Linux/02_Linux_for_Software_Engineers_Practice_Book.pdf",
        "track": "backend"
      },
      "git_guide": {
        "title": "Git Internals & Team Workflows Guide",
        "path": "04_CS_Fundamentals/03_Git_Internals_and_Workflows/01_Git_Internals_and_Workflows_Complete_Guide.pdf",
        "track": "backend"
      },
      "git_prac": {
        "title": "Git Internals: Practice Book (20 Ex.)",
        "path": "04_CS_Fundamentals/03_Git_Internals_and_Workflows/02_Git_Internals_and_Workflows_Practice_Book.pdf",
        "track": "backend"
      },
      "cn_guide": {
        "title": "Computer Networks: Complete Guide",
        "path": "04_CS_Fundamentals/04_Computer_Networks/01_Computer_Networks_Complete_Guide.pdf",
        "track": "backend"
      },
      "cn_prac": {
        "title": "Computer Networks: Practice Book (44 Ex.)",
        "path": "04_CS_Fundamentals/04_Computer_Networks/02_Computer_Networks_Practice_Book.pdf",
        "track": "backend"
      },
      "devops_guide": {
        "title": "DevOps & Cloud: Commit to Production",
        "path": "04_CS_Fundamentals/06_DevOps_and_Cloud/01_DevOps_and_Cloud_Complete_Guide.pdf",
        "track": "backend"
      },
      "devops_prac": {
        "title": "DevOps & Cloud: Practice Book (25 Ex.)",
        "path": "04_CS_Fundamentals/06_DevOps_and_Cloud/02_DevOps_and_Cloud_Practice_Book.pdf",
        "track": "backend"
      },
      "conc_guide": {
        "title": "Java Concurrency: Threads to Virtual Threads",
        "path": "03_Programming/06_Java_Concurrency/01_Java_Concurrency_Complete_Guide.pdf",
        "track": "backend"
      },
      "conc_prac": {
        "title": "Java Concurrency: Practice Book (25 Ex.)",
        "path": "03_Programming/06_Java_Concurrency/02_Java_Concurrency_Practice_Book.pdf",
        "track": "backend"
      },
      "sec_guide": {
        "title": "Security Engineering: Crypto to OWASP",
        "path": "03_Programming/07_Security_Engineering/01_Security_Engineering_Complete_Guide.pdf",
        "track": "backend"
      },
      "sec_prac": {
        "title": "Security Engineering: Practice Book (34 Ex.)",
        "path": "03_Programming/07_Security_Engineering/02_Security_Engineering_Practice_Book.pdf",
        "track": "backend"
      },
      "spring_guide": {
        "title": "Spring Boot Backend: Beans to Production",
        "path": "03_Programming/08_Backend_Spring_Boot/01_Backend_Spring_Boot_Complete_Guide.pdf",
        "track": "backend"
      },
      "spring_prac": {
        "title": "Spring Boot Backend: Practice Book (31 Ex.)",
        "path": "03_Programming/08_Backend_Spring_Boot/02_Backend_Spring_Boot_Practice_Book.pdf",
        "track": "backend"
      },
      "test_guide": {
        "title": "Software Testing: JUnit 5 to Testcontainers",
        "path": "03_Programming/09_Software_Testing/01_Software_Testing_Complete_Guide.pdf",
        "track": "backend"
      },
      "test_prac": {
        "title": "Software Testing: Practice Book (20 Ex.)",
        "path": "03_Programming/09_Software_Testing/02_Software_Testing_Practice_Book.pdf",
        "track": "backend"
      },
      "abe_guide": {
        "title": "Advanced Back-end Engineering Guide",
        "path": "03_Programming/11_Advanced_Backend_Engineering/01_Advanced_Backend_Engineering_Complete_Guide.pdf",
        "track": "backend"
      },
      "abe_prac": {
        "title": "Advanced Back-end Practice Book (33 Ex.)",
        "path": "03_Programming/11_Advanced_Backend_Engineering/02_Advanced_Backend_Engineering_Practice_Book.pdf",
        "track": "backend"
      },
      "lld_guide": {
        "title": "Low-Level Design in Java: Guide",
        "path": "05_System_Design/01_Low_Level_Design/01_Low_Level_Design_Complete_Guide.pdf",
        "track": "backend"
      },
      "lld_prac": {
        "title": "Low-Level Design in Java: Practice (41 Ex.)",
        "path": "05_System_Design/01_Low_Level_Design/02_Low_Level_Design_Practice_Book.pdf",
        "track": "backend"
      },
      "hld_guide": {
        "title": "System Design (HLD): Estimates to Cases",
        "path": "05_System_Design/02_High_Level_Design/01_System_Design_Complete_Guide.pdf",
        "track": "backend"
      },
      "hld_prac": {
        "title": "System Design (HLD): Practice Book (35 Ex.)",
        "path": "05_System_Design/02_High_Level_Design/02_System_Design_Practice_Book.pdf",
        "track": "backend"
      },
      "dist_guide": {
        "title": "Distributed Systems: Time, Consensus, Repl.",
        "path": "05_System_Design/03_Distributed_Systems/01_Distributed_Systems_Complete_Guide.pdf",
        "track": "backend"
      },
      "dist_prac": {
        "title": "Distributed Systems: Practice Book (25 Ex.)",
        "path": "05_System_Design/03_Distributed_Systems/02_Distributed_Systems_Practice_Book.pdf",
        "track": "backend"
      },
      "hr_guide": {
        "title": "Interview, HR & Resume Guide",
        "path": "08_Interview_and_HR/01_Interview_HR_and_Resume_Guide.pdf",
        "track": "backend"
      },
      "mock_guide": {
        "title": "Mock Interview Loops: Complete Guide",
        "path": "08_Interview_and_HR/02_Mock_Interview_Loops_Complete_Guide.pdf",
        "track": "dsa"
      },
      "mock_work": {
        "title": "Mock Interview Loops: Workbook (20 Rounds)",
        "path": "08_Interview_and_HR/03_Mock_Interview_Loops_Workbook.pdf",
        "track": "dsa"
      },
      "senior_guide": {
        "title": "The Senior Engineer Handbook Guide",
        "path": "08_Interview_and_HR/04_Senior_Engineer_Handbook_Complete_Guide.pdf",
        "track": "backend"
      },
      "senior_prac": {
        "title": "Senior Engineer Handbook Workbook (36 Ex.)",
        "path": "08_Interview_and_HR/05_Senior_Engineer_Handbook_Workbook.pdf",
        "track": "backend"
      }
    },
    skills: [
      {
        "id": "dsa_toolkit",
        "track": "dsa",
        "short": "Java Toolkit & Big-O",
        "name": "Complexity, Collections & Java Pitfalls",
        "desc": "Operation counting (~10^8 ops/s), ArrayDeque/PriorityQueue/TreeMap/HashMap costs, int overflow, Integer == trap & StringBuilder.",
        "resources": [
          "jdsa_guide",
          "jdsa_prac",
          "jdsa_rev",
          "java_ref"
        ],
        "milestone": "Ch.1 + S1.1–S1.3"
      },
      {
        "id": "dsa_arrays",
        "track": "dsa",
        "short": "Arrays, Hash, 2-Ptr",
        "name": "Arrays, Strings, Hashing & Sliding Window",
        "desc": "Prefix sums, difference arrays, HashMap counts, two pointers, variable/fixed windows, Kadane & matrix traversals.",
        "resources": [
          "jdsa_guide",
          "jdsa_prac"
        ],
        "milestone": "Ch.2 + S2.1–S2.6"
      },
      {
        "id": "dsa_bsearch",
        "track": "dsa",
        "short": "Binary Search & Intv",
        "name": "Binary Search (long), Sorting & Intervals",
        "desc": "First-true lo < hi binary search, mid overflow safety, Long.MAX_VALUE integer sqrt, custom comparators & intervals.",
        "resources": [
          "jdsa_guide",
          "jdsa_prac"
        ],
        "milestone": "Ch.3 + S3.1–S3.5"
      },
      {
        "id": "dsa_linear",
        "track": "dsa",
        "short": "Lists & Mono Stack",
        "name": "Linked Lists, ArrayDeque & Monotonic Stacks",
        "desc": "Dummy head pointers, in-place O(1) reversal/k-groups, two-stack queues, ArrayDeque monotonic stack & sliding max.",
        "resources": [
          "jdsa_guide",
          "jdsa_prac"
        ],
        "milestone": "Ch.4 + S4.1–S4.5"
      },
      {
        "id": "dsa_trees",
        "track": "dsa",
        "short": "Backtrack & Trees",
        "name": "Backtracking (Bitmask), Binary Trees & BSTs",
        "desc": "Choose-explore-unchoose pruning, O(1) palindrome table, bitmask N-Queens, bottom-up tree state, zigzag BFS & BST ops.",
        "resources": [
          "jdsa_guide",
          "jdsa_prac"
        ],
        "milestone": "Ch.5–6 + S5.1–S6.5"
      },
      {
        "id": "dsa_graphs",
        "track": "dsa",
        "short": "Heaps, Maps & Graphs",
        "name": "PriorityQueue, HashMap Internals & Graphs",
        "desc": "Top-k/scheduling heaps, HashMap collision/tree-bin experiments, bipartite BFS, 8-dir grid paths, topo sort, Bellman-Ford & DSU.",
        "resources": [
          "jdsa_guide",
          "jdsa_prac",
          "mock_guide"
        ],
        "milestone": "Ch.7–8 + S7.1–S8.5"
      },
      {
        "id": "dsa_dp_adv",
        "track": "dsa",
        "short": "DP, Bits & Tries",
        "name": "DP, Greedy, Bits, Binary Tries & Fenwick",
        "desc": "State/transition/base DP, Matrix-Chain interval DP, Stock cooldown, SPF prime sieve, Binary Trie Max XOR & Fenwick Tree.",
        "resources": [
          "jdsa_guide",
          "jdsa_prac",
          "jdsa_rev",
          "mock_work"
        ],
        "milestone": "Ch.9–12 + S9.1–S10.5"
      },
      {
        "id": "sql_model",
        "track": "sql",
        "short": "Modelling & BCNF",
        "name": "Relational Modelling, DDL & Normalisation",
        "desc": "ER cardinality, PK/FK/CHECK constraints, types, functional dependencies, 1NF to BCNF lossless/dep preservation.",
        "resources": [
          "sql_guide",
          "sql_prac",
          "dbms_guide"
        ],
        "milestone": "MySQL Pts 1–3, 13 + DBMS Ch.3"
      },
      {
        "id": "sql_core",
        "track": "sql",
        "short": "DML, SELECT & Agg",
        "name": "DML, SELECT Depth, 3-Valued NULL & Agg",
        "desc": "INSERT/UPDATE/DELETE, AS new upsert trap, NULL truth tables, GROUP BY, HAVING, ROLLUP & GROUP_CONCAT.",
        "resources": [
          "sql_guide",
          "sql_ref",
          "sql_prac"
        ],
        "milestone": "MySQL Parts 4–6"
      },
      {
        "id": "sql_joins",
        "track": "sql",
        "short": "Joins, Subq & CTEs",
        "name": "Joins, Subqueries, Set Ops & Recursive CTEs",
        "desc": "Inner/left/self/anti-joins, correlated subqueries vs EXISTS, UNION/INTERSECT, non-recursive & recursive WITH.",
        "resources": [
          "sql_guide",
          "sql_prac"
        ],
        "milestone": "MySQL Parts 7–8"
      },
      {
        "id": "sql_windows_perf",
        "track": "sql",
        "short": "Windows & EXPLAIN",
        "name": "Window Functions, B+ Trees & Query Opt.",
        "desc": "ROW_NUMBER/RANK/LAG frames, B+ Tree leftmost prefixes, covering indexes, EXPLAIN plans, hash joins & cost.",
        "resources": [
          "sql_guide",
          "dbms_guide",
          "dbms_prac"
        ],
        "milestone": "MySQL Pt 9–10 + DBMS Ch.7–8"
      },
      {
        "id": "sql_jdbc_tx",
        "track": "sql",
        "short": "JDBC, ACID & Locks",
        "name": "JDBC, HikariCP, Transactions, MVCC & Recovery",
        "desc": "PreparedStatement SQLi fix, HikariCP pools, strict 2PL deadlocks, MVCC snapshot write-skew, ARIES & isolation.",
        "resources": [
          "sql_guide",
          "jdbc_guide",
          "jdbc_prac",
          "dbms_guide"
        ],
        "milestone": "MySQL Pt 11–14 + JDBC + DBMS Ch.4–6"
      },
      {
        "id": "sql_kafka",
        "track": "sql",
        "short": "Kafka & Event Logs",
        "name": "Kafka Event Log, Producers & Stream Processing",
        "desc": "Partition keys (murmur2), ISR replication, idempotent/EOS producers, consumer groups, compaction & watermarks.",
        "resources": [
          "kafka_guide",
          "kafka_prac"
        ],
        "milestone": "Kafka Ch.1–10"
      },
      {
        "id": "be_cs_core",
        "track": "backend",
        "short": "Java/OS/Linux/Git/CN",
        "name": "Core Java, OS, Linux, Git Internals & Networks",
        "desc": "Processes/paging/deadlocks, Linux shell/signals, Git object graph/rebase, TCP/TLS packets & core Java 21 OOP.",
        "resources": [
          "java_guide",
          "os_guide",
          "linux_guide",
          "git_guide",
          "cn_guide"
        ],
        "milestone": "Java + OS + Linux + Git + CN"
      },
      {
        "id": "be_concurrency",
        "track": "backend",
        "short": "Java Concurrency",
        "name": "Java Concurrency: JMM, Locks & Virtual Threads",
        "desc": "Atomicity/visibility/ordering, happens-before, ReentrantLock/StampedLock, CAS/ABA, executors, CompletableFuture & virtual threads.",
        "resources": [
          "conc_guide",
          "conc_prac"
        ],
        "milestone": "Java Concurrency Ch.1–10"
      },
      {
        "id": "be_security",
        "track": "backend",
        "short": "Security & OWASP",
        "name": "Security Engineering: Crypto, JWT, mTLS & OWASP",
        "desc": "AES-GCM/HMAC/signatures, Argon2id/JWT/TOTP/OAuth PKCE, mutual TLS, PCI webhooks & OWASP Top 10 defences.",
        "resources": [
          "sec_guide",
          "sec_prac"
        ],
        "milestone": "Security Engineering Ch.1–9"
      },
      {
        "id": "be_spring",
        "track": "backend",
        "short": "Spring Boot 3",
        "name": "Spring Boot 3, JPA, Security & Smart-Meter API",
        "desc": "IoC/beans, REST validation, JPA/Hibernate N+1 & locking, Security filter chains, Actuator & Smart-Meter REST project.",
        "resources": [
          "spring_guide",
          "spring_prac"
        ],
        "milestone": "Spring Boot Ch.1–11 + Project 1"
      },
      {
        "id": "be_testing_devops",
        "track": "backend",
        "short": "JUnit 5 & DevOps",
        "name": "Software Testing (JUnit 5/Mockito) & DevOps/Cloud",
        "desc": "Boundary/property tests, Mockito doubles, Testcontainers, mutation testing, Docker cache, K8s probes/HPA & Terraform.",
        "resources": [
          "test_guide",
          "test_prac",
          "devops_guide",
          "devops_prac"
        ],
        "milestone": "Testing + DevOps Ch.1–10"
      },
      {
        "id": "be_adv_backend",
        "track": "backend",
        "short": "Redis & Adv Backend",
        "name": "Advanced Back-End: Redis, Rate Limits & Sagas",
        "desc": "Cache-aside/XFetch stampedes, token-bucket rate limiters, idempotency keys, transactional outbox, SSE/WS & gRPC/NoSQL.",
        "resources": [
          "abe_guide",
          "abe_prac"
        ],
        "milestone": "Adv Back-end Ch.1–9 + Project 3"
      },
      {
        "id": "be_lld",
        "track": "backend",
        "short": "Java LLD & Patterns",
        "name": "Low-Level Design in Java (SOLID, GoF & Coding)",
        "desc": "SOLID refactors, Creational/Structural/Behavioural patterns & 12 machine-coding designs (LRU, Elevator, Splitwise).",
        "resources": [
          "lld_guide",
          "lld_prac"
        ],
        "milestone": "LLD Ch.1–9 + Project 2"
      },
      {
        "id": "be_hld_dist",
        "track": "backend",
        "short": "HLD, Dist Sys & HR",
        "name": "HLD Architecture, Consensus, Senior Habits & HR",
        "desc": "Estimation, CDN/consistent hashing, Smart-Meter/EV HLD, Raft/Paxos/CRDTs, SLOs/error budgets & Mock/STAR loops.",
        "resources": [
          "hld_guide",
          "dist_guide",
          "senior_guide",
          "hr_guide"
        ],
        "milestone": "HLD + Dist + Senior + Mock Loops"
      }
    ],
    months: [
      {
        "id": 1,
        "title": "Month 1: Java Foundations, Core CS & Concurrency Pt 1",
        "period": "1 Dec – 28 Dec 2026",
        "phase": "Phase 1 • Core 12-Week Java Sprint",
        "weeks": [
          1,
          2,
          3,
          4
        ],
        "summary": "Lock in Java 21 10^8 ops/s collections, overflow/== traps, arrays, binary search, monotonic stacks and bitmask backtracking alongside MySQL Parts 1–6, Core Java OOP, OS, Linux, Git, Computer Networks & Java Concurrency Pt 1.",
        "skills": [
          "dsa_toolkit",
          "dsa_arrays",
          "dsa_bsearch",
          "dsa_linear",
          "dsa_trees",
          "sql_model",
          "sql_core",
          "be_cs_core",
          "be_concurrency"
        ],
        "targets": [
          {
            "id": "jm1_t1",
            "track": "dsa",
            "text": "Complete DSA in Java Ch.1–5 and pass all 22 exercises S1.1–S5.4 (incl. S1.3 Java traps & S5.4 bitmask N-Queens).",
            "tag": "Ch.1–5 • 22 Ex."
          },
          {
            "id": "jm1_t2",
            "track": "sql",
            "text": "Finish MySQL Parts 1–6 (Modelling, DDL, DML, NULL-safe SELECT & Aggregation) and execute Parts 1–6 queries.",
            "tag": "MySQL Parts 1–6"
          },
          {
            "id": "jm1_t3",
            "track": "backend",
            "text": "Review Core Java, OS, Linux shell, Git internals & Computer Networks + start Java Concurrency Ch.1–5.",
            "tag": "Core CS + Conc Pt 1"
          },
          {
            "id": "jm1_t4",
            "track": "dsa",
            "text": "Clear Month 1 Redo Queue so ArrayDeque, long binary search & recursion traps are zeroed out.",
            "tag": "Accuracy Gate"
          }
        ]
      },
      {
        "id": 2,
        "title": "Month 2: Trees/Graphs, Joins/Windows, Security & Spring Boot",
        "period": "29 Dec 2026 – 25 Jan 2027",
        "phase": "Phase 1 • Core 12-Week Java Sprint",
        "weeks": [
          5,
          6,
          7,
          8
        ],
        "summary": "Master Binary Trees, PriorityQueue/HashMap internals and Graph algorithms while completing MySQL Parts 7–10, Java Concurrency Pt 2 (Virtual Threads), Security Engineering (Crypto/JWT/OWASP) & Spring Boot 3 (Project 1).",
        "skills": [
          "dsa_trees",
          "dsa_graphs",
          "sql_joins",
          "sql_windows_perf",
          "be_concurrency",
          "be_security",
          "be_spring"
        ],
        "targets": [
          {
            "id": "jm2_t1",
            "track": "dsa",
            "text": "Finish DSA in Java Ch.6–8 (Trees/BSTs, PriorityQueue/HashMap internals, Graphs/Bellman-Ford/DSU) & solve S6.1–S8.5.",
            "tag": "Ch.6–8 • 14 Ex."
          },
          {
            "id": "jm2_t2",
            "track": "sql",
            "text": "Complete MySQL Parts 7–10 (Joins, Subqueries, Recursive CTEs, Window Functions & B-Tree Indexing/EXPLAIN).",
            "tag": "MySQL Parts 7–10"
          },
          {
            "id": "jm2_t3",
            "track": "backend",
            "text": "Finish Java Concurrency Ch.6–10 & Security Engineering Ch.1–9 (AES-GCM, Argon2id/JWT, mTLS, OWASP).",
            "tag": "Concurrency + Sec"
          },
          {
            "id": "jm2_t4",
            "track": "backend",
            "text": "Complete Spring Boot Backend Ch.1–11 + ship Portfolio Project 1 (Smart-Meter REST API on GitHub).",
            "tag": "Project 1: Spring API"
          }
        ]
      },
      {
        "id": 3,
        "title": "Month 3: DP, JDBC/Tx, JUnit Testing, DevOps & Java LLD Suite",
        "period": "26 Jan – 22 Feb 2027",
        "phase": "Phase 1 • Sprint Finale (End of 12-Week Plan)",
        "weeks": [
          9,
          10,
          11,
          12
        ],
        "summary": "Finish the 12-week Java DSA + SQL/JDBC roadmap (DP, Matrix-Chain, Binary Trie, Fenwick, 14p Quick Rev, TCS CPA Java sets, Loop A) alongside JUnit 5/Mockito Testing, DevOps/Cloud & Java 21 Low-Level Design (Project 2).",
        "skills": [
          "dsa_dp_adv",
          "sql_jdbc_tx",
          "sql_model",
          "be_testing_devops",
          "be_lld"
        ],
        "targets": [
          {
            "id": "jm3_t1",
            "track": "dsa",
            "text": "Complete DSA Ch.9–12 (S9.1–S10.5), 14p Java Quick Rev, TCS CPA Java sets & Mock Loop A coding round.",
            "tag": "12-Week Java Done"
          },
          {
            "id": "jm3_t2",
            "track": "sql",
            "text": "Complete MySQL Parts 11–16, Full JDBC Guide/Practice (HikariCP, Isolations, Batching) & MySQL Quick Revision.",
            "tag": "16/16 SQL + JDBC"
          },
          {
            "id": "jm3_t3",
            "track": "backend",
            "text": "Complete Software Testing (JUnit 5/Mockito/Testcontainers) & DevOps/Cloud (Docker/K8s/Canaries/Terraform).",
            "tag": "Testing + DevOps"
          },
          {
            "id": "jm3_t4",
            "track": "backend",
            "text": "Finish Low-Level Design Ch.1–9 (SOLID/GoF/12 Case Studies) & ship Project 2 (Java 21 Machine-Coding Suite).",
            "tag": "Project 2: Java LLD"
          }
        ]
      },
      {
        "id": 4,
        "title": "Month 4: DBMS Internals, Redis/Adv Backend & HLD Foundations",
        "period": "23 Feb – 22 Mar 2027",
        "phase": "Phase 2 • Architecture & Interview Peak",
        "weeks": [
          13,
          14,
          15,
          16
        ],
        "summary": "Keep Java DSA sharp on timed maintenance drills (+ Mock Loop B) while diving beneath MySQL into DBMS Theory (Normalisation, 2PL, MVCC, ARIES) & Advanced Backend (Redis 7, Rate Limiters, Sagas, gRPC — Project 3).",
        "skills": [
          "dsa_arrays",
          "dsa_trees",
          "dsa_graphs",
          "dsa_dp_adv",
          "sql_model",
          "sql_jdbc_tx",
          "be_adv_backend",
          "be_hld_dist"
        ],
        "targets": [
          {
            "id": "jm4_t1",
            "track": "dsa",
            "text": "Run 4 weekly Java maintenance sprints (Arrays, Trees/Heaps, Graphs, DP) + pass Mock Loop B (SDE-1 coding).",
            "tag": "Maint + Loop B"
          },
          {
            "id": "jm4_t2",
            "track": "sql",
            "text": "Complete DBMS Theory Ch.1–6 (Relational Algebra, BCNF/3NF, 2PL Deadlock, MVCC Write Skew & ARIES Recovery).",
            "tag": "DBMS Internals 1–6"
          },
          {
            "id": "jm4_t3",
            "track": "backend",
            "text": "Complete Advanced Back-end Ch.1–9 (Redis Stampedes, Idempotency, Outbox/Sagas, WS/SSE, GraphQL/gRPC, NoSQL).",
            "tag": "Adv Backend + Redis"
          },
          {
            "id": "jm4_t4",
            "track": "backend",
            "text": "Ship Project 3 (Production Smart-Meter Upgrade: Redis caching, rate limiting & idempotent webhooks).",
            "tag": "Project 3: Prod Upgrade"
          }
        ]
      },
      {
        "id": 5,
        "title": "Month 5: Query Opt, Kafka Streams, HLD Cases & Distributed Consensus",
        "period": "23 Mar – 19 Apr 2027",
        "phase": "Phase 2 • Architecture & Interview Peak",
        "weeks": [
          17,
          18,
          19,
          20
        ],
        "summary": "Pair timed Java OA simulations and Loop C Hard coding with B+ Trees/Query Cost, Kafka internals, full High-Level System Design (13 case studies) & Distributed Systems Consensus (Paxos, Raft, CRDTs).",
        "skills": [
          "dsa_linear",
          "dsa_graphs",
          "dsa_dp_adv",
          "sql_windows_perf",
          "sql_kafka",
          "be_hld_dist"
        ],
        "targets": [
          {
            "id": "jm5_t1",
            "track": "dsa",
            "text": "Pass 60-min 2-problem Java OA simulation & Mock Loop C (SDE-2 coding with TreeSet/BFS) cleanly.",
            "tag": "OA + Loop C"
          },
          {
            "id": "jm5_t2",
            "track": "sql",
            "text": "Finish DBMS Ch.7–10 (B+ Trees, Hash Joins, Query Opt, 2PC) & Kafka Ch.1–5 (Partitions, Replication, Consumers).",
            "tag": "DBMS 7–10 + Kafka"
          },
          {
            "id": "jm5_t3",
            "track": "backend",
            "text": "Complete High-Level System Design Ch.1–11 + Practice Book (35 exercises: CDN, Smart-Meter, EV Charging).",
            "tag": "HLD 13 Case Studies"
          },
          {
            "id": "jm5_t4",
            "track": "backend",
            "text": "Complete Distributed Systems Ch.1–10 + Practice Book (Clocks, Linearizability, Paxos, Raft, CRDTs, Gossip).",
            "tag": "Dist. Systems Consensus"
          }
        ]
      },
      {
        "id": 6,
        "title": "Month 6: Kafka EOS, Mock Interview Loops, Senior Habits & HR Peak",
        "period": "20 Apr – 17 May 2027",
        "phase": "Phase 2 • Architecture & Interview Peak",
        "weeks": [
          21,
          22,
          23,
          24
        ],
        "summary": "Bring everything together: Top-20 Java patterns + Mock Workbook Coding/LLD/HLD loops, Kafka EOS & SQL interview clinic, Senior Engineer Handbook judgement models (SLOs, Amdahl, Tech Debt) & HR/STAR story bank.",
        "skills": [
          "dsa_toolkit",
          "dsa_arrays",
          "dsa_dp_adv",
          "sql_windows_perf",
          "sql_jdbc_tx",
          "sql_kafka",
          "be_lld",
          "be_hld_dist"
        ],
        "targets": [
          {
            "id": "jm6_t1",
            "track": "dsa",
            "text": "Sprint Top-20 Java coding patterns, pass 3 Workbook timed coding rounds & zero out Redo Queue.",
            "tag": "Interview Ready"
          },
          {
            "id": "jm6_t2",
            "track": "sql",
            "text": "Complete Kafka Ch.6–10 (EOS/Streams), MySQL Quick Revision & timed SQL/JDBC/DBMS interview drills.",
            "tag": "Data/SQL Peak"
          },
          {
            "id": "jm6_t3",
            "track": "backend",
            "text": "Complete Mock Loops Workbook (LLD + HLD + HR rounds) & Senior Engineer Handbook Ch.1–11 (36 exercises).",
            "tag": "Mock Loops + Senior"
          },
          {
            "id": "jm6_t4",
            "track": "backend",
            "text": "Finalise HR/Resume Guide, STAR Story Bank & Projects 1–3 GitHub showcases.",
            "tag": "HR & Portfolio Done"
          }
        ]
      }
    ],
    weeks: [
    {
      id: 1,
      month: 1,
      title: "Java Toolkit, Arrays, DB Modelling & Core OS",
      focus: ["Ch.1–2 (S1.1–S2.6)","MySQL Parts 1–2","Core Java OOP + Operating Systems"],
      practiceTag: "S1.1–S2.6 • MySQL Pts 1–2 • Java + OS",
      targets: [
        {"id":"jw1_d","track":"dsa","text":"Finish Ch.1–2, master Java 10^8 ops/s collections & traps (S1.3) and solve S1.1–S2.6."},
        {"id":"jw1_s","track":"sql","text":"Complete MySQL Parts 1–2 (Architecture, Data Dictionary, ER Cardinality & Keys) + run college DB."},
        {"id":"jw1_b","track":"backend","text":"Review Core Java guide chapters + OS fundamentals (Processes, Scheduling, Memory, Virtual Mem)."}
      ],
      days: [
        [
          ["dsa",["dsa_toolkit"],"Ch.1 Big-O & Collections + S1.1–S1.2","Count harmonic/log/pair loops for n=10^3..10^5 (S1.1) and map constraints to complexity (S1.2) using java Main.java.","jdsa_guide",1.3],
          ["sql",["sql_model"],"MySQL Pt 1: RDBMS & Architecture","Inspect relational algebra operators (sigma, pi, join), client commands and load college DB.","sql_guide",0.8],
          ["backend",["be_cs_core"],"Core Java Guide: OOP, Records, Streams & Traps","Review Java memory model basics, immutable classes, equals/hashCode & streams.","java_guide",1.3]
        ],
        [
          ["dsa",["dsa_toolkit"],"Ch.1 Java Traps & S1.3 Fix Five Bugs","Fix int average overflow, y-x comparator overflow, Integer == 5000, negative mod & String += loop in S1.3.","jdsa_prac",1.5],
          ["sql",["sql_model"],"MySQL Pt 1 Practice Questions","Solve Practice Book Part 1 queries on information_schema and data dictionary inspection.","sql_prac",0.8],
          ["backend",["be_cs_core"],"Java Practice Book: Core OOP & Collections Ex.","Solve key chapterwise Java exercises testing generics, collections & exceptions.","java_prac",1.2]
        ],
        [
          ["dsa",["dsa_arrays"],"Ch.2 Prefix Sums & S2.1–S2.2","Solve S2.1 (Product except self without division) & S2.2 (Longest subarray sum k on negatives).","jdsa_prac",1.5],
          ["sql",["sql_model"],"MySQL Pt 2: ER Diagrams & Keys","Model 1:1, 1:N, M:N cardinalities, candidate keys and foreign-key cascades.","sql_guide",0.9],
          ["backend",["be_cs_core"],"OS Ch.1–3: Processes, Threads & CPU Scheduling","Study PCB, context switch cost, multi-level feedback queues & deadlock conditions.","os_guide",1.4]
        ],
        [
          ["dsa",["dsa_arrays"],"Ch.2 Sliding Window & S2.3–S2.5","Implement S2.3 (At most k distinct), S2.4 (O(1) trapping rain water) & S2.5 (All anagram positions).","jdsa_prac",1.6],
          ["sql",["sql_model"],"MySQL Pt 2 Schema Practice","Solve Practice Book Part 2 modelling exercises verifying PK/FK/UNIQUE constraints.","sql_prac",0.9],
          ["backend",["be_cs_core"],"OS Ch.4–6: Paging, Virtual Mem & File Systems","Work TLB hit-ratio, page fault & inode numericals cleanly.","os_guide",1.4]
        ],
        [
          ["dsa",["dsa_arrays"],"S2.6 Subarrays Divisible by k + Java Ref","Solve S2.6 (Hard, ((sum%k)+k)%k negative mod) and bookmark Collections in Classes Reference.","java_ref",1.5],
          ["sql",["sql_core"],"MySQL Command Reference Bookmarking","Audit DDL/DML syntax templates in Reference and verify college seed tables.","sql_ref",0.8],
          ["backend",["be_cs_core"],"OS Practice Book Numericals & Concepts","Solve CPU scheduling Gantt, Banker's deadlock & page-replacement exercises in os_prac.","os_prac",1.3]
        ],
        [
          ["dsa",["dsa_toolkit","dsa_arrays"],"Ch.1–2 Fast I/O & Template Recall","Write BufferedReader/StringTokenizer + prefix-hash + sliding-window Java templates from blank.","jdsa_guide",1.3],
          ["sql",["sql_model"],"Design Multi-Tenant ER Schema","Translate 3 real entities (Users, Orders, AuditLog) into SQL DDL with CHECK & FK actions.","sql_guide",0.9],
          ["backend",["be_cs_core"],"OS Practice Review & Context-Switch Notes","Complete remaining OS Practice numericals and log OS interview QA summaries.","os_prac",1.2]
        ],
        [
          ["dsa",["dsa_arrays"],"Week 1 Java Timed Check & Error Log","Solve 2 unseen Medium Array/Window problems in 50m; log overflow/off-by-one bugs.","jdsa_rev",1.3],
          ["sql",["sql_model"],"MySQL Parts 1–2 Timed Recall","Answer 6 conceptual questions on candidate keys, referential integrity & storage engines.","sql_rev",0.8],
          ["backend",["be_cs_core"],"Week 1 OS & Java Ref Consolidation","Verify thread vs process memory map and Java primitive/wrapper sizing.","os_guide",1]
        ]
      ]
    },
    {
      id: 2,
      month: 1,
      title: "Binary Search, Intervals, DDL/DML, Linux & Git",
      focus: ["Ch.3 (S3.1–S3.5)","MySQL Parts 3–4","Linux Shell + Git Internals"],
      practiceTag: "S3.1–S3.5 • MySQL Pts 3–4 • Linux + Git",
      targets: [
        {"id":"jw2_d","track":"dsa","text":"Lock in overflow-safe lo < hi binary search, Long.MAX_VALUE sqrt, custom sorts & intervals; solve S3.1–S3.5."},
        {"id":"jw2_s","track":"sql","text":"Complete MySQL Parts 3–4 (DDL types, JSON/generated cols, DML & AS new upserts) + Parts 3–4 practice."},
        {"id":"jw2_b","track":"backend","text":"Complete Linux for SWEs (processes/perms/pipes) & Git Internals (objects, merge, rebase, reset & workflows)."}
      ],
      days: [
        [
          ["dsa",["dsa_bsearch"],"Ch.3 First-True Binary Search & S3.1","Internalise monotonic invariant mid=lo+(hi-lo)/2 and solve S3.1 (First and last position).","jdsa_guide",1.4],
          ["sql",["sql_model"],"MySQL Pt 3: DDL Numeric, String & Date Types","Compare DECIMAL vs FLOAT, DATETIME vs TIMESTAMP, JSON & generated columns.","sql_guide",0.9],
          ["backend",["be_cs_core"],"Linux Guide: Files, Permissions, Pipes & Regex","Master chmod/ACLs, grep/awk/sed pipelines, exit codes & quoting traps.","linux_guide",1.4]
        ],
        [
          ["dsa",["dsa_bsearch"],"S3.2 Integer sqrt(long) & S3.3 Koko Bananas","Code overflow-free floor(sqrt(n)) up to Long.MAX_VALUE (S3.2) & S3.3 binary search on answer.","jdsa_prac",1.5],
          ["sql",["sql_model"],"MySQL Pt 3: Constraints, AUTO_INCREMENT & ALTER","Practise inline/table CHECK constraints, ALTER TABLE migrations & temporary tables.","sql_prac",0.9],
          ["backend",["be_cs_core"],"Linux Guide: Processes, Signals, Sockets & I/O","Study fd redirection, SIGINT/SIGTERM handling, ss/iproute & systemd units.","linux_guide",1.4]
        ],
        [
          ["dsa",["dsa_bsearch"],"S3.4 Aggressive Cows & S3.5 Insert Interval","Solve S3.4 (Maximise min stall distance) & S3.5 (O(n) sorted interval insertion + merge).","jdsa_prac",1.5],
          ["sql",["sql_core"],"MySQL Pt 4: INSERT, UPDATE, DELETE & Upserts","Master multi-row inserts, safe WHERE deletes & AS new ON DUPLICATE KEY UPDATE.","sql_guide",0.9],
          ["backend",["be_cs_core"],"Linux Practice Book: Shell Scenarios","Solve Linux Practice Book command-line triage & log-analysis exercises.","linux_prac",1.3]
        ],
        [
          ["dsa",["dsa_bsearch"],"4 Java Binary Search & Arrays.sort Drills","Practise Integer.compare overflow-free sorting, rotated array search & intervals.","jdsa_guide",1.5],
          ["sql",["sql_core"],"MySQL Pt 4 DML Practice Problems","Execute Practice Book Part 4 DML queries and verify idempotent upsert outputs.","sql_prac",0.9],
          ["backend",["be_cs_core"],"Git Internals: Blobs, Trees, Commits & Refs","Inspect .git/objects SHA-1/packfiles, HEAD detachment & reflog recovery.","git_guide",1.4]
        ],
        [
          ["dsa",["dsa_bsearch"],"Overflow & Boundary Audit (lo/hi/Long)","Check mid*mid overflow (use mid <= n/mid) & single-element edge cases.","jdsa_rev",1.2],
          ["sql",["sql_model"],"Schema Migration Dry Run","Write idempotent DDL + backfill DML script cleanly in MySQL syntax.","sql_ref",0.8],
          ["backend",["be_cs_core"],"Git Workflows: Merge vs Rebase, Cherry-Pick & Reset","Contrast soft/mixed/hard reset, interactive rebase & bisect bug hunting.","git_guide",1.3]
        ],
        [
          ["dsa",["dsa_arrays","dsa_bsearch"],"Week 1 Redo + S3.4/S3.5 Blank Rewrite","Redo Week 1 ~ items + rewrite first-true binary search & intervals from blank.","jdsa_prac",1.4],
          ["sql",["sql_core"],"Upsert & Data-Type Bug Drill","Test strict-mode truncation, CHAR vs VARCHAR & upsert ambiguity (1052).","sql_guide",0.9],
          ["backend",["be_cs_core"],"Git Internals Practice Book: 20 Repo Scenarios","Solve Git Practice scenarios recovering lost commits & untangling rebases.","git_prac",1.3]
        ],
        [
          ["dsa",["dsa_bsearch"],"Week 2 Mixed Java Mini-Mock (2 Problems)","Time 2 unseen BS + Interval Java problems in 50m; check clean Main helpers.","jdsa_guide",1.4],
          ["sql",["sql_model","sql_core"],"Parts 3–4 Quiz Check","Self-test 8 DDL/DML questions without consulting reference.","sql_rev",0.8],
          ["backend",["be_cs_core"],"Linux & Git Command Cheat-Sheet Recap","Verify fast daily fluency on grep/find/xargs & git reset/rebase.","linux_prac",1]
        ]
      ]
    },
    {
      id: 3,
      month: 1,
      title: "Lists, ArrayDeque, SELECT & Computer Networks",
      focus: ["Ch.4 (S4.1–S4.5)","MySQL Part 5","Computer Networks (TCP/HTTP/TLS)"],
      practiceTag: "S4.1–S4.5 • MySQL Pt 5 • Computer Networks",
      targets: [
        {"id":"jw3_d","track":"dsa","text":"Master O(1)-space linked lists, two-stack queues, ArrayDeque monotonic stack & deque; solve S4.1–S4.5."},
        {"id":"jw3_s","track":"sql","text":"Finish MySQL Part 5 (SELECT, 3-valued NULL truth tables, LIKE/REGEXP & functions) + Pt 5 practice."},
        {"id":"jw3_b","track":"backend","text":"Complete Computer Networks Guide & Practice Book (IP/CIDR, TCP Congestion/Handshakes, DNS, HTTP/TLS)."}
      ],
      days: [
        [
          ["dsa",["dsa_linear"],"Ch.4 Linked Lists & S4.1 Palindrome List","Use dummy node + slow/fast pointers; solve S4.1 restoring list after O(1)-space check.","jdsa_prac",1.5],
          ["sql",["sql_core"],"MySQL Pt 5: SELECT Filtering & Sorting","Drill WHERE vs ORDER BY vs LIMIT/OFFSET edge cases and composite sorting.","sql_guide",0.9],
          ["backend",["be_cs_core"],"Networks Ch.1–2: OSI/TCP-IP, DNS & HTTP/2/3","Trace packet encapsulation, DNS resolution & HTTP keep-alive/multiplexing.","cn_guide",1.4]
        ],
        [
          ["dsa",["dsa_linear"],"S4.2 Reverse in Groups of k (Hard)","Implement iterative group-of-k reversal leaving trailing <k tail untouched (S4.2).","jdsa_prac",1.5],
          ["sql",["sql_core"],"MySQL Pt 5: 3-Valued Logic & NULL Traps","Trace UNKNOWN with NOT IN, NULL != 1, COALESCE & NULL-safe <=> operator.","sql_guide",0.9],
          ["backend",["be_cs_core"],"Networks Ch.3–4: IPv4/CIDR Subnetting & Routing","Compute subnet masks, broadcast addresses, NAT traversal & ARP tables.","cn_guide",1.4]
        ],
        [
          ["dsa",["dsa_linear"],"Ch.4 Stacks/Queues & S4.3 Two-Stack Queue","Use ArrayDeque (never Stack); solve S4.3 counting amortised moves over 100k ops.","jdsa_guide",1.5],
          ["sql",["sql_core"],"MySQL Pt 5 & Pt 8 Built-in Functions","Practise string, numeric, date/time and CAST/CONVERT functions.","sql_ref",0.9],
          ["backend",["be_cs_core"],"Networks Ch.5–6: TCP Handshake, Congestion & TLS","Trace SYN/ACK/TIME_WAIT, slow-start AIMD, BDP & TLS 1.3 1-RTT handshake.","cn_guide",1.5]
        ],
        [
          ["dsa",["dsa_linear"],"S4.4 Asteroid Collision & S4.5 Subarray Mins","Solve S4.4 & S4.5 (Hard, O(n) monotonic stack avoiding duplicate ties mod 10^9+7).","jdsa_prac",1.6],
          ["sql",["sql_core"],"MySQL Pt 5 Practice Book Queries","Complete Practice Book Part 5 SELECT/NULL/expression exercises from blank editor.","sql_prac",1],
          ["backend",["be_cs_core"],"Networks Practice Book: Packet & CIDR Drills","Solve CIDR subnetting, TCP throughput & RTT calculations in cn_prac.","cn_prac",1.4]
        ],
        [
          ["dsa",["dsa_linear"],"Strict < vs <= Monotonic Tie-Breaking Proof","Verify previous-less vs next-less-or-equal invariant in S4.5 + long mod math.","jdsa_rev",1.2],
          ["sql",["sql_core"],"Three-Valued Logic Edge Drill","Test NULL IN (1, NULL) vs NULL NOT IN vs NOT EXISTS cleanly.","sql_guide",0.8],
          ["backend",["be_cs_core"],"Networks Practice Book: Load Balancer & Firewall","Complete remaining cn_prac HTTP/TLS/socket questions cleanly.","cn_prac",1.2]
        ],
        [
          ["dsa",["dsa_bsearch","dsa_linear"],"Week 2 Redo + S4.5 Blank Re-Solve","Redo Week 2 ~ items + rewrite S4.5 Sum of Subarray Minimums blind.","jdsa_prac",1.5],
          ["sql",["sql_core"],"Regex & Date Arithmetic Queries","Write 5 employee hire-tenure & string/regex queries cleanly.","sql_ref",0.8],
          ["backend",["be_cs_core"],"End-to-End Request Trace (Browser -> JVM)","Walk full DNS -> TCP -> TLS -> Nginx -> JVM socket path from memory.","cn_guide",1.1]
        ],
        [
          ["dsa",["dsa_linear"],"Week 3 Java Mixed Mock (List + ArrayDeque)","Solve 2 unseen Stack/Deque/List Java problems in 50m.","jdsa_guide",1.4],
          ["sql",["sql_core"],"Execution Order Quiz (FROM -> LIMIT)","Trace logical evaluation order explaining why WHERE rejects SELECT aliases.","sql_guide",0.8],
          ["backend",["be_cs_core"],"OS/Linux/Git/CN Phase-1 Core Review","Self-check 12 Core CS rapid interview questions before starting Concurrency.","cn_prac",1]
        ]
      ]
    },
    {
      id: 4,
      month: 1,
      title: "Backtracking, Aggregation & Java Concurrency Pt 1",
      focus: ["Ch.5 (S5.1–S5.4)","MySQL Part 6","Java Concurrency Ch.1–5 (JDK 25)"],
      practiceTag: "S5.1–S5.4 • MySQL Pt 6 • Concurrency Pt 1",
      targets: [
        {"id":"jw4_d","track":"dsa","text":"Master choose-explore-unchoose backtracking, Catalan counting & bitmask N-Queens; solve S5.1–S5.4."},
        {"id":"jw4_s","track":"sql","text":"Complete MySQL Part 6 (GROUP BY, HAVING, WITH ROLLUP & GROUP_CONCAT) + Pt 6 practice."},
        {"id":"jw4_b","track":"backend","text":"Finish Java Concurrency Ch.1–5 (JMM, volatile/happens-before, Locks, Atomics, Thread Pools) + conc_prac Pts 1–2."}
      ],
      days: [
        [
          ["dsa",["dsa_trees"],"Ch.5 Backtracking & S5.1 Parentheses/Catalan","Build StringBuilder backtracking template, solve S5.1 (n=3 + Catalan n=1..10).","jdsa_guide",1.5],
          ["sql",["sql_core"],"MySQL Pt 6: GROUP BY & HAVING Semantics","Contrast WHERE vs HAVING and COUNT(*) vs COUNT(col).","sql_guide",0.9],
          ["backend",["be_concurrency"],"Concurrency Ch.1: Atomicity, Visibility, Order","Run lost-update & reordering races on JDK 25 observing why unsynchronised reads break.","conc_guide",1.4]
        ],
        [
          ["dsa",["dsa_trees"],"S5.2 Phone Keypad & S5.3 Palindrome Partition","Solve S5.2 ('79') & S5.3 with precomputed O(1) boolean[][] palindrome table.","jdsa_prac",1.5],
          ["sql",["sql_core"],"MySQL Pt 6: WITH ROLLUP & GROUP_CONCAT","Write hierarchical subtotals using WITH ROLLUP & ordered GROUP_CONCAT.","sql_guide",0.9],
          ["backend",["be_concurrency"],"Concurrency Ch.2: JMM & Happens-Before","Trace volatile write->read edges, monitor lock release->acquire & safe publication.","conc_guide",1.4]
        ],
        [
          ["dsa",["dsa_trees"],"S5.4 N-Queens with Three Integer Bitmasks (Hard)","Solve S5.4 replacing boolean arrays with col/diag masks and verify counts up to 14,200.","jdsa_prac",1.6],
          ["sql",["sql_core"],"MySQL Pt 6 Aggregation Practice Set","Solve Practice Book Part 6 queries handling zero-row groups (Karan/HR).","sql_prac",1],
          ["backend",["be_concurrency"],"Concurrency Ch.3: Locks, Conditions & Deadlock","Run ReentrantLock, ReadWriteLock, StampedLock & ThreadMXBean deadlock detection.","conc_guide",1.5]
        ],
        [
          ["dsa",["dsa_trees"],"4 Java Backtracking & Pruning Drills","Solve Combination Sum, Subsets II & Word Search under 30m cap with copy-on-record.","jdsa_guide",1.5],
          ["sql",["sql_core"],"SQL Aggregation Edge-Case Drill","Test ONLY_FULL_GROUP_BY errors, NULL groups & SUM(CASE WHEN...).","sql_ref",0.9],
          ["backend",["be_concurrency"],"Concurrency Ch.4: CAS, ABA & Concurrent Maps","Compare AtomicInteger/LongAdder, AtomicStampedReference (ABA) & ConcurrentHashMap.","conc_guide",1.4]
        ],
        [
          ["dsa",["dsa_trees"],"Java Stack Depth & Copy-Trap Check","Verify List<> aliasing bug + recursion depth constraints.","jdsa_rev",1.2],
          ["sql",["sql_core"],"Conditional Aggregation Pivot Report","Write single-pass pivot query aggregating salaries by dept and tenure.","sql_prac",0.9],
          ["backend",["be_concurrency"],"Concurrency Ch.5: Executors, Pools & Rejection","Trace core/max/queue sizing, CallerRunsPolicy & shutdown vs shutdownNow.","conc_guide",1.4]
        ],
        [
          ["dsa",["dsa_linear","dsa_trees"],"Week 3 Redo + Bitmask Backtrack Mock","Redo Week 3 ~ items + solve 1 unseen pruning backtrack cleanly.","jdsa_prac",1.5],
          ["sql",["sql_core"],"MySQL Parts 1–6 Cumulative Recap","Review modelling, DDL/DML, NULL rules & aggregation edge cases.","sql_rev",0.9],
          ["backend",["be_concurrency"],"Concurrency Practice Book (Ch.1–5 Exercises)","Solve thread-safety, lock-ordering deadlocks & pool exercises in conc_prac.","conc_prac",1.4]
        ],
        [
          ["dsa",["dsa_arrays","dsa_bsearch","dsa_linear","dsa_trees"],"Month 1 Java DSA Checkpoint (2 Problems)","Sit 2 timed unseen Medium problems across Ch.1–5.","jdsa_guide",1.5],
          ["sql",["sql_model","sql_core"],"Month 1 SQL Checkpoint Quiz","Complete 8 mixed DDL/DML/SELECT/GROUP BY queries cleanly.","sql_prac",1],
          ["backend",["be_concurrency"],"JMM & Lock-Ordering Cheat Sheet Check","Verify happens-before rules & consistent lock acquisition order without notes.","conc_guide",1]
        ]
      ]
    },
    {
      id: 5,
      month: 2,
      title: "Trees/BSTs, Joins, Virtual Threads & Security Pt 1",
      focus: ["Ch.6 (S6.1–S6.5)","MySQL Part 7","Concurrency Pt 2 + Security Ch.1–3"],
      practiceTag: "S6.1–S6.5 • MySQL Pt 7 • Virtual Threads + Crypto",
      targets: [
        {"id":"jw5_d","track":"dsa","text":"Master tree traversals, bottom-up state return, BST LCA/deletion & solve S6.1–S6.5."},
        {"id":"jw5_s","track":"sql","text":"Master MySQL Part 7 Joins (INNER, LEFT/RIGHT, CROSS, SELF, anti-joins & ON vs WHERE)."},
        {"id":"jw5_b","track":"backend","text":"Finish Java Concurrency Ch.6–10 (CompletableFuture, Virtual Threads, ScopedValue) & Security Ch.1–3."}
      ],
      days: [
        [
          ["dsa",["dsa_trees"],"Ch.6 Traversals & S6.1–S6.2 Views/Zigzag","Implement BFS queue traversals and solve S6.1 (Right view) & S6.2 (Zigzag order).","jdsa_prac",1.5],
          ["sql",["sql_joins"],"MySQL Pt 7: INNER, LEFT & Anti-Joins","Query missing relations (HR dept, Karan) using LEFT JOIN + IS NULL.","sql_guide",0.9],
          ["backend",["be_concurrency"],"Concurrency Ch.6–7: CompletableFuture & Syncs","Chain thenCompose/allOf timeouts; contrast Semaphore, CountDownLatch & CyclicBarrier.","conc_guide",1.4]
        ],
        [
          ["dsa",["dsa_trees"],"Ch.6 Bottom-Up Recursion & S6.3 Paths Sum k","Solve diameter, balanced check & S6.3 (Downward paths sum k in O(n) prefix map).","jdsa_prac",1.5],
          ["sql",["sql_joins"],"MySQL Pt 7: Self-Joins & Multi-Table Joins","Write employee-manager chains & avoid ON vs WHERE LEFT JOIN filter traps.","sql_guide",0.9],
          ["backend",["be_concurrency"],"Concurrency Ch.8–10: Virtual Threads & Pitfalls","Use virtual threads, ScopedValue (JDK 25) & explain synchronized pinning hazards.","conc_guide",1.4]
        ],
        [
          ["dsa",["dsa_trees"],"S6.4 LCA in BST & S6.5 Delete from BST","Solve S6.4 in O(h)/O(1) space & S6.5 handling leaf, 1-child & 2-child root delete.","jdsa_prac",1.6],
          ["sql",["sql_joins"],"MySQL Pt 7 Practice Book Join Drills","Solve Practice Book Part 7 join scenarios verifying exact row cardinalities.","sql_prac",1],
          ["backend",["be_concurrency"],"Concurrency Practice Book (Ch.6–10 Finish)","Complete async pipeline, deadlock-free transfer & virtual-thread exercises in conc_prac.","conc_prac",1.4]
        ],
        [
          ["dsa",["dsa_trees"],"4 Tree & Serialisation Drills in Java","Code Preorder+null Codec serialise/deserialise & Kth Smallest in BST.","jdsa_guide",1.5],
          ["sql",["sql_joins"],"Multi-Way Join Cardinality & Fan-out Check","Identify 1:N row multiplication and pre-aggregate before joining.","sql_ref",0.9],
          ["backend",["be_security"],"Security Ch.1–2: Threat Models & Crypto Primitives","Run SHA-256, HMAC timing-safe compare, AES-GCM authenticated encryption & signatures.","sec_guide",1.4]
        ],
        [
          ["dsa",["dsa_trees"],"Tree Null Checks & Integer Reference Safety","Audit null roots, ValidateBST long bounds & inorder successor.","jdsa_rev",1.2],
          ["sql",["sql_joins"],"SQL Join Matrix & Cardinality Cheat Sheet","Compare CROSS, USING(col), FULL emulation via UNION & anti-join.","sql_guide",0.8],
          ["backend",["be_security"],"Security Ch.3: Argon2id, JWT, TOTP & OAuth PKCE","Implement password hashing, alg=none JWT rejection & PKCE authorization flow.","sec_guide",1.4]
        ],
        [
          ["dsa",["dsa_trees"],"Week 4 Redo + Blind BST Delete Rewrite","Redo Week 4 ~ items + implement BST delete and S6.3 from blank Main.java.","jdsa_prac",1.4],
          ["sql",["sql_joins"],"Write 3 Non-Equi & Inequality Join Queries","Solve salary-band and date-interval join queries cleanly.","sql_prac",0.9],
          ["backend",["be_security"],"Security Practice Book (Crypto & Auth Pt 1)","Solve Security Practice crypto, HMAC timing attack & JWT validation exercises.","sec_prac",1.3]
        ],
        [
          ["dsa",["dsa_trees"],"Week 5 Java Tree Timed Mock (2 Problems)","Time 2 unseen Tree/BST Mediums in 50m.","jdsa_guide",1.4],
          ["sql",["sql_joins"],"Part 7 Self-Test Without Reference","Write 4 multi-join aggregation queries from memory.","sql_rev",0.8],
          ["backend",["be_concurrency","be_security"],"Concurrency & Auth Concept Check","Recite pin-free virtual-thread rules and why AES-CBC needs HMAC.","sec_guide",1]
        ]
      ]
    },
    {
      id: 6,
      month: 2,
      title: "PriorityQueue, HashMap, CTEs & Security Pt 2",
      focus: ["Ch.7 (S7.1–S7.4)","MySQL Part 8","Security Engineering Ch.4–9 (OWASP/TLS)"],
      practiceTag: "S7.1–S7.4 • MySQL Pt 8 • TLS, PCI & OWASP Top 10",
      targets: [
        {"id":"jw6_d","track":"dsa","text":"Master PriorityQueue top-k/scheduling/two-heaps, HashMap tree-bin mechanics & solve S7.1–S7.4."},
        {"id":"jw6_s","track":"sql","text":"Complete MySQL Part 8 (Correlated Subqueries, EXISTS, Set Ops, Recursive CTEs) + Pt 8 practice."},
        {"id":"jw6_b","track":"backend","text":"Finish Security Engineering Ch.4–9 (mTLS, KMS/Secrets, PCI Webhooks, OWASP Attacks & Fixes) + sec_prac."}
      ],
      days: [
        [
          ["dsa",["dsa_graphs"],"Ch.7 Binary Heaps & S7.1 Kth Largest","Configure PriorityQueue comparators safely (no subtraction overflow); solve S7.1.","jdsa_prac",1.5],
          ["sql",["sql_joins"],"MySQL Pt 8: Subqueries, IN vs EXISTS","Fix NULL traps in correlated subqueries using EXISTS / NOT EXISTS.","sql_guide",0.9],
          ["backend",["be_security"],"Security Ch.4–5: TLS, Mutual TLS & KMS Secrets","Verify CA keyUsage/SAN chains with OpenSSL, envelope encryption & secret rotation.","sec_guide",1.4]
        ],
        [
          ["dsa",["dsa_graphs"],"S7.2 Task Scheduler & S7.3 Reorganise String","Verify closed-form vs PQ agreement (S7.2) & adjacent-char separation (S7.3).","jdsa_prac",1.5],
          ["sql",["sql_joins"],"MySQL Pt 8: Set Operations & CTE Pipelines","Chain multi-step WITH CTE pipelines and UNION/INTERSECT/EXCEPT.","sql_guide",0.9],
          ["backend",["be_security"],"Security Ch.6: Payment Security & Idempotency","Implement HMAC webhook signature verification, replay windows & idempotency keys.","sec_guide",1.4]
        ],
        [
          ["dsa",["dsa_graphs"],"S7.4 Constant hashCode Experiment (HashMap)","Run S7.4 with 2,000 constant-hash keys measuring equals calls & Java 8+ tree-bin split.","jdsa_prac",1.5],
          ["sql",["sql_joins"],"MySQL Pt 8: Recursive CTE Hierarchies","Write recursive WITH RECURSIVE org-chart traversal with depth guard.","sql_guide",0.9],
          ["backend",["be_security"],"Security Ch.7: OWASP Top 10 Attacked & Fixed","Walk SQLi, XSS, CSRF, SSRF, IDOR & path traversal fixes on toy services.","sec_guide",1.5]
        ],
        [
          ["dsa",["dsa_graphs"],"Two-Heaps Median & Merge-K-Lists in Java","Implement Find Median from Data Stream + Merge K Sorted Lists.","jdsa_guide",1.5],
          ["sql",["sql_joins"],"MySQL Pt 8 Practice Book CTE Exercises","Complete Practice Book Part 8 subquery & recursive CTE drills.","sql_prac",1],
          ["backend",["be_security"],"Security Ch.8–9: Privacy, Audit Logs & SDLC","Design PII field masking, tamper-evident audit chains & security checklists.","sec_guide",1.3]
        ],
        [
          ["dsa",["dsa_graphs"],"equals/hashCode & PQ Comparator Check","Verify Comparator.comparingInt safety & PQ remove O(n) cost.","jdsa_rev",1.2],
          ["sql",["sql_joins"],"EXISTS vs JOIN Equivalence Drill","Rewrite 4 semi-join / anti-join queries cleanly.","sql_ref",0.8],
          ["backend",["be_security"],"Security Practice Book (OWASP & Design Ex.)","Solve Security Practice vulnerabilities & both secure architecture designs.","sec_prac",1.5]
        ],
        [
          ["dsa",["dsa_trees","dsa_graphs"],"Week 5 Redo + Two-Heap Blank Rewrite","Redo Week 5 ~ items + code running median two-heap class blind.","jdsa_prac",1.4],
          ["sql",["sql_joins"],"Recursive Date Spine Generator","Generate contiguous missing dates via WITH RECURSIVE + LEFT JOIN.","sql_guide",0.9],
          ["backend",["be_security"],"OWASP-to-Spring Preview Bridge Audit","Map Sec Guide JWT/CSRF/CORS fixes onto Spring Security filters ahead of Week 7.","sec_prac",1.2]
        ],
        [
          ["dsa",["dsa_graphs"],"Week 6 Java Timed Mock (Heaps + Trees)","Time 2 unseen Medium problems (PQ + Tree) in 50m.","jdsa_guide",1.4],
          ["sql",["sql_joins"],"Parts 7–8 Combined Recall Quiz","Solve 5 recursive hierarchy & correlated subquery tasks cleanly.","sql_rev",0.8],
          ["backend",["be_security"],"Security Engineering Question Bank Self-Test","Answer 10 crypto, TLS, OAuth & SSRF interview questions.","sec_guide",1]
        ]
      ]
    },
    {
      id: 7,
      month: 2,
      title: "Graphs Pt 1, Window Functions & Spring Boot Core",
      focus: ["Ch.8 Pt 1 (S8.1–S8.3)","MySQL Part 9","Spring Boot Ch.1–6 (DI, JPA, Sec)"],
      practiceTag: "S8.1–S8.3 • MySQL Pt 9 • Spring Boot Ch.1–6",
      targets: [
        {"id":"jw7_d","track":"dsa","text":"Master graph BFS/DFS, 8-dir grid paths, bipartite check, topo sort & Word Ladder (S8.1–S8.3)."},
        {"id":"jw7_s","track":"sql","text":"Master MySQL Part 9 Window Functions (ROW_NUMBER/RANK/LAG/LEAD & frames) + Pt 9 practice."},
        {"id":"jw7_b","track":"backend","text":"Finish Spring Boot Ch.1–6 (IoC/Beans, REST MVC, JPA/N+1, @Transactional & Security/JWT) + spring_prac Pt 1."}
      ],
      days: [
        [
          ["dsa",["dsa_graphs"],"Ch.8 Graph Reps & S8.1 Bipartite Check","Build ArrayList[] adjacency lists; solve S8.1 2-colouring across components.","jdsa_prac",1.5],
          ["sql",["sql_windows_perf"],"MySQL Pt 9: OVER(), PARTITION BY & Ranking","Contrast ROW_NUMBER, RANK & DENSE_RANK for top-N-per-group.","sql_guide",1],
          ["backend",["be_spring"],"Spring Boot Ch.1–2: Auto-Config, Beans & Proxies","Trace IoC container, @ConditionalOnMissingBean order & AOP proxy traps.","spring_guide",1.4]
        ],
        [
          ["dsa",["dsa_graphs"],"S8.2 Shortest Path in 8-Dir Binary Grid","Code 8-direction ArrayDeque BFS with visited-on-enqueue (S8.2).","jdsa_prac",1.5],
          ["sql",["sql_windows_perf"],"MySQL Pt 9: LAG, LEAD & Running Frames","Compute WoW deltas and ROWS vs RANGE BETWEEN moving sums.","sql_guide",1],
          ["backend",["be_spring"],"Spring Boot Ch.3: REST Controllers, DTOs & Errors","Build ProblemDetail error handlers, HandlerMethodValidation & status codes.","spring_guide",1.4]
        ],
        [
          ["dsa",["dsa_graphs"],"S8.3 Word Ladder & Kahn Topological Sort","Solve S8.3 hit->cog shortest transform & Kahn indegree topo sort.","jdsa_prac",1.6],
          ["sql",["sql_windows_perf"],"MySQL Pt 9 Practice Book Window Queries","Complete Practice Book Part 9 ranking, running total & salary-gap drills.","sql_prac",1],
          ["backend",["be_spring"],"Spring Boot Ch.4: JPA/Hibernate & N+1 Fixes","Fix lazy loading outside session, JOIN FETCH, EntityGraph & dirty checking.","spring_guide",1.5]
        ],
        [
          ["dsa",["dsa_graphs"],"3 Graph Component & Cycle Drills","Solve Course Schedule II, Number of Islands & Directed 3-color Cycle Check.","jdsa_guide",1.5],
          ["sql",["sql_windows_perf"],"Gaps-and-Islands Using ROW_NUMBER","Solve consecutive streaks & session grouping using difference of ranks.","sql_guide",1],
          ["backend",["be_spring"],"Spring Boot Ch.5: @Transactional Traps","Avoid self-invocation bypass, checked-exception non-rollback & long locks.","spring_guide",1.4]
        ],
        [
          ["dsa",["dsa_graphs"],"Visited Timing & Explicit Stack Audit","Verify explicit ArrayDeque DFS vs recursion StackOverflowError at 10^5 depth.","jdsa_rev",1.2],
          ["sql",["sql_windows_perf"],"Window Frame Edge Traps","Audit RANGE default vs ROWS UNBOUNDED PRECEDING & LAST_VALUE trap.","sql_ref",0.9],
          ["backend",["be_spring"],"Spring Boot Ch.6: Security Filter & JWT Auth","Permit /error dispatch (avoiding 403->401 masking), configure AuthenticationEntryPoint.","spring_guide",1.5]
        ],
        [
          ["dsa",["dsa_graphs"],"Week 6 Redo + Kahn & Grid BFS Blank","Redo Week 6 ~ items + write Kahn topo sort & 8-dir BFS blind.","jdsa_prac",1.4],
          ["sql",["sql_windows_perf"],"Re-solve Top-3 Paid Employees Per Dept","Write clean CTE + DENSE_RANK solution cleanly.","sql_prac",0.9],
          ["backend",["be_spring"],"Spring Boot Practice Book (Ch.1–6 Exercises)","Solve bean lifecycle, validation, JPA N+1 & security filter exercises in spring_prac.","spring_prac",1.4]
        ],
        [
          ["dsa",["dsa_graphs"],"Week 7 Java Timed Graph Mock","Time 2 unseen BFS/Topo/Bipartite Mediums in 50m.","jdsa_guide",1.4],
          ["sql",["sql_windows_perf"],"Window Functions Quick-Fire Set","Complete 4 unseen LAG/RANK queries in 30m cleanly.","sql_rev",0.9],
          ["backend",["be_spring"],"Spring Boot Proxy & Transaction Recap","Sketch Spring SecurityFilterChain & @Transactional proxy call paths blind.","spring_guide",1]
        ]
      ]
    },
    {
      id: 8,
      month: 2,
      title: "Weighted Graphs, Indexes & Smart-Meter Spring Project 1",
      focus: ["Ch.8 Pt 2 (S8.4–S8.5)","MySQL Part 10","Spring Boot Ch.7–11 + Project 1 Ship"],
      practiceTag: "S8.4–S8.5 • MySQL Pt 10 • Project 1 Smart-Meter API",
      targets: [
        {"id":"jw8_d","track":"dsa","text":"Master lazy Dijkstra, bounded Bellman-Ford (S8.4), Union-Find DSU (S8.5) & Kruskal MST."},
        {"id":"jw8_s","track":"sql","text":"Master MySQL Part 10 Views, B-Tree Composite/Covering Indexes & EXPLAIN query tuning + Pt 10 prac."},
        {"id":"jw8_b","track":"backend","text":"Finish Spring Boot Ch.7–11 & ship Portfolio Project 1 (Complete Smart-Meter REST API on GitHub)."}
      ],
      days: [
        [
          ["dsa",["dsa_graphs"],"Ch.8 Pt 2: Dijkstra & S8.4 K-Stops (Hard)","Code lazy Dijkstra dist[u] check + solve S8.4 bounded Bellman-Ford for <= k stops.","jdsa_prac",1.7],
          ["sql",["sql_windows_perf"],"MySQL Pt 10: Views & Updatability Rules","Study views, WITH CHECK OPTION & view merge algorithms.","sql_guide",0.9],
          ["backend",["be_spring"],"Spring Boot Ch.7: Test Slices & MockMvc","Compare @WebMvcTest, @DataJpaTest & full @SpringBootTest integration harnesses.","spring_guide",1.4]
        ],
        [
          ["dsa",["dsa_graphs"],"Ch.8 Pt 2: DSU & S8.5 Redundant Connection","Implement DSU path compression + rank, solve S8.5 & Kruskal MST.","jdsa_prac",1.5],
          ["sql",["sql_windows_perf"],"MySQL Pt 10: B-Tree Indexes & Leftmost Prefix","Design composite equality-before-range indexes & covering scans.","sql_guide",1],
          ["backend",["be_spring"],"Spring Boot Ch.8–9: Actuator, Metrics & Docker","Wire health probes, structured logging, graceful shutdown & layered Jars.","spring_guide",1.4]
        ],
        [
          ["dsa",["dsa_graphs"],"4 Weighted Graph, DSU & MST Drills","Solve Network Delay Time, Accounts Merge, Min Cost Connect & Min Effort.","jdsa_guide",1.6],
          ["sql",["sql_windows_perf"],"MySQL Pt 10: Reading EXPLAIN & Anti-Patterns","Fix non-SARGable expressions, leading LIKE '%x' & implicit type casts.","sql_guide",1],
          ["backend",["be_spring"],"Project 1 Start: Smart-Meter API Entities & Flyway","Build Project 1 schema/JPA models (Meters, Readings, Tariffs) cleanly (no SQL reserved 'DAY' bug!).","spring_guide",1.6]
        ],
        [
          ["dsa",["dsa_graphs"],"0-1 ArrayDeque BFS & Long Overflow Cases","Compare BFS vs 0-1 Deque vs Dijkstra vs Bellman-Ford cleanly.","jdsa_guide",1.4],
          ["sql",["sql_windows_perf"],"MySQL Pt 10 Practice Book Index Clinic","Solve Practice Book Part 10 EXPLAIN & composite index exercises.","sql_prac",1],
          ["backend",["be_spring"],"Project 1 Services, Auth & Validation Tests","Add JWT auth, idempotent meter ingestion endpoints & MockMvc/H2 tests.","spring_prac",1.6]
        ],
        [
          ["dsa",["dsa_graphs"],"Graph Algorithm Selection Table Recall","Write 5-row graph shortest-path table noting Integer.MAX_VALUE edge overflow.","jdsa_rev",1.2],
          ["sql",["sql_windows_perf"],"Composite Index Order & Selectivity Quiz","Choose optimal single composite index across 3 WHERE+ORDER BY queries.","sql_ref",0.9],
          ["backend",["be_spring"],"Spring Boot Ch.11 Q-Bank & Practice Finish","Finish remaining spring_prac exercises & review Spring Q-bank.","spring_prac",1.4]
        ],
        [
          ["dsa",["dsa_graphs"],"Week 7 Redo + Dijkstra & DSU Blank Rewrite","Redo Week 7 ~ items + rewrite Dijkstra and DSU blind.","jdsa_prac",1.5],
          ["sql",["sql_windows_perf"],"Rewrite Correlated Slow Query Into Window+Idx","Eliminate O(N^2) subquery using single index-friendly window scan.","sql_guide",0.9],
          ["backend",["be_spring"],"Ship Portfolio Project 1 (Smart-Meter GitHub)","Verify maven/gradle tests pass, write crisp README, curl/API examples & push.","spring_guide",1.7]
        ],
        [
          ["dsa",["dsa_trees","dsa_graphs"],"Month 2 Java DSA Mock Loop (2 Problems)","Solve 2 unseen Tree + Weighted Graph Java problems in 55m.","jdsa_guide",1.5],
          ["sql",["sql_joins","sql_windows_perf"],"Month 2 SQL Checkpoint (Parts 7–10)","Solve 6 Joins + CTE + Window + Index queries cleanly.","sql_prac",1],
          ["backend",["be_spring"],"Project 1 Pitch & Architecture Walkthrough","Rehearse 3-min walkthrough explaining Spring security, transactions & N+1 fixes.","spring_guide",1.1]
        ]
      ]
    },
    {
      id: 9,
      month: 3,
      title: "DP Pt 1, Transactions/Locks & Software Testing (JUnit 5)",
      focus: ["Ch.9 Pt 1 (S9.1–S9.3)","MySQL Part 11 + Tx","Software Testing Ch.1–10 (JUnit 5/Mockito)"],
      practiceTag: "S9.1–S9.3 • MySQL Pt 11 • JUnit 5 & Mockito",
      targets: [
        {"id":"jw9_d","track":"dsa","text":"Master 1D/Grid DP state-transition-base, path reconstruction & solve S9.1–S9.3."},
        {"id":"jw9_s","track":"sql","text":"Complete MySQL Part 11 (ACID, Isolation Levels, InnoDB MVCC & Row/Gap Locking) + Pt 11 practice."},
        {"id":"jw9_b","track":"backend","text":"Complete Software Testing Guide Ch.1–10 & Practice Book (JUnit 5, Mockito, Testcontainers, Mutation/TDD)."}
      ],
      days: [
        [
          ["dsa",["dsa_dp_adv"],"Ch.9 Pt 1: DP Frame & S9.1 Steps 1/3/5","Trace recursion -> memo int[] -> tabulation; solve S9.1 mod 10^9+7 for n=1..1000.","jdsa_prac",1.5],
          ["sql",["sql_jdbc_tx"],"MySQL Pt 11: ACID & Isolation Phenomena","Trace dirty read, non-repeatable read, phantom read & lost update.","sql_guide",1],
          ["backend",["be_testing_devops"],"Testing Ch.1–3: Test Design & JUnit 5 Core","Apply equivalence classes, boundary checks, parameterized & property tests.","test_guide",1.4]
        ],
        [
          ["dsa",["dsa_dp_adv"],"S9.2 Maximum Product Subarray","Solve S9.2 tracking running maxProd and minProd on negatives; contrast Kadane.","jdsa_prac",1.5],
          ["sql",["sql_jdbc_tx"],"MySQL Pt 11: InnoDB MVCC & Gap/Next-Key Locks","Contrast consistent non-locking snapshot reads vs FOR UPDATE gap locks.","sql_guide",0.9],
          ["backend",["be_testing_devops"],"Testing Ch.4–5: Test Doubles & Mockito Depth","Distinguish stubs/fakes/mocks; verify argument matching vs over-mocking traps.","test_guide",1.4]
        ],
        [
          ["dsa",["dsa_dp_adv"],"S9.3 Minimum Path Sum with Path Print","Implement 2D Grid DP reconstructing exact top-left to bottom-right path (S9.3).","jdsa_prac",1.5],
          ["sql",["sql_jdbc_tx"],"MySQL Pt 11 Practice Book Transaction Drills","Solve Practice Book Part 11 isolation/deadlock traces & SAVEPOINT queries.","sql_prac",1],
          ["backend",["be_testing_devops"],"Testing Ch.6–7: Stub Servers & Testcontainers","Run wire-level HTTP stubbing, contract tests & real DB container slices.","test_guide",1.5]
        ],
        [
          ["dsa",["dsa_dp_adv"],"4 Classic 1D DP & O(n log n) LIS Drills","Solve Coin Change, House Robber, Climbing Stairs & patience LIS in Java.","jdsa_guide",1.5],
          ["sql",["sql_jdbc_tx"],"Deadlock Avoidance & Optimistic Concurrency","Compare ordered lock acquisition vs version-column optimistic checks.","sql_guide",0.9],
          ["backend",["be_testing_devops"],"Testing Ch.8–10: Flaky Concurrency & Mutation","Inject Clock/Executor seams to stop flaky tests; run PITest mutation mindset.","test_guide",1.4]
        ],
        [
          ["dsa",["dsa_dp_adv"],"DP Memo SENTINEL & Long Mod Audit","Avoid 0 vs uncomputed memo sentinel trap (-1 / Integer.MIN_VALUE).","jdsa_rev",1.2],
          ["sql",["sql_jdbc_tx"],"Isolation Level Anomaly Matrix Recall","Draw the 4x3 SQL standard vs InnoDB phantom-lock matrix blind.","sql_rev",0.8],
          ["backend",["be_testing_devops"],"Testing Practice Book Pt 1 (JUnit/Mockito Ex.)","Solve unit design, boundary & mockito double exercises in test_prac.","test_prac",1.4]
        ],
        [
          ["dsa",["dsa_graphs","dsa_dp_adv"],"Week 8 Redo + 1D DP State Audit","Redo Week 8 ~ items + re-solve S9.1–S9.3 comparing memo vs rolled table.","jdsa_prac",1.4],
          ["sql",["sql_jdbc_tx"],"Trace Concurrent T1/T2 Lock Schedules","Step through READ COMMITTED vs REPEATABLE READ schedules cleanly.","sql_prac",0.9],
          ["backend",["be_testing_devops"],"Testing Practice Book Pt 2 (Flaky & Contracts)","Finish remaining test_prac exercises verifying bug-catching failing tests.","test_prac",1.4]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Week 9 Java Timed 1D/Grid DP Mock","Solve 2 unseen 1D/Grid DP Mediums in 55m cleanly.","jdsa_guide",1.4],
          ["sql",["sql_jdbc_tx"],"Part 11 Interview Q-Bank Check","Explain MVCC undo logs, gap locks & SELECT FOR UPDATE blocking.","sql_guide",0.8],
          ["backend",["be_testing_devops"],"Add Mutation-Strong Tests to Project 1","Apply Week 9 edge/boundary checks to Project 1 Smart-Meter API.","test_guide",1.1]
        ]
      ]
    },
    {
      id: 10,
      month: 3,
      title: "2D/Interval DP, Routines, DevOps & Java LLD Pt 1",
      focus: ["Ch.9 Pt 2 (S9.4–S9.7)","MySQL Part 12","DevOps & Cloud + LLD Ch.1–3"],
      practiceTag: "S9.4–S9.7 • MySQL Pt 12 • DevOps + LLD Pt 1",
      targets: [
        {"id":"jw10_d","track":"dsa","text":"Master Knapsack, state-machine Stock Cooldown (S9.5), Matrix-Chain DP (S9.6) & S9.4/S9.7."},
        {"id":"jw10_s","track":"sql","text":"Complete MySQL Part 12 (Stored Procedures, Functions, Triggers & Scheduled Events) + Pt 12 prac."},
        {"id":"jw10_b","track":"backend","text":"Complete DevOps & Cloud Guide/Practice (Docker/K8s/Canaries/Terraform) + start LLD Ch.1–3."}
      ],
      days: [
        [
          ["dsa",["dsa_dp_adv"],"Ch.9 Pt 2: Knapsack & S9.4 Target Sum","Reduce S9.4 (+/- assignment) to subset-sum DP and verify against 2^n brute force.","jdsa_prac",1.5],
          ["sql",["sql_jdbc_tx"],"MySQL Pt 12: Stored Procedures & Handlers","Write IN/OUT/INOUT procs, DELIMITER usage & DECLARE CONTINUE HANDLER.","sql_guide",0.9],
          ["backend",["be_testing_devops"],"DevOps Ch.1–3: CI, Docker Cache & K8s Scheduling","Trace image layer caching, filter/score scheduling, probes & stabilization windows.","devops_guide",1.4]
        ],
        [
          ["dsa",["dsa_dp_adv"],"S9.5 Stock Trading with Cooldown (Hard)","Implement held/sold/rest state machine (S9.5) and cross-check exhaustive small cases.","jdsa_prac",1.6],
          ["sql",["sql_jdbc_tx"],"MySQL Pt 12: Functions vs Procs & Triggers","Contrast deterministic functions vs BEFORE/AFTER triggers (NEW/OLD).","sql_guide",0.9],
          ["backend",["be_testing_devops"],"DevOps Ch.4–6: Rollouts, Canaries & IaC Plan","Study rolling maxSurge, two-proportion canary z-tests, Terraform DAG & drift.","devops_guide",1.4]
        ],
        [
          ["dsa",["dsa_dp_adv"],"S9.6 Matrix-Chain Multiplication (Hard)","Implement length-based Interval DP + split[][] parenthesisation (S9.6 -> 26,000).","jdsa_prac",1.6],
          ["sql",["sql_jdbc_tx"],"MySQL Pt 12: Events & Practice Book Pt 12","Complete Practice Book Part 12 trigger/routine drills & recursion traps.","sql_prac",1],
          ["backend",["be_testing_devops"],"DevOps Ch.7–10 & Alert Burn-Rate Timing","Understand multi-window burn-rate alerts, sticky flag hashing & cloud VPC basics.","devops_guide",1.3]
        ],
        [
          ["dsa",["dsa_dp_adv"],"S9.7 Define the State + Code (a) & (b)","Write state/transition/base for no-11 binary strings, min palindrome inserts & tiling; code (a)&(b).","jdsa_prac",1.5],
          ["sql",["sql_jdbc_tx"],"When NOT to Put Logic in Triggers/Procs","Compare DB triggers vs application services for testability & observability.","sql_ref",0.8],
          ["backend",["be_testing_devops"],"DevOps Practice Book (All 25 Exercises)","Solve Docker cache, K8s HPA, Terraform DAG & YAML 1.1 'on:' trap exercises.","devops_prac",1.5]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Knapsack Loop Direction & Len-First Audit","Confirm backward capacity loop for 0/1 vs forward unbounded & interval len loop.","jdsa_rev",1.2],
          ["sql",["sql_jdbc_tx"],"Audit-Log Trigger Verification Drill","Draft BEFORE UPDATE salary-audit trigger validating NEW.salary > 0.","sql_prac",0.8],
          ["backend",["be_lld"],"LLD Ch.1–2: OOP, UML & SOLID Refactors","Study SOLID violation/refactor single-file Java 21 pairs cleanly.","lld_guide",1.4]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Week 9 Redo + S9.5/S9.6 Blank Re-Solve","Redo Week 9 ~ items + rewrite Stock Cooldown & Matrix-Chain blind.","jdsa_prac",1.5],
          ["sql",["sql_jdbc_tx"],"Parts 11–12 Combined Review","Review trigger mutation rules ('can't update table invoking trigger').","sql_guide",0.8],
          ["backend",["be_lld"],"LLD Ch.3: Creational Patterns in Java 21","Implement Builder, Factory, Prototype & enum Singleton safely.","lld_guide",1.3]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Week 10 Timed 2D/Interval DP Check","Time 2 unseen 2D LCS/Edit Distance/Interval DP problems in 60m.","jdsa_guide",1.5],
          ["sql",["sql_jdbc_tx"],"Part 12 Syntax Check Without Notes","Write stored proc with handler & rollback from memory.","sql_rev",0.8],
          ["backend",["be_lld"],"Week 10 LLD & DevOps Synthesis Check","Refactor a 100-line branching class using Factory + Strategy.","lld_prac",1.1]
        ]
      ]
    },
    {
      id: 11,
      month: 3,
      title: "Greedy/Bits/Trie/Fenwick, JDBC/Normalisation & LLD Pt 2",
      focus: ["Ch.10–11 (S10.1–S10.5)","MySQL Pts 13–14 + Full JDBC","LLD Ch.4–7 (GoF & Case Studies Pt 1)"],
      practiceTag: "S10.1–S10.5 • Pts 13–14 + JDBC • LLD Ch.4–7",
      targets: [
        {"id":"jw11_d","track":"dsa","text":"Finish Ch.10–11 (Greedy, Bits, Primes, Binary Trie Max XOR & Fenwick Tree) and solve S10.1–S10.5."},
        {"id":"jw11_s","track":"sql","text":"Complete MySQL Parts 13–14 (1NF–BCNF, Users/Backups) plus Full JDBC Guide Ch.1–9 & JDBC Practice."},
        {"id":"jw11_b","track":"backend","text":"Finish LLD Ch.4–7 (Structural/Behavioural GoF, Concurrency Design & Case Studies Pt 1) + lld_prac Pt 1."}
      ],
      days: [
        [
          ["dsa",["dsa_dp_adv"],"Ch.10 Greedy & S10.1 Non-Overlap Removals","Prove greedy end-time exchange argument and test S10.1 against subset brute force.","jdsa_prac",1.5],
          ["sql",["sql_model"],"MySQL Pt 13: Functional Deps & 1NF–3NF/BCNF","Compute closures, candidate keys, lossless join & solve Pt 13 prac.","sql_prac",1],
          ["backend",["be_lld"],"LLD Ch.4–5: Structural & Behavioural GoF","Build Decorator, Adapter, Proxy, Strategy, State & Observer in Java 21.","lld_guide",1.4]
        ],
        [
          ["dsa",["dsa_dp_adv"],"S10.2 Bit Puzzles & S10.3 Sieve + SPF","Code Hamming dist, power-of-4, 32-bit reverse (check Integer.reverse) & 10^6 SPF sieve.","jdsa_prac",1.5],
          ["sql",["sql_jdbc_tx"],"JDBC Ch.1–4: PreparedStatement, Tx & Batching","Observe MySQL/H2 isolation levels, lost updates, batch continuation & SQLi fixes.","jdbc_guide",1],
          ["backend",["be_lld"],"LLD Ch.6: Concurrency in Object Design","Code putIfAbsent, lock ordering, producer-consumer & read-write cache locks.","lld_guide",1.4]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Ch.11 Binary Trie & S10.4 Maximum XOR Pair","Build 32-bit bitwise Trie solving S10.4 Max XOR in O(32n) and verify against O(n^2).","jdsa_prac",1.6],
          ["sql",["sql_jdbc_tx"],"JDBC Ch.5–9: HikariCP, DAO, Migrations & JPA","Build mini JdbcTemplate, HikariCP pool sizing & Servlet/DAO lifecycle.","jdbc_guide",1],
          ["backend",["be_lld"],"LLD Ch.7 Case Studies I: Parking, LRU/LFU, Seat Hold","Study Parking Lot, thread-safe LRU/LFU & TTL seat-hold case studies cleanly.","lld_guide",1.5]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Ch.11 Fenwick Tree & S10.5 Count Smaller (Hard)","Implement Fenwick Tree + coordinate compression solving S10.5 in O(n log n).","jdsa_prac",1.6],
          ["sql",["sql_jdbc_tx"],"MySQL Pt 14: Users, Privileges & Backups + Prac","Review CREATE ROLE, GRANT least privilege, mysqldump & binlog PITR.","sql_prac",0.9],
          ["backend",["be_lld"],"LLD Practice Book Pt 1 (SOLID & GoF Ex.)","Solve first half of 41 LLD exercises writing single-file java Main.java.","lld_prac",1.5]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Ch.11 KMP String Match & >>> Shift Check","Implement O(n) KMP LPS array & verify unsigned >>> vs signed >> shifts.","jdsa_rev",1.2],
          ["sql",["sql_jdbc_tx"],"JDBC Practice Book Pt 1 (Tx & Pools Ex.)","Solve JDBC connection pool & transaction rollback exercises in jdbc_prac.","jdbc_prac",0.9],
          ["backend",["be_lld"],"Project 2 Machine Coding: Elevator & Rate Limiter","Start Project 2 Java 21 LLD suite: implement Elevator + Token-Bucket Limiter.","lld_guide",1.5]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Week 10 Redo + Fenwick & Binary Trie Blank","Redo Week 10 ~ items + write Binary Trie & Fenwick Tree from blank.","jdsa_prac",1.5],
          ["sql",["sql_jdbc_tx"],"JDBC Practice Book Pt 2 (DAO & Batching)","Complete remaining JDBC Practice exercises & prepared-statement audits.","jdbc_prac",0.9],
          ["backend",["be_lld"],"Project 2 Machine Coding: Splitwise & Logger","Implement Splitwise settle-up & async Thread-safe Logger with clean tests.","lld_prac",1.5]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Week 11 Mixed Timed Check (Trie + Greedy)","Solve 2 unseen Ch.10–11 Java problems in 55m.","jdsa_guide",1.4],
          ["sql",["sql_model"],"Final Schema Normalisation Check","Normalise an invoice table cleanly 1NF -> 2NF -> 3NF -> BCNF.","sql_prac",0.9],
          ["backend",["be_lld"],"Code Review of Project 2 LLD Modules","Check encapsulation, thread-safety & extensible interfaces across all 4 designs.","lld_guide",1.1]
        ]
      ]
    },
    {
      id: 12,
      month: 3,
      title: "12-Week Finale: Java Rev/CPA, MySQL Rev, Loop A & Proj 2",
      focus: ["Ch.12 + 14p Rev + CPA + Loop A","MySQL Pts 15–16 + Quick Rev","LLD Ch.8–9 + Ship Project 2 Suite"],
      practiceTag: "Ch.12 • 14p Rev • CPA Java • MySQL Rev • Ship Proj 2",
      targets: [
        {"id":"jw12_d","track":"dsa","text":"Finish Ch.12, complete 14p Java Quick Revision, TCS CPA Java sets & pass Mock Loop A coding round."},
        {"id":"jw12_s","track":"sql","text":"Complete MySQL Parts 15–16 (Classic Query Problems, Quick-Fire) & 04_MySQL_Quick_Revision.pdf."},
        {"id":"jw12_b","track":"backend","text":"Finish LLD Ch.8–9 + Practice Book Pt 2 & ship Portfolio Project 2 (Java 21 Machine-Coding Suite)."}
      ],
      days: [
        [
          ["dsa",["dsa_dp_adv","dsa_toolkit"],"Ch.12 Pattern Map + Complexity Table","Drill Ch.12 problem-statement pattern matrix & full Big-O cheat sheet.","jdsa_guide",1.5],
          ["sql",["sql_core","sql_windows_perf"],"MySQL Pt 15: Classic Interview Queries","Solve Nth highest salary, consecutive streaks & median problems.","sql_prac",1],
          ["backend",["be_lld"],"LLD Ch.8–9: Case Studies II (Vending, Library, TTL)","Study Vending Machine State, Library, Notification & TTL Store + Ch.9 checklist.","lld_guide",1.4]
        ],
        [
          ["dsa",["dsa_dp_adv","dsa_linear"],"14-Page DSA in Java Quick Revision Read","Work through 03_DSA_in_Java_Quick_Revision.pdf end-to-end; write templates blind.","jdsa_rev",1.5],
          ["sql",["sql_joins","sql_windows_perf"],"MySQL Pt 15 Remaining Query Suite","Finish remaining Classic Query Problems in Part 15 checking ties/NULLs.","sql_prac",1],
          ["backend",["be_lld"],"LLD Practice Book Pt 2 Completion","Solve second half of 41 LLD case-study exercises in lld_prac.","lld_prac",1.5]
        ],
        [
          ["dsa",["dsa_toolkit","dsa_arrays"],"TCS CPA Java Practice Sets + CPA Rev","Complete timed Java problems from 04_Java_TCS_CPA_Practice_Sets.pdf & java_rev.","java_cpa",1.5],
          ["sql",["sql_jdbc_tx","sql_windows_perf"],"MySQL Pt 16: Interview Quick-Fire Bank","Answer all Part 16 short-answer questions cleanly.","sql_guide",0.9],
          ["backend",["be_lld"],"Ship Portfolio Project 2 (Java 21 LLD Suite)","Package 6 runnable single-file Java 21 designs + unit checks + README.","lld_guide",1.6]
        ],
        [
          ["dsa",["dsa_arrays","dsa_graphs","dsa_dp_adv"],"Mock Loop A (Fresher): Java Coding + Bank LLD","Sit timed Loop A coding + Bank-Account LLD & grade against Loop A rubric.","mock_guide",1.6],
          ["sql",["sql_core","sql_windows_perf","sql_jdbc_tx"],"Full MySQL Quick Revision Read-Through","Complete 04_MySQL_Quick_Revision.pdf & verify Appendices A & B.","sql_rev",1],
          ["backend",["be_lld"],"Loop A Bank-Account Design Post-Mortem","Refactor Loop A Bank-Account concurrency/invariant handling per rubric.","mock_guide",1.2]
        ],
        [
          ["dsa",["dsa_dp_adv"],"12-Week Java Redo Queue Cleanup","Clear every remaining ~ item from Weeks 1–11 (S1.1–S10.5).","jdsa_prac",1.5],
          ["sql",["sql_windows_perf","sql_jdbc_tx"],"Timed 30-Min SQL Core Mock Check","Solve 4 unseen MySQL queries combining joins, windows & NULL traps.","sql_prac",0.9],
          ["backend",["be_cs_core","be_testing_devops"],"Phase 1 Portfolio Sync (Projects 1 & 2)","Confirm Project 1 (Spring Smart-Meter) & Project 2 (LLD) repos pass CI cleanly.","devops_guide",1.2]
        ],
        [
          ["dsa",["dsa_graphs","dsa_dp_adv"],"Java Bug Checklist & Loop A Post-Mortem","Distil java_rev + 12-week error log into 1-page pre-submit checklist.","java_rev",1.3],
          ["sql",["sql_model","sql_windows_perf"],"SQL Appendix A & Error-Code Check","Verify logical query order & error codes (1052, 1055, 1364, 1451).","sql_guide",0.8],
          ["backend",["be_lld"],"45-Min Timed Unseen LLD Design Kata","Design a clean thread-safe Parking Lot / Cache from blank editor in 45m.","lld_prac",1.3]
        ],
        [
          ["dsa",["dsa_arrays","dsa_graphs","dsa_dp_adv"],"12-Week Java Milestone Sim (3 Problems)","Sit 75-min 3-problem Java OA simulation spanning Easy/Medium/Hard.","mock_work",1.6],
          ["sql",["sql_windows_perf","sql_jdbc_tx"],"Phase 1 SQL + JDBC Milestone Sign-off","Verify 16/16 MySQL Parts + JDBC complete ahead of DBMS Theory.","sql_rev",0.8],
          ["backend",["be_spring","be_lld"],"Phase 1 -> Phase 2 Engineering Retro","Note Concurrency/Spring/LLD gaps for Phase 2 Adv Backend & HLD.","mock_guide",1]
        ]
      ]
    },
    {
      id: 13,
      month: 4,
      title: "Java Maint, DBMS Algebra/FDs & Redis Caching",
      focus: ["Maint: Arrays, Window & BS (Java)","DBMS Theory Ch.1–3 (Algebra & BCNF)","Adv Backend Ch.1–2 (Redis & Rate Limits)"],
      practiceTag: "Java Maint W13 • DBMS Ch.1–3 • Redis + Rate Limits",
      targets: [
        {"id":"jw13_d","track":"dsa","text":"Run 3 timed Java maintenance drills on Arrays, Sliding Window & Binary Search (sub-25m)."},
        {"id":"jw13_s","track":"sql","text":"Complete DBMS Theory Ch.1–3 (Storage Engines, Relational Algebra, Closure, Minimal Cover & BCNF/3NF)."},
        {"id":"jw13_b","track":"backend","text":"Master Advanced Backend Ch.1–2 (Redis LRU vs LFU, Cache Stampedes/XFetch, Rate Limiting, Distributed Locks)."}
      ],
      days: [
        [
          ["dsa",["dsa_arrays","dsa_toolkit"],"Speed Drill: 2 Java Sliding-Window Meds","Solve 2 unseen array/window problems cleanly using HashMap & StringBuilder.","jdsa_guide",1],
          ["sql",["sql_model"],"DBMS Ch.1–2: Fundamentals & Rel. Algebra","Trace sigma/pi/join/division relational algebra expressions & equivalence rules.","dbms_guide",1.1],
          ["backend",["be_adv_backend"],"Adv Backend Ch.1: Caching Patterns & Eviction","Compare Cache-Aside, Write-Through, Redis sub-second LRU vs LFU eviction behaviour.","abe_guide",1.5]
        ],
        [
          ["dsa",["dsa_bsearch"],"Speed Drill: Overflow-Safe Binary Search","Solve 2 unseen monotonic capacity/minimax binary search Mediums with long.","jdsa_prac",1],
          ["sql",["sql_model"],"DBMS Ch.3: FD Closures, Keys & Minimal Cover","Compute canonical minimal covers & prove dependency preservation via chase.","dbms_guide",1.1],
          ["backend",["be_adv_backend"],"Adv Backend Ch.1: Cache Stampedes & XFetch","Compare plain vs singleflight rebuild lock vs probabilistic XFetch expiry.","abe_guide",1.5]
        ],
        [
          ["dsa",["dsa_arrays"],"Matrix & Difference Array Timed Drill","Solve 1 prefix-modulo or 2D matrix sweep cleanly in O(1) space.","jdsa_guide",0.9],
          ["sql",["sql_model"],"DBMS Ch.3: 3NF Synthesis vs BCNF Decomp","Run Bernstein 3NF synthesis algorithm and compare with BCNF trade-offs.","dbms_guide",1.1],
          ["backend",["be_adv_backend"],"Adv Backend Ch.2: Rate Limiters in Redis","Implement Fixed Window vs Sliding Log vs Sliding Counter vs Token Bucket (Lua).","abe_guide",1.6]
        ],
        [
          ["dsa",["dsa_bsearch"],"Hard Interval / Sweepline Drill in Java","Solve 1 Hard interval scheduling or TreeMap sweep event problem in 40m.","jdsa_prac",1],
          ["sql",["sql_model"],"DBMS Practice Book Ch.1–3 Exercises","Solve relational algebra, candidate key, minimal cover & BCNF problems in dbms_prac.","dbms_prac",1.1],
          ["backend",["be_adv_backend"],"Adv Backend Ch.2: Idempotency & Fencing Locks","Implement idempotency keys under concurrent retries + fencing token Redis locks.","abe_guide",1.5]
        ],
        [
          ["dsa",["dsa_arrays"],"Workbook Timed Coding Round (Part 1 Pick)","Complete 1 timed Workbook Part 1 coding round under interview narration.","mock_work",1],
          ["sql",["sql_model"],"Chase Test & Lossless-Join Proofs","Verify lossless-join decomposition table chases on 3 tricky schemas.","dbms_prac",0.9],
          ["backend",["be_adv_backend"],"Adv Backend Practice Book Pt 1 (Redis/Locks)","Solve cache stampede, hot-key salting & rate-limiter boundary problems in abe_prac.","abe_prac",1.4]
        ],
        [
          ["dsa",["dsa_arrays","dsa_bsearch"],"Week 13 Redo Queue & Trap Audit","Re-solve failed Week 13 drills and update Java bug log.","jdsa_rev",0.9],
          ["sql",["sql_model"],"Relational Algebra -> SQL Translation Check","Convert 4 division/anti-join algebra queries cleanly to MySQL 8.","dbms_guide",0.9],
          ["backend",["be_adv_backend"],"Redis Multi-Tab Fail-Safe Stampede Lab","Test single-flight rebuild mutex preventing 100-thread DB dogpile.","abe_prac",1.3]
        ],
        [
          ["dsa",["dsa_arrays"],"Weekly Pattern Fluency Check (10-Min)","Write first-true binary search & sliding-window templates blind.","jdsa_rev",0.8],
          ["sql",["sql_model"],"BCNF vs 3NF Oral Defence Drill","Explain when 3NF is preferred over BCNF with concrete FD counterexample.","dbms_guide",0.8],
          ["backend",["be_adv_backend"],"Map Caching & Rate Limits to Spring Smart-Meter","Design Redis caching & API rate-limiter tier for Project 3 upgrade.","abe_guide",1.1]
        ]
      ]
    },
    {
      id: 14,
      month: 4,
      title: "Trees/Heaps Maint, DBMS Concurrency/ARIES & Messaging/Sagas",
      focus: ["Maint: Trees, BSTs & PriorityQueue","DBMS Theory Ch.4–6 (2PL/MVCC/ARIES)","Adv Backend Ch.3–5 (Queues/Outbox/WS)"],
      practiceTag: "Java Maint W14 • DBMS Ch.4–6 • Queues, Sagas & WS",
      targets: [
        {"id":"jw14_d","track":"dsa","text":"Maintain Java Trees, BSTs & PriorityQueue two-heap fluency across timed Medium/Hard drills."},
        {"id":"jw14_s","track":"sql","text":"Complete DBMS Theory Ch.4–6 (Conflict Serializability, Strict 2PL, MVCC Write Skew & ARIES Recovery)."},
        {"id":"jw14_b","track":"backend","text":"Complete Adv Backend Ch.3–5 (Message Queues, DLQ, Outbox, Sagas, Scheduled Jobs & SSE/WebSockets)."}
      ],
      days: [
        [
          ["dsa",["dsa_trees"],"Timed Tree State-Return Drill (Java)","Solve 2 unseen Bottom-Up Tree DP / LCA variants cleanly.","jdsa_guide",1],
          ["sql",["sql_jdbc_tx"],"DBMS Ch.4: Schedules & Precedence Graphs","Build conflict-serializability precedence graphs & view-serializability checks.","dbms_guide",1.1],
          ["backend",["be_adv_backend"],"Adv Backend Ch.3: Queues, Retries & DLQ","Design at-least-once consumer groups, visibility timeouts, backoff & dead-letter queues.","abe_guide",1.5]
        ],
        [
          ["dsa",["dsa_graphs"],"Timed PriorityQueue Scheduling Drill","Solve 2 heap problems (IPO / Meeting Rooms III / Median Stream).","jdsa_prac",1],
          ["sql",["sql_jdbc_tx"],"DBMS Ch.5: Strict 2PL, Thomas Write Rule & SI","Observe lock-upgrade deadlocks, timestamp ordering & MVCC write-skew anomaly.","dbms_guide",1.2],
          ["backend",["be_adv_backend"],"Adv Backend Ch.3: Transactional Outbox & Sagas","Implement DB Outbox relay & orchestration vs choreography Sagas with compensations.","abe_guide",1.6]
        ],
        [
          ["dsa",["dsa_trees"],"BST Iterator & Codec Maintenance","Code O(h)-space BST Iterator + preorder Codec serialiser blind.","jdsa_guide",0.9],
          ["sql",["sql_jdbc_tx"],"DBMS Ch.6: WAL, Undo/Redo & ARIES Recovery","Trace Analysis -> Redo -> Undo passes & Compensation Log Records (CLRs).","dbms_guide",1.2],
          ["backend",["be_adv_backend"],"Adv Backend Ch.4–5: Jobs, SSE & WebSockets","Compare cron/leased job runners, HTTP SSE push vs bidirectional WebSocket heartbeats.","abe_guide",1.5]
        ],
        [
          ["dsa",["dsa_trees","dsa_graphs"],"Hard Tree/Heap Challenge in Java","Attempt 1 Hard tree/heap question cleanly in 40m.","jdsa_prac",1],
          ["sql",["sql_jdbc_tx"],"DBMS Practice Book Ch.4–6 Exercises","Solve conflict graphs, write-skew fixes & ARIES crash-recovery traces in dbms_prac.","dbms_prac",1.2],
          ["backend",["be_adv_backend"],"Adv Backend Practice Book Pt 2 (Outbox/WS)","Complete queue idempotency, Saga rollback & WebSocket exercises in abe_prac.","abe_prac",1.5]
        ],
        [
          ["dsa",["dsa_trees"],"Workbook Timed Coding Round (Tree Focus)","Sit 1 timed coding problem from Mock Workbook focusing on aloud walkthrough.","mock_work",1],
          ["sql",["sql_jdbc_tx"],"Write-Skew -> Serializable SI / FOR UPDATE Fix","Demonstrate resolving 2PL upgrade & SI doctor-on-call write-skew anomalies.","dbms_prac",0.9],
          ["backend",["be_adv_backend"],"Build Outbox Relay Demo for Smart-Meter Project","Draft atomic DB write + outbox table relay for Project 3 reliability.","abe_guide",1.4]
        ],
        [
          ["dsa",["dsa_trees","dsa_graphs"],"Week 14 Redo Queue Audit","Redo stumbled Tree/Heap drills from blank editor after 48-72 hrs.","jdsa_prac",0.9],
          ["sql",["sql_jdbc_tx"],"ARIES 3-Pass Crash State Self-Test","Recover a 4-transaction dirty crash log step by step on blank paper.","dbms_guide",0.9],
          ["backend",["be_adv_backend"],"Polling vs Long-Poll vs SSE vs WS Decision Card","Document battery/connection/proxy trade-offs across all 4 push mechanisms.","abe_prac",1.1]
        ],
        [
          ["dsa",["dsa_graphs"],"PQ Comparator & HashMap Edge Review","Verify Integer.compare & Object equals/hashCode across custom keys.","jdsa_rev",0.8],
          ["sql",["sql_jdbc_tx"],"Concurrency Control Comparison Matrix","Contrast 2PL, OCC, Timestamp Ordering, MVCC & SSI cleanly.","dbms_guide",0.8],
          ["backend",["be_adv_backend"],"Mid-Month Architecture Check on Project 3","Review Smart-Meter Redis/Outbox integration plan before Ch.6–9.","abe_guide",1]
        ]
      ]
    },
    {
      id: 15,
      month: 4,
      title: "Graphs Maint, B+ Trees/Hash Join & gRPC/NoSQL/Proj 3",
      focus: ["Maint: BFS/DFS/Topo/DSU (Java)","DBMS Ch.7–8 (B+ Trees & Joins)","Adv Backend Ch.6–9 + Build Project 3"],
      practiceTag: "Java Maint W15 • DBMS Ch.7–8 • GraphQL/gRPC/NoSQL",
      targets: [
        {"id":"jw15_d","track":"dsa","text":"Drill Java Graphs (8-dir BFS, Dijkstra, DSU, Kahn topo sort) at sub-30m interview speed."},
        {"id":"jw15_s","track":"sql","text":"Complete DBMS Theory Ch.7–8 (Buffer Pools, B+ Tree Splits, Extendible Hashing & Join Algorithms)."},
        {"id":"jw15_b","track":"backend","text":"Finish Adv Backend Ch.6–9 (Presigned Object Storage, REST/GraphQL/gRPC, NoSQL) & wire Project 3."}
      ],
      days: [
        [
          ["dsa",["dsa_graphs"],"Timed Kahn Topo + Cycle Maint Drill","Solve Course Schedule IV / Alien Dictionary topo sort cleanly in 35m.","jdsa_guide",1],
          ["sql",["sql_windows_perf"],"DBMS Ch.7: Buffer Repl., B+ Trees & Ext. Hash","Trace B+ Tree leaf/internal splits, Clock vs LRU buffer eviction & extendible hashing.","dbms_guide",1.1],
          ["backend",["be_adv_backend"],"Adv Backend Ch.6–7: S3 Presigned, GraphQL & gRPC","Compare S3 direct uploads, GraphQL N+1 DataLoader & HTTP/2 Protobuf gRPC.","abe_guide",1.5]
        ],
        [
          ["dsa",["dsa_graphs"],"Timed Dijkstra & State-Space BFS Drill","Solve Shortest Path Alternating Colors / Min Effort with long[] dist.","jdsa_prac",1],
          ["sql",["sql_windows_perf"],"DBMS Ch.8: External Sort, Hash Join & Costing","Compute I/O costs: nested loop vs sort-merge vs Grace hash join (M > sqrt(B) rule).","dbms_guide",1.1],
          ["backend",["be_adv_backend"],"Adv Backend Ch.8–9: NoSQL Modelling & Bank","Model DynamoDB/Cassandra access-pattern tables, GSI vs LSI & interview checklist.","abe_guide",1.5]
        ],
        [
          ["dsa",["dsa_graphs"],"DSU Weighted / Dynamic Connectivity Drill","Implement Evaluate Division / Most Stones Removed with clean UnionFind class.","jdsa_guide",1],
          ["sql",["sql_windows_perf"],"DBMS Practice Book Ch.7–8 Exercises","Complete B+ tree order, buffer-pin & join-cost exercises in dbms_prac.","dbms_prac",1.1],
          ["backend",["be_adv_backend"],"Adv Backend Practice Book Pt 3 (gRPC/NoSQL)","Complete GraphQL/gRPC/NoSQL data modelling & both system design prompts in abe_prac.","abe_prac",1.6]
        ],
        [
          ["dsa",["dsa_graphs"],"Hard Graph Drill (Bellman-Ford / Bitmask BFS)","Attempt 1 Hard graph problem in 40m tracking shortest-path invariant.","jdsa_prac",1],
          ["sql",["sql_windows_perf"],"SQLite/MySQL Skip-Scan & Sel. Estimations","Verify selectivity estimation errors & when index skip-scans trigger.","dbms_guide",0.9],
          ["backend",["be_adv_backend"],"Project 3 Core: Smart-Meter Redis + Rate Limit","Upgrade Project 1 Smart-Meter API with Redis tariff caching & token-bucket limit.","abe_guide",1.6]
        ],
        [
          ["dsa",["dsa_graphs"],"Workbook Coded Graph Round","Sit 1 timed Mock Workbook graph question with complexity walkthrough.","mock_work",1],
          ["sql",["sql_windows_perf"],"Clustered vs Unclustered Index Cost Calculation","Compare random heap lookups vs clustered B+ Tree range scan page I/Os.","dbms_prac",0.9],
          ["backend",["be_adv_backend"],"Project 3 Resilience: Idempotency & Audit Log","Add idempotent meter ingestion & outbox event log to Project 3.","abe_prac",1.5]
        ],
        [
          ["dsa",["dsa_graphs"],"Week 15 Redo Queue & Graph Checklist","Re-solve stumbled graph drills and confirm O(E log V) vs O(V+E).","jdsa_rev",0.9],
          ["sql",["sql_windows_perf"],"Extendible Hashing Bucket Split Drill","Trace global vs local depth bucket splits across 6 hash keys.","dbms_guide",0.8],
          ["backend",["be_adv_backend"],"Project 3 Integration & Redis Load Checks","Run integration tests verifying cache hit, stampede guard & 429 rate-limit headers.","abe_prac",1.4]
        ],
        [
          ["dsa",["dsa_graphs"],"Blind Dijkstra + Kahn Recall in Java","Write both Dijkstra & Kahn topo sort bug-free in 12 minutes.","jdsa_rev",0.8],
          ["sql",["sql_windows_perf"],"Join Algorithm Decision Matrix","State preconditions & memory formulas for Sort-Merge vs Hash Join.","dbms_guide",0.8],
          ["backend",["be_adv_backend"],"REST vs GraphQL vs gRPC Summary Table","Document wire format, schema evolution & browser proxy support trade-offs.","abe_guide",1]
        ]
      ]
    },
    {
      id: 16,
      month: 4,
      title: "DP Maint + Loop B, DBMS Dist./2PC, Ship Proj 3 & HLD Start",
      focus: ["Maint: DP + Loop B Coding","DBMS Ch.9–10 (Sharding, 2PC & CRDTs)","Ship Project 3 + Start HLD Ch.1–3"],
      practiceTag: "Loop B • DBMS Ch.9–10 • Ship Proj 3 • HLD Ch.1–3",
      targets: [
        {"id":"jw16_d","track":"dsa","text":"Drill 1D/2D/Knapsack DP and pass Mock Loop B (SDE-1 Java coding + KV-Store machine coding)."},
        {"id":"jw16_s","track":"sql","text":"Finish DBMS Theory Ch.9–10 (Sharding, Quorums, 2PC Coordinator Crash & Q-Bank) + dbms_prac Finish."},
        {"id":"jw16_b","track":"backend","text":"Ship Portfolio Project 3 (Production Smart-Meter) & complete HLD Ch.1–3 (Estimation, CDN, LB)."}
      ],
      days: [
        [
          ["dsa",["dsa_dp_adv"],"Timed 1D/2D DP Speed Pair in Java","Solve 2 unseen DP Mediums cleanly in 50m.","jdsa_guide",1],
          ["sql",["sql_jdbc_tx"],"DBMS Ch.9: Quorums, Consistent Hash & 2PC","Trace W+R > N quorums, virtual nodes & blocking 2PC coordinator crash.","dbms_guide",1.1],
          ["backend",["be_hld_dist"],"HLD Ch.1–2: Fundamentals & Estimation Script","Derive QPS, peak factor, storage, bandwidth & RAM cache sizing cleanly.","hld_guide",1.5]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Knapsack 2D -> 1D Space Reduction Kata","Compress 2D knapsack DP into 1D int[] cleanly without loop direction slips.","jdsa_prac",0.9],
          ["sql",["sql_jdbc_tx"],"DBMS Ch.10 & Practice Book Remaining Ex.","Complete all remaining dbms_prac distributed/indexing exercises + Ch.10 formulas.","dbms_prac",1.1],
          ["backend",["be_hld_dist"],"HLD Ch.3: Edge, DNS, CDN & Consistent Hashing","Study Zipf CDN offload, power-of-two-choices LB & hot-key salting.","hld_guide",1.5]
        ],
        [
          ["dsa",["dsa_bsearch","dsa_graphs","dsa_dp_adv"],"Mock Loop B (SDE-1): Java Coding + KV LLD","Sit Loop B Graph+BS coding + transactional KV-Store machine coding & Loop B HLD/HR.","mock_guide",1.5],
          ["sql",["sql_model","sql_windows_perf"],"DBMS Ch.10 Formula & Theorem Blind Recall","Verify BCNF/3NF rules, B+ Tree fanout height & R+W>N quorum proofs.","dbms_guide",0.9],
          ["backend",["be_adv_backend"],"Ship Portfolio Project 3 (Prod Smart-Meter API)","Finalise Docker Compose (App+MySQL+Redis), benchmark report & push clean README.","abe_guide",1.6]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Hard DP Challenge (Interval or Bitmask DP)","Solve Burst Balloons or Matrix-Chain variant cleanly in 45m.","jdsa_prac",1],
          ["sql",["sql_jdbc_tx"],"Compare 2PC vs Outbox/Saga Reliability","Articulate why 2PC blocks across microservices while Outbox/Saga isolates failures.","dbms_prac",0.8],
          ["backend",["be_hld_dist"],"HLD Practice Book Ch.1–3 (Estimation/Edge)","Solve QPS/cache sizing & hot-shard mitigations in hld_prac Pt 1.","hld_prac",1.4]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Loop B Coding Debrief & Error Log","Audit Loop B code clarity & edge tests via Mock Loops Ch.5.","mock_guide",0.9],
          ["sql",["sql_windows_perf"],"DBMS Theory + MySQL 8 Synthesis Review","Connect InnoDB B+Tree page structure directly to EXPLAIN query plans.","sql_guide",0.8],
          ["backend",["be_lld","be_hld_dist"],"Loop B Order-Tracking HLD Post-Mortem","Review Mock Loop B live order-tracking scale design against rubric.","mock_guide",1.2]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Month 4 Redo Queue Consolidation","Re-solve all Month 4 ~ flagged Java problems from blank files.","jdsa_prac",1],
          ["sql",["sql_jdbc_tx"],"Month 4 DBMS Theory Sign-Off","Verify all 52 DBMS Practice exercises complete.","dbms_prac",0.8],
          ["backend",["be_hld_dist"],"Back-of-Envelope Numbers Speed Sheet","Memorise L1/RAM/SSD/HDD/WAN latencies, 1 req/s ~86.4k/day & storage math.","hld_guide",1.1]
        ],
        [
          ["dsa",["dsa_arrays","dsa_trees","dsa_graphs","dsa_dp_adv"],"Month 4 Java Mixed Check","Sit 2 unseen Medium/Hard problems across Arrays & DP in 60m.","mock_work",1.2],
          ["sql",["sql_windows_perf"],"Month 4 SQL/DBMS Mock Gate Check","Answer 5 tricky isolation + B+ Tree + join cost questions.","dbms_prac",0.8],
          ["backend",["be_adv_backend","be_spring"],"Projects 1–3 Portfolio Inspection","Confirm Smart-Meter API + Java LLD Suite READMEs & demos are interview-ready.","abe_guide",1]
        ]
      ]
    },
    {
      id: 17,
      month: 5,
      title: "Stack/Greedy Maint, Kafka Core Pt 1 & HLD Ch.4–8",
      focus: ["Maint: Mono Stack, Intervals & Greedy","Kafka Ch.1–3 (Log, Partitions, Repl)","HLD Ch.4–8 (Storage, Caching, Consistency)"],
      practiceTag: "Java Maint W17 • Kafka Ch.1–3 • HLD Ch.4–8",
      targets: [
        {"id":"jw17_d","track":"dsa","text":"Drill ArrayDeque monotonic stack, greedy intervals & Java heap-greedy problems cleanly."},
        {"id":"jw17_s","track":"sql","text":"Complete Kafka & Streams Ch.1–3 (Commit Log, Murmur2 Partitioning, ISR & Durability) + Pt 1 prac."},
        {"id":"jw17_b","track":"backend","text":"Complete HLD Ch.4–8 (Sharding, Caching Races, Async Back-pressure, Reliability/Fencing & APIs)."}
      ],
      days: [
        [
          ["dsa",["dsa_linear"],"ArrayDeque Monotonic Stack Speed Pair","Solve Sliding Window Max + Next Greater II in 40m.","jdsa_guide",0.9],
          ["sql",["sql_kafka"],"Kafka Ch.1–2: Commit Log, Topics & Murmur2","Study append-only segments, key hashing partitioner & fixed-partition rebalancing.","kafka_guide",1.1],
          ["backend",["be_hld_dist"],"HLD Ch.4–5: Storage Scale & Caching Races","Trace sharding keys, cache-aside races, stampedes & consistent ring splits.","hld_guide",1.5]
        ],
        [
          ["dsa",["dsa_bsearch","dsa_dp_adv"],"Greedy Interval & Jump Drills + S10.1","Solve Non-overlapping Intervals, Merge Intervals & Jump Game II with exchange proof.","jdsa_prac",0.9],
          ["sql",["sql_kafka"],"Kafka Ch.3: Replication, ISR & acks=all","Contrast acks=0/1/all, min.insync.replicas, unclean leader election & HW.","kafka_guide",1.1],
          ["backend",["be_hld_dist"],"HLD Ch.6: Async Back-Pressure & Outbox","Analyse queue back-pressure charts, load shedding & delivery guarantees.","hld_guide",1.5]
        ],
        [
          ["dsa",["dsa_linear","dsa_dp_adv"],"Hard Stack / Greedy Drill in Java","Solve Largest Rectangle in Histogram or Candy / Min Platforms.","jdsa_prac",1],
          ["sql",["sql_kafka"],"Kafka Practice Book Ch.1–3 (Part 1 Ex.)","Complete partitioning skew, ISR loss & consumer lag exercises in kafka_prac.","kafka_prac",1.1],
          ["backend",["be_hld_dist"],"HLD Ch.7: Fencing Tokens, Retries & CBs","Explain why full jitter keeps the first spike, circuit breakers & saga patterns.","hld_guide",1.5]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Greedy Counter-Examples vs DP Audit","Identify 3 problems where greedy fails & DP is required.","jdsa_guide",0.9],
          ["sql",["sql_windows_perf"],"SQL EXPLAIN Clinic: Indexing At HLD Scale","Match shard-key SQL queries with composite B+ tree covering indexes.","sql_guide",0.9],
          ["backend",["be_hld_dist"],"HLD Ch.8: Microservices, Gateways & Pagination","Contrast offset vs cursor pagination, BFF gateways & API versioning.","hld_guide",1.4]
        ],
        [
          ["dsa",["dsa_linear"],"Workbook Coding Drill (Stack/Intervals)","Time 1 Mock Workbook problem focusing on clean modular methods.","mock_work",0.9],
          ["sql",["sql_kafka"],"Hot-Key Partition Skew Mitigation Drill","Design salted keys preserving partial ordering across consumers.","kafka_guide",0.9],
          ["backend",["be_hld_dist"],"HLD Practice Book Pt 2 (Ch.4–8 Design Ex.)","Complete HLD caching, backpressure, circuit-breaker & pagination exercises in hld_prac.","hld_prac",1.5]
        ],
        [
          ["dsa",["dsa_linear","dsa_dp_adv"],"Week 17 Redo & Pattern Check","Redo stumbled stack/greedy problems from blank file.","jdsa_rev",0.9],
          ["sql",["sql_kafka"],"Kafka Segment Compaction vs Retention Check","Compare time/size deletion vs log compaction latest-per-key.","kafka_prac",0.8],
          ["backend",["be_hld_dist"],"HLD Core Building Blocks One-Pager","Draw full Edge -> Gateway -> Service -> Cache/Queue -> Sharded DB diagram blind.","hld_guide",1.2]
        ],
        [
          ["dsa",["dsa_linear"],"Timed 25m ArrayDeque Template Recall","Write monotonic increasing/decreasing stack pattern blind.","jdsa_rev",0.8],
          ["sql",["sql_kafka"],"ISR Durability Failure Mode Quiz","Verify why acks=all + min.insync.replicas=2 + RF=3 tolerates 1 broker crash.","kafka_guide",0.7],
          ["backend",["be_hld_dist"],"Smart-Meter HLD Architecture Preview","Connect Project 1/3 implementation to HLD Ch.9 Smart-Meter scale design.","hld_guide",1]
        ]
      ]
    },
    {
      id: 18,
      month: 5,
      title: "Tries/DSU/Bits Maint, Kafka Producers/Groups & HLD Cases",
      focus: ["Maint: Tries, DSU & Bitmasks","Kafka Ch.4–6 (Producers, Groups, EOS)","HLD Ch.9–11 (13 Full Case Studies)"],
      practiceTag: "Java Maint W18 • Kafka Ch.4–6 • HLD 13 Case Studies",
      targets: [
        {"id":"jw18_d","track":"dsa","text":"Drill Binary Tries, Union-Find, Bitmask subsets & O(log n) math patterns cleanly in Java."},
        {"id":"jw18_s","track":"sql","text":"Complete Kafka Ch.4–6 (Idempotent Producers, Rebalance Protocols & Transactions/EOS)."},
        {"id":"jw18_b","track":"backend","text":"Finish HLD Ch.9–11 & all remaining HLD Practice Case Studies (Smart-Meter, EV Charging, Feed, Chat)."}
      ],
      days: [
        [
          ["dsa",["dsa_dp_adv","dsa_toolkit"],"Timed Trie & Prefix Tree Drill in Java","Solve Implement Trie / Word Search II / Max XOR pair via 32-bit binary Trie.","jdsa_guide",1],
          ["sql",["sql_kafka"],"Kafka Ch.4: Batching, Compression & Idempotence","Understand linger.ms, PID/sequence idempotent deduplication & ordering.","kafka_guide",1.1],
          ["backend",["be_hld_dist"],"HLD Ch.9 Case Studies I (Smart-Meter, URL, Feed)","Deep-dive late data, dedup by (meter,ts), downsampling & celebrity fan-out.","hld_guide",1.6]
        ],
        [
          ["dsa",["dsa_graphs","dsa_dp_adv"],"Bitmask Subset & Number-Theory Drill","Solve Subsets/XOR, Sieve primes & modular inverse pow(a, b, mod).","jdsa_prac",1],
          ["sql",["sql_kafka"],"Kafka Ch.5: Consumer Groups & Co-op Rebalance","Compare eager vs cooperative sticky assignors, commit offsets & poison pills.","kafka_guide",1.1],
          ["backend",["be_hld_dist"],"HLD Ch.10 Case Studies II (Chat, Ride, Search)","Design ephemeral presence, geohash matching & inverted-index sharding.","hld_guide",1.6]
        ],
        [
          ["dsa",["dsa_dp_adv","dsa_graphs"],"DSU + Kruskal + Bitmask Combined Set","Solve Equality Equations & Smallest Sufficient Team cleanly in Java.","jdsa_guide",1],
          ["sql",["sql_kafka"],"Kafka Ch.6: Delivery Semantics & Transactions","Trace 2PC coordinator in Kafka EOS + consume-transform-produce atomic commits.","kafka_guide",1.1],
          ["backend",["be_hld_dist"],"HLD Practice Book Case Studies Pt 1 (EV Charging)","Complete EV charging backend + payment/ledger case study in hld_prac.","hld_prac",1.6]
        ],
        [
          ["dsa",["dsa_dp_adv"],"String Matching (KMP / Rolling Hash) Drill","Implement Longest Happy Prefix KMP table in O(n).","jdsa_prac",0.9],
          ["sql",["sql_kafka"],"Kafka Practice Book Pt 2 (EOS & Consumer Lag)","Solve rebalance storm & transactional outbox-to-Kafka exercises in kafka_prac.","kafka_prac",1.1],
          ["backend",["be_hld_dist"],"HLD Practice Book Case Studies Pt 2 & Rubrics","Finish remaining full HLD design prompts checking estimation & bottlenecks.","hld_prac",1.6]
        ],
        [
          ["dsa",["dsa_toolkit","dsa_dp_adv"],"Java Bitwise & Signed/Unsigned Audit","Verify >>> vs >>, 1L << k long shifts & char[26] Trie bounds.","jdsa_rev",0.9],
          ["sql",["sql_kafka"],"At-Least-Once + Idempotent Sink vs True EOS","Compare end-to-end idempotent MySQL upsert vs Kafka transactional isolation.","kafka_guide",0.9],
          ["backend",["be_hld_dist"],"HLD Ch.11 Question Bank & Latency Numbers","Drill rapid-fire HLD trade-off bank (push vs pull, SQL vs NoSQL, strong vs eventual).","hld_guide",1.3]
        ],
        [
          ["dsa",["dsa_dp_adv","dsa_graphs"],"Week 18 Redo Queue Sweep","Re-solve stumbled Trie/Bit/DSU items without hints.","jdsa_prac",0.9],
          ["sql",["sql_windows_perf"],"SQL Tuning Check on Time-Series Table","Design range-partitioned Smart-Meter readings table + rollup query.","sql_guide",0.9],
          ["backend",["be_hld_dist"],"45-Min Timed Unseen HLD Design Mock","Sketch + estimate + defend complete Rate-Limiter / Notifications HLD in 45m.","hld_prac",1.4]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Quick Revision Ch.10–11 Check","Review bit tricks, GCD/LCM, Trie & Fenwick Java templates.","jdsa_rev",0.8],
          ["sql",["sql_kafka"],"Kafka Ch.1–6 Architecture Synthesis","Sketch Producer -> Broker ISR -> Consumer Group Offset flow blind.","kafka_guide",0.8],
          ["backend",["be_hld_dist"],"Prepare Distributed Systems Theory Bridge","List 4 HLD assumptions (consensus, clocks, linearizability, CRDTs) for Week 19.","hld_guide",0.9]
        ]
      ]
    },
    {
      id: 19,
      month: 5,
      title: "Java OA Sim, Kafka Streams Pt 1 & Distributed Systems Pt 1",
      focus: ["Maint: Timed 2-Problem Java OA Sim","Kafka Ch.7–8 (Schemas & Streams)","Distributed Systems Ch.1–5 (Clocks/Paxos/Raft)"],
      practiceTag: "Java OA Sim • Kafka Streams • Paxos & Raft",
      targets: [
        {"id":"jw19_d","track":"dsa","text":"Pass a strict 60-min 2-problem Java Online Assessment simulation + full Error Log audit."},
        {"id":"jw19_s","track":"sql","text":"Complete Kafka Ch.7–8 (Schema Registry/Evolution, Windows, Watermarks & Stateful Joins)."},
        {"id":"jw19_b","track":"backend","text":"Complete Distributed Systems Ch.1–5 (Time, TrueTime, Linearizability, Causal Broadcast, Paxos & Raft)."}
      ],
      days: [
        [
          ["dsa",["dsa_arrays","dsa_graphs"],"60-Min 2-Problem Java OA Sim (No Hints)","Sit unseen Medium + Hard pair with timer, constraint budget & brute-force harness.","jdsa_guide",1.2],
          ["sql",["sql_kafka"],"Kafka Ch.7: Schema Registry & Compatibility","Compare backward, forward & full Avro/Protobuf schema evolution rules.","kafka_guide",1],
          ["backend",["be_hld_dist"],"Dist Sys Ch.1–2: Generals, Clocks & TrueTime","Study Two-Generals probability, Lamport/Vector clocks, Phi Accrual & commit-wait.","dist_guide",1.5]
        ],
        [
          ["dsa",["dsa_dp_adv"],"OA Sim Brute-Force Random Stress Test","Compare fast Java solution against brute force across 200 random small inputs.","jdsa_guide",0.9],
          ["sql",["sql_kafka"],"Kafka Ch.8: Tumbling/Hopping & Watermarks","Trace event-time vs processing-time windows, late arrivals & RocksDB state stores.","kafka_guide",1.1],
          ["backend",["be_hld_dist"],"Dist Sys Ch.3–4: Linearizability & Causal","Compare strict linearizability, sequential & causal broadcast with FIFO/FIFO-causal.","dist_guide",1.5]
        ],
        [
          ["dsa",["dsa_trees","dsa_graphs"],"Hybrid BFS + Bitmask State Tracking","Solve 1 multi-state BFS problem (key-bitmask or k-eliminations) cleanly in Java.","jdsa_prac",1],
          ["sql",["sql_kafka"],"Stateful Stream-Table & Window Joins","Design enriched clickstream + sliding anomaly join safely with grace periods.","kafka_guide",1],
          ["backend",["be_hld_dist"],"Dist Sys Ch.5: Paxos Safety (2a Rule) & Raft","Observe why skipping Paxos 2a breaks safety; trace Raft log repair & Figure 8 rule.","dist_guide",1.6]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Full Java Error-Log Audit (Weeks 1–18 Bugs)","Audit past WA/TLE causes (overflow, ==, off-by-one); solve 2 weak spots.","jdsa_rev",1],
          ["sql",["sql_jdbc_tx"],"Transactions & Concurrency Interview Check","Cross-verify InnoDB MVCC isolation vs Raft replicated state machine.","sql_rev",0.8],
          ["backend",["be_hld_dist"],"Dist Sys Practice Book Ch.1–5 Exercises","Solve Lamport/Vector causality, linearizability checker & Paxos/Raft drills in dist_prac.","dist_prac",1.5]
        ],
        [
          ["dsa",["dsa_linear","dsa_bsearch"],"Timed Workbook Coding Check","Solve 1 Workbook coding round cleanly within 30 min.","mock_work",0.9],
          ["sql",["sql_kafka"],"Stream Join Late-Event Trade-Off Drill","Compare suppress-until-window-close vs early-emit + retractions.","kafka_prac",0.9],
          ["backend",["be_hld_dist"],"Raft Election & Network Partition Simulation","Walk split-vote prevention, term fencing & stale leader read prevention.","dist_prac",1.3]
        ],
        [
          ["dsa",["dsa_arrays","dsa_dp_adv"],"Week 19 Redo Re-Solve","Re-solve Week 19 OA problems faster & cleaner than first pass.","jdsa_prac",0.9],
          ["sql",["sql_kafka"],"Schema Registry Compatibility Matrix Check","Verify Avro default-field requirement for FULL compatibility.","kafka_guide",0.8],
          ["backend",["be_hld_dist"],"Vector Clocks vs Spanner TrueTime Summary","Compare logical partial ordering vs physical bounded-uncertainty clocks.","dist_guide",1.1]
        ],
        [
          ["dsa",["dsa_toolkit"],"10^8 Ops Budget & BufferedReader Check","Verify fast I/O, StringBuilder vs + & primitive int[] vs Integer[] RAM.","jdsa_rev",0.8],
          ["sql",["sql_jdbc_tx"],"Lock & Consensus Mental Bridge Review","Map distributed fencing tokens -> single-node DB row versioning.","dbms_guide",0.7],
          ["backend",["be_hld_dist"],"Preview CRDTs, Gossip & Split-Brain (W20)","Read Dist Sys Ch.6 intro ahead of next week's completion.","dist_guide",0.9]
        ]
      ]
    },
    {
      id: 20,
      month: 5,
      title: "Loop C Coding/Broker LLD, Kafka Ops & Dist Sys Pt 2",
      focus: ["Maint: Loop C Hard Coding","Kafka Ch.9–10 + Complete Prac","Dist Sys Ch.6–10 (CRDTs/SWIM/Split-Brain)"],
      practiceTag: "Java Loop C • Kafka Ch.9–10 • Dist Sys Ch.6–10",
      targets: [
        {"id":"jw20_d","track":"dsa","text":"Pass Mock Loop C (SDE-2 Java Coding with TreeSet/BFS + Concurrent Broker LLD) + complexity defences."},
        {"id":"jw20_s","track":"sql","text":"Finish Kafka Ch.9–10 (Operating Kafka, Backups, Patterns) & complete all 20 kafka_prac exercises."},
        {"id":"jw20_b","track":"backend","text":"Finish Distributed Systems Ch.6–10 (CRDTs, Gossip/SWIM, Merkle Anti-Entropy, Leases, Byzantine) & dist_prac."}
      ],
      days: [
        [
          ["dsa",["dsa_graphs","dsa_dp_adv"],"Mock Loop C (SDE-2): Java Coding","Sit Loop C harder coding problems (TreeSet ordered ops + route BFS) in 45m.","mock_guide",1.3],
          ["sql",["sql_kafka"],"Kafka Ch.9: Operating Kafka & Multi-DC Repl.","Study ISR monitoring, under-replicated alerts, MirrorMaker 2 & tiered storage.","kafka_guide",1.1],
          ["backend",["be_hld_dist"],"Dist Sys Ch.6–7: CRDTs, Gossip & SWIM","Implement PN-Counter, OR-Set, MV-Register, SWIM failure detector & Merkle trees.","dist_guide",1.5]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Loop C TreeSet vs Heap Defence","Compare ceiling/floor TreeSet queries vs lazy PriorityQueue vs Fenwick.","mock_guide",0.9],
          ["sql",["sql_kafka"],"Kafka Ch.10 Q-Bank & Full Practice Completion","Finish remaining kafka_prac exercises & review Ch.10 interview Q-bank.","kafka_prac",1.1],
          ["backend",["be_hld_dist"],"Dist Sys Ch.8–9: Leases, Split-Brain & Cases","Solve fencing leases, GC pause stale-writes, OM(1) Byzantine & case studies.","dist_guide",1.5]
        ],
        [
          ["dsa",["dsa_arrays","dsa_graphs"],"First-Run Clean Compile Java Kata","Pick 2 complex problems and reach 100% pass on first compile/run.","jdsa_guide",1],
          ["sql",["sql_kafka"],"End-to-End Kafka + MySQL Outbox Case","Walk through CDC Debezium -> Kafka -> Consumer -> Idempotent MySQL sink.","kafka_prac",0.9],
          ["backend",["be_hld_dist"],"Dist Sys Practice Book Ch.6–10 & Bank","Finish remaining dist_prac CRDT/SWIM/lease exercises + review Ch.10 cheat sheet.","dist_prac",1.5]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Workbook Coding Round (Dynamic Programming)","Complete 1 timed Workbook DP round and grade communication & test cases.","mock_work",1],
          ["sql",["sql_windows_perf"],"Time-Series Delta Encoding Recap (Gorilla)","Review Loop C metrics platform delta-of-delta timestamps & XOR'd floats.","mock_guide",0.8],
          ["backend",["be_concurrency","be_lld"],"Mock Loop C Concurrent Broker LLD + Metrics HLD","Sit Loop C Broker machine-coding + Metrics platform HLD & grade against rubrics.","mock_guide",1.5]
        ],
        [
          ["dsa",["dsa_bsearch","dsa_graphs"],"Trade-Off Verbalisation Practice","Explain time/space/GC trade-offs in <90s for 4 classic Java patterns.","jdsa_rev",0.8],
          ["sql",["sql_kafka"],"Kafka vs SQS/RabbitMQ Architecture Comparison","Contrast log-retention replay consumer groups vs destructive broker queues.","kafka_guide",0.8],
          ["backend",["be_hld_dist"],"CAP / PACELC & Split-Brain Audit","Articulate PACELC accurately across Dynamo, Spanner, Postgres & Cassandra.","dist_guide",1.2]
        ],
        [
          ["dsa",["dsa_dp_adv","dsa_graphs"],"Month 5 Redo Queue Zero-Out","Clear every Month 5 ~ flag so Month 6 enters with 0 overdue items.","jdsa_prac",1],
          ["sql",["sql_kafka","sql_jdbc_tx"],"Month 5 Data/Streaming Sign-Off","Confirm DBMS Theory & Kafka Complete + Prac books complete.","kafka_prac",0.8],
          ["backend",["be_hld_dist"],"Month 5 Distributed Systems Sign-Off","Verify all HLD & Distributed Systems practice exercises checked.","dist_prac",1.1]
        ],
        [
          ["dsa",["dsa_arrays","dsa_dp_adv"],"Month 5 Checkpoint Mock (2 Unseen Med/Hard)","Complete 2 timed unseen Java problems with full edge harness.","mock_work",1.2],
          ["sql",["sql_windows_perf"],"SQL Quick Query Warm-Up (20m)","Keep window + CTE syntax razor sharp ahead of Month 6.","sql_prac",0.7],
          ["backend",["be_hld_dist"],"Preview Senior Engineer Handbook Roadmap","Skim Senior Handbook Ch.1–2 ahead of Week 21.","senior_guide",0.8]
        ]
      ]
    },
    {
      id: 21,
      month: 6,
      title: "Top-20 Java Pattern Sprint, SQL Rev & Senior Habits Pt 1",
      focus: ["Top 20 High-Frequency Java Patterns","MySQL Quick Rev & Classic Queries","Mock Workbook LLD/HLD + Senior Ch.1–5"],
      practiceTag: "Top-20 Java • MySQL Rev • Senior Ch.1–5",
      targets: [
        {"id":"jw21_d","track":"dsa","text":"Sprint top 20 high-frequency Java coding patterns from memory with sub-25m accuracy."},
        {"id":"jw21_s","track":"sql","text":"Review 04_MySQL_Quick_Revision.pdf + re-solve 8 classic interview queries & JDBC traps."},
        {"id":"jw21_b","track":"backend","text":"Complete Workbook LLD/HLD rounds & Senior Engineer Handbook Ch.1–5 (Scope, Reviews, Testing)."}
      ],
      days: [
        [
          ["dsa",["dsa_arrays","dsa_bsearch"],"Top-20 Java Sprint Batch 1 (Patterns 1–4)","Re-code Subarray k, Sliding Window, Kadane & first-true BS fast.","jdsa_rev",1],
          ["sql",["sql_core","sql_joins"],"MySQL Quick Revision Pass 1 (Core -> Joins)","Drill DDL/DML/NULL/Agg/Join rules + 4 classic queries.","sql_rev",0.9],
          ["backend",["be_hld_dist"],"Senior Ch.1–3: Scope, Tech Excel & Code Review","Study high-leverage engineering, design-doc clarity & constructive PR reviews.","senior_guide",1.4]
        ],
        [
          ["dsa",["dsa_linear","dsa_trees"],"Top-20 Java Sprint Batch 2 (Patterns 5–8)","Re-code Reverse LL, Mono ArrayDeque, Bottom-up LCA & BST Validate.","jdsa_guide",1],
          ["sql",["sql_windows_perf"],"MySQL Classic Queries Re-Drill (4 Windows)","Solve Top-N ties, running totals, MoM deltas & streaks from blank.","sql_prac",0.9],
          ["backend",["be_hld_dist"],"Senior Ch.4–5: Arch Decisions, Testing & RFDs","Practise irreversible vs reversible two-way door decisions & ADR writing.","senior_guide",1.4]
        ],
        [
          ["dsa",["dsa_trees","dsa_graphs"],"Top-20 Java Sprint Batch 3 (Patterns 9–12)","Re-code Backtracking, Two-Heap Median, 8-dir BFS & Kahn Topo Sort.","jdsa_prac",1],
          ["sql",["sql_windows_perf","sql_jdbc_tx"],"MySQL Quick Rev Pass 2 (Indexes & Locks)","Review B-Tree composite prefixes, EXPLAIN types & InnoDB isolation guarantees.","sql_rev",0.9],
          ["backend",["be_lld"],"Mock Workbook Part 2 Timed LLD Round #1","Sit 45-min timed Java Machine-Coding round from Workbook & grade vs solution.","mock_work",1.4]
        ],
        [
          ["dsa",["dsa_graphs","dsa_dp_adv"],"Top-20 Java Sprint Batch 4 (Patterns 13–16)","Re-code Dijkstra, DSU, Coin Change & Edit Distance cleanly.","jdsa_guide",1.1],
          ["sql",["sql_joins","sql_windows_perf"],"SQL Classic Mock Pair (CTE + Self-Join)","Solve 2 tricky SQL puzzles without hints in 25m.","sql_prac",0.8],
          ["backend",["be_hld_dist"],"Mock Workbook Part 3 Timed HLD Round #1","Sit 45-min timed HLD round from Workbook focusing on bottlenecks & failure modes.","mock_work",1.4]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Top-20 Java Sprint Batch 5 (Patterns 17–20)","Re-code Stock Cooldown, Greedy Intervals, Binary Trie XOR & Fenwick Tree.","jdsa_prac",1.1],
          ["sql",["sql_model","sql_jdbc_tx"],"Normalisation, JDBC & Deadlock Rapid Fire","Answer 6 schema/JDBC pool/locking oral drill questions.","jdbc_prac",0.8],
          ["backend",["be_hld_dist"],"Senior Handbook Workbook Pt 1 (Exercises 1–18)","Complete Ch.1–5 judgement, design-review & estimation exercises in senior_prac.","senior_prac",1.5]
        ],
        [
          ["dsa",["dsa_arrays","dsa_dp_adv"],"Weakest 2 Java Patterns Deep Drill","Inspect stopwatch logs across 20 patterns; redo slowest 2 blind.","jdsa_rev",1],
          ["sql",["sql_windows_perf"],"SQL Speed Run: 3 Window Queries in 20m","Execute 3 analytics/classic window queries cleanly under strict cap.","sql_prac",0.8],
          ["backend",["be_lld","be_hld_dist"],"Debrief Workbook LLD & HLD Rounds #1","Log design omissions (metrics, failure modes, thread safety) cleanly.","mock_guide",1.2]
        ],
        [
          ["dsa",["dsa_dp_adv","dsa_graphs"],"Ch.12 Decision Table Mapping Check","Map 10 blind problem prompts -> exact Java pattern & O() in 8 minutes.","jdsa_guide",0.9],
          ["sql",["sql_core","sql_windows_perf"],"SQL Error-Trap Quick Sweep","Confirm zero ambiguity on NULL, GROUP BY, upsert alias & LIKE index.","sql_ref",0.7],
          ["backend",["be_hld_dist"],"Architecture Decision Record Practice (Project 3)","Write a 1-page ADR defending Redis+MySQL Smart-Meter trade-offs.","senior_guide",1]
        ]
      ]
    },
    {
      id: 22,
      month: 6,
      title: "Timed Mock Workbook Loops & Senior Reliability Models",
      focus: ["Workbook Timed Java Coding Mocks","Timed SQL + Schema Opt Mock","Senior Ch.6–11 + Workbook LLD/HLD Mocks"],
      practiceTag: "Workbook Coding/LLD/HLD • Senior Ch.6–11",
      targets: [
        {"id":"jw22_d","track":"dsa","text":"Complete 3 full timed Java coding mock rounds from 03_Mock_Interview_Loops_Workbook.pdf."},
        {"id":"jw22_s","track":"sql","text":"Pass a timed combined SQL Window + Schema Normalisation + EXPLAIN Indexing interview round."},
        {"id":"jw22_b","track":"backend","text":"Complete Senior Handbook Ch.6–11 (SLOs, Error Budgets, Amdahl, Tech Debt) & remaining senior_prac/mock_work."}
      ],
      days: [
        [
          ["dsa",["dsa_arrays","dsa_bsearch"],"Mock Workbook Timed Java Round #1","Simulate 45-min live coding: bounds, brute force -> optimal, dry run.","mock_work",1.1],
          ["sql",["sql_windows_perf"],"Timed SQL Window + Self-Join Round (35m)","Solve 3 hard interview SQL queries cleanly without syntax slips.","sql_prac",0.9],
          ["backend",["be_hld_dist"],"Senior Ch.6–7: Reliability, SLOs & Amdahl","Compute compounding 99.9% dependencies, error budgets & Amdahl speedup ceiling.","senior_guide",1.5]
        ],
        [
          ["dsa",["dsa_trees","dsa_graphs"],"Mock Workbook Timed Java Round #2","Sit 45-min Tree/Graph coding mock justifying O(V+E)/O(h).","mock_work",1.1],
          ["sql",["sql_windows_perf","sql_joins"],"Live Query Scale-Out Follow-Up Drill","Explain aloud how to shard, partition & index slow tables from 10K to 1B rows.","dbms_guide",0.9],
          ["backend",["be_hld_dist"],"Senior Ch.8–11: Tech Debt, Mentoring & Promo","Study 15% tech-debt paydown compounding, crisp RFC writing & influence.","senior_guide",1.5]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Mock Workbook Timed Java Round #3","Sit 45-min DP/Greedy coding mock from Workbook tracking zero compile errors.","mock_work",1.1],
          ["sql",["sql_jdbc_tx"],"Live Isolation & Locking Defence Round","Explain repeatable-read snapshot vs gap locks & optimistic retries aloud.","jdbc_guide",0.8],
          ["backend",["be_lld","be_hld_dist"],"Senior Handbook Workbook Pt 2 (Exercises 19–36)","Solve SLO/error-budget/tech-debt numerical & reflection exercises in senior_prac.","senior_prac",1.5]
        ],
        [
          ["dsa",["dsa_graphs","dsa_dp_adv"],"Mock Loops Debrief (Ch.5 Framework)","Apply Mock Loops Ch.5 debrief template to Coding Rounds #1–3.","mock_guide",1],
          ["sql",["sql_kafka"],"Kafka + Outbox Streaming Defence Drill","Walk through guaranteed delivery without 2PC in a backend interview.","kafka_guide",0.8],
          ["backend",["be_lld","be_hld_dist"],"Mock Workbook LLD #2 + HLD #2 Timed Pair","Sit additional Workbook Machine-Coding + System Design rounds back-to-back.","mock_work",1.6]
        ],
        [
          ["dsa",["dsa_linear","dsa_dp_adv"],"Speed Re-Write of Toughest Mock Round","Rewrite hardest problem from Mock Rounds #1–3 cold in 20 minutes.","mock_work",0.9],
          ["sql",["sql_windows_perf"],"SQL Query Plan Oral Explanation Practice","Explain B-Tree range stops and filesort elimination clearly in <3m.","sql_guide",0.7],
          ["backend",["be_hld_dist"],"Compounding Availability & Error-Budget Kata","Calculate composite SLA of 4 serial + 1 fallback service blind.","senior_guide",1.1]
        ],
        [
          ["dsa",["dsa_arrays","dsa_dp_adv"],"Week 22 Java Redo Queue Review","Re-solve any imperfect Workbook round code cleanly.","jdsa_prac",0.9],
          ["sql",["sql_windows_perf"],"Mixed SQL Fluency Verification","Complete 3 rapid schema + window queries cleanly.","sql_rev",0.8],
          ["backend",["be_lld","be_hld_dist"],"Full Workbook LLD/HLD Key Comparison","Inspect executed model answers & trade-offs across completed Workbook rounds.","mock_work",1.3]
        ],
        [
          ["dsa",["dsa_toolkit","dsa_dp_adv"],"Dry-Run Tracing Habit Drill","Trace 2 medium Java solutions on paper without compiling first.","jdsa_guide",0.8],
          ["sql",["sql_joins","sql_windows_perf"],"Zero-Hint Funnel + Window Verification","Write 1 combined cohort-retention query bug-free on first run.","sql_prac",0.8],
          ["backend",["be_hld_dist"],"Senior Handbook Complete Milestone Check","Verify all 36 Senior Handbook Workbook scenarios done.","senior_prac",1]
        ]
      ]
    },
    {
      id: 23,
      month: 6,
      title: "Pattern Speed Check, DB Trade-offs & Full Loop Dress Rehearsal",
      focus: ["Pattern Speed Check (jdsa_rev)","Schema Design & DB Trade-offs Mock","Full Mock Loops + Resume/STAR Bank"],
      practiceTag: "jdsa_rev Check • DB Mock • Resume & STAR Bank",
      targets: [
        {"id":"jw23_d","track":"dsa","text":"Pass pattern-recognition speed drill (<90s ID) and complete final 14p Java Quick Rev edge sweep."},
        {"id":"jw23_s","track":"sql","text":"Pass combined Schema Normalisation + EXPLAIN Index + Kafka Event-Log design mock."},
        {"id":"jw23_b","track":"backend","text":"Build complete HR/STAR Story Bank, Resume project bullets & sit Workbook Part 4 Behavioural rounds."}
      ],
      days: [
        [
          ["dsa",["dsa_toolkit","dsa_arrays"],"Java Pattern Flash Round (15 Prompts)","Identify optimal pattern + exact Java collections for 15 prompts in 20m.","jdsa_rev",0.9],
          ["sql",["sql_model","sql_windows_perf"],"Schema Design Mock: Smart-Grid Billing","Design normalised tables, PK/FK/CHECK & 4 composite covering indexes.","sql_guide",1],
          ["backend",["be_hld_dist"],"HR Guide: 'Tell Me About Yourself' + Resume","Tailor 90-second pitch, Java/Spring/IoT project bullets & placeholder cleanup.","hr_guide",1.4]
        ],
        [
          ["dsa",["dsa_bsearch","dsa_linear"],"Sub-20m Easy/Medium Java Kata","Code 2 clean solutions (long BS + ArrayDeque) back-to-back under 40m.","jdsa_guide",0.9],
          ["sql",["sql_windows_perf"],"EXPLAIN Optimisation Mock (5 Slow Queries)","Rewrite 5 slow SQL queries + propose minimal covering indexes.","sql_prac",1],
          ["backend",["be_hld_dist"],"HR Guide: Build 8-Story STAR Bank","Draft concrete STAR stories (ownership, conflict, outage, latency fix, trade-off).","hr_guide",1.4]
        ],
        [
          ["dsa",["dsa_trees","dsa_graphs"],"Trees & Graphs Edge-Case Checklist Sweep","Code null/cyclic/disconnected guards cleanly on 2 compact tasks.","jdsa_prac",0.9],
          ["sql",["sql_jdbc_tx"],"ACID, Locking & Disaster Recovery Drill","Walk through isolation levels, PITR binlog restore & HikariCP timeouts.","sql_rev",0.8],
          ["backend",["be_hld_dist"],"HR Guide: Presenting Projects & Research","Structure crisp demos & escalation/cost-routing talk points without jargon.","hr_guide",1.4]
        ],
        [
          ["dsa",["dsa_dp_adv"],"DP State-Compression Oral + Code Drill","Write 2 DP problems coding memoisation and rolled 1D bottom-up table.","jdsa_guide",1],
          ["sql",["sql_kafka","sql_jdbc_tx"],"DB & Kafka Trade-Offs Q-Bank Rapid Review","Cover B-Tree vs LSM, 2PC vs Outbox/Saga & Kafka EOS cost.","dbms_guide",0.8],
          ["backend",["be_hld_dist"],"Mock Workbook Part 4 Behavioural Rounds","Sit 4 timed behavioural/HR rounds from mock_work answering with metrics.","mock_work",1.4]
        ],
        [
          ["dsa",["dsa_toolkit","dsa_dp_adv"],"Mock Loop Final Java Checklist Check","Verify Mock Loops Ch.6 interview checklists (clarify, test, complexity).","mock_guide",0.8],
          ["sql",["sql_windows_perf"],"MySQL 8 Quick Revision Final Pass","Full 25-min crisp scan of 04_MySQL_Quick_Revision.pdf.","sql_rev",0.7],
          ["backend",["be_spring","be_adv_backend"],"Backend Deep-Dive Defence Simulation","Answer 10 tough Java Concurrency, Spring, Security & Redis follow-ups.","abe_guide",1.3]
        ],
        [
          ["dsa",["dsa_dp_adv","dsa_graphs"],"Clear Any Remaining Week 23 ~ Flags","Ensure every tricky Java pattern compiles & executes cleanly first try.","jdsa_prac",0.9],
          ["sql",["sql_model","sql_kafka"],"End-to-End Persistence Stack Check","Trace Client -> Spring -> HikariCP -> MySQL/Redis -> Outbox -> Kafka.","jdbc_guide",0.8],
          ["backend",["be_hld_dist"],"Resume QA & Mock Offer Negotiation Review","Run final ATS/clarity checklist from HR Guide Ch.6–8.","hr_guide",1.2]
        ],
        [
          ["dsa",["dsa_arrays","dsa_dp_adv"],"Confidence Check: 1 Light Java Medium","Solve 1 crisp Medium cleanly in 18m; scan java_rev traps.","jdsa_rev",0.7],
          ["sql",["sql_windows_perf"],"1 Clean Window Query Warmup","Keep window + CTE syntax effortless in 15m.","sql_prac",0.6],
          ["backend",["be_hld_dist"],"Prep Week 24 Capstone Full Loop Schedule","Stage timer & quiet setup for final full 4-round mock loop simulation.","mock_guide",0.8]
        ]
      ]
    },
    {
      id: 24,
      month: 6,
      title: "Final Java SDE Capstone Mock Loop Week",
      focus: ["Final Java Mock Coding + Readiness","Final SQL/JDBC/Kafka Q-Bank","Full 4-Round Loop + Portfolio & HR Close"],
      practiceTag: "Full 4-Round Capstone • Projects 1–3 • HR Sign-Off",
      targets: [
        {"id":"jw24_d","track":"dsa","text":"Complete final full-stack Java coding mock simulation with zero bugs and crisp verbal narration."},
        {"id":"jw24_s","track":"sql","text":"Pass final combined MySQL + JDBC + DBMS + Kafka technical readiness check cleanly."},
        {"id":"jw24_b","track":"backend","text":"Sit full 4-round mock loop (Coding + LLD + HLD + HR), finalise Projects 1–3 & STAR bank."}
      ],
      days: [
        [
          ["dsa",["dsa_arrays","dsa_bsearch"],"Final Java Warm-Up Timed Pair","Clean 30-min Java coding block testing speed & edge-case habit.","jdsa_rev",0.8],
          ["sql",["sql_windows_perf","sql_joins"],"Final SQL Warm-Up Pair","Clean 25-min SQL block confirming zero syntax or NULL slips.","sql_rev",0.7],
          ["backend",["be_spring","be_security"],"Backend Core Lightning Review","Scan Spring Boot + Security Engineering Q-banks cleanly.","sec_guide",1.2]
        ],
        [
          ["dsa",["dsa_graphs","dsa_dp_adv"],"Capstone Mock Round A (Java Coding)","Sit timed 2-problem Graph + DP assessment simulating real OA/interview.","mock_work",1.1],
          ["sql",["sql_windows_perf","sql_jdbc_tx"],"Capstone Mock Round B (SQL + Tuning)","Sit timed 30-min SQL query + EXPLAIN index + transaction isolation round.","sql_prac",0.9],
          ["backend",["be_lld"],"Capstone Mock Round C (Java LLD 45m)","Complete timed machine-coding LLD challenge cleanly with unit checks.","mock_work",1.3]
        ],
        [
          ["dsa",["dsa_trees","dsa_dp_adv"],"Capstone Round A Code Quality Debrief","Audit Round A readability, helper methods & edge coverage.","mock_guide",0.8],
          ["sql",["sql_jdbc_tx","sql_model"],"SQL/JDBC Short-Answer Flash Check","Answer 10 rapid oral Qs on MVCC, B+Tree, 3NF/BCNF & HikariCP.","sql_guide",0.7],
          ["backend",["be_hld_dist"],"Capstone Mock Round D (45m HLD Design)","Complete full HLD walkthrough (Estimates -> API -> Data -> Scaling -> Failures).","mock_work",1.4]
        ],
        [
          ["dsa",["dsa_toolkit"],"Final 14-Page Java Traps Sanity Review","Scan jdsa_rev checklists (int overflow, y-x sort, Integer ==, HashMap bins).","jdsa_rev",0.6],
          ["sql",["sql_core","sql_windows_perf"],"Final SQL Cheat Sheet Read","Verify 3-valued NULL, window frames & CTE habits before final loop.","sql_rev",0.6],
          ["backend",["be_spring","be_adv_backend"],"Polish GitHub Projects 1–3 & Architecture Docs","Verify Spring Smart-Meter + Java LLD + Prod Upgrade READMEs & CI badges.","abe_guide",1.4]
        ],
        [
          ["dsa",["dsa_arrays","dsa_graphs","dsa_dp_adv"],"Full 4-Round Mock Interview Loop (Coding)","Sit final end-to-end interview loop coding block under strict rubric scoring.","mock_guide",1.5],
          ["sql",["sql_windows_perf","sql_kafka"],"Full Mock Loop (Persistence & Streaming)","Defend SQL query design, DB schema & Kafka event pipeline choices.","kafka_guide",0.9],
          ["backend",["be_hld_dist"],"Full Mock Loop (HLD + Behavioural & STAR)","Present end-to-end architecture + STAR ownership/incident stories.","mock_guide",1.5]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Clear Final Java Tracker Redo Items","Bring Pending & Redo count to zero cleanly across Java DSA.","jdsa_prac",0.8],
          ["sql",["sql_windows_perf"],"Clear Final SQL/DBMS Checklist Items","Confirm every weekly SQL/JDBC/DBMS/Kafka target is checked off.","sql_rev",0.7],
          ["backend",["be_hld_dist"],"Final HR, Resume & Offer Readiness Check","Verify HR Guide pre-interview & post-interview checklists.","hr_guide",1.4]
        ],
        [
          ["dsa",["dsa_toolkit","dsa_arrays","dsa_bsearch","dsa_linear","dsa_trees","dsa_graphs","dsa_dp_adv"],"6-Month Java DSA Sign-Off & Ongoing Plan","Archive error log; set lightweight 3-problem/week Java maintenance during placements.","jdsa_rev",0.8],
          ["sql",["sql_model","sql_core","sql_joins","sql_windows_perf","sql_jdbc_tx","sql_kafka"],"6-Month SQL/JDBC/Kafka Sign-Off","Keep 04_MySQL_Quick_Revision.pdf + JDBC reference handy before interviews.","sql_rev",0.7],
          ["backend",["be_cs_core","be_concurrency","be_security","be_spring","be_testing_devops","be_adv_backend","be_lld","be_hld_dist"],"Final 24-Week Java Backend Graduation","All 21 Skills, 49 Books, 3 Backend Projects & Mock Loop Rubrics Complete!","hr_guide",1.2]
        ]
      ]
    }
  ]
  });
})();
