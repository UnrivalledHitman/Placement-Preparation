# Chapter 5: Recursion and Backtracking
%Thinking recursively, the choose–explore–unchoose template, pruning, grid search, and the cost of recursive algorithms

## 5.1 Thinking recursively

A recursive function needs a **base case** and a step that moves towards it, trusting the recursive call to solve the smaller problem. Python adds two practical constraints: the default recursion limit (about 1,000 frames) and the cost of function calls, so deep or hot recursion is often rewritten with an explicit stack.

```python run Recursive and iterative power, flattening nested lists, and the recursion limit
import sys

def fast_pow(x, n):
    """x**n with O(log n) multiplications."""
    if n == 0:
        return 1
    half = fast_pow(x, n // 2)
    return half * half * (x if n % 2 else 1)

def flatten(items):
    out = []
    for it in items:
        out.extend(flatten(it) if isinstance(it, list) else [it])
    return out

def flatten_iterative(items):
    stack, out = [iter(items)], []
    while stack:
        for it in stack[-1]:
            if isinstance(it, list):
                stack.append(iter(it)); break
            out.append(it)
        else:
            stack.pop()                        # this iterator is exhausted
    return out

print(fast_pow(3, 13), 3 ** 13, pow(3, 13, 1000))
nested = [1, [2, [3, [4]], 5], [[6]]]
print(flatten(nested), flatten_iterative(nested))
deep = current = []
for _ in range(3000):
    current.append([]); current = current[0]
current.append(42)                             # one value at depth 3000
try:
    flatten(deep)
except RecursionError:
    print('recursive version: RecursionError at depth 3000 (limit', sys.getrecursionlimit(),
            ')')
print('iterative version handles it:', flatten_iterative(deep))
```

## 5.2 The backtracking template

Backtracking builds candidates step by step: **choose** an option, **explore** recursively, **unchoose** (undo) and try the next. It enumerates subsets, permutations and combinations, with pruning to skip hopeless branches.

```python run Subsets, permutations, and combinations that sum to a target
from itertools import combinations, permutations

def subsets(nums):
    out, path = [], []
    def go(i):
        if i == len(nums):
            out.append(path[:]); return            # copy: path keeps changing
        go(i + 1)                                  # skip nums[i]
        path.append(nums[i]); go(i + 1); path.pop()   # take nums[i], then undo
    go(0)
    return out

def perms(nums):
    out, path, used = [], [], [False] * len(nums)
    def go():
        if len(path) == len(nums):
            out.append(path[:]); return
        for i, x in enumerate(nums):
            if not used[i]:
                used[i] = True; path.append(x)
                go()
                path.pop(); used[i] = False
    go()
    return out

def combination_sum(cands, target):
    cands, out, path = sorted(cands), [], []
    def go(start, remaining):
        if remaining == 0:
            out.append(path[:]); return
        for i in range(start, len(cands)):
            if cands[i] > remaining:
                break                              # prune: sorted, so later ones are bigger
            # i: reuse allowed
            path.append(cands[i]); go(i, remaining - cands[i]); path.pop()
    go(0, target)
    return out

print(len(subsets([1, 2, 3])), subsets([1, 2, 3]))
print(len(perms([1, 2, 3])), perms([1, 2, 3]) == [list(p) for p in permutations([1, 2, 3])])
print(combination_sum([2, 3, 6, 7], 7), combination_sum([2, 3, 5], 8))
print('itertools check:', sorted(map(sorted, subsets([1, 2, 3]))) ==
      sorted(sorted(c) for r in range(4) for c in combinations([1, 2, 3], r)))
```

> TRAP: Appending `path` instead of `path[:]` stores the same list object every time; after backtracking finishes, every stored "subset" is the empty list.

## 5.3 Pruning: N-Queens

```python run Counting N-Queens solutions with sets of attacked columns and diagonals
def n_queens(n):
    cols, diag, anti, count = set(), set(), set(), 0
    def place(r):
        nonlocal count
        if r == n:
            count += 1; return
        for c in range(n):
            if c in cols or r - c in diag or r + c in anti:
                continue                           # prune attacked squares immediately
            cols.add(c); diag.add(r - c); anti.add(r + c)
            place(r + 1)
            cols.remove(c); diag.remove(r - c); anti.remove(r + c)
    place(0)
    return count

print({n: n_queens(n) for n in range(1, 10)})
```

Squares on the same diagonal share `r − c`; on the same anti-diagonal they share `r + c`. Checking three sets is O(1) per square, so whole subtrees of invalid placements are skipped without being built.

## 5.4 Backtracking on a grid

```python run Word search in a grid, marking visited cells in place
def exist(board, word):
    R, C = len(board), len(board[0])
    def dfs(r, c, k):
        if k == len(word):
            return True
        if not (0 <= r < R and 0 <= c < C) or board[r][c] != word[k]:
            return False
        saved, board[r][c] = board[r][c], '#'      # mark visited
        found = any(dfs(r + dr, c + dc, k + 1) for dr, dc in ((1, 0), (-1, 0), (0, 1), (0,
                -1)))
        board[r][c] = saved                        # unmark (backtrack)
        return found
    return any(dfs(r, c, 0) for r in range(R) for c in range(C))

board = [list('ABCE'), list('SFCS'), list('ADEE')]
print({w: exist(board, w) for w in ['ABCCED', 'SEE', 'ABCB']})
```

