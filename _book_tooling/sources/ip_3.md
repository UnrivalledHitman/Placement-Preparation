# Chapter 6: Case Interviews
%A structure for open questions, estimation, feature-success and launch decisions, and take-home assignments

## 6.1 A structure that works for most cases

Open questions ("How would you measure the success of Stories?", "Should we launch this feature?") are graded on structure, judgement and communication more than on a single right answer.

| Step | What to say |
|---|---|
| 1. Clarify | Restate the goal; ask about the product, users, time frame and constraints. "Success for whom: users, creators, the business?" |
| 2. Frame | Name the user journey and the decision the analysis supports |
| 3. Metrics | One primary metric, two or three supporting metrics, guardrails |
| 4. Method | Experiment if possible; otherwise a causal method (Applied Data Science guide, Chapter 5) or descriptive analysis with caveats |
| 5. Data | Which tables and events; known data-quality risks |
| 6. Decision rule | What result leads to which decision, decided in advance |
| 7. Risks and next steps | Biases, long-term effects, what you would do with more time |

## 6.2 Estimation questions

"How many online food orders are placed in Pune per day?" Interviewers want a transparent chain of assumptions, a sanity check from a second angle, and an honest range.

```python run A food-delivery estimate from two angles
pune_population = 7.0e6
households = pune_population / 3.8
online_share = 0.45                          # households that order online at all
orders_per_week = 1.2                        # among those households
demand_side = households * online_share * orders_per_week / 7
restaurants = 9000
active_share, orders_per_restaurant = 0.6, 22
supply_side = restaurants * active_share * orders_per_restaurant
print(f'demand side: {demand_side:,.0f} orders/day')
print(f'supply side: {supply_side:,.0f} orders/day')
low, high = 0.5 * min(demand_side, supply_side), 1.5 * max(demand_side, supply_side)
print(f'estimate: about {round((demand_side + supply_side) / 2, -4):,.0f} orders/day '
      f'(plausible range {round(low, -4):,.0f} to {round(high, -4):,.0f})')
```

Every number above is an assumption to state aloud, not a fact; the value is in the method. Two independent angles that land in the same range give confidence; if they disagree by ten times, say so and identify which assumption is weakest.

## 6.3 Worked case: measuring a new feature

**"We launched saved carts. How do we know if it works?"**

| Step | Answer |
|---|---|
| Clarify | Goal: recover purchases from users who leave with items in their cart. Launched to everyone or to a test group? |
| Primary metric | Purchase conversion within 7 days among users who added to cart |
| Supporting | Share of carts saved, saved-cart return rate, time to purchase |
| Guardrails | Average order value (saved carts may delay rather than add purchases), app performance, notification opt-outs |
| Method | A/B test with a holdout; if already launched to all, compare with a pre-launch period using difference-in-differences against a market or platform that did not get it |
| Pitfalls | Novelty; users who save carts are more engaged (selection: compare by assignment, not by usage); cannibalisation of existing reminder emails |
| Decision | Ship if 7-day conversion rises by at least the minimum worthwhile effect with no guardrail regression |

## 6.4 Worked case: launch or not

**"An experiment shows a new recommendation widget raises clicks 8% but session length falls 2%. Launch?"**

A strong answer refuses to choose a number blindly: clicks are an **input** metric, while session length could be a guardrail or a sign of efficiency. Ask what the widget is for. If users find what they want faster and purchases or retention rise, a shorter session is good news. If purchases are flat and sessions shorter, the widget may be distracting. Look at downstream outcomes (purchases per user, 7-day return rate), segments (new versus returning), and novelty over time. Recommend a decision rule based on the north-star metric, not on clicks.

## 6.5 Take-home assignments

| Do | Avoid |
|---|---|
| Start with a one-paragraph summary of findings and recommendation | Leading with code and charts |
| State assumptions and data-quality issues found | Silently dropping rows |
| Show a simple baseline before any model | A complex model with no comparison |
| Use clear charts with titles that state the finding | Default plots with unlabelled axes |
| Keep the notebook reproducible (seeds, versions, run top to bottom) | Hidden state and manual steps |
| End with limitations and next steps | Over-claiming causality from correlations |

## 6.6 Practical lessons

- Clarify the goal before choosing metrics; structure beats speed.
- One primary metric, supporting metrics and guardrails; a decision rule set in advance.
- Estimations: explicit assumptions, two angles, an honest range.
- Take-homes are read by busy people: findings first, then evidence, then caveats.

# Chapter 7: Mock Rounds and Final Checklist
%Timed practice rounds for each interview type, and what to revise in the last week

