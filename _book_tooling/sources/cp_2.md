# Chapter 4: EDA and Visualisation
%pandas for exploring data, missing values and outliers, distributions and correlation, encoding and scaling, and choosing the right chart

## 4.1 A dataset to explore

The examples use a synthetic customer dataset with the problems real data has: missing values, an outlier, a skewed column, categories and a target to predict (`churn`). It is saved as a small module so the rest of the book can load it.

```python run A customer dataset with realistic flaws (saved as cpa_data.py)
import numpy as np
import pandas as pd

def customers(n=300, seed=7):
    rng = np.random.default_rng(seed)
    df = pd.DataFrame({
        'customer_id': np.arange(1001, 1001 + n),
        'city': rng.choice(['Pune', 'Mumbai', 'Chennai', 'Delhi'], n, p=[0.3, 0.3, 0.25,
                0.15]),
        'age': rng.integers(21, 66, n),
        'income': np.round(rng.lognormal(mean=11, sigma=0.45, size=n), -2),   # right-skewed
        'tenure_months': rng.integers(1, 73, n),
        'plan': rng.choice(['Basic', 'Standard', 'Premium'], n, p=[0.5, 0.35, 0.15]),
    })
    df['monthly_spend'] = np.round(300 + df['income'] / 200 + rng.normal(0, 150, n), 0)
    logit = 1.2 - 0.05 * df['tenure_months'] + 0.6 * (df['plan'] == 'Basic')
    df['churn'] = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)
    df.loc[rng.choice(n, 12, replace=False), 'income'] = np.nan   # missing values
    df.loc[rng.choice(n, 8, replace=False), 'city'] = None
    df.loc[5, 'monthly_spend'] = 25000   # a data-entry outlier
    return df

if __name__ == '__main__':
    module = open(__file__, encoding='utf-8').read().split("if __name__ ==")[0]
    open('cpa_data.py', 'w', encoding='utf-8').write(module)
    df = customers()
    print(df.shape)
    print(df.head(4).to_string())
    print(df.dtypes.to_string())
```

## 4.2 First look: the pandas calls every EDA starts with

```python run info-style summaries, describe, missing values and value counts
from cpa_data import customers
df = customers()
print(df.isnull().sum().to_string())
print(df.describe().round(1).loc[['count', 'mean', '50%', 'max'], ['age', 'income',
        'monthly_spend']])
print(df['plan'].value_counts().to_string())
print(df['city'].value_counts(dropna=False, normalize=True).round(2).to_string())
print('unique cities:', df['city'].nunique(), '| duplicated rows:', df.duplicated().sum())
print('churn rate:', round(df['churn'].mean(), 3))
```

| Call | Shows | Trap |
|---|---|---|
| `df.shape`, `df.info()`, `df.dtypes` | Size, columns, types, non-null counts | Text columns show as `str` in pandas 3 (`object` in older versions); a numeric column read as text usually contains entries such as "NA" |
| `df.describe()` | count, mean, std, min, quartiles, max for numeric columns | Excludes object columns unless `include='all'`; `count` excludes NaN |
| `df.isnull().sum()` | Missing values per column | `isna` and `isnull` are the same |
| `s.value_counts()` | Frequency of each value, descending | Excludes NaN unless `dropna=False`; `normalize=True` gives proportions |
| `s.nunique()`, `s.unique()` | Number of / array of distinct values | `nunique` ignores NaN by default |
| `df.duplicated()` | Boolean per row | `keep='first'` marks later copies only |

A mean income far above the median is the signature of **right skew**, and a maximum `monthly_spend` of 25,000 against a median around 600 is the planted outlier.

## 4.3 Selecting, filtering, grouping and reshaping

```python run loc versus iloc, boolean filters, groupby, pivot tables, merge and apply
import pandas as pd
from cpa_data import customers
df = customers()
print(df.loc[0:2, ['age', 'plan']])          # loc: labels, END INCLUSIVE -> 3 rows
print(df.iloc[0:2, [2, 5]])                  # iloc: positions, end exclusive -> 2 rows
print(len(df[(df['plan'] == 'Premium') & (df['age'] > 50)]))   # & and |, with brackets
print(df.groupby('plan')['monthly_spend'].agg(['count', 'median']).round(0))
print(pd.pivot_table(df, values='churn', index='plan', columns='city',
        aggfunc='mean').round(2))
targets = pd.DataFrame({'city': ['Pune', 'Delhi'], 'target': [900, 1100]})
merged = df.merge(targets, on='city', how='left')
print(merged['target'].isna().sum(), 'rows have no target after a left merge')
df['age_band'] = pd.cut(df['age'], bins=[20, 35, 50, 65], labels=['young', 'mid', 'senior'])
df['plan_code'] = df['plan'].map({'Basic': 0, 'Standard': 1, 'Premium': 2})
print(df[['age', 'age_band', 'plan', 'plan_code']].head(3).to_string())
```

