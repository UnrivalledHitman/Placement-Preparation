# Chapter 5: Recursion and Backtracking
%Trusting the recursive call, the choose–explore–unchoose template, and pruning that turns exponential into feasible

## 5.1 Thinking recursively

A recursive solution has three parts: a **base case** that needs no further calls, a **recursive case** that reduces the problem, and the **leap of faith**: assume the call on the smaller input already returns the right answer, and only write the step that combines it. Do not trace every level in your head; trace one level and the base case.

```java run Recursion: power, a recursion tree, and memoisation
import java.util.*;

public class Main {
    static long calls = 0;
    static long power(long x, int n) {              // O(log n): halve the exponent
        if (n == 0) return 1;
        long half = power(x, n / 2);
        return n % 2 == 0 ? half * half : half * half * x;
    }
    static long fibNaive(int n) {
        calls++;
        return n < 2 ? n : fibNaive(n - 1) + fibNaive(n - 2);
    }
    static long fibMemo(int n, long[] memo) {
        calls++;
        if (n < 2) return n;
        if (memo[n] != 0) return memo[n];
        return memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
    }
    public static void main(String[] args) {
        System.out.println("3^13 = " + power(3, 13) + ", 2^62 = " + power(2, 62));
        for (int n : new int[]{10, 20, 30}) {
            calls = 0; long a = fibNaive(n); long naive = calls;
            calls = 0; long b = fibMemo(n, new long[n + 1]);
            System.out.printf("fib(%d)=%d naive calls=%,d memo calls=%d%n",
                    n, a, naive, calls);
        }
    }
}
```

Naive Fibonacci's call count grows by a factor of about 1.6 each time *n* increases by one (2.7 million calls for n = 30) because it solves the same subproblems again and again. Storing each answer the first time (**memoisation**) makes it linear. That observation is the entry point to dynamic programming (Chapter 9).

> TRAP: Check what your recursion does outside the intended input range. `power(3, -1)` does not crash: Java's `-1 / 2` is `0` (division rounds towards zero), so it returns `3` instead of 1/3, silently. Validate the input or handle negative exponents explicitly.

## 5.2 The backtracking template

Backtracking explores a tree of choices. At each node you **choose** an option, **explore** recursively, then **unchoose** it to restore the state before trying the next option. Collecting a copy of the current path at the right moment produces subsets, permutations or combinations.

```text
void backtrack(state, path):
    if path is a complete answer: record a COPY of path; return
    for each choice available in this state:
        if the choice is invalid: continue        // pruning
        apply choice to path/state                 // choose
        backtrack(next state, path)                // explore
        undo choice                                // unchoose
```

| Problem | Choices at each level | Record when | Count of answers |
|---|---|---|---|
| Subsets | Include or skip element *i* (or: pick the next index ≥ start) | Every node | 2<sup>n</sup> |
| Permutations | Any unused element | Path length = n | n! |
| Combinations C(n, k) | Next index ≥ start | Path length = k | C(n, k) |
| Combination sum | Same or later index (reuse allowed) | Remaining target = 0 | Varies |
| N-Queens | A safe column in this row | Row = n | 92 for n = 8 |

```java run Subsets, permutations and combination sum
import java.util.*;

public class Main {
    static void subsets(int[] a, int start, Deque<Integer> path, List<List<Integer>> out) {
        out.add(new ArrayList<>(path));                // every node is a subset
        for (int i = start; i < a.length; i++) {
            path.addLast(a[i]);
            subsets(a, i + 1, path, out);
            path.removeLast();
        }
    }
    static void permute(int[] a, boolean[] used, Deque<Integer> path,
                        List<List<Integer>> out) {
        if (path.size() == a.length) { out.add(new ArrayList<>(path)); return; }
        for (int i = 0; i < a.length; i++) {
            if (used[i]) continue;
            used[i] = true; path.addLast(a[i]);
            permute(a, used, path, out);
            used[i] = false; path.removeLast();
        }
    }
    static void combSum(int[] c, int start, int left, Deque<Integer> path,
                        List<List<Integer>> out) {
        if (left == 0) { out.add(new ArrayList<>(path)); return; }
        for (int i = start; i < c.length && c[i] <= left; i++) {   // sorted: prune
            path.addLast(c[i]);
            combSum(c, i, left - c[i], path, out);                 // i: reuse allowed
            path.removeLast();
        }
    }
    public static void main(String[] args) {
        List<List<Integer>> s = new ArrayList<>();
        subsets(new int[]{1, 2, 3}, 0, new ArrayDeque<>(), s);
        System.out.println("subsets " + s);
        List<List<Integer>> p = new ArrayList<>();
        permute(new int[]{1, 2, 3}, new boolean[3], new ArrayDeque<>(), p);
        System.out.println("permutations " + p);
        int[] cand = {2, 3, 6, 7};
        Arrays.sort(cand);
        List<List<Integer>> cs = new ArrayList<>();
        combSum(cand, 0, 7, new ArrayDeque<>(), cs);
        System.out.println("combination sum to 7 " + cs);
    }
}
```

