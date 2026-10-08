# Chapter 7: The OWASP Top 10, Attacked and Fixed
%The most common web-application vulnerabilities, each demonstrated on a toy and then fixed

The **OWASP Top 10** (2021 edition) ranks the most critical web application security risks from real breach and testing data. Each section below shows the vulnerable pattern running on a deliberately weak toy, then the fix. Everything runs locally against data invented for the example.

| # | Risk | Section |
|---|---|---|
| A01 | Broken Access Control | 7.1 (IDOR, mass assignment, path traversal) |
| A02 | Cryptographic Failures | Chapters 2–5 |
| A03 | Injection | 7.2 (SQL, OS command), front-end guide Chapter 11 (XSS) |
| A04 | Insecure Design | 7.3 |
| A05 | Security Misconfiguration | 7.4 (headers, defaults, verbose errors) |
| A06 | Vulnerable and Outdated Components | 7.5 |
| A07 | Identification and Authentication Failures | Chapter 3 |
| A08 | Software and Data Integrity Failures | 7.6 (unsafe deserialisation, unsigned updates) |
| A09 | Security Logging and Monitoring Failures | Chapter 8 |
| A10 | Server-Side Request Forgery | 7.7 |

## 7.1 Broken access control

The most common serious flaw: the application checks that the user is **logged in**, but not that they may access **this object** or perform **this action**.

```python run IDOR: any logged-in user can read any bill by changing the id
BILLS = {101: {'owner': 'priya', 'amount': 1840}, 102: {'owner': 'arjun', 'amount': 2290},
         103: {'owner': 'priya', 'amount': 1610}}
def get_bill_vulnerable(user, bill_id):
    if user is None:
        return 401, 'login required'
    return 200, BILLS.get(bill_id, 'not found')             # authenticated, never authorised
def get_bill_fixed(user, bill_id):
    if user is None:
        return 401, 'login required'
    bill = BILLS.get(bill_id)
    if bill is None or bill['owner'] != user:               # object-level check
        return 404, 'not found'                              # do not reveal that it exists
    return 200, bill
for fn in (get_bill_vulnerable, get_bill_fixed):
    print(fn.__name__, '| priya asks for 102:', fn('priya', 102),
          '| for 101:', fn('priya', 101)[0])
```

Returning 404 rather than 403 avoids confirming which ids exist; random, non-sequential ids (UUIDs) make guessing harder but are **not** a substitute for the check. In SQL, put the owner in the query itself: `SELECT ... FROM bill WHERE id = ? AND customer_id = ?`.

```python run Mass assignment: binding a whole request body onto the user object
user = {'id': 7, 'name': 'Arjun', 'email': 'arjun@example.com', 'role': 'customer',
        'credit_limit': 0}
request_body = {'name': 'Arjun K', 'role': 'admin', 'credit_limit': 500000}  # extra fields
vulnerable = {**user, **request_body}                      # "update all fields from JSON"
ALLOWED = {'name', 'email'}                                # a DTO with only editable fields
fixed = {**user, **{k: v for k, v in request_body.items() if k in ALLOWED}}
print('vulnerable:', {k: vulnerable[k] for k in ('name', 'role', 'credit_limit')})
print('fixed:     ', {k: fixed[k] for k in ('name', 'role', 'credit_limit')})
print('ignored fields:', sorted(set(request_body) - ALLOWED))
```

In Spring, never bind request bodies directly to JPA entities; use request DTOs (Java records) with only the editable fields.

```python run Path traversal in a file download endpoint, and the fix
import os, tempfile
from pathlib import Path
base = Path(tempfile.mkdtemp()) / 'invoices'
base.mkdir()
(base / 'inv-101.pdf').write_text('invoice 101')
(base.parent / 'secrets.env').write_text('DB_PASSWORD=...')
def download_vulnerable(name):
    return open(os.path.join(base, name)).read()
def download_fixed(name):
    target = (base / name).resolve()
    if not target.is_relative_to(base.resolve()) or not target.is_file():
        raise PermissionError('invalid file name')
    return target.read_text()
for name in ['inv-101.pdf', '../secrets.env']:
    for fn in (download_vulnerable, download_fixed):
        try:
            print(f'{fn.__name__}({name!r}) ->', fn(name))
        except PermissionError as e:
            print(f'{fn.__name__}({name!r}) -> refused: {e}')
```

Better still, never take file names from users at all: look up the stored object key by an id the user is authorised for.

## 7.2 Injection

