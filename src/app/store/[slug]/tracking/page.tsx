import { withTenant } from '../../../../db';
import * as schema from '../../../../db/schema';
import { and, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { ThemeRenderer } from '../../../../components/storefront/ThemeRenderer';
import type { ThemeTokens } from '../../../../components/storefront/ThemeRenderer';
import { resolveTenantBySlugOrDomain } from '../../../../lib/tenancy';
import { getStorefrontCopy } from '../../../../lib/storefront/copy';
import { getTemplateForVertical } from '../../../../lib/storefront/templates';
import type { Locale } from '../../../../lib/i18n';
import type { Metadata } from 'next';

interface TrackingPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ orderId?: string }>;
}

export async function generateMetadata({ params }: TrackingPageProps): Promise<Metadata> {
  const { slug } = await params;
  let tenant;
  try {
    tenant = await resolveTenantBySlugOrDomain(slug);
  } catch (e) {
    console.error('[store/tracking] generateMetadata tenant lookup failed:', e);
    return { title: 'Order Tracking' };
  }
  if (!tenant) return { title: 'Order Tracking' };
  return {
    title: `Order Tracking - ${tenant.name}`,
    description: `Track your order status at ${tenant.name}.`,
  };
}

const statusSteps = [
  { key: 'pending', labelAr: 'قيد الانتظار', labelEn: 'Pending', icon: '⏳' },
  { key: 'paid', labelAr: 'تم الدفع', labelEn: 'Paid', icon: '💳' },
  { key: 'fulfilled', labelAr: 'تم التجهيز', labelEn: 'Fulfilled', icon: '📦' },
  { key: 'shipped', labelAr: 'تم الشحن', labelEn: 'Shipped', icon: '🚚' },
  { key: 'delivered', labelAr: 'تم التوصيل', labelEn: 'Delivered', icon: '✅' },
];

