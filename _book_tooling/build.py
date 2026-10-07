"""Build books: python build.py <key> [<key> ...]   (run from this directory)
Expands ```python run / ```java run blocks (outputs cached), generates the progress tracker for
practice books (a line containing only <<TRACKER>>), and renders the PDF into out/."""
import os, re, sys
os.chdir(os.path.dirname(os.path.abspath(__file__)))
from engine import build
import javarun, pyrun

OUT = 'out'
PRAC_ROWS = lambda first: [['What is inside', 'How to use it'], ['Exercises by chapter, tagged by type and level', first],
                           ['Hints, kept separate', 'Read only the hint you need'],
                           ['Solutions with real output and working', 'Compare even when you solved it'],
                           ['Progress tracker', 'Mark each exercise and schedule redos']]

DOCS = {
    'dbms_guide': dict(file='DBMS_Theory_Complete_Guide.pdf',
        title='DBMS Theory: From Normal Forms to Distributed Data',
        subtitle='The theory beyond SQL: normalisation, serialisability, locking and MVCC, recovery, B+ trees, '
                 'query optimisation and distributed databases, with runnable Python',
        theme='db', kicker='CS core · Database management systems',
        files=['db_0.md', 'db_1.md', 'db_2.md', 'db_3.md', 'db_4.md', 'db_5.md', 'db_6.md'],
        rows=[['What is inside', 'How to use it'],
              ['Chapters 1–3: architecture, keys, relational algebra, FDs and normal forms',
               'Solve each numerical by hand, then check with the code'],
              ['Chapters 4–6: transactions, serialisability, locking, MVCC, recovery and ARIES',
               'The most-asked DBMS interview topics'],
              ['Chapters 7–8: storage, buffer pool, B+ trees, hashing, joins and query optimisation',
               'Numericals on capacity and I/O cost'],
              ['Chapters 9–10: replication, sharding, CAP, 2PC, NoSQL, question bank, formula sheet',
               'Revise before every interview']]),
    'dbms_prac': dict(file='DBMS_Theory_Practice_Book.pdf', title='DBMS Theory: Practice Book',
        subtitle='Exercises matching the DBMS theory guide: closures, normalisation, schedules, locking, recovery, '
                 'B+ trees and join costs, with hints and executed solutions',
        theme='db', kicker='Practice book · DBMS theory', files=['dq.md', 'dh.md', 'ds1.md', 'ds2.md', 'dt.md'],
        rows=PRAC_ROWS('Solve numericals on paper first')),
    'lld_guide': dict(file='Low_Level_Design_Complete_Guide.pdf',
        title='Low-Level Design in Java: Patterns to Case Studies',
        subtitle='OOP, UML, SOLID, the Gang of Four patterns and concurrency, applied to twelve classic '
                 'machine-coding problems, every one a runnable Java program',
        theme='lld', kicker='Design · Low-level design',
        files=['ld_0.md', 'ld_1.md', 'ld_2.md', 'ld_3.md', 'ld_4.md'],
        rows=[['What is inside', 'How to use it'],
              ['Chapters 1–2: OOP, UML, SOLID with violations and refactors', 'The vocabulary of every LLD round'],
              ['Chapters 3–5: creational, structural and behavioural patterns',
               'Learn the problem each pattern solves before its structure'],
              ['Chapter 6: concurrency in design', 'The follow-up question in most rounds'],
              ['Chapters 7–8: twelve case studies, from parking lot to KV store with TTL',
               'Attempt each for 30–45 minutes before reading'],
              ['Chapter 9: interview checklist and cheat sheets', 'Read on the day of the interview']]),
    'lld_prac': dict(file='Low_Level_Design_Practice_Book.pdf', title='Low-Level Design: Practice Book',
        subtitle='41 exercises matching the LLD guide: SOLID refactors, patterns, concurrency, case-study '
                 'extensions and timed mock problems, with runnable Java solutions',
        theme='lld', kicker='Practice book · Low-level design',
        files=['lq.md', 'lh.md', 'ls1.md', 'ls2.md', 'ls3.md', 'lt.md'],
        rows=PRAC_ROWS('Design and code before reading anything')),
    'hld_guide': dict(file='System_Design_Complete_Guide.pdf',
        title='System Design: From Estimates to Case Studies',
        subtitle='Fundamentals, estimation, caching, queues, consistency and microservices, applied to '
                 'thirteen designs, with Python simulations of every key trade-off',
        theme='hld', kicker='Design · High-level system design',
        files=['hd_0.md', 'hd_1.md', 'hd_2.md', 'hd_3.md', 'hd_4.md', 'hd_5.md', 'hd_6.md'],
        rows=[['What is inside', 'How to use it'],
              ['Chapters 1–2: latency, availability, scaling, back-of-envelope estimation',
               'Learn the numbers until they are automatic'],
              ['Chapters 3–6: edge, storage and sharding, caching, asynchronous processing',
               'Know when to use each block and what it costs'],
              ['Chapters 7–8: consistency, reliability patterns, microservices and APIs',
               'The source of most deep-dive questions'],
              ['Chapters 9–10: thirteen case studies, from URL shortener to smart-meter platform',
               'Attempt each for 40 minutes before reading'],
              ['Chapter 11: question bank, numbers and a one-page checklist', 'Revise before every interview']]),
    'hld_prac': dict(file='System_Design_Practice_Book.pdf', title='System Design: Practice Book',
        subtitle='35 exercises matching the System Design guide: estimation drills, component choices, '
                 'mini-designs and full prompts with grading rubrics',
        theme='hld', kicker='Practice book · System design',
        files=['hq.md', 'hh.md', 'hs1.md', 'hs2.md', 'ht.md'],
        rows=PRAC_ROWS('Work on paper with a 40-minute timer for designs')),
    'dsa_guide': dict(file='DSA_in_Java_Complete_Guide.pdf',
        title='DSA in Java: Patterns for Coding Interviews',
        subtitle='Complexity, arrays, binary search, lists, recursion, trees, heaps, graphs, dynamic '
                 'programming, greedy and range queries, with 60 runnable Java programs',
        theme='dsa', kicker='Programming · Data structures and algorithms',
        files=['sa_0.md', 'sa_1.md', 'sa_2.md', 'sa_3.md', 'sa_4.md', 'sa_5.md'],
        rows=[['What is inside', 'How to use it'],
              ['Chapters 1–2: complexity, Java collections, arrays, hashing, two pointers, windows',
               'Week 1 of the 12-week plan'],
              ['Chapters 3–5: binary search, sorting, lists, stacks, queues, backtracking',
               'Weeks 2–4: learn each template until you can write it cold'],
              ['Chapters 6–8: trees, BSTs, heaps, hash maps and graphs', 'Weeks 5–8'],
              ['Chapters 9–11: dynamic programming, greedy, bits, maths, tries, range queries',
               'Weeks 9–11: define the state before coding'],
              ['Chapter 12: pattern table, bug checklist, interview plan', 'Revise before every round']]),
    'dsa_prac': dict(file='DSA_in_Java_Practice_Book.pdf', title='DSA in Java: Practice Book',
        subtitle='Exercises matching the DSA guide, from arrays and binary search to graphs and dynamic '
                 'programming, with hints and executed Java solutions tested against brute force',
        theme='dsa', kicker='Practice book · Data structures and algorithms',
        files=['sq.md', 'sh.md', 'ss1.md', 'ss2.md', 'ss3.md', 'st.md'],
        rows=PRAC_ROWS('Code it and test on edge cases before reading anything')),
    'be_guide': dict(file='Backend_Spring_Boot_Complete_Guide.pdf',
        title='Spring Boot Backend: From Beans to Production',
        subtitle='Dependency injection, REST, JPA and the N+1 problem, transactions, security with JWT, '
                 'testing and operations, with runnable Spring Boot 3 applications',
        theme='be', kicker='Programming · Java backend with Spring Boot',
        files=['be_0.md', 'be_1.md', 'be_2.md', 'be_3.md', 'be_4.md'],
        rows=[['What is inside', 'How to use it'],
              ['Chapters 1–2: Spring Boot, auto-configuration, dependency injection, scopes, proxies',
               'The mechanisms behind every other chapter'],
              ['Chapters 3–5: REST APIs, validation, JPA, N+1, transactions and locking',
               'Predict each output before reading it'],
              ['Chapters 6–7: Spring Security with JWT, unit and slice tests',
               'Re-type the examples into a start.spring.io project'],
              ['Chapters 8–10: observability, Docker, and a complete smart-meter API',
               'Build the project and put it on GitHub'],
              ['Chapter 11: question bank and annotation cheat sheet', 'Revise before every interview']]),
    'be_prac': dict(file='Backend_Spring_Boot_Practice_Book.pdf', title='Spring Boot Backend: Practice Book',
        subtitle='Exercises matching the Spring Boot guide: beans, REST, JPA, transactions, security, '
                 'testing and the smart-meter project, with hints and executed solutions',
        theme='be', kicker='Practice book · Java backend with Spring Boot',
        files=['bq.md', 'bh.md', 'bs1.md', 'bs2.md', 'bt.md'],
        rows=PRAC_ROWS('Predict, then build and run it before reading')),
    'mlsd_guide': dict(file='ML_System_Design_Complete_Guide.pdf',
        title='ML System Design: From Metrics to Monitoring',
        subtitle='Framing, data and leakage, features and skew, evaluation, A/B tests, serving and drift, '
                 'with recommendation, fraud, RAG and LLM-routing case studies in Python',
        theme='mlsd', kicker='AI and ML · Machine learning system design',
        files=['mg_0.md', 'mg_1.md', 'mg_2.md', 'mg_3.md', 'mg_4.md'],
        rows=[['What is inside', 'How to use it'],
              ['Chapters 1–3: framing, metrics, labels, leakage, features and training/serving skew',
               'The questions to ask before choosing a model'],
              ['Chapters 4–5: imbalance, calibration, thresholds, ranking metrics, A/B tests',
               'Change one simulation parameter at a time'],
              ['Chapters 6–7: serving, latency budgets, fan-out, batching, drift and retraining',
               'Learn the numbers'],
              ['Chapters 8–9: feed ranking, search, fraud, ETA, RAG chatbot, LLM routing',
               'Attempt each for 45 minutes before reading'],
              ['Chapter 10: interview plan, numbers and question bank', 'Revise before every interview']]),
    'mlsd_prac': dict(file='ML_System_Design_Practice_Book.pdf', title='ML System Design: Practice Book',
        subtitle='Exercises matching the ML System Design guide: framing, metrics, leakage, calibration, '
                 'experiments, serving, drift and full design prompts, with executed solutions',
        theme='mlsd', kicker='Practice book · Machine learning system design',
        files=['mq.md', 'mh.md', 'ms1.md', 'ms2.md', 'mt.md'],
        rows=PRAC_ROWS('Work numericals on paper; time-box designs to 45 minutes')),
}


