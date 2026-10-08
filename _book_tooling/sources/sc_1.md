# Chapter 3: Passwords, Sessions, Tokens, MFA and OAuth
%Storing credentials safely and proving identity on every request

## 3.1 Never store passwords, store slow salted hashes

A password database **will** leak eventually (a SQL injection, a stolen backup, an insider). The goal is that a leak does not reveal the passwords. Plaintext storage and reversible encryption fail immediately. A plain hash (`sha256(password)`) fails too: identical passwords have identical hashes, precomputed tables reverse common ones, and modern hardware computes billions of SHA-256 hashes per second, so most human passwords fall to a dictionary attack in minutes.

The correct approach is a **password hashing function**, deliberately slow and memory-hard, with a unique random **salt** per password: **Argon2id** (the current recommendation), **scrypt** or **bcrypt**. The salt makes identical passwords hash differently and defeats precomputed tables; the cost parameter makes each guess expensive.

```python run A leaked table of plain SHA-256 hashes, cracked with a small dictionary
import hashlib, time
users = {'priya': 'Kolkata@123', 'arjun': 'password1', 'meera': 'Kolkata@123',
         'kabir': 'Xq7#vR2!mP9$wL4z'}
leaked = {u: hashlib.sha256(p.encode()).hexdigest() for u, p in users.items()}
print('priya and meera have identical hashes:', leaked['priya'] == leaked['meera'])
words = ['password', 'admin', 'welcome', 'kolkata', 'mumbai', 'india', 'qwerty', 'meter']
suffixes = ['', '1', '123', '@123', '2026', '!']
candidates = [w2 + s for w in words for w2 in (w, w.capitalize()) for s in suffixes]
t = time.perf_counter()
table = {hashlib.sha256(c.encode()).hexdigest(): c for c in candidates}
cracked = {u: table[h] for u, h in leaked.items() if h in table}
print(f'{len(candidates)} guesses in {time.perf_counter() - t:.4f} s; cracked: {cracked}')
n = 200_000; t = time.perf_counter()
for i in range(n):
    hashlib.sha256(b'guess%d' % i).digest()
rate = n / (time.perf_counter() - t)
print(f'one CPU core in Python: about {rate / 1e6:.0f} million SHA-256 guesses per second '
      '(GPUs: tens of billions)')
```

Three of four accounts were recovered from a 96-word list in a fraction of a millisecond; only the long random password survived. Now the same with proper password hashing:

```python run bcrypt and Argon2id: salts, cost, verification and the price of each guess
import time, bcrypt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
pw = b'Kolkata@123'
h1 = bcrypt.hashpw(pw, bcrypt.gensalt(rounds=12))
h2 = bcrypt.hashpw(pw, bcrypt.gensalt(rounds=12))
print('bcrypt format:', h1.decode()[:7] + '<22-char salt><31-char hash>', '| length', len(h1))
print('same password, different hashes (salted):', h1 != h2)
print('verify correct:', bcrypt.checkpw(pw, h1),
      '| verify wrong:', bcrypt.checkpw(b'kolkata@123', h1))
t = time.perf_counter(); bcrypt.checkpw(pw, h1); cost12 = time.perf_counter() - t
print(f'one bcrypt (cost 12) check: about {round(cost12, 1)} s '
      f'-> a few guesses per second per core')
ph = PasswordHasher(time_cost=3, memory_cost=64 * 1024, parallelism=1)    # 64 MiB per hash
stored = ph.hash('Kolkata@123')
print('argon2id parameters:', stored.split('$')[1:4])
try:
    ph.verify(stored, 'kolkata@123')
except VerifyMismatchError:
    print('argon2id: wrong password rejected')
print('argon2id: correct password ->', ph.verify(stored, 'Kolkata@123'))
old = PasswordHasher(time_cost=1, memory_cost=8 * 1024).hash('Kolkata@123')
print('hash made with weaker old parameters needs rehash on next login:',
      ph.check_needs_rehash(old))
```

