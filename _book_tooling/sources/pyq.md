# How to use this practice book
%36 exercises matching the DSA in Python guide, with hints kept separate and solutions tested against brute force

Each part matches chapters of the **DSA in Python** guide. Solve each exercise in a plain editor first, with a time limit of 25 minutes for Medium and 40 for Hard, then test it on edge cases before reading the hint or the solution. Every solution in this book was run, and most are checked against a brute-force version on hundreds of random inputs.

| Type | What you do |
|---|---|
| Code | Write a function and test it |
| Concept | Predict the output or choose the approach, then check |

**Marking scheme.** Mark ✓ (solved alone and tested), ~ (needed the hint) or ✗ (needed the solution). Redo every ~ and ✗ a week later, from a blank file.

| Part | Guide chapters | Topic | Exercises |
|---|---|---|---|
| 1 | 1–2 | Toolkit, arrays, strings, hashing | 6 |
| 2 | 3–4 | Binary search, intervals, lists, stacks | 6 |
| 3 | 5–6 | Backtracking and trees | 6 |
| 4 | 7–8 | Heaps and graphs | 6 |
| 5 | 9–10 | Dynamic programming, greedy and bits | 6 |
| 6 | 11–12 | Tries, range queries, strings and mixed practice | 6 |

# Exercises

## Part 1: Toolkit, arrays, strings and hashing

**D1.1 · Easy · Code · First repeated element.** Return the first element that appears a second time while scanning a list (or `None`), in O(n). Explain why `x in seen_list` would make it O(n²).

**D1.2 · Easy · Concept · Predict the traps.** Predict the output of a snippet that uses `[[0] * 2] * 2`, `-9 // 4`, `-9 % 4`, a mutable default argument and `sorted` versus `sort`, then run it.

**D1.3 · Medium · Code · Product except self.** Return `out[i]` = product of all elements except `nums[i]`, in O(n) without division.

**D1.4 · Medium · Code · Longest subarray with sum k.** Return the length of the longest contiguous subarray summing to k; values may be negative.

**D1.5 · Medium · Code · At most k distinct characters.** Return the length of the longest substring with at most k distinct characters.

**D1.6 · Medium · Code · Trapping rain water.** Given bar heights, return how much water is trapped after rain, in O(n) time and O(1) extra space.

## Part 2: Binary search, intervals, lists and stacks

**D2.1 · Medium · Code · Koko eating bananas.** Piles `piles[i]`; Koko eats at most `k` bananas from one pile per hour. Return the minimum k that finishes within h hours.

**D2.2 · Easy · Code · First and last position.** In a sorted list with duplicates, return the first and last index of a target, or `(-1, -1)`, using `bisect`.

**D2.3 · Medium · Code · Fewest removals for no overlap.** Return the minimum number of intervals to remove so the rest do not overlap (touching ends allowed).

**D2.4 · Medium · Code · Add two numbers.** Two non-negative integers are stored as linked lists of digits in reverse order. Return their sum as a linked list.

**D2.5 · Easy · Code · Minimum stack.** Implement a stack with `push`, `pop`, `top` and `get_min`, all O(1).

**D2.6 · Hard · Code · Sum of subarray minimums.** Return the sum of `min(subarray)` over all contiguous subarrays, modulo 10⁹ + 7, in O(n).

## Part 3: Backtracking and trees

**D3.1 · Medium · Code · Balanced parentheses.** Generate every balanced string of n pairs of parentheses.

**D3.2 · Medium · Code · Phone keypad words.** Given digits 2–9, return every letter combination from a phone keypad, in lexicographic order.

**D3.3 · Medium · Code · Palindrome partitioning.** Return every way to split a string into palindromic pieces.

**D3.4 · Easy · Code · Zigzag level order.** Return a binary tree's level-order traversal, alternating left-to-right and right-to-left.

**D3.5 · Medium · Code · LCA in a binary tree.** Find the lowest common ancestor of two nodes in a binary tree that is not a search tree.

**D3.6 · Medium · Code · Downward paths with sum k.** Count paths going downwards (not necessarily from the root or to a leaf) whose values sum to k.

## Part 4: Heaps and graphs

**D4.1 · Medium · Code · Task scheduler.** Tasks are letters; identical tasks need at least n intervals between them. Return the minimum number of intervals (including idle ones) to run all tasks.

**D4.2 · Medium · Code · Top k frequent words.** Return the k most frequent words, ties broken alphabetically.

**D4.3 · Medium · Code · Redundant connection.** A tree on n nodes had one extra edge added. Return the edge that, if removed, leaves a tree (the last such edge in the input).

**D4.4 · Medium · Code · Word ladder.** Return the number of words in the shortest transformation sequence from `begin` to `end`, changing one letter at a time, every intermediate word in the dictionary; 0 if impossible.

**D4.5 · Hard · Code · Cheapest flight with at most k stops.** Given directed priced flights, return the cheapest price from src to dst using at most k stops, or −1.

**D4.6 · Medium · Code · Bipartite check.** Decide whether an undirected graph's nodes can be coloured with two colours so that every edge joins different colours.

## Part 5: Dynamic programming, greedy and bits

**D5.1 · Medium · Code · Word break.** Decide whether a string can be split into words from a dictionary, and return one such split.

**D5.2 · Medium · Code · Maximum product subarray.** Return the largest product of a contiguous subarray (values may be negative or zero).

**D5.3 · Medium · Code · Decode ways.** Letters A–Z are encoded as 1–26. Count the ways to decode a digit string.

**D5.4 · Hard · Code · Stock trading with cooldown.** Maximise profit buying and selling a stock any number of times, with a one-day cooldown after each sale.

**D5.5 · Medium · Code · Gas station.** Return the starting station index from which a car can complete the circuit, or −1, in O(n).

**D5.6 · Easy · Code · Bit puzzles.** Return the number of set bits for every number from 0 to n in O(n); decide whether a number is a power of four; reverse the bits of a 32-bit unsigned integer.

## Part 6: Tries, range queries, strings and mixed practice

**D6.1 · Medium · Code · Trie with wildcards.** Implement `add(word)` and `search(pattern)`, where `.` in the pattern matches any one letter.

**D6.2 · Hard · Code · Count smaller numbers after self.** For each element, count the smaller elements to its right, in O(n log n).

**D6.3 · Medium · Code · Repeated substring pattern.** Decide whether a string is some substring repeated two or more times, using the prefix function, and return the smallest repeating unit.

**D6.4 · Medium · Concept · Choose the pattern.** Name the pattern and complexity for six short problem statements.

**D6.5 · Medium · Code · Make it fast.** A working function uses `list.pop(0)` and string `+=` in loops. Rewrite it with the right data structures and show the outputs match.

**D6.6 · Medium · Code · LRU cache.** Implement an LRU cache with O(1) `get` and `put` using `collections.OrderedDict`.
