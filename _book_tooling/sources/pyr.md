# Python toolkit and traps
%The standard library you reach for in every coding round, and the mistakes that cost marks

## Input size to complexity

Python runs roughly 10⁷ simple operations per second, about ten times fewer than Java or C++.

| n up to | Target complexity | Typical techniques |
|---|---|---|
| 12 | O(n!) | Permutations, brute force |
| 20–25 | O(2ⁿ) or O(2ⁿ · n) | Subsets, bitmask DP |
| 500 | O(n³) | Floyd–Warshall, interval DP |
| 5,000 | O(n²) | Two nested loops, 2-D DP |
| 10⁵–10⁶ | O(n log n) or O(n) | Sorting, heaps, binary search, two pointers, prefix sums |
| 10⁹ and more | O(log n) or O(√n) | Binary search on the answer, maths, fast power |

## The standard library

| Need | Use | Cost |
|---|---|---|
| Stack | `list.append`, `list.pop()` | O(1) |
| Queue, deque | `collections.deque`: `append`, `popleft`, `appendleft` | O(1) |
| Counting | `collections.Counter(items)`, `most_common(k)` | O(n) |
| Grouping | `collections.defaultdict(list)` | O(1) per item |
| Min-heap | `heapq.heappush`, `heappop`, `heapify`, `nsmallest(k, xs, key=…)` | O(log n) |
| Max-heap | Push `-x`, or `(-priority, item)` tuples | O(log n) |
| Sorted search | `bisect_left`, `bisect_right`, `insort` | O(log n) search |
| Memoisation | `@functools.lru_cache(None)` or `@functools.cache` | — |
| Combinatorics | `itertools.permutations`, `combinations`, `product`, `accumulate` | — |
| Custom comparator | `sorted(xs, key=functools.cmp_to_key(cmp))` | O(n log n) |
| Big numbers, GCD | `pow(a, b, mod)`, `math.gcd`, `math.comb`, `math.isqrt` | — |
| Infinity | `float('inf')`, `math.inf` | — |

## Traps that cost marks

| Trap | Wrong | Right |
|---|---|---|
| Shared rows | `[[0] * m] * n` | `[[0] * m for _ in range(n)]` |
| Floor division | `-7 // 2` is −4, not −3 | `int(a / b)` truncates (exact only for small values) |
| Modulo sign | `-7 % 3` is 2 | Fine for array indices; differs from Java |
| Mutable default | `def f(x, acc=[])` | `acc=None`, then `if acc is None: acc = []` |
| In-place sort | `xs = xs.sort()` sets xs to `None` | `xs.sort()` or `xs = sorted(xs)` |
| Queue with a list | `xs.pop(0)` is O(n) | `deque.popleft()` |
| String building | `s += piece` in a loop | `''.join(pieces)` |
| Recursion depth | Default limit is 1,000 | `sys.setrecursionlimit(10**6)` or an explicit stack |
| Slow input | `input()` for 10⁵ lines | `sys.stdin.readline` or `sys.stdin.read().split()` |
| Copying | `b = a` aliases the list | `a[:]`, `list(a)`, `copy.deepcopy` for nesting |
| Counter keys | Keys with count 0 remain | `del c[k]` when the count reaches 0 |
| Heap order | `heapq` is a min-heap only | Negate values for a max-heap |
| Ties in `most_common` | Ties keep insertion order | `sorted(c, key=lambda w: (-c[w], w))` |

# Pattern templates

## Arrays and hashing

```python run Two pointers, sliding window, prefix sums, and a sum-k counter
from collections import Counter

def two_sum_sorted(a, target):
    i, j = 0, len(a) - 1
    while i < j:
        s = a[i] + a[j]
        if s == target:
            return i, j
        i, j = (i + 1, j) if s < target else (i, j - 1)
    return None

def longest_no_repeat(s):
    last, left, best = {}, 0, 0
    for right, ch in enumerate(s):
        if last.get(ch, -1) >= left:
            left = last[ch] + 1
        last[ch] = right
        best = max(best, right - left + 1)
    return best

def count_sum_k(nums, k):
    seen, total, count = Counter({0: 1}), 0, 0
    for x in nums:
        total += x
        count += seen[total - k]
        seen[total] += 1
    return count

print(two_sum_sorted([1, 3, 4, 6, 9], 10), longest_no_repeat('abcabcbb'),
      count_sum_k([1, 1, 1], 2), count_sum_k([3, 4, 7, 2, -3, 1, 4, 2], 7))
```

