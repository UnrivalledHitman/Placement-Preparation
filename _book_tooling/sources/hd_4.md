# Chapter 9: Case Studies I
%URL shortener, Pastebin, rate limiter service, notification system, chat and news feed

Each case study follows the framework from the start of the book. Try each one on paper for 40 minutes before reading. The deep dives include small simulations of the decision that matters most in that design.

## 9.1 URL shortener

### Requirements

- Functional: create a short link for a long URL (optionally a custom alias and an expiry); redirect a short link to the long URL; basic click counts.
- Non-functional: 100 M daily users; reads dominate (100:1); redirect p99 under 50 ms; highly available; short codes must not be guessable in sequence (optional).

### Estimates

From Chapter 2: about 116 creations/s and 11 600 redirects/s on average (35 000 at peak), 5 GB of new data per day, 27 TB over five years with three replicas. One database primary handles the writes easily; the read load needs a cache.

### API and data model

```text
POST /api/v1/urls        {long_url, custom_alias?, expires_at?} -> 201 {short_url}
GET  /{code}             -> 301/302 Location: long_url   (302 if you need every click counted)
url(code PK, long_url, user_id, created_at, expires_at)   -- key-value access by code
```

### High-level design

```text
client -> CDN -> LB -> redirect service -> Redis (code -> long_url) -> DB (sharded by code)
client -> LB -> create service -> ID generator (ranges) -> DB
                       click events -> Kafka -> analytics store
```

### Deep dive: generating short codes

| Approach | How | Trade-off |
|---|---|---|
| Hash and truncate | First 7 base62 characters of a hash of the URL | Collisions must be detected and retried; same URL gives the same code |
| Counter + base62 | A unique integer id, encoded in base62 | No collisions; sequential codes are guessable (fix by shuffling bits or a keyed permutation) |
| Pre-allocated ranges | Each server takes a block of 10 000 ids from a coordinator (ZooKeeper or a DB row) | No per-request coordination; a crashed server wastes the rest of its block |
| Snowflake-style ids | Timestamp + machine id + sequence in 64 bits | Fully decentralised; codes are longer (11 characters) |

Seven base62 characters give 62<sup>7</sup> ≈ 3.5 × 10<sup>12</sup> codes, far more than five years of links (about 18 billion). The next program checks the collision risk of the truncated-hash approach and shows base62 encoding.

```python run Base62 codes and the birthday problem
import hashlib, math, string

ALPHABET = string.digits + string.ascii_letters          # 62 characters
def base62(n):
    s = ''
    while n:
        n, r = divmod(n, 62); s = ALPHABET[r] + s
    return s or '0'

print('id 125 ->', base62(125), '| id 10^12 ->', base62(10 ** 12), '| 62^7 =',
        f'{62 ** 7:,}')

def collision_probability(n_items, space):              # birthday approximation
    return 1 - math.exp(-n_items * (n_items - 1) / (2 * space))

for n in [1e6, 1e8, 1e9, 18e9]:
    print(f'{n:>14,.0f} links in 7-char space: P(any collision) = '
            f'{collision_probability(n, 62 ** 7):.3f}')

seen, collisions = {}, 0
for i in range(2_000_000):                               # real hashes, truncated to 5 chars
    url = f'https://example.com/item/{i}'
    code = base62(int(hashlib.sha256(url.encode()).hexdigest(), 16))[:5]
    if code in seen: collisions += 1
    seen[code] = url
print(f'2,000,000 URLs with 5-char hash codes: {collisions:,} collisions '
      f'(birthday estimate {2e6 ** 2 / (2 * 62 ** 5):,.0f})')
```

Collisions are certain long before the space fills (the birthday paradox), so a hash-based design must check for an existing code and re-hash with a salt. A counter with ranges avoids the check entirely, which is why it is the more common interview answer.

### Other deep dives

- **301 or 302?** 301 (permanent) lets browsers cache the redirect, cutting load but hiding repeat clicks from analytics; 302 counts every click.
- **Hot links** go viral: the CDN and Redis absorb them; use request coalescing on misses.
- **Expiry**: lazy (check on read) plus a background sweeper; reuse of expired codes is optional and risky.
- **Abuse**: rate-limit creation per user/IP; scan destinations against malware lists.

## 9.2 Pastebin

Pastebin is the URL shortener with a payload: users store text (up to, say, 10 MB) and share a link.

