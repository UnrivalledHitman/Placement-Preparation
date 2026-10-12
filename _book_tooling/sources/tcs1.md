# Solutions to the coding problems
%Every solution run on the sample input and on an edge-case input; in the exam, read input once and call main() once

Each solution is written in exam style: the classes, then a `main()` that reads input with `input()` and prints. To show it working, the last lines feed two inputs through `sys.stdin`: the sample from the question, then an edge case (no matches, ties or unusual values). In the exam you simply call `main()`.

### P1.1 Employees of a company

```python run Filtering, a dictionary of averages, and a first-maximum with ties
import io, sys

class Employee:
    def __init__(self, emp_id, name, dept, salary):
        self.emp_id = emp_id
        self.name = name
        self.dept = dept
        self.salary = salary

class Company:
    def __init__(self, employees):
        self.employees = employees

    def employees_in(self, dept):
        return [e.name for e in self.employees if e.dept.lower() == dept.lower()]

    def average_salary_by_dept(self):
        totals, counts = {}, {}
        for e in self.employees:
            totals[e.dept] = totals.get(e.dept, 0) + e.salary
            counts[e.dept] = counts.get(e.dept, 0) + 1
        return {d: round(totals[d] / counts[d], 2) for d in totals}

    def highest_paid(self):
        return max(self.employees, key=lambda e: e.salary) if self.employees else None

def main():
    n = int(input())
    emps = [Employee(int(input()), input().strip(), input().strip(), float(input()))
            for _ in range(n)]
    dept = input().strip()
    company = Company(emps)
    names = company.employees_in(dept)
    print('\n'.join(names) if names else 'No Employee Found')
    for d, avg in sorted(company.average_salary_by_dept().items()):
        print(d, avg)
    top = company.highest_paid()
    print(top.name if top else 'No Employee Found')

SAMPLE = ('4\n1\nAsha\nAI\n90000\n2\nRavi\nCloud\n75000\n3\nMeera\nAI\n85000\n4\nKiran\n'
          'Cloud\n90000\nai\n')
EDGE = '2\n7\nDev\nHR\n50000\n8\nAnu\nHR\n50000\nSales\n'
for data in (SAMPLE, EDGE):
    sys.stdin = io.StringIO(data)
    main()
    print('---')
```

The department filter is case-insensitive (`ai` matches `AI`); averages are rounded to two decimals as asked; and `max` returns the **first** of two equal salaries (Asha before Kiran; Dev before Anu), which is the usual expected tie rule when the question says "the first employee in input order".

### P1.2 Store inventory

```python run defaultdict for category totals, a sorted restock list, case-insensitive search
import io, sys
from collections import defaultdict

class Item:
    def __init__(self, code, name, category, price, qty):
        self.code = code
        self.name = name
        self.category = category
        self.price = price
        self.qty = qty

class Inventory:
    def __init__(self, items):
        self.items = items

    def restock_list(self, threshold):
        low = [i for i in self.items if i.qty < threshold]
        return sorted(low, key=lambda i: (i.qty, i.name))

    def category_value(self):
        value = defaultdict(float)
        for i in self.items:
            value[i.category] += i.price * i.qty
        return dict(value)

    def search(self, text):
        return [i.name for i in self.items if text.lower() in i.name.lower()]

def main():
    n = int(input())
    items = [Item(input().strip(), input().strip(), input().strip(), float(input()),
            int(input()))
             for _ in range(n)]
    threshold = int(input())
    text = input().strip()
    inv = Inventory(items)
    low = inv.restock_list(threshold)
    if low:
        for i in low:
            print(i.code, i.name, i.qty)
    else:
        print('No Restock Needed')
    for cat, val in sorted(inv.category_value().items(), key=lambda kv: -kv[1]):
        print(f'{cat} {val:.2f}')
    found = inv.search(text)
    print(', '.join(found) if found else 'Not Found')

SAMPLE = ('4\nP1\nGel Pen\nStationery\n10\n40\nP2\nNotebook\nStationery\n55\n8\n'
          'P3\nUSB Cable\nElectronics\n199\n3\nP4\nPen '
                  'Drive\nElectronics\n450\n8\n10\npen\n')
EDGE = '1\nX9\nStapler\nOffice\n120\n25\n5\nlaptop\n'
for data in (SAMPLE, EDGE):
    sys.stdin = io.StringIO(data)
    main()
    print('---')
```

The restock list is sorted by quantity, then name, so the two items with 8 units appear alphabetically. Category values are printed highest first with exactly two decimals using an f-string. `'pen' in 'Pen Drive'.lower()` finds both pens, and the edge case shows both fallback messages.

### P1.3 Bank accounts with inheritance

