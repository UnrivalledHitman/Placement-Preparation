# Artificial intelligence

## Set A1: Search

### Easy

**A1.E1** · MCQ · 1 mark. Which search strategy is informed? (A) A* (B) Breadth-first search (C) Depth-first search (D) Iterative deepening

**A1.E2** · NAT · 1 mark. A search tree has branching factor 3. How many nodes are there from the root down to depth 3 (root at depth 0)?

**A1.E3** · MCQ · 1 mark. Depth-first search keeps its frontier in (A) a priority queue on g (B) a queue (C) a stack (D) a priority queue on h

**A1.E4** · NAT · 1 mark. In A*, a node has g(n) = 5 and h(n) = 7. What is f(n)?

**A1.E5** · MSQ · 1 mark. Which heuristics are admissible for the 8-puzzle? (A) The constant 0 (B) Twice the sum of Manhattan distances (C) The number of misplaced tiles (D) The sum of Manhattan distances of the tiles

**A1.E6** · NAT · 1 mark. A complete game tree has branching factor 3 and depth 4. How many leaves does it have?

**A1.E7** · MCQ · 1 mark. A MAX root has three MIN children whose minimax values are 3, 7 and 2. The root's value is (A) 12 (B) 3 (C) 2 (D) 7

**A1.E8** · MSQ · 1 mark. With a finite branching factor and a goal at finite depth, which strategies are complete? (A) Uniform-cost search with positive step costs (B) Greedy best-first search on a graph with cycles and no repeated-state check (C) Iterative deepening (D) Breadth-first search

### Medium

**A1.M1** · NAT · 2 marks. Edges: S → A (2), S → B (5), A → B (1), A → G (7), B → G (3). Heuristic: h(S) = 4, h(A) = 4, h(B) = 2, h(G) = 0. What is the cost of the path A* returns from S to G?

**A1.M2** · MCQ · 2 marks. For the problem of A1.M1, A* (graph search) expands nodes in the order (A) S, A, B, G (B) S, B, A, G (C) S, A, G (D) S, B, G

**A1.M3** · MSQ · 2 marks. h is a consistent heuristic. Which statements are correct? (A) f(n) = g(n) + h(n) never decreases along a path (B) A* graph search may need to reopen closed nodes to stay optimal (C) h is admissible (D) h(goal) = 0

**A1.M4** · NAT · 2 marks. A MAX root has three MIN children, searched left to right, with leaves (5, 6), (3, x) and (7, 4). What is the root's minimax value?

**A1.M5** · MCQ · 2 marks. In A1.M4, how many leaves does alpha–beta pruning skip? (A) 1 (B) 0 (C) 2 (D) 3

**A1.M6** · NAT · 2 marks. Edges: S → A (1), S → B (4), A → B (2), B → G (1), A → G (6). What cost does uniform-cost search find for reaching G from S?

**A1.M7** · MSQ · 2 marks. Which statements about greedy best-first search are correct? (A) It expands the node with the smallest h(n) (B) It orders the frontier by g(n) (C) It is complete on every finite graph, even without repeated-state checking (D) It is not optimal in general

**A1.M8** · MCQ · 2 marks. With branching factor b and shallowest goal at depth d, iterative deepening search takes time (A) O(b^(2d)) (B) O(bᵈ) (C) O(d) (D) O(b·d)

**A1.M9** · NAT · 2 marks. Breadth-first search runs on a complete tree with branching factor 4. How many nodes are on level 3 (root at level 0)?

### Hard

**A1.H1** · NAT · 2 marks. A MAX root has two MIN children, each with three leaves, searched left to right: (4, 8, 9) and (3, p, q). How many leaves does alpha–beta evaluate?

**A1.H2** · MCQ · 2 marks. A MAX root has two MIN children with leaves (6, 9) and (y, x), searched left to right. Alpha–beta prunes the leaf x exactly when (A) always (B) y ≥ 6 (C) y ≤ 9 (D) y ≤ 6

**A1.H3** · MSQ · 2 marks. A heuristic is admissible but not consistent. Which statements are correct? (A) h(n) ≤ c(n, n′) + h(n′) holds for every edge (B) A* tree search still returns an optimal solution (C) A* graph search that never reopens closed nodes may return a suboptimal solution (D) f can decrease along a path

**A1.H4** · NAT · 2 marks. A game tree has a MAX root with two MIN children; each MIN node has two MAX children with two leaves each. Left to right, the leaves are 3, 5 | 2, 9 under the first MIN node and 0, 1 | 7, 4 under the second. What is the root's minimax value?

**A1.H5** · MCQ · 2 marks. h₁ and h₂ are admissible and h₂(n) ≥ h₁(n) for every n. Then A* with h₂ (A) may return a worse solution (B) expands no more nodes than with h₁ (C) always expands more nodes (D) is no longer optimal

**A1.H6** · NAT · 2 marks. Iterative deepening search runs on a tree with branching factor 2 until depth limit 3. Counting every node generation across all iterations, how many nodes are generated (the root counts once per iteration)?

