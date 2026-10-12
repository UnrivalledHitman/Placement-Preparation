# Chapter 9: Dynamic Programming
%State, transition and base case; memoisation with lru_cache versus tabulation; the classic DP families; and how to recognise a DP problem

## 9.1 The method

Dynamic programming solves problems whose optimal answer is built from optimal answers to overlapping sub-problems. Four questions define every DP:

1. **State**: what does `dp[i]` (or `dp[i][j]`) mean, in words?
2. **Transition**: how is a state computed from smaller states?
3. **Base cases**: the smallest states, known directly.
4. **Order and answer**: which order guarantees sub-problems are ready, and which state holds the answer?

```python run Top-down with lru_cache versus bottom-up tables, on house robber
from functools import lru_cache

houses = [2, 7, 9, 3, 1, 5, 8]

@lru_cache(maxsize=None)
def rob_from(i):                                   # best total from house i onwards
    if i >= len(houses):
        return 0
    return max(rob_from(i + 1), houses[i] + rob_from(i + 2))

def rob_table(h):
    dp = [0] * (len(h) + 2)                         # dp[i] = best from house i onwards
    for i in range(len(h) - 1, -1, -1):
        dp[i] = max(dp[i + 1], h[i] + dp[i + 2])
    return dp[0]

def rob_two_vars(h):
    take, skip = 0, 0   # best ending with / without the last house
    for x in h:
        take, skip = skip + x, max(take, skip)
    return max(take, skip)

print(rob_from(0), rob_table(houses), rob_two_vars(houses), '| cache:',
        rob_from.cache_info())
```

| Style | Pros | Cons in Python |
|---|---|---|
| Top-down (`@lru_cache` recursion) | Write the recurrence directly; computes only needed states | Recursion limit; function-call overhead; `lru_cache` needs hashable arguments |
| Bottom-up (tables) | No recursion; easy to reduce memory to the last row or two | Must work out the evaluation order |

## 9.2 One-dimensional DP

```python run Climbing stairs, minimum coins, and the number of ways to make change
def climb(n):                                       # 1 or 2 steps at a time
    a, b = 1, 1
    for _ in range(n):
        a, b = b, a + b
    return a

def min_coins(coins, amount):
    INF = float('inf')
    dp = [0] + [INF] * amount                       # dp[x] = fewest coins summing to x
    for x in range(1, amount + 1):
        dp[x] = min((dp[x - c] + 1 for c in coins if c <= x), default=INF)
    return dp[amount] if dp[amount] < INF else -1

def ways(coins, amount):
    dp = [1] + [0] * amount                         # combinations, order ignored
    for c in coins:   # coin loop outside: each set counted once
        for x in range(c, amount + 1):
            dp[x] += dp[x - c]
    return dp[amount]

print([climb(n) for n in range(1, 9)])
print(min_coins([1, 2, 5], 11), min_coins([2], 3), min_coins([1, 3, 4], 6))
print(ways([1, 2, 5], 5), ways([2], 3), ways([10], 10))
```

`min_coins([1, 3, 4], 6)` is 2 (3 + 3), where a greedy "largest coin first" would use 4 + 1 + 1: one of the clearest signs that a problem needs DP rather than greed. In `ways`, putting the coin loop **outside** counts each combination once; swapping the loops would count orderings (1 + 2 and 2 + 1 separately).

## 9.3 Longest increasing subsequence in O(n log n)

```python run O(n log n) LIS with bisect, checked against the O(n^2) DP
import bisect, random

def lis_fast(a):
    tails = []   # tails[k] = smallest tail of an increasing run of length k+1
    for x in a:
        i = bisect.bisect_left(tails, x)
        if i == len(tails):
            tails.append(x)
        else:
            tails[i] = x
    return len(tails)

def lis_slow(a):
    dp = [1] * len(a)
    for i in range(len(a)):
        for j in range(i):
            if a[j] < a[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp, default=0)

print(lis_fast([10, 9, 2, 5, 3, 7, 101, 18]), lis_fast([0, 1, 0, 3, 2, 3]), lis_fast([7, 7,
        7]))
rnd = random.Random(7)
print('agrees with O(n^2) DP on 300 arrays:',
      all(lis_fast(v) == lis_slow(v) for v in ([rnd.randint(0, 30)
              for _ in range(rnd.randint(0, 40))]
                                               for _ in range(300))))
```

`tails` is not itself an increasing subsequence of the input; only its length is meaningful. Using `bisect_right` instead of `bisect_left` gives the longest **non-decreasing** subsequence.

