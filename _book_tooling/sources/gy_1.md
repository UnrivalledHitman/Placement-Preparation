## Set D4: Graphs

### Easy

**D4.E1** · MCQ · 1 mark. A tree with 12 vertices has how many edges? (A) 11 (B) 12 (C) 13 (D) 66

**D4.E2** · NAT · 1 mark. What is the largest number of edges in a simple undirected graph with 8 vertices?

**D4.E3** · MCQ · 1 mark. An undirected graph has 15 edges. The sum of its vertex degrees is (A) 30 (B) 15 (C) 45 (D) 225

**D4.E4** · NAT · 1 mark. How many entries does the adjacency matrix of a graph with 6 vertices have?

**D4.E5** · MSQ · 1 mark. Which statements about breadth-first search on a graph stored as adjacency lists are correct? (A) It runs in O(V²) time (B) It uses a queue (C) It finds minimum-weight paths in weighted graphs (D) It finds paths with the fewest edges from the source

**D4.E6** · NAT · 1 mark. An undirected graph has vertex degrees 3, 3, 2, 2, 2. How many edges does it have?

**D4.E7** · MCQ · 1 mark. A directed graph has a topological ordering exactly when it is (A) strongly connected (B) acyclic (C) complete (D) a tree

**D4.E8** · MSQ · 1 mark. Which graphs on 7 vertices must be trees? (A) Connected with 6 edges (B) Acyclic with 5 edges (C) Connected with 7 edges (D) Acyclic with 6 edges

### Medium

**D4.M1** · NAT · 2 marks. An undirected graph has edges 1–2, 1–3, 2–4, 3–4, 4–5, 5–6 and 3–6. What is the BFS distance (in edges) from vertex 1 to vertex 6?

**D4.M2** · MCQ · 2 marks. An undirected graph has edges A–B, A–C, B–D, C–D, D–E and C–F. DFS starts at A and visits neighbours in alphabetical order. The discovery order is (A) A B C D E F (B) A B D C F E (C) A B D E C F (D) A C F D B E

**D4.M3** · MSQ · 2 marks. Gᴿ is obtained from a directed graph G by reversing every edge. Which statements are always true? (A) v is reachable from u in G exactly when u is reachable from v in Gᴿ (B) BFS from u visits the same vertices in G and in Gᴿ (C) G and Gᴿ have the same strongly connected components (D) If G is acyclic, reversing a topological order of G gives a topological order of Gᴿ

**D4.M4** · NAT · 2 marks. A directed graph has vertices 0 to 12 and an edge i → j whenever j = i + 2 or j = i + 3. Adjacency lists are in increasing order, and DFS starts at vertex 0. How many vertices are discovered after vertex 6?

**D4.M5** · MCQ · 2 marks. A directed graph has edges S → A (4), S → B (1), B → A (2), A → C (1) and B → C (5). The shortest distance from S to C is (A) 4 (B) 5 (C) 6 (D) 3

**D4.M6** · NAT · 2 marks. How many topological orderings does the DAG with edges a → b, a → c, b → d and c → d have?

**D4.M7** · MSQ · 2 marks. Which statements about Dijkstra's algorithm are correct? (A) It can give wrong answers when some edge weight is negative (B) It is correct when all edge weights are non-negative (C) It finds longest paths (D) It runs in O(V) time

**D4.M8** · MCQ · 2 marks. Adjacency lists for a directed graph with V vertices and E edges take space (A) Θ(E²) (B) Θ(V²) (C) Θ(V + E) (D) Θ(V log E)

**D4.M9** · NAT · 2 marks. An undirected graph on vertices 1 to 10 has edges 1–2, 2–3, 4–5, 6–7, 7–8 and 8–6. How many connected components does it have?

### Hard

**D4.H1** · NAT · 2 marks. How many spanning trees does the complete graph K₄ have?

**D4.H2** · MCQ · 2 marks. What is the smallest m such that every simple undirected graph with 10 vertices and m edges is connected? (A) 9 (B) 36 (C) 45 (D) 37

**D4.H3** · MSQ · 2 marks. In a simple unweighted undirected graph, a–b–c–d is a shortest path from a to d. Which pairs are definitely NOT edges? (A) (b, d) (B) (a, d) (C) (b, c) (D) (a, c)

**D4.H4** · NAT · 2 marks. Bellman–Ford is run on a graph with 7 vertices and no negative cycles. How many rounds of relaxing every edge guarantee correct distances?

