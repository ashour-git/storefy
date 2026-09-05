import { describe, expect, it } from 'vitest';
import { mergeGeneratedDesign } from '../store-design-apply';

describe('mergeGeneratedDesign', () => {
  it('merges generated tokens over current tokens and replaces blocks', () => {
    const result = mergeGeneratedDesign(
      { primaryColor: '#111111', customCss: '.x{}' },
      { tokens: { primaryColor: '#0e7c6b' }, blocks: [{ id: 'a', type: 'hero', settings: {} }] }
    );
    expect(result.tokens).toMatchObject({ primaryColor: '#0e7c6b', customCss: '.x{}' });
    expect(result.blocks).toEqual([{ id: 'a', type: 'hero', settings: {} }]);
  });

  it('ignores empty generated payloads', () => {
    const current = { primaryColor: '#111111' };
    expect(mergeGeneratedDesign(current, null)).toEqual({ tokens: current, blocks: null });
  });
});
