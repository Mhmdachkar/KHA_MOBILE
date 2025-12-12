import { Search, Heart, ShoppingCart, Menu, MessageSquarePlus, Send, Phone, Package, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState, useRef, useMemo, useEffect } from "react";
import AnnouncementBar from "./AnnouncementBar";
import { useFavorites } from "@/context/FavoritesContext";
import { useCart } from "@/context/CartContext";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "./ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import { phoneAccessories, wearablesProducts, smartphoneProducts, tabletProducts, iphoneCases, gamingConsoles } from "@/data/products";
import { greenLionProducts } from "@/data/greenLionProducts";

const Header = () => {
  const { favorites } = useFavorites();
  const { getTotalItems, toggleCart } = useCart();
  const { scrollY } = useScroll();
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    productName: "",
    description: "",
    quantity: "1",
    budget: "",
    phoneNumber: "",
  });
  const [requestErrors, setRequestErrors] = useState({
    productName: "",
    phoneNumber: "",
  });
  const lastScrollY = useRef(0);
  const { toast } = useToast();

  // Get all products for search
  const allProducts = useMemo(() => {
    // Combine all regular products
    const regularProducts = [
      ...phoneAccessories,
      ...wearablesProducts,
      ...smartphoneProducts,
      ...tabletProducts,
      ...iphoneCases,
      ...gamingConsoles,
    ];
    
    // Map Green Lion products to match Product interface structure
    const mappedGreenLionProducts = greenLionProducts.map(p => ({
      id: p.id,
      name: p.name,
      title: p.title,
      price: p.price,
      image: p.images[0],
      images: p.images,
      rating: p.rating,
      category: p.category,
      brand: p.brand,
      description: p.description,
      features: p.features || [],
      specifications: p.specifications || [],
      variants: p.variants,
      colors: p.colors,
      connectivityOptions: p.connectivityOptions,
      isPreorder: p.isPreorder,
    }));
    
    return [...regularProducts, ...mappedGreenLionProducts];
  }, []);

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

  // Request Product Form Handlers
  const validatePhoneNumber = (phone: string): boolean => {
    const digitsOnly = phone.replace(/\D/g, "");
    let phoneToCheck = digitsOnly;
    
    if (phoneToCheck.startsWith("961")) {
      phoneToCheck = phoneToCheck.substring(3);
    }
    
    if (phoneToCheck.length !== 8) {
      setRequestErrors(prev => ({
        ...prev,
        phoneNumber: "Lebanese phone numbers must be 8 digits"
      }));
      return false;
    }
    
    const validPrefixes = ["03", "70", "71", "76", "78", "79", "81", "01", "04", "05", "06", "07", "08", "09"];
    const prefix = phoneToCheck.substring(0, 2);
    
    if (!validPrefixes.includes(prefix)) {
      setRequestErrors(prev => ({
        ...prev,
        phoneNumber: "Please enter a valid Lebanese phone number"
      }));
      return false;
    }
    
    setRequestErrors(prev => ({ ...prev, phoneNumber: "" }));
    return true;
  };

  const formatPhoneNumber = (value: string): string => {
    const digitsOnly = value.replace(/\D/g, "");
    
    if (digitsOnly.startsWith("961")) {
      const localNumber = digitsOnly.substring(3);
      if (localNumber.length === 0) return "+961 ";
      if (localNumber.length <= 2) return `+961 ${localNumber}`;
      if (localNumber.length <= 5) return `+961 ${localNumber.substring(0, 2)} ${localNumber.substring(2)}`;
      return `+961 ${localNumber.substring(0, 2)} ${localNumber.substring(2, 5)} ${localNumber.substring(5)}`;
    }
    
    if (digitsOnly.length === 0) return "";
    if (digitsOnly.length <= 2) return digitsOnly;
    if (digitsOnly.length <= 5) return `${digitsOnly.substring(0, 2)} ${digitsOnly.substring(2)}`;
    return `${digitsOnly.substring(0, 2)} ${digitsOnly.substring(2, 5)} ${digitsOnly.substring(5)}`;
  };

  const handleRequestFormChange = (field: string, value: string) => {
    if (field === "phoneNumber") {
      value = formatPhoneNumber(value);
    }
    setRequestForm(prev => ({ ...prev, [field]: value }));
    
    if (field === "productName" && value.trim()) {
      setRequestErrors(prev => ({ ...prev, productName: "" }));
    }
    if (field === "phoneNumber" && value) {
      validatePhoneNumber(value);
    }
  };

  const handleSubmitRequest = () => {
    // Validate
    let isValid = true;
    
    if (!requestForm.productName.trim()) {
      setRequestErrors(prev => ({
        ...prev,
        productName: "Please describe what you're looking for"
      }));
      isValid = false;
    }
    
    if (!requestForm.phoneNumber || !validatePhoneNumber(requestForm.phoneNumber)) {
      isValid = false;
    }
    
    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return;
    }

    // Prepare WhatsApp message
    let message = `*🛍️ New Product Request*\n\n`;
    message += `• *Product/Item Needed:* ${requestForm.productName}\n`;
    
    if (requestForm.description.trim()) {
      message += `• *Details:* ${requestForm.description}\n`;
    }
    
    if (requestForm.quantity && requestForm.quantity !== "1") {
      message += `• *Quantity:* ${requestForm.quantity}\n`;
    }
    
    if (requestForm.budget.trim()) {
      message += `• *Budget:* $${requestForm.budget}\n`;
    }
    
    message += `• *Contact Number:* ${requestForm.phoneNumber}\n`;
    message += `\n_Customer is requesting this product. Please check availability and respond._`;

    // Encode and send via WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = "96176982454"; // WhatsApp business number for receiving orders
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");

    // Show success message
    toast({
      title: "Request Sent! 📱",
      description: "We'll get back to you shortly with availability and pricing.",
    });

    // Reset form and close dialog
    setRequestForm({
      productName: "",
      description: "",
      quantity: "1",
      budget: "",
      phoneNumber: "",
    });
    setRequestErrors({ productName: "", phoneNumber: "" });
    setRequestDialogOpen(false);
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
      <div className="container mx-auto px-4 sm:px-6 max-w-full overflow-hidden">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2 md:gap-3 group flex-shrink-0 min-w-0">
            <motion.div
              className="relative flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src="/LOGO.png"
                alt="KHA_MOBILE Logo"
                className="h-7 w-7 sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-12 lg:w-12 object-contain filter drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300"
                loading="eager"
                onError={(e) => {
                  // Fallback to text-only if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </motion.div>
            <span className="text-elegant text-xs sm:text-sm md:text-base lg:text-xl font-light tracking-wider sm:tracking-widest relative truncate">
              KHA_MOBILE
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-500"></span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 2xl:gap-8 flex-shrink-0">
            <Link
              to="/"
              className="text-elegant text-[10px] xl:text-xs hover:text-primary transition-all duration-300 relative group whitespace-nowrap"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/products"
              className="text-elegant text-[10px] xl:text-xs hover:text-primary transition-all duration-300 relative group whitespace-nowrap"
            >
              Products
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/recharges"
              className="text-elegant text-[10px] xl:text-xs hover:text-primary transition-all duration-300 relative group whitespace-nowrap"
            >
              Recharges
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/gift-cards"
              className="text-elegant text-[10px] xl:text-xs hover:text-primary transition-all duration-300 relative group whitespace-nowrap"
            >
              Gift Cards
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/services"
              className="text-elegant text-[10px] xl:text-xs hover:text-primary transition-all duration-300 relative group whitespace-nowrap"
            >
              Services
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/about"
              className="text-elegant text-[10px] xl:text-xs hover:text-primary transition-all duration-300 relative group whitespace-nowrap"
            >
              About Us
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
          </nav>

          {/* Icons & Mobile Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 flex-shrink-0">
            {/* Request Product Button - NEW */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setRequestDialogOpen(true);
              }}
              className="relative group"
              aria-label="Request a product"
              title="Request a Product"
            >
              <div className="relative">
                <MessageSquarePlus className="h-4 w-4 sm:h-5 sm:w-5 text-foreground hover:text-primary transition-all duration-300" />
                <motion.div
                  className="absolute -top-1 -right-1 h-2 w-2 bg-gradient-to-r from-primary to-accent rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.button>

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
                      <SheetClose asChild>
                        <Link
                          to="/services"
                          className="text-elegant text-sm hover:text-primary transition-all duration-300 py-2 border-b border-border/50"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Services
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          to="/about"
                          className="text-elegant text-sm hover:text-primary transition-all duration-300 py-2 border-b border-border/50"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          About Us
                        </Link>
                      </SheetClose>
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

    {/* Request Product Dialog */}
    <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
      <DialogContent 
        className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto viewport-centered-dialog"
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
              className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center"
            >
              <Package className="h-6 w-6 text-primary" />
            </motion.div>
            <div>
              <DialogTitle className="text-elegant text-xl sm:text-2xl">
                Request a Product
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm mt-1">
                Can't find what you need? Let us know and we'll source it for you!
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-primary/20 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <MessageSquarePlus className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-elegant mb-1">
                  How It Works
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Describe the product you're looking for, and we'll check our suppliers and get back to you with availability and pricing within 24 hours.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Product Name - Required */}
          <div>
            <Label htmlFor="productName" className="text-sm font-medium flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-primary" />
              What are you looking for?
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="productName"
              placeholder="e.g., iPhone 15 Pro Max, Samsung Galaxy Buds..."
              value={requestForm.productName}
              onChange={(e) => handleRequestFormChange("productName", e.target.value)}
              className={`${requestErrors.productName ? "border-red-500" : ""}`}
            />
            {requestErrors.productName && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 mt-1"
              >
                {requestErrors.productName}
              </motion.p>
            )}
            <p className="text-xs text-muted-foreground mt-1.5">
              Be as specific as possible (brand, model, color, storage, etc.)
            </p>
          </div>

          {/* Description - Optional */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium mb-2 block">
              Additional Details (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Any specific requirements, preferences, or features you're looking for..."
              value={requestForm.description}
              onChange={(e) => handleRequestFormChange("description", e.target.value)}
              className="min-h-[80px] resize-y"
            />
          </div>

          {/* Quantity and Budget - Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity" className="text-sm font-medium mb-2 block">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="1"
                value={requestForm.quantity}
                onChange={(e) => handleRequestFormChange("quantity", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="budget" className="text-sm font-medium mb-2 block">
                Budget (Optional)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="budget"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={requestForm.budget}
                  onChange={(e) => handleRequestFormChange("budget", e.target.value)}
                  className="pl-7"
                />
              </div>
            </div>
          </div>

          {/* Phone Number - Required */}
          <div>
            <Label htmlFor="requestPhone" className="text-sm font-medium flex items-center gap-2 mb-2">
              <Phone className="h-4 w-4 text-primary" />
              Your Phone Number
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="requestPhone"
              type="tel"
              placeholder="+961 70 123 456"
              value={requestForm.phoneNumber}
              onChange={(e) => handleRequestFormChange("phoneNumber", e.target.value)}
              className={`${requestErrors.phoneNumber ? "border-red-500" : ""}`}
            />
            {requestErrors.phoneNumber && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 mt-1"
              >
                {requestErrors.phoneNumber}
              </motion.p>
            )}
            <p className="text-xs text-muted-foreground mt-1.5">
              We'll contact you via WhatsApp with availability and pricing
            </p>
          </div>

          {/* Submit Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleSubmitRequest}
              className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#25D366] text-white py-6 text-base font-medium shadow-lg"
              disabled={!requestForm.productName.trim() || !requestForm.phoneNumber}
            >
              <Send className="mr-2 h-5 w-5" />
              Send Request via WhatsApp
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <div className="pt-3 border-t border-border space-y-2">
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <div className="h-4 w-4 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-2 w-2 rounded-full bg-green-500"
                />
              </div>
              <p>Fast Response: We typically reply within 1-2 hours</p>
            </div>
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <p>No Obligation: Just inquiring, no commitment required</p>
            </div>
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <div className="h-4 w-4 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="h-2 w-2 rounded-full bg-accent" />
              </div>
              <p>Competitive Pricing: We find the best deals for you</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default Header;
