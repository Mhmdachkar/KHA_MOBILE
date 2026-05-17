import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Grid3x3, List, SlidersHorizontal, ShoppingCart, X } from "lucide-react";
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

import { RECHARGE_CATALOG, type RechargeCardItem } from "@/data/rechargeCatalog";
import { formatMoney } from "@/lib/storefrontPricing";

type RechargeCard = RechargeCardItem;

interface FilterState {
  categories: string[];
  priceRange: number[];
  selectedPriceRanges: string[];
  sortBy: string;
}

type ViewMode = "grid" | "list";

const RECHARGE_CARDS: RechargeCard[] = RECHARGE_CATALOG;

const CATEGORIES = ["Touch Cards", "Days Cards", "Alfa Cards", "Alfa Gift"];
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
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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

  const FilterContent = () => (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-elegant text-base sm:text-lg">Filters</h2>
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
        <h3 className="text-elegant text-xs sm:text-sm mb-3 sm:mb-4">Category</h3>
        <div className="space-y-2 sm:space-y-3">
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
                className="text-xs sm:text-sm font-light cursor-pointer"
                >
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range Slider */}
        <div>
        <h3 className="text-elegant text-xs sm:text-sm mb-3 sm:mb-4">Price Range</h3>
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => onUpdateFilters({ priceRange: value })}
            max={100}
            step={5}
          className="mb-3 sm:mb-4"
          />
        <div className="flex items-center justify-between text-xs sm:text-sm">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}</span>
          </div>
        </div>

        {/* Quick Price Filters */}
        <div>
        <h3 className="text-elegant text-xs sm:text-sm mb-3 sm:mb-4">Quick Filters</h3>
        <div className="space-y-2 sm:space-y-3">
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
                className="text-xs sm:text-sm font-light cursor-pointer"
                >
                  {range.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => setIsMobileOpen(true)}
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Mobile Filter Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-[280px] sm:w-[320px] bg-white z-50 overflow-y-auto lg:hidden shadow-2xl"
              style={{ touchAction: 'pan-y' }}
            >
              <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between z-10">
                <h2 className="text-elegant text-lg font-semibold">Filters</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4">
                <FilterContent />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Filter Sidebar */}
      <motion.aside
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="hidden lg:block lg:col-span-1"
      >
        <div className="sticky top-24">
          <FilterContent />
      </div>
    </motion.aside>
    </>
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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
      <p className="text-xs sm:text-sm text-muted-foreground">
        Showing {totalCount} recharge cards
      </p>
      <div className="flex items-center gap-2 sm:gap-4">
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-full sm:w-[160px] md:w-[180px] text-elegant text-xs h-9 sm:h-10">
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
        <div className="flex gap-1 sm:gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            className="h-9 w-9 sm:h-10 sm:w-10"
            onClick={() => onViewModeChange("grid")}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            className="h-9 w-9 sm:h-10 sm:w-10"
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
      <div className={`overflow-hidden bg-white relative border-b border-border ${viewMode === "grid" ? "aspect-[4/3]" : "aspect-[16/9]"
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
          {formatMoney(price)}
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
    <div className="min-h-screen bg-white w-full">
      <Header />

      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-elegant text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3 md:mb-4"
        >
          Touch Cards
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xs sm:text-sm md:text-base text-muted-foreground mb-4 sm:mb-6 md:mb-8"
        >
          Premium recharge cards for your mobile needs
        </motion.p>

        <div className="grid lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
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
            <div className={`grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 ${viewMode === "grid"
              ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
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
              className="mt-8 sm:mt-10 md:mt-12 bg-gradient-to-r from-primary to-accent text-white rounded-sm p-4 sm:p-6 md:p-8 text-center"
            >
              <p className="text-elegant text-lg sm:text-xl mb-2">⚡ Instant Delivery</p>
              <p className="text-xs sm:text-sm font-light mb-3 sm:mb-4">Get your recharge codes instantly via email</p>
              <Button variant="outline" className="bg-white text-primary hover:bg-white/90 border-white text-xs sm:text-sm">
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
