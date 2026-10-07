# How to use this guide
%What this book adds to the MySQL books, how much each topic weighs in interviews, and how to study it

The two MySQL books taught you to *use* a database: write queries, design tables, add indexes, run transactions. This guide explains *why* databases work the way they do. It covers the theory that interviewers at product companies, GATE-style written tests and DBMS viva questions keep coming back to: relational algebra, functional dependencies, serialisability, locking, recovery, B+ trees, query optimisation and distributed data.

Every algorithm in this book is implemented in short Python programs that you can run and reuse. When you solve a numerical by hand (an attribute closure, a precedence graph, a B+ tree capacity), check your answer with the matching program. All demos use only the Python standard library plus `sqlite3`, which ships with Python, so nothing needs installing.

## Interview weight

| Topic | Chapter | Service companies (TCS, Infosys) | Product companies | Typical question |
|---|---|---|---|---|
| Keys, normal forms | 2–3 | Very high | High | "Find the candidate keys and the highest normal form" |
| ACID, transactions | 4 | Very high | Very high | "What does each letter of ACID guarantee, and how?" |
| Serialisability | 4 | Medium | High | "Is this schedule conflict serialisable?" |
| Locking, isolation, MVCC | 5 | Medium | Very high | "How does Postgres/InnoDB avoid readers blocking writers?" |
| Recovery, WAL | 6 | Low | High | "Why must the log be written before the data page?" |
| Indexes, B+ trees | 7 | High | Very high | "Why B+ trees and not binary search trees on disk?" |
| Query processing | 8 | Low | Medium | "When is a hash join better than a nested-loop join?" |
| Distributed, NoSQL, CAP | 9 | Medium | Very high | "Explain CAP with an example; when would you pick Cassandra?" |

## How each chapter works

1. Read the concept section and predict the result before running each program.
2. Run the program (or read its output box). Every output shown was produced by actually running the code.
3. Redo the worked numericals on paper, then change the input and check yourself with the code.
4. Solve the matching part of the **DBMS Theory Practice Book**.

> NOTE: Practical SQL (joins, subqueries, window functions, indexes in MySQL, isolation levels in InnoDB) is covered in the MySQL guide and practice book. This book refers to them rather than repeating them, and goes deeper into the theory underneath.

> TIP: Chapter 10 is a question bank and formula sheet. Use it for revision the night before an interview.

# Chapter 1: DBMS Fundamentals
%Why databases exist, how they are layered, and what happens inside one

## 1.1 File systems versus a DBMS

Before database systems, applications stored data in files and each program parsed them itself. That works until several programs and several users share the data. The classic problems are:

| Problem with files | What goes wrong | How a DBMS solves it |
|---|---|---|
| Redundancy and inconsistency | The same customer address is stored in two files and only one is updated | One copy, normalised tables, foreign keys |
| Difficult access | Every new question needs a new program | A declarative query language (SQL) |
| Integrity | "Balance must not be negative" is checked in some programs and not others | Constraints enforced by the engine (`CHECK`, `NOT NULL`, keys) |
| Atomicity | A crash halfway through a transfer leaves money debited but not credited | Transactions with logging and recovery |
| Concurrent access | Two programs read, modify and write the same record: one update is lost | Concurrency control (locks or MVCC) |
| Security | Anyone who can read the file can read every field | Users, roles, `GRANT`, views |

The program below makes two of these problems concrete. It stores accounts in a CSV file, then simulates two clerks updating the same account by reading the file, changing it in memory and writing it back. The second write silently overwrites the first. The same sequence on SQLite with a single `UPDATE ... SET balance = balance + ?` statement loses nothing, and a `CHECK` constraint rejects an overdraft that the file happily stores.