> TRAP: `out.add(path)` without copying adds the **same** list object every time; after backtracking finishes it is empty, so the output is a list of empty lists. Always add `new ArrayList<>(path)`.

### Handling duplicates

With duplicate input values (`[1, 2, 2]`), sort first and skip a value equal to its left neighbour **at the same level of the tree**: `if (i > start && a[i] == a[i-1]) continue;`. The condition `i > start` still allows using the second 2 deeper in the same branch, so `[1, 2, 2]` itself is produced once.

```java run Subsets with duplicates, without a set
import java.util.*;

public class Main {
    static void go(int[] a, int start, Deque<Integer> path, List<List<Integer>> out) {
        out.add(new ArrayList<>(path));
        for (int i = start; i < a.length; i++) {
            if (i > start && a[i] == a[i - 1]) continue;     // same value, same level
            path.addLast(a[i]);
            go(a, i + 1, path, out);
            path.removeLast();
        }
    }
    public static void main(String[] args) {
        int[] a = {2, 1, 2};
        Arrays.sort(a);
        List<List<Integer>> out = new ArrayList<>();
        go(a, 0, new ArrayDeque<>(), out);
        System.out.println(out.size() + " unique subsets " + out);
    }
}
```

## 5.3 Pruning: N-Queens

Pruning is what makes backtracking practical: reject a partial solution as soon as it cannot lead to an answer. In N-Queens, place one queen per row and keep three boolean arrays for the occupied columns and the two diagonal directions (`row + col` and `row - col` are constant along each diagonal), so each safety check is O(1).

```java run N-Queens with O(1) safety checks and a node count
public class Main {
    static int solutions, nodes;
    static void place(int row, int n, boolean[] col, boolean[] d1, boolean[] d2) {
        nodes++;
        if (row == n) { solutions++; return; }
        for (int c = 0; c < n; c++) {
            if (col[c] || d1[row + c] || d2[row - c + n - 1]) continue;   // prune
            col[c] = d1[row + c] = d2[row - c + n - 1] = true;
            place(row + 1, n, col, d1, d2);
            col[c] = d1[row + c] = d2[row - c + n - 1] = false;
        }
    }
    public static void main(String[] args) {
        for (int n = 4; n <= 10; n++) {
            solutions = 0; nodes = 0;
            place(0, n, new boolean[n], new boolean[2 * n - 1], new boolean[2 * n - 1]);
            double all = Math.pow(n, n);
            System.out.printf("n=%2d solutions=%4d nodes visited=%,9d of n^n=%,.0f%n",
                    n, solutions, nodes, all);
        }
    }
}
```

For n = 10 the search visits about 35 000 nodes instead of the 10<sup>10</sup> ways of placing one queen per row: pruning removes all but a tiny fraction of the tree.

## 5.4 Backtracking on a grid

Grid problems (word search, rat in a maze, counting paths with obstacles) use the same template with four moves. Mark a cell visited before exploring and unmark it afterwards so that other paths can use it.

```java run Word search in a grid
public class Main {
    static final int[][] DIRS = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    static boolean exists(char[][] g, String w) {
        for (int r = 0; r < g.length; r++)
            for (int c = 0; c < g[0].length; c++)
                if (dfs(g, w, 0, r, c)) return true;
        return false;
    }
    static boolean dfs(char[][] g, String w, int i, int r, int c) {
        if (i == w.length()) return true;
        if (r < 0 || c < 0 || r >= g.length || c >= g[0].length || g[r][c] != w.charAt(i))
            return false;
        char saved = g[r][c];
        g[r][c] = '#';                                   // mark visited
        for (int[] d : DIRS)
            if (dfs(g, w, i + 1, r + d[0], c + d[1])) { g[r][c] = saved; return true; }
        g[r][c] = saved;                                 // unmark
        return false;
    }
    public static void main(String[] args) {
        char[][] g = {"ABCE".toCharArray(), "SFCS".toCharArray(), "ADEE".toCharArray()};
        for (String w : new String[]{"ABCCED", "SEE", "ABCB"})
            System.out.println(w + " -> " + exists(g, w));
    }
}
```

`ABCB` fails because it would need to reuse the `B` cell; the `#` mark prevents that.

