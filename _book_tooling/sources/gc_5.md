# Chapter 17: Unsupervised Learning
%k-means and k-medoids, hierarchical clustering with single and complete linkage, and principal component analysis

## 17.1 k-means and k-medoids

**k-means** alternates two steps until assignments stop changing: assign each point to the nearest centroid, then move each centroid to the mean of its points. Each step lowers the within-cluster sum of squares, so it converges, but only to a local minimum that depends on the initial centroids. It assumes roughly spherical clusters of similar size and is sensitive to outliers (means are pulled by extreme points).

**k-medoids** (PAM) restricts each centre to be an actual data point (the medoid) and can use any dissimilarity, such as Manhattan distance. It is more robust to outliers.

### Worked example: one iteration of k-means

*Points on a line: 1, 2, 3, 8, 9, 15. Start with centroids 2 and 9. Run k-means to convergence. (NAT: the final centroids)*

Assign: {1, 2, 3} to 2 and {8, 9, 15} to 9. New centroids 2 and 32/3 ≈ 10.67. Reassign: 8 is 6 from 2 and 2.67 from 10.67, so nothing moves; the algorithm stops with centroids 2 and 10.67.

## 17.2 Hierarchical clustering

**Agglomerative** (bottom-up) clustering starts with every point alone and repeatedly merges the closest pair of clusters; **divisive** (top-down) splits recursively. The result is a **dendrogram**; cutting it at a height gives a flat clustering.

| Linkage | Distance between clusters C₁ and C₂ | Behaviour |
|---|---|---|
| Single | min over x ∈ C₁, y ∈ C₂ of d(x, y) | Chaining; long, thin clusters |
| Complete | max d(x, y) | Compact clusters |
| Average | Mean of all pairwise distances | In between |
| Ward | Increase in within-cluster variance | Similar to k-means |

The first merge is always the closest pair of points, whatever the linkage; linkage only matters from the second merge on.

### Worked example: first merges with Manhattan distance

*Points P1 (1, 4, 0), P2 (2, 2, 1), P3 (4, 1, 3), P4 (2, 3, 3). Using Manhattan distance and single linkage, which pair merges first, and which point joins it next? (MCQ-style)*

Distances: d(P1, P2) = 1 + 2 + 1 = 4, d(P1, P3) = 9, d(P1, P4) = 5, d(P2, P3) = 5, d(P2, P4) = 3, d(P3, P4) = 4. P2 and P4 merge first (3). Single linkage then gives d({P2, P4}, P1) = min(4, 5) = 4 and d({P2, P4}, P3) = min(5, 4) = 4, a tie with d(P1, P3) = 9 far behind; a tie-break decides whether P1 or P3 joins next.

```python run k-means to convergence and single-linkage merges
import numpy as np
from scipy.cluster.hierarchy import linkage

x = np.array([1., 2, 3, 8, 9, 15]); c = np.array([2., 9])
for it in range(5):
    lab = np.argmin(abs(x[:, None] - c[None, :]), axis=1)
    new = np.array([x[lab == k].mean() for k in range(2)])
    print(f'iteration {it + 1}: clusters {[x[lab == k].tolist() for k in range(2)]}, '
            f'centroids {np.round(new, 2)}')
    if np.allclose(new, c):
        break
    c = new

P = np.array([[1, 4, 0], [2, 2, 1], [4, 1, 3], [2, 3, 3]])
Z = linkage(P, method='single', metric='cityblock')
print('merges (cluster i, cluster j, distance, size):'); print(Z)
```

SciPy numbers the points 0 to 3 (P1 to P4) and new clusters from 4 upwards. Its first merge is points 1 and 3 (P2 and P4) at distance 3, as computed. The tie at distance 4 is broken by SciPy's own ordering, which is why a GATE question with ties must state its tie-break rule.

## 17.3 Principal component analysis

PCA finds orthogonal directions of maximum variance. For centred data with covariance matrix Σ:

| Fact | Statement |
|---|---|
| Principal directions | Eigenvectors of Σ, ordered by eigenvalue |
| Variance along the k-th direction | The k-th eigenvalue λₖ |
| Fraction of variance explained by the first k components | (λ₁ + … + λₖ)/(λ₁ + … + λ_d) |
| Total variance | trace(Σ) = Σ λᵢ |
| Projected data | Uncorrelated across components |
| Via SVD of the centred data matrix X (n × d) | Right singular vectors; λᵢ = σᵢ²/n (or σᵢ²/(n − 1)) |