| Topic | Rule |
|---|---|
| `loc[a:b]` | Label-based, **includes** b |
| `iloc[a:b]` | Position-based, **excludes** b, like Python slices |
| Boolean filters | Combine with `&`, `|`, `~` and parentheses: `(a > 1) & (b < 2)`; `and`/`or` raise an error |
| `axis=0` / `axis=1` | Down the rows (per column) / across columns (per row); `df.drop('col', axis=1)` drops a column |
| `groupby().agg()` | Split–apply–combine; `transform` returns a result aligned to the original rows |
| `merge(how=...)` | `inner`, `left`, `right`, `outer`, like SQL joins; `concat` stacks frames |
| `apply` / `map` | Function per row or column / element-wise mapping for a Series (dict or function) |
| `inplace=True` | Returns `None`; `df = df.dropna(inplace=True)` sets df to None |

## 4.4 Missing values and outliers

```python run Imputation choices and the IQR rule
from cpa_data import customers
df = customers()
income = df['income']
print(f'mean {income.mean():.0f}   median {income.median():.0f}   skew {income.skew():.2f}')
filled = income.fillna(income.median())                 # median: robust for skewed data
print('missing after fill:', filled.isna().sum())
print('rows if we drop any NaN:', len(df.dropna()), 'of', len(df))
df['city'] = df['city'].fillna(df['city'].mode()[0])    # mode for categories

s = df['monthly_spend']
q1, q3 = s.quantile([0.25, 0.75])
iqr = q3 - q1
low, high = q1 - 1.5 * iqr, q3 + 1.5 * iqr
out = df[(s < low) | (s > high)]
print(f'IQR fences: {low:.0f} to {high:.0f}; outliers: {len(out)} rows, max {s.max():.0f}')
z = (s - s.mean()) / s.std()
print('rows with |z| > 3:', int((z.abs() > 3).sum()))
```

| Missing-value strategy | When |
|---|---|
| Drop rows (`dropna`) | Few rows affected and missing at random |
| Drop the column | Mostly missing and not important |
| Mean | Numeric, roughly symmetric |
| Median | Numeric, skewed or with outliers |
| Mode / "Unknown" category | Categorical |
| Forward/backward fill (`ffill`) | Time series |
| Model-based (KNN imputer, iterative) | Values predictable from other columns |
| Missing-indicator column | When "missing" itself carries information |

**Outliers:** the IQR rule flags values below Q1 − 1.5·IQR or above Q3 + 1.5·IQR (the whiskers of a box plot); the z-score rule flags |z| > 3. Here the IQR rule found 6 outliers but the z-score rule only 1: the extreme value of 25,000 inflates the standard deviation so much that moderate outliers no longer look unusual. Quartile-based rules are robust to this; mean-and-standard-deviation rules are not. Investigate before removing: a data-entry error (25,000 instead of 2,500) is fixed or removed, a genuine extreme customer is kept, perhaps with a log transform or a robust model.

## 4.5 Distributions, correlation and the right chart

```python run Four standard EDA plots with seaborn and matplotlib
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
from cpa_data import customers
df = customers()
df = df[df['monthly_spend'] < 5000]   # drop the planted outlier for plotting
fig, ax = plt.subplots(2, 2, figsize=(9, 6))
sns.histplot(df['income'].dropna(), bins=25, ax=ax[0, 0]).set_title('Income: right-skewed')
sns.boxplot(data=df, x='plan', y='monthly_spend', order=['Basic', 'Standard', 'Premium'],
            ax=ax[0, 1]).set_title('Spend by plan')
sns.scatterplot(data=df, x='income', y='monthly_spend', hue='churn', s=14,
                ax=ax[1, 0]).set_title('Income vs spend')
corr = df[['age', 'income', 'tenure_months', 'monthly_spend', 'churn']].corr()
sns.heatmap(corr, annot=True, fmt='.2f', cmap='coolwarm', vmin=-1, vmax=1,
            ax=ax[1, 1]).set_title('Correlation matrix')
plt.tight_layout()
plt.savefig('cpa_eda.png', dpi=150)
print(corr.round(2).loc[['income', 'tenure_months'], ['monthly_spend', 'churn']])
print('skew of income:', round(df['income'].skew(), 2), ' after log:',
      round(np.log(df['income']).skew(), 2))
```

