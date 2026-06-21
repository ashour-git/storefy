import { pgTable, uuid, text, unique } from 'drizzle-orm/pg-core';
import { tenants, platformUsers } from './platform';

export const tenantMembers = pgTable(
  'tenant_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => platformUsers.id),
    role: text('role', { enum: ['owner', 'manager', 'staff'] }).notNull(),
  },
  (t) => [
    unique().on(t.tenantId, t.userId),
  ]
);
