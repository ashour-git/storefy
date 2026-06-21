import { pgTable, uuid, text, boolean, jsonb, unique } from 'drizzle-orm/pg-core';
import { tenants } from './platform';

export const themes = pgTable('themes', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  tokens: jsonb('tokens').notNull().default({}),
  active: boolean('active').default(true),
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
  },
  (t) => [
    unique().on(t.tenantId, t.slug),
  ]
);
