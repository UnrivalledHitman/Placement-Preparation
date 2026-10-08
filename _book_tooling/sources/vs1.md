# Solutions
%Every program executed with the cryptography, bcrypt, argon2 and PyJWT libraries

## Part 1 solutions

### V1.1 Which primitive?

| Need | Primitive | Why |
|---|---|---|
| Verify a downloaded file is intact | **Hash** (SHA-256) | A published digest detects accidental or malicious changes; integrity only |
| Prove an API request came from a partner who shares a key | **HMAC-SHA256** | Shared-key authenticity and integrity; constant-time verify |
| Encrypt a column of Aadhaar numbers | **AES-256-GCM** (authenticated), key in a KMS | Confidentiality plus tamper detection; associated data binds the row |
| Any service verifies a token only the auth server could create | **Digital signature** (RS256/ES256/EdDSA) | Private key signs, public key verifies everywhere; no shared secret to leak |
| Two servers agree a key over the internet | **Key exchange** (X25519 / ECDHE) | A shared secret derived over an open channel; forward secrecy |

### V1.2 Length-extension

A MAC built as `H(secret ‖ message)` with a Merkle–Damgård hash (MD5, SHA-1, SHA-256) is forgeable: because the hash is the full internal state after processing the input, an attacker who knows the digest and the message length can **continue** hashing from that state and compute a valid MAC for `message ‖ padding ‖ extra` without knowing the secret. HMAC avoids this by nesting two hashes with the key: `H((key ⊕ opad) ‖ H((key ⊕ ipad) ‖ message))`, so the attacker never has the state that would let them extend.

```python run HMAC resists appended data; the naive construction is the wrong tool
import hashlib, hmac, secrets
key = secrets.token_bytes(32)
msg = b'amount=500&to=SM-42'
naive = hashlib.sha256(key + msg).hexdigest()        # the vulnerable construction
good = hmac.new(key, msg, hashlib.sha256).hexdigest()
forged_msg = msg + b'&admin=true'                     # what an attacker wants to authenticate
# With the naive MAC, a length-extension attack produces a valid tag for a message like
# msg + glue_padding + extra, WITHOUT the key. HMAC gives the attacker no usable state:
print('HMAC of the original verifies: ',
      hmac.compare_digest(good, hmac.new(key, msg, hashlib.sha256).hexdigest()))
print('HMAC of the appended message does NOT match the original tag:',
      hmac.compare_digest(good, hmac.new(key, forged_msg, hashlib.sha256).hexdigest()))
print('lesson: authenticate with HMAC(key, msg), never with sha256(key + msg)')
```

### V1.3 Authenticated encryption

```python run AES-256-GCM: tamper, associated data and wrong-key all fail cleanly
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.exceptions import InvalidTag
key = AESGCM.generate_key(bit_length=256)
aes = AESGCM(key)
nonce = os.urandom(12)
ct = aes.encrypt(nonce, b'balance=1200000', b'account:c1')
print('decrypts with the right key and AAD:', aes.decrypt(nonce, ct, b'account:c1'))
cases = [('one bit flipped', key, bytes([ct[0] ^ 1]) + ct[1:], b'account:c1'),
         ('wrong associated data', key, ct, b'account:c2'),
         ('wrong key', AESGCM.generate_key(bit_length=256), ct, b'account:c1')]
for label, k, data, aad in cases:
    try:
        AESGCM(k).decrypt(nonce, data, aad)
    except InvalidTag:
        print(f'{label}: InvalidTag (rejected)')
```

### V1.4 Nonce reuse

```python run Recovering a plaintext from two messages encrypted under the same nonce
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
aes = AESGCM(AESGCM.generate_key(bit_length=256))
nonce = os.urandom(12)                                 # BUG: reused for both
p1 = b'TRANSFER 100000 TO ACCT 9999'
p2 = b'the quick brown fox jumps ok'                   # a message the attacker knows
c1, c2 = aes.encrypt(nonce, p1, None), aes.encrypt(nonce, p2, None)
body = lambda c: c[:-16]                                # drop the 16-byte tag
recovered = bytes(a ^ b ^ k for a, b, k in zip(body(c1), body(c2), p2))
print('recovered secret message:', recovered)
print('matches the real p1:', recovered == p1)
```

The keystream is identical for both, so c1 XOR c2 = p1 XOR p2; XOR-ing in the known p2 reveals p1. (The authentication tags differ because they also depend on the data, but confidentiality is already lost.)

### V1.5 Password entropy and crack time

