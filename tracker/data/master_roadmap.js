(function () {
  "use strict";
  window.TrackerShared.registerTracker({
  "id": "python",
  "storageKey": "master_life_aiml_tracker_v1",
  "taskIdPrefix": "m",
  "defaultStartIso": "2026-11-30",
  "startDateUtc": [
    2026,
    10,
    30
  ],
  "resourcePrefix": "../",
  "backupFilePrefix": "master_roadmap_backup",
  "dailySchedule": {
    "window": "07:00 AM – 12:00 AM",
    "anchors": [
      "07:00 Wake, Birds, Brush & Bed",
      "10:30–12:30 Chores 1 + Break",
      "14:30–15:00 Lunch",
      "16:15–17:30 Chores 2 + Break",
      "19:30–20:45 Workout + Rest",
      "22:15–22:45 Dinner",
      "00:00 Lights Out (7h Sleep)"
    ]
  },
  "hub": {
    "href": "python_dsa_sql_aiml_tracker.html",
    "badge": "Master 7AM–12AM",
    "headerPill": "Unified Master Roadmap",
    "slot": 1,
    "title": "Master Daily & 24-Week Career/Research Roadmap",
    "timeline": "30 Nov 2026 – 16 May 2027 • 24 Weeks / 168 Days",
    "scope": "Python DSA (Q1 IPA), MySQL/Analytics SQL + TCS Xplore, 6-Course Udemy AI/ML Path, Freelancing Project Work + Hitesh Web Dev, Journal #1->#2, Peer Review #2 & Daily Workout."
  },
  "header": {
    "pageTitle": "Master Daily & 24-Week AI-ML, DSA, Freelance & Research Tracker",
    "title": "Master Daily Command & 24-Week Roadmap Tracker",
    "subtitle": "7:00 AM – 12:00 AM Chronological Blocks • Q1 2027 IPA DSA + SQL/Xplore + Freelancing Project Work & Hitesh Web Dev + 6-Course Udemy AI/ML + Research & Workout",
    "timelineBadge": "30 Nov 2026 – 16 May 2027 (24 Weeks / 168 Days)"
  },
  "tracks": [
    {
      "key": "dsa",
      "slot": 1,
      "label": "Python DSA",
      "headerBadge": "DSA (Q1 IPA Priority)",
      "kpiTitle": "Python DSA (IPA)",
      "kpiSub": "Ch.1–12 + D1.1–D6.6 + Mocks",
      "skillGroupTitle": "Python DSA & Coding Interview Skills (4)",
      "svgLabel": "Python DSA (4 Skills)",
      "libraryHeading": "Python DSA & Coding Mock Resources"
    },
    {
      "key": "sql_xplore",
      "slot": 2,
      "label": "SQL & Xplore",
      "headerBadge": "MySQL + TCS Xplore",
      "kpiTitle": "SQL & TCS Xplore",
      "kpiSub": "MySQL 1–16 + Xplore + Analytics SQL",
      "skillGroupTitle": "SQL, Data Engineering & TCS Xplore Skills (4)",
      "svgLabel": "SQL & Xplore (4 Skills)",
      "libraryHeading": "MySQL, Analytics SQL & TCS Xplore"
    },
    {
      "key": "aiml",
      "slot": 3,
      "label": "Udemy AI / ML",
      "headerBadge": "Udemy 6-Course AI/ML",
      "kpiTitle": "Udemy AI / ML Path",
      "kpiSub": "Math → ML/DL → RAG → Agents → HF → MLOps",
      "skillGroupTitle": "AI / ML, GenAI & MLOps Skills (4)",
      "svgLabel": "Udemy AI/ML (4 Skills)",
      "libraryHeading": "Udemy AI/ML Path & Repo Reference Guides"
    },
    {
      "key": "client_web",
      "slot": 4,
      "label": "Freelance & Web",
      "headerBadge": "Freelancing + Hitesh Web Dev",
      "kpiTitle": "Freelance & Web Dev",
      "kpiSub": "Freelancing Project Work + Hitesh Full-Stack",
      "skillGroupTitle": "Freelance Delivery & Web Dev Skills (4)",
      "svgLabel": "Freelance & Web (4 Skills)",
      "libraryHeading": "Freelance Delivery & Web Dev Resources"
    },
    {
      "key": "research_fit",
      "slot": 5,
      "label": "Research & Fit",
      "headerBadge": "Journals + Daily Workout",
      "kpiTitle": "Research & Fitness",
      "kpiSub": "Article #1 → #2, Reviews & 7:30 PM Workout",
      "skillGroupTitle": "AI-ML Research, Reviewing & Fitness Anchors (4)",
      "svgLabel": "Research & Fitness (4 Skills)",
      "libraryHeading": "Research Workflow, Reviewing & Fitness"
    }
  ],
  "phases": [
    {
      "id": 1,
      "minWeek": 1,
      "maxWeek": 12,
      "chipColor": "var(--primary)",
      "dailyLabel": "Phase 1: Q1 IPA, Xplore, Freelancing Project Launch & Article #1",
      "heading": "Phase 1: Q1 2027 IPA DSA, TCS Xplore 100%, Freelancing Project Launch & Article #1 (Weeks 1–12)",
      "subtitle": "30 Nov 2026 – 21 Feb 2027 • Ch.1–12 DSA + MySQL 1–16 + TCS Xplore + Freelancing Project Work + Udemy #1–#2 + Journal Article #1 Submission"
    },
    {
      "id": 2,
      "minWeek": 13,
      "maxWeek": 24,
      "chipColor": "var(--chart-3)",
      "dailyLabel": "Phase 2: RAG, Agents, HF LoRA, MLOps, Mocks & Article #2",
      "heading": "Phase 2: GenAI (RAG, LangGraph, HF LoRA), MLOps, Interview Mocks & Article #2 (Weeks 13–24)",
      "subtitle": "22 Feb – 16 May 2027 • DSA Mock Loops + Analytics/DuckDB SQL + Udemy #3–#6 + Freelance Case Study + Journal Article #2"
    }
  ],
  "ui": {
    "searchPlaceholder": "Search slot, Freelance, RAG, Xplore, D1.1, Article, Workout...",
    "monthlyTabLabel": "Monthly Targets & Milestones (6m)",
    "monthlyTargetsHeading": "Monthly Mastery Gates & Deliverables",
    "skillsKpiSub": "20 tracked competencies",
    "skillsMatrixTitle": "Skill-Wise Acquisition Matrix (20 Core Competencies)",
    "skillsChartAriaLabel": "Track Competency Summary",
    "skillsChartCombinedLabel": "Combined Roadmap (20 Skills)",
    "noteLabel": "Daily Log / Client Note:",
    "notePlaceholder": "Log DSA bug, Freelance client decision, or Journal #1/#2 note for Day {dayNum}...",
    "notesPanelTitle": "Daily Error Log, Client Notes & Research Notes",
    "notesPanelDesc": "All one-line bug diagnostics, client call takeaways & daily reflections aggregate here.",
    "notesEmptyText": "No daily notes yet. Record any DSA trap, client note, or research milestone at the bottom of a Day card.",
    "redoDesc": "Any task marked ~ Redo appears here for a 7-day blank-editor re-solve.",
    "redoEmptyText": "Redo queue is empty. Click ~ Redo on any tricky DSA/SQL/ML task to schedule a 7-day re-solve.",
    "libraryTitle": "15-Course Udemy Roadmap & Repository Study Library",
    "exportTitle": "Export Master Roadmap JSON",
    "exportDesc": "Copy or download this JSON backup to restore or transfer your unified roadmap progress.",
    "importTitle": "Import Master Roadmap JSON",
    "resetToast": "All progress reset cleanly.",
    "weekChipMinWidth": "76px",
    "dayBadge": {
      "maxWeek": 24,
      "dayInWeek": 7,
      "label": "Sunday Recovery & Lab",
      "pillClass": "pill-3"
    }
  },
  "resources": {
    "py_guide": {
      "title": "DSA in Python: Complete Guide",
      "path": "03_Programming/05_DSA_in_Python/01_DSA_in_Python_Complete_Guide.pdf",
      "track": "dsa"
    },
    "py_prac": {
      "title": "DSA in Python: Practice Book (36 Ex.)",
      "path": "03_Programming/05_DSA_in_Python/02_DSA_in_Python_Practice_Book.pdf",
      "track": "dsa"
    },
    "py_rev": {
      "title": "DSA in Python: Quick Revision (13p)",
      "path": "03_Programming/05_DSA_in_Python/03_DSA_in_Python_Quick_Revision.pdf",
      "track": "dsa"
    },
    "ud_dsa": {
      "title": "Complete Python With DSA + LeetCode (Krish Naik)",
      "badge": "Udemy Companion",
      "detail": "Video companion (currently 2%) — use only when a Repo PDF pattern needs walkthrough.",
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
    "sql_guide": {
      "title": "MySQL: Complete Guide (Parts 1–16)",
      "path": "03_Programming/02_MySQL/01_MySQL_Complete_Guide.pdf",
      "track": "sql_xplore"
    },
    "sql_ref": {
      "title": "MySQL Commands & Functions Reference",
      "path": "03_Programming/02_MySQL/02_MySQL_Commands_and_Functions_Reference.pdf",
      "track": "sql_xplore"
    },
    "sql_prac": {
      "title": "MySQL Practice Questions (Chapterwise)",
      "path": "03_Programming/02_MySQL/03_MySQL_Practice_Questions_Chapterwise.pdf",
      "track": "sql_xplore"
    },
    "sql_rev": {
      "title": "MySQL Quick Revision",
      "path": "03_Programming/02_MySQL/04_MySQL_Quick_Revision.pdf",
      "track": "sql_xplore"
    },
    "ud_sql": {
      "title": "Complete SQL & Databases Bootcamp (ZTM)",
      "badge": "Udemy Companion",
      "detail": "Selective video companion for Joins, Window Functions & Indexing alongside MySQL PDFs.",
      "track": "sql_xplore"
    },
    "tcs_portal": {
      "title": "TCS Xplore Assigned Courses",
      "badge": "TCS Portal (~3 Months)",
      "detail": "15:00–16:15 Shock-Absorber Flex Slot #1 — complete assigned modules within 12 weeks.",
      "track": "sql_xplore"
    },
    "de_guide": {
      "title": "Data Engineering: Lakes, Warehouses, Pipelines",
      "path": "05_System_Design/05_Data_Engineering/01_Data_Engineering_Complete_Guide.pdf",
      "track": "sql_xplore"
    },
    "de_prac": {
      "title": "Data Engineering: Practice Book (20 Ex.)",
      "path": "05_System_Design/05_Data_Engineering/02_Data_Engineering_Practice_Book.pdf",
      "track": "sql_xplore"
    },
    "dsi_guide": {
      "title": "Data Science Interviews: SQL to Product Sense",
      "path": "06_AI_and_Machine_Learning/07_Data_Science_Interview_Prep/01_Data_Science_Interview_Prep_Complete_Guide.pdf",
      "track": "sql_xplore"
    },
    "dsi_prac": {
      "title": "Data Science Interview Prep: Practice Book (24 Ex.)",
      "path": "06_AI_and_Machine_Learning/07_Data_Science_Interview_Prep/02_Data_Science_Interview_Prep_Practice_Book.pdf",
      "track": "sql_xplore"
    },
    "ud_math": {
      "title": "Mathematics – Basics to Advanced for DS & GenAI (Krish Naik)",
      "badge": "Udemy Step 1 · Wks 1–3",
      "detail": "Start from 13% -> ~65% core: Linear Algebra, Gradients, Probability & Stats. Skip school-level math.",
      "track": "aiml"
    },
    "ud_dsml": {
      "title": "Complete Data Science, ML, DL, NLP Bootcamp (Krish Naik)",
      "badge": "Udemy Step 2 · Wks 4–12",
      "detail": "Core ~70%: Feature Eng, Classical ML, Ensembles, ANN/CNN/RNN, Attention & NLP. Skip intro Python.",
      "track": "aiml"
    },
    "ud_rag": {
      "title": "Ultimate RAG Bootcamp (LangChain, LangGraph & LangSmith)",
      "badge": "Udemy Step 3 · Wks 13–16",
      "detail": "Core ~80% (from 1%): Chunking, Embeddings, Vector DBs, Hybrid/Agentic RAG & LangSmith Evals.",
      "track": "aiml"
    },
    "ud_agents": {
      "title": "Complete Agentic AI Bootcamp (LangGraph & LangChain)",
      "badge": "Udemy Step 4 · Wks 17–19",
      "detail": "Selective ~55%: Skip repeated LangChain basics; focus on Multi-Agent Flows, Tools, Memory, HITL & MCP.",
      "track": "aiml"
    },
    "ud_genai_hf": {
      "title": "Complete GenAI With LangChain & HuggingFace (Krish Naik)",
      "badge": "Udemy Step 5 · Wk 20",
      "detail": "Cherry-pick ~20% ONLY: HuggingFace Transformers, LoRA/QLoRA Fine-Tuning & PEFT. Skip all LangChain repeats.",
      "track": "aiml"
    },
    "ud_mlops": {
      "title": "Complete MLOps Bootcamp With 10+ End-to-End Projects",
      "badge": "Udemy Step 6 · Wks 21–24",
      "detail": "Selective ~60%: Git/CI-CD, Docker, MLflow, DVC, FastAPI, Cloud Deploy, Drift & 2–3 capstone projects.",
      "track": "aiml"
    },
    "math_guide": {
      "title": "Mathematics & Statistics for ML: Complete Guide",
      "path": "06_AI_and_Machine_Learning/01_Mathematics_for_ML/01_Mathematics_and_Statistics_for_ML_Complete_Guide.pdf",
      "track": "aiml"
    },
    "aiml_guide": {
      "title": "AI & ML: From Maths to Agents (Parts 0–15)",
      "path": "06_AI_and_Machine_Learning/02_AI_ML/01_AI_ML_Complete_Guide.pdf",
      "track": "aiml"
    },
    "dl_guide": {
      "title": "Deep Learning: Autograd to Frontiers",
      "path": "06_AI_and_Machine_Learning/04_Deep_Learning/01_Deep_Learning_Complete_Guide.pdf",
      "track": "aiml"
    },
    "rag_ws": {
      "title": "RAG & Agentic AI Workshop Guide (6 Labs)",
      "path": "06_AI_and_Machine_Learning/10_Corporate_Workshop_RAG_and_Agents/01_RAG_and_Agentic_AI_Workshop_Trainer_Guide.pdf",
      "track": "aiml"
    },
    "mlops_guide": {
      "title": "MLOps: Notebook to Production",
      "path": "06_AI_and_Machine_Learning/06_MLOps/01_MLOps_Complete_Guide.pdf",
      "track": "aiml"
    },
    "ud_web": {
      "title": "Complete Web Development Course (Hitesh Choudhary)",
      "badge": "Udemy Web · 2% → ~65%",
      "detail": "Just-in-time with Freelancing Project Work: Tailwind, Modern JS, React, Node/Express, Auth & DB. Skim HTML/CSS basics.",
      "track": "client_web"
    },
    "freelance_client": {
      "title": "Freelancing Project Work (Offline → Branded Online Store)",
      "badge": "Client Project",
      "detail": "Branded jewellery storefront competing with Palmonas & GIVA: Discovery -> Storefront -> Checkout -> Launch.",
      "track": "client_web"
    },
    "fe_guide": {
      "title": "Frontend Design & Development: Complete Guide",
      "path": "03_Programming/10_Frontend_Design_and_Development/01_Frontend_Design_and_Development_Complete_Guide.pdf",
      "track": "client_web"
    },
    "fe_prac": {
      "title": "Frontend Design & Development: Practice Book",
      "path": "03_Programming/10_Frontend_Design_and_Development/02_Frontend_Design_and_Development_Practice_Book.pdf",
      "track": "client_web"
    },
    "hr_guide": {
      "title": "Interview, HR & Resume Guide",
      "path": "08_Interview_and_HR/01_Interview_HR_and_Resume_Guide.pdf",
      "track": "client_web"
    },
    "res_j1": {
      "title": "Journal Article #1 (Active Manuscript)",
      "badge": "Research · Wks 1–12",
      "detail": "Complete experiments, ablations, figures, draft & final submission before unlocking Article #2.",
      "track": "research_fit"
    },
    "res_j2": {
      "title": "Journal Article #2 + Peer Review #2 Buffer",
      "badge": "Research · Wks 13–24",
      "detail": "Starts after Article #1 submission; Peer Review #2 slots into Tue/Thu Block 5 once authors respond.",
      "track": "research_fit"
    },
    "fit_daily": {
      "title": "Daily Conditioning (19:30–20:15 Anchor)",
      "badge": "Fitness · 45m/day",
      "detail": "Heavy jump rope intervals + push-ups, sit-ups & squats (Sunday: active recovery & mobility).",
      "track": "research_fit"
    }
  },
  "courseGuide": [
    {
      "order": "1",
      "title": "Mathematics – Basics to Advanced for DS & GenAI",
      "instructor": "Krish Naik",
      "progress": "13% done",
      "verdict": "Do First",
      "pillClass": "pill-ok",
      "targetPct": "~65% Core",
      "window": "Weeks 1–3",
      "doText": "Linear Algebra (vectors, matrices, eigenvalues/SVD), Calculus/Chain Rule/Gradients, Probability, Distributions & Hypothesis Testing.",
      "skipText": "Skip elementary arithmetic/school-level algebra refreshers."
    },
    {
      "order": "2",
      "title": "Complete Data Science, Machine Learning, DL, NLP Bootcamp",
      "instructor": "Krish Naik",
      "progress": "0% (Start)",
      "verdict": "Core Spine",
      "pillClass": "pill-1",
      "targetPct": "~70% Core",
      "window": "Weeks 4–12",
      "doText": "Feature Engineering, Classical ML (Linear/Logistic, Trees, RF, XGBoost), ANN/CNN/RNN/LSTM, Attention/Transformers & NLP.",
      "skipText": "Skip early Python syntax & basic pandas/EDA videos (covered faster in DSA & Maths)."
    },
    {
      "order": "3",
      "title": "Ultimate RAG Bootcamp Using LangChain, LangGraph & LangSmith",
      "instructor": "Krish Naik",
      "progress": "1% done",
      "verdict": "Core",
      "pillClass": "pill-1",
      "targetPct": "~80% Core",
      "window": "Weeks 13–16",
      "doText": "Document loaders, chunking, embeddings, Vector DBs, hybrid/reranked RAG, LangGraph corrective RAG & LangSmith evaluations.",
      "skipText": "Skip repetitive API-key/environment setup lectures once configured."
    },
    {
      "order": "4",
      "title": "Complete Agentic AI Bootcamp With LangGraph & LangChain",
      "instructor": "Krish Naik",
      "progress": "0% (Start)",
      "verdict": "Selective",
      "pillClass": "pill-2",
      "targetPct": "~55% Selective",
      "window": "Weeks 17–19",
      "doText": "Stateful LangGraph workflows, tool calling, memory/persistence, Human-in-the-Loop (HITL), multi-agent routing & MCP.",
      "skipText": "Skip all LangChain basics & simple RAG chapters already finished in Course #3."
    },
    {
      "order": "5",
      "title": "Complete GenAI With LangChain and HuggingFace",
      "instructor": "Krish Naik",
      "progress": "0% (Start)",
      "verdict": "Cherry-Pick",
      "pillClass": "pill-3",
      "targetPct": "~20% Only",
      "window": "Week 20",
      "doText": "ONLY HuggingFace Hub, Transformers pipelines, PEFT/LoRA/QLoRA fine-tuning & quantization.",
      "skipText": "Skip ~80% (all LangChain, prompt templates & basic RAG already mastered in #3 and #4)."
    },
    {
      "order": "6",
      "title": "Complete MLOps Bootcamp With 10+ End-to-End ML Projects",
      "instructor": "Krish Naik",
      "progress": "0% (Start)",
      "verdict": "Core",
      "pillClass": "pill-1",
      "targetPct": "~60% + 2–3 Proj",
      "window": "Weeks 21–24",
      "doText": "Git/GitHub Actions CI/CD, Docker, MLflow, DVC, FastAPI serving, cloud deployment, monitoring + 2–3 best projects.",
      "skipText": "Skip repeating all 10+ boilerplate project templates once the pipeline pattern clicks."
    },
    {
      "order": "∥",
      "title": "Complete Web Development Course",
      "instructor": "Hitesh Choudhary",
      "progress": "2% done",
      "verdict": "Parallel (Sync)",
      "pillClass": "pill-4",
      "targetPct": "~65% Just-in-Time",
      "window": "Weeks 1–14",
      "doText": "Tailwind CSS, Modern JS/Async, React (hooks, state, routing), Node.js/Express REST APIs, Auth & DB — applied directly to your Freelancing Project.",
      "skipText": "Skim basic HTML tags & beginner CSS box-model lectures."
    },
    {
      "order": "Ref",
      "title": "Complete Python With DSA Bootcamp + LEETCODE Exercises",
      "instructor": "Krish Naik & Mayank Aggarwal",
      "progress": "2% done",
      "verdict": "Companion",
      "pillClass": "pill-2",
      "targetPct": "As Needed",
      "window": "Weeks 1–24",
      "doText": "Keep Repo DSA PDFs primary for Q1 2027 IPA; watch video walkthroughs only for tricky Trees, Graphs & DP patterns.",
      "skipText": "Skip watching Python basics & easy array videos linearly."
    },
    {
      "order": "Ref",
      "title": "Complete SQL and Databases Bootcamp",
      "instructor": "Andrei Neagoie & Mo Binni (ZTM)",
      "progress": "0% (Start)",
      "verdict": "Companion",
      "pillClass": "pill-2",
      "targetPct": "As Needed",
      "window": "Weeks 1–12",
      "doText": "Use Repo MySQL PDFs as primary; watch ZTM selectively for Joins, Window Functions, Indexing & DB design.",
      "skipText": "Skip redundant SQL installation & basic SELECT drills."
    },
    {
      "order": "—",
      "title": "Building Gen AI App 12+ Hands-on Projects with Gemini Pro",
      "instructor": "Krish Naik",
      "progress": "0%",
      "verdict": "Skip / Park",
      "pillClass": "pill-muted",
      "targetPct": "0% (Superseded)",
      "window": "Parked",
      "doText": "Only skim a single Streamlit/Gemini API pattern if needed for a quick demo.",
      "skipText": "Skip — API wrapper demos are superseded by Ultimate RAG (#3) & Agentic AI (#4)."
    },
    {
      "order": "—",
      "title": "Building AI Agents & Agentic AI System via Microsoft AutoGen",
      "instructor": "Krish Naik & Mayank Aggarwal",
      "progress": "0%",
      "verdict": "Skip / Park",
      "pillClass": "pill-muted",
      "targetPct": "0% (Redundant)",
      "window": "Parked",
      "doText": "Revisit via official AutoGen docs only if a target job explicitly requires AutoGen.",
      "skipText": "Skip — LangGraph (#4) is the stronger, higher-demand agent framework."
    },
    {
      "order": "—",
      "title": "TensorFlow for Deep Learning Bootcamp",
      "instructor": "Andrei Neagoie & Daniel Bourke (ZTM)",
      "progress": "0%",
      "verdict": "Skip / Park",
      "pillClass": "pill-muted",
      "targetPct": "0% (PyTorch Focus)",
      "window": "Parked",
      "doText": "Keep only as reference if a legacy role asks for TensorFlow/Keras.",
      "skipText": "Skip — PyTorch + Transformers (#2 & #5) dominate 2026–27 AI-ML research and roles."
    },
    {
      "order": "—",
      "title": "Complete Computer Vision Bootcamp With PyTorch & Tensorflow",
      "instructor": "Krish Naik, Sourangshu Pal & Monal",
      "progress": "0%",
      "verdict": "Park (If No CV)",
      "pillClass": "pill-muted",
      "targetPct": "0% Unless CV",
      "window": "Parked",
      "doText": "Swap into Weeks 11–12 ONLY if your Journal Article #2 or target role is Computer Vision.",
      "skipText": "Skip during this 6-month sprint to protect DSA, GenAI/RAG & Freelancing Project delivery."
    },
    {
      "order": "—",
      "title": "Complete Data Analyst Bootcamp From Basics To Advanced",
      "instructor": "Krish Naik & Jayant Topnani",
      "progress": "1% done",
      "verdict": "Skip",
      "pillClass": "pill-muted",
      "targetPct": "0% (Off-Track)",
      "window": "Skipped",
      "doText": "Your SQL + pandas + DS skills are already covered at a deeper engineering level.",
      "skipText": "Skip Power BI/Excel/analyst-track modules that dilute AI-ML Engineering focus."
    },
    {
      "order": "—",
      "title": "Big Data Engineering Bootcamp with GCP, and Azure Cloud",
      "instructor": "Krish Naik & Mayank Aggarwal",
      "progress": "0%",
      "verdict": "Park (Post-6M)",
      "pillClass": "pill-muted",
      "targetPct": "0% (Post-Roadmap)",
      "window": "After May 2027",
      "doText": "Save as your next major track after Q1 IPA, TCS Xplore & Freelancing Project launch are behind you.",
      "skipText": "Skip now — Spark/Kafka/Cloud Data Engineering is too heavy to run concurrently."
    }
  ],
  "skills": [
    {
      "id": "dsa_core",
      "track": "dsa",
      "short": "Arrays, Hash & 2-Ptr",
      "name": "Python Complexity, Arrays, Hashing & Two Pointers",
      "desc": "Big-O counting, Python aliasing/default-arg traps, prefix sums, sliding windows & Kadane.",
      "resources": [
        "py_guide",
        "py_prac",
        "ud_dsa"
      ],
      "milestone": "Ch.1–2 + D1.1–D1.6"
    },
    {
      "id": "dsa_search_lin",
      "track": "dsa",
      "short": "B-Search & Mono Stack",
      "name": "Binary Search, Intervals, Lists & Monotonic Structures",
      "desc": "First-true lo < hi binary search, bisect, interval sweeps, dummy-node lists & monotonic stacks/deques.",
      "resources": [
        "py_guide",
        "py_prac",
        "ud_dsa"
      ],
      "milestone": "Ch.3–4 + D2.1–D2.6"
    },
    {
      "id": "dsa_trees_graphs",
      "track": "dsa",
      "short": "Trees, Heaps & Graphs",
      "name": "Backtracking, Trees/BSTs, Heaps & Graph Algorithms",
      "desc": "Backtracking pruning, LCA, BST ops, heapq top-k, BFS/DFS, Kahn topo sort, Dijkstra, DSU & MST.",
      "resources": [
        "py_guide",
        "py_prac",
        "ud_dsa"
      ],
      "milestone": "Ch.5–8 + D3.1–D4.6"
    },
    {
      "id": "dsa_dp_mocks",
      "track": "dsa",
      "short": "DP, Greedy & IPA Mocks",
      "name": "Dynamic Programming, Greedy, Tries & Timed IPA/OA Mocks",
      "desc": "1D/2D/knapsack/stock DP, greedy intervals, tries, Fenwick/KMP + timed Q1 2027 TCS IPA & coding loops.",
      "resources": [
        "py_guide",
        "py_prac",
        "py_rev",
        "mock_guide",
        "mock_work"
      ],
      "milestone": "Ch.9–12 + D5.1–D6.6 + IPA Ready"
    },
    {
      "id": "sql_core",
      "track": "sql_xplore",
      "short": "MySQL DDL/DML/Agg",
      "name": "Relational Modelling, DDL, DML & Aggregations",
      "desc": "ER cardinality, PK/FK/CHECK, NULL 3-valued logic, GROUP BY/HAVING/ROLLUP & normalisation.",
      "resources": [
        "sql_guide",
        "sql_prac",
        "sql_ref",
        "ud_sql"
      ],
      "milestone": "MySQL Parts 1–6 & 13"
    },
    {
      "id": "sql_adv",
      "track": "sql_xplore",
      "short": "Joins, CTEs & Windows",
      "name": "Joins, Recursive CTEs, Window Functions & EXPLAIN",
      "desc": "Anti-joins, EXISTS, recursive WITH, ROW_NUMBER/LAG/LEAD frames, B-Tree indexes & EXPLAIN tuning.",
      "resources": [
        "sql_guide",
        "sql_prac",
        "ud_sql"
      ],
      "milestone": "MySQL Parts 7–10"
    },
    {
      "id": "tcs_xplore",
      "track": "sql_xplore",
      "short": "TCS Xplore Modules",
      "name": "TCS Xplore Assigned Curriculum & Assessments",
      "desc": "Steady 3-month completion of assigned TCS Xplore modules, quizzes & proctored practice checks.",
      "resources": [
        "tcs_portal",
        "sql_rev"
      ],
      "milestone": "100% Xplore Cleared (Wk 12)"
    },
    {
      "id": "sql_analytics",
      "track": "sql_xplore",
      "short": "Analytics SQL & ACID",
      "name": "ACID Locking, DuckDB Parquet & Analytics SQL Cases",
      "desc": "MVCC isolation levels, deadlocks, funnel/cohort/retention SQL, DuckDB & data engineering pipelines.",
      "resources": [
        "sql_guide",
        "de_guide",
        "de_prac",
        "dsi_guide",
        "dsi_prac"
      ],
      "milestone": "Parts 11–16 + DE + DSI SQL"
    },
    {
      "id": "ml_math",
      "track": "aiml",
      "short": "ML Maths (Udemy #1)",
      "name": "Mathematics & Statistics for DS & GenAI (Krish Naik)",
      "desc": "Linear Algebra (SVD/PCA), Calculus/Backprop Gradients, Probability, Bayes, MLE & Hypothesis Tests.",
      "resources": [
        "ud_math",
        "math_guide"
      ],
      "milestone": "Course #1 (~65% Core, Wks 1–3)"
    },
    {
      "id": "ml_core_dl",
      "track": "aiml",
      "short": "ML/DL/NLP (Udemy #2)",
      "name": "Classical ML, Ensembles, Deep Learning & NLP Bootcamp",
      "desc": "Feature engineering, leakage-free CV, XGBoost, PyTorch/ANN/CNN/RNN, Attention, Transformers & NLP.",
      "resources": [
        "ud_dsml",
        "aiml_guide",
        "dl_guide"
      ],
      "milestone": "Course #2 (~70% Core, Wks 4–12)"
    },
    {
      "id": "ml_rag_agents",
      "track": "aiml",
      "short": "RAG, Agents & HF LoRA",
      "name": "RAG, LangGraph Agents & HuggingFace LoRA Fine-Tuning",
      "desc": "Hybrid RAG + LangSmith evals (#3), Stateful Multi-Agent + HITL/MCP (#4) & HF LoRA/QLoRA (#5).",
      "resources": [
        "ud_rag",
        "ud_agents",
        "ud_genai_hf",
        "rag_ws"
      ],
      "milestone": "Courses #3–#5 (Wks 13–20)"
    },
    {
      "id": "ml_ops",
      "track": "aiml",
      "short": "MLOps (Udemy #6)",
      "name": "Production MLOps, CI/CD, Docker, MLflow & Deployment",
      "desc": "Git/CI-CD, Docker, DVC, MLflow tracking, FastAPI serving, cloud deploy, drift + 2–3 E2E projects.",
      "resources": [
        "ud_mlops",
        "mlops_guide"
      ],
      "milestone": "Course #6 (~60% + Projects, Wks 21–24)"
    },
    {
      "id": "client_discovery",
      "track": "client_web",
      "short": "Freelance Discovery",
      "name": "Freelance Discovery, Competitor Audit & Scope Architecture",
      "desc": "Offline-to-online jewellery strategy vs Palmonas/GIVA: SKU taxonomy, pricing rules, UX & SOW sign-off.",
      "resources": [
        "freelance_client"
      ],
      "milestone": "Discovery Locked (Wk 3)"
    },
    {
      "id": "web_frontend",
      "track": "client_web",
      "short": "Tailwind, JS & React",
      "name": "Modern Frontend: Tailwind, JS Async & React (Hitesh)",
      "desc": "Tailwind utility systems, DOM/Fetch/async JS, React components, hooks, state & responsive storefront UI.",
      "resources": [
        "ud_web",
        "fe_guide",
        "fe_prac"
      ],
      "milestone": "Frontend Synced (Wks 1–7)"
    },
    {
      "id": "web_backend",
      "track": "client_web",
      "short": "Node, Auth & DB",
      "name": "Backend APIs, Auth, Cart/Orders & Database (Hitesh)",
      "desc": "Node.js/Express REST APIs, JWT/session auth, product/order schema, payment webhooks & admin CRUD.",
      "resources": [
        "ud_web",
        "freelance_client"
      ],
      "milestone": "Backend Synced (Wks 8–11)"
    },
    {
      "id": "client_delivery",
      "track": "client_web",
      "short": "Freelancing Project Work & Launch",
      "name": "Freelancing Project Work Build, QA, Deployment & Portfolio Case",
      "desc": "Catalog, filters, cart/gift UX, checkout, Lighthouse perf, client handover & placement portfolio write-up.",
      "resources": [
        "freelance_client",
        "hr_guide"
      ],
      "milestone": "Store Live (Wk 14) + Case Study"
    },
    {
      "id": "res_article1",
      "track": "research_fit",
      "short": "Journal Article #1",
      "name": "AI-ML Journal Article #1 (Experiments → Submission)",
      "desc": "Gap lock, baseline/ablation runs, error analysis, LaTeX figures/tables, full draft & journal submission.",
      "resources": [
        "res_j1"
      ],
      "milestone": "Article #1 Submitted (Wk 12)"
    },
    {
      "id": "res_article2",
      "track": "research_fit",
      "short": "Journal Article #2",
      "name": "AI-ML Journal Article #2 (Unlocked Post-#1)",
      "desc": "Literature matrix, hypothesis/architecture design, experiments & draft once Article #1 is submitted.",
      "resources": [
        "res_j2"
      ],
      "milestone": "Article #2 Drafted (Wks 13–24)"
    },
    {
      "id": "res_reviews",
      "track": "research_fit",
      "short": "Peer Review #2 Buffer",
      "name": "Peer Reviewing Role #2 & Editorial Revisions",
      "desc": "Queued until authors satisfy editorial requirements; batches cleanly into Tue/Thu Block 5 when active.",
      "resources": [
        "res_j2"
      ],
      "milestone": "Review #2 Ready When Triggered"
    },
    {
      "id": "fit_daily",
      "track": "research_fit",
      "short": "19:30 Daily Workout",
      "name": "Daily Conditioning: Jump Rope, Push-Ups, Sit-Ups & Squats",
      "desc": "Non-negotiable 19:30–20:15 circuit-breaker between afternoon client work and evening focus.",
      "resources": [
        "fit_daily"
      ],
      "milestone": "Daily 45m Anchor (Sun Recovery)"
    }
  ],
  "months": [
    {
      "id": 1,
      "title": "Month 1: IPA Foundations, Discovery & ML Maths",
      "period": "30 Nov – 27 Dec 2026",
      "phase": "Phase 1 • Q1 IPA, Xplore, Freelancing Project Work & Core ML/DL",
      "weeks": [
        1,
        2,
        3,
        4
      ],
      "summary": "Lock morning Python DSA (Ch.1–5, D1.1–D3.3), MySQL Parts 1–7, steady TCS Xplore progress, Freelance Discovery sign-off + Hitesh Tailwind/JS, finish Udemy #1 (ML Maths core ~65%), and drive Journal Article #1 experiments.",
      "skills": [
        "dsa_core",
        "dsa_search_lin",
        "dsa_trees_graphs",
        "sql_core",
        "sql_adv",
        "tcs_xplore",
        "ml_math",
        "client_discovery",
        "web_frontend",
        "res_article1",
        "fit_daily"
      ],
      "targets": [
        {
          "id": "m1_t1",
          "track": "dsa",
          "text": "Complete DSA in Python Ch.1–5 & solve D1.1–D3.3 (15 exercises) in morning 07:30 blocks.",
          "tag": "Ch.1–5 • 15 Ex."
        },
        {
          "id": "m1_t2",
          "track": "sql_xplore",
          "text": "Finish MySQL Parts 1–7 (Modelling through Joins) & reach 33% on TCS Xplore.",
          "tag": "MySQL 1–7 + Xplore 33%"
        },
        {
          "id": "m1_t3",
          "track": "aiml",
          "text": "Complete Udemy #1 (Krish Naik Math for DS & GenAI ~65% core) & start Udemy #2 Classical ML.",
          "tag": "Udemy #1 Done"
        },
        {
          "id": "m1_t4",
          "track": "client_web",
          "text": "Lock Freelance Discovery SOW & pricing tiers; complete Hitesh Tailwind + Modern JS/Async.",
          "tag": "Discovery Signed"
        },
        {
          "id": "m1_t5",
          "track": "research_fit",
          "text": "Finish Journal Article #1 baselines + primary ablations and maintain 6d/wk 19:30 workouts.",
          "tag": "Article #1 Experiments"
        }
      ]
    },
    {
      "id": 2,
      "title": "Month 2: Trees/Graphs, Windows, Freelancing Project Frontend & ML/DL",
      "period": "28 Dec 2026 – 24 Jan 2027",
      "phase": "Phase 1 • Q1 IPA, Xplore, Freelancing Project Work & Core ML/DL",
      "weeks": [
        5,
        6,
        7,
        8
      ],
      "summary": "Master Trees/Heaps/Graphs (Ch.6–8, D3.4–D4.6), CTEs/Windows/EXPLAIN/ACID, reach 67% TCS Xplore, ship Freelancing Project React storefront & start Node/Express backend, progress through Ensembles + ANN/CNN in Udemy #2, and draft Article #1.",
      "skills": [
        "dsa_trees_graphs",
        "dsa_dp_mocks",
        "sql_adv",
        "sql_analytics",
        "tcs_xplore",
        "ml_core_dl",
        "web_frontend",
        "web_backend",
        "res_article1",
        "fit_daily"
      ],
      "targets": [
        {
          "id": "m2_t1",
          "track": "dsa",
          "text": "Finish DSA Ch.6–8 (Trees, Heaps, Dijkstra, DSU, MST) & solve D3.4–D4.6.",
          "tag": "Ch.6–8 • D3.4–D4.6"
        },
        {
          "id": "m2_t2",
          "track": "sql_xplore",
          "text": "Complete MySQL Parts 8–12 (CTEs, Windows, EXPLAIN, ACID) & reach 67% on TCS Xplore.",
          "tag": "MySQL 8–12 + Xplore 67%"
        },
        {
          "id": "m2_t3",
          "track": "aiml",
          "text": "Complete Udemy #2 Classical ML, XGBoost, ANN & CNN modules.",
          "tag": "Udemy #2 ML+CNN"
        },
        {
          "id": "m2_t4",
          "track": "client_web",
          "text": "Ship Freelancing Project React Storefront (Catalog, PDP, Cart/Bundles) & start Hitesh Node/Express APIs.",
          "tag": "Storefront Core"
        },
        {
          "id": "m2_t5",
          "track": "research_fit",
          "text": "Generate Journal Article #1 publication figures & draft Intro, Method and Results.",
          "tag": "Article #1 Draft"
        }
      ]
    },
    {
      "id": 3,
      "title": "Month 3: Q1 IPA Peak, Xplore 100%, Freelancing Project Launch & Article #1 Submit",
      "period": "25 Jan – 21 Feb 2027",
      "phase": "Phase 1 • Q1 IPA, Xplore, Freelancing Project Work & Core ML/DL",
      "weeks": [
        9,
        10,
        11,
        12
      ],
      "summary": "Finish all 12 DSA chapters + D6.6 for the Q1 2027 TCS IPA exam, complete MySQL Parts 13–16 & clear 100% of TCS Xplore, wrap Udemy #2 (RNN/Transformers/NLP), deploy Freelancing Project live to production, and submit Journal Article #1.",
      "skills": [
        "dsa_dp_mocks",
        "sql_core",
        "sql_analytics",
        "tcs_xplore",
        "ml_core_dl",
        "web_backend",
        "client_delivery",
        "res_article1",
        "fit_daily"
      ],
      "targets": [
        {
          "id": "m3_t1",
          "track": "dsa",
          "text": "Finish DSA Ch.9–12 (D5.1–D6.6), 13p Quick Revision & timed Q1 2027 IPA coding mocks.",
          "tag": "IPA Exam Ready"
        },
        {
          "id": "m3_t2",
          "track": "sql_xplore",
          "text": "Complete MySQL Parts 13–16 & hit 100% completion on all assigned TCS Xplore courses.",
          "tag": "Xplore 100% Done"
        },
        {
          "id": "m3_t3",
          "track": "aiml",
          "text": "Finish Udemy #2 core (~70%: RNN/LSTM, Attention, Transformers & NLP).",
          "tag": "Udemy #2 Done"
        },
        {
          "id": "m3_t4",
          "track": "client_web",
          "text": "Complete Freelance Auth, Checkout, Admin & QA; launch live on Vercel/custom domain.",
          "tag": "Client Store Live!"
        },
        {
          "id": "m3_t5",
          "track": "research_fit",
          "text": "Final proofread & SUBMIT Journal Article #1 (unlocking Article #2 in Week 13).",
          "tag": "Article #1 Submitted"
        }
      ]
    },
    {
      "id": 4,
      "title": "Month 4: Ultimate RAG Bootcamp, Analytics SQL & Article #2 Kickoff",
      "period": "22 Feb – 21 Mar 2027",
      "phase": "Phase 2 • GenAI (RAG, Agents, HF LoRA), MLOps, Mocks & Article #2",
      "weeks": [
        13,
        14,
        15,
        16
      ],
      "summary": "Pivot evening study into Udemy #3 (Ultimate RAG with LangChain, LangGraph & LangSmith), switch afternoon slot to Analytics SQL / DuckDB / Data Engineering, run timed DSA maintenance, publish the Freelance Case Study, and start Journal Article #2.",
      "skills": [
        "dsa_core",
        "dsa_search_lin",
        "dsa_trees_graphs",
        "dsa_dp_mocks",
        "sql_analytics",
        "ml_rag_agents",
        "client_delivery",
        "res_article2",
        "fit_daily"
      ],
      "targets": [
        {
          "id": "m4_t1",
          "track": "dsa",
          "text": "Complete 4 weekly timed DSA maintenance loops & sweep Redo Queue.",
          "tag": "OA Sim #1"
        },
        {
          "id": "m4_t2",
          "track": "sql_xplore",
          "text": "Master Analytics SQL (DSI Ch.1), DuckDB/Parquet (DE Ch.1–4) & EXPLAIN Tuning Clinic.",
          "tag": "DuckDB + Tuning"
        },
        {
          "id": "m4_t3",
          "track": "aiml",
          "text": "Complete Udemy #3 (~80%: Chunking, Vector DBs, Hybrid RAG, Corrective LangGraph & LangSmith).",
          "tag": "Udemy #3 RAG Done"
        },
        {
          "id": "m4_t4",
          "track": "client_web",
          "text": "Publish Freelancing Project Case Study & handle post-launch client hypercare.",
          "tag": "Case Study Published"
        },
        {
          "id": "m4_t5",
          "track": "research_fit",
          "text": "Frame Journal Article #2, lock reproducible repo & complete initial baseline experiments.",
          "tag": "Article #2 Baselines"
        }
      ]
    },
    {
      "id": 5,
      "title": "Month 5: Agentic AI (#4), HF LoRA (#5), Mock Loops & Article #2 Draft",
      "period": "22 Mar – 18 Apr 2027",
      "phase": "Phase 2 • GenAI (RAG, Agents, HF LoRA), MLOps, Mocks & Article #2",
      "weeks": [
        17,
        18,
        19,
        20
      ],
      "summary": "Finish Udemy #4 (Agentic AI with LangGraph, skipping repeated LangChain basics), cherry-pick ONLY HuggingFace/LoRA/QLoRA (~20%) from Udemy #5, clear Mock Interview Loops A–C + OA Sim #2, and draft Journal Article #2.",
      "skills": [
        "dsa_core",
        "dsa_trees_graphs",
        "dsa_dp_mocks",
        "sql_analytics",
        "ml_rag_agents",
        "client_delivery",
        "res_article2",
        "res_reviews",
        "fit_daily"
      ],
      "targets": [
        {
          "id": "m5_t1",
          "track": "dsa",
          "text": "Complete Mock Interview Loops A–C (Workbook Rounds 1–12) & timed 2-Q OA Sim #2.",
          "tag": "Loops A–C + OA #2"
        },
        {
          "id": "m5_t2",
          "track": "sql_xplore",
          "text": "Finish DE Practice Book (20 Ex.), DSI SQL Cases & Schema/Index Design Mock.",
          "tag": "DE 20 Ex. + Schema"
        },
        {
          "id": "m5_t3",
          "track": "aiml",
          "text": "Complete Udemy #4 (~55% selective Agentic AI) + Udemy #5 (~20% HF LoRA/QLoRA only).",
          "tag": "Udemy #4 & #5 Done"
        },
        {
          "id": "m5_t4",
          "track": "client_web",
          "text": "Connect LangGraph/RAG project & Freelancing Project metrics into a unified GitHub portfolio.",
          "tag": "GitHub Portfolio"
        },
        {
          "id": "m5_t5",
          "track": "research_fit",
          "text": "Complete Journal Article #2 ablations, figures & full Methods/Results draft.",
          "tag": "Article #2 Draft"
        }
      ]
    },
    {
      "id": 6,
      "title": "Month 6: MLOps Bootcamp (#6), Capstone Interviews & Article #2 Ready",
      "period": "19 Apr – 16 May 2027",
      "phase": "Phase 2 • GenAI (RAG, Agents, HF LoRA), MLOps, Mocks & Article #2",
      "weeks": [
        21,
        22,
        23,
        24
      ],
      "summary": "Complete Udemy #6 (MLOps Bootcamp ~60% + 2–3 end-to-end projects: CI/CD, Docker, MLflow, DVC, FastAPI, Monitoring), sprint Top-20 DSA patterns + Workbook Rounds 13–20, and bring Journal Article #2 to submission-ready.",
      "skills": [
        "dsa_search_lin",
        "dsa_dp_mocks",
        "sql_analytics",
        "ml_ops",
        "client_delivery",
        "res_article2",
        "res_reviews",
        "fit_daily"
      ],
      "targets": [
        {
          "id": "m6_t1",
          "track": "dsa",
          "text": "Sprint Top-20 coding patterns, complete Rounds 13–20 & zero out Redo Queue.",
          "tag": "Interview Peak"
        },
        {
          "id": "m6_t2",
          "track": "sql_xplore",
          "text": "Ace Hard Analytics SQL Mock & final MySQL Quick Revision edge-case sweep.",
          "tag": "SQL Mastery"
        },
        {
          "id": "m6_t3",
          "track": "aiml",
          "text": "Complete Udemy #6 (~60%: CI/CD, Docker, MLflow, DVC, FastAPI, Drift) + 2–3 E2E projects.",
          "tag": "Udemy #6 MLOps Done"
        },
        {
          "id": "m6_t4",
          "track": "client_web",
          "text": "Finalize Resume, STAR stories (Freelancing Project + Research + AI Engineering) & HR mock.",
          "tag": "Portfolio + HR"
        },
        {
          "id": "m6_t5",
          "track": "research_fit",
          "text": "Polish & finalize Journal Article #2 for submission; sustain 19:30 conditioning.",
          "tag": "Article #2 Ready"
        }
      ]
    }
  ],
  "weeks": [
    {
      "id": 1,
      "month": 1,
      "title": "DSA Arrays/Big-O, MySQL Pt 1–2, Freelance Discovery & ML Math Pt 1",
      "focus": [
        "DSA Ch.1–2 (D1.1–D1.6)",
        "MySQL Pt 1–2 + Xplore Start",
        "Freelance Discovery + Math #1"
      ],
      "practiceTag": "D1.1–D1.6 • MySQL Pt 1–2 • Math #1 • Freelance Discovery",
      "targets": [
        {
          "id": "w1_t1",
          "track": "dsa",
          "text": "DSA Ch.1–2: Big-O, Python traps, prefix sums & sliding window (D1.1–D1.6)."
        },
        {
          "id": "w1_t2",
          "track": "sql_xplore",
          "text": "MySQL Parts 1–2 + kick off TCS Xplore first 5 weekday modules."
        },
        {
          "id": "w1_t3",
          "track": "aiml",
          "text": "Udemy #1 (Math for DS & GenAI): progress from 13% -> 35% (Vectors & Matrices)."
        },
        {
          "id": "w1_t4",
          "track": "client_web",
          "text": "Lock Freelance Discovery checklist + Hitesh Web Dev Tailwind setup."
        },
        {
          "id": "w1_t5",
          "track": "research_fit",
          "text": "Journal #1: freeze experiment matrix + log 6/6 workouts & Sun recovery."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_core"
            ],
            "Ch.1 Big-O & 10^7 Ops Budgeting",
            "Count loop operations, benchmark Python C built-ins & review constraint tables.",
            "py_guide",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "MySQL Pt 1–2: RDBMS, ER Cardinality & Keys",
            "Model 1:1/1:N/M:N schemas, PK/FK/UNIQUE & load practice DB.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Freeze Research Gap & Experiment Matrix",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Module Block 1 (Foundations & Onboarding)",
            "Complete assigned Xplore intro modules (~6h this week across Mon–Fri).",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_discovery"
            ],
            "Freelance Discovery + Hitesh Setup & Tailwind Basics",
            "Audit client's offline SKU/pricing model + Hitesh Tailwind setup (skim basic HTML). (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_math"
            ],
            "Udemy #1 (Math): Vectors, Matrices & Dot Products",
            "Start from 13%: focus on vector norms, projections & matrix ops (skip school basics). Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_math",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_core"
            ],
            "Ch.1 Python Traps & D1.1–D1.2",
            "Solve D1.1 (First repeated element) & D1.2 (aliasing, floor-div, default-arg traps).",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "MySQL Pt 1–2: RDBMS, ER Cardinality & Keys (Day 2)",
            "Model 1:1/1:N/M:N schemas, PK/FK/UNIQUE & load practice DB.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Freeze Research Gap & Experiment Matrix (Session 2)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Module Block 1 (Foundations & Onboarding)",
            "Complete assigned Xplore intro modules (~6h this week across Mon–Fri).",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_discovery"
            ],
            "Freelance Discovery + Hitesh Setup & Tailwind Basics",
            "Audit client's offline SKU/pricing model + Hitesh Tailwind setup (skim basic HTML). (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_discovery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Freelance Discovery + Hitesh Setup & Tailwind Basics — OR slot Peer Review #2 here once authors fulfill requirements.",
            "freelance_client",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_math"
            ],
            "Udemy #1 (Math): Vectors, Matrices & Dot Products",
            "Start from 13%: focus on vector norms, projections & matrix ops (skip school basics). Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_math",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_core"
            ],
            "Ch.2 Prefix Sums & Hashing",
            "Code subarray sum = k with prefix map & solve D1.3 (Product except self) from memory.",
            "py_guide",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "MySQL Pt 1–2: RDBMS, ER Cardinality & Keys (Day 3)",
            "Model 1:1/1:N/M:N schemas, PK/FK/UNIQUE & load practice DB.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Freeze Research Gap & Experiment Matrix (Session 3)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Module Block 1 (Foundations & Onboarding)",
            "Complete assigned Xplore intro modules (~6h this week across Mon–Fri).",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_discovery"
            ],
            "Freelance Discovery + Hitesh Setup & Tailwind Basics",
            "Audit client's offline SKU/pricing model + Hitesh Tailwind setup (skim basic HTML). (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_math"
            ],
            "Udemy #1 (Math): Vectors, Matrices & Dot Products",
            "Start from 13%: focus on vector norms, projections & matrix ops (skip school basics). Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_math",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_core"
            ],
            "Ch.2 Sliding Window & 2-Pointers",
            "Implement variable/fixed sliding windows & solve D1.4, D1.5.",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "MySQL Pt 1–2: RDBMS, ER Cardinality & Keys (Day 4)",
            "Model 1:1/1:N/M:N schemas, PK/FK/UNIQUE & load practice DB.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Freeze Research Gap & Experiment Matrix (Session 4)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Module Block 1 (Foundations & Onboarding)",
            "Complete assigned Xplore intro modules (~6h this week across Mon–Fri).",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_discovery"
            ],
            "Freelance Discovery + Hitesh Setup & Tailwind Basics",
            "Audit client's offline SKU/pricing model + Hitesh Tailwind setup (skim basic HTML). (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_discovery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Freelance Discovery + Hitesh Setup & Tailwind Basics — OR slot Peer Review #2 here once authors fulfill requirements.",
            "freelance_client",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_math"
            ],
            "Udemy #1 (Math): Vectors, Matrices & Dot Products",
            "Start from 13%: focus on vector norms, projections & matrix ops (skip school basics). Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_math",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_core"
            ],
            "D1.6 Trapping Rain Water + 3 Drills",
            "Solve D1.6 in O(n)/O(1) + 3 LeetCode window problems (use Krish Naik video if stuck).",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "MySQL Pt 1–2: RDBMS, ER Cardinality & Keys (Day 5)",
            "Model 1:1/1:N/M:N schemas, PK/FK/UNIQUE & load practice DB.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Freeze Research Gap & Experiment Matrix (Session 5)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Module Block 1 (Foundations & Onboarding)",
            "Complete assigned Xplore intro modules (~6h this week across Mon–Fri).",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_discovery"
            ],
            "Freelance Discovery + Hitesh Setup & Tailwind Basics",
            "Audit client's offline SKU/pricing model + Hitesh Tailwind setup (skim basic HTML). (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_math"
            ],
            "Udemy #1 (Math): Vectors, Matrices & Dot Products",
            "Start from 13%: focus on vector norms, projections & matrix ops (skip school basics). Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_math",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_core"
            ],
            "Sat Timed Check: Ch.1–2 Templates",
            "Re-write sliding window & prefix-hash from a blank file (25m/problem).",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "MySQL Pt 1–2: RDBMS, ER Cardinality & Keys (Day 6)",
            "Model 1:1/1:N/M:N schemas, PK/FK/UNIQUE & load practice DB.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Freeze Research Gap & Experiment Matrix (Session 6)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "client_web",
            [
              "client_discovery"
            ],
            "Freelance Discovery + Hitesh Setup & Tailwind Basics",
            "Audit client's offline SKU/pricing model + Hitesh Tailwind setup (skim basic HTML). (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "aiml",
            [
              "ml_math"
            ],
            "Udemy #1 (Math): Vectors, Matrices & Dot Products",
            "Start from 13%: focus on vector norms, projections & matrix ops (skip school basics). Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_math",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_core"
            ],
            "Sun Light Review: Wk 1 Error Log",
            "Review Week 1 edge-case mistakes & re-solve any flagged Redo problem.",
            "ud_dsa",
            1.5,
            "07:30–09:00",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "Weekly Reset + MySQL Pt 1–2 Review",
            "15-min next-week plan + 45-min light SQL Quick Revision recall.",
            "sql_rev",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "aiml",
            [
              "ml_math"
            ],
            "Sunday Lab: Udemy #1 (Math): Vectors, Matrices & Dot Products",
            "Hands-on coding/notebook consolidation for Udemy #1 (Math): Vectors, Matrices & Dot Products. Afternoon OFF after 14:00!",
            "ud_math",
            1.5,
            "12:30–14:00",
            "b2"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Sunday Active Recovery & Mobility",
            "Light stretching, mobility & easy jump-rope warm-down; full evening off for recovery.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ]
        ]
      ]
    },
    {
      "id": 2,
      "month": 1,
      "title": "Binary Search, Intervals, MySQL Pt 3–4, Freelance UX & Linear Algebra",
      "focus": [
        "DSA Ch.3 (D2.1–D2.3)",
        "MySQL Pt 3–4 + Xplore",
        "Freelance Flows + Math SVD/PCA"
      ],
      "practiceTag": "D2.1–D2.3 • MySQL Pt 3–4 • SVD/PCA • Hitesh Tailwind",
      "targets": [
        {
          "id": "w2_t1",
          "track": "dsa",
          "text": "Master lo < hi binary search, bisect & intervals (Ch.3 + D2.1–D2.3)."
        },
        {
          "id": "w2_t2",
          "track": "sql_xplore",
          "text": "MySQL Parts 3–4 (DDL/DML) + 5 TCS Xplore afternoon sessions."
        },
        {
          "id": "w2_t3",
          "track": "aiml",
          "text": "Udemy #1: Eigenvalues, SVD, PCA & Matrix Calculus (35% -> 50%)."
        },
        {
          "id": "w2_t4",
          "track": "client_web",
          "text": "Freelance competitor teardown (Palmonas/GIVA) + Hitesh Tailwind responsive layouts."
        },
        {
          "id": "w2_t5",
          "track": "research_fit",
          "text": "Journal #1: run core baseline experiments + daily 19:30 conditioning."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_search_lin"
            ],
            "Ch.3 First-True Binary Search",
            "Internalise lo < hi monotonic invariant & bisect_left/right; solve D2.1.",
            "py_guide",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "MySQL Pt 3–4: DDL Types, Upserts & Constraints",
            "DECIMAL vs FLOAT, DATETIME/TIMESTAMP, JSON cols & ON DUPLICATE KEY.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Run Core Baselines & Dataset Validation",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Core Programming & Linux/Git Modules",
            "Finish 5 clean 75-min Xplore sessions (~17% cumulative).",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_discovery"
            ],
            "Freelancing Project Competitor UX (Palmonas/GIVA) + Hitesh Tailwind",
            "Map category/gifting/bundle UX vs Palmonas & GIVA + responsive Tailwind grids. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_math"
            ],
            "Udemy #1 (Math): Eigenvalues, SVD & Matrix Calculus",
            "Reach ~45%: eigenvectors, SVD/PCA intuition, partial derivatives & chain rule. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_math",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_search_lin"
            ],
            "Ch.3 Answer-Space Binary Search",
            "Solve D2.2 (Capacity/Allocation on monotonic predicate) & 2 drills.",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "MySQL Pt 3–4: DDL Types, Upserts & Constraints (Day 2)",
            "DECIMAL vs FLOAT, DATETIME/TIMESTAMP, JSON cols & ON DUPLICATE KEY.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Run Core Baselines & Dataset Validation (Session 2)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Core Programming & Linux/Git Modules",
            "Finish 5 clean 75-min Xplore sessions (~17% cumulative).",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_discovery"
            ],
            "Freelancing Project Competitor UX (Palmonas/GIVA) + Hitesh Tailwind",
            "Map category/gifting/bundle UX vs Palmonas & GIVA + responsive Tailwind grids. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_discovery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Freelancing Project Competitor UX (Palmonas/GIVA) + Hitesh Tailwind — OR slot Peer Review #2 here once authors fulfill requirements.",
            "ud_web",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_math"
            ],
            "Udemy #1 (Math): Eigenvalues, SVD & Matrix Calculus",
            "Reach ~45%: eigenvectors, SVD/PCA intuition, partial derivatives & chain rule. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_math",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_search_lin"
            ],
            "Ch.3 Custom Sorting & Intervals",
            "Implement merge intervals, insert interval & meeting rooms; solve D2.3.",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "MySQL Pt 3–4: DDL Types, Upserts & Constraints (Day 3)",
            "DECIMAL vs FLOAT, DATETIME/TIMESTAMP, JSON cols & ON DUPLICATE KEY.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Run Core Baselines & Dataset Validation (Session 3)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Core Programming & Linux/Git Modules",
            "Finish 5 clean 75-min Xplore sessions (~17% cumulative).",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_discovery"
            ],
            "Freelancing Project Competitor UX (Palmonas/GIVA) + Hitesh Tailwind",
            "Map category/gifting/bundle UX vs Palmonas & GIVA + responsive Tailwind grids. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_math"
            ],
            "Udemy #1 (Math): Eigenvalues, SVD & Matrix Calculus",
            "Reach ~45%: eigenvectors, SVD/PCA intuition, partial derivatives & chain rule. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_math",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_search_lin"
            ],
            "Binary Search Matrix & Rotated Array",
            "Drill 3 rotated/2D binary search mediums with explicit invariant comments.",
            "ud_dsa",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "MySQL Pt 3–4: DDL Types, Upserts & Constraints (Day 4)",
            "DECIMAL vs FLOAT, DATETIME/TIMESTAMP, JSON cols & ON DUPLICATE KEY.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Run Core Baselines & Dataset Validation (Session 4)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Core Programming & Linux/Git Modules",
            "Finish 5 clean 75-min Xplore sessions (~17% cumulative).",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_discovery"
            ],
            "Freelancing Project Competitor UX (Palmonas/GIVA) + Hitesh Tailwind",
            "Map category/gifting/bundle UX vs Palmonas & GIVA + responsive Tailwind grids. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_discovery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Freelancing Project Competitor UX (Palmonas/GIVA) + Hitesh Tailwind — OR slot Peer Review #2 here once authors fulfill requirements.",
            "ud_web",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_math"
            ],
            "Udemy #1 (Math): Eigenvalues, SVD & Matrix Calculus",
            "Reach ~45%: eigenvectors, SVD/PCA intuition, partial derivatives & chain rule. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_math",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_search_lin"
            ],
            "D2.1–D2.3 Timed Re-Check",
            "Re-solve D2.1–D2.3 cleanly without off-by-one loops.",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "MySQL Pt 3–4: DDL Types, Upserts & Constraints (Day 5)",
            "DECIMAL vs FLOAT, DATETIME/TIMESTAMP, JSON cols & ON DUPLICATE KEY.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Run Core Baselines & Dataset Validation (Session 5)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Core Programming & Linux/Git Modules",
            "Finish 5 clean 75-min Xplore sessions (~17% cumulative).",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_discovery"
            ],
            "Freelancing Project Competitor UX (Palmonas/GIVA) + Hitesh Tailwind",
            "Map category/gifting/bundle UX vs Palmonas & GIVA + responsive Tailwind grids. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_math"
            ],
            "Udemy #1 (Math): Eigenvalues, SVD & Matrix Calculus",
            "Reach ~45%: eigenvectors, SVD/PCA intuition, partial derivatives & chain rule. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_math",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_search_lin"
            ],
            "Sat Timed Check: Search & Intervals",
            "Sit 2 timed 25-min Medium problems + log off-by-one traps.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "MySQL Pt 3–4: DDL Types, Upserts & Constraints (Day 6)",
            "DECIMAL vs FLOAT, DATETIME/TIMESTAMP, JSON cols & ON DUPLICATE KEY.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Run Core Baselines & Dataset Validation (Session 6)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "client_web",
            [
              "client_discovery"
            ],
            "Freelancing Project Competitor UX (Palmonas/GIVA) + Hitesh Tailwind",
            "Map category/gifting/bundle UX vs Palmonas & GIVA + responsive Tailwind grids. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "aiml",
            [
              "ml_math"
            ],
            "Udemy #1 (Math): Eigenvalues, SVD & Matrix Calculus",
            "Reach ~45%: eigenvectors, SVD/PCA intuition, partial derivatives & chain rule. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_math",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_search_lin"
            ],
            "Sun Light Review: Wk 2 Error Log",
            "Audit Week 2 Redo queue & Python bisect patterns.",
            "py_rev",
            1.5,
            "07:30–09:00",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "Weekly Reset + MySQL Pt 3–4 Review",
            "15-min next-week plan + 45-min light SQL Quick Revision recall.",
            "sql_rev",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "aiml",
            [
              "ml_math"
            ],
            "Sunday Lab: Udemy #1 (Math): Eigenvalues, SVD & Matrix Calculus",
            "Hands-on coding/notebook consolidation for Udemy #1 (Math): Eigenvalues, SVD & Matrix Calculus. Afternoon OFF after 14:00!",
            "ud_math",
            1.5,
            "12:30–14:00",
            "b2"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Sunday Active Recovery & Mobility",
            "Light stretching, mobility & easy jump-rope warm-down; full evening off for recovery.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ]
        ]
      ]
    },
    {
      "id": 3,
      "month": 1,
      "title": "Stacks/Mono Deque, MySQL Pt 5–6, Freelancing Project Scope Sign-off & Probability",
      "focus": [
        "DSA Ch.4 (D2.4–D2.6)",
        "MySQL Pt 5–6 + Xplore",
        "Freelance SOW + Math Stats Core"
      ],
      "practiceTag": "D2.4–D2.6 • MySQL Pt 5–6 • Math Core Complete (~65%)",
      "targets": [
        {
          "id": "w3_t1",
          "track": "dsa",
          "text": "Linked lists, brackets & monotonic stack/deque (Ch.4 + D2.4–D2.6)."
        },
        {
          "id": "w3_t2",
          "track": "sql_xplore",
          "text": "MySQL Parts 5–6 (3-valued NULL, GROUP BY/ROLLUP) + Xplore ~25%."
        },
        {
          "id": "w3_t3",
          "track": "aiml",
          "text": "Complete Udemy #1 Core (~65%): Probability, Bayes, MLE & Hypothesis Testing."
        },
        {
          "id": "w3_t4",
          "track": "client_web",
          "text": "Deliver Freelance Discovery SOW & pricing tiers + Hitesh JS DOM/Events."
        },
        {
          "id": "w3_t5",
          "track": "research_fit",
          "text": "Journal #1: finish baseline comparisons & start ablation table + workouts."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_search_lin"
            ],
            "Ch.4 Linked Lists & Dummy Nodes",
            "Code fast/slow cycle detection, reverse-k & merge lists using dummy heads.",
            "py_guide",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "MySQL Pt 5–6: 3-Valued NULL, GROUP BY & ROLLUP",
            "Master NULL truth tables, HAVING vs WHERE, GROUP_CONCAT & Pt 5–6 queries.",
            "sql_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Proposed Method Runs & Initial Ablations",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: OOP, Collections & Practice Quizzes",
            "Push Xplore completion to ~25%; pause cleanly if chores start at 16:00.",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_discovery"
            ],
            "Freelance Discovery SOW Sign-Off + Hitesh Modern JS",
            "Lock scope, deliverables & milestones + Hitesh JS DOM/Events/Closures. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_math"
            ],
            "Udemy #1 (Math): Probability, Bayes, MLE & Stats (~65% Done)",
            "Complete Udemy #1 Core (~65%): distributions, Bayes, MLE & hypothesis tests. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_math",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_search_lin"
            ],
            "Ch.4 Stacks & Bracket/Eval Patterns",
            "Solve D2.4 (Valid/Min-remove brackets & RPN evaluation).",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "MySQL Pt 5–6: 3-Valued NULL, GROUP BY & ROLLUP (Day 2)",
            "Master NULL truth tables, HAVING vs WHERE, GROUP_CONCAT & Pt 5–6 queries.",
            "sql_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Proposed Method Runs & Initial Ablations (Session 2)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: OOP, Collections & Practice Quizzes",
            "Push Xplore completion to ~25%; pause cleanly if chores start at 16:00.",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_discovery"
            ],
            "Freelance Discovery SOW Sign-Off + Hitesh Modern JS",
            "Lock scope, deliverables & milestones + Hitesh JS DOM/Events/Closures. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_discovery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Freelance Discovery SOW Sign-Off + Hitesh Modern JS — OR slot Peer Review #2 here once authors fulfill requirements.",
            "freelance_client",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_math"
            ],
            "Udemy #1 (Math): Probability, Bayes, MLE & Stats (~65% Done)",
            "Complete Udemy #1 Core (~65%): distributions, Bayes, MLE & hypothesis tests. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_math",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_search_lin"
            ],
            "Ch.4 Monotonic Stack",
            "Solve D2.5 (Next Greater Element / Daily Temperatures / Stock Span).",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "MySQL Pt 5–6: 3-Valued NULL, GROUP BY & ROLLUP (Day 3)",
            "Master NULL truth tables, HAVING vs WHERE, GROUP_CONCAT & Pt 5–6 queries.",
            "sql_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Proposed Method Runs & Initial Ablations (Session 3)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: OOP, Collections & Practice Quizzes",
            "Push Xplore completion to ~25%; pause cleanly if chores start at 16:00.",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_discovery"
            ],
            "Freelance Discovery SOW Sign-Off + Hitesh Modern JS",
            "Lock scope, deliverables & milestones + Hitesh JS DOM/Events/Closures. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_math"
            ],
            "Udemy #1 (Math): Probability, Bayes, MLE & Stats (~65% Done)",
            "Complete Udemy #1 Core (~65%): distributions, Bayes, MLE & hypothesis tests. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_math",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_search_lin"
            ],
            "Ch.4 Monotonic Deque",
            "Solve D2.6 (Sliding Window Maximum in O(n)) + 2 stack drills.",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "MySQL Pt 5–6: 3-Valued NULL, GROUP BY & ROLLUP (Day 4)",
            "Master NULL truth tables, HAVING vs WHERE, GROUP_CONCAT & Pt 5–6 queries.",
            "sql_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Proposed Method Runs & Initial Ablations (Session 4)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: OOP, Collections & Practice Quizzes",
            "Push Xplore completion to ~25%; pause cleanly if chores start at 16:00.",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_discovery"
            ],
            "Freelance Discovery SOW Sign-Off + Hitesh Modern JS",
            "Lock scope, deliverables & milestones + Hitesh JS DOM/Events/Closures. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_discovery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Freelance Discovery SOW Sign-Off + Hitesh Modern JS — OR slot Peer Review #2 here once authors fulfill requirements.",
            "freelance_client",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_math"
            ],
            "Udemy #1 (Math): Probability, Bayes, MLE & Stats (~65% Done)",
            "Complete Udemy #1 Core (~65%): distributions, Bayes, MLE & hypothesis tests. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_math",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_search_lin"
            ],
            "Ch.4 Mixed Linear Structures",
            "Solve 3 linked-list + monotonic-stack problems under 20m each.",
            "ud_dsa",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "MySQL Pt 5–6: 3-Valued NULL, GROUP BY & ROLLUP (Day 5)",
            "Master NULL truth tables, HAVING vs WHERE, GROUP_CONCAT & Pt 5–6 queries.",
            "sql_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Proposed Method Runs & Initial Ablations (Session 5)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: OOP, Collections & Practice Quizzes",
            "Push Xplore completion to ~25%; pause cleanly if chores start at 16:00.",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_discovery"
            ],
            "Freelance Discovery SOW Sign-Off + Hitesh Modern JS",
            "Lock scope, deliverables & milestones + Hitesh JS DOM/Events/Closures. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_math"
            ],
            "Udemy #1 (Math): Probability, Bayes, MLE & Stats (~65% Done)",
            "Complete Udemy #1 Core (~65%): distributions, Bayes, MLE & hypothesis tests. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_math",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_search_lin"
            ],
            "Sat Timed Check: Linear & Mono",
            "Blank-editor monotonic stack/deque speed drill + 2 timed mediums.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "MySQL Pt 5–6: 3-Valued NULL, GROUP BY & ROLLUP (Day 6)",
            "Master NULL truth tables, HAVING vs WHERE, GROUP_CONCAT & Pt 5–6 queries.",
            "sql_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Proposed Method Runs & Initial Ablations (Session 6)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "client_web",
            [
              "client_discovery"
            ],
            "Freelance Discovery SOW Sign-Off + Hitesh Modern JS",
            "Lock scope, deliverables & milestones + Hitesh JS DOM/Events/Closures. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "aiml",
            [
              "ml_math"
            ],
            "Udemy #1 (Math): Probability, Bayes, MLE & Stats (~65% Done)",
            "Complete Udemy #1 Core (~65%): distributions, Bayes, MLE & hypothesis tests. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_math",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_search_lin"
            ],
            "Sun Light Review: Wk 3 Error Log",
            "Consolidate Ch.1–4 templates in error log.",
            "py_rev",
            1.5,
            "07:30–09:00",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "Weekly Reset + MySQL Pt 5–6 Review",
            "15-min next-week plan + 45-min light SQL Quick Revision recall.",
            "sql_rev",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "aiml",
            [
              "ml_math"
            ],
            "Sunday Lab: Udemy #1 (Math): Probability, Bayes, MLE & Stats (~65% Done)",
            "Hands-on coding/notebook consolidation for Udemy #1 (Math): Probability, Bayes, MLE & Stats (~65% Done). Afternoon OFF after 14:00!",
            "ud_math",
            1.5,
            "12:30–14:00",
            "b2"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Sunday Active Recovery & Mobility",
            "Light stretching, mobility & easy jump-rope warm-down; full evening off for recovery.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ]
        ]
      ]
    },
    {
      "id": 4,
      "month": 1,
      "title": "Recursion/Backtracking, MySQL Pt 7, Hitesh JS Async & DS/ML Bootcamp Start",
      "focus": [
        "DSA Ch.5 (D3.1–D3.3)",
        "MySQL Pt 7 Joins + Xplore",
        "Udemy #2 Start + Freelance Design"
      ],
      "practiceTag": "D3.1–D3.3 • MySQL Pt 7 Joins • Udemy #2 Core Start",
      "targets": [
        {
          "id": "w4_t1",
          "track": "dsa",
          "text": "Recursion & backtracking pruning template (Ch.5 + D3.1–D3.3)."
        },
        {
          "id": "w4_t2",
          "track": "sql_xplore",
          "text": "MySQL Part 7 (Joins & Anti-joins + ZTM companion) + Xplore ~33%."
        },
        {
          "id": "w4_t3",
          "track": "aiml",
          "text": "Start Udemy #2 (DS/ML/DL/NLP): skip Python intro, hit Feature Eng & Linear/Logistic ML."
        },
        {
          "id": "w4_t4",
          "track": "client_web",
          "text": "Freelance visual system & product data schema + Hitesh Modern JS/Async/Promises."
        },
        {
          "id": "w4_t5",
          "track": "research_fit",
          "text": "Journal #1: complete primary ablation runs + verify statistical significance."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Ch.5 Recursion & Call Stack Bounds",
            "Trace recursion trees, sys.setrecursionlimit & solve D3.1.",
            "py_guide",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_adv"
            ],
            "MySQL Pt 7: Joins, Self-Joins & Anti-Joins",
            "INNER/LEFT/ANTI joins + ZTM SQL Join walkthroughs & Pt 7 drills.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Complete Ablations & Statistical Significance",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Database & SQL Track Modules",
            "Sync Xplore DB modules with morning MySQL (~33% cumulative).",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_frontend"
            ],
            "Freelance Info Arch + Hitesh Async JS & Fetch APIs",
            "Wireframe store routes & product schema + Hitesh Promises/Async-Await/Fetch. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DS/ML): Feature Eng & Linear/Logistic ML",
            "Skip Python/EDA intro; start Feature Eng, Regularised Linear/Logistic & metrics. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Ch.5 Subsets, Permutations & Combos",
            "Implement choose-explore-unchoose template cleanly; solve D3.2.",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_adv"
            ],
            "MySQL Pt 7: Joins, Self-Joins & Anti-Joins (Day 2)",
            "INNER/LEFT/ANTI joins + ZTM SQL Join walkthroughs & Pt 7 drills.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Complete Ablations & Statistical Significance (Session 2)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Database & SQL Track Modules",
            "Sync Xplore DB modules with morning MySQL (~33% cumulative).",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_frontend"
            ],
            "Freelance Info Arch + Hitesh Async JS & Fetch APIs",
            "Wireframe store routes & product schema + Hitesh Promises/Async-Await/Fetch. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "web_frontend",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Freelance Info Arch + Hitesh Async JS & Fetch APIs — OR slot Peer Review #2 here once authors fulfill requirements.",
            "ud_web",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DS/ML): Feature Eng & Linear/Logistic ML",
            "Skip Python/EDA intro; start Feature Eng, Regularised Linear/Logistic & metrics. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Ch.5 Pruning & Backtracking Grids",
            "Solve D3.3 (N-Queens / Word Search) with visited-set rollback.",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_adv"
            ],
            "MySQL Pt 7: Joins, Self-Joins & Anti-Joins (Day 3)",
            "INNER/LEFT/ANTI joins + ZTM SQL Join walkthroughs & Pt 7 drills.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Complete Ablations & Statistical Significance (Session 3)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Database & SQL Track Modules",
            "Sync Xplore DB modules with morning MySQL (~33% cumulative).",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_frontend"
            ],
            "Freelance Info Arch + Hitesh Async JS & Fetch APIs",
            "Wireframe store routes & product schema + Hitesh Promises/Async-Await/Fetch. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DS/ML): Feature Eng & Linear/Logistic ML",
            "Skip Python/EDA intro; start Feature Eng, Regularised Linear/Logistic & metrics. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Backtracking Pattern Drills",
            "Solve 3 backtracking mediums (Combination Sum, Palindrome Partition).",
            "ud_dsa",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_adv"
            ],
            "MySQL Pt 7: Joins, Self-Joins & Anti-Joins (Day 4)",
            "INNER/LEFT/ANTI joins + ZTM SQL Join walkthroughs & Pt 7 drills.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Complete Ablations & Statistical Significance (Session 4)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Database & SQL Track Modules",
            "Sync Xplore DB modules with morning MySQL (~33% cumulative).",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_frontend"
            ],
            "Freelance Info Arch + Hitesh Async JS & Fetch APIs",
            "Wireframe store routes & product schema + Hitesh Promises/Async-Await/Fetch. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "web_frontend",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Freelance Info Arch + Hitesh Async JS & Fetch APIs — OR slot Peer Review #2 here once authors fulfill requirements.",
            "ud_web",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DS/ML): Feature Eng & Linear/Logistic ML",
            "Skip Python/EDA intro; start Feature Eng, Regularised Linear/Logistic & metrics. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "D3.1–D3.3 Timed IPA Simulation",
            "Timed 2-problem check covering arrays + backtracking (60m).",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_adv"
            ],
            "MySQL Pt 7: Joins, Self-Joins & Anti-Joins (Day 5)",
            "INNER/LEFT/ANTI joins + ZTM SQL Join walkthroughs & Pt 7 drills.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Complete Ablations & Statistical Significance (Session 5)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Database & SQL Track Modules",
            "Sync Xplore DB modules with morning MySQL (~33% cumulative).",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_frontend"
            ],
            "Freelance Info Arch + Hitesh Async JS & Fetch APIs",
            "Wireframe store routes & product schema + Hitesh Promises/Async-Await/Fetch. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DS/ML): Feature Eng & Linear/Logistic ML",
            "Skip Python/EDA intro; start Feature Eng, Regularised Linear/Logistic & metrics. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Sat Timed Check: Ch.1–5 Cumulative",
            "2 mixed timed Mediums from Month 1 topics + complexity recap.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_adv"
            ],
            "MySQL Pt 7: Joins, Self-Joins & Anti-Joins (Day 6)",
            "INNER/LEFT/ANTI joins + ZTM SQL Join walkthroughs & Pt 7 drills.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Complete Ablations & Statistical Significance (Session 6)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "client_web",
            [
              "web_frontend"
            ],
            "Freelance Info Arch + Hitesh Async JS & Fetch APIs",
            "Wireframe store routes & product schema + Hitesh Promises/Async-Await/Fetch. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DS/ML): Feature Eng & Linear/Logistic ML",
            "Skip Python/EDA intro; start Feature Eng, Regularised Linear/Logistic & metrics. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Sun Light Review: Month 1 Sweep",
            "Clear any lingering Month 1 Redo tasks before Trees week.",
            "py_rev",
            1.5,
            "07:30–09:00",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_adv"
            ],
            "Weekly Reset + MySQL Pt 7 Review",
            "15-min next-week plan + 45-min light SQL Quick Revision recall.",
            "sql_rev",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Sunday Lab: Udemy #2 (DS/ML): Feature Eng & Linear/Logistic ML",
            "Hands-on coding/notebook consolidation for Udemy #2 (DS/ML): Feature Eng & Linear/Logistic ML. Afternoon OFF after 14:00!",
            "ud_dsml",
            1.5,
            "12:30–14:00",
            "b2"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Sunday Active Recovery & Mobility",
            "Light stretching, mobility & easy jump-rope warm-down; full evening off for recovery.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ]
        ]
      ]
    },
    {
      "id": 5,
      "month": 2,
      "title": "Trees & BSTs, MySQL Pt 8 CTEs, Freelance Home/Catalog & Classical ML",
      "focus": [
        "DSA Ch.6 (D3.4–D3.6)",
        "MySQL Pt 8 CTEs + Xplore",
        "Freelance Home/PLP + Trees/RF"
      ],
      "practiceTag": "D3.4–D3.6 • MySQL Pt 8 CTEs • Hitesh React Core",
      "targets": [
        {
          "id": "w5_t1",
          "track": "dsa",
          "text": "Binary trees, post-order returns, LCA & BSTs (Ch.6 + D3.4–D3.6)."
        },
        {
          "id": "w5_t2",
          "track": "sql_xplore",
          "text": "MySQL Part 8 (Subqueries, EXISTS & Recursive CTEs) + Xplore ~42%."
        },
        {
          "id": "w5_t3",
          "track": "aiml",
          "text": "Udemy #2: Decision Trees, Random Forest, Bias-Variance & CV hygiene."
        },
        {
          "id": "w5_t4",
          "track": "client_web",
          "text": "Hitesh React core (components, hooks, state) applied to Freelance Catalog/Filters."
        },
        {
          "id": "w5_t5",
          "track": "research_fit",
          "text": "Journal #1: run robustness/sensitivity tests & draft Methodology outline."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Ch.6 Binary Tree Traversals",
            "Iterative & recursive DFS + BFS level-order using collections.deque.",
            "py_guide",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_adv"
            ],
            "MySQL Pt 8: Subqueries, EXISTS & Recursive CTEs",
            "Correlated subqueries vs EXISTS, non-recursive & recursive WITH CTEs.",
            "sql_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Robustness Sweeps & Methodology Outline",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Web Basics & UI Modules",
            "Knock out Xplore HTML/CSS/JS quizzes fast using Hitesh knowledge (~42%).",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_frontend"
            ],
            "Freelance Catalog/PLP UI + Hitesh React Core & Hooks",
            "Build responsive jewellery grid, category/price filters & finish swatches in React. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DS/ML): Decision Trees, Random Forest & CV",
            "Bias-variance, tree splits, Random Forest & zero-leakage cross-validation. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Ch.6 Post-Order State Return",
            "Solve D3.4 (Diameter / Max Path Sum / Balanced Tree checks).",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_adv"
            ],
            "MySQL Pt 8: Subqueries, EXISTS & Recursive CTEs (Day 2)",
            "Correlated subqueries vs EXISTS, non-recursive & recursive WITH CTEs.",
            "sql_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Robustness Sweeps & Methodology Outline (Session 2)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Web Basics & UI Modules",
            "Knock out Xplore HTML/CSS/JS quizzes fast using Hitesh knowledge (~42%).",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_frontend"
            ],
            "Freelance Catalog/PLP UI + Hitesh React Core & Hooks",
            "Build responsive jewellery grid, category/price filters & finish swatches in React. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "web_frontend",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Freelance Catalog/PLP UI + Hitesh React Core & Hooks — OR slot Peer Review #2 here once authors fulfill requirements.",
            "ud_web",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DS/ML): Decision Trees, Random Forest & CV",
            "Bias-variance, tree splits, Random Forest & zero-leakage cross-validation. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Ch.6 Lowest Common Ancestor",
            "Implement LCA in Binary Tree & BST; solve D3.5.",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_adv"
            ],
            "MySQL Pt 8: Subqueries, EXISTS & Recursive CTEs (Day 3)",
            "Correlated subqueries vs EXISTS, non-recursive & recursive WITH CTEs.",
            "sql_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Robustness Sweeps & Methodology Outline (Session 3)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Web Basics & UI Modules",
            "Knock out Xplore HTML/CSS/JS quizzes fast using Hitesh knowledge (~42%).",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_frontend"
            ],
            "Freelance Catalog/PLP UI + Hitesh React Core & Hooks",
            "Build responsive jewellery grid, category/price filters & finish swatches in React. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DS/ML): Decision Trees, Random Forest & CV",
            "Bias-variance, tree splits, Random Forest & zero-leakage cross-validation. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Ch.6 BST Ops & Serialisation",
            "Validate BST, Kth smallest & level-order serialise/deserialise (D3.6).",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_adv"
            ],
            "MySQL Pt 8: Subqueries, EXISTS & Recursive CTEs (Day 4)",
            "Correlated subqueries vs EXISTS, non-recursive & recursive WITH CTEs.",
            "sql_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Robustness Sweeps & Methodology Outline (Session 4)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Web Basics & UI Modules",
            "Knock out Xplore HTML/CSS/JS quizzes fast using Hitesh knowledge (~42%).",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_frontend"
            ],
            "Freelance Catalog/PLP UI + Hitesh React Core & Hooks",
            "Build responsive jewellery grid, category/price filters & finish swatches in React. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "web_frontend",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Freelance Catalog/PLP UI + Hitesh React Core & Hooks — OR slot Peer Review #2 here once authors fulfill requirements.",
            "ud_web",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DS/ML): Decision Trees, Random Forest & CV",
            "Bias-variance, tree splits, Random Forest & zero-leakage cross-validation. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Tree & BST Mixed Drills",
            "Solve 3 LeetCode tree mediums (Right View, Construct from Pre/Inorder).",
            "ud_dsa",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_adv"
            ],
            "MySQL Pt 8: Subqueries, EXISTS & Recursive CTEs (Day 5)",
            "Correlated subqueries vs EXISTS, non-recursive & recursive WITH CTEs.",
            "sql_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Robustness Sweeps & Methodology Outline (Session 5)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Web Basics & UI Modules",
            "Knock out Xplore HTML/CSS/JS quizzes fast using Hitesh knowledge (~42%).",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_frontend"
            ],
            "Freelance Catalog/PLP UI + Hitesh React Core & Hooks",
            "Build responsive jewellery grid, category/price filters & finish swatches in React. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DS/ML): Decision Trees, Random Forest & CV",
            "Bias-variance, tree splits, Random Forest & zero-leakage cross-validation. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Sat Timed Check: Trees & BSTs",
            "2 timed 25m Tree/BST problems + recursion edge-case log.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_adv"
            ],
            "MySQL Pt 8: Subqueries, EXISTS & Recursive CTEs (Day 6)",
            "Correlated subqueries vs EXISTS, non-recursive & recursive WITH CTEs.",
            "sql_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Robustness Sweeps & Methodology Outline (Session 6)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "client_web",
            [
              "web_frontend"
            ],
            "Freelance Catalog/PLP UI + Hitesh React Core & Hooks",
            "Build responsive jewellery grid, category/price filters & finish swatches in React. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DS/ML): Decision Trees, Random Forest & CV",
            "Bias-variance, tree splits, Random Forest & zero-leakage cross-validation. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Sun Light Review: Wk 5 Error Log",
            "Re-code LCA & tree serialisation from blank file.",
            "py_rev",
            1.5,
            "07:30–09:00",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_adv"
            ],
            "Weekly Reset + MySQL Pt 8 Review",
            "15-min next-week plan + 45-min light SQL Quick Revision recall.",
            "sql_rev",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Sunday Lab: Udemy #2 (DS/ML): Decision Trees, Random Forest & CV",
            "Hands-on coding/notebook consolidation for Udemy #2 (DS/ML): Decision Trees, Random Forest & CV. Afternoon OFF after 14:00!",
            "ud_dsml",
            1.5,
            "12:30–14:00",
            "b2"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Sunday Active Recovery & Mobility",
            "Light stretching, mobility & easy jump-rope warm-down; full evening off for recovery.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ]
        ]
      ]
    },
    {
      "id": 6,
      "month": 2,
      "title": "Heaps & Graphs Intro, MySQL Pt 9 Windows, Freelance PDP/Swatches & Boosting",
      "focus": [
        "DSA Ch.7–8a (D4.1–D4.3)",
        "MySQL Pt 9 Windows + Xplore",
        "Freelance PDP + XGBoost/Clustering"
      ],
      "practiceTag": "D4.1–D4.3 • MySQL Pt 9 Windows • Freelance PDP + Boosting",
      "targets": [
        {
          "id": "w6_t1",
          "track": "dsa",
          "text": "Heaps (top-k, running median) & Graph BFS/DFS/Cycle checks (Ch.7–8 + D4.1–D4.3)."
        },
        {
          "id": "w6_t2",
          "track": "sql_xplore",
          "text": "MySQL Part 9 (ROW_NUMBER, LAG/LEAD, Window Frames + ZTM) + Xplore ~50%."
        },
        {
          "id": "w6_t3",
          "track": "aiml",
          "text": "Udemy #2: AdaBoost, Gradient Boosting, XGBoost & Unsupervised Clustering."
        },
        {
          "id": "w6_t4",
          "track": "client_web",
          "text": "Freelance PDP (hallmark/gold-rate breakup, swatches) + Hitesh React Router/Context."
        },
        {
          "id": "w6_t5",
          "track": "research_fit",
          "text": "Journal #1: generate publication-grade matplotlib/vector figures & tables."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Ch.7 Heaps & Dict Internals",
            "Min/max heap negation tricks, heapq.heapify & solve D4.1 (Top-K).",
            "py_guide",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_adv"
            ],
            "MySQL Pt 9: Window Functions & Frame Clauses",
            "ROW_NUMBER/RANK/DENSE_RANK, LAG/LEAD & ROWS BETWEEN frames + ZTM.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Publication Figures, Error Plots & Tables",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Core Track Assessments (Midpoint)",
            "Cross 50% Xplore completion well ahead of the 3-month ceiling.",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_frontend"
            ],
            "Freelance Luxury PDP + Hitesh React Router & Context",
            "Hallmark/purity/gold-rate breakup widget, gallery zoom & wishlist context. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DS/ML): Boosting (XGBoost) & Clustering",
            "Gradient Boosting, XGBoost tuning, K-Means/DBSCAN & PCA reduction. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Ch.7 Two-Heap Running Median",
            "Implement MedianFinder with max-heap/min-heap & solve D4.2.",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_adv"
            ],
            "MySQL Pt 9: Window Functions & Frame Clauses (Day 2)",
            "ROW_NUMBER/RANK/DENSE_RANK, LAG/LEAD & ROWS BETWEEN frames + ZTM.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Publication Figures, Error Plots & Tables (Session 2)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Core Track Assessments (Midpoint)",
            "Cross 50% Xplore completion well ahead of the 3-month ceiling.",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_frontend"
            ],
            "Freelance Luxury PDP + Hitesh React Router & Context",
            "Hallmark/purity/gold-rate breakup widget, gallery zoom & wishlist context. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "web_frontend",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Freelance Luxury PDP + Hitesh React Router & Context — OR slot Peer Review #2 here once authors fulfill requirements.",
            "ud_web",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DS/ML): Boosting (XGBoost) & Clustering",
            "Gradient Boosting, XGBoost tuning, K-Means/DBSCAN & PCA reduction. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Ch.8 Graph Reps & BFS/DFS",
            "Adjacency list, grid flood-fill, shortest unweighted path & solve D4.3.",
            "py_guide",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_adv"
            ],
            "MySQL Pt 9: Window Functions & Frame Clauses (Day 3)",
            "ROW_NUMBER/RANK/DENSE_RANK, LAG/LEAD & ROWS BETWEEN frames + ZTM.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Publication Figures, Error Plots & Tables (Session 3)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Core Track Assessments (Midpoint)",
            "Cross 50% Xplore completion well ahead of the 3-month ceiling.",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_frontend"
            ],
            "Freelance Luxury PDP + Hitesh React Router & Context",
            "Hallmark/purity/gold-rate breakup widget, gallery zoom & wishlist context. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DS/ML): Boosting (XGBoost) & Clustering",
            "Gradient Boosting, XGBoost tuning, K-Means/DBSCAN & PCA reduction. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Ch.8 Cycle Detection & Bipartite",
            "Directed (3-color) vs undirected cycle checks + bipartite 2-coloring.",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_adv"
            ],
            "MySQL Pt 9: Window Functions & Frame Clauses (Day 4)",
            "ROW_NUMBER/RANK/DENSE_RANK, LAG/LEAD & ROWS BETWEEN frames + ZTM.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Publication Figures, Error Plots & Tables (Session 4)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Core Track Assessments (Midpoint)",
            "Cross 50% Xplore completion well ahead of the 3-month ceiling.",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_frontend"
            ],
            "Freelance Luxury PDP + Hitesh React Router & Context",
            "Hallmark/purity/gold-rate breakup widget, gallery zoom & wishlist context. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "web_frontend",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Freelance Luxury PDP + Hitesh React Router & Context — OR slot Peer Review #2 here once authors fulfill requirements.",
            "ud_web",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DS/ML): Boosting (XGBoost) & Clustering",
            "Gradient Boosting, XGBoost tuning, K-Means/DBSCAN & PCA reduction. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Heaps & Graph Traversal Drills",
            "Solve 3 graph BFS/DFS problems (Course Schedule / Rotting Oranges).",
            "ud_dsa",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_adv"
            ],
            "MySQL Pt 9: Window Functions & Frame Clauses (Day 5)",
            "ROW_NUMBER/RANK/DENSE_RANK, LAG/LEAD & ROWS BETWEEN frames + ZTM.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Publication Figures, Error Plots & Tables (Session 5)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Core Track Assessments (Midpoint)",
            "Cross 50% Xplore completion well ahead of the 3-month ceiling.",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_frontend"
            ],
            "Freelance Luxury PDP + Hitesh React Router & Context",
            "Hallmark/purity/gold-rate breakup widget, gallery zoom & wishlist context. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DS/ML): Boosting (XGBoost) & Clustering",
            "Gradient Boosting, XGBoost tuning, K-Means/DBSCAN & PCA reduction. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Sat Timed Check: Heaps & BFS/DFS",
            "2 timed 30m Heap/Graph problems + error log.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_adv"
            ],
            "MySQL Pt 9: Window Functions & Frame Clauses (Day 6)",
            "ROW_NUMBER/RANK/DENSE_RANK, LAG/LEAD & ROWS BETWEEN frames + ZTM.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Publication Figures, Error Plots & Tables (Session 6)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "client_web",
            [
              "web_frontend"
            ],
            "Freelance Luxury PDP + Hitesh React Router & Context",
            "Hallmark/purity/gold-rate breakup widget, gallery zoom & wishlist context. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DS/ML): Boosting (XGBoost) & Clustering",
            "Gradient Boosting, XGBoost tuning, K-Means/DBSCAN & PCA reduction. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Sun Light Review: Wk 6 Error Log",
            "Review Week 6 mistakes & D4.1–D4.3 invariants.",
            "py_rev",
            1.5,
            "07:30–09:00",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_adv"
            ],
            "Weekly Reset + MySQL Pt 9 Review",
            "15-min next-week plan + 45-min light SQL Quick Revision recall.",
            "sql_rev",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Sunday Lab: Udemy #2 (DS/ML): Boosting (XGBoost) & Clustering",
            "Hands-on coding/notebook consolidation for Udemy #2 (DS/ML): Boosting (XGBoost) & Clustering. Afternoon OFF after 14:00!",
            "ud_dsml",
            1.5,
            "12:30–14:00",
            "b2"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Sunday Active Recovery & Mobility",
            "Light stretching, mobility & easy jump-rope warm-down; full evening off for recovery.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ]
        ]
      ]
    },
    {
      "id": 7,
      "month": 2,
      "title": "Shortest Paths/DSU, MySQL Pt 10 EXPLAIN, Freelance Cart/Gift & Deep Learning ANN",
      "focus": [
        "DSA Ch.8b (D4.4–D4.6)",
        "MySQL Pt 10 Indexes + Xplore",
        "Freelance Cart/Bundle + ANN"
      ],
      "practiceTag": "D4.4–D4.6 • MySQL Pt 10 EXPLAIN • Deep Learning ANN",
      "targets": [
        {
          "id": "w7_t1",
          "track": "dsa",
          "text": "Dijkstra, Kahn topo sort, Union-Find DSU & MST (Ch.8 + D4.4–D4.6)."
        },
        {
          "id": "w7_t2",
          "track": "sql_xplore",
          "text": "MySQL Part 10 (B+Tree composite indexes & EXPLAIN plans) + Xplore ~58%."
        },
        {
          "id": "w7_t3",
          "track": "aiml",
          "text": "Udemy #2: Deep Learning section — Perceptrons, Backprop, Optimizers & PyTorch ANN."
        },
        {
          "id": "w7_t4",
          "track": "client_web",
          "text": "Freelance Cart drawer, 15% demi-fine bundle & gift-box UX + client midpoint review."
        },
        {
          "id": "w7_t5",
          "track": "research_fit",
          "text": "Journal #1: write full Introduction, Related Work & Proposed Method draft."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Ch.8 Kahn Topological Sort",
            "In-degree queue topo sort & cycle detection; solve D4.4.",
            "py_guide",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_adv"
            ],
            "MySQL Pt 10: B+Tree Indexing & EXPLAIN Plans",
            "Leftmost prefix rule, covering indexes, range selectivity & EXPLAIN.",
            "sql_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Draft Introduction, Related Work & Method",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Hands-On Coding Assessments",
            "Complete Xplore coding exercises (~58% cumulative).",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_frontend"
            ],
            "Freelance Cart/15% Bundle/Gift UX + Client Midpoint Demo",
            "Slide-over bag, automatic 'Buy 2 Demi-Fine Save 15%' & gift note + client review. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DL): Neural Nets, Backprop & Optimizers",
            "Perceptrons, activations, backprop, Adam, BatchNorm & PyTorch ANN. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Ch.8 Dijkstra Shortest Path",
            "Priority-queue Dijkstra with stale-entry skip; solve D4.5.",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_adv"
            ],
            "MySQL Pt 10: B+Tree Indexing & EXPLAIN Plans (Day 2)",
            "Leftmost prefix rule, covering indexes, range selectivity & EXPLAIN.",
            "sql_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Draft Introduction, Related Work & Method (Session 2)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Hands-On Coding Assessments",
            "Complete Xplore coding exercises (~58% cumulative).",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_frontend"
            ],
            "Freelance Cart/15% Bundle/Gift UX + Client Midpoint Demo",
            "Slide-over bag, automatic 'Buy 2 Demi-Fine Save 15%' & gift note + client review. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "web_frontend",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Freelance Cart/15% Bundle/Gift UX + Client Midpoint Demo — OR slot Peer Review #2 here once authors fulfill requirements.",
            "freelance_client",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DL): Neural Nets, Backprop & Optimizers",
            "Perceptrons, activations, backprop, Adam, BatchNorm & PyTorch ANN. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Ch.8 Bellman-Ford & 0-1 BFS",
            "Negative edge checks & deque 0-1 BFS shortest path.",
            "py_guide",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_adv"
            ],
            "MySQL Pt 10: B+Tree Indexing & EXPLAIN Plans (Day 3)",
            "Leftmost prefix rule, covering indexes, range selectivity & EXPLAIN.",
            "sql_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Draft Introduction, Related Work & Method (Session 3)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Hands-On Coding Assessments",
            "Complete Xplore coding exercises (~58% cumulative).",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_frontend"
            ],
            "Freelance Cart/15% Bundle/Gift UX + Client Midpoint Demo",
            "Slide-over bag, automatic 'Buy 2 Demi-Fine Save 15%' & gift note + client review. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DL): Neural Nets, Backprop & Optimizers",
            "Perceptrons, activations, backprop, Adam, BatchNorm & PyTorch ANN. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Ch.8 Union-Find (DSU) & Kruskal MST",
            "Path compression + union by rank; solve D4.6.",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_adv"
            ],
            "MySQL Pt 10: B+Tree Indexing & EXPLAIN Plans (Day 4)",
            "Leftmost prefix rule, covering indexes, range selectivity & EXPLAIN.",
            "sql_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Draft Introduction, Related Work & Method (Session 4)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Hands-On Coding Assessments",
            "Complete Xplore coding exercises (~58% cumulative).",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_frontend"
            ],
            "Freelance Cart/15% Bundle/Gift UX + Client Midpoint Demo",
            "Slide-over bag, automatic 'Buy 2 Demi-Fine Save 15%' & gift note + client review. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "web_frontend",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Freelance Cart/15% Bundle/Gift UX + Client Midpoint Demo — OR slot Peer Review #2 here once authors fulfill requirements.",
            "freelance_client",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DL): Neural Nets, Backprop & Optimizers",
            "Perceptrons, activations, backprop, Adam, BatchNorm & PyTorch ANN. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Shortest Path & DSU Drills",
            "Solve 3 graph mediums (Network Delay, Accounts Merge, Cheapest Flights).",
            "ud_dsa",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_adv"
            ],
            "MySQL Pt 10: B+Tree Indexing & EXPLAIN Plans (Day 5)",
            "Leftmost prefix rule, covering indexes, range selectivity & EXPLAIN.",
            "sql_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Draft Introduction, Related Work & Method (Session 5)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Hands-On Coding Assessments",
            "Complete Xplore coding exercises (~58% cumulative).",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_frontend"
            ],
            "Freelance Cart/15% Bundle/Gift UX + Client Midpoint Demo",
            "Slide-over bag, automatic 'Buy 2 Demi-Fine Save 15%' & gift note + client review. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DL): Neural Nets, Backprop & Optimizers",
            "Perceptrons, activations, backprop, Adam, BatchNorm & PyTorch ANN. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Sat Timed Check: Advanced Graphs",
            "Timed Dijkstra + DSU coding sprint (2 problems, 60m).",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_adv"
            ],
            "MySQL Pt 10: B+Tree Indexing & EXPLAIN Plans (Day 6)",
            "Leftmost prefix rule, covering indexes, range selectivity & EXPLAIN.",
            "sql_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Draft Introduction, Related Work & Method (Session 6)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "client_web",
            [
              "web_frontend"
            ],
            "Freelance Cart/15% Bundle/Gift UX + Client Midpoint Demo",
            "Slide-over bag, automatic 'Buy 2 Demi-Fine Save 15%' & gift note + client review. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DL): Neural Nets, Backprop & Optimizers",
            "Perceptrons, activations, backprop, Adam, BatchNorm & PyTorch ANN. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Sun Light Review: Wk 7 Error Log",
            "Blank-editor recall of Kahn, Dijkstra & DSU.",
            "py_rev",
            1.5,
            "07:30–09:00",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_adv"
            ],
            "Weekly Reset + MySQL Pt 10 Review",
            "15-min next-week plan + 45-min light SQL Quick Revision recall.",
            "sql_rev",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Sunday Lab: Udemy #2 (DL): Neural Nets, Backprop & Optimizers",
            "Hands-on coding/notebook consolidation for Udemy #2 (DL): Neural Nets, Backprop & Optimizers. Afternoon OFF after 14:00!",
            "ud_dsml",
            1.5,
            "12:30–14:00",
            "b2"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Sunday Active Recovery & Mobility",
            "Light stretching, mobility & easy jump-rope warm-down; full evening off for recovery.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ]
        ]
      ]
    },
    {
      "id": 8,
      "month": 2,
      "title": "1D/Grid DP, MySQL Pt 11–12 ACID, Hitesh Node/Express & CNNs",
      "focus": [
        "DSA Ch.9a (D5.1–D5.3)",
        "MySQL Pt 11–12 ACID + Xplore",
        "Hitesh Node/Express + CNNs"
      ],
      "practiceTag": "D5.1–D5.3 • MySQL Pt 11–12 • Node/Express + CNN",
      "targets": [
        {
          "id": "w8_t1",
          "track": "dsa",
          "text": "1D & Grid Dynamic Programming: memoization vs tabulation (Ch.9 + D5.1–D5.3)."
        },
        {
          "id": "w8_t2",
          "track": "sql_xplore",
          "text": "MySQL Parts 11–12 (Transactions, MVCC Isolation & Locking) + Xplore ~67%."
        },
        {
          "id": "w8_t3",
          "track": "aiml",
          "text": "Udemy #2: CNNs, Convolutions, Pooling, Transfer Learning & Regularisation."
        },
        {
          "id": "w8_t4",
          "track": "client_web",
          "text": "Hitesh Backend (Node.js, Express, REST routes, Zod) wired to Freelance API endpoints."
        },
        {
          "id": "w8_t5",
          "track": "research_fit",
          "text": "Journal #1: write Results, Ablation Analysis & Discussion sections."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Ch.9 1D DP State & Transitions",
            "Climbing stairs, House Robber & Decode Ways; solve D5.1.",
            "py_guide",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "MySQL Pt 11–12: ACID, MVCC Isolation & Locks",
            "Dirty/non-repeatable/phantom reads, gap locks & deadlock avoidance.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Draft Results, Ablations & Discussion",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Framework & Testing Modules",
            "Steady 75-min afternoon chunks -> ~67% complete.",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_backend"
            ],
            "Hitesh Node.js & Express APIs + Freelance Backend Init",
            "REST API structure, input validation & product/gold-rate endpoints. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DL): CNNs, ResNets & Transfer Learning",
            "Convolutions, pooling, ResNet skip connections & fine-tuning pretrained CNNs. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Ch.9 Memoization vs Tabulation",
            "Convert lru_cache top-down to O(n)/O(1) bottom-up; solve D5.2.",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "MySQL Pt 11–12: ACID, MVCC Isolation & Locks (Day 2)",
            "Dirty/non-repeatable/phantom reads, gap locks & deadlock avoidance.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Draft Results, Ablations & Discussion (Session 2)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Framework & Testing Modules",
            "Steady 75-min afternoon chunks -> ~67% complete.",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_backend"
            ],
            "Hitesh Node.js & Express APIs + Freelance Backend Init",
            "REST API structure, input validation & product/gold-rate endpoints. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "web_backend",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Hitesh Node.js & Express APIs + Freelance Backend Init — OR slot Peer Review #2 here once authors fulfill requirements.",
            "ud_web",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DL): CNNs, ResNets & Transfer Learning",
            "Convolutions, pooling, ResNet skip connections & fine-tuning pretrained CNNs. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Ch.9 2D Grid DP",
            "Unique paths, min path sum & obstacle grids; solve D5.3.",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "MySQL Pt 11–12: ACID, MVCC Isolation & Locks (Day 3)",
            "Dirty/non-repeatable/phantom reads, gap locks & deadlock avoidance.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Draft Results, Ablations & Discussion (Session 3)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Framework & Testing Modules",
            "Steady 75-min afternoon chunks -> ~67% complete.",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_backend"
            ],
            "Hitesh Node.js & Express APIs + Freelance Backend Init",
            "REST API structure, input validation & product/gold-rate endpoints. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DL): CNNs, ResNets & Transfer Learning",
            "Convolutions, pooling, ResNet skip connections & fine-tuning pretrained CNNs. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "1D & Grid DP Drills",
            "Solve 3 core DP mediums (Word Break / Partition / Triangle).",
            "ud_dsa",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "MySQL Pt 11–12: ACID, MVCC Isolation & Locks (Day 4)",
            "Dirty/non-repeatable/phantom reads, gap locks & deadlock avoidance.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Draft Results, Ablations & Discussion (Session 4)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Framework & Testing Modules",
            "Steady 75-min afternoon chunks -> ~67% complete.",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_backend"
            ],
            "Hitesh Node.js & Express APIs + Freelance Backend Init",
            "REST API structure, input validation & product/gold-rate endpoints. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "web_backend",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Hitesh Node.js & Express APIs + Freelance Backend Init — OR slot Peer Review #2 here once authors fulfill requirements.",
            "ud_web",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DL): CNNs, ResNets & Transfer Learning",
            "Convolutions, pooling, ResNet skip connections & fine-tuning pretrained CNNs. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "D5.1–D5.3 IPA Pattern Drill",
            "Timed 2-question IPA mock (1 Graph + 1 1D DP).",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "MySQL Pt 11–12: ACID, MVCC Isolation & Locks (Day 5)",
            "Dirty/non-repeatable/phantom reads, gap locks & deadlock avoidance.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Draft Results, Ablations & Discussion (Session 5)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Framework & Testing Modules",
            "Steady 75-min afternoon chunks -> ~67% complete.",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_backend"
            ],
            "Hitesh Node.js & Express APIs + Freelance Backend Init",
            "REST API structure, input validation & product/gold-rate endpoints. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DL): CNNs, ResNets & Transfer Learning",
            "Convolutions, pooling, ResNet skip connections & fine-tuning pretrained CNNs. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Sat Timed Check: Month 2 Cumulative",
            "2 timed Tree/Graph/DP problems + error log.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "MySQL Pt 11–12: ACID, MVCC Isolation & Locks (Day 6)",
            "Dirty/non-repeatable/phantom reads, gap locks & deadlock avoidance.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Draft Results, Ablations & Discussion (Session 6)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "client_web",
            [
              "web_backend"
            ],
            "Hitesh Node.js & Express APIs + Freelance Backend Init",
            "REST API structure, input validation & product/gold-rate endpoints. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DL): CNNs, ResNets & Transfer Learning",
            "Convolutions, pooling, ResNet skip connections & fine-tuning pretrained CNNs. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Sun Light Review: Month 2 Sweep",
            "Clear Month 2 Redo queue before Knapsack/Strings DP.",
            "py_rev",
            1.5,
            "07:30–09:00",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Weekly Reset + MySQL Pt 11–12 Review",
            "15-min next-week plan + 45-min light SQL Quick Revision recall.",
            "sql_rev",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Sunday Lab: Udemy #2 (DL): CNNs, ResNets & Transfer Learning",
            "Hands-on coding/notebook consolidation for Udemy #2 (DL): CNNs, ResNets & Transfer Learning. Afternoon OFF after 14:00!",
            "ud_dsml",
            1.5,
            "12:30–14:00",
            "b2"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Sunday Active Recovery & Mobility",
            "Light stretching, mobility & easy jump-rope warm-down; full evening off for recovery.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ]
        ]
      ]
    },
    {
      "id": 9,
      "month": 3,
      "title": "Knapsack/Interval DP, MySQL Pt 13–14, Freelance Auth/DB & RNN/LSTM",
      "focus": [
        "DSA Ch.9b (D5.4–D5.6)",
        "MySQL Pt 13–14 + Xplore",
        "Freelance Auth/DB + RNN/LSTM"
      ],
      "practiceTag": "D5.4–D5.6 • MySQL Pt 13–14 • Freelance Auth + RNN/LSTM",
      "targets": [
        {
          "id": "w9_t1",
          "track": "dsa",
          "text": "Knapsack, Coin Change, LIS & Stock DP state design (Ch.9 + D5.4–D5.6)."
        },
        {
          "id": "w9_t2",
          "track": "sql_xplore",
          "text": "MySQL Parts 13–14 (BCNF Normalisation, Views & Stored Routines) + Xplore ~75%."
        },
        {
          "id": "w9_t3",
          "track": "aiml",
          "text": "Udemy #2: Sequence Models — RNN, LSTM, GRU & Seq2Seq foundations."
        },
        {
          "id": "w9_t4",
          "track": "client_web",
          "text": "Hitesh Auth/JWT + Mongo/SQL persistence applied to Freelance customer orders & wishlist."
        },
        {
          "id": "w9_t5",
          "track": "research_fit",
          "text": "Journal #1: complete full manuscript draft + internal self-critique pass."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Ch.9 0/1 & Unbounded Knapsack",
            "Subset sum, target sum & coin change; solve D5.4.",
            "py_guide",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "MySQL Pt 13–14: BCNF Normalisation & Views",
            "1NF -> BCNF lossless joins, dependency preservation & updatable views.",
            "sql_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Full Manuscript Integration & Self-Critique",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Cloud / Agile & Mandatory Quizzes",
            "Clear mandatory non-coding compliance modules -> ~75% complete.",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_backend"
            ],
            "Hitesh Auth/JWT & DB + Freelance Customer/Order Models",
            "Customer accounts, order history, wishlist persistence & admin auth. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DL): Sequence Models — RNN, LSTM & GRU",
            "Vanishing gradients, gates in LSTM/GRU & sequence modelling. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Ch.9 LCS, Edit Distance & Strings",
            "2D string DP table & rolling 1D optimisation; solve D5.5.",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "MySQL Pt 13–14: BCNF Normalisation & Views (Day 2)",
            "1NF -> BCNF lossless joins, dependency preservation & updatable views.",
            "sql_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Full Manuscript Integration & Self-Critique (Session 2)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Cloud / Agile & Mandatory Quizzes",
            "Clear mandatory non-coding compliance modules -> ~75% complete.",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_backend"
            ],
            "Hitesh Auth/JWT & DB + Freelance Customer/Order Models",
            "Customer accounts, order history, wishlist persistence & admin auth. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "web_backend",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Hitesh Auth/JWT & DB + Freelance Customer/Order Models — OR slot Peer Review #2 here once authors fulfill requirements.",
            "ud_web",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DL): Sequence Models — RNN, LSTM & GRU",
            "Vanishing gradients, gates in LSTM/GRU & sequence modelling. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Ch.9 LIS & Stock State-Machine DP",
            "Patience sorting O(n log n) LIS & cooldown stock DP; solve D5.6.",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "MySQL Pt 13–14: BCNF Normalisation & Views (Day 3)",
            "1NF -> BCNF lossless joins, dependency preservation & updatable views.",
            "sql_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Full Manuscript Integration & Self-Critique (Session 3)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Cloud / Agile & Mandatory Quizzes",
            "Clear mandatory non-coding compliance modules -> ~75% complete.",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_backend"
            ],
            "Hitesh Auth/JWT & DB + Freelance Customer/Order Models",
            "Customer accounts, order history, wishlist persistence & admin auth. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DL): Sequence Models — RNN, LSTM & GRU",
            "Vanishing gradients, gates in LSTM/GRU & sequence modelling. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Knapsack & String DP Drills",
            "Solve 3 DP mediums (Coin Change II, Longest Palindromic Subseq).",
            "ud_dsa",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "MySQL Pt 13–14: BCNF Normalisation & Views (Day 4)",
            "1NF -> BCNF lossless joins, dependency preservation & updatable views.",
            "sql_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Full Manuscript Integration & Self-Critique (Session 4)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Cloud / Agile & Mandatory Quizzes",
            "Clear mandatory non-coding compliance modules -> ~75% complete.",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_backend"
            ],
            "Hitesh Auth/JWT & DB + Freelance Customer/Order Models",
            "Customer accounts, order history, wishlist persistence & admin auth. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "web_backend",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Hitesh Auth/JWT & DB + Freelance Customer/Order Models — OR slot Peer Review #2 here once authors fulfill requirements.",
            "ud_web",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DL): Sequence Models — RNN, LSTM & GRU",
            "Vanishing gradients, gates in LSTM/GRU & sequence modelling. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "D5.4–D5.6 Timed Re-Solve",
            "Re-solve D5.4–D5.6 from scratch under 50m total.",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "MySQL Pt 13–14: BCNF Normalisation & Views (Day 5)",
            "1NF -> BCNF lossless joins, dependency preservation & updatable views.",
            "sql_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Full Manuscript Integration & Self-Critique (Session 5)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Cloud / Agile & Mandatory Quizzes",
            "Clear mandatory non-coding compliance modules -> ~75% complete.",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_backend"
            ],
            "Hitesh Auth/JWT & DB + Freelance Customer/Order Models",
            "Customer accounts, order history, wishlist persistence & admin auth. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DL): Sequence Models — RNN, LSTM & GRU",
            "Vanishing gradients, gates in LSTM/GRU & sequence modelling. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Sat Timed Check: DP Mastery",
            "2 timed DP problems + transition recurrence notes.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "MySQL Pt 13–14: BCNF Normalisation & Views (Day 6)",
            "1NF -> BCNF lossless joins, dependency preservation & updatable views.",
            "sql_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Full Manuscript Integration & Self-Critique (Session 6)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "client_web",
            [
              "web_backend"
            ],
            "Hitesh Auth/JWT & DB + Freelance Customer/Order Models",
            "Customer accounts, order history, wishlist persistence & admin auth. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "ud_web",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (DL): Sequence Models — RNN, LSTM & GRU",
            "Vanishing gradients, gates in LSTM/GRU & sequence modelling. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Sun Light Review: Wk 9 Error Log",
            "Audit DP base cases & index-offset bugs.",
            "py_rev",
            1.5,
            "07:30–09:00",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "Weekly Reset + MySQL Pt 13–14 Review",
            "15-min next-week plan + 45-min light SQL Quick Revision recall.",
            "sql_rev",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Sunday Lab: Udemy #2 (DL): Sequence Models — RNN, LSTM & GRU",
            "Hands-on coding/notebook consolidation for Udemy #2 (DL): Sequence Models — RNN, LSTM & GRU. Afternoon OFF after 14:00!",
            "ud_dsml",
            1.5,
            "12:30–14:00",
            "b2"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Sunday Active Recovery & Mobility",
            "Light stretching, mobility & easy jump-rope warm-down; full evening off for recovery.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ]
        ]
      ]
    },
    {
      "id": 10,
      "month": 3,
      "title": "Greedy & Bit Tricks, MySQL Pt 15–16, Freelance Checkout/Admin & Attention/NLP",
      "focus": [
        "DSA Ch.10–11 (D6.1–D6.3)",
        "MySQL Pt 15–16 + Xplore",
        "Freelancing Project Checkout + Transformers"
      ],
      "practiceTag": "D6.1–D6.3 • MySQL Pt 15–16 • Checkout + Attention/NLP",
      "targets": [
        {
          "id": "w10_t1",
          "track": "dsa",
          "text": "Greedy exchange arguments, intervals & bitmasks (Ch.10–11 + D6.1–D6.3)."
        },
        {
          "id": "w10_t2",
          "track": "sql_xplore",
          "text": "MySQL Parts 15–16 (Users, Security & Backup) — Full MySQL Guide Complete + Xplore ~84%."
        },
        {
          "id": "w10_t3",
          "track": "aiml",
          "text": "Udemy #2: Word Embeddings, Self-Attention, Transformer Encoder/Decoder & NLP."
        },
        {
          "id": "w10_t4",
          "track": "client_web",
          "text": "Freelance Checkout flow, payment integration & lightweight Admin SKU/Gold-Rate panel."
        },
        {
          "id": "w10_t5",
          "track": "research_fit",
          "text": "Journal #1: tighten claims, verify all citations/equations & run plagiarism/style check."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Ch.10 Greedy Exchange Arguments",
            "Activity selection, jump game & gas station; solve D6.1.",
            "py_guide",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "MySQL Pt 15–16: Stored Procs, Security & Backups",
            "Routines, triggers, least-privilege grants & dump/restore hygiene.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Tighten Claims, Equations & Citations",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Capstone Labs & Scenario Checks",
            "Complete remaining Xplore lab scenarios -> ~84% complete.",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_backend"
            ],
            "Freelancing Project Checkout, Payment Webhook & Admin Gold-Rate Panel",
            "Order placement flow, payment confirmation states & client SKU/rate editor. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (NLP): Embeddings, Attention & Transformers",
            "Word2Vec/BPE, scaled dot-product self-attention & Transformer blocks. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Ch.10 Greedy Intervals & PQ",
            "Minimum platforms, task scheduler & Huffman; solve D6.2.",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "MySQL Pt 15–16: Stored Procs, Security & Backups (Day 2)",
            "Routines, triggers, least-privilege grants & dump/restore hygiene.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Tighten Claims, Equations & Citations (Session 2)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Capstone Labs & Scenario Checks",
            "Complete remaining Xplore lab scenarios -> ~84% complete.",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_backend"
            ],
            "Freelancing Project Checkout, Payment Webhook & Admin Gold-Rate Panel",
            "Order placement flow, payment confirmation states & client SKU/rate editor. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "web_backend",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Freelancing Project Checkout, Payment Webhook & Admin Gold-Rate Panel — OR slot Peer Review #2 here once authors fulfill requirements.",
            "freelance_client",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (NLP): Embeddings, Attention & Transformers",
            "Word2Vec/BPE, scaled dot-product self-attention & Transformer blocks. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Ch.11 Bit Manipulation Tricks",
            "XOR single numbers, bitmasks, Brian Kernighan & solve D6.3.",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "MySQL Pt 15–16: Stored Procs, Security & Backups (Day 3)",
            "Routines, triggers, least-privilege grants & dump/restore hygiene.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Tighten Claims, Equations & Citations (Session 3)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Capstone Labs & Scenario Checks",
            "Complete remaining Xplore lab scenarios -> ~84% complete.",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_backend"
            ],
            "Freelancing Project Checkout, Payment Webhook & Admin Gold-Rate Panel",
            "Order placement flow, payment confirmation states & client SKU/rate editor. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (NLP): Embeddings, Attention & Transformers",
            "Word2Vec/BPE, scaled dot-product self-attention & Transformer blocks. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Greedy & Bitwise Drills",
            "Solve 3 Greedy/Bit mediums under 20m each.",
            "ud_dsa",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "MySQL Pt 15–16: Stored Procs, Security & Backups (Day 4)",
            "Routines, triggers, least-privilege grants & dump/restore hygiene.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Tighten Claims, Equations & Citations (Session 4)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Capstone Labs & Scenario Checks",
            "Complete remaining Xplore lab scenarios -> ~84% complete.",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_backend"
            ],
            "Freelancing Project Checkout, Payment Webhook & Admin Gold-Rate Panel",
            "Order placement flow, payment confirmation states & client SKU/rate editor. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "web_backend",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Freelancing Project Checkout, Payment Webhook & Admin Gold-Rate Panel — OR slot Peer Review #2 here once authors fulfill requirements.",
            "freelance_client",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (NLP): Embeddings, Attention & Transformers",
            "Word2Vec/BPE, scaled dot-product self-attention & Transformer blocks. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "D6.1–D6.3 IPA Timed Check",
            "60-min timed 2-problem IPA coding mock (String/Greedy/DP).",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "MySQL Pt 15–16: Stored Procs, Security & Backups (Day 5)",
            "Routines, triggers, least-privilege grants & dump/restore hygiene.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Tighten Claims, Equations & Citations (Session 5)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Capstone Labs & Scenario Checks",
            "Complete remaining Xplore lab scenarios -> ~84% complete.",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "web_backend"
            ],
            "Freelancing Project Checkout, Payment Webhook & Admin Gold-Rate Panel",
            "Order placement flow, payment confirmation states & client SKU/rate editor. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (NLP): Embeddings, Attention & Transformers",
            "Word2Vec/BPE, scaled dot-product self-attention & Transformer blocks. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Sat Timed Check: Greedy & Bits",
            "2 timed problems + greedy proof check.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "MySQL Pt 15–16: Stored Procs, Security & Backups (Day 6)",
            "Routines, triggers, least-privilege grants & dump/restore hygiene.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Tighten Claims, Equations & Citations (Session 6)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "client_web",
            [
              "web_backend"
            ],
            "Freelancing Project Checkout, Payment Webhook & Admin Gold-Rate Panel",
            "Order placement flow, payment confirmation states & client SKU/rate editor. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (NLP): Embeddings, Attention & Transformers",
            "Word2Vec/BPE, scaled dot-product self-attention & Transformer blocks. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Sun Light Review: Wk 10 Error Log",
            "Review greedy counterexamples & bitmask ops.",
            "py_rev",
            1.5,
            "07:30–09:00",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Weekly Reset + MySQL Pt 15–16 Review",
            "15-min next-week plan + 45-min light SQL Quick Revision recall.",
            "sql_rev",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Sunday Lab: Udemy #2 (NLP): Embeddings, Attention & Transformers",
            "Hands-on coding/notebook consolidation for Udemy #2 (NLP): Embeddings, Attention & Transformers. Afternoon OFF after 14:00!",
            "ud_dsml",
            1.5,
            "12:30–14:00",
            "b2"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Sunday Active Recovery & Mobility",
            "Light stretching, mobility & easy jump-rope warm-down; full evening off for recovery.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ]
        ]
      ]
    },
    {
      "id": 11,
      "month": 3,
      "title": "Tries, Fenwick & KMP, SQL Revision, Freelance QA/Perf & NLP Capstone",
      "focus": [
        "DSA Ch.12 (D6.4–D6.6)",
        "MySQL Quick Rev + Xplore 92%",
        "Freelance E2E QA + Udemy #2 Wrap"
      ],
      "practiceTag": "D6.4–D6.6 • All 36 DSA Ex. Complete • Freelance QA",
      "targets": [
        {
          "id": "w11_t1",
          "track": "dsa",
          "text": "Tries, Union/Fenwick Trees & KMP string matching (Ch.12 + D6.4–D6.6) — all 36 exercises done!"
        },
        {
          "id": "w11_t2",
          "track": "sql_xplore",
          "text": "MySQL Quick Revision recall + push TCS Xplore to 92% (finish remaining labs)."
        },
        {
          "id": "w11_t3",
          "track": "aiml",
          "text": "Udemy #2: End-to-End NLP/ML project & review weak DL/ML topics before RAG phase."
        },
        {
          "id": "w11_t4",
          "track": "client_web",
          "text": "Freelancing Project mobile/desktop QA, Lighthouse perf, SEO meta & live staging sign-off."
        },
        {
          "id": "w11_t5",
          "track": "research_fit",
          "text": "Journal #1: format to target journal template, final proofread & co-author review."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Ch.12 Tries (Prefix Trees)",
            "Implement insert/search/startsWith & wildcard trie; solve D6.4.",
            "py_guide",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "MySQL Quick Revision & Chapterwise Hard Sets",
            "Timed drills across Joins, CTEs, Windows & Indexing edge cases.",
            "sql_rev",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Journal Template Formatting & Co-Author Review",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Final Assessments & Retakes",
            "Finish remaining quizzes & reach ~92% before final week.",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelance Full-Stack QA, Lighthouse Perf & Staging Sign-off",
            "Test 1440px desktop & 390px mobile flows, image compression & SEO meta. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (NLP): HuggingFace Intro & Text Classification",
            "End-to-end NLP classification lab & DL debugging checklist. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Ch.12 Fenwick (BIT) & Range Queries",
            "Prefix update/query in O(log n); solve D6.5.",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "MySQL Quick Revision & Chapterwise Hard Sets (Day 2)",
            "Timed drills across Joins, CTEs, Windows & Indexing edge cases.",
            "sql_rev",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Journal Template Formatting & Co-Author Review (Session 2)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Final Assessments & Retakes",
            "Finish remaining quizzes & reach ~92% before final week.",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelance Full-Stack QA, Lighthouse Perf & Staging Sign-off",
            "Test 1440px desktop & 390px mobile flows, image compression & SEO meta. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_delivery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Freelance Full-Stack QA, Lighthouse Perf & Staging Sign-off — OR slot Peer Review #2 here once authors fulfill requirements.",
            "freelance_client",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (NLP): HuggingFace Intro & Text Classification",
            "End-to-end NLP classification lab & DL debugging checklist. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Ch.12 KMP String Matching",
            "Build LPS failure function & solve D6.6 — all 36 exercises done!",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "MySQL Quick Revision & Chapterwise Hard Sets (Day 3)",
            "Timed drills across Joins, CTEs, Windows & Indexing edge cases.",
            "sql_rev",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Journal Template Formatting & Co-Author Review (Session 3)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Final Assessments & Retakes",
            "Finish remaining quizzes & reach ~92% before final week.",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelance Full-Stack QA, Lighthouse Perf & Staging Sign-off",
            "Test 1440px desktop & 390px mobile flows, image compression & SEO meta. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (NLP): HuggingFace Intro & Text Classification",
            "End-to-end NLP classification lab & DL debugging checklist. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Trie & String Pattern Drills",
            "Solve 2 Trie/KMP problems (Word Search II / Search Suggestions).",
            "ud_dsa",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "MySQL Quick Revision & Chapterwise Hard Sets (Day 4)",
            "Timed drills across Joins, CTEs, Windows & Indexing edge cases.",
            "sql_rev",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Journal Template Formatting & Co-Author Review (Session 4)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Final Assessments & Retakes",
            "Finish remaining quizzes & reach ~92% before final week.",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelance Full-Stack QA, Lighthouse Perf & Staging Sign-off",
            "Test 1440px desktop & 390px mobile flows, image compression & SEO meta. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_delivery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Freelance Full-Stack QA, Lighthouse Perf & Staging Sign-off — OR slot Peer Review #2 here once authors fulfill requirements.",
            "freelance_client",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (NLP): HuggingFace Intro & Text Classification",
            "End-to-end NLP classification lab & DL debugging checklist. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Ch.1–12 Full Syllabus Audit",
            "Identify your 3 weakest chapters & drill 1 targeted problem per chapter.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "MySQL Quick Revision & Chapterwise Hard Sets (Day 5)",
            "Timed drills across Joins, CTEs, Windows & Indexing edge cases.",
            "sql_rev",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Journal Template Formatting & Co-Author Review (Session 5)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: Final Assessments & Retakes",
            "Finish remaining quizzes & reach ~92% before final week.",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelance Full-Stack QA, Lighthouse Perf & Staging Sign-off",
            "Test 1440px desktop & 390px mobile flows, image compression & SEO meta. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (NLP): HuggingFace Intro & Text Classification",
            "End-to-end NLP classification lab & DL debugging checklist. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Sat Timed Check: Full-Syllabus IPA",
            "Full 90-min TCS IPA coding simulation (Easy + Medium-Hard).",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "MySQL Quick Revision & Chapterwise Hard Sets (Day 6)",
            "Timed drills across Joins, CTEs, Windows & Indexing edge cases.",
            "sql_rev",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Journal Template Formatting & Co-Author Review (Session 6)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelance Full-Stack QA, Lighthouse Perf & Staging Sign-off",
            "Test 1440px desktop & 390px mobile flows, image compression & SEO meta. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 (NLP): HuggingFace Intro & Text Classification",
            "End-to-end NLP classification lab & DL debugging checklist. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Sun Light Review: Wk 11 Error Log",
            "Consolidate 13-page Python Quick Revision notes.",
            "py_rev",
            1.5,
            "07:30–09:00",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "Weekly Reset + MySQL Quick Revision & Chapterwise Hard Sets Review",
            "15-min next-week plan + 45-min light SQL Quick Revision recall.",
            "sql_rev",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Sunday Lab: Udemy #2 (NLP): HuggingFace Intro & Text Classification",
            "Hands-on coding/notebook consolidation for Udemy #2 (NLP): HuggingFace Intro & Text Classification. Afternoon OFF after 14:00!",
            "ud_dsml",
            1.5,
            "12:30–14:00",
            "b2"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Sunday Active Recovery & Mobility",
            "Light stretching, mobility & easy jump-rope warm-down; full evening off for recovery.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ]
        ]
      ]
    },
    {
      "id": 12,
      "month": 3,
      "title": "Q1 2027 IPA Mock Sprint, Xplore 100%, Freelancing Project Go-Live & Article #1 Submit",
      "focus": [
        "IPA Timed Coding Sprint",
        "TCS Xplore 100% Cleared",
        "Freelancing Project Launch + Article #1 Submit"
      ],
      "practiceTag": "Phase 1 Gate • IPA Ready • Xplore Done • Article #1 Submitted",
      "targets": [
        {
          "id": "w12_t1",
          "track": "dsa",
          "text": "Q1 2027 IPA Readiness Sprint: 13p Python Quick Revision + timed 2-problem IPA mocks."
        },
        {
          "id": "w12_t2",
          "track": "sql_xplore",
          "text": "Final TCS Xplore assessments & 100% clearance + timed MySQL query check."
        },
        {
          "id": "w12_t3",
          "track": "aiml",
          "text": "Close Udemy #2 (~70% Core Complete) & summarise ML/DL/NLP notes for interviews."
        },
        {
          "id": "w12_t4",
          "track": "client_web",
          "text": "Freelancing Project Production Launch on Vercel/Domain, client training video & invoice handover."
        },
        {
          "id": "w12_t5",
          "track": "research_fit",
          "text": "Submit Journal Article #1! Celebrate milestone & clear deck for Article #2."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "IPA Sprint: Arrays, Strings & Hash",
            "Fast 45m sprint of 3 high-frequency IPA string/array problems.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "Phase 1 SQL Gate: Timed 5-Query MySQL Check",
            "Complete full MySQL Quick Revision & clear any flagged SQL Redo items.",
            "sql_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Final Proofread & Journal Submission!",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: 100% Clearance & Certificate Archive",
            "Clear 100% of assigned Xplore courses within your 3-month target!",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelancing Project Production Launch + Client Handover & Training",
            "Deploy to production domain, verify live checkout/SSL & record client walkthrough. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 Wrap (~70% Core Complete) & DL/ML Summary",
            "Consolidate ML/DL/NLP notes; skip filler lectures & prep for RAG. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "IPA Sprint: Stacks, Trees & BFS",
            "45m timed drill on stack & BFS/DFS implementation bugs.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "Phase 1 SQL Gate: Timed 5-Query MySQL Check (Day 2)",
            "Complete full MySQL Quick Revision & clear any flagged SQL Redo items.",
            "sql_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Final Proofread & Journal Submission! (Session 2)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: 100% Clearance & Certificate Archive",
            "Clear 100% of assigned Xplore courses within your 3-month target!",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelancing Project Production Launch + Client Handover & Training",
            "Deploy to production domain, verify live checkout/SSL & record client walkthrough. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_delivery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Freelancing Project Production Launch + Client Handover & Training — OR slot Peer Review #2 here once authors fulfill requirements.",
            "freelance_client",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 Wrap (~70% Core Complete) & DL/ML Summary",
            "Consolidate ML/DL/NLP notes; skip filler lectures & prep for RAG. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "IPA Sprint: DP & Greedy",
            "45m timed drill on knapsack, grid DP & greedy intervals.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "Phase 1 SQL Gate: Timed 5-Query MySQL Check (Day 3)",
            "Complete full MySQL Quick Revision & clear any flagged SQL Redo items.",
            "sql_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Final Proofread & Journal Submission! (Session 3)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: 100% Clearance & Certificate Archive",
            "Clear 100% of assigned Xplore courses within your 3-month target!",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelancing Project Production Launch + Client Handover & Training",
            "Deploy to production domain, verify live checkout/SSL & record client walkthrough. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 Wrap (~70% Core Complete) & DL/ML Summary",
            "Consolidate ML/DL/NLP notes; skip filler lectures & prep for RAG. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "IPA Full Dress Rehearsal #1",
            "Simulate exact Q1 2027 TCS IPA coding environment (no IDE autocomplete).",
            "mock_work",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "Phase 1 SQL Gate: Timed 5-Query MySQL Check (Day 4)",
            "Complete full MySQL Quick Revision & clear any flagged SQL Redo items.",
            "sql_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Final Proofread & Journal Submission! (Session 4)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: 100% Clearance & Certificate Archive",
            "Clear 100% of assigned Xplore courses within your 3-month target!",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelancing Project Production Launch + Client Handover & Training",
            "Deploy to production domain, verify live checkout/SSL & record client walkthrough. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_delivery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Freelancing Project Production Launch + Client Handover & Training — OR slot Peer Review #2 here once authors fulfill requirements.",
            "freelance_client",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 Wrap (~70% Core Complete) & DL/ML Summary",
            "Consolidate ML/DL/NLP notes; skip filler lectures & prep for RAG. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "IPA Full Dress Rehearsal #2",
            "Second full timed mock + verify edge cases (empty/single/large N).",
            "mock_work",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "Phase 1 SQL Gate: Timed 5-Query MySQL Check (Day 5)",
            "Complete full MySQL Quick Revision & clear any flagged SQL Redo items.",
            "sql_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Final Proofread & Journal Submission! (Session 5)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "tcs_xplore"
            ],
            "TCS Xplore: 100% Clearance & Certificate Archive",
            "Clear 100% of assigned Xplore courses within your 3-month target!",
            "tcs_portal",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelancing Project Production Launch + Client Handover & Training",
            "Deploy to production domain, verify live checkout/SSL & record client walkthrough. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Evening Research Push: Journal #1",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j1",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 Wrap (~70% Core Complete) & DL/ML Summary",
            "Consolidate ML/DL/NLP notes; skip filler lectures & prep for RAG. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Sat IPA Final Polish",
            "Complete 13-page Python Quick Revision end-to-end.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "Phase 1 SQL Gate: Timed 5-Query MySQL Check (Day 6)",
            "Complete full MySQL Quick Revision & clear any flagged SQL Redo items.",
            "sql_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article1"
            ],
            "Journal #1: Final Proofread & Journal Submission! (Session 6)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j1",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelancing Project Production Launch + Client Handover & Training",
            "Deploy to production domain, verify live checkout/SSL & record client walkthrough. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Udemy #2 Wrap (~70% Core Complete) & DL/ML Summary",
            "Consolidate ML/DL/NLP notes; skip filler lectures & prep for RAG. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_dsml",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Sun Phase 1 DSA Retro",
            "Mark weak patterns for Phase 2 maintenance & clear Redo queue.",
            "py_rev",
            1.5,
            "07:30–09:00",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_core"
            ],
            "Weekly Reset + Phase 1 SQL Gate Review",
            "15-min next-week plan + 45-min light SQL Quick Revision recall.",
            "sql_rev",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "aiml",
            [
              "ml_core_dl"
            ],
            "Sunday Lab: Udemy #2 Wrap (~70% Core Complete) & DL/ML Summary",
            "Hands-on coding/notebook consolidation for Udemy #2 Wrap (~70% Core Complete) & DL/ML Summary. Afternoon OFF after 14:00!",
            "ud_dsml",
            1.5,
            "12:30–14:00",
            "b2"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Sunday Active Recovery & Mobility",
            "Light stretching, mobility & easy jump-rope warm-down; full evening off for recovery.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ]
        ]
      ]
    },
    {
      "id": 13,
      "month": 4,
      "title": "DSA Maintenance Loops, Analytics SQL/DuckDB, Ultimate RAG Pt 1 & Article #2",
      "focus": [
        "DSA Loop A + IPA Drill",
        "DSI Ch.1 Analytics SQL",
        "Udemy #3 RAG Pt 1 + Article #2"
      ],
      "practiceTag": "Phase 2 Start • Ultimate RAG (#3) • Analytics SQL • Article #2",
      "targets": [
        {
          "id": "w13_t1",
          "track": "dsa",
          "text": "Phase 2 DSA Maintenance: timed Array/Sliding-Window/Hashing mock + Redo Queue sweep."
        },
        {
          "id": "w13_t2",
          "track": "sql_xplore",
          "text": "Analytics SQL (DSI Ch.1: Cohorts, Retention, Funnels & Sessionisation) + timed drills."
        },
        {
          "id": "w13_t3",
          "track": "aiml",
          "text": "Start Udemy #3 (Ultimate RAG Bootcamp, from 1%): LangChain basics & Vector Embeddings."
        },
        {
          "id": "w13_t4",
          "track": "client_web",
          "text": "Freelancing Project post-launch hypercare, analytics check & Hitesh deployment/caching wrap-up."
        },
        {
          "id": "w13_t5",
          "track": "research_fit",
          "text": "Unlock Journal Article #2: literature gap scan, dataset audit & problem framing."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_core"
            ],
            "Arrays, Prefix Sums & Sliding Window Maintenance (Set 1)",
            "Timed morning coding session focusing on arrays, prefix sums & sliding window maintenance.",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Analytics SQL (DSI Ch.1): Retention & Cohorts",
            "Write cohort retention matrices, D1/D7/D30 & active-user SQL.",
            "dsi_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Literature Matrix & Problem Framing",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Flex: Analytics SQL Cohort & Funnel Drills",
            "Practise DSI SQL case prompts (defer guilt-free if client runs long).",
            "dsi_prac",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelance Post-Launch Hypercare & Analytics Audit",
            "Monitor real traffic errors, mobile funnel drop-offs & Hitesh deployment polish. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #3 (RAG): LangChain Core & Embeddings (from 1%)",
            "Document loaders, text splitters, embedding models & basic RAG chain. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_rag",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_core"
            ],
            "Arrays, Prefix Sums & Sliding Window Maintenance (Set 2)",
            "Solve 2 medium/hard problems under interview time pressure + dry run.",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Analytics SQL (DSI Ch.1): Retention & Cohorts (Day 2)",
            "Write cohort retention matrices, D1/D7/D30 & active-user SQL.",
            "dsi_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Literature Matrix & Problem Framing (Session 2)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Flex: Analytics SQL Cohort & Funnel Drills",
            "Practise DSI SQL case prompts (defer guilt-free if client runs long).",
            "dsi_prac",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelance Post-Launch Hypercare & Analytics Audit",
            "Monitor real traffic errors, mobile funnel drop-offs & Hitesh deployment polish. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_delivery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Freelance Post-Launch Hypercare & Analytics Audit — OR slot Peer Review #2 here once authors fulfill requirements.",
            "freelance_client",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #3 (RAG): LangChain Core & Embeddings (from 1%)",
            "Document loaders, text splitters, embedding models & basic RAG chain. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_rag",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_core"
            ],
            "Arrays, Prefix Sums & Sliding Window Maintenance (Set 3)",
            "Complexity & edge-case drill; convert brute force to optimal.",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Analytics SQL (DSI Ch.1): Retention & Cohorts (Day 3)",
            "Write cohort retention matrices, D1/D7/D30 & active-user SQL.",
            "dsi_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Literature Matrix & Problem Framing (Session 3)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Flex: Analytics SQL Cohort & Funnel Drills",
            "Practise DSI SQL case prompts (defer guilt-free if client runs long).",
            "dsi_prac",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelance Post-Launch Hypercare & Analytics Audit",
            "Monitor real traffic errors, mobile funnel drop-offs & Hitesh deployment polish. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #3 (RAG): LangChain Core & Embeddings (from 1%)",
            "Document loaders, text splitters, embedding models & basic RAG chain. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_rag",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_core"
            ],
            "Arrays, Prefix Sums & Sliding Window Maintenance (Set 4)",
            "Timed 2-problem check + write clean invariants from scratch.",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Analytics SQL (DSI Ch.1): Retention & Cohorts (Day 4)",
            "Write cohort retention matrices, D1/D7/D30 & active-user SQL.",
            "dsi_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Literature Matrix & Problem Framing (Session 4)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Flex: Analytics SQL Cohort & Funnel Drills",
            "Practise DSI SQL case prompts (defer guilt-free if client runs long).",
            "dsi_prac",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelance Post-Launch Hypercare & Analytics Audit",
            "Monitor real traffic errors, mobile funnel drop-offs & Hitesh deployment polish. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_delivery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Freelance Post-Launch Hypercare & Analytics Audit — OR slot Peer Review #2 here once authors fulfill requirements.",
            "freelance_client",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #3 (RAG): LangChain Core & Embeddings (from 1%)",
            "Document loaders, text splitters, embedding models & basic RAG chain. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_rag",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_core"
            ],
            "Arrays, Prefix Sums & Sliding Window Maintenance (Set 5)",
            "Mixed pattern consolidation & Redo Queue sweep.",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Analytics SQL (DSI Ch.1): Retention & Cohorts (Day 5)",
            "Write cohort retention matrices, D1/D7/D30 & active-user SQL.",
            "dsi_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Literature Matrix & Problem Framing (Session 5)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Flex: Analytics SQL Cohort & Funnel Drills",
            "Practise DSI SQL case prompts (defer guilt-free if client runs long).",
            "dsi_prac",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelance Post-Launch Hypercare & Analytics Audit",
            "Monitor real traffic errors, mobile funnel drop-offs & Hitesh deployment polish. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #3 (RAG): LangChain Core & Embeddings (from 1%)",
            "Document loaders, text splitters, embedding models & basic RAG chain. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_rag",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_core"
            ],
            "Sat Timed Check: Arrays, Prefix Sums & Sliding Window Maintenance",
            "Full 90-min timed simulation covering Week 13 patterns.",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Analytics SQL (DSI Ch.1): Retention & Cohorts (Day 6)",
            "Write cohort retention matrices, D1/D7/D30 & active-user SQL.",
            "dsi_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Literature Matrix & Problem Framing (Session 6)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelance Post-Launch Hypercare & Analytics Audit",
            "Monitor real traffic errors, mobile funnel drop-offs & Hitesh deployment polish. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #3 (RAG): LangChain Core & Embeddings (from 1%)",
            "Document loaders, text splitters, embedding models & basic RAG chain. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_rag",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_core"
            ],
            "Sun Light Review: Wk 13 Error Log",
            "Audit Week 13 error log & re-solve 1 tricky Redo problem.",
            "py_rev",
            1.5,
            "07:30–09:00",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Weekly Reset + Analytics SQL (DSI Ch.1) Review",
            "15-min next-week plan + 45-min light SQL Quick Revision recall.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Sunday Lab: Udemy #3 (RAG): LangChain Core & Embeddings (from 1%)",
            "Hands-on coding/notebook consolidation for Udemy #3 (RAG): LangChain Core & Embeddings (from 1%). Afternoon OFF after 14:00!",
            "ud_rag",
            1.5,
            "12:30–14:00",
            "b2"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Sunday Active Recovery & Mobility",
            "Light stretching, mobility & easy jump-rope warm-down; full evening off for recovery.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ]
        ]
      ]
    },
    {
      "id": 14,
      "month": 4,
      "title": "B-Search/Stack Timed Sets, Data Eng Lakehouse, RAG Vector DBs & Freelance Case Study",
      "focus": [
        "DSA Loop B Timed Set",
        "DE Ch.1–2 Parquet/DuckDB",
        "Udemy #3 Vector DBs & Chunking"
      ],
      "practiceTag": "Loop B + DuckDB • RAG Chunking/FAISS • Freelance Case Study",
      "targets": [
        {
          "id": "w14_t1",
          "track": "dsa",
          "text": "Timed Binary Search + Monotonic Stack/Deque coding set (under 45m for 2 mediums)."
        },
        {
          "id": "w14_t2",
          "track": "sql_xplore",
          "text": "Data Engineering Ch.1–2 (Parquet, Columnar Scans & DuckDB SQL drills)."
        },
        {
          "id": "w14_t3",
          "track": "aiml",
          "text": "Udemy #3: Structure-aware chunking, FAISS/Chroma/Pinecone & metadata filtering."
        },
        {
          "id": "w14_t4",
          "track": "client_web",
          "text": "Package Freelancing Project Case Study (metrics, architecture, Figma-to-Vercel) + retainer."
        },
        {
          "id": "w14_t5",
          "track": "research_fit",
          "text": "Journal #2: lock methodology hypothesis & set up reproducible experiment repo."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_search_lin"
            ],
            "Binary Search & Monotonic Stack Speed Loop (Set 1)",
            "Timed morning coding session focusing on binary search & monotonic stack speed loop.",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Data Eng Ch.1–2: Columnar Scans & DuckDB",
            "Run DuckDB analytical SQL directly over Parquet & compare row vs col.",
            "de_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Reproducible Repo & Leak-Free Data Splits",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Flex: Data Engineering SQL & DuckDB Labs",
            "Run Parquet/DuckDB queries from Data Engineering Practice Book.",
            "de_prac",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelancing Project Case Study & Architecture Write-Up",
            "Document problem -> Palmonas/GIVA benchmark -> live ROI & screenshots. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #3 (RAG): Vector DBs (FAISS/Chroma) & Metadata",
            "Structure-aware chunking, HNSW/IVF trade-offs & filtered retrieval. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_rag",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_search_lin"
            ],
            "Binary Search & Monotonic Stack Speed Loop (Set 2)",
            "Solve 2 medium/hard problems under interview time pressure + dry run.",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Data Eng Ch.1–2: Columnar Scans & DuckDB (Day 2)",
            "Run DuckDB analytical SQL directly over Parquet & compare row vs col.",
            "de_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Reproducible Repo & Leak-Free Data Splits (Session 2)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Flex: Data Engineering SQL & DuckDB Labs",
            "Run Parquet/DuckDB queries from Data Engineering Practice Book.",
            "de_prac",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelancing Project Case Study & Architecture Write-Up",
            "Document problem -> Palmonas/GIVA benchmark -> live ROI & screenshots. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_delivery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Freelancing Project Case Study & Architecture Write-Up — OR slot Peer Review #2 here once authors fulfill requirements.",
            "hr_guide",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #3 (RAG): Vector DBs (FAISS/Chroma) & Metadata",
            "Structure-aware chunking, HNSW/IVF trade-offs & filtered retrieval. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_rag",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_search_lin"
            ],
            "Binary Search & Monotonic Stack Speed Loop (Set 3)",
            "Complexity & edge-case drill; convert brute force to optimal.",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Data Eng Ch.1–2: Columnar Scans & DuckDB (Day 3)",
            "Run DuckDB analytical SQL directly over Parquet & compare row vs col.",
            "de_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Reproducible Repo & Leak-Free Data Splits (Session 3)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Flex: Data Engineering SQL & DuckDB Labs",
            "Run Parquet/DuckDB queries from Data Engineering Practice Book.",
            "de_prac",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelancing Project Case Study & Architecture Write-Up",
            "Document problem -> Palmonas/GIVA benchmark -> live ROI & screenshots. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #3 (RAG): Vector DBs (FAISS/Chroma) & Metadata",
            "Structure-aware chunking, HNSW/IVF trade-offs & filtered retrieval. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_rag",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_search_lin"
            ],
            "Binary Search & Monotonic Stack Speed Loop (Set 4)",
            "Timed 2-problem check + write clean invariants from scratch.",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Data Eng Ch.1–2: Columnar Scans & DuckDB (Day 4)",
            "Run DuckDB analytical SQL directly over Parquet & compare row vs col.",
            "de_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Reproducible Repo & Leak-Free Data Splits (Session 4)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Flex: Data Engineering SQL & DuckDB Labs",
            "Run Parquet/DuckDB queries from Data Engineering Practice Book.",
            "de_prac",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelancing Project Case Study & Architecture Write-Up",
            "Document problem -> Palmonas/GIVA benchmark -> live ROI & screenshots. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_delivery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Freelancing Project Case Study & Architecture Write-Up — OR slot Peer Review #2 here once authors fulfill requirements.",
            "hr_guide",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #3 (RAG): Vector DBs (FAISS/Chroma) & Metadata",
            "Structure-aware chunking, HNSW/IVF trade-offs & filtered retrieval. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_rag",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_search_lin"
            ],
            "Binary Search & Monotonic Stack Speed Loop (Set 5)",
            "Mixed pattern consolidation & Redo Queue sweep.",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Data Eng Ch.1–2: Columnar Scans & DuckDB (Day 5)",
            "Run DuckDB analytical SQL directly over Parquet & compare row vs col.",
            "de_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Reproducible Repo & Leak-Free Data Splits (Session 5)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Flex: Data Engineering SQL & DuckDB Labs",
            "Run Parquet/DuckDB queries from Data Engineering Practice Book.",
            "de_prac",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelancing Project Case Study & Architecture Write-Up",
            "Document problem -> Palmonas/GIVA benchmark -> live ROI & screenshots. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #3 (RAG): Vector DBs (FAISS/Chroma) & Metadata",
            "Structure-aware chunking, HNSW/IVF trade-offs & filtered retrieval. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_rag",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_search_lin"
            ],
            "Sat Timed Check: Binary Search & Monotonic Stack Speed Loop",
            "Full 90-min timed simulation covering Week 14 patterns.",
            "py_prac",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Data Eng Ch.1–2: Columnar Scans & DuckDB (Day 6)",
            "Run DuckDB analytical SQL directly over Parquet & compare row vs col.",
            "de_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Reproducible Repo & Leak-Free Data Splits (Session 6)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelancing Project Case Study & Architecture Write-Up",
            "Document problem -> Palmonas/GIVA benchmark -> live ROI & screenshots. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #3 (RAG): Vector DBs (FAISS/Chroma) & Metadata",
            "Structure-aware chunking, HNSW/IVF trade-offs & filtered retrieval. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_rag",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_search_lin"
            ],
            "Sun Light Review: Wk 14 Error Log",
            "Audit Week 14 error log & re-solve 1 tricky Redo problem.",
            "py_rev",
            1.5,
            "07:30–09:00",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Weekly Reset + Data Eng Ch.1–2 Review",
            "15-min next-week plan + 45-min light SQL Quick Revision recall.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Sunday Lab: Udemy #3 (RAG): Vector DBs (FAISS/Chroma) & Metadata",
            "Hands-on coding/notebook consolidation for Udemy #3 (RAG): Vector DBs (FAISS/Chroma) & Metadata. Afternoon OFF after 14:00!",
            "ud_rag",
            1.5,
            "12:30–14:00",
            "b2"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Sunday Active Recovery & Mobility",
            "Light stretching, mobility & easy jump-rope warm-down; full evening off for recovery.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ]
        ]
      ]
    },
    {
      "id": 15,
      "month": 4,
      "title": "Tree/Graph Timed Sets, DE Pipelines, Hybrid/Corrective RAG & Article #2 Baselines",
      "focus": [
        "DSA Trees/Graphs OA Sim",
        "DE Ch.3–4 Lakehouse SQL",
        "Udemy #3 Hybrid & LangGraph RAG"
      ],
      "practiceTag": "OA Sim #1 • Hybrid/Corrective RAG • Article #2 Baselines",
      "targets": [
        {
          "id": "w15_t1",
          "track": "dsa",
          "text": "Timed Trees + Shortest Path/DSU 2-problem OA simulation + complexity walkthrough."
        },
        {
          "id": "w15_t2",
          "track": "sql_xplore",
          "text": "Data Engineering Ch.3–4 (CDC, SCD Type 2 & incremental warehouse SQL models)."
        },
        {
          "id": "w15_t3",
          "track": "aiml",
          "text": "Udemy #3: BM25 + Dense Hybrid Retrieval, Cross-Encoder Reranking & Corrective RAG."
        },
        {
          "id": "w15_t4",
          "track": "client_web",
          "text": "Freelance client retainer sprint (conversion/SEO tweaks) or portfolio demo polish."
        },
        {
          "id": "w15_t5",
          "track": "research_fit",
          "text": "Journal #2: run baseline benchmarks & verify dataset splits (zero leakage)."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Trees, Graphs, Dijkstra & DSU OA Simulation (Set 1)",
            "Timed morning coding session focusing on trees, graphs, dijkstra & dsu oa simulation.",
            "mock_work",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Data Eng Ch.3–4: CDC, SCD Type 2 & Pipelines",
            "Implement Slowly Changing Dimensions Type 2 & idempotent upserts in SQL.",
            "de_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Run Baseline Benchmarks & Verify Metrics",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Flex: Timed SQL & Python Debugging Clinic",
            "30m SQL debugging + 30m Python complexity audit.",
            "sql_prac",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelance Retainer Sprint + Portfolio Site Integration",
            "Handle client feedback tweaks & embed Freelancing Project case study in your portfolio. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #3 (RAG): Hybrid Search, Reranking & LangGraph RAG",
            "BM25 + dense fusion, cross-encoder reranking & Corrective/Adaptive RAG. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_rag",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Trees, Graphs, Dijkstra & DSU OA Simulation (Set 2)",
            "Solve 2 medium/hard problems under interview time pressure + dry run.",
            "mock_work",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Data Eng Ch.3–4: CDC, SCD Type 2 & Pipelines (Day 2)",
            "Implement Slowly Changing Dimensions Type 2 & idempotent upserts in SQL.",
            "de_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Run Baseline Benchmarks & Verify Metrics (Session 2)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Flex: Timed SQL & Python Debugging Clinic",
            "30m SQL debugging + 30m Python complexity audit.",
            "sql_prac",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelance Retainer Sprint + Portfolio Site Integration",
            "Handle client feedback tweaks & embed Freelancing Project case study in your portfolio. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_delivery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Freelance Retainer Sprint + Portfolio Site Integration — OR slot Peer Review #2 here once authors fulfill requirements.",
            "freelance_client",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #3 (RAG): Hybrid Search, Reranking & LangGraph RAG",
            "BM25 + dense fusion, cross-encoder reranking & Corrective/Adaptive RAG. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_rag",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Trees, Graphs, Dijkstra & DSU OA Simulation (Set 3)",
            "Complexity & edge-case drill; convert brute force to optimal.",
            "mock_work",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Data Eng Ch.3–4: CDC, SCD Type 2 & Pipelines (Day 3)",
            "Implement Slowly Changing Dimensions Type 2 & idempotent upserts in SQL.",
            "de_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Run Baseline Benchmarks & Verify Metrics (Session 3)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Flex: Timed SQL & Python Debugging Clinic",
            "30m SQL debugging + 30m Python complexity audit.",
            "sql_prac",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelance Retainer Sprint + Portfolio Site Integration",
            "Handle client feedback tweaks & embed Freelancing Project case study in your portfolio. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #3 (RAG): Hybrid Search, Reranking & LangGraph RAG",
            "BM25 + dense fusion, cross-encoder reranking & Corrective/Adaptive RAG. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_rag",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Trees, Graphs, Dijkstra & DSU OA Simulation (Set 4)",
            "Timed 2-problem check + write clean invariants from scratch.",
            "mock_work",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Data Eng Ch.3–4: CDC, SCD Type 2 & Pipelines (Day 4)",
            "Implement Slowly Changing Dimensions Type 2 & idempotent upserts in SQL.",
            "de_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Run Baseline Benchmarks & Verify Metrics (Session 4)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Flex: Timed SQL & Python Debugging Clinic",
            "30m SQL debugging + 30m Python complexity audit.",
            "sql_prac",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelance Retainer Sprint + Portfolio Site Integration",
            "Handle client feedback tweaks & embed Freelancing Project case study in your portfolio. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_delivery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Freelance Retainer Sprint + Portfolio Site Integration — OR slot Peer Review #2 here once authors fulfill requirements.",
            "freelance_client",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #3 (RAG): Hybrid Search, Reranking & LangGraph RAG",
            "BM25 + dense fusion, cross-encoder reranking & Corrective/Adaptive RAG. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_rag",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Trees, Graphs, Dijkstra & DSU OA Simulation (Set 5)",
            "Mixed pattern consolidation & Redo Queue sweep.",
            "mock_work",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Data Eng Ch.3–4: CDC, SCD Type 2 & Pipelines (Day 5)",
            "Implement Slowly Changing Dimensions Type 2 & idempotent upserts in SQL.",
            "de_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Run Baseline Benchmarks & Verify Metrics (Session 5)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Flex: Timed SQL & Python Debugging Clinic",
            "30m SQL debugging + 30m Python complexity audit.",
            "sql_prac",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelance Retainer Sprint + Portfolio Site Integration",
            "Handle client feedback tweaks & embed Freelancing Project case study in your portfolio. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #3 (RAG): Hybrid Search, Reranking & LangGraph RAG",
            "BM25 + dense fusion, cross-encoder reranking & Corrective/Adaptive RAG. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_rag",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Sat Timed Check: Trees, Graphs, Dijkstra & DSU OA Simulation",
            "Full 90-min timed simulation covering Week 15 patterns.",
            "mock_work",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Data Eng Ch.3–4: CDC, SCD Type 2 & Pipelines (Day 6)",
            "Implement Slowly Changing Dimensions Type 2 & idempotent upserts in SQL.",
            "de_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Run Baseline Benchmarks & Verify Metrics (Session 6)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelance Retainer Sprint + Portfolio Site Integration",
            "Handle client feedback tweaks & embed Freelancing Project case study in your portfolio. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #3 (RAG): Hybrid Search, Reranking & LangGraph RAG",
            "BM25 + dense fusion, cross-encoder reranking & Corrective/Adaptive RAG. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_rag",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Sun Light Review: Wk 15 Error Log",
            "Audit Week 15 error log & re-solve 1 tricky Redo problem.",
            "py_rev",
            1.5,
            "07:30–09:00",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Weekly Reset + Data Eng Ch.3–4 Review",
            "15-min next-week plan + 45-min light SQL Quick Revision recall.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Sunday Lab: Udemy #3 (RAG): Hybrid Search, Reranking & LangGraph RAG",
            "Hands-on coding/notebook consolidation for Udemy #3 (RAG): Hybrid Search, Reranking & LangGraph RAG. Afternoon OFF after 14:00!",
            "ud_rag",
            1.5,
            "12:30–14:00",
            "b2"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Sunday Active Recovery & Mobility",
            "Light stretching, mobility & easy jump-rope warm-down; full evening off for recovery.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ]
        ]
      ]
    },
    {
      "id": 16,
      "month": 4,
      "title": "DP Timed Set, SQL Tuning Clinic, LangSmith RAG Evals & Article #2 Experiments",
      "focus": [
        "DSA DP Timed Set",
        "EXPLAIN Tuning Clinic",
        "Udemy #3 Complete (~80%)"
      ],
      "practiceTag": "RAG #3 Complete • LangSmith Evals • SQL Tuning",
      "targets": [
        {
          "id": "w16_t1",
          "track": "dsa",
          "text": "Timed DP + Greedy coding round + zero-out all pending Redo Queue items."
        },
        {
          "id": "w16_t2",
          "track": "sql_xplore",
          "text": "EXPLAIN Query Tuning Clinic & 5-query timed Analytics SQL mock."
        },
        {
          "id": "w16_t3",
          "track": "aiml",
          "text": "Finish Udemy #3 (~80%): Agentic RAG + LangSmith tracing, faithfulness & recall@k evals."
        },
        {
          "id": "w16_t4",
          "track": "client_web",
          "text": "Publish Freelancing Project live demo + architecture breakdown on GitHub/Resume."
        },
        {
          "id": "w16_t5",
          "track": "research_fit",
          "text": "Journal #2: implement proposed method & run initial comparison experiments."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Dynamic Programming & Redo Queue Zero-Out (Set 1)",
            "Timed morning coding session focusing on dynamic programming & redo queue zero-out.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "EXPLAIN Tuning Clinic & 5-Query Analytics Mock",
            "Diagnose slow plans & solve 5 timed Analytics SQL questions.",
            "dsi_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Implement Proposed Architecture & Initial Runs",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "ml_rag_agents"
            ],
            "Flex: RAG Eval Dataset & Prompt Prep",
            "Curate test Q&A pairs for LangSmith RAG evaluation.",
            "rag_ws",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Portfolio Showcase: Live Demo + Tech Breakdown",
            "Publish crisp architecture diagram & metrics for placement/freelance pitches. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #3 (RAG): LangSmith Tracing & Evals (~80% Done)",
            "Build 50+ eval Qs; measure recall@k, faithfulness & latency; finish #3. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_rag",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Dynamic Programming & Redo Queue Zero-Out (Set 2)",
            "Solve 2 medium/hard problems under interview time pressure + dry run.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "EXPLAIN Tuning Clinic & 5-Query Analytics Mock (Day 2)",
            "Diagnose slow plans & solve 5 timed Analytics SQL questions.",
            "dsi_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Implement Proposed Architecture & Initial Runs (Session 2)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "ml_rag_agents"
            ],
            "Flex: RAG Eval Dataset & Prompt Prep",
            "Curate test Q&A pairs for LangSmith RAG evaluation.",
            "rag_ws",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Portfolio Showcase: Live Demo + Tech Breakdown",
            "Publish crisp architecture diagram & metrics for placement/freelance pitches. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_delivery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Portfolio Showcase: Live Demo + Tech Breakdown — OR slot Peer Review #2 here once authors fulfill requirements.",
            "hr_guide",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #3 (RAG): LangSmith Tracing & Evals (~80% Done)",
            "Build 50+ eval Qs; measure recall@k, faithfulness & latency; finish #3. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_rag",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Dynamic Programming & Redo Queue Zero-Out (Set 3)",
            "Complexity & edge-case drill; convert brute force to optimal.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "EXPLAIN Tuning Clinic & 5-Query Analytics Mock (Day 3)",
            "Diagnose slow plans & solve 5 timed Analytics SQL questions.",
            "dsi_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Implement Proposed Architecture & Initial Runs (Session 3)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "ml_rag_agents"
            ],
            "Flex: RAG Eval Dataset & Prompt Prep",
            "Curate test Q&A pairs for LangSmith RAG evaluation.",
            "rag_ws",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Portfolio Showcase: Live Demo + Tech Breakdown",
            "Publish crisp architecture diagram & metrics for placement/freelance pitches. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #3 (RAG): LangSmith Tracing & Evals (~80% Done)",
            "Build 50+ eval Qs; measure recall@k, faithfulness & latency; finish #3. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_rag",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Dynamic Programming & Redo Queue Zero-Out (Set 4)",
            "Timed 2-problem check + write clean invariants from scratch.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "EXPLAIN Tuning Clinic & 5-Query Analytics Mock (Day 4)",
            "Diagnose slow plans & solve 5 timed Analytics SQL questions.",
            "dsi_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Implement Proposed Architecture & Initial Runs (Session 4)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "ml_rag_agents"
            ],
            "Flex: RAG Eval Dataset & Prompt Prep",
            "Curate test Q&A pairs for LangSmith RAG evaluation.",
            "rag_ws",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Portfolio Showcase: Live Demo + Tech Breakdown",
            "Publish crisp architecture diagram & metrics for placement/freelance pitches. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_delivery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Portfolio Showcase: Live Demo + Tech Breakdown — OR slot Peer Review #2 here once authors fulfill requirements.",
            "hr_guide",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #3 (RAG): LangSmith Tracing & Evals (~80% Done)",
            "Build 50+ eval Qs; measure recall@k, faithfulness & latency; finish #3. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_rag",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Dynamic Programming & Redo Queue Zero-Out (Set 5)",
            "Mixed pattern consolidation & Redo Queue sweep.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "EXPLAIN Tuning Clinic & 5-Query Analytics Mock (Day 5)",
            "Diagnose slow plans & solve 5 timed Analytics SQL questions.",
            "dsi_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Implement Proposed Architecture & Initial Runs (Session 5)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "ml_rag_agents"
            ],
            "Flex: RAG Eval Dataset & Prompt Prep",
            "Curate test Q&A pairs for LangSmith RAG evaluation.",
            "rag_ws",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Portfolio Showcase: Live Demo + Tech Breakdown",
            "Publish crisp architecture diagram & metrics for placement/freelance pitches. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #3 (RAG): LangSmith Tracing & Evals (~80% Done)",
            "Build 50+ eval Qs; measure recall@k, faithfulness & latency; finish #3. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_rag",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Sat Timed Check: Dynamic Programming & Redo Queue Zero-Out",
            "Full 90-min timed simulation covering Week 16 patterns.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "EXPLAIN Tuning Clinic & 5-Query Analytics Mock (Day 6)",
            "Diagnose slow plans & solve 5 timed Analytics SQL questions.",
            "dsi_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Implement Proposed Architecture & Initial Runs (Session 6)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Portfolio Showcase: Live Demo + Tech Breakdown",
            "Publish crisp architecture diagram & metrics for placement/freelance pitches. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #3 (RAG): LangSmith Tracing & Evals (~80% Done)",
            "Build 50+ eval Qs; measure recall@k, faithfulness & latency; finish #3. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_rag",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Sun Light Review: Wk 16 Error Log",
            "Audit Week 16 error log & re-solve 1 tricky Redo problem.",
            "py_rev",
            1.5,
            "07:30–09:00",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Weekly Reset + EXPLAIN Tuning Clinic & 5-Query Analytics Mock Review",
            "15-min next-week plan + 45-min light SQL Quick Revision recall.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Sunday Lab: Udemy #3 (RAG): LangSmith Tracing & Evals (~80% Done)",
            "Hands-on coding/notebook consolidation for Udemy #3 (RAG): LangSmith Tracing & Evals (~80% Done). Afternoon OFF after 14:00!",
            "ud_rag",
            1.5,
            "12:30–14:00",
            "b2"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Sunday Active Recovery & Mobility",
            "Light stretching, mobility & easy jump-rope warm-down; full evening off for recovery.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ]
        ]
      ]
    },
    {
      "id": 17,
      "month": 5,
      "title": "Mock Loop A, SQL Product Cases, Agentic AI LangGraph Pt 1 & Article #2 Ablations",
      "focus": [
        "Mock Interview Loop A",
        "DSI SQL Mix-Shift Cases",
        "Udemy #4 LangGraph Agents"
      ],
      "practiceTag": "Loop A • Udemy #4 Agentic AI (Skip Intro) • Article #2 Ablations",
      "targets": [
        {
          "id": "w17_t1",
          "track": "dsa",
          "text": "Mock Interview Loop A (Workbook Rounds 1–4): talk aloud, invariants & dry runs."
        },
        {
          "id": "w17_t2",
          "track": "sql_xplore",
          "text": "Data Science SQL Case Prep (DSI Practice Book: funnel drops & mix-shift SQL)."
        },
        {
          "id": "w17_t3",
          "track": "aiml",
          "text": "Start Udemy #4 (Agentic AI): SKIP LangChain intro; build Stateful LangGraph + Tool loops."
        },
        {
          "id": "w17_t4",
          "track": "client_web",
          "text": "Freelance maintenance / client upsell check-in + Hitesh Testing/Next patterns."
        },
        {
          "id": "w17_t5",
          "track": "research_fit",
          "text": "Journal #2: run ablation studies & hyperparameter sensitivity sweeps."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Mock Interview Loop A (Workbook Rounds 1–4) (Set 1)",
            "Timed morning coding session focusing on mock interview loop a (workbook rounds 1–4).",
            "mock_guide",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "DSI Practice Book: Funnel & Mix-Shift SQL Cases",
            "Solve product metric drop & conversion funnel diagnosis queries.",
            "dsi_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Full Ablation Matrix & Hyperparameter Sweeps",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Flex: DSI Probability, Metrics & Case Drills",
            "Product sense, A/B guardrail metrics & SQL edge cases.",
            "dsi_guide",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "AI Feature Prototype: Smart Jewellery Search / Assistant",
            "Connect Week 13–16 RAG skills to a live Freelance concierge search demo. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #4 (Agents): Stateful LangGraph & Tool Calling",
            "SKIP LangChain basics from #3; build stateful GraphState, edges & tools. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_agents",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Mock Interview Loop A (Workbook Rounds 1–4) (Set 2)",
            "Solve 2 medium/hard problems under interview time pressure + dry run.",
            "mock_guide",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "DSI Practice Book: Funnel & Mix-Shift SQL Cases (Day 2)",
            "Solve product metric drop & conversion funnel diagnosis queries.",
            "dsi_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Full Ablation Matrix & Hyperparameter Sweeps (Session 2)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Flex: DSI Probability, Metrics & Case Drills",
            "Product sense, A/B guardrail metrics & SQL edge cases.",
            "dsi_guide",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "AI Feature Prototype: Smart Jewellery Search / Assistant",
            "Connect Week 13–16 RAG skills to a live Freelance concierge search demo. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_delivery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance AI Feature Prototype: Smart Jewellery Search / Assistant — OR slot Peer Review #2 here once authors fulfill requirements.",
            "freelance_client",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #4 (Agents): Stateful LangGraph & Tool Calling",
            "SKIP LangChain basics from #3; build stateful GraphState, edges & tools. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_agents",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Mock Interview Loop A (Workbook Rounds 1–4) (Set 3)",
            "Complexity & edge-case drill; convert brute force to optimal.",
            "mock_guide",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "DSI Practice Book: Funnel & Mix-Shift SQL Cases (Day 3)",
            "Solve product metric drop & conversion funnel diagnosis queries.",
            "dsi_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Full Ablation Matrix & Hyperparameter Sweeps (Session 3)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Flex: DSI Probability, Metrics & Case Drills",
            "Product sense, A/B guardrail metrics & SQL edge cases.",
            "dsi_guide",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "AI Feature Prototype: Smart Jewellery Search / Assistant",
            "Connect Week 13–16 RAG skills to a live Freelance concierge search demo. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #4 (Agents): Stateful LangGraph & Tool Calling",
            "SKIP LangChain basics from #3; build stateful GraphState, edges & tools. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_agents",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Mock Interview Loop A (Workbook Rounds 1–4) (Set 4)",
            "Timed 2-problem check + write clean invariants from scratch.",
            "mock_guide",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "DSI Practice Book: Funnel & Mix-Shift SQL Cases (Day 4)",
            "Solve product metric drop & conversion funnel diagnosis queries.",
            "dsi_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Full Ablation Matrix & Hyperparameter Sweeps (Session 4)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Flex: DSI Probability, Metrics & Case Drills",
            "Product sense, A/B guardrail metrics & SQL edge cases.",
            "dsi_guide",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "AI Feature Prototype: Smart Jewellery Search / Assistant",
            "Connect Week 13–16 RAG skills to a live Freelance concierge search demo. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_delivery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance AI Feature Prototype: Smart Jewellery Search / Assistant — OR slot Peer Review #2 here once authors fulfill requirements.",
            "freelance_client",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #4 (Agents): Stateful LangGraph & Tool Calling",
            "SKIP LangChain basics from #3; build stateful GraphState, edges & tools. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_agents",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Mock Interview Loop A (Workbook Rounds 1–4) (Set 5)",
            "Mixed pattern consolidation & Redo Queue sweep.",
            "mock_guide",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "DSI Practice Book: Funnel & Mix-Shift SQL Cases (Day 5)",
            "Solve product metric drop & conversion funnel diagnosis queries.",
            "dsi_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Full Ablation Matrix & Hyperparameter Sweeps (Session 5)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Flex: DSI Probability, Metrics & Case Drills",
            "Product sense, A/B guardrail metrics & SQL edge cases.",
            "dsi_guide",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "AI Feature Prototype: Smart Jewellery Search / Assistant",
            "Connect Week 13–16 RAG skills to a live Freelance concierge search demo. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #4 (Agents): Stateful LangGraph & Tool Calling",
            "SKIP LangChain basics from #3; build stateful GraphState, edges & tools. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_agents",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Sat Timed Check: Mock Interview Loop A (Workbook Rounds 1–4)",
            "Full 90-min timed simulation covering Week 17 patterns.",
            "mock_guide",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "DSI Practice Book: Funnel & Mix-Shift SQL Cases (Day 6)",
            "Solve product metric drop & conversion funnel diagnosis queries.",
            "dsi_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Full Ablation Matrix & Hyperparameter Sweeps (Session 6)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "AI Feature Prototype: Smart Jewellery Search / Assistant",
            "Connect Week 13–16 RAG skills to a live Freelance concierge search demo. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #4 (Agents): Stateful LangGraph & Tool Calling",
            "SKIP LangChain basics from #3; build stateful GraphState, edges & tools. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_agents",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_trees_graphs"
            ],
            "Sun Light Review: Wk 17 Error Log",
            "Audit Week 17 error log & re-solve 1 tricky Redo problem.",
            "py_rev",
            1.5,
            "07:30–09:00",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Weekly Reset + DSI Practice Book Review",
            "15-min next-week plan + 45-min light SQL Quick Revision recall.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Sunday Lab: Udemy #4 (Agents): Stateful LangGraph & Tool Calling",
            "Hands-on coding/notebook consolidation for Udemy #4 (Agents): Stateful LangGraph & Tool Calling. Afternoon OFF after 14:00!",
            "ud_agents",
            1.5,
            "12:30–14:00",
            "b2"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Sunday Active Recovery & Mobility",
            "Light stretching, mobility & easy jump-rope warm-down; full evening off for recovery.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ]
        ]
      ]
    },
    {
      "id": 18,
      "month": 5,
      "title": "Mock Loop B, DE Practice Sets, Multi-Agent & HITL & Article #2 Figures",
      "focus": [
        "Mock Interview Loop B",
        "DE Practice Book Ex.1–10",
        "Udemy #4 Multi-Agent & Memory"
      ],
      "practiceTag": "Loop B • Multi-Agent Routing & HITL • Article #2 Figures",
      "targets": [
        {
          "id": "w18_t1",
          "track": "dsa",
          "text": "Mock Interview Loop B (Workbook Rounds 5–8): Graph + DP under 40-min clock."
        },
        {
          "id": "w18_t2",
          "track": "sql_xplore",
          "text": "Data Engineering Practice Book Ex. 1–10 (windowed pipelines & SQL optimisation)."
        },
        {
          "id": "w18_t3",
          "track": "aiml",
          "text": "Udemy #4: Multi-agent supervisor routing, persistent checkpointers & Human-in-the-Loop."
        },
        {
          "id": "w18_t4",
          "track": "client_web",
          "text": "Add AI/semantic search or smart jewellery recommender prototype to Freelancing Project case study."
        },
        {
          "id": "w18_t5",
          "track": "research_fit",
          "text": "Journal #2: generate figures, error-analysis plots & quantitative result tables."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Mock Interview Loop B (Workbook Rounds 5–8) (Set 1)",
            "Timed morning coding session focusing on mock interview loop b (workbook rounds 5–8).",
            "mock_work",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "DE Practice Book Ex. 1–10: Pipeline SQL",
            "Solve Exercises 1–10 on partitioning, compaction & late-arriving data.",
            "de_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Publication Figures & Error-Analysis Tables",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Flex: Data Engineering Pipeline Exercises",
            "Work through DE Practice Book pipeline design prompts.",
            "de_prac",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Client Retainer Check-In & Performance Tuning",
            "Monthly client sync, Core Web Vitals audit & backlog prioritisation. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #4 (Agents): Multi-Agent Routing, Memory & HITL",
            "Supervisor/worker topologies, persistent checkpointers & human-in-the-loop. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_agents",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Mock Interview Loop B (Workbook Rounds 5–8) (Set 2)",
            "Solve 2 medium/hard problems under interview time pressure + dry run.",
            "mock_work",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "DE Practice Book Ex. 1–10: Pipeline SQL (Day 2)",
            "Solve Exercises 1–10 on partitioning, compaction & late-arriving data.",
            "de_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Publication Figures & Error-Analysis Tables (Session 2)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Flex: Data Engineering Pipeline Exercises",
            "Work through DE Practice Book pipeline design prompts.",
            "de_prac",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Client Retainer Check-In & Performance Tuning",
            "Monthly client sync, Core Web Vitals audit & backlog prioritisation. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_delivery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Client Retainer Check-In & Performance Tuning — OR slot Peer Review #2 here once authors fulfill requirements.",
            "freelance_client",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #4 (Agents): Multi-Agent Routing, Memory & HITL",
            "Supervisor/worker topologies, persistent checkpointers & human-in-the-loop. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_agents",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Mock Interview Loop B (Workbook Rounds 5–8) (Set 3)",
            "Complexity & edge-case drill; convert brute force to optimal.",
            "mock_work",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "DE Practice Book Ex. 1–10: Pipeline SQL (Day 3)",
            "Solve Exercises 1–10 on partitioning, compaction & late-arriving data.",
            "de_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Publication Figures & Error-Analysis Tables (Session 3)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Flex: Data Engineering Pipeline Exercises",
            "Work through DE Practice Book pipeline design prompts.",
            "de_prac",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Client Retainer Check-In & Performance Tuning",
            "Monthly client sync, Core Web Vitals audit & backlog prioritisation. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #4 (Agents): Multi-Agent Routing, Memory & HITL",
            "Supervisor/worker topologies, persistent checkpointers & human-in-the-loop. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_agents",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Mock Interview Loop B (Workbook Rounds 5–8) (Set 4)",
            "Timed 2-problem check + write clean invariants from scratch.",
            "mock_work",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "DE Practice Book Ex. 1–10: Pipeline SQL (Day 4)",
            "Solve Exercises 1–10 on partitioning, compaction & late-arriving data.",
            "de_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Publication Figures & Error-Analysis Tables (Session 4)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Flex: Data Engineering Pipeline Exercises",
            "Work through DE Practice Book pipeline design prompts.",
            "de_prac",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Client Retainer Check-In & Performance Tuning",
            "Monthly client sync, Core Web Vitals audit & backlog prioritisation. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_delivery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Client Retainer Check-In & Performance Tuning — OR slot Peer Review #2 here once authors fulfill requirements.",
            "freelance_client",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #4 (Agents): Multi-Agent Routing, Memory & HITL",
            "Supervisor/worker topologies, persistent checkpointers & human-in-the-loop. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_agents",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Mock Interview Loop B (Workbook Rounds 5–8) (Set 5)",
            "Mixed pattern consolidation & Redo Queue sweep.",
            "mock_work",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "DE Practice Book Ex. 1–10: Pipeline SQL (Day 5)",
            "Solve Exercises 1–10 on partitioning, compaction & late-arriving data.",
            "de_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Publication Figures & Error-Analysis Tables (Session 5)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Flex: Data Engineering Pipeline Exercises",
            "Work through DE Practice Book pipeline design prompts.",
            "de_prac",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Client Retainer Check-In & Performance Tuning",
            "Monthly client sync, Core Web Vitals audit & backlog prioritisation. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #4 (Agents): Multi-Agent Routing, Memory & HITL",
            "Supervisor/worker topologies, persistent checkpointers & human-in-the-loop. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_agents",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Sat Timed Check: Mock Interview Loop B (Workbook Rounds 5–8)",
            "Full 90-min timed simulation covering Week 18 patterns.",
            "mock_work",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "DE Practice Book Ex. 1–10: Pipeline SQL (Day 6)",
            "Solve Exercises 1–10 on partitioning, compaction & late-arriving data.",
            "de_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Publication Figures & Error-Analysis Tables (Session 6)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Client Retainer Check-In & Performance Tuning",
            "Monthly client sync, Core Web Vitals audit & backlog prioritisation. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #4 (Agents): Multi-Agent Routing, Memory & HITL",
            "Supervisor/worker topologies, persistent checkpointers & human-in-the-loop. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_agents",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Sun Light Review: Wk 18 Error Log",
            "Audit Week 18 error log & re-solve 1 tricky Redo problem.",
            "py_rev",
            1.5,
            "07:30–09:00",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Weekly Reset + DE Practice Book Ex. 1–10 Review",
            "15-min next-week plan + 45-min light SQL Quick Revision recall.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Sunday Lab: Udemy #4 (Agents): Multi-Agent Routing, Memory & HITL",
            "Hands-on coding/notebook consolidation for Udemy #4 (Agents): Multi-Agent Routing, Memory & HITL. Afternoon OFF after 14:00!",
            "ud_agents",
            1.5,
            "12:30–14:00",
            "b2"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Sunday Active Recovery & Mobility",
            "Light stretching, mobility & easy jump-rope warm-down; full evening off for recovery.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ]
        ]
      ]
    },
    {
      "id": 19,
      "month": 5,
      "title": "Mock Loop C, DE Practice 11–20, MCP/Agent Evals & Article #2 Methods Draft",
      "focus": [
        "Mock Interview Loop C",
        "DE Practice Book Ex.11–20",
        "Udemy #4 Complete (~55%)"
      ],
      "practiceTag": "Loop C • Agentic AI #4 Complete • MCP & Guardrails",
      "targets": [
        {
          "id": "w19_t1",
          "track": "dsa",
          "text": "Mock Interview Loop C (Hard coding + complexity trade-offs, Workbook Rounds 9–12)."
        },
        {
          "id": "w19_t2",
          "track": "sql_xplore",
          "text": "Data Engineering Practice Book Ex. 11–20 + DuckDB end-to-end SQL benchmark."
        },
        {
          "id": "w19_t3",
          "track": "aiml",
          "text": "Finish Udemy #4 (~55% selective): MCP tool integration, guardrails & agent evals."
        },
        {
          "id": "w19_t4",
          "track": "client_web",
          "text": "Portfolio integration: connect LangGraph/RAG mini-agent project to your GitHub."
        },
        {
          "id": "w19_t5",
          "track": "research_fit",
          "text": "Journal #2: draft Introduction, Related Work & Methodology sections."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Mock Interview Loop C (Workbook Rounds 9–12) (Set 1)",
            "Timed morning coding session focusing on mock interview loop c (workbook rounds 9–12).",
            "mock_work",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "DE Practice Book Ex. 11–20: Lakehouse Bench",
            "Solve Exercises 11–20 & benchmark DuckDB window aggregations.",
            "de_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Draft Introduction, Related Work & Method",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "ml_rag_agents"
            ],
            "Flex: Agent Trajectory & Failure-Mode Audit",
            "Review tool-call failure logs & prompt-injection defences.",
            "rag_ws",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Portfolio Repo: Agentic / RAG Demo Integration",
            "Package your LangGraph/RAG project with live demo & clean README. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #4 (Agents): MCP Integration & Evals (~55% Done)",
            "MCP servers, guardrails, trajectory evals & close Udemy #4. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_agents",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Mock Interview Loop C (Workbook Rounds 9–12) (Set 2)",
            "Solve 2 medium/hard problems under interview time pressure + dry run.",
            "mock_work",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "DE Practice Book Ex. 11–20: Lakehouse Bench (Day 2)",
            "Solve Exercises 11–20 & benchmark DuckDB window aggregations.",
            "de_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Draft Introduction, Related Work & Method (Session 2)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "ml_rag_agents"
            ],
            "Flex: Agent Trajectory & Failure-Mode Audit",
            "Review tool-call failure logs & prompt-injection defences.",
            "rag_ws",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Portfolio Repo: Agentic / RAG Demo Integration",
            "Package your LangGraph/RAG project with live demo & clean README. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_delivery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Portfolio Repo: Agentic / RAG Demo Integration — OR slot Peer Review #2 here once authors fulfill requirements.",
            "hr_guide",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #4 (Agents): MCP Integration & Evals (~55% Done)",
            "MCP servers, guardrails, trajectory evals & close Udemy #4. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_agents",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Mock Interview Loop C (Workbook Rounds 9–12) (Set 3)",
            "Complexity & edge-case drill; convert brute force to optimal.",
            "mock_work",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "DE Practice Book Ex. 11–20: Lakehouse Bench (Day 3)",
            "Solve Exercises 11–20 & benchmark DuckDB window aggregations.",
            "de_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Draft Introduction, Related Work & Method (Session 3)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "ml_rag_agents"
            ],
            "Flex: Agent Trajectory & Failure-Mode Audit",
            "Review tool-call failure logs & prompt-injection defences.",
            "rag_ws",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Portfolio Repo: Agentic / RAG Demo Integration",
            "Package your LangGraph/RAG project with live demo & clean README. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #4 (Agents): MCP Integration & Evals (~55% Done)",
            "MCP servers, guardrails, trajectory evals & close Udemy #4. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_agents",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Mock Interview Loop C (Workbook Rounds 9–12) (Set 4)",
            "Timed 2-problem check + write clean invariants from scratch.",
            "mock_work",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "DE Practice Book Ex. 11–20: Lakehouse Bench (Day 4)",
            "Solve Exercises 11–20 & benchmark DuckDB window aggregations.",
            "de_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Draft Introduction, Related Work & Method (Session 4)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "ml_rag_agents"
            ],
            "Flex: Agent Trajectory & Failure-Mode Audit",
            "Review tool-call failure logs & prompt-injection defences.",
            "rag_ws",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Portfolio Repo: Agentic / RAG Demo Integration",
            "Package your LangGraph/RAG project with live demo & clean README. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_delivery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Portfolio Repo: Agentic / RAG Demo Integration — OR slot Peer Review #2 here once authors fulfill requirements.",
            "hr_guide",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #4 (Agents): MCP Integration & Evals (~55% Done)",
            "MCP servers, guardrails, trajectory evals & close Udemy #4. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_agents",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Mock Interview Loop C (Workbook Rounds 9–12) (Set 5)",
            "Mixed pattern consolidation & Redo Queue sweep.",
            "mock_work",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "DE Practice Book Ex. 11–20: Lakehouse Bench (Day 5)",
            "Solve Exercises 11–20 & benchmark DuckDB window aggregations.",
            "de_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Draft Introduction, Related Work & Method (Session 5)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "ml_rag_agents"
            ],
            "Flex: Agent Trajectory & Failure-Mode Audit",
            "Review tool-call failure logs & prompt-injection defences.",
            "rag_ws",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Portfolio Repo: Agentic / RAG Demo Integration",
            "Package your LangGraph/RAG project with live demo & clean README. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #4 (Agents): MCP Integration & Evals (~55% Done)",
            "MCP servers, guardrails, trajectory evals & close Udemy #4. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_agents",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Sat Timed Check: Mock Interview Loop C (Workbook Rounds 9–12)",
            "Full 90-min timed simulation covering Week 19 patterns.",
            "mock_work",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "DE Practice Book Ex. 11–20: Lakehouse Bench (Day 6)",
            "Solve Exercises 11–20 & benchmark DuckDB window aggregations.",
            "de_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Draft Introduction, Related Work & Method (Session 6)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Portfolio Repo: Agentic / RAG Demo Integration",
            "Package your LangGraph/RAG project with live demo & clean README. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #4 (Agents): MCP Integration & Evals (~55% Done)",
            "MCP servers, guardrails, trajectory evals & close Udemy #4. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_agents",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Sun Light Review: Wk 19 Error Log",
            "Audit Week 19 error log & re-solve 1 tricky Redo problem.",
            "py_rev",
            1.5,
            "07:30–09:00",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Weekly Reset + DE Practice Book Ex. 11–20 Review",
            "15-min next-week plan + 45-min light SQL Quick Revision recall.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Sunday Lab: Udemy #4 (Agents): MCP Integration & Evals (~55% Done)",
            "Hands-on coding/notebook consolidation for Udemy #4 (Agents): MCP Integration & Evals (~55% Done). Afternoon OFF after 14:00!",
            "ud_agents",
            1.5,
            "12:30–14:00",
            "b2"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Sunday Active Recovery & Mobility",
            "Light stretching, mobility & easy jump-rope warm-down; full evening off for recovery.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ]
        ]
      ]
    },
    {
      "id": 20,
      "month": 5,
      "title": "OA Simulation #2, SQL Schema Design, HF LoRA Cherry-Pick (#5) & Article #2 Results",
      "focus": [
        "Timed 2-Q OA Sim #2",
        "Schema/Index Trade-off Mock",
        "Udemy #5 HF/LoRA ONLY (~20%)"
      ],
      "practiceTag": "Udemy #5 Cherry-Pick (HF + LoRA/QLoRA ONLY) • OA Sim #2",
      "targets": [
        {
          "id": "w20_t1",
          "track": "dsa",
          "text": "Full timed 2-problem OA Simulation + edge-case audit (0 hints allowed)."
        },
        {
          "id": "w20_t2",
          "track": "sql_xplore",
          "text": "Database Schema & Index Design Mock (high-write vs read-heavy e-commerce tables)."
        },
        {
          "id": "w20_t3",
          "track": "aiml",
          "text": "Udemy #5 (GenAI w/ HF): CHERRY-PICK ONLY (~20%) HuggingFace, PEFT, LoRA/QLoRA & bitsandbytes."
        },
        {
          "id": "w20_t4",
          "track": "client_web",
          "text": "Client retainer / freelance lead outreach & technical portfolio landing polish."
        },
        {
          "id": "w20_t5",
          "track": "research_fit",
          "text": "Journal #2: draft Results, Ablations & Discussion sections."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_core"
            ],
            "Timed 2-Problem OA Simulation #2 (Zero Hints) (Set 1)",
            "Timed morning coding session focusing on timed 2-problem oa simulation #2 (zero hints).",
            "mock_work",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Schema & Index Trade-off Design Mock",
            "Design indexing & partitioning for high-write e-commerce workloads.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Draft Results, Ablations & Discussion",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Flex: E-Commerce DB Indexing & Scale Case",
            "Model Client-scale order/inventory indexing & read replicas.",
            "de_guide",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelance Lead Pipeline & Proposal Template Polish",
            "Turn Freelancing Project discovery + pitch spec into a repeatable freelance playbook. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #5 (Cherry-Pick ~20%): HF Transformers, LoRA & QLoRA",
            "DO ONLY HF Hub, PEFT/LoRA/QLoRA fine-tuning & quantization; skip all LangChain. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_genai_hf",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_core"
            ],
            "Timed 2-Problem OA Simulation #2 (Zero Hints) (Set 2)",
            "Solve 2 medium/hard problems under interview time pressure + dry run.",
            "mock_work",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Schema & Index Trade-off Design Mock (Day 2)",
            "Design indexing & partitioning for high-write e-commerce workloads.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Draft Results, Ablations & Discussion (Session 2)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Flex: E-Commerce DB Indexing & Scale Case",
            "Model Client-scale order/inventory indexing & read replicas.",
            "de_guide",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelance Lead Pipeline & Proposal Template Polish",
            "Turn Freelancing Project discovery + pitch spec into a repeatable freelance playbook. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_delivery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Freelance Lead Pipeline & Proposal Template Polish — OR slot Peer Review #2 here once authors fulfill requirements.",
            "freelance_client",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #5 (Cherry-Pick ~20%): HF Transformers, LoRA & QLoRA",
            "DO ONLY HF Hub, PEFT/LoRA/QLoRA fine-tuning & quantization; skip all LangChain. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_genai_hf",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_core"
            ],
            "Timed 2-Problem OA Simulation #2 (Zero Hints) (Set 3)",
            "Complexity & edge-case drill; convert brute force to optimal.",
            "mock_work",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Schema & Index Trade-off Design Mock (Day 3)",
            "Design indexing & partitioning for high-write e-commerce workloads.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Draft Results, Ablations & Discussion (Session 3)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Flex: E-Commerce DB Indexing & Scale Case",
            "Model Client-scale order/inventory indexing & read replicas.",
            "de_guide",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelance Lead Pipeline & Proposal Template Polish",
            "Turn Freelancing Project discovery + pitch spec into a repeatable freelance playbook. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #5 (Cherry-Pick ~20%): HF Transformers, LoRA & QLoRA",
            "DO ONLY HF Hub, PEFT/LoRA/QLoRA fine-tuning & quantization; skip all LangChain. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_genai_hf",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_core"
            ],
            "Timed 2-Problem OA Simulation #2 (Zero Hints) (Set 4)",
            "Timed 2-problem check + write clean invariants from scratch.",
            "mock_work",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Schema & Index Trade-off Design Mock (Day 4)",
            "Design indexing & partitioning for high-write e-commerce workloads.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Draft Results, Ablations & Discussion (Session 4)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Flex: E-Commerce DB Indexing & Scale Case",
            "Model Client-scale order/inventory indexing & read replicas.",
            "de_guide",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelance Lead Pipeline & Proposal Template Polish",
            "Turn Freelancing Project discovery + pitch spec into a repeatable freelance playbook. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_delivery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Freelance Lead Pipeline & Proposal Template Polish — OR slot Peer Review #2 here once authors fulfill requirements.",
            "freelance_client",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #5 (Cherry-Pick ~20%): HF Transformers, LoRA & QLoRA",
            "DO ONLY HF Hub, PEFT/LoRA/QLoRA fine-tuning & quantization; skip all LangChain. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_genai_hf",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_core"
            ],
            "Timed 2-Problem OA Simulation #2 (Zero Hints) (Set 5)",
            "Mixed pattern consolidation & Redo Queue sweep.",
            "mock_work",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Schema & Index Trade-off Design Mock (Day 5)",
            "Design indexing & partitioning for high-write e-commerce workloads.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Draft Results, Ablations & Discussion (Session 5)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Flex: E-Commerce DB Indexing & Scale Case",
            "Model Client-scale order/inventory indexing & read replicas.",
            "de_guide",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelance Lead Pipeline & Proposal Template Polish",
            "Turn Freelancing Project discovery + pitch spec into a repeatable freelance playbook. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #5 (Cherry-Pick ~20%): HF Transformers, LoRA & QLoRA",
            "DO ONLY HF Hub, PEFT/LoRA/QLoRA fine-tuning & quantization; skip all LangChain. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_genai_hf",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_core"
            ],
            "Sat Timed Check: Timed 2-Problem OA Simulation #2 (Zero Hints)",
            "Full 90-min timed simulation covering Week 20 patterns.",
            "mock_work",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Schema & Index Trade-off Design Mock (Day 6)",
            "Design indexing & partitioning for high-write e-commerce workloads.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Draft Results, Ablations & Discussion (Session 6)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Freelance Lead Pipeline & Proposal Template Polish",
            "Turn Freelancing Project discovery + pitch spec into a repeatable freelance playbook. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "freelance_client",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Udemy #5 (Cherry-Pick ~20%): HF Transformers, LoRA & QLoRA",
            "DO ONLY HF Hub, PEFT/LoRA/QLoRA fine-tuning & quantization; skip all LangChain. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_genai_hf",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_core"
            ],
            "Sun Light Review: Wk 20 Error Log",
            "Audit Week 20 error log & re-solve 1 tricky Redo problem.",
            "py_rev",
            1.5,
            "07:30–09:00",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Weekly Reset + Schema & Index Trade-off Design Mock Review",
            "15-min next-week plan + 45-min light SQL Quick Revision recall.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "aiml",
            [
              "ml_rag_agents"
            ],
            "Sunday Lab: Udemy #5 (Cherry-Pick ~20%): HF Transformers, LoRA & QLoRA",
            "Hands-on coding/notebook consolidation for Udemy #5 (Cherry-Pick ~20%): HF Transformers, LoRA & QLoRA. Afternoon OFF after 14:00!",
            "ud_genai_hf",
            1.5,
            "12:30–14:00",
            "b2"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Sunday Active Recovery & Mobility",
            "Light stretching, mobility & easy jump-rope warm-down; full evening off for recovery.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ]
        ]
      ]
    },
    {
      "id": 21,
      "month": 6,
      "title": "Top-20 Patterns Sprint, SQL Quick Rev, MLOps CI/CD & Docker & Article #2 Full Draft",
      "focus": [
        "Top-20 DSA Patterns (1/2)",
        "SQL + DE Quick Recall",
        "Udemy #6 MLOps CI/CD & Docker"
      ],
      "practiceTag": "Udemy #6 MLOps Start • CI/CD + Docker • Article #2 Draft",
      "targets": [
        {
          "id": "w21_t1",
          "track": "dsa",
          "text": "Top-20 Interview Patterns Sprint (Part 1: Sliding Window, Binary Search, Mono Stack)."
        },
        {
          "id": "w21_t2",
          "track": "sql_xplore",
          "text": "Timed Analytics SQL Mock + MySQL Quick Revision high-yield edge cases."
        },
        {
          "id": "w21_t3",
          "track": "aiml",
          "text": "Start Udemy #6 (MLOps Bootcamp): Git workflows, GitHub Actions CI/CD, Docker & Pytest for ML."
        },
        {
          "id": "w21_t4",
          "track": "client_web",
          "text": "Containerise & document your flagship AI-ML + Full-Stack projects cleanly."
        },
        {
          "id": "w21_t5",
          "track": "research_fit",
          "text": "Journal #2: assemble complete end-to-end draft & run internal review."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_search_lin"
            ],
            "Top-20 Interview Patterns Sprint (Part 1) (Set 1)",
            "Timed morning coding session focusing on top-20 interview patterns sprint (part 1).",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Analytics SQL Timed Mock + Quick Rev Sweep",
            "Timed 40m SQL mock + review window frame edge cases.",
            "sql_rev",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Assemble Complete Draft & Internal Critique",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "ml_ops"
            ],
            "Flex: ML System Design Framing Drills",
            "Practise problem framing, offline vs online metrics & leakage checks.",
            "mlops_guide",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Full-Stack + MLOps Containerisation & Docs",
            "Standardise Dockerfiles, env templates & CI badges across flagship repos. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_ops"
            ],
            "Udemy #6 (MLOps): Git CI/CD, Docker & Project Structure",
            "Modular ML packages, GitHub Actions CI/CD & multi-stage Docker images. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_mlops",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_search_lin"
            ],
            "Top-20 Interview Patterns Sprint (Part 1) (Set 2)",
            "Solve 2 medium/hard problems under interview time pressure + dry run.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Analytics SQL Timed Mock + Quick Rev Sweep (Day 2)",
            "Timed 40m SQL mock + review window frame edge cases.",
            "sql_rev",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Assemble Complete Draft & Internal Critique (Session 2)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "ml_ops"
            ],
            "Flex: ML System Design Framing Drills",
            "Practise problem framing, offline vs online metrics & leakage checks.",
            "mlops_guide",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Full-Stack + MLOps Containerisation & Docs",
            "Standardise Dockerfiles, env templates & CI badges across flagship repos. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_delivery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Full-Stack + MLOps Containerisation & Docs — OR slot Peer Review #2 here once authors fulfill requirements.",
            "hr_guide",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_ops"
            ],
            "Udemy #6 (MLOps): Git CI/CD, Docker & Project Structure",
            "Modular ML packages, GitHub Actions CI/CD & multi-stage Docker images. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_mlops",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_search_lin"
            ],
            "Top-20 Interview Patterns Sprint (Part 1) (Set 3)",
            "Complexity & edge-case drill; convert brute force to optimal.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Analytics SQL Timed Mock + Quick Rev Sweep (Day 3)",
            "Timed 40m SQL mock + review window frame edge cases.",
            "sql_rev",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Assemble Complete Draft & Internal Critique (Session 3)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "ml_ops"
            ],
            "Flex: ML System Design Framing Drills",
            "Practise problem framing, offline vs online metrics & leakage checks.",
            "mlops_guide",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Full-Stack + MLOps Containerisation & Docs",
            "Standardise Dockerfiles, env templates & CI badges across flagship repos. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_ops"
            ],
            "Udemy #6 (MLOps): Git CI/CD, Docker & Project Structure",
            "Modular ML packages, GitHub Actions CI/CD & multi-stage Docker images. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_mlops",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_search_lin"
            ],
            "Top-20 Interview Patterns Sprint (Part 1) (Set 4)",
            "Timed 2-problem check + write clean invariants from scratch.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Analytics SQL Timed Mock + Quick Rev Sweep (Day 4)",
            "Timed 40m SQL mock + review window frame edge cases.",
            "sql_rev",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Assemble Complete Draft & Internal Critique (Session 4)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "ml_ops"
            ],
            "Flex: ML System Design Framing Drills",
            "Practise problem framing, offline vs online metrics & leakage checks.",
            "mlops_guide",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Full-Stack + MLOps Containerisation & Docs",
            "Standardise Dockerfiles, env templates & CI badges across flagship repos. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_delivery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Full-Stack + MLOps Containerisation & Docs — OR slot Peer Review #2 here once authors fulfill requirements.",
            "hr_guide",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_ops"
            ],
            "Udemy #6 (MLOps): Git CI/CD, Docker & Project Structure",
            "Modular ML packages, GitHub Actions CI/CD & multi-stage Docker images. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_mlops",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_search_lin"
            ],
            "Top-20 Interview Patterns Sprint (Part 1) (Set 5)",
            "Mixed pattern consolidation & Redo Queue sweep.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Analytics SQL Timed Mock + Quick Rev Sweep (Day 5)",
            "Timed 40m SQL mock + review window frame edge cases.",
            "sql_rev",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Assemble Complete Draft & Internal Critique (Session 5)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "ml_ops"
            ],
            "Flex: ML System Design Framing Drills",
            "Practise problem framing, offline vs online metrics & leakage checks.",
            "mlops_guide",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Full-Stack + MLOps Containerisation & Docs",
            "Standardise Dockerfiles, env templates & CI badges across flagship repos. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_ops"
            ],
            "Udemy #6 (MLOps): Git CI/CD, Docker & Project Structure",
            "Modular ML packages, GitHub Actions CI/CD & multi-stage Docker images. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_mlops",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_search_lin"
            ],
            "Sat Timed Check: Top-20 Interview Patterns Sprint (Part 1)",
            "Full 90-min timed simulation covering Week 21 patterns.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Analytics SQL Timed Mock + Quick Rev Sweep (Day 6)",
            "Timed 40m SQL mock + review window frame edge cases.",
            "sql_rev",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Assemble Complete Draft & Internal Critique (Session 6)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Full-Stack + MLOps Containerisation & Docs",
            "Standardise Dockerfiles, env templates & CI badges across flagship repos. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "aiml",
            [
              "ml_ops"
            ],
            "Udemy #6 (MLOps): Git CI/CD, Docker & Project Structure",
            "Modular ML packages, GitHub Actions CI/CD & multi-stage Docker images. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_mlops",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_search_lin"
            ],
            "Sun Light Review: Wk 21 Error Log",
            "Audit Week 21 error log & re-solve 1 tricky Redo problem.",
            "py_rev",
            1.5,
            "07:30–09:00",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Weekly Reset + Analytics SQL Timed Mock + Quick Rev Sweep Review",
            "15-min next-week plan + 45-min light SQL Quick Revision recall.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "aiml",
            [
              "ml_ops"
            ],
            "Sunday Lab: Udemy #6 (MLOps): Git CI/CD, Docker & Project Structure",
            "Hands-on coding/notebook consolidation for Udemy #6 (MLOps): Git CI/CD, Docker & Project Structure. Afternoon OFF after 14:00!",
            "ud_mlops",
            1.5,
            "12:30–14:00",
            "b2"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Sunday Active Recovery & Mobility",
            "Light stretching, mobility & easy jump-rope warm-down; full evening off for recovery.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ]
        ]
      ]
    },
    {
      "id": 22,
      "month": 6,
      "title": "Top-20 Patterns (Trees/DP), SQL Hard Mock, MLOps MLflow/DVC/FastAPI & Project 1",
      "focus": [
        "Top-20 DSA Patterns (2/2)",
        "Hard SQL Interview Mock",
        "Udemy #6 MLflow, DVC & FastAPI"
      ],
      "practiceTag": "MLflow + DVC + FastAPI • MLOps Project #1",
      "targets": [
        {
          "id": "w22_t1",
          "track": "dsa",
          "text": "Top-20 Interview Patterns Sprint (Part 2: Trees, Graphs, Dijkstra/DSU, DP)."
        },
        {
          "id": "w22_t2",
          "track": "sql_xplore",
          "text": "Hard Analytics SQL Timed Mock (45m, 3 multi-CTE window queries + EXPLAIN)."
        },
        {
          "id": "w22_t3",
          "track": "aiml",
          "text": "Udemy #6: Experiment tracking with MLflow, data versioning (DVC) & FastAPI inference API."
        },
        {
          "id": "w22_t4",
          "track": "client_web",
          "text": "Resume & STAR stories (Freelancing Project impact + AI-ML research + MLOps)."
        },
        {
          "id": "w22_t5",
          "track": "research_fit",
          "text": "Journal #2: refine figures, equations, limitations & ethics/reproducibility notes."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Top-20 Interview Patterns Sprint (Part 2) (Set 1)",
            "Timed morning coding session focusing on top-20 interview patterns sprint (part 2).",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Hard SQL Interview Mock (3 Multi-CTE Queries)",
            "45m hard SQL simulation + EXPLAIN verification.",
            "dsi_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Refine Figures, Equations & Reproducibility",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "ml_ops"
            ],
            "Flex: MLOps Testing (Pandera & Pytest)",
            "Write schema validation & model regression tests.",
            "mlops_guide",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Resume, GitHub Pinning & STAR Impact Bullets",
            "Quantify Freelancing Project, Research & AI-ML engineering outcomes for interviews. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_ops"
            ],
            "Udemy #6 (MLOps): MLflow, DVC & FastAPI Serving",
            "Experiment/model registry, DVC data tracking & FastAPI + Pydantic endpoints. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_mlops",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Top-20 Interview Patterns Sprint (Part 2) (Set 2)",
            "Solve 2 medium/hard problems under interview time pressure + dry run.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Hard SQL Interview Mock (3 Multi-CTE Queries) (Day 2)",
            "45m hard SQL simulation + EXPLAIN verification.",
            "dsi_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Refine Figures, Equations & Reproducibility (Session 2)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "ml_ops"
            ],
            "Flex: MLOps Testing (Pandera & Pytest)",
            "Write schema validation & model regression tests.",
            "mlops_guide",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Resume, GitHub Pinning & STAR Impact Bullets",
            "Quantify Freelancing Project, Research & AI-ML engineering outcomes for interviews. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_delivery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Resume, GitHub Pinning & STAR Impact Bullets — OR slot Peer Review #2 here once authors fulfill requirements.",
            "hr_guide",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_ops"
            ],
            "Udemy #6 (MLOps): MLflow, DVC & FastAPI Serving",
            "Experiment/model registry, DVC data tracking & FastAPI + Pydantic endpoints. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_mlops",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Top-20 Interview Patterns Sprint (Part 2) (Set 3)",
            "Complexity & edge-case drill; convert brute force to optimal.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Hard SQL Interview Mock (3 Multi-CTE Queries) (Day 3)",
            "45m hard SQL simulation + EXPLAIN verification.",
            "dsi_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Refine Figures, Equations & Reproducibility (Session 3)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "ml_ops"
            ],
            "Flex: MLOps Testing (Pandera & Pytest)",
            "Write schema validation & model regression tests.",
            "mlops_guide",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Resume, GitHub Pinning & STAR Impact Bullets",
            "Quantify Freelancing Project, Research & AI-ML engineering outcomes for interviews. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_ops"
            ],
            "Udemy #6 (MLOps): MLflow, DVC & FastAPI Serving",
            "Experiment/model registry, DVC data tracking & FastAPI + Pydantic endpoints. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_mlops",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Top-20 Interview Patterns Sprint (Part 2) (Set 4)",
            "Timed 2-problem check + write clean invariants from scratch.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Hard SQL Interview Mock (3 Multi-CTE Queries) (Day 4)",
            "45m hard SQL simulation + EXPLAIN verification.",
            "dsi_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Refine Figures, Equations & Reproducibility (Session 4)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "ml_ops"
            ],
            "Flex: MLOps Testing (Pandera & Pytest)",
            "Write schema validation & model regression tests.",
            "mlops_guide",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Resume, GitHub Pinning & STAR Impact Bullets",
            "Quantify Freelancing Project, Research & AI-ML engineering outcomes for interviews. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_delivery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Resume, GitHub Pinning & STAR Impact Bullets — OR slot Peer Review #2 here once authors fulfill requirements.",
            "hr_guide",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_ops"
            ],
            "Udemy #6 (MLOps): MLflow, DVC & FastAPI Serving",
            "Experiment/model registry, DVC data tracking & FastAPI + Pydantic endpoints. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_mlops",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Top-20 Interview Patterns Sprint (Part 2) (Set 5)",
            "Mixed pattern consolidation & Redo Queue sweep.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Hard SQL Interview Mock (3 Multi-CTE Queries) (Day 5)",
            "45m hard SQL simulation + EXPLAIN verification.",
            "dsi_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Refine Figures, Equations & Reproducibility (Session 5)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "ml_ops"
            ],
            "Flex: MLOps Testing (Pandera & Pytest)",
            "Write schema validation & model regression tests.",
            "mlops_guide",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Resume, GitHub Pinning & STAR Impact Bullets",
            "Quantify Freelancing Project, Research & AI-ML engineering outcomes for interviews. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_ops"
            ],
            "Udemy #6 (MLOps): MLflow, DVC & FastAPI Serving",
            "Experiment/model registry, DVC data tracking & FastAPI + Pydantic endpoints. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_mlops",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Sat Timed Check: Top-20 Interview Patterns Sprint (Part 2)",
            "Full 90-min timed simulation covering Week 22 patterns.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Hard SQL Interview Mock (3 Multi-CTE Queries) (Day 6)",
            "45m hard SQL simulation + EXPLAIN verification.",
            "dsi_prac",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Refine Figures, Equations & Reproducibility (Session 6)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Resume, GitHub Pinning & STAR Impact Bullets",
            "Quantify Freelancing Project, Research & AI-ML engineering outcomes for interviews. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "aiml",
            [
              "ml_ops"
            ],
            "Udemy #6 (MLOps): MLflow, DVC & FastAPI Serving",
            "Experiment/model registry, DVC data tracking & FastAPI + Pydantic endpoints. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_mlops",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Sun Light Review: Wk 22 Error Log",
            "Audit Week 22 error log & re-solve 1 tricky Redo problem.",
            "py_rev",
            1.5,
            "07:30–09:00",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Weekly Reset + Hard SQL Interview Mock (3 Multi-CTE Queries) Review",
            "15-min next-week plan + 45-min light SQL Quick Revision recall.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "aiml",
            [
              "ml_ops"
            ],
            "Sunday Lab: Udemy #6 (MLOps): MLflow, DVC & FastAPI Serving",
            "Hands-on coding/notebook consolidation for Udemy #6 (MLOps): MLflow, DVC & FastAPI Serving. Afternoon OFF after 14:00!",
            "ud_mlops",
            1.5,
            "12:30–14:00",
            "b2"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Sunday Active Recovery & Mobility",
            "Light stretching, mobility & easy jump-rope warm-down; full evening off for recovery.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ]
        ]
      ]
    },
    {
      "id": 23,
      "month": 6,
      "title": "Workbook Final Rounds, SQL Schema Mock, MLOps Cloud/Drift & Project #2",
      "focus": [
        "Mock Workbook Rounds 13–18",
        "Final SQL Trade-off Check",
        "Udemy #6 Cloud Deploy & Drift"
      ],
      "practiceTag": "MLOps Cloud + Monitoring • MLOps Project #2 • Mock Loops",
      "targets": [
        {
          "id": "w23_t1",
          "track": "dsa",
          "text": "Mock Interview Loops Workbook Rounds 13–18 (timed coding + live complexity defence)."
        },
        {
          "id": "w23_t2",
          "track": "sql_xplore",
          "text": "Final SQL & Data Engineering trade-off recall (isolation, sharding, Parquet)."
        },
        {
          "id": "w23_t3",
          "track": "aiml",
          "text": "Udemy #6: Cloud deployment, Prometheus/Grafana/Evidently drift monitoring + Project #2."
        },
        {
          "id": "w23_t4",
          "track": "client_web",
          "text": "Mock technical + HR behavioural round using HR Guide & Freelancing Project leadership stories."
        },
        {
          "id": "w23_t5",
          "track": "research_fit",
          "text": "Journal #2: co-author/peer polish pass & formatting check."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Mock Interview Workbook Final Rounds (13–18) (Set 1)",
            "Timed morning coding session focusing on mock interview workbook final rounds (13–18).",
            "mock_work",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Final SQL & Data Engineering Trade-off Recall",
            "Review ACID isolation, B+Tree selectivity & columnar analytics.",
            "de_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Co-Author / Peer Polish & Formatting Check",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "client_delivery"
            ],
            "Flex: Mock Behavioural & Resume Walkthrough",
            "Refine STAR answers for Freelancing Project, Research & AI-ML engineering.",
            "hr_guide",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Mock Technical + HR Behavioural Storytelling Round",
            "Rehearse 2-min Freelancing Project architecture pitch & research defence. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_ops"
            ],
            "Udemy #6 (MLOps): Cloud Deploy, Drift Monitoring & Proj #2",
            "AWS/Cloud deployment, Evidently/Prometheus drift & 2nd E2E MLOps project. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_mlops",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Mock Interview Workbook Final Rounds (13–18) (Set 2)",
            "Solve 2 medium/hard problems under interview time pressure + dry run.",
            "mock_work",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Final SQL & Data Engineering Trade-off Recall (Day 2)",
            "Review ACID isolation, B+Tree selectivity & columnar analytics.",
            "de_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Co-Author / Peer Polish & Formatting Check (Session 2)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "client_delivery"
            ],
            "Flex: Mock Behavioural & Resume Walkthrough",
            "Refine STAR answers for Freelancing Project, Research & AI-ML engineering.",
            "hr_guide",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Mock Technical + HR Behavioural Storytelling Round",
            "Rehearse 2-min Freelancing Project architecture pitch & research defence. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_delivery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Mock Technical + HR Behavioural Storytelling Round — OR slot Peer Review #2 here once authors fulfill requirements.",
            "hr_guide",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_ops"
            ],
            "Udemy #6 (MLOps): Cloud Deploy, Drift Monitoring & Proj #2",
            "AWS/Cloud deployment, Evidently/Prometheus drift & 2nd E2E MLOps project. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_mlops",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Mock Interview Workbook Final Rounds (13–18) (Set 3)",
            "Complexity & edge-case drill; convert brute force to optimal.",
            "mock_work",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Final SQL & Data Engineering Trade-off Recall (Day 3)",
            "Review ACID isolation, B+Tree selectivity & columnar analytics.",
            "de_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Co-Author / Peer Polish & Formatting Check (Session 3)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "client_delivery"
            ],
            "Flex: Mock Behavioural & Resume Walkthrough",
            "Refine STAR answers for Freelancing Project, Research & AI-ML engineering.",
            "hr_guide",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Mock Technical + HR Behavioural Storytelling Round",
            "Rehearse 2-min Freelancing Project architecture pitch & research defence. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_ops"
            ],
            "Udemy #6 (MLOps): Cloud Deploy, Drift Monitoring & Proj #2",
            "AWS/Cloud deployment, Evidently/Prometheus drift & 2nd E2E MLOps project. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_mlops",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Mock Interview Workbook Final Rounds (13–18) (Set 4)",
            "Timed 2-problem check + write clean invariants from scratch.",
            "mock_work",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Final SQL & Data Engineering Trade-off Recall (Day 4)",
            "Review ACID isolation, B+Tree selectivity & columnar analytics.",
            "de_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Co-Author / Peer Polish & Formatting Check (Session 4)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "client_delivery"
            ],
            "Flex: Mock Behavioural & Resume Walkthrough",
            "Refine STAR answers for Freelancing Project, Research & AI-ML engineering.",
            "hr_guide",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Mock Technical + HR Behavioural Storytelling Round",
            "Rehearse 2-min Freelancing Project architecture pitch & research defence. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_delivery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Mock Technical + HR Behavioural Storytelling Round — OR slot Peer Review #2 here once authors fulfill requirements.",
            "hr_guide",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_ops"
            ],
            "Udemy #6 (MLOps): Cloud Deploy, Drift Monitoring & Proj #2",
            "AWS/Cloud deployment, Evidently/Prometheus drift & 2nd E2E MLOps project. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_mlops",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Mock Interview Workbook Final Rounds (13–18) (Set 5)",
            "Mixed pattern consolidation & Redo Queue sweep.",
            "mock_work",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Final SQL & Data Engineering Trade-off Recall (Day 5)",
            "Review ACID isolation, B+Tree selectivity & columnar analytics.",
            "de_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Co-Author / Peer Polish & Formatting Check (Session 5)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "client_delivery"
            ],
            "Flex: Mock Behavioural & Resume Walkthrough",
            "Refine STAR answers for Freelancing Project, Research & AI-ML engineering.",
            "hr_guide",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Mock Technical + HR Behavioural Storytelling Round",
            "Rehearse 2-min Freelancing Project architecture pitch & research defence. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_ops"
            ],
            "Udemy #6 (MLOps): Cloud Deploy, Drift Monitoring & Proj #2",
            "AWS/Cloud deployment, Evidently/Prometheus drift & 2nd E2E MLOps project. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_mlops",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Sat Timed Check: Mock Interview Workbook Final Rounds (13–18)",
            "Full 90-min timed simulation covering Week 23 patterns.",
            "mock_work",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Final SQL & Data Engineering Trade-off Recall (Day 6)",
            "Review ACID isolation, B+Tree selectivity & columnar analytics.",
            "de_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Co-Author / Peer Polish & Formatting Check (Session 6)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Mock Technical + HR Behavioural Storytelling Round",
            "Rehearse 2-min Freelancing Project architecture pitch & research defence. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "aiml",
            [
              "ml_ops"
            ],
            "Udemy #6 (MLOps): Cloud Deploy, Drift Monitoring & Proj #2",
            "AWS/Cloud deployment, Evidently/Prometheus drift & 2nd E2E MLOps project. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_mlops",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Sun Light Review: Wk 23 Error Log",
            "Audit Week 23 error log & re-solve 1 tricky Redo problem.",
            "py_rev",
            1.5,
            "07:30–09:00",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Weekly Reset + Final SQL & Data Engineering Trade-off Recall Review",
            "15-min next-week plan + 45-min light SQL Quick Revision recall.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "aiml",
            [
              "ml_ops"
            ],
            "Sunday Lab: Udemy #6 (MLOps): Cloud Deploy, Drift Monitoring & Proj #2",
            "Hands-on coding/notebook consolidation for Udemy #6 (MLOps): Cloud Deploy, Drift Monitoring & Proj #2. Afternoon OFF after 14:00!",
            "ud_mlops",
            1.5,
            "12:30–14:00",
            "b2"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Sunday Active Recovery & Mobility",
            "Light stretching, mobility & easy jump-rope warm-down; full evening off for recovery.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ]
        ]
      ]
    },
    {
      "id": 24,
      "month": 6,
      "title": "Capstone: Zero Redo Queue, MLOps Finish (~60%), Portfolio Polish & Article #2 Ready",
      "focus": [
        "Zero Redo + 13p Rev",
        "SQL Capstone Check",
        "Udemy #6 Complete (~60%)"
      ],
      "practiceTag": "24-Week Capstone • All Core Tracks Complete • Ready for Roles",
      "targets": [
        {
          "id": "w24_t1",
          "track": "dsa",
          "text": "Zero out Redo Queue, final pass of 13p Python Quick Revision & Rounds 19–20."
        },
        {
          "id": "w24_t2",
          "track": "sql_xplore",
          "text": "Final 30m SQL Quick Revision sweep + confirm 100% of Phase 1–2 SQL goals."
        },
        {
          "id": "w24_t3",
          "track": "aiml",
          "text": "Finish Udemy #6 (~60% + 2–3 E2E MLOps projects) & publish clean GitHub READMEs."
        },
        {
          "id": "w24_t4",
          "track": "client_web",
          "text": "Final portfolio, GitHub, resume & freelance showcase audit."
        },
        {
          "id": "w24_t5",
          "track": "research_fit",
          "text": "Journal #2 submission-ready! Full 24-week retrospective & next-quarter plan."
        }
      ],
      "days": [
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Capstone: Rounds 19–20, 13p Rev & Zero Redo (Set 1)",
            "Timed morning coding session focusing on capstone: rounds 19–20, 13p rev & zero redo.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Capstone SQL Sweep & 100% Verification",
            "Final 30m SQL Quick Revision pass & confirm Phase 1–2 completion.",
            "sql_rev",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Submission-Ready Package & Retro",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "client_delivery"
            ],
            "Flex: Final Portfolio & Backlog Zero-Out",
            "Clean GitHub READMEs, verify links & close any remaining notes.",
            "hr_guide",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Final Portfolio, Freelance & Career Assets Audit",
            "Verify every deployed URL, GitHub repo & resume link is crisp. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_ops"
            ],
            "Udemy #6 Wrap (~60% + 2–3 E2E Projects Complete)",
            "Polish MLOps capstone repo & skip repetitive remaining template projects. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_mlops",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Capstone: Rounds 19–20, 13p Rev & Zero Redo (Set 2)",
            "Solve 2 medium/hard problems under interview time pressure + dry run.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Capstone SQL Sweep & 100% Verification (Day 2)",
            "Final 30m SQL Quick Revision pass & confirm Phase 1–2 completion.",
            "sql_rev",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Submission-Ready Package & Retro (Session 2)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "client_delivery"
            ],
            "Flex: Final Portfolio & Backlog Zero-Out",
            "Clean GitHub READMEs, verify links & close any remaining notes.",
            "hr_guide",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Final Portfolio, Freelance & Career Assets Audit",
            "Verify every deployed URL, GitHub repo & resume link is crisp. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_delivery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Final Portfolio, Freelance & Career Assets Audit — OR slot Peer Review #2 here once authors fulfill requirements.",
            "hr_guide",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_ops"
            ],
            "Udemy #6 Wrap (~60% + 2–3 E2E Projects Complete)",
            "Polish MLOps capstone repo & skip repetitive remaining template projects. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_mlops",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Capstone: Rounds 19–20, 13p Rev & Zero Redo (Set 3)",
            "Complexity & edge-case drill; convert brute force to optimal.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Capstone SQL Sweep & 100% Verification (Day 3)",
            "Final 30m SQL Quick Revision pass & confirm Phase 1–2 completion.",
            "sql_rev",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Submission-Ready Package & Retro (Session 3)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "client_delivery"
            ],
            "Flex: Final Portfolio & Backlog Zero-Out",
            "Clean GitHub READMEs, verify links & close any remaining notes.",
            "hr_guide",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Final Portfolio, Freelance & Career Assets Audit",
            "Verify every deployed URL, GitHub repo & resume link is crisp. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_ops"
            ],
            "Udemy #6 Wrap (~60% + 2–3 E2E Projects Complete)",
            "Polish MLOps capstone repo & skip repetitive remaining template projects. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_mlops",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Capstone: Rounds 19–20, 13p Rev & Zero Redo (Set 4)",
            "Timed 2-problem check + write clean invariants from scratch.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Capstone SQL Sweep & 100% Verification (Day 4)",
            "Final 30m SQL Quick Revision pass & confirm Phase 1–2 completion.",
            "sql_rev",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Submission-Ready Package & Retro (Session 4)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "client_delivery"
            ],
            "Flex: Final Portfolio & Backlog Zero-Out",
            "Clean GitHub READMEs, verify links & close any remaining notes.",
            "hr_guide",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Final Portfolio, Freelance & Career Assets Audit",
            "Verify every deployed URL, GitHub repo & resume link is crisp. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "client_web",
            [
              "client_delivery",
              "res_reviews"
            ],
            "Evening Build / Peer Review #2 Buffer",
            "Advance Final Portfolio, Freelance & Career Assets Audit — OR slot Peer Review #2 here once authors fulfill requirements.",
            "hr_guide",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_ops"
            ],
            "Udemy #6 Wrap (~60% + 2–3 E2E Projects Complete)",
            "Polish MLOps capstone repo & skip repetitive remaining template projects. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_mlops",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Capstone: Rounds 19–20, 13p Rev & Zero Redo (Set 5)",
            "Mixed pattern consolidation & Redo Queue sweep.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Capstone SQL Sweep & 100% Verification (Day 5)",
            "Final 30m SQL Quick Revision pass & confirm Phase 1–2 completion.",
            "sql_rev",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Submission-Ready Package & Retro (Session 5)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "sql_xplore",
            [
              "client_delivery"
            ],
            "Flex: Final Portfolio & Backlog Zero-Out",
            "Clean GitHub READMEs, verify links & close any remaining notes.",
            "hr_guide",
            1.25,
            "15:00–16:15",
            "b3"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Final Portfolio, Freelance & Career Assets Audit",
            "Verify every deployed URL, GitHub repo & resume link is crisp. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Evening Research Push: Journal #2",
            "Continue experiments, statistical checks or manuscript drafting from afternoon block.",
            "res_j2",
            1.5,
            "20:45–22:15",
            "b5"
          ],
          [
            "aiml",
            [
              "ml_ops"
            ],
            "Udemy #6 Wrap (~60% + 2–3 E2E Projects Complete)",
            "Polish MLOps capstone repo & skip repetitive remaining template projects. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_mlops",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Sat Timed Check: Capstone: Rounds 19–20, 13p Rev & Zero Redo",
            "Full 90-min timed simulation covering Week 24 patterns.",
            "py_rev",
            1.75,
            "07:30–09:15",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Capstone SQL Sweep & 100% Verification (Day 6)",
            "Final 30m SQL Quick Revision pass & confirm Phase 1–2 completion.",
            "sql_rev",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "research_fit",
            [
              "res_article2"
            ],
            "Journal #2: Submission-Ready Package & Retro (Session 6)",
            "Protected deep-focus research block (experiments, figures or manuscript writing).",
            "res_j2",
            2,
            "12:30–14:30",
            "b2"
          ],
          [
            "client_web",
            [
              "client_delivery"
            ],
            "Final Portfolio, Freelance & Career Assets Audit",
            "Verify every deployed URL, GitHub repo & resume link is crisp. (Primary client call window — use Client Swap if meeting hits 07:30 or 12:30).",
            "hr_guide",
            2,
            "17:30–19:30",
            "b4"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Daily Conditioning: Jump Rope & Bodyweight",
            "45-min circuit: heavy jump rope intervals + push-ups, sit-ups & squats (19:30–20:15) + 30m rest.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ],
          [
            "aiml",
            [
              "ml_ops"
            ],
            "Udemy #6 Wrap (~60% + 2–3 E2E Projects Complete)",
            "Polish MLOps capstone repo & skip repetitive remaining template projects. Wrap at 23:55 with 5-min next-day plan; lights out 00:00.",
            "ud_mlops",
            1.15,
            "22:45–23:55",
            "b6"
          ]
        ],
        [
          [
            "dsa",
            [
              "dsa_dp_mocks"
            ],
            "Sun Light Review: Wk 24 Error Log",
            "Audit Week 24 error log & re-solve 1 tricky Redo problem.",
            "py_rev",
            1.5,
            "07:30–09:00",
            "b1a"
          ],
          [
            "sql_xplore",
            [
              "sql_analytics"
            ],
            "Weekly Reset + Capstone SQL Sweep & 100% Verification Review",
            "15-min next-week plan + 45-min light SQL Quick Revision recall.",
            "sql_guide",
            1,
            "09:30–10:30",
            "b1b"
          ],
          [
            "aiml",
            [
              "ml_ops"
            ],
            "Sunday Lab: Udemy #6 Wrap (~60% + 2–3 E2E Projects Complete)",
            "Hands-on coding/notebook consolidation for Udemy #6 Wrap (~60% + 2–3 E2E Projects Complete). Afternoon OFF after 14:00!",
            "ud_mlops",
            1.5,
            "12:30–14:00",
            "b2"
          ],
          [
            "research_fit",
            [
              "fit_daily"
            ],
            "Sunday Active Recovery & Mobility",
            "Light stretching, mobility & easy jump-rope warm-down; full evening off for recovery.",
            "fit_daily",
            0.75,
            "19:30–20:15",
            "workout"
          ]
        ]
      ]
    }
  ]
});
})();
