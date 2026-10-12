# How to use this guide
%Why a Python edition, how coding rounds are graded, and how to read constraints

This guide teaches the same patterns as the **DSA in Java** guide, written the way strong Python programmers write them. The ideas (two pointers, sliding window, binary search on the answer, BFS, dynamic programming) do not depend on the language; what changes is the toolkit and the traps. Python gives you `dict`, `Counter`, `deque`, `heapq`, `bisect`, `functools.lru_cache` and big integers for free, but it has no balanced tree map, a default recursion limit of about 1,000, a min-heap only, and constant factors several times slower than Java. Knowing both lets you pick the right language for each test.

Every program in this book was run with Python 3.13. Most solutions are checked against a brute-force version on random inputs, and the output shows the check passing.

## How a coding round is graded

Online assessments run your code on hidden test cases with time and memory limits. A solution earns marks only when it is **correct on edge cases** and **fast enough on the largest input**. Interviews add the conversation: clarifying, explaining the approach and its complexity, testing.

## From constraints to complexity

Python executes roughly 10⁷ simple operations per second (C++ and Java manage 10⁸ or more), so the input size tells you which complexity is needed and how careful to be:

| n up to | Target complexity | Typical techniques |
|---|---|---|
| 10–12 | O(n!) or O(2ⁿ · n) | Permutations, bitmask brute force |
| 20–25 | O(2ⁿ) | Subsets, bitmask DP |
| 500 | O(n³) | Interval DP, Floyd–Warshall |
| 5,000 | O(n²) | Two-dimensional DP, all pairs |
| 10⁵–10⁶ | O(n log n) or O(n) | Sorting, heaps, binary search, hashing, two pointers, prefix sums |
| 10⁹ and beyond | O(log n) or O(1) | Binary search on the answer, maths |

> TIP: In Python, an O(n log n) solution with n = 10⁶ is close to the limit. Prefer built-ins (`sort`, `sum`, `Counter`, slicing), which run in C, over hand-written loops where possible.

## How to study this book

Read a chapter, then close the book and write each core program from memory. Then solve the matching part of the practice book. Revise with the Quick Revision book before every test.

# Chapter 1: Complexity and the Python Toolkit
%Counting operations, the cost of every built-in, the Python traps that fail submissions, and fast input and output

## 1.1 Big-O by counting

Big-O describes how the number of operations grows with the input size, ignoring constants. Count loops: a loop over n items is O(n); a loop inside a loop is O(n²); halving the range each step is O(log n).

```python run Counting the operations of four loop shapes
def ops(n):
    linear = sum(1 for _ in range(n))
    quadratic = sum(1 for i in range(n) for j in range(n))
    triangle = sum(1 for i in range(n) for j in range(i + 1, n))       # pairs i < j
    halving, m = 0, n
    while m > 1:
        m //= 2; halving += 1
    return linear, quadratic, triangle, halving

print('   n   linear  quadratic  pairs(i<j)  halving')
for n in (10, 100, 1000):
    print(f'{n:>4} {ops(n)[0]:>8} {ops(n)[1]:>10} {ops(n)[2]:>11} {ops(n)[3]:>8}')
```

Pairs `i < j` are n(n − 1)/2, still O(n²); halving n down to 1 takes about log₂ n steps, so a thousand items need only 9.

## 1.2 The built-ins and their costs

| Operation | Cost | Note |
|---|---|---|
| `lst.append(x)`, `lst.pop()` | O(1) amortised | Use a list as a stack |
| `lst.insert(0, x)`, `lst.pop(0)` | O(n) | Use `collections.deque` for a queue |
| `x in lst`, `lst.index(x)`, `lst.count(x)` | O(n) | Use a `set` or `dict` for membership |
| `lst[i]`, `lst[i] = x` | O(1) | |
| `lst[a:b]` | O(b − a) | Slicing copies |
| `lst.sort()`, `sorted(lst)` | O(n log n) | Timsort, **stable** |
| `x in s`, `s.add(x)`, `d[k]`, `d[k] = v` | O(1) average | Hash tables |
| `deque.append/appendleft/pop/popleft` | O(1) | `deque[i]` in the middle is O(n) |
| `heapq.heappush/heappop` | O(log n) | Min-heap on a list; `heapify` is O(n) |
| `bisect.bisect_left/right` | O(log n) | Search in a sorted list (`insort` is O(n) because of shifting) |
| `s1 + s2` for strings | O(len) | Strings are immutable: build with a list and `''.join` |
| `Counter(iterable)` | O(n) | `most_common(k)` uses a heap |

