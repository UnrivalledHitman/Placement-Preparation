# How to use this volume
%Programming and algorithms, databases and warehousing, machine learning and AI: 60% of the subject marks

Volume 2 covers the four non-mathematics sections of the GATE DA syllabus. In 2025 and 2026 they carried 14 + 14.5 + 14 + 7 ≈ 50 of the 85 subject marks on average. Chapter numbers continue from Volume 1.

| Section | Chapters | Average marks (2025–26) |
|---|---|---|
| Programming, data structures and algorithms | 8–11 | 14 |
| Databases and warehousing | 12–14 | 14.5 |
| Machine learning | 15–17 | 14 |
| Artificial intelligence | 18–20 | 7 |

**What the papers asked.** Programming questions were mostly *trace the code*: what a recursive function returns, what a stack-based loop outputs, how many swaps insertion sort makes, which vertices a DFS discovers. Database questions mixed SQL output counts, relational algebra, candidate keys, normal forms, B+ tree fan-out and data-cube counting. Machine learning asked for small calculations (a least-squares slope, a naive Bayes posterior, an MLP parameter count, a ridge loss) and concept checks. AI asked about search order, alpha–beta pruning, logical equivalence and exact versus approximate inference.

Every program in this volume was run, and the output printed below it is the real output. In the exam you trace by hand, so read each program, predict its output, then check.

# Chapter 8: Python for GATE
%Names and objects, mutability, default arguments, scope and closures, recursion, and the built-ins that questions rely on

GATE DA uses Python both as the language of code questions and as pseudocode. The traps come from Python's object model, not from syntax.

## 8.1 Names, objects and mutability

A Python variable is a **name bound to an object**. Assignment never copies; it binds another name to the same object.

| Type | Mutable? | Consequence |
|---|---|---|
| int, float, str, tuple, frozenset | No | Operations create new objects |
| list, dict, set | Yes | Changes are visible through every name bound to the object |

```python run Aliasing, copying and the list-multiplication trap
a = [1, 2, 3]
b = a                 # same object
b.append(4)
print('a =', a, '| a is b:', a is b)

c = a[:]              # shallow copy
c.append(5)
print('a =', a, '| c =', c)

grid = [[0] * 3] * 2  # two references to ONE inner list
grid[0][0] = 9
print('grid =', grid)
fixed = [[0] * 3 for _ in range(2)]
fixed[0][0] = 9
print('fixed =', fixed)

s = 'abc'
t = s
t += 'd'              # strings are immutable: t now names a new object
print('s =', s, '| t =', t)
```

**List methods that GATE asks about.** `append(x)` adds one element (even if x is a list); `extend(iterable)` adds each element; `insert(i, x)` puts x before index i; `pop()` removes and returns the last element; `remove(x)` deletes the first occurrence of x; `sort()` sorts in place and returns `None`. Lists have no `update` method; sets and dicts do.

```python run append versus extend, and in-place methods returning None
A, B = [1, 2, 3], [4, 5, 6]
A.extend(B); print('extend:', A)
A, B = [1, 2, 3], [4, 5, 6]
A.append(B); print('append:', A, '| len', len(A))
r = [3, 1, 2].sort()
print('sort() returns', r)
S = {1, 2}; S.update([2, 3]); print('set update:', S)
```

## 8.2 Default arguments and closures

**A default argument is evaluated once**, when the `def` statement runs. A mutable default is therefore shared by every call that does not pass the argument.

**A closure** is an inner function that remembers the variables of its enclosing call. Each call of the outer function creates fresh variables, so two closures made by two calls do not share state.

```python run Shared mutable defaults and independent closures
def add_item(x, bag=[]):
    bag.append(x)
    return bag

print(add_item('a'), add_item('b'), add_item('c', []))

def counter():
    count = [0]
    def tick():
        count[0] += 1
        return count[0]
    return tick

c1, c2 = counter(), counter()
print(c1(), c1(), c2(), c1())
```

The first two calls print the same list object, so both show `['a', 'b']`: `print` evaluates all arguments before printing. The closures `c1` and `c2` each have their own `count`.

## 8.3 Scope

Python resolves names by the **LEGB** rule: Local, Enclosing function, Global, Built-in. Assigning to a name anywhere in a function makes it local to that function for the whole body, unless it is declared `global` or `nonlocal`.

```python run Local, global and nonlocal
x = 10

def f():
    x = 20            # a new local x
    return x

def g():
    global x
    x += 1
    return x

def outer():
    y = 1
    def inner():
        nonlocal y
        y += 1
    inner(); inner()
    return y

print(f(), x, g(), x, outer())

def broken():
    try:
        print(x)      # x is local here because of the assignment below
        x = 5
    except UnboundLocalError as e:
        print('UnboundLocalError:', e)
broken()
```

## 8.4 Integer arithmetic and slicing

