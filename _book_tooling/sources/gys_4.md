## Solutions: Set A1

| Q | Answer | Q | Answer | Q | Answer |
|---|---|---|---|---|---|
| E1 | A | M1 | 6 | H1 | 4 |
| E2 | 40 | M2 | A | H2 | D |
| E3 | C | M3 | A, C, D | H3 | B, C, D |
| E4 | 12 | M4 | 5 | H4 | 5 |
| E5 | A, C, D | M5 | A | H5 | B |
| E6 | 81 | M6 | 4 | H6 | 26 |
| E7 | D | M7 | A, D | H7 | A, D |
| E8 | A, C, D | M8 | B | | |
| | | M9 | 64 | | |

**E1.** A* uses a heuristic. **E2.** 1 + 3 + 9 + 27 = 40. **E3.** A stack. **E4.** 5 + 7 = 12.

**E5.** Misplaced tiles and Manhattan distance never overestimate; doubling Manhattan distance can.

**E6.** 3⁴ = 81. **E7.** MAX takes the largest: 7.

**E8.** Greedy best-first search can cycle forever without repeated-state checks.

**M1.** S → A → B → G costs 2 + 1 + 3 = 6.

**M2.** Expand S (f = 4); A has f = 6 and B has f = 7. Expand A: B improves to g = 3, f = 5, and G gets f = 9. Expand B: G improves to g = 6, f = 6. Expand G.

**M3.** Consistency implies admissibility and non-decreasing f, and with consistency A* graph search never needs to reopen nodes.

**M4.** The first MIN node gives 5, so α = 5. The second sees 3 ≤ 5 and stops; the third gives min(7, 4) = 4. Root = 5.

**M5.** Only x is skipped.

**M6.** S → A → B → G costs 1 + 2 + 1 = 4.

**M7.** Greedy best-first uses h only and is neither optimal nor (without checks) complete. Without repeated-state checks it can cycle forever, even on a finite graph.

**M8.** O(bᵈ): the repeated shallow levels add only a constant factor.

**M9.** 4³ = 64.

**H1.** All three leaves of the first MIN node (value 4), then 3 ≤ 4 prunes p and q: 4 leaves.

**H2.** After the first MIN node, α = 6; MIN can stop as soon as y ≤ 6.

**H3.** Admissibility suffices for tree search, but inconsistency allows f to drop, and graph search without reopening can then lock in a suboptimal path. The inequality in (A) is consistency itself.

**H4.** First MIN: min(max(3, 5), max(2, 9)) = min(5, 9) = 5. Second: min(1, 7) = 1. Root: max(5, 1) = 5.

**H5.** A dominating admissible heuristic expands no more nodes (up to ties).

**H6.** Limits 0, 1, 2 and 3 generate 1, 3, 7 and 15 nodes: 26.

**H7.** A* is informed. Greedy best-first search uses h, so it is informed.

```python run Recomputing Set A1
import heapq

def astar(edges, h, s, g):
    adj = {}
    for (u, v), w in edges.items():
        adj.setdefault(u, []).append((v, w))
    dist, pq, closed, order = {s: 0}, [(h[s], s)], set(), []
    while pq:
        f, u = heapq.heappop(pq)
        if u in closed:
            continue
        closed.add(u); order.append(u)
        if u == g:
            return dist[g], order
        for v, w in adj.get(u, []):
            if dist[u] + w < dist.get(v, float('inf')):
                dist[v] = dist[u] + w; heapq.heappush(pq, (dist[v] + h[v], v))

E1 = {('S', 'A'): 2, ('S', 'B'): 5, ('A', 'B'): 1, ('A', 'G'): 7, ('B', 'G'): 3}
print('M1/M2', astar(E1, dict(S=4, A=4, B=2, G=0), 'S', 'G'))
E2 = {('S', 'A'): 1, ('S', 'B'): 4, ('A', 'B'): 2, ('B', 'G'): 1, ('A', 'G'): 6}
print('M6 (h = 0 is uniform-cost search)', astar(E2, dict(S=0, A=0, B=0, G=0), 'S', 'G')[0])

def ab(node, maxing, a, b, seen):
    if not isinstance(node, list):
        seen.append(node); return node
    best = float('-inf') if maxing else float('inf')
    for c in node:
        v = ab(c, not maxing, a, b, seen)
        if maxing:
            best = max(best, v); a = max(a, best)
        else:
            best = min(best, v); b = min(b, best)
        if a >= b:
            break
    return best

for name, tree in (('M4', [[5, 6], [3, 99], [7, 4]]), ('H1', [[4, 8, 9], [3, 99, 99]]),
                   ('H4', [[[3, 5], [2, 9]], [[0, 1], [7, 4]]])):
    seen = []
    print(name, 'value', ab(tree, True, float('-inf'), float('inf'), seen),
            'leaves evaluated', len(seen))
print('E2', sum(3 ** d for d in range(4)), '| H6', sum(2 ** (l + 1) - 1 for l in range(4)))
```

