# Chapter 3: Knowledge-Based AI and NLP Basics
%Logic and knowledge representation, expert systems with forward and backward chaining, fuzzy logic, and the classical NLP pipeline

## 3.1 Knowledge representation

| Method | Idea | Example |
|---|---|---|
| Propositional logic | True/false statements joined by AND, OR, NOT, IMPLIES | `Raining → WetRoad` |
| First-order (predicate) logic | Objects, predicates and quantifiers ∀ (for all), ∃ (there exists) | `∀x Employee(x) → HasID(x)` |
| Semantic network | Graph of concepts linked by relations ("is-a", "has-a") | Sparrow –is-a→ Bird –can→ Fly |
| Frames | Objects with slots and default values (an early form of classes) | Room: walls = 4, has door |
| Rules (production systems) | IF conditions THEN conclusion | IF fever AND rash THEN measles-check |
| Ontologies and knowledge graphs | Formal vocabularies of entities and relations | Google Knowledge Graph, Wikidata |

**Inference rules:** modus ponens (from P and P → Q, conclude Q); modus tollens (from ¬Q and P → Q, conclude ¬P). Logic is **sound** if it derives only true conclusions and **complete** if it can derive every true conclusion.

## 3.2 Expert systems

An **expert system** captures a specialist's knowledge as rules. Components: a **knowledge base** (facts and rules), an **inference engine**, a working memory, an explanation facility and a user interface. **Forward chaining** starts from known facts and fires rules until no new facts appear (data-driven); **backward chaining** starts from a goal and works back to find supporting facts (goal-driven, as in diagnosis).

```python run Forward chaining to a fixed point, and backward chaining for one goal
rules = [({'fever', 'cough'}, 'flu_suspected'),
         ({'flu_suspected', 'high_risk'}, 'see_doctor'),
         ({'age_over_60'}, 'high_risk'),
         ({'rash'}, 'allergy_suspected')]
facts = {'fever', 'cough', 'age_over_60'}

def forward(facts):
    facts, fired = set(facts), []
    changed = True
    while changed:
        changed = False
        for conditions, conclusion in rules:
            if conditions <= facts and conclusion not in facts:
                facts.add(conclusion); fired.append(conclusion); changed = True
    return facts, fired

def backward(goal, facts, depth=0):
    if goal in facts:
        print('  ' * depth + f'{goal}: known fact'); return True
    for conditions, conclusion in rules:
        if conclusion == goal:
            print('  ' * depth + f'{goal}: needs {sorted(conditions)}')
            if all(backward(c, facts, depth + 1) for c in sorted(conditions)):
                return True
    print('  ' * depth + f'{goal}: cannot be proved'); return False

derived, fired = forward(facts)
print('forward chaining fired, in order:', fired)
print('backward chaining for see_doctor:')
print('proved:', backward('see_doctor', facts))
```

Classic expert systems include MYCIN (infection diagnosis, backward chaining) and XCON (computer configuration). Their weaknesses: knowledge acquisition is slow, rules are brittle outside their domain, and they do not learn; machine learning replaced many of them, though rule engines remain common in business logic and compliance.

## 3.3 Fuzzy logic

Classical logic says a statement is true or false; **fuzzy logic** allows degrees of truth between 0 and 1, described by **membership functions**. A fuzzy system **fuzzifies** inputs, applies rules (AND = min, OR = max), and **defuzzifies** the result (for example by the centroid).

```python run Membership in "warm" and "hot", and a fuzzy rule for fan speed
def triangle(x, a, b, c):
    if x <= a or x >= c:
        return 0.0
    return (x - a) / (b - a) if x <= b else (c - x) / (c - b)

for t in (22, 27, 31, 36):
    warm, hot = triangle(t, 18, 25, 32), triangle(t, 28, 38, 48)
    speed = (warm * 40 + hot * 90) / (warm + hot) if warm + hot else 0   # weighted average
    print(f'{t} °C: warm {warm:.2f}, hot {hot:.2f} -> fan speed {speed:.0f}%')
```

At 31 °C the temperature is partly warm and partly hot, so the fan runs at an intermediate speed instead of switching abruptly. Fuzzy logic is used in washing machines, air conditioners, camera autofocus and control systems.

## 3.4 NLP basics

The classical NLP pipeline turns text into features a model can use:

| Step | What it does | Example |
|---|---|---|
| Tokenisation | Split text into words or sub-words | "Don't stop" → ["do", "n't", "stop"] |
| Lower-casing, cleaning | Normalise case, remove punctuation and URLs | |
| Stop-word removal | Drop very common words | the, is, a |
| Stemming | Chop suffixes by rules (fast, may produce non-words) | "studies" → "studi" |
| Lemmatisation | Reduce to the dictionary form using vocabulary and grammar | "studies" → "study", "better" → "good" |
| Bag of words | Count of each word; order ignored | |
| n-grams | Sequences of n words, capturing some order | "not good" as a bigram |
| TF-IDF | Term frequency × inverse document frequency: down-weights words common to all documents | |
| Word embeddings | Dense vectors where similar words are close (Word2Vec, GloVe; contextual: BERT) | king − man + woman ≈ queen |

