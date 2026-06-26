# 3. Add `@next/bundle-analyzer` + dynamic imports

**Label:** ready-for-agent, performance

## What to build

Add `@next/bundle-analyzer` for bundle size visibility. Implement `React.lazy`/`dynamic` for heavy components (ThemeCustomizer, AIAgentDashboard, StorefrontBlocks) to reduce initial JS bundle.

## Acceptance criteria

- [ ] `@next/bundle-analyzer` installed and configured
- [ ] Heavy components use dynamic imports with loading skeletons
- [ ] Bundle size report generated on build

## Blocked by

None - can start immediately
