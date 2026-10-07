# Solutions

## Part 1 solutions

### S1.1 Name the complexity

(a) O(log<sub>3</sub> n) = O(log n). (b) O(n log n): the inner loop runs n/i times, and n(1 + 1/2 + … + 1/n) ≈ n ln n. (c) O(n log n): the inner loop runs about log<sub>2</sub> i times, and the sum of log i for i < n is about n log n. (d) O(√n). (e) O(m + n): the two inputs stay separate.

```java run Counting the iterations
public class Main {
    public static void main(String[] args) {
        System.out.printf("%8s %6s %10s %10s %6s%n", "n", "(a)", "(b)", "(c)", "(d)");
        for (int n : new int[]{1_000, 10_000, 100_000}) {
            long a = 0, b = 0, c = 0, d = 0;
            for (long i = 1; i < n; i *= 3) a++;
            for (int i = 1; i <= n; i++) for (int j = i; j <= n; j += i) b++;
            for (int i = 0; i < n; i++) for (int j = i; j > 0; j /= 2) c++;
            for (long i = 0; i * i < n; i++) d++;
            System.out.printf("%8d %6d %10d %10d %6d%n", n, a, b, c, d);
        }
    }
}
```

Multiplying *n* by 10 adds 2 to (a), multiplies (b) and (c) by a little more than 10 (the extra log factor), and multiplies (d) by about 3.16 = √10.

### S1.2 Read the constraints

| Case | Acceptable complexity | Technique |
|---|---|---|
| (a) *n* ≤ 18, choose a subset | O(2<sup>n</sup> · n) ≈ 4.7 × 10<sup>6</sup> | Bitmask enumeration or backtracking |
| (b) *n* ≤ 3 000, two strings | O(n<sup>2</sup>) ≈ 9 × 10<sup>6</sup> | 2D DP on prefixes (LCS, edit distance) |
| (c) *n* ≤ 2 × 10<sup>5</sup>, count earlier greater | O(n log n) | Fenwick tree with compression, or merge sort |
| (d) *n* ≤ 10<sup>18</sup>, smallest *x* with *x*<sup>2</sup> ≥ *n* | O(log n) ≈ 60 steps | Binary search on the answer, overflow-safe (S3.2) |

For (c), O(n<sup>2</sup>) would be 4 × 10<sup>10</sup> operations, far beyond the ~10<sup>8</sup> per second budget.

### S1.3 Fix five bugs

```java run The five bugs, fixed
import java.util.*;

public class Main {
    public static void main(String[] args) {
        int n = 100_000, value = 30_000;
        int badSum = 0; long sum = 0;
        for (int i = 0; i < n; i++) { badSum += value; sum += value; }
        System.out.println("(a) int sum " + badSum + ", long sum " + sum
                + ", average " + sum / n);

        List<Integer> scores = new ArrayList<>(List.of(10, Integer.MIN_VALUE, 50, -7));
        List<Integer> bad = new ArrayList<>(scores);
        bad.sort((x, y) -> y - x);                       // overflows for MIN_VALUE
        scores.sort(Comparator.reverseOrder());
        System.out.println("(b) subtraction comparator " + bad);
        System.out.println("    reverseOrder           " + scores);

        Integer id1 = 5000, id2 = 5000;
        System.out.println("(c) == says " + (id1 == id2) + ", equals says "
                + id1.equals(id2));

        int pos = 1;
        System.out.println("(d) (pos - 3) % 8 = " + (pos - 3) % 8
                + ", Math.floorMod(pos - 3, 8) = " + Math.floorMod(pos - 3, 8));

        StringBuilder sb = new StringBuilder(n);
        for (int i = 0; i < n; i++) sb.append((char) ('a' + i % 26));
        System.out.println("(e) built " + sb.length() + " characters with StringBuilder");
    }
}
```

