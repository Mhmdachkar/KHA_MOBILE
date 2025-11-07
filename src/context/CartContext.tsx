import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  rating?: number;
  category?: string;
  quantity: number;
}

interface CartContextType {
  cart: CartProduct[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
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

  const addToCart = (product: CartProduct) => {
    setCart((prev) => {
      // Check if product already exists
      const existingProduct = prev.find((item) => item.id === product.id);
      
      if (existingProduct) {
        // Update quantity if product exists
        return prev.map((item) =>
          item.id === product.id
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

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity } : item
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
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
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

