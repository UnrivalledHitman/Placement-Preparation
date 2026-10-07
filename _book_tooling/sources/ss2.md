## Part 5 solutions

### S5.1 Balanced parentheses

```java run Backtracking with open and close counts
import java.util.*;

public class Main {
    static void gen(int open, int close, int n, StringBuilder sb, List<String> out) {
        if (sb.length() == 2 * n) { out.add(sb.toString()); return; }
        if (open < n) {
            sb.append('('); gen(open + 1, close, n, sb, out); sb.setLength(sb.length() - 1);
        }
        if (close < open) {
            sb.append(')'); gen(open, close + 1, n, sb, out); sb.setLength(sb.length() - 1);
        }
    }
    public static void main(String[] args) {
        List<String> three = new ArrayList<>();
        gen(0, 0, 3, new StringBuilder(), three);
        System.out.println("n=3: " + three);
        StringBuilder counts = new StringBuilder();
        for (int n = 1; n <= 10; n++) {
            List<String> out = new ArrayList<>();
            gen(0, 0, n, new StringBuilder(), out);
            counts.append(out.size()).append(' ');
        }
        System.out.println("counts n=1..10: " + counts.toString().trim());
    }
}
```

The counts 1, 2, 5, 14, 42, … are the **Catalan numbers**, C<sub>n</sub> = (2n)! / ((n + 1)! n!), which grow roughly like 4<sup>n</sup> / n<sup>1.5</sup>. Because the two rules never produce an invalid prefix, the search wastes no work: every leaf is an answer.

### S5.2 Phone keypad words

```java run One level per digit
import java.util.*;

public class Main {
    static final String[] KEYS =
            {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};
    static void go(String d, int i, StringBuilder sb, List<String> out) {
        if (i == d.length()) { out.add(sb.toString()); return; }
        for (char c : KEYS[d.charAt(i) - '0'].toCharArray()) {
            sb.append(c);
            go(d, i + 1, sb, out);
            sb.setLength(sb.length() - 1);
        }
    }
    static List<String> letters(String digits) {
        List<String> out = new ArrayList<>();
        if (!digits.isEmpty()) go(digits, 0, new StringBuilder(), out);
        return out;
    }
    public static void main(String[] args) {
        System.out.println("23 -> " + letters("23"));
        System.out.println("79 -> " + letters("79").size() + " combinations");
        System.out.println("empty -> " + letters(""));
    }
}
```

The number of results is the product of the key sizes: 4 × 4 = 16 for `"79"`. The empty input must return an empty list, not a list containing the empty string; that edge case fails many submissions.

### S5.3 Palindrome partitioning

```java run Precomputed palindrome table plus backtracking
import java.util.*;

public class Main {
    static List<List<String>> partition(String s) {
        int n = s.length();
        boolean[][] pal = new boolean[n][n];
        for (int i = n - 1; i >= 0; i--)
            for (int j = i; j < n; j++)
                pal[i][j] = s.charAt(i) == s.charAt(j) && (j - i < 2 || pal[i + 1][j - 1]);
        List<List<String>> out = new ArrayList<>();
        go(s, 0, pal, new ArrayDeque<>(), out);
        return out;
    }
    static void go(String s, int start, boolean[][] pal, Deque<String> path,
                   List<List<String>> out) {
        if (start == s.length()) { out.add(new ArrayList<>(path)); return; }
        for (int end = start; end < s.length(); end++) {
            if (!pal[start][end]) continue;
            path.addLast(s.substring(start, end + 1));
            go(s, end + 1, pal, path, out);
            path.removeLast();
        }
    }
    public static void main(String[] args) {
        System.out.println("aab -> " + partition("aab"));
        System.out.println("aaaa -> " + partition("aaaa").size() + " partitions");
        System.out.println("racecar -> " + partition("racecar"));
    }
}
```

`"aaaa"` has 8 = 2<sup>3</sup> partitions because every one of the three gaps can be cut or not and every piece is a palindrome; that is the worst case, O(n · 2<sup>n</sup>) output.

### S5.4 N-Queens with bitmasks

