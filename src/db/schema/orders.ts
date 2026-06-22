import { pgTable, uuid, text, numeric, integer, timestamp, jsonb, unique, index } from 'drizzle-orm/pg-core';
import { tenants } from './platform';
import { customers, productVariants } from './store';

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  customerId: uuid('customer_id').references(() => customers.id),
  channel: text('channel', { enum: ['online', 'pos'] }).notNull(),
  status: text('status', {
    enum: ['pending', 'paid', 'fulfilled', 'cancelled', 'refunded'],
  })
    .notNull()
    .default('pending'),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
  discountTotal: numeric('discount_total', { precision: 12, scale: 2 }).default('0.00'),
  taxTotal: numeric('tax_total', { precision: 12, scale: 2 }).default('0.00'),
  shippingTotal: numeric('shipping_total', { precision: 12, scale: 2 }).default('0.00'),
  grandTotal: numeric('grand_total', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('EGP'),
  shippingAddress: jsonb('shipping_address'),
  fulfillmentStatus: text('fulfillment_status', { enum: ['unfulfilled', 'packed', 'shipped', 'delivered', 'returned'] }).notNull().default('unfulfilled'),
  trackingNumber: text('tracking_number'),
  internalNotes: text('internal_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('orders_tenant_idx').on(t.tenantId),
  index('orders_status_idx').on(t.status),
]);

export const orderEvents = pgTable('order_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id),
  type: text('type', { enum: ['created', 'paid', 'status_changed', 'fulfilled', 'note', 'payment_failed', 'refunded'] }).notNull(),
  fromStatus: text('from_status'),
  toStatus: text('to_status'),
  note: text('note'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('order_events_tenant_order_idx').on(t.tenantId, t.orderId),
]);

export const storefrontEvents = pgTable('storefront_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  sessionId: text('session_id').notNull(),
  eventType: text('event_type', { enum: ['store_view', 'product_view', 'category_view', 'cart_add', 'checkout_start'] }).notNull(),
  productId: uuid('product_id'),
  categoryId: uuid('category_id'),
  path: text('path'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('storefront_events_tenant_type_idx').on(t.tenantId, t.eventType),
  index('storefront_events_created_idx').on(t.createdAt),
]);

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id),
  variantId: uuid('variant_id')
    .notNull()
    .references(() => productVariants.id),
  quantity: integer('quantity').notNull(),
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
});

export const payments = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id),
    provider: text('provider', { enum: ['paymob', 'stripe', 'cod'] }).notNull(),
    providerRef: text('provider_ref'),
    idempotencyKey: text('idempotency_key').notNull(),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    status: text('status', { enum: ['initiated', 'succeeded', 'failed', 'refunded'] }).notNull(),
    rawWebhook: jsonb('raw_webhook'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [
    unique().on(t.tenantId, t.idempotencyKey),
    index('payments_tenant_idx').on(t.tenantId),
    index('payments_provider_ref_idx').on(t.providerRef),
  ]
);
