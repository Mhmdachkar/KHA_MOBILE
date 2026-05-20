import type { AdminListProduct } from "@/lib/adminProductListMerge";
import { inferProductBrand, resolveCategoryFromPath } from "@/lib/catalogFilters";
import type { StorefrontProduct } from "@/lib/catalogProduct";
import {
  CANONICAL_STOREFRONT_CATEGORIES,
  normalizeStorefrontCategory,
  type CanonicalStorefrontCategory,
} from "@/lib/storefrontCategories";

export interface AdminCategoryGroup {
  key: string;
  canonical: string;
  isCanonical: boolean;
  rawLabels: string[];
  total: number;
  active: number;
  inactive: number;
  bundled: number;
  database: number;
  databaseOnly: number;
}

export interface AdminBrandGroup {
  key: string;
  displayName: string;
  inferredOnly: boolean;
  total: number;
  active: number;
  inactive: number;
}

function brandLookupProduct(product: AdminListProduct): Pick<StorefrontProduct, "id" | "name" | "brand"> {
  return { id: product.id, name: product.name, brand: product.brand };
}

export function getAdminProductBrand(product: AdminListProduct): string {
  return inferProductBrand(brandLookupProduct(product) as StorefrontProduct) ?? "Unbranded";
}

/** True when the stored label exactly matches a canonical category name (not an alias). */
export function isCanonicalCategoryLabel(raw: string): boolean {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return false;
  const canonical = normalizeStorefrontCategory(trimmed);
  const listed = (CANONICAL_STOREFRONT_CATEGORIES as readonly string[]).includes(
    canonical as CanonicalStorefrontCategory
  );
  return listed && trimmed.toLowerCase() === canonical.toLowerCase();
}

export function matchesAdminProductSearch(product: AdminListProduct, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const brand = getAdminProductBrand(product);
  return (
    product.name.toLowerCase().includes(q) ||
    product.category.toLowerCase().includes(q) ||
    brand.toLowerCase().includes(q) ||
    (product.brand ?? "").toLowerCase().includes(q)
  );
}

export function filterAdminProductsByCategory(
  products: AdminListProduct[],
  canonicalCategory: string
): AdminListProduct[] {
  const target = normalizeStorefrontCategory(canonicalCategory);
  return products.filter((p) => normalizeStorefrontCategory(p.category) === target);
}

export function filterAdminProductsByBrand(
  products: AdminListProduct[],
  brandKey: string
): AdminListProduct[] {
  return products.filter((p) => getAdminProductBrand(p) === brandKey);
}

export type AdminSourceFilter = "all" | "storefront" | "bundled" | "database" | "database_only";

export function filterAdminProductsBySource(
  products: AdminListProduct[],
  source: AdminSourceFilter
): AdminListProduct[] {
  switch (source) {
    case "storefront":
      return products.filter((p) => p.onStorefront);
    case "bundled":
      return products.filter((p) => p.source === "bundled");
    case "database":
      return products.filter((p) => p.source === "database");
    case "database_only":
      return products.filter((p) => p.source === "database_only");
    default:
      return products;
  }
}

export function buildCategoryGroups(products: AdminListProduct[]): AdminCategoryGroup[] {
  const map = new Map<string, AdminCategoryGroup>();

  for (const p of products) {
    const canonical = normalizeStorefrontCategory(p.category);
    let group = map.get(canonical);
    if (!group) {
      group = {
        key: canonical,
        canonical,
        isCanonical: isCanonicalCategoryLabel(p.category),
        rawLabels: [],
        total: 0,
        active: 0,
        inactive: 0,
        bundled: 0,
        database: 0,
        databaseOnly: 0,
      };
      map.set(canonical, group);
    }
    if (!group.rawLabels.includes(p.category)) group.rawLabels.push(p.category);
    if (!isCanonicalCategoryLabel(p.category)) group.isCanonical = false;
    group.total += 1;
    if (p.isActive) group.active += 1;
    else group.inactive += 1;
    if (p.source === "bundled") group.bundled += 1;
    else if (p.source === "database") group.database += 1;
    else if (p.source === "database_only") group.databaseOnly += 1;
  }

  return Array.from(map.values()).sort((a, b) => {
    const aIdx = CANONICAL_STOREFRONT_CATEGORIES.indexOf(a.canonical as CanonicalStorefrontCategory);
    const bIdx = CANONICAL_STOREFRONT_CATEGORIES.indexOf(b.canonical as CanonicalStorefrontCategory);
    const ai = aIdx >= 0 ? aIdx : 999;
    const bi = bIdx >= 0 ? bIdx : 999;
    if (ai !== bi) return ai - bi;
    return a.canonical.localeCompare(b.canonical);
  });
}

