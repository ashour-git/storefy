# 2. Replace `any` types with proper interfaces

**Label:** ready-for-agent, code-quality

## What to build

Replace 100+ `any` type annotations with proper TypeScript interfaces. Priority files: ThemeCustomizer, StorefrontBlocks, admin pages. This improves type safety and IDE support.

## Acceptance criteria

- [ ] `any` usage reduced to < 10 (from 100+)
- [ ] No runtime behavior changes
- [ ] TypeScript strict mode passes

## Blocked by

None - can start immediately
