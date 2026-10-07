## Part 8 solutions

### S8.1 Bipartite check

```java run BFS two-colouring over every component
import java.util.*;

public class Main {
    static boolean bipartite(int n, int[][] edges) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); }
        int[] color = new int[n];                          // 0 none, 1 and -1 the two sides
        for (int s = 0; s < n; s++) {
            if (color[s] != 0) continue;                   // new component
            color[s] = 1;
            Deque<Integer> q = new ArrayDeque<>(List.of(s));
            while (!q.isEmpty()) {
                int u = q.poll();
                for (int v : adj.get(u)) {
                    if (color[v] == color[u]) return false;
                    if (color[v] == 0) { color[v] = -color[u]; q.offer(v); }
                }
            }
        }
        return true;
    }
    public static void main(String[] args) {
        int[][] square = {{0, 1}, {1, 2}, {2, 3}, {3, 0}};
        System.out.println("4-cycle: " + bipartite(4, square));
        System.out.println("triangle: " + bipartite(3, new int[][]{{0, 1}, {1, 2}, {2, 0}}));
        System.out.println("path + triangle in separate components: "
                + bipartite(6, new int[][]{{0, 1}, {1, 2}, {3, 4}, {4, 5}, {5, 3}}));
    }
}
```

A graph is bipartite exactly when it has no **odd** cycle. Starting BFS only from vertex 0 misses the triangle in the second component; the outer loop over all vertices is what the third test checks.

### S8.2 Shortest path in a binary grid

```java run BFS with eight moves
import java.util.*;

public class Main {
    static int shortest(int[][] g) {
        int n = g.length;
        if (g[0][0] == 1 || g[n - 1][n - 1] == 1) return -1;
        int[][] dist = new int[n][n];
        dist[0][0] = 1;                                    // path length counts cells
        Deque<int[]> q = new ArrayDeque<>();
        q.offer(new int[]{0, 0});
        while (!q.isEmpty()) {
            int[] c = q.poll();
            if (c[0] == n - 1 && c[1] == n - 1) return dist[c[0]][c[1]];
            for (int dr = -1; dr <= 1; dr++)
                for (int dc = -1; dc <= 1; dc++) {
                    int r = c[0] + dr, col = c[1] + dc;
                    if (r < 0 || col < 0 || r >= n || col >= n) continue;
                    if (g[r][col] == 1 || dist[r][col] != 0) continue;
                    dist[r][col] = dist[c[0]][c[1]] + 1;
                    q.offer(new int[]{r, col});
                }
        }
        return -1;
    }
    public static void main(String[] args) {
        System.out.println(shortest(new int[][]{{0, 1}, {1, 0}}));
        System.out.println(shortest(new int[][]{{0, 0, 0}, {1, 1, 0}, {1, 1, 0}}));
        System.out.println(shortest(new int[][]{{1, 0, 0}, {1, 1, 0}, {1, 1, 0}}));
        System.out.println(shortest(new int[][]{{0}}));
    }
}
```

`dist` doubles as the visited marker (0 means unvisited, because every real distance is at least 1). The single-cell grid returns 1, a common edge case.

### S8.3 Word ladder

```java run BFS over words, generating neighbours letter by letter
import java.util.*;

public class Main {
    static int ladder(String begin, String end, List<String> words) {
        Set<String> dict = new HashSet<>(words);
        if (!dict.contains(end)) return 0;
        Map<String, Integer> dist = new HashMap<>(Map.of(begin, 1));
        Deque<String> q = new ArrayDeque<>(List.of(begin));
        while (!q.isEmpty()) {
            String w = q.poll();
            if (w.equals(end)) return dist.get(w);
            char[] c = w.toCharArray();
            for (int i = 0; i < c.length; i++) {
                char orig = c[i];
                for (char ch = 'a'; ch <= 'z'; ch++) {
                    if (ch == orig) continue;
                    c[i] = ch;
                    String nb = new String(c);
                    if (dict.contains(nb) && !dist.containsKey(nb)) {
                        dist.put(nb, dist.get(w) + 1);
                        q.offer(nb);
                    }
                }
                c[i] = orig;
            }
        }
        return 0;
    }
    public static void main(String[] args) {
        List<String> words = List.of("hot", "dot", "dog", "lot", "log", "cog");
        System.out.println("hit -> cog: " + ladder("hit", "cog", words) + " words");
        System.out.println("hit -> cog without cog in the list: "
                + ladder("hit", "cog", List.of("hot", "dot", "dog", "lot", "log")));
    }
}
```

