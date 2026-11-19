(function () {
  "use strict";
  window.TrackerShared.registerTracker({
    id: "aptitude",
    storageKey: "placement_aptitude_tracker_v1",
    taskIdPrefix: "a",
    startDateUtc: [2026,11,1],
    resourcePrefix: "../",
    backupFilePrefix: "aptitude_tracker_backup",
    hub: {
      "href": "aptitude_tracker.html",
      "badge": "Aptitude & Verbal",
      "headerPill": "TCS NQT Aptitude Track",
      "slot": 3,
      "title": "TCS NQT Aptitude, Reasoning & Verbal",
      "timeline": "1 Dec 2026 – 22 Feb 2027 • 3 Months / 12 Weeks",
      "scope": "11 Quant Chapters (50-50-50 E/M/H), 20 Quant Mixed Sets, Reasoning & Adv Quant Guide (7 Ch.), 3 NQT Mocks, 7 Verbal Topics & 6 Mixed Sets."
    },
    header: {
      "pageTitle": "TCS NQT Aptitude, Reasoning & Verbal Tracker (12 Weeks)",
      "title": "TCS NQT & Placement Aptitude Mastery Tracker",
      "subtitle": "All 11 Quant Chapters (50-50-50 E/M/H) • 20 Quant Mixed Sets • 7 Adv Quant & Reasoning Chapters • 3 Timed NQT Mocks • 7 Verbal Topics & 6 Mixed Sets",
      "timelineBadge": "1 Dec 2026 – 22 Feb 2027 (12 Weeks / 84 Days)"
    },
    tracks: [
      {
        "key": "quant",
        "slot": 1,
        "label": "Quant",
        "headerBadge": "Quantitative Aptitude (31 PDFs)",
        "kpiTitle": "Quantitative",
        "kpiSub": "Ch.01–11 + 20 Mixed Sets",
        "skillGroupTitle": "Quantitative Aptitude Skills (8)",
        "svgLabel": "Quantitative (8 Skills)",
        "libraryHeading": "Quantitative Chapters (11) & Mixed Sets (20)"
      },
      {
        "key": "reason",
        "slot": 2,
        "label": "Reasoning & Mocks",
        "headerBadge": "Reasoning & NQT Mocks",
        "kpiTitle": "Reasoning & Mocks",
        "kpiSub": "Adv Quant + 3 Timed NQT Mocks",
        "skillGroupTitle": "Reasoning & Exam Execution Skills (4)",
        "svgLabel": "Reasoning & Mocks (4 Skills)",
        "libraryHeading": "Reasoning & Adv Quant Guide + NQT Mocks (2)"
      },
      {
        "key": "verbal",
        "slot": 3,
        "label": "Verbal",
        "headerBadge": "Verbal Ability (13 PDFs)",
        "kpiTitle": "Verbal Ability",
        "kpiSub": "Topics 01–07 + 6 Mixed Sets",
        "skillGroupTitle": "Verbal Ability Skills (6)",
        "svgLabel": "Verbal Ability (6 Skills)",
        "libraryHeading": "Verbal Topics (7) & Mixed Sets (6)"
      }
    ],
    phases: [
      {
        "id": 1,
        "minWeek": 1,
        "maxWeek": 12,
        "chipColor": "var(--primary)",
        "dailyLabel": "TCS NQT Aptitude Sprint (12 Weeks)",
        "heading": "TCS NQT Aptitude Sprint (Weeks 1–12)",
        "subtitle": "1 Dec 2026 – 22 Feb 2027 • 11 Quant Chapters, 20 Mixed Sets, Reasoning Guide, 3 Mocks & Verbal"
      }
    ],
    ui: {
      "searchPlaceholder": "Search Ch.01, Mock 2, Mixed 14, Syllogism, RC...",
      "monthlyTabLabel": "Monthly Targets (3m)",
      "monthlyTargetsHeading": "Monthly Mastery Gates",
      "skillsKpiSub": "18 NQT aptitude skills",
      "skillsMatrixTitle": "Skill-Wise Acquisition Matrix (18 Aptitude Skills)",
      "skillsChartAriaLabel": "Aptitude Competency Summary",
      "skillsChartCombinedLabel": "Combined Aptitude (18 Skills)",
      "noteLabel": "Mock Score / Speed Note:",
      "notePlaceholder": "Log timing (e.g. 42/50 in 36m), shortcut trick or grammar rule for Day {dayNum}...",
      "notesPanelTitle": "Mock Scores & Daily Notes",
      "notesPanelDesc": "Timed section scores & shortcut notes entered on Day cards appear here.",
      "notesEmptyText": "No notes logged yet. Record timed mock scores or shortcut tricks on any Day card.",
      "redoDesc": "Any set/topic marked ~ Redo lands here with its 7-day target date.",
      "redoEmptyText": "Redo queue empty. Flag tricky sets with ~ Redo to track weak spots.",
      "libraryTitle": "Aptitude & Verbal Library",
      "exportTitle": "Export Aptitude Progress JSON",
      "exportDesc": "Copy or download your Aptitude/Reasoning/Verbal snapshot.",
      "importTitle": "Import Aptitude Progress JSON",
      "resetToast": "Aptitude progress reset cleanly.",
      "weekChipMinWidth": "84px"
    },
    resources: {
      "q_01": {
        "title": "Quant Ch.01: Simplification (50-50-50 NQT)",
        "path": "01_Quantitative_Aptitude/01_Chapter_Wise/01_Simplification.pdf",
        "track": "quant"
      },
      "q_02": {
        "title": "Quant Ch.02: Percentage (150 Qs)",
        "path": "01_Quantitative_Aptitude/01_Chapter_Wise/02_Percentage.pdf",
        "track": "quant"
      },
      "q_03": {
        "title": "Quant Ch.03: Ratio & Proportion (150 Qs)",
        "path": "01_Quantitative_Aptitude/01_Chapter_Wise/03_Ratio_and_Proportion.pdf",
        "track": "quant"
      },
      "q_04": {
        "title": "Quant Ch.04: Average (150 Qs)",
        "path": "01_Quantitative_Aptitude/01_Chapter_Wise/04_Average.pdf",
        "track": "quant"
      },
      "q_05": {
        "title": "Quant Ch.05: Profit & Loss (150 Qs)",
        "path": "01_Quantitative_Aptitude/01_Chapter_Wise/05_Profit_and_Loss.pdf",
        "track": "quant"
      },
      "q_06": {
        "title": "Quant Ch.06: Time & Work (150 Qs)",
        "path": "01_Quantitative_Aptitude/01_Chapter_Wise/06_Time_and_Work.pdf",
        "track": "quant"
      },
      "q_07": {
        "title": "Quant Ch.07: Distance, Speed & Time (150 Qs)",
        "path": "01_Quantitative_Aptitude/01_Chapter_Wise/07_Distance_Speed_and_Time.pdf",
        "track": "quant"
      },
      "q_08": {
        "title": "Quant Ch.08: Boats & Streams (150 Qs)",
        "path": "01_Quantitative_Aptitude/01_Chapter_Wise/08_Boats_and_Streams.pdf",
        "track": "quant"
      },
      "q_09": {
        "title": "Quant Ch.09: Elementary Statistics (150 Qs)",
        "path": "01_Quantitative_Aptitude/01_Chapter_Wise/09_Elementary_Statistics.pdf",
        "track": "quant"
      },
      "q_10": {
        "title": "Quant Ch.10: Mensuration & Geometry (150 Qs)",
        "path": "01_Quantitative_Aptitude/01_Chapter_Wise/10_Mensuration_and_Geometry.pdf",
        "track": "quant"
      },
      "q_11": {
        "title": "Quant Ch.11: Data Interpretation (150 Qs)",
        "path": "01_Quantitative_Aptitude/01_Chapter_Wise/11_Data_Interpretation.pdf",
        "track": "quant"
      },
      "qm_01": {
        "title": "Quant Mixed Set 01 (150 Qs)",
        "path": "01_Quantitative_Aptitude/02_Mixed_Sets/01_Mixed_Set.pdf",
        "track": "quant"
      },
      "qm_02": {
        "title": "Quant Mixed Set 02 (150 Qs)",
        "path": "01_Quantitative_Aptitude/02_Mixed_Sets/02_Mixed_Set.pdf",
        "track": "quant"
      },
      "qm_03": {
        "title": "Quant Mixed Set 03 (150 Qs)",
        "path": "01_Quantitative_Aptitude/02_Mixed_Sets/03_Mixed_Set.pdf",
        "track": "quant"
      },
      "qm_04": {
        "title": "Quant Mixed Set 04 (150 Qs)",
        "path": "01_Quantitative_Aptitude/02_Mixed_Sets/04_Mixed_Set.pdf",
        "track": "quant"
      },
      "qm_05": {
        "title": "Quant Mixed Set 05 (150 Qs)",
        "path": "01_Quantitative_Aptitude/02_Mixed_Sets/05_Mixed_Set.pdf",
        "track": "quant"
      },
      "qm_06": {
        "title": "Quant Mixed Set 06 (150 Qs)",
        "path": "01_Quantitative_Aptitude/02_Mixed_Sets/06_Mixed_Set.pdf",
        "track": "quant"
      },
      "qm_07": {
        "title": "Quant Mixed Set 07 (150 Qs)",
        "path": "01_Quantitative_Aptitude/02_Mixed_Sets/07_Mixed_Set.pdf",
        "track": "quant"
      },
      "qm_08": {
        "title": "Quant Mixed Set 08 (150 Qs)",
        "path": "01_Quantitative_Aptitude/02_Mixed_Sets/08_Mixed_Set.pdf",
        "track": "quant"
      },
      "qm_09": {
        "title": "Quant Mixed Set 09 (150 Qs)",
        "path": "01_Quantitative_Aptitude/02_Mixed_Sets/09_Mixed_Set.pdf",
        "track": "quant"
      },
      "qm_10": {
        "title": "Quant Mixed Set 10 (150 Qs)",
        "path": "01_Quantitative_Aptitude/02_Mixed_Sets/10_Mixed_Set.pdf",
        "track": "quant"
      },
      "qm_11": {
        "title": "Quant Mixed Set 11 (150 Qs)",
        "path": "01_Quantitative_Aptitude/02_Mixed_Sets/11_Mixed_Set.pdf",
        "track": "quant"
      },
      "qm_12": {
        "title": "Quant Mixed Set 12 (150 Qs)",
        "path": "01_Quantitative_Aptitude/02_Mixed_Sets/12_Mixed_Set.pdf",
        "track": "quant"
      },
      "qm_13": {
        "title": "Quant Mixed Set 13 (150 Qs)",
        "path": "01_Quantitative_Aptitude/02_Mixed_Sets/13_Mixed_Set.pdf",
        "track": "quant"
      },
      "qm_14": {
        "title": "Quant Mixed Set 14 (150 Qs)",
        "path": "01_Quantitative_Aptitude/02_Mixed_Sets/14_Mixed_Set.pdf",
        "track": "quant"
      },
      "qm_15": {
        "title": "Quant Mixed Set 15 (150 Qs)",
        "path": "01_Quantitative_Aptitude/02_Mixed_Sets/15_Mixed_Set.pdf",
        "track": "quant"
      },
      "qm_16": {
        "title": "Quant Mixed Set 16 (150 Qs)",
        "path": "01_Quantitative_Aptitude/02_Mixed_Sets/16_Mixed_Set.pdf",
        "track": "quant"
      },
      "qm_17": {
        "title": "Quant Mixed Set 17 (150 Qs)",
        "path": "01_Quantitative_Aptitude/02_Mixed_Sets/17_Mixed_Set.pdf",
        "track": "quant"
      },
      "qm_18": {
        "title": "Quant Mixed Set 18 (150 Qs)",
        "path": "01_Quantitative_Aptitude/02_Mixed_Sets/18_Mixed_Set.pdf",
        "track": "quant"
      },
      "qm_19": {
        "title": "Quant Mixed Set 19 (150 Qs)",
        "path": "01_Quantitative_Aptitude/02_Mixed_Sets/19_Mixed_Set.pdf",
        "track": "quant"
      },
      "qm_20": {
        "title": "Quant Mixed Set 20 (150 Qs)",
        "path": "01_Quantitative_Aptitude/02_Mixed_Sets/20_Mixed_Set.pdf",
        "track": "quant"
      },
      "r_guide": {
        "title": "Reasoning & Advanced Quant Guide (7 Chapters)",
        "path": "01_Quantitative_Aptitude/03_Reasoning_Advanced_Quant_and_Mocks/01_Reasoning_and_Advanced_Quant_Guide.pdf",
        "track": "reason"
      },
      "r_mocks": {
        "title": "TCS NQT Timed Mock Tests (Mocks 1–3)",
        "path": "01_Quantitative_Aptitude/03_Reasoning_Advanced_Quant_and_Mocks/02_TCS_NQT_Timed_Mock_Tests.pdf",
        "track": "reason"
      },
      "v_01": {
        "title": "Verbal 01: Words Completion (150 Qs)",
        "path": "02_Verbal_Ability/01_Topic_Wise/01_Words_Completion.pdf",
        "track": "verbal"
      },
      "v_02": {
        "title": "Verbal 02: Idioms & Phrases (150 Qs)",
        "path": "02_Verbal_Ability/01_Topic_Wise/02_Idioms_and_Phrases.pdf",
        "track": "verbal"
      },
      "v_03": {
        "title": "Verbal 03: Error Detection (150 Qs)",
        "path": "02_Verbal_Ability/01_Topic_Wise/03_Error_Detection.pdf",
        "track": "verbal"
      },
      "v_04": {
        "title": "Verbal 04: Sentence Completion (150 Qs)",
        "path": "02_Verbal_Ability/01_Topic_Wise/04_Sentence_Completion.pdf",
        "track": "verbal"
      },
      "v_05": {
        "title": "Verbal 05: Sentence Building (150 Qs)",
        "path": "02_Verbal_Ability/01_Topic_Wise/05_Sentence_Building.pdf",
        "track": "verbal"
      },
      "v_06": {
        "title": "Verbal 06: Para Jumbles (150 Qs)",
        "path": "02_Verbal_Ability/01_Topic_Wise/06_Para_Jumbles.pdf",
        "track": "verbal"
      },
      "v_07": {
        "title": "Verbal 07: Reading Comprehension (150 Qs)",
        "path": "02_Verbal_Ability/01_Topic_Wise/07_Reading_Comprehension.pdf",
        "track": "verbal"
      },
      "vm_01": {
        "title": "Verbal Mixed Set 01 (150 Qs)",
        "path": "02_Verbal_Ability/02_Mixed_Sets/01_Mixed_Set.pdf",
        "track": "verbal"
      },
      "vm_02": {
        "title": "Verbal Mixed Set 02 (150 Qs)",
        "path": "02_Verbal_Ability/02_Mixed_Sets/02_Mixed_Set.pdf",
        "track": "verbal"
      },
      "vm_03": {
        "title": "Verbal Mixed Set 03 (150 Qs)",
        "path": "02_Verbal_Ability/02_Mixed_Sets/03_Mixed_Set.pdf",
        "track": "verbal"
      },
      "vm_04": {
        "title": "Verbal Mixed Set 04 (150 Qs)",
        "path": "02_Verbal_Ability/02_Mixed_Sets/04_Mixed_Set.pdf",
        "track": "verbal"
      },
      "vm_05": {
        "title": "Verbal Mixed Set 05 (150 Qs)",
        "path": "02_Verbal_Ability/02_Mixed_Sets/05_Mixed_Set.pdf",
        "track": "verbal"
      },
      "vm_06": {
        "title": "Verbal Mixed Set 06 (150 Qs)",
        "path": "02_Verbal_Ability/02_Mixed_Sets/06_Mixed_Set.pdf",
        "track": "verbal"
      }
    },
    skills: [
      {
        "id": "q_simp",
        "track": "quant",
        "short": "Simplification & Surds",
        "name": "Simplification, Surds & Telescoping",
        "desc": "VBODMAS with 'of', recurring decimals, surd conjugates, partial-fraction telescoping, Newton identities & Sophie Germain.",
        "resources": [
          "q_01",
          "r_guide"
        ],
        "milestone": "Quant Ch.01 (150 Qs)"
      },
      {
        "id": "q_pct_pl",
        "track": "quant",
        "short": "Percentage & P&L",
        "name": "Percentage, Profit, Loss & Discounts",
        "desc": "Fraction-to-% speed conversions, successive changes, election/population models, dishonestly weighted P&L & slabs.",
        "resources": [
          "q_02",
          "q_05"
        ],
        "milestone": "Quant Ch.02 & Ch.05"
      },
      {
        "id": "q_ratio_avg",
        "track": "quant",
        "short": "Ratio & Averages",
        "name": "Ratio, Proportion, Partnership & Averages",
        "desc": "Combined ratios, time-weighted partnerships, weighted & corrected averages, replacement & age equations.",
        "resources": [
          "q_03",
          "q_04"
        ],
        "milestone": "Quant Ch.03 & Ch.04"
      },
      {
        "id": "q_tw_ts",
        "track": "quant",
        "short": "Work, Time & Boats",
        "name": "Time & Work, Pipes, TSD & Boats/Streams",
        "desc": "LCM efficiency units, alternate/leaving workers, leaks, relative speed, trains & upstream/downstream equations.",
        "resources": [
          "q_06",
          "q_07",
          "q_08"
        ],
        "milestone": "Quant Ch.06–Ch.08"
      },
      {
        "id": "q_stats_geo",
        "track": "quant",
        "short": "Stats & Mensuration",
        "name": "Elementary Statistics & 2D/3D Geometry",
        "desc": "Mean, median, mode, variance/SD transforms, triangle/circle theorems & cylinder/cone/sphere surface-volume.",
        "resources": [
          "q_09",
          "q_10"
        ],
        "milestone": "Quant Ch.09 & Ch.10"
      },
      {
        "id": "q_di",
        "track": "quant",
        "short": "Data Interpretation",
        "name": "Data Interpretation & Caselets",
        "desc": "Rapid ratio/percentage deltas across multi-year tables, bar/pie breakdowns & NQT mixed-set DI caselets.",
        "resources": [
          "q_11",
          "qm_10",
          "qm_20"
        ],
        "milestone": "Quant Ch.11 + Mixed DI"
      },
      {
        "id": "q_num_int",
        "track": "quant",
        "short": "Number Sys & SI/CI",
        "name": "Number System, Interest & Alligation",
        "desc": "Divisibility, HCF/LCM, Euler/Fermat remainders, unit digits, trailing zeros, SI vs CI difference & alligation cross.",
        "resources": [
          "r_guide",
          "qm_05",
          "qm_15"
        ],
        "milestone": "Adv Quant Ch.1–2"
      },
      {
        "id": "q_pnc_prob",
        "track": "quant",
        "short": "P&C, Prob & Clocks",
        "name": "Permutations, Combinations, Probability & Clocks",
        "desc": "Restricted arrangements, team selection, Bayes/conditional dice & card odds, clock angles/coincidences & odd-days.",
        "resources": [
          "r_guide",
          "r_mocks"
        ],
        "milestone": "Adv Quant Ch.3–4"
      },
      {
        "id": "r_series_code",
        "track": "reason",
        "short": "Series & Coding",
        "name": "Number/Letter Series, Analogies & Coding",
        "desc": "Difference/square/prime sequences, alternating mixed patterns, shift/reverse letter coding & symbol ciphers.",
        "resources": [
          "r_guide",
          "r_mocks"
        ],
        "milestone": "Reasoning Ch.5.1–5.2"
      },
      {
        "id": "r_blood_dir",
        "track": "reason",
        "short": "Blood Rel & Direction",
        "name": "Blood Relations, Directions & Ordering",
        "desc": "Multi-generation family trees, coded relationship expressions, shortest Pythagoras displacement & rank ordering.",
        "resources": [
          "r_guide",
          "r_mocks"
        ],
        "milestone": "Reasoning Ch.5.3–5.4"
      },
      {
        "id": "r_seating_syl",
        "track": "reason",
        "short": "Seating, Syl & DS",
        "name": "Seating, Syllogisms, Data Sufficiency & Cubes",
        "desc": "Linear/circular inward-facing seating, Venn/256-world syllogism edge cases, I/II sufficiency & painted cube cuts.",
        "resources": [
          "r_guide",
          "r_mocks"
        ],
        "milestone": "Reasoning Ch.6"
      },
      {
        "id": "r_mock_speed",
        "track": "reason",
        "short": "Shortcuts & NQT Pacing",
        "name": "Calculation Shortcuts & 25-Min NQT Execution",
        "desc": "Option elimination, unit-digit sanity checks, two-pass question triage & strict calculator-free 25-min mock pacing.",
        "resources": [
          "r_guide",
          "r_mocks",
          "qm_12"
        ],
        "milestone": "Ch.7 + NQT Mocks 1–3"
      },
      {
        "id": "v_vocab",
        "track": "verbal",
        "short": "Words & Vocab",
        "name": "Words Completion & Contextual Vocabulary",
        "desc": "Everyday collocations, commonly confused spellings/pairs (affect/effect, adverse/averse) & near-synonym precision.",
        "resources": [
          "v_01",
          "vm_01"
        ],
        "milestone": "Verbal 01 (150 Qs)"
      },
      {
        "id": "v_idioms",
        "track": "verbal",
        "short": "Idioms & Phrases",
        "name": "Idioms, Phrasal Verbs & Figurative Meanings",
        "desc": "High-frequency placement idioms, prepositional phrasal distinctions & contextual tone matching.",
        "resources": [
          "v_02",
          "vm_02"
        ],
        "milestone": "Verbal 02 (150 Qs)"
      },
      {
        "id": "v_grammar",
        "track": "verbal",
        "short": "Error Detection",
        "name": "Grammar Error Detection & Correction",
        "desc": "Subject-verb agreement, tense sequence, conditionals, modifiers, parallelism & preposition accuracy.",
        "resources": [
          "v_03",
          "vm_03"
        ],
        "milestone": "Verbal 03 (150 Qs)"
      },
      {
        "id": "v_sent",
        "track": "verbal",
        "short": "Sentence Comp & Build",
        "name": "Sentence Completion & Sentence Building",
        "desc": "Discourse markers (however, albeit, despite), clause synthesis & eliminating redundant/awkward phrasing.",
        "resources": [
          "v_04",
          "v_05",
          "vm_04"
        ],
        "milestone": "Verbal 04 & 05"
      },
      {
        "id": "v_parajumble",
        "track": "verbal",
        "short": "Para Jumbles",
        "name": "Para Jumbles & Discourse Coherence",
        "desc": "Opening sentence anchors, mandatory pronoun/transition pairs (this, however, such) & concluding synthesis.",
        "resources": [
          "v_06",
          "vm_05"
        ],
        "milestone": "Verbal 06 (150 Qs)"
      },
      {
        "id": "v_rc",
        "track": "verbal",
        "short": "Reading Comprehension",
        "name": "Reading Comprehension & Critical Inference",
        "desc": "Rapid passage mapping, main idea, author tone, assumption/implication checks & elimination of extreme distractors.",
        "resources": [
          "v_07",
          "vm_06"
        ],
        "milestone": "Verbal 07 + Mixed RC"
      }
    ],
    months: [
      {
        "id": 1,
        "title": "Month 1: Arithmetic Foundations, Adv Quant & Core Verbal",
        "period": "1 Dec – 28 Dec 2026",
        "phase": "Aptitude Sprint • Weeks 1–4",
        "weeks": [
          1,
          2,
          3,
          4
        ],
        "summary": "Build rapid calculator-free arithmetic fluency across Quant Chapters 01–08 (Simplification to Boats & Streams), finish Reasoning/Adv Quant Chapters 1–4, and lock down Vocabulary, Idioms, Error Detection & Sentence Completion.",
        "skills": [
          "q_simp",
          "q_pct_pl",
          "q_ratio_avg",
          "q_tw_ts",
          "q_num_int",
          "q_pnc_prob",
          "v_vocab",
          "v_idioms",
          "v_grammar",
          "v_sent"
        ],
        "targets": [
          {
            "id": "am1_t1",
            "track": "quant",
            "text": "Complete Quant Ch.01–08 (1,200 questions across Easy/Medium/Hard tiers, including NQT-grade Simplification).",
            "tag": "Ch.01–08"
          },
          {
            "id": "am1_t2",
            "track": "reason",
            "text": "Finish Reasoning & Adv Quant Ch.1–4 (Number System, SI/CI & Alligation, P&C/Prob, Clocks & Calendars).",
            "tag": "Adv Quant Ch.1–4"
          },
          {
            "id": "am1_t3",
            "track": "verbal",
            "text": "Complete Verbal Topics 01–04 (Words Completion, Idioms, Error Detection & Sentence Completion).",
            "tag": "Verbal 01–04"
          },
          {
            "id": "am1_t4",
            "track": "reason",
            "text": "Audit Month 1 ~ Redo log to < 10% error rate across timed arithmetic and grammar rules.",
            "tag": "Accuracy Gate"
          }
        ]
      },
      {
        "id": 2,
        "title": "Month 2: Stats/DI, Logical Reasoning, Verbal RC & Mixed Sets 01–10",
        "period": "29 Dec 2026 – 25 Jan 2027",
        "phase": "Aptitude Sprint • Weeks 5–8",
        "weeks": [
          5,
          6,
          7,
          8
        ],
        "summary": "Finish Quant Chapters 09–11 (Stats, Geometry, DI), transition into shuffled Quant Mixed Sets 01–10, complete Reasoning Ch.5–7 + Timed NQT Mock 1, and conquer Para Jumbles, Reading Comprehension & Verbal Mixed Sets 01–02.",
        "skills": [
          "q_stats_geo",
          "q_di",
          "r_series_code",
          "r_blood_dir",
          "r_seating_syl",
          "r_mock_speed",
          "v_sent",
          "v_parajumble",
          "v_rc"
        ],
        "targets": [
          {
            "id": "am2_t1",
            "track": "quant",
            "text": "Finish Quant Ch.09–11 (Stats, Mensuration, DI) + Mixed Sets 01–10 with calculator-free DI caselets.",
            "tag": "Ch.09–11 + Mix 01–10"
          },
          {
            "id": "am2_t2",
            "track": "reason",
            "text": "Finish Reasoning Ch.5–7 (Series, Coding, Blood/Dir, Seating, Syllogisms, DS, Shortcuts) & sit Timed Mock 1.",
            "tag": "Ch.5–7 + Mock 1"
          },
          {
            "id": "am2_t3",
            "track": "verbal",
            "text": "Complete Verbal Topics 05–07 (Sentence Building, Para Jumbles, RC) + Verbal Mixed Sets 01–02.",
            "tag": "Verbal 05–07 + Mix 1–2"
          },
          {
            "id": "am2_t4",
            "track": "quant",
            "text": "Hit target section timings consistently on DI caselets and Hard mixed arithmetic questions.",
            "tag": "Pacing Gate"
          }
        ]
      },
      {
        "id": 3,
        "title": "Month 3: Shuffled Mixed Mastery, NQT Mocks 2–3 & Exam Peak",
        "period": "26 Jan – 22 Feb 2027",
        "phase": "Aptitude Sprint • Weeks 9–12",
        "weeks": [
          9,
          10,
          11,
          12
        ],
        "summary": "Complete Quant Mixed Sets 11–20 and Verbal Mixed Sets 03–06 under strict exam pressure, sit TCS NQT Timed Mocks 2 & 3 (Reasoning + Mixed), zero out the 7-day Redo Queue, and lock in full exam-day pacing.",
        "skills": [
          "q_simp",
          "q_num_int",
          "q_pnc_prob",
          "q_di",
          "r_seating_syl",
          "r_mock_speed",
          "v_grammar",
          "v_parajumble",
          "v_rc"
        ],
        "targets": [
          {
            "id": "am3_t1",
            "track": "quant",
            "text": "Complete Quant Mixed Sets 11–20 across Easy/Medium/Hard tiers (all 31 Quant chapter + mixed PDFs done).",
            "tag": "Mixed 11–20 Done"
          },
          {
            "id": "am3_t2",
            "track": "reason",
            "text": "Pass TCS NQT Timed Mocks 2 & 3 (25 min strict) + re-solve every missed numerical/reasoning trap.",
            "tag": "Mocks 2 & 3"
          },
          {
            "id": "am3_t3",
            "track": "verbal",
            "text": "Finish Verbal Mixed Sets 03–06 (all 13 Verbal PDFs complete) with high RC inference accuracy.",
            "tag": "Mixed 03–06 Done"
          },
          {
            "id": "am3_t4",
            "track": "reason",
            "text": "Clear all flagged ~ Redo items across 46 PDFs before placement test windows open.",
            "tag": "Zero Redo Gate"
          }
        ]
      }
    ],
    weeks: [
    {
      id: 1,
      month: 1,
      title: "Simplification (NQT), Percentage Pt 1, Number Sys & Words",
      focus: ["Ch.01 Simplification + Ch.02 E","Adv Quant Ch.1: Number System","Verbal 01: Words Completion"],
      practiceTag: "Ch.01 (50-50-50) • Number Sys • Verbal 01",
      targets: [
        {"id":"aw1_q","track":"quant","text":"Master NQT-level Simplification (Q1–150: VBODMAS, surd/partial-fraction telescoping, Newton/Sophie Germain) + Ch.02 Easy."},
        {"id":"aw1_r","track":"reason","text":"Complete Reasoning & Adv Quant Ch.1 (Divisibility, HCF/LCM, Remainders, Unit Digits, Trailing Zeros, Bases)."},
        {"id":"aw1_v","track":"verbal","text":"Finish all 150 questions of Verbal 01 Words Completion (Easy, Medium & Hard sections)."}
      ],
      days: [
        [
          ["quant",["q_simp"],"Ch.01 Simplification Easy (Q1–50, 40m)","Timed 40m sitting: VBODMAS 'of' precedence, 3-level brackets, fractional % & recurring decimals.","q_01",1],
          ["reason",["q_num_int"],"Adv Quant Ch.1.1–1.2: Divisibility, HCF & LCM","Drill divisibility tests (7, 11, 13, 88, 99) and fraction/remainder HCF/LCM identities.","r_guide",0.7],
          ["verbal",["v_vocab"],"Verbal 01 Easy (Q1–50, 15m): Words Completion","Complete Everyday Vocabulary & Spelling Q1–50 deciding POS before checking options.","v_01",0.5]
        ],
        [
          ["quant",["q_simp"],"Ch.01 Simplification Medium Pt 1 (Q51–75, 30m)","Solve reciprocal x +- 1/x chains and dual-conjugate surd rationalisations cleanly.","q_01",0.9],
          ["reason",["q_num_int"],"Adv Quant Ch.1.3: Remainders & Unit Digits","Master cyclicity (2,3,7,8), Fermat/negative remainders & power towers.","r_guide",0.8],
          ["verbal",["v_vocab"],"Verbal 01 Medium Pt 1 (Q51–75)","Drill confusable word pairs (affect/effect, adverse/averse) + context notes.","v_01",0.5]
        ],
        [
          ["quant",["q_simp"],"Ch.01 Simplification Medium Pt 2 (Q76–100, 30m)","Solve 1/(k(k+d)) telescoping sums, conditional a+b+c=0 cubics & nested radicals.","q_01",0.9],
          ["reason",["q_num_int"],"Adv Quant Ch.1.4: Trailing Zeros & Number Bases","Compute factorial Legendre p-adic powers (125!, 100!) & base-k conversions.","r_guide",0.8],
          ["verbal",["v_vocab"],"Verbal 01 Medium Pt 2 (Q76–100)","Complete phrasal & formal collocation items; log missed pairs to note bar.","v_01",0.5]
        ],
        [
          ["quant",["q_simp"],"Ch.01 Simplification Hard Pt 1 (Q101–125, 38m)","Drill x^5/x^6 recurrences, weighted surds 1/(k sqrt(k+1)+(k+1)sqrt(k)) & degree-4 telescoping.","q_01",1.1],
          ["reason",["q_num_int"],"Adv Quant Ch.1.5 Practice Qs (All Tiers)","Solve Ch.1 practice bank checking every remainder & divisor count numerically.","r_guide",0.8],
          ["verbal",["v_vocab"],"Verbal 01 Hard (Q101–150, 35m)","Timed Hard vocabulary & near-synonym precision drill; log confusing roots.","v_01",0.7]
        ],
        [
          ["quant",["q_simp"],"Ch.01 Simplification Hard Pt 2 (Q126–150, 38m)","Complete AGP series, quadratic degree reduction, Sophie Germain a^4+4b^4 & root denesting.","q_01",1.1],
          ["reason",["q_num_int","r_mock_speed"],"Ch.1 Practical Lessons & Trap Audit","Review Ch.1.6 negative-remainder & factor-pair parity traps without notes.","r_guide",0.6],
          ["verbal",["v_vocab"],"Verbal 01 Hard Key & Vocab Card Audit","Audit Q1–150 misses and compile personal confusing-pair flash list.","v_01",0.5]
        ],
        [
          ["quant",["q_pct_pl"],"Ch.02 Percentage Easy (Q1–50, 35m)","Master fraction equivalents (1/7..1/16, 37.5%, 14 2/7%) & basic % change problems.","q_02",1],
          ["reason",["q_num_int"],"Re-Solve Toughest 5 Number-System Problems","Re-work flagged ~ Ch.1 problems from scratch with 90s/question budget.","r_guide",0.7],
          ["verbal",["v_vocab"],"Verbal 01 Redo Sweep (Missed Items)","Re-test all Week 1 flagged vocabulary items from blank.","v_01",0.5]
        ],
        [
          ["quant",["q_simp","q_pct_pl"],"Ch.01 Flagged Surd/Newton Redo + Review","Re-solve any missed Ch.01 Hard items without peeking at working.","q_01",0.9],
          ["reason",["q_num_int"],"Number System Flash-Test (6 Qs / 8m)","Verify unit digit, factor count & trailing zero speed without scratch errors.","r_guide",0.6],
          ["verbal",["v_vocab"],"Week 1 Vocab & Error-Log Consolidation","Summarise top 15 confusable words in Day 7 log.","v_01",0.4]
        ]
      ]
    },
    {
      id: 2,
      month: 1,
      title: "Percentage Pt 2, Ratio & Proportion, SI/CI & Idioms",
      focus: ["Ch.02 M/H + Ch.03 Ratio","Adv Quant Ch.2: SI/CI & Alligation","Verbal 02: Idioms & Phrases"],
      practiceTag: "Ch.02 M/H • Ch.03 • SI/CI/Mix • Verbal 02",
      targets: [
        {"id":"aw2_q","track":"quant","text":"Finish Ch.02 Percentage (M/H) and all 150 questions of Ch.03 Ratio & Proportion."},
        {"id":"aw2_r","track":"reason","text":"Finish Adv Quant Ch.2 (SI/CI, Effective Rate, Alligation Cross & Repeated Replacement)."},
        {"id":"aw2_v","track":"verbal","text":"Complete all 150 questions of Verbal 02 Idioms & Phrases (Easy, Medium & Hard)."}
      ],
      days: [
        [
          ["quant",["q_pct_pl"],"Ch.02 Percentage Medium (Q51–100, 60m)","Drill successive % changes, price-consumption, population & 2-candidate elections.","q_02",1.2],
          ["reason",["q_num_int"],"Adv Quant Ch.2.1: Simple vs Compound Interest","Master 2-yr/3-yr CI-SI difference formulas P(r/100)^2 and half-yearly scaling.","r_guide",0.8],
          ["verbal",["v_idioms"],"Verbal 02 Easy (Q1–50): Idioms & Phrases","Timed sitting covering core workplace and everyday idioms.","v_02",0.5]
        ],
        [
          ["quant",["q_pct_pl"],"Ch.02 Percentage Hard (Q101–150, 80m)","Complete chained 'of the remaining', multi-slab commission & 3D volume % problems.","q_02",1.4],
          ["reason",["q_num_int"],"Adv Quant Ch.2.2: The Alligation Cross","Apply weighted-average alligation to prices, concentrations & average speed splits.","r_guide",0.8],
          ["verbal",["v_idioms"],"Verbal 02 Medium Pt 1 (Q51–75)","Focus on prepositional idiom distinctions & figurative traps.","v_02",0.5]
        ],
        [
          ["quant",["q_pct_pl"],"Ch.02 Percentage Error Audit & Redo","Re-solve Ch.02 Hard Qs missed under 80m cap cleanly.","q_02",0.9],
          ["reason",["q_num_int"],"Adv Quant Ch.2.3: Replacement Formula","Practise milk-water repeated draw-and-replace final_conc = init*(1 - x/V)^n.","r_guide",0.8],
          ["verbal",["v_idioms"],"Verbal 02 Medium Pt 2 (Q76–100)","Finish Medium tier and record unfamiliar idioms in notebook.","v_02",0.5]
        ],
        [
          ["quant",["q_ratio_avg"],"Ch.03 Ratio & Proportion Easy (Q1–50)","Drill compound ratios A:B:C, coin denomination splits & fourth proportionals.","q_03",1],
          ["reason",["q_num_int"],"Adv Quant Ch.2.4 Practice Questions","Solve all Ch.2 Interest, Mixtures & Alligation practice problems + traps.","r_guide",0.9],
          ["verbal",["v_idioms"],"Verbal 02 Hard Pt 1 (Q101–125)","Practise literary and less common figurative phrases by tone clue.","v_02",0.6]
        ],
        [
          ["quant",["q_ratio_avg"],"Ch.03 Ratio Medium (Q51–100)","Solve partnership time-investment splits, income-expenditure & proportional variation.","q_03",1.1],
          ["reason",["q_num_int","r_mock_speed"],"Ch.2.5 Trap Check: Mixture Ratio Flip","Verify cheaper/dearer cross ordering so ratio orientation never flips.","r_guide",0.6],
          ["verbal",["v_idioms"],"Verbal 02 Hard Pt 2 (Q126–150)","Finish Hard Idioms set and review answer explanations.","v_02",0.6]
        ],
        [
          ["quant",["q_ratio_avg"],"Ch.03 Ratio Hard (Q101–150)","Timed Hard ratio/partnership/variable-vessel mixing problems.","q_03",1.3],
          ["reason",["q_num_int"],"Mixed SI/CI + Mixture Timed Drill (8 Qs)","Solve 8 unseen Ch.1–2 Adv Quant problems in 12 minutes.","r_guide",0.7],
          ["verbal",["v_idioms"],"Verbal 02 Redo of Missed Idioms","Re-test Week 2 flagged ~ idioms without looking at meanings.","v_02",0.5]
        ],
        [
          ["quant",["q_pct_pl","q_ratio_avg"],"Weeks 1–2 Quick Arithmetic Review","Redo flagged Week 1–2 Quant ~ questions cleanly.","q_03",0.9],
          ["reason",["q_num_int"],"Interest & Alligation Formula Blind Write","Write all CI, installment & replacement equations cleanly on blank paper.","r_guide",0.6],
          ["verbal",["v_vocab","v_idioms"],"Combined Vocab + Idioms Flash Quiz","Self-test 25 random missed words/idioms from Weeks 1–2.","v_01",0.5]
        ]
      ]
    },
    {
      id: 3,
      month: 1,
      title: "Averages, Profit & Loss, P&C/Prob & Error Detection",
      focus: ["Ch.04 Average + Ch.05 P&L","Adv Quant Ch.3: P&C + Prob","Verbal 03: Error Detection"],
      practiceTag: "Ch.04 • Ch.05 • P&C/Prob • Verbal 03",
      targets: [
        {"id":"aw3_q","track":"quant","text":"Complete all 150 questions of Ch.04 Average and Ch.05 Profit & Loss."},
        {"id":"aw3_r","track":"reason","text":"Complete Adv Quant Ch.3 (Counting rules, Restricted Permutations/Combinations & Probability)."},
        {"id":"aw3_v","track":"verbal","text":"Finish all 150 questions of Verbal 03 Error Detection across all grammar categories."}
      ],
      days: [
        [
          ["quant",["q_ratio_avg"],"Ch.04 Average Easy (Q1–50)","Solve consecutive integers, team score deltas & basic weighted averages.","q_04",0.9],
          ["reason",["q_pnc_prob"],"Adv Quant Ch.3.1: Counting, Permutations & Comms","Master nPr, nCr, string vowel-together/never-together & circular (n-1)! rules.","r_guide",0.9],
          ["verbal",["v_grammar"],"Verbal 03 Easy (Q1–50): Error Detection","Drill core Subject-Verb Agreement, articles & singular/plural traps.","v_03",0.6]
        ],
        [
          ["quant",["q_ratio_avg"],"Ch.04 Average Medium (Q51–100)","Practise replacement/newcomer shift tricks (avg_new = avg_old + delta/N) & ages.","q_04",1.1],
          ["reason",["q_pnc_prob"],"Adv Quant Ch.3.2: Probability by Counting","Solve cards, coins, dice sums, 'at least one' complement & conditional odds.","r_guide",0.9],
          ["verbal",["v_grammar"],"Verbal 03 Medium Pt 1 (Q51–75)","Focus on tense sequence (Past Perfect vs Simple Past) & conditional clauses.","v_03",0.6]
        ],
        [
          ["quant",["q_ratio_avg"],"Ch.04 Average Hard (Q101–150)","Timed Hard average problems involving grouped exclusion, batting/bowling & shifts.","q_04",1.3],
          ["reason",["q_pnc_prob"],"Adv Quant Ch.3.3 Practice Qs (P&C + Prob)","Work all Ch.3 practice exercises verifying nCr/probability edge cases.","r_guide",0.9],
          ["verbal",["v_grammar"],"Verbal 03 Medium Pt 2 (Q76–100)","Drill pronoun agreement (neither/each/everyone), prepositions & parallelism.","v_03",0.6]
        ],
        [
          ["quant",["q_pct_pl"],"Ch.05 Profit & Loss Easy (Q1–50)","Master CP/SP/MP ratios, mark-up vs discount % & break-even item counts.","q_05",1],
          ["reason",["q_pnc_prob"],"Repeated-Letters & Identical-Items Cases","Drill n! / (p!q!) arrangements & stars-and-bars non-negative integer splits.","r_guide",0.7],
          ["verbal",["v_grammar"],"Verbal 03 Hard Pt 1 (Q101–125)","Diagnose dangling modifiers, subjunctive 'were' & subtle preposition errors.","v_03",0.7]
        ],
        [
          ["quant",["q_pct_pl"],"Ch.05 Profit & Loss Medium (Q51–100)","Solve equal-SP gain/loss % (-x^2/100 loss), dishonest dealer false weights & successive discounts.","q_05",1.2],
          ["reason",["q_pnc_prob","r_mock_speed"],"Ch.3.4 Trap Audit: Overcounting Duplicates","Verify divide-by-2! when groups are unlabelled vs labelled splits.","r_guide",0.6],
          ["verbal",["v_grammar"],"Verbal 03 Hard Pt 2 (Q126–150)","Complete Hard error detection and categorise recurring grammar misses.","v_03",0.7]
        ],
        [
          ["quant",["q_pct_pl"],"Ch.05 Profit & Loss Hard (Q101–150)","Timed Hard P&L: split consignments, dishonest mark-up+weight & tax/discount chains.","q_05",1.4],
          ["reason",["q_pnc_prob"],"Week 2 Redo + 8 Timed P&C/Prob Problems","Redo Week 2 ~ items + complete 8 unseen P&C/Prob problems in 12m.","r_guide",0.8],
          ["verbal",["v_grammar"],"Verbal 03 Error-Detection Rule Summary","Log top 10 grammar traps (few/a few, between/among, since/for) & redo missed Qs.","v_03",0.6]
        ],
        [
          ["quant",["q_ratio_avg","q_pct_pl"],"Ch.04–05 Flagged Problem Re-Solve","Clear all Ch.04–05 ~ flags using mental ratio/fraction shortcuts.","q_05",0.9],
          ["reason",["q_pnc_prob"],"Bayes & Card/Dice Quick Recall","Re-solve conditional Bayes & two-ace problems cleanly from memory.","r_guide",0.6],
          ["verbal",["v_grammar"],"Blind Grammar Correction Check (10 Sentences)","Correct 10 tough sentences without options.","v_03",0.5]
        ]
      ]
    },
    {
      id: 4,
      month: 1,
      title: "Time/Work, TSD, Boats, Clocks/Calendars & Sent Comp",
      focus: ["Ch.06–08 (Work, TSD, Boats)","Adv Quant Ch.4: Clocks & Calendars","Verbal 04: Sentence Completion"],
      practiceTag: "Ch.06–08 • Clocks/Cal • Verbal 04",
      targets: [
        {"id":"aw4_q","track":"quant","text":"Complete Ch.06 Time & Work, Ch.07 Distance/Speed/Time and Ch.08 Boats & Streams (450 Qs across tiers)."},
        {"id":"aw4_r","track":"reason","text":"Finish Adv Quant Ch.4 (Clock angles, coincidences, faulty clocks & odd-day Calendar dates)."},
        {"id":"aw4_v","track":"verbal","text":"Finish all 150 questions of Verbal 04 Sentence Completion & pass Month 1 Verbal checkpoint."}
      ],
      days: [
        [
          ["quant",["q_tw_ts"],"Ch.06 Time & Work Easy + Medium (Q1–100)","Use LCM total-work units; drill leaving/joining workers, wages & man-days M1D1=M2D2.","q_06",1.3],
          ["reason",["q_pnc_prob"],"Adv Quant Ch.4.1: Clocks & Hand Angles","Master |30H - 5.5M| reflex angle check, 12/11 relative gain & faulty fast/slow clocks.","r_guide",0.8],
          ["verbal",["v_sent"],"Verbal 04 Easy (Q1–50): Sentence Completion","Practise clue words & contrast conjunctions (although, whereas, nevertheless).","v_04",0.5]
        ],
        [
          ["quant",["q_tw_ts"],"Ch.06 Time & Work Hard (Q101–150)","Complete pipes with leaks, alternate-day cycles & efficiency-ratio Hard sets.","q_06",1.3],
          ["reason",["q_pnc_prob"],"Adv Quant Ch.4.2: Calendars & Odd Days","Master 100/200/300/400-yr odd days (5,3,1,0), Gregorian leap-year 400 rule & day lookup.","r_guide",0.8],
          ["verbal",["v_sent"],"Verbal 04 Medium Pt 1 (Q51–75)","Focus on two-blank logical fit & cause-effect connectors.","v_04",0.5]
        ],
        [
          ["quant",["q_tw_ts"],"Ch.07 Distance, Speed & Time E + M (Q1–100)","Drill average speed 2uv/(u+v), constant-distance speed:time inverse & train passing.","q_07",1.3],
          ["reason",["q_pnc_prob"],"Adv Quant Ch.4.3 Practice Qs (Clocks & Cal)","Solve Ch.4 practice questions verifying leap Feb-29 crossing traps.","r_guide",0.8],
          ["verbal",["v_sent"],"Verbal 04 Medium Pt 2 (Q76–100)","Drill phrasal-preposition sentence completions.","v_04",0.5]
        ],
        [
          ["quant",["q_tw_ts"],"Ch.07 DST Hard (Q101–150)","Solve circular track meetings, late/early start deltas & bullet/echo Hard problems.","q_07",1.3],
          ["reason",["q_pnc_prob","r_mock_speed"],"Ch.4.4 Mirror Clock & Reflex Angle Audit","Verify 11:60 mirror subtraction & 360 - theta reflex angle cases.","r_guide",0.6],
          ["verbal",["v_sent"],"Verbal 04 Hard Pt 1 (Q101–125)","Practise double-blank academic & nuanced contrast items.","v_04",0.6]
        ],
        [
          ["quant",["q_tw_ts"],"Ch.08 Boats & Streams E + M (Q1–100)","Solve b = (D+U)/2, s = (D-U)/2 & fixed round-trip time D/(b+s) + D/(b-s) = T.","q_08",1.2],
          ["reason",["q_num_int","q_pnc_prob"],"Month 1 Adv Quant Cumulative Quiz (Ch.1–4)","Timed 10-question check across Number Sys, SI/CI, P&C, Prob & Clocks/Calendars.","r_guide",0.8],
          ["verbal",["v_sent"],"Verbal 04 Hard Pt 2 (Q126–150)","Finish Sentence Completion Hard set and review missed items.","v_04",0.6]
        ],
        [
          ["quant",["q_tw_ts"],"Ch.08 Boats & Streams Hard (Q101–150)","Complete downstream/upstream coupled variable systems & speed-delta Hard Qs.","q_08",1.3],
          ["reason",["q_num_int","q_pnc_prob"],"Week 3 Redo + Ch.1–4 Trick Check","Clear Week 3 ~ items cleanly from blank sheet.","r_guide",0.7],
          ["verbal",["v_vocab","v_grammar","v_sent"],"Month 1 Verbal Redo Consolidation","Redo flagged ~ items across Verbal 01–04.","v_04",0.6]
        ],
        [
          ["quant",["q_simp","q_pct_pl","q_tw_ts"],"Month 1 Quant Mastery Checkpoint","Re-test 12 Hard items across Ch.01–08; confirm sub-90s pacing.","q_08",1],
          ["reason",["r_mock_speed"],"Month 1 Formula Sheet Blind Check","Verify all Adv Quant Ch.1–4 formulas written cleanly from memory.","r_guide",0.6],
          ["verbal",["v_vocab","v_grammar"],"Month 1 Verbal Audit & Error Notes","Update Top-20 Grammar & Vocab trap list before Month 2.","v_03",0.5]
        ]
      ]
    },
    {
      id: 5,
      month: 2,
      title: "Stats, Mensuration/Geometry, Reasoning I & Sent Building",
      focus: ["Ch.09 Stats + Ch.10 Geometry","Reasoning Ch.5: Series/Blood/Dir","Verbal 05: Sentence Building"],
      practiceTag: "Ch.09 • Ch.10 • Reasoning I • Verbal 05",
      targets: [
        {"id":"aw5_q","track":"quant","text":"Complete all 150 questions of Ch.09 Elementary Statistics and Ch.10 Mensuration & Geometry."},
        {"id":"aw5_r","track":"reason","text":"Finish Reasoning & Adv Quant Ch.5 (Number/Letter Series, Coding-Decoding, Blood Relations & Directions)."},
        {"id":"aw5_v","track":"verbal","text":"Complete all 150 questions of Verbal 05 Sentence Building cleanly."}
      ],
      days: [
        [
          ["quant",["q_stats_geo"],"Ch.09 Elementary Statistics Easy (Q1–50)","Drill mean, median (even/odd sorted), mode & empirical mode = 3*median - 2*mean.","q_09",1],
          ["reason",["r_series_code"],"Reasoning Ch.5.1: Number & Letter Series","Identify difference-of-difference, n^2+-1, alternating & prime series fast.","r_guide",0.8],
          ["verbal",["v_sent"],"Verbal 05 Easy (Q1–50): Sentence Building","Practise clean active syntax, clause coordination & conciseness.","v_05",0.5]
        ],
        [
          ["quant",["q_stats_geo"],"Ch.09 Elementary Statistics Med + Hard (Q51–150)","Compute grouped mean, range, mean deviation, variance/SD shift invariance & CV.","q_09",1.3],
          ["reason",["r_series_code"],"Reasoning Ch.5.2: Coding–Decoding","Solve shift ciphers, opposite-letter sums (=27), positional & word-matrix codes.","r_guide",0.8],
          ["verbal",["v_sent"],"Verbal 05 Medium Pt 1 (Q51–75)","Resolve split-construction, faulty parallelism & comparison errors.","v_05",0.5]
        ],
        [
          ["quant",["q_stats_geo"],"Ch.10 Mensuration & Geometry Easy (Q1–50)","Drill triangle/circle area-perimeter, Pythagoras triples & cube/cuboid basics.","q_10",1.1],
          ["reason",["r_blood_dir"],"Reasoning Ch.5.3: Blood Relations","Build unambiguous generational trees + walk coded A@B#C relation strings.","r_guide",0.8],
          ["verbal",["v_sent"],"Verbal 05 Medium Pt 2 (Q76–100)","Finish Medium Sentence Building verifying modifier placement.","v_05",0.5]
        ],
        [
          ["quant",["q_stats_geo"],"Ch.10 Mensuration & Geometry Medium (Q51–100)","Solve cone/cylinder/hemisphere recastings, chord/tangent angles & frustums.","q_10",1.3],
          ["reason",["r_blood_dir"],"Reasoning Ch.5.4: Directions & Shadow","Track NESW vector net displacement & morning/evening sun shadow orientation.","r_guide",0.8],
          ["verbal",["v_sent"],"Verbal 05 Hard Pt 1 (Q101–125)","Practise complex formal clause restructuring & punctuation subtlety.","v_05",0.6]
        ],
        [
          ["quant",["q_stats_geo"],"Ch.10 Mensuration & Geometry Hard (Q101–150)","Timed Hard hollow cylinder, melted sphere counts, inscribed triangle/circle ratios.","q_10",1.4],
          ["reason",["r_series_code","r_blood_dir"],"Adv Quant Ch.5.5 Practice Questions","Complete all Ch.5 practice questions across series, coding, blood & direction.","r_guide",0.8],
          ["verbal",["v_sent"],"Verbal 05 Hard Pt 2 (Q126–150)","Finish Verbal 05 Hard set and record tricky style distinctions.","v_05",0.6]
        ],
        [
          ["quant",["q_stats_geo"],"Week 4 Redo + 3D Volume Formula Blitz","Clear Week 4 ~ items; write all 2D/3D mensuration & SD formulas blind.","q_10",1],
          ["reason",["r_blood_dir"],"10 Speed Reasoning I Drills (10m)","Timed 1-min/question check on coded blood relations & direction turns.","r_guide",0.7],
          ["verbal",["v_sent"],"Verbal 05 Redo of Flagged Questions","Re-solve missed Sentence Building Qs without peeking.","v_05",0.5]
        ],
        [
          ["quant",["q_stats_geo"],"Ch.09–10 Weak-Item Recovery Set","Redo toughest 6 Stats/Mensuration questions checking pi=22/7 arithmetic accuracy.","q_09",0.9],
          ["reason",["r_series_code"],"Letter Position 1–26 & Opposite Recall Drill","Verify instant recall of EJOTY positions and A-Z/B-Y pairs.","r_guide",0.5],
          ["verbal",["v_grammar","v_sent"],"Grammar + Sentence Structure Bridge Review","Compare Error Detection vs Sentence Building elimination patterns.","v_05",0.5]
        ]
      ]
    },
    {
      id: 6,
      month: 2,
      title: "Data Interpretation, Mixed 01–03, Reasoning II & Para Jumbles",
      focus: ["Ch.11 DI + Mixed 01–03","Reasoning Ch.6: Seating/Syl/DS","Verbal 06: Para Jumbles"],
      practiceTag: "Ch.11 DI • Quant Mix 01–03 • Reasoning II • Verbal 06",
      targets: [
        {"id":"aw6_q","track":"quant","text":"Complete all 150 questions of Ch.11 Data Interpretation plus Quant Mixed Sets 01–03."},
        {"id":"aw6_r","track":"reason","text":"Master Reasoning Ch.6 (Circular/Linear Seating, Syllogisms, Data Sufficiency & Logic Puzzles)."},
        {"id":"aw6_v","track":"verbal","text":"Complete all 150 questions of Verbal 06 Para Jumbles using anchor/pronoun linking."}
      ],
      days: [
        [
          ["quant",["q_di"],"Ch.11 Data Interpretation Easy (Q1–50)","Drill ratio-fraction approximation on tables, bar graphs & degree-to-% pie charts.","q_11",1.1],
          ["reason",["r_seating_syl"],"Reasoning Ch.6.1: Linear & Circular Seating","Fix center-facing left=CW / right=CCW convention & build split cases early.","r_guide",0.9],
          ["verbal",["v_parajumble"],"Verbal 06 Easy (Q1–50): Para Jumbles","Identify opening sentences & obvious chronological/pronoun links.","v_06",0.6]
        ],
        [
          ["quant",["q_di"],"Ch.11 Data Interpretation Medium (Q51–100)","Solve multi-series stacked bar & comparative CAGR/YoY % change tables.","q_11",1.2],
          ["reason",["r_seating_syl"],"Reasoning Ch.6.2: Syllogisms (Venn Rigor)","Drill All/Some/No/Some-Not & complementary Either-Or rules without intuition bias.","r_guide",0.9],
          ["verbal",["v_parajumble"],"Verbal 06 Medium Pt 1 (Q51–75)","Form mandatory pairs using discourse markers (however, therefore, such).","v_06",0.6]
        ],
        [
          ["quant",["q_di"],"Ch.11 Data Interpretation Hard (Q101–150)","Complete missing-table DI, income-expenditure caselets & radar/bubble traps.","q_11",1.4],
          ["reason",["r_seating_syl"],"Reasoning Ch.6.3–6.4: Data Sufficiency & Puzzles","Apply strict I-alone -> II-alone -> Together sufficiency + mislabelled-box deduction.","r_guide",0.9],
          ["verbal",["v_parajumble"],"Verbal 06 Medium Pt 2 (Q76–100)","Finish Medium Para Jumbles checking opening vs concluding sentence clues.","v_06",0.6]
        ],
        [
          ["quant",["q_simp","q_pct_pl","q_di"],"Quant Mixed Set 01 (Easy + Med + Hard)","Sit all 3 sections of Mixed Set 01 with timer, note topic distribution & DI caselet.","qm_01",1.6],
          ["reason",["r_seating_syl"],"Syllogism & Seating Trap Drill (10 Qs)","Test 'All A are B' inverse traps and 6/8-person circular edge constraints.","r_guide",0.8],
          ["verbal",["v_parajumble"],"Verbal 06 Hard Pt 1 (Q101–125)","Practise 5-sentence abstract/philosophical Para Jumbles via noun-to-pronoun flow.","v_06",0.7]
        ],
        [
          ["quant",["q_ratio_avg","q_tw_ts","q_di"],"Quant Mixed Set 02 (Full 150 Qs)","Complete Mixed Set 02 under strict calculator-free exam pacing.","qm_02",1.6],
          ["reason",["r_seating_syl"],"Data Sufficiency Uniqueness Audit","Solve 6 numeric DS traps ('x^2=9' is NOT unique! 'x=even' YES) cleanly.","r_guide",0.7],
          ["verbal",["v_parajumble"],"Verbal 06 Hard Pt 2 (Q126–150)","Finish Hard Para Jumbles and catalogue missed connector patterns.","v_06",0.7]
        ],
        [
          ["quant",["q_stats_geo","q_num_int","q_di"],"Quant Mixed Set 03 (Full 150 Qs)","Complete Mixed Set 03 and flag slowest chapter topics in Redo Queue.","qm_03",1.6],
          ["reason",["r_seating_syl"],"Week 5 Redo + Seating Arrangement Sprint","Clear Week 5 ~ items and solve 2 circular/floor puzzles under 6m total.","r_guide",0.8],
          ["verbal",["v_parajumble"],"Verbal 06 Missed Para-Jumble Redo","Re-order missed Week 6 jumbles using only mandatory-pair logic.","v_06",0.6]
        ],
        [
          ["quant",["q_di"],"DI Percentage Fraction Approximation Check","Drill rapid 1/7..1/19 % estimation without full long division.","q_11",0.8],
          ["reason",["r_seating_syl"],"Either-Or Syllogism Checklist Review","Verify conditions: same elements, both conclusions false individually, All+SomeNot or Some+No.","r_guide",0.5],
          ["verbal",["v_parajumble"],"Para-Jumble Transition Marker Cheat Sheet","Record addition/contrast/cause/summary cues in Week 6 log.","v_06",0.5]
        ]
      ]
    },
    {
      id: 7,
      month: 2,
      title: "Quant Mixed 04–07, Speed Shortcuts & Reading Comp",
      focus: ["Quant Mixed Sets 04–07","Reasoning Ch.7: Shortcuts & Strategy","Verbal 07: Reading Comprehension"],
      practiceTag: "Quant Mix 04–07 • Ch.7 Speed • Verbal 07 RC",
      targets: [
        {"id":"aw7_q","track":"quant","text":"Complete Quant Mixed Sets 04, 05, 06 and 07 across Easy, Medium & Hard sections."},
        {"id":"aw7_r","track":"reason","text":"Finish Reasoning & Adv Quant Ch.7 (Calculation Shortcuts, Approximations & 25-Min NQT Triage)."},
        {"id":"aw7_v","track":"verbal","text":"Complete all 150 questions of Verbal 07 Reading Comprehension (Factual, Inference & Tone)."}
      ],
      days: [
        [
          ["quant",["q_simp","q_pct_pl","q_di"],"Quant Mixed Set 04 (150 Qs Timed)","Attempt E/M/H sittings of Mixed Set 04; measure per-topic accuracy in key.","qm_04",1.6],
          ["reason",["r_mock_speed"],"Adv Quant Ch.7.1: Arithmetic Speed Shortcuts","Practise squaring tricks, 11x/25x/125x, digital roots & unit-digit option filters.","r_guide",0.8],
          ["verbal",["v_rc"],"Verbal 07 Reading Comprehension Easy (Q1–50)","Timed 35m sitting across short factual passages: main idea & direct detail.","v_07",0.7]
        ],
        [
          ["quant",["q_num_int","q_ratio_avg","q_di"],"Quant Mixed Set 05 (150 Qs Timed)","Sit Mixed Set 05 focusing on quick skip-and-return triage on Hard stems.","qm_05",1.6],
          ["reason",["r_mock_speed"],"Adv Quant Ch.7.2: How to Spend 25 Minutes","Internalise 2-pass TCS NQT strategy (Pass 1 fast 12 Qs -> Pass 2 Tough/DI -> Last 2m checks).","r_guide",0.7],
          ["verbal",["v_rc"],"Verbal 07 RC Medium Pt 1 (Q51–75)","Focus on inference, author purpose & vocabulary-in-context clues.","v_07",0.7]
        ],
        [
          ["quant",["q_pct_pl","q_tw_ts","q_di"],"Quant Mixed Set 06 (150 Qs Timed)","Complete Mixed Set 06 and cross-check any SI/CI or DI calculation errors.","qm_06",1.6],
          ["reason",["r_mock_speed"],"Option Elimination & Approximation Lab","Solve 10 heavy percentage/mensuration Qs strictly via estimation + last digit.","r_guide",0.7],
          ["verbal",["v_rc"],"Verbal 07 RC Medium Pt 2 (Q76–100)","Finish Medium passages under strict 45m cumulative budget.","v_07",0.7]
        ],
        [
          ["quant",["q_stats_geo","q_tw_ts","q_di"],"Quant Mixed Set 07 (150 Qs Timed)","Sit Mixed Set 07; diagnose any topic appearing twice in misses.","qm_07",1.6],
          ["reason",["r_mock_speed","r_series_code"],"Ch.7.3 Review + Speed Series Check","Practise 15-second recognition of cubic, Fibonacci & prime-offset series.","r_guide",0.7],
          ["verbal",["v_rc"],"Verbal 07 RC Hard Pt 1 (Q101–125)","Tackle longer argumentative passages: tone, unstated assumptions & weakens.","v_07",0.8]
        ],
        [
          ["quant",["q_pct_pl","q_num_int"],"Quant Mixed 04–07 Hard-Tier Redo Clinic","Re-work missed Hard items from Mixed Sets 04–07 cleanly from scratch.","qm_05",1.2],
          ["reason",["r_seating_syl","r_blood_dir"],"Reasoning Mixed Drill: Seating + Blood","Complete 8 combined seating & coded relation problems cleanly in 12m.","r_guide",0.7],
          ["verbal",["v_rc"],"Verbal 07 RC Hard Pt 2 (Q126–150)","Finish Hard passages; inspect wrong option patterns (out-of-scope vs extreme).","v_07",0.8]
        ],
        [
          ["quant",["q_simp","q_ratio_avg"],"Mental Arithmetic & Squares/Cubes Recall","Verify squares to 30, cubes to 15, primes < 100 & fractions 1/2..1/16.","qm_04",0.8],
          ["reason",["r_mock_speed"],"Week 6 Redo + Complete Reasoning Guide Review","Clear Week 6 ~ items and close out any unread pages of Reasoning Guide.","r_guide",0.8],
          ["verbal",["v_rc"],"Verbal 07 Hard RC Post-Mortem & Redo","Re-read 2 toughest passages and trace paragraph-by-paragraph main argument.","v_07",0.7]
        ],
        [
          ["quant",["q_di"],"Mixed 01–07 DI Caselet Speed Review","Re-attempt 2 slowest DI caselets aiming for sub-4m completion.","qm_07",0.9],
          ["reason",["r_mock_speed"],"Prepare Mock Test Rules for Week 8","Set strict timer (25 min, no calculator, scratch pad only) ahead of NQT Mock 1.","r_mocks",0.5],
          ["verbal",["v_rc","v_parajumble"],"Verbal Topic-Wise Gate Check (01–07 Done!)","Confirm all 7 Verbal topic PDFs complete; note weakest topic before Verbal Mixed Sets.","v_07",0.5]
        ]
      ]
    },
    {
      id: 8,
      month: 2,
      title: "Quant Mixed 08–10, Timed NQT Mock 1 & Verbal Mixed 01–02",
      focus: ["Quant Mixed Sets 08–10","TCS NQT Timed Mock 1 (A1.1–A1.20)","Verbal Mixed Sets 01–02"],
      practiceTag: "Quant Mix 08–10 • NQT Mock 1 • Verbal Mix 01–02",
      targets: [
        {"id":"aw8_q","track":"quant","text":"Complete Quant Mixed Sets 08, 09 and 10 across all difficulty tiers."},
        {"id":"aw8_r","track":"reason","text":"Sit TCS NQT Timed Mock 1 (Numerical Ability A1.1–A1.20, 25 min) & audit every error."},
        {"id":"aw8_v","track":"verbal","text":"Finish Verbal Mixed Sets 01 and 02 (300 shuffled questions across all 7 topics + RC)."}
      ],
      days: [
        [
          ["quant",["q_simp","q_pct_pl","q_di"],"Quant Mixed Set 08 (150 Qs Timed)","Execute Mixed Set 08 with strict Pass 1 / Pass 2 triage.","qm_08",1.6],
          ["reason",["r_mock_speed","q_pct_pl"],"TCS NQT Timed Mock 1 (A1.1–A1.20, 25m!)","Sit Mock 1 Numerical Ability in exact 25 minutes without pausing or hints.","r_mocks",0.9],
          ["verbal",["v_vocab","v_grammar","v_rc"],"Verbal Mixed Set 01 Easy (Q1–50, 35m)","Sit shuffled Basic Verbal + RC passage under 35m clock.","vm_01",0.7]
        ],
        [
          ["quant",["q_ratio_avg","q_tw_ts","q_di"],"Quant Mixed Set 09 Pt 1 (Easy + Med)","Complete Mixed Set 09 Easy & Medium sections checking SI/CI & Time/Work speed.","qm_09",1.2],
          ["reason",["r_mock_speed","q_pnc_prob"],"Mock 1 Post-Mortem (Hints -> Full Key)","Inspect Mock 1 misses (e.g., A1.11 Remainder 7^100, A1.17 Clock 9:15, A1.14 Two Aces).","r_mocks",0.8],
          ["verbal",["v_idioms","v_sent","v_parajumble"],"Verbal Mixed Set 01 Medium + Hard (Q51–150)","Sit Medium (45m) & Hard (55m) sections of Verbal Mixed Set 01.","vm_01",1.3]
        ],
        [
          ["quant",["q_stats_geo","q_num_int","q_di"],"Quant Mixed Set 09 Pt 2 (Hard + Redo)","Finish Mixed Set 09 Hard tier and log conceptual errors.","qm_09",1.3],
          ["reason",["q_num_int","q_pnc_prob"],"Mock 1 Blind Re-Attempt of Missed Qs","Re-solve every missed Mock 1 problem on blank paper in <90s each.","r_mocks",0.7],
          ["verbal",["v_rc","v_parajumble"],"Verbal Mixed Set 01 Key & RC Audit","Check RC inference and Para-Jumble accuracy from Mixed 01 key.","vm_01",0.6]
        ],
        [
          ["quant",["q_pct_pl","q_tw_ts","q_di"],"Quant Mixed Set 10 (150 Qs Full Sitting)","Complete Mixed Set 10 checking DI + Mensuration calculation accuracy.","qm_10",1.6],
          ["reason",["r_series_code","r_seating_syl"],"Pre-Mock 2 Reasoning Warm-up Drill","Drill 6 circular seating & syllogism items ahead of Week 9 Mock 2.","r_guide",0.7],
          ["verbal",["v_vocab","v_grammar","v_sent"],"Verbal Mixed Set 02 Easy + Medium (Q1–100)","Sit Easy (35m) & Medium (45m) tiers of Verbal Mixed Set 02.","vm_02",1.1]
        ],
        [
          ["quant",["q_di","q_simp"],"Mixed 08–10 Hard Redo & Shortcut Audit","Inspect Hard questions missed in Mixed 08–10; apply algebraic shortcuts.","qm_10",1.2],
          ["reason",["r_mock_speed"],"25-Min Numerical Pacing Time-Budget Review","Check Q-by-Q time spent in Mock 1; identify time-sink traps to skip earlier.","r_mocks",0.6],
          ["verbal",["v_parajumble","v_rc","v_idioms"],"Verbal Mixed Set 02 Hard (Q101–150, 55m)","Complete Mixed Set 02 Hard section + RC passage cleanly.","vm_02",1]
        ],
        [
          ["quant",["q_pct_pl","q_num_int"],"Month 2 Mixed 01–10 Weak-Topic Synthesis","Pull top 2 weakest topics from Mixed Sets 01–10 and re-drill 10 Qs each.","qm_08",1.2],
          ["reason",["r_seating_syl","r_blood_dir"],"Week 7 Redo + Logic Edge Review","Clear Week 7 ~ items and check Data Sufficiency traps.","r_guide",0.7],
          ["verbal",["v_rc","v_grammar"],"Verbal Mixed 01–02 Redo Sweep","Re-test all flagged ~ items from Verbal Mixed 01 & 02.","vm_02",0.6]
        ],
        [
          ["quant",["q_di"],"Month 2 Quant Milestone Check","Verify all 11 Quant chapters + Mixed Sets 01–10 checked off cleanly.","q_11",0.8],
          ["reason",["r_mock_speed"],"Month 2 Reasoning Milestone Check","Verify Reasoning Guide Ch.1–7 + NQT Mock 1 audited.","r_mocks",0.6],
          ["verbal",["v_rc","v_vocab"],"Month 2 Verbal Milestone Check","Verify Verbal 01–07 + Verbal Mixed 01–02 audited.","vm_02",0.5]
        ]
      ]
    },
    {
      id: 9,
      month: 3,
      title: "Quant Mixed 11–13, Timed NQT Mock 2 & Verbal Mixed 03",
      focus: ["Quant Mixed Sets 11–13","TCS NQT Timed Mock 2 (A2.1–A2.20)","Verbal Mixed Set 03 + Drills"],
      practiceTag: "Quant Mix 11–13 • NQT Mock 2 • Verbal Mix 03",
      targets: [
        {"id":"aw9_q","track":"quant","text":"Complete Quant Mixed Sets 11, 12 and 13 under strict no-calculator exam timing."},
        {"id":"aw9_r","track":"reason","text":"Sit TCS NQT Timed Mock 2 (Reasoning Ability A2.1–A2.20, 25 min) & master seating/cube/syllogism misses."},
        {"id":"aw9_v","track":"verbal","text":"Finish Verbal Mixed Set 03 (150 Qs) + targeted Error-Detection & Vocabulary redo clinic."}
      ],
      days: [
        [
          ["quant",["q_simp","q_pct_pl","q_di"],"Quant Mixed Set 11 Pt 1 (Easy + Med)","Timed Easy (40m) & Medium (65m) sittings tracking speed improvements.","qm_11",1.5],
          ["reason",["r_series_code","r_seating_syl","r_mock_speed"],"TCS NQT Timed Mock 2 (A2.1–A2.20, 25m!)","Sit Mock 2 Reasoning Ability under strict 25-min clock (A2.1–A2.20).","r_mocks",0.9],
          ["verbal",["v_vocab","v_grammar"],"Verbal Mixed Set 03 Easy (Q1–50, 35m)","Complete shuffled Basic Verbal + RC under 35m timer.","vm_03",0.7]
        ],
        [
          ["quant",["q_num_int","q_stats_geo","q_di"],"Quant Mixed Set 11 Pt 2 (Hard 90m)","Sit Mixed Set 11 Hard section; log toughest arithmetic/DI traps.","qm_11",1.4],
          ["reason",["r_seating_syl","r_blood_dir"],"Mock 2 Post-Mortem: Circular/Syllogism/Cube","Verify A2.13 circular seating, A2.12 syllogisms, A2.18 3:40 mirror & A2.20 cube cuts.","r_mocks",0.8],
          ["verbal",["v_idioms","v_sent"],"Verbal Mixed Set 03 Medium (Q51–100, 45m)","Sit Mixed Set 03 Medium tier carefully checking modifier/parallelism items.","vm_03",0.8]
        ],
        [
          ["quant",["q_ratio_avg","q_tw_ts","q_di"],"Quant Mixed Set 12 (150 Qs Full Sitting)","Complete Mixed Set 12 with active time-budget triage.","qm_12",1.6],
          ["reason",["r_seating_syl"],"Painted Cube & Data Sufficiency Speed Clinic","Practise (n-2)^3 / 12(n-2) / 6(n-2)^2 cube formulas + 5 DS questions.","r_mocks",0.7],
          ["verbal",["v_parajumble","v_rc"],"Verbal Mixed Set 03 Hard (Q101–150, 55m)","Complete Mixed Set 03 Hard section + RC argumentative passage.","vm_03",0.9]
        ],
        [
          ["quant",["q_pct_pl","q_num_int","q_di"],"Quant Mixed Set 13 Pt 1 (Easy + Med)","Execute Mixed Set 13 E/M checking zero careless sign or unit errors.","qm_13",1.3],
          ["reason",["r_blood_dir","r_series_code"],"Mock 2 Blind Re-Attempt of Missed Qs","Re-solve every missed Mock 2 reasoning item from scratch under 60s.","r_mocks",0.7],
          ["verbal",["v_grammar"],"Targeted Grammar Redo Clinic (20 Tough Qs)","Drill 20 previously missed Error Detection sentences from Verbal 03 + Mixed 01–03.","v_03",0.7]
        ],
        [
          ["quant",["q_stats_geo","q_tw_ts","q_di"],"Quant Mixed Set 13 Pt 2 (Hard + Audit)","Finish Mixed Set 13 Hard section; verify DI & SI/CI solutions.","qm_13",1.4],
          ["reason",["r_seating_syl"],"Two-Case Seating Elimination Speed Drill","Solve 3 circular + row seating sets drawing parallel branches quickly.","r_guide",0.8],
          ["verbal",["v_vocab","v_idioms"],"Confusable Pairs & Idioms Speed Flash","Review 30 toughest Vocab/Idiom cards in 20 minutes.","v_02",0.5]
        ],
        [
          ["quant",["q_simp","q_pct_pl"],"Week 8 Redo + Mixed 11–13 Audit","Clear Week 8 ~ items + re-attempt missed Mixed 11–13 Hard stems.","qm_12",1.1],
          ["reason",["r_mock_speed"],"Mock 1 & 2 Combined Time-Per-Question Check","Confirm average time <= 65s/question across easy/medium items.","r_mocks",0.6],
          ["verbal",["v_rc","v_parajumble"],"Verbal Mixed 03 Redo of Missed Qs","Re-solve every missed Mixed 03 Para-Jumble & RC inference item.","vm_03",0.6]
        ],
        [
          ["quant",["q_di"],"Rapid Table Ratio Cross-Check","Practise visual magnitude comparison without full division on 4 DI charts.","q_11",0.7],
          ["reason",["r_seating_syl"],"Syllogism 256-World Sanity Checklist","Double-check negative premises ('No A is B', 'Some B are not C') inferences.","r_guide",0.6],
          ["verbal",["v_sent"],"Clauses & Connectors Quick Check","Self-test 8 complex sentence completions cleanly.","v_04",0.5]
        ]
      ]
    },
    {
      id: 10,
      month: 3,
      title: "Quant Mixed 14–16, Timed NQT Mock 3 & Verbal Mixed 04",
      focus: ["Quant Mixed Sets 14–16","TCS NQT Timed Mock 3 (A3.1–A3.20)","Verbal Mixed Set 04 + Drills"],
      practiceTag: "Quant Mix 14–16 • NQT Mock 3 • Verbal Mix 04",
      targets: [
        {"id":"aw10_q","track":"quant","text":"Complete Quant Mixed Sets 14, 15 and 16 pushing Hard-tier accuracy > 75%."},
        {"id":"aw10_r","track":"reason","text":"Sit TCS NQT Timed Mock 3 (Mixed Quantitative + Reasoning A3.1–A3.20, 25 min) & audit traps."},
        {"id":"aw10_v","track":"verbal","text":"Finish Verbal Mixed Set 04 (150 Qs) + timed Para-Jumble & Sentence Building sprint."}
      ],
      days: [
        [
          ["quant",["q_pct_pl","q_tw_ts","q_di"],"Quant Mixed Set 14 Pt 1 (Easy + Med)","Timed E/M sitting of Mixed Set 14 tracking zero silly mistakes.","qm_14",1.3],
          ["reason",["r_mock_speed","q_pnc_prob","r_seating_syl"],"TCS NQT Timed Mock 3 (A3.1–A3.20, 25m!)","Sit Mock 3 Mixed NQT paper in exact 25 minutes across Num + Reasoning.","r_mocks",0.9],
          ["verbal",["v_vocab","v_sent"],"Verbal Mixed Set 04 Easy (Q1–50, 35m)","Timed Basic Mixed Set 04 completion + RC passage.","vm_04",0.7]
        ],
        [
          ["quant",["q_num_int","q_stats_geo","q_di"],"Quant Mixed Set 14 Pt 2 (Hard 90m)","Sit Mixed Set 14 Hard tier; focus on smart skip-order across tough problems.","qm_14",1.4],
          ["reason",["q_pnc_prob","r_seating_syl"],"Mock 3 Post-Mortem: Mislabelled Boxes & Clocks","Audit A3.17 Mislabelled Boxes (draw 1 from mixed!), A3.18 hands together (16 4/11m) & A3.9 125!.","r_mocks",0.8],
          ["verbal",["v_grammar","v_idioms"],"Verbal Mixed Set 04 Medium (Q51–100, 45m)","Sit Mixed Set 04 Medium tier cleanly.","vm_04",0.8]
        ],
        [
          ["quant",["q_simp","q_ratio_avg","q_di"],"Quant Mixed Set 15 (150 Qs Timed)","Full Mixed Set 15 execution highlighting Remainders, Profit/Loss & DI.","qm_15",1.6],
          ["reason",["r_mock_speed"],"Mock 3 Blind Re-Attempt of Missed Qs","Re-solve every missed Mock 3 problem cleanly under 75s.","r_mocks",0.7],
          ["verbal",["v_parajumble","v_rc"],"Verbal Mixed Set 04 Hard (Q101–150, 55m)","Finish Mixed Set 04 Hard section & RC analysis.","vm_04",0.9]
        ],
        [
          ["quant",["q_pct_pl","q_num_int","q_di"],"Quant Mixed Set 16 Pt 1 (Easy + Med)","Timed E/M sittings of Mixed Set 16 maintaining >= 90% Easy accuracy.","qm_16",1.3],
          ["reason",["r_blood_dir","q_num_int"],"Divisibility / Remainder / Direction Mini-Set","Solve 10 fast numerical+direction questions in 12 minutes.","r_guide",0.7],
          ["verbal",["v_parajumble","v_sent"],"Para-Jumble & Sentence Building Timed Sprint","Complete 10 Hard Para Jumbles + 10 Sentence Building items in 25m.","v_06",0.7]
        ],
        [
          ["quant",["q_tw_ts","q_stats_geo","q_di"],"Quant Mixed Set 16 Pt 2 (Hard + Audit)","Finish Mixed Set 16 Hard tier and log remaining algebra/geometry bottlenecks.","qm_16",1.4],
          ["reason",["r_mock_speed"],"Shortcuts Audit on Heavy Arithmetic Mock Qs","Verify successive discounts 1-(1-d1)(1-d2) & average speed 2uv/(u+v) reflexes.","r_mocks",0.6],
          ["verbal",["v_rc"],"Mixed 04 RC Passage Argument Audit","Trace why each incorrect RC option failed (distorted, reversed or too narrow).","vm_04",0.6]
        ],
        [
          ["quant",["q_simp","q_di"],"Week 9 Redo + Mixed 14–16 Hard Review","Clear Week 9 ~ items cleanly from blank page.","qm_15",1.1],
          ["reason",["r_seating_syl","r_mock_speed"],"NQT Mock 1–3 Mistake Pattern Log","Group all misses across Mocks 1–3 into careless vs concept gap vs time-out.","r_mocks",0.7],
          ["verbal",["v_grammar","v_parajumble"],"Verbal Mixed 04 Redo Sweep","Re-attempt all flagged Mixed 04 questions without notes.","vm_04",0.6]
        ],
        [
          ["quant",["q_pct_pl","q_ratio_avg"],"Fast Ratio-Fraction Mental Check","Verify zero paper-waste on routine percentage-ratio conversions.","qm_14",0.7],
          ["reason",["q_pnc_prob"],"Calendar & Clock Coincidence Flash Drill","Compute 3 date days + 2 clock hand-angle questions in 4 minutes.","r_guide",0.5],
          ["verbal",["v_vocab"],"Hard Near-Synonym Nuance Check","Review Week 10 flagged vocabulary nuance notes.","vm_04",0.4]
        ]
      ]
    },
    {
      id: 11,
      month: 3,
      title: "Quant Mixed 17–19, Combined Reasoning Sprint & Verbal 05",
      focus: ["Quant Mixed Sets 17–19","Combined Reasoning + Adv Quant Sprint","Verbal Mixed Set 05 + RC Sprint"],
      practiceTag: "Quant Mix 17–19 • Reasoning Sprint • Verbal Mix 05",
      targets: [
        {"id":"aw11_q","track":"quant","text":"Complete Quant Mixed Sets 17, 18 and 19 cleanly under exam-day pressure."},
        {"id":"aw11_r","track":"reason","text":"Execute combined Reasoning + Adv Quant speed sprints across all weak subtopics."},
        {"id":"aw11_v","track":"verbal","text":"Complete Verbal Mixed Set 05 (150 Qs) + timed Hard RC inference drills."}
      ],
      days: [
        [
          ["quant",["q_simp","q_pct_pl","q_di"],"Quant Mixed Set 17 Pt 1 (Easy + Med)","Timed E/M sittings of Mixed Set 17 maintaining clean pacing.","qm_17",1.3],
          ["reason",["r_series_code","r_blood_dir"],"Combined Reasoning Sprint: Series + Blood + Dir","Solve 15 mixed Reasoning I problems cleanly under 18 minutes.","r_guide",0.8],
          ["verbal",["v_vocab","v_idioms"],"Verbal Mixed Set 05 Easy (Q1–50, 35m)","Sit Mixed Set 05 Easy section aiming for >= 92% accuracy.","vm_05",0.7]
        ],
        [
          ["quant",["q_ratio_avg","q_tw_ts","q_di"],"Quant Mixed Set 17 Pt 2 (Hard + Audit)","Finish Mixed Set 17 Hard tier + audit DI & train/boat misses.","qm_17",1.4],
          ["reason",["r_seating_syl"],"Combined Reasoning Sprint: Seating & Syl/DS","Complete 10 mixed Reasoning II items under strict timer.","r_mocks",0.8],
          ["verbal",["v_grammar","v_sent"],"Verbal Mixed Set 05 Medium (Q51–100, 45m)","Sit Mixed Set 05 Medium section smoothly.","vm_05",0.8]
        ],
        [
          ["quant",["q_num_int","q_stats_geo","q_di"],"Quant Mixed Set 18 (150 Qs Full Sitting)","Execute Mixed Set 18 focusing on Geometry/Stats/P&C integration.","qm_18",1.6],
          ["reason",["q_num_int","q_pnc_prob"],"Combined Adv Quant Sprint: P&C, Prob & Rem.","Solve 10 mixed Ch.1–4 Adv Quant problems cleanly in 14m.","r_guide",0.7],
          ["verbal",["v_parajumble","v_rc"],"Verbal Mixed Set 05 Hard (Q101–150, 55m)","Finish Mixed Set 05 Hard section + argumentative RC.","vm_05",0.9]
        ],
        [
          ["quant",["q_simp","q_pct_pl","q_di"],"Quant Mixed Set 19 Pt 1 (Easy + Med)","Timed E/M sittings of Mixed Set 19 pushing speed.","qm_19",1.3],
          ["reason",["r_mock_speed"],"Two-Pass Exam Triage Dress Rehearsal","Simulate picking best 16/20 Qs first on unseen mixed prompt batch.","r_mocks",0.7],
          ["verbal",["v_rc"],"Timed Hard RC Inference & Assumption Lab","Practise 3 Hard RC passages from Verbal 07 / Mixed 05 under strict 24m cap.","v_07",0.8]
        ],
        [
          ["quant",["q_num_int","q_tw_ts","q_di"],"Quant Mixed Set 19 Pt 2 (Hard + Audit)","Complete Mixed Set 19 Hard section and verify DI calculations.","qm_19",1.4],
          ["reason",["r_seating_syl","r_mock_speed"],"High-Trap Reasoning Review","Review circular left/right, Data Sufficiency II-alone trap & painted cube edges.","r_guide",0.6],
          ["verbal",["v_grammar","v_parajumble"],"Mixed 05 Key Audit & Weak-Rule Fix","Audit every Mixed 05 error across grammar, jumbles & RC.","vm_05",0.6]
        ],
        [
          ["quant",["q_pct_pl","q_stats_geo"],"Week 10 Redo + Mixed 17–19 Recovery","Clear Week 10 ~ flags cleanly without referencing working.","qm_18",1.1],
          ["reason",["r_series_code","q_pnc_prob"],"Timed 10-Min Mixed Reasoning Blitz","Answer 10 mixed series/coding/clock Qs cleanly in 10m.","r_mocks",0.6],
          ["verbal",["v_parajumble","v_rc"],"Verbal Mixed 05 Redo of Missed Questions","Re-solve every Week 11 missed Verbal item cleanly.","vm_05",0.6]
        ],
        [
          ["quant",["q_simp","q_di"],"Final Pre-Capstone Formula Scan","Verify zero fuzzy formulas across Ch.01–11 (SI/CI, Boats, SD, Volume).","q_10",0.7],
          ["reason",["r_mock_speed"],"Mental Reset & Exam-Clock Calibrations","Set target checkpoint times (Min 12, Min 22, Min 25) for Week 12 Mock re-run.","r_mocks",0.5],
          ["verbal",["v_sent","v_vocab"],"Verbal High-Yield Transition & Preposition Scan","Quick 20m scan of top verbal pitfalls.","v_04",0.4]
        ]
      ]
    },
    {
      id: 12,
      month: 3,
      title: "Capstone Aptitude Finale: Mixed 20, Mock Re-Test & Verbal 06",
      focus: ["Quant Mixed Set 20 + Full Redo","Mocks 1–3 Re-Test & Formula Audit","Verbal Mixed Set 06 + Cheat Sheet"],
      practiceTag: "Quant Mix 20 • NQT Mock Re-Test • Verbal Mix 06",
      targets: [
        {"id":"aw12_q","track":"quant","text":"Complete final Quant Mixed Set 20 + clear every remaining Hard Redo item across Ch.01–11 & Mixed 01–20."},
        {"id":"aw12_r","track":"reason","text":"Re-sit toughest items from TCS NQT Timed Mocks 1–3 cleanly under strict 25-min speed discipline."},
        {"id":"aw12_v","track":"verbal","text":"Complete final Verbal Mixed Set 06 (150 Qs) & achieve >= 85% across all 6 Verbal skill areas."}
      ],
      days: [
        [
          ["quant",["q_simp","q_pct_pl","q_di"],"Quant Mixed Set 20 Pt 1 (Easy + Med)","Timed final E/M sitting of Mixed Set 20 with clean speed & accuracy.","qm_20",1.3],
          ["reason",["r_mock_speed","q_num_int"],"TCS NQT Mock 1–2 Toughest Qs Re-Attempt","Re-sit the 12 hardest items across Mock 1 & Mock 2 under strict 15-min timer.","r_mocks",0.8],
          ["verbal",["v_vocab","v_grammar"],"Verbal Mixed Set 06 Easy (Q1–50, 35m)","Sit final Verbal Mixed Set 06 Basic tier calmly and accurately.","vm_06",0.7]
        ],
        [
          ["quant",["q_ratio_avg","q_stats_geo","q_di"],"Quant Mixed Set 20 Pt 2 (Hard 90m)","Sit final Hard tier of Mixed Set 20 cleanly calculating DI caselets.","qm_20",1.4],
          ["reason",["r_seating_syl","q_pnc_prob"],"TCS NQT Mock 3 Toughest Qs Re-Attempt","Re-solve toughest Mock 3 puzzles & clock/prob stems cleanly.","r_mocks",0.8],
          ["verbal",["v_idioms","v_sent"],"Verbal Mixed Set 06 Medium (Q51–100, 45m)","Sit final Mixed Set 06 Medium section cleanly.","vm_06",0.8]
        ],
        [
          ["quant",["q_simp","q_tw_ts","q_num_int"],"All-Time Toughest Quant Redo Clear-Out","Zero out every remaining ~ flag across Simplification, P&L, TSD & Stats.","q_01",1.2],
          ["reason",["r_series_code","r_blood_dir"],"Complete Reasoning Pattern Quick-Check","Verify 100% fluency on series, coding, blood trees, seating & syllogisms.","r_guide",0.7],
          ["verbal",["v_parajumble","v_rc"],"Verbal Mixed Set 06 Hard (Q101–150, 55m)","Complete final Mixed Set 06 Hard tier + RC passage.","vm_06",0.9]
        ],
        [
          ["quant",["q_di","q_pct_pl"],"DI + Percentage Calculation Reflex Drill","Work 2 high-density DI sets relying on fraction/percentage estimation.","qm_20",0.9],
          ["reason",["r_mock_speed"],"Full Formula & Shortcut Cheat-Sheet Audit","Write 1-page Quant+Reasoning cheat sheet from memory in 15m.","r_guide",0.6],
          ["verbal",["v_grammar","v_vocab"],"Verbal Mixed Set 06 Final Error Audit","Audit final Mixed 06 misses; log any remaining confusable pairs.","vm_06",0.6]
        ],
        [
          ["quant",["q_num_int","q_pnc_prob","q_stats_geo"],"Simulated NQT Quant Final Dress Rehearsal","20 mixed Hard/Med Quant Qs in 25 min simulating exact test conditions.","qm_19",1],
          ["reason",["r_seating_syl","r_mock_speed"],"Simulated NQT Reasoning Final Dress Rehearsal","20 mixed Reasoning Qs in 25 min simulating exact test conditions.","r_mocks",0.8],
          ["verbal",["v_rc","v_parajumble","v_sent"],"Simulated NQT Verbal Final Dress Rehearsal","24 mixed Verbal Qs (Grammar+ParaJumble+RC) in 25 min.","vm_06",0.7]
        ],
        [
          ["quant",["q_simp","q_pct_pl","q_ratio_avg","q_tw_ts"],"Final Tracker Redo Queue Zero-Out (Quant)","Confirm Redo Queue is empty across Quant Ch.01–11 & Mixed 01–20.","q_05",0.8],
          ["reason",["r_series_code","r_blood_dir","r_seating_syl"],"Final Redo Queue Zero-Out (Reasoning)","Confirm all Reasoning & Adv Quant ~ items marked Mastered.","r_mocks",0.6],
          ["verbal",["v_vocab","v_idioms","v_grammar","v_rc"],"Final Redo Queue Zero-Out (Verbal)","Confirm all Verbal ~ items mastered cleanly.","vm_06",0.6]
        ],
        [
          ["quant",["q_simp","q_pct_pl","q_ratio_avg","q_tw_ts","q_stats_geo","q_di","q_num_int","q_pnc_prob"],"Quant Exam-Day Sign-Off (31/31 PDFs)","All 11 Chapters + 20 Mixed Sets tracked & complete. Light 15m/day maintenance before test!","qm_20",0.6],
          ["reason",["r_series_code","r_blood_dir","r_seating_syl","r_mock_speed"],"Reasoning & NQT Mocks Sign-Off","Review 25-min two-pass exam strategy checklist; trust your practice.","r_mocks",0.5],
          ["verbal",["v_vocab","v_idioms","v_grammar","v_sent","v_parajumble","v_rc"],"Verbal Exam-Day Sign-Off (13/13 PDFs)","All 7 Topics + 6 Mixed Sets tracked & complete — ready for TCS NQT & placements!","vm_06",0.5]
        ]
      ]
    }
  ]
  });
})();
