import { useEffect, useRef, ReactNode } from 'react';
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
        // Initialize Lenis with optimized settings for performance
        const lenis = new Lenis({
            duration: 0.8, // Reduced from 1.2 for snappier response
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Apple-style easing
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.8, // Reduced for finer control
            touchMultiplier: 1.5,
            infinite: false,
            lerp: 0.12, // Slightly increased from 0.1 for smoother motion
        });

        lenisRef.current = lenis;

        // Optimized RAF loop with performance checks
        let lastTime = 0;
        const targetFPS = 60;
        const targetFrameTime = 1000 / targetFPS;

        function raf(time: number) {
            const deltaTime = time - lastTime;

            // Skip frame if running too fast (> 60 FPS)
            if (deltaTime >= targetFrameTime) {
                lenis.raf(time);
                lastTime = time;
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

    // Scroll to top on route change using Lenis with immediate flag
    useEffect(() => {
        if (lenisRef.current) {
            // Use Lenis scrollTo for smooth integration with immediate flag
            lenisRef.current.scrollTo(0, { immediate: true, lock: true });
        }
        // Also directly set scroll position for immediate effect
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, [location.pathname]);

    return <>{children}</>;
};

export default SmoothScrollWrapper;
