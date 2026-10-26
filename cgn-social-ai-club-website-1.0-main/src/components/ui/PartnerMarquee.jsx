import OptimizedImage from './OptimizedImage.jsx';
import { useEffect, useRef, useState } from 'react';
import SectionLabel from './SectionLabel';
import { useLocale } from '../../i18n/LocaleContext';
import { assetUrl } from '../../utils/assetUrl';

const strategicLogos = [
    { src: assetUrl('/cms/strategic-partner-logos/partner/Startplatz-logo.png'), alt: 'STARTPLATZ', width: 150, height: 67, website: 'https://www.startplatz.de' },
    { src: assetUrl('/cms/strategic-partner-logos/supporter/DataCamp-Donates-logo-dark.png'), alt: 'DataCamp', width: 160, height: 44, website: 'https://www.datacamp.com/' },
];

const nonprofitLogos = [];

export default function PartnerMarquee() {
    const { t, locale } = useLocale();
    return <div className="w-full pt-6 pb-2 overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-4">
            <div className="flex flex-col items-center mb-2"><SectionLabel>{t.home.partnersLabel}</SectionLabel></div>
            <div className="space-y-2 sm:space-y-3">
                {nonprofitLogos.length > 0 && <MarqueeRow logos={nonprofitLogos} initialDirection={-1} label="Non-Profit Partners" />}
                <MarqueeRow logos={strategicLogos} initialDirection={1} label={locale === 'de' ? 'Strategische Partner' : 'Strategic Partners'} />
            </div>
        </div>
    </div>;
}

