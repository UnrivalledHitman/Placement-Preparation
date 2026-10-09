# How to use this practice book
%24 exercises matching the Applied Data Science guide, with hints kept separate and executed solutions

Each part matches chapters of the **Applied Data Science** guide. Code exercises use Python with pandas, scikit-learn, LightGBM and statsmodels, on generated data with fixed seeds, so your numbers should match the solutions when you use the same seeds. Numerical exercises can be done by hand first. Concept and design exercises are answered the way you would in an interview: state the method, its assumption, and how you would check the assumption.

| Type | What you do |
|---|---|
| Code | Write and run an analysis |
| Numerical | Calculate, then check |
| Debug | Find what makes a result wrong, show it, fix it |
| Concept | Explain the method, its assumptions and its failure modes |
| Design | Plan an analysis or programme end to end |

**Marking scheme.** Mark ✓ (solved alone), ~ (with the hint) or ✗ (needed the solution). For Code and Debug, ✓ also requires stating **how you know the answer is right**: a baseline beaten, a known true effect recovered, or an assumption checked. Redo every ~ and ✗ a week later.

| Part | Guide chapters | Topic | Exercises |
|---|---|---|---|
| 1 | 1–3 | Features, boosting and explanations | 6 |
| 2 | 4–5 | Experiments and causal inference | 6 |
| 3 | 6–7 | Forecasting and survival | 6 |
| 4 | 8–9 | Recommenders and case studies | 6 |

# Exercises

## Part 1: Features, boosting and explanations

**E1.1 · Easy · Numerical · Smoothed target encoding.** The overall churn rate is 20% and the smoothing strength is k = 20. Encode a city with 3 customers of whom 2 churned, and a city with 300 customers of whom 150 churned. Why do the two encodings move so differently from their raw rates?

**E1.2 · Medium · Debug · The model that predicts noise.** An analyst has 200 rows and 2,000 random features with random labels. They select the 20 features most correlated with the label using all rows, then report 5-fold cross-validated AUC. Show what they report, explain it, and fix it.

**E1.3 · Medium · Code · Boosting for classification from scratch.** Implement gradient boosting for binary classification with log loss: start from the log-odds of the base rate, fit depth-2 regression trees to the residuals y − p, and add them with learning rate 0.1. Show the training and validation log loss falling over 100 rounds.

**E1.4 · Medium · Code · Where overfitting starts.** Train LightGBM for 2,000 rounds with learning rate 0.1 on noisy data, recording training and validation log loss every round. Find the best round and show what happens to both losses after it.

**E1.5 · Medium · Code · Grouped permutation importance.** A churn model uses `monthly_kwh`, `quarterly_kwh` (nearly the same information) and `tickets`. Show that permuting each usage column alone understates usage, and that permuting both together reveals its true importance.

**E1.6 · Medium · Concept · Explaining a rejection.** A credit model rejects an applicant, and the officer must give the main reasons. How would you produce them with SHAP, what would you say about them, and what are the limits of such an explanation?

## Part 2: Experiments and causal inference

**E2.1 · Easy · Numerical · Is this split broken?** A 50/50 test has 10,400 users in treatment and 10,000 in control. Compute the chi-squared statistic and decide whether there is a sample ratio mismatch at p < 0.001. What are three likely causes if there is?

**E2.2 · Medium · Code · How much does CUPED save?** If the pre-period metric correlates 0.6 with the experiment metric, by what factor does CUPED reduce the users needed for the same power? Verify on one simulated experiment by computing θ, the adjusted variance and the standard error of the lift with and without CUPED.

**E2.3 · Medium · Numerical · Benjamini–Hochberg by hand.** Eight metrics have p-values 0.001, 0.008, 0.012, 0.041, 0.049, 0.20, 0.47 and 0.81. Which are significant uncorrected at 0.05, with Bonferroni, and with Benjamini–Hochberg at a 5% false discovery rate?

