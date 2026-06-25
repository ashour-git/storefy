import { withTenant } from '../../../../../db';
import * as schema from '../../../../../db/schema';
import { and, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { ThemeRenderer } from '../../../../../components/storefront/ThemeRenderer';
import type { ThemeTokens } from '../../../../../components/storefront/ThemeRenderer';
import { CartProvider } from '../../../../../components/storefront/CartProvider';
import { CartDrawer } from '../../../../../components/storefront/CartDrawer';
import { StorefrontAnalytics } from '../../../../../components/storefront/StorefrontAnalytics';
import { ProductJsonLd, BreadcrumbJsonLd } from '../../../../../components/storefront/JsonLd';
import { getStorefrontCopy } from '../../../../../lib/storefront/copy';
import { getStoreUrl } from '../../../../../lib/store-utils';
import { resolveTenantBySlugOrDomain } from '../../../../../lib/tenancy';
import { getTemplateForVertical } from '../../../../../lib/storefront/templates';
import type { Locale } from '../../../../../lib/i18n';
import type { Metadata } from 'next';

interface CategoryPageProps {
  params: Promise<{ slug: string; categorySlug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug, categorySlug } = await params;
  let tenant;
  try {
    tenant = await resolveTenantBySlugOrDomain(slug);
  } catch (e) {
    console.error('[store/category] generateMetadata tenant lookup failed:', e);
    return { title: 'Category not found' };
  }
  if (!tenant) return { title: 'Category not found' };

  const category = await withTenant(tenant.id, (tx) =>
    tx.query.categories.findFirst({
      where: and(eq(schema.categories.slug, categorySlug), eq(schema.categories.tenantId, tenant.id)),
    })
  ).catch(() => null);

  if (!category) return { title: 'Category not found' };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://storefy.com';
  const storeUrl = getStoreUrl(tenant.slug, baseUrl, tenant.customDomain);

  return {
    title: `${category.name} - ${tenant.name}`,
    description: category.description || `Shop ${category.name} at ${tenant.name}.`,
    openGraph: {
      title: `${category.name} - ${tenant.name}`,
      description: category.description || `Shop ${category.name} at ${tenant.name}.`,
      type: 'website',
      images: category.image ? [{ url: category.image }] : [],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug, categorySlug } = await params;
  let tenant;
  try {
    tenant = await resolveTenantBySlugOrDomain(slug);
  } catch (e) {
    console.error('[store/category] Tenant lookup failed:', e);
    notFound();
  }
  if (!tenant) notFound();

  const locale: Locale = tenant.defaultLocale === 'ar' ? 'ar' : 'en';
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const copy = getStorefrontCopy(locale);
  const fallbackTemplate = getTemplateForVertical(tenant.category);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://storefy.com';
  const storeUrl = getStoreUrl(tenant.slug, baseUrl, tenant.customDomain);

  let themeRecord = null;
  let category = null;
  let products: any[] = [];
  try {
    const data = await withTenant(tenant.id, async (tx) => {
      const theme = await tx.query.themes.findFirst({ where: eq(schema.themes.tenantId, tenant.id) });
      const cat = await tx.query.categories.findFirst({
        where: and(eq(schema.categories.slug, categorySlug), eq(schema.categories.tenantId, tenant.id)),
      });
      const prods = cat
        ? await tx.select().from(schema.products).where(
            and(eq(schema.products.categoryId, cat.id), eq(schema.products.status, 'active'))
          )
        : [];
      return { themeRecord: theme, category: cat, products: prods };
    });
    themeRecord = data.themeRecord;
    category = data.category;
    products = data.products;
  } catch (e) {
    console.error('[store/category] Failed to fetch category data:', e);
    notFound();
  }

  if (!category) notFound();

  const tokens = (themeRecord?.tokens || fallbackTemplate.tokens) as ThemeTokens;

  return (
    <CartProvider>
      <ThemeRenderer tokens={tokens}>
        <div className="storefront-page" dir={dir} lang={locale}>
          <ProductJsonLd
            name={category.name}
            description={category.description || `${category.name} collection at ${tenant.name}`}
            image={category.image || undefined}
            price={0}
            currency={tenant.defaultCurrency}
            storeName={tenant.name}
            storeUrl={storeUrl}
            productUrl={`${storeUrl}/category/${categorySlug}`}
          />
          <BreadcrumbJsonLd
            items={[
              { name: tenant.name, url: storeUrl },
              { name: category.name, url: `${storeUrl}/category/${categorySlug}` },
            ]}
          />

          <header className="storefront-header">
            <div className="store-shell storefront-nav">
              <a href={`/store/${tenant.slug}`} className="storefront-logo">{tenant.name}</a>
              <nav className="storefront-nav-links">
                <a href={`/store/${tenant.slug}/search`}>{locale === 'ar' ? 'المنتجات' : 'Products'}</a>
                <a href={`/store/${tenant.slug}/tracking`}>{locale === 'ar' ? 'تتبع الطلب' : 'Track Order'}</a>
                <a href={`/store/${tenant.slug}/policies/shipping`}>{locale === 'ar' ? 'الشحن' : 'Shipping'}</a>
                <a href={`/store/${tenant.slug}/policies/contact`}>{locale === 'ar' ? 'تواصل' : 'Contact'}</a>
              </nav>
            </div>
          </header>

          <main className="store-section">
            <div className="store-shell">
              <div style={{ marginBottom: 32 }}>
                <p className="store-eyebrow">{locale === 'ar' ? 'المجموعة' : 'Collection'}</p>
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>{category.name}</h1>
                {category.description && <p style={{ color: 'var(--store-muted)', marginTop: 8 }}>{category.description}</p>}
              </div>

              {products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--store-muted)' }}>
                  <p>{locale === 'ar' ? 'لا توجد منتجات في هذا المجموعة بعد.' : 'No products in this collection yet.'}</p>
                </div>
              ) : (
                <div className="store-product-grid">
                  {products.map((product) => {
                    const images = product.images as string[] | undefined;
                    return (
                      <a key={product.id} href={`/store/${tenant.slug}/product/${product.id}`} className="store-product-card">
                        <div className="store-product-card-media">
                          {images?.[0] ? (
                            <img src={images[0]} alt={product.name} />
                          ) : (
                            <div className="store-product-card-placeholder">{product.name[0]}</div>
                          )}
                        </div>
                        <div className="store-product-card-body">
                          <h3>{product.name}</h3>
                          <strong>{Number(product.basePrice).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-EG')} {product.currency}</strong>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </main>

          <CartDrawer storeSlug={tenant.slug} locale={locale} />
        </div>
      </ThemeRenderer>
    </CartProvider>
  );
}
