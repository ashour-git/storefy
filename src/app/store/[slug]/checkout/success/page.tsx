import { withTenant } from '../../../../../db';
import * as schema from '../../../../../db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { ThemeRenderer } from '../../../../../components/storefront/ThemeRenderer';
import type { ThemeTokens } from '../../../../../components/storefront/ThemeRenderer';
import { CartProvider } from '../../../../../components/storefront/CartProvider';
import { resolveTenantBySlugOrDomain } from '../../../../../lib/tenancy';
import { getStorefrontCopy } from '../../../../../lib/storefront/copy';
import { getTemplateForVertical } from '../../../../../lib/storefront/templates';

interface SuccessPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ orderId?: string }>;
}

export default async function SuccessPage({ params, searchParams }: SuccessPageProps) {
  const { slug } = await params;
  const { orderId } = await searchParams;

  const tenant = await resolveTenantBySlugOrDomain(slug);

  if (!tenant) {
    notFound();
  }

  const themeRecord = await withTenant(tenant.id, async (tx) => tx.query.themes.findFirst({
    where: eq(schema.themes.tenantId, tenant.id),
  }));
  const tokens = (themeRecord?.tokens || getTemplateForVertical(tenant.category).tokens) as ThemeTokens;
  const locale = tenant.defaultLocale === 'ar' ? 'ar' : 'en';
  const copy = getStorefrontCopy(locale);
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <CartProvider>
      <ThemeRenderer tokens={tokens}>
        <div className="store-checkout-page store-shell" dir={dir} lang={locale}>
          <div className="store-success-card">
            <div className="store-success-icon">
              OK
            </div>
          
            <h1>{copy.orderReceived}</h1>
            <p>
              {copy.orderThanks} <strong>{tenant.name}</strong>.
            </p>

            {orderId && (
              <div className="store-success-ref">
                <span>{copy.orderRef}</span>
                <strong>{orderId}</strong>
              </div>
            )}

            <a
              href={`/store/${tenant.slug}`}
              className="store-cart-checkout"
            >
              {copy.continueShopping}
            </a>
          </div>
        </div>
      </ThemeRenderer>
    </CartProvider>
  );
}
