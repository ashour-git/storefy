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

  it('renders nothing for unknown block types', () => {
    const { container } = render(
      <BlockEditor block={{ id: 'x', type: 'mystery', settings: {} }} callbacks={callbacks()} />
    );
    expect(container.textContent).toBe('');
  });
});