```python run The toolkit in one place
from collections import Counter, defaultdict, deque
import heapq, bisect
from functools import lru_cache

counts = Counter('mississippi')
print(counts.most_common(2), counts['s'], counts['z'])
graph = defaultdict(list); graph[1].append(2)
print(dict(graph))
q = deque([1, 2, 3]); q.appendleft(0); q.append(4)
print(q.popleft(), q.pop(), list(q))
h = [5, 1, 8, 3]; heapq.heapify(h)
print(heapq.heappop(h), heapq.heappop(h), heapq.nsmallest(2, [9, 4, 7, 1]))
max_heap = [-x for x in [5, 1, 8]]; heapq.heapify(max_heap)
print('max via negation:', -heapq.heappop(max_heap))
arr = [1, 3, 3, 3, 7]
print(bisect.bisect_left(arr, 3), bisect.bisect_right(arr, 3), bisect.bisect_left(arr, 4))

@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)
print(fib(90), fib.cache_info().hits)
```

| Java | Python |
|---|---|
| `ArrayList` | `list` |
| `HashMap`, `HashSet` | `dict`, `set` (insertion-ordered dict since 3.7) |
| `ArrayDeque` | `collections.deque` |
| `PriorityQueue` | `heapq` (min-heap; negate for max; tuples for ties) |
| `TreeMap`, `TreeSet` | No built-in: `bisect` on a sorted list, or `sortedcontainers.SortedList` where allowed |
| `long` overflow | Integers never overflow |
| `Arrays.fill`, 2-D arrays | `[0] * n`, `[[0] * m for _ in range(n)]` |

## 1.3 Python traps that fail submissions

```python run Seven traps, each shown failing and fixed
grid = [[0] * 3] * 3                    # 1. three references to ONE row
grid[0][0] = 1
print('aliased rows:', grid)
grid = [[0] * 3 for _ in range(3)]      #    fix: build each row separately
grid[0][0] = 1
print('separate rows:', grid)

print('2. floor division:', -7 // 2, -7 % 2, '| truncate:', int(-7 / 2))

def add(x, bucket=[]):                  # 3. mutable default shared between calls
    bucket.append(x); return bucket
print('3.', add(1), add(2))

a = [1, 2, 3]; b = a; b.append(4)       # 4. assignment copies the reference
print('4.', a, '| copy:', a[:] is a)

print('5.', 0.1 + 0.2 == 0.3, abs(0.1 + 0.2 - 0.3) < 1e-9)

import sys
def depth(n):
    return 0 if n == 0 else 1 + depth(n - 1)
try:
    depth(5000)
except RecursionError:
    print('6. RecursionError at depth 5000; limit is', sys.getrecursionlimit())
sys.setrecursionlimit(10_000)
print('   after raising the limit:', depth(5000))

funcs = [lambda: i for i in range(3)]   # 7. late binding in closures
print('7.', [f() for f in funcs], '| fixed:', [f() for f in [lambda i=i: i
        for i in range(3)]])
```

| Trap | Fix |
|---|---|
| `[[0] * m] * n` | `[[0] * m for _ in range(n)]` |
| `//` and `%` floor towards −∞ | Use `int(a / b)` or `-(-a // b)` for ceiling; be careful with negative numbers |
| Mutable default arguments | Default to `None` and create inside |
| `b = a` for lists | `a[:]`, `list(a)`, `copy.deepcopy` for nested |
| Float comparison | Compare with a tolerance; use integers or `fractions` when exactness matters |
| Recursion deeper than ~1,000 | `sys.setrecursionlimit`, or convert to an explicit stack |
| `s += c` in a loop | Collect pieces in a list and `''.join` them |
| Closures in loops | Bind with a default argument |

## 1.4 Fast input and output

```python run Reading a large input in one go, and printing with a single write
import io, sys
data = '5\n3 1 4 1 5\n2\n10 20\n'
sys.stdin = io.StringIO(data)
tokens = sys.stdin.read().split()        # all whitespace-separated tokens at once
pos = 0
n = int(tokens[pos]); pos += 1
nums = list(map(int, tokens[pos:pos + n])); pos += n
q = int(tokens[pos]); pos += 1
queries = list(map(int, tokens[pos:pos + q]))
out = [str(x * 2) for x in nums + queries]
sys.stdout.write(' '.join(out) + '\n')   # one write instead of thousands of prints
```

