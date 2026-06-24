import { pgTable, uuid, text, boolean, jsonb, timestamp, unique, integer } from 'drizzle-orm/pg-core';
import { tenants } from './platform';

export const themes = pgTable('themes', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  name: text('name').notNull().default('Default Theme'),
  version: integer('version').notNull().default(1),
  tokens: jsonb('tokens').notNull().default({}),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const themeAssets = pgTable('theme_assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  themeId: uuid('theme_id')
    .notNull()
    .references(() => themes.id),
  url: text('url').notNull(),
  alt: text('alt'),
  type: text('type', { enum: ['logo', 'hero_bg', 'gallery', 'section_bg', 'favicon', 'other'] })
    .notNull().default('other'),
  width: integer('width'),
  height: integer('height'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const pages = pgTable(
  'pages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    slug: text('slug').notNull(),
    blocks: jsonb('blocks').notNull().default([]),
    title: text('title'),
    metaDescription: text('meta_description'),
    template: text('template').notNull().default('index'),
    status: text('status', { enum: ['draft', 'published'] }).notNull().default('published'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [
    unique().on(t.tenantId, t.slug),
  ]
);
