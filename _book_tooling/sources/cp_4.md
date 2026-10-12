# Chapter 8: Generative AI and Large Language Models
%Generative model families, transformers and attention, how LLMs are trained, decoding and temperature, prompting, fine-tuning and the limits of LLMs

## 8.1 Generative model families

| Model family | How it generates | Known for |
|---|---|---|
| **Large language models (LLMs)** | Predict the next token, one at a time, with a transformer | Text, code, reasoning, chat (GPT, Claude, Gemini, Llama, Mistral) |
| **Diffusion models** | Learn to remove noise step by step; generation starts from pure noise | Images and video (Stable Diffusion, DALL·E, Imagen) |
| **GANs** | A generator creates samples, a discriminator tries to tell them from real data; they train adversarially | Realistic faces, image-to-image translation; hard to train (mode collapse) |
| **VAEs** | Encode data into a probabilistic latent space and decode samples from it | Smooth latent spaces, anomaly detection |

A **discriminative** model learns P(label | input) to classify; a **generative** model learns the data distribution itself, P(input), so it can produce new samples. **Foundation models** are large models pre-trained on broad data and adapted to many tasks; **multimodal** models handle text with images, audio or video.

## 8.2 Tokens, embeddings and attention

LLMs read **tokens**, sub-word pieces produced by algorithms such as byte-pair encoding (BPE), WordPiece or SentencePiece. In English a token is roughly ¾ of a word, so 1,000 tokens ≈ 750 words. Each token becomes an **embedding**, a vector whose geometry captures meaning (similar words are close). **Positional encodings** add word order, since attention by itself is order-blind.

**Self-attention** lets every token gather information from every other token: each token produces a query (Q), key (K) and value (V); attention weights are softmax(QKᵀ / √d), and each token's output is the weighted sum of the values.

```python run Scaled dot-product self-attention for a three-token sentence, in NumPy
import numpy as np

rng = np.random.default_rng(0)
tokens = ['bank', 'river', 'money']
d = 4
X = rng.normal(size=(3, d))                          # token embeddings
Wq, Wk, Wv = (rng.normal(size=(d, d)) for _ in range(3))
Q, K, V = X @ Wq, X @ Wk, X @ Wv
scores = Q @ K.T / np.sqrt(d)   # how much each token attends to each other
weights = np.exp(scores) / np.exp(scores).sum(axis=1, keepdims=True)    # row-wise softmax
out = weights @ V
for t, row in zip(tokens, weights):
    print(f'{t:<6} attends to', {k: round(float(v), 2) for k, v in zip(tokens, row)})
print('each row of weights sums to', weights.sum(axis=1).round(6))
print('output shape:', out.shape, '(one context-aware vector per token)')
```

Real transformers use learned weights, many attention **heads** in parallel (each can focus on a different relation), feed-forward layers, residual connections and layer normalisation, stacked dozens of times.

| Architecture | Attention | Examples | Best at |
|---|---|---|---|
| Encoder-only | Bidirectional (sees left and right) | BERT, RoBERTa | Understanding: classification, NER, embeddings |
| Decoder-only | Causal (sees only earlier tokens) | GPT family, Llama, Claude | Generation, chat, code |
| Encoder–decoder | Encoder bidirectional, decoder causal with cross-attention | T5, BART, original transformer | Translation, summarisation |

The **context window** is the maximum number of tokens (prompt + output) the model can attend to at once; attention cost grows with the square of the sequence length.

## 8.3 How an LLM is built

1. **Pre-training** (self-supervised): predict the next token over trillions of tokens of text and code. The model learns grammar, facts and patterns; the result is a base model that continues text.
2. **Supervised fine-tuning (instruction tuning)**: train on curated prompt–response pairs so it follows instructions.
3. **Alignment**: **RLHF** (humans rank responses, a reward model learns the preferences, reinforcement learning such as PPO optimises the LLM against it), or simpler alternatives such as DPO, and AI-feedback methods (RLAIF, constitutional AI). Goal: helpful, honest, harmless behaviour.

**Parameters** (weights) number in the billions; more parameters, data and compute generally improve capability (scaling laws). **Inference** is generating answers with the trained model; its cost scales with tokens processed.

## 8.4 Decoding: temperature, top-k and top-p

At each step the model outputs a score (logit) per vocabulary token; softmax turns them into probabilities, and a **decoding strategy** picks the next token.

