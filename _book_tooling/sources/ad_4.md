# Chapter 8: Recommender Systems
%Implicit feedback, popularity and collaborative-filtering baselines, matrix factorisation, offline evaluation and the traps of popularity

## 8.1 Framing

A recommender predicts which items a user will want next. Most real data is **implicit feedback**: views, clicks, purchases and listening time, not ratings. A missing interaction does not mean dislike; the user may never have seen the item. Large systems work in two stages, **candidate generation** (retrieve a few hundred plausible items from millions, cheaply) and **ranking** (score those candidates with a richer model); the ML System Design guide, §8.1, designs that pipeline. This chapter covers the algorithms underneath, evaluated offline.

The examples simulate 600 users and 400 items whose interactions come from hidden tastes (5 latent factors) plus a strong popularity effect, which is what real catalogues look like. For each user, the **last** five interactions are held out as the test set: evaluation must respect time, as in forecasting.

```python run Simulated interactions and a per-user time split
import numpy as np
rng = np.random.default_rng(40)
users, items, k = 600, 400, 5
U, V = rng.normal(size=(users, k)), rng.normal(size=(items, k))
popularity = rng.zipf(1.6, items).clip(1, 200).astype(float)
score = U @ V.T + 0.8 * np.log(popularity)[None, :]
train, test = np.zeros((users, items), bool), {}
for u in range(users):
    n = rng.integers(15, 40)
    p = np.exp(score[u] - score[u].max()); p /= p.sum()
    chosen = rng.choice(items, n, replace=False, p=p)     # in the order they happened
    train[u, chosen[:-5]] = True
    test[u] = set(chosen[-5:])
np.save('rec_train.npy', train); np.save('rec_scores_true.npy', score)
np.save('rec_test.npy', np.array([sorted(test[u]) for u in range(users)]))
counts = train.sum(axis=0)
print(f'training interactions: {train.sum():,} (density {train.mean():.1%})')
print(f'top 10% of items receive {np.sort(counts)[::-1][:40].sum() / counts.sum():.0%} of '
        f'interactions; '
      f'{(counts == 0).sum()} items have none')
```

## 8.2 Baselines and collaborative filtering

| Method | Idea | Strength | Weakness |
|---|---|---|---|
| Popularity | Recommend the most popular unseen items | Strong, trivial baseline | Same list for everyone |
| Item-item collaborative filtering | Items are similar if the same users interact with both; recommend items similar to the user's history | Simple, explainable ("because you bought X") | Sparse data; popular items dominate similarities |
| Matrix factorisation | Learn a vector per user and per item so that their dot product predicts interaction | Captures latent tastes; compact | Cold start for new users and items |
| Two-tower neural retrieval | Neural encoders for users and items, trained so that their embeddings match; served with approximate nearest-neighbour search | Uses rich features; scales to huge catalogues | Needs lots of data and infrastructure |

