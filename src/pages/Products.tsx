import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Grid3x3, List, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "react-router-dom";
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
import { phoneAccessories, wearablesProducts } from "@/data/products";

const Products = () => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<string>("default");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Get all real products from products.ts (including wearables)
  const allProducts = [...phoneAccessories, ...wearablesProducts];

  // Get unique categories from real products
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(allProducts.map(p => p.category)));
    return uniqueCategories.sort();
  }, [allProducts]);

  // Get unique brands from product names (extract brand names)
  const brands = useMemo(() => {
    const brandSet = new Set<string>();
    allProducts.forEach(product => {
      const name = product.name.toLowerCase();
      if (name.includes("apple")) brandSet.add("Apple");
      if (name.includes("samsung")) brandSet.add("Samsung");
      if (name.includes("jbl")) brandSet.add("JBL");
      if (name.includes("hoco")) brandSet.add("Hoco");
      if (name.includes("dobe")) brandSet.add("Dobe");
      if (name.includes("foneng")) brandSet.add("Foneng");
      if (name.includes("borofone")) brandSet.add("BOROFONE");
      if (name.includes("galaxy")) brandSet.add("Samsung");
      if (name.includes("kakusiga")) brandSet.add("Kakusiga");
    });
    return Array.from(brandSet).sort();
  }, [allProducts]);

  // Helper to extract brand name from product name
  const extractBrand = (name: string): string | null => {
    const lower = name.toLowerCase();
    if (lower.includes("apple")) return "Apple";
    if (lower.includes("samsung")) return "Samsung";
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
      
      // Brand filter
      const productBrand = extractBrand(product.name);
      const brandMatch = selectedBrands.length === 0 || (productBrand !== null && selectedBrands.includes(productBrand));
      
      return categoryMatch && brandMatch;
    });

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
        // Sort by ID descending (newer products have higher IDs)
        filtered.sort((a, b) => b.id - a.id);
        break;
      default:
        // Default: sort by popularity (rating)
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
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
    <div className="min-h-screen no-horizontal-scroll overflow-x-hidden">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
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

        <div className="grid lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {/* Filters Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
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
            className="lg:col-span-3"
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
              <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                {filteredAndSortedProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProductCard {...product} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No products found matching your filters.</p>
                <Button onClick={handleClearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Promotional Banner */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 bg-accent text-accent-foreground rounded-sm p-8 text-center"
            >
              <p className="text-elegant text-xl mb-2">⚡ Top Picks in Smart Accessories</p>
              <p className="text-sm font-light mb-4">Grab Yours Today!</p>
              <Button variant="outline" className="text-elegant border-accent-foreground text-accent-foreground hover:bg-accent-foreground hover:text-accent">
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