```java run Counting solutions with three integers
public class Main {
    static long count(int n, int cols, int d1, int d2) {
        int full = (1 << n) - 1;
        if (cols == full) return 1;
        long total = 0;
        int free = ~(cols | d1 | d2) & full;
        while (free != 0) {
            int bit = free & -free;                         // lowest free column
            free -= bit;
            total += count(n, cols | bit, (d1 | bit) << 1 & full, (d2 | bit) >> 1);
        }
        return total;
    }
    public static void main(String[] args) {
        long[] known = {1, 0, 0, 2, 10, 4, 40, 92, 352, 724, 2680, 14200};
        StringBuilder sb = new StringBuilder(); boolean ok = true;
        for (int n = 1; n <= 12; n++) {
            long c = count(n, 0, 0, 0);
            sb.append(c).append(' ');
            ok &= c == known[n - 1];
        }
        System.out.println("n=1..12: " + sb.toString().trim());
        System.out.println("all match the known values: " + ok);
    }
}
```

Moving to the next row shifts every diagonal attack by one column: the "down-left" mask shifts one way, the "down-right" mask the other. All three safety checks happen at once in `~(cols | d1 | d2)`, and `free & -free` jumps straight to the next free column, so there is no loop over occupied columns.

## Part 6 solutions

The solutions in this part share a helper that builds a tree from a level-order array with `null` for missing children, as in the guide.

### S6.1 Right side view

```java run The last node of each level
import java.util.*;

public class Main {
    static class Node { int val; Node left, right; Node(int v) { val = v; } }
    static Node build(Integer... v) {
        Node root = new Node(v[0]);
        Deque<Node> q = new ArrayDeque<>(List.of(root));
        for (int i = 1; i < v.length; i += 2) {
            Node n = q.poll();
            if (v[i] != null) q.offer(n.left = new Node(v[i]));
            if (i + 1 < v.length && v[i + 1] != null) q.offer(n.right = new Node(v[i + 1]));
        }
        return root;
    }
    static List<Integer> rightView(Node root) {
        List<Integer> out = new ArrayList<>();
        Deque<Node> q = new ArrayDeque<>();
        if (root != null) q.offer(root);
        while (!q.isEmpty()) {
            int size = q.size();
            for (int k = 0; k < size; k++) {
                Node n = q.poll();
                if (k == size - 1) out.add(n.val);         // last on this level
                if (n.left != null) q.offer(n.left);
                if (n.right != null) q.offer(n.right);
            }
        }
        return out;
    }
    public static void main(String[] args) {
        System.out.println(rightView(build(1, 2, 3, null, 5, null, 4)));
        System.out.println(rightView(build(1, 2, 3, 4)) + " (4 is a left child)");
    }
}
```

A DFS that visits the right child first and records the first node seen at each depth gives the same answer with O(h) space.

### S6.2 Zigzag level order

```java run Alternating direction with a deque per level
import java.util.*;

public class Main {
    static class Node { int val; Node left, right; Node(int v) { val = v; } }
    static Node build(Integer... v) {
        Node root = new Node(v[0]);
        Deque<Node> q = new ArrayDeque<>(List.of(root));
        for (int i = 1; i < v.length; i += 2) {
            Node n = q.poll();
            if (v[i] != null) q.offer(n.left = new Node(v[i]));
            if (i + 1 < v.length && v[i + 1] != null) q.offer(n.right = new Node(v[i + 1]));
        }
        return root;
    }
    static List<List<Integer>> zigzag(Node root) {
        List<List<Integer>> out = new ArrayList<>();
        Deque<Node> q = new ArrayDeque<>();
        if (root != null) q.offer(root);
        boolean leftToRight = true;
        while (!q.isEmpty()) {
            LinkedList<Integer> level = new LinkedList<>();
            for (int k = q.size(); k > 0; k--) {
                Node n = q.poll();
                if (leftToRight) level.addLast(n.val); else level.addFirst(n.val);
                if (n.left != null) q.offer(n.left);
                if (n.right != null) q.offer(n.right);
            }
            out.add(level);
            leftToRight = !leftToRight;
        }
        return out;
    }
    public static void main(String[] args) {
        System.out.println(zigzag(build(3, 9, 20, null, null, 15, 7)));
        System.out.println(zigzag(build(1, 2, 3, 4, 5, 6, 7, 8, 9)));
    }
}
```

