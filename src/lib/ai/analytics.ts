import { aiProvider } from '../providers/ai';
import { moderateAgentInput } from './safety';

export async function interpretAnalyticsQuery(query: string, schemaSummary: string) {
  const safety = moderateAgentInput(query);
  if (!safety.allowed) throw new Error(safety.reason);

  const prompt = `
You are an analytics assistant for an e-commerce platform.
The user wants to query their store data using natural language.

Database Schema (subset):
${schemaSummary}

User Query: "${query}"

Respond with ONLY a JSON object:
{
  "explanation": "Briefly explain what data you are fetching",
  "queryType": "trend | total | distribution | list",
  "visualType": "bar | line | pie | kpi",
  "dataPoints": [
    { "label": "string", "value": number }
  ],
  "insight": "A helpful business insight based on this hypothetical data"
}
`;

  const result = await aiProvider.complete([
    { role: 'system', content: 'You are an e-commerce analytics expert. Return ONLY valid JSON.' },
    { role: 'user', content: prompt }
  ], { json: true });

  return JSON.parse(result);
}