```python run Files versus a DBMS: lost update and integrity
import csv, io, sqlite3

# --- file-based storage -------------------------------------------------
def load(text):
    return {r['id']: int(r['balance']) for r in csv.DictReader(io.StringIO(text))}

def save(accounts):
    out = io.StringIO()
    w = csv.writer(out); w.writerow(['id', 'balance'])
    for k, v in accounts.items():
        w.writerow([k, v])
    return out.getvalue()

file_text = save({'A': 1000})
clerk1 = load(file_text)            # both clerks read the same version
clerk2 = load(file_text)
clerk1['A'] += 200                  # deposit 200
clerk2['A'] -= 300                  # withdraw 300
file_text = save(clerk1)
file_text = save(clerk2)            # overwrites clerk 1's write
print('file balance  :', load(file_text)['A'], '(expected 900)')

bad = load(file_text); bad['A'] = -5000; file_text = save(bad)
print('file accepts  :', load(file_text)['A'])

# --- the same work in a DBMS --------------------------------------------
db = sqlite3.connect(':memory:')
db.execute('CREATE TABLE account (id TEXT PRIMARY KEY, balance INT CHECK (balance >= 0))')
db.execute("INSERT INTO account VALUES ('A', 1000)")
db.execute("UPDATE account SET balance = balance + 200 WHERE id = 'A'")
db.execute("UPDATE account SET balance = balance - 300 WHERE id = 'A'")
print('DBMS balance  :', db.execute("SELECT balance FROM account").fetchone()[0])
try:
    db.execute("UPDATE account SET balance = -5000 WHERE id = 'A'")
except sqlite3.IntegrityError as e:
    print('DBMS rejects  :', e)
```

The file version is not "wrong code": each clerk's program is correct on its own. The bug only appears when two correct programs run at once, which is exactly the problem that concurrency control (Chapter 5) solves.

## 1.2 The three-schema architecture

The ANSI/SPARC architecture separates a database into three levels, so that each can change without breaking the others.

| Level | Also called | Describes | Who sees it |
|---|---|---|---|
| External | View level | What one user or application sees: selected columns, derived values, renamed tables | End users, applications |
| Conceptual | Logical level | All entities, attributes, relationships and constraints of the whole database | Database designers, DBAs |
| Internal | Physical level | Files, pages, record layout, indexes, compression | The storage engine, DBAs tuning performance |

The mappings between levels give **data independence**:

- **Physical data independence**: change the internal level (add an index, move to SSD, change the file organisation) without changing the conceptual schema or any query. Easy to achieve; every relational DBMS has it.
- **Logical data independence**: change the conceptual schema (split a table, add a column) without changing external views or the applications built on them. Harder, because views must be rewritten to map the new tables back to the old shape.

The next program shows both. First a query is planned as a full table scan; after creating an index, the *same* query text is planned as an index search (physical independence). Then the `employee` table is split into two tables, and a view with the old name and shape keeps the old application query working (logical independence).

```python run Physical and logical data independence
import sqlite3
db = sqlite3.connect(':memory:')
db.execute('CREATE TABLE employee_data (id INT PRIMARY KEY, name TEXT, dept TEXT, salary '
        'INT)')
db.executemany('INSERT INTO employee_data VALUES (?, ?, ?, ?)',
               [(i, f'emp{i}', ['IT', 'HR', 'Ops'][i % 3], 30000 + i * 10) for i in range(1,
                       1001)])
db.execute('CREATE VIEW employee AS SELECT id, name, dept, salary FROM employee_data')
app_query = "SELECT name FROM employee WHERE salary = 35000"

def plan(q):
    return ' | '.join(r[3] for r in db.execute('EXPLAIN QUERY PLAN ' + q))

print('before index :', plan(app_query))
db.execute('CREATE INDEX idx_salary ON employee_data(salary)')   # internal level changes
print('after index  :', plan(app_query))
print('result       :', db.execute(app_query).fetchall())

# conceptual level changes: salary moves to its own table
db.executescript('''
    CREATE TABLE person (id INT PRIMARY KEY, name TEXT, dept TEXT);
    CREATE TABLE pay (id INT PRIMARY KEY REFERENCES person(id), salary INT);
    INSERT INTO person SELECT id, name, dept FROM employee_data;
    INSERT INTO pay SELECT id, salary FROM employee_data;
    DROP VIEW employee;
    DROP TABLE employee_data;
    CREATE VIEW employee AS
        SELECT p.id, p.name, p.dept, y.salary FROM person p JOIN pay y ON p.id = y.id;
''')
print('after split  :', db.execute(app_query).fetchall(), '(same query, same answer)')
```

