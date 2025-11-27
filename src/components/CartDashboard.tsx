import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

const CartDashboard = () => {
  const { cart, isOpen, closeCart, removeFromCart, updateQuantity, getTotalItems, getTotalPrice } = useCart();
  const cartItemsContainerRef = useRef<HTMLDivElement>(null);
  
  // Lock body scroll when cart is open
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (isOpen) {
        // Save the current scroll position
        const scrollY = window.scrollY;
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%";
        document.body.style.overflow = "hidden";
      } else {
        // Restore scroll position
        const scrollY = document.body.style.top;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || "0") * -1);
        }
      }
    }
  }, [isOpen]);

  // Scroll cart items container to top when cart opens or when items change
  useEffect(() => {
    if (isOpen) {
      // Reset scroll position immediately
      const resetScroll = () => {
        if (cartItemsContainerRef.current) {
          cartItemsContainerRef.current.scrollTop = 0;
        }
        // Also reset document elements as fallback
        if (typeof document !== "undefined") {
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }
      };

      // Immediate reset
      resetScroll();

      // Reset after DOM update
      requestAnimationFrame(() => {
        resetScroll();
        // Double-check after a frame
        requestAnimationFrame(() => {
          resetScroll();
        });
      });

      // Reset after animation completes (spring animation takes ~300-400ms)
      const timeoutIds: NodeJS.Timeout[] = [];
      timeoutIds.push(setTimeout(resetScroll, 100));
      timeoutIds.push(setTimeout(resetScroll, 200));
      timeoutIds.push(setTimeout(resetScroll, 350));
      timeoutIds.push(setTimeout(resetScroll, 500));

      return () => {
        timeoutIds.forEach(id => clearTimeout(id));
      };
    } else {
      // Reset scroll when cart closes to ensure fresh start next time
      if (cartItemsContainerRef.current) {
        cartItemsContainerRef.current.scrollTop = 0;
      }
    }
  }, [isOpen, cart.length]); // Also trigger when cart items change

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const cartVariants = {
    hidden: { x: "100%" },
    visible: { x: 0 },
  };

  if (cart.length === 0) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={closeCart}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            />

            {/* Cart Dashboard */}
            <motion.div
              variants={cartVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onAnimationComplete={() => {
                // Ensure scroll is reset after animation completes
                if (cartItemsContainerRef.current) {
                  cartItemsContainerRef.current.scrollTop = 0;
                }
              }}
              className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white shadow-2xl z-[9999] overflow-hidden flex flex-col"
            >
              {/* Header - Fixed at top */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border flex-shrink-0">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold text-elegant">Shopping Cart</h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeCart}
                  className="h-8 w-8 rounded-full border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>

              {/* Empty State */}
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8"
                >
                  <ShoppingBag className="h-24 w-24 text-primary/20 mx-auto" />
                </motion.div>
                <h3 className="text-2xl font-bold text-elegant mb-4">Your cart is empty</h3>
                <p className="text-muted-foreground mb-8 max-w-sm">
                  Start adding products to your cart and they'll appear here
                </p>
                <Button onClick={closeCart} className="text-elegant">
                  Continue Shopping
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={closeCart}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
          />

          {/* Cart Dashboard */}
          <motion.div
            variants={cartVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onAnimationComplete={() => {
              // Ensure scroll is reset after animation completes
              if (cartItemsContainerRef.current) {
                cartItemsContainerRef.current.scrollTop = 0;
              }
            }}
            className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white shadow-2xl z-[9999] overflow-hidden flex flex-col"
          >
            {/* Header - Fixed at top */}
            <div className="flex items-center justify-between p-2.5 sm:p-3 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <div>
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-elegant">Shopping Cart</h2>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{getTotalItems()} items</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeCart}
                className="h-6 w-6 sm:h-7 sm:w-7 rounded-full border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 flex items-center justify-center"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </motion.button>
            </div>

            {/* Cart Items - Scrollable area */}
            <div 
              ref={cartItemsContainerRef}
              className="overflow-y-auto p-3 sm:p-4 scrollbar-thin"
              style={{ 
                WebkitOverflowScrolling: 'touch',
                overflowAnchor: 'none',
                maxHeight: 'calc(100vh - 375px)', // Even more space reserved - checkout button pushed further downward
                flex: '1 1 auto'
              }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="space-y-3 sm:space-y-4"
              >
                {cart.map((item, index) => {
                  // Use color image if available, otherwise use regular image
                  const displayImage = item.colorImage || item.image;
                  const uniqueKey = `${item.id}-${item.variantKey || "base"}-${item.color || "no-color"}`;
                  
                  return (
                  <motion.div
                      key={uniqueKey}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-3 p-3 sm:p-4 border border-border rounded-lg hover:border-primary/40 transition-all duration-300 bg-white"
                  >
                      {/* Product Image - Shows color-specific image if available */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-white border border-border flex-shrink-0">
                      <img
                          src={displayImage}
                        alt={item.name}
                          className="w-full h-full object-contain p-1"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-medium text-elegant line-clamp-2 mb-1">
                        {item.name}
                      </h3>
                        {item.variantLabel && (
                          <p className="text-[10px] sm:text-xs text-primary/80 mb-1">
                            {item.variantLabel}
                          </p>
                        )}
                        {item.color && (
                          <p className="text-[10px] sm:text-xs text-accent/80 mb-1 font-medium">
                            Color: {item.color}
                          </p>
                        )}
                      {item.category && (
                        <p className="text-xs text-muted-foreground mb-1">{item.category}</p>
                      )}
                      <p className="text-base sm:text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                          onClick={() => removeFromCart(item.id, item.variantKey, item.color)}
                        className="h-6 w-6 rounded-full hover:bg-destructive hover:text-destructive-foreground transition-all duration-300 flex items-center justify-center"
                      >
                        <Trash2 className="h-3 w-3" />
                      </motion.button>
                      
                      <div className="flex items-center gap-2 border border-border rounded-lg">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.variantKey, item.color)}
                          className="h-8 w-8 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                        >
                          <Minus className="h-3 w-3" />
                        </motion.button>
                        
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.variantKey, item.color)}
                          className="h-8 w-8 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                        >
                          <Plus className="h-3 w-3" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                  );
                })}
              </motion.div>
            </div>

            {/* Footer - Always visible at bottom, fixed */}
            <div className="border-t border-border bg-gradient-to-r from-primary/5 to-accent/5 flex-shrink-0 shadow-lg">
              <div className="p-5 sm:p-6">
                {/* Summary */}
                <div className="space-y-2.5 sm:space-y-3 mb-5">
                  <div className="flex items-center justify-between text-base sm:text-lg">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-base sm:text-lg">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="font-medium">$4.00</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex items-center justify-between text-lg sm:text-xl font-bold">
                    <span className="text-elegant">Total</span>
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      ${(getTotalPrice() + 4.00).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={closeCart}
                    variant="outline"
                    className="w-full text-elegant text-base sm:text-lg py-3 h-12"
                  >
                    Continue Shopping
                  </Button>
                  <Link to="/checkout" onClick={closeCart} className="block">
                    <Button className="w-full text-elegant bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-base sm:text-lg py-3 h-12">
                      Proceed to Checkout
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDashboard;