| Signal | Pattern |
|---|---|
| Sorted array, pair or triple with a target | Two pointers |
| Longest or shortest contiguous window with a condition | Sliding window (positive values only) |
| Subarray sum equals k, values may be negative | Prefix sum plus a hash map |
| Range sums, many queries, no updates | Prefix sum array |
| Group by a signature (anagrams) | `defaultdict(list)` keyed by `tuple(sorted(w))` |

## Binary search

```python run First true, and binary search on the answer
from bisect import bisect_left

def first_true(lo, hi, ok):
    while lo < hi:
        mid = (lo + hi) // 2
        if ok(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo

a = [2, 4, 4, 4, 8, 9]
print(first_true(0, len(a), lambda i: a[i] >= 4), bisect_left(a, 4))
weights, days = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5

def ships(cap):
    trips, load = 1, 0
    for w in weights:
        if load + w > cap:
            trips, load = trips + 1, 0
        load += w
    return trips <= days

print('least ship capacity:', first_true(max(weights), sum(weights), ships))
```

Use `hi = len(a)` (one past the end) so "not found" is a valid answer. For answers, set `lo` to the smallest possible value and `hi` to one that surely works. The predicate must be false…false, true…true.

## Stacks, queues and linked lists

| Problem | Tool |
|---|---|
| Next greater or smaller element, histogram area, stock span | Monotonic stack of indices |
| Sliding window maximum | Monotonic `deque` of indices |
| Valid brackets, expression evaluation | Stack |
| Cycle detection, middle node | Slow and fast pointers |
| Reverse a linked list | `prev, cur = None, head`, then `cur.next, prev, cur = prev, cur, cur.next` |
| Merge k sorted lists | Heap of `(value, list index, node)` |

```python run Monotonic stack and deque
from collections import deque

def next_greater(a):
    out, stack = [-1] * len(a), []
    for i, x in enumerate(a):
        while stack and a[stack[-1]] < x:
            out[stack.pop()] = x
        stack.append(i)
    return out

def window_max(a, k):
    dq, out = deque(), []
    for i, x in enumerate(a):
        while dq and a[dq[-1]] <= x:
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()
        if i >= k - 1:
            out.append(a[dq[0]])
    return out

print(next_greater([2, 1, 2, 4, 3]), window_max([1, 3, -1, -3, 5, 3, 6, 7], 3))
```

## Backtracking

```python run Subsets, permutations and combination sum
def subsets(nums):
    out = []
    def go(i, path):
        if i == len(nums):
            out.append(path[:])
            return
        go(i + 1, path)
        path.append(nums[i])
        go(i + 1, path)
        path.pop()
    go(0, [])
    return out

def permutations(nums):
    out = []
    def go(path, used):
        if len(path) == len(nums):
            out.append(path[:])
            return
        for i, x in enumerate(nums):
            if not used[i]:
                used[i] = True
                path.append(x)
                go(path, used)
                path.pop()
                used[i] = False
    go([], [False] * len(nums))
    return out

def combination_sum(cands, target):
    out = []
    def go(start, left, path):
        if left == 0:
            out.append(path[:])
            return
        for i in range(start, len(cands)):
            if cands[i] <= left:
                path.append(cands[i])
                go(i, left - cands[i], path)
                path.pop()
    go(0, target, [])
    return out

print(len(subsets([1, 2, 3])), len(permutations([1, 2, 3])), combination_sum([2, 3, 6, 7], 7))
```

Choose, recurse, un-choose. Append `path[:]`, never `path`. For duplicates in the input, sort first and skip `nums[i] == nums[i − 1]` when `i > start`.