One shortest sequence is hit → hot → dot → dog → cog: 5 words, 4 changes. Generating the 25 × L variants of each word costs O(26 L) lookups per word, much less than comparing it with every word in a large dictionary.

### S8.4 Cheapest flight with at most k stops

```java run Bounded Bellman-Ford, with the trap shown
import java.util.*;

public class Main {
    static final long INF = Long.MAX_VALUE / 4;
    static long cheapest(int n, int[][] flights, int src, int dst, int k, boolean copy) {
        long[] dist = new long[n];
        Arrays.fill(dist, INF);
        dist[src] = 0;
        for (int round = 0; round <= k; round++) {           // k stops = k + 1 flights
            long[] prev = copy ? dist.clone() : dist;
            for (int[] f : flights)
                if (prev[f[0]] < INF && prev[f[0]] + f[2] < dist[f[1]])
                    dist[f[1]] = prev[f[0]] + f[2];
        }
        return dist[dst] >= INF ? -1 : dist[dst];
    }
    public static void main(String[] args) {
        int[][] f = {{0, 1, 100}, {1, 2, 100}, {2, 3, 100}, {0, 2, 500}};
        for (int k = 0; k <= 2; k++)
            System.out.println("0 -> 3 with at most " + k + " stops: "
                    + cheapest(4, f, 0, 3, k, true));
        System.out.println("0 -> 2 with 0 stops: copy " + cheapest(4, f, 0, 2, 0, true)
                + ", without copy " + cheapest(4, f, 0, 2, 0, false));
    }
}
```

Dijkstra minimises cost only, so it settles city 2 at cost 200 via city 1 and never reconsiders the direct 500 flight, even when the 200 route uses too many stops. Bellman–Ford's rounds count edges: after round *r*, `dist` holds the cheapest cost using at most *r* flights, **provided each round reads only the previous round's values**. Without the copy, an update made earlier in the same round is reused immediately, so a path with more flights sneaks in: with 0 stops, city 2 wrongly gets 200 (two flights) instead of 500.

### S8.5 Redundant connection

```java run Union-find stops at the first cycle edge
import java.util.*;

public class Main {
    static int[] parent;
    static int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
    static int[] redundant(int[][] edges) {
        parent = new int[edges.length + 1];
        for (int i = 0; i < parent.length; i++) parent[i] = i;
        for (int[] e : edges) {
            int a = find(e[0]), b = find(e[1]);
            if (a == b) return e;                          // already connected: cycle
            parent[a] = b;
        }
        return new int[0];
    }
    public static void main(String[] args) {
        System.out.println(Arrays.toString(redundant(new int[][]{{1, 2}, {1, 3}, {2, 3}})));
        System.out.println(Arrays.toString(redundant(
                new int[][]{{1, 2}, {2, 3}, {3, 4}, {1, 4}, {1, 5}})));
    }
}
```

The tree plus one edge has exactly one cycle. Every edge on that cycle could be removed; the first edge that union–find finds already connected is the last cycle edge in input order, which is what the problem asks for.

## Part 9 solutions

### S9.1 Steps of 1, 3 or 5

```java run Counting DP modulo 1e9+7
public class Main {
    static final long MOD = 1_000_000_007L;
    public static void main(String[] args) {
        int n = 1000;
        long[] dp = new long[n + 1];
        dp[0] = 1;                                             // one way to climb nothing
        for (int i = 1; i <= n; i++)
            for (int step : new int[]{1, 3, 5})
                if (i >= step) dp[i] = (dp[i] + dp[i - step]) % MOD;
        StringBuilder sb = new StringBuilder();
        for (int i = 1; i <= 10; i++) sb.append(dp[i]).append(' ');
        System.out.println("n=1..10: " + sb.toString().trim());
        System.out.println("n=1000 mod 1e9+7: " + dp[n]);
    }
}
```

