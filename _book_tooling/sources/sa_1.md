# Chapter 3: Binary Search, Sorting and Intervals
%One binary search template that never loops forever, searching on the answer, the sorts worth knowing, and interval problems

## 3.1 One template for every binary search

Most binary search bugs come from mixing templates: `lo <= hi` with `hi = mid`, or `lo < hi` with `lo = mid`. Use **one** template: find the **first index where a monotonic condition becomes true**.

```text
condition:   F  F  F  F  T  T  T  T
index:       0  1  2  3  4  5  6  7          answer = 4 (the first T)

lo = 0, hi = n            // hi = n means "no index is true"
while (lo < hi):
    mid = lo + (hi - lo) / 2
    if condition(mid): hi = mid        // mid might be the answer; keep it
    else:              lo = mid + 1    // mid is false; discard it
return lo                              // in [0, n]
```

The loop always shrinks the range because `mid < hi`, so it cannot loop forever. Every classic search is this template with a different condition.

| Question | Condition `cond(i)` | Answer |
|---|---|---|
| Lower bound: first index with `a[i] >= x` | `a[i] >= x` | `lo` |
| Upper bound: first index with `a[i] > x` | `a[i] > x` | `lo` |
| Is `x` present? | lower bound | `lo < n && a[lo] == x` |
| Count of `x` | — | upper bound − lower bound |
| Last index with `a[i] <= x` | upper bound | `lo - 1` |
| Insert position | lower bound | `lo` |

```java run Lower and upper bound with one template
import java.util.*;

public class Main {
    static int firstTrue(int lo, int hi, java.util.function.IntPredicate cond) {
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (cond.test(mid)) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
    public static void main(String[] args) {
        int[] a = {1, 3, 3, 3, 5, 8, 8, 13};
        for (int x : new int[]{3, 4, 8, 0, 20}) {
            int lower = firstTrue(0, a.length, i -> a[i] >= x);
            int upper = firstTrue(0, a.length, i -> a[i] > x);
            System.out.printf("x=%2d lower=%d upper=%d count=%d present=%b%n",
                    x, lower, upper, upper - lower, lower < a.length && a[lower] == x);
        }
        System.out.println("Arrays.binarySearch for 4 returns "
                + Arrays.binarySearch(a, 4) + " = -(insertion point) - 1");
    }
}
```

> TRAP: `Arrays.binarySearch` returns **some** index of `x` when there are duplicates, not necessarily the first. For "first occurrence" or "count", write the lower/upper bound yourself.

## 3.2 Searching a rotated or unusual array

A sorted array rotated at an unknown pivot (`[4,5,6,7,0,1,2]`) is not sorted, but one half around any `mid` always is. Decide which half is sorted, check whether the target lies inside it, and discard the other half.

```java run Search in a rotated sorted array, and the minimum
public class Main {
    static int search(int[] a, int t) {
        int lo = 0, hi = a.length - 1;
        while (lo <= hi) {                         // classic form: exact match search
            int mid = lo + (hi - lo) / 2;
            if (a[mid] == t) return mid;
            if (a[lo] <= a[mid]) {                 // left half sorted
                if (a[lo] <= t && t < a[mid]) hi = mid - 1; else lo = mid + 1;
            } else {                               // right half sorted
                if (a[mid] < t && t <= a[hi]) lo = mid + 1; else hi = mid - 1;
            }
        }
        return -1;
    }
    static int findMin(int[] a) {                  // first index with a[i] <= a[last]
        int lo = 0, hi = a.length - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] <= a[a.length - 1]) hi = mid; else lo = mid + 1;
        }
        return a[lo];
    }
    public static void main(String[] args) {
        int[] a = {4, 5, 6, 7, 0, 1, 2};
        System.out.println("index of 0: " + search(a, 0) + ", of 6: " + search(a, 6)
                + ", of 3: " + search(a, 3));
        System.out.println("minimum " + findMin(a) + ", of unrotated: "
                + findMin(new int[]{1, 2, 3}));
    }
}
```

