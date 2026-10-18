## Set M2: Classifiers

### Easy

**M2.E1** · MCQ · 1 mark. A logistic regression model outputs σ(wᵀx + b). When wᵀx + b = 0, the predicted probability is (A) 0 (B) 1 (C) 0.5 (D) undefined

**M2.E2** · NAT · 1 mark. A node holds 4 positive and 4 negative examples. Find its entropy in bits.

**M2.E3** · MCQ · 1 mark. During training, a k-nearest-neighbour classifier (A) fits a linear boundary (B) only stores the training data (C) builds a decision tree (D) computes class means

**M2.E4** · NAT · 1 mark. Find the Gini index of a node with class proportions 0.25 and 0.75. (Round off to three decimal places)

**M2.E5** · MSQ · 1 mark. Which statements about naive Bayes are correct? (A) It must be trained by gradient descent (B) It is a generative model (C) It assumes the features are conditionally independent given the class (D) It uses Bayes' theorem to compute posteriors

**M2.E6** · NAT · 1 mark. A hard-margin SVM has ‖w‖ = 4. Find the width of its margin. (Round off to one decimal place)

**M2.E7** · MCQ · 1 mark. The decision boundary of logistic regression on the raw features is (A) piecewise constant (B) quadratic (C) circular (D) linear

**M2.E8** · MSQ · 1 mark. Which methods are supervised? (A) Support vector machine (B) k-means (C) Decision tree (D) Principal component analysis

### Medium

**M2.M1** · NAT · 2 marks. Naive Bayes has priors P(y₁) = 0.4 and P(y₂) = 0.6. For an input x, P(x | y₁) = 0.5 and P(x | y₂) = 0.2. Find the probability that the Bayes decision misclassifies x. (Round off to three decimal places)

**M2.M2** · MCQ · 2 marks. A query point's training neighbours are class A at distances 1, 4 and 5 and class B at distances 2 and 3. The 3-NN prediction is (A) A (B) undefined (C) a tie (D) B

**M2.M3** · MSQ · 2 marks. Which statements about a hard-margin SVM are correct? (A) Only the support vectors determine the boundary (B) It maximises the margin among separating hyperplanes (C) Removing a non-support vector changes the boundary (D) The margin is 1/‖w‖²

**M2.M4** · NAT · 2 marks. A node with 5 positive and 5 negative examples is split into (4 positive, 1 negative) and (1 positive, 4 negative). Find the information gain. (Round off to two decimal places)

**M2.M5** · MCQ · 2 marks. Linear discriminant analysis assumes that each class is (A) linearly separable (B) Gaussian, with its own covariance matrix (C) uniformly distributed (D) Gaussian, with a covariance matrix shared by all classes

**M2.M6** · NAT · 2 marks. Logistic regression has w = (1, −1) and b = 0.5. Find P(y = 1) for x = (2, 1). (Round off to two decimal places)

**M2.M7** · MSQ · 2 marks. A perceptron with f(x) = wᵀx + b misclassifies (x, +1) with f(x) < 0 and updates w ← w + x, b ← b + 1. Which statements are correct? (A) f(x) may decrease after the update (B) The update sets w to w − x (C) f(x) increases after the update (D) f(x) increases by exactly ‖x‖² + 1

**M2.M8** · MCQ · 2 marks. A classifier assigns x to the class whose mean is nearer in Euclidean distance. For two classes, its decision boundary is (A) a quadratic surface (B) a hyperplane (C) a circle around one mean (D) undefined

**M2.M9** · NAT · 2 marks. What is the training error of a 1-nearest-neighbour classifier on training data with distinct points?

### Hard

**M2.H1** · NAT · 2 marks. A node with 6 positive and 6 negative examples is split into (6 positive, 2 negative) and (0 positive, 4 negative). Find the decrease in Gini index (parent Gini minus weighted child Gini). (Round off to two decimal places)

**M2.H2** · MCQ · 2 marks. Class +1 has (1, 1) and (2, 2); class −1 has (−1, −1) and (−2, 0). The hard-margin SVM's margin width is closest to (A) 4 (B) 1.41 (C) 2.83 (D) 2

**M2.H3** · MSQ · 2 marks. Which statements about naive Bayes are correct? (A) Laplace smoothing prevents zero probability estimates (B) It can be trained in a single pass over the data (C) It requires the features to be independent unconditionally (D) With Gaussian features of equal variance across classes, its decision boundary is linear

**M2.H4** · NAT · 2 marks. In 3-NN regression, the three nearest neighbours have targets 4, 6 and 11. What is the prediction?

**M2.H5** · MCQ · 2 marks. On linearly separable data, the perceptron algorithm (A) finds the maximum-margin separator (B) never converges (C) converges after finitely many updates (D) needs a kernel

**M2.H6** · NAT · 2 marks. A full binary decision tree of depth 4 (root at depth 0, all leaves at depth 4) has how many leaves?

