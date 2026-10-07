# Chapter 8: Case Studies I: Ranking and Prediction
%Recommendations, search ranking with position bias, fraud detection and delivery ETA

## 8.1 Recommendations: a short-video feed

**Clarify.** 50 million daily users, 10 million videos, feed must load in 200 ms; goal: long-term engagement (daily active users, watch time), not just clicks.

**Metrics.** Business: watch time per user per day, 7-day retention. Online proxies: completion rate, likes, shares, "not interested" rate as a guardrail. Offline: recall@k for candidate generation, NDCG or a weighted log-loss for ranking.

**Architecture: retrieve, then rank.** Scoring 10 million videos per request is impossible within the budget, so the system narrows down in stages, each more expensive per item and applied to fewer items:

| Stage | Items in → out | Model | Budget |
|---|---|---|---|
| Candidate generation | 10 M → ~1 000 | Several sources: two-tower embeddings with approximate nearest-neighbour search, followed creators, trending, fresh uploads | 30 ms |
| Light ranking | 1 000 → 200 | Small model (logistic regression, small MLP) | 15 ms |
| Heavy ranking | 200 → 50 | Large multi-task model predicting watch time, like, share, skip | 50 ms |
| Re-ranking | 50 → 20 | Diversity, freshness, creator caps, policy filters | 10 ms |

The key trade-off is the number of candidates *k*: larger *k* means the good items are more likely to be in the pool (higher recall) but costs more ranking time. The simulation gives every user and video a true preference vector, lets the retrieval stage use noisy learned embeddings, and measures how many of each user's true top-20 videos survive candidate generation.

```python run Recall of the true top 20 against the candidate count
import numpy as np

rng = np.random.default_rng(31)
n_users, n_items, dim = 300, 20_000, 16
U = rng.normal(size=(n_users, dim))
V = rng.normal(size=(n_items, dim))
popularity = rng.zipf(1.6, n_items).astype(float)
true = U @ V.T                                              # true affinity
U_hat = U + rng.normal(scale=0.6, size=U.shape)            # learned (noisy) embeddings
V_hat = V + rng.normal(scale=0.6, size=V.shape)
est = U_hat @ V_hat.T
top20 = np.argsort(-true, axis=1)[:, :20]

def recall(scores, k):
    cand = np.argpartition(-scores, k, axis=1)[:, :k]
    return np.mean([len(set(cand[u]) & set(top20[u])) / 20 for u in range(n_users)])

pop_scores = np.tile(popularity, (n_users, 1))
print('   k   two-tower recall   popularity recall   ranking work (items scored)')
for k in (50, 200, 1000, 3000):
    print(f'{k:5d}        {recall(est, k):5.1%}              {recall(pop_scores, k):5.1%}'
          f'          {k:6,} per request')
```

Popularity alone retrieves almost none of a user's personal favourites; embedding retrieval finds a growing share as *k* rises, with diminishing returns. That curve, together with the ranking stage's cost per item, is how you choose *k* in an interview: pick the knee where extra recall stops paying for the extra ranking latency. In production, several retrieval sources are merged, which raises recall further.

**Training data and loss.** Positive and negative signals from impressions (watched to completion, skipped in under 2 s), weighted by watch time; negatives sampled from impressions, not from random unseen items (which are mostly irrelevant and too easy). Multi-task heads share a backbone; the final score is a weighted combination such as `P(complete) × E[watch time] + w1 P(like) + w2 P(share) − w3 P(not interested)`, with weights tuned by A/B tests.

**Pitfalls to mention.** Feedback loops (the model only learns about what it shows): reserve a few per cent of traffic for exploration. Cold start for new videos: content embeddings from the video, title and audio; a "fresh" retrieval source with boosted exploration. Cold start for new users: onboarding interests, popular-by-region, then fast online updates.

## 8.2 Search ranking and position bias

Logged clicks are biased: users click top results more because they look at them more. A model trained naively on click-through rate learns "whatever was ranked high stays high". Under the **examination hypothesis**, P(click) = P(examined at position) × P(relevant). If the examination probabilities are known (estimated by randomising the order for a small slice of traffic), weighting each click by 1 / P(examined at its position), **inverse propensity weighting**, recovers relevance.