| Expression | Value | Note |
|---|---|---|
| `7 // 2`, `-7 // 2` | 3, −4 | Floor division rounds towards −∞ |
| `7 % 3`, `-7 % 3` | 1, 2 | The result takes the sign of the divisor |
| `7 / 2` | 3.5 | `/` always returns a float, even for `4 / 2` (2.0) |
| `2 ** 10` | 1024 | Integers are unbounded |
| `s[1:4]`, `s[::-1]`, `s[-2:]` | Characters 1–3, reversed, last two | Slices never raise `IndexError` |
| `(a - 1) / 2` in a recursion | A float | GATE code sometimes passes floats where integers were intended |

### Worked example: tracing a recursion with float arguments

```python run A recursive multiplier (GATE style)
def f(a, b):
    if a == 0:
        return b
    if a % 2 == 1:
        return 2 * f((a - 1) / 2, b)
    return b + f(a - 1, b)

for a in (1, 2, 3, 6, 7):
    print(f'f({a}, 5) = {f(a, 5)}')
```

The divisions produce floats (3.0, 1.0, …), but `3.0 % 2 == 1` and `0.0 == 0` behave like the integers, so the recursion runs exactly as with integers. Trace f(3, 5): 3 is odd, so 2 × f(1.0, 5); 1.0 is odd, so 2 × f(0.0, 5) = 2 × 5 = 10; total 20. The function does not compute a × b; you have to trace it.

## 8.5 Recursion and call counts

For the naive recursion T(n) = T(n − 1) + T(n − 2), the number of calls C(n) satisfies C(n) = 1 + C(n − 1) + C(n − 2), which grows like the Fibonacci numbers.

```python run Counting calls of a double recursion
calls = 0

def mystery(n):
    global calls
    calls += 1
    if n <= 0:
        return 1
    return mystery(n - 1) + mystery(n - 2)

for n in range(6):
    calls = 0
    v = mystery(n)
    print(f'n = {n}: value {v}, calls {calls}')
```

With base case n ≤ 0, C(0) = 1 and C(−1) = 1, so C(n) = 1 + C(n − 1) + C(n − 2) gives 1, 3, 5, 9, 15, 25 for n = 0 to 5.

## 8.6 Built-ins and idioms

| Idiom | Meaning |
|---|---|
| `sorted(xs, key=f, reverse=True)` | New sorted list; stable |
| `enumerate(xs, start=1)` | Pairs (index, value) |
| `zip(a, b)` | Pairs up to the shorter length |
| `{k: v for ...}`, `{x for ...}` | Dict and set comprehensions |
| `a, b = b, a` | Simultaneous assignment: the right side is evaluated first |
| Set operators: the vertical bar, `&`, `-`, `^` | Union, intersection, difference, symmetric difference |
| `x in d` for a dict | Tests the **keys** |
| `while ... else` / `for ... else` | The `else` runs if the loop ends without `break` |

### Worked example: simultaneous assignment with sets

```python run Sets updated together, traced
A, B, C = {'p', 'q'}, {'q', 'r'}, {'r', 'p'}
rounds = 0
while 'r' in C and rounds < 5:
    rounds += 1
    if 'p' in A:
        A, B, C = A - B, B - C, C - A
    print(rounds, sorted(A), sorted(B), sorted(C))
```

All three right-hand sides use the old A, B and C. After round 1, C = {'r', 'p'} − {'p', 'q'} = {'r'}, which still contains 'r'; A is {'p'}; B is {'q'}. Round 2 gives A = {'p'}, B = {'q'}, C = {'r'} again, so without the round limit the loop would never end.

## 8.7 Traps

| Trap | Correct thinking |
|---|---|
| `b = a` copies a list | It binds a second name to the same list |
| `[[0] * n] * m` | m references to one row; use a comprehension |
| Mutable default arguments | Created once and shared between calls |
| `list.sort()` returns the sorted list | It returns `None` |
| `-7 // 2 == -3` | It is −4 (floor) |
| `x in dict` checks values | It checks keys |
| Expecting closures from separate calls to share state | Each call creates new variables |

# Chapter 9: Data Structures
%Stacks, queues, linked lists, trees and traversals, binary search trees, heaps and hash tables

## 9.1 Stacks and queues

| Structure | Order | Operations (all O(1)) | Uses |
|---|---|---|---|
| Stack | Last in, first out | push, pop, top | Recursion, expression evaluation, DFS, undo |
| Queue | First in, first out | enqueue, dequeue | BFS, scheduling, buffers |
| Deque | Both ends | append and pop at either end | Sliding windows, 0–1 BFS |

Python: a list works as a stack (`append`, `pop`); use `collections.deque` for a queue, since `list.pop(0)` is O(n).

**Stack permutations.** Pushing 1, 2, …, n in order and popping at any time produces exactly the permutations that avoid the pattern 3-1-2; there are Catalan(n) of them (14 for n = 4). For example 3, 1, 2 is impossible: after popping 3, the stack holds 2 above 1, so 2 must come out before 1.

### Worked example: a stack-driven loop

