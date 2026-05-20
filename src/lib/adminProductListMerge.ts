import type { StorefrontProduct } from "@/lib/catalogProduct";

/** Row shape from GET /api/admin/products (after client normalization). */
export interface AdminDbProductRow {
  dbId: number;
  id: number;
  name: string;
  price: number | string;
  image: string;
  category: string;
  brand?: string;
  rating: number;
  isActive?: boolean;
  isPreorder?: boolean;
}

export type AdminListSource = "bundled" | "database" | "database_only";

/** Unified row for admin product list — matches what shoppers can see on the storefront. */
export interface AdminListProduct {
  /** Storefront / URL id (`/product/:id`). */
  id: number;
  /** Postgres id when a DB row exists; null for bundled-only catalog items. */
  dbId: number | null;
  name: string;
  price: number;
  image: string;
  category: string;
  brand?: string;
  rating: number;
  isActive: boolean;
  isPreorder?: boolean;
  /** Present on the live merged storefront catalog. */
  onStorefront: boolean;
  source: AdminListSource;
}

function dbPrice(row: AdminDbProductRow): number {
  const n = typeof row.price === "number" ? row.price : Number(row.price);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Build the admin catalog list: every product on the website (storefront merge)
 * plus DB-only rows that are not currently visible on the shop.
 */
export function mergeAdminProductList(
  storefrontProducts: StorefrontProduct[],
  dbRows: AdminDbProductRow[]
): AdminListProduct[] {
  const dbByStorefrontId = new Map<number, AdminDbProductRow>();
  for (const row of dbRows) {
    dbByStorefrontId.set(row.id, row);
  }

  const consumedDbIds = new Set<number>();
  const merged: AdminListProduct[] = [];

  for (const sp of storefrontProducts) {
    const db =
      dbByStorefrontId.get(sp.id) ??
      (sp.dbId != null ? dbRows.find((r) => r.dbId === sp.dbId) : undefined);
    if (db) consumedDbIds.add(db.dbId);

    merged.push({
      id: sp.id,
      dbId: db?.dbId ?? sp.dbId ?? null,
      name: db?.name ?? sp.name,
      price: db ? dbPrice(db) : sp.displayPrice,
      image: db?.image || sp.image || sp.images?.[0] || "",
      category: db?.category ?? sp.category,
      brand: db?.brand ?? sp.brand,
      rating: db?.rating ?? sp.rating ?? 4.5,
      isActive: db ? db.isActive !== false : true,
      isPreorder: db?.isPreorder ?? sp.isPreorder,
      onStorefront: true,
      source: db ? "database" : "bundled",
    });
  }

  for (const db of dbRows) {
    if (consumedDbIds.has(db.dbId)) continue;
    merged.push({
      id: db.id,
      dbId: db.dbId,
      name: db.name,
      price: dbPrice(db),
      image: db.image,
      category: db.category,
      brand: db.brand,
      rating: db.rating ?? 4.5,
      isActive: db.isActive !== false,
      isPreorder: db.isPreorder,
      onStorefront: false,
      source: "database_only",
    });
  }

  return merged.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}