```python run Naive click-through rate versus inverse propensity weighting
import numpy as np

rng = np.random.default_rng(17)
docs = 10
relevance = rng.uniform(0.05, 0.6, docs)                    # true P(click | examined)
examine = 1 / np.arange(1, docs + 1) ** 0.9                 # P(examined | position)
old_rank = np.argsort(relevance + rng.normal(0, 0.25, docs))[::-1]   # an imperfect ranker
clicks_naive, shown, clicks_ipw = np.zeros(docs), np.zeros(docs), np.zeros(docs)
for _ in range(50_000):                        # sessions logged from the old ranker
    order = old_rank.copy()
    if rng.random() < 0.5:                                  # swap neighbours sometimes
        i = rng.integers(0, docs - 1); order[i], order[i + 1] = order[i + 1], order[i]
    for pos, d in enumerate(order):
        shown[d] += 1
        if rng.random() < examine[pos] and rng.random() < relevance[d]:
            clicks_naive[d] += 1
            clicks_ipw[d] += 1 / examine[pos]
true_order = np.argsort(-relevance)
naive_order = np.argsort(-(clicks_naive / shown))
ipw_order = np.argsort(-(clicks_ipw / shown))
def rank_corr(a):                                           # Spearman with the true order
    ra, rt = np.empty(docs), np.empty(docs)
    ra[a], rt[true_order] = np.arange(docs), np.arange(docs)
    return 1 - 6 * np.sum((ra - rt) ** 2) / (docs * (docs ** 2 - 1))
for name, order in (('true order', true_order), ('old ranker', old_rank),
                    ('naive CTR', naive_order), ('IPW', ipw_order)):
    print(f'{name:11s} {[int(d) for d in order]}  rank correlation {rank_corr(order):.2f}')
```

Naive click-through rate improves on the old ranker but keeps its biggest mistake: document 7, which the old ranker always showed first, still comes out on top because it collected by far the most examinations. The propensity-weighted estimate recovers the true relevance order exactly in this simulation. In practice, propensities are estimated from small randomised experiments or from the same document appearing at different positions, and position is also fed to the model during training and fixed to a constant at serving time.

## 8.3 Fraud detection at checkout

**Clarify.** 2 000 transactions per second at peak, decision within 100 ms, 0.1–0.5% fraud, chargeback labels after up to 90 days.

| Component | Design |
|---|---|
| Decision | Approve, challenge (OTP / 3-D Secure), decline; amount-dependent thresholds (Chapter 1.3) |
| Rules first | Hard rules for known patterns and regulatory blocks; the model handles the grey zone |
| Features | Request (amount, merchant, device, IP), profile (account age, usual merchants, home location), **velocity** in sliding windows (transactions per card in 10 min, distinct cards per device in 1 h), graph features (shared devices, cards and addresses between accounts) |
| Model | Gradient-boosted trees (strong on tabular data, fast, explainable with SHAP); later a sequence model of recent transactions |
| Labels | Chargebacks (delayed) + manual review outcomes (fast but biased to what was reviewed); train only on windows whose labels have matured |
| Evaluation | PR-AUC, recall at a fixed challenge rate, money saved (Chapter 4.3); time-based splits |
| Serving | Online, with a feature store holding streaming aggregates; strict timeout with a rule-based fallback |
| Monitoring | Score distribution, challenge rate by segment, fraud rate of approved transactions as labels arrive; adversarial drift is expected |

> TIP: Mention that fraud is **adversarial**: fraudsters probe the system and adapt, so concept drift (Chapter 7.3) is the normal case, label-based monitoring is essential, and the model needs frequent retraining. Keep some randomly sampled approved transactions for review to estimate fraud you did not catch.

## 8.4 Delivery ETA

An ETA is a promise. If the model predicts the **mean** delivery time, roughly half of the orders arrive late, which hurts trust more than a slightly longer promise. **Quantile regression** predicts a chosen percentile instead: promise the 80th percentile and about 80% of orders arrive on time.