**D4.H5** · MCQ · 2 marks. Which statement is true for BFS on an undirected graph? (A) BFS discovers vertices in the same order as DFS (B) The BFS tree is a minimum spanning tree for any weights (C) BFS finds minimum-weight paths (D) Every non-tree edge joins vertices whose BFS depths differ by at most 1

**D4.H6** · NAT · 2 marks. How many edges does the complete bipartite graph K₃,₅ have?

**D4.H7** · MSQ · 2 marks. G is a directed acyclic graph. Which statements are always true? (A) G has a topological order (B) G has at least one vertex with no incoming edge (C) Finding a longest path in G is NP-hard (D) G may contain a cycle of length 2

# Databases and warehousing

## Set B1: Relational model, keys, algebra and calculus

### Easy

**B1.E1** · MCQ · 1 mark. Which attribute may hold NULL values? (A) A primary key (B) None of these (C) Part of a composite primary key (D) A foreign key without a NOT NULL constraint

**B1.E2** · NAT · 1 mark. R has 4 tuples and S has 6. How many tuples does R × S have?

**B1.E3** · MCQ · 1 mark. Loan(loan, branch) holds (L1, North), (L2, South), (L3, North), (L4, East). How many tuples does π_branch(Loan) have in relational algebra? (A) 4 (B) 1 (C) 3 (D) 2

**B1.E4** · NAT · 1 mark. R(A, B) = {(1, x), (2, y), (3, x)} and S(B, C) = {(x, p), (x, q), (z, r)}. How many tuples does R ⋈ S have?

**B1.E5** · MSQ · 1 mark. S.b is a foreign key referencing the primary key R.a, with no cascading actions. Which operations can violate this constraint? (A) Deleting from S (B) Inserting into R (C) Inserting into S (D) Deleting from R

**B1.E6** · NAT · 1 mark. In R(A, B, C), A is the only candidate key. How many superkeys does R have?

**B1.E7** · MCQ · 1 mark. For R(A, B) and S(B), the division R ÷ S returns the A values that appear in R with (A) every B value in S (B) some B value in S (C) no B value in S (D) exactly one B value in S

**B1.E8** · MSQ · 1 mark. Which rules for converting an ER model into relations are correct? (A) A 1 : N relationship always needs its own relation (B) A multi-valued attribute needs its own relation (C) A weak entity's key is its partial key alone (D) An M : N relationship needs its own relation

### Medium

**B1.M1** · NAT · 2 marks. An ER model has entities E1, E2 and E3, each with a key. E1–E2 is an M : N relationship, E2–E3 is 1 : N, and E1 has one multi-valued attribute. What is the minimum number of relations needed (each in 3NF, no other dependencies)?

**B1.M2** · MCQ · 2 marks. R has 6 tuples whose attribute A takes the distinct integer values 1 to 6. How many tuples are in σ_(A>2)(R) ∪ σ_(A<5)(R)? (A) 0 (B) 2 (C) 4 (D) 6

**B1.M3** · MSQ · 2 marks. Which equivalences hold for all relations R and S with suitable schemas? (A) π_A(R ∩ S) = π_A(R) ∩ π_A(S) (B) σ_(p∧q)(R) = σ_p(σ_q(R)) (C) π_A(R ∪ S) = π_A(R) ∪ π_A(S) (D) R ⋈ S = S ⋈ R (ignoring column order)

**B1.M4** · NAT · 2 marks. Takes(student, course) holds (s1, c1), (s1, c2), (s1, c3), (s2, c1), (s2, c3), (s3, c1), (s3, c2), (s3, c3), (s4, c2), and Course(course) holds c1, c2, c3. How many tuples does Takes ÷ Course have?

**B1.M5** · MCQ · 2 marks. The TRC query {t | t ∈ Emp ∧ ¬∃s ∈ Emp (s[salary] > t[salary])} returns (A) the employees with the lowest salary (B) the employees with the highest salary (C) all employees (D) no employees

**B1.M6** · NAT · 2 marks. R has 5 tuples and S has 4. Their natural join has 3 tuples, which use 3 distinct tuples of R and 2 distinct tuples of S. How many tuples does the full outer join have?

**B1.M7** · MSQ · 2 marks. R(A, B) has 3 tuples and S(C, D) has 4. Which statements about R ⋈ S are correct? (A) It equals R × S (B) It is empty (C) It has 2 attributes (D) It has 12 tuples

