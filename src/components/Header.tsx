import { Search, Heart, ShoppingCart, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState, useRef, useMemo } from "react";
import AnnouncementBar from "./AnnouncementBar";
import { useFavorites } from "@/context/FavoritesContext";
import { useCart } from "@/context/CartContext";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "./ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { phoneAccessories, wearablesProducts, smartphoneProducts } from "@/data/products";

const Header = () => {
  const { favorites } = useFavorites();
  const { getTotalItems, toggleCart } = useCart();
  const { scrollY } = useScroll();
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const lastScrollY = useRef(0);

  // Get all products for search
  const allProducts = useMemo(() => [...phoneAccessories, ...wearablesProducts, ...smartphoneProducts], []);

  // Filter products based on search query (case-insensitive)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    // Normalize query to lowercase for case-insensitive search
    const normalizedQuery = searchQuery.toLowerCase().trim();
    // Split query into words for better matching
    const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 0);
    
    return allProducts.filter((product) => {
      // Normalize all product fields to lowercase for case-insensitive comparison
      const normalizedName = product.name.toLowerCase();
      const normalizedTitle = product.title.toLowerCase();
      const normalizedCategory = product.category.toLowerCase();
      const normalizedDescription = product.description.toLowerCase();
      
      // Create a comprehensive searchable text (all normalized to lowercase)
      const searchableText = `${normalizedName} ${normalizedTitle} ${normalizedCategory} ${normalizedDescription}`;
      
      // Check if all query words are present in any of the searchable fields
      const allWordsMatch = queryWords.length > 0 && queryWords.every(word => 
        normalizedName.includes(word) ||
        normalizedTitle.includes(word) ||
        normalizedCategory.includes(word) ||
        normalizedDescription.includes(word) ||
        searchableText.includes(word)
      );
      
      // Also check for exact phrase match (normalized)
      const exactPhraseMatch = normalizedName.includes(normalizedQuery) ||
                               normalizedTitle.includes(normalizedQuery) ||
                               normalizedCategory.includes(normalizedQuery) ||
                               normalizedDescription.includes(normalizedQuery) ||
                               searchableText.includes(normalizedQuery);
      
      return allWordsMatch || exactPhraseMatch;
    }).slice(0, 10); // Limit to 10 results
  }, [searchQuery, allProducts]);

  const handleSearchClick = () => {
    setSearchOpen(true);
  };

  const handleProductClick = (productId: number) => {
    setSearchOpen(false);
    setSearchQuery("");
    navigate(`/product/${productId}`);
  };

  // Optimized scroll handler with throttling using requestAnimationFrame
  useMotionValueEvent(scrollY, "change", (latest) => {
    const currentScroll = latest;
    const previousScroll = lastScrollY.current;
    
    // Only trigger if scroll difference is significant (prevents jitter)
    if (Math.abs(currentScroll - previousScroll) < 10) {
      return;
    }
    
    // Use requestAnimationFrame for smooth updates
    requestAnimationFrame(() => {
      lastScrollY.current = currentScroll;
      
      // At the top - always show navbar
      if (currentScroll <= 10) {
        setHidden(false);
        return;
      }
      
      // Determine scroll direction
      if (currentScroll > previousScroll) {
        // Scrolling down - hide navbar
        setHidden(true);
      } else if (currentScroll < previousScroll) {
        // Scrolling up - show navbar
        setHidden(false);
      }
    });
  });
  return (
    <>
      <AnnouncementBar />
      <motion.header
        initial={{ y: -100 }}
        animate={{ 
          y: hidden ? -100 : 0 
        }}
        transition={{ 
          duration: 0.3, 
          ease: "easeInOut" 
        }}
        className="sticky top-0 z-50 border-b border-border/50 glassmorphism shadow-card"
      >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <motion.div
              className="relative flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src="/LOGO.png"
                alt="KHA_MOBILE Logo"
                className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 object-contain filter drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300"
                loading="eager"
                onError={(e) => {
                  // Fallback to text-only if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </motion.div>
            <span className="text-elegant text-base sm:text-xl font-light tracking-widest relative">
              KHA_MOBILE
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-500"></span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link
              to="/"
              className="text-elegant text-xs hover:text-primary transition-all duration-300 relative group"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/products"
              className="text-elegant text-xs hover:text-primary transition-all duration-300 relative group"
            >
              Products
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/recharges"
              className="text-elegant text-xs hover:text-primary transition-all duration-300 relative group"
            >
              Recharges
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/gift-cards"
              className="text-elegant text-xs hover:text-primary transition-all duration-300 relative group"
            >
              Gift Cards
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <a
              href="#services"
              className="text-elegant text-xs hover:text-primary transition-all duration-300 relative group"
            >
              Services
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </a>
            <a
              href="#offers"
              className="text-elegant text-xs hover:text-primary transition-all duration-300 relative group"
            >
              Offers
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </a>
            <a
              href="#contact"
              className="text-elegant text-xs hover:text-primary transition-all duration-300 relative group"
            >
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </a>
          </nav>

          {/* Icons & Mobile Menu */}
          <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="hover:text-primary transition-all duration-300"
                >
                  <Menu className="h-5 w-5" />
                </motion.button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <div className="flex flex-col h-full">
                  <div className="mb-8">
                    <h2 className="text-elegant text-xl mb-6">Menu</h2>
                    <nav className="flex flex-col gap-4">
                      <SheetClose asChild>
                        <Link
                          to="/"
                          className="text-elegant text-sm hover:text-primary transition-all duration-300 py-2 border-b border-border/50"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Home
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          to="/products"
                          className="text-elegant text-sm hover:text-primary transition-all duration-300 py-2 border-b border-border/50"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Products
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          to="/recharges"
                          className="text-elegant text-sm hover:text-primary transition-all duration-300 py-2 border-b border-border/50"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Recharges
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          to="/gift-cards"
                          className="text-elegant text-sm hover:text-primary transition-all duration-300 py-2 border-b border-border/50"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Gift Cards
                        </Link>
                      </SheetClose>
                      <a
                        href="#services"
                        className="text-elegant text-sm hover:text-primary transition-all duration-300 py-2 border-b border-border/50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Services
                      </a>
                      <a
                        href="#offers"
                        className="text-elegant text-sm hover:text-primary transition-all duration-300 py-2 border-b border-border/50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Offers
                      </a>
                      <a
                        href="#contact"
                        className="text-elegant text-sm hover:text-primary transition-all duration-300 py-2 border-b border-border/50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Contact
                      </a>
                    </nav>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Search Button - Functional */}
            <motion.button 
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.95 }}
              onClick={handleSearchClick}
              className="hover:text-primary transition-all duration-300"
              aria-label="Search products"
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </motion.button>
            <Link to="/favorites">
              <motion.button 
                whileHover={{ scale: 1.1 }} 
                whileTap={{ scale: 0.95 }}
                className="hover:text-accent transition-all duration-300 relative"
              >
                <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${favorites.length > 0 ? "fill-accent text-accent" : ""}`} />
                {favorites.length > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full bg-gradient-to-r from-accent to-primary text-white text-[10px] sm:text-xs flex items-center justify-center shadow-glow"
                  >
                    {favorites.length}
                  </motion.span>
                )}
              </motion.button>
            </Link>
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              onClick={toggleCart}
              className="hover:text-primary transition-all duration-300 relative"
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              {getTotalItems() > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full bg-gradient-to-r from-primary to-accent text-white text-[10px] sm:text-xs flex items-center justify-center shadow-glow"
                >
                  {getTotalItems()}
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>

    {/* Search Dialog */}
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-elegant text-xl sm:text-2xl">Search Products</DialogTitle>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for products (e.g., powerbank, headphones, charger)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 h-12 text-base"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {searchQuery.trim() === "" ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">
                Start typing to search for products...
              </p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">No products found</p>
              <p className="text-sm text-muted-foreground/70">
                Try searching for "powerbank", "headphones", "charger", etc.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-3">
                Found {searchResults.length} {searchResults.length === 1 ? "result" : "results"}
              </p>
              {searchResults.map((product) => (
                <motion.button
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  className="w-full flex items-center gap-4 p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 text-left group"
                  whileHover={{ x: 4 }}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded overflow-hidden border border-border bg-white">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-medium text-elegant group-hover:text-primary transition-colors truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {product.category}
                    </p>
                    <p className="text-sm font-semibold text-primary mt-1">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                </motion.button>
              ))}
              {searchResults.length > 0 && (
                <Link
                  to={`/products?search=${encodeURIComponent(searchQuery)}`}
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="block mt-4 pt-4 border-t border-border"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2 px-4 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    View All Results →
                  </motion.button>
                </Link>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default Header;
