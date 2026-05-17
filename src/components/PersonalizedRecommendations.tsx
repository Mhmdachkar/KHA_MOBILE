import { motion } from "framer-motion";
import { Battery, Smartphone, Zap, Gamepad2, Headphones } from "lucide-react";
import ProductCard from "./ProductCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useState, useRef, useEffect, useMemo } from "react";
import { useCatalog } from "@/context/CatalogContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  filterByCategoryPage,
  sortRecommendationProducts,
} from "@/lib/catalogFilters";
import type { StorefrontProduct } from "@/lib/catalogProduct";

const HorizontalScrollContainer = ({ products }: { products: StorefrontProduct[] }) => {
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
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          style={{ touchAction: "manipulation" }}
          className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 lg:h-12 lg:w-12 bg-background/90 backdrop-blur border border-border rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4 lg:h-5 lg:w-5" />
        </button>
      )}

      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          style={{ touchAction: "manipulation" }}
          className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 lg:h-12 lg:w-12 bg-background/90 backdrop-blur border border-border rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4 lg:h-5 lg:w-5" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-4 sm:px-0 snap-x snap-mandatory"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
          willChange: "scroll-position",
          transform: "translateZ(0)",
        }}
      >
        {products.map((product) => (
          <motion.div key={product.id} className="flex-none w-[200px] sm:w-[240px] md:w-64 snap-start">
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
              surface="carousel"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const PersonalizedRecommendations = () => {
  const { storefrontProducts } = useCatalog();

  const productsForTab = (category: string) =>
    sortRecommendationProducts(filterByCategoryPage(storefrontProducts, category));

  const chargingProducts = useMemo(
    () => productsForTab("Charging"),
    [storefrontProducts]
  );
  const gamingProducts = useMemo(() => productsForTab("Gaming"), [storefrontProducts]);
  const accessoriesProducts = useMemo(
    () => productsForTab("Accessories"),
    [storefrontProducts]
  );
  const audioProducts = useMemo(() => productsForTab("Audio"), [storefrontProducts]);

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-background relative">
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute top-10 right-10 sm:top-20 sm:right-20 w-48 h-48 sm:w-96 sm:h-96 bg-primary/5 rounded-full blur-3xl"
      />

      <motion.div className="container mx-auto px-4 sm:px-6 relative z-10">
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
      </motion.div>
    </section>
  );
};

export default PersonalizedRecommendations;
