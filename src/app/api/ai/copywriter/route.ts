import { auth } from '../../../../lib/auth';
import { headers } from 'next/headers';
import { env } from '../../../../lib/env';

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as { currentText?: string; fieldName?: string; storeName?: string; category?: string; locale?: string };
    const currentText = typeof body.currentText === 'string' ? body.currentText.trim() : '';
    const fieldName = typeof body.fieldName === 'string' ? body.fieldName.trim() : 'Headline';
    const storeName = typeof body.storeName === 'string' ? body.storeName.trim() : 'Our Store';
    const category = typeof body.category === 'string' ? body.category.trim() : 'Perfumes';
    const isArabic = body.locale === 'ar';

    // Standard Mock fallback copywriter suggestions
    let suggestions = isArabic ? [
      `أفضل المنتجات المختارة في ${category} من ${storeName}`,
      `اكتشف الفخامة والأناقة الحصرية مع تشكيلة ${storeName}`,
      `${storeName} | جودة استثنائية وتوصيل سريع لباب بيتك`
    ] : [
      `Premium ${category} Curated by ${storeName}`,
      `Discover Exclusive Luxury & Quality at ${storeName}`,
      `${storeName} | Handcrafted Excellence Delivered to Your Door`
    ];

    if (fieldName.toLowerCase().includes('sub') || fieldName.toLowerCase().includes('desc')) {
      suggestions = isArabic ? [
        `مجموعات عطرية حصرية تم تحضيرها بعناية لتعزز حضورك اليومي وتمنحك ثقة تدوم.`,
        `تسوق منتجاتنا الأصلية بنسبة 100% مع ضمان استرجاع مجاني وشحن مجاني وسريع للطلبات.`,
        `نوفر لك تشكيلة رائعة تناسب جميع الأوقات ومصممة بأيدي خبراء للحصول على أفضل جودة.`
      ] : [
        `Curated collections crafted by experts to define your presence and elevate your daily experience.`,
        `Shop 100% authentic items with secure checkout, free shipping options, and easy returns.`,
        `A signature collection balanced for day, night, and memories. Crafted with high concentrations.`
      ];
    } else if (fieldName.toLowerCase().includes('promo') || fieldName.toLowerCase().includes('banner')) {
      suggestions = isArabic ? [
        `عرض محدود: خصم 15% على جميع المنتجات بمناسبة الافتتاح! كود: LAUNCH`,
        `شحن مجاني بالكامل لجميع المحافظات للطلبات التي تزيد عن 500 جنيه!`,
        `توصيل سريع خلال 24-48 ساعة لجميع المحافظات والدفع عند الاستلام.`
      ] : [
        `Limited Time: Enjoy 15% OFF your first order! Use code: LAUNCH`,
        `COMPLIMENTARY SHIPPING: Free standard shipping on all orders over 500 EGP.`,
        `Express Delivery: Receive your scents in 24-48 hours with Cash on Delivery.`
      ];
    } else if (fieldName.toLowerCase().includes('button') || fieldName.toLowerCase().includes('cta')) {
      suggestions = isArabic ? [
        `تسوق المجموعة الآن`,
        `اكتشف المزيد`,
        `احصل على العرض`
      ] : [
        `Shop the Collection`,
        `Explore Scent Range`,
        `Claim Your Offer`
      ];
    }

    if (env.groqApiKey) {
      try {
        const prompt = `You are a professional ecommerce copywriter specializing in high-converting storefront messaging.
        For a store named "${storeName}" in the category of "${category}", rewrite the following text for the field "${fieldName}".
        Current text is: "${currentText}".
        Provide exactly 3 distinct, creative, and highly appealing alternatives.
        IMPORTANT: Respond in ${isArabic ? 'Arabic (العربية)' : 'English'}.
        Your response must be a valid JSON array of 3 strings. Return JSON only. No explanations.`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.groqApiKey}`
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-120b',
            messages: [
              { role: 'system', content: 'You are a professional ecommerce copywriter. You suggest 3 text options as a JSON array of strings.' },
              { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7
          })
        });

        if (response.ok) {
          const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            const list = Array.isArray(parsed) ? parsed : parsed.suggestions || parsed.options || Object.values(parsed)[0];
            if (Array.isArray(list) && list.length >= 3) {
              suggestions = list.slice(0, 3).map(String);
            }
          }
        }
      } catch (err) {
        console.error('Groq copywriter call failed, fallback used:', err);
      }
    }

    return Response.json({ suggestions });
  } catch (error: unknown) {
    return Response.json({ error: 'AI copywriter failed' }, { status: 500 });
  }
}
