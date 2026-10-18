# How to use the practice sets
%360 original questions in GATE format on programming, databases, machine learning and AI, tiered Easy, Medium and Hard

This volume follows the same plan as Volume 1: every set has 8 Easy, 9 Medium and 7 Hard questions, answers and worked solutions are in the second half of the book, and every answer is computed by a program shown with the solutions (code questions are run exactly as printed).

Each set has 9 MCQs, 7 MSQs and 8 NATs, close to the exam's mix. MSQs have one, two or three correct options. When a question shows code, the code appears directly after the question; treat its output as what the question asks about.

| Set | Topic | Guide chapter |
|---|---|---|
| D1 | Python | 8 |
| D2 | Data structures | 9 |
| D3 | Searching and sorting | 10 |
| D4 | Graphs | 11 |
| B1 | Relational model, keys, algebra and calculus | 12 |
| B2 | SQL | 12 |
| B3 | Normalisation and indexing | 13 |
| B4 | Warehousing and data transformation | 14 |
| M1 | Regression, bias–variance, validation and metrics | 15 |
| M2 | Classifiers | 15 |
| M3 | Neural networks | 16 |
| M4 | Clustering and PCA | 17 |
| A1 | Search | 18 |
| A2 | Logic | 19 |
| A3 | Reasoning under uncertainty | 20 |

# Programming, data structures and algorithms

## Set D1: Python

### Easy

**D1.E1** · MCQ · 1 mark. After `x = [1, 2, 3]; y = x; y += [4]`, what is `len(x)`? (A) 3 (B) 4 (C) 1 (D) An error is raised

**D1.E2** · NAT · 1 mark. What does `print(17 // 5 + 17 % 5 * 2)` print?

**D1.E3** · MCQ · 1 mark. Which expression produces a new list with the elements of list `a` in reverse order? (A) `a.reverse()` (B) `reversed(a)` (C) `a[::-1]` (D) `a.sort(reverse=True)`

**D1.E4** · NAT · 1 mark. For `s = 'datascience'`, what is `len(s[2:8])`?

**D1.E5** · MSQ · 1 mark. Which of these built-in types are mutable? (A) tuple (B) dict (C) list (D) str

**D1.E6** · NAT · 1 mark. What does `print(sum(i for i in range(1, 11) if i % 3 == 0))` print?

**D1.E7** · MCQ · 1 mark. For `d = {'a': 1, 'b': 2}`, what does `print('b' in d, 2 in d)` print? (A) True True (B) False False (C) False True (D) True False

**D1.E8** · MSQ · 1 mark. Which expressions evaluate to True? (A) `-7 // 2 == -4` (B) `7 / 7 == 1` (C) `[1] * 3 == [3]` (D) `3 * '2' == '6'`

### Medium

**D1.M1** · NAT · 2 marks. What does the following program print?

```python
def f(n):
    if n <= 1:
        return n
    return f(n - 1) + 2 * f(n - 2)
print(f(6))
```

**D1.M2** · MCQ · 2 marks. What does the following program print? (A) 1 4 9 (B) 1 5 9 (C) 1 5 14 (D) 1 4 13

```python
def g(x, acc=[]):
    acc.append(x * x)
    return sum(acc)
print(g(1), g(2), g(3, []))
```

**D1.M3** · MSQ · 2 marks. After the following code runs, which statements are correct? (A) `r3 == 12` (B) `r3 == 4` (C) `a` and `b` share the variable `total` (D) `r2 == 8`

```python
def make():
    total = 0
    def add(v):
        nonlocal total
        total += v
        return total
    return add
a, b = make(), make()
r1 = a(5); r2 = a(3); r3 = b(4)
```

**D1.M4** · NAT · 2 marks. What does the following program print?

```python
L = [3, 1, 4, 1, 5, 9, 2, 6]
print(sum(L[1::3]) + L[-2])
```

**D1.M5** · MCQ · 2 marks. What does the following program print? (A) 55 (B) An error is raised (C) 51 (D) 15

```python
x = 5
def h():
    x = 1
    def k():
        return x * 10
    return k()
print(h() + x)
```

**D1.M6** · NAT · 2 marks. What does the following program print?

```python
count = 0
for i in range(5):
    for j in range(i, 5):
        if (i + j) % 2 == 0:
            count += 1
print(count)
```

**D1.M7** · MSQ · 2 marks. For `A = {1, 2, 3, 4}` and `B = {3, 4, 5}`, which expressions are True? (A) `A ^ B == {1, 2, 5}` (B) `A - B == {1, 2}` (C) `A & B == {3, 4, 5}` (D) `len(A | B) == 7`

