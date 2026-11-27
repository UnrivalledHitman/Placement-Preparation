# Chapter 1: Developer-First Technical SEO in Next.js
%Building crawlable, indexable D2C storefronts that rank organically from Day 1

Most junior agencies bolt SEO plugins onto slow templates after launch. As a full-stack engineer building Indian D2C storefronts (such as a branded jewellery store competing with Palmonas and GIVA), you control the exact HTML, HTTP headers, structured data, and image pipeline—turning technical SEO into a repeatable engineering edge.

## 1.1 App Router `robots.ts` & Dynamic `sitemap.ts`

Never ship a broken `robots.txt` that blocks `/_next/static/` or exposes `/admin`, `/checkout`, and `/api/` to crawlers. Generate `robots.ts` and dynamic Postgres-backed `sitemap.ts` directly in the Next.js App Router:

```typescript Dynamic robots.ts & sitemap.ts (src/app/)
// src/app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example-jewels.in";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/checkout", "/account", "/cart"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}

// src/app/sitemap.ts
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example-jewels.in";
  const products = await prisma.product.findMany({
    where: { archivedAt: null },
    select: { slug: true, updatedAt: true },
  });
  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    ...products.map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
```

## 1.2 Canonicals, OpenGraph & Rich JSON-LD Schemas

Every filter URL (`/collections/rings?sort=price_asc&utm_source=ig`) creates duplicate content unless you emit a clean self-referencing **canonical URL** pointing to the base path (`/collections/rings`). Pair `generateMetadata` with four high-value JSON-LD schemas:

| Schema Type | Where Rendered | Key Fields for Indian Jewellery D2C |
|---|---|---|
| `Product` + `Offer` | Product Detail Page (PDP) | `name`, `sku`, `image[]`, `priceCurrency: "INR"`, `price`, `availability` |
| `BreadcrumbList` | Collection & PDP pages | `Home -> Rings -> 18K Vermeil Solitaire Ring` |
| `LocalBusiness` | Root layout / Store page | `name`, `address`, `telephone`, `openingHours`, `priceRange`, `sameAs` |
| `Organization` | Root layout | Official logo, customer support contact, Instagram/WhatsApp links |

```typescript Product + INR Offer JSON-LD helper (lib/seo.ts)
export function buildProductJsonLd(p: {
  name: string;
  slug: string;
  sku: string;
  imageUrls: string[];
  pricePaise: number;
  inStock: boolean;
  description: string;
}) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example-jewels.in";
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.sku,
    image: p.imageUrls,
    description: p.description,
    offers: {
      "@type": "Offer",
      url: `${base}/products/${p.slug}`,
      priceCurrency: "INR",
      price: (p.pricePaise / 100).toFixed(2),
      availability: p.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };
}
```

> TRAP: Never pass unescaped `</script>` inside `JSON.stringify(ld)` injected via `dangerouslySetInnerHTML`. Replace `<` with `\\u003c` (`JSON.stringify(data).replace(/</g, "\\u003c")`) to prevent script-breakout XSS.

# Chapter 2: Core Web Vitals & Image Performance Engineering
%Hitting LCP <= 2.5s, INP <= 200ms and CLS <= 0.1 on 4G Indian mobile devices

Over 80% of Indian D2C traffic arrives from mid-range Android smartphones on 4G networks inside Instagram's in-app browser. Every extra second of Largest Contentful Paint (LCP) drops mobile conversion rate by 10–20% and drives up Meta/Google cost-per-click.

## 2.1 Core Web Vitals Targets & Bottlenecks

| Metric | Good Threshold | What It Measures | Top Storefront Culprit |
|---|---|---|---|
| **LCP** | `<= 2.5 s` | Render time of largest hero/PDP image | Raw 2.5 MB PNG hero + `images: { unoptimized: true }` |
| **INP** | `<= 200 ms` | Responsiveness to tap/click interactions | Heavy synchronous JS, unthrottled variant filters |
| **CLS** | `<= 0.10` | Unexpected layout shifts during load | Images without `width`/`height`, late-loading web fonts |

