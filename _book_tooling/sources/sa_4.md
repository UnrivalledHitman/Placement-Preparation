# Chapter 9: Dynamic Programming
%From recursion to memoisation to tables, the five DP families, and how to define a state

## 9.1 The method

Dynamic programming (DP) applies when a problem has **optimal substructure** (the best answer is built from best answers to subproblems) and **overlapping subproblems** (the same subproblem is needed many times). Every DP solution answers four questions; write them down before coding.

| Step | Question | Example: climbing stairs with 1 or 2 steps |
|---|---|---|
| 1. State | What does `dp[i]` (or `dp[i][j]`) mean, in words? | `dp[i]` = number of ways to reach step *i* |
| 2. Transition | How is a state computed from smaller states? | `dp[i] = dp[i-1] + dp[i-2]` |
| 3. Base cases | Which states are known directly? | `dp[0] = 1`, `dp[1] = 1` |
| 4. Answer and order | Which state is the answer; in what order are states filled? | `dp[n]`, *i* increasing |

There are two ways to implement the same recurrence. **Top-down** (memoisation) writes the recursion and caches results; it is the fastest to get right. **Bottom-up** (tabulation) fills a table in dependency order; it avoids recursion depth limits and makes space optimisation easy. Start top-down if the order is unclear, then convert.

```java run Three implementations of one recurrence: min cost to climb stairs
import java.util.*;

public class Main {
    static int[] cost = {10, 15, 20, 5, 25, 10, 5, 30};
    static Integer[] memo = new Integer[cost.length + 1];
    static int top(int i) {                       // min cost to stand on step i
        if (i <= 1) return 0;                     // may start on step 0 or 1 for free
        if (memo[i] != null) return memo[i];
        return memo[i] = Math.min(top(i - 1) + cost[i - 1], top(i - 2) + cost[i - 2]);
    }
    public static void main(String[] args) {
        int n = cost.length;
        int[] dp = new int[n + 1];                // bottom-up table
        for (int i = 2; i <= n; i++)
            dp[i] = Math.min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2]);
        int a = 0, b = 0;                         // O(1) space: only two previous states
        for (int i = 2; i <= n; i++) {
            int c = Math.min(b + cost[i - 1], a + cost[i - 2]);
            a = b;
            b = c;
        }
        System.out.println("top-down " + top(n) + ", bottom-up " + dp[n]
                + ", O(1) space " + b);
        System.out.println("table " + Arrays.toString(dp));
    }
}
```

> TIP: If `dp[i]` depends only on the previous one or two rows or values, keep just those: O(n) space becomes O(1), O(nm) becomes O(m). Do this **after** the full table version works.

## 9.2 One-dimensional DP

| Problem | State | Transition |
|---|---|---|
| House robber | best loot from the first *i* houses | `max(dp[i-1], dp[i-2] + a[i-1])` |
| Decode ways (`"12"` → AB or L) | ways to decode the first *i* characters | `dp[i-1]` if one digit valid, `+ dp[i-2]` if two digits valid |
| Word break | can the first *i* characters be split into words? | any `j < i` with `dp[j]` and `s[j..i)` in the dictionary |
| Longest increasing subsequence | LIS ending at *i* | `1 + max(dp[j])` over `j < i`, `a[j] < a[i]`: O(n<sup>2</sup>) |
| Coin change (fewest coins) | fewest coins for amount *x* | `1 + min(dp[x - c])` over coins *c* |
| Coin change (number of ways) | ways to make *x* | loop coins outside, amounts inside: `dp[x] += dp[x - c]` |

