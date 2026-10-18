## Solutions: Set M2

| Q | Answer | Q | Answer | Q | Answer |
|---|---|---|---|---|---|
| E1 | C | M1 | 0.375 | H1 | 0.25 |
| E2 | 1 | M2 | D | H2 | C |
| E3 | B | M3 | A, B | H3 | A, B, D |
| E4 | 0.375 | M4 | 0.28 | H4 | 7 |
| E5 | B, C, D | M5 | D | H5 | C |
| E6 | 0.5 | M6 | 0.82 | H6 | 16 |
| E7 | D | M7 | C, D | H7 | B, C |
| E8 | A, C | M8 | B | | |
| | | M9 | 0 | | |

**E1.** σ(0) = 0.5. **E2.** A 50/50 node has entropy 1. **E3.** k-NN is lazy: it stores the data and works at prediction time. **E4.** 1 − (0.0625 + 0.5625) = 0.375.

**E5.** Naive Bayes is generative, uses Bayes' theorem with the conditional-independence assumption, and is fitted by counting, not by gradient descent.

**E6.** 2/‖w‖ = 0.5. **E7.** The boundary wᵀx + b = 0 is a hyperplane. **E8.** k-means and PCA use no labels.

**M1.** Unnormalised posteriors 0.2 and 0.12: P(y₁ | x) = 0.625, so predict y₁ and misclassify with probability 0.375.

**M2.** The three nearest are 1 (A), 2 (D) and 3 (D): B wins 2 to 1.

**M3.** Only support vectors are active constraints; deleting any other point leaves the solution unchanged. The margin width is 2/‖w‖.

**M4.** The parent has entropy 1; each child (0.8, 0.2) has entropy 0.722. Gain = 1 − 0.722 ≈ 0.28.

**M5.** Shared covariance, which is what makes the boundary linear.

**M6.** z = 2 − 1 + 0.5 = 1.5, σ(1.5) ≈ 0.82.

**M7.** The new score is f(x) + ‖x‖² + 1, so it strictly increases by exactly that amount; the update adds x, not subtracts.

**M8.** The squared terms cancel, leaving a linear rule. **M9.** Each point is its own nearest neighbour: 0.

**H1.** Parent Gini 0.5. Left (6, 2): 1 − (0.5625 + 0.0625) = 0.375 with weight 8/12; right is pure. Weighted child Gini 0.25, decrease 0.25.

**H2.** The boundary x₁ + x₂ = 0 with w = (1/2, 1/2), b = 0 puts (1, 1), (−1, −1) and (−2, 0) on the margins. Width 2/‖w‖ = 2√2 ≈ 2.83.

**H3.** Naive Bayes assumes conditional, not unconditional, independence.

**H4.** (4 + 6 + 11)/3 = 7. **H5.** The perceptron convergence theorem guarantees finitely many updates, but not the maximum margin.

**H6.** 2⁴ = 16.

**H7.** PCA ignores the labels; LDA uses them and gives at most C − 1 directions. PCA uses the total covariance matrix; between-class scatter is what LDA uses.

```python run Recomputing Set M2
import numpy as np
from math import log2, exp
from sklearn.svm import SVC

H = lambda *p: -sum(q * log2(q) for q in p if q > 0)
gini = lambda *p: 1 - sum(q * q for q in p)
print('E2', H(.5, .5), '| E4', gini(.25, .75), '| M1', 1 - 0.4 * 0.5 / (0.4 * 0.5
        + 0.6 * 0.2),
      '| M4', round(1 - H(.8, .2), 4), '| M6', round(1 / (1 + exp(-1.5)), 4))
print('H1', 0.5 - (8 / 12) * gini(6 / 8, 2 / 8))
X = np.array([[1, 1], [2, 2], [-1, -1], [-2, 0]]); y = [1, 1, -1, -1]
s = SVC(kernel='linear', C=1e6).fit(X, y)
print('H2 w', np.round(s.coef_[0], 4), 'b', round(s.intercept_[0], 4), 'margin',
        round(2 / np.linalg.norm(s.coef_[0]), 4))
w, b, x = np.array([0.3, -0.7]), -0.2, np.array([1., 2])
f0 = w @ x + b; f1 = (w + x) @ x + (b + 1)
print('M7 increase', round(f1 - f0, 6), '= |x|^2 + 1 =', x @ x + 1)
```

## Solutions: Set M3

