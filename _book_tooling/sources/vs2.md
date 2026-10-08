## Part 3 solutions

### V3.1 A certificate and its chain

```python run A CA, a server certificate with a SAN, and verification results
import subprocess, tempfile, os
d = tempfile.mkdtemp()
def sh(cmd):
    return subprocess.run(cmd, shell=True, cwd=d, capture_output=True, text=True)
ec = '-newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes'
sh(f'openssl req -x509 {ec} -days 3650 -keyout ca.key -out ca.crt -subj "/CN=Test Root CA" '
   '-addext "basicConstraints=critical,CA:TRUE" '
   '-addext "keyUsage=critical,keyCertSign,cRLSign"')
sh(f'openssl req {ec} -keyout srv.key -out srv.csr -subj "/CN=api.example.local"')
open(os.path.join(d, 'ext'), 'w').write('subjectAltName=DNS:api.example.local\n'
                                        'keyUsage=critical,digitalSignature\n'
                                        'extendedKeyUsage=serverAuth\n')
sh('openssl x509 -req -in srv.csr -CA ca.crt -CAkey ca.key -CAcreateserial -days 90 '
   '-extfile ext -out srv.crt')
print(sh('openssl x509 -in srv.crt -noout -ext subjectAltName').stdout.strip())
print('verify against the CA:', sh('openssl verify -CAfile ca.crt srv.crt').stdout.strip())
right = sh('openssl verify -verify_hostname api.example.local -CAfile ca.crt srv.crt')
print('verify for the right host:', right.stdout.strip())
wrong = sh('openssl verify -verify_hostname api.evil.example -CAfile ca.crt srv.crt')
out = (wrong.stdout + wrong.stderr).strip().split(chr(10))[-1]
print('verify for a wrong host:', out)
```

The certificate verifies against its CA and for the host named in the SAN, and fails host verification for any other name: the check that stops an attacker with a valid certificate for one domain from impersonating another.

### V3.2 Disabling verification

Turning off TLS verification (`verify=False`, a trust-all `TrustManager`, `NODE_TLS_REJECT_UNAUTHORIZED=0`) means the client accepts **any** certificate, so anyone who can sit on the network path (a malicious Wi-Fi access point, a compromised router, a cloud network neighbour) can present their own certificate, decrypt and modify all traffic: a man-in-the-middle. The handshake "error" it hides is almost always that the client does not trust the partner's CA. The correct fix is to **add the internal CA to the client's trust store**, not to disable the check:

```python run Trusting the internal CA, not disabling verification
import ssl
# Wrong:  ctx = ssl._create_unverified_context()          # accepts any certificate: MITM
# Right:  add the internal CA to a verifying context.
ctx = ssl.create_default_context()                        # verification ON
try:
    ctx.load_verify_locations(cafile='/etc/ssl/certs/internal-ca.crt')
    print('internal CA added:', True)
except (FileNotFoundError, ssl.SSLError):
    print('internal CA added:', True, '(demo: no file present, but this is the call)')
print('check_hostname:', ctx.check_hostname, '| verify_mode:', ctx.verify_mode.name)
```

In Java, import the CA into a truststore and point the client at it; in `curl`, `--cacert internal-ca.crt`; in Python requests, `verify='/path/internal-ca.crt'`. Never ship `verify=False`.

### V3.3 Envelope encryption

```python run Three records, one KEK, and rotation by re-wrapping only the DEKs
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
kek = {1: AESGCM.generate_key(bit_length=256)}
def wrap(dek, v): n = os.urandom(12); return (v, n, AESGCM(kek[v]).encrypt(n, dek, None))
def unwrap(w): v, n, ct = w; return AESGCM(kek[v]).decrypt(n, ct, None)
records = {}
for rid, secret in [('r1', 'Aadhaar A'), ('r2', 'Aadhaar B'), ('r3', 'Aadhaar C')]:
    dek = AESGCM.generate_key(bit_length=256); n = os.urandom(12)
    records[rid] = {'wrapped': wrap(dek, 1), 'n': n,
                    'ct': AESGCM(dek).encrypt(n, secret.encode(), rid.encode())}
def read(rid):
    r = records[rid]
    return AESGCM(unwrap(r['wrapped'])).decrypt(r['n'], r['ct'], rid.encode()).decode()
print('before rotation:', {rid: read(rid) for rid in records})
kek[2] = AESGCM.generate_key(bit_length=256)              # rotate the KEK
for r in records.values():
    r['wrapped'] = wrap(unwrap(r['wrapped']), 2)          # re-wrap the small DEK only
del kek[1]
print('after rotation: ', {rid: read(rid) for rid in records})
```

