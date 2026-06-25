import { NextResponse } from 'next/server';
import { db } from '../../../db';
import { sql } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message }, { status: 500 });
  }
}
