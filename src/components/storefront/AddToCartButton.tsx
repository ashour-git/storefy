"use client";

import { useCart } from "./CartProvider";
import type { Locale } from "../../lib/i18n";
import { getStorefrontCopy } from "../../lib/storefront/copy";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    basePrice: string;
    currency: string;
    image?: string;
  };
  locale: Locale;
}

export function AddToCartButton({ product, locale }: AddToCartButtonProps) {
  const { addItem, setIsCartOpen } = useCart();
  const copy = getStorefrontCopy(locale);

  return (
    <button
      type="button"
      className="store-submit-btn"
      onClick={() => {
        addItem({ productId: product.id, name: product.name, price: Number(product.basePrice), currency: product.currency, quantity: 1, image: product.image });
        setIsCartOpen(true);
      }}
    >
      {copy.addToCart}
    </button>
  );
}
