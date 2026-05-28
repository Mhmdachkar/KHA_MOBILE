import { describe, expect, it } from "vitest";
import {
  buildProductsSearchParams,
  parseProductsFiltersFromSearchParams,
} from "@/lib/productsPageUrl";

describe("productsPageUrl", () => {
  it("round-trips category and brand filters", () => {
    const params = buildProductsSearchParams({
      searchQuery: "",
      selectedCategories: ["Smartphones"],
      selectedBrands: ["Samsung"],
      sortBy: "price-low",
      availability: "in",
      minRating: null,
    });
    const parsed = parseProductsFiltersFromSearchParams(params);
    expect(parsed.selectedCategories).toEqual(["Smartphones"]);
    expect(parsed.selectedBrands).toEqual(["Samsung"]);
    expect(parsed.sortBy).toBe("price-low");
  });

  it("parses availability out of stock", () => {
    const parsed = parseProductsFiltersFromSearchParams(
      new URLSearchParams("availability=out")
    );
    expect(parsed.availability).toBe("out");
  });
});