```python run Mean regression versus a quantile model for promises
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor

rng = np.random.default_rng(23)
def orders(n):
    dist_km = rng.uniform(1, 12, n)
    rush = rng.random(n) < 0.3
    prep = rng.gamma(4, 3, n)                                      # restaurant prep, minutes
    travel = dist_km * (3.0 + 1.5 * rush) * rng.lognormal(0, 0.25, n)
    return np.column_stack([dist_km, rush]), prep + travel
X, y = orders(20_000)
Xt, yt = orders(20_000)
mean_model = GradientBoostingRegressor(random_state=0).fit(X, y)
q80_model = GradientBoostingRegressor(loss='quantile', alpha=0.8, random_state=0).fit(X, y)
for name, m in (('mean model', mean_model), ('80th-percentile model', q80_model)):
    pred = m.predict(Xt)
    late = yt > pred
    on_time = 1 - late.mean()
    print(f'{name:22s} average promise {pred.mean():5.1f} min  on time {on_time:5.1%}  '
          f'average lateness when late {(yt - pred)[late].mean():4.1f} min')
```

The mean model's promises are kept only a little over half the time. The quantile model promises about 7 minutes more on average and keeps the on-time rate at the 80% it was trained for. The percentile is a product decision (what the business values more: short promises or reliable ones), and the model makes it explicit. ETA systems also update the prediction during the order as new information arrives (food ready, rider picked up).

## 8.5 Practical lessons

- Large catalogues: retrieve with cheap models and high recall, then rank with expensive models; choose *k* from the recall curve and the latency budget.
- Clicks are biased by position; correct with randomisation and propensity weighting.
- Fraud: rules plus a calibrated model, velocity features, delayed labels, adversarial drift.
- When a prediction is a promise, predict a quantile, not the mean.

# Chapter 9: Case Studies II: LLM Applications
%A retrieval-augmented support chatbot and a platform that routes requests between models and tools

## 9.1 A RAG support chatbot

**Clarify.** Answer customer questions about electricity tariffs, billing and meter installation from about 2 000 policy documents that change monthly; answers must cite sources; escalate to a human when unsure.

```text
question -> query rewrite -> retrieve top-k chunks (hybrid: BM25 + embeddings)
         -> rerank (cross-encoder) -> prompt with chunks + instructions -> LLM answer
         -> citation check / guardrails -> answer with sources, or hand over to a human
offline:  documents -> clean -> split into chunks -> embed -> vector index (+ keyword index)
```

**Retrieval quality is measured separately from generation.** If the right passage is not retrieved, no LLM can answer correctly. Build a test set of questions with the passage that answers each one, and measure recall@k and MRR of the retriever. **Chunking** matters: a long document mixes many topics, so its vector is a blurred average; smaller chunks match specific questions better, until they become too small to contain the answer. The simulation indexes a small tariff handbook two ways, whole sections versus short paragraph chunks, and measures retrieval with TF-IDF on the same eight questions.

