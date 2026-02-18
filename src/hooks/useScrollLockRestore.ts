import { useEffect, useCallback } from 'react';

/**
 * Restores scroll capability when Radix UI components (Select, Dialog, Sheet) or
 * navigation leave behind orphaned scroll locks.
 *
 * PROBLEM: Radix components apply body scroll lock (overflow: hidden, data-scroll-locked)
 * when opening. This lock can persist after:
 * - User navigates away while a Select/Dialog is open
 * - Component unmounts before cleanup runs
 * - Rapid open/close interactions
 *
 * SOLUTION: On route change and periodically, clean up orphaned scroll locks while
 * respecting the cart's intentional scroll lock when it's open.
 */
export const useScrollLockRestore = (pathname: string) => {
  const restoreScroll = useCallback(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return;

    // Don't interfere if cart is intentionally locking scroll (cart uses position:fixed + lenis-stopped)
    const cartIsOpen =
      document.body.style.position === 'fixed' &&
      document.documentElement.classList.contains('lenis-stopped');
    if (cartIsOpen) return;

    // Don't remove scroll lock if a modal/dialog/select is actually open
    const hasOpenModal =
      document.querySelector('[data-radix-dialog-content][data-state="open"]') ||
      document.querySelector('[data-radix-select-content][data-state="open"]') ||
      document.querySelector('[data-vaul-drawer-wrapper]');

    // 1. Remove Radix UI scroll lock only when no modal is open (orphaned lock)
    if (!hasOpenModal && document.body.hasAttribute('data-scroll-locked')) {
      document.body.removeAttribute('data-scroll-locked');
      document.body.style.overflow = '';
      document.body.style.marginRight = '';
      document.body.style.paddingRight = '';
    }

    // 2. Restore body from any orphaned fixed positioning (not from cart)
    if (
      document.body.style.position === 'fixed' &&
      !document.documentElement.classList.contains('lenis-stopped')
    ) {
      const savedScrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.overflow = '';

      if (savedScrollY) {
        const scrollY = parseInt(savedScrollY.replace(/[^0-9-]/g, '') || '0', 10);
        window.scrollTo(0, Math.abs(scrollY));
      }
    }

    // 3. Remove lenis-stopped from html if cart is closed (stale state)
    if (!cartIsOpen && document.documentElement.classList.contains('lenis-stopped')) {
      document.documentElement.classList.remove('lenis-stopped');
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
    }

    // 4. Ensure html can scroll when no modal is open (hasOpenModal already checked above)
    if (!hasOpenModal) {
      if (
        document.documentElement.style.overflow === 'hidden' &&
        !document.documentElement.classList.contains('lenis-stopped')
      ) {
        document.documentElement.style.overflow = '';
        document.documentElement.style.height = '';
      }
    }
  }, []);

  // Run on every route change - critical for fixing scroll after navigation
  useEffect(() => {
    restoreScroll();

    // Delayed restore to catch async cleanup race conditions (Radix may cleanup after our effect)
    const timeout1 = setTimeout(restoreScroll, 50);
    const timeout2 = setTimeout(restoreScroll, 150);
    const timeout3 = setTimeout(restoreScroll, 400);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  }, [pathname, restoreScroll]);

  // Safety net: periodically check for orphaned scroll locks when Select/Dialog closes
  useEffect(() => {
    const intervalId = setInterval(restoreScroll, 1000);
    return () => clearInterval(intervalId);
  }, [restoreScroll]);
};