```python run Trace a push-then-pop loop (GATE style)
stack, x, flag, total = [0], 0, 0, 0
while stack:
    if flag == 0:
        x += 1
        stack.append(x)
    if x == 6:
        flag = 1
    if flag == 1:
        x = stack.pop()
        if x % 2 == 1 and stack:
            stack.pop()
        total += x
print('total =', total)
```

The loop pushes 1 to 6, then pops: 6 (even, total 6), 5 (odd, also pops 4; total 11), 3 (odd, pops 2; total 14), 1 (odd, pops 0; total 15). The `and stack` guard matters: without it, the last odd pop would try to pop an empty stack.

## 9.2 Linked lists

| Operation | Singly linked list | Array |
|---|---|---|
| Access the k-th element | O(k) | O(1) |
| Insert or delete at the head | O(1) | O(n) |
| Insert after a known node | O(1) | O(n) |
| Binary search | Not efficient: O(n) to reach the middle | O(log n) when sorted |

Binary search needs O(1) access to the middle element, which is why it is O(log n) only on a **sorted array**, never on a linked list.

## 9.3 Binary trees and traversals

| Traversal | Order | Use |
|---|---|---|
| Pre-order | Node, left, right | Copying a tree, prefix expressions |
| In-order | Left, node, right | Sorted order of a BST |
| Post-order | Left, right, node | Deleting a tree, postfix expressions |
| Level order | Breadth-first, by depth | Shortest paths in unweighted trees |

**Rebuilding a tree.** Pre-order (or post-order) together with in-order determines a binary tree with distinct keys: the first pre-order key is the root, and its position in the in-order sequence splits the left and right subtrees. Pre-order with post-order does not, in general (a single child could be left or right).

| Fact | Value |
|---|---|
| Nodes in a full binary tree of height h (root at height 0) | 2^(h+1) − 1 |
| Minimum height with n nodes | ⌊log₂ n⌋ |
| Leaves L and internal nodes I of a tree where every node has 0 or 2 children | L = I + 1 |
| Distinct binary tree shapes with n nodes | Catalan(n) = C(2n, n)/(n + 1) |

```python run Rebuild a tree from pre-order and in-order, then print post-order
def build(pre, ino):
    if not pre:
        return None
    root = pre[0]
    k = ino.index(root)
    return (root, build(pre[1:k + 1], ino[:k]), build(pre[k + 1:], ino[k + 1:]))

def post(t):
    return [] if t is None else post(t[1]) + post(t[2]) + [t[0]]

def show(t, depth=0):
    if t:
        show(t[2], depth + 1)
        print('    ' * depth + t[0])
        show(t[1], depth + 1)

tree = build(list('ABDECFG'), list('DBEAFCG'))
print('post-order:', ''.join(post(tree)))
show(tree)
```

## 9.4 Binary search trees and heaps

A **binary search tree** keeps smaller keys in the left subtree and larger keys in the right. Search, insert and delete take O(h): O(log n) when balanced, O(n) in the worst case (inserting sorted keys builds a chain).

A **binary heap** is a complete binary tree stored in an array, with every parent ≤ its children (min-heap). Insert and extract-min take O(log n), finding the minimum O(1), and building a heap from n items O(n). For index i (starting at 0), the children are 2i + 1 and 2i + 2 and the parent is ⌊(i − 1)/2⌋.

## 9.5 Hash tables

A hash function maps keys to slots. Collisions are resolved by **chaining** (a list per slot) or **open addressing**: linear probing tries h(k), h(k) + 1, h(k) + 2, … modulo the table size.

| Quantity | Chaining | Linear probing |
|---|---|---|
| Expected search cost with load factor α | O(1 + α) | About (1 + 1/(1 − α))/2 for a successful search |
| Load factor allowed | Can exceed 1 | Must stay below 1 |
| Weakness | Extra memory for lists | Primary clustering |

### Worked example: linear probing

*A table of size 10 uses h(x) = 7x mod 10 with linear probing. Insert 3, 13, 23, 4, 8. Where do 23 and 8 land? (MCQ)*

h(3) = 1; h(13) = 91 mod 10 = 1, taken, so 2; h(23) = 161 mod 10 = 1, then 2 taken, so 3; h(4) = 8; h(8) = 56 mod 10 = 6. So 23 lands at 3 and 8 at 6.

```python run Linear probing, traced
def insert_all(keys, size=10, h=lambda x: 7 * x % 10):
    table = [None] * size
    for k in keys:
        i = h(k)
        while table[i] is not None:
            i = (i + 1) % size
        table[i] = k
    return table

t = insert_all([3, 13, 23, 4, 8])
print(t)
print('23 at', t.index(23), '| 8 at', t.index(8))
```

## 9.6 Traps

| Trap | Correct thinking |
|---|---|
| Binary search on a sorted linked list is O(log n) | Reaching the middle is O(n) |
| Pre-order and post-order fix a binary tree | Only with in-order (or for full binary trees) |
| A BST always gives O(log n) search | Only when balanced; sorted inserts give O(n) |
| Linear probing wraps only once | It keeps probing modulo the size until a free slot |
| A queue from a Python list is efficient | `pop(0)` is O(n); use `deque` |
