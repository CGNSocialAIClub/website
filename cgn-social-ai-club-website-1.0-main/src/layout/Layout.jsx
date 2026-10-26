import { useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ApplicationStatusBanner from '../components/ui/ApplicationStatusBanner';
import { APPLICATIONS_OPEN, APPLICATION_BANNER_HEIGHT } from '../config/applicationStatus';

export default function Layout({ children }) {
    const location = useLocation();
    const isAppPage = location.pathname === '/application';
    const bannerOverlaysContent = location.pathname === '/';
    const bannerEnabled = APPLICATIONS_OPEN && !isAppPage;
    const bannerRef = useRef(null);
    const [bannerHeight, setBannerHeight] = useState(bannerEnabled ? APPLICATION_BANNER_HEIGHT : 0);

    useLayoutEffect(() => {
        const observer = new ResizeObserver(([entry]) => setBannerHeight(entry.contentRect.height));
        if (bannerRef.current) observer.observe(bannerRef.current);
        return () => observer.disconnect();
    }, [location.pathname]);

    if (location.pathname.replace(/\/$/, '') === '/links') {
        return <div className="bg-page text-primary min-h-screen"><main>{children}</main></div>;
    }

    return (
        <div data-page-layout style={{ overflowAnchor: 'none' }} className="bg-page text-primary min-h-screen flex flex-col selection:bg-teal-500/30 transition-colors duration-500 overflow-x-clip">
            <div ref={bannerRef} data-persistent-banner className={`${bannerOverlaysContent ? 'absolute top-0 left-0' : 'relative'} z-[41] w-full shrink-0`}>
                <ApplicationStatusBanner isVisible={bannerEnabled} animateHide={isAppPage} />
            </div>
            <div data-persistent-navigation className="sticky top-0 z-50 h-0 w-full shrink-0"
                style={bannerOverlaysContent ? { marginTop: bannerHeight, marginBottom: -bannerHeight } : undefined}>
                <Navbar isBannerVisible={bannerEnabled || bannerHeight > 0} bannerHeight={bannerHeight} />
            </div>
            <main className="flex-grow flex flex-col pt-24 overflow-x-hidden">
                {children}
            </main>
            <Footer />
            
        </div>
    );
}
