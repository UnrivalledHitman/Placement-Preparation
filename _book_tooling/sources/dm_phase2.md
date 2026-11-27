# Chapter 1: Indian D2C Unit Economics & Break-Even ROAS
%Never launch a paid ad campaign before modeling gross margin, GST, RTO and MER

A 3.0x ROAS screenshot in Meta Ads Manager can still bankrupt an Indian D2C brand if Return-to-Origin (RTO) on Cash-on-Delivery orders, payment gateway fees, shipping, and GST eat the entire contribution margin. Engineers who understand unit economics command far higher freelance retainers than media buyers who only chase clicks.

## 1.1 Contribution Margin & Break-Even ROAS Formula

Walk through one real Rs 2,000 (tax-inclusive) jewellery order:

| Line Item | Formula / Assumption | Amount (INR) |
|---|---|---|
| Selling Price (incl. 3% GST) | MRP paid by customer | `2,000.00` |
| Less: 3% GST (`2000 * 3 / 103`) | Remitted to government | `-58.25` |
| **Net Revenue (Ex-GST)** | `2000 / 1.03` | **`1,941.75`** |
| Less: COGS + Packaging | Jewellery cost + branded box | `-550.00` |
| Less: Forward + Blended RTO Shipping | `Rs 85 fwd + 15% RTO * Rs 150` | `-107.50` |
| Less: Payment Gateway (2% prepaid) | Razorpay fee | `-40.00` |
| **Contribution Margin (CM2)** | Net Rev - COGS - Ship - PG | **`1,244.25`** |
| **Contribution Margin %** | `1244.25 / 1941.75` | **`64.08%`** |
| **Break-Even ROAS (on Net Rev)** | `1 / 0.6408` | **`1.56x`** |
| **Target ROAS (for 25% Net Profit)** | `1 / (0.6408 - 0.25)` | **`2.56x`** |

> TRAP: Always compute **Break-Even ROAS = `1 / Contribution_Margin`** on **net revenue after GST and expected RTO loss**, not raw gross GMV. If COD RTO spikes from 10% to 35%, your effective contribution margin collapses and profitable ads turn cash-negative overnight.

## 1.2 Max CAC, Blended MER & LTV:CAC

- **Max Allowable CAC:** `Contribution_Margin_Per_Order - Target_Profit_Per_Order` (here `1244 - 485 = Rs 759` on first order).
- **Blended MER (Marketing Efficiency Ratio):** `Total_Store_Revenue / Total_Ad_Spend` across all channels (Meta + Google + Creators). Platform-reported ROAS double-counts view-through conversions; **MER** is the CFO's source of truth.
- **LTV:CAC Ratio:** `(First_Order_CM + Repeat_Orders_CM) / Blended_CAC`. Healthy Indian D2C brands target **LTV:CAC >= 3.0** within 12 months via WhatsApp/email repeat purchases.

# Chapter 2: Meta Ads Architecture & Diagnostic Matrix
%Keeping account structure simple so Meta's algorithm exits learning cleanly

## 2.1 Simplified 3-Campaign Account Architecture

Modern Meta Ads penalizes fragmented ad sets with tiny Rs 200/day budgets. Consolidate spend into three clean campaigns:

| Campaign | Structure | Budget Share | Purpose |
|---|---|---|---|
| 1. Creative Testing | ABO or CBO (`3–5` creatives/ad set, broad targeting) | 20–30% | Isolate winning hooks (UGC unboxing, anti-tarnish test, gifting) |
| 2. Scaling | Advantage+ Shopping (ASC) or broad CBO | 60–70% | Graduate proven winners with high social proof (`post_id`) |
| 3. Retargeting | 14-day Dynamic Product Ads (DPA) — ViewContent/ATC excl. Purchasers | 10% | Close warm shoppers with reviews, trust badges & limited offer |

## 2.2 Funnel Diagnostic Matrix (CPM -> CTR -> LPV -> ATC -> Purchase)

When ROAS drops, never guess randomly. Read the funnel left-to-right to pinpoint the exact broken link:

