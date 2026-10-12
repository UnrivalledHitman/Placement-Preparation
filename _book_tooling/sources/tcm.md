# Mock paper 1
%The full 66-question pattern: one coding question (35 marks), 40 technical questions (5 per topic) and 25 business-skills questions; sit it in one timed session

**Instructions.** Write the coding solution in a plain editor and test it with the sample input before looking at the model solution. Answer the MCQs without notes. Score: coding out of 35 (mark it by the checklist in the solution), one mark per MCQ.

## Section A: Python coding (35 marks)

**Flight bookings.** Create a class `Flight` with attributes `flight_no` (str), `source` (str), `destination` (str), `fare` (float) and `seats` (int, seats available). Create a class `Airline` holding a list of flights with methods:

- `flights_between(source, destination)`: flights on that route (case-insensitive), sorted by fare ascending, then flight number.
- `book(flight_no, count)`: if the flight exists and has at least `count` seats, reduce its seats and return the total price (`fare × count`); otherwise return `None`.
- `cheapest_to_each_destination()`: a dictionary from destination to the flight number of the cheapest flight there (first in input order on ties).

Input: n; for each flight, five lines; then a source and a destination; then a line `flight_no count` for one booking. Output: the flights on the route as `flight_no fare` lines, or `No Flights Found`; then `Booked: <total>` with two decimals or `Booking Failed`; then each destination and its cheapest flight, sorted by destination.

```text
Sample input (one value per line):
  4 / AI101 / Pune / Delhi / 5400 / 3 / 6E202 / Pune / Delhi / 4800 / 10 /
  UK303 / Mumbai / Delhi / 4800 / 2 / 6E404 / Pune / Goa / 3100 / 0 /
  pune / delhi / AI101 2
Sample output:
6E202 4800.0
AI101 5400.0
Booked: 10800.00
Delhi 6E202
Goa 6E404
```

## Section B: Technical quiz (40 marks)

The SQL questions use the guide's `emp` and `dept` tables.

**Q1.** Which clause filters groups after aggregation? (a) HAVING (b) WHERE (c) ORDER BY (d) LIMIT

**Q2.** Which join returns all rows from both tables, matched where possible? (a) INNER JOIN (b) LEFT JOIN (c) CROSS JOIN (d) FULL OUTER JOIN

**Q3.** What does `SELECT COUNT(*) FROM emp WHERE salary > 90000 OR salary IS NULL;` return? (a) 2 (b) 5 (c) 4 (d) 3

**Q4.** What does this return?

```sql
SELECT d.dept_name FROM dept d LEFT JOIN emp e ON d.dept_id = e.dept_id
WHERE e.emp_id IS NULL;
```

(a) Research (b) Sales (c) No rows (d) Every department

