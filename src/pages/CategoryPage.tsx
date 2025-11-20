import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Grid3x3, List, Filter } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
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
import { getProductsByCategory } from "@/data/products";
import { greenLionProducts, getGreenLionProductsByCategory } from "@/data/greenLionProducts";

// Mock products data - in a real app, this would come from an API
const mockProducts = {
  Smartphones: [
    {
      id: 1,
      name: "X-Phone Pro Max",
      price: 1299,
      image: "https://images.unsplash.com/photo-1592286927505-128fc4a04179?w=500&h=500&fit=crop",
      rating: 4.8,
      category: "Smartphones"
    },
    {
      id: 2,
      name: "Galaxy Ultra S23",
      price: 1199,
      image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&h=500&fit=crop",
      rating: 4.7,
      category: "Smartphones"
    },
    {
      id: 3,
      name: "Pixel 8 Pro",
      price: 999,
      image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&h=500&fit=crop",
      rating: 4.9,
      category: "Smartphones"
    },
    {
      id: 4,
      name: "OnePlus 12 Pro",
      price: 899,
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop",
      rating: 4.6,
      category: "Smartphones"
    },
    {
      id: 5,
      name: "Xperia 1 VI",
      price: 1099,
      image: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=500&h=500&fit=crop",
      rating: 4.5,
      category: "Smartphones"
    },
  ],
  Computers: [
    {
      id: 11,
      name: "MacBook Pro 16",
      price: 2499,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop",
      rating: 4.9,
      category: "Computers"
    },
    {
      id: 12,
      name: "Dell XPS 15",
      price: 1899,
      image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&h=500&fit=crop",
      rating: 4.7,
      category: "Computers"
    },
    {
      id: 13,
      name: "Lenovo ThinkPad X1",
      price: 1799,
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop",
      rating: 4.6,
      category: "Computers"
    },
    {
      id: 14,
      name: "HP Spectre x360",
      price: 1699,
      image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop",
      rating: 4.8,
      category: "Computers"
    },
  ],
  Wearables: [],
};

// Category mapping - maps URL paths to category names
const categoryMap: Record<string, string> = {
  "/smartphones": "Smartphones",
  "/audio": "Audio",
  "/computers": "Computers",
  "/wearables": "Wearables",
  "/gaming": "Gaming",
};