The queue order never changes; only the position where each value is added to its level list alternates. Reversing the child order instead is a common bug: it scrambles the following levels.

### S6.3 Downward paths with sum k

```java run Prefix sums along the root-to-node path
import java.util.*;

public class Main {
    static class Node { int val; Node left, right; Node(int v) { val = v; } }
    static Node build(Integer... v) {
        Node root = new Node(v[0]);
        Deque<Node> q = new ArrayDeque<>(List.of(root));
        for (int i = 1; i < v.length; i += 2) {
            Node n = q.poll();
            if (v[i] != null) q.offer(n.left = new Node(v[i]));
            if (i + 1 < v.length && v[i + 1] != null) q.offer(n.right = new Node(v[i + 1]));
        }
        return root;
    }
    static int count(Node n, long prefix, long k, Map<Long, Integer> seen) {
        if (n == null) return 0;
        prefix += n.val;
        int c = seen.getOrDefault(prefix - k, 0);
        seen.merge(prefix, 1, Integer::sum);                 // enter this node
        c += count(n.left, prefix, k, seen) + count(n.right, prefix, k, seen);
        seen.merge(prefix, -1, Integer::sum);                // leave: undo
        return c;
    }
    static int brute(Node n, long k) {                       // start a path at every node
        if (n == null) return 0;
        return from(n, k) + brute(n.left, k) + brute(n.right, k);
    }
    static int from(Node n, long left) {
        if (n == null) return 0;
        left -= n.val;
        return (left == 0 ? 1 : 0) + from(n.left, left) + from(n.right, left);
    }
    public static void main(String[] args) {
        Node t = build(10, 5, -3, 3, 2, null, 11, 3, -2, null, 1);
        Map<Long, Integer> seen = new HashMap<>(Map.of(0L, 1));
        System.out.println("k=8: prefix sums " + count(t, 0, 8, seen) + ", brute force "
                + brute(t, 8));
        Node z = build(1, -1, 1, 1, -1, -1, 1);
        Map<Long, Integer> s2 = new HashMap<>(Map.of(0L, 1));
        System.out.println("k=0 with cancelling values: " + count(z, 0, 0, s2)
                + ", brute force " + brute(z, 0));
    }
}
```

The three paths for *k* = 8 are 5 → 3, 5 → 2 → 1 and −3 → 11. Undoing the map entry when leaving a node is essential: without it, prefix sums from a sibling subtree would match paths that are not downward.

### S6.4 LCA in a BST

```java run Walk down using the ordering
public class Main {
    static class Node { int val; Node left, right; Node(int v) { val = v; } }
    static Node insert(Node n, int v) {
        if (n == null) return new Node(v);
        if (v < n.val) n.left = insert(n.left, v); else n.right = insert(n.right, v);
        return n;
    }
    static int lca(Node n, int a, int b) {
        while (n != null) {
            if (a < n.val && b < n.val) n = n.left;
            else if (a > n.val && b > n.val) n = n.right;
            else return n.val;                       // the paths split here
        }
        throw new IllegalArgumentException("empty tree");
    }
    public static void main(String[] args) {
        Node root = null;
        for (int v : new int[]{6, 2, 8, 0, 4, 7, 9, 3, 5}) root = insert(root, v);
        System.out.println("LCA(2,8)=" + lca(root, 2, 8) + " LCA(2,4)=" + lca(root, 2, 4)
                + " LCA(3,5)=" + lca(root, 3, 5) + " LCA(7,9)=" + lca(root, 7, 9));
    }
}
```

The first node whose value lies between *a* and *b* (inclusive) is the LCA: above it both values are on the same side, and from it they go different ways. `LCA(2, 4)` is 2 because a node counts as its own ancestor.

### S6.5 Delete from a BST

