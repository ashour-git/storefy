'use client';

import { useState } from 'react';
import {
  StoreDesignBriefDialog,
  type StoreDesignBriefInput,
} from '../StoreDesignBriefDialog';

export interface BriefTranscript {
  source: 'ai' | 'fallback';
  warnings: string[];
}

interface BriefPanelProps {
  generating: boolean;
  lastResult?: BriefTranscript | null;
  onGenerate: (brief: StoreDesignBriefInput) => void;
}

export function BriefPanel({ generating, lastResult, onGenerate }: BriefPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <section aria-label="AI design brief">
      <button type="button" onClick={() => setOpen(true)} disabled={generating}>
        Generate my look
      </button>
      <StoreDesignBriefDialog
        open={open}
        generating={generating}
        warnings={lastResult?.warnings}
        onClose={() => setOpen(false)}
        onGenerate={(brief) => {
          setOpen(false);
          onGenerate(brief);
        }}
      />
      {lastResult && (
        <div data-testid="brief-transcript">
          <p>
            Last generation: {lastResult.source === 'ai' ? 'AI bespoke look' : 'Default look (fallback)'}
          </p>
          {lastResult.warnings.length > 0 && (
            <ul>
              {lastResult.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
