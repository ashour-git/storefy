import { auth } from '../../../../lib/auth';
import { headers } from 'next/headers';
import { env } from '../../../../lib/env';

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as { prompt?: string; storeName?: string; locale?: string };
    const promptText = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    const storeName = typeof body.storeName === 'string' ? body.storeName.trim() : 'My Store';
    const isArabic = body.locale === 'ar';

    // Lowercase prompt for local mock matchers if Groq is not configured
    const pl = promptText.toLowerCase();

    // Default Mock Presets
    let tokens = {
      primaryColor: '#818cf8',
      secondaryColor: '#4f46e5',
      backgroundColor: '#06090f',
      textColor: '#f1f5f9',
      fontFamily: 'Inter',
      borderRadius: '12px'
    };

    let blocks = [
      {
        id: 'promo-ai',
        type: 'promo',
        settings: {
          text: isArabic ? 'شحن مجاني للطلبات فوق 500 جنيه!' : 'Grand Opening: Free shipping on all orders over 500 EGP!',
          textColor: '#ffffff',
          bgColor: 'var(--store-primary)'
        }
      },
      {
        id: 'hero-ai',
        type: 'hero',
        settings: {
          title: isArabic ? `مرحباً بك في ${storeName}` : `Welcome to ${storeName}`,
          subtitle: isArabic ? 'اكتشف مجموعتنا الحصرية من العطور الفاخرة المصنوعة بعناية.' : 'Explore our collection of premium, hand-selected perfumes crafted for you.',
          buttonText: isArabic ? 'تسوق الآن' : 'Shop Now',
          buttonLink: '#collection',
          alignment: 'center',
          bgType: 'gradient',
          gradientFrom: '#0f172a',
          gradientTo: '#1e293b',
          emoji: 'sparkles'
        }
      },
      {
        id: 'features-ai',
        type: 'features',
        settings: {
          items: [
            { 
              title: isArabic ? 'جودة فاخرة' : 'Premium Quality', 
              desc: isArabic ? 'زيوت عطرية نقية ومستدامة.' : 'Formulated with premium concentration oils.', 
              emoji: 'droplet' 
            },
            { 
              title: isArabic ? 'ثبات يدوم' : 'Long Lasting', 
              desc: isArabic ? 'عطور تدوم معك طوال اليوم.' : 'Fragrance presence that stays with you.', 
              emoji: 'clock' 
            },
            { 
              title: isArabic ? 'شحن سريع' : 'Fast Delivery', 
              desc: isArabic ? 'توصيل آمن لجميع المحافظات.' : 'Secure checkout and fast transit.', 
              emoji: 'shipping' 
            }
          ]
        }
      },
      {
        id: 'collection-ai',
        type: 'collection',
        settings: {
          title: isArabic ? 'الأكثر مبيعاً' : 'Best Sellers',
          subtitle: isArabic ? 'عطورنا الأكثر تميزاً وطلباً.' : 'Explore our catalog of popular scents.',
          limit: 8
        }
      },
      {
        id: 'newsletter-ai',
        type: 'newsletter',
        settings: {
          title: isArabic ? 'اشترك في نشرتنا البريدية' : 'Subscribe to our Newsletter',
          subtitle: isArabic ? 'كن أول من يعلم بإصداراتنا الجديدة والعروض الحصرية.' : 'Get updates on new drops and exclusive private sales.',
          buttonText: isArabic ? 'اشتراك' : 'Subscribe',
          placeholder: isArabic ? 'البريد الإلكتروني...' : 'Enter your email address...'
        }
      }
    ];

    // Local rules for Mock AI generation
    if (pl.includes('dark') || pl.includes('oud') || pl.includes('عود') || pl.includes('black') || pl.includes('noir')) {
      tokens = {
        primaryColor: '#b45309', // Amber gold
        secondaryColor: '#451a03', // Dark wood
        backgroundColor: '#0c0a09', // Warm dark
        textColor: '#f5f5f4',
        fontFamily: 'Playfair Display',
        borderRadius: '6px'
      };
      blocks[1].settings.title = isArabic ? `سحر العود الأصيل من ${storeName}` : `The Essence of Pure Oud by ${storeName}`;
      blocks[1].settings.subtitle = isArabic 
        ? 'عطور عود ملكية مستوحاة من التراث العربي الأصيل ومركبة يدوياً.' 
        : 'Royal agarwood blends inspired by Arabian heritage, hand-matured for deep presence.';
      blocks[1].settings.gradientFrom = '#1c1917';
      blocks[1].settings.gradientTo = '#0c0a09';
      blocks[1].settings.emoji = 'tree';
    } else if (pl.includes('neon') || pl.includes('cyber') || pl.includes('midnight') || pl.includes('ليل')) {
      tokens = {
        primaryColor: '#c084fc', // Neon purple
        secondaryColor: '#22d3ee', // Cyan
        backgroundColor: '#090514', // Cyber dark
        textColor: '#f3e8ff',
        fontFamily: 'Outfit',
        borderRadius: '16px'
      };
      blocks[1].settings.title = isArabic ? `عطور عصرية ونبضات ليلية` : `Vibrant Scents, Neon Nights`;
      blocks[1].settings.subtitle = isArabic 
        ? 'تجاوز المألوف مع تشكيلة عطور شبابية وجريئة تميز حضورك.' 
        : 'Bold, synthetic and natural botanical extracts blended for the modern aesthetic. Defy tradition.';
      blocks[1].settings.gradientFrom = '#020024';
      blocks[1].settings.gradientTo = '#090514';
      blocks[1].settings.emoji = 'lightning';
    } else if (pl.includes('fresh') || pl.includes('citrus') || pl.includes('clean') || pl.includes('صيف') || pl.includes('ورد')) {
      tokens = {
        primaryColor: '#0f766e', // Teal
        secondaryColor: '#0d9488',
        backgroundColor: '#f0fdfa', // Fresh light
        textColor: '#115e59',
        fontFamily: 'Inter',
        borderRadius: '8px'
      };
      blocks[1].settings.title = isArabic ? `انتعاش الطبيعة الفواحة` : `Fresh Botanicals & Sunny Citrus`;
      blocks[1].settings.subtitle = isArabic 
        ? 'عطور صيفية خفيفة ومنعشة مستخلصة من الحمضيات والأزهار الطبيعية.' 
        : 'Lighter, clean, and breezy fragrances designed for daily wear. Invigorate your senses.';
      blocks[1].settings.gradientFrom = '#0f766e';
      blocks[1].settings.gradientTo = '#134e4a';
      blocks[1].settings.emoji = 'leaf';
    }

    // Call Groq API if API Key is configured
    if (env.groqApiKey) {
      try {
        const schema = {
          type: 'object',
          properties: {
            tokens: {
              type: 'object',
              properties: {
                primaryColor: { type: 'string' },
                secondaryColor: { type: 'string' },
                backgroundColor: { type: 'string' },
                textColor: { type: 'string' },
                fontFamily: { type: 'string', enum: ['Playfair Display', 'Outfit', 'Inter'] },
                borderRadius: { type: 'string' }
              },
              required: ['primaryColor', 'secondaryColor', 'backgroundColor', 'textColor', 'fontFamily', 'borderRadius'],
              additionalProperties: false
            },
            blocks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  type: { type: 'string', enum: ['promo', 'hero', 'features', 'collection', 'newsletter', 'gallery'] },
                  settings: { type: 'object' }
                },
                required: ['id', 'type', 'settings'],
                additionalProperties: false
              }
            }
          },
          required: ['tokens', 'blocks'],
          additionalProperties: false
        };

        const systemPrompt = `You are a high-end conversion-focused ecommerce designer. 
        You will return a JSON matching the exact schema representing tokens and layout blocks configuration.
        Generate colors (in hex format) and layouts perfectly suited for the merchant's description.
        Write highly appealing copywriting (headlines, subtitles, and buttons) that matches the store theme.
        IMPORTANT: Write the copywriting in ${isArabic ? 'Arabic (العربية)' : 'English'}.
        Translate store name "${storeName}" or use it as is.
        Return ONLY valid JSON matching the schema.`;

        const userPrompt = `Store Name: ${storeName}
        Merchant Idea: ${promptText}
        Output Locale: ${isArabic ? 'ar' : 'en'}`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.groqApiKey}`
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-120b',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_schema', json_schema: { name: 'design_suggestion', schema } },
            temperature: 0.5
          })
        });

        if (response.ok) {
          const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content) as { tokens: typeof tokens; blocks: typeof blocks };
            if (parsed.tokens && Array.isArray(parsed.blocks)) {
              tokens = parsed.tokens;
              blocks = parsed.blocks;
            }
          }
        }
      } catch (err) {
        console.error('Groq design call failed, fallback used:', err);
      }
    }

    return Response.json({ tokens, blocks });
  } catch (error: unknown) {
    return Response.json({ error: 'AI customizer suggest failed' }, { status: 500 });
  }
}
