import { describe, expect, it } from "vitest";
import { getProductFilterBrand } from "@/lib/catalogFilters";
import type { StorefrontProduct } from "@/lib/catalogProduct";

const base = (overrides: Partial<StorefrontProduct>): StorefrontProduct =>
  ({
    id: 1,
    name: "Test",
    category: "Smartphones",
    price: 100,
    ...overrides,
  }) as StorefrontProduct;

describe("getProductFilterBrand", () => {
  it("uses explicit brand field", () => {
    expect(getProductFilterBrand(base({ brand: "Samsung" }))).toBe("Samsung");
  });

  it("infers brand from product name", () => {
    expect(getProductFilterBrand(base({ name: "Samsung Galaxy S24" }))).toBe("Samsung");
    expect(getProductFilterBrand(base({ name: "JBL Go Speaker" }))).toBe("JBL");
  });

  it("treats high-id products as Green Lion", () => {
    expect(getProductFilterBrand(base({ id: 5001, name: "Portable Fan" }))).toBe("Green Lion");
  });
});
