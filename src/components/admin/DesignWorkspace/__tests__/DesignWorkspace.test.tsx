// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { DesignWorkspace } from '../DesignWorkspace';

afterEach(() => cleanup());

describe('DesignWorkspace', () => {
  it('renders children inside the studio shell with quota context', () => {
    render(
      <DesignWorkspace storeName="Scent Palace" aiQuota={{ used: 3, limit: 25 }}>
        <p>legacy customizer</p>
      </DesignWorkspace>
    );
    expect(screen.getByText('legacy customizer')).toBeDefined();
    expect(screen.getByText(/3 of 25 AI generations used/i)).toBeDefined();
  });
});