(a) 3 × 10<sup>9</sup> overflows an `int`; accumulate in `long`. (b) `y - x` overflows when one value is `Integer.MIN_VALUE`, so the "sorted" list is in the wrong order; use `Comparator.reverseOrder()` or `Integer.compare(y, x)`. (c) `==` compares references, and 5000 is outside the cache of −128 to 127. (d) Java's `%` keeps the sign of the dividend, giving an invalid index −2; `Math.floorMod` gives 6. (e) `s += c` copies the whole string every time, O(n<sup>2</sup>) character copies in total (about 5 × 10<sup>9</sup> here); `StringBuilder` is O(n).

## Part 2 solutions

### S2.1 Product except self

```java run Prefix and suffix products in two passes
import java.util.*;

public class Main {
    static long[] productExceptSelf(int[] a) {
        int n = a.length;
        long[] out = new long[n];
        long left = 1;
        for (int i = 0; i < n; i++) { out[i] = left; left *= a[i]; }    // product to the left
        long right = 1;
        for (int i = n - 1; i >= 0; i--) { out[i] *= right; right *= a[i]; }  // times right
        return out;
    }
    public static void main(String[] args) {
        System.out.println(Arrays.toString(productExceptSelf(new int[]{1, 2, 3, 4})));
        System.out.println(Arrays.toString(productExceptSelf(new int[]{-1, 1, 0, -3, 3})));
        System.out.println(Arrays.toString(productExceptSelf(new int[]{0, 4, 0})));
    }
}
```

The output array doubles as the prefix-product array, so the extra space is O(1) apart from the output. Division would fail with zeros: with one zero, every other position becomes 0; with two zeros, every position is 0. The two-pass method handles both without special cases.

### S2.2 Longest subarray with sum k

```java run First occurrence of each prefix sum
import java.util.*;

public class Main {
    static int longest(int[] a, long k) {
        Map<Long, Integer> first = new HashMap<>();
        first.put(0L, -1);                              // empty prefix ends at index -1
        long prefix = 0; int best = 0;
        for (int i = 0; i < a.length; i++) {
            prefix += a[i];
            Integer j = first.get(prefix - k);
            if (j != null) best = Math.max(best, i - j);
            first.putIfAbsent(prefix, i);               // keep the earliest index only
        }
        return best;
    }
    static int brute(int[] a, long k) {
        int best = 0;
        for (int i = 0; i < a.length; i++) {
            long s = 0;
            for (int j = i; j < a.length; j++)
                if ((s += a[j]) == k) best = Math.max(best, j - i + 1);
        }
        return best;
    }
    public static void main(String[] args) {
        System.out.println("[1,-1,5,-2,3], k=3 -> " + longest(new int[]{1, -1, 5, -2, 3}, 3));
        System.out.println("[-2,-1,2,1], k=1 -> " + longest(new int[]{-2, -1, 2, 1}, 1));
        Random r = new Random(11); boolean ok = true;
        for (int t = 0; t < 500; t++) {
            int[] x = new int[1 + r.nextInt(25)];
            for (int i = 0; i < x.length; i++) x[i] = r.nextInt(11) - 5;
            int k = r.nextInt(11) - 5;
            ok &= longest(x, k) == brute(x, k);
        }
        System.out.println("500 random tests agree with brute force: " + ok);
    }
}
```

> TRAP: `put` instead of `putIfAbsent` overwrites the first occurrence with a later one, which shortens the subarrays found. For the **longest** subarray you want the **earliest** matching prefix.

### S2.3 At most k distinct characters

```java run Variable window with a count array
public class Main {
    static int longestAtMostK(String s, int k) {
        int[] cnt = new int[128];
        int distinct = 0, l = 0, best = 0;
        for (int r = 0; r < s.length(); r++) {
            if (cnt[s.charAt(r)]++ == 0) distinct++;
            while (distinct > k) if (--cnt[s.charAt(l++)] == 0) distinct--;
            best = Math.max(best, r - l + 1);
        }
        return best;
    }
    public static void main(String[] args) {
        System.out.println("eceba k=2 -> " + longestAtMostK("eceba", 2));
        System.out.println("aa k=1 -> " + longestAtMostK("aa", 1));
        System.out.println("abaccc k=2 -> " + longestAtMostK("abaccc", 2));
        System.out.println("abc k=0 -> " + longestAtMostK("abc", 0));
    }
}
```