For line-by-line reading use `input = sys.stdin.readline` (remember `.strip()` or `int()`, which ignores the trailing newline). Calling `print` a hundred thousand times can by itself exceed a time limit; collect output and write it once.

## 1.5 Practical lessons

- Count loop nesting and halving to estimate complexity; check it against the constraints table for Python's speed.
- Use `set`/`dict` for membership, `deque` for queues, `heapq` for priorities, `bisect` for sorted searches.
- Avoid the classic traps: aliased rows, floor division of negatives, mutable defaults, recursion limits, string concatenation in loops.
- Read all input at once and write output once for large tests.

# Chapter 2: Arrays, Strings and Hashing
%Prefix sums, hashing for complements and counts, two pointers, sliding windows, Kadane's algorithm and matrix techniques

## 2.1 Prefix sums and difference arrays

A **prefix sum** array `P` with `P[i] = a[0] + ... + a[i-1]` answers any range-sum query in O(1): `sum(a[l:r]) = P[r] - P[l]`. Combined with a hash map it counts subarrays with a given sum in O(n).

```python run Range sums, subarrays summing to k, and a difference array for range updates
from itertools import accumulate
from collections import Counter
import random

a = [3, -1, 4, 1, -5, 9, 2]
P = [0] + list(accumulate(a))
print('sum a[2:5] =', P[5] - P[2], '| check:', sum(a[2:5]))

def count_subarrays(nums, k):
    seen, total, prefix = Counter({0: 1}), 0, 0
    for x in nums:
        prefix += x
        total += seen[prefix - k]          # earlier prefixes that leave exactly k
        seen[prefix] += 1
    return total

def brute(nums, k):
    return sum(sum(nums[i:j]) == k for i in range(len(nums)) for j in range(i + 1, len(nums)
            + 1))

rnd = random.Random(1)
ok = all(count_subarrays(v, 3) == brute(v, 3)
         for v in ([rnd.randint(-3, 5) for _ in range(rnd.randint(0, 12))]
                 for _ in range(300)))
print('subarrays with sum 3 in a:', count_subarrays(a, 3),
        '| matches brute force on 300 tests:', ok)

diff = [0] * 8                              # add v to every index in [l, r]
for l, r, v in [(1, 4, 5), (3, 6, 2), (0, 2, -1)]:
    diff[l] += v; diff[r + 1] -= v
print('after range updates:', list(accumulate(diff))[:7])
```

## 2.2 Hashing: complements and counts

```python run Two-sum in one pass, anagram groups, and first unique character
from collections import Counter, defaultdict

def two_sum(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return seen[target - x], i
        seen[x] = i
    return None

print(two_sum([2, 7, 11, 15], 9), two_sum([3, 3], 6), two_sum([1, 2], 7))
groups = defaultdict(list)
for w in ['eat', 'tea', 'tan', 'ate', 'nat', 'bat']:
    groups[''.join(sorted(w))].append(w)
print(list(groups.values()))
s = 'leetcode'
c = Counter(s)
print('first unique index:', next((i for i, ch in enumerate(s) if c[ch] == 1), -1))
print('is anagram:', Counter('listen') == Counter('silent'))
```

## 2.3 Two pointers

On a **sorted** array, two pointers moving towards each other find pairs in O(n); a slow and a fast pointer compact an array in place.

```python run Pair with a target sum, three-sum without duplicates, and in-place deduplication
def pair_sum_sorted(a, target):
    i, j = 0, len(a) - 1
    while i < j:
        s = a[i] + a[j]
        if s == target:
            return a[i], a[j]
        if s < target:
            i += 1
        else:
            j -= 1
    return None

def three_sum(nums):
    nums, out = sorted(nums), []
    for i in range(len(nums) - 2):
        if i and nums[i] == nums[i - 1]:
            continue                                    # skip duplicate anchors
        lo, hi = i + 1, len(nums) - 1
        while lo < hi:
            s = nums[i] + nums[lo] + nums[hi]
            if s < 0:
                lo += 1
            elif s > 0:
                hi -= 1
            else:
                out.append([nums[i], nums[lo], nums[hi]])
                while lo < hi and nums[lo] == nums[lo + 1]:
                    lo += 1
                lo += 1; hi -= 1
    return out

def dedupe_sorted(a):
    if not a:
        return 0
    k = 1
    for x in a[1:]:
        if x != a[k - 1]:
            a[k] = x; k += 1
    return k

print(pair_sum_sorted([1, 2, 4, 7, 11, 15], 15))
print(three_sum([-1, 0, 1, 2, -1, -4]))
arr = [1, 1, 2, 3, 3, 3, 4]
k = dedupe_sorted(arr)
print(k, arr[:k])
```