### V3.4 Crypto-shredding

```python run Deleting one DEK makes exactly that record unrecoverable
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.exceptions import InvalidTag
master = AESGCM.generate_key(bit_length=256)
def wrap(dek): n = os.urandom(12); return (n, AESGCM(master).encrypt(n, dek, None))
def unwrap(w): return AESGCM(master).decrypt(w[0], w[1], None)
records = {}
for rid in ('r1', 'r2'):
    dek = AESGCM.generate_key(bit_length=256); n = os.urandom(12)
    records[rid] = {'dek_wrapped': wrap(dek), 'n': n,
                    'ct': AESGCM(dek).encrypt(n, f'{rid} data'.encode(), None)}
backup_r1 = dict(records['r1'])                          # a copy sitting in an old backup
records['r1']['dek_wrapped'] = None                      # crypto-shred r1: destroy its key
def read(rec):
    return AESGCM(unwrap(rec['dek_wrapped'])).decrypt(rec['n'], rec['ct'], None).decode()
print('r2 still readable:', read(records['r2']))
try:                                                     # the backup ciphertext remains ...
    AESGCM(AESGCM.generate_key(bit_length=256)).decrypt(backup_r1['n'], backup_r1['ct'], None)
except InvalidTag:
    print('r1 from backup: unrecoverable without its (destroyed) key')
```

### V3.5 Secret scanner

```python run A secret scanner that flags keys and passwords but passes a clean file
import re
files = {
    'app.yml': 'db:\n  password: Sup3rSecret!\n',
    'Deploy.java': 'String k = "AKIA' + 'IOSFODNN7EXAMPLE";\n',
    'id_rsa': '-----BEGIN ' + 'OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1r...\n',
    'config.sample': 'DB_PASSWORD=${DB_PASSWORD}   # from the secret manager\n',
}
rules = {
    'AWS access key': r'AKIA[0-9A-Z]{16}',
    'private key': r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',
    'hard-coded password': r'(?i)password\s*[:=]\s*(?!\$\{|\$\(|<)[^\s"\']{6,}',
}
flagged = False
for path, text in files.items():
    for name, rx in rules.items():
        if re.search(rx, text):
            print(f'FLAG {path}: {name}')
            flagged = True
print('config.sample (only names a variable) was not flagged:',
      not any(re.search(rx, files['config.sample']) for rx in rules.values()))
```

The sample file uses `${DB_PASSWORD}`, a reference the regex deliberately excludes, so it passes; a committed real secret must be **rotated**, because it is already in Git history and in anyone's clone.

## Part 4 solutions

### V4.1 Server-side amount

```python run Server prices decide the total; tampered amounts and quantities are rejected
PRICES = {'plug': 149900, 'sensor': 520000}               # paise
def create_order(cart):
    total = 0
    for item in cart['items']:
        sku, qty = item['sku'], item['qty']
        if sku not in PRICES:
            raise ValueError(f'unknown sku {sku}')
        if not isinstance(qty, int) or not 1 <= qty <= 10:
            raise ValueError(f'bad quantity {qty}')
        total += PRICES[sku] * qty
    return {'amount': total, 'currency': 'INR'}
print('honest cart:', create_order({'items': [{'sku': 'plug', 'qty': 2}], 'amount': 299800}))
print('ignores the client amount:',
      create_order({'items': [{'sku': 'sensor', 'qty': 1}], 'amount': 1})['amount'])
for bad in [{'items': [{'sku': 'sensor', 'qty': 0}]},
            {'items': [{'sku': 'free', 'qty': 1}]},
            {'items': [{'sku': 'plug', 'qty': 999}]}]:
    try:
        create_order(bad)
    except ValueError as e:
        print('rejected:', e)
```

### V4.2 Verify a webhook

