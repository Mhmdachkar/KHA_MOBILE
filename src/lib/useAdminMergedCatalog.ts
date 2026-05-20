import { useCallback, useEffect, useMemo, useState } from "react";
import { loadStorefrontCatalogForAdmin, fetchAllAdminDbProductRows } from "@/lib/adminCatalogLoad";
import {
  mergeAdminProductList,
  type AdminDbProductRow,
  type AdminListProduct,
} from "@/lib/adminProductListMerge";
import type { StorefrontProduct } from "@/lib/catalogProduct";
import { useToast } from "@/hooks/use-toast";

export interface UseAdminMergedCatalogResult {
  products: AdminListProduct[];
  loading: boolean;
  catalogError: string | null;
  dbLoadFailed: boolean;
  /** Products visible on the live storefront merge (bundled + API). */
  storefrontCount: number;
  dbRowCount: number;
  refresh: () => void;
}

/**
 * Loads full storefront catalog (all bundled website products) + every DB row, then merges.
 */
export function useAdminMergedCatalog(options?: { enabled?: boolean }): UseAdminMergedCatalogResult {
  const enabled = options?.enabled !== false;
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);
  const [dbLoading, setDbLoading] = useState(true);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [dbLoadFailed, setDbLoadFailed] = useState(false);
  const [storefrontCatalog, setStorefrontCatalog] = useState<StorefrontProduct[]>([]);
  const [dbRows, setDbRows] = useState<AdminDbProductRow[]>([]);
  const [storefrontCount, setStorefrontCount] = useState(0);

  const loadDbProducts = useCallback(async () => {
    setDbLoading(true);
    setDbLoadFailed(false);
    const { rows, reportedTotal, error } = await fetchAllAdminDbProductRows();
    if (error) {
      setDbLoadFailed(true);
      setDbRows([]);
      toast({
        variant: "destructive",
        title: "Could not load database products",
        description: error,
      });
    } else {
      setDbRows(rows);
      if (reportedTotal > 0 && rows.length < reportedTotal) {
        console.warn(
          `[useAdminMergedCatalog] Loaded ${rows.length} of ${reportedTotal} DB products`
        );
        toast({
          variant: "destructive",
          title: "Incomplete database load",
          description: `Loaded ${rows.length} of ${reportedTotal} products. Refresh or check the API.`,
        });
      }
    }
    setDbLoading(false);
  }, [toast]);

  const loadStorefront = useCallback(async () => {
    setCatalogLoading(true);
    setCatalogError(null);
    try {
      const { products, bundledCount, error } = await loadStorefrontCatalogForAdmin();
      setStorefrontCatalog(products);
      setStorefrontCount(bundledCount);
      setCatalogError(error);
      if (bundledCount < 150) {
        console.warn("[useAdminMergedCatalog] Storefront catalog smaller than expected:", bundledCount);
      }
    } catch (err) {
      setCatalogError(err instanceof Error ? err.message : "Failed to load storefront catalog");
      setStorefrontCatalog([]);
      setStorefrontCount(0);
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setDbLoading(false);
      setCatalogLoading(false);
      return;
    }
    void loadDbProducts();
    void loadStorefront();
  }, [loadDbProducts, loadStorefront, refreshKey, enabled]);

  const products = useMemo(
    () => mergeAdminProductList(storefrontCatalog, dbRows),
    [storefrontCatalog, dbRows]
  );

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  return {
    products: enabled ? products : [],
    loading: enabled && (dbLoading || catalogLoading),
    catalogError: enabled ? catalogError : null,
    dbLoadFailed: enabled ? dbLoadFailed : false,
    storefrontCount: enabled ? storefrontCount : 0,
    dbRowCount: enabled ? dbRows.length : 0,
    refresh,
  };
}