Injection happens when user input is concatenated into something that is **interpreted**: SQL, shell commands, LDAP or NoSQL queries, HTML (XSS), templates.

```python run SQL injection: login bypass and data theft, then parameterised queries
import sqlite3
db = sqlite3.connect(':memory:')
db.executescript('''CREATE TABLE users (name TEXT, password_hash TEXT, role TEXT);
  INSERT INTO users VALUES ('priya', 'x1', 'customer'), ('admin', 'x9', 'admin');
  CREATE TABLE cards (owner TEXT, last4 TEXT);
  INSERT INTO cards VALUES ('priya', '4242'), ('arjun', '1881');''')
def login_vulnerable(name, pw_hash):
    sql = ("SELECT name, role FROM users "
           f"WHERE name = '{name}' AND password_hash = '{pw_hash}'")
    return db.execute(sql).fetchall()
def search_vulnerable(term):
    return db.execute(f"SELECT name FROM users WHERE name LIKE '%{term}%'").fetchall()
print('login with name = admin\' --  :', login_vulnerable("admin' --", 'anything'))
union = "zzz' UNION SELECT owner || ':' || last4 FROM cards --"
print('search UNION:', search_vulnerable(union))
def login_fixed(name, pw_hash):
    return db.execute('SELECT name, role FROM users WHERE name = ? AND password_hash = ?',
                      (name, pw_hash)).fetchall()
print('parameterised login with the same input:', login_fixed("admin' --", 'anything'))
```

The `--` turned the password check into a comment, logging the attacker in as admin; the `UNION` appended rows from a completely different table. With placeholders the input is sent as **data**, never parsed as SQL, so the same strings simply match nothing. The rule (JDBC guide, Chapter 2): always `PreparedStatement` / parameters; allow-list identifiers (column names for sorting) that cannot be parameters; give the application's database user only the privileges it needs.

```python run OS command injection through a "ping" diagnostic feature
import subprocess
def ping_vulnerable(host):          # shell=True interprets ; | && $( ) in the input
    return subprocess.run(f'echo pinging {host}', shell=True, capture_output=True,
                          text=True).stdout.strip()
def ping_fixed(host):
    import ipaddress
    ipaddress.ip_address(host)                       # validate: must be an IP address
    return subprocess.run(['echo', 'pinging', host], capture_output=True,
                          text=True).stdout.strip()           # no shell, arguments as a list
evil = '127.0.0.1; echo INJECTED: $(id -un)'
print('vulnerable:', ping_vulnerable(evil).replace('\n', ' | '))
try:
    ping_fixed(evil)
except ValueError as e:
    print('fixed:', e)
print('fixed with a valid address:', ping_fixed('127.0.0.1'))
```

