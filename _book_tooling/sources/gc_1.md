# Chapter 10: Searching and Sorting
%Linear and binary search, selection, bubble and insertion sort, merge sort and quicksort, and counting comparisons and swaps

GATE asks for exact counts: comparisons in a binary search, swaps in insertion sort, comparisons in bubble sort. Learn the standard versions precisely, since a different version gives a different count.

## 10.1 Searching

**Linear search** examines elements one by one: n comparisons in the worst case, on any array or list.

**Binary search** halves a sorted array each step. If every step compares the target with the middle element (one three-way comparison per step), an unsuccessful search on n elements makes ⌊log₂ n⌋ + 1 comparisons in the worst case, as does the worst successful search.

```python run Worst-case comparisons of binary search, measured
def binary_search(a, x):
    lo, hi, comps = 0, len(a) - 1, 0
    while lo <= hi:
        mid = (lo + hi) // 2
        comps += 1                       # one three-way comparison with a[mid]
        if a[mid] == x:
            return mid, comps
        if a[mid] < x:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1, comps

import math
for n in (7, 8, 100, 500, 1000, 1024):
    a = list(range(0, 2 * n, 2))         # even numbers; odd targets are absent
    worst = max(binary_search(a, x)[1] for x in range(-1, 2 * n + 1, 2))
    print(f'n = {n:4}: worst unsuccessful {worst}, floor(log2 n) + 1 = '
            f'{math.floor(math.log2(n)) + 1}')
```

## 10.2 The simple sorts

| Algorithm | Idea | Comparisons | Swaps | Stable? | Best case |
|---|---|---|---|---|---|
| Selection sort | Find the minimum of the rest, swap it into place | Always n(n − 1)/2 | At most n − 1 | No | Θ(n²) |
| Bubble sort | Swap adjacent out-of-order pairs; repeat passes | n(n − 1)/2 without early exit | = number of inversions | Yes | Θ(n) with an early-exit flag |
| Insertion sort | Insert each element into the sorted prefix | Between n − 1 and n(n − 1)/2 | = number of inversions (adjacent shifts) | Yes | Θ(n) on sorted input |

An **inversion** is a pair i < j with a[i] > a[j]. Bubble and insertion sort both fix exactly one inversion per adjacent swap, so their swap counts equal the number of inversions.

**Counting comparisons in insertion sort.** Inserting element i compares it with the elements to its left until a smaller one is found (or the start is reached). So element i costs (number of larger elements to its left) + 1 comparisons, except when it moves all the way to the front, where the final "+1" is missing.

### Worked example: comparisons and swaps on a nearly sorted array

*Sort [1, 2, 3, 5, 4] in ascending order. Count the comparisons made by bubble sort (n − 1 passes, no early exit) and by insertion sort, and the swaps of each. (MSQ-style)*

Bubble sort without early exit always makes 4 + 3 + 2 + 1 = 10 comparisons. Insertion sort compares 2 with 1, 3 with 2, 5 with 3, then 4 with 5 (swap) and 4 with 3 (stop): 1 + 1 + 1 + 2 = 5 comparisons. There is one inversion (5, 4), so each makes exactly one swap. With an early-exit flag, bubble sort stops after its second pass: 4 + 3 = 7 comparisons.

```python run Instrumented sorts
def bubble(a, early_exit=False):
    a, comps, swaps = a[:], 0, 0
    for p in range(len(a) - 1):
        swapped = False
        for i in range(len(a) - 1 - p):
            comps += 1
            if a[i] > a[i + 1]:
                a[i], a[i + 1] = a[i + 1], a[i]; swaps += 1; swapped = True
        if early_exit and not swapped:
            break
    return comps, swaps

def insertion(a):
    a, comps, swaps = a[:], 0, 0
    for i in range(1, len(a)):
        j = i
        while j > 0:
            comps += 1
            if a[j - 1] > a[j]:
                a[j - 1], a[j] = a[j], a[j - 1]; swaps += 1; j -= 1
            else:
                break
    return comps, swaps

def selection(a):
    a, comps, swaps = a[:], 0, 0
    for i in range(len(a) - 1):
        m = i
        for j in range(i + 1, len(a)):
            comps += 1
            if a[j] < a[m]:
                m = j
        if m != i:
            a[i], a[m] = a[m], a[i]; swaps += 1
    return comps, swaps

for arr in ([1, 2, 3, 5, 4], [5, 4, 3, 2, 1], [1, 3, 5, 7, 9, 11, 10, 15, 13]):
    print(arr)
    print('   bubble', bubble(arr), ' bubble+exit', bubble(arr, True),
          ' insertion', insertion(arr), ' selection', selection(arr))
```

