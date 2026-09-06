"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface RestoreCartClientProps {
  slug: string;
  currency: string;
  items: Array<{
    productId: string;
    variantId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
}

export function RestoreCartClient({ slug, currency, items }: RestoreCartClientProps) {
  const router = useRouter();

  useEffect(() => {
    try {
      const restored = items.map((item) => ({ ...item, currency }));
      localStorage.setItem("storefy_cart", JSON.stringify(restored));
    } catch {
      // storage unavailable — checkout will show empty cart
    }
    router.replace(`/store/${slug}/checkout`);
  }, [slug, currency, items, router]);

  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <p>Restoring your cart…</p>
    </div>
  );
}
