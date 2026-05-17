import { useState, useMemo, useEffect } from "react";
import { useCatalog } from "@/context/CatalogContext";
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
import {
  resolveCategoryFromPath,
  filterByCategoryPage,
  sortCategoryProducts,
  inferProductBrand,
  CATEGORY_PATH_MAP,
} from "@/lib/catalogFilters";

// Import brand logos
import appleLogo from "@/assets/logo's/apple logo.png";
import fonengLogo from "@/assets/logo's/foneng logo.jpg";
import greenLionLogo from "@/assets/logo's/green lion logo.jpg";
import hocoLogo from "@/assets/logo's/hoco logo.webp";
import samsungLogo from "@/assets/logo's/samsung logo.avif";
import sonyLogo from "@/assets/logo's/sony logo.png";
import smartLogo from "@/assets/smart logo.jpg";
import tecnoLogo from "@/assets/techno logo.jpg";
import xiaomiLogo from "@/assets/logo's/xiaomi logo.png";
import redmagicLogo from "@/assets/logo's/redmagic logo.jpg";
import oscalLogo from "@/assets/logo's/oscal logo.png";
import infinixLogo from "@/assets/logo's/infinix logo.jpg";

const brandLogoMap: Record<string, string> = {
  "Apple": appleLogo,
  "Samsung": samsungLogo,
  "Green Lion": greenLionLogo,
  "Hoco": hocoLogo,
  "Foneng": fonengLogo,
  "Smart": smartLogo,
  "Tecno": tecnoLogo,
  "Xiaomi": xiaomiLogo,
  "REDMAGIC": redmagicLogo,
  "Oscal": oscalLogo,
  "Infinix": infinixLogo,
  "Sony": sonyLogo,
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
  },
  "Tablets": {
    title: "\"Expand your horizons with effortless mobility.\"",
    subtitle: "Portable canvases built for creativity and on-the-go work."
  },
  "iPhone Cases": {
    title: "\"Protection meets perfection.\"",
    subtitle: "Style and security for your device."
  },
  "Electronics": {
    title: "\"The future is electric.\"",
    subtitle: "Modern solutions for a smarter lifestyle."
  }
};

const CategoryPage = () => {
  const { storefrontProducts } = useCatalog();
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

  const categoryDisplayName = resolveCategoryFromPath(location.pathname);

  const isSmartphoneCategory = categoryDisplayName === "Smartphones";

  const categoryProducts = useMemo(
    () => filterByCategoryPage(storefrontProducts, categoryDisplayName),
    [storefrontProducts, categoryDisplayName]
  );

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...categoryProducts];

    if (selectedSmartphoneBrand !== "All") {
      filtered = filtered.filter(
        (product) => inferProductBrand(product) === selectedSmartphoneBrand
      );
    }

    const mode =
      sortBy === "default"
        ? "default"
        : (sortBy as "price-low" | "price-high" | "rating" | "name");

    return sortCategoryProducts(filtered, mode, categoryDisplayName);
  }, [categoryProducts, sortBy, categoryDisplayName, selectedSmartphoneBrand]);

  const smartphoneBrandOptions = useMemo(() => {
    const brandCounts = new Map<string, number>();
    categoryProducts.forEach((product) => {
      const brand = inferProductBrand(product);
      if (brand) {
        brandCounts.set(brand, (brandCounts.get(brand) || 0) + 1);
      }
    });
    return Array.from(brandCounts.keys()).sort((a, b) => {
      const countDiff = (brandCounts.get(b) || 0) - (brandCounts.get(a) || 0);
      if (countDiff !== 0) return countDiff;
      return a.localeCompare(b);
    });
  }, [categoryProducts]);

  useEffect(() => {
    if (categoryDisplayName === "Gaming") {
      setSelectedSmartphoneBrand("Sony");
    } else {
      setSelectedSmartphoneBrand("All");
    }
  }, [categoryDisplayName]);

  // Only redirect if category is truly not found (not in map and not a valid dynamic route)
  const isCategoryNotFound = !CATEGORY_PATH_MAP[location.pathname.toLowerCase()] &&
    categoryDisplayName === "Category" &&
    !location.pathname.match(/^\/category\//);

  if (isCategoryNotFound) {
    return (
      <div className="min-h-screen bg-background w-full">
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
          <Label className="text-xs sm:text-sm font-medium mb-3 sm:mb-4 block">Brands</Label>
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            <button
              onClick={() => setSelectedSmartphoneBrand("All")}
              style={{ touchAction: 'manipulation' }}
              className={`col-span-2 flex items-center justify-center p-2.5 sm:p-3 rounded-md border transition-all duration-200 min-h-[44px] ${selectedSmartphoneBrand === "All"
                ? "border-primary bg-primary/5 text-primary shadow-sm"
                : "border-border hover:border-primary/50 hover:bg-secondary/50"
                }`}
            >
              <span className="text-xs sm:text-sm font-medium">All Brands</span>
            </button>

            {smartphoneBrandOptions.map((brand) => {
              const isActive = selectedSmartphoneBrand === brand;
              const logo = brandLogoMap[brand];

              return (
                <button
                  key={brand}
                  onClick={() => setSelectedSmartphoneBrand(brand)}
                  style={{ touchAction: 'manipulation' }}
                  className={`relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-md border transition-all duration-200 group min-h-[70px] sm:min-h-[80px] ${isActive
                    ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                    : "border-border hover:border-primary/50 hover:bg-secondary/50"
                    }`}
                >
                  {isActive && (
                    <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5">
                      <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary rounded-full" />
                    </div>
                  )}

                  {logo ? (
                    <div className="w-full h-7 sm:h-8 md:h-9 flex items-center justify-center mb-1 sm:mb-1.5">
                      <img
                        src={logo}
                        alt={brand}
                        className="max-w-full max-h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-7 sm:h-8 md:h-9 flex items-center justify-center mb-1 sm:mb-1.5">
                      <span className="text-xs sm:text-sm font-bold text-muted-foreground group-hover:text-foreground">
                        {brand.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className={`text-[10px] sm:text-xs font-medium leading-tight text-center px-1 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
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
    <div className="min-h-screen bg-background w-full">
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
          className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl mb-8 sm:mb-10 md:mb-12 p-6 sm:p-8 md:p-12 text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 opacity-50" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

          {/* Decorative Circles */}
          <div className="absolute top-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-accent/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative z-10"
          >
            <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-light text-elegant mb-3 sm:mb-4 tracking-wide px-2">
              {categoryQuotes[categoryDisplayName]?.title || "\"Quality is not an act, it is a habit.\""}
            </h2>
            <div className="w-16 sm:w-20 h-0.5 sm:h-1 bg-gradient-to-r from-primary to-transparent mx-auto rounded-full" />
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base text-muted-foreground font-light italic px-2">
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
                className={`grid gap-2 sm:gap-3 md:gap-4 lg:gap-6 ${viewMode === "grid"
                  ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
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
                        title={product.title}
                        price={product.displayPrice ?? product.price ?? 0}
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
                      {isSmartphoneCategory && product.variants?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {product.variants.map((variant, vi) => (
                            <button
                              key={`${product.id}-${variant.key}-${vi}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/product/${product.id}?variant=${encodeURIComponent(variant.key)}`);
                              }}
                              style={{ touchAction: 'manipulation' }}
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
