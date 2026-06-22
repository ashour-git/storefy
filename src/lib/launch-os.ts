export type DiscountType = 'percent' | 'fixed';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type StorefrontEventType = 'store_view' | 'product_view' | 'category_view' | 'cart_add' | 'checkout_start';

export interface ShippingZoneInput {
  name: string;
  cities?: string[] | string;
  baseRate: number | string;
  freeShippingThreshold?: number | string | null;
  codEnabled?: boolean;
  active?: boolean;
}

export interface DiscountInput {
  code: string;
  type: DiscountType;
  value: number | string;
  startsAt?: string | null;
  endsAt?: string | null;
  maxUses?: number | string | null;
}

export interface ReviewInput {
  rating: number | string;
  title?: string;
  body?: string;
  authorName?: string;
  authorEmail?: string;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'collection';
}

export function sanitizeCategoryInput(input: { name?: unknown; slug?: unknown; description?: unknown; image?: unknown; sortOrder?: unknown }) {
  const name = typeof input.name === 'string' ? input.name.trim().slice(0, 120) : '';
  const slug = typeof input.slug === 'string' && input.slug.trim() ? slugify(input.slug) : slugify(name);
  const description = typeof input.description === 'string' ? input.description.trim().slice(0, 1000) : '';
  const image = typeof input.image === 'string' ? input.image.trim().slice(0, 1000) : '';
  const sortOrder = Math.max(0, Math.min(9999, Number(input.sortOrder) || 0));

  if (!name) throw new Error('Collection name is required');
  return { name, slug, description: description || null, image: image || null, sortOrder };
}

export function sanitizeShippingZone(input: ShippingZoneInput) {
  const name = String(input.name || '').trim().slice(0, 120);
  const baseRate = Number(input.baseRate);
  const freeShippingThreshold = input.freeShippingThreshold === null || input.freeShippingThreshold === undefined || input.freeShippingThreshold === ''
    ? null
    : Number(input.freeShippingThreshold);
  const rawCities = typeof input.cities === 'string' ? input.cities.split(',') : input.cities;
  const cities = Array.isArray(rawCities)
    ? rawCities.map((city) => String(city).trim()).filter(Boolean).slice(0, 80)
    : [];

  if (!name) throw new Error('Shipping zone name is required');
  if (!Number.isFinite(baseRate) || baseRate < 0 || baseRate > 100000) throw new Error('Shipping rate must be between 0 and 100,000');
  if (freeShippingThreshold !== null && (!Number.isFinite(freeShippingThreshold) || freeShippingThreshold <= 0)) {
    throw new Error('Free shipping threshold must be a positive number');
  }

  return {
    name,
    cities,
    baseRate: baseRate.toFixed(2),
    freeShippingThreshold: freeShippingThreshold === null ? null : freeShippingThreshold.toFixed(2),
    codEnabled: input.codEnabled !== false,
    active: input.active !== false,
  };
}

export function calculateShippingTotal(subtotal: number, zone?: { baseRate: string | number; freeShippingThreshold?: string | number | null }) {
  if (!zone) return 0;
  const threshold = zone.freeShippingThreshold === null || zone.freeShippingThreshold === undefined ? null : Number(zone.freeShippingThreshold);
  if (threshold && subtotal >= threshold) return 0;
  return Math.max(0, Number(zone.baseRate) || 0);
}

export function sanitizeDiscount(input: DiscountInput) {
  const code = String(input.code || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 40);
  const type: DiscountType = input.type === 'fixed' ? 'fixed' : 'percent';
  const value = Number(input.value);
  const maxUses = input.maxUses === null || input.maxUses === undefined || input.maxUses === '' ? null : Number(input.maxUses);

  if (!code) throw new Error('Coupon code is required');
  if (!Number.isFinite(value) || value <= 0) throw new Error('Discount value must be positive');
  if (type === 'percent' && value > 100) throw new Error('Percentage discounts cannot exceed 100%');
  if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses <= 0)) throw new Error('Max uses must be a positive integer');

  return {
    code,
    type,
    value: value.toFixed(2),
    startsAt: input.startsAt ? new Date(input.startsAt) : null,
    endsAt: input.endsAt ? new Date(input.endsAt) : null,
    maxUses,
  };
}

