import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from '@studio-freight/lenis';

interface SmoothScrollWrapperProps {
    children: React.ReactNode;
}

const SmoothScrollWrapper = ({ children }: SmoothScrollWrapperProps) => {
    const lenisRef = useRef<Lenis | null>(null);
    const rafRef = useRef<number | null>(null);
    const location = useLocation();

    useEffect(() => {
        // Initialize Lenis with performance-optimized settings
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
        };
    }, []);

    // Handle route changes
    useEffect(() => {
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
    }, [location.pathname]);

    return <>{children}</>;
};

export default SmoothScrollWrapper;
