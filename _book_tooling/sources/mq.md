# How to use this practice book
%29 exercises matching the ML System Design guide, with hints kept separate and executed Python solutions

Each part matches chapters of the **ML System Design** guide. Numerical and Code exercises have Python solutions that were run to produce their outputs (NumPy and scikit-learn, fixed seeds). Design exercises in Part 7 are full interview prompts: set a 45-minute timer, write your answer under the framework headings of the guide's Chapter 10, then compare with the solution's rubric.

| Type | What you do |
|---|---|
| Concept | Explain, classify or criticise, in words |
| Numerical | Compute a number (sample size, threshold, latency, cost) and interpret it |
| Code | Write a short simulation or analysis and read its result |
| Design | Produce a full system design and grade it with the rubric |

**Marking scheme.** Mark each attempt ✓ (solved alone), ~ (solved with the hint) or ✗ (needed the solution). For Design exercises, count the rubric items you covered: 8 or more of 10 is ✓, 5–7 is ~, fewer is ✗. Redo every ~ and ✗ a week later and record it in the tracker.

| Part | Guide chapters | Topic | Exercises |
|---|---|---|---|
| 1 | 1 | Framing and metrics | 4 |
| 2 | 2 | Data, labels and leakage | 4 |
| 3 | 3–4 | Features and offline evaluation | 5 |
| 4 | 5 | Online experiments | 4 |
| 5 | 6 | Serving | 4 |
| 6 | 7 | Monitoring and retraining | 3 |
| 7 | 8–10 | Full design prompts | 5 |

# Exercises

## Part 1: Framing and metrics

**M1.1 · Easy · Concept · Name the task.** For each product goal, give the decision, the ML task and a label: (a) show the best five jobs to a job seeker; (b) predict how many kWh a housing society will use tomorrow; (c) flag smart meters likely to fail within 30 days for a technician visit; (d) auto-reply to "where is my order?" emails; (e) choose which of 3 discount levels to offer each customer.

**M1.2 · Medium · Concept · Metrics at three levels.** For a job-recommendation system, propose one business metric, two online proxy metrics, one offline metric and two guardrails, and say how each could be gamed if optimised alone.

**M1.3 · Medium · Numerical · Thresholds from costs.** A meter-failure model outputs calibrated probabilities. A technician visit costs Rs 800; an unnoticed failure costs Rs 6 000 in lost billing and emergency repair. Find the probability above which a visit is worth it. How does the threshold change if visits cost Rs 1 500 in remote villages?

**M1.4 · Easy · Concept · ML or not?** Decide whether to use ML for each and justify: (a) blocking payments from countries under sanctions; (b) estimating the delivery time of food orders; (c) detecting meter tampering from consumption patterns; (d) calculating a bill from units and a tariff table; (e) ranking support tickets by urgency.

## Part 2: Data, labels and leakage

**M2.1 · Medium · Concept · Find the leaks.** A loan-default model has these features. Which leak, and why? (a) applicant income; (b) number of collection calls made to the applicant; (c) credit score at application time; (d) "account closed" flag from the current database; (e) number of previous loans; (f) interest rate assigned after approval by an underwriter who saw the risk score.

**M2.2 · Medium · Code · Leakage through preprocessing.** Show with a simulation that fitting feature selection on the **whole** dataset before cross-validation produces an optimistic score even when the features are pure noise, and that doing it inside each fold does not.

**M2.3 · Medium · Concept · Delayed labels.** Chargebacks arrive up to 90 days after a transaction. You retrain weekly. Which transactions should be in the training set, how do you evaluate the newest model, and what happens if you include last week's transactions as "not fraud"?

**M2.4 · Medium · Numerical · Downsampling correction.** Negatives were kept with probability 2%. The model trained on that data outputs 0.30 for a transaction. What is the corrected probability? Verify by simulation.

## Part 3: Features and offline evaluation

**M3.1 · Medium · Concept · Skew hunt.** List five concrete ways a "spend in the last 7 days" feature can differ between the training pipeline and the online service, and one check that would detect each.

**M3.2 · Medium · Code · Precision at the operating point.** A model must flag at most 200 accounts per day for manual review out of 100 000 (0.2% fraud). Simulate scores, choose the threshold that fills the review capacity, and report precision, recall and how many frauds escape per day.

**M3.3 · Medium · Code · Calibration check.** Train a random forest on an imbalanced problem, compute a 10-bin reliability table and the Brier score, then calibrate with isotonic regression on a separate split and show both again.

