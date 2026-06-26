"use client";

import React from "react";
import { useCart } from "./CartProvider";
import type { Locale } from "../../lib/i18n";
import { getStorefrontCopy } from "../../lib/storefront/copy";
import Image from "next/image";

import { DynamicIcon } from "../IconLibrary";

interface CartDrawerProps {
  storeSlug: string;
  locale: Locale;
}

export function CartDrawer({ storeSlug, locale }: CartDrawerProps) {
  const { items, totalItems, totalAmount, isCartOpen, setIsCartOpen, removeItem, updateQuantity } = useCart();
  const copy = getStorefrontCopy(locale);

  return (
    <>
      {/* Cart Icon Button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="store-cart-fab"
        style={{ border: "none" }}
        aria-label={copy.cart}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        {totalItems > 0 && (
          <span className="store-cart-count">
            {totalItems}
          </span>
        )}
      </button>

      {/* Cart Drawer Overlay */}
      {isCartOpen && (
        <div 
          className="store-cart-overlay"
          onClick={() => setIsCartOpen(false)}
        >
          {/* Drawer content */}
          <div 
            className="store-cart-panel"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              animation: "slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}
          >
            {/* Header */}
            <div className="store-cart-header">
              <div className="store-cart-title-group">
                <h2>{copy.cart}</h2>
                <span>
                  {totalItems} {totalItems === 1 ? copy.item : copy.items}
                </span>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="store-cart-close"
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
            <div className="store-cart-items">
              {items.length === 0 ? (
                <div className="store-cart-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '40px 20px' }}>
                  <div style={{ color: 'var(--store-text)', opacity: 0.3 }}><DynamicIcon name="cart" size={48} /></div>
                  <h3 style={{ margin: '8px 0 4px', fontSize: '1.1rem', fontWeight: 700 }}>{copy.emptyCart}</h3>
                  <p style={{ margin: 0, fontSize: '0.88rem', opacity: 0.6, textAlign: 'center' }}>{copy.emptyCartBody}</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={`${item.productId}-${item.variantId || ''}`} className="store-cart-line">
                    <div className="store-cart-line-media" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.02)', borderRadius: '4px' }}>
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} />
                      ) : (
                        <DynamicIcon name="package" size={24} style={{ opacity: 0.3 }} />
                      )}
                    </div>
                    <div className="store-cart-line-body">
                      <div>
                        <h4>{item.name}</h4>
                        {item.variantId && (
                          <p style={{ margin: '2px 0', fontSize: '0.78rem', opacity: 0.5 }}>{item.variantId}</p>
                        )}
                      </div>
                      <div className="store-cart-line-footer">
                        <span>
                          {Number(item.price * item.quantity).toLocaleString(locale === "ar" ? "ar-EG" : "en-EG")} {item.currency}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            onClick={() => updateQuantity(item.productId, item.variantId || '', item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label={copy.quantity + ' -'}
                            style={{
                              width: '26px', height: '26px', borderRadius: '50%', border: '1px solid var(--store-border, #e5e7eb)',
                              background: item.quantity <= 1 ? 'transparent' : 'var(--store-bg, #fff)',
                              cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '14px', fontWeight: 700, opacity: item.quantity <= 1 ? 0.3 : 0.7,
                            }}
                          >
                            -
                          </button>
                          <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 600, fontSize: '0.9rem' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.variantId || '', item.quantity + 1)}
                            disabled={item.quantity >= 99}
                            aria-label={copy.quantity + ' +'}
                            style={{
                              width: '26px', height: '26px', borderRadius: '50%', border: '1px solid var(--store-border, #e5e7eb)',
                              background: item.quantity >= 99 ? 'transparent' : 'var(--store-bg, #fff)',
                              cursor: item.quantity >= 99 ? 'not-allowed' : 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '14px', fontWeight: 700, opacity: item.quantity >= 99 ? 0.3 : 0.7,
                            }}
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeItem(item.productId, item.variantId)}
                            aria-label={copy.remove}
                            style={{
                              border: 'none', background: 'none', cursor: 'pointer',
                              fontSize: '0.75rem', opacity: 0.4, padding: '2px 4px', marginLeft: '2px',
                            }}
                          >
                            {copy.remove}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <div className="store-cart-footer">
                <div className="store-cart-subtotal">
                  <span>{copy.subtotal}</span>
                  <span>
                    {Number(totalAmount).toLocaleString(locale === "ar" ? "ar-EG" : "en-EG")} <small>{items[0]?.currency || "EGP"}</small>
                  </span>
                </div>
                <p>{copy.checkoutNote}</p>
                <a 
                  href={`/store/${storeSlug}/checkout`}
                  className="store-cart-checkout"
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
