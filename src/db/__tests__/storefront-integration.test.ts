import { describe, it, expect, beforeAll } from 'vitest';
import * as dotenv from 'dotenv';
dotenv.config();

import { db, withTenant } from '../index';
import * as schema from '../schema';
import StorefrontPage from '../../app/store/[slug]/page';
import type { ReactNode } from 'react';

// Helper to recursively extract all text children from React Server Component JSX output
type NodeWithProps = { props?: { products?: unknown; children?: ReactNode } };

function extractTextFromJsx(node: ReactNode | NodeWithProps): string[] {
  if (!node) return [];
  if (typeof node === 'string' || typeof node === 'number') {
    return [String(node)];
  }
  if (Array.isArray(node)) {
    return node.flatMap(extractTextFromJsx);
  }
  const texts: string[] = [];
  if (typeof node === 'object' && node !== null && 'props' in node && node.props) {
    const props = (node as NodeWithProps).props;
    if (!props) return texts;
    if (props.products && Array.isArray(props.products)) {
      for (const p of props.products) {
        if (typeof p === 'object' && p !== null && 'name' in p && typeof p.name === 'string') texts.push(p.name);
        if (typeof p === 'object' && p !== null && 'description' in p && typeof p.description === 'string') texts.push(p.description);
      }
    }
    if (props.children) {
      texts.push(...extractTextFromJsx(props.children));
    }
  }
  return texts;
}

const describeIfDatabase = process.env.RUN_DB_TESTS === 'true' && process.env.DATABASE_URL ? describe : describe.skip;

describeIfDatabase('Storefront Page End-to-End Tenant Isolation Integration Test', () => {
  let userAId: string;
  let userBId: string;
  let tenantAId: string;
  let tenantBId: string;
  let tenantASlug: string;
  let tenantBSlug: string;

  beforeAll(async () => {
    // Seed platform users
    const [userA] = await db
      .insert(schema.platformUsers)
      .values({ email: `integration-user-a-${Date.now()}@test.com`, name: 'Integration User A' })
      .returning();
    userAId = userA.id;

    const [userB] = await db
      .insert(schema.platformUsers)
      .values({ email: `integration-user-b-${Date.now()}@test.com`, name: 'Integration User B' })
      .returning();
    userBId = userB.id;

    // Seed Tenants
    tenantASlug = `integration-tenant-a-${Date.now()}`;
    const [tenantA] = await db
      .insert(schema.tenants)
      .values({ slug: tenantASlug, ownerId: userAId, name: 'Integration Tenant A Store' })
      .returning();
    tenantAId = tenantA.id;

    tenantBSlug = `integration-tenant-b-${Date.now()}`;
    const [tenantB] = await db
      .insert(schema.tenants)
      .values({ slug: tenantBSlug, ownerId: userBId, name: 'Integration Tenant B Store' })
      .returning();
    tenantBId = tenantB.id;

    // Seed Products scoped to respective tenants using withTenant transactions to satisfy RLS policies
    await withTenant(tenantAId, async (tx) => {
      await tx.insert(schema.products).values({
        tenantId: tenantAId,
        name: 'Oud Royal Scent',
        description: 'Exclusive premium oud scent from Tenant A.',
        basePrice: '2500.00',
        status: 'active',
      });
    });

    await withTenant(tenantBId, async (tx) => {
      await tx.insert(schema.products).values({
        tenantId: tenantBId,
        name: 'Musk Supreme Scent',
        description: 'Exclusive premium musk scent from Tenant B.',
        basePrice: '1800.00',
        status: 'active',
      });
    });
  }, 30000);

  it("should resolve Tenant A storefront, invoke withTenant, and render only Tenant A's products under RLS", async () => {
    // Call the server component with Tenant A's slug (which simulates the middleware URL rewrite)
    const jsxResult = await StorefrontPage({
      params: Promise.resolve({ slug: tenantASlug }),
    });

    const renderedTexts = extractTextFromJsx(jsxResult);
    const joinedText = renderedTexts.join(' ');

    // Assertions
    expect(joinedText).toContain('Integration Tenant A Store');
    expect(joinedText).toContain('Oud Royal Scent');
    expect(joinedText).toContain('Exclusive premium oud scent from Tenant A.');

    // RLS Enforcement Proof: Tenant B's product must be completely filtered out
    expect(joinedText).not.toContain('Integration Tenant B Store');
    expect(joinedText).not.toContain('Musk Supreme Scent');
    expect(joinedText).not.toContain('Exclusive premium musk scent from Tenant B.');
  });
});
