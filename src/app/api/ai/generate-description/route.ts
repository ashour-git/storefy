import { auth } from '../../../../lib/auth';
import { headers } from 'next/headers';
import { db } from '../../../../db';
import * as schema from '../../../../db/schema';
import { eq } from 'drizzle-orm';

// Simple in-memory rate limiting map: tenantId -> { count, resetTime }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's first store to scope limit by tenant
    const stores = await db.select().from(schema.tenants).where(eq(schema.tenants.ownerId, session.user.id));
    const store = stores[0];
    if (!store) {
      return Response.json({ error: 'No store found' }, { status: 404 });
    }
    const tenantId = store.id;

    // Rate Limiting: 10 requests per minute per tenant
    const now = Date.now();
    const limitInfo = rateLimitMap.get(tenantId) || { count: 0, resetTime: now + 60000 };

    if (now > limitInfo.resetTime) {
      limitInfo.count = 1;
      limitInfo.resetTime = now + 60000;
    } else {
      limitInfo.count += 1;
    }
    rateLimitMap.set(tenantId, limitInfo);

    if (limitInfo.count > 10) {
      return Response.json({ error: 'Too many requests. Limit is 10 requests per minute.' }, { status: 429 });
    }

    const body = await request.json();
    const { productName, category, locale } = body;

    const trimmedProductName = typeof productName === 'string' ? productName.trim() : '';
    const trimmedCategory = typeof category === 'string' ? category.trim() : '';
    const validLocale = locale === 'ar' ? 'ar' : 'en';

    if (!trimmedProductName) {
      return Response.json({ error: 'Product name is required for generation' }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return Response.json({ error: 'AI description service is not configured (GROQ_API_KEY is missing).' }, { status: 503 });
    }

    // Construct prompts
    const prompt = validLocale === 'ar'
      ? `أنت كاتب محتوى تسويقي محترف. اكتب وصفًا جذابًا، مشوقًا ومحسنًا لمحركات البحث (SEO) لمنتج بالاسم التالي: "${trimmedProductName}" في تصنيف: "${trimmedCategory || 'عام'}". الوصف يجب أن يكون باللغة العربية، بأسلوب احترافي وجذاب، ومقسم إلى فقرات قصيرة مع إبراز الفوائد الرئيسية للمنتج.`
      : `You are a professional e-commerce copywriter. Write a compelling, engaging, and SEO-optimized product description for a product named "${trimmedProductName}" in the category "${trimmedCategory || 'General'}". The description must be in English, written in a premium and persuasive brand voice, structured into short paragraphs with a bulleted list of key features/benefits.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that writes high-converting product descriptions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Groq API Error:', errBody);
      return Response.json({ error: 'Failed to generate description from AI service' }, { status: 502 });
    }

    const data = await response.json();
    const description = data.choices?.[0]?.message?.content?.trim() || '';

    return Response.json({ description });
  } catch (error: any) {
    console.error('AI description generation error:', error);
    return Response.json({ error: 'Failed to generate description', details: error.message }, { status: 500 });
  }
}
