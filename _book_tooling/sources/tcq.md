# How to use these practice sets
%Eight exam-style coding problems, MCQ banks for all nine quiz topics, and two full mock papers in the 66-question pattern

| Part | Matches | What to do |
|---|---|---|
| Coding problems P1.1–P1.8 | Python coding section (35 marks) | Solve each in a plain editor in 40 minutes, then compare with the solution |
| MCQ banks | Technical quiz topics (8 × 10 questions) and business skills (25) | Attempt a whole bank, then check the answer key and its explanations |
| Mock papers 1 and 2 | The full paper: 1 coding question, 40 technical and 25 business questions | Sit each in one timed session (20 and 22 October in the plan) |

Every code-based MCQ answer and every coding solution was executed; the answer keys show the real outputs. **Marking:** for coding problems, mark ✓ (passes the sample and the edge case without help), ~ (needed the hint) or ✗; for MCQ banks, record the score and redo the wrong questions two days later.

# Coding problems

Each problem follows the exam template: classes with given attributes and methods, and a main part that reads input with `input()` (no prompts) and prints exactly the expected output.

**P1.1 · Easy · Code · Employees of a company.** Create class `Employee` with `emp_id` (int), `name`, `dept` and `salary` (float), and class `Company` holding a list of employees with methods: `employees_in(dept)` returns the names in that department (case-insensitive) in input order; `average_salary_by_dept()` returns a dictionary from department to average salary rounded to 2 decimals; `highest_paid()` returns the employee with the highest salary (first one on ties). Input: n; then 4 lines per employee; then a department name. Output: the matching names one per line, or `No Employee Found`; then each department and its average, sorted by department; then the highest-paid name.

```text
Sample input: 4 / 1 Asha AI 90000 / 2 Ravi Cloud 75000 / 3 Meera AI 85000 /
              4 Kiran Cloud 90000 / ai          (one value per line)
Sample output:
Asha
Meera
AI 87500.0
Cloud 82500.0
Asha
```

**P1.2 · Easy · Code · Store inventory.** Create class `Item` (`code`, `name`, `category`, `price` float, `qty` int) and class `Inventory` with: `restock_list(threshold)` returns items with `qty < threshold` sorted by quantity then name; `category_value()` returns a dictionary from category to total stock value (price × qty); `search(text)` returns names containing `text`, case-insensitive. Input: n; 5 lines per item; a threshold; a search text. Output: `code name qty` for each restock item or `No Restock Needed`; each category and its value with 2 decimals, highest value first; the found names joined by `, ` or `Not Found`.

```text
Sample output (items: P1 Gel Pen Stationery 10 40, P2 Notebook Stationery 55 8,
               P3 USB Cable Electronics 199 3, P4 Pen Drive Electronics 450 8;
               threshold 10; search "pen"):
P3 USB Cable 3
P2 Notebook 8
P4 Pen Drive 8
Electronics 4197.00
Stationery 840.00
Gel Pen, Pen Drive
```

**P1.3 · Medium · Code · Bank accounts with inheritance.** Create class `Account` (`acc_no`, `holder`, `balance`) with `deposit` and `withdraw` (refuse if the balance would go negative); subclass `Savings` whose `withdraw` keeps a minimum balance of 1,000 and which has `add_interest(rate)`; subclass `Current` with an `overdraft` limit, whose `withdraw` allows the balance down to −overdraft. Input: n accounts, each `S acc holder balance` or `C acc holder balance` followed by a line with the overdraft; then t transactions `acc D|W amount`; then an interest rate. For each transaction print `acc Success`, `acc Failed` or `acc Invalid Account`. Then add interest to savings accounts and print every account sorted by number as `acc holder balance` (2 decimals), and `Overdrawn:` followed by account numbers with a negative balance or `None`.

```text
Sample input: 3 / S 101 Asha 5000 / C 102 Ravi 2000 / 3000 / S 103 Meera 1500 /
              5 / 101 W 4500 / 102 W 4000 / 103 D 500 / 103 W 900 / 109 D 100 / 4
Sample output:
101 Failed
102 Success
103 Success
103 Success
109 Invalid Account
101 Asha 5200.00
102 Ravi -2000.00
103 Meera 1144.00
Overdrawn: 102
```

**P1.4 · Medium · Code · Movie ratings.** Create class `Movie` (`title`, `genre`, `director`, `rating` float, `year` int) and class `Catalogue` with: `genre_counts()` (a `Counter`); `top_rated(k)` (by rating descending, then title); `director_average()` (average rating per director, rounded to 1 decimal); `movies_after(year)`. Input: n; one line per movie with comma-separated fields; then k and a year. Output: genres with counts, most common first; the top k as `title rating`; directors with averages, highest first then by name; then `<count> movie(s) after <year>`.

