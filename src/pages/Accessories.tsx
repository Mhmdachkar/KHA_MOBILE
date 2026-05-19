import { useState, useEffect, useMemo } from "react";
import { useCatalog } from "@/context/CatalogContext";
import { motion } from "framer-motion";
import { Grid3x3, List, Battery, Smartphone, Filter, Laptop, Cable, Shield, Scissors, Briefcase } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  filterAccessoriesPageProducts,
  matchesAccessoriesSubTab,
  sortAccessoriesPageProducts,
  inferProductBrand,
} from "@/lib/catalogFilters";
import type { StorefrontProduct } from "@/lib/catalogProduct";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function toProductCardProps(product: StorefrontProduct) {
  return {
    id: product.id,
    dbId: product.dbId,
    name: product.name,
    title: product.title,
    price: product.displayPrice ?? product.price ?? 0,
    compareAtPrice: product.compareAtPrice,
    image: product.image,
    images: product.images?.length ? product.images : [product.image],
    rating: product.rating,
    category: product.category,
    colors: product.colors,
    variants: product.variants,
    sizes: product.sizes,
    isPreorder: product.isPreorder,
    showPreorderPrice: product.showPreorderPrice,
    stockQuantity: product.stockQuantity,
    surface: "grid" as const,
  };
}

const Accessories = () => {
  const { storefrontProducts, refreshCatalog } = useCatalog();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const brandParam = urlParams.get("brand");
    if (brandParam) {
      setSelectedBrand(brandParam);
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
    void refreshCatalog();
  }, [refreshCatalog]);

  const accessoryProducts = useMemo(
    () => filterAccessoriesPageProducts(storefrontProducts),
    [storefrontProducts]
  );

  const brands = useMemo(
    () =>
      Array.from(
        new Set(accessoryProducts.map((p) => inferProductBrand(p) || "Other"))
      ).sort(),
    [accessoryProducts]
  );

  const filteredProducts = useMemo(() => {
    let products = accessoryProducts;

    if (selectedCategory !== "all") {
      products = products.filter((p) => matchesAccessoriesSubTab(p, selectedCategory));
    }

    if (selectedBrand !== "all") {
      products = products.filter((p) => (inferProductBrand(p) || "Other") === selectedBrand);
    }

    return sortAccessoriesPageProducts(products);
  }, [accessoryProducts, selectedCategory, selectedBrand]);

  return (
    <motion.div className="min-h-screen bg-background w-full">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 sm:mb-8 overflow-x-auto scrollbar-hide"
        >
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="flex flex-wrap w-full max-w-5xl h-auto p-1 gap-1 sm:gap-2 justify-start">
              <TabsTrigger value="all" className="text-elegant text-[10px] sm:text-xs px-2 sm:px-3 py-2 whitespace-nowrap flex-shrink-0">
                <span className="hidden sm:inline">All Products</span>
                <span className="sm:hidden">All</span>
              </TabsTrigger>
              <TabsTrigger value="charging" className="text-elegant text-[10px] sm:text-xs px-2 sm:px-3 py-2 whitespace-nowrap flex-shrink-0">
                <Battery className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                <span className="hidden sm:inline">Charging</span>
                <span className="sm:hidden">Charge</span>
              </TabsTrigger>
              <TabsTrigger value="hair & grooming" className="text-elegant text-[10px] sm:text-xs px-2 sm:px-3 py-2 whitespace-nowrap flex-shrink-0">
                <Scissors className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                <span className="hidden sm:inline">Hair & Grooming</span>
                <span className="sm:hidden">Hair</span>
              </TabsTrigger>
              <TabsTrigger value="laptop accessories" className="text-elegant text-[10px] sm:text-xs px-2 sm:px-3 py-2 whitespace-nowrap flex-shrink-0">
                <Laptop className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                <span className="hidden sm:inline">Laptop Acc</span>
                <span className="sm:hidden">Laptop</span>
              </TabsTrigger>
              <TabsTrigger value="led lights" className="text-elegant text-[10px] sm:text-xs px-2 sm:px-3 py-2 whitespace-nowrap flex-shrink-0">
                <Cable className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                <span className="hidden sm:inline">LED Lights</span>
                <span className="sm:hidden">LED</span>
              </TabsTrigger>
              <TabsTrigger value="bags" className="text-elegant text-[10px] sm:text-xs px-2 sm:px-3 py-2 whitespace-nowrap flex-shrink-0">
                <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                <span className="hidden sm:inline">Bags</span>
                <span className="sm:hidden">Bags</span>
              </TabsTrigger>
              <TabsTrigger value="stands" className="text-elegant text-[10px] sm:text-xs px-2 sm:px-3 py-2 whitespace-nowrap flex-shrink-0">
                <Smartphone className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                <span className="hidden sm:inline">Stands</span>
                <span className="sm:hidden">Stand</span>
              </TabsTrigger>
              <TabsTrigger value="advanced accessories" className="text-elegant text-[10px] sm:text-xs px-2 sm:px-3 py-2 whitespace-nowrap flex-shrink-0">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                <span className="hidden sm:inline">Advanced</span>
                <span className="sm:hidden">Adv</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4 sm:mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
              <span className="text-xs sm:text-sm text-elegant whitespace-nowrap font-medium">Filter by Brand:</span>
            </div>
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="w-full sm:w-[250px] h-9 sm:h-10 text-xs sm:text-sm">
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
            {selectedBrand !== "all" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedBrand("all")}
                className="text-xs sm:text-sm"
              >
                Clear Filter
              </Button>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6"
        >
          <p className="text-xs sm:text-sm text-muted-foreground">
            Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
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
                <ProductCard {...toProductCardProps(product)} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base text-muted-foreground">No products found in this category.</p>
            </div>
          )}
        </motion.div>

        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 sm:py-16"
          >
            <Smartphone className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-elegant text-lg sm:text-xl mb-2">No products available</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-4">
              We&apos;re working on adding more products to this category.
            </p>
            <Button onClick={() => setSelectedCategory("all")} className="text-elegant text-xs sm:text-sm">
              View All Products
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Accessories;
