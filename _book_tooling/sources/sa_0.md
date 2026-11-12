# How to use this guide
%What a DSA round looks like, how it is graded, and how this book maps onto a 12-week plan

Product companies test data structures and algorithms (DSA) in almost every technical round: an online assessment with two or three problems in 60–90 minutes, then one or two live coding interviews. Service companies ask easier versions of the same questions (TCS NQT advanced coding, Infosys SP/DSE). The skill being tested is not memory; it is **recognising which pattern a problem belongs to** and implementing it correctly, with the right complexity, while explaining your thinking.

This guide teaches the patterns that cover the large majority of interview problems, in Java. **Every program is a complete, single-file Java program** that runs with `java Main.java` (Java 21 or later), and every output shown was produced by running it. Where speed matters, programs count operations instead of timing them, so that the numbers are exact and the same on every machine.

## How a coding round is graded

| Dimension | Strong signal | Weak signal |
|---|---|---|
| Understanding | Restates the problem, asks about constraints and edge cases | Starts coding after reading the first line |
| Approach | States a brute force, then improves it with a named pattern | Jumps between ideas without finishing any |
| Complexity | Gives time and space, and links them to the constraints | "It is fast" |
| Code | Compiles, clear names, small helper methods | One long `main` with single-letter variables |
| Correctness | Dry-runs an example, tests edge cases (empty, one element, duplicates, overflow) | Assumes the happy path works |
| Communication | Thinks aloud, takes hints well | Silent coding, defensive about hints |

## From constraints to complexity

Online judges allow roughly **10<sup>8</sup> simple operations per second**. Read the constraint on *n* first; it tells you which complexity the intended solution has.

| Largest *n* | Acceptable complexity | Typical techniques |
|---|---|---|
| 10–12 | O(n!) | Permutations, brute-force backtracking |
| 20–25 | O(2<sup>n</sup>) | Subsets, bitmask DP |
| 100–500 | O(n<sup>3</sup>) | Floyd–Warshall, interval DP |
| 1 000–5 000 | O(n<sup>2</sup>) | Pairwise DP (LCS, edit distance), simple nested loops |
| 10<sup>5</sup>–10<sup>6</sup> | O(n log n) or O(n) | Sorting, heaps, binary search, two pointers, hashing, BFS/DFS |
| 10<sup>9</sup> and above | O(log n) or O(1) | Binary search on the answer, maths, fast exponentiation |

## How to study this book

| Week (from 1 Dec) | Chapters | Goal |
|---|---|---|
| 1 | 1–2 | Complexity, Java collections, arrays, strings, hashing, two pointers, sliding window |
| 2 | 3 | Binary search (including on the answer), sorting, intervals |
| 3 | 4 | Linked lists, stacks, queues, monotonic stack and deque |
| 4 | 5 | Recursion and backtracking |
| 5–6 | 6–7 | Trees, binary search trees, heaps |
| 7–8 | 8 | Graphs: BFS, DFS, topological sort, shortest paths, union–find, MST |
| 9–10 | 9 | Dynamic programming |
| 11 | 10–11 | Greedy, bits, maths, tries, Fenwick and segment trees |
| 12 | 12 | Pattern revision and timed mocks |

1. Read a chapter, run every program, and change the inputs until the output stops surprising you.
2. Solve the matching part of the **DSA in Java Practice Book** without looking at the solutions.
3. Then solve 3–5 problems a day of the same pattern on LeetCode or GeeksforGeeks; the pattern names in this book are the ones those sites use as tags.
4. Keep an error log: every wrong submission gets one line ("off-by-one in upper bound", "int overflow in sum").

> TIP: In an interview, say the pattern out loud: "the array is sorted and we need a pair, so two pointers" or "minimise the maximum, so binary search on the answer". Naming the pattern shows the interviewer you are reasoning, not guessing.

# Chapter 1: Complexity and the Java Toolkit
%Big-O with exact operation counts, the collections you will use in every problem, and Java traps that fail submissions

## 1.1 Big-O by counting

Big-O describes how the work grows with the input size *n*, ignoring constant factors. The cleanest way to see it is to **count** the basic operations for growing *n*. The program below counts the inner-loop steps of five typical shapes of code.

