/**
 * Unified rules for adding products to cart from any storefront surface.
 */

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

  const hasVariants = (product.variants?.length ?? 0) > 0;
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
  if ((product.variants?.length ?? 0) > 0) steps.push("variant");
  if ((product.sizes?.length ?? 0) > 0) steps.push("size");
  if (hasMultipleColors(product.colors)) steps.push("color");
  return steps;
}
