import { describe, it, expect } from "vitest";
import { buildAdminProductsCsv } from "@/lib/adminCatalogExport";
import type { AdminListProduct } from "@/lib/adminProductListMerge";

const row: AdminListProduct = {
  id: 1,
  dbId: 10,
  name: 'Phone, "Pro"',
  price: 99.5,
  image: "/a.jpg",
  category: "Smartphones",
  brand: "Samsung",
  rating: 4.5,
  isActive: true,
  onStorefront: true,
  source: "database",
};

describe("adminCatalogExport", () => {
  it("builds CSV with escaped commas and quotes", () => {
    const csv = buildAdminProductsCsv([row]);
    expect(csv.split("\r\n")[0]).toContain("storefront_id");
    expect(csv).toContain('"Phone, ""Pro"""');
    expect(csv).toContain("Samsung");
  });
});
