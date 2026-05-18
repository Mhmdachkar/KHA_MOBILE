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
  registerSuppressedStorefrontIds,
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
  const lastSuppressedRef = useRef<number[]>([]);
  const hasSuccessfulFetchRef = useRef(false);
  const fetchGenerationRef = useRef(0);
  const catalogChannelRef = useRef<BroadcastChannel | null>(null);

  const applyApiProducts = useCallback((products: ApiPublicProduct[], suppressed: number[]) => {
    lastApiProductsRef.current = products;
    lastSuppressedRef.current = suppressed;
    hasSuccessfulFetchRef.current = true;
    registerPublicApiProducts(products);
    registerSuppressedStorefrontIds(suppressed);
    setCatalogTick((n) => n + 1);
  }, []);

  const broadcastCatalogUpdate = useCallback(() => {
    try {
      catalogChannelRef.current?.postMessage({ type: "updated" });
    } catch {
      /* ignore */
    }
  }, []);

  const refreshCatalog = useCallback(async () => {
    const generation = ++fetchGenerationRef.current;
    setLoading(true);
    setLastError(null);
    try {
      const url = `${apiBase()}/api/public/products?_=${Date.now()}`;
      const res = await fetch(url, { cache: "no-store" });
      if (generation !== fetchGenerationRef.current) return;
      if (!res.ok) {
        setLastError(`Catalog API returned ${res.status}`);
        if (hasSuccessfulFetchRef.current) {
          applyApiProducts(lastApiProductsRef.current, lastSuppressedRef.current);
        } else {
          applyApiProducts([], []);
        }
        return;
      }
      const data = await res.json();
      const products = (data.products || []) as ApiPublicProduct[];
      const suppressed = Array.isArray(data.suppressedStorefrontIds)
        ? (data.suppressedStorefrontIds as number[])
        : [];
      if (generation !== fetchGenerationRef.current) return;
      applyApiProducts(products, suppressed);
      broadcastCatalogUpdate();
    } catch {
      if (generation !== fetchGenerationRef.current) return;
      setLastError("Could not reach catalog API (using static products only)");
      if (hasSuccessfulFetchRef.current) {
        applyApiProducts(lastApiProductsRef.current, lastSuppressedRef.current);
      } else {
        applyApiProducts([], []);
      }
    } finally {
      if (generation === fetchGenerationRef.current) {
        setCatalogLoaded(true);
        setLoading(false);
      }
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
    catalogChannelRef.current = channel;
    channel.onmessage = () => {
      void refreshCatalog();
    };
    return () => {
      channel.close();
      catalogChannelRef.current = null;
    };
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
