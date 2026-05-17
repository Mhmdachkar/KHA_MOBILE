import { describe, it, expect } from "vitest";
import {
  resolveCategoryFromPath,
  matchesStorefrontCategory,
  filterByCategoryPage,
  filterAccessoriesPageProducts,
  isExcludedFromAccessoriesPage,
  matchesAccessoriesSubTab,
} from "@/lib/catalogFilters";
import type { StorefrontProduct } from "@/lib/catalogProduct";

function row(partial: Partial<StorefrontProduct> & Pick<StorefrontProduct, "id" | "name" | "category">): StorefrontProduct {
  return {
    price: 10,
    displayPrice: 10,
    image: "/x.png",
    rating: 4.5,
    ...partial,
  };
}

describe("catalogFilters", () => {
  it("resolves direct and dynamic category paths", () => {
    expect(resolveCategoryFromPath("/audio")).toBe("Audio");
    expect(resolveCategoryFromPath("/category/gaming")).toBe("Gaming");
    expect(resolveCategoryFromPath("/category/iphone%20cases")).toBe("iPhone Cases");
  });

  it("filters by primary and secondary category", () => {
    const catalog: StorefrontProduct[] = [
      row({ id: 1, name: "Phone", category: "Smartphones" }),
      row({
        id: 5001,
        name: "Green Lion Speaker",
        category: "Accessories",
        secondaryCategories: ["Audio"],
      }),
    ];
    const audio = filterByCategoryPage(catalog, "Audio");
    expect(audio.map((p) => p.id)).toContain(5001);
    const phones = filterByCategoryPage(catalog, "Smartphones");
    expect(phones).toHaveLength(1);
  });

  it("matches Charging tab heuristics", () => {
    const charger = row({
      id: 2,
      name: "USB-C Cable",
      category: "Phone Accessories",
    });
    expect(matchesStorefrontCategory(charger, "Charging")).toBe(true);
  });

  it("filters accessories page excluding audio mis-tags", () => {
    const catalog: StorefrontProduct[] = [
      row({ id: 1, name: "Silicone Case", category: "Accessories" }),
      row({
        id: 5002,
        name: "Green Lion Earbuds Pro",
        category: "Accessories",
        secondaryCategories: ["Audio"],
      }),
    ];
    const accessories = filterAccessoriesPageProducts(catalog);
    expect(accessories.map((p) => p.id)).toEqual([1]);
    expect(isExcludedFromAccessoriesPage(catalog[1])).toBe(true);
  });

  it("matches accessories charging sub-tab", () => {
    const cable = row({
      id: 3,
      name: "USB-C Fast Cable",
      category: "Phone Accessories",
    });
    expect(matchesAccessoriesSubTab(cable, "charging")).toBe(true);
    expect(matchesAccessoriesSubTab(cable, "bags")).toBe(false);
  });
});
