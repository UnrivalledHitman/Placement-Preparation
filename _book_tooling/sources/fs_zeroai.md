# Chapter 1: Struggle-First Blank-File Protocol
%Reversing AI cognitive atrophy while shipping production-grade full-stack systems

Modern AI coding assistants accelerate boilerplate, but unchecked autocomplete quietly erodes the exact mental muscles tested in 14–18 LPA product interviews and senior freelance reviews: cold problem decomposition, reading stack traces without panic, reasoning about database locks, and auditing security boundaries line by line.

## 1.1 The 30–45 Minute Unassisted Window

Every full-stack study block and every Friday Proof Gate follows one strict operating rule: **AI extensions disabled, chat windows closed, blank file first.**

| Phase | Duration | Allowed Tools | Forbidden |
|---|---|---|---|
| 1. Spec & Design | 5–10 min | Pen, paper, official docs (MDN, Prisma, Node) | Copilot, ChatGPT, Claude, Cursor Tab |
| 2. Struggle-First Build | 30–45 min | Plain editor, compiler, terminal, debugger | Copy-pasting whole routes or solutions |
| 3. Targeted Clip Lookup | 10–15 min | Single Hitesh clip or Repo PDF section for the exact blocker | Watching 2-hour tutorials linearly |
| 4. Refactor & Audit | 10–15 min | Tests (`vitest`, `supertest`), `curl`, SQL `EXPLAIN` | Shipping unverified code |

> TRAP: Watching a 45-minute video and typing along produces an *illusion of competence*. Your brain only builds retrieval pathways when you hit a real error message (`ECONNREFUSED`, `401 Unauthorized`, `P2025`, `ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH`) and diagnose it yourself.

## 1.2 Diagnosing Cognitive Atrophy Symptoms

Before starting Week 1, audit your habits honestly:

- **Blank-file freeze:** Staring at an empty `auth.ts` without knowing how to structure middleware, DTO validation, and error responses.
- **Documentation avoidance:** Asking an LLM for a `crypto.createHmac` signature instead of checking the 6-line Node.js docs.
- **Silent error swallowing:** Writing `try { ... } catch { return null; }` so bugs vanish instead of surfacing with HTTP status codes and structured logs.
- **Blind trust in client payloads:** Accepting `totalAmount`, `userId`, or `imageUrl` directly from `req.body` without server-side ownership or integrity checks.

> TIP: Keep a one-line **Daily Bug Diagnostic** in your tracker notes whenever you get stuck during the 30–45m window. Format: `Symptom -> Root cause -> Permanent guardrail`.

# Chapter 2: Production Auth, RBAC, IDOR & SSRF Hardening
%Hardening REST and Next.js backends, tailored to fixing real flaws in Face-Detector-using-API

Authentication proves *who* the caller is; authorization proves *what* they are allowed to touch. Most portfolio projects implement a partial login route and stop before rotation, revocation, ownership enforcement, and egress filtering.

## 2.1 Argon2id Passwords + Short-Lived JWT Access + Rotating Refresh Cookies

Never store raw or unsalted SHA-256 hashes, and never store long-lived JWTs in `localStorage` (one XSS payload exfiltrates every session). Use a dual-token architecture:

- **Access token:** Signed JWT (`HS256` or `EdDSA`), 15-minute TTL, returned in JSON or short-lived cookie, statelessly verified on API routes.
- **Refresh token:** 32-byte cryptographically random opaque string (`crypto.randomBytes(32).toString('hex')`), stored **hashed** (`SHA-256`) in Postgres `refresh_tokens`, delivered ONLY in an `HttpOnly; Secure; SameSite=Lax; Path=/api/auth/refresh` cookie.
- **Rotation & Reuse Detection:** Every `/api/auth/refresh` call revokes the presented token and issues a new pair inside one DB transaction. If a *revoked* token is presented again, revoke the entire token family (compromise detected).