`findMin` is the first-true template again: the condition "`a[i] <= last element`" is false on the left part and true from the minimum onwards.

## 3.3 Binary search on the answer

When a problem asks you to **minimise a maximum** or **maximise a minimum**, and you can check a candidate answer quickly, binary search over the answer itself. The check must be monotonic: if capacity *c* works, every capacity above *c* works too.

Example: ship packages with weights `w` in order within *d* days. Find the least ship capacity. `canShip(c)` is a greedy pass that starts a new day when the next package does not fit. The answer lies between `max(w)` (every package must fit) and `sum(w)` (one day).

```java run Least capacity to ship within d days
public class Main {
    static int checks = 0;
    static boolean canShip(int[] w, int days, long cap) {
        checks++;
        int used = 1; long load = 0;
        for (int x : w) {
            if (load + x > cap) { used++; load = 0; }
            load += x;
        }
        return used <= days;
    }
    public static void main(String[] args) {
        int[] w = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        int days = 5;
        long lo = 0, hi = 0;
        for (int x : w) { lo = Math.max(lo, x); hi += x; }
        while (lo < hi) {
            long mid = lo + (hi - lo) / 2;
            if (canShip(w, days, mid)) hi = mid; else lo = mid + 1;
        }
        System.out.println("least capacity " + lo + " found with " + checks
                + " feasibility checks over the range [10, 55]");
        for (long c = 14; c <= 16; c++)
            System.out.println("  capacity " + c + " works? " + canShip(w, days, c));
    }
}
```

| Problem | Search space | Feasibility check |
|---|---|---|
| Koko eating bananas (min speed) | 1 … max pile | Hours needed ≤ *h* |
| Split array largest sum (min of max) | max … sum | Greedy count of parts ≤ *k* |
| Aggressive cows (max of min distance) | 0 … range | Greedy placement fits *c* cows |
| Book allocation, painters' partition | max … sum | Greedy count of students/painters |
| Minimum days to make *m* bouquets | min day … max day | Count adjacent bloomed runs |
| *k*th smallest in a sorted matrix | min … max value | Count of elements ≤ mid ≥ *k* |

> TIP: For "maximise the minimum", the condition is true at the start and false at the end, so search for the **last** true value: find the first false with the template and subtract one, or flip the condition.

## 3.4 Sorting algorithms worth knowing

Interviews rarely ask you to code a sort, but they do ask **properties**, and merge sort's structure is reused in counting inversions and in external sorting.

| Algorithm | Time (best / avg / worst) | Space | Stable | Notes |
|---|---|---|---|---|
| Bubble, insertion | n / n<sup>2</sup> / n<sup>2</sup> | O(1) | Yes | Insertion sort is fast on nearly sorted data |
| Selection | n<sup>2</sup> always | O(1) | No | Fewest swaps (n − 1) |
| Merge sort | n log n always | O(n) | Yes | Basis of `Collections.sort` (TimSort) |
| Quick sort | n log n / n log n / n<sup>2</sup> | O(log n) stack | No | Fast in practice; bad pivots give n<sup>2</sup> |
| Heap sort | n log n always | O(1) | No | Used as a fallback against bad quicksort cases |
| Counting / radix | n + k | O(n + k) | Yes | Small integer keys only |

Java uses **TimSort** (a stable merge-insertion hybrid) for object arrays and lists, and a dual-pivot quicksort for primitive arrays. Stability matters when you sort by one key after another: sort by name, then stably by department, and names stay in order within each department.

