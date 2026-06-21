import { describe, it, expect, beforeAll } from 'vitest';
import * as dotenv from 'dotenv';
dotenv.config();

import { db } from '../index';
import * as schema from '../schema';
import StorefrontPage from '../../app/store/[slug]/page';

// Helper to recursively extract all text children from React Server Component JSX output
function extractTextFromJsx(node: any): string[] {
  if (!node) return [];
  if (typeof node === 'string' || typeof node === 'number') {
    return [String(node)];
  }
  if (Array.isArray(node)) {
    return node.flatMap(extractTextFromJsx);
  }
  const texts: string[] = [];
  if (node.props) {
    if (node.props.children) {
      texts.push(...extractTextFromJsx(node.props.children));
    }
  }
  return texts;
}

describe('Storefront Page End-to-End Tenant Isolation Integration Test', () => {
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

    // Seed Products directly using the privileged connection (bypassing RLS since we act as the seed runner)
    // Note: In actual runtime, products must carry the respective tenant_id
    await db.insert(schema.products).values([
      {
        tenantId: tenantAId,
        name: 'Oud Royal Scent',
        description: 'Exclusive premium oud scent from Tenant A.',
        basePrice: '2500.00',
      },
      {
        tenantId: tenantBId,
        name: 'Musk Supreme Scent',
        description: 'Exclusive premium musk scent from Tenant B.',
        basePrice: '1800.00',
      },
    ]);
  });

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
