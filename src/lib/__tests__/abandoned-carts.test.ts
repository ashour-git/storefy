import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as dotenv from 'dotenv';
dotenv.config();

import { db, withTenant } from '../../db';
import * as schema from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { markAbandonedCartsRecovered } from '../abandoned-carts';

const describeIfDatabase = process.env.RUN_DB_TESTS === 'true' && process.env.DATABASE_URL ? describe : describe.skip;

describeIfDatabase('Abandoned cart recovery marking', () => {
  let userId: string;
  let tenantId: string;
  const email = `recovery-${Date.now()}@test.com`;

  beforeAll(async () => {
    const [user] = await db
      .insert(schema.platformUsers)
      .values({ email: `recovery-user-${Date.now()}@test.com`, name: 'Recovery User' })
      .returning();
    userId = user.id;
    const [tenant] = await db
      .insert(schema.tenants)
      .values({ slug: `recovery-${Date.now()}`, ownerId: userId, name: 'Recovery Tenant' })
      .returning();
    tenantId = tenant.id;
  }, 60000);

  afterAll(async () => {
    await db.delete(schema.carts).where(eq(schema.carts.tenantId, tenantId));
    await db.delete(schema.tenants).where(eq(schema.tenants.id, tenantId));
    await db.delete(schema.platformUsers).where(eq(schema.platformUsers.id, userId));
  });

  it('marks abandoned carts recovered without touching active ones', async () => {
    const tag = Date.now();
    await withTenant(tenantId, async (tx) => {
      await tx.insert(schema.carts).values({
        tenantId,
        sessionId: `sess-abandoned-${tag}`,
        customerEmail: email,
        items: [{ productId: 'p1', variantId: 'v1', name: 'Oud', price: 100, quantity: 1 }],
        status: 'abandoned',
      });
      await tx.insert(schema.carts).values({
        tenantId,
        sessionId: `sess-active-${tag}`,
        customerEmail: email,
        items: [{ productId: 'p1', variantId: 'v1', name: 'Oud', price: 100, quantity: 1 }],
        status: 'active',
      });
    });

    let marked = 0;
    await withTenant(tenantId, async (tx) => {
      marked = await markAbandonedCartsRecovered(tx, tenantId, email);
    });
    expect(marked).toBe(1);

    await withTenant(tenantId, async (tx) => {
      const rows = await tx.select().from(schema.carts).where(eq(schema.carts.tenantId, tenantId));
      const bySession = new Map(rows.map((r) => [r.sessionId, r.status]));
      expect(bySession.get(`sess-abandoned-${tag}`)).toBe('recovered');
      expect(bySession.get(`sess-active-${tag}`)).toBe('active');
    });
  });

  it('is a no-op without a matching contact', async () => {
    let marked = -1;
    await withTenant(tenantId, async (tx) => {
      marked = await markAbandonedCartsRecovered(tx, tenantId, 'nobody@test.com');
    });
    expect(marked).toBe(0);
  });
});
