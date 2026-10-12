## Part 5 solutions

### D5.1 Word break

```python run Boolean DP that also remembers a split point
from functools import lru_cache

def word_break(s, words):
    words = set(words)
    longest = max(map(len, words), default=0)
    cut = [None] * (len(s) + 1)
    cut[0] = 0
    for i in range(1, len(s) + 1):
        for j in range(max(0, i - longest), i):
            if cut[j] is not None and s[j:i] in words:
                cut[i] = j
                break
    if cut[-1] is None:
        return None
    parts, i = [], len(s)
    while i:
        parts.append(s[cut[i]:i])
        i = cut[i]
    return parts[::-1]

print(word_break('leetcode', ['leet', 'code']))
print(word_break('catsandog', ['cats', 'dog', 'sand', 'and', 'cat']))
print(word_break('pineapplepen', ['apple', 'pen', 'applepen', 'pine', 'pineapple']))
s = 'a' * 30 + 'b'

@lru_cache(None)
def memo(i):
    return i == len(s) or any(s[i:j] in {'a', 'aa'} and memo(j)
                              for j in range(i + 1, len(s) + 1))
print(word_break(s, ['a', 'aa']), memo(0))
```

`cut[i]` stores where the last word of `s[:i]` starts, so following it backwards rebuilds one valid split. Limiting j to the longest word length avoids pointless slices. The last line is the classic trap input: without memoisation, a plain recursive search on `aaa…ab` explores an exponential number of splits before failing. With `lru_cache`, or the table, each position is solved once.

### D5.2 Maximum product subarray

```python run Track the largest and smallest product ending here
import random
from math import prod

def max_product(nums):
    best = hi = lo = nums[0]
    for x in nums[1:]:
        candidates = (x, hi * x, lo * x)
        hi, lo = max(candidates), min(candidates)
        best = max(best, hi)
    return best

def brute(nums):
    return max(prod(nums[i:j]) for i in range(len(nums)) for j in range(i + 1, len(nums) + 1))

print(max_product([2, 3, -2, 4]), max_product([-2, 0, -1]), max_product([-2, 3, -4]))
for _ in range(500):
    a = [random.randint(-4, 4) for _ in range(random.randint(1, 9))]
    assert max_product(a) == brute(a), a
print('500 random cases match brute force')
```

A negative number turns the smallest product into the largest, so both must be carried. Computing both from the same `candidates` tuple avoids the bug where `hi` is updated before `lo` reads it. Zero resets both through the `x` candidate.

### D5.3 Decode ways

```python run Two rolling variables, checked by recursion
import random
from functools import lru_cache

def decode_ways(s):
    prev2, prev1 = 1, 1 if s and s[0] != '0' else 0
    for i in range(1, len(s)):
        cur = prev1 if s[i] != '0' else 0
        if 10 <= int(s[i - 1:i + 1]) <= 26:
            cur += prev2
        prev2, prev1 = prev1, cur
    return prev1 if s else 0

def brute(s):
    @lru_cache(None)
    def go(i):
        if i == len(s):
            return 1
        total = 0
        if s[i] != '0':
            total += go(i + 1)
            if i + 1 < len(s) and int(s[i:i + 2]) <= 26:
                total += go(i + 2)
        return total
    return go(0) if s else 0

for s in ('12', '226', '06', '10', '2101', '100'):
    print(s, decode_ways(s), end='   ')
print()
for _ in range(1000):
    s = ''.join(random.choice('0123456') for _ in range(random.randint(1, 10)))
    assert decode_ways(s) == brute(s), s
print('1000 random strings match the recursive count')
```

Zeros are the whole difficulty: '0' cannot stand alone, and '06' is not a valid two-digit code, so `'06'` has 0 decodings and `'100'` has 0 too (the second 0 has no partner). The range check `10 <= … <= 26` excludes leading-zero pairs automatically. Testing with many zeros in the alphabet catches the cases that a hand-picked list misses.

### D5.4 Stock trading with cooldown

