import { createCheckout, IdempotencyConflictError, IdempotencyInFlightError } from '../../../lib/checkout';
import { fail, getIdempotencyKey, ok, toPublicError } from '../../../lib/api/contract';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { storeSlug, items, customerDetails, paymentMethod, idempotencyKey: bodyKey, discountCode } = body;
    const idempotencyKey = getIdempotencyKey(request, bodyKey);

    if (typeof storeSlug !== 'string' || !Array.isArray(items)) {
      return fail('VALIDATION_ERROR', 'Invalid checkout payload', 400);
    }

    if (!storeSlug || !items || !items.length || !customerDetails) {
      return fail('VALIDATION_ERROR', 'Missing required checkout data', 400);
    }

    if (!idempotencyKey) {
      return fail('VALIDATION_ERROR', 'Idempotency-Key header (or idempotencyKey) is required for safe retries', 422);
    }

    const validMethods = ['card', 'wallet', 'fawry', 'instapay', 'cod'];
    const resolvedMethod = validMethods.includes(paymentMethod) ? paymentMethod : 'card';

    const checkout = await createCheckout({
      storeSlug,
      items,
      customerDetails,
      paymentMethod: resolvedMethod as any,
      idempotencyKey,
      discountCode,
    });

    return ok(checkout, 201);
  } catch (error: unknown) {
    if (error instanceof IdempotencyConflictError) {
      return fail('IDEMPOTENCY_CONFLICT', error.message, 422);
    }
    if (error instanceof IdempotencyInFlightError) {
      return fail('IN_PROGRESS', error.message, 409);
    }
    console.error("Checkout Error:", error instanceof Error ? error.message : error);
    if (error instanceof Error && /not found|unavailable|empty|stock|required|invalid/i.test(error.message)) {
      return fail('VALIDATION_ERROR', error.message.slice(0, 200), 400);
    }
    return fail('INTERNAL_ERROR', toPublicError(error) === 'Internal error' ? 'Checkout processing failed' : toPublicError(error), 500);
  }
}
