# Chapter 2: pandas for Data Interviews
%Grouping, the merge that multiplies rows, reshaping, dates, missing values and vectorisation, as interviewers test them

## 2.1 Group, aggregate, transform

Three operations cover most grouping questions: `agg` collapses each group to one row, `transform` returns a value per **original row** (ideal for "share of the group total" or "difference from the group mean"), and `filter` keeps or drops whole groups.

```python run agg, transform and filter on the same orders
import sqlite3, pandas as pd
orders = pd.read_sql('SELECT * FROM orders', sqlite3.connect('shop.db'))
done = orders[orders.status == 'completed']
summary = done.groupby('user_id').agg(orders=('order_id', 'count'), spend=('amount', 'sum'),
                                      first=('order_date', 'min'))
print(summary.sort_values('spend', ascending=False).head(3).round(0))
user_total = done.groupby('user_id').amount.transform('sum')   # one value per original row
done = done.assign(share_of_user_spend=done.amount / user_total)
print(done[done.user_id == summary.spend.idxmax()][['order_date', 'amount',
        'share_of_user_spend']].round(2))
repeat = done.groupby('user_id').filter(lambda g: len(g) >= 3)
print(f'users with 3+ completed orders: {repeat.user_id.nunique()}, '
      f'their share of revenue {repeat.amount.sum() / done.amount.sum():.0%}')
```

## 2.2 The merge that multiplies rows

A join on a key that is **not unique on either side** produces every combination of matching rows. Totals computed after such a merge are silently inflated, and it is one of the most common real-world bugs. pandas can check the relationship for you with `validate`.

```python run A many-to-many merge inflates revenue
import pandas as pd
orders = pd.DataFrame({'user_id': [1, 1, 2], 'amount': [100, 200, 50]})
# user 1 has two
addresses = pd.DataFrame({'user_id': [1, 1, 2], 'city': ['Pune', 'Mumbai', 'Delhi']})
merged = orders.merge(addresses, on='user_id')
print(f'revenue before merge {orders.amount.sum()}, after merge {merged.amount.sum()} '
      f'({len(merged)} rows from {len(orders)})')
try:
    orders.merge(addresses, on='user_id', validate='many_to_one')
except pd.errors.MergeError as e:
    print('validate caught it:', str(e).splitlines()[0])
latest = addresses.drop_duplicates('user_id', keep='last')   # one row per user
print('after de-duplicating addresses:', orders.merge(latest, on='user_id',
        validate='many_to_one').amount.sum())
```

| Need | pandas |
|---|---|
| Inner / left / outer join | `merge(how='inner' / 'left' / 'outer')` |
| Anti-join (rows in A with no match in B) | `merge(how='left', indicator=True)` then keep `_merge == 'left_only'` |
| Semi-join (rows in A that have a match) | `A[A.key.isin(B.key)]` |
| Check key relationships | `validate='one_to_one'`, `'many_to_one'`, ... |
| Join on nearest earlier time | `pd.merge_asof` (for example, the price in force at order time) |

## 2.3 Reshaping

```python run pivot_table and melt
import sqlite3, pandas as pd
con = sqlite3.connect('shop.db')
df = pd.read_sql('''SELECT u.platform, u.country, o.amount FROM orders o
                    JOIN users u ON u.user_id = o.user_id
                    WHERE o.status = 'completed' ''', con)
wide = df.pivot_table(index='country', columns='platform', values='amount', aggfunc='sum',
                      fill_value=0, margins=True, margins_name='total').round(0)
print(wide)
long = wide.drop(index='total', columns='total').reset_index().melt(
    id_vars='country', var_name='platform', value_name='revenue')
print(long.sort_values('revenue', ascending=False).head(3).to_string(index=False))
```

## 2.4 Dates and time

