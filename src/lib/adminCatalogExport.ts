import type { AdminListProduct } from "@/lib/adminProductListMerge";
import { getAdminProductBrand } from "@/lib/adminCatalogTaxonomy";

function escapeCsvCell(value: string | number | boolean | null | undefined): string {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function buildAdminProductsCsv(products: AdminListProduct[]): string {
  const headers = [
    "storefront_id",
    "db_id",
    "name",
    "category",
    "brand",
    "price",
    "active",
    "source",
    "on_storefront",
    "is_preorder",
  ];
  const rows = products.map((p) =>
    [
      p.id,
      p.dbId ?? "",
      p.name,
      p.category,
      getAdminProductBrand(p),
      p.price,
      p.isActive,
      p.source,
      p.onStorefront,
      p.isPreorder ?? false,
    ]
      .map(escapeCsvCell)
      .join(",")
  );
  return [headers.join(","), ...rows].join("\r\n");
}

export function downloadAdminProductsCsv(
  products: AdminListProduct[],
  filename?: string
): void {
  const csv = buildAdminProductsCsv(products);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download =
    filename ?? `kha-products-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
