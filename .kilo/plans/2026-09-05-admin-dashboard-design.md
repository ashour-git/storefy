# Admin Dashboard Overhaul — Design Spec

Slice 1 of the program to make Storefy the best SaaS for Egyptian merchants.
Remaining slices (separate specs): storefront conversion, product management depth, differentiators.

## Goal

When a merchant opens the admin dashboard, it does four jobs in rank order:
attention items first, business performance second, new-store onboarding, AI advisor briefing woven through.

## Section 1 — Layout and information hierarchy

Four tabs under one route (`/admin?tab=overview|tasks|analytics|briefing`), all fed by a
single server loader assembled from existing readers (`getStoreMetrics`, AI usage,
order/customer counts). Overview opens with an attention rail (unfulfilled orders, low stock,
failed payments, each deep-linking to its fix screen), then KPI cards, then a 7-day
revenue/orders spark strip. Stores with zero orders see an onboarding checklist in place of
the rail until their first sale. Tabs share one loading and error pattern; URL state makes
any tab linkable from notifications.

## Section 2 — Data flow

One route loader fans out to existing readers in parallel: store metrics, pending-order
counts, low-stock query, AI quota usage, and (only on the briefing tab) the advisor stream.
Tab sections render independently; a slow advisor response shows a skeleton in its own card
instead of blocking KPIs. No refetch on tab switch within a 60-second window; a lightweight
client cache keyed by tab plus `searchParams` holds the last payload. Mutating actions
revalidate only their own section.

## Section 3 — Error handling, empty states, testing

Each tab section owns three states: skeleton loading, compact error card with section-scoped
retry (one failing query never blanks the page), guided empty states (zero orders points to
the store link and launch checklist). The AI briefing degrades to the deterministic
mock-insight path in `insights/route.ts` when quota is spent or the provider fails, labeled
as such. Tests: route-level loader fan-out tests (including one-source-down), component
tests for each tab's three states, contract test pinning tab `searchParams` values.

## Out of scope

Storefront routes, catalog/inventory management screens, POS, billing changes. Those are
later slices with their own specs.