```java run Counting operations for typical loop shapes
public class Main {
    static long linear(int n) { long c = 0; for (int i = 0; i < n; i++) c++; return c; }
    static long quadratic(int n) {
        long c = 0;
        for (int i = 0; i < n; i++) for (int j = i + 1; j < n; j++) c++;   // all pairs
        return c;
    }
    static long logarithmic(int n) {
        long c = 0;
        for (int i = n; i > 1; i /= 2) c++;
        return c;
    }
    static long nLogN(int n) {
        long c = 0;
        for (int i = 0; i < n; i++) for (int j = 1; j < n; j *= 2) c++;
        return c;
    }
    static long harmonic(int n) {   // inner loop runs n/i times: n(1 + 1/2 + ... + 1/n)
        long c = 0;
        for (int i = 1; i <= n; i++) for (int j = i; j <= n; j += i) c++;
        return c;
    }
    public static void main(String[] args) {
        System.out.printf("%9s %8s %8s %12s %14s %10s%n",
                "n", "log n", "n", "n log n", "n^2/2", "harmonic");
        for (int n : new int[]{1_000, 10_000, 100_000}) {
            System.out.printf("%9d %8d %8d %12d %14d %10d%n", n, logarithmic(n), linear(n),
                    nLogN(n), quadratic(n), harmonic(n));
        }
    }
}
```

Multiplying *n* by 10 multiplies the linear count by 10, the quadratic count by 100, while the logarithmic count only grows by 3 or 4 (since 2<sup>3.3</sup> ≈ 10). The harmonic loop, which looks quadratic at first glance, is O(n log n) because 1 + 1/2 + … + 1/n ≈ ln n. That shape appears in the sieve of Eratosthenes (Chapter 10).

| Rule | Example |
|---|---|
| Drop constants | 3n + 5 → O(n) |
| Keep the dominant term | n<sup>2</sup> + n log n → O(n<sup>2</sup>) |
| Sequential blocks add | O(n) then O(n log n) → O(n log n) |
| Nested loops multiply | n outer × m inner → O(nm) |
| Halving each step | O(log n) |
| Two inputs stay separate | Merging lists of sizes m and n → O(m + n), not O(n) |

### Space complexity and the call stack

Space counts the **extra** memory: new arrays, maps, and the recursion stack. A recursive function that goes *d* levels deep uses O(d) stack space even if it allocates nothing. Java's default thread stack holds around 10 000–20 000 frames for simple methods, so a recursive DFS on a path of 10<sup>5</sup> nodes throws `StackOverflowError`. Use an explicit stack (Chapter 8) when depth can be that large.

### Amortised cost

`ArrayList.add` is O(1) **amortised**: most adds are cheap, but when the backing array is full it is copied into one 1.5 times larger. The program counts the element copies caused by growth.

```java run Amortised cost of a growing array
public class Main {
    public static void main(String[] args) {
        for (int n : new int[]{1_000, 100_000, 10_000_000}) {
            long copies = 0; int capacity = 10, resizes = 0;
            for (int size = 0; size < n; size++) {
                if (size == capacity) {   // ArrayList grows by half: cap + cap/2
                    copies += size; capacity += capacity >> 1; resizes++;
                }
            }
            System.out.printf("n=%,11d resizes=%3d copies=%,12d copies per add=%.2f%n",
                    n, resizes, copies, (double) copies / n);
        }
    }
}
```

The copies per add stay between 2 and 3 no matter how large *n* gets (with growth factor 1.5 the total is at most n(1 + 2/3 + 4/9 + …) = 3n): that is what amortised O(1) means. The exact figure wobbles with where *n* falls relative to the last resize. If you know the final size, pass it to the constructor (`new ArrayList<>(n)`) and there are no copies at all.

## 1.2 The collections you need

