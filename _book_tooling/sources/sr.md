# Java toolkit and traps
%The collections you reach for in every coding round, and the mistakes that fail submissions

## Input size to complexity

Java runs roughly 10⁸ simple operations per second once the JIT has warmed up.

| n up to | Target complexity | Typical techniques |
|---|---|---|
| 10–11 | O(n!) | Permutations, brute force |
| 20–25 | O(2ⁿ) or O(2ⁿ · n) | Subsets, bitmask DP |
| 500 | O(n³) | Floyd–Warshall, interval DP |
| 5,000 | O(n²) | Two nested loops, 2-D DP |
| 10⁵–10⁶ | O(n log n) or O(n) | Sorting, heaps, binary search, two pointers, prefix sums |
| 10⁹ and more | O(log n) or O(√n) | Binary search on the answer, maths, fast power |

## The collections

| Need | Use | Cost |
|---|---|---|
| Dynamic array | `ArrayList<Integer>`: `add`, `get`, `set` | O(1) amortised |
| Stack and queue | `ArrayDeque`: `push`/`pop`/`peek`, `offer`/`poll` | O(1) |
| Counting | `map.merge(key, 1, Integer::sum)` | O(1) average |
| Grouping | `map.computeIfAbsent(key, k -> new ArrayList<>()).add(x)` | O(1) average |
| Min-heap | `new PriorityQueue<>()` | O(log n) |
| Max-heap | `new PriorityQueue<>(Comparator.reverseOrder())` | O(log n) |
| Heap of arrays | `new PriorityQueue<int[]>((a, b) -> Integer.compare(a[0], b[0]))` | O(log n) |
| Ordered map or set | `TreeMap`, `TreeSet`: `floorKey`, `ceilingKey`, `firstKey`, `pollFirst` | O(log n) |
| Insertion order, LRU | `LinkedHashMap(cap, 0.75f, true)` with `removeEldestEntry` | O(1) |
| Sorting | `Arrays.sort(int[])` (dual-pivot quicksort), `Arrays.sort(T[], cmp)` (stable merge sort) | O(n log n) |
| Fill and copy | `Arrays.fill`, `Arrays.copyOfRange`, `list.toArray`, `IntStream` | O(n) |
| Big numbers | `long`, `Math.addExact`, `BigInteger` | — |

## Traps that fail submissions

| Trap | Wrong | Right |
|---|---|---|
| Overflow | `int` sum or product of large values | `long`, cast before multiplying: `(long) a * b` |
| Midpoint | `(lo + hi) / 2` overflows | `lo + (hi - lo) / 2` or `(lo + hi) >>> 1` |
| Boxed equality | `Integer a == b` (true only for −128…127) | `a.equals(b)` or unbox |
| Comparator | `(a, b) -> a - b` overflows | `Integer.compare(a, b)` |
| Negative modulo | `-7 % 3` is −1 | `Math.floorMod(-7, 3)` is 2 |
| String building | `s += x` in a loop | `StringBuilder` |
| `remove` on a list | `list.remove(5)` removes index 5 | `list.remove(Integer.valueOf(5))` removes the value |
| Descending `int[]` | `Arrays.sort(int[], cmp)` does not exist | Sort `Integer[]`, or sort and reverse |
| Slow I/O | `Scanner` for 10⁵ lines | `BufferedReader` and `StringTokenizer`; `PrintWriter` for output |
| Recursion depth | Deep DFS throws `StackOverflowError` | Iterative stack, or run in a `Thread` with a large stack |
| Modifying while iterating | `list.remove` inside a for-each | `Iterator.remove` or `removeIf` |
| Map default | `map.get(k) + 1` throws for a missing key | `getOrDefault(k, 0)` or `merge` |

# Pattern templates

## Arrays and hashing

