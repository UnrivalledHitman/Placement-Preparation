## Solutions: Set D4

| Q | Answer | Q | Answer | Q | Answer |
|---|---|---|---|---|---|
| E1 | A | M1 | 2 | H1 | 16 |
| E2 | 28 | M2 | B | H2 | D |
| E3 | A | M3 | A, C, D | H3 | A, B, D |
| E4 | 36 | M4 | 8 | H4 | 6 |
| E5 | B, D | M5 | A | H5 | D |
| E6 | 6 | M6 | 2 | H6 | 15 |
| E7 | B | M7 | A, B | H7 | A, B |
| E8 | A, D | M8 | C | | |
| | | M9 | 5 | | |

**E1.** n − 1 = 11. **E2.** C(8, 2) = 28. **E3.** Handshake lemma: 2 × 15. **E4.** 6 × 6 = 36.

**E5.** BFS uses a queue and finds fewest-edge paths in O(V + E) time with adjacency lists, not O(V²); it ignores weights.

**E6.** (3 + 3 + 2 + 2 + 2)/2 = 6.

**E7.** Acyclic. **E8.** Any two of "connected", "acyclic" and "n − 1 edges" make a tree. A connected graph with 7 edges has a cycle; an acyclic graph with 5 edges has two components.

**M1.** 1 → 3 → 6: two edges.

