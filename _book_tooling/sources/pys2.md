## Part 3 solutions

### D3.1 Balanced parentheses

```python run Backtracking with two counters
from itertools import product

def generate(n):
    out = []
    def go(path, opens, closes):
        if len(path) == 2 * n:
            out.append(''.join(path))
            return
        if opens < n:
            path.append('(')
            go(path, opens + 1, closes)
            path.pop()
        if closes < opens:
            path.append(')')
            go(path, opens, closes + 1)
            path.pop()
    go([], 0, 0)
    return out

def balanced(s):
    depth = 0
    for ch in s:
        depth += 1 if ch == '(' else -1
        if depth < 0:
            return False
    return depth == 0

print(generate(3))
for n in range(1, 8):
    brute = sorted(''.join(p) for p in product('()', repeat=2 * n) if balanced(''.join(p)))
    assert generate(n) == brute
print('counts for n = 1..7:', [len(generate(n)) for n in range(1, 8)])
```

The two rules prune every invalid prefix, so the work is proportional to the output: the Catalan numbers 1, 2, 5, 14, 42, 132 and 429. The output already comes out in sorted order because `(` is tried before `)` and `'(' < ')'` in ASCII, so the comparison with the sorted brute force passes without sorting.

### D3.2 Phone keypad words

```python run itertools.product, and the same with backtracking
from itertools import product

KEYS = {'2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl', '6': 'mno', '7': 'pqrs',
        '8': 'tuv', '9': 'wxyz'}

def letters(digits):
    if not digits:
        return []
    return [''.join(p) for p in product(*(KEYS[d] for d in digits))]

def letters_bt(digits):
    out = []
    def go(i, path):
        if i == len(digits):
            out.append(path)
            return
        for ch in KEYS[digits[i]]:
            go(i + 1, path + ch)
    if digits:
        go(0, '')
    return out

print(letters('23'))
print(len(letters('79')), letters(''), letters('234') == letters_bt('234'))
```

`product` yields tuples in lexicographic order of its inputs, so the result is already sorted. Watch the empty input: `product()` with no iterables yields one empty tuple, which would give `['']`, hence the explicit check. With 7 and 9 (four letters each) there are 16 words. In an interview, show the backtracking version too, since it is the pattern behind every "generate all" question.

### D3.3 Palindrome partitioning

```python run Backtracking over palindromic prefixes, with a precomputed table
def partitions(s):
    n = len(s)
    pal = [[False] * n for _ in range(n)]
    for i in range(n - 1, -1, -1):
        for j in range(i, n):
            pal[i][j] = s[i] == s[j] and (j - i < 2 or pal[i + 1][j - 1])
    out = []
    def go(start, path):
        if start == n:
            out.append(path[:])
            return
        for end in range(start, n):
            if pal[start][end]:
                path.append(s[start:end + 1])
                go(end + 1, path)
                path.pop()
    go(0, [])
    return out

for s in ('aab', 'racecar', 'abc'):
    res = partitions(s)
    print(s, len(res), res[-2:])
```

The table answers "is `s[i..j]` a palindrome?" in O(1) after O(n²) preparation, a DP used inside backtracking. `path[:]` copies the list; appending `path` itself would leave every result pointing at the same (finally empty) list.

### D3.4 Zigzag level order

```python run BFS by levels, reversing alternate levels
from collections import deque
from pytree import build

def zigzag(root):
    out, q, flip = [], deque([root] if root else []), False
    while q:
        level = []
        for _ in range(len(q)):
            node = q.popleft()
            level.append(node.val)
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)
        out.append(level[::-1] if flip else level)
        flip = not flip
    return out

print(zigzag(build([3, 9, 20, None, None, 15, 7])))
print(zigzag(build([1, 2, 3, 4, 5, 6, 7, 8, 9])))
print(zigzag(build([])))
```

`for _ in range(len(q))` fixes the level size before the loop adds children, which is the whole trick of level-order BFS. Reversing a finished level costs O(width), so the total stays O(n).

### D3.5 LCA in a binary tree

```python run Post-order search, checked against ancestor sets
import random
from pytree import build

def lca(root, p, q):
    if root is None or root.val in (p, q):
        return root
    left, right = lca(root.left, p, q), lca(root.right, p, q)
    if left and right:
        return root
    return left or right

def path_to(root, target, path):
    if root is None:
        return False
    path.append(root.val)
    if root.val == target or path_to(root.left, target, path) or \
            path_to(root.right, target, path):
        return True
    path.pop()
    return False

def brute(root, p, q):
    a, b = [], []
    path_to(root, p, a)
    path_to(root, q, b)
    common = [x for x, y in zip(a, b) if x == y]
    return common[-1]

root = build([3, 5, 1, 6, 2, 0, 8, None, None, 7, 4])
print(lca(root, 5, 1).val, lca(root, 5, 4).val, lca(root, 7, 8).val)
for _ in range(300):
    n = random.randint(1, 15)
    vals = random.sample(range(100), n)
    t = build(vals)
    p, q = random.choice(vals), random.choice(vals)
    assert lca(t, p, q).val == brute(t, p, q)
print('300 random trees match the root-path method')
```