## Trees

| Task | Template |
|---|---|
| Height, diameter, balanced | Post-order: compute children first, return a value up |
| Level order, right view, zigzag | BFS with `for _ in range(len(q))` |
| Validate a BST | Pass `(low, high)` bounds down |
| k-th smallest in a BST | In-order traversal, count visits |
| LCA in a binary tree | Return the node if it is p or q; both sides non-empty means LCA |
| LCA in a BST | Go left if both smaller, right if both larger, else here |
| Serialize | Pre-order with `None` markers |

## Heaps

| Problem | Approach |
|---|---|
| k largest elements | Min-heap of size k, or `heapq.nlargest(k, xs)` |
| k-th largest in a stream | Min-heap of size k; the top is the answer |
| Median of a stream | Max-heap (negated) for the low half, min-heap for the high half |
| Merge k sorted lists | Heap of the current heads |
| Scheduling by deadline or cost | Sort, then a heap of the best choices so far |

# Graphs

```python run BFS, Dijkstra, topological sort and union–find
import heapq
from collections import deque

def bfs(adj, src):
    dist = {src: 0}
    q = deque([src])
    while q:
        u = q.popleft()
        for v in adj[u]:
            if v not in dist:
                dist[v] = dist[u] + 1
                q.append(v)
    return dist

def dijkstra(adj, src):
    dist = {src: 0}
    pq = [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue
        for v, w in adj[u]:
            if d + w < dist.get(v, float('inf')):
                dist[v] = d + w
                heapq.heappush(pq, (d + w, v))
    return dist

def topo(n, edges):
    adj, indeg = [[] for _ in range(n)], [0] * n
    for a, b in edges:
        adj[a].append(b)
        indeg[b] += 1
    q = deque(i for i in range(n) if indeg[i] == 0)
    order = []
    while q:
        u = q.popleft()
        order.append(u)
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    return order if len(order) == n else None

parent = list(range(6))
def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x

print(bfs({0: [1, 2], 1: [3], 2: [3], 3: []}, 0))
print(dijkstra({0: [(1, 4), (2, 1)], 1: [(3, 1)], 2: [(1, 2), (3, 5)], 3: []}, 0))
print(topo(4, [(0, 1), (0, 2), (1, 3), (2, 3)]), topo(2, [(0, 1), (1, 0)]))
for a, b in [(0, 1), (2, 3), (1, 3)]:
    parent[find(a)] = find(b)
print('0 and 2 connected:', find(0) == find(2), '| 4 and 5:', find(4) == find(5))
```

| Graph problem | Algorithm | Complexity |
|---|---|---|
| Shortest path, unweighted | BFS | O(V + E) |
| Shortest path, weights 0 or 1 | 0–1 BFS with a deque | O(V + E) |
| Shortest path, non-negative weights | Dijkstra with `heapq` | O((V + E) log V) |
| Negative weights, or at most k edges | Bellman–Ford (copy the array per round) | O(V · E) |
| All pairs, V ≤ 400 | Floyd–Warshall | O(V³) |
| Order with dependencies, cycle check | Kahn's topological sort | O(V + E) |
| Dynamic connectivity, redundant edge | Union–find | about O(1) each |
| Minimum spanning tree | Kruskal (sort and DSU) or Prim (heap) | O(E log E) |
| Grid problems | BFS/DFS with `for dr, dc in ((1,0),(-1,0),(0,1),(0,-1))` | O(rows · cols) |
| Two-colouring | BFS colouring | O(V + E) |

# Dynamic programming

Steps: define the state in words, write the transition, set the base cases, choose the order, then shrink memory if a row only depends on the previous one.

