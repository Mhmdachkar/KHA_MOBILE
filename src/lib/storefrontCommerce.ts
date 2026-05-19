/** Shared storefront commerce constants — keep cart preview aligned with checkout. */

export const DEFAULT_FREE_SHIPPING_THRESHOLD = 50;
export const DEFAULT_DELIVERY_FEE = 4;

export function getFreeShippingThreshold(threshold?: number): number {
  if (typeof threshold === "number" && Number.isFinite(threshold) && threshold > 0) {
    return threshold;
  }
  return DEFAULT_FREE_SHIPPING_THRESHOLD;
}

export function getDeliveryFee(fee?: number): number {
  if (typeof fee === "number" && Number.isFinite(fee) && fee >= 0) {
    return fee;
  }
  return DEFAULT_DELIVERY_FEE;
}

export function estimateProductOrderTotal(
  subtotal: number,
  deliveryFee: number,
  freeShippingThreshold: number
): { deliveryCharge: number; total: number; qualifiesForFreeShipping: boolean } {
  const qualifiesForFreeShipping = subtotal >= freeShippingThreshold;
  const deliveryCharge = qualifiesForFreeShipping ? 0 : deliveryFee;
  return {
    deliveryCharge,
    total: subtotal + deliveryCharge,
    qualifiesForFreeShipping,
  };
}

/** Empty-cart / marketing category shortcuts → canonical category routes */
export const CATEGORY_QUICK_LINKS: { label: string; path: string }[] = [
  { label: "Smartphones", path: "/smartphones" },
  { label: "Accessories", path: "/accessories" },
  { label: "Wearables", path: "/wearables" },
  { label: "Audio", path: "/audio" },
];
