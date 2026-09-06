import { describe, expect, it } from 'vitest';
import { BLOCK_TYPES, createBlock } from '../block-types';

describe('BLOCK_TYPES', () => {
  it('covers all twelve section types', () => {
    expect(BLOCK_TYPES).toEqual([
      'promo', 'hero', 'features', 'collection', 'testimonials', 'newsletter',
      'gallery', 'faq', 'trustStrip', 'categoryTiles', 'spotlight', 'benefits',
    ]);
  });
});

describe('createBlock', () => {
  it('builds a visible block with type defaults', () => {
    const block = createBlock('hero');
    expect(block.type).toBe('hero');
    expect(block.settings.hidden).toBe(false);
    expect(block.settings.title).toBeTruthy();
    expect(typeof block.id).toBe('string');
  });

  it('seeds item-based types with starter items', () => {
    expect(createBlock('faq').settings.items).toHaveLength(2);
    expect(createBlock('features').settings.items).toHaveLength(3);
  });
});
