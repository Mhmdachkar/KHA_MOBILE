import type { AdminListProduct } from "@/lib/adminProductListMerge";
import {
  buildBrandGroups,
  buildCategoryGroups,
  getAdminProductBrand,
  resolveHomepageCategoryLabel,
} from "@/lib/adminCatalogTaxonomy";
import { normalizeStorefrontCategory } from "@/lib/storefrontCategories";
import type { StorefrontProduct } from "@/lib/catalogProduct";

export interface CatalogHealthSummary {
  storefrontCount: number;
  nonCanonicalCategoryCount: number;
  inactiveOnStorefront: number;
  dbOnly: number;
  bundledOnly: number;
  categoryCountByCanonical: Map<string, number>;
  brandCountByDisplayName: Map<string, number>;
}

/** Single O(n) pass for dashboard alerts and CMS count maps. */
export function buildCatalogHealthSummary(
  products: AdminListProduct[] | StorefrontProduct[]
): CatalogHealthSummary {
  const categoryCountByCanonical = new Map<string, number>();
  const brandCountByDisplayName = new Map<string, number>();

  for (const p of products) {
    const canonical = normalizeStorefrontCategory(p.category);
    categoryCountByCanonical.set(canonical, (categoryCountByCanonical.get(canonical) ?? 0) + 1);
    const brand = getAdminProductBrand(p as AdminListProduct);
    brandCountByDisplayName.set(brand, (brandCountByDisplayName.get(brand) ?? 0) + 1);
  }

  const categoryGroups = buildCategoryGroups(products as AdminListProduct[]);
  const nonCanonicalCategoryCount = categoryGroups.filter((g) => !g.isCanonical).length;

  let inactiveOnStorefront = 0;
  let dbOnly = 0;
  let bundledOnly = 0;
  for (const p of products) {
    const row = p as AdminListProduct & { isActive?: boolean };
    if ("onStorefront" in row && row.onStorefront && row.isActive === false) inactiveOnStorefront += 1;
    if ("source" in row && row.source === "database_only") dbOnly += 1;
    if ("source" in row && row.source === "bundled") bundledOnly += 1;
  }

  return {
    storefrontCount: products.length,
    nonCanonicalCategoryCount,
    inactiveOnStorefront,
    dbOnly,
    bundledOnly,
    categoryCountByCanonical,
    brandCountByDisplayName,
  };
}

export function getCategoryProductCount(
  summary: CatalogHealthSummary,
  name: string,
  linkTo: string
): number {
  const canonical = resolveHomepageCategoryLabel(name, linkTo);
  return summary.categoryCountByCanonical.get(canonical) ?? 0;
}

export function getBrandProductCount(summary: CatalogHealthSummary, brandName: string): number {
  const trimmed = brandName.trim();
  if (!trimmed) return 0;
  return summary.brandCountByDisplayName.get(trimmed) ?? 0;
}

export function buildCategoryCountMap(products: AdminListProduct[]): Map<string, number> {
  return buildCatalogHealthSummary(products).categoryCountByCanonical;
}

export function buildBrandCountMap(products: AdminListProduct[]): Map<string, number> {
  return buildCatalogHealthSummary(products).brandCountByDisplayName;
}
