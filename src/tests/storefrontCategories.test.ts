import { describe, it, expect } from "vitest";
import {
  normalizeStorefrontCategory,
  canonicalCategoryFromPathSegment,
} from "@/lib/storefrontCategories";
import { filterByCategoryPage } from "@/lib/catalogFilters";
import type { StorefrontProduct } from "@/lib/catalogProduct";

describe("storefrontCategories", () => {
  it("normalizes common admin typos and aliases", () => {
    expect(normalizeStorefrontCategory("smartphones")).toBe("Smartphones");
    expect(normalizeStorefrontCategory("PHONE ACCESSORIES")).toBe("Accessories");
    expect(normalizeStorefrontCategory("gaming consoles")).toBe("Gaming");
    expect(normalizeStorefrontCategory("iphone cases")).toBe("iPhone Cases");
  });

  it("resolves dynamic category paths", () => {
    expect(canonicalCategoryFromPathSegment("smartphones")).toBe("Smartphones");
    expect(canonicalCategoryFromPathSegment("iphone%20cases")).toBe("iPhone Cases");
  });

  it("places API products with alias categories on the correct page", () => {
    const catalog: StorefrontProduct[] = [
      {
        id: 9001,
        name: "New Phone",
        category: "smartphones",
        price: 100,
        displayPrice: 100,
        image: "/x.png",
        rating: 4.5,
      },
    ];
    const phones = filterByCategoryPage(catalog, "Smartphones");
    expect(phones.map((p) => p.id)).toEqual([9001]);
  });
});
