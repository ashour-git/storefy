import { describe, expect, it } from 'vitest';
import { createDesignHistory } from '../design-history';

const A = { tokens: { primaryColor: '#111111' }, blocks: [] };
const B = { tokens: { primaryColor: '#0e7c6b' }, blocks: [] };

describe('createDesignHistory', () => {
  it('starts at the initial state with nothing to undo', () => {
    const history = createDesignHistory(A);
    expect(history.current()).toEqual(A);
    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(false);
  });

  it('round-trips push, undo, and redo', () => {
    const history = createDesignHistory(A);
    history.push(B);
    expect(history.current()).toEqual(B);
    expect(history.canUndo()).toBe(true);
    history.undo();
    expect(history.current()).toEqual(A);
    expect(history.canRedo()).toBe(true);
    history.redo();
    expect(history.current()).toEqual(B);
  });

  it('drops the redo branch when pushing after undo', () => {
    const history = createDesignHistory(A);
    history.push(B);
    history.undo();
    history.push(A);
    expect(history.canRedo()).toBe(false);
    expect(history.current()).toEqual(A);
  });
});