## 5.5 Complexity of recursive algorithms

| Recurrence | Example | Result |
|---|---|---|
| T(n) = T(n/2) + O(1) | Binary search, fast power | O(log n) |
| T(n) = 2T(n/2) + O(n) | Merge sort | O(n log n) |
| T(n) = 2T(n/2) + O(1) | Tree traversal | O(n) |
| T(n) = T(n−1) + O(1) | Linear recursion | O(n) |
| T(n) = 2T(n−1) + O(1) | Subsets, naive Fibonacci (roughly) | O(2<sup>n</sup>) |
| T(n) = n · T(n−1) | Permutations | O(n!) |

For backtracking, estimate **number of answers × cost to build each**: subsets are O(n · 2<sup>n</sup>), permutations O(n · n!). The recursion depth gives the stack space.

## 5.6 Practical lessons

- Write the base case first, trust the recursive call, and combine.
- Backtracking = choose, explore, unchoose. Record a **copy** of the path.
- Sort and skip equal neighbours at the same level to avoid duplicate answers without a set.
- Prune early with O(1) checks (boolean arrays for columns and diagonals).
- If the same subproblem appears twice in the recursion tree, memoise it: it is dynamic programming.

# Chapter 6: Trees and Binary Search Trees
%Traversals recursive and iterative, the "return information upwards" pattern, BST properties, and serialisation

## 6.1 Vocabulary and the node class

A **binary tree** node has at most two children. The **depth** of a node is its distance from the root; the **height** of a tree is the number of nodes (or edges, so check the definition) on the longest root-to-leaf path. A tree is **balanced** if, at every node, the heights of the two subtrees differ by at most one, which keeps the height O(log n).

All programs in this chapter build trees from a level-order array with `null` for missing children, the format LeetCode uses: `[3, 9, 20, null, null, 15, 7]`.

## 6.2 Traversals

| Traversal | Order | Typical use |
|---|---|---|
| Preorder | Node, left, right | Copy or serialise a tree |
| Inorder | Left, node, right | BST in sorted order |
| Postorder | Left, right, node | Delete a tree, compute sizes/heights bottom-up |
| Level order (BFS) | Level by level with a queue | Shortest depth, right-side view, zigzag |

```java run Four traversals, recursive and iterative
import java.util.*;

public class Main {
    static class Node { int val; Node left, right; Node(int v) { val = v; } }
    static Node build(Integer... v) {                       // level-order with nulls
        if (v.length == 0 || v[0] == null) return null;
        Node root = new Node(v[0]);
        Deque<Node> q = new ArrayDeque<>(List.of(root));
        int i = 1;
        while (!q.isEmpty() && i < v.length) {
            Node n = q.poll();
            if (i < v.length && v[i] != null) q.offer(n.left = new Node(v[i])); i++;
            if (i < v.length && v[i] != null) q.offer(n.right = new Node(v[i])); i++;
        }
        return root;
    }
    static void pre(Node n, List<Integer> out) {
        if (n == null) return;
        out.add(n.val); pre(n.left, out); pre(n.right, out);
    }
    static List<Integer> inIterative(Node root) {
        List<Integer> out = new ArrayList<>();
        Deque<Node> st = new ArrayDeque<>();
        Node cur = root;
        while (cur != null || !st.isEmpty()) {
            while (cur != null) { st.push(cur); cur = cur.left; }   // go left all the way
            cur = st.pop();
            out.add(cur.val);
            cur = cur.right;
        }
        return out;
    }
    static List<Integer> postIterative(Node root) {          // reversed (node, right, left)
        LinkedList<Integer> out = new LinkedList<>();
        Deque<Node> st = new ArrayDeque<>();
        if (root != null) st.push(root);
        while (!st.isEmpty()) {
            Node n = st.pop();
            out.addFirst(n.val);
            if (n.left != null) st.push(n.left);
            if (n.right != null) st.push(n.right);
        }
        return out;
    }
    static List<List<Integer>> levels(Node root) {
        List<List<Integer>> out = new ArrayList<>();
        Deque<Node> q = new ArrayDeque<>();
        if (root != null) q.offer(root);
        while (!q.isEmpty()) {
            List<Integer> level = new ArrayList<>();
            for (int k = q.size(); k > 0; k--) {             // freeze the level size
                Node n = q.poll();
                level.add(n.val);
                if (n.left != null) q.offer(n.left);
                if (n.right != null) q.offer(n.right);
            }
            out.add(level);
        }
        return out;
    }
    public static void main(String[] args) {
        Node t = build(1, 2, 3, 4, 5, null, 6, null, null, 7);
        List<Integer> p = new ArrayList<>(); pre(t, p);
        System.out.println("preorder   " + p);
        System.out.println("inorder    " + inIterative(t));
        System.out.println("postorder  " + postIterative(t));
        System.out.println("levels     " + levels(t));
    }
}
```

