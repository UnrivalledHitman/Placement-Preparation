# Chapter 7: Heaps and Hash Tables
%Priority queues for top-k, merging and running medians, and what happens inside a hash map

## 7.1 The binary heap

A **binary heap** is a complete binary tree stored in an array: the children of index `i` are `2i + 1` and `2i + 2`, the parent is `(i - 1) / 2`. In a min-heap every parent is ≤ its children, so the minimum sits at index 0. Insertion appends at the end and **sifts up**; removal moves the last element to the root and **sifts down**. Both are O(log n). Building a heap from *n* elements by sifting down from the middle is O(n), not O(n log n), because most nodes are near the bottom and move only a little.

```java run A min-heap from scratch, checked against PriorityQueue
import java.util.*;

public class Main {
    static class MinHeap {
        private int[] a = new int[16];
        private int n = 0;
        void push(int x) {
            if (n == a.length) a = Arrays.copyOf(a, 2 * n);
            a[n] = x;
            for (int i = n++; i > 0 && a[(i - 1) / 2] > a[i]; i = (i - 1) / 2)
                swap(i, (i - 1) / 2);                      // sift up
        }
        int pop() {
            int top = a[0];
            a[0] = a[--n];
            for (int i = 0; ; ) {                          // sift down
                int l = 2 * i + 1, r = l + 1, m = i;
                if (l < n && a[l] < a[m]) m = l;
                if (r < n && a[r] < a[m]) m = r;
                if (m == i) break;
                swap(i, m); i = m;
            }
            return top;
        }
        boolean isEmpty() { return n == 0; }
        private void swap(int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }
    }
    public static void main(String[] args) {
        Random r = new Random(3);
        MinHeap h = new MinHeap(); PriorityQueue<Integer> pq = new PriorityQueue<>();
        boolean same = true;
        for (int step = 0; step < 10_000; step++) {
            if (pq.isEmpty() || r.nextInt(3) > 0) {
                int x = r.nextInt(1000);
                h.push(x); pq.offer(x);
            } else same &= h.pop() == pq.poll();
        }
        System.out.println("10,000 random operations match PriorityQueue: " + same);
        MinHeap s = new MinHeap();
        for (int x : new int[]{9, 4, 7, 1, 8, 2}) s.push(x);
        StringBuilder sb = new StringBuilder();
        while (!s.isEmpty()) sb.append(s.pop()).append(' ');
        System.out.println("heap sort order: " + sb.toString().trim());
    }
}
```

## 7.2 Top-k with a heap of size k

To find the *k* largest of *n* items, keep a **min-heap of size k**: its root is the smallest of the current top *k*, so any new item larger than the root replaces it. The cost is O(n log k) time and O(k) space, which works on streams too large to sort. The rule to remember is counter-intuitive: **largest → min-heap, smallest → max-heap**.

```java run Top k frequent words, and the k closest points
import java.util.*;

public class Main {
    static List<String> topKFrequent(String[] words, int k) {
        Map<String, Integer> cnt = new HashMap<>();
        for (String w : words) cnt.merge(w, 1, Integer::sum);
        // heap root = the "worst" of the kept k: lowest count, then alphabetically last
        PriorityQueue<String> heap = new PriorityQueue<>((a, b) ->
                !cnt.get(a).equals(cnt.get(b)) ? Integer.compare(cnt.get(a), cnt.get(b))
                        : b.compareTo(a));
        for (String w : cnt.keySet()) {
            heap.offer(w);
            if (heap.size() > k) heap.poll();
        }
        LinkedList<String> out = new LinkedList<>();
        while (!heap.isEmpty()) out.addFirst(heap.poll());
        return out;
    }
    static List<int[]> kClosest(int[][] pts, int k) {
        PriorityQueue<int[]> maxHeap = new PriorityQueue<>((p, q) ->
                Long.compare(dist(q), dist(p)));             // farthest on top
        for (int[] p : pts) {
            maxHeap.offer(p);
            if (maxHeap.size() > k) maxHeap.poll();
        }
        List<int[]> out = new ArrayList<>(maxHeap);
        out.sort(Comparator.comparingLong(Main::dist));
        return out;
    }
    static long dist(int[] p) { return (long) p[0] * p[0] + (long) p[1] * p[1]; }
    public static void main(String[] args) {
        String[] w = "the day is sunny the the the sunny is is a day".split(" ");
        System.out.println("top 3 words " + topKFrequent(w, 3));
        int[][] pts = {{3, 3}, {5, -1}, {-2, 4}, {1, 1}, {0, -2}};
        StringBuilder sb = new StringBuilder();
        for (int[] p : kClosest(pts, 3)) sb.append(Arrays.toString(p)).append(' ');
        System.out.println("3 closest to origin " + sb.toString().trim());
    }
}
```

