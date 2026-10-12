# Chapter 11: Tries, Range Queries and String Matching
%Prefix trees, Fenwick and segment trees for changing arrays, and linear-time string matching

## 11.1 Trie (prefix tree)

A trie stores strings character by character along paths from the root, so lookups and prefix queries cost O(length of the word), independent of how many words are stored. In Python a dictionary per node is the simplest representation.

```python run Insert, search, prefix count and autocomplete with a dict-of-dicts trie
class Trie:
    END = '$'

    def __init__(self):
        self.root = {}

    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {})
            node['#'] = node.get('#', 0) + 1       # how many words pass through here
        node[Trie.END] = True

    def search(self, word):
        node = self._walk(word)
        return node is not None and Trie.END in node

    def count_prefix(self, prefix):
        node = self._walk(prefix)
        return node.get('#', 0) if node else 0

    def complete(self, prefix, limit=5):
        node, out = self._walk(prefix), []
        def dfs(n, path):
            if len(out) >= limit:
                return
            if Trie.END in n:
                out.append(prefix + path)
            for ch in sorted(k for k in n if k not in ('#', Trie.END)):
                dfs(n[ch], path + ch)
        if node:
            dfs(node, '')
        return out

    def _walk(self, s):
        node = self.root
        for ch in s:
            if ch not in node:
                return None
            node = node[ch]
        return node

t = Trie()
for w in ['apple', 'app', 'apply', 'apt', 'bat', 'bath', 'batch']:
    t.insert(w)
print(t.search('app'), t.search('ap'), t.count_prefix('ap'), t.count_prefix('bat'))
print(t.complete('ap'), t.complete('bat'), t.complete('x'))
```

Tries power autocomplete, spell checkers, IP routing (longest prefix match) and word-search puzzles; a **binary trie** of numbers' bits finds the maximum XOR pair in O(n · bits).

## 11.2 Range queries on a changing array

Prefix sums answer range sums only while the array does not change. When values update between queries, a **Fenwick tree** (binary indexed tree) or a **segment tree** answers both in O(log n).

```python run A Fenwick tree and a segment tree for point updates and range sums, checked against brute force
import random

class Fenwick:
    def __init__(self, n):
        self.tree = [0] * (n + 1)

    def add(self, i, delta):                       # a[i] += delta (0-based i)
        i += 1
        while i < len(self.tree):
            self.tree[i] += delta
            i += i & -i                            # move to the next responsible node

    def prefix(self, i):                           # sum of a[0..i-1]
        total = 0
        while i > 0:
            total += self.tree[i]
            i -= i & -i
        return total

    def range_sum(self, l, r):                     # sum of a[l..r-1]
        return self.prefix(r) - self.prefix(l)

class SegTree:
    def __init__(self, a):
        self.n = len(a)
        self.t = [0] * self.n + list(a)            # iterative tree: leaves at n..2n-1
        for i in range(self.n - 1, 0, -1):
            self.t[i] = self.t[2 * i] + self.t[2 * i + 1]

    def set(self, i, value):
        i += self.n
        self.t[i] = value
        while i > 1:
            i //= 2
            self.t[i] = self.t[2 * i] + self.t[2 * i + 1]

    def query(self, l, r):                         # sum of a[l..r-1]
        total, l, r = 0, l + self.n, r + self.n
        while l < r:
            if l & 1:
                total += self.t[l]; l += 1
            if r & 1:
                r -= 1; total += self.t[r]
            l //= 2; r //= 2
        return total

rnd = random.Random(8)
a = [rnd.randint(-10, 10) for _ in range(50)]
fw, st = Fenwick(len(a)), SegTree(a)
for i, x in enumerate(a):
    fw.add(i, x)
ok = True
for _ in range(2000):
    if rnd.random() < 0.5:
        i, v = rnd.randrange(50), rnd.randint(-10, 10)
        fw.add(i, v - a[i]); st.set(i, v); a[i] = v
    else:
        l = rnd.randrange(50); r = rnd.randint(l, 50)
        ok &= fw.range_sum(l, r) == st.query(l, r) == sum(a[l:r])
print('2000 random updates and queries agree with brute force:', ok)
```

