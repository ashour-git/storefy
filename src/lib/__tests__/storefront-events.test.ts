import { describe, expect, it } from 'vitest';
import { sanitizeStorefrontEvent, type StorefrontEventType } from '../storefront-events';

describe('sanitizeStorefrontEvent', () => {
  it('accepts valid event types', () => {
    const types: StorefrontEventType[] = ['store_view', 'product_view', 'category_view', 'cart_add', 'checkout_start'];
    for (const eventType of types) {
      const event = sanitizeStorefrontEvent({ eventType, sessionId: 'abc' });
      expect(event.eventType).toBe(eventType);
    }
  });

  it('throws on invalid event type', () => {
    expect(() => sanitizeStorefrontEvent({ eventType: 'unknown', sessionId: 'abc' })).toThrow('Invalid event type');
  });

  it('throws on missing session id', () => {
    expect(() => sanitizeStorefrontEvent({ eventType: 'store_view' })).toThrow('Session id is required');
  });

  it('trims and caps session id to 120 chars', () => {
    const long = 'x'.repeat(150);
    const event = sanitizeStorefrontEvent({ eventType: 'store_view', sessionId: long });
    expect(event.sessionId.length).toBe(120);
  });

  it('trims and caps path to 500 chars', () => {
    const long = '/'.repeat(600);
    const event = sanitizeStorefrontEvent({ eventType: 'store_view', sessionId: 'abc', path: long });
    expect(event.path!.length).toBe(500);
  });

  it('normalizes empty strings to null for productId/categoryId', () => {
    const event = sanitizeStorefrontEvent({ eventType: 'store_view', sessionId: 'abc', productId: '', categoryId: '' });
    expect(event.productId).toBeNull();
    expect(event.categoryId).toBeNull();
  });

  it('defaults metadata to empty object', () => {
    const event = sanitizeStorefrontEvent({ eventType: 'store_view', sessionId: 'abc' });
    expect(event.metadata).toEqual({});
  });
});