## Solutions: Set A2

| Q | Answer | Q | Answer | Q | Answer |
|---|---|---|---|---|---|
| E1 | B | M1 | 4 | H1 | 2 |
| E2 | 16 | M2 | B | H2 | A |
| E3 | D | M3 | B, D | H3 | A, D |
| E4 | 3 | M4 | 2 | H4 | 4 |
| E5 | B, C, D | M5 | C | H5 | C |
| E6 | 2 | M6 | 2 | H6 | 4 |
| E7 | D | M7 | B, D | H7 | B, C |
| E8 | B, D | M8 | A | | |
| | | M9 | 16 | | |

**E1.** ¬p ∨ q. **E2.** 2⁴ = 16. **E3.** ¬q → ¬p. **E4.** All except p = q = false.

**E5.** p ∧ ¬p is a contradiction. **E6.** Both true or both false. **E7.** De Morgan.

**E8.** "All A are B" uses →, and (D) is its equivalent negated form. (A) says everything is a dog; (C) is true as soon as anything is not a dog.

**M1.** The satisfying assignments are those with p ≤ q ≤ r: 000, 001, 011, 111.

**M2.** Exportation.

**M3.** Every model of p ∧ q satisfies p ∨ q, but not conversely. β → α is not valid: p true and q false satisfies β but not α.

**M4.** (p ∨ r) ∧ (q ∨ r).

**M5.** ∃x ¬P(x). **M6.** q ∨ r: 2 literals.

**M7.** ∃∀ implies ∀∃, not the reverse; "some" does not imply "all".

**M8.** ∃ with ∧. **M9.** 2^(2²) = 16.

**H1.** Only 010 and 101.

**H2.** Modus ponens twice: p gives q, then q gives r.

**H3.** ∀ distributes over ∧ and ∃ over ∨, but not the other way round.

**H4.** Distributing gives (p ∨ r)(p ∨ s)(q ∨ r)(q ∨ s): 4 clauses.

**H5.** Refutation: KB ∧ ¬α is unsatisfiable exactly when KB ⊨ α.

**H6.** Odd parity: 4 of the 8 assignments.

**H7.** (C) rewrites the implication; (B) splits the biconditional for members. (D) misses the "only when" half, and (A) wrongly says every member pays early and gets a discount.

```python run Recomputing Set A2 by truth tables
from itertools import product

imp = lambda a, b: (not a) or b
count = lambda f, n: sum(1 for v in product((False, True), repeat=n) if f(*v))
same = lambda f, g, n: all(f(*v) == g(*v) for v in product((False, True), repeat=n))
print('E4', count(lambda p, q: p or q, 2), '| E6', count(lambda p, q: p == q, 2),
      '| M1', count(lambda p, q, r: imp(p, q) and imp(q, r), 3),
      '| H1', count(lambda p, q, r: (p or q) and ((not p) or r) and ((not q) or (not r)),
              3),
      '| H6', count(lambda p, q, r: p ^ q ^ r, 3))
print('M2', same(lambda p, q, r: imp(p, imp(q, r)), lambda p, q, r: imp(p and q, r), 3),
      '| M3 a|=b', all(imp(p and q, p or q) for p, q in product((False, True), repeat=2)),
      'b|=a', all(imp(p or q, p and q) for p, q in product((False, True), repeat=2)))
target = lambda m, e, d: imp(m, d == e)
opts = {'A': lambda m, e, d: imp(m and e, d) and imp(m and not e, not d), 'B': lambda m, e,
        d: imp(m and e, d),
        'C': lambda m, e, d: (not m) or (d == e), 'D': lambda m, e, d: imp(m, d) and imp(m,
                e)}
print('H7', {k: same(target, f, 3) for k, f in opts.items()})
```

