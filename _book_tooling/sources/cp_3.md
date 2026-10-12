# Chapter 6: Unsupervised Learning
%Clustering with k-means, hierarchical methods and DBSCAN, choosing k, PCA, association rules and anomaly detection

## 6.1 k-means

k-means partitions data into k clusters by repeating two steps until assignments stop changing: **assign** each point to the nearest centroid, then **move** each centroid to the mean of its points. It minimises **inertia**, the within-cluster sum of squared distances.

```python run Choosing k with the elbow and the silhouette score
from sklearn.datasets import make_blobs
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler

X, true_labels = make_blobs(n_samples=400, centers=4, cluster_std=1.1, random_state=5)
X = StandardScaler().fit_transform(X)
print(' k   inertia   silhouette')
for k in range(2, 8):
    km = KMeans(n_clusters=k, n_init=10, random_state=0).fit(X)
    print(f'{k:>2} {km.inertia_:>9.1f}   {silhouette_score(X, km.labels_):.3f}')
```

Inertia always falls as k grows (k = n gives zero), so look for the **elbow** where the improvement flattens; the **silhouette score** (−1 to 1: how much closer each point is to its own cluster than to the next one) is highest for the best-separated grouping. The result is an honest surprise: the data was generated with **four** blobs, yet the silhouette peaks at k = 2 and the elbow sits around 3. Two pairs of blobs lie close together, so merging each pair gives the most clearly separated clusters. Neither method knows the "true" k; they measure separation. In practice, combine them with domain knowledge (how many segments the business can act on) and by inspecting the clusters.

| k-means fact | Consequence |
|---|---|
| Uses Euclidean distance | **Scale features first**, or the largest-valued feature dominates |
| Random initial centroids | Different runs give different results; `k-means++` initialisation and `n_init` restarts help |
| Assumes compact, roughly spherical clusters of similar size | Fails on rings, moons and elongated shapes |
| Sensitive to outliers | Means are pulled by extremes; consider k-medoids or DBSCAN |
| k must be chosen | Elbow method, silhouette, domain knowledge |

## 6.2 Hierarchical clustering and DBSCAN

**Agglomerative (hierarchical) clustering** starts with every point as its own cluster and repeatedly merges the closest pair; a **dendrogram** shows the merge history, and cutting it at a height gives clusters. Linkage defines "closest": single (nearest points, chains), complete (farthest points), average, and Ward (smallest increase in variance, the usual default).

**DBSCAN** groups points that are densely packed: a **core point** has at least `min_samples` neighbours within radius `eps`; points reachable from core points join their cluster (**border points**); everything else is **noise** (label −1). It finds clusters of any shape, does not need k, and marks outliers, but struggles when clusters have very different densities.

```python run Two interleaving moons: k-means cuts them wrongly, DBSCAN separates them
from sklearn.datasets import make_moons
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering
from sklearn.metrics import adjusted_rand_score

X, y = make_moons(n_samples=400, noise=0.06, random_state=2)
models = {'k-means (k=2)': KMeans(n_clusters=2, n_init=10, random_state=0),
          'agglomerative, single linkage': AgglomerativeClustering(n_clusters=2,
                  linkage='single'),
          'DBSCAN (eps=0.2)': DBSCAN(eps=0.2, min_samples=5)}
for name, model in models.items():
    labels = model.fit_predict(X)
    noise = (labels == -1).sum()
    print(f'{name:<31} adjusted Rand index {adjusted_rand_score(y, labels):.2f}   noise '
            f'points {noise}')
```

The **adjusted Rand index** compares clusters with the true labels (1 = perfect, about 0 = random). k-means splits the moons with a straight boundary; density- and chaining-based methods follow their shape.

## 6.3 Dimensionality reduction: PCA

**Principal component analysis** finds new axes (principal components) that are orthogonal linear combinations of the features, ordered by how much variance they capture. Keeping the first few compresses the data with little information loss, removes correlation between features, and enables 2-D plots of high-dimensional data.

```python run PCA on 64-pixel handwritten digits: how many components keep 90% of the variance?
import numpy as np
from sklearn.datasets import load_digits
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

X = StandardScaler().fit_transform(load_digits().data)
pca = PCA().fit(X)
cum = np.cumsum(pca.explained_variance_ratio_)
print('first 3 components explain', pca.explained_variance_ratio_[:3].round(3),
        'of the variance')
for target in (0.5, 0.8, 0.9, 0.95):
    print(f'{int(target * 100)}% of variance needs {np.argmax(cum >= target) + 1} of 64 '
            f'components')
```