```java run Three deletion cases
import java.util.*;

public class Main {
    static class Node { int val; Node left, right; Node(int v) { val = v; } }
    static Node insert(Node n, int v) {
        if (n == null) return new Node(v);
        if (v < n.val) n.left = insert(n.left, v); else n.right = insert(n.right, v);
        return n;
    }
    static Node delete(Node n, int key) {
        if (n == null) return null;
        if (key < n.val) n.left = delete(n.left, key);
        else if (key > n.val) n.right = delete(n.right, key);
        else {
            if (n.left == null) return n.right;              // leaf or right child only
            if (n.right == null) return n.left;              // left child only
            Node s = n.right;
            while (s.left != null) s = s.left;               // inorder successor
            n.val = s.val;
            n.right = delete(n.right, s.val);
        }
        return n;
    }
    static void in(Node n, List<Integer> out) {
        if (n == null) return;
        in(n.left, out); out.add(n.val); in(n.right, out);
    }
    static String show(Node n) {
        List<Integer> l = new ArrayList<>();
        in(n, l);
        return l.toString();
    }
    public static void main(String[] args) {
        Node root = null;
        for (int v : new int[]{50, 30, 70, 20, 40, 60, 80, 65}) root = insert(root, v);
        System.out.println("start          " + show(root));
        root = delete(root, 20);
        System.out.println("delete leaf 20 " + show(root));
        root = delete(root, 60);
        System.out.println("delete 60 (one child 65) " + show(root));
        root = delete(root, 50);
        System.out.println("delete root 50 " + show(root) + ", new root " + root.val);
    }
}
```

After deleting 50, its successor 65 moves into the root, which keeps every key on the left smaller and every key on the right larger. Deleting a missing key returns the tree unchanged.

## Part 7 solutions

### S7.1 Kth largest

```java run Min-heap of size k against sorting
import java.util.*;

public class Main {
    static int kthLargest(int[] a, int k) {
        PriorityQueue<Integer> heap = new PriorityQueue<>();
        for (int x : a) {
            heap.offer(x);
            if (heap.size() > k) heap.poll();          // drop the smallest of k+1
        }
        return heap.peek();
    }
    public static void main(String[] args) {
        int[] a = {3, 2, 1, 5, 6, 4};
        System.out.println("[3,2,1,5,6,4], k=2 -> " + kthLargest(a, 2));
        System.out.println("[3,2,3,1,2,4,5,5,6], k=4 -> "
                + kthLargest(new int[]{3, 2, 3, 1, 2, 4, 5, 5, 6}, 4));
        Random r = new Random(10); boolean ok = true;
        for (int t = 0; t < 500; t++) {
            int[] x = new int[1 + r.nextInt(40)];
            for (int i = 0; i < x.length; i++) x[i] = r.nextInt(50) - 25;
            int k = 1 + r.nextInt(x.length);
            int[] s = x.clone(); Arrays.sort(s);
            ok &= kthLargest(x, k) == s[s.length - k];
        }
        System.out.println("500 random tests agree with sorting: " + ok);
    }
}
```

Time O(n log k), space O(k). Duplicates count separately (the 4th largest of `[…, 5, 5, 6]` is 4). Quickselect (guide Section 3.4) is O(n) on average but changes the array and has an O(n<sup>2</sup>) worst case; the heap also works on a stream.

### S7.2 Task scheduler

```java run Formula and heap simulation agree
import java.util.*;

public class Main {
    static int formula(String tasks, int n) {
        int[] cnt = new int[26];
        for (char c : tasks.toCharArray()) cnt[c - 'A']++;
        int f = Arrays.stream(cnt).max().getAsInt();
        int m = (int) Arrays.stream(cnt).filter(c -> c == f).count();
        return Math.max(tasks.length(), (f - 1) * (n + 1) + m);
    }
    static int simulate(String tasks, int n) {
        int[] cnt = new int[26];
        for (char c : tasks.toCharArray()) cnt[c - 'A']++;
        PriorityQueue<Integer> ready = new PriorityQueue<>(Collections.reverseOrder());
        for (int c : cnt) if (c > 0) ready.offer(c);
        Deque<int[]> cooling = new ArrayDeque<>();           // {remaining, time available}
        int time = 0;
        while (!ready.isEmpty() || !cooling.isEmpty()) {
            time++;
            if (!ready.isEmpty()) {
                int left = ready.poll() - 1;                 // run the most frequent task
                if (left > 0) cooling.offer(new int[]{left, time + n});
            }
            if (!cooling.isEmpty() && cooling.peek()[1] == time)
                ready.offer(cooling.poll()[0]);           // cooled down: ready again
        }
        return time;
    }
    public static void main(String[] args) {
        String[][] tests = {{"AAABBB", "2"}, {"AAABBB", "0"}, {"AAAAAABCDEFG", "2"},
                            {"AABBCCDD", "1"}};
        for (String[] t : tests) {
            int n = Integer.parseInt(t[1]);
            System.out.println(t[0] + " n=" + n + " -> formula " + formula(t[0], n)
                    + ", simulation " + simulate(t[0], n));
        }
        Random r = new Random(12); boolean ok = true;
        for (int t = 0; t < 300; t++) {
            StringBuilder sb = new StringBuilder();
            for (int i = 1 + r.nextInt(20); i > 0; i--)
                sb.append((char) ('A' + r.nextInt(5)));
            int n = r.nextInt(4);
            ok &= formula(sb.toString(), n) == simulate(sb.toString(), n);
        }
        System.out.println("300 random cases agree: " + ok);
    }
}
```

