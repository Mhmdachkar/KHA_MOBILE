import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useFavorites } from "@/context/FavoritesContext";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  image: string;
  images?: string[]; // Optional images array for hover switching
  rating?: number;
  category?: string;
}

const ProductCard = ({ id, name, price, image, images, rating = 4.5, category }: ProductCardProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const favorite = isFavorite(id);
  
  // Use images array if provided, otherwise use single image
  const productImages = images && images.length > 0 ? images : [image];
  const hasMultipleImages = productImages.length > 1;
  const defaultImage = productImages[0];
  const hoverImage = hasMultipleImages ? productImages[1] : defaultImage;
  
  // State for hover image switching
  const [currentImage, setCurrentImage] = useState(defaultImage);
  
  // Reset image when product changes
  useEffect(() => {
    setCurrentImage(defaultImage);
  }, [defaultImage, id]);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      id,
      name,
      price,
      image: defaultImage,
      rating,
      category,
      quantity: 1,
    });
  };

  // Handle mouse enter/leave for image switching (only on non-touch devices)
  const handleMouseEnter = () => {
    // Check if device supports hover (non-touch devices)
    if (hasMultipleImages && window.matchMedia('(hover: hover)').matches) {
      setCurrentImage(hoverImage);
    }
  };

  const handleMouseLeave = () => {
    // Check if device supports hover (non-touch devices)
    if (hasMultipleImages && window.matchMedia('(hover: hover)').matches) {
      setCurrentImage(defaultImage);
    }
  };
  
  return (
    <motion.div
      whileHover={{ y: window.matchMedia('(hover: hover)').matches ? -8 : 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      style={{ willChange: "transform" }}
      className="group relative bg-white rounded-sm overflow-hidden border border-border hover:border-primary/40 transition-all duration-500 shadow-card hover:shadow-elegant"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link to={`/product/${id}`}>
        <div className="aspect-square overflow-hidden bg-white relative border-b border-border">
          {/* Default Image - Base layer */}
          <motion.img
            key={`default-${id}`}
            src={defaultImage}
            alt={name}
            initial={{ opacity: 1 }}
            animate={{ 
              opacity: currentImage === defaultImage ? 1 : 0
            }}
            transition={{ 
              duration: 0.7, 
              ease: [0.23, 1, 0.32, 1] // Smooth, elegant cubic bezier
            }}
            className="absolute inset-0 h-full w-full object-cover will-change-[opacity]"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = defaultImage;
            }}
          />
          
          {/* Hover Image - Overlay layer (only if multiple images exist) */}
          {hasMultipleImages && (
            <motion.img
              key={`hover-${id}`}
              src={hoverImage}
              alt={`${name} - Alternate view`}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: currentImage === hoverImage ? 1 : 0
              }}
              transition={{ 
                duration: 0.7, 
                ease: [0.23, 1, 0.32, 1] // Smooth, elegant cubic bezier
              }}
              className="absolute inset-0 h-full w-full object-cover will-change-[opacity]"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = defaultImage;
              }}
            />
          )}
        </div>
        <div className="p-3 sm:p-4">
          {category && (
            <motion.p 
              initial={{ opacity: 0.7 }}
              whileHover={{ opacity: 1 }}
              className="text-elegant text-[10px] text-primary mb-1"
            >
              {category}
            </motion.p>
          )}
          <h3 className="text-elegant text-xs mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">{name}</h3>
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.2 }}
                transition={{ duration: 0.2 }}
              >
                <Star
                  className={`h-3 w-3 transition-colors duration-300 ${
                    i < Math.floor(rating)
                      ? "fill-primary text-primary"
                      : "text-border"
                  }`}
                />
              </motion.div>
            ))}
            <span className="text-[10px] text-muted-foreground ml-1">
              ({rating})
            </span>
          </div>
          <p className="text-elegant text-sm font-normal bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">${price.toFixed(2)}</p>
        </div>
      </Link>
      
      {/* Hover Actions - Always visible on mobile for better UX */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 flex flex-col gap-1.5 sm:gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300"
      >
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite({ id, name, price, image, rating, category });
          }}
          className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full glassmorphism border border-border/50 flex items-center justify-center transition-all duration-300 ripple bg-background/80 backdrop-blur-sm ${
            favorite 
              ? "bg-primary text-primary-foreground border-primary" 
              : "hover:bg-primary hover:text-primary-foreground hover:border-primary"
          }`}
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${favorite ? "fill-white" : ""}`} />
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleAddToCart}
          className="h-7 w-7 sm:h-8 sm:w-8 rounded-full glassmorphism border border-border/50 flex items-center justify-center hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all duration-300 ripple bg-background/80 backdrop-blur-sm"
          aria-label="Add to cart"
        >
          <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default ProductCard;
