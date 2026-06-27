import { NextResponse } from 'next/server';
import { auth } from '../../../../../../lib/auth';
import { headers } from 'next/headers';
import { getActiveStore } from '../../../../../../lib/admin/active-store';
import { triggerMerchantPayout } from '../../../../../../lib/paymob';
import { db } from '../../../../../../db';
import * as schema from '../../../../../../db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const store = await getActiveStore(session.user.id);
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const { amount } = await req.json();
  if (!amount || isNaN(amount) || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  try {
    // Determine Paymob merchant ID or bank account
    // Assume merchant ID is saved in store.paymobSettings
    const settings: any = store.paymobSettings || {};
    const merchantId = settings.merchantId;

    if (!merchantId) {
      return NextResponse.json({ error: 'Paymob Merchant ID not configured. Please complete your payment settings.' }, { status: 400 });
    }

    // Call Paymob Disbursement/Payout API
    const success = await triggerMerchantPayout(merchantId, Math.round(amount * 100)); // Cents

    if (success) {
      return NextResponse.json({ success: true, message: 'Payout triggered successfully' });
    } else {
      return NextResponse.json({ error: 'Payout failed at payment gateway' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Payout Request Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
