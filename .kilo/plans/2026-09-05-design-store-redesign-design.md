# Design Store Workspace Redesign — Design Spec

## Goal

Replace the 4,151-line `ThemeCustomizer` monolith with a focused, editorial-software
workspace that elevates AI-first generation while keeping presets and fine-grained
tokens. Output identity: minimal, token-driven, B2B-prosumer, not AI-generated.

## Decisions (approved)

- Visual identity: editorial software — token-driven, neutral surfaces, restrained type.
- Scope: decompose `ThemeCustomizer` into focused modules; delete the monolith in the
  same PR via a thin re-export bridge.
- AI positioning: AI-first — brief is the workspace's hero entrance, presets and tokens
  are secondary, save is one primary action.

## Section 1 — Architecture

Three-pane workspace under `/admin/themes`:
- **Left rail (≈24%):** AI brief, presets, section tools.
- **Center (≈70%):** device-switched preview that fills the viewport.
- **Right rail (collapsible, ≈6%):** token inspector for fine-tuning after AI.

A `DesignWorkspace.tsx` page owns undo/redo, save, and the loading shell. URL encodes
device (`?device=mobile|desktop`) so preview links are shareable. The brief, theme, and
page load server-side so the AI pane renders from a single source of truth.

## Section 2 — Components

- `DesignWorkspace.tsx` — page-level orchestrator; owns history, save state, shell.
- `BriefPanel.tsx` — AI-first entrance: one "Generate my look" button, structured brief
  form, transcript of last generation with source and warnings.
- `PresetPanel.tsx` — preset list with token thumb and label, single-click apply.
- `TokenInspector.tsx` — collapsible right-rail token editor.
- `DesignPreview.tsx` — owns device switching and the live storefront iframe.

Each owns its own state and exposes one or two props; the workspace composes them.
`ThemeCustomizer.tsx` becomes a thin compatibility re-export and is deleted in the
same PR.

## Section 3 — Data flow, error and empty handling, testing

Workspace fetches brief draft, theme, and page on the server. Generation runs in a
server action that calls the existing `/api/ai/store-design`, writes the result into
the workspace's controlled state, and surfaces source/warnings in the brief transcript.
Undo/redo, save, and the new commit live in `DesignWorkspace` so children stay pure.

Empty states: brand-new store shows a one-line brief; existing store with no edits
shows presets first, brief second; failed generation shows a labeled fallback
(tokens applied) with the warning listed in the brief transcript, never a blank preview.

Testing: per-component unit tests on focus and undo; integration test that mounts
`DesignWorkspace` with a mocked `/api/ai/store-design` and asserts brief → preview →
save round-trip; axe scan on the workspace.

## Out of scope

New block types, conversational per-section remix, visual editor rewrite. Each gets
its own spec if approved later.