**D1.M8** · MCQ · 2 marks. What does `print([x * y for x in range(3) for y in range(x)])` print? (A) [0, 0, 0, 2] (B) [0, 1, 2] (C) [0, 2] (D) [0, 0, 2]

**D1.M9** · MSQ · 2 marks. After the following code runs, which statements are correct? (A) `r == ['a', 'dd', 'bb', 'ccc']` (B) `words == ['dd', 'ccc', 'bb', 'a']` (C) `sorted` changed `words` (D) `r == ['a', 'bb', 'dd', 'ccc']`

```python
words = ['bb', 'a', 'ccc', 'dd']
r = sorted(words, key=len)
words.sort(key=lambda w: w[-1], reverse=True)
```

### Hard

**D1.H1** · NAT · 2 marks. How many calls to `f` (including the first) are made to evaluate `f(2, 13)`?

```python
def f(a, b):
    if b == 0:
        return 1
    if b % 2 == 0:
        h = f(a, b // 2)
        return h * h
    return a * f(a, b - 1)
```

**D1.H2** · MCQ · 2 marks. What does the following program print? (A) An error is raised (B) [2, 3] [3, 2, 3] [2, 3, 3, 2, 3] (C) [2, 3] [3, 2, 3] [2, 3, 3] (D) [2, 3] [3, 1] [1, 2]

```python
A, B, C = [1], [2], [3]
A, B, C = B + C, C + A, A + B
print(A, B, C)
```

**D1.H3** · NAT · 2 marks. How many times does the `while` loop call `fun`?

```python
def fun(L, i=0):
    if i >= len(L) - 1:
        return 0
    if L[i] > L[i + 1]:
        L[i], L[i + 1] = L[i + 1], L[i]
        return 1 + fun(L, i + 1)
    return fun(L, i + 1)

data = [4, 2, 5, 1, 3]
while fun(data) > 0:
    pass
```

**D1.H4** · MSQ · 2 marks. After the following code runs, which statements are correct? (A) `c == [1, 2, 3, 4]` (B) `a == 1` (C) `b == [1, 2, 3, 4]` (D) `c == []`

```python
it = iter([1, 2, 3, 4])
a = next(it)
b = list(it)
c = list(it)
```

**D1.H5** · MCQ · 2 marks. What does the following program print? (A) [0, 1, 4] (B) [4, 4, 4] (C) [0, 0, 0] (D) [1, 4, 9]

```python
def outer():
    fs = []
    for i in range(3):
        fs.append(lambda: i * i)
    return [f() for f in fs]
print(outer())
```

**D1.H6** · NAT · 2 marks. What does the following program print?

```python
x = 0
for i in range(1, 6):
    for j in range(1, 6):
        if j > i:
            break
        x += j
    else:
        x += 100
print(x)
```

**D1.H7** · MSQ · 2 marks. After the following code runs, which statements are correct? (A) `len(d) == 7` (B) `e[1] == [1, 4, 7]` (C) `e[0] == [0, 3, 6]` (D) `len(e) == 7`

```python
d = {k: k % 3 for k in range(7)}
e = {}
for k, v in d.items():
    e.setdefault(v, []).append(k)
```

## Set D2: Data structures

### Easy

**D2.E1** · MCQ · 1 mark. On an empty stack: push 1, push 2, push 3, pop, push 4, pop, pop. Which element remains? (A) 1 (B) 2 (C) 3 (D) 4

**D2.E2** · NAT · 1 mark. On an empty queue: enqueue 5, 7 and 9, dequeue, enqueue 11, dequeue. Which value is now at the front?

**D2.E3** · MCQ · 1 mark. The in-order traversal of a binary search tree lists its keys (A) in insertion order (B) level by level (C) in descending order (D) in ascending order

**D2.E4** · NAT · 1 mark. What is the maximum number of nodes in a binary tree of height 4, where a single node has height 0?

**D2.E5** · MSQ · 1 mark. A singly linked list keeps only a head pointer. Which operations take O(1) time? (A) Delete the head (B) Access the k-th element (C) Insert at the tail (D) Insert at the head

**D2.E6** · NAT · 1 mark. A binary heap is stored in an array starting at index 0. What is the index of the parent of the node at index 10?

**D2.E7** · MCQ · 1 mark. Breadth-first search keeps its frontier in a (A) queue (B) stack (C) priority queue ordered by depth, largest first (D) hash table

