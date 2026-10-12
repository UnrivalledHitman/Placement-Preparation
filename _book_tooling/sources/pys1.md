# Solutions
%Every solution executed; most are checked against a brute-force version on random inputs

## Part 1 solutions

### D1.1 First repeated element

```python run A set gives O(1) average membership
import random, time

def first_repeat(nums):
    seen = set()
    for x in nums:
        if x in seen:
            return x
        seen.add(x)
    return None

def first_repeat_list(nums):
    seen = []
    for x in nums:
        if x in seen:
            return x
        seen.append(x)
    return None

print(first_repeat([3, 1, 4, 1, 5, 3]), first_repeat([1, 2, 3]), first_repeat([]))
data = list(range(4000)) + [0]
for f in (first_repeat, first_repeat_list):
    t = time.perf_counter()
    r = f(data)
    print(f'{f.__name__:18} -> {r}  {time.perf_counter() - t:.4f} s')
```

The answer is 1, not 3: 1 is the first value to be *seen a second time*, even though 3 appears earlier. `x in list` scans the list, so n lookups cost O(n²) in total. The timings show the list version is far slower on only 4,000 items, and the gap grows quadratically.

### D1.2 Predict the traps

```python run Five classic surprises
grid = [[0] * 2] * 2
grid[0][0] = 9
print('grid:', grid)
print('-9 // 4 =', -9 // 4, '  -9 % 4 =', -9 % 4, '  int(-9 / 4) =', int(-9 / 4))

def add(x, bucket=[]):
    bucket.append(x)
    return bucket

print(add(1), add(2))
nums = [3, 1, 2]
print('sorted:', sorted(nums), 'nums still', nums, '| nums.sort() returns', nums.sort())
print('after sort:', nums)
```

