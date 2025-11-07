import { motion } from "framer-motion";
import { Shield, Headphones, Award, RefreshCw, Truck, CreditCard } from "lucide-react";
import { Card, CardContent } from "./ui/card";

const WhyShopWithUs = () => {
  const features = [
    {
      icon: Shield,
      title: "Price Match Guarantee",
      description: "Found it cheaper elsewhere? We'll match the price and beat it by 5%.",
      color: "text-primary"
    },
    {
      icon: Headphones,
      title: "Expert Support 24/7",
      description: "Our tech experts are available round the clock to assist you.",
      color: "text-accent"
    },
    {
      icon: Award,
      title: "Authorized Retailer",
      description: "Official partner with all major brands. 100% authentic products.",
      color: "text-primary"
    },
    {
      icon: RefreshCw,
      title: "Extended Warranty",
      description: "Comprehensive warranty coverage up to 3 years on all products.",
      color: "text-accent"
    },
    {
      icon: Truck,
      title: "Free Express Shipping",
      description: "Free next-day delivery on orders over $50. Track in real-time.",
      color: "text-primary"
    },
    {
      icon: CreditCard,
      title: "Secure Payments",
      description: "Bank-level encryption and multiple payment options for your safety.",
      color: "text-accent"
    }
  ];

  return (
    <section className="py-24 bg-secondary relative">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.1 }}
        viewport={{ once: true }}
        className="absolute inset-0 bg-gradient-to-br from-primary via-transparent to-accent"
      />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-elegant text-4xl mb-4">Why Shop With Us</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto font-light">
            Experience premium service, unbeatable prices, and complete peace of mind
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group hover:shadow-elegant transition-all duration-500 h-full glassmorphism border-primary/20 hover:border-primary/40">
                <CardContent className="p-8">
                  <motion.div
                    whileHover={{ 
                      rotate: [0, -10, 10, -10, 0],
                      scale: 1.1
                    }}
                    transition={{ duration: 0.5 }}
                    className={`${feature.color} mb-6 inline-block`}
                  >
                    <feature.icon className="h-12 w-12" />
                  </motion.div>
                  <h3 className="text-elegant text-xl mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground font-light leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-16 glassmorphism rounded-lg p-8 text-center gradient-border"
        >
          <div className="flex flex-wrap justify-center items-center gap-12">
            {["Apple", "Samsung", "Sony", "LG", "Dell", "HP"].map((brand, index) => (
              <motion.div
                key={brand}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                className="text-2xl font-bold text-muted-foreground/50 hover:text-primary transition-colors cursor-pointer"
              >
                {brand}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyShopWithUs;