bcrypt at cost 12 turns millions of guesses per second into a handful; Argon2id also forces 64 MiB of memory per guess, which makes GPU and custom-hardware attacks far more expensive. The stored string contains the algorithm, parameters and salt, so verification needs nothing else, and parameters can be strengthened over time: on a successful login, if `check_needs_rehash` is true, hash the password again with the new parameters.

Additional measures:

- **Pepper**: an extra secret (stored in a secret manager, not the database) mixed in with HMAC before hashing, so a database-only leak is useless.
- **Password policy** (NIST SP 800-63B): minimum length 8 (better 12+), allow long passphrases and all characters, **check against known-breached passwords**, no forced periodic changes, no composition rules that produce `Password1!`.
- **Rate-limit and monitor** logins per account and per IP; prefer progressive delays and CAPTCHA over hard lockouts (which let attackers lock out victims).
- **Same response for "no such user" and "wrong password"**, and similar timing, to avoid revealing which emails have accounts (user enumeration).

## 3.2 Sessions and tokens

After login the server must recognise the user on later requests.

| Approach | How | Revocation | Watch out for |
|---|---|---|---|
| **Server-side session** | Random session id in a cookie; session data in Redis or the database | Delete the session: immediate | Cookie flags; session fixation (issue a new id at login) |
| **JWT** (signed token) | Claims (`sub`, `exp`, `roles`) signed by the server; the client sends it with each request; any service can verify it with the key | Hard: valid until `exp` unless you keep a deny-list | Short expiry + refresh tokens; algorithm confusion; storage in the browser |

Cookie flags for any session or token cookie: `HttpOnly` (scripts cannot read it, limiting XSS damage), `Secure` (HTTPS only), `SameSite=Lax` or `Strict` (limits CSRF), a narrow `Path`, and no `Domain` unless needed.

```python run JWTs: verification, expiry, the alg=none trap and a guessable HMAC secret
import base64, json, time
import jwt
SECRET = 'n9Jf3kQ8xV2pL7wR4tY6uB1mZ5cH0sDe'                # 32 random characters
now = int(time.time())
token = jwt.encode({'sub': 'c1', 'role': 'customer', 'iat': now, 'exp': now + 900},
                   SECRET, algorithm='HS256')
header, payload, sig = token.split('.')
claims = json.loads(base64.urlsafe_b64decode(payload + '=='))
visible = {k: claims[k] for k in ('sub', 'role')}
print('the payload is only base64url-encoded, NOT encrypted; anyone can read:', visible,
      '| lifetime', claims['exp'] - claims['iat'], 's')
print('verified claims:', jwt.decode(token, SECRET, algorithms=['HS256'])['sub'])
expired = jwt.encode({'sub': 'c1', 'exp': now - 10}, SECRET, algorithm='HS256')
try:
    jwt.decode(expired, SECRET, algorithms=['HS256'])
except jwt.ExpiredSignatureError as e:
    print('expired token:', e)
forged_payload = base64.urlsafe_b64encode(json.dumps(
    {'sub': 'c1', 'role': 'admin', 'exp': now + 900}).encode()).decode().rstrip('=')
none_header = base64.urlsafe_b64encode(b'{"alg":"none","typ":"JWT"}').decode().rstrip('=')
forged = f'{none_header}.{forged_payload}.'
try:
    jwt.decode(forged, SECRET, algorithms=['HS256'])
except jwt.InvalidTokenError as e:
    print('alg=none forgery rejected:', type(e).__name__)
weak = jwt.encode({'sub': 'c1', 'role': 'customer'}, 'secret123', algorithm='HS256')
for guess in ['password', 'changeme', 'jwtsecret', 'secret', 'secret123']:
    try:
        jwt.decode(weak, guess, algorithms=['HS256'])
        print('weak secret cracked offline:', guess)
        break
    except jwt.InvalidSignatureError:
        pass
```

