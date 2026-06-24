import { withTenant } from '../../../db';
import * as schema from '../../../db/schema';
import { eq, and } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ThemeRenderer } from '../../../components/storefront/ThemeRenderer';
import type { ThemeTokens } from '../../../components/storefront/ThemeRenderer';
import { CartProvider } from '../../../components/storefront/CartProvider';
import { CartDrawer } from '../../../components/storefront/CartDrawer';
import { StorefrontBlocks } from '../../../components/storefront/StorefrontBlocks';
import { StorefrontAIAgent } from '../../../components/storefront/StorefrontAIAgent';
import { StorefrontAnalytics } from '../../../components/storefront/StorefrontAnalytics';
import { StoreJsonLd } from '../../../components/storefront/JsonLd';
import { getTemplateForVertical } from '../../../lib/storefront/templates';
import type { Locale } from '../../../lib/i18n';
import type { StorefrontBlock } from '../../../lib/storefront/types';
import { getStorefrontCopy } from '../../../lib/storefront/copy';
import { resolveTenantBySlugOrDomain } from '../../../lib/tenancy';
import { getStoreUrl } from '../../../lib/store-utils';

interface StorefrontPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: StorefrontPageProps): Promise<Metadata> {
  const { slug } = await params;
  let tenant;
  try {
    tenant = await resolveTenantBySlugOrDomain(slug);
  } catch (e) {
    console.error('[store/page] generateMetadata tenant lookup failed:', e);
    return { title: 'Store Not Found' };
  }

  if (!tenant) {
    return { title: 'Store Not Found' };
  }

  const desc = tenant.description || `Shop ${tenant.category || 'products'} at ${tenant.name}.`;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://storefy.com';
  const storeUrl = getStoreUrl(tenant.slug, baseUrl, tenant.customDomain);

  return {
    title: `${tenant.name} - Online Store`,
    description: desc,
    openGraph: {
      title: tenant.name,
      description: desc,
      type: 'website',
      images: tenant.logo ? [{ url: tenant.logo }] : [],
    },
    twitter: { card: 'summary_large_image', title: tenant.name, description: desc, images: tenant.logo ? [tenant.logo] : [] },
  };
}

export default async function StorefrontPage({ params }: StorefrontPageProps) {
  const { slug } = await params;
  let tenant;
  try {
    tenant = await resolveTenantBySlugOrDomain(slug);
  } catch (e) {
    console.error('[store/page] Tenant lookup failed:', e);
    notFound();
  }

  if (!tenant) {
    notFound();
  }

  const fallbackTemplate = getTemplateForVertical(tenant.category);
  const locale: Locale = tenant.defaultLocale === 'ar' ? 'ar' : 'en';
  const copy = getStorefrontCopy(locale);
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  let themeRecord = null;
  let pageRecord = null;
  let tenantProducts: any[] = [];
  let categories: any[] = [];
  try {
    const data = await withTenant(tenant.id, async (tx) => {
      const theme = await tx.query.themes.findFirst({
        where: eq(schema.themes.tenantId, tenant.id),
      });
      const page = await tx.query.pages.findFirst({
        where: and(
          eq(schema.pages.tenantId, tenant.id),
          eq(schema.pages.slug, 'index'),
        ),
      });
      const prods = await tx
        .select()
        .from(schema.products)
        .where(eq(schema.products.status, 'active'));
      const cats = await tx.select().from(schema.categories).where(eq(schema.categories.tenantId, tenant.id)).limit(12);
      return { themeRecord: theme, pageRecord: page, tenantProducts: prods, categories: cats };
    });
    themeRecord = data.themeRecord;
    pageRecord = data.pageRecord;
    tenantProducts = data.tenantProducts;
    categories = data.categories;
  } catch (e) {
    console.error('[store/page] Failed to fetch store data:', e);
  }

  const tokens = (themeRecord?.tokens || fallbackTemplate.tokens) as ThemeTokens;
  const blocks = Array.isArray(pageRecord?.blocks) && pageRecord.blocks.length > 0
    ? pageRecord.blocks as StorefrontBlock[]
    : fallbackTemplate.blocks;

  return (
    <CartProvider>
      <ThemeRenderer tokens={tokens}>
        <StoreJsonLd
          name={tenant.name}
          url={getStoreUrl(tenant.slug, process.env.NEXT_PUBLIC_APP_URL || 'https://storefy.com', tenant.customDomain)}
          description={tenant.description || undefined}
          logo={tenant.logo || undefined}
          currency={tenant.defaultCurrency}
        />
        <div className="storefront-page" dir={dir} lang={locale}>
          <header className="storefront-header">
            <div className="store-shell storefront-nav">
              <a href={`/store/${tenant.slug}`} className="storefront-logo">
                {tenant.name}
              </a>
              <nav className="storefront-nav-links">
                <a href={`/store/${tenant.slug}/search`}>{locale === 'ar' ? 'المنتجات' : 'Products'}</a>
                {categories.slice(0, 3).map((category) => <a key={category.id} href={`/store/${tenant.slug}/category/${category.slug || category.id}`}>{category.name}</a>)}
                <a href={`/store/${tenant.slug}/tracking`}>{locale === 'ar' ? 'تتبع الطلب' : 'Track Order'}</a>
                <a href={`/store/${tenant.slug}/policies/shipping`}>{locale === 'ar' ? 'الشحن' : 'Shipping'}</a>
                <a href={`/store/${tenant.slug}/policies/contact`}>{locale === 'ar' ? 'تواصل' : 'Contact'}</a>
              </nav>
              <div className="storefront-status-pill">
                <span />
                {copy.acceptingOrders}
              </div>
            </div>
          </header>

          <main className="flex-1">
            <StorefrontBlocks blocks={blocks} products={tenantProducts} storeName={tenant.name} storeSlug={tenant.slug} locale={locale} />
            {categories.length > 0 && (
              <section className="store-section">
                <div className="store-shell">
                  <div className="store-section-header compact"><h2>{locale === 'ar' ? 'تسوق حسب المجموعة' : 'Shop by collection'}</h2></div>
                  <div className="store-category-grid">
                    {categories.map((category) => <a className="store-category-card" key={category.id} href={`/store/${tenant.slug}/category/${category.slug || category.id}`}><strong>{category.name}</strong><span>{category.description || (locale === 'ar' ? 'اكتشف المنتجات' : 'Explore products')}</span></a>)}
                  </div>
                </div>
              </section>
            )}
          </main>

          <footer className="storefront-footer">
            <div className="store-shell storefront-footer-inner">
              <span>{tenant.name}</span>
              <div className="storefront-footer-links">
                <a href={`/store/${tenant.slug}/policies/shipping`}>{locale === 'ar' ? 'الشحن' : 'Shipping'}</a>
                <a href={`/store/${tenant.slug}/policies/returns`}>{locale === 'ar' ? 'الاسترجاع' : 'Returns'}</a>
                <a href={`/store/${tenant.slug}/policies/privacy`}>{locale === 'ar' ? 'الخصوصية' : 'Privacy'}</a>
              </div>
              <p>
                &copy; {new Date().getFullYear()} {tenant.name}. Powered by Storefy.
              </p>
            </div>
          </footer>

          <CartDrawer storeSlug={tenant.slug} locale={locale} />
          <StorefrontAIAgent storeSlug={tenant.slug} storeName={tenant.name} locale={locale} products={tenantProducts} />
          <StorefrontAnalytics storeSlug={tenant.slug} eventType="store_view" />
        </div>
      </ThemeRenderer>
    </CartProvider>
  );
}
