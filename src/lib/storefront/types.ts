import type { Locale } from '../i18n';

export type StoreVertical = 'perfume' | 'fashion' | 'food' | 'electronics' | 'handmade' | 'home';

export interface StoreThemeTokens {
  // Colors
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  accentColor: string;

  // Typography
  fontFamily: string;
  headingFontFamily: string;
  baseFontSize: string;
  headingFontWeight: string;
  bodyLineHeight: string;

  // Spacing & Shape
  borderRadius: string;
  buttonStyle: 'rounded' | 'pill' | 'square';
  sectionPadding: string;
  pageMaxWidth: string;

  // Header
  logoUrl: string;
  logoWidth: string;
  headerLayout: 'left' | 'center' | 'split';
  stickyHeader: boolean;
  announcementText: string;
  announcementBg: string;
  announcementTextColor: string;
  announcementDismissible: boolean;

  // Navigation
  menuLinks: Array<{ label: Record<string, string>; href: string }>;

  // Footer
  footerLayout: 'minimal' | 'columns';
  footerColumns: Array<{
    title: Record<string, string>;
    links: Array<{ label: Record<string, string>; href: string }>;
  }>;
  footerBg: string;
  footerTextColor: string;
  paymentIcons: string[];

  // Social URLs
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  tiktokUrl: string;
  whatsappNumber: string;

  // Section defaults
  sectionAnimation: 'none' | 'fadeIn' | 'slideUp' | 'scaleIn';

  // Hero
  heroPattern?: string;
  customCss?: string;
}

export interface DemoProduct {
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  basePrice: string;
  sku: string;
  stockQty: number;
  image?: string;
}

export type StorefrontBlock =
  | PromoBlock
  | HeroBlock
  | TrustStripBlock
  | CategoryTilesBlock
  | CollectionBlock
  | SpotlightBlock
  | BenefitsBlock
  | FeaturesBlock
  | TestimonialsBlock
  | FaqBlock
  | GalleryBlock
  | NewsletterBlock;

export interface SectionSettings {
  hidden?: boolean;
  hideMobile?: boolean;
  animation?: 'none' | 'fadeIn' | 'slideUp' | 'scaleIn';
  paddingTop?: string;
  paddingBottom?: string;
  bgImage?: string;
  bgColor?: string;
  bgType?: 'color' | 'gradient' | 'image';
  gradientFrom?: string;
  gradientTo?: string;
}

export interface BaseBlock<TType extends string, TSettings> {
  id: string;
  type: TType;
  settings: TSettings & SectionSettings;
}

export type PromoBlock = BaseBlock<'promo', {
  text: string;
  textColor?: string;
  bgColor?: string;
  tone?: 'dark' | 'light' | 'accent';
}>;

export type HeroBlock = BaseBlock<'hero', {
  eyebrow?: string;
  title: string;
  subtitle: string;
  primaryCta?: string;
  secondaryCta?: string;
  buttonLink?: string;
  imageLabel?: string;
  alignment?: 'start' | 'center';
  emoji?: string;
  bgImage?: string;
  bgType?: 'color' | 'gradient' | 'image';
  gradientFrom?: string;
  gradientTo?: string;
  bgColor?: string;
  textColor?: string;
  minHeight?: string;
}>;

export type TrustStripBlock = BaseBlock<'trustStrip', {
  items: Array<{
    icon?: string;
    title: string;
    text: string;
  }>;
  bgColor?: string;
}>;

export type CategoryTilesBlock = BaseBlock<'categoryTiles', {
  title: string;
  subtitle?: string;
  items: Array<{
    title: string;
    text: string;
    image?: string;
  }>;
}>;

export type CollectionBlock = BaseBlock<'collection', {
  title: string;
  subtitle?: string;
  limit: number;
  layout?: 'grid' | 'carousel' | 'list';
  showViewAll?: boolean;
}>;

export type SpotlightBlock = BaseBlock<'spotlight', {
  title: string;
  text: string;
  bullets: string[];
  cta?: string;
  image?: string;
  imagePosition?: 'left' | 'right';
}>;

export type BenefitsBlock = BaseBlock<'benefits', {
  title: string;
  items: Array<{
    icon?: string;
    title: string;
    text: string;
  }>;
}>;

export type FeaturesBlock = BaseBlock<'features', {
  items?: Array<{
    emoji?: string;
    title: string;
    desc: string;
  }>;
}>;

export type TestimonialsBlock = BaseBlock<'testimonials', {
  title: string;
  items: Array<{
    name: string;
    text: string;
    rating: number;
    avatar?: string;
  }>;
}>;

export type FaqBlock = BaseBlock<'faq', {
  title: string;
  items: Array<{
    question: string;
    answer: string;
  }>;
}>;

export type GalleryBlock = BaseBlock<'gallery', {
  title?: string;
  items: Array<{
    image?: string;
    title?: string;
    description?: string;
  }>;
  columns?: 2 | 3 | 4;
}>;

export type NewsletterBlock = BaseBlock<'newsletter', {
  title: string;
  subtitle?: string;
  placeholder?: string;
  buttonLabel?: string;
}>;

export interface StoreTemplate {
  id: string;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  vertical: StoreVertical;
  tokens: StoreThemeTokens;
  blocks: StorefrontBlock[];
  demoProducts: DemoProduct[];
  qualityTags: string[];
}

export interface StorefrontProduct {
  id: string;
  name: string;
  description: string | null;
  basePrice: string;
  currency: string;
  status: string;
  images?: unknown;
}
