export type DiscountType = 'percent' | 'fixed';

export interface DiscountInput {
  code: string;
  type: DiscountType;
  value: number | string;
  startsAt?: string | null;
  endsAt?: string | null;
  maxUses?: number | string | null;
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
