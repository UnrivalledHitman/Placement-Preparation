# How to run this workshop
%A two-day, hands-on course for engineering teams: what it covers, who it suits, how to prepare, and how the labs work

This is a trainer's guide for a two-day corporate workshop, **Building Reliable RAG and Agentic AI Systems**. It is written so that you can deliver it as it stands, adapt it to a client, and sell it. Every module gives the timing, the outcome, what to say, a live demo, a lab with code that has been run, the output participants should see, and the questions people usually ask.

## Who it is for

| Item | Detail |
|---|---|
| Audience | Software engineers, data engineers and data scientists who will build LLM features at work |
| Group size | 8–20 participants; above 20, add a second facilitator for the labs |
| Prerequisites | Comfortable Python (functions, dicts, list comprehensions); no machine learning background needed |
| Format | In person or live online; about 60% hands-on |
| Length | Two days, 9:30 to 17:00, with an hour for lunch and two 15-minute breaks |

## What participants can do by the end

1. Explain tokens, embeddings and context windows well enough to make design decisions.
2. Build a retrieval pipeline: chunk documents, embed them, search with vectors, keywords and both combined.
3. Measure retrieval quality with recall@k on a labelled question set, and use it to choose settings.
4. Assemble a grounded answer with citations, and detect answers that are not supported by the retrieved text.
5. Build a tool-using agent loop with schema validation, step limits and error handling.
6. Attack and defend a RAG system against prompt injection.
7. Turn the checks into an automated evaluation that can run in CI.

## The two days

| Time | Day 1: retrieval and RAG | Day 2: agents and production |
|---|---|---|
| 9:30–10:45 | Module 1: LLMs for engineers (tokens, embeddings, context) + Lab 1 | Module 4: tools and the agent loop + Lab 4 |
| 10:45–11:00 | Break | Break |
| 11:00–12:45 | Module 2: chunking and retrieval + Lab 2 | Module 5: security and prompt injection + Lab 5 |
| 12:45–13:45 | Lunch | Lunch |
| 13:45–15:30 | Module 3: grounded answers and retrieval evaluation + Lab 3 | Module 6: evaluation in CI and running in production + Lab 6 |
| 15:30–15:45 | Break | Break |
| 15:45–17:00 | Clinic: participants run the pipeline on their own documents | Capstone in teams, presentations, wrap-up |

## Preparing the room and the machines

The labs run on a laptop with no internet access and no paid API key. They use a small open embedding model (all-MiniLM-L6-v2, 384 dimensions, about 90 MB), FAISS for vector search, rank-bm25 for keyword search, and a scripted stand-in for the language model so that every participant gets the same, repeatable output. Module 3 shows where a real model plugs in.

| Before the day | Detail |
|---|---|
| Two weeks ahead | Send the setup script; ask for one sample document set from the client (policies, runbooks or FAQs) for the Day 1 clinic |
| One week ahead | Run the setup check with each participant; collect the pre-workshop quiz (Chapter 4) |
| The day before | Pre-download the embedding model on every machine; print the lab sheets; test the projector and a spare laptop |

```bash
python -m venv rag-workshop
source rag-workshop/bin/activate      # Windows: rag-workshop\Scripts\activate
pip install sentence-transformers faiss-cpu rank-bm25 numpy
python -c "from sentence_transformers import SentenceTransformer as S; \
S('sentence-transformers/all-MiniLM-L6-v2')"
```

The last line downloads the model once; after that, set `HF_HUB_OFFLINE=1` and the labs run offline.

## The lab data

Every lab uses the same fictional company, **Kestrel Freight**, a mid-sized logistics firm, and eight short internal policy documents. Using one corpus all day lets each lab build on the last. The first program below writes the corpus and the shared helper functions into `kestrel.py`, which every later lab imports.

