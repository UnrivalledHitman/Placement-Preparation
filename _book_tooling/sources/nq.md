# How to use this practice book
%49 exercises matching the Mathematics and Statistics guide, with hints kept separate and every answer checked by code

Each part matches chapters of the **Mathematics and Statistics for Machine Learning** guide. Work on paper first: derive, then compute, then (and only then) write a short NumPy program that checks your answer independently. Every solution in this book does exactly that, and its output is shown.

| Type | What you do |
|---|---|
| Derivation | Prove or derive a result step by step |
| Numerical | Compute a number by hand (a calculator is fine) |
| Code | Write a program that computes or simulates something |
| Concept | Explain in words, as you would in an interview |

**Marking scheme.** Mark ✓ (solved alone), ~ (with the hint) or ✗ (needed the solution). For a Derivation, ✓ requires every step justified; for a Numerical, the right number **and** a numerical check that would have caught a wrong one. Redo every ~ and ✗ a week later.

| Part | Guide chapters | Topic | Exercises |
|---|---|---|---|
| 1 | 1–3 | Vectors, matrices, eigenvalues, SVD, PCA | 7 |
| 2 | 4 | Calculus and matrix calculus | 6 |
| 3 | 5 | Gradients of losses and back-propagation | 5 |
| 4 | 6 | Optimisation | 6 |
| 5 | 7–8 | Probability and limit theorems | 7 |
| 6 | 9 | Estimation | 6 |
| 7 | 10 | Statistical inference | 6 |
| 8 | 11–12 | Information theory and regression | 6 |

# Exercises

## Part 1: Linear algebra

**N1.1 · Easy · Numerical · Cosine similarity.** For **u** = (3, 4, 0) and **v** = (4, 0, 3), compute ‖**u**‖, ‖**v**‖, **u** · **v**, the cosine similarity and the angle in degrees. Then compute the projection of **v** onto **u**.

**N1.2 · Medium · Derivation · Inverse rules.** Prove that (**AB**)<sup>−1</sup> = **B**<sup>−1</sup>**A**<sup>−1</sup> and (**A**<sup>T</sup>)<sup>−1</sup> = (**A**<sup>−1</sup>)<sup>T</sup> for invertible square matrices. Check both on random 4 × 4 matrices.

**N1.3 · Medium · Numerical · Powers through eigenvalues.** For **A** = [[2, 1], [1, 2]], find the eigenvalues and unit eigenvectors by hand. Use them to compute **A**<sup>10</sup>(1, 0)<sup>T</sup> exactly, without multiplying ten matrices.

**N1.4 · Medium · Derivation · Gram matrices.** Prove that every eigenvalue of **A**<sup>T</sup>**A** is non-negative and that **A**<sup>T</sup>**A** and **A** have the same null space (hence the same rank). Check on a 6 × 4 matrix of rank 2.

**N1.5 · Hard · Code · PCA from scratch.** Generate 300 points in 3-D that lie close to a plane. Implement PCA with the SVD (no library PCA), print the explained-variance ratios, reconstruct the data from 2 components, and verify that the total squared reconstruction error equals (n − 1) times the discarded eigenvalue.

**N1.6 · Medium · Concept · Duplicate features.** A colleague adds a column that is an exact copy of another to a linear regression design matrix and calls `inv(X.T @ X)`. What goes wrong mathematically and numerically? What are two fixes?

**N1.7 · Hard · Derivation · Trace identities.** Prove trace(**AB**) = trace(**BA**) for **A** (m × n) and **B** (n × m). Use it to show that for a symmetric matrix the trace equals the sum of the eigenvalues, and that ‖**A**‖<sub>F</sub>² = trace(**A**<sup>T</sup>**A**) = Σσ<sub>i</sub>².

## Part 2: Calculus and matrix calculus

**N2.1 · Easy · Derivation · The tanh derivative.** Show that tanh′(x) = 1 − tanh²(x) and that tanh(x) = 2σ(2x) − 1. Check both numerically.

**N2.2 · Medium · Derivation · Logistic loss with ±1 labels.** With labels y ∈ {−1, +1}, the logistic loss is ℓ(**w**) = ln(1 + e<sup>−y **w**<sup>T</sup>**x**</sup>). Derive ∇ℓ and show it agrees with the (p − y)**x** form of Chapter 5 when labels are recoded to {0, 1}.

**N2.3 · Medium · Derivation · Ridge gradient.** Derive the gradient of L(**w**) = ‖**Xw** − **y**‖² + λ‖**w**‖², solve ∇L = **0**, and verify numerically that the gradient vanishes at your solution.

**N2.4 · Medium · Numerical · Classify the critical points.** Find and classify all critical points of f(x, y) = x³ − 3xy + y³ using the Hessian.

**N2.5 · Hard · Code · Catch the bug.** Write a reusable gradient checker that reports the relative error. Use it on the softmax cross-entropy loss with a correct gradient and with a buggy one (the common bug: forgetting to subtract the one-hot label), and show the checker's verdict for each.

