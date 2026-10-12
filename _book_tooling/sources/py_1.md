# Chapter 3: Binary Search, Sorting and Intervals
%One binary-search template, searching unusual arrays, binary search on the answer, sorting algorithms, custom sorts and interval problems

## 3.1 One template for every binary search

Most binary searches are "find the first index where a condition becomes true", for a condition that is false, false, ..., true, true. One template handles them all; `bisect` covers the common sorted-array cases.

```python run first_true, bisect equivalents, and an integer square root
import bisect, math

def first_true(lo, hi, cond):
    """Smallest x in [lo, hi] with cond(x) True (cond monotonic); hi + 1 if none."""
    while lo <= hi:
        mid = (lo + hi) // 2
        if cond(mid):
            hi = mid - 1
        else:
            lo = mid + 1
    return lo

a = [1, 3, 3, 3, 7, 9]
x = 3
left = first_true(0, len(a) - 1, lambda i: a[i] >= x)
right = first_true(0, len(a) - 1, lambda i: a[i] > x)
print('first index >= 3:', left, '| bisect_left:', bisect.bisect_left(a, x))
print('first index  > 3:', right, '| bisect_right:', bisect.bisect_right(a, x))
print('count of 3s:', right - left, '| 3 present:', left < len(a) and a[left] == x)
n = 10**18 + 12345
root = first_true(0, 10**9 + 1, lambda r: r * r > n) - 1
print('isqrt by search:', root, '| math.isqrt:', math.isqrt(n))
```

With `lo <= hi` and `hi = mid - 1` / `lo = mid + 1`, the loop always terminates, and `lo` ends at the first true index. Python's big integers make `mid * mid` safe; in Java the same code needs `long` or a division to avoid overflow.

## 3.2 Searching a rotated or unusual array

```python run Search in a rotated sorted array, and the minimum of a rotated array
def search_rotated(a, target):
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if a[mid] == target:
            return mid
        if a[lo] <= a[mid]:                         # left half sorted
            if a[lo] <= target < a[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:                                       # right half sorted
            if a[mid] < target <= a[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1

def rotated_min(a):
    lo, hi = 0, len(a) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if a[mid] > a[hi]:
            lo = mid + 1                            # minimum is to the right
        else:
            hi = mid
    return a[lo]

arr = [15, 18, 22, 3, 6, 9, 12]
print([search_rotated(arr, t) for t in (6, 15, 12, 7)], rotated_min(arr), rotated_min([1, 2,
        3]))
```

## 3.3 Binary search on the answer

When the answer is a number and "is x enough?" is monotonic, binary-search the answer itself: the smallest speed, capacity or time that works.

```python run Smallest ship capacity to deliver packages within d days
def days_needed(weights, cap):
    days, load = 1, 0
    for w in weights:
        if load + w > cap:
            days, load = days + 1, 0
        load += w
    return days

def min_capacity(weights, d):
    lo, hi = max(weights), sum(weights)          # bounds of the answer
    while lo < hi:
        mid = (lo + hi) // 2
        if days_needed(weights, mid) <= d:
            hi = mid
        else:
            lo = mid + 1
    return lo

w = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
for d in (1, 5, 10):
    cap = min_capacity(w, d)
    print(f'{d:>2} days -> capacity {cap} (check: {days_needed(w, cap)} days, '
          f'{days_needed(w, cap - 1) if cap > max(w) else "-"} with capacity - 1)')
```

The same template solves "Koko eating bananas", "minimum time to finish jobs with k workers", "split array largest sum" and "aggressive cows" (largest minimum distance). The work is in writing the check function and the bounds.

## 3.4 Sorting algorithms worth knowing