```python run Weekly revenue, week-over-week growth and days to second order
import sqlite3, pandas as pd
orders = pd.read_sql("SELECT * FROM orders WHERE status = 'completed'",
        sqlite3.connect('shop.db'),
                     parse_dates=['order_date'])
weekly = orders.set_index('order_date').amount.resample('W-MON').sum()
growth = weekly.pct_change().round(3)
print(pd.DataFrame({'revenue': weekly.round(0), 'wow_growth': growth}).head(5))
orders = orders.sort_values(['user_id', 'order_date'])
orders['nth'] = orders.groupby('user_id').cumcount() + 1
first_two = orders[orders.nth <= 2].pivot(index='user_id', columns='nth',
        values='order_date').dropna()
gap = (first_two[2] - first_two[1]).dt.days
print(f'users with a second order: {len(gap)}; median days to second order: '
        f'{gap.median():.1f}')
```

## 2.5 Missing values and types

| Behaviour | Example | Consequence |
|---|---|---|
| `NaN != NaN` | `df[df.x == np.nan]` returns nothing | Use `isna()` |
| `groupby` drops NaN keys by default | Users with unknown country disappear | `groupby(..., dropna=False)` |
| Aggregations skip NaN | `mean()` ignores missing values | The denominator changes silently; decide whether missing means 0 |
| Integer columns become float with NaN | IDs turn into `123.0` | Nullable `Int64` dtype |
| Strings repeated millions of times | Large memory | `category` dtype |

```python run NaN in comparisons and groupby
import numpy as np, pandas as pd
df = pd.DataFrame({'country': ['IN', 'US', None, 'IN', None], 'spend': [100, 80, 50, np.nan,
        30]})
print('rows where spend == NaN:', len(df[df.spend == np.nan]), '| rows where spend isna():',
        df.spend.isna().sum())
print(df.groupby('country').spend.sum().to_dict(), '<- default drops missing countries')
print(df.groupby('country', dropna=False).spend.sum().to_dict())
print(f'mean ignoring NaN {df.spend.mean():.1f}; treating NaN as 0 '
        f'{df.spend.fillna(0).mean():.1f}')
```

## 2.6 Vectorise instead of looping

Row-by-row `apply` and Python loops are slow because each row passes through the interpreter. Column operations, `np.where`, `np.select`, `cut` and `map` run in compiled code.

```python run apply versus vectorised operations give the same answer, at different speeds
import time, numpy as np, pandas as pd
rng = np.random.default_rng(71)
df = pd.DataFrame({'amount': rng.gamma(2, 600, 200_000), 'country': rng.choice(['IN', 'US',
        'UK'], 200_000)})
def tier(row):
    return 'high' if row['amount'] > 2000 else ('mid' if row['amount'] > 500 else 'low')
t0 = time.perf_counter(); slow = df.apply(tier, axis=1); t_apply = time.perf_counter() - t0
t0 = time.perf_counter()
fast = pd.Series(np.select([df.amount > 2000, df.amount > 500], ['high', 'mid'], 'low'),
        index=df.index)
t_vec = time.perf_counter() - t0
print('identical results:', slow.equals(fast))
print('vectorised version at least 20x faster:', t_apply > 20 * t_vec)
print(fast.value_counts().to_dict())
```

## 2.7 Practical lessons

- `agg` for one row per group, `transform` for per-row group statistics, `filter` for whole groups.
- Validate merge relationships; a many-to-many join silently multiplies totals.
- Use `resample`, `shift`, `cumcount` and `merge_asof` for time questions.
- Check NaN behaviour explicitly, and vectorise instead of `apply`.

# Chapter 3: Probability Puzzles
%Fifteen classic interview puzzles, each solved on paper and checked by simulation

## 3.1 How to answer a probability question

1. Restate the question and define the sample space or random variable.
2. Look for a shortcut: complement ("at least one" = 1 − "none"), symmetry, linearity of expectation (works even for dependent variables), conditioning on the first step.
3. Compute, then sanity-check the number (is it between 0 and 1? does it move the right way if the inputs change?).
4. If allowed, simulate. Interviewers like candidates who say how they would verify.

## 3.2 Counting and complements

**Birthday problem.** How many people are needed for a better-than-even chance that two share a birthday? P(all distinct among n) = (365/365)(364/365)…((365 − n + 1)/365); it drops below 0.5 at **n = 23**.

