"use client";

import React from "react";
import { useCart } from "./CartProvider";
import type { Locale } from "../../lib/i18n";
import { getStorefrontCopy } from "../../lib/storefront/copy";

interface CartDrawerProps {
  storeSlug: string;
  locale: Locale;
}

export function CartDrawer({ storeSlug, locale }: CartDrawerProps) {
  const { items, totalItems, totalAmount, isCartOpen, setIsCartOpen, removeItem } = useCart();
  const copy = getStorefrontCopy(locale);

  return (
    <>
      {/* Cart Icon Button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-[var(--store-primary)] text-white shadow-2xl hover:scale-105 transition-transform cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--store-primary)] focus:ring-offset-2"
        style={{ border: "none" }}
        aria-label={copy.cart}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-red-500 text-white font-bold text-xs shadow-md border-2 border-white">
            {totalItems}
          </span>
        )}
      </button>

      {/* Cart Drawer Overlay */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end"
          onClick={() => setIsCartOpen(false)}
        >
          {/* Drawer content */}
          <div 
            className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              animation: "slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">{copy.cart}</h2>
                <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  {totalItems} {totalItems === 1 ? copy.item : copy.items}
                </span>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
                style={{ border: "none", background: "none" }}
                aria-label="Close cart"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="text-5xl mb-4 opacity-50">🛒</div>
                  <h3 className="font-bold text-lg mb-1">{copy.emptyCart}</h3>
                  <p className="text-gray-500 text-sm max-w-xs">{copy.emptyCartBody}</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.productId} className="flex gap-4 pb-6 border-b border-gray-50">
                    <div className="w-16 h-20 bg-gray-50 rounded-md overflow-hidden flex items-center justify-center text-3xl flex-shrink-0" style={{ border: "1px solid rgba(0,0,0,0.05)" }}>
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                      ) : (
                        "🧴"
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-gray-400 mt-1">{copy.quantity}: {item.quantity}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-gray-900">
                          {Number(item.price * item.quantity).toLocaleString(locale === "ar" ? "ar-EG" : "en-EG")} {item.currency}
                        </span>
                        <button 
                          onClick={() => removeItem(item.productId)}
                          className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                          style={{ border: "none", background: "none" }}
                        >
                          {copy.remove}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-gray-500">{copy.subtotal}</span>
                  <span className="text-2xl font-black text-gray-900">
                    {Number(totalAmount).toLocaleString(locale === "ar" ? "ar-EG" : "en-EG")} <span className="text-sm font-normal text-gray-500">{items[0]?.currency || "EGP"}</span>
                  </span>
                </div>
                <p className="text-xs text-gray-400">{copy.checkoutNote}</p>
                <a 
                  href={`/store/${storeSlug}/checkout`}
                  className="flex items-center justify-center w-full py-4 px-6 rounded-xl bg-[var(--store-primary)] text-white font-bold text-center shadow-lg hover:brightness-110 transition-all text-decoration-none cursor-pointer"
                >
                  {copy.checkout}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Slide-in Keyframe style tag */}
      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
