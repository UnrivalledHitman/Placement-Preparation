# How to use this supplement
%The sub-topics the main guide covered only lightly, and 120 more quiz questions

The main guide covers every section of the paper. A careful audit found sub-topics that it treats only in passing but that scenario and code questions can still ask about. This supplement covers them in the same style, with every example executed, including real framework code (Keras, PyTorch, Hugging Face tokenizers and embeddings, LangChain, FAISS, Chroma), and ends with 120 more quiz questions: 15 per technical topic.

| Chapter | Adds to guide chapter | Topics |
|---|---|---|
| 1 | 2 (SQL) | CASE, string and date functions, views, indexes and query plans |
| 2 | 4 (EDA) | Probability distributions, hypothesis tests, confidence intervals, matplotlib syntax |
| 3 | 3 (AI basics) | Logic and knowledge representation, expert systems, fuzzy logic, NLP basics |
| 4 | 6 (Unsupervised) | Gaussian mixture models, dendrograms |
| 5 | 7 (Advanced ML) | Time series, Keras and PyTorch code, CNN and RNN shapes, explainability |
| 6 | 8 (GenAI) | Hugging Face tokenizers, sentence embeddings, prompt templates |
| 7 | 9 (Agentic AI and RAG) | Text splitters, FAISS, Chroma, BM25 hybrid search, tool schemas, LCEL chains |
| 8 | All technical topics | 120 questions with an explained key |

Read it after the matching guide chapter; it fits days 15–19 October of the plan, with Chapter 8 on 21 October.

# Chapter 1: More SQL
%CASE expressions, string and date functions, views, indexes and query plans

## 1.1 CASE expressions

`CASE` adds conditional logic inside a query: in SELECT to derive columns, inside aggregates for conditional counts, and in ORDER BY for custom sort orders. It returns the first matching branch; without ELSE, unmatched rows get NULL.

```python run CASE for bands, conditional aggregation and custom ordering (guide's emp table)
from cpa_sql import show
show("""SELECT name, salary,
       CASE WHEN salary >= 100000 THEN 'High'
            WHEN salary >= 70000 THEN 'Medium'
            WHEN salary IS NULL THEN 'Unknown'
            ELSE 'Low' END AS band
FROM emp ORDER BY emp_id""")
show("""SELECT COUNT(*) AS staff,
       SUM(CASE WHEN salary >= 90000 THEN 1 ELSE 0 END) AS well_paid,
       SUM(CASE WHEN dept_id = 20 THEN salary END) AS engineering_total
FROM emp""")
show("""SELECT name, dept_id FROM emp
ORDER BY CASE dept_id WHEN 30 THEN 1 WHEN 10 THEN 2 ELSE 3 END, name""")
```

> TRAP: Order of WHEN branches matters: a salary of 120000 matches `>= 100000` first and never reaches `>= 70000`. Writing the conditions from lowest to highest would label everyone above 70000 as Medium.

## 1.2 String and date functions

```python run String functions (SQLite names; MySQL equivalents in the table below)
from cpa_sql import show
show("""SELECT name, UPPER(name) AS up, LENGTH(name) AS len, SUBSTR(name, 1, 3) AS first3,
       name || '@corp.in' AS email, REPLACE(name, 'a', '*') AS masked,
       INSTR(name, 'a') AS pos_a
FROM emp WHERE emp_id <= 4""")
show("""SELECT name, joined, strftime('%Y', joined) AS year,
       CAST(julianday('2026-10-24') - julianday(joined) AS INTEGER) AS days_employed
FROM emp WHERE joined >= '2022-01-01' ORDER BY joined""")
show("SELECT name FROM emp WHERE name LIKE '%r%' AND LENGTH(name) = 5 ORDER BY name")
```

`REPLACE` is case-sensitive: it changed "Asha" to "Ash*" but left the capital A alone. `LIKE`, by contrast, ignores case for English letters in SQLite and in MySQL's default collation, so `LIKE '%r%'` would also match a capital R.

| Task | MySQL | SQLite (used here) |
|---|---|---|
| Upper/lower case | `UPPER(s)`, `LOWER(s)` | Same |
| Length | `LENGTH(s)` (bytes), `CHAR_LENGTH(s)` (characters) | `LENGTH(s)` (characters) |
| Substring | `SUBSTRING(s, start, len)` or `SUBSTR` (1-based) | `SUBSTR(s, start, len)` |
| Concatenate | `CONCAT(a, b, ...)`; `CONCAT_WS(sep, ...)` | `a \|\| b` |
| Trim | `TRIM`, `LTRIM`, `RTRIM` | Same |
| Replace / position | `REPLACE(s, a, b)`, `INSTR(s, sub)`, `LOCATE(sub, s)` | `REPLACE`, `INSTR` |
| Left/right part | `LEFT(s, n)`, `RIGHT(s, n)` | `SUBSTR(s, 1, n)`, `SUBSTR(s, -n)` |
| Today, now | `CURDATE()`, `NOW()` | `date('now')`, `datetime('now')` |
| Parts of a date | `YEAR(d)`, `MONTH(d)`, `DAY(d)`, `DAYNAME(d)` | `strftime('%Y', d)`, `'%m'`, `'%d'` |
| Difference | `DATEDIFF(d1, d2)` (days, d1 − d2); `TIMESTAMPDIFF(MONTH, d1, d2)` | `julianday(d1) - julianday(d2)` |
| Add an interval | `DATE_ADD(d, INTERVAL 30 DAY)` | `date(d, '+30 days')` |
| Format | `DATE_FORMAT(d, '%d-%m-%Y')` | `strftime('%d-%m-%Y', d)` |
| Round, ceiling | `ROUND(x, 2)`, `CEIL`, `FLOOR`, `MOD(a, b)` / `a % b` | `ROUND`, `%` (CEIL/FLOOR in newer versions) |
| NULL replacement | `IFNULL(a, b)`, `COALESCE(...)`, `NULLIF(a, b)` | `IFNULL`, `COALESCE`, `NULLIF` |