> TIP: When ties need a deterministic order (equal counts sorted alphabetically), put the tie-break in the comparator. Interviewers check it, and online judges compare your exact output.

## 7.3 Merging sorted sequences

A heap holding the **current head of each sorted list** merges *k* lists of total length *N* in O(N log k). The same pattern solves "smallest range covering one element from each list" and the *k*th smallest in a sorted matrix.

```java run Merge k sorted arrays with a heap of cursors
import java.util.*;

public class Main {
    public static void main(String[] args) {
        int[][] lists = {{1, 4, 7, 10}, {2, 5, 8}, {0, 3, 6, 9, 12}};
        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(c -> c[0]));
        for (int i = 0; i < lists.length; i++)
            if (lists[i].length > 0) pq.offer(new int[]{lists[i][0], i, 0}); // val, list, i
        List<Integer> out = new ArrayList<>();
        while (!pq.isEmpty()) {
            int[] c = pq.poll();
            out.add(c[0]);
            int next = c[2] + 1;
            if (next < lists[c[1]].length) pq.offer(new int[]{lists[c[1]][next], c[1], next});
        }
        System.out.println("merged " + out);
    }
}
```

## 7.4 Two heaps: the running median

Keep the smaller half of the numbers in a **max-heap** and the larger half in a **min-heap**, with sizes equal or the lower half one larger. The median is the top of the lower heap, or the average of both tops. Each insertion costs O(log n), and the median is O(1).

```java run Median of a stream with two heaps
import java.util.*;

public class Main {
    static PriorityQueue<Integer> low = new PriorityQueue<>(Collections.reverseOrder());
    static PriorityQueue<Integer> high = new PriorityQueue<>();
    static void add(int x) {
        low.offer(x);
        high.offer(low.poll());                    // largest of the low half moves up
        if (high.size() > low.size()) low.offer(high.poll());   // rebalance
    }
    static double median() {
        if (low.size() > high.size()) return low.peek();
        return (low.peek() + (double) high.peek()) / 2;
    }
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder();
        for (int x : new int[]{5, 15, 1, 3, 8, 7, 9, 10}) {
            add(x);
            sb.append(x).append("->").append(median()).append("  ");
        }
        System.out.println(sb.toString().trim());
    }
}
```

## 7.5 Inside a hash map

`HashMap` stores entries in an array of **buckets**. The bucket is chosen from the key's `hashCode()` (Java mixes the high bits in, then masks by the table size, which is a power of two). Keys in the same bucket form a linked list, converted to a balanced tree when a bucket grows beyond 8 entries. When the number of entries exceeds **capacity × load factor** (0.75 by default), the table doubles and every entry is redistributed.

The contract that makes it work: **equal objects must have equal hash codes**. If you override `equals` without `hashCode`, two equal keys land in different buckets and lookups fail.

```java run Why equals and hashCode must agree, and why keys must not mutate
import java.util.*;

public class Main {
    static class BadPoint {                          // equals without hashCode
        final int x, y;
        BadPoint(int x, int y) { this.x = x; this.y = y; }
        @Override public boolean equals(Object o) {
            return o instanceof BadPoint p && p.x == x && p.y == y;
        }
    }
    record Point(int x, int y) {}                    // records generate both correctly
    static class MutableKey {
        int id;
        MutableKey(int id) { this.id = id; }
        @Override public boolean equals(Object o) {
            return o instanceof MutableKey m && m.id == id;
        }
        @Override public int hashCode() { return Integer.hashCode(id); }
    }
    public static void main(String[] args) {
        Set<BadPoint> bad = new HashSet<>();
        bad.add(new BadPoint(1, 2));
        System.out.println("BadPoint found? " + bad.contains(new BadPoint(1, 2)));
        Set<Point> good = new HashSet<>();
        good.add(new Point(1, 2));
        System.out.println("record Point found? " + good.contains(new Point(1, 2)));

        Map<MutableKey, String> m = new HashMap<>();
        MutableKey k = new MutableKey(7);
        m.put(k, "seven");
        k.id = 8;                                    // mutate the key after insertion
        System.out.println("after mutation: get(new 8)=" + m.get(new MutableKey(8))
                + ", get(new 7)=" + m.get(new MutableKey(7)) + ", size=" + m.size());
    }
}
```

