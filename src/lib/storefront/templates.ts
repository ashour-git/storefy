import type { Locale } from '../i18n';
import type { StoreTemplate, StoreVertical, StorefrontBlock } from './types';

const commonTrust = [
  {
    title: { en: 'Pay your way', ar: 'ادفع بطريقتك' },
    text: { en: 'Paymob-ready online payments and cash on delivery.', ar: 'جاهز لمدفوعات باي موب والدفع عند الاستلام.' },
  },
  {
    title: { en: 'Fast local delivery', ar: 'توصيل محلي سريع' },
    text: { en: 'Built for Egyptian cities and local customer expectations.', ar: 'مصمم للمدن المصرية وتوقعات العملاء المحليين.' },
  },
  {
    title: { en: 'Secure checkout', ar: 'دفع آمن' },
    text: { en: 'Tenant-isolated orders with clear confirmation.', ar: 'طلبات معزولة لكل متجر مع تأكيد واضح.' },
  },
] satisfies StorefrontBlock['settings'][];

export const storeTemplates: StoreTemplate[] = [
  {
    id: 'luxe-perfume',
    vertical: 'perfume',
    name: { en: 'Luxe Perfume House', ar: 'بيت العطور الفاخر' },
    description: { en: 'A premium fragrance storefront with editorial storytelling and rich product focus.', ar: 'واجهة عطور فاخرة بسرد راق وتركيز قوي على المنتجات.' },
    qualityTags: ['luxury', 'beauty', 'arabic-ready', 'mobile-first'],
    tokens: {
      primaryColor: '#7c2d12',
      secondaryColor: '#1c1917',
      backgroundColor: '#fffaf3',
      surfaceColor: '#ffffff',
      textColor: '#1c1917',
      mutedTextColor: '#7c6f64',
      accentColor: '#d97706',
      fontFamily: 'Outfit',
      headingFontFamily: 'Playfair Display',
      borderRadius: '22px',
      heroPattern: 'radial',
    },
    demoProducts: [
      { name: { en: 'Amber Oud Signature', ar: 'عنبر عود سيجنتشر' }, description: { en: 'Warm amber, oud, and soft vanilla for evening presence.', ar: 'عنبر دافئ وعود وفانيليا ناعمة لحضور مسائي.' }, basePrice: '1450.00', sku: 'PERF-AMB-OUD', stockQty: 18 },
      { name: { en: 'Cairo Musk Veil', ar: 'مسك القاهرة' }, description: { en: 'Clean musk with jasmine and sandalwood for daily elegance.', ar: 'مسك نقي مع ياسمين وخشب صندل لأناقة يومية.' }, basePrice: '950.00', sku: 'PERF-MUSK', stockQty: 25 },
      { name: { en: 'Nile Citrus Bloom', ar: 'حمضيات النيل' }, description: { en: 'Bright citrus, neroli, and fresh cedar for daytime wear.', ar: 'حمضيات مشرقة ونيرولي وأرز منعش للاستخدام اليومي.' }, basePrice: '780.00', sku: 'PERF-CITRUS', stockQty: 30 },
    ],
    blocks: [
      { id: 'promo', type: 'promo', settings: { tone: 'dark', text: { en: 'Launch offer: free delivery over 1,000 EGP', ar: 'عرض الافتتاح: توصيل مجاني للطلبات فوق 1000 جنيه' } } },
      { id: 'hero', type: 'hero', settings: { eyebrow: { en: 'Egyptian fragrance atelier', ar: 'أتيليه عطور مصري' }, title: { en: 'Scents that feel personal before the first spray', ar: 'عطور تشبهك من أول رشة' }, subtitle: { en: 'Discover long-lasting perfume blends crafted for warm evenings, daily rituals, and unforgettable gifts.', ar: 'اكتشف خلطات عطرية ثابتة مصممة للمساء والروتين اليومي والهدايا المميزة.' }, primaryCta: { en: 'Shop the collection', ar: 'تسوق المجموعة' }, secondaryCta: { en: 'Explore the story', ar: 'اعرف الحكاية' }, imageLabel: { en: 'Signature amber bottle', ar: 'زجاجة العنبر المميزة' } } },
      { id: 'trust', type: 'trustStrip', settings: { items: commonTrust as never } },
      { id: 'categories', type: 'categoryTiles', settings: { title: { en: 'Choose your mood', ar: 'اختر مزاجك' }, subtitle: { en: 'Collections built around moments, not generic notes.', ar: 'مجموعات مبنية حول اللحظات لا النوتات فقط.' }, items: [
        { title: { en: 'Evening Oud', ar: 'عود مسائي' }, text: { en: 'Deep, warm, and memorable.', ar: 'عميق ودافئ ولا ينسى.' } },
        { title: { en: 'Daily Musk', ar: 'مسك يومي' }, text: { en: 'Clean confidence for every day.', ar: 'ثقة ناعمة لكل يوم.' } },
        { title: { en: 'Fresh Citrus', ar: 'حمضيات منعشة' }, text: { en: 'Bright openings for hot days.', ar: 'انتعاش مناسب للأيام الحارة.' } },
      ] } },
      { id: 'collection', type: 'collection', settings: { title: { en: 'Bestselling scents', ar: 'الأكثر مبيعاً' }, subtitle: { en: 'Ready-to-ship favorites from the first drop.', ar: 'اختيارات جاهزة للشحن من أول إصدار.' }, limit: 8 } },
      { id: 'spotlight', type: 'spotlight', settings: { title: { en: 'Made for Egyptian weather', ar: 'مصمم لأجواء مصر' }, text: { en: 'Each formula is selected for presence, longevity, and comfort in warm climates.', ar: 'كل تركيبة مختارة للحضور والثبات والراحة في الأجواء الدافئة.' }, bullets: [{ en: 'Long-lasting blends', ar: 'خلطات ثابتة' }, { en: 'Gift-ready packaging', ar: 'تغليف مناسب للهدايا' }, { en: 'COD and online payments', ar: 'دفع إلكتروني أو عند الاستلام' }] } },
      { id: 'testimonials', type: 'testimonials', settings: { title: { en: 'Loved by early customers', ar: 'آراء عملائنا' }, items: [
        { name: 'Laila K.', rating: 5, text: { en: 'The amber blend smells expensive and lasts all night.', ar: 'خلطة العنبر فاخرة وثابتة طوال الليل.' } },
        { name: 'Omar H.', rating: 5, text: { en: 'Packaging felt premium enough to gift immediately.', ar: 'التغليف راق وجاهز كهدية مباشرة.' } },
      ] } },
      { id: 'faq', type: 'faq', settings: { title: { en: 'Before you order', ar: 'قبل الطلب' }, items: [
        { question: { en: 'Can I pay on delivery?', ar: 'هل يمكن الدفع عند الاستلام؟' }, answer: { en: 'Yes, COD is available alongside online payment.', ar: 'نعم، الدفع عند الاستلام متاح بجانب الدفع الإلكتروني.' } },
        { question: { en: 'How fast is delivery?', ar: 'ما مدة التوصيل؟' }, answer: { en: 'Delivery timing depends on city and is confirmed after checkout.', ar: 'مدة التوصيل حسب المدينة ويتم تأكيدها بعد الطلب.' } },
      ] } },
    ],
  },
  {
    id: 'street-fashion',
    vertical: 'fashion',
    name: { en: 'Modern Fashion Drop', ar: 'دروب أزياء عصري' },
    description: { en: 'A bold drop-style storefront for apparel, sneakers, and accessories.', ar: 'واجهة قوية بنظام الدروبات للملابس والأحذية والإكسسوارات.' },
    qualityTags: ['fashion', 'drop', 'mobile-first'],
    tokens: { primaryColor: '#111827', secondaryColor: '#ef4444', backgroundColor: '#f8fafc', surfaceColor: '#ffffff', textColor: '#111827', mutedTextColor: '#64748b', accentColor: '#ef4444', fontFamily: 'Outfit', headingFontFamily: 'Outfit', borderRadius: '18px', heroPattern: 'grid' },
    demoProducts: [
      { name: { en: 'Oversized Cotton Tee', ar: 'تيشيرت قطن أوفر سايز' }, description: { en: 'Heavyweight cotton with a relaxed Cairo street fit.', ar: 'قطن ثقيل بقصة ستريت مريحة.' }, basePrice: '420.00', sku: 'FASH-TEE', stockQty: 40 },
      { name: { en: 'Minimal Crossbody Bag', ar: 'شنطة كروس بسيطة' }, description: { en: 'Daily carry bag with clean hardware and water-resistant fabric.', ar: 'شنطة يومية بخامات مقاومة للماء وتفاصيل بسيطة.' }, basePrice: '690.00', sku: 'FASH-BAG', stockQty: 16 },
      { name: { en: 'Wide-Leg Utility Pants', ar: 'بنطلون واسع عملي' }, description: { en: 'Structured pants with utility pockets and soft drape.', ar: 'بنطلون منظم بجيوب عملية وقصة مريحة.' }, basePrice: '880.00', sku: 'FASH-PANTS', stockQty: 22 },
    ],
    blocks: buildVerticalBlocks('fashion', {
      promo: { en: 'New drop is live: limited pieces, fast delivery', ar: 'الدروب الجديد متاح: كميات محدودة وتوصيل سريع' },
      eyebrow: { en: 'Limited fashion drops', ar: 'دروبات أزياء محدودة' },
      title: { en: 'Pieces that move from street to night', ar: 'قطع تناسب الشارع والليل' },
      subtitle: { en: 'Launch a fashion store with campaign-ready sections, product storytelling, and mobile-first buying.', ar: 'أطلق متجر أزياء بأقسام جاهزة للحملات وسرد قوي للمنتجات وتجربة شراء ممتازة على الموبايل.' },
      collection: { en: 'Latest drop', ar: 'أحدث دروب' },
    }),
  },
  {
    id: 'sweet-bakery',
    vertical: 'food',
    name: { en: 'Local Bakery Launch', ar: 'مخبوزات محلية' },
    description: { en: 'Warm food storefront for desserts, bakeries, snacks, and local kitchens.', ar: 'واجهة دافئة للحلويات والمخبوزات والمطابخ المحلية.' },
    qualityTags: ['food', 'local-delivery', 'warm'],
    tokens: { primaryColor: '#be123c', secondaryColor: '#78350f', backgroundColor: '#fff7ed', surfaceColor: '#ffffff', textColor: '#431407', mutedTextColor: '#9a6b4f', accentColor: '#f59e0b', fontFamily: 'Outfit', headingFontFamily: 'Playfair Display', borderRadius: '26px', heroPattern: 'radial' },
    demoProducts: [
      { name: { en: 'Pistachio Kunafa Box', ar: 'علبة كنافة بالفستق' }, description: { en: 'Crunchy kunafa layers with rich pistachio cream.', ar: 'طبقات كنافة مقرمشة بكريمة فستق غنية.' }, basePrice: '360.00', sku: 'FOOD-KUNAFA', stockQty: 15 },
      { name: { en: 'Mini Dessert Tray', ar: 'صينية حلويات ميني' }, description: { en: 'Mixed bites for gatherings and office treats.', ar: 'تشكيلة صغيرة للمناسبات والمكتب.' }, basePrice: '520.00', sku: 'FOOD-TRAY', stockQty: 10 },
      { name: { en: 'Date Caramel Cookies', ar: 'كوكيز تمر وكراميل' }, description: { en: 'Soft cookies with date caramel and sea salt.', ar: 'كوكيز طرية بكراميل التمر ورشة ملح.' }, basePrice: '190.00', sku: 'FOOD-COOKIE', stockQty: 35 },
    ],
    blocks: buildVerticalBlocks('food', {
      promo: { en: 'Same-day delivery for orders before 4 PM', ar: 'توصيل في نفس اليوم للطلبات قبل ٤ مساءً' },
      eyebrow: { en: 'Fresh every morning', ar: 'طازج كل صباح' },
      title: { en: 'Desserts that arrive celebration-ready', ar: 'حلويات تصل جاهزة للاحتفال' },
      subtitle: { en: 'Showcase bestsellers, delivery promises, and occasion boxes with a storefront made for cravings.', ar: 'اعرض الأكثر مبيعاً ووعود التوصيل وبوكسات المناسبات بواجهة تفتح الشهية.' },
      collection: { en: 'Today\'s favorites', ar: 'اختيارات اليوم' },
    }),
  },
  {
    id: 'tech-accessories',
    vertical: 'electronics',
    name: { en: 'Tech Accessories Pro', ar: 'إكسسوارات تقنية برو' },
    description: { en: 'Clean, trust-heavy storefront for gadgets and accessories.', ar: 'واجهة منظمة وموثوقة للإكسسوارات والأجهزة.' },
    qualityTags: ['electronics', 'trust', 'specs'],
    tokens: { primaryColor: '#2563eb', secondaryColor: '#0f172a', backgroundColor: '#f8fafc', surfaceColor: '#ffffff', textColor: '#0f172a', mutedTextColor: '#64748b', accentColor: '#22c55e', fontFamily: 'Inter', headingFontFamily: 'Outfit', borderRadius: '16px', heroPattern: 'grid' },
    demoProducts: [
      { name: { en: 'MagSafe Power Bank 10K', ar: 'باور بانك ماج سيف 10000' }, description: { en: 'Compact magnetic charging with fast USB-C output.', ar: 'شحن مغناطيسي مدمج مع مخرج USB-C سريع.' }, basePrice: '1290.00', sku: 'TECH-PB10K', stockQty: 14 },
      { name: { en: 'Noise-Canceling Earbuds', ar: 'سماعات عزل ضوضاء' }, description: { en: 'Clear calls, deep bass, and long battery life.', ar: 'مكالمات واضحة وباس قوي وبطارية طويلة.' }, basePrice: '1750.00', sku: 'TECH-BUDS', stockQty: 20 },
      { name: { en: 'Braided USB-C Cable', ar: 'كابل USB-C مجدول' }, description: { en: 'Durable fast-charge cable for daily carry.', ar: 'كابل شحن سريع ومتين للاستخدام اليومي.' }, basePrice: '240.00', sku: 'TECH-CABLE', stockQty: 80 },
    ],
    blocks: buildVerticalBlocks('electronics', {
      promo: { en: 'Warranty-backed accessories with Cairo delivery', ar: 'إكسسوارات بضمان وتوصيل داخل القاهرة' },
      eyebrow: { en: 'Reliable tech essentials', ar: 'أساسيات تقنية موثوقة' },
      title: { en: 'Gadgets customers can trust at checkout', ar: 'منتجات تقنية يثق بها العميل عند الدفع' },
      subtitle: { en: 'Highlight specs, warranty promises, and fast checkout in a clean electronics storefront.', ar: 'اعرض المواصفات والضمان والدفع السريع في واجهة تقنية منظمة.' },
      collection: { en: 'Top accessories', ar: 'أفضل الإكسسوارات' },
    }),
  },
  {
    id: 'artisan-home',
    vertical: 'handmade',
    name: { en: 'Artisan Home Studio', ar: 'استوديو البيت اليدوي' },
    description: { en: 'Editorial storefront for handmade decor, candles, ceramics, and home goods.', ar: 'واجهة تحريرية للديكور اليدوي والشموع والسيراميك.' },
    qualityTags: ['handmade', 'storytelling', 'home'],
    tokens: { primaryColor: '#0f766e', secondaryColor: '#44403c', backgroundColor: '#f7f3ea', surfaceColor: '#ffffff', textColor: '#292524', mutedTextColor: '#78716c', accentColor: '#ca8a04', fontFamily: 'Outfit', headingFontFamily: 'Playfair Display', borderRadius: '24px', heroPattern: 'radial' },
    demoProducts: [
      { name: { en: 'Hand-Poured Soy Candle', ar: 'شمعة صويا مصبوبة يدوياً' }, description: { en: 'Soft amber scent in reusable ceramic cup.', ar: 'رائحة عنبر هادئة في كوب سيراميك قابل لإعادة الاستخدام.' }, basePrice: '310.00', sku: 'HOME-CANDLE', stockQty: 18 },
      { name: { en: 'Textured Ceramic Vase', ar: 'فازة سيراميك منقوشة' }, description: { en: 'Small-batch vase shaped and glazed by hand.', ar: 'فازة محدودة مصنوعة ومطلية يدوياً.' }, basePrice: '720.00', sku: 'HOME-VASE', stockQty: 7 },
      { name: { en: 'Woven Table Runner', ar: 'مفرش طاولة منسوج' }, description: { en: 'Natural cotton runner for warm dining setups.', ar: 'مفرش قطن طبيعي لسفرة دافئة.' }, basePrice: '460.00', sku: 'HOME-RUNNER', stockQty: 11 },
    ],
    blocks: buildVerticalBlocks('handmade', {
      promo: { en: 'Small-batch pieces, crafted locally', ar: 'قطع محدودة مصنوعة محلياً' },
      eyebrow: { en: 'Made by hand', ar: 'مصنوع يدوياً' },
      title: { en: 'Home pieces with a maker\'s story', ar: 'قطع منزلية وراءها حكاية صانع' },
      subtitle: { en: 'Turn handmade products into a premium catalog with story, texture, and trust.', ar: 'حوّل المنتجات اليدوية إلى كتالوج راق بسرد وملمس وثقة.' },
      collection: { en: 'Studio favorites', ar: 'اختيارات الاستوديو' },
    }),
  },
];

