import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface FavoriteProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  rating?: number;
  category?: string;
}

interface FavoritesContextType {
  favorites: FavoriteProduct[];
  addToFavorites: (product: FavoriteProduct) => void;
  removeFromFavorites: (id: number) => void;
  isFavorite: (id: number) => boolean;
  toggleFavorite: (product: FavoriteProduct) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// localStorage key for favorites - device-specific storage
const FAVORITES_STORAGE_KEY = "kha_mobile_favorites";

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>(() => {
    // Load from localStorage on mount - device-specific storage
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      }
    } catch (error) {
      console.error("Error loading favorites from localStorage:", error);
    }
    return [];
  });

  // Save to localStorage whenever favorites change - persists across page refreshes on the same device
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      }
    } catch (error) {
      console.error("Error saving favorites to localStorage:", error);
      // If localStorage is full or disabled, we continue without saving
      // The favorites will still work in the current session
    }
  }, [favorites]);

  const addToFavorites = (product: FavoriteProduct) => {
    setFavorites((prev) => {
      // Check if product already exists
      if (prev.some((item) => item.id === product.id)) {
        return prev;
      }
      return [...prev, product];
    });
  };

  const removeFromFavorites = (id: number) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  };

  const isFavorite = (id: number) => {
    return favorites.some((item) => item.id === id);
  };

  const toggleFavorite = (product: FavoriteProduct) => {
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
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

