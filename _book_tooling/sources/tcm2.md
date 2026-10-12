# Mock paper 2
%A second full paper in the same pattern, with new questions throughout; sit it two days after mock paper 1

## Section A: Python coding (35 marks)

**Hotel bookings.** Create a class `Room` with attributes `room_no` (str), `rate` (float, per night) and `booked` (initially `False`), and a method `bill(nights)` returning `rate × nights`. Create subclasses `StandardRoom` (room type `Standard`) and `DeluxeRoom` (room type `Deluxe`), where `DeluxeRoom` also has a `breakfast` charge per night and **overrides** `bill(nights)` to add it. Create a class `Hotel` with:

- `book(room_no, nights)`: if the room exists and is not booked, mark it booked and return its bill; otherwise return `None`.
- `available(room_type)`: unbooked rooms of that type (case-insensitive), sorted by rate, then room number.
- `occupancy()`: the percentage of rooms booked, rounded to one decimal.

Input: n; n lines, each `S room_no rate` or `D room_no rate breakfast`; then q; q lines `room_no nights`; then a room type. Output: for each booking `room_no bill` with two decimals or `room_no Not Available`; then the available rooms of the type as `room_no rate` lines or `No Rooms Available`; then `Revenue: <total>` with two decimals; then `Occupancy: <value>%`.

```text
Sample input:
5
S 101 2500
D 201 4500 600
S 102 2200
D 202 4500 500
S 103 2200
4
201 2
102 3
201 1
999 2
standard
Sample output:
201 10200.00
102 6600.00
201 Not Available
999 Not Available
103 2200.0
101 2500.0
Revenue: 16800.00
Occupancy: 40.0%
```

## Section B: Technical quiz (40 marks)

The SQL questions use the guide's `emp` and `dept` tables.

**Q1.** What is the difference between UNION and UNION ALL? (a) None (b) UNION ALL removes duplicates (c) UNION removes duplicate rows; UNION ALL keeps them (d) UNION works only on two columns

**Q2.** Which is a drawback of adding many indexes to a table? (a) Slower SELECTs (b) Loss of primary keys (c) Slower INSERT, UPDATE and DELETE, and more storage (d) No drawback

**Q3.** What does `SELECT name FROM emp WHERE salary IS NOT NULL ORDER BY salary DESC LIMIT 1 OFFSET 1;` return? (a) Asha (b) Meera (c) Ravi (d) Divya

**Q4.** What does this return?

```sql
SELECT COUNT(*) FROM emp e JOIN emp m ON e.manager_id = m.emp_id;
```

(a) 6 (b) 7 (c) 8 (d) 1

**Q5.** In the result of `SELECT dept_id, COUNT(*) FROM emp WHERE salary >= 90000 GROUP BY dept_id;`, what is the count for department 20? (a) 1 (b) 2 (c) 3 (d) 4

**Q6.** PEAS, used to describe an agent's task, stands for (a) Performance, Environment, Actuators, Sensors (b) Plan, Execute, Assess, Sense (c) Perception, Evaluation, Action, State (d) Policy, Episode, Action, Sample

**Q7.** Narrow AI refers to systems that (a) perform a specific task well (b) match humans at every task (c) have consciousness (d) run on small devices only

**Q8.** A chess program looks ahead several moves, assuming the opponent plays optimally, and skips branches that cannot affect the decision. It uses (a) k-means (b) BFS only (c) linear regression (d) minimax with alpha–beta pruning

**Q9.** In training a neural network, the learning rate is (a) a hyperparameter set before training (b) a parameter learned from data (c) the accuracy on the test set (d) the number of layers

**Q10.** What does this print?

```python
g = {1: [2, 3], 2: [4], 3: [4], 4: []}
order = []
def dfs(n):
    if n in order:
        return
    order.append(n)
    for m in g[n]:
        dfs(m)
dfs(1)
print(order)
```

(a) [1, 2, 3, 4] (b) [1, 3, 4, 2] (c) [1, 2, 4, 3] (d) [4, 2, 3, 1]

**Q11.** Forward fill (`ffill`) is most appropriate for missing values in (a) customer names (b) unique IDs (c) product categories (d) time-series sensor readings