| Structure | Update | Query | Supports |
|---|---|---|---|
| Prefix sums | O(n) (rebuild) | O(1) | Static arrays |
| Fenwick tree | O(log n) | O(log n) | Sums (any invertible operation), counting inversions |
| Segment tree | O(log n) | O(log n) | Sum, min, max, gcd; lazy propagation for range updates |
| Sparse table | none | O(1) | Static range min/max |

## 11.3 String matching in linear time

```python run KMP prefix function and Rabin-Karp rolling hash, against str.find
import random

def kmp_search(text, pattern):
    pi = [0] * len(pattern)   # longest proper prefix that is also a suffix
    k = 0
    for i in range(1, len(pattern)):
        while k and pattern[i] != pattern[k]:
            k = pi[k - 1]
        if pattern[i] == pattern[k]:
            k += 1
        pi[i] = k
    out, k = [], 0
    for i, ch in enumerate(text):
        while k and ch != pattern[k]:
            k = pi[k - 1]
        if ch == pattern[k]:
            k += 1
        if k == len(pattern):
            out.append(i - k + 1); k = pi[k - 1]
    return out, pi

def rabin_karp(text, pattern, base=256, mod=1_000_000_007):
    m, out = len(pattern), []
    if m > len(text):
        return out
    high = pow(base, m - 1, mod)
    hp = ht = 0
    for i in range(m):
        hp = (hp * base + ord(pattern[i])) % mod
        ht = (ht * base + ord(text[i])) % mod
    for i in range(len(text) - m + 1):
        if hp == ht and text[i:i + m] == pattern:  # verify to rule out hash collisions
            out.append(i)
        if i + m < len(text):
            ht = ((ht - ord(text[i]) * high) * base + ord(text[i + m])) % mod
    return out

matches, pi = kmp_search('abababcabababab', 'ababab')
print('KMP matches:', matches, '| prefix function:', pi)
print('Rabin-Karp:', rabin_karp('abababcabababab', 'ababab'))
rnd = random.Random(9)
ok = True
for _ in range(300):
    text = ''.join(rnd.choice('ab') for _ in range(rnd.randint(0, 40)))
    pat = ''.join(rnd.choice('ab') for _ in range(rnd.randint(1, 4)))
    expected = [i for i in range(len(text) - len(pat) + 1) if text.startswith(pat, i)]
    ok &= kmp_search(text, pat)[0] == expected == rabin_karp(text, pat)
print('both agree with brute force (overlapping matches) on 300 tests:', ok)
```

The prefix function lets KMP reuse what it has already matched instead of restarting, giving O(n + m). Rabin–Karp compares rolling hashes and verifies on equality; it extends naturally to many patterns and to 2-D matching. In practice, Python's built-in `in`, `str.find` and `re` are implemented in C and are the right tools unless the problem asks for the algorithm itself (or for things like the prefix function, which also counts periods and borders).

## 11.4 Practical lessons

- Tries: dict-of-dicts nodes, an end marker, counters for prefix queries; O(word length).
- Fenwick trees for sums with updates; segment trees for min/max and range updates; both O(log n).
- KMP's prefix function gives linear-time matching and string periods; Rabin–Karp hashes with verification.

# Chapter 12: Pattern Revision and Interview Checklist
%Mapping problem statements to patterns, complexity tables, a Python bug checklist, running the interview, and a last-week question bank

## 12.1 From problem statement to pattern

| Signal in the problem | Pattern | Chapter |
|---|---|---|
| Subarray or substring with a sum or count condition | Prefix sums + hash map; sliding window if values are non-negative | 2 |
| Pair or triplet with a target in a sorted array | Two pointers | 2 |
| "Longest/shortest substring with ..." | Sliding window | 2 |
| Sorted input, or "minimum value that satisfies ..." | Binary search (on the index or the answer) | 3 |
| Overlapping ranges, meetings | Sort by start, sweep; heap of end times | 3 |
| "Next greater/smaller", histogram areas | Monotonic stack | 4 |
| Window maximum/minimum | Monotonic deque | 4 |
| All combinations, permutations, placements | Backtracking with pruning | 5 |
| Tree properties, paths | DFS returning values upwards; BFS for levels | 6 |
| k largest/smallest, streaming median, merging sorted lists | Heaps | 7 |
| Grid or network, shortest steps | BFS; Dijkstra with weights | 8 |
| Dependencies, ordering | Topological sort | 8 |
| Connectivity with merges | Union–find | 8 |
| Count ways, min/max cost, feasibility with choices | Dynamic programming | 9 |
| Intervals or schedules with an obvious best next choice | Greedy (prove it) | 10 |
| Single number, subsets of ≤ 20 items | Bit manipulation, bitmask DP | 10 |
| Prefix lookups, dictionary of words | Trie | 11 |
| Range sums with updates | Fenwick or segment tree | 11 |