The mean squared projection of centred data onto the top direction u, (1/n)Σ(uᵀxᵢ)², equals λ₁. PCA is unsupervised and does not use class labels, so the highest-variance direction can be useless for classification; LDA uses the labels.

```python run PCA by eigen-decomposition and by scikit-learn
import numpy as np
from sklearn.decomposition import PCA

rng = np.random.default_rng(1)
X = rng.normal(size=(500, 3)) @ np.array([[3, 0, 0], [1, 2, 0], [0, 0, 0.5]])
Xc = X - X.mean(axis=0)
cov = Xc.T @ Xc / len(Xc)
lam, U = np.linalg.eigh(cov); lam, U = lam[::-1], U[:, ::-1]
print('eigenvalues', np.round(lam, 3), '| explained ratio', np.round(lam / lam.sum(), 3))
print('mean squared projection on u1:', round(np.mean((Xc @ U[:, 0]) ** 2), 3))
pca = PCA().fit(X)
print('sklearn explained_variance_ratio_', np.round(pca.explained_variance_ratio_, 3))
```

## 17.4 Traps

| Trap | Correct thinking |
|---|---|
| k-means finds the global optimum | Only a local one; restart from several initialisations |
| k-means centres are data points | That is k-medoids |
| Single linkage uses the maximum distance | Single = minimum, complete = maximum |
| PCA maximises class separation | It maximises variance and ignores labels |
| Fraction explained uses only the top eigenvalue in the denominator | The denominator is the sum of all eigenvalues |

# Chapter 18: Search
%Uninformed search, A* and heuristics, and adversarial search with minimax and alpha–beta pruning

## 18.1 Uninformed search

| Strategy | Frontier | Complete? | Optimal? | Time and space |
|---|---|---|---|---|
| Breadth-first | FIFO queue | Yes (finite branching) | Yes, for equal step costs | O(bᵈ) and O(bᵈ) |
| Uniform-cost | Priority queue on path cost g | Yes (positive costs) | Yes | Exponential in C*/ε |
| Depth-first | LIFO stack | No (infinite paths) | No | O(bᵐ) time, O(bm) space |
| Depth-limited | Stack with depth limit l | No | No | O(bˡ) |
| Iterative deepening | DFS with limits 0, 1, 2, … | Yes | Yes, for equal costs | O(bᵈ) time, O(bd) space |

Here b is the branching factor, d the depth of the shallowest goal and m the maximum depth. A* and greedy best-first are **informed** strategies: they use a heuristic.

## 18.2 Informed search and A*

**Greedy best-first** expands the node with the smallest h(n); fast but neither complete nor optimal. **A\*** expands the smallest f(n) = g(n) + h(n).

| Heuristic property | Definition | Consequence |
|---|---|---|
| Admissible | h(n) ≤ true cost to the goal | A* tree search is optimal |
| Consistent (monotone) | h(n) ≤ c(n, n′) + h(n′), and h(goal) = 0 | A* graph search is optimal; f never decreases along a path |
| Dominance | h₂ ≥ h₁ everywhere, both admissible | h₂ expands no more nodes |

Every consistent heuristic is admissible; the converse fails.

### Worked example: A* expansion order

*Edges with costs: S–A 1, S–B 4, A–B 2, A–C 5, B–C 1, C–G 3, B–G 6. Heuristic: h(S) = 5, h(A) = 4, h(B) = 3, h(C) = 2, h(G) = 0. In what order does A* (graph search) expand nodes, and what path does it return? (MCQ-style)*

Expand S (f = 5): A has f = 1 + 4 = 5, B has f = 4 + 3 = 7. Expand A (5): B improves to g = 3, f = 6; C gets g = 6, f = 8. Expand B (6): C improves to g = 4, f = 6; G gets g = 9, f = 9. Expand C (6): G improves to g = 7, f = 7. Expand G (7). Order S, A, B, C, G; path S–A–B–C–G with cost 7.