Check *n* = 4 by hand: 1+1+1+1, 1+3, 3+1, so 3 ways. Order matters here (1+3 and 3+1 are different climbs), which is why the steps loop is **inside** the amount loop.

### S9.2 Maximum product subarray

```java run Track the maximum and the minimum ending here
import java.util.*;

public class Main {
    static long maxProduct(int[] a) {
        long hi = a[0], lo = a[0], best = a[0];
        for (int i = 1; i < a.length; i++) {
            long x = a[i];
            long h = Math.max(x, Math.max(hi * x, lo * x));
            long l = Math.min(x, Math.min(hi * x, lo * x));
            hi = h; lo = l;
            best = Math.max(best, hi);
        }
        return best;
    }
    static long brute(int[] a) {
        long best = Long.MIN_VALUE;
        for (int i = 0; i < a.length; i++) {
            long p = 1;
            for (int j = i; j < a.length; j++) best = Math.max(best, p *= a[j]);
        }
        return best;
    }
    public static void main(String[] args) {
        for (int[] a : new int[][]{{2, 3, -2, 4}, {-2, 0, -1}, {-2, 3, -4}, {-3}})
            System.out.println(Arrays.toString(a) + " -> " + maxProduct(a));
        Random r = new Random(13); boolean ok = true;
        for (int t = 0; t < 500; t++) {
            int[] x = new int[1 + r.nextInt(12)];
            for (int i = 0; i < x.length; i++) x[i] = r.nextInt(9) - 4;
            ok &= maxProduct(x) == brute(x);
        }
        System.out.println("500 random tests agree: " + ok);
    }
}
```

Kadane keeps only the best value ending here, but with products a very negative value can become the best after one more negative factor: in `[-2, 3, -4]` the running minimum −6 times −4 gives 24. Keeping both extremes fixes it; a zero resets both to 0, and the next element restarts the run because `x` itself is a candidate.

### S9.3 Minimum path sum with the path

```java run Fill the table, then walk back
public class Main {
    public static void main(String[] args) {
        int[][] g = {{1, 3, 1, 8}, {1, 5, 1, 2}, {4, 2, 1, 9}, {7, 1, 3, 1}};
        int R = g.length, C = g[0].length;
        long[][] dp = new long[R][C];
        for (int r = 0; r < R; r++)
            for (int c = 0; c < C; c++) {
                if (r == 0 && c == 0) dp[r][c] = g[r][c];
                else if (r == 0) dp[r][c] = dp[r][c - 1] + g[r][c];
                else if (c == 0) dp[r][c] = dp[r - 1][c] + g[r][c];
                else dp[r][c] = Math.min(dp[r - 1][c], dp[r][c - 1]) + g[r][c];
            }
        StringBuilder path = new StringBuilder();
        int r = R - 1, c = C - 1;
        while (true) {
            path.insert(0, "(" + r + "," + c + ")");
            if (r == 0 && c == 0) break;
            if (r == 0) c--;
            else if (c == 0) r--;
            else if (dp[r - 1][c] <= dp[r][c - 1]) r--;          // came from above
            else c--;                                             // came from the left
            path.insert(0, " ");
        }
        System.out.println("minimum cost " + dp[R - 1][C - 1]);
        System.out.println("path " + path.toString().trim());
    }
}
```

Walking back works because each cell's value was produced by its cheaper neighbour; choosing that neighbour reproduces one optimal path without storing extra pointers.

### S9.4 Target sum