export default async function TrackingPage({ params, searchParams }: TrackingPageProps) {
  const { slug } = await params;
  const { orderId } = await searchParams;

  let tenant;
  try {
    tenant = await resolveTenantBySlugOrDomain(slug);
  } catch (e) {
    console.error('[store/tracking] Tenant lookup failed:', e);
    notFound();
  }
  if (!tenant) notFound();

  const locale: Locale = tenant.defaultLocale === 'ar' ? 'ar' : 'en';
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const copy = getStorefrontCopy(locale);
  const fallbackTemplate = getTemplateForVertical(tenant.category);

  let themeRecord = null;
  let order = null;
  let events: Array<{ id: string; type: string; fromStatus: string | null; toStatus: string | null; note: string | null; createdAt: Date | null }> = [];
  let items: Array<{ id: string; variantId: string; quantity: number; unitPrice: string }> = [];
  try {
    const data = await withTenant(tenant.id, async (tx) => {
      const theme = await tx.query.themes.findFirst({ where: eq(schema.themes.tenantId, tenant.id) });

      let orderData = null;
      let orderEvents: Array<{ id: string; type: string; fromStatus: string | null; toStatus: string | null; note: string | null; createdAt: Date | null }> = [];
      let orderItems: Array<{ id: string; variantId: string; quantity: number; unitPrice: string }> = [];

      if (orderId) {
        orderData = await tx.query.orders.findFirst({
          where: and(eq(schema.orders.id, orderId), eq(schema.orders.tenantId, tenant.id)),
        }) || null;

        if (orderData) {
          orderEvents = await tx.select().from(schema.orderEvents).where(eq(schema.orderEvents.orderId, orderId));
          orderItems = await tx.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, orderId));
        }
      }

      return { themeRecord: theme, order: orderData, events: orderEvents, items: orderItems };
    });
    themeRecord = data.themeRecord;
    order = data.order;
    events = data.events;
    items = data.items;
  } catch (e) {
    console.error('[store/tracking] Failed to fetch order data:', e);
  }

  const tokens = (themeRecord?.tokens || fallbackTemplate.tokens) as ThemeTokens;

  const currentStepIndex = order
    ? statusSteps.findIndex((s) => s.key === order.fulfillmentStatus || s.key === order.status)
    : -1;

  return (
    <ThemeRenderer tokens={tokens}>
      <div className="store-checkout-page store-shell" dir={dir} lang={locale}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>
            {locale === 'ar' ? 'تتبع الطلب' : 'Track Your Order'}
          </h1>
          <p style={{ color: 'var(--store-muted)', marginBottom: 32 }}>
            {locale === 'ar' ? 'أدخل رقم الطلب لمعرفة حالة طلبك.' : 'Enter your order ID to check its status.'}
          </p>

          {!orderId ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--store-muted)' }}>
              <p>{locale === 'ar' ? 'يرجى إدخال رقم الطلب من صفحة التأكيد.' : 'Please enter the order ID from the confirmation page.'}</p>
            </div>
          ) : !order ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--store-muted)' }}>
              <p>{locale === 'ar' ? 'لم يتم العثور على الطلب. تحقق من رقم الطلب.' : 'Order not found. Please check the order ID.'}</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 24 }}>
              <div style={{ background: 'var(--store-surface)', borderRadius: 16, padding: 24, border: '1px solid color-mix(in srgb, var(--store-text) 10%, transparent)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--store-muted)' }}>
                      {locale === 'ar' ? 'رقم الطلب' : 'Order ID'}
                    </span>
                    <strong style={{ display: 'block', fontSize: '1.1rem', marginTop: 4 }}>#{order.id.slice(0, 8).toUpperCase()}</strong>
                  </div>
                  <div style={{ textAlign: 'end' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--store-muted)' }}>
                      {locale === 'ar' ? 'التاريخ' : 'Date'}
                    </span>
                    <span style={{ display: 'block', marginTop: 4 }}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-EG') : '-'}
                    </span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid color-mix(in srgb, var(--store-text) 8%, transparent)', paddingTop: 16 }}>
                  {items.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.9rem' }}>
                      <span>{locale === 'ar' ? `منتج × ${item.quantity}` : `Product × ${item.quantity}`}</span>
                      <span>{Number(item.unitPrice).toFixed(2)} {order.currency}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid color-mix(in srgb, var(--store-text) 8%, transparent)', paddingTop: 8, marginTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                    <span>{locale === 'ar' ? 'الإجمالي' : 'Total'}</span>
                    <span>{Number(order.grandTotal).toFixed(2)} {order.currency}</span>
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--store-surface)', borderRadius: 16, padding: 24, border: '1px solid color-mix(in srgb, var(--store-text) 10%, transparent)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>
                  {locale === 'ar' ? 'حالة الطلب' : 'Order Status'}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    return (
                      <div key={step.key} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', position: 'relative' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24, flexShrink: 0 }}>
                          <div style={{
                            width: 24, height: 24, borderRadius: '50%',
                            background: isCompleted ? 'var(--store-primary)' : 'color-mix(in srgb, var(--store-text) 15%, transparent)',
                            color: isCompleted ? '#fff' : 'var(--store-muted)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.7rem', fontWeight: 700, zIndex: 1,
                          }}>
                            {isCompleted ? '✓' : index + 1}
                          </div>
                          {index < statusSteps.length - 1 && (
                            <div style={{
                              width: 2, height: 32,
                              background: index < currentStepIndex ? 'var(--store-primary)' : 'color-mix(in srgb, var(--store-text) 15%, transparent)',
                            }} />
                          )}
                        </div>
                        <div style={{ paddingBottom: 16 }}>
                          <span style={{
                            fontWeight: isCurrent ? 700 : 400,
                            color: isCompleted ? 'var(--store-text)' : 'var(--store-muted)',
                            fontSize: '0.9rem',
                          }}>
                            {locale === 'ar' ? step.labelAr : step.labelEn}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {order.trackingNumber && (
                <div style={{ background: 'var(--store-surface)', borderRadius: 16, padding: 24, border: '1px solid color-mix(in srgb, var(--store-text) 10%, transparent)' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>
                    {locale === 'ar' ? 'رقم التتبع' : 'Tracking Number'}
                  </h3>
                  <p style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>{order.trackingNumber}</p>
                </div>
              )}

              {events.length > 0 && (
                <div style={{ background: 'var(--store-surface)', borderRadius: 16, padding: 24, border: '1px solid color-mix(in srgb, var(--store-text) 10%, transparent)' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>
                    {locale === 'ar' ? 'سجل الطلب' : 'Order Timeline'}
                  </h3>
                  {events.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()).map((event) => (
                    <div key={event.id} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid color-mix(in srgb, var(--store-text) 5%, transparent)', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--store-muted)', whiteSpace: 'nowrap' }}>
                        {event.createdAt ? new Date(event.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                      <span>{event.note || event.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <a
            href={`/store/${tenant.slug}`}
            style={{ display: 'inline-block', marginTop: 32, color: 'var(--store-primary)', fontWeight: 600, textDecoration: 'none' }}
          >
            ← {copy.continueShopping || 'Continue Shopping'}
          </a>
        </div>
      </div>
    </ThemeRenderer>
  );
}
