import { motion } from "framer-motion";
import { Gift, Heart, Briefcase, PartyPopper, GraduationCap, Baby } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { useState } from "react";

const GiftFinder = () => {
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);

  const budgets = [
    { label: "Under $100", value: "100", gradient: "from-green-500 to-emerald-600" },
    { label: "$100 - $300", value: "300", gradient: "from-blue-500 to-cyan-600" },
    { label: "$300 - $500", value: "500", gradient: "from-purple-500 to-pink-600" },
    { label: "$500+", value: "500+", gradient: "from-orange-500 to-red-600" }
  ];

  const occasions = [
    { icon: Heart, label: "Anniversary", color: "text-red-500" },
    { icon: Briefcase, label: "Graduation", color: "text-blue-500" },
    { icon: PartyPopper, label: "Birthday", color: "text-purple-500" },
    { icon: GraduationCap, label: "Back to School", color: "text-green-500" },
    { icon: Baby, label: "New Baby", color: "text-pink-500" },
    { icon: Gift, label: "Just Because", color: "text-orange-500" }
  ];

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
      />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-4"
          >
            <Gift className="h-12 w-12 text-primary mx-auto" />
          </motion.div>
          <h2 className="text-elegant text-4xl mb-4">Perfect Gift Finder</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto font-light">
            Let us help you find the perfect gift for any occasion and budget
          </p>
        </motion.div>

        {/* Budget Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h3 className="text-elegant text-2xl mb-6 text-center">Select Your Budget</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {budgets.map((budget, index) => (
              <motion.div
                key={budget.value}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-300 hover:shadow-glow ${
                    selectedBudget === budget.value 
                      ? 'ring-2 ring-primary shadow-elegant' 
                      : 'hover:scale-105'
                  }`}
                  onClick={() => setSelectedBudget(budget.value)}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`text-2xl font-bold bg-gradient-to-r ${budget.gradient} bg-clip-text text-transparent mb-2`}>
                      {budget.label}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Occasion Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h3 className="text-elegant text-2xl mb-6 text-center">Choose the Occasion</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
            {occasions.map((occasion, index) => (
              <motion.div
                key={occasion.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-300 hover:shadow-elegant ${
                    selectedOccasion === occasion.label 
                      ? 'ring-2 ring-primary shadow-glow' 
                      : 'hover:scale-105'
                  }`}
                  onClick={() => setSelectedOccasion(occasion.label)}
                >
                  <CardContent className="p-6 text-center">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.5 }}
                      className="mb-3"
                    >
                      <occasion.icon className={`h-8 w-8 mx-auto ${occasion.color}`} />
                    </motion.div>
                    <p className="text-sm font-medium">{occasion.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Find Gifts Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="lg" 
              className="px-12 py-6 text-lg shadow-glow hover:shadow-lift"
              disabled={!selectedBudget || !selectedOccasion}
            >
              <Gift className="h-5 w-5 mr-2" />
              Find Perfect Gifts
            </Button>
          </motion.div>
          {(!selectedBudget || !selectedOccasion) && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground mt-4"
            >
              Please select both budget and occasion to continue
            </motion.p>
          )}
        </motion.div>

        {/* Quick Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-16 glassmorphism rounded-lg p-8"
        >
          <h4 className="text-elegant text-xl mb-6 text-center">Popular Gift Categories</h4>
          <div className="flex flex-wrap justify-center gap-3">
            {["Tech Gadgets", "Gaming", "Audio", "Wearables", "Smart Home", "Photography", "Fitness", "Accessories"].map((category, index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 + index * 0.05 }}
              >
                <Badge 
                  variant="secondary" 
                  className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-sm"
                >
                  {category}
                </Badge>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GiftFinder;
