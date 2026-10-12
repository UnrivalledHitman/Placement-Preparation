# The paper on one page
%What is asked, how marks are split, and what to do in each section

| Section | Questions | Marks | Plan (if 120 minutes) |
|---|---|---|---|
| Python coding: one OOP question with collections | 1 | 35 | 45 min, including 10 min testing with your own inputs |
| Technical quiz: 8 topics × 5 (2 theory + 3 scenario/code) | 40 | 40 | 45 min |
| Business skills | 25 | 25 | 20 min |
| Review | | | 10 min |

**Coding routine:** read twice → classes with exact names and attribute order → methods return values → main reads with `input()` (no prompts), converts types, `strip()`s strings → prints the exact format and the fallback message → test the sample, a no-match case and a tie.

# Python for the coding round

```text
n = int(input())                                   # one value per line
items = [Item(int(input()), input().strip(), float(input())) for _ in range(n)]
a, b = input().split()                             # several values on one line
nums = list(map(int, input().split()))
title, genre = [x.strip() for x in input().split(',')]    # comma-separated
member_id, title = input().split(' ', 1)           # keep a title with spaces together
print(f'{value:.2f}')                              # two decimals
print('\n'.join(names) if names else 'No Data Found')
```

| Pattern | Code |
|---|---|
| Filter | `[x for x in items if x.dept.lower() == d.lower()]` |
| Sort by several keys | `sorted(items, key=lambda x: (-x.score, x.name))` |
| Max with first-on-tie | `max(items, key=lambda x: x.salary)` (guard empty lists) |
| Count | `Counter(x.city for x in items).most_common()` |
| Group | `g = defaultdict(list); g[x.dept].append(x)` |
| Totals per key | `d[k] = d.get(k, 0) + v` |
| Average per key | Two dicts (sum, count) or `defaultdict(list)` then `sum/len` |
| Both / either / only | Sets: `a & b`, `a | b`, `a - b`; subset `{x, y} <= s` |
| Queue / stack | `deque`: `append`, `popleft`, `pop` |
| Priority with ties | `heapq.heappush(h, (priority, arrival_no, obj))` |
| Pairs in a list | `itertools.combinations(sorted(set(xs)), 2)` |
| Dense rank | Sort, increase the rank only when the value changes |

| OOP rule | Detail |
|---|---|
| `__init__(self, ...)` | Assign attributes in the given order |
| Class vs instance attribute | `obj.x = v` creates an instance attribute that hides the class one |
| Inheritance | `class B(A):`; call `super().__init__(...)` when B defines `__init__` |
| Overriding | Same method name in the child; calling it on any object runs the right version |
| Abstract class | `ABC` + `@abstractmethod`; instantiating it raises `TypeError` |
| Encapsulation | `_x` convention; `__x` mangled to `_Class__x`; `@property` for read-only access |
| Dunders | `__str__` (print), `__repr__` (in lists), `__eq__`, `__lt__` (sorting), `__len__`, `__contains__` |
| `@dataclass` | Auto `__init__`/`__repr__`; lists need `field(default_factory=list)` |

**Traps:** `list.sort()` returns `None`; `def f(x=[])` shares the list between calls; `b = a` copies a reference; `print` evaluates every argument before printing; `input()` gives a string.

# Technical quiz: the facts most questions test

## SQL

| Rule | Detail |
|---|---|
| Logical order | FROM → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT |
| NULL | `= NULL` never true; use `IS NULL`; `NOT IN (... NULL ...)` returns nothing |
| Counting | `COUNT(*)` rows; `COUNT(col)` non-NULL; aggregates ignore NULL |
| WHERE vs HAVING | Rows before grouping vs groups after |
| Joins | INNER: matches; LEFT: all left rows; FULL: all of both (MySQL: emulate with UNION); CROSS: m × n |
| Anti-join | `LEFT JOIN ... WHERE right.key IS NULL` or `NOT EXISTS` |
| n-th highest | `ORDER BY salary DESC LIMIT 1 OFFSET n-1` over DISTINCT, or DENSE_RANK |
| Windows | ROW_NUMBER unique; RANK gaps (1, 2, 2, 4); DENSE_RANK no gaps (1, 2, 2, 3); `PARTITION BY` per group |
| UNION | Removes duplicates; UNION ALL keeps them |
| Commands | DDL: CREATE, ALTER, DROP, TRUNCATE; DML: INSERT, UPDATE, DELETE; DCL: GRANT, REVOKE; TCL: COMMIT, ROLLBACK |
| DELETE / TRUNCATE / DROP | Rows with WHERE, rollback possible / all rows, fast, DDL / the table itself |
| Keys | Primary: unique + not null, one per table; foreign: references another table; unique allows NULL |
| Normal forms | 1NF atomic; 2NF no partial dependency; 3NF no transitive dependency; BCNF every determinant a key |
| ACID | Atomicity, Consistency, Isolation, Durability |

## AI basics