```java run Two pointers, sliding window and a prefix-sum counter
import java.util.*;

public class Main {
    static int[] twoSumSorted(int[] a, int target) {
        int i = 0, j = a.length - 1;
        while (i < j) {
            int s = a[i] + a[j];
            if (s == target) return new int[]{i, j};
            if (s < target) i++; else j--;
        }
        return null;
    }

    static int longestNoRepeat(String s) {
        Map<Character, Integer> last = new HashMap<>();
        int left = 0, best = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (last.getOrDefault(c, -1) >= left) left = last.get(c) + 1;
            last.put(c, right);
            best = Math.max(best, right - left + 1);
        }
        return best;
    }

    static int countSumK(int[] nums, int k) {
        Map<Long, Integer> seen = new HashMap<>(Map.of(0L, 1));
        long total = 0;
        int count = 0;
        for (int x : nums) {
            total += x;
            count += seen.getOrDefault(total - k, 0);
            seen.merge(total, 1, Integer::sum);
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(twoSumSorted(new int[]{1, 3, 4, 6, 9}, 10)) + " "
                + longestNoRepeat("abcabcbb") + " " + countSumK(new int[]{1, 1, 1}, 2) + " "
                + countSumK(new int[]{3, 4, 7, 2, -3, 1, 4, 2}, 7));
    }
}
```

| Signal | Pattern |
|---|---|
| Sorted array, pair or triple with a target | Two pointers |
| Longest or shortest contiguous window with a condition | Sliding window (non-negative values only) |
| Subarray sum equals k, values may be negative | Prefix sum plus a `HashMap` |
| Range sums, many queries, no updates | Prefix sum array of `long` |
| Range additions, read once at the end | Difference array |
| Maximum subarray sum | Kadane: `cur = max(x, cur + x)` |

## Binary search

```java run First true, and binary search on the answer
import java.util.function.IntPredicate;

public class Main {
    static int firstTrue(int lo, int hi, IntPredicate ok) {
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (ok.test(mid)) hi = mid; else lo = mid + 1;
        }
        return lo;
    }

    public static void main(String[] args) {
        int[] a = {2, 4, 4, 4, 8, 9};
        System.out.println("first index with a[i] >= 4: "
                + firstTrue(0, a.length, i -> a[i] >= 4));
        int[] w = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        int days = 5;
        IntPredicate ships = cap -> {
            int trips = 1, load = 0;
            for (int x : w) {
                if (load + x > cap) { trips++; load = 0; }
                load += x;
            }
            return trips <= days;
        };
        System.out.println("least ship capacity: " + firstTrue(10, 55, ships));
    }
}
```

Use `hi = a.length` (one past the end) so "not found" is a valid answer. For answers, set `lo` to the smallest possible value (here the heaviest package) and `hi` to one that surely works (the total weight). The predicate must be false…false, true…true. `Arrays.binarySearch` returns **some** matching index when there are duplicates, not necessarily the first.

## Stacks, queues and linked lists

| Problem | Tool |
|---|---|
| Next greater or smaller element, histogram area, stock span | Monotonic stack of indices (`ArrayDeque<Integer>`) |
| Sliding window maximum | Monotonic `ArrayDeque` of indices |
| Valid brackets, expression evaluation | Stack |
| Cycle detection, middle node | Slow and fast pointers |
| Reverse a linked list | `prev = null`; loop: `next = cur.next; cur.next = prev; prev = cur; cur = next` |
| Merge k sorted lists | `PriorityQueue<ListNode>` ordered by value |
| Simplify edge cases | A dummy head node |

```java run Monotonic stack and deque
import java.util.*;

public class Main {
    static int[] nextGreater(int[] a) {
        int[] out = new int[a.length];
        Arrays.fill(out, -1);
        Deque<Integer> stack = new ArrayDeque<>();
        for (int i = 0; i < a.length; i++) {
            while (!stack.isEmpty() && a[stack.peek()] < a[i]) out[stack.pop()] = a[i];
            stack.push(i);
        }
        return out;
    }

    static List<Integer> windowMax(int[] a, int k) {
        Deque<Integer> dq = new ArrayDeque<>();
        List<Integer> out = new ArrayList<>();
        for (int i = 0; i < a.length; i++) {
            while (!dq.isEmpty() && a[dq.peekLast()] <= a[i]) dq.pollLast();
            dq.offerLast(i);
            if (dq.peekFirst() <= i - k) dq.pollFirst();
            if (i >= k - 1) out.add(a[dq.peekFirst()]);
        }
        return out;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(nextGreater(new int[]{2, 1, 2, 4, 3})) + " "
                + windowMax(new int[]{1, 3, -1, -3, 5, 3, 6, 7}, 3));
    }
}
```