export function calculateDiscountTotal(subtotal: number, discount?: { type: DiscountType; value: string | number; maxUses?: number | null; usesCount?: number | null }) {
  if (!discount) return 0;
  if (discount.maxUses && (discount.usesCount || 0) >= discount.maxUses) return 0;
  const value = Number(discount.value) || 0;
  const total = discount.type === 'percent' ? subtotal * (value / 100) : value;
  return Math.max(0, Math.min(subtotal, total));
}

export function sanitizeReview(input: ReviewInput) {
  const rating = Math.max(1, Math.min(5, Number(input.rating) || 0));
  const title = typeof input.title === 'string' ? input.title.trim().slice(0, 140) : '';
  const body = typeof input.body === 'string' ? input.body.trim().slice(0, 2000) : '';
  const authorName = typeof input.authorName === 'string' ? input.authorName.trim().slice(0, 120) : '';
  const authorEmail = typeof input.authorEmail === 'string' ? input.authorEmail.trim().toLowerCase().slice(0, 180) : '';

  if (!rating) throw new Error('Rating is required');
  if (!body && !title) throw new Error('Review text is required');
  return { rating, title: title || null, body: body || null, authorName: authorName || 'Store customer', authorEmail: authorEmail || null, status: 'pending' as ReviewStatus };
}

export function summarizeReviews(reviews: Array<{ rating: number | string; status?: string }>) {
  const approved = reviews.filter((review) => !review.status || review.status === 'approved');
  const count = approved.length;
  const average = count === 0 ? 0 : approved.reduce((sum, review) => sum + Number(review.rating || 0), 0) / count;
  return { count, average: Math.round(average * 10) / 10 };
}

export function sanitizeStorefrontEvent(input: { eventType?: unknown; sessionId?: unknown; path?: unknown; productId?: unknown; categoryId?: unknown; metadata?: unknown }) {
  const validTypes: StorefrontEventType[] = ['store_view', 'product_view', 'category_view', 'cart_add', 'checkout_start'];
  const eventType = validTypes.includes(input.eventType as StorefrontEventType) ? input.eventType as StorefrontEventType : null;
  const sessionId = typeof input.sessionId === 'string' ? input.sessionId.trim().slice(0, 120) : '';
  if (!eventType) throw new Error('Invalid event type');
  if (!sessionId) throw new Error('Session id is required');
  return {
    eventType,
    sessionId,
    path: typeof input.path === 'string' ? input.path.trim().slice(0, 500) : null,
    productId: typeof input.productId === 'string' && input.productId ? input.productId : null,
    categoryId: typeof input.categoryId === 'string' && input.categoryId ? input.categoryId : null,
    metadata: input.metadata && typeof input.metadata === 'object' ? input.metadata : {},
  };
}

export function buildLaunchPlan(input: {
  storeName: string;
  category?: string | null;
  audience?: string;
  goal?: string;
  channels?: string[];
  products?: string[];
  locale?: 'ar' | 'en';
}) {
  const channels = input.channels?.filter(Boolean).slice(0, 4);
  const heroProducts = input.products?.filter(Boolean).slice(0, 5);
  const channelText = channels?.length ? channels.join(', ') : 'WhatsApp, Instagram, and direct storefront links';
  const productText = heroProducts?.length ? heroProducts.join(', ') : 'your top 3 hero products';
  const goal = input.goal || 'first 10 orders';

  return {
    headline: `${input.storeName} launch plan for ${goal}`,
    positioning: `${input.storeName} should lead with ${productText} for ${input.audience || 'local shoppers'} in ${input.category || 'your niche'}.`,
    checklist: [
      'Publish at least 5 active products with clear prices and images.',
      'Create one launch coupon and one COD-enabled shipping zone.',
      `Post the hero offer across ${channelText}.`,
      'Review the first order timeline daily and follow up with each customer.',
      'Approve real reviews after fulfillment to build social proof.',
    ],
    offer: `Launch offer: 10% off ${productText} until ${goal} are reached.`,
    fallbackMode: true,
  };
}