**De Méré's bets.** "At least one six in 4 rolls" has probability 1 − (5/6)<sup>4</sup> = 0.518; "at least one double six in 24 rolls of two dice" has 1 − (35/36)<sup>24</sup> = 0.491. The second bet loses money, which puzzled 17th-century gamblers and started probability theory.

**Two children.** A family has two children, and at least one is a boy. P(two boys)? The equally likely cases BB, BG, GB remain, so **1/3**, not 1/2.

```python run Checking the counting puzzles
import numpy as np
rng = np.random.default_rng(72)
N = 200_000
p_distinct, n = 1.0, 0
while p_distinct > 0.5:
    n += 1; p_distinct *= (366 - n) / 365
bdays = rng.integers(0, 365, (N // 4, 23))
sim = np.mean([len(np.unique(r)) < 23 for r in bdays])
print(f'birthday: n = {n}, exact P(shared) {1 - p_distinct:.3f}, simulated with 23 people '
        f'{sim:.3f}')
four = (rng.integers(1, 7, (N, 4)) == 6).any(axis=1).mean()
d24 = ((rng.integers(1, 7, (N, 24)) == 6) & (rng.integers(1, 7, (N,
        24)) == 6)).any(axis=1).mean()
print(f'de Mere: one six in 4 rolls {four:.3f} (exact {1 - (5 / 6) ** 4:.3f}); '
      f'double six in 24 {d24:.3f} (exact {1 - (35 / 36) ** 24:.3f})')
kids = rng.integers(0, 2, (N, 2))                           # 1 = boy
has_boy = kids.max(axis=1) == 1
print(f'two children, at least one boy: P(two boys) {kids[has_boy].min(axis=1).mean():.3f} '
        f'(exact 0.333)')
```

## 3.3 Conditional probability and Bayes

**Medical test.** A disease affects 1% of people. A test detects 99% of cases (sensitivity) and correctly clears 95% of healthy people (specificity). Given a positive test, P(disease) = 0.99 × 0.01 / (0.99 × 0.01 + 0.05 × 0.99) = 0.0099 / 0.0594 = **16.7%**. The base rate dominates: most positives are false positives because healthy people vastly outnumber sick ones. The same logic applies to fraud alerts.

**Monty Hall.** You pick one of three doors; the host, who knows where the car is, opens another door with a goat. Switching wins **2/3** of the time: your first pick is right 1/3 of the time, and switching wins in every other case.

```python run Bayes and Monty Hall by simulation
import numpy as np
rng = np.random.default_rng(73)
N = 500_000
sick = rng.random(N) < 0.01
positive = np.where(sick, rng.random(N) < 0.99, rng.random(N) < 0.05)
print(f'P(disease | positive) simulated {sick[positive].mean():.3f}, exact '
        f'{0.0099 / 0.0594:.3f}')
car, pick = rng.integers(0, 3, N), rng.integers(0, 3, N)
print(f'Monty Hall: stay wins {np.mean(pick == car):.3f}, switch wins '
        f'{np.mean(pick != car):.3f}')
```

## 3.4 Expectation tricks

**Waiting for patterns.** A fair coin: expected tosses until the first head is 2. Until **HH**: let E be the expected number from scratch and E<sub>H</sub> after a head; E = 1 + ½E<sub>H</sub> + ½E and E<sub>H</sub> = 1 + ½·0 + ½E, giving **E = 6**. Until **HT** it is **4**: after an H, a further H does not reset progress. Patterns that overlap with themselves take longer.

**Coupon collector.** Expected rolls of a die to see all six faces: 6(1/1 + 1/2 + … + 1/6) = **14.7**. Each new face takes on average 6 / (faces still missing) rolls.

**Fixed points.** Shuffle n cards; the expected number left in their original position is **1** for every n, by linearity: each card stays put with probability 1/n. The probability of no fixed point tends to 1/e ≈ 0.368.

**Maximum of two dice.** E[max] = Σ k × P(max = k) = Σ k(2k − 1)/36 = **161/36 ≈ 4.47**.

