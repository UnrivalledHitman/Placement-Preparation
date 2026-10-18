# Chapter 15: Supervised Learning
%Linear, multiple and ridge regression, logistic regression, k-NN, naive Bayes, LDA, SVM, decision trees, bias–variance, cross-validation and metrics

## 15.1 Linear regression

**Simple linear regression** fits y = β₀ + β₁x by minimising the sum of squared residuals:

β₁ = Sₓᵧ/Sₓₓ = Σ(xᵢ − x̄)(yᵢ − ȳ)/Σ(xᵢ − x̄)², and β₀ = ȳ − β₁x̄.

The fitted line passes through (x̄, ȳ), and the residuals sum to zero. **Through the origin** (no intercept), β = Σxᵢyᵢ/Σxᵢ².

**Multiple regression** in matrix form: β̂ = (XᵀX)⁻¹Xᵀy, the normal equations of Chapter 6. R² = 1 − SSres/SStot measures the fraction of variance explained.

**Ridge regression** adds an L2 penalty: minimise Σ(yᵢ − xᵢᵀβ)² + λ‖β‖², giving β̂ = (XᵀX + λI)⁻¹Xᵀy. The penalty shrinks coefficients towards zero (never exactly to zero), **raising bias and lowering variance**, and makes XᵀX + λI invertible even when features are collinear. **Lasso** uses the L1 penalty λΣ|βⱼ|, which can set coefficients exactly to zero.

### Worked example: a regularised loss for one sample

*A model predicts ŷ = wᵀx with w = (2, −1) and x = (3, 1); the true y = 4. The loss is the absolute error plus 0.5‖w‖². Find it. (NAT)*

ŷ = 6 − 1 = 5, so the absolute error is |5 − 4| = 1. ‖w‖² = 4 + 1 = 5, so the penalty is 2.5. Total 3.5.

```python run Least squares by formula and by scikit-learn, and ridge shrinkage
import numpy as np
from sklearn.linear_model import LinearRegression, Ridge

x = np.array([1., 2, 3, 4, 5]); y = np.array([2., 4, 5, 4, 5])
b1 = ((x - x.mean()) * (y - y.mean())).sum() / ((x - x.mean()) ** 2).sum()
b0 = y.mean() - b1 * x.mean()
lr = LinearRegression().fit(x[:, None], y)
print(f'formula: b0 = {b0:.2f}, b1 = {b1:.2f} | sklearn: {lr.intercept_:.2f}, '
        f'{lr.coef_[0]:.2f}')
print(f'residuals sum to {((y - b0 - b1 * x)).sum():.1e}; R^2 = '
        f'{lr.score(x[:, None], y):.3f}')
for lam in (0, 1, 10, 100):
    print(f'ridge lambda = {lam:3}: slope '
            f'{Ridge(alpha=lam).fit(x[:, None], y).coef_[0]:.3f}')
w, xs = np.array([2., -1]), np.array([3., 1])
print('regularised loss:', abs(w @ xs - 4) + 0.5 * (w @ w))
```

## 15.2 Logistic regression

Logistic regression models P(y = 1 | x) = σ(wᵀx + b), with σ(z) = 1/(1 + e^(−z)). The **decision boundary** wᵀx + b = 0 is linear. It is trained by minimising the cross-entropy (log loss), which is convex, so gradient descent finds the global minimum. σ(0) = 0.5, and σ′(z) = σ(z)(1 − σ(z)).

The **perceptron** update w ← w + yᵢxᵢ, b ← b + yᵢ for a misclassified (xᵢ, yᵢ) increases yᵢ(wᵀxᵢ + b) by ‖xᵢ‖² + 1, moving the score towards the correct sign.

## 15.3 k-nearest neighbours and naive Bayes

**k-NN** classifies by majority vote among the k nearest training points. It has no training step, is sensitive to feature scaling, and k trades variance (small k) against bias (large k). With k = 1 the training error is zero.

**Naive Bayes** assumes features are conditionally independent given the class:

P(y | x₁, …, xₙ) ∝ P(y) Π P(xⱼ | y).

