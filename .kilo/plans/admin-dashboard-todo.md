# Todo: Admin Dashboard Overhaul

## Task 1: Tab shell with URL state and shared section states

**Description:** Extract a tabbed shell for `/admin` reading the `tab` searchParam
(`overview|tasks|analytics|briefing`, default `overview`), plus shared `SectionSkeleton`,
`SectionError` (with scoped retry), and `SectionEmpty` presentation components reusing
`admin-*` CSS classes. No data changes yet; existing overview content renders inside the
Overview tab unchanged.

**Acceptance criteria:**
- [ ] Unknown `tab` values fall back to `overview`
- [ ] Each shared state component renders with keyboard-accessible retry where applicable
- [ ] Existing dashboard output is pixel-equivalent inside the Overview tab

**Verification:**
- [ ] Tests pass: `npm run test -- src/app/admin`
- [ ] Build succeeds: `npx tsc --noEmit`
- [ ] Manual check: switch tabs via URL, invalid tab redirects to overview

**Dependencies:** None

**Files likely touched:**
- `src/app/admin/page.tsx`
- `src/components/admin/DashboardTabs.tsx`
- `src/components/admin/SectionStates.tsx`

**Estimated scope:** Medium: 3-5 files

## Task 2: Attention rail on Overview

**Description:** Add an attention rail above the KPI cards showing unfulfilled orders count,
low-stock variants, and failed payments, each deep-linking to its admin screen. Counts come
from one new `getAttentionItems(tenantId)` reader; a section-scoped error card covers query
failure.

**Acceptance criteria:**
- [ ] Rail shows only non-zero attention items; all-zero hides the rail
- [ ] Every item links to the screen where the merchant fixes it
- [ ] Query failure shows retry card, rest of Overview still renders

**Verification:**
- [ ] Tests pass: `npm run test -- src/lib/admin/__tests__/attention.test.ts`
- [ ] Build succeeds: `npx tsc --noEmit`
- [ ] Manual check: create a pending order, see it in the rail

**Dependencies:** Task 1

**Files likely touched:**
- `src/lib/admin/attention.ts`
- `src/lib/admin/__tests__/attention.test.ts`
- `src/components/admin/AttentionRail.tsx`

**Estimated scope:** Medium: 3-5 files

## Checkpoint: Shell and attention

- [ ] All tests pass
- [ ] Application builds without errors
- [ ] Overview renders rail + existing KPIs; review with human before proceeding

## Task 3: KPI cards and 7-day spark strip

**Description:** Replace the ad-hoc stat markup in `admin/page.tsx` with KPI cards fed by
`getStoreMetrics` plus a new 7-day revenue/orders series query, rendered as lightweight SVG
sparks (no chart dependency).

**Acceptance criteria:**
- [ ] Cards show revenue, orders, AOV, customers from `getStoreMetrics`
- [ ] Spark strip renders 7 days of revenue and orders; empty days render as zero, not gaps
- [ ] Zero-order stores see onboarding checklist instead of charts

**Verification:**
- [ ] Tests pass: `npm run test -- src/lib/admin`
- [ ] Build succeeds: `npx tsc --noEmit`

**Dependencies:** Tasks 1, 2

**Files likely touched:**
- `src/lib/admin/revenue-series.ts`
- `src/components/admin/KpiCards.tsx`
- `src/components/admin/SparkStrip.tsx`

**Estimated scope:** Medium: 3-5 files

## Task 4: Onboarding checklist for new stores

**Description:** Adapt the existing `OnboardingChecklist` into the Overview empty state for
zero-order stores (create store → add product → customize theme → share link → first order),
each step linking to its screen and checking off from live store state.

**Acceptance criteria:**
- [ ] Steps reflect live state (e.g., product step completes when first active product exists)
- [ ] Checklist disappears after first paid order, replaced by rail + KPIs
- [ ] Every step is keyboard-accessible and labeled

**Verification:**
- [ ] Tests pass: `npm run test -- src/components/admin`
- [ ] Manual check: new store shows checklist; first order flips to standard overview

**Dependencies:** Task 1

**Files likely touched:**
- `src/components/admin/OnboardingChecklist.tsx`
- `src/app/admin/page.tsx`

**Estimated scope:** Small: 1-2 files

## Task 5: Tasks and Analytics tabs

**Description:** Build the Tasks tab (actionable items derived from attention + onboarding
remnants with done-state) and the Analytics tab (extended metrics: top products, channel
split, repeat-customer rate) behind the shared section states, with a 60-second client tab
cache so switching tabs never refetches.

**Acceptance criteria:**
- [ ] Tab switch within 60 seconds issues no new fetch
- [ ] Analytics reuses the deterministic mock path when data is missing
- [ ] Both tabs handle loading, error, and empty states independently

**Verification:**
- [ ] Tests pass: `npm run test -- src/app/admin`
- [ ] Build succeeds: `npx tsc --noEmit`

**Dependencies:** Tasks 1–4

**Files likely touched:**
- `src/components/admin/TasksTab.tsx`
- `src/components/admin/AnalyticsTab.tsx`
- `src/lib/admin/analytics.ts`

**Estimated scope:** Medium: 3-5 files

## Checkpoint: Core tabs

- [ ] All tests pass
- [ ] End-to-end overview → tasks → analytics flow works
- [ ] Review with human before proceeding

## Task 6: Briefing tab with graceful AI degradation

**Description:** Build the Briefing tab on the existing advisor stream, falling back to the
deterministic mock-insight path from `insights/route.ts` (labeled as such) when quota is
spent or the provider fails. Streaming renders incrementally in its own card.

**Acceptance criteria:**
- [ ] Quota-exceeded shows labeled fallback brief, not an error wall
- [ ] Provider failure mid-stream keeps partial content plus retry
- [ ] No briefing fetch fires until the tab is first opened

**Verification:**
- [ ] Tests pass: `npm run test -- src/app/api/ai`
- [ ] Manual check: force quota error, confirm labeled fallback

**Dependencies:** Task 1

**Files likely touched:**
- `src/components/admin/BriefingTab.tsx`
- `src/app/api/ai/insights/route.ts`

**Estimated scope:** Medium: 3-5 files

## Task 7: Loader fan-out, contract tests, cleanup

**Description:** Convert the dashboard loader to `Promise.allSettled` fan-out, add a contract
test pinning the `tab` searchParam values, and remove superseded ad-hoc markup from
`admin/page.tsx` keeping it under a healthy size.

**Acceptance criteria:**
- [ ] One failing source still renders the rest of the dashboard
- [ ] Contract test fails if a tab value is renamed without updating the test
- [ ] `admin/page.tsx` contains routing/loading only, no chart or card markup

**Verification:**
- [ ] Tests pass: `npm run test`
- [ ] Build succeeds: `npx tsc --noEmit`
- [ ] Manual check: full dashboard pass at 320px, 768px, 1440px

**Dependencies:** Tasks 1–6

**Files likely touched:**
- `src/app/admin/page.tsx`
- `src/app/admin/__tests__/dashboard-contract.test.ts`

**Estimated scope:** Small: 1-2 files

## Checkpoint: Complete

- [ ] All acceptance criteria met
- [ ] Ready for review