The output lists (comparisons, swaps). The last array has two inversions, (11, 10) and (15, 13), so bubble and insertion sort both make two swaps.

## 10.3 Divide and conquer: merge sort and quicksort

| Algorithm | Recurrence | Time | Extra space | Stable? |
|---|---|---|---|---|
| Merge sort | T(n) = 2T(n/2) + Θ(n) | Θ(n log n) in every case | Θ(n) | Yes |
| Quicksort, balanced splits | T(n) = 2T(n/2) + Θ(n) | Θ(n log n) | Θ(log n) stack | No |
| Quicksort, worst case (sorted input, first-element pivot) | T(n) = T(n − 1) + Θ(n) | Θ(n²) | Θ(n) stack | No |
| Quicksort, expected over random order | T(n) = (1/n) Σₖ [T(k) + T(n − k − 1)] + Θ(n) | Θ(n log n), about 1.39 n log₂ n comparisons | | |

The expected-time recurrence averages over the pivot's rank k, which is uniform when the input order is random. Merging two sorted lists of lengths m and n takes at most m + n − 1 comparisons.

**The master theorem** for T(n) = aT(n/b) + Θ(nᵈ): if d > log_b a the answer is Θ(nᵈ); if d = log_b a it is Θ(nᵈ log n); if d < log_b a it is Θ(n^(log_b a)).

```python run Quicksort comparisons: sorted versus random input
import random

def quicksort_comps(a):
    if len(a) <= 1:
        return 0
    pivot, rest = a[0], a[1:]
    left = [x for x in rest if x < pivot]
    right = [x for x in rest if x >= pivot]
    return len(rest) + quicksort_comps(left) + quicksort_comps(right)

random.seed(0)
n = 200
print('sorted input:', quicksort_comps(list(range(n))), '= n(n-1)/2 =', n * (n - 1) // 2)
avg = sum(quicksort_comps(random.sample(range(n), n)) for _ in range(200)) / 200
import math
print(f'random input: about {avg:.0f};  2 n ln n = {2 * n * math.log(n):.0f}')
```

Random input needs far fewer comparisons than sorted input. The exact expected count is 2(n + 1)Hₙ − 4n ≈ 1563 for n = 200 (Hₙ is the harmonic number), which matches the simulation; 2n ln n is only the leading term and overestimates at this size.

## 10.4 Traps

| Trap | Correct thinking |
|---|---|
| Counting a binary search's two-way tests as one | Read how the question defines a comparison |
| Insertion sort is always Θ(n²) | It is Θ(n) on sorted input, and Θ(n + inversions) in general |
| Selection sort is stable | The long-distance swap can reorder equal keys |
| Quicksort is always Θ(n log n) | First-element pivots on sorted input give Θ(n²) |
| Bubble sort's comparison count depends on the input | Without early exit it is always n(n − 1)/2 |

# Chapter 11: Graphs
%Terminology, representations, BFS and DFS, discovery order, shortest paths and directed graphs

## 11.1 Terminology and representations

| Term | Meaning |
|---|---|
| Simple graph | No self-loops, no multiple edges |
| Degree | Number of edges at a vertex; Σ degrees = 2\|E\| (handshake lemma) |
| Path, cycle | A walk with no repeated vertices; a path that returns to its start |
| Connected | Every pair of vertices joined by a path (for undirected graphs) |
| Tree | Connected and acyclic; exactly n − 1 edges |
| DAG | Directed acyclic graph; has a topological order |
| Strongly connected | In a directed graph, every vertex reaches every other |

| Representation | Space | Edge test | List neighbours |
|---|---|---|---|
| Adjacency matrix | Θ(V²) | O(1) | Θ(V) |
| Adjacency list | Θ(V + E) | O(degree) | O(degree) |