| Symptom | Healthy Indian D2C Benchmark | Root Cause | Engineering / Creative Fix |
|---|---|---|---|
| High **CPM** (`> Rs 250`) | `Rs 80 – Rs 180` | Narrow audience or ad fatigue | Broaden targeting; refresh creative hook |
| Low **Link CTR** (`< 1.0%`) | `1.5% – 3.0%` | Weak first 3 seconds / unclear offer | Test 3 new video hooks, clearer INR price overlay |
| Low **LPV / Click** (`< 70%`) | `>= 80%` | Slow mobile LCP (`> 3s`) | Fix Core Web Vitals, compress hero `< 150 KB` |
| Low **ATC / LPV** (`< 5%`) | `7% – 12%` | Weak PDP trust or price shock | Improve PDP photos, reviews, transparent GST breakup |
| Low **Purchase / ATC** (`< 25%`) | `30% – 45%` | Checkout friction / hidden shipping | Simplify mobile checkout, UPI-first, check Razorpay errors |

> TIP: Notice how **LPV/Click** and **Purchase/ATC** are pure full-stack engineering levers! Fixing a 4-second LCP or a broken mobile UPI flow boosts ROAS more reliably than tweaking ad targeting.

# Chapter 3: Google Search & Automated Merchant Center XML Feed
%Capturing high-intent buyers and syncing live Postgres stock to Google Shopping

## 3.1 High-Intent Google Search & Negative Keyword Hygiene

While Meta creates demand, Google Search captures existing buying intent (`18k gold plated anti tarnish bracelet`, `925 silver gift for wife`).

- **Match Types:** Start with **Exact Match** (`[anti tarnish earrings]`) and **Phrase Match** (`"gold plated ring"`) on bottom-of-funnel keywords—avoid Broad Match until you have 30+ verified CAPI/GA4 purchases/month.
- **Negative Keyword Hygiene:** Maintain a shared negative list from Day 1 (`free`, `wholesale`, `manufacturer`, `second hand`, `job`, `DIY`, `repair`, `making course`) and audit the Search Terms Report weekly to stop budget leaks.

## 3.2 Automated `/api/feeds/google-merchant.xml` Endpoint From Postgres

Never maintain manual Google Sheets for Google Merchant Center (GMC)—out-of-stock SKUs waste ad spend and trigger GMC price-mismatch suspensions. Serve an automated RSS 2.0 XML feed directly from Postgres:

```typescript Live Google Merchant Center XML feed (app/api/feeds/google-merchant.xml/route.ts)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const xmlEsc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;")
   .replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example-jewels.in";
  const variants = await prisma.productVariant.findMany({
    where: { product: { archivedAt: null } },
    include: { product: true },
  });

  const itemsXml = variants.map((v) => {
    const priceInr = (v.pricePaise / 100).toFixed(2);
    const avail = v.stockQty > 0 ? "in_stock" : "out_of_stock";
    return `<item>
      <g:id>${xmlEsc(v.sku)}</g:id>
      <g:title>${xmlEsc(v.product.title)} (${xmlEsc(v.sizeLabel)})</g:title>
      <g:description>${xmlEsc(v.product.description)}</g:description>
      <g:link>${base}/products/${xmlEsc(v.product.slug)}</g:link>
      <g:image_link>${xmlEsc(v.product.primaryImageUrl)}</g:image_link>
      <g:availability>${avail}</g:availability>
      <g:price>${priceInr} INR</g:price>
      <g:condition>new</g:condition>
    </item>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel><title>Jewellery Catalog</title><link>${base}</link>${itemsXml}</channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=300",
    },
  });
}
```

# Chapter 4: WhatsApp Business & Resend Email Lifecycle Flows
%Turning one-time buyers into repeat customers with near-zero marginal CAC

In India, WhatsApp Business open rates exceed 75–85% compared to 18–25% for email. Combine transactional Resend emails with approved WhatsApp template messages triggered directly by your backend order webhooks:

| Lifecycle Flow | Trigger & Timing | Channel | Goal & Conversion Lever |
|---|---|---|---|
| 1. Abandoned Checkout | Checkout started, no `PAID` after 45 min | WhatsApp + Resend | Direct cart recovery link + small prepaid incentive (never spam) |
| 2. Transactional Updates | `PAID`, `PACKED`, `SHIPPED`, `DELIVERED` | WhatsApp + Resend | Build trust, cut WISMO support tickets & reduce COD RTO |
| 3. Day+7 Review Request | `DELIVERED + 7 days` | WhatsApp + Email | Collect photo reviews for PDP social proof & ad creatives |
| 4. Festival Win-Back | `60–90 days` post-purchase / Diwali, Rakhi, Valentine | WhatsApp + Email | High-margin repeat order (`LTV` expansion at Rs 0 ad CAC) |

# Chapter 5: SQL + Python Attribution Pipeline & Monthly Retainer Pitch
%Computing weekly MER, blended CAC and cohort retention to close Rs 25K–40K/mo retainers

## 5.1 Weekly MER, Blended CAC & Cohort Retention SQL

Join your Postgres `orders` table with a daily `ad_spend(spend_date, channel, spend_paise)` table to compute CFO-grade weekly metrics:

```sql Weekly MER, Blended CAC & First-Order vs Repeat Revenue (Postgres)
WITH paid_orders AS (
  SELECT
    o.id,
    o.user_id,
    DATE_TRUNC('week', o.created_at)::date AS order_week,
    o.total_paise / 100.0 AS rev_inr,
    ROW_NUMBER() OVER (PARTITION BY o.user_id ORDER BY o.created_at) AS ord_num
  FROM orders o
  WHERE o.status IN ('PAID', 'PACKED', 'SHIPPED', 'DELIVERED')
),
weekly_rev AS (
  SELECT
    order_week,
    SUM(rev_inr) AS total_rev_inr,
    COUNT(*) FILTER (WHERE ord_num = 1) AS new_customers,
    SUM(rev_inr) FILTER (WHERE ord_num > 1) AS repeat_rev_inr
  FROM paid_orders
  GROUP BY order_week
),
weekly_spend AS (
  SELECT DATE_TRUNC('week', spend_date)::date AS spend_week,
         SUM(spend_paise) / 100.0 AS total_spend_inr
  FROM ad_spend
  GROUP BY spend_week
)
SELECT
  r.order_week,
  ROUND(r.total_rev_inr, 2) AS revenue_inr,
  ROUND(COALESCE(s.total_spend_inr, 0), 2) AS ad_spend_inr,
  ROUND(r.total_rev_inr / NULLIF(s.total_spend_inr, 0), 2) AS blended_mer,
  ROUND(s.total_spend_inr / NULLIF(r.new_customers, 0), 2) AS blended_cac_inr,
  ROUND(100.0 * COALESCE(r.repeat_rev_inr, 0) / NULLIF(r.total_rev_inr, 0), 1) AS repeat_pct