## Backtracking

```java run Subsets, permutations and combination sum
import java.util.*;

public class Main {
    static void subsets(int[] nums, int i, Deque<Integer> path, List<List<Integer>> out) {
        if (i == nums.length) { out.add(new ArrayList<>(path)); return; }
        subsets(nums, i + 1, path, out);
        path.addLast(nums[i]);
        subsets(nums, i + 1, path, out);
        path.removeLast();
    }

    static void perms(int[] nums, boolean[] used, Deque<Integer> path,
                      List<List<Integer>> out) {
        if (path.size() == nums.length) { out.add(new ArrayList<>(path)); return; }
        for (int i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            used[i] = true; path.addLast(nums[i]);
            perms(nums, used, path, out);
            path.removeLast(); used[i] = false;
        }
    }

    static void combSum(int[] c, int start, int left, Deque<Integer> path,
                        List<List<Integer>> out) {
        if (left == 0) { out.add(new ArrayList<>(path)); return; }
        for (int i = start; i < c.length; i++) {
            if (c[i] > left) continue;
            path.addLast(c[i]);
            combSum(c, i, left - c[i], path, out);
            path.removeLast();
        }
    }

    public static void main(String[] args) {
        List<List<Integer>> s = new ArrayList<>(), p = new ArrayList<>();
        List<List<Integer>> c = new ArrayList<>();
        subsets(new int[]{1, 2, 3}, 0, new ArrayDeque<>(), s);
        perms(new int[]{1, 2, 3}, new boolean[3], new ArrayDeque<>(), p);
        combSum(new int[]{2, 3, 6, 7}, 0, 7, new ArrayDeque<>(), c);
        System.out.println(s.size() + " " + p.size() + " " + c);
    }
}
```

Choose, recurse, un-choose. Add `new ArrayList<>(path)`, never `path` itself. For duplicates in the input, sort first and skip `nums[i] == nums[i − 1]` when `i > start`.

## Trees

| Task | Template |
|---|---|
| Height, diameter, balanced | Post-order: compute children first, return a value up |
| Level order, right view, zigzag | BFS with `int size = q.size()` before the inner loop |
| Validate a BST | Pass `long` bounds `(low, high)` down (values may equal `Integer.MIN_VALUE`) |
| k-th smallest in a BST | In-order traversal, count visits |
| LCA in a binary tree | Return the node if it is p or q; both sides non-null means LCA |
| LCA in a BST | Go left if both smaller, right if both larger, else here |
| Serialize | Pre-order with `#` for null |

## Heaps

| Problem | Approach |
|---|---|
| k largest elements | Min-heap of size k: `offer`, then `poll` when size > k |
| k-th largest in a stream | Min-heap of size k; `peek` is the answer |
| Median of a stream | Max-heap for the low half, min-heap for the high half |
| Merge k sorted lists | Heap of the current heads |
| Scheduling by deadline or cost | Sort, then a heap of the best choices so far |

# Graphs

