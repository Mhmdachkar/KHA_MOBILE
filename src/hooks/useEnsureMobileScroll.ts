import { useEffect } from 'react';

/**
 * Hook to ensure mobile scrolling always works
 * This prevents scroll-lock bugs from modals, dialogs, or other components
 * NOTE: This hook respects the cart's scroll lock when cart is open
 */
export const useEnsureMobileScroll = () => {
  useEffect(() => {
    // Only run on mobile devices
    const isMobile = window.innerWidth < 768 || 
                     /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobile) return;

    const ensureScrollWorks = () => {
      // Check if cart is open by looking for cart-specific attributes
      const cartOpen = document.body.style.position === 'fixed' && 
                      document.documentElement.classList.contains('lenis-stopped');
      
      // Don't interfere if cart is intentionally locking scroll
      if (cartOpen) {
        return;
      }

      // Remove any unintended fixed positioning that might lock scroll
      if (document.body.style.position === 'fixed') {
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        
        // Restore scroll position if it was saved
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
      }

      // Ensure body and html can scroll (unless cart is open)
      if (!document.documentElement.classList.contains('lenis-stopped')) {
        document.body.style.overflow = '';
        document.body.style.height = '';
        document.documentElement.style.overflow = '';
        document.documentElement.style.height = '';
      }
    };

    // Run immediately
    ensureScrollWorks();

    // Run on a small delay to catch any delayed locks
    const timeoutId = setTimeout(ensureScrollWorks, 100);

    // Also check periodically to catch any scroll locks that happen after mount
    const intervalId = setInterval(() => {
      ensureScrollWorks();
    }, 500);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);
};