```python run Lab set-up: the Kestrel Freight corpus and shared helpers (writes kestrel.py)
src = '''
import os, re
os.environ["HF_HUB_OFFLINE"] = "1"

DOCS = {
 "leave": "Annual leave: full-time staff receive 24 days of paid annual leave per "
          "calendar year. Unused leave of up to 5 days may be carried into the next "
          "year and must be used by 31 March. Sick leave: staff may take up to 10 paid "
          "sick days per year; absences longer than 3 days need a doctor's note.",
 "expenses": "Expenses must be submitted within 30 days of purchase with an itemised "
             "receipt. Meals while travelling are reimbursed up to 1,500 rupees per day. "
             "Expenses above 25,000 rupees need written approval from a department head "
             "before purchase.",
 "laptops": "Company laptops must use full-disk encryption and lock after 5 minutes of "
            "inactivity. Report a lost or stolen laptop to the IT service desk within 2 "
            "hours. Personal software may not be installed without IT approval.",
 "shipping": "Standard domestic shipments are delivered within 3 to 5 working days. "
             "Express shipments are delivered the next working day if booked before 2 pm. "
             "Shipments above 30 kg are charged at the heavy-goods rate.",
 "returns": "Customers may return undamaged goods within 14 days of delivery for a full "
            "refund. Damaged goods must be reported within 48 hours with photographs. "
            "Refunds are issued to the original payment method within 7 working days.",
 "remote": "Staff may work remotely up to 2 days per week with their manager's "
           "agreement. Remote work from outside India needs approval from HR at least 30"
           " days in advance.",
 "security": "Passwords must be at least 14 characters and are never shared, including "
             "with IT staff. Phishing emails should be reported with the Report button, "
             "not forwarded. Visitors must be escorted in all warehouse areas.",
 "training": "Each employee has a learning budget of 40,000 rupees per year for courses "
             "and certifications. Requests above 15,000 rupees need manager approval. "
             "Unused learning budget does not carry over to the next year.",
}

def sentences(text):
    return [s.strip() for s in re.split(r"(?<=[.!?])\\s+", text) if s.strip()]

def chunks(max_sentences=1):
    """Split each document into chunks of up to max_sentences sentences."""
    out = []
    for doc, text in DOCS.items():
        ss = sentences(text)
        for i in range(0, len(ss), max_sentences):
            out.append((f"{doc}#{i // max_sentences + 1}", " ".join(ss[i:i + max_sentences])))
    return out

_model = None
def embed(texts):
    global _model
    import torch
    from sentence_transformers import SentenceTransformer
    torch.set_num_threads(1)
    if _model is None:
        _model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2", device="cpu")
    return _model.encode(list(texts), normalize_embeddings=True)

# Labelled questions: the chunk (at one sentence per chunk) that answers each.
QUESTIONS = [
 ("How many days of holiday do I get each year?", "leave#1"),
 ("Can I carry over unused holiday?", "leave#2"),
 ("When do I need a medical certificate for being ill?", "leave#3"),
 ("What is the daily food allowance on business trips?", "expenses#2"),
 ("Who must approve a very large purchase?", "expenses#3"),
 ("What should I do if my laptop is stolen?", "laptops#2"),
 ("How fast is next-day delivery and what is the cut-off?", "shipping#2"),
 ("Is there an extra charge for heavy parcels?", "shipping#3"),
 ("How long do customers have to send goods back?", "returns#1"),
 ("A parcel arrived broken. What must the customer do?", "returns#2"),
 ("Can I work from abroad?", "remote#2"),
 ("How long must my password be?", "security#1"),
 ("What do I do with a suspicious email?", "security#2"),
 ("How much can I spend on courses each year?", "training#1"),
 ("Does unspent training money roll over?", "training#3"),
]
'''
open('kestrel.py', 'w').write(src)
import kestrel
print(len(kestrel.DOCS), 'documents,', len(kestrel.chunks()), 'one-sentence chunks,',
      len(kestrel.QUESTIONS), 'labelled questions')
```

The questions are deliberately phrased in words the policies do not use ("holiday" for "annual leave", "medical certificate" for "doctor's note"). That is how real users ask, and it is what separates keyword search from semantic search in Lab 2.

# Day 1, Module 1: LLMs for Engineers
%9:30–10:45 · Tokens, embeddings and context windows, with just enough theory to make design decisions

**Outcome.** Participants can explain why an LLM needs retrieval, what an embedding is, and how context limits shape a design.

