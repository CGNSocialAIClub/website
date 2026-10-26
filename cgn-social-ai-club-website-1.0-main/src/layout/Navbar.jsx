import { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import Button from '../components/ui/Button';
import NavbarItem from '../components/ui/NavbarItem';
import LanguageToggle from '../components/ui/LanguageToggle';
import NavbarLanguageToggle from '../components/ui/NavbarLanguageToggle';
import ThemeToggle from '../components/ui/ThemeToggle';
import { useLocale } from '../i18n/LocaleContext';
import { FEATURES } from '../config/features';

export default function Navbar({ isBannerVisible = APPLICATIONS_OPEN, bannerHeight = APPLICATION_BANNER_HEIGHT }) {
    const { t } = useLocale();
    const prefersReducedMotion = useReducedMotion();
    const navigate = useNavigate();
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    const [isScrolled, setIsScrolled] = useState(false);
    const [hasPassedHeroLogo, setHasPassedHeroLogo] = useState(!isHomePage);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [navNeedsCompact,setNavNeedsCompact] = useState(false);
    const [touchedLink, setTouchedLink] = useState(null);
    const pendingMobileNavigation = useRef(null);
    const [textLogoWidth, setTextLogoWidth] = useState(0);
    const [logoUnavailable, setLogoUnavailable] = useState(false);
    const handleLogoError = () => setLogoUnavailable(true);
    const textWordmark = <span style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 'var(--wordmark-font-size, 34px)', fontWeight: 700, lineHeight: 1, whiteSpace: 'nowrap', gridColumn: '1 / -1' }}>CGN SOCIAL AI CLUB</span>;
    const [isNavigating, setIsNavigating] = useState(false);
    const [logoTextOverride, setLogoTextOverride] = useState(null);
    const [desktopLeftState, setDesktopLeftState] = useState(isHomePage ? 'toggle' : 'logo');
    const [desktopToggleWidth, setDesktopToggleWidth] = useState(0);
    const textLogoMeasureRef = useRef(null);
    const desktopToggleMeasureRef = useRef(null);
    const navPillRef = useRef(null);
    const logoRevealTimerRef = useRef(null);
    const logoResetTimerRef = useRef(null);
    const desktopLeftStateTimerRef = useRef(null);
    const prevPathRef = useRef(location.pathname);
    const getSectionId = (href) => (href.includes('#') ? href.split('#')[1] : '');
    const parseHref = (href) => {
        const [pathPart, hashPart] = href.split('#');
        const pathname = pathPart || '/';
        const hash = hashPart ? `#${hashPart}` : '';
        return { pathname, hash };
    };

    const navigateWithPreScroll = (href) => {
        // Wait for the menu's actual exit completion, not a guessed timeout.
        if (isMobileMenuOpen || pendingMobileNavigation.current) {
            pendingMobileNavigation.current = href;
            setIsMobileMenuOpen(false);
            return;
        }
        if (logoRevealTimerRef.current) clearTimeout(logoRevealTimerRef.current);
        if (logoResetTimerRef.current) clearTimeout(logoResetTimerRef.current);

        const { pathname: targetPath, hash: targetHash } = parseHref(href);
        const isRouteChange = targetPath !== location.pathname;
        const isHashChangeSamePage = !isRouteChange && targetHash !== location.hash;
        const isSameHashSamePage = !isRouteChange && Boolean(targetHash) && targetHash === location.hash;
        const isHomeTopAction = targetPath === '/' && !targetHash;

        if (isHomeTopAction && location.pathname === '/') {
            const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (reduceMotion) {
                window.scrollTo(0, 0);
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            setIsMobileMenuOpen(false);
            return;
        }

        // If the URL hash is already the same (e.g. currently "/#projects"),
        // still scroll to the target section again.
        if (isSameHashSamePage) {
            const elementId = targetHash.slice(1);
            const el = document.getElementById(elementId);
            if (el) {
                const targetY = Math.max(0, el.getBoundingClientRect().top + window.scrollY - 112);
                const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                if (reduceMotion) {
                    window.scrollTo(0, targetY);
                } else {
                    window.scrollTo({ top: targetY, behavior: 'smooth' });
                }
            }
            setIsMobileMenuOpen(false);
            return;
        }

        if (!isRouteChange && !isHashChangeSamePage) {
            setIsMobileMenuOpen(false);
            return;
        }

        if (isRouteChange) {
            if (isNavigating) return;
            setIsNavigating(true);
            setIsMobileMenuOpen(false);

            navigate(href);
            requestAnimationFrame(() => setIsNavigating(false));
            return;
        }

        navigate(href);
        setIsMobileMenuOpen(false);
    };

    useEffect(() => {
        const setSurfaceProgress = (progress) => {
            navPillRef.current?.style.setProperty('--navbar-scroll-progress', String(progress));
        };
        const updateNavbarState = () => {
            setIsScrolled(window.scrollY > 20);

            if (!isHomePage) {
                setSurfaceProgress(Math.min(1, Math.max(0, window.scrollY / 80)));
                setHasPassedHeroLogo(true);
                return;
            }

            const heroLogo = document.getElementById('hero-logo');
            const navNode = navPillRef.current;

            if (!heroLogo || !navNode) {
                setSurfaceProgress(Math.min(1, Math.max(0, window.scrollY / 80)));
                setHasPassedHeroLogo(window.scrollY > 20);
                return;
            }

            const heroRect = heroLogo.getBoundingClientRect();
            const navRect = navNode.getBoundingClientRect();
            const heroBottomDocumentY = heroRect.bottom + window.scrollY;
            const handoffPoint = heroBottomDocumentY - navRect.bottom;
            // Hand off as soon as the navbar's actual lower edge covers the logo.
            setSurfaceProgress(Math.min(1, Math.max(0, window.scrollY / Math.max(1, handoffPoint))));
            setHasPassedHeroLogo(heroRect.bottom <= navRect.bottom);
        };
        let frame = null;
        const scheduleUpdate = () => {
            if (frame !== null) return;
            frame = requestAnimationFrame(() => {
                frame = null;
                updateNavbarState();
            });
        };
        updateNavbarState();
        window.addEventListener('scroll', scheduleUpdate, { passive: true });
        window.addEventListener('resize', scheduleUpdate);
        return () => {
            if (frame !== null) cancelAnimationFrame(frame);
            window.removeEventListener('scroll', scheduleUpdate);
            window.removeEventListener('resize', scheduleUpdate);
        };
    }, [isHomePage, isBannerVisible, bannerHeight]);

    useEffect(() => {
        const cameFromSubpage = prevPathRef.current !== '/' && location.pathname === '/';
        prevPathRef.current = location.pathname;

        if (cameFromSubpage && !hasPassedHeroLogo) {
            if (logoRevealTimerRef.current) clearTimeout(logoRevealTimerRef.current);
            if (logoResetTimerRef.current) clearTimeout(logoResetTimerRef.current);

            setLogoTextOverride(true);
            logoRevealTimerRef.current = setTimeout(() => {
                setLogoTextOverride(false);
                logoResetTimerRef.current = setTimeout(() => setLogoTextOverride(null), 260);
            }, 50);
            return;
        }

        if (location.pathname !== '/') {
            setLogoTextOverride(null);
        }
    }, [location.pathname, hasPassedHeroLogo]);

    useEffect(() => {
        return () => {
            if (logoRevealTimerRef.current) {
                clearTimeout(logoRevealTimerRef.current);
            }
            if (logoResetTimerRef.current) {
                clearTimeout(logoResetTimerRef.current);
            }
            if (desktopLeftStateTimerRef.current) {
                clearTimeout(desktopLeftStateTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        setDesktopLeftState(!isHomePage || hasPassedHeroLogo ? 'logo' : 'toggle');
    }, [isHomePage, hasPassedHeroLogo]);

    // Native touch handling keeps taps actionable during iOS momentum scrolling.
    useEffect(() => {
        const pill = navPillRef.current;
        if (!pill) return undefined;
        let tap = null;
        let suppressClickUntil = 0;
        const start = event => {
            const target = event.target instanceof Element ? event.target.closest('[data-nav-touch-action]') : null;
            if (!target || event.touches.length !== 1) return;
            const touch = event.touches[0];
            tap = { target, x: touch.clientX, y: touch.clientY };
            if (event.cancelable) event.preventDefault();
        };
        const end = event => {
            const current = tap;
            tap = null;
            const touch = event.changedTouches[0];
            if (!current || !touch) return;
            if (event.cancelable) event.preventDefault();
            if (Math.hypot(touch.clientX - current.x, touch.clientY - current.y) > 12) return;
            // Reuse the normal link/button action, then suppress a synthetic second click.
            suppressClickUntil = 0;
            current.target.click();
            suppressClickUntil = Date.now() + 700;
        };
        const cancel = () => { tap = null; };
        const click = event => {
            if (Date.now() < suppressClickUntil && event.target instanceof Element && event.target.closest('[data-nav-touch-action]')) {
                event.preventDefault();
                event.stopPropagation();
            }
        };
        pill.addEventListener('touchstart', start, { passive: false });
        pill.addEventListener('touchend', end, { passive: false });
        pill.addEventListener('touchcancel', cancel);
        pill.addEventListener('click', click, true);
        return () => {
            pill.removeEventListener('touchstart', start);
            pill.removeEventListener('touchend', end);
            pill.removeEventListener('touchcancel', cancel);
            pill.removeEventListener('click', click, true);
        };
    }, []);

    // Lock the document, including touch scrolling on mobile Safari.
    useEffect(() => {
        if (!isMobileMenuOpen) {
            setTouchedLink(null);
            return undefined;
        }
        const root = document.documentElement;
        const previousOverscroll = root.style.overscrollBehavior;
        // Preserve the scrolling ancestor so the sticky navbar stays in place.
        root.style.overscrollBehavior = 'none';
        let touchY = 0;
        const onTouchStart = event => { touchY = event.touches[0]?.clientY ?? 0; };
        const blockBackgroundScroll = event => {
            const menu = event.target instanceof Element ? event.target.closest('[data-mobile-menu]') : null;
            const nextY = event.touches?.[0]?.clientY;
            const delta = nextY == null ? event.deltaY : touchY - nextY;
            if (nextY != null) touchY = nextY;
            // Keep long menus usable, but never pass their overscroll to the page.
            const canScroll = menu && menu.scrollHeight > menu.clientHeight &&
                ((delta > 0 && menu.scrollTop + menu.clientHeight < menu.scrollHeight - 1) ||
                 (delta < 0 && menu.scrollTop > 0));
            if (!canScroll && event.cancelable) event.preventDefault();
        };
        const blockScrollKeys = event => {
            if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable=true]')) return;
            if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) {
                if (event.key === ' ' && event.target instanceof Element && event.target.closest('button, [role=button]')) return;
                event.preventDefault();
            }
        };
        document.addEventListener('keydown', blockScrollKeys);
        document.addEventListener('touchstart', onTouchStart, { passive: true });
        document.addEventListener('touchmove', blockBackgroundScroll, { passive: false });
        document.addEventListener('wheel', blockBackgroundScroll, { passive: false });
        return () => {
            document.removeEventListener('keydown', blockScrollKeys);
            root.style.overscrollBehavior = previousOverscroll;
            document.removeEventListener('touchstart', onTouchStart);
            document.removeEventListener('touchmove', blockBackgroundScroll);
            document.removeEventListener('wheel', blockBackgroundScroll);
        };
    }, [isMobileMenuOpen]);

    useEffect(() => {
        const node = textLogoMeasureRef.current;
        if (!node) {
            return;
        }

        const updateWidth = () => {
            setTextLogoWidth(node.getBoundingClientRect().width);
        };

        updateWidth();

        let resizeObserver;
        if (typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(updateWidth);
            resizeObserver.observe(node);
        }

        const classObserver = new MutationObserver(updateWidth);
        classObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        window.addEventListener('resize', updateWidth);

        return () => {
            window.removeEventListener('resize', updateWidth);
            classObserver.disconnect();
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        const node = desktopToggleMeasureRef.current;
        if (!node) {
            return;
        }

        const updateWidth = () => {
            setDesktopToggleWidth(node.getBoundingClientRect().width);
        };

        updateWidth();

        let resizeObserver;
        if (typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(updateWidth);
            resizeObserver.observe(node);
        }

        window.addEventListener('resize', updateWidth);

        return () => {
            window.removeEventListener('resize', updateWidth);
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        };
    }, []);

    const navLinks = [
        { name: t.nav.about, href: '/' },
        { name: t.nav.projects, href: '/projects' },
        ...(FEATURES.events ? [{ name: 'Events', href: '/events' }] : []),
        { name: t.nav.community, href: '/team' },
        { name: t.nav.nonprofits, href: '/social-partners' },
        { name: t.nav.partners, href: '/sponsors' },
        { name: t.nav.contact, href: '/contact' },
    ];

    useEffect(()=>{
        const surface=navPillRef.current;
        if(!surface)return;
        let frame;
        const measure=()=>{
            const clone=surface.cloneNode(true);
            clone.removeAttribute('data-nav-compact');
            clone.setAttribute('aria-hidden','true');
            clone.inert=true;
            clone.classList.add('navbar-fit-measure');
            clone.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
            document.body.append(clone);
            const required=Math.ceil(clone.getBoundingClientRect().width);
            clone.remove();
            setNavNeedsCompact(surface.clientWidth<required+4);
        };
        const queue=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(measure);};
        const observer=new ResizeObserver(queue);observer.observe(surface);
        window.addEventListener('resize',queue);document.fonts?.ready.then(queue);queue();
        return()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('resize',queue);};
    },[t,desktopLeftState,textLogoWidth,isMobileMenuOpen]);

    const desktopMenuVariants = {
        hidden: { opacity: 0, x: -12 },
        show: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.3,
                ease: 'easeOut',
                staggerChildren: 0.05,
                delayChildren: 0.05,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        show: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' } },
    };
    const visibleLeftState = isMobileMenuOpen ? 'logo' : desktopLeftState;
    const [logoExitComplete, setLogoExitComplete] = useState(isHomePage);
    useEffect(() => {
        if (visibleLeftState !== 'toggle') setLogoExitComplete(false);
    }, [visibleLeftState]);
    const showLanguageToggle = visibleLeftState === 'toggle' && logoExitComplete;
    const navbarSurfaceProgress = isMobileMenuOpen ? '1' : 'var(--navbar-scroll-progress, 0)';
    const desktopLeftWidth = showLanguageToggle
        ? desktopToggleWidth || 98
        : textLogoWidth + 15;
    // The CGN single-line logo already contains the icon: 2191.43 x 181.84.
    const mobileNaturalLogoWidth = 26 * (2191.43 / 181.84);
    // Handle "Slide Select"
    const handleTouchMove = (e) => {
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (element) {
            const link = element.closest('a');
            if (link && link.dataset.section) {
                setTouchedLink(link.dataset.section);
            } else {
                setTouchedLink(null);
            }
        }
    };

    const handleTouchEnd = () => {
        if (touchedLink) {
            const link = navLinks.find(l => getSectionId(l.href) === touchedLink);
            if (link) {
                navigateWithPreScroll(link.href);
            }
        }
        setTouchedLink(null);
    };

    return (
        <nav
            className="absolute left-0 right-0 z-50 mx-auto max-w-screen-2xl px-4 [--navbar-top-gap:16px] nav-desktop:[--navbar-top-gap:24px] flex flex-col items-center pointer-events-none"
            style={{
                '--navbar-radius': '24px',
                '--navbar-theme-text': 'var(--text-primary)',
                top: 0,
                // The sticky wrapper handles the safe area; this is only the visual gap.
                paddingTop: 'var(--navbar-top-gap)',
            }}
        >
            {/* Keep height and vertical padding fixed while logo and toggle exchange. */}
            <motion.div
                ref={navPillRef}
                data-nav-compact={navNeedsCompact}
                style={{
                    backgroundColor: `color-mix(in srgb, var(--bg-surface) calc(${navbarSurfaceProgress} * var(--floating-surface-opacity)), transparent)`,
                    backdropFilter: `blur(calc(${navbarSurfaceProgress} * var(--floating-surface-blur)))`,
                    WebkitBackdropFilter: `blur(calc(${navbarSurfaceProgress} * var(--floating-surface-blur)))`,
                    borderColor: `color-mix(in srgb, var(--border-default) calc(${navbarSurfaceProgress} * 100%), transparent)`,
                    boxShadow: `0 10px 20px -5px rgba(0,0,0,calc(${navbarSurfaceProgress} * 0.1))`,
                    ...(isHomePage ? {
                        '--text-primary': `color-mix(in srgb, var(--navbar-theme-text) calc(${navbarSurfaceProgress} * 100%), var(--hero-ink))`,
                    } : {}),
                }}
                className="navbar-surface pointer-events-auto relative z-20 flex items-center justify-between gap-4 h-[66px] shrink-0 py-0 pl-1 pr-4 nav-desktop:pr-2 nav-desktop:gap-3 nav-desktop:grid nav-desktop:grid-cols-[auto_minmax(max-content,1fr)_auto] nav-desktop:items-center rounded-[var(--navbar-radius)] max-w-screen-2xl w-full border"
            >
                {/* Logo / Language Toggle (Left) */}
                <div
                    className="relative flex h-[56px] min-w-0 flex-1 items-center nav-desktop:flex-none nav-desktop:w-[var(--desktop-left-width)] nav-desktop:min-w-0 nav-desktop:justify-self-start nav-desktop:transition-[width] nav-desktop:duration-500 nav-desktop:ease-in-out motion-reduce:transition-none"
                    style={{ '--desktop-left-width': `${desktopLeftWidth}px` }}
                >
                    <AnimatePresence initial={false}>
                        {showLanguageToggle && <NavbarLanguageToggle key="language-toggle" />}
                    </AnimatePresence>
                    <AnimatePresence mode="wait" initial={false} onExitComplete={() => {
                        if (visibleLeftState === 'toggle') setLogoExitComplete(true);
                    }}>
                        {visibleLeftState !== 'toggle' && (
                            <motion.div
                                key="desktop-logo"
                                className="navbar-logo-fixed hidden shrink-0 nav-desktop:flex items-center ml-[15px]"
                                initial={{ opacity: 0, x: 0, clipPath: 'inset(0 100% 0 0)' }}
                                animate={{ opacity: 1, x: 0, clipPath: 'inset(0 0% 0 0)' }}
                                exit={{ opacity: 1, x: 0, clipPath: 'inset(0 100% 0 0)', transition: { duration: prefersReducedMotion ? 0 : 0.85, ease: [0.4, 0, 0.2, 1] } }}
                                transition={{ duration: prefersReducedMotion ? 0 : 0.85, ease: [0.4, 0, 0.2, 1], opacity: { duration: prefersReducedMotion ? 0 : 0.2 } }}
                            >
                                <Link
                                    to="/"
                                    className="hidden shrink-0 nav-desktop:flex items-center"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        navigateWithPreScroll('/');
                                    }}
                                >
                                    <div className="shrink-0 h-[26px] flex items-center">
                                        {logoUnavailable ? textWordmark : <Logo navbarText className="h-[26px]" onError={handleLogoError} />}
                                    </div>
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence initial={false}>
                    {visibleLeftState !== 'toggle' && (
                    <motion.div key="mobile-logo" className="w-full min-w-0 nav-desktop:hidden" initial={{ opacity: 0, x: 0, clipPath: 'inset(0 100% 0 0)' }} animate={{ opacity: 1, x: 0, clipPath: 'inset(0 0% 0 0)' }} exit={{ opacity: 1, x: 0, clipPath: 'inset(0 100% 0 0)', transition: { duration: prefersReducedMotion ? 0 : 0.85, ease: [0.4, 0, 0.2, 1] } }} transition={{ duration: prefersReducedMotion ? 0 : 0.85, ease: [0.4, 0, 0.2, 1], opacity: { duration: prefersReducedMotion ? 0 : 0.2 } }}>
                    <Link
                        to="/"
                        aria-label="CGN Social AI Club"
                        data-nav-touch-action="home"
                        className="relative ml-[15px] grid w-[calc(100%-15px)] min-w-0 grid-cols-1 items-center nav-desktop:hidden"
                        style={{
                            maxWidth: `${mobileNaturalLogoWidth}px`,
                            aspectRatio: '2191.43 / 181.84',
                            containerType: 'inline-size',
                            '--wordmark-font-size': 'min(34px, 10.6cqi)',
                        }}
                        onClick={(e) => {
                            e.preventDefault();
                            navigateWithPreScroll('/');
                        }}
                    >
                        {logoUnavailable ? textWordmark : <div className="min-w-0" aria-hidden="true">
                            <Logo navbarText fullWidth className="w-full" onError={handleLogoError} />
                        </div>}
                    </Link>
                    </motion.div>
                    )}
                    </AnimatePresence>

                    <div aria-hidden="true" inert className="absolute w-max pointer-events-none opacity-0 -z-10">
                        <div ref={textLogoMeasureRef} className="inline-flex items-center h-[26px]">
                            {logoUnavailable ? textWordmark : <Logo navbarText className="h-[26px]" onError={handleLogoError} />}
                        </div>
                        <div ref={desktopToggleMeasureRef} className="inline-flex items-center">
                            <LanguageToggle />
                        </div>
                    </div>
                </div>

                {/* Centered Desktop Menu */}
                <div className="hidden nav-desktop:flex items-center justify-center justify-self-stretch">
                    <div className="relative flex shrink-0 items-center gap-2">
                    {navLinks.map((link) => (
                        <div key={link.href}>
                            <NavbarItem
                                active={location.pathname === link.href}
                                href={link.href}
                                className="px-2.5 xl:px-4"
                                onClick={(event) => {
                                    event.preventDefault();
                                    navigateWithPreScroll(link.href);
                                }}
                            >
                                {link.name}
                            </NavbarItem>
                        </div>
                    ))}
                    </div>
                </div>

                {/* Right Side (Button + Mobile Toggle) */}
                <motion.div
                    transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                    className="flex items-center gap-4 shrink-0 nav-desktop:min-w-max nav-desktop:justify-self-end"
                >
                    <motion.div className="hidden shrink-0 nav-desktop:block">
                        <Button
                            variant="primary"
                            className="application-start-pulse"
                            href="/application"
                            onClick={(event) => {
                                event.preventDefault();
                                navigateWithPreScroll('/application');
                            }}
                        >
                            {t.nav.apply}
                        </Button>
                    </motion.div>

                    {/* Mobile Menu Button */}
                    <button
                        type="button"
                        aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                        aria-expanded={isMobileMenuOpen}
                        data-nav-touch-action="menu"
                        className="ui-text-accent-hover nav-desktop:hidden text-[var(--text-primary)] active:text-[var(--text-accent)] transition-colors p-1 relative w-8 h-8 flex items-center justify-center"
                        onClick={() => { if (!pendingMobileNavigation.current) setIsMobileMenuOpen(!isMobileMenuOpen); }}
                    >
                        <motion.div
                            initial={false}
                            animate={{
                                rotate: isMobileMenuOpen ? 90 : 0,
                                opacity: isMobileMenuOpen ? 0 : 1
                            }}
                            transition={{ duration: 0.2 }}
                            className="absolute"
                        >
                            <Menu className="w-6 h-6" />
                        </motion.div>
                        <motion.div
                            initial={false}
                            animate={{
                                rotate: isMobileMenuOpen ? 0 : -90,
                                opacity: isMobileMenuOpen ? 1 : 0
                            }}
                            transition={{ duration: 0.2 }}
                            className="absolute"
                        >
                            <X className="w-6 h-6" />
                        </motion.div>
                    </button>
                </motion.div>
            </motion.div>

            {/* Mobile Menu Card (Detached) */}
            <AnimatePresence onExitComplete={() => {
                const href = pendingMobileNavigation.current;
                pendingMobileNavigation.current = null;
                if (href) navigateWithPreScroll(href);
            }}>
                {isMobileMenuOpen && (
                    <>
                        <motion.button
                            type="button"
                            aria-label="Close menu overlay"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`fixed inset-0 pointer-events-auto ${navNeedsCompact?'':'nav-desktop:hidden'}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
                        />

                        <motion.div
                            data-mobile-menu
                            style={{ overscrollBehavior: 'contain' }}
                            initial={{ opacity: 0, y: -10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                            className={`relative z-10 pointer-events-auto mt-2 p-4 flex flex-col items-center gap-2 rounded-[24px] shadow-xl border border-[var(--border-default)] backdrop-blur-md ${navNeedsCompact?'':'nav-desktop:hidden'} overflow-y-auto max-h-[calc(100vh-120px)] ${isScrolled
                                ? 'max-w-[1000px] w-full bg-[var(--bg-surface-glass)]'
                                : 'max-w-screen-2xl w-full bg-[var(--bg-surface-glass)]'
                                }`}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            {navLinks.map((link) => {
                                const sectionName = getSectionId(link.href);
                                const isTouched = sectionName && touchedLink === sectionName;

                                return (
                                    <Link
                                        key={link.href}
                                        to={link.href}
                                        aria-current={location.pathname === link.href ? 'page' : undefined}
                                        data-section={sectionName || undefined}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            navigateWithPreScroll(link.href);
                                        }}
                                        className={`navbar-page-link relative w-full text-center pt-[14px] pb-[13px] rounded-xl text-[length:var(--type-body)] leading-[1.2em] font-bold font-body transition-all duration-200 text-[var(--text-primary)]
                                      ${isTouched
                                                ? 'bg-[var(--active-overlay)]'
                                                : 'ui-hover-overlay active:bg-[var(--hover-overlay)]'
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}
                            
                            <div className="w-full mt-2 mb-2">
                                <Button
                                    variant="primary"
                                    className="w-full application-start-pulse"
                                    href="/application"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        navigateWithPreScroll('/application');
                                    }}
                                >
                                    {t.nav.apply}
                                </Button>
                            </div>

                            <div className="flex items-center justify-between w-full">
                                <LanguageToggle />
                                <ThemeToggle />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
}