```python run Three-state machine, checked by exhaustive search
import random
from functools import lru_cache

def max_profit(prices):
    hold, sold, rest = float('-inf'), 0, 0
    for p in prices:
        hold, sold, rest = max(hold, rest - p), hold + p, max(rest, sold)
    return max(sold, rest)

def brute(prices):
    @lru_cache(None)
    def go(i, holding):
        if i >= len(prices):
            return 0
        skip = go(i + 1, holding)
        if holding:
            return max(skip, prices[i] + go(i + 2, False))
        return max(skip, -prices[i] + go(i + 1, True))
    return go(0, False)

print(max_profit([1, 2, 3, 0, 2]), max_profit([1]), max_profit([5, 4, 3]))
for _ in range(500):
    p = [random.randint(0, 9) for _ in range(random.randint(0, 10))]
    assert max_profit(p) == brute(p), p
print('500 random price lists match the recursive search')
```

`hold` is the best profit while owning a share, `sold` the best having sold today, and `rest` the best while free to buy. The tuple assignment updates all three from yesterday's values; `rest - p` (not `sold - p`) enforces the cooldown. On `[1, 2, 3, 0, 2]` the best is buy 1, sell 2, cool down, buy 0, sell 2, for a profit of 3.

### D5.5 Gas station

```python run One pass with a running tank, checked by trying every start
import random

def start_station(gas, cost):
    if sum(gas) < sum(cost):
        return -1
    tank = start = 0
    for i in range(len(gas)):
        tank += gas[i] - cost[i]
        if tank < 0:
            start, tank = i + 1, 0
    return start

def brute(gas, cost):
    n = len(gas)
    for s in range(n):
        tank = 0
        for k in range(n):
            i = (s + k) % n
            tank += gas[i] - cost[i]
            if tank < 0:
                break
        else:
            return s
    return -1

print(start_station([1, 2, 3, 4, 5], [3, 4, 5, 1, 2]), start_station([2, 3, 4], [3, 4, 3]))
for _ in range(1000):
    n = random.randint(1, 7)
    g = [random.randint(0, 5) for _ in range(n)]
    c = [random.randint(0, 5) for _ in range(n)]
    assert start_station(g, c) == brute(g, c), (g, c)
print('1000 random circuits match brute force')
```

If the tank goes negative at i, no station between the current start and i can be a valid start either, because each would arrive at i with no more fuel. So we jump past i. If the total gas covers the total cost, the remaining candidate is guaranteed to work. When several starts work, both versions return the smallest one, which is why they agree.

### D5.6 Bit puzzles

```python run Counting bits, powers of four and bit reversal
def count_bits(n):
    bits = [0] * (n + 1)
    for i in range(1, n + 1):
        bits[i] = bits[i >> 1] + (i & 1)
    return bits

def power_of_four(x):
    return x > 0 and x & (x - 1) == 0 and x & 0x55555555 == x

def reverse_bits(x):
    out = 0
    for _ in range(32):
        out = (out << 1) | (x & 1)
        x >>= 1
    return out

print(count_bits(10))
assert count_bits(1000) == [bin(i).count('1') for i in range(1001)]
print([x for x in range(1, 300) if power_of_four(x)])
print(reverse_bits(1), reverse_bits(0b1011), f'{reverse_bits(43261596):032b}')
assert all(reverse_bits(v) == int(f'{v:032b}'[::-1], 2) for v in range(0, 2**32, 99991))
print('count_bits and reverse_bits checked against string versions')
```

`i >> 1` drops the last bit, whose count is already known, and `i & 1` adds it back. A power of four is a power of two (`x & (x − 1) == 0`) whose single bit sits at an even position, which the mask `0x55555555` (binary 0101…) tests. Python integers are unbounded, so the reversal must loop exactly 32 times; `int(bin(x)[:1:-1], 2)` would ignore leading zeros and give the wrong answer.

## Part 6 solutions

### D6.1 Trie with wildcards

