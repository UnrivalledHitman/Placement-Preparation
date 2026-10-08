# How to use this practice book
%34 exercises matching the security guide, with hints kept separate and executed solutions

Each part matches chapters of the **Security Engineering** guide. Every attack here is run against a **toy you build yourself**, on your own machine, with data you invent; never test systems you do not own. Code exercises use Python with the `cryptography`, `bcrypt`, `argon2-cffi` and `PyJWT` libraries and the OpenSSL command line; port the ideas to Spring Security afterwards.

Solutions were executed like the guide, and their output is shown.

| Type | What you do |
|---|---|
| Code | Write and run a program |
| Concept | Explain, as in an interview |
| Debug | Find and fix the vulnerability |
| Design | Design a secure feature or flow |
| Numerical | Calculate (entropy, attack cost) |

**Marking scheme.** Mark ✓ (solved alone), ~ (with the hint) or ✗ (needed the solution). For Code, ✓ also requires: constant-time comparisons for secrets, authenticated encryption with unique nonces, and no secret in code or logs. Redo every ~ and ✗ a week later.

| Part | Guide chapters | Topic | Exercises |
|---|---|---|---|
| 1 | 2 | Cryptography | 6 |
| 2 | 3 | Auth, sessions, MFA | 6 |
| 3 | 4–5 | TLS, keys, secrets | 5 |
| 4 | 6 | Payments | 5 |
| 5 | 7 | OWASP Top 10 | 8 |
| 6 | 8 | Privacy and audit | 2 |
| 7 | 9 | Design | 2 |

# Exercises

## Part 1: Cryptography

**V1.1 · Easy · Concept · Which primitive?** For each, name the right primitive and why: verifying a downloaded file is intact; proving an API request came from a partner who shares a key; encrypting a column of Aadhaar numbers; letting any service verify a token only the auth server could create; two servers agreeing a key over the internet.

**V1.2 · Medium · Code · Length-extension.** Show that a "MAC" built as `sha256(secret + message)` can be forged by appending data without knowing the secret (the length-extension attack, in principle), and that HMAC is not vulnerable. (You may demonstrate the HMAC side and explain the MD construction weakness.)

**V1.3 · Medium · Code · Authenticated encryption.** Encrypt a message with AES-256-GCM, then show that (a) flipping one ciphertext bit is detected, (b) the right associated data is required, and (c) decrypting with the wrong key fails cleanly.

**V1.4 · Hard · Code · Nonce reuse.** Encrypt two known-plaintext messages with AES-GCM under the **same** nonce and recover one plaintext from the other using only the two ciphertexts.

**V1.5 · Medium · Numerical · Password entropy and crack time.** Compare the entropy and offline crack time (assume 10<sup>10</sup> guesses/s against a fast hash, and 10<sup>4</sup>/s against bcrypt) of: an 8-character password from 94 symbols; a 4-word passphrase from a 7,776-word list; a 6-digit OTP.

**V1.6 · Medium · Code · Constant-time comparison.** Demonstrate why `==` on secrets leaks information through timing, and that `hmac.compare_digest` does not, by measuring comparison time against the number of matching leading bytes.

## Part 2: Authentication, sessions and MFA

**V2.1 · Easy · Code · Hash and verify a password.** Hash a password with Argon2id, verify correct and wrong inputs, show two hashes of the same password differ, and trigger a rehash by raising the parameters.

**V2.2 · Medium · Debug · A flawed login.** This login compares `sha256(password)` to the stored hash with `==`, returns "no such user" vs "wrong password", and has no rate limit. List every problem and rewrite it.

**V2.3 · Medium · Code · Sign and verify a JWT.** Issue an HS256 JWT with an expiry, verify it, reject an expired one, reject one signed with a different key, and reject an `alg=none` token.

**V2.4 · Medium · Code · TOTP with drift.** Implement TOTP verification that accepts the code for the current 30-second step and one step either side, and rejects a code reused after it was already spent.

**V2.5 · Medium · Concept · Session vs JWT for a bank.** Choose between server-side sessions and JWTs for a banking app that must support instant logout-everywhere and per-request authorisation across microservices; justify, and describe how to get the benefits of both.

**V2.6 · Medium · Code · PKCE.** Generate a PKCE verifier and S256 challenge, verify the correct verifier, reject a wrong one, and reject a `plain` challenge method when your server requires S256.