```python run Temperature reshapes the distribution; top-p keeps the smallest set covering p of the mass
import numpy as np

vocab = ['Paris', 'London', 'Rome', 'Berlin', 'pizza']
logits = np.array([5.0, 3.0, 2.5, 2.0, 0.5])

def softmax(z, t=1.0):
    e = np.exp((z - z.max()) / t)
    return e / e.sum()

for t in (0.2, 1.0, 2.0):
    probs = softmax(logits, t)
    print(f'T={t}:', {w: round(float(v), 3) for w, v in zip(vocab, probs)})

p = softmax(logits)
order = np.argsort(-p)
keep = order[:np.searchsorted(np.cumsum(p[order]), 0.9) + 1]
print('top-p 0.9 keeps:', [vocab[i] for i in keep])
print('top-k 2 keeps:  ', [vocab[i] for i in order[:2]])
print('greedy picks:   ', vocab[int(np.argmax(logits))])
```

| Setting | Effect | Use |
|---|---|---|
| Greedy (always the top token) | Deterministic, can be repetitive | Short factual answers |
| **Temperature** < 1 | Sharper distribution, more predictable | Code, extraction, factual Q&A (0–0.3) |
| Temperature > 1 | Flatter distribution, more random and creative, more errors | Brainstorming, creative writing |
| **Top-k** | Sample only from the k most likely tokens | Cuts off the long tail |
| **Top-p** (nucleus) | Sample from the smallest set whose probability sums to p | Adapts the set size to the model's confidence |
| Beam search | Keep several candidate sequences | Translation, summarisation |
| Max tokens, stop sequences | Limit output length / stop at a marker | Cost control, structured output |

## 8.5 Prompt engineering

| Technique | What it is | Example |
|---|---|---|
| Zero-shot | Instruction only | "Classify this review as positive or negative." |
| Few-shot (in-context learning) | Include worked examples in the prompt | Three labelled reviews, then the new one |
| Chain-of-thought | Ask for step-by-step reasoning before the answer | "Think step by step, then give the final number." |
| Role / system prompt | Set persona, rules and tone for the whole conversation | "You are a support agent for a bank. Never share account numbers." |
| Output format | Specify JSON, tables, length; give a schema | "Reply as JSON with keys sentiment and reason." |
| Delimiters | Separate instructions from data | Put user text inside `"""` or XML-style tags |
| Self-consistency | Sample several reasoning paths, take the majority answer | Arithmetic and logic tasks |
| Prompt chaining | Break a task into steps, each a prompt | Extract → summarise → translate |

A good prompt states the **task, context, constraints, output format and examples**. **Prompt injection** is an attack where text in the input (a web page, an email) tries to override the instructions ("ignore previous instructions and..."); defences include separating trusted instructions from untrusted data, limiting tool permissions, filtering outputs and human approval for risky actions.

## 8.6 Adapting an LLM: prompting, RAG or fine-tuning

| Approach | Changes | Best when | Cost |
|---|---|---|---|
| Prompt engineering | Nothing in the model | The model already knows how; you need format or behaviour | Lowest |
| **RAG** (Chapter 9) | Adds retrieved documents to the prompt | Answers need private, recent or verifiable knowledge; citations | Moderate (retrieval infrastructure) |
| **Fine-tuning** (full) | All weights | You need a new style, format or skill learned from many examples | High |
| Parameter-efficient fine-tuning (**LoRA**, adapters, QLoRA) | Small added matrices; base weights frozen | Domain or task adaptation with limited compute | Moderate |
| Distillation | A small model learns from a large one's outputs | Cheaper, faster deployment | Training cost once |

Rule of thumb: **knowledge** problems → RAG; **behaviour or style** problems → fine-tuning; try prompting first.

## 8.7 Limitations, evaluation and responsible use

| Issue | Meaning | Mitigation |
|---|---|---|
| **Hallucination** | Fluent but false or unsupported statements | RAG with citations, low temperature, verification steps, "say I don't know" instructions, human review |
| Knowledge cut-off | No knowledge after the training data ends | RAG, tools such as web search |
| Context limits | Long documents do not fit or get "lost in the middle" | Chunking, retrieval, summarisation |
| Bias and toxicity | Learned from training data | Alignment, filters, evaluation across groups |
| Privacy and security | Leaking personal or confidential data; prompt injection | Data controls, redaction, guardrails, least-privilege tools |
| Cost and latency | Grow with tokens and model size | Smaller models, caching, shorter prompts, batching |