> TRAP: "Physical data independence" does not mean physical changes have no effect. Performance changes (here, a full scan becomes an index search). What does not change is the *correctness* of queries and the text of applications.

## 1.3 Inside a DBMS

A relational engine is a pipeline. A SQL string goes in at the top, pages of bytes on disk come out at the bottom.

```text
  SQL text
     |
  +--v-----------------------------  QUERY PROCESSOR  ------------------+
  |  Parser        -> syntax tree, checks names against the catalog     |
  |  Rewriter      -> expands views, simplifies predicates              |
  |  Optimiser     -> picks join order, access paths, algorithms (Ch 8) |
  |  Executor      -> runs the plan: scans, joins, sorts, aggregates    |
  +--+------------------------------------------------------------------+
     |  get/put record, open index cursor
  +--v-----------------------------  STORAGE MANAGER  ------------------+
  |  Transaction manager  -> begin/commit/abort, isolation (Ch 4-5)     |
  |  Lock manager / MVCC  -> who may read or write what, when (Ch 5)    |
  |  Log manager          -> write-ahead log, recovery (Ch 6)           |
  |  Access methods       -> heap files, B+ trees, hash indexes (Ch 7)  |
  |  Buffer manager       -> caches disk pages in RAM, evicts (Ch 7)    |
  +--+------------------------------------------------------------------+
     |  read/write 4-16 KB pages
  +--v--------------+
  |  Disk / SSD     |   data files, index files, log files, catalog
  +-----------------+
```

| Component | One-line job | Interview hook |
|---|---|---|
| Catalog (data dictionary) | Stores metadata: tables, columns, types, indexes, statistics | `information_schema` in MySQL, `sqlite_master` in SQLite |
| Parser | Turns text into a tree and validates names | Syntax errors come from here |
| Optimiser | Chooses the cheapest plan using statistics | `EXPLAIN` shows its choice |
| Buffer manager | Keeps hot pages in memory; decides what to evict | Why the second run of a query is faster |
| Lock manager | Grants and queues locks; detects deadlocks | `Deadlock found` errors |
| Log manager | Appends redo/undo records before data pages are written | Durability and crash recovery |

The catalog is itself stored as a table. SQLite exposes it as `sqlite_master`:

```python run The catalog is a table too
import sqlite3
db = sqlite3.connect(':memory:')
db.executescript('''
    CREATE TABLE dept (id INT PRIMARY KEY, name TEXT UNIQUE);
    CREATE TABLE emp (id INT PRIMARY KEY, dept_id INT REFERENCES dept(id), salary INT);
    CREATE INDEX idx_emp_salary ON emp(salary);
    CREATE VIEW rich AS SELECT * FROM emp WHERE salary > 100000;
''')
for row in db.execute('SELECT type, name, tbl_name FROM sqlite_master ORDER BY type, name'):
    print(row)
```

Notice the three `sqlite_autoindex` entries: one for each `PRIMARY KEY` and one for the `UNIQUE` column. Declaring a key makes the engine build an index automatically, because enforcing uniqueness without one would need a full scan on every insert. (In SQLite, `INTEGER PRIMARY KEY` is special: it becomes the row id itself and needs no extra index; `INT PRIMARY KEY` does not get that treatment.)

## 1.4 Data models

