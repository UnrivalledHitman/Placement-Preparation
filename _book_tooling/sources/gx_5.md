## Set L4: LU, SVD and least squares

### Easy

**L4.E1** · MCQ · 1 mark. In the factorisation A = LU produced by Gaussian elimination without row swaps, L is (A) upper triangular (B) lower triangular with ones on the diagonal (C) orthogonal (D) diagonal

**L4.E2** · NAT · 1 mark. Find the largest singular value of diag(3, −4).

**L4.E3** · MCQ · 1 mark. The rank of a matrix equals (A) its largest singular value (B) the number of its positive eigenvalues (C) its trace (D) the number of its non-zero singular values

**L4.E4** · NAT · 1 mark. Fit y = wx (through the origin) to the points (1, 1) and (2, 3) by least squares. Find w. (Round off to one decimal place)

**L4.E5** · MSQ · 1 mark. A = UΣVᵀ is a singular value decomposition of a real matrix. Which are correct? (A) Every singular value is ≥ 0 (B) The squared singular values are eigenvalues of AᵀA (C) Every square matrix has an SVD with U = V (D) U and V are diagonal

**L4.E6** · MCQ · 1 mark. The spectral norm ‖A‖₂ of A = diag(2, 5, 1) is (A) 8 (B) 2 (C) 5 (D) √30

**L4.E7** · MCQ · 1 mark. The least-squares solution of Ax = b satisfies (A) Ax = b (B) AAᵀx = b (C) x = Aᵀb (D) AᵀAx = Aᵀb

**L4.E8** · NAT · 1 mark. Gaussian elimination on [[2, 1], [6, 5]] gives A = LU. Find the entry U₂₂.

### Medium

**L4.M1** · NAT · 2 marks. Find the largest singular value of [[1, 1], [1, 1]].

**L4.M2** · MCQ · 2 marks. For A = [[1, 2], [3, 4]] = LU with L unit lower triangular, U is (A) [[1, 2], [0, −2]] (B) [[1, 2], [0, 2]] (C) [[1, 0], [3, −2]] (D) [[3, 4], [0, 2/3]]

**L4.M3** · MSQ · 2 marks. The line y = a + bx is fitted to (1, 2), (2, 3), (3, 5) and (4, 6) by least squares. Which statements are correct? (A) The line passes through (x̄, ȳ) = (2.5, 4) (B) b = 1.4 (C) The residuals sum to 0.2 (D) a = 0.5

**L4.M4** · MSQ · 2 marks. A is a 4 × 3 matrix of rank 3. Which are correct? (A) Ax = b has a solution for every b (B) A has exactly 4 non-zero singular values (C) AᵀA is invertible (D) The least-squares solution of Ax = b is unique

**L4.M5** · NAT · 2 marks. Find the Frobenius-norm error of the best rank-1 approximation of diag(5, 3, 1). (Round off to two decimal places)

**L4.M6** · MCQ · 2 marks. Every singular value of an orthogonal matrix equals (A) 1 (B) 0 (C) ±1 (D) the matching eigenvalue

**L4.M7** · NAT · 2 marks. A = LU, where L is unit lower triangular and U is upper triangular with diagonal 2, −3 and 4. Find det A.

**L4.M8** · NAT · 2 marks. For the fit of L4.M3, find the residual sum of squares. (Round off to one decimal place)

**L4.M9** · MCQ · 2 marks. You must solve Ax = b for 50 different vectors b with the same n × n matrix A. The most efficient approach is (A) Gaussian elimination from scratch for each b (B) factor A = LU once, then two triangular solves per b (C) compute A⁻¹ by cofactors (D) Cramer's rule

### Hard

**L4.H1** · NAT · 2 marks. Find the ratio σ₁/σ₂ of the singular values of [[2, 2], [−1, 1]].

**L4.H2** · MSQ · 2 marks. A = uvᵀ with u = (1, 2, 2)ᵀ and v = (3, 4)ᵀ. Which statements are correct? (A) A is 3 × 2 (B) rank(A) = 1 (C) AᵀA has eigenvalues 15 and 0 (D) The largest singular value is 15

**L4.H3** · MCQ · 2 marks. A real symmetric matrix has eigenvalues 3, −5 and 0. Its singular values are (A) 3, −5, 0 (B) 9, 25, 0 (C) 5, 3, 0 (D) √3, √5, 0

**L4.H4** · NAT · 2 marks. Gaussian elimination on an n × n matrix costs about (2/3)n³ operations. By what factor does the cost grow when n doubles?

**L4.H5** · MSQ · 2 marks. A is m × n (m > n) with orthonormal columns. Which are correct for the least-squares problem Ax ≈ b? (A) x̂ = Aᵀb (B) AᵀA = I (C) The projection of b onto the column space is AAᵀb (D) AAᵀ = I

