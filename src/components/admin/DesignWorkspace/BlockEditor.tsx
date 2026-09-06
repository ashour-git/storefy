'use client';

import { useState } from 'react';
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
  const [styleOpen, setStyleOpen] = useState(false);

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
                value={pickLocalized(typeof s.title === 'string' ? s.title : '') || ""}
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
                value={pickLocalized(typeof s.subtitle === 'string' ? s.subtitle : '') || ""}
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

      {block.type === 'categoryTiles' && (
        <>
          <div className="customizer-form-group">
            <label className="customizer-label">Section Title</label>
            <input type="text" value={pickLocalized(s.title) || ""} onChange={(e) => onFieldChange('title', e.target.value)} onBlur={onBlur} className="customizer-input" />
          </div>
          <div className="customizer-form-group">
            <label className="customizer-label">Subtitle</label>
            <input type="text" value={pickLocalized(s.subtitle) || ""} onChange={(e) => onFieldChange('subtitle', e.target.value)} onBlur={onBlur} className="customizer-input" />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="customizer-label" style={{ fontSize: "0.72rem", color: "#818cf8" }}>CATEGORIES ({s.items?.length || 0})</span>
            <button type="button" onClick={onAddNestedItem}
              style={{ fontSize: "0.68rem", background: "#1e293b", color: "#f8fafc", padding: "4px 8px", borderRadius: "4px", border: "none", cursor: "pointer" }}>
              + Add Category
            </button>
          </div>
          {s.items?.map((item: BlockItem, num: number) => (
            <div key={num} className="sub-settings-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, borderBottom: "1px solid #1e293b", paddingBottom: 6 }}>
                <h4 style={{ fontSize: "0.75rem", fontWeight: 700, margin: 0 }}>Category #{num + 1}</h4>
                <div style={{ display: "flex", gap: 3 }}>
                  <button type="button" className="arr-btn" onClick={() => onMoveNestedItem(num, "up")} disabled={num === 0}>↑</button>
                  <button type="button" className="arr-btn" onClick={() => onMoveNestedItem(num, "down")} disabled={num === (s.items || []).length - 1}>↓</button>
                  <button type="button" className="del-btn" style={{ width: 18, height: 18 }} onClick={() => onDeleteNestedItem(num)}>✕</button>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div className="customizer-form-group" style={{ marginBottom: 0 }}>
                  <label className="customizer-label">Title</label>
                  <input type="text" value={pickLocalized(item.title) || ""} onChange={(e) => onNestedFieldChange(num, 'title', e.target.value)} onBlur={onBlur} className="customizer-input" />
                </div>
                <div className="customizer-form-group" style={{ marginBottom: 0 }}>
                  <label className="customizer-label">Subtext</label>
                  <input type="text" value={pickLocalized(item.text) || ""} onChange={(e) => onNestedFieldChange(num, 'text', e.target.value)} onBlur={onBlur} className="customizer-input" />
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {block.type === 'spotlight' && (
        <>
          <div className="customizer-form-group">
            <label className="customizer-label">Headline Title</label>
            <input type="text" value={pickLocalized(s.title) || ""} onChange={(e) => onFieldChange('title', e.target.value)} onBlur={onBlur} className="customizer-input" />
          </div>
          <div className="customizer-form-group">
            <label className="customizer-label">Body Text</label>
            <textarea value={pickLocalized(s.text) || ""} onChange={(e) => onFieldChange('text', e.target.value)} onBlur={onBlur} className="customizer-textarea" rows={3} />
          </div>
          <div className="customizer-form-group">
            <label className="customizer-label">Bullet Points (one per line)</label>
            <textarea value={(Array.isArray(s.bullets) ? s.bullets : []).join('\n')} onChange={(e) => onFieldChange('bullets', e.target.value.split('\n').filter(Boolean))} onBlur={onBlur} className="customizer-textarea" rows={3} placeholder="Premium quality guaranteed&#10;Fast shipping&#10;Easy returns" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="customizer-form-group">
              <label className="customizer-label">CTA Button Label</label>
              <input type="text" value={typeof s.cta === 'string' ? s.cta : ''} onChange={(e) => onFieldChange('cta', e.target.value)} onBlur={onBlur} className="customizer-input" />
            </div>
            <div className="customizer-form-group">
              <label className="customizer-label">Image Position</label>
              <select value={typeof s.imagePosition === 'string' ? s.imagePosition : 'right'} onChange={(e) => onFieldCommit('imagePosition', e.target.value)} className="customizer-select">
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
        </>
      )}

      {(block.type === 'features' || block.type === 'testimonials' || block.type === 'gallery' || block.type === 'faq') && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {block.type === 'faq' && (
            <div className="customizer-form-group">
              <label className="customizer-label">Section Title</label>
              <input
                type="text"
                value={pickLocalized(typeof s.title === 'string' ? s.title : '') || ""}
                onChange={(e) => onFieldChange('title', e.target.value)}
                onBlur={onBlur}
                className="customizer-input"
              />
            </div>
          )}

          {block.type === 'gallery' && (
            <>
            <div className="customizer-form-group">
              <label className="customizer-label">Gallery Section Title</label>
              <input
                type="text"
                value={pickLocalized(typeof s.title === 'string' ? s.title : '') || ""}
                onChange={(e) => onFieldChange('title', e.target.value)}
                onBlur={onBlur}
                className="customizer-input"
              />
            </div>
            <div className="customizer-form-group">
              <label className="customizer-label">Columns</label>
              <select value={String(s.columns ?? "3")} onChange={(e) => onFieldCommit('columns', parseInt(e.target.value))} className="customizer-select">
                <option value="2">2 Columns</option>
                <option value="3">3 Columns</option>
                <option value="4">4 Columns</option>
              </select>
            </div>
            </>
          )}

          {block.type === 'testimonials' && (
            <div className="customizer-form-group">
              <label className="customizer-label">Testimonials Section Title</label>
              <input
                type="text"
                value={pickLocalized(typeof s.title === 'string' ? s.title : '') || ""}
                onChange={(e) => onFieldChange('title', e.target.value)}
                onBlur={onBlur}
                className="customizer-input"
              />
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="customizer-label" style={{ fontSize: "0.72rem", color: "#818cf8" }}>NESTED ITEMS ({s.items?.length || 0})</span>
            <button
              type="button"
              onClick={onAddNestedItem}
              style={{ fontSize: "0.68rem", background: "#1e293b", color: "#f8fafc", padding: "4px 8px", borderRadius: "4px", border: "none", cursor: "pointer" }}
            >
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

              {block.type === 'features' && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div className="customizer-form-group" style={{ marginBottom: 0 }}>
                      <label className="customizer-label">Icon</label>
                      <select
                        value={typeof item.emoji === 'string' ? item.emoji : ''}
                        onChange={(e) => onNestedFieldCommit(num, 'emoji', e.target.value)}
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
                    <div className="customizer-form-group" style={{ marginBottom: 0 }}>
                      <label className="customizer-label">Title</label>
                      <div className="ai-copywriter-input-wrapper">
                        <input
                          type="text"
                          value={pickLocalized(item.title) || ""}
                          onChange={(e) => onNestedFieldChange(num, 'title', e.target.value)}
                          onBlur={onBlur}
                          className="customizer-input"
                          style={{ paddingRight: "24px" }}
                        />
                        <button
                          type="button"
                          className="ai-copywriter-wand-btn"
                          onClick={() => onAiSuggest('title', item.title, num)}
                          title="🪄 AI Suggestions"
                        >
                          🪄
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="customizer-form-group" style={{ marginBottom: 0 }}>
                    <label className="customizer-label">Description</label>
                    <div className="ai-copywriter-input-wrapper">
                      <input
                        type="text"
                        value={pickLocalized(typeof item.desc === 'string' ? item.desc : item.text) || ""}
                        onChange={(e) => onNestedFieldChange(num, 'desc', e.target.value)}
                        onBlur={onBlur}
                        className="customizer-input"
                        style={{ paddingRight: "24px" }}
                      />
                      <button
                        type="button"
                        className="ai-copywriter-wand-btn"
                        onClick={() => onAiSuggest('desc', typeof item.desc === 'string' ? item.desc : item.text, num)}
                        title="🪄 AI Suggestions"
                      >
                        🪄
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {block.type === 'testimonials' && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 10 }}>
                    <div>
                      <label className="customizer-label">Client Name</label>
                      <input
                        type="text"
                        value={typeof item.name === 'string' ? item.name : ''}
                        onChange={(e) => onNestedFieldChange(num, 'name', e.target.value)}
                        onBlur={onBlur}
                        className="customizer-input"
                      />
                    </div>
                    <div>
                      <label className="customizer-label">Rating (1-5)</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={item.rating || 5}
                        onChange={(e) => onNestedFieldChange(num, 'rating', parseInt(e.target.value) || 5)}
                        onBlur={onBlur}
                        className="customizer-input"
                      />
                    </div>
                  </div>
                  <div className="customizer-form-group" style={{ margin: 0 }}>
                    <label className="customizer-label">Review Text</label>
                    <div className="ai-copywriter-input-wrapper">
                      <textarea
                        value={pickLocalized(item.text) || ""}
                        onChange={(e) => onNestedFieldChange(num, 'text', e.target.value)}
                        onBlur={onBlur}
                        className="customizer-textarea"
                        style={{ paddingRight: "24px" }}
                        rows={2}
                      />
                      <button
                        type="button"
                        className="ai-copywriter-wand-btn"
                        onClick={() => onAiSuggest('text', item.text, num)}
                        title="🪄 AI Suggestions"
                      >
                        🪄
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {block.type === 'gallery' && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div className="customizer-form-group" style={{ marginBottom: 0 }}>
                      <label className="customizer-label">Emoji Icon</label>
                      <select
                        value={typeof item.emoji === 'string' ? item.emoji : ''}
                        onChange={(e) => onNestedFieldCommit(num, 'emoji', e.target.value)}
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
                    <div className="customizer-form-group" style={{ marginBottom: 0 }}>
                      <label className="customizer-label">Card Title</label>
                      <div className="ai-copywriter-input-wrapper">
                        <input
                          type="text"
                          value={pickLocalized(item.title) || ""}
                          onChange={(e) => onNestedFieldChange(num, 'title', e.target.value)}
                          onBlur={onBlur}
                          className="customizer-input"
                          style={{ paddingRight: "24px" }}
                        />
                        <button
                          type="button"
                          className="ai-copywriter-wand-btn"
                          onClick={() => onAiSuggest('title', item.title, num)}
                          title="🪄 AI Suggestions"
                        >
                          🪄
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="customizer-form-group" style={{ margin: 0 }}>
                    <label className="customizer-label">Description Text</label>
                    <div className="ai-copywriter-input-wrapper">
                      <input
                        type="text"
                        value={pickLocalized(typeof item.desc === 'string' ? item.desc : item.text) || ""}
                        onChange={(e) => onNestedFieldChange(num, 'desc', e.target.value)}
                        onBlur={onBlur}
                        className="customizer-input"
                        style={{ paddingRight: "24px" }}
                      />
                      <button
                        type="button"
                        className="ai-copywriter-wand-btn"
                        onClick={() => onAiSuggest('desc', typeof item.desc === 'string' ? item.desc : item.text, num)}
                        title="🪄 AI Suggestions"
                      >
                        🪄
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {block.type === 'faq' && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className="customizer-form-group" style={{ marginBottom: 0 }}>
                    <label className="customizer-label">Question Text</label>
                    <input
                      type="text"
                      value={pickLocalized(item.question) || ""}
                      onChange={(e) => onNestedFieldChange(num, 'question', e.target.value)}
                      onBlur={onBlur}
                      className="customizer-input"
                    />
                  </div>
                  <div className="customizer-form-group" style={{ margin: 0 }}>
                    <label className="customizer-label">Answer Text</label>
                    <textarea
                      value={pickLocalized(item.answer) || ""}
                      onChange={(e) => onNestedFieldChange(num, 'answer', e.target.value)}
                      onBlur={onBlur}
                      className="customizer-textarea"
                      rows={2}
                    />
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {block.type === 'collection' && (
        <>
          <div className="customizer-form-group">
            <label className="customizer-label">Collection Header Title</label>
            <div className="ai-copywriter-input-wrapper">
              <input
                type="text"
                value={pickLocalized(typeof s.title === 'string' ? s.title : '') || ""}
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
            <label className="customizer-label">Subheading description</label>
            <div className="ai-copywriter-input-wrapper">
              <input
                type="text"
                value={pickLocalized(typeof s.subtitle === 'string' ? s.subtitle : '') || ""}
                onChange={(e) => onFieldChange('subtitle', e.target.value)}
                onBlur={onBlur}
                className="customizer-input with-wand"
              />
              <button
                type="button"
                className="ai-copywriter-wand-btn"
                onClick={() => onAiSuggest('subtitle', s.subtitle)}
                title="🪄 AI Copy suggestions"
              >
                🪄
              </button>
            </div>
          </div>
          <div className="customizer-form-group">
            <label className="customizer-label">Max products displayed</label>
            <input
              type="number"
              min="1"
              max="24"
              value={typeof s.limit === 'number' ? s.limit : 8}
              onChange={(e) => onFieldChange('limit', parseInt(e.target.value) || 8)}
              onBlur={onBlur}
              className="customizer-input"
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="customizer-form-group">
              <label className="customizer-label">Layout Style</label>
              <select value={typeof s.layout === 'string' ? s.layout : 'grid'} onChange={(e) => onFieldCommit('layout', e.target.value)} className="customizer-select">
                <option value="grid">Grid</option>
                <option value="carousel">Carousel</option>
                <option value="list">List</option>
              </select>
            </div>
            <div className="customizer-form-group">
              <label className="customizer-label">Show View All</label>
              <select value={s.showViewAll ? "yes" : "no"} onChange={(e) => onFieldCommit('showViewAll', e.target.value === "yes")} className="customizer-select">
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        </>
      )}

      {block.type === 'newsletter' && (
        <>
          <div className="customizer-form-group">
            <label className="customizer-label">Title</label>
            <div className="ai-copywriter-input-wrapper">
              <input
                type="text"
                value={pickLocalized(typeof s.title === 'string' ? s.title : '') || ""}
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
              <input
                type="text"
                value={pickLocalized(typeof s.subtitle === 'string' ? s.subtitle : '') || ""}
                onChange={(e) => onFieldChange('subtitle', e.target.value)}
                onBlur={onBlur}
                className="customizer-input with-wand"
              />
              <button
                type="button"
                className="ai-copywriter-wand-btn"
                onClick={() => onAiSuggest('subtitle', s.subtitle)}
                title="🪄 AI Copy suggestions"
              >
                🪄
              </button>
            </div>
          </div>
          <div className="customizer-form-group">
            <label className="customizer-label">Placeholder Text</label>
            <input
              type="text"
              value={typeof s.placeholder === 'string' ? s.placeholder : ''}
              onChange={(e) => onFieldChange('placeholder', e.target.value)}
              onBlur={onBlur}
              className="customizer-input"
            />
          </div>
          <div className="customizer-form-group">
            <label className="customizer-label">Button Label</label>
            <input
              type="text"
              value={typeof s.buttonText === 'string' ? s.buttonText : ''}
              onChange={(e) => onFieldChange('buttonText', e.target.value)}
              onBlur={onBlur}
              className="customizer-input"
            />
          </div>
        </>
      )}

      {block.type === 'benefits' && (
        <>
          <div className="customizer-form-group">
            <label className="customizer-label">Section Title</label>
            <input type="text" value={pickLocalized(typeof s.title === 'string' ? s.title : '') || ""} onChange={(e) => onFieldChange('title', e.target.value)} onBlur={onBlur} className="customizer-input" />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="customizer-label" style={{ fontSize: "0.72rem", color: "#818cf8" }}>BENEFITS ({s.items?.length || 0})</span>
            <button type="button" onClick={onAddNestedItem}
              style={{ fontSize: "0.68rem", background: "#1e293b", color: "#f8fafc", padding: "4px 8px", borderRadius: "4px", border: "none", cursor: "pointer" }}>
              + Add Benefit
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
                <label className="customizer-label">Description</label>
                <input type="text" value={pickLocalized(item.text || item.description) || ""} onChange={(e) => onNestedFieldChange(num, 'text', e.target.value)} onBlur={onBlur} className="customizer-input" />
              </div>
            </div>
          ))}
        </>
      )}

      <div style={{ marginTop: 8, borderTop: "1px solid #1e293b", paddingTop: 8 }}>
        <button
          type="button"
          onClick={() => setStyleOpen((open) => !open)}
          aria-expanded={styleOpen}
          style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, color: "#818cf8", background: "none", border: "none", padding: 0 }}
        >
          <span>{styleOpen ? "▼" : "▶"} ⚙️ Section Style</span>
        </button>
        {styleOpen && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            <div className="customizer-form-group">
              <label className="customizer-label">Background Color</label>
              <input type="text" placeholder="e.g. #ffffff"
                value={typeof s.bgColor === 'string' ? s.bgColor : ''}
                onChange={(e) => onFieldChange('bgColor', e.target.value)}
                onBlur={onBlur} className="customizer-input" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div className="customizer-form-group" style={{ marginBottom: 0 }}>
                <label className="customizer-label">Padding Top</label>
                <select value={typeof s.paddingTop === 'string' ? s.paddingTop : 'default'} onChange={(e) => onFieldCommit('paddingTop', e.target.value === "default" ? undefined : e.target.value)} className="customizer-select">
                  <option value="default">Default</option>
                  <option value="compact">Compact</option>
                  <option value="normal">Normal</option>
                  <option value="spacious">Spacious</option>
                  <option value="extra">Extra</option>
                </select>
              </div>
              <div className="customizer-form-group" style={{ marginBottom: 0 }}>
                <label className="customizer-label">Padding Bottom</label>
                <select value={typeof s.paddingBottom === 'string' ? s.paddingBottom : 'default'} onChange={(e) => onFieldCommit('paddingBottom', e.target.value === "default" ? undefined : e.target.value)} className="customizer-select">
                  <option value="default">Default</option>
                  <option value="compact">Compact</option>
                  <option value="normal">Normal</option>
                  <option value="spacious">Spacious</option>
                  <option value="extra">Extra</option>
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div className="customizer-form-group" style={{ marginBottom: 0 }}>
                <label className="customizer-label">Scroll Animation</label>
                <select value={typeof s.animation === 'string' ? s.animation : 'none'} onChange={(e) => onFieldCommit('animation', e.target.value)} className="customizer-select">
                  <option value="none">None</option>
                  <option value="fadeIn">Fade In</option>
                  <option value="slideUp">Slide Up</option>
                  <option value="scaleIn">Scale In</option>
                </select>
              </div>
              <div className="customizer-form-group" style={{ marginBottom: 0 }}>
                <label className="customizer-label">Mobile Visibility</label>
                <select value={s.hideMobile ? "hide" : "show"} onChange={(e) => onFieldCommit('hideMobile', e.target.value === "hide")} className="customizer-select">
                  <option value="show">Visible</option>
                  <option value="hide">Hidden</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