| Model | Structure | Example systems | Strength | Weakness |
|---|---|---|---|---|
| Hierarchical | Tree of records (parent → children) | IBM IMS | Fast for one access path | Many-to-many is awkward; queries follow pointers |
| Network | Graph of records linked by sets | IDMS (CODASYL) | Many-to-many | Navigational code, hard to change |
| Relational | Tables (relations) of tuples; links by values | MySQL, PostgreSQL, Oracle, SQLite | Declarative queries, data independence, strong theory | Joins can be costly at huge scale |
| Object / object-relational | Classes, inheritance, complex types | PostgreSQL types, db4o | Matches OOP code | Weaker standard query model |
| Document | JSON-like nested documents | MongoDB, Couchbase | Flexible schema, one read per aggregate | Joins and multi-document transactions are harder |
| Key-value | Opaque values by key | Redis, DynamoDB | Very fast, easy to partition | Only key lookups |
| Wide-column | Rows with dynamic column families | Cassandra, HBase | Huge write throughput, partitioned | Query patterns fixed in advance |
| Graph | Nodes and edges with properties | Neo4j | Multi-hop relationship queries | Less suited to aggregates over everything |

Chapter 9 returns to the NoSQL models and when to choose each.

## 1.5 Practical lessons

- A DBMS earns its keep when data is **shared**: by several programs, several users at once, and across crashes.
- Know the three levels and the two kinds of data independence; interviewers love asking which one is harder (logical).
- Be able to draw the engine pipeline: parser → optimiser → executor on top of buffer, lock, log and access-method managers.
- Every later chapter fills in one box of that diagram.

# Chapter 2: The Relational Model and Relational Algebra
%Relations, keys, the algebra underneath SQL, relational calculus, and turning an ER diagram into tables

## 2.1 Relations, tuples and attributes

Codd's relational model (1970) represents all data as **relations**. Formally:

| Term | Formal meaning | SQL equivalent |
|---|---|---|
| Domain | A set of atomic values, such as integers or strings of length ≤ 30 | Data type |
| Attribute | A named column with a domain | Column |
| Tuple | An ordered list of values, one per attribute | Row |
| Relation | A *set* of tuples over the same attributes | Table (but SQL tables allow duplicates) |
| Relation schema | Name plus attribute list: `Student(roll, name, dept)` | `CREATE TABLE` |
| Degree (arity) | Number of attributes | Number of columns |
| Cardinality | Number of tuples | Number of rows |

Because a relation is a set, it has no duplicate tuples and no order. SQL relaxes this: tables are *bags* (multisets), which is why SQL needs `DISTINCT` and `UNION` versus `UNION ALL`.

## 2.2 Keys

| Key | Definition | Example in `Student(roll, email, name, dept)` |
|---|---|---|
| Super key | Any set of attributes that uniquely identifies a tuple | `{roll}`, `{roll, name}`, `{email, dept}` |
| Candidate key | A *minimal* super key: remove any attribute and it stops being unique | `{roll}`, `{email}` |
| Primary key | The candidate key chosen to identify tuples; cannot be `NULL` | `roll` |
| Alternate key | A candidate key that was not chosen as primary | `email` |
| Foreign key | Attributes that must match a key in another (or the same) relation | `Enrolled.roll` references `Student.roll` |
| Composite key | A key with more than one attribute | `{roll, course}` in `Enrolled` |
| Surrogate key | An artificial key with no business meaning | `AUTO_INCREMENT id` |

A key is a statement about **all possible** instances of a relation, not about today's data. A sample instance can prove that a set is *not* a key (two rows agree on it), but it can never prove that a set *is* a key. The program below checks every attribute subset of a sample instance and reports which ones are unique *in this instance*. Treat the output as "candidates consistent with the data"; the real keys come from the functional dependencies of Chapter 3.

```python run Which attribute sets are unique in an instance?
from itertools import combinations

attrs = ['roll', 'email', 'name', 'dept']
rows = [
    (1, 'asha@nit.ac.in', 'Asha', 'CSE'),
    (2, 'ravi@nit.ac.in', 'Ravi', 'ECE'),
    (3, 'neha@nit.ac.in', 'Neha', 'CSE'),
    (4, 'ravi2@nit.ac.in', 'Ravi', 'CSE'),
]

def unique(cols):
    idx = [attrs.index(c) for c in cols]
    seen = {tuple(r[i] for i in idx) for r in rows}
    return len(seen) == len(rows)

supers = [set(c) for k in range(1, len(attrs) + 1) for c in combinations(attrs, k)
        if unique(c)]
minimal = [s for s in supers if not any(o < s for o in supers)]
print('unique sets in this instance:', len(supers), 'of', 2 ** len(attrs) - 1)
print('minimal ones:', [sorted(s) for s in minimal])
```