## 9.4 Two-dimensional DP on two sequences

```python run Longest common subsequence (with reconstruction) and edit distance
def lcs(a, b):
    n, m = len(a), len(b)
    dp = [[0] * (m + 1) for _ in range(n + 1)]      # dp[i][j]: LCS of a[:i] and b[:j]
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            dp[i][j] = dp[i - 1][j - 1] + 1 if a[i - 1] == b[j - 1] else max(dp[i - 1][j],
                    dp[i][j - 1])
    out, i, j = [], n, m                           # walk back to recover one LCS
    while i and j:
        if a[i - 1] == b[j - 1]:
            out.append(a[i - 1]); i -= 1; j -= 1
        elif dp[i - 1][j] >= dp[i][j - 1]:
            i -= 1
        else:
            j -= 1
    return dp[n][m], ''.join(reversed(out))

def edit_distance(a, b):
    prev = list(range(len(b) + 1))                 # one row at a time: O(len(b)) memory
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1,            # delete
                           cur[j - 1] + 1,         # insert
                           prev[j - 1] + (ca != cb)))   # replace or match
        prev = cur
    return prev[-1]

print(lcs('ABCBDAB', 'BDCABA'), lcs('abc', 'xyz'))
print(edit_distance('horse', 'ros'), edit_distance('intention', 'execution'),
        edit_distance('', 'abc'))
```

## 9.5 Knapsack

```python run 0/1 knapsack with a one-dimensional array iterated backwards, and subset sum
def knapsack(weights, values, cap):
    dp = [0] * (cap + 1)                           # dp[c] = best value with capacity c
    for w, v in zip(weights, values):
        for c in range(cap, w - 1, -1):            # backwards: each item used at most once
            dp[c] = max(dp[c], dp[c - w] + v)
    return dp[cap]

def unbounded(weights, values, cap):
    dp = [0] * (cap + 1)
    for c in range(1, cap + 1):                    # forwards: items may repeat
        dp[c] = max([dp[c - w] + v for w, v in zip(weights, values) if w <= c], default=0)
    return dp[cap]

def can_partition(nums):
    total = sum(nums)
    if total % 2:
        return False
    reachable = 1                                  # bitset: bit s set if sum s is reachable
    for x in nums:
        reachable |= reachable << x
    return bool(reachable >> (total // 2) & 1)

print(knapsack([1, 3, 4, 5], [1, 4, 5, 7], 7), unbounded([1, 3, 4, 5], [1, 4, 5, 7], 7))
print(can_partition([1, 5, 11, 5]), can_partition([1, 2, 3, 5]))
```

Iterating capacity **backwards** makes `dp[c - w]` refer to the previous item's row, so each item is taken at most once; iterating forwards allows reuse (unbounded knapsack). The subset-sum version uses a Python integer as a bitset: shifting by x adds x to every reachable sum at once, a fast idiom thanks to arbitrary-size integers.

## 9.6 Grid DP

```python run Unique paths with obstacles, and minimum path sum with the path itself
def unique_paths(grid):
    R, C = len(grid), len(grid[0])
    dp = [0] * C
    dp[0] = 1
    for r in range(R):
        for c in range(C):
            if grid[r][c] == 1:
                dp[c] = 0                          # obstacle
            elif c:
                dp[c] += dp[c - 1]   # from above (old dp[c]) plus from the left
    return dp[-1]

def min_path(grid):
    R, C = len(grid), len(grid[0])
    dp = [[0] * C for _ in range(R)]
    for r in range(R):
        for c in range(C):
            best = min([dp[r - 1][c]] * (r > 0) + [dp[r][c - 1]] * (c > 0), default=0)
            dp[r][c] = grid[r][c] + best
    path, r, c = [], R - 1, C - 1
    while (r, c) != (0, 0):
        path.append(grid[r][c])
        if c == 0 or (r > 0 and dp[r - 1][c] <= dp[r][c - 1]):
            r -= 1
        else:
            c -= 1
    return dp[-1][-1], [grid[0][0]] + path[::-1]

print(unique_paths([[0, 0, 0], [0, 1, 0], [0, 0, 0]]), unique_paths([[0] * 7
        for _ in range(3)]))
print(min_path([[1, 3, 1], [1, 5, 1], [4, 2, 1]]))
```

## 9.7 Interval DP and DP on subsets