```java run House robber, decode ways and word break
import java.util.*;

public class Main {
    static int rob(int[] a) {
        int prev2 = 0, prev1 = 0;
        for (int x : a) {
            int cur = Math.max(prev1, prev2 + x);
            prev2 = prev1; prev1 = cur;
        }
        return prev1;
    }
    static int decodeWays(String s) {
        int n = s.length();
        int[] dp = new int[n + 1];
        dp[0] = 1;
        for (int i = 1; i <= n; i++) {
            if (s.charAt(i - 1) != '0') dp[i] += dp[i - 1];
            if (i >= 2) {
                int two = Integer.parseInt(s.substring(i - 2, i));
                if (two >= 10 && two <= 26) dp[i] += dp[i - 2];
            }
        }
        return dp[n];
    }
    static boolean wordBreak(String s, Set<String> dict) {
        boolean[] dp = new boolean[s.length() + 1];
        dp[0] = true;
        for (int i = 1; i <= s.length(); i++)
            for (int j = 0; j < i && !dp[i]; j++)
                dp[i] = dp[j] && dict.contains(s.substring(j, i));
        return dp[s.length()];
    }
    public static void main(String[] args) {
        System.out.println("rob [2,7,9,3,1] = " + rob(new int[]{2, 7, 9, 3, 1}));
        for (String s : new String[]{"12", "226", "06", "11106"})
            System.out.println("decode '" + s + "' = " + decodeWays(s));
        Set<String> dict = Set.of("apple", "pen", "pine", "pineapple");
        System.out.println("pineapplepenapple? " + wordBreak("pineapplepenapple", dict)
                + ", applepie? " + wordBreak("applepie", dict));
    }
}
```

### Coin change: order of loops decides what is counted

For the **number of ways** to make an amount, looping over coins in the outer loop counts **combinations** (1+2 and 2+1 are the same). Swapping the loops counts **permutations** (ordered sequences). Both are correct answers to different questions; read which one is asked.

```java run Coin change: fewest coins, combinations and permutations
import java.util.*;

public class Main {
    public static void main(String[] args) {
        int[] coins = {1, 2, 5};
        int amount = 11;
        int[] fewest = new int[amount + 1];
        Arrays.fill(fewest, Integer.MAX_VALUE);
        fewest[0] = 0;
        for (int x = 1; x <= amount; x++)
            for (int c : coins)
                if (c <= x && fewest[x - c] != Integer.MAX_VALUE)
                    fewest[x] = Math.min(fewest[x], fewest[x - c] + 1);
        System.out.println("fewest coins for 11: " + fewest[amount]);

        int target = 5;
        long[] comb = new long[target + 1]; comb[0] = 1;
        for (int c : coins) for (int x = c; x <= target; x++) comb[x] += comb[x - c];
        long[] perm = new long[target + 1]; perm[0] = 1;
        for (int x = 1; x <= target; x++)
            for (int c : coins) if (c <= x) perm[x] += perm[x - c];
        System.out.println("ways to make 5: combinations " + comb[target]
                + ", ordered sequences " + perm[target]);
    }
}
```

> TRAP: A greedy "take the largest coin first" works for Indian currency but not in general: with coins {1, 3, 4} and amount 6, greedy gives 4+1+1 (three coins) while the optimum is 3+3 (two). Interviewers use exactly this counter-example.

## 9.3 Longest increasing subsequence in O(n log n)

Keep an array `tails` where `tails[k]` is the **smallest possible tail** of an increasing subsequence of length *k* + 1. For each element, binary-search the first tail ≥ it and replace that tail (or append). `tails` stays sorted, and its length is the LIS length. `tails` itself is **not** a valid subsequence; it is a summary.

```java run LIS: O(n^2) DP and the O(n log n) tails method
import java.util.*;

public class Main {
    static int quadratic(int[] a) {
        int[] dp = new int[a.length]; int best = 0;
        for (int i = 0; i < a.length; i++) {
            dp[i] = 1;
            for (int j = 0; j < i; j++) if (a[j] < a[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
            best = Math.max(best, dp[i]);
        }
        return best;
    }
    static int fast(int[] a) {
        int[] tails = new int[a.length]; int len = 0;
        for (int x : a) {
            int lo = 0, hi = len;                    // first tail >= x
            while (lo < hi) {
                int m = (lo + hi) >>> 1;
                if (tails[m] >= x) hi = m;
                else lo = m + 1;
            }
            tails[lo] = x;
            if (lo == len) len++;
        }
        return len;
    }
    public static void main(String[] args) {
        int[] a = {10, 9, 2, 5, 3, 7, 101, 18, 4, 19};
        System.out.println("LIS length: O(n^2) " + quadratic(a) + ", O(n log n) "
                + fast(a));
        Random r = new Random(5); boolean ok = true;
        for (int t = 0; t < 300; t++) {
            int[] x = new int[1 + r.nextInt(40)];
            for (int i = 0; i < x.length; i++) x[i] = r.nextInt(30);
            ok &= quadratic(x) == fast(x);
        }
        System.out.println("300 random arrays agree: " + ok);
    }
}
```

