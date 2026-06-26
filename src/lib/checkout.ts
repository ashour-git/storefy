import { and, eq, gte, sql } from 'drizzle-orm';
import { db, withTenant } from '../db';
import * as schema from '../db/schema';
import { getPaymentProvider, type PaymentMethod } from './providers/payments';
import { resolveTenantBySlugOrDomain } from './tenancy';
import { calculateDiscountTotal } from './discounts';
import { calculateShippingTotal } from './shipping';
import { emailProvider } from './providers/email';
import { orderConfirmationHtml } from './email-templates';
import { jobRunner } from './providers/jobs';

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
  discountCode?: string;
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

  if (!input.customerDetails || typeof input.customerDetails !== 'object') {
    throw new Error('Customer details are required');
  }

  const cleanItems = input.items
    .map((item) => ({ productId: item.productId, quantity: Math.max(1, Math.min(99, Number(item.quantity) || 1)) }))
    .filter((item) => item.productId);

  if (cleanItems.length === 0) throw new Error('Cart is empty');
  if (!input.idempotencyKey || input.idempotencyKey.length < 12) throw new Error('Invalid checkout attempt key');

  const customerDetails = {
    firstName: String(input.customerDetails.firstName || '').trim().slice(0, 80),
    lastName: String(input.customerDetails.lastName || '').trim().slice(0, 80),
    email: String(input.customerDetails.email || '').trim().slice(0, 160),
    phone: String(input.customerDetails.phone || '').trim().slice(0, 40),
    street: String(input.customerDetails.street || '').trim().slice(0, 220),
    city: String(input.customerDetails.city || '').trim().slice(0, 80),
  };

  if (!customerDetails.firstName || !customerDetails.phone || !customerDetails.street || !customerDetails.city) {
    throw new Error('Missing required customer details');
  }

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

    const lines: { product: any; variant: any; quantity: number; unitCents: number; variantId: string }[] = [];
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

      if (variant.stockQty < item.quantity) {
        throw new Error(`Insufficient stock for "${product.name}". Available: ${variant.stockQty}, requested: ${item.quantity}`);
      }

      const unitCents = Math.round(Number(product.basePrice) * 100);
      totalAmountCents += unitCents * item.quantity;
      lines.push({ product, variant, quantity: item.quantity, unitCents, variantId: variant.id });
    }

    const subtotal = totalAmountCents / 100;
    const discount = input.discountCode
      ? await tx.query.discounts.findFirst({
          where: and(
            eq(schema.discounts.tenantId, tenant.id),
            eq(schema.discounts.code, input.discountCode.trim().toUpperCase()),
          ),
        })
      : null;
    const discountTotal = calculateDiscountTotal(subtotal, discount || undefined);

    const allZones = await tx.select().from(schema.shippingZones).where(eq(schema.shippingZones.active, true));
    let matchedZone = allZones[0] || null;
    for (const zone of allZones) {
      const cities = (zone.cities as string[]) || [];
      if (cities.length > 0 && cities.some((c) => c.toLowerCase() === customerDetails.city.toLowerCase())) {
        matchedZone = zone;
        break;
      }
    }

    const shippingTotal = calculateShippingTotal(Math.max(0, subtotal - discountTotal), matchedZone || undefined);
    const taxRate = tenant.taxRate != null ? Number(tenant.taxRate) : 14;
    const taxTotal = Math.round((subtotal - discountTotal) * taxRate) / 100;
    const amount = subtotal.toFixed(2);
    const grandTotalNumber = Math.max(0, subtotal - discountTotal + shippingTotal + taxTotal);
    const grandTotal = grandTotalNumber.toFixed(2);
    const customerName = `${customerDetails.firstName} ${customerDetails.lastName}`.trim() || 'Store customer';
    const existingCustomer = customerDetails.email
      ? await tx.query.customers.findFirst({
          where: and(
            eq(schema.customers.tenantId, tenant.id),
            eq(schema.customers.email, customerDetails.email),
          ),
        })
      : null;

    const [customer] = existingCustomer
      ? [existingCustomer]
      : await tx.insert(schema.customers).values({
          tenantId: tenant.id,
          email: customerDetails.email || null,
          phone: customerDetails.phone || null,
          name: customerName,
        }).returning();

    const [order] = await tx.insert(schema.orders).values({
      tenantId: tenant.id,
      customerId: customer.id,
      channel: 'online',
      status: 'pending',
      subtotal: amount,
      discountTotal: discountTotal.toFixed(2),
      taxTotal: taxTotal.toFixed(2),
      shippingTotal: shippingTotal.toFixed(2),
      grandTotal,
      currency: tenant.defaultCurrency || 'EGP',
      shippingAddress: customerDetails,
    }).returning();

    await tx.insert(schema.orderEvents).values({ tenantId: tenant.id, orderId: order.id, type: 'created', toStatus: 'pending', note: 'Order created from storefront checkout' });

    if (discount && discountTotal > 0) {
      await tx.update(schema.discounts)
        .set({ usesCount: sql`${schema.discounts.usesCount} + 1` })
        .where(and(eq(schema.discounts.id, discount.id), eq(schema.discounts.tenantId, tenant.id)));
      await tx.insert(schema.orderEvents).values({
        tenantId: tenant.id,
        orderId: order.id,
        type: 'note',
        note: `Discount ${discount.code} applied: ${discountTotal.toFixed(2)} ${tenant.defaultCurrency || 'EGP'}`,
      });
    }

    for (const line of lines) {
      await tx.insert(schema.orderItems).values({
        tenantId: tenant.id,
        orderId: order.id,
        variantId: line.variant.id,
        quantity: line.quantity,
        unitPrice: (line.unitCents / 100).toFixed(2),
      });
    }

    for (const line of lines) {
      const [updated] = await tx.update(schema.productVariants)
        .set({ stockQty: sql`GREATEST(0, ${schema.productVariants.stockQty} - ${line.quantity})` })
        .where(and(
          eq(schema.productVariants.id, line.variant.id),
          gte(schema.productVariants.stockQty, line.quantity),
        ))
        .returning();
      if (!updated) {
        throw new Error(`Insufficient stock for "${line.product.name}".`);
      }
    }

    const provider = getPaymentProvider(input.paymentMethod);
    const intent = await provider.createIntent({
      orderId: order.id,
      amount: grandTotal,
      amountCents: Math.round(grandTotalNumber * 100),
      currency: tenant.defaultCurrency || 'EGP',
      idempotencyKey: input.idempotencyKey,
      paymentMethod: input.paymentMethod,
      paymobSettings: tenant.paymobSettings as any,
      customer: customerDetails,
      items: lines.map((line) => ({ name: line.product.name, amountCents: line.unitCents, quantity: line.quantity })),
    });

    await tx.insert(schema.payments).values({
      tenantId: tenant.id,
      orderId: order.id,
      amount: grandTotal,
      provider: intent.provider,
      providerRef: intent.providerRef,
      idempotencyKey: input.idempotencyKey,
      status: intent.status,
    });

    const finalOrderStatus = intent.status === 'succeeded' ? 'paid' : 'pending';
    if (finalOrderStatus !== order.status) {
      await tx.update(schema.orders).set({ status: finalOrderStatus }).where(eq(schema.orders.id, order.id));
      await tx.insert(schema.orderEvents).values({ tenantId: tenant.id, orderId: order.id, type: finalOrderStatus === 'paid' ? 'paid' : 'status_changed', fromStatus: order.status, toStatus: finalOrderStatus });
    }

    if (finalOrderStatus === 'paid') {
      await jobRunner.enqueue('order/paid', { orderId: order.id, tenantId: tenant.id });
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