## 1.3 Views, indexes and query plans

```python run A view, and how an index changes the query plan
from cpa_sql import db, show
con = db()
con.execute("""CREATE VIEW dept_summary AS
    SELECT d.dept_name, COUNT(e.emp_id) AS staff, AVG(e.salary) AS avg_salary
    FROM dept d LEFT JOIN emp e ON e.dept_id = d.dept_id GROUP BY d.dept_name""")
show("SELECT * FROM dept_summary WHERE staff > 0 ORDER BY avg_salary DESC", con)
plan = lambda: [row[-1] for row in con.execute(
    "EXPLAIN QUERY PLAN SELECT name FROM emp WHERE salary > 80000")]
print('before index:', plan())
con.execute("CREATE INDEX idx_emp_salary ON emp(salary)")
print('after index: ', plan())
```

| Object | Purpose | Notes |
|---|---|---|
| View | Saved query used like a table: simplifies complex joins, restricts columns for security | Stores no data (a materialised view stores results); updatable only when simple |
| Index | Speeds lookups, joins and ORDER BY on its columns (B-tree) | Slows writes; best on selective columns used in WHERE/JOIN; composite index order matters (leftmost prefix) |
| `EXPLAIN` | Shows the execution plan: full table scan versus index search | First tool for slow queries |
| Clustered vs non-clustered (MySQL InnoDB) | The primary key orders the table data itself; secondary indexes point to it | One clustered index per table |

The plan changes from a full `SCAN emp` to `SEARCH emp USING INDEX idx_emp_salary`: the database can now jump to the qualifying rows instead of reading every row.

## 1.4 Practical lessons

- CASE evaluates branches in order; use it for bands, conditional counts (`SUM(CASE ...)`) and custom sorting.
- Know the MySQL names: `CONCAT`, `SUBSTRING`, `DATEDIFF`, `DATE_ADD`, `DATE_FORMAT`, `IFNULL`.
- Views simplify and secure queries; indexes speed reads at a write cost; `EXPLAIN` shows which is used.

# Chapter 2: Statistics and matplotlib for EDA
%Distributions, sampling, hypothesis tests, confidence intervals, and the matplotlib calls that code questions use

## 2.1 Distributions and the central limit theorem

| Distribution | Describes | Example |
|---|---|---|
| Normal (Gaussian) | Symmetric bell curve; 68–95–99.7% within 1, 2, 3 standard deviations | Heights, measurement errors |
| Binomial | Number of successes in n independent trials with probability p | Conversions out of 100 visitors |
| Poisson | Count of events in a fixed interval at rate λ | Support tickets per hour |
| Uniform | All values in a range equally likely | Random IDs |
| Exponential | Time between Poisson events | Time to next request |
| Log-normal | Positive, right-skewed values whose log is normal | Income, prices |

The **central limit theorem**: the mean of a sufficiently large sample is approximately normally distributed, whatever the population's shape, with standard error σ/√n. This is why tests and confidence intervals on means work even for skewed data.

```python run The 68-95-99.7 rule, and the central limit theorem on skewed data
import numpy as np
rng = np.random.default_rng(0)
x = rng.normal(50, 10, 100_000)
for k in (1, 2, 3):
    print(f'within {k} sd: {np.mean(np.abs(x - 50) < k * 10):.3f}')
pop = rng.exponential(scale=2.0, size=1_000_000)               # strongly right-skewed
means = rng.choice(pop, size=(5000, 50)).mean(axis=1)           # 5000 samples of size 50
print(f'population: mean {pop.mean():.2f}, sd {pop.std():.2f}, skew '
      f'{((pop - pop.mean()) ** 3).mean() / pop.std() ** 3:.2f}')
print(f'sample means: mean {means.mean():.2f}, sd {means.std():.3f} '
      f'(theory sigma/sqrt(n) = {pop.std() / np.sqrt(50):.3f})')
```

## 2.2 Hypothesis testing

