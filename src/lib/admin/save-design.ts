export interface SaveDesignInput {
  storeId: string;
  tokens: Record<string, unknown>;
  blocks: unknown[];
}

export type SaveDesignResult = { ok: true } | { ok: false; error: string };

type FetchFn = (url: string, init: RequestInit) => Promise<Response>;

export async function saveDesign(input: SaveDesignInput, fetchFn: FetchFn = fetch): Promise<SaveDesignResult> {
  try {
    const response = await fetchFn('/api/themes/customize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      return { ok: false, error: data?.error || 'Failed to save design customization.' };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'Failed to connect to customization API.' };
  }
}
