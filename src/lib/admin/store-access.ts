// Backward-compatible re-export. New code should import from './resolve-store'.

import { resolveStore, type StoreResolution } from './resolve-store';

/**
 * @deprecated Use resolveStore() instead. This function is kept for backward compatibility.
 */
export async function getOwnedStore(): Promise<StoreResolution> {
  return resolveStore();
}
