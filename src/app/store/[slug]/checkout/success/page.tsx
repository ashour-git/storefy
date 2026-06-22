import { withTenant } from '../../../../../db';
import * as schema from '../../../../../db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { ThemeRenderer } from '../../../../../components/storefront/ThemeRenderer';
import type { ThemeTokens } from '../../../../../components/storefront/ThemeRenderer';
import { CartProvider } from '../../../../../components/storefront/CartProvider';
import { resolveTenantBySlugOrDomain } from '../../../../../lib/tenancy';
import { getStorefrontCopy } from '../../../../../lib/storefront/copy';

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
  const tokens = (themeRecord?.tokens || null) as ThemeTokens | null;
  const locale = tenant.defaultLocale === 'ar' ? 'ar' : 'en';
  const copy = getStorefrontCopy(locale);
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <CartProvider>
      <ThemeRenderer tokens={tokens}>
        <div className="max-w-xl mx-auto px-6 py-24 text-center" dir={dir} lang={locale}>
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-8">
            ✓
          </div>
          
          <h1 className="text-3xl font-black text-gray-900 mb-3">{copy.orderReceived}</h1>
          <p className="text-gray-500 mb-8">
            {copy.orderThanks} <strong>{tenant.name}</strong>.
          </p>

          {orderId && (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-8">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">{copy.orderRef}</span>
              <span className="text-lg font-mono font-bold text-gray-800">{orderId}</span>
            </div>
          )}

          <a 
            href={`/store/${tenant.slug}`}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[var(--store-primary)] text-white font-bold text-center shadow-md hover:brightness-110 transition-all text-decoration-none cursor-pointer"
          >
            {copy.continueShopping}
          </a>
        </div>
      </ThemeRenderer>
    </CartProvider>
  );
}
