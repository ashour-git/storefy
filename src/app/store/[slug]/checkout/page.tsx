import { db } from '../../../../db';
import * as schema from '../../../../db/schema';
import { eq, or } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { ThemeRenderer } from '../../../../components/storefront/ThemeRenderer';
import type { ThemeTokens } from '../../../../components/storefront/ThemeRenderer';
import { CartProvider } from '../../../../components/storefront/CartProvider';
import { CheckoutForm } from '../../../../components/storefront/CheckoutForm';
import type { Metadata } from 'next';
import { getStorefrontCopy } from '../../../../lib/storefront/copy';

interface CheckoutPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CheckoutPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tenant = await db.query.tenants.findFirst({
    where: or(
      eq(schema.tenants.slug, slug),
      eq(schema.tenants.customDomain, slug)
    ),
  });

  if (!tenant) return { title: 'Checkout' };
  return {
    title: `Checkout — ${tenant.name}`,
    description: `Complete your secure checkout for ${tenant.name}.`,
  };
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { slug } = await params;

  const tenant = await db.query.tenants.findFirst({
    where: or(
      eq(schema.tenants.slug, slug),
      eq(schema.tenants.customDomain, slug)
    ),
  });

  if (!tenant) {
    notFound();
  }

  // Fetch the theme
  const themeRecord = await db.query.themes.findFirst({
    where: eq(schema.themes.tenantId, tenant.id),
  });
  const tokens = (themeRecord?.tokens || null) as ThemeTokens | null;
  const copy = getStorefrontCopy(tenant.defaultLocale);
  const dir = tenant.defaultLocale === 'ar' ? 'rtl' : 'ltr';

  return (
    <CartProvider>
      <ThemeRenderer tokens={tokens}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" dir={dir} lang={tenant.defaultLocale}>
          <header className="mb-12 border-b border-black/5 pb-6">
            <a 
              href={`/store/${tenant.slug}`}
              className="text-sm font-semibold text-[var(--store-primary)] hover:underline mb-4 inline-block"
            >
              {dir === 'rtl' ? '→' : '←'} {copy.backToShop}
            </a>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              {copy.checkoutTitle}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{copy.checkoutSubtitle}</p>
          </header>

          <main>
            <CheckoutForm tenant={{ name: tenant.name, slug: tenant.slug, defaultLocale: tenant.defaultLocale }} />
          </main>
        </div>
      </ThemeRenderer>
    </CartProvider>
  );
}