def tracker(src):
    ex = re.findall(r'^\*\*([A-Z]\d+\.\d+) · (Easy|Medium|Hard) · ([A-Za-z]+) · (.+?)\.?\*\*', src, re.M)
    rows = ['| Exercise | Title | Type | Level | First try | Redo |', '|---|---|---|---|---|---|']
    rows += [f'| {e} | {t} | {ty} | {lv} |  |  |' for e, lv, ty, t in ex]
    return src.replace('<<TRACKER>>', '\n'.join(rows)), len(ex)


def expand_all(key, d):
    parts = []
    for f in d['files']:
        path = f if os.path.exists(f) else os.path.join('sources', f)   # sources/ holds the markdown
        s = open(path, encoding='utf-8').read()
        s = pyrun.expand(s, f.replace('.md', ''))
        s = javarun.expand(s)
        parts.append(s)
    return '\n'.join(parts)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for k in sys.argv[1:]:
        d = DOCS[k]
        src = expand_all(k, d)
        src, n = tracker(src)
        os.makedirs('tmp', exist_ok=True)
        open(os.path.join('tmp', k + '.expanded.md'), 'w', encoding='utf-8').write(src)
        path = os.path.join(OUT, d['file'])
        build(path, d['title'], d['subtitle'], d['theme'], d['rows'], src, d['kicker'])
        print('built', path, '| exercises in tracker:', n)
