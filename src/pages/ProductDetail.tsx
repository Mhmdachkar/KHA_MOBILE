import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star, ChevronLeft, ChevronRight, CheckCircle2, Check, Minus, Plus } from "lucide-react";
import { Link, useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { resolveImageUrl } from "@/lib/imageUtils";
import { getPdpPricePresentation, formatMoney } from "@/lib/storefrontPricing";
import { getStockBadgeInfo } from "@/lib/stockStatus";
import { addRecentlyViewed } from "@/lib/recentlyViewed";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/context/FavoritesContext";
import { useCart } from "@/context/CartContext";
import { useAnalytics } from "@/context/AnalyticsContext";
import { useCatalog } from "@/context/CatalogContext";
import { filterByCategoryPage } from "@/lib/catalogFilters";
import type { StorefrontProduct } from "@/lib/catalogProduct";
import { findStoreProductSplit } from "@/data/productLookup";
import ProductCard from "@/components/ProductCard";
import ProductCarousel from "@/components/ProductCarousel";
import RecentlyViewed from "@/components/RecentlyViewed";
import ImageLightbox from "@/components/ImageLightbox";
import { useEnsureMobileScroll } from "@/hooks/useEnsureMobileScroll";
import { useScrollLockRestore } from "@/hooks/useScrollLockRestore";

const ProductDetail = () => {
  const location = useLocation();
  // Ensure mobile scrolling always works
  useEnsureMobileScroll();
  // Restore scroll when Radix Select/Dialog leave orphaned locks (color, size, variant selectors)
  useScrollLockRestore(location.pathname);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const { trackProductView, trackAddToCart } = useAnalytics();
  const { storefrontProducts } = useCatalog();

  const productId = id ? parseInt(id, 10) : null;

  // Check both regular products and Green Lion products
  const { regularProduct: reg, greenLionProduct: gl } = productId
    ? findStoreProductSplit(productId)
    : { regularProduct: null, greenLionProduct: null };
  const regularProduct = reg;
  const greenLionProduct = gl;
  const product = regularProduct || greenLionProduct;

  // Track product view
  useEffect(() => {
    if (product && productId) {
      trackProductView(productId.toString(), product.name);
      addRecentlyViewed(productId);
    }
  }, [productId, product, trackProductView]);

  // Scroll to top on mount and when product ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [id]);

  // All hooks must be called unconditionally (Rules of Hooks)
  const variantOptions = useMemo(() => product?.variants || [], [product]);
  const [searchParams] = useSearchParams();
  const variantParam = searchParams.get("variant");
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(-1);
  useEffect(() => {
    if (variantOptions.length === 0) {
      setSelectedVariantIndex(-1);
      return;
    }
    if (variantParam) {
      const idx = variantOptions.findIndex((variant) => variant.key === variantParam);
      if (idx !== -1) {
        setSelectedVariantIndex(idx);
        return;
      }
    }
    setSelectedVariantIndex(0);
  }, [variantOptions, variantParam]);
  const selectedVariant = useMemo(() => {
    if (variantOptions.length === 0) return null;
    if (selectedVariantIndex >= 0 && selectedVariantIndex < variantOptions.length) {
      return variantOptions[selectedVariantIndex];
    }
    return variantOptions[0];
  }, [variantOptions, selectedVariantIndex]);

  const productImages = useMemo(() => {
    let raw: string[];
    if (greenLionProduct) {
      raw = greenLionProduct.images;
    } else if (regularProduct?.images && regularProduct.images.length > 0) {
      raw = regularProduct.images;
    } else {
      raw = regularProduct ? [regularProduct.image] : [];
    }
    return raw.map(resolveImageUrl);
  }, [greenLionProduct, regularProduct]);

  const colorOptions = useMemo(() => product?.colors || [], [product]);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(-1);
  const selectedColor = selectedColorIndex >= 0 && selectedColorIndex < colorOptions.length
    ? colorOptions[selectedColorIndex].name
    : null;

  // If product not found, redirect to products page
  useEffect(() => {
    if (productId && !product) {
      navigate("/products");
    }
  }, [productId, product, navigate]);

  useEffect(() => {
    // Reset selectedColor when product changes
    setSelectedColorIndex(-1);
  }, [product?.id]);

  useEffect(() => {
    // Set default color when product has colors
    if (colorOptions.length > 0 && selectedColorIndex < 0) {
      setSelectedColorIndex(0);
    }
  }, [colorOptions, selectedColorIndex]);

  const colorImage = useMemo(() => {
    if (selectedColorIndex < 0 || !colorOptions.length) return null;
    const color = colorOptions[selectedColorIndex];
    return color?.image ? resolveImageUrl(color.image) : undefined;
  }, [selectedColorIndex, colorOptions]);

  // Size selection handling
  const sizeOptions = useMemo(() => product?.sizes || [], [product]);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState<number>(-1);
  const selectedSize = selectedSizeIndex >= 0 && selectedSizeIndex < sizeOptions.length
    ? sizeOptions[selectedSizeIndex].name
    : null;

  useEffect(() => {
    // Reset selectedSize when product changes
    setSelectedSizeIndex(-1);
  }, [product?.id]);

  useEffect(() => {
    // Set default size when product has sizes
    if (sizeOptions.length > 0 && selectedSizeIndex < 0) {
      setSelectedSizeIndex(0);
    }
  }, [sizeOptions, selectedSizeIndex]);

  const selectedSizeData = useMemo(() => {
    if (selectedSizeIndex < 0 || !sizeOptions.length) return null;
    return sizeOptions[selectedSizeIndex];
  }, [selectedSizeIndex, sizeOptions]);

  const [cartQuantity, setCartQuantity] = useState(1);
  useEffect(() => {
    setCartQuantity(1);
  }, [product?.id]);

  // Track if user manually clicked an image (to prevent color sync from overriding)
  const manualImageSelectionRef = useRef(false);

  // When color changes from COLOR BUTTON click, update selectedImage
  // But don't interfere if user manually clicked an image thumbnail
  useEffect(() => {
    // Only sync if this was a deliberate color change, not from clicking an image
    if (!manualImageSelectionRef.current && colorImage && productImages.length > 0) {
      const index = productImages.findIndex(img => img === colorImage);
      if (index !== -1) {
        setSelectedImage(index);
      }
    }
    // Reset the manual flag after color sync attempt
    if (manualImageSelectionRef.current) {
      manualImageSelectionRef.current = false;
    }
  }, [colorImage, productImages]);

  if (!product) {
    return (
      <div className="min-h-screen bg-white w-full">
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

  const stockQty = (product as { stockQuantity?: number | null }).stockQuantity;
  const stockBadge = getStockBadgeInfo(stockQty, product.isPreorder);
  const cannotPurchase = !stockBadge.canPurchase;

  const pdpPricing = getPdpPricePresentation(
    {
      price: product.price,
      compareAtPrice: "compareAtPrice" in product ? product.compareAtPrice : null,
      variants: product.variants,
      sizes: product.sizes,
    },
    selectedVariant?.price,
    selectedSizeData?.price != null ? Number(selectedSizeData.price) : null
  );
  const displayPrice = pdpPricing.displayPrice;
  const showRetailDiscount = pdpPricing.showDiscount;
  const listCompareAt = pdpPricing.compareAtPrice ?? NaN;
  const showPriceWhenPreorder = product.showPreorderPrice !== false;
  const preorderHideNumeric =
    Boolean(product.isPreorder) &&
    (!showPriceWhenPreorder || Number(displayPrice) === 0);

  const maxCartQuantity =
    stockQty != null && stockQty > 0 ? stockQty : 99;

  const stickySelection = useMemo(() => {
    const parts: string[] = [];
    let incomplete = false;
    if (variantOptions.length > 0) {
      if (selectedVariant?.label) parts.push(selectedVariant.label);
      else incomplete = true;
    }
    if (colorOptions.length > 1) {
      if (selectedColor) parts.push(selectedColor);
      else incomplete = true;
    }
    if (sizeOptions.length > 0) {
      if (selectedSize) parts.push(selectedSize);
      else incomplete = true;
    }
    return { text: parts.join(" · "), incomplete };
  }, [
    variantOptions.length,
    selectedVariant?.label,
    colorOptions.length,
    selectedColor,
    sizeOptions.length,
    selectedSize,
  ]);

  // Helper function to format price (handles both number and string)
  const formatPrice = (price: number | string, isPreorder?: boolean): string => {
    // Show "Pre-order" for preorder items with price 0
    if (isPreorder && Number(price) === 0) {
      return "Pre-order";
    }
    if (typeof price === 'string') {
      return price;
    }
    return price.toFixed(2);
  };
  const primaryImage =
    productImages[0] ||
    resolveImageUrl(regularProduct?.image) ||
    (greenLionProduct ? resolveImageUrl(greenLionProduct.images[0]) : "/placeholder.svg");

  const favorite = isFavorite(product.id);

  // Show-more toggles to reduce scrolling on mobile
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [showAllSpecs, setShowAllSpecs] = useState(false);

  const truncatedDescription =
    product.description && product.description.length > 220 && !showFullDescription
      ? `${product.description.slice(0, 220)}…`
      : product.description;

  const FEATURE_LIMIT = 6;
  const SPEC_LIMIT = 6;
  const displayedFeatures =
    product.features && !showAllFeatures ? product.features.slice(0, FEATURE_LIMIT) : product.features;
  const displayedSpecs =
    product.specifications && !showAllSpecs ? product.specifications.slice(0, SPEC_LIMIT) : product.specifications;

  const handleAddToCart = (redirect?: boolean) => {
    if (cannotPurchase) return;
    if (variantOptions.length > 0 && !selectedVariant) return;
    if (sizeOptions.length > 0 && !selectedSize) return;
    if (colorOptions.length > 1 && !selectedColor) return;

    // Get the color image if a color is selected
    const selectedColorImage = colorImage || (selectedColor ? colorOptions.find(c => c.name === selectedColor)?.image : null);
    const displayImage = selectedColorImage || primaryImage;

    addToCart({
      id: product.id,
      name: product.name,
      price: displayPrice,
      image: displayImage,
      rating: product.rating,
      category: product.category,
      quantity: cartQuantity,
      variantKey: selectedVariant?.key,
      variantLabel: selectedVariant?.label,
      color: selectedColor || undefined,
      colorImage: selectedColorImage || undefined,
      size: selectedSize || undefined,
      sizePrice: selectedSizeData?.price,
      isPreorder: product.isPreorder,
    });

    // Track add to cart action
    trackAddToCart(product.id.toString(), product.name, displayPrice);

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

  const allProducts: StorefrontProduct[] = storefrontProducts;

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
    const currentPrice =
      allProducts.find((p) => p.id === product.id)?.displayPrice ??
      (typeof product.price === "number" ? product.price : Number(product.price) || 0);
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
        const priceDifference = Math.abs(p.displayPrice - currentPrice);
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

  // Get smart accessory recommendations for smartphones
  const getSmartAccessories = () => {
    if (!isSmartphone) return [];

    const seen = new Set<number>();
    const allAccessories: StorefrontProduct[] = [];
    for (const cat of ["Accessories", "Charging", "Audio"] as const) {
      for (const p of filterByCategoryPage(storefrontProducts, cat)) {
        if (!seen.has(p.id)) {
          seen.add(p.id);
          allAccessories.push(p);
        }
      }
    }

    // Prioritize essential phone accessories
    const essentialKeywords = [
      'case', 'cover', 'screen protector', 'charger', 'cable', 'adapter',
      'power bank', 'holder', 'stand', 'usb', 'type-c', 'lightning',
      'wireless', 'magsafe', 'charging', 'wall adapter'
    ];

    // Score and sort accessories
    const scoredAccessories = allAccessories.map(acc => {
      let score = 0;
      const nameLower = acc.name.toLowerCase();

      // Boost essential accessories
      essentialKeywords.forEach(keyword => {
        if (nameLower.includes(keyword)) score += 10;
      });

      // Boost highly rated products
      if (acc.rating >= 4.5) score += 5;

      // Boost Green Lion products
      if (acc.id >= 5000 || acc.brand === "Green Lion") score += 8;

      // Boost charging accessories
      if (acc.category === "Charging") score += 7;

      // Boost audio accessories
      if (acc.category === "Audio") score += 6;

      return { ...acc, score };
    });

    // Don't limit the results - return all accessories so Audio filter can show all audio products
    return scoredAccessories
      .sort((a, b) => b.score - a.score);
  };

  const smartAccessories = getSmartAccessories();

  const accessoryFilters = ["All Essentials", "Charging", "Protection", "Audio"] as const;
  const [selectedAccessoryFilter, setSelectedAccessoryFilter] = useState<(typeof accessoryFilters)[number]>("All Essentials");

  const determineAccessoryCategory = (accessory: typeof smartAccessories[number]) => {
    const name = accessory.name.toLowerCase();
    const primaryCategory = accessory.category?.toLowerCase() || "";

    // Check Audio FIRST to ensure audio products are never categorized as Charging or Protection
    const matchesAudio =
      primaryCategory === "audio" ||
      ["earbud", "speaker", "headphone", "neckband", "buds", "audio", "sound", "airpods", "airpod", "wireless earbuds", "true wireless"].some((keyword) => name.includes(keyword));

    // Only check charging if it's NOT an audio product
    const matchesCharging = !matchesAudio && (
      primaryCategory === "charging" ||
      ["charger", "charging", "power bank", "adapter", "cable", "usb", "type-c", "lightning", "wall", "dock", "magsafe"].some((keyword) =>
        name.includes(keyword)
      )
    );

    // Only check protection if it's NOT an audio product
    const matchesProtection = !matchesAudio &&
      ["case", "cover", "protector", "screen", "holder", "stand", "mount", "armour", "sleeve"].some((keyword) =>
        name.includes(keyword)
      );

    // Priority: Audio first, then Charging, then Protection
    if (matchesAudio) return "Audio" as const;
    if (matchesCharging) return "Charging" as const;
    if (matchesProtection) return "Protection" as const;
    return "All Essentials" as const;
  };

  const categorizedAccessories = useMemo(() => {
    return smartAccessories.map((accessory) => ({
      ...accessory,
      accessoryCategory: determineAccessoryCategory(accessory),
    }));
  }, [smartAccessories]);

  const filteredAccessories = useMemo(() => {
    if (selectedAccessoryFilter === "All Essentials") {
      return categorizedAccessories;
    }
    return categorizedAccessories.filter((accessory) => accessory.accessoryCategory === selectedAccessoryFilter);
  }, [categorizedAccessories, selectedAccessoryFilter]);

  return (
    <div className="min-h-screen bg-white w-full">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12 pb-36 md:pb-12 max-w-full overflow-x-hidden">
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
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-12 xl:gap-16 mb-8 sm:mb-12 md:mb-16 lg:mb-24 w-full">
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

            <div
              className="relative aspect-square bg-white rounded-sm mb-4 sm:mb-6 overflow-hidden group border border-border"
            >
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
                className="h-full w-full object-contain p-4 sm:p-6 md:p-8 transition-opacity duration-300 relative z-10 cursor-pointer hover:opacity-90"
                style={{ maxHeight: "100%", maxWidth: "100%", margin: "0 auto" }}
                onClick={() => setIsLightboxOpen(true)}
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
                    style={{ touchAction: 'manipulation', minHeight: '44px', minWidth: '44px' }}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-11 w-11 sm:h-12 sm:w-12 bg-background/90 backdrop-blur-md rounded-full flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-background shadow-lg border border-border/50 z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    style={{ touchAction: 'manipulation', minHeight: '44px', minWidth: '44px' }}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-11 w-11 sm:h-12 sm:w-12 bg-background/90 backdrop-blur-md rounded-full flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-background shadow-lg border border-border/50 z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {productImages.length > 1 && (
              <div
                className="grid grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 mb-4 sm:mb-6 w-full"
              >
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Mark this as a manual selection
                      manualImageSelectionRef.current = true;
                      setSelectedImage(index);

                      // Sync color selection when clicking on images
                      if (colorOptions.length > 0) {
                        // Try to find which color this image corresponds to
                        const matchingColorIdx = colorOptions.findIndex(color => color.image === image);
                        if (matchingColorIdx !== -1) {
                          setSelectedColorIndex(matchingColorIdx);
                        }
                      }
                    }}
                    type="button"
                    style={{ touchAction: "manipulation", minHeight: "60px", minWidth: "60px" }}
                    className={`aspect-square bg-white rounded-sm overflow-hidden border-2 transition-all cursor-pointer min-h-[70px] sm:min-h-[80px] md:min-h-[90px] flex items-center justify-center p-1.5 sm:p-2 ${selectedImage === index
                      ? "border-primary ring-2 ring-primary/30 shadow-md"
                      : "border-border hover:border-primary/50"
                      }`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} - View ${index + 1}`}
                      className="h-full w-full object-contain pointer-events-none"
                      style={{ maxHeight: '100%', maxWidth: '100%', margin: '0 auto', objectFit: 'contain' }}
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Elegant Feature Highlight (Desktop Only) - Fills blank space */}
            <div className="hidden md:block mt-6 sm:mt-8">
              <div className="bg-primary/5 border border-primary/10 rounded-md p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />

                <h4 className="text-elegant font-medium mb-4 relative z-10 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Why this is a great choice
                </h4>

                <div className="flex flex-col gap-3 relative z-10">
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
            <motion.div className="md:hidden mt-4 sm:mt-6">
              {(stickySelection.text || stickySelection.incomplete) && (
                <p
                  className={`text-xs mb-2 truncate ${stickySelection.incomplete ? "text-amber-600" : "text-muted-foreground"}`}
                  title={stickySelection.text}
                >
                  {stickySelection.incomplete ? "Select options above" : stickySelection.text}
                </p>
              )}
              {!cannotPurchase && (
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Quantity</span>
                  <div
                    className="flex items-center border border-border rounded-lg bg-background"
                    aria-label="Quantity"
                  >
                    <button
                      type="button"
                      onClick={() => setCartQuantity((q) => Math.max(1, q - 1))}
                      disabled={cartQuantity <= 1}
                      className="h-10 w-10 flex items-center justify-center hover:bg-muted disabled:opacity-40 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-medium w-10 text-center tabular-nums">{cartQuantity}</span>
                    <button
                      type="button"
                      onClick={() => setCartQuantity((q) => Math.min(maxCartQuantity, q + 1))}
                      disabled={cartQuantity >= maxCartQuantity}
                      className="h-10 w-10 flex items-center justify-center hover:bg-muted disabled:opacity-40 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-3 mb-4">
                <Button
                  size="lg"
                  className="flex-1 text-elegant text-sm py-4 sm:py-5 w-full"
                  onClick={() => handleAddToCart()}
                  disabled={cannotPurchase || stickySelection.incomplete}
                  style={{ touchAction: "manipulation" }}
                >
                  <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  {cannotPurchase
                    ? "Out of Stock"
                    : stickySelection.incomplete
                      ? "Choose options"
                      : product.isPreorder
                        ? `Preorder Now${cartQuantity > 1 ? ` (${cartQuantity})` : ""}`
                        : `Add to Cart${cartQuantity > 1 ? ` (${cartQuantity})` : ""}`}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 text-elegant text-sm py-4 sm:py-5 w-full"
                  onClick={() => handleAddToCart(true)}
                  disabled={cannotPurchase || stickySelection.incomplete}
                  style={{ touchAction: "manipulation" }}
                >
                  {cannotPurchase
                    ? "Unavailable"
                    : stickySelection.incomplete
                      ? "Choose options"
                      : product.isPreorder
                        ? "Preorder & Checkout"
                        : "Buy Now"}
                </Button>
              </div>

              {/* Wishlist Button - Well structured below Buy Now */}
              <motion.button
                whileHover={window.matchMedia('(hover: hover)').matches ? { scale: 1.02 } : undefined}
                onClick={() => toggleFavorite(product)}
                style={{ touchAction: 'manipulation' }}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 sm:py-3.5 rounded-sm border transition-all duration-300 ${favorite
                  ? "bg-accent/10 text-accent border-accent/30 hover:bg-accent/20"
                  : "bg-background text-foreground border-border hover:bg-secondary/50 hover:border-primary/40"
                  }`}
              >
                <Heart className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors ${favorite ? "fill-accent text-accent" : ""}`} />
                <span className="text-elegant text-sm font-medium">
                  {favorite ? "Remove from Wishlist" : "Add to Wishlist"}
                </span>
              </motion.button>
            </motion.div>
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

            <h1 className="text-elegant text-xl sm:text-2xl md:text-3xl mb-2 relative z-10 leading-tight sm:leading-normal" style={{ userSelect: 'text', WebkitUserSelect: 'text' }}>{product.title}</h1>
            <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4" style={{ userSelect: 'text', WebkitUserSelect: 'text' }}>{product.category}</p>

            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 flex-wrap w-full">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 sm:h-4 sm:w-4 ${i < Math.floor(product.rating)
                      ? "fill-primary text-primary"
                      : "text-border fill-border/30"
                      }`}
                  />
                ))}
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground">({product.rating.toFixed(1)} rating)</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 w-full">
              <div className="flex flex-col">
                {preorderHideNumeric ? (
                  <p className="text-elegant text-2xl sm:text-3xl font-bold text-primary">Pre-order</p>
                ) : showRetailDiscount && Number.isFinite(listCompareAt) ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-base sm:text-lg text-muted-foreground line-through">
                        ${listCompareAt.toFixed(2)}
                      </span>
                      <span className="text-xs font-bold rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 px-2 py-0.5">
                        {pdpPricing.discountPercent}% OFF
                      </span>
                    </div>
                    <p className="text-elegant text-2xl sm:text-3xl font-bold">
                      ${formatPrice(displayPrice, product.isPreorder)}
                    </p>
                  </div>
                ) : (
                  <p className="text-elegant text-2xl sm:text-3xl font-bold">${formatPrice(displayPrice, product.isPreorder)}</p>
                )}
                {selectedVariant?.label && (
                  <span className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Configuration: {selectedVariant.label}
                  </span>
                )}
              </div>
              <span
                className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full flex items-center gap-1 border ${stockBadge.className}`}
              >
                {stockBadge.label}
                {(selectedVariant?.stockNote || product.stockNote) && (
                  <span className="font-normal ml-1 italic opacity-80">
                    ({selectedVariant?.stockNote || product.stockNote})
                  </span>
                )}
              </span>
            </div>

            {(colorOptions.length > 0 || variantOptions.length > 0) && (
              <div
                className="mb-6 sm:mb-8 border border-border rounded-sm bg-secondary/20 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                {colorOptions.length > 0 && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Selected Color</p>
                    <p className="text-sm font-medium text-elegant">
                      {selectedColor || colorOptions[0].name}
                    </p>
                  </div>
                )}
                {variantOptions.length > 0 && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Selected Type</p>
                    <p className="text-sm font-medium text-elegant">
                      {selectedVariant?.label || variantOptions[0].label}
                    </p>
                  </div>
                )}
              </div>
            )}

            {product.connectivityOptions?.length ? (
              <div className="mb-6 sm:mb-8 border border-primary/30 bg-primary/5 rounded-sm p-4 sm:p-5">
                <p className="text-xs sm:text-sm font-semibold text-primary flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Connectivity Versions Available
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.connectivityOptions.map((option) => (
                    <span
                      key={option}
                      className="px-3 py-1.5 text-xs sm:text-sm rounded-full border border-primary/40 bg-white text-primary font-medium"
                    >
                      {option}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-3">
                  This model supports both fast Wi‑Fi and built‑in LTE / cellular, so you stay connected at home, in the office, and on the go with mobile data.
                </p>
              </div>
            ) : null}

            {colorOptions.length > 0 && (
              <div className="mb-6">
                <h4 className="text-elegant text-sm sm:text-base mb-3 font-medium">Select Color</h4>
                <div className="flex flex-wrap gap-3">
                  {colorOptions.map((color, colorIdx) => (
                    <button
                      key={color.name || `color-${colorIdx}`}
                      onClick={() => {
                        setSelectedColorIndex(colorIdx);

                        // Sync image selection when clicking on colors
                        if (color.image && productImages.length > 0) {
                          const imageIndex = productImages.findIndex(img => img === color.image);
                          if (imageIndex !== -1) {
                            setSelectedImage(imageIndex);
                          }
                        }
                      }}
                      style={{ touchAction: 'manipulation', minHeight: '44px' }}
                      className={`px-4 py-2 rounded-full text-xs sm:text-sm transition-all ${colorIdx === selectedColorIndex
                        ? "border-2 border-primary bg-primary/10 text-primary ring-2 ring-primary/30 font-semibold shadow-sm"
                        : "border border-border hover:border-primary/40 text-muted-foreground hover:bg-muted/30"
                        }`}
                    >
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sizeOptions.length > 0 && (
              <div className="mb-6">
                <h4 className="text-elegant text-sm sm:text-base mb-3 font-medium">Select Size</h4>
                <div className="flex flex-wrap gap-3">
                  {sizeOptions.map((size, sizeIdx) => (
                    <button
                      key={size.name || `size-${sizeIdx}`}
                      onClick={() => setSelectedSizeIndex(sizeIdx)}
                      style={{ touchAction: 'manipulation', minHeight: '44px' }}
                      className={`px-4 py-2 rounded-full text-xs sm:text-sm transition-all ${sizeIdx === selectedSizeIndex
                        ? "border-2 border-primary bg-primary/10 text-primary ring-2 ring-primary/30 font-semibold shadow-sm"
                        : "border border-border hover:border-primary/40 text-muted-foreground hover:bg-muted/30"
                        }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="font-medium">{size.name}</span>
                        <span className="text-xs opacity-75">${size.price}</span>
                      </div>
                    </button>
                  ))}
                </div>
                {selectedSizeData?.description && (
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    {selectedSizeData.description}
                  </p>
                )}
              </div>
            )}

            {variantOptions.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h4 className="text-elegant text-sm sm:text-base mb-3 sm:mb-4 font-medium">Choose your configuration</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  {variantOptions.map((variant, variantIndex) => {
                    const isActive = variantIndex === selectedVariantIndex;
                    return (
                      <button
                        key={variant.key || `variant-${variantIndex}`}
                        onClick={() => setSelectedVariantIndex(variantIndex)}
                        style={{ touchAction: 'manipulation', minHeight: '80px' }}
                        className={`relative text-left rounded-sm p-3 sm:p-4 flex flex-col gap-1.5 sm:gap-2 transition-all duration-300 ${isActive
                          ? "border-2 border-primary bg-primary/10 shadow-md ring-2 ring-primary/30"
                          : "border border-border hover:border-primary/40 hover:bg-muted/30"
                          }`}
                      >
                        {isActive && (
                          <span className="absolute top-2 right-2 flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                        <span className={`text-xs sm:text-sm font-semibold ${isActive ? "text-primary" : "text-elegant"}`}>{variant.label}</span>
                        <span className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
                          {variant.ram} · {variant.storage}
                        </span>
                        <span className="text-xs sm:text-sm text-elegant font-medium">
                          {product.isPreorder && (!showPriceWhenPreorder || Number(variant.price) === 0) ? (
                            <span className="text-primary">Pre-order</span>
                          ) : (
                            `$${formatPrice(variant.price, product.isPreorder)}`
                          )}
                        </span>
                        {variant.description && (
                          <span className="text-[10px] sm:text-[11px] text-muted-foreground leading-tight line-clamp-2">
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
              <h3 className="text-elegant text-lg mb-3 font-medium" style={{ userSelect: 'text', WebkitUserSelect: 'text' }}>Description</h3>
              <p className="text-sm font-light leading-relaxed text-muted-foreground mb-3 break-words" style={{ userSelect: 'text', WebkitUserSelect: 'text' }}>
                {truncatedDescription}
              </p>
              {product.description && product.description.length > 220 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  style={{ touchAction: 'manipulation' }}
                >
                  {showFullDescription ? "Show less" : "Show more"}
                </Button>
              )}

              {/* Key Features */}
              {displayedFeatures && displayedFeatures.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-elegant text-base mb-3 font-medium">Key Features</h4>
                  <ul className="flex flex-col gap-2">
                    {displayedFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground break-words">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {product.features && product.features.length > FEATURE_LIMIT && (
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => setShowAllFeatures(!showAllFeatures)}
                        style={{ touchAction: 'manipulation' }}
                      >
                        {showAllFeatures ? "Show less" : "Show more features"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions - Hidden on mobile (buttons shown in image gallery), visible on desktop */}
            <div className="hidden md:flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
              <Button
                size="lg"
                className="flex-1 text-elegant text-sm sm:text-base py-4 sm:py-5 md:py-6"
                onClick={() => handleAddToCart()}
                disabled={cannotPurchase}
                style={{ touchAction: 'manipulation' }}
              >
                <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                {cannotPurchase ? "Out of Stock" : product.isPreorder ? "Preorder Now" : "Add to Cart"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 text-elegant text-sm sm:text-base py-4 sm:py-5 md:py-6"
                onClick={() => handleAddToCart(true)}
                disabled={cannotPurchase}
                style={{ touchAction: 'manipulation' }}
              >
                {cannotPurchase ? "Unavailable" : product.isPreorder ? "Preorder & Checkout" : "Buy Now"}
              </Button>
            </div>

            {/* Wishlist Button - Desktop only (mobile version is in image gallery) */}
            <motion.button
              whileHover={window.matchMedia('(hover: hover)').matches ? { scale: 1.05 } : undefined}
              onClick={() => toggleFavorite(product)}
              style={{ touchAction: 'manipulation' }}
              className={`hidden md:flex items-center gap-2 text-sm transition-colors mb-12 ${favorite
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
            {displayedSpecs && displayedSpecs.length > 0 && (
              <div className="border-t border-border pt-8 mt-8">
                <h3 className="text-elegant text-xl mb-6 font-medium">Technical Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {displayedSpecs.map((spec, index) => (
                    <div key={index} className="py-3 border-b border-border last:border-b-0 break-words">
                      <p className="text-xs text-muted-foreground mb-1 font-medium">{spec.label}</p>
                      <p className="text-sm font-light text-foreground">{spec.value}</p>
                    </div>
                  ))}
                </div>
                {product.specifications && product.specifications.length > SPEC_LIMIT && (
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setShowAllSpecs(!showAllSpecs)}
                      style={{ touchAction: 'manipulation' }}
                    >
                      {showAllSpecs ? "Show less" : "Show more specs"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Product Video Section */}
        {product.video && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 sm:mt-16 md:mt-20 mb-12 sm:mb-16 md:mb-20"
          >
            <div className="text-center mb-6 sm:mb-8 md:mb-10 px-2">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4"
              >
                <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 7a1 1 0 012 0v6a1 1 0 11-2 0V7z" clipRule="evenodd" />
                </svg>
              </motion.div>
              <h2 className="text-elegant text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-2 sm:mb-3 md:mb-4">See It In Action</h2>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto font-light">
                Watch our detailed product demonstration to see all the features and capabilities in action.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="max-w-4xl mx-auto px-2 sm:px-4"
            >
              <div className="relative aspect-video bg-secondary rounded-xl overflow-hidden shadow-2xl">
                <video
                  controls
                  className="w-full h-full object-contain"
                  poster={resolveImageUrl((product as any).image)}
                  preload="metadata"
                >
                  <source src={resolveImageUrl((product as any).video)} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </motion.div>
          </motion.section>
        )}

        {/* Complete Your Setup - Smart Accessories for Smartphones */}
        {isSmartphone && filteredAccessories.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 sm:mt-16 md:mt-20 mb-12 sm:mb-16 md:mb-20"
          >
            {/* Section Header */}
            <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12 px-2">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", duration: 0.6 }}
                className="inline-block mb-3 sm:mb-4"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-primary" />
                </div>
              </motion.div>
              <h2 className="text-elegant text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-2 sm:mb-3 md:mb-4">Complete Your Setup</h2>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto font-light px-2">
                Essential accessories to enhance your smartphone experience. Handpicked for maximum compatibility and quality.
              </p>
            </div>

            {/* Category Tabs for Accessories */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 px-2">
              {accessoryFilters.map((tab, index) => {
                const isActive = selectedAccessoryFilter === tab;
                return (
                  <motion.button
                    key={tab}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    style={{ touchAction: 'manipulation' }}
                    onClick={() => setSelectedAccessoryFilter(tab)}
                    className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs md:text-sm border transition-all duration-300 min-h-[36px] sm:min-h-[40px] ${isActive
                      ? "border-primary bg-primary/5 text-primary shadow-sm font-medium"
                      : "border-border hover:border-primary/60 hover:bg-primary/5"
                      }`}
                  >
                    {tab}
                  </motion.button>
                );
              })}
            </div>

            {/* Accessories Horizontal Scroll */}
            <div className="relative group">
              <div
                className="flex gap-3 sm:gap-4 md:gap-5 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory px-2 sm:px-4 md:px-1"
                style={{
                  WebkitOverflowScrolling: "touch",
                  touchAction: "pan-x",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {filteredAccessories.map((accessory, index) => (
                  <motion.div
                    key={accessory.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex-none w-[180px] xs:w-[200px] sm:w-[220px] md:w-[240px] snap-start"
                  >
                    <ProductCard
                      id={accessory.id}
                      name={accessory.name}
                      title={accessory.title}
                      price={accessory.price}
                      compareAtPrice={accessory.compareAtPrice}
                      image={accessory.image}
                      images={accessory.images}
                      rating={accessory.rating}
                      category={accessory.category}
                      colors={accessory.colors}
                      isPreorder={accessory.isPreorder}
                      showPreorderPrice={accessory.showPreorderPrice}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-6 sm:mt-8 md:mt-10 lg:mt-12 px-2"
            >
              <Link to="/accessories">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-elegant text-xs sm:text-sm md:text-base min-h-[44px] sm:min-h-[48px]"
                  style={{ touchAction: 'manipulation' }}
                >
                  View All Accessories
                  <ChevronRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </Link>
            </motion.div>
          </motion.section>
        )}

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
              products={relatedProducts.slice(0, 12).map((p) => ({
                id: p.id,
                name: p.name,
                price: p.displayPrice,
                compareAtPrice: "compareAtPrice" in p ? p.compareAtPrice : undefined,
                image: p.image,
                images: p.images,
                rating: p.rating,
                category: p.category,
                colors: p.colors,
                variants: p.variants,
                sizes: p.sizes,
                isPreorder: p.isPreorder,
                showPreorderPrice: p.showPreorderPrice,
                stockQuantity: (p as { stockQuantity?: number | null }).stockQuantity,
              }))}
            />
          </motion.section>
        )}

        <RecentlyViewed />
      </div>

      {/* Mobile sticky buy bar */}
      <motion.div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 py-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
        <motion.div className="max-w-lg mx-auto space-y-2">
          <motion.div className="flex items-center gap-3 min-w-0">
            <motion.div className="flex-1 min-w-0">
              {stickySelection.text ? (
                <p className="text-[11px] text-muted-foreground truncate" title={stickySelection.text}>
                  {stickySelection.text}
                </p>
              ) : stickySelection.incomplete ? (
                <p className="text-[11px] text-amber-600">Select options above</p>
              ) : null}
              <p className="text-sm font-semibold text-primary leading-tight">
                {preorderHideNumeric ? (
                  "Pre-order"
                ) : (
                  <>
                    {formatMoney(displayPrice)}
                    {cartQuantity > 1 && (
                      <span className="text-xs font-normal text-muted-foreground">
                        {" "}
                        × {cartQuantity}
                      </span>
                    )}
                  </>
                )}
              </p>
            </motion.div>
            {!cannotPurchase && (
              <motion.div
                className="flex items-center border border-border rounded-lg shrink-0 bg-background"
                aria-label="Quantity"
              >
                <button
                  type="button"
                  onClick={() => setCartQuantity((q) => Math.max(1, q - 1))}
                  disabled={cartQuantity <= 1}
                  className="h-9 w-9 flex items-center justify-center hover:bg-muted disabled:opacity-40 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="text-sm font-medium w-8 text-center tabular-nums">{cartQuantity}</span>
                <button
                  type="button"
                  onClick={() => setCartQuantity((q) => Math.min(maxCartQuantity, q + 1))}
                  disabled={cartQuantity >= maxCartQuantity}
                  className="h-9 w-9 flex items-center justify-center hover:bg-muted disabled:opacity-40 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            )}
          </motion.div>
          <Button
            size="sm"
            className="w-full text-elegant h-10"
            onClick={() => handleAddToCart()}
            disabled={cannotPurchase || stickySelection.incomplete}
            style={{ touchAction: "manipulation" }}
          >
            <ShoppingCart className="mr-1.5 h-4 w-4" />
            {cannotPurchase
              ? "Out of Stock"
              : stickySelection.incomplete
                ? "Choose options"
                : product.isPreorder
                  ? `Pre-order${cartQuantity > 1 ? ` (${cartQuantity})` : ""}`
                  : `Add to cart${cartQuantity > 1 ? ` (${cartQuantity})` : ""}`}
          </Button>
        </motion.div>
      </motion.div>

      {/* Image Lightbox */}
      <ImageLightbox
        images={productImages}
        initialIndex={selectedImage}
        productName={product.name}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      />
    </div>
  );
};

export default ProductDetail;