```java run Subset counting against brute force over all sign choices
import java.util.*;

public class Main {
    static int ways(int[] a, int target) {
        int total = 0;
        for (int x : a) total += x;
        if (Math.abs(target) > total || (total + target) % 2 != 0) return 0;
        int want = (total + target) / 2;                        // sum of the + set
        int[] dp = new int[want + 1];
        dp[0] = 1;
        for (int x : a) for (int s = want; s >= x; s--) dp[s] += dp[s - x];  // 0/1 knapsack
        return dp[want];
    }
    static int brute(int[] a, int target) {
        int count = 0;
        for (int mask = 0; mask < 1 << a.length; mask++) {
            int s = 0;
            for (int i = 0; i < a.length; i++) s += (mask >> i & 1) == 1 ? a[i] : -a[i];
            if (s == target) count++;
        }
        return count;
    }
    public static void main(String[] args) {
        System.out.println("[1,1,1,1,1] target 3 -> " + ways(new int[]{1, 1, 1, 1, 1}, 3));
        System.out.println("[0,0,1] target 1 -> " + ways(new int[]{0, 0, 1}, 1)
                + " (each zero can take either sign)");
        Random r = new Random(14); boolean ok = true;
        for (int t = 0; t < 400; t++) {
            int[] x = new int[1 + r.nextInt(12)];
            for (int i = 0; i < x.length; i++) x[i] = r.nextInt(6);
            int target = r.nextInt(21) - 10;
            ok &= ways(x, target) == brute(x, target);
        }
        System.out.println("400 random tests agree: " + ok);
    }
}
```

If *P* is the set with `+` and *N* the rest, sum(P) − sum(N) = target and sum(P) + sum(N) = total, so sum(P) = (total + target) / 2. The question becomes "how many subsets sum to that value", a 0/1 knapsack count. Zeros are handled naturally: each doubles the count.

### S9.5 Stock with cooldown

```java run Three-state machine against exhaustive search
import java.util.*;

public class Main {
    static int maxProfit(int[] p) {
        int hold = Integer.MIN_VALUE / 2, sold = 0, rest = 0;
        for (int x : p) {
            int prevSold = sold;
            sold = hold + x;                       // sell today
            hold = Math.max(hold, rest - x);       // keep holding, or buy after resting
            rest = Math.max(rest, prevSold);       // do nothing; yesterday's sale cools down
        }
        return Math.max(sold, rest);
    }
    static int search(int[] p, int day, boolean holding, int boughtAt) {
        if (day >= p.length) return 0;
        int best = search(p, day + 1, holding, boughtAt);                 // wait
        if (holding) best = Math.max(best, p[day] - boughtAt + search(p, day + 2, false, 0));
        else best = Math.max(best, search(p, day + 1, true, p[day]));     // buy
        return best;
    }
    public static void main(String[] args) {
        System.out.println("[1,2,3,0,2] -> " + maxProfit(new int[]{1, 2, 3, 0, 2}));
        System.out.println("[1] -> " + maxProfit(new int[]{1}));
        Random r = new Random(15); boolean ok = true;
        for (int t = 0; t < 400; t++) {
            int[] x = new int[1 + r.nextInt(12)];
            for (int i = 0; i < x.length; i++) x[i] = r.nextInt(10);
            ok &= maxProfit(x) == search(x, 0, false, 0);
        }
        System.out.println("400 random tests agree with exhaustive search: " + ok);
    }
}
```

For `[1, 2, 3, 0, 2]`: buy at 1, sell at 2, cool down, buy at 0, sell at 2, profit 3. Each state is the best profit at the end of a day in that situation; the cooldown is enforced because `hold` can only be entered from `rest`, never directly from `sold`.

### S9.6 Matrix-chain multiplication

```java run Interval DP with the split points recorded
public class Main {
    static long[][] cost;
    static int[][] split;
    static String paren(int i, int j) {
        if (i == j) return "A" + i;
        return "(" + paren(i, split[i][j]) + " " + paren(split[i][j] + 1, j) + ")";
    }
    static long brute(int[] p, int i, int j) {
        if (i == j) return 0;
        long best = Long.MAX_VALUE;
        for (int k = i; k < j; k++)
            best = Math.min(best, brute(p, i, k) + brute(p, k + 1, j)
                    + (long) p[i - 1] * p[k] * p[j]);
        return best;
    }
    public static void main(String[] args) {
        int[] p = {40, 20, 30, 10, 30};                     // A1..A4
        int n = p.length - 1;
        cost = new long[n + 1][n + 1];
        split = new int[n + 1][n + 1];
        for (int len = 2; len <= n; len++)
            for (int i = 1; i + len - 1 <= n; i++) {
                int j = i + len - 1;
                cost[i][j] = Long.MAX_VALUE;
                for (int k = i; k < j; k++) {
                    long c = cost[i][k] + cost[k + 1][j] + (long) p[i - 1] * p[k] * p[j];
                    if (c < cost[i][j]) { cost[i][j] = c; split[i][j] = k; }
                }
            }
        System.out.println("minimum multiplications " + cost[1][n] + " (brute force "
                + brute(p, 1, n) + ")");
        System.out.println("order " + paren(1, n));
        System.out.println("left to right would cost "
                + ((long) 40 * 20 * 30 + 40 * 30 * 10 + 40 * 10 * 30));
    }
}
```