| Need | Class | Key operations and cost |
|---|---|---|
| Dynamic array | `ArrayList<E>` | `get/set` O(1), `add` amortised O(1), `add(0, x)`/`remove(0)` O(n) |
| Stack and queue | `ArrayDeque<E>` | `push/pop/peek`, `offer/poll/peekFirst/peekLast`, all O(1) |
| Hash map / set | `HashMap<K,V>`, `HashSet<E>` | `get/put/containsKey` O(1) average |
| Sorted map / set | `TreeMap<K,V>`, `TreeSet<E>` | O(log n); `floorKey`, `ceilingKey`, `firstKey`, `headMap`, `pollFirst` |
| Priority queue | `PriorityQueue<E>` | `offer/poll` O(log n), `peek` O(1); min-heap by default |
| Insertion-ordered map | `LinkedHashMap<K,V>` | Iterates in insertion (or access) order; base for an LRU cache |
| Fixed-size primitives | `int[]`, `long[]`, `boolean[]` | Fastest; no boxing; use them whenever the size is known |

> TRAP: Do not use `Stack` or `LinkedList` as a stack or queue in new code. `Stack` is synchronised and extends `Vector`; `LinkedList` allocates a node per element. `ArrayDeque` is faster for both jobs. It rejects `null` elements.

```java run The everyday collection operations
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Deque<Integer> stack = new ArrayDeque<>();
        stack.push(1); stack.push(2); stack.push(3);
        System.out.println("stack pop -> " + stack.pop() + ", peek -> " + stack.peek());

        Deque<Integer> queue = new ArrayDeque<>();
        queue.offer(1); queue.offer(2); queue.offer(3);
        System.out.println("queue poll -> " + queue.poll() + ", peek -> " + queue.peek());

        Map<String, Integer> freq = new TreeMap<>();   // sorted keys for stable output
        for (String w : "the cat and the hat and the bat".split(" "))
            freq.merge(w, 1, Integer::sum);
        System.out.println("word counts " + freq);

        TreeMap<Integer, String> slots = new TreeMap<>();
        slots.put(9, "nine"); slots.put(12, "noon"); slots.put(17, "five");
        System.out.println("floorKey(13)=" + slots.floorKey(13) + " ceilingKey(13)="
                + slots.ceilingKey(13) + " headMap(12)=" + slots.headMap(12));

        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] != b[1]
                ? Integer.compare(a[1], b[1]) : Integer.compare(a[0], b[0]));
        pq.offer(new int[]{1, 50}); pq.offer(new int[]{2, 20}); pq.offer(new int[]{3, 20});
        StringBuilder order = new StringBuilder();
        while (!pq.isEmpty()) order.append(Arrays.toString(pq.poll())).append(' ');
        System.out.println("by cost then id: " + order.toString().trim());

        PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Collections.reverseOrder());
        maxHeap.addAll(List.of(4, 9, 1, 7));
        System.out.println("max-heap poll -> " + maxHeap.poll());
    }
}
```

> NOTE: `HashMap` and `HashSet` iteration order is not the insertion order and can change between Java versions. When output order matters (printing, comparing with an expected answer), sort first or use a `TreeMap`/`LinkedHashMap`.

## 1.3 Java traps that fail submissions

```java run Six classic Java traps
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // 1. int overflow: 2e5 * 2e5 does not fit in an int
        int a = 200_000, b = 200_000;
        System.out.println("1. int product " + (a * b) + ", long product "
                + ((long) a * b));

        // 2. overflow in the midpoint of binary search
        int lo = 2_000_000_000, hi = 2_100_000_000;
        System.out.println("2. (lo+hi)/2 = " + (lo + hi) / 2 + ", lo+(hi-lo)/2 = "
                + (lo + (hi - lo) / 2));

        // 3. comparing boxed Integers with == works only in the cache range -128..127
        Integer x1 = 127, y1 = 127, x2 = 1000, y2 = 1000;
        System.out.println("3. 127==127 " + (x1 == y1) + ", 1000==1000 " + (x2 == y2)
                + ", equals " + x2.equals(y2));

        // 4. a comparator written as subtraction overflows
        Comparator<Integer> bad = (p, q) -> p - q, good = Integer::compare;
        int big = Integer.MAX_VALUE, small = -1;
        System.out.println("4. bad says MAX < -1? " + (bad.compare(big, small) < 0)
                + ", Integer.compare says " + (good.compare(big, small) < 0));

        // 5. % of a negative number is negative in Java
        System.out.println("5. -7 % 3 = " + (-7 % 3) + ", Math.floorMod(-7, 3) = "
                + Math.floorMod(-7, 3));

        // 6. string concatenation in a loop is quadratic; StringBuilder is linear
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 5; i++) sb.append(i).append(',');
        sb.setLength(sb.length() - 1);
        System.out.println("6. built " + sb);

        List<Integer> list = new ArrayList<>(List.of(10, 20, 30));
        list.remove(Integer.valueOf(10));      // removes the value 10, not index 10
        list.remove(0);                        // removes index 0 (the value 20)
        System.out.println("   remove(Integer) vs remove(int): " + list);
    }
}
```