> NOTE: For the longest **non-decreasing** subsequence, search for the first tail **>** x instead of ≥ x. Many "box stacking" and "Russian doll envelopes" problems reduce to LIS after sorting by one dimension.

## 9.4 Two-dimensional DP on two sequences

When the input is two strings, the state is almost always `dp[i][j]` = answer for the prefixes `s[0..i)` and `t[0..j)`. Compare the last characters, and take the best of a few smaller prefixes.

| Problem | If `s[i-1] == t[j-1]` | Otherwise |
|---|---|---|
| Longest common subsequence | `dp[i-1][j-1] + 1` | `max(dp[i-1][j], dp[i][j-1])` |
| Edit distance | `dp[i-1][j-1]` | `1 + min(replace dp[i-1][j-1], delete dp[i-1][j], insert dp[i][j-1])` |
| Longest common substring | `dp[i-1][j-1] + 1` (track max) | `0` |
| Distinct subsequences (count *t* in *s*) | `dp[i-1][j-1] + dp[i-1][j]` | `dp[i-1][j]` |

```java run LCS with reconstruction, and edit distance
public class Main {
    static String lcs(String s, String t) {
        int n = s.length(), m = t.length();
        int[][] dp = new int[n + 1][m + 1];
        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= m; j++)
                dp[i][j] = s.charAt(i - 1) == t.charAt(j - 1) ? dp[i - 1][j - 1] + 1
                        : Math.max(dp[i - 1][j], dp[i][j - 1]);
        StringBuilder sb = new StringBuilder();          // walk back from the corner
        for (int i = n, j = m; i > 0 && j > 0; ) {
            if (s.charAt(i - 1) == t.charAt(j - 1)) {
                sb.append(s.charAt(i - 1)); i--; j--;
            }
            else if (dp[i - 1][j] >= dp[i][j - 1]) i--;
            else j--;
        }
        return sb.reverse().toString();
    }
    static int editDistance(String s, String t) {
        int n = s.length(), m = t.length();
        int[][] dp = new int[n + 1][m + 1];
        for (int i = 0; i <= n; i++) dp[i][0] = i;        // delete everything
        for (int j = 0; j <= m; j++) dp[0][j] = j;        // insert everything
        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= m; j++)
                dp[i][j] = s.charAt(i - 1) == t.charAt(j - 1) ? dp[i - 1][j - 1]
                        : 1 + Math.min(dp[i - 1][j - 1],              // replace
                                Math.min(dp[i - 1][j], dp[i][j - 1]));   // delete, insert
        return dp[n][m];
    }
    public static void main(String[] args) {
        System.out.println("LCS(ABCBDAB, BDCABA) = " + lcs("ABCBDAB", "BDCABA"));
        System.out.println("edit(horse, ros) = " + editDistance("horse", "ros")
                + ", edit(intention, execution) = "
                + editDistance("intention", "execution"));
    }
}
```

## 9.5 Knapsack

In the **0/1 knapsack**, each item is taken at most once: `dp[w]` = best value with capacity *w*. With a one-dimensional array, loop the capacity **downwards** so that each item is used once; looping upwards turns it into the **unbounded** knapsack, where items can be reused. Subset sum and "partition into two equal-sum halves" are 0/1 knapsack with booleans.

