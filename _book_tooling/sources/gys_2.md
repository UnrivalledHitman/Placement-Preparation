## Solutions: Set B3

| Q | Answer | Q | Answer | Q | Answer |
|---|---|---|---|---|---|
| E1 | B | M1 | 4 | H1 | 9 |
| E2 | 3 | M2 | B | H2 | C |
| E3 | C | M3 | A, C, D | H3 | A, B, C |
| E4 | 64 | M4 | 127 | H4 | 4 |
| E5 | B, C, D | M5 | D | H5 | C |
| E6 | 5000 | M6 | 3 | H6 | 6 |
| E7 | B | M7 | A, B | H7 | A, D |
| E8 | D | M8 | A | | |
| | | M9 | 2 | | |

**E1.** A gives B, B gives C: ABC (D is not reached). **E2.** The FDs form a cycle, so each of A, B and C determines everything: 3 keys. **E3.** Partial dependencies.

**E4.** 4p + 12(p − 1) ≤ 1024 gives 16p ≤ 1036, so p = 64.

**E5.** 3NF does not imply BCNF (see M3). Two-attribute relations are always in BCNF, and 3NF synthesis always gives a lossless, dependency-preserving decomposition.

**E6.** A dense index has one entry per search-key value: 5000. **E7.** A secondary index must be dense.

**E8.** Only (D): the common attribute A determines B, so A → AB holds. In (C) and (B) the common attribute determines nothing, and (A) shares no attribute at all, so its join is a Cartesian product.

**M1.** B is on no right side, so it is in every key. AB, BC, BD and BE each reach all attributes: AB gives C, D, E; BC gives D, E, A; BD gives E, A, then AB gives C; BE gives A, then C and D. B alone does not. 4 keys.

**M2.** B → D is a partial dependency on the key AB, so R is not in 2NF.

**M3.** AB⁺ and AC⁺ (C gives B) are everything, and neither has a smaller key inside. C → B has a non-superkey left side, so R is not in BCNF, but B is prime, so R is in 3NF.

**M4.** 16k + 6 ≤ 2048 gives k = 127.

**M5.** No common attributes, so the join is a Cartesian product (lossy); each FD lies inside one piece, so dependencies are preserved.

**M6.** 10,000 leaves, 100 parents, 1 root: 3 levels.

**M7.** Hash indexes do not support range queries; B+ tree leaves are linked and hold all record pointers. Record pointers live only in the leaves; internal nodes hold keys and child pointers.

**M8.** Augment A → B with C to get AC → BC, then use BC → D (pseudo-transitivity).

**M9.** A → C follows from A → B and B → C, and AB → C is then redundant: {A → B, B → C}, 2 FDs.

**H1.** Each cycle makes its three attributes interchangeable: one of {A, B, C} with one of {D, E, F}, 3 × 3 = 9.

**H2.** The keys are AB, CB and DB, so every attribute is prime and R is in 3NF. C → D has a non-superkey left side, so it is not in BCNF.

**H3.** B is common and B → BC, so the split is lossless; A → B and B → C each lie in one piece; both two-attribute pieces are in BCNF. R itself is not, because B → C has a non-key left side.

**H4.** 20 keys need at least 10 leaves; with fan-out 3, the levels above need at least 4, 2 and 1 nodes. 4 levels.

**H5.** 8p + 16(p − 1) ≤ 4096 gives 24p ≤ 4112, so p = 171.

**H6.** C appears on no right side; the keys are AC and BC. Supersets of AC (4) plus supersets of BC (4) minus supersets of ABC (2) = 6.

**H7.** 3NF synthesis starts from a minimal cover, adds a key relation if none contains a candidate key, and is lossless and dependency preserving; its relations need not be in BCNF. It sometimes adds a relation containing a candidate key, to make the decomposition lossless.

```python run Recomputing Set B3
from itertools import combinations

def closure(X, fds):
    X = set(X); ch = True
    while ch:
        ch = False
        for l, r in fds:
            if set(l) <= X and not set(r) <= X:
                X |= set(r); ch = True
    return X

def keys(attrs, fds):
    out = []
    for n in range(1, len(attrs) + 1):
        for c in combinations(attrs, n):
            if closure(c, fds) == set(attrs) and not any(set(k) <= set(c) for k in out):
                out.append(''.join(c))
    return out

def superkeys(attrs, fds):
    return sum(1 for n in range(1, len(attrs) + 1) for c in combinations(attrs, n)
            if closure(c, fds) == set(attrs))

print('E1', ''.join(sorted(closure('A', [('A', 'B'), ('B', 'C')]))), '| E2', keys('ABC',
        [('A', 'B'), ('B', 'C'), ('C', 'A')]))
print('M1', keys('ABCDE', [('AB', 'C'), ('C', 'D'), ('D', 'E'), ('E', 'A')]), '| M3',
        keys('ABC', [('AB', 'C'), ('C', 'B')]))
print('H1', len(keys('ABCDEF', [('A', 'B'), ('B', 'C'), ('C', 'A'), ('D', 'E'), ('E', 'F'),
        ('F', 'D')])),
      '| H2', keys('ABCD', [('AB', 'C'), ('C', 'D'), ('D', 'A')]),
      '| H6', superkeys('ABCD', [('A', 'B'), ('B', 'A'), ('AC', 'D')]))
print('E4', (1024 + 12) // 16, '| M4', (2048 - 6) // 16, '| H5', (4096 + 16) // 24)
import math
lv = lambda n, leaf, fan: 1 + math.ceil(math.log(math.ceil(n / leaf), fan) - 1e-12)
print('M6', lv(10 ** 6, 100, 100), '| H4', lv(20, 2, 3))
cover = [('A', 'B'), ('B', 'C')]
print('M9 cover implies original:', all(set(r) <= closure(l, cover) for l, r in
                                        [('A', 'BC'), ('B', 'C'), ('A', 'B'), ('AB', 'C')]))
```

