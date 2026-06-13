import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import App from './App.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy.jsx'
import Imprint from './pages/Imprint.jsx'
import ContactPage from './pages/ContactPage.jsx'
import CommunityPage from './pages/CommunityPage.jsx'
import ApplicationPage from './pages/ApplicationPage.jsx'
import SocialPartnersPage from './pages/SocialPartnersPage.jsx'
import SponsorsPage from './pages/SponsorsPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import LogoAnimationTest from './pages/LogoAnimationTest.jsx'
import NotFound from './pages/NotFound.jsx'
import Layout from './layout/Layout.jsx'
import ScrollToTop from './components/ui/ScrollToTop.jsx'
import ErrorBoundary from './components/ui/ErrorBoundary.jsx'
import { LocaleProvider } from './i18n/LocaleContext.jsx'
import './index.css'
import '@fontsource/league-spartan/700.css';
import '@fontsource/albert-sans/400.css';
import '@fontsource/albert-sans/500.css';
import '@fontsource/albert-sans/600.css';

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

const pageVariants = {
    initial: (direction) => ({
        opacity: 1,
        x: direction >= 0 ? '100%' : '-100%',
        y: 0,
    }),
    animate: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
            duration: 0.5,
            // Starts fast, then slows down.
            ease: [0, 0, 0.58, 1],
        },
    },
    exit: (direction) => ({
        opacity: 1,
        x: direction >= 0 ? '-100%' : '100%',
        y: 0,
        transition: {
            duration: 0.5,
            // Starts slow, then speeds up.
            ease: [0.42, 0, 1, 1],
        },
    }),
};

function PageTransition({ children, direction }) {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            custom={direction}
            variants={pageVariants}
            style={{ willChange: 'transform', width: '100%' }}
        >
            {children}
        </motion.div>
    );
}

function AppRoutes() {
    const location = useLocation();
    const navOrder = ['/', '/projects', '/team', '/social-partners', '/sponsors', '/contact', '/application'];
    const getPathOrder = (pathname) => {
        const index = navOrder.indexOf(pathname);
        return index === -1 ? navOrder.length : index;
    };
    const previousPathRef = React.useRef(location.pathname);
    const previousOrder = getPathOrder(previousPathRef.current);
    const currentOrder = getPathOrder(location.pathname);
    const direction = currentOrder >= previousOrder ? 1 : -1;

    React.useEffect(() => {
        previousPathRef.current = location.pathname;
    }, [location.pathname]);

    const resetScrollToTop = React.useCallback(() => {
        window.scrollTo({ top: 0, left: window.scrollX, behavior: 'auto' });
        requestAnimationFrame(() => {
            window.scrollTo({ top: 0, left: window.scrollX, behavior: 'auto' });
        });
    }, []);

    return (
        <Layout>
            <AnimatePresence
                mode="wait"
                custom={direction}
                onExitComplete={() => {
                    resetScrollToTop();
                }}
            >
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<PageTransition direction={direction}><App /></PageTransition>} />
                    <Route path="/projects" element={<PageTransition direction={direction}><ProjectsPage /></PageTransition>} />
                    <Route path="/team" element={<PageTransition direction={direction}><CommunityPage /></PageTransition>} />
                    <Route path="/privacy" element={<PageTransition direction={direction}><PrivacyPolicy /></PageTransition>} />
                    <Route path="/imprint" element={<PageTransition direction={direction}><Imprint /></PageTransition>} />
                    <Route path="/contact" element={<PageTransition direction={direction}><ContactPage /></PageTransition>} />
                    <Route path="/application" element={<PageTransition direction={direction}><ApplicationPage /></PageTransition>} />
                    <Route path="/social-partners" element={<PageTransition direction={direction}><SocialPartnersPage /></PageTransition>} />
                    <Route path="/sponsors" element={<PageTransition direction={direction}><SponsorsPage /></PageTransition>} />
                    <Route path="/logo-test" element={<PageTransition direction={direction}><LogoAnimationTest /></PageTransition>} />
                    <Route path="/404" element={<PageTransition direction={direction}><NotFound /></PageTransition>} />
                    <Route path="*" element={<PageTransition direction={direction}><NotFound /></PageTransition>} />
                </Routes>
            </AnimatePresence>
        </Layout>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <LocaleProvider>
            <ErrorBoundary>
                <BrowserRouter>
                    <ScrollToTop />
                    <AppRoutes />
                </BrowserRouter>
            </ErrorBoundary>
        </LocaleProvider>
    </React.StrictMode>,
)
