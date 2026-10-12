# Hints for the coding problems
%Read only the hint for the problem you are stuck on

| Problem | Hint |
|---|---|
| P1.1 | Compare `e.dept.lower() == dept.lower()`; keep totals and counts in two dictionaries; `max(..., key=...)` returns the first maximum |
| P1.2 | `sorted(low, key=lambda i: (i.qty, i.name))`; `defaultdict(float)` for values; format with `f'{v:.2f}'` |
| P1.3 | Override `withdraw` in each subclass and call it the same way for all accounts; call `super().__init__` in `Current` |
| P1.4 | `title, genre, director, rating, year = input().split(',')`, then `strip()` each; key `(-rating, title)`; `Counter.most_common()` |
| P1.5 | Sort by `(-total, roll)`; increase the rank only when the total changes; `@dataclass` with `field(default_factory=list)` |
| P1.6 | A `deque` for normal patients and a `heapq` of `(severity, arrival_number, patient)` for emergencies |
| P1.7 | `input().split(' ', 1)` keeps a title with spaces together; `{t1, t2} <= member.borrowed`; set difference for never borrowed |
| P1.8 | `itertools.combinations(sorted(set(items)), 2)` gives each pair once; count with a `Counter` |