Offline metrics for top-*N* lists: **recall@10** (share of a user's held-out items found in the top 10), **precision@10**, and **catalogue coverage** (how many distinct items get recommended at all), which exposes methods that only ever recommend bestsellers.

```python run Popularity, item-item CF and matrix factorisation compared
import numpy as np
train = np.load('rec_train.npy'); test = np.load('rec_test.npy')
users, items = train.shape
X = train.astype(float)

def evaluate(scores, name):
    scores = np.where(train, -np.inf, scores)            # never recommend what was seen
    top = np.argsort(-scores, axis=1)[:, :10]
    hits = np.array([len(set(top[u]) & set(test[u])) for u in range(users)])
    print(f'{name:28} recall@10 {hits.mean() / 5:.3f}  precision@10 {hits.mean() / 10:.3f} '
            f' '
          f'coverage {len(np.unique(top)) / items:.0%}')

evaluate(np.tile(X.sum(axis=0), (users, 1)), 'popularity')

norms = np.sqrt(X.sum(axis=0)) + 1e-9
sim = (X.T @ X) / norms[:, None] / norms[None, :]        # cosine similarity between items
np.fill_diagonal(sim, 0)
evaluate(X @ sim, 'item-item cosine CF')

def als(X, factors=16, reg=5.0, alpha=10.0, iters=8, seed=0):
    """Implicit ALS: confidence 1 + alpha * interaction, preference = interaction."""
    rng = np.random.default_rng(seed)
    P, Q = rng.normal(0, 0.1, (X.shape[0], factors)), rng.normal(0, 0.1, (X.shape[1],
            factors))
    C, I = 1 + alpha * X, np.eye(factors)
    for _ in range(iters):
        for A, B, Cm, Pm in [(P, Q, C, X), (Q, P, C.T, X.T)]:
            for i in range(A.shape[0]):
                w = Cm[i]
                A[i] = np.linalg.solve((B.T * w) @ B + reg * I, (B.T * w) @ Pm[i])
    return P @ Q.T
evaluate(als(X), 'matrix factorisation (ALS)')
evaluate(np.load('rec_scores_true.npy'), 'true tastes (upper bound)')
```

Both personalised methods double popularity's recall, but neither reaches the ceiling set by the true tastes. The simple item-item method even edges the factorisation on recall (0.284 against 0.271) with untuned settings, a common result that is why it remains a standard baseline. The coverage column tells a different story: popularity recommends the same 28 items to everyone, item-item CF still leans on popular items (31% of the catalogue), while the factorisation spreads recommendations over 63%, almost as widely as the true tastes do. Which matters more, a little recall or much more of the catalogue reaching users, is a product decision, and an online test settles it.

## 8.3 Traps in practice

| Trap | What happens | Remedy |
|---|---|---|
| Popularity bias | Bestsellers dominate; niche items never get a chance; offline metrics reward it because test data is popular too | Measure coverage and novelty; re-rank for diversity; evaluate per popularity bucket |
| Feedback loops | The model recommends A, users click A because it is shown, the model learns A is great | Log exposures; use exploration (a small share of random or bandit-chosen items); inverse propensity weighting in evaluation |
| Cold start | New users or items have no interactions | Content features (text, category, price), popularity within segments, onboarding questions, hybrid models |
| Offline–online gap | Higher recall@10 offline, no change in an A/B test | Treat offline metrics as a filter; the A/B test (Chapter 4) decides |
| Leakage in evaluation | Random splits put future interactions in training | Split by time, per user or globally |
| Position bias | Items shown first get clicked more, regardless of relevance | Randomised positions or interleaving (ML System Design, §5.6) |

## 8.4 Practical lessons

- Implicit feedback: missing is not negative; split by time for evaluation.
- Always compare against popularity; report coverage alongside recall and precision.
- Matrix factorisation captures latent tastes; item-item CF is a strong, explainable baseline.
- Watch popularity bias, feedback loops and cold start; the online test is the final judge.

# Chapter 9: Question Bank and Cheat Sheet
%Interview questions with the core of a good answer, and one-page reminders

## 9.1 Features, boosting and explanations

| Question | Core of a good answer |
|---|---|
| How do you encode a feature with 10,000 categories? | Out-of-fold, smoothed target encoding; frequency or hashing; native categorical support in LightGBM/CatBoost; embeddings with enough data. Never target-encode using all rows |
| How do you handle missing values? | Ask why they are missing; impute plus a missing indicator, or let boosted trees learn the split direction |
| How does gradient boosting work? | Additive model of shallow trees, each fitted to the negative gradient of the loss of the current ensemble, shrunk by a learning rate |
| Random forest versus gradient boosting? | Bagging of deep independent trees (variance reduction, robust defaults) versus sequential shallow trees (bias reduction, usually more accurate, needs tuning and early stopping) |
| Which hyperparameters matter most in LightGBM? | Learning rate with early-stopped tree count, num_leaves / max_depth, min_child_samples, subsampling, regularisation |
| How do you deal with class imbalance? | Proper metrics (PR-AUC, recall at precision), threshold choice from costs, calibration; weights or resampling only with care, since they distort probabilities |
| Why not trust built-in feature importance? | Impurity importance is computed on training data and favours high-cardinality and continuous features; use permutation importance on held-out data |
| What are SHAP values? | Shapley-value contributions per feature that add up exactly to the model output for each row; explain the model, not causality |
| PDP versus ICE? | Average effect versus per-row curves; diverging ICE curves reveal interactions the PDP hides |

## 9.2 Experiments and causality

| Question | Core of a good answer |
|---|---|
| What is a sample ratio mismatch? | The observed split differs from the design beyond chance (chi-squared test); it invalidates the experiment |
| How can you reduce the users an A/B test needs? | CUPED with a pre-period covariate (variance × (1 − ρ²)), better metrics, stratification |
| How do you test a ratio metric like CTR? | Variance at the randomisation unit: delta method or bootstrap over users; never treat impressions as independent |
| Twenty metrics, one is significant. Ship? | Expected by chance (64% chance of at least one); pre-register the primary metric; correct with Benjamini–Hochberg or Bonferroni |
| What breaks A/B tests in marketplaces? | Interference between units; use cluster or switchback randomisation |
| Correlation versus causation, with an example | Confounding (premium support given to risky customers looks harmful); Simpson's paradox |
| What should you control for? | Confounders; never mediators or colliders; draw the DAG |
| Explain propensity score methods | Model P(treated given x); weight or match so groups are comparable; needs no unmeasured confounding and overlap |
| Explain difference-in-differences | Change in treated minus change in control; parallel-trends assumption; check pre-trends |
| When would you use an instrumental variable? | Unmeasured confounding plus a variable that moves the treatment, affects the outcome only through it, and is as good as random (e.g. a randomised encouragement) |
| What is uplift modelling? | Predicting the individual treatment effect (e.g. T-learner) from randomised data to target those who respond |

## 9.3 Forecasting, survival and recommenders

| Question | Core of a good answer |
|---|---|
| How do you evaluate a forecast? | Rolling-origin backtest, never a random split; compare with naive and seasonal naive; MAE/WAPE/MASE; check interval coverage |
| ETS, ARIMA or gradient boosting? | ETS for clean trend and seasonality; ARIMA for autocorrelation and regressors; boosting for many series and external drivers (cannot extrapolate trends) |
| Why is MAPE problematic? | Undefined or huge near zero actuals; asymmetric; prefer WAPE or MASE |
| What is censoring? | Event not yet observed (active customers); naive averages are biased; use survival methods |
| Explain Kaplan–Meier | Product over event times of (1 − events / at risk), using every unit while observed |
| What does a Cox model give you? | Hazard ratios for covariates without specifying the baseline hazard; assumes proportional hazards |
| How do you compute customer lifetime value? | Sum of discounted margin × survival probability per period, by segment |
| How do you evaluate a recommender offline? | Time-based split, recall/precision/NDCG at k, coverage and novelty, comparison with popularity; confirm online |
| What is the cold-start problem? | No interactions for new users or items; use content features, popularity by segment, onboarding, hybrids |
| What is a feedback loop in recommendations? | The model's exposures shape the data it learns from; log exposures, explore, correct with propensity weights |

## 9.4 Cheat sheet

| Topic | Remember |
|---|---|
| Leakage | Fit transforms on train only; out-of-fold target encoding; point-in-time aggregates |
| Boosting | Shallow trees on gradients; learning rate + early stopping; tune leaves and min_child_samples |
| Imbalance | Threshold and calibration over weights; PR-AUC |
| Explanations | Permutation importance on test; ICE for interactions; SHAP adds up; none are causal |
| A/B extras | SRM first; CUPED (1 − ρ²); delta method for ratios; one primary metric; BH correction |
| Causal toolbox | Adjust (confounders only), propensity (IPW, matching), DiD (parallel trends), RD (threshold), IV (strong, excluded instrument) |
| Uplift | T-learner on randomised data; target the persuadable |
| Forecasting | Rolling origin; seasonal naive baseline; MASE; lags ≥ horizon; interval coverage |
| Survival | Censoring; Kaplan–Meier; Cox hazard ratios; CLV = Σ margin × S(t) discounted |
| Recommenders | Implicit feedback; popularity baseline; item-item CF; ALS; coverage; cold start; feedback loops |