**Q12.** A distribution with high kurtosis has (a) heavier tails and more extreme values (b) no outliers (c) perfect symmetry (d) a uniform shape

**Q13.** What does this print?

```python
import pandas as pd
df = pd.DataFrame({'name': ['A', 'B', 'C'], 'score': [70, 95, 85]})
print(df.sort_values('score', ascending=False).iloc[0]['name'])
```

(a) A (b) C (c) B (d) 95

**Q14.** What does this print?

```python
import pandas as pd
df = pd.DataFrame({'city': ['X', 'X', 'Y', 'Y'], 'plan': ['p', 'q', 'p', 'p'],
                   'spend': [100, 200, 300, 500]})
print(pd.pivot_table(df, values='spend', index='city', columns='plan',
        aggfunc='mean').loc['Y', 'p'])
```

(a) 300.0 (b) 800.0 (c) 400.0 (d) NaN

**Q15.** What does this print?

```python
import pandas as pd
s = pd.Series([4, None, 10, 2, None])
print(s.fillna(s.median()).tolist())
```

(a) [4.0, 5.33, 10.0, 2.0, 5.33] (b) [4.0, 10.0, 10.0, 2.0, 2.0] (c) [4.0, 0.0, 10.0, 2.0, 0.0] (d) [4.0, 4.0, 10.0, 2.0, 4.0]

**Q16.** Naive Bayes assumes that (a) classes are balanced (b) data is linearly separable (c) features are independent given the class (d) features are normally scaled

**Q17.** Adjusted R² differs from R² because it (a) penalises adding features that do not improve the model (b) can never be negative (c) is used for classification (d) ignores the intercept

**Q18.** For a spam filter, sending a genuine business e-mail to the spam folder is very costly. Which metric matters most? (a) Recall of spam (b) Precision of spam (c) Accuracy (d) Number of features

**Q19.** What does this print?

```python
from sklearn.metrics import confusion_matrix
print(confusion_matrix([1, 0, 1, 1, 0, 0], [1, 0, 0, 1, 1, 0]).tolist())
```

(a) [[2, 1], [1, 2]] (b) [[1, 2], [2, 1]] (c) [[3, 0], [0, 3]] (d) [[2, 2], [1, 1]]

**Q20.** What does this print?

```python
from math import log2
counts = [4, 4]
print(-sum(c / 8 * log2(c / 8) for c in counts))
```

(a) 0.0 (b) 1.0 (c) 0.5 (d) 2.0

**Q21.** The k-means++ initialisation (a) spreads the initial centroids apart to improve convergence (b) chooses k automatically (c) removes outliers (d) uses labels

**Q22.** As k increases in k-means, the inertia (a) always increases (b) is random (c) stays constant (d) never increases (with the best solution for each k)

**Q23.** You have 300 highly correlated sensor features and want fewer, uncorrelated inputs for a model. The best technique is (a) PCA (b) one-hot encoding (c) DBSCAN (d) oversampling

**Q24.** What does this print?

```python
import numpy as np
ratios = np.array([0.55, 0.25, 0.12, 0.05, 0.03])
print(int(np.argmax(np.cumsum(ratios) >= 0.9)) + 1)
```

(a) 2 (b) 5 (c) 4 (d) 3

**Q25.** What does this print?

```python
from sklearn.cluster import AgglomerativeClustering
X = [[0], [1], [10], [11], [30]]
print(len(set(AgglomerativeClustering(n_clusters=3).fit_predict(X))))
```

(a) 3 (b) 2 (c) 5 (d) 1

**Q26.** Stacking is an ensemble method that (a) averages identical models (b) removes weak features (c) trains models sequentially on errors (d) trains a meta-model on the predictions of several base models

**Q27.** Early stopping halts training when (a) the training loss reaches zero (b) the learning rate is too high (c) the validation loss stops improving (d) one epoch finishes

**Q28.** A model scored 0.95 AUC in cross-validation but performs poorly after deployment, because customer behaviour changed. This is (a) overfitting to noise (b) class imbalance (c) underfitting (d) data drift

**Q29.** What does this print?

