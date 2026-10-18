# Exam strategy
%The paper, the marking rules and the habits that protect marks

| Item | Rule |
|---|---|
| Paper | 65 questions, 100 marks, 3 hours; GA 15 marks, DA subject 85 |
| One-mark questions | Q1–5 and Q11–35 |
| Two-mark questions | Q6–10 and Q36–65 |
| MCQ | −1/3 (1 mark) or −2/3 (2 marks) when wrong |
| MSQ | All correct options and nothing else; no negative, no partial marks; 1 to 4 options may be correct |
| NAT | Answer inside the published range; no negative marks; round only at the end |
| Time budget | About 1.5 minutes per 1-mark and 3 minutes per 2-mark question, leaving 20 minutes to review |
| Weightage (2025–26 average) | Probability and statistics 19, linear algebra 10, calculus 6.5, programming 14, databases 14.5, ML 14, AI 7 |

1. Answer every MSQ and NAT; they cost nothing when wrong.
2. Guess an MCQ only after eliminating at least one option: a blind guess has expected value 0.
3. For MSQs, judge each option independently. Never assume a fixed number of correct options.
4. Trace code and queries on paper; most lost marks in these questions come from answering by intuition.

# Probability and statistics

## Counting and probability

| Formula | Value |
|---|---|
| Permutations, combinations | P(n, r) = n!/(n − r)!, C(n, r) = n!/(r!(n − r)!) |
| Arrangements with repeats | n!/(n₁! n₂! …) |
| Stars and bars | Non-negative solutions of x₁ + … + xₖ = n: C(n + k − 1, k − 1); positive: C(n − 1, k − 1) |
| Circular arrangements | (n − 1)! |
| Derangements | Dₙ = (n − 1)(Dₙ₋₁ + Dₙ₋₂): 1, 2, 9, 44, 265; Dₙ/n! → 1/e |
| Involutions f(f(x)) = x on n elements | 1, 2, 4, 10, 26, 76 |
| Catalan numbers C(2n, n)/(n + 1) | 1, 2, 5, 14, 42 (binary trees, stack permutations, balanced brackets) |
| Onto functions from m to 3 elements | 3ᵐ − 3·2ᵐ + 3 |
| Inclusion–exclusion | \|A ∪ B ∪ C\| = Σ singles − Σ pairs + triple |
| Conditional probability | P(A \| B) = P(A ∩ B)/P(B) |
| Total probability, Bayes | P(B \| A) = P(A \| B)P(B)/Σ P(A \| Bᵢ)P(Bᵢ) |
| Independence | P(A ∩ B) = P(A)P(B); mutually exclusive events with positive probability are dependent |
| Bounds | max(0, P(A) + P(B) − 1) ≤ P(A ∩ B) ≤ min(P(A), P(B)) |

## Expectation, variance and covariance

| Formula | Note |
|---|---|
| Var(X) = E[X²] − (E[X])² | Var(aX + b) = a² Var(X) |
| Var(X ± Y) = Var X + Var Y ± 2Cov(X, Y) | Variances add for differences too when independent |
| Cov(X, Y) = E[XY] − E[X]E[Y] | Cov(aX + b, cY + d) = ac Cov(X, Y) |
| ρ = Cov/(σₓσᵧ) ∈ [−1, 1] | ±1 exactly for linear relations; zero covariance does not mean independence |
| E[E[X \| Y]] = E[X] | Var X = E[Var(X \| Y)] + Var(E[X \| Y]) |
| Random sum S of N terms with mean μ, variance σ² | E[S] = E[N]μ; Var S = E[N]σ² + Var(N)μ² |
| Var(XY), independent | E[X²]E[Y²] − (E[X]E[Y])² |
| Non-negative integer X | E[X] = Σₖ≥₁ P(X ≥ k) |
| Markov, Chebyshev | P(X ≥ a) ≤ E[X]/a; P(\|X − μ\| ≥ k) ≤ σ²/k² |
| Jensen | E[f(X)] ≥ f(E[X]) for convex f |
| Pairwise identity | Σᵢ Σⱼ (xᵢ − xⱼ)² = 2n Σ (xᵢ − x̄)² |
| Sample variance | Divide by n − 1 for an unbiased estimate |