**B1.M8** · MCQ · 2 marks. Which TRC expression is unsafe? (A) {t | ∃s ∈ R (t[A] = s[A])} where t has the single attribute A (B) {t | t ∈ R ∧ t[A] > 5} (C) {t | t ∈ R ∧ ¬(t ∈ S)} (D) {t | ¬(t ∈ R)}

**B1.M9** · NAT · 2 marks. Emp(id, mgr) holds (1, NULL), (2, 1), (3, 1), (4, 2), (5, 2). How many tuples does Emp E1 ⋈_(E1.mgr = E2.id) Emp E2 have?

### Hard

**B1.H1** · NAT · 2 marks. Loan(loan, branch, amount) holds (L1, N, 900), (L2, S, 500), (L3, N, 400), (L4, E, 650), (L5, S, 700). Borrower(cust, loan) holds (Asha, L1), (Ravi, L2), (Ravi, L4), (Mina, L3), (Ken, L5), (Asha, L5). How many tuples does π_cust(Borrower ⋈ σ_(amount>500)(Loan)) have?

**B1.H2** · MCQ · 2 marks. Entities E1 and E2 (each with a key) are linked by a 1 : 1 relationship with total participation of E1 only. The minimum number of relations is (A) 2 (B) 1 (C) 3 (D) 4

**B1.H3** · MSQ · 2 marks. In R(A, B) the attribute B is a key, and S(B, C) has B as a foreign key referencing R.B with no NULLs. Which statements are always true? (A) R ⋈ S can be empty while S is non-empty (B) |R ⋈ S| = |S| (C) π_B(S) ⊆ π_B(R) (D) |R ⋈ S| = |R|

**B1.H4** · NAT · 2 marks. Using the data of B1.H1, how many customers have no loan with amount above 500?

**B1.H5** · MCQ · 2 marks. The TRC query {t | ∃s ∈ Takes (s[sid] = t[sid]) ∧ ∀c ∈ Course (∃u ∈ Takes (u[sid] = t[sid] ∧ u[cid] = c[cid]))}, with t having the single attribute sid, is equivalent to (A) Takes × Course (B) Takes ⋈ Course (C) π_sid(Takes) − π_cid(Course) (D) π_(sid,cid)(Takes) ÷ Course

**B1.H6** · NAT · 2 marks. R(A, B, C, D) has exactly two candidate keys, A and BC. How many superkeys does it have?

**B1.H7** · MSQ · 2 marks. Which statements about keys are correct? (A) A relation can have several candidate keys (B) A primary key may contain NULLs (C) Every superkey is a candidate key (D) Every candidate key is a superkey

## Set B2: SQL

All questions in this set use these two tables.

| eid | name | dept | salary | mgr |
|---|---|---|---|---|
| 1 | Asha | IT | 90 | NULL |
| 2 | Ravi | IT | 60 | 1 |
| 3 | Mina | HR | 70 | 1 |
| 4 | Ken | HR | 50 | 3 |
| 5 | Lata | OPS | 80 | 1 |
| 6 | Arun | IT | 60 | 2 |
| 7 | Neha | NULL | 40 | 5 |

| dept | city |
|---|---|
| IT | Pune |
| HR | Delhi |
| OPS | Pune |
| FIN | Mumbai |

The first table is Emp(eid, name, dept, salary, mgr) and the second is Dept(dept, city).

### Easy

**B2.E1** · NAT · 1 mark. How many rows does `SELECT * FROM Emp WHERE salary > 60` return?

**B2.E2** · MCQ · 1 mark. `SELECT COUNT(dept), COUNT(DISTINCT dept) FROM Emp` returns (A) 6, 3 (B) 7, 4 (C) 7, 3 (D) 6, 4

**B2.E3** · NAT · 1 mark. What does `SELECT SUM(salary) FROM Emp WHERE dept = 'IT'` return?

**B2.E4** · MCQ · 1 mark. How many rows does `SELECT name FROM Emp WHERE dept <> 'IT'` return? (A) 0 (B) 4 (C) 7 (D) 3

**B2.E5** · MSQ · 1 mark. Which WHERE clauses select exactly the employees with no department? (A) `NOT (dept IS NOT NULL)` (B) `dept IS NULL` (C) `dept = NULL` (D) `dept IN (NULL)`

**B2.E6** · NAT · 1 mark. What does `SELECT MAX(salary) - MIN(salary) FROM Emp` return?

**B2.E7** · MCQ · 1 mark. Which clause filters groups after aggregation? (A) WHERE (B) ORDER BY (C) HAVING (D) FROM

