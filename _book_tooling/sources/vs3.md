## Part 5 solutions

### V5.1 IDOR

```python run Broken object-level authorisation, and the fix in the query
READINGS = {'SM-1': {'owner': 'c1', 'kwh': 12.5}, 'SM-2': {'owner': 'c2', 'kwh': 8.0},
            'SM-3': {'owner': 'c1', 'kwh': 20.0}}
def get_vulnerable(user, meter_id):                       # checks login only
    if user is None:
        return 401, None
    return 200, READINGS.get(meter_id)
def get_fixed(user, meter_id):
    m = READINGS.get(meter_id)
    if user is None:
        return 401, None
    if m is None or m['owner'] != user:                   # the ownership check
        return 404, None                                  # 404, not 403: hide existence
    return 200, m
print('vulnerable: c1 reads SM-2 (c2\'s meter):', get_vulnerable('c1', 'SM-2'))
print('fixed:      c1 reads SM-2:', get_fixed('c1', 'SM-2'))
print('fixed:      c1 reads SM-3 (own):', get_fixed('c1', 'SM-3'))
```

In SQL the fix is in the query so the row never leaves the database: `SELECT kwh FROM reading WHERE meter_id = ? AND customer_id = ?`. Test it: for every endpoint, assert that another user's id returns 404/403.

### V5.2 SQL injection

```python run A login bypass and a UNION leak, then the parameterised fix
import sqlite3
db = sqlite3.connect(':memory:')
db.executescript('''CREATE TABLE users (name TEXT, pw TEXT, role TEXT);
  INSERT INTO users VALUES ('priya', 'h1', 'customer'), ('admin', 'h9', 'admin');
  CREATE TABLE tokens (owner TEXT, token TEXT);
  INSERT INTO tokens VALUES ('admin', 'tok_live_abc');''')
def login_bad(name, pw):
    sql = f"SELECT name, role FROM users WHERE name='{name}' AND pw='{pw}'"
    return db.execute(sql).fetchall()
def search_bad(q):
    return db.execute(f"SELECT name FROM users WHERE name LIKE '%{q}%'").fetchall()
print('bypass with  admin\'--  :', login_bad("admin'--", "x"))
print('UNION leak:', search_bad("none' UNION SELECT owner||':'||token FROM tokens--"))
def login_ok(name, pw):
    return db.execute("SELECT name, role FROM users WHERE name=? AND pw=?",
                      (name, pw)).fetchall()
print('parameterised, same input:', login_ok("admin'--", "x"))
```

### V5.3 Command injection

```python run A shell-injection in a thumbnail feature, and the fix
import subprocess
def thumb_bad(name):                                       # shell parses ; | $() in the name
    r = subprocess.run(f'echo convert {name} -resize 100x100', shell=True,
                       capture_output=True, text=True)
    return r.stdout.strip()
def thumb_ok(name):
    import re
    if not re.fullmatch(r'[A-Za-z0-9_.-]+\.(png|jpg)', name):   # strict allow-list
        raise ValueError('invalid file name')
    r = subprocess.run(['echo', 'convert', name, '-resize', '100x100'],  # list, no shell
                       capture_output=True, text=True)
    return r.stdout.strip()
evil = 'photo.png; echo PWNED: $(id -un)'
print('vulnerable:', thumb_bad(evil).replace('\n', ' | '))
try:
    thumb_ok(evil)
except ValueError as e:
    print('fixed:', e)
print('fixed, valid name:', thumb_ok('photo.png'))
```

### V5.4 Path traversal

```python run Escaping the base directory with ../, and the resolved-path check
import tempfile
from pathlib import Path
base = Path(tempfile.mkdtemp()) / 'files'
base.mkdir()
(base / 'report.pdf').write_text('report')
(base.parent / 'secret.txt').write_text('TOP SECRET')
def read_bad(name):
    return (base / name).read_text()                       # no check
def read_ok(name):
    target = (base / name).resolve()
    if not target.is_relative_to(base.resolve()):
        raise PermissionError('path escapes the base directory')
    return target.read_text()
for name in ['report.pdf', '../secret.txt']:
    try:
        print(f'bad  {name!r}:', read_bad(name))
    except Exception as e:
        print(f'bad  {name!r}:', type(e).__name__)
    try:
        print(f'ok   {name!r}:', read_ok(name))
    except PermissionError as e:
        print(f'ok   {name!r}: refused ({e})')
```