Each character enters and leaves the window once, so the scan is O(n), and a counter of distinct characters avoids scanning the count array.

### S2.4 Trapping rain water

```java run Two pointers with running maxima
public class Main {
    static long trap(int[] h) {
        int l = 0, r = h.length - 1, leftMax = 0, rightMax = 0;
        long water = 0;
        while (l < r) {
            if (h[l] < h[r]) {                          // left side is the bottleneck
                leftMax = Math.max(leftMax, h[l]);
                water += leftMax - h[l++];
            } else {
                rightMax = Math.max(rightMax, h[r]);
                water += rightMax - h[r--];
            }
        }
        return water;
    }
    static long brute(int[] h) {
        long w = 0;
        for (int i = 0; i < h.length; i++) {
            int lm = 0, rm = 0;
            for (int j = 0; j <= i; j++) lm = Math.max(lm, h[j]);
            for (int j = i; j < h.length; j++) rm = Math.max(rm, h[j]);
            w += Math.min(lm, rm) - h[i];
        }
        return w;
    }
    public static void main(String[] args) {
        int[] h = {0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1};
        System.out.println("trapped " + trap(h) + " (brute force " + brute(h) + ")");
        System.out.println("[4,2,0,3,2,5] -> " + trap(new int[]{4, 2, 0, 3, 2, 5}));
        java.util.Random r = new java.util.Random(2); boolean ok = true;
        for (int t = 0; t < 500; t++) {
            int[] x = new int[1 + r.nextInt(20)];
            for (int i = 0; i < x.length; i++) x[i] = r.nextInt(6);
            ok &= trap(x) == brute(x);
        }
        System.out.println("500 random tests agree: " + ok);
    }
}
```

Why moving the smaller side is safe: if `h[l] < h[r]`, the right side has a bar at least as tall as `h[l]`, so the water above `l` is limited only by `leftMax`, which is already known.

### S2.5 All anagram positions

```java run Fixed window with a match counter
import java.util.*;

public class Main {
    static List<Integer> anagrams(String s, String p) {
        List<Integer> out = new ArrayList<>();
        if (p.length() > s.length()) return out;
        int[] need = new int[26];
        for (char c : p.toCharArray()) need[c - 'a']++;
        int m = p.length(), missing = m;
        for (int r = 0; r < s.length(); r++) {
            if (need[s.charAt(r) - 'a']-- > 0) missing--;            // char enters
            if (r >= m && ++need[s.charAt(r - m) - 'a'] > 0) missing++; // char leaves
            if (missing == 0) out.add(r - m + 1);
        }
        return out;
    }
    public static void main(String[] args) {
        System.out.println("cbaebabacd / abc -> " + anagrams("cbaebabacd", "abc"));
        System.out.println("abab / ab -> " + anagrams("abab", "ab"));
        System.out.println("a / ab -> " + anagrams("a", "ab"));
    }
}
```

`need[c]` goes negative for surplus characters, and `missing` counts the characters of *p* still not covered, so each window costs O(1) instead of comparing two 26-entry arrays.

### S2.6 Subarrays divisible by k

