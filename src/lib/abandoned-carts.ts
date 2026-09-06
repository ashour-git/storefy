import { db } from '../db';
import * as schema from '../db/schema';
import { and, eq } from 'drizzle-orm';

/**
 * Marks open abandoned carts as recovered once their buyer completes an order.
 * Only touches rows still in 'abandoned' status — live 'active' carts are left alone.
 * Returns the number of rows flipped.
 */
export async function markAbandonedCartsRecovered(
  tx: typeof db,
  tenantId: string,
  email: string,
): Promise<number> {
  if (!email) return 0;
  const updated = await tx
    .update(schema.carts)
    .set({ status: 'recovered', updatedAt: new Date() })
    .where(
      and(
        eq(schema.carts.tenantId, tenantId),
        eq(schema.carts.customerEmail, email),
        eq(schema.carts.status, 'abandoned'),
      ),
    )
    .returning({ id: schema.carts.id });
  return updated.length;
}
