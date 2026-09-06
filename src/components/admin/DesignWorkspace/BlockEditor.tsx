'use client';

import { ICONS } from '../../IconLibrary';
import type { Block, BlockItem } from '../../../lib/admin/block-types';

export interface BlockEditorCallbacks {
  pickLocalized: (val: string | Record<string, string> | undefined) => string;
  onFieldChange: (field: string, value: unknown) => void;
  onFieldCommit: (field: string, value: unknown) => void;
  onBlur: () => void;
  onAddNestedItem: () => void;
  onMoveNestedItem: (num: number, direction: 'up' | 'down') => void;
  onDeleteNestedItem: (num: number) => void;
  onNestedFieldChange: (num: number, field: string, value: unknown) => void;
  onNestedFieldCommit: (num: number, field: string, value: unknown) => void;
  onAiSuggest: (fieldPath: string, currentValue: unknown, subIdx?: number) => void;
}

interface BlockEditorProps {
  block: Block;
  callbacks: BlockEditorCallbacks;
}

function iconOptions(current: string | undefined, onSelect: (value: string) => void) {
  return (
    <select value={current || ''} onChange={(e) => onSelect(e.target.value)} className="customizer-select">
      <option value="">No Icon</option>
      {Object.keys(ICONS).map((iconName) => (
        <option key={iconName} value={iconName}>
          {iconName.charAt(0).toUpperCase() + iconName.slice(1)}
        </option>
      ))}
    </select>
  );
}

