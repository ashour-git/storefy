export type StorefrontEventType = 'store_view' | 'product_view' | 'category_view' | 'cart_add' | 'checkout_start';

export function sanitizeStorefrontEvent(input: { eventType?: unknown; sessionId?: unknown; path?: unknown; productId?: unknown; categoryId?: unknown; metadata?: unknown }) {
  const validTypes: StorefrontEventType[] = ['store_view', 'product_view', 'category_view', 'cart_add', 'checkout_start'];
  const eventType = validTypes.includes(input.eventType as StorefrontEventType) ? input.eventType as StorefrontEventType : null;
  const sessionId = typeof input.sessionId === 'string' ? input.sessionId.trim().slice(0, 120) : '';
  if (!eventType) throw new Error('Invalid event type');
  if (!sessionId) throw new Error('Session id is required');
  return {
    eventType,
    sessionId,
    path: typeof input.path === 'string' ? input.path.trim().slice(0, 500) : null,
    productId: typeof input.productId === 'string' && input.productId ? input.productId : null,
    categoryId: typeof input.categoryId === 'string' && input.categoryId ? input.categoryId : null,
    metadata: input.metadata && typeof input.metadata === 'object' ? input.metadata : {},
  };
}
