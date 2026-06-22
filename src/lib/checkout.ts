import { and, eq } from 'drizzle-orm';
import { db, withTenant } from '../db';
import * as schema from '../db/schema';
import { getPaymentProvider, type PaymentMethod } from './providers/payments';
import { resolveTenantBySlugOrDomain } from './tenancy';

interface CheckoutItemInput {
  productId: string;
  quantity: number;
}

interface CustomerInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
}

export interface CheckoutInput {
  storeSlug: string;
  items: CheckoutItemInput[];
  customerDetails: CustomerInput;
  paymentMethod: PaymentMethod;
  idempotencyKey: string;
}

export interface CheckoutResult {
  orderId: string;
  status: 'pending' | 'paid' | 'fulfilled' | 'cancelled' | 'refunded';
  paymentStatus: string;
  redirectUrl: string | null;
  provider: string;
}

export async function createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  const tenant = await resolveTenantBySlugOrDomain(input.storeSlug);
  if (!tenant) throw new Error('Store not found');

  const cleanItems = input.items
    .map((item) => ({ productId: item.productId, quantity: Math.max(1, Math.min(99, Number(item.quantity) || 1)) }))
    .filter((item) => item.productId);

  if (cleanItems.length === 0) throw new Error('Cart is empty');
  if (!input.idempotencyKey || input.idempotencyKey.length < 12) throw new Error('Invalid checkout attempt key');

  return withTenant(tenant.id, async (tx) => {
    const existingPayment = await tx.query.payments.findFirst({
      where: and(
        eq(schema.payments.tenantId, tenant.id),
        eq(schema.payments.idempotencyKey, input.idempotencyKey),
      ),
    });

    if (existingPayment) {
      const existingOrder = await tx.query.orders.findFirst({ where: eq(schema.orders.id, existingPayment.orderId) });
      return {
        orderId: existingPayment.orderId,
        status: existingOrder?.status || 'pending',
        paymentStatus: existingPayment.status,
        redirectUrl: null,
        provider: existingPayment.provider,
      };
    }

    const lines = [];
    let totalAmountCents = 0;

    for (const item of cleanItems) {
      const product = await tx.query.products.findFirst({
        where: and(
          eq(schema.products.id, item.productId),
          eq(schema.products.tenantId, tenant.id),
          eq(schema.products.status, 'active'),
        ),
      });
      if (!product) throw new Error('A cart item is unavailable');

      const variant = await tx.query.productVariants.findFirst({
        where: and(
          eq(schema.productVariants.productId, product.id),
          eq(schema.productVariants.tenantId, tenant.id),
        ),
      });
      if (!variant) throw new Error(`Product ${product.name} is missing a sellable variant`);

      const unitCents = Math.round(Number(product.basePrice) * 100);
      totalAmountCents += unitCents * item.quantity;
      lines.push({ product, variant, quantity: item.quantity, unitCents });
    }

    const amount = (totalAmountCents / 100).toFixed(2);
    const customerName = `${input.customerDetails.firstName} ${input.customerDetails.lastName}`.trim() || 'Store customer';
    const existingCustomer = input.customerDetails.email
      ? await tx.query.customers.findFirst({
          where: and(
            eq(schema.customers.tenantId, tenant.id),
            eq(schema.customers.email, input.customerDetails.email),
          ),
        })
      : null;

    const [customer] = existingCustomer
      ? [existingCustomer]
      : await tx.insert(schema.customers).values({
          tenantId: tenant.id,
          email: input.customerDetails.email || null,
          phone: input.customerDetails.phone || null,
          name: customerName,
        }).returning();

    const [order] = await tx.insert(schema.orders).values({
      tenantId: tenant.id,
      customerId: customer.id,
      channel: 'online',
      status: 'pending',
      subtotal: amount,
      grandTotal: amount,
      currency: tenant.defaultCurrency || 'EGP',
    }).returning();

    for (const line of lines) {
      await tx.insert(schema.orderItems).values({
        tenantId: tenant.id,
        orderId: order.id,
        variantId: line.variant.id,
        quantity: line.quantity,
        unitPrice: (line.unitCents / 100).toFixed(2),
      });
    }

    const provider = getPaymentProvider(input.paymentMethod);
    const intent = await provider.createIntent({
      orderId: order.id,
      amount,
      amountCents: totalAmountCents,
      currency: tenant.defaultCurrency || 'EGP',
      idempotencyKey: input.idempotencyKey,
      customer: input.customerDetails,
      items: lines.map((line) => ({ name: line.product.name, amountCents: line.unitCents, quantity: line.quantity })),
    });

    await tx.insert(schema.payments).values({
      tenantId: tenant.id,
      orderId: order.id,
      amount,
      provider: intent.provider,
      providerRef: intent.providerRef,
      idempotencyKey: input.idempotencyKey,
      status: intent.status,
    });

    const finalOrderStatus = intent.status === 'succeeded' ? 'paid' : 'pending';
    if (finalOrderStatus !== order.status) {
      await tx.update(schema.orders).set({ status: finalOrderStatus }).where(eq(schema.orders.id, order.id));
    }

    return {
      orderId: order.id,
      status: finalOrderStatus,
      paymentStatus: intent.status,
      redirectUrl: intent.redirectUrl,
      provider: intent.provider,
    };
  });
}

export async function findPaymentByProviderRef(providerRef: string) {
  const payments = await db.select().from(schema.payments).where(eq(schema.payments.providerRef, providerRef));
  return payments[0] ?? null;
}
