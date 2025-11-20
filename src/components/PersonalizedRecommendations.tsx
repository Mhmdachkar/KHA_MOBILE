import { motion } from "framer-motion";
import { Battery, Smartphone, Zap, Gamepad2, Headphones } from "lucide-react";
import ProductCard from "./ProductCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { phoneAccessories, getProductsByCategory } from "@/data/products";
import { greenLionProducts, getGreenLionProductsByCategory } from "@/data/greenLionProducts";
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Horizontal Scroll Container Component
const HorizontalScrollContainer = ({ products }: { products: any[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      const newScrollLeft =
        direction === "left"
          ? scrollRef.current.scrollLeft - scrollAmount
          : scrollRef.current.scrollLeft + scrollAmount;

      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            left: newScrollLeft,
            behavior: "smooth",
          });
        }
      });

      setTimeout(() => {
        if (scrollRef.current) {
          setShowLeftArrow(scrollRef.current.scrollLeft > 0);
          setShowRightArrow(
            scrollRef.current.scrollLeft <
              scrollRef.current.scrollWidth - scrollRef.current.clientWidth
          );
        }
      }, 350);
    }
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let rafId: number;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (container) {
          setShowLeftArrow(container.scrollLeft > 0);
          setShowRightArrow(
            container.scrollLeft < container.scrollWidth - container.clientWidth
          );
        }
      });
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="relative group">
      {/* Left Arrow - Hidden on mobile, visible on hover for desktop */}
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 lg:h-12 lg:w-12 bg-background/90 backdrop-blur border border-border rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4 lg:h-5 lg:w-5" />
        </button>
      )}

      {/* Right Arrow - Hidden on mobile, visible on hover for desktop */}
      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 lg:h-12 lg:w-12 bg-background/90 backdrop-blur border border-border rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4 lg:h-5 lg:w-5" />
        </button>
      )}

      {/* Scrollable Container - Touch-friendly on mobile */}
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-4 sm:px-0 snap-x snap-mandatory"
        style={{ 
          scrollbarWidth: "none", 
          msOverflowStyle: "none", 
          WebkitOverflowScrolling: "touch",
          willChange: "scroll-position",
          transform: "translateZ(0)"
        }}
      >
        {products.map((product) => (
          <div key={product.id} className="flex-none w-[200px] sm:w-[240px] md:w-64 snap-start">
            <ProductCard
              id={product.id}
              name={product.name}
              price={product.price}
              image={product.image}
              images={product.images || [product.image]}
              rating={product.rating}
              category={product.category}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const PersonalizedRecommendations = () => {
  // Helper function to check if product is Green Lion
  const isGreenLionProduct = (product: any) => {
    return product.id >= 5000 || product.brand === "Green Lion" || product.name?.startsWith("Green Lion");
  };

  // Helper function to get and sort products by category (Green Lion first)
  const getProductsForCategory = (category: string) => {
    // Get regular products from phoneAccessories
    const regularProducts = phoneAccessories
      .filter(p => p.category === category)
      .map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image,
        images: [p.image],
        rating: p.rating,
        category: p.category,
        brand: p.brand || "Other",
      }));

    // Get Green Lion products for this category
    // Match by primary category, secondary categories, or name patterns
    const greenLionCategoryProducts = greenLionProducts
      .filter(p => {
        const nameLower = p.name.toLowerCase();
        const primaryMatch = p.category === category;
        const secondaryMatch = p.secondaryCategories?.includes(category);
        
        // Category-specific matching
        if (category === "Charging") {
          return primaryMatch || secondaryMatch || 
                 nameLower.includes("charg") || 
                 nameLower.includes("power bank") ||
                 nameLower.includes("ups") ||
                 nameLower.includes("battery") ||
                 nameLower.includes("charger");
        }
        
        if (category === "Audio") {
          // Match by secondaryCategories or specific product names
          return primaryMatch || 
                 secondaryMatch ||
                 p.secondaryCategories?.includes("Audio") ||
                 p.secondaryCategories?.includes("Headphones") ||
                 p.secondaryCategories?.includes("Earbuds") ||
                 nameLower.includes("speaker") ||
                 nameLower.includes("earbud") ||
                 nameLower.includes("headphone") ||
                 nameLower.includes("neckband") ||
                 nameLower.includes("river") ||
                 nameLower.includes("manchester") ||
                 nameLower.includes("porto") ||
                 nameLower.includes("jupiter") ||
                 nameLower.includes("rhythm") ||
                 nameLower.includes("echo") ||
                 nameLower.includes("sevilla");
        }
        
        if (category === "Gaming") {
          return primaryMatch || 
                 secondaryMatch ||
                 p.secondaryCategories?.includes("Gaming") ||
                 nameLower.includes("gaming");
        }
        
        if (category === "Accessories") {
          // Accessories category includes all Green Lion products (they all have category "Accessories")
          return true;
        }
        
        return primaryMatch || secondaryMatch;
      })
      .map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.images[0],
        images: p.images,
        rating: p.rating,
        category: p.category,
        brand: p.brand,
      }));

    // Combine and sort: Green Lion products first, then others
    const allProducts = [...greenLionCategoryProducts, ...regularProducts];
    
    return allProducts.sort((a, b) => {
      const aIsGreenLion = isGreenLionProduct(a);
      const bIsGreenLion = isGreenLionProduct(b);
      
      // Green Lion products first
      if (aIsGreenLion && !bIsGreenLion) return -1;
      if (!aIsGreenLion && bIsGreenLion) return 1;
      
      // Within same type, sort by rating (high to low)
      return (b.rating || 0) - (a.rating || 0);
    });
  };

  // Get products by category with Green Lion products first
  const chargingProducts = getProductsForCategory("Charging");
  const gamingProducts = getProductsForCategory("Gaming");
  const accessoriesProducts = getProductsForCategory("Accessories");
  const audioProducts = getProductsForCategory("Audio");

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-background relative">
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute top-10 right-10 sm:top-20 sm:right-20 w-48 h-48 sm:w-96 sm:h-96 bg-primary/5 rounded-full blur-3xl"
      />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-block mb-3 sm:mb-4"
          >
            <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto" />
          </motion.div>
          <h2 className="text-elegant text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-4">Tech Essentials</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto font-light px-4">
            Complete your setup with essential accessories. High-quality cables, cases, protection, and chargers.
          </p>
        </motion.div>

        <Tabs defaultValue="chargers" className="w-full">
          <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-2 sm:grid-cols-4 mb-6 sm:mb-8 md:mb-12 h-auto">
            <TabsTrigger value="chargers" className="text-elegant text-xs sm:text-sm py-2 sm:py-3">
              <Battery className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Charging</span>
              <span className="sm:hidden">Charge</span>
            </TabsTrigger>
            <TabsTrigger value="audio" className="text-elegant text-xs sm:text-sm py-2 sm:py-3">
              <Headphones className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="gaming" className="text-elegant text-xs sm:text-sm py-2 sm:py-3">
              <Gamepad2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Gaming
            </TabsTrigger>
            <TabsTrigger value="accessories" className="text-elegant text-xs sm:text-sm py-2 sm:py-3">
              <Smartphone className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Accessories</span>
              <span className="sm:hidden">Acc</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chargers">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <HorizontalScrollContainer products={chargingProducts} />
            </motion.div>
          </TabsContent>

          <TabsContent value="audio">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <HorizontalScrollContainer products={audioProducts} />
            </motion.div>
          </TabsContent>

          <TabsContent value="gaming">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <HorizontalScrollContainer products={gamingProducts} />
            </motion.div>
          </TabsContent>

          <TabsContent value="accessories">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <HorizontalScrollContainer products={accessoriesProducts} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default PersonalizedRecommendations;
