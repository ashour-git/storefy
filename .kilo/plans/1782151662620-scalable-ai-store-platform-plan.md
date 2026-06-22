# Scalable AI Store Platform Plan

## Goal

Repair Storefy into a free-tier-first but scale-ready AI commerce platform that can run on Vercel Free + Neon Free for MVP/demo use, while keeping clean upgrade paths for paid infrastructure, higher traffic, and real merchant operations.

The platform must not only satisfy the existing MVP spec; it must also fix the weak store creation experience. A merchant should be able to create a visually credible, Arabic/English, mobile-ready store that compares favorably with Shopify, WooCommerce, Salla/Zid, Wix, and Squarespace defaults.

## Strategic Decisions

- **Free-tier first:** Required runtime dependencies for MVP are Vercel + Neon only.
- **Scale-ready:** Use provider interfaces and domain boundaries so Groq, Paymob, Resend, Upstash, Inngest, Sentry, Blob, realtime, and platform billing can be enabled later without rewrites.
- **Mocked CI, real production gates:** Tests must be deterministic with mocks/fakes. Production paths must fail closed or degrade safely when required env vars are missing.
- **Curated vertical templates:** Build first-party, high-quality templates instead of relying on a generic block builder.
- **AI differentiator:** AI should customize proven templates and operate through tenant-safe tools, not hallucinate arbitrary storefronts or SQL.
- **Billing deferred:** Platform subscription billing stays behind a provider-agnostic interface until the business chooses Paymob recurring, Stripe, or another provider.

## Competitor Bar

Use this as the product-quality test during implementation:

- **Shopify:** strong themes, onboarding, checkout reliability, app ecosystem. Storefy must compete with faster local setup, Arabic/RTL, Paymob/COD, and AI-assisted setup.
- **WooCommerce:** flexible and plugin-rich but maintenance-heavy. Storefy must be hosted, safer, and simpler.
- **Salla/Zid:** strong MENA fit and Arabic defaults. Storefy must match local expectations and exceed them with AI-assisted design/content.
- **Wix/Squarespace:** polished templates and easy editing. Storefy must match visual polish while providing stronger commerce and local checkout.

## Workstream 0: Stabilize CI And Quality Gates

1. Add a `test` script to `package.json` using `vitest run`.
2. Make DB-backed tests fail fast or skip with an explicit message when no usable test `DATABASE_URL` is available.
3. Keep unit tests runnable without Neon by mocking DB/provider boundaries where possible.
4. Fix lint blockers across the repo:
   - Replace broad `any` with local interfaces/types.
   - Fix React hook lint errors.
   - Replace raw `<a>` internal navigation with `Link` where required.
   - Escape JSX quotes/apostrophes.
   - Remove unused imports/variables or intentionally prefix ignored values.
5. Keep `npx tsc --noEmit`, `npm run lint`, `npm run test`, and `npm run build` green.
6. Add a requirement/competitor regression checklist test document or test cases for template, checkout, AI, RTL, and tenant isolation behavior.

## Workstream 1: Tenant And Security Repair

1. Audit all API routes for tenant input from request bodies, query params, client payloads, or AI/model output.
2. Replace client-supplied tenant authority with server-side resolution:
   - Storefront APIs resolve tenant from host/subdomain/custom domain.
   - Admin APIs resolve tenant from authenticated session + tenant membership.
3. Keep `tenantId` in request payloads only as non-authoritative UI context if needed; never trust it for DB scope.
4. Standardize `withTenant` and scoped repository helpers so every tenant table query runs under `SET LOCAL app.tenant_id`.
5. Keep RLS enabled for all tenant tables and verify with tests covering cross-tenant reads/writes.
6. Add safe global lookup patterns for webhooks where provider references arrive without tenant context:
   - Use a privileged server-only repository if needed.
   - Immediately re-enter tenant-scoped transaction before mutating tenant data.
   - Test that arbitrary storefront/admin callers cannot use global lookup paths.

## Workstream 2: Free-Tier Provider Architecture