```python
import numpy as np
from sklearn.preprocessing import StandardScaler
train, test = np.array([[1.0], [2.0], [3.0]]), np.array([[4.0]])
print(StandardScaler().fit(train).transform(test).round(3).item())
```

(a) 0.0 (b) 1.0 (c) 2.449 (d) 1.225

**Q30.** What does this print?

```python
import numpy as np
probs = np.array([[0.1, 0.7, 0.2], [0.5, 0.3, 0.2]])
print(probs.argmax(axis=1).tolist())
```

(a) [0.7, 0.5] (b) [0, 1] (c) [1, 0] (d) [2, 0]

**Q31.** Diffusion models generate images by (a) gradually removing noise, starting from random noise (b) predicting the next pixel (c) clustering pixels (d) retrieving similar images

**Q32.** An LLM's context window is (a) the number of users it can serve (b) its vocabulary size (c) its training dataset size (d) the maximum number of tokens it can attend to at once (prompt plus output)

**Q33.** A prompt contains three labelled examples of customer reviews before the new review to classify. This is (a) zero-shot prompting (b) few-shot prompting (c) fine-tuning (d) RLHF

**Q34.** A legal-research assistant must not invent case citations. Which combination helps most? (a) Higher temperature (b) A shorter context window (c) Removing the system prompt (d) RAG over a verified case database, required citations, and permission to answer "I don't know"

**Q35.** What does this print?

```python
import numpy as np
p = np.array([0.5, 0.3, 0.15, 0.05])
top = p[:2] / p[:2].sum()
print(top.round(3).tolist())
```

(a) [0.5, 0.3] (b) [0.75, 0.25] (c) [0.6, 0.4] (d) [0.625, 0.375]

**Q36.** Why do chunks in a RAG index usually overlap? (a) To make the index smaller (b) To keep information that crosses a chunk boundary retrievable (c) To speed up the LLM (d) To encrypt documents

**Q37.** In function (tool) calling, who executes the tool? (a) The LLM itself (b) The vector database (c) The application, after the LLM proposes a structured call (d) The user's browser always

**Q38.** A system has a supervisor agent that assigns sub-tasks to a researcher agent and a writer agent and combines their results. This pattern is (a) orchestrator–worker (multi-agent) (b) a single ReAct agent (c) RAG without agents (d) fine-tuning

**Q39.** What does this print?

```python
results = {'q1': ([3, 8, 1], {1}), 'q2': ([5, 2, 9], {5}), 'q3': ([7, 4, 6], {2})}
rr = []
for ranked, relevant in results.values():
    rr.append(next((1 / (i + 1) for i, d in enumerate(ranked) if d in relevant), 0))
print(round(sum(rr) / len(rr), 3))
```

(a) 0.444 (b) 0.333 (c) 0.5 (d) 0.667

**Q40.** What does this print?

```python
import numpy as np
doc_vecs = np.array([[0.1, 0.9], [0.8, 0.2], [0.7, 0.7]])
query = np.array([1.0, 0.0])
sims = doc_vecs @ query / (np.linalg.norm(doc_vecs, axis=1) * np.linalg.norm(query))
print(np.argsort(-sims)[:2].tolist())
```

(a) [0, 1] (b) [1, 2] (c) [2, 1] (d) [1, 0]

## Section C: Business skills (25 marks)

**Q41.** You are asked to estimate a task you have never done before. The best response is (a) give a range with assumptions and refine it after a short investigation (b) give a very low number to please the manager (c) refuse to estimate (d) copy a colleague's estimate for a different task

**Q42.** When should you use "Reply all"? (a) Only when everyone on the thread needs your reply (b) Always (c) Never (d) To say "thanks"

**Q43.** According to Theory Y, employees (a) dislike work and need close control (b) can be self-directed and seek responsibility (c) work only for money (d) avoid all change

**Q44.** The "adjourning" stage in Tuckman's model happens when (a) the team forms (b) the team completes its work and disbands (c) conflict starts (d) norms are agreed

**Q45.** A Gantt chart mainly shows (a) causes of a problem (b) tasks scheduled over time with their durations and dependencies (c) customer satisfaction (d) team roles

