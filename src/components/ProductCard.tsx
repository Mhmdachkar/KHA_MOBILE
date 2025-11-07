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
  rating?: number;
  category?: string;
}

const ProductCard = ({ id, name, price, image, rating = 4.5, category }: ProductCardProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const favorite = isFavorite(id);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      id,
      name,
      price,
      image,
      rating,
      category,
      quantity: 1,
    });
  };
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      style={{ willChange: "transform" }}
      className="group relative bg-white rounded-sm overflow-hidden border border-border hover:border-primary/40 transition-all duration-500 shadow-card hover:shadow-elegant"
    >
      <Link to={`/product/${id}`}>
        <div className="aspect-square overflow-hidden bg-white relative border-b border-border">
          <motion.img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
