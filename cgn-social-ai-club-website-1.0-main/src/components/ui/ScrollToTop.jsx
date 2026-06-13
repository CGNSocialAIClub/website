import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

let activeScrollAnimation = null;

function animateScrollTo(targetY, duration = 900, easing = 'easeInOutCubic') {
    if (activeScrollAnimation !== null) {
        cancelAnimationFrame(activeScrollAnimation);
        activeScrollAnimation = null;
    }

    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();

    // Slow start, faster middle, slow end.
    const easeInOutCubic = (t) => (t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const linear = (t) => t;
    const easingFn = easing === 'linear' ? linear : easeInOutCubic;

    const step = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easingFn(progress);
        window.scrollTo(0, startY + distance * eased);

        if (progress < 1) {
            activeScrollAnimation = requestAnimationFrame(step);
        } else {
            activeScrollAnimation = null;
        }
    };

    activeScrollAnimation = requestAnimationFrame(step);
}

export default function ScrollToTop() {
    const { pathname, hash } = useLocation();
    const previousPathnameRef = useRef(pathname);
    const maxAttempts = 20;
    const didPathChange = previousPathnameRef.current !== pathname;

    useEffect(() => {
        if (hash) {
            const targetId = hash.replace('#', '');
            const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            let attempts = 0;

            const scrollWhenReady = () => {
                const el = document.getElementById(targetId);

                if (!el) {
                    attempts += 1;
                    if (attempts <= maxAttempts) {
                        requestAnimationFrame(scrollWhenReady);
                    } else {
                        window.scrollTo(0, 0);
                    }
                    return;
                }

                const targetY = Math.max(0, el.getBoundingClientRect().top + window.scrollY - 112);
                const distance = Math.abs(targetY - window.scrollY);
                const isProjectsSection = targetId === 'projects';
                const duration = isProjectsSection
                    ? Math.min(1400, Math.max(500, distance / 1.4))
                    : Math.min(1400, Math.max(800, 520 + distance * 0.52));

                if (reduceMotion) {
                    window.scrollTo(0, targetY);
                } else {
                    animateScrollTo(targetY, duration, isProjectsSection ? 'linear' : 'easeInOutCubic');
                }
            };

            // For cross-page hash navigation: let page transition finish, then scroll.
            // For same-page hash changes: scroll immediately.
            const delay = didPathChange ? 560 : 0;
            const timer = setTimeout(scrollWhenReady, delay);

            return () => {
                clearTimeout(timer);
                if (activeScrollAnimation !== null) {
                    cancelAnimationFrame(activeScrollAnimation);
                    activeScrollAnimation = null;
                }
            };
        }

        if (activeScrollAnimation !== null) {
            cancelAnimationFrame(activeScrollAnimation);
            activeScrollAnimation = null;
        }
    }, [pathname, hash]);

    useEffect(() => {
        previousPathnameRef.current = pathname;
    }, [pathname]);

    return null;
}