**Q46.** In Scrum, who facilitates the process and removes impediments? (a) Scrum Master (b) Product Owner (c) Client (d) Tester

**Q47.** User stories should follow INVEST. The "T" stands for (a) Timely (b) Technical (c) Testable (d) Tracked

**Q48.** A client reports a problem at 6 pm on a Friday; the SLA promises a response within 4 business hours. You should (a) reply only when the fix is ready (b) wait until next month (c) ignore it as it is the weekend (d) respond within the SLA, acknowledging the issue and next steps

**Q49.** The Pareto principle suggests that (a) all causes matter equally (b) about 80% of effects come from about 20% of causes (c) problems fix themselves (d) 50% of effort gives 50% of results

**Q50.** A new joiner keeps making the same mistake in reports. The most helpful action is to (a) report them to HR immediately (b) criticise them in the team meeting (c) redo their work silently (d) explain the issue privately with an example and show the correct approach

**Q51.** Which is an example of a KPI for an IT support team? (a) Office paint colour (b) Average time to resolve tickets (c) Number of chairs (d) The CEO's name

**Q52.** Your team lead asks you to report billable hours you did not work. You should (a) comply (b) ask a colleague to log them (c) report half the hours (d) politely refuse and, if pressed, raise it through the appropriate channel

**Q53.** Gross margin is (a) costs / revenue (b) net profit / revenue (c) revenue / costs (d) (revenue − direct costs) / revenue

**Q54.** A service costs ₹40 per user per month to run and is priced at ₹100, with fixed costs of ₹3,00,000 per month. How many users are needed to break even? (a) 3,000 (b) 5,000 (c) 7,500 (d) 30,000

**Q55.** Which business model gives basic features free and charges for premium features? (a) Licensing (b) Marketplace (c) Freemium (d) Pay-per-use

**Q56.** In a meeting, two senior colleagues argue loudly and the meeting is going off track. As the organiser, you should (a) leave the meeting (b) take one side immediately (c) acknowledge both views, refocus on the agenda and propose discussing the disagreement separately (d) end the meeting without notes

**Q57.** Which is a good practice for meeting minutes? (a) Record decisions and action items with owners and due dates (b) Record every word (c) Send them a month later (d) Keep them private

**Q58.** An employee shares the company's unreleased financial results with a friend who then buys shares. This is (a) insider trading, a serious violation (b) acceptable networking (c) good marketing (d) a minor issue

**Q59.** Which risk response moves the impact to a third party, such as buying insurance? (a) Avoid (b) Mitigate (c) Accept (d) Transfer

**Q60.** Design thinking begins with (a) prototyping (b) testing (c) empathising with users (d) coding

**Q61.** A customer is unhappy with a delay you caused. Which response follows LAST? (a) "That's not my department." (b) "I hear you; I'm sorry for the delay. I've expedited it and you will have it by 3 pm today. Thank you for your patience." (c) "These things happen." (d) No response

**Q62.** You notice a teammate working late every day and looking stressed. A supportive first step is to (a) ignore it (b) tell everyone (c) check in privately and offer help or suggest discussing workload with the manager (d) give them more work

**Q63.** A company's revenue fell from ₹200 crore to ₹170 crore. The percentage change is (a) +15% (b) −17.6% (c) −30% (d) −15%

**Q64.** Which is the best example of a SMART goal for a learner? (a) "Learn ML." (b) "Be better at coding." (c) "Complete the scikit-learn course and build two projects by 30 November." (d) "Study a lot."

**Q65.** Your team uses a Kanban board with a work-in-progress limit of 3 for "In Review", which is full. You finish a task. You should (a) push it into "In Review" anyway (b) help review existing items to free capacity before moving yours (c) start five new tasks (d) delete the limit

## Answer key: mock paper 2