The most frequent task (count *f*) forces *f* − 1 full frames of *n* + 1 slots, plus a final frame containing every task that also has count *f*. If there are enough other tasks to fill all the idle slots, no idling is needed and the answer is just the number of tasks; hence the `max`.

### S7.3 Reorganise a string

```java run Greedy with a max-heap and a held-back character
import java.util.*;

public class Main {
    static String reorganise(String s) {
        int[] cnt = new int[26];
        for (char c : s.toCharArray()) cnt[c - 'a']++;
        PriorityQueue<int[]> pq = new PriorityQueue<>((x, y) -> x[1] != y[1]
                ? Integer.compare(y[1], x[1]) : Integer.compare(x[0], y[0]));
        for (int i = 0; i < 26; i++) if (cnt[i] > 0) pq.offer(new int[]{i, cnt[i]});
        StringBuilder sb = new StringBuilder();
        int[] held = null;                                 // the char just used
        while (!pq.isEmpty()) {
            int[] top = pq.poll();
            sb.append((char) ('a' + top[0]));
            top[1]--;
            if (held != null && held[1] > 0) pq.offer(held);
            held = top;
        }
        return sb.length() == s.length() ? sb.toString() : "";
    }
    public static void main(String[] args) {
        for (String s : new String[]{"aab", "aaab", "aaabbc", "vvvlo", "a"})
            System.out.println("'" + s + "' -> '" + reorganise(s) + "'");
    }
}
```

The character just placed is held out of the heap for one step, so the next pick is always different. It is impossible exactly when one character occurs more than ⌈n / 2⌉ times; the program detects this when the heap empties while a character is still held.

### S7.4 A constant hash code

**Correct, but slow.** The `equals`/`hashCode` contract only requires equal objects to have equal hash codes, and a constant satisfies it. But every key lands in the same bucket, so the map degenerates into one long chain: each operation compares the key with many others. Since Java 8, a large bucket becomes a red–black tree, but that only helps when keys are `Comparable`; otherwise it searches linearly.

```java run Counting equals calls with a constant and a good hash
import java.util.*;

public class Main {
    static long equalsCalls = 0;
    static class Key {
        final int id; final boolean constantHash;
        Key(int id, boolean c) { this.id = id; this.constantHash = c; }
        @Override public boolean equals(Object o) {
            equalsCalls++;
            return o instanceof Key k && k.id == id;
        }
        @Override public int hashCode() { return constantHash ? 1 : Integer.hashCode(id); }
    }
    static long run(boolean constant, int n) {
        equalsCalls = 0;
        Map<Key, Integer> m = new HashMap<>();
        for (int i = 0; i < n; i++) m.put(new Key(i, constant), i);
        for (int i = 0; i < n; i++) m.get(new Key(i, constant));
        return equalsCalls;
    }
    public static void main(String[] args) {
        // the exact constant-hash count varies slightly between runs (tree bins break ties
        // by identity hash), so print it rounded
        System.out.printf("constant hash: about %.1f million equals calls%n",
                run(true, 2000) / 1e6);
        System.out.printf("good hash:     %,d equals calls%n", run(false, 2000));
    }
}
```

Both runs make 2 000 puts and 2 000 gets. With a constant hash they need about 4 million `equals` calls (quadratic: each operation scans a long chain). With a good hash there are exactly 2 000, one per successful `get`: each new key finds its own bucket empty, and each lookup compares with just the matching key. Correctness survives; the O(1) promise does not.