Predict the class with the larger posterior. The **probability of misclassification** for a given x is the smaller posterior.

### Worked example: a naive Bayes posterior

*Priors P(spam) = 0.3, P(ham) = 0.7. For an email x, P(x | spam) = 0.6 and P(x | ham) = 0.1. Classify x and give the probability of misclassifying it. (NAT)*

Unnormalised: spam 0.18, ham 0.07. The posterior of spam is 0.18/0.25 = 0.72, so predict spam; the misclassification probability is 0.28.

## 15.4 Linear discriminant analysis and the nearest-mean classifier

**LDA** models each class as Gaussian with a **shared** covariance Σ. The log-ratio of posteriors is then linear in x, so the boundary is a hyperplane. With unequal covariances the boundary becomes quadratic (QDA).

The **nearest-mean classifier** assigns x to the class with the closer mean. Its rule ‖x − μ₁‖² − ‖x − μ₂‖² < 0 expands to 2(μ₂ − μ₁)ᵀx + ‖μ₁‖² − ‖μ₂‖² < 0, which is **linear** in x: the x-squared terms cancel.

LDA is also used for **dimensionality reduction**: it projects onto at most (classes − 1) directions that best separate the class means relative to the within-class spread. Unlike PCA, it uses the labels.

## 15.5 Support vector machines

A hard-margin SVM finds the separating hyperplane wᵀx + b = 0 with the largest margin: minimise ½‖w‖² subject to yᵢ(wᵀxᵢ + b) ≥ 1. The margin (the distance between the two supporting hyperplanes) is **2/‖w‖**. Only the **support vectors**, the points with yᵢ(wᵀxᵢ + b) = 1, determine the solution. A soft margin adds slack variables with penalty C. Kernels replace dot products to give non-linear boundaries.

### Worked example: a hard-margin SVM by symmetry

*Class +1: (2, 2) and (3, 3). Class −1: (0, 0) and (−1, 0). Find the SVM's w, b and margin. (MSQ-style)*

The closest opposite pair is (2, 2) and (0, 0). The boundary is their perpendicular bisector, x₁ + x₂ = 2, so w ∝ (1, 1). Scaling so that the support vectors give ±1: w = (1/2, 1/2), b = −1, since (2, 2) gives 2 − 1 = 1 and (0, 0) gives −1. The margin is 2/‖w‖ = 2/(1/√2) = 2√2 ≈ 2.83, which is the distance between (0, 0) and (2, 2).

```python run SVM, naive Bayes and nearest-mean checks
import numpy as np
from sklearn.svm import SVC

X = np.array([[2, 2], [3, 3], [0, 0], [-1, 0]]); y = np.array([1, 1, -1, -1])
svm = SVC(kernel='linear', C=1e6).fit(X, y)
w = svm.coef_[0]
print('w =', np.round(w, 4), 'b =', round(svm.intercept_[0], 4), 'margin =',
        round(2 / np.linalg.norm(w), 4),
      'support vectors:', svm.support_vectors_.tolist())
post_spam = 0.3 * 0.6 / (0.3 * 0.6 + 0.7 * 0.1)
print(f'naive Bayes: P(spam | x) = {post_spam:.2f}, misclassification {1 - post_spam:.2f}')
rng = np.random.default_rng(0)
m1, m2 = np.array([1., 2]), np.array([4., 0])
pts = rng.normal(size=(5, 2)) * 3
f = lambda p: np.sum((p - m1) ** 2) - np.sum((p - m2) ** 2)
lin = lambda p: 2 * (m2 - m1) @ p + m1 @ m1 - m2 @ m2
print('nearest-mean rule is linear:', np.allclose([f(p) for p in pts], [lin(p)
        for p in pts]))
```

## 15.6 Decision trees

A tree splits on the feature that most reduces impurity. For class proportions p₁, …, pₖ at a node:

