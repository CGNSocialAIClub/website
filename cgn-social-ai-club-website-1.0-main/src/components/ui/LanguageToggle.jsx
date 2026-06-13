import { motion } from 'framer-motion';
import { useLocale } from '../../i18n/LocaleContext';

const LOCALES = [
    { value: 'de', label: 'Deutsch', flagSrc: '/flags/germany.svg', flagAlt: 'German flag' },
    { value: 'en', label: 'English', flagSrc: '/flags/uk.svg', flagAlt: 'United Kingdom flag' },
];

export default function LanguageToggle({ className = '' }) {
    const { locale, setLocale } = useLocale();
    const handleTouchLocaleChange = (event) => {
        const touch = event.touches[0];
        if (!touch) return;

        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        const target = element?.closest('[data-locale]');
        const nextLocale = target?.getAttribute('data-locale');

        if (nextLocale && nextLocale !== locale) {
            setLocale(nextLocale);
        }
    };

    return (
        <div
            className={`relative flex h-[44px] w-[140px] items-center rounded-full border border-[var(--border-default)] bg-[color-mix(in_srgb,var(--bg-surface-glass)_70%,transparent)] p-1 backdrop-blur-md ${className}`}
            aria-label="Language toggle"
            onTouchStart={handleTouchLocaleChange}
            onTouchMove={handleTouchLocaleChange}
        >
            <motion.span
                aria-hidden="true"
                className="absolute left-1 top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-[color-mix(in_srgb,var(--bg-accent)_30%,transparent)] shadow-sm"
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                animate={{ 
                    x: locale === 'en' ? '100%' : '0%',
                }}
            />
            {LOCALES.map(({ value, label, flagSrc, flagAlt }) => {
                const isActive = locale === value;

                return (
                    <button
                        key={value}
                        type="button"
                        onClick={() => setLocale(value)}
                        data-locale={value}
                        className={`relative z-10 flex h-full flex-1 items-center justify-center rounded-full transition-colors duration-300 ease-out ${
                            isActive
                                ? 'text-[var(--text-primary)]'
                                : 'text-[var(--text-primary)]/60 hover:bg-[var(--hover-overlay)]'
                        }`}
                        aria-pressed={isActive}
                        aria-label={label}
                        title={label}
                    >
                        <img
                            src={flagSrc}
                            alt={flagAlt}
                            className="h-3.5 w-[21px] rounded-[2px] object-cover shadow-[0_0_0_1px_rgba(255,255,255,0.18)]"
                            draggable="false"
                        />
                    </button>
                );
            })}
        </div>
    );
}