function MarqueeRow({ logos, label, initialDirection }) {
    const [isDark, setIsDark] = useState(false);
    const [groupWidth, setGroupWidth] = useState(0);
    const [duplicateCount, setDuplicateCount] = useState(3);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const containerRef = useRef(null);
    const firstGroupRef = useRef(null);
    const speedRef = useRef(85);
    const motionRef = useRef(null);

    useEffect(() => {
        const checkDark = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };

        checkDark();

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    checkDark();
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const updateMotionPreference = () => {
            setPrefersReducedMotion(mediaQuery.matches);
        };

        updateMotionPreference();
        mediaQuery.addEventListener('change', updateMotionPreference);

        return () => {
            mediaQuery.removeEventListener('change', updateMotionPreference);
        };
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        const firstGroup = firstGroupRef.current;

        if (!container || !firstGroup) {
            return undefined;
        }

        const updateMeasurements = () => {
            const nextGroupWidth = firstGroup.offsetWidth;
            const containerWidth = container.offsetWidth;

            if (!nextGroupWidth || !containerWidth) {
                return;
            }

            // Preserve the mobile pace, then ease down as the desktop strip widens.
            const desktopProgress = Math.min(1, Math.max(0, (containerWidth - 520) / 760));
            speedRef.current = (85 - 40 * desktopProgress) * Math.min(1, containerWidth / 520);
            setGroupWidth(nextGroupWidth);
            // The wrap controller moves around the middle copy. Short rows
            // need a further copy beyond it, including on wide desktops.
            setDuplicateCount(Math.max(3, Math.ceil(containerWidth / nextGroupWidth) + 2));
        };

        updateMeasurements();

        const resizeObserver = new ResizeObserver(updateMeasurements);
        resizeObserver.observe(container);
        resizeObserver.observe(firstGroup);

        window.addEventListener('resize', updateMeasurements);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', updateMeasurements);
        };
    }, [logos.length]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || prefersReducedMotion || !groupWidth) return undefined;

        // One controller owns drag, momentum and autoplay. Native horizontal
        // inertia is disabled, so it cannot fight or restart the animation.
        const previousMotion = motionRef.current;
        let position = previousMotion ? previousMotion.progress * groupWidth : groupWidth;
        const maxSpeed = () => speedRef.current * 10;
        let velocity = previousMotion ? previousMotion.velocityPerWidth * groupWidth : initialDirection * speedRef.current;
        let direction = previousMotion?.direction ?? initialDirection;
        let pointer = null;
        let suppressClick = false;
        let frame;
        let previousTime;
        const render = () => {
            position = ((position % groupWidth) + groupWidth) % groupWidth;
            container.scrollLeft = position + groupWidth * 0.5 < groupWidth
                ? position + groupWidth : position;
        };
        const advance = time => {
            const dt = previousTime === undefined ? 0 : Math.min(time - previousTime, 50) / 1000;
            previousTime = time;
            if (!pointer?.dragging) {
                const holding = Boolean(pointer);
                const base = holding ? 0 : direction * speedRef.current;
                const easingTime = holding ? 0.10 : 0.45;
                const decay = Math.exp(-dt / easingTime);
                // Integrate the decay exactly; no delayed velocity sampling or
                // position catch-up, even when frames arrive at different rates.
                position += base * dt + (velocity - base) * easingTime * (1 - decay);
                velocity = base + (velocity - base) * decay;
                render();
            } else if (time - pointer.time > 100) {
                velocity *= Math.exp(-dt / 0.22);
            }
            frame = requestAnimationFrame(advance);
        };
        const down = event => {
            if (!event.isPrimary || event.button !== 0) return;
            suppressClick = false;
            pointer = { id: event.pointerId, x: event.clientX, y: event.clientY,
                lastX: event.clientX, time: event.timeStamp, startedAt: event.timeStamp, dragging: false };
        };
        const move = event => {
            if (!pointer || pointer.id !== event.pointerId) return;
            if (!pointer.dragging) {
                const dx = event.clientX - pointer.x;
                const dy = event.clientY - pointer.y;
                if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(dy)) return;
                pointer.dragging = true;
                container.setPointerCapture(event.pointerId);
            }
            const delta = pointer.lastX - event.clientX;
            const dt = Math.max(8, event.timeStamp - pointer.time) / 1000;
            position += delta;
            if (Math.abs(delta) > 0.5) {
                direction = Math.sign(delta);
                const measured = Math.min(maxSpeed(), Math.abs(delta / dt));
                velocity = direction * Math.min(maxSpeed(), Math.max(speedRef.current, measured * 0.7 + Math.abs(velocity) * 0.3));
            }
            pointer.lastX = event.clientX;
            pointer.time = event.timeStamp;
            render();
        };
        const up = event => {
            if (!pointer || pointer.id !== event.pointerId) return;
            suppressClick = pointer.dragging;
            // Holding a finger still before releasing should not fling later.
            pointer = null;
        };
        const cancel = event => {
            up(event);
        };
        const wheel = event => {
            if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
            event.preventDefault();
            const delta = event.deltaX * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? container.clientWidth : 1);
            const nextDirection = Math.sign(delta) || direction;
            const carriedSpeed = nextDirection === direction ? Math.abs(velocity) : 0;
            direction = nextDirection;
            // Trackpads already send a momentum tail. Treat it as an input to
            // velocity, never as a second independently scrolling position.
            velocity = direction * Math.min(maxSpeed(), Math.max(speedRef.current, carriedSpeed, Math.abs(delta) * 35));
        };
        const preventNativeDrag = event => event.preventDefault();
        const click = event => {
            if (!suppressClick) return;
            event.preventDefault();
            event.stopPropagation();
            suppressClick = false;
        };
        const key = event => {
            if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
            event.preventDefault();
            direction = event.key === 'ArrowLeft' ? -1 : 1;
            velocity = direction * Math.min(maxSpeed(), Math.max(speedRef.current, Math.abs(velocity)) + 200);
        };
        render();
        frame = requestAnimationFrame(advance);
        container.addEventListener('pointerdown', down);
        container.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
        window.addEventListener('pointercancel', cancel);
        container.addEventListener('wheel', wheel, { passive: false });
        container.addEventListener('click', click, true);
        container.addEventListener('keydown', key);
        container.addEventListener('dragstart', preventNativeDrag);
        return () => {
            // Keep the same visible logos and travel direction on resize.
            motionRef.current = { progress: position / groupWidth, velocityPerWidth: velocity / groupWidth, direction };
            cancelAnimationFrame(frame);
            container.removeEventListener('pointerdown', down);
            container.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
            window.removeEventListener('pointercancel', cancel);
            container.removeEventListener('wheel', wheel);
            container.removeEventListener('click', click, true);
            container.removeEventListener('keydown', key);
            container.removeEventListener('dragstart', preventNativeDrag);
        };
    }, [groupWidth, prefersReducedMotion, initialDirection]);

    const getLogoStyle = (isHovered, logo) => {
        if (isDark) {
            if (isHovered) {
                return { filter: 'brightness(0) saturate(100%) invert(86%) sepia(21%) saturate(921%) hue-rotate(102deg) brightness(101%) contrast(106%)' };
            }
            return { filter: 'brightness(0) invert(0.85)' };
        }

        if (logo?.monochrome) return { filter: 'brightness(0) saturate(100%) invert(13%) sepia(40%) saturate(1341%) hue-rotate(180deg) brightness(90%) contrast(94%)' };
        if (isHovered) {
            return { filter: 'grayscale(0)' };
        }
        return { filter: 'grayscale(1)' };
    };

    return (
        <div role="group" aria-label={label}>
                <div
                    ref={containerRef}
                    tabIndex={0}
                    className="partner-marquee relative w-full overflow-x-auto scrollbar-hide py-1 sm:py-2"
                    style={{
                        containerType: 'inline-size',
                        overflowX: prefersReducedMotion ? 'auto' : 'hidden',
                        touchAction: prefersReducedMotion ? 'auto' : 'pan-y',
                        maskImage: 'linear-gradient(to right, transparent, black 3%, black 97%, transparent)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent, black 3%, black 97%, transparent)',
                    }}

                >
                    <div
                        className="partner-marquee-track flex w-max items-center"
                    >
                        {Array.from({ length: prefersReducedMotion ? 1 : duplicateCount }, (_, groupIndex) => (
                            <div
                                key={groupIndex}
                                ref={groupIndex === 0 ? firstGroupRef : null}
                                className="partner-marquee-group flex shrink-0 items-center"
                                aria-hidden={groupIndex > 0}
                            >
                                {logos.map((logo) => (
                                    <LogoItem
                                        key={`${groupIndex}-${logo.alt}`}
                                        logo={logo}
                                        getLogoStyle={getLogoStyle}
                                        isDuplicate={groupIndex > 0}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
        </div>
    );
}

function LogoItem({ logo, getLogoStyle, isDuplicate }) {
    const [isHovered, setIsHovered] = useState(false);
    const [hasFailed, setHasFailed] = useState(false);

    const content = (
        <div
            className="flex-shrink-0 flex items-center justify-center opacity-70 hover:opacity-100"
            style={{
                // Fit the artwork plus equal padding. The two-row layout can show
                // fewer, larger logos per row on phones without crowding them.
                width: `min(${logo.width + 56}px, ${(logo.width + 56) / 5.2}cqw)`,
                '--partner-logo-width': `min(${logo.width}px, ${logo.width / 5.2}cqw)`,
                height: 'clamp(56px, 17cqw, 76px)',
                paddingInline: 'min(28px, 5.384615cqw)',
                boxSizing: 'border-box',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {hasFailed ? <span style={{ fontFamily: "'League Spartan', sans-serif", width: 'var(--partner-logo-width)', flexShrink: 0, fontWeight: 700, fontSize: 'clamp(16px, 6cqw, 23px)', lineHeight: 1.05, textAlign: 'center', color: 'var(--text-primary)', overflowWrap: 'anywhere' }}>{logo.alt}</span> : <OptimizedImage
                src={logo.src}
                alt={logo.alt}
                className="object-contain pointer-events-none select-none transition-colors duration-300"
                style={{ ...getLogoStyle(isHovered, logo), width: 'var(--partner-logo-width)', height: `min(${logo.height}px, ${logo.height / 5.2}cqw)`, maxWidth: '100%' }}
                onError={() => setHasFailed(true)}
                loading="eager"
                decoding="async"
            />}
        </div>
    );

    if (!logo.website) {
        return content;
    }

    return (
        <a
            href={logo.website}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${logo.alt} website in a new tab`}
            className="block rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-primary)]"
            tabIndex={isDuplicate ? -1 : undefined}
        >
            {content}
        </a>
    );
}
