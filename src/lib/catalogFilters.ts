/**
 * Category routing and filtering for storefront catalog rows.
 * Pure functions — no React dependencies.
 */

import type { StorefrontProduct } from "@/lib/catalogProduct";
import { isGreenLionProduct } from "@/lib/catalogProduct";

const CATEGORY_PATH_MAP: Record<string, string> = {
  "/smartphones": "Smartphones",
  "/audio": "Audio",
  "/computers": "Computers",
  "/wearables": "Wearables",
  "/gaming": "Gaming",
  "/tablets": "Tablets",
  "/iphone cases": "iPhone Cases",
  "/iphone%20cases": "iPhone Cases",
  "/iphonecases": "iPhone Cases",
  "/electronics": "Electronics",
};

export function resolveCategoryFromPath(pathname: string): string {
  const normalizedPath = decodeURIComponent(pathname).toLowerCase();

  if (CATEGORY_PATH_MAP[normalizedPath]) {
    return CATEGORY_PATH_MAP[normalizedPath];
  }

  const categoryMatch = normalizedPath.match(/^\/category\/(.+)$/);
  if (categoryMatch) {
    const categoryParam = decodeURIComponent(categoryMatch[1]).toLowerCase();
    if (
      categoryParam === "iphone cases" ||
      categoryParam === "iphone%20cases" ||
      categoryParam === "iphonecases"
    ) {
      return "iPhone Cases";
    }
    return categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1);
  }

  return "Category";
}

export function isAppleProduct(product: StorefrontProduct): boolean {
  if (product.brand === "Apple") return true;
  const name = product.name?.toLowerCase() ?? "";
  return (
    name.includes("apple") ||
    name.startsWith("iphone") ||
    name.startsWith("ipad") ||
    name.startsWith("airpods") ||
    name.includes("apple watch")
  );
}

export function inferProductBrand(product: StorefrontProduct): string | undefined {
  if (product.brand) return product.brand;
  const name = product.name?.toLowerCase() ?? "";
  if (name.startsWith("smart")) return "Smart";
  if (name.includes("samsung")) return "Samsung";
  if (name.includes("apple")) return "Apple";
  if (name.includes("green lion")) return "Green Lion";
  if (name.includes("xiaomi") || name.includes("redmi") || name.includes("poco")) return "Xiaomi";
  if (name.includes("sony") || name.includes("playstation") || name.includes("ps5") || name.includes("ps4"))
    return "Sony";
  if (name.includes("ea sports") || name.includes("fifa") || name.includes("fc ")) return "EA SPORTS";
  return undefined;
}

function isSonyProduct(product: StorefrontProduct): boolean {
  if (product.brand === "Sony") return true;
  const name = product.name?.toLowerCase() ?? "";
  return name.includes("playstation") || name.includes("sony");
}

function eqCategory(a: string | undefined, b: string): boolean {
  return (a ?? "").toLowerCase() === b.toLowerCase();
}

function hasSecondary(product: StorefrontProduct, category: string): boolean {
  return (product.secondaryCategories ?? []).some((s) => eqCategory(s, category));
}

/** Match product to a category label (category pages + home recommendation tabs). */
export function matchesStorefrontCategory(product: StorefrontProduct, category: string): boolean {
  const nameLower = product.name?.toLowerCase() ?? "";
  const productCategory = product.category?.toLowerCase() ?? "";

  if (category === "Charging") {
    return (
      eqCategory(product.category, "Charging") ||
      (productCategory === "phone accessories" &&
        (nameLower.includes("charg") ||
          nameLower.includes("power bank") ||
          nameLower.includes("adapter") ||
          nameLower.includes("ups") ||
          nameLower.includes("battery") ||
          nameLower.includes("charger") ||
          nameLower.includes("cable") ||
          nameLower.includes("dock") ||
          nameLower.includes("magsafe")))
    );
  }

  if (category === "Audio") {
    return (
      eqCategory(product.category, "Audio") ||
      hasSecondary(product, "Audio") ||
      hasSecondary(product, "Headphones") ||
      hasSecondary(product, "Earbuds") ||
      nameLower.includes("headphone") ||
      nameLower.includes("earbud") ||
      nameLower.includes("speaker") ||
      nameLower.includes("airpod") ||
      nameLower.includes("buds") ||
      nameLower.includes("neckband") ||
      nameLower.includes("audio")
    );
  }

  if (category === "Gaming") {
    return (
      eqCategory(product.category, "Gaming") ||
      productCategory === "gaming consoles" ||
      hasSecondary(product, "Gaming") ||
      nameLower.includes("gaming") ||
      nameLower.includes("ps4") ||
      nameLower.includes("ps5") ||
      nameLower.includes("controller") ||
      nameLower.includes("console")
    );
  }

  if (category === "Accessories") {
    if (matchesStorefrontCategory(product, "Charging")) return false;
    if (matchesStorefrontCategory(product, "Audio")) return false;
    if (matchesStorefrontCategory(product, "Gaming")) return false;
    return (
      productCategory === "accessories" ||
      productCategory === "phone accessories" ||
      productCategory === "iphone cases" ||
      nameLower.includes("case") ||
      nameLower.includes("cover") ||
      nameLower.includes("stand") ||
      nameLower.includes("holder") ||
      nameLower.includes("protector") ||
      nameLower.includes("dopp") ||
      nameLower.includes("led") ||
      nameLower.includes("usb") ||
      nameLower.includes("flash")
    );
  }

  if (eqCategory(product.category, category) || hasSecondary(product, category)) {
    return true;
  }

  if (category === "iPhone Cases") {
    return eqCategory(product.category, "iPhone Cases") || productCategory === "iphone cases";
  }

  return false;
}

