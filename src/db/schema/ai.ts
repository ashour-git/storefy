import { pgTable, uuid, text, integer, boolean, timestamp, jsonb, vector } from 'drizzle-orm/pg-core';
import { tenants } from './platform';
import { customers } from './store';

export const knowledgeChunks = pgTable('knowledge_chunks', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  sourceType: text('source_type', { enum: ['product', 'faq', 'policy'] }).notNull(),
  sourceId: uuid('source_id'),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 1024 }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const aiConversations = pgTable('ai_conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  customerId: uuid('customer_id').references(() => customers.id),
  channel: text('channel', { enum: ['storefront_chat', 'pos', 'dashboard'] }).notNull(),
  messages: jsonb('messages').notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const aiAgentLogs = pgTable('ai_agent_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id),
  processor: text('processor').notNull(),
  model: text('model').notNull(),
  inputTokens: integer('input_tokens'),
  outputTokens: integer('output_tokens'),
  latencyMs: integer('latency_ms'),
  moderationFlagged: boolean('moderation_flagged').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id),
  actorId: uuid('actor_id'),
  action: text('action').notNull(),
  entity: text('entity'),
  entityId: uuid('entity_id'),
  diff: jsonb('diff'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
