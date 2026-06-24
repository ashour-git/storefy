"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface OnboardingChecklistProps {
  storeId: string;
  storeSlug: string;
  onboardingComplete: boolean;
  productCount: number;
  hasTheme: boolean;
  hasPaymob: boolean;
  shippingZones: number;
}

type ChecklistItemId = 'profile' | 'design' | 'products' | 'payments' | 'shipping' | 'preview';

interface ChecklistItem {
  id: ChecklistItemId;
  label: string;
  description: string;
  href?: string;
  isComplete: boolean;
}

export function OnboardingChecklist({
  storeId,
  storeSlug,
  onboardingComplete,
  productCount,
  hasTheme,
  hasPaymob,
  shippingZones,
}: OnboardingChecklistProps) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Persist dismiss across page refreshes in this session
  useEffect(() => {
    if (onboardingComplete) setDismissed(true);
  }, [onboardingComplete]);

  if (dismissed || onboardingComplete) return null;

  const items: ChecklistItem[] = [
    {
      id: 'profile',
      label: 'Complete your profile',
      description: 'Add business info, phone, and address',
      href: '/admin/settings',
      isComplete: false,
    },
    {
      id: 'design',
      label: 'Design your store',
      description: 'Upload logo, set colors, and customize theme',
      href: '/admin/themes',
      isComplete: hasTheme,
    },
    {
      id: 'products',
      label: 'Add products',
      description: 'Create your product catalog',
      href: '/admin/products/new',
      isComplete: productCount > 0,
    },
    {
      id: 'payments',
      label: 'Set up payments',
      description: 'Connect Paymob to accept online payments',
      href: '/admin/payments',
      isComplete: hasPaymob,
    },
    {
      id: 'shipping',
      label: 'Configure shipping',
      description: 'Set delivery zones and rates',
      href: '/admin/shipping',
      isComplete: shippingZones > 0,
    },
    {
      id: 'preview',
      label: 'Preview storefront',
      description: 'See how your store looks to customers',
      href: `/store/${storeSlug}`,
      isComplete: false,
    },
  ];

  const completedCount = items.filter(i => i.isComplete).length;

  const markComplete = async () => {
    setCompleting(true);
    try {
      await fetch(`/api/stores/${storeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboardingComplete: true }),
      });
      setDismissed(true);
      router.refresh();
    } catch {
      setDismissed(true);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="onboarding-checklist">
      <div className="onboarding-header">
        <div className="onboarding-header-left">
          <div className="onboarding-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </div>
          <div>
            <h3 className="onboarding-title">Launch Checklist</h3>
            <p className="onboarding-subtitle">
              {completedCount} of {items.length} steps completed &middot; Complete these to get your store ready
            </p>
          </div>
        </div>
        <div className="onboarding-header-right">
          <div className="onboarding-progress-ring">
            <svg width="36" height="36" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="var(--border-subtle)" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15"
                fill="none"
                stroke="var(--accent-primary)"
                strokeWidth="3"
                strokeDasharray={`${(completedCount / items.length) * 94.25} 94.25`}
                strokeLinecap="round"
                transform="rotate(-90 18 18)"
                style={{ transition: 'stroke-dasharray 0.4s ease' }}
              />
              <text x="18" y="18" textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight="700" fill="currentColor">
                {Math.round((completedCount / items.length) * 100)}%
              </text>
            </svg>
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="onboarding-dismiss-btn"
            title="Dismiss"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      <div className="onboarding-grid">
        {items.map((item) => (
          <div key={item.id} className={`onboarding-item ${item.isComplete ? 'complete' : ''}`}>
            <div className="onboarding-item-check">
              {item.isComplete ? (
                <div className="onboarding-check-circle">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              ) : (
                <div className="onboarding-check-empty" />
              )}
            </div>
            <div className="onboarding-item-content">
              <span className="onboarding-item-label">{item.label}</span>
              <span className="onboarding-item-desc">{item.description}</span>
            </div>
            {item.href && !item.isComplete && (
              <a
                href={item.href}
                target={item.href.startsWith('/store/') ? '_blank' : undefined}
                rel={item.href.startsWith('/store/') ? 'noopener noreferrer' : undefined}
                className="onboarding-item-cta"
              >
                {item.id === 'preview' ? 'View' : 'Go'}
              </a>
            )}
          </div>
        ))}
      </div>

      {completedCount >= 4 && (
        <div className="onboarding-footer">
          <button
            type="button"
            onClick={markComplete}
            disabled={completing}
            className="onboarding-complete-btn"
          >
            {completing ? 'Marking…' : 'Mark Setup as Complete'}
          </button>
        </div>
      )}
    </div>
  );
}