The mutated key is stranded: it sits in the bucket for hash 7 but now claims to equal 8, so neither lookup finds it, although the map still counts it. Use immutable keys (strings, records, boxed numbers).

| Operation | Average | Worst case |
|---|---|---|
| `get`, `put`, `remove`, `containsKey` | O(1) | O(log n) per bucket since Java 8 (tree bins), O(n) before |
| Iterate | O(capacity + n) | — |
| Resize | O(n), amortised O(1) per `put` | — |

> TIP: For keys that are pairs of small integers, encode them into one `long` (`(long) r << 32 | c`) or one `int` (`r * cols + c`) instead of creating a `List<Integer>` or a string per key. It is faster and avoids subtle hashing mistakes.

## 7.6 Practical lessons

- *k* largest: min-heap of size *k*; *k* smallest: max-heap of size *k*. O(n log k).
- Merging *k* sorted sources: a heap of cursors `(value, source, index)`.
- Running median: two heaps, lower half as a max-heap, balanced after every insert.
- Hash keys must be immutable and must implement `equals` and `hashCode` together; records do both.

# Chapter 8: Graphs
%Representations, BFS and DFS, grids, topological sort, shortest paths, union–find and minimum spanning trees

## 8.1 Representing a graph

| Representation | Space | Edge check | Iterate neighbours | Use when |
|---|---|---|---|---|
| Adjacency list `List<List<Integer>>` | O(V + E) | O(degree) | O(degree) | Almost always (sparse graphs) |
| Adjacency matrix `boolean[V][V]` | O(V<sup>2</sup>) | O(1) | O(V) | Dense graphs, V ≤ a few thousand, Floyd–Warshall |
| Edge list `int[][] {u, v, w}` | O(E) | O(E) | — | Kruskal, Bellman–Ford |
| Implicit (grid) | O(1) extra | O(1) | 4 or 8 moves | Mazes, islands, flood fill |

Interview inputs are usually an edge list; convert it into an adjacency list first. For an undirected graph, add each edge in **both** directions.

## 8.2 Breadth-first search

BFS visits vertices in order of distance from the source, using a queue. In an **unweighted** graph it gives shortest paths: the first time a vertex is reached is along a shortest path. Mark vertices visited **when they are enqueued**, not when dequeued, or the same vertex enters the queue many times.

```java run BFS shortest paths and path reconstruction
import java.util.*;

public class Main {
    public static void main(String[] args) {
        int n = 8;
        int[][] edges = {{0, 1}, {0, 2}, {1, 3}, {2, 3}, {3, 4}, {4, 5}, {2, 6}, {6, 5}};
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); }

        int[] dist = new int[n], parent = new int[n];
        Arrays.fill(dist, -1); Arrays.fill(parent, -1);
        Deque<Integer> q = new ArrayDeque<>();
        dist[0] = 0; q.offer(0);
        while (!q.isEmpty()) {
            int u = q.poll();
            for (int v : adj.get(u))
                if (dist[v] == -1) { dist[v] = dist[u] + 1; parent[v] = u; q.offer(v); }
        }
        System.out.println("distances from 0: " + Arrays.toString(dist));
        LinkedList<Integer> path = new LinkedList<>();
        for (int v = 5; v != -1; v = parent[v]) path.addFirst(v);
        System.out.println("a shortest path 0 -> 5: " + path);
        System.out.println("vertex 7 reachable? " + (dist[7] != -1));
    }
}
```

### Grids and multi-source BFS

A grid is a graph whose vertices are cells and whose edges are the four moves. **Multi-source BFS** starts with *all* sources in the queue at distance 0; it computes the distance from every cell to its nearest source in one pass. "Rotting oranges", "walls and gates" and "distance to the nearest 0" are all this.