## 2.2 Removing `images: { unoptimized: true }` & Converting 2.5 MB PNGs

Setting `images: { unoptimized: true }` in `next.config.ts` disables Next.js's built-in responsive resizing and AVIF/WebP negotiation—forcing every mobile shopper to download raw desktop PNGs (often 2–4 MB each).

**Production image pipeline checklist:**

1. Remove `unoptimized: true` from `next.config.ts` and configure `formats: ["image/avif", "image/webp"]` + explicit `remotePatterns`.
2. Pre-compress raw studio PNGs (`2.5 MB`) into WebP/AVIF (`< 150 KB` for hero/PDP, `< 45 KB` for catalog thumbnails) via `sharp` before uploading to object storage/CDN.
3. Mark **ONLY** the above-the-fold LCP hero or main PDP image with `priority` (never every card in a 24-item grid).
4. Always supply accurate `sizes` (e.g., `sizes="(max-width: 768px) 100vw, 50vw"`) and explicit `width`/`height` or `aspect-square` containers so `CLS = 0`.

```typescript Optimized Next.js image config & hero component
// next.config.ts
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [375, 640, 828, 1080, 1200],
    remotePatterns: [{ protocol: "https", hostname: "cdn.example-jewels.in" }],
  },
};
export default nextConfig;

// HeroBanner.tsx (above-the-fold LCP element)
// <Image src={heroUrl} alt="18K Gold Plated Necklace" width={1200} height={1500}
//        priority sizes="(max-width: 768px) 100vw, 50vw" />
```

# Chapter 3: Analytics Taxonomy, GA4 & Meta Pixel + CAPI Deduplication
%Engineering airtight revenue attribution before spending a single rupee on ads

## 3.1 GA4 E-Commerce Event Taxonomy

Every storefront funnel needs four standardized GA4 events pushed cleanly to `window.gtag` (or `dataLayer`) with consistent `currency: "INR"` and `items[]` payloads:

| Funnel Step | GA4 Event Name | Mandatory Parameters | Trigger Location |
|---|---|---|---|
| Product View | `view_item` | `currency`, `value`, `items[{item_id, item_name, price}]` | PDP mount |
| Cart Addition | `add_to_cart` | `currency`, `value`, `items[{..., quantity}]` | Add-to-Cart click |
| Checkout Start | `begin_checkout` | `currency`, `value`, `coupon`, `items[]` | Checkout page load |
| Paid Order | `purchase` | `transaction_id`, `value`, `tax`, `shipping`, `items[]` | Order confirmation (deduped by `transaction_id`) |

## 3.2 Meta Pixel + Server-Side Conversions API (CAPI) `event_id` Deduplication

iOS Safari ITP and ad blockers drop 20–35% of browser-only Meta Pixel events. Sending events from **both** the browser Pixel and your Node/Next.js server via **Meta Conversions API (CAPI)** recovers lost conversions—provided both share the **exact same `event_id`** so Meta deduplicates them instead of double-counting revenue.

```typescript Server-side Meta CAPI Purchase sender with SHA-256 PII & event_id
import crypto from "crypto";

const sha256Norm = (s: string) =>
  crypto.createHash("sha256").update(s.trim().toLowerCase()).digest("hex");

export async function sendMetaCapiPurchase(opts: {
  eventId: string;   // MUST match browser fbq('track','Purchase',...,{eventID})
  orderId: string;
  valueInr: number;
  email: string;
  phone: string;
  clientIp: string;
  userAgent: string;
}) {
  const pixelId = process.env.META_PIXEL_ID!;
  const token = process.env.META_CAPI_TOKEN!;
  const payload = {
    data: [{
      event_name: "Purchase",
      event_time: Math.floor(Date.now() / 1000),
      event_id: opts.eventId,
      action_source: "website",
      user_data: {
        em: [sha256Norm(opts.email)],
        ph: [sha256Norm(opts.phone)],
        client_ip_address: opts.clientIp,
        client_user_agent: opts.userAgent,
      },
      custom_data: { currency: "INR", value: opts.valueInr, order_id: opts.orderId },
    }],
  };
  return fetch(`https://graph.facebook.com/v20.0/${pixelId}/events?access_token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
