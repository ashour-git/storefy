import { withTenant } from '../../../../db';
import * as schema from '../../../../db/schema';
import { and, eq, ilike, or } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { ThemeRenderer, type ThemeTokens } from '../../../../components/storefront/ThemeRenderer';
import { CartProvider } from '../../../../components/storefront/CartProvider';
import { CartDrawer } from '../../../../components/storefront/CartDrawer';
import { ProductGrid } from '../../../../components/storefront/ProductGrid';
import { resolveTenantBySlugOrDomain } from '../../../../lib/tenancy';
import { getTemplateForVertical } from '../../../../lib/storefront/templates';
import type { Locale } from '../../../../lib/i18n';

interface SearchPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { slug } = await params;
  const { q = '' } = await searchParams;
  const tenant = await resolveTenantBySlugOrDomain(slug);
  if (!tenant) notFound();

  const locale: Locale = tenant.defaultLocale === 'ar' ? 'ar' : 'en';
  const fallbackTemplate = getTemplateForVertical(tenant.category);
  const query = q.trim();

  const { themeRecord, products } = await withTenant(tenant.id, async (tx) => {
    const theme = await tx.query.themes.findFirst({ where: eq(schema.themes.tenantId, tenant.id) });
    const result = query
      ? await tx.select().from(schema.products).where(and(eq(schema.products.status, 'active'), or(ilike(schema.products.name, `%${query}%`), ilike(schema.products.description, `%${query}%`)))).limit(24)
      : await tx.select().from(schema.products).where(eq(schema.products.status, 'active')).limit(24);
    return { themeRecord: theme, products: result };
  });

  const tokens = (themeRecord?.tokens || fallbackTemplate.tokens) as ThemeTokens;

  return (
    <CartProvider>
      <ThemeRenderer tokens={tokens}>
        <div className="storefront-page" dir={locale === 'ar' ? 'rtl' : 'ltr'} lang={locale}>
          <header className="storefront-header">
            <div className="store-shell storefront-nav">
              <a href={`/store/${tenant.slug}`} className="storefront-logo">{tenant.name}</a>
            </div>
          </header>
          <main className="store-section">
            <div className="store-shell">
              <form className="store-search-form">
                <input name="q" defaultValue={query} placeholder={locale === 'ar' ? 'ابحث عن منتج...' : 'Search products...'} />
                <button type="submit">{locale === 'ar' ? 'بحث' : 'Search'}</button>
              </form>
              <div className="store-section-row">
                <div className="store-section-header compact">
                  <h2>{query ? (locale === 'ar' ? `نتائج البحث عن ${query}` : `Search results for ${query}`) : (locale === 'ar' ? 'كل المنتجات' : 'All products')}</h2>
                </div>
              </div>
              <ProductGrid products={products} storeName={tenant.name} storeSlug={tenant.slug} locale={locale} />
            </div>
          </main>
          <CartDrawer storeSlug={tenant.slug} locale={locale} />
        </div>
      </ThemeRenderer>
    </CartProvider>
  );
}