**E2.4 · Medium · Code · A placebo test for difference-in-differences.** Simulate a treated city whose sales were already growing faster than the control city's before a campaign. Show that difference-in-differences then overstates the campaign effect, and show how a placebo test on the pre-period exposes the problem.

**E2.5 · Hard · Code · Poor overlap in IPW.** Simulate treatment assignment that is nearly deterministic for some customers (propensities near 0 or 1). Show how the IPW estimate and its weights behave, and compare trimming propensities to [0.05, 0.95].

**E2.6 · Medium · Concept · Choose the method.** Choose and justify a method for each: (a) a new onboarding flow, randomisable; (b) a loyalty programme for customers spending over ₹50,000 a year; (c) a price increase in one state only, from a known date; (d) measuring the effect of using a budgeting feature, where a random half of users got a reminder email about it.

## Part 3: Forecasting and survival

**E3.1 · Easy · Numerical · MAPE versus WAPE.** Actual daily sales are 2, 100, 100 and 100 units; forecasts are 6, 90, 110 and 100. Compute MAE, MAPE and WAPE, and explain which one a store manager should see.

**E3.2 · Medium · Debug · Random splits flatter a forecaster.** Train a gradient-boosted model on lag features of a trending, seasonal series and evaluate it with shuffled 5-fold cross-validation and with a time-ordered split. Show the difference and explain it.

**E3.3 · Medium · Code · Trees cannot extrapolate a trend.** Forecast the last 60 days of a steadily growing series with LightGBM on calendar features, then forecast the **differences** instead and add them back. Compare both with the truth.

**E3.4 · Easy · Numerical · Kaplan–Meier by hand.** Eight customers have tenures (months, + = still active): 2, 3+, 4, 4, 6+, 7, 9+, 10. Compute the Kaplan–Meier survival curve and the median lifetime, and check it in code.

**E3.5 · Medium · Code · What is an annual contract worth?** Monthly-plan customers have a median lifetime of 10 months; annual-plan customers, 30 months (Weibull shape 1.2). Margin is ₹400 a month and the monthly discount rate 1%. Compute both 5-year lifetime values and the most the company should pay to move one customer from monthly to annual.

**E3.6 · Medium · Concept · Framing churn.** Compare framing churn prediction as "will this customer churn in the next 30 days?" (classification) with modelling time to churn (survival). When is each better, and what goes wrong with the classification framing if it is done carelessly?

## Part 4: Recommenders and case studies

**E4.1 · Easy · Code · Item-item CF by hand.** Five users interacted with items A–E as follows: U1 {A, B}, U2 {A, B, C}, U3 {B, C}, U4 {C, D}, U5 {A, B, E}. Compute cosine similarities between items, and recommend one item to a new user who has interacted with A only.

**E4.2 · Medium · Code · Trading recall for coverage.** Using a simulated catalogue, re-rank item-item CF scores by dividing by popularity<sup>α</sup> for α = 0, 0.25, 0.5 and 1. Report recall@10 and coverage for each and recommend a setting.

**E4.3 · Medium · Concept · Cold start.** A music service launches in a new country with no listening history there. How do you recommend songs on day 1, in week 1 and after three months?

**E4.4 · Hard · Design · Should we roll out the new pricing?** A pricing change was A/B tested for two weeks. Revenue per user rose 3.1% (95% CI 0.4% to 5.8%), conversion fell 1.2% (not significant), and the sample ratio check passed. Decide what else you need to know and what you would recommend.

**E4.5 · Hard · Design · A churn-reduction programme.** Design, end to end, a programme that offers retention discounts to customers likely to churn: data, models, who gets the offer, how you prove it works, and how you keep it working.

**E4.6 · Medium · Concept · A messy result.** A new checkout passes the sample ratio check; orders per user (primary) is flat (+0.3%, CI −0.8% to +1.4%); page load (guardrail) is 120 ms worse; mobile orders rose 2.5% (p = 0.03), one of 12 segments examined. Conclusion?