```python run Whole sections versus paragraph chunks
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

handbook = {
 'Tariffs': [
  'Domestic tariff: the first 100 units cost Rs 5 per unit and the next 200 units Rs 7.',
  'Units above 300 in a month are charged at Rs 9 per unit for domestic consumers.',
  'Commercial consumers pay a flat Rs 10 per unit plus a fixed demand charge.'],
 'Billing': [
  'Bills are generated on the first working day of each month for the previous month.',
  'A late payment surcharge of 2 percent applies if the bill is unpaid after 15 days.',
  'Consumers can pay online, by UPI, or at any customer care centre counter.'],
 'Meters': [
  'A new smart meter is installed within 7 days of a complete application.',
  'If a meter shows no reading for 6 hours, a technician visit is scheduled automatically.',
  'Meter testing on request costs Rs 200, refunded if the meter is found faulty.'],
 'Solar': [
  'Rooftop solar owners receive net metering credit for exported units.',
  'Export credit is valued at Rs 3 per unit and adjusted against the next bill.',
  'Solar applications require a structural safety certificate for the roof.']}
questions = [
 ('how much do units above 300 cost', 'Tariffs', 1),
 ('what is the late payment surcharge', 'Billing', 1),
 ('when will my new smart meter be installed', 'Meters', 0),
 ('price of meter testing on request', 'Meters', 2),
 ('how is exported solar energy credited', 'Solar', 1),
 ('can I pay my bill by UPI', 'Billing', 2),
 ('what happens if my meter shows no reading', 'Meters', 1),
 ('charge per unit for commercial consumers', 'Tariffs', 2)]

def evaluate(chunks, label_of):
    vec = TfidfVectorizer(stop_words='english').fit(chunks)
    M = vec.transform(chunks)
    hits1 = hits3 = rr = 0
    for q, sec, para in questions:
        ranked = cosine_similarity(vec.transform([q]), M)[0].argsort()[::-1]
        ranks = [i for i, c in enumerate(ranked) if label_of[c] == (sec, para)
                 or label_of[c] == (sec, None)]
        r = ranks[0] + 1
        hits1 += r == 1; hits3 += r <= 3; rr += 1 / r
    n = len(questions)
    return hits1 / n, hits3 / n, rr / n

sections = [' '.join(p) for p in handbook.values()]
sec_labels = [(s, None) for s in handbook]
paras, para_labels = [], []
for s, ps in handbook.items():
    for i, p in enumerate(ps):
        paras.append(p); para_labels.append((s, i))
for name, chunks, labels in (('whole sections', sections, sec_labels),
                             ('paragraph chunks', paras, para_labels)):
    r1, r3, mrr = evaluate(chunks, labels)
    print(f'{name:17s} recall@1 {r1:.2f}  recall@3 {r3:.2f}  MRR {mrr:.2f}  '
          f'text sent to the LLM per hit: ~{sum(map(len, chunks)) // len(chunks)} chars')
```

The honest result is that whole sections score **higher** here: every question finds its section first, while paragraph chunks put the right paragraph first only 6 times out of 8 (all are within the top 3). Each section has just three short sentences, so the extra words help TF-IDF without blurring the topic. But the two numbers measure different things: a section "hit" only means the answer is somewhere in three times as much text, all of which is sent to the LLM (more cost, more room to quote the wrong sentence), while a chunk hit means the exact passage was found. Real sections run to pages and mix dozens of topics, which blurs their vectors. Do not trust either default: build a labelled question set like this one from real user questions, and measure recall@k and the context size for several chunk sizes (a few hundred tokens with some overlap and the section title prepended is a common starting point).

| Concern | Design |
|---|---|
| Retrieval | Hybrid keyword + vector search (keywords catch exact terms such as tariff codes); a cross-encoder reranker on the top 50 |
| Prompt | Instructions to answer only from the provided passages and cite them; refuse when the passages do not contain the answer |
| Evaluation | Retrieval: recall@k, MRR on a labelled set. Answers: faithfulness to sources, correctness, citation accuracy, judged by humans on a sample and by an LLM judge calibrated against them |
| Freshness | Re-index changed documents nightly; store the version and date with every chunk |
| Cost and latency | Cache answers to frequent questions; a small model for query rewriting; stream tokens to the user |
| Safety | Do not reveal personal data across accounts; filter retrieved chunks by the user's permissions **before** the LLM sees them |
| Hand-over | Low retrieval scores or low answer confidence → human agent with the context attached |

## 9.2 An LLM-agent platform with model routing

**Clarify.** A platform serves many internal assistants (coding help, document Q&A, data analysis). Requests vary from trivial ("format this date") to hard (multi-step analysis with tools). Large models answer hard requests better but cost far more and respond more slowly.