```

## 3.3 UTM Naming Governance

Enforce lowercase, hyphenated UTMs across every social bio, WhatsApp broadcast, and ad set so GA4 reports never fragment into `Instagram`, `ig`, and `IG_Story`:

- `utm_source`: `meta`, `google`, `whatsapp`, `email`, `influencer`
- `utm_medium`: `paid-social`, `cpc`, `lifecycle`, `organic-social`
- `utm_campaign`: `2027-02-valentine-rings` (ISO year-month + angle)
- `utm_content`: `ugc-hook-anti-tarnish-v1` (creative variant)

# Chapter 4: Indian D2C CRO & Value-Based Freelance SOWs
%Converting skeptical mobile shoppers and structuring profitable client engagements

## 4.1 Indian Jewellery D2C Conversion Rate Optimization (CRO)

Indian D2C jewellery buyers hesitate on four specific anxieties—solve all four above the fold on a **375px mobile viewport**:

1. **Trust & Authenticity:** Display BIS Hallmark / 925 Sterling Silver / anti-tarnish warranty badges, verified customer photo reviews, and clear 7-day exchange policy right below the Add-to-Cart button.
2. **Transparent Price Breakup:** Show metal weight, stone/making charges, and **3% GST** transparently—surprise fees at Razorpay checkout kill conversion.
3. **375px Mobile Ergonomics:** Sticky bottom Add-to-Cart bar (48px tap targets), single-column checkout with Pincode auto-fill (city/state), UPI-first payment clarity, and COD verification friction (optional OTP or small prepaid discount) to curb RTO.
4. **Statistical A/B Testing Discipline:** Never call a winner after 200 visitors. Compute minimum sample size per variant using two-proportion z-test power (`alpha = 0.05`, `power = 0.80`):

```text Quick Sample-Size Rule of Thumb (80% power, 95% confidence)
Baseline CVR = 2.0%, Minimum Detectable Effect (MDE) = +20% relative (to 2.4%)
Required visitors PER variant ~= 16 * p*(1-p) / delta^2
                              ~= 16 * 0.02 * 0.98 / (0.004)^2 ~= 19,600 users/variant
