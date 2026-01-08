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
        // Skip Lenis on mobile devices to prevent scroll freezing issues
        if (isMobile) {
            return;
        }

        // Initialize Lenis with performance-optimized settings (desktop only)
        const lenis = new Lenis({
            duration: 0.7, // Faster for snappier feel with less lag
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.9, // Balanced responsiveness
            touchMultiplier: 1.5,
            infinite: false,
            lerp: 0.15, // Slightly higher for smoother motion without lag
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

    // Handle route changes
    useEffect(() => {
        // For mobile, just use native scroll to top
        if (isMobile) {
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            return;
        }

        const lenis = lenisRef.current;
        if (!lenis) return;

        // Stop, scroll to top, then restart
        lenis.stop();
        requestAnimationFrame(() => {
            lenis.scrollTo(0, { immediate: true, force: true });
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;

            requestAnimationFrame(() => {
                lenis.start();
            });
        });
    }, [location.pathname, isMobile]);

    return <>{children}</>;
};

export default SmoothScrollWrapper;