**Routing.** A **cascade** sends every request to a small, fast model first and escalates to a large model (or to a slower reasoning mode) only when needed, judged by a confidence signal: the small model's self-reported confidence, a verifier, a classifier on the request, or agreement between samples. Escalation is not free: every escalated request has already paid for the small model's attempt and waited for it. That overhead (the **escalation tax**, a theme of the learner's own research on model and reasoning-mode selection) decides whether a cascade beats simply calling the large model.

The simulation draws requests of varying difficulty; each model's success probability falls with difficulty, the large model's more slowly. The small model reports a noisy confidence. Routing policies are compared on accuracy, cost per 1 000 requests, mean latency and how much of the cost is escalation tax.

```python run Cascades: accuracy, cost, latency and the escalation tax
import numpy as np

rng = np.random.default_rng(41)
n = 100_000
difficulty = rng.beta(2, 3, n)                                   # mostly easy requests
p_small = np.clip(0.97 - 0.95 * difficulty, 0.02, 1)
p_large = np.clip(0.99 - 0.45 * difficulty, 0.02, 1)
small_ok = rng.random(n) < p_small
large_ok = rng.random(n) < p_large
confidence = np.clip(p_small + rng.normal(0, 0.12, n), 0, 1)     # noisy self-estimate
cost_s, cost_l = 1.0, 15.0                                       # relative cost per call
lat_s, lat_l = 0.6, 4.0                                          # seconds

def report(name, escalate):
    acc = np.where(escalate, large_ok, small_ok).mean()
    cost = np.where(escalate, cost_s + cost_l, cost_s).sum()
    tax = escalate.sum() * cost_s
    latency = np.where(escalate, lat_s + lat_l, lat_s).mean()
    print(f'{name:22s} accuracy {acc:5.1%}  cost/1k {cost / n * 1000:7.0f}  '
          f'latency {latency:4.2f} s  escalated {escalate.mean():5.1%}  '
          f'tax {tax / cost:5.1%} of cost')

acc_l = large_ok.mean()
print(f'{"always large":22s} accuracy {acc_l:5.1%}  cost/1k {cost_l * 1000:7.0f}  '
      f'latency {lat_l:4.2f} s')
report('always small', np.zeros(n, bool))
for tau in (0.5, 0.7, 0.8, 0.9):
    report(f'cascade, escalate <{tau}', confidence < tau)
oracle = ~small_ok
report('oracle router', oracle)
```

Read the table as an interviewer would. The small model alone is cheap and fast but loses accuracy on the hard tail. Calling the large model for everything is the most accurate realistic policy here, at fifteen times the cost. Cascades are a dial: a threshold of 0.5 keeps 86% of the large model's accuracy at about 40% of its cost and half its latency. Raising the threshold escalates more and recovers accuracy, but every escalated request has paid for both calls and waited for both: at 0.9 the cascade costs about as much as always-large, is slightly **less** accurate, and is **slower** (4.29 s against 4.00 s). That is the escalation tax deciding the outcome.

The **oracle** row (escalate exactly the requests the small model gets wrong) holds a surprise: a perfect router beats always-large by a wide margin (90% against 81%) at half its cost, because in this simulation the two models fail independently, so the small model gets right many requests that the large model gets wrong. The gap between the oracle and the realistic cascades is the value of a better confidence signal, which is where routing research focuses. Measure all of this on your own traffic: when the confidence signal is poor or most requests are hard, a cascade can lose to calling the large model directly.

| Platform concern | Design |
|---|---|
| Routing | Cascade with a calibrated confidence signal, or a learned router that predicts difficulty from the request alone (no tax, but less information) |
| Tools | Function calling with typed schemas; tools run in a sandbox with timeouts and least privilege |
| Guardrails | Input filters (prompt injection, personal data), output filters, tool allow-lists per assistant, human approval for irreversible actions |
| Evaluation | Golden task sets per assistant, regression tests on every prompt or model change, LLM-as-judge calibrated on human labels, online thumbs-up rate |
| Cost control | Per-team budgets, prompt caching, response caching, shorter contexts, smaller models where the router allows |
| Observability | Trace every step (prompt, retrieved context, tool calls, tokens, latency, cost) with a request id |

## 9.3 Practical lessons

- RAG: evaluate retrieval on its own (recall@k, MRR); chunk to the size of an answer; filter by permissions before generation; cite sources.
- Cascades trade cost for accuracy with a threshold; count the escalation tax and compare with an oracle router.
- LLM platforms need the same discipline as any ML system: golden sets, regression tests, monitoring, budgets.
