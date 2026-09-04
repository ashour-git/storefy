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

const STOPWORDS = new Set(['the', 'and', 'for', 'with', 'what', 'how', 'are', 'is', 'do', 'you', 'your', 'ما', 'هل', 'في', 'على', 'من', 'ايه', 'ازاي', 'كم', 'اي']);

export function tokenizeQuery(query: string): string[] {
  return (query || '')
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.replace(/[^\p{L}\p{N}\-_.]/gu, ''))
    .filter((term) => term.length >= 2 && !STOPWORDS.has(term))
    .slice(0, 8);
}

function scoreChunk(content: string, terms: string[]): number {
  const lower = content.toLowerCase();
  let score = 0;
  for (const term of terms) {
    const occurrences = lower.split(term).length - 1;
    if (occurrences > 0) score += Math.min(occurrences, 3) * (term.length >= 5 ? 2 : 1);
    if (lower.includes(`product: ${term}`) || lower.includes(term)) score += 0.5;
  }
  if (content.startsWith('Product:')) score += 0.5;
  return score;
}

export async function retrieveTenantKnowledge(tenantId: string, query: string, limit = 6): Promise<RetrievedChunk[]> {
  const terms = tokenizeQuery(query);

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
        const ranked = matches
          .map((chunk) => ({
            id: chunk.id,
            sourceType: chunk.sourceType,
            sourceId: chunk.sourceId,
            content: chunk.content,
            score: scoreChunk(chunk.content || '', terms),
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
          .map(({ score: _score, ...rest }) => rest);
        return ranked;
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

export function chunksToContext(chunks: RetrievedChunk[], maxChars = 3500): string {
  const parts: string[] = [];
  let used = 0;
  chunks.forEach((chunk, index) => {
    const text = `[${index + 1}] ${chunk.sourceType}${chunk.sourceId ? `:${chunk.sourceId.slice(0, 8)}` : ''}\n${(chunk.content || '').slice(0, 900)}`;
    if (used + text.length > maxChars) return;
    parts.push(text);
    used += text.length;
  });
  return parts.join('\n\n');
}