| Evaluation | Measures |
|---|---|
| Perplexity | How well a model predicts held-out text (lower is better) |
| BLEU / ROUGE | n-gram overlap with reference text (translation / summarisation) |
| Exact match, F1 | Question answering against reference answers |
| Benchmarks | MMLU (knowledge), HumanEval (code), GSM8K (maths) |
| LLM-as-a-judge, human evaluation | Helpfulness, correctness, safety of open-ended answers |

```python run Estimating tokens and monthly cost for an LLM feature
words_per_query, words_per_answer = 300, 150   # prompt (with retrieved context) and answer
tokens_in, tokens_out = words_per_query / 0.75, words_per_answer / 0.75
queries_per_day = 20_000
price_in, price_out = 3.0, 15.0   # example prices in USD per million tokens
daily = queries_per_day * (tokens_in * price_in + tokens_out * price_out) / 1e6
print(f'tokens per query: {tokens_in:.0f} in, {tokens_out:.0f} out')
print(f'cost per day: ${daily:,.2f}   per month: ${daily * 30:,.0f}')
print(f'halving the retrieved context saves '
        f'{queries_per_day * tokens_in / 2 * price_in / 1e6 * 30:,.0f} USD/month')
```

## 8.8 Practical lessons

- LLMs are decoder-only transformers predicting the next token; attention is softmax(QKᵀ/√d)V.
- Pre-training → instruction tuning → alignment (RLHF or DPO).
- Low temperature for facts and code, higher for creativity; top-p adapts the candidate set.
- Prompting first, RAG for knowledge, fine-tuning (LoRA) for behaviour; hallucination is managed with grounding and verification.

# Chapter 9: Agentic AI and Retrieval-Augmented Generation
%The RAG pipeline end to end, chunking, embeddings and vector search, evaluating retrieval, and AI agents that plan and use tools

## 9.1 Why RAG

An LLM only knows its training data. **Retrieval-augmented generation** fetches relevant passages from your own knowledge base at question time and puts them in the prompt, so the model answers from current, private, citable sources. It reduces hallucination and avoids retraining when documents change.

```text
 Indexing (offline):  documents -> clean -> chunk -> embed -> store in a vector DB
 Query time (online): question -> embed -> similarity search (top-k) -> rerank
                      -> prompt = instructions + retrieved chunks + question
                      -> LLM -> answer with citations
```

## 9.2 A RAG retriever from scratch

The program below chunks a small policy handbook with overlap, embeds the chunks with TF-IDF (a stand-in for a neural embedding model), retrieves the top chunks for a question by cosine similarity, and assembles the prompt an LLM would receive.

```python run Chunk, embed, retrieve by cosine similarity, and build the augmented prompt
import textwrap
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

handbook = {
    'leave.md': 'Employees get 18 days of earned leave per year. Unused earned leave up to '
            '30 days '
                'carries forward. Sick leave is 12 days per year and needs a medical '
                        'certificate '
                'after 3 consecutive days.',
    'travel.md': 'Domestic travel must be booked through the travel portal. Economy class '
            'is allowed '
                 'for flights under 6 hours. Hotel limits are 6000 rupees per night in '
                         'metro cities.',
    'it.md': 'Laptops must use full-disk encryption. Passwords are rotated every 90 days. '
            'Report a '
             'lost laptop to the IT service desk within 24 hours.',
}

def chunk(text, size=12, overlap=4):
    words = text.split()
    step = size - overlap
    return [' '.join(words[i:i + size]) for i in range(0, max(len(words) - overlap, 1),
            step)]

def build_index(size, overlap):
    chunks = [(doc, c) for doc, text in handbook.items() for c in chunk(text, size,
            overlap)]
    vec = TfidfVectorizer(stop_words='english')
    return chunks, vec, vec.fit_transform([c for _, c in chunks])

def retrieve(index, question, k=2):
    chunks, vec, matrix = index
    sims = cosine_similarity(vec.transform([question]), matrix).ravel()
    best = sims.argsort()[::-1][:k]
    return [(chunks[i][0], chunks[i][1], sims[i]) for i in best]

question = 'How many sick leave days do I get and when is a certificate needed?'
for size, overlap in [(12, 4), (24, 8)]:
    index = build_index(size, overlap)
    hits = retrieve(index, question)
    found = any('certificate' in text for _, text, _ in hits)
    print(f'chunks of {size} words, overlap {overlap}: {len(index[0])} chunks; '
          f'certificate rule retrieved: {found}')
    for doc, text, score in hits:
        print(textwrap.fill(f'{score:.2f} [{doc}] {text}', 88, initial_indent='   ',
                            subsequent_indent='        '))
context = '\n'.join(f'[{doc}] {text}' for doc, text, _ in hits)
prompt = ('Answer using only the context. Cite the source in brackets.\n'
          'If the answer is not in the context, say you do not know.\n\n'
          f'Context:\n{context}\n\nQuestion: {question}')
print('--- prompt sent to the LLM (24-word chunks) ---')
print('\n'.join(textwrap.fill(line, 90) for line in prompt.split('\n')))
```