Both rows change because `* 2` copies the reference to one inner list; use `[[0] * 2 for _ in range(2)]`. `//` floors towards −∞ (−3, unlike Java's −2), and `%` takes the sign of the divisor, so `-9 % 4` is 3. The default list is created once when the function is defined, so the second call sees the first call's item. Both prints show `[1, 2]`, because they are the same list object. `sort` works in place and returns `None`.

The last line holds a sixth surprise: "nums still" prints `[1, 2, 3]`, not `[3, 1, 2]`. `print` evaluates all its arguments before printing anything, and `nums` is a reference to the list, so by the time it is printed `nums.sort()` (a later argument) has already sorted it. Never mutate an object in the same expression that displays it.

### D1.3 Product except self

```python run Prefix products, then suffix products in place
import random
from math import prod

def product_except_self(nums):
    n = len(nums)
    out = [1] * n
    left = 1
    for i in range(n):
        out[i] = left
        left *= nums[i]
    right = 1
    for i in range(n - 1, -1, -1):
        out[i] *= right
        right *= nums[i]
    return out

print(product_except_self([1, 2, 3, 4]), product_except_self([2, 0, 3, 0]),
      product_except_self([5, 0, 2]))
for _ in range(500):
    a = [random.randint(-4, 4) for _ in range(random.randint(1, 8))]
    assert product_except_self(a) == [prod(a[:i] + a[i + 1:]) for i in range(len(a))]
print('500 random lists match brute force')
```

The two passes multiply "everything to the left" by "everything to the right". Zeros need no special case, which is exactly why division is banned (a single zero would break `total // x`).

### D1.4 Longest subarray with sum k

```python run Prefix sums, keeping the earliest index
import random

def longest_sum_k(nums, k):
    first = {0: -1}
    total = best = 0
    for i, x in enumerate(nums):
        total += x
        if total - k in first:
            best = max(best, i - first[total - k])
        first.setdefault(total, i)
    return best

def brute(nums, k):
    return max([j - i for i in range(len(nums)) for j in range(i + 1, len(nums) + 1)
                if sum(nums[i:j]) == k], default=0)

print(longest_sum_k([1, -1, 5, -2, 3], 3), longest_sum_k([-2, -1, 2, 1], 1),
      longest_sum_k([1, 2], 7))
for _ in range(500):
    a = [random.randint(-3, 3) for _ in range(random.randint(0, 9))]
    k = random.randint(-3, 3)
    assert longest_sum_k(a, k) == brute(a, k), (a, k)
print('500 random cases match brute force')
```

`setdefault` stores a prefix sum only the first time it appears, and the earliest start gives the longest subarray. A sliding window would fail here because negative values break the "grow to increase, shrink to decrease" rule.

### D1.5 At most k distinct characters

```python run Variable window with a Counter
import random
from collections import Counter

def longest_k_distinct(s, k):
    count = Counter()
    left = best = 0
    for right, ch in enumerate(s):
        count[ch] += 1
        while len(count) > k:
            count[s[left]] -= 1
            if count[s[left]] == 0:
                del count[s[left]]
            left += 1
        best = max(best, right - left + 1)
    return best

def brute(s, k):
    return max([j - i for i in range(len(s)) for j in range(i + 1, len(s) + 1)
                if len(set(s[i:j])) <= k], default=0)

print(longest_k_distinct('eceba', 2), longest_k_distinct('aaabbccd', 2),
      longest_k_distinct('abc', 0))
for _ in range(500):
    s = ''.join(random.choice('abcd') for _ in range(random.randint(0, 10)))
    k = random.randint(0, 3)
    assert longest_k_distinct(s, k) == brute(s, k), (s, k)
print('500 random cases match brute force')
```

The `del` matters: a key whose count drops to 0 still counts towards `len(count)`. Forgetting it is the most common bug in this pattern. Each character enters and leaves the window at most once, so the whole scan is O(n).

### D1.6 Trapping rain water

```python run Two pointers moving inwards
import random

def trap(h):
    left, right = 0, len(h) - 1
    left_max = right_max = water = 0
    while left < right:
        if h[left] < h[right]:
            left_max = max(left_max, h[left])
            water += left_max - h[left]
            left += 1
        else:
            right_max = max(right_max, h[right])
            water += right_max - h[right]
            right -= 1
    return water

def brute(h):
    return sum(max(0, min(max(h[:i + 1]), max(h[i:])) - h[i]) for i in range(len(h)))

print(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]), trap([4, 2, 0, 3, 2, 5]), trap([]))
for _ in range(500):
    h = [random.randint(0, 5) for _ in range(random.randint(0, 12))]
    assert trap(h) == brute(h), h
print('500 random cases match brute force')
```

Water above bar i is `min(max_left, max_right) − h[i]`. When `h[left] < h[right]`, a taller bar exists on the right, so the left maximum alone decides the water at `left`. That is why we only need one running maximum per side.

## Part 2 solutions

### D2.1 Koko eating bananas

```python run Binary search on the answer
import random

def min_speed(piles, h):
    def hours(k):
        return sum(-(-p // k) for p in piles)
    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        if hours(mid) <= h:
            hi = mid
        else:
            lo = mid + 1
    return lo

def brute(piles, h):
    return next(k for k in range(1, max(piles) + 1)
                if sum(-(-p // k) for p in piles) <= h)

print(min_speed([3, 6, 7, 11], 8), min_speed([30, 11, 23, 4, 20], 5),
      min_speed([30, 11, 23, 4, 20], 6))
for _ in range(500):
    piles = [random.randint(1, 30) for _ in range(random.randint(1, 6))]
    h = random.randint(len(piles), 40)
    assert min_speed(piles, h) == brute(piles, h)
print('500 random cases match brute force')
```

`-(-p // k)` is the integer ceiling without floats. "Finishes within h hours" is monotonic in k (faster never hurts), so we search for the first k where it becomes true. That is O(n log max) instead of O(n · max).

### D2.2 First and last position

```python run bisect_left and bisect_right
from bisect import bisect_left, bisect_right

def search_range(a, target):
    lo = bisect_left(a, target)
    if lo == len(a) or a[lo] != target:
        return (-1, -1)
    return (lo, bisect_right(a, target) - 1)

a = [1, 2, 2, 2, 4, 7, 7]
for t in (2, 7, 1, 3, 9):
    print(t, search_range(a, t))
print(search_range([], 5))
```

`bisect_left` returns the first index where the target could be inserted, and `bisect_right` the index after the last copy. Check `lo == len(a)` before reading `a[lo]`, otherwise a target larger than everything raises `IndexError`.

### D2.3 Fewest removals for no overlap

```python run Greedy by earliest end, checked by trying every subset
import random
from itertools import combinations

def min_removals(intervals):
    kept, end = 0, float('-inf')
    for s, e in sorted(intervals, key=lambda iv: iv[1]):
        if s >= end:
            kept += 1
            end = e
    return len(intervals) - kept

def brute(intervals):
    n = len(intervals)
    for keep in range(n, -1, -1):
        for combo in combinations(sorted(intervals), keep):
            if all(combo[i][1] <= combo[i + 1][0] for i in range(len(combo) - 1)):
                return n - keep

print(min_removals([[1, 2], [2, 3], [3, 4], [1, 3]]), min_removals([[1, 2]] * 3),
      min_removals([[1, 2], [2, 3]]))
for _ in range(300):
    ivs = []
    for _ in range(random.randint(0, 7)):
        s = random.randint(0, 8)
        ivs.append([s, s + random.randint(1, 4)])
    assert min_removals(ivs) == brute(ivs), ivs
print('300 random cases match the exhaustive search')
```

Keeping the interval that ends earliest leaves the most room for the rest, and the exchange argument in the guide proves it. Sorting by **start** is the classic wrong version. It keeps `[1, 10]` and then has to remove `[2, 3]` and `[4, 5]`.

### D2.4 Add two numbers

```python run Carry through two lists with a dummy head
import random

class Node:
    def __init__(self, val, nxt=None):
        self.val, self.next = val, nxt

def from_int(n):
    head = None
    for d in str(n):
        head = Node(int(d), head)
    return head

def to_int(node):
    digits = []
    while node:
        digits.append(str(node.val))
        node = node.next
    return int(''.join(reversed(digits)))

def add(a, b):
    dummy = tail = Node(0)
    carry = 0
    while a or b or carry:
        total = carry + (a.val if a else 0) + (b.val if b else 0)
        carry, digit = divmod(total, 10)
        tail.next = tail = Node(digit)
        a = a.next if a else None
        b = b.next if b else None
    return dummy.next

print(to_int(add(from_int(342), from_int(465))), to_int(add(from_int(999), from_int(1))),
      to_int(add(from_int(0), from_int(0))))
for _ in range(500):
    x, y = random.randint(0, 10**6), random.randint(0, 10**6)
    assert to_int(add(from_int(x), from_int(y))) == x + y
print('500 random sums correct')
```

The loop condition includes `carry`, which produces the extra digit in 999 + 1 = 1000. `tail.next = tail = Node(digit)` assigns left to right: first `tail.next`, then `tail`. That order is what we want, but many people find the two-line version clearer.

### D2.5 Minimum stack

```python run Each entry remembers the minimum below it
class MinStack:
    def __init__(self):
        self.items = []

    def push(self, x):
        low = min(x, self.items[-1][1]) if self.items else x
        self.items.append((x, low))

    def pop(self):
        return self.items.pop()[0]

    def top(self):
        return self.items[-1][0]

    def get_min(self):
        return self.items[-1][1]

s = MinStack()
for x in (5, 3, 7, 3, 1):
    s.push(x)
    print(f'push {x}: min {s.get_min()}')
while s.items:
    print(f'pop {s.pop()}: min {s.get_min() if s.items else None}')
```

Storing the minimum with each entry means popping automatically restores the previous minimum. Duplicates (the two 3s) need no special handling, unlike the version with a separate stack of minimums.

### D2.6 Sum of subarray minimums

```python run Contribution counting with two monotonic stacks
import random

MOD = 10**9 + 7

def sum_subarray_mins(a):
    n = len(a)
    left, right = [0] * n, [0] * n
    stack = []
    for i in range(n):
        while stack and a[stack[-1]] > a[i]:
            stack.pop()
        left[i] = i - (stack[-1] if stack else -1)
        stack.append(i)
    stack = []
    for i in range(n - 1, -1, -1):
        while stack and a[stack[-1]] >= a[i]:
            stack.pop()
        right[i] = (stack[-1] if stack else n) - i
        stack.append(i)
    return sum(a[i] * left[i] * right[i] for i in range(n)) % MOD

def brute(a):
    return sum(min(a[i:j]) for i in range(len(a)) for j in range(i + 1, len(a) + 1)) % MOD

print(sum_subarray_mins([3, 1, 2, 4]), sum_subarray_mins([2, 2, 2]))
for _ in range(500):
    a = [random.randint(1, 5) for _ in range(random.randint(1, 9))]
    assert sum_subarray_mins(a) == brute(a), a
print('500 random cases match brute force')
```

Element i is the minimum of `left[i] × right[i]` subarrays. The asymmetry, strict `>` on one side and `>=` on the other, assigns each subarray with equal minimums to exactly one element. Using the same test on both sides breaks `[2, 2, 2]`: `>=` twice gives 20 (subarrays counted twice) and `>` twice gives 6 (subarrays missed), instead of 12.