```java run BFS, Dijkstra, topological sort and union–find
import java.util.*;

public class Main {
    static int[] bfs(List<List<Integer>> adj, int src) {
        int[] dist = new int[adj.size()];
        Arrays.fill(dist, -1);
        dist[src] = 0;
        Deque<Integer> q = new ArrayDeque<>(List.of(src));
        while (!q.isEmpty()) {
            int u = q.poll();
            for (int v : adj.get(u))
                if (dist[v] == -1) { dist[v] = dist[u] + 1; q.offer(v); }
        }
        return dist;
    }

    static long[] dijkstra(List<List<int[]>> adj, int src) {
        long[] dist = new long[adj.size()];
        Arrays.fill(dist, Long.MAX_VALUE);
        dist[src] = 0;
        PriorityQueue<long[]> pq = new PriorityQueue<>((a, b) -> Long.compare(a[0], b[0]));
        pq.offer(new long[]{0, src});
        while (!pq.isEmpty()) {
            long[] top = pq.poll();
            int u = (int) top[1];
            if (top[0] > dist[u]) continue;
            for (int[] e : adj.get(u))
                if (dist[u] + e[1] < dist[e[0]]) {
                    dist[e[0]] = dist[u] + e[1];
                    pq.offer(new long[]{dist[e[0]], e[0]});
                }
        }
        return dist;
    }

    static List<Integer> topo(int n, int[][] edges) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        int[] indeg = new int[n];
        for (int[] e : edges) { adj.get(e[0]).add(e[1]); indeg[e[1]]++; }
        Deque<Integer> q = new ArrayDeque<>();
        for (int i = 0; i < n; i++) if (indeg[i] == 0) q.offer(i);
        List<Integer> order = new ArrayList<>();
        while (!q.isEmpty()) {
            int u = q.poll();
            order.add(u);
            for (int v : adj.get(u)) if (--indeg[v] == 0) q.offer(v);
        }
        return order.size() == n ? order : null;
    }

    static int[] parent = {0, 1, 2, 3, 4, 5};
    static int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }

    public static void main(String[] args) {
        List<List<Integer>> g = List.of(List.of(1, 2), List.of(3), List.of(3), List.of());
        System.out.println(Arrays.toString(bfs(g, 0)));
        List<List<int[]>> w = List.of(List.of(new int[]{1, 4}, new int[]{2, 1}),
                List.of(new int[]{3, 1}), List.of(new int[]{1, 2}, new int[]{3, 5}),
                List.of());
        System.out.println(Arrays.toString(dijkstra(w, 0)));
        System.out.println(topo(4, new int[][]{{0, 1}, {0, 2}, {1, 3}, {2, 3}}) + " "
                + topo(2, new int[][]{{0, 1}, {1, 0}}));
        for (int[] e : new int[][]{{0, 1}, {2, 3}, {1, 3}}) parent[find(e[0])] = find(e[1]);
        System.out.println("0 and 2 connected: " + (find(0) == find(2))
                + " | 4 and 5: " + (find(4) == find(5)));
    }
}
```

| Graph problem | Algorithm | Complexity |
|---|---|---|
| Shortest path, unweighted | BFS | O(V + E) |
| Shortest path, weights 0 or 1 | 0–1 BFS with an `ArrayDeque` | O(V + E) |
| Shortest path, non-negative weights | Dijkstra with a `PriorityQueue` | O((V + E) log V) |
| Negative weights, or at most k edges | Bellman–Ford (copy the array per round) | O(V · E) |
| All pairs, V ≤ 400 | Floyd–Warshall | O(V³) |
| Order with dependencies, cycle check | Kahn's topological sort | O(V + E) |
| Dynamic connectivity, redundant edge | Union–find | about O(1) each |
| Minimum spanning tree | Kruskal (sort and DSU) or Prim (heap) | O(E log E) |
| Grid problems | BFS/DFS with `int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}}` | O(rows · cols) |
| Two-colouring | BFS colouring | O(V + E) |

# Dynamic programming

Steps: define the state in words, write the transition, set the base cases, choose the order, then shrink memory if a row only depends on the previous one.

```java run Coin change, LIS, LCS and 0/1 knapsack
import java.util.*;

public class Main {
    static int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, Integer.MAX_VALUE);
        dp[0] = 0;
        for (int x = 1; x <= amount; x++)
            for (int c : coins)
                if (c <= x && dp[x - c] != Integer.MAX_VALUE)
                    dp[x] = Math.min(dp[x], dp[x - c] + 1);
        return dp[amount] == Integer.MAX_VALUE ? -1 : dp[amount];
    }

    static int lis(int[] nums) {
        int[] tails = new int[nums.length];
        int len = 0;
        for (int x : nums) {
            int i = Arrays.binarySearch(tails, 0, len, x);
            if (i < 0) i = -i - 1;
            tails[i] = x;
            if (i == len) len++;
        }
        return len;
    }

    static int lcs(String a, String b) {
        int[][] dp = new int[a.length() + 1][b.length() + 1];
        for (int i = 1; i <= a.length(); i++)
            for (int j = 1; j <= b.length(); j++)
                dp[i][j] = a.charAt(i - 1) == b.charAt(j - 1) ? dp[i - 1][j - 1] + 1
                        : Math.max(dp[i - 1][j], dp[i][j - 1]);
        return dp[a.length()][b.length()];
    }

    static int knapsack(int[][] items, int cap) {
        int[] dp = new int[cap + 1];
        for (int[] it : items)
            for (int c = cap; c >= it[0]; c--) dp[c] = Math.max(dp[c], dp[c - it[0]] + it[1]);
        return dp[cap];
    }

    public static void main(String[] args) {
        System.out.println(coinChange(new int[]{1, 2, 5}, 11) + " "
                + coinChange(new int[]{2}, 3)
                + " " + lis(new int[]{10, 9, 2, 5, 3, 7, 101, 18}) + " " + lcs("abcde", "ace")
                + " " + knapsack(new int[][]{{1, 1}, {3, 4}, {4, 5}, {5, 7}}, 7));
    }
}
```