```python run Coin change, LIS, LCS and 0/1 knapsack
from bisect import bisect_left

def coin_change(coins, amount):
    dp = [0] + [float('inf')] * amount
    for x in range(1, amount + 1):
        for c in coins:
            if c <= x:
                dp[x] = min(dp[x], dp[x - c] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1

def lis(nums):
    tails = []
    for x in nums:
        i = bisect_left(tails, x)
        tails[i:i + 1] = [x]
    return len(tails)

def lcs(a, b):
    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            dp[i][j] = dp[i-1][j-1] + 1 if a[i-1] == b[j-1] else max(dp[i-1][j], dp[i][j-1])
    return dp[-1][-1]

def knapsack(items, cap):
    dp = [0] * (cap + 1)
    for w, v in items:
        for c in range(cap, w - 1, -1):
            dp[c] = max(dp[c], dp[c - w] + v)
    return dp[cap]

print(coin_change([1, 2, 5], 11), coin_change([2], 3), lis([10, 9, 2, 5, 3, 7, 101, 18]),
      lcs('abcde', 'ace'), knapsack([(1, 1), (3, 4), (4, 5), (5, 7)], 7))
```

| Family | State | Example problems |
|---|---|---|
| Linear | dp[i] using a few previous values | Stairs, house robber, decode ways |
| Knapsack | dp[capacity], backwards for 0/1, forwards for unlimited | Subset sum, coin change, partition |
| Two strings | dp[i][j] over prefixes | LCS, edit distance, regex matching |
| Grid | dp[r][c] from top and left | Unique paths, minimum path sum |
| Intervals | dp[i][j] over a range, split at k | Burst balloons, matrix chain, palindromes |
| Bitmask | dp[mask][last] | Travelling salesman, assignment (n ≤ 20) |
| State machine | A few states per day | Stock with cooldown or fee |

# Greedy, bits, structures and final checks

## Greedy, bits and number theory

| Greedy problem | Rule |
|---|---|
| Maximum non-overlapping intervals | Sort by end, take if start ≥ last end |
| Merge intervals | Sort by start, extend the last merged interval |
| Jump game | Track the furthest reachable index |
| Gas station | Reset the start after a negative running tank |
| Meeting rooms needed | Sort starts and ends, or a heap of end times |

| Bit trick | Meaning |
|---|---|
| `x & (x - 1)` | Clears the lowest set bit; equals 0 for powers of two |
| `x & -x` | Lowest set bit (used by Fenwick trees) |
| `a ^ a == 0` | XOR of all values finds the single unpaired one |
| `bin(x).count('1')` or `x.bit_count()` | Number of set bits |
| `mask >> i & 1` | Is item i in the subset? |

| Number theory | Python |
|---|---|
| GCD and LCM | `math.gcd(a, b)`, `math.lcm(a, b)` |
| Fast power mod m | `pow(a, b, m)` |
| Modular inverse (m prime) | `pow(a, -1, m)` or `pow(a, m - 2, m)` |
| Primes up to n | Sieve of Eratosthenes, O(n log log n) |
| nCr mod p | Precomputed factorials and inverse factorials |

## Advanced structures

| Structure | Operations | Use for |
|---|---|---|
| Trie (nested dicts) | Insert, search, prefix in O(length) | Autocomplete, word search, XOR maximum |
| Fenwick tree | Point update, prefix sum in O(log n) | Inversions, count smaller after self |
| Segment tree | Range query and point update in O(log n) | Range minimum, range sum with updates |
| Prefix function (KMP) | O(n + m) pattern search | Pattern matching, smallest period |
| Rolling hash | O(1) window hash | Repeated substrings, Rabin–Karp |

## Bug checklist before you submit

| Check | Example |
|---|---|
| Empty input, single element | `[]`, `[x]`, `''` |
| All equal, all negative, zeros | Duplicates in binary search; product with 0 |
| Off-by-one at the boundaries | `range(n - 1)` versus `range(n)`; `hi = len(a)` |
| Overflow does not exist, but time does | Big integers are slow; use `% MOD` as you go |
| Recursion depth | Chain-shaped trees and deep DFS |
| Mutating while iterating | Modifying a dict or list inside its own loop |
| Returning a reference | `out.append(path)` instead of `path[:]` |
| Visited marking | Mark when pushing in BFS, not when popping |
