# 8. Set up UptimeRobot monitoring `/api/health`

**Label:** needs-info

## What to build

Set up UptimeRobot (or similar) to ping `https://storefy-green.vercel.app/api/health` every 5 minutes to prevent Neon free tier DB from sleeping due to inactivity.

## Acceptance criteria

- [ ] UptimeRobot account created (free tier)
- [ ] Monitor configured for `/api/health` endpoint
- [ ] Alert email configured for downtime
- [ ] Neon DB stays warm (no cold starts)

## Blocked by

None - can start immediately (requires human action to create account)
