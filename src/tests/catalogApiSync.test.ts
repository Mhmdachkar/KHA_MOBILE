import { describe, it, expect, afterEach } from "vitest";
import { buildStorefrontCatalog } from "@/lib/catalogProduct";
import { filterByCategoryPage } from "@/lib/catalogFilters";
import {
  registerPublicApiProducts,
  registerSuppressedStorefrontIds,
  type ApiPublicProduct,
} from "@/data/productLookup";

const API_URL = "https://kha-mobile.onrender.com/api/public/products";

function applyApiFixture(products: ApiPublicProduct[], suppressed: number[] = []) {
  registerPublicApiProducts(products);
  registerSuppressedStorefrontIds(suppressed);
  return buildStorefrontCatalog();
}

describe("admin catalog → storefront sync (live API)", () => {
  afterEach(() => {
    registerPublicApiProducts([]);
    registerSuppressedStorefrontIds([]);
  });

  it("includes every active public API product in the merged storefront catalog", async () => {
    const res = await fetch(API_URL, { cache: "no-store" });
    expect(res.ok).toBe(true);
    const data = await res.json();
    const apiProducts = (data.products || []) as ApiPublicProduct[];
    const suppressed = (data.suppressedStorefrontIds || []) as number[];

    const catalog = applyApiFixture(apiProducts, suppressed);
    const catalogIds = new Set(catalog.map((p) => p.id));

    const missing = apiProducts.filter((p) => !catalogIds.has(p.id));
    expect(
      missing.map((p) => ({ id: p.id, name: p.name, category: p.category })),
      `API-only products missing from storefront: ${missing.map((p) => p.name).join(", ")}`
    ).toEqual([]);
  });

  it("places smartphone-category API products on the Smartphones category page filter", async () => {
    const res = await fetch(API_URL, { cache: "no-store" });
    const data = await res.json();
    const apiProducts = (data.products || []) as ApiPublicProduct[];
    const catalog = applyApiFixture(apiProducts, data.suppressedStorefrontIds || []);

    const apiPhones = apiProducts.filter((p) => p.category === "Smartphones");
    const pagePhones = filterByCategoryPage(catalog, "Smartphones");
    const pageIds = new Set(pagePhones.map((p) => p.id));

    const missingOnPage = apiPhones.filter((p) => !pageIds.has(p.id));
    expect(
      missingOnPage.map((p) => p.name),
      `Smartphones missing from /smartphones filter: ${missingOnPage.map((p) => p.name).join(", ")}`
    ).toEqual([]);
  });
});