```typescript Password hashing & refresh rotation (auth.service.ts)
import argon2 from "argon2";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const ACCESS_TTL_SEC = 15 * 60;
const REFRESH_TTL_MS = 14 * 24 * 60 * 60 * 1000;

export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MiB
    timeCost: 3,
    parallelism: 1,
  });
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  return argon2.verify(hash, plain);
}

export function signAccessToken(userId: string, role: "CUSTOMER" | "ADMIN"): string {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret || secret.length < 32) throw new Error("JWT_ACCESS_SECRET missing");
  return jwt.sign({ sub: userId, role }, secret, {
    algorithm: "HS256",
    expiresIn: ACCESS_TTL_SEC,
  });
}

export function mintRefreshToken(): { raw: string; hash: string; expiresAt: Date } {
  const raw = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, hash, expiresAt: new Date(Date.now() + REFRESH_TTL_MS) };
}
```

## 2.2 Role-Based Access Control (RBAC) & Killing IDOR

**IDOR (Insecure Direct Object Reference)** occurs when an endpoint trusts a user-supplied ID (`GET /profile/:id` or `POST /image` with `{ id }` in the body) without checking `req.user.sub`. In legacy implementations of `Face-Detector-using-API`, any authenticated—or even unauthenticated—caller can pass another user's `id` to read their profile or increment their entry counter.

| Vulnerable Pattern | Exploit | Hardened Replacement |
|---|---|---|
| `GET /profile/:id` | Attacker iterates `id=1,2,3...` | `GET /api/me` using `req.user.sub` (or assert `id === req.user.sub \|\| role === "ADMIN"`) |
| `POST /image` with `{ id }` | Attacker inflates arbitrary user entries | Derive `userId` strictly from verified JWT `req.user.sub` |
| `DELETE /orders/:id` | Any customer cancels another's order | `WHERE id = $1 AND user_id = $2` in SQL / Prisma |

```typescript RBAC & ownership middleware (middleware/auth.ts)
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthUser {
  sub: string;
  role: "CUSTOMER" | "ADMIN";
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }
  try {
    const payload = jwt.verify(
      header.slice(7),
      process.env.JWT_ACCESS_SECRET!,
      { algorithms: ["HS256"] }
    ) as AuthUser;
    (req as Request & { user: AuthUser }).user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: "INVALID_OR_EXPIRED_TOKEN" });
  }
}

export function requireRole(...roles: AuthUser["role"][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as Request & { user?: AuthUser }).user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: "FORBIDDEN" });
    }
    return next();
  };
}
```

> EXAM: Always pass `{ algorithms: ["HS256"] }` explicitly to `jwt.verify`. Never rely on the JWT header's `alg` claim alone, which historically enabled `alg: none` and RS256-to-HS256 confusion attacks.

## 2.3 Killing SSRF in Image-URL Endpoints

Whenever a server fetches a user-supplied URL (such as forwarding an image URL in `Face-Detector-using-API` or fetching remote avatars), an attacker can supply `http://169.254.169.254/latest/meta-data/`, `http://127.0.0.1:5432/`, or a DNS-rebinding domain that resolves to `10.0.0.5`.

A production SSRF defense requires **four layers**, never a naive regex:

1. **Scheme & port allowlist:** Allow ONLY `https:` (and optional `http:` in dev) on standard ports `443`/`80`. Reject credentials (`user:pass@host`).
2. **DNS resolution before connect:** Call `dns.lookup(hostname, { all: true })` and verify **every** returned IPv4/IPv6 address is public—reject loopback (`127.0.0.0/8`, `::1`), RFC1918 private (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), link-local / cloud metadata (`169.254.0.0/16`, `fe80::/10`), CGNAT (`100.64.0.0/10`), and IPv4-mapped IPv6 (`::ffff:127.0.0.1`).
3. **Disable automatic redirects:** Use `redirect: "manual"`. If a `3xx` response arrives, validate the `Location` header through the same SSRF guard before following (max 2 hops).
4. **Timeout, size cap & MIME check:** Abort after 5s (`AbortSignal.timeout(5000)`), cap body bytes (`<= 5 MB`), and validate magic bytes (JPEG/PNG/WebP).

