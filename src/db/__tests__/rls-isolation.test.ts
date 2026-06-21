import { describe, it, expect, beforeAll } from 'vitest';
import * as dotenv from 'dotenv';
dotenv.config();

import { db, withTenant } from '../index';
import * as schema from '../schema';
import { eq } from 'drizzle-orm';

describe('Row Level Security (RLS) Isolation Tests', () => {
  let userAId: string;
  let userBId: string;
  let tenantAId: string;
  let tenantBId: string;

  beforeAll(async () => {
    // Create two dummy users
    const [userA] = await db
      .insert(schema.platformUsers)
      .values([
        { email: `userA-${Date.now()}@test.com`, name: 'User A' },
      ])
      .returning();
    userAId = userA.id;

    const [userB] = await db
      .insert(schema.platformUsers)
      .values([
        { email: `userB-${Date.now()}@test.com`, name: 'User B' },
      ])
      .returning();
    userBId = userB.id;

    // Create two dummy tenants
    const [tenantA] = await db
      .insert(schema.tenants)
      .values([
        { slug: `tenantA-${Date.now()}`, ownerId: userAId, name: 'Tenant A' },
      ])
      .returning();
    tenantAId = tenantA.id;

    const [tenantB] = await db
      .insert(schema.tenants)
      .values([
        { slug: `tenantB-${Date.now()}`, ownerId: userBId, name: 'Tenant B' },
      ])
      .returning();
    tenantBId = tenantB.id;
  });

  // 1. tenant_members
  it('tenant_members RLS policies', async () => {
    // Tenant A creates a member
    await withTenant(tenantAId, async (tx) => {
      await tx.insert(schema.tenantMembers).values({
        tenantId: tenantAId,
        userId: userAId,
        role: 'owner',
      });
    });

    // Tenant B should NOT see Tenant A's member
    await withTenant(tenantBId, async (tx) => {
      const members = await tx.select().from(schema.tenantMembers);
      expect(members.length).toBe(0);
    });

    // Tenant B should NOT be able to insert a member for Tenant A
    await expect(
      withTenant(tenantBId, async (tx) => {
        await tx.insert(schema.tenantMembers).values({
          tenantId: tenantAId,
          userId: userBId,
          role: 'manager',
        });
      })
    ).rejects.toThrow();
  });

  // 2. categories
  it('categories RLS policies', async () => {
    await withTenant(tenantAId, async (tx) => {
      await tx.insert(schema.categories).values({
        tenantId: tenantAId,
        name: 'Perfumes',
      });
    });

    await withTenant(tenantBId, async (tx) => {
      const cats = await tx.select().from(schema.categories);
      expect(cats.length).toBe(0);
    });

    await expect(
      withTenant(tenantBId, async (tx) => {
        await tx.insert(schema.categories).values({
          tenantId: tenantAId,
          name: 'Cheating Category',
        });
      })
    ).rejects.toThrow();
  });

  // 3. products
  it('products RLS policies', async () => {
    await withTenant(tenantAId, async (tx) => {
      await tx.insert(schema.products).values({
        tenantId: tenantAId,
        name: 'Oud Perfume',
        basePrice: '1500.00',
      });
    });

    await withTenant(tenantBId, async (tx) => {
      const prods = await tx.select().from(schema.products);
      expect(prods.length).toBe(0);
    });

    await expect(
      withTenant(tenantBId, async (tx) => {
        await tx.insert(schema.products).values({
          tenantId: tenantAId,
          name: 'Stolen Product',
          basePrice: '5.00',
        });
      })
    ).rejects.toThrow();
  });

  // 4. product_variants
  it('product_variants RLS policies', async () => {
    let prodAId: string;
    await withTenant(tenantAId, async (tx) => {
      const [prod] = await tx.insert(schema.products).values({
        tenantId: tenantAId,
        name: 'Oud Perfume v2',
        basePrice: '1200.00',
      }).returning();
      prodAId = prod.id;

      await tx.insert(schema.productVariants).values({
        tenantId: tenantAId,
        productId: prodAId,
        sku: 'OUD-50ML',
        stockQty: 10,
      });
    });

    await withTenant(tenantBId, async (tx) => {
      const vars = await tx.select().from(schema.productVariants);
      expect(vars.length).toBe(0);
    });

    await expect(
      withTenant(tenantBId, async (tx) => {
        await tx.insert(schema.productVariants).values({
          tenantId: tenantAId,
          productId: prodAId,
          sku: 'STOLEN-SKU',
          stockQty: 99,
        });
      })
    ).rejects.toThrow();
  });

  // 5. media
  it('media RLS policies', async () => {
    await withTenant(tenantAId, async (tx) => {
      await tx.insert(schema.media).values({
        tenantId: tenantAId,
        url: 'https://test.com/image.png',
      });
    });

    await withTenant(tenantBId, async (tx) => {
      const m = await tx.select().from(schema.media);
      expect(m.length).toBe(0);
    });

    await expect(
      withTenant(tenantBId, async (tx) => {
        await tx.insert(schema.media).values({
          tenantId: tenantAId,
          url: 'https://test.com/stolen.png',
        });
      })
    ).rejects.toThrow();
  });

  // 6. customers
  it('customers RLS policies', async () => {
    await withTenant(tenantAId, async (tx) => {
      await tx.insert(schema.customers).values({
        tenantId: tenantAId,
        email: 'customer@test.com',
        name: 'John Doe',
      });
    });

    await withTenant(tenantBId, async (tx) => {
      const c = await tx.select().from(schema.customers);
      expect(c.length).toBe(0);
    });

    await expect(
      withTenant(tenantBId, async (tx) => {
        await tx.insert(schema.customers).values({
          tenantId: tenantAId,
          email: 'customer-fake@test.com',
          name: 'Cheater',
        });
      })
    ).rejects.toThrow();
  });

  // 7. discounts
  it('discounts RLS policies', async () => {
    await withTenant(tenantAId, async (tx) => {
      await tx.insert(schema.discounts).values({
        tenantId: tenantAId,
        code: 'SAVE10',
        type: 'percent',
        value: '10.00',
      });
    });

    await withTenant(tenantBId, async (tx) => {
      const d = await tx.select().from(schema.discounts);
      expect(d.length).toBe(0);
    });

    await expect(
      withTenant(tenantBId, async (tx) => {
        await tx.insert(schema.discounts).values({
          tenantId: tenantAId,
          code: 'FAKE10',
          type: 'fixed',
          value: '10.00',
        });
      })
    ).rejects.toThrow();
  });

  // 8. orders
  it('orders RLS policies', async () => {
    await withTenant(tenantAId, async (tx) => {
      await tx.insert(schema.orders).values({
        tenantId: tenantAId,
        channel: 'online',
        subtotal: '100.00',
        grandTotal: '100.00',
      });
    });

    await withTenant(tenantBId, async (tx) => {
      const o = await tx.select().from(schema.orders);
      expect(o.length).toBe(0);
    });

    await expect(
      withTenant(tenantBId, async (tx) => {
        await tx.insert(schema.orders).values({
          tenantId: tenantAId,
          channel: 'pos',
          subtotal: '200.00',
          grandTotal: '200.00',
        });
      })
    ).rejects.toThrow();
  });

  // 9. order_items
  it('order_items RLS policies', async () => {
    let orderAId: string;
    let variantAId: string;

    await withTenant(tenantAId, async (tx) => {
      // Setup dependencies
      const [prod] = await tx.insert(schema.products).values({
        tenantId: tenantAId,
        name: 'Oud Perfume v3',
        basePrice: '1200.00',
      }).returning();

      const [variant] = await tx.insert(schema.productVariants).values({
        tenantId: tenantAId,
        productId: prod.id,
        sku: 'OUD-100ML',
        stockQty: 5,
      }).returning();
      variantAId = variant.id;

      const [order] = await tx.insert(schema.orders).values({
        tenantId: tenantAId,
        channel: 'online',
        subtotal: '1200.00',
        grandTotal: '1200.00',
      }).returning();
      orderAId = order.id;

      await tx.insert(schema.orderItems).values({
        tenantId: tenantAId,
        orderId: orderAId,
        variantId: variantAId,
        quantity: 1,
        unitPrice: '1200.00',
      });
    });

    await withTenant(tenantBId, async (tx) => {
      const items = await tx.select().from(schema.orderItems);
      expect(items.length).toBe(0);
    });

    await expect(
      withTenant(tenantBId, async (tx) => {
        await tx.insert(schema.orderItems).values({
          tenantId: tenantAId,
          orderId: orderAId,
          variantId: variantAId,
          quantity: 2,
          unitPrice: '1200.00',
        });
      })
    ).rejects.toThrow();
  });

  // 10. payments
  it('payments RLS policies', async () => {
    let orderAId: string;

    await withTenant(tenantAId, async (tx) => {
      const [order] = await tx.insert(schema.orders).values({
        tenantId: tenantAId,
        channel: 'online',
        subtotal: '500.00',
        grandTotal: '500.00',
      }).returning();
      orderAId = order.id;

      await tx.insert(schema.payments).values({
        tenantId: tenantAId,
        orderId: orderAId,
        provider: 'paymob',
        idempotencyKey: 'key-1234',
        amount: '500.00',
        status: 'initiated',
      });
    });

    await withTenant(tenantBId, async (tx) => {
      const p = await tx.select().from(schema.payments);
      expect(p.length).toBe(0);
    });

    await expect(
      withTenant(tenantBId, async (tx) => {
        await tx.insert(schema.payments).values({
          tenantId: tenantAId,
          orderId: orderAId,
          provider: 'cod',
          idempotencyKey: 'key-5678',
          amount: '500.00',
          status: 'initiated',
        });
      })
    ).rejects.toThrow();
  });

  // 11. themes
  it('themes RLS policies', async () => {
    await withTenant(tenantAId, async (tx) => {
      await tx.insert(schema.themes).values({
        tenantId: tenantAId,
        tokens: { primary: '#ff0000' },
      });
    });

    await withTenant(tenantBId, async (tx) => {
      const t = await tx.select().from(schema.themes);
      expect(t.length).toBe(0);
    });

    await expect(
      withTenant(tenantBId, async (tx) => {
        await tx.insert(schema.themes).values({
          tenantId: tenantAId,
          tokens: { primary: '#00ff00' },
        });
      })
    ).rejects.toThrow();
  });

  // 12. pages
  it('pages RLS policies', async () => {
    await withTenant(tenantAId, async (tx) => {
      await tx.insert(schema.pages).values({
        tenantId: tenantAId,
        slug: 'home',
        blocks: [{ type: 'hero' }],
      });
    });

    await withTenant(tenantBId, async (tx) => {
      const p = await tx.select().from(schema.pages);
      expect(p.length).toBe(0);
    });

    await expect(
      withTenant(tenantBId, async (tx) => {
        await tx.insert(schema.pages).values({
          tenantId: tenantAId,
          slug: 'about',
          blocks: [],
        });
      })
    ).rejects.toThrow();
  });

  // 13. knowledge_chunks
  it('knowledge_chunks RLS policies', async () => {
    await withTenant(tenantAId, async (tx) => {
      await tx.insert(schema.knowledgeChunks).values({
        tenantId: tenantAId,
        sourceType: 'faq',
        content: 'This is FAQ content',
        embedding: [0.1, 0.2, 0.3],
      });
    });

    await withTenant(tenantBId, async (tx) => {
      const chunks = await tx.select().from(schema.knowledgeChunks);
      expect(chunks.length).toBe(0);
    });

    await expect(
      withTenant(tenantBId, async (tx) => {
        await tx.insert(schema.knowledgeChunks).values({
          tenantId: tenantAId,
          sourceType: 'policy',
          content: 'This is policy content',
          embedding: [0.4, 0.5, 0.6],
        });
      })
    ).rejects.toThrow();
  });

  // 14. ai_conversations
  it('ai_conversations RLS policies', async () => {
    await withTenant(tenantAId, async (tx) => {
      await tx.insert(schema.aiConversations).values({
        tenantId: tenantAId,
        channel: 'storefront_chat',
        messages: [{ role: 'user', content: 'hello' }],
      });
    });

    await withTenant(tenantBId, async (tx) => {
      const convs = await tx.select().from(schema.aiConversations);
      expect(convs.length).toBe(0);
    });

    await expect(
      withTenant(tenantBId, async (tx) => {
        await tx.insert(schema.aiConversations).values({
          tenantId: tenantAId,
          channel: 'pos',
          messages: [],
        });
      })
    ).rejects.toThrow();
  });

  // 15. ai_agent_logs
  it('ai_agent_logs RLS policies', async () => {
    await withTenant(tenantAId, async (tx) => {
      await tx.insert(schema.aiAgentLogs).values({
        tenantId: tenantAId,
        processor: 'storefront_rag_agent',
        model: 'openai/gpt-oss-120b',
      });
    });

    await withTenant(tenantBId, async (tx) => {
      const logs = await tx.select().from(schema.aiAgentLogs);
      expect(logs.length).toBe(0);
    });

    await expect(
      withTenant(tenantBId, async (tx) => {
        await tx.insert(schema.aiAgentLogs).values({
          tenantId: tenantAId,
          processor: 'storefront_rag_agent',
          model: 'qwen/qwen3.6-27b',
        });
      })
    ).rejects.toThrow();
  });

  // 16. audit_log
  it('audit_log RLS policies', async () => {
    await withTenant(tenantAId, async (tx) => {
      await tx.insert(schema.auditLog).values({
        tenantId: tenantAId,
        action: 'UPDATE_PRODUCT',
      });
    });

    await withTenant(tenantBId, async (tx) => {
      const logs = await tx.select().from(schema.auditLog);
      expect(logs.length).toBe(0);
    });

    await expect(
      withTenant(tenantBId, async (tx) => {
        await tx.insert(schema.auditLog).values({
          tenantId: tenantAId,
          action: 'DELETE_PRODUCT',
        });
      })
    ).rejects.toThrow();
  });
});