```java run 0/1 versus unbounded knapsack, and equal-sum partition
public class Main {
    public static void main(String[] args) {
        int[] wt = {1, 3, 4, 5}, val = {1, 4, 5, 7};
        int cap = 7;
        int[] once = new int[cap + 1], reuse = new int[cap + 1];
        for (int i = 0; i < wt.length; i++) {
            for (int w = cap; w >= wt[i]; w--)
                once[w] = Math.max(once[w], once[w - wt[i]] + val[i]);
            for (int w = wt[i]; w <= cap; w++)
                reuse[w] = Math.max(reuse[w], reuse[w - wt[i]] + val[i]);
        }
        System.out.println("capacity 7: 0/1 best " + once[cap] + ", unbounded best "
                + reuse[cap]);

        for (int[] a : new int[][]{{1, 5, 11, 5}, {1, 2, 3, 5}}) {
            int sum = 0; for (int x : a) sum += x;
            boolean ok = sum % 2 == 0;
            if (ok) {
                boolean[] can = new boolean[sum / 2 + 1]; can[0] = true;
                for (int x : a) for (int s = sum / 2; s >= x; s--) can[s] |= can[s - x];
                ok = can[sum / 2];
            }
            System.out.println(java.util.Arrays.toString(a) + " splits into equal halves? "
                    + ok);
        }
    }
}
```

Both answers are 9 here, which is worth checking by hand. 0/1: the items of weight 3 and 4 (values 4 + 5). Unbounded: reuse is allowed but does not beat 9 for capacity 7; several combinations tie, such as 5 + 1 + 1 (values 7 + 1 + 1) and 3 + 3 + 1 (values 4 + 4 + 1). With capacity 10 the two versions differ: 0/1 reaches 13 (weights 5 + 4 + 1), while unbounded takes the weight-5 item twice for 14.

## 9.6 Grid DP

| Problem | Transition |
|---|---|
| Unique paths (moves right/down) | `dp[r][c] = dp[r-1][c] + dp[r][c-1]`, 0 on obstacles |
| Minimum path sum | `grid[r][c] + min(dp[r-1][c], dp[r][c-1])` |
| Largest square of 1s | `1 + min(up, left, up-left)` if the cell is 1 |
| Dungeon / minimum starting health | Fill **backwards** from the destination |

```java run Unique paths with obstacles and the largest square
public class Main {
    public static void main(String[] args) {
        // 1 = blocked
        int[][] g = {{0, 0, 0, 0}, {0, 1, 0, 0}, {0, 0, 0, 1}, {1, 0, 0, 0}};
        int R = g.length, C = g[0].length;
        long[] dp = new long[C];
        dp[0] = 1;
        for (int r = 0; r < R; r++)
            for (int c = 0; c < C; c++) {
                if (g[r][c] == 1) dp[c] = 0;
                else if (c > 0) dp[c] += dp[c - 1];   // dp[c] already holds "from above"
            }
        System.out.println("paths avoiding obstacles " + dp[C - 1]);

        char[][] m = {"10100".toCharArray(), "10111".toCharArray(),
                      "11111".toCharArray(), "10010".toCharArray()};
        int[][] sq = new int[m.length + 1][m[0].length + 1];
        int best = 0;
        for (int r = 1; r <= m.length; r++)
            for (int c = 1; c <= m[0].length; c++)
                if (m[r - 1][c - 1] == '1') {
                    int up = sq[r - 1][c], left = sq[r][c - 1], diag = sq[r - 1][c - 1];
                    sq[r][c] = 1 + Math.min(diag, Math.min(up, left));
                    best = Math.max(best, sq[r][c]);
                }
        System.out.println("largest square of 1s has area " + best * best);
    }
}
```

## 9.7 Interval DP and DP on subsets

**Interval DP** solves a problem on `a[i..j]` by trying every split point *k* inside it; fill by increasing interval length. Matrix-chain multiplication, burst balloons, palindrome partitioning and "minimum cost to cut a stick" are all this shape, O(n<sup>3</sup>).

**Bitmask DP** represents a subset of up to ~20 items as the bits of an integer. The travelling salesman problem with *n* cities is `dp[mask][last]` = shortest path that visits exactly the cities in `mask` and ends at `last`, O(2<sup>n</sup> · n<sup>2</sup>).

