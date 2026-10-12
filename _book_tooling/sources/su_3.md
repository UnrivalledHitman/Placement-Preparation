# Chapter 6: GenAI Code You May Be Shown
%Hugging Face tokenizers, sentence embeddings and semantic similarity, the pipeline API, and LangChain prompt templates

Scenario and code questions on GenAI increasingly show short framework snippets and ask what they do or print. The examples below are real: they ran with Hugging Face `transformers` and `sentence-transformers`, and LangChain, using small public models downloaded once.

## 6.1 Tokenizers

```python run A real BERT tokenizer: sub-words, special tokens, IDs and padding
import os
os.environ['HF_HUB_OFFLINE'] = '1'
from transformers import AutoTokenizer

tok = AutoTokenizer.from_pretrained('bert-base-uncased')
text = 'Tokenization of unbelievably long words'
print(tok.tokenize(text))
enc = tok(text)
print('ids:', enc['input_ids'])
print('decoded:', tok.decode(enc['input_ids']))
batch = tok(['short one', 'a somewhat longer second sentence'], padding=True)
for ids, mask in zip(batch['input_ids'], batch['attention_mask']):
    print(len(ids), mask)
print('vocabulary size:', tok.vocab_size)
```

| Observation | Explanation |
|---|---|
| `token`, `##ization` | WordPiece splits rare words into known sub-words; `##` marks a continuation |
| `[CLS]` ... `[SEP]` added | BERT's special tokens: classification token and separator |
| `attention_mask` with 0s | Padding positions the model must ignore |
| Same text, different models | Each model has its own tokenizer and vocabulary; always load the matching one (`from_pretrained` with the same name) |

## 6.2 Sentence embeddings and semantic similarity

```python run Embeddings from all-MiniLM-L6-v2: similar meaning, high cosine similarity
import os
os.environ['HF_HUB_OFFLINE'] = '1'
import numpy as np
import torch
from sentence_transformers import SentenceTransformer
torch.set_num_threads(1)

model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2', device='cpu')
sentences = ['How many sick days do I get?', 'What is the leave allowance when I am ill?',
             'How do I encrypt my laptop?', 'The cricket match was exciting']
emb = model.encode(sentences, normalize_embeddings=True)
print('embedding shape:', emb.shape)
sims = emb @ emb.T   # cosine similarity (vectors are normalised)
for i, s in enumerate(sentences[1:], start=1):
    print(f'{sims[0, i]:.2f}  {s}')
```

The first two questions share almost no words ("sick days" versus "leave allowance when I am ill") yet score far higher than the unrelated sentences: embeddings capture **meaning**, which keyword (TF-IDF) retrieval cannot. Each sentence becomes a 384-dimensional vector; normalising them makes the dot product equal to cosine similarity.

## 6.3 The pipeline API

```python
from transformers import pipeline   # display only: downloads a model on first use

classifier = pipeline('sentiment-analysis')   # default fine-tuned model for the task
classifier(['The delivery was quick!', 'The product broke in a day.'])
# -> [{'label': 'POSITIVE', 'score': 0.99...}, {'label': 'NEGATIVE', 'score': 0.99...}]

generator = pipeline('text-generation', model='gpt2')
generator('Machine learning is', max_new_tokens=20, temperature=0.7, do_sample=True)

summariser = pipeline('summarization')   # also: translation, ner, question-answering,
                                                       # fill-mask, zero-shot-classification
```

| Pipeline task | Typical model type |
|---|---|
| `sentiment-analysis`, `text-classification`, `zero-shot-classification` | Encoder (BERT-like) fine-tuned for classification |
| `ner`, `question-answering`, `fill-mask` | Encoder |
| `text-generation` | Decoder (GPT-like) |
| `summarization`, `translation` | Encoder–decoder (T5, BART) |

## 6.4 Prompt templates and output parsing with LangChain

