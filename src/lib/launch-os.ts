// Barrel file — re-exports from domain modules for backward compatibility.
// New code should import directly from the specific modules.

export { slugify, sanitizeCategoryInput } from './categories';
export { sanitizeShippingZone, calculateShippingTotal, type ShippingZoneInput } from './shipping';
export { sanitizeDiscount, calculateDiscountTotal, type DiscountType, type DiscountInput } from './discounts';
export { sanitizeReview, summarizeReviews, type ReviewStatus, type ReviewInput } from './reviews';
export { sanitizeStorefrontEvent, type StorefrontEventType } from './storefront-events';
export { buildLaunchPlan } from './launch-plan';
