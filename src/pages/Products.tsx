import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Grid3x3, List, Filter, X, ChevronDown, ChevronUp, SearchX, Sparkles, Search } from "lucide-react";
import { useLocation, useSearchParams } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCatalog } from "@/context/CatalogContext";
import { Skeleton } from "@/components/ui/skeleton";
import { isGreenLionProduct } from "@/lib/catalogProduct";
import { isOutOfStock } from "@/lib/addToCartPolicy";
import {
  getDistinctBrandsFromProducts,
  getDistinctCategoriesFromProducts,
  productMatchesBrandFilters,
  productMatchesCategoryFilters,
} from "@/lib/catalogFilters";
import {
  availabilityToStockFlags,
  buildProductsSearchParams,
  parseProductsFiltersFromSearchParams,
  stockFlagsToAvailability,
} from "@/lib/productsPageUrl";

const FILTER_SECTION_STORAGE_KEY = "products-filter-sections";

function readSectionOpen(title: string, defaultOpen: boolean): boolean {
  try {
    const stored = JSON.parse(localStorage.getItem(FILTER_SECTION_STORAGE_KEY) || "{}") as Record<
      string,
      boolean
    >;
    return stored[title] ?? defaultOpen;
  } catch {
    return defaultOpen;
  }
}

function writeSectionOpen(title: string, open: boolean) {
  try {
    const stored = JSON.parse(localStorage.getItem(FILTER_SECTION_STORAGE_KEY) || "{}") as Record<
      string,
      boolean
    >;
    stored[title] = open;
    localStorage.setItem(FILTER_SECTION_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    /* ignore */
  }
}

const SORT_OPTIONS = [
  { value: "default", label: "Featured" },
  { value: "price-low", label: "Price: Low → High" },
  { value: "price-high", label: "Price: High → Low" },
  { value: "rating", label: "Top Rated" },
  { value: "name", label: "A → Z" },
  { value: "newest", label: "Newest" },
] as const;

const FilterSection = ({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(() => readSectionOpen(title, defaultOpen));
  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      writeSectionOpen(title, next);
      return next;
    });
  };
  return (
    <div className="border-b border-border/50 pb-4">
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center justify-between py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
      >
        {title}
        {open ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
};

const PillGroup = ({
  items,
  selected,
  onToggle,
}: {
  items: string[];
  selected: string[];
  onToggle: (item: string) => void;
}) => (
  <div className="flex flex-wrap gap-1.5">
    {items.map((item) => {
      const active = selected.includes(item);
      return (
        <button
          key={item}
          type="button"
          aria-pressed={active}
          onClick={() => onToggle(item)}
          className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all border ${
            active
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/40 text-muted-foreground border-border/60 hover:border-primary/50 hover:text-foreground"
          }`}
        >
          {item}
        </button>
      );
    })}
  </div>
);

interface SidebarFiltersProps {
  activeFilterCount: number;
  matchCount: number;
  categories: string[];
  brands: string[];
  selectedCategories: string[];
  selectedBrands: string[];
  filterInStock: boolean;
  filterOutOfStock: boolean;
  minRating: number | null;
  onClearAll: () => void;
  onCategoryToggle: (c: string) => void;
  onBrandToggle: (b: string) => void;
  onInStockToggle: () => void;
  onOutOfStockToggle: () => void;
  onMinRatingChange: (r: number | null) => void;
}

const SidebarFilters = ({
  activeFilterCount,
  matchCount,
  categories,
  brands,
  selectedCategories,
  selectedBrands,
  filterInStock,
  filterOutOfStock,
  minRating,
  onClearAll,
  onCategoryToggle,
  onBrandToggle,
  onInStockToggle,
  onOutOfStockToggle,
  onMinRatingChange,
}: SidebarFiltersProps) => (
  <div className="space-y-0">
    <div className="flex items-center justify-between py-2 mb-2">
      <div>
        <span className="text-sm font-semibold text-foreground">Filters</span>
        <p className="text-[11px] text-muted-foreground mt-0.5">{matchCount} products match</p>
      </div>
      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
        >
          <X className="h-3 w-3" /> Clear all
        </button>
      )}
    </div>

    <FilterSection title="Category">
      <PillGroup items={categories} selected={selectedCategories} onToggle={onCategoryToggle} />
    </FilterSection>

    <FilterSection title="Brand">
      <PillGroup items={brands} selected={selectedBrands} onToggle={onBrandToggle} />
    </FilterSection>

    <FilterSection title="Availability">
      <div className="flex flex-wrap gap-1.5">
        {[
          { label: "In Stock", active: filterInStock, toggle: onInStockToggle },
          { label: "Out of Stock", active: filterOutOfStock, toggle: onOutOfStockToggle },
        ].map(({ label, active, toggle }) => (
          <button
            key={label}
            type="button"
            onClick={toggle}
            className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all border ${
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/40 text-muted-foreground border-border/60 hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </FilterSection>

    <FilterSection title="Min Rating" defaultOpen={false}>
      <div className="flex flex-wrap gap-1.5">
        {[5, 4, 3, 2].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onMinRatingChange(minRating === r ? null : r)}
            className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all border ${
              minRating === r
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/40 text-muted-foreground border-border/60 hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {r}★+
          </button>
        ))}
      </div>
    </FilterSection>
  </div>
);

function productIsOutOfStock(product: {
  stockQuantity?: number | null;
  colors?: { stock?: string }[];
}): boolean {
  return (
    isOutOfStock(product.stockQuantity) ||
    Boolean(
      product.colors?.length &&
        product.colors.every((c) => String(c.stock || "").toLowerCase() === "out of stock")
    )
  );
}

const Products = () => {
  const { storefrontProducts, catalogLoaded, lastError } = useCatalog();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const skipUrlWrite = useRef(false);
  const prevSearchRef = useRef(location.search);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterInStock, setFilterInStock] = useState(true);
  const [filterOutOfStock, setFilterOutOfStock] = useState(false);
  const [minRating, setMinRating] = useState<number | null>(null);

  useEffect(() => {
    const parsed = parseProductsFiltersFromSearchParams(searchParams);
    skipUrlWrite.current = true;
    setSearchQuery(parsed.searchQuery);
    setSelectedCategories(parsed.selectedCategories);
    setSelectedBrands(parsed.selectedBrands);
    setSortBy(parsed.sortBy);
    setMinRating(parsed.minRating);
    const stock = availabilityToStockFlags(parsed.availability);
    setFilterInStock(stock.filterInStock);
    setFilterOutOfStock(stock.filterOutOfStock);
  }, [searchParams]);

  const syncFiltersToUrl = useCallback(
    (overrides?: Partial<{
      searchQuery: string;
      selectedCategories: string[];
      selectedBrands: string[];
      sortBy: string;
      filterInStock: boolean;
      filterOutOfStock: boolean;
      minRating: number | null;
    }>) => {
      const state = {
        searchQuery: overrides?.searchQuery ?? searchQuery,
        selectedCategories: overrides?.selectedCategories ?? selectedCategories,
        selectedBrands: overrides?.selectedBrands ?? selectedBrands,
        sortBy: overrides?.sortBy ?? sortBy,
        availability: stockFlagsToAvailability(
          overrides?.filterInStock ?? filterInStock,
          overrides?.filterOutOfStock ?? filterOutOfStock
        ),
        minRating: overrides?.minRating ?? minRating,
      };
      const next = buildProductsSearchParams(state);
      if (next.toString() !== searchParams.toString()) {
        setSearchParams(next, { replace: true });
      }
    },
    [
      searchQuery,
      selectedCategories,
      selectedBrands,
      sortBy,
      filterInStock,
      filterOutOfStock,
      minRating,
      searchParams,
      setSearchParams,
    ]
  );

  useEffect(() => {
    if (skipUrlWrite.current) {
      skipUrlWrite.current = false;
      return;
    }
    syncFiltersToUrl();
  }, [
    searchQuery,
    selectedCategories,
    selectedBrands,
    sortBy,
    filterInStock,
    filterOutOfStock,
    minRating,
    syncFiltersToUrl,
  ]);

  useEffect(() => {
    if (prevSearchRef.current !== location.search) {
      prevSearchRef.current = location.search;
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  }, [location.pathname, location.search]);

  const allProducts = storefrontProducts;

  const categories = useMemo(
    () => getDistinctCategoriesFromProducts(allProducts),
    [allProducts]
  );

  const brands = useMemo(() => getDistinctBrandsFromProducts(allProducts), [allProducts]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = allProducts.filter((product) => {
      if (searchQuery.trim()) {
        const normalizedQuery = searchQuery.toLowerCase().trim();
        const queryWords = normalizedQuery.split(/\s+/).filter((word) => word.length > 0);
        const normalizedName = (product.name || "").toLowerCase();
        const normalizedTitle = (product.title || product.name || "").toLowerCase();
        const normalizedCategory = (product.category || "").toLowerCase();
        const normalizedDescription = (product.description || "").toLowerCase();
        const searchableText = `${normalizedName} ${normalizedTitle} ${normalizedCategory} ${normalizedDescription}`;
        const allWordsMatch =
          queryWords.length > 0 &&
          queryWords.every(
            (word) =>
              normalizedName.includes(word) ||
              normalizedTitle.includes(word) ||
              normalizedCategory.includes(word) ||
              normalizedDescription.includes(word) ||
              searchableText.includes(word)
          );
        const exactPhraseMatch =
          normalizedName.includes(normalizedQuery) ||
          normalizedTitle.includes(normalizedQuery) ||
          normalizedCategory.includes(normalizedQuery) ||
          normalizedDescription.includes(normalizedQuery) ||
          searchableText.includes(normalizedQuery);
        if (!allWordsMatch && !exactPhraseMatch) return false;
      }

      if (!productMatchesCategoryFilters(product, selectedCategories)) return false;
      if (!productMatchesBrandFilters(product, selectedBrands)) return false;

      const oos = productIsOutOfStock(product);
      if (filterInStock && !filterOutOfStock && oos) return false;
      if (filterOutOfStock && !filterInStock && !oos) return false;
      if (minRating != null && (product.rating ?? 0) < minRating) return false;

      return true;
    });

    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => {
          const aGl = isGreenLionProduct(a);
          const bGl = isGreenLionProduct(b);
          if (aGl && !bGl) return -1;
          if (!aGl && bGl) return 1;
          return a.displayPrice - b.displayPrice;
        });
        break;
      case "price-high":
        filtered.sort((a, b) => {
          const aGl = isGreenLionProduct(a);
          const bGl = isGreenLionProduct(b);
          if (aGl && !bGl) return -1;
          if (!aGl && bGl) return 1;
          return b.displayPrice - a.displayPrice;
        });
        break;
      case "rating":
        filtered.sort((a, b) => {
          const aGl = isGreenLionProduct(a);
          const bGl = isGreenLionProduct(b);
          if (aGl && !bGl) return -1;
          if (!aGl && bGl) return 1;
          return (b.rating || 0) - (a.rating || 0);
        });
        break;
      case "name":
        filtered.sort((a, b) => {
          const aGl = isGreenLionProduct(a);
          const bGl = isGreenLionProduct(b);
          if (aGl && !bGl) return -1;
          if (!aGl && bGl) return 1;
          return a.name.localeCompare(b.name);
        });
        break;
      case "newest":
        filtered.sort((a, b) => {
          const aGl = isGreenLionProduct(a);
          const bGl = isGreenLionProduct(b);
          if (aGl && !bGl) return -1;
          if (!aGl && bGl) return 1;
          return (b.dbId ?? b.id) - (a.dbId ?? a.id);
        });
        break;
      default:
        filtered.sort((a, b) => b.displayPrice - a.displayPrice);
        break;
    }

    return filtered;
  }, [
    allProducts,
    sortBy,
    selectedCategories,
    selectedBrands,
    searchQuery,
    filterInStock,
    filterOutOfStock,
    minRating,
  ]);

  const closeFilterSheet = () => setFilterSheetOpen(false);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
    closeFilterSheet();
  };

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
    closeFilterSheet();
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSortBy("default");
    setFilterInStock(true);
    setFilterOutOfStock(false);
    setMinRating(null);
    setSearchQuery("");
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const handleInStockToggle = () => setFilterInStock((v) => !v);
  const handleOutOfStockToggle = () => setFilterOutOfStock((v) => !v);

  const handleMinRatingChange = (r: number | null) => {
    setMinRating(r);
    closeFilterSheet();
  };

  const handleSortChange = (value: string) => setSortBy(value);

  const activeFilterCount =
    selectedCategories.length +
    selectedBrands.length +
    (filterOutOfStock ? 1 : 0) +
    (!filterInStock ? 1 : 0) +
    (minRating != null ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const availabilityLabel = useMemo(() => {
    if (filterInStock && filterOutOfStock) return "All stock";
    if (!filterInStock && filterOutOfStock) return "Out of stock";
    return null;
  }, [filterInStock, filterOutOfStock]);

  const sidebarProps: SidebarFiltersProps = {
    activeFilterCount,
    matchCount: filteredAndSortedProducts.length,
    categories,
    brands,
    selectedCategories,
    selectedBrands,
    filterInStock,
    filterOutOfStock,
    minRating,
    onClearAll: handleClearFilters,
    onCategoryToggle: handleCategoryToggle,
    onBrandToggle: handleBrandToggle,
    onInStockToggle: handleInStockToggle,
    onOutOfStockToggle: handleOutOfStockToggle,
    onMinRatingChange: handleMinRatingChange,
  };

  const emptyState = useMemo(() => {
    if (searchQuery.trim()) {
      return {
        title: "No search results",
        description: `We couldn't find products matching "${searchQuery.trim()}". Try different keywords or clear filters.`,
      };
    }
    if (selectedBrands.length === 1 && selectedCategories.length === 1) {
      return {
        title: "No products in this combination",
        description: `No ${selectedBrands[0]} products in ${selectedCategories[0]} with your current filters.`,
      };
    }
    if (selectedCategories.length === 1) {
      return {
        title: `No products in ${selectedCategories[0]}`,
        description: "Try another category or adjust availability filters.",
      };
    }
    if (filterInStock && !filterOutOfStock && activeFilterCount > 0) {
      return {
        title: "All matching products are out of stock",
        description: "Include out-of-stock items in filters to see more results.",
      };
    }
    return {
      title: "No products found",
      description: "Try adjusting your filters or search query.",
    };
  }, [
    searchQuery,
    selectedBrands,
    selectedCategories,
    filterInStock,
    filterOutOfStock,
    activeFilterCount,
  ]);

  const sortSelect = (triggerClass: string) => (
    <Select value={sortBy} onValueChange={handleSortChange}>
      <SelectTrigger className={triggerClass}>
        <SelectValue placeholder="Sort" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-full">
        {lastError && catalogLoaded && (
          <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
            Some catalog updates may be unavailable. Showing cached products.
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="w-full sm:w-auto">
            <motion.h1
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl sm:text-3xl font-semibold tracking-tight"
            >
              All Products
            </motion.h1>
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 mt-1 text-sm text-muted-foreground"
              >
                <span>
                  Results for "
                  <span className="text-foreground font-medium">{searchQuery}</span>"
                </span>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            )}
          </div>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/50"
          >
            {filteredAndSortedProducts.length} of {allProducts.length} products
          </motion.span>
        </div>

        <div className="lg:hidden mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl h-10"
              aria-label="Search products"
            />
          </div>
        </div>

        <div className="lg:hidden mb-4 flex items-center justify-between gap-3">
          <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-xl flex items-center gap-2 relative">
                <Filter className="h-3.5 w-3.5" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-medium">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[360px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  {filteredAndSortedProducts.length} products match your filters
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <SidebarFilters {...sidebarProps} />
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            {sortSelect("w-[150px] rounded-xl text-xs h-9")}
            <div className="flex items-center rounded-xl border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`h-9 w-9 flex items-center justify-center transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                aria-label="Grid view"
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`h-9 w-9 flex items-center justify-center border-l border-border transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[220px_1fr] gap-6 lg:gap-8 w-full">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <SidebarFilters {...sidebarProps} />
            </div>
          </aside>

          <div className="w-full min-w-0">
            <div className="hidden lg:flex items-center justify-between mb-5">
              <p className="text-xs text-muted-foreground">
                {filteredAndSortedProducts.length} product
                {filteredAndSortedProducts.length !== 1 ? "s" : ""}
                {activeFilterCount > 0 && " (filtered)"}
              </p>
              <div className="flex items-center gap-3">
                {sortSelect("w-[180px] rounded-xl text-xs h-9")}
                <div className="flex items-center rounded-xl border border-border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`h-9 w-9 flex items-center justify-center transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    aria-label="Grid view"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`h-9 w-9 flex items-center justify-center border-l border-border transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {activeFilterCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-1.5 mb-4"
                >
                  {selectedCategories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleCategoryToggle(c)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium hover:bg-primary/20 transition-colors"
                    >
                      {c} <X className="h-3 w-3" />
                    </button>
                  ))}
                  {selectedBrands.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => handleBrandToggle(b)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium hover:bg-primary/20 transition-colors"
                    >
                      {b} <X className="h-3 w-3" />
                    </button>
                  ))}
                  {filterInStock && !filterOutOfStock && (
                    <button
                      type="button"
                      onClick={handleInStockToggle}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium hover:bg-primary/20 transition-colors"
                    >
                      In stock <X className="h-3 w-3" />
                    </button>
                  )}
                  {!filterInStock && filterOutOfStock && (
                    <button
                      type="button"
                      onClick={handleOutOfStockToggle}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium hover:bg-primary/20 transition-colors"
                    >
                      Out of stock <X className="h-3 w-3" />
                    </button>
                  )}
                  {availabilityLabel && (
                    <button
                      type="button"
                      onClick={() => {
                        setFilterInStock(true);
                        setFilterOutOfStock(false);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium hover:bg-primary/20 transition-colors"
                    >
                      {availabilityLabel} <X className="h-3 w-3" />
                    </button>
                  )}
                  {minRating != null && (
                    <button
                      type="button"
                      onClick={() => setMinRating(null)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium hover:bg-primary/20 transition-colors"
                    >
                      {minRating}★+ <X className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-xs text-muted-foreground hover:text-primary px-2 py-1 underline"
                  >
                    Clear all
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {!catalogLoaded ? (
              <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[4/5] w-full rounded-xl" />
                ))}
              </div>
            ) : filteredAndSortedProducts.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={`grid gap-3 sm:gap-4 ${viewMode === "grid" ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
              >
                {filteredAndSortedProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={index < 12 ? { opacity: 0, y: 16 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index < 12 ? Math.min(index * 0.03, 0.3) : 0, duration: 0.3 }}
                  >
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      title={product.title}
                      price={product.displayPrice}
                      compareAtPrice={product.compareAtPrice}
                      image={product.image}
                      images={product.images || [product.image]}
                      rating={product.rating}
                      category={product.category}
                      colors={product.colors}
                      variants={product.variants}
                      sizes={product.sizes}
                      isPreorder={product.isPreorder}
                      showPreorderPrice={product.showPreorderPrice}
                      stockQuantity={product.stockQuantity}
                      surface={viewMode === "list" ? "list" : "grid"}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                  <SearchX className="h-8 w-8 text-muted-foreground/60" />
                </div>
                <h3 className="text-base font-semibold mb-1">{emptyState.title}</h3>
                <p className="text-sm text-muted-foreground mb-5 max-w-xs">{emptyState.description}</p>
                <Button onClick={handleClearFilters} variant="outline" className="rounded-xl">
                  Clear all filters
                </Button>
              </motion.div>
            )}

            {filteredAndSortedProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-10 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/90 to-primary p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-primary-foreground"
              >
                <div className="text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-widest opacity-80">
                      Top Picks
                    </span>
                  </div>
                  <p className="text-lg sm:text-xl font-semibold">Smart Accessories</p>
                  <p className="text-sm opacity-75 mt-0.5">Cables, chargers, cases & more</p>
                </div>
                <Button
                  variant="secondary"
                  className="rounded-xl font-medium shrink-0"
                  onClick={() => {
                    setSelectedCategories(["Accessories"]);
                    closeFilterSheet();
                  }}
                >
                  Shop Accessories
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
