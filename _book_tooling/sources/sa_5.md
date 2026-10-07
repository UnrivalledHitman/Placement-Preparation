# Chapter 11: Tries, Range Queries and String Matching
%Prefix trees, Fenwick and segment trees for changing arrays, and linear-time pattern search

## 11.1 Trie (prefix tree)

A **trie** stores strings character by character along paths from the root; words sharing a prefix share the path. Insert and search cost O(L) for a word of length L, independent of how many words are stored. Use a trie for prefix queries (autocomplete, "how many words start with …"), word games on a board, and maximum-XOR pairs (a trie of bits).

```java run A trie with prefix counts and autocomplete
import java.util.*;

public class Main {
    static class Trie {
        private final Trie[] next = new Trie[26];
        private int prefixCount = 0;          // words passing through this node
        private boolean word = false;
        void insert(String w) {
            Trie t = this;
            for (char c : w.toCharArray()) {
                if (t.next[c - 'a'] == null) t.next[c - 'a'] = new Trie();
                t = t.next[c - 'a'];
                t.prefixCount++;
            }
            t.word = true;
        }
        private Trie walk(String p) {
            Trie t = this;
            for (char c : p.toCharArray()) if ((t = t.next[c - 'a']) == null) return null;
            return t;
        }
        boolean contains(String w) { Trie t = walk(w); return t != null && t.word; }
        int countPrefix(String p) { Trie t = walk(p); return t == null ? 0 : t.prefixCount; }
        List<String> complete(String p, int limit) {
            List<String> out = new ArrayList<>();
            Trie t = walk(p);
            if (t != null) collect(t, new StringBuilder(p), out, limit);
            return out;
        }
        private static void collect(Trie t, StringBuilder sb, List<String> out, int limit) {
            if (out.size() == limit) return;
            if (t.word) out.add(sb.toString());
            for (int i = 0; i < 26; i++)                 // alphabetical order
                if (t.next[i] != null) {
                    sb.append((char) ('a' + i));
                    collect(t.next[i], sb, out, limit);
                    sb.setLength(sb.length() - 1);
                }
        }
    }
    public static void main(String[] args) {
        Trie t = new Trie();
        for (String w : "car card care cared cars cat dog do dot".split(" ")) t.insert(w);
        System.out.println("contains 'car'? " + t.contains("car")
                + ", 'ca'? " + t.contains("ca"));
        System.out.println("words starting with 'car': " + t.countPrefix("car")
                + ", with 'do': " + t.countPrefix("do"));
        System.out.println("autocomplete 'car' (3): " + t.complete("car", 3));
    }
}
```

> NOTE: An array of 26 children is fast but uses memory for every node. For large or non-lowercase alphabets, use a `HashMap<Character, Trie>` per node instead.

## 11.2 Range queries on a changing array

Prefix sums (Chapter 2) answer range sums in O(1) but cost O(n) per update. When updates and queries are interleaved, use a tree structure that does both in O(log n).

| Structure | Point update | Range query | Range update | Code size | Supports |
|---|---|---|---|---|---|
| Prefix sums | O(n) | O(1) | O(n) | Tiny | Sums, static arrays |
| Fenwick tree (BIT) | O(log n) | O(log n) | With a second tree | ~15 lines | Sums, counts (invertible operations) |
| Segment tree | O(log n) | O(log n) | O(log n) with lazy propagation | ~40 lines | Sum, min, max, gcd: any associative operation |
| Sparse table | — | O(1) | — | ~20 lines | Min/max/gcd on static arrays |

A **Fenwick tree** stores at index *i* the sum of the last `i & -i` elements ending at *i* (1-based). Both operations jump through O(log n) indices by adding or subtracting the lowest set bit.

```java run Fenwick tree for sums, and counting inversions with it
import java.util.*;

public class Main {
    static class Fenwick {
        private final long[] t;
        Fenwick(int n) { t = new long[n + 1]; }
        // both methods take a 0-based index and shift it to the tree's 1-based layout
        void add(int i, long v) { for (i++; i < t.length; i += i & -i) t[i] += v; }
        long prefix(int i) { long s = 0; for (i++; i > 0; i -= i & -i) s += t[i]; return s; }
        long range(int l, int r) { return prefix(r) - (l > 0 ? prefix(l - 1) : 0); }
    }
    public static void main(String[] args) {
        int[] a = {5, 2, 9, -3, 6, 4, 1, 8};
        Fenwick f = new Fenwick(a.length);
        for (int i = 0; i < a.length; i++) f.add(i, a[i]);
        System.out.println("sum[2..5] = " + f.range(2, 5));
        f.add(3, 10);                                    // a[3] becomes 7
        System.out.println("after a[3] += 10, sum[2..5] = " + f.range(2, 5));

        int[] b = {8, 4, 2, 1, 7, 3};                    // values 1..8: count inversions
        Fenwick seen = new Fenwick(9);
        long inv = 0;
        for (int i = 0; i < b.length; i++) {
            inv += i - seen.prefix(b[i]);               // earlier values greater than b[i]
            seen.add(b[i], 1);
        }
        System.out.println("inversions of " + Arrays.toString(b) + " = " + inv);
    }
}
```