## Distributions

| Distribution | Mean | Variance | Key facts |
|---|---|---|---|
| Bernoulli(p) | p | p(1 − p) | X² = X |
| Binomial(n, p) | np | np(1 − p) | With replacement; mode ⌊(n + 1)p⌋ |
| Geometric (trials to first success) | 1/p | (1 − p)/p² | Memoryless |
| Poisson(λ) | λ | λ | Sums of independent Poissons are Poisson; E[X(X − 1)] = λ² |
| Hypergeometric | nK/N | Smaller than binomial | Without replacement |
| Uniform(a, b) | (a + b)/2 | (b − a)²/12 | |
| Exponential(rate λ) | 1/λ | 1/λ² | P(X > x) = e^(−λx); memoryless; median ln 2/λ; min of exponentials has the summed rate; ⌊X⌋ is geometric |
| Normal(μ, σ²) | μ | σ² | 68–95–99.7; ±1.645 (90%), ±1.96 (95%), ±2.576 (99%) |
| Standard normal moments | | | E[Z³] = 0, E[Z⁴] = 3, Var(Z²) = 2, E\|Z\| = √(2/π) |
| χ²(k) | k | 2k | Sum of k squared N(0, 1); χ²(2) is exponential with mean 2 |
| t(ν) | 0 | ν/(ν − 2) | Heavier tails, lower peak than N(0, 1); t(1) density at 0 is 1/π |

## Inference

| Result | Formula |
|---|---|
| CLT | X̄ ≈ N(μ, σ²/n); S ≈ N(nμ, nσ²) |
| z interval | x̄ ± z σ/√n; halving the width needs 4× the data; round n up |
| t interval and test | x̄ ± t s/√n with n − 1 degrees of freedom |
| Proportion interval | p̂ ± z √(p̂(1 − p̂)/n); worst case p̂ = 0.5 |
| Chi-square goodness of fit | Σ (O − E)²/E with k − 1 − (estimated parameters) df |
| Chi-square independence | (r − 1)(c − 1) df; E = row total × column total / grand total |
| Errors | Type I: reject a true H₀ (α); Type II: keep a false H₀ (β); power = 1 − β |
| p-value | Probability under H₀ of a result at least this extreme; not the probability that H₀ is true |
| Normal samples | (n − 1)s²/σ² ~ χ²(n − 1); X̄ and s² independent |

# Linear algebra and calculus

## Linear algebra

| Fact | Statement |
|---|---|
| Rank–nullity | rank + nullity = number of columns |
| Ax = b | Unique if rank(A) = rank([A \| b]) = n; none if ranks differ; else infinitely many |
| rank(AᵀA) | = rank(A); rank(AB) ≤ min(rank A, rank B); uvᵀ has rank 1 |
| Determinant | det(AB) = det A det B; det(cA) = cⁿ det A; row swap flips the sign |
| Eigenvalues | Σλ = trace, Πλ = det; p(A) has eigenvalues p(λ); A⁻¹ has 1/λ |
| Rows summing to s | A·j = sj (eigenvalue s); polynomial p with p(s) = 0 makes p(A) singular |
| A³ = A | λ ∈ {−1, 0, 1}; rank A = rank A²; det ∈ {−1, 0, 1} |
| A² = I | λ = ±1; the trace counts (+1s) − (−1s) |
| Nilpotent | All λ = 0, trace 0 |
| Symmetric | Real eigenvalues, orthonormal eigenvectors; definiteness from the signs of λ |
| Orthogonal | QᵀQ = I, det ±1, preserves length, \|λ\| = 1 |
| Idempotent | λ ∈ {0, 1}, rank = trace, diagonalisable; orthogonal projection if also symmetric |
| Projections | onto u (unit): uuᵀ; onto columns of A: A(AᵀA)⁻¹Aᵀ; I − P projects onto the complement |
| I + c uuᵀ (unit u) | Eigenvalues 1 + c and 1 (n − 1 times) |
| Householder I − 2uuᵀ | Symmetric, orthogonal, det −1 |
| Centring matrix I − (1/n)jjᵀ | Symmetric idempotent, rank n − 1 |
| Rayleigh quotient | max xᵀAx over unit x = λ_max; min = λ_min |
| Gram matrix XᵀX | Positive semidefinite; definite when the columns are independent |
| Block triangular | det = det A × det D |
| Least squares | AᵀAx = Aᵀb; through the origin w = Σxy/Σx² |
| SVD | σᵢ² = eigenvalues of AᵀA; rank = number of σᵢ > 0; symmetric A: σ = \|λ\|; best rank-k error σₖ₊₁ |
| LU | Multipliers in L, U from elimination; Gaussian elimination ~ (2/3)n³; back substitution ~ n² |