| Measure | Formula | Pure node | 50/50 binary node |
|---|---|---|---|
| Entropy | −Σ pᵢ log₂ pᵢ | 0 | 1 |
| Gini index | 1 − Σ pᵢ² | 0 | 0.5 |
| Misclassification error | 1 − max pᵢ | 0 | 0.5 |

**Information gain** = entropy(parent) − Σ (nⱼ/n) entropy(childⱼ). Deep trees overfit; pruning, depth limits and minimum leaf sizes control variance. Random forests average many trees grown on bootstrap samples with random feature subsets.

### Worked example: information gain

*A node has 6 positive and 2 negative examples. A split sends 4 positive to the left, and 2 positive and 2 negative to the right. Find the information gain. (NAT)*

Parent entropy: −(3/4)log₂(3/4) − (1/4)log₂(1/4) ≈ 0.811. Left is pure (0); right is 50/50 (1). Weighted child entropy = (4/8)(0) + (4/8)(1) = 0.5. Gain ≈ 0.311.

## 15.7 Bias, variance and cross-validation

Expected test error = bias² + variance + irreducible noise. Simple models have high bias; flexible models have high variance. Regularisation, more data and ensembles (bagging) reduce variance; richer models and boosting reduce bias.

| Method | Splits | Notes |
|---|---|---|
| Hold-out | One train/validation split | Fast, noisy estimate |
| k-fold CV | k splits, each fold validates once | k = 5 or 10 is typical |
| Leave-one-out (LOOCV) | n splits for n training points | Nearly unbiased, expensive, high variance |

If 1000 samples exist and 100 are set aside for testing first, LOOCV on the remaining 900 creates **900** validation splits.

## 15.8 Evaluation metrics

For a positive class: precision = TP/(TP + FP), recall = TP/(TP + FN), F1 = 2PR/(P + R), accuracy = (TP + TN)/total. Precision and recall are per class; swap the roles to get the other class's values.

### Worked example: a confusion matrix

*40 emails are ham and 10 spam. The classifier labels 4 ham emails as spam and 3 spam emails as ham. Find accuracy, and precision and recall for each class. (MSQ-style)*

Correct: 36 ham + 7 spam = 43, so accuracy = 43/50 = 0.86. Spam: predicted spam = 7 + 4 = 11, precision 7/11 ≈ 0.64, recall 7/10 = 0.7. Ham: predicted ham = 36 + 3 = 39, precision 36/39 ≈ 0.92, recall 36/40 = 0.9.

```python run Information gain and the confusion matrix
from math import log2
from sklearn.metrics import precision_score, recall_score, accuracy_score

H = lambda *p: -sum(q * log2(q) for q in p if q > 0)
parent = H(6 / 8, 2 / 8)
print(f'parent entropy {parent:.3f}, gain {parent - 0.5 * H(1.0) - 0.5 * H(0.5, 0.5):.3f}')
y_true = ['ham'] * 40 + ['spam'] * 10
y_pred = ['spam'] * 4 + ['ham'] * 36 + ['ham'] * 3 + ['spam'] * 7
print('accuracy', accuracy_score(y_true, y_pred))
for c in ('spam', 'ham'):
    print(f'{c}: precision {precision_score(y_true, y_pred, pos_label=c):.3f}, '
          f'recall {recall_score(y_true, y_pred, pos_label=c):.3f}')
```

## 15.9 Traps

| Trap | Correct thinking |
|---|---|
| Ridge sets coefficients to zero | Lasso does; ridge only shrinks them |
| Ridge reduces bias | It increases bias and reduces variance |
| The nearest-mean classifier is quadratic | The quadratic terms cancel; it is linear |
| SVM margin is 1/‖w‖ | The full margin is 2/‖w‖ |
| LOOCV uses all n samples when a test set was held out | It uses only the training portion |
| Precision of one class equals recall of the other | Compute each from its own row or column |

# Chapter 16: Neural Networks
%Perceptrons, multi-layer perceptrons, parameter counts, activations, forward passes and backpropagation

## 16.1 The multi-layer perceptron

