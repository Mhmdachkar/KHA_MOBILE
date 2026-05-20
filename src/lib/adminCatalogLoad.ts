import { adminFetch } from "@/lib/adminApi";
import { buildStorefrontCatalog, type StorefrontProduct } from "@/lib/catalogProduct";
import { resolvePrimaryImageWithStaticFallback } from "@/data/productLookup";
import {
  applyPublicCatalogToRegistry,
  fetchPublicCatalogProducts,
  notifyStorefrontCatalogUpdate,
} from "@/lib/storefrontCatalogSync";

export { notifyStorefrontCatalogUpdate };
import type { AdminDbProductRow } from "@/lib/adminProductListMerge";

/** Max rows per admin list request (server caps this). */
export const ADMIN_DB_PAGE_LIMIT = 250;

/** Safety cap on pagination loops (250 × 500 = 125k rows). */
const MAX_DB_PAGES = 500;

function mapAdminListProduct(p: Record<string, unknown>): AdminDbProductRow | null {
  const dbId = Number(p.dbId);
  if (!Number.isFinite(dbId)) return null;
  const rawImg =
    Array.isArray(p.images) && p.images.length > 0 ? (p.images[0] as string) : (p.image as string);
  const image = resolvePrimaryImageWithStaticFallback({
    id: Number(p.id),
    image: rawImg,
    legacyOverrideId: (p.legacyOverrideId as number | null) ?? null,
  });
  return {
    dbId,
    id: Number(p.id),
    name: String(p.name ?? ""),
    price: p.price as number | string,
    image,
    category: String(p.category ?? ""),
    brand: p.brand as string | undefined,
    rating: Number(p.rating) || 4.5,
    isActive: p.isActive !== false,
    isPreorder: p.isPreorder as boolean | undefined,
  };
}

/**
 * Fetch every row from GET /api/admin/products (paginated).
 */
export async function fetchAllAdminDbProductRows(): Promise<{
  rows: AdminDbProductRow[];
  reportedTotal: number;
  error: string | null;
}> {
  const rows: AdminDbProductRow[] = [];
  let reportedTotal = 0;
  let page = 1;
  let totalPages = 1;

  try {
    while (page <= totalPages && page <= MAX_DB_PAGES) {
      const res = await adminFetch(
        `/api/admin/products?page=${page}&limit=${ADMIN_DB_PAGE_LIMIT}`
      );
      const data = (await res.json().catch(() => ({}))) as {
        products?: Record<string, unknown>[];
        total?: number;
        totalPages?: number;
        error?: string;
      };

      if (!res.ok) {
        return {
          rows: [],
          reportedTotal: 0,
          error: data.error || `Server returned ${res.status}`,
        };
      }

      reportedTotal = typeof data.total === "number" ? data.total : reportedTotal;
      totalPages = Math.max(1, Number(data.totalPages) || 1);

      const batch = Array.isArray(data.products) ? data.products : [];
      for (const p of batch) {
        const row = mapAdminListProduct(p);
        if (row) rows.push(row);
      }

      if (batch.length < ADMIN_DB_PAGE_LIMIT) break;
      page += 1;
    }

    return { rows, reportedTotal, error: null };
  } catch (err) {
    return {
      rows: [],
      reportedTotal: 0,
      error: err instanceof Error ? err.message : "Failed to load database products",
    };
  }
}

/**
 * Load the same merged catalog the storefront uses, for admin screens.
 * Always includes the full bundled static catalog (200+ products).
 */
export async function loadStorefrontCatalogForAdmin(): Promise<{
  products: StorefrontProduct[];
  apiCount: number;
  bundledCount: number;
  error: string | null;
}> {
  let apiCount = 0;
  let error: string | null = null;

  // Avoid stale partial API state from a previous page shrinking the admin list.
  applyPublicCatalogToRegistry([], []);

  const { products: rows, suppressedStorefrontIds, error: fetchError } =
    await fetchPublicCatalogProducts();
  apiCount = rows.length;
  if (fetchError) {
    error = `${fetchError} — showing bundled website catalog only`;
  } else {
    applyPublicCatalogToRegistry(rows, suppressedStorefrontIds);
  }

  const products = buildStorefrontCatalog();
  const bundledCount = products.length;

  return { products, apiCount, bundledCount, error };
}