```typescript Production SSRF guard (security/ssrf.ts)
import dns from "dns/promises";
import net from "net";

function isBlockedIPv4(ip: string): boolean {
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((x) => Number.isNaN(x))) return true;
  if (p[0] === 0 || p[0] === 10 || p[0] === 127) return true;
  if (p[0] === 169 && p[1] === 254) return true; // AWS/GCP/Azure metadata
  if (p[0] === 172 && p[1] >= 16 && p[1] <= 31) return true;
  if (p[0] === 192 && p[1] === 168) return true;
  if (p[0] === 100 && p[1] >= 64 && p[1] <= 127) return true; // CGNAT
  if (p[0] >= 224) return true; // Multicast & reserved
  return false;
}

function isBlockedIP(ip: string): boolean {
  if (net.isIPv4(ip)) return isBlockedIPv4(ip);
  const low = ip.toLowerCase();
  if (low === "::1" || low === "::") return true;
  if (low.startsWith("fc") || low.startsWith("fd") || low.startsWith("fe80:")) return true;
  if (low.startsWith("::ffff:")) return isBlockedIPv4(low.slice(7));
  return false;
}

export async function safeFetchImage(rawUrl: string): Promise<Response> {
  const url = new URL(rawUrl);
  if (url.protocol !== "https:") throw new Error("ONLY_HTTPS_ALLOWED");
  if (url.username || url.password) throw new Error("CREDENTIALS_IN_URL_BLOCKED");
  if (url.port && url.port !== "443") throw new Error("NON_STANDARD_PORT_BLOCKED");

  const records = await dns.lookup(url.hostname, { all: true });
  if (!records.length || records.some((r) => isBlockedIP(r.address))) {
    throw new Error("SSRF_PRIVATE_OR_METADATA_IP_BLOCKED");
  }
  const res = await fetch(url.toString(), {
    method: "GET",
    redirect: "manual",
    signal: AbortSignal.timeout(5000),
  });
  if (res.status >= 300 && res.status < 400) {
    throw new Error("REDIRECTS_BLOCKED_ON_IMAGE_FETCH");
  }
  return res;
}
```

## 2.4 Eliminating `try { throw ... } catch { throw null }` Error Swallowing

One classic bug found in portfolio backends (including early `Face-Detector-using-API` code) is catching an error only to rethrow `null` or return `200 OK` with an empty object. That destroys stack traces, hides upstream 5xx outages, and misleads clients.

```typescript Typed AppError & central Express error handler (errors.ts)
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly expose = true
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(err: unknown, _req: any, res: any, _next: any) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.code,
      message: err.expose ? err.message : "Request failed",
    });
  }
  // Log full structured error server-side; never leak internals to client
  console.error({ level: "error", err });
  return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
}
```

# Chapter 3: Production Postgres + Prisma E-Commerce Architecture
%Integer-paise ledgers, atomic inventory locking, and banning cold-start DDL

E-commerce bugs cost real money. Floating-point rupee arithmetic (`0.1 + 0.2 = 0.30000000000000004`), race conditions on the last stock unit, and schema mutations hidden inside request handlers will fail both client audits and backend interviews.

## 3.1 Core 6-Table Schema (`integer` Paise, Never `Float`)

Store every monetary value as an **integer in smallest currency unit (paise)**: Rs 4,999.00 is `499900`. Convert to rupees strictly at the UI presentation layer.