| Trap | Fix |
|---|---|
| Sum or product of large `int`s | Use `long` for sums, products and answers; read the constraints |
| `(lo + hi) / 2` | `lo + (hi - lo) / 2` or `(lo + hi) >>> 1` |
| `==` on `Integer`, `String` | `.equals`, or unbox to `int` |
| Comparator `a - b` | `Integer.compare(a, b)`, `Comparator.comparingInt` |
| Negative `%` | `Math.floorMod`, or `((x % m) + m) % m` |
| `"+"` on strings in a loop | `StringBuilder` |
| Custom order on `int[]` | `Arrays.sort(int[])` takes no comparator; sort `Integer[]`, `int[][]` with a comparator, or negate values for descending order |

## 1.4 Fast input and output

`Scanner` is convenient but slow: around 10<sup>6</sup> numbers can take more than a second. On online assessments with large input, read with `BufferedReader` and `StringTokenizer`, and collect output in a `StringBuilder` or `PrintWriter`.

```java
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());
        int n = Integer.parseInt(st.nextToken());
        long[] a = new long[n];
        st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) a[i] = Long.parseLong(st.nextToken());
        PrintWriter out = new PrintWriter(new BufferedWriter(
                new OutputStreamWriter(System.out)));
        out.println(Arrays.stream(a).sum());
        out.flush();                     // forgetting flush prints nothing
    }
}
```

## 1.5 Practical lessons

- Read the constraints before the story; they fix the target complexity.
- Count the work of nested loops by what the inner loop actually does, not by how many loops there are.
- Use `long` for any sum, product or answer that can exceed 2.1 × 10<sup>9</sup>.
- `ArrayDeque` for stacks and queues, `PriorityQueue` for heaps, `TreeMap` when you need order or floor/ceiling lookups.
- Never rely on `HashMap` iteration order in output.

# Chapter 2: Arrays, Strings and Hashing
%Prefix sums, hashing, two pointers and sliding windows: the patterns behind a third of all interview problems

## 2.1 Prefix sums and difference arrays

A **prefix sum** array `p` with `p[i] = a[0] + … + a[i-1]` answers any range sum in O(1): `sum(l..r) = p[r+1] - p[l]`. A **difference array** does the reverse: it applies "add *v* to every element in *l..r*" in O(1), and one prefix pass at the end produces the final array.

```java run Prefix sums and a difference array
import java.util.*;

public class Main {
    public static void main(String[] args) {
        int[] a = {3, 1, 4, 1, 5, 9, 2, 6};
        long[] p = new long[a.length + 1];
        for (int i = 0; i < a.length; i++) p[i + 1] = p[i] + a[i];
        System.out.println("prefix " + Arrays.toString(p));
        int[][] queries = {{0, 3}, {2, 5}, {4, 7}};
        for (int[] q : queries) {
            long sum = p[q[1] + 1] - p[q[0]];
            System.out.println("sum a[" + q[0] + ".." + q[1] + "] = " + sum);
        }

        // difference array: 3 range updates on 8 zeros, then one prefix pass
        int n = 8; long[] diff = new long[n + 1];
        int[][] updates = {{1, 4, 10}, {3, 7, 5}, {0, 0, 2}};   // l, r, value
        for (int[] u : updates) { diff[u[0]] += u[2]; diff[u[1] + 1] -= u[2]; }
        long[] out = new long[n]; long run = 0;
        for (int i = 0; i < n; i++) { run += diff[i]; out[i] = run; }
        System.out.println("after updates " + Arrays.toString(out));
    }
}
```