```java run Merge sort that counts inversions
import java.util.*;

public class Main {
    static long sortCount(int[] a, int[] tmp, int lo, int hi) {   // sorts a[lo..hi)
        if (hi - lo < 2) return 0;
        int mid = (lo + hi) >>> 1;
        long inv = sortCount(a, tmp, lo, mid) + sortCount(a, tmp, mid, hi);
        int i = lo, j = mid, k = lo;
        while (i < mid && j < hi) {
            if (a[i] <= a[j]) tmp[k++] = a[i++];       // <= keeps the sort stable
            else { inv += mid - i; tmp[k++] = a[j++]; } // a[j] jumps over mid - i items
        }
        while (i < mid) tmp[k++] = a[i++];
        while (j < hi) tmp[k++] = a[j++];
        System.arraycopy(tmp, lo, a, lo, hi - lo);
        return inv;
    }
    public static void main(String[] args) {
        int[] a = {8, 4, 2, 1, 7, 3};
        long brute = 0;
        for (int i = 0; i < a.length; i++)
            for (int j = i + 1; j < a.length; j++) if (a[i] > a[j]) brute++;
        long inv = sortCount(a, new int[a.length], 0, a.length);
        System.out.println("sorted " + Arrays.toString(a) + ", inversions " + inv
                + " (brute force " + brute + ")");
    }
}
```

An **inversion** is a pair `i < j` with `a[i] > a[j]`; the count measures how far an array is from sorted and equals the number of swaps bubble sort would make. The merge step counts them in bulk: when `a[j]` from the right half is placed before the remaining `mid - i` elements of the left half, it forms an inversion with each of them.

### Quickselect: the *k*th smallest in O(n) average

Partition as in quicksort, then recurse into **one** side only. The expected work is n + n/2 + n/4 + … ≈ 2n. A random pivot protects against sorted inputs.

```java run Quickselect with a random pivot
import java.util.*;

public class Main {
    static final Random RND = new Random(42);
    static int kthSmallest(int[] a, int k) {          // k is 0-based
        int lo = 0, hi = a.length - 1;
        while (true) {
            int p = partition(a, lo, hi, lo + RND.nextInt(hi - lo + 1));
            if (p == k) return a[p];
            if (p < k) lo = p + 1; else hi = p - 1;
        }
    }
    static int partition(int[] a, int lo, int hi, int pivotIdx) {   // Lomuto scheme
        swap(a, pivotIdx, hi);
        int store = lo;
        for (int i = lo; i < hi; i++) if (a[i] < a[hi]) swap(a, i, store++);
        swap(a, store, hi);
        return store;
    }
    static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }
    public static void main(String[] args) {
        int[] a = {7, 10, 4, 3, 20, 15, 4};
        int[] sorted = a.clone(); Arrays.sort(sorted);
        System.out.println("sorted " + Arrays.toString(sorted));
        for (int k : new int[]{0, 2, 3, 6})
            System.out.println("k=" + k + " -> " + kthSmallest(a.clone(), k));
    }
}
```

## 3.5 Custom sorting

Many greedy and interval problems start with "sort by the right key". Java's `Comparator` combinators make the key explicit and avoid overflow bugs.

```java run Comparators: multi-key, reversed, and the largest number
import java.util.*;

public class Main {
    record Student(String name, int marks, int age) {}
    public static void main(String[] args) {
        List<Student> s = new ArrayList<>(List.of(new Student("Asha", 88, 21),
                new Student("Ravi", 92, 22), new Student("Meera", 88, 20),
                new Student("Kiran", 92, 21)));
        s.sort(Comparator.comparingInt(Student::marks).reversed()
                .thenComparing(Student::name));
        for (Student x : s) System.out.println("  " + x.name() + " " + x.marks());

        int[][] pairs = {{3, 9}, {1, 4}, {3, 2}, {2, 8}};
        Arrays.sort(pairs, (p, q) -> p[0] != q[0] ? Integer.compare(p[0], q[0])
                : Integer.compare(q[1], p[1]));                   // 2nd key descending
        System.out.println("pairs " + Arrays.deepToString(pairs));

        String[] nums = {"3", "30", "34", "5", "9"};
        Arrays.sort(nums, (x, y) -> (y + x).compareTo(x + y));    // largest concatenation
        System.out.println("largest number " + String.join("", nums));
    }
}
```

