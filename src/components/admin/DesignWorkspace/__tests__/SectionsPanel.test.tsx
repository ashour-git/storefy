// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { SectionsPanel } from '../SectionsPanel';
import type { SectionBlock } from '../../../../lib/admin/block-types';

afterEach(() => cleanup());

const BLOCKS: SectionBlock[] = [
  { id: 'a', type: 'hero', settings: {} },
  { id: 'b', type: 'faq', settings: { hidden: true } },
];

describe('SectionsPanel', () => {
  it('lists sections with move, hide, and delete controls', () => {
    const onMove = vi.fn();
    const onToggleHidden = vi.fn();
    const onDelete = vi.fn();
    render(
      <SectionsPanel
        blocks={BLOCKS}
        onMove={onMove}
        onToggleHidden={onToggleHidden}
        onDelete={onDelete}
        onAdd={() => undefined}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /move faq up/i }));
    expect(onMove).toHaveBeenCalledWith(1, 'up');
    fireEvent.click(screen.getByRole('button', { name: /unhide faq/i }));
    expect(onToggleHidden).toHaveBeenCalledWith(1);
    fireEvent.click(screen.getByRole('button', { name: /delete hero/i }));
    expect(onDelete).toHaveBeenCalledWith(0);
  });

  it('offers all twelve block types for adding', () => {
    const onAdd = vi.fn();
    render(
      <SectionsPanel blocks={[]} onMove={() => undefined} onToggleHidden={() => undefined} onDelete={() => undefined} onAdd={onAdd} />
    );
    fireEvent.click(screen.getByRole('button', { name: /add testimonials/i }));
    expect(onAdd).toHaveBeenCalledWith('testimonials');
  });
});
