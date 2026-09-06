// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { PresetPanel } from '../PresetPanel';

afterEach(() => cleanup());

const PRESETS = [
  { id: 'classic-luxe', name: 'Classic Luxe', tokens: { primaryColor: '#b45309', backgroundColor: '#fafaf9' } },
  { id: 'nordic-minimal', name: 'Nordic Minimal', tokens: { primaryColor: '#111111', backgroundColor: '#ffffff' } },
];

describe('PresetPanel', () => {
  it('lists presets with names and applies on click', () => {
    const onApply = vi.fn();
    render(<PresetPanel presets={PRESETS} onApply={onApply} />);
    fireEvent.click(screen.getByRole('button', { name: /classic luxe/i }));
    expect(onApply).toHaveBeenCalledWith('classic-luxe');
  });

  it('renders every preset as a keyboard-focusable button', () => {
    render(<PresetPanel presets={PRESETS} onApply={() => undefined} />);
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });
});
