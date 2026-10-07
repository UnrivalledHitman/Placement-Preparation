# How to use this practice book
%52 exercises matching the DBMS Theory guide, with hints kept separate and executed solutions

Each part matches chapters of the **DBMS Theory** guide. Read the chapter, then solve its exercises **on paper first**: normalisation, schedules and B+ trees are tested by hand in written rounds and viva. Only then check yourself with code.

The solutions reuse three small toolkits printed in the guide: `fd.py` (Chapter 3: closures, keys, covers, normal forms, decompositions), `sched.py` (Chapter 4: precedence graphs) and `bplus.py` (Chapter 7: B+ tree). Save them next to your own files and they will check any textbook question, not just the ones here.

| Type | What you do |
|---|---|
| Numerical | Compute an answer by hand (closure, keys, cost, capacity), then verify |
| Concept | Explain, classify or design in words; a short program checks the claim where possible |
| Code | Write or run a small program |

**Marking scheme.** After each attempt, mark it ✓ (solved alone), ~ (solved with the hint) or ✗ (needed the solution). Redo every ~ and ✗ a week later, without looking, and record it in the tracker at the end.

| Part | Guide chapters | Topic | Exercises |
|---|---|---|---|
| 1 | 1–2 | Fundamentals, keys, relational algebra, ER mapping | 6 |
| 2 | 3 | Functional dependencies and normalisation | 13 |
| 3 | 4 | Transactions and schedules | 7 |
| 4 | 5 | Concurrency control | 7 |
| 5 | 6 | Recovery | 4 |
| 6 | 7 | Storage and indexing | 7 |
| 7 | 8 | Query processing | 5 |
| 8 | 9 | Distributed databases and NoSQL | 3 |

# Exercises

## Part 1: Fundamentals, keys and relational algebra

**D1.1 · Easy · Concept · Kinds of data independence.** For each change, say whether the applications are protected by physical or logical data independence: (a) adding an index on `orders.customer_id`; (b) moving the data files from a hard disk to an SSD; (c) splitting `customer` into `customer` and `customer_address`, with a view named `customer` that joins them; (d) adding a column `loyalty_points` that existing queries never mention.

**D1.2 · Easy · Numerical · Counting super keys.** R(A, B, C, D) has four attributes. How many super keys does R have if (a) A is its only candidate key; (b) its candidate keys are A and B; (c) its candidate keys are AB and CD? Verify by brute force.

**D1.3 · Medium · Code · Supplier–parts queries.** Using `Supplier(sid, sname)`, `Part(pid, pname, colour)` and `Catalog(sid, pid, cost)`, write each query in relational algebra and in SQL, and run the SQL on sample data: (a) names of suppliers who supply some red part; (b) ids of suppliers who supply **every** part; (c) ids of suppliers who supply a red part **or** a green part; (d) ids of suppliers who supply a red part **and** a green part.

**D1.4 · Medium · Concept · At least two courses.** Express "roll numbers of students enrolled in at least two different courses" in relational algebra without aggregation (hint: rename and self-join), then check the answer against a `GROUP BY ... HAVING` query in SQL.

**D1.5 · Medium · Concept · Hospital ER to tables.** A hospital has patients and doctors. A doctor treats many patients and a patient may be treated by many doctors; each treatment has a date. Each patient is admitted to exactly one ward, and a ward has many patients. A patient has several allergies. Beds are identified by ward and bed number (a bed cannot exist without its ward). Map this design to tables with keys and foreign keys, and test the key constraints.

**D1.6 · Easy · Numerical · Minimum number of tables.** An ER diagram has entities E1, E2, E3. E1 and E2 are in a 1:N relationship (E1 on the one side), E2 and E3 in an M:N relationship, and E3 has one multivalued attribute. All participation is partial. What is the minimum number of tables needed?

## Part 2: Functional dependencies and normalisation

**D2.1 · Easy · Numerical · Attribute closure.** R(ABCDEF) with F = {AB → C, BC → AD, D → E, CF → B}. Compute (AB)<sup>+</sup> and (CF)<sup>+</sup>. Is AB a key? Is CF?

