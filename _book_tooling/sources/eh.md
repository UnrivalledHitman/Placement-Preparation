# Hints
%Read only the hint for the exercise you are stuck on

## Part 1 hints

| Exercise | Hint |
|---|---|
| E1.1 | Encoding = (positives + k × prior) / (count + k) |
| E1.2 | The selection step saw the labels of the validation folds; put it inside the pipeline |
| E1.3 | Initial score log(p̄ / (1 − p̄)); p = sigmoid(score); residual y − p is the negative gradient of log loss |
| E1.4 | `evals_result_` holds the per-round losses; validation loss has a minimum, training loss does not |
| E1.5 | Shuffle both columns with the **same** permutation of rows |
| E1.6 | Largest positive contributions towards rejection; explanation of the model, not of the world |

## Part 2 hints

| Exercise | Hint |
|---|---|
| E2.1 | χ² = Σ (observed − expected)<sup>2</sup> / expected with expected 10,200 each |
| E2.2 | Required sample size scales with variance, which CUPED multiplies by 1 − ρ<sup>2</sup> |
| E2.3 | Sort p-values; find the largest i with p<sub>(i)</sub> ≤ 0.05 × i / 8; reject all up to it |
| E2.4 | Pretend the campaign started earlier, within the pre-period only: a "significant effect" there is a red flag |
| E2.5 | Weights are 1/e and 1/(1 − e); look at the largest weights |
| E2.6 | Randomised? Threshold? Known date and comparison group? A random nudge? |

## Part 3 hints

| Exercise | Hint |
|---|---|
| E3.1 | WAPE = Σ\|error\| / Σ actual |
| E3.2 | Shuffled folds let the model train on days after the ones it predicts |
| E3.3 | Trees predict within the range of training targets |
| E3.4 | At each event time multiply by (1 − events / at risk); censored customers leave the risk set after their time |
| E3.5 | CLV = Σ margin × S(t) / (1 + d)<sup>t</sup>; the difference bounds the incentive |
| E3.6 | Censoring, the prediction window and the moment features are taken |

## Part 4 hints

| Exercise | Hint |
|---|---|
| E4.1 | cos(i, j) = co-occurrences / √(count<sub>i</sub> × count<sub>j</sub>) |
| E4.2 | Larger α pushes popular items down; watch recall and coverage move in opposite directions |
| E4.3 | Content features, global popularity, onboarding choices, then collaborative filtering |
| E4.4 | Novelty effects, long-term retention, segments, guardrails, and whether the CI clears a minimum worthwhile effect |
| E4.5 | Survival for risk, uplift for whom to treat, a randomised holdout for proof |
| E4.6 | Primary metric first; guardrails can veto; segment findings after 12 looks need confirmation |
