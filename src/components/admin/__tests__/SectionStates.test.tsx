// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { SectionSkeleton, SectionError, SectionEmpty } from '../SectionStates';

afterEach(() => cleanup());

describe('SectionSkeleton', () => {
  it('announces loading status to assistive tech', () => {
    render(<SectionSkeleton label="Loading revenue" />);
    expect(screen.getByRole('status').textContent).toContain('Loading revenue');
  });
});

describe('SectionError', () => {
  it('shows the message with a keyboard-focusable retry button', () => {
    const onRetry = vi.fn();
    render(<SectionError message="Revenue failed to load" onRetry={onRetry} />);
    expect(screen.getByRole('alert').textContent).toContain('Revenue failed to load');
    const retry = screen.getByRole('button', { name: /try again/i });
    retry.focus();
    expect(document.activeElement).toBe(retry);
    fireEvent.click(retry);
    expect(onRetry).toHaveBeenCalledOnce();
  });
});

describe('SectionEmpty', () => {
  it('shows guidance with an optional action', () => {
    const onAction = vi.fn();
    render(
      <SectionEmpty
        title="No orders yet"
        description="Share your store link to get the first sale."
        actionLabel="Copy store link"
        onAction={onAction}
      />
    );
    expect(screen.getByRole('heading', { name: 'No orders yet' })).toBeDefined();
    expect(screen.getByText(/share your store link/i)).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Copy store link' }));
    expect(onAction).toHaveBeenCalledOnce();
  });

  it('renders without an action button when none is given', () => {
    render(<SectionEmpty title="Nothing here" description="All caught up." />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
