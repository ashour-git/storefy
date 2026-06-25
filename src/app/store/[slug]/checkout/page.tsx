import { withTenant } from '../../../../db';
import * as schema from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { ThemeRenderer } from '../../../../components/storefront/ThemeRenderer';
import type { ThemeTokens } from '../../../../components/storefront/ThemeRenderer';
import { CartProvider } from '../../../../components/storefront/CartProvider';
import { CheckoutForm } from '../../../../components/storefront/CheckoutForm';
import { StorefrontAnalytics } from '../../../../components/storefront/StorefrontAnalytics';
import type { Metadata } from 'next';
import { getStorefrontCopy } from '../../../../lib/storefront/copy';
import { resolveTenantBySlugOrDomain } from '../../../../lib/tenancy';
import { getTemplateForVertical } from '../../../../lib/storefront/templates';

interface CheckoutPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CheckoutPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tenant = await resolveTenantBySlugOrDomain(slug);

  if (!tenant) return { title: 'Checkout' };
  return {
    title: `Checkout - ${tenant.name}`,
    description: `Complete your secure checkout for ${tenant.name}.`,
  };
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { slug } = await params;
  let tenant;
  try {
    tenant = await resolveTenantBySlugOrDomain(slug);
  } catch (e) {
    console.error('[checkout/page] Tenant lookup failed:', e);
    notFound();
  }

  if (!tenant) {
    notFound();
  }

  let themeRecord = null;
  try {
    themeRecord = await withTenant(tenant.id, async (tx) => tx.query.themes.findFirst({
      where: eq(schema.themes.tenantId, tenant.id),
    }));
  } catch (e) {
    console.error('[checkout/page] Theme query failed:', e);
  }
  const tokens = (themeRecord?.tokens || getTemplateForVertical(tenant.category).tokens) as ThemeTokens;
  const copy = getStorefrontCopy(tenant.defaultLocale);
  const dir = tenant.defaultLocale === 'ar' ? 'rtl' : 'ltr';

  return (
    <CartProvider>
      <ThemeRenderer tokens={tokens}>
        <div className="store-checkout-page store-shell" dir={dir} lang={tenant.defaultLocale}>
          <header className="store-checkout-header">
            <a 
              href={`/store/${tenant.slug}`}
              className="store-checkout-back"
            >
              {dir === 'rtl' ? '->' : '<-'} {copy.backToShop}
            </a>
            <h1>
              {copy.checkoutTitle}
            </h1>
            <p>{copy.checkoutSubtitle}</p>
          </header>

          <main>
            <CheckoutForm tenant={{ name: tenant.name, slug: tenant.slug, defaultLocale: tenant.defaultLocale }} />
          </main>
          <StorefrontAnalytics storeSlug={tenant.slug} eventType="checkout_start" />
        </div>
      </ThemeRenderer>
    </CartProvider>
  );
}
