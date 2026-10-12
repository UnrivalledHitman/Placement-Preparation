# Chapter 7: Heaps and Hash Tables
%The binary heap behind heapq, top-k, merging sorted sequences, the running median, and how Python's dict works

## 7.1 The binary heap

A binary heap is a complete binary tree stored in a list: the children of index i are at 2i + 1 and 2i + 2, and every parent is ≤ its children (min-heap). Push and pop cost O(log n); building a heap from n items costs O(n). Python's `heapq` operates on a plain list.

```python run heapq operations, a max-heap by negation, and tuples for priorities with ties
import heapq

h = []
for x in [5, 3, 8, 1, 9, 2]:
    heapq.heappush(h, x)
print('heap list:', h, '| smallest:', h[0])
print('pops in order:', [heapq.heappop(h) for _ in range(len(h))])

nums = [5, 3, 8, 1, 9, 2]
mx = [-x for x in nums]; heapq.heapify(mx)
print('max-heap pops:', [-heapq.heappop(mx) for _ in range(3)])

tasks = []
for priority, order, name in [(2, 0, 'email'), (1, 1, 'deploy'), (2, 2, 'report'), (1, 3,
        'fix')]:
    heapq.heappush(tasks, (priority, order, name))        # order breaks ties
print('task order:', [heapq.heappop(tasks)[2] for _ in range(len(tasks))])
print('pushpop:', heapq.heappushpop([3, 5, 7], 4), '| replace:', heapq.heapreplace([3, 5,
        7], 4))
```

The list `[1, 3, 2, 5, 9, 8]` is a valid heap but not sorted: only `h[0]` is guaranteed to be the minimum. Put a unique counter in priority tuples so that equal priorities never fall through to comparing payloads that cannot be compared.

## 7.2 Top-k with a heap of size k

```python run k largest with a min-heap of size k, k most frequent, and k closest points
import heapq, random
from collections import Counter

def k_largest(stream, k):
    h = []
    for x in stream:
        if len(h) < k:
            heapq.heappush(h, x)
        elif x > h[0]:
            heapq.heapreplace(h, x)                # drop the smallest of the current top k
    return sorted(h, reverse=True)

rnd = random.Random(5)
data = [rnd.randint(1, 10**6) for _ in range(10_000)]
print(k_largest(data, 5), heapq.nlargest(5, data) == k_largest(data, 5))
words = 'the cat and the hat and the bat'.split()
print(Counter(words).most_common(2), heapq.nlargest(2, Counter(words).items(),
        key=lambda kv: kv[1]))
points = [(1, 3), (-2, 2), (5, 8), (0, 1)]
print(heapq.nsmallest(2, points, key=lambda p: p[0] ** 2 + p[1] ** 2))
```

A heap of size k keeps memory at O(k) and time at O(n log k), which suits streams. `heapq.nlargest(k, it, key=...)` does the same; for k close to n, sorting is simpler.

## 7.3 Merging sorted sequences

```python run Merge k sorted lists with a heap, and heapq.merge for lazy merging
import heapq

def merge_k(lists):
    h = [(lst[0], i, 0) for i, lst in enumerate(lists) if lst]
    heapq.heapify(h)
    out = []
    while h:
        val, i, j = heapq.heappop(h)
        out.append(val)
        if j + 1 < len(lists[i]):
            heapq.heappush(h, (lists[i][j + 1], i, j + 1))
    return out

lists = [[1, 4, 7], [2, 5, 8, 11], [], [0, 9]]
print(merge_k(lists), list(heapq.merge(*lists)) == merge_k(lists))
```

The heap always holds at most one candidate per list, so merging N total items from k lists costs O(N log k). The same idea finds the k-th smallest in a sorted matrix and the smallest range covering k lists.

## 7.4 Two heaps: the running median

```python run Median of a stream with a max-heap for the lower half and a min-heap for the upper half
import heapq, random, statistics

class RunningMedian:
    def __init__(self):
        self.low, self.high = [], []              # low: max-heap (negated); high: min-heap

    def add(self, x):
        heapq.heappush(self.low, -x)
        heapq.heappush(self.high, -heapq.heappop(self.low))   # move the largest low to high
        if len(self.high) > len(self.low):
            heapq.heappush(self.low, -heapq.heappop(self.high))

    def median(self):
        if len(self.low) > len(self.high):
            return -self.low[0]
        return (-self.low[0] + self.high[0]) / 2

rm, seen = RunningMedian(), []
rnd = random.Random(6)
ok = True
for _ in range(500):
    x = rnd.randint(-50, 50)
    rm.add(x); seen.append(x)
    ok &= rm.median() == statistics.median(seen)
print('first medians:', end=' ')
rm2 = RunningMedian()
for x in [5, 15, 1, 3]:
    rm2.add(x); print(rm2.median(), end=' ')
print('\nmatches statistics.median after each of 500 insertions:', ok)
```