export function BlockEditor({ block, callbacks }: BlockEditorProps) {
  const { pickLocalized, onFieldChange, onFieldCommit, onBlur, onAddNestedItem, onMoveNestedItem, onDeleteNestedItem, onNestedFieldChange, onNestedFieldCommit, onAiSuggest } = callbacks;
  const s = block.settings;

  return (
    <>
      {block.type === 'promo' && (
        <>
          <div className="customizer-form-group">
            <label className="customizer-label">Promo Message</label>
            <div className="ai-copywriter-input-wrapper">
              <input
                type="text"
                value={pickLocalized(s.text) || ''}
                onChange={(e) => onFieldChange('text', e.target.value)}
                onBlur={onBlur}
                className="customizer-input with-wand"
              />
              <button
                type="button"
                className="ai-copywriter-wand-btn"
                onClick={() => onAiSuggest('text', s.text)}
                title="🪄 AI Copy suggestions"
              >
                🪄
              </button>
            </div>
          </div>
          <div className="customizer-form-group">
            <label className="customizer-label">Background Color Override</label>
            <input
              type="text"
              placeholder="e.g. #000000 or empty for theme default"
              value={typeof s.bgColor === 'string' ? s.bgColor : ''}
              onChange={(e) => onFieldChange('bgColor', e.target.value)}
              onBlur={onBlur}
              className="customizer-input"
            />
          </div>
        </>
      )}

      {block.type === 'trustStrip' && (
        <>
          <div className="customizer-form-group">
            <label className="customizer-label">Background Color</label>
            <input type="text" placeholder="e.g. #f8fafc or empty"
              value={typeof s.bgColor === 'string' ? s.bgColor : ''}
              onChange={(e) => onFieldChange('bgColor', e.target.value)}
              onBlur={onBlur} className="customizer-input" />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="customizer-label" style={{ fontSize: "0.72rem", color: "#818cf8" }}>TRUST ITEMS ({s.items?.length || 0})</span>
            <button type="button" onClick={onAddNestedItem}
              style={{ fontSize: "0.68rem", background: "#1e293b", color: "#f8fafc", padding: "4px 8px", borderRadius: "4px", border: "none", cursor: "pointer" }}>
              + Add Item
            </button>
          </div>
          {s.items?.map((item: BlockItem, num: number) => (
            <div key={num} className="sub-settings-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, borderBottom: "1px solid #1e293b", paddingBottom: 6 }}>
                <h4 style={{ fontSize: "0.75rem", fontWeight: 700, margin: 0 }}>Item #{num + 1}</h4>
                <div style={{ display: "flex", gap: 3 }}>
                  <button type="button" className="arr-btn" onClick={() => onMoveNestedItem(num, "up")} disabled={num === 0}>↑</button>
                  <button type="button" className="arr-btn" onClick={() => onMoveNestedItem(num, "down")} disabled={num === (s.items || []).length - 1}>↓</button>
                  <button type="button" className="del-btn" style={{ width: 18, height: 18 }} onClick={() => onDeleteNestedItem(num)}>✕</button>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div className="customizer-form-group" style={{ marginBottom: 0 }}>
                  <label className="customizer-label">Icon</label>
                  {iconOptions(typeof item.icon === 'string' ? item.icon : '', (value) => onNestedFieldCommit(num, 'icon', value))}
                </div>
                <div className="customizer-form-group" style={{ marginBottom: 0 }}>
                  <label className="customizer-label">Title</label>
                  <input type="text" value={pickLocalized(item.title) || ""} onChange={(e) => onNestedFieldChange(num, 'title', e.target.value)} onBlur={onBlur} className="customizer-input" />
                </div>
              </div>
              <div className="customizer-form-group" style={{ margin: 0 }}>
                <label className="customizer-label">Text</label>
                  <input type="text" value={pickLocalized(item.text) || ""} onChange={(e) => onNestedFieldChange(num, 'text', e.target.value)} onBlur={onBlur} className="customizer-input" />
              </div>
            </div>
          ))}
        </>
      )}

      {block.type === 'hero' && (
        <>
          <div className="customizer-form-group">
            <label className="customizer-label">Headline Title</label>
            <div className="ai-copywriter-input-wrapper">
              <input
                type="text"
                value={pickLocalized(s.title) || ""}
                onChange={(e) => onFieldChange('title', e.target.value)}
                onBlur={onBlur}
                className="customizer-input with-wand"
              />
              <button
                type="button"
                className="ai-copywriter-wand-btn"
                onClick={() => onAiSuggest('title', s.title)}
                title="🪄 AI Copy suggestions"
              >
                🪄
              </button>
            </div>
          </div>
          <div className="customizer-form-group">
            <label className="customizer-label">Subheading Description</label>
            <div className="ai-copywriter-input-wrapper">
              <textarea
                value={pickLocalized(s.subtitle) || ""}
                onChange={(e) => onFieldChange('subtitle', e.target.value)}
                onBlur={onBlur}
                className="customizer-textarea"
                style={{ paddingRight: "32px" }}
                rows={3}
              />
              <button
                type="button"
                className="ai-copywriter-wand-btn"
                style={{ top: "8px", right: "8px" }}
                onClick={() => onAiSuggest('subtitle', s.subtitle)}
                title="🪄 AI Copy suggestions"
              >
                🪄
              </button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="customizer-form-group">
              <label className="customizer-label">Button Label</label>
              <input
                type="text"
                value={pickLocalized(typeof s.buttonText === 'string' ? s.buttonText : s.primaryCta) || ""}
                onChange={(e) => onFieldChange('buttonText', e.target.value)}
                onBlur={onBlur}
                className="customizer-input"
              />
            </div>
            <div className="customizer-form-group">
              <label className="customizer-label">Button Anchor Link</label>
              <input
                type="text"
                value={typeof s.buttonLink === 'string' ? s.buttonLink : ''}
                onChange={(e) => onFieldChange('buttonLink', e.target.value)}
                onBlur={onBlur}
                className="customizer-input"
              />
            </div>
          </div>
          <div className="customizer-form-group">
            <label className="customizer-label">Decorating Icon</label>
            <select
              value={typeof s.emoji === 'string' ? s.emoji : ''}
              onChange={(e) => onFieldCommit('emoji', e.target.value)}
              className="customizer-select"
            >
              <option value="">No Icon</option>
              {Object.keys(ICONS).map((iconName) => (
                <option key={iconName} value={iconName}>
                  {iconName.charAt(0).toUpperCase() + iconName.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="customizer-form-group">
            <label className="customizer-label">Text Alignment</label>
            <select
              value={typeof s.alignment === 'string' ? s.alignment : 'center'}
              onChange={(e) => onFieldCommit('alignment', e.target.value)}
              className="customizer-select"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          <div className="customizer-form-group">
            <label className="customizer-label">Background Style</label>
            <select
              value={typeof s.bgType === 'string' ? s.bgType : 'gradient'}
              onChange={(e) => onFieldCommit('bgType', e.target.value)}
              className="customizer-select"
            >
              <option value="gradient">Linear Gradient</option>
              <option value="color">Solid Primary Color</option>
            </select>
          </div>
          {s.bgType === 'gradient' && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="customizer-form-group">
                <label className="customizer-label">Gradient From</label>
                <input
                  type="text"
                  value={typeof s.gradientFrom === 'string' ? s.gradientFrom : ''}
                  onChange={(e) => onFieldChange('gradientFrom', e.target.value)}
                  onBlur={onBlur}
                  className="customizer-input"
                />
              </div>
              <div className="customizer-form-group">
                <label className="customizer-label">Gradient To</label>
                <input
                  type="text"
                  value={typeof s.gradientTo === 'string' ? s.gradientTo : ''}
                  onChange={(e) => onFieldChange('gradientTo', e.target.value)}
                  onBlur={onBlur}
                  className="customizer-input"
                />
              </div>
            </div>
          )}
          <div className="customizer-form-group">
            <label className="customizer-label">Eyebrow Text (small label above title)</label>
            <input type="text" value={typeof s.eyebrow === 'string' ? s.eyebrow : ''} onChange={(e) => onFieldChange('eyebrow', e.target.value)} onBlur={onBlur} className="customizer-input" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="customizer-form-group">
              <label className="customizer-label">Secondary CTA Label</label>
              <input type="text" value={typeof s.secondaryCta === 'string' ? s.secondaryCta : ''} onChange={(e) => onFieldChange('secondaryCta', e.target.value)} onBlur={onBlur} className="customizer-input" />
            </div>
            <div className="customizer-form-group">
              <label className="customizer-label">Text Color</label>
              <input type="text" placeholder="e.g. #ffffff" value={typeof s.textColor === 'string' ? s.textColor : ''} onChange={(e) => onFieldChange('textColor', e.target.value)} onBlur={onBlur} className="customizer-input" />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="customizer-form-group">
              <label className="customizer-label">Min Height</label>
              <select value={typeof s.minHeight === 'string' ? s.minHeight : 'default'} onChange={(e) => onFieldCommit('minHeight', e.target.value === "default" ? undefined : e.target.value)} className="customizer-select">
                <option value="default">Default</option>
                <option value="300px">Short (300px)</option>
                <option value="450px">Medium (450px)</option>
                <option value="600px">Tall (600px)</option>
                <option value="100vh">Full screen</option>
              </select>
            </div>
          </div>
        </>
      )}
    </>
  );
}
