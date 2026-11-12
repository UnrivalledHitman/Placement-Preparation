# Hints
%Read only the hint for the exercise you are stuck on

## Part 1 hints

| Exercise | Hint |
|---|---|
| S1.1 | Count how many times the inner loop runs for each outer value, then add those counts up |
| S1.2 | Use the constraints table in the "How to use this guide" section; 2<sup>18</sup> ≈ 2.6 × 10<sup>5</sup> |
| S1.3 | Overflow, overflow again, the Integer cache, a negative remainder, and immutable strings |

## Part 2 hints

| Exercise | Hint |
|---|---|
| S2.1 | out[i] = (product of everything left of i) × (product of everything right of i); two passes |
| S2.2 | Store the **first** index at which each prefix sum appears; never overwrite it |
| S2.3 | Window with a count map; shrink from the left while the map has more than *k* keys |
| S2.4 | Water above a bar = min(max left, max right) − height. Move the pointer on the side with the smaller maximum |
| S2.5 | Two `int[26]` count arrays, or one array and a counter of how many letters still match |
| S2.6 | Two prefix sums with the same remainder mod *k* bound a valid subarray; use `Math.floorMod` |

## Part 3 hints

| Exercise | Hint |
|---|---|
| S3.1 | Lower bound of target, and lower bound of target + 1 (or upper bound) minus one |
| S3.2 | Test `mid > n / mid` instead of `mid * mid > n` |
| S3.3 | Hours at speed *s* = sum of ⌈pile / s⌉; the hours decrease as *s* grows |
| S3.4 | Binary search the distance *d*; place cows greedily from the left and count how many fit |
| S3.5 | Three phases: intervals ending before the new one, the ones overlapping it, the ones after it |

## Part 4 hints

| Exercise | Hint |
|---|---|
| S4.1 | Find the middle with fast and slow pointers, reverse the second half, compare, reverse it back |
| S4.2 | Check that *k* nodes remain, reverse them, and connect the previous group's tail to the new head |
| S4.3 | Move elements from the input stack to the output stack only when the output stack is empty |
| S4.4 | A stack of survivors; a left-moving asteroid fights the right-moving ones on top of the stack |
| S4.5 | Each `a[i]` is the minimum of (distance to previous smaller) × (distance to next smaller-or-equal) subarrays |

## Part 5 hints

| Exercise | Hint |
|---|---|
| S5.1 | Track how many opening and closing brackets are placed; add `)` only if it would not exceed the `(` count |
| S5.2 | One recursion level per digit, one branch per letter |
| S5.3 | `pal[i][j] = s[i] == s[j] && (j - i < 2 \|\| pal[i+1][j-1])`; then backtrack over end positions |
| S5.4 | Free positions = `~(cols \| d1 \| d2) & full`; take the lowest bit with `free & -free`; shift the diagonals when moving to the next row |

## Part 6 hints

| Exercise | Hint |
|---|---|
| S6.1 | Level-order traversal; take the last node of each level |
| S6.2 | Level-order traversal; reverse every second level (or add to the front of a deque) |
| S6.3 | The "subarray sum equals *k*" trick on the root-to-node path: a map of prefix sums, undone when backtracking |
| S6.4 | If both values are smaller, go left; both larger, go right; otherwise this node is the answer |
| S6.5 | For two children, copy the smallest key of the right subtree and delete that key from the right subtree |

## Part 7 hints

| Exercise | Hint |
|---|---|
| S7.1 | Push each element; pop whenever the heap holds more than *k*. The root is the answer |
| S7.2 | With maximum frequency *f* shared by *m* tasks: max(total tasks, (f − 1)(n + 1) + m) |
| S7.3 | Always place the most frequent remaining character that differs from the previous one |
| S7.4 | Think about which bucket every key lands in, and how a bucket is searched |

## Part 8 hints

| Exercise | Hint |
|---|---|
| S8.1 | BFS from every uncoloured vertex; give neighbours the opposite colour; a same-colour edge fails |
| S8.2 | BFS from (0, 0) with eight moves; check the start and end cells are open |
| S8.3 | BFS over words; neighbours differ by one letter; try all 26 letters at every position |
| S8.4 | Run exactly *k* + 1 rounds of edge relaxation, each from a **copy** of the previous distances |
| S8.5 | Union–find: the first edge whose endpoints are already connected closes the cycle |

## Part 9 hints

| Exercise | Hint |
|---|---|
| S9.1 | `dp[i] = dp[i-1] + dp[i-3] + dp[i-5]` with `dp[0] = 1` |
| S9.2 | Keep both the maximum and the minimum product ending here; a negative number swaps them |
| S9.3 | Fill the table, then walk back from the end choosing the neighbour (up or left) that produced the value |
| S9.4 | Positive set *P*: sum(P) = (total + target) / 2; count subsets with that sum |
| S9.5 | Three states each day: holding, just sold (cooling down), resting without stock |
| S9.6 | `dp[i][j] = min over k of dp[i][k] + dp[k+1][j] + p[i-1] p[k] p[j]`; record the best *k* |
| S9.7 | (a) end in 0 or end in 1; (b) compare the two ends of `s[i..j]`; (c) the last column is one vertical domino or two horizontal ones |

## Part 10 hints

| Exercise | Hint |
|---|---|
| S10.1 | Keep the maximum number of non-overlapping intervals (sort by end); remove the rest |
| S10.2 | `Integer.bitCount(a ^ b)`; a power of four is a power of two whose bit is at an even position (`0x55555555`) |
| S10.3 | `spf[x]` = smallest prime dividing *x*; divide by `spf[x]` repeatedly |
| S10.4 | Insert each number's bits from the highest; for each number, walk the trie preferring the opposite bit |
| S10.5 | Scan from the right; query how many already-seen values have a smaller rank, then add the current rank |
