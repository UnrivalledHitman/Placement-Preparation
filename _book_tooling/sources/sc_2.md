# Chapter 5: Encryption at Rest, Key Management and Secrets
%Protecting stored data, managing the keys that protect it, and keeping secrets out of code

## 5.1 Layers of encryption at rest

"Encrypted at rest" can mean very different things. What matters is **who can decrypt**, which decides which attacks each layer stops.

| Layer | How | Stops | Does not stop |
|---|---|---|---|
| Full-disk / volume (LUKS, BitLocker, cloud EBS/Persistent Disk encryption) | The storage device encrypts everything; keys held by the OS or cloud | A stolen disk or laptop, a discarded drive | Anyone who can log in to the running server, SQL injection, a stolen backup taken through the database |
| Database TDE (Transparent Data Encryption: MySQL, SQL Server, Oracle) | The database encrypts its files and backups | Stolen data files and backup media | Any query through the database, including injection and over-privileged users |
| **Application-level (field) encryption** | The application encrypts chosen fields (PAN, Aadhaar number, bank account) before storing them; keys in a KMS | Database dumps, SQL injection reading the column, DBAs, leaked backups | A compromised application server (it can decrypt), unless decryption is further restricted |
| Client-side / end-to-end | Data encrypted on the user's device; the server never has the key | Everything on the server side | Lost keys (no recovery), server-side search and processing |

Use disk encryption everywhere (it is cheap and usually one setting), and field-level encryption for the most sensitive identifiers.

## 5.2 Envelope encryption with a KMS

Encrypting every record directly with one master key creates two problems: the master key must be present in every application server, and rotating it means re-encrypting all data. **Envelope encryption** solves both:

- A **key encryption key** (KEK, "master key") lives inside a **KMS** (AWS KMS, Google Cloud KMS, Azure Key Vault, HashiCorp Vault) or an HSM and **never leaves it**; applications ask the KMS to encrypt or decrypt small values with it, and every use is checked against an access policy and logged.
- Each record (or each customer, or file) gets a random **data encryption key** (DEK). The data is encrypted locally with the DEK (AES-GCM); the DEK is sent to the KMS to be encrypted ("wrapped") with the KEK; the **wrapped DEK** is stored next to the ciphertext.
- To read, the application sends the wrapped DEK to the KMS, gets the plaintext DEK back (if allowed), and decrypts locally.

```python run Envelope encryption with a toy KMS: wrapping, auditing and policy checks
import os, json
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
class ToyKMS:                                    # stands in for AWS KMS / Vault Transit
    def __init__(self):
        self.keys = {'meter-pii': {1: AESGCM.generate_key(bit_length=256)}}
        self.current = {'meter-pii': 1}
        self.policy = {'billing-service': {'encrypt', 'decrypt'}, 'analytics': {'encrypt'}}
        self.audit = []
    def _check(self, caller, op):
        allowed = op in self.policy.get(caller, set())
        self.audit.append(f'{caller} {op} {"ALLOWED" if allowed else "DENIED"}')
        if not allowed:
            raise PermissionError(f'{caller} may not {op}')
    def wrap(self, caller, key_id, dek):
        self._check(caller, 'encrypt')
        v = self.current[key_id]; nonce = os.urandom(12)
        return {'key': key_id, 'v': v, 'n': nonce.hex(),
                'ct': AESGCM(self.keys[key_id][v]).encrypt(nonce, dek, key_id.encode()).hex()}
    def unwrap(self, caller, w):
        self._check(caller, 'decrypt')
        kek = AESGCM(self.keys[w['key']][w['v']])
        return kek.decrypt(bytes.fromhex(w['n']), bytes.fromhex(w['ct']), w['key'].encode())
kms = ToyKMS()
def encrypt_record(caller, record_id, plaintext):
    dek = AESGCM.generate_key(bit_length=256); nonce = os.urandom(12)
    ct = AESGCM(dek).encrypt(nonce, plaintext.encode(), record_id.encode())
    return {'id': record_id, 'nonce': nonce.hex(), 'ct': ct.hex(),
            'wrapped_dek': kms.wrap(caller, 'meter-pii', dek)}       # store all of this
def decrypt_record(caller, row):
    dek = kms.unwrap(caller, row['wrapped_dek'])
    return AESGCM(dek).decrypt(bytes.fromhex(row['nonce']), bytes.fromhex(row['ct']),
                               row['id'].encode()).decode()
row = encrypt_record('billing-service', 'cust-c1', 'Aadhaar 1234 5678 9012')
print('stored row fields:', list(row), '| ciphertext bytes:', len(bytes.fromhex(row['ct'])))
print('billing-service reads:', decrypt_record('billing-service', row))
try:
    decrypt_record('analytics', row)
except PermissionError as e:
    print('analytics reads:', e)
print('KMS audit log:', kms.audit)
```