## 7.1 Mock SQL round (45 minutes)

Use the practice database from Chapter 1. Answer aloud, writing each query before running it.

| # | Question | Pattern |
|---|---|---|
| 1 | Revenue and number of buyers per platform for completed orders | GROUP BY with COUNT DISTINCT |
| 2 | The second-highest order amount per country | DENSE_RANK in a CTE |
| 3 | For each user, the number of days between signup and first purchase | MIN with a join and date difference |
| 4 | Daily completed revenue with a 7-day moving average over **calendar** days | Calendar table (recursive CTE) plus window |
| 5 | Share of users who purchased within 7 days of signup, by signup week | Conditional aggregation |
| 6 | Users who placed orders on three consecutive days | Gaps and islands |

```python run Reference answers to questions 2 and 6
import sqlite3, pandas as pd
con = sqlite3.connect('shop.db')
q = lambda sql: print(pd.read_sql(sql, con).to_string(index=False))
q('''
SELECT country, amount FROM (
    SELECT u.country, o.amount,
           DENSE_RANK() OVER (PARTITION BY u.country ORDER BY o.amount DESC) AS r
    FROM orders o JOIN users u ON u.user_id = o.user_id
) WHERE r = 2 ORDER BY country
''')
q('''
WITH days AS (SELECT DISTINCT user_id, order_date FROM orders),
grp AS (
    SELECT user_id, order_date,
           julianday(order_date)
             - ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY order_date) AS island
    FROM days
)
SELECT user_id, MIN(order_date) AS streak_start, COUNT(*) AS days
FROM grp GROUP BY user_id, island HAVING COUNT(*) >= 3 ORDER BY days DESC, user_id LIMIT 5
''')
```

The consecutive-days trick: for dates in a run, date minus row number is constant, so it identifies each "island".

## 7.2 Mock statistics and probability round (30 minutes)

1. A coin lands heads 60 times in 100 tosses. Is it fair? (Binomial or normal approximation: z = 2.0, p ≈ 0.046 two-sided; mention that 0.05 is a convention.)
2. Expected number of rolls of a die until the first 6? (6.) Until two consecutive 6s? (42.)
3. An A/B test gives p = 0.04 on the primary metric and p = 0.03 on one of ten secondary metrics. What do you report?
4. Explain a 95% confidence interval to a product manager in one sentence.
5. Why might a model with higher AUC lead to worse business results? (Calibration, thresholds, costs, segments; ML System Design guide, Chapter 4.)

```python run Checking questions 1 and 2
import numpy as np
from scipy.stats import binomtest
print(f'60 heads in 100: exact two-sided p = {binomtest(60, 100, 0.5).pvalue:.4f}')
rng = np.random.default_rng(88)
waits = []
for _ in range(20_000):
    run, n = 0, 0
    while run < 2:
        n += 1
        run = run + 1 if rng.integers(1, 7) == 6 else 0
    waits.append(n)
print(f'rolls until two consecutive sixes: simulated {np.mean(waits):.1f} (exact 42)')
```

The exact binomial p-value (about 0.057) is slightly above the normal approximation's 0.046: at exactly this borderline, the two methods land on opposite sides of 0.05. Say so: the evidence against fairness is weak either way.

## 7.3 Mock product round (30 minutes)

Pick one and answer with the structure from Chapter 6, out loud, in under ten minutes, then critique yourself against the table in §6.1.

- Orders in one city fell 15% week over week. Walk through your investigation.
- Design the metrics for a new "group order" feature in a food-delivery app.
- Your team wants to send more push notifications because they raise daily active users. What would you check first?
- How would you decide the price of a premium subscription tier?

## 7.4 The final week

| Day | Focus |
|---|---|
| 1 | SQL patterns from Chapter 1: write each from memory, then run it |
| 2 | pandas: groupby/transform, merges with validation, reshaping, dates |
| 3 | Probability: redo the fifteen puzzles without notes |
| 4 | Statistics: p-values, intervals, power, regression output, A/B pitfalls |
| 5 | Product sense: two metric-design and two metric-drop cases aloud |
| 6 | ML: the question banks of the AI/ML, Applied Data Science and ML System Design guides |
| 7 | Rest; prepare three project stories with impact numbers (the Interview and HR guide's STAR method) |

## 7.5 Practical lessons

- Practise aloud and timed; interviews test communication under pressure.
- Keep a written list of patterns (SQL), puzzles (probability) and frameworks (product).
- Verify answers when you can: run the query, simulate the puzzle, sanity-check the estimate.
- Prepare project stories with numbers; they come up in every loop.
