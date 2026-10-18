# Answers and worked solutions
%Every set's answer key, a short solution for each question, and a program that recomputes the answers

## Solutions: Set D1

| Q | Answer | Q | Answer | Q | Answer |
|---|---|---|---|---|---|
| E1 | B | M1 | 21 | H1 | 7 |
| E2 | 7 | M2 | B | H2 | D |
| E3 | C | M3 | B, D | H3 | 4 |
| E4 | 6 | M4 | 14 | H4 | B, D |
| E5 | B, C | M5 | D | H5 | B |
| E6 | 18 | M6 | 9 | H6 | 135 |
| E7 | D | M7 | A, B | H7 | A, C |
| E8 | A, B | M8 | D | | |
| | | M9 | B, D | | |

**E1.** `y` names the same list, and `+=` extends it in place, so x has 4 elements.

**E2.** 17 // 5 = 3 and 17 % 5 = 2, so 3 + 2 × 2 = 7 (multiplication before addition).

**E3.** `a.reverse()` reverses in place and returns None; `reversed(a)` is an iterator, not a list; sorting is not reversing. Only the slice builds a new reversed list.

**E4.** Indices 2 to 7: six characters ('tascie').

**E5.** Lists and dicts are mutable; tuples and strings are not.

**E6.** 3 + 6 + 9 = 18.

**E7.** `in` on a dict tests keys: 'b' is a key, 2 is only a value.

**E8.** Floor division gives −4; 1.0 == 1 is True; `3 * '2'` is '222'; list repetition gives [1, 1, 1]. `[1] * 3` is `[1, 1, 1]`, not `[3]`.

**M1.** f(0) = 0, f(1) = 1, then f(n) = f(n − 1) + 2f(n − 2): 1, 3, 5, 11, 21.

**M2.** The default list is shared: after g(1) it holds [1] (sum 1), after g(2) it holds [1, 4] (sum 5). The third call passes a fresh list: [9].

**M3.** Each call of `make` creates its own `total`. a gives 5, then 8; b starts from 0 and gives 4.

**M4.** `L[1::3]` takes indices 1, 4 and 7: 1 + 5 + 6 = 12, and L[−2] = 2. Total 14.

**M5.** `k` sees the enclosing `x = 1` of `h`, so h() returns 10; the global x is 5. Total 15.

**M6.** Pairs with i ≤ j < 5 and i + j even: 3 for i = 0, 2 for i = 1, 2 for i = 2, 1 for i = 3, 1 for i = 4. Total 9.

**M7.** A − B = {1, 2}; A ^ B = {1, 2, 5}; A & B = {3, 4}; A | B has 5 elements.

**M8.** x = 0 gives nothing; x = 1 gives 1 × 0; x = 2 gives 2 × 0 and 2 × 1: [0, 0, 2].

**M9.** `sorted` is stable and returns a new list: lengths 1, 2, 2, 3 keep 'bb' before 'dd'. Sorting by last letter in reverse gives d, c, b, a.

**H1.** f(2, 13) → f(2, 12) → f(2, 6) → f(2, 3) → f(2, 2) → f(2, 1) → f(2, 0): 7 calls. Fast exponentiation makes O(log b) calls.

**H2.** All right sides use the old values: B + C = [2, 3], C + A = [3, 1], A + B = [1, 2].

**H3.** Each call is one bubble-sort pass returning its swap count: 3, then 2, then 1, then 0. The loop stops after the fourth call.

**H4.** `next` consumes 1; `list(it)` consumes the rest; the exhausted iterator then gives an empty list. b is [2, 3, 4], because `next` already consumed 1.

**H5.** The lambdas look up `i` when called, after the loop has finished with i = 2 (late binding): [4, 4, 4].

**H6.** For i < 5 the inner loop breaks, so its `else` is skipped; for i = 5 it finishes and adds 100. Sum of j ≤ i: 1 + 3 + 6 + 10 + 15 = 35, so 135.

**H7.** d maps 0 to 6 to remainders 0, 1, 2, 0, 1, 2, 0. e groups keys by remainder: {0: [0, 3, 6], 1: [1, 4], 2: [2, 5]}, so it has 3 keys and e[1] is [1, 4].