Entropy = length × log2(alphabet). Offline attacks try the whole space; on average success comes at half of it.

```python run Entropy and average offline crack time for three secrets
import math
def report(name, bits, fast=1e10, slow=1e4):
    space = 2 ** bits
    def human(seconds):
        for unit, s in [('years', 31_557_600), ('days', 86400), ('hours', 3600),
                        ('seconds', 1)]:
            if seconds >= s:
                return f'{seconds / s:.2e} {unit}'
        return f'{seconds:.2e} s'
    print(f'{name:28s} {bits:5.1f} bits | fast hash {human(space / 2 / fast):>16} '
          f'| bcrypt {human(space / 2 / slow):>16}')
report('8 chars from 94 symbols', 8 * math.log2(94))
report('4 words from 7,776', 4 * math.log2(7776))
report('6-digit OTP', math.log2(10 ** 6))
```

The 8-character "complex" password has about 52 bits and falls in minutes to a fast GPU; the four-word passphrase has about 52 bits too but is far easier to remember, and bcrypt makes even that expensive; the 6-digit OTP has only about 20 bits, so it is safe **only** with strict attempt limits and a short lifetime (Section 7.3 of the guide), never as a standalone password.

### V1.6 Constant-time comparison

```python run A naive == leaks via timing; compare_digest does not
import hmac, time
SECRET = 'a' * 32
def naive_equal(a, b):
    if len(a) != len(b):
        return False
    for x, y in zip(a, b):
        if x != y:
            return False                 # returns early on the first difference
    return True
def timed(fn, guess, repeat=20000):
    t = time.perf_counter()
    for _ in range(repeat):
        fn(SECRET, guess)
    return time.perf_counter() - t
for matching in (0, 8, 16, 31):
    guess = 'a' * matching + 'b' * (32 - matching)
    n = timed(naive_equal, guess)
    c = timed(hmac.compare_digest, guess)
    print(f'{matching:2d} leading bytes correct: naive {n:.4f}s, compare_digest {c:.4f}s')
```

The naive comparison takes longer the more leading bytes are correct, because it returns as soon as it finds a mismatch; an attacker measuring response times can recover a secret or a MAC one byte at a time. `hmac.compare_digest` always examines the whole input, so its time does not depend on how much matches. The timings are small and noisy here, but the **trend** (naive rising with the match length, constant-time flat) is the point; always use `compare_digest`, `MessageDigest.isEqual` or similar for secrets.

## Part 2 solutions

### V2.1 Hash and verify a password

```python run Argon2id: hashing, verification and rehashing on stronger parameters
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
ph = PasswordHasher(time_cost=3, memory_cost=64 * 1024, parallelism=1)
h1, h2 = ph.hash('correct horse battery staple'), ph.hash('correct horse battery staple')
print('two hashes of the same password differ (random salt):', h1 != h2)
print('verify correct:', ph.verify(h1, 'correct horse battery staple'))
try:
    ph.verify(h1, 'wrong password')
except VerifyMismatchError:
    print('verify wrong: rejected')
weak = PasswordHasher(time_cost=1, memory_cost=8 * 1024).hash('correct horse battery staple')
print('hash from weaker parameters needs rehash:', ph.check_needs_rehash(weak))
print('current hash needs rehash:', ph.check_needs_rehash(h1))
```

### V2.2 A flawed login

Problems: a **fast unsalted hash** (`sha256`) is trivially cracked from a leak and identical passwords collide; `==` on the hash is a **timing leak**; different messages for "no such user" and "wrong password" (and different timing, since the no-user path skips the hash) allow **user enumeration**; no **rate limit** allows unlimited online guessing.

```python run The fixed login: Argon2id, constant-time behaviour, uniform response, rate limit
import time
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError
ph = PasswordHasher()
users = {'priya': ph.hash('Kolkata@123')}
DUMMY = ph.hash('dummy-to-equalise-timing')            # hashed even when the user is absent
attempts = {}
def login(username, password, now):
    window = attempts.setdefault(username, [])
    window[:] = [t for t in window if now - t < 300]    # last 5 minutes
    if len(window) >= 5:
        return 429, 'too many attempts, try later'
    window.append(now)
    stored = users.get(username, DUMMY)                 # always verify against something
    try:
        ph.verify(stored, password)
        ok = username in users
    except (VerifyMismatchError, VerificationError):
        ok = False
    return (200, 'welcome') if ok else (401, 'invalid username or password')  # one message
print('correct:        ', login('priya', 'Kolkata@123', 1000))
print('wrong password: ', login('priya', 'wrong', 1001))
print('unknown user:   ', login('ghost', 'whatever', 1002))
for i in range(5):
    last = login('priya', 'x', 1100 + i)
print('after 5 failures:', last)
```

