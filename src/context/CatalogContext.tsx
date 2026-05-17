import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiBase } from "@/lib/adminApi";
import { 
  registerPublicApiProducts, 
  type ApiPublicProduct,
} from "@/data/productLookup";
import { buildStorefrontCatalog, type StorefrontProduct } from "@/lib/catalogProduct";

type CatalogContextValue = {
  catalogLoaded: boolean;
  loading: boolean;
  /** Increments when /api/public/products is merged into productLookup (recompute UI lists). */
  catalogTick: number;
  refreshCatalog: () => Promise<void>;
  refresh: () => Promise<void>;
  lastError: string | null;
  /** @deprecated Use storefrontProducts — kept for gradual migration */
  allProducts: StorefrontProduct[];
  storefrontProducts: StorefrontProduct[];
};

const CatalogContext = createContext<CatalogContextValue | undefined>(undefined);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [catalogTick, setCatalogTick] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  const refreshCatalog = useCallback(async () => {
    console.log('[CatalogContext] Refreshing catalog...');
    setLoading(true);
    setLastError(null);
    try {
      const res = await fetch(`${apiBase()}/api/public/products`, { cache: "no-store" });
      console.log('[CatalogContext] Catalog API response status:', res.status);
      if (!res.ok) {
        console.error('[CatalogContext] Catalog API error:', res.status);
        registerPublicApiProducts([]);
        setLastError(`Catalog API returned ${res.status}`);
        return;
      }
      const data = await res.json();
      console.log('[CatalogContext] Loaded', data.products?.length || 0, 'products from API');
      registerPublicApiProducts((data.products || []) as ApiPublicProduct[]);
    } catch (err) {
      console.error('[CatalogContext] Catalog fetch error:', err);
      registerPublicApiProducts([]);
      setLastError("Could not reach catalog API (using static products only)");
    } finally {
      setCatalogLoaded(true);
      setLoading(false);
      setCatalogTick((n) => n + 1);
      console.log('[CatalogContext] Catalog refresh complete');
    }
  }, []);

  useEffect(() => {
    void refreshCatalog();
  }, [refreshCatalog]);

  const storefrontProducts = useMemo(
    () => buildStorefrontCatalog(),
    [catalogTick]
  );

  const value = useMemo(
    () => ({ 
      catalogLoaded, 
      loading,
      catalogTick, 
      refreshCatalog, 
      refresh: refreshCatalog,
      lastError,
      allProducts: storefrontProducts,
      storefrontProducts,
    }),
    [catalogLoaded, loading, catalogTick, refreshCatalog, lastError, storefrontProducts]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) {
    throw new Error("useCatalog must be used within CatalogProvider");
  }
  return ctx;
}
