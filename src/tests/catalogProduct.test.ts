import { describe, it, expect } from "vitest";
import { coerceVariantArray, normalizeStorefrontVariants } from "@/lib/catalogProduct";

describe("normalizeStorefrontVariants", () => {
  it("coerces object-shaped JSONB to array", () => {
    const raw = {
      a: { key: "", label: "128GB", price: 800 },
      b: { key: "", label: "256GB", price: 900 },
    };
    const out = normalizeStorefrontVariants(raw);
    expect(out).toHaveLength(2);
    expect(out![0].key).not.toBe(out![1].key);
  });

  it("assigns unique keys when duplicates are empty", () => {
    const out = normalizeStorefrontVariants([
      { key: "", label: "128 GB", price: 800, ram: "", storage: "128" },
      { key: "", label: "256 GB", price: 900, ram: "", storage: "256" },
    ]);
    expect(out).toHaveLength(2);
    expect(new Set(out!.map((v) => v.key)).size).toBe(2);
  });

  it("returns undefined for empty input", () => {
    expect(normalizeStorefrontVariants([])).toBeUndefined();
    expect(coerceVariantArray(null)).toEqual([]);
  });
});
