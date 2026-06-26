"use client";

import { useEffect } from "react";
import { getSessionId } from "../../lib/storefront/session";

type EventType = "store_view" | "product_view" | "category_view" | "cart_add" | "checkout_start";

interface StorefrontAnalyticsProps {
  storeSlug: string;
  eventType: EventType;
  productId?: string;
  categoryId?: string;
  metadata?: Record<string, unknown>;
}

export function sendStorefrontEvent(payload: StorefrontAnalyticsProps) {
  if (typeof window === "undefined") return;
  const body = JSON.stringify({ ...payload, sessionId: getSessionId(), path: window.location.pathname });
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/storefront/events", new Blob([body], { type: "application/json" }));
    return;
  }
  fetch("/api/storefront/events", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => undefined);
}

export function StorefrontAnalytics(props: StorefrontAnalyticsProps) {
  useEffect(() => {
    sendStorefrontEvent(props);
  }, [props.storeSlug, props.eventType, props.productId, props.categoryId]);
  return null;
}