**M2.H7** · MSQ · 2 marks. Which statements comparing LDA and PCA are correct? (A) PCA's directions are eigenvectors of the between-class scatter matrix (B) With C classes, LDA finds at most C − 1 discriminant directions (C) LDA uses the class labels (D) PCA uses the class labels

## Set M3: Neural networks

### Easy

**M3.E1** · MCQ · 1 mark. ReLU(−3) equals (A) −3 (B) 0 (C) 3 (D) 1

**M3.E2** · NAT · 1 mark. How many parameters (weights and biases) does a fully connected layer from 10 inputs to 5 outputs have?

**M3.E3** · MCQ · 1 mark. The range of the sigmoid function is (A) all real numbers (B) (−1, 1) (C) [0, ∞) (D) (0, 1)

**M3.E4** · NAT · 1 mark. Find the derivative of the sigmoid function at 0. (Round off to two decimal places)

**M3.E5** · MSQ · 1 mark. Which statements about ReLU(z) = max(0, z) are correct? (A) Its output is never negative (B) It is continuous everywhere (C) It is differentiable at 0 (D) ReLU(2z) = 2ReLU(z) for every real z

**M3.E6** · NAT · 1 mark. Find tanh(0).

**M3.E7** · MCQ · 1 mark. A deep network with no non-linear activations computes (A) a quadratic function (B) any continuous function (C) a linear (affine) function of its input (D) a step function

**M3.E8** · MSQ · 1 mark. Which statements about the softmax outputs of a network are correct? (A) Adding the same constant to every input leaves them unchanged (B) For three classes they equal the sigmoid of each input (C) Each lies strictly between 0 and 1 (D) They sum to 1

### Medium

**M3.M1** · NAT · 2 marks. An MLP has layer sizes 16 → 8 → 4 → 1 and no biases. How many weights does it have?

**M3.M2** · MCQ · 2 marks. For x = (1, 2), hidden units h₁ = ReLU(x₁ − x₂) and h₂ = ReLU(2x₁ + x₂) feed the output y = 3h₁ + 0.5h₂. What is y? (A) 5 (B) 2 (C) 0 (D) −1

**M3.M3** · MSQ · 2 marks. Which statements about gradients in deep networks are correct? (A) ReLU units can never become inactive (B) Deep sigmoid networks can suffer from vanishing gradients (C) ReLU's derivative is at most 0.25 (D) The sigmoid's derivative is at most 0.25

**M3.M4** · NAT · 2 marks. y = w₂ · ReLU(w₁x) with x = 2, w₁ = 1.5 and w₂ = −2. Find ∂y/∂w₁.

**M3.M5** · MCQ · 2 marks. A classifier gives probability 0.8 to the true class. The cross-entropy loss (natural log) is closest to (A) 1.61 (B) 0.80 (C) 0.20 (D) 0.22

**M3.M6** · NAT · 2 marks. An MLP has 25 inputs, hidden layers of 6 and 4 units, and 2 outputs, with biases. How many learnable parameters does it have?

**M3.M7** · MSQ · 2 marks. Gradient descent minimises L(w) = (w − 4)² from w = 0. Which statements are correct? (A) With η = 0.5, one step gives w = 8 (B) That step lowers the loss from 16 to 4 (C) With η = 0.25, one step gives w = 2 (D) With η = 1, one step gives w = 8

**M3.M8** · MCQ · 2 marks. Which output activation suits a classifier over 10 mutually exclusive classes? (A) Identity (B) ReLU (C) Softmax (D) tanh

**M3.M9** · NAT · 2 marks. Find σ(ln 3), where σ is the sigmoid. (Round off to two decimal places)

### Hard

**M3.H1** · NAT · 2 marks. y = σ(wx), the loss is L = (y − t)²/2, and x = 1, w = 0, t = 1. Find ∂L/∂w. (Round off to three decimal places)

**M3.H2** · MCQ · 2 marks. Which function cannot be computed by a single perceptron with a step activation on two binary inputs? (A) OR (B) AND (C) XOR (D) NAND

**M3.H3** · MSQ · 2 marks. Every weight and bias of an MLP with ReLU hidden units is initialised to 0. Which statements are correct? (A) All hidden units in a layer receive identical gradients (B) Gradient descent cannot make the hidden units in a layer differ from one another (C) The network's initial output is 0 (D) It trains as well as a randomly initialised network

**M3.H4** · NAT · 2 marks. How many multiplications does one forward pass through dense layers 100 → 50 → 10 need (ignoring biases and activations)?

**M3.H5** · MCQ · 2 marks. Inputs u = 3 and v = 1 feed h₁ = ReLU(au + bv) and h₂ = ReLU(cu + dv), with output y = eh₁ + fh₂, where a = 1, b = −2, c = −1, d = 1, e = 2 and f = 4. The pair (∂y/∂b, ∂y/∂f) is (A) (2, 1) (B) (−4, 0) (C) (2, 0) (D) (1, 0)

**M3.H6** · NAT · 2 marks. Find the softmax probability of the third class for inputs (1, 2, 3). (Round off to two decimal places)