export function buildBrandGroups(products: AdminListProduct[]): AdminBrandGroup[] {
  const map = new Map<string, AdminBrandGroup & { hasExplicit: boolean }>();

  for (const p of products) {
    const displayName = getAdminProductBrand(p);
    let group = map.get(displayName);
    if (!group) {
      group = {
        key: displayName,
        displayName,
        inferredOnly: true,
        total: 0,
        active: 0,
        inactive: 0,
        hasExplicit: false,
      };
      map.set(displayName, group);
    }
    if (p.brand?.trim()) {
      group.hasExplicit = true;
      group.inferredOnly = false;
    }
    group.total += 1;
    if (p.isActive) group.active += 1;
    else group.inactive += 1;
  }

  return Array.from(map.values())
    .map(({ hasExplicit: _, ...g }) => g)
    .sort((a, b) => {
      if (a.displayName === "Unbranded") return 1;
      if (b.displayName === "Unbranded") return -1;
      return a.displayName.localeCompare(b.displayName);
    });
}

export function searchCategoryGroups(groups: AdminCategoryGroup[], query: string): AdminCategoryGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return groups;
  return groups.filter(
    (g) =>
      g.canonical.toLowerCase().includes(q) ||
      g.rawLabels.some((r) => r.toLowerCase().includes(q))
  );
}

export function searchBrandGroups(groups: AdminBrandGroup[], query: string): AdminBrandGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return groups;
  return groups.filter((g) => g.displayName.toLowerCase().includes(q));
}

export function getDistinctBrands(products: AdminListProduct[]): string[] {
  const set = new Set<string>();
  for (const p of products) {
    const b = getAdminProductBrand(p);
    if (b !== "Unbranded") set.add(b);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/** Suggested storefront paths for homepage category links. */
export const SUGGESTED_CATEGORY_LINKS: { label: string; path: string }[] = [
  { label: "Smartphones", path: "/smartphones" },
  { label: "Tablets", path: "/tablets" },
  { label: "Audio", path: "/audio" },
  { label: "Computers", path: "/computers" },
  { label: "Wearables", path: "/wearables" },
  { label: "Gaming", path: "/gaming" },
  { label: "Accessories", path: "/accessories" },
  { label: "Electronics", path: "/electronics" },
  { label: "iPhone Cases", path: "/category/iphone-cases" },
  { label: "Charging", path: "/category/charging" },
  { label: "Products (all)", path: "/products" },
];

export function resolveHomepageCategoryLabel(name: string, linkTo: string): string {
  const trimmedLink = (linkTo ?? "").trim();
  if (trimmedLink) {
    const fromPath = resolveCategoryFromPath(trimmedLink);
    if (fromPath !== "Category") return fromPath;
  }
  return normalizeStorefrontCategory(name);
}

export function countProductsForHomepageCategory(
  products: AdminListProduct[],
  name: string,
  linkTo: string
): number {
  const canonical = resolveHomepageCategoryLabel(name, linkTo);
  return filterAdminProductsByCategory(products, canonical).length;
}

export function countProductsForBrandName(products: AdminListProduct[], brandName: string): number {
  const trimmed = brandName.trim();
  if (!trimmed) return 0;
  return filterAdminProductsByBrand(products, trimmed).length;
}

export { buildCategoryCountMap, buildBrandCountMap } from "@/lib/adminCatalogSummary";
