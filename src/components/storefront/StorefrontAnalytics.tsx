"use client";

import { useEffect } from "react";

type EventType = "store_view" | "product_view" | "category_view" | "cart_add" | "checkout_start";

interface StorefrontAnalyticsProps {
  storeSlug: string;
  eventType: EventType;
  productId?: string;
  categoryId?: string;
  metadata?: Record<string, unknown>;
}

function getSessionId() {
  const key = "storefy_session_id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(key, id);
  return id;
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