## 5.5 Complexity of recursive algorithms

| Recurrence | Example | Result |
|---|---|---|
| T(n) = T(n − 1) + O(1) | Linear recursion | O(n) |
| T(n) = T(n/2) + O(1) | Binary search, fast power | O(log n) |
| T(n) = 2T(n/2) + O(n) | Merge sort | O(n log n) |
| T(n) = 2T(n − 1) + O(1) | Naive Fibonacci, subsets | O(2ⁿ) |
| n choices, depth n, no reuse | Permutations | O(n · n!) |

The **master theorem** handles T(n) = aT(n/b) + f(n): compare f(n) with n^(log_b a). Memoisation (Chapter 9) collapses repeated sub-problems, turning naive Fibonacci from O(2ⁿ) to O(n).

## 5.6 Practical lessons

- Base case, smaller step, trust the recursion; raise the limit or use an explicit stack for deep recursion.
- Backtracking: choose, explore, unchoose; append copies (`path[:]`).
- Prune as early as possible: sorted candidates, sets of attacked positions, visited markers.
- Know the common recurrences: O(log n), O(n log n), O(2ⁿ), O(n!).

# Chapter 6: Trees and Binary Search Trees
%The node class, traversals, returning information upwards, BST operations, building and serialising trees

## 6.1 Vocabulary and the node class

A binary tree's nodes have at most two children. **Depth** counts edges from the root, **height** is the longest path to a leaf; a tree is **balanced** if every node's subtrees differ in height by at most 1. Trees are usually given in level order with `None` for missing children.

```python run TreeNode, building from a level-order list, and printing a tree
from collections import deque

class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def build(values):
    if not values or values[0] is None:
        return None
    it = iter(values)
    root = TreeNode(next(it))
    q = deque([root])
    for left in it:
        node = q.popleft()
        if left is not None:
            node.left = TreeNode(left); q.append(node.left)
        right = next(it, None)
        if right is not None:
            node.right = TreeNode(right); q.append(node.right)
    return root

def show(node, prefix=''):
    if node:
        show(node.right, prefix + '    ')
        print(prefix + str(node.val))
        show(node.left, prefix + '    ')

if __name__ == '__main__':
    import inspect
    open('pytree.py', 'w').write('from collections import deque\n\n' + '\n\n'.join(
        inspect.getsource(o) for o in (TreeNode, build, show)))
    show(build([4, 2, 7, 1, 3, 6, 9, None, None, None, None, 5]))
```

The tree is printed sideways (root on the left, right subtree on top). The program also saves `TreeNode` and `build` as `pytree.py`, which the rest of the chapter imports.

## 6.2 Traversals

```python run Pre-, in- and post-order recursively, in-order iteratively, and level order
from collections import deque
from pytree import build

root = build([4, 2, 7, 1, 3, 6, 9])

def preorder(n):  return [n.val] + preorder(n.left) + preorder(n.right) if n else []
def inorder(n):   return inorder(n.left) + [n.val] + inorder(n.right) if n else []
def postorder(n): return postorder(n.left) + postorder(n.right) + [n.val] if n else []

def inorder_iterative(node):
    out, stack = [], []
    while stack or node:
        while node:
            stack.append(node); node = node.left       # go as far left as possible
        node = stack.pop()
        out.append(node.val)
        node = node.right
    return out

def level_order(root):
    out, q = [], deque([root] if root else [])
    while q:
        level = []
        for _ in range(len(q)):                        # exactly one level per outer loop
            n = q.popleft(); level.append(n.val)
            q.extend(c for c in (n.left, n.right) if c)
        out.append(level)
    return out

print('pre ', preorder(root))
print('in  ', inorder(root), inorder_iterative(root))
print('post', postorder(root))
print('levels', level_order(root))
```

In-order traversal of a **binary search tree** visits keys in sorted order, as here. Level order with a "for each node in the current level" loop is the basis of right-side view, zigzag order and minimum depth.

## 6.3 Returning information upwards

Many tree problems are solved by a post-order function that returns facts about a subtree (height, sum, balance) to its parent, while updating an answer along the way.

```python run Height, diameter, balance check and maximum path sum in single passes
from pytree import build

def height(n):
    return 0 if not n else 1 + max(height(n.left), height(n.right))

def diameter(root):
    best = 0
    def depth(n):
        nonlocal best
        if not n:
            return 0
        l, r = depth(n.left), depth(n.right)
        best = max(best, l + r)                        # longest path through n (edges)
        return 1 + max(l, r)
    depth(root)
    return best

def balanced(root):
    def check(n):                                      # height, or -1 if unbalanced
        if not n:
            return 0
        l, r = check(n.left), check(n.right)
        if l < 0 or r < 0 or abs(l - r) > 1:
            return -1
        return 1 + max(l, r)
    return check(root) >= 0

def max_path_sum(root):
    best = float('-inf')
    def gain(n):
        nonlocal best
        if not n:
            return 0
        l, r = max(gain(n.left), 0), max(gain(n.right), 0)   # drop negative branches
        best = max(best, n.val + l + r)
        return n.val + max(l, r)
    gain(root)
    return best

t = build([1, 2, 3, 4, 5, None, None, 6])
print('height', height(t), '| diameter', diameter(t), '| balanced', balanced(t))
print('max path sum:', max_path_sum(build([-10, 9, 20, None, None, 15, 7])))
```