A feed-forward MLP applies layers h⁽ˡ⁾ = g(W⁽ˡ⁾h⁽ˡ⁻¹⁾ + b⁽ˡ⁾). Without a non-linear activation g, any stack of layers collapses to a single linear map.

**Counting parameters.** A fully connected layer from m to n units has mn weights and n biases. For layer sizes n₀, n₁, …, n_L:

weights = Σ nₗ₋₁nₗ, biases = Σ nₗ (for l = 1 to L).

### Worked example: parameter count

*An MLP has 20 inputs, hidden layers of 8 and 5 units, and 2 outputs. Count the parameters with and without biases. (NAT)*

Weights: 20 × 8 + 8 × 5 + 5 × 2 = 160 + 40 + 10 = 210. Biases: 8 + 5 + 2 = 15. Total 225 with biases, 210 without.

## 16.2 Activation functions

| Function | Formula | Range | Derivative |
|---|---|---|---|
| Sigmoid | 1/(1 + e^(−z)) | (0, 1) | σ(1 − σ), at most 0.25 |
| tanh | (eᶻ − e^(−z))/(eᶻ + e^(−z)) | (−1, 1) | 1 − tanh², at most 1 |
| ReLU | max(0, z) | [0, ∞) | 1 for z > 0, 0 for z < 0, undefined at 0 |
| Softmax | e^(zᵢ)/Σ e^(zⱼ) | Probabilities summing to 1 | Used at the output for classes |

ReLU is continuous everywhere but not differentiable at 0, and ReLU(az) = aReLU(z) only for a ≥ 0. Sigmoid and tanh saturate (derivatives near 0 for large |z|), which causes vanishing gradients in deep networks.

## 16.3 Forward pass and backpropagation

Backpropagation applies the chain rule from the output back to each weight. For a weight feeding a ReLU unit that is inactive (input < 0), the gradient through that unit is 0.

### Worked example: gradients in a tiny ReLU network

*Inputs u = 1, v = 2. Hidden units h₁ = ReLU(a u + b v) and h₂ = ReLU(c u + d v), output y = e h₁ + f h₂, with a = 2, b = 1, c = 1, d = −1, e = 3, f = 5. Find y, ∂y/∂a and ∂y/∂f. (MCQ-style)*

h₁ = ReLU(2 + 2) = 4 and h₂ = ReLU(1 − 2) = 0, so y = 12. ∂y/∂a = e × ReLU′(4) × u = 3 × 1 × 1 = 3. ∂y/∂f = h₂ = 0: the second unit is inactive, so changing f does nothing.

```python run Parameter count and the tiny network's gradients with PyTorch
import torch

sizes = [20, 8, 5, 2]
w = sum(a * b for a, b in zip(sizes, sizes[1:])); bias = sum(sizes[1:])
net = torch.nn.Sequential(torch.nn.Linear(20, 8), torch.nn.ReLU(), torch.nn.Linear(8, 5),
                          torch.nn.ReLU(), torch.nn.Linear(5, 2))
print('weights', w, 'biases', bias, '| PyTorch count:', sum(p.numel()
        for p in net.parameters()))

p = {k: torch.tensor(v, requires_grad=True) for k, v in dict(a=2., b=1., c=1., d=-1., e=3.,
        f=5.).items()}
u, v = 1.0, 2.0
h1 = torch.relu(p['a'] * u + p['b'] * v); h2 = torch.relu(p['c'] * u + p['d'] * v)
y = p['e'] * h1 + p['f'] * h2
y.backward()
print('y =', y.item(), '| grads:', {k: t.grad.item() for k, t in p.items()})
```

The gradients of c and d are also 0, for the same reason: the inactive unit blocks every path through it.

## 16.4 Traps

| Trap | Correct thinking |
|---|---|
| Forgetting biases in a parameter count | Each non-input unit has one bias (unless stated otherwise) |
| Stacking linear layers adds expressive power | Without non-linearities it is still one linear map |
| ReLU is differentiable everywhere | Not at 0 |
| ReLU(az) = aReLU(z) for all a | Only for a ≥ 0 |
| Gradient through an inactive ReLU | It is 0 |