```java run Counting prefix remainders
import java.util.*;

public class Main {
    static long count(int[] a, int k) {
        long[] seen = new long[k];
        seen[0] = 1;                                     // empty prefix, remainder 0
        long result = 0; int rem = 0;
        for (int x : a) {
            rem = Math.floorMod(rem + x, k);             // stays in 0..k-1 for negatives
            result += seen[rem]++;
        }
        return result;
    }
    static long brute(int[] a, int k) {
        long c = 0;
        for (int i = 0; i < a.length; i++) {
            long s = 0;
            for (int j = i; j < a.length; j++) if ((s += a[j]) % k == 0) c++;
        }
        return c;
    }
    public static void main(String[] args) {
        int[] a = {4, 5, 0, -2, -3, 1};
        System.out.println("count " + count(a, 5) + " (brute force " + brute(a, 5) + ")");
        Random r = new Random(4); boolean ok = true;
        for (int t = 0; t < 500; t++) {
            int[] x = new int[1 + r.nextInt(25)];
            for (int i = 0; i < x.length; i++) x[i] = r.nextInt(21) - 10;
            int k = 1 + r.nextInt(7);
            ok &= count(x, k) == brute(x, k);
        }
        System.out.println("500 random tests agree: " + ok);
    }
}
```

With `%` instead of `Math.floorMod`, a prefix sum of −3 with *k* = 5 gives remainder −3 instead of 2. In this array version that is a negative index and the program crashes; in a version that keeps remainders in a `HashMap` it is worse, because −3 is never matched with remainder 2 and the count is silently too low.

## Part 3 solutions

### S3.1 First and last position

```java run Two lower bounds
import java.util.*;

public class Main {
    static int lowerBound(int[] a, int x) {
        int lo = 0, hi = a.length;
        while (lo < hi) {
            int mid = (lo + hi) >>> 1;
            if (a[mid] >= x) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
    static int[] range(int[] a, int t) {
        int first = lowerBound(a, t);
        if (first == a.length || a[first] != t) return new int[]{-1, -1};
        return new int[]{first, lowerBound(a, t + 1) - 1};
    }
    public static void main(String[] args) {
        int[] a = {5, 7, 7, 8, 8, 10};
        for (int t : new int[]{8, 6, 5, 10})
            System.out.println("target " + t + " -> " + Arrays.toString(range(a, t)));
        System.out.println("empty -> " + Arrays.toString(range(new int[0], 1)));
    }
}
```

> TRAP: `t + 1` overflows when `t == Integer.MAX_VALUE`. For full safety, compute the upper bound with the condition `a[mid] > t` instead.

### S3.2 Integer square root of a long

```java run Overflow-safe binary search
public class Main {
    static long isqrt(long n) {                    // largest x with x*x <= n
        long lo = 0, hi = Math.min(n, 3_037_000_499L) + 1;   // first x with x*x > n
        while (lo < hi) {
            long mid = lo + (hi - lo) / 2;
            if (mid != 0 && mid > n / mid) hi = mid; else lo = mid + 1;
        }
        return lo - 1;
    }
    public static void main(String[] args) {
        long[] tests = {0, 1, 15, 16, 17, 1_000_000_000_000_000_000L, Long.MAX_VALUE};
        for (long n : tests) System.out.println("isqrt(" + n + ") = " + isqrt(n));
        long r = isqrt(Long.MAX_VALUE);
        System.out.println("check: r*r <= MAX " + (r * r <= Long.MAX_VALUE && r * r > 0)
                + ", (r+1)^2 overflows past MAX: " + ((r + 1) * (r + 1) < 0));
    }
}
```

3 037 000 499 is ⌊√(2<sup>63</sup> − 1)⌋, so no candidate squared can exceed `Long.MAX_VALUE`; the division test `mid > n / mid` avoids the multiplication altogether. `Math.sqrt` on a `long` this large goes through a `double` with 53 bits of precision, and can be off by one.

### S3.3 Koko eating bananas

