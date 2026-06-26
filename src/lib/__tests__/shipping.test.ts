import { describe, expect, it } from 'vitest';
import { sanitizeShippingZone } from '../shipping';

describe('sanitizeShippingZone', () => {
  it('requires a name', () => {
    expect(() => sanitizeShippingZone({ name: '', baseRate: '50' })).toThrow('name is required');
  });

  it('accepts a valid zone', () => {
    const result = sanitizeShippingZone({ name: 'Cairo Zone', baseRate: '50' });
    expect(result.name).toBe('Cairo Zone');
    expect(result.baseRate).toBe('50.00');
  });

  it('rejects negative baseRate', () => {
    expect(() => sanitizeShippingZone({ name: 'x', baseRate: -1 })).toThrow('rate');
  });

  it('rejects baseRate over 100,000', () => {
    expect(() => sanitizeShippingZone({ name: 'x', baseRate: 100001 })).toThrow('rate');
  });

  it('parses cities as comma-separated string', () => {
    const result = sanitizeShippingZone({ name: 'x', baseRate: '30', cities: 'Cairo,Giza,Alexandria' });
    expect(result.cities).toEqual(['Cairo', 'Giza', 'Alexandria']);
  });

  it('parses cities as array', () => {
    const result = sanitizeShippingZone({ name: 'x', baseRate: '30', cities: ['Cairo', 'Giza'] });
    expect(result.cities).toEqual(['Cairo', 'Giza']);
  });

  it('defaults codEnabled to true', () => {
    const result = sanitizeShippingZone({ name: 'x', baseRate: '30' });
    expect(result.codEnabled).toBe(true);
  });

  it('defaults active to true', () => {
    const result = sanitizeShippingZone({ name: 'x', baseRate: '30' });
    expect(result.active).toBe(true);
  });

  it('accepts null freeShippingThreshold', () => {
    const result = sanitizeShippingZone({ name: 'x', baseRate: '30', freeShippingThreshold: null });
    expect(result.freeShippingThreshold).toBeNull();
  });

  it('accepts valid freeShippingThreshold', () => {
    const result = sanitizeShippingZone({ name: 'x', baseRate: '30', freeShippingThreshold: '200' });
    expect(result.freeShippingThreshold).toBe('200.00');
  });

  it('rejects zero freeShippingThreshold', () => {
    expect(() => sanitizeShippingZone({ name: 'x', baseRate: '30', freeShippingThreshold: 0 })).toThrow('threshold');
  });
});
