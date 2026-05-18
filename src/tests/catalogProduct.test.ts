import { describe, it, expect, afterEach } from "vitest";
import {
  buildStorefrontCatalog,
  coerceVariantArray,
  normalizeStorefrontVariants,
} from "@/lib/catalogProduct";
import {
  registerPublicApiProducts,
  registerSuppressedStorefrontIds,
} from "@/data/productLookup";

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

  it("parses string prices from admin JSONB", () => {
    const out = normalizeStorefrontVariants([
      { key: "128", label: "128GB", price: "899.99" as unknown as number },
    ]);
    expect(out).toHaveLength(1);
    expect(out![0].price).toBe(899.99);
  });
});

describe("buildStorefrontCatalog suppressed ids", () => {
  afterEach(() => {
    registerPublicApiProducts([]);
    registerSuppressedStorefrontIds([]);
  });

  it("omits static rows when legacy override is inactive in DB", () => {
    const catalog = buildStorefrontCatalog();
    const sample = catalog[0];
    expect(sample).toBeDefined();
    registerSuppressedStorefrontIds([sample.id]);
    const filtered = buildStorefrontCatalog();
    expect(filtered.find((p) => p.id === sample.id)).toBeUndefined();
  });
});