Create provider interfaces with mock/default implementations and optional real implementations selected by env vars:

1. `payments`:
   - `MockPaymentProvider` for CI/dev/free demos.
   - `PaymobProvider` for real merchant checkout when keys exist.
2. `ai`:
   - `MockAiProvider` for deterministic CI/demo output.
   - `GroqAiProvider` when `GROQ_API_KEY` exists.
3. `email`:
   - `ConsoleEmailProvider` by default.
   - `ResendEmailProvider` later.
4. `jobs`:
   - `InlineJobRunner` by default.
   - `InngestJobRunner` later.
5. `rateLimit`:
   - `InMemoryRateLimiter` by default.
   - `UpstashRateLimiter` later.
6. `storage`:
   - URL/manual image mode by default.
   - Vercel Blob provider later.
7. `monitoring`:
   - console logging by default.
   - Sentry adapter later.
8. `billing`:
   - provider-agnostic plan/status interface only; no live platform charges in this pass.

Rules:

- CI must not require paid service secrets.
- Production must clearly report missing optional providers and either use allowed mock/demo mode or fail closed for money/security-sensitive paths.
- Keep env validation centralized in `src/lib/env.ts`.

## Workstream 3: Competitor-Grade Template System

Build a first-party template engine that stores templates as typed data, not hardcoded one-off JSX.

1. Define typed template objects:
   - `id`, `name`, `vertical`, `localeSupport`, `previewImage`, `tokens`, `blocks`, `demoProducts`, `copyVariants`, `qualityTags`.
2. Create 5-6 curated vertical templates:
   - Perfume/beauty.
   - Fashion/apparel.
   - Food/dessert/local restaurant.
   - Electronics/accessories.
   - Handmade/home decor.
   - Services/booking-friendly starter, if current commerce model can support it without overreach; otherwise defer services.
3. Each template must include polished blocks:
   - Announcement/promo bar.
   - Hero with strong merchandising copy.
   - Trust/payment/shipping strip.
   - Featured categories.
   - Product collection.
   - Product spotlight/story block.
   - Benefits/features.
   - Testimonials/social proof.
   - FAQ/policies.
   - Footer with contact/payment/shipping cues.
4. Every template must have Arabic and English copy variants.
5. Every template must be mobile-first and RTL-native:
   - Use logical spacing/classes where possible.
   - Avoid English-first fixed alignment.
   - Test `dir="rtl"` and `dir="ltr"`.
6. Add seeded demo products per vertical so newly created stores do not look empty or broken.
7. Store owner onboarding must include template preview and selection.
8. Admin must allow switching templates safely with preview before publishing.
9. AI layout suggestion must select/customize from these templates instead of generating arbitrary structure from scratch.
10. Add visual QA checklist comparing generated stores against Shopify/Wix/Salla/Zid expectations:
    - Above-the-fold appeal.
    - Mobile product browsing.
    - Clear price/currency.
    - Trust and payment confidence.
    - Arabic readability.
    - Empty-state quality.

## Workstream 4: Storefront Renderer Upgrade

1. Replace the current generic/default storefront with a typed block renderer.
2. Normalize block contracts so template data, admin editor, and AI output share the same schema.
3. Add robust fallbacks for missing block fields.
4. Render active products only.
5. Support product images, pricing, variants/stock display where existing schema allows.
6. Improve storefront navigation and footer for trust and conversion.
7. Add Arabic/English storefront labels for cart, checkout, empty cart, product count, buttons, and errors.
8. Ensure stores created by the platform look credible immediately, even before a merchant adds products.

## Workstream 5: Onboarding And Admin Experience

1. Improve signup/store creation flow:
   - Choose business vertical.
   - Choose locale/currency.
   - Preview/select template.
   - Generate seeded/demo products or first real product.
   - Publish store.
2. Admin dashboard should show setup progress:
   - Template selected.
   - Products added.
   - Payment mode configured.
   - Store published.
