import { getGroqCompletion } from './groq';
import { moderateAgentInput } from './safety';
import { storeTemplates } from '../storefront/templates';

export async function generateStoreLayout(category: string, businessDescription: string, locale: 'ar' | 'en') {
  const safety = moderateAgentInput(businessDescription);
  if (!safety.allowed) throw new Error(safety.reason);

  const baseTemplate = storeTemplates.find(t => t.vertical === category) || storeTemplates[0];

  const prompt = `
You are an expert e-commerce web designer. 
Generate a customized store layout and theme for a new store.

Category: ${category}
Business Description: "${businessDescription}"
Target Locale: ${locale}

Base Template Reference:
${JSON.stringify(baseTemplate.tokens)}

Respond with ONLY a JSON object:
{
  "tokens": {
    "primaryColor": "hex",
    "secondaryColor": "hex",
    "backgroundColor": "hex",
    "fontFamily": "string",
    "borderRadius": "px string"
  },
  "blocks": [
    { 
      "id": "hero", 
      "type": "hero", 
      "settings": { 
        "title": { "en": "string", "ar": "string" },
        "subtitle": { "en": "string", "ar": "string" }
      } 
    },
    ... at least 5 customized blocks based on the business description
  ]
}
`;

  const result = await getGroqCompletion([
    { role: 'system', content: 'You are a web design AI. Return ONLY valid JSON matching the Storefy block schema.' },
    { role: 'user', content: prompt }
  ], { json: true, model: 'llama-3.3-70b-versatile' });

  return JSON.parse(result);
}
