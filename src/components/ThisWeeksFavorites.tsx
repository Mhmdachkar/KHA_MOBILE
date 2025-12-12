import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ShoppingCart, Star, TrendingUp, Zap, ArrowRight, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useToast } from "@/hooks/use-toast";
import { getGreenLionProductById } from "@/data/greenLionProducts";
import { getProductById } from "@/data/products";
// Import recharge card images
import recharge10 from "@/assets/recharges/10$.png";
import recharge15_15 from "@/assets/recharges/15.15$.png";

// Helper function to get recharge card by ID
const getRechargeCardById = (id: number) => {
  const rechargeCards: any[] = [
    { id: 7, name: "Touch $10 Card", price: 10, image: recharge10, category: "Touch Cards", rating: 4.8 },
    { id: 9, name: "Touch $15.15 Card", price: 15.15, image: recharge15_15, category: "Touch Cards", rating: 4.8 },
  ];
  return rechargeCards.find(card => card.id === id);
};

// Define 6 strategically selected products for maximum sales
// Mix of high-demand, trending, and best-selling items
const FEATURED_PRODUCTS = [
  { id: 101, type: "regular" },    // Hoco Q37 Fast Charging Power Bank (10000mAh)
  { id: 9, type: "recharge" },     // Touch $15.15 Card (15 MTC)
  { id: 309, type: "regular" },    // Samsung Galaxy A56
  { id: 205, type: "regular" },    // Apple Watch SE3 (2nd generation) 40mm
  { id: 128, type: "regular" },    // Apple AirPods 4 (Original)
  { id: 401, type: "regular" },    // Samsung Galaxy Tab A9
];

interface FeaturedProductCardProps {
  product: any;
  index: number;
  isBestSeller?: boolean;
  isTrending?: boolean;
  hasDiscount?: boolean;
  discountPercent?: number;
}

