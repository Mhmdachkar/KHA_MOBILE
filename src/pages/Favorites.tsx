import { motion } from "framer-motion";
import { Heart, ShoppingCart, Trash2, Link as LinkIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import { useFavorites } from "@/context/FavoritesContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const Favorites = () => {
  const { favorites, removeFromFavorites, toggleFavorite } = useFavorites();
  const { addToCart, openCart, closeCart } = useCart();
  const { toast } = useToast();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-white no-horizontal-scroll overflow-x-hidden">
        <Header />
        
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 10 }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              className="inline-block mb-6 sm:mb-8"
            >
              <Heart className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 text-primary/20" />
            </motion.div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-elegant mb-3 sm:mb-4">
              Your Favorites List is Empty
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-md px-4">
              Start exploring our collection and add products you love to your favorites
            </p>
            
            <Link to="/products">
              <Button className="text-elegant px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base md:text-lg">
                Explore Products
                <ShoppingCart className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const totalPrice = favorites.reduce((sum, product) => sum + product.price, 0);

  // Handle Add All to Cart
  const handleAddAllToCart = () => {
    if (favorites.length === 0) {
      toast({
        title: "No items to add",
        description: "Your favorites list is empty.",
        variant: "destructive",
      });
      return;
    }

    // Close cart first to prevent it from opening multiple times
    closeCart();

    // Add each favorite item to cart
    favorites.forEach((product) => {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        rating: product.rating,
        category: product.category,
        quantity: 1,
      });
    });

    // Show success message
    toast({
      title: "Items added to cart",
      description: `Successfully added ${favorites.length} ${favorites.length === 1 ? "item" : "items"} to your cart.`,
    });

    // Open cart dashboard after a short delay to ensure all items are added
    setTimeout(() => {
      openCart();
    }, 150);
  };

  return (
    <div className="min-h-screen bg-white no-horizontal-scroll overflow-x-hidden">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 sm:mb-10 md:mb-12"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-elegant mb-2">
                My Favorites
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {favorites.length} {favorites.length === 1 ? "item" : "items"} saved
              </p>
            </div>
            
            <Badge className="bg-gradient-to-r from-primary to-accent text-white px-4 py-2 sm:px-6 sm:py-3 text-base sm:text-lg">
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 mr-2 fill-white" />
              {favorites.length}
            </Badge>
          </div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/10"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span className="text-xs sm:text-sm text-muted-foreground">Total Value:</span>
              <span className="text-lg sm:text-xl font-bold text-elegant bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
            <div className="hidden sm:block h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
              <span className="text-xs sm:text-sm text-muted-foreground">Saved Items:</span>
              <span className="text-lg sm:text-xl font-bold text-elegant text-accent">
                {favorites.length}
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Favorites Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
        >
          {favorites.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -12 }}
              className="group relative bg-white rounded-sm overflow-hidden border border-border hover:border-primary/40 transition-all duration-500 shadow-card hover:shadow-elegant"
            >
              <Link to={`/product/${product.id}`}>
                <div className="aspect-square overflow-hidden bg-white relative border-b border-border">
                  <motion.img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="p-4">
                  {product.category && (
                    <motion.p 
                      initial={{ opacity: 0.7 }}
                      whileHover={{ opacity: 1 }}
                      className="text-elegant text-[10px] text-primary mb-1"
                    >
                      {product.category}
                    </motion.p>
                  )}
                  <h3 className="text-elegant text-xs mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-elegant text-sm font-normal bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              </Link>
              
              {/* Action Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(product);
                  }}
                  className="h-8 w-8 rounded-full glassmorphism border border-border/50 flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 ripple"
                >
                  <Heart className="h-4 w-4 fill-white" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.preventDefault();
                    removeFromFavorites(product.id);
                  }}
                  className="h-8 w-8 rounded-full glassmorphism border border-border/50 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-300 ripple"
                >
                  <Trash2 className="h-4 w-4" />
                </motion.button>
              </motion.div>

              {/* Favorite Badge */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-primary text-primary-foreground px-2 py-1 text-xs">
                  <Heart className="h-3 w-3 mr-1 fill-white" />
                  Saved
                </Badge>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/10"
        >
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Value</p>
            <p className="text-3xl font-bold text-elegant bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ${totalPrice.toFixed(2)}
            </p>
          </div>
          
          <div className="flex gap-3">
            <Link to="/products">
              <Button variant="outline" className="text-elegant">
                <LinkIcon className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
            <Button 
              onClick={handleAddAllToCart}
              className="text-elegant bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add All to Cart
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Favorites;