## Solutions: Set B4

| Q | Answer | Q | Answer | Q | Answer |
|---|---|---|---|---|---|
| E1 | D | M1 | 20 | H1 | 60 |
| E2 | 16 | M2 | C | H2 | B |
| E3 | C | M3 | C, D | H3 | B |
| E4 | 0.4 | M4 | 1.41 | H4 | 35 |
| E5 | B, C, D | M5 | B | H5 | A |
| E6 | 4 | M6 | 4 | H6 | −0.6 |
| E7 | C | M7 | A, C | H7 | A, B, D |
| E8 | C, D | M8 | A | | |
| | | M9 | 9 | | |

**E1.** One fact table plus denormalised dimensions. **E2.** 2⁴ = 16. **E3.** Climbing the time hierarchy is a roll-up. **E4.** (30 − 10)/(60 − 10) = 0.4.

**E5.** AVG is algebraic (SUM/COUNT). **E6.** (A, B, C), (A, B), (A) and (): 4. **E7.** Fixing one dimension to a single value is a slice. **E8.** Normalisation is preprocessing, not an OLAP operation. Sampling is data reduction, not an OLAP operation.

**M1.** (3 + 1)(4 + 1) = 20.

**M2.** (3 + 1)(2 + 1)(1 + 1) = 24.

**M3.** Median and mode are holistic; average and standard deviation are algebraic.

**M4.** Mean 70 and population standard deviation √200 ≈ 14.14: z = 20/14.14 ≈ 1.41.

**M5.** Snowflake schemas normalise the dimensions.

**M6.** Width (34 − 4)/3 = 10: bins [4, 14), [14, 24) and [24, 34]. The last holds 24, 25, 28 and 34.

**M7.** CUBE gives (3 + 1)(2 + 1) = 12 rows over 4 groupings, including the grand total; ROLLUP gives 6 + 3 + 1 = 10. ROLLUP gives 10 rows, not 12.

**M8.** 986/10³ = 0.986 < 1, while 986/10² = 9.86. So j = 3.

**M9.** (4 + 8 + 15)/3 = 9.

**H1.** (2 + 1)(3 + 1)(4 + 1) = 60.

**H2.** (2 + 1)³ = 27.

**H3.** SUM and MAX roll up directly, and AVG from stored SUM and COUNT. A median cannot be combined from group medians. MODE is holistic, like MEDIAN. Group averages alone cannot be combined without the group counts.

**H4.** 24 months + 8 quarters + 2 years + 1 grand total = 35.

**H5.** 100 × 365 × 50 × 0.2 = 365,000.

**H6.** −1 + (40 − 20)(2)/100 = −0.6.

**H7.** Without replacement, no record is chosen twice.

```python run Recomputing Set B4
import statistics as st, sqlite3, itertools

print('E2', 2 ** 4, '| E4', (30 - 10) / (60 - 10), '| M1', 4 * 5, '| M2', 4 * 3 * 2, '| H1',
        3 * 4 * 5, '| H2', 3 ** 3)
v = [50, 60, 70, 80, 90]
print('M4', round((90 - st.mean(v)) / st.pstdev(v), 4))
data = [4, 8, 15, 21, 21, 24, 25, 28, 34]
w = (max(data) - min(data)) / 3
print('M6', sum(1 for x in data if x >= min(data) + 2 * w), '| M9', st.mean([4, 8, 15]))
con = sqlite3.connect(':memory:')
con.execute('CREATE TABLE f(a, b, v)')
con.executemany('INSERT INTO f VALUES (?,?,1)', itertools.product('xyz', 'pq'))
def grp(cols):
    sel = ', '.join(c if c in cols else 'NULL' for c in 'ab')
    return f"SELECT {sel}, SUM(v) FROM f" + (f" GROUP BY {', '.join(cols)}" if cols else '')
cube = ' UNION ALL '.join(grp(c) for r in range(3) for c in itertools.combinations('ab', r))
rollup = ' UNION ALL '.join(grp(c) for c in ('ab', 'a', ''))
print('M7 CUBE rows', len(con.execute(cube).fetchall()), 'ROLLUP rows',
        len(con.execute(rollup).fetchall()))
print('H4', 24 + 8 + 2 + 1, '| H5', 100 * 365 * 50 // 5, '| H6', -1 + (40 - 20) * 2 / 100)
```