```python run Model solution for the hotel bookings question, on the sample and an edge case
import io, sys

class Room:
    room_type = 'Room'

    def __init__(self, room_no, rate):
        self.room_no = room_no
        self.rate = rate
        self.booked = False

    def bill(self, nights):
        return self.rate * nights

class StandardRoom(Room):
    room_type = 'Standard'

class DeluxeRoom(Room):
    room_type = 'Deluxe'

    def __init__(self, room_no, rate, breakfast):
        super().__init__(room_no, rate)
        self.breakfast = breakfast

    def bill(self, nights):
        return super().bill(nights) + self.breakfast * nights

class Hotel:
    def __init__(self, rooms):
        self.rooms = {r.room_no: r for r in rooms}
        self.revenue = 0.0

    def book(self, room_no, nights):
        room = self.rooms.get(room_no)
        if room is None or room.booked:
            return None
        room.booked = True
        amount = room.bill(nights)
        self.revenue += amount
        return amount

    def available(self, room_type):
        free = [r for r in self.rooms.values()
                if not r.booked and r.room_type.lower() == room_type.lower()]
        return sorted(free, key=lambda r: (r.rate, r.room_no))

    def occupancy(self):
        return round(100 * sum(r.booked for r in self.rooms.values()) / len(self.rooms), 1)

def main():
    rooms = []
    for _ in range(int(input())):
        parts = input().split()
        if parts[0] == 'D':
            rooms.append(DeluxeRoom(parts[1], float(parts[2]), float(parts[3])))
        else:
            rooms.append(StandardRoom(parts[1], float(parts[2])))
    hotel = Hotel(rooms)
    for _ in range(int(input())):
        room_no, nights = input().split()
        amount = hotel.book(room_no, int(nights))
        print(f'{room_no} {amount:.2f}' if amount is not None
                else f'{room_no} Not Available')
    free = hotel.available(input().strip())
    if free:
        for r in free:
            print(r.room_no, r.rate)
    else:
        print('No Rooms Available')
    print(f'Revenue: {hotel.revenue:.2f}')
    print(f'Occupancy: {hotel.occupancy()}%')

SAMPLE = ('5\nS 101 2500\nD 201 4500 600\nS 102 2200\nD 202 4500 500\nS 103 2200\n'
          '4\n201 2\n102 3\n201 1\n999 2\nstandard\n')
EDGE = '1\nD 301 5000 700\n1\n301 1\ndeluxe\n'
for data in (SAMPLE, EDGE):
    sys.stdin = io.StringIO(data)
    main()
    print('---')
```

Marking checklist (35): `Room` with the two subclasses, `super().__init__` in `DeluxeRoom` (8); `bill` overridden in `DeluxeRoom` and called polymorphically (7); booking refuses unknown and already-booked rooms (7); availability filter and two-key sort (6); revenue, occupancy and exact output formats (7).

| Q | Ans | Why | Q | Ans | Why |
|---|---|---|---|---|---|
| 1 | c | UNION de-duplicates | 21 | a | Spread-out initial centroids |
| 2 | c | Index maintenance on writes | 22 | d | More clusters never increase the optimum |
| 3 | b | Second-highest salary | 23 | a | PCA |
| 4 | b | Seven employees have a manager | 24 | d | 0.55, 0.80, 0.92 |
| 5 | c | Asha, Ravi, Divya | 25 | a | Three clusters requested |
| 6 | a | PEAS | 26 | d | Meta-model |
| 7 | a | Task-specific | 27 | c | Validation loss |
| 8 | d | Minimax with pruning | 28 | d | Data drift |
| 9 | a | Hyperparameter | 29 | c | (4 − 2) / 0.816: StandardScaler uses the population standard deviation |
| 10 | c | Depth-first: 1, 2, 4, then 3 | 30 | c | Index of the largest value per row |
| 11 | d | Time series | 31 | a | Iterative denoising |
| 12 | a | Heavy tails | 32 | d | Tokens attended at once |
| 13 | c | Highest score | 33 | b | Few-shot |
| 14 | c | Mean of 300 and 500 | 34 | d | Grounding and abstention |
| 15 | d | Median of 4, 10, 2 is 4 | 35 | d | Renormalised top-2 |
| 16 | c | Conditional independence | 36 | b | Boundary-spanning content |
| 17 | a | Penalises useless features | 37 | c | The application |
| 18 | b | Precision: flagged spam must really be spam | 38 | a | Orchestrator–worker |
| 19 | a | TN 2, FP 1 / FN 1, TP 2 | 39 | a | (1/3 + 1 + 0) / 3 = 0.444 |
| 20 | b | Balanced node: 1 bit | 40 | b | Documents 1 and 2 point most along the query |