| Q | Answer | Q | Answer | Q | Answer |
|---|---|---|---|---|---|
| E1 | B | M1 | 164 | H1 | −0.125 |
| E2 | 55 | M2 | B | H2 | C |
| E3 | D | M3 | B, D | H3 | A, B, C |
| E4 | 0.25 | M4 | −4 | H4 | 5500 |
| E5 | A, B, D | M5 | D | H5 | C |
| E6 | 0 | M6 | 194 | H6 | 0.67 |
| E7 | C | M7 | B, C, D | H7 | A, B |
| E8 | A, C, D | M8 | C | | |
| | | M9 | 0.75 | | |

**E1.** max(0, −3) = 0. **E2.** 10 × 5 + 5 = 55. **E3.** (0, 1). **E4.** σ(0)(1 − σ(0)) = 0.25.

**E5.** ReLU is continuous with a corner at 0, never negative, and positively homogeneous: ReLU(2z) = 2ReLU(z).

**E6.** 0. **E7.** A composition of affine maps is affine.

**E8.** Softmax outputs are positive, sum to 1 and are unchanged by a common shift; for three classes they are not individual sigmoids.

**M1.** 16 × 8 + 8 × 4 + 4 × 1 = 128 + 32 + 4 = 164.

**M2.** h₁ = ReLU(−1) = 0 and h₂ = ReLU(4) = 4, so y = 0 + 2 = 2.

**M3.** A ReLU unit whose input stays negative outputs 0 and gets no gradient (a "dead" unit), so (A) is false. ReLU's derivative is 1 for positive inputs; the 0.25 bound belongs to the sigmoid.

**M4.** The unit is active (1.5 × 2 > 0), so ∂y/∂w₁ = w₂ × x = −4.

**M5.** −ln 0.8 ≈ 0.22.

**M6.** Weights 25 × 6 + 6 × 4 + 4 × 2 = 150 + 24 + 8 = 182; biases 6 + 4 + 2 = 12. Total 194.

**M7.** L′(0) = −8. With η = 0.25: w = 2 and the loss drops from 16 to 4. With η = 1: w = 8. With η = 0.5: w = 4, the minimum, not 8.

**M8.** Softmax. **M9.** σ(ln 3) = 1/(1 + 1/3) = 0.75.

**H1.** y = σ(0) = 0.5. ∂L/∂w = (y − t) σ′(0) x = (−0.5)(0.25)(1) = −0.125.

**H2.** XOR is not linearly separable.

**H3.** With all-zero parameters every hidden unit computes the same thing and receives the same gradient (here zero, as the ReLUs sit at 0), so the symmetry is never broken; the output starts at 0, and the network cannot learn useful features.

**H4.** 100 × 50 + 50 × 10 = 5500.

**H5.** h₁ = ReLU(3 − 2) = 1 is active and h₂ = ReLU(−3 + 1) = 0 is not. ∂y/∂b = e × v = 2; ∂y/∂f = h₂ = 0.

**H6.** e³/(e + e² + e³) ≈ 0.67.

**H7.** Dropout is used only in training; at test time all units are kept (with activations rescaled to match). Dropout adds no parameters.

```python run Recomputing Set M3 with PyTorch
import torch, math

layer = torch.nn.Linear(10, 5)
print('E2', sum(p.numel() for p in layer.parameters()), '| M1', 16 * 8 + 8 * 4 + 4,
      '| M6', sum(p.numel() for p in torch.nn.Sequential(torch.nn.Linear(25, 6),
              torch.nn.Linear(6, 4),
                                                         torch.nn.Linear(4,
                                                                 2)).parameters()))
z = torch.tensor(0.0, requires_grad=True); torch.sigmoid(z).backward()
print('E4', z.grad.item(), '| M5', round(-math.log(0.8), 4), '| M9', round(1 / (1
        + math.exp(-math.log(3))), 4))
w1 = torch.tensor(1.5, requires_grad=True); w2 = torch.tensor(-2.0)
(w2 * torch.relu(w1 * 2)).backward()
print('M4', w1.grad.item())
w = torch.tensor(0.0, requires_grad=True); t = 1.0
L = (torch.sigmoid(w * 1.0) - t) ** 2 / 2; L.backward()
print('H1', w.grad.item())
p = {k: torch.tensor(v, requires_grad=True) for k, v in dict(a=1., b=-2., c=-1., d=1., e=2.,
        f=4.).items()}
u, v = 3.0, 1.0
y = p['e'] * torch.relu(p['a'] * u + p['b'] * v) + p['f'] * torch.relu(p['c'] * u
        + p['d'] * v)
y.backward()
print('H5 dy/db', p['b'].grad.item(), 'dy/df', p['f'].grad.item(),
      '| H6', round(torch.softmax(torch.tensor([1., 2, 3]), 0)[2].item(), 4))
print('M7', 0 - 0.25 * (-8), 0 - 1 * (-8), 0 - 0.5 * (-8))
```

