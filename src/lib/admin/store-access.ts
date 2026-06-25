import { headers } from 'next/headers';
import { auth } from '../auth';
import { getActiveStore } from './active-store';

export async function getOwnedStore() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { session: null, store: null };
    const store = await getActiveStore(session.user.id);
    return { session, store };
  } catch (e) {
    console.error('[store-access] Failed:', e);
    return { session: null, store: null };
  }
}
