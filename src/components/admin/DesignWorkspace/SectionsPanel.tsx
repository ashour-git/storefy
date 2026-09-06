'use client';

import { BLOCK_TYPES, type BlockType, type SectionBlock } from '../../../lib/admin/block-types';

interface SectionsPanelProps {
  blocks: SectionBlock[];
  onMove: (index: number, direction: 'up' | 'down') => void;
  onToggleHidden: (index: number) => void;
  onDelete: (index: number) => void;
  onAdd: (type: BlockType) => void;
}

export function SectionsPanel({ blocks, onMove, onToggleHidden, onDelete, onAdd }: SectionsPanelProps) {
  return (
    <section aria-label="Page sections">
      {blocks.length === 0 && <p>No sections yet. Add your first section below.</p>}
      <ul>
        {blocks.map((block, index) => {
          const hidden = block.settings.hidden === true;
          return (
            <li key={block.id}>
              <span>
                {block.type}
                {hidden ? ' (hidden)' : ''}
              </span>
              <button type="button" aria-label={`Move ${block.type} up`} disabled={index === 0} onClick={() => onMove(index, 'up')}>
                ↑
              </button>
              <button
                type="button"
                aria-label={`Move ${block.type} down`}
                disabled={index === blocks.length - 1}
                onClick={() => onMove(index, 'down')}
              >
                ↓
              </button>
              <button type="button" aria-label={`${hidden ? 'Unhide' : 'Hide'} ${block.type}`} onClick={() => onToggleHidden(index)}>
                {hidden ? 'Unhide' : 'Hide'}
              </button>
              <button type="button" aria-label={`Delete ${block.type}`} onClick={() => onDelete(index)}>
                Delete
              </button>
            </li>
          );
        })}
      </ul>
      <div>
        <p>Add section</p>
        {BLOCK_TYPES.map((type) => (
          <button key={type} type="button" aria-label={`Add ${type}`} onClick={() => onAdd(type)}>
            {type}
          </button>
        ))}
      </div>
    </section>
  );
}