The `dp[x - c] != Integer.MAX_VALUE` check matters: `MAX_VALUE + 1` overflows to a negative number, which `min` would then pick. In LIS, `Arrays.binarySearch` on the distinct tails gives the insertion point as `-(i) - 1` when the value is missing.

| Family | State | Example problems |
|---|---|---|
| Linear | dp[i] using a few previous values | Stairs, house robber, decode ways |
| Knapsack | dp[capacity], backwards for 0/1, forwards for unlimited | Subset sum, coin change, partition |
| Two strings | dp[i][j] over prefixes | LCS, edit distance, regex matching |
| Grid | dp[r][c] from top and left | Unique paths, minimum path sum |
| Intervals | dp[i][j] over a range, split at k | Burst balloons, matrix chain, palindromes |
| Bitmask | dp[mask][last] | Travelling salesman, assignment (n ≤ 20) |
| State machine | A few states per day | Stock with cooldown or fee |

# Greedy, bits, structures and final checks

## Greedy, bits and number theory

| Greedy problem | Rule |
|---|---|
| Maximum non-overlapping intervals | Sort by end, take if start ≥ last end |
| Merge intervals | Sort by start, extend the last merged interval |
| Jump game | Track the furthest reachable index |
| Gas station | Reset the start after a negative running tank |
| Meeting rooms needed | Sort starts and ends, or a heap of end times |

| Bit trick | Meaning |
|---|---|
| `x & (x - 1)` | Clears the lowest set bit; equals 0 for powers of two |
| `x & -x` | Lowest set bit (used by Fenwick trees) |
| `a ^ a == 0` | XOR of all values finds the single unpaired one |
| `Integer.bitCount(x)`, `Long.bitCount(x)` | Number of set bits |
| `(mask >> i) & 1` | Is item i in the subset? |
| `>>>` versus `>>` | Unsigned versus sign-extending right shift |

| Number theory | Java |
|---|---|
| GCD | `static long gcd(long a, long b) { return b == 0 ? a : gcd(b, a % b); }` |
| Fast power mod m | Square-and-multiply with `long`, or `BigInteger.modPow` |
| Modular inverse (m prime) | `pow(a, m - 2, m)` |
| Primes up to n | Sieve of Eratosthenes with a `boolean[]`, O(n log log n) |
| nCr mod p | Precomputed factorials and inverse factorials in `long[]` |

## Advanced structures

| Structure | Operations | Use for |
|---|---|---|
| Trie (`Node[26]` children) | Insert, search, prefix in O(length) | Autocomplete, word search, XOR maximum |
| Fenwick tree | Point update, prefix sum in O(log n) | Inversions, count smaller after self |
| Segment tree | Range query and point update in O(log n) | Range minimum, range sum with updates |
| Prefix function (KMP) | O(n + m) pattern search | Pattern matching, smallest period |
| Rolling hash | O(1) window hash | Repeated substrings, Rabin–Karp |
| `TreeMap` | floor, ceiling, range views in O(log n) | Calendars, interval booking, sliding medians |

## Bug checklist before you submit

| Check | Example |
|---|---|
| Empty input, single element | `new int[0]`, `{x}`, `""` |
| All equal, all negative, zeros | Duplicates in binary search; product with 0 |
| Off-by-one at the boundaries | `i < n - 1` versus `i < n`; `hi = a.length` |
| Overflow | Sums and products in `long`; `% MOD` after every multiplication |
| Recursion depth | Chain-shaped trees and deep DFS |
| Object equality | `==` on `String` or `Integer` |
| Returning a reference | `out.add(path)` instead of `new ArrayList<>(path)` |
| Visited marking | Mark when pushing in BFS, not when popping |