```java run Rotting oranges with multi-source BFS
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // 2 = rotten, 1 = fresh, 0 = empty
        int[][] g = {{2, 1, 1, 0}, {1, 1, 0, 0}, {0, 1, 1, 1}, {0, 0, 0, 1}};
        int rows = g.length, cols = g[0].length, fresh = 0, minutes = 0;
        Deque<int[]> q = new ArrayDeque<>();
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++) {
                if (g[r][c] == 2) q.offer(new int[]{r, c});
                else if (g[r][c] == 1) fresh++;
            }
        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        while (!q.isEmpty() && fresh > 0) {
            for (int k = q.size(); k > 0; k--) {           // one minute = one BFS level
                int[] cell = q.poll();
                for (int[] d : dirs) {
                    int r = cell[0] + d[0], c = cell[1] + d[1];
                    if (r < 0 || c < 0 || r >= rows || c >= cols || g[r][c] != 1) continue;
                    g[r][c] = 2; fresh--; q.offer(new int[]{r, c});
                }
            }
            minutes++;
        }
        System.out.println(fresh == 0 ? "all rotten after " + minutes + " minutes"
                : fresh + " oranges can never rot");
    }
}
```

## 8.3 Depth-first search, components and cycles

DFS goes as deep as possible before backtracking. It counts connected components, detects cycles, and underlies topological sort. In an **undirected** graph, a cycle exists if DFS reaches a visited vertex that is not its parent. In a **directed** graph, colour vertices white (unvisited), grey (on the current path) and black (finished): an edge to a grey vertex is a cycle.

```java run Islands, components with an iterative DFS, and directed cycle detection
import java.util.*;

public class Main {
    static int islands(char[][] g) {
        int count = 0;
        for (int r = 0; r < g.length; r++)
            for (int c = 0; c < g[0].length; c++)
                if (g[r][c] == '1') { count++; sink(g, r, c); }
        return count;
    }
    static void sink(char[][] g, int r, int c) {         // iterative: no stack overflow
        Deque<int[]> st = new ArrayDeque<>();
        st.push(new int[]{r, c}); g[r][c] = '0';
        while (!st.isEmpty()) {
            int[] p = st.pop();
            int[][] next = {{p[0] + 1, p[1]}, {p[0] - 1, p[1]},
                            {p[0], p[1] + 1}, {p[0], p[1] - 1}};
            for (int[] q : next)
                if (q[0] >= 0 && q[1] >= 0 && q[0] < g.length && q[1] < g[0].length
                        && g[q[0]][q[1]] == '1') { g[q[0]][q[1]] = '0'; st.push(q); }
        }
    }
    static boolean hasCycle(int u, List<List<Integer>> adj, int[] color) {
        color[u] = 1;                                       // grey: on the current path
        for (int v : adj.get(u)) {
            if (color[v] == 1) return true;                 // back edge
            if (color[v] == 0 && hasCycle(v, adj, color)) return true;
        }
        color[u] = 2;                                       // black: finished
        return false;
    }
    static boolean directedCycle(int n, int[][] edges) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) adj.get(e[0]).add(e[1]);
        int[] color = new int[n];
        for (int u = 0; u < n; u++) if (color[u] == 0 && hasCycle(u, adj, color)) return true;
        return false;
    }
    public static void main(String[] args) {
        char[][] g = {"11000".toCharArray(), "11000".toCharArray(),
                      "00100".toCharArray(), "00011".toCharArray()};
        System.out.println("islands " + islands(g));
        System.out.println("0->1->2->0 cycle? "
                + directedCycle(3, new int[][]{{0, 1}, {1, 2}, {2, 0}}));
        System.out.println("0->1, 0->2, 1->2 cycle? "
                + directedCycle(3, new int[][]{{0, 1}, {0, 2}, {1, 2}}));
    }
}
```

> TRAP: In a directed graph, "reached an already visited vertex" does **not** mean a cycle: in `0→1, 0→2, 1→2`, vertex 2 is reached twice, but there is no cycle. Only an edge back to a vertex that is still on the current DFS path (grey) closes a cycle.

## 8.4 Topological sort