> TIP: In level-order traversal, read `q.size()` **once** before the inner loop. Using `i < q.size()` as the loop condition fails because children are added during the loop.

## 6.3 Returning information upwards

Most tree problems are solved by a postorder function that returns a small summary of a subtree (its height, its sum, whether it is balanced) and combines the summaries of the two children. When the answer is not the same thing as what you return (the diameter, the maximum path sum), keep it in a field updated at every node.

| Problem | Return value | Global answer updated at each node |
|---|---|---|
| Height | 1 + max(left, right) | — |
| Balanced? | Height, or −1 for "unbalanced" | — |
| Diameter | Height | left height + right height |
| Maximum path sum | Best downward path, at least 0 | node + left gain + right gain |
| Lowest common ancestor | The node found in this subtree (or null) | — |

```java run Height, balance, diameter, maximum path sum and LCA
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
    static int height(Node n) {
        return n == null ? 0 : 1 + Math.max(height(n.left), height(n.right));
    }
    static int balancedHeight(Node n) {                    // -1 means unbalanced
        if (n == null) return 0;
        int l = balancedHeight(n.left), r = balancedHeight(n.right);
        if (l < 0 || r < 0 || Math.abs(l - r) > 1) return -1;
        return 1 + Math.max(l, r);
    }
    static int diameter;
    static int depthForDiameter(Node n) {
        if (n == null) return 0;
        int l = depthForDiameter(n.left), r = depthForDiameter(n.right);
        diameter = Math.max(diameter, l + r);              // edges through n
        return 1 + Math.max(l, r);
    }
    static int bestPath;
    static int gain(Node n) {
        if (n == null) return 0;
        int l = Math.max(0, gain(n.left)), r = Math.max(0, gain(n.right));  // drop negatives
        bestPath = Math.max(bestPath, n.val + l + r);
        return n.val + Math.max(l, r);
    }
    static Node lca(Node n, int a, int b) {
        if (n == null || n.val == a || n.val == b) return n;
        Node l = lca(n.left, a, b), r = lca(n.right, a, b);
        if (l != null && r != null) return n;              // a and b on different sides
        return l != null ? l : r;
    }
    public static void main(String[] args) {
        Node t = build(3, 5, 1, 6, 2, 0, 8, null, null, 7, 4);
        System.out.println("height " + height(t) + ", balanced? " + (balancedHeight(t) >= 0));
        diameter = 0; depthForDiameter(t);
        System.out.println("diameter (edges) " + diameter);
        System.out.println("LCA(5,1)=" + lca(t, 5, 1).val + " LCA(7,4)=" + lca(t, 7, 4).val
                + " LCA(5,4)=" + lca(t, 5, 4).val);
        Node neg = build(-10, 9, 20, null, null, 15, 7);
        bestPath = Integer.MIN_VALUE; gain(neg);
        System.out.println("max path sum " + bestPath + " (15 -> 20 -> 7)");
        Node skew = build(1, 2, null, 3);
        System.out.println("skewed tree balanced? " + (balancedHeight(skew) >= 0));
    }
}
```

> TRAP: In maximum path sum, initialise the answer to `Integer.MIN_VALUE`, not 0: a tree of only negative values has a negative answer. Clamping the **child gains** at 0 is correct (you may skip a negative branch); clamping the answer is not.

## 6.4 Binary search trees

In a **BST**, every key in the left subtree is smaller than the node and every key in the right subtree is larger. Search, insert and delete follow one path, O(h): O(log n) if balanced, O(n) if the tree degenerates into a list (insert sorted keys into a plain BST and you get exactly that). Java's `TreeMap` is a red–black tree, which keeps h = O(log n).