```python run A base class, two subclasses overriding withdraw, and polymorphic processing
import io, sys

class Account:
    def __init__(self, acc_no, holder, balance):
        self.acc_no = acc_no
        self.holder = holder
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount
        return True

    def withdraw(self, amount):
        if amount <= self.balance:
            self.balance -= amount
            return True
        return False

class Savings(Account):
    MIN_BALANCE = 1000

    def withdraw(self, amount):
        if self.balance - amount >= Savings.MIN_BALANCE:
            self.balance -= amount
            return True
        return False

    def add_interest(self, rate):
        self.balance = round(self.balance * (1 + rate / 100), 2)

class Current(Account):
    def __init__(self, acc_no, holder, balance, overdraft):
        super().__init__(acc_no, holder, balance)
        self.overdraft = overdraft

    def withdraw(self, amount):
        if self.balance - amount >= -self.overdraft:
            self.balance -= amount
            return True
        return False

def main():
    n = int(input())
    accounts = {}
    for _ in range(n):
        kind, acc_no, holder, balance = input().split()
        if kind == 'S':
            accounts[acc_no] = Savings(acc_no, holder, float(balance))
        else:
            accounts[acc_no] = Current(acc_no, holder, float(balance), float(input()))
    t = int(input())
    for _ in range(t):
        acc_no, op, amount = input().split()
        acc = accounts.get(acc_no)
        if acc is None:
            print(acc_no, 'Invalid Account')
            continue
        ok = acc.deposit(float(amount)) if op == 'D' else acc.withdraw(float(amount))
        print(acc_no, 'Success' if ok else 'Failed')
    rate = float(input())
    for acc in accounts.values():
        if isinstance(acc, Savings):
            acc.add_interest(rate)
    for acc in sorted(accounts.values(), key=lambda a: a.acc_no):
        print(acc.acc_no, acc.holder, f'{acc.balance:.2f}')
    negative = [a.acc_no for a in accounts.values() if a.balance < 0]
    print('Overdrawn:', ' '.join(sorted(negative)) if negative else 'None')

SAMPLE = ('3\nS 101 Asha 5000\nC 102 Ravi 2000\n3000\nS 103 Meera 1500\n5\n101 W 4500\n'
          '102 W 4000\n103 D 500\n103 W 900\n109 D 100\n4\n')
EDGE = '1\nS 201 Dev 1000\n1\n201 W 1\n10\n'
for data in (SAMPLE, EDGE):
    sys.stdin = io.StringIO(data)
    main()
    print('---')
```

`withdraw` is **overridden** in each subclass, so the loop calls the right rule without checking types (polymorphism); `isinstance` is used only for interest, which exists only on savings accounts. Withdrawing 4,500 from 5,000 fails because it would breach the 1,000 minimum; the current account may go to −2,000 within its 3,000 overdraft.

### P1.4 Movie ratings

```python run Counter for genres, a multi-key sort for the top k, averages per director
import io, sys
from collections import Counter, defaultdict

class Movie:
    def __init__(self, title, genre, director, rating, year):
        self.title = title
        self.genre = genre
        self.director = director
        self.rating = rating
        self.year = year

class Catalogue:
    def __init__(self, movies):
        self.movies = movies

    def genre_counts(self):
        return Counter(m.genre for m in self.movies)

    def top_rated(self, k):
        return sorted(self.movies, key=lambda m: (-m.rating, m.title))[:k]

    def director_average(self):
        ratings = defaultdict(list)
        for m in self.movies:
            ratings[m.director].append(m.rating)
        return {d: round(sum(r) / len(r), 1) for d, r in ratings.items()}

    def movies_after(self, year):
        return [m.title for m in self.movies if m.year > year]

def main():
    n = int(input())
    movies = []
    for _ in range(n):
        title, genre, director, rating, year = input().split(',')
        movies.append(Movie(title.strip(), genre.strip(), director.strip(),
                            float(rating), int(year)))
    k, year = int(input()), int(input())
    cat = Catalogue(movies)
    for genre, count in cat.genre_counts().most_common():
        print(genre, count)
    for m in cat.top_rated(k):
        print(m.title, m.rating)
    for d, avg in sorted(cat.director_average().items(), key=lambda kv: (-kv[1], kv[0])):
        print(d, avg)
    recent = cat.movies_after(year)
    print(len(recent), 'movie(s) after', year)

SAMPLE = ('5\nInception, SciFi, Nolan, 8.8, 2010\nDangal, Drama, Tiwari, 8.3, 2016\n'
          'Interstellar, SciFi, Nolan, 8.7, 2014\nTumbbad, Horror, Barve, 8.3, 2018\n'
          'Tenet, SciFi, Nolan, 7.3, 2020\n3\n2015\n')
EDGE = '2\nB, Drama, X, 7.0, 2001\nA, Drama, Y, 7.0, 2001\n5\n2030\n'
for data in (SAMPLE, EDGE):
    sys.stdin = io.StringIO(data)
    main()
    print('---')
```

