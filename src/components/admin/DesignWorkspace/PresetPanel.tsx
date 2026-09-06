'use client';

export interface PresetSummary {
  id: string;
  name: string;
  tokens: Record<string, unknown>;
}

interface PresetPanelProps {
  presets: PresetSummary[];
  onApply: (id: string) => void;
}

function swatchStyle(tokens: Record<string, unknown>): { background: string } {
  const primary = typeof tokens.primaryColor === 'string' ? tokens.primaryColor : '#1a1b1e';
  const background = typeof tokens.backgroundColor === 'string' ? tokens.backgroundColor : '#f7f5ef';
  return { background: `linear-gradient(135deg, ${primary} 50%, ${background} 50%)` };
}

export function PresetPanel({ presets, onApply }: PresetPanelProps) {
  return (
    <section aria-label="Preset themes">
      <ul>
        {presets.map((preset) => (
          <li key={preset.id}>
            <button type="button" onClick={() => onApply(preset.id)}>
              <span aria-hidden="true" style={swatchStyle(preset.tokens)} />
              {preset.name}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
