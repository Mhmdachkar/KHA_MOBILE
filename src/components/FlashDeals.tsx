import { motion } from "framer-motion";
import { Zap, Clock, TrendingDown } from "lucide-react";
import ProductCard from "./ProductCard";
import { Badge } from "./ui/badge";
import { useEffect, useState } from "react";

const FlashDeals = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 30
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const dealOfTheDay = {
    id: 23,
    name: "Sony Alpha A7 IV",
    price: 2199,
    originalPrice: 2799,
    image: "https://images.unsplash.com/photo-1606980707095-6d04ae5c4e5f?w=500&h=500&fit=crop",
    rating: 4.9,
    category: "Cameras",
    discount: 21
  };

  const flashDeals = [
    {
      id: 24,
      name: "Samsung 980 Pro 2TB",
      price: 189,
      originalPrice: 299,
      image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&h=500&fit=crop",
      rating: 4.8,
      category: "Storage",
      discount: 37
    },
    {
      id: 25,
      name: "LG UltraGear 27\"",
      price: 399,
      originalPrice: 599,
      image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&h=500&fit=crop",
      rating: 4.7,
      category: "Monitors",
      discount: 33
    },
    {
      id: 26,
      name: "Logitech MX Master 3S",
      price: 79,
      originalPrice: 99,
      image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop",
      rating: 4.9,
      category: "Accessories",
      discount: 20
    },
    {
      id: 27,
      name: "Razer BlackWidow V4",
      price: 149,
      originalPrice: 229,
      image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&h=500&fit=crop",
      rating: 4.6,
      category: "Keyboards",
      discount: 35
    }
  ];

  const TimerBox = ({ value, label }: { value: number; label: string }) => (
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
      className="glassmorphism p-2 sm:p-3 md:p-4 rounded-lg min-w-[60px] sm:min-w-[70px] md:min-w-[80px]"
    >
      <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-0.5 sm:mb-1">
        {value.toString().padStart(2, '0')}
      </div>
      <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
    </motion.div>
  );

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-destructive/5 via-background to-primary/5 relative">
      <motion.div
        animate={{ 
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-0 w-48 h-48 sm:w-96 sm:h-96 bg-destructive/10 rounded-full blur-3xl"
      />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Deal of the Day */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 sm:mb-16 md:mb-20"
        >
          <div className="text-center mb-8 sm:mb-12">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              className="inline-block"
            >
              <Badge className="mb-3 sm:mb-4 bg-destructive text-destructive-foreground px-4 py-1.5 sm:px-6 sm:py-2 text-sm sm:text-base">
                <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Deal of the Day
              </Badge>
            </motion.div>
            <h2 className="text-elegant text-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4">Lightning Deal</h2>
            
            <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 mt-6 sm:mt-8">
              <TimerBox value={timeLeft.hours} label="Hours" />
              <div className="text-2xl sm:text-3xl md:text-4xl text-muted-foreground self-center">:</div>
              <TimerBox value={timeLeft.minutes} label="Minutes" />
              <div className="text-2xl sm:text-3xl md:text-4xl text-muted-foreground self-center">:</div>
              <TimerBox value={timeLeft.seconds} label="Seconds" />
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto glassmorphism rounded-lg p-4 sm:p-6 md:p-8 gradient-border"
          >
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-destructive/20 to-primary/20 rounded-lg blur-xl"
                />
                <img
                  src={dealOfTheDay.image}
                  alt={dealOfTheDay.name}
                  className="w-full h-auto rounded-lg relative z-10"
                />
                <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground text-lg px-4 py-2">
                  -{dealOfTheDay.discount}%
                </Badge>
              </div>
              <div>
                <Badge variant="secondary" className="mb-3 sm:mb-4 text-xs sm:text-sm">{dealOfTheDay.category}</Badge>
                <h3 className="text-elegant text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4">{dealOfTheDay.name}</h3>
                <div className="flex items-baseline gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">${dealOfTheDay.price}</span>
                  <span className="text-lg sm:text-xl md:text-2xl text-muted-foreground line-through">${dealOfTheDay.originalPrice}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-gradient-to-r from-destructive to-primary text-white py-3 sm:py-4 rounded-lg text-elegant text-sm sm:text-base shadow-glow hover:shadow-lift transition-all duration-300"
                >
                  Claim This Deal
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Flash Deals Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-8 sm:mb-10 md:mb-12">
            <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
            <h3 className="text-elegant text-xl sm:text-2xl md:text-3xl">More Flash Deals</h3>
            <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-primary animate-pulse" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {flashDeals.map((deal, index) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <Badge className="absolute top-4 left-4 z-10 bg-destructive text-destructive-foreground">
                  -{deal.discount}%
                </Badge>
                <ProductCard {...deal} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FlashDeals;