## 6.4 Binary search trees

In a BST every key in the left subtree is smaller than the node and every key in the right subtree larger, so search, insert and delete follow one path: O(h), which is O(log n) when balanced and O(n) when the tree degenerates into a chain.

```python run Validate with bounds, k-th smallest with a generator, and lowest common ancestor
from itertools import islice
from pytree import build, TreeNode

def is_bst(n, lo=float('-inf'), hi=float('inf')):
    return not n or (lo < n.val < hi and is_bst(n.left, lo, n.val) and is_bst(n.right,
            n.val, hi))

def inorder_gen(n):
    if n:
        yield from inorder_gen(n.left)
        yield n.val
        yield from inorder_gen(n.right)

def kth_smallest(root, k):
    return next(islice(inorder_gen(root), k - 1, None))   # stops after k values

def lca_bst(n, p, q):
    while n:
        if p < n.val and q < n.val:
            n = n.left
        elif p > n.val and q > n.val:
            n = n.right
        else:
            return n.val                                  # p and q split here

bst = build([8, 3, 10, 1, 6, None, 14, None, None, 4, 7, 13])
bad = TreeNode(5, TreeNode(1), TreeNode(6, TreeNode(3), TreeNode(7)))
print('valid:', is_bst(bst), '| invalid tree:', is_bst(bad))
print('3rd smallest:', kth_smallest(bst, 3), '| LCA(4, 7):', lca_bst(bst, 4, 7),
      '| LCA(4, 14):', lca_bst(bst, 4, 14))
```

The invalid tree is the classic trap: 3 is smaller than its parent 6 (locally fine) but lies in the right subtree of 5, so it violates the BST property. Checking only parent–child pairs misses it; passing down bounds catches it.

## 6.5 Building and serialising trees

```python run Rebuild from pre-order and in-order, and serialise/deserialise in pre-order
from pytree import build
from collections import deque

class Node:
    def __init__(self, v, l=None, r=None):
        self.val, self.left, self.right = v, l, r

def from_pre_in(pre, ino):
    index = {v: i for i, v in enumerate(ino)}
    pre_iter = iter(pre)
    def make(lo, hi):                                 # in-order slice [lo, hi)
        if lo >= hi:
            return None
        v = next(pre_iter)
        m = index[v]
        return Node(v, make(lo, m), make(m + 1, hi))
    return make(0, len(ino))

def serialise(n):
    return f'{n.val},{serialise(n.left)},{serialise(n.right)}' if n else '#'

def deserialise(s):
    tokens = iter(s.split(','))
    def make():
        t = next(tokens)
        return None if t == '#' else Node(int(t), make(), make())
    return make()

t = from_pre_in([3, 9, 20, 15, 7], [9, 3, 15, 20, 7])
s = serialise(t)
print('serialised:', s)
print('round trip identical:', serialise(deserialise(s)) == s)
print('level-order build serialised:', serialise(build([1, 2, 3, None, 4])))
```

Pre-order plus in-order (or post-order plus in-order) determines a tree with distinct values; pre-order alone does not, unless null markers (`#`) are included, as the serialiser does.

## 6.6 Tree problems at a glance

| Problem | Technique |
|---|---|
| Maximum depth, minimum depth | DFS returning height; BFS stops at the first leaf for minimum depth |
| Same tree, symmetric tree | Recursive comparison of two nodes at a time |
| Invert (mirror) a tree | Swap children at every node |
| Right side view, zigzag order, level averages | Level-order BFS with a per-level loop |
| Path sum equals target (root to leaf) | DFS carrying the remaining sum |
| Paths with a given sum anywhere | DFS with a prefix-sum counter, like Chapter 2 |
| Lowest common ancestor (binary tree) | Return the node if found in both subtrees, else the non-empty side |
| Diameter, maximum path sum | Return height/gain upwards, update a global best |
| Validate a BST, k-th smallest | Bounds; in-order traversal |
| Convert a sorted array to a balanced BST | Middle element as root, recurse on halves |
| Very deep (chain-like) trees | Iterative traversal with an explicit stack to avoid `RecursionError` |

## 6.7 Practical lessons

- Build trees from level order; save a helper and reuse it.
- Traversals: pre/in/post recursively; in-order iteratively with a stack; level order with a queue and a per-level loop.
- Return facts upwards (height, gain) and update a global best for path problems.
- BST: validate with bounds, not parent checks; in-order is sorted; operations cost O(height).
- Serialise with null markers so the tree can be rebuilt exactly.
