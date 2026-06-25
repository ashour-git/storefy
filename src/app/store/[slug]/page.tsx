import { withTenant } from '../../../db';
import * as schema from '../../../db/schema';
import { eq, and } from 'drizzle-orm';
import { Suspense } from "react";
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ThemeRenderer } from '../../../components/storefront/ThemeRenderer';
import type { ThemeTokens } from '../../../components/storefront/ThemeRenderer';
import { CartProvider } from '../../../components/storefront/CartProvider';
import { CartDrawer } from '../../../components/storefront/CartDrawer';
import { Skeleton } from "../../../components/ui/Skeleton";
import { StorefrontBlocks } from '../../../components/storefront/StorefrontBlocks';
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
          {/* Announcement Bar */}
          {(tokens as any)?.announcementText ? (
            <div className="store-announcement-bar" style={{
              backgroundColor: `var(--store-announcement-bg)`,
              color: `var(--store-announcement-text)`,
              textAlign: 'center',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 500
            }}>
              <div className="store-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span>{(tokens as any).announcementText}</span>
                {(tokens as any)?.announcementDismissible !== false && (tokens as any)?.announcementDismissible !== 'false' && (
                  <button onClick={(e) => (e.currentTarget.parentElement!.parentElement!.style.display = 'none')}
                    style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.7, fontSize: '1.1rem' }}>
                    &times;
                  </button>
                )}
              </div>
            </div>
          ) : null}

          <header className="storefront-header" style={(tokens as any)?.stickyHeader === true || (tokens as any)?.stickyHeader === 'true' ? { position: 'sticky', top: 0, zIndex: 50 } : {}}>
            <div className="store-shell storefront-nav">
              <a href={`/store/${tenant.slug}`} className="storefront-logo" style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit'
              }}>
                {(tokens as any)?.logoUrl ? (
                  <img src={(tokens as any).logoUrl} alt={tenant.name}
                    style={{ height: (tokens as any).logoWidth || '40px', width: 'auto', maxWidth: '160px', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>{tenant.name}</span>
                )}
              </a>
              <nav className="storefront-nav-links" style={(tokens as any)?.headerLayout === 'center' ? { justifyContent: 'center' } : {}}>
                <a href={`/store/${tenant.slug}/search`}>{locale === 'ar' ? 'المنتجات' : 'Products'}</a>
                {categories.slice(0, 3).map((category) => (
                  <a key={category.id} href={`/store/${tenant.slug}/category/${category.slug || category.id}`}>{category.name}</a>
                ))}
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

          {/* Theme-driven footer */}
          <footer className="storefront-footer" style={{
            backgroundColor: 'var(--store-footer-bg)',
            color: 'var(--store-footer-text)'
          }}>
            <div className="store-shell" style={{ padding: '3rem 1rem' }}>
              <div className="storefront-footer-inner" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '2rem',
                maxWidth: 'var(--store-page-max-width)',
                margin: '0 auto'
              }}>
                {/* Brand column */}
                <div>
                  {(tokens as any)?.logoUrl ? (
                    <img src={(tokens as any).logoUrl} alt={tenant.name}
                      style={{ height: '32px', width: 'auto', marginBottom: '1rem' }} />
                  ) : (
                    <h3 style={{ margin: '0 0 0.75rem' }}>{tenant.name}</h3>
                  )}
                  <p style={{ fontSize: '0.875rem', opacity: 0.8, lineHeight: 1.6 }}>{tenant.description || ''}</p>
                </div>

                {/* Quick links */}
                <div>
                  <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {locale === 'ar' ? 'روابط سريعة' : 'Quick Links'}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <a href={`/store/${tenant.slug}/search`} style={{ color: 'inherit', opacity: 0.8, textDecoration: 'none', fontSize: '0.875rem' }}>
                      {locale === 'ar' ? 'المنتجات' : 'Products'}
                    </a>
                    <a href={`/store/${tenant.slug}/tracking`} style={{ color: 'inherit', opacity: 0.8, textDecoration: 'none', fontSize: '0.875rem' }}>
                      {locale === 'ar' ? 'تتبع الطلب' : 'Track Order'}
                    </a>
                    <a href={`/store/${tenant.slug}/policies/shipping`} style={{ color: 'inherit', opacity: 0.8, textDecoration: 'none', fontSize: '0.875rem' }}>
                      {locale === 'ar' ? 'الشحن' : 'Shipping'}
                    </a>
                    <a href={`/store/${tenant.slug}/policies/returns`} style={{ color: 'inherit', opacity: 0.8, textDecoration: 'none', fontSize: '0.875rem' }}>
                      {locale === 'ar' ? 'الاسترجاع' : 'Returns'}
                    </a>
                    <a href={`/store/${tenant.slug}/policies/privacy`} style={{ color: 'inherit', opacity: 0.8, textDecoration: 'none', fontSize: '0.875rem' }}>
                      {locale === 'ar' ? 'الخصوصية' : 'Privacy'}
                    </a>
                    <a href={`/store/${tenant.slug}/policies/contact`} style={{ color: 'inherit', opacity: 0.8, textDecoration: 'none', fontSize: '0.875rem' }}>
                      {locale === 'ar' ? 'اتصل بنا' : 'Contact'}
                    </a>
                  </div>
                </div>

                {/* Social links */}
                <div>
                  <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {locale === 'ar' ? 'تواصل معنا' : 'Follow Us'}
                  </h4>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {(tokens as any)?.facebookUrl ? <a href={(tokens as any).facebookUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', opacity: 0.8, textDecoration: 'none' }}>Facebook</a> : null}
                    {(tokens as any)?.instagramUrl ? <a href={(tokens as any).instagramUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', opacity: 0.8, textDecoration: 'none' }}>Instagram</a> : null}
                    {(tokens as any)?.twitterUrl ? <a href={(tokens as any).twitterUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', opacity: 0.8, textDecoration: 'none' }}>X</a> : null}
                    {(tokens as any)?.tiktokUrl ? <a href={(tokens as any).tiktokUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', opacity: 0.8, textDecoration: 'none' }}>TikTok</a> : null}
                    {(tokens as any)?.whatsappNumber ? <a href={`https://wa.me/${(tokens as any).whatsappNumber}`} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', opacity: 0.8, textDecoration: 'none' }}>WhatsApp</a> : null}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'center', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '2rem', fontSize: '0.8rem', opacity: 0.6 }}>
                &copy; {new Date().getFullYear()} {tenant.name}. {locale === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
                {' | '}
                {locale === 'ar' ? 'مدعوم من Storefy' : 'Powered by Storefy'}
              </div>
            </div>
          </footer>

          <Suspense fallback={<Skeleton style={{ position: "fixed", bottom: 24, left: 24, width: 48, height: 48, borderRadius: "50%", zIndex: 999 }} />}>
            <CartDrawer storeSlug={tenant.slug} locale={locale} />
          </Suspense>
          <StorefrontAnalytics storeSlug={tenant.slug} eventType="store_view" />
        </div>
      </ThemeRenderer>
    </CartProvider>
  );
}