```python run A chat prompt template, a fake model standing in for an LLM, and an LCEL chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.language_models import FakeListLLM

prompt = ChatPromptTemplate.from_messages([
    ('system', 'You are a support assistant for {company}. Answer in one sentence.'),
    ('human', 'Question: {question}'),
])
messages = prompt.invoke({'company': 'MeterHub', 'question': 'How do I reset my password?'})
for m in messages.to_messages():
    print(f'{m.type}: {m.content}')
print('variables:', sorted(prompt.input_variables))

llm = FakeListLLM(responses=['Use the "Forgot password" link on the login page.'])
chain = prompt | llm | StrOutputParser()   # LCEL: each step's output feeds the next
print('chain output:', chain.invoke({'company': 'MeterHub', 'question': 'Reset password?'}))
```

The `|` operator composes **runnables** (LangChain Expression Language, LCEL): the template fills in variables and produces chat messages, the model produces a reply, and the parser turns it into a plain string. Replacing `FakeListLLM` with a real chat model (for example `ChatOpenAI` or `ChatAnthropic`) changes nothing else in the chain.

## 6.5 Practical lessons

- Tokenizers split into sub-words, add special tokens and return input IDs and attention masks; use the model's own tokenizer.
- Sentence embeddings place similar meanings close together; cosine similarity of normalised vectors is a dot product.
- `pipeline(task)` wraps tokenizer + model + post-processing for common tasks.
- LangChain: prompt templates with variables, `prompt | model | parser` chains.

# Chapter 7: RAG and Agent Frameworks in Code
%Text splitters, FAISS and Chroma vector stores, BM25 and hybrid search, and tool schemas for function calling

## 7.1 Splitting documents

```python run LangChain's recursive character splitter with overlap
from langchain_text_splitters import RecursiveCharacterTextSplitter

policy = ('Leave policy. Employees get 18 days of earned leave per year. Unused earned '
        'leave up '
          'to 30 days carries forward.\n\nSick leave is 12 days per year. A medical '
                  'certificate is '
          'needed after 3 consecutive days.\n\nTravel policy. Book flights through the '
                  'portal.')
splitter = RecursiveCharacterTextSplitter(chunk_size=60, chunk_overlap=25,
                                          separators=['\n\n', '\n', ' '])
chunks = splitter.split_text(policy)
for i, c in enumerate(chunks):
    print(f'{i}: ({len(c)} chars) {c!r}')
```

The recursive splitter tries the coarsest separator first (blank lines between paragraphs) and only splits further (lines, then words) when a piece is still longer than `chunk_size`. Each paragraph here exceeds 60 characters, so it was split by words, and `chunk_overlap` made consecutive chunks share their boundary words ("days of earned leave per" ends chunk 0 and starts chunk 1), so a fact cut at a boundary still appears whole in one chunk. The paragraph boundary itself is never crossed: the last travel chunk shares nothing with the sick-leave chunks. Larger chunks (500–1,000 characters is common) keep whole sentences together; the tiny size here only makes the behaviour visible.

## 7.2 Vector search with FAISS and Chroma

```python run The same knowledge base in FAISS (a library) and Chroma (a vector database)
import os
os.environ['HF_HUB_OFFLINE'] = '1'
import faiss, torch
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
torch.set_num_threads(1)

docs = ['Employees get 18 days of earned leave per year.',
        'Sick leave is 12 days per year; a certificate is needed after 3 days.',
        'Laptops must use full-disk encryption.',
        'Report a lost laptop to the IT desk within 24 hours.',
        'Hotel limit is 6000 rupees per night in metro cities.']
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2', device='cpu')
vecs = model.encode(docs, normalize_embeddings=True)
query = 'I lost my computer, what should I do?'
qv = model.encode([query], normalize_embeddings=True)

index = faiss.IndexFlatIP(vecs.shape[1])   # inner product = cosine on normalised vectors
index.add(vecs)
scores, ids = index.search(qv, 2)
for s, i in zip(scores[0], ids[0]):
    print(f'FAISS {float(s):.2f}  {docs[i]}')

client = chromadb.EphemeralClient(settings=Settings(anonymized_telemetry=False))
col = client.create_collection('policies', embedding_function=None,
                               metadata={'hnsw:space': 'cosine'})
col.add(ids=[f'd{i}' for i in range(len(docs))], documents=docs, embeddings=vecs.tolist(),
        metadatas=[{'dept': d} for d in ['HR', 'HR', 'IT', 'IT', 'Travel']])
res = col.query(query_embeddings=qv.tolist(), n_results=2, where={'dept': 'IT'})
for doc in res['documents'][0]:
    print('Chroma (IT only):', doc)
print('Chroma distances:', [round(d, 2) for d in res['distances'][0]])
```