```python run Running every D1 code question
x = [1, 2, 3]; y = x; y += [4]
print('E1', len(x), '| E2', 17 // 5 + 17 % 5 * 2, '| E4', len('datascience'[2:8]),
      '| E6', sum(i for i in range(1, 11) if i % 3 == 0))
d = {'a': 1, 'b': 2}
print('E7', 'b' in d, 2 in d, '| E8', -7 // 2 == -4, 7 / 7 == 1, 3 * '2' == '6',
        [1] * 3 == [1, 1, 1])

def f(n):
    if n <= 1:
        return n
    return f(n - 1) + 2 * f(n - 2)

def g(x, acc=[]):
    acc.append(x * x)
    return sum(acc)

print('M1', f(6), '| M2', g(1), g(2), g(3, []))

def make():
    total = 0
    def add(v):
        nonlocal total
        total += v
        return total
    return add

a, b = make(), make()
r1 = a(5); r2 = a(3); r3 = b(4)
L = [3, 1, 4, 1, 5, 9, 2, 6]
print('M3', r1, r2, r3, '| M4', sum(L[1::3]) + L[-2])
xg = 5

def h():
    xg = 1
    def k():
        return xg * 10
    return k()

count = 0
for i in range(5):
    for j in range(i, 5):
        if (i + j) % 2 == 0:
            count += 1
A, B = {1, 2, 3, 4}, {3, 4, 5}
print('M5', h() + xg, '| M6', count, '| M7', A - B, A ^ B, A & B, len(A | B),
      '| M8', [x * y for x in range(3) for y in range(x)])
words = ['bb', 'a', 'ccc', 'dd']
r = sorted(words, key=len)
words.sort(key=lambda w: w[-1], reverse=True)
print('M9', r, words)
calls = 0

def fp(a, b):
    global calls
    calls += 1
    if b == 0:
        return 1
    if b % 2 == 0:
        hh = fp(a, b // 2)
        return hh * hh
    return a * fp(a, b - 1)

print('H1 value', fp(2, 13), 'calls', calls)
A, B, C = [1], [2], [3]
A, B, C = B + C, C + A, A + B
print('H2', A, B, C)
passes = 0

def fun(L, i=0):
    if i >= len(L) - 1:
        return 0
    if L[i] > L[i + 1]:
        L[i], L[i + 1] = L[i + 1], L[i]
        return 1 + fun(L, i + 1)
    return fun(L, i + 1)

data = [4, 2, 5, 1, 3]
while True:
    passes += 1
    if fun(data) == 0:
        break
print('H3 calls', passes, data)
it = iter([1, 2, 3, 4]); a1 = next(it); b1 = list(it); c1 = list(it)

def outer():
    fs = []
    for i in range(3):
        fs.append(lambda: i * i)
    return [f() for f in fs]

print('H4', a1, b1, c1, '| H5', outer())
x = 0
for i in range(1, 6):
    for j in range(1, 6):
        if j > i:
            break
        x += j
    else:
        x += 100
dd = {k: k % 3 for k in range(7)}
e = {}
for k, v in dd.items():
    e.setdefault(v, []).append(k)
print('H6', x, '| H7', len(dd), e)
```

The checking program renames a few variables (`xg`, `fp`) so that the questions do not interfere with each other; the logic is unchanged.

## Solutions: Set D2

| Q | Answer | Q | Answer | Q | Answer |
|---|---|---|---|---|---|
| E1 | A | M1 | 14 | H1 | 42 |
| E2 | 9 | M2 | D | H2 | A |
| E3 | D | M3 | C, D | H3 | A |
| E4 | 31 | M4 | 3 | H4 | 4 |
| E5 | A, D | M5 | C | H5 | A |
| E6 | 4 | M6 | 16 | H6 | 4 |
| E7 | A | M7 | A, B | H7 | B, D |
| E8 | A, B, D | M8 | A | | |
| | | M9 | 2.5 | | |

**E1.** Pops remove 3, then 4, then 2; 1 remains.

**E2.** Dequeue removes 5, enqueue adds 11 at the back, the next dequeue removes 7, so 9 is at the front.

**E3.** In-order visits left subtree, node, right subtree, which is ascending order in a BST.

**E4.** 2⁵ − 1 = 31.

**E5.** Head operations are O(1); reaching the k-th node or the tail takes O(n) without a tail pointer.

**E6.** ⌊(10 − 1)/2⌋ = 4.

**E7.** A FIFO queue.

**E8.** All four keys hash to 3. 10 takes 3, 17 probes to 4, 24 to 5, and 3 to 6.

**M1.** Catalan(4) = 14.

**M2.** A is the root; in-order splits D B E (left) and F C (right). The left subtree is B with children D and E; the right is C with left child F. Post-order: D E B F C A.

**M3.** 2, 1, 4, 3: push 1, 2, pop 2, pop 1, push 3, 4, pop 4, pop 3. 4, 3, 2, 1: push all, pop all. 3, 1, …: after popping 3, the stack has 2 above 1, so 1 cannot come next. 1, 4, 2, …: after popping 4, 3 is above 2.

**M4.** The path 50 → 30 → 40 → 35 has 3 edges.