Intervals are filled by increasing length so that `cost[i][k]` and `cost[k+1][j]` are ready when `cost[i][j]` needs them. The order matters a lot: the naive left-to-right product costs 48 000, almost twice the optimum.

### S9.7 Define the state

| Problem | State | Transition | Base |
|---|---|---|---|
| (a) No two consecutive 1s | `end0[i]`, `end1[i]`: valid strings of length *i* ending in 0 or 1 | `end0[i] = end0[i-1] + end1[i-1]`; `end1[i] = end0[i-1]` | `end0[1] = end1[1] = 1` |
| (b) Fewest insertions for a palindrome | `dp[i][j]` for the substring `s[i..j]` | equal ends: `dp[i+1][j-1]`; else `1 + min(dp[i+1][j], dp[i][j-1])` | `dp[i][i] = 0`, empty = 0 |
| (c) Domino tilings of 2 × *n* | `t[n]` = tilings of a 2 × *n* board | `t[n] = t[n-1] + t[n-2]` (vertical, or two horizontal) | `t[0] = 1`, `t[1] = 1` |

```java run Checking (a) and (b) on small inputs
public class Main {
    static long noConsecutiveOnes(int n) {
        long end0 = 1, end1 = 1;
        for (int i = 2; i <= n; i++) { long e0 = end0 + end1; end1 = end0; end0 = e0; }
        return end0 + end1;
    }
    static long bruteOnes(int n) {
        long c = 0;
        for (int m = 0; m < 1 << n; m++) if ((m & (m >> 1)) == 0) c++;
        return c;
    }
    static int insertions(String s) {
        int n = s.length();
        int[][] dp = new int[n][n];
        for (int i = n - 2; i >= 0; i--)
            for (int j = i + 1; j < n; j++)
                dp[i][j] = s.charAt(i) == s.charAt(j) ? dp[i + 1][j - 1]
                        : 1 + Math.min(dp[i + 1][j], dp[i][j - 1]);
        return n == 0 ? 0 : dp[0][n - 1];
    }
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder(); boolean ok = true;
        for (int n = 1; n <= 12; n++) {
            sb.append(noConsecutiveOnes(n)).append(' ');
            ok &= noConsecutiveOnes(n) == bruteOnes(n);
        }
        System.out.println("(a) n=1..12: " + sb.toString().trim()
                + " | brute force agrees: " + ok);
        for (String s : new String[]{"zzazz", "mbadm", "leetcode", "ab"})
            System.out.println("(b) insertions for " + s + ": " + insertions(s));
    }
}
```

(a) gives the Fibonacci numbers from 2 onwards, and so does (c): many counting problems are Fibonacci in disguise. For (b), the answer also equals *n* minus the longest palindromic subsequence (guide Section 9.7): the characters outside that subsequence each need a partner.

## Part 10 solutions

### S10.1 Minimum removals for no overlap

