# How to use this practice book
%49 exercises matching the DSA in Java guide, with hints kept separate and Java solutions tested against brute force

Each part matches chapters of the **DSA in Java** guide. Solve every exercise yourself first: write the method, run it on the given example, then on edge cases (empty input, one element, duplicates, negative numbers, large values). Only then compare with the solution. Every solution is a complete single-file program that runs with `java Main.java` (Java 21 or later), and its output is shown. Most solutions also check the fast method against a brute force on hundreds of random inputs; copy that habit.

| Type | What you do |
|---|---|
| Concept | Classify, explain or predict, in words, then check with a short program |
| Numerical | Compute a number by hand (a count, a complexity), then verify it |
| Code | Write a working, efficient method and test it |

**Marking scheme.** Mark each attempt ✓ (solved alone, correct complexity), ~ (solved with the hint, or correct but slower than intended) or ✗ (needed the solution). Give yourself 20 minutes for an Easy exercise, 30 for a Medium one and 45 for a Hard one; after that, read the hint. Redo every ~ and ✗ a week later without looking, and record it in the tracker. Then solve two or three problems of the same pattern on LeetCode or GeeksforGeeks.

| Part | Guide chapters | Topic | Exercises |
|---|---|---|---|
| 1 | 1 | Complexity and the Java toolkit | 3 |
| 2 | 2 | Arrays, strings and hashing | 6 |
| 3 | 3 | Binary search, sorting and intervals | 5 |
| 4 | 4 | Linked lists, stacks and queues | 5 |
| 5 | 5 | Recursion and backtracking | 4 |
| 6 | 6 | Trees and binary search trees | 5 |
| 7 | 7 | Heaps and hash tables | 4 |
| 8 | 8 | Graphs | 5 |
| 9 | 9 | Dynamic programming | 7 |
| 10 | 10–11 | Greedy, bits, maths, tries and range queries | 5 |

# Exercises

## Part 1: Complexity and the Java toolkit

**S1.1 · Easy · Numerical · Name the complexity.** Give the time complexity of each fragment, then confirm by counting iterations for *n* = 10<sup>3</sup>, 10<sup>4</sup> and 10<sup>5</sup>: (a) `for (i = 1; i < n; i *= 3)`; (b) `for (i = 1; i <= n; i++) for (j = i; j <= n; j += i)`; (c) `for (i = 0; i < n; i++) for (j = i; j > 0; j /= 2)`; (d) `for (i = 0; i * i < n; i++)`; (e) a loop over an array of size *m* followed by a separate loop over an array of size *n*.

**S1.2 · Easy · Concept · Read the constraints.** For each constraint, state the largest acceptable complexity and one technique that fits: (a) *n* ≤ 18, "choose a subset"; (b) *n* ≤ 3 000, two strings; (c) *n* ≤ 2 × 10<sup>5</sup>, "for every element, count earlier elements greater than it"; (d) a single number *n* ≤ 10<sup>18</sup>, "smallest *x* with *x*<sup>2</sup> ≥ *n*".

**S1.3 · Medium · Code · Fix five bugs.** A program (a) averages 100 000 values of 30 000 each in an `int`; (b) sorts `Integer` scores descending with `(x, y) -> y - x` where scores include `Integer.MIN_VALUE`; (c) checks two `Integer` user ids (both 5000) with `==`; (d) moves a pointer three steps backwards around a circular buffer of size 8 with `(pos - 3) % 8` starting at position 1; (e) builds a 100 000-character string with `s += c`. Explain each bug, then write a corrected program that prints the right results.

## Part 2: Arrays, strings and hashing

**S2.1 · Easy · Code · Product except self.** Given `nums`, return an array where `out[i]` is the product of all elements except `nums[i]`, in O(n) time **without division**. Test on `[1, 2, 3, 4]` and on an array containing a zero.

**S2.2 · Medium · Code · Longest subarray with sum k.** Return the length of the longest contiguous subarray with sum exactly *k*. The array may contain negative numbers. Example: `[1, -1, 5, -2, 3]`, *k* = 3 → 4. Aim for O(n).

**S2.3 · Medium · Code · At most k distinct characters.** Return the length of the longest substring of *s* containing at most *k* distinct characters. Examples: `"eceba"`, *k* = 2 → 3; `"aa"`, *k* = 1 → 2.

**S2.4 · Medium · Code · Trapping rain water.** Given bar heights, compute how much water is trapped after rain, in O(n) time and O(1) extra space. Example: `[0,1,0,2,1,0,1,3,2,1,2,1]` → 6.

**S2.5 · Medium · Code · All anagram positions.** Return every start index in *s* where an anagram of *p* begins. Example: *s* = `"cbaebabacd"`, *p* = `"abc"` → `[0, 6]`. Aim for O(|s|) with a fixed window.

**S2.6 · Hard · Code · Subarrays divisible by k.** Count the subarrays whose sum is divisible by *k*. Values may be negative. Example: `[4, 5, 0, -2, -3, 1]`, *k* = 5 → 7.

