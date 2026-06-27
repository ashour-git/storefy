import { eq, or, and, ne } from 'drizzle-orm';
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

export async function getUserStoreById(userId: string, storeId: string): Promise<TenantRecord | null> {
  const store = await db.query.tenants.findFirst({
    where: and(eq(schema.tenants.id, storeId), eq(schema.tenants.ownerId, userId)),
  });
  return store ?? null;
}

export async function getFirstUserStore(userId: string): Promise<TenantRecord | null> {
  const stores = await db.select().from(schema.tenants).where(
    and(eq(schema.tenants.ownerId, userId), ne(schema.tenants.status, 'deleted'))
  );
  return stores[0] ?? null;
}
