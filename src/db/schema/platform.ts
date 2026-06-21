import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const platformUsers = pgTable('platform_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').unique().notNull(),
  customDomain: text('custom_domain').unique(),
  ownerId: uuid('owner_id')
    .notNull()
    .references(() => platformUsers.id),
  name: text('name').notNull(),
  category: text('category'),
  defaultLocale: text('default_locale').notNull().default('ar'),
  defaultCurrency: text('default_currency').notNull().default('EGP'),
  plan: text('plan', { enum: ['free', 'starter', 'pro'] })
    .notNull()
    .default('free'),
  status: text('status', { enum: ['active', 'suspended', 'deleted'] })
    .notNull()
    .default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