export function filterByCategoryPage(
  products: StorefrontProduct[],
  categoryDisplayName: string
): StorefrontProduct[] {
  if (categoryDisplayName === "Category") return [];
  return products.filter((p) => matchesStorefrontCategory(p, categoryDisplayName));
}

export type CategorySortMode = "default" | "price-low" | "price-high" | "rating" | "name";

const AIRPODS_PRIORITY: Record<number, number> = {
  127: 1,
  129: 2,
  128: 3,
};

const APPLE_WATCH_PRIORITY: Record<number, number> = {
  208: 1,
  207: 2,
  205: 3,
  206: 4,
};

function compareApplePriority(a: StorefrontProduct, b: StorefrontProduct, priority: Record<number, number>): number {
  const aPriority = priority[a.id] ?? 999;
  const bPriority = priority[b.id] ?? 999;
  if (aPriority !== 999 && bPriority !== 999) return aPriority - bPriority;
  if (aPriority !== 999 && bPriority === 999) return -1;
  if (aPriority === 999 && bPriority !== 999) return 1;
  return b.displayPrice - a.displayPrice;
}

function compareDefaultCategorySort(
  a: StorefrontProduct,
  b: StorefrontProduct,
  categoryDisplayName: string
): number {
  const aGL = isGreenLionProduct(a);
  const bGL = isGreenLionProduct(b);
  const aApple = isAppleProduct(a);
  const bApple = isAppleProduct(b);

  if (categoryDisplayName === "Gaming") {
    const aSony = isSonyProduct(a);
    const bSony = isSonyProduct(b);
    if (aSony && !bSony) return -1;
    if (!aSony && bSony) return 1;
    return b.displayPrice - a.displayPrice;
  }

  if (aApple && !bApple) return -1;
  if (!aApple && bApple) return 1;

  if (aApple && bApple) {
    if (categoryDisplayName === "Wearables") {
      return compareApplePriority(a, b, APPLE_WATCH_PRIORITY);
    }
    if (categoryDisplayName === "Audio") {
      return compareApplePriority(a, b, AIRPODS_PRIORITY);
    }
    return b.displayPrice - a.displayPrice;
  }

  if (aGL && !bGL) return -1;
  if (!aGL && bGL) return 1;
  if (aGL && bGL) return b.displayPrice - a.displayPrice;

  return b.displayPrice - a.displayPrice;
}

function withGreenLionFirst(
  a: StorefrontProduct,
  b: StorefrontProduct,
  inner: (x: StorefrontProduct, y: StorefrontProduct) => number
): number {
  const aGL = isGreenLionProduct(a);
  const bGL = isGreenLionProduct(b);
  if (aGL && !bGL) return -1;
  if (!aGL && bGL) return 1;
  return inner(a, b);
}

export function sortCategoryProducts(
  products: StorefrontProduct[],
  sortBy: CategorySortMode,
  categoryDisplayName: string
): StorefrontProduct[] {
  const sorted = [...products];

  if (sortBy === "default") {
    sorted.sort((a, b) => compareDefaultCategorySort(a, b, categoryDisplayName));
    return sorted;
  }

  switch (sortBy) {
    case "price-low":
      sorted.sort((a, b) =>
        withGreenLionFirst(a, b, (x, y) => x.displayPrice - y.displayPrice)
      );
      break;
    case "price-high":
      sorted.sort((a, b) =>
        withGreenLionFirst(a, b, (x, y) => y.displayPrice - x.displayPrice)
      );
      break;
    case "rating":
      sorted.sort((a, b) =>
        withGreenLionFirst(a, b, (x, y) => (y.rating || 0) - (x.rating || 0))
      );
      break;
    case "name":
      sorted.sort((a, b) =>
        withGreenLionFirst(a, b, (x, y) => x.name.localeCompare(y.name))
      );
      break;
  }

  return sorted;
}

/** Home recommendation tabs: Green Lion first, then rating. */
export function sortRecommendationProducts(products: StorefrontProduct[]): StorefrontProduct[] {
  return sortCategoryProducts(products, "rating", "");
}

export { CATEGORY_PATH_MAP };