## 7.5 Inside a hash map

A hash table stores keys in an array of slots chosen by `hash(key) % capacity`, resolving collisions by chaining or probing, and resizes when it gets too full, so operations are O(1) on average. Python's `dict` uses open addressing, keeps **insertion order**, and randomises string hashes per process (so set iteration order of strings can differ between runs; never rely on it).

```python run A tiny open-addressing hash map, and the rules for using your own objects as keys
class ProbingMap:
    def __init__(self, capacity=8):
        self.keys, self.vals, self.size = [None] * capacity, [None] * capacity, 0

    def _slot(self, key):
        i = hash(key) % len(self.keys)
        while self.keys[i] is not None and self.keys[i] != key:
            i = (i + 1) % len(self.keys)          # linear probing
        return i

    def put(self, key, val):
        if (self.size + 1) * 3 > len(self.keys) * 2:   # keep load factor below 2/3
            old = [(k, v) for k, v in zip(self.keys, self.vals) if k is not None]
            self.__init__(len(self.keys) * 2)
            for k, v in old:
                self.put(k, v)
        i = self._slot(key)
        if self.keys[i] is None:
            self.size += 1
        self.keys[i], self.vals[i] = key, val

    def get(self, key, default=None):
        i = self._slot(key)
        return self.vals[i] if self.keys[i] is not None else default

m = ProbingMap()
for k in range(20):
    m.put(k, k * k)
print(m.get(7), m.get(19), m.get(99, 'missing'), 'capacity', len(m.keys), 'size', m.size)

class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __eq__(self, other):
        return (self.x, self.y) == (other.x, other.y)
    def __hash__(self):
        return hash((self.x, self.y))             # equal objects must have equal hashes

print({Point(1, 2): 'A'}[Point(1, 2)], len({Point(1, 2), Point(1, 2)}))
try:
    {[1, 2]: 'x'}
except TypeError as e:
    print('TypeError:', e)
```

| Rule | Consequence |
|---|---|
| Keys must be hashable (immutable): numbers, strings, tuples of hashables, frozensets | Lists and dicts cannot be keys; convert to tuples |
| Define `__eq__` and `__hash__` together, consistently | Otherwise equal objects land in different slots |
| A class that defines `__eq__` without `__hash__` becomes unhashable | Python sets `__hash__ = None` |
| Never mutate a key's fields after insertion | It becomes unfindable |
| Worst case O(n) per operation | Many collisions; rare with good hashes |

## 7.6 Practical lessons

- `heapq` is a min-heap on a list; negate for max; use `(priority, counter, item)` tuples.
- Top-k: heap of size k in O(n log k); `nlargest`/`nsmallest` with `key`.
- k-way merge keeps one candidate per list in a heap; `heapq.merge` is lazy.
- Running median: two balanced heaps.
- Dict keys must be hashable; define `__eq__` and `__hash__` consistently; never depend on set order of strings.

# Chapter 8: Graphs
%Adjacency lists, BFS and DFS, connected components and cycles, topological order, weighted shortest paths, union–find and minimum spanning trees

## 8.1 Representing a graph

| Representation | Space | Edge lookup | Use |
|---|---|---|---|
| Adjacency list `defaultdict(list)` | O(V + E) | O(degree) | Almost always |
| Adjacency matrix `[[0] * V for _ in range(V)]` | O(V²) | O(1) | Dense graphs, Floyd–Warshall |
| Edge list `[(u, v, w), ...]` | O(E) | O(E) | Kruskal, Bellman–Ford |
| Implicit grid | none | O(1) | Neighbours computed from (r, c) |

## 8.2 Breadth-first search

BFS explores in layers, so the first time it reaches a node is along a path with the fewest edges: shortest paths in unweighted graphs.

