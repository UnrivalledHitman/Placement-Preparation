# How to use this guide
%The AI and ML stream paper, how its 100 marks are split, and a 12-day plan to the exam on 24 October

This guide is built for one paper: the **TCS CPA AI & ML stream**. Every chapter maps to a section of the question paper, and the depth of each chapter follows the marks.

| Section | Coverage | Questions | Marks | Guide |
|---|---|---|---|---|
| Python coding | One OOP-based question using collections | 1 | 35 | Chapter 1 |
| Technical quiz | SQL, AI basics, EDA and visualisation, supervised learning, unsupervised learning, advanced ML, GenAI and LLMs, agentic AI and RAG | 40 (5 per topic: 2 theory, 3 scenario or code) | 40 | Chapters 2–9 |
| Business skills quiz | Business skills | 25 | 25 | Chapter 10 |
| **Total** | | **66** | **100** | |

Three facts shape the preparation:

- **The coding question is a third of the paper.** One well-tested program is worth 35 marks; it deserves daily practice in a plain editor, not just reading.
- **60% of the technical quiz is scenario or code based.** For each topic, the guide shows the code patterns and output-prediction traps that such questions use, and every code example was actually run.
- **Business skills is a quarter of the paper** and needs the least study time per mark: learn the principles in Chapter 10 and practise the question bank.

## How the examples were run

Every Python, pandas, scikit-learn, SQL and seaborn example in this book was executed (Python 3.13, pandas 3, scikit-learn 1.9, SQLite for SQL), and the output shown under it is real. SQL in the exam is usually standard SQL with MySQL flavour; the few places where SQLite and MySQL differ are pointed out.

## The 12-day plan

| Dates | Focus | Target |
|---|---|---|
| 12–13 Oct | Chapter 1 (Python OOP and collections); practice problems P1–P3 | Write P1 from a blank file in under 40 minutes |
| 14 Oct | Chapter 2 (SQL), SQL bank; problem P4 | Every join and GROUP BY question right |
| 15 Oct | Chapters 3–4 (AI basics, EDA), their banks | Predict pandas outputs without running code |
| 16 Oct | Chapters 5–6 (supervised, unsupervised), their banks; P5 | Explain every metric from a confusion matrix |
| 17 Oct | Chapter 7 (advanced ML), its bank; P6 | Bagging versus boosting, tuning, leakage |
| 18 Oct | Chapters 8–9 (GenAI, agentic AI, RAG), their banks | RAG pipeline drawn from memory |
| 19 Oct | Chapter 10 (business skills), its bank; P7 | 22 of 25 in the bank |
| 20 Oct | **Mock paper 1**, timed; review every wrong answer | Find the two weakest topics |
| 21 Oct | Weak topics again; P8; redo ✗ coding problems | |
| 22 Oct | **Mock paper 2**, timed; review | 75+ marks |
| 23 Oct | Quick Revision book twice; rest | Sleep early |
| 24 Oct | **Exam** | |

> TIP: Practise coding in a plain editor (Notepad, IDLE) at least three times. Exam IDEs often lack autocomplete, and the code must read input exactly as specified and print exactly the expected output.

# Chapter 1: The Python Coding Round
%Classes, inheritance and dunder methods; lists, dictionaries, sets and the collections module; reading input; and two complete exam-style solutions

## 1.1 What the coding question looks like

TCS's Python coding questions follow a recognisable template:

1. **Define a class** (for example `Book`) with given attributes, set in `__init__` in a given order.
2. **Define a second class** (for example `Library`) that holds a list of the first class's objects and has **named methods** that filter, count, group, sort or find the maximum or minimum.
3. **Write the main part**: read the number of objects, read each object's attributes line by line with `input()`, read one or two parameters, call the methods and print the results in an exact format, printing a fixed message (such as `No Data Found`) when nothing matches.

The program is judged by hidden test cases that compare your output **character by character**. Marks are typically awarded per passing test case, so a solution that handles the normal cases but crashes on "no match" loses marks it could easily have had.

| Requirement | What goes wrong |
|---|---|
| Class and method names exactly as given | `getBooks` instead of `get_books`: the checker calls the given name |
| Attribute order in `__init__` as given | Arguments swapped silently |
| Convert input types | `input()` returns a string: `"100" > "25"` is `False` |
| Exact output format | Extra spaces, `print(list)` instead of one value per line, wrong case |
| Edge cases | Empty result, ties, duplicate names, case sensitivity |
| No extra prompts | `input("Enter n: ")` prints the prompt and fails every test |

## 1.2 Classes and objects

