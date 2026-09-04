import { DASHBOARD_TABS, type DashboardTab } from '../../lib/admin/dashboard-tabs';
import { SectionEmpty } from './SectionStates';

const PLACEHOLDERS: Record<Exclude<DashboardTab, 'overview'>, { title: string; description: string }> = {
  tasks: {
    title: 'Tasks are on the way',
    description: 'Actionable follow-ups from your store will land here.',
  },
  analytics: {
    title: 'Analytics are on the way',
    description: 'Top products, channel split, and repeat-customer rate will land here.',
  },
  briefing: {
    title: 'Briefing is on the way',
    description: 'Your AI daily briefing with recommended actions will land here.',
  },
};

export function DashboardTabs({ activeTab }: { activeTab: DashboardTab }) {
  return (
    <nav aria-label="Dashboard sections" className="admin-tabs">
      {DASHBOARD_TABS.map((tab) => (
        <a
          key={tab.id}
          href={tab.id === 'overview' ? '/admin' : `/admin?tab=${tab.id}`}
          aria-current={tab.id === activeTab ? 'page' : undefined}
          className="admin-tab-link"
        >
          {tab.label}
        </a>
      ))}
    </nav>
  );
}

export function TabPlaceholder({ tab }: { tab: Exclude<DashboardTab, 'overview'> }) {
  const copy = PLACEHOLDERS[tab];
  return <SectionEmpty title={copy.title} description={copy.description} />;
}
