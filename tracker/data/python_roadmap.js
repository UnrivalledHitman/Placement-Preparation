(function () {
  "use strict";
  window.TrackerShared.registerTracker({
    id: "python",
    storageKey: "placement_roadmap_tracker_v1",
    taskIdPrefix: "",
    startDateUtc: [2026,11,1],
    resourcePrefix: "../",
    backupFilePrefix: "roadmap_tracker_backup",
    hub: {
      "href": "python_dsa_sql_aiml_tracker.html",
      "badge": "Python Edition",
      "headerPill": "Python DSA Track",
      "slot": 1,
      "title": "Python DSA, SQL & AI/ML Roadmap",
      "timeline": "1 Dec 2026 – 17 May 2027 • 6 Months / 24 Weeks",
      "scope": "DSA in Python (D1.1–D6.6), MySQL 1–16 + DuckDB, GATE Warm-up S1–S12, Maths/ADS/DL/RAG/Agents/MLSD/MLOps + Projects 1–5."
    },
    header: {
      "pageTitle": "Python DSA, SQL & AI/ML Roadmap Tracker (24 Weeks)",
      "title": "Placement & AI Engineering Mastery Tracker",
      "subtitle": "Phase 1 (Weeks 1–12: Core Python DSA + MySQL + Math/ML/DL) • Phase 2 (Weeks 13–24: DSA/SQL Peak + LLMs, RAG, Agents, MLOps & Interviews)",
      "timelineBadge": "1 Dec 2026 – 17 May 2027 (24 Weeks / 168 Days)"
    },
    tracks: [
      {
        "key": "dsa",
        "slot": 1,
        "label": "Python DSA",
        "headerBadge": "Python DSA",
        "kpiTitle": "Python DSA",
        "kpiSub": "Ch.1–12 + D1.1–D6.6 + Maint",
        "skillGroupTitle": "Python DSA Skills (7)",
        "svgLabel": "Python DSA (7 Skills)",
        "libraryHeading": "Python DSA & Coding Mock Loops"
      },
      {
        "key": "sql",
        "slot": 2,
        "label": "SQL",
        "headerBadge": "MySQL + Analytics SQL",
        "kpiTitle": "SQL Mastery",
        "kpiSub": "MySQL 1–16 + DSI + DuckDB",
        "skillGroupTitle": "SQL & Data Engineering Skills (6)",
        "svgLabel": "SQL Mastery (6 Skills)",
        "libraryHeading": "MySQL & Data Engineering SQL"
      },
      {
        "key": "aiml",
        "slot": 3,
        "label": "AI / ML",
        "headerBadge": "AI / ML → LLMs & Agents",
        "kpiTitle": "AI / ML & Agents",
        "kpiSub": "Math -> DL -> RAG/Agents + 5 Proj",
        "skillGroupTitle": "AI / ML, LLMs, Agents & MLOps Skills (8)",
        "svgLabel": "AI/ML & Agents (8 Skills)",
        "libraryHeading": "Maths, AI/ML, Deep Learning, MLOps, RAG/Agents & HR"
      }
    ],
    phases: [
      {
        "id": 1,
        "minWeek": 1,
        "maxWeek": 12,
        "chipColor": "var(--primary)",
        "dailyLabel": "Phase 1: Intensive 12-Week Core",
        "heading": "Phase 1: Core 12-Week Python DSA + MySQL + Math/ML/DL Sprint (Weeks 1–12)",
        "subtitle": "1 Dec 2026 – 22 Feb 2027 • 1 DSA chapter block + MySQL Parts 1–16 + GATE Warm-up Saturdays + Portfolio Projects 1–2"
      },
      {
        "id": 2,
        "minWeek": 13,
        "maxWeek": 24,
        "chipColor": "var(--chart-3)",
        "dailyLabel": "Phase 2: AI Engineering & Interview Peak",
        "heading": "Phase 2: AI Engineering, LLMs/Agents, Analytics SQL & Interview Peak (Weeks 13–24)",
        "subtitle": "23 Feb – 17 May 2027 • DSA maintenance & mock loops + Analytics/DuckDB SQL + RAG/Agents/MLSD/MLOps + Projects 3–5"
      }
    ],
    ui: {
      "searchPlaceholder": "Search task, D1.1, Part 9, Project 3, window...",
      "monthlyTabLabel": "Monthly Targets & Projects (6m)",
      "monthlyTargetsHeading": "Monthly Mastery Targets & Gates",
      "skillsKpiSub": "21 tracked competencies",
      "skillsMatrixTitle": "Skill-Wise Acquisition Matrix (21 Core Skills)",
      "skillsChartAriaLabel": "Track Competency Summary",
      "skillsChartCombinedLabel": "Combined Roadmap (21 Skills)",
      "noteLabel": "Error / Learning Log:",
      "notePlaceholder": "Log off-by-one bug, slow query insight or key takeaway for Day {dayNum}...",
      "notesPanelTitle": "Daily Error Log & Learning Notes",
      "notesPanelDesc": "Your one-line bug diagnostics & daily insights entered on Day cards aggregate here for weekly review.",
      "notesEmptyText": "No error logs yet. Record any wrong-submission cause in a Day card's bottom input.",
      "redoDesc": "Any task marked ~ Redo appears here so you re-solve it from a blank editor one week later.",
      "redoEmptyText": "Redo queue is empty. Click ~ Redo on any tricky exercise or query to schedule a 7-day re-solve.",
      "libraryTitle": "Repository Study Library Reference",
      "exportTitle": "Export Progress JSON",
      "exportDesc": "Copy or download this JSON backup to restore or transfer your Python roadmap progress.",
      "importTitle": "Import Progress JSON",
      "resetToast": "All progress reset cleanly.",
      "weekChipMinWidth": "76px",
      "dayBadge": {
        "maxWeek": 12,
        "dayInWeek": 5,
        "label": "GATE Warm-up Saturday",
        "pillClass": "pill-3"
      }
    },
    resources: {
      "py_guide": {
        "title": "DSA in Python: Complete Guide",
        "path": "03_Programming/05_DSA_in_Python/01_DSA_in_Python_Complete_Guide.pdf",
        "track": "dsa"
      },
      "py_prac": {
        "title": "DSA in Python: Practice Book (36 Exercises)",
        "path": "03_Programming/05_DSA_in_Python/02_DSA_in_Python_Practice_Book.pdf",
        "track": "dsa"
      },
      "py_rev": {
        "title": "DSA in Python: Quick Revision (13p)",
        "path": "03_Programming/05_DSA_in_Python/03_DSA_in_Python_Quick_Revision.pdf",
        "track": "dsa"
      },
      "sql_guide": {
        "title": "MySQL: Complete Guide (Parts 1-16)",
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
      "math_guide": {
        "title": "Mathematics & Statistics for ML: Complete Guide",
        "path": "06_AI_and_Machine_Learning/01_Mathematics_for_ML/01_Mathematics_and_Statistics_for_ML_Complete_Guide.pdf",
        "track": "aiml"
      },
      "math_prac": {
        "title": "Mathematics & Statistics for ML: Practice Book (49 Ex.)",
        "path": "06_AI_and_Machine_Learning/01_Mathematics_for_ML/02_Mathematics_and_Statistics_for_ML_Practice_Book.pdf",
        "track": "aiml"
      },
      "aiml_guide": {
        "title": "AI & ML: From Maths to Agents (Parts 0-15)",
        "path": "06_AI_and_Machine_Learning/02_AI_ML/01_AI_ML_Complete_Guide.pdf",
        "track": "aiml"
      },
      "aiml_prac": {
        "title": "AI & ML: Practice Book (73 Exercises)",
        "path": "06_AI_and_Machine_Learning/02_AI_ML/02_AI_ML_Practice_Book.pdf",
        "track": "aiml"
      },
      "ads_guide": {
        "title": "Applied Data Science: Complete Guide",
        "path": "06_AI_and_Machine_Learning/03_Applied_Data_Science/01_Applied_Data_Science_Complete_Guide.pdf",
        "track": "aiml"
      },
      "ads_prac": {
        "title": "Applied Data Science: Practice Book (24 Ex.)",
        "path": "06_AI_and_Machine_Learning/03_Applied_Data_Science/02_Applied_Data_Science_Practice_Book.pdf",
        "track": "aiml"
      },
      "dl_guide": {
        "title": "Deep Learning: Autograd to Frontiers",
        "path": "06_AI_and_Machine_Learning/04_Deep_Learning/01_Deep_Learning_Complete_Guide.pdf",
        "track": "aiml"
      },
      "dl_prac": {
        "title": "Deep Learning: Practice Book (73 Ex.)",
        "path": "06_AI_and_Machine_Learning/04_Deep_Learning/02_Deep_Learning_Practice_Book.pdf",
        "track": "aiml"
      },
      "mlsd_guide": {
        "title": "ML System Design: Metrics to Monitoring",
        "path": "06_AI_and_Machine_Learning/05_ML_System_Design/01_ML_System_Design_Complete_Guide.pdf",
        "track": "aiml"
      },
      "mlsd_prac": {
        "title": "ML System Design: Practice Book (29 Ex.)",
        "path": "06_AI_and_Machine_Learning/05_ML_System_Design/02_ML_System_Design_Practice_Book.pdf",
        "track": "aiml"
      },
      "mlops_guide": {
        "title": "MLOps: Notebook to Production",
        "path": "06_AI_and_Machine_Learning/06_MLOps/01_MLOps_Complete_Guide.pdf",
        "track": "aiml"
      },
      "mlops_prac": {
        "title": "MLOps: Practice Book (24 Ex.)",
        "path": "06_AI_and_Machine_Learning/06_MLOps/02_MLOps_Practice_Book.pdf",
        "track": "aiml"
      },
      "dsi_guide": {
        "title": "Data Science Interviews: SQL to Product Sense",
        "path": "06_AI_and_Machine_Learning/07_Data_Science_Interview_Prep/01_Data_Science_Interview_Prep_Complete_Guide.pdf",
        "track": "aiml"
      },
      "dsi_prac": {
        "title": "Data Science Interview Prep: Practice Book (24 Ex.)",
        "path": "06_AI_and_Machine_Learning/07_Data_Science_Interview_Prep/02_Data_Science_Interview_Prep_Practice_Book.pdf",
        "track": "aiml"
      },
      "gate_warm": {
        "title": "GATE DA Weekend Warm-up (12 Sessions)",
        "path": "06_AI_and_Machine_Learning/09_GATE_Data_Science_and_AI/07_GATE_DA_Weekend_Warm-up.pdf",
        "track": "aiml"
      },
      "rag_ws": {
        "title": "RAG & Agentic AI Workshop Guide (6 Labs)",
        "path": "06_AI_and_Machine_Learning/10_Corporate_Workshop_RAG_and_Agents/01_RAG_and_Agentic_AI_Workshop_Trainer_Guide.pdf",
        "track": "aiml"
      },
      "de_guide": {
        "title": "Data Engineering: Lakes, Warehouses, Pipelines",
        "path": "05_System_Design/05_Data_Engineering/01_Data_Engineering_Complete_Guide.pdf",
        "track": "sql"
      },
      "de_prac": {
        "title": "Data Engineering: Practice Book (20 Ex.)",
        "path": "05_System_Design/05_Data_Engineering/02_Data_Engineering_Practice_Book.pdf",
        "track": "sql"
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
      "hr_guide": {
        "title": "Interview, HR & Resume Guide",
        "path": "08_Interview_and_HR/01_Interview_HR_and_Resume_Guide.pdf",
        "track": "aiml"
      }
    },
    skills: [
      {
        "id": "dsa_toolkit",
        "track": "dsa",
        "short": "Python Toolkit & Big-O",
        "name": "Complexity & Python Toolkit",
        "desc": "Operation counting, deque/heapq/bisect/Counter costs, aliased grid & mutable default traps, 10^7 ops/s budgeting.",
        "resources": [
          "py_guide",
          "py_prac",
          "py_rev"
        ],
        "milestone": "Ch.1 + D1.1–D1.2"
      },
      {
        "id": "dsa_arrays",
        "track": "dsa",
        "short": "Arrays, Hash, 2-Ptr",
        "name": "Arrays, Strings, Hashing & Sliding Window",
        "desc": "Prefix sums, subarray sum k, variable/fixed sliding windows, Kadane, two pointers, matrix sweeps.",
        "resources": [
          "py_guide",
          "py_prac"
        ],
        "milestone": "Ch.2 + D1.3–D1.6"
      },
      {
        "id": "dsa_bsearch",
        "track": "dsa",
        "short": "Binary Search & Intv",
        "name": "Binary Search, Sorting & Intervals",
        "desc": "First-true lo < hi template, bisectbounds, monotonic answer space, merge/remove intervals, custom sort keys.",
        "resources": [
          "py_guide",
          "py_prac"
        ],
        "milestone": "Ch.3 + D2.1–D2.3"
      },
      {
        "id": "dsa_linear",
        "track": "dsa",
        "short": "Lists & Mono Stack",
        "name": "Linked Lists, Stacks, Queues & Monotonic Structures",
        "desc": "Dummy nodes, fast/slow pointers, bracket/eval stacks, next-greater & sliding-max monotonic stack/deque.",
        "resources": [
          "py_guide",
          "py_prac"
        ],
        "milestone": "Ch.4 + D2.4–D2.6"
      },
      {
        "id": "dsa_trees",
        "track": "dsa",
        "short": "Backtrack & Trees",
        "name": "Recursion, Backtracking, Binary Trees & BSTs",
        "desc": "Choose-explore-unchoose pruning, post-order state return, BFS level traversals, LCA, BST validation/serialise.",
        "resources": [
          "py_guide",
          "py_prac"
        ],
        "milestone": "Ch.5–6 + D3.1–D3.6"
      },
      {
        "id": "dsa_graphs",
        "track": "dsa",
        "short": "Heaps & Graphs",
        "name": "Heaps, Dict Internals & Graph Algorithms",
        "desc": "Top-k/running median with heapq, BFS/DFS, cycle checks, Kahn topo sort, Dijkstra/Bellman-Ford, DSU, MST.",
        "resources": [
          "py_guide",
          "py_prac",
          "mock_guide"
        ],
        "milestone": "Ch.7–8 + D4.1–D4.6"
      },
      {
        "id": "dsa_dp_adv",
        "track": "dsa",
        "short": "DP, Greedy, Tries",
        "name": "Dynamic Programming, Greedy, Bits & Tries",
        "desc": "State/transition/base, lru_cache vs tabulation, knapsack/stock DP, bit tricks, tries, Fenwick/KMP.",
        "resources": [
          "py_guide",
          "py_prac",
          "py_rev",
          "mock_work"
        ],
        "milestone": "Ch.9–12 + D5.1–D6.6"
      },
      {
        "id": "sql_model",
        "track": "sql",
        "short": "Modelling & DDL",
        "name": "Relational Modelling, DDL & Normalisation",
        "desc": "ER cardinality, PK/FK/CHECK constraints, types, ALTER TABLE, 1NF to BCNF lossless/dependency preservation.",
        "resources": [
          "sql_guide",
          "sql_prac",
          "sql_ref"
        ],
        "milestone": "MySQL Parts 1–3 & 13"
      },
      {
        "id": "sql_core",
        "track": "sql",
        "short": "DML, SELECT & Agg",
        "name": "DML, SELECT Depth, 3-Valued NULL & Aggregations",
        "desc": "INSERT/UPDATE/DELETE, ON DUPLICATE KEY aliases, NULL truth tables, GROUP BY, HAVING, ROLLUP, GROUP_CONCAT.",
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
        "id": "sql_windows",
        "track": "sql",
        "short": "Windows & Analytics",
        "name": "Window Functions & Analytics SQL",
        "desc": "ROW_NUMBER/RANK/DENSE_RANK, LAG/LEAD, frame clauses, retention cohorts, funnels, sessionisation & dedup.",
        "resources": [
          "sql_guide",
          "dsi_guide",
          "dsi_prac",
          "de_guide"
        ],
        "milestone": "Part 9 + DSI Ch.1 + Lakehouse"
      },
      {
        "id": "sql_perf",
        "track": "sql",
        "short": "Indexes & EXPLAIN",
        "name": "Views, Indexing Strategy & EXPLAIN Optimisation",
        "desc": "B+ tree leftmost prefix, covering indexes, range selectivity, DuckDB columnar Parquet scans & query plan tuning.",
        "resources": [
          "sql_guide",
          "de_guide",
          "de_prac"
        ],
        "milestone": "Part 10 + DE Ch.1–4"
      },
      {
        "id": "sql_tx",
        "track": "sql",
        "short": "ACID, Locks & Security",
        "name": "Transactions, Isolation Levels, Locking & Routines",
        "desc": "READ UNCOMMITTED to SERIALIZABLE, InnoDB MVCC & gap locks, deadlocks, stored procs/triggers, least privilege.",
        "resources": [
          "sql_guide",
          "sql_prac",
          "sql_rev"
        ],
        "milestone": "MySQL Parts 11–12 & 14–16"
      },
      {
        "id": "ml_stack",
        "track": "aiml",
        "short": "NumPy & pandas",
        "name": "Python Data Stack (NumPy, pandas, Matplotlib)",
        "desc": "Vectorised C-backed broadcasting, boolean masking, groupby/agg, safe merge without row blow-ups, EDA charts.",
        "resources": [
          "aiml_guide",
          "aiml_prac",
          "dsi_guide",
          "dsi_prac"
        ],
        "milestone": "AI/ML Pt 1 + DSI Ch.2"
      },
      {
        "id": "ml_math",
        "track": "aiml",
        "short": "ML Maths & Stats",
        "name": "Mathematics & Statistics for ML",
        "desc": "Dot products/projections, SVD/PCA, matrix calculus & backprop, Adam/convexity, Bayes/CLT/MLE, KL & hypothesis tests.",
        "resources": [
          "math_guide",
          "math_prac",
          "gate_warm"
        ],
        "milestone": "Math Ch.1–12 + GATE S1–S12"
      },
      {
        "id": "ml_classical",
        "track": "aiml",
        "short": "Classical ML",
        "name": "Classical ML & Leakage-Safe Pipelines",
        "desc": "Time/group splits, regularised linear/logistic models, trees/RF, PCA/k-means/GMM & baseline-first evaluation.",
        "resources": [
          "aiml_guide",
          "aiml_prac"
        ],
        "milestone": "AI/ML Parts 5–7"
      },
      {
        "id": "ml_applied",
        "track": "aiml",
        "short": "Applied DS & Causal",
        "name": "Applied Data Science (Boosting, A/B, Causal, TS)",
        "desc": "Out-of-fold encoding, LightGBM, SHAP, CUPED/SRM, DiD/RD/IV/uplift, walk-forward time series, survival & RecSys.",
        "resources": [
          "ads_guide",
          "ads_prac",
          "dsi_guide"
        ],
        "milestone": "ADS Ch.1–9 + Project 1"
      },
      {
        "id": "ml_dl",
        "track": "aiml",
        "short": "Deep Learning/PyTorch",
        "name": "Deep Learning & PyTorch Engineering",
        "desc": "Autograd, ResNets, LSTMs, Transformers/ViT/MoE, VAE/Diffusion, GNNs, DRL/PPO, pruning/int8 & DL debugging ladder.",
        "resources": [
          "dl_guide",
          "dl_prac",
          "aiml_guide"
        ],
        "milestone": "DL Ch.1–14 + Project 2"
      },
      {
        "id": "ml_llm_rag",
        "track": "aiml",
        "short": "LLMs, LoRA & RAG",
        "name": "LLMs, LoRA/QLoRA Fine-Tuning & Evaluated RAG",
        "desc": "Tokenisation, LoRA vs prompting cost-latency trade-offs, structure-aware chunking, BM25+FAISS hybrid, recall@k & citations.",
        "resources": [
          "aiml_guide",
          "aiml_prac",
          "rag_ws"
        ],
        "milestone": "AI/ML Pt 10–11 + Projects 3 & 4"
      },
      {
        "id": "ml_agents",
        "track": "aiml",
        "short": "Agents & Routing",
        "name": "Agentic AI, MCP & Multi-Agent Routing",
        "desc": "Tested tool loops, memory, MCP integration, prompt-injection defence, cost-aware model routing & trajectory evals.",
        "resources": [
          "aiml_guide",
          "aiml_prac",
          "rag_ws"
        ],
        "milestone": "AI/ML Pt 12–13 + Project 5"
      },
      {
        "id": "ml_sys_ops",
        "track": "aiml",
        "short": "ML Sys & MLOps",
        "name": "ML System Design, MLOps & DS Interviews",
        "desc": "Framing/leakage, feature stores, calibration, MLflow, Pandera, pytest ML, FastAPI+ONNX, canary drift, LLMOps & cases.",
        "resources": [
          "mlsd_guide",
          "mlsd_prac",
          "mlops_guide",
          "mlops_prac",
          "dsi_guide",
          "hr_guide"
        ],
        "milestone": "MLSD + MLOps + DSI + HR"
      }
    ],
    months: [
      {
        "id": 1,
        "title": "Month 1: Foundations Sprint",
        "period": "1 Dec – 28 Dec 2026",
        "phase": "Phase 1 • Core 12-Week Sprint",
        "weeks": [
          1,
          2,
          3,
          4
        ],
        "summary": "Lock in Python complexity rules, arrays/two-pointers, binary search, monotonic stacks and backtracking alongside relational DDL/DML/SELECT/GROUP BY, plus NumPy/pandas and the complete ML maths core.",
        "skills": [
          "dsa_toolkit",
          "dsa_arrays",
          "dsa_bsearch",
          "dsa_linear",
          "dsa_trees",
          "sql_model",
          "sql_core",
          "ml_stack",
          "ml_math"
        ],
        "targets": [
          {
            "id": "m1_t1",
            "track": "dsa",
            "text": "Complete DSA in Python Ch.1–5 and pass D1.1–D3.3 (15 exercises) + 3-5 daily pattern problems.",
            "tag": "Ch.1–5 • 15 Ex."
          },
          {
            "id": "m1_t2",
            "track": "sql",
            "text": "Finish MySQL Parts 1–6 (Modelling, DDL, DML, NULL-safe SELECT & Aggregation) and run Parts 1–6 queries.",
            "tag": "Parts 1–6"
          },
          {
            "id": "m1_t3",
            "track": "aiml",
            "text": "Master NumPy/pandas (AI/ML Pt 1 + DSI Ch.2) & full Mathematics for ML (Ch.1–12, nq Parts 1–8) + GATE S1–S4.",
            "tag": "Maths + Stack"
          },
          {
            "id": "m1_t4",
            "track": "aiml",
            "text": "Check off zero-leakage linear/logistic regression & gradient descent from scratch in NumPy before touching trees.",
            "tag": "From-Scratch Gate"
          }
        ]
      },
      {
        "id": 2,
        "title": "Month 2: Trees, Graphs, Joins, Windows & Applied DS",
        "period": "29 Dec 2026 – 25 Jan 2027",
        "phase": "Phase 1 • Core 12-Week Sprint",
        "weeks": [
          5,
          6,
          7,
          8
        ],
        "summary": "Climb into trees/BSTs, heaps and full graph algorithms while mastering SQL Joins, CTEs, Window Functions & EXPLAIN indexes, plus Classical ML and Applied Data Science shipped as Portfolio Project 1.",
        "skills": [
          "dsa_trees",
          "dsa_graphs",
          "sql_joins",
          "sql_windows",
          "sql_perf",
          "ml_classical",
          "ml_applied"
        ],
        "targets": [
          {
            "id": "m2_t1",
            "track": "dsa",
            "text": "Finish DSA Ch.6–8 (Trees/BSTs, Heaps, BFS/DFS/Topo, Dijkstra/DSU/MST) & solve D3.4–D4.6.",
            "tag": "Ch.6–8 • 9 Ex."
          },
          {
            "id": "m2_t2",
            "track": "sql",
            "text": "Complete MySQL Parts 7–10 (Joins, Subqueries, Recursive CTEs, Window Functions & B-Tree Indexing/EXPLAIN).",
            "tag": "Parts 7–10"
          },
          {
            "id": "m2_t3",
            "track": "aiml",
            "text": "Finish AI/ML Parts 5–7 & Applied Data Science Ch.1–9 (LightGBM, SHAP, CUPED/A/B, Causal, TS, RecSys) + GATE S5–S8.",
            "tag": "ADS + Classical"
          },
          {
            "id": "m2_t4",
            "track": "aiml",
            "text": "Ship Portfolio Project 1 (Household Energy-Demand Forecasting) with walk-forward backtest, baselines & quantile intervals.",
            "tag": "Project 1 Shipped"
          }
        ]
      },
      {
        "id": 3,
        "title": "Month 3: DP, Transactions, Deep Learning & IoT Project",
        "period": "26 Jan – 22 Feb 2027",
        "phase": "Phase 1 • Sprint Finale (End of 12-Week Plan)",
        "weeks": [
          9,
          10,
          11,
          12
        ],
        "summary": "Finish the 12-week Python DSA + SQL roadmap (DP, Greedy, Bits, Tries, Transactions, Normalisation, Revision) alongside PyTorch Deep Learning core, GATE Warm-up S9–S12, and Portfolio Project 2.",
        "skills": [
          "dsa_dp_adv",
          "sql_tx",
          "sql_model",
          "ml_dl",
          "ml_math"
        ],
        "targets": [
          {
            "id": "m3_t1",
            "track": "dsa",
            "text": "Complete DSA Ch.9–12, solve D5.1–D6.6, finish Quick Revision (13p) and sit Mock Loop A coding round.",
            "tag": "12-Week DSA Done"
          },
          {
            "id": "m3_t2",
            "track": "sql",
            "text": "Complete MySQL Parts 11–16 (Transactions/MVCC, Routines, Normalisation, Security, Classic Queries & Quick Revision).",
            "tag": "16/16 SQL Parts"
          },
          {
            "id": "m3_t3",
            "track": "aiml",
            "text": "Complete DL Ch.1–6, Ch.12 & 14 (Autograd, CNNs, Sequences, Transformers, IoT/Energy & Debugging) + GATE S9–S12.",
            "tag": "DL Core + GATE S12"
          },
          {
            "id": "m3_t4",
            "track": "aiml",
            "text": "Ship Portfolio Project 2 (IoT Sensor Anomaly Detection: Z-score -> Isolation Forest -> PyTorch Autoencoder + FastAPI).",
            "tag": "Project 2 Shipped"
          }
        ]
      },
      {
        "id": 4,
        "title": "Month 4: Analytics SQL, Frontier DL & LoRA Fine-Tuning",
        "period": "23 Feb – 22 Mar 2027",
        "phase": "Phase 2 • AI Engineering & Interview Peak",
        "weeks": [
          13,
          14,
          15,
          16
        ],
        "summary": "Keep DSA sharp under strict 45-min maintenance cadence while diving into Interview Analytics SQL, DuckDB Lakehouse SQL, Generative/GNN/RL/Edge DL frontiers, LLMs and Portfolio Project 4.",
        "skills": [
          "dsa_arrays",
          "dsa_trees",
          "dsa_graphs",
          "dsa_dp_adv",
          "sql_windows",
          "sql_perf",
          "ml_dl",
          "ml_llm_rag"
        ],
        "targets": [
          {
            "id": "m4_t1",
            "track": "dsa",
            "text": "Run 4 weekly pattern maintenance sprints (Arrays, Trees/Heaps, Graphs, DP) + Loop B Coding & Redo queue clearance.",
            "tag": "Speed + Loop B"
          },
          {
            "id": "m4_t2",
            "track": "sql",
            "text": "Master Analytics SQL (DSI Ch.1 + iq Pt 1: funnels, cohorts, sessions) & Data Engineering DuckDB Lakehouse SQL (DE Ch.1–4).",
            "tag": "Analytics + DuckDB"
          },
          {
            "id": "m4_t3",
            "track": "aiml",
            "text": "Complete DL Ch.7–11, 13 & Appendix (VAE/Diffusion, Power-Grid GNNs, PPO, Multimodal, Quantisation/Pruning) + LLM foundations.",
            "tag": "Frontier DL + LLMs"
          },
          {
            "id": "m4_t4",
            "track": "aiml",
            "text": "Ship Portfolio Project 4 (Fine-Tuning Study: Prompted LLM baseline vs LoRA/QLoRA small model on structured extraction).",
            "tag": "Project 4 Shipped"
          }
        ]
      },
      {
        "id": 5,
        "title": "Month 5: Evaluated RAG, Agentic AI & Query Clinics",
        "period": "23 Mar – 19 Apr 2027",
        "phase": "Phase 2 • AI Engineering & Interview Peak",
        "weeks": [
          17,
          18,
          19,
          20
        ],
        "summary": "Transition to production LLM engineering: hybrid BM25+FAISS RAG, reranking/citations, tool-using MCP agent loops, prompt-injection defence & cost-aware routing (Projects 3 & 5) plus SQL tuning & OA sims.",
        "skills": [
          "dsa_linear",
          "dsa_dp_adv",
          "sql_perf",
          "sql_windows",
          "sql_tx",
          "ml_llm_rag",
          "ml_agents"
        ],
        "targets": [
          {
            "id": "m5_t1",
            "track": "dsa",
            "text": "Pass timed 2-problem OA simulation & Loop C Hard coding round with complexity and edge-case walkthroughs.",
            "tag": "OA + Loop C"
          },
          {
            "id": "m5_t2",
            "track": "sql",
            "text": "Complete EXPLAIN Query Tuning Clinic, 5-query timed Analytics Mock and an end-to-end funnel/mix-shift SQL diagnosis.",
            "tag": "SQL Tuning + Case"
          },
          {
            "id": "m5_t3",
            "track": "aiml",
            "text": "Build & ship Portfolio Project 3 (Evaluated RAG Assistant: 100+ eval Qs, recall@k, faithfulness & chunk/rerank ablations).",
            "tag": "Project 3 Shipped"
          },
          {
            "id": "m5_t4",
            "track": "aiml",
            "text": "Build & ship Portfolio Project 5 (Multi-Agent System with Cost-Aware Model Routing, prompt-injection tests & paper link).",
            "tag": "Project 5 Shipped"
          }
        ]
      },
      {
        "id": 6,
        "title": "Month 6: ML System Design, MLOps & Placement Capstone",
        "period": "20 Apr – 17 May 2027",
        "phase": "Phase 2 • AI Engineering & Interview Peak",
        "weeks": [
          21,
          22,
          23,
          24
        ],
        "summary": "Unify engineering, ML architecture, production MLOps, probability/stats/product cases and mock interview loops so every coding, SQL, ML design and HR story round is interview-ready.",
        "skills": [
          "dsa_toolkit",
          "dsa_graphs",
          "dsa_dp_adv",
          "sql_windows",
          "sql_tx",
          "ml_applied",
          "ml_sys_ops"
        ],
        "targets": [
          {
            "id": "m6_t1",
            "track": "dsa",
            "text": "Sprint top 20 coding patterns, complete 13-page Python Quick Revision, zero-out Redo Queue and pass Workbook timed coding.",
            "tag": "Interview Ready"
          },
          {
            "id": "m6_t2",
            "track": "sql",
            "text": "Ace timed analytics SQL mock (iq Pt 1), schema/index trade-off mock and MySQL Quick Revision review.",
            "tag": "SQL Interview Peak"
          },
          {
            "id": "m6_t3",
            "track": "aiml",
            "text": "Finish ML System Design (Ch.1–10 + 29 ex.) & MLOps (Ch.1–11 + 24 ex.: MLflow, Pandera, pytest, ONNX Int8, LLMOps).",
            "tag": "MLSD + MLOps"
          },
          {
            "id": "m6_t4",
            "track": "aiml",
            "text": "Complete DS Interview Prep (Prob/Stats/Metrics/Cases, iq Pts 2–4), polish all 5 Project READMEs, resume & STAR bank.",
            "tag": "Full Portfolio + HR"
          }
        ]
      }
    ],
    weeks: [
    {
      id: 1,
      month: 1,
      title: "Complexity, Arrays, Hashing & DB Modelling",
      focus: ["Ch.1–2 (D1.1–D1.6)","MySQL Parts 1–2","Python/NumPy/pandas + GATE S1"],
      practiceTag: "D1.1–D1.6 • Parts 1–2 • GATE S1",
      targets: [
        {"id":"w1_d","track":"dsa","text":"Finish Ch.1–2, master deque/heapq/bisect/Counter costs & Python grid/default-arg traps; solve D1.1–D1.6."},
        {"id":"w1_s","track":"sql","text":"Complete MySQL Parts 1–2 (Architecture, Data Dictionary, ER Cardinality & Keys) + run college DB."},
        {"id":"w1_a","track":"aiml","text":"Complete AI/ML Pt 1 + DSI Ch.2 pandas safe-merge drills + GATE Warm-up Session 1 (Counting)."}
      ],
      days: [
        [
          ["dsa",["dsa_toolkit"],"Ch.1 Big-O Counting & Built-in Costs","Run loop operation counters, benchmark C built-ins, and review the 10^7 ops/s constraint table.","py_guide",1.2],
          ["sql",["sql_model"],"MySQL Pt 1: RDBMS & Architecture","Inspect relational algebra operators (sigma, pi, join), client commands and load the college database.","sql_guide",0.8],
          ["aiml",["ml_stack"],"AI/ML Pt 1: Python for Java Devs","Practice list comprehensions, Counter, defaultdict, dataclasses, generators and mutable default trap.","aiml_guide",1.5]
        ],
        [
          ["dsa",["dsa_toolkit"],"Ch.1 Python Traps & D1.1–D1.2","Solve D1.1 (First repeated element) and D1.2 (Predict Python aliasing/floor-div/default-arg traps).","py_prac",1.5],
          ["sql",["sql_model"],"MySQL Pt 1 Practice Questions","Solve Practice Book Part 1 queries on information_schema and data dictionary inspection.","sql_prac",0.8],
          ["aiml",["ml_stack"],"NumPy Vectorisation & Broadcasting","Rebuild dot product, boolean masks, axis reductions and reshaped views without Python loops.","aiml_guide",1.5]
        ],
        [
          ["dsa",["dsa_arrays"],"Ch.2 Prefix Sums & Hashing Patterns","Code subarray sum equals k with prefix map and solve D1.3 (Product except self) from memory.","py_guide",1.5],
          ["sql",["sql_model"],"MySQL Pt 2: ER Diagrams & Keys","Model 1:1, 1:N and M:N cardinalities, superkey vs candidate key, and foreign key cascades.","sql_guide",0.9],
          ["aiml",["ml_stack"],"pandas Core & Grouping Drills","Work through DSI Ch.2 groupby/agg, date offsets and avoiding merge row-multipliers + Ex. 1–3.","dsi_guide",1.5]
        ],
        [
          ["dsa",["dsa_arrays"],"Ch.2 Sliding Window & Two Pointers","Implement variable/fixed sliding windows & D1.4 (Longest subarray sum k), D1.5 (At most k distinct).","py_prac",1.6],
          ["sql",["sql_model"],"MySQL Pt 2 Schema Practice","Solve Practice Book Part 2 modelling scenarios and verify PK/FK/UNIQUE constraints on SQL.","sql_prac",0.9],
          ["aiml",["ml_stack"],"Matplotlib Visuals & AI/ML Pt 1 Ex.","Build multi-panel diagnostic plots in Matplotlib and solve AI/ML Practice Book Part 1 exercises.","aiml_prac",1.4]
        ],
        [
          ["dsa",["dsa_arrays"],"D1.6 Trapping Rain Water + 4 Drill Problems","Solve D1.6 in O(n) time / O(1) space and drill 4 LeetCode Array/Sliding-Window problems.","py_prac",1.5],
          ["sql",["sql_core"],"MySQL Command Reference Bookmarking","Audit DDL/DML syntax templates in Commands Reference and verify college seed tables.","sql_ref",0.8],
          ["aiml",["ml_math"],"GATE Warm-up Session 1: Counting","Timed 1-hr Saturday set: product/sum rules, bijection counting & parity traps (check Python scripts).","gate_warm",1.2]
        ],
        [
          ["dsa",["dsa_toolkit","dsa_arrays"],"Re-implement Ch.1–2 Core Templates","Write sliding window, prefix-hash & deque/heapq templates from a blank file in under 20 min.","py_guide",1.3],
          ["sql",["sql_model"],"Design Mini Multi-Tenant ER Schema","Translate 3 real entities (Users, Orders, AuditLog) into SQL DDL with CHECK & FK actions.","sql_guide",0.9],
          ["aiml",["ml_stack"],"DSI pandas Practice & Learning Log","Solve DSI Practice Book Pt 2 pandas exercises and write Week 1 reflection paragraph.","dsi_prac",1.4]
        ],
        [
          ["dsa",["dsa_arrays"],"Week 1 Timed Check & Error Log","Sit 2 timed Medium array/window problems (25m each) and log every edge-case bug.","py_rev",1.3],
          ["sql",["sql_model"],"MySQL Parts 1–2 Timed Recall","Answer 6 conceptual questions on candidate keys, referential integrity and storage engines.","sql_rev",0.8],
          ["aiml",["ml_stack"],"Vectorised Feature Prep Mini-Lab","Combine NumPy + pandas to build lag features & z-scores on synthetic smart-meter data.","aiml_prac",1.4]
        ]
      ]
    },
    {
      id: 2,
      month: 1,
      title: "Binary Search, Intervals, DDL & Linear Algebra",
      focus: ["Ch.3 (D2.1–D2.3)","MySQL Parts 3–4","Math Ch.1–3 (SVD/PCA) + GATE S2"],
      practiceTag: "D2.1–D2.3 • Parts 3–4 • GATE S2",
      targets: [
        {"id":"w2_d","track":"dsa","text":"Lock in the first-true lo < hi binary search template, bisect & intervals; solve D2.1–D2.3."},
        {"id":"w2_s","track":"sql","text":"Complete MySQL Parts 3–4 (DDL types, JSON/generated cols, DML & upserts) + Parts 3–4 practice."},
        {"id":"w2_a","track":"aiml","text":"Finish Math Ch.1–3 (Vectors, Matrices, Eigenvalues/SVD/PCA), nq Pt 1 & GATE Session 2."}
      ],
      days: [
        [
          ["dsa",["dsa_bsearch"],"Ch.3 First-True Binary Search & bisect","Internalise monotonic invariant (lo < hi) and bisect_left/right usage; solve D2.2.","py_guide",1.4],
          ["sql",["sql_model"],"MySQL Pt 3: DDL Numeric, String & Date Types","Compare DECIMAL vs FLOAT, DATETIME vs TIMESTAMP, ENUM, JSON & generated columns.","sql_guide",0.9],
          ["aiml",["ml_math"],"Math Ch.1: Vectors, Norms & Projections","Derive Cauchy-Schwarz, cosine similarity & orthogonal projection; run NumPy checks.","math_guide",1.5]
        ],
        [
          ["dsa",["dsa_bsearch"],"Ch.3 Binary Search on the Answer & D2.1","Solve D2.1 (Koko eating bananas) + rotated array search tested against brute force.","py_prac",1.5],
          ["sql",["sql_model"],"MySQL Pt 3: Constraints, AUTO_INCREMENT & ALTER","Practice inline/table CHECK constraints, ALTER TABLE migrations & temporary/copy tables.","sql_prac",0.9],
          ["aiml",["ml_math"],"Math Ch.2: Matrices, Rank & Ax = b","Compare 4 readings of matrix multiplication, determinants, conditioning & linear systems.","math_guide",1.5]
        ],
        [
          ["dsa",["dsa_bsearch"],"Ch.3 Sorting, Custom Keys & D2.3 Intervals","Solve D2.3 (Fewest removals for no overlap), merge intervals and tuple key sorting.","py_prac",1.5],
          ["sql",["sql_core"],"MySQL Pt 4: INSERT, UPDATE, DELETE & Upserts","Master multi-row inserts, safe WHERE deletes and AS new ON DUPLICATE KEY UPDATE trap.","sql_guide",0.9],
          ["aiml",["ml_math"],"Math Ch.3: Eigenvalues, SVD & PCA","Implement power iteration / SVD compression from scratch and compare variance retained.","math_guide",1.6]
        ],
        [
          ["dsa",["dsa_bsearch"],"4 Binary Search & Interval Pattern Drills","Solve 4 LeetCode problems tagged Binary Search / Intervals under 25m cap.","py_guide",1.5],
          ["sql",["sql_core"],"MySQL Pt 4 DML Practice Problems","Execute Practice Book Part 4 DML queries and verify idempotent upsert outputs.","sql_prac",0.9],
          ["aiml",["ml_math"],"Math Practice Book Pt 1 (Linear Algebra)","Solve nq Part 1 Linear Algebra exercises and verify every answer numerically in Python.","math_prac",1.5]
        ],
        [
          ["dsa",["dsa_bsearch"],"BS On-Answer Edge Case Audit","Review off-by-one bounds (hi = mid vs hi = mid-1, empty/single-element inputs).","py_rev",1.2],
          ["sql",["sql_model"],"Schema Migration Dry Run","Write idempotent DDL + backfill DML script cleanly in MySQL syntax.","sql_ref",0.8],
          ["aiml",["ml_math"],"GATE Warm-up Session 2: Permutations & Comb.","Timed 1-hr Saturday session: nCr identities, circular arrangements & constraints.","gate_warm",1.2]
        ],
        [
          ["dsa",["dsa_arrays","dsa_bsearch"],"Week 1 Redo & BS Template Recall","Redo all Week 1 ~ tasks from blank files; rewrite first-true binary search blind.","py_prac",1.4],
          ["sql",["sql_core"],"Upsert & Data-Type Bug Drill","Test strict-mode truncation, CHAR vs VARCHAR trailing spaces & upsert ambiguity.","sql_guide",0.9],
          ["aiml",["ml_math"],"AI/ML Guide Pt 2 + Pt 2 Exercises","Finish AI/ML Pt 2 Linear Algebra review and complete AI/ML Practice Book Part 2.","aiml_prac",1.5]
        ],
        [
          ["dsa",["dsa_bsearch"],"Week 2 Mixed Mini-Mock (2 Problems)","Time 2 unseen BS + Interval problems in 50 min total; log any TLE or WA patterns.","py_guide",1.4],
          ["sql",["sql_model","sql_core"],"Parts 3–4 Quiz Check","Self-test 8 DDL/DML questions without consulting the reference.","sql_rev",0.8],
          ["aiml",["ml_math"],"SVD Image/Matrix Reconstruction Mini-Script","Inspect singular-value dropoff on synthetic correlated features and update Week 2 log.","math_guide",1.3]
        ]
      ]
    },
    {
      id: 3,
      month: 1,
      title: "Lists, Monotonic Stacks, SELECT & Calculus/Optim",
      focus: ["Ch.4 (D2.4–D2.6)","MySQL Part 5","Math Ch.4–6 (Grad/Optim) + GATE S3"],
      practiceTag: "D2.4–D2.6 • Part 5 • GATE S3",
      targets: [
        {"id":"w3_d","track":"dsa","text":"Master dummy-head linked lists, fast/slow pointers, stacks & monotonic deque; solve D2.4–D2.6."},
        {"id":"w3_s","track":"sql","text":"Finish MySQL Part 5 (SELECT, 3-valued NULL truth tables, LIKE/REGEXP & functions) + Pt 5 practice."},
        {"id":"w3_a","track":"aiml","text":"Complete Math Ch.4–6 (Calculus, Gradients/Backprop, SGD/Momentum/Adam), nq Pts 2–4 & GATE S3."}
      ],
      days: [
        [
          ["dsa",["dsa_linear"],"Ch.4 Linked Lists & D2.4 Add Two Numbers","Practice dummy node pattern, reversal, cycle detection & solve D2.4 cleanly.","py_prac",1.5],
          ["sql",["sql_core"],"MySQL Pt 5: SELECT Filtering & Sorting","Drill WHERE vs ORDER BY vs LIMIT/OFFSET edge cases and composite sorting.","sql_guide",0.9],
          ["aiml",["ml_math"],"Math Ch.4: Derivatives, Jacobians & Hessians","Compute partial derivatives analytically and verify with centered finite differences.","math_guide",1.5]
        ],
        [
          ["dsa",["dsa_linear"],"Ch.4 Stacks & D2.5 Min Stack","Build expression evaluation & bracket matching stacks; implement O(1) Min Stack (D2.5).","py_prac",1.4],
          ["sql",["sql_core"],"MySQL Pt 5: 3-Valued Logic & NULL Traps","Trace UNKNOWN with NOT IN, NULL != 1, COALESCE and NULL-safe <=> operator.","sql_guide",0.9],
          ["aiml",["ml_math"],"Math Ch.5: Gradients of Losses & Autodiff","Derive BCE, MSE and Softmax-CE gradients by hand; build micro computation graph.","math_guide",1.6]
        ],
        [
          ["dsa",["dsa_linear"],"Ch.4 Monotonic Stack & D2.6 Subarray Mins","Implement monotonic queue sliding-window max and solve D2.6 (Hard, mod 10^9+7) in O(n).","py_prac",1.7],
          ["sql",["sql_core"],"MySQL Pt 5 & Pt 8 Built-in Functions","Practice string, numeric, date/time and CAST/CONVERT functions against sample rows.","sql_ref",0.9],
          ["aiml",["ml_math"],"Math Ch.6: Convexity, GD, Momentum & Adam","Run step-size stability, momentum & Adam vs Rosenbrock scripts; observe overshoot traps.","math_guide",1.5]
        ],
        [
          ["dsa",["dsa_linear"],"4 Monotonic Stack & Linked List Drills","Solve Daily Temperatures, Largest Rectangle in Histogram + 2 list pointer problems.","py_guide",1.5],
          ["sql",["sql_core"],"MySQL Pt 5 Practice Book Queries","Complete all Practice Book Part 5 SELECT/NULL/expression exercises from blank editor.","sql_prac",1],
          ["aiml",["ml_math"],"Math Practice Book Pts 2–4","Solve nq Part 2 (Calc), Part 3 (Gradients) and Part 4 (Optimisation) with code checks.","math_prac",1.6]
        ],
        [
          ["dsa",["dsa_linear"],"Strict O(n) Monotonic Invariant Proof","Document previous-smaller/next-smaller-equal duplicate tie-breaking rules in error log.","py_rev",1.2],
          ["sql",["sql_core"],"Three-Valued Logic Edge Drill","Test NULL IN (1, NULL) vs NULL NOT IN vs NOT EXISTS on empty & NULL rows.","sql_guide",0.8],
          ["aiml",["ml_math"],"GATE Warm-up Session 3: Probability Axioms","Timed 1-hr Saturday set: sample spaces, Boole's inequality & symmetric events.","gate_warm",1.2]
        ],
        [
          ["dsa",["dsa_bsearch","dsa_linear"],"Week 2 Redo + D2.6 Timed Re-solve","Re-solve Week 2 ~ items + rewrite D2.6 Subarray Minimums without looking at notes.","py_prac",1.5],
          ["sql",["sql_core"],"Regex & Date Arithmetic Queries","Write 5 employee hire-tenure and email/string validation queries.","sql_ref",0.8],
          ["aiml",["ml_math"],"AI/ML Guide Pt 3 + Pt 3 Exercises","Finish AI/ML Pt 3 Optimisation guide & Practice Book Part 3 problems.","aiml_prac",1.4]
        ],
        [
          ["dsa",["dsa_linear"],"Week 3 Mixed Mini-Mock (Stack + List)","Solve 2 unseen problems in 50 min; check Python list-as-stack vs deque usage.","py_guide",1.4],
          ["sql",["sql_core"],"Execution Order Quiz (FROM -> LIMIT)","Trace logical evaluation order explaining why WHERE rejects SELECT column aliases.","sql_guide",0.8],
          ["aiml",["ml_math"],"NumPy Gradient Descent From Scratch","Code linear & logistic GD in pure NumPy comparing GD vs Momentum vs Adam convergence.","aiml_guide",1.4]
        ]
      ]
    },
    {
      id: 4,
      month: 1,
      title: "Backtracking, Aggregation & ML Probability/Stats",
      focus: ["Ch.5 (D3.1–D3.3)","MySQL Part 6","Math Ch.7–12 + GATE S4"],
      practiceTag: "D3.1–D3.3 • Part 6 • GATE S4",
      targets: [
        {"id":"w4_d","track":"dsa","text":"Internalise choose-explore-unchoose backtracking, pruning & recursion cost; solve D3.1–D3.3."},
        {"id":"w4_s","track":"sql","text":"Complete MySQL Part 6 (GROUP BY, HAVING, WITH ROLLUP & GROUP_CONCAT) + Pt 6 practice."},
        {"id":"w4_a","track":"aiml","text":"Finish Math Ch.7–12 (Prob, CLT, MLE/MAP, Hypothesis Tests, Info Theory, LinReg) + nq Pts 5–8 + GATE S4."}
      ],
      days: [
        [
          ["dsa",["dsa_trees"],"Ch.5 Backtracking Template & D3.1 Parentheses","Build choose-explore-unchoose template, copy-on-record rule, and solve D3.1.","py_guide",1.5],
          ["sql",["sql_core"],"MySQL Pt 6: GROUP BY & HAVING Semantics","Contrast row filter (WHERE) vs group filter (HAVING) and COUNT(*) vs COUNT(col).","sql_guide",0.9],
          ["aiml",["ml_math"],"Math Ch.7–8: Distributions, CLT & Std Error","Simulate Bernoulli/Binomial/Poisson/Normal draws and verify 1/sqrt(n) SE decay.","math_guide",1.5]
        ],
        [
          ["dsa",["dsa_trees"],"Ch.5 Combinatorics & D3.2 Phone Keypad","Solve D3.2 (lexicographic keypad combinations) + subsets/permutations with duplicates.","py_prac",1.5],
          ["sql",["sql_core"],"MySQL Pt 6: WITH ROLLUP & GROUP_CONCAT","Write multi-level summary reports using GROUP BY ... WITH ROLLUP and GROUP_CONCAT ordering.","sql_guide",0.9],
          ["aiml",["ml_math"],"Math Ch.9: MLE, MAP & Bayesian Inference","Derive Gauss/Bernoulli MLE, L2 as Gaussian MAP prior, and 1/n vs 1/(n-1) MSE proof.","math_guide",1.6]
        ],
        [
          ["dsa",["dsa_trees"],"Ch.5 Pruning, Grid DFS & D3.3 Palindrome Split","Solve D3.3 (Palindrome partitioning) + N-Queens/Word Search pruning analysis.","py_prac",1.6],
          ["sql",["sql_core"],"MySQL Pt 6 Aggregation Practice Set","Solve Practice Book Part 6 queries handling departments with zero employees (Karan/HR).","sql_prac",1],
          ["aiml",["ml_math"],"Math Ch.10–11: p-Values, Bootstrap & Info Theory","Run peeking-test simulation, bootstrap CIs, entropy, cross-entropy & KL divergence checks.","math_guide",1.6]
        ],
        [
          ["dsa",["dsa_trees"],"4 Backtracking & Pruning LeetCode Drills","Practice Combination Sum, Subsets II & Word Search under strict 30m limit.","py_guide",1.5],
          ["sql",["sql_core"],"SQL Aggregation Edge-Case Drill","Test ONLY_FULL_GROUP_BY errors, NULL groups and conditional SUM(CASE WHEN...).","sql_ref",0.9],
          ["aiml",["ml_math"],"Math Practice Book Pts 5–6","Solve nq Part 5 (Probability & Limit Theorems) and Part 6 (Estimation) numerically.","math_prac",1.5]
        ],
        [
          ["dsa",["dsa_trees"],"Python Recursion Limit & State Mutability Check","Verify sys.setrecursionlimit vs iterative stack and tuple/slice path state copies.","py_rev",1.2],
          ["sql",["sql_core"],"Conditional Aggregation Matrix Report","Write a single-pass pivot query aggregating salaries by dept and tenure band.","sql_prac",0.9],
          ["aiml",["ml_math"],"GATE Warm-up Session 4: Conditional Prob.","Timed 1-hr Saturday set: conditioning, multiplication rule & Monty-Hall variants.","gate_warm",1.2]
        ],
        [
          ["dsa",["dsa_linear","dsa_trees"],"Week 3 Redo + Backtracking Mock","Re-solve Week 3 ~ items + solve 1 unseen grid-backtracking question clean.","py_prac",1.5],
          ["sql",["sql_core"],"MySQL Parts 1–6 Cumulative Recap","Review schema modelling, DDL/DML, NULL rules & aggregation edge cases.","sql_rev",0.9],
          ["aiml",["ml_math"],"Math Ch.12 & nq Pts 7–8 (Inference & Reg.)","Tie linear algebra, calculus & stats into OLS from first principles + solve nq Pts 7–8.","math_prac",1.6]
        ],
        [
          ["dsa",["dsa_arrays","dsa_bsearch","dsa_linear","dsa_trees"],"Month 1 DSA Checkpoint (2 Problems)","Sit 2 timed unseen Medium problems across Ch.1–5; audit complexity & clean code.","py_guide",1.5],
          ["sql",["sql_model","sql_core"],"Month 1 SQL Checkpoint Quiz","Complete 8 mixed DDL/DML/SELECT/GROUP BY queries cleanly without syntax errors.","sql_prac",1],
          ["aiml",["ml_math"],"AI/ML Pt 4 + nq Month 1 Formula Review","Complete AI/ML Practice Pt 4 + review Math Ch.13 formula sheet before Month 2.","aiml_prac",1.5]
        ]
      ]
    },
    {
      id: 5,
      month: 2,
      title: "Trees, BSTs, Joins in Depth & Classical ML",
      focus: ["Ch.6 (D3.4–D3.6)","MySQL Part 7","AI/ML Pts 5–6 (Classical ML) + GATE S5"],
      practiceTag: "D3.4–D3.6 • Part 7 • GATE S5",
      targets: [
        {"id":"w5_d","track":"dsa","text":"Master tree traversals, bottom-up state return, LCA & BST ops; solve D3.4–D3.6."},
        {"id":"w5_s","track":"sql","text":"Master MySQL Part 7 Joins (INNER, LEFT/RIGHT, CROSS, SELF, anti-joins & ON vs WHERE)."},
        {"id":"w5_a","track":"aiml","text":"Complete AI/ML Parts 5–6 (Workflow, Metrics, Linear/Logistic, Regularisation, Trees/RF) + GATE S5."}
      ],
      days: [
        [
          ["dsa",["dsa_trees"],"Ch.6 Tree Traversals & D3.4 Zigzag Order","Implement pre/in/post iterative & recursive traversals and BFS D3.4 with deque.","py_guide",1.5],
          ["sql",["sql_joins"],"MySQL Pt 7: INNER, LEFT & Anti-Joins","Query missing relations (HR dept with 0 employees, Karan without dept) via LEFT JOIN + IS NULL.","sql_guide",0.9],
          ["aiml",["ml_classical"],"AI/ML Pt 5: ML Workflow, Splits & Metrics","Implement leakage-free Pipeline, stratified/time split, ROC-AUC vs PR-AUC & calibration.","aiml_guide",1.5]
        ],
        [
          ["dsa",["dsa_trees"],"Ch.6 Bottom-Up Recursion & D3.5 LCA","Solve diameter, balanced check & D3.5 (Lowest Common Ancestor in non-BST).","py_prac",1.5],
          ["sql",["sql_joins"],"MySQL Pt 7: Self-Joins & Multi-Table Joins","Write employee-manager reporting hierarchy queries & avoid ON vs WHERE LEFT JOIN bugs.","sql_guide",0.9],
          ["aiml",["ml_classical"],"AI/ML Pt 5 Exercises (ML Foundations)","Complete AI/ML Practice Book Part 5 covering baselines, cross-validation & overfitting.","aiml_prac",1.4]
        ],
        [
          ["dsa",["dsa_trees"],"Ch.6 BST Ops, Serialisation & D3.6 Paths","Code validate BST, kth smallest, codec serialisation & D3.6 (Downward paths sum k).","py_prac",1.6],
          ["sql",["sql_joins"],"MySQL Pt 7 Practice Book Join Drills","Solve Practice Book Part 7 join scenarios cleanly and verify row counts.","sql_prac",1],
          ["aiml",["ml_classical"],"AI/ML Pt 6: Linear/Logistic, SVM & L1/L2","Compare Ridge vs Lasso feature selection & decision boundaries in scikit-learn.","aiml_guide",1.5]
        ],
        [
          ["dsa",["dsa_trees"],"4 Tree & BST LeetCode Drills","Solve Construct Tree Pre/Inorder, Serialize Binary Tree & Path Sum III variants.","py_guide",1.5],
          ["sql",["sql_joins"],"Multi-Way Join Cardinality & Fan-out Check","Identify 1:N join row duplication and aggregate before joining to fix inflated totals.","sql_ref",0.9],
          ["aiml",["ml_classical"],"AI/ML Pt 6: Decision Trees & Random Forests","Train Gini/Entropy tree from scratch once; tune max_depth, min_samples_leaf & RF OOB.","aiml_guide",1.5]
        ],
        [
          ["dsa",["dsa_trees"],"Tree Edge Cases & Recursion Depth Check","Test empty tree, skewed 1000-node tree, duplicate BST values & negative sums.","py_rev",1.2],
          ["sql",["sql_joins"],"SQL Join Matrix & Cardinality Cheat Sheet","Compare CROSS, NATURAL, USING(col), FULL emulation via UNION & anti-join plans.","sql_guide",0.8],
          ["aiml",["ml_math"],"GATE Warm-up Session 5: Total Prob & Bayes","Timed 1-hr Saturday set: partitions, posterior disease odds & sequential updates.","gate_warm",1.2]
        ],
        [
          ["dsa",["dsa_trees"],"Week 4 Redo + Blind Tree Construction","Redo Week 4 ~ items + implement BST delete and LCA from blank file.","py_prac",1.4],
          ["sql",["sql_joins"],"Write 3 Non-Equi & Inequality Join Queries","Solve overlapping salary-band and date-interval join queries without correlated subqueries.","sql_prac",0.9],
          ["aiml",["ml_classical"],"AI/ML Pt 6 Exercises (Supervised Models)","Solve AI/ML Practice Book Part 6 supervised learning exercises & error diagnosis.","aiml_prac",1.5]
        ],
        [
          ["dsa",["dsa_trees"],"Week 5 Tree Timed Mock (2 Problems)","Time 2 unseen tree/BST Mediums in 50 min; trace state invariants cleanly.","py_guide",1.4],
          ["sql",["sql_joins"],"Part 7 Self-Test Without Reference","Write 4 multi-join aggregation queries from memory and inspect results.","sql_rev",0.8],
          ["aiml",["ml_classical"],"Supervised End-to-End Pipeline Mini-Lab","Build clean sklearn ColumnTransformer + StratifiedKFold baseline script.","aiml_guide",1.4]
        ]
      ]
    },
    {
      id: 6,
      month: 2,
      title: "Heaps, CTEs & Applied Tabular ML (Project 1 Start)",
      focus: ["Ch.7 (D4.1–D4.2)","MySQL Part 8","AI/ML Pt 7 + ADS Ch.1–3 + Project 1 Start"],
      practiceTag: "D4.1–D4.2 • Part 8 • Proj 1 • GATE S6",
      targets: [
        {"id":"w6_d","track":"dsa","text":"Master heapq patterns (top-k, merge k, running median), dict internals & solve D4.1–D4.2."},
        {"id":"w6_s","track":"sql","text":"Complete MySQL Part 8 (Correlated Subqueries, EXISTS, Set Ops, Recursive CTEs) + Pt 8 practice."},
        {"id":"w6_a","track":"aiml","text":"Finish AI/ML Pt 7, ADS Ch.1–3 (OOF Encoding, Boosting, SHAP) + Start Project 1 + GATE S6."}
      ],
      days: [
        [
          ["dsa",["dsa_graphs"],"Ch.7 Binary Heaps, heapq & dict Internals","Review min-heap vs negated max-heap, tuple tie-breaks, running median & dict probing.","py_guide",1.5],
          ["sql",["sql_joins"],"MySQL Pt 8: Subqueries, IN vs EXISTS","Compare scalar, row and correlated subqueries; fix NULL traps with EXISTS/NOT EXISTS.","sql_guide",0.9],
          ["aiml",["ml_classical"],"AI/ML Pt 7: Unsupervised Learning & TS","Implement k-means, hierarchical, DBSCAN, PCA, GMM & complete AI/ML Practice Pt 7.","aiml_prac",1.5]
        ],
        [
          ["dsa",["dsa_graphs"],"D4.1 Task Scheduler & D4.2 Top K Words","Solve D4.1 (greedy + cooldown heap) and D4.2 (top-k alphabetical ties via wrapper/negation).","py_prac",1.5],
          ["sql",["sql_joins"],"MySQL Pt 8: Set Operations & Common Table Exprs","Combine UNION/INTERSECT/EXCEPT and write chained multi-step WITH CTE pipelines.","sql_guide",0.9],
          ["aiml",["ml_applied"],"ADS Ch.1: Tabular Features & OOF Encoding","Contrast leaky vs out-of-fold target encoding, missingness indicators & point-in-time agg.","ads_guide",1.5]
        ],
        [
          ["dsa",["dsa_graphs"],"Two-Heaps Median & Merge-K-Lists Drills","Implement Find Median from Data Stream & Merge K Sorted Lists cleanly under 25m.","py_guide",1.5],
          ["sql",["sql_joins"],"MySQL Pt 8: Recursive CTE Hierarchies","Write recursive WITH RECURSIVE org-chart traversal with cycle depth guard.","sql_guide",0.9],
          ["aiml",["ml_applied"],"ADS Ch.2: Gradient Boosting & LightGBM","Trace boosting as gradient descent on residuals; tune early stopping & class weights.","ads_guide",1.5]
        ],
        [
          ["dsa",["dsa_graphs"],"4 Heap & Frequency-Bucket Drills","Solve K Closest Points, Reorganize String & Top K Frequent Elements using heapq/Counter.","py_prac",1.5],
          ["sql",["sql_joins"],"MySQL Pt 8 Practice Book CTE Exercises","Solve Practice Book Part 8 subquery, set-op and recursive CTE challenges.","sql_prac",1],
          ["aiml",["ml_applied"],"ADS Ch.3: Permutation Imp., PDP & SHAP","Compare biased MDI vs permutation importance; verify SHAP local additivity + eq Pt 1.","ads_prac",1.6]
        ],
        [
          ["dsa",["dsa_graphs"],"Heap Tie-Breaking & Hashing Checklist","Document Python custom __lt__ comparator vs (-freq, word) min-heap rules.","py_rev",1.2],
          ["sql",["sql_joins"],"EXISTS vs JOIN Equivalence Drill","Rewrite 4 semi-join / anti-join queries both ways and compare readability.","sql_ref",0.8],
          ["aiml",["ml_math"],"GATE Warm-up Session 6: Independence","Timed 1-hr Saturday set: pairwise vs mutual independence & reliability circuits.","gate_warm",1.2]
        ],
        [
          ["dsa",["dsa_trees","dsa_graphs"],"Week 5 Redo + Two-Heap Blank Rewrite","Redo Week 5 ~ items + code running median two-heap class from blank editor.","py_prac",1.4],
          ["sql",["sql_joins"],"Recursive Date Spine Generator","Generate contiguous missing calendar dates using WITH RECURSIVE and LEFT JOIN sales.","sql_guide",0.9],
          ["aiml",["ml_applied"],"Project 1 Setup: Smart-Meter Energy Data","Kick off Portfolio Project 1: ingest household power + weather data, EDA & naive baselines.","aiml_guide",1.6]
        ],
        [
          ["dsa",["dsa_graphs"],"Week 6 Timed Mock (Heaps + Trees)","Time 2 unseen Medium problems (heap + tree) in 50 min total; verify complexity.","py_guide",1.4],
          ["sql",["sql_joins"],"Parts 7–8 Combined Recall Quiz","Solve 5 recursive hierarchy + correlated subquery tasks cleanly.","sql_rev",0.8],
          ["aiml",["ml_applied"],"Project 1 Feature Engineering Pass","Build leakage-safe lag, rolling window and calendar features for Project 1 forecasting.","ads_guide",1.5]
        ]
      ]
    },
    {
      id: 7,
      month: 2,
      title: "Graphs Pt 1, Window Functions & A/B/Causal DS",
      focus: ["Ch.8 Pt 1 (D4.3, D4.4, D4.6)","MySQL Part 9","ADS Ch.4–5 (A/B, Causal) + GATE S7"],
      practiceTag: "D4.3,D4.4,D4.6 • Part 9 • GATE S7",
      targets: [
        {"id":"w7_d","track":"dsa","text":"Master graph adjacency lists, BFS/DFS, cycle checks, Kahn topo sort & bipartite check (D4.3, D4.4, D4.6)."},
        {"id":"w7_s","track":"sql","text":"Master MySQL Part 9 Window Functions (ROW_NUMBER/RANK/DENSE_RANK, LAG/LEAD & frames) + Pt 9 practice."},
        {"id":"w7_a","track":"aiml","text":"Complete ADS Ch.4–5 (SRM, CUPED, Causal DiD/RD/IV/Uplift) + eq Pt 2 + Project 1 Walk-Forward + GATE S7."}
      ],
      days: [
        [
          ["dsa",["dsa_graphs"],"Ch.8 Pt 1: Graph Reps, BFS & Multi-Source BFS","Code grid BFS, shortest unweighted path & multi-source BFS with visited-on-enqueue.","py_guide",1.5],
          ["sql",["sql_windows"],"MySQL Pt 9: OVER(), PARTITION BY & Ranking","Contrast ROW_NUMBER, RANK & DENSE_RANK for top-N-per-group problems.","sql_guide",1],
          ["aiml",["ml_applied"],"ADS Ch.4: A/B Testing, SRM & CUPED","Run sample-ratio mismatch chi-square, CUPED variance reduction & delta-method ratio SE.","ads_guide",1.5]
        ],
        [
          ["dsa",["dsa_graphs"],"Ch.8 Iterative DFS, Cycles & D4.6 Bipartite","Implement explicit-stack DFS, directed 3-color cycle detection & solve D4.6 Bipartite.","py_prac",1.5],
          ["sql",["sql_windows"],"MySQL Pt 9: LAG, LEAD & Running Frames","Compute WoW deltas and exact ROWS vs RANGE BETWEEN sliding moving averages.","sql_guide",1],
          ["aiml",["ml_applied"],"ADS Ch.4: Multiple Testing & Network Spillover","Implement Benjamini-Hochberg FDR control & cluster-randomised interference checks.","ads_guide",1.4]
        ],
        [
          ["dsa",["dsa_graphs"],"Ch.8 Kahn Topological Sort & D4.4 Word Ladder","Code Course Schedule II (indegree Kahn) & solve D4.4 shortest word transform via BFS.","py_prac",1.6],
          ["sql",["sql_windows"],"MySQL Pt 9 Practice Book Window Queries","Complete all Practice Book Part 9 ranking, running total & salary-gap queries.","sql_prac",1],
          ["aiml",["ml_applied"],"ADS Ch.5: Confounders, Propensity, DiD & RD","Run Simpson's paradox, collider bias, IPW matching, DiD & sharp RD estimators.","ads_guide",1.6]
        ],
        [
          ["dsa",["dsa_graphs"],"D4.3 Redundant Connection & 3 Graph Drills","Solve D4.3 (cycle edge in tree+1) + Number of Islands, Clone Graph & Rotting Oranges.","py_prac",1.5],
          ["sql",["sql_windows"],"Gaps-and-Islands Using ROW_NUMBER","Solve consecutive login streaks & active session grouping using difference of ranks.","sql_guide",1],
          ["aiml",["ml_applied"],"ADS Ch.5 IV/2SLS, Uplift & eq Pt 2","Study 2SLS SE & T-learner uplift; complete ADS Practice Book Part 2 exercises.","ads_prac",1.6]
        ],
        [
          ["dsa",["dsa_graphs"],"Visited Timing & Explicit Stack Checklist","Audit why DFS recursion depth >= 10^4 fails in Python & why BFS marks visited on push.","py_rev",1.2],
          ["sql",["sql_windows"],"Window Frame Edge Traps","Verify RANGE default vs ROWS UNBOUNDED PRECEDING on ties + LAST_VALUE trap.","sql_ref",0.9],
          ["aiml",["ml_math"],"GATE Warm-up Session 7: Random Variables","Timed 1-hr Saturday set: PMF/CDF, linearity of expectation & indicator variables.","gate_warm",1.2]
        ],
        [
          ["dsa",["dsa_graphs"],"Week 6 Redo + Kahn & BFS From Blank File","Redo Week 6 ~ items + write Kahn topo sort & multi-source BFS blind.","py_prac",1.4],
          ["sql",["sql_windows"],"Re-solve Top-3 Paid Employees Per Dept","Write clean CTE + DENSE_RANK solution and compare against correlated count alternative.","sql_prac",0.9],
          ["aiml",["ml_applied"],"Project 1 Walk-Forward Validation Loop","Train LightGBM with walk-forward splits; log MAE/RMSE by hour-of-day and weekday.","ads_guide",1.5]
        ],
        [
          ["dsa",["dsa_graphs"],"Week 7 Timed Graph Mock (2 Problems)","Time 2 unseen BFS/Topo/Cycle Mediums in 50 min total; verify O(V+E) bounds.","py_guide",1.4],
          ["sql",["sql_windows"],"Window Functions Quick-Fire Set","Complete 4 unseen LAG/RANK/NTILE queries in 30 minutes without looking up syntax.","sql_rev",0.9],
          ["aiml",["ml_applied"],"Project 1 Failure Analysis (Holidays/Peaks)","Diagnose worst prediction errors on heatwaves/holidays & plot SHAP feature contributions.","ads_guide",1.4]
        ]
      ]
    },
    {
      id: 8,
      month: 2,
      title: "Shortest Paths, DSU, Indexes & Project 1 Ship",
      focus: ["Ch.8 Pt 2 (D4.5)","MySQL Part 10","ADS Ch.6–9 + Ship Project 1 + GATE S8"],
      practiceTag: "D4.5 • Part 10 • Ship Proj 1 • GATE S8",
      targets: [
        {"id":"w8_d","track":"dsa","text":"Master Dijkstra, Bellman-Ford (D4.5 k-stops), Union-Find with rank/path-comp & Kruskal MST."},
        {"id":"w8_s","track":"sql","text":"Master MySQL Part 10 Views, B-Tree Composite/Covering Indexes & EXPLAIN query tuning + Pt 10 prac."},
        {"id":"w8_a","track":"aiml","text":"Complete ADS Ch.6–9 (Forecasting, Survival, RecSys), eq Pts 3–4, GATE S8 & Ship Project 1."}
      ],
      days: [
        [
          ["dsa",["dsa_graphs"],"Ch.8 Pt 2: Dijkstra & Bellman-Ford / D4.5","Code lazy Dijkstra with dist check + solve D4.5 (Cheapest flight <= k stops, Hard).","py_prac",1.7],
          ["sql",["sql_perf"],"MySQL Pt 10: Views & Updatability Rules","Study views, WITH CHECK OPTION, and when views cannot be updated or indexed.","sql_guide",0.9],
          ["aiml",["ml_applied"],"ADS Ch.6: Rolling-Origin Forecasting","Compare Holt-Winters, SARIMA & boosted trees on lag features; compute MASE.","ads_guide",1.5]
        ],
        [
          ["dsa",["dsa_graphs"],"Ch.8 Pt 2: Union-Find (DSU) & Kruskal MST","Implement DSU path compression + union by rank, connected components & Kruskal MST.","py_guide",1.5],
          ["sql",["sql_perf"],"MySQL Pt 10: B-Tree Indexes & Leftmost Prefix","Design composite indexes (equality cols before range cols) & covering index lookups.","sql_guide",1],
          ["aiml",["ml_applied"],"ADS Ch.7: Censoring, Kaplan-Meier & Cox PH","Model churn under right-censoring; compute LTV from survival curve + eq Pt 3.","ads_prac",1.5]
        ],
        [
          ["dsa",["dsa_graphs"],"4 Weighted Graph, DSU & MST Drills","Solve Network Delay Time, Accounts Merge, Min Cost Connect Points & Swim in Rising Water.","py_prac",1.6],
          ["sql",["sql_perf"],"MySQL Pt 10: Reading EXPLAIN & Anti-Patterns","Fix non-SARGable WHERE col*2, leading LIKE '%x' and implicit type cast full-scans.","sql_guide",1],
          ["aiml",["ml_applied"],"ADS Ch.8–9: Recommender Systems & Cheat Sheet","Compare popularity, item-item CF & ALS matrix factorisation on recall vs coverage + eq Pt 4.","ads_prac",1.6]
        ],
        [
          ["dsa",["dsa_graphs"],"0-1 BFS & Shortest Path Variant Selection","Compare BFS vs 0-1 deque BFS vs Dijkstra vs Bellman-Ford vs Floyd-Warshall constraints.","py_guide",1.4],
          ["sql",["sql_perf"],"MySQL Pt 10 Practice Book Index Clinic","Solve Practice Book Part 10 EXPLAIN, composite index order & covering query drills.","sql_prac",1],
          ["aiml",["ml_applied"],"Project 1 Stretch: Quantile Intervals","Add pinball-loss quantile regression (10th/90th pct) intervals to Project 1 forecaster.","aiml_guide",1.5]
        ],
        [
          ["dsa",["dsa_graphs"],"Graph Algorithm Selection Matrix Recall","Write the 5-row graph shortest-path decision table from memory with negative-edge traps.","py_rev",1.2],
          ["sql",["sql_perf"],"Composite Index Order & Selectivity Quiz","Given 3 WHERE+ORDER BY queries, choose the single best composite index and justify.","sql_ref",0.9],
          ["aiml",["ml_math"],"GATE Warm-up Session 8: Variance & Stats","Timed 1-hr Saturday set: Var(aX+bY), covariance, Chebyshev & sample quantiles.","gate_warm",1.2]
        ],
        [
          ["dsa",["dsa_graphs"],"Week 7 Redo + Dijkstra & DSU Blank Rewrite","Redo Week 7 ~ items + rewrite Dijkstra and DSU cleanly without notes.","py_prac",1.5],
          ["sql",["sql_windows","sql_perf"],"Rewrite Correlated Slow Query Into Window+Idx","Benchmark/trace turning an O(N^2) subquery into a single index-friendly window scan.","sql_guide",0.9],
          ["aiml",["ml_applied"],"Ship Portfolio Project 1 (GitHub + README)","Finalise Energy Forecasting repo: clean tests, benchmark table vs naive, README & demo chart.","aiml_guide",1.7]
        ],
        [
          ["dsa",["dsa_trees","dsa_graphs"],"Month 2 DSA Mock Loop Check (2 Problems)","Solve 2 unseen Tree + Graph problems in 55 min under mock conditions.","py_guide",1.5],
          ["sql",["sql_joins","sql_windows","sql_perf"],"Month 2 SQL Checkpoint (Parts 7–10)","Solve 6 Joins + CTE + Window + Index optimization questions cleanly.","sql_prac",1],
          ["aiml",["ml_applied"],"ADS Interview Q-Bank & Project 1 Pitch","Review ADS Ch.9 question bank and practice a 3-min walkthrough of Project 1 decisions.","ads_guide",1.3]
        ]
      ]
    },
    {
      id: 9,
      month: 3,
      title: "DP Pt 1, Transactions/Locks & Deep Learning Core",
      focus: ["Ch.9 Pt 1 (D5.1–D5.2)","MySQL Part 11","AI/ML Pt 8 + DL Ch.1–2 + GATE S9"],
      practiceTag: "D5.1–D5.2 • Part 11 • GATE S9",
      targets: [
        {"id":"w9_d","track":"dsa","text":"Master 1D DP state/transition/base, lru_cache vs tabulation & solve D5.1–D5.2."},
        {"id":"w9_s","track":"sql","text":"Complete MySQL Part 11 (ACID, Isolation Levels, InnoDB MVCC & Row Locking) + Pt 11 practice."},
        {"id":"w9_a","track":"aiml","text":"Complete AI/ML Pt 8 & DL Ch.1–2 (Tensors, Autograd, Norm, Optimisers, Reg) + dl_prac Pts 1–2 + GATE S9."}
      ],
      days: [
        [
          ["dsa",["dsa_dp_adv"],"Ch.9 Pt 1: DP Frame, State & lru_cache","Map state -> transition -> base case; contrast top-down lru_cache vs bottom-up DP.","py_guide",1.5],
          ["sql",["sql_tx"],"MySQL Pt 11: ACID & Isolation Phenomena","Trace dirty read, non-repeatable read, phantom read & lost update anomalies.","sql_guide",1],
          ["aiml",["ml_dl"],"DL Ch.1: Tensors, Autograd & Training Loop","Build PyTorch training loop, Dataset/DataLoader & manual autograd verification.","dl_guide",1.5]
        ],
        [
          ["dsa",["dsa_dp_adv"],"D5.1 Word Break & 1D House Robber / Climb","Solve D5.1 (Word Break + path recovery) and Coin Change min-coins bottom-up.","py_prac",1.5],
          ["sql",["sql_tx"],"MySQL Pt 11: InnoDB MVCC & Gap/Next-Key Locks","Contrast consistent non-locking snapshot reads vs FOR UPDATE gap locking.","sql_guide",0.9],
          ["aiml",["ml_dl"],"DL Ch.2: Init, LayerNorm/BatchNorm & Residuals","Run Kaiming/Xavier init & residual gradient flow checks + DL Practice Pt 1.","dl_prac",1.5]
        ],
        [
          ["dsa",["dsa_dp_adv"],"D5.2 Max Product Subarray & LIS (O(n log n))","Solve D5.2 tracking max/min product on negatives + patience sorting LIS with bisect.","py_prac",1.5],
          ["sql",["sql_tx"],"MySQL Pt 11 Practice Book Transaction Drills","Solve Practice Book Part 11 isolation/deadlock traces and SAVEPOINT questions.","sql_prac",1],
          ["aiml",["ml_dl"],"DL Ch.2: Optimisers, LR Schedules & Reg.","Compare AdamW, CosineAnnealing, dropout, weight decay & solve DL Practice Pt 2.","dl_prac",1.5]
        ],
        [
          ["dsa",["dsa_dp_adv"],"4 Classic 1D & Partition DP Drills","Solve Partition Equal Subset Sum, Coin Change II & Jump Game/Perfect Squares.","py_guide",1.5],
          ["sql",["sql_tx"],"Deadlock Avoidance & Optimistic Concurrency","Practice consistent lock ordering vs version-column optimistic updates.","sql_guide",0.9],
          ["aiml",["ml_dl"],"AI/ML Pt 8 Neural Nets + Practice Exercises","Complete AI/ML Practice Book Part 8 bridging NumPy MLP with PyTorch autograd.","aiml_prac",1.5]
        ],
        [
          ["dsa",["dsa_dp_adv"],"DP Recurrence Derivation Discipline","Write explicit subproblem English definition before touching code on 3 DP tasks.","py_rev",1.2],
          ["sql",["sql_tx"],"Isolation Level Anomaly Matrix Recall","Draw the 4x3 SQL standard vs InnoDB phantom-lock matrix from blank paper.","sql_rev",0.8],
          ["aiml",["ml_math"],"GATE Warm-up Session 9: Binomial Dist.","Timed 1-hr Saturday set: Binomial mean/var, mode & Gaussian approximation.","gate_warm",1.2]
        ],
        [
          ["dsa",["dsa_graphs","dsa_dp_adv"],"Week 8 Redo + 1D DP State Audit","Redo Week 8 ~ items + re-solve D5.1/D5.2 comparing memo vs tabulation RAM.","py_prac",1.4],
          ["sql",["sql_tx"],"Trace Two Concurrent Transaction Schedules","Walk step-by-step T1/T2 schedules across READ COMMITTED & REPEATABLE READ.","sql_prac",0.9],
          ["aiml",["ml_dl"],"DL Debug Experiment: LR & Norm Ablation","Break a small PyTorch ResBlock (remove norm / 10x LR) and observe loss curves.","dl_guide",1.5]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Week 9 Timed 1D DP Mock (2 Problems)","Solve 2 unseen 1D DP Mediums in 55 min cleanly.","py_guide",1.4],
          ["sql",["sql_tx"],"Part 11 Interview Q-Bank Check","Explain MVCC undo logs, phantom reads and why SELECT FOR UPDATE blocks.","sql_guide",0.8],
          ["aiml",["ml_dl"],"Implement Multi-Class PyTorch Classifier","Clean modular nn.Module + val early stopping on synthetic tabular/digits data.","dl_prac",1.4]
        ]
      ]
    },
    {
      id: 10,
      month: 3,
      title: "2D DP, Stored Routines, CNNs/RNNs & Proj 2 Start",
      focus: ["Ch.9 Pt 2 (D5.3–D5.4)","MySQL Part 12","DL Ch.3–4 + AI/ML Pt 9 + Project 2 Start"],
      practiceTag: "D5.3–D5.4 • Part 12 • Proj 2 • GATE S10",
      targets: [
        {"id":"w10_d","track":"dsa","text":"Master 2D grid, LCS/Edit Distance, Knapsack & state-machine DP; solve D5.3–D5.4."},
        {"id":"w10_s","track":"sql","text":"Complete MySQL Part 12 (Stored Procedures, Functions, Triggers & Scheduled Events) + Pt 12 prac."},
        {"id":"w10_a","track":"aiml","text":"Finish DL Ch.3–4 (CNNs/ResNets/Seq Models) + Start Project 2 (IoT Anomaly Detection) + GATE S10."}
      ],
      days: [
        [
          ["dsa",["dsa_dp_adv"],"Ch.9 Pt 2: Grid & String 2D DP + D5.3","Solve D5.3 (Decode Ways), Unique Paths & rolling 1D space-optimised LCS.","py_prac",1.5],
          ["sql",["sql_tx"],"MySQL Pt 12: Stored Procedures & Parameters","Write IN/OUT/INOUT procedures, DELIMITER usage & cursors/error handlers.","sql_guide",0.9],
          ["aiml",["ml_dl"],"DL Ch.3: CNNs, ResNets & Transfer Learning","Build residual CNN block from scratch; trace receptive fields & feature maps + DL Pt 3.","dl_prac",1.5]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Ch.9 Pt 2: Edit Distance & 0/1 Knapsack","Code Edit Distance + Unbounded/0-1 Knapsack iteration direction intuition.","py_guide",1.5],
          ["sql",["sql_tx"],"MySQL Pt 12: Functions vs Procedures & Triggers","Contrast deterministic functions vs procedures and BEFORE/AFTER triggers (NEW/OLD).","sql_guide",0.9],
          ["aiml",["ml_dl"],"DL Ch.4: RNNs, LSTMs, GRUs & Seq2Seq","Trace vanishing gradient gating in LSTM/GRU; build masked seq2seq + DL Pt 4.","dl_prac",1.5]
        ],
        [
          ["dsa",["dsa_dp_adv"],"D5.4 Stock Trading with Cooldown (Hard)","Solve D5.4 via held/sold/rest state machine & generalise to k-transaction DP.","py_prac",1.6],
          ["sql",["sql_tx"],"MySQL Pt 12: Events & Practice Book Pt 12","Complete Practice Book Part 12 trigger/routine exercises and recursion traps.","sql_prac",1],
          ["aiml",["ml_dl"],"AI/ML Pt 9 CNNs & Self-Attention Bridge","Complete AI/ML Practice Book Part 9 connecting sequence models to scaled dot attention.","aiml_prac",1.5]
        ],
        [
          ["dsa",["dsa_dp_adv"],"4 Two-Dimensional & State-Machine DP Drills","Practice Target Sum, Interleaving String, Regular Expr Matching & Maximal Square.","py_guide",1.6],
          ["sql",["sql_tx"],"When NOT to Put Logic in Triggers/Procs","Compare DB triggers vs application services for audit logs, testability & scaling.","sql_ref",0.8],
          ["aiml",["ml_dl"],"Project 2 Kickoff: IoT Sensor Stream Data","Start Portfolio Project 2: load labelled sensor/ESP32 readings & z-score baseline.","aiml_guide",1.6]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Knapsack Loop Direction & Transition Audit","Verify reverse loop for 0/1 vs forward loop for unbounded knapsack.","py_rev",1.2],
          ["sql",["sql_tx"],"Audit-Log Trigger Verification Drill","Draft BEFORE UPDATE price-audit trigger validating NEW.salary > 0 cleanly.","sql_prac",0.8],
          ["aiml",["ml_math"],"GATE Warm-up Session 10: Poisson & Geom.","Timed 1-hr Saturday set: rare-event Poisson limit, memoryless Geometric & sums.","gate_warm",1.2]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Week 9 Redo + D5.4 Blind Re-Solve","Redo Week 9 ~ items + rewrite Stock Cooldown state machine from blank editor.","py_prac",1.5],
          ["sql",["sql_tx"],"Parts 11–12 Combined Review","Review isolation levels + trigger mutation rules ('can't update table invoking trigger').","sql_guide",0.8],
          ["aiml",["ml_dl"],"Project 2 Isolation Forest & Cost Thresholds","Add Isolation Forest detector to Project 2 and sweep false-alarm vs miss cost curves.","aiml_guide",1.6]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Week 10 Timed 2D DP Check (2 Problems)","Time 2 unseen 2D DP problems in 60 min; compress 2D table to 1D row cleanly.","py_guide",1.5],
          ["sql",["sql_tx"],"Part 12 Syntax Check Without Notes","Write stored proc with DECLARE HANDLER & transaction rollback from memory.","sql_rev",0.8],
          ["aiml",["ml_dl"],"DL Ch.3–4 Conceptual Synthesis","Compare receptive field, translation equivariance & O(T) vs O(1) path lengths.","dl_guide",1.3]
        ]
      ]
    },
    {
      id: 11,
      month: 3,
      title: "Greedy/Bits/Tries, Normalisation & Transformers",
      focus: ["Ch.10–11 (D5.5–D6.3)","MySQL Parts 13–14","DL Ch.5–6 + Project 2 PyTorch + GATE S11"],
      practiceTag: "D5.5–D6.3 • Pts 13–14 • Proj 2 • GATE S11",
      targets: [
        {"id":"w11_d","track":"dsa","text":"Finish Ch.10–11 (Greedy, Bits, Maths, Tries, Fenwick/SegTree, KMP) & solve D5.5–D6.3."},
        {"id":"w11_s","track":"sql","text":"Complete MySQL Parts 13–14 (1NF–BCNF Normalisation, Users/Roles, Backups & JDBC notes)."},
        {"id":"w11_a","track":"aiml","text":"Finish DL Ch.5–6 (Transformers/MoE, Contrastive/SSL), build Proj 2 Autoencoder+FastAPI & GATE S11."}
      ],
      days: [
        [
          ["dsa",["dsa_dp_adv"],"Ch.10 Greedy, Bits & D5.5–D5.6","Verify greedy exchange argument; solve D5.5 (Gas station) and D5.6 (Bit puzzles).","py_prac",1.5],
          ["sql",["sql_model"],"MySQL Pt 13: Functional Deps & 1NF–3NF","Compute attribute closures, candidate keys and decompose partial/transitive deps.","sql_guide",1],
          ["aiml",["ml_dl"],"DL Ch.5: Transformers, MHA, ViT & RoPE","Implement scaled dot-product + multi-head causal attention from scratch in PyTorch.","dl_guide",1.6]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Ch.11 Tries & D6.1 Trie with Wildcards","Implement dict-based Prefix Trie and solve D6.1 (addWord/search with '.').","py_prac",1.5],
          ["sql",["sql_model"],"MySQL Pt 13: BCNF, Lossless Join & Pt 13 Prac.","Verify BCNF vs dependency preservation trade-off and solve Practice Book Part 13.","sql_prac",1],
          ["aiml",["ml_dl"],"DL Ch.5 Practice + Efficient Attention/MoE","Cover KV-cache memory math, FlashAttention tiling, MoE & solve DL Practice Pt 5.","dl_prac",1.5]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Ch.11 Fenwick/SegTree & D6.2 Count Smaller","Code Fenwick (BIT) point-update/prefix-sum & solve D6.2 (Hard) in O(n log n).","py_prac",1.6],
          ["sql",["sql_tx"],"MySQL Pt 14: Users, Privileges & Backups","Review CREATE USER/ROLE, GRANT least privilege, mysqldump & binary-log PITR.","sql_guide",0.9],
          ["aiml",["ml_dl"],"DL Ch.6: Embeddings & Self-Supervised (Contrastive)","Code InfoNCE/CLIP contrastive loss & masked modelling intuition + DL Practice Pt 6.","dl_prac",1.5]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Ch.11 KMP Prefix Function & D6.3 Repeat Sub.","Implement KMP LPS failure table in O(n) & solve D6.3 (Repeated substring pattern).","py_prac",1.5],
          ["sql",["sql_tx"],"MySQL Pt 14 Security & Practice Book","Complete Practice Book Part 14 security/prepared-statement SQL injection prevention.","sql_prac",0.9],
          ["aiml",["ml_dl"],"Project 2 PyTorch Autoencoder & Thresholds","Train PyTorch reconstruction autoencoder for IoT anomalies; compare P/R at equal alert rate.","aiml_guide",1.6]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Bit Tricks, Sieve & Trie Memory Review","Audit Python big-int bitmasks, (x & -x), modular pow(a, b, mod) & KMP edge cases.","py_rev",1.2],
          ["sql",["sql_model"],"Normalisation Synthesis vs Decomposition","Check lossless-join theorem (R1 cap R2 -> R1 or R2) on 3 exam schemas.","sql_guide",0.8],
          ["aiml",["ml_math"],"GATE Warm-up Session 11: Uniform & Normal","Timed 1-hr Saturday set: standardisation z-scores, PDF integrals & sum of Gaussians.","gate_warm",1.2]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Week 10 Redo + Fenwick & Trie Rewrite","Redo Week 10 ~ items + write Fenwick Tree & KMP LPS from blank file.","py_prac",1.5],
          ["sql",["sql_model","sql_tx"],"Parts 13–14 Combined Recall","Review SQL injection parameterization + BCNF check steps.","sql_rev",0.8],
          ["aiml",["ml_dl"],"Project 2 FastAPI Service & Streamlit UI","Serve Project 2 autoencoder anomaly scorer behind FastAPI + Dockerfile + UI.","aiml_guide",1.7]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Week 11 Mixed Timed Check (Trie + Bit/Greedy)","Solve 2 unseen Ch.10–11 problems in 55 min cleanly.","py_guide",1.4],
          ["sql",["sql_model"],"Final Schema Normalisation Check","Normalise an unnormalised invoice table cleanly from 1NF -> 2NF -> 3NF -> BCNF.","sql_prac",0.9],
          ["aiml",["ml_dl"],"Attention & SSL Math Cross-Check","Verify softmax gradient scaling 1/sqrt(d_k) numerically in PyTorch.","dl_guide",1.3]
        ]
      ]
    },
    {
      id: 12,
      month: 3,
      title: "12-Week Finale: DSA/SQL Mocks, DL Debug & Proj 2 Ship",
      focus: ["Ch.12 (D6.4–D6.6 + Quick Rev + Loop A)","MySQL Parts 15–16 + Quick Rev","DL Ch.12 & 14 + Ship Proj 2 + GATE S12"],
      practiceTag: "D6.4–D6.6 • Pts 15–16 • Ship Proj 2 • GATE S12",
      targets: [
        {"id":"w12_d","track":"dsa","text":"Finish Ch.12, solve D6.4–D6.6 (incl. OrderedDict LRU Cache), complete 13p Quick Rev & Loop A."},
        {"id":"w12_s","track":"sql","text":"Complete MySQL Parts 15–16 (Classic Query Problems, Interview Quick-Fire) & Quick Revision."},
        {"id":"w12_a","track":"aiml","text":"Finish DL Ch.12 (IoT/TS/PINNs) & Ch.14 (Debugging), GATE Session 12 & Ship Portfolio Project 2."}
      ],
      days: [
        [
          ["dsa",["dsa_dp_adv","dsa_toolkit"],"Ch.12 Pattern Map + D6.4 & D6.5 Make It Fast","Solve D6.4 (Pattern choice table) and D6.5 (Optimise list.pop(0) + str +=).","py_prac",1.5],
          ["sql",["sql_core","sql_windows"],"MySQL Pt 15: Classic Interview Query Suite","Solve Nth highest salary, consecutive streaks & median/running-diff problems.","sql_prac",1],
          ["aiml",["ml_dl"],"DL Ch.12: Time Series, Federated & PINNs","Explore deep probabilistic forecasting, federated averaging & physics losses + DL Pt 12.","dl_prac",1.5]
        ],
        [
          ["dsa",["dsa_dp_adv","dsa_linear"],"D6.6 LRU Cache (OrderedDict) & Checklist","Implement O(1) LRU Cache cleanly (D6.6) & audit Ch.12 Python bug checklist.","py_prac",1.4],
          ["sql",["sql_joins","sql_windows"],"MySQL Pt 15 Complex Query Set Completion","Finish all remaining Classic Query Problems in Part 15 and check edge cases.","sql_prac",1],
          ["aiml",["ml_dl"],"DL Ch.14: Debugging Ladder & Silent Bugs","Walk the DL debugging ladder (overfit 1 batch, shape broadcasting, train/eval mode) + DL Pt 14.","dl_prac",1.5]
        ],
        [
          ["dsa",["dsa_toolkit","dsa_arrays","dsa_dp_adv"],"Full 13-Page Python DSA Quick Revision","Read py_rev end-to-end; drill every pattern template & trap list from memory.","py_rev",1.5],
          ["sql",["sql_tx","sql_perf"],"MySQL Pt 16: Interview Quick-Fire Bank","Answer all Part 16 short-answer questions (ACID, B+Tree, locks, query order).","sql_guide",0.9],
          ["aiml",["ml_dl"],"Ship Portfolio Project 2 (IoT Anomaly Detection)","Polish Project 2 API tests, Docker runbook, threshold precision/recall report & README.","aiml_guide",1.7]
        ],
        [
          ["dsa",["dsa_arrays","dsa_graphs"],"Mock Loop A (Fresher Level) Coding Round","Sit timed Loop A coding problems (2 problems, 45m) & grade against rubric.","mock_guide",1.6],
          ["sql",["sql_core","sql_windows","sql_tx"],"Full MySQL Quick Revision Read-Through","Complete 04_MySQL_Quick_Revision.pdf end-to-end and verify Appendices A & B.","sql_rev",1],
          ["aiml",["ml_dl"],"3-Way Comparison Table: Z-Score vs IF vs AE","Write portfolio write-up comparing all 3 Project 2 detectors at fixed alert budget.","aiml_guide",1.4]
        ],
        [
          ["dsa",["dsa_dp_adv"],"12-Week Redo Queue Cleanup Sweep","Clear every remaining ~ item from Weeks 1–11 so Redo Queue enters Phase 2 clean.","py_prac",1.5],
          ["sql",["sql_perf","sql_tx"],"Timed 30-Min SQL Core Mock Check","Solve 4 unseen MySQL queries combining joins, windows & NULL edge cases.","sql_prac",0.9],
          ["aiml",["ml_math"],"GATE Warm-up Session 12: Final Mixed Review","Timed 1-hr Saturday finale: mixed counting, Bayes, RVs & distributions (Sessions 1–12 done!).","gate_warm",1.2]
        ],
        [
          ["dsa",["dsa_graphs","dsa_dp_adv"],"Error-Log Top-5 Bug Patterns Post-Mortem","Review 12-week error log; convert top 5 personal bugs into pre-submit checklist.","py_rev",1.3],
          ["sql",["sql_model","sql_windows"],"SQL Appendix A & Error-Code Check","Verify execution order & common MySQL error codes (1052, 1055, 1364, 1451).","sql_guide",0.8],
          ["aiml",["ml_dl","ml_math"],"Phase 1 Portfolio Sync (Projects 1 & 2 Live)","Ensure Projects 1 & 2 repos are pushed cleanly with screenshots and reproduce commands.","aiml_guide",1.5]
        ],
        [
          ["dsa",["dsa_arrays","dsa_graphs","dsa_dp_adv"],"12-Week Milestone Simulation (3 Problems)","Sit 75-min 3-problem simulation spanning Easy/Medium/Hard patterns.","mock_work",1.6],
          ["sql",["sql_windows","sql_perf"],"Phase 1 SQL Milestone Sign-off","Verify 16/16 MySQL Parts completed and flag any window/index topics for Phase 2.","sql_rev",0.8],
          ["aiml",["ml_dl","ml_applied"],"Phase 1 -> Phase 2 Transition Retrospective","Note weakest math/DL areas and set targets for Phase 2 LLMs, RAG, Agents & MLOps.","dl_guide",1.2]
        ]
      ]
    },
    {
      id: 13,
      month: 4,
      title: "DSA/SQL Analytics Shift & Generative / GNN Frontiers",
      focus: ["Maint: Arrays, Window & BS","DSI Ch.1: Analytics Window SQL","DL Ch.7–8 (VAE/Diffusion, GNNs)"],
      practiceTag: "Maint W13 • DSI Ch.1 Pt1 • DL Ch.7–8",
      targets: [
        {"id":"w13_d","track":"dsa","text":"Run 3 timed maintenance drills on Arrays, Sliding Window & Binary Search (sub-25m per Medium)."},
        {"id":"w13_s","track":"sql","text":"Master DSI Ch.1 Analytics SQL (Ranking, Running Totals, MoM LAG/LEAD & Dedup on shop.db)."},
        {"id":"w13_a","track":"aiml","text":"Complete DL Ch.7–8 (Autoencoders/VAEs, GANs, Diffusion, Power-Grid GNNs) + dl_prac Pts 7–8."}
      ],
      days: [
        [
          ["dsa",["dsa_arrays","dsa_toolkit"],"Speed Drill: 2 Sliding-Window/Hash Mediums","Solve 2 unseen array/window problems in 45 min focusing on clean C-fast Python.","py_guide",1],
          ["sql",["sql_windows"],"DSI Ch.1: Ranking & Running Totals on shop.db","Run top-N per category, dense ties & cumulative LTV queries on real SQLite database.","dsi_guide",1],
          ["aiml",["ml_dl"],"DL Ch.7: VAEs, ELBO & GAN Training Dynamics","Implement PyTorch VAE (reparameterisation trick + KL annealing) on digits.","dl_guide",1.8]
        ],
        [
          ["dsa",["dsa_bsearch"],"Speed Drill: Binary Search on Answer","Solve 2 unseen monotonic capacity/minimax binary search Mediums in 45 min.","py_prac",1],
          ["sql",["sql_windows"],"DSI Ch.1: LAG/LEAD & Deduplication Patterns","De-duplicate latest event per user with ROW_NUMBER and compute purchase inter-arrival.","dsi_guide",1],
          ["aiml",["ml_dl"],"DL Ch.7: Denoising Diffusion Models & dl Pt 7","Implement minimal DDPM forward noise schedule + reverse MSE denoiser; solve DL Pt 7.","dl_prac",1.8]
        ],
        [
          ["dsa",["dsa_arrays"],"Timed Re-solve: Matrix & Prefix Traps","Solve 1 prefix-modulo / 2D matrix problem and verify O(1) space where possible.","py_guide",0.9],
          ["sql",["sql_windows"],"SQL Practice: Multi-Metric User Summary","Combine conditional COUNT, SUM and ROW_NUMBER in one pass over order logs.","dsi_prac",0.9],
          ["aiml",["ml_dl"],"DL Ch.8: Graph Neural Nets (GCN & Message Pass)","Implement 2-layer message-passing GCN for node classification / power-grid state.","dl_guide",1.8]
        ],
        [
          ["dsa",["dsa_bsearch"],"Hard Interval / Sweepline Drill","Solve 1 Hard interval scheduling or skyline-style event sweep in 40 min.","py_prac",1],
          ["sql",["sql_windows"],"MoM Growth & Rolling 7-Day Revenue SQL","Handle missing months/days with calendar join before applying LAG/window frames.","dsi_guide",0.9],
          ["aiml",["ml_dl"],"DL Pt 8 Exercises: Power-Grid & Edge Graphs","Complete DL Practice Book Part 8 graph neural network problems & over-smoothing fixes.","dl_prac",1.7]
        ],
        [
          ["dsa",["dsa_arrays"],"Workbook Timed Coding Round (Part 1 Pick)","Complete 1 timed Workbook Part 1 coding round under real interview narration.","mock_work",1],
          ["sql",["sql_windows"],"Explain SQLite/Postgres Window Equivalence","Compare SQLite QUALIFY workaround (outer CTE filter) vs MySQL CTE pattern.","dsi_guide",0.8],
          ["aiml",["ml_dl"],"Synthetic Diffusion Sampling Diagnostics","Visualise reverse denoising trajectory across timesteps & tune beta schedule.","dl_guide",1.6]
        ],
        [
          ["dsa",["dsa_arrays","dsa_bsearch"],"Redo Queue + Complexity Sheet Update","Re-solve any failed Week 13 drills and update personal error log.","py_rev",0.9],
          ["sql",["sql_windows"],"DSI pandas Equivalence Check (Ch.2 Pt 1)","Replicate this week's LAG & top-N window queries in vectorised pandas.","dsi_prac",1],
          ["aiml",["ml_dl"],"Compare Autoencoder vs VAE Latent Manifold","Test anomaly scoring & latent interpolation between Project 2 AE vs VAE.","dl_prac",1.6]
        ],
        [
          ["dsa",["dsa_arrays"],"Weekly Pattern Fluency Check","Write binary-search & sliding-window templates cleanly in 10 minutes.","py_rev",0.8],
          ["sql",["sql_windows"],"Analytics SQL Self-Quiz (3 Queries)","Write 3 ranking/dedup queries without syntax hints in 25 min.","dsi_prac",0.8],
          ["aiml",["ml_stack","ml_dl"],"Week 13 Research/Paper Notes Summary","Log key takeaways on VAEs, DDPMs & GNN message passing for interview recall.","dl_guide",1.3]
        ]
      ]
    },
    {
      id: 14,
      month: 4,
      title: "Trees/Heaps Maint, Funnels/Cohorts SQL & DRL/CLIP",
      focus: ["Maint: Trees, BSTs & Heaps","DSI Ch.1: Funnels, Cohorts & Sessions","DL Ch.9–11 (RL, Multimodal, XAI)"],
      practiceTag: "Maint W14 • DSI iq Pt 1 • DL Ch.9–11",
      targets: [
        {"id":"w14_d","track":"dsa","text":"Maintain Trees, BSTs & Top-k/Two-Heap fluency across 4 timed Medium/Hard drills."},
        {"id":"w14_s","track":"sql","text":"Master Funnel conversion, Retention Cohorts, Sessionisation & complete DSI Practice Pt 1 (SQL)."},
        {"id":"w14_a","track":"aiml","text":"Complete DL Ch.9–11 (Deep RL/PPO, Audio & Multimodal CLIP, Interpretability/Robustness)."}
      ],
      days: [
        [
          ["dsa",["dsa_trees"],"Timed Tree State-Return Drill","Solve 2 unseen Bottom-Up Tree DP / LCA variants in 45 min.","py_guide",1],
          ["sql",["sql_windows"],"DSI Ch.1: Funnel Conversion SQL","Compute ordered stage conversions (view -> cart -> checkout) per user cohort.","dsi_guide",1],
          ["aiml",["ml_dl"],"DL Ch.9: Q-Learning, DQN & Policy Gradient/PPO","Implement REINFORCE + clipped PPO surrogate objective + solve DL Practice Pt 9.","dl_prac",1.8]
        ],
        [
          ["dsa",["dsa_graphs"],"Timed Two-Heap & Scheduling Drill","Solve 2 heap problems (IPO / Meeting Rooms III / Median Stream) in 50 min.","py_prac",1],
          ["sql",["sql_windows"],"DSI Ch.1: Retention Cohort Matrices","Aggregate signup_month x months_since_signup retention table cleanly in SQL.","dsi_guide",1],
          ["aiml",["ml_dl"],"DL Ch.10: Audio Spectrograms & CLIP Multimodal","Compute log-mel features & contrastive image-text alignment loss + DL Pt 10.","dl_prac",1.8]
        ],
        [
          ["dsa",["dsa_trees"],"BST Iterator & Codec Maintenance","Code O(h)-space BST Iterator and preorder+None tree serialiser from memory.","py_guide",0.9],
          ["sql",["sql_windows"],"DSI Ch.1: Sessionisation (30-Min Gap Rule)","Use LAG(ts) + cumulative SUM(CASE WHEN gap > 30m THEN 1 ELSE 0 END) to assign session_id.","dsi_guide",1],
          ["aiml",["ml_dl"],"DL Ch.11: Saliency, Calibration & Robustness","Run Grad-CAM/integrated gradients, temperature scaling ECE & PGD check + DL Pt 11.","dl_prac",1.8]
        ],
        [
          ["dsa",["dsa_trees","dsa_graphs"],"Hard Tree/Heap Challenge","Attempt 1 Hard tree/heap question (e.g., Tree Cameras / Find K-th Smallest Pair).","py_prac",1],
          ["sql",["sql_windows"],"DSI Practice Book Pt 1 (SQL Solutions)","Complete all DSI Practice Book Part 1 SQL interview problems under timed pressure.","dsi_prac",1.1],
          ["aiml",["ml_dl"],"Uncertainty & Rejection Policy Experiment","Plot accuracy-vs-coverage abstention curve using entropy/MC-dropout uncertainty.","dl_guide",1.6]
        ],
        [
          ["dsa",["dsa_trees"],"Workbook Timed Coding Round (Part 1 Tree)","Sit 1 timed coding problem from Mock Workbook focusing on aloud walkthrough.","mock_work",1],
          ["sql",["sql_windows"],"DSI Practice Pt 2 (pandas Merge/Date Traps)","Cross-check cohort & session calculations in pandas using DSI Practice Pt 2.","dsi_prac",1],
          ["aiml",["ml_dl"],"Reward Shaping & PPO Clipping Sensitivity","Ablate PPO clip epsilon / advantage normalisation on tiny gym environment.","dl_guide",1.5]
        ],
        [
          ["dsa",["dsa_trees","dsa_graphs"],"Week 14 Redo Queue Audit","Redo any stumbled Tree/Heap drills from blank editor after 48-72 hrs.","py_prac",0.9],
          ["sql",["sql_windows"],"Sessionisation & Cohort Template Card","Distil the 4 canonical analytics SQL templates onto a 1-page quick sheet.","dsi_guide",0.9],
          ["aiml",["ml_dl"],"Multimodal Retrieval Sanity Lab","Test zero-shot cosine retrieval queries on toy paired embeddings.","dl_prac",1.5]
        ],
        [
          ["dsa",["dsa_graphs"],"Heap Comparator & Tree Edge-Case Review","Audit Python tuple comparison failures on equal priority + unequal Node objects.","py_rev",0.8],
          ["sql",["sql_windows"],"Blind Write: Sessionisation Query","Write a complete 30-min inactivity sessionisation query from blank editor in 10 min.","dsi_prac",0.8],
          ["aiml",["ml_dl"],"DL Ch.7–11 Concept Synthesis","Write interview summaries for VAE vs Diffusion, PPO, CLIP & Temperature Scaling.","dl_guide",1.3]
        ]
      ]
    },
    {
      id: 15,
      month: 4,
      title: "Graphs Maint, DuckDB Lakehouse SQL & Edge/LLMs",
      focus: ["Maint: BFS/DFS/Topo/DSU","DE Ch.1–2: DuckDB & Columnar SQL","DL Ch.13 & App. + AI/ML Pt 10 (LLMs)"],
      practiceTag: "Maint W15 • DE Ch.1–2 • DL Ch.13 • LLMs",
      targets: [
        {"id":"w15_d","track":"dsa","text":"Drill Graphs (multi-source BFS, Dijkstra, DSU, topo sort) at sub-30m interview speed."},
        {"id":"w15_s","track":"sql","text":"Complete Data Engineering Ch.1–2 (Analytical OLAP SQL on DuckDB, Parquet partitioning & pruning)."},
        {"id":"w15_a","track":"aiml","text":"Finish DL Ch.13 & Appendix (Quantisation/Pruning/Distill) + start AI/ML Pt 10 (LLM architecture)."}
      ],
      days: [
        [
          ["dsa",["dsa_graphs"],"Timed Topo + Cycle Maint Drill","Solve Course Schedule IV / Alien Dictionary style topo ordering in 35 min.","py_guide",1],
          ["sql",["sql_perf"],"DE Ch.1: OLTP vs OLAP & Columnar Parquet","Run DuckDB analytical queries over Parquet vs CSV; inspect columnar read savings.","de_guide",1],
          ["aiml",["ml_dl"],"DL Ch.13: Pruning, Quantisation & Distillation","Run dynamic/static int8 quantisation, pruning sparsity & student distillation + DL Pt 13.","dl_prac",1.8]
        ],
        [
          ["dsa",["dsa_graphs"],"Timed Dijkstra & State-Space BFS Drill","Solve Shortest Path with Alternating Colors / Path with Minimum Effort cleanly.","py_prac",1],
          ["sql",["sql_perf"],"DE Ch.2: Hive Partitioning & EXPLAIN Pruning","Test partition pruning (`WHERE reading_month = ...`) on DuckDB EXPLAIN plan.","de_guide",1],
          ["aiml",["ml_dl"],"DL Appendix: Research Frontiers Overview","Survey Flows, Energy models, Continual learning & Mechanistic Interpretability.","dl_guide",1.5]
        ],
        [
          ["dsa",["dsa_graphs"],"DSU Weighted / Dynamic Connectivity Drill","Solve Evaluate Division / Most Stones Removed with clean Union-Find class.","py_guide",1],
          ["sql",["sql_perf"],"DE Practice Book Ch.1–2 Analytical SQL","Solve Data Engineering Practice Book analytical Parquet/DuckDB exercises.","de_prac",1],
          ["aiml",["ml_llm_rag"],"AI/ML Pt 10: Tokenisation, Pre/Post-Training","Study BPE tokenisation, pre-training scaling laws, SFT, DPO/RLHF & KV-cache math.","aiml_guide",1.7]
        ],
        [
          ["dsa",["dsa_graphs"],"Hard Graph Drill (Min Cut / Bitmask BFS)","Attempt 1 Hard graph problem in 40 min; track shortest-path invariant.","py_prac",1],
          ["sql",["sql_perf","sql_windows"],"Window + Partition Scan Tuning in DuckDB","Compare sorted vs unsorted Parquet row-group skipping and filter pushdown.","de_guide",0.9],
          ["aiml",["ml_llm_rag"],"AI/ML Pt 10: LLM Inference & Decoding Labs","Implement temperature, top-k, top-p sampling & spec/batching throughput math.","aiml_guide",1.6]
        ],
        [
          ["dsa",["dsa_graphs"],"Workbook Coded Graph Round","Sit 1 timed Mock Workbook graph question with complexity analysis.","mock_work",1],
          ["sql",["sql_perf"],"MySQL vs DuckDB Execution Trade-offs","Document row-store B-Tree OLTP vs columnar compressed OLAP workload criteria.","de_guide",0.8],
          ["aiml",["ml_llm_rag"],"AI/ML Pt 10 Practice Exercises","Complete AI/ML Practice Book Part 10 LLM mechanics and memory-footprint exercises.","aiml_prac",1.6]
        ],
        [
          ["dsa",["dsa_graphs"],"Week 15 Redo Queue & Graph Checklist","Re-solve any stumbled graph drills and confirm O(V log E) vs O(V+E).","py_rev",0.9],
          ["sql",["sql_perf"],"File Sizing & Compaction Exercise (DE)","Solve small-files vs right-sized Parquet row-group exercise in DE Practice.","de_prac",0.9],
          ["aiml",["ml_dl","ml_llm_rag"],"Project 4 Plan: Extraction Fine-Tuning Dataset","Design Project 4 benchmark: choose schema-extraction task (bills/tickets) + eval split.","aiml_guide",1.5]
        ],
        [
          ["dsa",["dsa_graphs"],"Blind Dijkstra + Kahn Recall","Write both Dijkstra & Kahn topo sort bug-free in 12 minutes.","py_rev",0.8],
          ["sql",["sql_perf"],"DE Ch.1–2 Recap Quiz","Answer 5 questions on Parquet row-groups, Z-ordering & partition cardinality.","de_guide",0.8],
          ["aiml",["ml_llm_rag"],"KV-Cache & vRAM Sizing Calculator Script","Write small Python script computing FP16 vs INT8 weights + KV-cache per context length.","aiml_guide",1.4]
        ]
      ]
    },
    {
      id: 16,
      month: 4,
      title: "DP Maint + Loop B, Lakehouse SQL & Project 4 Ship",
      focus: ["Maint: DP + Mock Loop B Coding","DE Ch.3–4: Lakehouse, SCD & Quality","AI/ML Pt 10 LoRA + Ship Project 4"],
      practiceTag: "Maint W16 • DE Ch.3–4 • Ship Proj 4",
      targets: [
        {"id":"w16_d","track":"dsa","text":"Drill 1D/2D/Knapsack DP and pass Mock Loop B (SDE-1) timed coding round."},
        {"id":"w16_s","track":"sql","text":"Complete Data Engineering Ch.3–4 (Incremental MERGE/upsert, SCD Type 2 & DQ checks) + DE Prac."},
        {"id":"w16_a","track":"aiml","text":"Complete LoRA/QLoRA fine-tuning workflow and ship Portfolio Project 4 (Prompted vs Fine-tuned)."}
      ],
      days: [
        [
          ["dsa",["dsa_dp_adv"],"Timed 1D/2D DP Speed Pair","Solve 2 unseen DP Mediums (string + decision state) in 50 min cleanly.","py_guide",1],
          ["sql",["sql_perf"],"DE Ch.3: Lakehouse Tables & Incremental Loads","Study Iceberg/Delta snapshots, ACID merges, idempotent backfill & watermarks.","de_guide",1],
          ["aiml",["ml_llm_rag"],"LoRA / QLoRA Maths & Rank Selection","Study low-rank adapters W + BA, 4-bit NormalFloat, alpha/r scaling & target modules.","aiml_guide",1.7]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Knapsack & State-Space Space Reduction","Convert 2D memoised DP into O(W) bottom-up loop cleanly.","py_prac",0.9],
          ["sql",["sql_joins","sql_windows"],"DE Ch.3: Slowly Changing Dimensions (SCD 2)","Implement SQL MERGE + effective_from/effective_to historical dimension tracking.","de_guide",1],
          ["aiml",["ml_llm_rag"],"Project 4 Baseline: Prompted Large Model","Evaluate zero/few-shot large model on Project 4 held-out extraction set; log cost & latency.","aiml_guide",1.8]
        ],
        [
          ["dsa",["dsa_bsearch","dsa_graphs"],"Mock Loop B (SDE-1) Timed Coding Round","Sit Loop B Graph + Binary Search timed problems (45m) & grade with Loop B rubric.","mock_guide",1.3],
          ["sql",["sql_perf"],"DE Ch.4: Data Quality Contracts & Idempotency","Implement late-arriving data handling, dedup & row-count/null invariant SQL assertions.","de_guide",1],
          ["aiml",["ml_llm_rag"],"Project 4 Fine-Tune: LoRA/QLoRA Small Model","Train QLoRA adapter on Colab/Kaggle free GPU; log training loss & schema compliance.","aiml_guide",1.8]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Hard DP Challenge (Interval or Bitmask DP)","Solve Burst Balloons or TSP/Bitmask DP exercise cleanly within 45 min.","py_prac",1],
          ["sql",["sql_perf"],"DE Practice Book Remaining Exercises","Finish all remaining Data Engineering Practice Book SQL pipeline exercises.","de_prac",1],
          ["aiml",["ml_llm_rag"],"Project 4 Eval Matrix: Acc vs Latency vs $/1k","Benchmark prompted big model vs LoRA small model across exact-match, p95 latency & $/1k req.","aiml_guide",1.7]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Loop B Coding Debrief & Error Log","Audit Loop B code clarity, edge tests & complexity explanation using Loop Guide Ch.5.","mock_guide",0.9],
          ["sql",["sql_windows","sql_perf"],"Point-in-Time SCD Type 2 Join Drill","Write valid_from <= event_ts < valid_to join for historical truth without leakage.","de_prac",0.9],
          ["aiml",["ml_llm_rag"],"Failure Case Analysis: Prompt vs LoRA","Categorise remaining extraction errors (formatting, rare fields, multi-page noise).","aiml_guide",1.5]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Month 4 Redo Queue Consolidation","Re-solve all Month 4 ~ flagged problems from blank files.","py_prac",1],
          ["sql",["sql_perf"],"Month 4 Lakehouse + Analytics Synthesis","Verify DuckDB + DSI Ch.1 queries all pass cleanly.","de_guide",0.8],
          ["aiml",["ml_llm_rag"],"Ship Portfolio Project 4 (GitHub + Write-up)","Complete README with decision rule: when LoRA beats prompting on cost & latency.","aiml_guide",1.8]
        ],
        [
          ["dsa",["dsa_arrays","dsa_trees","dsa_graphs","dsa_dp_adv"],"Month 4 Mixed Coding Check","Sit 2 unseen Medium/Hard problems across Arrays & DP in 60 min.","mock_work",1.2],
          ["sql",["sql_windows","sql_perf"],"Month 4 SQL Mastery Gate Check","Pass 4 mixed Cohort + SCD2 + Parquet EXPLAIN questions.","dsi_prac",0.9],
          ["aiml",["ml_dl","ml_llm_rag"],"Month 4 Portfolio Showcase Check","Verify Projects 1, 2 & 4 READMEs follow the Part 15 structure.","aiml_guide",1.3]
        ]
      ]
    },
    {
      id: 17,
      month: 5,
      title: "Stack/Greedy Maint, EXPLAIN Clinic & RAG Labs 1–2",
      focus: ["Maint: Mono Stack, Intervals & Greedy","EXPLAIN Query Tuning Clinic","AI/ML Pt 11 + RAG Workshop Labs 1–2"],
      practiceTag: "Maint W17 • SQL Clinic • RAG Labs 1–2",
      targets: [
        {"id":"w17_d","track":"dsa","text":"Drill monotonic stack/deque, greedy intervals & heap-greedy problems cleanly."},
        {"id":"w17_s","track":"sql","text":"Complete a SQL EXPLAIN Query Tuning Clinic combining MySQL Pt 10 indexes + DuckDB OLAP plans."},
        {"id":"w17_a","track":"aiml","text":"Complete AI/ML Pt 11 (RAG/Eval) & RAG Workshop Modules 1–2 (Chunking, FAISS+BM25, Recall@k)."}
      ],
      days: [
        [
          ["dsa",["dsa_linear"],"Monotonic Stack & Deque Speed Pair","Solve Sliding Window Maximum + Next Greater Element II in 40 min.","py_guide",0.9],
          ["sql",["sql_perf"],"EXPLAIN Clinic 1: Removing Full Table Scans","Diagnose type=ALL on MySQL Pt 10; design composite covering index fixing filesort.","sql_guide",0.9],
          ["aiml",["ml_llm_rag"],"AI/ML Pt 11: Retrieval & Chunking Geometry","Compare fixed vs structure-aware section chunking (why sections beat paragraphs on handbooks).","aiml_guide",1.8]
        ],
        [
          ["dsa",["dsa_bsearch","dsa_dp_adv"],"Greedy Interval & Jump Drills","Solve Non-overlapping Intervals, Merge Intervals & Jump Game II with exchange proof.","py_prac",0.9],
          ["sql",["sql_perf"],"EXPLAIN Clinic 2: Subquery -> Join / Window","Eliminate dependent subqueries in EXPLAIN output; verify single-pass window plan.","sql_prac",0.9],
          ["aiml",["ml_llm_rag"],"RAG Workshop Lab 1: Offline Embeddings & FAISS","Run Lab 1 building offline vector index & cosine retrieval pipeline (`kestrel` patterns).","rag_ws",1.8]
        ],
        [
          ["dsa",["dsa_linear","dsa_dp_adv"],"Hard Stack / Greedy Drill","Solve Largest Rectangle in Histogram or Candy / Minimum Platforms variant.","py_prac",1],
          ["sql",["sql_perf"],"EXPLAIN Clinic 3: DuckDB Parquet Predicate Push","Verify DuckDB EXPLAIN filter pushdown and aggregation memory efficiency.","de_guide",0.9],
          ["aiml",["ml_llm_rag"],"RAG Workshop Lab 2: BM25 Hybrid + RRF","Combine sparse BM25 + dense FAISS with Reciprocal Rank Fusion; measure Recall@k.","rag_ws",1.8]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Greedy Failure Counter-Examples Audit","Identify 3 problems where greedy fails & DP is required (e.g. arbitrary Coin Change).","py_guide",0.9],
          ["sql",["sql_perf"],"Composite Index Order Stress Test","Solve 4 multi-column WHERE + IN + ORDER BY index selection scenarios.","sql_prac",0.9],
          ["aiml",["ml_llm_rag"],"AI/ML Pt 11 Practice Exercises (RAG & Eval)","Complete AI/ML Practice Book Part 11 retrieval, chunking & metric exercises.","aiml_prac",1.7]
        ],
        [
          ["dsa",["dsa_linear"],"Workbook Coding Drill (Stack/Intervals)","Time 1 Mock Workbook problem focusing on clean helper structure.","mock_work",0.9],
          ["sql",["sql_perf"],"SQL Indexing Cardinality & Selectivity Notes","Summarise B-Tree prefix, covering index & write-amplification trade-offs.","sql_rev",0.8],
          ["aiml",["ml_llm_rag"],"Project 3 Spec & Corpus Ingestion","Start Project 3 (Evaluated RAG Assistant): prepare domain corpus (tariffs/manuals/docs).","aiml_guide",1.8]
        ],
        [
          ["dsa",["dsa_linear","dsa_dp_adv"],"Week 17 Redo & Pattern Check","Redo any stumbled stack/greedy problems from blank file.","py_rev",0.9],
          ["sql",["sql_perf"],"EXPLAIN Checklist Sign-Off","Verify ability to spot filesort, temporary table & range scan stops immediately.","sql_guide",0.8],
          ["aiml",["ml_llm_rag"],"Project 3 Baseline Retriever & 100+ QA Set","Build BM25 baseline + curate 100+ labelled questions including unanswerable traps.","aiml_guide",1.8]
        ],
        [
          ["dsa",["dsa_linear"],"Timed 25m Stack Template Recall","Write monotonic increasing/decreasing stack pattern clean from memory.","py_rev",0.8],
          ["sql",["sql_perf"],"Timed SQL Index Diagnostic Quiz","Fix 3 slow queries in 20 minutes by proposing exact DDL ALTER INDEX fixes.","sql_prac",0.8],
          ["aiml",["ml_llm_rag"],"Project 3 Chunking & Retriever Ablation Prep","Set up structured evaluation harness recording Recall@k and latency per config.","rag_ws",1.5]
        ]
      ]
    },
    {
      id: 18,
      month: 5,
      title: "Tries/DSU/Bits Maint, SQL Mock Set & Project 3 Ship",
      focus: ["Maint: Tries, DSU & Bitmasks","5-Query Timed Analytics SQL Mock","RAG Lab 3 (Rerank/Cite) + Ship Project 3"],
      practiceTag: "Maint W18 • 5-Query SQL Mock • Ship Proj 3",
      targets: [
        {"id":"w18_d","track":"dsa","text":"Drill Tries, Union-Find, Bitmask subsets & O(log n) math patterns cleanly."},
        {"id":"w18_s","track":"sql","text":"Pass a 5-query timed Analytics SQL mock (ranking, cohorts, funnels, dedup & self-joins)."},
        {"id":"w18_a","track":"aiml","text":"Complete RAG Workshop Module 3 (Reranking, Citations, Refusals) & ship Portfolio Project 3."}
      ],
      days: [
        [
          ["dsa",["dsa_dp_adv","dsa_toolkit"],"Timed Trie & Prefix Dictionary Drill","Solve Implement Trie / Word Search II / Maximum XOR of Two Numbers via bitwise Trie.","py_guide",1],
          ["sql",["sql_windows"],"SQL Drill: Multi-Step CTE + Top-K Per Cohort","Practice clean readable CTE decomposition prior to timed mock.","dsi_guide",0.9],
          ["aiml",["ml_llm_rag"],"RAG Workshop Lab 3: Grounded Citations & Refusals","Implement strict source-chunk citation enforcement + 'I don't know' abstention rule.","rag_ws",1.8]
        ],
        [
          ["dsa",["dsa_graphs","dsa_dp_adv"],"Bitmask Subset & Number-Theory Drill","Solve Subsets/XOR queries, Sieve prime factorisation & modular inverse problems.","py_prac",1],
          ["sql",["sql_windows","sql_joins"],"5-Query Timed Analytics SQL Mock (60 Min)","Sit full 5-query timed test covering funnels, retention, sessionisation & rolling metrics.","dsi_prac",1.1],
          ["aiml",["ml_llm_rag"],"Project 3: Add Cross-Encoder Reranking","Upgrade Project 3 hybrid retriever with cross-encoder re-ranker; log delta Recall@k.","aiml_guide",1.8]
        ],
        [
          ["dsa",["dsa_dp_adv","dsa_graphs"],"DSU + Kruskal + Bitmask Combined Set","Solve Satisfiability of Equality Equations & Smallest Sufficient Team variant.","py_guide",1],
          ["sql",["sql_windows"],"Mock Post-Mortem & Null/Tie Audit","Audit 5-query mock solutions for zero-row cohorts, division-by-zero & duplicate ties.","dsi_prac",0.9],
          ["aiml",["ml_llm_rag"],"Project 3: Run 100+ QA Faithfulness Eval","Score faithfulness, refusal accuracy on unanswerable prompts & context precision.","aiml_guide",1.8]
        ],
        [
          ["dsa",["dsa_dp_adv"],"String Matching (KMP / Rolling Hash) Drill","Re-solve Longest Happy Prefix or Repeated String Match in O(n).","py_prac",0.9],
          ["sql",["sql_perf"],"Rewrite Mock Queries for Index Scalability","Ensure none of the 5 analytical queries trigger quadratic correlated scans.","sql_guide",0.8],
          ["aiml",["ml_llm_rag"],"Project 3 Experiment Ablation Matrix","Generate final table comparing chunk sizes x (BM25 / Dense / Hybrid / +Reranker).","rag_ws",1.7]
        ],
        [
          ["dsa",["dsa_toolkit","dsa_dp_adv"],"Python Bitwise & Collection Edge Audit","Check Python arbitrary-precision negative bit shifts & Trie memory cleanup.","py_rev",0.9],
          ["sql",["sql_windows"],"Anti-Join & Cohort Missing-Bucket Check","Verify retained=0 users appear cleanly in cohort retention grid via date spine.","dsi_guide",0.8],
          ["aiml",["ml_llm_rag"],"Project 3 API / UI & Prompt-Safety Polish","Wrap Project 3 RAG pipeline in fast CLI/FastAPI endpoint with clickable cited spans.","aiml_guide",1.7]
        ],
        [
          ["dsa",["dsa_dp_adv","dsa_graphs"],"Week 18 Redo Queue Sweep","Re-solve any stumbled Trie/Bit/DSU items without hints.","py_prac",0.9],
          ["sql",["sql_windows"],"Timed 25m Re-solve of Hardest Mock Query","Rewrite the hardest of the 5 mock queries cold in under 25 minutes.","dsi_prac",0.8],
          ["aiml",["ml_llm_rag"],"Ship Portfolio Project 3 (Evaluated RAG)","Push Project 3 with 100+ eval dataset, ablation table, failure taxonomy & README.","aiml_guide",1.9]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Quick Revision Ch.10–11 Check","Review bit tricks, GCD/LCM, Trie & Fenwick code templates.","py_rev",0.8],
          ["sql",["sql_windows"],"Analytics SQL Pattern Self-Test","Recite the 6 interview SQL query templates cleanly.","dsi_guide",0.7],
          ["aiml",["ml_agents"],"Preview Agentic AI (AI/ML Pt 12 Roadmap)","Read AI/ML Pt 12 overview to prepare tool-loop & MCP architecture for Week 19.","aiml_guide",1.3]
        ]
      ]
    },
    {
      id: 19,
      month: 5,
      title: "OA Simulation, Concurrency/Locks & Agents Labs 4–5",
      focus: ["Maint: Timed 2-Problem OA Sim","Transactions, Locks & Window Edge Review","AI/ML Pt 12 + Workshop Labs 4–5"],
      practiceTag: "2-Prob OA Sim • Locks Rev • Agent Labs 4–5",
      targets: [
        {"id":"w19_d","track":"dsa","text":"Pass a strict 60-min 2-problem Online Assessment simulation + full Error Log audit."},
        {"id":"w19_s","track":"sql","text":"Review Transactions/ACID/Locks + complex window edge cases so zero corner-case traps remain."},
        {"id":"w19_a","track":"aiml","text":"Complete AI/ML Pt 12 & Workshop Labs 4–5 (Tool Loop, Memory, MCP, Prompt-Injection Defence)."}
      ],
      days: [
        [
          ["dsa",["dsa_arrays","dsa_graphs"],"60-Min 2-Problem OA Simulation (No Hints)","Sit unseen Medium + Hard pair with timer, constraint budget check & stress test.","py_guide",1.2],
          ["sql",["sql_tx"],"Transactions & Gap-Lock Refresher","Trace lost update, phantom gap locks & deadlock retry loops under REPEATABLE READ.","sql_guide",0.9],
          ["aiml",["ml_agents"],"AI/ML Pt 12: Tool Calling, Loops & Memory","Build structured tool-calling schema, max-step budget & bounded episodic/working memory.","aiml_guide",1.8]
        ],
        [
          ["dsa",["dsa_dp_adv"],"OA Simulation Brute-Force Stress Test Audit","Compare OA simulation logic against brute force on 100 random small inputs.","py_guide",0.9],
          ["sql",["sql_windows","sql_core"],"Window Edge-Cases: NULLs, Ties & Empty Frames","Test NULLS LAST emulation, AVG ignoring NULLs & RANGE vs ROWS on duplicate dates.","sql_ref",0.9],
          ["aiml",["ml_agents"],"RAG/Agent Workshop Lab 4: Tested Agent Loop","Run Lab 4 building a deterministic tested ReAct tool loop with validation schemas.","rag_ws",1.8]
        ],
        [
          ["dsa",["dsa_trees","dsa_graphs"],"Speed Drill: Hybrid BFS + State Tracking","Solve 1 multi-state BFS problem (key-bitmask or k-eliminations) cleanly.","py_prac",1],
          ["sql",["sql_tx"],"Concurrency Design Scenarios (Booking/Ledger)","Write atomic SQL reservation query using SELECT FOR UPDATE / affected_rows check.","sql_prac",0.9],
          ["aiml",["ml_agents"],"AI/ML Pt 12: MCP Servers & Agent Safety","Study Model Context Protocol capability boundaries & sandboxed tool execution.","aiml_guide",1.7]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Full Error-Log Audit (Weeks 1–18 Bugs)","Categorise all past wrong submissions by root cause; solve 2 targeted weak spots.","py_rev",1],
          ["sql",["sql_windows","sql_tx"],"Complex Window + Locking Mixed Quiz","Answer 6 interview follow-up questions spanning window performance and MVCC.","sql_rev",0.9],
          ["aiml",["ml_agents"],"RAG/Agent Workshop Lab 5: Prompt Injection","Run Lab 5 indirect prompt-injection attacks via retrieved docs/tools & add defences.","rag_ws",1.8]
        ],
        [
          ["dsa",["dsa_linear","dsa_bsearch"],"Timed Workbook Coding Check","Solve 1 Workbook coding round problem in 30 min under strict interviewer pacing.","mock_work",0.9],
          ["sql",["sql_core","sql_joins"],"3-Valued NULL & Anti-Join Edge Check","Verify all 6 subtle SQL traps in Commands Reference Appendix B.","sql_guide",0.8],
          ["aiml",["ml_agents"],"AI/ML Pt 12 Practice Exercises (Agents)","Solve AI/ML Practice Book Part 12 agent loop, state & safety exercises.","aiml_prac",1.6]
        ],
        [
          ["dsa",["dsa_arrays","dsa_dp_adv"],"Week 19 Redo Re-Solve","Re-solve Week 19 OA problems faster and cleaner than first pass.","py_prac",0.9],
          ["sql",["sql_tx"],"Transactional Queue / Outbox Pattern Query","Write SKIP LOCKED job claim SQL pattern cleanly for concurrent workers.","sql_guide",0.8],
          ["aiml",["ml_agents"],"Project 5 Architecture Design (Routing + Paper)","Design Project 5 multi-agent orchestrator connecting Project 3 RAG + routing paper.","aiml_guide",1.7]
        ],
        [
          ["dsa",["dsa_toolkit"],"10^7 Ops Budget & C Built-In Review","Verify fast I/O (`sys.stdin.buffer.read`), list slicing cost & set lookup budgets.","py_rev",0.8],
          ["sql",["sql_tx"],"Isolation & Locking Cheat Sheet Review","Review deadlock detection, 2PL and isolation level trade-offs.","sql_rev",0.7],
          ["aiml",["ml_agents"],"Project 5 Workers & Tool Interfaces Build","Implement calculator, tariff lookup & Project 3 retrieval tools with strict Pydantic schemas.","rag_ws",1.6]
        ]
      ]
    },
    {
      id: 20,
      month: 5,
      title: "Loop C Coding, Analytics Case SQL & Project 5 Ship",
      focus: ["Maint: Loop C Hard Coding + Defences","End-to-End Analytics Drop Case","AI/ML Pt 13 + Lab 6 + Ship Project 5"],
      practiceTag: "Loop C • Analytics Case • Ship Proj 5",
      targets: [
        {"id":"w20_d","track":"dsa","text":"Pass Mock Loop C (SDE-2 level) coding round + explain brute-to-optimal complexity trade-offs."},
        {"id":"w20_s","track":"sql","text":"Solve an end-to-end SQL + Analytics Drop Case (funnel + cohort + mix shift diagnosis)."},
        {"id":"w20_a","track":"aiml","text":"Complete AI/ML Pt 13 & Workshop Lab 6 (CI Evals) and ship Portfolio Project 5 (Model Router)."}
      ],
      days: [
        [
          ["dsa",["dsa_graphs","dsa_dp_adv"],"Mock Loop C (SDE-2) Timed Coding Round","Sit Loop C harder coding problems (ordered/sorted logic + BFS over routes) in 45m.","mock_guide",1.3],
          ["sql",["sql_windows"],"Analytics Case Setup: Funnel + Cohort Metrics","Query daily active funnel conversions & slice by platform/country on sample tables.","dsi_guide",1],
          ["aiml",["ml_agents"],"AI/ML Pt 13: Multi-Agent Orchestration","Study orchestrator-worker patterns, handoff contracts, termination & cost budgets.","aiml_guide",1.7]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Loop C Complexity Defence & Alternate Data Structs","Compare sortedcontainers/bisect vs Balanced BST vs Heap for Loop C problems.","mock_guide",0.9],
          ["sql",["sql_windows","sql_joins"],"Analytics Case: Mix-Shift Drop Diagnosis","Write SQL decomposing overall conversion change into within-segment delta vs mix shift.","dsi_guide",1.1],
          ["aiml",["ml_agents"],"RAG/Agent Workshop Lab 6: CI Evaluation Suite","Run Lab 6 trajectory & regression evaluation assertions inside automated test suite.","rag_ws",1.7]
        ],
        [
          ["dsa",["dsa_arrays","dsa_graphs"],"Clean Implementation & Edge-Test Kata","Pick 2 complex problems and reach 100% pass on first run without print-debugging.","py_guide",1],
          ["sql",["sql_windows"],"Solve DSI Practice Book Case Queries","Cross-verify metric tree decomposition SQL queries against DSI Practice answers.","dsi_prac",0.9],
          ["aiml",["ml_agents"],"Project 5 Router: Cheap vs Strong Model Routing","Implement escalation/cost-aware router connecting directly to your reasoning-mode paper.","aiml_guide",1.8]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Workbook Coding Round (Dynamic Programming)","Complete 1 timed Workbook DP round and grade communication & test cases.","mock_work",1],
          ["sql",["sql_perf"],"Analytics Case Optimization Pass","Add indexing / pre-aggregation summary design notes for the analytics dashboard.","de_guide",0.8],
          ["aiml",["ml_agents"],"Project 5: Measure Routing vs Always-Large","Evaluate task success rate, token cost & p95 latency (Router vs Cheap vs Large baselines).","aiml_guide",1.8]
        ],
        [
          ["dsa",["dsa_bsearch","dsa_graphs"],"Trade-Off Verbalisation Practice","Practice explaining time/space/memory limits in <90 seconds for 4 classic patterns.","py_rev",0.8],
          ["sql",["sql_windows"],"Written SQL Case Executive Readout","Summarise SQL metric-drop root cause + actionable recommendation in 5 bullet lines.","dsi_guide",0.8],
          ["aiml",["ml_agents"],"Project 5 Injection & Trajectory Failure Audit","Run adversarial tool-output prompt injections & catalogue multi-agent failure trajectories.","rag_ws",1.7]
        ],
        [
          ["dsa",["dsa_dp_adv","dsa_graphs"],"Month 5 Redo Queue Zero-Out","Clear every Month 5 ~ flag so final Month 6 enters with 0 overdue items.","py_prac",1],
          ["sql",["sql_windows","sql_perf"],"Month 5 SQL Recap Check","Verify speed on both OLTP tuning & multi-CTE analytical SQL.","sql_rev",0.8],
          ["aiml",["ml_agents"],"Ship Portfolio Project 5 (Cost-Aware Router)","Push Project 5 repo linking RAG Project 3 + routing paper citation + benchmark table.","aiml_prac",1.9]
        ],
        [
          ["dsa",["dsa_arrays","dsa_dp_adv"],"Month 5 Checkpoint Mock (2 Unseen Med/Hard)","Complete 2 timed unseen problems with full edge-case harness.","mock_work",1.2],
          ["sql",["sql_windows"],"DSI Case Study Review","Review mix-shift Simpson's reversal explanation cleanly.","dsi_guide",0.7],
          ["aiml",["ml_agents"],"AI/ML Practice Pt 13 Completion Check","Verify all AI/ML Practice Pt 13 multi-agent exercises are completed & checked.","aiml_prac",1.4]
        ]
      ]
    },
    {
      id: 21,
      month: 6,
      title: "Top-20 Pattern Sprint, SQL Quick Rev & MLSD Core",
      focus: ["Top 20 High-Frequency Patterns","SQL Quick Revision & Classic Queries","MLSD Ch.1–5 + mq Pts 1–4"],
      practiceTag: "Top-20 DSA • SQL Rev • MLSD Ch.1–5",
      targets: [
        {"id":"w21_d","track":"dsa","text":"Sprint top 20 high-frequency interview coding patterns from memory with sub-25m accuracy."},
        {"id":"w21_s","track":"sql","text":"Review 04_MySQL_Quick_Revision.pdf + re-solve 8 classic interview query patterns cleanly."},
        {"id":"w21_a","track":"aiml","text":"Complete ML System Design Ch.1–5 (Framing, Labels/Leakage, Feature Stores, Offline & Online Eval) + mq Pts 1–4."}
      ],
      days: [
        [
          ["dsa",["dsa_arrays","dsa_bsearch"],"Top-20 Sprint Batch 1 (Patterns 1–4)","Re-code Two Sum/Subarray k, Sliding Window, Kadane & BS-on-Answer fast.","py_rev",1],
          ["sql",["sql_core","sql_joins"],"MySQL Quick Revision Pass 1 (Core -> Joins)","Drill DDL/DML/NULL/Agg/Join rules from Quick Revision & 4 classic queries.","sql_rev",0.9],
          ["aiml",["ml_sys_ops"],"MLSD Ch.1: Framing & Metric Selection","Turn business goals into ML objective, label proxy, offline & online guardrails + mq Pt 1.","mlsd_prac",1.7]
        ],
        [
          ["dsa",["dsa_linear","dsa_trees"],"Top-20 Sprint Batch 2 (Patterns 5–8)","Re-code Reverse LL/Cycle, Mono Stack, Tree Bottom-up LCA & BST Validate.","py_guide",1],
          ["sql",["sql_windows"],"MySQL Classic Queries Re-Drill (4 Windows)","Solve Top-N ties, running totals, MoM growth & consecutive streaks from blank.","sql_prac",0.9],
          ["aiml",["ml_sys_ops"],"MLSD Ch.2: Data, Labels & Leakage Simulation","Run drift time-split vs random-split AUC (0.885 90d vs 0.707 year) + mq Pt 2.","mlsd_prac",1.8]
        ],
        [
          ["dsa",["dsa_trees","dsa_graphs"],"Top-20 Sprint Batch 3 (Patterns 9–12)","Re-code Backtracking, Two-Heap Median, Grid BFS & Kahn Topo Sort.","py_prac",1],
          ["sql",["sql_perf","sql_tx"],"MySQL Quick Revision Pass 2 (Indexes & Locks)","Review B-Tree composite prefixes, EXPLAIN types & InnoDB isolation guarantees.","sql_rev",0.9],
          ["aiml",["ml_sys_ops"],"MLSD Ch.3: Feature Stores & Train/Serve Skew","Design batch vs streaming feature pipelines preventing dual-code skew + mq Pt 3 (start).","mlsd_guide",1.6]
        ],
        [
          ["dsa",["dsa_graphs","dsa_dp_adv"],"Top-20 Sprint Batch 4 (Patterns 13–16)","Re-code Dijkstra, DSU, 1D Coin Change & Edit Distance / LCS cleanly.","py_guide",1.1],
          ["sql",["sql_joins","sql_windows"],"SQL Classic Mock Pair (CTE + Self-Join)","Solve 2 tricky classic SQL puzzles without hints in 25 min.","sql_prac",0.8],
          ["aiml",["ml_sys_ops"],"MLSD Ch.4: Offline Eval, Calibration & Ranking","Run imbalance PR-AUC, cost thresholds, Brier calibration, NDCG@k + finish mq Pt 3.","mlsd_prac",1.8]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Top-20 Sprint Batch 5 (Patterns 17–20)","Re-code Stock Cooldown, Greedy Intervals, Prefix Trie & Bit-count DP.","py_prac",1.1],
          ["sql",["sql_model","sql_tx"],"SQL Normalisation & Deadlock Rapid Fire","Answer 6 normalisation + locking/transaction oral drill questions.","sql_guide",0.8],
          ["aiml",["ml_sys_ops"],"MLSD Ch.5: Online Experiments & Peeking Trap","Compute MDE sample size, peeking false positives, interleaving & bandits + mq Pt 4.","mlsd_prac",1.7]
        ],
        [
          ["dsa",["dsa_arrays","dsa_dp_adv"],"Weakest 2 Patterns Deep Drill","Inspect stopwatch logs across the 20 patterns; redo slowest 2 from scratch.","py_rev",1],
          ["sql",["sql_windows"],"SQL Speed Run: 3 Window Queries in 20m","Execute 3 analytics window queries cleanly under strict speed cap.","dsi_prac",0.8],
          ["aiml",["ml_sys_ops"],"MLSD Ch.1–5 Diagram Sketching Practice","Draw offline-online feature store & evaluation pipeline from blank sheet.","mlsd_guide",1.5]
        ],
        [
          ["dsa",["dsa_dp_adv","dsa_graphs"],"Ch.12 Decision Table Mapping Check","Map 10 blind problem prompts -> exact pattern & O() complexity in 8 minutes.","py_guide",0.9],
          ["sql",["sql_core","sql_perf"],"SQL Error-Trap Quick Sweep","Confirm zero ambiguity on NULL, GROUP BY, upsert alias & LIKE index rules.","sql_ref",0.7],
          ["aiml",["ml_sys_ops"],"End-to-End Framing Drill (Smart Energy + Fraud)","Write complete Problem Framing + Metrics doc for 2 unseen ML scenarios.","mlsd_prac",1.5]
        ]
      ]
    },
    {
      id: 22,
      month: 6,
      title: "Timed Mock Coding/SQL & ML System Design Cases",
      focus: ["Workbook Timed Coding Mocks","DSI Pt 1 Timed SQL Mock","MLSD Ch.6–10 + mq Pts 5–7"],
      practiceTag: "Mock Work Coding • DSI SQL • MLSD Ch.6–10",
      targets: [
        {"id":"w22_d","track":"dsa","text":"Complete 3 full timed coding mock rounds from 03_Mock_Interview_Loops_Workbook.pdf."},
        {"id":"w22_s","track":"sql","text":"Ace a timed DSI SQL interview mock covering windows, cohorts, funnels & edge handling."},
        {"id":"w22_a","track":"aiml","text":"Finish MLSD Ch.6–10 (Serving, Drift/Retrain, Recs/Search/Fraud/LLM Case Studies) + mq Pts 5–7."}
      ],
      days: [
        [
          ["dsa",["dsa_arrays","dsa_bsearch"],"Mock Workbook Timed Coding Round #1","Simulate 45-min live interview: clarify constraints, brute force -> optimal, dry run.","mock_work",1.1],
          ["sql",["sql_windows"],"Timed DSI Analytics SQL Mock (Part A)","Solve 3 hard analytics SQL queries cleanly within 35 min.","dsi_prac",0.9],
          ["aiml",["ml_sys_ops"],"MLSD Ch.6: Serving, Tail Latency & Caching","Model fan-out p99 latency budget, dynamic batching & cache hit trade-offs + mq Pt 5.","mlsd_prac",1.8]
        ],
        [
          ["dsa",["dsa_trees","dsa_graphs"],"Mock Workbook Timed Coding Round #2","Sit 45-min Tree/Graph coding mock with explicit complexity justification.","mock_work",1.1],
          ["sql",["sql_joins","sql_windows"],"Timed DSI Analytics SQL Mock (Part B)","Solve 3 retention/funnel queries + verify SQLite/MySQL outputs.","dsi_prac",0.9],
          ["aiml",["ml_sys_ops"],"MLSD Ch.7: Drift, Feedback Loops & Retraining","Simulate PSI covariate drift, concept drift & delayed-label trigger + mq Pt 6.","mlsd_prac",1.7]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Mock Workbook Timed Coding Round #3","Sit 45-min DP/Greedy coding mock from Workbook; track bug-free first compile.","mock_work",1.1],
          ["sql",["sql_perf"],"Live Query Optimization Follow-up Simulation","Explain aloud how to scale each mock SQL query from 10K to 1B rows.","sql_guide",0.8],
          ["aiml",["ml_sys_ops"],"MLSD Ch.8: Ranking, Search Bias & Fraud/ETA","Study 2-stage retrieval-rerank, position-bias IPS, delayed fraud & ETA architectures.","mlsd_guide",1.7]
        ],
        [
          ["dsa",["dsa_graphs","dsa_dp_adv"],"Mock Loops Debrief (Ch.5 Framework)","Apply Mock Loops Ch.5 debrief template to Rounds #1–3 & drill missed edge case.","mock_guide",1],
          ["sql",["sql_windows","sql_tx"],"SQL Corner-Case Stress Check","Audit ties, empty inputs, division by zero & concurrent read consistency.","sql_prac",0.8],
          ["aiml",["ml_sys_ops"],"MLSD Ch.9: LLM RAG & Model Router Sys Design","Synthesise RAG + cost-aware router design (ties directly to Projects 3 & 5!).","mlsd_guide",1.6]
        ],
        [
          ["dsa",["dsa_linear","dsa_dp_adv"],"Speed Re-Write of Toughest Mock Round","Rewrite the hardest problem from Mock Rounds #1–3 cold in 20 minutes.","mock_work",0.9],
          ["sql",["sql_windows"],"Analytical SQL Oral Explanation Practice","Walk through window frame bounds and CTE logic cleanly in under 3 minutes.","dsi_guide",0.7],
          ["aiml",["ml_sys_ops"],"MLSD Ch.10 + mq Pt 7 (5 Full Design Prompts)","Execute 2 timed 45-min ML system design mock prompts from mq Pt 7 + back-of-envelope.","mlsd_prac",2]
        ],
        [
          ["dsa",["dsa_arrays","dsa_dp_adv"],"Week 22 Redo Queue Review","Re-solve any imperfect Workbook round code cleanly.","py_prac",0.9],
          ["sql",["sql_perf","sql_windows"],"Mixed SQL Fluency Verification","Complete 3 rapid-fire schema + query questions cleanly.","sql_rev",0.8],
          ["aiml",["ml_sys_ops"],"MLSD Final 3 Design Prompts + Ch.10 Bank","Finish remaining 3 full ML design prompts in mq Pt 7 & review numbers-to-know.","mlsd_prac",1.9]
        ],
        [
          ["dsa",["dsa_toolkit","dsa_dp_adv"],"Dry-Run Tracing Habit Drill","Trace 2 medium solutions step-by-step on paper variables without running first.","py_guide",0.8],
          ["sql",["sql_joins","sql_windows"],"Zero-Hint Funnel + Window Verification","Write 1 combined cohort-funnel query bug-free on first run.","dsi_prac",0.8],
          ["aiml",["ml_sys_ops"],"Self-Grade ML System Design Rubrics","Compare your 5 MLSD walkthroughs against Mock Loop / MLSD Ch.10 rubrics.","mlsd_guide",1.4]
        ]
      ]
    },
    {
      id: 23,
      month: 6,
      title: "Pattern Speed Check, Schema/Opt Mock & Full MLOps",
      focus: ["Pattern Speed Check (py_rev)","Schema Design & EXPLAIN Opt Mock","MLOps Ch.1–11 + pq Pts 1–4"],
      practiceTag: "py_rev Check • Schema/Opt • Full MLOps",
      targets: [
        {"id":"w23_d","track":"dsa","text":"Pass pattern-recognition speed drill (<90s ID per problem) and complete final py_rev edge sweep."},
        {"id":"w23_s","track":"sql","text":"Pass combined Schema Design + BCNF Normalisation + EXPLAIN Index Optimisation mock."},
        {"id":"w23_a","track":"aiml","text":"Complete MLOps Guide Ch.1–11 & all 24 pq exercises (MLflow, Pandera, pytest, ONNX Int8, Canary, LLMOps)."}
      ],
      days: [
        [
          ["dsa",["dsa_toolkit","dsa_arrays"],"Pattern Recognition Flash Round (15 Prompts)","Identify optimal pattern + complexity for 15 unseen prompts in 20 minutes.","py_rev",0.9],
          ["sql",["sql_model","sql_perf"],"Schema Design Mock: E-Commerce / Smart Grid","Design normalised tables, PK/FK constraints & 4 targeted composite indexes.","sql_guide",1],
          ["aiml",["ml_sys_ops"],"MLOps Ch.1–2: Reproducibility & MLflow Registry","Pin seeds/data/code; log metrics, register model aliases & test pq Pt 1 (start).","mlops_guide",1.8]
        ],
        [
          ["dsa",["dsa_bsearch","dsa_linear"],"Sub-20m Easy/Medium Implementation Kata","Code 2 clean Python solutions (bisect + monotonic deque) back-to-back under 40m.","py_guide",0.9],
          ["sql",["sql_perf"],"EXPLAIN Optimisation Mock (5 Slow Queries)","Diagnose 5 slow SQL queries and rewrite + index them + review MySQL vs DuckDB.","sql_prac",1],
          ["aiml",["ml_sys_ops"],"MLOps Ch.3–4: Pandera Schemas & Pipelines","Validate train/serve data contracts with Pandera + DAG caching; finish pq Pt 1.","mlops_prac",1.8]
        ],
        [
          ["dsa",["dsa_trees","dsa_graphs"],"Trees & Graphs Edge-Case Checklist Sweep","Code empty/cyclic/disconnected guards cleanly on 2 compact graph/tree tasks.","py_prac",0.9],
          ["sql",["sql_tx"],"ACID, Locking & Disaster Recovery Drill","Walk through isolation guarantees, PITR binlog restore & privilege design.","sql_rev",0.8],
          ["aiml",["ml_sys_ops"],"MLOps Ch.5–6: ML pytest, FastAPI & ONNX Int8","Write invariance/slice/directional tests in pytest; benchmark FastAPI+ONNX int8 + pq Pt 2.","mlops_prac",1.9]
        ],
        [
          ["dsa",["dsa_dp_adv"],"DP State-Compression Oral + Code Drill","Write 2 DP problems coding both memoisation and O(N) rolled tabulation.","py_guide",1],
          ["sql",["sql_windows","sql_perf"],"SQL Full-Stack Persistence Bridge Recap","Review batching, connection pools, prepared statements & read-replica lag handling.","sql_guide",0.8],
          ["aiml",["ml_sys_ops"],"MLOps Ch.7–9: Monitoring, Canaries & Scaling","Implement drift alerts, shadow/canary auto-rollback & GPU replica sizing + pq Pt 3.","mlops_prac",1.9]
        ],
        [
          ["dsa",["dsa_toolkit","dsa_dp_adv"],"Mock Loop Final Coding Checklist Verification","Verify Mock Loops Ch.6 checklists (before/during/after round habits).","mock_guide",0.8],
          ["sql",["sql_model","sql_windows"],"Database Trade-Offs Q-Bank Rapid Review","Cover B-Tree vs LSM, OLTP vs OLAP, normalisation vs denormalisation.","de_guide",0.8],
          ["aiml",["ml_sys_ops"],"MLOps Ch.10–11: LLMOps & Maturity Checklist","Implement prompt versioning, LLM eval gates, semantic caching, guardrails + pq Pt 4.","mlops_prac",1.9]
        ],
        [
          ["dsa",["dsa_dp_adv","dsa_graphs"],"Clear Any Remaining Week 23 ~ Flags","Ensure every tricky DSA pattern executes cleanly first try.","py_prac",0.9],
          ["sql",["sql_perf"],"MySQL 8 Quick Revision Speed Read","Full 25-min final scan of 04_MySQL_Quick_Revision.pdf.","sql_rev",0.7],
          ["aiml",["ml_sys_ops"],"MLOps Architecture & Tool-Choice Synthesis","Map MLflow + Pandera + pytest + FastAPI/ONNX onto your 5 portfolio projects.","mlops_guide",1.5]
        ],
        [
          ["dsa",["dsa_arrays","dsa_dp_adv"],"Rest & Confidence Check: 1 Light Medium","Solve 1 crisp Medium cleanly in 18 minutes; review top Python pitfalls.","py_rev",0.7],
          ["sql",["sql_windows"],"1 Clean Analytics Query Warmup","Keep window syntax effortless in 15 minutes.","dsi_prac",0.6],
          ["aiml",["ml_sys_ops"],"MLOps Ch.11 Q-Bank Oral Practice","Answer 10 production MLOps & LLMOps questions aloud.","mlops_guide",1.4]
        ]
      ]
    },
    {
      id: 24,
      month: 6,
      title: "Placement & AI/DS Capstone Mock Week",
      focus: ["Final Mock Coding + Readiness","Final Mock SQL + Q-Bank","DSI Ch.3–7 (Prob/Cases) + 5 Projects + HR"],
      practiceTag: "Full Capstone Mock • DSI Ch.3–7 • 5 Projects & HR",
      targets: [
        {"id":"w24_d","track":"dsa","text":"Complete final full-stack coding mock simulation with zero bugs and crisp verbal narration."},
        {"id":"w24_s","track":"sql","text":"Pass final combined Analytics + Schema SQL readiness check cleanly."},
        {"id":"w24_a","track":"aiml","text":"Complete DSI Ch.3–7 (Prob Puzzles, Stats, Product/Cases, iq Pts 2–4), polish 5 Projects & HR/STAR bank."}
      ],
      days: [
        [
          ["dsa",["dsa_arrays","dsa_bsearch"],"Final Warm-Up Timed Pair (Easy + Medium)","Clean 30-min coding block testing speed and edge-case habit.","py_rev",0.8],
          ["sql",["sql_windows","sql_joins"],"Final SQL Warm-Up Pair (Cohort + Anti-Join)","Clean 25-min SQL block confirming 0 syntax slips.","sql_rev",0.7],
          ["aiml",["ml_math","ml_sys_ops"],"DSI Ch.3: 15 Classic Probability Puzzles + Sim","Solve Bayes, expectation, coupon-collector & conditional puzzles by hand + Python sim.","dsi_guide",1.8]
        ],
        [
          ["dsa",["dsa_graphs","dsa_dp_adv"],"Capstone Mock Round A (DSA Coding)","Sit timed 2-problem Graph + DP assessment simulating real OA/interview.","mock_work",1.1],
          ["sql",["sql_windows","sql_perf"],"Capstone Mock Round B (SQL + Tuning)","Sit timed 30-min Analytics SQL + Index optimization round.","dsi_prac",0.9],
          ["aiml",["ml_sys_ops","ml_applied"],"DSI Ch.4–5: Stats Questions & Metric Trees","Master CI/p-value pitfalls, power, metric drop diagnosis & complete iq Pt 3.","dsi_prac",1.9]
        ],
        [
          ["dsa",["dsa_trees","dsa_dp_adv"],"Capstone Mock Review & Redo","Review Capstone Round A code quality, readability and edge coverage.","mock_guide",0.8],
          ["sql",["sql_tx","sql_model"],"SQL Short-Answer Final Flash Check","Answer 10 rapid oral questions on ACID, B+Tree, 3NF/BCNF & execution order.","sql_guide",0.7],
          ["aiml",["ml_sys_ops"],"DSI Ch.6–7: Product/Open Cases & iq Pt 4","Work estimation, launch-decision & take-home cases; solve iq Pt 4 & timed mocks.","dsi_prac",1.9]
        ],
        [
          ["dsa",["dsa_toolkit"],"Final 1-Page Python Traps Sanity Review","Scan py_rev checklists (aliased grids, -a//b, heapq ties, recursionlimit).","py_rev",0.6],
          ["sql",["sql_core","sql_windows"],"Final SQL Cheat Sheet Read","Verify 3-valued NULL, window frames & CTE habits before full loop.","sql_rev",0.6],
          ["aiml",["ml_sys_ops","ml_agents"],"AI/ML Pt 14–15 Q-Bank + 5-Project Polish","Drill AI/ML Pt 15 question bank; polish GitHub READMEs, demos & metrics for Projects 1–5.","aiml_guide",2]
        ],
        [
          ["dsa",["dsa_arrays","dsa_graphs","dsa_dp_adv"],"Full End-to-End Mock Interview Loop (Part 1)","Sit combined DSA Coding + Design/SQL timed blocks back-to-back with real rubric scoring.","mock_guide",1.5],
          ["sql",["sql_windows","sql_perf"],"Full End-to-End Mock Loop (SQL Drill)","Execute analytics metric-diagnosis query inside full mock interview loop.","mock_work",0.9],
          ["aiml",["ml_sys_ops","ml_agents"],"Full End-to-End Mock Loop (MLSD + Project)","Present Project 5 (Cost-Aware Multi-Agent Router) & escalation-tax research cleanly.","aiml_guide",1.6]
        ],
        [
          ["dsa",["dsa_dp_adv"],"Clear Final Tracker Redo Items","Bring Pending & Redo count to zero cleanly across Python DSA.","py_prac",0.8],
          ["sql",["sql_windows"],"Clear Final SQL Checklist Items","Confirm every weekly SQL target and skill card is checked off.","sql_rev",0.7],
          ["aiml",["ml_sys_ops"],"HR, Resume & STAR Story Bank Polish","Complete Interview/HR Guide: 'Tell me about yourself', STAR stories, research & resume QA.","hr_guide",2]
        ],
        [
          ["dsa",["dsa_toolkit","dsa_arrays","dsa_bsearch","dsa_linear","dsa_trees","dsa_graphs","dsa_dp_adv"],"6-Month DSA Sign-off & Ongoing Plan","Archive error log; set lightweight 3-problem/week maintenance cadence during placements.","py_rev",0.8],
          ["sql",["sql_model","sql_core","sql_joins","sql_windows","sql_perf","sql_tx"],"6-Month SQL Sign-off & Quick Ref Setup","Keep 04_MySQL_Quick_Revision.pdf + DSI Ch.1 sheet handy for interview mornings.","sql_rev",0.7],
          ["aiml",["ml_stack","ml_math","ml_classical","ml_applied","ml_dl","ml_llm_rag","ml_agents","ml_sys_ops"],"Final 24-Week Portfolio & Interview Graduation","Verify all 5 Projects, 21 Skill targets & HR/STAR mock readiness complete!","hr_guide",1.5]
        ]
      ]
    }
  ]
  });
})();
