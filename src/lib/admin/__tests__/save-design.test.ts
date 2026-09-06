import { describe, expect, it, vi } from 'vitest';
import { saveDesign } from '../save-design';

const PAYLOAD = {
  storeId: 'store-1',
  tokens: { primaryColor: '#0e7c6b' },
  blocks: [{ type: 'hero' }],
};

describe('saveDesign', () => {
  it('resolves ok on a 200 response', async () => {
    let seenUrl = '';
    let seenOptions: RequestInit = {};
    const fetchFn = vi.fn(async (url: string, options: RequestInit) => {
      seenUrl = url;
      seenOptions = options;
      return new Response('{}', { status: 200 });
    });
    await expect(saveDesign(PAYLOAD, fetchFn)).resolves.toEqual({ ok: true });
    expect(fetchFn).toHaveBeenCalledOnce();
    expect(seenUrl).toBe('/api/themes/customize');
    expect(seenOptions.method).toBe('POST');
    expect(JSON.parse(seenOptions.body as string)).toEqual(PAYLOAD);
  });

  it('resolves an error without throwing on failure', async () => {
    const fetchFn = vi.fn(async () => new Response(JSON.stringify({ error: 'Denied' }), { status: 403 }));
    await expect(saveDesign(PAYLOAD, fetchFn)).resolves.toEqual({ ok: false, error: 'Denied' });
  });

  it('resolves an error without throwing on network failure', async () => {
    const fetchFn = vi.fn(async () => {
      throw new Error('down');
    });
    await expect(saveDesign(PAYLOAD, fetchFn)).resolves.toEqual({
      ok: false,
      error: 'Failed to connect to customization API.',
    });
  });
});
