import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/context/FavoritesContext";
import { useCart } from "@/context/CartContext";
import { getProductById, phoneAccessories, wearablesProducts, smartphoneProducts, tabletProducts, getProductsByCategory } from "@/data/products";
import { getGreenLionProductById, greenLionProducts, getGreenLionProductsByCategory } from "@/data/greenLionProducts";
import ProductCard from "@/components/ProductCard";
import ProductCarousel from "@/components/ProductCarousel";
import ImageLightbox from "@/components/ImageLightbox";

// Mock customer reviews data
interface Review {
  id: number;
  name: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

const generateProductReviews = (productId: number, productName: string, productRating: number): Review[] => {
  // Base reviews that can be customized per product
  const reviewTemplates: Record<string, Review[]> = {
    // Smartphones
    'samsung': [
      { id: 1, name: "Muhammad Ali", rating: 5, date: "2 weeks ago", comment: "Excellent phone! The display is stunning and the camera quality is outstanding. Battery life lasts all day with heavy use.", verified: true },
      { id: 2, name: "Fatima Hassan", rating: 5, date: "1 month ago", comment: "Love this device! Fast performance, great build quality. The 5G connectivity is super fast. Highly recommend!", verified: true },
      { id: 3, name: "Ahmed Khalid", rating: 4, date: "3 weeks ago", comment: "Very good phone for the price. Camera could be better in low light, but overall satisfied with my purchase.", verified: true },
      { id: 4, name: "Aisha Omar", rating: 5, date: "1 week ago", comment: "Perfect for my needs! The screen is beautiful and the software is smooth. No complaints so far.", verified: true },
      { id: 5, name: "Ibrahim Yusuf", rating: 4, date: "2 months ago", comment: "Solid phone with good features. The charging speed is impressive. Would buy again.", verified: true },
    ],
    'tecno': [
      { id: 1, name: "Hassan Hamza", rating: 5, date: "1 week ago", comment: "Amazing value for money! The camera system is impressive and the display is vibrant. Great for photography.", verified: true },
      { id: 2, name: "Layla Ahmad", rating: 4, date: "3 weeks ago", comment: "Really happy with this purchase. The battery life is excellent and the design is sleek. Good performance overall.", verified: true },
      { id: 3, name: "Omar Zain", rating: 5, date: "2 weeks ago", comment: "Outstanding phone! The fast charging is a game changer. Build quality feels premium. Highly satisfied!", verified: true },
      { id: 4, name: "Mariam Salma", rating: 4, date: "1 month ago", comment: "Great phone with modern features. The screen quality is good and the UI is smooth. Worth the investment.", verified: true },
      { id: 5, name: "Yusuf Nour", rating: 5, date: "5 days ago", comment: "Best phone I've owned! The camera takes amazing photos and the performance is flawless. Love it!", verified: true },
    ],
    'smart': [
      { id: 1, name: "Khadija Amira", rating: 4, date: "2 weeks ago", comment: "Good budget-friendly option. The display is nice and the performance is adequate for daily tasks.", verified: true },
      { id: 2, name: "Mohammed Ali", rating: 5, date: "1 week ago", comment: "Surprised by the quality! Great features for the price. Battery lasts long and the design is modern.", verified: true },
      { id: 3, name: "Yasmin Hassan", rating: 4, date: "3 weeks ago", comment: "Solid phone that does everything I need. The camera is decent and the storage is sufficient. Good value.", verified: true },
      { id: 4, name: "Hamza Ibrahim", rating: 5, date: "1 month ago", comment: "Excellent budget smartphone! Fast, reliable, and well-built. Perfect for students and everyday use.", verified: true },
      { id: 5, name: "Nour Ahmed", rating: 4, date: "2 months ago", comment: "Happy with my purchase. The phone works well for calls, messaging, and social media. Good battery life.", verified: true },
    ],
    // Audio products
    'audio': [
      { id: 1, name: "Muhammad Khalid", rating: 5, date: "1 week ago", comment: "Amazing sound quality! The bass is deep and the clarity is excellent. Comfortable to wear for hours.", verified: true },
      { id: 2, name: "Aisha Fatima", rating: 5, date: "2 weeks ago", comment: "Best headphones I've tried! Noise cancellation works perfectly. Battery life is impressive.", verified: true },
      { id: 3, name: "Ahmed Omar", rating: 4, date: "3 weeks ago", comment: "Great sound and build quality. The wireless connection is stable. Good value for money.", verified: true },
      { id: 4, name: "Layla Mariam", rating: 5, date: "1 month ago", comment: "Love these! The sound is crystal clear and they're very comfortable. Perfect for music and calls.", verified: true },
      { id: 5, name: "Hassan Zain", rating: 4, date: "2 months ago", comment: "Solid headphones with good features. The design is sleek and the sound quality meets my expectations.", verified: true },
    ],
    // Accessories
    'accessories': [
      { id: 1, name: "Fatima Khadija", rating: 5, date: "1 week ago", comment: "Perfect accessory! Works exactly as described. Fast charging and good build quality. Highly recommend!", verified: true },
      { id: 2, name: "Ali Hamza", rating: 4, date: "2 weeks ago", comment: "Good product that does its job well. The design is nice and it's durable. Worth the purchase.", verified: true },
      { id: 3, name: "Mariam Yasmin", rating: 5, date: "3 weeks ago", comment: "Excellent quality! Exactly what I needed. Fast delivery and great customer service. Very satisfied!", verified: true },
      { id: 4, name: "Ibrahim Ahmed", rating: 4, date: "1 month ago", comment: "Good accessory for the price. Works reliably and looks professional. Would buy again.", verified: true },
      { id: 5, name: "Salma Nour", rating: 5, date: "2 months ago", comment: "Love this product! It's well-made and functions perfectly. Great addition to my setup.", verified: true },
    ],
    // Wearables
    'wearables': [
      { id: 1, name: "Mohammed Zain", rating: 5, date: "1 week ago", comment: "Fantastic smartwatch! The fitness tracking is accurate and the battery lasts for days. Great value!", verified: true },
      { id: 2, name: "Aisha Amira", rating: 4, date: "2 weeks ago", comment: "Nice watch with good features. The display is clear and the health monitoring works well.", verified: true },
      { id: 3, name: "Omar Hassan", rating: 5, date: "3 weeks ago", comment: "Excellent smartwatch! All the features I need. Comfortable to wear and looks stylish.", verified: true },
      { id: 4, name: "Layla Fatima", rating: 4, date: "1 month ago", comment: "Good watch for fitness tracking. The app is easy to use and the notifications work perfectly.", verified: true },
      { id: 5, name: "Yusuf Khalid", rating: 5, date: "2 months ago", comment: "Love my new watch! The battery life is impressive and the design is modern. Highly recommend!", verified: true },
    ],
  };

  // Determine product category
  const nameLower = productName.toLowerCase();
  let category = 'accessories';

  if (nameLower.includes('samsung') || nameLower.includes('galaxy')) {
    category = 'samsung';
  } else if (nameLower.includes('tecno') || nameLower.includes('camon') || nameLower.includes('spark')) {
    category = 'tecno';
  } else if (nameLower.includes('smart')) {
    category = 'smart';
  } else if (nameLower.includes('headphone') || nameLower.includes('earbud') || nameLower.includes('speaker') || nameLower.includes('audio')) {
    category = 'audio';
  } else if (nameLower.includes('watch') || nameLower.includes('wearable')) {
    category = 'wearables';
  }

  // Get reviews for category or use default
  const reviews = reviewTemplates[category] || reviewTemplates['accessories'];

  // Adjust ratings slightly based on product rating
  return reviews.map((review, index) => ({
    ...review,
    rating: Math.min(5, Math.max(3, Math.round(productRating + (Math.random() - 0.5) * 0.5))),
    date: index === 0 ? "1 week ago" : index === 1 ? "2 weeks ago" : index === 2 ? "3 weeks ago" : index === 3 ? "1 month ago" : "2 months ago"
  }));
};

const calculateReviewStats = (reviews: Review[]) => {
  const totalReviews = reviews.length;
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(r => r.rating === rating).length;
    return { rating, count, percentage: (count / totalReviews) * 100 };
  });
  return { totalReviews, averageRating, ratingDistribution };
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
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

  // Color selection handling
  const colorOptions = useMemo(() => product.colors || [], [product]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  useEffect(() => {
    // Reset selectedColor when product changes
    setSelectedColor(null);
  }, [product.id]);

  useEffect(() => {
    // Set default color when product has colors
    if (colorOptions.length > 0 && !selectedColor) {
      setSelectedColor(colorOptions[0].name);
    }
  }, [colorOptions, selectedColor]);

  const colorImage = useMemo(() => {
    if (!selectedColor || !colorOptions.length) return null;
    const color = colorOptions.find(c => c.name === selectedColor);
    return color?.image;
  }, [selectedColor, colorOptions]);

  // Track if user manually clicked an image (to prevent color sync from overriding)
  const [manualImageSelection, setManualImageSelection] = useState(false);

  // When color changes from COLOR BUTTON click, update selectedImage
  // But don't interfere if user manually clicked an image thumbnail
  useEffect(() => {
    // Only sync if this was a deliberate color change, not from clicking an image
    if (!manualImageSelection && colorImage && productImages.length > 0) {
      const index = productImages.findIndex(img => img === colorImage);
      if (index !== -1) {
        setSelectedImage(index);
      }
    }
    // Reset the manual flag after color sync attempt
    if (manualImageSelection) {
      setManualImageSelection(false);
    }
  }, [colorImage]);

  const displayPrice = selectedVariant?.price ?? product.price;
  const primaryImage =
    productImages[0] ||
    regularProduct?.image ||
    (greenLionProduct ? greenLionProduct.images[0] : "/placeholder.svg");
  
  const favorite = isFavorite(product.id);

  // Generate product-specific reviews
  const productReviews = useMemo(() => {
    return generateProductReviews(product.id, product.name, product.rating);
  }, [product.id, product.name, product.rating]);

  const reviewStats = useMemo(() => {
    return calculateReviewStats(productReviews);
  }, [productReviews]);

  const handleAddToCart = (redirect?: boolean) => {
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
      quantity: 1,
      variantKey: selectedVariant?.key,
      variantLabel: selectedVariant?.label,
      color: selectedColor || undefined,
      colorImage: selectedColorImage || undefined,
      isPreorder: product.isPreorder,
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
      colors: p.colors,
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
      colors: p.colors,
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
      colors: p.colors,
    })),
    ...tabletProducts.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
      images: p.images && p.images.length > 0 ? p.images : [p.image],
      rating: p.rating,
      category: p.category,
      brand: p.brand || extractBrand(p.name),
      secondaryCategories: [],
      colors: p.colors,
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
      colors: p.colors || [],
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

  // Get smart accessory recommendations for smartphones
  const getSmartAccessories = () => {
    if (!isSmartphone) return [];

    // Combine all accessories from different sources (including Audio products)
    const allAccessories = [
      ...phoneAccessories.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image,
        images: [p.image],
        rating: p.rating,
        category: p.category,
        brand: p.brand || null,
      })),
      ...greenLionProducts
        .filter(p =>
          p.category === "Accessories" ||
          p.secondaryCategories?.includes("Accessories") ||
          p.secondaryCategories?.includes("Charging") ||
          p.category === "Charging" ||
          p.category === "Audio" ||
          p.secondaryCategories?.includes("Audio")
        )
        .map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.images[0],
          images: p.images,
          rating: p.rating,
          category: p.category,
          brand: p.brand,
        })),
    ];

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

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12" style={{ touchAction: 'pan-y pinch-zoom' }}>
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

            <div
              className="relative aspect-square bg-white rounded-sm mb-4 sm:mb-6 overflow-hidden group border border-border"
              style={{ touchAction: "pan-y pinch-zoom" }}
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
                style={{ maxHeight: "100%", maxWidth: "100%", margin: "0 auto", touchAction: "pan-y pinch-zoom" }}
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
                className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6"
                style={{ touchAction: "pan-y pinch-zoom" }}
              >
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Mark this as a manual selection
                      setManualImageSelection(true);
                      setSelectedImage(index);

                      // Sync color selection when clicking on images
                      if (colorOptions.length > 0) {
                        // Try to find which color this image corresponds to
                        const matchingColor = colorOptions.find(color => color.image === image);
                        if (matchingColor) {
                          setSelectedColor(matchingColor.name);
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

            <h1 className="text-elegant text-xl sm:text-2xl md:text-3xl mb-2 relative z-10 leading-tight sm:leading-normal" style={{ userSelect: 'text', WebkitUserSelect: 'text', touchAction: 'pan-y' }}>{product.title}</h1>
            <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4" style={{ userSelect: 'text', WebkitUserSelect: 'text', touchAction: 'pan-y' }}>{product.category}</p>
            
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 flex-wrap">
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

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex flex-col">
                <p className="text-elegant text-2xl sm:text-3xl font-bold">${displayPrice.toFixed(2)}</p>
                {selectedVariant?.label && (
                  <span className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Configuration: {selectedVariant.label}
                  </span>
                )}
              </div>
              <span className="text-xs sm:text-sm text-green-600 bg-green-50 px-2 sm:px-3 py-1 rounded-full">
                In Stock
              </span>
            </div>

            {(colorOptions.length > 0 || variantOptions.length > 0) && (
              <div
                className="mb-6 sm:mb-8 border border-border rounded-sm bg-secondary/20 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                style={{ touchAction: 'pan-y' }}
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
                  Choose the Wi-Fi + LTE version if you need cellular data on the go, or stick with Wi-Fi only for home and office use.
                </p>
              </div>
            ) : null}

            {colorOptions.length > 0 && (
              <div className="mb-6">
                <h4 className="text-elegant text-sm sm:text-base mb-3 font-medium">Select Color</h4>
                <div className="flex flex-wrap gap-3" style={{ touchAction: "pan-y" }}>
                  {colorOptions.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => {
                        setSelectedColor(color.name);

                        // Sync image selection when clicking on colors
                        if (color.image && productImages.length > 0) {
                          const imageIndex = productImages.findIndex(img => img === color.image);
                          if (imageIndex !== -1) {
                            setSelectedImage(imageIndex);
                          }
                        }
                      }}
                      style={{ touchAction: 'manipulation', minHeight: '44px' }}
                      className={`px-4 py-2 rounded-full text-xs sm:text-sm border transition-all ${selectedColor === color.name
                        ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20 font-medium"
                        : "border-border hover:border-primary/50 text-muted-foreground"
                        }`}
                    >
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {variantOptions.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h4 className="text-elegant text-sm sm:text-base mb-3 sm:mb-4 font-medium">Choose your configuration</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3" style={{ touchAction: "pan-y" }}>
                  {variantOptions.map((variant) => {
                    const isActive = selectedVariant?.key === variant.key;
                    return (
                      <button
                        key={variant.key}
                        onClick={() => setSelectedVariantKey(variant.key)}
                        style={{ touchAction: 'manipulation', minHeight: '80px' }}
                        className={`text-left border rounded-sm p-3 sm:p-4 flex flex-col gap-1.5 sm:gap-2 transition-all duration-300 ${isActive
                          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                          : "border-border hover:border-primary/50"
                          }`}
                      >
                        <span className="text-xs sm:text-sm font-semibold text-elegant">{variant.label}</span>
                        <span className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
                          {variant.ram} · {variant.storage}
                        </span>
                        <span className="text-xs sm:text-sm text-elegant font-medium">${variant.price.toFixed(2)}</span>
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
            <div className="mb-8" style={{ touchAction: 'pan-y' }}>
              <h3 className="text-elegant text-lg mb-3 font-medium" style={{ userSelect: 'text', WebkitUserSelect: 'text' }}>Description</h3>
              <p className="text-sm font-light leading-relaxed text-muted-foreground mb-4" style={{ userSelect: 'text', WebkitUserSelect: 'text', touchAction: 'pan-y' }}>
                {product.description}
              </p>
              
              {/* Key Features */}
              {product.features && product.features.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-elegant text-base mb-3 font-medium">Key Features</h4>
                  <ul className="flex flex-col gap-2">
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
                style={{ touchAction: 'manipulation' }}
              >
                <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                {product.isPreorder ? "Preorder Now" : "Add to Cart"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 text-elegant text-sm sm:text-base py-4 sm:py-5 md:py-6"
                onClick={() => handleAddToCart(true)}
                style={{ touchAction: 'manipulation' }}
              >
                {product.isPreorder ? "Preorder & Checkout" : "Buy Now"}
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
            {product.specifications && product.specifications.length > 0 && (
              <div className="border-t border-border pt-8 mt-8">
                <h3 className="text-elegant text-xl mb-6 font-medium">Technical Specifications</h3>
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
                <p className="text-6xl font-light mb-2">{reviewStats.averageRating.toFixed(1)}</p>
                <div className="flex items-center gap-1 mb-2 justify-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(reviewStats.averageRating)
                        ? "fill-primary text-primary"
                        : "text-border"
                        }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{reviewStats.totalReviews} reviews</p>
              </div>
              <div className="flex-1">
                {reviewStats.ratingDistribution.map((dist) => (
                  <div key={dist.rating} className="flex items-center gap-4 mb-2">
                    <span className="text-xs w-12">{dist.rating} stars</span>
                    <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${dist.percentage}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-12">
                      {dist.percentage.toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Individual Reviews */}
          <div className="flex flex-col gap-4">
            {productReviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white border border-border rounded-sm p-4 sm:p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {review.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{review.name}</p>
                        {review.verified && (
                          <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < review.rating
                                ? "fill-primary text-primary"
                                : "text-border"
                                }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">{review.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

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
                  poster={product.image}
                  preload="metadata"
                >
                  <source src={product.video} type="video/mp4" />
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
                  touchAction: "pan-x pan-y",
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
                      price={accessory.price}
                      image={accessory.image}
                      images={accessory.images}
                      rating={accessory.rating}
                      category={accessory.category}
                      colors={accessory.colors}
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

        {/* Frequently Bought Together - Sales-Focused Bundle Section */}
        {(() => {
          // Get frequently bought together items based on product category
          const getFrequentlyBoughtTogether = () => {
            const productCategory = product.category?.toLowerCase() || '';
            const productName = product.name.toLowerCase();
            
            // Get all audio products (regular + Green Lion)
            // Get all products from all arrays with Audio category
            const allRegularProducts = [...phoneAccessories, ...wearablesProducts, ...smartphoneProducts, ...tabletProducts];
            const regularAudio = allRegularProducts.filter(p => p.category === "Audio");
            const greenLionAudio = getGreenLionProductsByCategory("Audio");
            
            // Combine and remove duplicates by ID
            const audioProductsMap = new Map();
            
            // Add regular audio products
            regularAudio.forEach(p => {
              audioProductsMap.set(p.id, {
                ...p,
                image: p.image || p.images?.[0],
                images: p.images || [p.image],
              });
            });
            
            // Add Green Lion audio products
            greenLionAudio.forEach(p => {
              if (!audioProductsMap.has(p.id)) {
                audioProductsMap.set(p.id, {
                  ...p,
                  image: p.images[0],
                  images: p.images,
                });
              }
            });
            
            // Convert map to array
            const audioProducts = Array.from(audioProductsMap.values());
            
            // Get all charging products (regular + Green Lion)
            const chargingProducts = [
              ...getProductsByCategory("Charging").map(p => ({
                ...p,
                image: p.image || p.images?.[0],
                images: p.images || [p.image],
              })),
              ...getGreenLionProductsByCategory("Charging").map(p => ({
                ...p,
                image: p.images[0],
                images: p.images,
              })),
            ];
            
            const allProducts = [
              ...phoneAccessories,
              ...wearablesProducts,
              ...smartphoneProducts,
              ...tabletProducts,
              ...audioProducts,
              ...chargingProducts,
              ...greenLionProducts.map(p => ({
                ...p,
                image: p.images[0],
                images: p.images,
              })),
            ];

            let bundleItems: any[] = [];

            // Audio products - show ALL audio items (excluding current product)
            if (productCategory === 'audio' || productName.includes('headphone') || productName.includes('earbud') || productName.includes('speaker') || productName.includes('airpods') || productName.includes('buds') || productName.includes('neckband')) {
              // Get ALL audio products and exclude the current product
              // Remove duplicates by ID
              const uniqueAudioProducts = audioProducts.filter((p, index, self) => 
                index === self.findIndex((t) => t.id === p.id)
              );
              
              bundleItems = uniqueAudioProducts
                .filter(p => p.id !== product.id)
                .map(p => ({
                  id: p.id,
                  name: p.name,
                  price: p.price,
                  image: p.image || p.images?.[0],
                  images: p.images || [p.image],
                  rating: p.rating || 4.5,
                  category: p.category,
                }));
            }
            // Charging products - show ALL charging items (excluding current product)
            else if (productCategory === 'charging' || productName.includes('charger') || productName.includes('cable') || productName.includes('power bank') || productName.includes('adapter')) {
              bundleItems = chargingProducts
                .filter(p => {
                  if (p.id === product.id) return false;
                  const name = p.name?.toLowerCase() || '';
                  const category = p.category?.toLowerCase() || '';
                  return category === 'charging' || 
                         name.includes('charger') || 
                         name.includes('cable') || 
                         name.includes('power bank') || 
                         name.includes('adapter') ||
                         name.includes('charging');
                })
                .map(p => ({
                  id: p.id,
                  name: p.name,
                  price: p.price,
                  image: p.image || p.images?.[0],
                  images: p.images || [p.image],
                  rating: p.rating || 4.5,
                  category: p.category,
                }));
            }
            // USB Flash Drive bundles
            else if (productName.includes('usb') || productName.includes('flash') || productName.includes('cruzer') || productName.includes('philips')) {
              bundleItems = allProducts
                .filter(p => {
                  const name = p.name?.toLowerCase() || '';
                  return (
                    (name.includes('usb hub') || name.includes('usb splitter')) ||
                    (name.includes('usb cable') && !name.includes('flash')) ||
                    (name.includes('usb adapter')) ||
                    (name.includes('power bank') || name.includes('portable charger')) ||
                    (name.includes('case') && (name.includes('usb') || name.includes('storage')))
                  );
                })
                .slice(0, 3)
                .map(p => ({
                  id: p.id,
                  name: p.name,
                  price: p.price,
                  image: p.image || p.images?.[0],
                  images: p.images || [p.image],
                  rating: p.rating || 4.5,
                  category: p.category,
                }));
            }
            // Smartphone bundles
            else if (isSmartphone) {
              bundleItems = smartAccessories.slice(0, 3);
            }
            // Accessories bundles
            else {
              bundleItems = allProducts
                .filter(p => {
                  if (p.id === product.id) return false;
                  const category = p.category?.toLowerCase() || '';
                  return category === 'accessories' || 
                         category === 'charging' ||
                         category === 'protection';
                })
                .slice(0, 3)
                .map(p => ({
                  id: p.id,
                  name: p.name,
                  price: p.price,
                  image: p.image || p.images?.[0],
                  images: p.images || [p.image],
                  rating: p.rating || 4.5,
                  category: p.category,
                }));
            }

            return bundleItems;
          };

          const bundleItems = getFrequentlyBoughtTogether();

          if (bundleItems.length === 0) return null;

          const bundleTotal = bundleItems.reduce((sum, item) => sum + item.price, displayPrice);
          const bundleSavings = bundleTotal * 0.15; // 15% savings
          const bundlePrice = bundleTotal - bundleSavings;

          return (
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 sm:mt-16 md:mt-20 mb-12 sm:mb-16 md:mb-20"
            >
              <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border-2 border-primary/20 rounded-lg p-6 sm:p-8 md:p-10 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-0" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl -z-0" />

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                    <div>
                      <h2 className="text-elegant text-xl sm:text-2xl md:text-3xl font-bold mb-2">
                        Frequently Bought Together
                      </h2>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        Complete your setup with these essential accessories
                      </p>
                    </div>
                    {bundleSavings > 0 && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2">
                        <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Save ${bundleSavings.toFixed(2)}</p>
                        <p className="text-sm text-green-700 font-bold">Buy Bundle</p>
                      </div>
                    )}
                  </div>

                  {/* Bundle Items Grid */}
                  <div className="overflow-x-auto -mx-4 sm:mx-0 mb-6 sm:mb-8">
                    <div className="inline-flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-0 min-w-max sm:min-w-0">
                      {/* Current Product */}
                      <div className="bg-white border-2 border-primary/30 rounded-lg p-4 sm:p-5 relative flex-shrink-0 sm:flex-shrink w-[280px] sm:w-auto">
                        <div className="aspect-square mb-3 bg-white rounded-md overflow-hidden">
                          <img
                            src={primaryImage}
                            alt={product.name}
                            className="w-full h-full object-contain p-2"
                            loading="lazy"
                          />
                        </div>
                        <h3 className="text-sm font-semibold text-elegant mb-1 line-clamp-2 min-h-[2.5rem]">
                          {product.name}
                        </h3>
                        <p className="text-lg font-bold text-primary mb-2">${displayPrice.toFixed(2)}</p>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                      </div>

                      {/* Plus Icon (Desktop Only) */}
                      <div className="hidden lg:flex items-center justify-center flex-shrink-0">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-primary">+</span>
                        </div>
                      </div>

                      {/* Bundle Items */}
                      {bundleItems.map((item, index) => (
                      <div key={item.id} className="flex-shrink-0 sm:flex-shrink w-[280px] sm:w-auto">
                        {index === 0 && (
                          <div className="lg:hidden flex items-center justify-center mb-4">
                            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                              <span className="text-xl font-bold text-primary">+</span>
                            </div>
                          </div>
                        )}
                        {index > 0 && index % 3 === 0 && (
                          <div className="hidden lg:flex items-center justify-center my-4">
                            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                              <span className="text-2xl font-bold text-primary">+</span>
                            </div>
                          </div>
                        )}
                        <Link to={`/product/${item.id}`}>
                          <div className="bg-white border-2 border-border hover:border-primary/50 rounded-lg p-4 sm:p-5 transition-all duration-300 cursor-pointer group">
                            <div className="aspect-square mb-3 bg-white rounded-md overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                                loading="lazy"
                              />
                            </div>
                            <h3 className="text-sm font-semibold text-elegant mb-1 line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
                              {item.name}
                            </h3>
                            <div className="flex items-center gap-1 mb-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${i < Math.floor(item.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                            <p className="text-lg font-bold text-elegant">${item.price.toFixed(2)}</p>
                          </div>
                        </Link>
                        {index < bundleItems.length - 1 && (
                          <div className="lg:hidden flex items-center justify-center my-4">
                            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                              <span className="text-xl font-bold text-primary">+</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    </div>
                  </div>

                  {/* Bundle Pricing & CTA */}
                  <div className="bg-white/80 backdrop-blur-sm border-2 border-primary/30 rounded-lg p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Total Value</p>
                          <p className="text-lg line-through text-muted-foreground">${bundleTotal.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-green-600 font-semibold">Bundle Price</p>
                          <p className="text-2xl sm:text-3xl font-bold text-green-600">${bundlePrice.toFixed(2)}</p>
                        </div>
                        {bundleSavings > 0 && (
                          <div>
                            <p className="text-xs text-primary font-semibold">You Save</p>
                            <p className="text-lg font-bold text-primary">${bundleSavings.toFixed(2)}</p>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {bundleItems.length + 1} items • Free shipping on orders over $50
                      </p>
                    </div>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold px-6 sm:px-8 py-6 sm:py-7 text-sm sm:text-base min-w-[180px] sm:min-w-[200px]"
                      onClick={() => {
                        // Add all items to cart
                        handleAddToCart();
                        bundleItems.forEach(item => {
                          addToCart({
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            image: item.image,
                            rating: item.rating,
                            category: item.category,
                            quantity: 1,
                          });
                        });
                      }}
                      style={{ touchAction: 'manipulation' }}
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add Bundle to Cart
                    </Button>
                  </div>
                </div>
              </div>
            </motion.section>
          );
        })()}

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
                colors: p.colors,
              }))}
            />
          </motion.section>
        )}
      </div>

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