Input arrives as one comma-separated line per movie, so each field is `strip()`-ped after `split(',')`. Dangal and Tumbbad tie at 8.3; the key `(-rating, title)` puts Dangal first. Asking for the top 5 of 2 movies simply returns both (slicing never fails). `Counter.most_common()` orders genres by count; ties keep first-seen order.

### P1.5 Student results with dense ranks

```python run A dataclass, computed grades, and dense ranking with ties
import io, sys
from dataclasses import dataclass, field

@dataclass
class Student:
    roll: int
    name: str
    marks: list = field(default_factory=list)

    def total(self):
        return sum(self.marks)

    def grade(self):
        avg = self.total() / len(self.marks)
        return 'A' if avg >= 85 else 'B' if avg >= 70 else 'C' if avg >= 50 else 'F'

class ResultSheet:
    def __init__(self, students):
        self.students = students

    def ranked(self):
        order = sorted(self.students, key=lambda s: (-s.total(), s.roll))
        ranks, rank, prev = [], 0, None
        for s in order:
            if s.total() != prev:
                rank += 1
                prev = s.total()
            ranks.append((rank, s))
        return ranks

    def failed_in_any(self, pass_mark):
        return [s.name for s in self.students if min(s.marks) < pass_mark]

def main():
    n = int(input())
    students = []
    for _ in range(n):
        roll = int(input())
        name = input().strip()
        marks = list(map(int, input().split()))
        students.append(Student(roll, name, marks))
    pass_mark = int(input())
    sheet = ResultSheet(students)
    for rank, s in sheet.ranked():
        print(rank, s.roll, s.name, s.total(), s.grade())
    failed = sheet.failed_in_any(pass_mark)
    print('Failed:', ', '.join(failed) if failed else 'None')

SAMPLE = ('4\n11\nAsha\n90 85 92\n12\nRavi\n70 65 80\n13\nMeera\n95 88 84\n14\nKiran\n'
          '30 75 60\n35\n')
EDGE = '2\n1\nZed\n50 50\n2\nAmy\n50 50\n40\n'
for data in (SAMPLE, EDGE):
    sys.stdin = io.StringIO(data)
    main()
    print('---')
```

Asha and Meera both total 267, so they share rank 1 and Ravi is rank 2 (dense ranking, no gap); within a tie, the smaller roll number is listed first. `@dataclass` writes `__init__` and `__repr__` automatically; `field(default_factory=list)` avoids the shared-mutable-default trap. Kiran fails because one mark (30) is below 35, even though the average is fine.

### P1.6 Hospital queue

```python run deque for arrival order, heapq for emergencies, with a stable tie-break
import io, sys, heapq
from collections import deque

class Patient:
    def __init__(self, pid, name, severity):
        self.pid = pid
        self.name = name
        self.severity = severity               # 1 = most severe

class Hospital:
    def __init__(self):
        self.normal = deque()
        self.emergency = []
        self.arrivals = 0

    def admit(self, patient):
        self.arrivals += 1
        if patient.severity <= 2:
            heapq.heappush(self.emergency, (patient.severity, self.arrivals, patient))
        else:
            self.normal.append(patient)

    def next_patient(self):
        if self.emergency:
            return heapq.heappop(self.emergency)[2]
        if self.normal:
            return self.normal.popleft()
        return None

def main():
    hospital = Hospital()
    q = int(input())
    for _ in range(q):
        parts = input().split()
        if parts[0] == 'ADMIT':
            hospital.admit(Patient(parts[1], parts[2], int(parts[3])))
        else:
            p = hospital.next_patient()
            print(f'{p.pid} {p.name}' if p else 'No Patients')
    waiting = len(hospital.normal) + len(hospital.emergency)
    print('Waiting:', waiting)

SAMPLE = ('8\nADMIT P1 Asha 4\nADMIT P2 Ravi 2\nADMIT P3 Meera 5\nADMIT P4 Kiran 1\n'
          'NEXT\nNEXT\nNEXT\nADMIT P5 Dev 2\n')
EDGE = '3\nNEXT\nADMIT X1 Anu 3\nNEXT\n'
for data in (SAMPLE, EDGE):
    sys.stdin = io.StringIO(data)
    main()
    print('---')
```

Emergencies (severity 1–2) jump the queue, most severe first; the arrival counter in the heap tuple breaks ties between equal severities in arrival order **and** stops Python from ever comparing two `Patient` objects (which would raise `TypeError`, since `Patient` defines no `<`). Normal patients are served first come, first served from the deque.

### P1.7 Library borrowing records