| Table | Primary Columns | Production Invariant |
|---|---|---|
| `users` | `id`, `email` (unique), `password_hash`, `role` | Indexed unique lowercase email; Argon2id hash |
| `products` | `id`, `slug` (unique), `title`, `gst_bps` (300 = 3%) | SEO slug unique; soft-delete `archived_at` |
| `product_variants` | `id`, `product_id`, `sku` (unique), `price_paise`, `stock_qty` | `CHECK (stock_qty >= 0)` & `CHECK (price_paise > 0)` |
| `orders` | `id`, `user_id`, `status`, `subtotal_paise`, `gst_paise`, `total_paise` | Server-computed totals; immutable after `PAID` |
| `order_items` | `id`, `order_id`, `variant_id`, `qty`, `unit_price_paise` | Snapshots price at checkout time |
| `payments` | `id`, `order_id`, `provider_order_id`, `provider_payment_id` (unique), `status` | Unique constraint prevents duplicate webhook credit |

```text Prisma schema excerpt (prisma/schema.prisma)
model ProductVariant {
  id         String      @id @default(cuid())
  productId  String
  sku        String      @unique
  sizeLabel  String
  pricePaise Int         // e.g. 499900 = Rs 4,999.00 (never Float!)
  stockQty   Int         // guarded by DB CHECK (stock_qty >= 0)
  product    Product     @relation(fields: [productId], references: [id])
  orderItems OrderItem[]
  @@index([productId])
}

model Payment {
  id                String   @id @default(cuid())
  orderId           String
  providerOrderId   String   @unique
  providerPaymentId String?  @unique
  amountPaise       Int
  status            String   // CREATED | CAPTURED | FAILED | REFUNDED
  createdAt         DateTime @default(now())
  order             Order    @relation(fields: [orderId], references: [id])
}
```

## 3.2 Atomic Stock Reservation (`UPDATE ... WHERE stock_qty >= qty`)

Never do `const v = await findUnique(); if (v.stockQty >= qty) await update({ stockQty: v.stockQty - qty })`. Under two concurrent checkout requests for the last 1 unit, both reads see `stockQty = 1` and oversell to `-1`.

Instead, execute a single **atomic conditional update** inside `prisma.$transaction`:

```typescript Oversell-proof atomic stock decrement (checkout.service.ts)
export async function reserveStockTx(
  tx: Prisma.TransactionClient,
  items: { variantId: string; qty: number }[]
) {
  // Sort by variantId to guarantee consistent lock order and avoid deadlocks
  const sorted = [...items].sort((a, b) => a.variantId.localeCompare(b.variantId));

  for (const item of sorted) {
    if (!Number.isInteger(item.qty) || item.qty <= 0) {
      throw new AppError(400, "INVALID_QTY", "Quantity must be positive integer");
    }
    const updated = await tx.productVariant.updateMany({
      where: {
        id: item.variantId,
        stockQty: { gte: item.qty },
      },
      data: {
        stockQty: { decrement: item.qty },
      },
    });
    if (updated.count !== 1) {
      throw new AppError(409, "OUT_OF_STOCK", `Insufficient stock: ${item.variantId}`);
    }
  }
}
```

> TIP: Sorting `variantId` before acquiring row locks eliminates classic two-transaction AB/BA deadlocks when two shoppers buy the same two SKUs in opposite cart orders.

## 3.3 Banning Cold-Start `$executeRawUnsafe` DDL

Running `CREATE TABLE IF NOT EXISTS ...` or `ALTER TABLE ...` inside Next.js API routes via `$executeRawUnsafe` on cold start is a severe anti-pattern:

1. **Lock contention:** Concurrent serverless lambdas race on DDL metadata locks and time out.
2. **Privilege violation:** The runtime app DB role should ONLY have `SELECT, INSERT, UPDATE, DELETE`—never `CREATE`/`DROP`/`ALTER`.
3. **Drift:** Schema history disappears outside Git.

**Production rule:** Every schema change lives in `prisma/migrations/*.sql` (including custom `CHECK (stock_qty >= 0)` constraints) and executes ONCE in CI/CD via `npx prisma migrate deploy` using a dedicated migration credential.

