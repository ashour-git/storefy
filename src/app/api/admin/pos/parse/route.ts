import { NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import { headers } from 'next/headers';
import { getActiveStore } from '../../../../lib/admin/active-store';
import { parsePosOrder } from '../../../../lib/ai/pos';
import { retrieveTenantKnowledge } from '../../../../lib/ai/knowledge';

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const store = await getActiveStore(session.user.id);
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const { text } = await req.json();
  if (!text) return NextResponse.json({ error: 'No text provided' }, { status: 400 });

  try {
    const knowledge = await retrieveTenantKnowledge(store.id, text, 10);
    const context = knowledge.map(k => k.content).join('\n\n');
    const result = await parsePosOrder(text, context);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('POS Parse Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}