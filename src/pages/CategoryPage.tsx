import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Grid3x3, List, Filter, Check } from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";
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

// Import brand logos
import appleLogo from "@/assets/logo's/apple logo.png";
import fonengLogo from "@/assets/logo's/foneng logo.jpg";
import greenLionLogo from "@/assets/logo's/green lion logo.jpg";
import hocoLogo from "@/assets/logo's/hoco logo.webp";
import samsungLogo from "@/assets/logo's/samsung logo.avif";
import smartLogo from "@/assets/smart logo.jpg";
import tecnoLogo from "@/assets/techno logo.jpg";

const brandLogoMap: Record<string, string> = {
  "Apple": appleLogo,
  "Samsung": samsungLogo,
  "Green Lion": greenLionLogo,
  "Hoco": hocoLogo,
  "Foneng": fonengLogo,
  "Smart": smartLogo,
  "Tecno": tecnoLogo,
};

// Quote map for each category
const categoryQuotes: Record<string, { title: string; subtitle: string }> = {
  "Smartphones": {
    title: "\"Technology is best when it brings people together.\"",
    subtitle: "Discover the future in your hands."
  },
  "Audio": {
    title: "\"Music is the soundtrack of your life. Play it loud.\"",
    subtitle: "Immerse yourself in crystal clear sound."
  },
  "Wearables": {
    title: "\"Empower your fitness, elevate your style.\"",
    subtitle: "Stay connected and healthy on the go."
  },
  "Accessories": {
    title: "\"The perfect companions for your digital life.\"",
    subtitle: "Enhance your device with premium essentials."
  },
  "Gaming": {
    title: "\"Level up your game with precision and power.\"",
    subtitle: "Gear up for victory."
  },
  "Computers": {
    title: "\"Power and performance for every ambition.\"",
    subtitle: "Create, work, and play without limits."
  }
};