The database row alone is useless to an attacker: the DEK inside it is wrapped by a key that never left the KMS, and each unwrap needs the right identity and leaves an audit record. The analytics service may encrypt new records but not read existing ones: least privilege at the key level.

## 5.3 Key rotation and crypto-shredding

Keys should be rotated: periodically (yearly is common for KEKs), when people with access leave, and immediately after suspected compromise. With envelope encryption, rotating the KEK means **re-wrapping the small DEKs** with the new KEK version, not re-encrypting the data. Old KEK versions stay available for decryption until everything is re-wrapped.

**Crypto-shredding**: if each customer's data is encrypted under that customer's own DEK, deleting that one key makes all their data, including copies in backups, permanently unreadable. It is a practical way to honour "right to erasure" requests in systems with immutable backups and logs.

```python run Rotating the KEK by re-wrapping DEKs, and crypto-shredding one customer
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.exceptions import InvalidTag
kek = {1: AESGCM.generate_key(bit_length=256)}
def wrap(dek, v):
    n = os.urandom(12); return (v, n, AESGCM(kek[v]).encrypt(n, dek, None))
def unwrap(w):
    v, n, ct = w; return AESGCM(kek[v]).decrypt(n, ct, None)
customers = {}
for c in ['c1', 'c2', 'c3']:
    dek = AESGCM.generate_key(bit_length=256); n = os.urandom(12)
    data = AESGCM(dek).encrypt(n, f'{c}: 5 years of readings '.encode() * 20000, None)
    customers[c] = {'wrapped': wrap(dek, 1), 'n': n, 'data': data}
total = sum(len(c['data']) for c in customers.values())
kek[2] = AESGCM.generate_key(bit_length=256)                     # new KEK version
rewrapped = 0
for c in customers.values():
    c['wrapped'] = wrap(unwrap(c['wrapped']), 2); rewrapped += len(c['wrapped'][2])
del kek[1]                                                         # retire the old version
print(f'rotation re-encrypted {rewrapped} bytes of DEKs instead of {total:,} bytes of data')
print('c2 still readable after rotation:',
      AESGCM(unwrap(customers['c2']['wrapped'])).decrypt(customers['c2']['n'],
                                                         customers['c2']['data'], None)[:27])
customers['c1']['wrapped'] = None                                  # erase c1's key only
backup_of_c1 = customers['c1']['data']                   # the ciphertext lives on in backups
try:                                                # without the DEK, any key guess fails
    guess = AESGCM(AESGCM.generate_key(bit_length=256))
    guess.decrypt(customers['c1']['n'], backup_of_c1, None)
except InvalidTag:
    print('c1 after crypto-shredding: unreadable, even from backups')
```

## 5.4 Searching encrypted data: blind indexes

Encrypted fields cannot be searched with `WHERE email = ?`, because AES-GCM with random nonces gives a different ciphertext each time. A **blind index** stores a keyed hash (HMAC with a separate secret key) of the normalised value next to the ciphertext; lookups compute the same HMAC. It reveals only equality (two rows with the same email), so use it only for fields that need exact-match search.

