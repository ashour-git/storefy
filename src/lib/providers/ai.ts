import { env } from '../env';
import type { Locale } from '../i18n';
import { getTemplateForVertical } from '../storefront/templates';

export interface ProductDescriptionInput {
  productName: string;
  category?: string;
  locale: Locale;
}

export interface ProductDescriptionOutput {
  description: string;
  tags: string[];
}

export interface TemplateSuggestionInput {
  category?: string;
  locale: Locale;
  businessDescription?: string;
}

export interface StorefrontAgentInput {
  storeName: string;
  category?: string | null;
  locale: Locale;
  question: string;
  context: string;
  conversation?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface BusinessInsightInput {
  storeName: string;
  category?: string | null;
  locale: Locale;
  storeData: unknown;
  question?: string;
}

export interface BusinessInsight {
  type: 'success' | 'warning' | 'tip' | 'alert';
  title: string;
  description: string;
  action: string;
}

export interface AiProvider {
  generateProductDescription(input: ProductDescriptionInput): Promise<ProductDescriptionOutput>;
  suggestTemplate(input: TemplateSuggestionInput): Promise<{ templateId: string; reason: string }>;
  answerStorefront(input: StorefrontAgentInput): Promise<{ answer: string; sources: string[] }>;
  generateBusinessInsights(input: BusinessInsightInput): Promise<{ insights: BusinessInsight[] }>;
  /** Stream a chat response token-by-token via SSE */
  streamChat(input: BusinessInsightInput & { messageHistory?: Array<{ role: 'user' | 'assistant'; content: string }> }): AsyncGenerator<string, void, unknown>;
}

export class MockAiProvider implements AiProvider {
  async generateProductDescription(input: ProductDescriptionInput): Promise<ProductDescriptionOutput> {
    if (input.locale === 'ar') {
      return {
        description: `${input.productName} منتج مختار بعناية ليمنح عملاءك تجربة شراء واضحة وموثوقة. مناسب لفئة ${input.category || 'المتجر'} مع وصف جاهز للتحسين قبل النشر.`,
        tags: ['مختار', 'جاهز للبيع', input.category || 'عام'],
      };
    }

    return {
      description: `${input.productName} is a launch-ready product crafted for a clear, trustworthy storefront experience. Position it in ${input.category || 'your catalog'} with benefits, delivery confidence, and simple checkout.`,
      tags: ['launch-ready', 'trusted', input.category || 'general'],
    };
  }

  async suggestTemplate(input: TemplateSuggestionInput) {
    const template = getTemplateForVertical(input.category);
    return {
      templateId: template.id,
      reason: input.locale === 'ar' ? 'تم اختيار قالب مناسب لنشاط المتجر والسوق المحلي.' : 'Selected the strongest curated template for this vertical and locale.',
    };
  }

  async answerStorefront(input: StorefrontAgentInput): Promise<{ answer: string; sources: string[] }> {
    const fallback = input.locale === 'ar'
      ? `أهلاً بك في ${input.storeName}. أستطيع مساعدتك في المنتجات والأسعار والتوفر وسياسات المتجر. بناءً على بيانات المتجر: ${input.context.slice(0, 500) || 'لا توجد بيانات كافية بعد.'}`
      : `Welcome to ${input.storeName}. I can help with products, prices, availability, and store policies. Based on this store data: ${input.context.slice(0, 500) || 'not enough store data is available yet.'}`;
    return { answer: fallback, sources: input.context ? ['store-data'] : [] };
  }

  async generateBusinessInsights(input: BusinessInsightInput): Promise<{ insights: BusinessInsight[] }> {
    const noOrders = input.locale === 'ar'
      ? { type: 'tip' as const, title: 'ابدأ بأول طلب', description: 'شارك رابط المتجر على واتساب وإنستجرام مع عرض افتتاح واضح.', action: 'أضف عرض شحن أو خصم افتتاحي اليوم.' }
      : { type: 'tip' as const, title: 'Drive first orders', description: 'Share your storefront on WhatsApp and Instagram with a clear launch offer.', action: 'Add a launch shipping or discount offer today.' };
    const catalog = input.locale === 'ar'
      ? { type: 'warning' as const, title: 'قوّي الكتالوج', description: 'المتاجر التي تعرض منتجات نشطة وصور واضحة تحصل على ثقة أسرع.', action: 'أضف 5 منتجات نشطة على الأقل مع وصف وصورة.' }
      : { type: 'warning' as const, title: 'Strengthen catalog', description: 'Stores with active products and clear product stories earn trust faster.', action: 'Publish at least 5 active products with descriptions and images.' };
    return { insights: [catalog, noOrders] };
  }

  async *streamChat(input: BusinessInsightInput & { messageHistory?: Array<{ role: 'user' | 'assistant'; content: string }> }): AsyncGenerator<string, void, unknown> {
    const data = JSON.stringify(input.storeData).slice(0, 1000);
    const answer = input.locale === 'ar'
      ? `مرحباً! أنا مستشار متجر ${input.storeName}. يمكنني مساعدتك في تحليل أداء متجرك وتقديم توصيات.\n\nبناءً على بيانات متجرك: ${data}`
      : `Hi! I'm the advisor for ${input.storeName}. I can help analyze your store performance and provide recommendations.\n\nBased on your store data: ${data}`;
    for (const char of answer) {
      yield char;
      await new Promise((r) => setTimeout(r, 15));
    }
  }
}

export class GroqAiProvider implements AiProvider {
  constructor(private fallback = new MockAiProvider()) {}

