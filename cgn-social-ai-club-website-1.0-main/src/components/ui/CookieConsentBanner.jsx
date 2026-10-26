import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '../../i18n/LocaleContext';
import {
    CONSENT_SETTINGS_EVENT,
    CONSENT_VISIBILITY_EVENT,
    disableApolloTracking,
    loadApolloTracking,
    readConsent,
    writeConsent,
} from '../../utils/consent';

const copy = {
    en: {
        title: 'Privacy preferences',
        text: 'We use necessary browser storage for language, theme, and basic site features. With your consent, we also use optional website measurement. You can change your choice at any time via Cookies in the footer.',
        privacy: 'Privacy policy',
        reject: 'Necessary only',
        accept: 'Agree',
        saveOff: 'Necessary only',
        saveOn: 'Agree',
    },
    de: {
        title: 'Privatsphäre-Einstellungen',
        text: 'Wir nutzen notwendige Browser-Speicherung für Sprache, Theme und grundlegende Website-Funktionen. Mit deiner Zustimmung nutzen wir zusätzlich optionale Website-Messung. Du kannst deine Auswahl jederzeit über Cookies im Footer ändern.',
        privacy: 'Datenschutzerklärung',
        reject: 'Nur notwendige',
        accept: 'Zustimmen',
        saveOff: 'Nur notwendige',
        saveOn: 'Zustimmen',
    },
};

export default function CookieConsentBanner() {
    const { locale } = useLocale();
    const t = copy[locale] || copy.en;
    const [isVisible, setIsVisible] = useState(false);
    const [hasExistingChoice, setHasExistingChoice] = useState(false);

    useEffect(() => {
        let revealTimer;
        let manuallyOpened = false;
        const handleOpenSettings = () => {
            manuallyOpened = true;
            clearTimeout(revealTimer);
            setHasExistingChoice(Boolean(readConsent()));
            setIsVisible(true);
        };

        window.addEventListener(CONSENT_SETTINGS_EVENT, handleOpenSettings);

        const savedConsent = readConsent();
        setHasExistingChoice(Boolean(savedConsent));

        const scheduleBanner = () => {
            if (savedConsent || manuallyOpened) return;
            clearTimeout(revealTimer);
            const phase = document.documentElement.dataset.logoIntro;
            if (phase && phase !== 'done') {
                setIsVisible(false);
                return;
            }
            revealTimer = setTimeout(() => {
                if (!readConsent()) setIsVisible(true);
            }, 5000);
        };
        const observer = new MutationObserver(scheduleBanner);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-logo-intro'] });
        if (!savedConsent) {
            scheduleBanner();
        } else if (savedConsent.analytics) {
            loadApolloTracking();
        }

        return () => {
            clearTimeout(revealTimer);
            observer.disconnect();
            window.removeEventListener(CONSENT_SETTINGS_EVENT, handleOpenSettings);
        };
    }, []);

    const saveChoice = (analytics) => {
        writeConsent({ analytics });
        setHasExistingChoice(true);
        setIsVisible(false);

        if (analytics) {
            loadApolloTracking();
        } else {
            disableApolloTracking();
        }
    };

    useEffect(() => {
        window.dispatchEvent(new CustomEvent(CONSENT_VISIBILITY_EVENT, { detail: { visible: isVisible } }));
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div data-consent-banner role="dialog" aria-label={t.title} className="fixed inset-x-0 bottom-0 z-[100] px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 text-[var(--text-primary)] shadow-2xl md:flex-row md:items-center md:justify-between">
                <div className="max-w-2xl">
                    <h2 className="text-xl font-bold font-heading leading-heading">{t.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                        {t.text}{' '}
                        <Link
                            to="/privacy"
                            className="ui-text-accent-hover font-semibold text-[var(--text-primary)] underline decoration-[var(--border-strong)] underline-offset-4 active:text-[var(--text-accent)]"
                        >
                            {t.privacy}
                        </Link>
                    </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row md:flex-shrink-0">
                    <button
                        type="button"
                        className="ui-hover-overlay inline-flex w-full items-center justify-center rounded-[1rem] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-5 py-3 font-body text-sm font-bold leading-[1.2] text-[var(--text-primary)] transition-all duration-200 active:bg-[var(--hover-overlay)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)] sm:w-auto"
                        onClick={() => saveChoice(false)}
                    >
                        {hasExistingChoice ? t.saveOff : t.reject}
                    </button>
                    <button
                        type="button"
                        className="ui-hover-overlay inline-flex w-full items-center justify-center rounded-[1rem] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-5 py-3 font-body text-sm font-bold leading-[1.2] text-[var(--text-primary)] transition-all duration-200 active:bg-[var(--hover-overlay)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)] sm:w-auto"
                        onClick={() => saveChoice(true)}
                    >
                        {hasExistingChoice ? t.saveOn : t.accept}
                    </button>
                </div>
            </div>
        </div>
    );
}