```python run A blind index for looking up customers by encrypted email
import hmac, hashlib, os, secrets
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
enc_key, index_key = AESGCM.generate_key(bit_length=256), secrets.token_bytes(32)
def blind(email):
    normalised = email.strip().lower().encode()
    return hmac.new(index_key, normalised, hashlib.sha256).hexdigest()[:32]
rows = []
for email in ['Priya@Example.com', 'arjun@example.com', 'meera@example.com']:
    n = os.urandom(12)
    rows.append({'email_ct': AESGCM(enc_key).encrypt(n, email.encode(), None), 'n': n,
                 'email_idx': blind(email)})
print('same email encrypted twice gives different ciphertexts:',
      AESGCM(enc_key).encrypt(os.urandom(12), b'x', None) !=
      AESGCM(enc_key).encrypt(os.urandom(12), b'x', None))
hit = [r for r in rows if r['email_idx'] == blind(' priya@example.COM ')]
found = AESGCM(enc_key).decrypt(hit[0]['n'], hit[0]['email_ct'], None)
print('lookup by blind index found:', found)
```

## 5.5 Secrets management

A **secret** is anything that grants access: database passwords, API keys, signing keys, webhook secrets, OAuth client secrets, TLS private keys.

| Rule | How |
|---|---|
| Never in source code or Git history | Secret scanning in CI and pre-commit hooks (gitleaks, GitHub secret scanning); a leaked key must be **rotated**, not just deleted from the repo |
| Store in a secret manager | AWS Secrets Manager, GCP Secret Manager, Azure Key Vault, HashiCorp Vault; Kubernetes Secrets encrypted at rest with a KMS provider |
| Inject at run time | Environment variables or mounted files from the manager; never baked into images |
| Prefer identities over secrets | Cloud IAM roles for workloads (IRSA, Workload Identity), mTLS between services, short-lived credentials (Vault dynamic database users) |
| Least privilege and audit | Each service reads only its own secrets; every access logged |
| Rotate | Automatically and after every suspected exposure or staff change |

```python run A tiny secret scanner of the kind run in CI
import re
files = {
    'src/config/app.properties': 'db.url=jdbc:mysql://db/meters\ndb.password=Meter@2026!\n',
    'src/pay/Client.java': 'String key = "rzp_live_' + 'Q2x9VbN3mT7kLp";\n',
    'deploy/aws.env': 'AWS_ACCESS_KEY_ID=AKIA' + 'IOSFODNN7EXAMPLE\nREGION=ap-south-1\n',
    'docs/README.md': 'Set DB_PASSWORD from the secret manager.\n',
    'keys/server.key': '-----BEGIN ' + 'PRIVATE KEY-----\nMIGHAgEAMBMG...\n',
}
rules = {'AWS access key id': r'AKIA[0-9A-Z]{16}',
         'Razorpay live key': r'rzp_live_[A-Za-z0-9]{10,}',
         'private key block': r'-----BEGIN (?:RSA |EC )?PRIVATE KEY-----',
         'hard-coded password': r'(?i)(password|passwd|pwd)\s*[=:]\s*[^\s$]{6,}'}
for path, text in files.items():
    for name, rx in rules.items():
        for m in re.finditer(rx, text):
            line = text[:m.start()].count('\n') + 1
            print(f'{path}: {name}: {m.group(0)[:12]}... (line {line})')
```

