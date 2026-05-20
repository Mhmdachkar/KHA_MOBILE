import { describe, it, expect, afterEach } from "vitest";
import { buildStorefrontCatalog } from "@/lib/catalogProduct";
import {
  applyPublicCatalogToRegistry,
  STOREFRONT_CATALOG_CHANNEL,
} from "@/lib/storefrontCatalogSync";
import {
  registerPublicApiProducts,
  registerSuppressedStorefrontIds,
  type ApiPublicProduct,
} from "@/data/productLookup";

describe("storefrontCatalogSync", () => {
  afterEach(() => {
    registerPublicApiProducts([]);
    registerSuppressedStorefrontIds([]);
  });

  it("merges admin-only API products into buildStorefrontCatalog", () => {
    const apiOnly: ApiPublicProduct = {
      id: 99001,
      dbId: 99001,
      legacyOverrideId: null,
      name: "Admin Only Test Phone",
      title: "Admin Only Test Phone",
      description: "Created in admin",
      price: 199,
      image: "https://example.com/p.jpg",
      images: ["https://example.com/p.jpg"],
      rating: 4.5,
      category: "Smartphones",
      brand: "TestBrand",
      features: [],
      specifications: [],
      connectivityOptions: [],
      secondaryCategories: [],
      isActive: true,
    };

    applyPublicCatalogToRegistry([apiOnly], []);
    const catalog = buildStorefrontCatalog();
    const hit = catalog.find((p) => p.id === 99001);
    expect(hit?.name).toBe("Admin Only Test Phone");
    expect(hit?.category).toBe("Smartphones");
  });

  it("uses the same broadcast channel id as CatalogProvider", () => {
    expect(STOREFRONT_CATALOG_CHANNEL).toBe("kha-catalog-updated");
  });
});