```java run Validate, search and the kth smallest in a BST
import java.util.*;

public class Main {
    static class Node { int val; Node left, right; Node(int v) { val = v; } }
    static Node insert(Node n, int v) {
        if (n == null) return new Node(v);
        if (v < n.val) n.left = insert(n.left, v); else n.right = insert(n.right, v);
        return n;
    }
    static boolean valid(Node n, long lo, long hi) {         // bounds, not just parent
        if (n == null) return true;
        if (n.val <= lo || n.val >= hi) return false;
        return valid(n.left, lo, n.val) && valid(n.right, n.val, hi);
    }
    static boolean naiveValid(Node n) {                     // WRONG: checks children only
        if (n == null) return true;
        if (n.left != null && n.left.val >= n.val) return false;
        if (n.right != null && n.right.val <= n.val) return false;
        return naiveValid(n.left) && naiveValid(n.right);
    }
    static int k, answer;
    static void kth(Node n) {
        if (n == null || k == 0) return;
        kth(n.left);
        if (--k == 0) { answer = n.val; return; }
        kth(n.right);
    }
    static int height(Node n) {
        return n == null ? 0 : 1 + Math.max(height(n.left), height(n.right));
    }
    public static void main(String[] args) {
        Node root = null;
        for (int v : new int[]{50, 30, 70, 20, 40, 60, 80}) root = insert(root, v);
        System.out.println("valid BST? " + valid(root, Long.MIN_VALUE, Long.MAX_VALUE));
        k = 3; kth(root);
        System.out.println("3rd smallest " + answer);

        Node tricky = new Node(10);
        tricky.left = new Node(5); tricky.right = new Node(15);
        tricky.right.left = new Node(6);              // 6 sits in the RIGHT subtree of 10
        System.out.println("tricky: naive check says " + naiveValid(tricky)
                + ", bounds check says " + valid(tricky, Long.MIN_VALUE, Long.MAX_VALUE));

        Node chain = null;
        for (int v = 1; v <= 1000; v++) chain = insert(chain, v);   // sorted inserts
        System.out.println("height after 1000 sorted inserts: " + height(chain));
    }
}
```

> TRAP: Checking only that each child is on the correct side of its parent is the most common wrong answer for "validate BST". Every node must lie within the **range** set by all its ancestors; pass `(lo, hi)` bounds down, using `long` so that `Integer.MIN_VALUE` and `Integer.MAX_VALUE` keys work.

### Deleting from a BST

| Case | Action |
|---|---|
| Leaf | Remove it |
| One child | Replace the node by its child |
| Two children | Copy the **inorder successor** (smallest key in the right subtree) into the node, then delete the successor from the right subtree |

## 6.5 Building and serialising trees

A preorder or postorder sequence alone does not determine a binary tree, but **preorder plus inorder** does: the first preorder value is the root, and its position in the inorder sequence splits the left and right subtrees. A map from value to inorder index makes the construction O(n). For serialisation, preorder **with null markers** is enough on its own.

```java run Build from preorder and inorder, then serialise and parse
import java.util.*;

public class Main {
    static class Node { int val; Node left, right; Node(int v) { val = v; } }
    static int pi;
    static Node build(int[] pre, Map<Integer, Integer> pos, int lo, int hi) {
        if (lo > hi) return null;
        Node n = new Node(pre[pi++]);
        int mid = pos.get(n.val);
        n.left = build(pre, pos, lo, mid - 1);
        n.right = build(pre, pos, mid + 1, hi);
        return n;
    }
    static void ser(Node n, StringBuilder sb) {
        if (n == null) { sb.append("# "); return; }
        sb.append(n.val).append(' ');
        ser(n.left, sb); ser(n.right, sb);
    }
    static Node parse(Iterator<String> it) {
        String t = it.next();
        if (t.equals("#")) return null;
        Node n = new Node(Integer.parseInt(t));
        n.left = parse(it); n.right = parse(it);
        return n;
    }
    public static void main(String[] args) {
        int[] pre = {3, 9, 20, 15, 7}, in = {9, 3, 15, 20, 7};
        Map<Integer, Integer> pos = new HashMap<>();
        for (int i = 0; i < in.length; i++) pos.put(in[i], i);
        pi = 0;
        Node root = build(pre, pos, 0, in.length - 1);
        StringBuilder sb = new StringBuilder(); ser(root, sb);
        String s = sb.toString().trim();
        System.out.println("serialised: " + s);
        Node copy = parse(Arrays.asList(s.split(" ")).iterator());
        StringBuilder sb2 = new StringBuilder(); ser(copy, sb2);
        System.out.println("round trip identical? " + s.equals(sb2.toString().trim()));
    }
}
```

> NOTE: Building from preorder and inorder assumes **distinct** values. With duplicates the inorder position is ambiguous and several trees fit the same pair of sequences.

## 6.6 Practical lessons

- Pick the traversal by when you need the node's own value: before (preorder), between (inorder, BSTs), or after its children (postorder, bottom-up information).
- For "compute something over all paths", return a summary upwards and update a global answer at each node.
- Validate a BST with ranges, not parent comparisons.
- A plain BST built from sorted keys is a linked list; balanced trees (`TreeMap`) guarantee O(log n).
- For deep trees (up to 10<sup>5</sup> nodes in a line), use the iterative traversals to avoid `StackOverflowError`.