```python run Shortest path in a grid with path reconstruction, and multi-source BFS
from collections import deque

grid = ['S.#.....',
        '.##.###.',
        '....#...',
        '.##...#G']
R, C = len(grid), len(grid[0])
start = next((r, c) for r in range(R) for c in range(C) if grid[r][c] == 'S')
goal = next((r, c) for r in range(R) for c in range(C) if grid[r][c] == 'G')

def bfs(start):
    parent, q = {start: None}, deque([start])
    while q:
        r, c = q.popleft()
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < R and 0 <= nc < C and grid[nr][nc] != '#' and (nr,
                    nc) not in parent:
                parent[(nr, nc)] = (r, c)
                q.append((nr, nc))
    return parent

parent = bfs(start)
path, node = [], goal
while node:
    path.append(node); node = parent[node]
print('steps:', len(path) - 1, '| path:', path[::-1][:6], '...')

def rotting(cells):                            # all rotten cells start together
    q = deque((r, c, 0) for r, row in enumerate(cells) for c, v in enumerate(row) if v == 2)
    fresh = sum(row.count(1) for row in cells)
    minutes = 0
    while q:
        r, c, t = q.popleft()
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < len(cells) and 0 <= nc < len(cells[0]) and cells[nr][nc] == 1:
                cells[nr][nc] = 2; fresh -= 1; minutes = t + 1
                q.append((nr, nc, t + 1))
    return minutes if fresh == 0 else -1

print('rotting oranges:', rotting([[2, 1, 1], [1, 1, 0], [0, 1, 1]]),
      rotting([[2, 1, 1], [0, 1, 1], [1, 0, 1]]))
```

Mark nodes visited **when they are enqueued**, not when they are dequeued; otherwise the same node is queued many times. Multi-source BFS starts with all sources in the queue at distance 0.

## 8.3 Depth-first search, components and cycles

```python run Counting islands iteratively, and detecting a cycle in a directed graph with colours
from collections import defaultdict

def islands(grid):
    grid = [list(r) for r in grid]
    count = 0
    for r in range(len(grid)):
        for c in range(len(grid[0])):
            if grid[r][c] == '1':
                count += 1
                stack = [(r, c)]                # iterative DFS avoids the recursion limit
                while stack:
                    i, j = stack.pop()
                    if 0 <= i < len(grid) and 0 <= j < len(grid[0]) and grid[i][j] == '1':
                        grid[i][j] = '0'
                        stack += [(i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)]
    return count

def has_cycle(n, edges):
    g = defaultdict(list)
    for u, v in edges:
        g[u].append(v)
    WHITE, GREY, BLACK = 0, 1, 2                # unvisited, on the current path, finished
    colour = [WHITE] * n
    def dfs(u):
        colour[u] = GREY
        for v in g[u]:
            if colour[v] == GREY or (colour[v] == WHITE and dfs(v)):
                return True                     # an edge back to the current path
        colour[u] = BLACK
        return False
    return any(colour[u] == WHITE and dfs(u) for u in range(n))

print(islands(['11000', '11000', '00100', '00011']))
print(has_cycle(4, [(0, 1), (1, 2), (2, 3)]), has_cycle(4, [(0, 1), (1, 2), (2, 0), (2,
        3)]))
```

In an **undirected** graph, a cycle exists if DFS reaches an already-visited node that is not the parent it came from (or, simpler, if union–find finds both ends of an edge already connected; section 8.6).

## 8.4 Topological sort

```python run Kahn's algorithm: course order, or detection that no order exists
from collections import deque, defaultdict

def topo_order(n, prereqs):
    g, indeg = defaultdict(list), [0] * n
    for course, pre in prereqs:
        g[pre].append(course); indeg[course] += 1
    q = deque(i for i in range(n) if indeg[i] == 0)
    order = []
    while q:
        u = q.popleft(); order.append(u)
        for v in g[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    return order if len(order) == n else []      # leftover nodes lie on a cycle

print(topo_order(4, [(1, 0), (2, 0), (3, 1), (3, 2)]))
print(topo_order(2, [(0, 1), (1, 0)]))
```

## 8.5 Shortest paths with weights

