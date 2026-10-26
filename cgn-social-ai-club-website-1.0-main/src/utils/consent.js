export const CONSENT_STORAGE_KEY = 'cgn-social-ai-consent-v1';
export const CONSENT_SETTINGS_EVENT = 'cgn-social-ai-open-consent-settings';
export const CONSENT_VISIBILITY_EVENT = 'cgn-social-ai-consent-visibility';

const APOLLO_APP_ID = '6985af350409fe000db2f1d7';
const APOLLO_SCRIPT_ID = 'apollo-website-tracker';

export function readConsent() {
    if (typeof window === 'undefined') return null;

    try {
        const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed.analytics !== 'boolean') return null;

        return parsed;
    } catch (error) {
        return null;
    }
}

export function writeConsent({ analytics }) {
    if (typeof window === 'undefined') return;

    const payload = {
        analytics: Boolean(analytics),
        updatedAt: new Date().toISOString(),
    };

    try {
        window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
        // If storage is unavailable, keep the choice for this session only.
    }
}

export function openConsentSettings() {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(CONSENT_SETTINGS_EVENT));
}

export function loadApolloTracking() {
    if (typeof window === 'undefined') return;
    // Confirmation and unsubscribe URLs contain private bearer tokens.
    if (/^\/(newsletter|unsubscribe)(\/|$)/.test(window.location.pathname)) return;
    if (document.getElementById(APOLLO_SCRIPT_ID)) return;

    const cacheBust = Math.random().toString(36).substring(7);
    const script = document.createElement('script');
    script.id = APOLLO_SCRIPT_ID;
    script.src = `https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache=${cacheBust}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
        if (window.trackingFunctions?.onLoad) {
            window.trackingFunctions.onLoad({ appId: APOLLO_APP_ID });
        }
    };

    document.head.appendChild(script);
}

export function disableApolloTracking() {
    if (typeof window === 'undefined') return;

    const script = document.getElementById(APOLLO_SCRIPT_ID);
    if (script) script.remove();
}
