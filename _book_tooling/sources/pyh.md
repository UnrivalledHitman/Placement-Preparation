# Hints
%Read only the hint for the exercise you are stuck on

| Exercise | Hint |
|---|---|
| D1.1 | A `set` of seen values; membership in a list scans it |
| D1.2 | Rows share one list; `//` floors; defaults are created once |
| D1.3 | Product of everything to the left times everything to the right |
| D1.4 | Prefix sums; store the **first** index of each prefix value |
| D1.5 | Sliding window with a `Counter`; shrink while more than k keys |
| D1.6 | Two pointers; the lower side's maximum bounds its water |
| D2.1 | Binary search on k; hours needed = Σ ceil(pile / k) |
| D2.2 | `bisect_left` for the first, `bisect_right − 1` for the last |
| D2.3 | Keep intervals with the earliest end (greedy) |
| D2.4 | Walk both lists with a carry; a dummy head node |
| D2.5 | Store (value, minimum so far) pairs |
| D2.6 | For each element, how many subarrays is it the minimum of? Previous-less and next-less-or-equal |
| D3.1 | Add `(` while opens < n, `)` while closes < opens |
| D3.2 | `itertools.product` over the letter groups, or backtracking |
| D3.3 | At each position try every palindromic prefix |
| D3.4 | Level-order BFS; reverse every other level |
| D3.5 | Return the node if it is p or q; if both sides return something, this is the LCA |
| D3.6 | Prefix sums along the root-to-node path in a `Counter`, undone on the way back |
| D4.1 | (max_count − 1) × (n + 1) + number of tasks with max_count, but at least len(tasks) |
| D4.2 | `Counter`, then sort by (−count, word) or a heap |
| D4.3 | Union–find; the edge whose ends are already connected |
| D4.4 | BFS over words; generate neighbours with wildcard patterns |
| D4.5 | Bellman–Ford for k + 1 rounds, copying distances each round |
| D4.6 | BFS colouring; a conflict means not bipartite |
| D5.1 | ok[i] = some ok[j] and s[j:i] in words; keep the split point |
| D5.2 | Track both the maximum and minimum product ending here |
| D5.3 | dp[i] = dp[i−1] (one digit valid) + dp[i−2] (two digits 10–26) |
| D5.4 | Three states: holding, sold today, resting |
| D5.5 | If total gas ≥ total cost, the start is after the last point where the running tank went negative |
| D5.6 | bits[i] = bits[i >> 1] + (i & 1); power of four: power of two with the bit at an even position |
| D6.1 | Dict trie; on `.` try every child recursively |
| D6.2 | Fenwick tree over compressed values, scanning from the right |
| D6.3 | With prefix function pi, unit length = n − pi[−1] if it divides n |
| D6.4 | Map the signals to the chapter 12 table |
| D6.5 | `deque.popleft`; collect pieces and `''.join` |
| D6.6 | `move_to_end` on access; `popitem(last=False)` to evict |
