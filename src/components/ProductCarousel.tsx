import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";

interface Product {
  id: number;
  name: string;
  price: number | string;
  compareAtPrice?: number | null;
  image: string;
  images?: string[];
  rating?: number;
  category?: string;
  colors?: Array<{ name: string; image?: string; stock?: string }>;
  variants?: Array<{ key: string; label: string; price: number }>;
  sizes?: Array<{ name: string; price?: number | string | null }>;
  title?: string;
  isPreorder?: boolean;
  showPreorderPrice?: boolean;
  stockQuantity?: number | null;
}

interface ProductCarouselProps {
  title: string;
  products: Product[];
  viewAllLink?: string;
}

const ProductCarousel = ({ title, products, viewAllLink }: ProductCarouselProps) => {
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
    <div className="relative group w-full overflow-hidden">
      <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8 px-4 sm:px-0">
        <h2 className="text-elegant text-xl sm:text-2xl break-words">{title}</h2>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors shrink-0 ml-4"
          >
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          style={{ touchAction: 'manipulation' }}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 lg:h-11 lg:w-11 bg-background/95 backdrop-blur border border-border/60 rounded-full items-center justify-center shadow-md hover:shadow-lg hover:border-primary/40 transition-all"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          style={{ touchAction: 'manipulation' }}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 lg:h-11 lg:w-11 bg-background/95 backdrop-blur border border-border/60 rounded-full items-center justify-center shadow-md hover:shadow-lg hover:border-primary/40 transition-all"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Scrollable Container - Touch-friendly on mobile */}
      <div
        ref={scrollRef}
        className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-4 sm:px-0 snap-x snap-mandatory w-full"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
          willChange: "scroll-position",
          transform: "translateZ(0)"
        }}
      >
        {products.map((product) => (
          <div key={product.id} className="flex-none w-[180px] xs:w-[200px] sm:w-[220px] md:w-[240px] lg:w-64 snap-start flex-shrink-0">
            <ProductCard
              id={product.id}
              name={product.name}
              title={product.title}
              price={product.price}
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductCarousel;
