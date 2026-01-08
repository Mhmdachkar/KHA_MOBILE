import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartProduct {
  id: number;
  name: string;
  price: number | string;
  image: string;
  rating?: number;
  category?: string;
  quantity: number;
  variantKey?: string;
  variantLabel?: string;
  color?: string;
  colorImage?: string;
  size?: string;
  sizePrice?: number;
  isPreorder?: boolean;
}

interface CartContextType {
  cart: CartProduct[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (id: number, variantKey?: string, color?: string, size?: string) => void;
  updateQuantity: (id: number, quantity: number, variantKey?: string, color?: string, size?: string) => void;
  clearCart: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// localStorage key for cart - device-specific storage
const CART_STORAGE_KEY = "kha_mobile_cart";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartProduct[]>(() => {
    // Load from localStorage on mount - device-specific storage
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
    }
    return [];
  });
  
  const [isOpen, setIsOpen] = useState(false);

  // Save to localStorage whenever cart changes - persists across page refreshes on the same device
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      }
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
      // If localStorage is full or disabled, we continue without saving
      // The cart will still work in the current session
    }
  }, [cart]);

  const isSameCartItem = (item: CartProduct, id: number, variantKey?: string, color?: string, size?: string) => {
    const normalizedVariant = variantKey || "";
    const normalizedColor = color || "";
    const normalizedSize = size || "";
    return item.id === id && 
           (item.variantKey || "") === normalizedVariant && 
           (item.color || "") === normalizedColor &&
           (item.size || "") === normalizedSize;
  };

  const addToCart = (product: CartProduct) => {
    setCart((prev) => {
      // Check if product already exists (same id, variant, color, and size)
      const existingProduct = prev.find((item) => 
        isSameCartItem(item, product.id, product.variantKey, product.color, product.size)
      );
      
      if (existingProduct) {
        // Update quantity if product exists
        return prev.map((item) =>
          isSameCartItem(item, product.id, product.variantKey, product.color, product.size)
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        );
      }
      
      // Add new product to cart
      return [...prev, product];
    });
    
    // Open cart dashboard when item is added
    setIsOpen(true);
  };

  const removeFromCart = (id: number, variantKey?: string, color?: string, size?: string) => {
    setCart((prev) => prev.filter((item) => !isSameCartItem(item, id, variantKey, color, size)));
  };

  const updateQuantity = (id: number, quantity: number, variantKey?: string, color?: string, size?: string) => {
    if (quantity <= 0) {
      removeFromCart(id, variantKey, color, size);
      return;
    }
    
    setCart((prev) =>
      prev.map((item) =>
        isSameCartItem(item, id, variantKey, color, size) ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const price = typeof item.price === 'string' ? parseFloat(item.price) || 0 : item.price;
      return total + price * item.quantity;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

