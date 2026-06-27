import { NextResponse } from 'next/server';
import { auth } from '../../../../../lib/auth';
import { headers } from 'next/headers';
import { db } from '../../../../../db';
import * as schema from '../../../../../db/schema';
import { eq, and } from 'drizzle-orm';
import { getActiveStore } from '../../../../../lib/admin/active-store';
import { getGroqCompletion } from '../../../../../lib/ai/groq';

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const store = await getActiveStore(session.user.id);
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const { instruction, blocks } = await req.json();

  if (!instruction || !blocks) {
    return NextResponse.json({ error: 'Instruction and blocks required' }, { status: 400 });
  }

  const prompt = `
You are an expert UI/UX copywriter and designer.
The user wants to tweak the following storefront blocks based on this instruction: "${instruction}"

Current Blocks:
${JSON.stringify(blocks, null, 2)}

Respond with the updated blocks array in valid JSON. Only modify text, colors, or visibility to match the user's intent. Do NOT change the block structure or IDs.

Respond with ONLY a JSON object:
{
  "updatedBlocks": [ ... ]
}
`;

  try {
    const result = await getGroqCompletion([
      { role: 'system', content: 'You are an AI block tweaker. Return ONLY valid JSON.' },
      { role: 'user', content: prompt }
    ], { json: true });

    const parsed = JSON.parse(result);
    
    // Update the database (assuming 'index' page for now)
    await db.update(schema.pages)
      .set({ blocks: parsed.updatedBlocks, updatedAt: new Date() })
      .where(and(eq(schema.pages.tenantId, store.id), eq(schema.pages.slug, 'index')));

    return NextResponse.json({ success: true, blocks: parsed.updatedBlocks });
  } catch (error: any) {
    console.error('AI Tweak Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