```

> NOTE: Low-traffic new D2C stores (< 10,000 sessions/month) lack statistical power for micro button-color A/B tests. Focus on high-impact usability fixes, Clarity/PostHog session recordings, and funnel drop-off diagnostics instead.

## 4.2 Value-Based Freelance SOWs & Repo Hygiene

Stop billing hourly for commodity websites. Anchor your Statement of Work (SOW) to business outcomes (storefront speed, conversion tracking, zero-oversell checkout, SEO foundation):

- **Milestone Structure (40 / 30 / 30):** 40% kickoff deposit before writing code -> 30% on staging sign-off (catalog + cart + Razorpay sandbox) -> 30% on production launch & handover.
- **Explicit Scope Guardrails:** Cap revision rounds (2 rounds per milestone), define SKU upload ownership, and itemize post-launch growth/retainer work separately.
- **Strict Repo Hygiene:** **Never** commit internal pricing sheets, margin spreadsheets, or freelance negotiation notes inside the client's Git repository. Keep all internal commercial docs in a private local/Drive folder outside Git.

# Chapter 5: 6 Hands-On Phase 1 Growth Audits (G1.1–G3.2)
%Complete one audit every two weeks across Weeks 1–12 directly on your storefront

## Audits

**G1.1 · Medium · Audit · Next.js Technical SEO & JSON-LD Rich Results Audit.** Implement `robots.ts`, dynamic Postgres `sitemap.ts`, canonical URLs, and `Product` (`INR` `Offer`) + `BreadcrumbList` + `LocalBusiness` JSON-LD, then validate zero errors in Rich Results / schema validator.

**G1.2 · Medium · Build · Core Web Vitals & Image Pipeline Optimization.** Remove `images: { unoptimized: true }`, batch-convert all raw studio PNGs (`> 1 MB`) to WebP/AVIF (`< 150 KB`), configure `priority`/`sizes`, and achieve mobile Lighthouse Performance >= 90 with `LCP <= 2.5s` and `CLS <= 0.1`.

**G2.1 · Medium · Build · GA4 E-Commerce Event Taxonomy Implementation.** Wire `view_item`, `add_to_cart`, `begin_checkout`, and deduplicated `purchase` (`INR`) events on the storefront and verify all four payloads cleanly in GA4 DebugView.

**G2.2 · Hard · Build · Meta Pixel + Server-Side CAPI Event Deduplication.** Implement synchronized browser Pixel + Next.js server CAPI events sharing deterministic `event_id` with SHA-256 hashed PII, and confirm deduplication in Meta Events Manager Test Events.

**G3.1 · Medium · Audit · 375px Mobile Jewellery PDP & Checkout CRO Teardown.** Audit the storefront on a 375px mobile viewport against Palmonas/GIVA benchmarks: add trust badges, transparent 3% GST/price breakup, sticky CTA, and calculate A/B test MDE sample sizes.

**G3.2 · Easy · Design · Value-Based SOW, 40/30/30 Milestones & Repo Privacy Check.** Draft a reusable value-based D2C SOW with 40/30/30 payment milestones, change-request clauses, and verify via `git log --all` that zero internal margin/pricing docs exist in the client repo.

## Hints

| Exercise | Targeted Hint |
|---|---|
| G1.1 | Escape `<` as `\\u003c` inside JSON-LD script tags and ensure `price` is formatted as rupees (`"4999.00"`), not raw paise. |
| G1.2 | Run `sharp` script over `/public/images` to emit `.webp`/`.avif`, remove `unoptimized: true`, and put `priority` on the hero image only. |
| G2.1 | Fire `purchase` once per unique `orderId` (guard with `sessionStorage` or server-confirmed flag) so page refreshes never double-report revenue. |
| G2.2 | Generate `const eventId = "ord_" + order.id` on the server or checkout session and pass that exact string to both `fbq` and CAPI. |
| G3.1 | Check tap target height (`>= 48px`), horizontal scroll overflow (`document.documentElement.scrollWidth <= 375`), and visible shipping/return copy. |
| G3.2 | Run `git ls-files` and `git log --stat` to confirm no `.xlsx`, `margins.md`, or `proposal.pdf` ever entered the client repository. |

## Verification Rubrics

### G1.1 Technical SEO Checkpoint
Confirm `/robots.txt` blocks `/admin` and `/checkout`, `/sitemap.xml` lists live DB product slugs, and JSON-LD validates `Product`, `Offer (INR)`, `BreadcrumbList`, and `LocalBusiness`.

### G1.2 Core Web Vitals Checkpoint
Confirm zero product images exceed `150 KB`, `next.config` uses AVIF/WebP optimization, and throttled mobile Lighthouse hits `LCP <= 2.5s`, `CLS <= 0.1`, `INP <= 200ms`.

### G2.1 GA4 Taxonomy Checkpoint
Confirm `view_item -> add_to_cart -> begin_checkout -> purchase` fire in exact sequence with matching `INR` values and `transaction_id`.

### G2.2 Meta CAPI Deduplication Checkpoint
Confirm both Browser and Server events arrive in Test Events with identical `event_id` and status `Deduplicated`.

### G3.1 Mobile CRO Teardown Checkpoint
Confirm zero horizontal overflow at `375px`, transparent GST/making breakup on PDP, trust badges visible without hunting, and sample-size math documented.

### G3.2 SOW & Repo Hygiene Checkpoint
Confirm SOW specifies 40/30/30 milestones + scope limits, and client repository contains zero internal pricing/margin documents.

## Progress Tracker

<<TRACKER>>
