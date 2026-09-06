export interface CartSyncItem {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  currency: string;
  image?: string;
}

export interface CartSyncMeta {
  storeSlug: string;
  sessionId: string;
  customerEmail?: string;
}

export interface CartSyncBody {
  storeSlug: string;
  sessionId: string;
  items: Array<{
    productId: string;
    variantId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  customerEmail?: string;
}

export function buildCartSyncBody(items: CartSyncItem[], meta: CartSyncMeta): CartSyncBody {
  const valid = items
    .filter((item) => item.productId && item.quantity > 0)
    .slice(0, 50)
    .map((item) => ({
      productId: item.productId,
      variantId: item.variantId || item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    }));
  const body: CartSyncBody = {
    storeSlug: meta.storeSlug,
    sessionId: meta.sessionId,
    items: valid,
  };
  if (meta.customerEmail) body.customerEmail = meta.customerEmail;
  return body;
}
