import { describe, expect, it } from 'vitest';
import { ACTIVE_STORE_COOKIE, type StoreResolution } from '../admin/resolve-store';

describe('resolve-store', () => {
  it('exports correct cookie name', () => {
    expect(ACTIVE_STORE_COOKIE).toBe('sf-active-store');
  });

  it('has correct StoreResolution shape', () => {
    const resolution: StoreResolution = {
      session: null,
      store: null,
    };

    expect(resolution.session).toBeNull();
    expect(resolution.store).toBeNull();
  });
});