If p is an ancestor of q, the search stops at p and returns it, which is correct (5 is the LCA of 5 and 4). The function assumes both nodes exist; if one might be missing, count how many were found and check the count at the end.

### D3.6 Downward paths with sum k

```python run Prefix-sum counter, undone when leaving a node
import random
from collections import Counter
from pytree import build

def path_sum(root, k):
    seen = Counter({0: 1})
    def go(node, total):
        if node is None:
            return 0
        total += node.val
        found = seen[total - k]
        seen[total] += 1
        found += go(node.left, total) + go(node.right, total)
        seen[total] -= 1
        return found
    return go(root, 0)

def brute(root, k):
    def starting_at(node, need):
        if node is None:
            return 0
        need -= node.val
        return (need == 0) + starting_at(node.left, need) + starting_at(node.right, need)
    if root is None:
        return 0
    return starting_at(root, k) + brute(root.left, k) + brute(root.right, k)

root = build([10, 5, -3, 3, 2, None, 11, 3, -2, None, 1])
print(path_sum(root, 8), path_sum(build([1, -1, 1, -1]), 0))
for _ in range(300):
    t = build([random.randint(-3, 3) for _ in range(random.randint(0, 15))])
    k = random.randint(-3, 3)
    assert path_sum(t, k) == brute(t, k)
print('300 random trees match brute force')
```

This is Chapter 2's "subarray sum equals k" on every root-to-node path. The `seen[total] -= 1` on the way back stops a prefix from one branch being matched by a node in another branch. The brute force is O(n²) in the worst case; the counter version is O(n).

## Part 4 solutions

### D4.1 Task scheduler

```python run The formula, checked by a greedy heap simulation
import heapq, random
from collections import Counter

def least_interval(tasks, n):
    counts = Counter(tasks).values()
    top = max(counts)
    ties = sum(1 for c in counts if c == top)
    return max(len(tasks), (top - 1) * (n + 1) + ties)

def simulate(tasks, n):
    heap = [-c for c in Counter(tasks).values()]
    heapq.heapify(heap)
    time = 0
    while heap:
        done = []
        for _ in range(n + 1):
            if heap:
                c = heapq.heappop(heap) + 1
                if c:
                    done.append(c)
            time += 1
            if not heap and not done:
                break
        for c in done:
            heapq.heappush(heap, c)
    return time

print(least_interval('AAABBB', 2), least_interval('AAABBB', 0),
      least_interval('AAAAAABCDEFG', 2))
for _ in range(500):
    tasks = ''.join(random.choice('ABCD') for _ in range(random.randint(1, 12)))
    n = random.randint(0, 4)
    assert least_interval(tasks, n) == simulate(tasks, n), (tasks, n)
print('500 random cases match the simulation')
```

The most frequent task forces `top − 1` full frames of length n + 1, plus a final frame holding every task tied for the maximum. If there are enough other tasks to fill all the gaps, no idle slot is needed and the answer is simply `len(tasks)`, hence the `max`. The simulation runs the most frequent remaining tasks in each frame, the greedy the formula summarises.

### D4.2 Top k frequent words

```python run Sort by a tuple key, or a heap for large inputs
import heapq
from collections import Counter

def top_k(words, k):
    count = Counter(words)
    return sorted(count, key=lambda w: (-count[w], w))[:k]

def top_k_heap(words, k):
    count = Counter(words)
    return heapq.nsmallest(k, count, key=lambda w: (-count[w], w))

words = 'the day is sunny the the the sunny is is'.split()
print(top_k(words, 4), top_k_heap(words, 4))
print(top_k(['b', 'a', 'c', 'b', 'a'], 2))
print(Counter(['b', 'a', 'c', 'b', 'a']).most_common(2))
```

The key `(-count, word)` sorts by frequency descending, then alphabetically. `most_common` is **not** a safe shortcut here: it breaks ties by first appearance, giving `('b', 2)` before `('a', 2)` in the last line. `nsmallest` is O(m log k) for m distinct words, which helps when k is small.

### D4.3 Redundant connection

