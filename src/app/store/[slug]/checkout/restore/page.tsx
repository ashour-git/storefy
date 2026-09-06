import { withTenant } from '../../../../../db';
import * as schema from '../../../../../db/schema';
import { and, eq } from 'drizzle-orm';
import { ThemeRenderer, type ThemeTokens } from '../../../../../components/storefront/ThemeRenderer';
import { RestoreCartClient } from '../../../../../components/storefront/RestoreCartClient';
import { resolveTenantBySlugOrDomain } from '../../../../../lib/tenancy';
import { getTemplateForVertical } from '../../../../../lib/storefront/templates';
import { verifyRestoreToken } from '../../../../../lib/storefront/cart-restore';
import { env } from '../../../../../lib/env';
import type { Locale } from '../../../../../lib/i18n';

interface RestorePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
}

function EmptyCartState({ slug, locale }: { slug: string; locale: Locale }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <p style={{ color: 'var(--store-muted)' }}>
        {locale === 'ar'
          ? 'انتهت صلاحية رابط الاستعادة. سلة التسوق فارغة.'
          : 'This restore link has expired. Your cart is empty.'}
      </p>
      <p style={{ marginTop: 12 }}>
        <a href={`/store/${slug}`} style={{ color: 'var(--store-primary)', fontWeight: 700 }}>
          {locale === 'ar' ? 'العودة إلى المتجر' : 'Back to the store'}
        </a>
      </p>
    </div>
  );
}

export default async function RestorePage({ params, searchParams }: RestorePageProps) {
  const { slug } = await params;
  const { token = '' } = await searchParams;
  let tenant;
  try {
    tenant = await resolveTenantBySlugOrDomain(slug);
  } catch (e) {
    console.error('[store/restore] Tenant lookup failed:', e);
    tenant = null;
  }

  const locale: Locale = tenant?.defaultLocale === 'ar' ? 'ar' : 'en';
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const fallbackTokens = (tenant
    ? getTemplateForVertical(tenant.category).tokens
    : getTemplateForVertical('general').tokens) as ThemeTokens;

  let items: RestoreCartClientItems | null = null;
  if (tenant && token && env.betterAuthSecret) {
    const ids = verifyRestoreToken(token, env.betterAuthSecret);
    if (ids && ids.tenantId === tenant.id) {
      try {
        items = await withTenant(tenant.id, async (tx) => {
          const cart = await tx.query.carts.findFirst({
            where: and(eq(schema.carts.id, ids.cartId), eq(schema.carts.tenantId, tenant.id)),
          });
          if (!cart || cart.status !== 'abandoned') return null;
          await tx.update(schema.carts).set({ status: 'active', updatedAt: new Date() }).where(eq(schema.carts.id, cart.id));
          return (cart.items as RestoreCartClientItems) || [];
        });
      } catch (e) {
        console.error('[store/restore] Restore failed:', e);
        items = null;
      }
    }
  }

  return (
    <ThemeRenderer tokens={fallbackTokens}>
      <div className="store-checkout-page store-shell" dir={dir} lang={locale}>
        {!tenant || !items || items.length === 0 ? (
          <EmptyCartState slug={slug} locale={locale} />
        ) : (
          <RestoreCartClient slug={tenant.slug} currency={tenant.defaultCurrency} items={items} />
        )}
      </div>
    </ThemeRenderer>
  );
}

type RestoreCartClientItems = Array<{
  productId: string;
  variantId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}>;