```java run Binary search on the speed
public class Main {
    static long hours(int[] piles, long speed) {
        long h = 0;
        for (int p : piles) h += (p + speed - 1) / speed;      // ceiling division
        return h;
    }
    static long minSpeed(int[] piles, long h) {
        long lo = 1, hi = 0;
        for (int p : piles) hi = Math.max(hi, p);
        while (lo < hi) {
            long mid = lo + (hi - lo) / 2;
            if (hours(piles, mid) <= h) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
    public static void main(String[] args) {
        System.out.println("[3,6,7,11] h=8 -> " + minSpeed(new int[]{3, 6, 7, 11}, 8));
        int[] p = {30, 11, 23, 4, 20};
        System.out.println("[30,11,23,4,20] h=5 -> " + minSpeed(p, 5));
        System.out.println("[30,11,23,4,20] h=6 -> " + minSpeed(p, 6));
    }
}
```

The search range is 1 to the largest pile (at that speed every pile takes one hour). Each check is O(n), so the total is O(n log max).

### S3.4 Aggressive cows

```java run Maximise the minimum distance
import java.util.*;

public class Main {
    static boolean fits(int[] s, int cows, int d) {
        int placed = 1, last = s[0];
        for (int i = 1; i < s.length; i++)
            if (s[i] - last >= d) { placed++; last = s[i]; }
        return placed >= cows;
    }
    static int largestMinDistance(int[] stalls, int cows) {
        int[] s = stalls.clone(); Arrays.sort(s);
        int lo = 0, hi = s[s.length - 1] - s[0] + 1;   // first d that does NOT fit
        while (lo < hi) {
            int mid = (lo + hi) >>> 1;
            if (!fits(s, cows, mid)) hi = mid; else lo = mid + 1;
        }
        return lo - 1;                                   // last d that fits
    }
    public static void main(String[] args) {
        int[] a = {1, 2, 4, 8, 9}, b = {1, 2, 8, 4, 9};
        System.out.println("[1,2,4,8,9] c=3 -> " + largestMinDistance(a, 3));
        System.out.println("[1,2,8,4,9] c=2 -> " + largestMinDistance(b, 2));
        System.out.println("[0,3,4,7,10,9] c=4 -> "
                + largestMinDistance(new int[]{0, 3, 4, 7, 10, 9}, 4));
    }
}
```

This is the "maximise the minimum" form: `fits` is true for small distances and false for large ones, so the template finds the first false and subtracts one. Greedy placement from the left is optimal for a fixed *d*: putting each cow as early as possible leaves the most room for the rest.

### S3.5 Insert an interval

```java run Three phases in one pass
import java.util.*;

public class Main {
    static List<int[]> insert(int[][] iv, int[] add) {
        List<int[]> out = new ArrayList<>();
        int i = 0, n = iv.length, s = add[0], e = add[1];
        while (i < n && iv[i][1] < s) out.add(iv[i++]);          // entirely before
        while (i < n && iv[i][0] <= e) {                          // overlapping: absorb
            s = Math.min(s, iv[i][0]); e = Math.max(e, iv[i][1]); i++;
        }
        out.add(new int[]{s, e});
        while (i < n) out.add(iv[i++]);                           // entirely after
        return out;
    }
    static String show(List<int[]> l) {
        StringBuilder sb = new StringBuilder();
        for (int[] x : l) sb.append(Arrays.toString(x));
        return sb.toString();
    }
    public static void main(String[] args) {
        int[][] iv = {{1, 2}, {3, 5}, {6, 7}, {8, 10}, {12, 16}};
        System.out.println(show(insert(iv, new int[]{4, 8})));
        System.out.println(show(insert(new int[][]{{1, 3}, {6, 9}}, new int[]{2, 5})));
        System.out.println(show(insert(new int[][]{}, new int[]{5, 7})));
        System.out.println(show(insert(new int[][]{{1, 5}}, new int[]{6, 8})));
    }
}
```

## Part 4 solutions

### S4.1 Palindrome linked list