```python run Dijkstra with a heap, and Bellman-Ford handling a negative edge
import heapq
from collections import defaultdict

def dijkstra(n, edges, src):
    g = defaultdict(list)
    for u, v, w in edges:
        g[u].append((v, w))
    dist = [float('inf')] * n
    dist[src], h = 0, [(0, src)]
    while h:
        d, u = heapq.heappop(h)
        if d > dist[u]:
            continue                              # stale heap entry
        for v, w in g[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                heapq.heappush(h, (dist[v], v))
    return dist

def bellman_ford(n, edges, src):
    dist = [float('inf')] * n
    dist[src] = 0
    for _ in range(n - 1):
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
    negative_cycle = any(dist[u] + w < dist[v] for u, v, w in edges)
    return dist, negative_cycle

edges = [(0, 1, 4), (0, 2, 1), (2, 1, 2), (1, 3, 1), (2, 3, 5)]
print('Dijkstra:', dijkstra(4, edges, 0))
def dijkstra_settled(n, edges, src):            # textbook version: a popped node is final
    g = defaultdict(list)
    for u, v, w in edges:
        g[u].append((v, w))
    dist, done, h = [float('inf')] * n, set(), [(0, src)]
    dist[src] = 0
    while h:
        d, u = heapq.heappop(h)
        if u in done:
            continue
        done.add(u)
        for v, w in g[u]:
            if v not in done and d + w < dist[v]:
                dist[v] = d + w
                heapq.heappush(h, (dist[v], v))
    return dist

neg = [(0, 1, 4), (0, 2, 5), (2, 1, -3), (1, 3, 2)]
print('Bellman-Ford with a negative edge:', bellman_ford(4, neg, 0))
print('settled-node Dijkstra (wrong):    ', dijkstra_settled(4, neg, 0))
print('re-checking Dijkstra:             ', dijkstra(4, neg, 0))
```

Dijkstra's correctness rests on non-negative weights: when a node is popped with the smallest distance, no later path can be shorter. With the −3 edge that fails. The textbook version settles node 1 at distance 4 and node 3 at 6, then finds the cheaper route to node 1 (5 − 3 = 2) too late: it reports 4 and 6 instead of 2 and 4. The re-checking version from above happens to get this graph right, because it pushes a node again whenever its distance improves, but on other graphs with negative edges that re-checking can take exponential time; it is no longer Dijkstra's guarantee. Use Bellman–Ford (or SPFA) for negative weights; for 0/1 weights a deque-based BFS is fastest.

## 8.6 Union–find (disjoint set union)

```python run Union by size with path compression: components, cycle detection and Kruskal's MST
class DSU:
    def __init__(self, n):
        self.parent, self.size = list(range(n)), [1] * n

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]   # path halving
            x = self.parent[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False                                   # already connected
        if self.size[ra] < self.size[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra; self.size[ra] += self.size[rb]
        return True

d = DSU(6)
for a, b in [(0, 1), (1, 2), (3, 4)]:
    d.union(a, b)
print('components:', len({d.find(i) for i in range(6)}), '| 0 and 2 connected:',
        d.find(0) == d.find(2))
triangle = DSU(3)
print('edge closing a cycle:', next(e for e in [(0, 1), (1, 2), (2, 0)]
        if not triangle.union(*e)))

def kruskal(n, edges):
    dsu, total, used = DSU(n), 0, []
    for w, u, v in sorted(edges):
        if dsu.union(u, v):
            total += w; used.append((u, v, w))
    return total, used

print('MST:', kruskal(4, [(1, 0, 1), (4, 0, 2), (3, 1, 2), (2, 1, 3), (5, 2, 3)]))
```

With union by size and path compression, each operation is effectively constant time (inverse Ackermann). Kruskal sorts edges by weight and adds each one that joins two different components: a minimum spanning tree in O(E log E).

## 8.7 Choosing the graph algorithm

| Problem | Algorithm | Complexity |
|---|---|---|
| Shortest path, unweighted | BFS | O(V + E) |
| Shortest path, 0/1 weights | 0-1 BFS with a deque | O(V + E) |
| Shortest path, non-negative weights | Dijkstra with a heap | O((V + E) log V) |
| Shortest path, negative weights | Bellman–Ford | O(V · E) |
| All pairs, small V | Floyd–Warshall | O(V³) |
| Connected components, flood fill | DFS/BFS or union–find | O(V + E) |
| Ordering with dependencies | Topological sort (Kahn or DFS) | O(V + E) |
| Cycle in a directed graph | DFS colours or Kahn leftovers | O(V + E) |
| Minimum spanning tree | Kruskal (DSU) or Prim (heap) | O(E log E) |
| Bipartite check | BFS/DFS two-colouring | O(V + E) |

## 8.8 Practical lessons

- Adjacency lists with `defaultdict(list)`; grids as implicit graphs.
- BFS for fewest edges (mark on enqueue); iterative DFS to avoid recursion limits.
- Topological order with Kahn's algorithm; leftover nodes mean a cycle.
- Dijkstra needs non-negative weights; skip stale heap entries; Bellman–Ford for negative edges.
- Union–find with path compression and union by size; Kruskal for minimum spanning trees.