`{name, dept}` appears as "minimal" only because no two students *in this sample* share both. A fifth row `(5, ..., 'Asha', 'CSE')` is perfectly legal, so `{name, dept}` is not a real key. That gap between instance and schema is a favourite viva question.

**Integrity constraints** in the relational model:

- **Entity integrity**: no primary-key attribute may be `NULL`.
- **Referential integrity**: every foreign-key value must exist in the referenced key, or be `NULL` if allowed. On deleting a referenced row, the options are `RESTRICT`/`NO ACTION`, `CASCADE`, `SET NULL` and `SET DEFAULT`.
- **Domain constraints**: every value comes from the attribute's domain (`CHECK`, types).

## 2.3 Relational algebra

Relational algebra is a set of operators that take relations and return a relation. Because the output is always a relation, operators compose into expressions. Every SQL query is translated into an algebra expression (a *query tree*) before it is optimised and executed, which is why this matters beyond exams.

| Operator | Symbol | Meaning | SQL equivalent |
|---|---|---|---|
| Selection | σ<sub>condition</sub>(R) | Rows of R that satisfy the condition | `WHERE` |
| Projection | π<sub>attrs</sub>(R) | Only the listed columns, duplicates removed | `SELECT DISTINCT a, b` |
| Rename | ρ<sub>S(a,b)</sub>(R) | Rename the relation and/or attributes | `AS` |
| Union | R ∪ S | Tuples in either (schemas must be compatible) | `UNION` |
| Difference | R − S | Tuples in R but not in S | `EXCEPT` |
| Cartesian product | R × S | Every pairing of tuples | `CROSS JOIN` |
| Intersection | R ∩ S | Tuples in both = R − (R − S) | `INTERSECT` |
| Natural join | R ⋈ S | Product, keep rows agreeing on common attributes, keep one copy of them | `NATURAL JOIN` |
| Theta join | R ⋈<sub>θ</sub> S | σ<sub>θ</sub>(R × S) | `JOIN ... ON θ` |
| Division | R ÷ S | Values in R associated with **every** tuple of S | `NOT EXISTS (... NOT EXISTS ...)` |

The first six are **fundamental**: the others can be written using them. For example, R ⋈<sub>θ</sub> S = σ<sub>θ</sub>(R × S), and R ∩ S = R − (R − S).

### A mini relational-algebra engine

The best way to understand the operators is to implement them. The engine below stores a relation as a tuple of attribute names plus a Python `set` of tuples, so set semantics (no duplicates) come for free. Each operator is a few lines.

