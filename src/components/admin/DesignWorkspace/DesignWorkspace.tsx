import type { ReactNode } from 'react';
import './design-tokens.css';

interface DesignWorkspaceProps {
  storeName: string;
  aiQuota: { used: number; limit: number };
  children: ReactNode;
}

export function DesignWorkspace({ storeName, aiQuota, children }: DesignWorkspaceProps) {
  return (
    <div className="studio-workspace" data-testid="design-workspace">
      <header>
        <h1 className="studio-display">Design Store</h1>
        <p className="studio-body">
          {storeName} · {aiQuota.used} of {aiQuota.limit} AI generations used
        </p>
      </header>
      {children}
    </div>
  );
}
