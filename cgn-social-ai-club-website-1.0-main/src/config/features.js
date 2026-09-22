// ═══════════════════════════════════════════════
// FEATURE TOGGLES
// ═══════════════════════════════════════════════

export const PROJECT_DETAILS_ENABLED = true;

// Recruiting banner on the homepage + application page wording.
// Before `applicationsOpenAt` the site says "applications open on …";
// from that moment on it switches to "apply now" automatically.
export const RECRUITING = {
    bannerEnabled: true,
    applicationsOpenAt: '2026-10-01T00:00:00+02:00',
};

export const areApplicationsOpen = () => Date.now() >= new Date(RECRUITING.applicationsOpenAt).getTime();

export const SITE_POPUP = {
    enabled: false,
    storageKey: 'site-popup-dismissed',
    delayMs: 5000,
    ariaLabel: 'Site announcement',
    dismissAriaLabel: 'Dismiss site announcement',
    badgeLogoSrc: '/assets/logos/DEPARTMENT-EVENTS.svg',
    badgeLogoAlt: 'Events Department',
    badgeLabel: 'Announcement',
    body: '',
    meta: '',
    ctaLabel: '',
    ctaHref: '',
};
