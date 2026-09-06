# Implementation Plan: AI Store Design Generation

## Overview

Build the approved brief-to-storefront pipeline: a guardrailed generator producing
`{ tokens, blocks }` inside the existing theme schema, served by a new
`/api/ai/store-design` route reusing the AI quota/moderation/logging pipeline, with a
"Generate my look" entry in Design Store that previews through the current save path.
Spec: `.kilo/plans/2026-09-05-store-design-generation-design.md`.

Tasks tracked below (plan files live under `.kilo/plans/` per repo write permissions).

## Architecture Decisions

- Generator output validated against `ThemeTokens` and block-settings shapes before response.
- Guardrails deterministic and LLM-free so they are unit-testable without API keys.
- Route follows the copywriter pattern: auth → validate → plan-gate → quota →
  moderation → Groq JSON call → guardrails → log → respond, preset fallback labeled.
- UI reuses ThemeCustomizer state and `/api/themes/customize` save path; no new editor.

## Task List

### Phase 1: Foundation

- [ ] Task 1: Design guardrails lib (`src/lib/ai/store-design-guardrails.ts`) — contrast ≥ 4.5 check, 7-font allowlist check, required-blocks check, RTL safety check. Unit tests with valid, low-contrast, non-allowlist, and missing-block fixtures.
  - Acceptance: all four checks reject their adversarial fixture and accept a valid design.
  - Verification: `npm run test -- src/lib/ai/__tests__/store-design-guardrails.test.ts`; `npx tsc --noEmit`.
- [ ] Task 2: Generator lib (`src/lib/ai/store-design.ts`) — brief-to-prompt builder, Groq call with JSON schema constraint, parse + guardrail gate, one bounded retry, preset fallback. Tests with mocked fetch (valid output, invalid output → retry, failure → fallback).
  - Acceptance: valid output passes through; invalid triggers exactly one retry then fallback; provider error returns labeled fallback without throwing.
  - Verification: `npm run test -- src/lib/ai/__tests__/store-design.test.ts`; `npx tsc --noEmit`.

### Checkpoint: Foundation
- [ ] Guardrail + generator tests pass; no route or UI touched yet.

### Phase 2: Route and UI

- [ ] Task 3: `POST /api/ai/store-design` route — auth, input caps, plan-gate, quota check, moderation, logging with token estimates, `{ tokens, blocks, source, warnings }` response, 402/400/500 shapes. Route tests for each shape.
  - Acceptance: unauthenticated → 401; over-quota → 402 with labeled preset; invalid brief → 400; provider down → 500-shape with preset fallback, never a leak.
  - Verification: route tests green; full `npm run test`; `npx tsc --noEmit`.
- [ ] Task 4: Design Store "Generate my look" — brief dialog (mood, audience, color, skip), preview apply into customizer state, Save reuses existing path, regenerate varies seed, fallback labeled with warnings.
  - Acceptance: skip-everything still generates; preview updates without persisting; Save persists through the existing path; fallback shows its label and warnings.
  - Verification: manual brief → preview → save pass; `npx tsc --noEmit`.

### Checkpoint: Complete
- [ ] Full suite passes, `tsc` clean, end-to-end brief → preview → save works.
- [ ] Ready for review.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| LLM returns schema-invalid JSON | Med | Guardrail gate + retry + preset fallback; conformance tests |
| Low-contrast tasteful output rejected | Low | Warnings listed, merchant can still edit manually |
| Token cost per design | Low | Single call, logged estimates, quota-gated |

## Open Questions

- None blocking; temperature ~0.7 and single retry per approved spec.
