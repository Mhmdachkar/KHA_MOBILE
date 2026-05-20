import { describe, it, expect } from "vitest";
import { mergeAdminProductList } from "@/lib/adminProductListMerge";
import type { StorefrontProduct } from "@/lib/catalogProduct";

const storefrontSample: StorefrontProduct[] = [
  {
    id: 1,
    name: "Static Phone",
    price: 100,
    displayPrice: 100,
    image: "/a.jpg",
    rating: 4.5,
    category: "Smartphones",
  },
  {
    id: 2,
    name: "Overridden Phone",
    price: 200,
    displayPrice: 200,
    image: "/b.jpg",
    rating: 4,
    category: "Smartphones",
    dbId: 50,
  },
];

describe("mergeAdminProductList", () => {
  it("includes every storefront product and enriches with database rows", () => {
    const merged = mergeAdminProductList(storefrontSample, [
      {
        dbId: 50,
        id: 2,
        name: "DB Override Name",
        price: 250,
        image: "/db.jpg",
        category: "Smartphones",
        rating: 4.8,
        isActive: true,
      },
    ]);

    expect(merged).toHaveLength(2);
    expect(merged.find((p) => p.id === 1)?.source).toBe("bundled");
    expect(merged.find((p) => p.id === 1)?.dbId).toBeNull();
    const overridden = merged.find((p) => p.id === 2);
    expect(overridden?.source).toBe("database");
    expect(overridden?.name).toBe("DB Override Name");
    expect(overridden?.dbId).toBe(50);
  });

  it("appends database-only rows not on the storefront", () => {
    const merged = mergeAdminProductList(storefrontSample, [
      {
        dbId: 99,
        id: 100999,
        name: "Hidden draft",
        price: 10,
        image: "",
        category: "Accessories",
        rating: 4,
        isActive: false,
      },
    ]);

    const draft = merged.find((p) => p.dbId === 99);
    expect(draft?.onStorefront).toBe(false);
    expect(draft?.source).toBe("database_only");
    expect(merged.length).toBe(3);
  });
});
