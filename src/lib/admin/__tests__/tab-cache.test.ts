import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTabCache } from '../tab-cache';

describe('createTabCache', () => {
  afterEach(() => vi.useRealTimers());

  it('returns cached data within the TTL without calling the loader again', async () => {
    vi.useFakeTimers();
    const cache = createTabCache<string>(60_000);
    const loader = vi.fn(async () => 'fresh');
    await expect(cache.load('t1:tasks', loader)).resolves.toBe('fresh');
    vi.advanceTimersByTime(30_000);
    await expect(cache.load('t1:tasks', loader)).resolves.toBe('fresh');
    expect(loader).toHaveBeenCalledOnce();
  });

  it('refetches once the TTL expires', async () => {
    vi.useFakeTimers();
    const cache = createTabCache<string>(60_000);
    const loader = vi.fn(async () => 'fresh');
    await cache.load('t1:tasks', loader);
    vi.advanceTimersByTime(61_000);
    await cache.load('t1:tasks', loader);
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('does not cache loader failures', async () => {
    vi.useFakeTimers();
    const cache = createTabCache<string>(60_000);
    const failing = vi.fn(async () => {
      throw new Error('down');
    });
    await expect(cache.load('t1:tasks', failing)).rejects.toThrow('down');
    const recovery = vi.fn(async () => 'recovered');
    await expect(cache.load('t1:tasks', recovery)).resolves.toBe('recovered');
    expect(recovery).toHaveBeenCalledOnce();
  });
});