### V5.5 Mass assignment

```python run Binding a whole body lets an attacker escalate; an allow-list stops it
def update_bad(user, body):
    return {**user, **body}
def update_ok(user, body):
    editable = {'name', 'email', 'phone'}
    return {**user, **{k: v for k, v in body.items() if k in editable}}
user = {'id': 5, 'name': 'Arjun', 'email': 'a@x.com',
        'role': 'customer', 'is_verified': False}
attack = {'name': 'Arjun', 'role': 'admin', 'is_verified': True}
print('vulnerable:', {k: update_bad(user, attack)[k] for k in ('role', 'is_verified')})
print('fixed:     ', {k: update_ok(user, attack)[k] for k in ('role', 'is_verified')})
print('ignored:', sorted(set(attack) - {'name', 'email', 'phone'}))
```

### V5.6 SSRF

```python run A URL check that blocks internal destinations and the decimal-IP bypass
import ipaddress, socket
from urllib.parse import urlsplit
def allowed(url):
    p = urlsplit(url)
    if p.scheme not in ('http', 'https'):
        return f'blocked: scheme {p.scheme!r}'
    try:
        addrs = {ai[4][0] for ai in socket.getaddrinfo(p.hostname, None)}
    except (socket.gaierror, UnicodeError, ValueError):
        return 'blocked: cannot resolve'
    for a in addrs:
        ip = ipaddress.ip_address(a)
        if (ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved
                or ip.is_multicast):
            return f'blocked: resolves to {ip}'
    return 'allowed'
for url in ['http://169.254.169.254/', 'http://127.0.0.1:8080/', 'http://localhost/',
            'http://2130706433/', 'http://[::1]/', 'http://10.1.2.3/',
            'file:///etc/passwd', 'https://93.184.215.14/']:
    print(f'{url:34s} {allowed(url)}')
```

`2130706433` is `127.0.0.1` as a single decimal; resolving it to an address and checking the address (not a text blacklist) catches that and other encodings. Connect to the validated IP, not the host name again, to avoid DNS rebinding.

### V5.7 Security headers

```python run Reporting missing or weak security headers
def audit(headers):
    h = {k.lower(): v for k, v in headers.items()}
    csp = h.get('content-security-policy', '')
    results = {
        'HSTS': 'max-age' in h.get('strict-transport-security', ''),
        'CSP (no unsafe-inline)': 'default-src' in csp and "'unsafe-inline'" not in csp,
        'X-Content-Type-Options': h.get('x-content-type-options') == 'nosniff',
        'frame protection': 'frame-ancestors' in csp
                            or h.get('x-frame-options') in ('DENY', 'SAMEORIGIN'),
        'Referrer-Policy': 'referrer-policy' in h,
    }
    return {k: ('ok' if v else 'MISSING/WEAK') for k, v in results.items()}
weak = {'Content-Type': 'text/html', 'X-Frame-Options': 'ALLOWALL',
        'Content-Security-Policy': "default-src 'self' 'unsafe-inline'"}
strong = {'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
          'Content-Security-Policy': "default-src 'self'; frame-ancestors 'none'",
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'no-referrer'}
print('weak app:  ', audit(weak))
print('strong app:', audit(strong))
```

### V5.8 XSS vs CSRF

**XSS (cross-site scripting)**: the attacker gets their **script to run in your page**, by injecting it where user data is rendered without escaping. It runs with the victim's privileges in your origin: it can read the DOM, call your APIs as the user, and steal tokens stored in JavaScript-readable places. Defences: render user data as text (frameworks escape by default), avoid `innerHTML`/`dangerouslySetInnerHTML` and `javascript:` URLs, sanitise any HTML you must accept, add a Content Security Policy, and keep session tokens in `HttpOnly` cookies.

