import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Grid3x3, List, Battery, Smartphone, Filter } from "lucide-react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { phoneAccessories, getProductsByCategory } from "@/data/products";
import { greenLionProducts } from "@/data/greenLionProducts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Accessories = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");

  // Get brand from URL params if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const brandParam = urlParams.get("brand");
    if (brandParam) {
      setSelectedBrand(brandParam);
    }
  }, []);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Combine all accessory products (existing + Green Lion)
  // Exclude Audio, Gaming, and Wearables categories
  const allAccessoryProducts = [
    // Filter phoneAccessories to exclude Audio, Gaming, and Wearables
    ...phoneAccessories
      .filter((product) => {
        const category = product.category?.toLowerCase();
        // Exclude Audio, Gaming, and Wearables
        return category !== "audio" && 
               category !== "gaming" && 
               category !== "wearables";
      })
      .map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        images: [product.image], // Convert single image to array for consistency
        rating: product.rating,
        category: product.category,
        brand: product.brand || "Other",
      })),
    // Filter Green Lion products to exclude Audio, Gaming, and Wearables
    ...greenLionProducts
      .filter((product) => {
        // Exclude if it has Audio, Gaming, or Wearables in secondary categories
        const hasAudio = product.secondaryCategories?.some(
          (cat) => cat.toLowerCase() === "audio" || 
                   cat.toLowerCase() === "headphones" || 
                   cat.toLowerCase() === "earbuds" || 
                   cat.toLowerCase() === "speakers" ||
                   cat.toLowerCase() === "neckbands"
        );
        const hasGaming = product.secondaryCategories?.some(
          (cat) => cat.toLowerCase() === "gaming"
        );
        const hasWearables = product.secondaryCategories?.some(
          (cat) => cat.toLowerCase() === "wearables" || 
                   cat.toLowerCase() === "smartwatches" ||
                   cat.toLowerCase() === "watch"
        );
        
        // Also check product name for audio/gaming/wearable keywords
        const nameLower = product.name.toLowerCase();
        const isAudioProduct = nameLower.includes("earbud") || 
                              nameLower.includes("headphone") || 
                              nameLower.includes("speaker") || 
                              nameLower.includes("neckband") ||
                              nameLower.includes("river") ||
                              nameLower.includes("manchester") ||
                              nameLower.includes("porto") ||
                              nameLower.includes("jupiter") ||
                              nameLower.includes("rhythm") ||
                              nameLower.includes("echo") ||
                              nameLower.includes("sevilla");
        const isGamingProduct = nameLower.includes("gaming");
        const isWearableProduct = nameLower.includes("watch") || 
                                 nameLower.includes("smartwatch") ||
                                 nameLower.includes("track fit") ||
                                 (nameLower.includes("ultimate") && (nameLower.includes("46mm") || nameLower.includes("41"))) ||
                                 nameLower.includes("active 49");
        
        // Only include if it's NOT audio, gaming, or wearable
        return !hasAudio && !hasGaming && !hasWearables && 
               !isAudioProduct && !isGamingProduct && !isWearableProduct;
      })
      .map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0], // Use first image for grid view
        images: product.images, // Pass full images array for hover switching
        rating: product.rating,
        category: product.category,
        brand: product.brand,
      })),
  ];

  // Get all unique brands for the filter
  const brands = Array.from(
    new Set(allAccessoryProducts.map((p: any) => p.brand || "Other"))
  ).sort();

  // Helper function to check if product is Green Lion
  const isGreenLionProduct = (product: any) => {
    return product.id >= 5000 || product.brand === "Green Lion" || product.name?.startsWith("Green Lion");
  };

  // Filter products based on category and brand
  const getFilteredProducts = () => {
    let products = allAccessoryProducts;

    // Filter by category
    if (selectedCategory !== "all") {
      products = products.filter((product: any) => {
        const category = product.category?.toLowerCase();
        return category === selectedCategory;
      });
    }

    // Filter by brand
    if (selectedBrand !== "all") {
      products = products.filter((product: any) => {
        const brand = product.brand || "Other";
        return brand === selectedBrand;
      });
    }

    // Always sort to put Green Lion products first
    products.sort((a: any, b: any) => {
      const aIsGreenLion = isGreenLionProduct(a);
      const bIsGreenLion = isGreenLionProduct(b);
      
      // Green Lion products first
      if (aIsGreenLion && !bIsGreenLion) return -1;
      if (!aIsGreenLion && bIsGreenLion) return 1;
      
      // Within same type, sort by rating (high to low)
      return (b.rating || 0) - (a.rating || 0);
    });

    return products;
  };

  const filteredProducts = getFilteredProducts();

  return (
    <div className="min-h-screen bg-background no-horizontal-scroll overflow-x-hidden">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12"
        >
          <h1 className="text-elegant text-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4">Accessories</h1>
          <p className="text-muted-foreground font-light text-sm sm:text-base">
            Discover our complete collection of premium accessories from top brands like Green Lion, Apple, Hoco, and more.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 sm:mb-8 overflow-x-auto scrollbar-hide"
        >
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full max-w-2xl grid-cols-3 h-auto p-1 gap-1 sm:gap-0">
              <TabsTrigger value="all" className="text-elegant text-[10px] sm:text-xs px-2 sm:px-4 py-2">
                <span className="hidden sm:inline">All Products</span>
                <span className="sm:hidden">All</span>
              </TabsTrigger>
              <TabsTrigger value="charging" className="text-elegant text-[10px] sm:text-xs px-2 sm:px-4 py-2">
                <Battery className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Charging</span>
              </TabsTrigger>
              <TabsTrigger value="accessories" className="text-elegant text-[10px] sm:text-xs px-2 sm:px-4 py-2">
                <Smartphone className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Accessories</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Brand Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4 sm:mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
              <span className="text-xs sm:text-sm text-elegant whitespace-nowrap">Filter by Brand:</span>
            </div>
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="w-full sm:w-[200px] h-9 sm:h-10 text-xs sm:text-sm">
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* View Mode Toggle and Results Count */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6"
        >
          <p className="text-xs sm:text-sm text-muted-foreground">
            Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="text-elegant h-8 w-8 sm:h-9 sm:w-9 p-0"
              aria-label="Grid view"
            >
              <Grid3x3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="text-elegant h-8 w-8 sm:h-9 sm:w-9 p-0"
              aria-label="List view"
            >
              <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Products Grid/List */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
            className={`grid gap-2 sm:gap-3 md:gap-4 lg:gap-6 ${
            viewMode === "grid"
              ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              : "grid-cols-1"
          }`}
        >
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard {...product} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base text-muted-foreground">No products found in this category.</p>
            </div>
          )}
        </motion.div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 sm:py-16"
          >
            <Smartphone className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-elegant text-lg sm:text-xl mb-2">No products available</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-4">
              We're working on adding more products to this category.
            </p>
            <Button onClick={() => setSelectedCategory("all")} className="text-elegant text-xs sm:text-sm">
              View All Products
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Accessories;



