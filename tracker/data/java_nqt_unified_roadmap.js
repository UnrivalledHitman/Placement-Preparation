(function () {
  "use strict";
  window.TrackerShared.registerTracker({
  "id": "java_nqt",
  "storageKey": "java_nqt_unified_tracker_v1",
  "taskIdPrefix": "jn",
  "defaultStartIso": "2026-11-30",
  "startDateUtc": [
    2026,
    10,
    30
  ],
  "resourcePrefix": "../",
  "backupFilePrefix": "java_nqt_unified_backup",
  "hub": {
    "href": "java_nqt_unified_tracker.html",
    "badge": "Java + NQT Unified",
    "headerPill": "Unified 24W Java + NQT",
    "slot": 2,
    "title": "Unified 24-Week TCS NQT & Java Backend SDE-1 Roadmap",
    "timeline": "30 Nov 2026 – 16 May 2027 • 24 Weeks / 168 Days • 29.5h/wk Sustainable",
    "scope": "Burnout-proof 29.5h/wk campus placement & 8–15 LPA Java Backend SDE-1 plan: Zero-AI Java DSA, TCS NQT (Diagnostic, W2 Reasoning, Dedicated DI, 7 Full Mocks), MySQL/JDBC/Core CS, Mini-Project 0, Security First, 4-Wk Spring Boot + Flagship Project 1, Redis/Locking Project 2 & 3 Cold 60m Java LLDs."
  },
  "header": {
    "pageTitle": "Unified 24-Week TCS NQT & Java Backend SDE-1 Tracker (Zero-AI)",
    "title": "Unified TCS NQT & Java Backend SDE-1 Tracker (24 Weeks)",
    "subtitle": "29.5h/wk Burnout-Proof Cadence (Mon–Fri 5h max 3 blocks, Sat 4.5h, Sunday 0h Full Rest) • Starts Monday 30 Nov 2026 • Zero-AI Friday Proof Gates",
    "timelineBadge": "30 Nov 2026 – 16 May 2027 (24 Weeks / 168 Days)"
  },
  "tracks": [
    {
      "key": "dsa",
      "slot": 1,
      "label": "Java DSA & NQT Code",
      "headerBadge": "Java DSA + NQT Code (9.0h/wk)",
      "kpiTitle": "Java DSA & NQT",
      "kpiSub": "Zero-AI Ch.1–9 + NQT I/O + 45m Loops",
      "skillGroupTitle": "Zero-AI Java DSA & Timed Coding Skills (4)",
      "svgLabel": "Java DSA (4 Skills)",
      "libraryHeading": "Core Java, DSA in Java & Mock Coding Loops"
    },
    {
      "key": "aptitude",
      "slot": 2,
      "label": "TCS NQT Aptitude",
      "headerBadge": "NQT Quant/Reason/Verbal (P1: 9.0h/wk)",
      "kpiTitle": "TCS NQT Aptitude",
      "kpiSub": "Diagnostic -> DI -> 7 Full Multi-Section Mocks",
      "skillGroupTitle": "TCS NQT Quant, Reasoning, DI & Verbal Skills (4)",
      "svgLabel": "NQT Aptitude (4 Skills)",
      "libraryHeading": "TCS NQT Quantitative, Reasoning, Verbal & Mocks"
    },
    {
      "key": "sql_cs",
      "slot": 3,
      "label": "MySQL, JDBC & Core CS",
      "headerBadge": "SQL + JDBC + OS/DBMS/CN",
      "kpiTitle": "SQL, JDBC & CS",
      "kpiSub": "MySQL 1–16 + JDBC + OS/DBMS/CN + Git/Linux",
      "skillGroupTitle": "MySQL CLI, JDBC Persistence & Core CS Skills (4)",
      "svgLabel": "SQL & CS (4 Skills)",
      "libraryHeading": "MySQL, JDBC, OS, DBMS, CN, Linux & Git"
    },
    {
      "key": "backend",
      "slot": 4,
      "label": "Spring Boot & Projects",
      "headerBadge": "Spring + Security + LLD + 2 Projects",
      "kpiTitle": "Java Backend & LLD",
      "kpiSub": "Mini-Proj 0 -> Proj 1 (4w) -> Proj 2 -> 3 Cold LLDs",
      "skillGroupTitle": "Spring Boot, Security, Redis, Testing & LLD Skills (4)",
      "svgLabel": "Backend & LLD (4 Skills)",
      "libraryHeading": "Zero-AI Gates, Concurrency, Security, Spring, Testing, Redis & LLD/HLD"
    }
  ],
  "phases": [
    {
      "id": 1,
      "minWeek": 1,
      "maxWeek": 12,
      "chipColor": "var(--primary)",
      "dailyLabel": "Phase 1: TCS NQT Mastery, Core Java/DSA, MySQL/JDBC, CS & Mini-Project 0",
      "heading": "Phase 1: TCS NQT (Digital/Prime) Dominance + Java DSA Ch.1–9 + MySQL/JDBC + Core CS + Mini-Project 0 (Weeks 1–12)",
      "subtitle": "30 Nov 2026 – 21 Feb 2027 • 29.5h/wk Sustainable Study (Mon–Fri 5h max 3 blocks, Sat 4.5h, Sunday 0h Rest) • Day 1 Diagnostic • 7 Full Multi-Section NQT Mocks"
    },
    {
      "id": 2,
      "minWeek": 13,
      "maxWeek": 24,
      "chipColor": "var(--chart-4)",
      "dailyLabel": "Phase 2: Security -> Spring Boot (4w) -> Redis/Locking -> 3 Cold LLDs & SDE-1 Loops",
      "heading": "Phase 2: Production Java Backend Engineering, 2 Flagship Projects, 3 Cold 60m LLDs & SDE-1 Mock Loops (Weeks 13–24)",
      "subtitle": "22 Feb – 16 May 2027 • 29.5h/wk (14.5h/wk Deep Backend, 9h DSA, 6h SQL/CS, 0h Aptitude, Sunday 0h Rest) • Friday Proof Gates J1.1–J6.2"
    }
  ],
  "ui": {
    "searchPlaceholder": "Search Diagnostic, Mock #1, DI, JDBC, J1.1, Testcontainers, Parking Lot, Splitwise...",
    "monthlyTabLabel": "Monthly Targets & Projects (6m)",
    "monthlyTargetsHeading": "Monthly Mastery Gates, NQT Mocks & Java Projects",
    "skillsKpiSub": "16 unified competencies",
    "skillsMatrixTitle": "Skill-Wise Acquisition Matrix (16 TCS NQT & Java SDE-1 Skills)",
    "skillsChartAriaLabel": "Unified Java + NQT Competency Summary",
    "skillsChartCombinedLabel": "Combined Java + NQT Roadmap (16 Skills)",
    "noteLabel": "Mock Score / Bug / Architecture Note:",
    "notePlaceholder": "Log NQT mock score, Java overflow/bug diagnostic, or Spring/LLD trade-off for Day {dayNum}...",
    "notesPanelTitle": "Mock Scores, Zero-AI Bug Diagnostics & Design Notes",
    "notesPanelDesc": "Every NQT mock score, Java bug diagnostic & backend architecture takeaway logged on Day cards aggregates here.",
    "notesEmptyText": "No notes logged yet. Record your W1D1 Diagnostic score, NQT mock scores, or Java/Spring notes on any Day card.",
    "redoDesc": "Any problem, mock question, or Proof Gate flagged ~ Redo lands here for a 7-day blank-IDE re-solve.",
    "redoEmptyText": "Redo queue empty. Flag any tricky DSA, NQT, SQL, Spring, or LLD task with ~ Redo to re-solve cold in 7 days.",
    "libraryTitle": "Unified TCS NQT & Java Backend Study Library",
    "exportTitle": "Export Unified Java + NQT Progress JSON",
    "exportDesc": "Copy or download this JSON backup to restore or transfer your 24-week Java + NQT tracker progress.",
    "importTitle": "Import Unified Java + NQT Progress JSON",
    "resetToast": "Unified Java + NQT tracker progress reset cleanly.",
    "weekChipMinWidth": "76px",
    "dayBadge": {
      "maxWeek": 24,
      "dayInWeek": 7,
      "label": "Sunday 100% Study OFF",
      "pillClass": "pill-3"
    }
  },
  "resources": {
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
      "title": "Java TCS CPA / NQT Practice Sets",
      "path": "03_Programming/01_Java/04_Java_TCS_CPA_Practice_Sets.pdf",
      "track": "dsa"
    },
    "java_rev": {
      "title": "Java Quick Revision",
      "path": "03_Programming/01_Java/05_Java_Quick_Revision_TCS_CPA.pdf",
      "track": "dsa"
    },
    "jdsa_guide": {
      "title": "DSA in Java: Complete Guide (Ch.1–12)",
      "path": "03_Programming/04_DSA_in_Java/01_DSA_in_Java_Complete_Guide.pdf",
      "track": "dsa"
    },
    "jdsa_prac": {
      "title": "DSA in Java: Practice Book (49 Exercises)",
      "path": "03_Programming/04_DSA_in_Java/02_DSA_in_Java_Practice_Book.pdf",
      "track": "dsa"
    },
    "jdsa_rev": {
      "title": "DSA in Java: Quick Revision (14p)",
      "path": "03_Programming/04_DSA_in_Java/03_DSA_in_Java_Quick_Revision.pdf",
      "track": "dsa"
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
    "q_01": {
      "title": "Quant Ch.01: Simplification",
      "path": "01_Quantitative_Aptitude/01_Chapter_Wise/01_Simplification.pdf",
      "track": "aptitude"
    },
    "q_02": {
      "title": "Quant Ch.02: Percentage",
      "path": "01_Quantitative_Aptitude/01_Chapter_Wise/02_Percentage.pdf",
      "track": "aptitude"
    },
    "q_03": {
      "title": "Quant Ch.03: Ratio & Proportion",
      "path": "01_Quantitative_Aptitude/01_Chapter_Wise/03_Ratio_and_Proportion.pdf",
      "track": "aptitude"
    },
    "q_04": {
      "title": "Quant Ch.04: Average",
      "path": "01_Quantitative_Aptitude/01_Chapter_Wise/04_Average.pdf",
      "track": "aptitude"
    },
    "q_05": {
      "title": "Quant Ch.05: Profit & Loss",
      "path": "01_Quantitative_Aptitude/01_Chapter_Wise/05_Profit_and_Loss.pdf",
      "track": "aptitude"
    },
    "q_06": {
      "title": "Quant Ch.06: Time & Work",
      "path": "01_Quantitative_Aptitude/01_Chapter_Wise/06_Time_and_Work.pdf",
      "track": "aptitude"
    },
    "q_07": {
      "title": "Quant Ch.07: Distance, Speed & Time",
      "path": "01_Quantitative_Aptitude/01_Chapter_Wise/07_Distance_Speed_and_Time.pdf",
      "track": "aptitude"
    },
    "q_08": {
      "title": "Quant Ch.08: Boats & Streams",
      "path": "01_Quantitative_Aptitude/01_Chapter_Wise/08_Boats_and_Streams.pdf",
      "track": "aptitude"
    },
    "q_09": {
      "title": "Quant Ch.09: Elementary Statistics",
      "path": "01_Quantitative_Aptitude/01_Chapter_Wise/09_Elementary_Statistics.pdf",
      "track": "aptitude"
    },
    "q_10": {
      "title": "Quant Ch.10: Mensuration & Geometry",
      "path": "01_Quantitative_Aptitude/01_Chapter_Wise/10_Mensuration_and_Geometry.pdf",
      "track": "aptitude"
    },
    "q_11": {
      "title": "Quant Ch.11: Data Interpretation (DI)",
      "path": "01_Quantitative_Aptitude/01_Chapter_Wise/11_Data_Interpretation.pdf",
      "track": "aptitude"
    },
    "qm_01": {
      "title": "Quant Mixed Set 01",
      "path": "01_Quantitative_Aptitude/02_Mixed_Sets/01_Mixed_Set.pdf",
      "track": "aptitude"
    },
    "qm_02": {
      "title": "Quant Mixed Set 02",
      "path": "01_Quantitative_Aptitude/02_Mixed_Sets/02_Mixed_Set.pdf",
      "track": "aptitude"
    },
    "qm_03": {
      "title": "Quant Mixed Set 03",
      "path": "01_Quantitative_Aptitude/02_Mixed_Sets/03_Mixed_Set.pdf",
      "track": "aptitude"
    },
    "qm_04": {
      "title": "Quant Mixed Set 04",
      "path": "01_Quantitative_Aptitude/02_Mixed_Sets/04_Mixed_Set.pdf",
      "track": "aptitude"
    },
    "qm_05": {
      "title": "Quant Mixed Set 05",
      "path": "01_Quantitative_Aptitude/02_Mixed_Sets/05_Mixed_Set.pdf",
      "track": "aptitude"
    },
    "qm_06": {
      "title": "Quant Mixed Set 06",
      "path": "01_Quantitative_Aptitude/02_Mixed_Sets/06_Mixed_Set.pdf",
      "track": "aptitude"
    },
    "qm_07": {
      "title": "Quant Mixed Set 07",
      "path": "01_Quantitative_Aptitude/02_Mixed_Sets/07_Mixed_Set.pdf",
      "track": "aptitude"
    },
    "qm_08": {
      "title": "Quant Mixed Set 08",
      "path": "01_Quantitative_Aptitude/02_Mixed_Sets/08_Mixed_Set.pdf",
      "track": "aptitude"
    },
    "r_guide": {
      "title": "Reasoning & Advanced Quant Guide (7 Ch.)",
      "path": "01_Quantitative_Aptitude/03_Reasoning_Advanced_Quant_and_Mocks/01_Reasoning_and_Advanced_Quant_Guide.pdf",
      "track": "aptitude"
    },
    "r_mocks": {
      "title": "TCS NQT Timed Mock Tests",
      "path": "01_Quantitative_Aptitude/03_Reasoning_Advanced_Quant_and_Mocks/02_TCS_NQT_Timed_Mock_Tests.pdf",
      "track": "aptitude"
    },
    "v_01": {
      "title": "Verbal 01: Words Completion",
      "path": "02_Verbal_Ability/01_Topic_Wise/01_Words_Completion.pdf",
      "track": "aptitude"
    },
    "v_02": {
      "title": "Verbal 02: Idioms & Phrases",
      "path": "02_Verbal_Ability/01_Topic_Wise/02_Idioms_and_Phrases.pdf",
      "track": "aptitude"
    },
    "v_03": {
      "title": "Verbal 03: Error Detection",
      "path": "02_Verbal_Ability/01_Topic_Wise/03_Error_Detection.pdf",
      "track": "aptitude"
    },
    "v_04": {
      "title": "Verbal 04: Sentence Completion",
      "path": "02_Verbal_Ability/01_Topic_Wise/04_Sentence_Completion.pdf",
      "track": "aptitude"
    },
    "v_05": {
      "title": "Verbal 05: Sentence Building",
      "path": "02_Verbal_Ability/01_Topic_Wise/05_Sentence_Building.pdf",
      "track": "aptitude"
    },
    "v_06": {
      "title": "Verbal 06: Para Jumbles",
      "path": "02_Verbal_Ability/01_Topic_Wise/06_Para_Jumbles.pdf",
      "track": "aptitude"
    },
    "v_07": {
      "title": "Verbal 07: Reading Comprehension",
      "path": "02_Verbal_Ability/01_Topic_Wise/07_Reading_Comprehension.pdf",
      "track": "aptitude"
    },
    "vm_01": {
      "title": "Verbal Mixed Set 01",
      "path": "02_Verbal_Ability/02_Mixed_Sets/01_Mixed_Set.pdf",
      "track": "aptitude"
    },
    "vm_02": {
      "title": "Verbal Mixed Set 02",
      "path": "02_Verbal_Ability/02_Mixed_Sets/02_Mixed_Set.pdf",
      "track": "aptitude"
    },
    "vm_03": {
      "title": "Verbal Mixed Set 03",
      "path": "02_Verbal_Ability/02_Mixed_Sets/03_Mixed_Set.pdf",
      "track": "aptitude"
    },
    "vm_04": {
      "title": "Verbal Mixed Set 04",
      "path": "02_Verbal_Ability/02_Mixed_Sets/04_Mixed_Set.pdf",
      "track": "aptitude"
    },
    "vm_05": {
      "title": "Verbal Mixed Set 05",
      "path": "02_Verbal_Ability/02_Mixed_Sets/05_Mixed_Set.pdf",
      "track": "aptitude"
    },
    "vm_06": {
      "title": "Verbal Mixed Set 06",
      "path": "02_Verbal_Ability/02_Mixed_Sets/06_Mixed_Set.pdf",
      "track": "aptitude"
    },
    "sql_guide": {
      "title": "MySQL: Complete Guide (Parts 1–16)",
      "path": "03_Programming/02_MySQL/01_MySQL_Complete_Guide.pdf",
      "track": "sql_cs"
    },
    "sql_ref": {
      "title": "MySQL Commands & Functions Reference",
      "path": "03_Programming/02_MySQL/02_MySQL_Commands_and_Functions_Reference.pdf",
      "track": "sql_cs"
    },
    "sql_prac": {
      "title": "MySQL Practice Questions (Chapterwise)",
      "path": "03_Programming/02_MySQL/03_MySQL_Practice_Questions_Chapterwise.pdf",
      "track": "sql_cs"
    },
    "sql_rev": {
      "title": "MySQL Quick Revision",
      "path": "03_Programming/02_MySQL/04_MySQL_Quick_Revision.pdf",
      "track": "sql_cs"
    },
    "jdbc_guide": {
      "title": "JDBC & Java Persistence Guide",
      "path": "03_Programming/03_JDBC_and_Persistence/01_JDBC_and_Persistence_Complete_Guide.pdf",
      "track": "sql_cs"
    },
    "jdbc_prac": {
      "title": "JDBC & Persistence Practice Book (28 Ex.)",
      "path": "03_Programming/03_JDBC_and_Persistence/02_JDBC_and_Persistence_Practice_Book.pdf",
      "track": "sql_cs"
    },
    "os_guide": {
      "title": "Operating Systems: Complete Guide (Interview Essentials)",
      "path": "04_CS_Fundamentals/01_Operating_Systems/01_Operating_Systems_Complete_Guide.pdf",
      "track": "sql_cs"
    },
    "dbms_guide": {
      "title": "DBMS Theory: Core Normalization, Indexing & ACID",
      "path": "04_CS_Fundamentals/05_DBMS_Theory/01_DBMS_Theory_Complete_Guide.pdf",
      "track": "sql_cs"
    },
    "cn_guide": {
      "title": "Computer Networks: TCP/HTTP/DNS/TLS Essentials",
      "path": "04_CS_Fundamentals/04_Computer_Networks/01_Computer_Networks_Complete_Guide.pdf",
      "track": "sql_cs"
    },
    "linux_guide": {
      "title": "Linux for Software Engineers (Shell & Processes)",
      "path": "04_CS_Fundamentals/02_Linux/01_Linux_for_Software_Engineers_Complete_Guide.pdf",
      "track": "sql_cs"
    },
    "git_guide": {
      "title": "Git Internals & Team Workflows",
      "path": "04_CS_Fundamentals/03_Git_Internals_and_Workflows/01_Git_Internals_and_Workflows_Complete_Guide.pdf",
      "track": "sql_cs"
    },
    "java_zeroai": {
      "title": "Spring Boot Zero-AI Projects, LLD & Proof Gates (J1.1–J6.2)",
      "path": "03_Programming/08_Backend_Spring_Boot/03_Spring_Boot_ZeroAI_Projects_and_Gates_Guide.pdf",
      "track": "backend"
    },
    "conc_guide": {
      "title": "Java Concurrency: Core Threads, Locks & Executors",
      "path": "03_Programming/06_Java_Concurrency/01_Java_Concurrency_Complete_Guide.pdf",
      "track": "backend"
    },
    "conc_prac": {
      "title": "Java Concurrency: Practice Book",
      "path": "03_Programming/06_Java_Concurrency/02_Java_Concurrency_Practice_Book.pdf",
      "track": "backend"
    },
    "sec_guide": {
      "title": "Security Engineering: Crypto, JWT & OWASP",
      "path": "03_Programming/07_Security_Engineering/01_Security_Engineering_Complete_Guide.pdf",
      "track": "backend"
    },
    "sec_prac": {
      "title": "Security Engineering: Practice Book",
      "path": "03_Programming/07_Security_Engineering/02_Security_Engineering_Practice_Book.pdf",
      "track": "backend"
    },
    "be_guide": {
      "title": "Spring Boot Backend: Beans to Production",
      "path": "03_Programming/08_Backend_Spring_Boot/01_Backend_Spring_Boot_Complete_Guide.pdf",
      "track": "backend"
    },
    "be_prac": {
      "title": "Spring Boot Backend: Practice Book (31 Ex.)",
      "path": "03_Programming/08_Backend_Spring_Boot/02_Backend_Spring_Boot_Practice_Book.pdf",
      "track": "backend"
    },
    "test_guide": {
      "title": "Software Testing: JUnit 5, Mockito & Testcontainers",
      "path": "03_Programming/09_Software_Testing/01_Software_Testing_Complete_Guide.pdf",
      "track": "backend"
    },
    "test_prac": {
      "title": "Software Testing: Practice Book",
      "path": "03_Programming/09_Software_Testing/02_Software_Testing_Practice_Book.pdf",
      "track": "backend"
    },
    "abe_guide": {
      "title": "Advanced Back-End: Redis Cache, Rate Limit, Idempotency & Jobs",
      "path": "03_Programming/11_Advanced_Backend_Engineering/01_Advanced_Backend_Engineering_Complete_Guide.pdf",
      "track": "backend"
    },
    "abe_prac": {
      "title": "Advanced Back-End: Practice Book (Targeted)",
      "path": "03_Programming/11_Advanced_Backend_Engineering/02_Advanced_Backend_Engineering_Practice_Book.pdf",
      "track": "backend"
    },
    "devops_guide": {
      "title": "DevOps & Cloud (Ch.1–3 ONLY: Docker & GitHub Actions CI)",
      "path": "04_CS_Fundamentals/06_DevOps_and_Cloud/01_DevOps_and_Cloud_Complete_Guide.pdf",
      "track": "backend"
    },
    "lld_guide": {
      "title": "Low-Level Design in Java: SOLID, Patterns & Case Studies",
      "path": "05_System_Design/01_Low_Level_Design/01_Low_Level_Design_Complete_Guide.pdf",
      "track": "backend"
    },
    "lld_prac": {
      "title": "Low-Level Design: Practice Book",
      "path": "05_System_Design/01_Low_Level_Design/02_Low_Level_Design_Practice_Book.pdf",
      "track": "backend"
    },
    "hld_guide": {
      "title": "System Design (HLD): Foundational Case Studies",
      "path": "05_System_Design/02_High_Level_Design/01_System_Design_Complete_Guide.pdf",
      "track": "backend"
    },
    "hld_prac": {
      "title": "System Design (HLD): Practice Book",
      "path": "05_System_Design/02_High_Level_Design/02_System_Design_Practice_Book.pdf",
      "track": "backend"
    },
    "hr_guide": {
      "title": "Interview, HR & Resume Guide",
      "path": "08_Interview_and_HR/01_Interview_HR_and_Resume_Guide.pdf",
      "track": "backend"
    }
  },
  "skills": [
    {
      "id": "dsa_nqt_core",
      "track": "dsa",
      "short": "NQT I/O & Arrays",
      "name": "Java Fast I/O, Arrays, Hashing, Windows & Binary Search",
      "desc": "BufferedReader/StringTokenizer, long overflow safety, prefix sums, two pointers, sliding windows & binary search.",
      "resources": [
        "java_guide",
        "jdsa_guide",
        "jdsa_prac",
        "java_zeroai"
      ],
      "milestone": "Ch.1–3 + NQT I/O Fluent"
    },
    {
      "id": "dsa_lin_rec",
      "track": "dsa",
      "short": "Lists, Stacks & Backtrack",
      "name": "Linked Lists, Monotonic Stacks, Queues & Backtracking",
      "desc": "Dummy-node pointers, ArrayDeque stacks, monotonic invariants & pruned recursion trees in Java.",
      "resources": [
        "jdsa_guide",
        "jdsa_prac"
      ],
      "milestone": "Ch.4–5 Mastered"
    },
    {
      "id": "dsa_tree_graph",
      "track": "dsa",
      "short": "Trees, Heaps, Graphs & DP",
      "name": "Trees, BSTs, PriorityQueue, Graphs & Core DP",
      "desc": "DFS/BFS, LCA, PriorityQueue top-k, Kahn topo sort, Dijkstra, DSU & 1D/2D knapsack/LCS DP.",
      "resources": [
        "jdsa_guide",
        "jdsa_prac"
      ],
      "milestone": "Ch.6–9 Mastered"
    },
    {
      "id": "dsa_timed_loops",
      "track": "dsa",
      "short": "Zero-AI Timed Loops",
      "name": "TCS NQT 2-Q Coding & 45m SDE-1 Interview Loops",
      "desc": "Weekly Friday blank-IDE coding gates, 14p Quick Revision & timed Mock Interview Workbook rounds.",
      "resources": [
        "jdsa_rev",
        "java_cpa",
        "mock_guide",
        "mock_work"
      ],
      "milestone": "24 Friday Gates + SDE-1 Ready"
    },
    {
      "id": "apt_quant_core",
      "track": "aptitude",
      "short": "Quant Arithmetic",
      "name": "NQT Arithmetic, P&C, Probability, Number System & Geometry",
      "desc": "Diagnostic-driven coverage of Ch.01–10 + Adv Quant (skipping chapters >= 80% on W1D1 diagnostic).",
      "resources": [
        "q_01",
        "q_02",
        "q_03",
        "q_05",
        "q_06",
        "q_07",
        "r_guide"
      ],
      "milestone": "Quant Ch.01–10 + Adv Quant"
    },
    {
      "id": "apt_reason_di",
      "track": "aptitude",
      "short": "Reasoning & DI",
      "name": "Logical Reasoning (Wk 2 Start) & Dedicated Data Interpretation",
      "desc": "Series, coding, blood relations, directions, seating, syllogisms, data sufficiency & multi-day DI drills.",
      "resources": [
        "r_guide",
        "q_11"
      ],
      "milestone": "Reasoning W2 + DI W5–6"
    },
    {
      "id": "apt_verbal",
      "track": "aptitude",
      "short": "Verbal & RC",
      "name": "Grammar, Error Detection, Para Jumbles & Reading Comprehension",
      "desc": "Topics 01–07 + Verbal Mixed Sets 01–06 practiced against strict NQT per-question timers.",
      "resources": [
        "v_01",
        "v_03",
        "v_06",
        "v_07",
        "vm_01",
        "vm_06"
      ],
      "milestone": "Verbal 01–07 + 6 Mixed Sets"
    },
    {
      "id": "apt_full_mocks",
      "track": "aptitude",
      "short": "7 Full NQT Mocks",
      "name": "Full-Length Multi-Section NQT Mocks & Blind Re-Attempts",
      "desc": "7 full-sitting mocks (Quant + Reasoning + Verbal + 2 Coding Qs) across Wks 6–12 with Monday blind redos.",
      "resources": [
        "r_mocks",
        "qm_01",
        "qm_08",
        "vm_04"
      ],
      "milestone": "7 Full Mocks (Wks 6–12)"
    },
    {
      "id": "sql_cli_mastery",
      "track": "sql_cs",
      "short": "MySQL CLI 1–16",
      "name": "Raw MySQL CLI: Modelling, Joins, CTEs, Windows & EXPLAIN",
      "desc": "Parts 1–16 typed raw in mysql CLI: anti-joins, recursive CTEs, window frames, composite indexes & ACID.",
      "resources": [
        "sql_guide",
        "sql_prac",
        "sql_ref",
        "sql_rev"
      ],
      "milestone": "MySQL 1–16 + 3-SQL Gates"
    },
    {
      "id": "jdbc_persist",
      "track": "sql_cs",
      "short": "JDBC & Pools",
      "name": "JDBC PreparedStatement, SQLi Defense, Pools & Manual Tx",
      "desc": "Connection pooling (HikariCP), SQLi attack/fix, setAutoCommit(false) rollbacks & DAO layering.",
      "resources": [
        "jdbc_guide",
        "jdbc_prac"
      ],
      "milestone": "JDBC Complete (Wks 5–7)"
    },
    {
      "id": "cs_os_dbms_cn",
      "track": "sql_cs",
      "short": "OS, DBMS & CN",
      "name": "Interview-Focused OS, DBMS Normalization/ACID & CN HTTP/TLS",
      "desc": "Processes/threads/deadlocks, B+ trees/MVCC/isolation levels, TCP/HTTP/DNS/TLS — skipping deep textbook fluff.",
      "resources": [
        "os_guide",
        "dbms_guide",
        "cn_guide"
      ],
      "milestone": "Core CS Essentials (Wks 8–10)"
    },
    {
      "id": "cs_git_linux",
      "track": "sql_cs",
      "short": "Git, Linux & Recall",
      "name": "Git Workflows, Linux Server Diagnostics & Phase-2 SQL Recall",
      "desc": "Rebase/bisect/reflog, process/port/log inspection on Linux, and weekly interview SQL maintenance.",
      "resources": [
        "git_guide",
        "linux_guide",
        "sql_rev"
      ],
      "milestone": "Phase 2 Recall & Tooling"
    },
    {
      "id": "be_conc_sec",
      "track": "backend",
      "short": "Concurrency & Security",
      "name": "Java Concurrency, Mini-Project 0 (JDBC) & Security First",
      "desc": "Threads/locks/Executors, pure Java+JDBC Mini-Project 0 (W11–12) & BCrypt/JWT/OWASP before Spring Security (W13–14).",
      "resources": [
        "conc_guide",
        "sec_guide",
        "sec_prac",
        "java_zeroai"
      ],
      "milestone": "Mini-Proj 0 + Gates J1.1–J1.2"
    },
    {
      "id": "be_spring_proj1",
      "track": "backend",
      "short": "Spring Boot + Proj 1",
      "name": "Spring Boot 3, JPA/Flyway, Testing & Flagship Project 1 (4 Full Wks)",
      "desc": "4 full weeks (~58h): DI, REST validation, JPA N+1, @Transactional, JWT+RBAC, JUnit 5/Mockito/Testcontainers & CI.",
      "resources": [
        "be_guide",
        "be_prac",
        "test_guide",
        "test_prac",
        "java_zeroai"
      ],
      "milestone": "Proj 1 Live + Gates J2.1–J3.2"
    },
    {
      "id": "be_redis_proj2",
      "track": "backend",
      "short": "Redis, Locks & Proj 2",
      "name": "Redis Cache/Rate-Limit, Row Locking, Idempotency & Flagship Project 2",
      "desc": "Targeted Adv Backend (Redis, rate limit, idempotency, async jobs) + DevOps Ch.1–3 (Docker + CI) for Booking/Wallet API.",
      "resources": [
        "abe_guide",
        "abe_prac",
        "devops_guide",
        "java_zeroai"
      ],
      "milestone": "Proj 2 Live + Gates J4.1–J5.1"
    },
    {
      "id": "be_lld_hld_loops",
      "track": "backend",
      "short": "3 Cold LLDs & HLD",
      "name": "3 Cold 60-Min Java LLDs, Foundational HLD & SDE-1 Mock Loops",
      "desc": "Parking Lot, Rate Limiter & Splitwise coded cold in 60m + 4 foundational HLDs + Whiteboard Defense & HR/STAR.",
      "resources": [
        "lld_guide",
        "lld_prac",
        "hld_guide",
        "hld_prac",
        "hr_guide",
        "java_zeroai"
      ],
      "milestone": "Gates J5.2–J6.2 + Offer Ready"
    }
  ],
  "months": [
    {
      "id": 1,
      "title": "Month 1: Diagnostic Calibration, Early Reasoning, Java DSA Ch.1–3 & MySQL Core",
      "period": "30 Nov – 27 Dec 2026",
      "phase": "Phase 1 • TCS NQT Mastery + Core Java/DSA + MySQL/JDBC + Core CS",
      "weeks": [
        1,
        2,
        3,
        4
      ],
      "summary": "Start Monday 30 Nov with a 60m NQT Diagnostic (skip chapters >= 80%), launch Reasoning early in Week 2, clear Quant Ch.01–07 + Verbal 01–04, master Java Fast I/O & DSA Ch.1–3 (Arrays, Hashing, Windows, Binary Search), and build raw MySQL CLI fluency (Parts 1–8).",
      "skills": [
        "dsa_nqt_core",
        "apt_quant_core",
        "apt_reason_di",
        "apt_verbal",
        "sql_cli_mastery"
      ],
      "targets": [
        {
          "id": "m1_t1",
          "track": "dsa",
          "text": "Master Java Fast I/O, overflow rules & DSA Ch.1–3 (Arrays, Hashing, Windows, Binary Search) zero-AI.",
          "tag": "DSA Ch.1–3"
        },
        {
          "id": "m1_t2",
          "track": "aptitude",
          "text": "Complete W1D1 Diagnostic, Reasoning (W2 start), Quant Ch.01–07 & Verbal Topics 01–04.",
          "tag": "Diagnostic + W2 Reason"
        },
        {
          "id": "m1_t3",
          "track": "sql_cs",
          "text": "Write MySQL Parts 1–8 (Modelling, Joins, Subqueries, CTEs) raw in mysql CLI.",
          "tag": "MySQL Pt 1–8"
        },
        {
          "id": "m1_t4",
          "track": "backend",
          "text": "Sustain 29.5h/wk pace (max 3 blocks/day, 4/4 Sunday 0h rests) & 4 Friday Closed-Book Gates.",
          "tag": "4 Friday Gates"
        }
      ]
    },
    {
      "id": 2,
      "title": "Month 2: Dedicated DI, Full NQT Mocks #1–#3, JDBC Persistence & Trees/Heaps",
      "period": "28 Dec 2026 – 24 Jan 2027",
      "phase": "Phase 1 • TCS NQT Mastery + Core Java/DSA + MySQL/JDBC + Core CS",
      "weeks": [
        5,
        6,
        7,
        8
      ],
      "summary": "Dedicate Weeks 5–6 to Data Interpretation (DI) & Advanced Quant, launch Full-Length Multi-Section NQT Mocks #1–#3 (Wks 6–8) with Monday blind redos, clear Java DSA Ch.4–7 (Lists, Stacks, Backtracking, Trees, Heaps), finish MySQL 9–16 + JDBC (PreparedStatement, Pools, Tx), and start OS essentials.",
      "skills": [
        "dsa_lin_rec",
        "dsa_tree_graph",
        "apt_reason_di",
        "apt_verbal",
        "apt_full_mocks",
        "sql_cli_mastery",
        "jdbc_persist",
        "cs_os_dbms_cn"
      ],
      "targets": [
        {
          "id": "m2_t1",
          "track": "dsa",
          "text": "Master Java DSA Ch.4–7 (Lists, Monotonic Stacks, Backtracking, Trees, Heaps) + weekly NQT 2-Q drills.",
          "tag": "DSA Ch.4–7"
        },
        {
          "id": "m2_t2",
          "track": "aptitude",
          "text": "Complete dedicated DI (Wks 5–6), Verbal 05–07 & sit Full Multi-Section NQT Mocks #1–#3 + blind redos.",
          "tag": "DI + 3 Full Mocks"
        },
        {
          "id": "m2_t3",
          "track": "sql_cs",
          "text": "Finish MySQL 9–16 (Windows, EXPLAIN, ACID), complete JDBC (Wks 5–7) & start OS interview essentials.",
          "tag": "MySQL 16 + JDBC"
        },
        {
          "id": "m2_t4",
          "track": "backend",
          "text": "Pass 4 Friday Zero-AI Closed-Book Gates & verify SQLi defense in raw JDBC code.",
          "tag": "JDBC SQLi Proof"
        }
      ]
    },
    {
      "id": 3,
      "title": "Month 3: NQT Peak (Mocks #4–#7), Graphs/DP, Core CS & Mini-Project 0 (Pure JDBC)",
      "period": "25 Jan – 21 Feb 2027",
      "phase": "Phase 1 • TCS NQT Mastery + Core Java/DSA + MySQL/JDBC + Core CS",
      "weeks": [
        9,
        10,
        11,
        12
      ],
      "summary": "Peak TCS NQT readiness with Full Multi-Section Mocks #4–#7 + blind redos, master Graphs & Core DP (DSA Ch.8–9), finish interview-focused DBMS & CN (Wks 9–10), learn core Java Concurrency & ship Mini-Project 0 (Pure Java + JDBC + MySQL + JUnit) in Weeks 11–12.",
      "skills": [
        "dsa_tree_graph",
        "dsa_timed_loops",
        "apt_full_mocks",
        "cs_os_dbms_cn",
        "be_conc_sec"
      ],
      "targets": [
        {
          "id": "m3_t1",
          "track": "dsa",
          "text": "Master Java DSA Ch.8–9 (Graphs, Dijkstra, DSU, Core DP) & clear NQT 2-Q coding under 45m.",
          "tag": "DSA Ch.8–9 + NQT Peak"
        },
        {
          "id": "m3_t2",
          "track": "aptitude",
          "text": "Complete Full Multi-Section NQT Mocks #4–#7 (7 total) & retire daily aptitude at 100% readiness.",
          "tag": "7/7 Full Mocks Done"
        },
        {
          "id": "m3_t3",
          "track": "sql_cs",
          "text": "Finish interview-focused DBMS (B+ trees, ACID) & CN (TCP/HTTP/DNS/TLS) essentials.",
          "tag": "OS/DBMS/CN Done"
        },
        {
          "id": "m3_t4",
          "track": "backend",
          "text": "Learn core Java Concurrency & ship Mini-Project 0 (Pure Java + HikariCP JDBC + manual Tx + JUnit 5).",
          "tag": "Mini-Project 0 Live"
        }
      ]
    },
    {
      "id": 4,
      "title": "Month 4: Security First (W13–14) & Spring Boot + Flagship Project 1 Pt 1 (W15–16)",
      "period": "22 Feb – 21 Mar 2027",
      "phase": "Phase 2 • Production Java Backend, 2 Flagship Projects, 3 Cold LLDs & SDE-1 Loops",
      "weeks": [
        13,
        14,
        15,
        16
      ],
      "summary": "Retire daily aptitude to unlock 14.5h/wk deep backend engineering! Complete Security Engineering FIRST (Wks 13–14: BCrypt/Argon2, JWT, OWASP, IDOR/SQLi/CORS), then launch the 4-week Spring Boot + Testing sprint (Wks 15–16: DI/Beans, REST Validation, JPA N+1, @Transactional) with Gates J1.1–J2.2.",
      "skills": [
        "dsa_nqt_core",
        "dsa_timed_loops",
        "cs_git_linux",
        "be_conc_sec",
        "be_spring_proj1"
      ],
      "targets": [
        {
          "id": "m4_t1",
          "track": "dsa",
          "text": "Run 4 weekly Zero-AI 45m Medium interview loops (Arrays, Windows, Binary Search, Stacks).",
          "tag": "4 Timed Med Loops"
        },
        {
          "id": "m4_t2",
          "track": "aptitude",
          "text": "Phase 1 NQT complete (0h/wk scheduled; optional 1.5h Sat maintenance only if campus drive active).",
          "tag": "0h (NQT Retired)"
        },
        {
          "id": "m4_t3",
          "track": "sql_cs",
          "text": "Build Git workflow fluency (rebase/bisect) & Linux server diagnostics alongside SQL recall.",
          "tag": "Git + Linux + SQL"
        },
        {
          "id": "m4_t4",
          "track": "backend",
          "text": "Pass Friday Proof Gates J1.1–J2.2: Security First -> Spring REST, Validation, JPA N+1 & @Transactional.",
          "tag": "Gates J1.1–J2.2"
        }
      ]
    },
    {
      "id": 5,
      "title": "Month 5: Ship Flagship Project 1 (W17–18) & Redis/Locking Flagship Project 2 Pt 1 (W19–20)",
      "period": "22 Mar – 18 Apr 2027",
      "phase": "Phase 2 • Production Java Backend, 2 Flagship Projects, 3 Cold LLDs & SDE-1 Loops",
      "weeks": [
        17,
        18,
        19,
        20
      ],
      "summary": "Finish the 4-week Spring Boot + Testing block by shipping Flagship Project 1 (Postgres, Flyway, JWT+RBAC, Testcontainers, Docker Compose, GitHub Actions CI, Swagger), then pivot into targeted Redis Caching, Rate Limiting & Docker/CI (DevOps Ch.1–3 only) for Flagship Project 2 (Gates J3.1–J4.2).",
      "skills": [
        "dsa_tree_graph",
        "dsa_timed_loops",
        "cs_git_linux",
        "be_spring_proj1",
        "be_redis_proj2"
      ],
      "targets": [
        {
          "id": "m5_t1",
          "track": "dsa",
          "text": "Run 4 weekly Zero-AI 45m Medium loops across Trees, Heaps, Graphs & DP + sweep Redo Queue.",
          "tag": "Trees/Graphs/DP Loops"
        },
        {
          "id": "m5_t2",
          "track": "aptitude",
          "text": "Keep 100% focus on SDE-1 backend engineering & coding loops (0h/wk aptitude).",
          "tag": "SDE-1 Deep Focus"
        },
        {
          "id": "m5_t3",
          "track": "sql_cs",
          "text": "Practice interview SQL (windows, locks, EXPLAIN) & PostgreSQL production indexing.",
          "tag": "Postgres Indexing"
        },
        {
          "id": "m5_t4",
          "track": "backend",
          "text": "SHIP Flagship Project 1 (Wk 18) + Pass Gates J3.1–J4.2 (JWT, Testcontainers, Redis Cache & Rate Limiter).",
          "tag": "Project 1 Shipped!"
        }
      ]
    },
    {
      "id": 6,
      "title": "Month 6: Ship Flagship Project 2 (W21), 3 Cold 60m Java LLDs, Essential HLD & SDE-1 Peak",
      "period": "19 Apr – 16 May 2027",
      "phase": "Phase 2 • Production Java Backend, 2 Flagship Projects, 3 Cold LLDs & SDE-1 Loops",
      "weeks": [
        21,
        22,
        23,
        24
      ],
      "summary": "Ship Flagship Project 2 (Booking/Wallet API with row locking, idempotency keys, Redis, Testcontainers & CI) in Week 21, then master 3 deep Cold 60-Min Java LLDs (Parking Lot, Rate Limiter, Splitwise), 4 foundational HLDs, Full Mock Interview Loops, Whiteboard Defense & HR/STAR (Gates J5.1–J6.2).",
      "skills": [
        "dsa_timed_loops",
        "sql_cli_mastery",
        "be_redis_proj2",
        "be_lld_hld_loops"
      ],
      "targets": [
        {
          "id": "m6_t1",
          "track": "dsa",
          "text": "Complete final Mock Interview Workbook coding rounds & zero out 100% of Redo Queue.",
          "tag": "Coding Peak"
        },
        {
          "id": "m6_t2",
          "track": "aptitude",
          "text": "All 24 Sundays 100% cognitive rest protected — arrive at SDE-1 interviews sharp and unburned.",
          "tag": "Burnout-Proof"
        },
        {
          "id": "m6_t3",
          "track": "sql_cs",
          "text": "Ace rapid-fire SQL, ACID isolation, OS/CN & Git/Linux interview drills.",
          "tag": "CS + SQL Ready"
        },
        {
          "id": "m6_t4",
          "track": "backend",
          "text": "SHIP Flagship Project 2 (Wk 21), pass 3 Cold 60m LLDs (J5.2–J6.2), 4 HLDs & Full SDE-1 Mock Loops.",
          "tag": "Proj 2 + 3 Cold LLDs"
        }
      ]
    }
  ],
  "weeks": [
    {
      "id": 1,
      "month": 1,
      "title": "W1D1 Diagnostic Mock, Java Fast I/O, Arrays/Hashing & MySQL Foundations",
      "focus": [
        "W1D1 60m NQT Diagnostic",
        "Java Fast I/O + DSA Ch.1",
        "MySQL Pt 1–2 Raw CLI",
        "Friday Closed-Book Gate #1"
      ],
      "practiceTag": "Diagnostic • DSA Ch.1 • MySQL 1–2 • Gate #1",
      "targets": [
        {
          "id": "w1_t1",
          "track": "dsa",
          "text": "W1 Mon: Java Fast I/O & Overflow Survival Setup -> W1 Friday Zero-AI Gate: 2 Unseen Array/Hash Java Problems."
        },
        {
          "id": "w1_t2",
          "track": "aptitude",
          "text": "W1D1 Mandatory 60m TCS NQT Diagnostic Mock -> Verbal 02 Idioms & Phrases Mixed Review."
        },
        {
          "id": "w1_t3",
          "track": "sql_cs",
          "text": "MySQL Pt 1–2: RDBMS Setup, ER Keys & Constraints in CLI & Friday raw SQL/CS proof."
        },
        {
          "id": "w1_t4",
          "track": "backend",
          "text": "Complete all 3 Friday Zero-AI Closed-Book Gates & Sunday 0h rest."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_nqt_core"
            ],
            "W1 Mon: Java Fast I/O & Overflow Survival Setup",
            "Read java_zeroai Ch.1; code BufferedReader+StringTokenizer template, long overflow guards & negative modulo tests with AI off.",
            "java_zeroai",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_quant_core",
              "apt_full_mocks"
            ],
            "W1D1 Mandatory 60m TCS NQT Diagnostic Mock",
            "Sit a 60m mixed baseline (Quant + Reasoning + Verbal) from r_mocks; mark any chapter >= 80% as skim-only to save hours.",
            "r_mocks",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "MySQL Pt 1–2: RDBMS Setup, ER Keys & Constraints in CLI",
            "Install/open mysql CLI; create normalized tables with PK, FK, UNIQUE, NOT NULL & CHECK without GUI wizards.",
            "sql_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_nqt_core"
            ],
            "DSA Ch.1: Complexity Budgeting & Java Collections Traps",
            "Master O(n) vs O(n log n) limits, ArrayList vs LinkedList, HashMap hashing & String equals traps in jdsa_guide Ch.1.",
            "jdsa_guide",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_quant_core"
            ],
            "Quant Ch.01 Simplification & Ch.02 Percentage (Diagnostic-Filtered)",
            "Drill weak sub-types flagged by Day 1 Diagnostic (BODMAS, fraction-to-percent table, successive % change).",
            "q_02",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "MySQL Pt 2–3: DML, Filtering & 3-Valued NULL Logic",
            "Practice INSERT/UPDATE/DELETE, IS NULL vs = NULL traps & COALESCE in raw mysql CLI.",
            "sql_prac",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_nqt_core"
            ],
            "DSA Ch.2 Pt 1: Prefix Sums & Frequency HashMaps",
            "Solve Two Sum, Subarray Sum Equals K & Group Anagrams from a blank Java file (AI completely off).",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_verbal"
            ],
            "Verbal 01 Words Completion & 02 Idioms Timed Drill",
            "Work 40 timed vocabulary & idiom questions; log every missed phrase in your error sheet.",
            "v_01",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "MySQL Pt 4: GROUP BY, HAVING & Conditional CASE Aggregates",
            "Write raw aggregation queries with COUNT(*) vs COUNT(col), HAVING filters & CASE pivots.",
            "sql_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_nqt_core"
            ],
            "TCS NQT Stdin/Stdout Drill #1: 2 Array/String Problems",
            "Solve 2 NQT-style stdin/stdout problems (long sums + character frequency) under 45m using BufferedReader.",
            "java_cpa",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_quant_core"
            ],
            "Quant Ch.03 Ratio & Proportion Timed Practice",
            "Solve 35 Ratio/Proportion & Partnership problems against a 75-second-per-question timer.",
            "q_03",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "Core Java OOP & Collections Quick Refresh (Ch.1–6)",
            "Review equals/hashCode contract, Comparable vs Comparator & StringBuilder from java_guide.",
            "java_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_nqt_core",
              "dsa_timed_loops"
            ],
            "W1 Friday Zero-AI Gate: 2 Unseen Array/Hash Java Problems",
            "Closed-book blank-IDE proof: solve 2 unseen array/hash problems with edge cases & complexity proof.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_quant_core"
            ],
            "W1 Friday Zero-AI Gate: 25m Timed Quant Mini-Section",
            "Sit a strict 25m timed set on Percentage & Ratio, then analyze every slow or wrong answer.",
            "qm_01",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "W1 Friday Zero-AI Gate: 3 Raw MySQL CLI Aggregation Queries",
            "Write 3 unseen GROUP BY/HAVING/NULL queries cold in mysql CLI without peeking at notes.",
            "sql_prac",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_nqt_core"
            ],
            "W1 Sat: Arrays/Hashing Redo Sweep & Edge-Case Audit",
            "Re-solve every ~ Redo problem from Week 1 cold and review Java collections pitfalls.",
            "jdsa_rev",
            1.5,
            "08:30–10:00",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_verbal"
            ],
            "Verbal 02 Idioms & Phrases Mixed Review",
            "Timed 30-question drill + review Week 1 diagnostic weak-topic tracker.",
            "v_02",
            1.5,
            "10:30–12:00",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "MySQL Pt 1–4 Consolidation & Reference Sheet Lookup",
            "Cross-check string/date built-in functions in sql_ref and solve 5 chapterwise SQL exercises.",
            "sql_ref",
            1.5,
            "14:00–15:30",
            "b3"
          ]
        ],
        []
      ]
    },
    {
      "id": 2,
      "month": 1,
      "title": "Early Reasoning Start (Wk 2!), Sliding Windows, Profit/Loss & MySQL Joins",
      "focus": [
        "Reasoning Starts Wk 2!",
        "DSA Ch.2 Windows/2-Ptr",
        "MySQL Pt 5–6 Joins",
        "Friday Closed-Book Gate #2"
      ],
      "practiceTag": "W2 Reasoning • Windows • MySQL Joins • Gate #2",
      "targets": [
        {
          "id": "w2_t1",
          "track": "dsa",
          "text": "DSA Ch.2 Pt 2: Two Pointers & Fixed/Variable Sliding Windows -> W2 Friday Zero-AI Gate: 2 Unseen Window/2-Pointer Java Problems."
        },
        {
          "id": "w2_t2",
          "track": "aptitude",
          "text": "Reasoning W2 Launch: Number/Letter Series & Coding-Decoding -> Quant Ch.04 Average & Mixed Set 02 Timed Speed Run."
        },
        {
          "id": "w2_t3",
          "track": "sql_cs",
          "text": "MySQL Pt 5: INNER, LEFT, RIGHT & Self Joins in CLI & Friday raw SQL/CS proof."
        },
        {
          "id": "w2_t4",
          "track": "backend",
          "text": "Complete all 3 Friday Zero-AI Closed-Book Gates & Sunday 0h rest."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_nqt_core"
            ],
            "DSA Ch.2 Pt 2: Two Pointers & Fixed/Variable Sliding Windows",
            "Code Longest Substring Without Repeating Chars & Container With Most Water from blank file.",
            "jdsa_guide",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_reason_di"
            ],
            "Reasoning W2 Launch: Number/Letter Series & Coding-Decoding",
            "Start Reasoning early (r_guide Ch.5): pattern deltas, alternating series & cipher rules under timer.",
            "r_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "MySQL Pt 5: INNER, LEFT, RIGHT & Self Joins in CLI",
            "Write multi-table joins and verify row-count multiplication bugs on 1:N vs M:N tables.",
            "sql_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_nqt_core"
            ],
            "DSA Ch.2 Pt 3: Kadane, Product Except Self & Rain Water",
            "Solve 3 core array-window mediums in pure Java; assert O(n) time and O(1)/O(n) space.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_quant_core"
            ],
            "Quant Ch.04 Average & Ch.05 Profit/Loss Timed Drill",
            "Focus on weighted averages, dishonest dealer & successive markup/discount shortcuts.",
            "q_05",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "MySQL Pt 6: Anti-Joins (LEFT JOIN IS NULL) & Correlated Subqueries",
            "Compare NOT EXISTS vs NOT IN with NULL values and solve 8 join exercises in mysql CLI.",
            "sql_prac",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_nqt_core"
            ],
            "TCS NQT Stdin/Stdout Drill #2: Sliding Window & Kadane",
            "Timed 45m 2-question NQT simulation handling negative numbers and large long outputs.",
            "java_cpa",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_reason_di"
            ],
            "Reasoning: Blood Relations & Direction Sense Diagrams",
            "Draw family trees & compass grids (r_guide Ch.5–6) to hit 95% accuracy under 60s/Q.",
            "r_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "Core Java Exceptions, Generics & Streams Essentials",
            "Review try-with-resources, checked vs unchecked exceptions & clean Comparator lambdas.",
            "java_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_nqt_core"
            ],
            "Sliding Window Hard-Medium Drill: At Most K Distinct & Min Window",
            "Code Minimum Window Substring from scratch without AI; trace shrinking-pointer invariant.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_verbal"
            ],
            "Verbal 03 Error Detection: Subject-Verb, Tenses & Modifiers",
            "Solve 40 Error Detection items focusing on recurring TCS NQT grammar traps.",
            "v_03",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "MySQL Pt 5–6 Practice: Multi-Table E-Commerce & HR Joins",
            "Write 6 complex 3-table joins with LEFT JOIN preservation in mysql CLI.",
            "sql_prac",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_nqt_core",
              "dsa_timed_loops"
            ],
            "W2 Friday Zero-AI Gate: 2 Unseen Window/2-Pointer Java Problems",
            "Closed-book blank-IDE coding proof + dry-run trace on boundary test cases.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_reason_di"
            ],
            "W2 Friday Zero-AI Gate: 25m Timed Series/Relations/Profit Mini-Set",
            "Timed mixed section combining Week 2 Reasoning + Profit/Loss; log accuracy & speed.",
            "qm_02",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "W2 Friday Zero-AI Gate: 3 Raw Multi-Table Join & Anti-Join Queries",
            "Write 3 unseen JOIN / NOT EXISTS queries cold in mysql CLI.",
            "sql_prac",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_nqt_core"
            ],
            "W2 Sat: Window Pattern Consolidation & Redo Queue Clear",
            "Re-solve any hesitant Week 2 coding problem blank-file and annotate loop invariants.",
            "jdsa_rev",
            1.5,
            "08:30–10:00",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_quant_core"
            ],
            "Quant Ch.04 Average & Mixed Set 02 Timed Speed Run",
            "30-minute timed arithmetic run + immediate review of missed shortcuts.",
            "q_04",
            1.5,
            "10:30–12:00",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "MySQL Set Operations (UNION ALL) & Reference Check",
            "Contrast UNION vs UNION ALL and practice join-plus-aggregation edge cases.",
            "sql_ref",
            1.5,
            "14:00–15:30",
            "b3"
          ]
        ],
        []
      ]
    },
    {
      "id": 3,
      "month": 1,
      "title": "Binary Search on Answer, Seating/Syllogisms, Time & Work & MySQL CTEs",
      "focus": [
        "DSA Ch.3 Binary Search/Intervals",
        "Seating & Syllogisms",
        "MySQL Pt 7–8 CTEs",
        "Friday Closed-Book Gate #3"
      ],
      "practiceTag": "Binary Search • Syllogisms • CTEs • Gate #3",
      "targets": [
        {
          "id": "w3_t1",
          "track": "dsa",
          "text": "DSA Ch.3 Pt 1: First-True Binary Search & Overflow-Safe Mid -> W3 Friday Zero-AI Gate: 2 Unseen Binary Search/Interval Problems."
        },
        {
          "id": "w3_t2",
          "track": "aptitude",
          "text": "Reasoning: Linear/Circular Seating Arrangements -> Verbal Mixed Set 01 Timed Run (Grammar + Vocabulary)."
        },
        {
          "id": "w3_t3",
          "track": "sql_cs",
          "text": "MySQL Pt 7: Normalisation (1NF–BCNF) & Functional Dependencies & Friday raw SQL/CS proof."
        },
        {
          "id": "w3_t4",
          "track": "backend",
          "text": "Complete all 3 Friday Zero-AI Closed-Book Gates & Sunday 0h rest."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_nqt_core"
            ],
            "DSA Ch.3 Pt 1: First-True Binary Search & Overflow-Safe Mid",
            "Master lo + (hi - lo) / 2, lower/upper bound & rotated sorted array search cold in Java.",
            "jdsa_guide",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_reason_di"
            ],
            "Reasoning: Linear/Circular Seating Arrangements",
            "Solve 6 multi-clue arrangement puzzles from r_guide Ch.6 using strict constraint elimination.",
            "r_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "MySQL Pt 7: Normalisation (1NF–BCNF) & Functional Dependencies",
            "Decompose denormalized schemas into lossless 3NF/BCNF tables and test in mysql CLI.",
            "sql_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_nqt_core"
            ],
            "DSA Ch.3 Pt 2: Binary Search on Answer (Koko/Ship Capacity)",
            "Code monotonic predicate feasibility checks cleanly without off-by-one infinite loops.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_quant_core"
            ],
            "Quant Ch.06 Time & Work, Pipes & Efficiency Ratios",
            "Solve 40 Time & Work problems using LCM total-work method under 75s/Q.",
            "q_06",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "MySQL Pt 8: Non-Recursive & Recursive WITH CTEs",
            "Write multi-step WITH pipelines and recursive org-chart/sequence CTEs in mysql CLI.",
            "sql_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_nqt_core"
            ],
            "DSA Ch.3 Pt 3: Sorting, Custom Comparators & Interval Sweeps",
            "Solve Merge Intervals & Non-Overlapping Intervals using Arrays.sort with Integer.compare (no a - b overflow!).",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_reason_di"
            ],
            "Reasoning: Syllogisms (Venn Diagrams) & Data Sufficiency",
            "Drill Venn diagram edge cases (Either/Or, Possibility) & DS two-statement sufficiency rules.",
            "r_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "MySQL Pt 8 Practice: Recursive Hierarchies & CTE Refactoring",
            "Rewrite 5 nested subqueries into clean readable CTEs and verify identical outputs.",
            "sql_prac",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_nqt_core"
            ],
            "TCS NQT Stdin/Stdout Drill #3: Binary Search & Interval Coding",
            "45m timed 2-question NQT coding drill with custom sorting & long bounds.",
            "java_cpa",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_verbal"
            ],
            "Verbal 04 Sentence Completion & Contextual Cloze",
            "Solve 40 cloze & connector questions checking tone, contrast & parallel structure.",
            "v_04",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "Java Practice Book Ch.1–3 Timed Coding & OOP Drills",
            "Code encapsulation, interface polymorphism & clean immutable POJOs from java_prac.",
            "java_prac",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_nqt_core",
              "dsa_timed_loops"
            ],
            "W3 Friday Zero-AI Gate: 2 Unseen Binary Search/Interval Problems",
            "Blank-IDE timed proof verifying overflow-safe mid & Integer.compare sorting.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_reason_di"
            ],
            "W3 Friday Zero-AI Gate: 25m Timed Seating/Syllogism & Work Set",
            "Strict timed mini-section; review every missed Venn diagram or efficiency trap.",
            "qm_03",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "W3 Friday Zero-AI Gate: 3 Raw CTE & Subquery MySQL Drills",
            "Write 3 unseen WITH/recursive CTE queries cold in mysql CLI.",
            "sql_prac",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_nqt_core"
            ],
            "W3 Sat: Binary Search & Intervals Redo Sweep",
            "Re-solve every Week 3 ~ Redo problem cold and review jdsa_rev Ch.3 templates.",
            "jdsa_rev",
            1.5,
            "08:30–10:00",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_verbal"
            ],
            "Verbal Mixed Set 01 Timed Run (Grammar + Vocabulary)",
            "Complete Verbal Mixed Set 01 under strict timer and log top 5 recurring grammar rules.",
            "vm_01",
            1.5,
            "10:30–12:00",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "MySQL Ch.1–8 Cumulative CLI Query Drill",
            "Solve 6 mixed modelling, join & CTE queries from sql_prac without notes.",
            "sql_prac",
            1.5,
            "14:00–15:30",
            "b3"
          ]
        ],
        []
      ]
    },
    {
      "id": 4,
      "month": 1,
      "title": "Linked Lists, Monotonic Stacks, Speed/Distance/Boats & MySQL Windows",
      "focus": [
        "DSA Ch.4 Lists & Monotonic Stacks",
        "Quant Ch.07–08 Speed/Boats",
        "MySQL Pt 9 Window Functions",
        "Friday Closed-Book Gate #4"
      ],
      "practiceTag": "Lists/Stacks • Windows SQL • Gate #4",
      "targets": [
        {
          "id": "w4_t1",
          "track": "dsa",
          "text": "DSA Ch.4 Pt 1: Dummy-Node Linked Lists & Fast/Slow Pointers -> W4 Friday Zero-AI Gate: 2 Unseen Linked List/Monotonic Stack Qs."
        },
        {
          "id": "w4_t2",
          "track": "aptitude",
          "text": "Quant Ch.07 Distance, Speed, Time & Trains/Relative Speed -> Verbal 05 Sentence Building & Verbal Mixed Set 02."
        },
        {
          "id": "w4_t3",
          "track": "sql_cs",
          "text": "MySQL Pt 9 Pt 1: ROW_NUMBER, RANK, DENSE_RANK & Top-N/Group & Friday raw SQL/CS proof."
        },
        {
          "id": "w4_t4",
          "track": "backend",
          "text": "Complete all 3 Friday Zero-AI Closed-Book Gates & Sunday 0h rest."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_lin_rec"
            ],
            "DSA Ch.4 Pt 1: Dummy-Node Linked Lists & Fast/Slow Pointers",
            "Code Reverse List, Detect Cycle, Merge Two Sorted Lists & Remove Nth From End blank-file.",
            "jdsa_guide",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_quant_core"
            ],
            "Quant Ch.07 Distance, Speed, Time & Trains/Relative Speed",
            "Master km/h <-> m/s conversion, average speed harmonic mean & train-crossing formulas.",
            "q_07",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "MySQL Pt 9 Pt 1: ROW_NUMBER, RANK, DENSE_RANK & Top-N/Group",
            "Solve top-3 salaries per department & deduplication queries raw in mysql CLI.",
            "sql_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_lin_rec"
            ],
            "DSA Ch.4 Pt 2: ArrayDeque Stacks, Valid Parens & Min Stack",
            "Avoid legacy java.util.Stack; implement O(1) MinStack & RPN evaluator using ArrayDeque.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_quant_core"
            ],
            "Quant Ch.08 Boats & Streams + Ch.09 Elementary Statistics",
            "Solve upstream/downstream speed & mean/median/mode/SD/variance NQT questions.",
            "q_08",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "MySQL Pt 9 Pt 2: LAG/LEAD, Running Totals & Frame Clauses",
            "Master ROWS BETWEEN vs RANGE BETWEEN, session deltas & 7-day moving averages.",
            "sql_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_lin_rec"
            ],
            "DSA Ch.4 Pt 3: Monotonic Stack & Sliding Window Maximum Deque",
            "Code Daily Temperatures, Largest Rectangle in Histogram & Sliding Window Max zero-AI.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_verbal"
            ],
            "Verbal 05 Sentence Building & 06 Para Jumbles Strategy",
            "Master pronoun-antecedent links, mandatory pairs & opening/closing sentence anchors.",
            "v_06",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "MySQL Pt 9 Practice: 10 Interview Window Function Queries",
            "Solve 10 chapterwise window exercises in mysql CLI verifying NULL/tie behavior.",
            "sql_prac",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_lin_rec"
            ],
            "TCS NQT Stdin/Stdout Drill #4: Stack/Queue & Array Simulation",
            "45m timed 2-question NQT coding drill using ArrayDeque & StringBuilder.",
            "java_cpa",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_quant_core"
            ],
            "Quant Ch.09 Statistics & Ch.10 Mensuration/Geometry Core",
            "Formula-sheet drill on SD, 2D/3D areas/volumes & triangle/circle theorems.",
            "q_10",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "MySQL Pt 10: B-Tree Indexes, Leftmost Prefix & EXPLAIN Basics",
            "Run EXPLAIN on unindexed vs indexed 100K-row tables; observe type=ALL vs ref/range.",
            "sql_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_lin_rec",
              "dsa_timed_loops"
            ],
            "W4 Friday Zero-AI Gate: 2 Unseen Linked List/Monotonic Stack Qs",
            "Closed-book blank-IDE coding proof; check null-head and single-node edge cases.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_quant_core",
              "apt_verbal"
            ],
            "W4 Friday Zero-AI Gate: 25m Speed/Geometry + Para Jumbles Set",
            "Timed mixed mini-section + audit Month 1 accuracy targets.",
            "qm_04",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "W4 Friday Zero-AI Gate: 3 Raw Window Function & EXPLAIN Drills",
            "Write 3 unseen ROW_NUMBER/LAG/running-total queries cold in mysql CLI.",
            "sql_prac",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_nqt_core",
              "dsa_lin_rec"
            ],
            "W4 Sat: Month 1 Cumulative DSA Ch.1–4 Timed Revision",
            "Solve 3 random Ch.1–4 mediums in 50m and zero out Month 1 Redo Queue.",
            "jdsa_rev",
            1.5,
            "08:30–10:00",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_verbal"
            ],
            "Verbal 05 Sentence Building & Verbal Mixed Set 02",
            "Timed verbal mixed set + review top Para Jumble/Error Detection rules.",
            "vm_02",
            1.5,
            "10:30–12:00",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "MySQL Pt 10 Practice: Covering Indexes & Slow-Query Tuning",
            "Diagnose 5 slow SQL queries with EXPLAIN and add minimal composite indexes.",
            "sql_prac",
            1.5,
            "14:00–15:30",
            "b3"
          ]
        ],
        []
      ]
    },
    {
      "id": 5,
      "month": 2,
      "title": "Dedicated Data Interpretation (DI), Backtracking & JDBC Persistence Launch",
      "focus": [
        "Dedicated DI Drills (Wk 5–6)",
        "DSA Ch.5 Backtracking",
        "JDBC Start (Wks 5–7)",
        "MySQL Pt 11–12 ACID"
      ],
      "practiceTag": "Dedicated DI • Backtracking • JDBC Launch • Gate #5",
      "targets": [
        {
          "id": "w5_t1",
          "track": "dsa",
          "text": "DSA Ch.5 Pt 1: Recursion Trees, Subsets & Permutations -> W5 Friday Zero-AI Gate: 2 Unseen Backtracking/Recursion Problems."
        },
        {
          "id": "w5_t2",
          "track": "aptitude",
          "text": "Dedicated DI Block 1: Tabular & Bar-Chart Multi-Question Sets -> Dedicated DI Block 3: Mixed Charts & Missing-Data Tables."
        },
        {
          "id": "w5_t3",
          "track": "sql_cs",
          "text": "JDBC Ch.1–2: DriverManager, Connections & PreparedStatement & Friday raw SQL/CS proof."
        },
        {
          "id": "w5_t4",
          "track": "backend",
          "text": "Complete all 3 Friday Zero-AI Closed-Book Gates & Sunday 0h rest."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_lin_rec"
            ],
            "DSA Ch.5 Pt 1: Recursion Trees, Subsets & Permutations",
            "Code Subsets, Subsets II (duplicate pruning) & Permutations from blank file in Java.",
            "jdsa_guide",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_reason_di"
            ],
            "Dedicated DI Block 1: Tabular & Bar-Chart Multi-Question Sets",
            "Start 2-week DI focus (q_11): approximation, ratio comparison & percentage-point traps.",
            "q_11",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "jdbc_persist"
            ],
            "JDBC Ch.1–2: DriverManager, Connections & PreparedStatement",
            "Read jdbc_guide Ch.1–2; write runnable Java JDBC program with try-with-resources.",
            "jdbc_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_lin_rec"
            ],
            "DSA Ch.5 Pt 2: Combination Sum, Word Search & N-Queens",
            "Practice choose/explore/unchoose state restoration without mutating shared list bugs.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_reason_di"
            ],
            "Dedicated DI Block 2: Pie Charts & Line-Graph Growth Rates",
            "Solve 4 full DI caselets (20 Qs) practicing fraction shortcuts over long division.",
            "q_11",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "jdbc_persist"
            ],
            "JDBC SQL Injection Attack Demo & Parameterized Fix",
            "Reproduce classic SQLi on Statement concatenation, then prove PreparedStatement immunity.",
            "jdbc_prac",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_lin_rec"
            ],
            "TCS NQT Stdin/Stdout Drill #5: Recursion & String Parsing",
            "45m timed 2-question NQT coding drill with clean helper methods.",
            "java_cpa",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_quant_core"
            ],
            "Adv Quant Ch.1–2: Number System, Remainder & Mixtures/Alligation",
            "Study r_guide Ch.1–2: divisibility, unit digit, LCM/HCF & alligation cross rule.",
            "r_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "MySQL Pt 11: ACID Transactions, Isolation Levels & MVCC",
            "Observe dirty/non-repeatable/phantom reads & SELECT FOR UPDATE across two mysql CLI tabs.",
            "sql_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_lin_rec"
            ],
            "Backtracking Timed Drill: Palindrome Partitioning & Letter Combos",
            "Solve 2 backtracking mediums in 40m with pruning analysis.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_verbal"
            ],
            "Verbal 07 Reading Comprehension: Main Idea & Inference Passages",
            "Work 4 timed RC passages (16–20 Qs) mapping paragraph structure before answering.",
            "v_07",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "jdbc_persist"
            ],
            "JDBC Ch.2–3: NULL Handling (wasNull), Types & Batch Inserts",
            "Run JDBC batch inserts and verify getInt()+wasNull() traps from jdbc_guide.",
            "jdbc_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_lin_rec",
              "dsa_timed_loops"
            ],
            "W5 Friday Zero-AI Gate: 2 Unseen Backtracking/Recursion Problems",
            "Closed-book blank-IDE coding proof; verify deep-copy new ArrayList<>(path) on capture.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_reason_di"
            ],
            "W5 Friday Zero-AI Gate: 25m Timed DI Caselet + Number System Set",
            "Timed 2-caselet DI + Adv Quant check under strict exam clock.",
            "q_11",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery",
              "jdbc_persist"
            ],
            "W5 Friday Zero-AI Gate: 3 Raw ACID/SQL Queries + PreparedStatement Fix",
            "Write 3 transactional/window SQL queries cold + parameterize a vulnerable JDBC snippet.",
            "jdbc_prac",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_lin_rec"
            ],
            "W5 Sat: Backtracking Redo Sweep & Complexity Bounds",
            "Re-solve Week 5 ~ Redo items cold and verify recursion depth bounds.",
            "jdsa_rev",
            1.5,
            "08:30–10:00",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_reason_di"
            ],
            "Dedicated DI Block 3: Mixed Charts & Missing-Data Tables",
            "Solve 3 hard DI caselets under strict 18-minute timer; log calculation shortcuts.",
            "q_11",
            1.5,
            "10:30–12:00",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "MySQL Pt 12–13: Views, Triggers & Schema Constraints",
            "Practice SQL views, CHECK constraints & schema review drills in mysql CLI.",
            "sql_guide",
            1.5,
            "14:00–15:30",
            "b3"
          ]
        ],
        []
      ]
    },
    {
      "id": 6,
      "month": 2,
      "title": "Full NQT Mock #1 Launch (Sat), DI Peak, Binary Trees & JDBC Transactions",
      "focus": [
        "Full Multi-Section NQT Mock #1",
        "DI Completion + P&C/Prob",
        "DSA Ch.6 Trees/BST",
        "JDBC Transactions & Pools"
      ],
      "practiceTag": "Full NQT Mock #1 • Trees • JDBC Tx • Gate #6",
      "targets": [
        {
          "id": "w6_t1",
          "track": "dsa",
          "text": "DSA Ch.6 Pt 1: Binary Tree DFS/BFS & Zigzag Level Order -> W6 Friday Zero-AI Gate: 2 Unseen Binary Tree/BST Java Problems."
        },
        {
          "id": "w6_t2",
          "track": "aptitude",
          "text": "Dedicated DI Block 4: Caselet DI & Speed Approximation Peak -> FULL MULTI-SECTION NQT MOCK #1 (Quant + Reason + Verbal + 2 Code)."
        },
        {
          "id": "w6_t3",
          "track": "sql_cs",
          "text": "JDBC Ch.3–4: setAutoCommit(false), Rollbacks & Savepoints & Friday raw SQL/CS proof."
        },
        {
          "id": "w6_t4",
          "track": "backend",
          "text": "Complete all 3 Friday Zero-AI Closed-Book Gates & Sunday 0h rest."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "DSA Ch.6 Pt 1: Binary Tree DFS/BFS & Zigzag Level Order",
            "Code Pre/In/Postorder (recursive + iterative) & level-order BFS cold in Java.",
            "jdsa_guide",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_reason_di"
            ],
            "Dedicated DI Block 4: Caselet DI & Speed Approximation Peak",
            "Finish final DI drill block (q_11): percentage ratios & fastest elimination order.",
            "q_11",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "jdbc_persist"
            ],
            "JDBC Ch.3–4: setAutoCommit(false), Rollbacks & Savepoints",
            "Run real multi-statement JDBC transactions verifying rollback on mid-flight SQL error.",
            "jdbc_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "DSA Ch.6 Pt 2: Diameter, Balanced Tree & LCA in Binary Tree",
            "Master bottom-up height/info return pattern & LCA without parent pointers.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_quant_core"
            ],
            "Adv Quant Ch.3: Permutations, Combinations & Probability",
            "Study r_guide Ch.3: nPr/nCr constraints, conditional probability & Bayes NQT items.",
            "r_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "jdbc_persist"
            ],
            "JDBC Ch.4–5: Solving N+1 in Raw JDBC & HikariCP Connection Pools",
            "Configure HikariCP pool sizing, leak detection & batch fetch from jdbc_guide.",
            "jdbc_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "DSA Ch.6 Pt 3: BST Validation, Kth Smallest & Path Sum III",
            "Solve BST range-bound validation (long min/max!) & downward path sums zero-AI.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_verbal"
            ],
            "Verbal 07 RC Deep Passages & Verbal Mixed Set 03",
            "Complete Mixed Set 03 timed; practice eliminating extreme/out-of-scope RC distractors.",
            "vm_03",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "MySQL Pt 14–15: Query Tuning, Partitioning & Analytics Practice",
            "Solve advanced multi-CTE MySQL exercises and verify plans via EXPLAIN.",
            "sql_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "TCS NQT Stdin/Stdout Drill #6: Tree/Array Representation Coding",
            "45m timed 2-question NQT coding drill (tree/grid input parsing + fast output).",
            "java_cpa",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "jdbc_persist"
            ],
            "JDBC Practice Ch.3–5: Transaction Isolation & Pool Leak Tests",
            "Solve 6 JDBC transaction/pooling exercises from jdbc_prac and test connection closure.",
            "jdbc_prac",
            2.0,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "MySQL Pt 16: Full Completion & Quick Revision Pass #1",
            "Complete final MySQL guide chapter & review sql_rev traps end-to-end.",
            "sql_rev",
            1.5,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph",
              "dsa_timed_loops"
            ],
            "W6 Friday Zero-AI Gate: 2 Unseen Binary Tree/BST Java Problems",
            "Closed-book blank-IDE coding proof; check Long.MIN_VALUE/MAX_VALUE BST bounds.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_quant_core"
            ],
            "W6 Friday Zero-AI Gate: 25m P&C, Probability & DI Mini-Section",
            "Strict timed mini-section ahead of tomorrow's Full-Length NQT Mock #1.",
            "qm_05",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery",
              "jdbc_persist"
            ],
            "W6 Friday Zero-AI Gate: 3 Raw SQL Queries + Manual JDBC Rollback",
            "Write 3 complex SQL queries cold + code a clean try/catch/rollback JDBC method.",
            "jdbc_prac",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "W6 Sat: Trees & BSTs Redo Sweep & Traversal Review",
            "Blank-file re-solve every Week 6 ~ Redo tree problem.",
            "jdsa_rev",
            1.5,
            "08:30–10:00",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_full_mocks"
            ],
            "FULL MULTI-SECTION NQT MOCK #1 (Quant + Reason + Verbal + 2 Code)",
            "3-hour full-length exam sitting combining r_mocks + Verbal Mixed + 2 timed Java coding Qs in one sitting!",
            "r_mocks",
            3.0,
            "11:00–14:00",
            "b2"
          ]
        ],
        []
      ]
    },
    {
      "id": 7,
      "month": 2,
      "title": "Mock #1 Blind Redo, Full NQT Mock #2, Heaps/Top-K & JDBC DAO/Migrations",
      "focus": [
        "Mock #1 Blind Redo (Mon)",
        "Full NQT Mock #2 (Sat)",
        "DSA Ch.7 PriorityQueue/Heaps",
        "JDBC DAO Finish (Wk 7)"
      ],
      "practiceTag": "Full NQT Mock #2 • Heaps • JDBC Finish • Gate #7",
      "targets": [
        {
          "id": "w7_t1",
          "track": "dsa",
          "text": "DSA Ch.7 Pt 1: PriorityQueue Idioms, Min/Max Heap & Top-K -> W7 Friday Zero-AI Gate: 2 Unseen Heap/PriorityQueue Java Qs."
        },
        {
          "id": "w7_t2",
          "track": "aptitude",
          "text": "Mock #1 Next-Study-Day Blind Re-Attempt of All Missed Questions -> FULL MULTI-SECTION NQT MOCK #2 (Quant + Reason + Verbal + 2 Code)."
        },
        {
          "id": "w7_t3",
          "track": "sql_cs",
          "text": "JDBC Ch.6–7: DAO Pattern, Schema Migrations & JDBC vs JPA & Friday raw SQL/CS proof."
        },
        {
          "id": "w7_t4",
          "track": "backend",
          "text": "Complete all 3 Friday Zero-AI Closed-Book Gates & Sunday 0h rest."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "DSA Ch.7 Pt 1: PriorityQueue Idioms, Min/Max Heap & Top-K",
            "Code Kth Largest, Top K Frequent & Custom Comparator PriorityQueue cold in Java.",
            "jdsa_guide",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_full_mocks"
            ],
            "Mock #1 Next-Study-Day Blind Re-Attempt of All Missed Questions",
            "Re-solve every missed/skipped Mock #1 Quant/Reason/Verbal Q WITHOUT looking at the solution first.",
            "r_mocks",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "jdbc_persist"
            ],
            "JDBC Ch.6–7: DAO Pattern, Schema Migrations & JDBC vs JPA",
            "Implement clean Repository/DAO interfaces separating SQL from service logic (jdbc_guide Ch.6–7).",
            "jdbc_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "DSA Ch.7 Pt 2: Merge K Sorted Lists & Two-Heaps Median",
            "Master K-way merge and balanced min/max heap streaming median from blank IDE.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_quant_core"
            ],
            "Adv Quant Ch.4: Clocks, Calendars & Compound Interest",
            "Study r_guide Ch.4: odd-days calendar trick, clock angle overlaps & CI-SI differences.",
            "r_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "jdbc_persist"
            ],
            "JDBC Practice Ch.6–8: DAO Unit Tests & Migration Scripts",
            "Complete final JDBC practice exercises verifying clean resource cleanup.",
            "jdbc_prac",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "DSA Ch.7 Pt 3: Task Scheduler & Greedy PriorityQueue Drills",
            "Solve Task Scheduler, Reorganize String & Meeting Rooms II zero-AI.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_verbal"
            ],
            "Verbal Mixed Set 04 Timed Run & RC Speed Strategy",
            "Complete Verbal Mixed Set 04 under strict timer; target >= 85% accuracy.",
            "vm_04",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "MySQL Interview Clinic: Gaps-and-Islands & Retention SQL",
            "Write 5 hard interview SQL queries raw in mysql CLI (zero hints).",
            "sql_prac",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "TCS NQT Stdin/Stdout Drill #7: Heap/Greedy & Simulation Coding",
            "45m timed 2-question NQT coding drill using PriorityQueue & custom comparators.",
            "java_cpa",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "jdbc_persist"
            ],
            "JDBC Capstone Synthesis: Connection Pool + DAO + Tx Checklist",
            "Consolidate JDBC notes ready for Week 11–12 Mini-Project 0.",
            "jdbc_guide",
            2.0,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "cs_os_dbms_cn"
            ],
            "OS Essentials Kickoff: Processes, Threads & Context Switching",
            "Start interview-focused OS (os_guide Ch.1–2): PCB, user vs kernel threads & CPU scheduling.",
            "os_guide",
            1.5,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph",
              "dsa_timed_loops"
            ],
            "W7 Friday Zero-AI Gate: 2 Unseen Heap/PriorityQueue Java Qs",
            "Closed-book blank-IDE proof verifying O(n log k) bounds & comparator safety.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_reason_di"
            ],
            "W7 Friday Zero-AI Gate: 25m Clocks/Calendars + Reasoning Set",
            "Timed mini-section verifying Adv Quant formulas before Mock #2.",
            "qm_06",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery",
              "jdbc_persist"
            ],
            "W7 Friday Zero-AI Gate: 3 Raw SQL Queries + JDBC DAO Design",
            "Write 3 unseen SQL queries cold + implement a parameterized JDBC DAO method.",
            "sql_prac",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "W7 Sat: Heaps & Trees Combined Redo Sweep",
            "Blank-file re-solve flagged Week 6–7 problems & review PriorityQueue traps.",
            "jdsa_rev",
            1.5,
            "08:30–10:00",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_full_mocks"
            ],
            "FULL MULTI-SECTION NQT MOCK #2 (Quant + Reason + Verbal + 2 Code)",
            "Full-length 3-hour timed exam sitting (Quant + Reasoning + Verbal + 2 unseen Java coding Qs).",
            "r_mocks",
            3.0,
            "11:00–14:00",
            "b2"
          ]
        ],
        []
      ]
    },
    {
      "id": 8,
      "month": 2,
      "title": "Mock #2 Blind Redo, Full NQT Mock #3, Graphs BFS/DFS/Topo & OS Essentials",
      "focus": [
        "Full NQT Mock #3 (Sat)",
        "DSA Ch.8 Graphs Pt 1",
        "OS Interview Essentials",
        "Friday Closed-Book Gate #8"
      ],
      "practiceTag": "Full NQT Mock #3 • Graphs Pt 1 • OS • Gate #8",
      "targets": [
        {
          "id": "w8_t1",
          "track": "dsa",
          "text": "DSA Ch.8 Pt 1: Graph Adjacency Lists, Grid BFS & Islands -> W8 Friday Zero-AI Gate: 2 Unseen BFS/DFS/Topo Java Problems."
        },
        {
          "id": "w8_t2",
          "track": "aptitude",
          "text": "Mock #2 Next-Study-Day Blind Re-Attempt of Missed Questions -> FULL MULTI-SECTION NQT MOCK #3 (Quant + Reason + Verbal + 2 Code)."
        },
        {
          "id": "w8_t3",
          "track": "sql_cs",
          "text": "OS Essentials: Synchronization, Mutex, Semaphores & Deadlocks & Friday raw SQL/CS proof."
        },
        {
          "id": "w8_t4",
          "track": "backend",
          "text": "Complete all 3 Friday Zero-AI Closed-Book Gates & Sunday 0h rest."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "DSA Ch.8 Pt 1: Graph Adjacency Lists, Grid BFS & Islands",
            "Code Number of Islands, Rotting Oranges & Clone Graph cold in Java.",
            "jdsa_guide",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_full_mocks"
            ],
            "Mock #2 Next-Study-Day Blind Re-Attempt of Missed Questions",
            "Blindly re-solve every Mock #2 miss before inspecting explanations; update trap log.",
            "r_mocks",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "cs_os_dbms_cn"
            ],
            "OS Essentials: Synchronization, Mutex, Semaphores & Deadlocks",
            "Focus strictly on interview OS (os_guide Ch.3–4): 4 Coffman conditions, banker intuition & race conditions.",
            "os_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "DSA Ch.8 Pt 2: Cycle Detection & Kahn Topological Sort",
            "Code Course Schedule I/II & Bipartite Graph check from blank file.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_quant_core"
            ],
            "Quant Mixed Set 06 Timed Speed Clinic (Target < 65s/Q)",
            "Drill high-frequency NQT Quant mixes targeting speed on Weak-List chapters.",
            "qm_06",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "cs_os_dbms_cn"
            ],
            "OS Essentials: Virtual Memory, Paging, TLB & Thrashing",
            "Interview-focused memory management (os_guide Ch.5–6): page faults, LRU replacement & heap vs stack.",
            "os_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "DSA Ch.8 Pt 3: Shortest Path in Unweighted Graphs & Word Ladder",
            "Solve Word Ladder & Shortest Path in Binary Matrix zero-AI using ArrayDeque.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_reason_di"
            ],
            "Reasoning Speed Clinic: Arrangements, Syllogisms & DS Mixed",
            "35-minute high-speed reasoning sprint fixing Mock #1–#2 bottlenecks.",
            "r_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "cs_os_dbms_cn"
            ],
            "OS Essentials: File Systems, System Calls & I/O Multiplexing",
            "Understand user/kernel mode switch, epoll/blocking vs non-blocking I/O for backend interviews.",
            "os_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "TCS NQT Stdin/Stdout Drill #8: Grid/Graph BFS Coding",
            "45m timed 2-question NQT coding drill handling 2D matrix stdin cleanly.",
            "java_cpa",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "cs_os_dbms_cn"
            ],
            "OS Interview Question Bank Rapid-Fire Recall",
            "Write concise 60-second verbal answers to top 15 OS interview questions from os_guide.",
            "os_guide",
            2.0,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "MySQL Timed Drill: 4 Multi-Table + Window Queries in 35m",
            "Keep raw mysql CLI fluency razor-sharp while focusing on Core CS.",
            "sql_prac",
            1.5,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph",
              "dsa_timed_loops"
            ],
            "W8 Friday Zero-AI Gate: 2 Unseen BFS/DFS/Topo Java Problems",
            "Closed-book blank-IDE coding proof; verify visited-on-enqueue BFS invariant.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_verbal"
            ],
            "W8 Friday Zero-AI Gate: 25m Timed Verbal Mixed Mini-Section",
            "Timed Verbal check (Error Detection + Para Jumbles + RC) ahead of Mock #3.",
            "vm_05",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery",
              "cs_os_dbms_cn"
            ],
            "W8 Friday Zero-AI Gate: 3 Raw SQL Queries + 5 Cold OS Qs",
            "Write 3 SQL queries cold in CLI + answer deadlock/paging/thread questions without notes.",
            "os_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "W8 Sat: Graphs Pt 1 Redo Sweep & Template Check",
            "Blank-file re-solve flagged Week 8 graph problems.",
            "jdsa_rev",
            1.5,
            "08:30–10:00",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_full_mocks"
            ],
            "FULL MULTI-SECTION NQT MOCK #3 (Quant + Reason + Verbal + 2 Code)",
            "Full 3-hour timed exam sitting (Quant + Reasoning + Verbal + 2 Java coding Qs).",
            "r_mocks",
            3.0,
            "11:00–14:00",
            "b2"
          ]
        ],
        []
      ]
    },
    {
      "id": 9,
      "month": 3,
      "title": "Mock #3 Blind Redo, Full NQT Mock #4, Dijkstra/DSU & DBMS Essentials",
      "focus": [
        "Full NQT Mock #4 (Sat)",
        "DSA Ch.8 Dijkstra & DSU",
        "DBMS B+ Trees & MVCC (No ARIES/2PC)",
        "Friday Closed-Book Gate #9"
      ],
      "practiceTag": "Full NQT Mock #4 • Dijkstra/DSU • DBMS • Gate #9",
      "targets": [
        {
          "id": "w9_t1",
          "track": "dsa",
          "text": "DSA Ch.8 Pt 4: Weighted Graphs & PriorityQueue Dijkstra -> W9 Friday Zero-AI Gate: 2 Unseen Dijkstra/DSU Java Problems."
        },
        {
          "id": "w9_t2",
          "track": "aptitude",
          "text": "Mock #3 Next-Study-Day Blind Re-Attempt of Missed Questions -> FULL MULTI-SECTION NQT MOCK #4 (Quant + Reason + Verbal + 2 Code)."
        },
        {
          "id": "w9_t3",
          "track": "sql_cs",
          "text": "DBMS Essentials: Keys, Normal Forms & Lossless Joins & Friday raw SQL/CS proof."
        },
        {
          "id": "w9_t4",
          "track": "backend",
          "text": "Complete all 3 Friday Zero-AI Closed-Book Gates & Sunday 0h rest."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "DSA Ch.8 Pt 4: Weighted Graphs & PriorityQueue Dijkstra",
            "Code Network Delay Time & Cheapest Flights K Stops cold in Java (stale-entry skip!).",
            "jdsa_guide",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_full_mocks"
            ],
            "Mock #3 Next-Study-Day Blind Re-Attempt of Missed Questions",
            "Blindly re-solve every missed/slow Mock #3 question; tighten time allocation per section.",
            "r_mocks",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "cs_os_dbms_cn"
            ],
            "DBMS Essentials: Keys, Normal Forms & Lossless Joins",
            "Interview-focused dbms_guide Ch.1–3: candidate keys, 3NF vs BCNF & anomaly prevention.",
            "dbms_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "DSA Ch.8 Pt 5: Disjoint Set Union (DSU) & Kruskal MST",
            "Implement Union-Find with path compression + union by rank; solve Redundant Connection & Accounts Merge.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_quant_core"
            ],
            "Quant Mixed Set 07 Timed Sprint + P&C/DI Weak-Spot Fix",
            "Target >= 88% accuracy under 60s/Q on Quant Mixed Set 07.",
            "qm_07",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "cs_os_dbms_cn"
            ],
            "DBMS Essentials: ACID, Serialisability, 2PL & MVCC (Skip ARIES/2PC)",
            "Focus strictly on interview transaction/locking & MVCC concepts in dbms_guide Ch.4–5 (skip ARIES/2PC).",
            "dbms_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "Graphs Full Synthesis: Choosing BFS vs Dijkstra vs DSU",
            "Solve 2 mixed unseen graph problems cold in 45m.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_verbal"
            ],
            "Verbal Mixed Set 05 Full Timed Sitting & Trap Review",
            "Complete Verbal Mixed Set 05 under strict NQT verbal pacing.",
            "vm_05",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "cs_os_dbms_cn"
            ],
            "DBMS Essentials: B+ Trees, Clustered vs Secondary Indexes & Joins",
            "Study dbms_guide Ch.7–8: why B+ trees beat BSTs on disk, covering indexes & hash vs merge joins.",
            "dbms_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "TCS NQT Stdin/Stdout Drill #9: Weighted Graph & DSU Coding",
            "45m timed 2-question NQT coding drill with fast edge-list parsing.",
            "java_cpa",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "cs_os_dbms_cn"
            ],
            "DBMS Interview Q&A Rapid-Fire Recall (Indexing, ACID, Norm)",
            "Rehearse crisp answers to top 15 DBMS interview questions without notes.",
            "dbms_guide",
            2.0,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "MySQL EXPLAIN + Locking Hands-On Verification",
            "Verify B+ tree range scans & REPEATABLE READ snapshots directly in mysql CLI.",
            "sql_rev",
            1.5,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph",
              "dsa_timed_loops"
            ],
            "W9 Friday Zero-AI Gate: 2 Unseen Dijkstra/DSU Java Problems",
            "Closed-book blank-IDE coding proof verifying stale-pair skip & DSU rank.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_reason_di"
            ],
            "W9 Friday Zero-AI Gate: 25m Timed Mixed Quant + DI Mini-Set",
            "High-pressure 25m section simulating NQT time crunch.",
            "qm_07",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery",
              "cs_os_dbms_cn"
            ],
            "W9 Friday Zero-AI Gate: 3 Raw SQL Queries + 5 Cold DBMS Qs",
            "Write 3 raw SQL queries cold + defend B+ trees, MVCC & BCNF verbally.",
            "dbms_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "W9 Sat: Graphs Complete Redo Sweep (BFS/Dijkstra/DSU)",
            "Blank-file re-solve flagged Week 8–9 graph problems.",
            "jdsa_rev",
            1.5,
            "08:30–10:00",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_full_mocks"
            ],
            "FULL MULTI-SECTION NQT MOCK #4 (Quant + Reason + Verbal + 2 Code)",
            "Full 3-hour timed exam sitting (Quant + Reasoning + Verbal + 2 unseen Java coding Qs).",
            "r_mocks",
            3.0,
            "11:00–14:00",
            "b2"
          ]
        ],
        []
      ]
    },
    {
      "id": 10,
      "month": 3,
      "title": "Mock #4 Blind Redo, Full NQT Mock #5, Core DP (Ch.9) & Computer Networks",
      "focus": [
        "Full NQT Mock #5 (Sat)",
        "DSA Ch.9 Core DP",
        "CN TCP/HTTP/DNS/TLS",
        "Friday Closed-Book Gate #10"
      ],
      "practiceTag": "Full NQT Mock #5 • Core DP • CN • Gate #10",
      "targets": [
        {
          "id": "w10_t1",
          "track": "dsa",
          "text": "DSA Ch.9 Pt 1: 1D DP State Design (Climb, Robber, Coin Change) -> W10 Friday Zero-AI Gate: 2 Unseen 1D/2D DP Java Problems."
        },
        {
          "id": "w10_t2",
          "track": "aptitude",
          "text": "Mock #4 Next-Study-Day Blind Re-Attempt of Missed Questions -> FULL MULTI-SECTION NQT MOCK #5 (Quant + Reason + Verbal + 2 Code)."
        },
        {
          "id": "w10_t3",
          "track": "sql_cs",
          "text": "CN Essentials: OSI/TCP-IP, DNS Resolution & TCP 3-Way Handshake & Friday raw SQL/CS proof."
        },
        {
          "id": "w10_t4",
          "track": "backend",
          "text": "Complete all 3 Friday Zero-AI Closed-Book Gates & Sunday 0h rest."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "DSA Ch.9 Pt 1: 1D DP State Design (Climb, Robber, Coin Change)",
            "Define DP state & transition on paper first; code memoization -> bottom-up tabulation cold.",
            "jdsa_guide",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_full_mocks"
            ],
            "Mock #4 Next-Study-Day Blind Re-Attempt of Missed Questions",
            "Blindly re-solve every Mock #4 miss; track accuracy climb across Mocks #1–#4.",
            "r_mocks",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "cs_os_dbms_cn"
            ],
            "CN Essentials: OSI/TCP-IP, DNS Resolution & TCP 3-Way Handshake",
            "Study interview-focused cn_guide Ch.1–4: SYN/ACK, flow vs congestion control & TIME_WAIT.",
            "cn_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "DSA Ch.9 Pt 2: 0/1 Knapsack, Partition Subset & Target Sum",
            "Master backward 1D space optimization for 0/1 knapsack vs forward for unbounded.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_quant_core"
            ],
            "Quant Mixed Set 08 Timed Sprint + Formula Sheet Review",
            "35m timed mixed drill + review r_guide Ch.7 shortcuts & exam strategy.",
            "qm_08",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "cs_os_dbms_cn"
            ],
            "CN Essentials: HTTP/1.1 vs HTTP/2, REST Status Codes, Cookies & CORS",
            "Trace exact browser request lifecycle, idempotent HTTP methods & preflight OPTIONS.",
            "cn_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "DSA Ch.9 Pt 3: 2D Grid DP, LCS, Edit Distance & LIS",
            "Code LCS, Edit Distance & O(n log n) LIS patience sort cold in Java.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_verbal"
            ],
            "Verbal Mixed Set 06 Full Timed Sitting (Final Verbal Set)",
            "Complete final Verbal Mixed Set 06 under strict NQT verbal timer.",
            "vm_06",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "cs_os_dbms_cn"
            ],
            "CN Essentials: TLS Handshake, HTTPS Certificates & Reverse Proxies",
            "Understand asymmetric key exchange -> symmetric session key, SNI & load balancer L4 vs L7.",
            "cn_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "TCS NQT Stdin/Stdout Drill #10: Dynamic Programming Coding",
            "45m timed 2-question NQT coding drill (1D/2D DP with long/MOD guards).",
            "java_cpa",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "cs_os_dbms_cn"
            ],
            "CN + OS + DBMS Combined Core CS Interview Rapid-Fire",
            "Answer 'What happens when you type a URL?' + 10 OS/DBMS/CN questions cold.",
            "cn_guide",
            2.0,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "MySQL Combined Speed Drill: 5 Interview Queries in 40m",
            "Timed raw mysql CLI drill covering joins, CTEs, windows & EXPLAIN.",
            "sql_prac",
            1.5,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph",
              "dsa_timed_loops"
            ],
            "W10 Friday Zero-AI Gate: 2 Unseen 1D/2D DP Java Problems",
            "Closed-book blank-IDE coding proof; write recurrence on paper before coding.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_reason_di"
            ],
            "W10 Friday Zero-AI Gate: 25m High-Speed Reasoning + DI Gate",
            "Strict timed NQT reasoning & DI speed check ahead of Mock #5.",
            "r_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery",
              "cs_os_dbms_cn"
            ],
            "W10 Friday Zero-AI Gate: 3 Raw SQL Queries + 5 Cold CN Qs",
            "Write 3 SQL queries cold + explain TCP/HTTP/TLS/DNS without notes.",
            "cn_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "W10 Sat: Core DP Redo Sweep & State-Transition Audit",
            "Re-solve Week 10 ~ Redo DP problems cold and review jdsa_rev Ch.9.",
            "jdsa_rev",
            1.5,
            "08:30–10:00",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_full_mocks"
            ],
            "FULL MULTI-SECTION NQT MOCK #5 (Quant + Reason + Verbal + 2 Code)",
            "Full 3-hour timed exam sitting (Quant + Reasoning + Verbal + 2 unseen Java coding Qs).",
            "r_mocks",
            3.0,
            "11:00–14:00",
            "b2"
          ]
        ],
        []
      ]
    },
    {
      "id": 11,
      "month": 3,
      "title": "Mock #5 Blind Redo, Full NQT Mock #6, Java Concurrency & Mini-Project 0 Start",
      "focus": [
        "Full NQT Mock #6 (Sat)",
        "Java Concurrency Core",
        "Mini-Project 0 (Pure JDBC)",
        "DSA Ch.1–9 Mixed NQT"
      ],
      "practiceTag": "Full NQT Mock #6 • Concurrency • Mini-Proj 0 • Gate #11",
      "targets": [
        {
          "id": "w11_t1",
          "track": "dsa",
          "text": "DSA Ch.1–9 Mixed Zero-AI Sprint #1 (Arrays + Graphs) -> W11 Friday Zero-AI Gate: 2 Unseen NQT Prime Java Coding Qs."
        },
        {
          "id": "w11_t2",
          "track": "aptitude",
          "text": "Mock #5 Next-Study-Day Blind Re-Attempt of Missed Questions -> FULL MULTI-SECTION NQT MOCK #6 (Quant + Reason + Verbal + 2 Code)."
        },
        {
          "id": "w11_t3",
          "track": "sql_cs",
          "text": "Java Concurrency Core: Atomicity, Visibility, volatile & synchronized & Friday raw SQL/CS proof."
        },
        {
          "id": "w11_t4",
          "track": "backend",
          "text": "Mini-Project 0 / Concurrency sprint + Complete all 3 Friday Zero-AI Closed-Book Gates & Sunday 0h rest."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "DSA Ch.1–9 Mixed Zero-AI Sprint #1 (Arrays + Graphs)",
            "Solve 2 unseen Mediums (1 Sliding Window + 1 Graph) in 45m plain IDE.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_full_mocks"
            ],
            "Mock #5 Next-Study-Day Blind Re-Attempt of Missed Questions",
            "Blindly re-solve every Mock #5 miss; verify zero careless arithmetic slips.",
            "r_mocks",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_conc_sec"
            ],
            "Java Concurrency Core: Atomicity, Visibility, volatile & synchronized",
            "Study conc_guide Ch.1–3: race conditions, JMM happens-before & deadlock prevention.",
            "conc_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "DSA Ch.1–9 Mixed Zero-AI Sprint #2 (Trees + DP)",
            "Solve 2 unseen Mediums (1 Binary Tree + 1 1D/2D DP) in 45m plain IDE.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_quant_core",
              "apt_reason_di"
            ],
            "NQT Weak-Chapter Surgical Drill #1 (Top 3 Miss Categories)",
            "Drill ONLY the 3 highest-error topics across Mocks #1–#5 under strict timer.",
            "r_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_conc_sec"
            ],
            "Java Concurrency Core: ReentrantLock, ConcurrentHashMap & Executors",
            "Study conc_guide Ch.4–6: ExecutorService thread pools, CompletableFuture & atomic counters.",
            "conc_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "TCS NQT Prime-Level 2-Q Timed Coding Simulation #11",
            "45m strict NQT Prime coding sim (1 Easy-Med + 1 Hard-Med stdin/stdout).",
            "java_cpa",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_verbal"
            ],
            "NQT Verbal & RC High-Accuracy Polish (30m Timed)",
            "Sharpen Reading Comprehension pacing & Error Detection rules before Mock #6.",
            "v_07",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_conc_sec"
            ],
            "Mini-Project 0 Kickoff: Pure Java + HikariCP JDBC Schema & DAOs",
            "Read java_zeroai Ch.2.1; build MySQL schema + PreparedStatement DAOs with zero Spring.",
            "java_zeroai",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "Java Quick Revision (java_rev) & DSA 14p Revision Pass #1",
            "Cover every Java collection, comparator & DSA template in jdsa_rev.",
            "jdsa_rev",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery",
              "cs_os_dbms_cn"
            ],
            "Core CS + MySQL Quick Recall Drill (OS/DBMS/CN + 3 SQL)",
            "Keep Phase 1 SQL & Core CS warm with a 90m timed recall check.",
            "sql_rev",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_conc_sec"
            ],
            "Mini-Project 0 Service Layer: Manual setAutoCommit(false) Transfers",
            "Implement constructor-injected Service handling atomic JDBC debit/credit & rollback.",
            "java_zeroai",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "W11 Friday Zero-AI Gate: 2 Unseen NQT Prime Java Coding Qs",
            "Closed-book blank-IDE timed proof with custom stdin edge tests.",
            "java_cpa",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_full_mocks"
            ],
            "W11 Friday Zero-AI Gate: 25m Timed NQT Mixed Mini-Exam",
            "Strict exam-speed check across Quant, Reasoning & Verbal.",
            "qm_01",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_conc_sec"
            ],
            "W11 Friday Zero-AI Gate: Thread-Safe Counter + Raw JDBC Rollback",
            "Closed-book proof: fix a race condition with ReentrantLock/AtomicLong + prove JDBC rollback.",
            "conc_prac",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "W11 Sat: Phase 1 Redo Queue Sweep (Top 5 Tricky Patterns)",
            "Blank-file re-solve remaining flagged DSA problems from Weeks 1–11.",
            "jdsa_rev",
            1.5,
            "08:30–10:00",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_full_mocks"
            ],
            "FULL MULTI-SECTION NQT MOCK #6 (Quant + Reason + Verbal + 2 Code)",
            "Full 3-hour timed exam sitting simulating exact TCS NQT Digital/Prime exam conditions.",
            "r_mocks",
            3.0,
            "11:00–14:00",
            "b2"
          ]
        ],
        []
      ]
    },
    {
      "id": 12,
      "month": 3,
      "title": "NQT Peak (Full Mock #7), Mini-Project 0 Shipped & Phase 1 Graduation",
      "focus": [
        "Full NQT Mock #7 (Peak)",
        "Ship Mini-Project 0 (Pure JDBC)",
        "DSA Ch.1–9 Final Proof",
        "Retire Daily Aptitude"
      ],
      "practiceTag": "Full NQT Mock #7 • Mini-Proj 0 Done • Phase 1 Peak",
      "targets": [
        {
          "id": "w12_t1",
          "track": "dsa",
          "text": "DSA Ch.1–9 Mixed Zero-AI Sprint #3 (Binary Search + Stacks + Heaps) -> W12 Friday Zero-AI Gate: Final Phase-1 2-Q Timed Coding Proof."
        },
        {
          "id": "w12_t2",
          "track": "aptitude",
          "text": "Mock #6 Next-Study-Day Blind Re-Attempt of Missed Questions -> FULL MULTI-SECTION NQT MOCK #7 (Final Phase-1 Graduation Exam)."
        },
        {
          "id": "w12_t3",
          "track": "sql_cs",
          "text": "Mini-Project 0: Concurrent Transfer Stress Test (ExecutorService) & Friday raw SQL/CS proof."
        },
        {
          "id": "w12_t4",
          "track": "backend",
          "text": "Mini-Project 0 / Concurrency sprint + Complete all 3 Friday Zero-AI Closed-Book Gates & Sunday 0h rest."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "DSA Ch.1–9 Mixed Zero-AI Sprint #3 (Binary Search + Stacks + Heaps)",
            "Solve 2 unseen Mediums in 45m plain IDE with spoken complexity bounds.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_full_mocks"
            ],
            "Mock #6 Next-Study-Day Blind Re-Attempt of Missed Questions",
            "Blindly re-solve every Mock #6 miss and finalize your NQT exam-day time strategy.",
            "r_mocks",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_conc_sec"
            ],
            "Mini-Project 0: Concurrent Transfer Stress Test (ExecutorService)",
            "Write 10-thread JUnit 5 test proving concurrent JDBC transfers never overdraft balances.",
            "java_zeroai",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "DSA Ch.1–9 Mixed Zero-AI Sprint #4 (Graphs + DP)",
            "Solve 2 unseen Mediums in 45m plain IDE; confirm clean Java code style.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_quant_core",
              "apt_reason_di"
            ],
            "NQT Exam-Day Shortcut & Formula Sheet Final Sweep",
            "Review r_guide Ch.7 strategy, percentage/fraction table, Venn & DI elimination rules.",
            "r_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_conc_sec"
            ],
            "Mini-Project 0: SQLi Regression Test & Clean CLI Packaging",
            "Add JUnit 5 test proving SQLi input is safely neutralized + clean README explaining JDBC vs Spring.",
            "java_zeroai",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "TCS NQT Prime Final Dress Rehearsal #12 (2-Q Timed)",
            "Full 55m timed NQT coding dress rehearsal (BufferedReader, long overflow, edge cases).",
            "java_cpa",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_verbal"
            ],
            "NQT Verbal Final Polish: High-Frequency Error & RC Patterns",
            "Final 45m calm review of grammar checklist & RC pacing rules.",
            "v_03",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_conc_sec"
            ],
            "SHIP Mini-Project 0 & Document What Spring Boot Automates",
            "Push clean Mini-Project 0 repo; list the 5 boilerplate pains (pooling, Tx, DI, mapping, config) Spring solves.",
            "java_zeroai",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "DSA in Java 14p Quick Revision Final Phase-1 Mastery Check",
            "Cold-recall every pattern template from jdsa_rev without peeking.",
            "jdsa_rev",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery",
              "cs_os_dbms_cn"
            ],
            "Phase 1 SQL + JDBC + Core CS Final Consolidation",
            "Verify 100% fluency on MySQL 1–16, JDBC & OS/DBMS/CN before Phase 2.",
            "sql_rev",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_conc_sec"
            ],
            "Phase 2 Security-First Prep: Reading Threat Models & Crypto Basics",
            "Skim sec_guide Ch.1 roadmap so Week 13 hits the ground running.",
            "sec_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "W12 Friday Zero-AI Gate: Final Phase-1 2-Q Timed Coding Proof",
            "Closed-book blank-IDE coding proof confirming Digital/Prime coding readiness.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_full_mocks"
            ],
            "W12 Friday Zero-AI Gate: Final 25m NQT Speed & Accuracy Check",
            "Final pre-Mock #7 warm-up confirming calm pacing.",
            "qm_08",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_conc_sec"
            ],
            "W12 Friday Zero-AI Gate: Mini-Project 0 Live Code Walkthrough",
            "Run all Mini-Project 0 JUnit/JDBC tests cleanly & explain manual Tx rollback without notes.",
            "java_zeroai",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "W12 Sat: Zero Out Phase 1 DSA Redo Queue",
            "Confirm zero pending Phase 1 Redo items before Phase 2 starts Monday.",
            "jdsa_rev",
            1.5,
            "08:30–10:00",
            "b1"
          ],
          [
            "aptitude",
            [
              "apt_full_mocks"
            ],
            "FULL MULTI-SECTION NQT MOCK #7 (Final Phase-1 Graduation Exam)",
            "7th and final full 3-hour multi-section NQT exam sitting — graduate to Phase 2 Java Backend!",
            "r_mocks",
            3.0,
            "11:00–14:00",
            "b2"
          ]
        ],
        []
      ]
    },
    {
      "id": 13,
      "month": 4,
      "title": "Security First (Crypto/BCrypt/JWT), Git Internals & Gate J1.1",
      "focus": [
        "Security Engineering First (W13–14)",
        "Gate J1.1 Password + JWT Utility",
        "Git Internals & Rebase",
        "45m Zero-AI Med Loop #1"
      ],
      "practiceTag": "J1.1 • Security First • Git Internals",
      "targets": [
        {
          "id": "w13_t1",
          "track": "dsa",
          "text": "P2 W13 Mon: 45m Zero-AI Med Loop — Arrays & Prefix Hashing + W13 Fri Loop #1: Timed 45m Zero-AI Medium Coding Interview."
        },
        {
          "id": "w13_t2",
          "track": "aptitude",
          "text": "Phase 1 NQT retired (0h/wk scheduled; protect 100% Sunday cognitive rest)."
        },
        {
          "id": "w13_t3",
          "track": "sql_cs",
          "text": "Git Internals Ch.1–3: Objects, Commits, Merge vs Rebase & Reflog + W13 Fri Recall: 3 Raw SQL Queries + Git Recovery Check."
        },
        {
          "id": "w13_t4",
          "track": "backend",
          "text": "Pass ZERO-AI PROOF GATE J1.1: BCrypt/Argon2 & Tamper-Proof JWT Utility & ship W13 Sat Deep Lab: Security Practice Exercises (Crypto & Auth)."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_nqt_core",
              "dsa_timed_loops"
            ],
            "P2 W13 Mon: 45m Zero-AI Med Loop — Arrays & Prefix Hashing",
            "Solve 2 unseen Mediums cold in blank IDE + 15m complexity/edge-case audit.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "cs_git_linux"
            ],
            "Git Internals Ch.1–3: Objects, Commits, Merge vs Rebase & Reflog",
            "Practice interactive rebase, cherry-pick & reflog recovery in a real repo (git_guide).",
            "git_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_conc_sec"
            ],
            "Security First Ch.1: Hashes, HMAC, AES-GCM & Constant-Time Compare",
            "Study sec_guide Ch.1–2 BEFORE Spring Security; understand why MessageDigest.isEqual prevents timing leaks.",
            "sec_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_nqt_core"
            ],
            "P2 W13 Tue: Sliding Window Hard-Medium Blank-IDE Drill",
            "Solve Subarrays with K Different Integers & Longest Repeating Char Replacement cold.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "P2 W13 Tue: Interview SQL Recall — Multi-Level Aggregations",
            "Solve 4 unseen analytics/window queries raw in mysql CLI.",
            "sql_prac",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_conc_sec"
            ],
            "Security First Ch.2: Argon2id & BCrypt Salted Password Hashing",
            "Implement PasswordService in plain Java with work-factor tuning and unique per-user salts.",
            "sec_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_nqt_core"
            ],
            "P2 W13 Wed: Binary Search on Answer & Rotated Array Variants",
            "Code Split Array Largest Sum & Find Minimum in Rotated Array II zero-AI.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "backend",
            [
              "be_conc_sec"
            ],
            "Security First Ch.3: JWT Structure, HS256 Pinning & Refresh Rotation",
            "Build pure-Java JwtService rejecting expired, tampered & alg:none tokens (sec_guide Ch.3).",
            "sec_guide",
            2.0,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_conc_sec"
            ],
            "Security Practice: Unit Testing Password & JWT Failure Modes",
            "Write 8 JUnit 5 tests covering expired JWT, wrong signature, tampered claims & weak secret rejection.",
            "sec_prac",
            1.5,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_nqt_core"
            ],
            "P2 W13 Thu: Interval Scheduling & Sweep-Line Variants",
            "Solve Insert Interval & Minimum Arrows to Burst Balloons blank-IDE.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "cs_git_linux"
            ],
            "Git Team Workflows: Clean PR Commits, Bisect & Conflict Resolution",
            "Run git bisect on a buggy commit history and practice clean squash/rebase PR hygiene.",
            "git_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_conc_sec"
            ],
            "Security First Ch.4: TLS, Key Management & Zero Secrets in Git",
            "Study env-based secret loading, key rotation & pre-commit secret hygiene (sec_guide Ch.4–5).",
            "sec_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "W13 Fri Loop #1: Timed 45m Zero-AI Medium Coding Interview",
            "2 unseen Array/Search Mediums with spoken approach before typing + edge tests.",
            "mock_work",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery",
              "cs_git_linux"
            ],
            "W13 Fri Recall: 3 Raw SQL Queries + Git Recovery Check",
            "Timed SQL CLI drill + explain rebase vs merge & reflog cold.",
            "sql_rev",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_conc_sec"
            ],
            "ZERO-AI PROOF GATE J1.1: BCrypt/Argon2 & Tamper-Proof JWT Utility",
            "Mandatory Friday blank-IDE gate (AI OFF): PasswordService + HS256 JwtService with 8 passing JUnit 5 tests.",
            "java_zeroai",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "W13 Sat: Arrays/Search Redo Sweep & Java Collections Audit",
            "Blank-file re-solve every Week 13 ~ Redo item.",
            "jdsa_rev",
            1.5,
            "08:30–10:00",
            "b1"
          ],
          [
            "backend",
            [
              "be_conc_sec"
            ],
            "W13 Sat Deep Lab: Security Practice Exercises (Crypto & Auth)",
            "Solve 6 hands-on crypto/JWT exercises from sec_prac and harden your reusable auth module.",
            "sec_prac",
            3.0,
            "11:00–14:00",
            "b2"
          ]
        ],
        []
      ]
    },
    {
      "id": 14,
      "month": 4,
      "title": "Security First Pt 2 (OWASP/IDOR/CORS), Linux Diagnostics & Gate J1.2",
      "focus": [
        "OWASP Top 10 & IDOR/SQLi",
        "Gate J1.2 Security Hardening",
        "Linux Server Diagnostics",
        "45m Zero-AI Med Loop #2"
      ],
      "practiceTag": "J1.2 • OWASP/IDOR/CORS • Linux",
      "targets": [
        {
          "id": "w14_t1",
          "track": "dsa",
          "text": "P2 W14 Mon: Linked List Hard-Mediums (Copy Random & Reverse K) + W14 Fri Loop #2: Timed 45m Zero-AI Medium Coding Interview."
        },
        {
          "id": "w14_t2",
          "track": "aptitude",
          "text": "Phase 1 NQT retired (0h/wk scheduled; protect 100% Sunday cognitive rest)."
        },
        {
          "id": "w14_t3",
          "track": "sql_cs",
          "text": "Linux Essentials Ch.1–3: Files, Permissions, grep/awk & Pipes + W14 Fri Recall: 3 Raw SQL Queries + Linux Process/Port Check."
        },
        {
          "id": "w14_t4",
          "track": "backend",
          "text": "Pass ZERO-AI PROOF GATE J1.2: OWASP IDOR, SQLi & CORS Hardening & ship W14 Sat Deep Lab: Security Threat-Model Audit & Project 1 Spec."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_lin_rec"
            ],
            "P2 W14 Mon: Linked List Hard-Mediums (Copy Random & Reverse K)",
            "Code Copy List with Random Pointer & Reverse Nodes in k-Group cold in Java.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "cs_git_linux"
            ],
            "Linux Essentials Ch.1–3: Files, Permissions, grep/awk & Pipes",
            "Practice log-file filtering, chmod/chown & pipeline troubleshooting in bash (linux_guide).",
            "linux_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_conc_sec"
            ],
            "Security Ch.7: OWASP Top 10 — Broken Access Control & IDOR",
            "Study sec_guide OWASP chapter; attack and fix userId path-parameter IDOR in toy Java endpoints.",
            "sec_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_lin_rec"
            ],
            "P2 W14 Tue: Monotonic Stack & Expression Parsing Drills",
            "Solve Basic Calculator II & Asteroid Collision blank-IDE.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "P2 W14 Tue: Interview SQL Recall — Anti-Joins & Recursive CTEs",
            "Solve 4 unseen CTE/anti-join queries raw in mysql CLI.",
            "sql_prac",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_conc_sec"
            ],
            "Security Ch.7–8: SQL Injection, XSS, CSRF & Strict CORS Policies",
            "Contrast cookie-based CSRF vs Bearer JWT CORS rules; implement explicit origin allowlist.",
            "sec_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_lin_rec"
            ],
            "P2 W14 Wed: Backtracking & Pruning Optimization Drills",
            "Solve Combination Sum II & Restore IP Addresses zero-AI.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "backend",
            [
              "be_conc_sec"
            ],
            "Security Practice: Payment/Webhook HMAC & Audit Logging",
            "Study sec_guide Ch.6 (HMAC signatures, idempotency, PII-safe audit logs).",
            "sec_guide",
            2.0,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_conc_sec"
            ],
            "Hardening Lab: Attack & Patch Vulnerable JDBC/HTTP Endpoints",
            "Write automated JUnit tests reproducing SQLi & IDOR first, then make them pass after hardening.",
            "sec_prac",
            1.5,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_lin_rec"
            ],
            "P2 W14 Thu: LRU Cache Design (Doubly-Linked List + HashMap)",
            "Code O(1) LRU Cache from a blank Java file without using LinkedHashMap shortcut.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "cs_git_linux"
            ],
            "Linux Essentials Ch.4–6: Processes, Ports (ss/lsof), Signals & Logs",
            "Inspect running JVM processes, open ports, systemd/journal logs & curl diagnostics.",
            "linux_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_conc_sec"
            ],
            "Spring Boot Prep: How Spring Security Maps Onto Raw Auth Concepts",
            "Map FilterChain, SecurityContextHolder & PasswordEncoder directly to Weeks 13–14 fundamentals.",
            "sec_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "W14 Fri Loop #2: Timed 45m Zero-AI Medium Coding Interview",
            "2 unseen Linked List/Stack Mediums under strict 45m interview simulation.",
            "mock_work",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery",
              "cs_git_linux"
            ],
            "W14 Fri Recall: 3 Raw SQL Queries + Linux Process/Port Check",
            "Timed SQL CLI drill + diagnose a simulated port-conflict/zombie process scenario.",
            "linux_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_conc_sec"
            ],
            "ZERO-AI PROOF GATE J1.2: OWASP IDOR, SQLi & CORS Hardening",
            "Mandatory Friday blank-IDE gate (AI OFF): patch vulnerable endpoint with PreparedStatement, principal check, strict CORS & regression tests.",
            "java_zeroai",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_lin_rec"
            ],
            "W14 Sat: Lists/Stacks/Backtracking Redo Sweep",
            "Blank-file re-solve Week 14 ~ Redo items and review ArrayDeque idioms.",
            "jdsa_rev",
            1.5,
            "08:30–10:00",
            "b1"
          ],
          [
            "backend",
            [
              "be_conc_sec"
            ],
            "W14 Sat Deep Lab: Security Threat-Model Audit & Project 1 Spec",
            "Lock Flagship Project 1 domain (Smart-Meter or Order/Inventory) & threat-model every endpoint.",
            "java_zeroai",
            3.0,
            "11:00–14:00",
            "b2"
          ]
        ],
        []
      ]
    },
    {
      "id": 15,
      "month": 4,
      "title": "Spring Boot Wk 1/4: DI/Beans, REST Validation, ProblemDetail & Gate J2.1",
      "focus": [
        "Spring Boot 4-Wk Sprint (1/4)",
        "DI, REST DTOs & @Valid",
        "MockMvc Slice Tests",
        "Gate J2.1 REST Vertical Slice"
      ],
      "practiceTag": "J2.1 • Spring Boot 1/4 • Project 1 Init",
      "targets": [
        {
          "id": "w15_t1",
          "track": "dsa",
          "text": "P2 W15 Mon: Binary Tree Construction & Serialization Drills + W15 Fri Loop #3: Timed 45m Zero-AI Medium Coding Interview."
        },
        {
          "id": "w15_t2",
          "track": "aptitude",
          "text": "Phase 1 NQT retired (0h/wk scheduled; protect 100% Sunday cognitive rest)."
        },
        {
          "id": "w15_t3",
          "track": "sql_cs",
          "text": "P2 W15 Mon: PostgreSQL vs MySQL Syntax & Integer-Paise DDL + W15 Fri Recall: 3 Postgres/MySQL Schema & Constraint Drills."
        },
        {
          "id": "w15_t4",
          "track": "backend",
          "text": "Pass ZERO-AI PROOF GATE J2.1: Spring REST CRUD, @Valid & ProblemDetail & ship W15 Sat Flagship Project 1 Sprint: Core Domain & OpenAPI Swagger."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "P2 W15 Mon: Binary Tree Construction & Serialization Drills",
            "Code Build Tree from Preorder/Inorder & Serialize/Deserialize Binary Tree cold.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "P2 W15 Mon: PostgreSQL vs MySQL Syntax & Integer-Paise DDL",
            "Review Postgres SERIAL/BIGSERIAL, TIMESTAMPTZ, CHECK constraints & JSONB basics.",
            "sql_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_spring_proj1"
            ],
            "Spring Boot Ch.1–2: IoC Container, Beans, Scopes & Proxy Mechanics",
            "Study be_guide Ch.1–2; understand constructor injection, @Configuration & why field injection hurts testing.",
            "be_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "P2 W15 Tue: Binary Tree Max Path Sum & Vertical Order",
            "Solve 2 hard-medium tree traversals blank-IDE with clean recursion helpers.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "P2 W15 Tue: Interview SQL Recall — Window Frames & Running Sums",
            "Solve 4 unseen window SQL exercises cold.",
            "sql_prac",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_spring_proj1"
            ],
            "Spring Boot Ch.3: REST Controllers, Java Record DTOs & @Valid",
            "Bootstrap Flagship Project 1; build strict Java record request/response DTOs & Jakarta validation.",
            "be_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "P2 W15 Wed: BST Iterator & Delete Node in BST",
            "Implement O(h)-space BSTIterator & BST deletion cleanly in Java.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "backend",
            [
              "be_spring_proj1"
            ],
            "Global @RestControllerAdvice & RFC-7807 ProblemDetail Errors",
            "Centralize validation, 404, 409 & 500 error responses without leaking stack traces.",
            "be_guide",
            2.0,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_spring_proj1"
            ],
            "Software Testing Ch.1–3: JUnit 5 Parameterized Tests & Mockito",
            "Study test_guide Ch.1–3; write fast unit tests for Flagship Project 1 domain services.",
            "test_guide",
            1.5,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "P2 W15 Thu: Heaps & Two-Heaps Streaming Interview Drills",
            "Solve Find Median from Data Stream & K Closest Points cold.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "cs_os_dbms_cn"
            ],
            "P2 W15 Thu: Core CS Recall — OS Threads & HTTP REST Semantics",
            "Quick 90m review of idempotent HTTP methods (PUT/DELETE vs POST) & servlet thread pools.",
            "cn_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_spring_proj1"
            ],
            "Testing Slice: @WebMvcTest Controller Validation & Error Contracts",
            "Write MockMvc tests verifying 201 Created, 400 ProblemDetail validation & 404 responses.",
            "test_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "W15 Fri Loop #3: Timed 45m Zero-AI Medium Coding Interview",
            "2 unseen Tree/Heap Mediums under strict interview timer.",
            "mock_work",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "W15 Fri Recall: 3 Postgres/MySQL Schema & Constraint Drills",
            "Write 3 DDL + composite index queries cold.",
            "sql_prac",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_spring_proj1"
            ],
            "ZERO-AI PROOF GATE J2.1: Spring REST CRUD, @Valid & ProblemDetail",
            "Mandatory Friday blank-IDE gate (AI OFF): Controller->Service->Repo with record DTOs, ProblemDetail & passing @WebMvcTest.",
            "java_zeroai",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "W15 Sat: Trees/Heaps Redo Sweep & Edge-Case Audit",
            "Re-solve Week 15 ~ Redo items cold.",
            "jdsa_rev",
            1.5,
            "08:30–10:00",
            "b1"
          ],
          [
            "backend",
            [
              "be_spring_proj1"
            ],
            "W15 Sat Flagship Project 1 Sprint: Core Domain & OpenAPI Swagger",
            "Wire Springdoc OpenAPI (/swagger-ui.html) and build core catalog/meter endpoints cleanly.",
            "be_prac",
            3.0,
            "11:00–14:00",
            "b2"
          ]
        ],
        []
      ]
    },
    {
      "id": 16,
      "month": 4,
      "title": "Spring Boot Wk 2/4: JPA/Hibernate N+1, @Transactional, Flyway & Gate J2.2",
      "focus": [
        "Spring Boot 4-Wk Sprint (2/4)",
        "JPA N+1 Fix + @EntityGraph",
        "@Transactional Proxy Traps",
        "Gate J2.2 N+1 & Rollback"
      ],
      "practiceTag": "J2.2 • Spring Boot 2/4 • JPA & Flyway",
      "targets": [
        {
          "id": "w16_t1",
          "track": "dsa",
          "text": "P2 W16 Mon: Graph DFS/BFS & Multi-Source Grid Drills + W16 Fri Loop #4: Timed 45m Zero-AI Medium Coding Interview."
        },
        {
          "id": "w16_t2",
          "track": "aptitude",
          "text": "Phase 1 NQT retired (0h/wk scheduled; protect 100% Sunday cognitive rest)."
        },
        {
          "id": "w16_t3",
          "track": "sql_cs",
          "text": "P2 W16 Mon: Flyway Versioned SQL Migrations & ddl-auto=validate + W16 Fri Recall: 3 Raw Postgres EXPLAIN & Join Optimization Drills."
        },
        {
          "id": "w16_t4",
          "track": "backend",
          "text": "Pass ZERO-AI PROOF GATE J2.2: JPA N+1 Fix & @Transactional Rollback & ship W16 Sat Flagship Project 1 Sprint: Full Transactional Business Logic."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "P2 W16 Mon: Graph DFS/BFS & Multi-Source Grid Drills",
            "Solve Pacific Atlantic Water Flow & Walls and Gates cold in Java.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "P2 W16 Mon: Flyway Versioned SQL Migrations & ddl-auto=validate",
            "Design V1__init.sql & V2__indexes_and_checks.sql with integer-paise BIGINT columns.",
            "sql_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_spring_proj1"
            ],
            "Spring Boot Ch.4: JPA Entities, FetchType.LAZY & Persistence Context",
            "Study be_guide Ch.4; understand dirty checking, detached entities & why @ManyToOne defaults EAGER.",
            "be_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "P2 W16 Tue: Topological Sort & Alien Dictionary Drills",
            "Solve Course Schedule II & Alien Dictionary blank-IDE.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "cs_os_dbms_cn"
            ],
            "P2 W16 Tue: DBMS Isolation Levels Mapped to @Transactional",
            "Map Postgres READ COMMITTED vs REPEATABLE READ onto Spring @Transactional(isolation=...).",
            "dbms_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_spring_proj1"
            ],
            "Reproducing & Killing JPA N+1 Queries (JOIN FETCH & @EntityGraph)",
            "Enable SQL query logging, measure 1+N queries, then cut to 1 query with JOIN FETCH + DTO projection.",
            "be_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "P2 W16 Wed: Dijkstra & Minimum Effort Path Drills",
            "Solve Path With Minimum Effort & Swim in Rising Water zero-AI.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "backend",
            [
              "be_spring_proj1"
            ],
            "Spring Boot Ch.5: @Transactional Propagation, Rollback & Self-Call Trap",
            "Reproduce why this.innerTx() bypasses Spring AOP proxy & why checked exceptions skip rollback.",
            "be_guide",
            2.0,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_spring_proj1"
            ],
            "Flagship Project 1: Wire Postgres + Flyway + Repository Layer",
            "Implement full JPA repositories, composite indexes & @DataJpaTest slice tests.",
            "be_prac",
            1.5,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "P2 W16 Thu: Union-Find (DSU) & Connected Components Drills",
            "Solve Number of Connected Components & Accounts Merge blank-IDE.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "P2 W16 Thu: EXPLAIN ANALYZE on Flagship Project 1 Queries",
            "Run EXPLAIN ANALYZE on Project 1 order/telemetry joins; confirm zero sequential scans on hot paths.",
            "sql_prac",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_spring_proj1"
            ],
            "Optimistic (@Version) vs Pessimistic Locking in Spring Data JPA",
            "Test @Version ObjectOptimisticLockingFailureException vs atomic conditional UPDATE.",
            "be_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "W16 Fri Loop #4: Timed 45m Zero-AI Medium Coding Interview",
            "2 unseen Graph/DSU Mediums under strict interview timer.",
            "mock_work",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "W16 Fri Recall: 3 Raw Postgres EXPLAIN & Join Optimization Drills",
            "Write 3 indexed queries cold & interpret EXPLAIN output.",
            "sql_rev",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_spring_proj1"
            ],
            "ZERO-AI PROOF GATE J2.2: JPA N+1 Fix & @Transactional Rollback",
            "Mandatory Friday blank-IDE gate (AI OFF): reproduce N+1 & self-call bug, fix with JOIN FETCH + bean split, assert SQL count & DB rollback.",
            "java_zeroai",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "W16 Sat: Graphs Redo Sweep & Complexity Audit",
            "Re-solve flagged Week 16 graph problems cold.",
            "jdsa_rev",
            1.5,
            "08:30–10:00",
            "b1"
          ],
          [
            "backend",
            [
              "be_spring_proj1"
            ],
            "W16 Sat Flagship Project 1 Sprint: Full Transactional Business Logic",
            "Complete core order/billing transactional flows, pagination (Pageable) & unit tests.",
            "java_zeroai",
            3.0,
            "11:00–14:00",
            "b2"
          ]
        ],
        []
      ]
    },
    {
      "id": 17,
      "month": 5,
      "title": "Spring Boot Wk 3/4: Spring Security, Stateless JWT Filter, RBAC & Gate J3.1",
      "focus": [
        "Spring Boot 4-Wk Sprint (3/4)",
        "SecurityFilterChain + JWT",
        "RBAC & Ownership Checks",
        "Gate J3.1 401/403/200 Proof"
      ],
      "practiceTag": "J3.1 • Spring Boot 3/4 • JWT + RBAC",
      "targets": [
        {
          "id": "w17_t1",
          "track": "dsa",
          "text": "P2 W17 Mon: 1D DP Interview Drills (House Robber II & Word Break) + W17 Fri Loop #5: Timed 45m Zero-AI Medium Coding Interview."
        },
        {
          "id": "w17_t2",
          "track": "aptitude",
          "text": "Phase 1 NQT retired (0h/wk scheduled; protect 100% Sunday cognitive rest)."
        },
        {
          "id": "w17_t3",
          "track": "sql_cs",
          "text": "P2 W17 Mon: Auth Schema Design (users, roles, refresh_tokens) + W17 Fri Recall: 3 Raw SQL Queries (Cohort, Anti-Join & Window)."
        },
        {
          "id": "w17_t4",
          "track": "backend",
          "text": "Pass ZERO-AI PROOF GATE J3.1: Spring Security JWT Filter & RBAC & ship W17 Sat Flagship Project 1 Sprint: Security Audit & Swagger Auth."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "P2 W17 Mon: 1D DP Interview Drills (House Robber II & Word Break)",
            "Code House Robber II & Word Break cold in Java with O(n) space.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "P2 W17 Mon: Auth Schema Design (users, roles, refresh_tokens)",
            "Write V3__auth_tables.sql Flyway migration with unique email & hashed refresh tokens.",
            "sql_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_spring_proj1"
            ],
            "Spring Boot Ch.6 Pt 1: Stateless SecurityFilterChain & BCrypt",
            "Study be_guide Ch.6; configure SessionCreationPolicy.STATELESS & BCryptPasswordEncoder.",
            "be_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "P2 W17 Tue: Knapsack & Coin Change II Blank-IDE Drills",
            "Distinguish combination loop order vs permutation loop order in DP cold.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "cs_os_dbms_cn"
            ],
            "P2 W17 Tue: Core CS Recall — HTTPS/TLS, Cookies & Auth Headers",
            "Review Bearer token transport security, HttpOnly cookies & CORS preflight rules.",
            "cn_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_spring_proj1"
            ],
            "Spring Boot Ch.6 Pt 2: OncePerRequestFilter JWT Verification",
            "Build JwtAuthenticationFilter populating SecurityContextHolder cleanly before UsernamePasswordAuthenticationFilter.",
            "be_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "P2 W17 Wed: 2D DP & Stock Trading State-Machine Drills",
            "Solve Best Time to Buy/Sell Stock with Cooldown & Interleaving String zero-AI.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "backend",
            [
              "be_spring_proj1"
            ],
            "RBAC (@PreAuthorize) & Zero-IDOR Principal Ownership Checks",
            "Lock /api/admin/** to ADMIN role and derive customer userId strictly from Authentication principal.",
            "be_guide",
            2.0,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_spring_proj1"
            ],
            "Testing Spring Security: MockMvc 401, 403 & Role Matrix Tests",
            "Write MockMvc security tests covering missing JWT, expired JWT, customer-on-admin 403 & IDOR 403.",
            "test_guide",
            1.5,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "P2 W17 Thu: Greedy Intervals & Jump Game Variants",
            "Solve Jump Game II, Gas Station & Partition Labels blank-IDE.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "cs_git_linux"
            ],
            "P2 W17 Thu: Git & Linux Recall — Inspecting Spring Logs & Ports",
            "Practice grepping structured JSON logs & verifying listening sockets on Linux.",
            "linux_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_spring_proj1"
            ],
            "Flagship Project 1: Wire /auth/register, /auth/login & /api/me",
            "Integrate stateless JWT auth + RBAC across every Project 1 endpoint.",
            "be_prac",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "W17 Fri Loop #5: Timed 45m Zero-AI Medium Coding Interview",
            "2 unseen DP/Greedy Mediums under strict interview timer.",
            "mock_work",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "W17 Fri Recall: 3 Raw SQL Queries (Cohort, Anti-Join & Window)",
            "Timed raw SQL CLI check without references.",
            "sql_prac",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_spring_proj1"
            ],
            "ZERO-AI PROOF GATE J3.1: Spring Security JWT Filter & RBAC",
            "Mandatory Friday blank-IDE gate (AI OFF): stateless JWT OncePerRequestFilter + @PreAuthorize with MockMvc 401/403/200 proof.",
            "java_zeroai",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_tree_graph"
            ],
            "W17 Sat: DP & Greedy Redo Sweep",
            "Blank-file re-solve flagged Week 17 problems.",
            "jdsa_rev",
            1.5,
            "08:30–10:00",
            "b1"
          ],
          [
            "backend",
            [
              "be_spring_proj1"
            ],
            "W17 Sat Flagship Project 1 Sprint: Security Audit & Swagger Auth",
            "Add Bearer JWT auth button to Swagger UI & run end-to-end curl security checks.",
            "java_zeroai",
            3.0,
            "11:00–14:00",
            "b2"
          ]
        ],
        []
      ]
    },
    {
      "id": 18,
      "month": 5,
      "title": "Spring Boot Wk 4/4: Testcontainers, Docker/CI & SHIP Flagship Project 1 (Gate J3.2)",
      "focus": [
        "SHIP Flagship Project 1!",
        "Testcontainers Postgres",
        "Docker Compose + GitHub CI",
        "Gate J3.2 E2E Integration"
      ],
      "practiceTag": "J3.2 • PROJECT 1 SHIPPED • Testcontainers + CI",
      "targets": [
        {
          "id": "w18_t1",
          "track": "dsa",
          "text": "P2 W18 Mon: Mock Workbook Rounds 1–2 (Arrays & Binary Search) + W18 Fri Loop #6: Timed 45m Zero-AI Medium Coding Interview."
        },
        {
          "id": "w18_t2",
          "track": "aptitude",
          "text": "Phase 1 NQT retired (0h/wk scheduled; protect 100% Sunday cognitive rest)."
        },
        {
          "id": "w18_t3",
          "track": "sql_cs",
          "text": "P2 W18 Mon: Postgres Query Plan & Migration Verification + W18 Fri Recall: 3 Raw SQL Queries + Flyway Rollback Safety."
        },
        {
          "id": "w18_t4",
          "track": "backend",
          "text": "Pass ZERO-AI PROOF GATE J3.2: Flyway + Testcontainers Postgres Gate & ship SHIP FLAGSHIP PROJECT 1: End-to-End Demo & Cold Self-Defense."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "P2 W18 Mon: Mock Workbook Rounds 1–2 (Arrays & Binary Search)",
            "2 timed coding rounds from mock_work with zero AI.",
            "mock_work",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "P2 W18 Mon: Postgres Query Plan & Migration Verification",
            "Verify all Flyway migrations apply cleanly from scratch on an empty Postgres 16 DB.",
            "sql_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_spring_proj1"
            ],
            "Testing Ch.6–7: Integration Testing with Testcontainers Postgres",
            "Study test_guide Ch.6–7; wire @Testcontainers + PostgreSQLContainer + @ServiceConnection.",
            "test_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "P2 W18 Tue: Trie & Prefix Search Implementation in Java",
            "Code Trie with wildcard search (WordDictionary) cold from blank file.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "cs_os_dbms_cn"
            ],
            "P2 W18 Tue: Core CS Recall — Connection Pools & OS Sockets",
            "Review HikariCP pool sizing formula (cores * 2 + spindles) & TCP connection reuse.",
            "dbms_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_spring_proj1"
            ],
            "Flagship Project 1: End-to-End Testcontainers Integration Suite",
            "Test register -> login -> create order/reading -> DB state -> 403 RBAC against real Postgres.",
            "test_prac",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "P2 W18 Wed: String Algorithms & Sliding/Hash Hard-Mediums",
            "Solve Minimum Window Substring & Find All Anagrams cold in Java.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "backend",
            [
              "be_spring_proj1"
            ],
            "Spring Boot Ch.8: Actuator Health, Structured Logs & Docker Compose",
            "Add /actuator/health, correlation request IDs & docker-compose.yml (app + postgres).",
            "be_guide",
            2.0,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_spring_proj1"
            ],
            "GitHub Actions CI for Flagship Project 1 (mvn -B verify)",
            "Configure .github/workflows/ci.yml running unit, slice & Testcontainers integration tests on push.",
            "devops_guide",
            1.5,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "P2 W18 Thu: Mock Workbook Round 3 (Trees & Stacks)",
            "Timed 45m coding round + edge-case & clean-code audit.",
            "mock_work",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "cs_git_linux"
            ],
            "P2 W18 Thu: Git Tagging, Release Hygiene & README Diagrams",
            "Tag v1.0.0 on Flagship Project 1 and verify fresh-clone docker compose up works cleanly.",
            "git_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_spring_proj1"
            ],
            "Flagship Project 1 Polish: Architecture README, Curl Demos & CI Badge",
            "Document ER diagram, N+1 fix benchmark, Flyway strategy & Testcontainers proof.",
            "java_zeroai",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "W18 Fri Loop #6: Timed 45m Zero-AI Medium Coding Interview",
            "2 unseen mixed Mediums under strict interview timer.",
            "mock_guide",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "W18 Fri Recall: 3 Raw SQL Queries + Flyway Rollback Safety",
            "Timed SQL CLI check + explain forward-only schema migration safety.",
            "sql_rev",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_spring_proj1"
            ],
            "ZERO-AI PROOF GATE J3.2: Flyway + Testcontainers Postgres Gate",
            "Mandatory Friday blank-IDE gate (AI OFF): ddl-auto=validate + Flyway + @SpringBootTest PostgreSQLContainer passing green in CI.",
            "java_zeroai",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "W18 Sat: Month 4–5 Redo Queue Zero-Out",
            "Blank-file re-solve every pending DSA ~ Redo item.",
            "jdsa_rev",
            1.5,
            "08:30–10:00",
            "b1"
          ],
          [
            "backend",
            [
              "be_spring_proj1"
            ],
            "SHIP FLAGSHIP PROJECT 1: End-to-End Demo & Cold Self-Defense",
            "Verify green CI, Swagger docs, Docker Compose boot & 10m cold walkthrough of Project 1.",
            "java_zeroai",
            3.0,
            "11:00–14:00",
            "b2"
          ]
        ],
        []
      ]
    },
    {
      "id": 19,
      "month": 5,
      "title": "Flagship Project 2 Wk 1/3: Redis Caching, Invalidation & Gate J4.1",
      "focus": [
        "Flagship Project 2 Init",
        "Redis Cache-Aside + TTL Jitter",
        "Write Invalidation (No gRPC/GraphQL)",
        "Gate J4.1 Redis Cache Proof"
      ],
      "practiceTag": "J4.1 • Project 2 (1/3) • Redis Cache",
      "targets": [
        {
          "id": "w19_t1",
          "track": "dsa",
          "text": "P2 W19 Mon: Mock Workbook Rounds 4–5 (Graphs & Heaps) + W19 Fri Loop #7: Timed 45m Zero-AI Medium Coding Interview."
        },
        {
          "id": "w19_t2",
          "track": "aptitude",
          "text": "Phase 1 NQT retired (0h/wk scheduled; protect 100% Sunday cognitive rest)."
        },
        {
          "id": "w19_t3",
          "track": "sql_cs",
          "text": "P2 W19 Mon: Flagship Project 2 Schema (Wallets/Bookings + Locks) + W19 Fri Recall: 3 Raw SQL Queries + Cache Tradeoff Q&A."
        },
        {
          "id": "w19_t4",
          "track": "backend",
          "text": "Pass ZERO-AI PROOF GATE J4.1: Redis Cache-Aside & Write Invalidation & ship W19 Sat Flagship Project 2 Sprint: Core API + Redis Metrics."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "P2 W19 Mon: Mock Workbook Rounds 4–5 (Graphs & Heaps)",
            "Timed coding rounds from mock_work with spoken invariants.",
            "mock_work",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "P2 W19 Mon: Flagship Project 2 Schema (Wallets/Bookings + Locks)",
            "Design Postgres Flyway schema with integer paise, CHECK (balance_paise >= 0) & idempotency_keys.",
            "sql_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_redis_proj2"
            ],
            "Adv Backend Ch.1: Cache-Aside, TTL Jitter, Stampedes & Invalidation",
            "Study abe_guide Ch.1 ONLY (skip gRPC/GraphQL/Sagas); understand stale-read windows.",
            "abe_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "P2 W19 Tue: Hard-Medium Graph + Heap Combined Drill",
            "Solve Cheapest Flights K Stops & Reorganize String cold in Java.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "cs_os_dbms_cn"
            ],
            "P2 W19 Tue: Core CS Recall — Memory Hierarchy & Cache Coherence",
            "Connect OS/CPU cache locality principles to Redis hot-key caching & eviction (LRU/LFU).",
            "os_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_redis_proj2"
            ],
            "Flagship Project 2: Spring Data Redis Setup & Cache-Aside Service",
            "Bootstrap Booking/Wallet API with Postgres + Redis; cache hot account/slot reads with TTL+jitter.",
            "abe_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "P2 W19 Wed: Dynamic Programming Interview Speed Drill",
            "Solve Decode Ways & Partition Equal Subset Sum in 40m plain IDE.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "backend",
            [
              "be_redis_proj2"
            ],
            "Safe Cache Eviction on Write (AFTER_COMMIT Event Listener)",
            "Prevent stale cache writes by evicting Redis keys strictly after Postgres transaction commit.",
            "abe_prac",
            2.0,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_redis_proj2"
            ],
            "Testcontainers Redis + Postgres Integration Setup",
            "Wire GenericContainer('redis:7-alpine') + PostgreSQLContainer in Project 2 integration tests.",
            "test_guide",
            1.5,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "P2 W19 Thu: Mock Workbook Round 6 (DP & Recursion)",
            "Timed 45m coding round + clean recursion/tabulation audit.",
            "mock_work",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "P2 W19 Thu: Interview SQL Recall — Locking & Concurrency Queries",
            "Review SELECT FOR UPDATE, SKIP LOCKED & conditional UPDATE semantics in Postgres.",
            "dbms_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_redis_proj2"
            ],
            "Cache Stampede Protection & Negative Caching for Missing Keys",
            "Test bounded null-caching and single-flight/lock guards on hot cache misses.",
            "abe_prac",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "W19 Fri Loop #7: Timed 45m Zero-AI Medium Coding Interview",
            "2 unseen mixed Mediums under strict 45m exam clock.",
            "mock_guide",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "W19 Fri Recall: 3 Raw SQL Queries + Cache Tradeoff Q&A",
            "Timed SQL CLI check + defend cache-aside vs write-through cold.",
            "sql_prac",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_redis_proj2"
            ],
            "ZERO-AI PROOF GATE J4.1: Redis Cache-Aside & Write Invalidation",
            "Mandatory Friday blank-IDE gate (AI OFF): Redis cache hit (0 DB hits) + immediate invalidation on PUT/DELETE verified with Testcontainers.",
            "java_zeroai",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "W19 Sat: Week 19 DSA Redo Sweep & Pattern Comparison",
            "Blank-file re-solve flagged Week 19 problems.",
            "jdsa_rev",
            1.5,
            "08:30–10:00",
            "b1"
          ],
          [
            "backend",
            [
              "be_redis_proj2"
            ],
            "W19 Sat Flagship Project 2 Sprint: Core API + Redis Metrics",
            "Complete Booking/Wallet read/write endpoints with cache hit/miss logging & unit tests.",
            "java_zeroai",
            3.0,
            "11:00–14:00",
            "b2"
          ]
        ],
        []
      ]
    },
    {
      "id": 20,
      "month": 5,
      "title": "Flagship Project 2 Wk 2/3: Redis Lua Rate Limiter, Slim Docker (DevOps Ch.1–3) & Gate J4.2",
      "focus": [
        "Redis Lua Rate Limiter",
        "DevOps Ch.1–3 ONLY (Docker + CI)",
        "Zero K8s/Terraform Detour",
        "Gate J4.2 429 + Retry-After"
      ],
      "practiceTag": "J4.2 • Project 2 (2/3) • Rate Limiter & Docker",
      "targets": [
        {
          "id": "w20_t1",
          "track": "dsa",
          "text": "P2 W20 Mon: Mock Workbook Rounds 7–8 (Strings, Tries & Stacks) + W20 Fri Loop #8: Timed 45m Zero-AI Medium Coding Interview."
        },
        {
          "id": "w20_t2",
          "track": "aptitude",
          "text": "Phase 1 NQT retired (0h/wk scheduled; protect 100% Sunday cognitive rest)."
        },
        {
          "id": "w20_t3",
          "track": "sql_cs",
          "text": "P2 W20 Mon: Linux Container Inspection (docker logs, exec, stats) + W20 Fri Recall: 3 Raw SQL Queries + Docker Layer Caching Qs."
        },
        {
          "id": "w20_t4",
          "track": "backend",
          "text": "Pass ZERO-AI PROOF GATE J4.2: Atomic Redis Lua Rate Limiter & ship W20 Sat Flagship Project 2 Sprint: Docker Compose + Rate-Limit Load Check."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "P2 W20 Mon: Mock Workbook Rounds 7–8 (Strings, Tries & Stacks)",
            "2 timed coding rounds from mock_work with zero AI.",
            "mock_work",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "cs_git_linux"
            ],
            "P2 W20 Mon: Linux Container Inspection (docker logs, exec, stats)",
            "Practice inspecting JVM heap/RSS & container health inside Linux namespaces.",
            "linux_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_redis_proj2"
            ],
            "Adv Backend Ch.2: Fixed Window, Sliding Log & Token-Bucket Rate Limiting",
            "Study abe_guide Ch.2; understand why non-atomic GET+INCR fails under concurrency.",
            "abe_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "P2 W20 Tue: Two-Pointer & Interval Hard-Medium Drills",
            "Solve Trapping Rain Water & Meeting Rooms II cold in Java.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "P2 W20 Tue: Interview SQL Recall — Analytics & Ranking Edge Cases",
            "Solve 4 unseen ranking/tie-handling SQL queries raw in CLI.",
            "sql_prac",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_redis_proj2"
            ],
            "Atomic Redis Lua Token-Bucket HTTP Filter (429 + Retry-After)",
            "Implement OncePerRequestFilter executing Redis Lua script atomically per client/IP.",
            "abe_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "P2 W20 Wed: Binary Tree & BST Speed Recall Sprint",
            "Solve 2 unseen Tree/BST Mediums in 35m blank IDE.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "backend",
            [
              "be_redis_proj2"
            ],
            "DevOps Ch.1–3 ONLY: Multi-Stage Non-Root Java 21 Dockerfile",
            "Study devops_guide Ch.1–3 ONLY (strictly skip K8s/Terraform Ch.4–10); build JRE-alpine image as non-root app.",
            "devops_guide",
            2.0,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_redis_proj2"
            ],
            "DevOps Ch.1–3 ONLY: GitHub Actions CI with Testcontainers",
            "Configure .github/workflows/ci.yml building multi-stage Docker image & running Testcontainers Redis+Postgres suite.",
            "devops_guide",
            1.5,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "P2 W20 Thu: Mock Workbook Round 9 (Mixed Medium/Hard)",
            "Timed 45m coding round + clean complexity breakdown.",
            "mock_work",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "cs_os_dbms_cn"
            ],
            "P2 W20 Thu: Core CS Recall — TCP Backpressure, HTTP 429 & Timeouts",
            "Review connection/read timeouts, graceful shutdown & Retry-After header semantics.",
            "cn_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_redis_proj2"
            ],
            "Rate Limiter Edge Cases: Fail-Open vs Fail-Closed & Quota Tests",
            "Write Testcontainers Redis tests proving exact 200 -> 429 transition & window reset.",
            "abe_prac",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "W20 Fri Loop #8: Timed 45m Zero-AI Medium Coding Interview",
            "2 unseen mixed Mediums under strict interview timer.",
            "mock_guide",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "W20 Fri Recall: 3 Raw SQL Queries + Docker Layer Caching Qs",
            "Timed SQL CLI check + explain multi-stage build & non-root security cold.",
            "devops_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_redis_proj2"
            ],
            "ZERO-AI PROOF GATE J4.2: Atomic Redis Lua Rate Limiter",
            "Mandatory Friday blank-IDE gate (AI OFF): Redis Lua HTTP filter returning 429 + Retry-After verified on Testcontainers Redis.",
            "java_zeroai",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "W20 Sat: Week 20 Redo Sweep & High-Freq Java Traps",
            "Re-solve flagged Week 20 problems cold.",
            "jdsa_rev",
            1.5,
            "08:30–10:00",
            "b1"
          ],
          [
            "backend",
            [
              "be_redis_proj2"
            ],
            "W20 Sat Flagship Project 2 Sprint: Docker Compose + Rate-Limit Load Check",
            "Boot full Postgres+Redis+App stack via Docker Compose and verify rate-limit behavior under burst.",
            "java_zeroai",
            3.0,
            "11:00–14:00",
            "b2"
          ]
        ],
        []
      ]
    },
    {
      "id": 21,
      "month": 6,
      "title": "Flagship Project 2 Wk 3/3: Row Locking, Idempotency, Async Jobs & SHIP (Gate J5.1)",
      "focus": [
        "SHIP Flagship Project 2!",
        "Postgres Row Locking + Idempotency",
        "Async Background Jobs",
        "Gate J5.1 Concurrency + Replay"
      ],
      "practiceTag": "J5.1 • PROJECT 2 SHIPPED • Locking + Idempotency",
      "targets": [
        {
          "id": "w21_t1",
          "track": "dsa",
          "text": "P2 W21 Mon: Mock Workbook Rounds 10–11 (Graphs & DP) + W21 Fri Loop #9: Timed 45m Zero-AI Medium Coding Interview."
        },
        {
          "id": "w21_t2",
          "track": "aptitude",
          "text": "Phase 1 NQT retired (0h/wk scheduled; protect 100% Sunday cognitive rest)."
        },
        {
          "id": "w21_t3",
          "track": "sql_cs",
          "text": "P2 W21 Mon: Sorted Lock Ordering & Deadlock Avoidance in Postgres + W21 Fri Recall: 3 Raw SQL Queries + Deadlock Prevention Q&A."
        },
        {
          "id": "w21_t4",
          "track": "backend",
          "text": "Pass ZERO-AI PROOF GATE J5.1: Concurrent Row-Locking & Idempotency Gate & ship SHIP FLAGSHIP PROJECT 2: Live Verification & Cold Architecture Defense."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "P2 W21 Mon: Mock Workbook Rounds 10–11 (Graphs & DP)",
            "2 timed coding rounds from mock_work with zero AI.",
            "mock_work",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "P2 W21 Mon: Sorted Lock Ordering & Deadlock Avoidance in Postgres",
            "Practice deterministic ID sorting (min(a,b) -> max(a,b)) before acquiring row locks.",
            "dbms_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_redis_proj2"
            ],
            "Adv Backend Ch.3: Idempotency Keys & Deduplicating Payment Retries",
            "Study abe_guide Ch.3; store unique (user_id, idempotency_key) + response payload inside same DB transaction.",
            "abe_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "P2 W21 Tue: PriorityQueue & Greedy Hard-Mediums",
            "Solve Merge K Sorted Lists & Task Scheduler cold in Java.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "P2 W21 Tue: Interview SQL Recall — Financial Ledger Integrity",
            "Write ledger reconciliation SQL verifying sum(debits) == sum(credits).",
            "sql_prac",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_redis_proj2"
            ],
            "Atomic Conditional UPDATE & Pessimistic Row Locking in Project 2",
            "Implement debitIfSufficient / reserveSlot + sorted-ID transfer locking preventing overdrafts & deadlocks.",
            "java_zeroai",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "P2 W21 Wed: Backtracking & Trees Timed Mix",
            "Solve 2 unseen Mediums in 40m plain IDE.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "backend",
            [
              "be_redis_proj2"
            ],
            "Adv Backend Ch.5: Async Background Jobs & Bounded Retry Receipts",
            "Study abe_guide background jobs ONLY (no Kafka/Sagas); wire @Async / outbox poller for notifications.",
            "abe_guide",
            2.0,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_redis_proj2"
            ],
            "Concurrent Stress Test: 10 Threads + Idempotency Key Replay",
            "Write ExecutorService + CountDownLatch integration test proving zero overdraft & exact-once replay.",
            "test_prac",
            1.5,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "P2 W21 Thu: Mock Workbook Round 12 (Complete Loops A–C Coding)",
            "Complete Rounds 1–12 coding milestone under strict timer.",
            "mock_work",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "cs_git_linux"
            ],
            "P2 W21 Thu: Portfolio Repo Polish — Tagging, CI Badges & Diagrams",
            "Verify both Flagship Project 1 & Project 2 boot with one command and have green GitHub Actions.",
            "git_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_redis_proj2"
            ],
            "Flagship Project 2 Docs: Concurrency, Idempotency & Architecture README",
            "Document sequence diagrams, Redis Lua limiter & Testcontainers concurrency proof.",
            "java_zeroai",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "W21 Fri Loop #9: Timed 45m Zero-AI Medium Coding Interview",
            "2 unseen mixed Mediums under strict interview timer.",
            "mock_guide",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "W21 Fri Recall: 3 Raw SQL Queries + Deadlock Prevention Q&A",
            "Timed SQL CLI check + explain AB/BA deadlock prevention verbally.",
            "sql_rev",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_redis_proj2"
            ],
            "ZERO-AI PROOF GATE J5.1: Concurrent Row-Locking & Idempotency Gate",
            "Mandatory Friday blank-IDE gate (AI OFF): /v1/transfers with Idempotency-Key + atomic debit passing 10-thread concurrency & replay tests.",
            "java_zeroai",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "W21 Sat: Week 21 Redo Sweep & Speed Check",
            "Blank-file re-solve every flagged Week 21 item.",
            "jdsa_rev",
            1.5,
            "08:30–10:00",
            "b1"
          ],
          [
            "backend",
            [
              "be_redis_proj2"
            ],
            "SHIP FLAGSHIP PROJECT 2: Live Verification & Cold Architecture Defense",
            "Verify green CI (Postgres+Redis Testcontainers), slim Docker build & 10m cold walkthrough.",
            "java_zeroai",
            3.0,
            "11:00–14:00",
            "b2"
          ]
        ],
        []
      ]
    },
    {
      "id": 22,
      "month": 6,
      "title": "Cold 60m Java LLD #1 (Parking Lot), Foundational HLD & Gate J5.2",
      "focus": [
        "3 Deep Cold LLDs (1/3: Parking Lot)",
        "SOLID & Strategy/Factory",
        "HLD: URL Shortener & Rate Limiter",
        "Gate J5.2 Cold Parking Lot"
      ],
      "practiceTag": "J5.2 • Cold LLD #1 (Parking Lot) • HLD 1–2",
      "targets": [
        {
          "id": "w22_t1",
          "track": "dsa",
          "text": "P2 W22 Mon: Mock Workbook Rounds 13–14 (Arrays, Trees & DP) + W22 Fri Loop #10: Timed 45m Zero-AI Medium Coding Interview."
        },
        {
          "id": "w22_t2",
          "track": "aptitude",
          "text": "Phase 1 NQT retired (0h/wk scheduled; protect 100% Sunday cognitive rest)."
        },
        {
          "id": "w22_t3",
          "track": "sql_cs",
          "text": "P2 W22 Mon: Interview SQL Rapid-Fire (5 Queries in 40m) + W22 Fri Recall: OS/DBMS/CN 15-Question Interview Rapid-Fire."
        },
        {
          "id": "w22_t4",
          "track": "backend",
          "text": "Pass ZERO-AI PROOF GATE J5.2: Cold 60-Min LLD — Thread-Safe Parking Lot & ship W22 Sat Deep Loop: HLD #1–#2 Whiteboard Practice & Resume v1."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "P2 W22 Mon: Mock Workbook Rounds 13–14 (Arrays, Trees & DP)",
            "2 timed coding rounds from mock_work with spoken tradeoffs.",
            "mock_work",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "P2 W22 Mon: Interview SQL Rapid-Fire (5 Queries in 40m)",
            "Solve 5 unseen interview SQL prompts cold in mysql CLI.",
            "sql_prac",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_lld_hld_loops"
            ],
            "Java LLD Essentials: SOLID, Composition & Strategy/Factory Patterns",
            "Study lld_guide Ch.1–4 selectively — focus strictly on patterns used in real machine-coding rounds.",
            "lld_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "P2 W22 Tue: Top-20 SDE-1 Patterns Speed Drill Pt 1",
            "Solve 3 high-frequency interview mediums in 50m plain IDE.",
            "jdsa_rev",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "cs_os_dbms_cn"
            ],
            "P2 W22 Tue: Core CS Recall — Concurrency & Locking in LLD",
            "Review ReentrantLock vs synchronized vs ConcurrentHashMap for thread-safe machine coding.",
            "conc_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_lld_hld_loops"
            ],
            "LLD #1 Prep: Multi-Floor Parking Lot Domain & Concurrency Design",
            "Sketch Vehicle/Spot/Floor/Ticket hierarchy, AllocationStrategy, PricingStrategy & per-floor locks.",
            "lld_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "P2 W22 Wed: Graph & Shortest-Path Speed Recall",
            "Solve 2 unseen graph mediums cleanly under 40m.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "backend",
            [
              "be_lld_hld_loops"
            ],
            "Foundational HLD #1: URL Shortener (Base62, Sharding & Caching)",
            "Study hld_guide Ch.1–2 & URL Shortener case study: QPS estimates, collision-free IDs & Redis read cache.",
            "hld_guide",
            2.0,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_lld_hld_loops"
            ],
            "Foundational HLD #2: Distributed Rate Limiter Architecture",
            "Connect your Project 2 Redis Lua limiter to HLD API Gateway placement & failure modes.",
            "hld_guide",
            1.5,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "P2 W22 Thu: Mock Workbook Round 15 (Graphs & Intervals)",
            "Timed 45m coding round + edge-case verification.",
            "mock_work",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "P2 W22 Thu: Indexing & Sharding Key Tradeoffs for HLD",
            "Practice explaining B+ tree write amplification, read replicas & shard key selection.",
            "dbms_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_lld_hld_loops"
            ],
            "LLD #1 Dry Run & JUnit Concurrency Test Harness",
            "Practice clean Java package structure & 10-thread ExecutorService spot-allocation test.",
            "lld_prac",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "W22 Fri Loop #10: Timed 45m Zero-AI Medium Coding Interview",
            "2 unseen mixed Mediums under strict interview timer.",
            "mock_guide",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "cs_os_dbms_cn"
            ],
            "W22 Fri Recall: OS/DBMS/CN 15-Question Interview Rapid-Fire",
            "Speak crisp 60-second answers to 15 core CS questions with zero notes.",
            "os_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_lld_hld_loops"
            ],
            "ZERO-AI PROOF GATE J5.2: Cold 60-Min LLD — Thread-Safe Parking Lot",
            "Mandatory Friday blank-IDE gate (60m, AI OFF): multi-floor Parking Lot + Strategy pricing/allocation + 10-thread concurrency test.",
            "java_zeroai",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "W22 Sat: Week 22 DSA Redo Sweep",
            "Blank-file re-solve any Week 22 ~ Redo item.",
            "jdsa_rev",
            1.5,
            "08:30–10:00",
            "b1"
          ],
          [
            "backend",
            [
              "be_lld_hld_loops"
            ],
            "W22 Sat Deep Loop: HLD #1–#2 Whiteboard Practice & Resume v1",
            "Practice 40m whiteboard walkthroughs of URL Shortener & Rate Limiter + draft SDE-1 resume (hr_guide).",
            "hr_guide",
            3.0,
            "11:00–14:00",
            "b2"
          ]
        ],
        []
      ]
    },
    {
      "id": 23,
      "month": 6,
      "title": "Cold 60m Java LLD #2 (Rate Limiter), HLD #3–#4 & Gate J6.1",
      "focus": [
        "3 Deep Cold LLDs (2/3: Rate Limiter)",
        "Clock-Injected Unit Tests",
        "HLD: Inventory Lock & Notifications",
        "Gate J6.1 Cold Rate Limiter"
      ],
      "practiceTag": "J6.1 • Cold LLD #2 (Rate Limiter) • HLD 3–4",
      "targets": [
        {
          "id": "w23_t1",
          "track": "dsa",
          "text": "P2 W23 Mon: Mock Workbook Rounds 16–17 (Trees, Heaps & DP) + W23 Fri Loop #11: Timed 45m Zero-AI Medium Coding Interview."
        },
        {
          "id": "w23_t2",
          "track": "aptitude",
          "text": "Phase 1 NQT retired (0h/wk scheduled; protect 100% Sunday cognitive rest)."
        },
        {
          "id": "w23_t3",
          "track": "sql_cs",
          "text": "P2 W23 Mon: Hard SQL Mock (CTEs, Windows & Edge Cases) + W23 Fri Recall: Final MySQL Quick Revision Cover-to-Cover."
        },
        {
          "id": "w23_t4",
          "track": "backend",
          "text": "Pass ZERO-AI PROOF GATE J6.1: Cold 60-Min LLD — Token-Bucket Rate Limiter & ship W23 Sat Full Mock Loop #1 (DSA + LLD + HLD + Behavioural)."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "P2 W23 Mon: Mock Workbook Rounds 16–17 (Trees, Heaps & DP)",
            "2 timed coding rounds from mock_work with zero AI.",
            "mock_work",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "P2 W23 Mon: Hard SQL Mock (CTEs, Windows & Edge Cases)",
            "Timed 40m hard SQL mock in raw mysql CLI.",
            "sql_prac",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_lld_hld_loops"
            ],
            "LLD #2 Prep: Per-Client Token Bucket & Sliding Window Strategies",
            "Design RateLimiter interface, ConcurrentHashMap<String, Bucket>, System.nanoTime() & LongSupplier clock injection.",
            "java_zeroai",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "P2 W23 Tue: Top-20 SDE-1 Patterns Speed Drill Pt 2",
            "Solve 3 high-frequency interview mediums in 50m plain IDE.",
            "jdsa_rev",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "cs_os_dbms_cn"
            ],
            "P2 W23 Tue: Core CS Recall — Monotonic Clocks & Thread Safety",
            "Review why System.nanoTime() beats System.currentTimeMillis() + per-key vs global locks.",
            "conc_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_lld_hld_loops"
            ],
            "LLD #2 Deterministic Unit Tests (Zero Thread.sleep Flakiness)",
            "Write instant <10ms JUnit 5 tests using AtomicLong fake clock verifying burst, refill & cap.",
            "test_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "P2 W23 Wed: Dynamic Programming & Stack Hard-Medium Mix",
            "Solve 2 unseen Medium/Hard problems cold in 45m.",
            "jdsa_prac",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "backend",
            [
              "be_lld_hld_loops"
            ],
            "Foundational HLD #3: Flash-Sale Inventory Locking & Checkout",
            "Connect your Project 1–2 Postgres conditional UPDATE + Redis stock counters to HLD scale.",
            "hld_guide",
            2.0,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_lld_hld_loops"
            ],
            "Foundational HLD #4: Reliable Notification Service",
            "Design templated multi-channel notification pipeline with retries, rate limits & idempotency (hld_prac).",
            "hld_prac",
            1.5,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "P2 W23 Thu: Mock Workbook Round 18 (Full Timed Coding)",
            "Timed 45m coding round + verbal optimization follow-up.",
            "mock_work",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "cs_git_linux"
            ],
            "P2 W23 Thu: Git/Linux + Debugging Rapid-Fire Scenario Drill",
            "Answer live production debugging prompts (502/OOM/connection-pool exhaustion) cold.",
            "linux_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_lld_hld_loops"
            ],
            "HR & STAR Story Bank: Projects 0/1/2, Debugging & Ownership",
            "Draft 8 crisp STAR stories with real metrics (N+1 reduction, Testcontainers, concurrency proof) from hr_guide.",
            "hr_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "W23 Fri Loop #11: Timed 45m Zero-AI Medium Coding Interview",
            "2 unseen mixed Mediums under strict interview timer.",
            "mock_guide",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "W23 Fri Recall: Final MySQL Quick Revision Cover-to-Cover",
            "Review every trap in sql_rev + write 2 window/lock queries cold.",
            "sql_rev",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_lld_hld_loops"
            ],
            "ZERO-AI PROOF GATE J6.1: Cold 60-Min LLD — Token-Bucket Rate Limiter",
            "Mandatory Friday blank-IDE gate (60m, AI OFF): Token-Bucket + Sliding-Window strategies with injected monotonic clock & deterministic JUnit tests.",
            "java_zeroai",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "W23 Sat: Week 23 DSA Redo Sweep & Speed Audit",
            "Re-solve any flagged Week 23 items cold.",
            "jdsa_rev",
            1.5,
            "08:30–10:00",
            "b1"
          ],
          [
            "backend",
            [
              "be_lld_hld_loops"
            ],
            "W23 Sat Full Mock Loop #1 (DSA + LLD + HLD + Behavioural)",
            "Sit a complete Fresher/SDE-1 interview loop from mock_guide and grade strictly against rubric.",
            "mock_guide",
            3.0,
            "11:00–14:00",
            "b2"
          ]
        ],
        []
      ]
    },
    {
      "id": 24,
      "month": 6,
      "title": "Cold 60m Java LLD #3 (Splitwise), Whiteboard Defense & SDE-1 Offer Peak (Gate J6.2)",
      "focus": [
        "3 Deep Cold LLDs (3/3: Splitwise)",
        "20m Project Whiteboard Defense",
        "Mock Rounds 19–20 + Zero Redo",
        "8–15 LPA SDE-1 Peak"
      ],
      "practiceTag": "J6.2 • Cold LLD #3 (Splitwise) • SDE-1 OFFER READY",
      "targets": [
        {
          "id": "w24_t1",
          "track": "dsa",
          "text": "P2 W24 Mon: Mock Workbook Rounds 19–20 (Final Workbook Finish!) + W24 Fri Capstone Loop #12: Final Zero-AI SDE-1 Coding Proof."
        },
        {
          "id": "w24_t2",
          "track": "aptitude",
          "text": "Phase 1 NQT retired (0h/wk scheduled; protect 100% Sunday cognitive rest)."
        },
        {
          "id": "w24_t3",
          "track": "sql_cs",
          "text": "P2 W24 Mon: Final Timed SQL + Schema Design Interview Check + W24 Fri Final Recall: 10-Min SQL + 10-Min Core CS Lightning Round."
        },
        {
          "id": "w24_t4",
          "track": "backend",
          "text": "Pass ZERO-AI PROOF GATE J6.2: Cold 60m Splitwise LLD + Project Defense & ship W24 Sat Full Mock Loop #2 & 24-Week Graduation Debrief."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "P2 W24 Mon: Mock Workbook Rounds 19–20 (Final Workbook Finish!)",
            "Complete final 2 timed coding rounds from mock_work with zero AI.",
            "mock_work",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery"
            ],
            "P2 W24 Mon: Final Timed SQL + Schema Design Interview Check",
            "Solve 3 hard queries + design an indexed e-commerce/wallet schema cold.",
            "sql_prac",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_lld_hld_loops"
            ],
            "LLD #3 Prep: Splitwise Integer-Paise Splits & Debt Simplification",
            "Design EQUAL/EXACT/PERCENT validators (long paise remainder distribution!) & two-heap greedy simplification.",
            "java_zeroai",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "P2 W24 Tue: Zero Out 100% of Remaining DSA Redo Queue",
            "Blank-file re-solve every remaining flagged item until Redo Queue == 0.",
            "jdsa_rev",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "cs_os_dbms_cn"
            ],
            "P2 W24 Tue: Core CS Final Speed Sheet (OS + DBMS + CN + JDBC)",
            "Rapid 60m cold recall across threads, B+ trees, MVCC, TCP/HTTP/TLS & JDBC pools.",
            "dbms_guide",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_lld_hld_loops"
            ],
            "Spring Boot & Redis Rapid-Fire Deep-Dive Q&A",
            "Cold-recall DI proxies, @Transactional traps, N+1 fixes, JWT FilterChain, Redis Lua & idempotency.",
            "be_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "P2 W24 Wed: DSA in Java 14p Quick Revision Final Pass",
            "Cover every template, comparator & overflow trap in jdsa_rev.",
            "jdsa_rev",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "backend",
            [
              "be_lld_hld_loops"
            ],
            "Whiteboard Defense Rehearsal: Flagship Projects 1 & 2",
            "Practice 20m zero-note whiteboard defense (architecture, failure modes, N+1, locks, Testcontainers).",
            "java_zeroai",
            2.0,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_lld_hld_loops"
            ],
            "Resume v2 Final Polish, GitHub Pinned Repos & ATS Check",
            "Finalize 1-page Java Backend SDE-1 resume & verify every live link/CI badge (hr_guide).",
            "hr_guide",
            1.5,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "P2 W24 Thu: Final Timed 45m Blank-IDE Coding Dress Rehearsal",
            "Final 2-Medium calm execution proving complete Zero-AI confidence.",
            "mock_guide",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "sql_cli_mastery",
              "cs_git_linux"
            ],
            "P2 W24 Thu: Final SQL, Git & Linux Sanity Check",
            "Verify zero weak spots across raw SQL & server diagnostics.",
            "sql_rev",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_lld_hld_loops"
            ],
            "HR, Managerial & Offer Negotiation Final Mock (8–15 LPA)",
            "Rehearse intro, project pitches, STAR stories & salary negotiation scripts out loud (hr_guide).",
            "hr_guide",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "W24 Fri Capstone Loop #12: Final Zero-AI SDE-1 Coding Proof",
            "Final 45m unseen coding loop confirming interview peak.",
            "mock_guide",
            1.5,
            "08:00–09:30",
            "b1"
          ],
          [
            "sql_cs",
            [
              "cs_os_dbms_cn"
            ],
            "W24 Fri Final Recall: 10-Min SQL + 10-Min Core CS Lightning Round",
            "Final confidence check across SQL, OS, DBMS & CN.",
            "sql_rev",
            1.5,
            "11:00–12:30",
            "b2"
          ],
          [
            "backend",
            [
              "be_lld_hld_loops"
            ],
            "ZERO-AI PROOF GATE J6.2: Cold 60m Splitwise LLD + Project Defense",
            "Capstone Friday gate (AI OFF): 60m integer-paise Splitwise + 20m zero-note whiteboard defense of Projects 1 & 2.",
            "java_zeroai",
            2.0,
            "15:00–17:00",
            "b3"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_timed_loops"
            ],
            "W24 Sat: Final Java Coding Confidence & Template Check",
            "Light 90m review of strongest patterns — keep mind fresh.",
            "jdsa_rev",
            1.5,
            "08:30–10:00",
            "b1"
          ],
          [
            "backend",
            [
              "be_lld_hld_loops"
            ],
            "W24 Sat Full Mock Loop #2 & 24-Week Graduation Debrief",
            "Complete final full SDE-1 Mock Loop (DSA + LLD + HLD + HR) — 708h sustainable prep complete!",
            "mock_guide",
            3.0,
            "11:00–14:00",
            "b2"
          ]
        ],
        []
      ]
    }
  ]
});
})();