```python run Matrix-chain multiplication (intervals) and travelling salesman on 5 cities (bitmasks)
from functools import lru_cache
from itertools import permutations

dims = [10, 30, 5, 60, 10]                         # matrices 10x30, 30x5, 5x60, 60x10

@lru_cache(maxsize=None)
def chain(i, j):                                   # cheapest way to multiply matrices i..j
    if i == j:
        return 0
    return min(chain(i, k) + chain(k + 1, j) + dims[i] * dims[k + 1] * dims[j + 1]
               for k in range(i, j))
print('matrix chain:', chain(0, len(dims) - 2))

dist = [[0, 2, 9, 10, 7], [1, 0, 6, 4, 3], [15, 7, 0, 8, 3], [6, 3, 12, 0, 11], [9, 7, 5, 6,
        0]]
n = len(dist)

@lru_cache(maxsize=None)
def tsp(mask, last):   # cities in mask visited, standing at last
    if mask == (1 << n) - 1:
        return dist[last][0]
    return min(dist[last][nxt] + tsp(mask | 1 << nxt, nxt)
               for nxt in range(n) if not mask >> nxt & 1)

brute = min(sum(dist[a][b] for a, b in zip((0,) + p, p + (0,)))
        for p in permutations(range(1, n)))
print('TSP bitmask DP:', tsp(1, 0), '| brute force:', brute)
```

Interval DP builds answers for longer intervals from shorter ones (matrix chain, burst balloons, palindrome partitioning). Bitmask DP stores the set of used items as an integer, practical up to about 20 items: O(2ⁿ · n²) for TSP instead of O(n!).

## 9.8 Recognising a DP problem

| Clue in the statement | Likely DP |
|---|---|
| "Number of ways", "minimum/maximum cost", "is it possible" | Counting or optimisation DP |
| Choices at each step that affect later options | Take/skip states (robber, knapsack) |
| Two strings or sequences compared | 2-D DP on prefixes (LCS, edit distance) |
| A grid with moves right/down | Grid DP |
| Splitting an array or string into parts | Interval or partition DP |
| n ≤ 20 with subsets | Bitmask DP |
| Greedy counterexample exists | DP |

## 9.9 State definitions for classic problems

| Problem | State | Transition |
|---|---|---|
| Climbing stairs | ways[i] to reach step i | ways[i−1] + ways[i−2] |
| House robber | best[i] from house i on | max(best[i+1], h[i] + best[i+2]) |
| Coin change (min coins) | dp[x] coins for amount x | min(dp[x − c] + 1) |
| Coin change (ways) | dp[x] combinations for x | dp[x] += dp[x − c], coins outer |
| Longest increasing subsequence | tails[k] smallest tail of length k+1 | bisect |
| LCS / edit distance | dp[i][j] for prefixes a[:i], b[:j] | match → diagonal; else best of neighbours |
| 0/1 knapsack | dp[c] best value for capacity c | max(dp[c], dp[c − w] + v), c backwards |
| Unique paths | dp[r][c] ways to reach cell | dp[r−1][c] + dp[r][c−1] |
| Word break | ok[i]: s[:i] can be segmented | any ok[j] and s[j:i] in words |
| Palindromic substrings | pal[i][j] | s[i] == s[j] and pal[i+1][j−1] |
| Matrix chain | cost[i][j] for matrices i..j | min over split k |
| TSP / assignment (n ≤ 20) | dp[mask][last] | add one unvisited city |

## 9.10 Practical lessons

- Define the state in words before writing code; then transition, base cases, order.
- `lru_cache` for quick top-down solutions; tables when recursion depth or speed matters.
- Coin loop outside for combinations; capacity backwards for 0/1 knapsack.
- LIS in O(n log n) with `bisect`; LCS and edit distance with 2-D tables or rolling rows.
- Bitmask DP up to ~20 items; integers as bitsets for subset sums.

# Chapter 10: Greedy, Bit Manipulation and Maths
%When greedy choices are safe, bit tricks with Python integers, and the number theory coding rounds use

## 10.1 When greedy works

A greedy algorithm takes the locally best choice and never revisits it. It is correct only when an **exchange argument** shows that some optimal solution makes the same choice.

```python run Activity selection, jump game, and a counterexample where greedy fails
def max_meetings(intervals):
    count, end = 0, float('-inf')
    for s, e in sorted(intervals, key=lambda iv: iv[1]):     # earliest finish first
        if s >= end:
            count, end = count + 1, e
    return count

def can_jump(nums):
    reach = 0
    for i, step in enumerate(nums):
        if i > reach:
            return False
        reach = max(reach, i + step)
    return True

def greedy_coins(coins, amount):
    used = 0
    for c in sorted(coins, reverse=True):
        used += amount // c; amount %= c
    return used if amount == 0 else -1

print(max_meetings([(1, 4), (3, 5), (0, 6), (5, 7), (3, 9), (5, 9), (6, 10), (8, 11)]))
print(can_jump([2, 3, 1, 1, 4]), can_jump([3, 2, 1, 0, 4]))
print('greedy coins for 6 with [1, 3, 4]:', greedy_coins([1, 3, 4], 6),
        '(optimal is 2: 3 + 3)')
```

