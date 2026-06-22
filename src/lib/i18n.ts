export type Locale = "en" | "ar";

export const translations = {
  en: {
    dir: "ltr" as const,
    // Navbar
    nav_features: "Features",
    nav_how: "How it Works",
    nav_pricing: "Pricing",
    nav_login: "Log in",
    nav_start: "Start Free",

    // Hero
    hero_badge: "Now in Early Access — Egypt's first AI e-commerce platform",
    hero_title_1: "Launch your online store",
    hero_title_2: "in minutes,",
    hero_title_3: "not months.",
    hero_sub:
      "Storefy gives Egyptian brands a complete e-commerce platform with AI-generated product descriptions, Paymob payments, and a fully-hosted storefront — no code needed.",
    hero_cta: "Create Your Store",
    hero_cta2: "See How it Works",

    // Stats
    stat_brands: "Brands Onboarded",
    stat_orders: "Orders Processed",
    stat_uptime: "Uptime SLA",
    stat_currency: "Native Currency",

    // Features
    feat_badge: "Platform Features",
    feat_heading_1: "Everything you need to",
    feat_heading_2: "sell online",
    feat_sub:
      "From AI-powered content to secure payments — every feature is built for the Egyptian market from day one.",
    feat_1_title: "Multi-Tenant Storefronts",
    feat_1_desc:
      "Every brand gets its own subdomain with isolated data, custom themes, and independent settings. One platform, unlimited stores.",
    feat_2_title: "AI Product Descriptions",
    feat_2_desc:
      "Generate compelling, SEO-optimized product descriptions in Arabic and English with a single click. Powered by Groq inference.",
    feat_3_title: "Paymob Integration",
    feat_3_desc:
      "Accept credit cards, mobile wallets, and cash-on-delivery across Egypt with Paymob's payment gateway — fully integrated.",
    feat_4_title: "Enterprise-Grade Security",
    feat_4_desc:
      "Row-Level Security on every table, tenant-scoped database transactions, and server-side-only tenant resolution. Zero data leakage.",
    feat_5_title: "Custom Domains & Arabic-First",
    feat_5_desc:
      "Map your own domain, set Arabic as the default locale, and price in EGP. Built from the ground up for the Egyptian market.",
    feat_6_title: "Drag & Drop Page Builder",
    feat_6_desc:
      "Build landing pages, product showcases, and collection grids with a visual block editor — no coding required.",

    // How it works
    how_badge: "How it Works",
    how_heading_1: "Three steps to your",
    how_heading_2: "first sale",
    how_sub:
      "No technical setup. No server configuration. Just you, your products, and your customers.",
    how_1_title: "Sign Up & Name Your Store",
    how_1_desc:
      "Create your account and pick a subdomain. Your store is live in under 60 seconds.",
    how_2_title: "Add Products with AI",
    how_2_desc:
      "Upload photos, let AI write your descriptions in Arabic or English, set your prices in EGP.",
    how_3_title: "Connect Paymob & Launch",
    how_3_desc:
      "Plug in your Paymob credentials, customize your theme, and start selling to customers across Egypt.",

    // Pricing
    price_badge: "Pricing",
    price_heading_1: "Simple pricing,",
    price_heading_2: "serious value",
    price_sub:
      "Start free. Upgrade when you're ready. All prices in Egyptian Pounds.",
    price_free: "Free",
    price_starter: "Starter",
    price_pro: "Pro",
    price_forever: "forever",
    price_mo: "/mo",
    price_popular: "Most Popular",
    price_free_desc: "Perfect for testing and launching your first store",
    price_starter_desc: "For growing brands ready to scale",
    price_pro_desc: "For established brands with high volume",
    price_free_f1: "1 storefront",
    price_free_f2: "25 products",
    price_free_f3: "Paymob payments",
    price_free_f4: "Basic analytics",
    price_free_f5: "Community support",
    price_starter_f1: "Unlimited products",
    price_starter_f2: "Custom domain",
    price_starter_f3: "AI descriptions (500/mo)",
    price_starter_f4: "AI chat assistant",
    price_starter_f5: "Priority support",
    price_starter_f6: "Advanced analytics",
    price_pro_f1: "Everything in Starter",
    price_pro_f2: "Unlimited AI usage",
    price_pro_f3: "POS integration",
    price_pro_f4: "Multi-staff accounts",
    price_pro_f5: "Webhooks & API access",
    price_pro_f6: "Dedicated account manager",
    price_cta_free: "Start Free",
    price_cta_starter: "Start Growing",
    price_cta_pro: "Go Pro",

    // CTA
    cta_heading_1: "Ready to build your",
    cta_heading_2: "online empire?",
    cta_sub:
      "Join hundreds of Egyptian brands already selling on Storefy. Your store is one click away.",
    cta_btn: "Create Your Free Store",

    // Footer
    footer_desc:
      "The AI-powered e-commerce platform built for Egyptian brands. Sell online with zero friction.",
    footer_product: "Product",
    footer_features: "Features",
    footer_pricing: "Pricing",
    footer_integrations: "Integrations",
    footer_changelog: "Changelog",
    footer_resources: "Resources",
    footer_docs: "Documentation",
    footer_api: "API Reference",
    footer_blog: "Blog",
    footer_support: "Support",
    footer_company: "Company",
    footer_about: "About",
    footer_careers: "Careers",
    footer_contact: "Contact",
    footer_privacy: "Privacy Policy",
    footer_copy: "© 2026 Storefy. All rights reserved.",
    footer_made: "Made with 💜 in Cairo, Egypt",

    // Auth Modal
    auth_login_title: "Welcome back",
    auth_login_sub: "Sign in to your Storefy account",
    auth_signup_title: "Create your account",
    auth_signup_sub: "Start building your online store today",
    auth_email: "Email address",
    auth_password: "Password",
    auth_name: "Full name",
    auth_login_btn: "Sign in",
    auth_signup_btn: "Create account",
    auth_no_account: "Don't have an account?",
    auth_has_account: "Already have an account?",
    auth_switch_signup: "Sign up",
    auth_switch_login: "Sign in",
    auth_or: "or",
    auth_error_generic: "Something went wrong. Please try again.",
    auth_error_invalid: "Invalid email or password.",
    auth_success_signup: "Account created! Signing you in…",

    // Theme
    theme_light: "Light",
    theme_dark: "Dark",

    // Language
    lang_en: "English",
    lang_ar: "العربية",
  },

  ar: {
    dir: "rtl" as const,
    // Navbar
    nav_features: "المميزات",
    nav_how: "كيف يعمل",
    nav_pricing: "الأسعار",
    nav_login: "تسجيل الدخول",
    nav_start: "ابدأ مجاناً",

    // Hero
    hero_badge: "متاح الآن — أول منصة تجارة إلكترونية بالذكاء الاصطناعي في مصر",
    hero_title_1: "أطلق متجرك الإلكتروني",
    hero_title_2: "في دقائق،",
    hero_title_3: "وليس شهور.",
    hero_sub:
      "ستورفاي تمنح العلامات التجارية المصرية منصة تجارة إلكترونية متكاملة مع أوصاف منتجات بالذكاء الاصطناعي، ومدفوعات باي موب، وواجهة متجر مستضافة بالكامل — بدون كود.",
    hero_cta: "أنشئ متجرك",
    hero_cta2: "شاهد كيف يعمل",

    // Stats
    stat_brands: "علامة تجارية",
    stat_orders: "طلب تم تنفيذه",
    stat_uptime: "وقت التشغيل",
    stat_currency: "العملة المحلية",

    // Features
    feat_badge: "مميزات المنصة",
    feat_heading_1: "كل ما تحتاجه لـ",
    feat_heading_2: "البيع أونلاين",
    feat_sub:
      "من المحتوى بالذكاء الاصطناعي إلى المدفوعات الآمنة — كل ميزة مبنية للسوق المصري من اليوم الأول.",
    feat_1_title: "متاجر متعددة المستأجرين",
    feat_1_desc:
      "كل علامة تجارية تحصل على نطاق فرعي خاص مع بيانات معزولة وثيمات مخصصة وإعدادات مستقلة. منصة واحدة، متاجر بلا حدود.",
    feat_2_title: "أوصاف منتجات بالذكاء الاصطناعي",
    feat_2_desc:
      "أنشئ أوصاف منتجات جذابة ومحسّنة لمحركات البحث بالعربية والإنجليزية بنقرة واحدة. مدعوم بتقنية Groq.",
    feat_3_title: "تكامل باي موب",
    feat_3_desc:
      "اقبل بطاقات الائتمان والمحافظ الإلكترونية والدفع عند الاستلام في جميع أنحاء مصر مع بوابة دفع باي موب — متكاملة بالكامل.",
    feat_4_title: "أمان بمستوى المؤسسات",
    feat_4_desc:
      "أمان على مستوى الصف في كل جدول، ومعاملات قاعدة بيانات محددة النطاق، وحل هوية المستأجر من جانب الخادم فقط. تسريب بيانات صفر.",
    feat_5_title: "نطاقات مخصصة والعربية أولاً",
    feat_5_desc:
      "اربط نطاقك الخاص، واضبط العربية كلغة افتراضية، وسعّر بالجنيه المصري. مبنية من الصفر للسوق المصري.",
    feat_6_title: "منشئ صفحات بالسحب والإفلات",
    feat_6_desc:
      "أنشئ صفحات هبوط وعروض منتجات وشبكات مجموعات بمحرر بصري — بدون برمجة.",

    // How it works
    how_badge: "كيف يعمل",
    how_heading_1: "ثلاث خطوات نحو",
    how_heading_2: "أول عملية بيع",
    how_sub:
      "لا إعداد تقني. لا تكوين خوادم. فقط أنت ومنتجاتك وعملاؤك.",
    how_1_title: "سجّل واسمّ متجرك",
    how_1_desc:
      "أنشئ حسابك واختر نطاقاً فرعياً. متجرك جاهز في أقل من 60 ثانية.",
    how_2_title: "أضف منتجات بالذكاء الاصطناعي",
    how_2_desc:
      "ارفع الصور، دع الذكاء الاصطناعي يكتب الأوصاف بالعربية أو الإنجليزية، وحدد أسعارك بالجنيه المصري.",
    how_3_title: "اربط باي موب وانطلق",
    how_3_desc:
      "أدخل بيانات باي موب، وخصص ثيمك، وابدأ البيع لعملائك في جميع أنحاء مصر.",

    // Pricing
    price_badge: "الأسعار",
    price_heading_1: "أسعار بسيطة،",
    price_heading_2: "قيمة حقيقية",
    price_sub:
      "ابدأ مجاناً. قم بالترقية عندما تكون مستعداً. جميع الأسعار بالجنيه المصري.",
    price_free: "مجاني",
    price_starter: "مبتدئ",
    price_pro: "احترافي",
    price_forever: "للأبد",
    price_mo: "/شهر",
    price_popular: "الأكثر شعبية",
    price_free_desc: "مثالي للتجربة وإطلاق متجرك الأول",
    price_starter_desc: "للعلامات التجارية النامية المستعدة للتوسع",
    price_pro_desc: "للعلامات التجارية الراسخة ذات الحجم الكبير",
    price_free_f1: "واجهة متجر واحدة",
    price_free_f2: "25 منتج",
    price_free_f3: "مدفوعات باي موب",
    price_free_f4: "تحليلات أساسية",
    price_free_f5: "دعم المجتمع",
    price_starter_f1: "منتجات غير محدودة",
    price_starter_f2: "نطاق مخصص",
    price_starter_f3: "أوصاف ذكاء اصطناعي (500/شهر)",
    price_starter_f4: "مساعد دردشة ذكي",
    price_starter_f5: "دعم ذو أولوية",
    price_starter_f6: "تحليلات متقدمة",
    price_pro_f1: "كل شيء في مبتدئ",
    price_pro_f2: "استخدام ذكاء اصطناعي غير محدود",
    price_pro_f3: "تكامل نقاط البيع",
    price_pro_f4: "حسابات متعددة للموظفين",
    price_pro_f5: "ويب هوك وصلاحية API",
    price_pro_f6: "مدير حساب مخصص",
    price_cta_free: "ابدأ مجاناً",
    price_cta_starter: "ابدأ النمو",
    price_cta_pro: "انطلق للاحترافية",

    // CTA
    cta_heading_1: "مستعد لبناء",
    cta_heading_2: "إمبراطوريتك الإلكترونية؟",
    cta_sub:
      "انضم لمئات العلامات التجارية المصرية التي تبيع بالفعل على ستورفاي. متجرك على بُعد نقرة واحدة.",
    cta_btn: "أنشئ متجرك المجاني",

    // Footer
    footer_desc:
      "منصة التجارة الإلكترونية المدعومة بالذكاء الاصطناعي والمبنية للعلامات التجارية المصرية. بيع أونلاين بدون أي احتكاك.",
    footer_product: "المنتج",
    footer_features: "المميزات",
    footer_pricing: "الأسعار",
    footer_integrations: "التكاملات",
    footer_changelog: "سجل التحديثات",
    footer_resources: "الموارد",
    footer_docs: "التوثيق",
    footer_api: "مرجع API",
    footer_blog: "المدونة",
    footer_support: "الدعم",
    footer_company: "الشركة",
    footer_about: "من نحن",
    footer_careers: "الوظائف",
    footer_contact: "تواصل معنا",
    footer_privacy: "سياسة الخصوصية",
    footer_copy: "© 2026 ستورفاي. جميع الحقوق محفوظة.",
    footer_made: "صُنع بـ 💜 في القاهرة، مصر",

    // Auth Modal
    auth_login_title: "مرحباً بعودتك",
    auth_login_sub: "سجّل الدخول إلى حسابك في ستورفاي",
    auth_signup_title: "أنشئ حسابك",
    auth_signup_sub: "ابدأ ببناء متجرك الإلكتروني اليوم",
    auth_email: "البريد الإلكتروني",
    auth_password: "كلمة المرور",
    auth_name: "الاسم الكامل",
    auth_login_btn: "تسجيل الدخول",
    auth_signup_btn: "إنشاء حساب",
    auth_no_account: "ليس لديك حساب؟",
    auth_has_account: "لديك حساب بالفعل؟",
    auth_switch_signup: "سجّل الآن",
    auth_switch_login: "سجّل الدخول",
    auth_or: "أو",
    auth_error_generic: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
    auth_error_invalid: "بريد إلكتروني أو كلمة مرور غير صحيحة.",
    auth_success_signup: "تم إنشاء الحساب! جاري تسجيل دخولك…",

    // Theme
    theme_light: "فاتح",
    theme_dark: "داكن",

    // Language
    lang_en: "English",
    lang_ar: "العربية",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["en"];

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale][key];
}
