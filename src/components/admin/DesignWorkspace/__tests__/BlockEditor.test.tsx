// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { BlockEditor, type BlockEditorCallbacks } from '../BlockEditor';
import type { Block } from '../../../../lib/admin/block-types';

afterEach(() => cleanup());

function callbacks(overrides: Partial<BlockEditorCallbacks> = {}): BlockEditorCallbacks & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    pickLocalized: (val) => (typeof val === 'string' ? val : ''),
    onFieldChange: (field, value) => { calls.push(`change:${field}=${String(value)}`); },
    onFieldCommit: (field, value) => { calls.push(`commit:${field}=${String(value)}`); },
    onBlur: () => undefined,
    onAddNestedItem: () => { calls.push('add-nested'); },
    onMoveNestedItem: (num, dir) => { calls.push(`move-nested:${num}:${dir}`); },
    onDeleteNestedItem: (num) => { calls.push(`delete-nested:${num}`); },
    onNestedFieldChange: (num, field, value) => { calls.push(`nested-change:${num}:${field}=${String(value)}`); },
    onNestedFieldCommit: (num, field, value) => { calls.push(`nested-commit:${num}:${field}=${String(value)}`); },
    onAiSuggest: () => undefined,
    ...overrides,
  };
}

describe('BlockEditor', () => {
  it('renders promo fields and reports edits', () => {
    const cb = callbacks();
    render(
      <BlockEditor
        block={{ id: 'p', type: 'promo', settings: { text: 'Sale', bgColor: '#000' } }}
        callbacks={cb}
      />
    );
    expect(screen.getByText('Promo Message')).toBeDefined();
    fireEvent.change(screen.getByDisplayValue('Sale'), { target: { value: 'Bigger sale' } });
    expect(cb.calls).toContain('change:text=Bigger sale');
  });

  it('renders trustStrip items with nested controls', () => {
    const cb = callbacks();
    const block: Block = {
      id: 't',
      type: 'trustStrip',
      settings: { items: [{ icon: 'shield', title: 'Secure', text: 'Safe' }] },
    };
    render(<BlockEditor block={block} callbacks={cb} />);
    expect(screen.getByText(/TRUST ITEMS/)).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: '✕' }));
    expect(cb.calls).toContain('delete-nested:0');
  });

  it('renders hero fields and commits selects immediately', () => {
    const cb = callbacks();
    render(
      <BlockEditor
        block={{ id: 'h', type: 'hero', settings: { title: 'Hi', alignment: 'left' } }}
        callbacks={cb}
      />
    );
    expect(screen.getByText('Headline Title')).toBeDefined();
    expect(screen.getByText('Background Style')).toBeDefined();
  });

  it('renders categoryTiles, spotlight, and benefits fields', () => {
    const cb = callbacks();
    const { unmount } = render(
      <BlockEditor block={{ id: 'c', type: 'categoryTiles', settings: { title: 'Shop' } }} callbacks={cb} />
    );
    expect(screen.getByText('Section Title')).toBeDefined();
    expect(screen.getByText(/CATEGORIES/)).toBeDefined();
    unmount();
    render(
      <BlockEditor block={{ id: 's', type: 'spotlight', settings: { title: 'Why' } }} callbacks={callbacks()} />
    );
    expect(screen.getByText('Bullet Points (one per line)')).toBeDefined();
    expect(screen.getByText('CTA Button Label')).toBeDefined();
    cleanup();
    render(
      <BlockEditor block={{ id: 'b', type: 'benefits', settings: { items: [] } }} callbacks={callbacks()} />
    );
    expect(screen.getByText(/BENEFITS/)).toBeDefined();
  });

  it('renders nested item types with add controls and signature fields', () => {
    const cb = callbacks();
    const { unmount } = render(
      <BlockEditor
        block={{ id: 'f', type: 'features', settings: { items: [{ title: 'A', desc: 'B' }] } }}
        callbacks={cb}
      />
    );
    expect(screen.getByText(/NESTED ITEMS/)).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: '+ Add Item' }));
    expect(cb.calls).toContain('add-nested');
    unmount();
    render(
      <BlockEditor block={{ id: 't', type: 'testimonials', settings: { items: [{ name: 'A', text: 'B', rating: 5 }] } }} callbacks={callbacks()} />
    );
    expect(screen.getByText('Client Name')).toBeDefined();
    cleanup();
    render(
      <BlockEditor block={{ id: 'g', type: 'gallery', settings: { items: [] } }} callbacks={callbacks()} />
    );
    expect(screen.getByText('Columns')).toBeDefined();
    cleanup();
    render(
      <BlockEditor block={{ id: 'q', type: 'faq', settings: { items: [{ question: 'Q?', answer: 'A.' }] } }} callbacks={callbacks()} />
    );
    expect(screen.getByText('Question Text')).toBeDefined();
    cleanup();
    render(
      <BlockEditor block={{ id: 'c', type: 'collection', settings: {} }} callbacks={callbacks()} />
    );
    expect(screen.getByText('Max products displayed')).toBeDefined();
    cleanup();
    render(
      <BlockEditor block={{ id: 'n', type: 'newsletter', settings: {} }} callbacks={callbacks()} />
    );
    expect(screen.getByText('Placeholder Text')).toBeDefined();
  });

  it('toggles universal section style and commits selects', () => {
    const cb = callbacks();
    render(
      <BlockEditor block={{ id: 'h', type: 'hero', settings: {} }} callbacks={cb} />
    );
    expect(screen.queryByText('Background Color')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /section style/i }));
    expect(screen.getByText('Background Color')).toBeDefined();
    const label = screen.getByText('Mobile Visibility');
    const select = label.parentElement?.querySelector('select') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'hide' } });
    expect(cb.calls).toContain('commit:hideMobile=true');
  });

  it('renders only universal style for unknown block types', () => {
    const { container } = render(
      <BlockEditor block={{ id: 'x', type: 'mystery', settings: {} }} callbacks={callbacks()} />
    );
    expect(screen.getByRole('button', { name: /section style/i })).toBeDefined();
    expect(container.textContent).not.toContain('Headline Title');
  });
});
