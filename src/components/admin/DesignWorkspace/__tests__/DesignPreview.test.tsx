// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { DesignPreview } from '../DesignPreview';

afterEach(() => cleanup());

describe('DesignPreview', () => {
  it('loads the storefront preview URL with device param', () => {
    render(<DesignPreview storeSlug="scent-palace" device="mobile" highlightAi={false} />);
    const frame = document.querySelector('iframe');
    expect(frame?.getAttribute('src')).toBe('/store/scent-palace?preview=1&device=mobile');
  });

  it('switches device through links, not buttons', () => {
    render(<DesignPreview storeSlug="scent-palace" device="desktop" highlightAi={false} />);
    const mobileLink = screen.getByRole('link', { name: /mobile/i });
    expect(mobileLink.getAttribute('href')).toContain('device=mobile');
  });

  it('traces the brass hairline only for AI-applied tokens', () => {
    const { rerender, container } = render(
      <DesignPreview storeSlug="scent-palace" device="desktop" highlightAi={false} />
    );
    expect(container.querySelector('.studio-ai-hairline')).toBeNull();
    rerender(<DesignPreview storeSlug="scent-palace" device="desktop" highlightAi />);
    expect(container.querySelector('.studio-ai-hairline')).not.toBeNull();
  });
});
