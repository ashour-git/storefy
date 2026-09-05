// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BriefingTab } from '../BriefingTab';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const AI_BRIEFING = {
  insights: [
    { type: 'tip', title: 'Push COD', description: 'Most orders are cash on delivery.', action: 'Feature COD at checkout.' },
  ],
  source: 'ai',
};

describe('BriefingTab', () => {
  it('fetches the briefing on mount and labels the AI source', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(AI_BRIEFING), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    render(<BriefingTab />);
    expect(fetchMock).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.getByText('Push COD')).toBeDefined());
    expect(screen.getByText(/ai briefing/i)).toBeDefined();
  });

  it('labels the deterministic fallback instead of hiding it', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ ...AI_BRIEFING, source: 'fallback' }), { status: 200 }))
    );
    render(<BriefingTab />);
    await waitFor(() => expect(screen.getByText('Push COD')).toBeDefined());
    expect(screen.getByText(/offline briefing/i)).toBeDefined();
  });

  it('retries after a failed load', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ error: 'busy' }), { status: 500 }));
    vi.stubGlobal('fetch', fetchMock);
    render(<BriefingTab />);
    await waitFor(() => expect(screen.getByRole('button', { name: /try again/i })).toBeDefined());
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