3. Add template management in admin:
   - Preview template.
   - Apply template.
   - Preserve existing products.
   - Warn before overwriting page layout/theme tokens.
4. Improve product CRUD quality:
   - Better image handling fallback.
   - Clear active/draft behavior.
   - AI description generation button with locale awareness.
5. Keep all admin actions tenant-scoped by authenticated membership.

## Workstream 6: Checkout, COD, And Paymob

1. Fix checkout tenant resolution before adding payment features.
2. Add payment method selection:
   - Mock online payment for free/demo mode.
   - COD as a real first-class flow.
   - Paymob when configured.
3. Implement idempotent checkout:
   - Client generates checkout attempt idempotency key.
   - Server checks existing payment/order before creating a new provider intent.
   - Unique `(tenant_id, idempotency_key)` remains enforced.
4. Paymob provider:
   - Prefer current Intention API per spec.
   - Verify HMAC on webhooks.
   - Store raw webhook payloads.
   - Update payment/order idempotently.
   - Keep sandbox/production config explicit.
5. Do not require real Paymob keys for CI/free demo.
6. Add tests for:
   - Duplicate checkout attempt.
   - Invalid tenant spoof attempt.
   - COD order creation.
   - Mock online payment success.
   - Webhook signature failure/success with fixtures.

## Workstream 7: AI Platform Foundation

Implement AI as a business differentiator without making free-tier operation impossible.

1. Replace deprecated Groq models with current spec-safe model choices:
   - Fast/product tasks: `openai/gpt-oss-20b`.
   - Higher-quality layout/analytics/RAG: `openai/gpt-oss-120b` or `qwen/qwen3.6-27b`.
   - Moderation: `openai/gpt-oss-safeguard-20b` where real Groq is enabled.
2. Use structured outputs validated by schemas for all AI processors.
3. Product description generation:
   - Input: product name, category, attributes, locale, brand tone.
   - Output: `{ description, tags }`.
   - Save `description_ai_generated = true` only when persisted to product.
   - Mock provider returns deterministic Arabic/English fixture content.
4. AI template/layout assistant:
   - Select best template by vertical/locale/tone.
   - Customize tokens/copy/block order within allowed schema.
   - Never output tenant IDs or arbitrary DB instructions.
5. RAG foundation:
   - Keep schema ready.
   - For free-tier MVP, use inline/mock ingestion or DB text search fallback if embeddings/provider unavailable.
   - When embeddings are enabled later, run ingestion through the job provider.
6. Storefront chat foundation:
   - Provide mocked/demo assistant if no Groq key.
   - Real mode must moderate input before retrieval/tool calls.
   - Structured lookups such as order status, stock, and price must be tenant-scoped DB tools, not RAG.
7. POS/analytics AI can be implemented as interfaces + first safe slices, not a brittle all-at-once system:
   - POS parser returns structured items validated against variants.
   - Analytics text-to-SQL must execute only through RLS-scoped read role and allowlisted query patterns.
8. Add AI cost/rate-limit hooks now, even if backed by in-memory providers on free tier.

## Workstream 8: Localization And Egypt/MENA Fit

1. Make Arabic a first-class storefront/admin path, not only marketing page support.
2. Use tenant `defaultLocale` and `defaultCurrency` consistently.
3. Format EGP correctly.
4. Add Arabic copy for:
   - Storefront sections.
   - Cart/checkout.
   - Payment method labels.
   - Admin setup progress.
   - Template names/descriptions.
5. Use logical styling for RTL.
6. Avoid hardcoded `$`, English-only messages, or LTR-only layout assumptions.
7. Keep Egyptian commerce defaults visible:
   - Paymob online payment.
   - COD.
   - Mobile-wallet/Meeza/installment-ready provider metadata where supported later.
   - Configurable tax rate, not hardcoded 14%.

## Workstream 9: Data Model And Migrations

1. Review schema against `doc/mvp-spec.md` and current product needs.
2. Add/adjust only what is necessary for this plan:
   - Template selection/published theme/page records if not already represented by `themes` and `pages`.
   - Store publish/setup status if needed.
   - Payment method/config metadata if needed.
   - Optional tax/shipping settings if needed for checkout credibility.