The same idea extends to two dimensions: `P[i][j]` holds the sum of the rectangle from `(0,0)` to `(i-1,j-1)`, and a sub-rectangle sum takes four lookups by inclusion–exclusion.

## 2.2 Hashing: complements and counts

The single most useful trick in array problems is to **store what you have seen** in a hash map and ask, at each element, whether its complement has appeared. Two Sum becomes O(n). Combined with prefix sums, it counts subarrays with sum *k* in O(n), even with negative numbers: a subarray `(j, i]` has sum *k* exactly when `prefix[i] - prefix[j] = k`.

```java run Two Sum and subarrays with sum k
import java.util.*;

public class Main {
    static int[] twoSum(int[] a, int target) {
        Map<Integer, Integer> seen = new HashMap<>();      // value -> index
        for (int i = 0; i < a.length; i++) {
            Integer j = seen.get(target - a[i]);
            if (j != null) return new int[]{j, i};
            seen.put(a[i], i);
        }
        return new int[0];
    }
    static int subarraySum(int[] a, int k) {
        Map<Long, Integer> count = new HashMap<>();
        count.put(0L, 1);                                   // the empty prefix
        long prefix = 0; int result = 0;
        for (int x : a) {
            prefix += x;
            result += count.getOrDefault(prefix - k, 0);
            count.merge(prefix, 1, Integer::sum);
        }
        return result;
    }
    static int bruteForce(int[] a, int k) {
        int c = 0;
        for (int i = 0; i < a.length; i++) {
            long s = 0;
            for (int j = i; j < a.length; j++) if ((s += a[j]) == k) c++;
        }
        return c;
    }
    public static void main(String[] args) {
        System.out.println("twoSum " + Arrays.toString(twoSum(new int[]{2, 7, 11, 15}, 9)));
        System.out.println("twoSum " + Arrays.toString(twoSum(new int[]{3, 2, 4}, 6)));
        int[] a = {1, -1, 2, 3, -2, 1, 1, 0, 2};
        System.out.println("subarrays with sum 3: hashing " + subarraySum(a, 3)
                + ", brute force " + bruteForce(a, 3));
        Random rnd = new Random(7); boolean ok = true;
        for (int t = 0; t < 500; t++) {
            int[] r = new int[1 + rnd.nextInt(30)];
            for (int i = 0; i < r.length; i++) r[i] = rnd.nextInt(11) - 5;
            int k = rnd.nextInt(9) - 4;
            ok &= subarraySum(r, k) == bruteForce(r, k);
        }
        System.out.println("500 random tests agree with brute force: " + ok);
    }
}
```

> TIP: Test an optimised solution against a brute force on hundreds of small random inputs, as above. It catches off-by-one errors and missed cases that hand-picked examples never reveal. The habit costs five minutes and saves failed submissions.

> TRAP: In `subarraySum`, putting `count.put(0L, 1)` first is essential: it counts subarrays that start at index 0. And the lookup must happen **before** adding the current prefix, otherwise *k* = 0 counts the empty subarray.

### Frequency arrays for strings

For lowercase strings, an `int[26]` is faster and simpler than a map. Anagram checks, "first unique character" and grouping anagrams all reduce to comparing count arrays.

```java run Frequency counting: anagrams and grouping
import java.util.*;

public class Main {
    static boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        int[] c = new int[26];
        for (int i = 0; i < s.length(); i++) {
            c[s.charAt(i) - 'a']++;
            c[t.charAt(i) - 'a']--;
        }
        for (int x : c) if (x != 0) return false;
        return true;
    }
    static int firstUnique(String s) {
        int[] c = new int[26];
        for (char ch : s.toCharArray()) c[ch - 'a']++;
        for (int i = 0; i < s.length(); i++) if (c[s.charAt(i) - 'a'] == 1) return i;
        return -1;
    }
    public static void main(String[] args) {
        System.out.println("listen/silent " + isAnagram("listen", "silent")
                + ", rat/car " + isAnagram("rat", "car"));
        System.out.println("first unique in 'loveleetcode' at "
                + firstUnique("loveleetcode"));
        String[] words = {"eat", "tea", "tan", "ate", "nat", "bat"};
        Map<String, List<String>> groups = new TreeMap<>();
        for (String w : words) {
            char[] k = w.toCharArray(); Arrays.sort(k);           // sorted letters as key
            groups.computeIfAbsent(new String(k), x -> new ArrayList<>()).add(w);
        }
        System.out.println("groups " + groups.values());
    }
}
```

