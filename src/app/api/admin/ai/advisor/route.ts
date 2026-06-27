import { NextResponse } from 'next/server';
import { auth } from '../../../../../lib/auth';
import { headers } from 'next/headers';
import { getActiveStore } from '../../../../../lib/admin/active-store';
import { getGroqCompletion } from '../../../../../lib/ai/groq';
import { db } from '../../../../../db';
import * as schema from '../../../../../db/schema';
import { eq, desc } from 'drizzle-orm';

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const store = await getActiveStore(session.user.id);
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const { messages } = await req.json();
  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'Messages required' }, { status: 400 });
  }

  try {
    // 1. Fetch some basic store context to feed the AI
    const recentOrders = await db.query.orders.findMany({
      where: eq(schema.orders.tenantId, store.id),
      orderBy: [desc(schema.orders.createdAt)],
      limit: 10,
    });
    
    const productsCountQuery = await db.select({ count: schema.products.id }).from(schema.products).where(eq(schema.products.tenantId, store.id));
    const totalProducts = productsCountQuery.length;

    // Calculate revenue from recent orders
    const recentRevenue = recentOrders.reduce((sum, o) => sum + parseFloat(o.total || '0'), 0);

    const systemPrompt = `
You are the Storefy Business Advisor, an expert e-commerce consultant for a merchant.
Store Name: ${store.name}
Category: ${store.category || 'Retail'}
Recent Orders (Last 10): ${recentOrders.length}
Recent Revenue: ${recentRevenue} EGP
Total Products in Catalog: ${totalProducts}

Your goal is to help the merchant grow their business. You can analyze data, suggest marketing campaigns, help write copy, and give actionable advice.
Be concise, encouraging, and use formatting (bullet points, bold text) to make your advice readable.
`;

    // 2. Ensure only user and assistant roles are passed to Groq (plus our system prompt)
    const validMessages = messages.filter(m => m.role === 'user' || m.role === 'assistant').map(m => ({
      role: m.role,
      content: m.content
    }));

    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...validMessages
    ];

    const reply = await getGroqCompletion(fullMessages, { model: 'llama-3.3-70b-versatile', temperature: 0.7 });

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Advisor Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
