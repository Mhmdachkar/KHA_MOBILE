import { motion, useScroll, useTransform } from "framer-motion";
import { Smartphone, Headphones, Gamepad2, CreditCard, Gift, Tv, Watch, Zap, ArrowRight, Star, Sparkles, ShoppingCart, Tablet, Cpu, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import rechargeLogo from "@/assets/recharges/logo.png";
import CategoryCard from "@/components/CategoryCard";
import ProductCarousel from "@/components/ProductCarousel";
import PersonalizedRecommendations from "@/components/PersonalizedRecommendations";
import NewArrivalShowcase from "@/components/NewArrivalShowcase";
import WhyShopWithUs from "@/components/WhyShopWithUs";
import BrandShowcase from "@/components/BrandShowcase";
import ThisWeeksFavorites from "@/components/ThisWeeksFavorites";
import RecentlyViewed from "@/components/RecentlyViewed";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import heroProduct from "@/assets/Gemini_Generated_Image_3qc0nc3qc0nc3qc0.png";
// iPhone 16 imports
import iPhone16Black from "@/assets/phones/iphone 16/iphone 16 black.jpeg";
import iPhone16Pink from "@/assets/phones/iphone 16/iphone 16 pink.jpeg";
import iPhone16Teal from "@/assets/phones/iphone 16/iphone 16 teal.jpeg";
import iPhone16Ultramarine from "@/assets/phones/iphone 16/iphone 16 ultramarine.jpeg";
import iPhone16White from "@/assets/phones/iphone 16/iphone 16 white.jpeg";
import silicon17ProMaxOrange from "@/assets/iphone covers/silicon 17 pro max/Screenshot 2025-12-09 010853 orange.png";
import { findStoreProductSplit } from "@/data/productLookup";
import { useCatalog } from "@/context/CatalogContext";
import { filterByCategoryPage } from "@/lib/catalogFilters";
import { getStorefrontProductById } from "@/lib/catalogProduct";
import type { StorefrontProduct } from "@/lib/catalogProduct";
import { useSiteSettings } from "@/context/SiteSettingsContext";

// iPhone 16 / Flagship Showcase Component
const FlagshipiPhone16Showcase = () => {
  const { settings } = useSiteSettings();
  const flagship = settings.flagship_showcase;
  const [selectedColor, setSelectedColor] = useState("ultramarine");
  const sectionRef = useRef<HTMLElement | null>(null);
  const scrollPositionRef = useRef<number>(0);
  const { catalogTick } = useCatalog();

  // When mode="product" and productId≠500, look up the swapped product
  const swappedProduct = useMemo(() => {
    if (flagship.mode !== "product" || flagship.productId === 500) return null;
    const { regularProduct, greenLionProduct } = findStoreProductSplit(flagship.productId);
    return regularProduct || greenLionProduct || null;
  }, [flagship.mode, flagship.productId, catalogTick]);

  // Track scroll position (for reference, no auto-restore to avoid scroll lock)
  useEffect(() => {
    const handleScroll = () => {
      scrollPositionRef.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const colors = [
    { name: "ultramarine", label: "Ultramarine", image: iPhone16Ultramarine, hex: "#003d82" },
    { name: "teal", label: "Teal", image: iPhone16Teal, hex: "#4a7c7e" },
    { name: "pink", label: "Pink", image: iPhone16Pink, hex: "#f7c3d3" },
    { name: "white", label: "White", image: iPhone16White, hex: "#f5f5f7" },
    { name: "black", label: "Black", image: iPhone16Black, hex: "#1d1d1f" },
  ];

  const currentColor = colors.find(c => c.name === selectedColor) || colors[0];

  return (
    <section
      ref={sectionRef}
      className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 overflow-hidden"
      style={{ scrollMarginTop: '0' }}
    >
      {/* Dynamic Background Gradient - Matching iPhone photo backgrounds */}
      <motion.div
        className="absolute inset-0 -z-10"
        animate={{
          background: selectedColor === "white"
            ? `linear-gradient(135deg, #f5f5f7 0%, #ffffff 50%, #f5f5f7 100%)`
            : selectedColor === "black"
              ? `linear-gradient(135deg, #1d1d1f 0%, #2d2d2f 50%, #1d1d1f 100%)`
              : selectedColor === "pink"
                ? `linear-gradient(135deg, #f7c3d3 0%, #ffffff 30%, #f7c3d3 100%)`
                : selectedColor === "teal"
                  ? `linear-gradient(135deg, #4a7c7e 0%, #ffffff 30%, #4a7c7e 100%)`
                  : `linear-gradient(135deg, #003d82 0%, #ffffff 30%, #003d82 100%)`
        }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

      {/* Additional subtle gradient overlay for depth */}
      <motion.div
        className="absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(ellipse at center, transparent 0%, ${currentColor.hex}08 100%)`
        }}
      />

      {/* Subtle Floating Orbs - Reduced opacity for seamless blend */}
      <motion.div
        className="absolute top-10 left-4 sm:top-20 sm:left-10 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 rounded-full blur-3xl"
        style={{ backgroundColor: currentColor.hex }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: selectedColor === "white" || selectedColor === "pink" ? [0.05, 0.08, 0.05] : [0.08, 0.12, 0.08],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-10 right-4 sm:bottom-20 sm:right-10 w-40 h-40 sm:w-64 sm:h-64 md:w-96 md:h-96 rounded-full blur-3xl"
        style={{ backgroundColor: currentColor.hex }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: selectedColor === "white" || selectedColor === "pink" ? [0.05, 0.08, 0.05] : [0.08, 0.12, 0.08],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-full overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-12 xl:gap-16 items-center min-h-[400px] sm:min-h-[500px] md:min-h-[600px] w-full">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-4 sm:space-y-6 md:space-y-8 text-center lg:text-left order-2 lg:order-1 w-full max-w-full"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
              className="inline-block"
            >
              <Badge className="text-[10px] sm:text-xs md:text-sm px-3 sm:px-4 py-1 sm:py-1.5 glassmorphism border-primary/30">
                <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 sm:mr-1.5" />
                {flagship.custom_badge || "Flagship Innovation"}
              </Badge>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight break-words">
                <span className="text-elegant block mb-2">
                  {swappedProduct ? swappedProduct.name : (flagship.mode === "custom" ? flagship.custom_name : "iPhone 16")}
                </span>
                <span className="text-gradient block">
                  {flagship.mode === "custom" ? flagship.custom_tagline : "Redefining Excellence"}
                </span>
              </h2>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed break-words px-2 sm:px-0"
            >
              {swappedProduct
                ? (swappedProduct.description || swappedProduct.name)
                : (flagship.mode === "custom"
                    ? flagship.custom_description
                    : "Experience unparalleled performance with the A18 Pro chip, stunning camera system, and revolutionary design. The most advanced iPhone ever created.")}
            </motion.p>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 max-w-md mx-auto lg:mx-0 w-full"
            >
              {(flagship.feature_chips.length > 0 ? flagship.feature_chips : [
                { label: "A18 Pro Chip", sublabel: "Next-Gen Performance" },
                { label: "ProMotion", sublabel: "120Hz Display" },
                { label: "48MP Camera", sublabel: "Pro Photography" },
                { label: "All-Day Battery", sublabel: "Up to 29 Hours" },
              ]).map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="glassmorphism p-3 sm:p-4 rounded-lg sm:rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300"
                >
                  <div className="text-xs sm:text-sm font-semibold text-elegant leading-tight">{feature.label}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-1 leading-tight">{feature.sublabel}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Color Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="space-y-3 sm:space-y-4"
            >
              <div className="text-xs sm:text-sm font-medium text-elegant">Choose your color:</div>
              <div className="flex gap-2 sm:gap-3 justify-center lg:justify-start flex-wrap">
                {colors.map((color, i) => (
                  <motion.button
                    key={color.name}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 + i * 0.05, type: "spring" }}
                    whileHover={{ scale: 1.15, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Save current scroll position before state change
                      scrollPositionRef.current = window.scrollY;
                      setSelectedColor(color.name);
                    }}
                    className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-300 ${selectedColor === color.name
                      ? "border-primary shadow-lg scale-110"
                      : "border-border/30 hover:border-primary/50"
                      }`}
                    style={{
                      backgroundColor: color.hex,
                      touchAction: 'manipulation',
                      WebkitTapHighlightColor: 'transparent',
                      outline: 'none',
                    }}
                    aria-label={`Select ${color.label} color`}
                  >
                    {selectedColor === color.name && (
                      <motion.div
                        layoutId="colorSelector"
                        className="absolute inset-0 rounded-full border-2 border-primary"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className="sr-only">{color.label}</span>
                  </motion.button>
                ))}
              </div>
              <motion.div
                key={selectedColor}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs sm:text-sm text-muted-foreground"
              >
                Selected: <span className="font-medium text-elegant">{currentColor.label}</span>
              </motion.div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start pt-2 sm:pt-4 w-full"
            >
              <Link to={flagship.cta1_url || (swappedProduct ? `/product/${swappedProduct.id}` : "/product/500")} className="w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                  <Button variant="gradient" size="lg" className="group shadow-glow w-full sm:w-auto text-sm sm:text-base">
                    <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    {flagship.cta1_label || "Order Now"}
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="ml-2"
                    >
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </motion.div>
                  </Button>
                </motion.div>
              </Link>
              <Link to={flagship.cta2_url || "/smartphones"} className="w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="glassmorphism w-full sm:w-auto text-sm sm:text-base">
                    {flagship.cta2_label || "View All iPhones"}
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: iPhone Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: 45 }}
            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative order-1 lg:order-2 w-full max-w-full"
          >
            {/* Subtle Glow Effect - Reduced for seamless blend */}
            <motion.div
              className="absolute inset-0 rounded-full blur-3xl"
              style={{ backgroundColor: currentColor.hex }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: selectedColor === "white" || selectedColor === "pink" ? [0.05, 0.1, 0.05] : [0.1, 0.15, 0.1],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Subtle Rotating Ring */}
            <motion.div
              className="absolute inset-0 border-2 rounded-full"
              style={{ borderColor: currentColor.hex }}
              animate={{
                rotate: 360,
                opacity: selectedColor === "white" || selectedColor === "pink" ? 0.05 : 0.1
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />

            {/* Product Image – swapped product, custom image, or default iPhone 16 */}
            <motion.div
              key={swappedProduct ? swappedProduct.id : selectedColor}
              initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateY: -90 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative z-10 flex items-center justify-center w-full max-w-full"
              style={{
                minHeight: '300px',
                padding: '1rem 0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <motion.img
                src={
                  swappedProduct
                    ? (swappedProduct.images?.[0] ?? swappedProduct.image)
                    : flagship.mode === "custom" && flagship.custom_image_url
                      ? flagship.custom_image_url
                      : currentColor.image
                }
                alt={swappedProduct ? swappedProduct.name : `iPhone 16 ${currentColor.label}`}
                className="w-full h-auto max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl mx-auto drop-shadow-2xl"
                style={{
                  willChange: 'opacity, transform',
                  backfaceVisibility: 'hidden',
                  objectFit: 'contain',
                  maxHeight: '500px',
                  width: 'auto',
                  height: 'auto',
                }}
                whileHover={{
                  scale: 1.05,
                  rotateY: 5,
                  rotateX: 5,
                  transition: { duration: 0.3 }
                }}
                loading="eager"
              />
            </motion.div>

            {/* Floating Specs */}
            {[
              { label: '6.1" Display', position: "top-10 left-0" },
              { label: "A18 Pro", position: "top-1/3 right-0" },
              { label: "5G Speed", position: "bottom-1/3 left-0" },
            ].map((spec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, x: i === 1 ? 50 : -50 }}
                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1 + i * 0.2, type: "spring" }}
                className={`absolute ${spec.position} glassmorphism px-3 py-2 rounded-lg text-xs font-medium border border-border/50 shadow-lg hidden lg:block`}
              >
                {spec.label}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

function toHomeCarouselProduct(p: StorefrontProduct) {
  return {
    id: p.id,
    dbId: p.dbId,
    name: p.name,
    price: p.displayPrice ?? p.price,
    image: p.image,
    images: p.images,
    rating: p.rating,
    category: p.category,
  };
}

const Home = () => {
  const { storefrontProducts, refreshCatalog } = useCatalog();
  const { settings: siteSettings } = useSiteSettings();
  const heroSettings = siteSettings.hero;

  useEffect(() => {
    void refreshCatalog();
  }, [refreshCatalog]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const categories = [
    { icon: Smartphone, name: "Smartphones", linkTo: "/smartphones" },
    { icon: Headphones, name: "Audio", linkTo: "/audio" },
    { icon: Tablet, name: "Tablets", linkTo: "/tablets" },
    { icon: Tv, name: "Netflix, Shahid & IPTV", linkTo: "/streaming-services" },
    { icon: Watch, name: "Wearables", linkTo: "/wearables" },
    { icon: Gamepad2, name: "Gaming", linkTo: "/gaming" },
    { image: rechargeLogo, name: "Recharges", linkTo: "/recharges" },
    { icon: Gift, name: "Gift Cards", linkTo: "/gift-cards" },
    { icon: Zap, name: "Accessories", linkTo: "/accessories" },
    { icon: Cpu, name: "Electronics", linkTo: "/electronics" },
    { image: silicon17ProMaxOrange, name: "iPhone Cases", linkTo: "/category/iPhone Cases" },
  ];

  const trendingSections = siteSettings.trending_sections || [];
  const trendingSmartphones = useMemo(() => {
    const section = trendingSections.find((s) => s.category === "Smartphones") || trendingSections[0];
    if (section?.productIds?.length > 0) {
      return section.productIds
        .map((pid) => getStorefrontProductById(storefrontProducts, pid))
        .filter((p): p is StorefrontProduct => p != null)
        .map(toHomeCarouselProduct);
    }
    return filterByCategoryPage(storefrontProducts, section?.category || "Smartphones")
      .reverse()
      .slice(0, 10)
      .map(toHomeCarouselProduct);
  }, [storefrontProducts, trendingSections]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Revolutionary Hero Section */}
      <motion.section
        ref={heroRef}
        className="relative min-h-[85vh] sm:min-h-screen flex items-center justify-center overflow-hidden py-8 sm:py-12 md:py-16 w-full max-w-full"
        style={{
          backgroundColor: "#ffffff",
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 100%)
          `,
          isolation: "isolate",
          willChange: "transform, opacity"
        }}
      >
        {/* Perfect White Background to match the image */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundColor: "#ffffff",
            backgroundImage: `
              linear-gradient(45deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 100%)
            `,
            isolation: "isolate"
          }}
        />


        <motion.div style={{ opacity, scale }} className="container mx-auto px-4 sm:px-6 relative z-10 w-full max-w-full overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
              className="space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8 text-center lg:text-left"
            >
              {/* Badge */}
              <div>
                <Badge className="mb-2 sm:mb-3 md:mb-4 text-xs sm:text-sm">
                  <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                  {heroSettings.badge}
                </Badge>
              </div>

              {/* Main Heading */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              >
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl 2xl:text-8xl font-bold leading-tight">
                  <span className="text-gradient block">{heroSettings.headline1}</span>
                  <span className="text-elegant block">{heroSettings.headline2}</span>
                </h1>
              </motion.div>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 font-light leading-relaxed px-2 sm:px-0 break-words"
              >
                {heroSettings.description}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 justify-center lg:justify-start px-2 sm:px-0 w-full"
              >
                <Link to={heroSettings.cta1_url}>
                  <Button variant="gradient" size="lg" className="shadow-glow group">
                    {heroSettings.cta1_label}
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to={heroSettings.cta2_url}>
                  <Button variant="outline" size="lg" className="glassmorphism">
                    {heroSettings.cta2_label}
                  </Button>
                </Link>
              </motion.div>

              {/* Stats */}
              <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6 lg:gap-8 pt-4 sm:pt-6 md:pt-8 justify-center lg:justify-start w-full">
                {[
                  { value: heroSettings.stat1_value, label: heroSettings.stat1_label },
                  { value: heroSettings.stat2_value, label: heroSettings.stat2_label, icon: Star },
                  { value: heroSettings.stat3_value, label: heroSettings.stat3_label },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.08, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    className="text-center"
                  >
                    <div className="flex items-center justify-center gap-1 text-lg sm:text-xl md:text-2xl font-bold text-primary mb-0.5">
                      <span>{stat.value}</span>
                      {stat.icon && <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 fill-primary" />}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Content - Product Image */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
              style={{ y }}
              className="relative group order-first lg:order-last"
            >
              {/* Image Container with Perfect Edge Blending */}
              <div
                className="hero-image-container relative overflow-hidden max-w-full mx-auto"
                style={{
                  backgroundColor: "#ffffff",
                  backgroundImage: `
                    radial-gradient(circle at 50% 50%, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 100%)
                  `,
                  isolation: "isolate"
                }}
              >
                {/* Edge Blending Overlay - Top */}
                <div
                  className="edge-blend-top absolute top-0 left-0 w-full h-8 z-20 pointer-events-none"
                />

                {/* Edge Blending Overlay - Bottom */}
                <div
                  className="edge-blend-bottom absolute bottom-0 left-0 w-full h-8 z-20 pointer-events-none"
                />

                {/* Edge Blending Overlay - Left */}
                <div
                  className="edge-blend-left absolute top-0 left-0 w-8 h-full z-20 pointer-events-none"
                />

                {/* Edge Blending Overlay - Right */}
                <div
                  className="edge-blend-right absolute top-0 right-0 w-8 h-full z-20 pointer-events-none"
                />

                {/* Subtle ambient glow */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-primary/15 to-accent/15 rounded-full blur-xl pointer-events-none" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-accent/15 to-primary/15 rounded-full blur-xl pointer-events-none" />

                {/* Radial glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/8 to-accent/8 rounded-full blur-3xl pointer-events-none" />

                {/* Product Image */}
                <motion.img
                  src={heroProduct}
                  alt="Premium Technology"
                  className="w-full h-auto relative z-10 max-h-[300px] sm:max-h-[400px] md:max-h-[500px] lg:max-h-[600px] xl:max-h-[700px] object-contain"
                  whileHover={{ scale: 1.03, y: -6, transition: { duration: 0.3 } }}
                  style={{
                    backgroundColor: "#ffffff",
                    mixBlendMode: "normal",
                    isolation: "isolate",
                    objectFit: "contain",
                    objectPosition: "center"
                  }}
                />

                {/* Ground shadow */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-6 bg-black/10 rounded-full blur-xl" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="h-5 w-5 text-muted-foreground/60" />
          </motion.div>
          <p className="text-[10px] text-muted-foreground/50 tracking-widest uppercase">Scroll</p>
        </motion.div>
      </motion.section>

      {/* iPhone 16 Flagship Showcase */}
      <FlagshipiPhone16Showcase />

      {/* Shop by Category */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-background w-full overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 max-w-full">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-elegant text-2xl sm:text-3xl mb-6 sm:mb-8 md:mb-12 text-center"
          >
            Shop by Category
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 lg:gap-6 w-full"
          >
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.05 }}
              >
                <CategoryCard {...category} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trending Now - Smartphones */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-secondary w-full overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 max-w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <ProductCarousel
              title={trendingSections[0]?.title || "Trending in Smartphones"}
              products={trendingSmartphones}
              viewAllLink="/smartphones"
            />
          </motion.div>
        </div>
      </section>

      {/* Personalized Recommendations */}
      <PersonalizedRecommendations />

      {/* New Arrival Showcase - Replaces Flash Deals */}
      <NewArrivalShowcase />

      {/* Shop by Brand */}
      <BrandShowcase />

      {/* This Week's Favorites - Sales-Focused Product Showcase */}
      <ThisWeeksFavorites />

      <RecentlyViewed />

      {/* Why Shop With Us Section */}
      <WhyShopWithUs />
    </div>
  );
};

export default Home;