## 2.3 Two pointers

Two pointers replace a nested loop when the array is **sorted** (or can be sorted) and moving one end changes the answer monotonically. In pair-sum on a sorted array, if `a[l] + a[r]` is too small, nothing with this `l` can work with a smaller `r`, so `l++`; if too large, `r--`. Each step discards a whole row of pairs, so the scan is O(n).

```java run Two pointers: pair sum, 3Sum and container with most water
import java.util.*;

public class Main {
    static List<List<Integer>> threeSum(int[] a) {
        Arrays.sort(a);
        List<List<Integer>> res = new ArrayList<>();
        for (int i = 0; i < a.length - 2; i++) {
            if (i > 0 && a[i] == a[i - 1]) continue;          // skip duplicate anchors
            int l = i + 1, r = a.length - 1;
            while (l < r) {
                int s = a[i] + a[l] + a[r];
                if (s < 0) l++;
                else if (s > 0) r--;
                else {
                    res.add(List.of(a[i], a[l], a[r]));
                    while (l < r && a[l] == a[l + 1]) l++;     // skip duplicates
                    while (l < r && a[r] == a[r - 1]) r--;
                    l++; r--;
                }
            }
        }
        return res;
    }
    static int maxWater(int[] h) {
        int l = 0, r = h.length - 1, best = 0;
        while (l < r) {
            best = Math.max(best, Math.min(h[l], h[r]) * (r - l));
            if (h[l] < h[r]) l++; else r--;                     // move the shorter wall
        }
        return best;
    }
    public static void main(String[] args) {
        int[] sorted = {1, 3, 4, 6, 8, 11};
        int l = 0, r = sorted.length - 1, target = 14;
        while (l < r && sorted[l] + sorted[r] != target)
            if (sorted[l] + sorted[r] < target) l++; else r--;
        System.out.println("pair summing to 14: " + sorted[l] + " + " + sorted[r]);
        System.out.println("3Sum " + threeSum(new int[]{-1, 0, 1, 2, -1, -4}));
        System.out.println("max water " + maxWater(new int[]{1, 8, 6, 2, 5, 4, 8, 3, 7}));
    }
}
```

In "container with most water", moving the taller wall can never help: the width shrinks and the height is still capped by the shorter wall. That one-line argument is what the interviewer wants to hear.

### Same-direction pointers

A second family uses a slow and a fast pointer moving in the same direction: remove duplicates in place, move zeros to the end, partition around a pivot. The slow pointer marks "where the next kept element goes".

```java run In-place compaction with a slow and a fast pointer
import java.util.*;

public class Main {
    static int dedupSorted(int[] a) {             // returns new length
        int w = 0;
        for (int x : a) if (w == 0 || a[w - 1] != x) a[w++] = x;
        return w;
    }
    static void moveZeros(int[] a) {
        int w = 0;
        for (int x : a) if (x != 0) a[w++] = x;
        while (w < a.length) a[w++] = 0;
    }
    static void dutchFlag(int[] a) {              // sort 0s, 1s, 2s in one pass
        int lo = 0, mid = 0, hi = a.length - 1;
        while (mid <= hi) {
            if (a[mid] == 0) { int t = a[lo]; a[lo++] = a[mid]; a[mid++] = t; }
            else if (a[mid] == 1) mid++;
            else { int t = a[hi]; a[hi--] = a[mid]; a[mid] = t; }   // do not advance mid
        }
    }
    public static void main(String[] args) {
        int[] a = {1, 1, 2, 3, 3, 3, 4, 5, 5};
        int k = dedupSorted(a);
        System.out.println("dedup -> " + Arrays.toString(Arrays.copyOf(a, k)));
        int[] z = {0, 1, 0, 3, 12};
        moveZeros(z);
        System.out.println("move zeros -> " + Arrays.toString(z));
        int[] f = {2, 0, 2, 1, 1, 0, 0, 2, 1};
        dutchFlag(f);
        System.out.println("dutch flag -> " + Arrays.toString(f));
    }
}
```