Lessons: the payload is readable by anyone (never put secrets or personal data you would not show the user in it); always pass the **list of accepted algorithms** when verifying (libraries that accept the token's own `alg` header have allowed `none` and RS256/HS256 confusion forgeries); use a long random secret, or asymmetric keys (RS256/ES256/EdDSA) so that only the auth server can sign while every service can verify; keep access tokens short-lived (5–15 minutes) with rotating refresh tokens. Anyone holding a valid token **is** that user until it expires, so transport it only over TLS.

## 3.3 Multi-factor authentication: TOTP

Passwords are phished and reused; a second factor stops most account takeovers. **TOTP** (RFC 6238), used by authenticator apps, computes a 6-digit code from a shared secret and the current 30-second time step: `HOTP(secret, floor(time / 30))`, where HOTP is a truncated HMAC (RFC 4226). The server stores the secret (encrypted) and accepts the current code, usually also one step either side for clock drift.

```python run TOTP implemented from the RFC and checked against its official test vectors
import hashlib, hmac, struct
def hotp(secret: bytes, counter: int, digits=8, algo=hashlib.sha1) -> str:
    mac = hmac.new(secret, struct.pack('>Q', counter), algo).digest()
    offset = mac[-1] & 0x0F                              # dynamic truncation
    code = (struct.unpack('>I', mac[offset:offset + 4])[0] & 0x7FFFFFFF) % 10 ** digits
    return str(code).zfill(digits)
def totp(secret, unix_time, step=30, digits=8):
    return hotp(secret, unix_time // step, digits)
secret = b'12345678901234567890'                         # the RFC 6238 SHA-1 test key
vectors = {59: '94287082', 1111111109: '07081804', 1111111111: '14050471',
           1234567890: '89005924', 2000000000: '69279037', 20000000000: '65353130'}
for t, expected in vectors.items():
    got = totp(secret, t)
    print(f'T={t:>11}: {got} {"OK" if got == expected else "MISMATCH, expected " + expected}')
print('6-digit code at T=59:', totp(secret, 59, digits=6))
```

All six official test vectors match. Stronger still are **passkeys / WebAuthn** (FIDO2): a key pair per site held by the device or a security key, unlockable by biometrics, and **phishing-resistant** because the browser signs only for the genuine domain. SMS OTPs are better than nothing but vulnerable to SIM swapping; use them as a fallback.

## 3.4 OAuth 2.0 and OpenID Connect

**OAuth 2.0** lets a user grant an application limited access to their data at another service without sharing their password ("allow MeterHub to read your Google Calendar"). **OpenID Connect** (OIDC) adds identity on top ("Sign in with Google"): an **ID token** (a JWT) describing the user.

| Flow | Use |
|---|---|
| Authorization Code + **PKCE** | Web apps, single-page apps and mobile apps: the standard |
| Client Credentials | Service-to-service, no user |
| Device Authorization | TVs and devices without a browser keyboard |
| Implicit, Password | Deprecated: do not use |

In the authorization code flow, the app redirects the user to the provider; the user signs in there; the provider redirects back with a short-lived **code**; the app exchanges the code (plus its credentials) for tokens on a back channel. **PKCE** protects public clients (SPAs, mobile apps) that cannot keep a secret: the app invents a random `code_verifier`, sends only its hash (`code_challenge`) in the first step, and must present the original verifier when exchanging the code, so a stolen code is useless.

```python run PKCE: the verifier, the S256 challenge, and what the server checks
import base64, hashlib, secrets
def b64url(b): return base64.urlsafe_b64encode(b).decode().rstrip('=')
verifier = b64url(secrets.token_bytes(32))                       # kept by the app
challenge = b64url(hashlib.sha256(verifier.encode()).digest())   # sent in the redirect
print('verifier length:', len(verifier), '| challenge length:', len(challenge))
def token_endpoint(code_challenge, presented_verifier):
    return b64url(hashlib.sha256(presented_verifier.encode()).digest()) == code_challenge
print('app presents its verifier:', token_endpoint(challenge, verifier))
print('attacker with a stolen code but no verifier:',
      token_endpoint(challenge, b64url(secrets.token_bytes(32))))
rfc_verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'      # RFC 7636 Appendix B
rfc_challenge = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM'
print('RFC 7636 example challenge matches:',
      b64url(hashlib.sha256(rfc_verifier.encode()).digest()) == rfc_challenge)
```

Always also send and check a random `state` parameter (against CSRF on the redirect), validate the ID token's signature, issuer (`iss`), audience (`aud`), expiry and `nonce`, and use exact redirect-URI matching.

## 3.5 Authorisation

Authentication identifies the user; **authorisation** decides each action. The most common serious vulnerability in real APIs is **broken object-level authorisation** (Chapter 7): checking that the user is logged in but not that **this** bill belongs to them.

| Model | Idea | Fits |
|---|---|---|
| RBAC (role-based) | Permissions attached to roles (customer, operator, admin) | Most applications |
| ABAC (attribute-based) | Rules over attributes of user, resource and context ("operators may edit meters in their region during working hours") | Fine-grained, multi-tenant |
| ReBAC (relationship-based) | Permissions from relationships ("owner of", "member of the team that owns") | Sharing models (Google Docs style); Zanzibar, OpenFGA |

Enforce authorisation **on the server, at the data access layer** (every query filtered by tenant or owner), deny by default, and test it: for each endpoint, a test that another user's id returns 403 or 404.

## 3.6 Spring equivalents and practical lessons

| Concept | Spring |
|---|---|
| Password hashing | `PasswordEncoder`: `Argon2PasswordEncoder`, `BCryptPasswordEncoder`, `DelegatingPasswordEncoder` (`{bcrypt}` prefixes, upgrades) |
| Sessions | Spring Session with Redis; `sessionFixation().newSession()` |
| JWT resource server | `spring-boot-starter-oauth2-resource-server` with `NimbusJwtDecoder` (pinned algorithms) |
| OAuth/OIDC login | `spring-boot-starter-oauth2-client`, `oauth2Login()` (PKCE built in) |
| Authorisation | `@PreAuthorize("@billSecurity.isOwner(#id, authentication)")`, method security |

- Argon2id or bcrypt with per-password salts; rehash on login when parameters rise; check breached passwords.
- Sessions in `HttpOnly; Secure; SameSite` cookies; short-lived JWTs with pinned algorithms and strong keys.
- Offer MFA (TOTP, better passkeys); use Authorization Code + PKCE for OAuth; validate ID tokens fully.
- Authorise every object access on the server, deny by default, and test it.

# Chapter 4: Encryption in Transit: TLS
%How HTTPS works, certificates and chains, verification failures, and mutual TLS

## 4.1 What TLS provides

**TLS** (Transport Layer Security; HTTPS is HTTP over TLS) gives three guarantees on a network connection: **confidentiality** (eavesdroppers on Wi-Fi, ISPs or cloud networks see only ciphertext), **integrity** (modification is detected) and **server authentication** (you are talking to the real `api.meterhub.in`, not an impostor). In TLS 1.3 the handshake:

1. The client sends `ClientHello` with supported cipher suites and an **ephemeral X25519 key share**.
2. The server replies with its key share; both derive the session keys (Section 2.4); the rest of the handshake is already encrypted.
3. The server sends its **certificate chain** and a **signature** over the handshake with its private key, proving it owns the certificate.
4. The client **verifies the chain** up to a trusted root certificate authority (CA), checks that the certificate is valid now and that its **Subject Alternative Name** matches the host name, then checks the signature.
5. Application data flows, encrypted with AES-GCM or ChaCha20-Poly1305.

Because the key exchange is ephemeral, recorded traffic cannot be decrypted later even if the server's private key leaks (**forward secrecy**). Use TLS 1.2 or 1.3 only.

## 4.2 Certificates, a private CA and a real TLS connection

A **certificate** binds a public key to names (`CN`, and more importantly `subjectAltName` entries such as `DNS:api.meterhub.in`), signed by a CA. Browsers and operating systems trust a set of root CAs; public sites get certificates from them (free and automated with **Let's Encrypt** and the ACME protocol, renewed every 60–90 days). Internal services often use a **private CA**, as below.

```python run Building a private CA and a server certificate with the openssl command line
import os, subprocess, tempfile
d = tempfile.mkdtemp()
def sh(cmd):
    return subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True,
                          cwd=d).stdout.strip()
ec = '-newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes'      # P-256 elliptic-curve keys
sh(f'openssl req -x509 {ec} -days 3650 -keyout ca.key -out ca.crt '
   '-subj "/CN=MeterHub Internal Root CA" '
   '-addext "basicConstraints=critical,CA:TRUE" '                  # this certificate is a CA
   '-addext "keyUsage=critical,keyCertSign,cRLSign"')               # ... that may sign certs
sh(f'openssl req {ec} -keyout server.key -out server.csr -subj "/CN=api.meterhub.local"')
with open(os.path.join(d, 'server.ext'), 'w') as f:
    f.write('subjectAltName=DNS:api.meterhub.local,DNS:localhost,IP:127.0.0.1\n'
            'keyUsage=critical,digitalSignature\nextendedKeyUsage=serverAuth\n')
sh('openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -days 90 '
   '-extfile server.ext -out server.crt')
print(sh('openssl x509 -in server.crt -noout -subject -issuer -ext subjectAltName'))
print(sh('openssl verify -CAfile ca.crt server.crt'))
print('files:', sorted(f for f in os.listdir(d) if not f.endswith('.srl')))
```

> NOTE: The private keys (`*.key`) are the crown jewels: mode 600, never in Git, ideally generated and kept in an HSM or a cloud KMS, and the CA key offline.

```python run A TLS 1.3 connection, then three ways verification fails
import socket, ssl, subprocess, threading
from seclab import make_pki, sh
d = make_pki()                               # the same commands as above, plus a client cert
def start_server(cert, key):
    ctx = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
    ctx.load_cert_chain(cert, key)
    lsock = socket.create_server(('127.0.0.1', 0))
    def serve():
        while True:
            conn, _ = lsock.accept()
            try:
                with ctx.wrap_socket(conn, server_side=True) as tls:
                    tls.sendall(b'ok')
            except (ssl.SSLError, OSError):
                pass
    threading.Thread(target=serve, daemon=True).start()
    return lsock.getsockname()[1]
def connect(port, cafile, hostname):
    ctx = ssl.create_default_context(cafile=cafile)         # verification is ON by default
    with socket.create_connection(('127.0.0.1', port)) as raw:
        try:
            with ctx.wrap_socket(raw, server_hostname=hostname) as tls:
                cn = dict(x[0] for x in tls.getpeercert()['subject'])['commonName']
                return f'OK {tls.version()} {tls.cipher()[0]}, server CN {cn}'
        except ssl.SSLCertVerificationError as e:
            return f'REFUSED: {e.verify_message}'
port = start_server(f'{d}/server.crt', f'{d}/server.key')
print('trusted CA, right name:', connect(port, f'{d}/ca.crt', 'api.meterhub.local'))
print('trusted CA, wrong name:', connect(port, f'{d}/ca.crt', 'api.evil.example'))
print('system CAs only:       ', connect(port, None, 'api.meterhub.local'))
sh('openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes -days 30 '
   '-keyout lazy.key -out lazy.crt -subj "/CN=Lazy CA"', d)          # no CA extensions
sh('openssl x509 -req -in server.csr -CA lazy.crt -CAkey lazy.key -CAcreateserial -days 30 '
   '-extfile server.ext -out lazy-server.crt', d)
port2 = start_server(f'{d}/lazy-server.crt', f'{d}/server.key')
print('CA without key usage:  ', connect(port2, f'{d}/lazy.crt', 'api.meterhub.local'))
```

The first connection negotiated TLS 1.3 with AES-256-GCM. The second failed because the certificate does not list that host name: exactly what stops an attacker who has **some** valid certificate from impersonating your API. The third failed because the operating system does not trust the private CA. Each failure is the protection working.

The fourth is an honest surprise from building this book. The first version of the CA was made with the minimal one-line `openssl req -x509` command, without the `basicConstraints` and `keyUsage` extensions, and **every** connection failed, even the correct one. Python 3.13 turned on strict X.509 checking (`VERIFY_X509_STRICT`) by default, and a CA certificate must state that it may sign certificates. Many online tutorials still show the minimal command; the extensions in the previous example are what a real CA certificate needs.

> TRAP: The most common TLS bug in application code is **turning verification off** to "fix" an error: `verify=False` in Python requests, `CURLOPT_SSL_VERIFYPEER=0`, a Java `TrustManager` that trusts everything, `NODE_TLS_REJECT_UNAUTHORIZED=0`. That silently re-enables man-in-the-middle attacks. Fix the trust store (add the internal CA) instead.

## 4.3 Mutual TLS for services and devices

In **mutual TLS (mTLS)** the client also presents a certificate, and the server verifies it. It authenticates machines: microservices inside a cluster (service meshes such as Istio and Linkerd issue and rotate certificates automatically), partner integrations, and IoT devices such as smart meters, each provisioned with its own certificate at the factory.

```python run The server requires a client certificate signed by the device CA
import os, socket, ssl, threading, time
from seclab import make_pki
os.chdir(make_pki())             # CA, server certificate and a client certificate CN=SM-42
srv = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH, cafile='ca.crt')
srv.load_cert_chain('server.crt', 'server.key')
srv.verify_mode = ssl.CERT_REQUIRED                       # demand a client certificate
lsock = socket.create_server(('127.0.0.1', 0)); port = lsock.getsockname()[1]
seen = []
def serve():
    while True:
        conn, _ = lsock.accept()
        try:
            with srv.wrap_socket(conn, server_side=True) as tls:
                cn = dict(x[0] for x in tls.getpeercert()['subject'])['commonName']
                seen.append(cn); tls.sendall(f'hello {cn}'.encode())
        except (ssl.SSLError, OSError):
            seen.append('handshake rejected')
threading.Thread(target=serve, daemon=True).start()
def device(with_cert):
    ctx = ssl.create_default_context(cafile='ca.crt')
    if with_cert:
        ctx.load_cert_chain('meter.crt', 'meter.key')
    with socket.create_connection(('127.0.0.1', port)) as raw:
        try:
            with ctx.wrap_socket(raw, server_hostname='localhost') as tls:
                return tls.recv(100).decode() or '(connection closed by server)'
        except (ssl.SSLError, ConnectionResetError, OSError) as e:
            return f'failed: {type(e).__name__}'
print('meter with its certificate:', device(True))
print('client without a certificate:', device(False))
time.sleep(0.2)
print('server log:', seen)
```

The server learned the device identity (`SM-42`) from the verified certificate, with no password involved; a client without a certificate was rejected during the handshake (in TLS 1.3 the client may only discover this when it reads). Revocation (a stolen meter) uses certificate revocation lists, OCSP, or simply short-lived certificates that are renewed automatically.

## 4.4 TLS in production

| Practice | Why |
|---|---|
| TLS everywhere, including internal traffic and database connections | "Inside the firewall" is not a trust boundary in the cloud |
| Redirect HTTP to HTTPS and send **HSTS** (`Strict-Transport-Security: max-age=31536000; includeSubDomains`) | Prevents downgrade to plain HTTP on later visits |
| TLS 1.2+ only; modern cipher suites; ECDSA or RSA-2048+ keys | Disables broken protocols and ciphers |
| Automated renewal (ACME, cert-manager) and expiry monitoring | Expired certificates are a classic cause of outages |
| Terminate TLS at the load balancer **and** re-encrypt to the service if the network is shared | End-to-end protection |
| Keep private keys in KMS/HSM where possible | Key theft is impersonation |

## 4.5 Practical lessons

- TLS 1.3: ephemeral key exchange (forward secrecy), certificate-based server authentication, AEAD encryption.
- Certificates bind keys to names (SAN); verification checks chain, validity period and host name; never disable it.
- mTLS authenticates services and devices; automate issuance and rotation.
- HSTS, automated renewal and monitoring are part of the job.
