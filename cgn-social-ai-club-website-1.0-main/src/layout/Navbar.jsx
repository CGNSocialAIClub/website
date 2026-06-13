import { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import Button from '../components/ui/Button';
import NavbarItem from '../components/ui/NavbarItem';
import LanguageToggle from '../components/ui/LanguageToggle';
import ThemeToggle from '../components/ui/ThemeToggle';
import { useLocale } from '../i18n/LocaleContext';
import { APPLICATIONS_OPEN, APPLICATION_BANNER_HEIGHT } from '../config/applicationStatus';

export default function Navbar({ isBannerVisible = APPLICATIONS_OPEN }) {
    const { t } = useLocale();
    const navigate = useNavigate();
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    const [isScrolled, setIsScrolled] = useState(false);
    const [hasPassedHeroLogo, setHasPassedHeroLogo] = useState(!isHomePage);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [touchedLink, setTouchedLink] = useState(null);
    const [textLogoWidth, setTextLogoWidth] = useState(0);
    const [mobileTextWidthCap, setMobileTextWidthCap] = useState(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const [logoTextOverride, setLogoTextOverride] = useState(null);
    const [desktopLeftState, setDesktopLeftState] = useState(isHomePage ? 'toggle' : 'logo');
    const [desktopToggleWidth, setDesktopToggleWidth] = useState(0);
    const textLogoMeasureRef = useRef(null);
    const desktopToggleMeasureRef = useRef(null);
    const navPillRef = useRef(null);
    const mobileLeftGroupRef = useRef(null);
    const mobileIconRef = useRef(null);
    const rightControlsRef = useRef(null);
    const logoRevealTimerRef = useRef(null);
    const logoResetTimerRef = useRef(null);
    const desktopLeftStateTimerRef = useRef(null);
    const prevPathRef = useRef(location.pathname);
    const prevIsScrolledRef = useRef(isScrolled);
    const getSectionId = (href) => (href.includes('#') ? href.split('#')[1] : '');
    const parseHref = (href) => {
        const [pathPart, hashPart] = href.split('#');
        const pathname = pathPart || '/';
        const hash = hashPart ? `#${hashPart}` : '';
        return { pathname, hash };
    };

    const navigateWithPreScroll = (href) => {
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

            const shouldPreRevealLogo = isHomePage && !hasPassedHeroLogo;
            if (shouldPreRevealLogo) {
                setLogoTextOverride(true);
                logoRevealTimerRef.current = setTimeout(() => {
                    navigate(href);
                    setIsNavigating(false);
                }, 220);
            } else {
                navigate(href);
                requestAnimationFrame(() => setIsNavigating(false));
            }
            return;
        }

        navigate(href);
        setIsMobileMenuOpen(false);
    };

    useEffect(() => {
        const updateNavbarState = () => {
            setIsScrolled(window.scrollY > 20);

            if (!isHomePage) {
                setHasPassedHeroLogo(true);
                return;
            }

            const heroLogo = document.getElementById('hero-logo');
            const navNode = navPillRef.current;

            if (!heroLogo || !navNode) {
                setHasPassedHeroLogo(window.scrollY > 20);
                return;
            }

            const heroRect = heroLogo.getBoundingClientRect();
            const navRect = navNode.getBoundingClientRect();
            const heroBottomDocumentY = heroRect.bottom + window.scrollY;
            const handoffPoint = heroBottomDocumentY - navRect.height;

            // Use an absolute scroll threshold instead of comparing two moving
            // viewport rects, then add hysteresis around that threshold.
            setHasPassedHeroLogo((previous) => {
                if (previous) {
                    return window.scrollY >= handoffPoint - 24;
                }
                return window.scrollY >= handoffPoint + 24;
            });
        };
        updateNavbarState();
        window.addEventListener('scroll', updateNavbarState);
        window.addEventListener('resize', updateNavbarState);
        return () => {
            window.removeEventListener('scroll', updateNavbarState);
            window.removeEventListener('resize', updateNavbarState);
        };
    }, [isHomePage, isBannerVisible]);

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
        if (desktopLeftStateTimerRef.current) {
            clearTimeout(desktopLeftStateTimerRef.current);
        }

        const wasScrolled = prevIsScrolledRef.current;
        prevIsScrolledRef.current = hasPassedHeroLogo;

        if (!isHomePage) {
            setDesktopLeftState('logo');
            return;
        }

        if (!hasPassedHeroLogo) {
            if (wasScrolled) {
                setDesktopLeftState('icon');
                desktopLeftStateTimerRef.current = setTimeout(() => {
                    setDesktopLeftState('toggle');
                }, 180);
                return;
            }

            setDesktopLeftState('toggle');
            return;
        }

        setDesktopLeftState('icon');
        desktopLeftStateTimerRef.current = setTimeout(() => {
            setDesktopLeftState('logo');
        }, 140);

        return () => {
            if (desktopLeftStateTimerRef.current) {
                clearTimeout(desktopLeftStateTimerRef.current);
            }
        };
    }, [isHomePage, hasPassedHeroLogo]);

    // Scroll Lock when Mobile Menu is Open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setTouchedLink(null);
        }
        return () => { document.body.style.overflow = 'unset'; };
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

    useEffect(() => {
        const updateMobileTextWidthCap = () => {
            const navNode = navPillRef.current;
            const leftNode = mobileLeftGroupRef.current;
            const iconNode = mobileIconRef.current;
            const rightNode = rightControlsRef.current;

            if (!navNode || !leftNode || !iconNode || !rightNode) {
                return;
            }

            const navRect = navNode.getBoundingClientRect();
            const leftRect = leftNode.getBoundingClientRect();
            const iconRect = iconNode.getBoundingClientRect();
            const rightRect = rightNode.getBoundingClientRect();

            // Keep the same minimum spacing between logo and hamburger as
            // between hamburger and the right navbar edge.
            const rightEdgeSpacing = Math.max(0, navRect.right - rightRect.right);
            const availableLeftGroupWidth = rightRect.left - leftRect.left - rightEdgeSpacing;
            const logoGap = 8; // Matches ml-2 between icon and text logo.
            const cap = Math.max(0, availableLeftGroupWidth - iconRect.width - logoGap);

            setMobileTextWidthCap(cap);
        };

        updateMobileTextWidthCap();
        window.addEventListener('resize', updateMobileTextWidthCap);
        return () => window.removeEventListener('resize', updateMobileTextWidthCap);
    }, [isMobileMenuOpen, location.pathname, textLogoWidth]);

    const navLinks = [
        { name: t.nav.about, href: '/' },
        { name: t.nav.projects, href: '/projects' },
        { name: t.nav.community, href: '/team' },
        { name: t.nav.nonprofits, href: '/social-partners' },
        { name: t.nav.partners, href: '/sponsors' },
        { name: t.nav.contact, href: '/contact' },
    ];

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
    const desktopLeftWidth = Math.max(desktopToggleWidth, textLogoWidth + 30);
    const logoTextVisible = logoTextOverride ?? (!isHomePage || desktopLeftState === 'logo');

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
            className="fixed left-0 right-0 z-50 flex flex-col items-center transition-all duration-300 pt-4 px-4 pointer-events-none"
            style={{ top: APPLICATIONS_OPEN && isBannerVisible ? `${APPLICATION_BANNER_HEIGHT}px` : '0px' }}
        >
            {/* Main Navbar Pill */}
            <motion.div
                layout
                transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                ref={navPillRef}
                className={`pointer-events-auto relative transition-all duration-500 ease-in-out flex items-center justify-between p-4 nav-desktop:grid nav-desktop:grid-cols-[auto_minmax(0,1fr)_auto] nav-desktop:items-center nav-desktop:p-[8px] rounded-[24px] ${isScrolled
                    ? 'max-w-screen-2xl w-full nav-desktop:w-[100%] bg-[var(--bg-surface-glass)] backdrop-blur-md shadow-lg border border-[var(--border-default)]'
                    : 'max-w-screen-2xl w-full nav-desktop:w-[100%] bg-transparent border border-transparent'
                    } ${isMobileMenuOpen ? '!bg-[var(--bg-surface)] !shadow-lg !border-[var(--border-default)]' : ''}`}
            >
                {/* Logo / Language Toggle (Left) */}
                <div
                    className="relative flex items-center shrink-0 nav-desktop:min-w-0 nav-desktop:pl-3 nav-desktop:justify-self-start"
                    style={desktopLeftWidth ? { width: `${desktopLeftWidth}px` } : undefined}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        {desktopLeftState === 'toggle' ? (
                            <motion.div
                                key="desktop-toggle"
                                className="hidden w-full nav-desktop:-ml-3 nav-desktop:flex items-center justify-start"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.16, ease: 'easeOut' }}
                            >
                                <LanguageToggle />
                            </motion.div>
                        ) : (
                            <motion.div
                                key={`desktop-logo-${desktopLeftState}`}
                                className="hidden nav-desktop:flex items-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.16, ease: 'easeOut' }}
                            >
                                <Link
                                    to="/"
                                    className="hidden nav-desktop:flex items-center"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        navigateWithPreScroll('/');
                                    }}
                                >
                                    {isHomePage ? (
                                        <>
                                            <Logo iconOnly className="h-[22px]" />
                                            <motion.div
                                                className="relative ml-2 overflow-hidden h-[22px] min-h-[22px]"
                                                initial={false}
                                                style={{ width: textLogoWidth }}
                                                animate={{
                                                    opacity: logoTextVisible ? 1 : 0,
                                                    clipPath: logoTextVisible ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)',
                                                }}
                                                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                                            >
                                                <div className="absolute inset-0 flex items-center">
                                                    <Logo navbarText className="h-[22px]" />
                                                </div>
                                            </motion.div>
                                        </>
                                    ) : (
                                        <>
                                            <Logo iconOnly className="h-[22px]" />
                                            <div className="ml-2 h-[22px] min-h-[22px] flex items-center">
                                                <Logo navbarText className="h-[22px]" />
                                            </div>
                                        </>
                                    )}
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Link
                        ref={mobileLeftGroupRef}
                        to="/"
                        className="flex nav-desktop:hidden items-center"
                        onClick={(e) => {
                            e.preventDefault();
                            navigateWithPreScroll('/');
                        }}
                    >
                        <span ref={mobileIconRef} className="shrink-0 flex items-center">
                            <Logo iconOnly className="h-[22px]" />
                        </span>
                        {isHomePage ? (
                            <motion.div
                                className="relative ml-2 overflow-hidden h-[22px] min-h-[22px]"
                                initial={false}
                                style={{ width: Math.max(0, Math.min(textLogoWidth, mobileTextWidthCap ?? textLogoWidth)) }}
                                animate={{
                                    opacity: logoTextVisible ? 1 : 0,
                                    clipPath: logoTextVisible ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)',
                                }}
                                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <div className="absolute inset-0 flex items-center">
                                    <Logo navbarText className="h-[22px]" />
                                </div>
                            </motion.div>
                        ) : (
                            <div
                                className="ml-2 h-[22px] min-h-[22px] flex items-center overflow-hidden"
                                style={{ width: Math.max(0, Math.min(textLogoWidth, mobileTextWidthCap ?? textLogoWidth)) }}
                            >
                                <Logo navbarText className="h-[22px]" />
                            </div>
                        )}
                    </Link>

                    <div className="absolute pointer-events-none opacity-0 -z-10">
                        <div ref={textLogoMeasureRef} className="inline-flex items-center h-[22px]">
                            <Logo navbarText className="h-[22px]" />
                        </div>
                        <div ref={desktopToggleMeasureRef} className="inline-flex items-center">
                            <LanguageToggle />
                        </div>
                    </div>
                </div>

                {/* Centered Desktop Menu */}
                <motion.div
                    layout
                    className="hidden nav-desktop:flex items-center justify-center gap-2 justify-self-stretch"
                    variants={desktopMenuVariants}
                    initial="hidden"
                    animate="show"
                    transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                >
                    {navLinks.map((link) => (
                        <motion.div
                            key={link.href}
                            layout="position"
                            variants={itemVariants}
                            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                        >
                            <NavbarItem
                                href={link.href}
                                onClick={(event) => {
                                    event.preventDefault();
                                    navigateWithPreScroll(link.href);
                                }}
                            >
                                {link.name}
                            </NavbarItem>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Right Side (Button + Mobile Toggle) */}
                <motion.div
                    layout
                    transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                    ref={rightControlsRef}
                    className="flex items-center gap-4 shrink-0 nav-desktop:min-w-0 nav-desktop:justify-self-end"
                >
                    <motion.div layout="position" transition={{ type: 'spring', stiffness: 260, damping: 28 }} className="hidden nav-desktop:block">
                        <Button
                            variant="primary"
                            className="apply-now-pulse"
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
                        className="nav-desktop:hidden text-[var(--text-primary)] hover:text-[var(--text-accent)] transition-colors p-1 relative w-8 h-8 flex items-center justify-center"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.button
                            type="button"
                            aria-label="Close menu overlay"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="nav-desktop:hidden fixed inset-0 pointer-events-auto"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        />

                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className={`relative z-10 pointer-events-auto mt-2 p-4 flex flex-col items-center gap-2 rounded-[24px] shadow-xl border border-[var(--border-default)] backdrop-blur-md nav-desktop:hidden overflow-y-auto max-h-[calc(100vh-120px)] ${isScrolled
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
                                        data-section={sectionName || undefined}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            navigateWithPreScroll(link.href);
                                        }}
                                        className={`w-full text-center pt-[14px] pb-[13px] rounded-xl text-[16px] leading-[1.2em] font-bold font-body transition-all duration-200 text-[var(--text-primary)] 
                                      ${isTouched
                                                ? 'bg-[var(--active-overlay)]'
                                                : 'hover:bg-[var(--hover-overlay)]'
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}
                            
                            <div className="w-full mt-2 mb-2">
                                <Button
                                    variant="primary"
                                    className="w-full apply-now-pulse"
                                    href="/application"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        navigateWithPreScroll('/application');
                                    }}
                                >
                                    {t.nav.apply}
                                </Button>
                            </div>

                            <div className="flex items-center justify-between w-full mt-2">
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
