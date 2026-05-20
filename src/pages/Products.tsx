import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Grid3x3, List, Filter, X, ChevronDown, ChevronUp, SearchX, Sparkles } from "lucide-react";
import { useLocation, useSearchParams } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
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
import { isGreenLionProduct, type StorefrontProduct } from "@/lib/catalogProduct";
import { isOutOfStock } from "@/lib/addToCartPolicy";

const FilterSection = ({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/50 pb-4">
      <button
        onClick={() => setOpen((o) => !o)}
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
      <span className="text-sm font-semibold text-foreground">Filters</span>
      {activeFilterCount > 0 && (
        <button
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

const Products = () => {
  const { storefrontProducts, catalogLoaded } = useCatalog();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<string>("default");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [filterInStock, setFilterInStock] = useState(true);
  const [filterOutOfStock, setFilterOutOfStock] = useState(false);
  const [minRating, setMinRating] = useState<number | null>(null);

  // URL params: brand, category, sort, search
  useEffect(() => {
    const brandParam = searchParams.get("brand");
    if (brandParam) setSelectedBrands([brandParam]);
    const categoryParam = searchParams.get("category");
    if (categoryParam) setSelectedCategories([categoryParam]);
    const sortParam = searchParams.get("sort");
    if (sortParam) setSortBy(sortParam);
    const searchParam = searchParams.get("search");
    if (searchParam != null) setSearchQuery(searchParam);
  }, [searchParams]);

  // Scroll to top whenever this page or its query changes (handles navigation from brand cards)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname, location.search]);

  const allProducts = storefrontProducts;

  // Get unique categories from real products
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(allProducts.map(p => p.category)));
    return uniqueCategories.sort();
  }, [allProducts]);

  // Get unique brands from product names (extract brand names) and product.brand field
  const brands = useMemo(() => {
    const brandSet = new Set<string>();
    allProducts.forEach(product => {
      // First check product.brand field
      if (product.brand) {
        brandSet.add(product.brand);
      }

      // Then check product name
      const name = product.name.toLowerCase();
      if (name.includes("green lion") || name.startsWith("green lion")) brandSet.add("Green Lion");
      if (name.includes("apple")) brandSet.add("Apple");
      if (name.includes("samsung")) brandSet.add("Samsung");
      if (name.includes("honor")) brandSet.add("Honor");
      if (name.includes("tecno")) brandSet.add("Tecno");
      if (name.startsWith("smart ")) brandSet.add("Smart");
      if (name.includes("jbl")) brandSet.add("JBL");
      if (name.includes("hoco")) brandSet.add("Hoco");
      if (name.includes("dobe")) brandSet.add("Dobe");
      if (name.includes("foneng")) brandSet.add("Foneng");
      if (name.includes("borofone")) brandSet.add("BOROFONE");
      if (name.includes("galaxy")) brandSet.add("Samsung");
      if (name.includes("kakusiga")) brandSet.add("Kakusiga");

      // Also check for Green Lion by ID
      if (product.id >= 5000) brandSet.add("Green Lion");
    });
    return Array.from(brandSet).sort();
  }, [allProducts]);

  // Helper to extract brand name from product name
  const extractBrand = (name: string): string | null => {
    const lower = name.toLowerCase();
    if (lower.includes("green lion") || lower.startsWith("green lion")) return "Green Lion";
    if (lower.includes("apple")) return "Apple";
    if (lower.includes("samsung")) return "Samsung";
    if (lower.includes("honor")) return "Honor";
    if (lower.includes("tecno")) return "Tecno";
    if (lower.startsWith("smart ")) return "Smart";
    if (lower.includes("jbl")) return "JBL";
    if (lower.includes("hoco")) return "Hoco";
    if (lower.includes("dobe")) return "Dobe";
    if (lower.includes("foneng")) return "Foneng";
    if (lower.includes("borofone")) return "BOROFONE";
    if (lower.includes("kakusiga")) return "Kakusiga";
    if (lower.includes("galaxy")) return "Samsung";
    return null;
  };

  // Update search query when URL param changes
  useEffect(() => {
    const urlSearch = searchParams.get("search");
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = allProducts.filter(product => {
      // Search filter (case-insensitive)
      if (searchQuery.trim()) {
        // Normalize query to lowercase for case-insensitive search
        const normalizedQuery = searchQuery.toLowerCase().trim();
        // Split query into words for better matching
        const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 0);

        // Normalize all product fields to lowercase for case-insensitive comparison
        const normalizedName = (product.name || "").toLowerCase();
        const normalizedTitle = (product.title || product.name || "").toLowerCase();
        const normalizedCategory = (product.category || "").toLowerCase();
        const normalizedDescription = (product.description || "").toLowerCase();

        // Create a comprehensive searchable text (all normalized to lowercase)
        const searchableText = `${normalizedName} ${normalizedTitle} ${normalizedCategory} ${normalizedDescription}`;

        // Check if all query words are present in any of the searchable fields
        const allWordsMatch = queryWords.length > 0 && queryWords.every(word =>
          normalizedName.includes(word) ||
          normalizedTitle.includes(word) ||
          normalizedCategory.includes(word) ||
          normalizedDescription.includes(word) ||
          searchableText.includes(word)
        );

        // Also check for exact phrase match (normalized)
        const exactPhraseMatch = normalizedName.includes(normalizedQuery) ||
          normalizedTitle.includes(normalizedQuery) ||
          normalizedCategory.includes(normalizedQuery) ||
          normalizedDescription.includes(normalizedQuery) ||
          searchableText.includes(normalizedQuery);

        if (!allWordsMatch && !exactPhraseMatch) return false;
      }

      // Category filter - check both product.category and secondaryCategories
      const categoryMatch = selectedCategories.length === 0 ||
        selectedCategories.some(selectedCat =>
          product.category === selectedCat ||
          product.secondaryCategories?.includes(selectedCat)
        );

      // Brand filter - check both product.brand field and extracted brand from name
      const productBrand = product.brand || extractBrand(product.name);

      // For Green Lion, also check if name starts with "Green Lion"
      const isGreenLionBrand = product.brand === "Green Lion" ||
        product.name?.startsWith("Green Lion") ||
        product.id >= 5000; // Green Lion products have IDs >= 5000

      const brandMatch = selectedBrands.length === 0 ||
        (selectedBrands.some(selectedBrand => {
          // Special handling for Green Lion
          if (selectedBrand === "Green Lion" && isGreenLionBrand) {
            return true;
          }
          // For other brands, check exact match
          return productBrand !== null && productBrand === selectedBrand;
        }));

      const oos =
        isOutOfStock(product.stockQuantity) ||
        Boolean(
          product.colors?.length &&
            product.colors.every((c) => String(c.stock || "").toLowerCase() === "out of stock")
        );
      if (filterInStock && !filterOutOfStock && oos) return false;
      if (filterOutOfStock && !filterInStock && !oos) return false;

      if (minRating != null && (product.rating ?? 0) < minRating) return false;

      return categoryMatch && brandMatch;
    });

    // Sort products - Always put Green Lion products first
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => {
          const aIsGreenLion = isGreenLionProduct(a);
          const bIsGreenLion = isGreenLionProduct(b);

          // Green Lion products first, then by price
          if (aIsGreenLion && !bIsGreenLion) return -1;
          if (!aIsGreenLion && bIsGreenLion) return 1;

          return a.displayPrice - b.displayPrice;
        });
        break;
      case "price-high":
        filtered.sort((a, b) => {
          const aIsGreenLion = isGreenLionProduct(a);
          const bIsGreenLion = isGreenLionProduct(b);

          // Green Lion products first, then by price
          if (aIsGreenLion && !bIsGreenLion) return -1;
          if (!aIsGreenLion && bIsGreenLion) return 1;

          return b.displayPrice - a.displayPrice;
        });
        break;
      case "rating":
        filtered.sort((a, b) => {
          const aIsGreenLion = isGreenLionProduct(a);
          const bIsGreenLion = isGreenLionProduct(b);

          // Green Lion products first, then by rating
          if (aIsGreenLion && !bIsGreenLion) return -1;
          if (!aIsGreenLion && bIsGreenLion) return 1;

          return (b.rating || 0) - (a.rating || 0);
        });
        break;
      case "name":
        filtered.sort((a, b) => {
          const aIsGreenLion = isGreenLionProduct(a);
          const bIsGreenLion = isGreenLionProduct(b);

          // Green Lion products first, then by name
          if (aIsGreenLion && !bIsGreenLion) return -1;
          if (!aIsGreenLion && bIsGreenLion) return 1;

          return a.name.localeCompare(b.name);
        });
        break;
      case "newest":
        // Sort by ID descending (newer products have higher IDs), but Green Lion first
        filtered.sort((a, b) => {
          const aIsGreenLion = isGreenLionProduct(a);
          const bIsGreenLion = isGreenLionProduct(b);

          // Green Lion products first, then by ID
          if (aIsGreenLion && !bIsGreenLion) return -1;
          if (!aIsGreenLion && bIsGreenLion) return 1;

          return (b.dbId ?? b.id) - (a.dbId ?? a.id);
        });
        break;
      default:
        filtered.sort((a, b) => b.displayPrice - a.displayPrice);
        break;
    }

    return filtered;
  }, [allProducts, sortBy, selectedCategories, selectedBrands, searchQuery, filterInStock, filterOutOfStock, minRating]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSortBy("default");
    setFilterInStock(true);
    setFilterOutOfStock(false);
    setMinRating(null);
  };

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const activeFilterCount =
    selectedCategories.length + selectedBrands.length +
    (filterOutOfStock ? 1 : 0) + (!filterInStock ? 1 : 0) +
    (minRating != null ? 1 : 0);

  const sidebarProps: SidebarFiltersProps = {
    activeFilterCount,
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
    onInStockToggle: () => setFilterInStock((v) => !v),
    onOutOfStockToggle: () => setFilterOutOfStock((v) => !v),
    onMinRatingChange: setMinRating,
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-full">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
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
                <span>Results for "<span className="text-foreground font-medium">{searchQuery}</span>"</span>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete("search");
                    window.history.replaceState({}, "", `${window.location.pathname}${newParams.toString() ? `?${newParams.toString()}` : ""}`);
                  }}
                  className="text-muted-foreground hover:text-primary transition-colors"
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

        {/* Mobile toolbar */}
        <div className="lg:hidden mb-4 flex items-center justify-between gap-3">
          <Sheet>
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
                <SheetDescription>Narrow down products</SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <SidebarFilters {...sidebarProps} />
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px] rounded-xl text-xs h-9">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Price: High → Low</SelectItem>
                <SelectItem value="price-low">Price: Low → High</SelectItem>
                <SelectItem value="price-high">Price: High → Low</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="name">A → Z</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`h-9 w-9 flex items-center justify-center transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                aria-label="Grid view"
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
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
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <SidebarFilters {...sidebarProps} />
            </div>
          </aside>

          {/* Main content */}
          <div className="w-full min-w-0">
            {/* Desktop sort/view bar */}
            <div className="hidden lg:flex items-center justify-between mb-5">
              <p className="text-xs text-muted-foreground">
                {filteredAndSortedProducts.length} product{filteredAndSortedProducts.length !== 1 ? "s" : ""}
                {activeFilterCount > 0 && " (filtered)"}
              </p>
              <div className="flex items-center gap-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] rounded-xl text-xs h-9">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Price: High → Low</SelectItem>
                    <SelectItem value="price-low">Price: Low → High</SelectItem>
                    <SelectItem value="price-high">Price: High → Low</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                    <SelectItem value="name">A → Z</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center rounded-xl border border-border overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`h-9 w-9 flex items-center justify-center transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    aria-label="Grid view"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`h-9 w-9 flex items-center justify-center border-l border-border transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active filter pills row */}
            <AnimatePresence>
              {activeFilterCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-1.5 mb-4"
                >
                  {selectedCategories.map((c) => (
                    <button key={c} onClick={() => handleCategoryToggle(c)} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium hover:bg-primary/20 transition-colors">
                      {c} <X className="h-3 w-3" />
                    </button>
                  ))}
                  {selectedBrands.map((b) => (
                    <button key={b} onClick={() => handleBrandToggle(b)} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium hover:bg-primary/20 transition-colors">
                      {b} <X className="h-3 w-3" />
                    </button>
                  ))}
                  {minRating != null && (
                    <button onClick={() => setMinRating(null)} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium hover:bg-primary/20 transition-colors">
                      {minRating}★+ <X className="h-3 w-3" />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Products grid */}
            {!catalogLoaded ? (
              <div className={`grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4`}>
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
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.3 }}
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
                      surface="grid"
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
                <h3 className="text-base font-semibold mb-1">No products found</h3>
                <p className="text-sm text-muted-foreground mb-5 max-w-xs">
                  Try adjusting your filters or search query to find what you're looking for.
                </p>
                <Button onClick={handleClearFilters} variant="outline" className="rounded-xl">
                  Clear all filters
                </Button>
              </motion.div>
            )}

            {/* Promo banner */}
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
                    <span className="text-xs font-semibold uppercase tracking-widest opacity-80">Top Picks</span>
                  </div>
                  <p className="text-lg sm:text-xl font-semibold">Smart Accessories</p>
                  <p className="text-sm opacity-75 mt-0.5">Cables, chargers, cases & more</p>
                </div>
                <Button
                  variant="secondary"
                  className="rounded-xl font-medium shrink-0"
                  onClick={() => handleCategoryToggle("Accessories")}
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