```python run A relational-algebra engine in 60 lines
class R:
    def __init__(self, attrs, rows):
        self.attrs = tuple(attrs)
        self.rows = {tuple(r) for r in rows}

    def _ix(self, a): return self.attrs.index(a)

    def select(self, pred):                       # sigma
        return R(self.attrs, [t for t in self.rows if pred(dict(zip(self.attrs, t)))])

    def project(self, *cols):                     # pi
        ix = [self._ix(c) for c in cols]
        return R(cols, [tuple(t[i] for i in ix) for t in self.rows])

    def rename(self, **new):                      # rho
        return R([new.get(a, a) for a in self.attrs], self.rows)

    def union(self, o):
        assert len(self.attrs) == len(o.attrs), 'union-incompatible'
        return R(self.attrs, self.rows | o.rows)

    def minus(self, o):
        return R(self.attrs, self.rows - o.rows)

    def product(self, o):                         # x
        assert not set(self.attrs) & set(o.attrs), 'rename clashing attributes first'
        return R(self.attrs + o.attrs, [a + b for a in self.rows for b in o.rows])

    def join(self, o):                            # natural join
        common = [a for a in self.attrs if a in o.attrs]
        extra = [a for a in o.attrs if a not in common]
        out = []
        for a in self.rows:
            for b in o.rows:
                if all(a[self._ix(c)] == b[o._ix(c)] for c in common):
                    out.append(a + tuple(b[o._ix(c)] for c in extra))
        return R(self.attrs + tuple(extra), out)

    def divide(self, o):                          # self(A, B) / o(B) -> A
        keep = [a for a in self.attrs if a not in o.attrs]
        cand = self.project(*keep)
        needed = R(keep + list(o.attrs), [c + s for c in cand.rows for s in o.rows])
        missing = needed.minus(self.project(*(keep + list(o.attrs)))).project(*keep)
        return cand.minus(missing)

    def show(self, title):
        print(f'{title}  [{", ".join(self.attrs)}]')
        for t in sorted(self.rows, key=str):
            print('   ', t)

Student = R(['roll', 'name', 'dept'], [(1, 'Asha', 'CSE'), (2, 'Ravi', 'ECE'),
                                       (3, 'Neha', 'CSE'), (4, 'Sam', 'IT'), (5, 'Zoya',
                                               'CSE')])
Course = R(['cid', 'title', 'area'], [('C1', 'DBMS', 'db'), ('C2', 'Data Mining', 'db'),
                                       ('C3', 'Networks', 'sys')])
Enrolled = R(['roll', 'cid'], [(1, 'C1'), (1, 'C2'), (1, 'C3'), (2, 'C1'),
                               (3, 'C1'), (3, 'C2'), (4, 'C3')])

Student.select(lambda t: t['dept'] == 'CSE').project('name').show('CSE students')
Student.join(Enrolled).join(Course).select(lambda t: t['title'] == 'DBMS') \
       .project('name').show('Took DBMS')
db_courses = Course.select(lambda t: t['area'] == 'db').project('cid')
Enrolled.divide(db_courses).join(Student).project('name').show('Took EVERY db course')
took = Enrolled.project('roll')
Student.project('roll').minus(took).show('Enrolled in nothing')
```

Division answered "students who took **every** database course": Asha and Neha took both C1 and C2, Ravi took only C1. Division is the algebra's "for all" operator, and SQL has no keyword for it, which is why it is a classic exam question.

### Cross-checking with SQL

The same four queries in SQL, run on SQLite, must give the same answers. Division becomes a double `NOT EXISTS`: "there is no db course that this student has not taken".

```python run The same queries in SQL
import sqlite3
db = sqlite3.connect(':memory:')
db.executescript('''
CREATE TABLE Student (roll INT, name TEXT, dept TEXT);
CREATE TABLE Course (cid TEXT, title TEXT, area TEXT);
CREATE TABLE Enrolled (roll INT, cid TEXT);
INSERT INTO Student VALUES (1,'Asha','CSE'),(2,'Ravi','ECE'),(3,'Neha','CSE'),(4,'Sam','IT'),
                           (5,'Zoya','CSE');
INSERT INTO Course VALUES ('C1','DBMS','db'),('C2','Data Mining','db'),
                          ('C3','Networks','sys');
INSERT INTO Enrolled VALUES (1,'C1'),(1,'C2'),(1,'C3'),(2,'C1'),(3,'C1'),(3,'C2'),(4,'C3');
''')
queries = {
    'CSE students': "SELECT DISTINCT name FROM Student WHERE dept = 'CSE'",
    'Took DBMS': """SELECT DISTINCT s.name FROM Student s NATURAL JOIN Enrolled
                    NATURAL JOIN Course c WHERE c.title = 'DBMS'""",
    'Took EVERY db course': """
        SELECT s.name FROM Student s WHERE NOT EXISTS (
            SELECT * FROM Course c WHERE c.area = 'db' AND NOT EXISTS (
                SELECT * FROM Enrolled e WHERE e.roll = s.roll AND e.cid = c.cid))""",
    'Enrolled in nothing': "SELECT roll FROM Student EXCEPT SELECT roll FROM Enrolled",
}
for title, q in queries.items():
    print(f'{title:22}', sorted(r[0] for r in db.execute(q)))
```