**N2.6 · Medium · Derivation · A layer's Jacobian.** For **h** = σ(**Wx**) with σ applied element-wise, derive the Jacobian ∂**h**/∂**x** and ∂h<sub>i</sub>/∂W<sub>ij</sub>. Check with finite differences.

## Part 3: Gradients of losses and back-propagation

**N3.1 · Easy · Derivation · Bias gradients sum.** For a layer **Z** = **XW** + **1b**<sup>T</sup> applied to a batch, show that ∂L/∂**b** is the sum of the rows of ∂L/∂**Z**, and ∂L/∂**W** = **X**<sup>T</sup>(∂L/∂**Z**).

**N3.2 · Medium · Numerical · Sigmoid with squared error.** For y = 1 and z ∈ {0, −3, −6}, compute ∂ℓ/∂z for (a) squared error (σ(z) − y)² and (b) binary cross-entropy. By what factor is the squared-error gradient smaller at z = −6?

**N3.3 · Hard · Code · Back-propagation for regression.** Implement forward and backward passes for a network 3 → 8 (tanh) → 1 (linear) with mean squared error on a batch of 16. Check every gradient with central differences.

**N3.4 · Medium · Derivation · Weight decay.** Show that gradient descent on L(**w**) + λ‖**w**‖² is the same as first shrinking **w** by a factor (1 − 2ηλ) and then taking an ordinary gradient step on L. Check numerically for one step.

**N3.5 · Medium · Numerical · Initialisation variances.** Compute the Xavier variance 2/(n<sub>in</sub> + n<sub>out</sub>) for a 512 → 256 tanh layer and the He variance 2/n<sub>in</sub> for a 512-input ReLU layer, with their standard deviations. Then simulate 20 ReLU layers of width 512 with He initialisation and report the activation scale.

## Part 4: Optimisation

**N4.1 · Easy · Numerical · Step-size limits.** For L(**w**) = ½**w**<sup>T</sup>**Aw** with **A** = diag(4, 1): what is the largest stable learning rate, the optimal one, and the error-shrink factor per step at the optimum? Confirm by running gradient descent.

**N4.2 · Medium · Derivation · Newton on a quadratic.** Prove that one Newton step from any starting point lands exactly on the minimum of f(**w**) = ½**w**<sup>T</sup>**Aw** − **b**<sup>T</sup>**w** with **A** positive definite. Check on a random 5-D example.

**N4.3 · Medium · Concept · A non-convex loss.** Show that f(w<sub>1</sub>, w<sub>2</sub>) = (w<sub>1</sub>w<sub>2</sub> − 1)² is not convex, using one chord and the Hessian at the origin. Why does this function model what happens in matrix factorisation and deep networks?

**N4.4 · Medium · Code · Rosenbrock.** Minimise the Rosenbrock function f(x, y) = (1 − x)² + 100(y − x²)² from (−1.5, 2) with plain gradient descent, momentum and Adam, 5,000 steps each, and report the distance to the minimum (1, 1). Explain the result using the condition number.

**N4.5 · Hard · Derivation · Constrained maximum.** Maximise **w**<sup>T</sup>**Cw** subject to ‖**w**‖ = 1 for **C** = [[2, 1], [1, 2]] using a Lagrange multiplier. Interpret the answer as PCA and check by sweeping the unit circle.

**N4.6 · Medium · Numerical · Adam's start-up bias.** With β<sub>1</sub> = 0.9 and a constant gradient g = 1, compute the raw first moment m after 1, 2, 3 and 10 steps, and the bias-corrected values.

## Part 5: Probability and limit theorems

**N5.1 · Easy · Numerical · Conditional dice.** Two fair dice are rolled. What is P(sum = 7 \| at least one six)? Check by simulation.

**N5.2 · Medium · Numerical · A one-word spam filter.** 20% of mail is spam. The word "offer" appears in 60% of spam and 5% of genuine mail. What is P(spam \| "offer")? Check by simulation.

**N5.3 · Medium · Derivation · Averaging correlated models.** n models each have prediction variance σ², with pairwise correlation ρ between their errors. Derive the variance of their average, and its limit as n → ∞. Check by simulation with ρ = 0.3. What does this say about ensembles and random forests?

**N5.4 · Medium · Numerical · Waiting times.** (a) With P(heads) = 0.2, what is the expected number of tosses until the first head? (b) With a fair coin, what is the expected number of tosses until two heads in a row? Derive both and simulate.

**N5.5 · Hard · Derivation · Memorylessness.** Prove that the exponential distribution is memoryless, P(T > s + t \| T > s) = P(T > t), and show by simulation that a uniform waiting time is not.

**N5.6 · Medium · Numerical · Test-set precision.** A model scores 85% accuracy on 1,000 test examples. Give the standard error and an approximate 95% interval. How many examples would bring the standard error down to 0.5 percentage points?