**D2.2 · Medium · Numerical · All candidate keys.** R(ABCDEF) with F = {AB → C, C → D, D → B, E → F}. Find every candidate key and the prime attributes.

**D2.3 · Medium · Numerical · Keys and normal form.** R(ABCDE) with F = {A → B, BC → E, ED → A}. Find all candidate keys and the highest normal form.

**D2.4 · Easy · Numerical · Implied dependencies.** With F = {A → C, C → D, BD → E}, which of these are implied: (a) A → D; (b) AB → E; (c) B → E; (d) AD → C?

**D2.5 · Medium · Numerical · A minimal cover.** Find a minimal cover of F = {A → B, AB → C, D → AC, D → E}.

**D2.6 · Medium · Numerical · Equivalent sets.** Are F = {A → C, AC → D, E → AD, E → H} and G = {A → CD, E → AH} equivalent?

**D2.7 · Medium · Numerical · Highest normal form, five times.** Find the candidate keys and highest normal form of: (a) R(ABCD), {A → B, B → C}; (b) R(ABCD), {AB → C, C → D}; (c) R(ABCD), {AB → CD, C → A}; (d) R(ABCDE), {AB → CDE, D → A}; (e) R(ABC), {A → B, B → A, A → C}.

**D2.8 · Hard · Numerical · BCNF decomposition.** Decompose R(ABCDE) with F = {AB → C, C → D, D → E} into BCNF. Show each step, then check that the result is lossless and dependency preserving.

**D2.9 · Medium · Numerical · 3NF synthesis.** Use the 3NF synthesis algorithm on (a) R(ABCDEF) with F = {A → BC, C → DE, E → F}; (b) R(ABCDE) with F = {A → B, C → D}. Explain why (b) needs an extra schema.

**D2.10 · Medium · Numerical · Lossless or lossy?** (a) R(ABCDE) split into ABC and CDE with F = {A → B, C → D}; (b) the same split with F = {A → B, C → DE}; (c) R(ABCD) split into AB, BC, CD with F = {A → B, B → C, C → D}.

**D2.11 · Medium · Numerical · The cyclic preservation trap.** R(ABCD) with F = {A → B, B → C, C → D, D → A} is decomposed into AB, BC and CD. Is D → A preserved, even though no part contains both D and A?

**D2.12 · Hard · Concept · An MVD in disguise.** `EmpSkillProject(emp, skill, project)` stores, for each employee, every combination of their skills and their projects. (a) Which MVDs hold? (b) What is the highest normal form? (c) Decompose it, and count the rows before and after for an employee with 3 skills and 4 projects.

**D2.13 · Medium · Concept · A real 2NF violation.** `OrderLine(order_id, product_id, qty, product_name, unit_price, order_date, customer_id)` has key (order_id, product_id). Name the partial dependencies, decompose to 3NF, and say which anomalies the original table suffers from.

## Part 3: Transactions and schedules

**D3.1 · Easy · Concept · Spot the conflicts.** List every conflicting pair in S = R1(A) R2(B) W2(A) R1(B) W1(B), with its type (read–write, write–read, write–write).

**D3.2 · Medium · Numerical · Conflict serialisable?** For each schedule, draw the precedence graph and give every equivalent serial order (or say none exists): (a) R1(X) R2(Y) W1(X) R3(X) W2(Y) W3(X); (b) R1(A) R2(B) W2(A) W1(B); (c) R2(X) W3(X) R1(X) W1(X) W2(Y) R3(Y); (d) R1(A) W2(A) R3(A) W1(B) R2(B) W3(B).

**D3.3 · Medium · Numerical · View serialisability.** Is S = R1(A) W2(A) R3(A) W1(A) W3(A) conflict serialisable? View serialisable? If view serialisable, to which serial order?

