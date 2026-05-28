import { apiBase } from "@/lib/adminApi";
import {
  registerPublicApiProducts,
  registerSuppressedStorefrontIds,
  type ApiPublicProduct,
} from "@/data/productLookup";

export const STOREFRONT_CATALOG_CHANNEL = "kha-catalog-updated";

/** Unique per browser tab — used to skip self-triggered BroadcastChannel refresh. */
export const CATALOG_TAB_ID =
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `tab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export interface PublicCatalogFetchResult {
  products: ApiPublicProduct[];
  suppressedStorefrontIds: number[];
  error: string | null;
}

/** Fetch active DB products exposed to the public storefront (same source as admin publishes). */
export async function fetchPublicCatalogProducts(): Promise<PublicCatalogFetchResult> {
  try {
    const url = `${apiBase()}/api/public/products?_=${Date.now()}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return {
        products: [],
        suppressedStorefrontIds: [],
        error: `Catalog API returned ${res.status}`,
      };
    }
    const data = await res.json();
    const products = (data.products || []) as ApiPublicProduct[];
    const suppressedStorefrontIds = Array.isArray(data.suppressedStorefrontIds)
      ? (data.suppressedStorefrontIds as number[])
      : [];
    return { products, suppressedStorefrontIds, error: null };
  } catch {
    return {
      products: [],
      suppressedStorefrontIds: [],
      error: "Could not reach catalog API",
    };
  }
}

/** Apply API rows to the in-memory registry used by buildStorefrontCatalog(). */
export function applyPublicCatalogToRegistry(
  products: ApiPublicProduct[],
  suppressedStorefrontIds: number[]
): void {
  registerPublicApiProducts(products);
  registerSuppressedStorefrontIds(suppressedStorefrontIds);
}

/**
 * Tell open storefront tabs to refetch /api/public/products
 * (e.g. after admin saves a product).
 */
export function notifyStorefrontCatalogUpdate(): void {
  try {
    const channel = new BroadcastChannel(STOREFRONT_CATALOG_CHANNEL);
    channel.postMessage({ type: "updated", senderId: CATALOG_TAB_ID });
    channel.close();
  } catch {
    /* BroadcastChannel unavailable */
  }
}
