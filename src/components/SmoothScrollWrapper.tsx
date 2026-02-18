import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from '@studio-freight/lenis';

interface SmoothScrollWrapperProps {
    children: React.ReactNode;
}

// Detect if device is mobile/touch device
const isMobileDevice = (): boolean => {
    if (typeof window === 'undefined') return false;
    
    // Check for touch capability
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Check screen width (mobile typically < 768px)
    const isSmallScreen = window.innerWidth < 768;
    
    // Check user agent for mobile devices
    const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
    
    // Consider it mobile if it has touch AND (small screen OR mobile user agent)
    return hasTouch && (isSmallScreen || mobileUserAgent);
};

const SmoothScrollWrapper = ({ children }: SmoothScrollWrapperProps) => {
    const lenisRef = useRef<Lenis | null>(null);
    const rafRef = useRef<number | null>(null);
    const location = useLocation();
    const [isMobile, setIsMobile] = useState(false);

    // Check for mobile on mount and window resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(isMobileDevice());
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        // CRITICAL: Skip Lenis entirely on mobile devices - use native scrolling
        if (isMobile) {
            // Ensure native mobile scrolling is properly configured
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            document.documentElement.style.touchAction = '';
            document.body.style.touchAction = '';
            
            // Remove any Lenis classes that might interfere
            document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped');
            document.body.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped');
            
            return; // Exit early - no Lenis initialization on mobile
        }

        // Initialize Lenis with performance-optimized settings (desktop only)
        const lenis = new Lenis({
            duration: 0.7,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.9,
            touchMultiplier: 1.5,
            infinite: false,
            lerp: 0.15,
        });

        lenisRef.current = lenis;

        // Optimized RAF loop to prevent frame drops
        let lastTime = 0;
        const targetFPS = 60;
        const frameInterval = 1000 / targetFPS;

        function raf(currentTime: number) {
            const elapsed = currentTime - lastTime;

            // Only update if enough time has passed to maintain 60 FPS
            if (elapsed >= frameInterval) {
                lenis.raf(currentTime);
                lastTime = currentTime - (elapsed % frameInterval);
            }

            rafRef.current = requestAnimationFrame(raf);
        }

        rafRef.current = requestAnimationFrame(raf);

        // Cleanup
        return () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
            }
            lenis.destroy();
            lenisRef.current = null;
        };
    }, [isMobile]);

    // Handle route changes - ensure Lenis restarts reliably to prevent scroll freeze
    useEffect(() => {
        // For mobile, just use native scroll to top
        if (isMobile) {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            return;
        }

        const lenis = lenisRef.current;
        if (!lenis) return;

        // Stop, scroll to top, then restart - use multiple rAF for reliability
        lenis.stop();
        let frame2Id: number | null = null;
        const frame1Id = requestAnimationFrame(() => {
            lenis.scrollTo(0, { immediate: true, force: true });
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;

            // Ensure Lenis restarts - double rAF handles async timing
            frame2Id = requestAnimationFrame(() => {
                if (lenisRef.current === lenis) {
                    lenis.start();
                }
            });
        });

        return () => {
            cancelAnimationFrame(frame1Id);
            if (frame2Id !== null) cancelAnimationFrame(frame2Id);
        };
    }, [location.pathname, isMobile]);

    return <>{children}</>;
};

export default SmoothScrollWrapper;