```text
Sample input: 5 / Inception, SciFi, Nolan, 8.8, 2010 / Dangal, Drama, Tiwari, 8.3, 2016 /
              Interstellar, SciFi, Nolan, 8.7, 2014 / Tumbbad, Horror, Barve, 8.3, 2018 /
              Tenet, SciFi, Nolan, 7.3, 2020 / 3 / 2015
Sample output:
SciFi 3
Drama 1
Horror 1
Inception 8.8
Interstellar 8.7
Dangal 8.3
Barve 8.3
Nolan 8.3
Tiwari 8.3
3 movie(s) after 2015
```

**P1.5 · Medium · Code · Student results with dense ranks.** Create a class `Student` (`roll`, `name`, `marks` as a list of ints) with `total()` and `grade()` (average ≥ 85 → A, ≥ 70 → B, ≥ 50 → C, else F), and a class `ResultSheet` with `ranked()` (dense ranks by total descending; ties share a rank and are listed by roll number) and `failed_in_any(pass_mark)`. Input: n; for each student roll, name and a line of marks; then the pass mark. Output: `rank roll name total grade` lines, then `Failed:` with names or `None`.

```text
Sample input: 4 / 11 / Asha / 90 85 92 / 12 / Ravi / 70 65 80 / 13 / Meera / 95 88 84 /
              14 / Kiran / 30 75 60 / 35
Sample output:
1 11 Asha 267 A
1 13 Meera 267 A
2 12 Ravi 215 B
3 14 Kiran 165 C
Failed: Kiran
```

**P1.6 · Medium · Code · Hospital queue.** Create class `Patient` (`pid`, `name`, `severity` 1–5, 1 most severe) and class `Hospital` with `admit(patient)` and `next_patient()`. Patients with severity 1 or 2 are emergencies, served most severe first and, for equal severity, in arrival order; others are served in arrival order after all emergencies. Input: q commands, `ADMIT pid name severity` or `NEXT`. For each `NEXT` print `pid name` or `No Patients`; finally print `Waiting: <count>`.

```text
Sample input: 8 / ADMIT P1 Asha 4 / ADMIT P2 Ravi 2 / ADMIT P3 Meera 5 / ADMIT P4 Kiran 1 /
              NEXT / NEXT / NEXT / ADMIT P5 Dev 2
Sample output:
P4 Kiran
P2 Ravi
P1 Asha
Waiting: 2
```

**P1.7 · Medium · Code · Library borrowing records.** Create class `Member` (`member_id`, `name`, a set `borrowed`) and class `Library` with: `borrow(member_id, title)` (returns `False` for an unknown member or title); `borrowed_both(t1, t2)`; `never_borrowed()`; `most_borrowed()` (all titles tied for the highest count). Input: m members (`id name` per line); k titles, one per line (titles may contain spaces); b borrow lines `member_id title`; then two titles. Print `Invalid: id title` for each rejected borrow; then `Both:`, `Never borrowed:` and `Most borrowed:` lines with alphabetical, comma-separated names or `None`.

```text
Sample output (members M1 Asha, M2 Ravi, M3 Meera; titles Python Crash Course, Clean Code,
Deep Learning, SQL Basics; six borrows including one by unknown member M9):
Invalid: M9 SQL Basics
Both: Asha, Ravi
Never borrowed: Deep Learning, SQL Basics
Most borrowed: Clean Code
```

**P1.8 · Hard · Code · Orders and frequently bought pairs.** Create class `Order` (`order_id`, `customer`, `items` list, `prices` list) with `amount()`, and class `Shop` with `revenue_by_customer()` and `frequent_pairs(min_count)`: every unordered pair of distinct items bought in the same order, with the number of orders containing it, keeping pairs with count ≥ `min_count`, sorted by count descending then alphabetically. Input: n; per order a line `order_id customer`, a line of items and a line of prices; then `min_count`. Output: `customer revenue` (2 decimals, highest first); then `item1+item2 count` lines (items alphabetical within a pair) or `No Frequent Pairs`.

```text
Sample input: 4 / O1 Asha / bread butter jam / 40 55 120 / O2 Ravi / bread butter / 40 55 /
              O3 Asha / milk bread butter / 30 40 55 / O4 Meera / jam bread / 120 40 / 2
Sample output:
Asha 340.00
Meera 160.00
Ravi 95.00
bread+butter 3
bread+jam 2
```
