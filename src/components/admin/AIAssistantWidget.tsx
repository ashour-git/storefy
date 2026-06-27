"use strict";
"use client";

import React, { useState } from 'react';

export function AIAssistantWidget({ blocks, onBlocksUpdate }: { blocks: any[], onBlocksUpdate: (blocks: any[]) => void }) {
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleTweak = async () => {
    if (!instruction.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ai/tweak-blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction, blocks })
      });
      const data = await res.json();
      if (data.blocks) {
        onBlocksUpdate(data.blocks);
        setInstruction("");
        setOpen(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      {!open ? (
        <button 
          onClick={() => setOpen(true)}
          style={{
            background: 'var(--accent-primary)',
            color: 'white',
            borderRadius: '999px',
            padding: '12px 24px',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          ✨ AI Design Copilot
        </button>
      ) : (
        <div style={{
          background: 'var(--surface-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 16,
          padding: 20,
          width: 320,
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontWeight: 'bold' }}>Store Copilot</h4>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>
            Describe what you want to change. (e.g. "Make the hero section darker and change the button to Shop Now")
          </p>
          <textarea 
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Type your instruction..."
            style={{
              width: '100%',
              minHeight: 80,
              padding: 12,
              borderRadius: 8,
              border: '1px solid var(--border-subtle)',
              background: 'var(--surface-subtle)',
              color: 'var(--text-primary)',
              resize: 'none'
            }}
          />
          <button 
            onClick={handleTweak}
            disabled={loading || !instruction.trim()}
            style={{
              background: loading ? 'var(--surface-subtle)' : 'var(--accent-primary)',
              color: loading ? 'var(--text-muted)' : 'white',
              borderRadius: 8,
              padding: '10px 16px',
              fontWeight: 'bold',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Generating...' : 'Apply Magic ✨'}
          </button>
        </div>
      )}
    </div>
  );
}