## 2.4 Sliding window

A window `[left, right]` expands on the right and shrinks on the left while a condition is violated; each index enters and leaves once, so the whole scan is O(n).

```python run Longest substring without repeats, and the minimum window containing all characters
from collections import Counter

def longest_unique(s):
    last, left, best = {}, 0, 0
    for right, ch in enumerate(s):
        if last.get(ch, -1) >= left:
            left = last[ch] + 1                 # jump past the previous occurrence
        last[ch] = right
        best = max(best, right - left + 1)
    return best

def min_window(s, t):
    need, missing = Counter(t), len(t)
    left, best = 0, (0, float('inf'))
    for right, ch in enumerate(s):
        if need[ch] > 0:
            missing -= 1
        need[ch] -= 1
        while missing == 0:
            if right - left < best[1] - best[0]:
                best = (left, right)
            need[s[left]] += 1
            if need[s[left]] > 0:
                missing += 1
            left += 1
    return '' if best[1] == float('inf') else s[best[0]:best[1] + 1]

for s in ['abcabcbb', 'bbbbb', 'pwwkew', '', 'abba']:
    print(f'{s!r:<11} longest unique run: {longest_unique(s)}')
print(repr(min_window('ADOBECODEBANC', 'ABC')), repr(min_window('a', 'aa')))
```

The `'abba'` case is why the update is `if last[ch] >= left`: the earlier `a` lies outside the current window by the time the second `a` arrives, and must not move `left` backwards.

## 2.5 Kadane's algorithm

```python run Maximum subarray sum and its position, checked against brute force
import random

def kadane(a):
    best, best_range, cur, start = a[0], (0, 0), 0, 0
    for i, x in enumerate(a):
        if cur <= 0:
            cur, start = x, i                    # restart: a negative prefix only hurts
        else:
            cur += x
        if cur > best:
            best, best_range = cur, (start, i)
    return best, best_range

print(kadane([-2, 1, -3, 4, -1, 2, 1, -5, 4]))
print(kadane([-3, -1, -2]))
rnd = random.Random(2)
ok = all(kadane(v)[0] == max(sum(v[i:j + 1]) for i in range(len(v)) for j in range(i,
        len(v)))
         for v in ([rnd.randint(-9, 9) for _ in range(rnd.randint(1, 15))]
                 for _ in range(300)))
print('matches brute force on 300 random arrays:', ok)
```

## 2.6 Matrix techniques

```python run Transpose, rotate 90 degrees, spiral order and a 2-D prefix sum
m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
print('transpose:', [list(r) for r in zip(*m)])
print('rotate clockwise:', [list(r) for r in zip(*m[::-1])])

def spiral(mat):
    out = []
    while mat:
        out += mat.pop(0)                         # top row
        mat = [list(r) for r in zip(*mat)][::-1]  # rotate the rest anticlockwise
    return out
print('spiral:', spiral([row[:] for row in m]))

R, C = len(m), len(m[0])
P = [[0] * (C + 1) for _ in range(R + 1)]
for i in range(R):
    for j in range(C):
        P[i + 1][j + 1] = m[i][j] + P[i][j + 1] + P[i + 1][j] - P[i][j]
r1, c1, r2, c2 = 1, 1, 2, 2                       # inclusive sub-rectangle
print('sum of bottom-right 2x2:', P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1]
        + P[r1][c1])
```

## 2.7 Practical lessons

- Prefix sums give O(1) range sums; prefix sums plus a hash map count subarrays with a target sum.
- Hash maps turn "find the complement" and "count occurrences" problems into one pass.
- Two pointers need sorted data or a monotonic condition; skip duplicates explicitly.
- Sliding windows move each pointer at most n times: O(n).
- Kadane restarts whenever the running sum stops helping; `zip(*m)` transposes a matrix.