```java run Greedy by end time against all subsets
import java.util.*;

public class Main {
    static int minRemovals(int[][] iv) {
        int[][] a = iv.clone();
        Arrays.sort(a, Comparator.comparingInt(x -> x[1]));
        int kept = 0; long end = Long.MIN_VALUE;
        for (int[] x : a) if (x[0] >= end) { kept++; end = x[1]; }
        return iv.length - kept;
    }
    static int brute(int[][] iv) {
        int n = iv.length, best = n;
        for (int mask = 0; mask < 1 << n; mask++) {
            boolean ok = true;
            for (int i = 0; i < n && ok; i++)
                for (int j = i + 1; j < n && ok; j++)
                    if ((mask >> i & 1) == 1 && (mask >> j & 1) == 1
                            && iv[i][0] < iv[j][1] && iv[j][0] < iv[i][1]) ok = false;
            if (ok) best = Math.min(best, n - Integer.bitCount(mask));
        }
        return best;
    }
    public static void main(String[] args) {
        System.out.println(minRemovals(new int[][]{{1, 2}, {2, 3}, {3, 4}, {1, 3}}));
        System.out.println(minRemovals(new int[][]{{1, 2}, {1, 2}, {1, 2}}));
        Random r = new Random(16); boolean ok = true;
        for (int t = 0; t < 300; t++) {
            int[][] x = new int[1 + r.nextInt(10)][];
            for (int i = 0; i < x.length; i++) {
                int s = r.nextInt(15);
                x[i] = new int[]{s, s + 1 + r.nextInt(6)};
            }
            ok &= minRemovals(x) == brute(x);
        }
        System.out.println("300 random tests agree with brute force: " + ok);
    }
}
```

**Exchange argument.** Let *g* be the interval with the earliest end. Take any optimal set of kept intervals and replace its earliest-ending interval with *g*: *g* ends no later, so it cannot overlap the others, and the set stays the same size. Repeating the argument on what remains shows that the greedy set is as large as an optimal one; removals are *n* minus that size.

### S10.2 Bit puzzles

```java run Hamming distance, powers of four and bit reversal
public class Main {
    static int hamming(int a, int b) { return Integer.bitCount(a ^ b); }
    static boolean powerOfFour(int n) {
        return n > 0 && (n & (n - 1)) == 0 && (n & 0x55555555) != 0;   // bit at even position
    }
    static int reverseBits(int x) {
        int r = 0;
        for (int i = 0; i < 32; i++) { r = (r << 1) | (x & 1); x >>>= 1; }
        return r;
    }
    public static void main(String[] args) {
        System.out.println("hamming(1, 4) = " + hamming(1, 4)
                + ", hamming(-1, 0) = " + hamming(-1, 0));
        StringBuilder sb = new StringBuilder();
        for (int n : new int[]{1, 2, 4, 8, 16, 64, 0, -4, 1 << 30})
            sb.append(n).append(powerOfFour(n) ? ":yes " : ":no ");
        System.out.println("power of four? " + sb.toString().trim());
        java.util.Random rnd = new java.util.Random(17); boolean ok = true;
        for (int t = 0; t < 10_000; t++) {
            int x = rnd.nextInt();
            ok &= reverseBits(x) == Integer.reverse(x);
        }
        System.out.println("reverseBits matches Integer.reverse on 10,000 values: " + ok);
        System.out.println("reverse of 1 = " + reverseBits(1) + " = Integer.MIN_VALUE");
    }
}
```

`0x55555555` has ones at bit positions 0, 2, 4, …; powers of four are exactly the powers of two whose single bit is at an even position. The reversal uses `>>>` so that the sign bit does not refill the top with ones.

### S10.3 Primes and factorisations

```java run Sieve count and smallest-prime-factor factorisation
import java.util.*;

public class Main {
    public static void main(String[] args) {
        int N = 1_000_000;
        int[] spf = new int[N];                     // smallest prime factor, 0 = not set
        int primes = 0;
        for (int i = 2; i < N; i++) {
            if (spf[i] == 0) {                      // i is prime
                primes++;
                for (long j = (long) i * i; j < N; j += i)
                    if (spf[(int) j] == 0) spf[(int) j] = i;
                spf[i] = i;
            }
        }
        System.out.println("primes below 1,000,000: " + primes);
        for (int x : new int[]{360, 9973, 999_999}) {
            List<Integer> f = new ArrayList<>();
            for (int y = x; y > 1; y /= spf[y]) f.add(spf[y]);
            System.out.println(x + " = " + f);
        }
    }
}
```

The smallest-prime-factor table costs the same as a sieve, then factorises any number below *N* in O(log x) divisions, because each division at least halves it. 9 973 is prime; 999 999 = 3<sup>3</sup> × 7 × 11 × 13 × 37.