```python run Class attributes, instance attributes, methods and dunder methods
class Product:
    tax_rate = 0.18   # class attribute: shared by all objects

    def __init__(self, pid, name, price, qty):
        self.pid = pid                               # instance attributes: one per object
        self.name = name
        self.price = price
        self.qty = qty

    def value(self):                                 # instance method
        return self.price * self.qty

    def price_with_tax(self):
        return round(self.price * (1 + Product.tax_rate), 2)

    def __str__(self):                               # used by print() and str()
        return f'{self.pid} {self.name} {self.price}'

    def __repr__(self):                              # used inside lists and the REPL
        return f'Product({self.pid!r})'

    def __eq__(self, other):                         # == compares by product id
        return isinstance(other, Product) and self.pid == other.pid

    def __lt__(self, other):   # lets sorted() and min() compare products
        return self.price < other.price

a = Product(1, 'Pen', 10.0, 50)
b = Product(2, 'Notebook', 45.5, 20)
c = Product(1, 'Pen (blue)', 12.0, 5)
print(a, '|', a.value(), '|', b.price_with_tax())
print([a, b])
print('a == c:', a == c, '| a is c:', a is c)
print('cheapest:', min([b, a, c]))
Product.tax_rate = 0.05   # changing the class attribute affects all
print(b.price_with_tax())
a.tax_rate = 0.5   # creates an instance attribute on a only
print(a.price_with_tax(), b.tax_rate, a.tax_rate)
```

The last line is a classic trap: `a.tax_rate = 0.5` does not change the class attribute; it creates a new attribute on `a` alone. `price_with_tax` reads `Product.tax_rate`, so it still uses 0.05.

| Dunder method | Called by |
|---|---|
| `__init__` | Creating an object |
| `__str__` / `__repr__` | `print(obj)` / showing it inside a list |
| `__eq__`, `__lt__` (and `__le__`, `__gt__`...) | `==`, `<`, `sorted()`, `min()`, `max()` |
| `__len__`, `__getitem__`, `__contains__`, `__iter__` | `len(obj)`, `obj[i]`, `x in obj`, `for x in obj` |
| `__hash__` | Using the object as a dict key or set element (define it with `__eq__`) |

## 1.3 Inheritance, polymorphism and encapsulation

```python run Overriding, super(), isinstance, abstract classes and name mangling
from abc import ABC, abstractmethod

class Employee(ABC):
    count = 0

    def __init__(self, name, base):
        self.name = name
        self._base = base                 # "protected" by convention
        self.__id = Employee.count + 1    # name-mangled to _Employee__id
        Employee.count += 1

    @abstractmethod
    def salary(self):
        ...

    def describe(self):
        return f'{self.name}: {self.salary()}'      # calls the subclass's salary()

    @property
    def emp_id(self):                               # read-only attribute
        return self.__id

class Manager(Employee):
    def __init__(self, name, base, bonus):
        super().__init__(name, base)                # run the parent's __init__
        self.bonus = bonus

    def salary(self):
        return self._base + self.bonus

class Intern(Employee):
    def salary(self):
        return self._base * 0.5

staff = [Manager('Asha', 90000, 20000), Intern('Ravi', 30000)]
for e in staff:
    print(e.describe(), '| id', e.emp_id, '| is Employee:', isinstance(e, Employee))
print('objects created:', Employee.count)
try:
    Employee('X', 1)
except TypeError as err:
    print('TypeError:', str(err)[:62], '...')     # message shortened for the page
try:
    print(staff[0].__id)
except AttributeError as err:
    print('AttributeError:', err)
print('mangled name works:', staff[0]._Employee__id)
print(Manager.__mro__[1].__name__, issubclass(Intern, Employee))
```

| Concept | Python rule |
|---|---|
| Inheritance | `class Child(Parent):`; a child without `__init__` uses the parent's |
| `super().__init__(...)` | Must be called explicitly if the child defines `__init__` and needs parent attributes |
| Overriding | Same method name in the child replaces the parent's; `describe` calling `self.salary()` dispatches to the child (polymorphism) |
| Abstract class | Inherit from `ABC`, mark `@abstractmethod`; instantiating it raises `TypeError` |
| Encapsulation | `_x` is private by convention; `__x` is name-mangled to `_Class__x`; `@property` gives read-only access |
| Multiple inheritance | Method resolution order (MRO): left to right, depth first, each class once (`Class.__mro__`) |
| `@staticmethod` / `@classmethod` | No `self` / receives the class (`cls`), often used as alternative constructors |

## 1.4 Collections for the coding round