```python run A* with a trace of expansions
import heapq

E = {('S', 'A'): 1, ('S', 'B'): 4, ('A', 'B'): 2, ('A', 'C'): 5, ('B', 'C'): 1, ('C',
        'G'): 3, ('B', 'G'): 6}
adj = {}
for (u, v), w in E.items():
    adj.setdefault(u, []).append((v, w)); adj.setdefault(v, []).append((u, w))
h = dict(S=5, A=4, B=3, C=2, G=0)

g, parent, pq, closed, order = {'S': 0}, {'S': None}, [(h['S'], 'S')], set(), []
while pq:
    f, u = heapq.heappop(pq)
    if u in closed:
        continue
    closed.add(u); order.append(f'{u}(f={f})')
    if u == 'G':
        break
    for v, w in adj[u]:
        if v not in closed and g[u] + w < g.get(v, float('inf')):
            g[v] = g[u] + w; parent[v] = u
            heapq.heappush(pq, (g[v] + h[v], v))
path, n = [], 'G'
while n:
    path.append(n); n = parent[n]
print('expanded:', ' '.join(order))
print('path:', '-'.join(reversed(path)), 'cost', g['G'])
```

## 18.3 Adversarial search

**Minimax** assumes both players play optimally: MAX picks the child with the largest value, MIN the smallest. **Alpha–beta pruning** returns the same value while skipping branches that cannot affect the decision. α is the best value MAX can guarantee so far on the path, β the best for MIN; prune when α ≥ β.

With perfect move ordering alpha–beta examines about b^(m/2) nodes instead of bᵐ, effectively doubling the searchable depth.

### Worked example: alpha–beta on a two-level tree

*A MAX root has three MIN children with leaves (3, 12, 8), (2, x, y) and (14, 5, 2), searched left to right. Find the root value and which leaves are pruned. (MCQ-style)*

The first MIN node returns 3, so α = 3 at the root. At the second MIN node the first leaf is 2 ≤ α, so MIN can already force at most 2 < 3: the leaves x and y are pruned, whatever their values. The third MIN node sees 14, then 5, then 2, giving 2; nothing is pruned there because each value seen before the last was above α. The root value is 3.

```python run Minimax with alpha-beta and a record of pruned leaves
def alphabeta(node, maximising, alpha, beta, pruned, path='root'):
    if not isinstance(node, list):
        return node
    best = float('-inf') if maximising else float('inf')
    for i, child in enumerate(node):
        v = alphabeta(child, not maximising, alpha, beta, pruned, f'{path}.{i}')
        if maximising:
            best = max(best, v); alpha = max(alpha, best)
        else:
            best = min(best, v); beta = min(beta, best)
        if alpha >= beta:
            pruned.extend(f'{path}.{j}' for j in range(i + 1, len(node)))
            break
    return best

tree = [[3, 12, 8], [2, 100, -100], [14, 5, 2]]
pruned = []
print('root value', alphabeta(tree, True, float('-inf'), float('inf'), pruned), '| pruned',
        pruned)
```

The pruned leaves were given the values 100 and −100 to show that they truly do not matter.

## 18.4 Traps

| Trap | Correct thinking |
|---|---|
| A* is uninformed | It uses a heuristic; BFS, DFS, UCS and IDS are uninformed |
| Admissible implies consistent | Consistent implies admissible, not the reverse |
| DFS is complete | Not on infinite or cyclic spaces without checks |
| Pruning changes the minimax value | It never does; it only saves work |
| Alpha–beta prunes the same amount for any move order | Ordering matters greatly |

# Chapter 19: Logic
%Propositional equivalences and entailment, normal forms and resolution, and first-order logic with quantifiers

## 19.1 Propositional logic

| Equivalence | Statement |
|---|---|
| Implication | p → q ≡ ¬p ∨ q ≡ ¬q → ¬p (contrapositive) |
| Not equivalent to p → q | q → p (converse) and ¬p → ¬q (inverse) |
| De Morgan | ¬(p ∧ q) ≡ ¬p ∨ ¬q; ¬(p ∨ q) ≡ ¬p ∧ ¬q |
| Biconditional | p ↔ q ≡ (p → q) ∧ (q → p) |
| Exportation | (p ∧ q) → r ≡ p → (q → r) |
| Distribution | p ∨ (q ∧ r) ≡ (p ∨ q) ∧ (p ∨ r) |