The all-ones vector is written j here.

## Calculus

| Fact | Statement |
|---|---|
| Standard limits | sin x/x → 1, (eˣ − 1)/x → 1, ln(1 + x)/x → 1, (1 + a/n)ⁿ → eᵃ, xˣ → 1 as x → 0⁺ |
| √(x² + ax) − x | → a/2 as x → ∞ |
| Differentiability | Implies continuity; \|x\| and ReLU fail at 0; x²sin(1/x) is differentiable at 0 with f′ discontinuous |
| \|f(x) − f(y)\| ≤ C\|x − y\|^(1+ε) | f is constant |
| Taylor | f⁽ᵏ⁾(0) = k! × (coefficient of xᵏ); sinh odd powers, cosh even; sin x: f⁽⁴ᵏ⁺¹⁾(0) = 1, f⁽⁴ᵏ⁺³⁾(0) = −1 |
| Series | Σ rᵏ = 1/(1 − r); Σ k rᵏ = r/(1 − r)²; Σ aᵏ/k! = eᵃ; double geometric sums factorise |
| Extrema on [a, b] | Compare critical points and endpoints; f″ = 0 is inconclusive |
| Strict convexity (f″ > 0) | At most one minimum, any local minimum is global, but a minimum may not exist (eˣ) |
| Gradient descent on (a/2)w² | w ← (1 − ηa)w: converges for 0 < η < 2/a |
| Newton's method | xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ) |

# Programming, data structures and algorithms

