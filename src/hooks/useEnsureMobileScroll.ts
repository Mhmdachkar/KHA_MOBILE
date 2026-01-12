import { useEffect } from 'react';

/**
 * Hook to ensure mobile scrolling always works
 * This prevents scroll-lock bugs from modals, dialogs, or other components
 */
export const useEnsureMobileScroll = () => {
  useEffect(() => {
    // Only run on mobile devices
    const isMobile = window.innerWidth < 768 || 
                     /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobile) return;

    const ensureScrollWorks = () => {
      // Remove any fixed positioning that might lock scroll
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

      // Ensure body and html can scroll
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
      
      // Remove Lenis stopped class
      document.documentElement.classList.remove('lenis-stopped');
    };

    // Run immediately
    ensureScrollWorks();

    // Run on a small delay to catch any delayed locks
    const timeoutId = setTimeout(ensureScrollWorks, 100);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);
};
