import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocale } from '../../i18n/LocaleContext';
import './FirstVisitIntro.css';

// Proportions of the CGN single-line lockup (icon 181.84 of 2191.43 wide, both 181.84 high).
export const ICON_FRACTION = 181.84 / 2191.43;

const KEY = 'cgn-social-ai-intro-seen-date-v1';
const localDay = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};
export default function FirstVisitIntro() {
    const { locale } = useLocale();
    const replayLabel = locale === 'de' ? 'Intro erneut abspielen' : 'Replay intro';
    const [active, setActive] = useState(() => {
        if (typeof window === 'undefined') return false;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
        if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('intro')) return true;
        try { return localStorage.getItem(KEY) !== localDay(); } catch { return true; }
    });
    const [playing, setPlaying] = useState(active);
    const [replay, setReplay] = useState(0);
    const stage = useRef(null);
    const [heroTarget, setHeroTarget] = useState(null);
    const [hasScrolled, setHasScrolled] = useState(false);
    useLayoutEffect(() => {
        setHeroTarget(document.querySelector('[data-intro-host]'));
        const updateVisibility = () => {
            if (window.scrollY > 8) setHasScrolled(true);
        };
        window.addEventListener('scroll', updateVisibility, { passive: true });
        updateVisibility();
        return () => window.removeEventListener('scroll', updateVisibility);
    }, []);
    useLayoutEffect(() => {
        if (!active || !heroTarget) return;
        const root = document.documentElement;
        const controller = new AbortController();
        let stopped = false, raf, safety, loadTimeout, finishTimer;
        let revealAnimations = [];
        let revealTarget, previousRevealStyle, retainedMark;
        const previousImageSources = new Map();
        setPlaying(true);
        const previousGutter = root.style.scrollbarGutter;
        root.style.scrollbarGutter = 'stable';
        // Clear the previous run before the browser paints the loading state.
        if (stage.current) {
            stage.current.removeAttribute('style');
            stage.current.replaceChildren();
            stage.current.style.display = 'none';
            stage.current.style.opacity = '1';
        }
        root.dataset.logoIntro = 'loading';
        const finish = () => {
            if (stopped) return;
            stopped = true;
            controller.abort();
            cancelAnimationFrame(raf);
            clearTimeout(loadTimeout);
            clearTimeout(finishTimer);
            root.dataset.logoIntro = 'done';
            setPlaying(false);
            root.style.scrollbarGutter = previousGutter;
            if (stage.current) stage.current.style.display = 'none';
            clearTimeout(safety);
        };
        const abortIntro = () => {
            if (stopped) return;
            revealAnimations.forEach(animation => animation.cancel());
            retainedMark?.remove();
            if (revealTarget) {
                previousImageSources.forEach((src, image) => image.setAttribute('src', src));
                if (previousRevealStyle === null) revealTarget.removeAttribute('style');
                else revealTarget.setAttribute('style', previousRevealStyle);
            }
            finish();
        };
        // Scrolling never cancels playback. The stage belongs to the hero and
        // moves with it, while the rest of the homepage stays available.
        // Slow downloads/decodes must not hold the website behind the intro.
        loadTimeout = setTimeout(abortIntro, 2500);
        safety = setTimeout(abortIntro, 12000);
        async function run() {
            try {
                const response = await fetch('/assets/intro/logo-motion.bin', { signal: controller.signal });
                if (!response.ok) throw new Error('Animation unavailable');
                const stream = response.body.pipeThrough(new DecompressionStream('gzip'));
                const data = await new Response(stream).json();
                if (stopped) return;
                // The dark export transitions its reflection from gray to white.
                // Interpolate toward the theme ink throughout, not only at pure white.
                data.frames = data.frames.map(frame => frame.replace(
                    /fill="rgb\((\d+),(\d+),(\d+)\)"/g,
                    (match, r, g, b) => {
                        if (r !== g || g !== b || Number(r) < 128) return match;
                        const progress = (Number(r) - 128) / 127 * 100;
                        return `fill="color-mix(in srgb, #808080 ${100 - progress}%, var(--intro-ink) ${progress}%)"`;
                    }));
                // Decode text-only artwork before playback. The reveal must never
                // depend on hiding a second icon with a browser-specific CSS mask.
                await Promise.all(['dark', 'white'].map(theme => {
                    const image = new Image();
                    image.src = `/assets/logos/hero-wordmark-${theme}.svg`;
                    return image.decode();
                }));
                if (stopped) return;
                clearTimeout(loadTimeout);
                const svg = stage.current;
                svg.innerHTML = data.frames[0];
                svg.style.display = '';
                // Remember actual playback across reloads, tabs, and browser restarts.
                try { localStorage.setItem(KEY, localDay()); } catch { /* Storage is optional. */ }
                // Center the walkers themselves, not their faint reflection below the floor.
                // Follow the exported merge movement into the final icon's center.
                const iconCenterY = data.bounds.y + data.bounds.height / 2;
                const head = svg.querySelector('[data-figure="human"] circle');
                const floor = svg.querySelector('#studio-logo-scene > line');
                const measuredWalkingCenterY = head && floor
                    ? (Number(head.getAttribute('cy')) - Number(head.getAttribute('r'))
                        + Number(floor.getAttribute('y1'))) / 2
                    : iconCenterY;
                const walkingCenterY = Number.isFinite(measuredWalkingCenterY) ? measuredWalkingCenterY : iconCenterY;
                const mergeOffsets = data.frames.map(frame => Number(
                    /id="moving"[^>]*transform="translate\(0 ([\d.-]+)\)"/.exec(frame)?.[1] || 0));
                const finalOffset = mergeOffsets.at(-1);
                const centers = mergeOffsets.map(offset => {
                    const progress = finalOffset > 0 ? Math.max(0, Math.min(1, offset / finalOffset)) : 1;
                    return walkingCenterY + (iconCenterY - walkingCenterY) * progress;
                });
                svg.setAttribute('viewBox', `-720 ${centers[0] - 500} 1440 1000`);
                // Start the website reveal when the exported icon choreography ends.
                const playbackDuration = Math.max(0, data.duration);
                const start = performance.now(); let previous = -1;
                const reveal = () => {
                    const target = document.querySelector('#hero-logo');
                    if (!target) { finish(); return; }
                    const finalMark = svg.querySelector('#final');
                    const sourceMatrix = finalMark?.getScreenCTM();
                    const image = [...target.querySelectorAll('img')].find(node => getComputedStyle(node).display !== 'none');
                    if (!sourceMatrix || !image) { finish(); return; }
                    const sourceTopLeft = new DOMPoint(0, 0).matrixTransform(sourceMatrix);
                    const sourceSize = 500 * Math.hypot(sourceMatrix.a, sourceMatrix.b);
                    const destination = image.getBoundingClientRect();
                    if (!destination.height) { finish(); return; }
                    // Keep the actual final SVG mark throughout the reveal and in the
                    // permanent lockup. Only the lettering comes from the image.
                    revealTarget = target;
                    previousRevealStyle = target.getAttribute('style');
                    const startScale = sourceSize / destination.height;
                    const startTransform = `translate3d(${sourceTopLeft.x - destination.left}px, ${sourceTopLeft.y - destination.top}px, 0px) scale(${startScale})`;
                    const iconInset = ICON_FRACTION * 100;
                    const startClip = `inset(-1px ${100 - iconInset}% -1px -1px)`;
                    retainedMark = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    retainedMark.setAttribute('viewBox', '0 0 500 500');
                    retainedMark.setAttribute('width', '500');
                    retainedMark.setAttribute('height', '500');
                    retainedMark.setAttribute('class', 'intro-retained-mark');
                    retainedMark.setAttribute('aria-hidden', 'true');
                    // Move, do not redraw or replace, the visible mark. Its local
                    // 500-unit coordinate system maps to the icon in the lockup.
                    svg.querySelectorAll('defs').forEach(defs => retainedMark.append(defs));
                    finalMark.removeAttribute('transform');
                    retainedMark.append(finalMark);
                    target.append(retainedMark);
                    target.querySelectorAll('img').forEach(node => {
                        previousImageSources.set(node, node.getAttribute('src'));
                        const theme = node.classList.contains('hero-logo-dark') ? 'white' : 'dark';
                        node.src = `/assets/logos/hero-wordmark-${theme}.svg`;
                    });
                    target.style.transformOrigin = '0 0';
                    target.style.willChange = 'transform, clip-path';
                    target.style.transform = startTransform;
                    target.style.clipPath = startClip;
                    svg.style.display = 'none';
                    root.dataset.logoIntro = 'wipe';
                    const timing = { duration: 1300, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' };
                    // One eased progress drives translation, scale and the reveal.
                    // At 200 ms this easing has travelled 7.01006% of its path.
                    // Keep only the mark visible until then, without pausing movement.
                    const revealStart = 0.07010061823434244;
                    const offsets = [...Array.from({ length: 61 }, (_, i) => i / 60), revealStart].sort((a, b) => a - b);
                    revealAnimations = [target.animate(offsets.map(p => {
                        const scale = startScale + (1 - startScale) * p;
                        const revealProgress = Math.max(0, (p - revealStart) / (1 - revealStart));
                        const visible = iconInset + (100 - iconInset) * revealProgress / scale;
                        const x = (sourceTopLeft.x - destination.left) * (1 - p);
                        const y = (sourceTopLeft.y - destination.top) * (1 - p);
                        return {
                            offset: p,
                            transform: `translate3d(${x}px, ${y}px, 0px) scale(${scale})`,
                            clipPath: `inset(-1px ${100 - visible}% -1px -1px)`,
                        };
                    }), timing)];
                    Promise.all(revealAnimations.map(animation => animation.finished)).then(() => {
                        if (stopped || root.dataset.logoIntro === 'done') return;
                        // Remove the animation in place, with exactly its final styles.
                        target.style.transform = 'translate3d(0px, 0px, 0px) scale(1)';
                        target.style.clipPath = 'inset(-1px 0% -1px -1px)';
                        revealAnimations.forEach(animation => animation.cancel());
                        root.dataset.logoIntro = 'content';
                        finishTimer = setTimeout(finish, 1100);
                    }).catch(() => {});
                };
                const play = now => {
                    if (stopped || root.dataset.logoIntro === 'done') return;
                    const viewport = window.visualViewport;
                    const viewportHeight = viewport?.height || window.innerHeight;
                    const viewportWidth = heroTarget.clientWidth;
                    // Leave room below the centered figures for their complete reflection.
                    // The host here is only as tall as the hero copy, so size the stage to the host.
                    svg.style.width = `${Math.min(1100, viewportWidth * 0.94, Math.min(viewportHeight, heroTarget.clientHeight) * 0.9 * 1.44)}px`;
                    svg.style.top = `${heroTarget.clientHeight / 2}px`;
                    svg.style.left = `${viewportWidth / 2}px`;
                    const elapsed = Math.max(0, now - start) / 1000 * 1.18;
                    // Speed up the complete choreography together, preserving planted feet
                    // and the timing between the walkers, arms and high-five.
                    const animationTime = elapsed * 1.08 + 0.7 * (1 - Math.exp(-elapsed / 1.2));
                    const index = Math.min(data.frames.length - 1, Math.floor(animationTime * data.fps));
                    if (index !== previous) {
                        svg.innerHTML = data.frames[index];
                        svg.setAttribute('viewBox', `-720 ${centers[index] - 500} 1440 1000`);
                        previous = index;
                    }
                    if (animationTime < playbackDuration) { raf = requestAnimationFrame(play); return; }
                    reveal();
                };
                raf = requestAnimationFrame(play);
            } catch (error) { if (!stopped) { console.warn('Logo intro unavailable:', error); abortIntro(); } }
        }
        run();
        return () => {
            stopped = true; controller.abort(); cancelAnimationFrame(raf);
            clearTimeout(safety); clearTimeout(loadTimeout); clearTimeout(finishTimer);
            revealAnimations.forEach(animation => animation.cancel());
            retainedMark?.remove();
            if (revealTarget) {
                previousImageSources.forEach((src, image) => image.setAttribute('src', src));
                if (previousRevealStyle === null) revealTarget.removeAttribute('style');
                else revealTarget.setAttribute('style', previousRevealStyle);
            }
            delete root.dataset.logoIntro;
            root.style.scrollbarGutter = previousGutter;
        };
    }, [active, replay, heroTarget]);
    return <>
        {active && heroTarget && createPortal(<svg ref={stage} className="first-visit-logo" aria-hidden="true" />, heroTarget)}
        {heroTarget && createPortal(<button type="button" className={`intro-replay ${!playing && hasScrolled ? '' : 'intro-control-hidden'}`}
            aria-label={replayLabel} title={replayLabel} disabled={playing || !hasScrolled}
            onClick={() => {
                window.scrollTo({ top: 0, behavior: 'instant' });
                setPlaying(true); setActive(true); setReplay(value => value + 1);
            }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 10a9 9 0 1 1 2.6 8.4M3 4v6h6" />
            </svg>
        </button>, heroTarget)}
    </>;
}
