import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MousePointerClick } from 'lucide-react';
import { useLocale } from '../../i18n/LocaleContext';
import { APPLICATIONS_OPEN, APPLICATION_BANNER_HEIGHT, APPLICATION_DEADLINE } from '../../config/applicationStatus';


const formatCountdownText = (countdown, t) => {
    if (countdown.isExpired) {
        return t.pages.application.bannerCountdownExpired;
    }

    const timeParts = [
        countdown.days > 0 ? `${countdown.days} ${t.pages.application.bannerCountdownUnits.days}` : null,
        `${countdown.hours} ${t.pages.application.bannerCountdownUnits.hours}`,
        `${countdown.minutes} ${t.pages.application.bannerCountdownUnits.minutes}`,
    ].filter(Boolean);

    return `${t.pages.application.bannerCountdownPrefix} ${timeParts.join(' ')}`;
};

const getTimeUntilDeadline = () => {
    const difference = Math.max(0, new Date(APPLICATION_DEADLINE).getTime() - Date.now());
    const totalMinutes = Math.floor(difference / 60000);
    const minutes = totalMinutes % 60;
    const totalHours = Math.floor(totalMinutes / 60);
    const hours = totalHours % 24;
    const totalDays = Math.floor(totalHours / 24);

    return { days: totalDays, hours, minutes, isExpired: difference === 0 };
};

export default function ApplicationStatusBanner({ isVisible = true }) {
    const { t } = useLocale();
    const location = useLocation();
    const [countdown, setCountdown] = useState(getTimeUntilDeadline);
    const [isDarkMode, setIsDarkMode] = useState(() =>
        typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
    );

    useEffect(() => {
        const syncCountdown = () => setCountdown(getTimeUntilDeadline());
        syncCountdown();

        const intervalId = window.setInterval(syncCountdown, 60000);
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
    const bannerBackground = isDarkMode ? '#4BFFC0' : '#0a2d57';
    const bannerTextColor = isDarkMode ? '#0a2d57' : '#FFFFFF';
    const bannerIconColor = isDarkMode ? '#0a2d57' : '#4BFFC0';
    const countdownText = formatCountdownText(countdown, t);

    const renderBannerSet = (setKey, hidden = false) => (
        <div className="flex shrink-0 items-center gap-6" aria-hidden={hidden}>
            {Array.from({ length: 6 }, (_, index) => (
                <span
                    key={`${setKey}-application-banner-item-${index}`}
                    className="inline-flex items-center gap-6 whitespace-nowrap font-sans text-sm font-bold uppercase tracking-[0.12em]"
                    style={{ color: bannerTextColor }}
                >
                    <span>{countdownText}</span>
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
            aria-label={t.pages.application.bannerAriaLabel}
            className={`relative z-40 block overflow-hidden transition-[height,opacity] duration-300 ${
                isVisible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
            }`}
            style={{
                height: isVisible ? `${APPLICATION_BANNER_HEIGHT}px` : '0px',
                backgroundColor: bannerBackground,
            }}
        >
            <div className="application-banner-track flex h-full min-w-max items-center gap-6">
                {renderBannerSet('primary')}
                {renderBannerSet('secondary', true)}
            </div>
        </Link>
    );
}
