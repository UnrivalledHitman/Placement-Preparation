# How to use this guide
%What applied data science adds to machine learning theory, what this book covers, and how its examples were run

Most data science work in industry is not deep learning. It is **tabular data** (customers, transactions, sensor readings), **gradient-boosted trees**, **experiments** that decide whether a change shipped, **causal questions** ("did the campaign cause the uplift?"), **forecasts**, **churn and survival** problems and **recommendations**. Interviews follow the same pattern: after the ML theory questions come "how would you encode a feature with 10,000 categories?", "the A/B test shows +2%: do we ship?", "how would you measure the effect of a feature we could not randomise?".

This guide builds on the other books in this section and does not repeat them: the **Mathematics and Statistics for ML** guide covers probability, estimation and hypothesis tests; the **AI/ML** guide covers the core models and the ML workflow; the **ML System Design** guide covers leakage, offline metrics, calibration, thresholds, sample sizes, peeking and drift. Here the focus is on **the techniques that turn data into decisions**.

## How the examples were run

Every program was run with Python 3.13, pandas 3.0, scikit-learn 1.9, LightGBM 4.7, statsmodels 0.15 and SHAP 0.52, and its output is shown. Datasets are **generated** with a fixed seed, which has a teaching advantage: because we wrote the data-generating process, we know the true effect of every feature and treatment, so we can see exactly which methods recover it and which are fooled.

> TIP: Change the seeds and the sizes and rerun. A method that only works for one seed is not a method.

## Map of the guide

| Chapter | Topic | Typical interview question |
|---|---|---|
| 1 | Tabular data and feature engineering | "How do you encode a high-cardinality categorical feature?" |
| 2 | Gradient boosting in depth | "Why does gradient boosting usually beat a random forest on tabular data?" |
| 3 | Explaining models | "Which features drive this model, and can we trust the answer?" |
| 4 | A/B testing beyond the basics | "How can we get a significant result with fewer users?" |
| 5 | Causal inference without experiments | "We could not randomise. How do we estimate the effect?" |
| 6 | Time series forecasting | "How would you forecast next month's demand, and how would you test it?" |
| 7 | Survival analysis and churn | "Why is the average customer lifetime in our data wrong?" |
| 8 | Recommender systems | "Design a 'customers also bought' feature" |
| 9 | Question bank and cheat sheet | Revision |

# Chapter 1: Tabular Data and Feature Engineering
%Splitting before fitting, encoding categories without leakage, missing values that carry information, and point-in-time aggregates

## 1.1 Fit transformations on training data only

