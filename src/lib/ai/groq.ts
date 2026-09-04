import { env } from '../env';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqCompletionOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  json?: boolean;
}

export const GROQ_MODELS = {
  fast: 'openai/gpt-oss-20b',
  reasoner: 'openai/gpt-oss-120b',
} as const;

export function estimateTokens(text: string): number {
  return Math.ceil((text || '').length / 4);
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 25000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function getGroqCompletion(messages: ChatMessage[], options: GroqCompletionOptions = {}) {
  const apiKey = env.groqApiKey;
  if (!apiKey) {
    throw new Error('groqApiKey env is not set');
  }

  const body = JSON.stringify({
    model: options.model || GROQ_MODELS.fast,
    messages: messages.map((m) => ({ role: m.role, content: (m.content || '').slice(0, 12000) })),
    temperature: options.temperature ?? 0.1,
    max_tokens: Math.min(options.max_tokens ?? 800, 2000),
    response_format: options.json ? { type: 'json_object' } : undefined,
  });

  let lastError = 'unknown';
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body,
      });

      if (response.status === 429 || response.status >= 500) {
        lastError = `transient-${response.status}`;
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
        continue;
      }

      if (!response.ok) {
        throw new Error('AI provider temporarily unavailable');
      }

      const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('AI provider returned empty response');
      return content;
    } catch (error: unknown) {
      lastError = error instanceof Error ? error.message.slice(0, 120) : 'fetch-failed';
      if (attempt === 1) throw new Error('AI provider temporarily unavailable');
    }
  }
  throw new Error(`AI provider temporarily unavailable (${lastError})`);
}
