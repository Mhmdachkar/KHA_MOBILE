import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiBase } from "@/lib/adminApi";
import { 
  registerPublicApiProducts, 
  type ApiPublicProduct,
  getProductsByCategoryMerged,
  getAllGreenLionProductsMerged,
  getProductFromApiById,
  eachApiCatalogProduct
} from "@/data/productLookup";
import { 
  phoneAccessories, 
  wearablesProducts, 
  smartphoneProducts, 
  tabletProducts, 
  iphoneCases, 
  gamingConsoles, 
  electronicsProducts 
} from "@/data/products";

type CatalogProduct = {
  id: number;
  name: string;
  price: number | string;
  image: string;
  images?: string[];
  category: string;
  brand?: string;
  rating: number;
  [key: string]: any;
};

type CatalogContextValue = {
  catalogLoaded: boolean;
  loading: boolean;
  /** Increments when /api/public/products is merged into productLookup (recompute UI lists). */
  catalogTick: number;
  refreshCatalog: () => Promise<void>;
  refresh: () => Promise<void>;
  lastError: string | null;
  allProducts: CatalogProduct[];
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

  // Get all products merged from static files + API
  const allProducts = useMemo<CatalogProduct[]>(() => {
    // Merge all static products with API overrides
    const staticProducts = [
      ...phoneAccessories,
      ...wearablesProducts,
      ...smartphoneProducts,
      ...tabletProducts,
      ...iphoneCases,
      ...gamingConsoles,
      ...electronicsProducts,
    ];

    // Get Green Lion products with API overrides
    const greenLionProducts = getAllGreenLionProductsMerged();

    // Merge static products with API data (similar to Green Lion merge)
    const mergedStatic = staticProducts.map((p) => {
      const override = getProductFromApiById(p.id);
      return override || p;
    });

    // Combine all and ensure unique IDs
    const allMerged = [...mergedStatic, ...greenLionProducts];
    const uniqueMap = new Map<number, CatalogProduct>();
    
    for (const product of allMerged) {
      uniqueMap.set(product.id, product as CatalogProduct);
    }

    // Add API-only products that don't have static counterparts
    eachApiCatalogProduct((storefrontId, hit) => {
      if (!uniqueMap.has(storefrontId)) {
        uniqueMap.set(storefrontId, hit.product as CatalogProduct);
      }
    });

    return Array.from(uniqueMap.values());
  }, [catalogTick]); // Recompute when catalog updates

  const value = useMemo(
    () => ({ 
      catalogLoaded, 
      loading,
      catalogTick, 
      refreshCatalog, 
      refresh: refreshCatalog,
      lastError,
      allProducts 
    }),
    [catalogLoaded, loading, catalogTick, refreshCatalog, lastError, allProducts]
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