## What to say (30 minutes)

| Point | The message |
|---|---|
| A language model predicts the next token | It knows what was in its training data, frozen at a date; it knows nothing about this company's policies |
| Tokens, not words | Models read sub-word tokens; cost and limits are in tokens. A rough guide for English is about 4 characters per token |
| The context window is a budget | Everything the model sees (instructions, retrieved text, chat history, the answer) must fit; more context costs more and can bury the relevant part |
| Embeddings map meaning to vectors | Texts with similar meaning land close together, measured by cosine similarity, even when they share no words |
| RAG in one sentence | Retrieve the few passages that answer the question and put them in the prompt, so the model answers from your documents and can cite them |
| When not to use RAG | When the answer needs the whole corpus at once (summarise everything), exact computation, or live data that a tool or database query gives directly |

**Ask the room:** "Where would a model that confidently invents a policy cause harm here?" Write the answers on the board; return to them in Module 5.

## Lab 1: embeddings capture meaning (25 minutes)

Participants embed three questions and three policy sentences and compare cosine similarity with simple word overlap.

```python run Lab 1: semantic similarity versus shared words
import numpy as np
import kestrel

queries = ['How many days of holiday do I get each year?',
        'My laptop was nicked on the train',
           'What is the daily food allowance on business trips?']
passages = [kestrel.sentences(kestrel.DOCS['leave'])[0],
        kestrel.sentences(kestrel.DOCS['laptops'])[1],
            kestrel.sentences(kestrel.DOCS['expenses'])[1]]
q, p = kestrel.embed(queries), kestrel.embed(passages)
sim = q @ p.T
words = lambda t: set(w.strip('.,?').lower() for w in t.split())
print('cosine similarity (rows: queries, columns: passages)')
print(np.round(sim, 2))
print('shared words with the matching passage:', [len(words(a) & words(b) - {'the', 'a',
        'of', 'per', 'my', 'do', 'i'})
                                                 for a, b in zip(queries, passages)])
print('each query is closest to its own passage:',
        bool((sim.argmax(axis=1) == np.arange(3)).all()))
```

**What to point out.** Each query scores highest against its own passage on the diagonal, although "nicked" and "stolen" are different words, "holiday" never appears in the leave policy, and the food-allowance query shares no content word with the meals policy. Ask participants to write one query that fools the model; usually it takes negation ("I do *not* want to take leave") or a number, which embeddings handle poorly. Both points come back when we evaluate retrieval.

## Common questions

| Question | Answer |
|---|---|
| Why not fine-tune the model on our documents instead? | Fine-tuning teaches style and format well but is a poor way to store facts that change; retrieval updates the moment a document changes and can cite its source |
| Which embedding model should we use? | Start small (like this one) to build the pipeline, then compare two or three models on your own labelled questions; Lab 2 shows how |
| Do bigger context windows make RAG unnecessary? | They reduce the pressure but not the need: long prompts cost more, run slower and still bury details. Retrieval chooses what the model reads |

# Day 1, Module 2: Chunking and Retrieval
%11:00–12:45 · Splitting documents, vector search with FAISS, keyword search with BM25, and combining both

**Outcome.** Participants build three retrievers and compare them on the labelled questions.

## What to say (30 minutes)

| Point | The message |
|---|---|
| Chunking decides what can be found | A chunk is the unit you retrieve and paste; too large and it dilutes the embedding and wastes context, too small and it loses the surrounding facts |
| Vector search | Embed every chunk once, store the vectors in an index (FAISS here; a vector database in production), embed the question and take the nearest k |
| Keyword search still matters | BM25 ranks by rare shared words: unbeatable for codes, names and exact phrases ("SKU-4471", "Form 16") |
| Hybrid retrieval | Run both and merge the rankings with reciprocal rank fusion: score = Σ 1/(60 + rank). No score calibration needed |
| Measure, don't guess | recall@k = the share of questions whose answering chunk appears in the top k. It is the number every later choice is judged by |

## Lab 2: three retrievers, one scoreboard (60 minutes)