![Histogram, box plot, scatter plot and correlation heatmap of the customer data](figs/cpa_eda.png)

The heatmap confirms what the data generator built in: spend rises with income (strong positive correlation) and churn falls with tenure (negative correlation). A log transform removes most of the income skew, which helps models that assume roughly normal inputs.

| Question | Chart | seaborn / matplotlib |
|---|---|---|
| Distribution of one numeric variable | Histogram, KDE, box plot | `sns.histplot`, `sns.kdeplot`, `sns.boxplot`, `plt.hist` |
| Counts of a category | Bar / count plot | `sns.countplot`, `s.value_counts().plot.bar()` |
| Numeric across categories | Box, violin, bar of means | `sns.boxplot`, `sns.violinplot`, `sns.barplot` |
| Relationship between two numerics | Scatter (plus trend line) | `sns.scatterplot`, `sns.regplot`, `plt.scatter` |
| All pairwise relationships | Pair plot | `sns.pairplot(df, hue=...)` |
| Correlation matrix | Heatmap | `sns.heatmap(df.corr(), annot=True)` |
| Trend over time | Line chart | `sns.lineplot`, `plt.plot` |
| Parts of a whole | Stacked bar (pie only for 2–4 parts) | `plt.pie`, `df.plot.bar(stacked=True)` |

| Statistic | Meaning |
|---|---|
| Pearson correlation r | Strength of **linear** relationship, −1 to +1; sensitive to outliers |
| Spearman correlation | Correlation of ranks: monotonic relationships, robust to outliers |
| Correlation ≠ causation | Ice-cream sales and drownings both rise in summer (a confounder) |
| Skewness | > 0 right tail (mean > median), < 0 left tail |
| Kurtosis | Tail heaviness; high kurtosis means more extreme values |

## 4.6 Encoding and scaling

```python run One-hot encoding, label encoding, standardisation and min-max scaling
import pandas as pd
from sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder
df = pd.DataFrame({'plan': ['Basic', 'Premium', 'Standard', 'Basic'],
                   'income': [30000, 120000, 60000, 45000]})
print(pd.get_dummies(df['plan'], prefix='plan', dtype=int))
print(LabelEncoder().fit_transform(df['plan']))           # alphabetical codes
print(StandardScaler().fit_transform(df[['income']]).round(2).ravel())
print(MinMaxScaler().fit_transform(df[['income']]).round(2).ravel())
```

| Technique | Use for | Note |
|---|---|---|
| One-hot encoding | Nominal categories (city, plan) | `drop_first=True` avoids perfect collinearity in linear models |
| Label / ordinal encoding | Ordered categories (low < medium < high); targets | Arbitrary codes on nominal data imply a false order |
| Standardisation (z-score) | Distance- and gradient-based models (k-NN, SVM, logistic regression, PCA, neural networks) | Mean 0, standard deviation 1 |
| Min-max scaling | Features needing a fixed range, such as [0, 1] | Sensitive to outliers |
| Log transform | Right-skewed positive values | `np.log1p` handles zeros |
| Tree models | Need no scaling | Splits depend on order only |

> TRAP: Fit scalers and encoders on the **training** data only, then transform the test data with them. Fitting on the full dataset leaks test information into training.

## 4.7 Practical lessons

- Start every EDA with shape, types, `describe`, missing counts and `value_counts`.
- `loc` includes the end label, `iloc` excludes the end position; combine filters with `&` and `|`.
- Median and mode for skewed and categorical imputation; IQR fences and z-scores to find outliers, then investigate.
- Pick charts by question; correlation measures linear association, not causation.

# Chapter 5: Supervised Learning
%Regression and classification algorithms, how they learn, evaluation metrics from the confusion matrix, and overfitting

## 5.1 Regression

**Linear regression** fits ŷ = b₀ + b₁x₁ + ... + bₙxₙ by minimising the sum of squared errors (ordinary least squares). Coefficients say how much ŷ changes per unit of each feature, holding others fixed.