(`echo` stands in for `ping` so the example has no network effects; `id -un` shows the second command ran with the server's identity.) Avoid shells entirely, pass arguments as a list, and validate input against a strict format.

## 7.3 Insecure design

Some flaws are not coding errors but missing rules in the design: a password-reset flow that lets anyone set a new password with only an email address; a referral scheme with no limit per device; "transfer" without a daily limit or step-up authentication; an OTP with no attempt limit (a 6-digit code is guessed in at most a million tries, at most a few minutes without rate limits). They are found by **threat modelling** (Section 1.2) and abuse-case thinking during design reviews: "how would someone misuse this feature for gain?"

```python run Why OTP verification needs attempt limits
import secrets
otp = f'{secrets.randbelow(10**6):06d}'
def attacker(limit):
    for attempt in range(1, 10**6 + 1):
        if limit and attempt > limit:
            return f'locked out after {limit} attempts'
        if f'{attempt - 1:06d}' == otp:
            return f'guessed the OTP after {attempt:,} attempts'
print('no attempt limit:      ', attacker(None))
print('limit of 5 attempts:   ', attacker(5))
print(f'chance of success within 5 tries: {5 / 10**6:.4%}')
```

## 7.4 Security misconfiguration

Default credentials, debug endpoints left on (`/actuator` fully exposed, Swagger UI in production with admin operations), directory listing, verbose error pages with stack traces, overly permissive CORS, public cloud buckets, missing security headers.

```python run Auditing a response's security headers
def audit(headers):
    h = {k.lower(): v for k, v in headers.items()}
    csp = h.get('content-security-policy', '')
    checks = {
        'Strict-Transport-Security': 'max-age' in h.get('strict-transport-security', ''),
        'Content-Security-Policy': 'default-src' in csp and "'unsafe-inline'" not in csp,
        'X-Content-Type-Options': h.get('x-content-type-options') == 'nosniff',
        'frame-ancestors / X-Frame-Options':
            'frame-ancestors' in csp or h.get('x-frame-options') in ('DENY', 'SAMEORIGIN'),
        'Referrer-Policy': 'referrer-policy' in h,
        'no Server version leak': not any(c.isdigit() for c in h.get('server', '')),
        'no X-Powered-By': 'x-powered-by' not in h,
    }
    return [f'{"PASS" if ok else "FAIL"} {name}' for name, ok in checks.items()]
default_app = {'Server': 'Apache-Coyote/1.1 Tomcat/9.0.31', 'X-Powered-By': 'Express',
               'Content-Type': 'text/html'}
hardened = {'Server': 'web', 'Content-Type': 'text/html; charset=utf-8',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            'Content-Security-Policy': "default-src 'self'; frame-ancestors 'none'",
            'X-Content-Type-Options': 'nosniff',
            'Referrer-Policy': 'strict-origin-when-cross-origin'}
for name, hdrs in [('default app', default_app), ('hardened app', hardened)]:
    print(name + ':', ' | '.join(audit(hdrs)))
```

Spring Security sets several of these headers by default; add CSP and HSTS explicitly, restrict Actuator to `health` and `info` publicly (others behind authentication on a separate port), and return generic error bodies (`server.error.include-stacktrace=never`).

## 7.5 Vulnerable and outdated components

Most code in an application is third-party: frameworks, libraries, base images. A single vulnerable dependency (Log4Shell in log4j 2, CVE-2021-44228; Spring4Shell; a vulnerable image library) exposes every application using it. Controls:

- An inventory (**SBOM**: CycloneDX, SPDX) of what each service contains.
- **Software composition analysis** in CI (OWASP Dependency-Check, Snyk, GitHub Dependabot, `npm audit`, `pip-audit`, Trivy for container images), failing builds on critical, exploitable vulnerabilities.
- Pinned versions with lockfiles; regular, small, tested upgrades rather than rare large ones.
- Minimal base images (distroless), removing unused dependencies, watching for typosquatted and hijacked packages (supply-chain attacks).

## 7.6 Software and data integrity failures

Trusting code or data without verifying its integrity: unsigned updates (Section 2.4 showed signed firmware), CI pipelines that pull unpinned scripts, and **insecure deserialisation**: formats that can instantiate arbitrary objects (Java native serialisation, Python `pickle`, some YAML loaders) turn attacker-controlled bytes into code execution.


The defence is to **never deserialise untrusted input with such formats**: exchange data as JSON (or Protobuf) mapped onto explicit types, which can only ever produce plain values; in Java, avoid `ObjectInputStream` on network input (or use serialisation filters with allow-lists); in Python, use `yaml.safe_load`, never `pickle` on data from users, queues or caches shared with less-trusted systems; sign anything you must round-trip through a client (an HMAC over the bytes, Section 2.2) and verify before parsing.

```python run Parsing untrusted input into explicit types with JSON and validation
import json
from dataclasses import dataclass
@dataclass(frozen=True)
class ReadingIn:
    meter: str
    kwh: float
    @staticmethod
    def parse(raw: bytes) -> 'ReadingIn':
        data = json.loads(raw)          # JSON yields only dicts, lists, strings, numbers
        if set(data) != {'meter', 'kwh'}:
            raise ValueError(f'unexpected fields: {sorted(set(data) ^ {"meter", "kwh"})}')
        if not (isinstance(data['meter'], str) and data['meter'].startswith('SM-')):
            raise ValueError('bad meter id')
        if not isinstance(data['kwh'], (int, float)) or not 0 <= data['kwh'] < 1000:
            raise ValueError('kwh out of range')
        return ReadingIn(data['meter'], float(data['kwh']))
for raw in [b'{"meter": "SM-42", "kwh": 0.42}', b'{"meter": "SM-42", "kwh": -5}',
            b'{"meter": "SM-42", "kwh": 1, "role": "admin"}', b'{"__class__": "os.system"}']:
    try:
        print('accepted:', ReadingIn.parse(raw))
    except (ValueError, KeyError) as e:
        print('rejected:', e)
```

Whatever the input contains, the result is either a validated `ReadingIn` or an error: no object types are chosen by the sender.

## 7.7 Server-side request forgery (SSRF)

A feature that fetches a URL supplied by the user (a webhook URL, "import from link", an image preview) can be pointed at **internal** addresses that the attacker cannot reach directly: the cloud metadata service at `169.254.169.254` (which hands out instance credentials), an internal admin panel, Redis on `127.0.0.1:6379`. The defence is to resolve the host name and refuse private, loopback, link-local and other special addresses, allow only `http`/`https` on expected ports, avoid following redirects blindly (re-check each hop), and, best, send such requests through an egress proxy that enforces the same rules. On AWS, also require IMDSv2 (session tokens) for the metadata service.

```python run A URL validator that blocks internal destinations after DNS resolution
import ipaddress, socket
from urllib.parse import urlsplit
def check_url(url):
    parts = urlsplit(url)
    if parts.scheme not in ('http', 'https'):
        return f'blocked: scheme {parts.scheme!r}'
    if parts.port not in (None, 80, 443):
        return f'blocked: port {parts.port}'
    try:
        infos = socket.getaddrinfo(parts.hostname, None)
    except socket.gaierror:
        return 'blocked: cannot resolve'
    for info in infos:                                  # every address the name resolves to
        ip = ipaddress.ip_address(info[4][0])
        if (ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved
                or ip.is_multicast or ip.is_unspecified):
            return f'blocked: {parts.hostname} resolves to internal address {ip}'
    return 'allowed (then connect to the checked IP, not the name again)'
for url in ['http://169.254.169.254/latest/meta-data/', 'http://127.0.0.1:6379/',
            'http://localhost/admin', 'http://[::1]/', 'http://2130706433/',
            'http://10.0.0.5/', 'file:///etc/passwd', 'gopher://127.0.0.1:6379/_INFO',
            'https://93.184.215.14/']:
    print(f'{url:45s} {check_url(url)}')
```

`http://2130706433/` is 127.0.0.1 written as one decimal number, a classic filter bypass; checking the **resolved** address catches it, where a text blacklist of "127.0.0.1" and "localhost" would not. The last line shows the remaining subtlety: between the check and the request, DNS could answer differently (**DNS rebinding**), so connect to the IP address you validated.

## 7.8 Cross-site request forgery (CSRF)

If a site authenticates with cookies, another site can make the victim's browser send a request (a form auto-submitted from `evil.example` to `/transfer`), and the browser attaches the cookies. Defences: `SameSite=Lax` or `Strict` cookies (the modern default stops most cross-site POSTs), **anti-CSRF tokens** for state-changing requests (Spring Security does this by default for session-based apps), checking `Origin`/`Sec-Fetch-Site` headers, and never changing state on `GET`. APIs authenticated with an `Authorization: Bearer` header are not exposed to CSRF, because browsers do not attach that header automatically.

# Chapter 8: Data Storage, Privacy and Audit
%Personal data, minimisation and retention, masking, tamper-evident audit logs and the law

## 8.1 Classify the data

| Class | Examples (meter platform) | Handling |
|---|---|---|
| Public | Tariff tables, marketing pages | No restrictions |
| Internal | Aggregated demand forecasts | Access for employees |
| Confidential / personal | Names, addresses, phone numbers, emails, consumption history (reveals when a home is empty) | Access by role, encrypted at rest, logged access, retention limits |
| Restricted / sensitive | Aadhaar numbers, bank accounts, payment tokens, credentials | Field-level encryption, strict need-to-know, masked everywhere, extra audit |

Practices: **collect less** (do you need the date of birth?), **keep less** (retention periods per data type and automatic deletion), **show less** (mask in UIs and support tools), **move less** (no production data in test environments; use synthetic or masked copies), and know **where** every copy lives (databases, caches, logs, backups, analytics, third parties).

## 8.2 Keep secrets and personal data out of logs

Logs are copied widely (log platforms, support tickets, vendors) and kept long. Never log passwords, tokens, full card numbers, CVVs or full identity numbers; mask emails and phone numbers. A logging filter catches mistakes centrally.

```python run A logging filter that masks card numbers, emails, phone numbers and tokens
import logging, re, io
PATTERNS = [
    (re.compile(r'\b(?:\d[ -]?){12,15}(\d{4})\b'), r'****-****-****-\1'),   # card numbers
    (re.compile(r'\b([A-Za-z0-9._%+-])[A-Za-z0-9._%+-]*@([A-Za-z0-9.-]+)'), r'\1***@\2'),
    (re.compile(r'(?<!\d)(?:\+91[ -]?)?[6-9]\d{9}(?!\d)'), '+91-XXXXXXXXXX'),  # mobiles
    (re.compile(r'(?i)(authorization: bearer )[A-Za-z0-9._-]+'), r'\1[REDACTED]'),
    (re.compile(r'(?i)("?password"?\s*[:=]\s*)"?[^",\s]+"?'), r'\1"[REDACTED]"'),
]
class MaskingFilter(logging.Filter):
    def filter(self, record):
        msg = record.getMessage()
        for rx, repl in PATTERNS:
            msg = rx.sub(repl, msg)
        record.msg, record.args = msg, None
        return True
out = io.StringIO()
log = logging.getLogger('app'); log.setLevel(logging.INFO)
handler = logging.StreamHandler(out)
handler.addFilter(MaskingFilter())
log.addHandler(handler)
log.info('payment failed for card 4111 1111 1111 1111, user priya.sharma@example.com')
log.info('OTP sent to 9876543210 for meter SM-42')
log.info('request headers: Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.e30.abc')
log.info('login body {"user": "arjun", "password": "Kolkata@123"}')
print(out.getvalue().strip())
```

Masking is a safety net; the primary rule is to not pass sensitive values to log statements at all (log ids instead), and to structure logs (JSON fields) so that sensitive fields can be dropped by name.

## 8.3 Tamper-evident audit logs

Security-relevant actions (logins, permission changes, tariff edits, refunds, data exports, key use) need an **audit trail** that administrators cannot quietly edit. A simple, strong technique is a **hash chain**: each entry stores the hash of the previous entry, so changing or deleting any entry breaks every hash after it. Periodically anchoring the latest hash somewhere else (a write-once bucket, a separate system) protects the end of the chain too.

```python run A hash-chained audit log and the detection of a silent edit
import hashlib, json
def entry_hash(e):
    return hashlib.sha256(json.dumps(e, sort_keys=True).encode()).hexdigest()
log = []
def append(actor, action):
    prev = log[-1]['hash'] if log else '0' * 64
    e = {'seq': len(log) + 1, 'actor': actor, 'action': action, 'prev': prev}
    e['hash'] = entry_hash({k: v for k, v in e.items() if k != 'hash'})
    log.append(e)
def verify():
    prev = '0' * 64
    for e in log:
        body = {k: v for k, v in e.items() if k != 'hash'}
        if e['prev'] != prev or e['hash'] != entry_hash(body):
            return f'chain broken at entry {e["seq"]}'
        prev = e['hash']
    return f'chain intact ({len(log)} entries)'
append('admin-ravi', 'changed tariff T2 from 7.50 to 8.10')
append('support-anu', 'exported bills for customer c1')
append('admin-ravi', 'refunded pay_91 1000.00')
print(verify())
log[1]['action'] = 'viewed bill for customer c1'           # someone edits the record quietly
print('after editing entry 2:', verify())
```

## 8.4 Privacy law in brief

India's **Digital Personal Data Protection Act, 2023** (DPDP) applies to digital personal data processed in India (and to processing outside India for offering goods or services in India). Key duties for a **data fiduciary** (the company deciding why and how data is processed):

- Process personal data only for a lawful purpose with the person's **consent** (free, specific, informed, and as easy to withdraw as to give), or for certain "legitimate uses" defined in the Act.
- Give a clear **notice** of what is collected and why; use it only for that purpose.
- Keep it accurate; protect it with **reasonable security safeguards**; **erase** it when the purpose is served or consent is withdrawn (unless the law requires retention).
- Report **personal data breaches** to the Data Protection Board and to affected people.
- Honour the rights of the **data principal**: access a summary of their data, correction and erasure, grievance redressal, and nominating someone to act for them.
- Extra care for **children's** data (verifiable parental consent; no tracking or targeted advertising directed at children).

The EU's **GDPR** has similar principles (lawful basis, minimisation, purpose limitation, rights of access, rectification, erasure and portability, 72-hour breach notification) and applies to services offered to people in the EU. Engineers implement these as features: consent records, data export, deletion workflows that reach every store (including crypto-shredding for backups, Section 5.3), retention jobs, and breach-detection alerts. Rules and their details change; check the current text and your legal team for any real decision.

# Chapter 9: Secure Development, Operations and Interview Questions
%Building security into the process, and answering the questions interviewers ask

## 9.1 A secure development lifecycle

| Stage | Practice |
|---|---|
| Design | Threat model new features (STRIDE, abuse cases); security requirements in tickets |
| Code | Secure defaults in shared libraries (auth, validation, crypto wrappers); review checklists |
| Build | SAST (Semgrep, SpotBugs/FindSecBugs, CodeQL), SCA (Section 7.5), secret scanning, container image scanning, SBOM, signed artefacts |
| Test | Authorisation tests for every endpoint; DAST (OWASP ZAP) against staging; fuzzing parsers; penetration tests before major releases |
| Deploy | Infrastructure as code reviewed; least-privilege IAM; non-root containers, read-only file systems; network policies |
| Operate | Centralised logs and alerts (failed logins, permission changes, unusual data exports); patching; key rotation; access reviews; backups tested by restoring |
| Respond | Incident response plan: detect, contain (revoke keys and sessions, block), eradicate, recover, notify (legal deadlines), blameless postmortem; a responsible-disclosure policy or bug bounty |

## 9.2 Code review checklist

- Every endpoint: authenticated? authorised for **this object and action**? input validated against a schema?
- Every query parameterised; every shell call without a shell; no deserialisation of untrusted data.
- Output encoded for its context (HTML, attribute, URL, JSON); no `innerHTML` with user data.
- Secrets from the secret manager; none in code, logs or error messages.
- Crypto from vetted libraries: Argon2id/bcrypt for passwords, AES-GCM with unique nonces, TLS verification on.
- Money: server-side amounts, integers or decimals, idempotency keys, atomic updates.
- Outbound requests: timeouts, SSRF checks for user-supplied URLs.
- Errors: generic messages to clients, details in logs (without personal data).
- New dependencies: necessary, maintained, scanned, pinned.

## 9.3 Interview questions with the core of a good answer

| Question | Core of the answer |
|---|---|
| How should passwords be stored? | Argon2id/bcrypt/scrypt with per-password salt and tuned cost; never plain or fast hashes; pepper optional; rehash on parameter changes |
| Hashing vs encryption vs encoding? | One-way digest vs reversible with a key vs reversible format change with no secret (Base64) |
| Symmetric vs asymmetric encryption? | One shared key, fast (AES-GCM) vs key pairs for key exchange and signatures; combined in TLS and envelope encryption |
| What does TLS protect, and how is the server authenticated? | Confidentiality, integrity, server authentication; certificate chain to a trusted CA, SAN host name check, handshake signature; forward secrecy |
| What is mTLS and when would you use it? | Client certificates too; service-to-service and device authentication |
| How do you manage encryption keys? | KMS/HSM, envelope encryption, least-privilege policies, audit, rotation by re-wrapping |
| Where should secrets live? | Secret manager, injected at run time, scanned for in CI, rotated; prefer workload identities |
| JWT vs session cookie? | Stateless and verifiable anywhere vs revocable server state; short-lived JWTs, pinned algorithms, HttpOnly cookies |
| Explain OAuth 2.0 authorization code flow with PKCE. | Redirect, code, back-channel exchange; verifier and S256 challenge protect public clients; `state`, ID token validation |
| What is IDOR and how do you prevent it? | Missing object-level authorisation; check ownership in every query; deny by default; tests |
| How do you prevent SQL injection? | Parameterised queries, allow-listed identifiers, least-privilege DB user |
| XSS vs CSRF? | Injected script in your page vs forged requests from another site using the victim's cookies; output encoding/CSP vs SameSite/tokens |
| What is SSRF? | Server fetches attacker-chosen URLs, reaching internal services and metadata; validate resolved IPs, egress proxy, IMDSv2 |
| How does a card payment flow, and how do you stay out of PCI scope? | Server-created order, PSP-hosted checkout, 3-D Secure, signature verification, webhooks; card data never touches your servers (SAQ A); no CVV storage; tokenisation |
| How do you verify a webhook? | HMAC over the raw body with a shared secret, constant-time compare, timestamp tolerance, idempotent processing by event id |
| Why never use floats for money? | Binary fractions are inexact; use integer minor units or decimals with explicit rounding |
| How do you prevent double refunds or double charges? | Idempotency keys, atomic conditional updates, unique constraints, reconciliation |
| What would you log, and what never? | Security events with ids and outcomes; never secrets, tokens, card data or full identifiers; mask personal data |
| What is defence in depth? Give an example. | Independent layers: WAF, authz, parameterised SQL, least-privilege DB user, encryption at rest, monitoring |
| What do you do when a secret is committed to Git? | Revoke and rotate it immediately, then remove it from history, check logs for use, add scanning to prevent recurrence |
