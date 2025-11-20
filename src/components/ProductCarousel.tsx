import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  images?: string[];
  rating?: number;
  category?: string;
}

interface ProductCarouselProps {
  title: string;
  products: Product[];
}

const ProductCarousel = ({ title, products }: ProductCarouselProps) => {
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

      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            left: newScrollLeft,
            behavior: "smooth",
          });
        }
      });

      // Check arrow visibility after scroll animation
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

  // Optimize scroll detection with passive listeners and requestAnimationFrame
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
    
    // Initial check
    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="relative group">
      <h2 className="text-elegant text-xl sm:text-2xl mb-4 sm:mb-6 md:mb-8 px-4 sm:px-0">{title}</h2>
      
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

export default ProductCarousel;
