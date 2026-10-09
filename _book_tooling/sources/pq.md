# How to use this practice book
%24 exercises matching the MLOps guide, with hints kept separate and executed solutions

Each part matches chapters of the **MLOps** guide. Code exercises use the same libraries as the guide (MLflow with a local SQLite store, Pandera, pytest, FastAPI's test client, skl2onnx and onnxruntime, LightGBM and scikit-learn); install them with `pip install mlflow pandera pytest fastapi httpx skl2onnx onnxruntime lightgbm`. Design exercises are answered as you would in a system design interview: components, decisions, failure handling and how you would know it works.

| Type | What you do |
|---|---|
| Code | Build and run the piece of infrastructure |
| Numerical | Calculate, then check |
| Debug | Find the defect, show it, fix it |
| Concept | Explain the practice and its trade-offs |
| Design | Plan a system or process end to end |

**Marking scheme.** Mark ✓ (solved alone), ~ (with the hint) or ✗ (needed the solution). For Code, ✓ also requires that the solution would survive a rerun: fixed seeds, a fresh tracking store or idempotent steps, and deterministic output. Redo every ~ and ✗ a week later.

| Part | Guide chapters | Topic | Exercises |
|---|---|---|---|
| 1 | 1–3 | Reproducibility, tracking and data validation | 6 |
| 2 | 4–5 | Pipelines and testing | 6 |
| 3 | 6–8 | Serving, monitoring and rollouts | 6 |
| 4 | 9–11 | Scaling, cost, LLMOps and platforms | 6 |

# Exercises

## Part 1: Reproducibility, tracking and data validation

**P1.1 · Easy · Concept · The reproducibility checklist.** Six months from now, an auditor asks you to reproduce the exact model that approved a loan today. List everything you must have recorded, and where each item lives.

**P1.2 · Medium · Code · Is +0.005 AUC real?** Train the same LightGBM model with 10 different train/test split seeds and report the mean and standard deviation of test AUC. A colleague's new feature improved AUC by 0.005 on one split. Is that convincing?

**P1.3 · Medium · Code · Querying runs with a constraint.** Log six MLflow runs with parameters `num_leaves` and a measured `latency_ms` metric, then use `search_runs` with a filter to find the most accurate run whose latency is under 5 ms.

**P1.4 · Medium · Code · A promotion script.** Write a function that promotes a newly registered model version to the `champion` alias only if its test AUC beats the current champion's by at least 0.002, and otherwise sets it as `challenger`. Demonstrate both outcomes.

**P1.5 · Medium · Code · A schema with a cross-column check.** Write a Pandera schema for order lines (`qty` ≥ 1, `unit_price` > 0, `amount` = qty × unit_price within ₹0.01, `currency` = INR). Show the failures it reports for a batch with three different defects.

**P1.6 · Medium · Debug · PSI for a categorical feature.** A PSI function written for numeric features is applied to the categorical `plan` column, and a new category `enterprise` appears in production. Show what goes wrong and write a categorical PSI that handles unseen categories.

## Part 2: Pipelines and testing

**P2.1 · Medium · Code · Code changes must invalidate the cache.** Using a cached-step decorator like the guide's, show that editing a step's code (not its inputs) forces it and its downstream steps to rerun. What would go wrong if the cache key ignored code?

**P2.2 · Medium · Design · An Airflow DAG.** Design the DAG for daily batch scoring of churn risk and weekly retraining: tasks, dependencies, schedules, retries, alerts, and what happens when the data for a day arrives late.

**P2.3 · Medium · Code · Directional tests and monotone constraints.** Train LightGBM on noisy churn data and test that more support tickets never lower predicted risk. Show the test failing for an unconstrained model and passing with a monotone constraint.

**P2.4 · Medium · Code · A slice test that matters.** Build a model whose overall AUC is good but which performs poorly for a small segment (new customers), and write a slice test that catches it.

**P2.5 · Hard · Debug · A feature from the future.** A churn model includes `days_since_last_login`, computed at the time the training table was built, weeks after the prediction date. Show how this leak inflates offline metrics, and write a test that detects it.

**P2.6 · Medium · Concept · Where does each test run?** Place each in CI, the training pipeline, pre-deployment or production: (a) unit test of a feature function; (b) schema validation of the day's data; (c) AUC above the champion's; (d) p99 latency under 50 ms at 500 rps; (e) prediction distribution shift; (f) invariance to customer ID.

## Part 3: Serving, monitoring and rollouts

**P3.1 · Medium · Code · A safer batch endpoint.** Extend a FastAPI prediction service with a batch endpoint that rejects batches larger than 100 rows with HTTP 422 and returns the model version in a response header. Test both behaviours with the test client.

**P3.2 · Medium · Code · Exporting a whole pipeline to ONNX.** Export a scikit-learn pipeline (StandardScaler + LogisticRegression) to ONNX and verify that onnxruntime reproduces its probabilities. Why export the pipeline rather than the model alone?

**P3.3 · Medium · Numerical · Fan-out and the latency budget.** A request fetches features from three services in parallel; each call exceeds 20 ms in 1% of cases. What fraction of requests wait more than 20 ms for features? With ten services?

**P3.4 · Medium · Code · How long until we know?** Labels arrive after a delay that is exponential with a mean of 9 days. How many days after a prediction day are 50%, 80% and 95% of its labels known? What does that mean for a quality monitor?

**P3.5 · Medium · Code · Automated shadow checks.** Write a function that compares champion and challenger scores from shadow traffic per segment and flags segments where decision agreement is below 90% or the challenger's score spread collapses.

**P3.6 · Hard · Design · Rolling out a new fraud model.** Plan the rollout of a new card-fraud model: stages, guardrail metrics, decision rules, rollback, and how you will measure its long-term effect.

## Part 4: Scaling, cost, LLMOps and platforms

**P4.1 · Easy · Numerical · How many replicas?** Peak traffic is 800 requests per second, each takes 50 ms, and a replica handles 8 concurrent requests. With 50% headroom, how many replicas are needed?

**P4.2 · Medium · Numerical · When does adding GPUs stop paying?** A training step takes 1.0 s on one GPU; gradients are 1 GB; the network gives 5 GB/s. With ring all-reduce, at what number of GPUs does efficiency fall below 50%?

**P4.3 · Medium · Code · The best checkpoint interval.** Checkpointing takes 3 minutes and interruptions arrive on average every 6 hours. Use Young's formula to choose a checkpoint interval, then confirm by simulating a 40-hour job for several intervals.

**P4.4 · Medium · Code · Testing groundedness.** Extend an LLM evaluation harness with a check that each answer cites the ID of a document that was actually retrieved, and that the cited document contains the stated amount. Evaluate two stand-in versions.

**P4.5 · Medium · Numerical · Routing to a smaller model.** A large model costs ₹1.00 per request and answers 99% correctly; a small one costs ₹0.10 and answers 97% of easy requests and 70% of hard ones correctly. 70% of traffic is easy and a router identifies it perfectly. Compare cost and accuracy of all-large versus routing.

**P4.6 · Hard · Design · An MLOps stack for a five-person team.** A five-person team runs three tabular models (batch and online) on one cloud. Choose their tooling for tracking, registry, pipelines, validation, serving and monitoring, and justify what they should not build yet.