**A1.H7** · MSQ · 2 marks. Which strategies are uninformed? (A) Uniform-cost search (B) Greedy best-first search (C) A* (D) Depth-limited search

## Set A2: Logic

### Easy

**A2.E1** · MCQ · 1 mark. p → q is equivalent to (A) p ∨ ¬q (B) ¬p ∨ q (C) q → p (D) ¬p → ¬q

**A2.E2** · NAT · 1 mark. How many rows does a truth table over 4 propositional variables have?

**A2.E3** · MCQ · 1 mark. The contrapositive of p → q is (A) p ∧ ¬q (B) q → p (C) ¬p → ¬q (D) ¬q → ¬p

**A2.E4** · NAT · 1 mark. How many of the four truth assignments to p and q satisfy p ∨ q?

**A2.E5** · MSQ · 1 mark. Which are tautologies? (A) p ∧ ¬p (B) (p ∧ q) → p (C) p ∨ ¬p (D) p → p

**A2.E6** · NAT · 1 mark. How many of the four truth assignments to p and q satisfy p ↔ q?

**A2.E7** · MCQ · 1 mark. ¬(p ∧ q) is equivalent to (A) ¬p ∧ q (B) ¬p ∧ ¬q (C) p ∨ q (D) ¬p ∨ ¬q

**A2.E8** · MSQ · 1 mark. Which formulas express "All dogs are animals"? (A) ∀x (Dog(x) ∧ Animal(x)) (B) ∀x (Dog(x) → Animal(x)) (C) ∃x (Dog(x) → Animal(x)) (D) ¬∃x (Dog(x) ∧ ¬Animal(x))

### Medium

**A2.M1** · NAT · 2 marks. How many of the 8 truth assignments to p, q and r satisfy (p → q) ∧ (q → r)?

**A2.M2** · MCQ · 2 marks. p → (q → r) is equivalent to (A) (p → q) → r (B) (p ∧ q) → r (C) (p ∨ q) → r (D) p ∧ q ∧ r

**A2.M3** · MSQ · 2 marks. α = p ∧ q and β = p ∨ q. Which statements are correct? (A) β ⊨ α (B) α ⊨ β (C) β → α is valid (D) α ∧ ¬β is unsatisfiable

**A2.M4** · NAT · 2 marks. Converting (p ∧ q) ∨ r to CNF by distribution gives how many clauses?

**A2.M5** · MCQ · 2 marks. ¬∀x P(x) is equivalent to (A) ¬∃x P(x) (B) ∀x ¬P(x) (C) ∃x ¬P(x) (D) ∃x P(x)

**A2.M6** · NAT · 2 marks. Resolving the clauses p ∨ q and ¬p ∨ r on p gives a clause with how many literals?

**A2.M7** · MSQ · 2 marks. Which sentences are valid in first-order logic (over non-empty domains)? (A) ∀y ∃x L(x, y) → ∃x ∀y L(x, y) (B) ∃x ∀y L(x, y) → ∀y ∃x L(x, y) (C) ∃x P(x) → ∀x P(x) (D) ∀x P(x) → ∃x P(x)

**A2.M8** · MCQ · 2 marks. "Some student is smart" is expressed by (A) ∃x (Student(x) ∧ Smart(x)) (B) ∃x (Student(x) → Smart(x)) (C) ∀x (Student(x) → Smart(x)) (D) ∀x (Student(x) ∧ Smart(x))

**A2.M9** · NAT · 2 marks. How many distinct Boolean functions of two variables are there?

### Hard

**A2.H1** · NAT · 2 marks. How many of the 8 truth assignments to p, q and r satisfy (p ∨ q) ∧ (¬p ∨ r) ∧ (¬q ∨ ¬r)?

**A2.H2** · MCQ · 2 marks. KB = {p → q, q → r, p}. Which sentence does KB entail? (A) r (B) ¬r (C) ¬p (D) q ∧ ¬r

**A2.H3** · MSQ · 2 marks. Which equivalences hold for all predicates P(x) and Q(x)? (A) ∀x (P ∧ Q) ≡ ∀x P ∧ ∀x Q (B) ∀x (P ∨ Q) ≡ ∀x P ∨ ∀x Q (C) ∃x (P ∧ Q) ≡ ∃x P ∧ ∃x Q (D) ∃x (P ∨ Q) ≡ ∃x P ∨ ∃x Q

**A2.H4** · NAT · 2 marks. Converting (p ∧ q) ∨ (r ∧ s) to CNF by distribution (without simplification) gives how many clauses?

**A2.H5** · MCQ · 2 marks. Resolution refutation shows KB ⊨ α by (A) showing KB ∧ α is satisfiable (B) deriving α from ¬KB (C) deriving the empty clause from KB ∧ ¬α (D) deriving the empty clause from KB alone

**A2.H6** · NAT · 2 marks. How many of the 8 truth assignments to p, q and r make p ⊕ q ⊕ r true (⊕ is exclusive or)?

