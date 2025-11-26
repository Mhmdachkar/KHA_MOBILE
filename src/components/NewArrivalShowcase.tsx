import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Power, 
  Radio, 
  Camera, 
  ScanFace, 
  Battery, 
  Gauge, 
  Activity, 
  ThermometerSun, 
  Wifi 
} from "lucide-react";
import { getGreenLionProductById } from "@/data/greenLionProducts";
import { useState, useEffect } from "react";

const NewArrivalShowcase = () => {
  const ROTATION_INTERVAL = 3 * 60 * 1000; // 3 minutes

  const showcases = [
    {
      id: 5019, // Green Lion New York Gimbal
      highlightFeatures: [
        { icon: Camera, label: "Stabilization", value: "3-Axis Gimbal" },
        { icon: ScanFace, label: "Smart Tracking", value: "Face & Object Tracking" },
        { icon: Battery, label: "Working Time", value: "7-10 Hours" }
      ]
    },
    {
      id: 5002, // Green Lion Mini Massage Gun Pro
      highlightFeatures: [
        { icon: Zap, label: "Power", value: "40W High Torque" },
        { icon: Gauge, label: "Speed Levels", value: "4 Adjustable Speeds" },
        { icon: Activity, label: "Quiet Motor", value: "<55dB Noise Level" }
      ]
    },
    {
      id: 5034, // Green Lion Bedside Clock (Explicit Request)
      highlightFeatures: [
        { icon: ThermometerSun, label: "Color Temperature", value: "3000±300K" },
        { icon: Power, label: "Power Input", value: "9V/3A, 27W Max" },
        { icon: Wifi, label: "Wireless Output", value: "15W Max" }
      ]
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % showcases.length);
    }, ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Check if mobile for responsive animations
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const currentShowcase = showcases[currentIndex];
  const product = getGreenLionProductById(currentShowcase.id);

  if (!product) return null;

  // "Heavy" scroll transition variants - mimics Apple's friction/mass
  // Lighter feel on mobile for better performance
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? (isMobile ? 300 : 1000) : (isMobile ? -300 : -1000),
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? (isMobile ? 300 : 1000) : (isMobile ? -300 : -1000),
      opacity: 0,
      scale: 0.96,
    }),
  };

  const swipeConfidenceThreshold = isMobile ? 5000 : 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setCurrentIndex((prev) => {
      let next = prev + newDirection;
      if (next < 0) next = showcases.length - 1;
      if (next >= showcases.length) next = 0;
      return next;
    });
  };

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-24 bg-background relative overflow-hidden min-h-[500px] sm:min-h-[600px] md:min-h-[700px] flex items-center">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[10%] right-[5%] w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10 w-full">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={product.id}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { 
                type: "spring", 
                stiffness: isMobile ? 400 : 300, 
                damping: isMobile ? 35 : 30, 
                mass: isMobile ? 0.8 : 1.2 
              }, // Responsive "heavy" feel - lighter on mobile
              opacity: { duration: isMobile ? 0.3 : 0.4 },
              scale: { duration: isMobile ? 0.3 : 0.4 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            dragMomentum={false}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            style={{ touchAction: 'pan-y pinch-zoom' }}
            className="flex flex-col lg:flex-row items-center gap-4 sm:gap-6 md:gap-8 lg:gap-16 w-full"
          >
            {/* Product Image Side */}
            <div className="w-full lg:w-1/2 relative order-2 lg:order-1">
              <div className="relative aspect-square max-w-[280px] sm:max-w-md mx-auto lg:max-w-full">
                {/* Glowing Background behind image */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-2xl scale-90" />
                
                <motion.div
                  whileHover={window.matchMedia('(hover: hover)').matches ? { scale: 1.05, rotate: -2 } : undefined}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative z-10 w-full h-full flex items-center justify-center"
                  style={{ touchAction: 'manipulation' }}
                >
                  <img 
                    src={product.images[0]} 
                    alt={product.name} 
                    className="w-full h-full object-contain drop-shadow-2xl max-h-[250px] sm:max-h-[300px] md:max-h-[400px] lg:max-h-[500px]"
                    loading="lazy"
                  />
                </motion.div>

                {/* Floating Badges */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="absolute top-2 right-2 sm:top-4 sm:right-4 md:top-8 md:right-8 bg-white/90 backdrop-blur-sm p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl shadow-lg border border-border/50"
                >
                  <div className="flex flex-col items-center text-center">
                    <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Trending</span>
                    <span className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-primary">Product</span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Content Side */}
            <div className="w-full lg:w-1/2 space-y-4 sm:space-y-5 md:space-y-6 order-1 lg:order-2">
              <div>
                <Badge variant="outline" className="mb-3 sm:mb-4 px-2.5 sm:px-3 py-0.5 sm:py-1 border-primary/30 text-primary bg-primary/5 text-xs sm:text-sm">
                  <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 fill-primary" />
                  Featured Item
                </Badge>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-elegant mb-2 sm:mb-3 md:mb-4 leading-tight"
                >
                  {product.name}
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-muted-foreground font-light mb-2 line-clamp-2 sm:line-clamp-none"
                >
                  {product.title.split('-')[1]?.trim() || product.title}
                </motion.p>
                <div className="h-0.5 sm:h-1 w-12 sm:w-16 md:w-20 bg-gradient-to-r from-primary to-accent rounded-full mb-4 sm:mb-5 md:mb-6" />
              </div>

              {/* Why this is a great choice section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-secondary/30 border border-border/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8"
              >
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                  Why this is a great choice
                </h3>
                
                <div className="grid gap-3 sm:gap-4">
                  {currentShowcase.highlightFeatures.map((feature, index) => {
                    const IconComponent = feature.icon;
                    return (
                      <div key={index} className="flex items-start gap-2 sm:gap-3" style={{ touchAction: 'manipulation' }}>
                        <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 text-primary mt-0.5 flex-shrink-0">
                          <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-foreground text-sm sm:text-base">{feature.label}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground break-words">{feature.value}</p>
                      </div>
                    </div>
                    );
                  })}
                </div>

                <div className="mt-4 sm:mt-5 md:mt-6 pt-4 sm:pt-5 md:pt-6 border-t border-border/50 flex flex-wrap gap-3 sm:gap-4 md:gap-8">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-foreground/80">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                    <span>Authorized Reseller</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-foreground/80">
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                    <span>1 Year Warranty</span>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-3 md:pt-4"
              >
                <Link to={`/product/${product.id}`} className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto text-sm sm:text-base md:text-lg px-6 sm:px-7 md:px-8 py-4 sm:py-5 md:py-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 min-h-[44px] sm:min-h-[48px] md:min-h-[52px]"
                    style={{ touchAction: 'manipulation' }}
                  >
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </Link>
                <Link to="/products" className="w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full sm:w-auto text-sm sm:text-base md:text-lg px-6 sm:px-7 md:px-8 py-4 sm:py-5 md:py-6 min-h-[44px] sm:min-h-[48px] md:min-h-[52px]"
                    style={{ touchAction: 'manipulation' }}
                  >
                    View All Products
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Carousel Indicators */}
        <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 sm:gap-2 z-20">
          {showcases.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 min-w-[12px] sm:min-w-[16px] ${
                idx === currentIndex 
                  ? "w-6 sm:w-8 bg-primary" 
                  : "w-1.5 sm:w-2 bg-primary/30 hover:bg-primary/50 active:bg-primary/60"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
              style={{ touchAction: 'manipulation' }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrivalShowcase;
