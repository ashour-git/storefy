import { pgTable, uuid, text, boolean, numeric, integer, timestamp, jsonb, unique, index } from 'drizzle-orm/pg-core';
import { tenants } from './platform';

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  name: text('name').notNull(),
  slug: text('slug'),
  description: text('description'),
  image: text('image'),
  sortOrder: integer('sort_order').default(0),
  parentId: uuid('parent_id').references((): any => categories.id),
}, (t) => [
  unique().on(t.tenantId, t.slug),
  index('categories_tenant_idx').on(t.tenantId),
]);

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  categoryId: uuid('category_id').references(() => categories.id),
  name: text('name').notNull(),
  description: text('description'),
  descriptionAiGenerated: boolean('description_ai_generated').default(false),
  basePrice: numeric('base_price', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('EGP'),
  status: text('status', { enum: ['draft', 'active', 'archived'] })
    .notNull()
    .default('draft'),
  images: jsonb('images').default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('products_tenant_idx').on(t.tenantId),
]);

export const productVariants = pgTable(
  'product_variants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id),
    sku: text('sku').notNull(),
    attributes: jsonb('attributes').default({}),
    priceOverride: numeric('price_override', { precision: 12, scale: 2 }),
    stockQty: integer('stock_qty').notNull().default(0),
  },
  (t) => [
    unique().on(t.tenantId, t.sku),
  ]
);

export const media = pgTable('media', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  productId: uuid('product_id').references(() => products.id),
  url: text('url').notNull(),
  altText: text('alt_text'),
  position: integer('position').default(0),
});

export const customers = pgTable(
  'customers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    email: text('email'),
    phone: text('phone'),
    name: text('name'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [
    unique().on(t.tenantId, t.email),
    index('customers_tenant_idx').on(t.tenantId),
  ]
);

export const discounts = pgTable(
  'discounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    code: text('code').notNull(),
    type: text('type', { enum: ['percent', 'fixed'] }).notNull(),
    value: numeric('value', { precision: 12, scale: 2 }).notNull(),
    startsAt: timestamp('starts_at', { withTimezone: true }),
    endsAt: timestamp('ends_at', { withTimezone: true }),
    maxUses: integer('max_uses'),
    usesCount: integer('uses_count').default(0),
  },
  (t) => [
    unique().on(t.tenantId, t.code),
  ]
);

export const shippingZones = pgTable(
  'shipping_zones',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    name: text('name').notNull(),
    cities: jsonb('cities').default([]),
    baseRate: numeric('base_rate', { precision: 12, scale: 2 }).notNull().default('0.00'),
    freeShippingThreshold: numeric('free_shipping_threshold', { precision: 12, scale: 2 }),
    codEnabled: boolean('cod_enabled').notNull().default(true),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index('shipping_zones_tenant_idx').on(t.tenantId),
  ]
);

export const productReviews = pgTable(
  'product_reviews',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id),
    customerId: uuid('customer_id').references(() => customers.id),
    rating: integer('rating').notNull(),
    title: text('title'),
    body: text('body'),
    authorName: text('author_name'),
    authorEmail: text('author_email'),
    status: text('status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index('product_reviews_tenant_product_idx').on(t.tenantId, t.productId),
    index('product_reviews_status_idx').on(t.status),
  ]
);
