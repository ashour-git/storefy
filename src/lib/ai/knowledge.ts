import { and, desc, eq, ilike, or } from 'drizzle-orm';
import { withTenant } from '../../db';
import * as schema from '../../db/schema';

export interface RetrievedChunk {
  id: string;
  sourceType: string;
  sourceId: string | null;
  content: string;
}

export async function rebuildTenantKnowledge(tenantId: string): Promise<number> {
  return withTenant(tenantId, async (tx) => {
    await tx.delete(schema.knowledgeChunks).where(eq(schema.knowledgeChunks.tenantId, tenantId));

    const products = await tx.select().from(schema.products).where(eq(schema.products.status, 'active'));
    let inserted = 0;

    const variants = await tx.select().from(schema.productVariants).where(eq(schema.productVariants.tenantId, tenantId));
    const variantMap = new Map<string, { sku: string; stockQty: number }>();
    for (const v of variants) {
      if (!variantMap.has(v.productId)) variantMap.set(v.productId, { sku: v.sku, stockQty: v.stockQty });
    }

    for (const product of products) {
      const inv = variantMap.get(product.id);
      const stockInfo = inv ? `SKU: ${inv.sku}\nStock: ${inv.stockQty} units` : 'Stock: Check with store';
      const content = [
        `Product: ${product.name}`,
        `Description: ${product.description || 'No description yet.'}`,
        `Price: ${product.basePrice} ${product.currency}`,
        `Status: ${product.status}`,
        stockInfo,
      ].join('\n');

      await tx.insert(schema.knowledgeChunks).values({
        tenantId,
        sourceType: 'product',
        sourceId: product.id,
        content,
      });
      inserted += 1;
    }

    await tx.insert(schema.knowledgeChunks).values({
      tenantId,
      sourceType: 'policy',
      sourceId: null,
      content: 'Store policy: Online payment and cash on delivery may be available. Delivery timing and fees are confirmed at checkout or by store staff. Customers should contact the store for custom requests.',
    });
    inserted += 1;

    await tx.insert(schema.knowledgeChunks).values({
      tenantId,
      sourceType: 'faq',
      sourceId: null,
      content: 'FAQ: We accept online payments and cash on delivery where available. Delivery times vary by location. For order issues, contact store support. Returns are handled per store policy.',
    });
    inserted += 1;

    await tx.insert(schema.knowledgeChunks).values({
      tenantId,
      sourceType: 'faq',
      sourceId: null,
      content: 'FAQ: You can browse products by category. Use the search bar to find specific items. Each product page shows price, description, and availability. Contact us for custom orders or bulk purchases.',
    });
    inserted += 1;

    return inserted;
  });
}

export async function retrieveTenantKnowledge(tenantId: string, query: string, limit = 6): Promise<RetrievedChunk[]> {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.replace(/[^\p{L}\p{N}\-_.]/gu, ''))
    .filter((term) => term.length >= 2)
    .slice(0, 6);

  return withTenant(tenantId, async (tx) => {
    if (terms.length > 0) {
      const matches = await tx
        .select()
        .from(schema.knowledgeChunks)
        .where(and(
          eq(schema.knowledgeChunks.tenantId, tenantId),
          or(...terms.map((term) => ilike(schema.knowledgeChunks.content, `%${term}%`))),
        ))
        .orderBy(desc(schema.knowledgeChunks.updatedAt))
        .limit(limit);

      if (matches.length > 0) {
        return matches.map((chunk) => ({
          id: chunk.id,
          sourceType: chunk.sourceType,
          sourceId: chunk.sourceId,
          content: chunk.content,
        }));
      }
    }

    const fallback = await tx
      .select()
      .from(schema.knowledgeChunks)
      .where(eq(schema.knowledgeChunks.tenantId, tenantId))
      .orderBy(desc(schema.knowledgeChunks.updatedAt))
      .limit(limit);

    return fallback.map((chunk) => ({
      id: chunk.id,
      sourceType: chunk.sourceType,
      sourceId: chunk.sourceId,
      content: chunk.content,
    }));
  });
}

export function chunksToContext(chunks: RetrievedChunk[]): string {
  return chunks.map((chunk, index) => `[${index + 1}] ${chunk.sourceType}\n${chunk.content}`).join('\n\n');
}