> TRAP: In the Dutch national flag partition, after swapping a 2 to the end you must **not** advance `mid`: the element that arrived from `hi` has not been examined yet.

## 2.4 Sliding window

A sliding window keeps a contiguous range `[l, r]` and a running summary of it. The right end always advances; the left end advances only when the window becomes invalid. Because each index enters and leaves once, the whole scan is O(n).

| Window type | When | Template |
|---|---|---|
| Fixed size *k* | "every window of size *k*" | Add `a[r]`, remove `a[r-k]` |
| Variable, shrink while invalid | "longest window such that …" | Extend `r`; `while (invalid) remove a[l++]`; record `r - l + 1` |
| Variable, shrink while valid | "shortest window such that …" | Extend `r`; `while (valid) { record; remove a[l++]; }` |
| Count of windows | "number of subarrays with at most *k* …" | Answer `+= r - l + 1` at each `r`; "exactly *k*" = atMost(*k*) − atMost(*k* − 1) |

```java run Four sliding-window problems
import java.util.*;

public class Main {
    static int longestNoRepeat(String s) {             // variable, shrink while invalid
        int[] last = new int[128]; Arrays.fill(last, -1);
        int l = 0, best = 0;
        for (int r = 0; r < s.length(); r++) {
            char c = s.charAt(r);
            if (last[c] >= l) l = last[c] + 1;          // jump past the previous copy
            last[c] = r;
            best = Math.max(best, r - l + 1);
        }
        return best;
    }
    static int minLenAtLeast(int[] a, int target) {    // shortest window, positives only
        int l = 0, best = Integer.MAX_VALUE; long sum = 0;
        for (int r = 0; r < a.length; r++) {
            sum += a[r];
            while (sum >= target) { best = Math.min(best, r - l + 1); sum -= a[l++]; }
        }
        return best == Integer.MAX_VALUE ? 0 : best;
    }
    static String minWindow(String s, String t) {      // smallest window containing t
        int[] need = new int[128];
        for (char c : t.toCharArray()) need[c]++;
        int missing = t.length(), l = 0, bestL = 0, bestLen = Integer.MAX_VALUE;
        for (int r = 0; r < s.length(); r++) {
            if (need[s.charAt(r)]-- > 0) missing--;
            while (missing == 0) {
                if (r - l + 1 < bestLen) { bestLen = r - l + 1; bestL = l; }
                if (++need[s.charAt(l++)] > 0) missing++;
            }
        }
        return bestLen == Integer.MAX_VALUE ? "" : s.substring(bestL, bestL + bestLen);
    }
    static long atMostKDistinct(int[] a, int k) {
        Map<Integer, Integer> cnt = new HashMap<>();
        long total = 0; int l = 0;
        for (int r = 0; r < a.length; r++) {
            cnt.merge(a[r], 1, Integer::sum);
            while (cnt.size() > k) {
                if (cnt.merge(a[l], -1, Integer::sum) == 0) cnt.remove(a[l]);
                l++;
            }
            total += r - l + 1;                          // windows ending at r
        }
        return total;
    }
    public static void main(String[] args) {
        System.out.println("longest without repeat 'abcabcbb' = "
                + longestNoRepeat("abcabcbb")
                + ", 'pwwkew' = " + longestNoRepeat("pwwkew"));
        System.out.println("shortest sum >= 7 in [2,3,1,2,4,3] = "
                + minLenAtLeast(new int[]{2, 3, 1, 2, 4, 3}, 7));
        System.out.println("min window of 'ABC' in 'ADOBECODEBANC' = "
                + minWindow("ADOBECODEBANC", "ABC"));
        int[] a = {1, 2, 1, 2, 3};
        System.out.println("subarrays with exactly 2 distinct = "
                + (atMostKDistinct(a, 2) - atMostKDistinct(a, 1)));
    }
}
```

