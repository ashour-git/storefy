import { pgTable, uuid, text, integer, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { tenants } from './platform';

export const carts = pgTable('carts', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  sessionId: text('session_id').notNull(),
  customerEmail: text('customer_email'),
  items: jsonb('items').notNull().default([]),
  status: text('status', { enum: ['active', 'abandoned', 'recovered', 'converted'] })
    .notNull()
    .default('active'),
  reminderCount: integer('reminder_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  abandonedAt: timestamp('abandoned_at', { withTimezone: true }),
}, (t) => [
  index('carts_tenant_session_idx').on(t.tenantId, t.sessionId),
  index('carts_tenant_status_idx').on(t.tenantId, t.status),
  index('carts_abandoned_idx').on(t.abandonedAt),
]);
