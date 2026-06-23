"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { sendStorefrontEvent } from "./StorefrontAnalytics";

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  currency: string;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('storefy_session_id');
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem('storefy_session_id', id);
  }
  return id;
}

function getStoreSlug(): string {
  if (typeof window === 'undefined') return '';
  const parts = window.location.pathname.split('/');
  return parts[2] || '';
}

async function syncCartToDb(items: CartItem[]) {
  try {
    const slug = getStoreSlug();
    const sessionId = getSessionId();
    if (!slug || !sessionId) return;

    await fetch('/api/storefront/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storeSlug: slug,
        sessionId,
        items: items.map(item => ({
          productId: item.productId,
          variantId: item.variantId || item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
      }),
    });
  } catch {
    // Silent fail — cart still works locally
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    const savedCart = localStorage.getItem("storefy_cart");
    if (!savedCart) return [];
    try {
      return JSON.parse(savedCart) as CartItem[];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    queueMicrotask(() => setIsMounted(true));
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("storefy_cart", JSON.stringify(items));
    }
  }, [items, isMounted]);

  useEffect(() => {
    if (isMounted && items.length > 0) {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => syncCartToDb(items), 2000);
    }
    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [items, isMounted]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });
    const slug = window.location.pathname.split("/")[2];
    if (slug) sendStorefrontEvent({ storeSlug: slug, eventType: "cart_add", productId: item.productId, metadata: { quantity: item.quantity } });
    setIsCartOpen(true);
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        totalItems,
        totalAmount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
