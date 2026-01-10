import { motion, useScroll, useTransform } from "framer-motion";
import { Smartphone, Headphones, Gamepad2, CreditCard, Gift, Tv, Watch, Zap, ArrowRight, Star, Sparkles, ShoppingCart, Tablet, Cpu } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import rechargeLogo from "@/assets/recharges/logo.png";
import Header from "@/components/Header";
import CategoryCard from "@/components/CategoryCard";
import ProductCarousel from "@/components/ProductCarousel";
import PersonalizedRecommendations from "@/components/PersonalizedRecommendations";
import NewArrivalShowcase from "@/components/NewArrivalShowcase";
import WhyShopWithUs from "@/components/WhyShopWithUs";
import BrandShowcase from "@/components/BrandShowcase";
import ThisWeeksFavorites from "@/components/ThisWeeksFavorites";
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
import { getProductsByCategory } from "@/data/products";

// iPhone 16 Showcase Component
const FlagshipiPhone16Showcase = () => {
  const [selectedColor, setSelectedColor] = useState("ultramarine");
  const sectionRef = useRef<HTMLElement | null>(null);
  const scrollPositionRef = useRef<number>(0);

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
                Flagship Innovation
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
                <span className="text-elegant block mb-2">iPhone 16</span>
                <span className="text-gradient block">Redefining Excellence</span>
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
              Experience unparalleled performance with the A18 Pro chip, stunning camera system, and revolutionary design. The most advanced iPhone ever created.
            </motion.p>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 max-w-md mx-auto lg:mx-0 w-full"
            >
              {[
                { label: "A18 Pro Chip", sublabel: "Next-Gen Performance" },
                { label: "ProMotion", sublabel: "120Hz Display" },
                { label: "48MP Camera", sublabel: "Pro Photography" },
                { label: "All-Day Battery", sublabel: "Up to 29 Hours" },
              ].map((feature, i) => (
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
              <Link to="/product/500" className="w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                  <Button variant="gradient" size="lg" className="group shadow-glow w-full sm:w-auto text-sm sm:text-base">
                    <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Order Now
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="ml-2"
                    >
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </motion.div>
                  </Button>
                </motion.div>
              </Link>
              <Link to="/smartphones" className="w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="glassmorphism w-full sm:w-auto text-sm sm:text-base">
                    View All iPhones
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

            {/* iPhone Image */}
            <motion.div
              key={selectedColor}
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
                src={currentColor.image}
                alt={`iPhone 16 ${currentColor.label}`}
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

const Home = () => {
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

  const trendingSmartphones = getProductsByCategory("Smartphones")
    .reverse()
    .slice(0, 10)
    .map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      images: product.images,
      rating: product.rating,
      category: product.category,
    }));

  // Get real audio products from phone accessories
  const trendingAudio = getProductsByCategory("Audio");

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Header />

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
              initial={{ opacity: 0, x: -150, rotateY: 30 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{
                duration: 1.5,
                ease: [0.4, 0, 0.2, 1],
                type: "spring",
                stiffness: 80,
                damping: 20
              }}
              className="space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8 text-center lg:text-left"
            >
              {/* Floating Badge with Powerful Entrance */}
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.5, rotate: -10 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.3,
                  duration: 1,
                  ease: [0.4, 0, 0.2, 1],
                  type: "spring",
                  stiffness: 150,
                  damping: 15
                }}
                whileHover={{
                  scale: 1.08,
                  rotate: [0, -2, 2, 0],
                  y: -5,
                  transition: { duration: 0.4 }
                }}
              >
                <Badge className="mb-2 sm:mb-3 md:mb-4 relative overflow-hidden text-xs sm:text-sm">
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{
                      delay: 0.8,
                      duration: 1.5,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                  <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                  New Collection 2026
                </Badge>
              </motion.div>

              {/* Main Heading with Powerful Staggered Animation */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <motion.h1
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl 2xl:text-8xl font-bold leading-tight"
                >
                  <motion.span
                    initial={{ opacity: 0, y: 80, rotateX: -120, scale: 0.5 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                    transition={{
                      delay: 0.6,
                      duration: 1.2,
                      ease: [0.4, 0, 0.2, 1],
                      type: "spring",
                      stiffness: 80,
                      damping: 20
                    }}
                    className="text-gradient block"
                    whileHover={{ scale: 1.05, x: 10 }}
                  >
                    Future
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 80, rotateX: -120, scale: 0.5 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                    transition={{
                      delay: 0.8,
                      duration: 1.2,
                      ease: [0.4, 0, 0.2, 1],
                      type: "spring",
                      stiffness: 80,
                      damping: 20
                    }}
                    className="text-elegant block"
                    whileHover={{ scale: 1.05, x: 10 }}
                  >
                    Is Now
                  </motion.span>
                </motion.h1>
              </motion.div>

              {/* Description with Powerful Entrance */}
              <motion.div
                initial={{ opacity: 0, y: 50, x: -20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{
                  delay: 1,
                  duration: 1,
                  ease: [0.4, 0, 0.2, 1]
                }}
              >
                <motion.p
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2, duration: 1 }}
                  className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 font-light leading-relaxed px-2 sm:px-0 break-words"
                >
                  Experience the pinnacle of technology with our curated collection of premium devices,
                  smart accessories, and cutting-edge innovations.
                </motion.p>
              </motion.div>

              {/* Buttons with Powerful Entrance */}
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: 1.3,
                  duration: 1,
                  ease: [0.4, 0, 0.2, 1],
                  type: "spring",
                  stiffness: 120,
                  damping: 15
                }}
                className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 justify-center lg:justify-start px-2 sm:px-0 w-full"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/products">
                    <Button variant="gradient" size="lg" className="group shadow-glow relative overflow-hidden">
                      <motion.div
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      />
                      <span className="relative z-10">Explore Collection</span>
                      <motion.div
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </motion.div>
                    </Button>
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="outline" size="lg" className="glassmorphism relative overflow-hidden">
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-md"
                    />
                    <span className="relative z-10">View Deals</span>
                  </Button>
                </motion.div>
              </motion.div>

              {/* Stats with Powerful Staggered Animation */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 1.5,
                  duration: 1,
                  ease: [0.4, 0, 0.2, 1],
                  type: "spring",
                  stiffness: 100,
                  damping: 18
                }}
                className="flex flex-wrap gap-3 sm:gap-4 md:gap-6 lg:gap-8 pt-4 sm:pt-6 md:pt-8 justify-center lg:justify-start w-full"
              >
                {[
                  { value: "10K+", label: "Products" },
                  { value: "4.9", label: "Rating", icon: Star },
                  { value: "50K+", label: "Customers" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 40, scale: 0.5, rotateY: -30 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }}
                    transition={{
                      delay: 1.7 + (i * 0.15),
                      duration: 0.8,
                      ease: [0.4, 0, 0.2, 1],
                      type: "spring",
                      stiffness: 150,
                      damping: 15
                    }}
                    whileHover={{
                      scale: 1.15,
                      y: -8,
                      rotateY: 5,
                      transition: { duration: 0.3, type: "spring" }
                    }}
                    className="text-center relative group"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg blur-xl"
                    />
                    <div className="relative z-10 flex items-center justify-center gap-1 text-lg sm:text-xl md:text-2xl font-bold text-primary mb-1">
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.1 + (i * 0.1), duration: 0.8 }}
                      >
                        {stat.value}
                      </motion.span>
                      {stat.icon && (
                        <motion.div
                          initial={{ opacity: 0, rotate: -180 }}
                          animate={{ opacity: 1, rotate: 0 }}
                          transition={{ delay: 2.2 + (i * 0.1), duration: 0.8 }}
                        >
                          <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 fill-primary" />
                        </motion.div>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Content - Premium 3D Product Showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.6, rotateY: 45, x: 100 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0, x: 0 }}
              transition={{
                duration: 1.8,
                delay: 0.4,
                ease: [0.4, 0, 0.2, 1],
                type: "spring",
                stiffness: 70,
                damping: 25
              }}
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

                {/* Multiple Floating Elements */}
                <motion.div
                  className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl"
                  initial={{
                    opacity: 0,
                    scale: 0,
                    rotate: -180
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    rotate: 0
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 1.0,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                />

                <motion.div
                  className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-xl"
                  initial={{
                    opacity: 0,
                    scale: 0,
                    rotate: 180
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    rotate: 0
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 1.2,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                />

                {/* Main Glow Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl"
                  initial={{
                    opacity: 0,
                    scale: 0.5,
                    rotate: 45
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    rotate: 0
                  }}
                  transition={{
                    duration: 1.8,
                    delay: 1.0,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                />

                {/* Pulsing Ring Effect */}
                <motion.div
                  className="absolute inset-0 border-2 border-primary/20 rounded-full"
                  initial={{
                    scale: 0.8,
                    opacity: 0
                  }}
                  animate={{
                    scale: [0.8, 1.1, 0.8],
                    opacity: [0, 0.5, 0]
                  }}
                  transition={{
                    duration: 3,
                    delay: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Product Image with Powerful Animation */}
                <motion.img
                  src={heroProduct}
                  alt="Premium Technology"
                  className="w-full h-auto relative z-10 max-h-[300px] sm:max-h-[400px] md:max-h-[500px] lg:max-h-[600px] xl:max-h-[700px] object-contain"
                  initial={{
                    opacity: 0,
                    scale: 0.4,
                    rotateY: -60,
                    rotateX: 20,
                    filter: "blur(15px)",
                    y: 50
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    rotateY: 0,
                    rotateX: 0,
                    filter: "blur(0px)",
                    y: 0
                  }}
                  transition={{
                    duration: 2,
                    delay: 0.6,
                    ease: [0.4, 0, 0.2, 1],
                    type: "spring",
                    stiffness: 60,
                    damping: 20
                  }}
                  whileHover={{
                    scale: 1.05,
                    rotateY: 5,
                    rotateX: -2,
                    y: -10,
                    transition: { duration: 0.4, type: "spring" }
                  }}
                  style={{
                    backgroundColor: "#ffffff",
                    mixBlendMode: "normal",
                    isolation: "isolate",
                    imageRendering: "auto",
                    objectFit: "contain",
                    objectPosition: "center"
                  }}
                />

                {/* Animated Reflection */}
                <motion.div
                  className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8, duration: 1 }}
                />

                {/* Enhanced Shadow with Animation */}
                <motion.div
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-6 bg-black/10 rounded-full blur-xl"
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                    y: 20
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 1.3,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                />

                {/* Sparkle Effects */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-primary/60 rounded-full"
                    style={{
                      top: `${20 + (i * 15)}%`,
                      left: `${10 + (i * 15)}%`,
                    }}
                    initial={{
                      opacity: 0,
                      scale: 0,
                      rotate: 0
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      rotate: [0, 360]
                    }}
                    transition={{
                      duration: 2,
                      delay: 1.5 + (i * 0.2),
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 2.5,
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1]
          }}
          className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="relative"
          >
            {/* Outer Ring */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 w-6 h-10 border border-primary/30 rounded-full"
            />

            {/* Main Scroll Indicator */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="w-6 h-10 border-2 border-primary rounded-full flex justify-center p-2 relative z-10"
            >
              <motion.div
                className="w-1 h-2 bg-primary rounded-full"
                animate={{
                  opacity: [0.4, 1, 0.4]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>

            {/* Pulse Effect */}
            <motion.div
              className="absolute inset-0 w-6 h-10 border border-primary/20 rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0, 0.6, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0.5,
                ease: "easeOut"
              }}
            />
          </motion.div>

          {/* Scroll Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3, duration: 0.5 }}
            className="text-center mt-4"
          >
            <motion.p
              className="text-xs text-muted-foreground font-light tracking-wider"
              animate={{
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              SCROLL TO EXPLORE
            </motion.p>
          </motion.div>
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
              title="Trending in Smartphones"
              products={trendingSmartphones}
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

      {/* Why Shop With Us Section */}
      <WhyShopWithUs />

      {/* Footer */}
      <footer className="py-12 sm:py-16 bg-accent text-accent-foreground w-full overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 max-w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12 mb-8 sm:mb-12">
            <div>
              <h3 className="text-elegant text-lg mb-4">TechStore</h3>
              <p className="text-sm font-light tracking-wide opacity-80">
                Premium technology and digital services for modern living.
              </p>
            </div>
            <div>
              <h4 className="text-elegant text-sm mb-4">Shop</h4>
              <ul className="space-y-2 text-sm font-light">
                <li><a href="#" className="hover:underline">All Products</a></li>
                <li><a href="#" className="hover:underline">New Arrivals</a></li>
                <li><a href="#" className="hover:underline">Best Sellers</a></li>
                <li><a href="#" className="hover:underline">Offers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-elegant text-sm mb-4">Support</h4>
              <ul className="space-y-2 text-sm font-light">
                <li><a href="#" className="hover:underline">Contact Us</a></li>
                <li><a href="#" className="hover:underline">Shipping Info</a></li>
                <li><a href="#" className="hover:underline">Returns</a></li>
                <li><a href="#" className="hover:underline">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-elegant text-sm mb-4">Company</h4>
              <ul className="space-y-2 text-sm font-light">
                <li><a href="#" className="hover:underline">About Us</a></li>
                <li><a href="#" className="hover:underline">Careers</a></li>
                <li><a href="#" className="hover:underline">Privacy</a></li>
                <li><a href="#" className="hover:underline">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-accent-foreground/20 text-center text-sm font-light">
            <p>&copy; 2026 TechStore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