**M5.** Remove 2, move the last element 4 to the root: [4, 5, 3, 9, 6]. Swap with the smaller child 3: [3, 5, 4, 9, 6].

**M6.** Leaves = internal nodes + 1 = 16.

**M7.** A min-heap's maximum is at some leaf, so finding it takes Θ(n). Bottom-up heap construction takes O(n), so Θ(n log n) is not needed.

**M8.** 2 + 3 = 5, 6 × 5 = 30, 30 − 4 = 26.

**M9.** α = 25/10 = 2.5.

**H1.** Catalan(5) = 42.

**H2.** Root 8; the keys below 8 (5 2 6) form the left subtree, rooted at 5 with children 2 and 6; the right subtree is 12 with children 10 and 15. Post-order: 2 6 5 10 15 12 8.

**H3.** n leaves give n − 1 internal nodes, 2n − 1 nodes and 2n − 2 edges. The height can be as large as n − 1 (a "caterpillar"), so (B) fails. It has 2n − 2 edges, not 2n. It has 2n − 1 nodes, not 2n + 1.

**H4.** 22 → 0; 33 → 0, 1; 44 → 0, 1, 2; 12 → 1, 2, 3. Then 23 hashes to 1 and examines 1, 2, 3, 4: four slots.

**H5.** Catalan(3) = 5 shapes, each with exactly one valid key placement.

**H6.** The maximum has no children, so it is a leaf; indices 3 to 6 are the leaves, and any of them is possible.

**H7.** Each element is pushed twice and popped twice at most, so the amortised cost is O(1), but one dequeue that triggers a transfer costs Θ(n). Enqueue is always O(1). Each element moves from the in-stack to the out-stack exactly once, not twice.

```python run Recomputing Set D2
from math import comb
from itertools import permutations

st = [1, 2, 3]; st.pop(); st.append(4); st.pop(); st.pop()
print('E1', st, '| E4', 2 ** 5 - 1, '| E6', (10 - 1) // 2)

def probe(keys, size):
    t, probes = [None] * size, {}
    for k in keys:
        i, n = k % size, 1
        while t[i] is not None:
            i = (i + 1) % size; n += 1
        t[i] = k; probes[k] = (i, n)
    return probes

print('E8', probe([10, 17, 24, 3], 7), '| H4', probe([22, 33, 44, 12, 23], 11)[23])
cat = lambda n: comb(2 * n, n) // (n + 1)

def stack_ok(seq):
    st, nxt = [], 1
    for x in seq:
        while nxt <= x:
            st.append(nxt); nxt += 1
        if st[-1] != x:
            return False
        st.pop()
    return True

print('M1', cat(4), '| H1', cat(5), sum(stack_ok(p) for p in permutations(range(1, 6))),
      '| M3', [stack_ok(s) for s in ([2, 1, 4, 3], [3, 1, 4, 2], [4, 3, 2, 1], [1, 4, 2,
              3])])

def insert(t, k):
    if t is None:
        return [k, None, None]
    t[1 if k < t[0] else 2] = insert(t[1 if k < t[0] else 2], k)
    return t

height = lambda t: -1 if t is None else 1 + max(height(t[1]), height(t[2]))
root = None
for k in [50, 30, 70, 20, 40, 60, 80, 35]:
    root = insert(root, k)
import heapq
hp = [2, 5, 3, 9, 6, 4]; heapq.heappop(hp)
print('M4', height(root), '| M5', hp, '| M8', 6 * (2 + 3) - 4)

def post_from_pre_bst(pre):
    if not pre:
        return []
    r = pre[0]
    return post_from_pre_bst([x for x in pre[1:] if x < r]) + post_from_pre_bst([x
            for x in pre[1:] if x > r]) + [r]

print('H2', post_from_pre_bst([8, 5, 2, 6, 12, 10, 15]), '| H5', cat(3))
```

## Solutions: Set D3

| Q | Answer | Q | Answer | Q | Answer |
|---|---|---|---|---|---|
| E1 | C | M1 | 5 | H1 | 4 |
| E2 | 28 | M2 | A | H2 | C |
| E3 | B | M3 | B, D | H3 | 15 |
| E4 | 2 | M4 | 15 | H4 | B, D |
| E5 | B, C | M5 | B | H5 | D |
| E6 | 6 | M6 | 3 | H6 | 45 |
| E7 | A | M7 | A, B, D | H7 | A, B, C |
| E8 | 50 | M8 | C | | |
| | | M9 | 2 | | |

**E1.** It needs O(1) access to the middle element. **E2.** 8 × 7/2 = 28. **E3.** Sorted input: one comparison per element. **E4.** (3, 1) and (3, 2).

