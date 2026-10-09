# Hints
%Read only the hint for the exercise you are stuck on

## Part 1 hints

| Exercise | Hint |
|---|---|
| P1.1 | Code, data, configuration, environment, model artefact, evaluation, approvals |
| P1.2 | Compare the improvement with the standard deviation across seeds; better, evaluate both models on the same splits |
| P1.3 | `filter_string="metrics.latency_ms < 5"` and `order_by=['metrics.auc DESC']` |
| P1.4 | `get_model_version_by_alias`, read both runs' metrics, then `set_registered_model_alias` |
| P1.5 | A DataFrame-level `pa.Check(lambda df: ...)` with `element_wise=False` returning a boolean Series |
| P1.6 | Quantile bins do not exist for strings; compare category shares, with a small floor for unseen ones |

## Part 2 hints

| Exercise | Hint |
|---|---|
| P2.1 | Include `fn.__code__.co_code` (or the source text) in the cache key |
| P2.2 | Sensors for data arrival, task groups, `retries` with delay, SLAs, idempotent writes per partition date |
| P2.3 | `monotone_constraints=[1, 0, 0]` makes predictions non-decreasing in the first feature |
| P2.4 | Make the segment's churn depend on a different feature than everyone else's |
| P2.5 | Compare the feature's timestamp with the prediction time; a leak shows as an implausibly strong feature |
| P2.6 | Fast and code-only in CI; data-dependent in the pipeline; system behaviour before deploy; live signals in production |

## Part 3 hints

| Exercise | Hint |
|---|---|
| P3.1 | `Field(max_length=100)` on a list in a Pydantic model; `Response.headers` |
| P3.2 | `skl2onnx.to_onnx(pipeline, X[:1])`; the scaler's statistics travel with the model |
| P3.3 | P(slowest > 20 ms) = 1 − 0.99<sup>n</sup> |
| P3.4 | Exponential quantile: −mean × ln(1 − q) |
| P3.5 | Group by segment; agreement = mean of equal decisions; spread = standard deviation of scores |
| P3.6 | Shadow, then staged canary with fraud-loss and false-decline guardrails, then holdout |

## Part 4 hints

| Exercise | Hint |
|---|---|
| P4.1 | Concurrency = 800 × 0.05; replicas = ⌈concurrency × 1.5 / 8⌉ |
| P4.2 | Efficiency = 1 / (1 + communication / (compute / N)) |
| P4.3 | Young: τ ≈ √(2 × checkpoint cost × mean time between failures) |
| P4.4 | Parse a `[doc:ID]` tag from the answer; check it is in the retrieved set and contains the number |
| P4.5 | Expected cost and accuracy are weighted averages over easy and hard traffic |
| P4.6 | Managed and open-source pieces that compose; avoid platforms the team must operate |
