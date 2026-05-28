import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCatalog } from "@/context/CatalogContext";
import { getProductFilterBrand, matchesStorefrontCategory } from "@/lib/catalogFilters";
import {
  CANONICAL_STOREFRONT_CATEGORIES,
  normalizeStorefrontCategory,
} from "@/lib/storefrontCategories";
import { cn } from "@/lib/utils";

export type MobileProductBrowseStep = "categories" | "brands";

interface MobileProductBrowseNavProps {
  step: MobileProductBrowseStep | null;
  selectedCategory: string | null;
  onOpenCategories: () => void;
  onSelectCategory: (category: string) => void;
  onBackToMenu: () => void;
  onBackToCategories: () => void;
  onCloseMenu: () => void;
  /** Inline trigger row in the main menu list */
  triggerClassName?: string;
}

export function useMobileProductBrowseData(selectedCategory: string | null) {
  const { storefrontProducts } = useCatalog();

  const categories = useMemo(() => {
    const present = new Set<string>();
    for (const p of storefrontProducts) {
      if (p.category) present.add(normalizeStorefrontCategory(p.category));
    }
    const canonical = CANONICAL_STOREFRONT_CATEGORIES.filter((c) => present.has(c));
    const extras = [...present]
      .filter((c) => !CANONICAL_STOREFRONT_CATEGORIES.includes(c as (typeof CANONICAL_STOREFRONT_CATEGORIES)[number]))
      .sort((a, b) => a.localeCompare(b));
    return [...canonical, ...extras];
  }, [storefrontProducts]);

  const brandsForCategory = useMemo(() => {
    if (!selectedCategory) return [];
    const set = new Set<string>();
    for (const p of storefrontProducts) {
      if (!matchesStorefrontCategory(p, selectedCategory)) continue;
      const brand = getProductFilterBrand(p);
      if (brand) set.add(brand);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [selectedCategory, storefrontProducts]);

  const countForCategory = (category: string) =>
    storefrontProducts.filter((p) => matchesStorefrontCategory(p, category)).length;

  const countForBrand = (brand: string) =>
    storefrontProducts.filter((p) => {
      if (!selectedCategory) return false;
      if (!matchesStorefrontCategory(p, selectedCategory)) return false;
      return getProductFilterBrand(p) === brand;
    }).length;

  return { categories, brandsForCategory, countForCategory, countForBrand };
}

export function MobileProductBrowseNav({
  step,
  selectedCategory,
  onOpenCategories,
  onSelectCategory,
  onBackToMenu,
  onBackToCategories,
  onCloseMenu,
  triggerClassName,
}: MobileProductBrowseNavProps) {
  const navigate = useNavigate();
  const { categories, brandsForCategory, countForCategory, countForBrand } =
    useMobileProductBrowseData(selectedCategory);

  const goToProducts = (category: string, brand?: string) => {
    const params = new URLSearchParams();
    params.set("category", category);
    if (brand) params.set("brand", brand);
    navigate(`/products?${params.toString()}`);
    onCloseMenu();
  };

  if (step === null) {
    return (
      <button
        type="button"
        onClick={onOpenCategories}
        className={cn(
          "w-full flex items-center justify-between text-elegant text-sm hover:text-primary transition-all duration-300 py-2 border-b border-border/50 text-left",
          triggerClassName
        )}
      >
        <span>Products</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </button>
    );
  }

  if (step === "categories") {
    return (
      <div className="flex flex-col gap-1 -mt-2">
        <button
          type="button"
          onClick={onBackToMenu}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary py-2 mb-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to menu
        </button>
        <p className="text-elegant text-lg font-medium mb-3">Choose a category</p>
        <button
          type="button"
          onClick={() => {
            navigate("/products");
            onCloseMenu();
          }}
          className="w-full text-left text-sm py-2.5 px-3 rounded-lg hover:bg-muted/60 transition-colors border border-border/50 mb-2"
        >
          All products
        </button>
        <div className="flex flex-col gap-0.5 max-h-[min(60vh,420px)] overflow-y-auto overscroll-y-contain">
          {categories.map((category) => {
            const count = countForCategory(category);
            if (count === 0) return null;
            return (
              <button
                key={category}
                type="button"
                onClick={() => onSelectCategory(category)}
                className="w-full flex items-center justify-between gap-2 text-sm py-2.5 px-3 rounded-lg hover:bg-muted/60 transition-colors text-left"
              >
                <span className="text-elegant">{category}</span>
                <span className="flex items-center gap-1.5 shrink-0 text-muted-foreground text-xs">
                  {count}
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 -mt-2">
      <button
        type="button"
        onClick={onBackToCategories}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary py-2 mb-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Categories
      </button>
      <p className="text-elegant text-lg font-medium mb-1">{selectedCategory}</p>
      <p className="text-xs text-muted-foreground mb-3">Choose a brand</p>
      <button
        type="button"
        onClick={() => selectedCategory && goToProducts(selectedCategory)}
        className="w-full text-left text-sm py-2.5 px-3 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/15 transition-colors border border-primary/20 mb-2"
      >
        All brands in {selectedCategory}
      </button>
      <div className="flex flex-col gap-0.5 max-h-[min(55vh,380px)] overflow-y-auto overscroll-y-contain">
        {brandsForCategory.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 px-1">No brands found — try &quot;All brands&quot; above.</p>
        ) : (
          brandsForCategory.map((brand) => (
            <button
              key={brand}
              type="button"
              onClick={() => selectedCategory && goToProducts(selectedCategory, brand)}
              className="w-full flex items-center justify-between gap-2 text-sm py-2.5 px-3 rounded-lg hover:bg-muted/60 transition-colors text-left"
            >
              <span className="text-elegant">{brand}</span>
              <span className="text-xs text-muted-foreground shrink-0">{countForBrand(brand)}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
