import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Store, 
  Users, 
  Award, 
  Heart, 
  Shield, 
  Zap,
  TrendingUp,
  Globe,
  Phone,
  MapPin,
  Clock,
  Sparkles
} from "lucide-react";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { phoneAccessories, wearablesProducts, smartphoneProducts, tabletProducts, iphoneCases, gamingConsoles } from "@/data/products";
import { greenLionProducts } from "@/data/greenLionProducts";

const AboutUs = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Calculate real product counts
  const totalProducts = useMemo(() => {
    return phoneAccessories.length + 
           wearablesProducts.length + 
           smartphoneProducts.length + 
           tabletProducts.length + 
           iphoneCases.length + 
           gamingConsoles.length + 
           greenLionProducts.length;
  }, []);

  // Calculate average rating from all products
  const averageRating = useMemo(() => {
    const allProducts = [
      ...phoneAccessories,
      ...wearablesProducts,
      ...smartphoneProducts,
      ...tabletProducts,
      ...iphoneCases,
      ...gamingConsoles,
      ...greenLionProducts
    ];
    const totalRating = allProducts.reduce((sum, p) => sum + (p.rating || 0), 0);
    return (totalRating / allProducts.length).toFixed(1);
  }, []);

  const values = [
    {
      icon: Heart,
      title: "Customer First",
      description: "Your satisfaction is our top priority. We go above and beyond to ensure every customer has an exceptional experience.",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: Shield,
      title: "Quality Guaranteed",
      description: "We only sell 100% authentic products from authorized distributors. Every item comes with a warranty.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Zap,
      title: "Innovation Driven",
      description: "We stay ahead of the curve, offering the latest technology and cutting-edge products as soon as they're available.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: TrendingUp,
      title: "Best Value",
      description: "Competitive pricing with price match guarantee. We ensure you get the best deal on every purchase.",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const stats = [
    { value: `${totalProducts}+`, label: "Products", icon: Store },
    { value: "5,000+", label: "Happy Customers", icon: Users },
    { value: averageRating, label: "Average Rating", icon: Award },
    { value: "24/7", label: "Support", icon: Clock }
  ];

  const timeline = [
    {
      year: "2020",
      title: "Our Beginning",
      description: "Started with a vision to make premium technology accessible to everyone in Lebanon."
    },
    {
      year: "2021",
      title: "Rapid Growth",
      description: "Expanded our product range and opened our first retail location. Reached 10,000+ satisfied customers."
    },
    {
      year: "2022",
      title: "Going Digital",
      description: "Launched our e-commerce platform, bringing the entire store experience online with seamless shopping."
    },
    {
      year: "2023",
      title: "Service Excellence",
      description: "Introduced premium services including gift cards, recharges, and streaming subscriptions."
    },
    {
      year: "2024",
      title: "Innovation Leader",
      description: "Became the region's trusted source for cutting-edge technology, offering pre-orders for flagship devices."
    },
    {
      year: "2025",
      title: "Future Forward",
      description: "Continuing to innovate with AI-powered recommendations, instant delivery, and expanded product categories."
    }
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background max-w-full">
      <Header />

      {/* Hero Section with Logo */}
      <section className="relative py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 -z-10" />
        
        {/* Animated Orbs */}
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 sm:w-64 sm:h-64 rounded-full bg-primary/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-40 h-40 sm:w-96 sm:h-96 rounded-full bg-accent/10 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        <div className="container mx-auto px-4 sm:px-6 max-w-full">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1, type: "spring", stiffness: 100, damping: 15 }}
              className="mb-6 sm:mb-8 md:mb-12"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="inline-block relative"
              >
                {/* Glow Effect */}
                <motion.div
                  className="absolute inset-0 rounded-full blur-2xl bg-gradient-to-r from-primary to-accent opacity-30"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                
                {/* Logo */}
                <motion.img
                  src="/LOGO.png"
                  alt="KHA_MOBILE Logo"
                  className="h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 object-contain relative z-10 drop-shadow-2xl"
                  initial={{ rotate: 0 }}
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    y: [0, -10, 0]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    repeatDelay: 2
                  }}
                />
                
                {/* Ring Effect */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary/30"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0, 0.5, 0]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeOut"
                  }}
                />
              </motion.div>
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-block mb-4 sm:mb-6"
            >
              <Badge className="text-xs sm:text-sm px-4 py-2 glassmorphism border-primary/30">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Established 2020
              </Badge>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6"
            >
              <span className="text-elegant block mb-2">About</span>
              <span className="text-gradient block">KHA_MOBILE</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto px-2 sm:px-0 break-words"
            >
              Your trusted source for premium technology in Lebanon. We're passionate about bringing 
              the latest smartphones, gadgets, digital services, and accessories to tech enthusiasts 
              across the region.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-secondary w-full overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 max-w-full">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 w-full">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30, scale: 0.8 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, type: "spring" }}
                  whileHover={{ y: -5, scale: 1.05 }}
                  className="text-center"
                >
                  <Card className="border-border/50 hover:border-primary/50 transition-all duration-300 h-full">
                    <CardContent className="p-4 sm:p-6">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"
                      >
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </motion.div>
                      <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1 sm:mb-2">
                        {stat.value}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {stat.label}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 w-full overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 max-w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <h2 className="text-elegant text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 break-words">
              Our Core Values
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2 sm:px-0 break-words">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 w-full">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.15, duration: 0.6 }}
                  whileHover={{ y: -8 }}
                  className="h-full"
                >
                  <Card className="h-full border-border/50 hover:border-primary/50 transition-all duration-300 group overflow-hidden relative">
                    {/* Gradient Background on Hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                    
                    <CardContent className="p-6 sm:p-8 relative z-10 text-center h-full flex flex-col">
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        transition={{ type: "spring" }}
                        className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center shadow-lg`}
                      >
                        <Icon className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                      </motion.div>
                      
                      <h3 className="text-elegant text-lg sm:text-xl font-bold mb-2 sm:mb-3 break-words">
                        {value.title}
                      </h3>
                      
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Story Timeline */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-secondary w-full overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 max-w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <h2 className="text-elegant text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 break-words">
              Our Journey
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2 sm:px-0 break-words">
              From a small shop to Lebanon's leading tech retailer
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-4 sm:space-y-6 md:space-y-8 relative">
              {/* Timeline Line */}
              <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary hidden sm:block" />

              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="relative"
                >
                  <Card className="border-border/50 hover:border-primary/50 transition-all duration-300 ml-0 sm:ml-20 w-full max-w-full">
                    <CardContent className="p-4 sm:p-6 md:p-8">
                      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 w-full">
                        {/* Year Badge */}
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="flex-shrink-0"
                        >
                          <Badge className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-primary to-accent text-white border-0 whitespace-nowrap">
                            {item.year}
                          </Badge>
                        </motion.div>

                        {/* Timeline Dot */}
                        <motion.div
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                          className="absolute left-3.5 sm:left-7 top-6 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-to-r from-primary to-accent shadow-lg hidden sm:block"
                          style={{ marginLeft: '-0.5rem' }}
                        />

                        {/* Content */}
                        <div className="flex-1 min-w-0 w-full">
                          <h3 className="text-elegant text-base sm:text-lg md:text-xl font-bold mb-2 break-words">
                            {item.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 w-full overflow-hidden" id="contact">
        <div className="container mx-auto px-4 sm:px-6 max-w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <h2 className="text-elegant text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 break-words">
              Get In Touch
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2 sm:px-0 break-words">
              We'd love to hear from you. Visit us or reach out anytime.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-5xl mx-auto w-full">
            {/* Phone */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="border-border/50 hover:border-primary/50 transition-all duration-300 h-full">
                <CardContent className="p-6 sm:p-8 text-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg"
                  >
                    <Phone className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </motion.div>
                  <h3 className="text-elegant text-base sm:text-lg font-bold mb-2">
                    Phone
                  </h3>
                  <a 
                    href="tel:+96181861811" 
                    className="text-sm sm:text-base text-primary hover:underline break-all"
                  >
                    +961 81 861 811
                  </a>
                </CardContent>
              </Card>
            </motion.div>

            {/* WhatsApp */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -5 }}
            >
              <Card className="border-border/50 hover:border-primary/50 transition-all duration-300 h-full">
                <CardContent className="p-6 sm:p-8 text-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center shadow-lg"
                  >
                    <Phone className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </motion.div>
                  <h3 className="text-elegant text-base sm:text-lg font-bold mb-2">
                    WhatsApp
                  </h3>
                  <a 
                    href="https://wa.me/96181861811" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm sm:text-base text-primary hover:underline break-all"
                  >
                    +961 81 861 811
                  </a>
                </CardContent>
              </Card>
            </motion.div>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -5 }}
              className="sm:col-span-2 lg:col-span-1 w-full"
            >
              <Card className="border-border/50 hover:border-primary/50 transition-all duration-300 h-full">
                <CardContent className="p-6 sm:p-8 text-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg"
                  >
                    <MapPin className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </motion.div>
                  <h3 className="text-elegant text-base sm:text-lg font-bold mb-2">
                    Location
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Lebanon
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 w-full overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 max-w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <Card className="border-primary/20 overflow-hidden">
              <CardContent className="p-6 sm:p-8 md:p-12 relative">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 -z-10" />
                
                <div className="relative z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring" }}
                    className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 sm:mb-8 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg"
                  >
                    <Globe className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                  </motion.div>

                  <h2 className="text-elegant text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-center break-words px-2 sm:px-0">
                    Our Mission
                  </h2>
                  
                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed text-center max-w-3xl mx-auto mb-6 sm:mb-8 break-words px-2 sm:px-0">
                    At KHA_MOBILE, we're on a mission to make premium technology accessible to everyone. 
                    We believe that cutting-edge gadgets, reliable digital services, and expert support 
                    shouldn't be a luxury—they should be a standard.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 w-full">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="text-center sm:text-left"
                    >
                      <h4 className="text-elegant text-base sm:text-lg font-bold mb-2 text-primary">
                        Vision
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground break-words">
                        To be the most trusted technology partner in the Middle East, 
                        known for authenticity, innovation, and exceptional service.
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="text-center sm:text-left"
                    >
                      <h4 className="text-elegant text-base sm:text-lg font-bold mb-2 text-accent break-words">
                        Commitment
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground break-words">
                        We're committed to providing genuine products, competitive prices, 
                        expert advice, and support that goes beyond the sale.
                      </p>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 sm:py-16 bg-accent text-accent-foreground w-full overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 max-w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-12 mb-6 sm:mb-8 md:mb-12 w-full">
            <div>
              <h3 className="text-elegant text-lg mb-4">KHA_MOBILE</h3>
              <p className="text-sm font-light tracking-wide opacity-80 break-words">
                Premium technology and digital services for modern living.
              </p>
            </div>
            <div>
              <h4 className="text-elegant text-sm mb-4">Shop</h4>
              <ul className="space-y-2 text-sm font-light">
                <li><a href="/products" className="hover:underline">All Products</a></li>
                <li><a href="/smartphones" className="hover:underline">Smartphones</a></li>
                <li><a href="/audio" className="hover:underline">Audio</a></li>
                <li><a href="/accessories" className="hover:underline">Accessories</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-elegant text-sm mb-4">Services</h4>
              <ul className="space-y-2 text-sm font-light">
                <li><a href="/gift-cards" className="hover:underline">Gift Cards</a></li>
                <li><a href="/recharges" className="hover:underline">Recharges</a></li>
                <li><a href="/streaming-services" className="hover:underline">Streaming</a></li>
                <li><a href="/services" className="hover:underline">All Services</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-elegant text-sm mb-4">Company</h4>
              <ul className="space-y-2 text-sm font-light">
                <li><a href="/about" className="hover:underline">About Us</a></li>
                <li><a href="#contact" className="hover:underline">Contact</a></li>
                <li><a href="#" className="hover:underline">Privacy</a></li>
                <li><a href="#" className="hover:underline">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-accent-foreground/20 text-center text-sm font-light">
            <p>&copy; 2025 KHA_MOBILE. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;
