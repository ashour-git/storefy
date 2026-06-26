# 1. Replace `<img>` with `next/image` across storefront + admin

**Label:** ready-for-agent, performance

## What to build

Replace all raw `<img>` tags with Next.js `Image` component across 9 files (storefront + admin). This provides automatic AVIF/WebP conversion, lazy loading, and proper sizing.

## Acceptance criteria

- [ ] All `<img>` tags replaced with `next/image` `Image` component
- [ ] No visual regressions — images render identically at all breakpoints
- [ ] Lighthouse performance score improves (image optimization)

## Blocked by

None - can start immediately