**E5.** Selection sort's long-distance swap can reorder equal keys. Heap sort is not stable either.

**E6.** ⌊log₂ 63⌋ + 1 = 6. **E7.** Θ(n log n) in every case. **E8.** 50.

**M1.** Inversions: (4, 3), (4, 1), (4, 2), (3, 1), (3, 2) = 5.

**M2.** Each partition peels off only the pivot: T(n) = T(n − 1) + Θ(n), which is Θ(n²).

**M3.** Pass 1 swaps (5, 1), (5, 4), (5, 2): [1, 4, 2, 5, 8], 3 swaps. Pass 2 swaps only (4, 2): [1, 2, 4, 5, 8], 1 swap, and the array is sorted. Pass 1 makes 3 swaps, not 4.

**M4.** m + n − 1 = 15.

**M5.** a = 4, b = 2, d = 2: log₂ 4 = 2 = d, so Θ(n² log n).

**M6.** 1 vs 2 (swap; 1 reaches the front, no further comparison), 3 vs 2, 4 vs 3: 3 comparisons.

**M7.** Insertion sort makes one comparison per element. Selection sort always makes n(n − 1)/2. Bubble sort with early exit stops after one pass of n − 1 comparisons. The quicksort sends everything right of the pivot, giving the worst case.

**M8.** Compare elements in pairs, then the smaller ones for the minimum and the larger ones for the maximum: ⌈3n/2⌉ − 2 = 148.

**M9.** [3, 1, 2] → swap 3 and 1 → [1, 3, 2] → swap 3 and 2 → [1, 2, 3]: 2 swaps.

**H1.** mid = 7, then 3, then 1, then 0: four comparisons.

**H2.** The median-of-medians selection algorithm runs in O(n) worst case.

**H3.** The first six elements are in reverse order: C(6, 2) = 15; 7 adds none.

**H4.** The swaps equal the number of earlier elements larger than x, so x must be smaller than exactly 6, 8 and 10: 4 < x < 6. Both 5 and 4.5 work; 3 needs 4 swaps and 7 needs 2.

**H5.** Merges of sizes (1, 1) × 4, (2, 2) × 2 and (4, 4) × 1 cost at most 1 × 4 + 3 × 2 + 7 = 17.

**H6.** 9 + 8 + … + 1 = 45.

**H7.** T(n) = 2T(n − 1) + 1 gives 2ⁿ − 1, which is Θ(2ⁿ), not Θ(n²).

```python run Recomputing Set D3
import math
from itertools import combinations

def binsearch_comps(n, target_index):
    lo, hi, c = 0, n - 1, 0
    while lo <= hi:
        mid = (lo + hi) // 2; c += 1
        if mid == target_index:
            return c
        if mid < target_index:
            lo = mid + 1
        else:
            hi = mid - 1
    return c

inv = lambda a: sum(1 for i, j in combinations(range(len(a)), 2) if a[i] > a[j])
print('E2', 8 * 7 // 2, '| E4', inv([3, 1, 2]), '| E6', math.floor(math.log2(63)) + 1,
        '| M1', inv([4, 3, 1, 2]),
      '| H1', binsearch_comps(15, 0), '| H3', inv([6, 5, 4, 3, 2, 1, 7]))

def bubble_pass(a):
    s = 0
    for i in range(len(a) - 1):
        if a[i] > a[i + 1]:
            a[i], a[i + 1] = a[i + 1], a[i]; s += 1
    return s

arr = [5, 1, 4, 2, 8]
s1 = bubble_pass(arr); print('M3 pass 1:', s1, 'swaps', arr)
s2 = bubble_pass(arr); print('M3 pass 2:', s2, 'swaps', arr)

def insertion_comps(a):
    a, c = a[:], 0
    for i in range(1, len(a)):
        j = i
        while j > 0:
            c += 1
            if a[j - 1] > a[j]:
                a[j - 1], a[j] = a[j], a[j - 1]; j -= 1
            else:
                break
    return c

def merge_worst(n):
    return 0 if n <= 1 else merge_worst(n // 2) + merge_worst(n - n // 2) + n - 1

def qs(a):
    if len(a) <= 1:
        return 0
    return len(a) - 1 + qs([x for x in a[1:] if x < a[0]]) + qs([x for x in a[1:]
            if x >= a[0]])

print('M6', insertion_comps([2, 1, 3, 4]), '| M8', math.ceil(3 * 100 / 2) - 2, '| H5',
        merge_worst(8),
      '| H6', qs(list(range(1, 11))), '| equal elements', qs([7] * 10))
print('H4 swaps for x =', {x: inv([2, 4, 6, 8, 10, x]) for x in (5, 3, 7, 4.5)})
```
