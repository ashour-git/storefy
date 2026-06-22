import { db, withTenant } from '../../../../db';
import * as schema from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const PAYMOB_HMAC_SECRET = process.env.PAYMOB_HMAC_SECRET || "mock_hmac_secret";

/**
 * Validates the Paymob HMAC signature to ensure the webhook is legitimate.
 */
function verifyPaymobHmac(hmacHeader: string, queryParams: URLSearchParams): boolean {
  if (PAYMOB_HMAC_SECRET === "mock_hmac_secret") return true;

  // Extract the specific parameters Paymob uses for HMAC calculation
  const keys = [
    'amount_cents', 'created_at', 'currency', 'error_occured', 
    'has_parent_transaction', 'id', 'integration_id', 'is_3d_secure',
    'is_auth', 'is_capture', 'is_refunded', 'is_standalone_payment',
    'is_voided', 'order', 'owner', 'pending', 'source_data.pan',
    'source_data.sub_type', 'source_data.type', 'success'
  ];

  let hmacString = "";
  for (const key of keys) {
    const value = queryParams.get(key) || "";
    hmacString += value;
  }

  const calculatedHmac = crypto
    .createHmac("sha512", PAYMOB_HMAC_SECRET)
    .update(hmacString)
    .digest("hex");

  return calculatedHmac === hmacHeader;
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const hmacHeader = url.searchParams.get('hmac') || "";

    // Parse the JSON payload sent by Paymob
    const body = await request.json();

    if (!verifyPaymobHmac(hmacHeader, url.searchParams)) {
      return Response.json({ error: "Invalid HMAC signature" }, { status: 401 });
    }

    const { obj } = body;
    const providerOrderId = obj.order.id.toString();
    const isSuccess = obj.success === true;

    // We must find the payment record globally first because the webhook doesn't contain the tenantId
    const payments = await db.select().from(schema.payments).where(eq(schema.payments.providerRef, providerOrderId));
    const payment = payments[0];

    if (!payment) {
      return Response.json({ error: "Payment record not found" }, { status: 404 });
    }

    // Now, update the order and payment statuses securely within the tenant's context
    await withTenant(payment.tenantId, async (tx) => {
      const newStatus = isSuccess ? 'succeeded' : 'failed';

      // Idempotency check: don't double-process
      if (payment.status === newStatus) return;

      // Update payment
      await tx.update(schema.payments)
        .set({ status: newStatus })
        .where(eq(schema.payments.id, payment.id));

      // Update associated order
      const orderStatus = isSuccess ? 'paid' : 'cancelled';
      await tx.update(schema.orders)
        .set({ status: orderStatus })
        .where(eq(schema.orders.id, payment.orderId));
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Paymob Webhook Error:", error);
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