**Q5.** What does `SELECT AVG(salary) FROM emp WHERE dept_id = 30;` return (Arjun earns 60000; Gopal's salary is NULL)? (a) 60000 (b) 30000 (c) NULL (d) An error

**Q6.** Which agent chooses actions by maximising a measure of how desirable each outcome is? (a) Simple reflex (b) Utility-based (c) Goal-based (d) Model-based reflex

**Q7.** Which is an example of self-supervised learning? (a) Predicting masked words in sentences (b) Classifying labelled X-rays (c) Clustering customers (d) A robot rewarded for walking

**Q8.** A robot learns to walk by trial and error, getting points for staying upright. This is (a) reinforcement learning (b) supervised learning (c) clustering (d) dimensionality reduction

**Q9.** An e-mail filter is trained on 50,000 e-mails labelled spam or not spam. This is (a) reinforcement learning (b) supervised regression (c) unsupervised clustering (d) supervised classification

**Q10.** What does this print?

```python
true_cost = {'A': 7, 'B': 4, 'C': 2, 'G': 0}
h = {'A': 6, 'B': 5, 'C': 1, 'G': 0}
print([n for n in h if h[n] > true_cost[n]])
```

(a) [] (b) ['B', 'G'] (c) ['A', 'C'] (d) ['B']

**Q11.** Spearman correlation measures (a) linear association of raw values (b) causation (c) monotonic association of ranks (d) variance

**Q12.** Which plot best shows the relationship between two continuous variables? (a) Pie chart (b) Count plot (c) Scatter plot (d) Bar chart of totals

**Q13.** What does this print?

```python
import pandas as pd
df = pd.DataFrame({'age': [25, None, 40, 35], 'city': ['A', 'B', None, 'A']})
print(df.describe().shape, df['city'].nunique())
```

(a) (8, 2) 3 (b) (8, 1) 3 (c) (4, 2) 2 (d) (8, 1) 2

**Q14.** What does this print?

```python
import pandas as pd
df = pd.DataFrame({'a': [1, 3, 5, 2], 'b': [10, 20, 30, 40]})
print(df[df['a'] > 2]['b'].sum())
```

(a) 90 (b) 100 (c) 30 (d) 50

**Q15.** What does this print?

```python
import pandas as pd
print(pd.get_dummies(pd.Series(['red', 'green', 'red']), dtype=int).shape)
```

(a) (3, 1) (b) (2, 3) (c) (3, 2) (d) (3, 3)

**Q16.** A model's training accuracy is far higher than its validation accuracy. Which is **not** a remedy? (a) More training data (b) Regularisation (c) Pruning the tree (d) A more complex model with more features

**Q17.** The kernel trick in SVMs is used to (a) speed up training on huge datasets (b) handle missing values (c) learn non-linear decision boundaries (d) reduce the number of classes

**Q18.** A classifier has TP = 45, FN = 5, FP = 15, TN = 35. Its accuracy and recall are (a) 0.80 and 0.90 (b) 0.90 and 0.80 (c) 0.80 and 0.75 (d) 0.75 and 0.90

**Q19.** What does this print?

```python
from sklearn.neighbors import KNeighborsClassifier
knn = KNeighborsClassifier(n_neighbors=3).fit([[1], [2], [3], [10], [11]], [0, 0, 0, 1, 1])
print(knn.predict([[9]])[0])
```

(a) 0 (b) 2 (c) 1 (d) An error

**Q20.** What does this print?

```python
from sklearn.metrics import mean_absolute_error, mean_squared_error
y, p = [3, 5, 8], [2, 5, 10]
print(mean_absolute_error(y, p), round(mean_squared_error(y, p), 3))
```

(a) 1.0 1.667 (b) 3.0 5.0 (c) 1.0 1.0 (d) 1.667 1.0

**Q21.** The output of hierarchical clustering is typically visualised as a (a) ROC curve (b) confusion matrix (c) dendrogram (d) box plot

**Q22.** t-SNE is mainly used for (a) supervised classification (b) association rules (c) feature scaling (d) visualising high-dimensional data in 2-D or 3-D

**Q23.** A supermarket wants rules such as "customers who buy pasta also buy sauce". The right technique is (a) linear regression (b) association rule mining (Apriori) (c) PCA (d) logistic regression

**Q24.** What does this print?

```python
baskets = [{'pasta', 'sauce'}, {'pasta'}, {'sauce', 'cheese'},
           {'pasta', 'sauce', 'cheese'}, {'bread'}]
sup = lambda s: sum(s <= b for b in baskets) / len(baskets)
print(sup({'pasta', 'sauce'}) / sup({'pasta'}))
```

(a) 0.4 (b) 1.0 (c) 0.5 (d) 0.6667 (approximately)

**Q25.** What does this print?

```python
from sklearn.cluster import DBSCAN
print(DBSCAN(eps=1, min_samples=2).fit_predict([[0], [10], [20]]).tolist())
```

(a) [0, 1, 2] (b) [-1, -1, -1] (c) [0, 0, 0] (d) [0, -1, 1]

**Q26.** XGBoost is an implementation of (a) gradient boosting (b) bagging (c) k-means (d) PCA

**Q27.** A random forest's out-of-bag (OOB) score is computed on (a) the test set (b) samples left out of each tree's bootstrap sample (c) the training predictions of each tree (d) a separate validation file

**Q28.** You are tuning a model on three years of daily sales. Which cross-validation scheme is correct? (a) Shuffled k-fold (b) TimeSeriesSplit (c) Leave-one-out with shuffling (d) Stratified k-fold by product

**Q29.** `GridSearchCV` is given `{'C': [0.1, 1, 10], 'kernel': ['linear', 'rbf']}` and `cv=3`. How many parameter combinations does it evaluate? (a) 5 (b) 18 (c) 9 (d) 6

**Q30.** What does this print?

```python
w, lr, grad = 0.5, 0.1, 2.0
for _ in range(3):
    w -= lr * grad
print(round(w, 2))
```

(a) 0.3 (b) 0.44 (c) 1.1 (d) -0.1

**Q31.** GPT-style models are (a) encoder-only (b) convolutional (c) decoder-only and autoregressive (d) generative adversarial networks

**Q32.** LoRA fine-tuning (a) retrains every weight of the model (b) trains small low-rank adapter matrices while the base weights stay frozen (c) only changes the prompt (d) removes layers

**Q33.** You need the same JSON extraction from invoices every time. Which settings help most? (a) High temperature and no format instructions (b) Top-p = 1 and creative instructions (c) Low temperature and an explicit JSON schema in the prompt (d) A longer context only

**Q34.** An LLM cannot answer questions about events after its training data ends. This limitation is (a) prompt injection (b) tokenisation (c) the knowledge cut-off (d) overfitting

**Q35.** What does this print?

```python
import numpy as np
z = np.array([2.0, 1.0, 0.0]) / 0.5          # temperature 0.5
p = np.exp(z) / np.exp(z).sum()
print(round(float(p[0]), 3))
```

(a) 0.665 (b) 0.867 (c) 0.5 (d) 0.976

**Q36.** A vector database mainly stores (a) SQL tables of transactions (b) embeddings, for fast similarity search (c) model weights (d) prompts only

**Q37.** In a RAG pipeline, a reranker (a) splits documents into chunks (b) rescores retrieved candidates more precisely, often with a cross-encoder (c) generates the final answer (d) encrypts the index

**Q38.** An agent keeps calling the search tool in a loop without finishing. The first safeguard to add is (a) a higher temperature (b) more tools (c) a bigger context window (d) a maximum number of steps and a clear stopping condition

**Q39.** What does this print?

```python
import numpy as np
a, b = np.array([0.6, 0.8]), np.array([0.8, 0.6])
print(round(float(a @ b), 2))
```

(a) 0.96 (b) 0.48 (c) 1.0 (d) 1.4

**Q40.** Relevant chunks are {2, 4, 7}; the retriever returns [4, 9, 2, 7]. What is precision@3? (a) 0.67 (b) 0.33 (c) 0.75 (d) 1.0

## Section C: Business skills (25 marks)

**Q41.** You find a bug in code that was delivered to the client yesterday. You should (a) inform your lead immediately with the impact and a fix plan (b) fix it quietly in the next release (c) wait for the client to notice (d) blame the tester

**Q42.** The best subject line for an e-mail requesting leave approval is (a) "Leave request: 14–16 Nov (approval needed by 10 Nov)" (b) "Hi" (c) "Urgent!!!" (d) No subject

**Q43.** In Maslow's hierarchy, which need comes directly after safety? (a) Esteem (b) Physiological (c) Self-actualisation (d) Belonging

**Q44.** A leader who removes obstacles and puts the team's needs first shows (a) autocratic (b) servant (c) laissez-faire (d) transactional leadership

**Q45.** Which is a "Won't have this time" item in MoSCoW prioritisation? (a) A legally required feature (b) A feature deliberately excluded from the current release (c) The most valuable feature (d) A bug fix

**Q46.** The daily scrum should last at most (a) half a day (b) 1 hour (c) 15 minutes (d) a sprint

**Q47.** Velocity in Scrum is (a) lines of code per day (b) story points completed per sprint (c) number of meetings (d) bugs per release

**Q48.** A customer asks for a feature outside the agreed scope with the same deadline. The best response is to (a) explain the impact and route it through change control with options (b) refuse rudely (c) agree and work overtime silently (d) ignore the request

**Q49.** Which tool groups possible causes of a problem into categories such as people, process and technology? (a) Pareto chart (b) Fishbone (Ishikawa) diagram (c) Gantt chart (d) RACI matrix

**Q50.** In the power–interest grid, a stakeholder with high power and high interest should be (a) monitored (b) kept informed (c) ignored (d) managed closely

**Q51.** The "R" in SMART goals stands for (a) Rapid (b) Rigid (c) Relevant (d) Repeated

**Q52.** A colleague asks for your password to finish urgent work while you are on leave. You should (a) share it by message (b) share it but change it later (c) refuse and suggest they request access through the proper process (d) write it on a sticky note

**Q53.** NPS is calculated as (a) revenue per customer (b) average rating out of 5 (c) number of complaints (d) % promoters − % detractors

**Q54.** A product sells 2,000 units at ₹250 with total costs of ₹4,20,000. The profit is (a) ₹50,000 (b) ₹1,00,000 (c) ₹80,000 (d) ₹4,20,000

**Q55.** Which describes a "time and materials" contract? (a) A fixed price for the whole scope (b) Payment only on success (c) The client pays for actual effort and resources used (d) A free pilot

**Q56.** During a presentation, an audience member asks a question you cannot answer. The best response is to (a) guess confidently (b) say you will find out and follow up by a specific time (c) ignore it (d) change the topic

**Q57.** Which behaviour shows active listening? (a) Planning your reply while the other person talks (b) Paraphrasing what was said to confirm understanding (c) Interrupting with solutions (d) Checking your phone

**Q58.** A teammate from another country follows different holidays and working hours. The best approach is to (a) schedule meetings only in your time zone (b) message them at midnight (c) exclude them from decisions (d) find overlapping hours and respect their calendar

**Q59.** A critical path task slips by two days and nothing else changes. The project end date (a) is unaffected (b) slips by two days (c) moves earlier (d) slips by one day

**Q60.** "Customers in tier-2 cities are adopting digital payments faster" is, for a fintech company, best classified in SWOT as (a) a strength (b) an opportunity (c) a weakness (d) a threat

**Q61.** Which is the best example of constructive feedback? (a) "Your report was bad." (b) "Everyone thinks you are careless." (c) "In yesterday's report (situation), the totals in section 3 did not match the appendix (behaviour), so the client questioned our numbers (impact)." (d) "Fine, whatever."

**Q62.** An employee notices a manager falsifying expense claims. The right action is to (a) ignore it (b) confront the manager publicly (c) post about it on social media (d) report it through the company's ethics or whistle-blowing channel

**Q63.** Revenue grew from ₹50 crore to ₹60 crore. The growth rate is (a) 20% (b) 16.7% (c) 10% (d) 83%

**Q64.** In Agile, the Definition of Done is (a) a shared checklist of criteria a backlog item must meet to be complete (b) the date of the deadline (c) the client's signature (d) the sprint length

**Q65.** You receive an e-mail from "IT support" asking you to verify your password through a link. You should (a) click and enter it quickly (b) forward it to colleagues (c) report it as phishing without clicking (d) reply with your password

## Answer key: mock paper 1

```python run Model solution for the flight bookings question, on the sample and an edge case
import io, sys

class Flight:
    def __init__(self, flight_no, source, destination, fare, seats):
        self.flight_no = flight_no
        self.source = source
        self.destination = destination
        self.fare = fare
        self.seats = seats

class Airline:
    def __init__(self, flights):
        self.flights = flights

    def flights_between(self, source, destination):
        route = [f for f in self.flights if f.source.lower() == source.lower()
                 and f.destination.lower() == destination.lower()]
        return sorted(route, key=lambda f: (f.fare, f.flight_no))

    def book(self, flight_no, count):
        for f in self.flights:
            if f.flight_no == flight_no and f.seats >= count:
                f.seats -= count
                return f.fare * count
        return None

    def cheapest_to_each_destination(self):
        best = {}
        for f in self.flights:
            if f.destination not in best or f.fare < best[f.destination].fare:
                best[f.destination] = f
        return {d: f.flight_no for d, f in best.items()}

def main():
    n = int(input())
    flights = [Flight(input().strip(), input().strip(), input().strip(), float(input()),
                      int(input())) for _ in range(n)]
    source, destination = input().strip(), input().strip()
    flight_no, count = input().split()
    airline = Airline(flights)
    route = airline.flights_between(source, destination)
    if route:
        for f in route:
            print(f.flight_no, f.fare)
    else:
        print('No Flights Found')
    total = airline.book(flight_no, int(count))
    print(f'Booked: {total:.2f}' if total is not None else 'Booking Failed')
    for d, f in sorted(airline.cheapest_to_each_destination().items()):
        print(d, f)

SAMPLE = ('4\nAI101\nPune\nDelhi\n5400\n3\n6E202\nPune\nDelhi\n4800\n10\nUK303\nMumbai\n'
          'Delhi\n4800\n2\n6E404\nPune\nGoa\n3100\n0\npune\ndelhi\nAI101 2\n')
EDGE = '1\nX1\nA\nB\n100\n1\nB\nA\nX1 5\n'
for data in (SAMPLE, EDGE):
    sys.stdin = io.StringIO(data)
    main()
    print('---')
```

Marking checklist (35): classes and attributes in the given order (5); case-insensitive route filter with the two-key sort (8); booking checks existence and seats and updates seats (8); cheapest per destination keeping the first on ties (6: 6E202 beats UK303 at the same fare because it came first); exact output, including both fallback messages and two decimals (8).

| Q | Ans | Why | Q | Ans | Why |
|---|---|---|---|---|---|
| 1 | a | HAVING filters groups | 21 | c | Dendrogram |
| 2 | d | FULL OUTER JOIN | 22 | d | Visualisation |
| 3 | d | Asha, Meera, plus Gopal (NULL) | 23 | b | Association rules |
| 4 | a | Research has no employees | 24 | d | Confidence = 0.4 / 0.6 |
| 5 | a | AVG ignores Gopal's NULL | 25 | b | No point has a neighbour within 1 |
| 6 | b | Utility-based | 26 | a | Gradient boosting |
| 7 | a | Labels come from the data | 27 | b | Out-of-bag samples |
| 8 | a | Rewards → RL | 28 | b | Never train on the future |
| 9 | d | Labelled categories | 29 | d | 3 × 2 combinations (18 fits) |
| 10 | d | h(B) = 5 > 4: B overestimates | 30 | d | 0.5 − 3 × 0.2 = −0.1 |
| 11 | c | Ranks, monotonic | 31 | c | Decoder-only |
| 12 | c | Scatter plot | 32 | b | Low-rank adapters |
| 13 | d | describe covers numeric columns only; NaN not counted | 33 | c | Low temperature + schema |
| 14 | d | a > 2 selects the rows with a = 3 and 5: 20 + 30 | 34 | c | Knowledge cut-off |
| 15 | c | Two categories → two columns | 35 | b | Sharper distribution |
| 16 | d | More complexity worsens overfitting | 36 | b | Embeddings |
| 17 | c | Non-linear boundaries | 37 | b | Precise rescoring |
| 18 | a | (45 + 35)/100; 45/50 | 38 | d | Step limit and stop condition |
| 19 | c | Neighbours 10, 11 (label 1) and 3 (label 0) | 39 | a | 0.48 + 0.48 |
| 20 | a | MAE 1.0, MSE 5/3 | 40 | a | 4 and 2 relevant out of 3 |

| Q | Ans | Q | Ans | Q | Ans | Q | Ans | Q | Ans |
|---|---|---|---|---|---|---|---|---|---|
| 41 | a | 46 | c | 51 | c | 56 | b | 61 | c |
| 42 | a | 47 | b | 52 | c | 57 | b | 62 | d |
| 43 | d | 48 | a | 53 | d | 58 | d | 63 | a |
| 44 | b | 49 | b | 54 | c | 59 | b | 64 | a |
| 45 | b | 50 | d | 55 | c | 60 | b | 65 | c |

```python run Checking the code questions of mock paper 1
import numpy as np, pandas as pd
from cpa_sql import db
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.cluster import DBSCAN
con = db()
q = lambda s: con.execute(s).fetchall()
print('Q3:', q('SELECT COUNT(*) FROM emp WHERE salary > 90000 OR salary IS NULL'))
print('Q4:', q('SELECT d.dept_name FROM dept d LEFT JOIN emp e ON d.dept_id = e.dept_id '
               'WHERE e.emp_id IS NULL'))
print('Q5:', q('SELECT AVG(salary) FROM emp WHERE dept_id = 30'))
true_cost, h = {'A': 7, 'B': 4, 'C': 2, 'G': 0}, {'A': 6, 'B': 5, 'C': 1, 'G': 0}
print('Q10:', [n for n in h if h[n] > true_cost[n]])
df = pd.DataFrame({'age': [25, None, 40, 35], 'city': ['A', 'B', None, 'A']})
print('Q13:', df.describe().shape, df['city'].nunique())
d2 = pd.DataFrame({'a': [1, 3, 5, 2], 'b': [10, 20, 30, 40]})
print('Q14:', d2[d2['a'] > 2]['b'].sum())
print('Q15:', pd.get_dummies(pd.Series(['red', 'green', 'red']), dtype=int).shape)
print('Q18:', (45 + 35) / 100, 45 / 50)
knn = KNeighborsClassifier(n_neighbors=3).fit([[1], [2], [3], [10], [11]], [0, 0, 0, 1, 1])
print('Q19:', knn.predict([[9]])[0])
y, p = [3, 5, 8], [2, 5, 10]
print('Q20:', mean_absolute_error(y, p), round(mean_squared_error(y, p), 3))
baskets = [{'pasta', 'sauce'}, {'pasta'}, {'sauce', 'cheese'}, {'pasta', 'sauce', 'cheese'},
           {'bread'}]
sup = lambda s: sum(s <= b for b in baskets) / len(baskets)
print('Q24:', sup({'pasta', 'sauce'}) / sup({'pasta'}))
print('Q25:', DBSCAN(eps=1, min_samples=2).fit_predict([[0], [10], [20]]).tolist())
w = 0.5
for _ in range(3):
    w -= 0.1 * 2.0
print('Q30:', round(w, 2))
z = np.array([2.0, 1.0, 0.0]) / 0.5
print('Q35:', round(float((np.exp(z) / np.exp(z).sum())[0]), 3))
print('Q39:', round(float(np.array([0.6, 0.8]) @ np.array([0.8, 0.6])), 2))
print('Q40:', round(len({2, 4, 7} & set([4, 9, 2, 7][:3])) / 3, 2))
print('Q54:', 2000 * 250 - 420000, ' Q63:', (60 - 50) / 50)
```