```python run Merge sort counting inversions, and quickselect for the k-th smallest
import random

def sort_count(a):
    """Merge sort that also counts pairs i < j with a[i] > a[j]."""
    if len(a) <= 1:
        return a, 0
    mid = len(a) // 2
    left, x = sort_count(a[:mid])
    right, y = sort_count(a[mid:])
    merged, i, j, inv = [], 0, 0, x + y
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i]); i += 1
        else:
            merged.append(right[j]); j += 1
            inv += len(left) - i   # all remaining left items exceed right[j]
    return merged + left[i:] + right[j:], inv

def quickselect(a, k, rnd=random.Random(0)):
    """k-th smallest (0-based), average O(n)."""
    pivot = rnd.choice(a)
    lows = [x for x in a if x < pivot]
    highs = [x for x in a if x > pivot]
    equal = len(a) - len(lows) - len(highs)
    if k < len(lows):
        return quickselect(lows, k)
    if k < len(lows) + equal:
        return pivot
    return quickselect(highs, k - len(lows) - equal)

data = [8, 4, 2, 1, 7, 3]
print(sort_count(data))
rnd = random.Random(3)
ok = True
for _ in range(200):
    v = [rnd.randint(0, 20) for _ in range(rnd.randint(1, 30))]
    brute = sum(v[i] > v[j] for i in range(len(v)) for j in range(i + 1, len(v)))
    k = rnd.randrange(len(v))
    ok &= sort_count(v) == (sorted(v), brute) and quickselect(v, k) == sorted(v)[k]
print('inversions and quickselect match brute force on 200 arrays:', ok)
```

