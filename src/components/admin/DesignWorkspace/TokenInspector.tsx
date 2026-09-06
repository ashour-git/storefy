'use client';

import { useState } from 'react';

interface TokenInspectorProps {
  tokens: Record<string, unknown>;
  onTokenChange: (key: string, value: string) => void;
}

function isColorKey(key: string): boolean {
  return /color|background/i.test(key);
}

export function TokenInspector({ tokens, onTokenChange }: TokenInspectorProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section aria-label="Token inspector">
      <button type="button" onClick={() => setCollapsed((c) => !c)}>
        {collapsed ? 'Expand tokens' : 'Collapse tokens'}
      </button>
      {!collapsed && (
        <div>
          {Object.entries(tokens)
            .filter(([, value]) => typeof value === 'string' || typeof value === 'number')
            .map(([key, value]) => (
              <div key={key}>
                <label htmlFor={`token-${key}`}>{key}</label>
                {isColorKey(key) ? (
                  <input
                    id={`token-${key}`}
                    type="color"
                    value={String(value)}
                    onChange={(e) => onTokenChange(key, e.target.value)}
                  />
                ) : null}
                <input
                  id={`token-${key}-text`}
                  aria-label={`${key} value`}
                  type="text"
                  value={String(value)}
                  onChange={(e) => onTokenChange(key, e.target.value)}
                  className="studio-mono"
                />
              </div>
            ))}
        </div>
      )}
    </section>
  );
}
