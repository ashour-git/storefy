import { GROQ_MODELS, getGroqCompletion } from './groq';
import {
  validateStoreDesign,
  type DesignBlock,
  type DesignTokens,
} from './store-design-guardrails';

export interface StoreDesignBrief {
  storeName: string;
  category: string;
  locale: 'ar' | 'en';
  mood?: string;
  audience?: string;
  colorInstinct?: string;
  seed?: number;
}

export interface GeneratedStoreDesign {
  tokens: DesignTokens;
  blocks: unknown[];
}

export type StoreDesignSource = 'ai' | 'fallback';

export interface StoreDesignResult {
  design: GeneratedStoreDesign;
  source: StoreDesignSource;
  warnings: string[];
}

export interface StoreDesignDeps {
  complete?: (prompt: string) => Promise<string>;
}

const FALLBACK_DESIGN: GeneratedStoreDesign = {
  tokens: {
    primaryColor: '#0e7c6b',
    secondaryColor: '#101619',
    backgroundColor: '#ffffff',
    textColor: '#101619',
    fontFamily: 'Inter',
    headingFontFamily: 'Cairo',
    borderRadius: '0.5rem',
  },
  blocks: [
    { type: 'hero', settings: {} },
    { type: 'collection', settings: { limit: 8 } },
    { type: 'footer', settings: {} },
  ],
};

export function buildStoreDesignPrompt(brief: StoreDesignBrief): string {
  const lines = [
    'You are an ecommerce art director. Design a distinctive storefront look.',
    `Store: "${brief.storeName}" (${brief.category}). Language: ${brief.locale === 'ar' ? 'Arabic-first, RTL-safe' : 'English'}.`,
  ];
  if (brief.mood) lines.push(`Brand mood: ${brief.mood}.`);
  if (brief.audience) lines.push(`Audience: ${brief.audience}.`);
  if (brief.colorInstinct) lines.push(`Color instinct: ${brief.colorInstinct}.`);
  lines.push(
    'Respond with JSON only: { "tokens": { primaryColor, secondaryColor, backgroundColor, textColor, fontFamily, headingFontFamily, borderRadius }, "blocks": [ { "type", "settings" } ] }.',
    'Rules: hex colors only; text/background contrast at least 4.5; fonts only from Inter, Cairo, Tajawal, Poppins, Outfit, DM Sans, Playfair Display; blocks must include hero, collection, and footer types; alignment values only left, center, right, justify, start, end.'
  );
  return lines.join('\n');
}

function parseDesignPayload(content: string): GeneratedStoreDesign | null {
  try {
    const parsed = JSON.parse(content) as {
      tokens?: DesignTokens;
      blocks?: unknown[];
    };
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.tokens || typeof parsed.tokens !== 'object') return null;
    if (!Array.isArray(parsed.blocks)) return null;
    return { tokens: parsed.tokens, blocks: parsed.blocks };
  } catch {
    return null;
  }
}

function toFallback(reason: string): StoreDesignResult {
  return {
    design: FALLBACK_DESIGN,
    source: 'fallback',
    warnings: [reason],
  };
}

export async function generateStoreDesign(
  brief: StoreDesignBrief,
  deps: StoreDesignDeps = {}
): Promise<StoreDesignResult> {
  const complete =
    deps.complete ??
    ((prompt: string) =>
      getGroqCompletion(
        [
          { role: 'system', content: 'You are an ecommerce art director. You respond with JSON only.' },
          { role: 'user', content: prompt },
        ],
        { model: GROQ_MODELS.reasoner, temperature: 0.7, max_tokens: 1500, json: true }
      ));
  const prompt = buildStoreDesignPrompt(brief);

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const design = parseDesignPayload(await complete(prompt));
      if (!design) continue;
      const validation = validateStoreDesign({ tokens: design.tokens, blocks: design.blocks as DesignBlock[] });
      if (validation.ok) {
        return { design, source: 'ai', warnings: [] };
      }
    } catch {
      break;
    }
  }

  return toFallback('AI output failed validation; applied the default look instead.');
}