The first configuration is an honest failure: with 12-word chunks, the sentence about the medical certificate ends up in a chunk that shares few words with the question, and the two retrieved chunks answer only half of it. An LLM given that context would (correctly, if well instructed) say it does not know the certificate rule, or worse, guess. Larger chunks with overlap keep the whole rule together and retrieve it. Chunk size is a real trade-off: too small loses context, too large dilutes relevance and costs tokens; test it on real questions. In production, the TF-IDF step is replaced by an **embedding model** (dense vectors that match meaning, not just shared words), the list by a **vector database**, and the printed prompt is sent to the LLM.

| Component | Choices and facts |
|---|---|
| Chunking | Fixed size with overlap; by sentence, paragraph or heading; semantic chunking. Too small loses context, too large dilutes relevance and wastes tokens |
| Embeddings | Neural sentence-embedding models map text to vectors; the same model must embed documents and queries |
| Similarity | Cosine similarity (angle; most common), dot product, Euclidean distance |
| Vector databases | FAISS (library), Chroma, Pinecone, Weaviate, Milvus, Qdrant, pgvector in PostgreSQL |
| Approximate nearest neighbour | HNSW graphs, IVF: fast search over millions of vectors at a small recall cost |
| Hybrid search | Combine keyword search (BM25, exact terms, IDs) with vector search (meaning) |
| Reranking | A cross-encoder rescores the top 20–50 candidates for precision |
| Metadata filters | Restrict by department, date, access rights before or during search |

## 9.3 Evaluating RAG

```python run Retrieval metrics: recall@k and mean reciprocal rank
evaluation = {   # question -> (relevant chunk ids, ranked results)
    'sick leave rules': ({3, 4}, [3, 7, 4, 1, 9]),
    'hotel limit': ({11}, [8, 11, 2, 5, 6]),
    'lost laptop': ({15}, [1, 2, 6, 8, 15]),
    'password rotation': ({14}, [14, 13, 2, 9, 1]),
}
def recall_at_k(relevant, ranked, k):
    return len(relevant & set(ranked[:k])) / len(relevant)
def reciprocal_rank(relevant, ranked):
    return next((1 / (i + 1) for i, r in enumerate(ranked) if r in relevant), 0.0)
for k in (1, 3, 5):
    avg = sum(recall_at_k(rel, ranked, k) for rel,
            ranked in evaluation.values()) / len(evaluation)
    print(f'recall@{k}: {avg:.3f}')
mrr = sum(reciprocal_rank(rel, ranked) for rel,
        ranked in evaluation.values()) / len(evaluation)
print(f'MRR: {mrr:.3f}')
```

| Stage | Metric | Question it answers |
|---|---|---|
| Retrieval | Recall@k, precision@k, MRR, nDCG | Did the right chunks come back, and how high? |
| Generation | **Faithfulness / groundedness** | Is every claim supported by the retrieved context? |
| Generation | Answer relevance, correctness | Does it answer the question, correctly? |
| End to end | Context precision and recall, latency, cost | Frameworks such as RAGAS and TruLens automate these |

| RAG failure | Fix |
|---|---|
| Right document exists but is not retrieved | Better chunking, hybrid search, query rewriting, more k, better embeddings |
| Retrieved but answer still wrong | Reranking, clearer prompt ("only from context"), smaller noisy context |
| Answer invents facts | Faithfulness checks, citations, "I don't know" instruction |
| Stale or conflicting documents | Re-index on change, metadata dates, deduplication |
| User sees documents they should not | Access-control filtering at retrieval time |

## 9.4 AI agents

An **agent** uses an LLM as a reasoning engine in a loop: it decides which **action** (tool call) to take, observes the result, and repeats until the goal is met. Ingredients:

