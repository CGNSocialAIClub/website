import OptimizedImage from './components/ui/OptimizedImage.jsx';
import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { useReducedMotion } from 'framer-motion'
import { flushSync } from 'react-dom'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from './layout/Layout.jsx'
import ScrollToTop from './components/ui/ScrollToTop.jsx'
import ErrorBoundary from './components/ui/ErrorBoundary.jsx'
import { LocaleProvider, useLocale } from './i18n/LocaleContext.jsx'
import './index.css'
// Weight entrypoints include unicode ranges, so Latin and extended glyphs
// do not override each other or trigger unnecessary fallback font downloads.
import '@fontsource/league-spartan/400.css';
import '@fontsource/league-spartan/500.css';
import '@fontsource/league-spartan/600.css';
import '@fontsource/league-spartan/700.css';
import '@fontsource/league-spartan/800.css';
import '@fontsource/league-spartan/900.css';
import '@fontsource/albert-sans/300.css';
import '@fontsource/albert-sans/400.css';
import '@fontsource/albert-sans/500.css';
import '@fontsource/albert-sans/600.css';
import '@fontsource/albert-sans/700.css';

import HomePage from './App.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import Imprint from './pages/Imprint.jsx';
import ContactPage from './pages/ContactPage.jsx';
import CommunityPage from './pages/CommunityPage.jsx';
import ApplicationPage from './pages/ApplicationPage.jsx';
import SocialPartnersPage from './pages/SocialPartnersPage.jsx';
import SponsorsPage from './pages/SponsorsPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import NewsletterPage from './pages/NewsletterPage.jsx';
import LinksPage from './pages/LinksPage.jsx';
import LogoAnimationTest from './pages/LogoAnimationTest.jsx';
import { FEATURES } from './config/features';
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const ContentArticlePage = lazy(() => import('./pages/ContentArticlePage.jsx'));
const EventsPage = lazy(() => import('./pages/EventsPage.jsx'));

// Initialize theme before React renders
const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    const isValidTheme = savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system';
    const theme = isValidTheme ? savedTheme : 'system';

    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
        document.documentElement.classList.remove('dark');
    } else if (theme === 'system') {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
};

initializeTheme();

function RouteFallback() {
    const { locale } = useLocale();
    const [showIcon, setShowIcon] = React.useState(false);
    React.useEffect(() => {
        const timer = setTimeout(() => setShowIcon(true), 150);
        return () => clearTimeout(timer);
    }, []);
    return (
        <div role="status" aria-live="polite" className="flex min-h-[calc(100svh-6rem)] w-full flex-col items-center justify-center gap-5 px-6 py-12 text-sm font-medium text-[var(--text-secondary)]">
            <div aria-hidden="true" className="route-loading-icon h-7 w-7" style={{ visibility: showIcon ? 'visible' : 'hidden' }}>
                <OptimizedImage src="/assets/logos/LOGO-v5-SOCIAL-AI_ICON-No-Background-Darkblue-Text.svg" alt="" fallback={null} width="80" height="80" loading="eager" className="hero-logo-light h-full w-full" />
                <OptimizedImage src="/assets/logos/LOGO-v5-SOCIAL-AI_ICON-No-Background-White-Text.svg" alt="" fallback={null} width="80" height="80" loading="eager" className="hero-logo-dark h-full w-full" />
            </div>
            <span className="sr-only">{locale === 'de' ? 'Seite wird geladen' : 'Loading page'}</span>
        </div>
    );
}

const routeOrder = ['/', '/projects', '/events', '/team', '/social-partners', '/sponsors', '/contact', '/application', '/newsletter'];
const preloadRoute = (path) => {
    if (/^\/(projects|events)\/[^/]+$/.test(path)) return import('./pages/ContentArticlePage.jsx');
    switch (path) {
        case '/privacy': return import('./pages/PrivacyPolicy.jsx');
        case '/imprint': return import('./pages/Imprint.jsx');
        default: return routeOrder.includes(path) || path === '/community' || path === '/logo-test' || path === '/nonprofits'
            ? Promise.resolve() : import('./pages/NotFound.jsx');
    }
};