The "largest number" comparator compares the two possible concatenations directly; plain string order would put `"30"` before `"3"` and produce `...303...` instead of `...330...`.

## 3.6 Interval problems

Almost every interval problem starts with **sorting by start** (merging, inserting) or **by end** (choosing the most non-overlapping intervals, Chapter 10). For "how many overlap at once" (meeting rooms), sort the start and end events separately, or keep a min-heap of end times.

```java run Merge intervals and count meeting rooms
import java.util.*;

public class Main {
    static List<int[]> merge(int[][] iv) {
        Arrays.sort(iv, Comparator.comparingInt(x -> x[0]));
        List<int[]> out = new ArrayList<>();
        for (int[] cur : iv) {
            if (out.isEmpty() || out.get(out.size() - 1)[1] < cur[0]) out.add(cur.clone());
            else out.get(out.size() - 1)[1] = Math.max(out.get(out.size() - 1)[1], cur[1]);
        }
        return out;
    }
    static int rooms(int[][] meetings) {
        Arrays.sort(meetings, Comparator.comparingInt(x -> x[0]));
        PriorityQueue<Integer> ends = new PriorityQueue<>();
        for (int[] m : meetings) {
            if (!ends.isEmpty() && ends.peek() <= m[0]) ends.poll();   // reuse a free room
            ends.offer(m[1]);
        }
        return ends.size();
    }
    public static void main(String[] args) {
        int[][] iv = {{8, 10}, {1, 3}, {2, 6}, {15, 18}, {17, 20}, {6, 7}};
        StringBuilder sb = new StringBuilder();
        for (int[] x : merge(iv)) sb.append(Arrays.toString(x)).append(' ');
        System.out.println("merged " + sb.toString().trim());
        int[][] meet = {{0, 30}, {5, 10}, {15, 20}, {10, 15}, {25, 35}};
        System.out.println("meeting rooms needed " + rooms(meet));
    }
}
```

> TRAP: Decide whether touching intervals overlap. `[1,3]` and `[3,5]` merge if the problem treats endpoints as inclusive (`<` in the merge test), but two meetings `[5,10]` and `[10,15]` can share a room (`<=` in the rooms test). Read the problem statement, then write the comparison deliberately.

## 3.7 Practical lessons

- Use one binary search template (first true, `lo < hi`, `hi = mid`, `lo = mid + 1`) and express every search as a monotonic condition.
- "Minimise the maximum" or "maximise the minimum" with a fast check: binary search on the answer.
- Know sort properties (stability, worst case, space) and merge sort's merge step.
- Quickselect gives the *k*th element in O(n) average; a heap gives it in O(n log k) (Chapter 7).
- Intervals: sort by start to merge, by end to select, and use a heap of end times to count overlaps.

# Chapter 4: Linked Lists, Stacks and Queues
%Pointer manipulation without fear, fast and slow pointers, and the monotonic stack and deque

## 4.1 Linked-list technique

Linked-list problems test careful pointer handling. Three habits remove most bugs: use a **dummy head** node so that the first element is not a special case, draw the pointers before and after each step, and save `next` before you overwrite it.

