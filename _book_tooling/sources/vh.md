# Hints
%Read only the hint for the exercise you are stuck on

## Part 1 hints

| Exercise | Hint |
|---|---|
| V1.1 | Hash, HMAC, AES-GCM, signature, key exchange |
| V1.2 | HMAC nests two hashes with the key; show it resists the append trick |
| V1.3 | `AESGCM.encrypt(nonce, data, aad)`; catch `InvalidTag` |
| V1.4 | c1 XOR c2 == p1 XOR p2 for the same keystream |
| V1.5 | bits = length × log2(alphabet); time = 2<sup>bits</sup> / 2 / rate |
| V1.6 | Compare strings that share k leading bytes; time many iterations |

## Part 2 hints

| Exercise | Hint |
|---|---|
| V2.1 | `argon2.PasswordHasher`; `check_needs_rehash` |
| V2.2 | Fast hash, no salt, timing leak, user enumeration, no rate limit |
| V2.3 | `jwt.decode(token, key, algorithms=['HS256'])`; always pass the list |
| V2.4 | Try counters t−1, t, t+1; store spent (counter) values |
| V2.5 | Short JWT + refresh + a revocation list, or sessions in Redis |
| V2.6 | challenge = base64url(sha256(verifier)); reject method != S256 |

## Part 3 hints

| Exercise | Hint |
|---|---|
| V3.1 | `openssl req -x509` for the CA with CA extensions; `-extfile` for the SAN |
| V3.2 | Add the internal CA to the trust store; never `verify=False` |
| V3.3 | DEK encrypts data; KEK wraps the DEK; rotate = re-wrap |
| V3.4 | Delete the DEK; the ciphertext becomes undecryptable |
| V3.5 | Regexes for `AKIA...`, `BEGIN PRIVATE KEY`, `password=...` |

## Part 4 hints

| Exercise | Hint |
|---|---|
| V4.1 | Sum server prices × validated quantities; ignore the client amount |
| V4.2 | HMAC over `timestamp.body`; compare_digest; check `abs(now − t)` |
| V4.3 | Paise as ints; `Decimal.quantize(..., ROUND_HALF_UP)` |
| V4.4 | `SET NX` the key; the loser returns the stored result |
| V4.5 | Hosted fields → SAQ A; network tokenisation; never store CVV |

## Part 5 hints

| Exercise | Hint |
|---|---|
| V5.1 | `WHERE meter_id = ? AND customer_id = ?` |
| V5.2 | `--` comments out the rest; `UNION SELECT` appends rows; use `?` |
| V5.3 | Pass arguments as a list, no shell; validate the name |
| V5.4 | `(base / name).resolve().is_relative_to(base)` |
| V5.5 | Keep only allow-listed keys from the body |
| V5.6 | Resolve the host; reject private/loopback/link-local; check the scheme |
| V5.7 | Look for HSTS, CSP without unsafe-inline, nosniff, frame-ancestors |
| V5.8 | Injected script vs forged cross-site request; CSP vs SameSite/tokens |

## Part 6 hints

| Exercise | Hint |
|---|---|
| V6.1 | Regex substitutions in a `logging.Filter` |
| V6.2 | Each entry stores the previous entry's hash |

## Part 7 hints

| Exercise | Hint |
|---|---|
| V7.1 | Random token, store only its hash, short expiry, single use, same response for any email |
| V7.2 | Secret manager + workload identity; per-service least privilege; dynamic DB creds; rotate on leak |
