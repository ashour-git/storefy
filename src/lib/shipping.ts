export interface ShippingZoneInput {
  name: string;
  cities?: string[] | string;
  baseRate: number | string;
  freeShippingThreshold?: number | string | null;
  codEnabled?: boolean;
  active?: boolean;
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
