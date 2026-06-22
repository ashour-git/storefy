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
import { getTemplateForVertical } from '../../../lib/storefront/templates';
import type { Locale } from '../../../lib/i18n';
import type { StorefrontBlock } from '../../../lib/storefront/types';
import { getStorefrontCopy } from '../../../lib/storefront/copy';
import { resolveTenantBySlugOrDomain } from '../../../lib/tenancy';

interface StorefrontPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: StorefrontPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tenant = await resolveTenantBySlugOrDomain(slug);

  if (!tenant) {
    return { title: 'Store Not Found' };
  }

  const desc = tenant.description || `Shop ${tenant.category || 'products'} at ${tenant.name}.`;

  return {
    title: `${tenant.name} - Online Store`,
    description: desc,
    openGraph: {
      title: tenant.name,
      description: desc,
      type: 'website',
      images: tenant.logo ? [{ url: tenant.logo }] : [],
    },
  };
}

export default async function StorefrontPage({ params }: StorefrontPageProps) {
  const { slug } = await params;
  const tenant = await resolveTenantBySlugOrDomain(slug);

  if (!tenant) {
    notFound();
  }

  const fallbackTemplate = getTemplateForVertical(tenant.category);
  const locale: Locale = tenant.defaultLocale === 'ar' ? 'ar' : 'en';
  const copy = getStorefrontCopy(locale);
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const { themeRecord, pageRecord, tenantProducts } = await withTenant(tenant.id, async (tx) => {
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
    return { themeRecord: theme, pageRecord: page, tenantProducts: prods };
  });

  const tokens = (themeRecord?.tokens || fallbackTemplate.tokens) as ThemeTokens;
  const blocks = Array.isArray(pageRecord?.blocks) && pageRecord.blocks.length > 0
    ? pageRecord.blocks as StorefrontBlock[]
    : fallbackTemplate.blocks;

  return (
    <CartProvider>
      <ThemeRenderer tokens={tokens}>
        <div className="min-h-screen flex flex-col bg-[var(--store-bg)] text-[var(--store-text)]" dir={dir} lang={locale}>
          <header className="sticky top-0 z-30 w-full border-b border-black/5 bg-[var(--store-bg)]/88 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
              <a href={`/store/${tenant.slug}`} className="text-2xl font-black tracking-tight hover:opacity-80 transition-opacity" style={{ fontFamily: 'var(--store-heading-font)' }}>
                {tenant.name}
              </a>
              <div className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-[var(--store-primary)]/10 text-[var(--store-primary)] font-semibold text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 me-1.5 animate-pulse" />
                {copy.acceptingOrders}
              </div>
            </div>
          </header>

          <main className="flex-1">
            <StorefrontBlocks blocks={blocks} products={tenantProducts} storeName={tenant.name} locale={locale} />
          </main>

          <footer className="border-t border-black/5 py-12" style={{ background: 'var(--store-surface)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <span className="text-lg font-black tracking-tight" style={{ fontFamily: 'var(--store-heading-font)' }}>{tenant.name}</span>
              <p className="text-xs" style={{ color: 'var(--store-muted)' }}>
                &copy; {new Date().getFullYear()} {tenant.name}. Powered by Storefy.
              </p>
            </div>
          </footer>

          <CartDrawer storeSlug={tenant.slug} locale={locale} />
          <StorefrontAIAgent storeSlug={tenant.slug} storeName={tenant.name} locale={locale} />
        </div>
      </ThemeRenderer>
    </CartProvider>
  );
}
