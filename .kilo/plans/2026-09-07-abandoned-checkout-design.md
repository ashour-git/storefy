# Abandoned Checkout Recovery — Design Spec (v2: upgrade in place)

## Goal

Make the existing dormant recovery flow actually fire. Audit proved the cron,
mark-abandoned update, email template, and Resend wiring all work — but zero emails
can ever go out because capture never sends `customerEmail` and the restore link
rehydrates nothing. This spec fixes the joints, not the pipes.

## Decisions (approved)

- Upgrade the existing carts-based flow; no new `abandoned_checkouts` table (v1 of
  this spec is superseded).
- Trigger stays contact-given: the checkout contact step sends `customerEmail` with
  the cart sync.
- Restore via signed single-use token route, keeping the link channel-agnostic for
  a later WhatsApp slice.

## Section 1 — Capture fix

`CartProvider.syncCartToDb` accepts an optional `customerEmail` and includes it in
the POST body; the checkout contact step passes the buyer's email after validation.
Server row update is unchanged (it already persists `customerEmail` when present).
Debounce stays as-is (2s trailing sync).

## Section 2 — Restore and recovered marking

New `GET /checkout/restore?token=…` route: verifies an HMAC-signed token
(cart id + tenant + expiry), loads the server cart, and seeds the buyer's session so
checkout renders the items on any device. Token is single-use and expires in 7 days;
no raw cart data in the URL. Order completion marks the matching abandoned row
`recovered` (lookup by tenant + contact), suppressing any in-flight reminder.

## Section 3 — Cleanup, edge cases, testing

Delete the unreachable 23h `reminderNumber` branch. Edge cases: cross-device
completion matches by contact; COD counts as completed; bounced contacts get no
retries (one send only); expired tokens render the standard empty-cart state, never
an error wall. Tests: unit tests for token sign/verify + expiry, integration test
for sync-with-email → cron mark → reminder → restore round-trip with faked clock,
red-green pair proving a completed order suppresses the email and a used token
cannot be replayed.

## Out of scope

WhatsApp recovery channel, per-merchant delay/value tuning, second reminders,
discount codes inside recovery emails. Each gets its own spec if approved later.