Four of the five files contain secrets; the README, which only names the variable, is clean. (The AWS key is the documentation example `AKIAIOSFODNN7EXAMPLE`, and the strings are split in the source only so that this book's own repository does not trigger real scanners.)

## 5.6 Spring equivalents and practical lessons

| Concept | Java / Spring |
|---|---|
| Field encryption | A JPA `AttributeConverter` calling an envelope-encryption service; Google Tink; AWS Encryption SDK |
| KMS / Vault | AWS SDK KMS client; Spring Cloud Vault (dynamic DB credentials, Transit engine) |
| Secrets | Spring Cloud AWS Secrets Manager / Vault config; `@ConfigurationProperties` from injected env vars |

- Disk encryption everywhere; field-level envelope encryption for the most sensitive values.
- KEKs stay in a KMS/HSM with policies and audit; DEKs per record or customer; rotate by re-wrapping.
- Per-customer DEKs enable crypto-shredding; blind indexes allow exact-match search.
- Secrets live in a manager, are injected at run time, scanned for in CI, and rotated when exposed.

# Chapter 6: Payment Security
%How online payments work, PCI DSS scope, signatures, webhooks, idempotency and reconciliation

## 6.1 How an online card or UPI payment flows

A merchant almost never handles card numbers directly. It integrates with a **payment service provider (PSP)** or gateway (Razorpay, PayU, Cashfree, Stripe, Adyen), which talks to card networks (Visa, Mastercard, RuPay) and banks, or to UPI through NPCI.

1. **Create an order on the server**: the back end computes the amount from its own prices and the cart, stores an order (`created`), and asks the PSP to create a matching order with that amount and an idempotency key. The PSP returns an order id.
2. **Checkout on the client**: the front end opens the PSP's **hosted checkout** or embedded fields (an iframe or SDK served by the PSP). Card details or the UPI flow go **directly to the PSP**, never through the merchant's servers.
3. **Authentication**: the customer completes 3-D Secure / OTP for cards (mandatory additional factor for most domestic card payments in India) or approves the UPI request in their app.
4. **Authorisation and capture**: the issuer authorises; the payment is **captured** (automatically or by a later API call; reserved but uncaptured amounts expire).
5. **Client callback**: the checkout returns a payment id and a **signature** to the front end, which sends them to the back end. The back end **verifies the signature** before showing success.
6. **Webhook**: the PSP calls the merchant's webhook endpoint (`payment.captured`, `payment.failed`, `refund.processed`), signed with a webhook secret. This is the reliable source of truth, because the browser may close before step 5.
7. **Fulfilment**: the back end marks the order paid **idempotently** (whichever of step 5 or 6 arrives first) and fulfils it.
8. **Settlement and reconciliation**: the PSP settles funds (minus fees) to the merchant's bank, typically T+1 or T+2; a daily job reconciles internal orders with the PSP's settlement report.

## 6.2 PCI DSS and staying out of scope

The **Payment Card Industry Data Security Standard** (PCI DSS v4.0) applies to every system that stores, processes or transmits cardholder data. Its requirements (network security, encryption, access control, logging, vulnerability management, testing) are demanding and audited. The most effective strategy is to **minimise scope**:

| Integration | What touches card data | PCI self-assessment |
|---|---|---|
| Hosted payment page or redirect | Only the PSP | SAQ A (the lightest) |
| PSP-hosted fields in an iframe on your page | Only the PSP (but your page could be tampered with to skim cards) | SAQ A (with script-integrity requirements in v4.0) |
| Your own form posting card data via JavaScript to the PSP | Your page's scripts | SAQ A-EP |
| Card data reaching your servers | Your servers, networks, people | SAQ D: the full standard |

Rules that apply whatever the integration: **never store the CVV/CVC** (not even encrypted, not even temporarily in logs); display at most the first six and last four digits of a card number; keep card numbers out of logs, analytics and error reports. In India, RBI rules additionally prohibit merchants from storing card numbers at all: saved cards use **card-on-file tokenisation** (CoFT) by the networks, and the merchant keeps only the token.

## 6.3 Never trust the amount from the client

```python run The client says "amount: 1"; the server must not care
PRICES = {'smart-plug': 149900, 'meter-sensor': 520000}         # paise (₹1,499.00, ₹5,200.00)
def create_order_insecure(request):
    return {'amount': request['amount']}                         # trusts the browser
def create_order_secure(request):
    total = 0
    for item in request['items']:
        if item['sku'] not in PRICES or not 1 <= int(item['qty']) <= 10:
            raise ValueError('invalid item')
        total += PRICES[item['sku']] * int(item['qty'])           # server-side price list
    return {'amount': total}
tampered = {'items': [{'sku': 'meter-sensor', 'qty': 2}], 'amount': 100}  # edited in DevTools
print('insecure order amount (paise):', create_order_insecure(tampered)['amount'])
print('secure order amount (paise):  ', create_order_secure(tampered)['amount'])
for bad in [{'items': [{'sku': 'meter-sensor', 'qty': -5}]},
            {'items': [{'sku': 'free-tv', 'qty': 1}]}]:
    try:
        create_order_secure(bad)
    except ValueError as e:
        print('rejected:', bad['items'][0], '->', e)
```

The same principle covers discounts and coupons (validated on the server, once per customer), currency, the order the payment belongs to, and the payment status itself: the server confirms with the PSP's signature or API, never from a `status=success` query parameter on the return URL.

## 6.4 Verifying the payment signature and webhooks

PSPs sign what they send with a secret shared with the merchant (HMAC-SHA256). Razorpay, for example, returns `razorpay_signature = HMAC_SHA256(order_id + "|" + payment_id, key_secret)` to the client after checkout; Stripe signs webhooks with a header `t=<timestamp>,v1=HMAC(t + "." + body)`. The server recomputes and compares in constant time, **rejects old timestamps** (replay protection) and **deduplicates by event id** (webhooks are delivered at least once).

```python run Verifying a signed webhook: tampering, replay and duplicate deliveries
import hashlib, hmac, json, time
WEBHOOK_SECRET = b'whsec_test_8f3kQ1vZ7xN2pR5t'
def psp_send(event, ts=None):                     # what the payment provider sends
    body = json.dumps(event, separators=(',', ':')).encode()
    ts = ts or int(time.time())
    sig = hmac.new(WEBHOOK_SECRET, f'{ts}.'.encode() + body, hashlib.sha256).hexdigest()
    return {'Signature': f't={ts},v1={sig}'}, body
processed, orders = set(), {'ord_91': 'created'}
def webhook(headers, body, now=None, tolerance=300):
    parts = dict(p.split('=', 1) for p in headers['Signature'].split(','))
    expected = hmac.new(WEBHOOK_SECRET, f'{parts["t"]}.'.encode() + body,
                        hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, parts['v1']):
        return 400, 'bad signature'
    if abs((now or time.time()) - int(parts['t'])) > tolerance:
        return 400, 'timestamp outside tolerance (possible replay)'
    event = json.loads(body)                        # parse only AFTER verifying the raw body
    if event['id'] in processed:
        return 200, 'duplicate, already processed'
    processed.add(event['id'])
    if event['type'] == 'payment.captured':
        orders[event['order_id']] = 'paid'
    return 200, 'processed'
evt = {'id': 'evt_1', 'type': 'payment.captured', 'order_id': 'ord_91', 'amount': 1040000}
h, body = psp_send(evt)
print('genuine:      ', webhook(h, body))
print('redelivered:  ', webhook(h, body))
print('tampered:     ', webhook(h, body.replace(b'1040000', b'100')))
old_h, old_body = psp_send({**evt, 'id': 'evt_2'}, ts=int(time.time()) - 3600)
print('replayed (1 h old):', webhook(old_h, old_body))
print('order state:', orders)
```

Two details matter in real code: verify the signature over the **raw request body** exactly as received (parsing and re-serialising JSON changes bytes and breaks the check), and make the processing idempotent and quick: acknowledge with 2xx promptly and do slow work asynchronously, or the PSP will retry and you will process the event again.

## 6.5 Money in code

```python run Never floats for money: paise as integers, Decimal for rates, explicit rounding
from decimal import Decimal, ROUND_HALF_UP, ROUND_HALF_EVEN
print('float: 0.1 + 0.2 =', 0.1 + 0.2, '| 3 x ₹1.10 =', 3 * 1.10)
print('paise: 10 + 20 =', 10 + 20, 'paise | 3 x 110 =', 3 * 110, 'paise')
taxable = Decimal('1499.00'); gst = Decimal('0.18')
print('GST on ₹1,499.00 =', (taxable * gst).quantize(Decimal('0.01'), ROUND_HALF_UP))
for amount in ['2.665', '2.675']:
    v = Decimal(amount)
    print(f'{amount}: half-up {v.quantize(Decimal("0.01"), ROUND_HALF_UP)}, '
          f'banker\'s {v.quantize(Decimal("0.01"), ROUND_HALF_EVEN)}, '
          f'float round {round(float(amount), 2)}')
split = 100_00                                       # split ₹100.00 three ways, in paise
shares = [split // 3 + (1 if i < split % 3 else 0) for i in range(3)]
print('₹100 split three ways (paise):', shares, '| sum', sum(shares))
```

Store amounts as integers in the smallest unit (paise, cents) or as fixed-point decimals (`DECIMAL(12,2)`, Java `BigDecimal`), never `double`. Agree the rounding rule per tax and per regulator (half-up for GST invoices), and distribute remainders explicitly when splitting so that the parts add up to the whole: `float` rounding of 2.675 gives 2.67 because 2.675 is stored as 2.67499999....

## 6.6 Refunds and race conditions

Two refund requests for the same payment, processed concurrently, must not refund more than was captured. Make the check and the update one atomic statement (or lock the row), and pass an idempotency key to the PSP for each refund.

```python run Two app servers refund concurrently: read-check-write versus a conditional update
import sqlite3
db = sqlite3.connect(':memory:', isolation_level=None)          # autocommit per statement
def reset():
    db.execute('DROP TABLE IF EXISTS payment')
    db.execute('CREATE TABLE payment (id TEXT PRIMARY KEY, captured INT, refunded INT)')
    db.execute("INSERT INTO payment VALUES ('pay_1', 100000, 0)")
def state():
    return db.execute('SELECT captured, refunded FROM payment').fetchone()
reset()                                       # naive: both servers read before either writes
a_read = db.execute("SELECT refunded FROM payment WHERE id = 'pay_1'").fetchone()[0]
b_read = db.execute("SELECT refunded FROM payment WHERE id = 'pay_1'").fetchone()[0]
for server, read in (('A', a_read), ('B', b_read)):   # each checks its own (stale) reading
    if read + 60000 <= 100000:
        print(f'server {server}: saw refunded={read}, calls the PSP to refund ₹600')
        db.execute("UPDATE payment SET refunded = ? WHERE id = 'pay_1'", (read + 60000,))
print('read-check-write: captured, refunded =', state(), '<- and a lost update in the DB')
reset()                                       # atomic: the check happens inside the UPDATE
for server in ('A', 'B'):
    cur = db.execute('UPDATE payment SET refunded = refunded + ? '
                     'WHERE id = ? AND refunded + ? <= captured', (60000, 'pay_1', 60000))
    print(f'server {server}: conditional update ->',
          'refunded ₹600' if cur.rowcount == 1 else 'REJECTED (would exceed captured)')
print('conditional update: captured, refunded =', state())
```

In the naive version both servers read `refunded = 0`, both decided ₹600 was allowed, and both asked the PSP for a refund: ₹1,200 returned on a ₹1,000 payment, while the database shows only ₹600 refunded because the second write overwrote the first (a lost update). In the conditional version the database evaluates the check and applies the change as one atomic statement, so whichever server comes second is refused, whatever the timing. `SELECT ... FOR UPDATE` in a transaction, or optimistic locking with a version column (`@Version` in JPA), achieve the same.

## 6.7 Fraud and operational controls

- **Velocity limits**: payments per card, device, account and IP per hour; new-account limits.
- **Risk signals**: mismatched billing country and IP, many failed attempts (card testing), disposable emails; PSP fraud scores.
- **Card testing protection**: rate limits and CAPTCHA on checkout; never reveal which field (number, expiry, CVV) was wrong.
- **Reconciliation**: daily matching of orders, PSP payments and settlements; alert on any mismatch (paid at the PSP but not fulfilled, fulfilled but not paid).
- **Chargebacks and disputes**: keep evidence (delivery proof, logs); monitor rates.
- **Access**: the PSP dashboard with MFA and least privilege; live API keys only in the secret manager; separate test and live keys.

## 6.8 Practical lessons

- Server creates orders with server-side prices; the client never decides amounts or status.
- Card data goes straight to the PSP (hosted fields/checkout): that keeps you in SAQ A; never store CVV; tokenise saved cards.
- Verify every PSP signature over the raw body with constant-time comparison; reject old timestamps; deduplicate events; treat webhooks as the source of truth.
- Money as integer minor units or decimals with explicit rounding; atomic conditional updates for refunds; idempotency keys on every PSP call; reconcile daily.