```java run Reverse, merge and remove the nth node from the end
public class Main {
    static class Node { int val; Node next; Node(int v, Node n) { val = v; next = n; } }
    static Node of(int... v) {
        Node dummy = new Node(0, null), t = dummy;
        for (int x : v) { t.next = new Node(x, null); t = t.next; }
        return dummy.next;
    }
    static String str(Node h) {
        StringBuilder sb = new StringBuilder();
        for (; h != null; h = h.next) sb.append(h.val).append(h.next != null ? "->" : "");
        return sb.length() == 0 ? "(empty)" : sb.toString();
    }
    static Node reverse(Node h) {
        Node prev = null;
        while (h != null) { Node next = h.next; h.next = prev; prev = h; h = next; }
        return prev;
    }
    static Node merge(Node a, Node b) {
        Node dummy = new Node(0, null), t = dummy;
        while (a != null && b != null) {
            if (a.val <= b.val) { t.next = a; a = a.next; } else { t.next = b; b = b.next; }
            t = t.next;
        }
        t.next = a != null ? a : b;
        return dummy.next;
    }
    static Node removeNthFromEnd(Node h, int n) {
        Node dummy = new Node(0, h), fast = dummy, slow = dummy;
        for (int i = 0; i <= n; i++) fast = fast.next;      // gap of n nodes
        while (fast != null) { fast = fast.next; slow = slow.next; }
        slow.next = slow.next.next;
        return dummy.next;
    }
    public static void main(String[] args) {
        System.out.println("reverse   " + str(reverse(of(1, 2, 3, 4, 5))));
        System.out.println("merge     " + str(merge(of(1, 4, 7), of(2, 3, 8, 9))));
        Node list = of(1, 2, 3, 4, 5);
        System.out.println("remove 2nd from end " + str(removeNthFromEnd(list, 2)));
        System.out.println("remove only node    " + str(removeNthFromEnd(of(9), 1)));
    }
}
```

The dummy node is what makes "remove the only node" work without an `if`.

## 4.2 Fast and slow pointers

