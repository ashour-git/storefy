// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { BriefPanel } from '../BriefPanel';

afterEach(() => cleanup());

describe('BriefPanel', () => {
  it('opens the brief form from a single entry button', () => {
    render(<BriefPanel generating={false} onGenerate={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: /generate my look/i }));
    expect(screen.getByRole('dialog', { name: /generate store look/i })).toBeDefined();
    expect(screen.getByLabelText(/brand mood/i)).toBeDefined();
  });

  it('shows the last generation transcript with source and warnings', () => {
    render(
      <BriefPanel
        generating={false}
        onGenerate={() => undefined}
        lastResult={{ source: 'fallback', warnings: ['Applied the default look instead.'] }}
      />
    );
    expect(screen.getByText(/fallback/i)).toBeDefined();
    expect(screen.getByText(/default look instead/i)).toBeDefined();
  });

  it('shows no transcript before the first generation', () => {
    const { container } = render(<BriefPanel generating={false} onGenerate={() => undefined} />);
    expect(container.querySelector('[data-testid="brief-transcript"]')).toBeNull();
  });
});