## Solutions: Set M1

| Q | Answer | Q | Answer | Q | Answer |
|---|---|---|---|---|---|
| E1 | B | M1 | 1.8 | H1 | 3 |
| E2 | 2.6 | M2 | A | H2 | A |
| E3 | A | M3 | C, D | H3 | A, B, C |
| E4 | 0.85 | M4 | 0.62 | H4 | 1.5 |
| E5 | A, C | M5 | B | H5 | A |
| E6 | 0.89 | M6 | 1 | H6 | 0.9 |
| E7 | C | M7 | A, B, C | H7 | A, B |
| E8 | 0.75 | M8 | C | | |
| | | M9 | 0.6 | | |

**E1.** The sum of squared residuals. **E2.** (3 + 10)/(1 + 4) = 2.6. **E3.** One split per sample: 500. **E4.** (40 + 45)/100 = 0.85.

**E5.** Ridge shrinks coefficients but never exactly to zero, and it lowers variance.

**E6.** 40/45 ≈ 0.89. **E7.** Overfitting. **E8.** 1 − 20/80 = 0.75.

**M1.** x̄ = 2.5, ȳ = 4.5, Sₓᵧ = 9 and Sₓₓ = 5, so β₁ = 1.8.

**M2.** 4.5 − 1.8 × 2.5 = 0.

**M3.** A larger λ shrinks coefficients, increasing bias and reducing variance; the training error rises, not falls. The coefficients shrink towards zero; they do not grow.

**M4.** 2 × 0.8 × 0.5/1.3 ≈ 0.62.

**M5.** Each model is trained on 4 of the 5 folds: 80 samples.

**M6.** (2 + 8)/(1 + 4 + 5) = 1. Without the penalty it would be 2.

**M7.** More data reduces variance, not the bias of a fixed model class.

**M8.** ŷ = 2 − 2 = 0, squared error 9, penalty 0.5 × 5 = 2.5: total 11.5.

**M9.** 30/50 = 0.6.

**H1.** The data fit exactly: β₀ = 1, β₁ = 2 and β₂ = 3 reproduce all four y values.

**H2.** The smaller model's best fit is available to the larger model too (set the removed coefficient to 0), so dropping a feature cannot raise the training R².

**H3.** 800 samples in 4 folds of 200; each model trains on 600; the test set is untouched; LOOCV would use 800 splits.

**H4.** ŷ = 2 − 3 = −1 and y = 2 − 3 + 1 = 0, so the absolute error is 1; the penalty is 0.1 × 5 = 0.5. Total 1.5.

**H5.** Fewer predicted positives: those that remain are more reliable (precision up), but more positives are missed (recall down).

**H6.** 90/100 = 0.9.

**H7.** With an intercept, the normal equations make the residuals sum to zero and orthogonal to every column, and the fit passes through the means. Training R² lies between 0 and 1. It passes through the point of means, not, in general, through the origin.

```python run Recomputing Set M1
import numpy as np
from sklearn.linear_model import LinearRegression

x = np.array([1., 2, 3, 4]); y = np.array([2., 3, 6, 7])
lr = LinearRegression().fit(x[:, None], y)
print('E2', (3 + 10) / 5, '| E4', 85 / 100, '| E6', round(40 / 45, 4), '| E8', 1 - 20 / 80,
      '| M1/M2', round(lr.coef_[0], 4), round(lr.intercept_, 4))
print('M4', round(2 * .8 * .5 / 1.3, 4), '| M6', (2 + 8) / (1 + 4 + 5), '| M9', 30 / 50)
w = np.array([1., -2]); xv = np.array([2., 1])
print('M8', (w @ xv - 3) ** 2 + 0.5 * w @ w)
X = np.array([[0, 0], [1, 0], [0, 1], [1, 1.]]); Y = np.array([1., 3, 4, 6])
m = LinearRegression().fit(X, Y)
print('H1', round(m.intercept_, 6), np.round(m.coef_, 6))
w2 = np.array([2., -1]); x2 = np.array([1., 3])
print('H4', abs(w2 @ x2 - (2 * 1 - 3 + 1)) + 0.1 * w2 @ w2, '| H6', 90 / 100)
rng = np.random.default_rng(0)
Xr = rng.normal(size=(50, 3)); yr = Xr @ [1., 2, -1] + rng.normal(size=50)
full = LinearRegression().fit(Xr, yr).score(Xr, yr); less = LinearRegression().fit(Xr[:,
        :2], yr).score(Xr[:, :2], yr)
res = yr - LinearRegression().fit(Xr, yr).predict(Xr)
print(f'H2 R^2 full {full:.4f} >= reduced {less:.4f} | H7 residual sum {res.sum():.1e}, '
        f'X^T r {np.round(Xr.T @ res, 10)}')
```