# Chapter 4: Server-Derived GST, Razorpay Webhooks & Idempotency
%Zero-trust checkout math and cryptographic webhook verification

## 4.1 Server-Derived Pricing & 3% Jewellery GST

The client sends **ONLY** `[{ variantId, qty }]` and an optional `couponCode`. The server looks up `pricePaise` from `product_variants`, validates the coupon, computes 3% GST (`Math.round(taxablePaise * 3 / 100)`), and persists the order before creating the Razorpay order.

```typescript Deterministic server-side pricing in paise (pricing.ts)
export interface PriceSummary {
  subtotalPaise: number;
  discountPaise: number;
  gstPaise: number;
  totalPaise: number;
}

export function computeJewelleryTotals(
  lines: { pricePaise: number; qty: number }[],
  discountBps = 0
): PriceSummary {
  const subtotalPaise = lines.reduce((sum, l) => sum + l.pricePaise * l.qty, 0);
  const discountPaise = Math.round((subtotalPaise * discountBps) / 10000);
  const taxablePaise = Math.max(0, subtotalPaise - discountPaise);
  const gstPaise = Math.round((taxablePaise * 300) / 10000); // 3% jewellery GST
  return {
    subtotalPaise,
    discountPaise,
    gstPaise,
    totalPaise: taxablePaise + gstPaise,
  };
}
```

## 4.2 Razorpay HMAC-SHA256 Webhook Verification (`timingSafeEqual`)

Never mark an order `PAID` solely from a browser redirect callback—users close tabs, lose mobile signal, or tamper with query strings. The **signed webhook** (`payment.captured` / `order.paid`) is the source of truth.

Critical rules:
- Read the **exact raw bytes** (`await req.arrayBuffer()` in Next.js App Router or `express.raw({ type: "application/json" })`). Re-stringifying parsed JSON breaks signature matching!
- Compute `HMAC-SHA256(rawBodyBuffer, RAZORPAY_WEBHOOK_SECRET)` as a hex `Buffer`.
- Compare lengths first, then call `crypto.timingSafeEqual(expectedBuf, receivedBuf)`.

```typescript Raw-buffer Razorpay webhook verification (webhooks/razorpay.ts)
import crypto from "crypto";

export function verifyRazorpaySignature(
  rawBody: Buffer,
  signatureHeader: string | null,
  webhookSecret: string
): boolean {
  if (!signatureHeader || !webhookSecret) return false;
  const expectedHex = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  const expectedBuf = Buffer.from(expectedHex, "utf8");
  const receivedBuf = Buffer.from(signatureHeader.trim(), "utf8");
  if (expectedBuf.length !== receivedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}
```

## 4.3 Idempotent Order State Machine

Payment gateways retry webhooks at-least-once. If `payment.captured` arrives three times, your handler must transition `PENDING -> PAID` once and return `200 OK` on duplicates without double-sending emails or crashing.

```text Order State Machine (valid transitions only)
PENDING_PAYMENT ---> PAID ---> PACKED ---> SHIPPED ---> DELIVERED
       |              |
       v              v
   CANCELLED       REFUNDED
  (release stock)  (partial/full)
```

Implement idempotency with a `webhook_events(event_id PRIMARY KEY, received_at)` table or conditional update `UPDATE orders SET status = 'PAID' WHERE id = $1 AND status = 'PENDING_PAYMENT'`. If `rowCount === 0`, inspect current status: if already `PAID`, return `200 { ok: true, idempotent: true }`.

# Chapter 5: Testing, Error Boundaries, Docker, Redis & CI
%Proving correctness automatically on every push

## 5.1 Testing Pyramid: Vitest, Supertest & Playwright E2E

| Layer | Tool | What It Proves | Target Runtime |
|---|---|---|---|
| Unit | Vitest | `computeJewelleryTotals`, `verifyRazorpaySignature`, `isBlockedIP` | < 3 sec |
| Integration | Vitest + Supertest | Real Postgres transaction: concurrent checkout stock race, IDOR 403, webhook replay 200 | < 20 sec |
| End-to-End | Playwright | Mobile 375px browse -> add to cart -> checkout form -> order confirmation | < 60 sec |

