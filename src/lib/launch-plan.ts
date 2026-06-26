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