**N5.7 · Medium · Code · Variance of a sum.** For **X** ~ N(**0**, **Σ**) with **Σ** = [[4, −1.5], [−1.5, 1]], predict Var(X<sub>1</sub> + X<sub>2</sub>), Var(X<sub>1</sub> − X<sub>2</sub>) and Corr(X<sub>1</sub>, X<sub>2</sub>), then sample with a Cholesky factor and check.

## Part 6: Estimation

**N6.1 · Easy · Derivation · Geometric MLE.** For i.i.d. geometric observations (number of trials until the first success), derive the MLE of p. Check with a numerical optimiser.

**N6.2 · Medium · Derivation · The uniform MLE is biased.** For x<sub>i</sub> ~ Uniform(0, θ), show the MLE is max x<sub>i</sub>, derive E[max] = nθ/(n + 1), and propose an unbiased version. Simulate with θ = 10, n = 5.

**N6.3 · Medium · Derivation · MAP for a Gaussian mean.** With x<sub>i</sub> ~ N(μ, σ²), σ known, and prior μ ~ N(0, τ²), derive the MAP estimate and show it shrinks the sample mean towards 0. Check with an optimiser.

**N6.4 · Medium · Numerical · Beta posterior.** With a uniform Beta(1, 1) prior, a new button gets 3 clicks in 10 views. Give the posterior, its mean, its mode, and P(rate > 0.5).

**N6.5 · Hard · Code · Shrinkage beats unbiasedness.** For estimating μ from n samples, consider c·x̄. Derive the c that minimises the MSE, and simulate the MSE of x̄ and of the optimally shrunk estimator for μ = 1, σ = 3, n = 10.

**N6.6 · Medium · Concept · Laplace smoothing.** Explain, using MAP, why Naive Bayes text classifiers use add-one smoothing, what goes wrong without it, and what the prior is saying.

## Part 7: Statistical inference

**N7.1 · Easy · Numerical · A t interval.** A sample of 16 response times has mean 52 ms and standard deviation 8 ms. Give the 95% confidence interval for the mean.

**N7.2 · Medium · Numerical · An A/B test.** Control converts 200 of 4,000 visitors; the variant converts 250 of 4,000. Compute the two-proportion z statistic and the two-sided p-value, and a 95% interval for the lift.

**N7.3 · Medium · Numerical · Sample size.** How many visitors per arm are needed to detect an improvement from a 5% to a 6% conversion rate with α = 0.05 (two-sided) and 80% power? Confirm by simulation.

**N7.4 · Hard · Code · The peeking problem.** Simulate A/A tests (no real difference) where the analyst checks the p-value after every 100 visitors per arm, up to 5,000, and stops at the first p < 0.05. What false-positive rate results?

**N7.5 · Medium · Code · Paired versus unpaired.** Two models are evaluated on the same 40 test examples; model B's loss is lower by 0.05 on average, but examples vary in difficulty much more than that. Compare the p-values of an unpaired and a paired t-test, and explain the difference.

**N7.6 · Medium · Concept · Reading a p-value.** A report says "p = 0.03, so there is a 97% chance the new model is better." List what is wrong with this, and write a correct one-sentence interpretation.

## Part 8: Information theory and regression

**N8.1 · Easy · Numerical · Entropy, cross-entropy, KL.** For P = (0.5, 0.25, 0.25) and the uniform Q = (1/3, 1/3, 1/3), compute H(P), H(P, Q) and KL(P ‖ Q) in bits, and confirm H(P, Q) = H(P) + KL.

**N8.2 · Medium · Numerical · Perplexity.** A language model's per-token probabilities for the correct next token over a 6-token sentence are 0.5, 0.25, 0.1, 0.4, 0.05 and 0.3. Compute the average cross-entropy in nats and the perplexity.

**N8.3 · Medium · Derivation · Binary cross-entropy is minimised at the truth.** For a true probability p and a predicted q, show that the expected binary cross-entropy is minimised at q = p, and that the excess loss is KL(Ber(p) ‖ Ber(q)).

**N8.4 · Medium · Derivation · Simple regression.** For y ≈ a + bx, derive b = Cov(x, y)/Var(x) and a = ȳ − b x̄ from the normal equations, and show that R² equals the squared correlation.

**N8.5 · Hard · Code · Ridge through the SVD.** Show that the ridge solution equals **V** diag(σ<sub>i</sub>/(σ<sub>i</sub>² + λ)) **U**<sup>T</sup>**y**. Then choose λ by 5-fold cross-validation for a degree-12 polynomial fitted to 30 noisy points.

**N8.6 · Medium · Concept · R² never falls.** Explain why adding any feature, even pure noise, can never decrease the training R² of least squares. Demonstrate by adding 20 random features, and show how adjusted R² and a held-out set reveal the problem.