```python run Linear regression with scikit-learn and the four regression metrics
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from cpa_data import customers

df = customers().dropna(subset=['income'])
df = df[df['monthly_spend'] < 5000]
X, y = df[['income', 'tenure_months']], df['monthly_spend']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)
model = LinearRegression().fit(X_train, y_train)
pred = model.predict(X_test)
print('intercept', round(model.intercept_, 1), ' coefficients', model.coef_.round(5))
print(f'MAE  {mean_absolute_error(y_test, pred):.1f}')
print(f'MSE  {mean_squared_error(y_test, pred):.1f}')
print(f'RMSE {np.sqrt(mean_squared_error(y_test, pred)):.1f}')
print(f'R2   {r2_score(y_test, pred):.3f}')
```

The income coefficient is close to the 1/200 = 0.005 the generator used, and tenure's coefficient is small (about −0.6 per month on spends of several hundred) because the generator made spend independent of tenure: regression recovers the true relationship from noisy data. An R² of about 0.5 means half the variation in spend is explained; the rest is the random noise that was added.

| Metric | Formula idea | Note |
|---|---|---|
| MAE | Mean of \|y − ŷ\| | Same units as y; robust to outliers |
| MSE | Mean of (y − ŷ)² | Penalises large errors heavily |
| RMSE | √MSE | Same units as y |
| R² | 1 − SS_res / SS_tot | Share of variance explained; 1 is perfect, 0 is "predict the mean", can be negative on test data |
| Adjusted R² | R² penalised for the number of features | Does not rise just by adding useless features |

Linear regression assumes a linear relationship, independent errors, constant error variance (homoscedasticity) and little multicollinearity among features. **Polynomial regression** adds powers of features to fit curves (still linear in the coefficients).

## 5.2 Classification algorithms

| Algorithm | How it decides | Strengths | Watch out for |
|---|---|---|---|
| Logistic regression | Sigmoid σ(z) = 1 / (1 + e⁻ᶻ) turns a linear score into a probability; threshold 0.5 by default | Fast, interpretable (odds ratios), good baseline | Linear decision boundary |
| k-nearest neighbours | Majority label of the k closest training points | Simple, no training | Needs scaling; slow at prediction; small k overfits |
| Decision tree | Recursive splits that most reduce impurity (Gini or entropy) | Interpretable, handles mixed data, no scaling | Overfits without depth limits or pruning |
| Naive Bayes | Bayes' theorem with features assumed independent given the class | Very fast, strong for text (spam) | Independence assumption |
| Support vector machine | Maximum-margin hyperplane; kernels (RBF, polynomial) for curved boundaries | Effective in high dimensions | Needs scaling; slow on large data; C and gamma tuning |
| Random forest / boosting | Ensembles of trees (Chapter 7) | Accurate on tabular data | Less interpretable |

**Gini impurity** of a node is 1 − Σ pᵢ²; **entropy** is −Σ pᵢ log₂ pᵢ. A split is chosen to maximise the drop in impurity (**information gain** for entropy).

```python run Gini, entropy and information gain for one split, by hand
from math import log2

def gini(counts):
    n = sum(counts); return 1 - sum((c / n) ** 2 for c in counts)

def entropy(counts):
    n = sum(counts); return -sum(c / n * log2(c / n) for c in counts if c)

parent = [10, 10]                         # 10 churn, 10 stay
left, right = [8, 2], [2, 8]              # split on "tenure < 12 months"
weighted = lambda f: sum(sum(s) / 20 * f(s) for s in (left, right))
print(f'parent  gini {gini(parent):.3f}  entropy {entropy(parent):.3f}')
print(f'left    gini {gini(left):.3f}  entropy {entropy(left):.3f}')
print(f'after split: weighted gini {weighted(gini):.3f}, weighted entropy '
        f'{weighted(entropy):.3f}')
print(f'information gain: {entropy(parent) - weighted(entropy):.3f} bits')
print(f'pure node: gini {gini([5, 0]):.1f}, entropy {abs(entropy([5, 0])):.1f}')
```

A 50/50 node has the maximum impurity for two classes (Gini 0.5, entropy 1 bit); a pure node has 0.

## 5.3 Evaluating classifiers

Everything starts from the **confusion matrix**:

| | Predicted positive | Predicted negative |
|---|---|---|
| **Actual positive** | True positive (TP) | False negative (FN) |
| **Actual negative** | False positive (FP) | True negative (TN) |

```python run Metrics from a confusion matrix, by formula and with scikit-learn
from sklearn.metrics import confusion_matrix, classification_report, roc_auc_score
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from cpa_data import customers

TP, FN, FP, TN = 40, 10, 20, 130                 # a typical exam scenario
acc = (TP + TN) / (TP + TN + FP + FN)
precision, recall = TP / (TP + FP), TP / (TP + FN)
f1 = 2 * precision * recall / (precision + recall)
print(f'accuracy {acc:.3f}  precision {precision:.3f}  recall {recall:.3f}  '
      f'F1 {f1:.3f}  specificity {TN / (TN + FP):.3f}')

df = customers()
X = df[['tenure_months', 'age']].assign(basic=(df['plan'] == 'Basic').astype(int))
X_tr, X_te, y_tr, y_te = train_test_split(X, df['churn'], test_size=0.3, random_state=1,
                                          stratify=df['churn'])
clf = LogisticRegression().fit(X_tr, y_tr)
print(confusion_matrix(y_te, clf.predict(X_te)))
print(classification_report(y_te, clf.predict(X_te), digits=2))
print('ROC-AUC:', round(roc_auc_score(y_te, clf.predict_proba(X_te)[:, 1]), 3))
```

| Metric | Formula | Ask when... |
|---|---|---|
| Accuracy | (TP + TN) / all | Classes are balanced |
| Precision | TP / (TP + FP) | False positives are costly (spam filter deleting real mail) |
| Recall (sensitivity, TPR) | TP / (TP + FN) | False negatives are costly (cancer screening, fraud) |
| F1 | Harmonic mean of precision and recall | You need one number balancing both, with imbalanced classes |
| Specificity (TNR) | TN / (TN + FP) | Correctly clearing negatives matters |
| ROC-AUC | Area under TPR versus FPR across all thresholds | Ranking quality independent of threshold; 0.5 is random |
| PR-AUC | Area under precision–recall curve | Rare positive class |

> TRAP: **The accuracy paradox.** With 1% fraud, a model that predicts "not fraud" for everyone is 99% accurate and useless (recall 0). For imbalanced data, look at precision, recall, F1 or PR-AUC.

Lowering the decision threshold below 0.5 catches more positives (recall up) at the cost of more false alarms (precision down). The right threshold depends on the business cost of each error.

## 5.4 Overfitting, bias–variance and regularisation

```python run Tree depth: training accuracy keeps rising, test accuracy does not
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from cpa_data import customers

df = customers()
X = df[['tenure_months', 'age', 'monthly_spend']]
X_tr, X_te, y_tr, y_te = train_test_split(X, df['churn'], test_size=0.3, random_state=3)
print('depth  train  test')
for depth in [1, 2, 3, 5, 8, None]:
    tree = DecisionTreeClassifier(max_depth=depth, random_state=0).fit(X_tr, y_tr)
    print(f'{str(depth):>5}  {tree.score(X_tr, y_tr):.2f}   {tree.score(X_te, y_te):.2f}')
```

An unlimited tree memorises the training set (training accuracy 1.00) while its test accuracy is worse than a shallow tree's: textbook **overfitting**.

| | High bias (underfitting) | High variance (overfitting) |
|---|---|---|
| Symptoms | Poor training and test scores | Excellent training, poor test score |
| Causes | Model too simple, too few features | Model too complex, too little data, noisy features |
| Fixes | More complex model, more features, less regularisation | More data, simpler model, regularisation, pruning, dropout, cross-validation, early stopping |

**Regularisation** adds a penalty on coefficient size to the loss: **Ridge (L2)** shrinks all coefficients towards zero; **Lasso (L1)** can set some exactly to zero, performing feature selection; **Elastic Net** mixes both. The strength (α in scikit-learn's Ridge/Lasso, C = 1/strength in LogisticRegression and SVM) is a hyperparameter.

## 5.5 Practical lessons

- Regression: MAE, RMSE and R²; coefficients are effects per unit with others held fixed.
- Classification: compute accuracy, precision, recall, F1 and specificity from a confusion matrix without hesitation.
- Imbalanced data makes accuracy misleading; choose metrics by the cost of each error.
- Training score far above test score means overfitting: simplify, regularise or add data.