```python run Bag of words, bigrams and TF-IDF with scikit-learn; a crude suffix stemmer
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
docs = ['the service was not good', 'good food and good service', 'the food was cold']
bow = CountVectorizer()
X = bow.fit_transform(docs)
print('vocabulary:', bow.get_feature_names_out().tolist())
print('bag of words:', X.toarray().tolist())
bigrams = CountVectorizer(ngram_range=(2, 2)).fit(docs)
print('bigrams in doc 1:', [g for g in bigrams.get_feature_names_out() if g in docs[0]])
tfidf = TfidfVectorizer(stop_words='english').fit(docs)
weights = {w: round(float(v), 2) for w, v in zip(tfidf.get_feature_names_out(), tfidf.idf_)}
print('idf (rarer words weigh more):', weights)
stem = lambda w: next((w[:-len(s)] for s in ('ing', 'ies', 'ed', 's') if w.endswith(s)), w)
print([stem(w) for w in ['studies', 'playing', 'cats', 'played', 'good']])
```

The crude stemmer turned "studies" into "stud", a non-word, which is exactly the weakness of rule-based stemming that lemmatisation avoids. Note how bag of words loses meaning that order carries: "not good" and "good" share the word *good*; bigrams keep "not good" as a unit. Stop-word lists can also remove "not", which flips sentiment, so they must be used with care. Classical NLP tasks include sentiment analysis, named-entity recognition (people, places, organisations), part-of-speech tagging, text classification, machine translation and summarisation; transformers now handle most of them (guide, Chapter 8).

| Computer vision task | Output |
|---|---|
| Image classification | One label per image |
| Object detection | Boxes and labels (YOLO, Faster R-CNN) |
| Semantic / instance segmentation | A label per pixel / per object instance |
| OCR | Text in images |
| Face recognition | Identity from facial features |

## 3.5 Practical lessons

- Knowledge can be represented as logic, rules, semantic networks, frames or knowledge graphs.
- Forward chaining is data-driven; backward chaining is goal-driven (diagnosis).
- Fuzzy logic uses degrees of membership; AND = min, OR = max; defuzzify to act.
- NLP: tokenise, normalise, stem or lemmatise, vectorise (BoW, n-grams, TF-IDF, embeddings).

# Chapter 4: More Unsupervised Learning
%Gaussian mixture models as soft clustering, and reading a dendrogram

## 4.1 Gaussian mixture models

A **Gaussian mixture model** (GMM) assumes the data comes from k Gaussian distributions with their own means and covariances, and fits them with the **expectation–maximisation (EM)** algorithm: the E-step computes each point's probability of belonging to each component; the M-step re-estimates the components from those probabilities. Unlike k-means, a GMM gives **soft** assignments and handles elliptical clusters of different sizes; **BIC** or **AIC** help choose k.

```python run GMM versus k-means on stretched clusters, soft probabilities and BIC
import numpy as np
from sklearn.mixture import GaussianMixture
from sklearn.cluster import KMeans
from sklearn.metrics import adjusted_rand_score

rng = np.random.default_rng(3)
a = rng.multivariate_normal([0, 0], [[6, 5.5], [5.5, 6]], 300)   # long diagonal cluster
b = rng.multivariate_normal([4, -3], [[0.5, 0], [0, 0.5]], 150)       # small round cluster
X, y = np.vstack([a, b]), np.array([0] * 300 + [1] * 150)
gmm = GaussianMixture(n_components=2, covariance_type='full', random_state=0).fit(X)
km = KMeans(n_clusters=2, n_init=10, random_state=0).fit(X)
print('ARI  k-means:', round(adjusted_rand_score(y, km.labels_), 2),
      '  GMM:', round(adjusted_rand_score(y, gmm.predict(X)), 2))
print('soft membership of point (2, -1):', gmm.predict_proba([[2, -1]]).round(3))
for k in (1, 2, 3, 4):
    print(f'k={k}: BIC {GaussianMixture(k, random_state=0).fit(X).bic(X):.0f}')
```

The GMM recovers the elongated and the small cluster far better than k-means, which splits the data with a straight boundary into similar-sized groups; the lowest BIC is at k = 2, the true number of components.

## 4.2 Reading a dendrogram

```python run Linkage merge heights and cutting the tree into clusters with SciPy
import numpy as np
from scipy.cluster.hierarchy import linkage, fcluster
points = np.array([[1, 1], [1.5, 1], [5, 5], [5, 5.6], [9, 1], [9.4, 1.3]])
Z = linkage(points, method='ward')
for i, (a, b, height, size) in enumerate(Z):
    print(f'merge {i + 1}: clusters {int(a)} and {int(b)} at height {height:.2f} (size '
            f'{int(size)})')
print('cut into 3 clusters:', fcluster(Z, t=3, criterion='maxclust').tolist())
print('cut at height 2.0:  ', fcluster(Z, t=2.0, criterion='distance').tolist())
```

Indices 0–5 are the original points; an index of 6 or more is the cluster formed by an earlier merge (6 is merge 1, 7 is merge 2, and so on). Each merge joins the two closest clusters; the merge height is the distance at which they join. Cutting the dendrogram horizontally where the vertical gap between merges is largest gives a natural number of clusters: here the three tight pairs merge at small heights and the last merges happen much higher.

## 4.3 Practical lessons

- GMM = soft, probabilistic clustering fitted by EM; handles elliptical clusters; choose k with BIC/AIC.
- k-means is a special case of a GMM with equal spherical covariances and hard assignments.
- A dendrogram shows merges by height; cut where the gap is largest.