### S10.4 Maximum XOR pair

```java run A binary trie, greedy from the highest bit
import java.util.*;

public class Main {
    static int[][] child;                         // child[node][bit]
    static int nodes;
    static void insert(int x) {
        int cur = 0;
        for (int b = 30; b >= 0; b--) {
            int bit = x >> b & 1;
            if (child[cur][bit] == 0) child[cur][bit] = ++nodes;
            cur = child[cur][bit];
        }
    }
    static int bestWith(int x) {
        int cur = 0, res = 0;
        for (int b = 30; b >= 0; b--) {
            int want = (x >> b & 1) ^ 1;          // the opposite bit makes this bit 1
            if (child[cur][want] != 0) { res |= 1 << b; cur = child[cur][want]; }
            else cur = child[cur][want ^ 1];
        }
        return res;
    }
    static int maxXor(int[] a) {
        child = new int[a.length * 31 + 1][2]; nodes = 0;
        for (int x : a) insert(x);
        int best = 0;
        for (int x : a) best = Math.max(best, bestWith(x));
        return best;
    }
    public static void main(String[] args) {
        System.out.println("[3,10,5,25,2,8] -> " + maxXor(new int[]{3, 10, 5, 25, 2, 8}));
        Random r = new Random(18); boolean ok = true;
        for (int t = 0; t < 300; t++) {
            int[] x = new int[1 + r.nextInt(30)];
            for (int i = 0; i < x.length; i++) x[i] = r.nextInt(1 << 20);
            int brute = 0;
            for (int i = 0; i < x.length; i++)
                for (int j = i; j < x.length; j++) brute = Math.max(brute, x[i] ^ x[j]);
            ok &= maxXor(x) == brute;
        }
        System.out.println("300 random tests agree with brute force: " + ok);
    }
}
```

The best partner for 5 (00101) is 25 (11001): 5 XOR 25 = 28 (11100). Greedy from the top bit is correct because a 1 in a higher bit outweighs all lower bits together.

### S10.5 Count smaller numbers after self

```java run Fenwick tree over compressed ranks
import java.util.*;

public class Main {
    static List<Integer> countSmaller(int[] a) {
        int[] sorted = Arrays.stream(a).distinct().sorted().toArray();
        int[] tree = new int[sorted.length + 1];
        Integer[] out = new Integer[a.length];
        for (int i = a.length - 1; i >= 0; i--) {
            int rank = Arrays.binarySearch(sorted, a[i]) + 1;     // 1-based rank
            int c = 0;
            for (int j = rank - 1; j > 0; j -= j & -j) c += tree[j];   // ranks < rank
            out[i] = c;
            for (int j = rank; j < tree.length; j += j & -j) tree[j]++;
        }
        return Arrays.asList(out);
    }
    static List<Integer> brute(int[] a) {
        List<Integer> out = new ArrayList<>();
        for (int i = 0; i < a.length; i++) {
            int c = 0;
            for (int j = i + 1; j < a.length; j++) if (a[j] < a[i]) c++;
            out.add(c);
        }
        return out;
    }
    public static void main(String[] args) {
        System.out.println("[5,2,6,1] -> " + countSmaller(new int[]{5, 2, 6, 1}));
        System.out.println("[-1,-1] -> " + countSmaller(new int[]{-1, -1}));
        Random r = new Random(19); boolean ok = true;
        for (int t = 0; t < 300; t++) {
            int[] x = new int[1 + r.nextInt(40)];
            for (int i = 0; i < x.length; i++)
                x[i] = r.nextInt(2_000_000_001) - 1_000_000_000;
            if (r.nextBoolean()) for (int i = 0; i < x.length; i++) x[i] %= 5;   // duplicates
            ok &= countSmaller(x).equals(brute(x));
        }
        System.out.println("300 random tests (huge values and duplicates) agree: " + ok);
    }
}
```

Scanning from the right, the tree holds the ranks of everything to the right of *i*; a prefix query up to `rank - 1` counts the **strictly** smaller ones, so equal values are not counted. Compression makes values up to ±10<sup>9</sup> fit into an array of size *n*. Total cost O(n log n).
