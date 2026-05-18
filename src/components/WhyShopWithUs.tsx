import { motion } from "framer-motion";
import { Shield, Headphones, Award, CreditCard } from "lucide-react";

const WhyShopWithUs = () => {
  const pillars = [
    {
      icon: Award,
      title: "100% Authentic",
      subtitle: "Authorized retailer — all major brands",
    },
    {
      icon: Shield,
      title: "Price Match",
      subtitle: "We beat any verified lower price",
    },
    {
      icon: Headphones,
      title: "Expert Support",
      subtitle: "Available 7 days a week",
    },
    {
      icon: CreditCard,
      title: "Secure Checkout",
      subtitle: "Bank-level encrypted payments",
    },
  ];

  return (
    <section className="py-10 sm:py-12 bg-secondary border-y border-border/40 w-full overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 max-w-full">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8"
        >
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.35 }}
              className="flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left"
            >
              <div className="shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center">
                <p.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold leading-snug">{p.title}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 leading-snug">{p.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyShopWithUs;