Every transformation that **learns from data** (an imputer's means, a scaler's standard deviations, a target encoder's category averages, a feature selector) must be fitted on the training split only and then applied to validation and test data. Fitting it on all the data lets information from the evaluation rows leak into training, and the evaluation stops measuring what will happen in production.

For most transformations the leak is small. For **target encoding** (replacing each category by the average target in that category) it can be enormous, because a rare category's average contains the very row being predicted. The program creates 3,000 customers whose city (one of 1,500) has **no relationship at all** to the target, then target-encodes the city two ways.

```python run Target encoding on all rows invents a strong feature from noise
import numpy as np, pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import KFold, train_test_split

rng = np.random.default_rng(0)
n = 3000
df = pd.DataFrame({'city': rng.integers(0, 1500, n), 'tenure': rng.normal(24, 10, n)})
logit = -1 + 0.05 * (df['tenure'] - 24)
df['churn'] = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)   # city is pure noise
train, test = train_test_split(df, test_size=0.3, random_state=0)

def fit_eval(tr, te, col):
    cols = ['tenure'] if col == 'tenure' else [col, 'tenure']
    model = LogisticRegression().fit(tr[cols], tr['churn'])
    return (roc_auc_score(tr['churn'], model.predict_proba(tr[cols])[:, 1]),
            roc_auc_score(te['churn'], model.predict_proba(te[cols])[:, 1]))

prior = train['churn'].mean()
def smoothed_means(frame, k=20):              # shrink rare categories towards the prior
    g = frame.groupby('city')['churn'].agg(['sum', 'count'])
    return (g['sum'] + k * prior) / (g['count'] + k)

# naive: encode with the target of every training row, including the row itself
naive = train.groupby('city')['churn'].mean()
tr_naive = train.assign(enc=train['city'].map(naive))
te_naive = test.assign(enc=test['city'].map(naive).fillna(prior))

# out-of-fold: each training row is encoded with means from the other folds only
tr_oof = train.assign(enc=np.nan)
for fit_idx, enc_idx in KFold(5, shuffle=True, random_state=0).split(train):
    means = smoothed_means(train.iloc[fit_idx])
    tr_oof.iloc[enc_idx, tr_oof.columns.get_loc('enc')] = \
        train['city'].iloc[enc_idx].map(means).fillna(prior).to_numpy()
te_oof = test.assign(enc=test['city'].map(smoothed_means(train)).fillna(prior))

print('tenure only           : train AUC %.3f, test AUC %.3f' % fit_eval(train, test,
        'tenure'))
print('naive target encoding : train AUC %.3f, test AUC %.3f' % fit_eval(tr_naive, te_naive,
        'enc'))
print('out-of-fold, smoothed : train AUC %.3f, test AUC %.3f' % fit_eval(tr_oof, te_oof,
        'enc'))
```

With naive encoding, the city looks like a superb feature on the training data (most cities appear once or twice, so each one's "average" nearly equals its own label), and the model leans on it. On the test data the feature is useless, and the model is **worse** than one that ignores the city. Out-of-fold encoding with smoothing gives the model an honest view during training: the city adds nothing, and the model learns that.

## 1.2 Encoding categorical features

| Encoding | How | Good for | Watch out for |
|---|---|---|---|
| One-hot | One 0/1 column per category | Linear models, few categories | Thousands of sparse columns for high cardinality |
| Ordinal | Integer per category | Trees, genuinely ordered categories | Linear models read a false order |
| Target (mean) encoding | Category → smoothed mean target, computed out of fold | High cardinality, any model | Leakage (§1.1); must be refitted per fold |
| Frequency / count | Category → how often it occurs | Popularity matters | Different categories with equal counts collide |
| Hashing | Hash the category into a fixed number of buckets | Huge or open-ended vocabularies, streaming | Collisions; not invertible |
| Native categorical support | LightGBM and CatBoost split on category sets directly | Trees | LightGBM can overfit rare levels; CatBoost uses ordered target statistics to avoid it |
| Learned embeddings | A dense vector per category trained with a neural network | Very high cardinality with lots of data | Needs more data and tuning |

## 1.3 Missing values can carry information

Data is rarely missing at random. Applicants who do not state their income, sensors that drop out under heat, customers with no recent orders: the fact that the value is missing is itself a signal. Imputing the mean and forgetting which rows were missing throws that signal away; adding a **missing-indicator** column keeps it.

```python run A missing-indicator column recovers the signal in missingness
import numpy as np, pandas as pd
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(1)
n = 6000
income = rng.lognormal(10.5, 0.5, n)
default = rng.random(n) < 1 / (1 + np.exp(-(-2.5 - 0.8 * (np.log(income) - 10.5))))
# applicants who later default hide their income far more often
missing = rng.random(n) < np.where(default, 0.45, 0.10)
X = pd.DataFrame({'log_income': np.where(missing, np.nan, np.log(income))})
Xtr, Xte, ytr, yte = train_test_split(X, default, test_size=0.3, random_state=0)

for indicator in [False, True]:
    model = make_pipeline(SimpleImputer(strategy='mean', add_indicator=indicator),
                          StandardScaler(), LogisticRegression())
    model.fit(Xtr, ytr)
    auc = roc_auc_score(yte, model.predict_proba(Xte)[:, 1])
    print(f'mean imputation, missing indicator {str(indicator):5}: test AUC {auc:.3f}')
print(f'income missing for {missing[default].mean():.0%} of defaulters, '
      f'{missing[~default].mean():.0%} of others')
```

Gradient-boosted trees in LightGBM and XGBoost handle missing values natively: at each split they learn which direction missing values should go, so they pick up informative missingness without an indicator.

## 1.4 Point-in-time aggregates

The most predictive features of customer behaviour are usually **aggregates of past events**: recency, frequency and monetary value (RFM), counts in the last 7 and 30 days, trends. They must be computed using only events **before the prediction time**, or the model sees the future (the ML System Design guide, Chapter 2, covers time-based leakage).

```python run RFM features as of a cutoff date, from an event log
import numpy as np, pandas as pd
rng = np.random.default_rng(2)
orders = pd.DataFrame({
    'customer': rng.choice(['C1', 'C2', 'C3', 'C4'], 40),
    'date': pd.Timestamp('2026-01-01') + pd.to_timedelta(rng.integers(0, 270, 40),
            unit='D'),
    'amount': rng.gamma(2.0, 400, 40).round(0),
})
cutoff = pd.Timestamp('2026-07-01')                       # predict churn as of this date
past = orders[orders['date'] < cutoff]                    # never look beyond the cutoff
rfm = past.groupby('customer').agg(
    last_order=('date', 'max'), orders=('date', 'size'), spend=('amount', 'sum'))
rfm['recency_days'] = (cutoff - rfm['last_order']).dt.days
last90 = past[past['date'] >= cutoff - pd.Timedelta(days=90)]
rfm['orders_90d'] = last90.groupby('customer').size().reindex(rfm.index, fill_value=0)
print(rfm[['recency_days', 'orders', 'orders_90d', 'spend']])
print(f'events after the cutoff excluded: {(orders["date"] >= cutoff).sum()} of '
        f'{len(orders)}')
```

## 1.5 Bundling preprocessing with the model

scikit-learn's `Pipeline` and `ColumnTransformer` put every learned transformation inside the model object. Cross-validation then refits the transformations inside each fold automatically (no leakage), and the exact same preprocessing ships to production with the model (no training/serving skew).

```python run A ColumnTransformer pipeline evaluated with cross-validation
import numpy as np, pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

rng = np.random.default_rng(3)
n = 2000
df = pd.DataFrame({'plan': rng.choice(['basic', 'plus', 'pro'], n),
                   'region': rng.choice(['north', 'south', 'east', 'west'], n),
                   'tenure': rng.normal(24, 10, n), 'tickets': rng.poisson(2,
                           n).astype(float)})
df.loc[rng.random(n) < 0.1, 'tenure'] = np.nan
risk = (-1.5 + (df['plan'] == 'basic') * 1.0 + 0.3 * df['tickets']
        - 0.03 * df['tenure'].fillna(24))
y = rng.random(n) < 1 / (1 + np.exp(-risk))

pre = ColumnTransformer([
    ('num', Pipeline([('impute', SimpleImputer(add_indicator=True)), ('scale',
            StandardScaler())]),
     ['tenure', 'tickets']),
    ('cat', OneHotEncoder(handle_unknown='ignore'), ['plan', 'region']),
])
model = Pipeline([('pre', pre), ('clf', LogisticRegression(max_iter=1000))])
scores = cross_val_score(model, df, y, cv=5, scoring='roc_auc')
print('5-fold AUC:', scores.round(3), 'mean %.3f' % scores.mean())
model.fit(df, y)
print('features after preprocessing:',
        len(model.named_steps['pre'].get_feature_names_out()))
```

## 1.6 Practical lessons

- Split first; fit every learned transformation on training data only, ideally inside a pipeline.
- Target-encode high-cardinality categories out of fold with smoothing, never on all rows.
- Missingness is often informative: keep it with an indicator, or use trees that learn it.
- Aggregate past events as of the prediction time; nothing after the cutoff may enter a feature.

# Chapter 2: Gradient Boosting in Depth
%Boosting as gradient descent on residuals, why it wins on tabular data, the hyperparameters that matter, early stopping and imbalance

## 2.1 Boosting fits the residuals

Gradient boosting builds an additive model F(x) = f<sub>0</sub> + η f<sub>1</sub>(x) + η f<sub>2</sub>(x) + ..., where each f<sub>m</sub> is a small decision tree fitted to the **negative gradient of the loss** with respect to the current predictions. For squared error the negative gradient is simply the residual y − F(x), so each new tree learns what the model still gets wrong. The learning rate η shrinks each tree's contribution, which makes progress slower but generalisation better.

```python run Gradient boosting from scratch with depth-2 trees
import numpy as np
from sklearn.tree import DecisionTreeRegressor
rng = np.random.default_rng(4)
x = np.sort(rng.uniform(0, 6, 300)).reshape(-1, 1)
y = np.sin(x[:, 0]) * 2 + 0.3 * x[:, 0] + rng.normal(0, 0.3, 300)
x_val = rng.uniform(0, 6, 300).reshape(-1, 1)
y_val = np.sin(x_val[:, 0]) * 2 + 0.3 * x_val[:, 0] + rng.normal(0, 0.3, 300)

def boost(rate, rounds=200):
    pred, pred_val, history = np.full(300, y.mean()), np.full(300, y.mean()), {}
    for m in range(1, rounds + 1):
        residual = y - pred   # negative gradient of MSE / 2
        tree = DecisionTreeRegressor(max_depth=2).fit(x, residual)
        pred += rate * tree.predict(x)
        pred_val += rate * tree.predict(x_val)
        if m in (1, 5, 20, 50, 200):
            history[m] = (np.mean((y - pred) ** 2), np.mean((y_val - pred_val) ** 2))
    return history

for rate in [1.0, 0.1]:
    h = boost(rate)
    print(f'learning rate {rate}:')
    for m in (5, 50, 200):
        print(f'  after {m:3} trees: train MSE {h[m][0]:.3f}, validation MSE {h[m][1]:.3f}')
print('noise variance (best achievable MSE): 0.090')
```

With learning rate 1.0, the training error falls fastest, and the validation error stops improving early and drifts up as the trees chase noise. With 0.1, progress is gradual, and the validation error settles around 0.12, well below the fast learner's 0.165 and not far above the noise floor of 0.09 (the best any model could do). Real libraries add regularisation on leaf values, row and column subsampling, and a second-order (Newton) step, but the core loop is exactly this one.

## 2.2 Why boosting usually wins on tabular data

| | Random forest (bagging) | Gradient boosting |
|---|---|---|
| Trees | Deep, independent, trained on bootstrap samples | Shallow, sequential, each correcting the ensemble so far |
| Reduces mainly | Variance | Bias (and variance through shrinkage and subsampling) |
| Tuning sensitivity | Low: works well with defaults | Higher: learning rate, trees, leaves, regularisation |
| Overfitting with more trees | No (just slower) | Yes, without early stopping |
| Typical accuracy on tabular data | Strong baseline | Usually best; the default choice in industry and on Kaggle |

```python run Logistic regression, random forest and LightGBM on the same problem
import warnings; warnings.filterwarnings('ignore')
import numpy as np
from lightgbm import LGBMClassifier
from sklearn.datasets import make_classification
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split

X, y = make_classification(n_samples=8000, n_features=20, n_informative=8, n_redundant=4,
                           flip_y=0.05, class_sep=0.8, random_state=5)
X[:, 0] = X[:, 0] * X[:, 1]                                 # add a non-linear interaction
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3, random_state=0)
models = {
    'logistic regression': LogisticRegression(max_iter=2000),
    'random forest (300 trees)': RandomForestClassifier(300, n_jobs=1, random_state=0),
    'LightGBM (defaults)': LGBMClassifier(n_jobs=1, verbose=-1, random_state=0),
}
for name, m in models.items():
    m.fit(Xtr, ytr)
    print(f'{name:26} test AUC {roc_auc_score(yte, m.predict_proba(Xte)[:, 1]):.3f}')
```

Both tree ensembles beat logistic regression by a wide margin, because the data has non-linear effects and an interaction that a linear model cannot represent. LightGBM edges the random forest by only 0.003 here: with default settings the gap is often small, and it is tuning (§2.3–2.4) that usually widens it.

## 2.3 The hyperparameters that matter

| Parameter (LightGBM name) | Effect | Typical starting range |
|---|---|---|
| `learning_rate` | Shrinkage per tree; lower generalises better but needs more trees | 0.02–0.1 |
| `n_estimators` | Number of trees; set high and let early stopping choose | 100–5,000 |
| `num_leaves` | Model complexity per tree (LightGBM grows leaf-wise) | 15–255 |
| `max_depth` | Caps tree depth; guards leaf-wise growth against very deep trees | −1 (none) or 6–12 |
| `min_child_samples` | Minimum rows per leaf; the main guard against noise | 20–200 |
| `subsample` + `subsample_freq` | Row sampling per tree (stochastic boosting) | 0.6–0.9 |
| `colsample_bytree` | Feature sampling per tree | 0.5–0.9 |
| `reg_lambda`, `reg_alpha` | L2 / L1 penalty on leaf values | 0–10 |
| `scale_pos_weight` / `class_weight` | Up-weights the rare class (§2.5) | Ratio of negatives to positives, or none |

| Library | Tree growth | Categorical features | Known for |
|---|---|---|---|
| XGBoost | Level-wise by default (leaf-wise optional) | Native support in recent versions | The original fast implementation; very mature |
| LightGBM | Leaf-wise, histogram-based | Native (category sets) | Speed on large data, low memory |
| CatBoost | Symmetric (oblivious) trees | Native with ordered target statistics | Strong defaults, categorical data, less tuning |

## 2.4 Learning rate and early stopping

Rather than guessing the number of trees, hold out a validation set and stop when its loss has not improved for a number of rounds. Lower learning rates need more trees and often, but not always, reach a slightly better optimum.

```python run Early stopping at three learning rates
import warnings; warnings.filterwarnings('ignore')
from lightgbm import LGBMClassifier, early_stopping, log_evaluation
from sklearn.datasets import make_classification
from sklearn.metrics import log_loss, roc_auc_score
from sklearn.model_selection import train_test_split

X, y = make_classification(n_samples=8000, n_features=20, n_informative=8, flip_y=0.08,
                           random_state=6)
Xtr, Xtmp, ytr, ytmp = train_test_split(X, y, test_size=0.4, random_state=0)
Xval, Xte, yval, yte = train_test_split(Xtmp, ytmp, test_size=0.5, random_state=0)
for lr in [0.3, 0.1, 0.03]:
    m = LGBMClassifier(n_estimators=3000, learning_rate=lr, n_jobs=1, verbose=-1,
                       random_state=0)
    m.fit(Xtr, ytr, eval_set=[(Xval, yval)], eval_metric='binary_logloss',
          callbacks=[early_stopping(50, verbose=False), log_evaluation(0)])
    p = m.predict_proba(Xte)[:, 1]
    print(f'learning rate {lr:4}: best iteration {m.best_iteration_:4}, '
          f'test log loss {log_loss(yte, p):.4f}, test AUC {roc_auc_score(yte, p):.4f}')
```

Here 0.1 gives the best test loss. A rate of 0.3 stops after 29 trees at a worse optimum, and 0.03 needs four times as many trees as 0.1 for no gain: below a point, lowering the rate mostly costs training time. Three data sets are needed: training, a validation set for early stopping (and tuning), and an untouched test set. Early stopping on the test set would make the test score optimistic.

## 2.5 Imbalanced classes

With rare positives (fraud, churn, defects), up-weighting the positive class or resampling is often suggested. For a model that ranks well, weighting changes the **scores**, not the **ranking**: AUC barely moves, while predicted probabilities become inflated. Choosing the decision threshold on the unweighted model achieves the same recall without distorting the probabilities (the ML System Design guide, Chapter 4, shows how to pick thresholds from costs and how to recalibrate).

```python run Class weights versus threshold choice at 2% positives
import warnings; warnings.filterwarnings('ignore')
import numpy as np
from lightgbm import LGBMClassifier
from sklearn.datasets import make_classification
from sklearn.metrics import recall_score, precision_score, roc_auc_score
from sklearn.model_selection import train_test_split

X, y = make_classification(n_samples=20000, n_features=15, n_informative=6, weights=[0.98],
                           flip_y=0.01, random_state=7)
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3, stratify=y, random_state=0)
plain = LGBMClassifier(n_estimators=300, learning_rate=0.05, n_jobs=1, verbose=-1,
        random_state=0)
weighted = LGBMClassifier(n_estimators=300, learning_rate=0.05, scale_pos_weight=49,
        n_jobs=1,
                          verbose=-1, random_state=0)
plain.fit(Xtr, ytr); weighted.fit(Xtr, ytr)
pp, pw = plain.predict_proba(Xte)[:, 1], weighted.predict_proba(Xte)[:, 1]
print(f'positives in test: {yte.mean():.1%}')
print(f'AUC  plain {roc_auc_score(yte, pp):.3f} | weighted {roc_auc_score(yte, pw):.3f}')
print(f'mean predicted probability: plain {pp.mean():.3f} | weighted {pw.mean():.3f}')
for name, p, t in [('plain, threshold 0.5', pp, 0.5), ('weighted, threshold 0.5', pw, 0.5)]:
    pred = p >= t
    print(f'{name:28} recall {recall_score(yte, pred):.2f} precision '
            f'{precision_score(yte, pred):.2f}')
target_recall = recall_score(yte, pw >= 0.5)
t = np.quantile(pp[yte == 1], 1 - target_recall)   # same recall from the plain model
pred = pp >= t
print(f'plain, threshold {t:.3f}        recall {recall_score(yte, pred):.2f} '
      f'precision {precision_score(yte, pred):.2f}')
```

Weighting barely changes the AUC but inflates every predicted probability. Choosing a lower threshold on the plain model reaches the same recall with **better** precision (0.77 against 0.66). Note also an honest surprise: neither model is calibrated here. The plain model's average predicted probability is 1.0% against 2.5% actual positives (300 trees overfit the rare positives in training and are too sure about the test negatives), and the weighted model's is 3.6%. Whenever probabilities matter (pricing, expected loss), recalibrate on validation data first.

## 2.6 Practical lessons

- Boosting adds shallow trees fitted to the loss gradient; shrinkage trades speed for generalisation.
- Gradient boosting is the default for tabular data; a random forest is the robust baseline.
- Set many trees and stop early on a validation set, never on the test set.
- For imbalance, prefer threshold choice (and calibration) over weights that distort probabilities.
