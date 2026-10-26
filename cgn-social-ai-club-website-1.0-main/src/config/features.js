// ═══════════════════════════════════════════════
// FEATURE TOGGLES
// ═══════════════════════════════════════════════

export const PROJECT_DETAILS_ENABLED = true;

// Modules adopted from the partner club's website. They stay hidden (no route,
// no navigation link) until the CGN content for them exists and the switch is set to true.
export const FEATURES = {
    events: false,      // /events calendar, event articles
    articles: true,     // /projects/:slug long-form project pages (only projects with hasArticle: true)
    newsletter: false,  // /newsletter (needs a backend)
    linksPage: false,   // /links bio-link page
    alumni: false,      // alumni section on the team page
    cookieBanner: false, // consent banner + footer link; switch on together with OPTIONAL_SERVICES in utils/consent.js
};

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