## Part 3: TLS, keys and secrets

**V3.1 · Medium · Code · A certificate and its chain.** With OpenSSL, create a CA and a server certificate with a SAN, then verify the certificate against the CA, and show verification failing for a wrong host name.

**V3.2 · Medium · Debug · Disabling verification.** A service calls a partner API with TLS verification turned off to "fix a handshake error". Explain the risk and give the correct fix for a self-signed internal CA.

**V3.3 · Medium · Code · Envelope encryption.** Encrypt three records each under its own DEK, wrap the DEKs with a KEK, then rotate the KEK by re-wrapping only the DEKs, and show the data still decrypts.

**V3.4 · Medium · Code · Crypto-shredding.** Extend V3.3: delete one record's DEK and show that record is unrecoverable while the others remain readable.

**V3.5 · Easy · Code · Secret scanner.** Write a scanner that flags AWS keys, private-key blocks and hard-coded passwords in a set of files, and passes a file that only names an environment variable.

## Part 4: Payments

**V4.1 · Medium · Code · Server-side amount.** Given a server price list, compute an order total from a cart and reject a request whose client-sent `amount` or quantities are tampered.

**V4.2 · Medium · Code · Verify a webhook.** Verify an HMAC-signed webhook over the raw body, reject tampering, reject a stale timestamp (replay), and treat a redelivered event id as already processed.

**V4.3 · Medium · Code · Money arithmetic.** Compute 18% GST on ₹2,499.00, split ₹1,000 among three people to the paise, and show why `double` is wrong for each.

**V4.4 · Medium · Code · Idempotent capture.** Make a `capture_payment(order_id, idempotency_key)` that charges once even when called twice concurrently with the same key.

**V4.5 · Medium · Design · PCI scope.** Your startup wants to accept cards and save them for one-click reorder. Describe the integration that keeps you in SAQ A, how saved cards work without storing card numbers, and what you must never store.

## Part 5: OWASP Top 10

**V5.1 · Medium · Debug · IDOR.** An endpoint `GET /api/meters/{id}/readings` checks only that the caller is logged in. Show the exploit and the fix with an ownership check in the query.

**V5.2 · Medium · Code · SQL injection.** Build a tiny login over SQLite, demonstrate a `' OR '1'='1` / comment bypass and a UNION data-exfiltration, then fix both with parameters.

**V5.3 · Medium · Code · Command injection.** A thumbnail feature calls an image tool with `shell=True` and the user's filename. Show an injection (safely, with `echo`) and fix it.

**V5.4 · Medium · Code · Path traversal.** A download endpoint joins a base directory with a user-supplied name. Show `../` escaping the directory and fix it by resolving and checking the path.

**V5.5 · Medium · Code · Mass assignment.** Show that binding a JSON body straight onto a user record lets an attacker set `role` and `is_verified`, then fix it with an allow-list DTO.

**V5.6 · Medium · Code · SSRF.** Write a URL allow-check that blocks the cloud metadata IP, loopback, private ranges and non-http schemes, including the decimal-IP bypass `http://2130706433/`.

**V5.7 · Medium · Code · Security headers.** Audit a set of response headers and report which of HSTS, CSP, X-Content-Type-Options, frame protection and Referrer-Policy are missing or weak.

**V5.8 · Easy · Concept · XSS vs CSRF.** Explain the difference, how each is exploited against a cookie-authenticated app, and the main defences for each.

## Part 6: Privacy and audit

**V6.1 · Medium · Code · Log masking.** Write a logging filter that masks card numbers, emails and bearer tokens, and prove it on a few log lines; explain why masking is only a safety net.

**V6.2 · Medium · Code · Tamper-evident log.** Build a hash-chained audit log, then show that editing or deleting any past entry is detected by verification.

## Part 7: Design

**V7.1 · Hard · Design · Secure password reset.** Design the full flow: requesting a reset, the token, delivery, setting a new password, and all the abuse cases (enumeration, token guessing, token reuse, race conditions, session handling afterwards).

**V7.2 · Hard · Design · Secrets for a 20-service platform.** Design how secrets and keys are managed across twenty microservices and three environments: storage, injection, rotation, least privilege, database credentials, and what happens when one is leaked.