```python run Dictionary trie with recursive wildcard search
import random, re

class WordDictionary:
    def __init__(self):
        self.root = {}

    def add(self, word):
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {})
        node['$'] = True

    def search(self, pattern):
        def go(node, i):
            if i == len(pattern):
                return '$' in node
            ch = pattern[i]
            if ch == '.':
                return any(go(child, i + 1) for key, child in node.items() if key != '$')
            return ch in node and go(node[ch], i + 1)
        return go(self.root, 0)

wd = WordDictionary()
for w in ('bad', 'dad', 'mad', 'pad', 'bat'):
    wd.add(w)
print([wd.search(p) for p in ('pad', 'bad.', '.ad', 'b..', '...', 'ba', '..t', '.b.')])
for _ in range(200):
    wd2, words = WordDictionary(), set()
    for _ in range(random.randint(0, 8)):
        w = ''.join(random.choice('ab') for _ in range(random.randint(1, 4)))
        wd2.add(w)
        words.add(w)
    p = ''.join(random.choice('ab.') for _ in range(random.randint(1, 4)))
    assert wd2.search(p) == any(re.fullmatch(p, w) for w in words)
print('200 random dictionaries match a regex scan')
```

`'$'` marks the end of a word, so `'ba'` is not found even though it is a prefix of `'bad'`. The key check `key != '$'` stops the wildcard from stepping into the end marker, which is a `True`, not a dict. A `.` in our patterns happens to mean the same in a regular expression, which makes `re.fullmatch` an easy reference to test against.

### D6.2 Count smaller numbers after self

```python run Fenwick tree over value ranks, scanning from the right
import random
from bisect import bisect_left

def count_smaller(nums):
    ranks = sorted(set(nums))
    tree = [0] * (len(ranks) + 1)

    def add(i):
        while i < len(tree):
            tree[i] += 1
            i += i & -i

    def prefix(i):
        total = 0
        while i > 0:
            total += tree[i]
            i -= i & -i
        return total

    out = []
    for x in reversed(nums):
        r = bisect_left(ranks, x) + 1
        out.append(prefix(r - 1))
        add(r)
    return out[::-1]

print(count_smaller([5, 2, 6, 1]), count_smaller([-1, -1]), count_smaller([2, 0, 1]))
for _ in range(500):
    a = [random.randint(-5, 5) for _ in range(random.randint(0, 10))]
    assert count_smaller(a) == [sum(y < x for y in a[i + 1:]) for i, x in enumerate(a)]
print('500 random lists match brute force')
```

Coordinate compression maps each value to a rank from 1 to m, so negative and huge values both work. Scanning right to left, the tree holds exactly the elements to the right, and `prefix(r − 1)` counts those strictly smaller (equal values share rank r and are excluded). A merge-sort count is the other O(n log n) approach.

### D6.3 Repeated substring pattern

```python run Prefix function gives the smallest period
def prefix_function(s):
    pi = [0] * len(s)
    for i in range(1, len(s)):
        k = pi[i - 1]
        while k and s[i] != s[k]:
            k = pi[k - 1]
        if s[i] == s[k]:
            k += 1
        pi[i] = k
    return pi

def repeated_unit(s):
    if not s:
        return None
    period = len(s) - prefix_function(s)[-1]
    if period < len(s) and len(s) % period == 0:
        return s[:period]
    return None

for s in ('abab', 'aba', 'abcabcabcabc', 'aaaa', 'abaababaab', 'a'):
    print(f'{s!r:16} {repeated_unit(s)!r:8} trick: {s in (s + s)[1:-1]}')
```

`pi[-1]` is the longest proper prefix that is also a suffix, and `n − pi[-1]` is the smallest period. The string is a repetition exactly when that period divides n. `'abaababaab'` has period 5 (`'abaab'` twice). The last column shows the one-line trick: s is a repetition if and only if it appears inside `s + s` with the first and last characters removed. The trick answers the yes/no question but does not give the unit.

### D6.4 Choose the pattern

