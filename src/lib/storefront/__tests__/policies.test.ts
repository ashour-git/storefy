import { describe, expect, it } from 'vitest';
import { getPolicyContent, policyTypes } from '../policies';

describe('store policy templates', () => {
  it('provides all expected policy routes', () => {
    expect(policyTypes).toEqual(['shipping', 'returns', 'privacy', 'contact']);
  });

  it('localizes generated policy copy', () => {
    expect(getPolicyContent('shipping', 'en', 'Scent Palace').title).toBe('Shipping Policy');
    expect(getPolicyContent('shipping', 'ar', 'قصر العطور').title).toBe('سياسة الشحن');
    expect(getPolicyContent('privacy', 'en', 'Scent Palace').body).toContain('Scent Palace');
  });
});