"Lost my computer" retrieves the lost-laptop rule although it shares no keyword with it. FAISS is an in-process library of index structures (flat, IVF, HNSW, product quantisation); Chroma is a database that stores documents, embeddings and **metadata**, and filters by metadata (`where={'dept': 'IT'}`) during search. Chroma reports cosine **distance** (1 − similarity), so smaller is closer.

## 7.3 Keyword search and hybrid retrieval

```python run BM25 keyword ranking, vector ranking, and reciprocal rank fusion
import os
os.environ['HF_HUB_OFFLINE'] = '1'
import numpy as np, torch
from rank_bm25 import BM25Okapi
from sentence_transformers import SentenceTransformer
torch.set_num_threads(1)

docs = ['Error code XJ-4401 means the meter battery is low.',
        'Replace the battery when the display flashes.',
        'Error code XJ-5502 means a network timeout.',
        'Contact support if the meter shows no reading.']
query = 'what does XJ-5502 mean'
bm25 = BM25Okapi([d.lower().split() for d in docs])
kw_scores = bm25.get_scores(query.lower().split())
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2', device='cpu')
vec_scores = model.encode(docs, normalize_embeddings=True) @ model.encode(
    [query], normalize_embeddings=True)[0]
kw_rank, vec_rank = np.argsort(-kw_scores), np.argsort(-vec_scores)
print('BM25 scores:  ', [round(float(x), 2) for x in kw_scores])
print('vector scores:', [round(float(x), 2) for x in vec_scores])
rrf = {d: 1 / (60 + list(kw_rank).index(d) + 1) + 1 / (60 + list(vec_rank).index(d) + 1)
       for d in range(len(docs))}
best = sorted(rrf, key=rrf.get, reverse=True)
print('hybrid (RRF):', best, '->', docs[best[0]])
```

Both methods put the right document (index 2) first, but look at the margins. Vector search scores the XJ-5502 document 0.65 and the **wrong** XJ-4401 document 0.56, because to an embedding model the two error messages mean almost the same thing; a slightly different phrasing could swap them. BM25, a refined TF-IDF ranking, gives the exact code a clear score and everything else zero. Keyword search is precise on identifiers, names and codes; vector search handles paraphrases. **Reciprocal rank fusion** (RRF) combines their ranked lists using only ranks, score = Σ 1/(60 + rank), so documents ranked well by either method rise. Production RAG systems commonly use exactly this hybrid, often followed by a cross-encoder reranker.

## 7.4 Tools for agents

```python run Defining a tool with LangChain: the schema an LLM sees for function calling
import json
from langchain_core.tools import tool
from langchain_core.utils.function_calling import convert_to_openai_tool

@tool
def get_order_status(order_id: str, include_items: bool = False) -> str:
    """Look up the delivery status of an order by its ID."""
    return f'Order {order_id} is shipped' + (' with 3 items' if include_items else '')

print('name:', get_order_status.name)
print('description:', get_order_status.description)
for arg, spec in get_order_status.args.items():
    print(f'arg {arg}: {json.dumps(spec)}')
schema = convert_to_openai_tool(get_order_status)
print('required:', schema['function']['parameters'].get('required'))
print('call:', get_order_status.invoke({'order_id': 'A17', 'include_items': True}))
```

The decorator turns a typed, documented function into a tool: the **name**, **docstring** and **type hints** become the JSON schema the model reads to decide when and how to call it. Good tool descriptions are therefore part of prompt engineering. An agent framework (LangGraph, the OpenAI Agents SDK, LlamaIndex agents) runs the loop from the guide's Chapter 9: send the tool schemas with the conversation, execute any tool call the model returns, append the result, repeat.

## 7.5 Practical lessons

- Split documents on natural boundaries with overlap; chunk size and overlap are tunable.
- FAISS is a vector index library; Chroma, Pinecone and others are vector databases with metadata filtering; cosine distance = 1 − similarity.
- BM25 finds exact terms, embeddings find meaning; fuse rankings (RRF) for hybrid retrieval.
- A tool = name + description + typed parameters (JSON schema); the application executes the calls.
