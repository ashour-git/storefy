# 4. Add response caching headers + deduplicate session fetch

**Label:** ready-for-agent, performance

## What to build

Add HTTP cache headers (`Cache-Control`, `stale-while-revalidate`) to storefront API routes. Deduplicate redundant session/auth fetches across components to reduce DB load.

## Acceptance criteria

- [ ] Storefront product/category APIs return cache headers
- [ ] Session fetch deduplicated (single call per request)
- [ ] No stale auth state on page transitions

## Blocked by

None - can start immediately
