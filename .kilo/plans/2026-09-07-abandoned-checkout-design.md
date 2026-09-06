# Abandoned Checkout Recovery — Design Spec

## Goal

Recover checkouts where the buyer gave contact details (phone or email) but never
completed payment, with a single reminder email containing a one-click cart-restore
link. First slice of the Shopify-gap program; proves the checkout → jobs → email
pipes for later slices.

## Decisions (approved)

- Trigger: contact given, then exit (not cart thresholds, not every checkout start).
- Approach A: event row + Inngest delayed job + Resend email. WhatsApp deferred but
  kept compatible via a channel-agnostic restore link.
- YAGNI cuts: no per-merchant delay tuning, no A/B testing, no second reminder.

## Section 1 — Capture and data model

New `abandoned_checkouts` table: tenant, contact (phone or email + channel flag),
cart snapshot (items, totals, currency), storefront URL for restore, status (`open` →
`recovered` | `expired`), timestamps. Row created or refreshed when the buyer submits
contact details at checkout, debounced per session. Rows expire after 7 days, keeping
the table bounded on free Postgres.

## Section 2 — Recovery timing and the check job

One Inngest function per abandoned row sleeps 2 hours (constant, not per-merchant
config), then queries orders for a matching tenant + contact created after the row.
Match → mark `recovered`, send nothing. No match → send the email, mark `expired`.
Idempotency key on `(tenant, contact, cart-hash)` prevents double-sends on
double-submit or retry.

## Section 3 — Email, restore link, edge cases, testing

Resend email follows existing email-template patterns: buyer name if known, item
thumbnails, EGP total, one prominent restore button. Restore link is a signed,
single-use token (`/checkout/restore?token=…`) rehydrating the cart server-side,
expiring after use or 7 days; no raw cart data in the URL. Edge cases: cross-device
completion matches by contact; COD counts as completed; bounced contacts get no
retries (one send only). Tests: unit tests for match/expiry logic, integration test
for row → wait → email → restore with a faked clock, red-green pair proving a
completed order suppresses the email.

## Out of scope

WhatsApp recovery channel, per-merchant delay/value tuning, second reminders, discount
codes inside recovery emails. Each gets its own spec if approved later.
