import { withTenant } from '../../../db';
import * as schema from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { resolveTenantBySlugOrDomain } from '../../../lib/tenancy';
import { StorefrontAIAgent } from '../../../components/storefront/StorefrontAIAgent';
import type { Locale } from '../../../lib/i18n';

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await resolveTenantBySlugOrDomain(slug);
  if (!tenant) return <>{children}</>;

  const locale: Locale = tenant.defaultLocale === 'ar' ? 'ar' : 'en';

  let products: any[] = [];
  try {
    products = await withTenant(tenant.id, async (tx) => {
      return tx.select({
        id: schema.products.id,
        name: schema.products.name,
        basePrice: schema.products.basePrice,
        currency: schema.products.currency,
        categoryId: schema.products.categoryId,
      }).from(schema.products).where(eq(schema.products.status, 'active')).limit(50);
    });
  } catch {}

  return (
    <>
      {children}
      <StorefrontAIAgent
        storeSlug={tenant.slug}
        storeName={tenant.name}
        locale={locale}
        products={products}
      />
    </>
  );
}
