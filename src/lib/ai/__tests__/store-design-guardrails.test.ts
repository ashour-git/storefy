import { describe, expect, it } from 'vitest';
import { validateStoreDesign } from '../store-design-guardrails';

const VALID = {
  tokens: {
    primaryColor: '#0e7c6b',
    backgroundColor: '#ffffff',
    textColor: '#101619',
    fontFamily: 'Inter',
    headingFontFamily: 'Cairo',
  },
  blocks: [{ type: 'hero' }, { type: 'collection' }, { type: 'footer' }],
};

describe('validateStoreDesign', () => {
  it('accepts a valid design with no warnings', () => {
    expect(validateStoreDesign(VALID)).toEqual({ ok: true, warnings: [] });
  });

  it('rejects text and background below AA contrast', () => {
    const result = validateStoreDesign({
      tokens: { ...VALID.tokens, textColor: '#cccccc', backgroundColor: '#ffffff' },
      blocks: VALID.blocks,
    });
    expect(result.ok).toBe(false);
    expect(result.warnings.some((w) => /contrast/i.test(w))).toBe(true);
  });

  it('rejects fonts outside the allowlist', () => {
    const result = validateStoreDesign({
      tokens: { ...VALID.tokens, fontFamily: 'Comic Sans MS' },
      blocks: VALID.blocks,
    });
    expect(result.ok).toBe(false);
    expect(result.warnings.some((w) => /font/i.test(w))).toBe(true);
  });

  it('rejects designs missing required blocks', () => {
    const result = validateStoreDesign({ tokens: VALID.tokens, blocks: [{ type: 'hero' }] });
    expect(result.ok).toBe(false);
    expect(result.warnings.some((w) => /collection|footer/i.test(w))).toBe(true);
  });
});
