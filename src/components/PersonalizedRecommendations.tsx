import { motion } from "framer-motion";
import { Battery, Smartphone, Zap, Gamepad2, Headphones } from "lucide-react";
import ProductCard from "./ProductCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { getProductsByCategory } from "@/data/products";

const PersonalizedRecommendations = () => {
  // Get products by category
  const chargingProducts = getProductsByCategory("Charging");
  const gamingProducts = getProductsByCategory("Gaming");
  const accessoriesProducts = getProductsByCategory("Accessories");
  const audioProducts = getProductsByCategory("Audio");

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-background relative">
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute top-10 right-10 sm:top-20 sm:right-20 w-48 h-48 sm:w-96 sm:h-96 bg-primary/5 rounded-full blur-3xl"
      />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-block mb-3 sm:mb-4"
          >
            <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto" />
          </motion.div>
          <h2 className="text-elegant text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-4">Tech Essentials</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto font-light px-4">
            Complete your setup with essential accessories. High-quality cables, cases, protection, and chargers.
          </p>
        </motion.div>

        <Tabs defaultValue="chargers" className="w-full">
          <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-2 sm:grid-cols-4 mb-6 sm:mb-8 md:mb-12 h-auto">
            <TabsTrigger value="chargers" className="text-elegant text-xs sm:text-sm py-2 sm:py-3">
              <Battery className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Charging</span>
              <span className="sm:hidden">Charge</span>
            </TabsTrigger>
            <TabsTrigger value="audio" className="text-elegant text-xs sm:text-sm py-2 sm:py-3">
              <Headphones className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="gaming" className="text-elegant text-xs sm:text-sm py-2 sm:py-3">
              <Gamepad2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Gaming
            </TabsTrigger>
            <TabsTrigger value="accessories" className="text-elegant text-xs sm:text-sm py-2 sm:py-3">
              <Smartphone className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Accessories</span>
              <span className="sm:hidden">Acc</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chargers">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
            >
              {chargingProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard {...product} />
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="audio">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
            >
              {audioProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard {...product} />
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="gaming">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
            >
              {gamingProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard {...product} />
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="accessories">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
            >
              {accessoriesProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard {...product} />
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default PersonalizedRecommendations;