## 5.2 React Error Boundaries

An unhandled render exception in one widget (e.g., a malformed product spec) must never blank out the entire storefront. Wrap dynamic route segments with a class `ErrorBoundary` (or Next.js `error.tsx`) that logs the error and offers a clean recovery button.

## 5.3 Multi-Stage Production Dockerfile

Keep production Node images slim, deterministic, and non-root:

```text Multi-stage Dockerfile for Node/Next.js backend
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app
COPY --from=builder --chown=app:app /app/package*.json ./
COPY --from=builder --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/dist ./dist
COPY --from=builder --chown=app:app /app/prisma ./prisma
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/server.js"]
```

## 5.4 Rate Limiting: Serverless vs Container (Upstash Redis)

In-memory `Map` rate limiters break immediately on Vercel/serverless (each invocation cold-starts a new isolate) and on multi-replica containers.

- **Serverless (Vercel/Next.js Edge):** Use **Upstash Redis** over HTTP (`@upstash/ratelimit` sliding window: e.g., 5 login attempts / 15 min per IP+email, 30 checkout calls / min). Zero persistent TCP sockets to exhaust.
- **Long-running containers (Docker/ECS/VPS):** Use local/managed Redis over TCP (`ioredis` + Lua token-bucket script) for sub-millisecond atomic increments.

## 5.5 GitHub Actions CI Gate

Every PR must pass lint, typecheck, Vitest unit/integration tests (backed by a Postgres service container), and production build before merge:

```text .github/workflows/ci.yml (minimal production gate)
name: CI
on: [push, pull_request]
jobs:
  verify:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env: { POSTGRES_PASSWORD: test, POSTGRES_DB: app_test }
        ports: ["5432:5432"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run typecheck && npm run lint
      - run: npx prisma migrate deploy
        env: { DATABASE_URL: postgres://postgres:test@localhost:5432/app_test }
      - run: npm test
      - run: npm run build
```

# Chapter 6: 12 Weekly Zero-AI Friday Proof Gates (F1.1–F6.2)
%Attempt each gate on Fridays (Weeks 1–12) from a blank file with AI completely off

Every Friday during Phase 1 (Weeks 1–12), allocate a strict 90–120 minute **Zero-AI Proof Gate**. Mark `✓` only when tests pass without AI assistance, `~` if you needed a hint, and `✗` if you had to inspect a reference solution (schedule a 7-day redo).

## Part 1: Auth, Security & Error Handling (Weeks 1–4)

**F1.1 · Medium · Build · Zero-AI Argon2id + JWT Access & Rotating Refresh Cookie.** From a blank file, implement `/auth/register`, `/auth/login`, `/auth/refresh`, and `/auth/logout` with Argon2id hashing, 15m JWT access tokens, `HttpOnly` refresh cookies, SHA-256 DB storage, and reuse detection.

**F1.2 · Medium · Debug · Kill IDOR & Error Swallowing in Face-Detector-using-API.** Refactor vulnerable `GET /profile/:id` and `POST /image` routes to derive `userId` exclusively from `req.user.sub`, enforce `requireRole`, and replace every `try { throw ... } catch { throw null }` with typed `AppError` responses.

**F2.1 · Hard · Build · Four-Layer SSRF Guard for Remote Image Fetching.** Write `safeFetchImage(url)` with HTTPS allowlist, `dns.lookup({ all: true })` private/metadata IPv4+IPv6 CIDR blocking, `redirect: "manual"`, 5s timeout, 5 MB cap, and unit tests covering `169.254.169.254`, `::ffff:127.0.0.1`, and 302 redirects.

**F2.2 · Medium · Build · Upstash Redis Sliding-Window Rate Limiter.** Implement IP + email rate limiting on `/auth/login` (5 req / 15m) returning `429` with `Retry-After` headers, plus a clean fallback policy and automated test verifying lockout and reset.

