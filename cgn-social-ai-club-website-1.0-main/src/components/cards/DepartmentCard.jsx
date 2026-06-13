import { useState, useEffect } from 'react';
import { useLocale } from '../../i18n/LocaleContext';

export default function DepartmentCard({ name, logo, logoDark, isMain = false, className = '' }) {
    const { t } = useLocale();
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        setIsDarkMode(document.documentElement.classList.contains('dark'));

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    setIsDarkMode(document.documentElement.classList.contains('dark'));
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    const displayLogo = isDarkMode && logoDark ? logoDark : logo;

    const description = t.departments.descriptions[name] || '(TBD) Department description coming soon.';
    const displayName = t.departments.names[name] || name;

    return (
        <div
            className={`bg-[var(--bg-surface)] shadow-lg border border-[var(--border-subtle)] rounded-3xl w-full h-full ${isMain ? 'p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-12 md:max-w-[1000px] mx-auto' : 'p-8 flex flex-col'} ${className}`}
            style={{ minHeight: isMain ? '280px' : '220px' }}
        >
            {isMain ? (
                <>
                    {displayLogo && (
                        <div className="flex items-center justify-start w-full md:w-[220px]">
                            <img
                                src={displayLogo}
                                alt={displayName}
                                className="w-full max-w-[180px] md:max-w-full h-auto object-contain"
                                loading="eager"
                                decoding="async"
                                width={220}
                                height={220}
                            />
                        </div>
                    )}
                    <div className="flex-1 text-left text-[var(--text-primary)] text-base md:text-lg font-medium leading-relaxed">
                        {description}
                    </div>
                </>
            ) : (
                <>
                    <div className="flex items-center justify-start w-full mb-6" style={{ height: '84px' }}>
                        {displayLogo && (
                            <img
                                src={displayLogo}
                                alt={displayName}
                                className="h-full max-h-20 w-auto object-contain"
                                loading="eager"
                                decoding="async"
                                width={80}
                                height={80}
                            />
                        )}
                    </div>
                    <div className="w-full text-left text-[var(--text-primary)] text-base font-medium leading-relaxed min-h-[2em] mt-auto">
                        {description}
                    </div>
                </>
            )}
        </div>
    );
}