| PCA fact | Detail |
|---|---|
| Standardise first | Otherwise high-variance features dominate the components |
| Components are uncorrelated | Useful before models that dislike multicollinearity |
| Unsupervised | Ignores the label; the direction of most variance need not be the most predictive |
| Interpretation | Each component is a weighted mix of the original features (loadings) |
| t-SNE, UMAP | Non-linear methods for **visualising** clusters in 2-D; not for feature engineering, distances between clusters are not meaningful |

## 6.4 Association rules

Market-basket analysis finds rules such as {bread, butter} → {jam}:

- **Support**(A) = fraction of transactions containing A.
- **Confidence**(A → B) = support(A ∪ B) / support(A): how often B is bought when A is.
- **Lift**(A → B) = confidence(A → B) / support(B): > 1 means A and B occur together more than chance.

```python run Support, confidence and lift for a few rules
baskets = [{'bread', 'butter', 'jam'}, {'bread', 'butter'}, {'bread', 'milk'},
           {'milk', 'butter'}, {'bread', 'butter', 'milk'}, {'jam', 'bread'},
           {'milk'}, {'bread', 'butter', 'jam', 'milk'}]
support = lambda items: sum(items <= b for b in baskets) / len(baskets)
for a, b in [({'bread'}, {'butter'}), ({'butter'}, {'jam'}), ({'milk'}, {'bread'})]:
    conf = support(a | b) / support(a)
    print(f'{set(a)} -> {set(b)}: support {support(a | b):.3f}, '
          f'confidence {conf:.3f}, lift {conf / support(b):.2f}')
```

The **Apriori** algorithm finds frequent itemsets efficiently using the fact that every subset of a frequent itemset is frequent; FP-Growth avoids candidate generation. Lift below 1 (milk → bread here) means buying one makes the other slightly *less* likely than average.

## 6.5 Anomaly detection

```python run Isolation Forest flags the points that are easiest to isolate
import numpy as np
from sklearn.ensemble import IsolationForest

rng = np.random.default_rng(0)
normal = rng.normal(0, 1, size=(300, 2))
odd = np.array([[6, 6], [-5, 7], [7, -6]])
X = np.vstack([normal, odd])
model = IsolationForest(contamination=0.01, random_state=0).fit(X)
flags = model.predict(X)                       # -1 = anomaly, 1 = normal
print('anomalies found at rows:', np.where(flags == -1)[0])
```

Isolation Forest found the three planted points (rows 300–302) and also flagged row 239, an extreme but genuine normal point: with `contamination=0.01` it is told to flag about 1% of the 303 rows, so it picks the most isolated ones whether or not they are truly anomalous. It builds random trees; anomalies need few random splits to isolate, so their average path length is short. Other approaches: z-score and IQR rules (Chapter 4), DBSCAN noise points, one-class SVM, autoencoder reconstruction error. Typical uses: fraud, network intrusion, equipment faults.

## 6.6 Practical lessons

- k-means: scale features, choose k with elbow and silhouette, expect spherical clusters.
- DBSCAN finds arbitrary shapes and noise without k; hierarchical clustering gives a dendrogram.
- PCA: standardise, then keep enough components for 90–95% of the variance.
- Association rules: support, confidence, lift; lift above 1 means a real association.

# Chapter 7: Advanced Machine Learning
%Ensembles, cross-validation and hyperparameter tuning, imbalanced data, pipelines and leakage, feature importance and neural networks

## 7.1 Ensembles: bagging and boosting

| | Bagging | Boosting |
|---|---|---|
| Idea | Train many models **in parallel** on bootstrap samples, average or vote | Train models **in sequence**, each focusing on the errors of the previous ones |
| Reduces | Variance (overfitting) | Bias (and variance, with care) |
| Typical model | Random forest: bootstrap rows **and** a random subset of features at each split | AdaBoost (reweights misclassified points), gradient boosting (fits the residual errors), XGBoost, LightGBM, CatBoost |
| Overfitting risk | Low; more trees never hurt accuracy | Higher; control with learning rate, tree depth, number of rounds, early stopping |
| Extras | Out-of-bag (OOB) score: validation on rows not in each bootstrap | Regularisation, handling of missing values (XGBoost, LightGBM) |

