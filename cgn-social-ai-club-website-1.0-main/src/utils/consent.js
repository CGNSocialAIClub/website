export const CONSENT_STORAGE_KEY = 'cgn-social-ai-consent-v1';
export const CONSENT_SETTINGS_EVENT = 'cgn-social-ai-open-consent-settings';
export const CONSENT_VISIBILITY_EVENT = 'cgn-social-ai-consent-visibility';

// Optional services that load only after the visitor agrees. Add one entry per tool, e.g.
//   { id: 'plausible', src: 'https://plausible.io/js/script.js', attrs: { 'data-domain': 'cologne-socialaiclub.de', defer: '' } }
// Leave empty while the site uses no analytics or tracking; keep the privacy policy in sync.
export const OPTIONAL_SERVICES = [];

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
    });
}