```java run Reverse the second half, compare, restore
public class Main {
    static class Node { int val; Node next; Node(int v, Node n) { val = v; next = n; } }
    static Node of(int... v) {
        Node h = null;
        for (int i = v.length - 1; i >= 0; i--) h = new Node(v[i], h);
        return h;
    }
    static Node reverse(Node h) {
        Node prev = null;
        while (h != null) { Node nx = h.next; h.next = prev; prev = h; h = nx; }
        return prev;
    }
    static boolean isPalindrome(Node head) {
        Node slow = head, fast = head;
        while (fast != null && fast.next != null) { slow = slow.next; fast = fast.next.next; }
        Node second = reverse(slow), p = head, q = second;
        boolean ok = true;
        while (q != null) {
            if (p.val != q.val) { ok = false; break; }
            p = p.next; q = q.next;
        }
        reverse(second);                                  // restore the input
        return ok;
    }
    static String str(Node h) {
        StringBuilder sb = new StringBuilder();
        for (; h != null; h = h.next) sb.append(h.val);
        return sb.toString();
    }
    public static void main(String[] args) {
        for (Node h : new Node[]{of(1, 2, 2, 1), of(1, 2, 3, 2, 1), of(1, 2), of(7)}) {
            String before = str(h);
            boolean p = isPalindrome(h);
            System.out.println(before + " palindrome? " + p + ", list after: " + str(h));
        }
    }
}
```

The node before `slow` still points at it, so after reversing the second half back, the original list is intact. Restoring the input is the detail interviewers check: a function that answers a question should not destroy its argument.

### S4.2 Reverse in groups of k

```java run Group reversal with a dummy head
public class Main {
    static class Node { int val; Node next; Node(int v, Node n) { val = v; next = n; } }
    static Node reverseK(Node head, int k) {
        Node dummy = new Node(0, head), groupPrev = dummy;
        while (true) {
            Node kth = groupPrev;
            for (int i = 0; i < k && kth != null; i++) kth = kth.next;
            if (kth == null) break;                        // fewer than k nodes remain
            Node groupNext = kth.next, prev = groupNext, cur = groupPrev.next;
            while (cur != groupNext) {
                Node nx = cur.next; cur.next = prev; prev = cur; cur = nx;
            }
            Node oldFirst = groupPrev.next;                // becomes the group's tail
            groupPrev.next = kth;
            groupPrev = oldFirst;
        }
        return dummy.next;
    }
    static String run(int n, int k) {
        Node h = null;
        for (int i = n; i >= 1; i--) h = new Node(i, h);
        StringBuilder sb = new StringBuilder();
        for (Node p = reverseK(h, k); p != null; p = p.next) sb.append(p.val).append(' ');
        return sb.toString().trim();
    }
    public static void main(String[] args) {
        System.out.println("1..8, k=3 -> " + run(8, 3));
        System.out.println("1..6, k=2 -> " + run(6, 2));
        System.out.println("1..5, k=1 -> " + run(5, 1));
        System.out.println("1..4, k=5 -> " + run(4, 5));
    }
}
```

Starting `prev` at `groupNext` makes the reversed group's last node point straight at the next group, so only one more link (`groupPrev.next = kth`) is needed.

### S4.3 Queue from two stacks

```java run Amortised O(1) with a move counter
import java.util.*;

public class Main {
    static class TwoStackQueue {
        private final Deque<Integer> in = new ArrayDeque<>(), out = new ArrayDeque<>();
        long moves = 0;
        void offer(int x) { in.push(x); }
        int poll() { shift(); return out.pop(); }
        int peek() { shift(); return out.peek(); }
        boolean isEmpty() { return in.isEmpty() && out.isEmpty(); }
        private void shift() {
            if (out.isEmpty()) while (!in.isEmpty()) { out.push(in.pop()); moves++; }
        }
    }
    public static void main(String[] args) {
        TwoStackQueue q = new TwoStackQueue();
        ArrayDeque<Integer> ref = new ArrayDeque<>();
        Random r = new Random(8);
        boolean same = true; int ops = 100_000;
        for (int i = 0; i < ops; i++) {
            if (ref.isEmpty() || r.nextInt(5) < 3) { q.offer(i); ref.offer(i); }
            else same &= q.poll() == ref.poll();
        }
        System.out.println("FIFO order matches ArrayDeque: " + same);
        System.out.printf("moves %,d over %,d operations = %.2f per operation%n",
                q.moves, ops, (double) q.moves / ops);
    }
}
```

