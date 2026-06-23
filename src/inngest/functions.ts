import { inngest } from './client';
import { db, withTenant } from '../db';
import * as schema from '../db/schema';
import { eq, and, lt } from 'drizzle-orm';
import { emailProvider } from '../lib/providers/email';
import { orderConfirmationHtml } from '../lib/email-templates';
import { rebuildTenantKnowledge } from '../lib/ai/knowledge';

// ─── Send order confirmation email ───────────────────────────────────────────
export const sendOrderEmail = inngest.createFunction(
  { id: 'send-order-email', name: 'Send Order Confirmation Email', triggers: { event: 'order/paid' } },
  async ({ event, step }) => {
    const { orderId, tenantId } = event.data;

    await step.run('send-email', async () => {
      const tenant = await db.query.tenants.findFirst({ where: eq(schema.tenants.id, tenantId) });
      if (!tenant) return;

      await withTenant(tenantId, async (tx) => {
        const order = await tx.query.orders.findFirst({ where: eq(schema.orders.id, orderId) });
        if (!order || !order.customerId) return;

        const customer = await tx.query.customers.findFirst({ where: eq(schema.customers.id, order.customerId) });
        if (!customer?.email) return;

        const items = await tx.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, orderId));

        const lineDetails = [];
        for (const item of items) {
          const variant = await tx.query.productVariants.findFirst({ where: eq(schema.productVariants.id, item.variantId) });
          const product = variant ? await tx.query.products.findFirst({ where: eq(schema.products.id, variant.productId) }) : null;
          lineDetails.push({
            name: product?.name || 'Product',
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice).toFixed(2),
          });
        }

        const html = orderConfirmationHtml({
          customerName: customer.name || 'Customer',
          orderId: order.id,
          storeName: tenant.name,
          items: lineDetails,
          subtotal: Number(order.subtotal).toFixed(2),
          discountTotal: Number(order.discountTotal || 0).toFixed(2),
          taxTotal: Number(order.taxTotal || 0).toFixed(2),
          shippingTotal: Number(order.shippingTotal || 0).toFixed(2),
          grandTotal: Number(order.grandTotal).toFixed(2),
          currency: order.currency,
          paymentMethod: 'online',
          shippingAddress: (order.shippingAddress || {}) as any,
        });

        await emailProvider.send({
          to: customer.email,
          subject: `Order Confirmed — #${order.id.slice(0, 8).toUpperCase()}`,
          html,
        });
      });
    });
  },
);

// ─── Rebuild RAG knowledge after product changes ─────────────────────────────
export const rebuildKnowledge = inngest.createFunction(
  { id: 'rebuild-knowledge', name: 'Rebuild AI Knowledge Base', triggers: { event: 'product/updated' } },
  async ({ event, step }) => {
    const { tenantId } = event.data;

    await step.run('rebuild', async () => {
      await rebuildTenantKnowledge(tenantId);
    });
  },
);

// ─── Check for abandoned carts ───────────────────────────────────────────────
export const checkAbandonedCarts = inngest.createFunction(
  { id: 'check-abandoned-carts', name: 'Check Abandoned Carts', triggers: { cron: '0 * * * *' } },
  async ({ step }) => {
    const abandonedThreshold = new Date(Date.now() - 60 * 60 * 1000);

    const abandoned = await step.run('find-abandoned', async () => {
      return db
        .select()
        .from(schema.carts)
        .where(
          and(
            eq(schema.carts.status, 'active'),
            lt(schema.carts.updatedAt, abandonedThreshold),
          ),
        )
        .limit(100);
    });

    for (const cart of abandoned) {
      await step.run(`mark-abandoned-${cart.id}`, async () => {
        await withTenant(cart.tenantId, async (tx) => {
          await tx.update(schema.carts)
            .set({ status: 'abandoned', abandonedAt: new Date() })
            .where(eq(schema.carts.id, cart.id));
        });
      });

      const items = cart.items as any[];
      if (items.length > 0 && cart.customerEmail) {
        await inngest.send({
          name: 'cart/send-reminder',
          data: { cartId: cart.id, tenantId: cart.tenantId, customerEmail: cart.customerEmail, items, reminderNumber: 1 },
        });
      }
    }
  },
);

// ─── Send abandoned cart reminder ────────────────────────────────────────────
export const sendCartReminder = inngest.createFunction(
  { id: 'send-cart-reminder', name: 'Send Cart Reminder Email', triggers: { event: 'cart/send-reminder' } },
  async ({ event, step }) => {
    const { cartId, tenantId, customerEmail, items, reminderNumber } = event.data;

    await step.sleep('wait-before-reminder', reminderNumber === 1 ? '1h' : '23h');

    await step.run('send-reminder', async () => {
      const tenant = await db.query.tenants.findFirst({ where: eq(schema.tenants.id, tenantId) });
      if (!tenant) return;

      const cart = await db.query.carts.findFirst({ where: eq(schema.carts.id, cartId) });
      if (!cart || cart.status !== 'abandoned') return;

      const itemsList = items.map((item: any) =>
        `<li style="padding:8px 0;border-bottom:1px solid #eee">${item.name} × ${item.quantity} — ${Number(item.price).toFixed(2)} ${tenant.defaultCurrency}</li>`
      ).join('');

      const total = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

      const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:IBM Plex Sans Arabic,Inter,sans-serif">
  <div style="max-width:600px;margin:0 auto;background:#fff">
    <div style="background:#1a1a2e;padding:32px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:24px">${tenant.name}</h1>
    </div>
    <div style="padding:32px">
      <h2 style="color:#1a1a2e;margin:0 0 8px">لقد تركت بعض المنتجات في سلة التسوق</h2>
      <p style="color:#666;margin:0 0 24px">أكمل عملية الشراء قبل نفاد المخزون!</p>
      <ul style="list-style:none;padding:0;margin:0 0 24px">${itemsList}</ul>
      <div style="text-align:center;margin-bottom:24px">
        <a href="https://${tenant.slug}.storefy.com/checkout" style="display:inline-block;background:#6c5ce7;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold">
          إكمال الشراء — ${total.toFixed(2)} ${tenant.defaultCurrency}
        </a>
      </div>
    </div>
  </div>
</body>
</html>`;

      await emailProvider.send({
        to: customerEmail,
        subject: `${tenant.name} — سلة التسوق في انتظارك`,
        html,
      });

      await withTenant(tenantId, async (tx) => {
        await tx.update(schema.carts)
          .set({ reminderCount: (cart.reminderCount || 0) + 1 })
          .where(eq(schema.carts.id, cartId));
      });
    });
  },
);
