# Chapter 10: Interview Checklist and Question Bank
%A one-page plan for the round, the numbers to know, and the questions asked most often

## 10.1 The one-page plan

| Step | Say or write | Do not forget |
|---|---|---|
| Clarify | Users, scale (QPS, catalogue size), latency, what "good" means for the business | Constraints: privacy, fairness, explainability, cold start |
| Frame | "This is a ranking / classification / regression / generation problem because the decision is …" | A non-ML baseline |
| Metrics | Business metric, online proxy, offline metric, guardrails | How offline and online metrics are linked |
| Data | Sources, label definition and delay, volume, splits by time | Leakage, position and exposure bias, imbalance |
| Features | Groups by freshness, online and offline computation | Training/serving skew prevention |
| Model | Baseline → simple model → justified complex model; multi-stage for large catalogues | Why this model: data size, latency, interpretability |
| Serving | Batch / online / hybrid, latency budget per stage, caching, fallbacks | Numbers: p99, cost per 1 000 requests |
| Evaluation | Offline on a time-based holdout; A/B test with sample size; rollout plan | Calibration if probabilities drive decisions |
| Monitoring | Data quality, drift (PSI), outcome metrics, business KPIs | Retraining strategy with an evaluation gate |

## 10.2 Numbers worth remembering

| Quantity | Typical value |
|---|---|
| Users notice latency above | ~100 ms for interactions; feeds and search budgets are 100–300 ms end to end |
| Online feature store lookup | 1–10 ms (Redis, Cassandra, DynamoDB) |
| Gradient-boosted tree inference | Microseconds per row on CPU; thousands of rows in milliseconds |
| Approximate nearest-neighbour search over 10<sup>7</sup>–10<sup>8</sup> vectors | A few milliseconds (HNSW, IVF-PQ) |
| Small transformer encoder (BERT-base) on GPU | ~5–20 ms per batch of short texts |
| LLM generation | Tens of tokens per second per stream for large models; first token in hundreds of milliseconds |
| A/B test sample size | Halve the detectable effect → four times the users (Chapter 5.2) |
| PSI thresholds | < 0.1 stable, 0.1–0.25 moderate, > 0.25 large (Chapter 7.2) |
| Probability of at least one slow call in a fan-out of *k* | 1 − (1 − p)<sup>k</sup> (Chapter 6.3) |

## 10.3 Question bank

| Question | Core of a good answer |
|---|---|
| Your offline metric improved but the A/B test was flat. Why? | Offline metric not aligned with the business metric; training/serving skew; leakage inflated offline results; logged data biased by the old model; novelty or seasonality; underpowered test |
| How do you handle class imbalance? | Choose PR-based or cost-based metrics; class weights or negative downsampling; correct probabilities afterwards; threshold by cost |
| What is training/serving skew and how do you prevent it? | Features computed differently in training and serving; one feature definition (feature store), log served features and train on them, monitor distributions |
| How do you detect data leakage? | Suspiciously high offline scores; feature importance dominated by one feature; ask "known at prediction time?"; point-in-time joins; time-based splits |
| Why split by time? | Random splits let the model see the future; time splits mimic deployment and reveal decay |
| Precision–recall trade-off: how do you pick the threshold? | From costs (calibrated probability > c_FP / (c_FP + c_FN)), or from operational capacity (alerts per day), shown as a table to the business |
| What is calibration and when does it matter? | Predicted probabilities match observed frequencies; matters when probabilities feed decisions, auctions or other models; fix with isotonic or Platt scaling on held-out data |
| Why two-stage retrieval and ranking? | Cannot score millions of items per request; cheap high-recall retrieval, then expensive precise ranking on hundreds |
| How do you handle cold start? | Content features and embeddings, popularity by segment, exploration traffic, onboarding questions, fast online updates |
| What is position bias? | Higher positions get more clicks regardless of relevance; correct with randomisation, propensity weighting, or position as a training feature fixed at serving |
| How long should an A/B test run? | Until the pre-computed sample size is reached, and at least one or two full weeks; never stop at the first significant day |
| Data drift versus concept drift? | Inputs change versus the input–output relationship changes; PSI/KS catch the first, only outcome metrics catch the second |
| When do you retrain? | Schedule or trigger (drift, metric drop), always with an evaluation gate, shadow or canary rollout |
| How do you evaluate a RAG system? | Retrieval separately (recall@k, MRR on labelled questions), then answer faithfulness, correctness and citations by humans and a calibrated LLM judge |
| How do you reduce LLM serving cost? | Routing/cascades (count the escalation tax), smaller or quantised models, prompt and response caching, shorter contexts, batching |
| How do you make an ML system fair? | Measure metrics per segment; check training data representation; constraints or post-processing on thresholds; human review for high-stakes decisions |

## 10.4 Practical lessons

- Follow the framework; the interviewer is grading completeness and judgement as much as model knowledge.
- Quote numbers: latency budgets, sample sizes, costs.
- Mention failure modes before you are asked: leakage, skew, bias, drift, feedback loops.
- End every design with monitoring and iteration: an ML system is never finished.
