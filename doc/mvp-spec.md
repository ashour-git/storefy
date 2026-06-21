# AI Store-Builder SaaS — MVP Build Spec

Handoff document for a code agent. Build in the phase order given in Section 11. Do not build ahead of phase order — each phase assumes the previous one's isolation/security pattern is already in place and proven.

---

## 0. What this is

A multi-tenant SaaS: a user signs up, creates a store, gets an AI-assisted theme/layout, adds products, connects a payment gateway, and goes live on a subdomain or custom domain. Each store also gets an AI agent (RAG over that store's own data) for customers, an AI POS, and an AI analytics dashboard.

---

## 1. Critical correction before any payments code is written

The earlier draft of this architecture assumed Stripe Connect for marketplace payouts. **That doesn't work for an Egypt-based merchant base.** Stripe does not support Egypt as a merchant/payout country — Egyptian businesses cannot open a standard Stripe account without incorporating in a Stripe-supported country first.

For the Egyptian market, the standard local processors are **Paymob** and **Fawry**. Paymob is the better fit here specifically because:
- It has a documented REST API, official Shopify/WooCommerce plugins, and SDKs (Android/iOS/Flutter/React Native), so it's a normal API integration, not a manual reconciliation process.
- It supports cards, mobile wallets, Meeza (Egypt's national card scheme), cash-on-delivery, and installments — the payment mix Egyptian online shoppers actually use.
- It has a **Split Amount Feature**, which is the marketplace primitive you actually need (platform fee + store-owner payout in one transaction), playing the same role Stripe Connect would have played.
- Pricing example seen for local SMB tier: ~2.75% + 3 EGP per local transaction (confirm current rate at integration time — gateway pricing changes).

**Decision for MVP:** Paymob is the storefront checkout processor for Phase 1. Keep the `payments` table provider-agnostic (`provider` enum already includes `stripe` and `cod`) so a second processor (e.g. Stripe, for a future non-Egypt expansion) can be added later without a schema change.

**Separate decision, don't conflate it:** billing *you* charge store owners for their SaaS subscription (Free/Starter/Pro) is a different payment flow than store checkout. That can run on Paymob's recurring/subscription support, or on Stripe if the SaaS entity itself is incorporated in a Stripe-supported country. This is a business decision, not an engineering one — flagging it so it isn't assumed away.

---

## 2. Stack

| Layer | Choice | Notes |
|---|---|---|
| App | Next.js (App Router), Vercel | SSR/ISR storefronts, Server Actions for admin, Edge Middleware for tenant resolution |
| DB | Neon Postgres | Serverless, autoscale, branch-per-PR previews |
| ORM | Drizzle | Lower cold-start cost than Prisma |
| Vector store | pgvector inside Neon | Same RLS boundary protects embeddings and relational data — one isolation pattern, not two |
| Auth | Neon Auth (Better Auth, lives in `neon_auth` schema) | Branches with the DB automatically; pairs naturally with RLS |
| LLM inference | Groq API | Low-latency LPU inference |
| Storefront payments | Paymob | See Section 1 |
| Platform subscription billing | TBD per business decision above | Don't hardcode Stripe assumptions into the billing module |
| Storage | Vercel Blob | Product images |
| Transactional email | Resend | Order confirmations, password resets |
| Background jobs / retries | Inngest or Upstash QStash | Vercel functions are stateless — webhook retries, AI ingestion jobs, scheduled tasks need a queue, not a cron-only assumption |
| Rate limiting | Upstash Redis + `@upstash/ratelimit` | Both on public storefront APIs and on AI endpoints (cost control) |
| Error monitoring | Sentry | |
| Real-time (POS live updates, builder collab) | Ably or Pusher | Vercel functions don't hold persistent WebSocket connections |
| i18n / RTL | `next-intl` + Tailwind logical properties (`ps-`, `pe-` instead of `pl-`/`pr-`) | Arabic is a primary, not secondary, locale here — see Section 9 |

---

## 3. Data model (DDL)

Every store-level table carries `tenant_id` and gets the RLS policy in Section 4. This is not optional per-table — apply it as a template to each new table you add later.

```sql
-- ============================================================
-- PLATFORM-LEVEL
-- ============================================================
CREATE TABLE platform_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE tenants ( -- one row per store
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,              -- slug.yourplatform.com
  custom_domain TEXT UNIQUE,              -- verified custom domain, nullable
  owner_id UUID NOT NULL REFERENCES platform_users(id),
  name TEXT NOT NULL,
  category TEXT,                          -- e.g. "perfume" — drives the AI layout agent
  default_locale TEXT NOT NULL DEFAULT 'ar',
  default_currency TEXT NOT NULL DEFAULT 'EGP',
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','starter','pro')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','deleted')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE tenant_members ( -- staff access per store
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  role TEXT NOT NULL CHECK (role IN ('owner','manager','staff')),
  UNIQUE (tenant_id, user_id)
);

-- ============================================================
-- STORE-LEVEL
-- ============================================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES categories(id)
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  category_id UUID REFERENCES categories(id),
  name TEXT NOT NULL,
  description TEXT,
  description_ai_generated BOOLEAN DEFAULT false,
  base_price NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EGP',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','archived')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  product_id UUID NOT NULL REFERENCES products(id),
  sku TEXT NOT NULL,
  attributes JSONB DEFAULT '{}',          -- {"size": "50ml"}
  price_override NUMERIC(12,2),
  stock_qty INTEGER NOT NULL DEFAULT 0,
  UNIQUE (tenant_id, sku)
);

CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  product_id UUID REFERENCES products(id),
  url TEXT NOT NULL,
  alt_text TEXT,
  position INTEGER DEFAULT 0
);

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  email TEXT,
  phone TEXT,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tenant_id, email)
);

CREATE TABLE discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percent','fixed')),
  value NUMERIC(12,2) NOT NULL,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  UNIQUE (tenant_id, code)
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  customer_id UUID REFERENCES customers(id),
  channel TEXT NOT NULL CHECK (channel IN ('online','pos')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','paid','fulfilled','cancelled','refunded')),
  subtotal NUMERIC(12,2) NOT NULL,
  discount_total NUMERIC(12,2) DEFAULT 0,
  tax_total NUMERIC(12,2) DEFAULT 0,
  shipping_total NUMERIC(12,2) DEFAULT 0,
  grand_total NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EGP',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  order_id UUID NOT NULL REFERENCES orders(id),
  variant_id UUID NOT NULL REFERENCES product_variants(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  order_id UUID NOT NULL REFERENCES orders(id),
  provider TEXT NOT NULL CHECK (provider IN ('paymob','stripe','cod')),
  provider_ref TEXT,                      -- gateway transaction id
  idempotency_key TEXT NOT NULL,          -- required: see Section 8
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('initiated','succeeded','failed','refunded')),
  raw_webhook JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tenant_id, idempotency_key)
);

-- ============================================================
-- THEME / BUILDER
-- ============================================================
CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  tokens JSONB NOT NULL DEFAULT '{}',     -- colors, fonts, spacing
  active BOOLEAN DEFAULT true
);

CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  slug TEXT NOT NULL,                     -- "home", "about"
  blocks JSONB NOT NULL DEFAULT '[]',     -- ordered array of block definitions
  UNIQUE (tenant_id, slug)
);

-- ============================================================
-- AI LAYER
-- ============================================================
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE knowledge_chunks ( -- RAG source for the customer-facing agent
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  source_type TEXT NOT NULL CHECK (source_type IN ('product','faq','policy')),
  source_id UUID,
  content TEXT NOT NULL,
  embedding VECTOR(1024),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  customer_id UUID REFERENCES customers(id),
  channel TEXT NOT NULL CHECK (channel IN ('storefront_chat','pos','dashboard')),
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ai_agent_logs ( -- every model call: audit + cost tracking
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  processor TEXT NOT NULL,                -- e.g. 'storefront_rag_agent'
  model TEXT NOT NULL,
  input_tokens INTEGER,
  output_tokens INTEGER,
  latency_ms INTEGER,
  moderation_flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  actor_id UUID,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id UUID,
  diff JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 4. RLS — apply to every table above that has `tenant_id`

```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON products
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

-- App connects as a restricted role — never the owner/migration role.
GRANT SELECT, INSERT, UPDATE, DELETE ON products TO app_user;
```

Per request, the server resolves `tenant_id` from the subdomain/custom domain (or from the authenticated session for admin routes) and sets it inside the transaction:

```sql
SET LOCAL app.tenant_id = '...';
```

`tenant_id` is **never** taken from a request body, a query param, or anything the client (or an AI agent's tool call) can directly supply. It's resolved server-side, once, before any query runs.

---

## 5. Tenant resolution / routing

- Subdomain: `{slug}.yourplatform.com` → Edge Middleware looks up `slug` in `tenants`, attaches `tenant_id` to the request context.
- Custom domain: store owner adds a CNAME, you verify it through Vercel's Domains API, then store it in `tenants.custom_domain`. Middleware resolves by exact `custom_domain` match.
- Admin app (`app.yourplatform.com`) is a separate route tree from the storefront — same DB, different auth flow, RLS still scoped by the logged-in user's tenant membership.

---

## 6. AI model routing (Groq)

`llama-3.1-8b-instant` and `llama-3.3-70b-versatile` were deprecated June 17, 2026. Don't build on either — use:

| Tier | Model | Used for |
|---|---|---|
| Fast/cheap | `openai/gpt-oss-20b` | product descriptions, POS upsell suggestion (synchronous, latency-sensitive) |
| Higher quality | `openai/gpt-oss-120b` or `qwen/qwen3.6-27b` | storefront agent reasoning, analytics narration, AI layout suggestion |
| Moderation | `openai/gpt-oss-safeguard-20b` | input screening before every RAG/agent call (policy-following, bring-your-own-policy) |

Structured output: use Groq's `json_schema` structured outputs (enabled by default on current models) instead of free-text parsing for every processor below — define the schema in Zod, pass it through, validate the response before writing to the DB.

---

## 7. AI processors

For each: trigger, model tier, input, output schema, where it writes.

1. **`generate_product_description`**
   - Trigger: store owner adds a product with just a name/category.
   - Input: name, category, key attributes.
   - Output: `{ description: string, tags: string[] }`
   - Writes to `products.description`, sets `description_ai_generated = true`.

2. **`suggest_store_layout`** (onboarding agent)
   - Trigger: end of signup wizard, after store category is chosen.
   - Input: category, short business description, locale.
   - Output: ordered block list (`pages.blocks` shape) + initial theme tokens.
   - This is the actual differentiator vs. handing someone a blank template — see Section 9.

3. **`pos_order_parser`**
   - Trigger: staff speaks/types an order at the POS.
   - Input: free text or transcript.
   - Output: `{ items: [{variant_id, quantity}], notes }` — validated against `product_variants` before the order is created.

4. **`pos_upsell_suggester`**
   - Trigger: items added to an in-progress POS order.
   - Input: current cart contents.
   - Output: 1–3 suggested add-ons, ranked.
   - Must return in well under a second — this is the one place latency is felt directly by a customer standing at a counter.

5. **`analytics_text_to_sql`**
   - Trigger: dashboard NL query ("show me last week's top sellers").
   - Output: a SQL query string. The query then runs through the RLS-scoped read role regardless of what the model produced — the model's output is never trusted to have respected tenant scope on its own.

6. **`analytics_narrator`**
   - Trigger: after the query in (5) executes.
   - Input: query result set.
   - Output: plain-language summary + flagged anomalies.

7. **`storefront_rag_agent`** (customer-facing)
   - Trigger: customer chat widget on the storefront.
   - Retrieval: `knowledge_chunks` filtered by `tenant_id` (set server-side, same RLS pattern as everything else — not a metadata filter the model controls).
   - **Structured lookups (order status, stock level, price) are tool calls against the DB, not RAG.** RAG is for unstructured content — FAQs, return policy, product story. Don't route "where's my order" through embedding search; it's a direct, scoped, parameterized query. Mixing the two is a common design mistake worth avoiding deliberately.
   - Every message passes through `openai/gpt-oss-safeguard-20b` first. Reject/redirect anything that looks like an attempt to access another tenant's data, extract the system prompt, or override scope.

8. **RAG ingestion pipeline**
   - On product create/update → chunk description + attributes → embed → upsert into `knowledge_chunks` with `source_type = 'product'`.
   - Store owner-authored FAQ/policy pages → same pipeline, `source_type = 'faq'`/`'policy'`.
   - Run ingestion as a background job (Inngest/QStash), not inline on the save request — embedding calls shouldn't block the admin UI.

---

## 8. Payments (Paymob) — implementation notes

- Use Paymob's Intention API (current recommended flow) rather than the older auth/capture-only flow.
- **Idempotency:** generate an idempotency key client-side per checkout attempt, store it in `payments.idempotency_key` before calling Paymob, and check for an existing row with that key before creating a new payment intent. This is the standard failure mode in Egyptian gateway integrations — money captured, order not confirmed because a webhook was missed or duplicated.
- **Webhooks:** verify the HMAC signature on every callback before trusting it (Paymob signs callbacks). Store the raw payload in `payments.raw_webhook` for audit/debugging regardless of outcome.
- **Split payments:** when you're ready for marketplace payouts (platform fee + store owner share), use Paymob's split-amount feature rather than building manual reconciliation.
- **COD:** Egyptian e-commerce still has meaningful cash-on-delivery volume — `payments.provider = 'cod'` exists in the schema for this; no gateway call, order moves to `fulfilled` on manual confirmation by staff.
- VAT: Egypt's standard rate is 14% — make it a per-store configurable `tax_rate` rather than hardcoding 14%, since this can change and some product categories may be exempt.

---

## 9. Localization — don't default to English/LTR

The real first customer here is an Egyptian perfume store. Arabic is the primary locale, not an afterthought:
- `next-intl` for translated strings, `default_locale = 'ar'` per tenant (already in schema).
- Tailwind logical properties (`ps-4`, `me-2`, not `pl-4`, `mr-2`) so layouts flip correctly in RTL without a parallel LTR-only codebase.
- The AI processors (description generation, layout suggestion, RAG agent) need to operate in Arabic when the store's locale is Arabic — pass `default_locale` into every prompt, don't assume English.
- Currency formatting: EGP with Arabic numeral conventions where the store owner expects it; don't hardcode `$`.

---

## 10. Security checklist

| Layer | Control |
|---|---|
| DB | RLS on every tenant table; app connects as restricted role, never owner |
| Vector | Same RLS pattern as relational tables, not metadata-only filtering |
| Connections | Pooled (PgBouncer) endpoint from serverless functions; IP allowlist where available |
| Agent input | Moderation pass (`gpt-oss-safeguard-20b`) before retrieval, on every channel (storefront chat, POS, dashboard) |
| Agent scope | `tenant_id` bound server-side; never accepted from model output or chat content |
| Analytics SQL | Executes under the RLS role regardless of what the model generated |
| Payments | HMAC-verified webhooks, idempotency keys, raw payload retained |
| Branch cleanup | Delete per-branch DB role when a Neon preview branch is deleted — not automatic |
| Secrets | Per-tenant API keys/webhook secrets, encrypted at rest, rotated |
| Rate limiting | Per-tenant limits on AI endpoints specifically — an uncapped customer-facing chat agent is a direct line to your Groq bill |

---

## 11. Build order (phased)

**Phase 0 — foundation**
1. Schema + RLS + Neon Auth
2. Tenant resolution middleware (subdomain routing)
3. Paymob sandbox integration + idempotent webhook handler (do this early, not as an afterthought — it's the part most likely to have integration surprises)

**Phase 1 — MVP storefront + admin**
4. Storefront renderer (blocks + theme tokens), no AI yet
5. Admin: product CRUD, basic admin UI
6. Onboarding wizard: signup → create store → pick category/locale → checkout connected → first product added → publish
7. Order flow end-to-end (cart → Paymob/COD → order status)

**Phase 2 — AI layer, lowest-risk first**
8. `generate_product_description`
9. `suggest_store_layout` (onboarding AI agent)
10. RAG ingestion pipeline + `storefront_rag_agent` (with moderation gate from day one, not bolted on after launch)

**Phase 3 — POS + analytics**
11. POS UI + `pos_order_parser` + `pos_upsell_suggester`
12. Dashboard + `analytics_text_to_sql` + `analytics_narrator`

**Phase 4 — hardening**
13. Rate limiting on all AI endpoints
14. Sentry, audit log review, backup/PITR check on Neon
15. Custom domain verification flow
16. Platform subscription billing (separate from storefront payments — see Section 1)

---

## 12. Explicitly out of scope for MVP

- Multi-currency beyond EGP/USD
- Native mobile apps (storefront is responsive web; POS is a web app, not a dedicated tablet app, for v1)
- Advanced fraud ML (rule-based checks only for v1: velocity limits, COD order caps)
- Multi-warehouse inventory
- A/B testing on storefront layouts
- Stripe integration (revisit only if/when expanding outside Egypt)

---

## 13. Environment variables (non-exhaustive, fill in as services are added)

```
DATABASE_URL=               # Neon pooled connection string
DATABASE_URL_UNPOOLED=      # for migrations only
GROQ_API_KEY=
PAYMOB_API_KEY=
PAYMOB_HMAC_SECRET=
RESEND_API_KEY=
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=
INNGEST_EVENT_KEY=
SENTRY_DSN=
VERCEL_BLOB_READ_WRITE_TOKEN=
```

---

## Summary

Two corrections to the earlier architecture mattered enough to change the plan, not just annotate it: Stripe doesn't work for Egyptian merchants (Paymob does, including the split-payment primitive the marketplace model needs), and Arabic/RTL has to be load-bearing in the schema and UI from day one, not retrofitted. Everything else — RLS-scoped multi-tenancy, Groq model tiering, RAG vs. tool-calling for the storefront agent, idempotent payment webhooks — is now specified concretely enough to hand to a code agent phase by phase.
