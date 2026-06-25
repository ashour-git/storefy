import { Suspense } from "react";
import { withTenant } from '../../../db';
import * as schema from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { resolveTenantBySlugOrDomain } from '../../../lib/tenancy';
import { StorefrontAIAgent } from '../../../components/storefront/StorefrontAIAgent';
import { Skeleton } from "../../../components/ui/Skeleton";
import type { Locale } from '../../../lib/i18n';

async function AIAgentWrapper({ storeSlug, storeName, locale }: { storeSlug: string; storeName: string; locale: Locale }) {
  const tenant = await resolveTenantBySlugOrDomain(storeSlug);
  if (!tenant) return null;
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
    <StorefrontAIAgent
      storeSlug={storeSlug}
      storeName={storeName}
      locale={locale}
      products={products}
    />
  );
}

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

  return (
    <>
      {children}
      <Suspense fallback={<Skeleton style={{ position: "fixed", bottom: 24, right: 24, width: 56, height: 56, borderRadius: "50%", zIndex: 999 }} />}>
        <AIAgentWrapper storeSlug={tenant.slug} storeName={tenant.name} locale={locale} />
      </Suspense>
    </>
  );
}
