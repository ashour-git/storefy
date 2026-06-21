import { pgTable, uuid, text, numeric, integer, timestamp, jsonb, unique } from 'drizzle-orm/pg-core';
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
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

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
  ]
);
