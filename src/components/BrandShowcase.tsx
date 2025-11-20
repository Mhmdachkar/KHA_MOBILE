import { motion } from "framer-motion";
import { Store, TrendingUp, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { phoneAccessories } from "@/data/products";
import { greenLionProducts } from "@/data/greenLionProducts";

// Import brand logos
import appleLogo from "@/assets/logo's/apple logo.png";
import fonengLogo from "@/assets/logo's/foneng logo.jpg";
import greenLionLogo from "@/assets/logo's/green lion logo.jpg";
import hocoLogo from "@/assets/logo's/hoco logo.webp";
import samsungLogo from "@/assets/logo's/samsung logo.avif";

interface Brand {
  name: string;
  logo?: string;
  icon?: string;
  productCount: number;
}

const BrandShowcase = () => {
  const navigate = useNavigate();

  // Helper function to extract brand from product name
  const extractBrand = (productName: string): string | null => {
    const brandPatterns = [
      { pattern: /^Green Lion\s+/i, name: "Green Lion" },
      { pattern: /^Apple\s+/i, name: "Apple" },
      { pattern: /^Samsung\s+/i, name: "Samsung" },
      { pattern: /^Hoco\s+/i, name: "Hoco" },
      { pattern: /^Dobe\s+/i, name: "Dobe" },
      { pattern: /^Foneng\s+/i, name: "Foneng" },
      { pattern: /^Borofone\s+/i, name: "BOROFONE" },
      { pattern: /^JBL\s+/i, name: "JBL" },
      { pattern: /^Kakusiga\s+/i, name: "Kakusiga" },
    ];
    
    for (const { pattern, name } of brandPatterns) {
      if (pattern.test(productName)) {
        return name;
      }
    }
    return null;
  };

  // Get all products and extract brands
  const allProducts = [
    ...phoneAccessories.map(p => ({
      ...p,
      brand: p.brand || extractBrand(p.name) || "Other",
      images: [p.image],
    })),
    ...greenLionProducts.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.images[0],
      images: p.images,
      rating: p.rating,
      category: p.category,
      brand: p.brand,
    })),
  ];

  // Brand logo mapping
  const brandLogos: Record<string, string> = {
    "Green Lion": greenLionLogo,
    "Apple": appleLogo,
    "Samsung": samsungLogo,
    "Hoco": hocoLogo,
    "Foneng": fonengLogo,
  };

  // Brands to exclude (those with 1-2 products and no logo)
  const excludedBrands = ["Dobe", "Kakusiga", "JBL", "BOROFONE"];

  // Get unique brands with product counts and logos
  const brands: Brand[] = Array.from(
    new Set(allProducts.map(p => p.brand))
  )
    .filter(brand => brand && brand !== "Other" && !excludedBrands.includes(brand))
    .filter(brand => brandLogos[brand!]) // Only include brands that have logos
    .map(brand => ({
      name: brand!,
      logo: brandLogos[brand!],
      productCount: allProducts.filter(p => p.brand === brand).length,
    }))
    .sort((a, b) => {
      // Sort: Green Lion first, then by product count (high to low)
      if (a.name === "Green Lion") return -1;
      if (b.name === "Green Lion") return 1;
      return b.productCount - a.productCount;
    });

  // Handle brand click - navigate directly to products page with brand filter
  const handleBrandClick = (brandName: string) => {
    navigate(`/products?brand=${encodeURIComponent(brandName)}`);
  };

  // Brand icons/colors (fallback if no logo)
  const getBrandColor = (brandName: string) => {
    const colors: Record<string, string> = {
      "Green Lion": "from-green-500 to-emerald-600",
      "Apple": "from-gray-800 to-gray-900",
      "Samsung": "from-blue-500 to-blue-700",
      "Hoco": "from-orange-500 to-red-600",
      "Dobe": "from-purple-500 to-indigo-600",
      "Foneng": "from-teal-500 to-cyan-600",
      "BOROFONE": "from-pink-500 to-rose-600",
      "JBL": "from-red-500 to-orange-600",
      "Kakusiga": "from-yellow-500 to-amber-600",
    };
    return colors[brandName] || "from-primary to-accent";
  };

  return (
    <>
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-background via-secondary/20 to-background relative overflow-visible" style={{ overflowX: 'hidden', overflowY: 'visible' }}>
        {/* Background Decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="absolute inset-0 bg-grid-pattern opacity-[0.02]"
        />
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10 overflow-visible" style={{ overflowX: 'hidden', overflowY: 'visible' }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="inline-block mb-4"
            >
              <Store className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto" />
            </motion.div>
            <h2 className="text-elegant text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-4">
              Shop by Brand
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto font-light px-4">
              Explore products from your favorite brands. Click on any brand to discover their complete collection.
            </p>
          </motion.div>

          {/* Brand Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8"
          >
            {brands.map((brand, index) => (
              <motion.button
                key={brand.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleBrandClick(brand.name)}
                className="group relative bg-white rounded-sm border-2 border-border hover:border-primary/60 transition-all duration-300 p-6 sm:p-8 flex flex-col items-center justify-center gap-3 sm:gap-4 shadow-card hover:shadow-elegant overflow-hidden"
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${getBrandColor(brand.name)} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Brand Logo */}
                <div className="relative z-10 flex flex-col items-center justify-center gap-3 sm:gap-4 w-full">
                  {brand.logo ? (
                    <>
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 flex items-center justify-center">
                        <motion.img
                          src={brand.logo}
                          alt={brand.name}
                          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                      {/* Brand Name */}
                      <h3 className="text-elegant text-sm sm:text-base md:text-lg font-semibold group-hover:text-primary transition-colors duration-300 text-center">
                        {brand.name}
                      </h3>
                    </>
                  ) : (
                    <h3 className="text-elegant text-lg sm:text-xl md:text-2xl font-semibold group-hover:text-primary transition-colors duration-300">
                      {brand.name}
                    </h3>
                  )}
                  
                  {/* Product Count */}
                  <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{brand.productCount} {brand.productCount === 1 ? 'Product' : 'Products'}</span>
                  </div>
                </div>

                {/* Arrow Icon - Appears on Hover */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10">
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>

                {/* Hover Effect Indicator */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default BrandShowcase;
