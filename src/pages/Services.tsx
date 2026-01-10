import { useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Gift, 
  CreditCard, 
  Tv, 
  Smartphone, 
  Zap, 
  Headphones, 
  Gamepad2, 
  Watch, 
  Tablet,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Star,
  Shield,
  Truck,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Service {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  link: string;
  features: string[];
  color: string;
  gradient: string;
}

const Services = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const services: Service[] = [
    {
      id: "gift-cards",
      name: "Gift Cards",
      description: "Digital gift cards for all major platforms including iTunes, Google Play, Steam, PlayStation, Xbox, and more. Perfect for gifting or personal use.",
      icon: Gift,
      link: "/gift-cards",
      features: [
        "Instant Delivery",
        "Multiple Platforms",
        "Worldwide Redeemable",
        "Secure & Verified"
      ],
      color: "from-pink-500 to-rose-500",
      gradient: "bg-gradient-to-br from-pink-500/10 to-rose-500/10"
    },
    {
      id: "recharges",
      name: "Mobile Recharges",
      description: "Top up your mobile phone instantly with our wide range of recharge cards. Support for all major networks with flexible plans and pricing.",
      icon: CreditCard,
      link: "/recharges",
      features: [
        "Instant Activation",
        "All Networks Supported",
        "Flexible Plans",
        "24/7 Availability"
      ],
      color: "from-blue-500 to-cyan-500",
      gradient: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10"
    },
    {
      id: "streaming",
      name: "Streaming Services",
      description: "Premium streaming subscriptions including Netflix, Shahid VIP, and IPTV services. Access thousands of movies, shows, and live TV channels.",
      icon: Tv,
      link: "/streaming-services",
      features: [
        "Premium Content",
        "HD & 4K Quality",
        "Multiple Devices",
        "Best Prices"
      ],
      color: "from-purple-500 to-indigo-500",
      gradient: "bg-gradient-to-br from-purple-500/10 to-indigo-500/10"
    },
    {
      id: "smartphones",
      name: "Smartphones",
      description: "Latest smartphones from top brands including Apple, Samsung, Tecno, and more. From budget-friendly to flagship devices, we have it all.",
      icon: Smartphone,
      link: "/smartphones",
      features: [
        "Latest Models",
        "All Brands",
        "Warranty Included",
        "Expert Support"
      ],
      color: "from-slate-600 to-slate-800",
      gradient: "bg-gradient-to-br from-slate-600/10 to-slate-800/10"
    },
    {
      id: "accessories",
      name: "Accessories",
      description: "Complete your tech setup with premium accessories including cases, chargers, cables, stands, LED lights, and more essential tech accessories.",
      icon: Zap,
      link: "/accessories",
      features: [
        "Premium Quality",
        "Wide Selection",
        "Fast Shipping",
        "Best Prices"
      ],
      color: "from-yellow-500 to-orange-500",
      gradient: "bg-gradient-to-br from-yellow-500/10 to-orange-500/10"
    },
    {
      id: "audio",
      name: "Audio Devices",
      description: "High-quality audio equipment including headphones, earbuds, speakers, and wireless audio devices from top brands like Apple, JBL, and more.",
      icon: Headphones,
      link: "/audio",
      features: [
        "Premium Sound",
        "Wireless Options",
        "Noise Cancellation",
        "Long Battery Life"
      ],
      color: "from-green-500 to-emerald-500",
      gradient: "bg-gradient-to-br from-green-500/10 to-emerald-500/10"
    },
    {
      id: "gaming",
      name: "Gaming",
      description: "Gaming consoles, controllers, and accessories. From PlayStation to Xbox, get everything you need for the ultimate gaming experience.",
      icon: Gamepad2,
      link: "/gaming",
      features: [
        "Latest Consoles",
        "Gaming Accessories",
        "Pre-orders Available",
        "Expert Gaming Support"
      ],
      color: "from-red-500 to-pink-500",
      gradient: "bg-gradient-to-br from-red-500/10 to-pink-500/10"
    },
    {
      id: "wearables",
      name: "Wearables",
      description: "Smartwatches and fitness trackers from Apple, Samsung, and other leading brands. Stay connected and track your health on the go.",
      icon: Watch,
      link: "/wearables",
      features: [
        "Health Tracking",
        "Smart Features",
        "Long Battery",
        "Stylish Designs"
      ],
      color: "from-teal-500 to-cyan-500",
      gradient: "bg-gradient-to-br from-teal-500/10 to-cyan-500/10"
    },
    {
      id: "tablets",
      name: "Tablets",
      description: "Powerful tablets for work, creativity, and entertainment. From iPad to Android tablets, find the perfect device for your needs.",
      icon: Tablet,
      link: "/tablets",
      features: [
        "High Performance",
        "Large Displays",
        "Stylus Support",
        "All Price Ranges"
      ],
      color: "from-violet-500 to-purple-500",
      gradient: "bg-gradient-to-br from-violet-500/10 to-purple-500/10"
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: "100% Authentic",
      description: "All products are genuine and verified"
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Quick and reliable shipping options"
    },
    {
      icon: Star,
      title: "Expert Support",
      description: "24/7 customer service assistance"
    },
    {
      icon: Clock,
      title: "Instant Activation",
      description: "Digital services activated immediately"
    }
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background max-w-full">
      <Header />

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 -z-10" />
        
        {/* Floating Orbs */}
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
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-block mb-4 sm:mb-6"
            >
              <Badge className="text-xs sm:text-sm px-4 py-2 glassmorphism border-primary/30">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Our Services
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6"
            >
              <span className="text-elegant block mb-2">Comprehensive</span>
              <span className="text-gradient block">Tech Services</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed px-2 sm:px-0 break-words"
            >
              Everything you need for your digital lifestyle. From premium devices to digital services, 
              we provide comprehensive solutions with exceptional quality and support.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 w-full overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 max-w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 w-full">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -8 }}
                  className="h-full"
                >
                  <Card className="h-full border-border/50 hover:border-primary/50 transition-all duration-300 group overflow-hidden relative">
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    
                    <CardContent className="p-4 sm:p-6 md:p-8 relative z-10 h-full flex flex-col">
                      {/* Icon */}
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 sm:mb-6 shadow-lg`}
                      >
                        <Icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
                      </motion.div>

                      {/* Title */}
                      <h3 className="text-elegant text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 group-hover:text-primary transition-colors break-words">
                        {service.name}
                      </h3>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 leading-relaxed flex-grow break-words">
                        {service.description}
                      </p>

                      {/* Features */}
                      <div className="space-y-2 mb-4 sm:mb-6">
                        {service.features.map((feature, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 + i * 0.05 }}
                            className="flex items-center gap-2 text-xs sm:text-sm"
                          >
                            <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground break-words">{feature}</span>
                          </motion.div>
                        ))}
                      </div>

                      {/* CTA Button */}
                      <Link to={service.link} className="mt-auto">
                        <motion.div
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="outline"
                            className="w-full group/btn glassmorphism border-primary/30 hover:border-primary hover:bg-primary/10"
                          >
                            <span className="text-xs sm:text-sm">Explore {service.name}</span>
                            <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </motion.div>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-secondary w-full overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 max-w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <h2 className="text-elegant text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 break-words">
              Why Choose Our Services?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto break-words px-2 sm:px-0">
              We're committed to providing the best experience with every service we offer
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 w-full">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -5 }}
                  className="text-center"
                >
                  <Card className="border-border/50 hover:border-primary/50 transition-all duration-300 h-full">
                    <CardContent className="p-6 sm:p-8">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg"
                      >
                        <Icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
                      </motion.div>
                      <h3 className="text-elegant text-base sm:text-lg font-bold mb-2 break-words">
                        {benefit.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground break-words">
                        {benefit.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 w-full overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 max-w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/95 to-accent p-6 sm:p-8 md:p-12 lg:p-16 text-center text-white w-full max-w-full"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: '40px 40px'
              }} />
            </div>

            <div className="relative z-10">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6 break-words px-2 sm:px-0"
              >
                Ready to Get Started?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto opacity-95 break-words px-2 sm:px-0"
              >
                Explore our wide range of services and find exactly what you need. 
                Our team is here to help you every step of the way.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
              >
                <Link to="/products">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full sm:w-auto text-sm sm:text-base"
                  >
                    Browse All Products
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </Link>
                <a href="#contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto text-sm sm:text-base bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    Contact Us
                  </Button>
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 sm:py-16 bg-accent text-accent-foreground w-full overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 max-w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-12 mb-6 sm:mb-8 md:mb-12 w-full">
            <div>
              <h3 className="text-elegant text-lg mb-4">KHA_MOBILE</h3>
              <p className="text-sm font-light tracking-wide opacity-80">
                Premium technology and digital services for modern living.
              </p>
            </div>
            <div>
              <h4 className="text-elegant text-sm mb-4">Services</h4>
              <ul className="space-y-2 text-sm font-light">
                <li><Link to="/gift-cards" className="hover:underline">Gift Cards</Link></li>
                <li><Link to="/recharges" className="hover:underline">Recharges</Link></li>
                <li><Link to="/streaming-services" className="hover:underline">Streaming</Link></li>
                <li><Link to="/accessories" className="hover:underline">Accessories</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-elegant text-sm mb-4">Shop</h4>
              <ul className="space-y-2 text-sm font-light">
                <li><Link to="/smartphones" className="hover:underline">Smartphones</Link></li>
                <li><Link to="/audio" className="hover:underline">Audio</Link></li>
                <li><Link to="/gaming" className="hover:underline">Gaming</Link></li>
                <li><Link to="/wearables" className="hover:underline">Wearables</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-elegant text-sm mb-4">Support</h4>
              <ul className="space-y-2 text-sm font-light">
                <li><a href="#contact" className="hover:underline">Contact Us</a></li>
                <li><a href="#" className="hover:underline">Shipping Info</a></li>
                <li><a href="#" className="hover:underline">Returns</a></li>
                <li><a href="#" className="hover:underline">FAQ</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-accent-foreground/20 text-center text-sm font-light">
            <p>&copy; 2026 KHA_MOBILE. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Services;

