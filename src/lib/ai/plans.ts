export type AiPlanId = 'free' | 'starter' | 'pro';

export interface AiPlanFeature {
  key: string;
  label: string;
  included: boolean;
}

export interface AiPlan {
  id: AiPlanId;
  name: string;
  monthlyGenerations: number;
  storefrontAgent: boolean;
  ragKnowledgeBase: boolean;
  businessAdvisor: boolean;
  posAgent: boolean;
  analyticsAgent: boolean;
  features: AiPlanFeature[];
}

export const aiPlans: Record<AiPlanId, AiPlan> = {
  free: {
    id: 'free',
    name: 'AI Starter',
    monthlyGenerations: 25,
    storefrontAgent: true,
    ragKnowledgeBase: true,
    businessAdvisor: true,
    posAgent: false,
    analyticsAgent: false,
    features: [
      { key: 'descriptions', label: 'AI product descriptions', included: true },
      { key: 'storefront-agent', label: 'Storefront Q&A agent trained on products', included: true },
      { key: 'business-advisor', label: 'Basic business advisor', included: true },
      { key: 'pos-agent', label: 'POS order parser', included: false },
      { key: 'analytics-agent', label: 'Advanced analytics narrator', included: false },
    ],
  },
  starter: {
    id: 'starter',
    name: 'AI Growth',
    monthlyGenerations: 500,
    storefrontAgent: true,
    ragKnowledgeBase: true,
    businessAdvisor: true,
    posAgent: true,
    analyticsAgent: false,
    features: [
      { key: 'descriptions', label: 'Higher AI generation limit', included: true },
      { key: 'storefront-agent', label: 'Storefront agent with FAQs and policies', included: true },
      { key: 'business-advisor', label: 'Growth advisor chat', included: true },
      { key: 'pos-agent', label: 'POS assistant foundation', included: true },
      { key: 'analytics-agent', label: 'Advanced analytics narrator', included: false },
    ],
  },
  pro: {
    id: 'pro',
    name: 'AI Operators',
    monthlyGenerations: 5000,
    storefrontAgent: true,
    ragKnowledgeBase: true,
    businessAdvisor: true,
    posAgent: true,
    analyticsAgent: true,
    features: [
      { key: 'descriptions', label: 'High-volume AI generation', included: true },
      { key: 'storefront-agent', label: 'Full storefront sales/support agent', included: true },
      { key: 'business-advisor', label: 'Advanced business advisor', included: true },
      { key: 'pos-agent', label: 'POS parser and upsell assistant', included: true },
      { key: 'analytics-agent', label: 'Analytics narrator and KPI coach', included: true },
    ],
  },
};

export function getAiPlan(plan: string | null | undefined): AiPlan {
  if (plan === 'starter' || plan === 'pro') return aiPlans[plan];
  return aiPlans.free;
}
