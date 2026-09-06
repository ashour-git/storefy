export const BLOCK_TYPES = [
  'promo',
  'hero',
  'features',
  'collection',
  'testimonials',
  'newsletter',
  'gallery',
  'faq',
  'trustStrip',
  'categoryTiles',
  'spotlight',
  'benefits',
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export interface SectionBlock {
  id: string;
  type: BlockType;
  settings: Record<string, unknown> & { hidden?: boolean };
}

export interface BlockItem {
  title?: string;
  desc?: string;
  description?: string;
  emoji?: string;
  name?: string;
  text?: string;
  rating?: number;
  src?: string;
  question?: string;
  answer?: string;
  icon?: string;
  [key: string]: unknown;
}

export interface BlockSettings {
  hidden?: boolean;
  text?: string;
  textColor?: string;
  bgColor?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  primaryCta?: string;
  alignment?: string;
  bgType?: string;
  gradientFrom?: string;
  gradientTo?: string;
  emoji?: string;
  limit?: number;
  items?: BlockItem[];
  columns?: number;
  placeholder?: string;
  eyebrow?: string;
  secondaryCta?: string;
  minHeight?: string;
  bullets?: string[];
  cta?: string;
  imagePosition?: string;
  layout?: string;
  paddingTop?: string;
  paddingBottom?: string;
  animation?: string;
  showViewAll?: boolean;
  [key: string]: unknown;
}

export interface Block {
  id: string;
  type: string;
  settings: BlockSettings;
}

const DEFAULTS: Record<BlockType, Record<string, unknown>> = {
  promo: { text: 'Special Announcement: Add custom banner text here!', textColor: '#ffffff', bgColor: 'var(--store-primary)', hidden: false },
  hero: { title: 'Custom Headline Title', subtitle: 'Write a descriptive and engaging subtitle here.', buttonText: 'Click Me', buttonLink: '#', alignment: 'center', bgType: 'gradient', gradientFrom: '#0f172a', gradientTo: '#1e293b', emoji: 'sparkles', hidden: false },
  features: {
    hidden: false,
    items: [
      { title: 'Feature One', desc: 'Description text highlighting important details.', emoji: 'package' },
      { title: 'Feature Two', desc: 'Description text highlighting important details.', emoji: 'flask' },
      { title: 'Feature Three', desc: 'Description text highlighting important details.', emoji: 'revenue' },
    ],
  },
  collection: { title: 'Featured Products', subtitle: 'Explore our handpicked catalog of popular products.', limit: 8, hidden: false },
  testimonials: {
    title: 'Client Testimonials',
    hidden: false,
    items: [
      { name: 'Youssef', text: 'Exceptional fragrance line and amazing packaging experience.', rating: 5 },
      { name: 'Sherif', text: 'Fragrance persists beautifully throughout the entire day.', rating: 5 },
    ],
  },
  newsletter: { title: 'Subscribe to our Newsletter', subtitle: 'Get updates on new drops and exclusive private sales.', buttonText: 'Subscribe', placeholder: 'Enter your email address...', hidden: false },
  gallery: {
    title: 'Visual Gallery',
    hidden: false,
    items: [
      { title: 'Summer Scents', desc: 'Fresh botanical collections.', emoji: 'leaf' },
      { title: 'Warm Amber', desc: 'Cozy woody notes for evening wear.', emoji: 'fire' },
      { title: 'Exclusive Blends', desc: 'Limited run collections.', emoji: 'sparkles' },
    ],
  },
  faq: {
    title: 'Common Questions',
    hidden: false,
    items: [
      { question: 'How long does delivery take?', answer: 'Usually 24-48 hours across Egypt.' },
      { question: 'Are these authentic perfumes?', answer: '100% authentic formulated with high quality French oils.' },
    ],
  },
  trustStrip: {
    hidden: false,
    items: [
      { icon: 'shield', title: 'Secure Payments', text: 'Protected by encrypted checkout.' },
      { icon: 'truck', title: 'Fast Delivery', text: 'Nationwide delivery in 24-48 hours.' },
      { icon: 'headphones', title: 'Support', text: 'WhatsApp support 7 days a week.' },
    ],
  },
  categoryTiles: {
    title: 'Shop by Category',
    subtitle: 'Find exactly what you are looking for.',
    hidden: false,
    items: [
      { title: 'New Arrivals', text: 'Fresh drops this season', image: '' },
      { title: 'Best Sellers', text: 'Customer favorites', image: '' },
      { title: 'Sale', text: 'Up to 50% off', image: '' },
    ],
  },
  spotlight: {
    title: 'Why Choose Us',
    text: 'We bring you the finest curated products with unmatched customer service.',
    bullets: ['Premium quality guaranteed', 'Fast nation-wide shipping', 'Easy 14-day returns'],
    cta: 'Learn More',
    image: '',
    imagePosition: 'right',
    hidden: false,
  },
  benefits: {
    title: 'Your Benefits',
    hidden: false,
    items: [
      { icon: 'package', title: 'Free Shipping', text: 'On orders over 500 EGP' },
      { icon: 'revenue', title: 'Best Prices', text: 'Price match guarantee' },
      { icon: 'star', title: 'Premium Quality', text: 'Curated with care' },
    ],
  },
};

export function createBlock(type: BlockType): SectionBlock {
  return {
    id: `${type}-${Date.now()}`,
    type,
    settings: JSON.parse(JSON.stringify(DEFAULTS[type])) as Record<string, unknown> & { hidden?: boolean },
  };
}
