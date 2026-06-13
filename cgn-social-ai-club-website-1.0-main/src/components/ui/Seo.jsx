import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { canonicalFromPath, getBreadcrumbs, normalizePath, SITE_URL } from '../../utils/seoRoutes';
import { getSeoForPath } from '../../utils/seoConfig';
import { useLocale } from '../../i18n/LocaleContext';

export default function Seo({
    title,
    description,
    url,
    image = `${SITE_URL}/assets/social-preview/link-preview-image-1.png`,
    noIndex,
    structuredData = [],
}) {
    const { locale } = useLocale();
    const location = useLocation();
    const normalizedPath = normalizePath(location.pathname);
    const routeSeo = getSeoForPath(normalizedPath);
    const effectiveTitle = title || routeSeo?.title;
    const effectiveDescription = description || routeSeo?.description;
    const effectiveNoIndex = typeof noIndex === 'boolean' ? noIndex : Boolean(routeSeo?.noIndex);
    const canonicalUrl = url || canonicalFromPath(normalizedPath);
    const fullTitle = effectiveTitle ? `CGN Social AI Club | ${effectiveTitle}` : 'CGN Social AI Club';

    useEffect(() => {
        const upsertMeta = (attr, key, value) => {
            if (!value) return;
            const selector = `meta[${attr}="${key}"]`;
            let tag = document.head.querySelector(selector);
            if (!tag) {
                tag = document.createElement('meta');
                tag.setAttribute(attr, key);
                document.head.appendChild(tag);
            }
            tag.setAttribute('content', value);
        };
        const upsertLink = (id, attrs) => {
            let tag = document.head.querySelector(`#${id}`);
            if (!tag) {
                tag = document.createElement('link');
                tag.setAttribute('id', id);
                document.head.appendChild(tag);
            }
            Object.entries(attrs).forEach(([key, value]) => {
                tag.setAttribute(key, value);
            });
        };
        const removeMeta = (attr, key) => {
            const selector = `meta[${attr}="${key}"]`;
            const tag = document.head.querySelector(selector);
            if (tag) {
                tag.remove();
            }
        };
        const clearJsonLd = () => {
            document.querySelectorAll('script[data-seo-jsonld="true"]').forEach((node) => node.remove());
        };
        const appendJsonLd = (payload) => {
            const script = document.createElement('script');
            script.setAttribute('type', 'application/ld+json');
            script.setAttribute('data-seo-jsonld', 'true');
            script.textContent = JSON.stringify(payload);
            document.head.appendChild(script);
        };

        document.title = fullTitle;
        // Favicons are managed via index.html to ensure consistency and proper theme support.
        upsertLink('app-canonical', { rel: 'canonical', href: canonicalUrl });

        upsertMeta('name', 'description', effectiveDescription);
        if (effectiveNoIndex) {
            upsertMeta('name', 'robots', 'noindex, nofollow');
        } else {
            upsertMeta('name', 'robots', 'index, follow');
        }
        upsertMeta('property', 'og:type', 'website');
        upsertMeta('property', 'og:site_name', 'CGN Social AI Club');
        upsertMeta('property', 'og:locale', locale === 'de' ? 'de_DE' : 'en_US');
        upsertMeta('property', 'og:title', fullTitle);
        upsertMeta('property', 'og:description', effectiveDescription);
        upsertMeta('property', 'og:url', canonicalUrl);
        upsertMeta('property', 'og:image', image);
        upsertMeta('name', 'twitter:card', 'summary_large_image');
        upsertMeta('name', 'twitter:url', canonicalUrl);
        upsertMeta('name', 'twitter:title', fullTitle);
        upsertMeta('name', 'twitter:description', effectiveDescription);
        upsertMeta('name', 'twitter:image', image);

        if (!effectiveNoIndex) {
            const breadcrumbs = getBreadcrumbs(normalizedPath);
            if (breadcrumbs.length > 1) {
                appendJsonLd({
                    '@context': 'https://schema.org',
                    '@type': 'BreadcrumbList',
                    itemListElement: breadcrumbs.map((crumb, index) => ({
                        '@type': 'ListItem',
                        position: index + 1,
                        name: crumb.name,
                        item: canonicalFromPath(crumb.path),
                    })),
                });
            }
        }

        structuredData.forEach((entry) => appendJsonLd(entry));

        return () => {
            clearJsonLd();
            removeMeta('name', 'robots');
        };
    }, [fullTitle, effectiveDescription, canonicalUrl, image, effectiveNoIndex, structuredData, normalizedPath, locale]);

    return null;
}
