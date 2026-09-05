# AI Store Design Generation — Design Spec

## Goal

End generic-looking Storefy storefronts. An AI Design Brief flow generates a bespoke,
complete store look (tokens + block arrangement) inside the existing theme architecture,
so every merchant gets a distinctive storefront without touching the customizer.

## Decisions (approved)

- Direction: AI Design Brief → full store look (approach A). Curated packs rejected
  (output converges); conversational art-director deferred to phase two.
- Constraint: evolve tokens + blocks. No new theme engine, renderer, or editor rebuild.
- The 4,151-line ThemeCustomizer is fed by the generator, not rewritten.

## Section 1 — Architecture

Pipeline `generateStoreDesign` with four independently testable stages:

1. **Brief collector** — 3–4 questions (brand mood, audience, color instinct) plus
   auto-detected category, locale, and product sample. Skippable; inference fills gaps.
2. **Generator** — single Groq call, JSON-schema-constrained prompt, output strictly
   `{ tokens, blocks }` matching `ThemeTokens` and block-settings shapes. Temperature
   ~0.7 for taste variance.
3. **Guardrails** — deterministic validators: text/background contrast ≥ 4.5, fonts
   restricted to the 7-entry allowlist, no emoji-as-icon, RTL-safe alignment, required
   blocks present (hero, collection, footer). One bounded retry on failure, then fall
   back to the closest vertical preset.
4. **Preview applier** — writes through the existing theme/page save path, so undo is
   the previous record.

## Section 2 — Data flow

Design Store shows "Generate my look" next to the manual customizer. Brief answers (or
skip) POST to `/api/ai/store-design`, which runs plan-gate → quota check → moderation →
generator → guardrails → returns `{ tokens, blocks, source, warnings }`. The customizer
previews instantly; nothing persists until Save reuses the current write path. Every
generation logs via `logAiCall` with token estimates for visible per-design cost.
Regenerate keeps the brief and varies only the seed.

## Section 3 — Error handling, empty states, testing

Quota spent → 402 with closest preset applied and labeled. Moderation rejection names the
offending input. Guardrail failure after retry → preset with warnings listed. Provider
outage → preset + notice (same contract as the advisor). Empty brief is valid input.
Tests: schema-conformance on generator output, deterministic guardrail unit tests
including adversarial low-contrast and non-allowlist inputs, route tests for 402/400/500
shapes, red-green pair proving invalid output never reaches the save path.

## Out of scope

Conversational per-section remix (phase two), new block types, visual editor rebuild,
curated pack library. Each gets its own spec if approved later.