| Python fact | Consequence |
|---|---|
| Names bind to objects | b = a aliases a list; `[[0]*n]*m` shares rows |
| Default arguments | Evaluated once; a mutable default is shared between calls |
| Closures | Each outer call creates new variables; lambdas in a loop see the final value (late binding) |
| Scope | LEGB; assignment makes a name local unless `global` or `nonlocal` |
| Arithmetic | `//` floors (−7 // 2 = −4); `%` takes the divisor's sign; `/` returns float |
| Methods | `append` vs `extend`; `sort()` returns None; `x in dict` tests keys; set ops `\|`, `&`, `-`, `^` |
| Tuple assignment | `a, b = b, a + b` uses the old values on the right |
| Iterators | Exhausted after one pass |
| `for/while … else` | The else runs when the loop ends without `break` |

| Structure or algorithm | Fact |
|---|---|
| Binary tree, height h | At most 2^(h+1) − 1 nodes, 2ᵈ nodes on level d; full trees: leaves = internal + 1 |
| Traversals | Pre/post + in-order fix a tree; in-order of a BST is sorted |
| BST | O(h) operations; sorted inserts give a chain |
| Heap (index 0) | Children 2i + 1, 2i + 2; parent ⌊(i − 1)/2⌋; build O(n); maximum of a min-heap is at a leaf |
| Hash, linear probing | Probe h(k), h(k) + 1, … mod size |
| Binary search | ⌊log₂ n⌋ + 1 worst-case comparisons (three-way); needs a sorted array |
| Selection sort | n(n − 1)/2 comparisons always; ≤ n − 1 swaps; not stable |
| Bubble sort | n(n − 1)/2 comparisons without early exit; swaps = inversions; stable |
| Insertion sort | Swaps = inversions; Θ(n) on sorted input; stable |
| Merge sort | Θ(n log n); merging m + n items costs ≤ m + n − 1 comparisons; 8 items: 17 worst case |
| Quicksort (first pivot) | Θ(n²) on sorted or reverse-sorted input; expected 2(n + 1)Hₙ − 4n comparisons |
| Master theorem T = aT(n/b) + nᵈ | Compare d with log_b a |
| Graphs | Σ degrees = 2E; tree has n − 1 edges; K_n has C(n, 2) edges; Cayley nⁿ⁻² spanning trees |
| BFS / DFS | O(V + E); same reachable set; BFS gives fewest-edge paths; DFS order depends on adjacency order |
| Shortest paths | BFS (unweighted), Dijkstra (non-negative), Bellman–Ford (V − 1 rounds), Floyd–Warshall Θ(V³) |
| DAG | Has a source and a topological order; longest path in O(V + E) |

# Databases and warehousing

| Topic | Rule |
|---|---|
| ER to relations | Entity → relation; multi-valued attribute → own relation; M : N → own relation; 1 : N → foreign key |
| Keys | Candidate key = minimal superkey; attributes on no right side are in every key |
| Foreign key violations | Insert into the referencing table; delete or update the referenced key |
| Projection | Removes duplicates in algebra, not in SQL |
| Natural join | No common attributes → Cartesian product; NULLs never match |
| Division | "For every"; R ÷ S |
| SQL NULL | Comparisons are UNKNOWN; COUNT(col) skips NULL; empty SUM/MAX = NULL, COUNT = 0; NOT IN with a NULL is never true |
| SQL order | FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY |
| > ALL / > ANY | > MAX / > MIN (non-empty, no NULLs) |
| 2NF, 3NF, BCNF | No partial dependency; X superkey or A prime; X superkey |
| Lossless binary split | Common attributes determine one side |
| Dependency preservation | Every FD checkable inside one piece; otherwise joins are needed |
| B+ tree non-leaf | p·ptr + (p − 1)·key ≤ block |
| B+ tree leaf | k(key + record pointer) + next pointer ≤ block |
| Indexes | Secondary indexes are dense; hash: equality only; B+ tree: range scans via linked leaves |
| Cuboids | 2ⁿ, or Π(Lᵢ + 1) with hierarchies |
| CUBE / ROLLUP rows | Π(dᵢ + 1) / sum over the prefixes |
| OLAP | Roll-up (coarser), drill-down (finer), slice (one value), dice (ranges on 2+ dims), pivot |
| Measures | Distributive (SUM, COUNT, MIN, MAX), algebraic (AVG, SD), holistic (MEDIAN, MODE, RANK) |
| Transformations | Min–max a + (v − min)(b − a)/(max − min); z = (v − μ)/σ; decimal scaling v/10ʲ |

# Machine learning

| Topic | Formula or fact |
|---|---|
| Simple regression | β₁ = Sₓᵧ/Sₓₓ, β₀ = ȳ − β₁x̄; residuals sum to 0; line through the means |
| Ridge | (XᵀX + λI)⁻¹Xᵀy; shrinks, never zeroes; bias up, variance down |
| Lasso | L1 penalty; can zero coefficients |
| R² | 1 − SSres/SStot; dropping a feature cannot raise training R² |
| Logistic | σ(wᵀx + b); linear boundary; σ′ = σ(1 − σ) ≤ 0.25 |
| Perceptron | w ← w + yx on mistakes; score rises by ‖x‖² + 1; converges if separable |
| Naive Bayes | P(y)Π P(xⱼ \| y); misclassification probability = smaller posterior |
| LDA | Shared covariance → linear; at most C − 1 directions; uses labels |
| Nearest mean | Linear boundary |
| SVM | Margin 2/‖w‖; only support vectors matter; larger C penalises violations more |
| k-NN | No training; scale-sensitive; 1-NN training error 0; k = n predicts the majority class |
| Entropy, Gini | −Σp log₂ p; 1 − Σp²; 50/50 gives 1 and 0.5 |
| Information gain | Parent entropy − weighted child entropy |
| Bias–variance | Error = bias² + variance + noise; bagging lowers variance |
| Cross-validation | k folds, k models; LOOCV = n folds on the training part only |
| Metrics | Precision TP/(TP + FP); recall TP/(TP + FN); F1 = 2PR/(P + R); specificity TN/(TN + FP) |
| MLP parameters | Σ nₗ₋₁nₗ weights + Σ nₗ biases |
| Activations | ReLU continuous, not differentiable at 0, zero gradient when inactive; softmax shift-invariant |
| Backprop | Chain rule; inactive ReLU blocks gradients |
| k-means | Local minimum; centroid = mean; SSE non-increasing |
| k-medoids | Centres are data points; any dissimilarity; robust |
| Linkage | Single = min, complete = max; first merge is always the closest pair |
| PCA | Eigenvectors of the covariance; explained fraction λ₁/Σλ; mean squared projection on u₁ = λ₁; unsupervised |

# Artificial intelligence

| Topic | Fact |
|---|---|
| Uninformed search | BFS, UCS, DFS, depth-limited, IDS |
| BFS, IDS | Complete; optimal for equal costs; IDS memory O(bd), time O(bᵈ) |
| A* | f = g + h; admissible → optimal tree search; consistent → optimal graph search, f non-decreasing; h = 0 → UCS |
| Inadmissible h | A* may return a suboptimal path |
| Minimax / alpha–beta | Prune when α ≥ β; same value; best ordering ~ b^(m/2) |
| Logic | p → q ≡ ¬p ∨ q ≡ ¬q → ¬p; (p ∧ q) → r ≡ p → (q → r); De Morgan |
| Entailment | α ⊨ β iff α → β valid iff α ∧ ¬β unsatisfiable |
| CNF and resolution | Distribute ∨ over ∧; refutation derives the empty clause from KB ∧ ¬α |
| FOL | ∀ with →, ∃ with ∧; ¬∀ = ∃¬; ∃∀ ⊨ ∀∃ only; ∀ over ∧ and ∃ over ∨ distribute |
| Bayesian network | Joint = Π P(Xᵢ \| parents); CPT of a Boolean node with k Boolean parents needs 2ᵏ numbers |
| Independence | Chain and fork blocked by observing the middle; collider blocked unless it or a descendant is observed |
| Markov blanket | Parents, children, children's other parents |
| Exact inference | Enumeration, variable elimination (order matters; NP-hard in general) |
| Approximate inference | Prior, rejection, likelihood weighting, Gibbs (MCMC) |

# General Aptitude

| Topic | Rule |
|---|---|
| Successive change | +a% then −b%: multiply (1 + a)(1 − b) |
| Work | Rates add: 1/x + 1/y |
| Relative speed | Opposite directions add; same direction subtract; km/h × 5/18 = m/s |
| Interest | SI = PRT; CI: P(1 + r)ⁿ − P |
| Mixtures | Track the amount of the pure component |
| Clock angle | \|30H − 5.5M\| |
| Calendar | Ordinary year shifts the weekday by 1, leap year by 2 |
| Painted cube cut into n³ | Corners 8 (3 faces), edges 12(n − 2) (2 faces), faces 6(n − 2)² (1 face), inside (n − 2)³ |
| Squares in an n × n grid | Σ k² for k = 1 to n |
| Syllogisms | "Some A are B" + "All B are C" gives "Some A are C"; "All A are B" does not give "All B are A" |
| Verbal | "Neither … nor" agrees with the nearer subject; "the number of" is singular, "a number of" plural; "since" + point in time |