**CSRF (cross-site request forgery)**: the attacker makes the **victim's browser send a request to your site** from another site; the browser attaches your cookies, so the request is authenticated. It can only *trigger* actions, not read responses. Defences: `SameSite=Lax`/`Strict` cookies (now the browser default, which blocks most cross-site sends), anti-CSRF tokens on state-changing requests, checking `Origin`/`Sec-Fetch-Site`, and never changing state on `GET`. APIs that authenticate with an `Authorization` header (not cookies) are immune, because browsers do not attach that header cross-site.

In short: XSS is a code-execution flaw in your page (break confidentiality and integrity); CSRF abuses ambient cookie authentication (break integrity of actions). A strong XSS can defeat CSRF defences, so fixing XSS comes first.

## Part 6 solutions

### V6.1 Log masking

```python run A masking logging filter, demonstrated
import logging, re, io
PATTERNS = [
    (re.compile(r'\b(?:\d[ -]?){12,15}(\d{4})\b'), r'****-****-****-\1'),
    (re.compile(r'\b([A-Za-z0-9._%+-])[A-Za-z0-9._%+-]*@([A-Za-z0-9.-]+)'), r'\1***@\2'),
    (re.compile(r'(?i)(bearer )[A-Za-z0-9._-]+'), r'\1[REDACTED]'),
]
class Mask(logging.Filter):
    def filter(self, record):
        msg = record.getMessage()
        for rx, repl in PATTERNS:
            msg = rx.sub(repl, msg)
        record.msg, record.args = msg, None
        return True
buf = io.StringIO()
log = logging.getLogger('demo'); log.setLevel(logging.INFO)
h = logging.StreamHandler(buf); h.addFilter(Mask()); log.addHandler(h)
log.info('charge card 4242 4242 4242 4242 for priya.s@example.com')
log.info('auth header Bearer eyJhbGciOi.payload.sig')
print(buf.getvalue().strip())
```

Masking is only a **safety net** against mistakes: regexes miss unusual formats and cost CPU on every log line. The primary rule is to never pass secrets or personal data to log calls (log an id or a reference instead), and to structure logs so sensitive fields can be dropped by name before storage.

### V6.2 Tamper-evident log

```python run A hash-chained audit log catches any edit or deletion
import hashlib, json
chain = []
def h(entry):
    return hashlib.sha256(json.dumps(entry, sort_keys=True).encode()).hexdigest()
def append(actor, action):
    prev = chain[-1]['hash'] if chain else '0' * 64
    e = {'seq': len(chain) + 1, 'actor': actor, 'action': action, 'prev': prev}
    e['hash'] = h({k: v for k, v in e.items() if k != 'hash'})
    chain.append(e)
def verify():
    prev = '0' * 64
    for e in chain:
        if e['prev'] != prev or e['hash'] != h({k: v for k, v in e.items() if k != 'hash'}):
            return f'TAMPERED at entry {e["seq"]}'
        prev = e['hash']
    return f'intact ({len(chain)} entries)'
append('ravi', 'login')
append('ravi', 'refund pay_9 = 1000.00')
append('anu', 'export customer c1')
print('after appending:', verify())
chain[1]['action'] = 'refund pay_9 = 10.00'               # a quiet edit
print('after editing entry 2:', verify())
chain.pop(1)                                              # or a deletion
print('after deleting entry 2:', verify())
```

Because each entry commits to the previous entry's hash, any change breaks the link at that point; anchoring the latest hash in a separate write-once store protects against truncating the whole tail.

## Part 7 solutions

### V7.1 Secure password reset

**Request.** `POST /password-reset` takes an email. **Always respond the same** ("if an account exists, we have sent a link"), whether or not the email is registered, to avoid user enumeration; rate-limit per email and per IP.

**Token.** Generate a high-entropy random token (`secrets.token_urlsafe(32)`). Store **only its hash** (SHA-256) in the database with the user id, an expiry (15–30 minutes) and a `used` flag; e-mail the raw token in the link. Storing the hash means a database leak does not reveal usable tokens (the same reasoning as password hashing, but tokens are high-entropy so a plain hash is enough).