**Stacking** trains a meta-model on the predictions of several base models; **voting** combines them by majority (hard) or averaged probabilities (soft).

```python run One tree versus random forest versus gradient boosting versus LightGBM, by 5-fold CV
import warnings
from sklearn.datasets import make_classification
from sklearn.model_selection import cross_val_score
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from lightgbm import LGBMClassifier
warnings.filterwarnings('ignore')

X, y = make_classification(n_samples=1500, n_features=20, n_informative=8, n_redundant=4,
                           flip_y=0.05, random_state=11)
models = {'decision tree': DecisionTreeClassifier(random_state=0),
          'random forest': RandomForestClassifier(n_estimators=200, random_state=0),
          'gradient boosting': GradientBoostingClassifier(random_state=0),
          'LightGBM': LGBMClassifier(n_estimators=200, verbose=-1, random_state=0)}
for name, model in models.items():
    scores = cross_val_score(model, X, y, cv=5, scoring='accuracy')
    print(f'{name:<18} mean accuracy {scores.mean():.3f}  (std {scores.std():.3f})')
```

The ensembles beat the single tree by a wide margin, which is why random forests and gradient-boosted trees are the default choice for tabular data.

## 7.2 Cross-validation and hyperparameter tuning

**k-fold cross-validation** splits the training data into k folds, trains on k − 1 and validates on the remaining one, k times, and averages: a more reliable estimate than one split. Use **stratified** k-fold for classification (keeps class proportions), **TimeSeriesSplit** for time-ordered data (never train on the future), and leave-one-out only for tiny datasets.

```python run GridSearchCV tries every combination with cross-validation
from sklearn.datasets import make_classification
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.ensemble import RandomForestClassifier

X, y = make_classification(n_samples=800, n_features=12, n_informative=6, random_state=4)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0)
grid = {'n_estimators': [50, 200], 'max_depth': [3, 8, None], 'min_samples_leaf': [1, 5]}
search = GridSearchCV(RandomForestClassifier(random_state=0), grid, cv=5, scoring='f1',
        n_jobs=1)
search.fit(X_tr, y_tr)
print('combinations tried:', len(search.cv_results_['params']), 'x 5 folds')
print('best parameters:', search.best_params_)
print(f'best CV F1 {search.best_score_:.3f}   test F1 {search.score(X_te, y_te):.3f}')
```

| Method | How | When |
|---|---|---|
| Grid search | Every combination | Few hyperparameters, small grids |
| Random search | Random samples from distributions | Many hyperparameters; usually finds good settings faster |
| Bayesian optimisation (Optuna, Hyperopt) | Models the score to choose the next trial | Expensive models |
| Early stopping | Stop boosting or training when validation score stops improving | Boosting, neural networks |

The test set is used **once**, after tuning; tuning on the test set turns it into a second validation set and overstates performance.

## 7.3 Imbalanced data

```python run class_weight='balanced' trades precision for much higher recall on a rare class
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import precision_score, recall_score, f1_score

X, y = make_classification(n_samples=4000, n_features=10, weights=[0.97], flip_y=0.01,
                           class_sep=0.8, random_state=8)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, stratify=y, random_state=0)
print(f'positive class: {y.mean():.1%} of rows')
for cw in [None, 'balanced']:
    p = LogisticRegression(class_weight=cw, max_iter=1000).fit(X_tr, y_tr).predict(X_te)
    print(f'class_weight={str(cw):<9} precision {precision_score(y_te, p):.2f}  '
          f'recall {recall_score(y_te, p):.2f}  F1 {f1_score(y_te, p):.2f}')
```

Recall rose from 0.53 to 0.80, but precision fell to 0.24 and F1 dropped: the weighted model catches most positives at the price of many false alarms. Whether that is better depends on the costs: worth it for fraud screening followed by human review, not for automatically blocking customers.

| Technique | How |
|---|---|
| Better metrics | Precision, recall, F1, PR-AUC instead of accuracy |
| Class weights | Penalise mistakes on the rare class more (`class_weight='balanced'`) |
| Resampling | Undersample the majority, oversample the minority, or SMOTE (synthetic minority points interpolated between neighbours); resample the **training** set only |
| Threshold tuning | Move the decision threshold to the desired precision–recall balance |
| Stratified splits | Keep the class ratio in every split and fold |

## 7.4 Pipelines, leakage and feature importance