## 12.2 Complexity cheat sheet

| Structure / algorithm | Time |
|---|---|
| list index, append, pop from end | O(1) |
| list insert/pop at front, `in` list | O(n) |
| dict/set get, set, `in` | O(1) average |
| deque at either end | O(1) |
| heappush, heappop | O(log n); `heapify` O(n) |
| bisect search | O(log n); `insort` O(n) |
| sort | O(n log n) |
| BFS, DFS, topological sort | O(V + E) |
| Dijkstra with heap | O((V + E) log V) |
| Union–find | ~O(1) per operation |
| Fenwick, segment tree | O(log n) |
| Trie operation | O(length) |
| Subsets / permutations | O(2ⁿ · n) / O(n! · n) |

## 12.3 Bug checklist before you submit

| Check | Python-specific trap |
|---|---|
| Empty input, single element, all equal, negative numbers | `max([])` raises; use `default=` |
| Off-by-one in ranges and slices | `range(n)` excludes n; `a[i:j]` excludes j |
| Integer division and modulo with negatives | `//` and `%` floor towards −∞ |
| Shared mutable state | `[[0] * m] * n`; mutable default arguments; appending `path` instead of `path[:]` |
| Recursion depth | Raise `sys.setrecursionlimit` or use an explicit stack |
| Visited marking in BFS | Mark when enqueuing |
| Heaps with ties | Add a counter to tuples |
| Performance | Avoid `list.pop(0)`, string `+=` in loops, `in` on lists; use fast input |
| Output format | Exact spacing, one answer per line, no debug prints |

## 12.4 Running the interview

1. **Clarify**: input size and ranges, duplicates, negative values, empty input, output format.
2. **Examples**: work one small example by hand; agree on the expected output.
3. **Approach**: state a brute force and its complexity, then the better pattern and why it works.
4. **Code**: write clean Python with meaningful names; helper functions for sub-steps.
5. **Test**: trace the example, then edge cases; fix bugs you find yourself.
6. **Complexity**: state time and space, including hidden costs (sorting, slicing, recursion stack).

## 12.5 Question bank for the last week

| Question | Core of a good answer |
|---|---|
| Why is `x in list` slow and `x in set` fast? | Linear scan versus hash lookup |
| How do you make a max-heap with `heapq`? | Push negated values (or tuples with negated keys) |
| How do you implement a queue in Python? | `collections.deque` with `append` and `popleft` |
| What replaces Java's TreeMap? | `bisect` on a sorted list, or `sortedcontainers.SortedList` where available |
| When does `lru_cache` fail? | Unhashable arguments (lists), deep recursion, memory for huge state spaces |
| Two-sum in O(n)? | Hash map from value to index, checking the complement |
| Longest substring without repeats? | Sliding window with last-seen positions |
| Detect a cycle in a linked list? | Fast and slow pointers (Floyd) |
| Shortest path in a grid? | BFS, marking cells when enqueued |
| Why not Dijkstra with negative edges? | A settled node can later get a shorter path; use Bellman–Ford |
| 0/1 versus unbounded knapsack in one array? | Capacity loop backwards versus forwards |
| LIS in O(n log n)? | `bisect` on the tails array |
| Counting set bits? | `int.bit_count()` or `x & (x - 1)` loop |
| Modular inverse? | `pow(a, -1, m)` for prime or coprime m |

## 12.6 Practical lessons

- Read the constraints, map the signals to a pattern, and check the complexity against Python's speed.
- Use the toolkit (`deque`, `heapq`, `bisect`, `Counter`, `lru_cache`) and avoid the known traps.
- Clarify, plan, code, test and state complexity, aloud.
