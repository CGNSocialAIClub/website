import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MousePointerClick } from 'lucide-react';
import { useLocale } from '../../i18n/LocaleContext';
import { APPLICATIONS_OPEN, APPLICATION_BANNER_HEIGHT, APPLICATION_DEADLINE } from '../../config/applicationStatus';

import { getApplicationCountdown } from '../../utils/applicationCountdown.mjs';

const getTimeUntilDeadline = () => getApplicationCountdown(APPLICATION_DEADLINE);

const formatCountdownText = (countdown, t, locale) => {
    if (countdown.isExpired) return t.pages.application.bannerCountdownExpired;
    if (!countdown.parts.length) return t.pages.application.bannerCountdownSoon;
    const duration = countdown.parts.map(({ unit, value }) =>
        new Intl.NumberFormat(locale, { style: 'unit', unit, unitDisplay: 'long' }).format(value)
    ).join(' ');
    return `${t.pages.application.bannerCountdownPrefix} ${duration}`;
};

export default function ApplicationStatusBanner({ isVisible = true, animateHide = false }) {
    const { t, locale } = useLocale();
    const location = useLocation();
    const [countdown, setCountdown] = useState(getTimeUntilDeadline);
    const [isDarkMode, setIsDarkMode] = useState(() =>
        typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
    );

    useEffect(() => {
        const syncCountdown = () => setCountdown(getTimeUntilDeadline());
        syncCountdown();

        const intervalId = window.setInterval(syncCountdown, 1000);
        return () => window.clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        const syncTheme = () => setIsDarkMode(root.classList.contains('dark'));
        syncTheme();

        const observer = new MutationObserver(syncTheme);
        observer.observe(root, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    if (!APPLICATIONS_OPEN) {
        return null;
    }

    const bannerTarget = location.pathname === '/application'
        ? '/application#start-application'
        : '/application';
    const bannerBackground = isDarkMode
        ? 'linear-gradient(to right, #8ff5d4 0%, #dff8f0 50%, #a8ceff 100%)'
        : 'linear-gradient(to right, #a2f3d9 0%, #DEECFF 50%, #a8ceff 100%)';
    const bannerTextColor = '#0a2d57';
    const bannerIconColor = '#0a2d57';
    const bannerText = countdown
        ? formatCountdownText(countdown, t, locale)
        : t.pages.application.bannerText;

    const renderBannerSet = (setKey, hidden = false) => (
        <div className="flex shrink-0 items-center gap-6" aria-hidden={hidden}>
            {Array.from({ length: 6 }, (_, index) => (
                <span
                    key={`${setKey}-application-banner-item-${index}`}
                    className="inline-flex items-center gap-6 whitespace-nowrap font-sans text-sm font-bold uppercase tracking-[0.12em]"
                    style={{ color: bannerTextColor }}
                >
                    <span>{bannerText}</span>
                    <MousePointerClick className="h-5 w-5 shrink-0" style={{ color: bannerIconColor }} aria-hidden="true" />
                    <span>{t.pages.application.bannerCta}</span>
                    <MousePointerClick className="h-5 w-5 shrink-0" style={{ color: bannerIconColor }} aria-hidden="true" />
                </span>
            ))}
        </div>
    );

    return (
        <Link
            to={bannerTarget}
            aria-label={`${bannerText}. ${t.pages.application.bannerCta}`}
            aria-hidden={!isVisible}
            tabIndex={isVisible ? undefined : -1}
            className={`application-banner-surface motion-reduce:!transition-none relative z-40 block shrink-0 overflow-hidden ${
                isVisible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
            }`}
            style={{
                height: isVisible ? `calc(${APPLICATION_BANNER_HEIGHT}px + var(--browser-safe-top, 0px))` : '0px',
                paddingTop: isVisible ? 'var(--browser-safe-top, 0px)' : 0,
                backgroundImage: bannerBackground,
                transition: isVisible
                    ? 'none'
                    : animateHide ? 'height 400ms cubic-bezier(0.22, 1, 0.36, 1), opacity 250ms ease-out' : 'none',
            }}
        >
            <div className="application-banner-track flex min-w-max items-center gap-6" style={{ height: APPLICATION_BANNER_HEIGHT }}>
                {renderBannerSet('primary')}
                {renderBannerSet('secondary', true)}
            </div>
        </Link>
    );
}
