import { describe, expect, it, vi } from 'vitest';
import { generateStoreDesign } from '../store-design';

const VALID_PAYLOAD = {
  tokens: {
    primaryColor: '#0e7c6b',
    backgroundColor: '#ffffff',
    textColor: '#101619',
    fontFamily: 'Inter',
  },
  blocks: [{ type: 'hero' }, { type: 'collection' }, { type: 'footer' }],
};

describe('generateStoreDesign', () => {
  it('passes through a valid generated design', async () => {
    const complete = vi.fn(async () => JSON.stringify(VALID_PAYLOAD));
    const result = await generateStoreDesign(
      { storeName: 'Scent Palace', category: 'Perfumes', locale: 'en' },
      { complete }
    );
    expect(complete).toHaveBeenCalledOnce();
    expect(result.source).toBe('ai');
    expect(result.design.tokens?.primaryColor).toBe('#0e7c6b');
    expect(Array.isArray(result.design.blocks)).toBe(true);
  });

  it('retries once on invalid output, then falls back labeled', async () => {
    const complete = vi.fn(async () => JSON.stringify({ tokens: {}, blocks: [] }));
    const result = await generateStoreDesign(
      { storeName: 'Scent Palace', category: 'Perfumes', locale: 'en' },
      { complete }
    );
    expect(complete).toHaveBeenCalledTimes(2);
    expect(result.source).toBe('fallback');
    const hero = (result.design.blocks as Array<{ type?: string }>).find((b) => b.type === 'hero');
    expect(hero).toBeDefined();
  });

  it('falls back labeled when the provider is down', async () => {
    const complete = vi.fn(async () => {
      throw new Error('AI provider temporarily unavailable');
    });
    const result = await generateStoreDesign(
      { storeName: 'Scent Palace', category: 'Perfumes', locale: 'en' },
      { complete }
    );
    expect(result.source).toBe('fallback');
    expect(Array.isArray(result.design.blocks)).toBe(true);
  });
});