1. State the **null hypothesis** H₀ (no effect, no difference) and the alternative H₁.
2. Choose the significance level α (usually 0.05).
3. Compute a test statistic and its **p-value**: the probability of a result at least this extreme **if H₀ were true**.
4. If p < α, reject H₀; otherwise fail to reject it (which is not proof that H₀ is true).

```python run t-tests, a chi-square test and a correlation test with SciPy
import numpy as np
from scipy import stats
rng = np.random.default_rng(1)
old = rng.normal(52, 8, 60)                       # e.g. time on page, old design
new = rng.normal(56, 8, 60)                       # new design
t, p = stats.ttest_ind(new, old, equal_var=False)
print(f'two-sample t-test: t = {t:.2f}, p = {p:.4f} ->', 'reject H0' if p < 0.05
        else 'keep H0')
before = rng.normal(70, 5, 25)
after = before + rng.normal(1.5, 2, 25)           # same people measured twice
print(f'paired t-test p = {stats.ttest_rel(after, before).pvalue:.4f}')
table = np.array([[120, 80], [90, 110]])          # plan (rows) versus churned / stayed
chi2, p, dof, _ = stats.chi2_contingency(table)
print(f'chi-square: chi2 = {chi2:.2f}, dof = {dof}, p = {p:.4f}')
r, p = stats.pearsonr(old, rng.normal(0, 1, 60))
print(f'correlation of unrelated variables: r = {r:.2f}, p = {p:.2f}')
```

| Test | Use when |
|---|---|
| One-sample t-test | Is a mean different from a value? |
| Two-sample (independent) t-test | Do two groups' means differ? (Welch's version if variances differ) |
| Paired t-test | Same subjects before and after |
| ANOVA | Do three or more group means differ? |
| Chi-square test of independence | Are two categorical variables related? |
| Pearson / Spearman correlation test | Is a linear / monotonic association non-zero? |
| Mann–Whitney U | Non-parametric alternative to the two-sample t-test |

| Error | Meaning |
|---|---|
| Type I (false positive) | Rejecting a true H₀; probability α |
| Type II (false negative) | Failing to reject a false H₀; probability β; **power** = 1 − β |

**A 95% confidence interval** is a range built by a procedure that captures the true value in 95% of repeated samples: mean ± 1.96 × standard error for large samples. A/B tests use exactly these ideas: the variant is better if the difference is significant and practically meaningful.

## 2.3 matplotlib syntax

```python run The object-oriented interface: figure, axes, labels, legend, annotations, saving
import numpy as np
import matplotlib.pyplot as plt
months = np.arange(1, 13)
sales_a = 100 + 8 * months + np.array([5, -3, 4, 0, 6, -2, 3, 7, -4, 2, 5, 1])
sales_b = 120 + 4 * months
fig, axes = plt.subplots(1, 2, figsize=(9, 3.2))              # 1 row, 2 columns
ax = axes[0]
ax.plot(months, sales_a, marker='o', label='Product A')
ax.plot(months, sales_b, linestyle='--', label='Product B')
ax.set_title('Monthly sales'); ax.set_xlabel('Month'); ax.set_ylabel('Units')
ax.legend(); ax.set_xticks(months)
ax.annotate('peak', xy=(8, sales_a[7]), xytext=(4, 205), arrowprops={'arrowstyle': '->'})
axes[1].bar(['A', 'B'], [sales_a.sum(), sales_b.sum()], color=['tab:blue', 'tab:orange'])
axes[1].set_title('Annual total')
plt.tight_layout()
plt.savefig('sup_matplotlib.png', dpi=150)
print(type(fig).__name__, axes.shape, type(axes[0]).__name__)
```

![Line chart with legend and annotation, and a bar chart, from one figure with two axes](figs/sup_matplotlib.png)

| Call | Does |
|---|---|
| `fig, ax = plt.subplots(r, c)` | Creates a figure and an array of axes (`ax` is a single Axes when r = c = 1) |
| `ax.plot`, `ax.scatter`, `ax.bar`, `ax.barh`, `ax.hist`, `ax.boxplot`, `ax.pie` | Line, scatter, bars, histogram, box plot, pie |
| `ax.set_title`, `ax.set_xlabel`, `ax.set_ylabel`, `ax.set_xlim` | Titles, labels, limits (pyplot versions: `plt.title`, `plt.xlabel`, ...) |
| `ax.legend()` | Shows labels given with `label=` |
| `plt.tight_layout()`, `plt.savefig(path)`, `plt.show()` | Fix overlaps, save, display |
| `df.plot(kind='bar')`, `df['col'].hist()` | pandas plotting wrappers around matplotlib |
| seaborn | Higher-level statistical plots on top of matplotlib; takes `data=df, x=..., y=..., hue=...` |

## 2.4 Practical lessons

- Normal: 68–95–99.7; the CLT makes sample means normal with standard error σ/√n.
- p-value = probability of data this extreme if H₀ is true; p < α → reject H₀; Type I = false positive.
- Pick t-tests for means, chi-square for categorical association, ANOVA for 3+ groups.
- matplotlib: `fig, ax = plt.subplots()`, then `ax.plot/bar/hist`, labels, `legend`, `savefig`.
