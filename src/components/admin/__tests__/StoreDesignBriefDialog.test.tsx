// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { StoreDesignBriefDialog } from '../StoreDesignBriefDialog';

afterEach(() => cleanup());

describe('StoreDesignBriefDialog', () => {
  it('submits the brief and allows skipping every field', () => {
    const onGenerate = vi.fn();
    render(<StoreDesignBriefDialog open generating={false} onClose={() => undefined} onGenerate={onGenerate} />);
    fireEvent.change(screen.getByLabelText(/brand mood/i), { target: { value: 'calm luxury' } });
    fireEvent.click(screen.getByRole('button', { name: /generate my look/i }));
    expect(onGenerate).toHaveBeenCalledWith({ mood: 'calm luxury', audience: undefined, colorInstinct: undefined });
  });

  it('shows fallback warnings when provided', () => {
    render(
      <StoreDesignBriefDialog
        open
        generating={false}
        warnings={['Applied the default look instead.']}
        onClose={() => undefined}
        onGenerate={() => undefined}
      />
    );
    expect(screen.getByText(/default look instead/i)).toBeDefined();
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <StoreDesignBriefDialog open={false} generating={false} onClose={() => undefined} onGenerate={() => undefined} />
    );
    expect(container.innerHTML).toBe('');
  });
});
