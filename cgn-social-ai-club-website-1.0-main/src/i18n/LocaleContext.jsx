import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { translations } from './translations';

const LocaleContext = createContext(null);

const LOCALES = ['de', 'en'];

function getStoredLocale() {
    if (typeof window === 'undefined') {
        return 'en';
    }

    const saved = localStorage.getItem('locale');
    return LOCALES.includes(saved) ? saved : 'en';
}

export function LocaleProvider({ children }) {
    const [locale, setLocale] = useState(getStoredLocale);

    useEffect(() => {
        document.documentElement.lang = locale;
        localStorage.setItem('locale', locale);
    }, [locale]);

    const value = useMemo(() => ({
        locale,
        setLocale,
        t: translations[locale] || translations.en,
    }), [locale]);

    return (
        <LocaleContext.Provider value={value}>
            {children}
        </LocaleContext.Provider>
    );
}

export function useLocale() {
    const context = useContext(LocaleContext);

    if (!context) {
        throw new Error('useLocale must be used within a LocaleProvider');
    }

    return context;
}