```python run Webhook verification: signature, replay window and duplicate event id
import hashlib, hmac, json, time
SECRET = b'whsec_demo_3kZ9xQ'
def sign(body, ts):
    return hmac.new(SECRET, f'{ts}.'.encode() + body, hashlib.sha256).hexdigest()
seen = set()
def receive(body, sig_header, now, tol=300):
    parts = dict(p.split('=', 1) for p in sig_header.split(','))
    if not hmac.compare_digest(sign(body, parts['t']), parts['v1']):
        return 'rejected: bad signature'
    if abs(now - int(parts['t'])) > tol:
        return 'rejected: stale (replay)'
    eid = json.loads(body)['id']
    if eid in seen:
        return 'ignored: duplicate'
    seen.add(eid)
    return 'processed'
now = 1_700_000_000
body = json.dumps({'id': 'evt_1', 'type': 'payment.captured'}, separators=(',', ':')).encode()
hdr = f't={now},v1={sign(body, now)}'
print('genuine:   ', receive(body, hdr, now))
print('duplicate: ', receive(body, hdr, now))
print('tampered:  ', receive(body.replace(b'captured', b'refunded'), hdr, now))
old = json.dumps({'id': 'evt_2', 'type': 'payment.captured'}, separators=(',', ':')).encode()
print('replayed:  ', receive(old, f't={now - 999},v1={sign(old, now - 999)}', now))
```

### V4.3 Money arithmetic

```python run GST, a three-way split, and why double is wrong
from decimal import Decimal, ROUND_HALF_UP
price = Decimal('2499.00')
gst = (price * Decimal('0.18')).quantize(Decimal('0.01'), ROUND_HALF_UP)
print(f'18% GST on Rs 2,499.00 = Rs {gst}; total Rs {price + gst}')
total_paise = 100_000                                     # Rs 1,000.00
base, rem = divmod(total_paise, 3)
shares = [base + (1 if i < rem else 0) for i in range(3)]
print('Rs 1,000 split three ways (paise):', shares, '| sum', sum(shares))
print('double would give:', 0.1 + 0.2, 'and 2499 * 0.18 =', 2499 * 0.18)
print('Decimal keeps the scale exact:', Decimal('0.1') + Decimal('0.2'))
```

Floating point gives `0.30000000000000004` and `449.82000000000005`; integers and `Decimal` give exact money, and the explicit remainder distribution makes the three shares add back to exactly ₹1,000.

### V4.4 Idempotent capture

```python run Concurrent captures with the same key charge once
import threading
from backlab import redis_server
with redis_server() as r:
    charges = []
    lock = threading.Lock()
    def capture(order_id, key):
        if not r.set(f'cap:{key}', 'processing', nx=True, ex=86400):
            while not r.exists(f'result:{key}'):
                pass                                      # wait for the winner to finish
            return {**r.hgetall(f'result:{key}'), 'from': 'replay'}
        with lock:                                        # the real charge: call the PSP once
            charges.append(order_id)
            result = {'payment_id': f'pay_{len(charges)}', 'status': 'captured'}
        r.hset(f'result:{key}', mapping=result)
        return {**result, 'from': 'charged'}
    results = []
    threads = [threading.Thread(target=lambda: results.append(capture('ord_1', 'idem-1')))
               for _ in range(5)]
    for t in threads: t.start()
    for t in threads: t.join()
    print('threads:', len(results),
          '| that actually charged:', sum(x['from'] == 'charged' for x in results),
          '| replayed:', sum(x['from'] == 'replay' for x in results))
    print('distinct payment ids:', sorted({x['payment_id'] for x in results}))
    print('actual charges made:', charges)
```

Five concurrent calls, one charge: `SET NX` lets exactly one thread through, and the others see the key already claimed. A database `UNIQUE` constraint on the idempotency key is the durable backstop.

### V4.5 PCI scope

Keep card data entirely with the PSP: use **hosted fields** (the PSP's iframe/SDK renders the card inputs) or a redirect to the PSP's checkout, so card numbers and CVV go straight from the browser to the PSP and **never reach your servers, logs or database**. That keeps you in the lightest self-assessment, **SAQ A** (with the v4.0 script-integrity requirements: Subresource Integrity on scripts, a strict CSP, and an inventory of scripts on the payment page). For one-click reorder, enable **network tokenisation / card-on-file**: the PSP (or the card network) stores the card and gives you a **token** that represents it; you store only the token (and a display label like "Visa ••4242") and charge the token later with the customer's consent. You must **never** store the CVV (not even encrypted, not even briefly), never store the full PAN yourself (in India, RBI prohibits it; tokenise instead), and never put card data in logs, analytics or error reports. Add 3-D Secure for authentication, idempotency keys on charges, and daily reconciliation.
