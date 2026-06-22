import { createCheckout } from '../../../lib/checkout';
import { getErrorMessage } from '../../../lib/errors';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { storeSlug, items, customerDetails, paymentMethod, idempotencyKey } = body;

    if (!storeSlug || !items || !items.length || !customerDetails || !idempotencyKey) {
      return Response.json({ error: 'Missing required checkout data' }, { status: 400 });
    }

    const checkout = await createCheckout({
      storeSlug,
      items,
      customerDetails,
      paymentMethod: paymentMethod === 'cod' ? 'cod' : 'online',
      idempotencyKey,
    });

    return Response.json(checkout);
  } catch (error: unknown) {
    console.error("Checkout Error:", error);
    return Response.json({ error: getErrorMessage(error) || "Checkout processing failed" }, { status: 500 });
  }
}