```python run Union–find with path halving and union by size
class DSU:
    def __init__(self, n):
        self.parent = list(range(n + 1))
        self.size = [1] * (n + 1)

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        if self.size[ra] < self.size[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra
        self.size[ra] += self.size[rb]
        return True

def redundant(edges):
    dsu = DSU(len(edges))
    for a, b in edges:
        if not dsu.union(a, b):
            return [a, b]

print(redundant([[1, 2], [1, 3], [2, 3]]))
print(redundant([[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]))
```

A tree on n nodes plus one edge has exactly n edges, so `len(edges)` is n. The first edge whose ends are already connected closes the cycle. Because edges are processed in input order, that edge is also the last cycle edge in the input, which is what the question asks for.

### D4.4 Word ladder

```python run BFS with wildcard buckets
from collections import defaultdict, deque

def ladder(begin, end, words):
    words = set(words)
    if end not in words:
        return 0
    buckets = defaultdict(list)
    for w in words | {begin}:
        for i in range(len(w)):
            buckets[w[:i] + '*' + w[i + 1:]].append(w)
    dist = {begin: 1}
    q = deque([begin])
    while q:
        w = q.popleft()
        if w == end:
            return dist[w]
        for i in range(len(w)):
            for nxt in buckets[w[:i] + '*' + w[i + 1:]]:
                if nxt not in dist:
                    dist[nxt] = dist[w] + 1
                    q.append(nxt)
    return 0

D = ['hot', 'dot', 'dog', 'lot', 'log', 'cog']
print(ladder('hit', 'cog', D), ladder('hit', 'cog', D[:-1]), ladder('hot', 'hot', D))
```

The buckets connect words that differ in one position (`h*t` holds hit and hot) without comparing every pair, which would cost O(N² · L). BFS gives the shortest sequence because every step costs the same. The count includes both ends, so `hit → hot → dot → dog → cog` is 5.

### D4.5 Cheapest flight with at most k stops

```python run Bellman–Ford limited to k + 1 edges, checked by DFS
import random

def cheapest(n, flights, src, dst, k):
    INF = float('inf')
    dist = [INF] * n
    dist[src] = 0
    for _ in range(k + 1):
        new = dist[:]
        for u, v, w in flights:
            if dist[u] + w < new[v]:
                new[v] = dist[u] + w
        dist = new
    return -1 if dist[dst] == INF else dist[dst]

def brute(n, flights, src, dst, k):
    best = float('inf')
    def go(u, cost, edges):
        nonlocal best
        if u == dst:
            best = min(best, cost)
        if edges == k + 1:
            return
        for a, b, w in flights:
            if a == u:
                go(b, cost + w, edges + 1)
    go(src, 0, 0)
    return -1 if best == float('inf') else best

F = [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]]
print(cheapest(4, F, 0, 3, 1), cheapest(4, F, 0, 3, 2), cheapest(4, F, 3, 0, 5))
for _ in range(300):
    n = random.randint(2, 5)
    fl = [[random.randrange(n), random.randrange(n), random.randint(1, 9)]
          for _ in range(random.randint(0, 8))]
    fl = [f for f in fl if f[0] != f[1]]
    s, d, k = random.randrange(n), random.randrange(n), random.randint(0, 3)
    assert cheapest(n, fl, s, d, k) == brute(n, fl, s, d, k)
print('300 random graphs match exhaustive search')
```

k stops means at most k + 1 flights, so we relax k + 1 times. Copying `dist` each round is essential. Updating in place would let one round chain several flights and break the stop limit. With one stop allowed the answer is 700 (0→1→3); with two stops it is 400 (0→1→2→3). Plain Dijkstra is wrong here because the cheapest route to a city may use too many stops.

### D4.6 Bipartite check

```python run BFS two-colouring of every component
from collections import deque

def bipartite(n, edges):
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)
    colour = [-1] * n
    for start in range(n):
        if colour[start] != -1:
            continue
        colour[start] = 0
        q = deque([start])
        while q:
            u = q.popleft()
            for v in adj[u]:
                if colour[v] == -1:
                    colour[v] = 1 - colour[u]
                    q.append(v)
                elif colour[v] == colour[u]:
                    return False, None
    return True, colour

print(bipartite(4, [(0, 1), (1, 2), (2, 3), (3, 0)]))
print(bipartite(3, [(0, 1), (1, 2), (2, 0)]))
print(bipartite(5, [(0, 1), (3, 4)]))
```

A graph is bipartite exactly when it has no odd cycle: the square passes, the triangle fails. The outer loop over `start` matters for disconnected graphs. Without it, node 3 and node 4 of the last graph would never be coloured.