The inversion count matches the merge-sort count from Chapter 3 (10). With values up to 10<sup>9</sup>, first **compress coordinates**: sort the distinct values and replace each value by its rank.

### Segment tree

A segment tree stores, at each node, the answer for a range; the root covers the whole array and each child covers half of its parent. A query combines O(log n) nodes that exactly tile the requested range. It handles any associative operation, which a Fenwick tree cannot do for minimum or maximum with arbitrary updates.

```java run An iterative segment tree for range minimum with point updates
import java.util.*;

public class Main {
    static class MinTree {
        private final int n;
        private final int[] t;
        MinTree(int[] a) {
            n = a.length; t = new int[2 * n];
            System.arraycopy(a, 0, t, n, n);                       // leaves at n..2n-1
            for (int i = n - 1; i > 0; i--) t[i] = Math.min(t[2 * i], t[2 * i + 1]);
        }
        void set(int i, int v) {
            for (t[i += n] = v; i > 1; i >>= 1) t[i >> 1] = Math.min(t[i], t[i ^ 1]);
        }
        int min(int l, int r) {                                    // inclusive l..r
            int res = Integer.MAX_VALUE;
            for (l += n, r += n + 1; l < r; l >>= 1, r >>= 1) {
                if ((l & 1) == 1) res = Math.min(res, t[l++]);
                if ((r & 1) == 1) res = Math.min(res, t[--r]);
            }
            return res;
        }
    }
    public static void main(String[] args) {
        int[] a = {7, 3, 9, 5, 6, 2, 8, 4};
        MinTree st = new MinTree(a);
        System.out.println("min[0..3]=" + st.min(0, 3) + " min[4..7]=" + st.min(4, 7)
                + " min[2..4]=" + st.min(2, 4));
        st.set(5, 10);
        System.out.println("after a[5]=10: min[4..7]=" + st.min(4, 7));
        Random r = new Random(9); boolean ok = true;
        int[] b = new int[50];
        for (int i = 0; i < 50; i++) b[i] = r.nextInt(1000);
        MinTree bt = new MinTree(b);
        for (int q = 0; q < 2000; q++) {
            if (r.nextBoolean()) {
                int i = r.nextInt(50), v = r.nextInt(1000);
                b[i] = v; bt.set(i, v);
            } else {
                int l = r.nextInt(50), h = l + r.nextInt(50 - l), m = Integer.MAX_VALUE;
                for (int i = l; i <= h; i++) m = Math.min(m, b[i]);
                ok &= bt.min(l, h) == m;
            }
        }
        System.out.println("2,000 random updates and queries match brute force: " + ok);
    }
}
```

> TIP: The bottom-up segment tree above is short enough to write from memory in an interview. Learn the recursive version with lazy propagation only if you are targeting companies known for hard problems; most rounds stop at point updates.

## 11.3 String matching in linear time

Naive search for a pattern of length *m* in a text of length *n* is O(nm) in the worst case. **KMP** precomputes, for each prefix of the pattern, the length of the longest proper prefix that is also a suffix (the **LPS** or failure array). On a mismatch it falls back using this array instead of restarting, giving O(n + m). **Rabin–Karp** compares rolling hashes of windows and checks characters only when hashes match; it extends easily to many patterns and to 2D.