## Part 2: Postgres, Prisma & Payment Integrity (Weeks 5–8)

**F3.1 · Medium · Design · 6-Table Integer-Paise E-Commerce Schema & Migrations.** Author the Prisma schema (`users`, `products`, `product_variants`, `orders`, `order_items`, `payments`) with integer paise, composite indexes, SQL `CHECK (stock_qty >= 0)` migration, and zero cold-start `$executeRawUnsafe` calls.

**F3.2 · Hard · Build · Oversell-Proof Concurrent Stock Reservation.** Implement `reserveStockTx` using sorted `variantId` locking and atomic `UPDATE ... WHERE stock_qty >= qty`, then write a Supertest concurrency test firing 10 parallel checkouts for 3 units and asserting exactly 3 succeed and 7 return `409`.

**F4.1 · Medium · Build · Server-Derived Jewellery Pricing & 3% GST Engine.** Write a zero-trust `/api/checkout/quote` endpoint that ignores client totals, calculates subtotal, coupon discount, and 3% GST in integer paise, and passes 15 boundary unit tests in Vitest.

**F4.2 · Hard · Build · Razorpay HMAC-SHA256 Raw-Buffer Webhook & Idempotency.** Implement `/api/webhooks/razorpay` verifying `x-razorpay-signature` on raw bytes via `crypto.timingSafeEqual`, transitioning `PENDING_PAYMENT -> PAID` idempotently, and passing replay/tamper Supertest cases.

## Part 3: Testing, Resilience, Docker & CI (Weeks 9–12)

**F5.1 · Medium · Test · Supertest Integration Suite with Postgres Rollbacks.** Build an automated integration test harness testing registration, auth refresh rotation, IDOR 403, atomic checkout, and webhook capture against a real test Postgres database.

**F5.2 · Medium · Build · React Error Boundary & Graceful Checkout Fallback.** Implement a typed React `ErrorBoundary` + Next.js `error.tsx` around the storefront catalog and checkout, verify fallback rendering in Vitest/Playwright when a child throws, and ensure zero unhandled promise rejections.

**F6.1 · Medium · Deploy · Multi-Stage Non-Root Production Dockerfile.** Build a multi-stage Alpine Docker image running as non-root `app`, verify image size, `HEALTHCHECK`, and clean `SIGTERM` graceful shutdown without dropping in-flight HTTP requests.

**F6.2 · Hard · Pipeline · Full GitHub Actions CI + Playwright Mobile E2E Gate.** Wire `.github/workflows/ci.yml` running typecheck, lint, Prisma migrations on a Postgres service container, Vitest/Supertest suite, and a Playwright 375px mobile checkout smoke test from a clean checkout.

## Hints (Read Only After 30 Minutes of Unassisted Effort)