```java run Longest palindromic subsequence and a small travelling salesman
import java.util.*;

public class Main {
    static int lps(String s) {                              // interval DP on s[i..j]
        int n = s.length();
        int[][] dp = new int[n][n];
        for (int i = n - 1; i >= 0; i--) {
            dp[i][i] = 1;
            for (int j = i + 1; j < n; j++)
                dp[i][j] = s.charAt(i) == s.charAt(j) ? dp[i + 1][j - 1] + 2
                        : Math.max(dp[i + 1][j], dp[i][j - 1]);
        }
        return dp[0][n - 1];
    }
    public static void main(String[] args) {
        System.out.println("longest palindromic subsequence of 'bbbab' = " + lps("bbbab")
                + ", of 'character' = " + lps("character"));

        int[][] d = {{0, 10, 15, 20}, {10, 0, 35, 25}, {15, 35, 0, 30}, {20, 25, 30, 0}};
        int n = d.length, FULL = (1 << n) - 1, INF = Integer.MAX_VALUE / 2;
        int[][] dp = new int[1 << n][n];
        for (int[] row : dp) Arrays.fill(row, INF);
        dp[1][0] = 0;                                        // start at city 0
        for (int mask = 1; mask <= FULL; mask++)
            for (int last = 0; last < n; last++) {
                if (dp[mask][last] >= INF || (mask & (1 << last)) == 0) continue;
                for (int nxt = 0; nxt < n; nxt++)
                    if ((mask & (1 << nxt)) == 0) {
                        int nm = mask | (1 << nxt);
                        dp[nm][nxt] = Math.min(dp[nm][nxt], dp[mask][last] + d[last][nxt]);
                    }
            }
        int best = INF;
        for (int last = 1; last < n; last++)
            best = Math.min(best, dp[FULL][last] + d[last][0]);
        System.out.println("shortest tour through 4 cities = " + best);
    }
}
```

## 9.8 Recognising a DP problem

| Phrase in the problem | Likely DP family |
|---|---|
| "number of ways", "count the paths" | Counting DP (sum transitions); often modulo 10<sup>9</sup> + 7 |
| "minimum cost", "maximum profit", "fewest steps" with choices that interact | Optimisation DP (min/max transitions) |
| Two strings, "subsequence", "edit", "match" | 2D DP on prefixes |
| "capacity", "subset with sum", "partition" | Knapsack |
| "split into parts", "burst", "merge" on a range | Interval DP |
| *n* ≤ 20 with "visit all", "assign each" | Bitmask DP |
| Grid with moves right/down | Grid DP |
| Buy/sell stock with cooldown or fee, states like "holding/not holding" | State-machine DP: one array per state |

> TRAP: When a counting problem says "return the answer modulo 10<sup>9</sup> + 7", take the modulus **after every addition** and use `long` for products: `(a * b) % MOD` with `int` operands overflows before the modulus is applied.

## 9.9 Practical lessons

- Define the state in words first. Most wrong DP solutions have a state that does not contain enough information.
- Start top-down with memoisation; convert to bottom-up when you need speed or less stack.
- 0/1 knapsack loops capacity downwards; unbounded loops upwards. Coins outside counts combinations.
- LIS in O(n log n) uses binary search on the array of smallest tails.
- Check the answer on tiny inputs by brute force before trusting a recurrence.

# Chapter 10: Greedy, Bit Manipulation and Maths
%When a local choice is safe, tricks with bits, and the number theory behind "modulo 10^9 + 7"

## 10.1 When greedy works

A greedy algorithm makes the best-looking choice at each step and never revisits it. It is correct only when an **exchange argument** holds: any optimal solution can be transformed, step by step, into the greedy one without getting worse. If you cannot sketch that argument, test greedy against brute force before trusting it.

| Problem | Greedy rule | Why it is safe |
|---|---|---|
| Maximum non-overlapping intervals (activity selection) | Sort by **end**, take each interval that starts after the last taken end | The earliest-ending interval leaves the most room |
| Minimum arrows to burst balloons | Same as above; count groups | Same argument |
| Jump game (can you reach the end?) | Track the farthest reachable index | Any index within reach can be reached |
| Gas station | If the total gas ≥ total cost, start after the point where the running tank went most negative | A failed start rules out every station before the failure point |
| Assign cookies / boats with two people | Sort, then two pointers | Pairing the extremes wastes the least |
| Fractional knapsack | Highest value per weight first | Items are divisible |
| Huffman coding | Merge the two least frequent symbols | Classic exchange argument |

