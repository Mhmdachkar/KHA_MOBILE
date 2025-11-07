import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { CartProvider } from "@/context/CartContext";
import CartDashboard from "@/components/CartDashboard";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Recharges from "./pages/Recharges";
import GiftCards from "./pages/GiftCards";
import StreamingServices from "./pages/StreamingServices";
import StreamingServiceDetail from "./pages/StreamingServiceDetail";
import Accessories from "./pages/Accessories";
import CategoryPage from "./pages/CategoryPage";
import Checkout from "./pages/Checkout";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";

// ScrollToTop component to scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Immediately scroll to top on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior
    });
    
    // Also scroll document elements for better compatibility
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Fallback: ensure scroll after a brief delay (for slow renders)
    const timeoutId = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' as ScrollBehavior
      });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <FavoritesProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <CartDashboard />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/category/:categoryName" element={<CategoryPage />} />
                <Route path="/smartphones" element={<CategoryPage />} />
                <Route path="/audio" element={<CategoryPage />} />
                <Route path="/computers" element={<CategoryPage />} />
                <Route path="/wearables" element={<CategoryPage />} />
                <Route path="/gaming" element={<CategoryPage />} />
                <Route path="/recharges" element={<Recharges />} />
                <Route path="/gift-cards" element={<GiftCards />} />
                <Route path="/streaming-services" element={<StreamingServices />} />
                <Route path="/streaming-service/:id" element={<StreamingServiceDetail />} />
                <Route path="/accessories" element={<Accessories />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
          </TooltipProvider>
        </BrowserRouter>
      </CartProvider>
    </FavoritesProvider>
  </QueryClientProvider>
);

export default App;
