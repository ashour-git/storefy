'use client';

import { useState } from 'react';

export interface StoreDesignBriefInput {
  mood?: string;
  audience?: string;
  colorInstinct?: string;
}

interface StoreDesignBriefDialogProps {
  open: boolean;
  generating: boolean;
  warnings?: string[];
  onClose: () => void;
  onGenerate: (brief: StoreDesignBriefInput) => void;
}

export function StoreDesignBriefDialog({ open, generating, warnings, onClose, onGenerate }: StoreDesignBriefDialogProps) {
  const [mood, setMood] = useState('');
  const [audience, setAudience] = useState('');
  const [colorInstinct, setColorInstinct] = useState('');

  if (!open) return null;

  const submit = () => {
    onGenerate({
      mood: mood.trim() || undefined,
      audience: audience.trim() || undefined,
      colorInstinct: colorInstinct.trim() || undefined,
    });
  };

  return (
    <div role="dialog" aria-label="Generate store look" className="admin-modal-overlay">
      <div className="admin-modal">
        <h3>Generate my look</h3>
        <p>Answer what you like, or skip everything — the AI designs from your products.</p>
        <label htmlFor="design-brief-mood">Brand mood</label>
        <input
          id="design-brief-mood"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          placeholder="e.g. calm luxury"
          className="customizer-input"
        />
        <label htmlFor="design-brief-audience">Audience</label>
        <input
          id="design-brief-audience"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          placeholder="e.g. young professionals"
          className="customizer-input"
        />
        <label htmlFor="design-brief-color">Color instinct</label>
        <input
          id="design-brief-color"
          value={colorInstinct}
          onChange={(e) => setColorInstinct(e.target.value)}
          placeholder="e.g. deep greens"
          className="customizer-input"
        />
        {warnings && warnings.length > 0 && (
          <ul>
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        )}
        <div>
          <button type="button" onClick={onClose} disabled={generating}>
            Cancel
          </button>
          <button type="button" onClick={submit} disabled={generating}>
            {generating ? 'Generating…' : 'Generate my look'}
          </button>
        </div>
      </div>
    </div>
  );
}
