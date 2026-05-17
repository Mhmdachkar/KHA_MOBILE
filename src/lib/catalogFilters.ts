/**
 * Category routing and filtering for storefront catalog rows.
 * Pure functions — no React dependencies.
 */

import type { StorefrontProduct } from "@/lib/catalogProduct";
import { isGreenLionProduct } from "@/lib/catalogProduct";
import {
  canonicalCategoryFromPathSegment,
  normalizeStorefrontCategory,
} from "@/lib/storefrontCategories";

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
  "/accessories": "Accessories",
  "/iphone cases": "iPhone Cases",
  "/iphone%20cases": "iPhone Cases",
  "/iphonecases": "iPhone Cases",
};

export function resolveCategoryFromPath(pathname: string): string {
  const normalizedPath = decodeURIComponent(pathname).toLowerCase();

  if (CATEGORY_PATH_MAP[normalizedPath]) {
    return CATEGORY_PATH_MAP[normalizedPath];
  }

  const categoryMatch = normalizedPath.match(/^\/category\/(.+)$/);
  if (categoryMatch) {
    return canonicalCategoryFromPathSegment(categoryMatch[1]);
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
  return normalizeStorefrontCategory(a).toLowerCase() === normalizeStorefrontCategory(b).toLowerCase();
}

function hasSecondary(product: StorefrontProduct, category: string): boolean {
  const target = normalizeStorefrontCategory(category);
  return (product.secondaryCategories ?? []).some((s) => eqCategory(s, target));
}

/** Match product to a category label (category pages + home recommendation tabs). */
export function matchesStorefrontCategory(product: StorefrontProduct, category: string): boolean {
  const nameLower = product.name?.toLowerCase() ?? "";
  const rawCategoryLower = (product.category ?? "").toLowerCase();
  const productCategory = normalizeStorefrontCategory(product.category).toLowerCase();
  const pageCategory = normalizeStorefrontCategory(category);

  if (pageCategory === "Charging") {
    const chargingNameMatch =
      nameLower.includes("charg") ||
      nameLower.includes("power bank") ||
      nameLower.includes("adapter") ||
      nameLower.includes("ups") ||
      nameLower.includes("battery") ||
      nameLower.includes("charger") ||
      nameLower.includes("cable") ||
      nameLower.includes("dock") ||
      nameLower.includes("magsafe");
    return (
      eqCategory(product.category, "Charging") ||
      ((rawCategoryLower === "phone accessories" || productCategory === "accessories") &&
        chargingNameMatch)
    );
  }

  if (pageCategory === "Audio") {
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

  if (pageCategory === "Gaming") {
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

  if (pageCategory === "Accessories") {
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

  if (eqCategory(product.category, pageCategory) || hasSecondary(product, pageCategory)) {
    return true;
  }

  if (pageCategory === "iPhone Cases") {
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

/** Exclude audio/gaming/wearable items mis-tagged as accessories (legacy Green Lion rows). */
export function isExcludedFromAccessoriesPage(product: StorefrontProduct): boolean {
  if (matchesStorefrontCategory(product, "Audio")) return true;
  if (matchesStorefrontCategory(product, "Gaming")) return true;
  if (matchesStorefrontCategory(product, "Wearables")) return true;

  const nameLower = product.name?.toLowerCase() ?? "";
  const isAudioByName =
    nameLower.includes("earbud") ||
    nameLower.includes("headphone") ||
    nameLower.includes("speaker") ||
    nameLower.includes("neckband") ||
    nameLower.includes("river") ||
    nameLower.includes("manchester") ||
    nameLower.includes("porto") ||
    nameLower.includes("jupiter") ||
    nameLower.includes("rhythm") ||
    nameLower.includes("echo") ||
    nameLower.includes("sevilla");
  const isGamingByName = nameLower.includes("gaming");
  const isWearableByName =
    nameLower.includes("watch") ||
    nameLower.includes("smartwatch") ||
    nameLower.includes("track fit") ||
    (nameLower.includes("ultimate") &&
      (nameLower.includes("46mm") || nameLower.includes("41"))) ||
    nameLower.includes("active 49");

  return isAudioByName || isGamingByName || isWearableByName;
}

/** Base pool for `/accessories` — unified catalog, no page-local merges. */
export function filterAccessoriesPageProducts(products: StorefrontProduct[]): StorefrontProduct[] {
  return products.filter((p) => {
    if (isExcludedFromAccessoriesPage(p)) return false;
    return (
      matchesStorefrontCategory(p, "Accessories") ||
      matchesStorefrontCategory(p, "Charging") ||
      matchesStorefrontCategory(p, "iPhone Cases")
    );
  });
}

function matchesLaptopAccessories(nameLower: string): boolean {
  return (
    nameLower.includes("laptop sleeve") ||
    nameLower.includes("laptop bag") ||
    nameLower.includes("orbit sleeve") ||
    nameLower.includes("sigma laptop") ||
    nameLower.includes("sandisk cruzer blade") ||
    nameLower.includes("cruzer blade") ||
    nameLower.includes("mini metal usb") ||
    nameLower.includes("philips usb 3.2") ||
    nameLower.includes("usb flash drive") ||
    nameLower.includes("flash drive")
  );
}

function matchesBags(nameLower: string): boolean {
  const laptop = matchesLaptopAccessories(nameLower);
  return (
    !laptop &&
    (nameLower.includes("dopp") ||
      nameLower.includes("toiletry") ||
      nameLower.includes("wash bag") ||
      nameLower.includes("travel bag") ||
      nameLower.includes("gym bag") ||
      (nameLower.includes("pouch") && !nameLower.includes("laptop")) ||
      (nameLower.includes("kit") && !nameLower.includes("kitchen")) ||
      nameLower.includes("organizer") ||
      nameLower.includes("elegant pouch"))
  );
}

function matchesHairGrooming(nameLower: string): boolean {
  return (
    nameLower.includes("hair dryer") ||
    nameLower.includes("blow wave") ||
    nameLower.includes("silkwave") ||
    nameLower.includes("straightener") ||
    nameLower.includes("beard trimmer") ||
    nameLower.includes("one blade") ||
    nameLower.includes("hair clipper") ||
    nameLower.includes("clip pro") ||
    nameLower.includes("pro trim duo") ||
    nameLower.includes("trim duo") ||
    nameLower.includes("pirates hair trimmer") ||
    nameLower.includes("pirates trimmer")
  );
}

function matchesLedLights(nameLower: string): boolean {
  return (
    nameLower.includes("glam shine makeup mirror") ||
    nameLower.includes("makeup mirror") ||
    (nameLower.includes("rgb") && nameLower.includes("mj33")) ||
    nameLower.includes("mj33 ring") ||
    nameLower.includes("ring led light") ||
    nameLower.includes("rl-19 led soft") ||
    nameLower.includes("rl19 led soft") ||
    nameLower.includes("rl-19 led soft light strip")
  );
}

function matchesStands(nameLower: string): boolean {
  return (
    (nameLower.includes("magselfie") ||
      nameLower.includes("selfie stick") ||
      nameLower.includes("tripod") ||
      (nameLower.includes("m5") &&
        (nameLower.includes("foldable") || nameLower.includes("holder"))) ||
      nameLower.includes("kakusiga folding") ||
      nameLower.includes("foneng foldable desktop") ||
      nameLower.includes("m6-rotating") ||
      nameLower.includes("rotating stand")) &&
    !nameLower.includes("makeup mirror") &&
    !nameLower.includes("ring led") &&
    !nameLower.includes("mj33") &&
    !nameLower.includes("rl-19 led soft") &&
    !nameLower.includes("rl19 led soft") &&
    !nameLower.includes("led table lamp")
  );
}

function matchesAdvancedAccessories(nameLower: string): boolean {
  return (
    nameLower.includes("new york gimbal") ||
    nameLower.includes("gimbal smart face") ||
    nameLower.includes("bedside clock") ||
    nameLower.includes("mini massage gun")
  );
}

/** Accessories page sub-tabs (charging, stands, bags, …). Pass `"all"` to match everything. */
export function matchesAccessoriesSubTab(product: StorefrontProduct, subTab: string): boolean {
  if (subTab === "all") return true;

  const category = product.category?.toLowerCase() ?? "";
  const selectedCat = subTab.toLowerCase();
  const nameLower = product.name?.toLowerCase() ?? "";

  if (selectedCat === "laptop accessories") {
    return matchesLaptopAccessories(nameLower);
  }
  if (selectedCat === "bags") {
    if (nameLower.includes("kitchen")) return false;
    return matchesBags(nameLower);
  }
  if (selectedCat === "hair & grooming" || selectedCat === "grooming") {
    return matchesHairGrooming(nameLower);
  }
  if (selectedCat === "led lights") {
    return matchesLedLights(nameLower) && !nameLower.includes("led table lamp");
  }
  if (selectedCat === "stands") {
    return matchesStands(nameLower) || nameLower.includes("led table lamp");
  }
  if (selectedCat === "advanced accessories") {
    return matchesAdvancedAccessories(nameLower);
  }
  if (selectedCat === "charging") {
    const hasChargingSecondary = (product.secondaryCategories ?? []).some((cat) =>
      eqCategory(cat, "Charging")
    );
    return (
      category === "charging" ||
      hasChargingSecondary ||
      matchesStorefrontCategory(product, "Charging") ||
      nameLower.includes("charger") ||
      nameLower.includes("charging") ||
      nameLower.includes("power bank") ||
      nameLower.includes("adapter") ||
      nameLower.includes("cable") ||
      nameLower.includes("usb") ||
      nameLower.includes("type-c") ||
      nameLower.includes("lightning") ||
      nameLower.includes("dock") ||
      nameLower.includes("magsafe")
    );
  }

  return category === selectedCat;
}

export function sortAccessoriesPageProducts(products: StorefrontProduct[]): StorefrontProduct[] {
  return sortRecommendationProducts(products);
}

export { CATEGORY_PATH_MAP };
