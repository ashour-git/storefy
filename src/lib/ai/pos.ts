import { getGroqCompletion } from './groq';
import { moderateAgentInput } from './safety';

export async function parsePosOrder(text: string, productsContext: string) {
  const safety = moderateAgentInput(text);
  if (!safety.allowed) throw new Error(safety.reason);

  const prompt = `
You are a POS assistant for a retail store. 
Your task is to parse a staff member's order description into a structured JSON format.

Available Products:
${productsContext}

Staff Input: "${text}"

Respond with ONLY a JSON object:
{
  "items": [
    { "productId": "uuid", "variantId": "uuid", "quantity": number, "name": "string" }
  ],
  "notes": "any special instructions"
}
`;

  const result = await getGroqCompletion([
    { role: 'system', content: 'You are a POS order parser. Always return valid JSON matching the requested schema.' },
    { role: 'user', content: prompt }
  ], { json: true });

  return JSON.parse(result);
}

export async function suggestPosUpsell(cartItems: any[], productsContext: string) {
  const prompt = `
You are a retail sales expert. Based on the current cart, suggest 1-3 relevant add-on products from the catalog.

Current Cart:
${JSON.stringify(cartItems)}

Catalog:
${productsContext}

Respond with ONLY a JSON object:
{
  "suggestions": [
    { "productId": "uuid", "reason": "why this is a good match", "name": "string" }
  ]
}
`;

  const result = await getGroqCompletion([
    { role: 'system', content: 'You are a sales assistant. Return ONLY JSON.' },
    { role: 'user', content: prompt }
  ], { json: true });

  return JSON.parse(result);
}
