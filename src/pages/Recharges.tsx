import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Grid3x3, List, SlidersHorizontal, ShoppingCart } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import all recharge images
import recharge1_67 from "@/assets/recharges/1.67$.png";
import recharge3_79 from "@/assets/recharges/3.79$.png";
import recharge4_50 from "@/assets/recharges/4.50$.png";
import recharge7_58 from "@/assets/recharges/7.58$.png";
import recharge10 from "@/assets/recharges/10$.png";
import recharge15_15 from "@/assets/recharges/15.15$.png";
import recharge22_73 from "@/assets/recharges/22.73$.png";
import recharge77_28 from "@/assets/recharges/77.28$.png";
import rechargeStart4_50 from "@/assets/recharges/start4.50$.png";
import rechargeSmart7_50 from "@/assets/recharges/smart7.50$.png";
import rechargeSuper13_50 from "@/assets/recharges/super13.50$.png";

// Import days recharge images
import recharge30days from "@/assets/recharges/days/30days.png";
import recharge60days from "@/assets/recharges/days/60days.png";
import recharge90days from "@/assets/recharges/days/90days.png";
import recharge180days from "@/assets/recharges/days/180days.png";
import recharge360days from "@/assets/recharges/days/360days.png";

// Types
interface RechargeCard {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface FilterState {
  categories: string[];
  priceRange: number[];
  selectedPriceRanges: string[];
  sortBy: string;
}

type ViewMode = "grid" | "list";

// Data
const RECHARGE_CARDS: RechargeCard[] = [
  {
    id: 1,
    name: "Touch $1.67 Card",
    price: 1.67,
    image: recharge1_67,
    category: "Touch Cards"
  },
  {
    id: 2,
    name: "Touch $3.79 Card",
    price: 3.79,
    image: recharge3_79,
    category: "Touch Cards"
  },
  {
    id: 3,
    name: "Touch $4.50 Card",
    price: 4.50,
    image: recharge4_50,
    category: "Touch Cards"
  },
  {
    id: 4,
    name: "Touch Start $4.50 Card",
    price: 4.50,
    image: rechargeStart4_50,
    category: "Touch Cards"
  },
  {
    id: 5,
    name: "Touch $7.58 Card",
    price: 7.58,
    image: recharge7_58,
    category: "Touch Cards"
  },
  {
    id: 6,
    name: "Touch Smart $7.50 Card",
    price: 7.50,
    image: rechargeSmart7_50,
    category: "Touch Cards"
  },
  {
    id: 7,
    name: "Touch $10 Card",
    price: 10,
    image: recharge10,
    category: "Touch Cards"
  },
  {
    id: 8,
    name: "Touch Super $13.50 Card",
    price: 13.50,
    image: rechargeSuper13_50,
    category: "Touch Cards"
  },
  {
    id: 9,
    name: "Touch $15.15 Card",
    price: 15.15,
    image: recharge15_15,
    category: "Touch Cards"
  },
  {
    id: 10,
    name: "Touch $22.73 Card",
    price: 22.73,
    image: recharge22_73,
    category: "Touch Cards"
  },
  {
    id: 11,
    name: "Touch $77.28 Card",
    price: 77.28,
    image: recharge77_28,
    category: "Touch Cards"
  },

  // Days Cards
  {
    id: 12,
    name: "30 Days Card",
    price: 2.8,
    image: recharge30days,
    category: "Days Cards"
  },
  {
    id: 13,
    name: "60 Days Card",
    price: 5.6,
    image: recharge60days,
    category: "Days Cards"
  },
  {
    id: 14,
    name: "90 Days Card",
    price: 8.4,
    image: recharge90days,
    category: "Days Cards"
  },
  {
    id: 15,
    name: "180 Days Card",
    price: 16.8,
    image: recharge180days,
    category: "Days Cards"
  },
  {
    id: 16,
    name: "360 Days Card",
    price: 33.6,
    image: recharge360days,
    category: "Days Cards"
  },
];

const CATEGORIES = ["Touch Cards", "Days Cards"];
const PRICE_RANGES = [
  { label: "$0-$10", min: 0, max: 10 },
  { label: "$10-$20", min: 10, max: 20 },
  { label: "$20-$50", min: 20, max: 50 },
  { label: "$50+", min: 50, max: Infinity },
];

const SORT_OPTIONS = [
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
];

// Custom hooks
const useFilters = () => {
  const [filters, setFilters] = useState<FilterState>({
    categories: CATEGORIES,
    priceRange: [0, 100],
    selectedPriceRanges: [],
    sortBy: "price-low"
  });

  const updateFilters = (updates: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const clearAllFilters = () => {
    setFilters({
      categories: CATEGORIES,
      priceRange: [0, 100],
      selectedPriceRanges: [],
      sortBy: "price-low"
    });
  };

  return { filters, updateFilters, clearAllFilters };
};

const useFilteredCards = (cards: RechargeCard[], filters: FilterState) => {
  return useMemo(() => {
    let filtered = [...cards];

    // Filter by categories
    filtered = filtered.filter(card => 
      filters.categories.includes(card.category)
    );

    // Filter by price range slider
    filtered = filtered.filter(card => 
      card.price >= filters.priceRange[0] && card.price <= filters.priceRange[1]
    );

    // Filter by selected price ranges
    if (filters.selectedPriceRanges.length > 0) {
      filtered = filtered.filter(card => {
        return filters.selectedPriceRanges.some(rangeLabel => {
          const range = PRICE_RANGES.find(r => r.label === rangeLabel);
          if (!range) return false;
          return card.price >= range.min && 
                 (range.max === Infinity ? true : card.price <= range.max);
        });
      });
    }

    // Sort cards
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [cards, filters]);
};

// Components
interface FilterSidebarProps {
  filters: FilterState;
  onUpdateFilters: (updates: Partial<FilterState>) => void;
  onClearFilters: () => void;
}

const FilterSidebar = ({ filters, onUpdateFilters, onClearFilters }: FilterSidebarProps) => {
  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter(c => c !== category);
    onUpdateFilters({ categories: newCategories });
  };

  const handlePriceRangeChange = (rangeLabel: string, checked: boolean) => {
    const newRanges = checked
      ? [...filters.selectedPriceRanges, rangeLabel]
      : filters.selectedPriceRanges.filter(r => r !== rangeLabel);
    onUpdateFilters({ selectedPriceRanges: newRanges });
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="lg:col-span-1"
    >
      <div className="sticky top-24 space-y-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-elegant text-lg">Filters</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-elegant text-xs"
            onClick={onClearFilters}
          >
            Clear All
          </Button>
        </div>

        {/* Category */}
        <div>
          <h3 className="text-elegant text-sm mb-4">Category</h3>
          <div className="space-y-3">
            {CATEGORIES.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox 
                  id={category} 
                  checked={filters.categories.includes(category)}
                  onCheckedChange={(checked) => 
                    handleCategoryChange(category, checked as boolean)
                  }
                />
                <Label
                  htmlFor={category}
                  className="text-sm font-light cursor-pointer"
                >
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range Slider */}
        <div>
          <h3 className="text-elegant text-sm mb-4">Price Range</h3>
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => onUpdateFilters({ priceRange: value })}
            max={100}
            step={5}
            className="mb-4"
          />
          <div className="flex items-center justify-between text-sm">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}</span>
          </div>
        </div>

        {/* Quick Price Filters */}
        <div>
          <h3 className="text-elegant text-sm mb-4">Quick Filters</h3>
          <div className="space-y-3">
            {PRICE_RANGES.map((range) => (
              <div key={range.label} className="flex items-center space-x-2">
                <Checkbox 
                  id={range.label}
                  checked={filters.selectedPriceRanges.includes(range.label)}
                  onCheckedChange={(checked) => 
                    handlePriceRangeChange(range.label, checked as boolean)
                  }
                />
                <Label
                  htmlFor={range.label}
                  className="text-sm font-light cursor-pointer"
                >
                  {range.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

interface ControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  totalCount: number;
}

const Controls = ({ viewMode, onViewModeChange, sortBy, onSortChange, totalCount }: ControlsProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <p className="text-sm text-muted-foreground">
        Showing {totalCount} recharge cards
      </p>
      <div className="flex items-center gap-4">
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[180px] text-elegant text-xs">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => onViewModeChange("grid")}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => onViewModeChange("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

interface RechargeCardProps extends RechargeCard {
  viewMode: ViewMode;
}

const RechargeCard = ({ id, name, price, image, category, viewMode }: RechargeCardProps) => {
  const navigate = useNavigate();
  
  const handleBuyNow = () => {
    // Navigate to checkout with all product details
    const params = new URLSearchParams({
      id: id.toString(),
      name: name,
      price: price.toString(),
      image: image,
      category: category
    });
    navigate(`/checkout?${params.toString()}`);
  };

  return (
    <motion.div
      whileHover={{ y: -12 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="group relative bg-white rounded-sm overflow-hidden border border-border hover:border-primary/40 transition-all duration-500 shadow-card hover:shadow-elegant"
    >
      <div className={`overflow-hidden bg-white relative border-b border-border ${
        viewMode === "grid" ? "aspect-[4/3]" : "aspect-[16/9]"
      }`}>
        <motion.img
          src={image}
          alt={name}
          className="h-full w-full object-contain p-4 transition-transform duration-700 group-hover:scale-110"
        />
      </div>
      <div className="p-4">
        <motion.p 
          initial={{ opacity: 0.7 }}
          whileHover={{ opacity: 1 }}
          className="text-elegant text-[10px] text-primary mb-1"
        >
          {category}
        </motion.p>
        <h3 className="text-elegant text-xs mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {name}
        </h3>
        <p className="text-elegant text-sm font-normal bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          ${price.toFixed(2)}
        </p>
        
        <Button 
          size="sm" 
          className="w-full mt-3 text-elegant"
          variant="outline"
          onClick={handleBuyNow}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Buy Now
        </Button>
      </div>
    </motion.div>
  );
};

// Main Component
const Recharges = () => {
  const { filters, updateFilters, clearAllFilters } = useFilters();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const filteredCards = useFilteredCards(RECHARGE_CARDS, filters);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return (
    <div className="min-h-screen bg-white no-horizontal-scroll overflow-x-hidden">
      <Header />

      <div className="container mx-auto px-6 py-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-elegant text-4xl mb-4"
        >
          Touch Cards
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground mb-12"
        >
          Premium recharge cards for your mobile needs
        </motion.p>

        <div className="grid lg:grid-cols-4 gap-8">
          <FilterSidebar 
            filters={filters}
            onUpdateFilters={updateFilters}
            onClearFilters={clearAllFilters}
          />

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3"
          >
            <Controls
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortBy={filters.sortBy}
              onSortChange={(sort) => updateFilters({ sortBy: sort })}
              totalCount={filteredCards.length}
            />

            {/* Recharge Cards */}
            <div className={`grid gap-6 ${
              viewMode === "grid" 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                : "grid-cols-1"
            }`}>
              {filteredCards.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <RechargeCard {...card} viewMode={viewMode} />
                </motion.div>
              ))}
            </div>

            {/* No Results */}
            {filteredCards.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-muted-foreground text-lg">
                  No recharge cards found matching your filters.
                </p>
                <Button 
                  variant="outline" 
                  onClick={clearAllFilters}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </motion.div>
            )}

            {/* Promotional Banner */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 bg-gradient-to-r from-primary to-accent text-white rounded-sm p-8 text-center"
            >
              <p className="text-elegant text-xl mb-2">⚡ Instant Delivery</p>
              <p className="text-sm font-light mb-4">Get your recharge codes instantly via email</p>
              <Button variant="outline" className="bg-white text-primary hover:bg-white/90 border-white">
                Learn More
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Recharges;