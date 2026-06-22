import { eq, or } from 'drizzle-orm';
import { db } from '../db';
import * as schema from '../db/schema';

export type TenantRecord = typeof schema.tenants.$inferSelect;

export async function resolveTenantBySlugOrDomain(slugOrDomain: string): Promise<TenantRecord | null> {
  const safeValue = slugOrDomain.trim().toLowerCase();
  if (!safeValue) return null;

  const tenant = await db.query.tenants.findFirst({
    where: or(
      eq(schema.tenants.slug, safeValue),
      eq(schema.tenants.customDomain, safeValue),
    ),
  });
  return tenant ?? null;
}

export async function getFirstUserStore(userId: string): Promise<TenantRecord | null> {
  const stores = await db.select().from(schema.tenants).where(eq(schema.tenants.ownerId, userId));
  return stores[0] ?? null;
}
