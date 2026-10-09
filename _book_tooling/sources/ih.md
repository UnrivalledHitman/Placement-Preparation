# Hints
%Read only the hint for the exercise you are stuck on

## Part 1 hints

| Exercise | Hint |
|---|---|
| I1.1 | `LEFT JOIN orders` and keep rows where `o.order_id IS NULL`, or `NOT EXISTS` |
| I1.2 | Aggregate to (country, month) in a CTE, then `LAG(revenue) OVER (PARTITION BY country ORDER BY month)` |
| I1.3 | `NTILE(10) OVER (PARTITION BY country ORDER BY spend DESC)`; bucket 1 is the top 10% |
| I1.4 | A recursive CTE generates every date; `LEFT JOIN` revenue and `COALESCE` to 0 before the window |
| I1.5 | Number rows within each platform and count them; average the one or two middle rows |
| I1.6 | `LAG(amount)` per user; a user qualifies if no order is less than or equal to the previous one |
| I1.7 | How many rows does each order become after joining events? |

## Part 2 hints

| Exercise | Hint |
|---|---|
| I2.1 | `pd.crosstab(..., normalize='index')` |
| I2.2 | Both frames sorted by time; `merge_asof(orders, prices, left_on=..., right_on=..., direction='backward')` |
| I2.3 | Make a (day × user) activity indicator, then a rolling 7-day maximum per user, then count per day |
| I2.4 | Copy-on-write: a chained indexing result is a new object; use `.loc[mask, column]` |
| I2.5 | Week offset = (event date − signup date) // 7 days; count distinct users per (cohort, offset) |

## Part 3 hints

| Exercise | Hint |
|---|---|
| I3.1 | Complement: 1 − 0.98<sup>3</sup> |
| I3.2 | Linearity: each of the 365 days is someone's birthday with probability 1 − (364/365)<sup>30</sup> |
| I3.3 | P(spam \| free) = P(free \| spam)P(spam) / P(free) |
| I3.4 | n = (z<sub>α/2</sub> + z<sub>β</sub>)<sup>2</sup> (p<sub>1</sub>q<sub>1</sub> + p<sub>2</sub>q<sub>2</sub>) / (p<sub>2</sub> − p<sub>1</sub>)<sup>2</sup> |
| I3.5 | In a log–log model the coefficient is the elasticity |
| I3.6 | P = ½ + ¼P (if both miss, the game restarts) |
| I3.7 | Wilson: centre (p̂ + z²/2n)/(1 + z²/n) |

## Part 4 hints

| Exercise | Hint |
|---|---|
| I4.1 | Riders, drivers and the marketplace each need a metric; watch cannibalisation |
| I4.2 | Compare conversion within each source, then the traffic mix |
| I4.3 | Demand: population × owners × replacement cycle; supply: brands' shipments |
| I4.4 | Session length is not the goal; uninstalls are a guardrail with low power |
| I4.5 | Selection bias, causality, accuracy on an imbalanced target |
