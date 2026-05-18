/**
 * Canonical storefront category labels used by category routes and filters.
 * Admin saves should normalize to these so new products appear on the right page.
 */

export const CANONICAL_STOREFRONT_CATEGORIES = [
  "Smartphones",
  "Tablets",
  "Audio",
  "Computers",
  "Wearables",
  "Gaming",
  "Accessories",
  "Charging",
  "Electronics",
  "iPhone Cases",
  "Other",
] as const;

export type CanonicalStorefrontCategory = (typeof CANONICAL_STOREFRONT_CATEGORIES)[number];

const ALIAS_TO_CANONICAL: Record<string, CanonicalStorefrontCategory> = {
  smartphone: "Smartphones",
  smartphones: "Smartphones",
  phone: "Smartphones",
  phones: "Smartphones",
  mobile: "Smartphones",
  mobiles: "Smartphones",

  tablet: "Tablets",
  tablets: "Tablets",
  ipad: "Tablets",

  audio: "Audio",
  headphones: "Audio",
  headphone: "Audio",
  earbuds: "Audio",
  earbud: "Audio",
  speakers: "Audio",
  speaker: "Audio",

  computer: "Computers",
  computers: "Computers",
  laptop: "Computers",
  laptops: "Computers",
  pc: "Computers",

  wearable: "Wearables",
  wearables: "Wearables",
  watch: "Wearables",
  watches: "Wearables",
  smartwatch: "Wearables",
  smartwatches: "Wearables",

  gaming: "Gaming",
  game: "Gaming",
  games: "Gaming",
  "gaming consoles": "Gaming",
  "gaming console": "Gaming",
  console: "Gaming",
  consoles: "Gaming",
  playstation: "Gaming",

  accessory: "Accessories",
  accessories: "Accessories",
  "phone accessories": "Accessories",
  "phone accessory": "Accessories",

  charging: "Charging",
  charger: "Charging",
  chargers: "Charging",
  "power bank": "Charging",
  "power banks": "Charging",

  electronic: "Electronics",
  electronics: "Electronics",

  "iphone case": "iPhone Cases",
  "iphone cases": "iPhone Cases",
  iphonecases: "iPhone Cases",

  other: "Other",
  misc: "Other",
  miscellaneous: "Other",
};

/** Map path slug or display name to canonical category for filtering. */
export function canonicalCategoryFromPathSegment(segment: string): string {
  const decoded = decodeURIComponent(segment).trim();
  const key = decoded.toLowerCase();
  if (ALIAS_TO_CANONICAL[key]) return ALIAS_TO_CANONICAL[key];
  if (key === "iphone cases" || key === "iphone%20cases" || key === "iphonecases") {
    return "iPhone Cases";
  }
  if (!decoded) return "Category";
  return decoded.charAt(0).toUpperCase() + decoded.slice(1).toLowerCase();
}

/**
 * Normalize a category string from admin/API to a canonical label.
 * Returns trimmed original (title-cased) if no alias matches.
 */
export function normalizeStorefrontCategory(raw: string | null | undefined): string {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return "Other";

  const key = trimmed.toLowerCase();
  if (ALIAS_TO_CANONICAL[key]) return ALIAS_TO_CANONICAL[key];

  const canonical = CANONICAL_STOREFRONT_CATEGORIES.find(
    (c) => c.toLowerCase() === key
  );
  if (canonical) return canonical;

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function normalizeSecondaryCategories(
  raw: string[] | null | undefined
): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    const n = normalizeStorefrontCategory(item);
    const k = n.toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      out.push(n);
    }
  }
  return out;
}
