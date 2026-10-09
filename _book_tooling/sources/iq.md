# How to use this practice book
%24 interview-format exercises matching the Data Science Interview Prep guide, with hints and executed solutions

Each part matches chapters of the **Data Science Interview Prep** guide. SQL exercises use the practice shop database created by the first program of the guide's Chapter 1 (`shop.db`: tables `users`, `events` and `orders`); run that program once before starting. Answer the way you would in an interview: state assumptions, write the query or code, then check the result.

| Type | What you do |
|---|---|
| SQL | Write and run a query |
| Code | Write and run pandas or Python |
| Numerical | Calculate by hand, then check |
| Debug | Find what makes the answer wrong and fix it |
| Case | Answer an open product or analysis question with structure |

**Marking scheme.** Mark ✓ (solved alone within the suggested time), ~ (with the hint or over time) or ✗ (needed the solution). Suggested times: SQL and Code 10–15 minutes, Numerical 5 minutes, Case 10 minutes spoken aloud. Redo every ~ and ✗ a week later.

| Part | Guide chapters | Topic | Exercises |
|---|---|---|---|
| 1 | 1 | SQL | 7 |
| 2 | 2 | pandas | 5 |
| 3 | 3–4 | Probability and statistics | 7 |
| 4 | 5–6 | Metrics, product sense and cases | 5 |

# Exercises

## Part 1: SQL

**I1.1 · Easy · SQL · Users who never ordered.** For each country, count users who have never placed an order, and their share of the country's users.

**I1.2 · Medium · SQL · Month-over-month growth.** Compute completed revenue per country per month and the percentage change from the previous month for that country.

**I1.3 · Medium · SQL · How concentrated is revenue?** For each country, what share of completed revenue comes from the top 10% of its buyers?

**I1.4 · Medium · SQL · A true 7-day moving average.** Compute daily completed revenue with a 7-day moving average over **calendar** days for January 2026, including days with no orders.

**I1.5 · Medium · SQL · Median days to first purchase.** For each platform, compute the median number of days from signup to first order. SQLite has no `MEDIAN` function.

**I1.6 · Hard · SQL · Always spending more.** Find users with at least three orders whose order amounts strictly increased with every successive order.

**I1.7 · Medium · Debug · The inflated average order value.** This query reports average order value per platform. Why are the numbers wrong, and what is the fix?

```text
SELECT u.platform, AVG(o.amount) AS aov, SUM(o.amount) AS revenue
FROM users u
JOIN orders o ON o.user_id = u.user_id
JOIN events e ON e.user_id = u.user_id
WHERE o.status = 'completed'
GROUP BY u.platform;
```

## Part 2: pandas

**I2.1 · Easy · Code · Shares by segment.** From the users table, produce a table of the share of each platform within each country, and the country with the highest iOS share.

**I2.2 · Medium · Code · The price at order time.** Prices change on known dates. Attach to each order the price that was in force when it was placed, using `merge_asof`, and compute revenue.

**I2.3 · Medium · Code · Rolling 7-day active users.** From the events table, compute for each day the number of distinct users active in the 7 days ending that day.

**I2.4 · Medium · Debug · The update that did nothing.** An analyst writes `df[df.status == 'cancelled']['amount'] = 0` to zero out cancelled amounts. Show what happens in pandas 3 and fix it.

**I2.5 · Medium · Code · A cohort retention matrix.** Using events and users, build a matrix with signup week as rows, weeks since signup (0–3) as columns, and the share of the cohort active as values.

## Part 3: Probability and statistics

**I3.1 · Easy · Numerical · Any server down.** Three independent servers each fail on a given day with probability 2%. What is the probability that at least one fails? That all three fail?

**I3.2 · Medium · Numerical · Distinct birthdays.** What is the expected number of distinct birthdays among 30 people? Check by simulation.

**I3.3 · Medium · Numerical · The spam filter.** 30% of email is spam. The word "free" appears in 60% of spam and 5% of other email. Given that an email contains "free", what is the probability it is spam?

**I3.4 · Medium · Numerical · Sample size for a conversion test.** Baseline conversion is 10%. How many users per group are needed to detect an increase to 11% with α = 0.05 (two-sided) and 80% power?

**I3.5 · Medium · Code · Elasticity from a log regression.** Simulate demand with a price elasticity of −1.8, fit log(quantity) on log(price), and interpret the coefficient. What would a 5% price increase do to quantity and to revenue?

**I3.6 · Medium · Numerical · Who wins the coin game?** Two players take turns flipping a fair coin; the first to get heads wins. What is the probability that the player who goes first wins?

**I3.7 · Medium · Numerical · An interval for a conversion rate.** 45 of 500 visitors converted. Give a 95% confidence interval with the normal approximation and with the Wilson method. When do they differ much?

## Part 4: Metrics, product sense and cases

**I4.1 · Medium · Case · Metrics for shared rides.** A ride-hailing app launches "shared rides" (cheaper, with a detour). Define the primary metric, supporting metrics and guardrails.

**I4.2 · Medium · Code · Conversion dropped 7%.** Overall checkout conversion fell from 3.20% to 2.97% week over week. Given visitors and orders by traffic source for both weeks, find out whether the product got worse.

**I4.3 · Easy · Case · Smartphones sold in India.** Estimate the number of smartphones sold in India per year, from two angles.

**I4.4 · Hard · Case · Launch the dark mode?** An A/B test of dark mode shows +1.5% session length (significant), no change in purchases, and a 0.4% rise in uninstalls (not significant, p = 0.12). Should it launch?

**I4.5 · Medium · Case · Critique a take-home summary.** A candidate writes: "Customers who use the loyalty app spend 40% more, so the app increases spending by 40%. We should push all customers to install it. Our model has 92% accuracy at predicting app users." List the problems and rewrite the conclusion.