## Part 3: Binary search, sorting and intervals

**S3.1 · Easy · Code · First and last position.** In a sorted array with duplicates, return the first and last index of a target, or `[-1, -1]`, in O(log n). Example: `[5, 7, 7, 8, 8, 10]`, target 8 → `[3, 4]`.

**S3.2 · Medium · Code · Integer square root of a long.** Return ⌊√n⌋ for any `long` *n* ≥ 0 using binary search only (no floating point), without overflow. Check it on 0, 1, 15, 16, 10<sup>18</sup> and `Long.MAX_VALUE`.

**S3.3 · Medium · Code · Koko eating bananas.** Piles of bananas `piles[i]`; each hour Koko eats up to *s* bananas from one pile. Find the minimum speed *s* to finish within *h* hours. Example: `[3, 6, 7, 11]`, *h* = 8 → 4.

**S3.4 · Medium · Code · Aggressive cows.** Place *c* cows in stalls at given positions so that the minimum distance between any two cows is as large as possible. Example: stalls `[1, 2, 4, 8, 9]`, *c* = 3 → 3.

**S3.5 · Medium · Code · Insert an interval.** Given non-overlapping intervals sorted by start, insert a new interval and merge where needed, in O(n). Example: `[[1,2],[3,5],[6,7],[8,10],[12,16]]` plus `[4,8]` → `[[1,2],[3,10],[12,16]]`.

## Part 4: Linked lists, stacks and queues

**S4.1 · Easy · Code · Palindrome linked list.** Decide whether a singly linked list is a palindrome in O(n) time and O(1) extra space, and leave the list as you found it.

**S4.2 · Hard · Code · Reverse in groups of k.** Reverse the nodes of a linked list *k* at a time; a final group shorter than *k* stays as it is. Example: `1..8`, *k* = 3 → `3 2 1 6 5 4 7 8`.

**S4.3 · Medium · Code · Queue from two stacks.** Implement a FIFO queue with two stacks. Count every element move between stacks during 100 000 random operations and show that the moves per operation stay bounded.

**S4.4 · Medium · Code · Asteroid collision.** Positive values move right, negative move left, the absolute value is the size. When two meet, the smaller explodes; equal sizes both explode. Return the survivors. Example: `[5, 10, -5]` → `[5, 10]`; `[10, 2, -5]` → `[10]`; `[-2, -1, 1, 2]` → unchanged.

**S4.5 · Hard · Code · Sum of subarray minimums.** Return the sum of `min(subarray)` over all contiguous subarrays, modulo 10<sup>9</sup> + 7, in O(n). Example: `[3, 1, 2, 4]` → 17. Make sure equal values are not counted twice.

## Part 5: Recursion and backtracking

**S5.1 · Medium · Code · Balanced parentheses.** Generate every balanced string of *n* pairs of parentheses. Print them for *n* = 3, then print the counts for *n* = 1 to 10 and identify the sequence.

**S5.2 · Medium · Code · Phone keypad words.** Given digits 2–9, return every letter combination the phone keypad allows (2 = abc, …, 7 = pqrs, 9 = wxyz). Example: `"23"` → 9 strings. How many results does `"79"` give?

**S5.3 · Medium · Code · Palindrome partitioning.** Return every way to split a string into substrings that are all palindromes. Example: `"aab"` → `[[a, a, b], [aa, b]]`. Precompute which substrings are palindromes so that each check is O(1).

**S5.4 · Hard · Code · N-Queens with bitmasks.** Count the N-Queens solutions for *n* = 1 to 12 using three integer bitmasks (columns and the two diagonals) instead of boolean arrays, and compare with the known values (1, 0, 0, 2, 10, 4, 40, 92, 352, 724, 2680, 14200).

## Part 6: Trees and binary search trees

**S6.1 · Easy · Code · Right side view.** Return the values visible when looking at a binary tree from the right, top to bottom. Example: `[1, 2, 3, null, 5, null, 4]` → `[1, 3, 4]`.

**S6.2 · Medium · Code · Zigzag level order.** Return the level-order traversal with alternating direction: left to right, then right to left, and so on.

**S6.3 · Medium · Code · Downward paths with sum k.** Count the paths (going downwards only, starting and ending anywhere) whose values sum to *k*, in O(n). Example: `[10, 5, -3, 3, 2, null, 11, 3, -2, null, 1]`, *k* = 8 → 3.

**S6.4 · Medium · Code · LCA in a BST.** Find the lowest common ancestor of two values in a binary search tree in O(h) time and O(1) space, using the BST property rather than the general algorithm.

**S6.5 · Medium · Code · Delete from a BST.** Delete a key from a BST, handling leaf, one-child and two-children cases. Show the inorder sequence after deleting a leaf, a node with one child, and the root with two children.

## Part 7: Heaps and hash tables

**S7.1 · Easy · Code · Kth largest.** Find the *k*th largest element with a min-heap of size *k*, and check against sorting on random arrays. What are the time and space costs?

