/**
 * Verifies ProductDetail keeps a stable hook order when catalogLoaded transitions
 * (skeleton → full page). Previously, accessory hooks after early returns caused
 * "Rendered more hooks than during the previous render" and a blank page.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProductDetail from "@/pages/ProductDetail";

const mockRefreshCatalog = vi.fn().mockResolvedValue(undefined);

vi.mock("@/context/CatalogContext", () => ({
  useCatalog: vi.fn(),
}));

vi.mock("@/context/FavoritesContext", () => ({
  useFavorites: () => ({ isFavorite: () => false, toggleFavorite: vi.fn() }),
}));

vi.mock("@/context/CartContext", () => ({
  useCart: () => ({ addToCart: vi.fn() }),
}));

vi.mock("@/context/AnalyticsContext", () => ({
  useAnalytics: () => ({ trackProductView: vi.fn(), trackAddToCart: vi.fn() }),
}));

vi.mock("@/hooks/useEnsureMobileScroll", () => ({
  useEnsureMobileScroll: () => {},
}));

vi.mock("@/hooks/useScrollLockRestore", () => ({
  useScrollLockRestore: () => {},
}));

import { useCatalog } from "@/context/CatalogContext";

const storefrontRow = {
  id: 127,
  dbId: 1,
  name: "Test Phone",
  price: 999,
  displayPrice: 999,
  image: "/uploads/test.jpg",
  images: ["/uploads/test.jpg"],
  rating: 4.5,
  category: "Smartphones",
  variants: [{ key: "128", label: "128GB", price: 999 }],
};

function renderProductDetail(catalogLoaded: boolean) {
  vi.mocked(useCatalog).mockReturnValue({
    catalogLoaded,
    loading: !catalogLoaded,
    catalogTick: catalogLoaded ? 1 : 0,
    apiProductCount: catalogLoaded ? 1 : 0,
    refreshCatalog: mockRefreshCatalog,
    refresh: mockRefreshCatalog,
    lastError: null,
    allProducts: catalogLoaded ? [storefrontRow] : [],
    storefrontProducts: catalogLoaded ? [storefrontRow] : [],
  });

  return render(
    <MemoryRouter initialEntries={["/product/127"]}>
      <Routes>
        <Route path="/product/:id" element={<ProductDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProductDetail hook stability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("survives catalogLoaded false → true without throwing", () => {
    const { rerender } = renderProductDetail(false);
    expect(screen.queryByText("Test Phone")).toBeNull();

    vi.mocked(useCatalog).mockReturnValue({
      catalogLoaded: true,
      loading: false,
      catalogTick: 1,
      apiProductCount: 1,
      refreshCatalog: mockRefreshCatalog,
      refresh: mockRefreshCatalog,
      lastError: null,
      allProducts: [storefrontRow],
      storefrontProducts: [storefrontRow],
    });

    rerender(
      <MemoryRouter initialEntries={["/product/127"]}>
        <Routes>
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText("Product not found")).toBeNull();
    expect(screen.getByRole("link", { name: /products/i })).toBeTruthy();
  });
});