## Solutions: Set M4

| Q | Answer | Q | Answer | Q | Answer |
|---|---|---|---|---|---|
| E1 | A | M1 | 11 | H1 | 8 |
| E2 | 5 | M2 | B | H2 | B |
| E3 | B | M3 | A, B | H3 | A, C |
| E4 | 0.6 | M4 | 0.8 | H4 | 5 |
| E5 | A, B, C | M5 | C | H5 | D |
| E6 | 5 | M6 | 8 | H6 | 3 |
| E7 | B | M7 | A, B, D | H7 | C |
| E8 | A, B | M8 | C | | |
| | | M9 | 10 | | |

**E1.** k. **E2.** 3 + 2 + 0 = 5. **E3.** The closest pair. **E4.** 6/10.

**E5.** k-medoids, not k-means, uses data points as centres.

**E6.** √(9 + 16) = 5. **E7.** Unsupervised. **E8.** k-means and Gibbs sampling are not linkage criteria.

**M1.** {1, 3, 5} → 3 and {10, 12} → 11; reassigning changes nothing, so the centroids stay 3 and 11.

**M2.** d(P1, P2) = 1 is the smallest distance (d(P3, P4) = 2).

**M3.** PCA ignores labels. Projections onto different components are uncorrelated.

**M4.** 4/(4 + 1) = 0.8.

**M5.** The farthest pair, (0, 0) and (6, 0), is 6 apart.

**M6.** (1 − 3)² + 0 + (5 − 3)² = 8.

**M7.** The mean minimises squared Euclidean distance; for Manhattan distance the coordinate-wise median is the right centre, so (C) is false.

**M8.** Each merge reduces the number of clusters by one: 9. **M9.** 5 + 3 + 2 = 10.

**H1.** Single linkage merges at 1 (2 with 3), 1 (7 with 8), 2 (0 joins), 4 (gap 3 to 7) and finally 8 (gap 8 to 16).

**H2.** Complete linkage: 1, 1, then {0, 2, 3} at 3, then {0, 2, 3, 7, 8} at 8 (beating {7, 8, 16} at 9), and finally 16 joins at distance 16 − 0 = 16.

**H3.** V holds the principal directions, U the scores (in sample space). Centring loses one degree of freedom, so the rank is at most min(n − 1, d). The variance is σᵢ²/n; the singular value must be squared.

**H4.** The direction is (1, 1)/√2; the projections are ±2√2 and ±√2, with squares 8, 2, 2, 8: mean 5.

**H5.** Each point is its own centroid: 0.

**H6.** Merges at distances 1, 1 and 2 are kept; the next merge (4) is not. Clusters {0, 2, 3}, {7, 8} and {16}: 3.

**H7.** Minimising the within-cluster sum of squares alone would always choose the largest k (the sum is 0 at k = n), so other criteria such as the elbow or silhouette are used. It is zero only when every point is its own centre, not at k = 1. The silhouette lies in [−1, 1]; negative values mean a point sits closer to another cluster.

```python run Recomputing Set M4
import numpy as np
from scipy.cluster.hierarchy import linkage, fcluster

pts = np.array([0., 2, 3, 7, 8, 16])[:, None]
Zs, Zc = linkage(pts, 'single'), linkage(pts, 'complete')
print('H1 single merge heights', Zs[:, 2].tolist(), '| H2 complete', Zc[:, 2].tolist())
print('H6 clusters at height 3:', len(set(fcluster(Zs, 3, criterion='distance'))))
x = np.array([1., 3, 5, 10, 12]); c = np.array([1., 10])
for _ in range(10):
    lab = np.argmin(abs(x[:, None] - c), axis=1)
    c = np.array([x[lab == k].mean() for k in range(2)])
print('M1 centroids', c, '| M6', ((np.array([1., 3, 5]) - 3) ** 2).sum())
P = np.array([[-2, -2], [-1, -1], [1, 1], [2, 2.]])
lam, U = np.linalg.eigh(P.T @ P / len(P))
print('H4 mean squared projection', round(np.mean((P @ U[:, -1]) ** 2), 6),
        '| top eigenvalue', round(lam[-1], 6))
from scipy.spatial.distance import cityblock
print('M2 distances', cityblock([0, 0], [1, 0]), cityblock([5, 0], [6, 1]), '| E2',
        cityblock([1, 2, 3], [4, 0, 3]))
```