| Decision | Choice | Why |
|---|---|---|
| Where the text lives | Object storage (S3), key = paste id | Cheap, durable, large objects; keeps the database small |
| Metadata | SQL or key-value: id, owner, size, created, expires, visibility | Small rows, simple lookups |
| Reads | CDN in front of object storage for public pastes; signed URLs for private ones | Most pastes are read rarely; popular ones are cached |
| Expiry | TTL in metadata + object lifecycle rules delete old objects | No custom cleanup job for the bytes |
| Ids | Same generator as the URL shortener | Short shareable links |

The key insight to say out loud: **separate metadata from blobs**. The database stays small and fast; the blob store scales on its own.

## 9.3 Rate limiter service

Algorithms were compared in the LLD guide; distribution choices were covered in Chapter 7. A complete design:

```text
client -> API gateway --(key = user|api|window)--> Redis cluster (atomic Lua token bucket)
                 |                                  rules cached locally, reloaded every 30 s
                 +-- 429 + Retry-After when over limit
rules store (SQL): {plan, api, limit, window}  -> admin UI
```

Deep-dive points: run the check as one atomic Lua script (read tokens, refill, decrement); shard Redis by user key; if Redis is unreachable, **fail open** for low-risk APIs (allow traffic) and **fail closed** for expensive or abuse-prone ones; return `X-RateLimit-Remaining` and `Retry-After`; limit per user, per IP and globally to protect backends.

## 9.4 Notification system

### Requirements

Send notifications (push, SMS, email, in-app) triggered by many services; respect user preferences, quiet hours and frequency caps; deliver at least once without duplicates the user can see; prioritise OTPs over marketing; handle 100 M notifications per day with bursts.

```text
services --> Notification API --> validation, preferences, templating, dedup (idempotency key)
                                     |
                       Kafka topics by priority: critical | normal | bulk
                                     |
    channel workers: push (APNs/FCM) | sms | email | in-app (DB + websocket)
                                     |  retries with back-off, provider failover, DLQ
                                     v
                          delivery status store + analytics
```

### Deep dive: priority and isolation

Separate queues (or topics) per priority keep a marketing blast of 50 million emails from delaying a one-time password. Channel workers scale independently, and per-provider bulkheads stop a slow SMS provider from blocking email.

```python run Shared queue versus priority queues during a marketing blast
from collections import deque

def simulate(separate, otp_every=50, blast=200_000, workers_per_sec=5_000):
    queue_shared, q_crit, q_bulk = deque(), deque(), deque()
    for i in range(blast):
        if i % otp_every == 0:
            item = ('otp', i / workers_per_sec / 4)     # OTPs arrive spread over the blast
            (q_crit if separate else queue_shared).append(item)
        item = ('bulk', 0.0)
        (q_bulk if separate else queue_shared).append(item)
    t, waits = 0.0, []
    per_item = 1 / workers_per_sec
    while queue_shared or q_crit or q_bulk:
        q = (q_crit if q_crit else q_bulk) if separate else queue_shared
        kind, arrived = q.popleft()
        t += per_item
        if kind == 'otp':
            waits.append(max(0.0, t - arrived))
    waits.sort()
    return waits[len(waits) // 2], waits[-1]

for separate in [False, True]:
    med, worst = simulate(separate)
    print(f'{"priority queues" if separate else "one shared queue"}: OTP wait median '
            f'{med:6.2f} s, '
          f'worst {worst:6.2f} s')
```

With one shared queue an OTP waits behind the whole blast; with a separate critical queue that workers drain first, OTPs are sent almost immediately.

Other deep dives: **deduplication** (an idempotency key per logical notification, stored with a TTL); **rate caps** per user per channel (sorted sets in Redis); **templates and localisation** rendered before enqueueing; **tracking** opens and failures for retries and provider scoring.

## 9.5 Chat (WhatsApp-style)

### Requirements

One-to-one and group chat (up to 256 members); online presence; delivery and read receipts; offline users receive messages when they reconnect; message order preserved within a conversation; 200 M daily users, about 40 messages each per day.

### Estimates

From Chapter 2: about 90 000 messages/s on average and 280 000 at peak; 1.6 TB of new messages per day. Concurrent connections might be 50 M, so the connection tier is sized by connections (about 50 000 per gateway server → ~1 000 servers with headroom).

### Design

```text
clients <==websocket==> gateway servers (stateful: hold connections)
                             |   publish message
                             v
                       chat service --> message store (wide-column,
                             |      partition = conversation_id, clustering = message_seq)
                             |--> session registry (Redis: user -> gateway server)
                             |--> if recipient online: route to their gateway
                             |--> else: push notification + stored for sync on reconnect
```

### Deep dive: ordering and delivery