const FeaturedProductCard = ({ 
  product, 
  index, 
  isBestSeller = false,
  isTrending = false,
  hasDiscount = false,
  discountPercent = 0
}: FeaturedProductCardProps) => {
  const navigate = useNavigate();
  const { addToCart, openCart } = useCart();
  const favoritesContext = useFavorites();
  const { toast } = useToast();
  const favorite = favoritesContext.isFavorite(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || product.images?.[0],
      quantity: 1,
    });
    
    openCart();
    
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleQuickBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Recharge cards go directly to checkout, others go to product page
    if (product.category === "Touch Cards" || product.category === "Days Cards" || product.category === "Alfa Cards") {
      const params = new URLSearchParams({
        id: product.id.toString(),
        name: product.name,
        price: product.price.toString(),
        image: product.image || product.images?.[0],
        category: product.category
      });
      navigate(`/checkout?${params.toString()}`);
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    favoritesContext.toggleFavorite({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || product.images?.[0],
      rating: product.rating,
      category: product.category,
    });
  };

  if (!product) return null;

  const displayPrice = hasDiscount 
    ? product.price * (1 - discountPercent / 100)
    : product.price;
  const originalPrice = hasDiscount ? product.price : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group relative bg-white rounded-lg overflow-hidden border-2 border-border hover:border-primary/60 transition-all duration-300 shadow-lg hover:shadow-2xl"
      style={{ touchAction: 'pan-y' }}
    >
      <Link 
        to={product.category === "Touch Cards" || product.category === "Days Cards" || product.category === "Alfa Cards" ? "/recharges" : `/product/${product.id}`}
      >
        {/* Image Container with Badges */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-secondary/30 to-background">
          {/* Top Badges */}
          <div className="absolute top-2 left-2 right-2 z-20 flex flex-wrap gap-2">
            {isBestSeller && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 text-[10px] sm:text-xs px-2 py-0.5 font-semibold shadow-md">
                <TrendingUp className="w-3 h-3 mr-1" />
                Best Seller
              </Badge>
            )}
            {isTrending && (
              <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 text-[10px] sm:text-xs px-2 py-0.5 font-semibold shadow-md">
                <Zap className="w-3 h-3 mr-1" />
                Trending
              </Badge>
            )}
            {hasDiscount && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-[10px] sm:text-xs px-2 py-0.5 font-semibold shadow-md">
                {discountPercent}% OFF
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            className="absolute top-2 right-2 z-20 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm border border-border/50 flex items-center justify-center transition-all duration-300 hover:bg-primary hover:text-white hover:border-primary shadow-md"
            style={{ touchAction: 'manipulation' }}
            aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`w-4 h-4 ${favorite ? "fill-red-500 text-red-500" : ""}`} />
          </button>

          {/* Product Image */}
          <motion.img
            src={product.image || product.images?.[0]}
            alt={product.name}
            className="w-full h-full object-contain p-4 sm:p-6 transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />

          {/* Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content Section */}
        <div className="p-4 sm:p-5">
          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-xs sm:text-sm font-semibold text-elegant">
              {product.rating?.toFixed(1) || "4.5"}
            </span>
            <span className="text-[10px] sm:text-xs text-muted-foreground ml-1">
              ({Math.floor(Math.random() * 200 + 50)})
            </span>
          </div>

          {/* Product Name */}
          <h3 className="text-sm sm:text-base font-semibold text-elegant mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2 mb-4">
            {hasDiscount && originalPrice && (
              <span className="text-xs sm:text-sm text-muted-foreground line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ${displayPrice.toFixed(2)}
            </span>
          </div>

          {/* Quick Actions - Always Visible for Sales Focus */}
          <div className="flex flex-col gap-2">
            {/* Primary CTA - Buy Now (Full Width for Maximum Conversion) */}
            <Button
              onClick={handleQuickBuy}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              style={{ touchAction: 'manipulation' }}
            >
              Buy Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            {/* Secondary CTA - Add to Cart */}
            <Button
              onClick={handleAddToCart}
              variant="outline"
              className="w-full border-2 font-medium hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
              style={{ touchAction: 'manipulation' }}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const ThisWeeksFavorites = () => {
  // Helper function to get display price (uses first variant price if variants exist, otherwise base price)
  const getDisplayPrice = (product: any): number => {
    if (product?.variants && product.variants.length > 0) {
      return product.variants[0].price;
    }
    return product?.price || 0;
  };

  // Get products data
  const featuredProductsData = FEATURED_PRODUCTS.map((item, index) => {
    let product;
    if (item.type === "greenLion") {
      product = getGreenLionProductById(item.id);
    } else if (item.type === "recharge") {
      product = getRechargeCardById(item.id);
      // Add images array for recharge cards to match other products
      if (product) {
        product.images = [product.image];
      }
    } else {
      product = getProductById(item.id);
    }

    // Update price to use display price (first variant if exists)
    if (product) {
      product = {
        ...product,
        price: getDisplayPrice(product)
      };
    }

    // Products that should not have discounts
    const noDiscountProducts = [309, 401]; // Samsung Galaxy A56 and Samsung Galaxy Tab A9
    
    return {
      product,
      index,
      // Sales-focused labels - rotate for variety
      isBestSeller: index % 3 === 0, // Every 3rd product is best seller
      isTrending: index % 3 === 1, // Every 3rd product is trending
      hasDiscount: index % 3 === 2 && !noDiscountProducts.includes(item.id), // Every 3rd product has discount (except excluded products)
      discountPercent: index % 3 === 2 && !noDiscountProducts.includes(item.id) ? 15 : 0, // 15% discount (except excluded products)
    };
  }).filter(item => item.product); // Filter out any null products

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-background to-secondary/30 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-10 md:mb-12"
        >
          <Badge className="mb-3 sm:mb-4 bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-primary/20 px-4 py-1">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Weekly Specials
          </Badge>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-elegant mb-3 sm:mb-4"
          >
            This Week's Favorites
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Handpicked products that our customers love. Limited stock available - grab yours before they're gone!
          </motion.p>
        </motion.div>

        {/* Products Grid - Responsive for Desktop: 2 rows x 3 columns = 6 products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8 xl:gap-10">
          {featuredProductsData.map(({ product, index, isBestSeller, isTrending, hasDiscount, discountPercent }) => (
            <FeaturedProductCard
              key={product.id}
              product={product}
              index={index}
              isBestSeller={isBestSeller}
              isTrending={isTrending}
              hasDiscount={hasDiscount}
              discountPercent={discountPercent}
            />
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8 sm:mt-10 md:mt-12"
        >
          <Link to="/products">
            <Button
              variant="outline"
              size="lg"
              className="border-2 font-semibold px-8 py-6 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
            >
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ThisWeeksFavorites;

