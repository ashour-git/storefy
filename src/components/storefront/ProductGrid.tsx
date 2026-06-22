"use client";

import React from "react";
import { useCart } from "./CartProvider";
import type { Locale } from "../../lib/i18n";
import { getStorefrontCopy } from "../../lib/storefront/copy";
import { ProductImagePlaceholder } from "./ProductImagePlaceholder";

import { DynamicIcon } from "../IconLibrary";

interface Product {
  id: string;
  name: string;
  description: string | null;
  basePrice: string;
  currency: string;
  status: string;
  images?: unknown;
  metadata?: unknown;
}

interface ProductGridProps {
  products: Product[];
  storeName: string;
  locale: Locale;
  storeSlug?: string;
}

export function ProductGrid({ products, storeName, locale, storeSlug }: ProductGridProps) {
  const { addItem } = useCart();
  const copy = getStorefrontCopy(locale);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    const imageUrls = product.images as string[] | undefined;
    const mainImage = imageUrls && imageUrls.length > 0 ? imageUrls[0] : undefined;
    
    addItem({
      productId: product.id,
      name: product.name,
      price: parseFloat(product.basePrice),
      quantity: 1,
      currency: product.currency || "EGP",
      image: mainImage,
    });
  };

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-24 h-24 mb-6 rounded-full bg-[var(--store-primary)]/10 flex items-center justify-center text-4xl opacity-80" style={{ color: 'var(--store-primary)' }}>
          <DynamicIcon name="cart" size={40} />
        </div>
        <h3 className="text-2xl font-bold mb-2">{copy.emptyTitle}</h3>
        <p className="text-[var(--store-text)]/70 max-w-md">
          {storeName}: {copy.emptyBody}
        </p>
      </div>
    );
  }

  return (
    <div className="store-product-grid">
      {products.map((product) => {
        const imageUrls = product.images as string[] | undefined;
        const mainImage = imageUrls && imageUrls.length > 0 ? imageUrls[0] : null;

        return (
          <div
            key={product.id}
            className="store-product-card group"
          >
            <div className="store-product-media">
              {mainImage ? (
                <img 
                  src={mainImage} 
                  alt={product.name} 
                  className="store-product-img"
                />
              ) : (
                <ProductImagePlaceholder name={product.name} />
              )}
            </div>

            <div className="store-product-body">
              <div>
                <a href={storeSlug ? `/store/${storeSlug}/product/${product.id}` : `./product/${product.id}`} className="store-product-title">
                  {product.name}
                </a>
              </div>
              
              <p className="store-product-desc">
                {product.description || (locale === "ar" ? "منتج مختار بعناية لمتجرك." : "A carefully selected product for your store.")}
              </p>
              
              <div className="store-product-footer">
                <span className="store-product-price">
                  {Number(product.basePrice).toLocaleString(locale === "ar" ? "ar-EG" : "en-EG")} <span>{product.currency}</span>
                </span>
                
                <button 
                  onClick={(e) => handleAddToCart(e, product)}
                  className="store-product-add"
                  aria-label={`${copy.addToCart}: ${product.name}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
