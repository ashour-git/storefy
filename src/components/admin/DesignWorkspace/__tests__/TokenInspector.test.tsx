// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { TokenInspector } from '../TokenInspector';

afterEach(() => cleanup());

describe('TokenInspector', () => {
  it('renders a labeled control per token and reports edits', () => {
    const onTokenChange = vi.fn();
    render(
      <TokenInspector
        tokens={{ primaryColor: '#0e7c6b', borderRadius: '0.5rem' }}
        onTokenChange={onTokenChange}
      />
    );
    const input = screen.getByLabelText('primaryColor value') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '#111111' } });
    expect(onTokenChange).toHaveBeenCalledWith('primaryColor', '#111111');
  });

  it('collapses to a toggle button hiding all controls', () => {
    render(<TokenInspector tokens={{ primaryColor: '#0e7c6b' }} onTokenChange={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: /collapse tokens/i }));
    expect(screen.queryByLabelText(/primaryColor/i)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /expand tokens/i }));
    expect(screen.getByLabelText('primaryColor value')).toBeDefined();
  });
});