```java run Activity selection, jump game and gas station
import java.util.*;

public class Main {
    static int maxNonOverlapping(int[][] iv) {
        Arrays.sort(iv, Comparator.comparingInt(x -> x[1]));       // by end
        int count = 0; long lastEnd = Long.MIN_VALUE;
        for (int[] x : iv) if (x[0] >= lastEnd) { count++; lastEnd = x[1]; }
        return count;
    }
    static int minJumps(int[] a) {                                 // BFS by ranges
        int jumps = 0, curEnd = 0, farthest = 0;
        for (int i = 0; i < a.length - 1; i++) {
            farthest = Math.max(farthest, i + a[i]);
            if (i == curEnd) { jumps++; curEnd = farthest; if (curEnd <= i) return -1; }
        }
        return jumps;
    }
    static int gasStart(int[] gas, int[] cost) {
        int total = 0, tank = 0, start = 0;
        for (int i = 0; i < gas.length; i++) {
            total += gas[i] - cost[i];
            tank += gas[i] - cost[i];
            if (tank < 0) { start = i + 1; tank = 0; }
        }
        return total >= 0 ? start : -1;
    }
    public static void main(String[] args) {
        int[][] iv = {{1, 3}, {2, 4}, {3, 5}, {0, 6}, {5, 7}, {8, 9}, {5, 9}};
        System.out.println("max non-overlapping meetings " + maxNonOverlapping(iv));
        System.out.println("min jumps [2,3,1,1,4] = " + minJumps(new int[]{2, 3, 1, 1, 4})
                + ", [3,2,1,0,4] = " + minJumps(new int[]{3, 2, 1, 0, 4}));
        System.out.println("gas station start " + gasStart(new int[]{1, 2, 3, 4, 5},
                new int[]{3, 4, 5, 1, 2}));
    }
}
```

> TRAP: Sorting intervals by **start** for activity selection is wrong: a long interval that starts first, such as `[0, 6]`, blocks three shorter ones. Sorting by **length** is also wrong. Sort by end.

## 10.2 Bit manipulation

| Expression | Meaning |
|---|---|
| `x & 1` | Is `x` odd? |
| `x & (x - 1)` | Clear the lowest set bit; `== 0` means a power of two (for x > 0) |
| `x & -x` | Isolate the lowest set bit (used by Fenwick trees) |
| `x >> k & 1` | The *k*th bit |
| `x | (1 << k)`, `x & ~(1 << k)`, `x ^ (1 << k)` | Set, clear, toggle bit *k* |
| `Integer.bitCount(x)` | Number of set bits |
| `a ^ a = 0`, `a ^ 0 = a` | XOR cancels pairs |
| `>>` versus `>>>` | Arithmetic (keeps sign) versus logical (fills with zeros) shift |

```java run Single number, counting bits, subsets by bitmask and the missing number
import java.util.*;

public class Main {
    public static void main(String[] args) {
        int single = 0;
        for (int x : new int[]{4, 1, 2, 1, 2}) single ^= x;          // pairs cancel
        System.out.println("the element that appears once: " + single);

        int[] bits = new int[9];
        for (int i = 1; i <= 8; i++) bits[i] = bits[i >> 1] + (i & 1); // DP on bits
        System.out.println("set bits 0..8 " + Arrays.toString(bits));

        char[] items = {'a', 'b', 'c'};
        List<String> subsets = new ArrayList<>();
        for (int mask = 0; mask < (1 << items.length); mask++) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < items.length; i++)
                if ((mask >> i & 1) == 1) sb.append(items[i]);
            subsets.add("{" + sb + "}");
        }
        System.out.println("subsets by mask " + subsets);

        int[] a = {3, 0, 1, 5, 4};   // 0..5 with one missing
        int x = 0;
        for (int i = 0; i < a.length; i++) x ^= i ^ a[i];
        x ^= a.length;
        System.out.println("missing number " + x);
        System.out.println("-16 >> 2 = " + (-16 >> 2) + ", -16 >>> 28 = " + (-16 >>> 28));
        int n = 40;
        System.out.println("40 is a power of two? " + ((n & (n - 1)) == 0)
                + ", lowest bit of 40 = "
                + (n & -n));
    }
}
```

