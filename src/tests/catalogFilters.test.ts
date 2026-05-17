import { describe, it, expect } from "vitest";
import {
  resolveCategoryFromPath,
  matchesStorefrontCategory,
  filterByCategoryPage,
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
});
