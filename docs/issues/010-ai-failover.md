# 10. Multi-provider AI routing with failover

**Label:** ready-for-agent, feature

## What to build

Implement AI provider failover routing: try primary provider (Groq), fall back to alternatives (OpenAI, Anthropic, etc.) on failure/timeout. Add provider health tracking and automatic failover configuration.

## Acceptance criteria

- [ ] Provider registry with health status tracking
- [ ] Automatic failover on provider timeout/error (5s threshold)
- [ ] Provider selection configurable per store
- [ ] Fallback to mock provider when all real providers fail
- [ ] Provider health dashboard in admin (optional)

## Blocked by

None - can start immediately
