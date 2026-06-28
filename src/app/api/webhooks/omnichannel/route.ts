import { NextResponse } from 'next/server';
import { db } from '../../../../db';
import * as schema from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { parsePosOrder } from '../../../../lib/ai/pos';
import { retrieveTenantKnowledge } from '../../../../lib/ai/knowledge';

export async function POST(req: Request) {
  try {
    // Expected Payload: { storeId: "...", channel: "whatsapp" | "instagram", message: "...", customer: { phone: "...", name: "..." } }
    const body = await req.json();
    const { storeId, channel, message, customer } = body;

    if (!storeId || !message) {
      return NextResponse.json({ error: 'storeId and message are required' }, { status: 400 });
    }

    // Verify Store
    const store = await db.query.tenants.findFirst({
      where: eq(schema.tenants.id, storeId)
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // 1. Use AI POS parser to extract intent/order from natural language message
    const knowledge = await retrieveTenantKnowledge(store.id, message, 10);
    const context = knowledge.map(k => k.content).join('\n\n');
    
    let parsedOrder;
    try {
      parsedOrder = await parsePosOrder(message, context);
    } catch (e) {
      console.error("AI parsing failed for omnichannel message:", e);
      parsedOrder = { items: [], notes: message };
    }

    // 2. We can save this as a "Draft" order or a "Cart" depending on the business logic.
    // For simplicity, let's create a cart that the merchant can view in the POS or Orders view.
    const [cart] = await db.insert(schema.carts).values({
      tenantId: store.id,
      sessionId: crypto.randomUUID(),
      items: [{ ...parsedOrder.items?.[0] || {}, channel, customer, originalMessage: message, aiNotes: parsedOrder.notes }],
      status: 'active',
    }).returning();

    // In a real app, we'd trigger an Inngest event here to notify the merchant 
    // or reply to the customer via the channel's API.

    return NextResponse.json({ 
      success: true, 
      cartId: cart.id,
      parsedOrder 
    });

  } catch (error: any) {
    console.error('Omnichannel Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
