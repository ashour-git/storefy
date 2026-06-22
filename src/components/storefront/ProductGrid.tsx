"use client";

import React from "react";
import { useCart } from "./CartProvider";

interface Product {
  id: string;
  name: string;
  description: string | null;
  basePrice: string;
  currency: string;
  status: string;
  images?: any;
  metadata?: any;
}

interface ProductGridProps {
  products: Product[];
  storeName: string;
}

export function ProductGrid({ products, storeName }: ProductGridProps) {
  const { addItem } = useCart();

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
        <div className="w-24 h-24 mb-6 rounded-full bg-[var(--store-primary)]/10 flex items-center justify-center text-4xl opacity-80">
          🛍️
        </div>
        <h3 className="text-2xl font-bold mb-2">Check back soon!</h3>
        <p className="text-[var(--store-text)]/70 max-w-md">
          {storeName} hasn't added any products to their catalog yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
      {products.map((product) => {
        const imageUrls = product.images as string[] | undefined;
        const mainImage = imageUrls && imageUrls.length > 0 ? imageUrls[0] : null;

        return (
          <div
            key={product.id}
            className="group flex flex-col bg-white/5 backdrop-blur-sm rounded-[var(--store-radius)] overflow-hidden border border-black/5 hover:border-[var(--store-primary)]/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}
          >
            {/* Image display */}
            <div className="aspect-[4/5] bg-gray-50 relative overflow-hidden flex items-center justify-center">
              {mainImage ? (
                <img 
                  src={mainImage} 
                  alt={product.name} 
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="text-6xl group-hover:scale-110 transition-transform duration-500">
                  🧴
                </div>
              )}
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <div className="p-5 flex flex-col flex-1 bg-white">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-[1.05rem] text-gray-900 line-clamp-1 group-hover:text-[var(--store-primary)] transition-colors">
                  {product.name}
                </h3>
              </div>
              
              <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                {product.description || "A wonderful addition to your collection."}
              </p>
              
              <div className="flex items-center justify-between mt-auto">
                <span className="font-extrabold text-[1.1rem] text-gray-900 tracking-tight">
                  {Number(product.basePrice).toLocaleString()} <span className="text-xs text-gray-500 font-normal ml-0.5">{product.currency}</span>
                </span>
                
                <button 
                  onClick={(e) => handleAddToCart(e, product)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--store-primary)]/10 text-[var(--store-primary)] group-hover:bg-[var(--store-primary)] group-hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--store-primary)] focus:ring-offset-2 cursor-pointer"
                  aria-label={`Add ${product.name} to cart`}
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