A sentence is **valid** (a tautology) if true in every model, **satisfiable** if true in some model, and **unsatisfiable** if true in none.

**Entailment.** α ⊨ β means every model of α is a model of β. Equivalently, α → β is valid, and α ∧ ¬β is unsatisfiable (the basis of proof by refutation and resolution).

### Worked example: encoding a rule

*"A registered student gets a certificate exactly when they pass the final test." With R, T, K for registered, passes the test, gets a certificate, which encodes the statement? (MCQ-style)*

The statement has two halves: R ∧ T → K (passing gives the certificate) and R ∧ ¬T → ¬K (failing does not). Together they say R → (K ↔ T). The single implication R ∧ T → K misses the second half: it allows a registered student who failed to get a certificate.

```python run Truth tables: equivalences and entailment checks
from itertools import product

def equivalent(f, g, n):
    return all(f(*v) == g(*v) for v in product((False, True), repeat=n))

imp = lambda a, b: (not a) or b
print('p->q == ~q->~p :', equivalent(lambda p, q: imp(p, q), lambda p, q: imp(not q, not p),
        2))
print('p->q == q->p   :', equivalent(lambda p, q: imp(p, q), lambda p, q: imp(q, p), 2))
print('(p&q)->r == p->(q->r):', equivalent(lambda p, q, r: imp(p and q, r), lambda p, q,
        r: imp(p, imp(q, r)), 3))
rule = lambda r, t, k: imp(r and t, k) and imp(r and not t, not k)
print('rule == R -> (K <-> T):', equivalent(rule, lambda r, t, k: imp(r, k == t), 3))
print('rule == (R & T) -> K :', equivalent(rule, lambda r, t, k: imp(r and t, k), 3))
```

## 19.2 Normal forms and resolution

**CNF** is a conjunction of clauses, each a disjunction of literals. Any sentence converts to CNF: eliminate ↔ and →, push ¬ inward with De Morgan, then distribute ∨ over ∧.

**Resolution** combines two clauses with complementary literals: from (A ∨ x) and (B ∨ ¬x), infer (A ∨ B). To prove KB ⊨ α, add ¬α in CNF to the KB and resolve until the empty clause appears. Resolution is sound and refutation-complete for propositional logic.

## 19.3 First-order logic

FOL adds objects, predicates, functions and the quantifiers ∀ and ∃.

| Fact | Statement |
|---|---|
| Typical universal | "All humans are mortal": ∀x (Human(x) → Mortal(x)) |
| Typical existential | "Some student is smart": ∃x (Student(x) ∧ Smart(x)) |
| Common error | ∀x (Human(x) ∧ Mortal(x)) says everything is a mortal human |
| Common error | ∃x (Student(x) → Smart(x)) is true if anything is not a student |
| Negation | ¬∀x P(x) ≡ ∃x ¬P(x); ¬∃x P(x) ≡ ∀x ¬P(x) |
| Order of quantifiers | ∃x ∀y Loves(x, y) ⊨ ∀y ∃x Loves(x, y), not the reverse |
| Distribution | ∀x (P ∧ Q) ≡ ∀x P ∧ ∀x Q; ∃x (P ∨ Q) ≡ ∃x P ∨ ∃x Q |
| No distribution | ∀x (P ∨ Q) is weaker than ∀x P ∨ ∀x Q; ∃x (P ∧ Q) is stronger than ∃x P ∧ ∃x Q |

**Valid sentences** to recognise: ∀x P(x) → ∃x P(x) (in a non-empty domain), ∀x P(x) → P(c), and P(c) → ∃x P(x). **Not valid:** ∃x P(x) → ∀x P(x).

## 19.4 Traps

| Trap | Correct thinking |
|---|---|
| p → q ≡ q → p | Only the contrapositive is equivalent |
| Universal with ∧ | "All A are B" uses → |
| Existential with → | "Some A is B" uses ∧ |
| ∀y ∃x implies ∃x ∀y | Only the reverse holds |
| α ⊨ β means β ⊨ α | Entailment is one-directional |

# Chapter 20: Reasoning Under Uncertainty
%Bayesian networks and conditional independence, exact inference by variable elimination, and approximate inference by sampling

## 20.1 Bayesian networks

A Bayesian network is a DAG whose nodes are random variables, each with a conditional probability table P(X | parents(X)). The joint distribution factorises:

P(X₁, …, Xₙ) = Π P(Xᵢ | parents(Xᵢ)).

A network with n Boolean variables, each with at most k parents, needs at most n·2ᵏ numbers instead of 2ⁿ − 1.

**Conditional independence.** Each node is independent of its non-descendants given its parents. Three patterns decide independence along a path (d-separation):

| Pattern | Path | A and C independent? |
|---|---|---|
| Chain | A → B → C | Given B: yes. Unconditionally: no |
| Fork | A ← B → C | Given B: yes. Unconditionally: no |
| Collider (v-structure) | A → B ← C | Unconditionally: yes. Given B (or a descendant of B): **no** ("explaining away") |

## 20.2 Exact inference by variable elimination

To compute P(Query | evidence), sum the joint over the hidden variables. **Variable elimination** pushes sums inside the product and eliminates one hidden variable at a time, storing intermediate **factors** instead of recomputing them. It is exact; its cost depends on the elimination order and is exponential in the largest factor created. Exact inference is NP-hard in general, but linear in polytrees (singly connected networks).

### Worked example: a three-node chain

*Rain → WetGrass → Slippery. P(R) = 0.2; P(W | R) = 0.9, P(W | ¬R) = 0.1; P(S | W) = 0.7, P(S | ¬W) = 0.05. Find P(S) and P(R | S). (NAT)*

Eliminate R: P(W) = 0.9 × 0.2 + 0.1 × 0.8 = 0.26. Eliminate W: P(S) = 0.7 × 0.26 + 0.05 × 0.74 = 0.182 + 0.037 = 0.219. For P(R | S): P(R, S) = 0.2 × (0.9 × 0.7 + 0.1 × 0.05) = 0.2 × 0.635 = 0.127, so P(R | S) = 0.127/0.219 ≈ 0.580.

## 20.3 Approximate inference by sampling

| Method | How it works | Notes |
|---|---|---|
| Prior (forward) sampling | Sample each variable in topological order from its CPT | Estimates joint and marginal probabilities |
| Rejection sampling | Prior sampling, discarding samples that contradict the evidence | Wasteful when the evidence is unlikely |
| Likelihood weighting | Fix the evidence variables; weight each sample by the probability of the evidence given its parents | No rejections; weights can degenerate |
| Gibbs sampling (MCMC) | Repeatedly resample one non-evidence variable from its distribution given its Markov blanket | Converges to the posterior; a Markov chain Monte Carlo method |

All four are **approximate** and converge to the true answer as the number of samples grows. Variable elimination and enumeration are **exact**.

```python run Variable elimination versus rejection sampling and likelihood weighting
import random

PR, PW, PS = 0.2, {True: 0.9, False: 0.1}, {True: 0.7, False: 0.05}
pW = PW[True] * PR + PW[False] * (1 - PR)
pS = PS[True] * pW + PS[False] * (1 - pW)
pRS = PR * (PW[True] * PS[True] + (1 - PW[True]) * PS[False])
print(f'exact: P(S) = {pS:.4f}, P(R | S) = {pRS / pS:.4f}')

random.seed(0)
kept = rain = 0
for _ in range(200_000):
    r = random.random() < PR; w = random.random() < PW[r]; s = random.random() < PS[w]
    if s:
        kept += 1; rain += r
print(f'rejection sampling: kept {kept} of 200000 samples, P(R | S) = {rain / kept:.4f}')

num = den = 0.0
for _ in range(200_000):
    r = random.random() < PR; w = random.random() < PW[r]
    weight = PS[w]                        # S is evidence: weight instead of sampling
    den += weight; num += weight * r
print(f'likelihood weighting: P(R | S) = {num / den:.4f}')
```

Rejection sampling throws away about 78% of its samples, the ones where S came out false; likelihood weighting uses every sample.

## 20.4 Traps

| Trap | Correct thinking |
|---|---|
| Variable elimination is approximate | It is exact; sampling methods are approximate |
| Gibbs sampling is exact | It is MCMC: approximate, converging with more samples |
| A collider makes its parents dependent | Only when the collider (or a descendant) is observed |
| A Bayesian network needs the full joint table | It needs only each node's CPT |
| Rejection sampling is efficient for rare evidence | Most samples are rejected |