**D2.E8** · MSQ · 1 mark. A hash table of size 7 uses h(k) = k mod 7 with linear probing. Keys 10, 17, 24 and 3 are inserted in that order. Which statements are correct? (A) 3 is stored at index 6 (B) 17 is stored at index 4 (C) 3 is stored at index 3 (D) 24 is stored at index 5

### Medium

**D2.M1** · NAT · 2 marks. How many structurally different binary trees have exactly 4 nodes?

**D2.M2** · MCQ · 2 marks. A binary tree has pre-order A B D E C F and in-order D B E A F C. Its post-order is (A) D E B C F A (B) D B E F C A (C) E D B F C A (D) D E B F C A

**D2.M3** · MSQ · 2 marks. The numbers 1, 2, 3, 4 are pushed onto a stack in this order, with pops allowed at any time. Which output sequences are possible? (A) 1, 4, 2, 3 (B) 3, 1, 4, 2 (C) 4, 3, 2, 1 (D) 2, 1, 4, 3

**D2.M4** · NAT · 2 marks. The keys 50, 30, 70, 20, 40, 60, 80, 35 are inserted in that order into an empty binary search tree. What is its height (the number of edges on the longest root-to-leaf path)?

**D2.M5** · MCQ · 2 marks. The min-heap [2, 5, 3, 9, 6, 4] (array form) undergoes one extract-min. The resulting array is (A) [4, 5, 3, 9, 6] (B) [3, 4, 5, 9, 6] (C) [3, 5, 4, 9, 6] (D) [3, 5, 9, 4, 6]

**D2.M6** · NAT · 2 marks. In a binary tree, every node has 0 or 2 children, and there are 15 internal nodes. How many leaves are there?

**D2.M7** · MSQ · 2 marks. Which time bounds are correct? (A) Search in a balanced BST: O(log n) (B) Search in an arbitrary BST: O(n) in the worst case (C) Finding the maximum in a min-heap: O(1) (D) Building a binary heap from n items needs Θ(n log n) time

**D2.M8** · MCQ · 2 marks. The postfix expression 6 2 3 + * 4 − evaluates to (A) 26 (B) 14 (C) 20 (D) 30

**D2.M9** · NAT · 2 marks. A hash table with chaining has 10 buckets and holds 25 keys. What is its load factor? (Round off to one decimal place)

### Hard

**D2.H1** · NAT · 2 marks. The numbers 1, 2, 3, 4, 5 are pushed onto a stack in order, with pops allowed at any time. How many different output sequences are possible?

**D2.H2** · MCQ · 2 marks. A binary search tree has pre-order 8 5 2 6 12 10 15. Its post-order is (A) 2 6 5 10 15 12 8 (B) 2 5 6 8 10 12 15 (C) 6 2 5 15 10 12 8 (D) 2 6 5 12 10 15 8

**D2.H3** · MSQ · 2 marks. A binary tree in which every node has 0 or 2 children has n leaves (n ≥ 2). Which statements are always true? (A) It has n − 1 internal nodes (B) Its height is at most log₂ n (C) It has 2n edges (D) It has 2n + 1 nodes in total

**D2.H4** · NAT · 2 marks. A table of size 11 uses h(k) = k mod 11 with linear probing. Keys 22, 33, 44, 12 are inserted, then 23. How many slots are examined while inserting 23 (including the slot where it is placed)?

**D2.H5** · MCQ · 2 marks. How many different binary search trees can hold the keys 1, 2 and 3? (A) 5 (B) 3 (C) 1 (D) 6

**D2.H6** · NAT · 2 marks. A min-heap holds 7 distinct keys in an array (indices 0 to 6). In how many different index positions could the largest key be?

**D2.H7** · MSQ · 2 marks. A queue is implemented with two stacks: enqueue pushes onto the in-stack; dequeue pops from the out-stack, first moving all elements from the in-stack if the out-stack is empty. Which statements are correct? (A) Each element moves from the in-stack to the out-stack at least twice (B) The amortised cost per operation is O(1) (C) Enqueue takes Θ(n) time in the worst case (D) A single dequeue can take Θ(n) time

## Set D3: Searching and sorting

### Easy

**D3.E1** · MCQ · 1 mark. Binary search runs in O(log n) time on (A) an unsorted array (B) a sorted linked list (C) a sorted array (D) any list

**D3.E2** · NAT · 1 mark. How many comparisons does selection sort make on 8 elements?

