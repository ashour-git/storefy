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

export async function getGroqCompletion(messages: ChatMessage[], options: GroqCompletionOptions = {}) {
  const apiKey = env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model || 'llama-3.3-70b-versatile',
      messages,
      temperature: options.temperature ?? 0.1,
      max_tokens: options.max_tokens,
      response_format: options.json ? { type: 'json_object' } : undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Groq API error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