```python run Sets for "borrowed both" and "never borrowed", Counter for the most borrowed
import io, sys
from collections import Counter

class Member:
    def __init__(self, member_id, name):
        self.member_id = member_id
        self.name = name
        self.borrowed = set()

class Library:
    def __init__(self, members, titles):
        self.members = {m.member_id: m for m in members}
        self.titles = titles
        self.counts = Counter()

    def borrow(self, member_id, title):
        if member_id not in self.members or title not in self.titles:
            return False
        self.members[member_id].borrowed.add(title)
        self.counts[title] += 1
        return True

    def borrowed_both(self, t1, t2):
        return sorted(m.name for m in self.members.values() if {t1, t2} <= m.borrowed)

    def never_borrowed(self):
        used = set().union(*(m.borrowed for m in self.members.values()))
        return sorted(set(self.titles) - used)

    def most_borrowed(self):
        if not self.counts:
            return None
        best = max(self.counts.values())
        return sorted(t for t, c in self.counts.items() if c == best)

def main():
    m = int(input())
    members = [Member(*input().split()) for _ in range(m)]
    titles = [input().strip() for _ in range(int(input()))]
    lib = Library(members, titles)
    for _ in range(int(input())):
        member_id, title = input().split(' ', 1)
        if not lib.borrow(member_id, title.strip()):
            print('Invalid:', member_id, title.strip())
    t1, t2 = input().strip(), input().strip()
    both = lib.borrowed_both(t1, t2)
    print('Both:', ', '.join(both) if both else 'None')
    never = lib.never_borrowed()
    print('Never borrowed:', ', '.join(never) if never else 'None')
    best = lib.most_borrowed()
    print('Most borrowed:', ', '.join(best) if best else 'None')

SAMPLE = ('3\nM1 Asha\nM2 Ravi\nM3 Meera\n4\nPython Crash Course\nClean Code\n'
          'Deep Learning\nSQL Basics\n6\nM1 Clean Code\nM2 Python Crash Course\n'
          'M1 Python Crash Course\nM3 Clean Code\nM9 SQL Basics\nM2 Clean Code\n'
          'Clean Code\nPython Crash Course\n')
EDGE = '1\nM1 Dev\n1\nAI\n0\nAI\nML\n'
for data in (SAMPLE, EDGE):
    sys.stdin = io.StringIO(data)
    main()
    print('---')
```

Titles contain spaces, so each borrow line is split **once** (`split(' ', 1)`) into the member id and the rest. `{t1, t2} <= borrowed` tests "borrowed both"; `set(titles) - used` gives the never-borrowed titles; ties for most borrowed are all reported, alphabetically. The invalid member M9 is rejected and reported, and an empty history produces `None` everywhere instead of a crash in `max`.

### P1.8 Orders and frequently bought pairs

```python run Revenue per customer, and pairs of items bought together counted with combinations
import io, sys
from collections import Counter, defaultdict
from itertools import combinations

class Order:
    def __init__(self, order_id, customer, items, prices):
        self.order_id = order_id
        self.customer = customer
        self.items = items
        self.prices = prices

    def amount(self):
        return sum(self.prices)

class Shop:
    def __init__(self, orders):
        self.orders = orders

    def revenue_by_customer(self):
        rev = defaultdict(float)
        for o in self.orders:
            rev[o.customer] += o.amount()
        return dict(rev)

    def frequent_pairs(self, min_count):
        pairs = Counter()
        for o in self.orders:
            for pair in combinations(sorted(set(o.items)), 2):
                pairs[pair] += 1
        return sorted(((p, c) for p, c in pairs.items() if c >= min_count),
                      key=lambda pc: (-pc[1], pc[0]))

def main():
    n = int(input())
    orders = []
    for _ in range(n):
        order_id, customer = input().split()
        items = input().split()
        prices = list(map(float, input().split()))
        orders.append(Order(order_id, customer, items, prices))
    min_count = int(input())
    shop = Shop(orders)
    for cust, rev in sorted(shop.revenue_by_customer().items(), key=lambda kv: (-kv[1],
            kv[0])):
        print(f'{cust} {rev:.2f}')
    pairs = shop.frequent_pairs(min_count)
    if pairs:
        for (a, b), c in pairs:
            print(f'{a}+{b} {c}')
    else:
        print('No Frequent Pairs')

SAMPLE = ('4\nO1 Asha\nbread butter jam\n40 55 120\nO2 Ravi\nbread butter\n40 55\n'
          'O3 Asha\nmilk bread butter\n30 40 55\nO4 Meera\njam bread\n120 40\n2\n')
EDGE = '1\nO9 Dev\ntea\n25\n1\n'
for data in (SAMPLE, EDGE):
    sys.stdin = io.StringIO(data)
    main()
    print('---')
```

`combinations(sorted(set(items)), 2)` lists each unordered pair once per order (sorting makes `('bread', 'butter')` and `('butter', 'bread')` the same key; `set` ignores an item repeated in one order). This is the support-counting step of association rules (guide, Chapter 6) written with the collections the coding round expects.