## 10.3 Number theory for coding rounds

| Tool | Code idea | Cost |
|---|---|---|
| GCD (Euclid) | `gcd(a, b) = b == 0 ? a : gcd(b, a % b)` | O(log min(a, b)) |
| LCM | `a / gcd(a, b) * b` (divide first to avoid overflow) | — |
| Primality | Trial division up to √n | O(√n) |
| All primes up to *n* | Sieve of Eratosthenes | O(n log log n) |
| Prime factorisation of many numbers | Sieve of smallest prime factors, then divide | O(log n) per number |
| *a*<sup>*b*</sup> mod *m* | Fast exponentiation by squaring | O(log b) |
| Division modulo a prime *p* | Multiply by the inverse *a*<sup>*p*−2</sup> mod *p* (Fermat) | O(log p) |
| nCr mod *p* | Precompute factorials and inverse factorials | O(n) once, O(1) per query |

```java run GCD, sieve, fast power and nCr modulo 1e9+7
import java.util.*;

public class Main {
    static final long MOD = 1_000_000_007L;
    static long gcd(long a, long b) { return b == 0 ? a : gcd(b, a % b); }
    static long power(long b, long e, long m) {
        long r = 1; b %= m;
        while (e > 0) {
            if ((e & 1) == 1) r = r * b % m;
            b = b * b % m;
            e >>= 1;
        }
        return r;
    }
    public static void main(String[] args) {
        long lcm = 84 / gcd(84, 36) * 36;                // divide first: no overflow
        System.out.println("gcd(84, 36)=" + gcd(84, 36) + ", lcm(84, 36)=" + lcm);

        int n = 50;
        boolean[] composite = new boolean[n + 1];
        List<Integer> primes = new ArrayList<>();
        for (int i = 2; i <= n; i++) {
            if (composite[i]) continue;
            primes.add(i);
            for (long j = (long) i * i; j <= n; j += i)
                composite[(int) j] = true;   // from i*i
        }
        System.out.println("primes up to 50: " + primes);

        System.out.println("2^100 mod 1e9+7 = " + power(2, 100, MOD));
        int N = 100;
        long[] fact = new long[N + 1], inv = new long[N + 1];
        fact[0] = 1;
        for (int i = 1; i <= N; i++) fact[i] = fact[i - 1] * i % MOD;
        inv[N] = power(fact[N], MOD - 2, MOD);                        // Fermat inverse
        for (int i = N; i > 0; i--) inv[i - 1] = inv[i] * i % MOD;
        long c = fact[100] * inv[50] % MOD * inv[50] % MOD;
        System.out.println("C(100, 50) mod 1e9+7 = " + c + ", C(10, 3) = "
                + fact[10] * inv[3] % MOD * inv[7] % MOD);
    }
}
```

The sieve starts crossing out at `i * i` because every smaller multiple of *i* has a smaller prime factor and was already crossed out. The inner loop uses `long` so that `i * i` cannot overflow when *n* is near 2<sup>31</sup>.

> NOTE: 10<sup>9</sup> + 7 is prime, which is why division by multiplying with *a*<sup>*p*−2</sup> works. The product of two values below it fits in a `long` (about 10<sup>18</sup> < 9.2 × 10<sup>18</sup>), but the product of three does not: reduce after **every** multiplication, as in `fact[100] * inv[50] % MOD * inv[50] % MOD`.

## 10.4 Practical lessons

- Greedy needs a reason. Name the exchange argument, or compare with brute force on small inputs.
- Interval selection: sort by end. Merging: sort by start.
- XOR cancels duplicates; `x & (x - 1)` removes the lowest set bit; bitmasks enumerate subsets of up to ~20 items.
- Modular arithmetic: `long`, reduce after every operation, fast power for exponents and inverses.
