const ANDROID_PACKAGES = {
    github: 'com.github.android',
    instagram: 'com.instagram.android',
    linkedin: 'com.linkedin.android',
    luma: 'com.luma.mobile',
};

const MOBILE_APP_FALLBACK_DELAY = 900;

function parseUrl(href) {
    try {
        return new URL(href);
    } catch {
        return null;
    }
}

function getPlatform(url) {
    const hostname = url.hostname.replace(/^www\./, '').toLowerCase();

    if (hostname === 'github.com') return 'github';
    if (hostname === 'instagram.com') return 'instagram';
    if (hostname === 'linkedin.com') return 'linkedin';
    if (hostname === 'luma.com' || hostname === 'lu.ma') return 'luma';

    return null;
}

function pathSegments(url) {
    return url.pathname.split('/').filter(Boolean);
}

function getIosAppUrl(platform, url) {
    const segments = pathSegments(url);

    switch (platform) {
        case 'github': {
            const [owner, repo] = segments;
            if (!owner) return null;
            return repo
                ? `github://repo/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
                : `github://user?username=${encodeURIComponent(owner)}`;
        }
        case 'instagram': {
            const [username] = segments;
            return username ? `instagram://user?username=${encodeURIComponent(username)}` : null;
        }
        case 'linkedin': {
            const linkedinPath = `${url.pathname}${url.search}`.replace(/^\/+/, '');
            return linkedinPath ? `linkedin://${linkedinPath}` : null;
        }
        case 'luma': {
            return `luma://${url.hostname}${url.pathname}${url.search}`;
        }
        default:
            return null;
    }
}

function getAndroidIntentUrl(platform, url, webUrl) {
    const packageName = ANDROID_PACKAGES[platform];
    if (!packageName) return null;

    const scheme = url.protocol.replace(':', '') || 'https';
    const target = webUrl.replace(/^[a-z][a-z\d+\-.]*:\/\//i, '');
    const fallbackUrl = encodeURIComponent(webUrl);

    return `intent://${target}#Intent;scheme=${scheme};package=${packageName};S.browser_fallback_url=${fallbackUrl};end`;
}

function getDeviceType() {
    if (typeof navigator === 'undefined') return 'desktop';

    const userAgent = navigator.userAgent || '';
    const platform = navigator.platform || '';
    const hasTouch = typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1;

    if (/Android/i.test(userAgent)) return 'android';
    if (/iPhone|iPad|iPod/i.test(userAgent)) return 'ios';
    if (/Mac/i.test(platform) && hasTouch) return 'ios';

    return 'desktop';
}

function openWithFallback(appUrl, webUrl) {
    if (typeof window === 'undefined' || !appUrl) return;

    let appOpened = false;
    const markOpened = () => {
        if (document.hidden) {
            appOpened = true;
        }
    };
    const cleanup = () => {
        document.removeEventListener('visibilitychange', markOpened);
        window.removeEventListener('pagehide', markOpened);
    };

    document.addEventListener('visibilitychange', markOpened);
    window.addEventListener('pagehide', markOpened);
    window.location.assign(appUrl);

    window.setTimeout(() => {
        cleanup();
        if (!appOpened && !document.hidden) {
            window.location.assign(webUrl);
        }
    }, MOBILE_APP_FALLBACK_DELAY);
}

export function getSocialAppLink(href) {
    const url = parseUrl(href);
    if (!url) return null;

    const platform = getPlatform(url);
    if (!platform) return null;

    const webUrl = url.toString();
    const iosAppUrl = getIosAppUrl(platform, url);
    const androidIntentUrl = getAndroidIntentUrl(platform, url, webUrl);

    if (!iosAppUrl && !androidIntentUrl) return null;

    return {
        androidIntentUrl,
        iosAppUrl,
        platform,
        webUrl,
    };
}

export function openSocialAppLink(event, href, { beforeOpen } = {}) {
    if (beforeOpen && !beforeOpen()) {
        event?.preventDefault();
        return false;
    }

    const appLink = getSocialAppLink(href);

    if (!appLink) {
        return true;
    }

    const deviceType = getDeviceType();

    if (deviceType === 'desktop') {
        return true;
    }

    event?.preventDefault();

    const appUrl = deviceType === 'android'
        ? appLink.androidIntentUrl
        : appLink.iosAppUrl;

    if (appUrl) {
        openWithFallback(appUrl, appLink.webUrl);
    } else if (typeof window !== 'undefined') {
        window.location.assign(appLink.webUrl);
    }

    return false;
}
