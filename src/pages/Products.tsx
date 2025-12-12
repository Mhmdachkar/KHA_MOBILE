import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Grid3x3, List, SlidersHorizontal, Filter } from "lucide-react";
import { useLocation, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
import { phoneAccessories, wearablesProducts, smartphoneProducts, tabletProducts, iphoneCases, gamingConsoles } from "@/data/products";
import { greenLionProducts } from "@/data/greenLionProducts";

const Products = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<string>("default");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

  // Get brand from URL params if present
  useEffect(() => {
    const brandParam = searchParams.get("brand");
    if (brandParam && !selectedBrands.includes(brandParam)) {
      setSelectedBrands([brandParam]);
    }
  }, [searchParams, selectedBrands]);

  // Scroll to top whenever this page or its query changes (handles navigation from brand cards)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname, location.search]);

  // Get all real products from products.ts (including wearables + Green Lion)
  const allProducts = [
    ...phoneAccessories.map(p => ({
      ...p,
      images: [p.image]
    })),
    ...wearablesProducts.map(p => ({
      ...p,
      images: [p.image]
    })),
    ...smartphoneProducts.map(p => ({
      ...p,
      images: p.images && p.images.length > 0 ? p.images : [p.image]
    })),
    ...tabletProducts.map(p => ({
      ...p,
      images: p.images && p.images.length > 0 ? p.images : [p.image]
    })),
    ...iphoneCases.map(p => ({
      ...p,
      images: p.images && p.images.length > 0 ? p.images : [p.image]
    })),
    ...gamingConsoles.map(p => ({
      ...p,
      images: p.images && p.images.length > 0 ? p.images : [p.image]
    })),
    ...greenLionProducts.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.images[0],
      images: p.images,
      rating: p.rating,
      category: p.category,
      brand: p.brand,
      description: p.description,
      title: p.title,
      isPreorder: p.isPreorder
    }))
  ];

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
        const normalizedName = product.name.toLowerCase();
        const normalizedTitle = product.title.toLowerCase();
        const normalizedCategory = product.category.toLowerCase();
        const normalizedDescription = product.description.toLowerCase();

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

      // Category filter
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category);

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

      return categoryMatch && brandMatch;
    });

    // Helper function to check if product is Green Lion
    const isGreenLionProduct = (product: any) => {
      return product.id >= 5000 || product.brand === "Green Lion" || product.name?.startsWith("Green Lion");
    };

    // Sort products - Always put Green Lion products first
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => {
          const aIsGreenLion = isGreenLionProduct(a);
          const bIsGreenLion = isGreenLionProduct(b);

          // Green Lion products first, then by price
          if (aIsGreenLion && !bIsGreenLion) return -1;
          if (!aIsGreenLion && bIsGreenLion) return 1;

          return a.price - b.price;
        });
        break;
      case "price-high":
        filtered.sort((a, b) => {
          const aIsGreenLion = isGreenLionProduct(a);
          const bIsGreenLion = isGreenLionProduct(b);

          // Green Lion products first, then by price
          if (aIsGreenLion && !bIsGreenLion) return -1;
          if (!aIsGreenLion && bIsGreenLion) return 1;

          return b.price - a.price;
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

          return b.id - a.id;
        });
        break;
      default:
        // Default: Sort by price (highest to lowest)
        filtered.sort((a, b) => {
          const aIsGreenLion = isGreenLionProduct(a);
          const bIsGreenLion = isGreenLionProduct(b);

          // Green Lion products first
          if (aIsGreenLion && !bIsGreenLion) return -1;
          if (!aIsGreenLion && bIsGreenLion) return 1;

          // Then by price (highest to lowest)
          return b.price - a.price;
        });
        break;
    }

    return filtered;
  }, [allProducts, sortBy, selectedCategories, selectedBrands, searchQuery]);

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
  };

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12 max-w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8 md:mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-elegant text-2xl sm:text-3xl md:text-4xl"
          >
            Shop All Products
          </motion.h1>
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <span>Search: "{searchQuery}"</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  // Remove search param from URL
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete("search");
                  window.history.replaceState({}, "", `${window.location.pathname}${newParams.toString() ? `?${newParams.toString()}` : ""}`);
                }}
                className="h-6 px-2 text-xs"
              >
                Clear
              </Button>
            </motion.div>
          )}
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-4 flex items-center justify-between gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>Filter products by category, brand, and more</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-elegant text-base">Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-elegant text-xs"
                    onClick={handleClearFilters}
                  >
                    Clear All
                  </Button>
                </div>

                {/* Category */}
                <div>
                  <h4 className="text-elegant text-sm mb-3">Category</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mobile-category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => handleCategoryToggle(category)}
                        />
                        <Label
                          htmlFor={`mobile-category-${category}`}
                          className="text-sm font-light cursor-pointer"
                        >
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Brand */}
                <div>
                  <h4 className="text-elegant text-sm mb-3">Brand</h4>
                  <div className="space-y-2">
                    {brands.map((brand) => (
                      <div key={brand} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mobile-brand-${brand}`}
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={() => handleBrandToggle(brand)}
                        />
                        <Label
                          htmlFor={`mobile-brand-${brand}`}
                          className="text-sm font-light cursor-pointer"
                        >
                          {brand}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <h4 className="text-elegant text-sm mb-3">Availability</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="mobile-in-stock" defaultChecked />
                      <Label
                        htmlFor="mobile-in-stock"
                        className="text-sm font-light cursor-pointer"
                      >
                        In Stock
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="mobile-out-of-stock" />
                      <Label
                        htmlFor="mobile-out-of-stock"
                        className="text-sm font-light cursor-pointer"
                      >
                        Out of Stock
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <h4 className="text-elegant text-sm mb-3">Minimum Rating</h4>
                  <div className="space-y-3">
                    {[5, 4, 3, 2].map((rating) => (
                      <div key={rating} className="flex items-center space-x-2">
                        <Checkbox id={`mobile-rating-${rating}`} />
                        <Label
                          htmlFor={`mobile-rating-${rating}`}
                          className="text-sm font-light cursor-pointer flex items-center gap-1"
                        >
                          {rating}+ ⭐
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-9 w-9 p-0"
              aria-label="Grid view"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-9 w-9 p-0"
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 w-full">
          {/* Filters Sidebar - Hidden on mobile, visible on lg+ */}
          <motion.aside
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:block lg:col-span-1"
          >
            <div className="sticky top-20 sm:top-24 space-y-6 sm:space-y-8">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-elegant text-base sm:text-lg">Filters</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-elegant text-xs"
                  onClick={handleClearFilters}
                >
                  Clear All
                </Button>
              </div>

              {/* Category */}
              <div>
                <h3 className="text-elegant text-xs sm:text-sm mb-3 sm:mb-4">Category</h3>
                <div className="space-y-2 sm:space-y-3">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />
                      <Label
                        htmlFor={category}
                        className="text-sm font-light cursor-pointer"
                      >
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brand */}
              <div>
                <h3 className="text-elegant text-xs sm:text-sm mb-3 sm:mb-4">Brand</h3>
                <div className="space-y-2 sm:space-y-3">
                  {brands.map((brand) => (
                    <div key={brand} className="flex items-center space-x-2">
                      <Checkbox
                        id={brand}
                        checked={selectedBrands.includes(brand)}
                        onCheckedChange={() => handleBrandToggle(brand)}
                      />
                      <Label
                        htmlFor={brand}
                        className="text-sm font-light cursor-pointer"
                      >
                        {brand}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <h3 className="text-elegant text-xs sm:text-sm mb-3 sm:mb-4">Availability</h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="in-stock" defaultChecked />
                    <Label
                      htmlFor="in-stock"
                      className="text-sm font-light cursor-pointer"
                    >
                      In Stock
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="out-of-stock" />
                    <Label
                      htmlFor="out-of-stock"
                      className="text-sm font-light cursor-pointer"
                    >
                      Out of Stock
                    </Label>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div>
                <h3 className="text-elegant text-sm mb-4">Minimum Rating</h3>
                <div className="space-y-3">
                  {[5, 4, 3, 2].map((rating) => (
                    <div key={rating} className="flex items-center space-x-2">
                      <Checkbox id={`rating-${rating}`} />
                      <Label
                        htmlFor={`rating-${rating}`}
                        className="text-sm font-light cursor-pointer flex items-center gap-1"
                      >
                        {rating}+ ⭐
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Product Grid */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full lg:col-span-3"
          >
            {/* Controls */}
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm text-muted-foreground">
                Showing {filteredAndSortedProducts.length} of {allProducts.length} products
              </p>
              <div className="flex items-center gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] text-elegant text-xs">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Popular</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="name">Name: A-Z</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products */}
            {filteredAndSortedProducts.length > 0 ? (
              <div className={`grid gap-2 sm:gap-3 md:gap-4 lg:gap-6 w-full ${viewMode === "grid" ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "grid-cols-1"}`}>
                {filteredAndSortedProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      title={product.title}
                      price={product.price}
                      image={product.image}
                      images={product.images || [product.image]}
                      rating={product.rating}
                      category={product.category}
                      colors={product.colors}
                      isPreorder={product.isPreorder}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <p className="text-sm sm:text-base text-muted-foreground mb-4">No products found matching your filters.</p>
                <Button onClick={handleClearFilters} variant="outline" className="text-xs sm:text-sm">
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Promotional Banner */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8 sm:mt-10 md:mt-12 bg-white border border-primary/20 rounded-sm p-6 sm:p-8 text-center"
            >
              <p className="text-elegant text-lg sm:text-xl md:text-2xl mb-2 text-green-600 font-medium">⚡ Top Picks in Smart Accessories</p>
              <p className="text-xs sm:text-sm md:text-base font-light mb-4 sm:mb-6 text-green-500">Grab Yours Today!</p>
              <Button
                variant="outline"
                className="text-elegant border-primary text-primary hover:bg-primary/10 min-h-[44px] sm:min-h-[48px] text-xs sm:text-sm md:text-base"
                style={{ touchAction: 'manipulation' }}
              >
                Shop Accessories
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Products;
