export interface LaunchCheck {
  key: string;
  label: string;
  description: string;
  passed: boolean;
  href: string;
}

export function calculateLaunchScore(input: {
  activeProducts: number;
  totalProducts: number;
  hasTheme: boolean;
  hasHomepage: boolean;
  locale: string;
  currency: string;
  status: string;
  shippingZones?: number;
  activeDiscounts?: number;
  categories?: number;
  hasPaymob?: boolean;
  hasCod?: boolean;
  approvedReviews?: number;
  analyticsEvents?: number;
}) {
  const checks: LaunchCheck[] = [
    {
      key: 'products',
      label: 'Publish at least 5 products',
      description: 'A real storefront needs enough products to feel trustworthy.',
      passed: input.activeProducts >= 5,
      href: '/admin/products',
    },
    {
      key: 'theme',
      label: 'Choose a polished storefront design',
      description: 'Your selected theme controls the first impression.',
      passed: input.hasTheme && input.hasHomepage,
      href: '/admin/themes',
    },
    {
      key: 'locale',
      label: 'Set Arabic/English and EGP correctly',
      description: 'Regional settings must match your shoppers.',
      passed: ['ar', 'en'].includes(input.locale) && input.currency === 'EGP',
      href: '/admin/settings',
    },
    {
      key: 'ai',
      label: 'Train your AI store agent',
      description: 'Refresh AI knowledge so customers can ask about products.',
      passed: input.activeProducts > 0,
      href: '/admin/ai',
    },
    {
      key: 'categories',
      label: 'Organize products into collections',
      description: 'Collections make campaigns and storefront navigation easier to launch.',
      passed: (input.categories || 0) > 0,
      href: '/admin/collections',
    },
    {
      key: 'shipping',
      label: 'Configure shipping and COD',
      description: 'Clear delivery zones and payment options reduce checkout hesitation.',
      passed: (input.shippingZones || 0) > 0 && Boolean(input.hasCod),
      href: '/admin/shipping',
    },
    {
      key: 'payments',
      label: 'Complete Paymob sandbox checklist',
      description: 'Online payment can run with env keys or safe sandbox fallback before launch.',
      passed: Boolean(input.hasPaymob) || Boolean(input.hasCod),
      href: '/admin/payments',
    },
    {
      key: 'promo',
      label: 'Create a launch coupon',
      description: 'A first-order coupon gives shoppers a reason to act now.',
      passed: (input.activeDiscounts || 0) > 0,
      href: '/admin/discounts',
    },
    {
      key: 'social-proof',
      label: 'Collect first reviews',
      description: 'Approved reviews create trust once orders start coming in.',
      passed: (input.approvedReviews || 0) > 0,
      href: '/admin/products',
    },
    {
      key: 'analytics',
      label: 'Verify storefront tracking',
      description: 'Lightweight events show which launch channels and products are working.',
      passed: (input.analyticsEvents || 0) > 0,
      href: '/admin',
    },
    {
      key: 'published',
      label: 'Keep the storefront active',
      description: 'Customers can only buy confidently from an active store.',
      passed: input.status === 'active',
      href: '/admin/settings',
    },
  ];

  const passed = checks.filter((check) => check.passed).length;
  return {
    checks,
    score: Math.round((passed / checks.length) * 100),
    passed,
    total: checks.length,
  };
}
