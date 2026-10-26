import { useLayoutEffect, useRef, startTransition } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLocale } from '../../i18n/LocaleContext';
import { assetUrl } from '../../utils/assetUrl';

const LOCALES = [
    { value: 'en', label: 'English', flagSrc: assetUrl('/flags/uk.svg'), flagAlt: 'United Kingdom flag' },
    { value: 'de', label: 'Deutsch', flagSrc: assetUrl('/flags/germany.svg'), flagAlt: 'German flag' },
];

export default function LanguageToggle({ className = '', navbar = false, flagsVisible = true }) {
    const reducedMotion = useReducedMotion();
    const { locale, setLocale } = useLocale();
    const indicatorRef = useRef(null);
    const animationRef = useRef(null);
    const selectedRef = useRef(locale);
    const moveSelection = (nextLocale) => {
        const node = indicatorRef.current;
        if (!node || selectedRef.current === nextLocale) return;
        const from = getComputedStyle(node).transform;
        const fromX = from === 'none' ? 0 : new DOMMatrixReadOnly(from).m41;
        const toX = nextLocale === 'de' ? node.offsetWidth : 0;
        selectedRef.current = nextLocale;
        animationRef.current?.cancel();
        const to = `translateX(${nextLocale === 'de' ? 100 : 0}%)`;
        node.style.transform = to;
        if (!reducedMotion) {
            animationRef.current = node.animate([
                { transform: from },
                { transform: `translateX(${(fromX + toX) / 2}px) scaleX(1.18)`, offset: 0.5 },
                { transform: to },
            ], { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' });
        }
    };
    const changeLocale = (nextLocale) => {
        moveSelection(nextLocale);
        startTransition(() => setLocale(nextLocale));
    };
    useLayoutEffect(() => { moveSelection(locale); }, [locale, reducedMotion]);
    useLayoutEffect(() => () => animationRef.current?.cancel(), []);
    const handleTouchLocaleChange = (event) => {
        const touch = event.touches[0];
        if (!touch) return;

        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        const target = element?.closest('[data-locale]');
        const nextLocale = target?.getAttribute('data-locale');

        if (nextLocale && nextLocale !== locale) {
            changeLocale(nextLocale);
        }
    };

    return (
        <div
            className={`group relative flex h-12 w-[98px] items-center rounded-[var(--toggle-radius)] border border-[var(--border-default)] bg-transparent p-[4px] ${className}`}
            style={{
                '--toggle-radius': navbar ? 'calc(var(--navbar-radius, 24px) - 8px)' : '16px',
                '--toggle-inner-radius': navbar ? 'calc(var(--navbar-radius, 24px) - 13px)' : '12px',
                ...(navbar ? { height: 48.2, width: '100%', overflow: 'hidden', borderColor: 'var(--hero-border)' } : {}),
            }}
            aria-label="Language toggle"
            onTouchStart={handleTouchLocaleChange}
            onTouchMove={handleTouchLocaleChange}
        >
            <span
                aria-hidden="true"
                className="language-toggle-hover absolute inset-[4px] rounded-[var(--toggle-inner-radius)] bg-[var(--hover-overlay)] opacity-0 transition-opacity duration-300"
            />
            <span
                ref={indicatorRef}
                aria-hidden="true"
                className="absolute inset-y-[4px] left-[4px] w-[calc(50%_-_4px)] rounded-[var(--toggle-inner-radius)] bg-[var(--nav-selection-background)]"
                style={{
                    transform: `translateX(${locale === 'de' ? 100 : 0}%)`,
                    willChange: 'transform',
                }}
            />
            {LOCALES.map(({ value, label, flagSrc, flagAlt }) => {
                const isActive = locale === value;

                return (
                    <button
                        key={value}
                        type="button"
                        onClick={() => changeLocale(value)}
                        data-locale={value}
                        className={`relative z-10 flex h-full flex-1 items-center justify-center rounded-[var(--toggle-inner-radius)] transition-colors duration-300 ease-out ${
                            isActive
                                ? 'text-[var(--text-primary)]'
                                : 'text-[var(--text-primary)]/60'
                        }`}
                        aria-pressed={isActive}
                        aria-label={label}
                        title={label}
                    >
                        <motion.img
                            initial={false}
                            animate={{ opacity: flagsVisible ? 1 : 0 }}
                            transition={{ duration: reducedMotion ? 0 : 0.1, delay: 0 }}
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