| Topic | Remember |
|---|---|
| Hierarchy | AI ⊃ ML ⊃ deep learning; generative AI mostly deep learning |
| Learning types | Labels → supervised; no labels → unsupervised; rewards → reinforcement; labels from data itself → self-supervised |
| Agents | Simple reflex (rules), model-based, goal-based, utility-based, learning; PEAS |
| Search | BFS (shortest in steps), DFS (low memory, not optimal), Dijkstra, greedy (h only), A* (g + h, optimal if h admissible), minimax + alpha–beta |
| RL terms | State, action, reward, policy, value, episode; ε-greedy explores with probability ε |
| Workflow | Problem → data → prepare → features → train/tune → evaluate on test once → deploy → monitor drift |
| Overfit / underfit | High train, low test (variance) / low both (bias) |
| Responsible AI | Fairness, transparency/explainability, privacy, accountability, safety |

## EDA and visualisation

| Topic | Remember |
|---|---|
| First look | `shape`, `info`, `dtypes`, `describe` (numeric only), `isnull().sum()`, `value_counts` (no NaN by default), `nunique` |
| Selection | `loc[a:b]` includes b (labels); `iloc[a:b]` excludes b (positions); filters with `&`, `|`, `~` and brackets |
| Grouping | `groupby().agg([...])`, `transform` keeps row count, `pivot_table`, `merge(how=...)` |
| Missing values | Median (skewed), mean (symmetric), mode (categorical), ffill (time series), drop if few |
| Outliers | IQR fences Q1 − 1.5·IQR, Q3 + 1.5·IQR (robust); \|z\| > 3 (inflated by the outlier itself) |
| Shape | Skew > 0: mean > median; log transform for right skew; high kurtosis = heavy tails |
| Correlation | Pearson linear, Spearman ranks; not causation |
| Charts | Histogram/KDE/box (one numeric), count/bar (category), box/violin (numeric by category), scatter (two numerics), heatmap (correlations), pair plot, line (time) |
| Encoding | One-hot for nominal (`get_dummies`), ordinal codes for ordered categories |
| Scaling | Standard (z) for k-NN, SVM, logistic, PCA, neural nets; min-max to [0, 1]; trees need none; fit on training data only |
| `inplace=True` | Returns `None` |

## Supervised learning

| Metric | Formula |
|---|---|
| Accuracy | (TP + TN) / total |
| Precision | TP / (TP + FP): when false alarms are costly (spam) |
| Recall | TP / (TP + FN): when misses are costly (disease, fraud) |
| F1 | 2PR / (P + R) |
| Specificity | TN / (TN + FP) |
| ROC-AUC | Ranking quality over thresholds; 0.5 random |
| MAE, MSE, RMSE | Mean \|error\|, mean error², √MSE |
| R² | 1 − SS_res/SS_tot; 0 = predicting the mean; adjusted R² penalises features |

| Algorithm | Key fact |
|---|---|
| Linear regression | OLS; coefficients = effect per unit, others fixed |
| Logistic regression | Sigmoid → probability; threshold 0.5 by default |
| k-NN | Needs scaling; small k overfits |
| Decision tree | Gini 1 − Σp², entropy −Σp log₂p; pure node = 0; 50/50 = 0.5 / 1 bit; overfits without depth limits |
| Naive Bayes | Features independent given class; good for text |
| SVM | Maximum margin; kernels for non-linear boundaries; C controls regularisation |
| Regularisation | L1 Lasso zeroes coefficients; L2 Ridge shrinks; Elastic Net mixes |
| Imbalance | Accuracy paradox: use precision, recall, F1, PR-AUC |

## Unsupervised learning

| Topic | Remember |
|---|---|
| k-means | Minimises inertia; needs k and scaling; spherical clusters; k-means++ initialisation; inertia always falls with k |
| Choosing k | Elbow, silhouette (−1 to 1, higher better), domain sense |
| Hierarchical | Agglomerative merging; linkage single/complete/average/Ward; dendrogram |
| DBSCAN | eps, min_samples; core/border/noise (−1); any shape; no k |
| PCA | Standardise first; orthogonal uncorrelated components; keep 90–95% variance |
| t-SNE, UMAP | Visualisation only |
| Association | Support; confidence = sup(A∪B)/sup(A); lift = conf/sup(B): > 1 positive, 1 independent, < 1 negative |
| Anomalies | Isolation Forest (short paths), z/IQR, DBSCAN noise, one-class SVM |

## Advanced ML

| Topic | Remember |
|---|---|
| Bagging | Parallel, bootstrap; random forest adds feature randomness; reduces variance; OOB score |
| Boosting | Sequential on errors (AdaBoost, gradient boosting, XGBoost, LightGBM, CatBoost); reduces bias; learning rate, depth, early stopping |
| Stacking / voting | Meta-model on base predictions / majority or averaged probabilities |
| Cross-validation | k-fold; stratified for classes; TimeSeriesSplit for time; fits = combinations × folds |
| Tuning | Grid (all), random (sampled), Bayesian; test set used once |
| Imbalance | Class weights, SMOTE/resampling on training only, threshold tuning |
| Leakage | Preprocessing on all data, future information, duplicates across splits; use Pipelines |
| Feature selection | Filter, wrapper (RFE), embedded (Lasso, tree importance); permutation importance, SHAP |
| Neural nets | ReLU hidden; sigmoid binary; softmax multi-class; cross-entropy; backprop + gradient descent; Adam; dropout; high learning rate diverges |
| Architectures | CNN images, RNN/LSTM sequences, transformers language |

