import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/context/FavoritesContext";
import { useCart } from "@/context/CartContext";
import { getProductById, phoneAccessories, wearablesProducts, smartphoneProducts } from "@/data/products";
import { getGreenLionProductById, greenLionProducts } from "@/data/greenLionProducts";
import ProductCard from "@/components/ProductCard";
import ProductCarousel from "@/components/ProductCarousel";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();

  const productId = id ? parseInt(id, 10) : null;
  
  // Check both regular products and Green Lion products
  const regularProduct = productId ? getProductById(productId) : null;
  const greenLionProduct = productId ? getGreenLionProductById(productId) : null;
  const product = regularProduct || greenLionProduct;

  // Scroll to top on mount and when product ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [id]);

  // If product not found, redirect to products page
  useEffect(() => {
    if (productId && !product) {
      navigate("/products");
    }
  }, [productId, product, navigate]);

  if (!product) {
    return (
      <div className="min-h-screen bg-white no-horizontal-scroll overflow-x-hidden">
        <Header />
        <div className="container mx-auto px-6 py-12 text-center">
          <h2 className="text-2xl mb-4">Product not found</h2>
          <Link to="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Variant handling (for smartphones and future configurable products)
  const variantOptions = useMemo(() => product.variants || [], [product]);
  const [searchParams] = useSearchParams();
  const variantParam = searchParams.get("variant");
  const [selectedVariantKey, setSelectedVariantKey] = useState<string | null>(null);
  useEffect(() => {
    if (variantOptions.length === 0) {
      setSelectedVariantKey(null);
      return;
    }
    if (variantParam) {
      const matched = variantOptions.find((variant) => variant.key === variantParam);
      if (matched) {
        setSelectedVariantKey(matched.key);
        return;
      }
    }
    setSelectedVariantKey(variantOptions[0]?.key ?? null);
  }, [variantOptions, variantParam]);
  const selectedVariant = useMemo(() => {
    if (variantOptions.length === 0) return null;
    return variantOptions.find((variant) => variant.key === selectedVariantKey) || variantOptions[0];
  }, [variantOptions, selectedVariantKey]);

  // Use multiple images for Green Lion or smartphone products, fallback to single image
  const productImages = useMemo(() => {
    if (greenLionProduct) {
      return greenLionProduct.images;
    }
    if (regularProduct?.images && regularProduct.images.length > 0) {
      return regularProduct.images;
    }
    return regularProduct ? [regularProduct.image] : [];
  }, [greenLionProduct, regularProduct]);

  useEffect(() => {
    setSelectedImage(0);
  }, [productImages]);

  const displayPrice = selectedVariant?.price ?? product.price;
  const primaryImage =
    productImages[0] ||
    regularProduct?.image ||
    (greenLionProduct ? greenLionProduct.images[0] : "/placeholder.svg");
  
  const favorite = isFavorite(product.id);

  const handleAddToCart = (redirect?: boolean) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: displayPrice,
      image: primaryImage,
      rating: product.rating,
      category: product.category,
      quantity: 1,
      variantKey: selectedVariant?.key,
      variantLabel: selectedVariant?.label,
    });

    if (redirect) {
      navigate("/checkout");
    }
  };

  // Image navigation handlers
  const handlePreviousImage = () => {
    setSelectedImage((prev) => (prev > 0 ? prev - 1 : productImages.length - 1));
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev < productImages.length - 1 ? prev + 1 : 0));
  };

  // Get all products from all sources (for comprehensive recommendations)
  // Combine regular products and Green Lion products
  const allProducts = [
    ...phoneAccessories.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
      images: [p.image],
      rating: p.rating,
      category: p.category,
      brand: p.brand || extractBrand(p.name),
      secondaryCategories: [],
    })),
    ...wearablesProducts.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
      images: [p.image],
      rating: p.rating,
      category: p.category,
      brand: p.brand || extractBrand(p.name),
      secondaryCategories: [],
    })),
    ...smartphoneProducts.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
      images: p.images && p.images.length > 0 ? p.images : [p.image],
      rating: p.rating,
      category: p.category,
      brand: p.brand || extractBrand(p.name),
      secondaryCategories: [],
    })),
    ...greenLionProducts.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.images[0],
      images: p.images,
      rating: p.rating,
      category: p.category,
      brand: p.brand,
      secondaryCategories: p.secondaryCategories || [],
    })),
  ];

  // Helper function to extract brand from product name
  function extractBrand(productName: string): string | null {
    const brandPatterns = [
      /^Green Lion\s+/i,
      /^Apple\s+/i,
      /^Samsung\s+/i,
      /^Sony\s+/i,
      /^Bose\s+/i,
      /^JBL\s+/i,
      /^Hoco\s+/i,
      /^Dobe\s+/i,
      /^Foneng\s+/i,
      /^Borofone\s+/i,
    ];
    
    for (const pattern of brandPatterns) {
      const match = productName.match(pattern);
      if (match) {
        return match[0].trim();
      }
    }
    return null;
  }

  // Multi-factor scoring recommendation algorithm
  const getRecommendedProducts = () => {
    const currentProduct = greenLionProduct || regularProduct;
    if (!currentProduct) return [];

    const currentBrand = greenLionProduct ? greenLionProduct.brand : extractBrand(product.name);
    const currentPrice = product.price;
    const currentCategory = product.category;
    const currentSecondaryCategories = greenLionProduct?.secondaryCategories || [];

    // Score each product
    const scoredProducts = allProducts
      .filter(p => p.id !== product.id) // Exclude current product
      .map(p => {
        let score = 0;

        // Factor 1: Category Match (40% weight = 40 points max)
        if (p.category === currentCategory) {
          score += 40; // Primary category match
        } else if (p.secondaryCategories?.includes(currentCategory)) {
          score += 20; // Secondary category match
        } else if (currentSecondaryCategories?.some(cat => p.category === cat || p.secondaryCategories?.includes(cat))) {
          score += 15; // Cross-category match
        }

        // Factor 2: Brand Match (25% weight = 25 points max)
        if (currentBrand && p.brand === currentBrand) {
          score += 25; // Same brand
        }

        // Factor 3: Price Similarity (20% weight = 20 points max)
        const priceDifference = Math.abs(p.price - currentPrice);
        const pricePercentage = (priceDifference / currentPrice) * 100;
        if (pricePercentage <= 20) {
          score += 20; // Within ±20%
        } else if (pricePercentage <= 50) {
          score += 10; // Within ±50%
        } else if (pricePercentage <= 100) {
          score += 5; // Within ±100%
        }

        // Factor 4: Rating (15% weight = 15 points max)
        if (p.rating >= 4.5) {
          score += 15; // High-rated (4.5+)
        } else if (p.rating >= 4.0) {
          score += 10; // Good (4.0-4.4)
        } else if (p.rating >= 3.5) {
          score += 5; // Average (3.5-3.9)
        }

        return {
          ...p,
          score,
        };
      })
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, 8); // Get top 8 recommendations (will show 4 in 2x2 grid, but having extras for better variety)

    return scoredProducts;
  };

  const relatedProducts = getRecommendedProducts();

  // Determine if this is a smartphone product for specialized display logic
  const isSmartphone = product.category === "Smartphones";

  return (
    <div className="min-h-screen bg-white no-horizontal-scroll overflow-x-hidden">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mb-4 sm:mb-6 md:mb-8 text-muted-foreground flex-wrap"
        >
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-foreground">Products</Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-[150px] sm:max-w-none">{product.name}</span>
        </motion.div>

        {/* Product Section */}
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 mb-12 sm:mb-16 md:mb-24">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            {/* Elegant Background Element for "Smart" feel */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-50 pointer-events-none animate-pulse" />
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-accent/5 rounded-full blur-3xl opacity-50 pointer-events-none" />

            <div className="relative aspect-square bg-white rounded-sm mb-4 sm:mb-6 overflow-hidden group border border-border">
              {/* Dynamic Background Animation behind the product */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-transparent opacity-30"
                animate={{ 
                  backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                }}
                transition={{ 
                  duration: 15, 
                  ease: "linear", 
                  repeat: Infinity 
                }} 
              />
              
              {/* Floating Geometric Accent for blank space */}
              <motion.div
                className="absolute top-10 right-10 w-20 h-20 border border-primary/10 rounded-full"
                animate={{ 
                  y: [0, -10, 0],
                  scale: [1, 1.05, 1],
                  opacity: [0.2, 0.5, 0.2]
                }}
                transition={{ 
                  duration: 8, 
                  ease: "easeInOut", 
                  repeat: Infinity 
                }}
              />

              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className={`h-full w-full ${isSmartphone ? "object-contain p-6 md:p-8" : "object-cover"} transition-opacity duration-300 relative z-10`}
                onError={(e) => {
                  // Fallback if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
              {productImages.length > 1 && (
                <>
                  <button 
                    onClick={handlePreviousImage}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 bg-background/80 backdrop-blur rounded-full flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-background/90 z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  <button 
                    onClick={handleNextImage}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 bg-background/80 backdrop-blur rounded-full flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-background/90 z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-white rounded-sm overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedImage === index
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/40"
                    }`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} - View ${index + 1}`}
                      className={`h-full w-full ${isSmartphone ? "object-contain p-1" : "object-cover"}`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* AR/360 Buttons - Hidden on mobile, shown on desktop */}
            <div className="hidden md:flex gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6">
              <Button variant="outline" className="flex-1 text-elegant text-xs sm:text-sm py-2 sm:py-3">
                360° View
              </Button>
              <Button variant="outline" className="flex-1 text-elegant text-xs sm:text-sm py-2 sm:py-3">
                AR Preview
              </Button>
            </div>

            {/* Elegant Feature Highlight (Desktop Only) - Fills blank space */}
            <div className="hidden md:block mt-6 sm:mt-8">
              <div className="bg-primary/5 border border-primary/10 rounded-md p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
                
                <h4 className="text-elegant font-medium mb-4 relative z-10 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Why this is a great choice
                </h4>
                
                <div className="space-y-3 relative z-10">
                  {product.features?.slice(0, 3).map((feature, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {feature}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-primary/10 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Authorized Reseller
                  </div>
                  <span>1 Year Warranty</span>
                </div>
              </div>
            </div>

            {/* Mobile Action Buttons - Only visible on mobile */}
            <div className="md:hidden mt-4 sm:mt-6">
              <div className="flex flex-col gap-3 mb-4">
                <Button 
                  size="lg" 
                  className="flex-1 text-elegant text-sm py-4 sm:py-5 w-full"
                  onClick={() => handleAddToCart()}
                  style={{ touchAction: 'manipulation' }}
                >
                  <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Add to Cart
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="flex-1 text-elegant text-sm py-4 sm:py-5 w-full"
                  onClick={() => handleAddToCart(true)}
                  style={{ touchAction: 'manipulation' }}
                >
                  Buy Now
                </Button>
              </div>
              
              {/* Wishlist Button - Well structured below Buy Now */}
              <motion.button 
                whileHover={window.matchMedia('(hover: hover)').matches ? { scale: 1.02 } : undefined}
                onClick={() => toggleFavorite(product)}
                style={{ touchAction: 'manipulation' }}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 sm:py-3.5 rounded-sm border transition-all duration-300 ${
                  favorite 
                    ? "bg-accent/10 text-accent border-accent/30 hover:bg-accent/20" 
                    : "bg-background text-foreground border-border hover:bg-secondary/50 hover:border-primary/40"
                }`}
              >
                <Heart className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors ${favorite ? "fill-accent text-accent" : ""}`} />
                <span className="text-elegant text-sm font-medium">
                  {favorite ? "Remove from Wishlist" : "Add to Wishlist"}
                </span>
              </motion.button>
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            {/* Elegant Backdrop for Info */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-b from-primary/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
            
            {/* Floating particle animation */}
            <motion.div
              className="absolute top-4 right-4 w-3 h-3 bg-primary/20 rounded-full blur-[1px]"
              animate={{
                y: [0, -15, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <h1 className="text-elegant text-2xl sm:text-3xl md:text-4xl mb-2 relative z-10">{product.title}</h1>
            <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">{product.category}</p>
            
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 flex-wrap">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 sm:h-4 sm:w-4 ${
                      i < Math.floor(product.rating)
                        ? "fill-foreground text-foreground"
                        : "text-border"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground">({product.rating} rating)</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex flex-col">
                <p className="text-elegant text-2xl sm:text-3xl">${displayPrice.toFixed(2)}</p>
                {selectedVariant?.label && (
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    Configuration: {selectedVariant.label}
                  </span>
                )}
              </div>
              <span className="text-xs sm:text-sm text-green-600 bg-green-50 px-2 sm:px-3 py-1 rounded-full">
                In Stock
              </span>
            </div>

            {variantOptions.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h4 className="text-elegant text-base mb-3">Choose your configuration</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {variantOptions.map((variant) => {
                    const isActive = selectedVariant?.key === variant.key;
                    return (
                      <button
                        key={variant.key}
                        onClick={() => setSelectedVariantKey(variant.key)}
                        style={{ touchAction: 'manipulation' }}
                        className={`text-left border rounded-sm p-3 sm:p-4 flex flex-col gap-1 transition-all duration-300 ${
                          isActive
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span className="text-sm font-semibold text-elegant">{variant.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {variant.ram} · {variant.storage}
                        </span>
                        <span className="text-sm text-elegant">${variant.price.toFixed(2)}</span>
                        {variant.description && (
                          <span className="text-[11px] text-muted-foreground">
                            {variant.description}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-elegant text-lg mb-3">Description</h3>
              <p className="text-sm font-light leading-relaxed text-muted-foreground mb-4">
                {product.description}
              </p>
              
              {/* Key Features */}
              {product.features && product.features.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-elegant text-base mb-3">Key Features</h4>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions - Hidden on mobile (buttons shown in image gallery), visible on desktop */}
            <div className="hidden md:flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
              <Button 
                size="lg" 
                className="flex-1 text-elegant text-sm sm:text-base py-4 sm:py-5 md:py-6"
                onClick={() => handleAddToCart()}
              >
                <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Add to Cart
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="flex-1 text-elegant text-sm sm:text-base py-4 sm:py-5 md:py-6"
                onClick={() => handleAddToCart(true)}
              >
                Buy Now
              </Button>
            </div>

            {/* Wishlist Button - Desktop only (mobile version is in image gallery) */}
            <motion.button 
              whileHover={window.matchMedia('(hover: hover)').matches ? { scale: 1.05 } : undefined}
              onClick={() => toggleFavorite(product)}
              style={{ touchAction: 'manipulation' }}
              className={`hidden md:flex items-center gap-2 text-sm transition-colors mb-12 ${
                favorite 
                  ? "text-accent" 
                  : "hover:text-accent"
              }`}
            >
              <Heart className={`h-4 w-4 ${favorite ? "fill-accent" : ""}`} />
              <span className="text-elegant">
                {favorite ? "Remove from Wishlist" : "Add to Wishlist"}
              </span>
            </motion.button>

            {/* Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="border-t border-border pt-8 mt-8">
                <h3 className="text-elegant text-xl mb-6">Technical Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {product.specifications.map((spec, index) => (
                    <div key={index} className="py-3 border-b border-border last:border-b-0">
                      <p className="text-xs text-muted-foreground mb-1 font-medium">{spec.label}</p>
                      <p className="text-sm font-light text-foreground">{spec.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Customer Feedback */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 sm:mb-16 md:mb-24"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <h2 className="text-elegant text-xl sm:text-2xl">Customer Feedback</h2>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="text-elegant w-full sm:w-auto">
                Filter Reviews
              </Button>
              <Button variant="default" size="sm" className="text-elegant w-full sm:w-auto">
                Write a Review
              </Button>
            </div>
          </div>

          <div className="bg-white border border-border rounded-sm p-8 mb-8">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-6xl font-light mb-2">4.9</p>
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-foreground text-foreground"
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">2,847 reviews</p>
              </div>
              <div className="flex-1">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-4 mb-2">
                    <span className="text-xs w-12">{rating} stars</span>
                    <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-foreground"
                        style={{
                          width: `${rating === 5 ? 85 : rating === 4 ? 10 : 3}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-12">
                      {rating === 5 ? "85%" : rating === 4 ? "10%" : "3%"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* You May Also Like - Horizontal Scrolling Carousel */}
        {relatedProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 sm:mt-16 md:mt-24"
          >
            <ProductCarousel
              title="You May Also Like"
              products={relatedProducts.slice(0, 12).map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                image: p.image,
                images: p.images,
                rating: p.rating,
                category: p.category,
              }))}
            />
          </motion.section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