**A2.H7** · MSQ · 2 marks. "A registered member gets a discount exactly when they pay early", with M = member, E = pays early, D = discount, is encoded as M → (D ↔ E). Which formulas are equivalent to it? (A) (M → D) ∧ (M → E) (B) (M ∧ E → D) ∧ (M ∧ ¬E → ¬D) (C) ¬M ∨ (D ↔ E) (D) M ∧ E → D

## Set A3: Reasoning under uncertainty

### Easy

**A3.E1** · MCQ · 1 mark. Inference by variable elimination in a Bayesian network is (A) a sampling method (B) approximate (C) exact (D) only for trees

**A3.E2** · NAT · 1 mark. A Boolean node has two Boolean parents. How many independent numbers does its conditional probability table need?

**A3.E3** · MCQ · 1 mark. In the chain A → B → C, once B is observed, A and C are (A) conditionally independent (B) always dependent (C) identical (D) mutually exclusive

**A3.E4** · NAT · 1 mark. P(A) = 0.3 and P(B | A) = 0.6. Find P(A ∧ B). (Round off to two decimal places)

**A3.E5** · MSQ · 1 mark. Which are approximate inference methods for Bayesian networks? (A) Rejection sampling (B) Likelihood weighting (C) Variable elimination (D) Gibbs sampling

**A3.E6** · NAT · 1 mark. How many independent numbers does the full joint distribution of 5 Boolean variables need?

**A3.E7** · MCQ · 1 mark. Gibbs sampling is a (A) Markov chain Monte Carlo method (B) exact inference method (C) search algorithm (D) clustering method

**A3.E8** · MSQ · 1 mark. A network has the v-structure A → C ← B and no other edges. Which statements are correct? (A) A and B are always independent given C (B) A and B are independent when C is not observed (C) A and B are dependent when C is not observed (D) Observing a descendant of C always keeps A and B independent

### Medium

**A3.M1** · NAT · 2 marks. The chain R → W → S has P(R) = 0.3, P(W | R) = 0.8, P(W | ¬R) = 0.2, P(S | W) = 0.9 and P(S | ¬W) = 0.1. Find P(S). (Round off to three decimal places)

**A3.M2** · MCQ · 2 marks. In the network of A3.M1, P(R | W) is closest to (A) 0.63 (B) 0.24 (C) 0.80 (D) 0.38

**A3.M3** · MSQ · 2 marks. Which statements about variable elimination are correct? (A) Its cost depends on the elimination order (B) It draws random samples from the network (C) It runs in polynomial time on every network (D) It computes exact answers

**A3.M4** · NAT · 2 marks. Boolean variables A and B are roots, C has parents A and B, and D has parent C. How many independent CPT numbers does the network need?

**A3.M5** · MCQ · 2 marks. Rejection sampling is used with evidence of prior probability 0.05. Roughly what fraction of the samples is kept? (A) All of them (B) 50% (C) 95% (D) 5%

**A3.M6** · NAT · 2 marks. Likelihood weighting in the network of A3.M1 generates a sample with W = true, and the evidence is S = true. What weight does the sample get? (Round off to one decimal place)

**A3.M7** · MSQ · 2 marks. Which nodes belong to the Markov blanket of X? (A) The other parents of X's children (B) All of X's ancestors (C) X's parents (D) X's children

**A3.M8** · MCQ · 2 marks. In the fork A ← B → C, which statement holds? (A) A and C are independent when B is unobserved (B) A and C are independent given B (C) A and C are dependent given B (D) None of these

**A3.M9** · NAT · 2 marks. In the network of A3.M1, find P(S | R). (Round off to two decimal places)

### Hard

**A3.H1** · NAT · 2 marks. Burglary B and earthquake E are independent causes of an alarm A, with P(B) = 0.1 and P(E) = 0.2. P(A | B, E) = 0.95, P(A | B, ¬E) = 0.9, P(A | ¬B, E) = 0.3 and P(A | ¬B, ¬E) = 0.01. Find P(B | A). (Round off to two decimal places)

**A3.H2** · MCQ · 2 marks. In the network of A3.H1, P(B | A, E) is closest to (A) 0.60 (B) 0.26 (C) 0.10 (D) 0.95

**A3.H3** · MSQ · 2 marks. In the network of A3.H1, which statements are correct? (A) Observing A makes B and E independent (B) P(B | A, E) < P(B | A) (C) B and E are dependent given A (D) B and E are independent a priori

**A3.H4** · NAT · 2 marks. In the network of A3.H1, Gibbs sampling resamples B given A = true and E = false. Find P(B = true | A = true, E = false). (Round off to two decimal places)

**A3.H5** · MCQ · 2 marks. Exact inference in general Bayesian networks is (A) equivalent to sorting (B) solvable in linear time (C) impossible (D) NP-hard

**A3.H6** · NAT · 2 marks. A Boolean node has three Boolean parents. How many independent numbers does its CPT need?

**A3.H7** · MSQ · 2 marks. Which statements about prior (forward) sampling are correct? (A) Its estimates converge as the number of samples grows (B) Its sample frequencies are unbiased estimates of joint probabilities (C) It samples variables in a topological order (D) It requires evidence variables
