import { describe, expect, it } from 'vitest';
import { buildCartSyncBody } from '../cart-sync';

const ITEM = {
  productId: 'p1',
  variantId: 'v1',
  name: 'Oud Oil',
  price: 450,
  quantity: 2,
  currency: 'EGP',
  image: 'https://cdn.test/oud.jpg',
};

describe('buildCartSyncBody', () => {
  it('includes customerEmail when the buyer gave one', () => {
    const body = buildCartSyncBody([ITEM], {
      storeSlug: 'attar-house',
      sessionId: 'sess-1',
      customerEmail: 'buyer@example.com',
    });
    expect(body.customerEmail).toBe('buyer@example.com');
    expect(body.items).toHaveLength(1);
    expect(body.items[0].quantity).toBe(2);
  });

  it('omits customerEmail when the buyer gave none', () => {
    const body = buildCartSyncBody([ITEM], { storeSlug: 'attar-house', sessionId: 'sess-1' });
    expect(body.customerEmail).toBeUndefined();
  });

  it('drops invalid items and caps at 50', () => {
    const bad = { ...ITEM, productId: '', quantity: 0 };
    const many = Array.from({ length: 60 }, (_, i) => ({ ...ITEM, productId: `p${i}` }));
    expect(buildCartSyncBody([bad], { storeSlug: 's', sessionId: 'x' }).items).toHaveLength(0);
    expect(buildCartSyncBody(many, { storeSlug: 's', sessionId: 'x' }).items).toHaveLength(50);
  });
});
