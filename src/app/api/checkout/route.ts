import { db, withTenant } from '../../../db';
import * as schema from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { authenticatePaymob, createPaymobOrder, generatePaymentKey } from '../../../lib/paymob';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantId, items, customerDetails } = body;

    if (!tenantId || !items || !items.length || !customerDetails) {
      return Response.json({ error: 'Missing required checkout data' }, { status: 400 });
    }

    // Process checkout inside the tenant context to ensure data isolation
    const { paymentKey, orderId } = await withTenant(tenantId, async (tx) => {
      // 1. Calculate total amount
      let totalAmountCents = 0;
      for (const item of items) {
        const product = await tx.query.products.findFirst({
          where: eq(schema.products.id, item.productId),
        });
        
        if (!product) throw new Error(`Product ${item.productId} not found`);
        // Assuming basePrice is in whole units (e.g., 350 EGP -> 35000 cents)
        totalAmountCents += Math.round(parseFloat(product.basePrice) * 100) * item.quantity;
      }

      // 2. Create the internal Order record
      const amountStr = (totalAmountCents / 100).toString();
      const [order] = await tx.insert(schema.orders).values({
        tenantId,
        channel: 'online',
        status: 'pending',
        subtotal: amountStr,
        grandTotal: amountStr,
        currency: 'EGP',
      }).returning();

      // 3. Initiate Paymob Flow
      const token = await authenticatePaymob();
      
      const paymobOrderId = await createPaymobOrder(token, {
        amount_cents: totalAmountCents,
        currency: "EGP",
        merchant_order_id: order.id,
        items: items.map((i: any) => ({
          name: `Product ${i.productId}`,
          amount_cents: "0",
          description: "Storefy item",
          quantity: i.quantity.toString()
        }))
      });

      // 4. Generate the payment key (Iframe URL Token)
      const billingData = {
        apartment: "NA",
        email: customerDetails.email || "dummy@storefy.com",
        floor: "NA",
        first_name: customerDetails.firstName || "Customer",
        street: customerDetails.street || "NA",
        building: "NA",
        phone_number: customerDetails.phone || "+201000000000",
        shipping_method: "PKG",
        postal_code: "NA",
        city: customerDetails.city || "Cairo",
        country: "EG",
        last_name: customerDetails.lastName || "Storefy",
        state: "NA"
      };

      const payKey = await generatePaymentKey(token, paymobOrderId, totalAmountCents, "EGP", billingData);

      // 5. Create the payment record in the database tracking the Paymob Order ID
      await tx.insert(schema.payments).values({
        tenantId,
        orderId: order.id,
        amount: amountStr,
        provider: 'paymob',
        providerRef: paymobOrderId,
        idempotencyKey: paymobOrderId, // Use paymob order ID as idempotency key for now
        status: 'initiated'
      });

      return { paymentKey: payKey, orderId: order.id };
    });

    return Response.json({ paymentKey, orderId });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return Response.json({ error: error.message || "Checkout processing failed" }, { status: 500 });
  }
}