**Delivery.** Send the link over e-mail only; the link goes to HTTPS; do not put the token in the URL of a page that loads third-party scripts (referrer leakage) and set `Referrer-Policy: no-referrer` on the reset page.

**Set the new password.** `POST /password-reset/confirm` with the token and the new password. Look up by the token's hash, check it exists, is not expired and not used, enforce the password policy (length, breached-password check), hash with Argon2id, mark the token used, and **invalidate all other reset tokens** for that user.

**After reset.** Revoke all existing sessions and refresh tokens (force re-login everywhere), and send a notification e-mail ("your password was changed"); optionally require the current password or a second factor for a logged-in change.

**Abuse cases handled.** Enumeration (uniform response, uniform timing); token guessing (128-bit random, hashed at rest, short expiry); token reuse (single-use flag, checked atomically); race conditions (mark-used and verify in one atomic update, so two concurrent confirms cannot both succeed); token in logs (never log it); and account takeover after reset (session invalidation + notification).

```python run The core of a safe reset: hashed single-use token, atomic consumption
import hashlib, secrets, time
tokens = {}                                               # token_hash -> {user, exp, used}
def request_reset(email, users, now):
    # uniform response regardless of existence
    if email in users:
        raw = secrets.token_urlsafe(32)
        tokens[hashlib.sha256(raw.encode()).hexdigest()] = {'user': users[email],
                                                            'exp': now + 900, 'used': False}
        return raw                                        # e-mailed; not shown to the caller
    return None
def confirm(raw, new_pw, now):
    rec = tokens.get(hashlib.sha256(raw.encode()).hexdigest())
    if rec is None or rec['used'] or now > rec['exp']:
        return 'invalid or expired token'
    rec['used'] = True                                    # single-use; atomic in a real DB
    return f'password set for {rec["user"]}'   # then hash with Argon2id, revoke sessions
raw = request_reset('priya@x.com', {'priya@x.com': 'c1'}, now=1000)
print('request for a real email returned a token:', raw is not None)
print('request for an unknown email:',
      request_reset('ghost@x.com', {'priya@x.com': 'c1'}, 1000))
print('first confirm: ', confirm(raw, 'NewPass!', 1100))
print('reuse the token:', confirm(raw, 'Another!', 1200))
stale = request_reset('priya@x.com', {'priya@x.com': 'c1'}, now=1)
print('expired token:  ', confirm(stale, 'x', now=100000))
```

### V7.2 Secrets for a 20-service platform

**Storage.** One **secret manager** (AWS Secrets Manager / HashiCorp Vault / cloud equivalent) as the single source of truth, with secrets namespaced per environment and per service (`prod/billing/db`, `staging/billing/db`). The manager encrypts at rest with a KMS and logs every access.

**Access and least privilege.** Prefer **workload identity** over stored secrets: each service runs as a cloud IAM role / Kubernetes service account, and its policy allows reading only **its own** secrets in **its own** environment. No shared "god" credentials; developers get time-limited, audited access for break-glass only.

**Injection.** Secrets are fetched at startup (or mounted as files via a sidecar/CSI driver) and kept in memory; never baked into container images, never in environment variables committed to Git, never in CI logs. Config references secrets by name, resolved at run time.

**Database credentials.** Use **dynamic secrets** where possible (Vault's database engine issues short-lived per-service database users on demand), so a leaked credential expires in minutes and every service has distinct, revocable access. Otherwise, static credentials rotated on a schedule.

**Rotation.** Automated rotation for all secrets (the manager rotates and updates both the store and the target); services re-read on a schedule or on a change notification so rotation needs no redeploy. Signing keys use versioning (verify with old and new during overlap).

**On a leak.** Rotate the exposed secret **immediately** (do not just remove it from Git; it is already in history and clones), revoke the old value at the target, search access logs for use during the exposure window, rotate anything it could reach, and add/verify secret scanning in CI and pre-commit to prevent recurrence. Because access was least-privilege and audited, the blast radius and the investigation are bounded.

**Guardrails.** Secret scanning in CI and pre-commit (gitleaks), a policy that fails builds containing secrets, and periodic access reviews. Keep test and production secrets entirely separate, and never use production secrets in non-production environments.