```python run Lab 2: dense, BM25 and hybrid retrieval scored by recall@k
import numpy as np, faiss
from rank_bm25 import BM25Okapi
import kestrel

chunks = kestrel.chunks(max_sentences=1)
ids = [c[0] for c in chunks]
vecs = kestrel.embed([c[1] for c in chunks]).astype('float32')
index = faiss.IndexFlatIP(vecs.shape[1])   # inner product = cosine on normalised vectors
index.add(vecs)
tok = lambda t: [w.strip('.,?\'"').lower() for w in t.split()]
bm25 = BM25Okapi([tok(c[1]) for c in chunks])

def dense(q, k):
    _, idx = index.search(kestrel.embed([q]).astype('float32'), k)
    return [ids[i] for i in idx[0]]

def keyword(q, k):
    scores = bm25.get_scores(tok(q))
    return [ids[i] for i in np.argsort(-scores)[:k]]

def hybrid(q, k, depth=10):
    fused = {}
    for ranking in (dense(q, depth), keyword(q, depth)):
        for r, cid in enumerate(ranking):
            fused[cid] = fused.get(cid, 0) + 1 / (60 + r + 1)
    return sorted(fused, key=fused.get, reverse=True)[:k]

def recall(fn, k):
    return np.mean([gold in fn(q, k) for q, gold in kestrel.QUESTIONS])

print(f'{len(chunks)} chunks indexed, {vecs.shape[1]}-dimensional vectors')
print('           recall@1  recall@3')
for name, fn in (('dense', dense), ('BM25', keyword), ('hybrid', hybrid)):
    print(f'{name:9} {recall(fn, 1):9.2f} {recall(fn, 3):9.2f}')
q = 'Can I work from abroad?'
print('example:', q, '-> dense', dense(q, 3), '| BM25', keyword(q, 3))
```

**What to point out.** On these paraphrased questions dense retrieval beats keyword search by a wide margin, because the questions avoid the policies' wording on purpose. Hybrid retrieval scores *below* dense here: reciprocal rank fusion gives both lists equal weight, so BM25's wrong guesses push correct dense results down. On a corpus full of codes, names and exact phrases, BM25 contributes real hits and hybrid usually wins. So never assume hybrid is better; weight the two lists or pick one by measured recall. That is the lesson of the scoreboard: with 15 labelled questions and one function, every later change (chunk size, model, k, fusion weights) gets a number instead of an opinion.

**Extension for fast groups.** Re-run with `kestrel.chunks(max_sentences=3)` (whole documents) and relabel the gold answers by document. Larger chunks raise recall@1 at document level but paste three times as much text into every prompt; ask which matters more for their use case.

## Common questions

| Question | Answer |
|---|---|
| FAISS or a vector database? | FAISS is a library: fast, in-process, no persistence or filtering by itself. A vector database (pgvector, Qdrant, Weaviate, Chroma) adds storage, metadata filters, updates and access control |
| How many chunks should we retrieve? | Pick k from the recall curve: the smallest k that reaches the recall you need, because every extra chunk costs tokens and adds distraction |
| What about tables and PDFs? | Extract structure first (headings, rows) and chunk along it; a table row with its header beats a fixed character window |

# Day 1, Module 3: Grounded Answers and Retrieval Evaluation
%13:45–15:30 · Building the prompt, citing sources, catching unsupported answers, and choosing settings with data

**Outcome.** Participants assemble a cited answer and implement a groundedness check, then use recall@k to pick k.

## What to say (30 minutes)

| Point | The message |
|---|---|
| The prompt has three parts | Instructions (answer only from the sources, cite them, say "I don't know" otherwise), the retrieved chunks with ids, and the question |
| Citations are a contract | Each claim names the chunk it came from, so a reviewer, or a program, can check it |
| Groundedness | An answer is grounded when its claims are supported by the cited text. A simple automatic check: every number and key term in the answer appears in a cited chunk |
| Refusal is a feature | When retrieval finds nothing relevant, the right output is "not in the policies" with a pointer to a human, not a guess |
| Where the real model plugs in | The `generate` function below is a stand-in that copies the best sentence; in production it is one API call to a hosted model, with the same prompt |