A **topological order** of a directed acyclic graph (DAG) lists every vertex before all vertices it points to: courses before the courses that require them, build steps before dependent steps. **Kahn's algorithm** repeatedly removes vertices with in-degree 0. If some vertices are never removed, the graph has a cycle and no order exists, which is how "Course Schedule" is solved.

```java run Kahn's algorithm for course scheduling
import java.util.*;

public class Main {
    static List<Integer> order(int n, int[][] prereq) {   // {course, needs}
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        int[] indeg = new int[n];
        for (int[] p : prereq) { adj.get(p[1]).add(p[0]); indeg[p[0]]++; }
        PriorityQueue<Integer> ready = new PriorityQueue<>();   // smallest id first: stable
        for (int i = 0; i < n; i++) if (indeg[i] == 0) ready.offer(i);
        List<Integer> out = new ArrayList<>();
        while (!ready.isEmpty()) {
            int u = ready.poll();
            out.add(u);
            for (int v : adj.get(u)) if (--indeg[v] == 0) ready.offer(v);
        }
        return out.size() == n ? out : null;                    // null: cycle
    }
    public static void main(String[] args) {
        int[][] pre = {{1, 0}, {2, 0}, {3, 1}, {3, 2}, {4, 3}, {5, 2}};
        System.out.println("order " + order(6, pre));
        System.out.println("with a cycle " + order(3, new int[][]{{0, 1}, {1, 2}, {2, 0}}));
    }
}
```

> NOTE: A plain queue gives a valid order too. The priority queue here returns the lexicographically smallest order, which some problems require and which makes the output deterministic.

## 8.5 Shortest paths with weights

| Algorithm | Graph | Time | Idea |
|---|---|---|---|
| BFS | Unweighted | O(V + E) | Levels are distances |
| 0–1 BFS | Weights 0 or 1 | O(V + E) | Deque: weight-0 edges to the front, weight-1 to the back |
| Dijkstra | Non-negative weights | O((V + E) log V) | Always settle the closest unsettled vertex (min-heap) |
| Bellman–Ford | Any weights, detects negative cycles | O(VE) | Relax all edges V − 1 times |
| Floyd–Warshall | All pairs, V ≤ ~400 | O(V<sup>3</sup>) | Allow intermediate vertex *k* = 0, 1, … in turn |

**Dijkstra** keeps a min-heap of `(distance, vertex)`. Java's `PriorityQueue` has no decrease-key, so push a new entry whenever a distance improves and **skip stale entries** when they are popped.

```java run Dijkstra with lazy deletion, then a negative edge
import java.util.*;

public class Main {
    static long[] dijkstra(int n, int[][] edges, int src) {   // directed {u, v, w}
        List<List<int[]>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) adj.get(e[0]).add(new int[]{e[1], e[2]});
        long[] dist = new long[n];
        Arrays.fill(dist, Long.MAX_VALUE);
        dist[src] = 0;
        PriorityQueue<long[]> pq = new PriorityQueue<>(Comparator.comparingLong(x -> x[0]));
        pq.offer(new long[]{0, src});
        while (!pq.isEmpty()) {
            long[] top = pq.poll();
            int u = (int) top[1];
            if (top[0] > dist[u]) continue;                   // stale entry
            for (int[] e : adj.get(u)) {
                long nd = dist[u] + e[1];
                if (nd < dist[e[0]]) { dist[e[0]] = nd; pq.offer(new long[]{nd, e[0]}); }
            }
        }
        return dist;
    }
    static long[] bellmanFord(int n, int[][] edges, int src) {
        long[] d = new long[n];
        Arrays.fill(d, Long.MAX_VALUE);
        d[src] = 0;
        for (int round = 0; round < n - 1; round++)
            for (int[] e : edges)
                if (d[e[0]] != Long.MAX_VALUE && d[e[0]] + e[2] < d[e[1]])
                    d[e[1]] = d[e[0]] + e[2];
        return d;
    }
    public static void main(String[] args) {
        int[][] g = {{0, 1, 4}, {0, 2, 1}, {2, 1, 2}, {1, 3, 1}, {2, 3, 5}, {3, 4, 3}};
        System.out.println("Dijkstra     " + Arrays.toString(dijkstra(5, g, 0)));
        int[][] neg = {{0, 1, 2}, {0, 2, 5}, {2, 1, -4}, {1, 3, 1}};
        long[] dj = dijkstra(4, neg, 0), bf = bellmanFord(4, neg, 0);
        System.out.println("negative edge, Dijkstra     " + Arrays.toString(dj));
        System.out.println("negative edge, Bellman-Ford " + Arrays.toString(bf));
    }
}
```