```python run A Pipeline with a ColumnTransformer: preprocessing learned inside each CV fold
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score
from sklearn.inspection import permutation_importance
from cpa_data import customers

df = customers()
num, cat = ['age', 'income', 'tenure_months', 'monthly_spend'], ['city', 'plan']
prep = ColumnTransformer([
    ('num', Pipeline([('impute', SimpleImputer(strategy='median')),
                      ('scale', StandardScaler())]), num),
    ('cat', Pipeline([('impute', SimpleImputer(strategy='most_frequent')),
                      ('onehot', OneHotEncoder(handle_unknown='ignore'))]), cat)])
model = Pipeline([('prep', prep), ('rf', RandomForestClassifier(n_estimators=200,
        random_state=0))])
X, y = df[num + cat], df['churn']
print('5-fold CV accuracy:', cross_val_score(model, X, y, cv=5).mean().round(3))
model.fit(X, y)
imp = permutation_importance(model, X, y, n_repeats=5, random_state=0)
for name, score in sorted(zip(X.columns, imp.importances_mean), key=lambda t: -t[1]):
    print(f'{name:<14} {score:.3f}')
```

A **Pipeline** chains preprocessing and the model, so imputation, scaling and encoding are fitted on each training fold only: the clean way to prevent leakage. Permutation importance ranks tenure first, matching how churn was generated. (It was computed on training data here for brevity; on held-out data it is a fairer measure.)

| Leakage source | Example | Fix |
|---|---|---|
| Preprocessing on all data | Scaler fitted before the split | Pipeline, fit on training data only |
| Target leakage | A feature recorded after the outcome ("refund issued" when predicting fraud) | Use only information available at prediction time |
| Time leakage | Random split of time-ordered data | Time-based split |
| Duplicates across splits | Same customer in train and test | Group-aware splits (`GroupKFold`) |

| Feature-selection method | Kind |
|---|---|
| Correlation or variance threshold, chi-square, mutual information | Filter (before modelling) |
| Recursive feature elimination (RFE) | Wrapper (repeatedly fits a model) |
| Lasso, tree feature importance | Embedded (part of training) |
| Permutation importance, SHAP values | Model-agnostic explanation of importance |

## 7.5 Neural networks in brief

A neural network stacks layers of neurons; each computes a weighted sum of its inputs plus a bias and applies a non-linear **activation**. Training repeats: forward pass → loss → **backpropagation** (gradients by the chain rule) → **gradient descent** update w ← w − η·∂L/∂w.

```python run A small multilayer perceptron on handwritten digits
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler

X, y = load_digits(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)
scaler = StandardScaler().fit(X_tr)
mlp = MLPClassifier(hidden_layer_sizes=(64,), activation='relu', solver='adam',
                    max_iter=300, random_state=0).fit(scaler.transform(X_tr), y_tr)
print('layers:', [w.shape for w in mlp.coefs_], '  iterations:', mlp.n_iter_)
print('test accuracy:', round(mlp.score(scaler.transform(X_te), y_te), 3))
```

| Term | Meaning |
|---|---|
| Activation functions | ReLU max(0, x) (default in hidden layers); sigmoid (binary output, 0–1); softmax (multi-class probabilities summing to 1); tanh (−1 to 1) |
| Loss | MSE for regression; cross-entropy (log loss) for classification |
| Optimisers | SGD, SGD with momentum, RMSprop, **Adam** (adaptive per-parameter learning rates, the usual default) |
| Learning rate | Too high diverges; too low trains slowly |
| Epoch / batch / iteration | One pass over the data / samples per update / one update |
| Vanishing gradients | Gradients shrink through many sigmoid layers; ReLU, batch normalisation and residual connections help |
| Regularisation | Dropout (randomly switch off neurons in training), L2 weight decay, early stopping, data augmentation |
| Architectures | CNNs for images (convolution, pooling); RNNs and LSTMs for sequences; **transformers** (attention) for language and now most modalities |
| Transfer learning | Start from a pre-trained model and fine-tune on your data |

## 7.6 Practical lessons

- Bagging (random forest) reduces variance; boosting (gradient boosting, XGBoost, LightGBM) reduces bias sequentially.
- Tune with cross-validation on training data; touch the test set once.
- For imbalance: right metrics, class weights, resampling of training data only, threshold tuning.
- Pipelines prevent leakage; check every feature is available at prediction time.
- Neural networks: activations, loss, backpropagation, Adam, dropout; transformers dominate language.
