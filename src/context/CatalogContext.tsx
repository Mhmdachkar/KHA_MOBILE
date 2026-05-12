import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { registerPublicApiProducts, type ApiPublicProduct } from "@/data/productLookup";

function apiBase(): string {
  return import.meta.env.VITE_API_URL || "http://localhost:3001";
}

type CatalogContextValue = {
  catalogLoaded: boolean;
  /** Increments when /api/public/products is merged into productLookup (recompute UI lists). */
  catalogTick: number;
  refreshCatalog: () => Promise<void>;
  lastError: string | null;
};

const CatalogContext = createContext<CatalogContextValue | undefined>(undefined);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [catalogTick, setCatalogTick] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  const refreshCatalog = useCallback(async () => {
    setLastError(null);
    try {
      const res = await fetch(`${apiBase()}/api/public/products`);
      if (!res.ok) {
        registerPublicApiProducts([]);
        setLastError(`Catalog API returned ${res.status}`);
        return;
      }
      const data = await res.json();
      registerPublicApiProducts((data.products || []) as ApiPublicProduct[]);
    } catch {
      registerPublicApiProducts([]);
      setLastError("Could not reach catalog API (using static products only)");
    } finally {
      setCatalogLoaded(true);
      setCatalogTick((n) => n + 1);
    }
  }, []);

  useEffect(() => {
    void refreshCatalog();
  }, [refreshCatalog]);

  const value = useMemo(
    () => ({ catalogLoaded, catalogTick, refreshCatalog, lastError }),
    [catalogLoaded, catalogTick, refreshCatalog, lastError]
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
