import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { useCatalog } from "@/context/CatalogContext";
import { findStoreProductSplit } from "@/data/productLookup";
import { resolveSalePrice } from "@/lib/storefrontPricing";

export interface FavoriteProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  rating?: number;
  category?: string;
}

interface FavoritesContextType {
  favoriteIds: number[];
  favorites: FavoriteProduct[];
  addToFavorites: (product: FavoriteProduct) => void;
  removeFromFavorites: (id: number) => void;
  isFavorite: (id: number) => boolean;
  toggleFavorite: (product: FavoriteProduct) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY = "kha_mobile_favorite_ids";

function loadFavoriteIds(): number[] {
  try {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.every((x) => typeof x === "number")) {
          return parsed;
        }
        if (Array.isArray(parsed) && parsed[0]?.id != null) {
          return parsed.map((p: { id: number }) => Number(p.id)).filter(Number.isFinite);
        }
      }
    }
  } catch {
    /* ignore */
  }
  return [];
}

function resolveFavorite(id: number): FavoriteProduct | null {
  const { regularProduct, greenLionProduct } = findStoreProductSplit(id);
  const p = regularProduct || greenLionProduct;
  if (!p) return null;
  const image =
    "image" in p && p.image
      ? String(p.image)
      : "images" in p && p.images?.[0]
        ? String(p.images[0])
        : "";
  return {
    id: p.id,
    name: p.name,
    price: resolveSalePrice(p),
    image,
    rating: p.rating,
    category: p.category,
  };
}

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { catalogTick } = useCatalog();
  const [favoriteIds, setFavoriteIds] = useState<number[]>(() => loadFavoriteIds());

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
      }
    } catch {
      /* ignore */
    }
  }, [favoriteIds]);

  const favorites = useMemo(
    () =>
      favoriteIds
        .map((id) => resolveFavorite(id))
        .filter((p): p is FavoriteProduct => p != null),
    [favoriteIds, catalogTick]
  );

  const addToFavorites = (product: FavoriteProduct) => {
    setFavoriteIds((prev) => (prev.includes(product.id) ? prev : [...prev, product.id]));
  };

  const removeFromFavorites = (id: number) => {
    setFavoriteIds((prev) => prev.filter((item) => item !== id));
  };

  const isFavorite = (id: number) => favoriteIds.includes(id);

  const toggleFavorite = (product: FavoriteProduct) => {
    if (isFavorite(product.id)) removeFromFavorites(product.id);
    else addToFavorites(product);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
