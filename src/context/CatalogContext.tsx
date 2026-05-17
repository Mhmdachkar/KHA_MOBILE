import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { apiBase } from "@/lib/adminApi";
import {
  registerPublicApiProducts,
  type ApiPublicProduct,
} from "@/data/productLookup";
import { buildStorefrontCatalog, type StorefrontProduct } from "@/lib/catalogProduct";

const CATALOG_CHANNEL = "kha-catalog-updated";
type CatalogContextValue = {
  catalogLoaded: boolean;
  loading: boolean;
  catalogTick: number;
  refreshCatalog: () => Promise<void>;
  refresh: () => Promise<void>;
  lastError: string | null;
  allProducts: StorefrontProduct[];
  storefrontProducts: StorefrontProduct[];
};

const CatalogContext = createContext<CatalogContextValue | undefined>(undefined);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [catalogTick, setCatalogTick] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const lastApiProductsRef = useRef<ApiPublicProduct[]>([]);
  const hasSuccessfulFetchRef = useRef(false);

  const applyApiProducts = useCallback((products: ApiPublicProduct[]) => {
    lastApiProductsRef.current = products;
    hasSuccessfulFetchRef.current = true;
    registerPublicApiProducts(products);
    setCatalogTick((n) => n + 1);
  }, []);

  const broadcastCatalogUpdate = useCallback(() => {
    try {
      if (typeof BroadcastChannel !== "undefined") {
        new BroadcastChannel(CATALOG_CHANNEL).postMessage({ type: "updated" });
      }
    } catch {
      /* ignore */
    }
  }, []);

  const refreshCatalog = useCallback(async () => {
    setLoading(true);
    setLastError(null);
    try {
      const url = `${apiBase()}/api/public/products?_=${Date.now()}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        setLastError(`Catalog API returned ${res.status}`);
        if (hasSuccessfulFetchRef.current) {
          registerPublicApiProducts(lastApiProductsRef.current);
          setCatalogTick((n) => n + 1);
        } else {
          registerPublicApiProducts([]);
        }
        return;
      }
      const data = await res.json();
      const products = (data.products || []) as ApiPublicProduct[];
      applyApiProducts(products);
      broadcastCatalogUpdate();
    } catch {
      setLastError("Could not reach catalog API (using static products only)");
      if (hasSuccessfulFetchRef.current) {
        registerPublicApiProducts(lastApiProductsRef.current);
        setCatalogTick((n) => n + 1);
      } else {
        registerPublicApiProducts([]);
      }
    } finally {
      setCatalogLoaded(true);
      setLoading(false);
    }
  }, [applyApiProducts, broadcastCatalogUpdate]);

  useEffect(() => {
    void refreshCatalog();
  }, [refreshCatalog]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void refreshCatalog();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [refreshCatalog]);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return undefined;
    const channel = new BroadcastChannel(CATALOG_CHANNEL);
    channel.onmessage = () => {
      void refreshCatalog();
    };
    return () => channel.close();
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
