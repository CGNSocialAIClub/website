import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ApplicationStatusBanner from '../components/ui/ApplicationStatusBanner';
import { APPLICATIONS_OPEN } from '../config/applicationStatus';

export default function Layout({ children }) {
    const location = useLocation();
    const isAppPage = location.pathname === '/application';
    const [isBannerVisible, setIsBannerVisible] = useState(APPLICATIONS_OPEN);
    const revealTimerRef = useRef(null);

    useEffect(() => {
        if (!APPLICATIONS_OPEN) {
            return undefined;
        }

        const clearRevealTimer = () => {
            if (revealTimerRef.current) {
                clearTimeout(revealTimerRef.current);
                revealTimerRef.current = null;
            }
        };

        const updateBannerVisibility = () => {
            if (window.scrollY > 0) {
                clearRevealTimer();
                setIsBannerVisible(false);
                return;
            }

            clearRevealTimer();
            revealTimerRef.current = setTimeout(() => {
                setIsBannerVisible(true);
                revealTimerRef.current = null;
            }, 1000);
        };

        updateBannerVisibility();
        window.addEventListener('scroll', updateBannerVisibility);

        return () => {
            clearRevealTimer();
            window.removeEventListener('scroll', updateBannerVisibility);
        };
    }, []);

    const finalBannerVisible = isBannerVisible && !isAppPage;

    return (
        <div className="bg-page text-primary min-h-screen flex flex-col selection:bg-teal-500/30 transition-colors duration-500 overflow-x-hidden">
            <ApplicationStatusBanner isVisible={finalBannerVisible} />
            <Navbar isBannerVisible={finalBannerVisible} />
            <main className="flex-grow flex flex-col pt-24 overflow-x-hidden">
                {children}
            </main>
            <Footer />
        </div>
    );
}