// No browser snapshot preparation: start a compositor animation immediately.
// The outgoing DOM is
// inert and clipped to its current viewport; only the incoming route stays live.
function slidePages(commit, direction) {
    const layout = document.querySelector('[data-page-layout]');
    const shell = document.createElement('div');
    const copy = layout.cloneNode(true);
    copy.querySelector('[data-persistent-navigation]')?.remove();
    // Keep the live banner (and its marquee clock) outside the page slide.
    const copiedBanner = copy.querySelector('[data-persistent-banner]');
    if (copiedBanner) {
        copiedBanner.style.visibility = 'hidden';
        copiedBanner.replaceChildren();
        copiedBanner.style.height = `${layout.querySelector('[data-persistent-banner]').getBoundingClientRect().height}px`;
    }
    copy.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    shell.inert = true;
    shell.setAttribute('aria-hidden', 'true');
    Object.assign(shell.style, { position: 'fixed', inset: '0', overflow: 'hidden', pointerEvents: 'none', zIndex: '40' });
    Object.assign(copy.style, { position: 'absolute', top: `${-window.scrollY}px`, width: '100%' });
    shell.append(copy);
    document.body.append(shell);
    commit();
    const options = { duration: 380, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'both' };
    const animations = [shell.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${-direction * 100}%)` }], options)];
    for (const node of layout.children) {
        if (node.hasAttribute('data-persistent-navigation') || node.hasAttribute('data-persistent-banner')) continue;
        animations.push(node.animate([{ transform: `translateX(${direction * window.innerWidth}px)` }, { transform: 'translateX(0)' }], options));
    }
    const cleanup = () => {
        shell.remove();
        animations.forEach(animation => animation.cancel());
    };
    const finished = Promise.all(animations.map(animation => animation.finished.catch(() => {}))).finally(cleanup);
    return { finished, skipTransition: cleanup };
}

function AppRoutes() {
    const location = useLocation();
    const reducedMotion = useReducedMotion();
    const [displayedLocation, setDisplayedLocation] = React.useState(location);
    const displayed = React.useRef(location);
    const activeTransition = React.useRef(null);
    const request = React.useRef(0);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            Promise.allSettled([preloadRoute('/404')]);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    React.useEffect(() => {
        const id = ++request.current;
        const changePage = async () => {
            // Keep the current page visible until the destination's code is ready.
            await preloadRoute(location.pathname);
            if (id !== request.current) return;
            const previous = displayed.current;
            const commit = () => {
                if (id !== request.current) return;
                flushSync(() => setDisplayedLocation(location));
                displayed.current = location;
            };
            // Cancel synchronously: a second click never waits for an old animation.
            activeTransition.current?.skipTransition();
            activeTransition.current = null;
            if (previous.pathname === location.pathname || reducedMotion) {
                commit();
                return;
            }
            const direction = routeOrder.indexOf(location.pathname) >= routeOrder.indexOf(previous.pathname) ? 1 : -1;
            const transition = slidePages(commit, direction);
            activeTransition.current = transition;
            transition.finished.finally(() => {
                if (activeTransition.current === transition) activeTransition.current = null;
            });
        };
        changePage().catch(() => {
            // Let the existing error boundary handle a failed route import.
            if (id === request.current) setDisplayedLocation(location);
        });
        return () => { request.current += 1; };
    }, [location, reducedMotion]);

    return (
        <Routes location={displayedLocation}>
          <Route path="*" element={<Layout>
            <ScrollToTop />
            <div className="w-full min-h-[calc(100svh-6rem)]">
                <Suspense key={displayedLocation.pathname} fallback={<RouteFallback />}>
                    <Routes location={displayedLocation} key={displayedLocation.pathname}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/projects" element={<ProjectsPage />} />
                        {FEATURES.articles && <Route path="/projects/:slug" element={<ContentArticlePage />} />}
                        {FEATURES.events && <Route path="/events/:slug" element={<ContentArticlePage />} />}
                        {FEATURES.events && <Route path="/events" element={<EventsPage />} />}
                        <Route path="/team" element={<CommunityPage />} />
                        <Route path="/community" element={<Navigate to="/team" replace />} />
                        <Route path="/privacy" element={<PrivacyPolicy />} />
                        <Route path="/imprint" element={<Imprint />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/application" element={<ApplicationPage />} />
                        {FEATURES.linksPage && <Route path="/links" element={<LinksPage />} />}
                        {FEATURES.newsletter && <Route path="/newsletter" element={<NewsletterPage />} />}
                        {FEATURES.newsletter && <Route path="/newsletter/:action/:token" element={<NewsletterPage />} />}
                        {FEATURES.newsletter && <Route path="/unsubscribe/:token" element={<NewsletterPage />} />}
                        <Route path="/social-partners" element={<SocialPartnersPage />} />
                        <Route path="/nonprofits" element={<Navigate to="/social-partners" replace />} />
                        <Route path="/logo-test" element={<LogoAnimationTest />} />
                        <Route path="/sponsors" element={<SponsorsPage />} />
                        <Route path="/404" element={<NotFound />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </div>
          </Layout>} />
        </Routes>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <LocaleProvider>
            <ErrorBoundary>
                <BrowserRouter basename={import.meta.env.BASE_URL}>
                    <AppRoutes />
                </BrowserRouter>
            </ErrorBoundary>
        </LocaleProvider>
    </React.StrictMode>,
)
