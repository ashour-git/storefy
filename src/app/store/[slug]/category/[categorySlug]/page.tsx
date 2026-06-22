import { and, eq, or } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { withTenant } from '../../../../../db';
import * as schema from '../../../../../db/schema';
import { CartProvider } from '../../../../../components/storefront/CartProvider';
import { CartDrawer } from '../../../../../components/storefront/CartDrawer';
import { ProductGrid } from '../../../../../components/storefront/ProductGrid';
import { StorefrontAnalytics } from '../../../../../components/storefront/StorefrontAnalytics';
import { ThemeRenderer, type ThemeTokens } from '../../../../../components/storefront/ThemeRenderer';
import { getTemplateForVertical } from '../../../../../lib/storefront/templates';
import { resolveTenantBySlugOrDomain } from '../../../../../lib/tenancy';
import type { Locale } from '../../../../../lib/i18n';
import type { Metadata } from 'next';

type CategoryPageProps = { params: Promise<{ slug: string; categorySlug: string }> };

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug, categorySlug } = await params;
  const tenant = await resolveTenantBySlugOrDomain(slug);
  if (!tenant) return { title: 'Collection not found' };
  const category = await withTenant(tenant.id, (tx) => tx.query.categories.findFirst({ where: and(eq(schema.categories.tenantId, tenant.id), or(eq(schema.categories.slug, categorySlug), eq(schema.categories.id, categorySlug))) })).catch(() => null);
  return category ? { title: `${category.name} - ${tenant.name}`, description: category.description || `Shop ${category.name} at ${tenant.name}.` } : { title: 'Collection not found' };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug, categorySlug } = await params;
  const tenant = await resolveTenantBySlugOrDomain(slug);
  if (!tenant) notFound();
  const locale: Locale = tenant.defaultLocale === 'ar' ? 'ar' : 'en';
  const data = await withTenant(tenant.id, async (tx) => {
    const theme = await tx.query.themes.findFirst({ where: eq(schema.themes.tenantId, tenant.id) });
    const category = await tx.query.categories.findFirst({ where: and(eq(schema.categories.tenantId, tenant.id), or(eq(schema.categories.slug, categorySlug), eq(schema.categories.id, categorySlug))) });
    if (!category) return { theme, category: null, products: [] };
    const products = await tx.select().from(schema.products).where(and(eq(schema.products.status, 'active'), eq(schema.products.categoryId, category.id))).limit(48);
    return { theme, category, products };
  });
  if (!data.category) notFound();
  const tokens = (data.theme?.tokens || getTemplateForVertical(tenant.category).tokens) as ThemeTokens;
  return (
    <CartProvider>
      <ThemeRenderer tokens={tokens}>
        <div className="storefront-page" dir={locale === 'ar' ? 'rtl' : 'ltr'} lang={locale}>
          <header className="storefront-header"><div className="store-shell storefront-nav"><a href={`/store/${tenant.slug}`} className="storefront-logo">{tenant.name}</a><a href={`/store/${tenant.slug}/search`}>{locale === 'ar' ? 'كل المنتجات' : 'All products'}</a></div></header>
          <main className="store-section"><div className="store-shell"><p className="store-eyebrow">{locale === 'ar' ? 'مجموعة' : 'Collection'}</p><h1>{data.category.name}</h1><p className="store-category-description">{data.category.description || (locale === 'ar' ? 'منتجات مختارة من المتجر.' : 'Curated products from this store.')}</p><ProductGrid products={data.products} storeName={tenant.name} storeSlug={tenant.slug} locale={locale} /></div></main>
          <CartDrawer storeSlug={tenant.slug} locale={locale} />
          <StorefrontAnalytics storeSlug={tenant.slug} eventType="category_view" categoryId={data.category.id} />
        </div>
      </ThemeRenderer>
    </CartProvider>
  );
}