**M3.4 · Easy · Numerical · Ranking metrics by hand.** A search returns 6 results with graded relevance `[2, 0, 3, 0, 1, 0]` (there is one other relevant document with grade 2 that was not returned). Compute P@3, recall@6, MRR and NDCG@6 (gain 2<sup>rel</sup> − 1, discount log<sub>2</sub>(rank + 1)), where the ideal ordering uses all relevant documents.

**M3.5 · Hard · Concept · Offline up, online flat.** A new ranker improves offline NDCG by 4% but the A/B test shows no change in purchases. Give six possible causes and how you would check each.

## Part 4: Online experiments

**M4.1 · Easy · Numerical · Sample size.** Conversion is 2%. How many users per group are needed to detect a 5% relative lift with α = 0.05 and 80% power? How many days with 50 000 new users a day split 50/50? What if you accept detecting only a 10% lift?

**M4.2 · Medium · Code · Sample ratio mismatch.** An experiment planned 50/50 shows 101 200 users in control and 98 800 in treatment. Test whether this is plausible, and list three bugs that cause it.

**M4.3 · Medium · Code · Peeking with a correction.** Repeat the guide's A/A peeking simulation, then show that requiring |z| > 2.8 at the daily looks (a simple, conservative alpha-spending substitute) brings the false-positive rate back to about 5% or below.

**M4.4 · Medium · Concept · Experiment design for a marketplace.** You change the ranking for an electricity-supply marketplace where buyers compete for limited supply from producers. Why can a user-level A/B test give a biased answer, and what designs avoid it?

## Part 5: Serving

**M5.1 · Medium · Numerical · Latency budget.** A recommendation request has 200 ms at p99. The network takes 40 ms, feature lookups 25 ms, ranking 300 candidates costs 0.15 ms per candidate on one CPU core, and re-ranking 10 ms. How many candidates can you rank on one core within budget with 30 ms of slack? With 4 cores in parallel?

**M5.2 · Medium · Code · Fan-out with deadlines.** For a fan-out of 50 shards, simulate returning partial results after a 30 ms deadline: report the request latency (now capped) and the average fraction of shards included.

**M5.3 · Medium · Numerical · Batch or online?** 20 million users get a daily "energy-saving tip" ranked by a model taking 2 ms per user on one core. How many core-hours does a nightly batch need? When would you switch to online scoring instead?

**M5.4 · Medium · Code · Prediction caching.** Requests follow a Zipf distribution over 1 million queries. Simulate an LRU cache of model outputs and find the cache size needed for a 50% hit rate.

## Part 6: Monitoring and retraining

**M6.1 · Medium · Code · PSI by hand.** Compute the PSI between a reference and a current distribution over five bins with expected shares `[0.2, 0.2, 0.2, 0.2, 0.2]` and actual shares `[0.10, 0.15, 0.20, 0.25, 0.30]`, and classify the shift.

**M6.2 · Medium · Concept · Which monitor fires?** For each incident, say which monitor would catch it first (data quality, feature drift, score drift, outcome metric, business metric): (a) an upstream team changes amount from rupees to paise; (b) fraudsters move to a new merchant category with normal-looking amounts; (c) a festival sale doubles traffic and basket sizes; (d) the feature store stops updating a 1-hour aggregate; (e) a competitor launches and users churn.

**M6.3 · Hard · Code · Retraining cadence.** Under a steady drift, simulate a model retrained every 1, 4 and 12 weeks for a year and compare the average AUC, assuming each retraining uses the most recent 8 weeks of data.

## Part 7: Full design prompts

**M7.1 · Hard · Design · Smart-meter anomaly detection.** Design a system that flags meters with abnormal consumption (tampering, faults, leaks) for 2 million meters reporting every 15 minutes, with few labelled examples.

**M7.2 · Hard · Design · Job recommendations.** Design the "jobs for you" feed for a job portal with 30 million seekers and 2 million open jobs; recruiters pay per application.

**M7.3 · Hard · Design · Spam and abuse detection for a messaging app.** Design detection of spam messages and spam accounts for 100 million daily messages, with adversarial spammers and strict privacy requirements.

**M7.4 · Hard · Design · Household demand forecasting.** Design next-day hourly electricity demand forecasts for each of 10 000 feeders to plan purchases, with weather and holidays as inputs.

**M7.5 · Hard · Design · An evaluation platform for an LLM coding assistant.** Design how a company evaluates, compares and monitors changes to its coding assistant (new models, prompts, retrieval), before and after release.
