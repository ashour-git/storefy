import { NextResponse } from 'next/server';
import { auth } from '../../../../../lib/auth';
import { headers } from 'next/headers';
import { generateStoreLayout } from '../../../../../lib/ai/layout';

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { category, description, locale } = await req.json();

  try {
    const result = await generateStoreLayout(category, description, locale || 'ar');
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Layout AI Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}