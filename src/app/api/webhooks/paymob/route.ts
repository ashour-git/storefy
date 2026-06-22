import { db, withTenant } from '../../../../db';
import * as schema from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { getPaymentProvider } from '../../../../lib/providers/payments';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const provider = getPaymentProvider('online');

    if (provider.verifyWebhook && !provider.verifyWebhook(request.url, body)) {
      return Response.json({ error: "Invalid HMAC signature" }, { status: 401 });
    }

    const { obj } = body;
    if (!obj || !obj.order || !obj.order.id) {
      return Response.json({ error: "Invalid webhook payload structure" }, { status: 400 });
    }

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

      // Idempotency check: don't double-process terminal status
      if (payment.status === 'succeeded' || payment.status === 'failed' || payment.status === 'refunded') {
        // Payment is already in terminal state, update raw_webhook if needed or return
        await tx.update(schema.payments)
          .set({ rawWebhook: body })
          .where(eq(schema.payments.id, payment.id));
        return;
      }

      // Update payment
      await tx.update(schema.payments)
        .set({ 
          status: newStatus,
          rawWebhook: body 
        })
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
