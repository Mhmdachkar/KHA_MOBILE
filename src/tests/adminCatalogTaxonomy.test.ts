import { describe, it, expect } from "vitest";
import {
  buildBrandGroups,
  buildCategoryGroups,
  filterAdminProductsByBrand,
  filterAdminProductsByCategory,
  filterAdminProductsBySource,
  getAdminProductBrand,
  isCanonicalCategoryLabel,
  matchesAdminProductSearch,
  searchBrandGroups,
  searchCategoryGroups,
} from "@/lib/adminCatalogTaxonomy";
import type { AdminListProduct } from "@/lib/adminProductListMerge";

const sample: AdminListProduct[] = [
  {
    id: 1,
    dbId: null,
    name: "Samsung Galaxy A15",
    price: 199,
    image: "/a.jpg",
    category: "Smartphones",
    brand: "Samsung",
    rating: 4.5,
    isActive: true,
    onStorefront: true,
    source: "bundled",
  },
  {
    id: 2,
    dbId: 10,
    name: "Smart Watch Pro",
    price: 49,
    image: "/b.jpg",
    category: "phone accessories",
    rating: 4,
    isActive: false,
    onStorefront: true,
    source: "database",
  },
  {
    id: 5001,
    dbId: null,
    name: "Green Lion Cable",
    price: 15,
    image: "/c.jpg",
    category: "Charging",
    rating: 4.2,
    isActive: true,
    onStorefront: true,
    source: "bundled",
  },
];

describe("adminCatalogTaxonomy", () => {
  it("normalizes categories into groups with raw label tracking", () => {
    const groups = buildCategoryGroups(sample);
    const phones = groups.find((g) => g.canonical === "Smartphones");
    const accessories = groups.find((g) => g.canonical === "Accessories");
    expect(phones?.total).toBe(1);
    expect(accessories?.total).toBe(1);
    expect(accessories?.rawLabels).toContain("phone accessories");
    expect(accessories?.isCanonical).toBe(false);
  });

  it("infers brand when missing and groups by display name", () => {
    expect(getAdminProductBrand(sample[1])).toBe("Smart");
    const brands = buildBrandGroups(sample);
    expect(brands.find((b) => b.displayName === "Samsung")?.total).toBe(1);
    expect(brands.find((b) => b.displayName === "Green Lion")?.inferredOnly).toBe(true);
  });

  it("filters products by canonical category and brand", () => {
    expect(filterAdminProductsByCategory(sample, "Accessories")).toHaveLength(1);
    expect(filterAdminProductsByBrand(sample, "Samsung")).toHaveLength(1);
  });

  it("matches search across name, category, and brand", () => {
    expect(matchesAdminProductSearch(sample[0], "galaxy")).toBe(true);
    expect(matchesAdminProductSearch(sample[2], "green")).toBe(true);
    expect(matchesAdminProductSearch(sample[0], "charging")).toBe(false);
  });

  it("searches category and brand group lists", () => {
    const cats = buildCategoryGroups(sample);
    expect(searchCategoryGroups(cats, "charg")).toHaveLength(1);
    const brands = buildBrandGroups(sample);
    expect(searchBrandGroups(brands, "sam")).toHaveLength(1);
  });

  it("detects canonical category labels", () => {
    expect(isCanonicalCategoryLabel("Smartphones")).toBe(true);
    expect(isCanonicalCategoryLabel("phone accessories")).toBe(false);
  });

  it("filters products by source", () => {
    expect(filterAdminProductsBySource(sample, "bundled")).toHaveLength(2);
    expect(filterAdminProductsBySource(sample, "database")).toHaveLength(1);
    expect(filterAdminProductsBySource(sample, "storefront")).toHaveLength(3);
  });
});