// Mock products data - in a real app, this would come from an API
const mockProducts = {
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
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<string>("default");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSmartphoneBrand, setSelectedSmartphoneBrand] = useState<string>("All");

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
  const isSmartphoneCategory = categoryDisplayName === "Smartphones";

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
      } else if (categoryDisplayName === "Smartphones") {
        const smartphones = getProductsByCategory("Smartphones");
        if (Array.isArray(smartphones) && smartphones.length > 0) {
          products = [
            ...products,
            ...smartphones.map(p => ({
              ...p,
              images: p.images && p.images.length > 0 ? p.images : [p.image],
            }))
          ];
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
      }
    } catch (error) {
      console.error("Error fetching products for category:", categoryDisplayName, error);
    }

    return products;
  }, [categoryDisplayName]);

  // Helper function to check if product is Green Lion
  const isGreenLionProduct = (product: any) => {
    return product.id >= 5000 || product.brand === "Green Lion" || product.name?.startsWith("Green Lion");
  };

  const inferProductBrand = (product: any): string | undefined => {
    if (!product) return undefined;
    if (product.brand) return product.brand;
    const name = typeof product.name === "string" ? product.name.toLowerCase() : "";
    if (name.startsWith("smart")) return "Smart";
    if (name.includes("samsung")) return "Samsung";
    if (name.includes("apple")) return "Apple";
    if (name.includes("green lion")) return "Green Lion";
    return undefined;
  };

  const smartphoneBrandOptions = useMemo(() => {
    // Apply this to all categories, not just Smartphones
    const set = new Set<string>();
    categoryProducts.forEach((product) => {
      const brand = inferProductBrand(product);
      if (brand) {
        set.add(brand);
      }
    });
    return Array.from(set).sort();
  }, [categoryProducts]);

  useEffect(() => {
    setSelectedSmartphoneBrand("All");
  }, [categoryDisplayName]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...categoryProducts];

    if (selectedSmartphoneBrand !== "All") {
      filtered = filtered.filter(product => {
        const brand = inferProductBrand(product);
        return brand === selectedSmartphoneBrand;
      });
    }

    // Always sort to put Green Lion products first (unless user selects a specific sort)
    if (sortBy === "default") {
      filtered.sort((a, b) => {
        const aIsGreenLion = isGreenLionProduct(a);
        const bIsGreenLion = isGreenLionProduct(b);
        
        // Green Lion products first
        if (aIsGreenLion && !bIsGreenLion) return -1;
        if (!aIsGreenLion && bIsGreenLion) return 1;
        
        // Within same type, sort by rating (high to low)
        return (b.rating || 0) - (a.rating || 0);
      });
    } else {
      // User-selected sort
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
        default:
          // Default: Green Lion first, then by rating
          filtered.sort((a, b) => {
            const aIsGreenLion = isGreenLionProduct(a);
            const bIsGreenLion = isGreenLionProduct(b);
            
            if (aIsGreenLion && !bIsGreenLion) return -1;
            if (!aIsGreenLion && bIsGreenLion) return 1;
            
            return (b.rating || 0) - (a.rating || 0);
          });
          break;
      }
    }

    return filtered;
  }, [categoryProducts, sortBy, isSmartphoneCategory, selectedSmartphoneBrand]);

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

        {isSmartphoneCategory && smartphoneBrandOptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <p className="text-sm font-medium text-muted-foreground mb-3">Filter by brand</p>
            <div className="flex flex-wrap gap-2">
              {["All", ...smartphoneBrandOptions].map((brand) => {
                const isActive = selectedSmartphoneBrand === brand;
                return (
                  <button
                    key={brand}
                    onClick={() => setSelectedSmartphoneBrand(brand)}
                    className={`px-3 py-1.5 rounded-full text-xs sm:text-sm border transition-all ${
                      isActive
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    {brand}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  // Filter sidebar component
  const FilterSidebar = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Filters</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSortBy("default");
            setSelectedSmartphoneBrand("All");
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

      {/* Brand Filter (For All Categories) */}
      {smartphoneBrandOptions.length > 0 && (
        <div>
          <Label className="text-sm font-medium mb-4 block">Brands</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSelectedSmartphoneBrand("All")}
              className={`col-span-2 flex items-center justify-center p-2 rounded-md border transition-all duration-200 ${
                selectedSmartphoneBrand === "All"
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : "border-border hover:border-primary/50 hover:bg-secondary/50"
              }`}
            >
              <span className="text-sm font-medium">All Brands</span>
            </button>
            
            {smartphoneBrandOptions.map((brand) => {
              const isActive = selectedSmartphoneBrand === brand;
              const logo = brandLogoMap[brand];

              return (
                <button
                  key={brand}
                  onClick={() => setSelectedSmartphoneBrand(brand)}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-md border transition-all duration-200 group ${
                    isActive
                      ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                      : "border-border hover:border-primary/50 hover:bg-secondary/50"
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-1 right-1">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    </div>
                  )}
                  
                  {logo ? (
                    <div className="w-full h-8 flex items-center justify-center mb-1">
                      <img 
                        src={logo} 
                        alt={brand} 
                        className="max-w-full max-h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" 
                      />
                    </div>
                  ) : (
                    <div className="w-full h-8 flex items-center justify-center mb-1">
                      <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground">
                        {brand.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                    {brand}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
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

        {/* Category Banner Quote */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
          className="relative w-full overflow-hidden rounded-2xl mb-10 sm:mb-12 p-8 sm:p-12 text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 opacity-50" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
          
          {/* Decorative Circles */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative z-10"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-elegant mb-4 tracking-wide">
              {categoryQuotes[categoryDisplayName]?.title || "\"Quality is not an act, it is a habit.\""}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-primary to-transparent mx-auto rounded-full" />
            <p className="mt-4 text-sm sm:text-base text-muted-foreground font-light italic">
              {categoryQuotes[categoryDisplayName]?.subtitle || "Experience excellence in every detail."}
            </p>
          </motion.div>
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
                      className="space-y-2"
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
                      {isSmartphoneCategory && product.variants?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {product.variants.map((variant: any) => (
                            <button
                              key={variant.key}
                              onClick={() => navigate(`/product/${product.id}?variant=${encodeURIComponent(variant.key)}`)}
                              className="px-2.5 py-1 rounded-full text-[11px] border border-border hover:border-primary/60 hover:text-primary transition"
                            >
                              {variant.label}
                            </button>
                          ))}
                        </div>
                      )}
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
                      setSelectedSmartphoneBrand("All");
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
