import type { Locale } from '../i18n';
import type { StoreTemplate, StoreVertical } from './types';

const commonTrust: Record<string, any>[] = [
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
];

export const storeTemplates = [
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
  {
    id: 'minimal-home',
    vertical: 'home',
    name: { en: 'Minimalist Home & Living', ar: 'منزل مودرن بسيط' },
    description: { en: 'Scandinavian-inspired home decor storefront with clean lines and warm texture.', ar: 'واجهة ديكور منزلي مستوحاة من الطراز الاسكندنافي بخطوط نظيفة وملمس دافئ.' },
    qualityTags: ['home', 'scandinavian', 'minimal', 'premium'],
    tokens: { primaryColor: '#8b7355', secondaryColor: '#2d2a24', backgroundColor: '#faf6f0', surfaceColor: '#ffffff', textColor: '#2d2a24', mutedTextColor: '#8b7d6b', accentColor: '#c9a96e', fontFamily: 'Inter', headingFontFamily: 'DM Serif Display', borderRadius: '12px', heroPattern: 'radial' },
    demoProducts: [
      { name: { en: 'Linen Couch Set', ar: 'طقم كنبات كتان' }, description: { en: 'Stonewashed linen with oak legs. Breathable and durable.', ar: 'كتان مغسول بحجر بأرجل بلوط. قابل للتنفس ومتين.' }, basePrice: '4850.00', sku: 'HOME-SOFA', stockQty: 6 },
      { name: { en: 'Rattan Pendant Light', ar: 'ثريا رتان معلقة' }, description: { en: 'Handwoven natural rattan shade for warm ambient glow.', ar: 'غطاء رتان طبيعي منسوج يدوياً لإضاءة محيطة دافئة.' }, basePrice: '920.00', sku: 'HOME-LIGHT', stockQty: 14 },
      { name: { en: 'Marble Serving Board', ar: 'طبق تقديم رخام' }, description: { en: 'Polished marble with brass handles for entertaining.', ar: 'رخام مصقول بمقابض نحاسية للتقديم.' }, basePrice: '680.00', sku: 'HOME-BOARD', stockQty: 22 },
    ],
    blocks: [
      { id: 'home-promo', type: 'promo', settings: { tone: 'dark', text: { en: 'Free assembly on furniture orders over 3,000 EGP', ar: 'تجميع مجاني للطلبات فوق ٣٠٠٠ جنيه' } } },
      { id: 'home-hero', type: 'hero', settings: { eyebrow: { en: 'Everyday elegance', ar: 'أناقة يومية' }, title: { en: 'Spaces that feel like they\'ve always been yours', ar: 'مساحات تشعرك بأنها ملكك منذ البداية' }, subtitle: { en: 'Curated furniture and decor for homes that value quiet craftsmanship.', ar: 'أثاث وديكورات منتقاة للمنازل التي تقدر الحرفية الهادئة.' }, primaryCta: { en: 'Explore furniture', ar: 'اكتشف الأثاث' }, secondaryCta: { en: 'View decor', ar: 'شاهد الديكور' }, alignment: 'start', imageLabel: { en: 'Linen collection', ar: 'مجموعة الكتان' } } },
      { id: 'home-trust', type: 'trustStrip', settings: { items: commonTrust as never } },
      { id: 'home-categories', type: 'categoryTiles', settings: { title: { en: 'Shop by room', ar: 'تسوق حسب الغرفة' }, subtitle: { en: 'Every room deserves intentional design.', ar: 'كل غرفة تستحق تصميماً مقصوداً.' }, items: [
        { title: { en: 'Living Room', ar: 'غرفة المعيشة' }, text: { en: 'Sofas, coffee tables, and accent pieces.', ar: 'كنائب وطاولات قهوة وقطع مميزة.' } },
        { title: { en: 'Bedroom', ar: 'غرفة النوم' }, text: { en: 'Beds, lighting, and soft textiles.', ar: 'أسرّة وإضاءة ومنسوجات ناعمة.' } },
        { title: { en: 'Dining', ar: 'السفرة' }, text: { en: 'Tables, chairs, and serveware.', ar: 'طاولات وكراسي وأواني تقديم.' } },
      ] } },
      { id: 'home-collection', type: 'collection', settings: { title: { en: 'Best-sellers', ar: 'الأكثر مبيعاً' }, subtitle: { en: 'Pieces our customers love most.', ar: 'القطع المفضلة لدى عملائنا.' }, limit: 8 } },
      { id: 'home-gallery', type: 'gallery', settings: { title: { en: 'Living inspiration', ar: 'إلهام المعيشة' }, columns: 3, items: [
        { emoji: '🛋️', title: { en: 'Cozy corners', ar: 'زوايا مريحة' }, text: { en: 'Layered textiles make a room feel lived-in.', ar: 'المنسوجات المتعددة تمنح الغرفة دفئاً.' } },
        { emoji: '💡', title: { en: 'Light layers', ar: 'طبقات إضاءة' }, text: { en: 'Mix overhead, task, and accent lighting.', ar: 'امزج بين الإضاءة العلوية والمهمة والمحيطة.' } },
        { emoji: '🌿', title: { en: 'Greenery inside', ar: 'خضرة داخلية' }, text: { en: 'Plants soften any modern interior.', ar: 'النباتات تلين أي تصميم داخلي.' } },
      ] } },
      { id: 'home-testimonials', type: 'testimonials', settings: { title: { en: 'From our homeowners', ar: 'من أصحاب المنازل' }, items: [
        { name: 'Nadia A.', rating: 5, text: { en: 'The linen couch transformed our living room. Quality is exceptional.', ar: 'كنبة الكتان غيرت غرفة المعيشة تماماً. الجودة استثنائية.' } },
        { name: 'Karim S.', rating: 5, text: { en: 'Delivery was smooth and the rattan light is even more beautiful in person.', ar: 'التوصيل كان سلساً والثريا أجمل في الواقع.' } },
      ] } },
      { id: 'home-newsletter', type: 'newsletter', settings: { title: { en: 'Get design inspiration', ar: 'احصل على إلهام التصميم' }, subtitle: { en: 'Monthly picks from our curators, straight to your inbox.', ar: 'اختيارات شهرية من المنسقين لدينا، مباشرة إلى بريدك.' }, buttonText: { en: 'Subscribe', ar: 'اشترك' } } },
    ],
  },
  {
    id: 'glam-beauty',
    vertical: 'beauty',
    name: { en: 'Glam Beauty Studio', ar: 'استوديو جلام بيوتي' },
    description: { en: 'High-end cosmetics storefront with editorial visuals and rose-gold sophistication.', ar: 'واجهة مكياج فاخرة بجماليات تحريرية ولمسات روز جولد.' },
    qualityTags: ['beauty', 'luxury', 'editorial', 'mobile-first'],
    tokens: { primaryColor: '#9d174d', secondaryColor: '#4a0e2e', backgroundColor: '#fdf2f8', surfaceColor: '#ffffff', textColor: '#2d0a1b', mutedTextColor: '#a8557a', accentColor: '#e4788a', fontFamily: 'Inter', headingFontFamily: 'Playfair Display', borderRadius: '26px', heroPattern: 'radial' },
    demoProducts: [
      { name: { en: 'Velvet Liquid Lipstick', ar: 'روج سائل مخملي' }, description: { en: 'Long-wear matte with a cushion applicator for precise contour.', ar: 'مات طويل الثبات مع أداة تطبيق دقيقة للكونتور.' }, basePrice: '420.00', sku: 'BEAUTY-LIP', stockQty: 45 },
      { name: { en: 'Radiance Face Palette', ar: 'باليتة إشراقة الوجه' }, description: { en: 'Six curated shades for highlight, contour, and blush.', ar: 'ستة ألوان منتقاة للهايلايت والكونتور والبلاشر.' }, basePrice: '890.00', sku: 'BEAUTY-PAL', stockQty: 20 },
      { name: { en: 'Silk Setting Spray', ar: 'سبراي تثبيت حريري' }, description: { en: 'Micro-fine mist for all-day wear without caking.', ar: 'رذاذ ناعم جداً لتثبيت يدوم طوال اليوم دون تكتل.' }, basePrice: '340.00', sku: 'BEAUTY-SPRAY', stockQty: 60 },
    ],
    blocks: [
      { id: 'beauty-promo', type: 'promo', settings: { tone: 'dark', text: { en: 'Free mini lip gloss on orders above 800 EGP', ar: 'لمسة غلوس مجانية للطلبات فوق ٨٠٠ جنيه' } } },
      { id: 'beauty-hero', type: 'hero', settings: { eyebrow: { en: 'New collection', ar: 'مجموعة جديدة' }, title: { en: 'Beauty that speaks before you do', ar: 'جمال يتحدث قبل أن تنطق' }, subtitle: { en: 'Discover formulas designed for Egyptian skin tones and all-day confidence.', ar: 'اكتشف تركيبات مصممة لدرجات البشرة المصرية وثقة تدوم طوال اليوم.' }, primaryCta: { en: 'Shop the look', ar: 'تسوق الإطلالة' }, secondaryCta: { en: 'Watch tutorials', ar: 'شاهد الدروس' }, imageLabel: { en: 'Velvet collection', ar: 'مجموعة المخمل' } } },
      { id: 'beauty-trust', type: 'trustStrip', settings: { items: [
        { title: { en: 'Dermatologist tested', ar: 'مختبر من أطباء الجلدية' }, text: { en: 'Gentle on sensitive skin.', ar: 'لطيف على البشرة الحساسة.' } },
        { title: { en: 'Cruelty-free', ar: 'خالٍ من القسوة' }, text: { en: 'Never tested on animals.', ar: 'لم يُجرَ اختباره على الحيوانات.' } },
        { title: { en: 'Egyptian formulas', ar: 'تركيبات مصرية' }, text: { en: 'Made for our climate.', ar: 'مصممة لمناخنا.' } },
      ] as never } },
      { id: 'beauty-features', type: 'features', settings: { title: { en: 'Why beauty lovers choose us', ar: 'لماذا يختارنا عشاق الجمال' }, items: [
        { emoji: '✨', title: { en: 'High-pigment payoff', ar: 'ألوان عالية الكثافة' }, desc: { en: 'One swipe is all you need.', ar: 'مسحة واحدة تكفي.' } },
        { emoji: '💧', title: { en: 'Hydrating formulas', ar: 'تركيبات مرطبة' }, desc: { en: 'Skincare-infused makeup.', ar: 'مكياج معزز بالعناية بالبشرة.' } },
        { emoji: '🎨', title: { en: 'Expert color match', ar: 'مطابقة ألوان خبيرة' }, desc: { en: 'Find your perfect shade.', ar: 'ابحثي عن درجتك المثالية.' } },
      ] } },
      { id: 'beauty-collection', type: 'collection', settings: { title: { en: 'Bestsellers', ar: 'الأكثر مبيعاً' }, subtitle: { en: 'Loved by thousands of Egyptian women.', ar: 'حازت على إعجاب الآلاف من النساء المصريات.' }, limit: 8 } },
      { id: 'beauty-testimonials', type: 'testimonials', settings: { title: { en: 'Real reviews', ar: 'آراء حقيقية' }, items: [
        { name: 'Farida M.', rating: 5, text: { en: 'The palette is gorgeous — perfect for daily wear and evenings out.', ar: 'الباليتة رائعة — مثالية للاستخدام اليومي والسهرات.' } },
        { name: 'Donia L.', rating: 5, text: { en: 'Lipstick stays on through iftar and beyond. Love it!', ar: 'الروج يثبت خلال الإفطار وبعده. أحبه!' } },
      ] } },
      { id: 'beauty-newsletter', type: 'newsletter', settings: { title: { en: 'Get beauty tips & offers', ar: 'احصلي على نصائح الجمال والعروض' }, subtitle: { en: 'Weekly looks, product launches, and exclusive discounts.', ar: 'إطلالات أسبوعية وإصدارات جديدة وخصومات حصرية.' }, buttonText: { en: 'Join the glam club', ar: 'انضمي لنادي الجلام' } } },
    ],
  },
  {
    id: 'fine-jewelry',
    vertical: 'jewelry',
    name: { en: 'Fine Jewelry Atelier', ar: 'أتيليه المجوهرات الفاخرة' },
    description: { en: 'Ultra-premium jewelry storefront with editorial storytelling, dark elegance, and refined typography.', ar: 'واجهة مجوهرات فاخرة جداً بسرد تحريري وأناقة داكنة وتيبوغرافيا راقية.' },
    qualityTags: ['jewelry', 'luxury', 'editorial', 'premium', 'mobile-first'],
    tokens: { primaryColor: '#c9a84c', secondaryColor: '#0a0a0a', backgroundColor: '#0f0f0f', surfaceColor: '#1a1a1a', textColor: '#f5f0e8', mutedTextColor: '#8a857c', accentColor: '#c9a84c', fontFamily: 'Outfit', headingFontFamily: 'Cormorant Garamond', borderRadius: '28px', heroPattern: 'radial' },
    demoProducts: [
      { name: { en: '18K Gold Signet Ring', ar: 'خاتم شعار ١٨ قيراط' }, description: { en: 'Hand-engraved 18K gold with matte finish.', ar: 'ذهب ١٨ قيراط منقوش يدوياً بلمسة مات.' }, basePrice: '8900.00', sku: 'JWL-RING', stockQty: 4 },
      { name: { en: 'Pearl Drop Earrings', ar: 'أقراط لؤلؤ متدلية' }, description: { en: 'Freshwater pearls on 14K gold hooks.', ar: 'لؤلؤ طبيعي على خطافات ذهب ١٤ قيراط.' }, basePrice: '5400.00', sku: 'JWL-EARR', stockQty: 7 },
      { name: { en: 'Diamond Tennis Bracelet', ar: 'سوار تنس ماسي' }, description: { en: 'Round brilliant diamonds set in 18K white gold.', ar: 'ألماس دائري مقطوع في ذهب أبيض ١٨ قيراط.' }, basePrice: '22500.00', sku: 'JWL-BRACE', stockQty: 2 },
    ],
    blocks: [
      { id: 'jewelry-promo', type: 'promo', settings: { tone: 'dark', text: { en: 'Boutique viewing by appointment — call or WhatsApp us', ar: 'المعاينة بالحجز المسبق — اتصل أو واتساب' } } },
      { id: 'jewelry-hero', type: 'hero', settings: { eyebrow: { en: 'Autumn collection 2025', ar: 'مجموعة خريف ٢٠٢٥' }, title: { en: 'Crafted for the moments that define you', ar: 'مصمم للحظات التي تحدد هويتك' }, subtitle: { en: 'Each piece is hand-selected and certified. From proposal rings to everyday elegance.', ar: 'كل قطعة منتقاة يدوياً ومعتمدة. من خواتم الخطوبة إلى الأناقة اليومية.' }, primaryCta: { en: 'View collection', ar: 'شاهد المجموعة' }, secondaryCta: { en: 'Book an appointment', ar: 'احجز موعداً' }, alignment: 'start', imageLabel: { en: 'Gold collection', ar: 'مجموعة الذهب' } } },
      { id: 'jewelry-trust', type: 'trustStrip', settings: { bgColor: '#1a1a1a', items: [
        { title: { en: 'Authentic certified', ar: 'معتمد وأصلي' }, text: { en: 'Every piece comes with a certificate.', ar: 'كل قطعة مصحوبة بشهادة توثيق.' } },
        { title: { en: 'Bespoke service', ar: 'خدمة مخصصة' }, text: { en: 'Custom sizing and design available.', ar: 'تصغير وتصميم حسب الطلب متاح.' } },
        { title: { en: 'Secure delivery', ar: 'توصيل آمن' }, text: { en: 'Insured shipping with tracking.', ar: 'شحن مؤمن مع تتبع.' } },
      ] as never } },
      { id: 'jewelry-gallery', type: 'gallery', settings: { title: { en: 'The craftsmanship', ar: 'الحرفية' }, columns: 3, items: [
        { emoji: '🔨', title: { en: 'Handcrafted', ar: 'مصنوع يدوياً' }, text: { en: 'Master artisans with decades of experience.', ar: 'حرفيون مهرة بعقود من الخبرة.' } },
        { emoji: '💎', title: { en: 'Certified gems', ar: 'أحجار كريمة معتمدة' }, text: { en: 'GIA-certified diamonds and gemstones.', ar: 'ألماس وأحجار كريمة معتمدة من GIA.' } },
        { emoji: '✨', title: { en: 'Heirloom quality', ar: 'جودة إرثية' }, text: { en: 'Pieces designed to last generations.', ar: 'قطع مصممة لتدوم لأجيال.' } },
      ] } },
      { id: 'jewelry-collection', type: 'collection', settings: { title: { en: 'Signature pieces', ar: 'القطع المميزة' }, subtitle: { en: 'Our most treasured designs.', ar: 'أكثر تصاميمنا تميزاً.' }, limit: 8, layout: 'carousel' } },
      { id: 'jewelry-spotlight', type: 'spotlight', settings: { title: { en: 'Your story in gold', ar: 'قصتك في الذهب' }, text: { en: 'From engagement rings to anniversary gifts, every purchase includes a complimentary consultation with our design team.', ar: 'من خواتم الخطوبة إلى هدايا الذكرى السنوية، كل شراء يتضمن استشارة مجانية مع فريق التصميم.' }, bullets: [{ en: 'Free engraving', ar: 'نقش مجاني' }, { en: 'Lifetime cleaning', ar: 'تنظيف مدى الحياة' }, { en: 'Resize guarantee', ar: 'ضمان التعديل' }], imagePosition: 'right' } },
      { id: 'jewelry-faq', type: 'faq', settings: { title: { en: 'The atelier difference', ar: 'فرق الأتيليه' }, items: [
        { question: { en: 'Are your diamonds conflict-free?', ar: 'هل الألماس خالٍ من النزاعات؟' }, answer: { en: 'Yes. All our diamonds are conflict-free and GIA-certified.', ar: 'نعم، كل الألماس خالٍ من النزاعات ومعتمد من GIA.' } },
        { question: { en: 'Do you offer resizing?', ar: 'هل تقدمون خدمة التصغير؟' }, answer: { en: 'Complimentary resizing within 30 days of purchase.', ar: 'تصغير مجاني خلال ٣٠ يوماً من الشراء.' } },
      ] } },
    ],
  },
  {
    id: 'active-sports',
    vertical: 'sports',
    name: { en: 'Active Lifestyle Hub', ar: 'مركز الحياة النشطة' },
    description: { en: 'High-energy sportswear and fitness gear storefront with bold neon accents.', ar: 'واجهة نشطة للملابس الرياضية ومعدات اللياقة بألوان نيون جريئة.' },
    qualityTags: ['sports', 'fitness', 'bold', 'mobile-first'],
    tokens: { primaryColor: '#dc2626', secondaryColor: '#171717', backgroundColor: '#fafafa', surfaceColor: '#ffffff', textColor: '#171717', mutedTextColor: '#737373', accentColor: '#22c55e', fontFamily: 'Inter', headingFontFamily: 'Outfit', borderRadius: '20px', heroPattern: 'grid' },
    demoProducts: [
      { name: { en: 'Compression Training Tee', ar: 'تيشيرت تدريب ضاغط' }, description: { en: 'Moisture-wicking fabric with four-way stretch.', ar: 'قماش ماص للرطوبة بتمدد رباعي الاتجاهات.' }, basePrice: '520.00', sku: 'FIT-TEE', stockQty: 35 },
      { name: { en: 'Quick-Dry Shorts 2-in-1', ar: 'شورت سريع الجفاف ٢في١' }, description: { en: 'Inner compression layer with outer loose short.', ar: 'طبقة ضغط داخلية مع شورت خارجي واسع.' }, basePrice: '460.00', sku: 'FIT-SHORT', stockQty: 28 },
      { name: { en: 'Resistance Band Set', ar: 'طقم أربطة مقاومة' }, description: { en: 'Five levels of resistance with carrying bag.', ar: 'خمس مستويات مقاومة مع حقيبة حمل.' }, basePrice: '380.00', sku: 'FIT-BANDS', stockQty: 50 },
    ],
    blocks: buildVerticalBlocks('sports', {
      promo: { en: 'New year, new PR — 20% off all gear this week', ar: 'عام جديد، رقم قياسي جديد — خصم ٢٠٪ على جميع المعدات هذا الأسبوع' },
      eyebrow: { en: 'Train harder, recover smarter', ar: 'تدرب بقوة، وتعاف بذكاء' },
      title: { en: 'Gear that keeps up with your grind', ar: 'معدات تتماشى مع تدريباتك' },
      subtitle: { en: 'From gym wear to recovery tools — built for Egyptian athletes who demand performance.', ar: 'من ملابس الجيم إلى أدوات التعافي — صممت للرياضيين المصريين الذين يطلبون الأداء.' },
      collection: { en: 'Top performers', ar: 'الأفضل أداءً' },
    }),
  },
  {
    id: 'readers-haven',
    vertical: 'books',
    name: { en: 'Reader\'s Haven', ar: 'ملاذ القارئ' },
    description: { en: 'Cozy literary storefront for books and stationery with warm, curated aesthetics.', ar: 'واجهة أدبية دافئة للكتب والقرطاسية بجماليات منسقة.' },
    qualityTags: ['books', 'cozy', 'curated', 'arabic-ready'],
    tokens: { primaryColor: '#92400e', secondaryColor: '#292524', backgroundColor: '#fefce8', surfaceColor: '#ffffff', textColor: '#292524', mutedTextColor: '#a17f5f', accentColor: '#d97706', fontFamily: 'Inter', headingFontFamily: 'Playfair Display', borderRadius: '22px', heroPattern: 'radial' },
    demoProducts: [
      { name: { en: 'The Cairo Trilogy Box Set', ar: 'الثلاثية القاهرية' }, description: { en: 'Naguib Mahfouz\'s masterpiece in a collector\'s edition.', ar: 'روائع نجيب محفوظ في طبعة جامعية.' }, basePrice: '680.00', sku: 'BOOK-TRILOGY', stockQty: 12 },
      { name: { en: 'Leather-Bound Journal', ar: 'مفكرة مجلدة بالجلد' }, description: { en: 'Hand-stitched A5 journal with 100gsm paper.', ar: 'مفكرة A5 مخيطة يدوياً بورق 100جرام.' }, basePrice: '290.00', sku: 'BOOK-JOURNAL', stockQty: 30 },
      { name: { en: 'Curated Bookmark Set', ar: 'طقم علامات كتب منتقاة' }, description: { en: 'Set of 5 brass corner bookmarks.', ar: 'طقم ٥ علامات كتب نحاسية للزوايا.' }, basePrice: '140.00', sku: 'BOOK-MARKS', stockQty: 65 },
    ],
    blocks: [
      { id: 'books-promo', type: 'promo', settings: { tone: 'accent', text: { en: 'Free bookmark with every purchase', ar: 'علامة كتاب مجانية مع كل شراء' } } },
      { id: 'books-hero', type: 'hero', settings: { eyebrow: { en: 'Discover your next chapter', ar: 'اكتشف فصلك التالي' }, title: { en: 'Stories that stay with you long after the last page', ar: 'قصص تبقى معك طويلاً بعد آخر صفحة' }, subtitle: { en: 'Curated fiction, non-fiction, and Egyptian classics — plus handcrafted stationery for the thoughtful reader.', ar: 'روايات وكتب واقعية وكلاسيكيات مصرية منتقاة — مع قرطاسية يدوية للقارئ المهتم.' }, primaryCta: { en: 'Browse books', ar: 'تصفح الكتب' }, secondaryCta: { en: 'Explore stationery', ar: 'اكتشف القرطاسية' }, imageLabel: { en: 'Curated collection', ar: 'تشكيلة منتقاة' } } },
      { id: 'books-trust', type: 'trustStrip', settings: { items: commonTrust as never } },
      { id: 'books-collection', type: 'collection', settings: { title: { en: 'Staff picks', ar: 'اختيارات الموظفين' }, subtitle: { en: 'What our team is reading this month.', ar: 'ماذا يقرأ فريقنا هذا الشهر.' }, limit: 8 } },
      { id: 'books-features', type: 'features', settings: { title: { en: 'Why readers love us', ar: 'لماذا يحبنا القراء' }, items: [
        { emoji: '📦', title: { en: 'Free delivery on orders over 500 EGP', ar: 'توصيل مجاني للطلبات فوق ٥٠٠ جنيه' }, desc: { en: 'Nationwide shipping.', ar: 'شحن لجميع المحافظات.' } },
        { emoji: '🎁', title: { en: 'Gift wrapping available', ar: 'تغليف هدايا متاح' }, desc: { en: 'Perfect for presents.', ar: 'مثالي للهدايا.' } },
        { emoji: '📖', title: { en: 'Monthly book club', ar: 'نادي الكتاب الشهري' }, desc: { en: 'Join the conversation.', ar: 'انضم للنقاش.' } },
      ] } },
      { id: 'books-faq', type: 'faq', settings: { title: { en: 'For book lovers', ar: 'لمحبي الكتب' }, items: [
        { question: { en: 'Do you ship Arabic books?', ar: 'هل تشحنون الكتب العربية؟' }, answer: { en: 'Yes, we carry both Arabic and English titles across all genres.', ar: 'نعم، لدينا إصدارات عربية وإنجليزية في جميع التصنيفات.' } },
        { question: { en: 'Can I return a book?', ar: 'هل يمكن إرجاع كتاب؟' }, answer: { en: 'Unused books can be returned within 7 days.', ar: 'يمكن إرجاع الكتب غير المستخدمة خلال ٧ أيام.' } },
      ] } },
    ],
  },
  {
    id: 'wellness-vitality',
    vertical: 'health',
    name: { en: 'Wellness & Vitality', ar: 'العافية والحيوية' },
    description: { en: 'Clean, calming storefront for health supplements, vitamins, and wellness products.', ar: 'واجهة نظيفة وهادئة للمكملات الصحية والفيتامينات ومنتجات العافية.' },
    qualityTags: ['health', 'wellness', 'trust', 'clean'],
    tokens: { primaryColor: '#16a34a', secondaryColor: '#14532d', backgroundColor: '#f0fdf4', surfaceColor: '#ffffff', textColor: '#052e16', mutedTextColor: '#6b8f71', accentColor: '#22c55e', fontFamily: 'Inter', headingFontFamily: 'Outfit', borderRadius: '18px', heroPattern: 'radial' },
    demoProducts: [
      { name: { en: 'Vitamin D3 + K2 Complex', ar: 'مكمل فيتامين D3 + K2' }, description: { en: 'High-absorption formula with 5000 IU vitamin D3 and K2.', ar: 'تركيبة عالية الامتصاص ب 5000 وحدة دولية D3 وK2.' }, basePrice: '520.00', sku: 'HEALTH-D3', stockQty: 40 },
      { name: { en: 'Collagen Peptides Powder', ar: 'بودرة كولاجين ببتيد' }, description: { en: 'Unflavored hydrolyzed collagen for skin and joints.', ar: 'كولاجين متحلل غير منكه للبشرة والمفاصل.' }, basePrice: '680.00', sku: 'HEALTH-COLL', stockQty: 25 },
      { name: { en: 'Magnesium Glycinate', ar: 'ماغنيسيوم جلايسينات' }, description: { en: 'Highly absorbable magnesium for sleep and recovery.', ar: 'ماغنيسيوم عالي الامتصاص للنوم والتعافي.' }, basePrice: '440.00', sku: 'HEALTH-MAG', stockQty: 35 },
    ],
    blocks: buildVerticalBlocks('health', {
      promo: { en: 'Free consultation with every first order', ar: 'استشارة مجانية مع كل طلب أول' },
      eyebrow: { en: 'Your health journey starts here', ar: 'رحلة صحتك تبدأ من هنا' },
      title: { en: 'Feel your best, every single day', ar: 'اشعر بأفضل حالاتك، كل يوم' },
      subtitle: { en: 'Premium supplements, rigorously tested and delivered to your door — because Egyptian wellness deserves the best.', ar: 'مكملات ممتازة مختبرة بدقة وتصل إلى باب منزلك — لأن صحة المصريين تستحق الأفضل.' },
      collection: { en: 'Daily essentials', ar: 'أساسيات يومية' },
    }),
  },
  {
    id: 'wonderland-toys',
    vertical: 'toys',
    name: { en: 'Wonderland Toys', ar: 'واندرلاند للألعاب' },
    description: { en: 'Vibrant, playful storefront for children\'s toys, games, and educational kits.', ar: 'واجهة مرحة وملونة لألعاب الأطفال والمسابقات والمجموعات التعليمية.' },
    qualityTags: ['toys', 'colorful', 'educational', 'mobile-first'],
    tokens: { primaryColor: '#e11d48', secondaryColor: '#fbbf24', backgroundColor: '#fef9ef', surfaceColor: '#ffffff', textColor: '#1c1917', mutedTextColor: '#a87d6d', accentColor: '#6366f1', fontFamily: 'Outfit', headingFontFamily: 'Outfit', borderRadius: '30px', heroPattern: 'radial' },
    demoProducts: [
      { name: { en: 'STEM Building Blocks 200pc', ar: 'مكعبات بناء STEM ٢٠٠ قطعة' }, description: { en: 'Compatible building kit with gears, wheels, and connectors.', ar: 'طقم بناء متوافق مع تروس وعجلات وموصلات.' }, basePrice: '620.00', sku: 'TOY-STEM', stockQty: 18 },
      { name: { en: 'Art Studio-in-a-Box', ar: 'استوديو فنون في صندوق' }, description: { en: 'Complete art set with paints, brushes, and 20 projects.', ar: 'طقم فنون كامل بألوان وفرش و ٢٠ مشروعاً.' }, basePrice: '480.00', sku: 'TOY-ART', stockQty: 14 },
      { name: { en: 'Arabic Letter Puzzle', ar: 'لعبة الحروف العربية' }, description: { en: 'Wooden puzzle with all 28 Arabic letters for early learning.', ar: 'لعبة خشبية بجميع الحروف العربية للتعلم المبكر.' }, basePrice: '280.00', sku: 'TOY-PUZZLE', stockQty: 25 },
    ],
    blocks: [
      { id: 'toys-promo', type: 'promo', settings: { tone: 'accent', text: { en: 'Free gift wrapping for birthdays! Add a note at checkout.', ar: 'تغليف هدايا مجاني لأعياد الميلاد! أضف ملاحظة عند الدفع.' } } },
      { id: 'toys-hero', type: 'hero', settings: { eyebrow: { en: 'Play is the highest form of learning', ar: 'اللعب هو أرقى أشكال التعلم' }, title: { en: 'Toys that spark imagination', ar: 'ألعاب تشعل الخيال' }, subtitle: { en: 'From puzzles to art kits, every toy is chosen to inspire creativity, curiosity, and pure joy.', ar: 'من الألغاز إلى أدوات الفن، كل لعبة مختارة لتلهم الإبداع والفضول والمرح.' }, primaryCta: { en: 'Shop toys', ar: 'تسوق الألعاب' }, secondaryCta: { en: 'By age group', ar: 'حسب الفئة العمرية' }, imageLabel: { en: 'New arrivals', ar: 'وصل حديثاً' } } },
      { id: 'toys-trust', type: 'trustStrip', settings: { items: commonTrust as never } },
      { id: 'toys-categories', type: 'categoryTiles', settings: { title: { en: 'Shop by age', ar: 'تسوق حسب العمر' }, subtitle: { en: 'Finding the perfect toy is easy.', ar: 'العثور على اللعبة المثالية سهل.' }, items: [
        { title: { en: '2-4 years', ar: '٢-٤ سنوات' }, text: { en: 'Sensory and motor skills.', ar: 'مهارات حسية وحركية.' } },
        { title: { en: '5-7 years', ar: '٥-٧ سنوات' }, text: { en: 'Creative and problem-solving play.', ar: 'لعب إبداعي وحل المشكلات.' } },
        { title: { en: '8-12 years', ar: '٨-١٢ سنة' }, text: { en: 'STEM and strategy games.', ar: 'ألعاب STEM واستراتيجية.' } },
      ] } },
      { id: 'toys-collection', type: 'collection', settings: { title: { en: 'Bestselling toys', ar: 'الألعاب الأكثر مبيعاً' }, subtitle: { en: 'Favorites among Egyptian kids and parents.', ar: 'المفضلة لدى الأطفال والآباء المصريين.' }, limit: 8 } },
      { id: 'toys-features', type: 'features', settings: { title: { en: 'Play with confidence', ar: 'العب بثقة' }, items: [
        { emoji: '🧪', title: { en: 'Safety tested', ar: 'مختبر للسلامة' }, desc: { en: 'Meets EU and Egyptian safety standards.', ar: 'يلبي معايير السلامة الأوروبية والمصرية.' } },
        { emoji: '🌱', title: { en: 'Eco-friendly', ar: 'صديق للبيئة' }, desc: { en: 'Non-toxic, sustainable materials.', ar: 'مواد غير سامة ومستدامة.' } },
        { emoji: '🎯', title: { en: 'Age-appropriate', ar: 'مناسب للعمر' }, desc: { en: 'Every toy is curated for the right stage.', ar: 'كل لعبة منتقاة للمرحلة العمرية المناسبة.' } },
      ] } },
      { id: 'toys-gallery', type: 'gallery', settings: { title: { en: 'Moments of joy', ar: 'لحظات من المرح' }, columns: 3, items: [
        { emoji: '🎨', title: { en: 'Creative hours', ar: 'ساعات إبداعية' }, text: { en: 'Art projects that engage.', ar: 'مشاريع فنية تشغل الأطفال.' } },
        { emoji: '🧩', title: { en: 'Puzzle time', ar: 'وقت الألغاز' }, text: { en: 'Building focus and patience.', ar: 'بناء التركيز والصبر.' } },
        { emoji: '🎮', title: { en: 'Game night', ar: 'ليلة الألعاب' }, text: { en: 'Family fun for everyone.', ar: 'مرح عائلي للجميع.' } },
      ] } },
    ],
  },
  {
    id: 'pet-paradise',
    vertical: 'pets',
    name: { en: 'Pet Paradise', ar: 'جنة الحيوانات الأليفة' },
    description: { en: 'Warm, friendly storefront for pet food, accessories, and care products.', ar: 'واجهة دافئة وودودة لأغذية الحيوانات الأليفة والإكسسوارات ومنتجات العناية.' },
    qualityTags: ['pets', 'friendly', 'local-delivery', 'mobile-first'],
    tokens: { primaryColor: '#e85d3a', secondaryColor: '#264653', backgroundColor: '#fefcf5', surfaceColor: '#ffffff', textColor: '#264653', mutedTextColor: '#8ba8af', accentColor: '#2a9d8f', fontFamily: 'Outfit', headingFontFamily: 'Outfit', borderRadius: '24px', heroPattern: 'radial' },
    demoProducts: [
      { name: { en: 'Premium Dry Cat Food 2kg', ar: 'طعام قطط جاف ممتاز ٢كجم' }, description: { en: 'High-protein recipe with salmon and brown rice.', ar: 'وصفة عالية البروتين بالسلمون والأرز البني.' }, basePrice: '360.00', sku: 'PET-CAT', stockQty: 28 },
      { name: { en: 'Dog Harness + Leash Set', ar: 'طقم تسخير كلب ومقود' }, description: { en: 'Padded harness with reflective stitching.', ar: 'تسخير مبطن بغرز عاكسة.' }, basePrice: '520.00', sku: 'PET-HARNESS', stockQty: 15 },
      { name: { en: 'Interactive Treat Puzzle', ar: 'لعبة مكافآت تفاعلية' }, description: { en: 'Stimulate your pet\'s mind with treat-dispensing challenges.', ar: 'حفز عقل حيوانك الأليف بتحديات توزيع المكافآت.' }, basePrice: '240.00', sku: 'PET-PUZZLE', stockQty: 22 },
    ],
    blocks: buildVerticalBlocks('pets', {
      promo: { en: 'Free delivery for orders above 500 EGP — because pets deserve the best', ar: 'توصيل مجاني للطلبات فوق ٥٠٠ جنيه — لأن حيواناتك تستحق الأفضل' },
      eyebrow: { en: 'Happy pet, happy home', ar: 'حيوان سعيد، منزل سعيد' },
      title: { en: 'Everything your furry friend needs', ar: 'كل ما يحتاجه صديقك الفروي' },
      subtitle: { en: 'Premium food, comfy accessories, and fun toys for cats and dogs — delivered to your door.', ar: 'طعام ممتاز وإكسسوارات مريحة وألعاب ممتعة للقطط والكلاب — توصيل إلى باب منزلك.' },
      collection: { en: 'Pet favorites', ar: 'المفضلة لحيواناتك' },
    }),
  },
] as StoreTemplate[];

function buildVerticalBlocks(vertical: StoreVertical, copy: {
  promo: Record<Locale, string>;
  eyebrow: Record<Locale, string>;
  title: Record<Locale, string>;
  subtitle: Record<Locale, string>;
  collection: Record<Locale, string>;
}) {
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