```java run KMP failure function and search, with a comparison count
import java.util.*;

public class Main {
    static int[] lps(String p) {
        int[] f = new int[p.length()];
        for (int i = 1, len = 0; i < p.length(); ) {
            if (p.charAt(i) == p.charAt(len)) f[i++] = ++len;
            else if (len > 0) len = f[len - 1];                 // fall back, do not advance i
            else f[i++] = 0;
        }
        return f;
    }
    static long comparisons;
    static List<Integer> kmp(String t, String p) {
        int[] f = lps(p);
        List<Integer> hits = new ArrayList<>();
        for (int i = 0, j = 0; i < t.length(); ) {
            comparisons++;
            if (t.charAt(i) == p.charAt(j)) {
                i++; j++;
                if (j == p.length()) { hits.add(i - j); j = f[j - 1]; }
            } else if (j > 0) j = f[j - 1];
            else i++;
        }
        return hits;
    }
    static List<Integer> naive(String t, String p) {
        List<Integer> hits = new ArrayList<>();
        for (int i = 0; i + p.length() <= t.length(); i++) {
            int j = 0;
            while (j < p.length()) {
                comparisons++;
                if (t.charAt(i + j) != p.charAt(j)) break;
                j++;
            }
            if (j == p.length()) hits.add(i);
        }
        return hits;
    }
    public static void main(String[] args) {
        System.out.println("lps(\"aabaaab\") = " + Arrays.toString(lps("aabaaab")));
        System.out.println("matches of 'aba' in 'ababcababa': " + kmp("ababcababa", "aba"));
        String text = "a".repeat(10_000), pat = "a".repeat(99) + "b";
        comparisons = 0; naive(text, pat); long nv = comparisons;
        comparisons = 0; kmp(text, pat); long km = comparisons;
        System.out.printf("worst case n=10,000 m=100: naive %,d comparisons, KMP %,d%n",
                nv, km);
    }
}
```

> NOTE: For most interview string problems, `String.indexOf` is acceptable unless the interviewer asks for the algorithm. KMP's LPS array is also asked on its own: "shortest palindrome", "repeated substring pattern" and "longest happy prefix" are LPS problems in disguise.

## 11.4 Practical lessons

- Trie: O(L) per word; keep a count at each node for prefix-count queries.
- Updates and range sums interleaved: Fenwick tree. Range minimum/maximum with updates: segment tree.
- Compress large values to ranks before using them as Fenwick indices.
- KMP's failure array gives O(n + m) search and solves several "prefix that is also a suffix" problems directly.

# Chapter 12: Pattern Revision and Interview Checklist
%Recognise the pattern from the problem statement, avoid the classic bugs, and run the interview well

## 12.1 From problem statement to pattern

| If the problem says or has… | Think of | Chapter |
|---|---|---|
| Sorted array, find a pair or triplet | Two pointers | 2 |
| Contiguous subarray/substring, longest/shortest with a condition | Sliding window | 2 |
| Subarray sum equals *k*, with negatives | Prefix sum + hash map | 2 |
| "Have we seen this before?", duplicates, complements | Hash set/map | 2 |
| Sorted input, or "minimum value such that …" | Binary search (on index or on answer) | 3 |
| Overlapping intervals, meetings | Sort by start (merge) or by end (select); heap of ends | 3, 10 |
| Next greater/smaller, span, histogram | Monotonic stack | 4 |
| Window maximum/minimum | Monotonic deque | 4 |
| Linked list middle, cycle, *k*th from end | Fast and slow pointers | 4 |
| All combinations, permutations, subsets; "generate all" | Backtracking | 5 |
| Tree: path, depth, diameter, balance | DFS returning information upwards | 6 |
| Tree level by level, nearest | BFS | 6 |
| BST, sorted order, *k*th smallest | Inorder traversal | 6 |
| Top *k*, *k*th largest, merge *k* sorted | Heap | 7 |
| Running median | Two heaps | 7 |
| Shortest path, unweighted or grid | BFS | 8 |
| Shortest path, weighted | Dijkstra (non-negative), Bellman–Ford | 8 |
| Dependencies, ordering, prerequisites | Topological sort | 8 |
| Connected components, merging groups | DFS/BFS or union–find | 8 |
| Count ways, min/max cost with overlapping choices | Dynamic programming | 9 |
| Two strings: common, edit, match | 2D DP on prefixes | 9 |
| Local choice provably safe | Greedy (check with an exchange argument) | 10 |
| Appears once among pairs, subsets of ≤ 20 | Bit manipulation, bitmask | 10 |
| Answer modulo 10<sup>9</sup> + 7, nCr, primes | Modular arithmetic, sieve | 10 |
| Prefix of words, autocomplete | Trie | 11 |
| Range sum/min with updates | Fenwick or segment tree | 11 |

## 12.2 Complexity cheat sheet

