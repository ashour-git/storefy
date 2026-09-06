export interface DesignSnapshot {
  tokens: Record<string, unknown>;
  blocks: unknown[];
}

export interface DesignHistory {
  current(): DesignSnapshot;
  canUndo(): boolean;
  canRedo(): boolean;
  push(state: DesignSnapshot): void;
  undo(): void;
  redo(): void;
}

function clone(state: DesignSnapshot): DesignSnapshot {
  return {
    tokens: JSON.parse(JSON.stringify(state.tokens)) as Record<string, unknown>,
    blocks: JSON.parse(JSON.stringify(state.blocks)) as unknown[],
  };
}

export function createDesignHistory(initial: DesignSnapshot): DesignHistory {
  const stack: DesignSnapshot[] = [clone(initial)];
  let index = 0;

  return {
    current: () => clone(stack[index]),
    canUndo: () => index > 0,
    canRedo: () => index < stack.length - 1,
    push: (state: DesignSnapshot) => {
      stack.length = index + 1;
      stack.push(clone(state));
      index = stack.length - 1;
    },
    undo: () => {
      if (index > 0) index -= 1;
    },
    redo: () => {
      if (index < stack.length - 1) index += 1;
    },
  };
}