  async generateProductDescription(input: ProductDescriptionInput): Promise<ProductDescriptionOutput> {
    if (!env.groqApiKey) return this.fallback.generateProductDescription(input);

    const schema = {
      type: 'object',
      properties: {
        description: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
      },
      required: ['description', 'tags'],
      additionalProperties: false,
    };

    const prompt = input.locale === 'ar'
      ? `اكتب وصف منتج عربي قصير وجذاب لمنتج اسمه ${input.productName} في فئة ${input.category || 'عام'}. أرجع JSON فقط.`
      : `Write a concise high-converting ecommerce product description for ${input.productName} in ${input.category || 'General'}. Return JSON only.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [
          { role: 'system', content: 'You write ecommerce product copy and return valid JSON matching the schema.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_schema', json_schema: { name: 'product_description', schema } },
        temperature: 0.6,
      }),
    });

    if (!response.ok) return this.fallback.generateProductDescription(input);

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return this.fallback.generateProductDescription(input);

    try {
      const parsed = JSON.parse(content) as Partial<ProductDescriptionOutput>;
      if (typeof parsed.description === 'string' && Array.isArray(parsed.tags)) {
        return { description: parsed.description, tags: parsed.tags.filter((tag): tag is string => typeof tag === 'string') };
      }
    } catch {
      return this.fallback.generateProductDescription(input);
    }

    return this.fallback.generateProductDescription(input);
  }

  async suggestTemplate(input: TemplateSuggestionInput) {
    return this.fallback.suggestTemplate(input);
  }

  async answerStorefront(input: StorefrontAgentInput): Promise<{ answer: string; sources: string[] }> {
    if (!env.groqApiKey) return this.fallback.answerStorefront(input);

    const messages = [
      {
        role: 'system',
        content: input.locale === 'ar'
          ? `أنت وكيل مبيعات وخدمة عملاء لمتجر ${input.storeName}. أجب بالعربية بوضوح. استخدم فقط سياق المتجر المقدم. لا تخترع أسعاراً أو توفر منتجات. إذا لم تعرف، قل أنك ستساعد العميل بالتواصل مع المتجر.`
          : `You are a sales and support AI agent for ${input.storeName}. Use only the provided store context. Do not invent prices, availability, policies, or order data. If unsure, say you can help the shopper contact the store.`,
      },
      ...((input.conversation || []).slice(-6).map((message) => ({ role: message.role, content: message.content }))),
      {
        role: 'user',
        content: `Store category: ${input.category || 'General'}\nStore context:\n${input.context}\n\nCustomer question: ${input.question}`,
      },
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages,
        temperature: 0.35,
        max_tokens: 700,
      }),
    });

    if (!response.ok) return this.fallback.answerStorefront(input);
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const answer = data.choices?.[0]?.message?.content?.trim();
    return answer ? { answer, sources: input.context ? ['retrieved-store-context'] : [] } : this.fallback.answerStorefront(input);
  }

  async generateBusinessInsights(input: BusinessInsightInput): Promise<{ insights: BusinessInsight[] }> {
    if (!env.groqApiKey) return this.fallback.generateBusinessInsights(input);

    const schema = {
      type: 'object',
      properties: {
        insights: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['success', 'warning', 'tip', 'alert'] },
              title: { type: 'string' },
              description: { type: 'string' },
              action: { type: 'string' },
            },
            required: ['type', 'title', 'description', 'action'],
            additionalProperties: false,
          },
        },
      },
      required: ['insights'],
      additionalProperties: false,
    };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: 'You are a senior ecommerce growth advisor. Return JSON only. Recommendations must be practical for Egyptian SMB merchants.' },
          { role: 'user', content: `Store: ${input.storeName}\nCategory: ${input.category || 'General'}\nLocale: ${input.locale}\nQuestion: ${input.question || 'Give a prioritized store growth review'}\nData: ${JSON.stringify(input.storeData)}` },
        ],
        response_format: { type: 'json_schema', json_schema: { name: 'business_insights', schema } },
        temperature: 0.45,
      }),
    });

    if (!response.ok) return this.fallback.generateBusinessInsights(input);
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return this.fallback.generateBusinessInsights(input);
    try {
      const parsed = JSON.parse(content) as { insights?: BusinessInsight[] };
      if (Array.isArray(parsed.insights)) return { insights: parsed.insights };
    } catch {
      return this.fallback.generateBusinessInsights(input);
    }
    return this.fallback.generateBusinessInsights(input);
  }

  async *streamChat(input: BusinessInsightInput & { messageHistory?: Array<{ role: 'user' | 'assistant'; content: string }> }): AsyncGenerator<string, void, unknown> {
    if (!env.groqApiKey) {
      yield* this.fallback.streamChat(input);
      return;
    }

    const messages = [
      {
        role: 'system',
        content: input.locale === 'ar'
          ? `أنت مستشار أعمال متخصص لمتجر ${input.storeName}. أجب بالعربية. حلل البيانات المقدمة وقدم توصيات عملية وعرض تقارير أداء. كن دقيقاً ومحدداً.`
          : `You are a business advisor for ${input.storeName}. Analyze store data and provide actionable recommendations, performance reports, and insights. Be specific and practical.`,
      },
      ...(input.messageHistory || []).slice(-10).map((m) => ({ role: m.role, content: m.content })),
      {
        role: 'user',
        content: input.question
          ? `Store Data: ${JSON.stringify(input.storeData)}\n\nQuestion: ${input.question}`
          : `Store Data: ${JSON.stringify(input.storeData)}\n\nGive me a store performance overview with actionable recommendations.`,
      },
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages,
        temperature: 0.4,
        max_tokens: 1200,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      yield* this.fallback.streamChat(input);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const json = JSON.parse(trimmed.slice(6));
          const content = json.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch {
          // skip parse errors
        }
      }
    }
  }
}

export const aiProvider: AiProvider = new GroqAiProvider();