3. Keep migrations idempotent and compatible with Neon Free.
4. Avoid pgvector runtime dependency for free-tier MVP unless Neon branch supports it; keep embeddings optional.
5. Maintain indexes for tenant lookups, slugs, provider refs, and common admin/storefront queries.

## Workstream 10: Business And Scaling Readiness

Design now so future growth does not require a rewrite:

1. Keep domain modules clear:
   - `tenancy`.
   - `catalog`.
   - `templates`.
   - `storefront`.
   - `checkout/payments`.
   - `ai`.
   - `admin`.
   - `providers`.
2. Add upgrade hooks:
   - Job queue for AI ingestion/email/webhook retries.
   - Redis-backed rate limits.
   - Blob/image storage.
   - Sentry monitoring.
   - Email delivery.
   - Realtime POS/collaboration.
   - Platform billing.
3. Track SaaS/business metrics in code structure even if dashboards are simple initially:
   - Stores created.
   - Stores published.
   - Template selected.
   - Products added.
   - Orders created.
   - Payment method used.
   - AI generations used.
4. Enforce plan limits in a provider-neutral way:
   - Free product count limit.
   - AI generation limit.
   - Template availability if desired later.
   - Custom domain gating later.
5. Keep security boundaries stronger than competitors' plugin ecosystems:
   - RLS.
   - tenant-safe AI tools.
   - webhook verification.
   - no trusted client tenant IDs.

## Validation Checklist

Before considering the implementation done:

1. `npm run lint` passes.
2. `npm run test` passes without paid service secrets.
3. `npx tsc --noEmit` passes.
4. `npm run build` passes on free-tier env with clear optional-provider warnings only.
5. A new merchant can create a store, select a vertical template, preview it, and publish it.
6. Published store looks polished on mobile and desktop in Arabic and English.
7. Storefront never trusts client-supplied tenant IDs.
8. Checkout supports COD and mock online payment without Paymob keys.
9. Paymob path is implemented behind env gates and tested with mocked fixtures.
10. AI product description works with mock provider and real Groq provider when key exists.
11. Deprecated Groq models are gone.
12. RLS integration tests verify cross-tenant isolation or skip clearly only when no test DB is configured.
13. Templates pass competitor QA against Shopify/Wix/Salla/Zid criteria.
14. Free-tier deployment requires only Vercel + Neon; all other services are optional upgrades.

## Implementation Order

1. Stabilize CI/lint/tests/build.
2. Repair tenant resolution and RLS-safe API patterns.
3. Introduce provider interfaces and free-tier mocks.
4. Rework checkout for server-side tenant resolution, COD, mock payments, idempotency, and Paymob adapter.
5. Build template data model and curated vertical templates.
6. Upgrade storefront renderer and localization.
7. Upgrade onboarding/admin to template preview/apply/publish flow.
8. Replace AI provider/model usage and add structured product description + template assistant.
9. Add optional RAG/chat/POS/analytics foundations only through safe interfaces.
10. Run full validation checklist and document remaining paid-service upgrade steps.

## Risks

- Trying to implement every AI/POS/analytics feature before the storefront looks good can recreate the current weak user experience.
- Live Paymob/Groq behavior cannot be fully validated without real sandbox keys, so mocked tests must be complemented later by sandbox smoke tests.
- Neon Free limits may affect long-running DB integration tests; tests should be explicit about environment requirements.
- Template quality is product-critical and subjective; use competitor checklist and mobile screenshots to keep quality grounded.

## Explicit Non-Goals For This Pass

- No mandatory paid services beyond Vercel + Neon.
- No live platform subscription billing charges.
- No theme marketplace before first-party templates are excellent.
- No native mobile apps.
- No complex realtime collaboration until core storefront/admin quality is fixed.
- No hard dependency on pgvector/embeddings for free-tier MVP.