FROM weekly_rev r
LEFT JOIN weekly_spend s ON s.spend_week = r.order_week
ORDER BY r.order_week DESC;
```

Wrap this query in a scheduled Python script that generates a clean Monday-morning client report (weekly MER trend, channel CPA, 30/60/90-day cohort retention matrix, and top-performing SKUs).

## 5.2 Pitching a Rs 25,000–40,000/Month Growth + Tech Retainer

Once the storefront is live, position a bundled **Growth + Engineering Retainer** instead of disappearing after launch:

| Deliverable Pillar | Monthly Cadence | Why Clients Happily Pay Rs 25K–40K/mo |
|---|---|---|
| Technical & CWV Maintenance | Ongoing + monthly Lighthouse audit | Zero downtime, instant bug fixes, fast landing pages |
| Feed, Pixel/CAPI & CRO | Bi-weekly tests + GMC XML health | Protects ad algorithm signal & lifts mobile CVR |
| Lifecycle Automation | Festival WhatsApp/Resend campaigns | Drives high-margin repeat revenue without extra ad spend |
| Executive Attribution Report | Weekly MER, Blended CAC & Cohort KPIs | Clear ROI proof that pays for the retainer multiple times over |

# Chapter 6: 6 Phase 2 Performance & Analytics Drills (P1.1–P3.2)
%Complete one drill every two weeks across Weeks 13–24

## Drills

**P1.1 · Medium · Model · Indian D2C Unit Economics & Break-Even ROAS Calculator.** Build a Python script computing Net Revenue (ex-3% GST), CM2 after COGS/shipping/RTO/Razorpay fees, Break-Even ROAS, Target ROAS (25% net margin), Max CAC, and sensitivity table across 10%–35% RTO rates.

**P1.2 · Medium · Audit · Meta Ads 3-Campaign Blueprint & Diagnostic Runbook.** Design a complete Meta Ads launch plan (Testing ABO, Advantage+ Scaling, 14-day DPA Retargeting) for Rs 30K/month spend plus a concrete troubleshooting tree mapping CPM, CTR, LPV/Click, ATC, and Purchase drops to fixes.

**P2.1 · Medium · Build · Live Postgres `/api/feeds/google-merchant.xml` Endpoint.** Implement and test the XML Merchant Center endpoint pulling live `product_variants` stock and `INR` prices, with XML escaping, `Cache-Control` headers, and automated XML schema validation.

**P2.2 · Easy · Design · High-Intent Google Search & Negative Keyword Architecture.** Build an Exact/Phrase campaign structure for 3 jewellery categories alongside a 40-term Indian D2C negative keyword list blocking low-intent/wholesale traffic.

**P3.1 · Medium · Build · Abandoned-Checkout & Post-Delivery Lifecycle Flows.** Implement idempotent backend triggers for Abandoned Checkout (45m), Order Status transactional Resend/WhatsApp notifications, and Day+7 review requests without duplicate sends.

**P3.2 · Hard · Pipeline · Weekly SQL + Python MER, Blended CAC & Cohort Report.** Write the Postgres CTE + Python attribution pipeline outputting weekly MER, Blended CAC, new vs repeat revenue share, 30/60/90-day cohort retention, and a 1-page Rs 25K–40K/mo retainer proposal deck.

## Hints

| Exercise | Targeted Hint |
|---|---|
| P1.1 | Extract GST from MRP via `mrp / 1.03`, not `mrp * 0.97`, and include reverse-shipping + packaging waste on every RTO unit. |
| P1.2 | Compare `LPV / Link Clicks`: if it sits under 70%, fix page speed/redirects before changing creatives or audiences. |
| P2.1 | Escape `&`, `<`, `>`, `"` in every product title/description or an `&` in "Gold & Silver" will invalidate the entire XML feed. |
| P2.2 | Separate brand-name search terms into their own campaign so branded clicks never mask poor non-brand ROAS. |
| P3.1 | Store a `lifecycle_notifications(order_id, template_key UNIQUE)` row before calling Resend/WhatsApp so retries never double-message a buyer. |
| P3.2 | Use `ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at)` to split first-order acquisition from repeat orders cleanly. |

## Verification Rubrics

### P1.1 Unit Economics Checkpoint
Confirm script accurately extracts 3% GST (`mrp / 1.03`), models RTO sensitivity from 10% to 35%, and prints exact Break-Even ROAS and Max CAC.

### P1.2 Meta Blueprint Checkpoint
Confirm budget split keeps >= 60% in consolidated scaling, defines clear kill/scale rules, and links every funnel drop to an engineering or creative fix.

### P2.1 GMC XML Feed Checkpoint
Confirm endpoint returns valid `application/xml`, flips `in_stock`/`out_of_stock` immediately on DB change, and escapes special characters cleanly.

### P2.2 Google Search Architecture Checkpoint
Confirm campaigns use Exact/Phrase match on buyer-intent terms and include a comprehensive negative keyword blocklist.

### P3.1 Lifecycle Flows Checkpoint
Confirm triggering the webhook or cron twice produces exactly 1 email/WhatsApp dispatch per `(order_id, template_key)`.

### P3.2 Attribution & Retainer Checkpoint
Confirm SQL+Python report computes accurate weekly MER, Blended CAC, and cohort retention on sample seed data, paired with a concrete Rs 25K–40K/mo retainer SOW.

## Progress Tracker

<<TRACKER>>