**D3.E3** · MCQ · 1 mark. The best-case running time of insertion sort is (A) O(n log n) (B) O(n) (C) O(n²) (D) O(log n)

**D3.E4** · NAT · 1 mark. How many inversions does [3, 1, 2] contain?

**D3.E5** · MSQ · 1 mark. Which sorting algorithms, in their standard forms, are stable? (A) Selection sort (B) Merge sort (C) Bubble sort (D) Heap sort

**D3.E6** · NAT · 1 mark. A binary search makes one three-way comparison per step. What is the worst-case number of comparisons for an unsuccessful search in a sorted array of 63 elements?

**D3.E7** · MCQ · 1 mark. The worst-case running time of merge sort is (A) O(n log n) (B) O(n) (C) O(n²) (D) O(log n)

**D3.E8** · NAT · 1 mark. What is the worst-case number of comparisons made by linear search on 50 elements?

### Medium

**D3.M1** · NAT · 2 marks. How many swaps does insertion sort make on [4, 3, 1, 2]?

**D3.M2** · MCQ · 2 marks. Quicksort always uses the first element as the pivot and is run on an already sorted array. Its running time satisfies (A) T(n) = T(n − 1) + Θ(n) (B) T(n) = 2T(n/2) + Θ(n) (C) T(n) = T(n/2) + Θ(1) (D) T(n) = 2T(n − 1) + Θ(1)

**D3.M3** · MSQ · 2 marks. Bubble sort (ascending, adjacent swaps, full passes) is run on [5, 1, 4, 2, 8]. Which statements are correct? (A) Pass 2 makes 2 swaps (B) After pass 1 the largest element is last (C) Pass 1 makes 4 swaps (D) After pass 2 the array is sorted

**D3.M4** · NAT · 2 marks. What is the maximum number of comparisons needed to merge sorted lists of 7 and 9 elements?

**D3.M5** · MCQ · 2 marks. The solution of T(n) = 4T(n/2) + n² is (A) Θ(n²) (B) Θ(n² log n) (C) Θ(n³) (D) Θ(n log n)

**D3.M6** · NAT · 2 marks. Insertion sort compares the new element with the elements to its left, moving left until it finds a smaller element or reaches the front. How many comparisons does it make on [2, 1, 3, 4]?

**D3.M7** · MSQ · 2 marks. An array holds n ≥ 3 equal elements. Which statements are correct? (A) Quicksort with first-element pivots that sends elements ≥ the pivot to the right takes Θ(n²) time (B) Insertion sort runs in O(n) time (C) Bubble sort with an early-exit flag makes n(n − 1)/2 comparisons (D) Selection sort makes n(n − 1)/2 comparisons

**D3.M8** · MCQ · 2 marks. The minimum number of comparisons that always suffices to find both the maximum and the minimum of 100 elements is (A) 198 (B) 150 (C) 148 (D) 100

**D3.M9** · NAT · 2 marks. Selection sort swaps only when the minimum is not already in place. How many swaps does it make on [3, 1, 2]?

### Hard

**D3.H1** · NAT · 2 marks. Binary search with mid = ⌊(lo + hi)/2⌋ looks for the element at index 0 of a sorted array of 15 elements (indices 0 to 14). How many elements does it compare against the target?

**D3.H2** · MCQ · 2 marks. The best known worst-case time for finding the median of n unsorted numbers is (A) O(log n) (B) O(n log n) (C) O(n) (D) O(n²)

**D3.H3** · NAT · 2 marks. How many inversions does [6, 5, 4, 3, 2, 1, 7] contain?

**D3.H4** · MSQ · 2 marks. Insertion sort is applied to [2, 4, 6, 8, 10, x, 12], with x different from the other values, and makes exactly 3 swaps. Which values of x are possible? (A) 7 (B) 5 (C) 3 (D) 4.5

**D3.H5** · MCQ · 2 marks. The worst-case number of comparisons made by top-down merge sort on 8 elements is (A) 12 (B) 24 (C) 28 (D) 17

**D3.H6** · NAT · 2 marks. Quicksort with the first element as pivot (each partition compares every other element with the pivot once) is run on [1, 2, …, 10]. How many comparisons does it make?

**D3.H7** · MSQ · 2 marks. Which solutions are correct? (A) T(n) = 2T(n/2) + 1 gives Θ(n) (B) T(n) = T(n − 1) + 1 gives Θ(n) (C) T(n) = T(n/2) + 1 gives Θ(log n) (D) T(n) = 2T(n − 1) + 1 gives Θ(n²)