| Algorithm | Time | Space | Stable | Note |
|---|---|---|---|---|
| Merge sort | O(n log n) always | O(n) | Yes | Counting inversions, external sorting |
| Quicksort | O(n log n) average, O(n²) worst | O(log n) | No | Random pivots avoid the worst case |
| Heapsort | O(n log n) | O(1) | No | |
| Counting / radix sort | O(n + k) | O(n + k) | Yes | Small integer ranges |
| Timsort (Python's `sort`) | O(n log n), O(n) on nearly sorted data | O(n) | Yes | Use it unless the problem asks otherwise |

## 3.5 Custom sorting

```python run Tuple keys, reverse with stability, and cmp_to_key for "largest number"
from functools import cmp_to_key
people = [('Ravi', 25), ('Asha', 31), ('Meera', 25), ('Kiran', 31)]
print(sorted(people, key=lambda p: (-p[1], p[0])))          # age descending, then name
print(sorted(people, key=lambda p: p[1], reverse=True))     # stable: ties keep input order

def largest_number(nums):
    strs = [str(n) for n in nums]
    strs.sort(key=cmp_to_key(lambda a, b: -1 if a + b > b + a else (1 if a + b < b + a
            else 0)))
    return ''.join(strs).lstrip('0') or '0'
print(largest_number([3, 30, 34, 5, 9]), largest_number([0, 0]))
words = ['banana', 'apple', 'Cherry', 'fig']
print(sorted(words))                    # uppercase sorts before lowercase
print(sorted(words, key=str.lower))     # case-insensitive
print(sorted(words, key=len))           # by length; ties keep input order
```

Python sorts compare keys, not comparator functions; when the order depends on comparing pairs (as in "largest number": is "3" + "30" bigger than "30" + "3"?), wrap a comparator with `functools.cmp_to_key`.

## 3.6 Interval problems

```python run Merge intervals, insert an interval, and minimum meeting rooms with a heap
import heapq

def merge(intervals):
    out = []
    for s, e in sorted(intervals):
        if out and s <= out[-1][1]:
            out[-1][1] = max(out[-1][1], e)
        else:
            out.append([s, e])
    return out

def insert(intervals, new):
    return merge(intervals + [new])   # O(n log n); an O(n) scan is also possible

def min_rooms(meetings):
    ends, rooms = [], 0
    for s, e in sorted(meetings):
        if ends and ends[0] <= s:
            heapq.heapreplace(ends, e)            # reuse the room that frees earliest
        else:
            heapq.heappush(ends, e)
        rooms = max(rooms, len(ends))
    return rooms

print(merge([[1, 3], [2, 6], [8, 10], [15, 18], [17, 20]]))
print(insert([[1, 2], [3, 5], [6, 7], [8, 10]], [4, 8]))
print(min_rooms([(0, 30), (5, 10), (15, 20)]), min_rooms([(7, 10), (2, 4)]))
```

## 3.7 Practical lessons

- One template: find the first index where a monotonic condition becomes true; `bisect` for sorted lists.
- Rotated arrays: one half around `mid` is always sorted.
- Binary search on the answer when "is x enough?" is monotonic; bounds plus a check function.
- Merge sort counts inversions; quickselect finds the k-th smallest in average O(n).
- Sort with tuple keys; use `cmp_to_key` for pairwise orders; intervals: sort by start, then sweep or heap.

# Chapter 4: Linked Lists, Stacks and Queues
%Linked-list technique with a dummy node, fast and slow pointers, stacks for matching and evaluation, monotonic stacks and deques

## 4.1 Linked-list technique

```python run Reverse, merge two sorted lists, and remove the n-th node from the end
class ListNode:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def build(values):
    head = None
    for v in reversed(values):
        head = ListNode(v, head)
    return head

def to_list(node):
    out = []
    while node:
        out.append(node.val); node = node.next
    return out

def reverse(head):
    prev = None
    while head:
        head.next, prev, head = prev, head, head.next      # three-way swap in one line
    return prev

def merge_sorted(a, b):
    dummy = tail = ListNode(0)                  # a dummy node removes special cases
    while a and b:
        if a.val <= b.val:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a or b
    return dummy.next

def remove_nth_from_end(head, n):
    dummy = ListNode(0, head)
    fast = slow = dummy
    for _ in range(n + 1):
        fast = fast.next
    while fast:
        fast, slow = fast.next, slow.next
    slow.next = slow.next.next
    return dummy.next

print(to_list(reverse(build([1, 2, 3, 4]))))
print(to_list(merge_sorted(build([1, 4, 6]), build([2, 3, 7, 8]))))
print(to_list(remove_nth_from_end(build([1, 2, 3, 4, 5]), 2)),
        to_list(remove_nth_from_end(build([1]), 1)))
```

> TRAP: In Python's tuple assignment `head.next, prev, head = prev, head, head.next`, the right side is evaluated first, then targets are assigned **left to right**. Reordering the targets (for example `head, head.next = ...`) changes which object `.next` refers to and breaks the list.

## 4.2 Fast and slow pointers

```python run Cycle detection, the cycle's entry, and the middle node
class Node:
    def __init__(self, val):
        self.val, self.next = val, None

nodes = [Node(i) for i in range(8)]
for a, b in zip(nodes, nodes[1:]):
    a.next = b
nodes[-1].next = nodes[3]                       # 7 -> 3 creates a cycle

def cycle_entry(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:                        # they met inside the cycle
            slow = head
            while slow is not fast:
                slow, fast = slow.next, fast.next
            return slow.val
    return None

def middle(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    return slow.val

print('cycle starts at node', cycle_entry(nodes[0]))
nodes[-1].next = None
print('no cycle ->', cycle_entry(nodes[0]), '| middle of 8 nodes:', middle(nodes[0]))
```

Floyd's algorithm: after the pointers meet, moving one back to the head and stepping both one node at a time makes them meet exactly at the cycle's entry (a short distance argument shows the head-to-entry distance equals the meeting-point-to-entry distance modulo the cycle length). For an even number of nodes, this `middle` returns the second of the two middle nodes.

## 4.3 Stacks: matching and evaluation

```python run Valid brackets, reverse Polish notation, and decoding k[string]
def valid(s):
    pairs, stack = {')': '(', ']': '[', '}': '{'}, []
    for ch in s:
        if ch in '([{':
            stack.append(ch)
        elif not stack or stack.pop() != pairs[ch]:
            return False
    return not stack

def rpn(tokens):
    stack = []
    for t in tokens:
        if t in '+-*/':
            b, a = stack.pop(), stack.pop()
            stack.append(a + b if t == '+' else a - b if t == '-' else a * b if t == '*'
                         else int(a / b))          # truncate towards zero, as specified
        else:
            stack.append(int(t))
    return stack[0]

def decode(s):
    stack, num, cur = [], 0, ''
    for ch in s:
        if ch.isdigit():
            num = num * 10 + int(ch)
        elif ch == '[':
            stack.append((cur, num)); cur, num = '', 0
        elif ch == ']':
            prev, k = stack.pop()
            cur = prev + cur * k
        else:
            cur += ch
    return cur

print([valid(s) for s in ['()[]{}', '([)]', '{[]}', '((']])
print(rpn(['2', '1', '+', '3', '*']), rpn(['4', '13', '5', '/', '+']), rpn(['7', '-3',
        '/']))
print(decode('3[a]2[bc]'), decode('2[a2[c]]'))
```

`int(a / b)` truncates towards zero (−7 / 3 → −2), which is what most evaluation problems specify; `a // b` would floor to −3 (Chapter 1).

## 4.4 The monotonic stack

A stack kept in increasing or decreasing order answers "next greater/smaller element" questions for every index in O(n) total, because each index is pushed and popped once.

```python run Next greater element, daily temperatures, and the largest rectangle in a histogram
def next_greater(a):
    out, stack = [-1] * len(a), []             # stack of indices with decreasing values
    for i, x in enumerate(a):
        while stack and a[stack[-1]] < x:
            out[stack.pop()] = x
        stack.append(i)
    return out

def days_until_warmer(t):
    out, stack = [0] * len(t), []
    for i, x in enumerate(t):
        while stack and t[stack[-1]] < x:
            j = stack.pop(); out[j] = i - j
        stack.append(i)
    return out

def largest_rectangle(h):
    stack, best = [], 0
    for i, x in enumerate(h + [0]):            # a final 0 flushes the stack
        start = i
        while stack and stack[-1][1] >= x:
            j, height = stack.pop()
            best = max(best, height * (i - j))
            start = j
        stack.append((start, x))
    return best

print(next_greater([2, 1, 2, 4, 3]))
print(days_until_warmer([73, 74, 75, 71, 69, 72, 76, 73]))
print(largest_rectangle([2, 1, 5, 6, 2, 3]), largest_rectangle([2, 4]))
```

## 4.5 Queues, deques and the sliding-window maximum

```python run BFS-style queue use, and the maximum of every window of size k in O(n)
from collections import deque
import random

def window_max(a, k):
    dq, out = deque(), []   # indices; values decreasing from front to back
    for i, x in enumerate(a):
        while dq and a[dq[-1]] <= x:
            dq.pop()   # smaller values can never be a future maximum
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()                       # front index left the window
        if i >= k - 1:
            out.append(a[dq[0]])
    return out

print(window_max([1, 3, -1, -3, 5, 3, 6, 7], 3))
rnd = random.Random(4)
ok = all(window_max(v, k) == [max(v[i:i + k]) for i in range(len(v) - k + 1)]
         for v, k in (([rnd.randint(-9, 9) for _ in range(rnd.randint(5, 25))],
                 rnd.randint(1, 5))
                      for _ in range(300)))
print('matches brute force on 300 tests:', ok)
```

## 4.6 Practical lessons

- Use a dummy head node to avoid special cases; draw pointers before coding.
- Fast and slow pointers find cycles, cycle entries, middles and k-th-from-end nodes.
- Stacks match brackets and evaluate expressions; monotonic stacks answer next-greater/smaller in O(n).
- A monotonic deque gives the sliding-window maximum in O(n); a plain `deque` is the BFS queue.