```python run Lists, dictionaries, sets and tuples: the operations questions use
marks = [72, 95, 58, 95, 81]
print(sorted(marks), sorted(marks, reverse=True), marks.index(95), marks.count(95))
print(marks[1:4], marks[::-1], marks[-2:])
squares = [m // 10 for m in marks if m >= 70]
print(squares)

stock = {'pen': 50, 'ink': 0, 'pad': 12}
stock['clip'] = 30
print(stock.get('ruler', 0), 'pad' in stock, list(stock.keys()))
low = {k: v for k, v in stock.items() if v < 20}
print(low, max(stock, key=stock.get))
for item, qty in sorted(stock.items(), key=lambda kv: (-kv[1], kv[0])):
    print(item, qty)

a, b = {1, 2, 3, 4}, {3, 4, 5}
print(a & b, a | b, a - b, a ^ b)
point = (3, 4)
x, y = point
print(x * y, len(point))
```

```python run The collections module: Counter, defaultdict, deque, namedtuple, and heapq
from collections import Counter, defaultdict, deque, namedtuple, OrderedDict
import heapq

words = 'ai ml ai sql ai ml rag'.split()
c = Counter(words)
print(c, c.most_common(2), c['python'])

by_len = defaultdict(list)                   # missing keys start as an empty list
for w in words:
    by_len[len(w)].append(w)
print(dict(by_len))

q = deque([1, 2, 3])
q.appendleft(0); q.append(4); q.rotate(1)
print(q, q.popleft(), q.pop())

Student = namedtuple('Student', ['name', 'marks'])
s = Student('Asha', 91)
print(s.name, s[1], s._replace(marks=95))

scores = [('Ravi', 72), ('Asha', 91), ('Meera', 85), ('Kiran', 91)]
print(heapq.nlargest(2, scores, key=lambda t: t[1]))
print(sorted(scores, key=lambda t: (-t[1], t[0])))    # marks descending, then name
od = OrderedDict(a=1, b=2); od.move_to_end('a')
print(list(od))
```

Look closely at the deque line: after `rotate(1)` the deque was `[4, 0, 1, 2, 3]`, yet it prints as `deque([0, 1, 2])`. All arguments of `print` are evaluated **before** printing, so `popleft()` (4) and `pop()` (3) have already modified the same deque object by the time it is displayed. Output-prediction questions love this.

| Need | Use | Note |
|---|---|---|
| Count occurrences | `Counter(items)` | `.most_common(k)`; missing keys give 0 |
| Group items by a key | `defaultdict(list)` | No `KeyError` for new keys |
| Queue or stack with fast ends | `deque` | `append`, `appendleft`, `pop`, `popleft` are O(1) |
| Lightweight record | `namedtuple` or `@dataclass` | Readable fields, tuple behaviour |
| Top k | `heapq.nlargest(k, it, key=...)` | O(n log k) |
| Sort by several keys | `sorted(x, key=lambda t: (-t.marks, t.name))` | Negate numbers for descending inside one key |
| Unique values keeping order | `list(dict.fromkeys(items))` | A plain `set` loses order |

> TRAP: `sorted()` returns a new list; `list.sort()` sorts in place and returns `None`. `print(marks.sort())` prints `None`.

## 1.5 Reading input exactly

```python run A reusable main template, tested by feeding input through sys.stdin
import io, sys
sys.stdin = io.StringIO('3\nPen\n10\nInk\n25\nPad\n40\n20\n')   # what the judge would type

n = int(input())
items = []
for _ in range(n):
    name = input().strip()           # strip() removes stray spaces and '\r'
    price = int(input())
    items.append((name, price))
limit = int(input())
cheap = [name for name, price in items if price <= limit]
if cheap:
    for name in cheap:
        print(name)
else:
    print('No Data Found')
```

The judge supplies input exactly as the question describes, usually one value per line. Read with `input()` (no prompt text), convert with `int()` or `float()`, and `strip()` strings. When a line holds several values, `a, b = input().split()` or `list(map(int, input().split()))`.

## 1.6 Worked problem 1: a library

**Problem.** Create a class `Book` with attributes `book_id` (int), `title` (str), `author` (str), `price` (float) and `copies` (int). Create a class `Library` with a list of books and these methods:

- `count_by_author()`: returns a dictionary from author to the number of **titles** by that author.
- `books_under(price)`: returns the titles of books cheaper than `price`, sorted by price ascending (ties by title).
- `most_stocked(author)`: returns the book by the given author (case-insensitive) with the most copies, or `None`.

Input: n, then n books (five lines each), then a price and an author name. Output: the author counts sorted by author, one per line as `author count`; then the cheap titles one per line or `No Book Found`; then the most-stocked title or `No Book Found`.