- Each conversation has a monotonically increasing **sequence number** assigned by the chat service (or by the partition that owns the conversation). Clients sort by it and detect gaps.
- The client sends a **client message id**; the server deduplicates on it, so a retry after a network blip never creates a duplicate message.
- Delivery receipts are just small messages flowing the other way: `sent` (server stored it), `delivered` (recipient device acknowledged), `read`.
- Offline delivery is **pull on reconnect**: the client asks "give me messages after seq N for each conversation".

```python run Sequence numbers and client ids make retries safe
import random
rng = random.Random(8)

class Conversation:
    def __init__(self): self.seq, self.messages, self.by_client_id = 0, [], {}
    def append(self, client_id, sender, text):
        if client_id in self.by_client_id:   # retry of an already stored message
            return self.by_client_id[client_id]
        self.seq += 1
        self.messages.append((self.seq, sender, text))
        self.by_client_id[client_id] = self.seq
        return self.seq

conv = Conversation()
sent = 0
for i in range(1, 21):
    sender = 'asha' if i % 2 else 'ravi'
    cid = f'{sender}-{i}'
    attempts = 1 + (rng.random() < 0.3) + (rng.random() < 0.1)   # flaky network: retries
    for _ in range(attempts):
        conv.append(cid, sender, f'msg {i}')
        sent += 1
print(f'send attempts {sent}, stored messages {len(conv.messages)}, '
      f'sequence 1..{conv.seq} without gaps: '
              f'{[m[0] for m in conv.messages] == list(range(1, conv.seq + 1))}')
last_seen = 12                                               # an offline device reconnects
print('device syncs from seq 13:', [m[0] for m in conv.messages if m[0] > last_seen])
```

Group messages fan out to every member's device: for a 256-member group the chat service writes once to the conversation and routes to each online member's gateway. End-to-end encryption (Signal protocol) means the server stores and forwards ciphertext only, which also rules out server-side search.

## 9.6 News feed (Twitter/Instagram-style)

### Requirements

Users follow others; the home feed shows recent posts from followees, newest first (optionally ranked); posting must be fast; the feed must load in under 200 ms. Some accounts have tens of millions of followers.

### The core decision: fan-out on write or on read

| | Fan-out on write (push) | Fan-out on read (pull) |
|---|---|---|
| On post | Insert the post id into every follower's precomputed feed (Redis list) | Just store the post |
| On feed read | Read one precomputed list: very fast | Fetch recent posts of every followee and merge: slow for users following many |
| Problem | A celebrity post means millions of writes | Reads are expensive and repeated |

Production systems use a **hybrid**: push for normal accounts, pull for celebrities (accounts above a follower threshold), merged at read time. The simulation measures the cost of each strategy on a follower graph with a realistic heavy tail.

```python run Write and read costs: push, pull and hybrid fan-out
import random
rng = random.Random(12)
users = 20_000
followers = {u: 0 for u in range(users)}
following = {u: [] for u in range(users)}
# heavy-tailed popularity: a few accounts are followed by a large share of users
popularity = [1 / (i + 1) ** 1.1 for i in range(users)]
for u in range(users):
    for f in set(rng.choices(range(users), weights=popularity, k=50)):
        if f != u:
            following[u].append(f); followers[f] += 1

posts = rng.choices(range(users), k=20_000)                # who posts (uniform)
posts += [0] * 200   # the top celebrity posts 200 times
reads = rng.choices(range(users), k=200_000)               # feed loads

def cost(threshold):
    writes = sum(followers[p] for p in posts if followers[p] < threshold)
    read_fetches = sum(sum(1 for f in following[r] if followers[f] >= threshold)
            for r in reads)
    return writes, read_fetches

top = max(followers.values())
for name, th in [('push (fan-out on write)', float('inf')), ('pull (fan-out on read)', 0),
                 ('hybrid, celebrities >= 1000 followers', 1000)]:
    w, r = cost(th)
    print(f'{name:40} feed writes {w:>11,}   fetches at read time {r:>11,}')
print(f'most-followed account has {top:,} followers out of {users:,} users')
```

Pure push turns each celebrity post into a write per follower: here, 4.7 million feed writes. Pure pull makes every feed load query each followee: 7.3 million fetches for 200 000 loads. The hybrid cuts writes by more than ten times compared with push and roughly halves pull's read work, at about 17 celebrity fetches per feed load in this graph. The threshold is the tuning knob: raising it moves cost from reads to writes, and real systems set it from measured follower counts and read/write volumes.

Other deep dives: **ranking** (candidate generation from the merged feed, then a model scoring engagement; see the ML System Design material), **media** in object storage via CDN, **cursor pagination** (Chapter 8), and **cache only active users' feeds** (users inactive for 30 days have their feed rebuilt on next login).
