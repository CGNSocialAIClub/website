export const CONSENT_STORAGE_KEY = 'cgn-social-ai-consent-v1';
export const CONSENT_SETTINGS_EVENT = 'cgn-social-ai-open-consent-settings';
export const CONSENT_VISIBILITY_EVENT = 'cgn-social-ai-consent-visibility';

// Optional services that load only after the visitor agrees (see CookieConsentBanner).
// Per service: `src` (script URL), optional `init()` (runs right before the script is added),
// `onLoad()` and `onDisable()` (runs when consent is withdrawn).
const GA_ID = 'G-V7YNWNPFVJ';

function deleteCookies(prefix) {
    const hostname = window.location.hostname;
    const domains = [undefined, hostname, `.${hostname}`, `.${hostname.split('.').slice(-2).join('.')}`];
    document.cookie.split(';').map((entry) => entry.split('=')[0].trim()).filter((name) => name.startsWith(prefix)).forEach((name) => {
        domains.forEach((domain) => {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain ? `; domain=${domain}` : ''}`;
        });
    });
}

export const OPTIONAL_SERVICES = [
    {
        id: 'google-analytics',
        src: `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`,
        init() {
            window[`ga-disable-${GA_ID}`] = false;
            window.dataLayer = window.dataLayer || [];
            window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
            window.gtag('js', new Date());
            window.gtag('config', GA_ID, {
                anonymize_ip: true,
                allow_google_signals: false,
                allow_ad_personalization_signals: false,
            });
        },
        onDisable() {
            window[`ga-disable-${GA_ID}`] = true;
            deleteCookies('_ga');
        },
    },
];

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

const serviceScriptId = (service) => `consent-service-${service.id}`;

export function loadOptionalServices() {
    if (typeof window === 'undefined') return;
    OPTIONAL_SERVICES.forEach((service) => {
        if (document.getElementById(serviceScriptId(service))) return;
        service.init?.();
        const script = document.createElement('script');
        script.id = serviceScriptId(service);
        script.src = service.src;
        script.async = true;
        Object.entries(service.attrs || {}).forEach(([name, value]) => script.setAttribute(name, value));
        script.onload = () => service.onLoad?.();
        document.head.appendChild(script);
    });
}

export function disableOptionalServices() {
    if (typeof window === 'undefined') return;
    OPTIONAL_SERVICES.forEach((service) => {
        document.getElementById(serviceScriptId(service))?.remove();
        service.onDisable?.();
    });
}
