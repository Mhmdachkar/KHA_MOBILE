import { useCallback, useEffect, useMemo, useState } from "react";
import { loadStorefrontCatalogForAdmin } from "@/lib/adminCatalogLoad";
import { buildCatalogHealthSummary, type CatalogHealthSummary } from "@/lib/adminCatalogSummary";
import type { StorefrontProduct } from "@/lib/catalogProduct";

export interface UseAdminCatalogSummaryResult {
  products: StorefrontProduct[];
  summary: CatalogHealthSummary | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/** Lightweight storefront load for counts/alerts — no DB pagination. */
export function useAdminCatalogSummary(options?: { enabled?: boolean }): UseAdminCatalogSummaryResult {
  const enabled = options?.enabled !== false;
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<StorefrontProduct[]>([]);

  const load = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { products: list, error: err } = await loadStorefrontCatalogForAdmin();
      setProducts(list);
      setError(err);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load catalog");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  const summary = useMemo(
    () => (products.length > 0 ? buildCatalogHealthSummary(products) : null),
    [products]
  );

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  return {
    products: enabled ? products : [],
    summary: enabled ? summary : null,
    loading: enabled && loading,
    error: enabled ? error : null,
    refresh,
  };
}