Every element is moved from `in` to `out` at most once in its lifetime, so the total number of moves never exceeds the number of `offer` calls: the cost per operation stays below 1 move, although a single `poll` can move many elements.

### S4.4 Asteroid collision

```java run A stack of survivors
import java.util.*;

public class Main {
    static int[] collide(int[] a) {
        Deque<Integer> st = new ArrayDeque<>();
        for (int x : a) {
            boolean alive = true;
            while (alive && x < 0 && !st.isEmpty() && st.peek() > 0) {
                if (st.peek() < -x) st.pop();            // top explodes, x keeps going
                else if (st.peek() == -x) { st.pop(); alive = false; }
                else alive = false;                      // x explodes
            }
            if (alive) st.push(x);
        }
        int[] out = new int[st.size()];
        for (int i = out.length - 1; i >= 0; i--) out[i] = st.pop();
        return out;
    }
    public static void main(String[] args) {
        int[][] tests = {{5, 10, -5}, {8, -8}, {10, 2, -5}, {-2, -1, 1, 2}, {1, -2, -2, -2}};
        for (int[] t : tests)
            System.out.println(Arrays.toString(t) + " -> " + Arrays.toString(collide(t)));
    }
}
```

Only a left-moving asteroid meeting a right-moving one on top of the stack collides; `[-2, -1, 1, 2]` moves apart and nothing happens.

### S4.5 Sum of subarray minimums

```java run Contribution of each element with monotonic stacks
import java.util.*;

public class Main {
    static final long MOD = 1_000_000_007L;
    static long sumMins(int[] a) {
        int n = a.length;
        int[] left = new int[n], right = new int[n];
        Deque<Integer> st = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {                  // previous strictly smaller
            while (!st.isEmpty() && a[st.peek()] >= a[i]) st.pop();
            left[i] = st.isEmpty() ? -1 : st.peek();
            st.push(i);
        }
        st.clear();
        for (int i = n - 1; i >= 0; i--) {             // next smaller or equal
            while (!st.isEmpty() && a[st.peek()] > a[i]) st.pop();
            right[i] = st.isEmpty() ? n : st.peek();
            st.push(i);
        }
        long total = 0;
        for (int i = 0; i < n; i++)
            total = (total + (long) a[i] * (i - left[i]) % MOD * (right[i] - i)) % MOD;
        return total;
    }
    static long brute(int[] a) {
        long s = 0;
        for (int i = 0; i < a.length; i++) {
            int m = Integer.MAX_VALUE;
            for (int j = i; j < a.length; j++) { m = Math.min(m, a[j]); s += m; }
        }
        return s % MOD;
    }
    public static void main(String[] args) {
        System.out.println("[3,1,2,4] -> " + sumMins(new int[]{3, 1, 2, 4}));
        System.out.println("[2,2,2] -> " + sumMins(new int[]{2, 2, 2}) + " (brute "
                + brute(new int[]{2, 2, 2}) + ")");
        Random r = new Random(6); boolean ok = true;
        for (int t = 0; t < 500; t++) {
            int[] x = new int[1 + r.nextInt(30)];
            for (int i = 0; i < x.length; i++) x[i] = 1 + r.nextInt(5);   // many duplicates
            ok &= sumMins(x) == brute(x);
        }
        System.out.println("500 random tests with duplicates agree: " + ok);
    }
}
```

Element `a[i]` is the minimum of every subarray that starts after `left[i]` and ends before `right[i]`: `(i - left[i]) × (right[i] - i)` subarrays. The asymmetry (strictly smaller on one side, smaller-or-equal on the other) assigns a subarray with several equal minimums to exactly one of them; using `>=` on both sides would count `[2, 2, 2]`'s subarrays more than once.