| Component | Role |
|---|---|
| LLM (the "brain") | Interprets the goal, plans, chooses tools, writes the final answer |
| **Tools / function calling** | APIs the agent may call (search, calculator, database, code execution, email), described by name, purpose and a JSON parameter schema |
| Memory | Short-term: the conversation and scratchpad; long-term: a vector store of past facts or preferences |
| Planning | Decompose the goal into steps; re-plan when an observation changes things |
| Reflection | Critique and revise its own output |
| Guardrails | Limits on steps, cost, permissions; human approval for irreversible actions |

The **ReAct** pattern interleaves **Thought → Action → Observation** until the agent can answer. The program below runs that control loop with a scripted stand-in for the LLM, so the mechanics are visible without an API.

```python run A ReAct loop: thought, tool call, observation, with a step limit
import json

TOOLS = {
    'lookup_order': lambda order_id: {'A17': {'status': 'shipped', 'amount': 2400},
                                      'B22': {'status': 'processing',
                                              'amount': 900}}.get(order_id),
    'calculator': lambda expression: eval(expression, {'__builtins__': {}}),
}

def fake_llm(goal, history):
    """Stands in for the model: returns the next step as JSON, as a tool-calling LLM would."""
    seen = [h['observation'] for h in history]
    if not seen:
        return {'thought': 'I need the order details first.', 'action': 'lookup_order',
                'args': {'order_id': 'A17'}}
    if len(seen) == 1:
        return {'thought': 'Refund is 10% of the amount.', 'action': 'calculator',
                'args': {'expression': f"{seen[0]['amount']} * 0.10"}}
    return {'thought': 'I have everything.', 'final': f'Order A17 is {seen[0]["status"]}; '
                                                       f'a 10% goodwill refund is Rs '
                                                               f'{seen[1]:.0f}.'}

def run_agent(goal, max_steps=5):
    history = []
    for step in range(1, max_steps + 1):
        decision = fake_llm(goal, history)
        print(f'step {step} thought: {decision["thought"]}')
        if 'final' in decision:
            return decision['final']
        result = TOOLS[decision['action']](**decision['args'])
        print(f'        action: {decision["action"]}({json.dumps(decision["args"])})')
        print(f'        observation: {result}')
        history.append({'action': decision['action'], 'observation': result})
    return 'Stopped: step limit reached.'

print('answer:', run_agent('Customer asks about order A17 and a 10% goodwill refund.'))
```

The application, not the model, executes the tools: the LLM only proposes a call as structured output, the code runs it and feeds the result back. That separation is where permissions, validation, logging and human approval are enforced. (The `eval`-based calculator is a toy; never evaluate model output as code without a sandbox.)

| Pattern | Description |
|---|---|
| Workflow / prompt chain | Fixed sequence of LLM steps defined by the developer; predictable, cheap |
| Router | An LLM classifies the request and sends it to a specialised path |
| Single agent with tools | The LLM chooses actions dynamically in a loop (ReAct) |
| Plan-and-execute | Plan all steps first, then execute them, re-planning on failure |
| Multi-agent | Specialised agents (researcher, coder, reviewer) coordinated by an orchestrator or supervisor |
| Agentic RAG | The agent decides when and what to retrieve, rewrites queries, retrieves again if needed |

| Term | Meaning |
|---|---|
| Frameworks | LangChain and LangGraph, LlamaIndex, Microsoft AutoGen, CrewAI, OpenAI Agents SDK |
| **MCP** (Model Context Protocol) | An open standard for connecting LLM applications to tools and data sources through servers with a common interface |
| Human-in-the-loop | The agent pauses for approval before consequential actions (payments, emails, deletions) |
| Agent risks | Infinite loops, runaway cost, wrong tool arguments, prompt injection through tool results, over-broad permissions |
| Agent evaluation | Task success rate, steps and cost per task, tool-call accuracy, safety violations |

Use an agent when the steps cannot be known in advance; prefer a fixed workflow when they can, because it is cheaper, faster and easier to test.

## 9.5 Practical lessons

- RAG = retrieve relevant chunks, put them in the prompt, answer with citations; it adds knowledge without retraining.
- Chunk with overlap, embed documents and queries with the same model, search by cosine similarity, rerank, filter by permissions.
- Evaluate retrieval (recall@k, MRR) and generation (faithfulness, relevance) separately.
- Agents loop Thought → Action → Observation with tools and memory; the application executes tools and enforces limits and approvals.
