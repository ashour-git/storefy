export const DASHBOARD_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'briefing', label: 'Briefing' },
] as const;

export type DashboardTab = (typeof DASHBOARD_TABS)[number]['id'];

export function resolveDashboardTab(value: unknown): DashboardTab {
  return DASHBOARD_TABS.some((tab) => tab.id === value) ? (value as DashboardTab) : 'overview';
}

export function shouldShowOnboarding(input: {
  orderCount: number;
  pendingOrders: number;
  onboardingComplete: boolean;
}): boolean {
  if (input.onboardingComplete) return false;
  return input.orderCount <= input.pendingOrders;
}