| Problem statement | Pattern | Complexity |
|---|---|---|
| (a) Minimum capacity of a ship to deliver packages in D days | Binary search on the answer with a greedy check | O(n log Σw) |
| (b) Shortest path in a grid where some cells cost 0 and others 1 | 0–1 BFS with a deque (or Dijkstra) | O(rows × cols) |
| (c) Next warmer day for each day | Monotonic stack | O(n) |
| (d) Number of islands after each "add land" operation | Union–find, counting merges | O(k α(n)) |
| (e) Smallest window of s containing all characters of t | Variable sliding window with a `Counter` of needs | O(\|s\| + \|t\|) |
| (f) Count ways to reach the end of an array with jumps of 1 to k | DP with a sliding window sum (or prefix sums) | O(n) |

Each answer comes from the signal words. "Minimum capacity such that" means binary search on the answer. Weights of only 0 and 1 mean 0–1 BFS. "Next greater/warmer" means a monotonic stack. Connectivity that grows online means union–find. "Smallest window containing" means a sliding window. "Count the ways" with overlapping subproblems means DP, and the window sum turns O(nk) into O(n).

### D6.5 Make it fast

```python run Same output, far less time
import time
from collections import deque

def slow(n):
    queue, log = list(range(n)), ''
    while queue:
        x = queue.pop(0)
        if x % 1000 == 0:
            log += str(x) + ','
    return log

def fast(n):
    queue, pieces = deque(range(n)), []
    while queue:
        x = queue.popleft()
        if x % 1000 == 0:
            pieces.append(str(x))
    return ''.join(p + ',' for p in pieces)

for f in (slow, fast):
    t = time.perf_counter()
    out = f(100_000)
    print(f'{f.__name__:5} {time.perf_counter() - t:.3f} s  length {len(out)}  {out[:24]}')
print('same output:', slow(100_000) == fast(100_000))
```

`list.pop(0)` shifts every remaining element, so draining n items costs O(n²); `deque.popleft` is O(1). The timings show the gap. String `+=` in a loop is officially quadratic too. CPython often avoids the copy when the string has only one reference, but that is an implementation detail, so collect the pieces and `join` once.

### D6.6 LRU cache

```python run OrderedDict keeps keys in recency order
import random
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.data = OrderedDict()

    def get(self, key):
        if key not in self.data:
            return -1
        self.data.move_to_end(key)
        return self.data[key]

    def put(self, key, value):
        self.data[key] = value
        self.data.move_to_end(key)
        if len(self.data) > self.capacity:
            self.data.popitem(last=False)

c = LRUCache(2)
c.put(1, 1); c.put(2, 2)
print(c.get(1), end=' ')
c.put(3, 3)
print(c.get(2), end=' ')
c.put(4, 4)
print(c.get(1), c.get(3), c.get(4))

class Reference:
    def __init__(self, capacity):
        self.capacity, self.order, self.data = capacity, [], {}
    def touch(self, key):
        if key in self.order:
            self.order.remove(key)
        self.order.append(key)
    def get(self, key):
        if key not in self.data:
            return -1
        self.touch(key)
        return self.data[key]
    def put(self, key, value):
        self.data[key] = value
        self.touch(key)
        if len(self.order) > self.capacity:
            del self.data[self.order.pop(0)]

for _ in range(200):
    cap = random.randint(1, 4)
    a, b = LRUCache(cap), Reference(cap)
    for _ in range(50):
        k = random.randint(0, 6)
        if random.random() < 0.5:
            assert a.get(k) == b.get(k)
        else:
            v = random.randint(0, 99)
            a.put(k, v); b.put(k, v)
print('200 random operation sequences match a list-based reference')
```

`move_to_end` marks a key as most recent and `popitem(last=False)` removes the least recent, both O(1) because `OrderedDict` is a hash map plus a doubly linked list. In an interview you may be asked to build that linked list yourself, as in the Java guide. The structure is the same: a dict from key to node, with sentinel head and tail nodes.