## Lab 3: cite, check and refuse (60 minutes)

```python run Lab 3: a cited answer, a groundedness check, and a refusal threshold
import re, numpy as np, faiss
import kestrel

chunks = kestrel.chunks(max_sentences=1)
ids, texts = [c[0] for c in chunks], [c[1] for c in chunks]
vecs = kestrel.embed(texts).astype('float32')
index = faiss.IndexFlatIP(vecs.shape[1]); index.add(vecs)

def retrieve(q, k=3):
    s, idx = index.search(kestrel.embed([q]).astype('float32'), k)
    return [(ids[i], texts[i], float(sc)) for i, sc in zip(idx[0], s[0])]

def build_prompt(q, hits):
    src = '\n'.join(f'[{cid}] {t}' for cid, t, _ in hits)
    return ('Answer only from the sources below and cite them like [leave#1]. '
            'If they do not contain the answer, say you do not know.\n\n' + src
                    + '\n\nQuestion: ' + q)

def generate(prompt, hits, threshold=0.35):
    """Stand-in for an LLM: refuses below a similarity threshold, else uses the top source."""
    if hits[0][2] < threshold:
        return "I don't know: the policies do not cover this. Please ask HR."
    cid, text, _ = hits[0]
    return f'{text} [{cid}]'

def grounded(answer, hits):
    cited = set(re.findall(r'\[([a-z]+#\d+)\]', answer))
    source = ' '.join(t for cid, t, _ in hits if cid in cited)
    facts = re.findall(r'\d[\d,]*', answer.split('[')[0])
    return bool(cited) and all(f in source for f in facts)

for q in ['What is the daily food allowance on business trips?',
        'Can I bring my dog to the office?']:
    hits = retrieve(q)
    ans = generate(build_prompt(q, hits), hits)
    print('Q:', q, f'(top similarity {hits[0][2]:.2f})')
    print('A:', ans, '| grounded:', grounded(ans, hits))
fake = 'Meals are reimbursed up to 2,000 rupees per day. [expenses#2]'
print('A made-up answer citing a real source -> grounded:', grounded(fake,
        retrieve('food allowance')))
print('prompt length for one question:', len(build_prompt('food allowance',
        retrieve('food allowance'))), 'characters')
```

**What to point out.** The dog question finds nothing similar enough, so the system refuses instead of inventing a pet policy. The groundedness check reports False for the refusal, which is right (there is nothing cited to ground it), so count refusals separately in your metrics rather than as failures. The made-up answer cites a real chunk but changes the number, and the check catches it: the cited text says 1,500, not 2,000. This crude check, numbers and citations, catches a large class of real failures cheaply; Module 6 turns it into a test.

## Choosing k with data (15 minutes, demo)

```python run Demo: recall@k for k = 1 to 5, to pick the smallest k that is good enough
import numpy as np, faiss
import kestrel

chunks = kestrel.chunks(max_sentences=1)
ids = [c[0] for c in chunks]
vecs = kestrel.embed([c[1] for c in chunks]).astype('float32')
index = faiss.IndexFlatIP(vecs.shape[1]); index.add(vecs)
qv = kestrel.embed([q for q, _ in kestrel.QUESTIONS]).astype('float32')
_, idx = index.search(qv, 5)
for k in range(1, 6):
    r = np.mean([gold in [ids[i] for i in row[:k]] for row, (_, gold) in zip(idx,
            kestrel.QUESTIONS)])
    print(f'k = {k}: recall {r:.2f}')
```

**What to point out.** Recall rises with k and flattens: here it reaches 1.00 at k = 2, so k = 2 or 3 is enough for this corpus. Choose the knee of the curve, then confirm on fresh questions: 15 questions is enough to build the habit, not to sign off a production system (aim for 100 or more, drawn from real user queries).

## Clinic (15:45–17:00)

Participants load a folder of their own documents into the same pipeline: write 10 labelled questions, chunk by paragraph, run the Lab 2 scoreboard, and report recall@3 to the room. The facilitator collects the hardest failures; they make good examples for Day 2.