```python run Checking the expectation puzzles
import numpy as np
rng = np.random.default_rng(74)

def wait_for(pattern, trials=40_000):
    total = 0
    for _ in range(trials):
        last, n = '', 0
        while not last.endswith(pattern):
            last = (last + 'HT'[rng.integers(0, 2)])[-2:]; n += 1
        total += n
    return total / trials

print(f'tosses until HH {wait_for("HH"):.2f} (exact 6), until HT {wait_for("HT"):.2f} '
        f'(exact 4)')
rolls = []
for _ in range(40_000):
    seen, n = set(), 0
    while len(seen) < 6:
        seen.add(int(rng.integers(1, 7))); n += 1
    rolls.append(n)
print(f'coupon collector, die: {np.mean(rolls):.2f} rolls (exact '
        f'{6 * sum(1 / k for k in range(1, 7)):.2f})')
perms = np.argsort(rng.random((100_000, 20)), axis=1)
fixed = (perms == np.arange(20)).sum(axis=1)
print(f'fixed points of a 20-card shuffle: mean {fixed.mean():.3f} (exact 1), '
      f'P(none) {np.mean(fixed == 0):.3f} (1/e = {np.exp(-1):.3f})')
dice = rng.integers(1, 7, (200_000, 2)).max(axis=1)
print(f'E[max of two dice] {dice.mean():.3f} (exact {161 / 36:.3f})')
```

## 3.5 Continuous and geometric puzzles

**Broken stick.** Break a stick at two uniformly random points. The pieces form a triangle when no piece is longer than half the stick, with probability **1/4**.

**Minimum of two uniforms.** For U<sub>1</sub>, U<sub>2</sub> uniform on [0, 1], E[min] = **1/3** (and E[max] = 2/3): two random points split the interval into three parts of equal expected length.

**Estimating π.** A random point in the unit square falls inside the quarter circle x<sup>2</sup> + y<sup>2</sup> < 1 with probability **π/4**.

**Three points on a circle** all lie in some semicircle with probability **3/4**.

**Poisson waiting.** Calls arrive at 3 per hour on average (Poisson). P(no call in 20 minutes) = e<sup>−3 × (1/3)</sup> = e<sup>−1</sup> ≈ **0.368**.

**Gambler's ruin.** Starting with ₹3 and betting ₹1 on fair coin flips until reaching ₹10 or going broke, P(reaching ₹10) = 3/10 = **0.3**: a fair game is a martingale, so the expected final wealth equals the starting wealth.

```python run Checking the continuous puzzles
import numpy as np
rng = np.random.default_rng(75)
N = 400_000
cuts = np.sort(rng.random((N, 2)), axis=1)
pieces = np.column_stack([cuts[:, 0], cuts[:, 1] - cuts[:, 0], 1 - cuts[:, 1]])
print(f'broken stick forms a triangle: {np.mean(pieces.max(axis=1) < 0.5):.3f} (exact 0.25)')
u = rng.random((N, 2))
print(f'E[min of two uniforms] {u.min(axis=1).mean():.3f} (exact 0.333)')
print(f'pi estimate from the quarter circle: {4 * np.mean((u ** 2).sum(axis=1) < 1):.3f}')
angles = np.sort(rng.random((N, 3)), axis=1)
gaps = np.column_stack([angles[:, 1] - angles[:, 0], angles[:, 2] - angles[:, 1],
        1 - angles[:, 2] + angles[:, 0]])
print(f'three points in a semicircle: {np.mean(gaps.max(axis=1) >= 0.5):.3f} (exact 0.75)')
arrivals = rng.poisson(3 * 20 / 60, N)
print(f'P(no call in 20 minutes) {np.mean(arrivals == 0):.3f} (exact {np.exp(-1):.3f})')
wins = 0
for _ in range(20_000):
    w, steps = 3, 0
    while 0 < w < 10 and steps < 10_000:
        w += 1 if rng.random() < 0.5 else -1; steps += 1
    wins += w == 10
print(f'gambler reaches 10 from 3: {wins / 20_000:.3f} (exact 0.300)')
```

## 3.6 Practical lessons

- Use complements for "at least one", conditioning on the first step for waiting times, and linearity of expectation everywhere.
- Bayes questions turn on the base rate; write the 2 × 2 table of counts.
- Draw geometric problems; many reduce to areas or symmetric splits.
- Offer to verify by simulation; it shows you can check your own work.
