interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export function createTabCache<T>(ttlMs: number) {
  const entries = new Map<string, CacheEntry<T>>();

  async function load(key: string, loader: () => Promise<T>): Promise<T> {
    const hit = entries.get(key);
    if (hit && hit.expiresAt > Date.now()) return hit.value;
    const value = await loader();
    entries.set(key, { value, expiresAt: Date.now() + ttlMs });
    return value;
  }

  function invalidate(key: string): void {
    entries.delete(key);
  }

  return { load, invalidate };
}