function buildVerticalBlocks(vertical: StoreVertical, copy: {
  promo: Record<Locale, string>;
  eyebrow: Record<Locale, string>;
  title: Record<Locale, string>;
  subtitle: Record<Locale, string>;
  collection: Record<Locale, string>;
}): StorefrontBlock[] {
  return [
    { id: `${vertical}-promo`, type: 'promo', settings: { tone: 'accent', text: copy.promo } },
    { id: `${vertical}-hero`, type: 'hero', settings: { eyebrow: copy.eyebrow, title: copy.title, subtitle: copy.subtitle, primaryCta: { en: 'Shop now', ar: 'تسوق الآن' }, secondaryCta: { en: 'Why customers trust us', ar: 'لماذا يثق بنا العملاء' }, imageLabel: copy.collection } },
    { id: `${vertical}-trust`, type: 'trustStrip', settings: { items: commonTrust as never } },
    { id: `${vertical}-collection`, type: 'collection', settings: { title: copy.collection, subtitle: { en: 'Launch-ready products for your first storefront impression.', ar: 'منتجات جاهزة لأول انطباع قوي لمتجرك.' }, limit: 8 } },
    { id: `${vertical}-benefits`, type: 'benefits', settings: { title: { en: 'Why shoppers choose us', ar: 'لماذا يختارنا العملاء' }, items: [
      { title: { en: 'Clear product promise', ar: 'وعد منتج واضح' }, text: { en: 'Each product card explains value fast.', ar: 'كل بطاقة منتج توضح القيمة بسرعة.' } },
      { title: { en: 'Mobile-first shopping', ar: 'تسوق ممتاز على الموبايل' }, text: { en: 'Designed for customers browsing from social links.', ar: 'مصمم للعملاء القادمين من روابط السوشيال.' } },
      { title: { en: 'Local payment fit', ar: 'دفع مناسب للسوق المحلي' }, text: { en: 'COD and online payment paths are ready.', ar: 'الدفع عند الاستلام والإلكتروني جاهزان.' } },
    ] } },
    { id: `${vertical}-faq`, type: 'faq', settings: { title: { en: 'Questions before checkout', ar: 'أسئلة قبل الطلب' }, items: [
      { question: { en: 'Can I pay cash on delivery?', ar: 'هل الدفع عند الاستلام متاح؟' }, answer: { en: 'Yes, this store can accept COD orders.', ar: 'نعم، يمكن للمتجر استقبال طلبات الدفع عند الاستلام.' } },
      { question: { en: 'Are online payments available?', ar: 'هل الدفع الإلكتروني متاح؟' }, answer: { en: 'Online checkout works in demo mode and can connect to Paymob when configured.', ar: 'الدفع الإلكتروني يعمل تجريبياً ويمكن ربطه بباي موب عند التفعيل.' } },
    ] } },
  ];
}

export function getTemplateById(id: string | null | undefined): StoreTemplate {
  return storeTemplates.find((template) => template.id === id) || storeTemplates[0];
}

export function getTemplateForVertical(vertical: string | null | undefined): StoreTemplate {
  return storeTemplates.find((template) => template.vertical === vertical) || storeTemplates[0];
}