**M2.** A → B → D (D's unvisited neighbours are C and E; C first) → C → F; back at D, E is still unvisited: A B D C F E.

**M3.** Reversal swaps the direction of every path, so reachability flips, strongly connected components stay the same, and topological orders reverse. The set reachable from u can change completely.

**M4.** DFS goes 0, 2, 4, 6, 8, 10, 12, then backtracks to discover 11, 9, 7, 5, 3; vertex 1 is unreachable. After 6: 8, 10, 12, 11, 9, 7, 5, 3, eight vertices.

**M5.** S → B → A → C costs 1 + 2 + 1 = 4.

**M6.** a first and d last; b and c in either order: 2.

**M7.** Dijkstra needs non-negative weights and runs in O((V + E) log V) with a heap. It computes shortest, not longest, paths.

**M8.** Θ(V + E). **M9.** {1, 2, 3}, {4, 5}, {6, 7, 8}, {9}, {10}: five components.

**H1.** Cayley's formula nⁿ⁻² = 4² = 16.

**H2.** With 36 = C(9, 2) edges, a complete graph on 9 vertices plus an isolated vertex is disconnected; any 37 edges force connectivity.

**H3.** Any of the edges a–c, b–d or a–d would give a shorter a-to-d path. b–c is on the path itself.

**H4.** V − 1 = 6 rounds.

**H5.** In BFS of an undirected graph, a non-tree edge joins vertices on the same level or adjacent levels.

**H6.** 3 × 5 = 15.

**H7.** Every DAG has a source and a topological order, and a longest path can be computed by dynamic programming in topological order. A 2-cycle is a cycle. In a DAG a longest path takes O(V + E) by dynamic programming in topological order; the problem is NP-hard only for general graphs.

```python run Recomputing Set D4
import networkx as nx
from math import comb

print('E2', comb(8, 2), '| E6', (3 + 3 + 2 + 2 + 2) // 2)
G = nx.Graph([(1, 2), (1, 3), (2, 4), (3, 4), (4, 5), (5, 6), (3, 6)])
print('M1', nx.shortest_path_length(G, 1, 6))
order, seen = [], set()
adjM = {'A': 'BC', 'B': 'AD', 'C': 'ADF', 'D': 'BCE', 'E': 'D', 'F': 'C'}

def dfs(u):
    seen.add(u); order.append(u)
    for v in sorted(adjM[u]):
        if v not in seen:
            dfs(v)

dfs('A')
order4, seen4 = [], set()

def dfs4(u):
    seen4.add(u); order4.append(u)
    for v in (u + 2, u + 3):
        if v <= 12 and v not in seen4:
            dfs4(v)

dfs4(0)
print('M2', ' '.join(order), '| M4', order4, 'after 6:', len(order4) - 1 - order4.index(6))
D = nx.DiGraph(); D.add_weighted_edges_from([('S', 'A', 4), ('S', 'B', 1), ('B', 'A', 2),
        ('A', 'C', 1), ('B', 'C', 5)])
dag = nx.DiGraph([('a', 'b'), ('a', 'c'), ('b', 'd'), ('c', 'd')])
H = nx.Graph([(1, 2), (2, 3), (4, 5), (6, 7), (7, 8), (8, 6)]); H.add_nodes_from(range(1,
        11))
print('M5', nx.dijkstra_path_length(D, 'S', 'C'), '| M6',
        len(list(nx.all_topological_sorts(dag))),
      '| M9', nx.number_connected_components(H))
print('H1', round(nx.number_of_spanning_trees(nx.complete_graph(4))), '| H2', comb(9, 2)
        + 1,
      '| H6', nx.complete_bipartite_graph(3, 5).number_of_edges())
```

## Solutions: Set B1

| Q | Answer | Q | Answer | Q | Answer |
|---|---|---|---|---|---|
| E1 | D | M1 | 5 | H1 | 3 |
| E2 | 24 | M2 | D | H2 | A |
| E3 | C | M3 | B, C, D | H3 | B, C |
| E4 | 4 | M4 | 2 | H4 | 1 |
| E5 | C, D | M5 | B | H5 | D |
| E6 | 4 | M6 | 7 | H6 | 10 |
| E7 | A | M7 | A, D | H7 | A, D |
| E8 | B, D | M8 | D | | |
| | | M9 | 4 | | |

**E1.** Primary key attributes cannot be NULL; a foreign key can, unless declared NOT NULL.

**E2.** 4 × 6 = 24. **E3.** Projection removes duplicates: North, South, East. **E4.** (1, x) and (3, x) each match two S tuples: 4.

**E5.** Inserting into S can introduce a value missing from R; deleting from R can orphan rows of S.

**E6.** Any set containing A: 2² = 4 ({A}, {A, B}, {A, C}, {A, B, C}).

**E7.** "For every B in S" is division.

**E8.** A 1 : N relationship is handled by a foreign key on the N side. A weak entity's key is the owner's key plus the partial key, never the partial key alone.

**M1.** E1, E2, E3 (with E2's key as a foreign key in E3), the M : N relationship, and the multi-valued attribute: 5.

**M2.** Every value 1 to 6 satisfies A > 2 or A < 5.

**M3.** Projection distributes over union but not over intersection: R = {(1, a)} and S = {(1, b)} give π_A(R ∩ S) = ∅ but π_A(R) ∩ π_A(S) = {1}.

**M4.** s1 and s3 took all three courses.

**M5.** No employee earns more: the maximum salary.

**M6.** 3 joined tuples, plus 2 unmatched R tuples and 2 unmatched S tuples, padded with NULLs: 7.

**M7.** No common attributes, so the natural join is the Cartesian product: 12 tuples with 4 attributes.

**M8.** {t | ¬(t ∈ R)} describes infinitely many tuples outside R.

**M9.** Employees 2, 3, 4 and 5 have a manager: 4 tuples. Employee 1's NULL matches nothing.

**H1.** Loans above 500 are L1, L4 and L5; their borrowers are Asha, Ravi, Ken and Asha: 3 distinct customers.

**H2.** Put E2's key as a foreign key in E1 (whose participation is total): 2 relations.

**H3.** Every S tuple matches exactly one R tuple (B is a key of R and S.B always refers to an existing one), so |R ⋈ S| = |S|. R tuples with no matching S tuple make |R ⋈ S| < |R| possible.

**H4.** Customers: Asha, Ravi, Mina, Ken. Only Mina has no loan above 500.

**H5.** "For every course, the student took it": division.

**H6.** 8 supersets of A, 4 supersets of BC, and 2 supersets of both: 8 + 4 − 2 = 10.

**H7.** Candidate keys are minimal superkeys, there can be several, and a primary key cannot contain NULLs.

```python run Recomputing Set B1
from itertools import combinations

R = {(1, 'x'), (2, 'y'), (3, 'x')}; S = {('x', 'p'), ('x', 'q'), ('z', 'r')}
print('E3', len({b for _, b in [('L1', 'North'), ('L2', 'South'), ('L3', 'North'), ('L4',
        'East')]}),
      '| E4', sum(1 for a, b in R for b2, c in S if b == b2))
takes = {('s1', 'c1'), ('s1', 'c2'), ('s1', 'c3'), ('s2', 'c1'), ('s2', 'c3'), ('s3', 'c1'),
        ('s3', 'c2'),
         ('s3', 'c3'), ('s4', 'c2')}
courses = {'c1', 'c2', 'c3'}
print('M4', sorted({s for s, _ in takes if all((s, c) in takes for c in courses)}))
emp = [(1, None), (2, 1), (3, 1), (4, 2), (5, 2)]
print('M9', sum(1 for _, m in emp for i, _ in emp if m is not None and m == i))
loan = {'L1': 900, 'L2': 500, 'L3': 400, 'L4': 650, 'L5': 700}
borrower = [('Asha', 'L1'), ('Ravi', 'L2'), ('Ravi', 'L4'), ('Mina', 'L3'), ('Ken', 'L5'),
        ('Asha', 'L5')]
big = {c for c, l in borrower if loan[l] > 500}
print('H1', sorted(big), '| H4', sorted({c for c, _ in borrower} - big))
attrs = 'ABCD'
supers = [set(c) for r in range(1, 5) for c in combinations(attrs, r) if 'A' in c or {'B',
        'C'} <= set(c)]
print('H6', len(supers), '| E6', sum(1 for r in range(1, 4) for c in combinations('ABC', r)
        if 'A' in c))
```

## Solutions: Set B2

| Q | Answer | Q | Answer | Q | Answer |
|---|---|---|---|---|---|
| E1 | 3 | M1 | 2 | H1 | 3 |
| E2 | A | M2 | D | H2 | B |
| E3 | 210 | M3 | B, D | H3 | A, D |
| E4 | D | M4 | 2 | H4 | 4 |
| E5 | A, B | M5 | D | H5 | A |
| E6 | 50 | M6 | 2 | H6 | 270 |
| E7 | C | M7 | A, D | H7 | B, C |
| E8 | 6 | M8 | C | | |
| | | M9 | 4 | | |

**E1.** Salaries 90, 70 and 80. **E2.** COUNT(dept) skips Neha's NULL: 6; the distinct values are IT, HR and OPS. **E3.** 90 + 60 + 60.

**E4.** HR (2) and OPS (1). Neha's NULL makes `dept <> 'IT'` unknown, so she is excluded.

**E5.** Only IS NULL tests work; comparisons with NULL are never true.

**E6.** 90 − 40. **E7.** HAVING. **E8.** The inner join drops Neha (NULL) and FIN (no employees): 6.

**M1.** Averages: IT 70, HR 60, OPS 80 and the NULL group 40. Only IT and OPS exceed 60.

**M2.** IT 3 + HR 2 + OPS 1 + FIN 1 (padded with NULLs) = 7.

**M3.** Only Arun (60) earns at least as much as his manager Ravi (60). Asha has no manager, so she never joins.

**M4.** HR salaries are 70 and 50; only 90 and 80 exceed both.

**M5.** The subquery returns Neha's department, NULL. `x NOT IN (NULL)` is never true, so no rows.

**M6.** Asha (90 > 70) and Mina (70 > 60). Lata equals her department's average, and Neha's subquery averages an empty set (NULL), so the comparison is unknown.

**M7.** On an empty set COUNT gives 0, and SUM and MAX give NULL; the query still returns one row.

**M8.** Pune has IT (3) and OPS (1): 4.

**M9.** Managers 1, 3, 2 and 5 (NULL is not counted): 4.

**H1.** Fewer than three people earn more: Asha (0 above her), Lata (1) and Mina (2). Ravi and Arun have 3 above them.

**H2.** UNION removes duplicates and treats NULLs as equal for this purpose: IT, HR, OPS, NULL and FIN.

**H3.** (D) The outer join keeps employees with no richer colleague, and COUNT(f.eid) counts 0 for them. (A) The scalar subquery counts directly. (B) COUNT(*) counts the NULL-padded row as 1. (C) Counts one row per employee.

**H4.** Pairs within a department: IT has C(3, 2) = 3, HR 1, OPS 0; NULL never equals NULL. Total 4.

**H5.** IT, HR and OPS each have someone above 65; only FIN has nobody.

**H6.** IT employees are 1, 2 and 6. Those managed by them: Ravi 60, Mina 70, Lata 80 (manager 1) and Arun 60 (manager 2): 270.

**H7.** Groups IT, HR, OPS and NULL (Neha): 4 rows. FIN has no employees, so it does not appear.

```python run Running every B2 query on SQLite
import sqlite3
con = sqlite3.connect(':memory:')
con.executescript('''
CREATE TABLE Emp(eid INT, name TEXT, dept TEXT, salary INT, mgr INT);
INSERT INTO Emp VALUES (1,'Asha','IT',90,NULL),(2,'Ravi','IT',60,1),(3,'Mina','HR',70,1),
  (4,'Ken','HR',50,3),(5,'Lata','OPS',80,1),(6,'Arun','IT',60,2),(7,'Neha',NULL,40,5);
CREATE TABLE Dept(dept TEXT, city TEXT);
INSERT INTO Dept VALUES ('IT','Pune'),('HR','Delhi'),('OPS','Pune'),('FIN','Mumbai');
''')
q = lambda s: con.execute(s).fetchall()
n = lambda s: len(q(s))
print('E1', n('SELECT * FROM Emp WHERE salary > 60'), '| E2',
        q('SELECT COUNT(dept), COUNT(DISTINCT dept) FROM Emp'),
      '| E3', q("SELECT SUM(salary) FROM Emp WHERE dept = 'IT'"), '| E4',
              n("SELECT name FROM Emp WHERE dept <> 'IT'"))
print('E5', n('SELECT * FROM Emp WHERE dept IS NULL'),
        n('SELECT * FROM Emp WHERE dept = NULL'),
      n('SELECT * FROM Emp WHERE NOT (dept IS NOT NULL)'),
              n('SELECT * FROM Emp WHERE dept IN (NULL)'),
      '| E6', q('SELECT MAX(salary) - MIN(salary) FROM Emp'), '| E8',
              n('SELECT * FROM Emp e JOIN Dept d ON e.dept = d.dept'))
print('M1', n('SELECT dept FROM Emp GROUP BY dept HAVING AVG(salary) > 60'),
      '| M2', q('SELECT COUNT(*) FROM Dept d LEFT JOIN Emp e ON d.dept = e.dept'),
      '| M3', q('SELECT e.name FROM Emp e JOIN Emp m ON e.mgr = m.eid WHERE e.salary >= '
              'm.salary'))
print('M4 (> ALL as > MAX)',
        n("SELECT * FROM Emp WHERE salary > (SELECT MAX(salary) FROM Emp WHERE dept = 'HR')"),
      '| M5', q('SELECT COUNT(*) FROM Emp WHERE dept NOT IN (SELECT dept FROM Emp WHERE '
              'salary < 45)'),
      '| M6', n('SELECT * FROM Emp e WHERE salary > (SELECT AVG(salary) FROM Emp x WHERE '
              'x.dept = e.dept)'))
print('M7', q("SELECT COUNT(*), SUM(salary), MAX(salary) FROM Emp WHERE dept = 'FIN'"),
      '| M8', q('SELECT d.city, COUNT(*) FROM Emp e JOIN Dept d ON e.dept = d.dept GROUP '
              'BY d.city ORDER BY 2 DESC')[0],
      '| M9', q('SELECT COUNT(DISTINCT mgr) FROM Emp'))
print('H1', n('SELECT e.eid FROM Emp e WHERE (SELECT COUNT(*) FROM Emp x WHERE x.salary > '
        'e.salary) < 3'),
      '| H2', n('SELECT dept FROM Emp UNION SELECT dept FROM Dept'))
h3 = ['SELECT e.eid, COUNT(f.eid) FROM Emp e LEFT JOIN Emp f ON e.dept = f.dept AND '
        'f.salary > e.salary GROUP BY e.eid',
      'SELECT e.eid, (SELECT COUNT(*) FROM Emp f WHERE f.dept = e.dept AND f.salary > '
              'e.salary) FROM Emp e',
      'SELECT e.eid, COUNT(*) FROM Emp e LEFT JOIN Emp f ON e.dept = f.dept AND f.salary > '
              'e.salary GROUP BY e.eid',
      'SELECT eid, COUNT(*) FROM Emp GROUP BY eid']
for k, s in zip('ABCD', h3):
    print(f'H3 ({k})', sorted(q(s)))
print('H4', n('SELECT * FROM Emp e1, Emp e2 WHERE e1.dept = e2.dept AND e1.eid < e2.eid'),
      '| H5', q('SELECT d.dept FROM Dept d WHERE NOT EXISTS '
                '(SELECT * FROM Emp e WHERE e.dept = d.dept AND e.salary > 65)'),
      '| H6', q("SELECT SUM(salary) FROM Emp WHERE mgr IN (SELECT eid FROM Emp WHERE dept "
              "= 'IT')"),
      '| H7', q('SELECT dept, COUNT(*) FROM Emp GROUP BY dept'))
```

SQLite does not support `> ALL`, so M4 is checked with the equivalent `> MAX(...)` (the HR subquery is non-empty and has no NULL salaries).
