'use client';

import { useCallback, useEffect, useState } from 'react';
import { SectionEmpty, SectionError, SectionSkeleton } from './SectionStates';

interface BriefingInsight {
  type: string;
  title: string;
  description: string;
  action?: string;
}

type BriefingState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; insights: BriefingInsight[]; source: 'ai' | 'fallback' };

export function BriefingTab() {
  const [state, setState] = useState<BriefingState>({ status: 'loading' });

  const load = useCallback(async (signal?: AbortSignal) => {
    setState({ status: 'loading' });
    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
        signal,
      });
      if (!response.ok) throw new Error(`briefing-${response.status}`);
      const data = (await response.json()) as {
        insights?: BriefingInsight[];
        source?: 'ai' | 'fallback';
      };
      if (!Array.isArray(data.insights)) throw new Error('briefing-malformed');
      setState({ status: 'ready', insights: data.insights, source: data.source === 'ai' ? 'ai' : 'fallback' });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setState({ status: 'error' });
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  if (state.status === 'loading') return <SectionSkeleton label="Loading briefing" />;
  if (state.status === 'error') {
    return <SectionError message="Briefing failed to load." onRetry={() => load()} />;
  }
  if (state.insights.length === 0) {
    return <SectionEmpty title="No briefing today" description="Check back after your next sale." />;
  }
  return (
    <div>
      <p className="admin-briefing-source">
        {state.source === 'ai' ? 'AI briefing' : 'Offline briefing — generated without AI'}
      </p>
      <ul className="admin-task-list">
        {state.insights.map((insight) => (
          <li key={insight.title}>
            <strong>{insight.title}</strong>
            <p>{insight.description}</p>
            {insight.action && <p>{insight.action}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