Choosing the meeting that **ends** earliest is safe: swapping it into any optimal schedule leaves at least as much room for the rest. Choosing the shortest meeting or the earliest start is not.

## 10.2 Bit manipulation

```python run Common bit tricks with Python integers
x = 0b101100
print(bin(x), x.bit_count(), x.bit_length())          # set bits, number of bits needed
print('lowest set bit:', x & -x, '| clear it:', bin(x & (x - 1)), '| power of two?',
        x & (x - 1) == 0)
print('is 64 a power of two?', 64 > 0 and 64 & 63 == 0)
print('bit 3 set?', bool(x >> 3 & 1), '| set bit 0:', bin(x | 1), '| toggle bit 2:',
        bin(x ^ 4))

nums = [4, 1, 2, 1, 2]
single = 0
for v in nums:
    single ^= v                                       # pairs cancel: a ^ a = 0
print('number appearing once:', single)

items = ['a', 'b', 'c']
print('subsets:',
      [[items[i] for i in range(3) if mask >> i & 1] for mask in range(1 << 3)])
print('negative numbers are infinite two\'s complement:', -5 & 0xFF, bin(-5 & 0xFF), ~5)
```

Python integers have unlimited size, so there is no 32-bit overflow; problems that expect 32-bit behaviour need masking with `& 0xFFFFFFFF`. `int.bit_count()` (Python 3.10+) counts set bits; `bin(x).count('1')` works everywhere.

## 10.3 Number theory for coding rounds

```python run gcd and lcm, a sieve, modular exponentiation, modular inverse and nCr mod p
import math

print(math.gcd(84, 36), math.lcm(4, 6, 10), math.gcd(0, 7))

def sieve(n):
    is_prime = bytearray([1]) * (n + 1)
    is_prime[0:2] = b'\x00\x00'
    for p in range(2, math.isqrt(n) + 1):
        if is_prime[p]:
            is_prime[p * p::p] = bytes(len(range(p * p, n + 1, p)))    # cross out multiples
    return [i for i in range(n + 1) if is_prime[i]]

primes = sieve(100)
print(len(primes), primes[:10], 'primes below 10^6:', len(sieve(10**6)))

MOD = 10**9 + 7
print('2^100 mod p:', pow(2, 100, MOD), '| inverse of 3 mod p:', pow(3, -1, MOD),
      '| check:', 3 * pow(3, -1, MOD) % MOD)

def ncr_table(n, mod=MOD):
    fact = [1] * (n + 1)
    for i in range(1, n + 1):
        fact[i] = fact[i - 1] * i % mod
    inv = [1] * (n + 1)
    inv[n] = pow(fact[n], -1, mod)   # Fermat's little theorem under the hood
    for i in range(n, 0, -1):
        inv[i - 1] = inv[i] * i % mod
    return lambda a, b: 0 if b < 0 or b > a else fact[a] * inv[b] % mod * inv[a - b] % mod

C = ncr_table(1000)
print('C(10, 3) =', C(10, 3), '| math.comb:', math.comb(10, 3), '| C(1000, 500) mod p =',
        C(1000, 500))
```

| Tool | Python |
|---|---|
| gcd, lcm | `math.gcd`, `math.lcm` |
| Integer square root | `math.isqrt(n)` (exact for huge n; avoid `int(n ** 0.5)`) |
| Fast modular power | `pow(a, b, m)` |
| Modular inverse | `pow(a, -1, m)` (Python 3.8+) |
| Combinations | `math.comb(n, k)` exactly; factorial tables mod p for many queries |
| Primes up to n | Sieve of Eratosthenes, O(n log log n) |
| Answer "modulo 10⁹ + 7" | Python never overflows, but reduce intermediate values anyway to keep numbers small and fast |

## 10.4 Practical lessons

- Use greedy only with an exchange argument; test against small counterexamples (coins 1, 3, 4).
- Bit tricks: `x & (x - 1)`, `x & -x`, XOR pairs cancel, masks enumerate subsets; mask for 32-bit behaviour.
- `math.gcd`, `math.isqrt`, `pow(a, b, m)`, `pow(a, -1, m)`, `math.comb`, the sieve.