**L4.H6** · NAT · 2 marks. Fit y = wx (through the origin) to (2, 3), (3, 5) and (4, 9) by least squares. Find w. (Round off to three decimal places)

**L4.H7** · MSQ · 2 marks. Centred data have a covariance matrix with eigenvalues 9, 4 and 1. Which statements are correct? (A) The total variance is 9 (B) The third component explains 1/9 of the variance (C) The first two principal components explain about 93% of the variance (D) The first component explains 9/13 of the variance

# Calculus and optimisation

## Set C1: Limits, continuity, differentiability and series

### Easy

**C1.E1** · MCQ · 1 mark. lim_(x→0) sin(3x)/x is (A) 3 (B) 1 (C) 0 (D) ∞

**C1.E2** · NAT · 1 mark. Find lim_(x→2) (x² − 4)/(x − 2).

**C1.E3** · MCQ · 1 mark. At x = 0, f(x) = |x| is (A) differentiable (B) discontinuous (C) continuous but not differentiable (D) neither continuous nor differentiable

**C1.E4** · NAT · 1 mark. Find Σₖ₌₀^∞ (1/3)ᵏ. (Round off to one decimal place)

**C1.E5** · MSQ · 1 mark. Which functions are differentiable at every real x? (A) x³ (B) |x| (C) eˣ (D) max(x, 0)

**C1.E6** · NAT · 1 mark. Find the coefficient of x³ in the Maclaurin series of eˣ. (Round off to three decimal places)

**C1.E7** · MCQ · 1 mark. lim_(x→∞) (2x² + 3)/(x² − 1) is (A) 0 (B) 3 (C) 2 (D) ∞

**C1.E8** · MCQ · 1 mark. For f(x) = x³ − 2x, f′(2) is (A) 12 (B) 8 (C) 10 (D) 6

### Medium

**C1.M1** · NAT · 2 marks. Find lim_(x→∞) (√(x² + 6x) − x).

**C1.M2** · MCQ · 2 marks. lim_(x→0) (1 − cos x)/x² is (A) 0 (B) 1 (C) 2 (D) 1/2

**C1.M3** · MSQ · 2 marks. f(x) = sin x. Which statements are correct? (A) f⁽¹⁵⁾(0) = 1/15! (B) f⁽¹⁵⁾(0) = −1 (C) f⁽⁴⁾(x) = sin x (D) f⁽¹⁴⁾(0) = 0

**C1.M4** · MSQ · 2 marks. f : ℝ → ℝ is differentiable at c. Which of these are always differentiable at c? (A) e^f (B) 1/(1 + f²) (C) |f| (D) √f

**C1.M5** · NAT · 2 marks. Find Σₖ₌₁^∞ k/2ᵏ.

**C1.M6** · MCQ · 2 marks. f(x) = x² sin(1/x) for x ≠ 0 and f(0) = 0. Which is correct? (A) f is not continuous at 0 (B) f is continuous but not differentiable at 0 (C) f′ is continuous at 0 (D) f is differentiable at 0 with f′(0) = 0

**C1.M7** · MSQ · 2 marks. Which limits are correct? (A) lim (1 + 1/n)²ⁿ = e (B) lim (1 − 1/n)ⁿ = e (C) lim (1 + 1/n²)ⁿ = e (D) lim (1 + 2/n)ⁿ = e²

**C1.M8** · NAT · 2 marks. Find Σᵢ₌₁^∞ Σⱼ₌₀^∞ 2^(−i) 3^(−j). (Round off to one decimal place)

**C1.M9** · MCQ · 2 marks. lim_(x→0) (ln(1 + x) − x)/x² is (A) 1/2 (B) 0 (C) −1/2 (D) −1

### Hard

**C1.H1** · NAT · 2 marks. f : ℝ → ℝ satisfies |f(x) − f(y)| ≤ |x − y|^1.5 for all x, y, and f(0) = 3. Find f(7).

**C1.H2** · NAT · 2 marks. Find lim_(n→∞) Σₖ₌₀ⁿ (−2)ᵏ/k!. (Round off to three decimal places)

**C1.H3** · MCQ · 2 marks. For f(x) = x|x|, which is correct? (A) f is not differentiable at 0 (B) f is differentiable everywhere, but f′ is not differentiable at 0 (C) f is discontinuous at 0 (D) f is twice differentiable everywhere

**C1.H4** · MSQ · 2 marks. The first-order Taylor polynomial of √x about x = 4 is used to estimate √4.1. Which statements are correct? (A) The tangent line is y = 2 + (x − 4)/4 (B) The estimate is 2.025 (C) The error is exactly 0 (D) The estimate is larger than the true value

**C1.H5** · MSQ · 2 marks. Which series converge? (A) Σ n!/2ⁿ (B) Σ (−1)ⁿ/n (C) Σ 1/n² (D) Σ 1/n

