# Chapter 14: Data Warehousing and Data Transformation
%Star and snowflake schemas, data cubes and cuboids, OLAP operations, concept hierarchies, measures, and preprocessing

## 14.1 Warehouses and schemas

A **data warehouse** is a subject-oriented, integrated, time-variant, non-volatile store for analysis (OLAP), unlike an operational database tuned for transactions (OLTP).

| Schema | Structure | Trade-off |
|---|---|---|
| Star | One fact table joined to denormalised dimension tables | Few joins, fast queries, redundancy in dimensions |
| Snowflake | Dimension tables normalised into sub-dimensions | Less redundancy, more joins |
| Fact constellation (galaxy) | Several fact tables sharing dimensions | Models several business processes |

A **fact table** holds foreign keys to the dimensions plus numeric **measures** (sales amount, quantity). A **dimension table** holds descriptive attributes (product name, category, city).

## 14.2 Data cubes and cuboids

With n dimensions and no hierarchies, the data cube has **2ⁿ cuboids**: one for each subset of dimensions to group by, from the base cuboid (all n) to the apex cuboid (none, the grand total).

With concept hierarchies, dimension i with Lᵢ levels (not counting the virtual top level "all") contributes Lᵢ + 1 choices, so the number of cuboids is **Π (Lᵢ + 1)**.

**GROUP BY CUBE(D1, …, Dn)** returns the union of all 2ⁿ groupings. If dimension Dᵢ has dᵢ distinct values and every combination occurs, the number of result rows is **Π (dᵢ + 1)**: each dimension contributes its dᵢ values plus the "all" (NULL) row. **ROLLUP(D1, …, Dn)** returns only the n + 1 prefixes (D1…Dn), (D1…Dn−1), …, ().

### Worked example: CUBE and ROLLUP row counts

*Facts(region, quarter, amount) has 4 regions and 3 quarters, all 12 combinations present. How many rows do GROUP BY CUBE(region, quarter) and GROUP BY ROLLUP(region, quarter) return? (NAT)*

CUBE: (4 + 1)(3 + 1) = 20 rows (12 detail + 4 region totals + 3 quarter totals + 1 grand total). ROLLUP: 12 + 4 + 1 = 17 rows.

```python run CUBE and ROLLUP emulated with UNION ALL on SQLite
import sqlite3, itertools
con = sqlite3.connect(':memory:')
con.execute('CREATE TABLE f(region TEXT, quarter TEXT, amount INT)')
rows = [(r, q, 10 * i + j) for i, r in enumerate('NSEW') for j, q in enumerate(['Q1', 'Q2',
        'Q3'])]
con.executemany('INSERT INTO f VALUES (?,?,?)', rows)

def grouping(cols):
    sel = ', '.join(c if c in cols else f'NULL AS {c}' for c in ('region', 'quarter'))
    gb = f" GROUP BY {', '.join(cols)}" if cols else ''
    return f'SELECT {sel}, SUM(amount) FROM f{gb}'

dims = ('region', 'quarter')
cube = [c for r in range(3) for c in itertools.combinations(dims, r)]
rollup = [dims[:k] for k in range(len(dims), -1, -1)]
for name, sets in (('CUBE', cube), ('ROLLUP', rollup)):
    sql = ' UNION ALL '.join(grouping(s) for s in sets)
    print(name, 'groupings', len(sets), '| rows', len(con.execute(sql).fetchall()))
print('grand total:', con.execute(grouping(())).fetchall())
```

## 14.3 OLAP operations

| Operation | Effect | Example |
|---|---|---|
| Roll-up | Climb a hierarchy, or drop a dimension, to aggregate | City → country |
| Drill-down | Descend a hierarchy for finer detail | Country → state → city |
| Slice | Fix one dimension to a single value | Sales for Q2 only (a 2-D sub-cube) |
| Dice | Select ranges on two or more dimensions | Q1–Q2 in North and South |
| Pivot (rotate) | Reorient the axes of the display | Swap rows and columns |

Moving from (product, month, **country**) to (product, month, **state**) is a drill-down: state is a finer level of the location hierarchy.

## 14.4 Concept hierarchies and measures

A **concept hierarchy** orders the levels of a dimension: day < month < quarter < year, or city < state < country. A **schema hierarchy** is a total order of levels; a **lattice** allows several paths (day < week < year and day < month < quarter < year).

| Measure type | Definition | Examples |
|---|---|---|
| Distributive | Computed from aggregates of partitions with the same function | SUM, COUNT, MIN, MAX |
| Algebraic | Computed from a fixed number of distributive aggregates | AVG (= SUM/COUNT), standard deviation |
| Holistic | No bounded-size summary of partitions suffices | MEDIAN, MODE, RANK |

Distributive and algebraic measures can be rolled up from finer cuboids; holistic ones generally must be recomputed from the base data.

## 14.5 Data transformation

| Technique | Formula or method | Use |
|---|---|---|
| Min–max normalisation to [a, b] | v′ = a + (v − min)(b − a)/(max − min) | Puts features on a common range; sensitive to outliers |
| z-score standardisation | v′ = (v − mean)/std | Zero mean, unit variance |
| Decimal scaling | v′ = v/10ʲ, the smallest j with max \|v′\| < 1 | Simple rescaling |
| Equal-width binning | k intervals of width (max − min)/k | Discretisation; outliers create empty bins |
| Equal-frequency binning | Each bin holds about n/k values | Discretisation robust to skew |
| Smoothing by bin means or boundaries | Replace each value by its bin's mean or nearest boundary | Noise reduction |
| Sampling | Simple random (with or without replacement), stratified, cluster | Reduce data volume |
| Compression and reduction | PCA, wavelets, histograms, aggregation | Fewer dimensions or values |

### Worked example: normalisation and binning

*Values 200, 300, 400, 600, 1000. Min–max normalise 600 to [0, 1]; standardise it (population standard deviation); split into 2 equal-width bins. (NAT)*

Min–max: (600 − 200)/(1000 − 200) = 0.5. Mean 500, population standard deviation √((90000 + 40000 + 10000 + 10000 + 250000)/5) = √80000 ≈ 282.84, so z = 100/282.84 ≈ 0.354. Equal-width bins of width 400: [200, 600) holds 200, 300, 400 and [600, 1000] holds 600, 1000.

```python run Normalisation, standardisation and binning
import statistics as st
v = [200, 300, 400, 600, 1000]
mn, mx = min(v), max(v)
print('min-max of 600:', (600 - mn) / (mx - mn))
mu, sd = st.mean(v), st.pstdev(v)
print(f'z of 600: {(600 - mu) / sd:.4f}  (population sd {sd:.2f})')
width = (mx - mn) / 2
bins = [[x for x in v if mn + i * width <= x < mn + (i + 1) * width or (i == 1 and x == mx)]
        for i in range(2)]
print('equal-width bins:', bins)
print('equal-frequency (sizes 3, 2):', [v[:3], v[3:]], '| bin-mean smoothing:',
      [round(st.mean(b), 1) for b in (v[:3], v[3:])])
```

## 14.6 Traps

| Trap | Correct thinking |
|---|---|
| Cube with n dimensions has n² cuboids | 2ⁿ without hierarchies; Π(Lᵢ + 1) with hierarchies |
| CUBE row count is Π dᵢ | Π(dᵢ + 1): the "all" values add rows |
| Country → state is a roll-up | It is a drill-down (finer detail) |
| AVG is distributive | It is algebraic (SUM and COUNT) |
| MEDIAN rolls up from sub-cubes | It is holistic |
| Min–max is robust to outliers | One extreme value squeezes all others |
