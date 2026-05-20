import { describe, it, expect } from "vitest";
import {
  buildCatalogHealthSummary,
  getBrandProductCount,
  getCategoryProductCount,
  buildCategoryCountMap,
  buildBrandCountMap,
} from "@/lib/adminCatalogSummary";
import type { AdminListProduct } from "@/lib/adminProductListMerge";

function mockProduct(overrides: Partial<AdminListProduct> & { id: number; name: string; category: string }): AdminListProduct {
  return {
    id: overrides.id,
    name: overrides.name,
    category: overrides.category,
    brand: overrides.brand ?? "Apple",
    price: overrides.price ?? 100,
    onStorefront: overrides.onStorefront ?? true,
    source: overrides.source ?? "bundled",
    isActive: overrides.isActive ?? true,
    primaryImageUrl: overrides.primaryImageUrl,
    ...overrides,
  } as AdminListProduct;
}

describe("adminCatalogSummary", () => {
  const products = [
    mockProduct({ id: 1, name: "iPhone", category: "Smartphones", brand: "Apple" }),
    mockProduct({ id: 2, name: "iPad", category: "Tablets", brand: "Apple" }),
    mockProduct({ id: 3, name: "Galaxy", category: "Smartphones", brand: "Samsung" }),
    mockProduct({
      id: 4,
      name: "Hidden",
      category: "Smartphones",
      brand: "Samsung",
      onStorefront: true,
      isActive: false,
    }),
    mockProduct({
      id: 5,
      name: "DB only",
      category: "Accessories",
      brand: "Generic",
      source: "database_only",
    }),
  ];

  it("buildCatalogHealthSummary counts storefront and sources", () => {
    const summary = buildCatalogHealthSummary(products);
    expect(summary.storefrontCount).toBe(5);
    expect(summary.inactiveOnStorefront).toBe(1);
    expect(summary.dbOnly).toBe(1);
    expect(summary.categoryCountByCanonical.get("Smartphones")).toBe(3);
    expect(summary.brandCountByDisplayName.get("Apple")).toBe(2);
    expect(summary.brandCountByDisplayName.get("Samsung")).toBe(2);
  });

  it("getCategoryProductCount resolves homepage category labels", () => {
    const summary = buildCatalogHealthSummary(products);
    expect(getCategoryProductCount(summary, "Phones", "/smartphones")).toBe(3);
  });

  it("getBrandProductCount is O(1) lookup", () => {
    const summary = buildCatalogHealthSummary(products);
    expect(getBrandProductCount(summary, "Apple")).toBe(2);
    expect(getBrandProductCount(summary, "")).toBe(0);
    expect(getBrandProductCount(summary, "Unknown")).toBe(0);
  });

  it("buildCategoryCountMap and buildBrandCountMap match summary maps", () => {
    const summary = buildCatalogHealthSummary(products);
    expect(buildCategoryCountMap(products)).toEqual(summary.categoryCountByCanonical);
    expect(buildBrandCountMap(products)).toEqual(summary.brandCountByDisplayName);
  });
});