A simple undirected graph on n vertices has at most n(n − 1)/2 edges.

## 11.2 Breadth-first and depth-first search

**BFS** uses a queue and visits vertices in order of distance from the source. In an unweighted graph, BFS distances are shortest-path lengths.

**DFS** uses a stack (or recursion) and goes as deep as possible before backtracking. Both take Θ(V + E) with adjacency lists and visit exactly the vertices **reachable** from the start, so BFS and DFS from the same vertex reach the same set, though in different orders.

**Reversing all edges** of a directed graph turns "v reachable from u" into "u reachable from v".

### Worked example: DFS order with ordered adjacency lists

*Vertices 0 to 20 have edges i → j whenever 0 < j − i ≤ 2. Adjacency lists are in increasing order, and DFS starts at 0. How many vertices are discovered after vertex 10? (NAT)*

From each vertex DFS first follows the smaller neighbour i + 1, so it discovers 0, 1, 2, …, 20 in order along a chain. Every vertex after 10, namely 11 to 20, is discovered after it: 10 vertices. With lists in *decreasing* order, DFS would jump by 2 first (0, 2, 4, …, 20), then pick up the odd vertices while backtracking.

```python run DFS discovery order for both adjacency orders
import sys
sys.setrecursionlimit(10_000)

def dfs_order(n, decreasing):
    adj = {i: sorted([j for j in (i + 1, i + 2) if j <= n], reverse=decreasing)
            for i in range(n + 1)}
    order, seen = [], set()
    def visit(u):
        seen.add(u); order.append(u)
        for v in adj[u]:
            if v not in seen:
                visit(v)
    visit(0)
    return order

for dec in (False, True):
    o = dfs_order(20, dec)
    print('decreasing' if dec else 'increasing', o, '| after 10:', len(o) - 1 - o.index(10))
```

With decreasing lists, the order is 0, 2, 4, …, 20 and then 19, 17, …, 1 as DFS backtracks, so 15 vertices come after 10: the five even vertices 12 to 20 and all ten odd vertices.

## 11.3 Shortest paths

| Graph | Algorithm | Time |
|---|---|---|
| Unweighted | BFS | Θ(V + E) |
| Non-negative weights | Dijkstra (with a binary heap) | O((V + E) log V) |
| Negative weights, no negative cycle | Bellman–Ford | O(VE) |
| All pairs | Floyd–Warshall | Θ(V³) |
| DAG | Relax edges in topological order | Θ(V + E) |

**Dijkstra's invariant:** when a vertex is removed from the priority queue, its distance is final. This needs non-negative weights; a negative edge can lower a "final" distance later.

```python run BFS distances and Dijkstra on a small graph
import heapq
from collections import deque

G = {'S': [('A', 1), ('B', 4)], 'A': [('B', 2), ('C', 6)], 'B': [('C', 3)], 'C': []}

def bfs(src):
    dist, q = {src: 0}, deque([src])
    while q:
        u = q.popleft()
        for v, _ in G[u]:
            if v not in dist:
                dist[v] = dist[u] + 1; q.append(v)
    return dist

def dijkstra(src):
    dist, pq = {src: 0}, [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue
        for v, w in G[u]:
            if d + w < dist.get(v, float('inf')):
                dist[v] = d + w; heapq.heappush(pq, (d + w, v))
    return dist

print('BFS (edges):', bfs('S'))
print('Dijkstra (weights):', dijkstra('S'))
```

BFS counts edges: C is 2 edges from S (via A). Dijkstra counts weight: S → A → B → C costs 1 + 2 + 3 = 6, cheaper than S → A → C (7) and S → B → C (7).

## 11.4 Traps

| Trap | Correct thinking |
|---|---|
| BFS gives shortest weighted paths | Only when all weights are equal |
| Dijkstra works with negative edges | It can fail; use Bellman–Ford |
| BFS and DFS visit different vertex sets | They visit the same reachable set, in different orders |
| Discovery order ignores adjacency-list order | DFS order depends on the order of each list |
| A tree on n vertices has n edges | It has n − 1 |
