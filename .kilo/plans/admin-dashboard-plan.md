# Implementation Plan: Admin Dashboard Overhaul

## Overview

Rebuild `/admin` as a tabbed workspace (`overview|tasks|analytics|briefing`) fed by one
parallel server loader, with an attention rail, KPI cards, onboarding for new stores, and an
AI briefing tab that degrades gracefully. Spec: `.kilo/plans/2026-09-05-admin-dashboard-design.md`.

Tasks tracked in `.kilo/plans/admin-dashboard-todo.md` (repo write permissions restrict plan
files to `.kilo/plans/`; `tasks/` is not writable here).

## Architecture Decisions

- Tabs via `searchParams`, not client-only state, so tabs are linkable from notifications.
- One loader fans out with `Promise.allSettled` so one failing source never blanks the page.
- Reuse `getStoreMetrics`, existing `OnboardingChecklist`, and the `insights` mock-fallback path.
- New queries only where missing: attention counts, daily revenue series, low-stock list.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Loader fan-out slows TTFB | Med | `allSettled`, per-section streaming/skeletons, 60s tab cache |
| Advisor quota spent | Low | Deterministic mock fallback, labeled as such |
| `admin/page.tsx` (474 lines) grows further | Med | Extract tab components first, then add |

## Open Questions

- None blocking; tab names pinned as `overview|tasks|analytics|briefing`.

## Task List (index)

See `admin-dashboard-todo.md`: Tasks 1–7 plus checkpoints after Tasks 2, 5, and 7.
