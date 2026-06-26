// Backward-compatible re-exports. New code should import from './resolve-store'.

export { ACTIVE_STORE_COOKIE, resolveStore, resolveAllStores, switchStore, type StoreResolution } from './resolve-store';

import { resolveStore, type StoreResolution } from './resolve-store';

/**
 * @deprecated Use resolveStore() instead. This function is kept for backward compatibility.
 */
export async function getActiveStore(userId: string): Promise<StoreResolution['store']> {
  const { store } = await resolveStore();
  return store;
}

/**
 * @deprecated Use resolveStore() instead. This function is kept for backward compatibility.
 */
export async function getActiveStoreWithAll(userId: string): Promise<{ store: StoreResolution['store']; allStores: Array<StoreResolution['store'] & {}> }> {
  const { store } = await resolveStore();
  return { store, allStores: store ? [store] : [] };
}

/**
 * @deprecated Use resolveStore(request) instead. This function is kept for backward compatibility.
 */
export async function getActiveStoreFromRequest(request: Request, userId: string): Promise<StoreResolution['store']> {
  const { store } = await resolveStore(request);
  return store;
}