**C1.H6** · NAT · 2 marks. Find lim_(x→0⁺) xˣ.

**C1.H7** · NAT · 2 marks. Evaluate the third-degree Maclaurin polynomial of e^(2x) at x = 0.5. (Round off to two decimal places)

## Set C2: Maxima, minima, convexity and optimisation

### Easy

**C2.E1** · MCQ · 1 mark. The minimum value of f(x) = x² − 4x + 7 is (A) 7 (B) 3 (C) 2 (D) −4

**C2.E2** · NAT · 1 mark. At what x does f(x) = −x² + 6x attain its maximum?

**C2.E3** · MCQ · 1 mark. At a critical point c with f″(c) < 0, f has (A) a local maximum (B) a local minimum (C) an inflection point (D) no information

**C2.E4** · NAT · 1 mark. Find the maximum value of f(x) = x(10 − x).

**C2.E5** · MSQ · 1 mark. Which functions are convex on ℝ? (A) eˣ (B) sin x (C) −|x| (D) x²

**C2.E6** · NAT · 1 mark. Find the minimum of f(x) = x + 4/x for x > 0.

**C2.E7** · MCQ · 1 mark. One step of gradient descent with learning rate η for minimising f is (A) x ← x − ηf′(x) (B) x ← ηf′(x) (C) x ← x + ηf′(x) (D) x ← x − f(x)

**C2.E8** · MCQ · 1 mark. The number of critical points of f(x) = x³ − 3x is (A) 2 (B) 1 (C) 0 (D) 3

### Medium

**C2.M1** · MSQ · 2 marks. f(x) = x³ − 3x on [−2, 3]. Which statements are correct? (A) The global minimum is −2, attained at x = −2 and at x = 1 (B) The global maximum is at a critical point (C) The global maximum is 18, at x = 3 (D) f has a local maximum at x = −1

**C2.M2** · MCQ · 2 marks. At x = 0, f(x) = x⁴ has (A) no extremum, because f″(0) = 0 (B) a local minimum (C) a local maximum (D) an inflection point

**C2.M3** · NAT · 2 marks. Find the largest area of a rectangle with perimeter 40.

**C2.M4** · MSQ · 2 marks. f is twice differentiable with f″(x) > 0 for all x. Which are always true? (A) f has a minimum (B) f has exactly one critical point (C) f′ is strictly increasing (D) Any local minimum of f is a global minimum

**C2.M5** · NAT · 2 marks. Gradient descent on f(w) = (w − 5)² with η = 0.25 starts at w = 0. Find w after two steps. (Round off to two decimal places)

**C2.M6** · MCQ · 2 marks. Gradient descent on f(w) = 2w² converges from every starting point exactly when the learning rate η satisfies 0 < η < (A) 0.5 (B) 0.25 (C) 1 (D) 2

**C2.M7** · NAT · 2 marks. Find the minimum value of f(x) = x ln x for x > 0. (Round off to two decimal places)

**C2.M8** · MSQ · 2 marks. f(x) = 2x³ − 9x² + 12x on [0, 3]. Which statements are correct? (A) The minimum is 0, at x = 0 (B) The maximum is 9, at x = 3 (C) f has a local maximum at x = 2 (D) The critical points are 1 and 2

**C2.M9** · MCQ · 2 marks. f(x) = e^(−x²) has (A) a minimum at 0 (B) no extremum (C) a maximum at 0 (D) maxima at ±1

### Hard

**C2.H1** · NAT · 2 marks. Find the shortest distance from the point (0, 3) to the curve y = x². (Round off to two decimal places)

**C2.H2** · NAT · 2 marks. Find the global maximum of f(x) = x³/3 − 2x² + 3x + 1 on [−1, 5]. (Round off to two decimal places)

**C2.H3** · MCQ · 2 marks. f and g are convex functions on ℝ. Which is always convex? (A) fg (B) f + g (C) f ∘ g (D) f − g

**C2.H4** · NAT · 2 marks. Newton's method for x² − 2 = 0 starts at x₀ = 1. Find x₂. (Round off to four decimal places)

**C2.H5** · MSQ · 2 marks. For f(x) = x⁴ − 4x³, which are correct? (A) x = 0 is a local extremum (B) The global minimum is at x = 3 (C) f is convex on ℝ (D) f has exactly two critical points

**C2.H6** · MSQ · 2 marks. Equal squares of side x are cut from the corners of a 12 × 12 sheet and the sides folded up to make an open box. Which statements are correct? (A) The volume is V(x) = x(12 − 2x)² (B) x = 6 gives a local maximum of V (C) V is largest at x = 2 (D) The largest volume is 128

**C2.H7** · NAT · 2 marks. Gradient descent on f(w) = w² with η = 0.9 starts at w = 10. After how many steps is |w| < 1 for the first time?