**M3.H7** · MSQ · 2 marks. Which statements about dropout are correct? (A) It randomly zeroes units during training (B) It acts as a regulariser (C) It increases the number of parameters (D) The same random units are dropped at test time

## Set M4: Clustering and PCA

### Easy

**M4.E1** · MCQ · 1 mark. Which must be chosen before running k-means? (A) The number of clusters k (B) The class labels (C) A learning rate (D) A dendrogram cut height

**M4.E2** · NAT · 1 mark. Find the Manhattan distance between (1, 2, 3) and (4, 0, 3).

**M4.E3** · MCQ · 1 mark. Single linkage measures the distance between two clusters by (A) the farthest pair of points (B) the closest pair of points (C) the distance between centroids (D) the average pairwise distance

**M4.E4** · NAT · 1 mark. A covariance matrix has eigenvalues 6, 3 and 1. What fraction of the variance does the first principal component explain? (Round off to one decimal place)

**M4.E5** · MSQ · 1 mark. Which statements about k-means are correct? (A) It is sensitive to outliers (B) No iteration increases the within-cluster sum of squares (C) It can converge to a local minimum (D) Its centres are always data points

**M4.E6** · NAT · 1 mark. Find the Euclidean distance between (0, 0) and (3, 4).

**M4.E7** · MCQ · 1 mark. Principal component analysis is (A) supervised (B) unsupervised (C) a clustering method (D) a classification method

**M4.E8** · MSQ · 1 mark. Which are linkage criteria for hierarchical clustering? (A) Complete linkage (B) Single linkage (C) Gibbs sampling (D) k-means

### Medium

**M4.M1** · NAT · 2 marks. k-means on the points 1, 3, 5, 10, 12 starts with centroids 1 and 10. Find the final value of the second centroid.

**M4.M2** · MCQ · 2 marks. Agglomerative clustering with Manhattan distance is run on P1 (0, 0), P2 (1, 0), P3 (5, 0) and P4 (6, 1). Which pair merges first? (A) P3 and P4 (B) P1 and P2 (C) P2 and P3 (D) P1 and P4

**M4.M3** · MSQ · 2 marks. Which statements about PCA are correct? (A) The principal directions are orthogonal (B) The first component has the largest variance (C) The projections onto different components are perfectly correlated (D) PCA uses class labels

**M4.M4** · NAT · 2 marks. Centred 2-D data have covariance matrix [[4, 0], [0, 1]]. What fraction of the variance does the first principal component explain? (Round off to one decimal place)

**M4.M5** · MCQ · 2 marks. With Euclidean distance, the complete-linkage distance between {(0, 0), (1, 0)} and {(4, 0), (6, 0)} is (A) 3 (B) 4.5 (C) 6 (D) 5

**M4.M6** · NAT · 2 marks. Find the within-cluster sum of squares of the cluster {1, 3, 5} about its centroid.

**M4.M7** · MSQ · 2 marks. Which statements comparing k-medoids with k-means are correct? (A) k-medoids can work with any dissimilarity measure (B) Medoids are actual data points (C) k-means with mean updates is consistent with Manhattan distance (D) k-medoids is more robust to outliers

**M4.M8** · MCQ · 2 marks. How many merges does agglomerative clustering perform to combine 10 points into one cluster? (A) 45 (B) 10 (C) 9 (D) 5

**M4.M9** · NAT · 2 marks. A covariance matrix has eigenvalues 5, 3 and 2. What is the total variance?

### Hard

**M4.H1** · NAT · 2 marks. Single-linkage clustering is run on the 1-D points 0, 2, 3, 7, 8, 16. At what distance does the final merge happen?

**M4.H2** · MCQ · 2 marks. Complete-linkage clustering is run on the same points (0, 2, 3, 7, 8, 16). The final merge happens at distance (A) 8 (B) 16 (C) 9 (D) 7

**M4.H3** · MSQ · 2 marks. X is a centred n × d data matrix with SVD X = UΣVᵀ, and the covariance matrix is XᵀX/n. Which statements are correct? (A) The columns of V are the principal directions (B) The columns of U are the principal directions in feature space (C) At most min(n − 1, d) principal components have non-zero variance (D) The variance along the i-th direction is σᵢ/n

**M4.H4** · NAT · 2 marks. The centred points (−2, −2), (−1, −1), (1, 1) and (2, 2) are projected onto their first principal direction. Find the mean of the squared projections.

**M4.H5** · MCQ · 2 marks. k-means with k equal to the number of distinct points reaches a within-cluster sum of squares of (A) 1 (B) the total variance (C) n (D) 0

**M4.H6** · NAT · 2 marks. The single-linkage dendrogram of 0, 2, 3, 7, 8, 16 is cut at height 3 (merges at distance up to 3 are kept). How many clusters remain?

**M4.H7** · MSQ · 2 marks. Which statements about choosing k are correct? (A) The silhouette score lies in [0, 1] (B) The best k is always the one with the smallest within-cluster sum of squares (C) The optimal within-cluster sum of squares never increases as k grows (D) It is zero when k = 1
