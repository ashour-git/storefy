import type { Locale } from '../i18n';

export type StoreVertical = 'perfume' | 'fashion' | 'food' | 'electronics' | 'handmade' | 'home';

export interface StoreThemeTokens {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  accentColor: string;
  fontFamily: string;
  headingFontFamily: string;
  borderRadius: string;
  heroPattern?: string;
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
  | TestimonialsBlock
  | FaqBlock;

export interface BaseBlock<TType extends string, TSettings> {
  id: string;
  type: TType;
  settings: TSettings;
}

export type PromoBlock = BaseBlock<'promo', {
  text: Record<Locale, string>;
  tone?: 'dark' | 'light' | 'accent';
}>;

export type HeroBlock = BaseBlock<'hero', {
  eyebrow: Record<Locale, string>;
  title: Record<Locale, string>;
  subtitle: Record<Locale, string>;
  primaryCta: Record<Locale, string>;
  secondaryCta?: Record<Locale, string>;
  imageLabel?: Record<Locale, string>;
  alignment?: 'start' | 'center';
}>;

export type TrustStripBlock = BaseBlock<'trustStrip', {
  items: Array<{
    title: Record<Locale, string>;
    text: Record<Locale, string>;
  }>;
}>;

export type CategoryTilesBlock = BaseBlock<'categoryTiles', {
  title: Record<Locale, string>;
  subtitle: Record<Locale, string>;
  items: Array<{
    title: Record<Locale, string>;
    text: Record<Locale, string>;
  }>;
}>;

export type CollectionBlock = BaseBlock<'collection', {
  title: Record<Locale, string>;
  subtitle: Record<Locale, string>;
  limit: number;
}>;

export type SpotlightBlock = BaseBlock<'spotlight', {
  title: Record<Locale, string>;
  text: Record<Locale, string>;
  bullets: Array<Record<Locale, string>>;
  cta?: Record<Locale, string>;
}>;

export type BenefitsBlock = BaseBlock<'benefits', {
  title: Record<Locale, string>;
  items: Array<{
    title: Record<Locale, string>;
    text: Record<Locale, string>;
  }>;
}>;

export type TestimonialsBlock = BaseBlock<'testimonials', {
  title: Record<Locale, string>;
  items: Array<{
    name: string;
    text: Record<Locale, string>;
    rating: number;
  }>;
}>;

export type FaqBlock = BaseBlock<'faq', {
  title: Record<Locale, string>;
  items: Array<{
    question: Record<Locale, string>;
    answer: Record<Locale, string>;
  }>;
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
