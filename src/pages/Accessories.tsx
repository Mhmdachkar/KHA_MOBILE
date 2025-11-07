import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Grid3x3, List, Battery, Gamepad2, Headphones, Smartphone } from "lucide-react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { phoneAccessories, getProductsByCategory } from "@/data/products";

const Accessories = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Get all products grouped by category
  const allProducts = phoneAccessories;
  const chargingProducts = getProductsByCategory("Charging");
  const gamingProducts = getProductsByCategory("Gaming");
  const audioProducts = getProductsByCategory("Audio");
  const accessoriesProducts = getProductsByCategory("Accessories");

  // Filter products based on selected category
  const getFilteredProducts = () => {
    switch (selectedCategory) {
      case "charging":
        return chargingProducts;
      case "gaming":
        return gamingProducts;
      case "audio":
        return audioProducts;
      case "accessories":
        return accessoriesProducts;
      default:
        return allProducts;
    }
  };

  const filteredProducts = getFilteredProducts();

  return (
    <div className="min-h-screen bg-background no-horizontal-scroll overflow-x-hidden">
      <Header />

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-elegant text-4xl mb-4">Phone Accessories</h1>
          <p className="text-muted-foreground font-light">
            Discover our complete collection of premium phone accessories to enhance your mobile experience.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full max-w-2xl grid-cols-5">
              <TabsTrigger value="all" className="text-elegant">
                All Products
              </TabsTrigger>
              <TabsTrigger value="charging" className="text-elegant">
                <Battery className="h-4 w-4 mr-2" />
                Charging
              </TabsTrigger>
              <TabsTrigger value="audio" className="text-elegant">
                <Headphones className="h-4 w-4 mr-2" />
                Audio
              </TabsTrigger>
              <TabsTrigger value="gaming" className="text-elegant">
                <Gamepad2 className="h-4 w-4 mr-2" />
                Gaming
              </TabsTrigger>
              <TabsTrigger value="accessories" className="text-elegant">
                <Smartphone className="h-4 w-4 mr-2" />
                Accessories
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* View Mode Toggle and Results Count */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-6"
        >
          <p className="text-sm text-muted-foreground">
            Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="text-elegant"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="text-elegant"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Products Grid/List */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`grid gap-6 ${
            viewMode === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No products found in this category.</p>
            </div>
          )}
        </motion.div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <Smartphone className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-elegant text-xl mb-2">No products available</h3>
            <p className="text-muted-foreground mb-6">
              We're working on adding more products to this category.
            </p>
            <Button onClick={() => setSelectedCategory("all")} className="text-elegant">
              View All Products
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Accessories;



