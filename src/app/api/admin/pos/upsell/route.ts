import { NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import { headers } from 'next/headers';
import { getActiveStore } from '../../../../lib/admin/active-store';
import { suggestPosUpsell } from '../../../../lib/ai/pos';
import { retrieveTenantKnowledge } from '../../../../lib/ai/knowledge';

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const store = await getActiveStore(session.user.id);
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const { items } = await req.json();

  try {
    const knowledge = await retrieveTenantKnowledge(store.id, 'recommended products', 10);
    const context = knowledge.map(k => k.content).join('\n\n');
    const result = await suggestPosUpsell(items, context);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('POS Upsell Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}