/**
 * Storefront pricing: single source for list/sale/compare-at and card/PDP presentation.
 */

import { hasRetailDiscount, retailDiscountPercent } from "@/lib/adminProductPricing";

export interface PricedOption {
  price?: number | string | null;
}

export interface StorefrontPriceInput {
  price: number | string;
  compareAtPrice?: number | null;
  variants?: PricedOption[];
  sizes?: PricedOption[];
}

function toNumber(v: number | string | null | undefined): number {
  if (v == null) return NaN;
  const n = typeof v === "string" ? Number.parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function minOptionPrice(options: PricedOption[] | undefined): number | null {
  if (!options?.length) return null;
  let min = Infinity;
  for (const o of options) {
    const n = toNumber(o.price ?? undefined);
    if (Number.isFinite(n) && n < min) min = n;
  }
  return min === Infinity ? null : min;
}

/** Lowest sellable unit price (variants/sizes override base when present). */
export function resolveSalePrice(product: StorefrontPriceInput): number {
  const base = toNumber(product.price);
  const variantMin = minOptionPrice(product.variants);
  const sizeMin = minOptionPrice(product.sizes);
  const candidates = [base, variantMin, sizeMin].filter((n): n is number => Number.isFinite(n));
  if (candidates.length === 0) return 0;
  return Math.min(...candidates);
}

/** Compare-at list price when it exceeds resolved sale price. */
export function resolveListPrice(product: StorefrontPriceInput): number | null {
  const cmp = product.compareAtPrice != null ? Number(product.compareAtPrice) : NaN;
  const sale = resolveSalePrice(product);
  if (!Number.isFinite(cmp) || cmp <= sale) return null;
  return cmp;
}

export function formatMoney(amount: number | string): string {
  const n = toNumber(amount);
  if (!Number.isFinite(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

export interface CardPricePresentation {
  displayPrice: number;
  compareAtPrice: number | null;
  showDiscount: boolean;
  discountPercent: number;
  priceLabel: string;
  hasPriceRange: boolean;
}

export function getCardPricePresentation(product: StorefrontPriceInput): CardPricePresentation {
  const displayPrice = resolveSalePrice(product);
  const compareAt = resolveListPrice(product);
  const showDiscount = compareAt != null && hasRetailDiscount(compareAt, displayPrice);
  const variantMin = minOptionPrice(product.variants);
  const variantMax = product.variants?.length
    ? Math.max(...product.variants.map((v) => toNumber(v.price)).filter(Number.isFinite))
    : null;
  const hasPriceRange =
    variantMin != null &&
    variantMax != null &&
    Number.isFinite(variantMin) &&
    Number.isFinite(variantMax) &&
    variantMax > variantMin;

  const priceLabel = hasPriceRange
    ? `From ${formatMoney(displayPrice)}`
    : formatMoney(displayPrice);

  return {
    displayPrice,
    compareAtPrice: compareAt,
    showDiscount,
    discountPercent: showDiscount && compareAt != null ? retailDiscountPercent(compareAt, displayPrice) : 0,
    priceLabel,
    hasPriceRange,
  };
}

export interface PdpPricePresentation {
  displayPrice: number;
  compareAtPrice: number | null;
  showDiscount: boolean;
  discountPercent: number;
}

export function getPdpPricePresentation(
  product: StorefrontPriceInput,
  selectedVariantPrice?: number | null,
  selectedSizePrice?: number | null
): PdpPricePresentation {
  let displayPrice = resolveSalePrice(product);
  if (selectedSizePrice != null && Number.isFinite(Number(selectedSizePrice))) {
    displayPrice = Number(selectedSizePrice);
  } else if (selectedVariantPrice != null && Number.isFinite(Number(selectedVariantPrice))) {
    displayPrice = Number(selectedVariantPrice);
  }
  const cmp = product.compareAtPrice != null ? Number(product.compareAtPrice) : NaN;
  const compareAt =
    Number.isFinite(cmp) && cmp > displayPrice ? cmp : null;
  const showDiscount = compareAt != null && hasRetailDiscount(compareAt, displayPrice);
  return {
    displayPrice,
    compareAtPrice: compareAt,
    showDiscount,
    discountPercent: showDiscount && compareAt != null ? retailDiscountPercent(compareAt, displayPrice) : 0,
  };
}