**S7.2 · Medium · Code · Task scheduler.** Tasks are letters; identical tasks need at least *n* idle-or-other slots between them. Find the minimum number of time slots. Example: `AAABBB`, *n* = 2 → 8. Solve it with a closed-form formula and with a heap simulation, and show they agree.

**S7.3 · Medium · Code · Reorganise a string.** Rearrange the characters so that no two adjacent characters are equal, or return `""` if impossible. Example: `"aab"` → `"aba"`; `"aaab"` → `""`.

**S7.4 · Medium · Concept · A constant hash code.** A class overrides `equals` correctly and `hashCode` as `return 1;`. Is a `HashMap` with these keys correct? What happens to performance? Run an experiment that counts `equals` calls for 2 000 insertions with a constant hash and with a good hash.

## Part 8: Graphs

**S8.1 · Medium · Code · Bipartite check.** Decide whether an undirected graph (possibly disconnected) can be two-coloured. Test a 4-cycle, a triangle, and a graph with two components.

**S8.2 · Medium · Code · Shortest path in a binary grid.** In an *n* × *n* grid of 0 (open) and 1 (blocked), find the length of the shortest path from the top-left to the bottom-right cell moving in **8** directions, counting cells, or −1.

**S8.3 · Medium · Code · Word ladder.** Find the number of words in the shortest transformation sequence from `hit` to `cog`, changing one letter at a time, where every intermediate word is in the list `hot dot dog lot log cog`.

**S8.4 · Hard · Code · Cheapest flight with at most k stops.** Given directed priced flights, find the cheapest price from *src* to *dst* using at most *k* stops, or −1. Explain why plain Dijkstra gives a wrong answer here and use a bounded Bellman–Ford.

**S8.5 · Medium · Code · Redundant connection.** A tree with *n* nodes had one extra edge added. Return the edge that can be removed to leave a tree; if several qualify, return the one that appears last in the input.

## Part 9: Dynamic programming

**S9.1 · Easy · Code · Steps of 1, 3 or 5.** Count the ways to climb *n* stairs taking 1, 3 or 5 steps at a time, modulo 10<sup>9</sup> + 7. Give the answers for *n* = 1 to 10 and for *n* = 1000.

**S9.2 · Medium · Code · Maximum product subarray.** Return the largest product of a contiguous subarray. Example: `[2, 3, -2, 4]` → 6; `[-2, 3, -4]` → 24. Explain why Kadane on its own fails.

**S9.3 · Medium · Code · Minimum path sum with the path.** In a grid of non-negative costs, moving only right or down, find the minimum total cost from the top-left to the bottom-right cell and print the path.

**S9.4 · Medium · Code · Target sum.** Assign `+` or `-` to each number so that the total equals a target; count the assignments. Example: `[1, 1, 1, 1, 1]`, target 3 → 5. Reduce it to subset counting and compare with brute force over all 2<sup>n</sup> sign choices.

**S9.5 · Hard · Code · Stock with cooldown.** Given daily prices, maximise profit with any number of buy–sell transactions, where after selling you must wait one day before buying again. Example: `[1, 2, 3, 0, 2]` → 3. Use a state machine and verify against an exhaustive search.

**S9.6 · Hard · Code · Matrix-chain multiplication.** Matrices have dimensions given by `p` (matrix *i* is `p[i-1] × p[i]`). Find the minimum number of scalar multiplications to compute the product, and print the optimal parenthesisation. Example: `p = [40, 20, 30, 10, 30]` → 26 000.

**S9.7 · Medium · Concept · Define the state.** Write the state, transition and base case for: (a) binary strings of length *n* with no two consecutive 1s; (b) the minimum insertions to make a string a palindrome; (c) the number of ways to tile a 2 × *n* board with 1 × 2 dominoes. Then code (a) and (b) and check them on small inputs.

## Part 10: Greedy, bits, maths, tries and range queries

**S10.1 · Medium · Code · Minimum removals for no overlap.** Return the minimum number of intervals to remove so that the rest do not overlap (touching ends are allowed). Prove the greedy rule with an exchange argument and check it against brute force over all subsets.

**S10.2 · Easy · Code · Bit puzzles.** Write O(1) or O(bits) methods for: Hamming distance between two integers; "is *n* a power of four"; and reversing the 32 bits of an integer. Check the last against `Integer.reverse`.

**S10.3 · Medium · Code · Primes and factorisations.** Count the primes below 10<sup>6</sup> with a sieve, then build a smallest-prime-factor table and use it to factorise 360, 9 973 and 999 999.

**S10.4 · Medium · Code · Maximum XOR pair.** Find the maximum `a[i] XOR a[j]` in an array of non-negative integers in O(32 n) with a binary trie. Example: `[3, 10, 5, 25, 2, 8]` → 28. Check against brute force.

**S10.5 · Hard · Code · Count smaller numbers after self.** For each element, count how many elements to its right are smaller. Example: `[5, 2, 6, 1]` → `[2, 1, 1, 0]`. Use a Fenwick tree with coordinate compression, and compare with the O(n<sup>2</sup>) method on random arrays.