## Solutions: Set A3

| Q | Answer | Q | Answer | Q | Answer |
|---|---|---|---|---|---|
| E1 | C | M1 | 0.404 | H1 | 0.60 |
| E2 | 4 | M2 | A | H2 | B |
| E3 | A | M3 | A, D | H3 | B, C, D |
| E4 | 0.18 | M4 | 8 | H4 | 0.91 |
| E5 | A, B, D | M5 | D | H5 | D |
| E6 | 31 | M6 | 0.9 | H6 | 8 |
| E7 | A | M7 | A, C, D | H7 | A, B, C |
| E8 | B | M8 | B | | |
| | | M9 | 0.74 | | |

**E1.** Exact. **E2.** One number P(X = true | parents) for each of the 4 parent combinations. **E3.** Conditionally independent. **E4.** 0.3 × 0.6 = 0.18.

**E5.** Variable elimination is exact. **E6.** 2⁵ − 1 = 31. **E7.** MCMC.

**E8.** A collider blocks the path until it (or a descendant) is observed. Unobserved, the collider keeps A and B independent. Observing C or one of its descendants can make A and B dependent.

**M1.** P(W) = 0.24 + 0.14 = 0.38; P(S) = 0.9 × 0.38 + 0.1 × 0.62 = 0.404.

**M2.** 0.24/0.38 ≈ 0.63.

**M3.** Exact inference is NP-hard in general, so variable elimination is not polynomial on every network. It draws no samples; that is what the approximate methods do.

**M4.** 1 + 1 + 4 + 2 = 8.

**M5.** About 5%. **M6.** The weight is P(S = true | W = true) = 0.9.

**M7.** Parents, children and the children's other parents.

**M8.** Observing the common cause blocks the path.

**M9.** P(S | R) = 0.9 × 0.8 + 0.1 × 0.2 = 0.74.

**H1.** P(A) = 0.019 + 0.072 + 0.054 + 0.0072 = 0.1522 and P(A, B) = 0.019 + 0.072 = 0.091, so P(B | A) ≈ 0.60.

**H2.** P(B | A, E) = 0.019/(0.019 + 0.054) ≈ 0.26: the earthquake explains away the alarm.

**H3.** B and E are independent roots but become dependent through the observed common effect A; H1 and H2 show P(B | A, E) < P(B | A).

**H4.** 0.072/(0.072 + 0.0072) ≈ 0.91.

**H5.** NP-hard. **H6.** 2³ = 8.

**H7.** Prior sampling needs no evidence: it samples every variable from its CPT in topological order, and its frequencies converge to the true probabilities.

```python run Recomputing Set A3 by enumeration
from itertools import product

pR, pW, pS = 0.3, {True: .8, False: .2}, {True: .9, False: .1}
joint = lambda r, w, s: (pR if r else 1 - pR) * (pW[r] if w else 1 - pW[r]) * (pS[w] if s
        else 1 - pS[w])
P = lambda cond: sum(joint(*v) for v in product((True, False), repeat=3) if cond(*v))
print('M1', round(P(lambda r, w, s: s), 4), '| M2', round(P(lambda r, w, s: r
        and w) / P(lambda r, w, s: w), 4),
      '| M9', round(P(lambda r, w, s: r and s) / P(lambda r, w, s: r), 4))
pA = {(True, True): .95, (True, False): .9, (False, True): .3, (False, False): .01}
j2 = lambda b, e, a: (.1 if b else .9) * (.2 if e else .8) * (pA[b, e] if a else 1 - pA[b,
        e])
Q = lambda cond: sum(j2(*v) for v in product((True, False), repeat=3) if cond(*v))
print('H1', round(Q(lambda b, e, a: b and a) / Q(lambda b, e, a: a), 4),
      '| H2', round(Q(lambda b, e, a: b and e and a) / Q(lambda b, e, a: e and a), 4),
      '| H4', round(Q(lambda b, e, a: b and a and not e) / Q(lambda b, e, a: a and not e),
              4))
print('E6', 2 ** 5 - 1, '| M4', 1 + 1 + 4 + 2, '| H6', 2 ** 3)
```