### V2.3 Sign and verify a JWT

```python run Issuing and validating a JWT, with the failure cases
import time
import jwt
KEY = 'o7Qf2mZ9kR4tW1pL6xB3vN8cH5sJ0dYe'
now = int(time.time())
claims = {'sub': 'c1', 'role': 'customer', 'exp': now + 900}
token = jwt.encode(claims, KEY, algorithm='HS256')
print('valid token subject:', jwt.decode(token, KEY, algorithms=['HS256'])['sub'])
checks = [
    ('expired', jwt.encode({'sub': 'c1', 'exp': now - 1}, KEY, algorithm='HS256'), KEY),
    ('wrong key', token, 'a-different-signing-key-value!!'),
]
for label, tok, key in checks:
    try:
        jwt.decode(tok, key, algorithms=['HS256'])
    except jwt.InvalidTokenError as e:
        print(f'{label}: rejected ({type(e).__name__})')
none_tok = jwt.encode({'sub': 'c1', 'role': 'admin'}, key='', algorithm='none')
try:
    jwt.decode(none_tok, KEY, algorithms=['HS256'])
except jwt.InvalidTokenError as e:
    print('alg=none: rejected (' + type(e).__name__ + ')')
```

### V2.4 TOTP with drift

```python run TOTP accepting one step of drift, and rejecting a reused code
import hashlib, hmac, struct
def totp(secret, t, step=30, digits=6):
    counter = t // step
    mac = hmac.new(secret, struct.pack('>Q', counter), hashlib.sha1).digest()
    off = mac[-1] & 0x0F
    num = struct.unpack('>I', mac[off:off + 4])[0] & 0x7FFFFFFF
    return str(num % 10 ** digits).zfill(digits)
spent = set()
def verify(secret, code, t, step=30):
    counter = t // step
    for c in (counter - 1, counter, counter + 1):       # accept +/- one step for clock drift
        if hmac.compare_digest(totp(secret, c * step), code):
            if c in spent:
                return 'reused code, rejected'
            spent.add(c)
            return f'accepted (step offset {c - counter})'
    return 'invalid code'
secret = b'12345678901234567890'
t = 1700000000
print('current-step code:', verify(secret, totp(secret, t), t))
print('previous-step code:', verify(secret, totp(secret, t - 30), t))
print('same code again:  ', verify(secret, totp(secret, t), t))
print('random code:      ', verify(secret, '000000', t))
```

Accepting one step either side (a 90-second window) tolerates clock drift between the phone and the server; recording spent counters stops an intercepted code from being replayed within that window.

### V2.5 Session vs JWT for a bank

A bank needs **instant** logout-everywhere and the ability to revoke a compromised session, which stateless long-lived JWTs cannot do (a signed token is valid until it expires). It also needs per-request authorisation across many services, which JWTs do cheaply (any service verifies the signature without a central lookup). The practical answer combines them: **short-lived access tokens** (JWT, 5–10 minutes, signed with the auth server's private key, verified by each service) plus **refresh tokens** held in `HttpOnly; Secure; SameSite` cookies and stored server-side so they can be revoked. Logout and "sign out everywhere" revoke the refresh tokens (and add the user or token family to a short deny-list that services check), so access ends within the access-token lifetime at worst. Sensitive actions (a transfer) require step-up authentication regardless of the token.

### V2.6 PKCE

```python run PKCE S256: verify the right verifier, reject a wrong one, require S256
import base64, hashlib, secrets
b64 = lambda b: base64.urlsafe_b64encode(b).decode().rstrip('=')
verifier = b64(secrets.token_bytes(32))
challenge = b64(hashlib.sha256(verifier.encode()).digest())
def token_endpoint(stored_challenge, method, presented):
    if method != 'S256':
        return 'rejected: server requires method S256'
    computed = b64(hashlib.sha256(presented.encode()).digest())
    ok = secrets.compare_digest(computed, stored_challenge)
    return 'issued tokens' if ok else 'rejected'
print('correct verifier:', token_endpoint(challenge, 'S256', verifier))
print('wrong verifier:  ', token_endpoint(challenge, 'S256', b64(secrets.token_bytes(32))))
print('plain method:    ', token_endpoint(verifier, 'plain', verifier))
```

Requiring S256 (not `plain`, where the challenge equals the verifier) means that even an attacker who intercepts the authorization request cannot derive the verifier from the challenge.