**B2.E8** · NAT · 1 mark. How many rows does `SELECT * FROM Emp e JOIN Dept d ON e.dept = d.dept` return?

### Medium

**B2.M1** · NAT · 2 marks. How many rows does `SELECT dept FROM Emp GROUP BY dept HAVING AVG(salary) > 60` return?

**B2.M2** · MCQ · 2 marks. `SELECT COUNT(*) FROM Dept d LEFT JOIN Emp e ON d.dept = e.dept` returns (A) 6 (B) 28 (C) 4 (D) 7

**B2.M3** · MSQ · 2 marks. Consider `SELECT e.name FROM Emp e JOIN Emp m ON e.mgr = m.eid WHERE e.salary >= m.salary`. Which statements are correct? (A) Asha is in the result (B) Arun is in the result (C) It returns no rows (D) It returns exactly one row

**B2.M4** · NAT · 2 marks. How many rows does `SELECT * FROM Emp WHERE salary > ALL (SELECT salary FROM Emp WHERE dept = 'HR')` return?

**B2.M5** · MCQ · 2 marks. `SELECT COUNT(*) FROM Emp WHERE dept NOT IN (SELECT dept FROM Emp WHERE salary < 45)` returns (A) 1 (B) 6 (C) 7 (D) 0

**B2.M6** · NAT · 2 marks. How many rows does `SELECT * FROM Emp e WHERE salary > (SELECT AVG(salary) FROM Emp x WHERE x.dept = e.dept)` return?

**B2.M7** · MSQ · 2 marks. Consider `SELECT COUNT(*), SUM(salary), MAX(salary) FROM Emp WHERE dept = 'FIN'`. Which statements are correct? (A) COUNT(*) is 0 (B) SUM(salary) is 0 (C) The query returns no rows (D) MAX(salary) is NULL

**B2.M8** · MCQ · 2 marks. `SELECT d.city, COUNT(*) FROM Emp e JOIN Dept d ON e.dept = d.dept GROUP BY d.city ORDER BY 2 DESC` returns as its first row (A) Pune, 3 (B) Delhi, 2 (C) Pune, 4 (D) Mumbai, 0

**B2.M9** · NAT · 2 marks. What does `SELECT COUNT(DISTINCT mgr) FROM Emp` return?

### Hard

**B2.H1** · NAT · 2 marks. How many rows does the following query return?

```sql
SELECT e.eid FROM Emp e
WHERE (SELECT COUNT(*) FROM Emp x WHERE x.salary > e.salary) < 3;
```

**B2.H2** · MCQ · 2 marks. How many rows does `SELECT dept FROM Emp UNION SELECT dept FROM Dept` return? (A) 4 (B) 5 (C) 11 (D) 7

**B2.H3** · MSQ · 2 marks. Which queries list, for every employee, the number of colleagues in the same department who earn more (0 if there are none)? (A) `SELECT e.eid, (SELECT COUNT(*) FROM Emp f WHERE f.dept = e.dept AND f.salary > e.salary) FROM Emp e` (B) `SELECT e.eid, COUNT(*) FROM Emp e LEFT JOIN Emp f ON e.dept = f.dept AND f.salary > e.salary GROUP BY e.eid` (C) `SELECT eid, COUNT(*) FROM Emp GROUP BY eid` (D) `SELECT e.eid, COUNT(f.eid) FROM Emp e LEFT JOIN Emp f ON e.dept = f.dept AND f.salary > e.salary GROUP BY e.eid`

**B2.H4** · NAT · 2 marks. How many rows does `SELECT * FROM Emp e1, Emp e2 WHERE e1.dept = e2.dept AND e1.eid < e2.eid` return?

**B2.H5** · MCQ · 2 marks. How many rows does the following query return? (A) 1 (B) 0 (C) 2 (D) 4

```sql
SELECT d.dept FROM Dept d
WHERE NOT EXISTS (SELECT * FROM Emp e WHERE e.dept = d.dept AND e.salary > 65);
```

**B2.H6** · NAT · 2 marks. What does `SELECT SUM(salary) FROM Emp WHERE mgr IN (SELECT eid FROM Emp WHERE dept = 'IT')` return?

**B2.H7** · MSQ · 2 marks. Consider `SELECT dept, COUNT(*) FROM Emp GROUP BY dept`. Which statements are correct? (A) FIN appears with count 0 (B) One row has dept NULL and count 1 (C) It returns 4 rows (D) It returns 3 rows
