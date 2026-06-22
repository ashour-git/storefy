import { createCheckout } from '../../../lib/checkout';
import { getErrorMessage } from '../../../lib/errors';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { storeSlug, items, customerDetails, paymentMethod, idempotencyKey, discountCode } = body;

    if (typeof storeSlug !== 'string' || typeof idempotencyKey !== 'string' || !Array.isArray(items)) {
      return Response.json({ error: 'Invalid checkout payload' }, { status: 400 });
    }

    if (!storeSlug || !items || !items.length || !customerDetails || !idempotencyKey) {
      return Response.json({ error: 'Missing required checkout data' }, { status: 400 });
    }

    const checkout = await createCheckout({
      storeSlug,
      items,
      customerDetails,
      paymentMethod: paymentMethod === 'cod' ? 'cod' : 'online',
      idempotencyKey,
      discountCode,
    });

    return Response.json(checkout);
  } catch (error: unknown) {
    console.error("Checkout Error:", error);
    return Response.json({ error: getErrorMessage(error) || "Checkout processing failed" }, { status: 500 });
  }
}
