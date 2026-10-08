# Hints
%Read only the hint for the exercise you are stuck on

## Part 1 hints

| Exercise | Hint |
|---|---|
| K1.1 | Average = h × 1 + (1 − h) × 41 |
| K1.2 | `collections.OrderedDict` with `move_to_end` and `popitem(last=False)` |
| K1.3 | Store a sentinel such as `'__none__'` with a short TTL for missing results |
| K1.4 | Multiple layers (in-process and Redis), update order, failed deletes, read replicas |
| K1.5 | Count expiry seconds with a `Counter` |
| K1.6 | `ZINCRBY`, `ZREVRANGE`, `ZREVRANK` |

## Part 2 hints

| Exercise | Hint |
|---|---|
| K2.1 | Refill min(capacity, tokens + rate × elapsed) before each batch |
| K2.2 | estimate = current + previous × (1 − elapsed fraction of the current window) |
| K2.3 | Scope keys by user or merchant; store a body fingerprint and the response |
| K2.4 | Storage keeps `max_token_seen` and rejects anything lower |
| K2.5 | A crash between the two commands leaves a key without a TTL |

## Part 3 hints

| Exercise | Hint |
|---|---|
| K3.1 | Two consumer groups on one stream |
| K3.2 | `crc32(meter) % 3` chooses the partition |
| K3.3 | `event_id`, `occurred_at`, `schema_version`; add fields, never repurpose them |
| K3.4 | Keep a stack of compensations; pop and run them on failure |
| K3.5 | Partitions cap the number of busy consumers in a group |

## Part 4 hints

| Exercise | Hint |
|---|---|
| K4.1 | Score = −priority × 10<sup>12</sup> + sequence number |
| K4.2 | Chunk by meter range; record each chunk's completion; unique (meter, period) bill |
| K4.3 | min(cap, base × 2<sup>n</sup>); full jitter = random between 0 and that |

## Part 5 hints

| Exercise | Hint |
|---|---|
| K5.1 | `BLPOP` with a timeout is a ready-made long poll |
| K5.2 | Who sends: only the server, or both? How often? |
| K5.3 | Abort the client's transport; the server's `async for` ends |

## Part 6 hints

| Exercise | Hint |
|---|---|
| K6.1 | `ThreadPoolExecutor`; hash each part; compare the final SHA-256 |
| K6.2 | `WHERE id < :last_id ORDER BY id DESC LIMIT n` |
| K6.3 | Walk the parsed document's selection sets recursively |
| K6.4 | Public and cacheable, client-shaped, internal typed, streaming |
| K6.5 | Bytes = ceil(bits / 7); the field tag adds one more byte |

## Part 7 hints

| Exercise | Hint |
|---|---|
| K7.1 | Primary key (conversation, month, ts); cursor = last ts seen |
| K7.2 | Bounded and owned → embed; shared, large or growing → reference |
| K7.3 | 96 readings a day; 365 × 5 days |
| K7.4 | Write both items in one transaction |

## Part 8 hints

| Exercise | Hint |
|---|---|
| K8.1 | One queue per priority, per-channel workers, provider limiters, idempotency per notification |
| K8.2 | 1,000,000 / 900 s ≈ 1,111 writes/s on average; peaks align on the quarter hour |