| Q | Ans | Q | Ans | Q | Ans | Q | Ans | Q | Ans |
|---|---|---|---|---|---|---|---|---|---|
| 41 | a | 46 | a | 51 | b | 56 | c | 61 | b |
| 42 | a | 47 | c | 52 | d | 57 | a | 62 | c |
| 43 | b | 48 | d | 53 | d | 58 | a | 63 | d |
| 44 | b | 49 | b | 54 | b | 59 | d | 64 | c |
| 45 | b | 50 | d | 55 | c | 60 | c | 65 | b |

```python run Checking the code questions of mock paper 2
import numpy as np, pandas as pd
from math import log2
from cpa_sql import db
from sklearn.metrics import confusion_matrix
from sklearn.cluster import AgglomerativeClustering
from sklearn.preprocessing import StandardScaler
con = db()
q = lambda s: con.execute(s).fetchall()
print('Q3:', q('SELECT name FROM emp WHERE salary IS NOT NULL ORDER BY salary DESC LIMIT 1 '
        'OFFSET 1'))
print('Q4:', q('SELECT COUNT(*) FROM emp e JOIN emp m ON e.manager_id = m.emp_id'))
print('Q5:', q('SELECT dept_id, COUNT(*) FROM emp WHERE salary >= 90000 GROUP BY dept_id'))
g, order = {1: [2, 3], 2: [4], 3: [4], 4: []}, []
def dfs(n):
    if n in order:
        return
    order.append(n)
    for m in g[n]:
        dfs(m)
dfs(1)
print('Q10:', order)
df = pd.DataFrame({'name': ['A', 'B', 'C'], 'score': [70, 95, 85]})
print('Q13:', df.sort_values('score', ascending=False).iloc[0]['name'])
d = pd.DataFrame({'city': ['X', 'X', 'Y', 'Y'], 'plan': ['p', 'q', 'p', 'p'],
                  'spend': [100, 200, 300, 500]})
print('Q14:', pd.pivot_table(d, values='spend', index='city', columns='plan',
                             aggfunc='mean').loc['Y', 'p'])
s = pd.Series([4, None, 10, 2, None])
print('Q15:', s.fillna(s.median()).tolist())
print('Q19:', confusion_matrix([1, 0, 1, 1, 0, 0], [1, 0, 0, 1, 1, 0]).tolist())
print('Q20:', -sum(c / 8 * log2(c / 8) for c in [4, 4]))
ratios = np.array([0.55, 0.25, 0.12, 0.05, 0.03])
print('Q24:', int(np.argmax(np.cumsum(ratios) >= 0.9)) + 1)
X = [[0], [1], [10], [11], [30]]
print('Q25:', len(set(AgglomerativeClustering(n_clusters=3).fit_predict(X))))
train, test = np.array([[1.0], [2.0], [3.0]]), np.array([[4.0]])
print('Q29:', StandardScaler().fit(train).transform(test).round(3).item())
print('Q30:', np.array([[0.1, 0.7, 0.2], [0.5, 0.3, 0.2]]).argmax(axis=1).tolist())
p = np.array([0.5, 0.3, 0.15, 0.05])
print('Q35:', (p[:2] / p[:2].sum()).round(3).tolist())
results = {'q1': ([3, 8, 1], {1}), 'q2': ([5, 2, 9], {5}), 'q3': ([7, 4, 6], {2})}
rr = [next((1 / (i + 1) for i, x in enumerate(r) if x in rel), 0) for r,
        rel in results.values()]
print('Q39:', round(sum(rr) / len(rr), 3))
docs = np.array([[0.1, 0.9], [0.8, 0.2], [0.7, 0.7]])
qv = np.array([1.0, 0.0])
sims = docs @ qv / (np.linalg.norm(docs, axis=1) * np.linalg.norm(qv))
print('Q40:', np.argsort(-sims)[:2].tolist())
print('Q54:', 300000 / (100 - 40), ' Q63:', (170 - 200) / 200)
```
