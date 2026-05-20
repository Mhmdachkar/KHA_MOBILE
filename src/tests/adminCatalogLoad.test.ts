import { describe, it, expect, afterEach } from "vitest";
import { buildStorefrontCatalog } from "@/lib/catalogProduct";
import { loadStorefrontCatalogForAdmin } from "@/lib/adminCatalogLoad";
import { mergeAdminProductList } from "@/lib/adminProductListMerge";
import {
  registerPublicApiProducts,
  registerSuppressedStorefrontIds,
  type ApiPublicProduct,
} from "@/data/productLookup";

describe("adminCatalogLoad", () => {
  afterEach(() => {
    registerPublicApiProducts([]);
    registerSuppressedStorefrontIds([]);
  });

  it("bundled storefront catalog has at least 200 products for admin", () => {
    registerPublicApiProducts([]);
    registerSuppressedStorefrontIds([]);
    const catalog = buildStorefrontCatalog();
    const adminList = mergeAdminProductList(catalog, []);
    expect(catalog.length).toBeGreaterThanOrEqual(200);
    expect(adminList.length).toBe(catalog.length);
  });

  it("clears stale API registry so a partial API fixture does not shrink the admin catalog", async () => {
    const partial: ApiPublicProduct[] = [
      {
        id: 99999,
        dbId: 99999,
        legacyOverrideId: null,
        name: "API Only Product",
        title: "API Only Product",
        description: "",
        price: 10,
        image: "/x.jpg",
        images: ["/x.jpg"],
        rating: 4,
        category: "Other",
        features: [],
        specifications: [],
        connectivityOptions: [],
        secondaryCategories: [],
      },
    ];
    registerPublicApiProducts(partial);
    registerSuppressedStorefrontIds([]);

    const beforeStale = buildStorefrontCatalog();
    expect(beforeStale.some((p) => p.id === 99999)).toBe(true);

    const loaded = await loadStorefrontCatalogForAdmin();
    expect(loaded.products.length).toBeGreaterThanOrEqual(200);
    expect(loaded.bundledCount).toBe(loaded.products.length);
  });
});