> TRAP: The "shrink while the sum is too big" window works only when all numbers are **non-negative**. With negative numbers, adding an element can decrease the sum, the monotonic property breaks, and you need prefix sums with a hash map (Section 2.2) or a monotonic deque (Chapter 4).

## 2.5 Kadane's algorithm

The maximum subarray sum is the classic one-pass dynamic programming problem: the best subarray ending at `i` either extends the best one ending at `i-1` or starts fresh at `i`.

```java run Kadane with the subarray bounds
public class Main {
    public static void main(String[] args) {
        int[] a = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
        long best = a[0], cur = a[0]; int start = 0, bestL = 0, bestR = 0;
        for (int i = 1; i < a.length; i++) {
            if (cur < 0) { cur = a[i]; start = i; } else cur += a[i];
            if (cur > best) { best = cur; bestL = start; bestR = i; }
        }
        System.out.printf("max subarray sum %d at [%d..%d]%n", best, bestL, bestR);
        int[] neg = {-8, -3, -6};
        long b = neg[0], c = neg[0];
        for (int i = 1; i < neg.length; i++) {
            c = Math.max(neg[i], c + neg[i]);
            b = Math.max(b, c);
        }
        System.out.println("all negative -> " + b + " (the largest single element)");
    }
}
```

> TRAP: Initialising `best = 0` returns 0 for an all-negative array, which is wrong when the subarray must be non-empty. Initialise with `a[0]`.

## 2.6 Matrix techniques

| Problem | Technique |
|---|---|
| Rotate an n × n matrix 90° clockwise in place | Transpose, then reverse each row |
| Spiral order | Four boundaries (top, bottom, left, right) shrinking after each side |
| Set matrix zeros in O(1) space | Use the first row and column as markers |
| Search a row- and column-sorted matrix | Start at the top-right corner: go left if too big, down if too small, O(m + n) |

```java run Rotate and spiral
import java.util.*;

public class Main {
    static void rotate(int[][] m) {
        int n = m.length;
        for (int i = 0; i < n; i++) for (int j = i + 1; j < n; j++) {
            int t = m[i][j]; m[i][j] = m[j][i]; m[j][i] = t;
        }
        for (int[] row : m)
            for (int l = 0, r = n - 1; l < r; l++, r--) {
                int t = row[l];
                row[l] = row[r];
                row[r] = t;
            }
    }
    static List<Integer> spiral(int[][] m) {
        List<Integer> out = new ArrayList<>();
        int top = 0, bot = m.length - 1, left = 0, right = m[0].length - 1;
        while (top <= bot && left <= right) {
            for (int j = left; j <= right; j++) out.add(m[top][j]);
            top++;
            for (int i = top; i <= bot; i++) out.add(m[i][right]);
            right--;
            if (top <= bot) {
                    for (int j = right; j >= left; j--) out.add(m[bot][j]); bot--; }
            if (left <= right) {
                for (int i = bot; i >= top; i--) out.add(m[i][left]);
                left++;
            }
        }
        return out;
    }
    public static void main(String[] args) {
        int[][] m = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
        rotate(m);
        System.out.println("rotated " + Arrays.deepToString(m));
        int[][] r = {{1, 2, 3, 4}, {5, 6, 7, 8}, {9, 10, 11, 12}};
        System.out.println("spiral of 3x4 " + spiral(r));
    }
}
```

The two `if` checks inside the spiral loop matter for non-square matrices: without them, a single remaining row or column is printed twice.

## 2.7 Practical lessons

- "Subarray sum equals *k*" with negatives: prefix sum + hash map of counts. With only positives: sliding window.
- Sorted input plus "pair/triplet": two pointers. Unsorted plus "pair": hash map of complements.
- "Longest/shortest contiguous … such that": sliding window. Check that the condition is monotonic as the window grows.
- "Exactly *k*" problems are often atMost(*k*) − atMost(*k* − 1).
- Validate every optimised solution against a brute force on small random inputs.