> TRAP: Projection in relational algebra removes duplicates; `SELECT name` in SQL does not. π<sub>name</sub>(Student) has one tuple per *distinct* name, so if two students were both called Ravi it would have one Ravi, while `SELECT name FROM Student` would still return one row per student.

### Equivalences you should know

These rules let the optimiser rearrange a query tree without changing its result (Chapter 8 uses them):

| Rule | Equivalence | Why it helps |
|---|---|---|
| Cascade of σ | σ<sub>p∧q</sub>(R) = σ<sub>p</sub>(σ<sub>q</sub>(R)) | Lets each condition move independently |
| Commutativity of σ | σ<sub>p</sub>(σ<sub>q</sub>(R)) = σ<sub>q</sub>(σ<sub>p</sub>(R)) | Apply the most selective filter first |
| Push σ through ⋈ | σ<sub>p</sub>(R ⋈ S) = σ<sub>p</sub>(R) ⋈ S, if p uses only R's attributes | Filter before joining: smaller inputs |
| Push π through ⋈ | Keep only columns needed above and by the join condition | Narrower intermediate results |
| Join commutativity | R ⋈ S = S ⋈ R | Choose the build and probe sides |
| Join associativity | (R ⋈ S) ⋈ T = R ⋈ (S ⋈ T) | Choose the join order |

## 2.4 Relational calculus

Relational algebra is **procedural**: an expression says which operations to apply in which order. Relational calculus is **declarative**: it describes the tuples you want and leaves the method open, just like SQL.

| | Tuple relational calculus (TRC) | Domain relational calculus (DRC) |
|---|---|---|
| Variables range over | Tuples | Attribute values (domains) |
| Form | { t \| P(t) } | { ⟨a, b⟩ \| P(a, b) } |
| "CSE students' names" | { t.name \| t ∈ Student ∧ t.dept = 'CSE' } | { ⟨n⟩ \| ∃r (⟨r, n, 'CSE'⟩ ∈ Student) } |
| "Took every db course" | { s.name \| s ∈ Student ∧ ∀c ∈ Course (c.area = 'db' ⇒ ∃e ∈ Enrolled (e.roll = s.roll ∧ e.cid = c.cid)) } | Same idea with domain variables |
| Inspired | SQL | QBE (Query By Example) |

**Codd's theorem**: relational algebra and *safe* relational calculus have exactly the same expressive power. A language with at least this power is called **relationally complete**. "Safe" rules out queries such as { t \| ¬(t ∈ Student) }, whose answer would be infinite (every tuple that is not a student).

Notice how ∀ in the calculus maps to division in the algebra and to double `NOT EXISTS` in SQL: ∀x P(x) is the same as ¬∃x ¬P(x).

## 2.5 From an ER diagram to tables

An ER (entity-relationship) diagram describes the world as entities, attributes and relationships. Mapping it to relations follows mechanical rules:

| ER construct | Mapping rule |
|---|---|
| Strong entity | One table; simple attributes become columns; choose a key as primary key |
| Composite attribute (`address` = street, city) | Store the component attributes as separate columns |
| Multivalued attribute (`phones`) | A separate table: (owner key, value), key is both columns |
| Derived attribute (`age` from `dob`) | Usually not stored; compute it in queries or a view |
| Weak entity (`Dependent` of `Employee`) | Table with the owner's key + its partial key; primary key = both; FK to owner with `ON DELETE CASCADE` |
| 1:1 relationship | Foreign key on either side, preferably the side with total participation; add `UNIQUE` |
| 1:N relationship | Foreign key on the **N** side (each employee stores its department) |
| M:N relationship | A separate table with both keys (the pair is the primary key) plus relationship attributes |
| N-ary relationship | A table with the keys of all participating entities |
| Specialisation (ISA) | Option A: one table per subclass + superclass table (shared key). Option B: one table per subclass only, repeating superclass attributes. Option C: one table with a type column and nullable subclass columns |

Here is a small university ER design mapped by those rules, with constraints that make SQLite enforce the ER semantics:

```text
  [Department] 1 ----- works_in ----- N [Instructor] M --- teaches --- N [Course]
       |                                    |                            (semester)
       | 1                                  | 1
       N                                  owns
  [Student] (phones: multivalued)           |  (weak entity, partial key: name)
                                        [[Dependent]]
```

```python run Mapping the ER diagram, then testing the rules
import sqlite3
db = sqlite3.connect(':memory:')
db.execute('PRAGMA foreign_keys = ON')
db.executescript('''
CREATE TABLE department (dept_id INT PRIMARY KEY, name TEXT NOT NULL UNIQUE);
CREATE TABLE instructor (                         -- 1:N works_in: FK on the N side
    inst_id INT PRIMARY KEY, name TEXT,
    dept_id INT NOT NULL REFERENCES department(dept_id));
CREATE TABLE course (course_id TEXT PRIMARY KEY, title TEXT);
CREATE TABLE teaches (                            -- M:N with an attribute
    inst_id INT REFERENCES instructor(inst_id),
    course_id TEXT REFERENCES course(course_id),
    semester TEXT,
    PRIMARY KEY (inst_id, course_id, semester));
CREATE TABLE dependent (                          -- weak entity
    inst_id INT REFERENCES instructor(inst_id) ON DELETE CASCADE,
    name TEXT, relation TEXT,
    PRIMARY KEY (inst_id, name));
CREATE TABLE student (roll INT PRIMARY KEY, name TEXT,
                      dept_id INT REFERENCES department(dept_id));
CREATE TABLE student_phone (                      -- multivalued attribute
    roll INT REFERENCES student(roll), phone TEXT, PRIMARY KEY (roll, phone));
INSERT INTO department VALUES (1, 'CSE');
INSERT INTO instructor VALUES (10, 'Dr Sen', 1);
INSERT INTO course VALUES ('CS301', 'DBMS');
INSERT INTO teaches VALUES (10, 'CS301', '2026-odd');
INSERT INTO dependent VALUES (10, 'Riya', 'daughter');
INSERT INTO student VALUES (1, 'Asha', 1);
INSERT INTO student_phone VALUES (1, '98300 00001'), (1, '98300 00002');
''')
tests = [
    ('instructor without a valid department', "INSERT INTO instructor VALUES (11, 'X', 9)"),
    ('same course twice in one semester',
            "INSERT INTO teaches VALUES (10, 'CS301', '2026-odd')"),
    ('duplicate phone for a student',
            "INSERT INTO student_phone VALUES (1, '98300 00001')"),
]
for label, sql in tests:
    try:
        db.execute(sql); print('ACCEPTED :', label)
    except sqlite3.IntegrityError as e:
        print('REJECTED :', label, '->', e)
try:
    db.execute('DELETE FROM instructor WHERE inst_id = 10')    # still teaches a course
except sqlite3.IntegrityError as e:
    print('REJECTED : deleting an instructor who teaches ->', e)
db.execute('DELETE FROM teaches WHERE inst_id = 10')
db.execute('DELETE FROM instructor WHERE inst_id = 10')
left = db.execute('SELECT COUNT(*) FROM dependent').fetchone()[0]
print('after deleting the instructor, dependents left:', left, '(weak entity cascaded)')
```

The foreign key on `teaches` has no `ON DELETE` clause, so it defaults to `NO ACTION` and blocks the delete. The weak entity `dependent` uses `ON DELETE CASCADE`, because a dependent cannot exist without its owner.

## 2.6 Practical lessons

- A key is a property of the schema (all legal instances), never of today's data.
- Learn the algebra operators with their SQL equivalents; draw query trees for SQL queries you write.
- Division means "for all"; in SQL write it as double `NOT EXISTS`, or as `GROUP BY ... HAVING COUNT(DISTINCT ...) = (SELECT COUNT(*) ...)`.
- Algebra and safe calculus are equally expressive (Codd's theorem). SQL adds aggregation, ordering and bags on top.
- ER mapping: FK on the N side for 1:N, a separate table for M:N and for multivalued attributes, owner key plus partial key for weak entities.
