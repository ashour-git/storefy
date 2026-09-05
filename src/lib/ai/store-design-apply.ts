export interface GeneratedDesignPayload {
  tokens?: Record<string, unknown> | null;
  blocks?: unknown[] | null;
}

export function mergeGeneratedDesign(
  currentTokens: Record<string, unknown>,
  generated: GeneratedDesignPayload | null
): { tokens: Record<string, unknown>; blocks: unknown[] | null } {
  if (!generated || (!generated.tokens && !generated.blocks)) {
    return { tokens: currentTokens, blocks: null };
  }
  return {
    tokens: { ...currentTokens, ...(generated.tokens ?? {}) },
    blocks: generated.blocks ?? null,
  };
}