## GenAI and LLMs

| Topic | Remember |
|---|---|
| Families | LLMs (next token), diffusion (denoising), GANs (generator vs discriminator), VAEs |
| Tokens | ≈ ¾ word; 1,000 tokens ≈ 750 words; context window = max tokens at once |
| Attention | softmax(QKᵀ/√d)V; multi-head; positional encodings |
| Architectures | Encoder-only BERT (understanding); decoder-only GPT/Llama/Claude (generation); encoder–decoder T5/BART |
| Training | Pre-training (self-supervised) → instruction tuning (SFT) → alignment (RLHF, DPO) |
| Decoding | Temperature low = deterministic, high = creative; top-k; top-p smallest set with mass ≥ p; greedy; beam |
| Prompting | Zero-shot, few-shot, chain-of-thought, role/system prompts, output schema, delimiters |
| Adapting | Prompting first; RAG for knowledge; fine-tuning (LoRA/PEFT) for behaviour and style |
| Risks | Hallucination, knowledge cut-off, bias, prompt injection, privacy, cost |
| Evaluation | Perplexity, BLEU/ROUGE, exact match, benchmarks, LLM-as-judge, human review |

## Agentic AI and RAG

| Topic | Remember |
|---|---|
| RAG pipeline | Chunk → embed → vector DB → embed query → top-k cosine → rerank → prompt with context → answer with citations |
| Chunking | Overlap keeps boundary content; too small loses context, too large dilutes |
| Embeddings | Same model for documents and queries; cosine similarity |
| Retrieval upgrades | Hybrid (BM25 + vectors) for exact terms; cross-encoder rerank; metadata and access filters |
| Vector DBs | FAISS, Chroma, Pinecone, Weaviate, Milvus, Qdrant, pgvector; ANN (HNSW) |
| Evaluation | Recall@k, precision@k, MRR; faithfulness, answer relevance (RAGAS) |
| Agent | LLM + tools + memory + planning loop; ReAct: Thought → Action → Observation |
| Tool calling | LLM proposes a JSON call; the application executes it |
| Patterns | Workflow chain, router, single agent, plan-and-execute, multi-agent orchestrator–worker, agentic RAG |
| MCP | Open protocol connecting LLM apps to tools and data |
| Safeguards | Step and cost limits, least privilege, human approval for consequential actions, injection defences |

# Business skills

| Framework | Content |
|---|---|
| 7 Cs | Clear, concise, concrete, correct, coherent, complete, courteous |
| SBI feedback | Situation, Behaviour, Impact |
| Tuckman | Forming, storming, norming, performing, adjourning |
| Conflict modes | Competing, collaborating (win–win), compromising, avoiding, accommodating |
| EQ (Goleman) | Self-awareness, self-regulation, motivation, empathy, social skills |
| Leadership | Autocratic, democratic, laissez-faire, transformational, servant (Scrum Master), situational |
| Motivation | Maslow (physiological → safety → belonging → esteem → self-actualisation); Herzberg hygiene vs motivators; McGregor X/Y |
| Problem solving | 5 Whys, fishbone, Pareto 80/20, SWOT (internal S/W, external O/T), PESTLE, Porter's five forces, design thinking (empathise → define → ideate → prototype → test) |
| Time | Eisenhower (urgent+important do; important schedule; urgent delegate; neither drop); SMART; MoSCoW; Pomodoro |
| Customers | LAST (listen, apologise, solve, thank); NPS = % promoters − % detractors; CSAT; SLA; power–interest grid |
| Scrum | Product Owner (backlog, value), Scrum Master (process, impediments), Developers; sprint, planning, daily scrum (15 min), review (product), retrospective (process); velocity; Definition of Done; INVEST stories |
| Projects | Triple constraint; RACI (one Accountable); critical path; risk responses avoid/mitigate/transfer/accept; Kanban WIP limits |
| Numbers | Gross margin (rev − direct costs)/rev; net margin; break-even = fixed / (price − variable); ROI = (gain − cost)/cost; CAGR = (end/start)^(1/years) − 1 |

**Situational answers:** pick the option that is ethical, prompt, transparent, collaborative and customer-focused; reject hiding problems, blaming, breaking policy, or escalating before trying. Data and security incidents are reported immediately; gifts that could influence decisions are declined; confidential data goes only into approved tools.

## The night before

- Read this book twice; reread your ✗ answers from the practice sets.
- Re-type one coding solution from memory in a plain editor.
- Check the admit card, ID, start time and system requirements; sleep early.
