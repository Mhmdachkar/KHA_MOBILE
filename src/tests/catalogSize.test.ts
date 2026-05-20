import { describe, it, expect, afterEach } from "vitest";
import { buildStorefrontCatalog } from "@/lib/catalogProduct";
import {
  registerPublicApiProducts,
  registerSuppressedStorefrontIds,
} from "@/data/productLookup";
import { mergeAdminProductList } from "@/lib/adminProductListMerge";

describe("storefront catalog size", () => {
  afterEach(() => {
    registerPublicApiProducts([]);
    registerSuppressedStorefrontIds([]);
  });

  it("bundled static catalog should include the full website catalog (200+)", () => {
    const catalog = buildStorefrontCatalog();
    expect(catalog.length).toBeGreaterThanOrEqual(200);
  });

  it("live API + static merge should be well over 89 products", async () => {
    const res = await fetch("https://kha-mobile.onrender.com/api/public/products", {
      cache: "no-store",
    });
    const data = await res.json();
    registerPublicApiProducts(data.products || []);
    registerSuppressedStorefrontIds(data.suppressedStorefrontIds || []);
    const catalog = buildStorefrontCatalog();
    const adminList = mergeAdminProductList(catalog, []);
    expect(catalog.length).toBeGreaterThanOrEqual(200);
    expect(adminList.length).toBe(catalog.length);
  });
});