| Operation | Cost |
|---|---|
| `ArrayList` get/set, add at end | O(1), amortised O(1) |
| `ArrayList` add/remove at index | O(n) |
| `ArrayDeque` push/pop/offer/poll | O(1) |
| `HashMap`/`HashSet` get/put/contains | O(1) average |
| `TreeMap`/`TreeSet` get/put/floor/ceiling | O(log n) |
| `PriorityQueue` offer/poll; peek | O(log n); O(1) |
| `PriorityQueue.remove(Object)` | O(n) |
| `Arrays.sort`, `Collections.sort` | O(n log n) |
| `String.substring`, `+` concatenation | O(length): strings are immutable and copied |
| `StringBuilder.append` | Amortised O(1) per character |
| BFS/DFS on V vertices and E edges | O(V + E) |
| Dijkstra with a binary heap | O((V + E) log V) |
| Union–find with both optimisations | Nearly O(1) amortised |

## 12.3 Bug checklist before you submit

| Check | Typical failure |
|---|---|
| Empty input, one element, two elements | `a[0]` on an empty array; loops that assume `n >= 2` |
| All equal, all negative, already sorted, reverse sorted | Kadane initialised to 0; quicksort worst case |
| Duplicates | Two pointers skipping too few or too many; BST with equal keys |
| Overflow | `int` sums and products; `(lo + hi) / 2`; comparator `a - b` |
| Off-by-one | `<` versus `<=` in loops and binary search; inclusive versus exclusive ends |
| Mutating while iterating | `ConcurrentModificationException`; modifying the input the caller still uses |
| Recursion depth | `StackOverflowError` on 10<sup>5</sup>-deep paths: use an explicit stack |
| Output format | Order of results, trailing spaces, `long` versus `int` printing, modulo applied |

## 12.4 Running the interview

| Phase | Time (45 min) | What to do |
|---|---|---|
| Understand | 3–5 min | Restate the problem. Ask: input size, value ranges, duplicates, negatives, empty input, expected output format |
| Examples | 2–3 min | Work one normal and one edge example by hand |
| Approach | 5–8 min | Say the brute force and its complexity; name the pattern that improves it; agree on the approach before coding |
| Code | 15–20 min | Small helper methods, meaningful names; talk while coding |
| Test | 5 min | Dry-run your example line by line; then the edge cases; fix bugs calmly |
| Discuss | Remaining | Complexity, trade-offs, follow-ups (streaming input, memory limits, parallelism) |

> TIP: If you are stuck, say what you know: "a brute force is O(n<sup>2</sup>) with two loops; the inner loop searches for a complement, so a hash map could remove it". Interviewers give hints to candidates who show their reasoning; silence gets no help.

## 12.5 Question bank for the last week

| Question | Core of a good answer |
|---|---|
| Why is `HashMap` O(1) on average but not always? | Hash collisions put several keys in one bucket; bad hashes degrade to a list (O(n)) or, since Java 8, a tree (O(log n)) |
| When would you choose `TreeMap` over `HashMap`? | When you need sorted iteration or floor/ceiling/range queries, accepting O(log n) |
| Why is building a heap O(n)? | Sift-down from the middle: most nodes are near the leaves and move only a few levels; the sum of heights is O(n) |
| Merge sort or quicksort? | Merge sort: stable, guaranteed O(n log n), O(n) extra space. Quicksort: in place and cache-friendly, O(n<sup>2</sup>) worst case without good pivots |
| How does Dijkstra fail with negative edges? | It finalises a vertex when popped, assuming no cheaper path can appear later; a negative edge breaks that assumption |
| BFS or DFS for shortest path? | BFS in unweighted graphs; DFS does not find shortest paths |
| Memoisation or tabulation? | Same recurrence; memoisation computes only needed states and is easier to write, tabulation avoids recursion and allows space optimisation |
| How do you detect a cycle in a directed graph? | DFS with grey/black colours (edge to a grey vertex), or Kahn's algorithm leaving vertices unprocessed |
| What makes a greedy algorithm correct? | An exchange argument: the greedy choice can replace the optimal choice without loss |
| What is amortised complexity? | Average cost per operation over a worst-case sequence, such as `ArrayList.add` with occasional resizes |
| How would you find duplicates in 10<sup>9</sup> numbers that do not fit in memory? | Partition by hash into files that fit, then dedupe each file; or sort externally; or a Bloom filter for an approximate first pass |
| Explain two pointers on an unsorted array. | It usually needs sorting first (O(n log n)); otherwise use a hash map for O(n) |

## 12.6 Practical lessons

- Train recognition, not memory: for each solved problem, write one line saying which clue pointed to the pattern.
- Always state brute force first, then improve; always state complexity at the end.
- Test on edge cases before saying "done".
- Revise this chapter on the morning of every coding round, then do one easy warm-up problem.