| Exercise | Targeted Hint |
|---|---|
| F1.1 | Hash the opaque refresh token with SHA-256 before DB insert; on reuse of a revoked hash, `UPDATE refresh_tokens SET revoked_at = NOW() WHERE family_id = $1`. |
| F1.2 | Never read `req.body.id` for the acting user; pass `req.user.sub` from `requireAuth` and verify `err instanceof AppError` in your 4-arg Express error middleware. |
| F2.1 | Check `net.isIPv4`, handle `::ffff:` IPv4-mapped IPv6 addresses, and inspect `res.status >= 300 && res.status < 400` when `redirect: "manual"` is set. |
| F2.2 | Key the limiter on both `ip` and normalized `email` so credential-stuffing from rotating IPs still throttles a single target account. |
| F3.1 | Generate SQL migration with `prisma migrate dev --create-only`, append `ALTER TABLE ... ADD CONSTRAINT stock_nonneg CHECK ("stockQty" >= 0);`, then apply. |
| F3.2 | Wrap `updateMany({ where: { id, stockQty: { gte: qty } }, data: { stockQty: { decrement: qty } } })` inside `prisma.$transaction` and fire `Promise.all` in the test. |
| F4.1 | Use integer basis points (`300` for 3% GST) and `Math.round((taxablePaise * 300) / 10000)` so floating-point fractions never enter totals. |
| F4.2 | Mount `express.raw({ type: "application/json" })` ONLY on the webhook route before `express.json()`, and check `expectedBuf.length === receivedBuf.length` before `timingSafeEqual`. |
| F5.1 | Truncate tables with `TRUNCATE ... RESTART IDENTITY CASCADE` in `beforeEach` for deterministic, isolated integration tests. |
| F5.2 | Implement `getDerivedStateFromError` and `componentDidCatch`, and test by rendering a component that throws inside a mocked error boundary wrapper. |
| F6.1 | Handle `process.on("SIGTERM", () => server.close(() => prisma.$disconnect().then(() => process.exit(0))))`. |
| F6.2 | Use `npx playwright test --project=mobile-chrome` with viewport `375x812` and add a Postgres healthcheck (`pg_isready`) on the GitHub Actions service. |

## Verification Rubrics & Solution Checkpoints

### F1.1 Auth Rotation Checkpoint
Confirm: (1) DB never stores plaintext password or raw refresh token; (2) presenting an old rotated refresh cookie returns `401` and revokes the family; (3) `Set-Cookie` includes `HttpOnly; SameSite=Lax; Path=/api/auth/refresh`.

### F1.2 IDOR & Error Swallowing Checkpoint
Confirm: (1) `GET /api/me` ignores query/path IDs; (2) calling `POST /image` as User A cannot mutate User B; (3) forced DB failure returns structured `500 { error: "INTERNAL_SERVER_ERROR" }` with full server log and zero `throw null`.

### F2.1 SSRF Guard Checkpoint
Confirm unit tests reject `http://169.254.169.254`, `https://127.0.0.1`, `https://[::ffff:127.0.0.1]`, `file:///etc/passwd`, and any `302` redirect to an internal address.

### F2.2 Redis Rate Limiter Checkpoint
Confirm requests 1–5 return `401` (invalid creds) and request 6 returns `429` with `Retry-After` populated from Redis TTL.

### F3.1 E-Commerce Schema Checkpoint
Confirm `grep -rn "executeRawUnsafe" src/` returns 0 hits, all money columns end in `Paise` (`Int`), and inserting `stockQty = -1` fails at Postgres constraint level.

### F3.2 Atomic Concurrency Checkpoint
Confirm `Promise.all` of 10 concurrent checkouts against `stockQty = 3` yields `3` HTTP `201`, `7` HTTP `409`, and final `stockQty === 0` in Postgres.

### F4.1 Server-Derived GST Checkpoint
Confirm sending `{ totalPaise: 1 }` in the request body has zero effect on the returned quote and 3% GST matches integer-paise rounding to the exact paisa.

### F4.2 Razorpay Webhook Checkpoint
Confirm: (1) 1-byte tampered body returns `400/401`; (2) valid signed `payment.captured` transitions order to `PAID`; (3) replaying the exact same webhook returns `200` with zero duplicate payment rows.

### F5.1 Supertest Harness Checkpoint
Confirm `npm test` runs cleanly twice in a row from a fresh database with zero test-ordering coupling.

### F5.2 Error Boundary Checkpoint
Confirm throwing inside a product card renders the fallback UI while the navbar and cart remain interactive.

### F6.1 Slim Non-Root Docker Checkpoint
Confirm `docker run --rm <imgId> whoami` prints `app` (not `root`) and `HEALTHCHECK` reports `healthy`.

### F6.2 Full CI + Playwright Checkpoint
Confirm a clean push triggers GitHub Actions, passes typecheck, lint, migrations, Supertest, and Playwright 375px mobile checkout smoke test with green status.

## Progress Tracker

<<TRACKER>>
