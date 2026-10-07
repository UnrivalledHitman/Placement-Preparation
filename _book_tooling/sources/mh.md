# Hints
%Read only the hint for the exercise you are stuck on

## Part 1 hints

| Exercise | Hint |
|---|---|
| M1.1 | Start from the action taken with each prediction; the label is the outcome of that action |
| M1.2 | Clicks and applications are easy to inflate; what does the seeker ultimately want? |
| M1.3 | Visit when p × 6 000 > 800 (the visit is always paid; assume it prevents the failure cost) |
| M1.4 | Rules for fixed logic and regulation; ML for patterns that change or are hard to specify |

## Part 2 hints

| Exercise | Hint |
|---|---|
| M2.1 | Ask for each: was it known at the moment the loan was approved? |
| M2.2 | Select the 20 "best" of 2 000 random features using all labels, then cross-validate |
| M2.3 | Only matured transactions are labelled; recent ones would be counted as negatives |
| M2.4 | Odds after correction = odds before × 0.02 |

## Part 3 hints

| Exercise | Hint |
|---|---|
| M3.1 | Time zone, window boundaries, currency unit, refunds, late events, missing values |
| M3.2 | The threshold is the score of the 200th highest account |
| M3.3 | `RandomForestClassifier`, then `IsotonicRegression` fitted on a calibration split |
| M3.4 | The ideal list is [3, 2, 2, 1, 0, 0]; DCG terms are (2<sup>rel</sup> − 1) / log<sub>2</sub>(i + 1) |
| M3.5 | Think about the data the offline set came from, the metric, the test, and the users |

## Part 4 hints

| Exercise | Hint |
|---|---|
| M4.1 | Use the guide's formula with p1 = 0.02, p2 = 0.021 |
| M4.2 | Chi-square with expected 100 000 per group, or a binomial z-test |
| M4.3 | Same simulation, a stricter critical value at every look |
| M4.4 | Treatment and control compete for the same supply |

## Part 5 hints

| Exercise | Hint |
|---|---|
| M5.1 | 200 − 40 − 25 − 10 − 30 ms remain for ranking |
| M5.2 | Latency = min(max of shard latencies, 30 ms); fraction = share of shards under 30 ms |
| M5.3 | 20 × 10<sup>6</sup> × 2 ms; compare with the freshness the tips need |
| M5.4 | Simulate an LRU cache over a Zipf trace for several sizes |

## Part 6 hints

| Exercise | Hint |
|---|---|
| M6.1 | Σ (a − e) ln(a / e) |
| M6.2 | Unit changes move feature distributions instantly; tactics changes do not |
| M6.3 | A drifting coefficient; for each week evaluate the model trained at the last retraining |

## Part 7 hints

| Exercise | Hint |
|---|---|
| M7.1 | Few labels: unsupervised baselines per meter (forecast residuals), then human feedback for labels |
| M7.2 | Two-sided marketplace: seekers and recruiters; avoid flooding popular jobs |
| M7.3 | Account-level and message-level signals; privacy limits content inspection |
| M7.4 | Hierarchical time series; quantile forecasts; weather forecasts are themselves uncertain |
| M7.5 | Offline golden sets, automatic checks (tests pass), human and LLM judges, online acceptance rate |
