/**
 * Unified rules for adding products to cart from any storefront surface.
 */

import { normalizeStorefrontVariants } from "@/lib/catalogProduct";

export type AddToCartSurface = "grid" | "carousel" | "featured" | "pdp";

export interface ColorOption {
  name: string;
  image?: string;
  stock?: string;
}

export interface VariantOption {
  key: string;
  label: string;
  price: number;
}

export interface SizeOption {
  name: string;
  price?: number | string | null;
}

export interface AddToCartProductShape {
  id: number;
  variants?: VariantOption[];
  sizes?: SizeOption[];
  colors?: ColorOption[];
  isPreorder?: boolean;
  showPreorderPrice?: boolean;
  stockQuantity?: number | null;
}

export type AddToCartAction =
  | { type: "add_direct" }
  | { type: "open_picker" }
  | { type: "redirect_pdp"; reason: string }
  | { type: "blocked"; reason: string };

export function isOutOfStock(stockQuantity: number | null | undefined): boolean {
  return stockQuantity != null && stockQuantity === 0;
}

export function hasMultipleColors(colors: ColorOption[] | undefined): boolean {
  return (colors?.length ?? 0) > 1;
}

export function getAddToCartAction(
  product: AddToCartProductShape,
  surface: AddToCartSurface
): AddToCartAction {
  if (isOutOfStock(product.stockQuantity)) {
    return { type: "blocked", reason: "This item is out of stock." };
  }

  if (product.isPreorder && product.showPreorderPrice === false) {
    if (surface !== "pdp") {
      return { type: "redirect_pdp", reason: "Configure pre-order on the product page." };
    }
  }

  const hasVariants = (normalizeStorefrontVariants(product.variants)?.length ?? 0) > 0;
  const hasSizes = (product.sizes?.length ?? 0) > 0;
  const multiColor = hasMultipleColors(product.colors);

  if (hasVariants || hasSizes || multiColor) {
    if (surface === "featured" || surface === "carousel") {
      return { type: "redirect_pdp", reason: "Choose options on the product page." };
    }
    return { type: "open_picker" };
  }

  return { type: "add_direct" };
}

export type PickerStep = "variant" | "size" | "color";

export function getPickerSteps(product: AddToCartProductShape): PickerStep[] {
  const steps: PickerStep[] = [];
  if ((normalizeStorefrontVariants(product.variants)?.length ?? 0) > 0) steps.push("variant");
  if ((product.sizes?.length ?? 0) > 0) steps.push("size");
  if (hasMultipleColors(product.colors)) steps.push("color");
  return steps;
}

/** Category grids show storage/color pickers on the card itself. */
export function showsInlineCardOptions(
  product: AddToCartProductShape,
  surface: AddToCartSurface
): boolean {
  return surface === "grid" && getPickerSteps(product).length > 0;
}

export function isCardSelectionComplete(
  product: AddToCartProductShape,
  picked: {
    variant: VariantOption | null;
    size: SizeOption | null;
    color: ColorOption | null;
  }
): boolean {
  for (const step of getPickerSteps(product)) {
    if (step === "variant" && !picked.variant) return false;
    if (step === "size" && !picked.size) return false;
    if (step === "color" && !picked.color) return false;
  }
  return true;
}

export function shortStorageLabel(variant: { label: string; storage?: string }): string {
  if (variant.storage?.trim()) return variant.storage.trim();
  const match = variant.label.match(/\d+\s*GB/i);
  if (match) return match[0].replace(/\s+/g, "").toUpperCase();
  return variant.label.length > 14 ? `${variant.label.slice(0, 12)}…` : variant.label;
}
