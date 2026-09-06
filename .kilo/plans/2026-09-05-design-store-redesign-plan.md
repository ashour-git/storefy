# Implementation Plan: Design Store Workspace Redesign

## Overview

Replace the 4,151-line `ThemeCustomizer` monolith with five focused components on an
editorial-software visual system (paper/ink/brass, Fraunces+Inter+JetBrains Mono, brass
hairline as the AI's only "look at me" beat). AI-first workspace: brief is the entrance,
presets and tokens are secondary, Save is the one primary action. Spec:
`.kilo/plans/2026-09-05-design-store-redesign-design.md`. Design plan (palette, type,
signature): `.kilo/plans/2026-09-05-design-store-redesign-design.md` plus the chat-approved
plan summary.

Tasks tracked in the same `.kilo/plans/` file alongside the plan (plan files restricted
there per repo write policy).

## Architecture Decisions

- `DesignWorkspace.tsx` owns undo/redo, save, device state, and the brief transcript;
  children are presentational and stateless so each can be swapped or tested alone.
- The five panels compose a three-column CSS grid; the right rail slides over the
  preview rather than reflowing it.
- AI call reuses the existing `POST /api/ai/store-design` endpoint and contract
  (`tokens`, `blocks`, `source`, `warnings`).
- The old `ThemeCustomizer.tsx` is deleted in the same PR after a thin re-export
  bridge is verified.

## Task List

### Phase 1: Foundation (tokens and page shell)

- [ ] **Task 1 — Design tokens and CSS shell.** Add `--studio-*` tokens to
  `src/app/globals.css` (paper, ink, carbon, brass, shell; Inter + Fraunces + JetBrains
  Mono with the existing Tailwind layer; an 8px spacing scale; the brass hairline keyframe
  used only on AI token application). Acceptance: tokens are the only color values used
  in the new components, axe reports zero contrast violations, no Tailwind utility class
  in the new files uses a raw hex color.
  Verification: `npx tsc --noEmit`; manual hex audit; targeted axe via the existing
  `agent-browser a11y` flow on a local mount.
  Files: `src/app/globals.css`, `src/components/admin/DesignWorkspace/design-tokens.css`
  (new). Scope: S.

- [ ] **Task 2 — Page route and server data.** Convert `src/app/admin/themes/page.tsx` to
  a server component that fetches store, theme, page, and AI quota usage, then mounts
  `<DesignWorkspace>`. Acceptance: server fetch is one awaited tuple; the workspace
  receives the same shape whether the page renders an existing store or a brand-new one.
  Verification: `npx tsc --noEmit`; existing resolver tests pass.
  Files: `src/app/admin/themes/page.tsx`. Scope: S.

### Phase 2: Composed workspace

- [ ] **Task 3 — DesignWorkspace orchestrator.** Build the page-level component with
  undo/redo (history of `{ tokens, blocks }`), save (calls the existing
  `/api/themes/customize`), and a single primary Save button. Acceptance: Save is the
  one primary action in the top-right; undo/redo round-trips state; saving shows
  `Saved` exactly once and only when the request succeeds.
  Verification: unit test for undo/redo; `npx tsc --noEmit`.
  Files: `src/components/admin/DesignWorkspace/DesignWorkspace.tsx` (new),
  `__tests__/DesignWorkspace.test.tsx` (new). Scope: M.

- [ ] **Task 4 — BriefPanel.** Replace the indigo AI panel with a single primary
  "Generate my look" button, then a brief form (mood, audience, color instinct),
  then a transcript of the last generation showing source and warnings. Acceptance: skip
  path still generates; the transcript never shows a spinner inside a card; warnings
  are listed verbatim from the API response.
  Verification: unit test for skip path and warnings surface; `npx tsc --noEmit`.
  Files: `src/components/admin/DesignWorkspace/BriefPanel.tsx` (new),
  `__tests__/BriefPanel.test.tsx` (new). Scope: M.

- [ ] **Task 5 — PresetPanel and TokenInspector.** Preset list with token thumb and
  label, single-click apply. Token inspector as a collapsible right rail rendering
  every color, type, and radius field as a labeled control with JetBrains Mono for hex
  values. Acceptance: preset apply pushes history; the inspector never exceeds 360px
  wide; closing it slides it off the preview rather than reflowing it.
  Verification: unit tests for both; `npx tsc --noEmit`.
  Files: `src/components/admin/DesignWorkspace/PresetPanel.tsx` (new),
  `TokenInspector.tsx` (new), `__tests__/PresetPanel.test.tsx`,
  `__tests__/TokenInspector.test.tsx`. Scope: M.

- [ ] **Task 6 — DesignPreview and the brass hairline.** Render the live storefront in
  an iframe that respects `?device=mobile|desktop`. When AI tokens are applied, the
  preview's top edge traces a 2px brass hairline for 4 seconds, then fades. Acceptance:
  the hairline only fires when the source is `ai`; reduced-motion users get a 0s fade
  instead; device switching is a `<Link>` not a `<button>`, shareable.
  Verification: unit test for hairline gating and motion preference; `npx tsc --noEmit`.
  Files: `src/components/admin/DesignWorkspace/DesignPreview.tsx` (new),
  `__tests__/DesignPreview.test.tsx` (new). Scope: M.

### Phase 3: Decompose and delete the old customizer

- [ ] **Task 7 — Bridge and delete.** Add a one-line re-export `export { ThemeCustomizer } from './DesignWorkspace'` for one commit so any other file that imports it still
  resolves, then delete `src/components/admin/ThemeCustomizer.tsx` and the bridge in the
  same commit. Acceptance: grep for `ThemeCustomizer` returns no source references; the
  workspace renders with the same `store` prop shape the old file accepted.
  Verification: `npm run test`; `npx tsc --noEmit`; `grep -r ThemeCustomizer src/`.
  Files: `src/components/admin/ThemeCustomizer.tsx` (deletion). Scope: S.

### Checkpoint: Complete

- [ ] All four pieces render in the browser
- [ ] Brief → preview → save round-trip works
- [ ] Axe scan of the workspace reports zero violations
- [ ] Full suite passes, `tsc` clean
- [ ] Ready for review

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| `ThemeCustomizer` has hidden consumers outside admin | Med | Grep for every import; bridge re-export lands in same commit as deletion |
| Iframe preview re-renders on every keystroke | Med | Debounce token updates; preserve device URL on save |
| Brass hairline feels gimmicky in user testing | Low | Easy to remove; does not affect state |
| Visual style drifts back into the AI default look | Med | Spec + token-only CSS guards re-entry |

## Open Questions

- None blocking; palette/type/signature are pinned and approved in chat.