const CategoryPage = () => {
  const location = useLocation();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<string>("default");
  const [showFilters, setShowFilters] = useState(false);

  // Scroll to top on mount and when category changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);

  // Get category display name from pathname
  // Handle both direct routes (/audio) and dynamic routes (/category/audio)
  const getCategoryFromPath = (pathname: string): string => {
    // Check direct route first
    if (categoryMap[pathname]) {
      return categoryMap[pathname];
    }
    
    // Check dynamic route (/category/:categoryName)
    const categoryMatch = pathname.match(/^\/category\/(.+)$/);
    if (categoryMatch) {
      const categoryParam = categoryMatch[1];
      // Capitalize first letter for category name
      return categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1);
    }
    
    return "Category";
  };

  const categoryDisplayName = getCategoryFromPath(location.pathname);

  // Get products for this category
  const categoryProducts = useMemo(() => {
    let products: any[] = [];

    try {
      // Get mock products if they exist
      if (mockProducts[categoryDisplayName as keyof typeof mockProducts]) {
        const mock = mockProducts[categoryDisplayName as keyof typeof mockProducts];
        if (Array.isArray(mock) && mock.length > 0) {
          products = [...mock];
        }
      }

      // Get real products from data file based on category
      if (categoryDisplayName === "Audio") {
        const audioProducts = getProductsByCategory("Audio");
        if (Array.isArray(audioProducts) && audioProducts.length > 0) {
          products = [...products, ...audioProducts.map(p => ({
            ...p,
            images: [p.image]
          }))];
        }
        // Add Green Lion audio products
        const greenLionAudio = getGreenLionProductsByCategory("Audio");
        if (Array.isArray(greenLionAudio) && greenLionAudio.length > 0) {
          products = [...products, ...greenLionAudio.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.images[0],
            images: p.images,
            rating: p.rating,
            category: p.category
          }))];
        }
      } else if (categoryDisplayName === "Gaming") {
        const gamingProducts = getProductsByCategory("Gaming");
        if (Array.isArray(gamingProducts) && gamingProducts.length > 0) {
          products = [...products, ...gamingProducts.map(p => ({
            ...p,
            images: [p.image]
          }))];
        }
        // Add Green Lion gaming products if any
        const greenLionGaming = greenLionProducts.filter(p => 
          p.secondaryCategories?.includes("Gaming") || p.name.toLowerCase().includes("gaming")
        );
        if (greenLionGaming.length > 0) {
          products = [...products, ...greenLionGaming.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.images[0],
            images: p.images,
            rating: p.rating,
            category: p.category
          }))];
        }
      } else if (categoryDisplayName === "Wearables") {
        const wearables = getProductsByCategory("Wearables");
        if (Array.isArray(wearables) && wearables.length > 0) {
          products = [...products, ...wearables.map(p => ({
            ...p,
            images: [p.image]
          }))];
        }
        // Add Green Lion smartwatches
        const greenLionWearables = getGreenLionProductsByCategory("Wearables");
        if (Array.isArray(greenLionWearables) && greenLionWearables.length > 0) {
          products = [...products, ...greenLionWearables.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.images[0],
            images: p.images,
            rating: p.rating,
            category: p.category
          }))];
        }
      } else if (categoryDisplayName === "Smartphones") {
        // Smartphones are mock data only
        // You can add real smartphone products here if needed
      }
    } catch (error) {
      console.error("Error fetching products for category:", categoryDisplayName, error);
    }

    return products;
  }, [categoryDisplayName]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...categoryProducts];

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
      default:
        break;
    }

    return filtered;
  }, [categoryProducts, sortBy]);

  // Debug: Log category information (remove in production)
  useEffect(() => {
    console.log("CategoryPage - pathname:", location.pathname);
    console.log("CategoryPage - categoryDisplayName:", categoryDisplayName);
    console.log("CategoryPage - categoryProducts:", categoryProducts.length);
    console.log("CategoryPage - filteredAndSortedProducts:", filteredAndSortedProducts.length);
  }, [location.pathname, categoryDisplayName, categoryProducts, filteredAndSortedProducts]);

  // Only redirect if category is truly not found (not in map and not a valid dynamic route)
  const isCategoryNotFound = !categoryMap[location.pathname] && 
                             categoryDisplayName === "Category" &&
                             !location.pathname.match(/^\/category\//);
  
  if (isCategoryNotFound) {
    return (
      <div className="min-h-screen bg-background no-horizontal-scroll overflow-x-hidden">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 py-12 text-center">
          <h2 className="text-2xl mb-4">Category not found</h2>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Filter sidebar component
  const FilterSidebar = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Filters</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSortBy("default");
          }}
          className="text-xs"
        >
          Clear All
        </Button>
      </div>

      {/* Sort By */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Sort By</Label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="name">Name: A to Z</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background no-horizontal-scroll overflow-x-hidden">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm mb-6 sm:mb-8 text-muted-foreground"
        >
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground capitalize">{categoryDisplayName}</span>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 capitalize">
            {categoryDisplayName}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {filteredAndSortedProducts.length} product{filteredAndSortedProducts.length !== 1 ? 's' : ''} available
          </p>
        </motion.div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-4 flex items-center justify-between gap-3">
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>Filter products by your preferences</SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <FilterSidebar />
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
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-9 w-9 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Desktop Filter Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:block lg:col-span-1"
          >
            <div className="sticky top-24">
              <FilterSidebar />
            </div>
          </motion.aside>

          {/* Products Grid/List */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3"
          >
            {/* Desktop View Controls */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                Showing {filteredAndSortedProducts.length} of {categoryProducts.length} products
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="h-4 w-4 mr-2" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </Button>
              </div>
            </div>

            {/* Products */}
            {filteredAndSortedProducts.length > 0 ? (
              <div
                className={`grid gap-2 sm:gap-3 md:gap-4 lg:gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                    : "grid-cols-1"
                }`}
              >
                {filteredAndSortedProducts.map((product, index) => {
                  // Ensure product has all required fields
                  if (!product || !product.id || !product.name || !product.image) {
                    console.warn("Invalid product:", product);
                    return null;
                  }
                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ProductCard 
                        id={product.id}
                        name={product.name}
                        price={product.price || 0}
                        image={product.image}
                        images={product.images || [product.image]}
                        rating={product.rating}
                        category={product.category}
                      />
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16">
                <p className="text-muted-foreground text-lg mb-4">
                  {categoryProducts.length === 0 
                    ? `No products available in ${categoryDisplayName} category yet.`
                    : "No products found matching your filters."}
                </p>
                {categoryProducts.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSortBy("default");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
                <div className="mt-6">
                  <Link to="/">
                    <Button variant="default">
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
