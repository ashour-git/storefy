import { pgTable, uuid, text, numeric, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

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
  description: text('description'),
  logo: text('logo'),
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  address: text('address'),
  category: text('category'),
  paymobSettings: jsonb('paymob_settings').default({}),
  defaultLocale: text('default_locale').notNull().default('ar'),
  defaultCurrency: text('default_currency').notNull().default('EGP'),
  plan: text('plan', { enum: ['free', 'starter', 'pro'] })
    .notNull()
    .default('free'),
  taxRate: numeric('tax_rate', { precision: 5, scale: 2 }).notNull().default('14.00'),
  status: text('status', { enum: ['active', 'suspended', 'deleted'] })
    .notNull()
    .default('active'),
  onboardingComplete: boolean('onboarding_complete').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
