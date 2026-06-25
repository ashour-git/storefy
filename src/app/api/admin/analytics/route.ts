import { NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import { headers } from 'next/headers';
import { getActiveStore } from '../../../../lib/admin/active-store';
import { interpretAnalyticsQuery } from '../../../../lib/ai/analytics';

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const store = await getActiveStore(session.user.id);
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const { query } = await req.json();
  if (!query) return NextResponse.json({ error: 'No query provided' }, { status: 400 });

  try {
    const schemaSummary = "Tables: orders (id, subtotal, grand_total, created_at, status), products (id, name, base_price), customers (id, name, created_at)";
    const result = await interpretAnalyticsQuery(query, schemaSummary);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Analytics AI Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}