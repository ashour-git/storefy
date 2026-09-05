// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

import { OnboardingChecklist } from '../OnboardingChecklist';

afterEach(() => cleanup());

const PROPS = {
  storeId: 'store-1',
  storeSlug: 'attar-cairo',
  onboardingComplete: false,
  productCount: 0,
  hasTheme: false,
  hasPaymob: false,
  shippingZones: 0,
};

describe('OnboardingChecklist', () => {
  it('marks the product step complete once an active product exists', () => {
    render(<OnboardingChecklist {...PROPS} productCount={2} />);
    const subtitle = document.querySelector('.onboarding-subtitle');
    expect(subtitle?.textContent).toContain('1 of 6 steps completed');
    expect(document.querySelectorAll('.onboarding-item.complete')).toHaveLength(1);
  });

  it('exposes every incomplete step as a keyboard-focusable link', () => {
    render(<OnboardingChecklist {...PROPS} />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    links[0].focus();
    expect(document.activeElement).toBe(links[0]);
  });

  it('hides entirely once setup is marked complete', () => {
    const { container } = render(<OnboardingChecklist {...PROPS} onboardingComplete />);
    expect(container.innerHTML).toBe('');
  });
});
