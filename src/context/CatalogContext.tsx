import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { buildStorefrontCatalog, type StorefrontProduct } from "@/lib/catalogProduct";
import {
  CATALOG_TAB_ID,
  STOREFRONT_CATALOG_CHANNEL,
  applyPublicCatalogToRegistry,
  fetchPublicCatalogProducts,
} from "@/lib/storefrontCatalogSync";

/** Refetch interval while the tab is visible (keeps admin edits visible without full reload). */
const CATALOG_REFRESH_MS = 3 * 60 * 1000;

type CatalogContextValue = {
  catalogLoaded: boolean;
  loading: boolean;
  catalogTick: number;
  apiProductCount: number;
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
  const [apiProductCount, setApiProductCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const lastApiProductsRef = useRef<Awaited<ReturnType<typeof fetchPublicCatalogProducts>>["products"]>([]);
  const lastSuppressedRef = useRef<number[]>([]);
  const hasSuccessfulFetchRef = useRef(false);
  const fetchGenerationRef = useRef(0);
  const inFlightRef = useRef<Promise<void> | null>(null);
  const catalogChannelRef = useRef<BroadcastChannel | null>(null);

  const applyApiProducts = useCallback(
    (products: typeof lastApiProductsRef.current, suppressed: number[]) => {
      lastApiProductsRef.current = products;
      lastSuppressedRef.current = suppressed;
      hasSuccessfulFetchRef.current = true;
      setApiProductCount(products.length);
      applyPublicCatalogToRegistry(products, suppressed);
      setCatalogTick((n) => n + 1);
    },
    []
  );

  const refreshCatalog = useCallback(async () => {
    if (inFlightRef.current) return inFlightRef.current;

    const run = (async () => {
      const generation = ++fetchGenerationRef.current;
      const isBackground = hasSuccessfulFetchRef.current;
      if (!isBackground) setLoading(true);
      setLastError(null);
      try {
        const { products, suppressedStorefrontIds, error } = await fetchPublicCatalogProducts();
        if (generation !== fetchGenerationRef.current) return;

        if (error) {
          setLastError(error);
          if (hasSuccessfulFetchRef.current) {
            applyApiProducts(lastApiProductsRef.current, lastSuppressedRef.current);
          } else {
            applyApiProducts([], []);
          }
          return;
        }

        applyApiProducts(products, suppressedStorefrontIds);
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
    })();

    inFlightRef.current = run;
    try {
      await run;
    } finally {
      if (inFlightRef.current === run) inFlightRef.current = null;
    }
  }, [applyApiProducts]);

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
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void refreshCatalog();
      }
    }, CATALOG_REFRESH_MS);
    return () => window.clearInterval(id);
  }, [refreshCatalog]);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return undefined;
    const channel = new BroadcastChannel(STOREFRONT_CATALOG_CHANNEL);
    catalogChannelRef.current = channel;
    channel.onmessage = (event: MessageEvent<{ type?: string; senderId?: string }>) => {
      if (event.data?.senderId === CATALOG_TAB_ID) return;
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
      apiProductCount,
      refreshCatalog,
      refresh: refreshCatalog,
      lastError,
      allProducts: storefrontProducts,
      storefrontProducts,
    }),
    [catalogLoaded, loading, catalogTick, apiProductCount, refreshCatalog, lastError, storefrontProducts]
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