With the negative edge, this version of Dijkstra still produces the right distances because it re-pushes improved vertices (it degrades into a slower label-correcting search). The textbook version, which never revisits a settled vertex, would have fixed vertex 1 at distance 2 and 3 at distance 3 before discovering the cheaper route through vertex 2. Either way, with negative weights you lose Dijkstra's O((V + E) log V) guarantee: use **Bellman–Ford**, which also detects negative cycles with one extra round (any edge that still relaxes).

## 8.6 Union–find (disjoint set union)

Union–find maintains a partition of elements into sets with two operations: `find(x)` returns the set's representative, and `union(a, b)` merges two sets. With **path compression** and **union by size**, both run in effectively constant amortised time. Use it for connectivity that changes over time, cycle detection in undirected graphs, and Kruskal's MST.

```java run Union-find with path compression, and Kruskal's MST
import java.util.*;

public class Main {
    static int[] parent, size;
    static int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }  // halving
        return x;
    }
    static boolean union(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return false;                      // already connected: cycle edge
        if (size[ra] < size[rb]) { int t = ra; ra = rb; rb = t; }
        parent[rb] = ra; size[ra] += size[rb];
        return true;
    }
    static void init(int n) {
        parent = new int[n]; size = new int[n];
        for (int i = 0; i < n; i++) { parent[i] = i; size[i] = 1; }
    }
    public static void main(String[] args) {
        init(6);
        union(0, 1); union(1, 2); union(3, 4);
        int components = 0;
        for (int i = 0; i < 6; i++) if (find(i) == i) components++;
        System.out.println("components " + components + ", 0~2? " + (find(0) == find(2))
                + ", 2~3? " + (find(2) == find(3)));

        int[][] edges = {{0, 1, 7}, {0, 3, 5}, {1, 2, 8}, {1, 3, 9}, {1, 4, 7},
                         {2, 4, 5}, {3, 4, 15}, {3, 5, 6}, {4, 5, 8}, {4, 6, 9}, {5, 6, 11}};
        Arrays.sort(edges, Comparator.comparingInt(e -> e[2]));
        init(7);
        int total = 0; List<String> used = new ArrayList<>();
        for (int[] e : edges)
            if (union(e[0], e[1])) { total += e[2]; used.add(e[0] + "-" + e[1]); }
        System.out.println("MST weight " + total + " using " + used);
    }
}
```

**Kruskal** sorts edges by weight and adds each edge that joins two different components; union–find answers "different components?" quickly. **Prim** grows one tree from a start vertex with a min-heap of crossing edges and suits dense graphs or adjacency-list input. Both give the same total weight.

## 8.7 Choosing the graph algorithm

| The question asks for | Use |
|---|---|
| Shortest path, unweighted or grid | BFS (multi-source if several starts) |
| Shortest path, non-negative weights | Dijkstra |
| Shortest path with negative weights or "at most k edges" | Bellman–Ford (k rounds for "at most k") |
| Order of tasks with dependencies; "can all courses be finished?" | Topological sort (Kahn) |
| Number of connected regions | DFS/BFS flood fill, or union–find |
| Dynamic connectivity, "redundant connection" | Union–find |
| Cheapest way to connect everything | MST (Kruskal or Prim) |
| Is the graph bipartite / two-colourable? | BFS colouring; an edge between same colours means no |
| Cycle in a directed graph | DFS with three colours, or Kahn leaving vertices unremoved |

## 8.8 Practical lessons

- Convert the input into an adjacency list first; add both directions for undirected edges.
- BFS: mark visited when enqueueing. Process level by level with a frozen `q.size()` when you need the level number.
- Directed cycles need grey/black states; undirected cycles need the parent check or union–find.
- Dijkstra with `PriorityQueue`: push duplicates and skip stale entries. Never use it with negative weights.
- Use iterative DFS or BFS on large graphs to avoid stack overflow.