**D3.4 · Hard · Numerical · Counting schedules.** T1 = R1(A) W1(A) R1(B) and T2 = R2(A) W2(A). (a) How many schedules (interleavings that keep each transaction's order) are there? (b) How many are conflict serialisable?

**D3.5 · Medium · Concept · Recoverability.** Classify each as not recoverable, recoverable only, cascadeless but not strict, or strict: (a) W1(A) R2(A) C1 C2; (b) W1(A) R2(A) C2 C1; (c) W1(A) W2(A) C2 C1; (d) R1(A) W2(A) C2 R1(A) C1.

**D3.6 · Easy · Concept · Which ACID property?** Name the property that is violated: (a) after a crash, a confirmed booking is missing; (b) a transfer debited one account but the crash happened before the credit, and the debit remains; (c) a report sees half of another transaction's updates; (d) an order is accepted with quantity −5 because no rule forbids it.

**D3.7 · Hard · Numerical · Topological orders.** A precedence graph over T1–T4 has edges T1 → T2, T1 → T3, T2 → T4 and T3 → T4. How many equivalent serial schedules are there? What changes if T4 → T1 is added?

## Part 4: Concurrency control

**D4.1 · Medium · Concept · Is it two-phase?** T1 executes: lock-S(A), read A, lock-X(B), unlock(A), write B, lock-S(C), read C, unlock(B), unlock(C). Does T1 follow 2PL? Where is its lock point? Is it strict 2PL?

**D4.2 · Medium · Code · Simulate the deadlock.** Under strict 2PL, T1 = W(A) R(B) and T2 = W(B) R(A) run in the order T1, T2, T1, T2. Trace the locks, show the wait-for graph, and say which transaction is aborted if the youngest is chosen.

**D4.3 · Medium · Concept · Wait-die and wound-wait decisions.** Timestamps: T1 = 5, T2 = 10, T3 = 15 (smaller is older). For each request, give the action under wait-die and under wound-wait: (a) T1 requests a lock held by T2; (b) T3 requests a lock held by T2; (c) T2 requests a lock held by T1.

**D4.4 · Medium · Numerical · Timestamp ordering trace.** Using TS(Ti) = i, run S = R2(A) R1(A) W1(A) W2(A) R3(A) W3(A) under basic TO, then under the Thomas write rule. Which operations cause aborts?

**D4.5 · Hard · Code · Write skew and its fix.** A meeting room can be booked by at most one team per slot. Two transactions each check "no booking exists for slot 10:00" and then insert their own booking row. Show that snapshot isolation commits both, then show a fix that makes first-committer-wins catch the conflict.

**D4.6 · Medium · Concept · Minimum isolation level.** Give the weakest standard level that prevents the problem: (a) a dashboard must never show a rolled-back value; (b) a report reads the same row twice and must get the same value; (c) a count of seats in a `WHERE` range must not change during the transaction; (d) the on-call doctors problem.

**D4.7 · Medium · Concept · Intention locks.** With multiple-granularity locking (database → table → row), which locks does a transaction take to (a) read one row; (b) update one row; (c) read the whole table and update a few rows? Can (b) run at the same time as another transaction holding S on the whole table?

## Part 5: Recovery

**D5.1 · Medium · Numerical · Recover from a log.** Initial values A = 100, B = 200, C = 300, D = 400. Log: ⟨T1 start⟩ ⟨T1, A, 100, 150⟩ ⟨T2 start⟩ ⟨T2, B, 200, 250⟩ ⟨T1 commit⟩ ⟨checkpoint {T2}⟩ ⟨T3 start⟩ ⟨T3, C, 300, 350⟩ ⟨T2, D, 400, 450⟩ ⟨T3 commit⟩ — crash. Which transactions are redone and undone, and what are the final values?

**D5.2 · Medium · Concept · Buffer policies.** For each combination of steal/no-steal and force/no-force, say whether recovery needs undo, redo, both or neither, and why real systems choose steal + no-force.

**D5.3 · Hard · Numerical · ARIES analysis pass.** A fuzzy checkpoint at LSN 50 records TT = {T1: 40} and DPT = {P1: 20, P2: 40}. After it: LSN 60 T2 updates P3; LSN 70 T1 commits; LSN 80 T1 end; LSN 90 T2 updates P1; LSN 100 T3 updates P4. Crash. Give the final TT, DPT, losers and the redo start LSN.

**D5.4 · Easy · Concept · Why these rules?** Explain (a) why undo must process the log backwards; (b) what goes wrong if a dirty page reaches disk before its log record; (c) what goes wrong if commit is acknowledged before the commit record is flushed.

## Part 6: Storage and indexing

**D6.1 · Medium · Numerical · B+ tree order.** Blocks are 512 bytes, keys 10 bytes, child pointers 6 bytes and record pointers 8 bytes. Find the internal order p and the number of entries per leaf n.

**D6.2 · Medium · Numerical · Capacity bounds.** With p = 32 and n = 28 from D6.1, how many records can a B+ tree of height 3 hold at most? At least (every non-root node minimally full, root with two children)?

**D6.3 · Medium · Code · Build a tree.** Insert 1, 4, 7, 10, 17, 21, 31, 25, 19, 20, 28, 42 into an empty B+ tree of order 4. Draw the final tree, then check with `bplus.py`.

**D6.4 · Medium · Numerical · Extendible hashing.** Bucket capacity 2, hash = the key itself, directory indexed by the last bits. Insert 16, 4, 6, 22, 24, 10, 31, 7. What is the final global depth, and which keys share a bucket?

**D6.5 · Easy · Numerical · File organisation costs.** A table has 10 000 pages. Give the expected page reads for an equality search on the key with (a) a heap file; (b) a sorted file with binary search; (c) a B+ tree of height 3 (data in a separate heap).

**D6.6 · Medium · Numerical · Buffer replacement.** With 3 frames, count the hits for the page reference string 1 2 3 4 1 2 5 1 2 3 4 5 under FIFO, LRU and Clock.

**D6.7 · Easy · Concept · Pick the index.** Choose the index type for: (a) `WHERE email = ?` on 10 million users; (b) `WHERE created_at BETWEEN ? AND ?` for an orders table, where results are read in date order; (c) `WHERE status = 'shipped' AND region = 'east'` in a read-only analytics table; (d) `SELECT name FROM users WHERE city = ?` called very frequently.

## Part 7: Query processing

**D7.1 · Medium · Numerical · Join costs.** r has 1 000 pages and 10 000 tuples; s has 500 pages and 5 000 tuples; M = 52 buffer pages. Compute the cost of tuple nested loop, block nested loop (each relation as outer), and hash join. Which wins?

**D7.2 · Medium · Numerical · External sort.** How many passes and page I/Os does an external merge sort of 10 000 pages need with M = 5? With M = 101?

**D7.3 · Medium · Numerical · Size estimates.** `emp` has 10 000 tuples, V(dept_id) = 50, salary uniform between 30 000 and 90 000. `dept` has 50 tuples with key dept_id. Estimate the size of (a) σ<sub>dept_id=7</sub>(emp); (b) σ<sub>salary<45000</sub>(emp); (c) σ<sub>dept_id=7 ∧ salary<45000</sub>(emp); (d) emp ⋈ dept.

**D7.4 · Medium · Concept · Rewrite the tree.** For `SELECT e.name FROM emp e, dept d WHERE e.dept_id = d.id AND d.city = 'Pune' AND e.salary > 80000`, draw the naive query tree (product, then selection, then projection) and the optimised tree after pushing selections and projections down.

**D7.5 · Medium · Code · Predict the plan.** On a table `t(a, b, c)` with indexes on `a` and on `(b, c)`, predict SQLite's plan for: (a) `WHERE a = 5`; (b) `WHERE c = 5`; (c) `SELECT c FROM t WHERE b = 3`; (d) `WHERE a + 1 = 6`. Then check with `EXPLAIN QUERY PLAN`.

## Part 8: Distributed databases

**D8.1 · Easy · Numerical · Quorum choices.** With N = 5 replicas, list the (W, R) pairs with R + W > N and the smallest W + R. Which pair tolerates the most failed replicas for both reads and writes?

**D8.2 · Medium · Concept · CAP choices.** For each system, say whether it should prefer consistency or availability during a network partition, and why: (a) bank account balances; (b) a shopping cart; (c) seat booking for a concert; (d) social media like counts; (e) a configuration store for a cluster's leader election.

**D8.3 · Medium · Code · Rebalancing cost.** Simulate 20 000 keys moving from 10 to 11 nodes with (a) hash mod N and (b) consistent hashing with 200 virtual nodes. What fraction of keys moves in each case, and what is the ideal?