A slow pointer moving one step and a fast pointer moving two answer three questions in O(1) space: where the middle is, whether there is a cycle, and where the cycle starts (**Floyd's algorithm**). When they meet inside the cycle, a pointer restarted from the head and one continuing from the meeting point, both at speed 1, meet exactly at the cycle entrance.

```java run Middle node, cycle detection and the cycle start
public class Main {
    static class Node { int val; Node next; Node(int v) { val = v; } }
    static Node[] build(int n) {
        Node[] a = new Node[n];
        for (int i = 0; i < n; i++) a[i] = new Node(i);
        for (int i = 0; i + 1 < n; i++) a[i].next = a[i + 1];
        return a;
    }
    static Node middle(Node h) {
        Node slow = h, fast = h;
        while (fast != null && fast.next != null) { slow = slow.next; fast = fast.next.next; }
        return slow;
    }
    static Node cycleStart(Node h) {
        Node slow = h, fast = h;
        while (fast != null && fast.next != null) {
            slow = slow.next; fast = fast.next.next;
            if (slow == fast) {
                Node p = h;
                while (p != slow) { p = p.next; slow = slow.next; }
                return p;
            }
        }
        return null;
    }
    public static void main(String[] args) {
        System.out.println("middle of 0..4: " + middle(build(5)[0]).val
                + ", of 0..5: " + middle(build(6)[0]).val + " (second middle)");
        Node[] a = build(10);
        System.out.println("no cycle -> " + cycleStart(a[0]));
        a[9].next = a[4];                                  // tail points back to node 4
        System.out.println("cycle starts at node " + cycleStart(a[0]).val);
    }
}
```

Why it works: if the head is *x* steps from the entrance and they meet *y* steps into a cycle of length *c*, the fast pointer has walked twice as far, so 2(x + y) = x + y + kc, which gives x = kc − y. Walking *x* more steps from the meeting point therefore lands on the entrance.

## 4.3 Stacks: matching and evaluation

A stack is the natural structure for anything nested or "most recent first": brackets, undo, expression evaluation, DFS.

```java run Valid brackets and a postfix evaluator
import java.util.*;

public class Main {
    static boolean valid(String s) {
        Deque<Character> st = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(') st.push(')');
            else if (c == '[') st.push(']');
            else if (c == '{') st.push('}');
            else if (st.isEmpty() || st.pop() != c) return false;
        }
        return st.isEmpty();
    }
    static long evalPostfix(String expr) {
        Deque<Long> st = new ArrayDeque<>();
        for (String tok : expr.split(" ")) {
            switch (tok) {
                case "+" -> st.push(st.pop() + st.pop());
                case "*" -> st.push(st.pop() * st.pop());
                case "-" -> { long b = st.pop(), a = st.pop(); st.push(a - b); }
                case "/" -> { long b = st.pop(), a = st.pop(); st.push(a / b); }
                default -> st.push(Long.parseLong(tok));
            }
        }
        return st.pop();
    }
    public static void main(String[] args) {
        for (String s : new String[]{"([]{})", "([)]", "((", ""})
            System.out.println("'" + s + "' valid? " + valid(s));
        System.out.println("postfix '2 1 + 3 *' = " + evalPostfix("2 1 + 3 *"));
        System.out.println("postfix '4 13 5 / +' = " + evalPostfix("4 13 5 / +"));
    }
}
```

> TRAP: For `-` and `/` the operands come off the stack in reverse order. Pop `b` first, then `a`, and compute `a - b`.

## 4.4 The monotonic stack

A **monotonic stack** keeps indices whose values are increasing (or decreasing). When a new value breaks the order, every popped index has just found its **next greater (or smaller) element**. Each index is pushed and popped once, so all answers come out in O(n).

| Question | Stack order | Pop when |
|---|---|---|
| Next greater element | Decreasing values | `a[i] > a[top]` |
| Next smaller element | Increasing values | `a[i] < a[top]` |
| Previous greater/smaller | Same stacks; answer is the top **after** popping | — |
| Largest rectangle in a histogram | Increasing heights | `h[i] < h[top]`; popped bar's width spans to the new top |
| Daily temperatures, stock span | Decreasing | — |

```java run Next greater element, daily temperatures and the largest rectangle
import java.util.*;

public class Main {
    static int[] nextGreater(int[] a) {
        int[] res = new int[a.length]; Arrays.fill(res, -1);
        Deque<Integer> st = new ArrayDeque<>();                // indices, values decreasing
        for (int i = 0; i < a.length; i++) {
            while (!st.isEmpty() && a[i] > a[st.peek()]) res[st.pop()] = a[i];
            st.push(i);
        }
        return res;
    }
    static int[] daysToWarmer(int[] t) {
        int[] res = new int[t.length];
        Deque<Integer> st = new ArrayDeque<>();
        for (int i = 0; i < t.length; i++) {
            while (!st.isEmpty() && t[i] > t[st.peek()]) { int j = st.pop(); res[j] = i - j; }
            st.push(i);
        }
        return res;
    }
    static long largestRectangle(int[] h) {
        Deque<Integer> st = new ArrayDeque<>();
        long best = 0;
        for (int i = 0; i <= h.length; i++) {
            int cur = i == h.length ? 0 : h[i];               // sentinel 0 flushes the stack
            while (!st.isEmpty() && cur < h[st.peek()]) {
                int height = h[st.pop()];
                int left = st.isEmpty() ? -1 : st.peek();      // previous smaller bar
                best = Math.max(best, (long) height * (i - left - 1));
            }
            st.push(i);
        }
        return best;
    }
    public static void main(String[] args) {
        int[] a = {4, 5, 2, 25, 7, 8};
        System.out.println("next greater " + Arrays.toString(nextGreater(a)));
        int[] temps = {73, 74, 75, 71, 69, 72, 76, 73};
        System.out.println("days to warmer " + Arrays.toString(daysToWarmer(temps)));
        int[] bars = {2, 1, 5, 6, 2, 3};
        System.out.println("largest rectangle " + largestRectangle(bars));
    }
}
```

For the histogram, when a bar is popped its right boundary is the current index (the first smaller bar to the right) and its left boundary is the new top (the first smaller bar to the left), so it is the tallest rectangle using that bar's full height.

## 4.5 Queues, deques and the sliding-window maximum

A queue gives first-in-first-out order (BFS, Chapter 8). A **monotonic deque** extends the monotonic-stack idea to a sliding window: keep indices with decreasing values; drop from the front when an index leaves the window, and from the back when a larger value arrives (the smaller ones can never be a maximum again). The front is always the window maximum.

```java run Sliding-window maximum with a monotonic deque
import java.util.*;

public class Main {
    static int[] windowMax(int[] a, int k) {
        int[] res = new int[a.length - k + 1];
        Deque<Integer> dq = new ArrayDeque<>();
        for (int i = 0; i < a.length; i++) {
            if (!dq.isEmpty() && dq.peekFirst() <= i - k) dq.pollFirst();   // left the window
            while (!dq.isEmpty() && a[dq.peekLast()] <= a[i]) dq.pollLast();  // never max
            dq.offerLast(i);
            if (i >= k - 1) res[i - k + 1] = a[dq.peekFirst()];
        }
        return res;
    }
    public static void main(String[] args) {
        int[] a = {1, 3, -1, -3, 5, 3, 6, 7};
        System.out.println("window max k=3 " + Arrays.toString(windowMax(a, 3)));
        Random r = new Random(1); boolean ok = true;
        for (int t = 0; t < 300; t++) {
            int[] x = new int[1 + r.nextInt(25)];
            for (int i = 0; i < x.length; i++) x[i] = r.nextInt(20);
            int k = 1 + r.nextInt(x.length);
            int[] got = windowMax(x, k);
            for (int i = 0; i + k <= x.length; i++) {
                int m = Integer.MIN_VALUE;
                for (int j = i; j < i + k; j++) m = Math.max(m, x[j]);
                ok &= got[i] == m;
            }
        }
        System.out.println("300 random tests agree with brute force: " + ok);
    }
}
```

### Designing a stack or queue with extra operations

| Design problem | Idea |
|---|---|
| Min stack (`getMin` in O(1)) | Store `(value, min so far)` pairs, or a second stack of minimums |
| Queue using two stacks | Push to `in`; when `out` is empty, move everything from `in` to `out`; amortised O(1) |
| Stack using queues | Rotate the queue after each push so the newest is at the front |
| LRU cache | Hash map + doubly linked list, or `LinkedHashMap` with access order |

```java run Min stack and an LRU cache on LinkedHashMap
import java.util.*;

public class Main {
    static class MinStack {
        private final Deque<long[]> st = new ArrayDeque<>();      // {value, min so far}
        void push(long x) {
            st.push(new long[]{x, st.isEmpty() ? x : Math.min(x, getMin())});
        }
        long pop() { return st.pop()[0]; }
        long getMin() { return st.peek()[1]; }
    }
    static class LRU<K, V> extends LinkedHashMap<K, V> {
        private final int cap;
        LRU(int cap) { super(16, 0.75f, true); this.cap = cap; }   // true = access order
        @Override protected boolean removeEldestEntry(Map.Entry<K, V> e) {
            return size() > cap;
        }
    }
    public static void main(String[] args) {
        MinStack ms = new MinStack();
        for (long x : new long[]{5, 3, 7, 2, 8}) ms.push(x);
        System.out.print("min while popping:");
        for (int i = 0; i < 5; i++) { System.out.print(" " + ms.getMin()); ms.pop(); }
        System.out.println();

        LRU<String, Integer> cache = new LRU<>(2);
        cache.put("a", 1); cache.put("b", 2);
        cache.get("a");                       // a becomes most recent
        cache.put("c", 3);                    // evicts b, the least recently used
        System.out.println("LRU keys (oldest first) " + cache.keySet());
    }
}
```

> NOTE: In an interview, expect the follow-up "now implement it without `LinkedHashMap`". The Low-Level Design guide (Chapter 7.2) builds the LRU and LFU caches from a hash map and a doubly linked list.

## 4.6 Practical lessons

- Linked lists: dummy head, save `next` before rewiring, and test on empty, one-node and two-node lists.
- Fast and slow pointers find the middle, detect cycles and locate the cycle start in O(1) space.
- "Next greater/smaller", "span", "histogram": monotonic stack. "Window maximum/minimum": monotonic deque.
- Every element is pushed and popped at most once, which is why these are O(n) despite the inner `while`.