```python run Complete solution, run on a sample input
import io, sys
from collections import Counter
sys.stdin = io.StringIO('''4
101
Python Basics
Rao
350.0
4
102
Data Science
Iyer
499.5
2
103
Machine Learning
Rao
620.0
7
104
Deep Learning
Rao
620.0
3
500
rao
''')

class Book:
    def __init__(self, book_id, title, author, price, copies):
        self.book_id = book_id
        self.title = title
        self.author = author
        self.price = price
        self.copies = copies

class Library:
    def __init__(self, books):
        self.books = books

    def count_by_author(self):
        return dict(Counter(b.author for b in self.books))

    def books_under(self, price):
        cheap = [b for b in self.books if b.price < price]
        return [b.title for b in sorted(cheap, key=lambda b: (b.price, b.title))]

    def most_stocked(self, author):
        mine = [b for b in self.books if b.author.lower() == author.lower()]
        return max(mine, key=lambda b: b.copies) if mine else None

if __name__ == '__main__':
    n = int(input())
    books = []
    for _ in range(n):
        books.append(Book(int(input()), input().strip(), input().strip(),
                          float(input()), int(input())))
    price = float(input())
    author = input().strip()
    lib = Library(books)
    for a, count in sorted(lib.count_by_author().items()):
        print(a, count)
    cheap = lib.books_under(price)
    print('\n'.join(cheap) if cheap else 'No Book Found')
    best = lib.most_stocked(author)
    print(best.title if best else 'No Book Found')
```

Points examiners test with hidden cases: the author match is case-insensitive (`rao` matches `Rao`); a price exactly equal to the limit is excluded (`<`, as specified); when no book matches, the fixed message is printed instead of an empty line; and `max` with `key` returns the **first** maximum on ties, which matters if two books have equal copies.

## 1.7 Worked problem 2: course enrolments

**Problem.** Create a class `Student` with `roll` (int), `name` (str), `courses` (a list of course codes) and `cgpa` (float). Create a class `Department` with:

- `common_students(c1, c2)`: names of students enrolled in **both** courses, sorted alphabetically.
- `course_toppers()`: a dictionary from each course to the name of its highest-CGPA student (ties: smaller roll number).
- `course_strength()`: course codes with their number of students, most popular first (ties alphabetical).

Input: n; for each student: roll, name, a line of space-separated course codes, cgpa; then two course codes.

```python run Sets for "both", defaultdict for grouping, a tuple key for tie-breaking
import io, sys
from collections import defaultdict, Counter
sys.stdin = io.StringIO('''4
1
Asha
AI ML SQL
9.1
2
Ravi
ML SQL
8.4
3
Meera
AI ML
9.1
4
Kiran
SQL
7.9
ML
SQL
''')

class Student:
    def __init__(self, roll, name, courses, cgpa):
        self.roll = roll
        self.name = name
        self.courses = courses
        self.cgpa = cgpa

class Department:
    def __init__(self, students):
        self.students = students

    def common_students(self, c1, c2):
        return sorted(s.name for s in self.students if {c1, c2} <= set(s.courses))

    def course_toppers(self):
        best = {}
        for s in self.students:
            for c in s.courses:
                cur = best.get(c)
                if cur is None or (s.cgpa, -s.roll) > (cur.cgpa, -cur.roll):
                    best[c] = s
        return {c: s.name for c, s in best.items()}

    def course_strength(self):
        counts = Counter(c for s in self.students for c in s.courses)
        return sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))

n = int(input())
students = [Student(int(input()), input().strip(), input().split(), float(input()))
            for _ in range(n)]
c1, c2 = input().strip(), input().strip()
dept = Department(students)
common = dept.common_students(c1, c2)
print(' '.join(common) if common else 'No Student Found')
for course, name in sorted(dept.course_toppers().items()):
    print(course, name)
for course, count in dept.course_strength():
    print(course, count)
```

Asha and Meera tie on CGPA 9.1 in AI and ML; the tuple comparison `(cgpa, -roll)` picks the smaller roll number, Asha. `{c1, c2} <= set(s.courses)` is the readable "enrolled in both" test (subset), and `Counter` plus a sort key with `-count` gives "most popular first, then alphabetical" in one line.

## 1.8 A checklist for the 35 marks

- Read the whole question twice; underline names, types, order of attributes, output messages.
- Write the classes first, then main; keep methods returning values and main doing the printing (unless told otherwise).
- Convert every number read with `int()` or `float()`; `strip()` every string.
- Handle "no result" with the exact message; check ties, equality boundaries (`<` versus `<=`) and case sensitivity.
- Run the sample input; then invent two more: one with no matches, one with ties.
- Never print prompts or debugging output.
