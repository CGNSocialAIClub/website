import { SITE_URL } from './seoConfig';

export { SITE_URL };

const ROUTE_LABELS = {
    '/': 'Home',
    '/projects': 'Projects',
    '/team': 'Our Community',
    '/social-partners': 'Nonprofits',
    '/sponsors': 'Partners',
    '/contact': 'Contact',
    '/application': 'Join',
    '/privacy': 'Privacy Policy',
    '/imprint': 'Imprint',
};

export function normalizePath(pathname = '/') {
    if (!pathname || pathname === '/') return '/';
    return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

export function canonicalFromPath(pathname = '/') {
    const normalized = normalizePath(pathname);
    return `${SITE_URL}${normalized}`;
}

export function getRouteLabel(pathname = '/') {
    const normalized = normalizePath(pathname);
    if (ROUTE_LABELS[normalized]) {
        return ROUTE_LABELS[normalized];
    }
    const segment = normalized.split('/').filter(Boolean).pop() || '';
    return segment
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

export function getBreadcrumbs(pathname = '/') {
    const normalized = normalizePath(pathname);
    if (normalized === '/') {
        return [{ name: 'Home', path: '/' }];
    }
    return [
        { name: 'Home', path: '/' },
        { name: getRouteLabel(normalized), path: normalized },
    ];
}
